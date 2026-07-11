(() => {
  'use strict';

  const VERSION = 'exact-13';
  const SCREENS = ['home', 'map', 'scene'];
  const TABS = ['home', 'book', 'map', 'contacts', 'phone', 'suspects', 'diary', 'case'];
  const objectUrls = [];
  let selectedMapLocation = 'house';
  let syncTimer = null;

  const highResCandidates = {
    home: ['home'],
    map: ['map'],
    scene: ['scene', 'emily', 'cafe']
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  function init() {
    document.body.classList.add('exact-ui-active');
    buildExactUi();
    wireObservers();
    syncView();
    syncTimer = window.setInterval(syncView, 300);
  }

  function buildExactUi() {
    if (document.getElementById('exactUi')) return;

    const root = document.createElement('div');
    root.id = 'exactUi';
    root.setAttribute('aria-label', 'Exposure game interface');
    root.innerHTML = `
      ${stageMarkup('home')}
      ${stageMarkup('map')}
      ${stageMarkup('scene')}
      <div id="exactToast" class="exact-toast" role="status" aria-live="polite"></div>`;
    document.body.appendChild(root);

    buildHomeControls();
    buildMapControls();
    buildSceneControls();

    root.querySelectorAll('.exact-stage').forEach(stage => {
      void loadStageArtwork(stage);
    });
  }

  function stageMarkup(name) {
    return `
      <section id="exact-${name}" class="exact-stage" data-exact-screen="${name}" ${name === 'home' ? '' : 'hidden'}>
        <div class="exact-artboard">
          <div class="exact-full-art" aria-hidden="true"></div>
          <div class="exact-slices" aria-hidden="true">
            <div class="exact-slice"></div>
            <div class="exact-slice"></div>
            <div class="exact-slice"></div>
            <div class="exact-slice"></div>
          </div>
          <div class="exact-loading">Loading Blackwood…</div>
          <div class="exact-error">The interface artwork could not be loaded. Reload the page to retry.</div>
        </div>
      </section>`;
  }

  async function loadStageArtwork(stage) {
    const kind = stage.dataset.exactScreen;
    const artboard = stage.querySelector('.exact-artboard');
    const fullArt = stage.querySelector('.exact-full-art');
    const slices = [...stage.querySelectorAll('.exact-slice')];

    try {
      const highResUrl = await loadChunkedArtwork(highResCandidates[kind] || []);
      if (highResUrl) {
        fullArt.style.backgroundImage = `url("${highResUrl}")`;
        artboard.classList.add('uses-full-art', 'loaded');
        return;
      }

      const sliceUrls = await loadSafeSlices(kind);
      if (sliceUrls.length !== 4) throw new Error(`Incomplete ${kind} artwork`);
      sliceUrls.forEach((url, index) => {
        slices[index].style.backgroundImage = `url("${url}")`;
      });
      artboard.classList.add('uses-slices', 'loaded');
    } catch (error) {
      console.error('Exposure artwork failed:', kind, error);
      artboard.classList.add('asset-error');
    }
  }

  async function loadChunkedArtwork(candidates) {
    for (const directory of candidates) {
      const parts = [];
      for (let index = 0; index < 80; index += 1) {
        const name = String(index).padStart(2, '0');
        const response = await fetch(`assets/exact/${directory}/${name}.txt?v=${VERSION}`, {
          cache: 'no-store'
        });

        if (!response.ok) {
          if (index === 0) break;
          break;
        }

        const text = (await response.text()).trim();
        if (!text || /NOT_FOUND/i.test(text)) break;
        parts.push(text);
      }

      if (!parts.length) continue;

      try {
        const base64 = parts.join('').replace(/\s+/g, '');
        const url = base64ToObjectUrl(base64, 'image/webp');
        await validateImage(url);
        return url;
      } catch (error) {
        console.warn(`High-resolution ${directory} artwork was invalid; using safe fallback.`, error);
      }
    }
    return null;
  }

  async function loadSafeSlices(kind) {
    const urls = [];
    for (let index = 0; index < 4; index += 1) {
      const response = await fetch(`assets/mockups/${kind}-${index}.svg?v=${VERSION}`, {
        cache: 'no-store'
      });
      if (!response.ok) throw new Error(`${kind}-${index}.svg returned ${response.status}`);

      const svg = await response.text();
      const match = svg.match(/href=["']data:image\/(jpeg|jpg|png|webp);base64,([^"']+)["']/i);
      if (!match) throw new Error(`${kind}-${index}.svg did not contain embedded artwork`);

      const mime = match[1].toLowerCase() === 'jpg' ? 'jpeg' : match[1].toLowerCase();
      const url = base64ToObjectUrl(match[2].replace(/\s+/g, ''), `image/${mime}`);
      await validateImage(url);
      urls.push(url);
    }
    return urls;
  }

  function base64ToObjectUrl(base64, mimeType) {
    const binary = atob(base64);
    const blockSize = 32768;
    const blocks = [];

    for (let offset = 0; offset < binary.length; offset += blockSize) {
      const end = Math.min(offset + blockSize, binary.length);
      const bytes = new Uint8Array(end - offset);
      for (let index = offset; index < end; index += 1) {
        bytes[index - offset] = binary.charCodeAt(index);
      }
      blocks.push(bytes);
    }

    const url = URL.createObjectURL(new Blob(blocks, { type: mimeType }));
    objectUrls.push(url);
    return url;
  }

  function validateImage(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Image decode failed'));
      image.src = url;
    });
  }

  function getArtboard(name) {
    return document.querySelector(`#exact-${name} .exact-artboard`);
  }

  function buildHomeControls() {
    const artboard = getArtboard('home');
    if (!artboard) return;

    artboard.insertAdjacentHTML('beforeend', `
      <div class="exact-live-block exact-county-mask"><strong>Blackwood</strong>Greywick County<br>Est. 1882</div>
      ${hit('enter-town', 'Enter Blackwood')}
      ${hit('news', 'Read Blackwood News')}
      ${hit('chapter', 'Open current chapter')}
      ${hit('task-0', 'Open first task')}
      ${hit('task-1', 'Open second task')}
      ${hit('task-2', 'Open third task')}
      ${hit('all-tasks', 'View all tasks')}
      ${hit('recent-events', 'Open recent events')}
      ${hit('settings', 'Reset investigation')}
      ${navHits()}`);

    onAction(artboard, 'enter-town', () => openTab('map'));
    onAction(artboard, 'news', () => openTab('book'));
    onAction(artboard, 'chapter', () => document.getElementById('viewMemoryBtn')?.click() || openTab('book'));
    onAction(artboard, 'task-0', () => triggerTaskByIndex(0));
    onAction(artboard, 'task-1', () => triggerTaskByIndex(1));
    onAction(artboard, 'task-2', () => triggerTaskByIndex(2));
    onAction(artboard, 'all-tasks', () => showToast('Tap one of the three active tasks above.'));
    onAction(artboard, 'recent-events', () => openTab('book'));
    onAction(artboard, 'settings', () => document.getElementById('resetBtn')?.click());
    wireNav(artboard);
  }

  function buildMapControls() {
    const artboard = getArtboard('map');
    if (!artboard) return;

    artboard.insertAdjacentHTML('beforeend', `
      <div class="exact-live-block exact-county-mask"><strong>Blackwood</strong>Greywick County<br>Est. 1882</div>
      ${locationHit('forest', 'Blackwood Forest')}
      ${locationHit('house', 'Your House')}
      ${locationHit('cafe', 'Café Hollow')}
      ${locationHit('water', 'Water Tower')}
      ${locationHit('sawmill', 'Sawmill')}
      ${locationHit('lake', 'Lake Road')}
      ${locationHit('police', 'Police Station')}
      ${locationHit('townhall', 'Town Hall')}
      ${locationHit('church', 'Old Church')}
      ${locationHit('school', 'Blackwood High')}
      ${locationHit('library', 'Library')}
      ${locationHit('hospital', 'Hospital')}
      ${locationHit('cemetery', 'Cemetery')}
      ${hit('area-intel', 'Open area intelligence')}
      ${hit('map-objective', 'Open current objective')}
      ${navHits()}`);

    artboard.querySelectorAll('[data-location]').forEach(button => {
      button.addEventListener('click', () => selectLocation(button.dataset.location));
    });
    onAction(artboard, 'area-intel', () => openSelectedLocation());
    onAction(artboard, 'map-objective', () => triggerTaskByIndex(1));
    wireNav(artboard);
  }

  function buildSceneControls() {
    const artboard = getArtboard('scene');
    if (!artboard) return;

    artboard.insertAdjacentHTML('beforeend', `
      ${choiceHit(0)}
      ${choiceHit(1)}
      ${choiceHit(2)}
      <div class="exact-talk">
        <textarea id="exactTalkInput" maxlength="400" aria-label="Say anything to Emily" placeholder="Say anything to Emily..."></textarea>
        <button id="exactTalkSend" type="button" aria-label="Send message">➤</button>
      </div>
      ${navHits()}`);

    artboard.querySelectorAll('[data-choice]').forEach(button => {
      button.addEventListener('click', () => triggerSceneChoice(Number(button.dataset.choice)));
    });
    artboard.querySelector('#exactTalkSend')?.addEventListener('click', sendFreeTalk);
    artboard.querySelector('#exactTalkInput')?.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendFreeTalk();
      }
    });
    wireNav(artboard);
  }

  function hit(action, label) {
    return `<button class="exact-hit" type="button" data-action="${action}" aria-label="${escapeHtml(label)}"></button>`;
  }

  function locationHit(location, label) {
    return `<button class="exact-hit" type="button" data-location="${location}" aria-label="${escapeHtml(label)}"></button>`;
  }

  function choiceHit(index) {
    return `<button class="exact-hit" type="button" data-choice="${index}" aria-label="Dialogue choice ${index + 1}"></button>`;
  }

  function navHits() {
    return TABS.map(tab => `<button class="exact-hit exact-nav-hit" type="button" data-tab-hit="${tab}" aria-label="Open ${tab}"></button>`).join('');
  }

  function onAction(parent, action, handler) {
    parent.querySelector(`[data-action="${action}"]`)?.addEventListener('click', handler);
  }

  function wireNav(parent) {
    parent.querySelectorAll('[data-tab-hit]').forEach(button => {
      button.addEventListener('click', () => {
        if (isSceneOpen()) closeScene();
        openTab(button.dataset.tabHit);
      });
    });
  }

  function selectLocation(location) {
    selectedMapLocation = location;
    const locked = new Set(['water', 'sawmill', 'townhall', 'church', 'hospital', 'cemetery']);
    if (locked.has(location)) {
      showToast(`${locationName(location)} is still locked.`);
      return;
    }
    openSelectedLocation();
  }

  function openSelectedLocation() {
    const taskMap = {
      house: ['Rest at home'],
      cafe: ['Meet Emily', 'Café Hollow'],
      forest: ['Blackwood Forest'],
      lake: ['anonymous', 'Lake Road'],
      police: ['Detective Mason', 'Police Station'],
      school: ["Noah's house", 'Noah'],
      library: ['Library research', 'Library']
    };
    const needles = taskMap[selectedMapLocation];
    if (!needles) {
      showToast(`${locationName(selectedMapLocation)} is not available yet.`);
      return;
    }
    triggerTaskByText(needles);
  }

  function triggerTaskByIndex(index) {
    const buttons = [...document.querySelectorAll('#tasks button')];
    const button = buttons[index];
    if (!button) return showToast('That task is not available right now.');
    if (button.disabled) return showToast('That task is unavailable at the current time.');
    button.click();
    window.setTimeout(syncView, 40);
  }

  function triggerTaskByText(needles) {
    const buttons = [...document.querySelectorAll('#tasks button')];
    const list = Array.isArray(needles) ? needles : [needles];
    const button = buttons.find(item => list.some(needle => item.textContent.toLowerCase().includes(String(needle).toLowerCase())));
    if (!button) return showToast('That investigation is not available yet.');
    if (button.disabled) return showToast('That investigation cannot be started at this time.');
    button.click();
    window.setTimeout(syncView, 40);
  }

  function triggerSceneChoice(index) {
    const button = [...document.querySelectorAll('#sceneChoices button')][index];
    if (!button) return showToast('That response is no longer available.');
    if (button.disabled) return showToast('Emily will not answer that right now.');
    button.click();
  }

  function sendFreeTalk() {
    const visible = document.getElementById('exactTalkInput');
    const hidden = document.getElementById('freeTalk');
    const send = document.getElementById('sendTalkBtn');
    const value = visible?.value.trim();
    if (!value || !hidden || !send) return;
    hidden.value = value;
    visible.value = '';
    send.click();
  }

  function openTab(tab) {
    const original = document.querySelector(`nav.tabs button[data-tab="${tab}"]`);
    if (!original) return;
    original.click();
    window.setTimeout(syncView, 20);
  }

  function closeScene() {
    document.getElementById('leaveSceneBtn')?.click();
    document.getElementById('sceneOverlay')?.classList.add('hidden');
  }

  function wireObservers() {
    const observer = new MutationObserver(syncView);
    document.querySelectorAll('.screen, #sceneOverlay, #bookOverlay').forEach(node => {
      observer.observe(node, { attributes: true, attributeFilter: ['class'] });
    });
    const taskList = document.getElementById('tasks');
    if (taskList) observer.observe(taskList, { childList: true, subtree: true, attributes: true });
  }

  function syncView() {
    const bookOverlay = document.getElementById('bookOverlay');
    const bookOpen = Boolean(bookOverlay && !bookOverlay.classList.contains('hidden'));
    const sceneOpen = isSceneOpen();
    const activeTab = document.querySelector('.screen.active')?.id || 'home';

    if (bookOpen) return enterNativeMode(false);
    if (sceneOpen && sceneIsEmily()) {
      leaveNativeMode();
      showExactStage('scene');
      syncChoiceAvailability();
      return;
    }
    if (sceneOpen) return enterNativeMode(true);
    if (activeTab === 'home' || activeTab === 'map') {
      leaveNativeMode();
      showExactStage(activeTab);
      return;
    }
    enterNativeMode(false);
  }

  function sceneIsEmily() {
    const id = currentNpcId();
    if (id === 'emily_hart') return true;
    const title = `${document.getElementById('sceneTitle')?.textContent || ''} ${document.getElementById('sceneLocation')?.textContent || ''}`.toLowerCase();
    return title.includes('emily') || title.includes('café hollow') || title.includes('cafe hollow');
  }

  function showExactStage(name) {
    SCREENS.forEach(screen => {
      const stage = document.getElementById(`exact-${screen}`);
      if (stage) stage.hidden = screen !== name;
    });
  }

  function enterNativeMode(sceneMode) {
    document.body.classList.add('exact-native-mode');
    document.body.classList.toggle('exact-native-scene', Boolean(sceneMode));
    document.getElementById('exactUi')?.setAttribute('aria-hidden', 'true');
  }

  function leaveNativeMode() {
    document.body.classList.remove('exact-native-mode', 'exact-native-scene');
    document.getElementById('exactUi')?.removeAttribute('aria-hidden');
  }

  function syncChoiceAvailability() {
    const stage = document.getElementById('exact-scene');
    const originals = [...document.querySelectorAll('#sceneChoices button')];
    stage?.querySelectorAll('[data-choice]').forEach(button => {
      const original = originals[Number(button.dataset.choice)];
      button.disabled = !original || original.disabled;
    });
  }

  function isSceneOpen() {
    const overlay = document.getElementById('sceneOverlay');
    return Boolean(overlay && !overlay.classList.contains('hidden'));
  }

  function currentNpcId() {
    try {
      return currentScene?.npc || null;
    } catch {
      return null;
    }
  }

  function locationName(location) {
    return ({
      forest: 'Blackwood Forest', house: 'Your House', cafe: 'Café Hollow', water: 'Water Tower',
      sawmill: 'Sawmill', lake: 'Lake Road', police: 'Police Station', townhall: 'Town Hall',
      church: 'Old Church', school: 'Blackwood High', library: 'Library', hospital: 'Hospital', cemetery: 'Cemetery'
    })[location] || 'This location';
  }

  function showToast(message) {
    const toast = document.getElementById('exactToast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]);
  }

  window.addEventListener('beforeunload', () => {
    if (syncTimer) window.clearInterval(syncTimer);
    objectUrls.forEach(url => URL.revokeObjectURL(url));
  });
})();
