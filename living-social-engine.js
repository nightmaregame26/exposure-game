(() => {
  'use strict';

  const CONFIG_PATH = 'data/living-appointments.json';
  const SOCIAL_KEY = 'exposure-social-matrix-v1';
  const APPOINTMENT_KEY = 'exposure-appointments-v1';
  const LAST_SEEN_KEY = 'exposure-last-seen-v1';
  const BOOK_KEY = 'exposure-memory-book-v1';

  const taskNames = {
    emily:'Meet Emily at Café Hollow',
    noah:"Visit Noah's house",
    forest:'Search Blackwood Forest',
    mason:'Visit Detective Mason',
    alex:'Ask Alex about old roads',
    mara:'Talk to Mara Bell',
    sarah:'Help Sarah with article',
    anonymous:'Follow anonymous text',
    library:'Library research',
    rest:'Rest at home'
  };

  let config = null;
  let social = {};
  let appointments = {};
  let overrideTaskId = null;
  let overrideExpires = 0;
  let lastEnhancementSignature = '';

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    config = await loadJson(CONFIG_PATH);
    if (!config) return;

    await waitForGame();
    social = loadStore(SOCIAL_KEY, buildSocialDefaults());
    appointments = loadStore(APPOINTMENT_KEY, buildAppointmentDefaults());

    addInitialStoryMessage();
    processOfflineTime();
    refreshMissedAppointments();
    syncClock();
    renderEnhancements();

    window.setInterval(() => {
      syncClock();
      syncSocialFromGame();
      refreshMissedAppointments();
      renderEnhancements();
    }, 1000);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
      else {
        processOfflineTime();
        syncClock();
        renderEnhancements();
      }
    });

    window.addEventListener('beforeunload', () => {
      localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
    });
  }

  async function loadJson(path) {
    try {
      const response = await fetch(path, { cache:'no-store' });
      if (!response.ok) throw new Error(path);
      return await response.json();
    } catch (error) {
      console.error('Living Time configuration failed to load', error);
      return null;
    }
  }

  function waitForGame() {
    return new Promise(resolve => {
      const check = () => {
        if (document.getElementById('tasks') && typeof state !== 'undefined') resolve();
        else window.setTimeout(check, 100);
      };
      check();
    });
  }

  function buildSocialDefaults() {
    const result = {};
    Object.entries(config.npcs || {}).forEach(([id, npc]) => {
      result[id] = { ...npc.baseSocial, id, displayName:npc.displayName, keptAppointments:0, missedAppointments:0 };
    });
    return result;
  }

  function buildAppointmentDefaults() {
    const result = {};
    Object.entries(config.tasks || {}).forEach(([taskId, task]) => {
      if (!task.npcId || !task.requiresAppointment) return;
      const suggested = nextOccurrence(task.initialSuggestedTime || '10:00');
      result[taskId] = {
        taskId,
        npcId:task.npcId,
        status:'proposed',
        scheduledAt:suggested.toISOString(),
        durationMinutes:task.durationMinutes || 60,
        location:locationForTask(taskId),
        createdAt:new Date().toISOString(),
        response:`${config.npcs[task.npcId]?.displayName || 'Contact'} suggested ${formatDateTime(suggested)}.`
      };
    });
    return result;
  }

  function nextOccurrence(time) {
    const [hours, minutes] = String(time).split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    if (date.getTime() <= Date.now() + 10 * 60 * 1000) date.setDate(date.getDate() + 1);
    return date;
  }

  function syncClock() {
    const now = new Date();
    try {
      state.time = now.getHours() * 60 + now.getMinutes();
    } catch {}

    const time = document.getElementById('time');
    if (time) time.textContent = formatTime(now);

    document.body.classList.toggle('living-night', now.getHours() < 6 || now.getHours() >= 20);
    document.body.classList.toggle('living-evening', now.getHours() >= 17 && now.getHours() < 20);

    let line = document.getElementById('livingClockLine');
    if (!line) {
      const statusCard = document.querySelector('#home .card:nth-of-type(3)');
      if (statusCard) {
        line = document.createElement('div');
        line.id = 'livingClockLine';
        line.className = 'living-clock-line';
        statusCard.appendChild(line);
      }
    }
    if (line) line.innerHTML = `<strong>🕰 Living Time</strong><span>${formatDate(now)} · ${periodLabel(now)} in Blackwood</span>`;
  }

  function processOfflineTime() {
    const now = new Date();
    const previousRaw = localStorage.getItem(LAST_SEEN_KEY);
    localStorage.setItem(LAST_SEEN_KEY, now.toISOString());
    if (!previousRaw) return;

    const previous = new Date(previousRaw);
    const awayMinutes = Math.floor((now - previous) / 60000);
    const minimum = config.offlineSimulation?.minimumAwayMinutes || 30;
    if (!Number.isFinite(awayMinutes) || awayMinutes < minimum) return;

    const maxHours = config.offlineSimulation?.maximumSimulatedHours || 24;
    const simulatedHours = Math.min(maxHours, Math.max(1, Math.floor(awayMinutes / 60)));
    const events = buildAwayEvents(simulatedHours, previous, now);
    const summary = `You were away from Blackwood for ${humanDuration(awayMinutes)}. ${events.join(' ')}`;

    try {
      state.town.publicFear = clamp(state.town.publicFear + Math.min(8, Math.ceil(simulatedHours / 4)));
      state.town.rumourIntensity = clamp(state.town.rumourIntensity + Math.min(10, Math.ceil(simulatedHours / 3)));
      state.messages.unshift({ from:'Blackwood News', text:events[0], threat:false });
      state.worldMemory.unshift({
        id:`away_${Date.now()}`,
        day:state.day,
        time:formatTime(now),
        location:'Blackwood',
        summary,
        public:true,
        witnesses:[],
        knownBy:Object.keys(state.people),
        killerKnows:true,
        tags:['offline_simulation']
      });
      save?.();
    } catch {}

    saveBookEntry({
      id:`away_${now.getTime()}`,
      day:typeof state !== 'undefined' ? state.day : 1,
      chapter:'Living World',
      title:config.offlineSimulation?.summaryTitle || 'While You Were Away',
      pages:[{text:summary}],
      completedAt:now.toISOString(),
      bookmarked:false,
      type:'world'
    });

    renderAwayCard(summary);
  }

  function buildAwayEvents(hours, previous, now) {
    const events = [];
    if (crossedNight(previous, now)) events.push('Police vehicles searched the northern forest track during the night.');
    if (hours >= 4) events.push('Rumours about Noah spread through Main Street and the Gazette received several anonymous tips.');
    if (hours >= 8) events.push('At least one resident changed their routine after hearing that someone had been asking questions.');
    if (!events.length) events.push('Blackwood continued moving while you were gone.');
    return events;
  }

  function renderAwayCard(summary) {
    let card = document.getElementById('awaySummaryCard');
    if (!card) {
      card = document.createElement('div');
      card.id = 'awaySummaryCard';
      card.className = 'card away-summary';
      const hero = document.querySelector('#home .hero');
      hero?.insertAdjacentElement('afterend', card);
    }
    if (card) card.innerHTML = `<h2>📖 While You Were Away</h2><p>${escapeHtml(summary)}</p>`;
  }

  function addInitialStoryMessage() {
    try {
      if (!state.messages.some(message => message.from === 'Emily Hart')) {
        state.messages.unshift({
          from:'Emily Hart',
          text:'You spoke to Noah last night. Café Hollow, 10:00. Please come alone. I need to know what he left with you.',
          threat:false
        });
        save?.();
      }
    } catch {}
  }

  function syncSocialFromGame() {
    try {
      Object.entries(social).forEach(([id, profile]) => {
        const person = state.people[id];
        if (!person) return;
        profile.trust = person.trust;
        profile.fear = person.fear;
        profile.interest = person.interest;
        profile.suspicion = person.suspicionTowardPlayer;
      });
      saveStores();
    } catch {}
  }

  function evaluateTask(task) {
    const taskRule = config?.tasks?.[task.id];
    if (!taskRule) return { allowed:true, period:getPeriod(new Date()) };

    if (overrideTaskId === task.id && Date.now() < overrideExpires) {
      return { allowed:true, period:getPeriod(new Date()), variant:'unannounced', outcome:outcomeFor(task.id) };
    }

    if (!taskRule.requiresAppointment) {
      return { allowed:true, period:getPeriod(new Date()), variant:'open', outcome:outcomeFor(task.id) };
    }

    const appointment = appointments[task.id];
    if (!appointment) return { allowed:false, reason:'This meeting has not been arranged.', canReschedule:true };

    const start = new Date(appointment.scheduledAt);
    const end = new Date(start.getTime() + appointment.durationMinutes * 60000);
    const early = new Date(start.getTime() - 15 * 60000);
    const late = new Date(end.getTime() + 15 * 60000);
    const now = new Date();

    if (['proposed','confirmed','in_progress'].includes(appointment.status) && now >= early && now <= late) {
      return { allowed:true, period:getPeriod(now), variant:'appointment', appointment, outcome:outcomeFor(task.id) };
    }

    return {
      allowed:false,
      reason:`${displayName(appointment.npcId)} expects to meet ${formatDateTime(start)}. You can message them to request another time, or arrive unannounced and accept the consequences.`,
      canReschedule:true,
      allowUnannounced:Boolean(taskRule.allowUnannounced),
      appointment
    };
  }

  function openTaskGate(task, gate) {
    closeModal();
    const modal = createModal('livingTaskModal');
    modal.innerHTML = `
      <div class="living-modal-card">
        <button class="living-modal-close" data-close>✕</button>
        <span class="living-kicker">Living Appointment</span>
        <h2>${escapeHtml(task.name)}</h2>
        <p>${escapeHtml(gate.reason || 'This task is not currently available.')}</p>
        <div class="living-modal-actions">
          ${gate.canReschedule ? '<button data-reschedule>📱 Message to reschedule</button>' : ''}
          ${gate.allowUnannounced ? '<button class="secondary" data-go-anyway>Go anyway</button>' : ''}
          <button class="ghost" data-close>Not now</button>
        </div>
      </div>`;

    modal.querySelectorAll('[data-close]').forEach(button => button.onclick = closeModal);
    modal.querySelector('[data-reschedule]')?.addEventListener('click', () => openReschedule(task.id));
    modal.querySelector('[data-go-anyway]')?.addEventListener('click', () => {
      overrideTaskId = task.id;
      overrideExpires = Date.now() + 5000;
      closeModal();
      const button = findTaskButton(task.name);
      button?.click();
    });
  }

  function openReschedule(taskId) {
    const taskRule = config.tasks[taskId];
    const npc = config.npcs[taskRule.npcId];
    const defaultTime = nextConvenientTime(taskRule.npcId);
    closeModal();
    const modal = createModal('livingRescheduleModal');
    modal.innerHTML = `
      <div class="living-modal-card">
        <button class="living-modal-close" data-close>✕</button>
        <span class="living-kicker">Message ${escapeHtml(npc.displayName)}</span>
        <h2>Ask for another time</h2>
        <p>Your relationship, reliability, their schedule, fear and suspicion all affect whether they agree.</p>
        <label class="living-field">Requested date and time
          <input id="requestedMeetingTime" type="datetime-local" value="${toDateTimeLocal(defaultTime)}" />
        </label>
        <label class="living-field">Message
          <textarea id="requestedMeetingMessage">I cannot make the original time. Are you free then instead?</textarea>
        </label>
        <div class="living-modal-actions">
          <button data-send>Send message</button>
          <button class="ghost" data-close>Cancel</button>
        </div>
      </div>`;
    modal.querySelectorAll('[data-close]').forEach(button => button.onclick = closeModal);
    modal.querySelector('[data-send]').onclick = () => {
      const requested = new Date(modal.querySelector('#requestedMeetingTime').value);
      if (!Number.isFinite(requested.getTime()) || requested <= new Date()) {
        showToast('Choose a future time.');
        return;
      }
      requestReschedule(taskId, requested);
    };
  }

  function requestReschedule(taskId, requested) {
    const taskRule = config.tasks[taskId];
    const npcRule = config.npcs[taskRule.npcId];
    const profile = social[taskRule.npcId];
    const score = willingnessScore(taskId, requested, profile, npcRule);
    const accepted = score >= npcRule.rescheduleThreshold;
    const replyList = accepted ? npcRule.acceptedReplies : npcRule.refusedReplies;
    const template = replyList[Math.floor(Math.random() * replyList.length)];
    const reply = template.replace('{time}', formatDateTime(requested));

    if (accepted) {
      appointments[taskId] = {
        ...(appointments[taskId] || {}),
        taskId,
        npcId:taskRule.npcId,
        status:'confirmed',
        scheduledAt:requested.toISOString(),
        durationMinutes:taskRule.durationMinutes || 60,
        location:locationForTask(taskId),
        response:reply,
        updatedAt:new Date().toISOString()
      };
      applySocialDelta(taskRule.npcId, { respect:1, interest:1 });
    } else {
      applySocialDelta(taskRule.npcId, { suspicion:requested.getHours() >= 21 ? 3 : 1, respect:-1 });
    }

    addGameMessage(npcRule.displayName, reply, false);
    saveStores();
    closeModal();
    showToast(accepted ? 'Meeting rescheduled.' : `${npcRule.displayName} refused the request.`);
    renderEnhancements(true);
  }

  function willingnessScore(taskId, requested, profile, npcRule) {
    const available = availabilityPenalty(npcRule, requested);
    const hour = requested.getHours();
    const nightPenalty = hour >= 21 || hour < 6 ? npcRule.nightAversion || 0 : 0;
    const urgency = taskId === 'emily' ? 20 : 8;
    return (
      profile.trust * 0.28 +
      profile.affection * 0.12 +
      profile.respect * 0.10 +
      profile.reliability * 0.20 +
      profile.interest * 0.18 +
      urgency -
      profile.fear * 0.12 -
      profile.suspicion * 0.20 -
      available -
      nightPenalty
    );
  }

  function availabilityPenalty(npcRule, date) {
    const day = date.getDay();
    const minutes = date.getHours() * 60 + date.getMinutes();
    const available = (npcRule.availability || []).some(slot => {
      if (!slot.days.includes(day)) return false;
      return minutes >= timeToMinutes(slot.start) && minutes <= timeToMinutes(slot.end);
    });
    return available ? 0 : 30;
  }

  function refreshMissedAppointments() {
    const now = Date.now();
    Object.values(appointments).forEach(appointment => {
      if (!['proposed','confirmed'].includes(appointment.status)) return;
      const end = new Date(appointment.scheduledAt).getTime() + appointment.durationMinutes * 60000 + 20 * 60000;
      if (now <= end) return;
      appointment.status = 'missed';
      appointment.missedAt = new Date().toISOString();
      const profile = social[appointment.npcId];
      if (profile) profile.missedAppointments = (profile.missedAppointments || 0) + 1;
      applySocialDelta(appointment.npcId, { trust:-4, reliability:-8, respect:-3, suspicion:4 });
      addGameMessage(displayName(appointment.npcId), 'You said you would come. I waited. Do not ask me to change my plans again.', false);
    });
    saveStores();
  }

  function decorateChapter(taskId, phase, section) {
    const copy = deepClone(section);
    const outcome = outcomeFor(taskId);
    if (!outcome || phase !== 'outbound') return copy;

    const appointment = appointments[taskId];
    const appointmentText = appointment && config.tasks[taskId]?.requiresAppointment
      ? `You agreed to meet at ${formatDateTime(new Date(appointment.scheduledAt))}. ${appointment.status === 'confirmed' ? 'They accepted the change.' : 'They are expecting you.'}`
      : '';

    copy.pages.unshift({
      text:`${formatDate(new Date())}, ${formatTime(new Date())}. ${outcome.text}${appointmentText ? ' ' + appointmentText : ''}`
    });
    return copy;
  }

  function onTaskStarted(task, gate = {}) {
    const rule = config.tasks[task.id];
    const outcome = gate.outcome || outcomeFor(task.id);
    if (outcome) {
      try {
        state.exposure = clamp(state.exposure + Number(outcome.exposure || 0));
        if (rule?.npcId && state.people[rule.npcId]) {
          state.people[rule.npcId].fear = clamp(state.people[rule.npcId].fear + Number(outcome.npcFear || 0));
          state.people[rule.npcId].suspicionTowardPlayer = clamp(state.people[rule.npcId].suspicionTowardPlayer + Number(outcome.npcSuspicion || 0));
        }
        log?.(`Living Time outcome: ${outcome.label}.`);
      } catch {}
    }

    if (rule?.requiresAppointment && appointments[task.id]) {
      appointments[task.id].status = 'in_progress';
      appointments[task.id].startedAt = new Date().toISOString();
      applySocialDelta(rule.npcId, { reliability:3, respect:1, suspicion:-1 });
    }

    if (gate.variant === 'unannounced' && rule?.npcId) {
      applySocialDelta(rule.npcId, { trust:-2, respect:-3, fear:4, suspicion:7 });
      addGameMessage(displayName(rule.npcId), 'You came without arranging this. I do not know whether that was careless or deliberate.', false);
    }

    overrideTaskId = null;
    overrideExpires = 0;
    saveStores();
    window.setTimeout(syncClock, 50);
  }

  function onTaskCompleted(taskId) {
    const rule = config.tasks[taskId];
    const appointment = appointments[taskId];
    if (!appointment || !rule?.npcId || appointment.status !== 'in_progress') return;
    appointment.status = 'completed';
    appointment.completedAt = new Date().toISOString();
    const profile = social[rule.npcId];
    if (profile) profile.keptAppointments = (profile.keptAppointments || 0) + 1;
    applySocialDelta(rule.npcId, { trust:2, reliability:5, respect:2, suspicion:-2 });
    saveStores();
  }

  function renderEnhancements(force = false) {
    const signature = `${Date.now() >> 10}:${Object.values(appointments).map(a => `${a.taskId}-${a.status}-${a.scheduledAt}`).join('|')}`;
    if (!force && signature === lastEnhancementSignature) return;
    lastEnhancementSignature = signature;
    renderTaskAvailability();
    renderAppointments();
    renderSocialProfiles();
  }

  function renderTaskAvailability() {
    const now = new Date();
    Object.entries(taskNames).forEach(([taskId, name]) => {
      const button = findTaskButton(name);
      if (!button) return;
      button.querySelector('.living-task-meta')?.remove();
      const rule = config.tasks[taskId];
      const outcome = outcomeFor(taskId);
      const appointment = appointments[taskId];
      const line = document.createElement('div');
      line.className = 'living-task-meta';
      if (rule?.requiresAppointment && appointment) {
        line.textContent = `${statusIcon(appointment.status)} ${capitalize(appointment.status)} · ${formatDateTime(new Date(appointment.scheduledAt))}`;
      } else {
        line.textContent = `🕰 ${periodLabel(now)} outcome: ${outcome?.label || 'Dynamic'}`;
      }
      button.appendChild(line);
    });
  }

  function renderAppointments() {
    const phone = document.getElementById('phoneList');
    if (!phone) return;
    let section = document.getElementById('livingAppointments');
    if (!section) {
      section = document.createElement('div');
      section.id = 'livingAppointments';
      section.className = 'item living-appointments';
      phone.prepend(section);
    }

    const entries = Object.values(appointments);
    section.innerHTML = `<b>🕰 Living Appointments</b><p class="small">Meetings follow your real local time. Message people to negotiate another time.</p>` +
      (entries.length ? entries.map(appointment => `
        <div class="appointment-row">
          <div><strong>${escapeHtml(displayName(appointment.npcId))}</strong><span>${escapeHtml(locationForTask(appointment.taskId))} · ${formatDateTime(new Date(appointment.scheduledAt))}</span><small>${capitalize(appointment.status)}</small></div>
          <button class="mini secondary" data-reschedule-task="${appointment.taskId}">Message</button>
        </div>`).join('') : '<p class="small">No meetings arranged.</p>');

    section.querySelectorAll('[data-reschedule-task]').forEach(button => {
      button.onclick = () => openReschedule(button.dataset.rescheduleTask);
    });
  }

  function renderSocialProfiles() {
    const list = document.getElementById('contactsList');
    if (!list) return;
    [...list.querySelectorAll('.item')].forEach(card => {
      if (card.querySelector('.living-social')) return;
      const name = card.querySelector('b')?.textContent?.trim();
      const id = Object.keys(social).find(key => social[key].displayName === name);
      if (!id) return;
      const profile = social[id];
      const score = socialScore(profile);
      const block = document.createElement('div');
      block.className = 'living-social';
      block.innerHTML = `
        <div class="social-score-line"><span>Social score</span><strong>${score}/100</strong></div>
        <div class="social-meter"><i style="width:${score}%"></i></div>
        <span class="badge">${relationshipLabel(score)}</span>
        <span class="badge ${profile.suspicion >= 50 ? 'red' : ''}">${suspicionLabel(profile.suspicion)}</span>
        <p class="small">Reliability ${Math.round(profile.reliability)} · Respect ${Math.round(profile.respect)} · Appointments kept ${profile.keptAppointments || 0}</p>`;
      card.appendChild(block);
    });
  }

  function socialScore(profile) {
    return clamp(Math.round(
      15 +
      profile.trust * 0.28 +
      profile.affection * 0.17 +
      profile.respect * 0.18 +
      profile.reliability * 0.22 +
      profile.interest * 0.15 -
      profile.suspicion * 0.25 -
      profile.fear * 0.10
    ));
  }

  function relationshipLabel(score) {
    if (score < 20) return 'Hostile distance';
    if (score < 40) return 'Cautious';
    if (score < 60) return 'Developing connection';
    if (score < 80) return 'Trusted relationship';
    return 'Close bond';
  }

  function suspicionLabel(value) {
    if (value >= 75) return 'Believes you may be the killer';
    if (value >= 55) return 'Treating you as a possible suspect';
    if (value >= 35) return 'Wary of your involvement';
    if (value >= 18) return 'Watching you carefully';
    return 'Does not currently suspect you';
  }

  function applySocialDelta(id, delta) {
    const profile = social[id];
    if (!profile) return;
    Object.entries(delta).forEach(([key, value]) => {
      profile[key] = clamp(Number(profile[key] || 0) + Number(value || 0));
    });
    try {
      const person = state.people[id];
      if (person) {
        if (delta.trust) person.trust = clamp(person.trust + delta.trust);
        if (delta.fear) person.fear = clamp(person.fear + delta.fear);
        if (delta.interest) person.interest = clamp(person.interest + delta.interest);
        if (delta.suspicion) person.suspicionTowardPlayer = clamp(person.suspicionTowardPlayer + delta.suspicion);
      }
      save?.();
    } catch {}
  }

  function addGameMessage(from, text, threat) {
    try {
      state.messages.unshift({ from, text, threat:Boolean(threat) });
      save?.();
      render?.();
    } catch {}
  }

  function outcomeFor(taskId) {
    const period = getPeriod(new Date());
    return config.tasks?.[taskId]?.outcomes?.[period] || null;
  }

  function getPeriod(date) {
    const hour = date.getHours();
    if (hour >= 6 && hour < 17) return 'day';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  function periodLabel(date) {
    const period = getPeriod(date);
    return period === 'day' ? 'Daytime' : period === 'evening' ? 'Evening' : 'Night';
  }

  function nextConvenientTime(npcId) {
    const npc = config.npcs[npcId];
    const now = new Date();
    for (let offset = 0; offset < 8; offset += 1) {
      const candidateDay = new Date(now);
      candidateDay.setDate(now.getDate() + offset);
      const slot = (npc.availability || []).find(item => item.days.includes(candidateDay.getDay()));
      if (!slot) continue;
      const [hour, minute] = slot.start.split(':').map(Number);
      candidateDay.setHours(hour, minute, 0, 0);
      if (candidateDay > now) return candidateDay;
    }
    const fallback = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    fallback.setHours(18, 0, 0, 0);
    return fallback;
  }

  function locationForTask(taskId) {
    return ({emily:'Café Hollow',mason:'Police Station',alex:"Vale's Garage",mara:"Mara Bell's House",sarah:'Blackwood Gazette'})[taskId] || 'Blackwood';
  }

  function displayName(id) {
    return social[id]?.displayName || config.npcs?.[id]?.displayName || id;
  }

  function saveStores() {
    localStorage.setItem(SOCIAL_KEY, JSON.stringify(social));
    localStorage.setItem(APPOINTMENT_KEY, JSON.stringify(appointments));
  }

  function loadStore(key, fallback) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || 'null');
      return parsed || fallback;
    } catch {
      return fallback;
    }
  }

  function saveBookEntry(entry) {
    try {
      const book = JSON.parse(localStorage.getItem(BOOK_KEY) || '[]');
      if (!book.some(item => item.id === entry.id)) book.unshift(entry);
      localStorage.setItem(BOOK_KEY, JSON.stringify(book.slice(0, 250)));
      window.ExposureBook?.renderLibrary?.();
    } catch {}
  }

  function createModal(id) {
    const modal = document.createElement('aside');
    modal.id = id;
    modal.className = 'living-modal';
    document.body.appendChild(modal);
    return modal;
  }

  function closeModal() {
    document.querySelectorAll('.living-modal').forEach(modal => modal.remove());
  }

  function showToast(message) {
    document.getElementById('livingToast')?.remove();
    const toast = document.createElement('div');
    toast.id = 'livingToast';
    toast.className = 'living-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    window.setTimeout(() => toast.remove(), 3000);
  }

  function findTaskButton(name) {
    return [...document.querySelectorAll('#tasks button')].find(button => {
      const title = button.childNodes[0]?.textContent?.trim() || '';
      return title === name;
    });
  }

  function crossedNight(start, end) {
    return start.toDateString() !== end.toDateString() || start.getHours() >= 20 || end.getHours() < 6;
  }

  function timeToMinutes(value) {
    const [hours, minutes] = String(value).split(':').map(Number);
    return hours * 60 + minutes;
  }

  function formatTime(date) {
    return new Intl.DateTimeFormat(undefined, { hour:'numeric', minute:'2-digit' }).format(date);
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat(undefined, { weekday:'long', day:'numeric', month:'long' }).format(date);
  }

  function formatDateTime(date) {
    return new Intl.DateTimeFormat(undefined, { weekday:'short', day:'numeric', month:'short', hour:'numeric', minute:'2-digit' }).format(date);
  }

  function toDateTimeLocal(date) {
    const pad = number => String(number).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function humanDuration(minutes) {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return remainder ? `${hours} hours and ${remainder} minutes` : `${hours} hours`;
  }

  function statusIcon(status) {
    return ({proposed:'💬',confirmed:'✅',in_progress:'📍',completed:'✔️',missed:'⚠️',cancelled:'✕'})[status] || '🕰';
  }

  function capitalize(value) {
    return String(value || '').replace(/_/g, ' ').replace(/^./, char => char.toUpperCase());
  }

  function clamp(value) {
    return Math.max(0, Math.min(100, Number(value || 0)));
  }

  function deepClone(value) {
    return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, char => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
    }[char]));
  }

  window.ExposureLiving = {
    evaluateTask,
    openTaskGate,
    decorateChapter,
    onTaskStarted,
    onTaskCompleted,
    openReschedule,
    socialScore,
    getSocialProfile:id => social[id] ? { ...social[id] } : null,
    getAppointments:() => deepClone(appointments)
  };
})();
