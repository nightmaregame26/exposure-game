(() => {
  'use strict';

  const taskLabels = {
    emily: 'Meet Emily at Café Hollow',
    library: 'Library research',
    mason: 'Visit Detective Mason',
    forest: 'Search Blackwood Forest',
    anonymous: 'Follow anonymous text',
    noah: "Visit Noah's house",
    rest: 'Rest at home'
  };

  const navIds = ['home','book','map','contacts','phone','suspects','diary','case'];
  let lastSceneHtml = '';

  boot();

  async function boot(){
    try{
      await loadScript('assets/mockup-data/home-1.js?v=approved-images-3');
      await loadScript('assets/mockup-data/home-2.js?v=approved-images-3');
    }catch(error){
      console.warn('Approved home artwork could not be preloaded.', error);
    }
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
    else init();
  }

  function loadScript(src){
    return new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src=src;
      script.onload=resolve;
      script.onerror=reject;
      document.head.appendChild(script);
    });
  }

  function init(){
    buildHome();
    buildMap();
    buildEmilyScene();
    observeDialogue();
    syncMode();
    setInterval(syncMode,250);
  }

  function buildHome(){
    const screen=document.getElementById('home');
    if(!screen||document.getElementById('exactHome')) return;
    wrapLegacy(screen);
    const stage=makeStage('exactHome','home');
    addHit(stage,68.5,31.1,25.5,4.5,'Enter Blackwood',()=>openTab('map'));
    addHit(stage,4.0,61.0,45.5,14.3,'Open current chapter',()=>openTab('book'));
    addHit(stage,51.0,64.0,44.0,3.6,'Visit Blackwood Library',()=>triggerTask('library'));
    addHit(stage,51.0,67.8,44.0,3.6,'Meet Emily at Café Hollow',()=>triggerTask('emily'));
    addHit(stage,51.0,71.6,44.0,3.7,'Visit Detective Mason',()=>triggerTask('mason'));
    addHit(stage,4.0,76.2,92.0,14.8,'Open recent memories',()=>openTab('book'));
    addNavigation(stage,'home');
    screen.appendChild(stage);
  }

  function buildMap(){
    const screen=document.getElementById('map');
    if(!screen||document.getElementById('exactMap')) return;
    wrapLegacy(screen);
    const stage=makeStage('exactMap','map');
    const locations=[
      [43,20,13,8,'Water Tower',null],
      [70,24,22,10,'Sawmill',null],
      [24,28,21,10,'Your House','rest'],
      [7,31,21,10,'Blackwood Forest','forest'],
      [36,34,24,10,'Café Hollow','emily'],
      [72,31,24,12,'Lake Road','anonymous'],
      [16,43,23,10,'Police Station','mason'],
      [41,43,19,10,'Town Hall',null],
      [70,44,24,10,'Old Church',null],
      [24,51,25,10,'Blackwood High',null],
      [42,55,18,10,'Library','library'],
      [62,52,22,11,'Hospital',null],
      [44,61,19,9,'Cemetery',null]
    ];
    locations.forEach(([x,y,w,h,label,task])=>addHit(stage,x,y,w,h,label,()=>task?triggerTask(task):showToast(`${label} is not available yet.`)));
    addHit(stage,64,82.2,30,5.2,'Area Intel',()=>showToast('Select a location marker to investigate.'));
    addNavigation(stage,'map');
    screen.appendChild(stage);
  }

  function buildEmilyScene(){
    const scene=document.querySelector('#sceneOverlay .scene');
    if(!scene||document.getElementById('exactEmily')) return;
    const stage=makeStage('exactEmily','scene');
    stage.classList.add('exact-scene-stage');
    stage.insertAdjacentHTML('beforeend',`
      <div id="exactLiveReply" class="exact-live-reply"></div>
      <textarea id="exactTalkInput" class="exact-talk-input" maxlength="400" placeholder="Say anything to Emily..."></textarea>
      <button id="exactTalkSend" class="exact-talk-send" type="button" aria-label="Send message">➤</button>
    `);
    addHit(stage,5.2,74.0,89.6,3.6,'First dialogue choice',()=>choose(0));
    addHit(stage,5.2,78.0,89.6,3.6,'Second dialogue choice',()=>choose(1));
    addHit(stage,5.2,82.0,89.6,3.6,'Third dialogue choice',()=>choose(2));
    addNavigation(stage,'home',true);
    stage.querySelector('#exactTalkSend').addEventListener('click',sendTalk);
    stage.querySelector('#exactTalkInput').addEventListener('keydown',event=>{
      if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendTalk();}
    });
    scene.insertBefore(stage,scene.firstChild);
  }

  function makeStage(id,type){
    const stage=document.createElement('div');
    stage.id=id;
    stage.className='exact-stage';
    const art=document.createElement('div');
    art.className='exact-art';

    if(type==='home'&&window.__EXPOSURE_HOME){
      art.classList.add('one');
      const image=document.createElement('img');
      image.src=`data:image/webp;base64,${window.__EXPOSURE_HOME}`;
      image.alt='Exposure home screen';
      image.draggable=false;
      image.addEventListener('error',()=>fallbackStrips(art,'home'));
      art.appendChild(image);
    }else{
      const prefix=type==='map'?'map':type==='scene'?'scene':'home';
      fallbackStrips(art,prefix);
    }

    stage.appendChild(art);
    return stage;
  }

  function fallbackStrips(art,prefix){
    art.classList.remove('one');
    art.replaceChildren();
    for(let i=0;i<4;i++){
      const image=document.createElement('img');
      image.src=`assets/mockups/${prefix}-${i}.svg?v=approved-images-3`;
      image.alt='';
      image.draggable=false;
      image.addEventListener('error',()=>{image.style.visibility='hidden';});
      art.appendChild(image);
    }
  }

  function wrapLegacy(screen){
    const legacy=document.createElement('div');
    legacy.className='exact-legacy';
    while(screen.firstChild) legacy.appendChild(screen.firstChild);
    screen.appendChild(legacy);
  }

  function addHit(stage,x,y,w,h,label,handler){
    const button=document.createElement('button');
    button.type='button';
    button.className='exact-hit';
    button.setAttribute('aria-label',label);
    Object.assign(button.style,{left:`${x}%`,top:`${y}%`,width:`${w}%`,height:`${h}%`});
    button.addEventListener('click',handler);
    stage.appendChild(button);
    return button;
  }

  function addNavigation(stage,active,fromScene=false){
    navIds.forEach((id,index)=>{
      const hit=addHit(stage,index*12.5,92.4,12.5,7.4,`Open ${id}`,()=>{
        if(fromScene) closeScene();
        openTab(id);
      });
      hit.classList.add('exact-nav-hit');
      if(id===active) hit.setAttribute('aria-current','page');
    });
  }

  function openTab(id){
    document.querySelector(`nav.tabs button[data-tab="${id}"]`)?.click();
    requestAnimationFrame(syncMode);
  }

  function triggerTask(key){
    const label=taskLabels[key];
    const buttons=[...document.querySelectorAll('#tasks button')];
    const button=buttons.find(item=>item.textContent.includes(label));
    if(!button){showToast('That investigation is not available yet.');return;}
    if(button.disabled){showToast('You cannot do that task right now. Check the Phone or your Stamina.');return;}
    button.click();
    requestAnimationFrame(syncMode);
  }

  function choose(index){
    const button=document.querySelectorAll('#sceneChoices button')[index];
    if(!button){showToast('That response is no longer available.');return;}
    button.click();
    setTimeout(updateReply,40);
  }

  function sendTalk(){
    const visible=document.getElementById('exactTalkInput');
    const hidden=document.getElementById('freeTalk');
    const send=document.getElementById('sendTalkBtn');
    const value=visible?.value.trim();
    if(!value||!hidden||!send)return;
    hidden.value=value;
    visible.value='';
    send.click();
    setTimeout(updateReply,100);
  }

  function observeDialogue(){
    const source=document.getElementById('sceneText');
    if(!source)return;
    new MutationObserver(updateReply).observe(source,{childList:true,subtree:true,characterData:true});
  }

  function updateReply(){
    const source=document.getElementById('sceneText');
    const target=document.getElementById('exactLiveReply');
    if(!source||!target)return;
    if(source.innerHTML===lastSceneHtml)return;
    lastSceneHtml=source.innerHTML;
    const text=source.innerText.replace(/\s+/g,' ').trim();
    if(!text)return;
    const latest=text.split('You:').pop().trim();
    target.innerHTML=`<b>Live conversation</b>${escapeHtml(latest.slice(-260))}`;
    target.classList.add('show');
  }

  function closeScene(){
    document.getElementById('sceneOverlay')?.classList.add('hidden');
    try{currentScene=null;}catch{}
  }

  function syncMode(){
    const overlay=document.getElementById('sceneOverlay');
    const current=activeTab();
    const emilyOpen=!overlay?.classList.contains('hidden')&&currentNpcId()==='emily_hart';
    document.body.classList.toggle('exact-emily-active',emilyOpen);
    document.body.classList.toggle('exact-home-active',!emilyOpen&&current==='home');
    document.body.classList.toggle('exact-map-active',!emilyOpen&&current==='map');
    const exact=document.getElementById('exactEmily');
    if(exact)exact.style.display=emilyOpen?'block':'none';
  }

  function activeTab(){return document.querySelector('.screen.active')?.id||'home';}
  function currentNpcId(){try{return currentScene?.npc||null;}catch{return null;}}
  function escapeHtml(value){return String(value||'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));}
  function showToast(text){
    let toast=document.getElementById('exactToast');
    if(!toast){toast=document.createElement('div');toast.id='exactToast';toast.className='exact-toast';document.body.appendChild(toast);}
    toast.textContent=text;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer=setTimeout(()=>toast.classList.remove('show'),2400);
  }
})();