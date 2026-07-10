(() => {
  'use strict';

  const APPOINTMENT_KEY = 'exposure-appointments-v1';
  const BOOK_KEY = 'exposure-memory-book-v1';

  const locationMeta = {
    your_house:{ name:'Your House', x:30, y:37, icon:'⌂', risk:'Low', description:'Your new home. Noah left the first piece of the mystery here.', taskId:'rest' },
    cafe_hollow:{ name:'Café Hollow', x:45, y:51, icon:'☕', risk:'Low', description:'Warm lights, guarded conversations and Emily Hart.', taskId:'emily' },
    blackwood_high:{ name:'Blackwood High', x:34, y:67, icon:'▣', risk:'Low', description:'Noah’s school and the edge of the forest search area.' },
    police_station:{ name:'Police Station', x:25, y:73, icon:'✦', risk:'Low', description:'Detective Mason controls what becomes evidence.', taskId:'mason' },
    blackwood_forest:{ name:'Blackwood Forest', x:13, y:28, icon:'♠', risk:'High', description:'Search teams avoid the deeper tracks after dark.', taskId:'forest' },
    lake_road:{ name:'Lake Road', x:82, y:54, icon:'◈', risk:'High', description:'An isolated road along the eastern waterline.', taskId:'anonymous' },
    blackwood_gazette:{ name:'Gazette', x:48, y:73, icon:'▤', risk:'Medium', description:'Sarah Pike keeps stories Blackwood would rather forget.', taskId:'sarah' },
    vales_garage:{ name:"Vale’s Garage", x:68, y:76, icon:'⚒', risk:'Medium', description:'Alex knows the old logging roads and the vehicles using them.', taskId:'alex' },
    mara_bell_house:{ name:"Mara’s House", x:48, y:87, icon:'⌂', risk:'Low', description:'Mara watches the street from behind her flyscreen.', taskId:'mara' },
    williams_house:{ name:"Noah’s House", x:61, y:41, icon:'⌂', risk:'Medium', description:'The Williams home remains under police attention.', taskId:'noah' },
    library:{ name:'Blackwood Library', x:48, y:64, icon:'▥', risk:'Low', description:'Old newsprint and forgotten disappearances.', taskId:'library' },
    old_church:{ name:'Old Church', x:82, y:78, icon:'†', risk:'Unknown', description:'A locked part of Blackwood’s older history.' },
    water_tower:{ name:'Water Tower', x:48, y:18, icon:'△', risk:'Unknown', description:'Visible from almost anywhere in northern Blackwood.' }
  };

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

  let selectedLocationId = 'your_house';
  let sceneSignature = '';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once:true });
  } else {
    init();
  }

  function init() {
    bindStaticActions();
    refreshAll();
    window.setInterval(refreshAll, 700);
    window.addEventListener('exposure:npc-updated', refreshAll);
  }

  function bindStaticActions() {
    document.getElementById('viewMapObjective')?.addEventListener('click', () => openTab('map'));
    document.getElementById('viewAppointmentBtn')?.addEventListener('click', () => openTab('phone'));
    document.getElementById('viewMemoryBtn')?.addEventListener('click', () => openTab('book'));
  }

  function refreshAll() {
    const gameState = getState();
    if (!gameState) return;
    refreshDate(gameState);
    refreshSocialTension(gameState);
    refreshAppointment();
    refreshMemoryPreview();
    refreshMap(gameState);
    refreshScene(gameState);
  }

  function refreshDate(gameState) {
    const now = new Date();
    setText('dateDisplay', new Intl.DateTimeFormat(undefined, {
      weekday:'long', day:'numeric', month:'long'
    }).format(now));
    setText('periodDisplay', `${periodLabel(now)} · Blackwood`);
    const heroDay = document.getElementById('heroDayNumber');
    if (heroDay) heroDay.textContent = `Day ${gameState.day || 1}`;
  }

  function refreshSocialTension(gameState) {
    const people = Object.values(gameState.people || {}).filter(person => person.id !== 'noah_williams');
    const averageSuspicion = people.length
      ? people.reduce((sum, person) => sum + Number(person.suspicionTowardPlayer || 0), 0) / people.length
      : 0;
    const rumour = Number(gameState.town?.rumourIntensity || 0);
    const publicFear = Number(gameState.town?.publicFear || 0);
    const tension = clamp(Math.round(averageSuspicion * .48 + rumour * .32 + publicFear * .20));
    setText('socialTension', tension);
    const bar = document.getElementById('socialTensionBar');
    if (bar) bar.style.width = `${tension}%`;
    setText('socialTensionLabel', tension < 30 ? 'The town is curious.' : tension < 60 ? 'Blackwood is watching.' : 'Rumours are turning against you.');
  }

  function refreshAppointment() {
    const box = document.getElementById('appointmentSummary');
    if (!box) return;
    const appointments = readJson(APPOINTMENT_KEY, {});
    const values = Object.values(appointments).filter(item => item?.scheduledAt && !['cancelled','missed','completed'].includes(item.status));
    values.sort((a,b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
    const appointment = values[0];

    if (!appointment) {
      box.innerHTML = '<div class="appointment-person"><div class="appointment-portrait"></div><div><div class="appointment-name">No appointment</div><p class="appointment-copy">Use the Phone to arrange meetings with Blackwood residents.</p></div></div>';
      return;
    }

    const date = new Date(appointment.scheduledAt);
    const person = displayName(appointment.npcId);
    box.innerHTML = `
      <div class="appointment-person">
        <div class="appointment-portrait" role="img" aria-label="${escapeHtml(person)} portrait"></div>
        <div>
          <div class="appointment-name">${escapeHtml(person)}</div>
          <div class="appointment-time">${escapeHtml(formatAppointment(date))}</div>
          <p class="appointment-copy">${escapeHtml(appointment.location || 'Blackwood')} · ${escapeHtml(appointment.status || 'proposed')}</p>
        </div>
      </div>`;
  }

  function refreshMemoryPreview() {
    const entries = readJson(BOOK_KEY, []);
    const entry = Array.isArray(entries) ? entries[0] : null;
    setText('currentChapterTitle', entry?.title || 'The Road Into Blackwood');
    setText('currentChapterMeta', entry ? `${entry.chapter || 'Memory'} · ${relativeDate(entry.completedAt)}` : 'Prologue · Not yet completed');
    const recent = document.getElementById('recentMemoryText');
    if (recent) recent.textContent = entry?.pages?.[0]?.text || 'Your first observations will be recorded here as the investigation begins.';
  }

  function refreshMap(gameState) {
    const mapList = document.getElementById('mapList');
    if (!mapList) return;
    const unlocked = new Set(gameState.unlocked || []);
    const data = getLocations();
    data.forEach(location => { if (location.unlocked) unlocked.add(location.id); });
    unlocked.add('your_house');
    unlocked.add('cafe_hollow');
    unlocked.add('blackwood_high');

    const signature = JSON.stringify([...unlocked].sort());
    if (mapList.dataset.signature === signature && mapList.querySelector('.map-marker')) {
      refreshMapDetail(gameState, unlocked);
      return;
    }

    mapList.dataset.signature = signature;
    mapList.innerHTML = '';
    Object.entries(locationMeta).forEach(([id, meta]) => {
      const open = unlocked.has(id);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `map-marker ${open ? '' : 'locked'} ${meta.risk === 'High' ? 'high' : ''} ${id === selectedLocationId ? 'current' : ''}`;
      button.style.left = `${meta.x}%`;
      button.style.top = `${meta.y}%`;
      button.setAttribute('aria-label', `${meta.name}${open ? '' : ', locked'}`);
      button.innerHTML = `<span class="pin"></span><span>${escapeHtml(open ? meta.name : 'Unknown')}</span>`;
      button.addEventListener('click', () => {
        selectedLocationId = id;
        mapList.dataset.signature = '';
        refreshMap(gameState);
      });
      mapList.appendChild(button);
    });
    refreshMapDetail(gameState, unlocked);
  }

  function refreshMapDetail(gameState, unlocked) {
    const detail = document.getElementById('mapDetail');
    if (!detail) return;
    const meta = locationMeta[selectedLocationId] || locationMeta.your_house;
    const open = unlocked.has(selectedLocationId);
    const taskName = meta.taskId ? taskNames[meta.taskId] : null;
    detail.innerHTML = `
      <span class="section-kicker">Area intelligence</span>
      <h3>${escapeHtml(open ? meta.name : 'Unknown Location')}</h3>
      <div class="map-detail-copy">${escapeHtml(open ? meta.description : 'Continue investigating to identify and unlock this location.')}</div>
      <div class="badge ${meta.risk === 'High' ? 'red' : meta.risk === 'Low' ? 'gold' : ''}">Risk: ${escapeHtml(open ? meta.risk : 'Unknown')}</div>
      ${open && taskName ? `<button class="map-action" data-map-task="${escapeHtml(meta.taskId)}">Travel here</button>` : ''}`;
    detail.querySelector('[data-map-task]')?.addEventListener('click', () => triggerTask(meta.taskId));
  }

  function refreshScene(gameState) {
    const overlay = document.getElementById('sceneOverlay');
    const panel = document.getElementById('sceneCharacterPanel');
    if (!overlay || !panel || overlay.classList.contains('hidden')) return;
    const scene = getScene();
    const person = scene?.npc ? gameState.people?.[scene.npc] : null;
    const signature = `${scene?.npc || 'none'}:${person?.trust || 0}:${person?.focus || 0}:${person?.fear || 0}:${person?.suspicionTowardPlayer || 0}`;
    if (signature === sceneSignature) return;
    sceneSignature = signature;

    if (!person) {
      panel.innerHTML = '';
      panel.hidden = true;
      return;
    }

    panel.hidden = false;
    const portraitStyle = person.id === 'emily_hart' ? "background-image:url('assets/emily-hart.svg')" : '';
    panel.innerHTML = `
      <div class="scene-character">
        <div class="scene-character-art" style="${portraitStyle}"></div>
        <div>
          <h3>${escapeHtml(person.name)}</h3>
          <p>${escapeHtml(person.role || 'Blackwood resident')}</p>
          <span class="badge gold">Trust ${Number(person.trust || 0)}</span>
          <span class="badge">Focus ${Number(person.focus || 0)}</span>
          <span class="badge red">Suspicion ${Number(person.suspicionTowardPlayer || 0)}</span>
          <span class="badge red">Fear ${Number(person.fear || 0)}</span>
        </div>
      </div>`;
  }

  function triggerTask(taskId) {
    const name = taskNames[taskId];
    if (!name) return;
    openTab('home');
    window.setTimeout(() => {
      const button = [...document.querySelectorAll('#tasks button')].find(item => {
        const title = item.childNodes[0]?.textContent?.trim() || item.textContent.trim();
        return title === name;
      });
      button?.click();
    }, 80);
  }

  function openTab(id) {
    document.querySelector(`.tabs button[data-tab="${id}"]`)?.click();
  }

  function getState() {
    try { return typeof state === 'undefined' ? null : state; } catch { return null; }
  }

  function getScene() {
    try { return typeof currentScene === 'undefined' ? null : currentScene; } catch { return null; }
  }

  function getLocations() {
    try { return typeof dataLocations === 'undefined' ? [] : dataLocations; } catch { return []; }
  }

  function displayName(id) {
    const names = {
      emily_hart:'Emily Hart', detective_mason:'Detective Mason', sarah_pike:'Sarah Pike',
      alex_vale:'Alex Vale', mara_bell:'Mara Bell', noah_williams:'Noah Williams'
    };
    return names[id] || String(id || 'Contact').replaceAll('_',' ');
  }

  function formatAppointment(date) {
    if (!Number.isFinite(date.getTime())) return 'Time pending';
    return new Intl.DateTimeFormat(undefined, {
      weekday:'short', day:'numeric', month:'short', hour:'numeric', minute:'2-digit'
    }).format(date);
  }

  function periodLabel(date) {
    const hour = date.getHours();
    if (hour < 6) return 'Before dawn';
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    if (hour < 20) return 'Evening';
    return 'Night';
  }

  function relativeDate(value) {
    const date = new Date(value || 0);
    if (!Number.isFinite(date.getTime())) return 'Recently';
    const minutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
    if (minutes < 2) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    if (minutes < 1440) return `${Math.round(minutes / 60)} hours ago`;
    return `${Math.round(minutes / 1440)} days ago`;
  }

  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; }
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function clamp(value) { return Math.max(0, Math.min(100, Number(value || 0))); }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, character => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
    }[character]));
  }
})();
