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

  const taskLabels = {
    emily:'Meet Emily at Café Hollow',
    library:'Library research',
    mason:'Visit Detective Mason',
    forest:'Search Blackwood Forest',
    anonymous:'Follow anonymous text',
    noah:"Visit Noah's house",
    rest:'Rest at home'
  };

  let lastSceneHtml='';
  let dockStartY=0;
  let dockDragging=false;
  let dockMoved=false;

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();

  function init(){
    document.body.classList.add('approved-art-ui');
    document.body.classList.remove('native-ui-ready');
    buildHome();
    buildMap();
    buildEmily();
    buildDock();
    observeScene();
    syncAll();
    setInterval(syncAll,300);
  }

  function buildHome(){
    const screen=document.getElementById('home');
    if(!screen||document.getElementById('approvedHome'))return;
    wrapLegacy(screen);

    const canvas=document.createElement('div');
    canvas.id='approvedHome';
    canvas.className='approved-canvas approved-home';
    canvas.innerHTML=`
      <div class="art-location-patch"><strong>Blackwood</strong>Greywick County<br>Est. 1882</div>
      <div class="art-time-patch"><strong id="artHomeTime">--:--</strong><span id="artHomeDate">Living time · Greywick County</span></div>
      <div class="art-stat-patch stamina"><strong id="artStamina">0</strong><small>/100</small></div>
      <div class="art-stat-patch exposure"><strong id="artExposure">0</strong><small>%</small></div>
    `;

    addHit(canvas,66.2,32.6,29.2,4.8,'Enter Blackwood',()=>openTab('map'));
    addHit(canvas,4.4,37.5,45.7,12.2,'Read Blackwood News',()=>openTab('book'));
    addHit(canvas,4.4,61.1,45.5,14.2,'Open current chapter',()=>openTab('book'));
    addHit(canvas,51.1,63.5,44.2,3.8,'Open first task',()=>triggerTaskByIndex(0));
    addHit(canvas,51.1,67.4,44.2,3.8,'Open second task',()=>triggerTaskByIndex(1));
    addHit(canvas,51.1,71.2,44.2,3.8,'Open third task',()=>triggerTaskByIndex(2));
    addHit(canvas,4.2,76.3,91.5,14.2,'Open recent memories',()=>openTab('book'));
    screen.appendChild(canvas);
  }

  function buildMap(){
    const screen=document.getElementById('map');
    if(!screen||document.getElementById('approvedMap'))return;
    wrapLegacy(screen);

    const canvas=document.createElement('div');
    canvas.id='approvedMap';
    canvas.className='approved-canvas approved-map';
    canvas.innerHTML=`<div class="art-location-patch"><strong>Blackwood</strong>Greywick County<br>Est. 1882</div>`;

    const locations=[
      [24,27,23,10,'Your House','rest'],
      [35,33,27,10,'Café Hollow','emily'],
      [11,42,28,10,'Police Station','mason'],
      [39,52,23,11,'Library','library'],
      [4,27,22,15,'Blackwood Forest','forest'],
      [68,27,29,17,'Lake Road','anonymous'],
      [40,15,22,11,'Water Tower',null],
      [69,18,27,14,'Sawmill',null],
      [67,40,28,13,'Old Church',null],
      [59,48,30,14,'Hospital',null],
      [39,58,27,12,'Cemetery',null]
    ];

    locations.forEach(([x,y,w,h,label,task])=>addHit(canvas,x,y,w,h,label,()=>{
      if(task)triggerTask(task);
      else showToast(`${label} is still locked.`);
    }));
    addHit(canvas,61.5,82.1,32.7,5.4,'Area intelligence',()=>showToast('Select an available Blackwood location to investigate.'));
    screen.appendChild(canvas);
  }

  function buildEmily(){
    const scene=document.querySelector('#sceneOverlay .scene');
    if(!scene||document.getElementById('approvedEmily'))return;

    const canvas=document.createElement('div');
    canvas.id='approvedEmily';
    canvas.className='approved-canvas approved-scene';
    canvas.innerHTML=`
      <div id="artLiveReply" class="art-live-reply"></div>
      <textarea id="artTalkInput" class="art-talk-input" maxlength="400" placeholder="Say anything to Emily..."></textarea>
      <button id="artTalkSend" class="art-talk-send" type="button" aria-label="Send message">➤</button>
    `;

    addHit(canvas,5.1,73.6,89.7,3.7,'First dialogue response',()=>chooseScene(0));
    addHit(canvas,5.1,77.5,89.7,3.7,'Second dialogue response',()=>chooseScene(1));
    addHit(canvas,5.1,81.4,89.7,3.7,'Third dialogue response',()=>chooseScene(2));
    addHit(canvas,88.6,1.4,8.2,6.5,'Close scene',closeScene);

    canvas.querySelector('#artTalkSend').addEventListener('click',sendTalk);
    canvas.querySelector('#artTalkInput').addEventListener('keydown',event=>{
      if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendTalk();}
    });
    scene.insertBefore(canvas,scene.firstChild);
  }

  function wrapLegacy(screen){
    const legacy=document.createElement('div');
    legacy.className='exact-legacy';
    while(screen.firstChild)legacy.appendChild(screen.firstChild);
    screen.appendChild(legacy);
  }

  function addHit(parent,x,y,w,h,label,handler){
    const button=document.createElement('button');
    button.type='button';
    button.className='art-hit';
    button.setAttribute('aria-label',label);
    Object.assign(button.style,{left:`${x}%`,top:`${y}%`,width:`${w}%`,height:`${h}%`});
    button.addEventListener('click',handler);
    parent.appendChild(button);
    return button;
  }

  function buildDock(){
    if(document.getElementById('gameDock'))return;
    const dock=document.createElement('aside');
    dock.id='gameDock';
    dock.className='game-dock';
    dock.setAttribute('aria-label','Game navigation');
    dock.innerHTML=`
      <button id="gameDockGrab" class="game-dock-grab" type="button" aria-expanded="false">
        <span class="game-dock-handle"></span>
        <span id="gameDockCurrent" class="game-dock-current">Home · Swipe up for menu</span>
        <span class="game-dock-chevron">⌃</span>
      </button>
      <div class="game-dock-grid">
        ${navItems.map(([id,icon,label])=>`<button class="game-dock-item" data-dock-tab="${id}" type="button"><span>${icon}</span>${label}</button>`).join('')}
      </div>
    `;
    document.body.appendChild(dock);

    const grab=dock.querySelector('#gameDockGrab');
    grab.addEventListener('click',()=>{
      if(dockMoved){dockMoved=false;return;}
      toggleDock();
    });
    dock.querySelectorAll('[data-dock-tab]').forEach(button=>button.addEventListener('click',()=>{
      if(document.body.classList.contains('approved-emily-active'))closeScene();
      openTab(button.dataset.dockTab);
      closeDock();
    }));

    dock.addEventListener('pointerdown',event=>{
      dockStartY=event.clientY;
      dockDragging=true;
      dockMoved=false;
      dock.setPointerCapture?.(event.pointerId);
    });
    dock.addEventListener('pointermove',event=>{
      if(dockDragging&&Math.abs(event.clientY-dockStartY)>8)dockMoved=true;
    });
    dock.addEventListener('pointerup',event=>{
      if(!dockDragging)return;
      dockDragging=false;
      const delta=event.clientY-dockStartY;
      if(delta<-34){dockMoved=true;openDock();}
      if(delta>34){dockMoved=true;closeDock();}
      setTimeout(()=>{dockMoved=false;},220);
    });
    dock.addEventListener('pointercancel',()=>{dockDragging=false;dockMoved=false;});
  }

  function syncAll(){
    syncHome();
    syncScene();
    syncDock();
  }

  function syncHome(){
    const time=textOf('time')||new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    const date=textOf('dateDisplay')||new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'});
    setText('artHomeTime',time);
    setText('artHomeDate',`${date} · Greywick County`);
    setText('artStamina',numberOf('stamina'));
    setText('artExposure',numberOf('exposure'));
  }

  function syncScene(){
    const overlay=document.getElementById('sceneOverlay');
    const sceneOpen=overlay&&!overlay.classList.contains('hidden');
    const emilyOpen=sceneOpen&&currentNpcId()==='emily_hart';
    document.body.classList.toggle('approved-emily-active',emilyOpen);
    if(emilyOpen)updateSceneReply();
  }

  function observeScene(){
    const source=document.getElementById('sceneText');
    if(source)new MutationObserver(updateSceneReply).observe(source,{childList:true,subtree:true,characterData:true});
  }

  function updateSceneReply(){
    const source=document.getElementById('sceneText');
    const target=document.getElementById('artLiveReply');
    if(!source||!target||source.innerHTML===lastSceneHtml)return;
    lastSceneHtml=source.innerHTML;
    const full=source.innerText.replace(/\s+/g,' ').trim();
    if(!full)return;
    const latest=full.split('You:').pop().trim();
    target.innerHTML=`<b>Live conversation</b>${escapeHtml(latest.slice(-300))}`;
    target.classList.add('show');
  }

  function chooseScene(index){
    const button=document.querySelectorAll('#sceneChoices button')[index];
    if(!button){showToast('That response is no longer available.');return;}
    button.click();
    setTimeout(updateSceneReply,70);
  }

  function sendTalk(){
    const visible=document.getElementById('artTalkInput');
    const hidden=document.getElementById('freeTalk');
    const send=document.getElementById('sendTalkBtn');
    const value=visible?.value.trim();
    if(!value||!hidden||!send)return;
    hidden.value=value;
    visible.value='';
    send.click();
    setTimeout(updateSceneReply,150);
  }

  function triggerTaskByIndex(index){
    const button=document.querySelectorAll('#tasks button')[index];
    if(!button){showToast('That chapter is not available yet.');return;}
    if(button.disabled){showToast('That task cannot be completed at this time.');return;}
    button.click();
  }

  function triggerTask(key){
    const label=taskLabels[key];
    const button=[...document.querySelectorAll('#tasks button')].find(item=>item.textContent.includes(label));
    if(!button){showToast('That investigation is not available yet.');return;}
    if(button.disabled){showToast('That task is unavailable right now. Check the Phone, appointment time or Stamina.');return;}
    button.click();
  }

  function closeScene(){
    document.getElementById('leaveSceneBtn')?.click();
    document.getElementById('sceneOverlay')?.classList.add('hidden');
    document.body.classList.remove('approved-emily-active');
  }

  function openTab(id){
    document.querySelector(`nav.tabs button[data-tab="${id}"]`)?.click();
    requestAnimationFrame(syncDock);
  }

  function syncDock(){
    const active=document.querySelector('.screen.active')?.id||'home';
    const label=navItems.find(item=>item[0]===active)?.[2]||'Menu';
    const current=document.getElementById('gameDockCurrent');
    if(current)current.textContent=`${label} · Swipe up for menu`;
    document.querySelectorAll('[data-dock-tab]').forEach(button=>button.classList.toggle('active',button.dataset.dockTab===active));
  }

  function toggleDock(){document.getElementById('gameDock')?.classList.contains('open')?closeDock():openDock();}
  function openDock(){const dock=document.getElementById('gameDock');dock?.classList.add('open');dock?.querySelector('#gameDockGrab')?.setAttribute('aria-expanded','true');}
  function closeDock(){const dock=document.getElementById('gameDock');dock?.classList.remove('open');dock?.querySelector('#gameDockGrab')?.setAttribute('aria-expanded','false');}

  function currentNpcId(){try{return currentScene?.npc||null;}catch{return null;}}
  function textOf(id){return document.getElementById(id)?.innerText?.replace(/\s+/g,' ').trim()||'';}
  function numberOf(id){const value=Number.parseInt(textOf(id),10);return Number.isFinite(value)?Math.max(0,Math.min(100,value)):0;}
  function setText(id,value){const node=document.getElementById(id);if(node&&node.textContent!==String(value))node.textContent=String(value);}
  function escapeHtml(value){return String(value||'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));}
  function showToast(text){
    let toast=document.getElementById('artToast');
    if(!toast){toast=document.createElement('div');toast.id='artToast';toast.className='art-toast';document.body.appendChild(toast);}
    toast.textContent=text;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer=setTimeout(()=>toast.classList.remove('show'),2400);
  }
})();