(() => {
  'use strict';

  const navItems = [
    ['home','⌂','Home'],
    ['book','▥','Book'],
    ['map','⌖','Map'],
    ['contacts','♟','People'],
    ['phone','☎','Phone'],
    ['suspects','♜','Suspects'],
    ['diary','▤','Notes'],
    ['case','▣','Case']
  ];

  const mapLocations = [
    {id:'rest',label:'Your House',x:28,y:30,risk:'Low',description:'Your new home. Noah left the first piece of the mystery here.',available:true},
    {id:'emily',label:'Café Hollow',x:45,y:41,risk:'Low',description:'Warm windows, guarded conversations and Emily Hart.',available:true},
    {id:'mason',label:'Police Station',x:25,y:59,risk:'Moderate',description:'Detective Mason controls the official investigation.',available:true},
    {id:'library',label:'Library',x:50,y:69,risk:'Low',description:'Blackwood keeps its oldest lies in the archives.',available:true},
    {id:'forest',label:'Blackwood Forest',x:15,y:42,risk:'High',description:'Old logging tracks disappear beyond the treeline.',available:true},
    {id:'anonymous',label:'Lake Road',x:79,y:45,risk:'High',description:'A quiet road beside the water. Too quiet after dark.',available:true},
    {id:null,label:'Water Tower',x:36,y:18,risk:'Unknown',description:'A landmark above the town. Access is currently locked.',available:false},
    {id:null,label:'Sawmill',x:72,y:26,risk:'Unknown',description:'The abandoned mill sits beyond the northern road.',available:false},
    {id:null,label:'Old Church',x:76,y:60,risk:'Unknown',description:'The church records may contain names the town forgot.',available:false},
    {id:null,label:'Blackwood High',x:31,y:73,risk:'Unknown',description:'Noah was last seen near the school grounds.',available:false},
    {id:null,label:'Hospital',x:69,y:72,risk:'Unknown',description:'Medical records are restricted.',available:false},
    {id:null,label:'Cemetery',x:53,y:84,risk:'Unknown',description:'Some Blackwood stories end here. Others begin here.',available:false}
  ];

  let dockStartY = 0;
  let dockDragging = false;
  let dockMoved = false;
  let lastTaskSignature = '';
  let lastChoiceSignature = '';
  let selectedMapLocation = mapLocations[0];

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {once:true});
  } else {
    init();
  }

  function init(){
    document.body.classList.add('approved-art-ui');
    document.body.classList.remove('native-ui-ready');
    buildHome();
    buildMap();
    buildEmily();
    buildDock();
    observeScene();
    syncAll();
    window.setInterval(syncAll, 450);
  }

  function buildHome(){
    const screen = document.getElementById('home');
    if (!screen || document.getElementById('exposureHome')) return;
    wrapLegacy(screen);

    const shell = document.createElement('div');
    shell.id = 'exposureHome';
    shell.className = 'exp-shell';
    shell.innerHTML = `
      <div class="exp-frame">
        ${brandBar('expHomeReset')}
        <section class="exp-hero" aria-label="Blackwood town at night">
          <div class="exp-hero-content">
            <div class="exp-location"><strong>Blackwood</strong>Greywick County<br>Est. 1882</div>
            <div class="exp-hero-bottom">
              <p class="exp-quote">“Some stories don’t end. They only get rewritten.”</p>
              <button id="expEnterTown" class="exp-enter" type="button">Enter Blackwood →</button>
            </div>
          </div>
        </section>

        <div class="exp-grid two">
          <article class="exp-card">
            <span class="exp-kicker">▤ Blackwood News</span>
            <h2>Latest Headline</h2>
            <p id="expNews" class="exp-news-copy">Local teen disappears without a trace</p>
            <p class="exp-news-meta">No leads. No witnesses. Blackwood is already choosing what to believe.</p>
            <button id="expReadNews" class="exp-secondary" type="button">Read more</button>
          </article>
          <article class="exp-card exp-time-card">
            <div>
              <div id="expTime" class="exp-time">--:--</div>
              <div id="expDate" class="exp-date">Living time · Greywick County</div>
            </div>
          </article>
        </div>

        <div class="exp-grid three">
          ${statCard('stamina','⚡ Stamina','Your ability to travel, search and keep going.')}
          ${statCard('exposure','◉ Exposure','The darker it gets, the closer it gets.','danger')}
          ${statCard('social','♟ Social Tension','Blackwood is watching. Trust is a currency.')}
        </div>

        <div class="exp-grid two">
          <article class="exp-card">
            <span class="exp-kicker">Current objectives</span>
            <h2>Available Chapters</h2>
            <p>Travel, time and relationships alter every encounter.</p>
            <div id="expTaskList" class="exp-task-list"></div>
          </article>
          <article class="exp-card">
            <span class="exp-kicker">Upcoming appointment</span>
            <div class="exp-appointment">
              <div class="exp-avatar-mini" aria-hidden="true"></div>
              <div class="exp-appointment-copy">
                <h3>Emily Hart</h3>
                <p id="expAppointment">Check your phone for the agreed time.</p>
                <p>Trust determines whether she will change the meeting.</p>
              </div>
            </div>
            <button id="expOpenPhone" class="exp-secondary" type="button">View appointment</button>
          </article>
        </div>

        <div class="exp-grid two">
          <article class="exp-card exp-memory-book">
            <div>
              <span class="exp-kicker">Memory Book</span>
              <h2 id="expChapterTitle">The Road Into Blackwood</h2>
              <p id="expChapterMeta">Every journey, clue and conversation is recorded.</p>
              <button id="expOpenBook" class="exp-secondary" type="button">View chapter</button>
            </div>
            <div class="exp-book-cover" aria-hidden="true"></div>
          </article>
          <article class="exp-card exp-recent">
            <span class="exp-kicker">Recent memory</span>
            <h2>What changed</h2>
            <p id="expRecent">You moved to Blackwood yesterday. This morning, Noah Williams is missing.</p>
            <button id="expOpenMap" class="exp-secondary" type="button">Open Blackwood map</button>
          </article>
        </div>
      </div>`;

    screen.appendChild(shell);
    shell.querySelector('#expEnterTown')?.addEventListener('click', () => openTab('map'));
    shell.querySelector('#expReadNews')?.addEventListener('click', () => openTab('book'));
    shell.querySelector('#expOpenPhone')?.addEventListener('click', () => openTab('phone'));
    shell.querySelector('#expOpenBook')?.addEventListener('click', () => openTab('book'));
    shell.querySelector('#expOpenMap')?.addEventListener('click', () => openTab('map'));
    shell.querySelector('#expHomeReset')?.addEventListener('click', () => document.getElementById('resetBtn')?.click());
  }

  function brandBar(resetId){
    return `
      <header class="exp-brandbar">
        <div class="exp-seal" aria-hidden="true">♣</div>
        <div class="exp-brand"><h1>EXPOSURE</h1><p>Blackwood · The Living Book</p></div>
        <button id="${resetId}" class="exp-icon-btn" type="button" aria-label="Reset investigation">⚙</button>
      </header>`;
  }

  function statCard(id,label,note,tone=''){
    return `
      <article class="exp-card exp-stat">
        <span class="exp-stat-label">${label}</span>
        <div class="exp-stat-value ${tone}" id="exp-${id}-value">0<small>${id === 'stamina' ? '/100' : '%'}</small></div>
        <div class="exp-meter ${id === 'exposure' ? 'red' : id === 'social' ? 'social' : ''}"><i id="exp-${id}-bar"></i></div>
        <p class="exp-stat-note">${note}</p>
      </article>`;
  }

  function buildMap(){
    const screen = document.getElementById('map');
    if (!screen || document.getElementById('exposureMap')) return;
    wrapLegacy(screen);

    const shell = document.createElement('div');
    shell.id = 'exposureMap';
    shell.className = 'exp-map-shell';
    shell.innerHTML = `
      ${brandBar('expMapReset')}
      <div class="exp-map-layout">
        <div class="exp-map-stage" aria-label="Interactive map of Blackwood">
          <div class="exp-map-title"><strong>Blackwood</strong>Greywick County<br>Est. 1882</div>
          ${mapLocations.map((location,index) => pinMarkup(location,index)).join('')}
        </div>
        <aside class="exp-map-side">
          <article class="exp-card" id="expMapDetail"></article>
          <article class="exp-card">
            <span class="exp-kicker">Map legend</span>
            <h3>Area status</h3>
            <div class="exp-legend">
              <div class="exp-legend-row"><i class="exp-legend-swatch"></i>Available to investigate</div>
              <div class="exp-legend-row"><i class="exp-legend-swatch locked"></i>Unknown or locked</div>
              <div class="exp-legend-row"><i class="exp-legend-swatch risk"></i>Elevated risk after dark</div>
            </div>
          </article>
        </aside>
      </div>`;

    screen.appendChild(shell);
    shell.querySelector('#expMapReset')?.addEventListener('click', () => document.getElementById('resetBtn')?.click());
    shell.querySelectorAll('.exp-pin').forEach(button => {
      button.addEventListener('click', () => selectMapLocation(Number(button.dataset.locationIndex)));
    });
    renderMapDetail();
  }

  function pinMarkup(location,index){
    return `
      <button type="button" class="exp-pin ${location.available ? '' : 'locked'}" data-location-index="${index}" style="left:${location.x}%;top:${location.y}%" aria-label="${escapeHtml(location.label)}">
        <span class="exp-pin-dot" aria-hidden="true"></span>
        <span>${escapeHtml(location.label)}</span>
      </button>`;
  }

  function selectMapLocation(index){
    selectedMapLocation = mapLocations[index] || mapLocations[0];
    renderMapDetail();
    const detail = document.getElementById('expMapDetail');
    if (window.matchMedia('(max-width:820px)').matches) detail?.scrollIntoView({behavior:'smooth',block:'nearest'});
  }

  function renderMapDetail(){
    const detail = document.getElementById('expMapDetail');
    if (!detail) return;
    const location = selectedMapLocation;
    detail.innerHTML = `
      <span class="exp-kicker">Area intelligence</span>
      <h2>${escapeHtml(location.label)}</h2>
      <p>${escapeHtml(location.description)}</p>
      <span class="exp-risk">Risk: ${escapeHtml(location.risk)}</span>
      <button id="expTravelHere" class="exp-secondary exp-map-action" type="button">${location.available ? 'Travel here' : 'Location locked'}</button>`;
    const button = detail.querySelector('#expTravelHere');
    button.disabled = !location.available;
    button.addEventListener('click', () => {
      if (!location.available) return;
      triggerTask(location.id);
    });
  }

  function buildEmily(){
    const scene = document.querySelector('#sceneOverlay .scene');
    if (!scene || document.getElementById('approvedEmily')) return;

    const shell = document.createElement('div');
    shell.id = 'approvedEmily';
    shell.className = 'exp-scene-shell';
    shell.innerHTML = `
      ${brandBar('expSceneReset')}
      <section class="exp-scene-hero" aria-label="Café Hollow on a rainy evening">
        <div class="exp-scene-meta"><strong>Blackwood</strong>Toward Café Hollow<br><span id="expSceneClock">Living time</span><br>Raining · 9°C</div>
        <button id="expCloseScene" class="exp-icon-btn exp-close-scene" type="button" aria-label="Close scene">✕</button>
      </section>
      <article class="exp-chapter-page">
        <span class="exp-kicker">Chapter II</span>
        <h2>The Walk to Café Hollow</h2>
        <p>The rain had not let up since afternoon, drumming softly on awnings and slick cobblestones. Café Hollow glowed like a secret, its windows warm against the mist. Inside, the scent of roasted beans and old wood wrapped around the hush of low voices.<br><br>Emily Hart was already there — back by the window, fingers curled around a chipped mug. She glanced up as you approached. There was something in her eyes tonight. Urgency. Unease.</p>
      </article>
      <article class="exp-card exp-character-card">
        <div class="exp-character-portrait" aria-label="Emily Hart"></div>
        <div class="exp-character-body">
          <div class="exp-character-head">
            <div><div class="exp-character-name">Emily Hart</div><div class="exp-character-role">Café worker · Blackwood resident</div></div>
            <div class="exp-trust-badge"><span>Trust</span><b id="expEmilyTrust">22%</b></div>
          </div>
          <div id="expLiveReply" class="exp-live-reply"><b>Emily</b>“I wasn’t sure you’d come.”</div>
          <div id="expNpcStats" class="exp-npc-stats"></div>
        </div>
      </article>
      <section class="exp-scene-choices" id="expSceneChoices"></section>
      <div class="exp-scene-talk">
        <textarea id="expTalkInput" maxlength="400" placeholder="Say anything to Emily..."></textarea>
        <button id="expTalkSend" type="button" aria-label="Send message">➤</button>
      </div>`;

    scene.insertBefore(shell, scene.firstChild);
    shell.querySelector('#expCloseScene')?.addEventListener('click', closeScene);
    shell.querySelector('#expSceneReset')?.addEventListener('click', () => document.getElementById('resetBtn')?.click());
    shell.querySelector('#expTalkSend')?.addEventListener('click', sendTalk);
    shell.querySelector('#expTalkInput')?.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey){
        event.preventDefault();
        sendTalk();
      }
    });
  }

  function buildDock(){
    if (document.getElementById('gameDock')) return;
    const dock = document.createElement('aside');
    dock.id = 'gameDock';
    dock.className = 'game-dock';
    dock.setAttribute('aria-label','Game navigation');
    dock.innerHTML = `
      <button id="gameDockGrab" class="game-dock-grab" type="button" aria-expanded="false">
        <span class="game-dock-handle"></span>
        <span id="gameDockCurrent" class="game-dock-current">Home · Swipe up for menu</span>
        <span class="game-dock-chevron">⌃</span>
      </button>
      <div class="game-dock-grid">
        ${navItems.map(([id,icon,label]) => `<button class="game-dock-item" data-dock-tab="${id}" type="button"><span>${icon}</span>${label}</button>`).join('')}
      </div>`;
    document.body.appendChild(dock);

    const grab = dock.querySelector('#gameDockGrab');
    grab.addEventListener('click', () => {
      if (dockMoved){ dockMoved = false; return; }
      toggleDock();
    });
    dock.querySelectorAll('[data-dock-tab]').forEach(button => button.addEventListener('click', () => {
      if (document.body.classList.contains('approved-emily-active')) closeScene();
      openTab(button.dataset.dockTab);
      closeDock();
    }));

    dock.addEventListener('pointerdown', event => {
      dockStartY = event.clientY;
      dockDragging = true;
      dockMoved = false;
      dock.setPointerCapture?.(event.pointerId);
    });
    dock.addEventListener('pointermove', event => {
      if (dockDragging && Math.abs(event.clientY - dockStartY) > 8) dockMoved = true;
    });
    dock.addEventListener('pointerup', event => {
      if (!dockDragging) return;
      dockDragging = false;
      const delta = event.clientY - dockStartY;
      if (delta < -34){ dockMoved = true; openDock(); }
      if (delta > 34){ dockMoved = true; closeDock(); }
      window.setTimeout(() => { dockMoved = false; }, 220);
    });
    dock.addEventListener('pointercancel', () => { dockDragging = false; dockMoved = false; });
  }

  function syncAll(){
    syncHome();
    syncTasks();
    syncScene();
    syncDock();
  }

  function syncHome(){
    const now = new Date();
    const time = textOf('time') || now.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});
    const date = textOf('dateDisplay') || now.toLocaleDateString(undefined, {weekday:'long',day:'numeric',month:'long'});
    setText('expTime', time);
    setText('expDate', `${date} · Greywick County`);

    const stamina = numberOf('stamina');
    const exposure = numberOf('exposure');
    const social = numberOf('socialTension');
    setStat('stamina', stamina, '/100');
    setStat('exposure', exposure, '%');
    setStat('social', social, '%');

    const news = textOf('news');
    if (news) setText('expNews', cleanNews(news));
    const appointment = textOf('appointmentSummary');
    if (appointment) setText('expAppointment', appointment);
    const chapter = textOf('currentChapterTitle');
    if (chapter) setText('expChapterTitle', chapter);
    const chapterMeta = textOf('currentChapterMeta');
    if (chapterMeta) setText('expChapterMeta', chapterMeta);
    const recent = textOf('recentMemoryText') || latestStoryText();
    if (recent) setText('expRecent', recent);
  }

  function syncTasks(){
    const originals = [...document.querySelectorAll('#tasks button')];
    const signature = originals.map(button => `${button.textContent}|${button.disabled}`).join('~');
    if (signature === lastTaskSignature) return;
    lastTaskSignature = signature;
    const list = document.getElementById('expTaskList');
    if (!list) return;
    list.innerHTML = '';
    originals.slice(0,5).forEach((button,index) => {
      const text = button.textContent.replace(/\s+/g,' ').trim();
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'exp-task';
      item.disabled = button.disabled;
      item.innerHTML = `<span class="exp-task-icon">${index + 1}</span><span class="exp-task-copy"><strong>${escapeHtml(text)}</strong><span>${button.disabled ? 'Unavailable at this time' : 'Open this investigation chapter'}</span></span><span class="exp-task-arrow">›</span>`;
      item.addEventListener('click', () => button.click());
      list.appendChild(item);
    });
    if (!originals.length){
      list.innerHTML = '<p>No tasks are available right now. Check the Phone or return later.</p>';
    }
  }

  function syncScene(){
    const overlay = document.getElementById('sceneOverlay');
    const sceneOpen = overlay && !overlay.classList.contains('hidden');
    const emilyOpen = sceneOpen && currentNpcId() === 'emily_hart';
    document.body.classList.toggle('approved-emily-active', emilyOpen);
    if (!emilyOpen) return;

    setText('expSceneClock', `${textOf('time') || new Date().toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})} · ${textOf('periodDisplay') || 'Blackwood'}`);
    syncSceneReply();
    syncChoices();
    syncNpcStats();
  }

  function syncSceneReply(){
    const source = document.getElementById('sceneText');
    const target = document.getElementById('expLiveReply');
    if (!source || !target) return;
    const full = source.innerText.replace(/\s+/g,' ').trim();
    if (!full) return;
    const pieces = full.split(/You:/i);
    const latest = pieces[pieces.length - 1].trim();
    target.innerHTML = `<b>Emily</b>${escapeHtml(latest.slice(-420))}`;
  }

  function syncChoices(){
    const originals = [...document.querySelectorAll('#sceneChoices button')];
    const signature = originals.map(button => `${button.textContent}|${button.disabled}`).join('~');
    if (signature === lastChoiceSignature) return;
    lastChoiceSignature = signature;
    const list = document.getElementById('expSceneChoices');
    if (!list) return;
    list.innerHTML = '';
    originals.slice(0,4).forEach((button,index) => {
      const clone = document.createElement('button');
      clone.type = 'button';
      clone.className = 'exp-choice';
      clone.disabled = button.disabled;
      clone.innerHTML = `<span>“</span><span>${escapeHtml(button.textContent.replace(/\s+/g,' ').trim())}</span><span>›</span>`;
      clone.addEventListener('click', () => {
        button.click();
        window.setTimeout(syncSceneReply, 100);
      });
      list.appendChild(clone);
    });
  }

  function syncNpcStats(){
    const source = textOf('npcStateBox');
    const stats = {
      Trust: readNamedNumber(source,'Trust',22),
      Focus: readNamedNumber(source,'Focus',46),
      Fear: readNamedNumber(source,'Fear',38),
      Suspicion: readNamedNumber(source,'Suspicion',18)
    };
    setText('expEmilyTrust', `${stats.Trust}%`);
    const container = document.getElementById('expNpcStats');
    if (!container) return;
    container.innerHTML = Object.entries(stats).map(([name,value]) => `
      <div class="exp-npc-stat"><label><span>${name}</span><span>${value}%</span></label><div class="exp-meter ${name === 'Suspicion' ? 'red' : ''}"><i style="width:${clamp(value)}%"></i></div></div>`).join('');
  }

  function observeScene(){
    const source = document.getElementById('sceneText');
    if (source) new MutationObserver(() => {
      syncSceneReply();
      syncChoices();
      syncNpcStats();
    }).observe(source, {childList:true,subtree:true,characterData:true});
    const choices = document.getElementById('sceneChoices');
    if (choices) new MutationObserver(syncChoices).observe(choices, {childList:true,subtree:true,characterData:true,attributes:true});
  }

  function sendTalk(){
    const visible = document.getElementById('expTalkInput');
    const hidden = document.getElementById('freeTalk');
    const send = document.getElementById('sendTalkBtn');
    const value = visible?.value.trim();
    if (!value || !hidden || !send) return;
    hidden.value = value;
    visible.value = '';
    send.click();
    window.setTimeout(syncSceneReply, 180);
  }

  function triggerTask(key){
    const aliases = {
      emily:['Meet Emily','Emily','Café Hollow'],
      library:['Library'],
      mason:['Mason','Police'],
      forest:['Forest'],
      anonymous:['anonymous','Lake Road'],
      rest:['Rest','home']
    };
    const originals = [...document.querySelectorAll('#tasks button')];
    const needles = aliases[key] || [key];
    const button = originals.find(item => needles.some(needle => item.textContent.toLowerCase().includes(needle.toLowerCase())));
    if (!button){ showToast('That investigation is not available yet.'); return; }
    if (button.disabled){ showToast('That task is unavailable right now. Check the Phone, appointment time or Stamina.'); return; }
    button.click();
  }

  function closeScene(){
    document.getElementById('leaveSceneBtn')?.click();
    document.getElementById('sceneOverlay')?.classList.add('hidden');
    document.body.classList.remove('approved-emily-active');
  }

  function wrapLegacy(screen){
    const legacy = document.createElement('div');
    legacy.className = 'exact-legacy';
    while (screen.firstChild) legacy.appendChild(screen.firstChild);
    screen.appendChild(legacy);
  }

  function openTab(id){
    document.querySelector(`nav.tabs button[data-tab="${id}"]`)?.click();
    window.requestAnimationFrame(syncDock);
  }

  function syncDock(){
    const active = document.querySelector('.screen.active')?.id || 'home';
    const label = navItems.find(item => item[0] === active)?.[2] || 'Menu';
    const current = document.getElementById('gameDockCurrent');
    if (current) current.textContent = `${label} · Swipe up for menu`;
    document.querySelectorAll('[data-dock-tab]').forEach(button => button.classList.toggle('active', button.dataset.dockTab === active));
  }

  function toggleDock(){ document.getElementById('gameDock')?.classList.contains('open') ? closeDock() : openDock(); }
  function openDock(){ const dock = document.getElementById('gameDock'); dock?.classList.add('open'); dock?.querySelector('#gameDockGrab')?.setAttribute('aria-expanded','true'); }
  function closeDock(){ const dock = document.getElementById('gameDock'); dock?.classList.remove('open'); dock?.querySelector('#gameDockGrab')?.setAttribute('aria-expanded','false'); }

  function setStat(id,value,suffix){
    const target = document.getElementById(`exp-${id}-value`);
    if (target) target.innerHTML = `${value}<small>${suffix}</small>`;
    const bar = document.getElementById(`exp-${id}-bar`);
    if (bar) bar.style.width = `${clamp(value)}%`;
  }

  function currentNpcId(){
    try { return currentScene?.npc || null; } catch { return null; }
  }

  function latestStoryText(){
    const entries = [...document.querySelectorAll('#storyLog *')].map(node => node.textContent?.trim()).filter(Boolean);
    return entries.at(-1) || '';
  }

  function cleanNews(value){
    return value.replace(/^blackwood news:?/i,'').replace(/\s+/g,' ').trim().slice(0,180);
  }

  function readNamedNumber(text,label,fallback){
    const match = String(text || '').match(new RegExp(`${label}\\s*[:\-]?\\s*(\\d{1,3})`,'i'));
    return match ? clamp(Number(match[1])) : fallback;
  }

  function textOf(id){ return document.getElementById(id)?.innerText?.replace(/\s+/g,' ').trim() || ''; }
  function numberOf(id){ const value = Number.parseInt(textOf(id),10); return Number.isFinite(value) ? clamp(value) : 0; }
  function clamp(value){ return Math.max(0,Math.min(100,Number(value) || 0)); }
  function setText(id,value){ const node = document.getElementById(id); if (node && node.textContent !== String(value)) node.textContent = String(value); }
  function escapeHtml(value){ return String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char])); }

  function showToast(text){
    let toast = document.getElementById('artToast');
    if (!toast){
      toast = document.createElement('div');
      toast.id = 'artToast';
      toast.className = 'art-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.classList.add('show');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2400);
  }
})();
