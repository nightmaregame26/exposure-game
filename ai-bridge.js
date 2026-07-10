(() => {
  'use strict';

  const MAX_MESSAGE_LENGTH = 400;
  let apiStatus = 'checking';
  let bound = false;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  function init() {
    bindTalkButton();
    checkApiHealth();

    const watcher = window.setInterval(() => {
      bindTalkButton();
      if (bound) window.clearInterval(watcher);
    }, 250);
  }

  function bindTalkButton() {
    const button = document.getElementById('sendTalkBtn');
    if (!button || button.dataset.aiBridgeBound === 'true') return;
    button.dataset.aiBridgeBound = 'true';
    button.addEventListener('click', handleTalk, true);
    bound = true;
  }

  async function checkApiHealth() {
    setStatus('checking', 'Checking AI…');
    try {
      const response = await fetch('/api/health', { method: 'GET', cache: 'no-store' });
      if (!response.ok) throw new Error(`Health ${response.status}`);
      const health = await response.json();
      if (health.openaiConfigured) {
        setStatus('online', 'AI dialogue online');
      } else {
        setStatus('fallback', 'Local dialogue mode');
      }
    } catch {
      setStatus('fallback', 'Local dialogue mode');
    }
  }

  async function handleTalk(event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    const input = document.getElementById('freeTalk');
    const button = document.getElementById('sendTalkBtn');
    const text = input?.value?.trim() || '';
    const person = getCurrentNpc();

    if (!text || !person) return;
    if (text.length > MAX_MESSAGE_LENGTH) {
      window.alert(`Keep it under ${MAX_MESSAGE_LENGTH} characters.`);
      return;
    }

    if (apiStatus !== 'online') {
      runLocalFallback();
      return;
    }

    const originalLabel = button.textContent;
    button.disabled = true;
    button.textContent = `${person.name} is thinking…`;

    try {
      const intent = typeof inferIntent === 'function' ? inferIntent(text) : 'caseQuestion';
      const response = await fetch('/api/talk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(person, text, intent))
      });

      const data = await response.json().catch(() => ({}));
      if (response.status === 404 || response.status === 503 || data.error === 'OPENAI_NOT_CONFIGURED') {
        setStatus('fallback', 'Local dialogue mode');
        runLocalFallback();
        return;
      }

      if (!response.ok && !data.reply) {
        throw new Error(data.error || `Talk ${response.status}`);
      }

      applyAiReply(person, text, data, intent);
    } catch (error) {
      console.warn('AI dialogue unavailable; using local conversation.', error);
      setStatus('fallback', 'Local dialogue mode');
      runLocalFallback();
    } finally {
      button.disabled = false;
      button.textContent = originalLabel;
    }
  }

  function buildPayload(person, text, intent) {
    const allowedSecrets = Number(person.trust || 0) >= 60
      ? (Array.isArray(person.hiddenFacts) ? person.hiddenFacts.slice(0, 1) : [])
      : [];

    return {
      npcId: person.id,
      npcName: person.name,
      playerMessage: text,
      day: safeState()?.day || 1,
      time: new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date()),
      location: getCurrentScene()?.loc || person.currentLocation || 'Blackwood',
      trust: person.trust,
      focus: person.focus,
      stress: person.stress,
      fear: person.fear,
      interest: person.interest,
      suspicionTowardPlayer: person.suspicionTowardPlayer,
      knownFacts: Array.isArray(person.knownFacts) ? person.knownFacts : [],
      npcMemory: Array.isArray(person.memory) ? person.memory : [],
      allowedSecrets,
      tier: 'free',
      repliesThisScene: Number(person.repliesThisScene || 0),
      conversationIntent: intent
    };
  }

  function applyAiReply(person, playerText, data, intent) {
    const gameState = safeState();
    const reply = String(data.reply || 'They hesitate, like something is being left unsaid.');

    if (typeof applyNpcDelta === 'function') {
      applyNpcDelta(person, {
        trust: Number(data.trustChange || 0),
        focus: Number(data.focusChange || 0),
        stress: Number(data.stressChange || 0),
        fear: Number(data.fearChange || 0),
        interest: Number(data.interestChange || 0),
        suspicion: Number(data.suspicionChange || 0)
      });
    } else {
      person.trust = clampLocal(Number(person.trust || 0) + Number(data.trustChange || 0));
      person.focus = clampLocal(Number(person.focus || 0) + Number(data.focusChange || 0));
      person.stress = clampLocal(Number(person.stress || 0) + Number(data.stressChange || 0));
      person.fear = clampLocal(Number(person.fear || 0) + Number(data.fearChange || 0));
      person.interest = clampLocal(Number(person.interest || 0) + Number(data.interestChange || 0));
      person.suspicionTowardPlayer = clampLocal(Number(person.suspicionTowardPlayer || 0) + Number(data.suspicionChange || 0));
    }

    if (gameState) {
      gameState.exposure = clampLocal(Number(gameState.exposure || 0) + Number(data.exposureChange || 0));
    }

    person.repliesThisScene = Number(person.repliesThisScene || 0) + 1;
    person.memory = Array.isArray(person.memory) ? person.memory : [];
    person.memory.unshift(data.memory || `Player asked about ${intent}: ${playerText.slice(0, 120)}`);
    person.memory = person.memory.slice(0, 20);

    if (data.newEvidenceId && typeof addClue === 'function') {
      addClue(data.newEvidenceId);
    }
    if (typeof addMemory === 'function') {
      addMemory(
        `ai_talk_${Date.now()}`,
        `Player spoke with ${person.name}: ${playerText.slice(0, 100)}`,
        false,
        ['player', person.id],
        'conversation'
      );
    }

    const sceneText = document.getElementById('sceneText');
    const input = document.getElementById('freeTalk');
    if (sceneText) {
      sceneText.innerHTML += `<hr><span class="player">You:</span> ${escapeHtml(playerText)}<br><br><span class="speaker">${escapeHtml(person.name)}:</span> ${escapeHtml(reply)}<div class="meta">AI conversation · Focus ${formatDelta(data.focusChange)}</div>`;
      sceneText.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (input) input.value = '';

    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
    if (typeof renderNpcState === 'function') renderNpcState();

    window.dispatchEvent(new CustomEvent('exposure:npc-updated', {
      detail: { npcId: person.id, source: 'ai-talk' }
    }));
  }

  function runLocalFallback() {
    if (typeof localTalk === 'function') {
      localTalk();
      return;
    }
    if (typeof window.localTalk === 'function') window.localTalk();
  }

  function getCurrentNpc() {
    try {
      const scene = getCurrentScene();
      const gameState = safeState();
      return scene?.npc && gameState?.people ? gameState.people[scene.npc] : null;
    } catch {
      return null;
    }
  }

  function getCurrentScene() {
    try {
      return typeof currentScene === 'undefined' ? null : currentScene;
    } catch {
      return null;
    }
  }

  function safeState() {
    try {
      return typeof state === 'undefined' ? null : state;
    } catch {
      return null;
    }
  }

  function setStatus(status, label) {
    apiStatus = status;
    const badge = document.getElementById('aiStatus');
    if (!badge) return;
    badge.textContent = label;
    badge.dataset.status = status;
    badge.classList.toggle('gold', status === 'online');
    badge.classList.toggle('red', status === 'fallback');
  }

  function clampLocal(value) {
    return Math.max(0, Math.min(100, Number(value || 0)));
  }

  function formatDelta(value) {
    const number = Number(value || 0);
    return number > 0 ? `+${number}` : String(number);
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[character]));
  }
})();
