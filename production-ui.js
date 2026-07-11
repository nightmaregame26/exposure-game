(() => {
  'use strict';

  const VERSION = 'production-1';
  const ASSETS = {
    header: `assets/ui/production/home-header.webp?v=${VERSION}`,
    hero: `assets/ui/production/home-hero.webp?v=${VERSION}`,
    news: `assets/ui/production/home-news.webp?v=${VERSION}`,
    clock: `assets/ui/production/home-clock.webp?v=${VERSION}`,
    stamina: `assets/ui/production/home-stamina.webp?v=${VERSION}`,
    exposure: `assets/ui/production/home-exposure.webp?v=${VERSION}`,
    chapter: `assets/ui/production/home-chapter.webp?v=${VERSION}`,
    tasks: `assets/ui/production/home-tasks.webp?v=${VERSION}`,
    events: `assets/ui/production/home-events.webp?v=${VERSION}`,
    nav: `assets/ui/production/home-nav.webp?v=${VERSION}`,
    map: `assets/ui/production/map-full.webp?v=${VERSION}`,
    scene: `assets/ui/production/scene-full.webp?v=${VERSION}`
  };

  const TAB_IDS = ['home','book','map','contacts','phone','suspects','diary','case'];
  let syncTimer = null;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {once:true});
  } else {
    init();
  }

  async function init(){
    buildProductionUi();
    wireObservers();
    await loadAssets();
    document.getElementById('productionUi')?.classList.add('ready');
    syncAll();
    syncTimer = window.setInterval(syncAll, 750);
  }

  function buildProductionUi(){
    if (document.getElementById('productionUi')) return;
    const root = document.createElement('div');
    root.id = 'productionUi';
    root.innerHTML = `
      <div class="game-frame">
        <section id="productionHome" class="production-screen active" aria-label="Exposure home dashboard">
          ${panel('header','home-header',`<div class="dynamic-mask header-fallback"><div class="header-title">EXPOSURE</div><div class="header-sub">Blackwood · The Living Book</div></div>`)}
          ${panel('hero','home-hero',`<div class="dynamic-mask hero-location"><strong>Blackwood</strong>Greywick County<br>Est. 1882</div><button class="panel-button" id="productionEnter" type="button" aria-label="Enter Blackwood"></button>`)}
          ${panel('news','home-news',`<div class="dynamic-mask news-cover"></div><div class="dynamic-content news-content"><div class="eyebrow">Blackwood News</div><b id="productionNewsHeadline">Local teen disappears without a trace</b><span id="productionNewsSummary">No leads. No witnesses. Another name added to the list.</span><small>Read more →</small></div><button class="panel-button" id="productionNews" type="button" aria-label="Read Blackwood News"></button>`)}
          ${panel('clock','home-clock',`<div class="dynamic-mask clock-cover"></div><div class="dynamic-content clock-content"><div class="eyebrow" id="productionDay">Day 1 · Saturday</div><b id="productionTime">--:--</b><span id="productionDate">Greywick County</span><span id="productionWeather">Raining · 9°C</span></div>`)}
          ${panel('stamina','home-stamina',`<div class="dynamic-mask stat-cover"></div><div class="dynamic-content stat-content"><div class="eyebrow">⚡ Stamina</div><b><span id="productionStamina">100</span><small>/100</small></b><div class="meter"><i id="productionStaminaBar"></i></div><small id="productionStaminaNote">Ready</small></div>`)}
          ${panel('exposure','home-exposure',`<div class="dynamic-mask stat-cover"></div><div class="dynamic-content stat-content"><div class="eyebrow">◉ Exposure</div><b class="red"><span id="productionExposure">0</span><small>%</small></b><div class="meter red"><i id="productionExposureBar"></i></div><small>The darker it gets, the closer it gets.</small></div>`)}
          ${panel('chapter','home-chapter',`<div class="dynamic-mask chapter-cover"></div><div class="dynamic-content chapter-content"><div class="eyebrow" id="productionChapterMeta">Current chapter</div><b id="productionChapterTitle">The Road Into Blackwood</b><span id="productionChapterSummary">Every clue becomes part of your living book.</span><small>View chapter →</small></div><button class="panel-button" id="productionChapter" type="button" aria-label="View current chapter"></button>`)}
          ${panel('tasks','home-tasks',`<div class="dynamic-mask tasks-cover"></div><div class="dynamic-content tasks-content"><div class="tasks-head"><div class="eyebrow">Tasks</div><small id="productionTaskCount">0 active</small></div><div class="task-list" id="productionTaskList"></div></div>`)}
          ${panel('events','home-events',`<div class="dynamic-mask events-cover"></div><div class="dynamic-content events-content"><div class="events-head"><div class="eyebrow">◷ Recent Events</div><small>View all</small></div><div class="event-list" id="productionEventList"></div></div><button class="panel-button" id="productionEvents" type="button" aria-label="View recent events"></button>`)}
          ${panel('nav','home-nav',`<div class="dynamic-mask events-cover"></div>${navMarkup('home')}`)}
        </section>

        <section id="productionMap" class="production-screen" aria-label="Blackwood map">
          <div class="full-art-screen" data-full-asset="map"></div>
          ${mapHotspot('house','map-hot-house','Your House')}
          ${mapHotspot('cafe','map-hot-cafe','Café Hollow')}
          ${mapHotspot('forest','map-hot-forest','Blackwood Forest')}
          ${mapHotspot('police','map-hot-police','Police Station')}
          ${mapHotspot('library','map-hot-library','Library')}
          ${mapHotspot('school','map-hot-school','Blackwood High')}
          ${mapHotspot('lake','map-hot-lake','Lake Road')}
          ${navHotspots('map')}
        </section>

        <section id="productionScene" class="production-screen" aria-label="Emily at Café Hollow">
          <div class="full-art-screen" data-full-asset="scene"></div>
          <button class="hotspot scene-choice-0" data-scene-choice="0" type="button" aria-label="Dialogue choice one"></button>
          <button class="hotspot scene-choice-1" data-scene-choice="1" type="button" aria-label="Dialogue choice two"></button>
          <button class="hotspot scene-choice-2" data-scene-choice="2" type="button" aria-label="Dialogue choice three"></button>
          <div class="scene-talk"><textarea id="productionTalk" maxlength="400" placeholder="Say anything to Emily..."></textarea><button id="productionTalkSend" type="button" aria-label="Send message">➤</button></div>
          ${navHotspots('home')}
        </section>

        <div class="loading-screen">Loading Blackwood…</div>
      </div>`;
    document.body.appendChild(root);

    root.querySelector('#productionEnter')?.addEventListener('click', () => showProductionScreen('map'));
    root.querySelector('#productionNews')?.addEventListener('click', () => openNativeTab('book'));
    root.querySelector('#productionChapter')?.addEventListener('click', openBook);
    root.querySelector('#productionEvents')?.addEventListener('click', () => openNativeTab('book'));
    root.querySelectorAll('[data-production-tab]').forEach(button => button.addEventListener('click', () => navigate(button.dataset.productionTab)));
    root.querySelectorAll('[data-map-location]').forEach(button => button.addEventListener('click', () => triggerMapLocation(button.dataset.mapLocation)));
    root.querySelectorAll('[data-scene-choice]').forEach(button => button.addEventListener('click', () => triggerSceneChoice(Number(button.dataset.sceneChoice))));
    root.querySelector('#productionTalkSend')?.addEventListener('click', sendFreeTalk);
    root.querySelector('#productionTalk')?.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendFreeTalk();
      }
    });
  }

  function panel(asset,className,content){
    return `<article class="asset-panel ${className}" data-panel-asset="${asset}">${content}</article>`;
  }

  function navMarkup(active){
    return `<nav class="bottom-nav">${TAB_IDS.map(id => `<button type="button" data-production-tab="${id}" class="${id===active?'active':''}"><span class="icon">${navIcon(id)}</span><span class="label">${navLabel(id)}</span></button>`).join('')}</nav>`;
  }

  function navHotspots(active){
    return TAB_IDS.map((id,index) => `<button type="button" class="hotspot map-hot-nav" data-production-tab="${id}" aria-label="${navLabel(id)}" style="left:${index*12.5}%;width:12.5%"></button>`).join('');
  }

  function mapHotspot(id,className,label){
    return `<button type="button" class="hotspot ${className}" data-map-location="${id}" aria-label="${label}"></button>`;
  }

  function navIcon(id){
    return ({home:'⌂',book:'▥',map:'⌖',contacts:'♟',phone:'☎',suspects:'♜',diary:'▤',case:'▣'})[id] || '•';
  }

  function navLabel(id){
    return ({home:'Home',book:'Book',map:'Map',contacts:'People',phone:'Phone',suspects:'Suspects',diary:'Notes',case:'Case'})[id] || id;
  }

  async function loadAssets(){
    const jobs = [];
    document.querySelectorAll('[data-panel-asset]').forEach(panel => {
      jobs.push(applyBackground(panel,ASSETS[panel.dataset.panelAsset]));
    });
    document.querySelectorAll('[data-full-asset]').forEach(panel => {
      jobs.push(applyBackground(panel,ASSETS[panel.dataset.fullAsset]));
    });
    await Promise.allSettled(jobs);
  }

  function applyBackground(element,url){
    return new Promise(resolve => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => {
        element.style.setProperty('--asset',`url("${url}")`);
        element.style.backgroundImage = `url("${url}")`;
        element.classList.remove('asset-missing');
        resolve(true);
      };
      image.onerror = () => {
        element.classList.add('asset-missing');
        resolve(false);
      };
      image.src = url;
    });
  }

  function syncAll(){
    syncClock();
    syncStats();
    syncNews();
    syncChapter();
    syncTasks();
    syncEvents();
    syncViewState();
  }

  function syncClock(){
    const now = new Date();
    setText('productionTime',textOf('time') || now.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}));
    const date = textOf('dateDisplay') || now.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'});
    setText('productionDate',`${date} · Greywick County`);
    const day = textOf('day');
    setText('productionDay',`${day ? `Day ${day} · ` : ''}${now.toLocaleDateString(undefined,{weekday:'long'})}`);
    setText('productionWeather',textOf('periodDisplay') || 'Raining · 9°C');
  }

  function syncStats(){
    const stamina = numberOf('stamina',100);
    const exposure = numberOf('exposure',0);
    setText('productionStamina',stamina);
    setText('productionExposure',exposure);
    setWidth('productionStaminaBar',stamina);
    setWidth('productionExposureBar',exposure);
  }

  function syncNews(){
    const value = textOf('news');
    if (!value) return;
    const cleaned = value.replace(/^Blackwood News\s*:?\s*/i,'').trim();
    setText('productionNewsHeadline',cleaned.slice(0,120));
  }

  function syncChapter(){
    setText('productionChapterTitle',textOf('currentChapterTitle') || 'The Road Into Blackwood');
    setText('productionChapterMeta',textOf('currentChapterMeta') || 'Current chapter');
    const summary = textOf('recentMemoryText');
    if (summary) setText('productionChapterSummary',summary.slice(0,120));
  }

  function syncTasks(){
    const source = [...document.querySelectorAll('#tasks button')];
    const list = document.getElementById('productionTaskList');
    if (!list) return;
    setText('productionTaskCount',`${source.filter(button=>!button.disabled).length} active`);
    const signature = source.slice(0,3).map(button=>`${button.textContent}|${button.disabled}`).join('~');
    if (list.dataset.signature === signature) return;
    list.dataset.signature = signature;
    list.innerHTML = '';
    source.slice(0,3).forEach(button => {
      const item = document.createElement('button');
      item.type = 'button';
      item.disabled = button.disabled;
      item.innerHTML = `<span><strong>${escapeHtml(button.textContent.replace(/\s+/g,' ').trim())}</strong><small>${button.disabled?'Unavailable at this time.':'Open investigation task.'}</small></span><em>›</em>`;
      item.addEventListener('click',()=>button.click());
      list.appendChild(item);
    });
  }

  function syncEvents(){
    const list = document.getElementById('productionEventList');
    if (!list) return;
    let events = [...document.querySelectorAll('#storyLog > *')].map(node=>node.textContent.replace(/\s+/g,' ').trim()).filter(Boolean).slice(-3).reverse();
    if (!events.length) events = [textOf('recentMemoryText') || 'You arrived in Blackwood. The town has already begun to remember you.'];
    const signature = events.join('~');
    if (list.dataset.signature === signature) return;
    list.dataset.signature = signature;
    list.innerHTML = events.map((event,index)=>`<div class="event-row"><time>${index===0?'NOW':'RECENT'}</time><span>${escapeHtml(event.slice(0,150))}</span></div>`).join('');
  }

  function syncViewState(){
    const bookOpen = isOpen('legacyBook');
    const sceneOpen = isOpen('legacyScene');
    if (bookOpen) {
      document.body.classList.add('native-mode','native-book');
      return;
    }
    document.body.classList.remove('native-book');
    if (sceneOpen && sceneLooksLikeEmily()) {
      document.body.classList.remove('native-mode','native-scene');
      showProductionScreen('scene');
      return;
    }
    if (sceneOpen) {
      document.body.classList.add('native-mode','native-scene');
      return;
    }
    document.body.classList.remove('native-scene');
  }

  function navigate(id){
    if (id === 'home' || id === 'map') {
      closeLegacyOverlays();
      document.body.classList.remove('native-mode','native-scene','native-book');
      showProductionScreen(id);
      return;
    }
    openNativeTab(id);
  }

  function showProductionScreen(id){
    document.querySelectorAll('.production-screen').forEach(screen=>screen.classList.toggle('active',screen.id === `production${capitalize(id)}`));
  }

  function openNativeTab(id){
    closeLegacyOverlays();
    document.querySelector(`#legacyTabs button[data-tab="${id}"]`)?.click();
    document.body.classList.add('native-mode');
  }

  function openBook(){
    document.getElementById('viewMemoryBtn')?.click();
    window.setTimeout(()=>{
      if (!isOpen('legacyBook')) openNativeTab('book');
    },20);
  }

  function triggerMapLocation(id){
    const aliases = {
      house:['Rest at home'],
      cafe:['Meet Emily','Café Hollow'],
      forest:['Blackwood Forest'],
      police:['Detective Mason','Police Station'],
      library:['Library research','Library'],
      school:["Noah's house",'Noah'],
      lake:['Lake Road','anonymous']
    };
    const buttons = [...document.querySelectorAll('#tasks button')];
    const target = buttons.find(button => aliases[id]?.some(needle=>button.textContent.toLowerCase().includes(needle.toLowerCase())));
    if (!target) return;
    if (!target.disabled) target.click();
  }

  function triggerSceneChoice(index){
    const button = [...document.querySelectorAll('#sceneChoices button')][index];
    if (button && !button.disabled) button.click();
  }

  function sendFreeTalk(){
    const input = document.getElementById('productionTalk');
    const hidden = document.getElementById('freeTalk');
    const send = document.getElementById('sendTalkBtn');
    const value = input?.value.trim();
    if (!value || !hidden || !send) return;
    hidden.value = value;
    input.value = '';
    send.click();
  }

  function wireObservers(){
    const observer = new MutationObserver(syncAll);
    document.querySelectorAll('.screen,#legacyScene,#legacyBook,#tasks,#storyLog').forEach(node=>observer.observe(node,{childList:true,subtree:true,attributes:true,characterData:true}));
  }

  function sceneLooksLikeEmily(){
    const text = `${textOf('sceneTitle')} ${textOf('sceneLocation')}`.toLowerCase();
    try { if (typeof currentScene !== 'undefined' && currentScene?.npc === 'emily_hart') return true; } catch {}
    return text.includes('emily') || text.includes('café hollow') || text.includes('cafe hollow');
  }

  function closeLegacyOverlays(){
    document.getElementById('leaveSceneBtn')?.click();
    document.getElementById('legacyScene')?.classList.add('hidden');
    document.getElementById('bookCloseBtn')?.click();
    document.getElementById('legacyBook')?.classList.add('hidden');
  }

  function isOpen(id){
    const node = document.getElementById(id);
    return Boolean(node && !node.classList.contains('hidden'));
  }

  function textOf(id){return document.getElementById(id)?.textContent?.replace(/\s+/g,' ').trim() || ''}
  function numberOf(id,fallback){const value=Number.parseInt(textOf(id),10);return Number.isFinite(value)?Math.max(0,Math.min(100,value)):fallback}
  function setText(id,value){const node=document.getElementById(id);if(node&&node.textContent!==String(value))node.textContent=String(value)}
  function setWidth(id,value){const node=document.getElementById(id);if(node)node.style.width=`${Math.max(0,Math.min(100,value))}%`}
  function capitalize(value){return value.charAt(0).toUpperCase()+value.slice(1)}
  function escapeHtml(value){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]))}

  window.addEventListener('beforeunload',()=>{if(syncTimer)window.clearInterval(syncTimer)});
})();
