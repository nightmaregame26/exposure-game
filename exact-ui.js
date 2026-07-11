(() => {
  'use strict';

  const VERSION = 'exact-12';
  const screens = ['home','map','scene'];
  const tabOrder = ['home','book','map','contacts','phone','suspects','diary','case'];
  let selectedMapLocation = 'house';
  let syncTimer = null;

  const assetSets = {
    home:[0,1,2,3].map(i => `assets/mockups/home-${i}.svg?v=${VERSION}`),
    map:[0,1,2,3].map(i => `assets/mockups/map-${i}.svg?v=${VERSION}`),
    scene:[0,1,2,3].map(i => `assets/mockups/scene-${i}.svg?v=${VERSION}`)
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {once:true});
  } else {
    init();
  }

  function init(){
    document.body.classList.add('exact-ui-active');
    buildExactUi();
    wireObservers();
    syncView();
    syncTimer = window.setInterval(syncView, 350);
  }

  function buildExactUi(){
    if (document.getElementById('exactUi')) return;

    const root = document.createElement('div');
    root.id = 'exactUi';
    root.setAttribute('aria-label','Exposure game interface');
    root.innerHTML = `
      ${stageMarkup('home')}
      ${stageMarkup('map')}
      ${stageMarkup('scene')}
      <div id="exactToast" class="exact-toast" role="status" aria-live="polite"></div>`;
    document.body.appendChild(root);

    buildHomeControls();
    buildMapControls();
    buildSceneControls();
    root.querySelectorAll('.exact-stage').forEach(stage => loadStageAssets(stage));
  }

  function stageMarkup(name){
    return `
      <section id="exact-${name}" class="exact-stage" data-exact-screen="${name}" ${name === 'home' ? '' : 'hidden'}>
        <div class="exact-art" aria-hidden="true">
          ${assetSets[name].map((src,index) => `<img data-slice="${index}" alt="" decoding="async" fetchpriority="high" draggable="false" data-src="${src}">`).join('')}
        </div>
        <div class="exact-loading">Loading Blackwood…</div>
        <div class="exact-error">The interface artwork could not be loaded. Reload the page to retry.</div>
      </section>`;
  }

  function loadStageAssets(stage){
    const art = stage.querySelector('.exact-art');
    const images = [...art.querySelectorAll('img')];
    let loaded = 0;
    let failed = false;

    images.forEach((img,index) => {
      const source = img.dataset.src;
      img.addEventListener('load', () => {
        loaded += 1;
        if (loaded === images.length && !failed) art.classList.add('ready');
      }, {once:true});
      img.addEventListener('error', () => {
        if (img.dataset.retried === '1') {
          failed = true;
          stage.classList.add('asset-error');
          img.removeAttribute('src');
          return;
        }
        img.dataset.retried = '1';
        window.setTimeout(() => {
          img.src = `${source}&retry=${Date.now()}-${index}`;
        }, 180);
      }, {once:false});
      img.src = source;
    });
  }

  function buildHomeControls(){
    const stage = getStage('home');
    if (!stage) return;

    stage.insertAdjacentHTML('beforeend', `
      <div class="exact-live-block exact-county-mask"><strong>Blackwood</strong>Greywick County<br>Est. 1882</div>
      ${hit('enter-town','Enter Blackwood')}
      ${hit('news','Read Blackwood News')}
      ${hit('chapter','Open current chapter')}
      ${hit('task-0','Open first task')}
      ${hit('task-1','Open second task')}
      ${hit('task-2','Open third task')}
      ${hit('all-tasks','View all tasks')}
      ${hit('recent-events','Open recent events')}
      ${hit('settings','Reset investigation')}
      ${navHits()}`);

    onAction(stage,'enter-town',() => openTab('map'));
    onAction(stage,'news',() => openTab('book'));
    onAction(stage,'chapter',() => document.getElementById('viewMemoryBtn')?.click() || openTab('book'));
    onAction(stage,'task-0',() => triggerTaskByIndex(0));
    onAction(stage,'task-1',() => triggerTaskByIndex(1));
    onAction(stage,'task-2',() => triggerTaskByIndex(2));
    onAction(stage,'all-tasks',() => showToast('Tap one of the three active tasks above.'));
    onAction(stage,'recent-events',() => openTab('book'));
    onAction(stage,'settings',() => document.getElementById('resetBtn')?.click());
    wireNav(stage);
  }

  function buildMapControls(){
    const stage = getStage('map');
    if (!stage) return;

    stage.insertAdjacentHTML('beforeend', `
      <div class="exact-live-block exact-county-mask"><strong>Blackwood</strong>Greywick County<br>Est. 1882</div>
      ${locationHit('forest','Blackwood Forest')}
      ${locationHit('house','Your House')}
      ${locationHit('cafe','Café Hollow')}
      ${locationHit('water','Water Tower')}
      ${locationHit('sawmill','Sawmill')}
      ${locationHit('lake','Lake Road')}
      ${locationHit('police','Police Station')}
      ${locationHit('townhall','Town Hall')}
      ${locationHit('church','Old Church')}
      ${locationHit('school','Blackwood High')}
      ${locationHit('library','Library')}
      ${locationHit('hospital','Hospital')}
      ${locationHit('cemetery','Cemetery')}
      ${hit('area-intel','Open area intelligence')}
      ${hit('map-objective','Open current objective')}
      ${navHits()}`);

    stage.querySelectorAll('[data-location]').forEach(button => {
      button.addEventListener('click', () => selectLocation(button.dataset.location));
    });
    onAction(stage,'area-intel',() => openSelectedLocation());
    onAction(stage,'map-objective',() => triggerTaskByIndex(1));
    wireNav(stage);
  }

  function buildSceneControls(){
    const stage = getStage('scene');
    if (!stage) return;

    stage.insertAdjacentHTML('beforeend', `
      ${choiceHit(0)}
      ${choiceHit(1)}
      ${choiceHit(2)}
      <div class="exact-talk">
        <textarea id="exactTalkInput" maxlength="400" aria-label="Say anything to Emily" placeholder="Say anything to Emily..."></textarea>
        <button id="exactTalkSend" type="button" aria-label="Send message">➤</button>
      </div>
      ${navHits()}`);

    stage.querySelectorAll('[data-choice]').forEach(button => {
      button.addEventListener('click', () => triggerSceneChoice(Number(button.dataset.choice)));
    });
    stage.querySelector('#exactTalkSend')?.addEventListener('click', sendFreeTalk);
    stage.querySelector('#exactTalkInput')?.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendFreeTalk();
      }
    });
    wireNav(stage);
  }

  function hit(action,label){
    return `<button class="exact-hit" type="button" data-action="${action}" aria-label="${escapeHtml(label)}"></button>`;
  }

  function locationHit(location,label){
    return `<button class="exact-hit" type="button" data-location="${location}" aria-label="${escapeHtml(label)}"></button>`;
  }

  function choiceHit(index){
    return `<button class="exact-hit" type="button" data-choice="${index}" aria-label="Dialogue choice ${index + 1}"></button>`;
  }

  function navHits(){
    return tabOrder.map(tab => `<button class="exact-hit exact-nav-hit" type="button" data-tab-hit="${tab}" aria-label="Open ${tab}"></button>`).join('');
  }

  function onAction(stage,action,handler){
    stage.querySelector(`[data-action="${action}"]`)?.addEventListener('click',handler);
  }

  function wireNav(stage){
    stage.querySelectorAll('[data-tab-hit]').forEach(button => {
      button.addEventListener('click', () => {
        if (isSceneOpen()) closeScene();
        openTab(button.dataset.tabHit);
      });
    });
  }

  function selectLocation(location){
    selectedMapLocation = location;
    const locked = new Set(['water','sawmill','townhall','church','hospital','cemetery']);
    if (locked.has(location)) {
      showToast(`${locationName(location)} is still locked.`);
      return;
    }
    openSelectedLocation();
  }

  function openSelectedLocation(){
    const taskMap = {
      house:['Rest at home'],
      cafe:['Meet Emily','Café Hollow'],
      forest:['Blackwood Forest'],
      lake:['anonymous','Lake Road'],
      police:['Detective Mason','Police Station'],
      school:["Noah's house",'Noah'],
      library:['Library research','Library']
    };
    const needles = taskMap[selectedMapLocation];
    if (!needles) {
      showToast(`${locationName(selectedMapLocation)} is not available yet.`);
      return;
    }
    triggerTaskByText(needles);
  }

  function triggerTaskByIndex(index){
    const buttons = [...document.querySelectorAll('#tasks button')];
    const button = buttons[index];
    if (!button) {
      showToast('That task is not available right now.');
      return;
    }
    if (button.disabled) {
      showToast('That task is unavailable at the current time.');
      return;
    }
    button.click();
    window.setTimeout(syncView,40);
  }

  function triggerTaskByText(needles){
    const buttons = [...document.querySelectorAll('#tasks button')];
    const list = Array.isArray(needles) ? needles : [needles];
    const button = buttons.find(item => list.some(needle => item.textContent.toLowerCase().includes(String(needle).toLowerCase())));
    if (!button) {
      showToast('That investigation is not available yet.');
      return;
    }
    if (button.disabled) {
      showToast('That investigation cannot be started at this time.');
      return;
    }
    button.click();
    window.setTimeout(syncView,40);
  }

  function triggerSceneChoice(index){
    const button = [...document.querySelectorAll('#sceneChoices button')][index];
    if (!button) {
      showToast('That response is no longer available.');
      return;
    }
    if (button.disabled) {
      showToast('Emily will not answer that right now.');
      return;
    }
    button.click();
  }

  function sendFreeTalk(){
    const visible = document.getElementById('exactTalkInput');
    const hidden = document.getElementById('freeTalk');
    const send = document.getElementById('sendTalkBtn');
    const value = visible?.value.trim();
    if (!value || !hidden || !send) return;
    hidden.value = value;
    visible.value = '';
    send.click();
  }

  function openTab(tab){
    const original = document.querySelector(`nav.tabs button[data-tab="${tab}"]`);
    if (!original) return;
    original.click();
    window.setTimeout(syncView,20);
  }

  function closeScene(){
    document.getElementById('leaveSceneBtn')?.click();
    document.getElementById('sceneOverlay')?.classList.add('hidden');
  }

  function wireObservers(){
    const observer = new MutationObserver(syncView);
    document.querySelectorAll('.screen,#sceneOverlay,#bookOverlay').forEach(node => {
      observer.observe(node,{attributes:true,attributeFilter:['class']});
    });
    const taskList = document.getElementById('tasks');
    if (taskList) observer.observe(taskList,{childList:true,subtree:true,attributes:true});
  }

  function syncView(){
    const bookOpen = !document.getElementById('bookOverlay')?.classList.contains('hidden');
    const sceneOpen = isSceneOpen();
    const emilyScene = sceneOpen && currentNpcId() === 'emily_hart';
    const activeTab = document.querySelector('.screen.active')?.id || 'home';

    if (bookOpen) {
      enterNativeMode();
      return;
    }

    if (emilyScene) {
      leaveNativeMode();
      showExactStage('scene');
      syncChoiceAvailability();
      return;
    }

    if (sceneOpen) {
      enterNativeMode(true);
      return;
    }

    if (activeTab === 'home' || activeTab === 'map') {
      leaveNativeMode();
      showExactStage(activeTab);
      return;
    }

    enterNativeMode();
  }

  function showExactStage(name){
    screens.forEach(screen => {
      const stage = getStage(screen);
      if (stage) stage.hidden = screen !== name;
    });
  }

  function enterNativeMode(sceneMode=false){
    document.body.classList.add('exact-native-mode');
    document.getElementById('exactUi')?.setAttribute('aria-hidden','true');
    if (sceneMode) document.body.classList.add('exact-native-scene');
    else document.body.classList.remove('exact-native-scene');
  }

  function leaveNativeMode(){
    document.body.classList.remove('exact-native-mode','exact-native-scene');
    document.getElementById('exactUi')?.removeAttribute('aria-hidden');
  }

  function syncChoiceAvailability(){
    const visible = getStage('scene');
    const originals = [...document.querySelectorAll('#sceneChoices button')];
    visible?.querySelectorAll('[data-choice]').forEach(button => {
      const original = originals[Number(button.dataset.choice)];
      button.disabled = !original || original.disabled;
    });
  }

  function isSceneOpen(){
    const overlay = document.getElementById('sceneOverlay');
    return Boolean(overlay && !overlay.classList.contains('hidden'));
  }

  function currentNpcId(){
    try {
      return currentScene?.npc || null;
    } catch {
      return null;
    }
  }

  function getStage(name){
    return document.getElementById(`exact-${name}`);
  }

  function locationName(location){
    return ({
      forest:'Blackwood Forest',house:'Your House',cafe:'Café Hollow',water:'Water Tower',
      sawmill:'Sawmill',lake:'Lake Road',police:'Police Station',townhall:'Town Hall',
      church:'Old Church',school:'Blackwood High',library:'Library',hospital:'Hospital',cemetery:'Cemetery'
    })[location] || 'This location';
  }

  function showToast(message){
    const toast = document.getElementById('exactToast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('show'),2200);
  }

  function escapeHtml(value){
    return String(value).replace(/[&<>"']/g,char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  }

  window.addEventListener('beforeunload',() => {
    if (syncTimer) window.clearInterval(syncTimer);
  });
})();
