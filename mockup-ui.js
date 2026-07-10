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

  let homeTaskSignature='';
  let sceneChoiceSignature='';
  let lastSceneHtml='';
  let dockStartY=0;
  let dockDragging=false;
  let dockMoved=false;

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();

  function init(){
    document.body.classList.add('native-ui-ready');
    buildHome();
    buildMap();
    buildEmilyScene();
    buildDock();
    observeDialogue();
    syncAll();
    setInterval(syncAll,350);
  }

  function buildHome(){
    const screen=document.getElementById('home');
    if(!screen||document.getElementById('nativeHome'))return;
    wrapLegacy(screen);
    const shell=document.createElement('div');
    shell.id='nativeHome';
    shell.className='native-shell';
    shell.innerHTML=`
      ${brandMarkup()}
      <section class="native-hero">
        <div class="native-hero-location"><strong>Blackwood</strong>Greywick County<br>Est. 1882</div>
        <div class="native-hero-copy">
          <blockquote>“Some stories don’t end.<br>They only get rewritten.”</blockquote>
          <button id="nativeEnter" class="native-hero-enter" type="button">Enter Blackwood →</button>
        </div>
      </section>

      <div class="native-grid two">
        <article class="native-card">
          <h2 class="native-card-title">▤ Blackwood News</h2>
          <p id="nativeNews" class="native-news">Local teen disappears without a trace.</p>
        </article>
        <article class="native-card native-time-card">
          <span id="nativeTime" class="native-time">--:--</span>
          <span id="nativeDate" class="native-date">Living time</span>
          <span id="nativeWeather" class="native-weather">Rain over Blackwood</span>
        </article>
      </div>

      <div class="native-grid metrics">
        <article class="native-card">
          <span class="native-metric-label">⚡ Stamina</span>
          <div class="native-metric-value"><span id="nativeStamina">0</span><small>/100</small></div>
          <div class="native-meter"><i id="nativeStaminaBar"></i></div>
          <p class="native-caption">Your ability to travel, search and keep going.</p>
        </article>
        <article class="native-card">
          <span class="native-metric-label">◉ Exposure</span>
          <div class="native-metric-value danger"><span id="nativeExposure">0</span><small>%</small></div>
          <div class="native-meter red"><i id="nativeExposureBar"></i></div>
          <p class="native-caption">The darker it gets, the closer it gets.</p>
        </article>
      </div>

      <div class="native-grid split">
        <article class="native-card native-paper">
          <span class="native-kicker">Current chapter</span>
          <h2 id="nativeChapterTitle" class="native-chapter-title">The Road Into Blackwood</h2>
          <p id="nativeChapterMeta" class="native-caption">Prologue · The truth begins here.</p>
          <button id="nativeOpenBook" class="native-hero-enter" type="button">View chapter →</button>
        </article>
        <article class="native-card">
          <span class="native-kicker">Tasks</span>
          <div id="nativeTasks" class="native-task-list"></div>
        </article>
      </div>

      <article class="native-card native-events">
        <h2 class="native-card-title">◷ Recent Events</h2>
        <p id="nativeRecentEvent" class="native-event-text">You moved to Blackwood yesterday. This morning, Noah Williams is missing.</p>
      </article>
    `;
    screen.appendChild(shell);
    shell.querySelector('#nativeEnter').addEventListener('click',()=>openTab('map'));
    shell.querySelector('#nativeOpenBook').addEventListener('click',()=>openTab('book'));
    shell.querySelector('.native-gear').addEventListener('click',()=>document.getElementById('resetBtn')?.click());
  }

  function buildMap(){
    const screen=document.getElementById('map');
    if(!screen||document.getElementById('nativeMap'))return;
    wrapLegacy(screen);
    const shell=document.createElement('div');
    shell.id='nativeMap';
    shell.className='native-shell native-map-shell';
    shell.innerHTML=`
      ${brandMarkup()}
      <div class="native-map-card" id="nativeMapCard" aria-label="Interactive map of Blackwood"></div>
      <div class="native-map-bottom">
        <article class="native-card native-paper">
          <span class="native-kicker">Current objective</span>
          <h2 id="nativeMapObjective" class="native-chapter-title">Meet Emily at Café Hollow</h2>
          <p id="nativeMapCopy" class="native-caption">Travel to a marked location to continue the investigation.</p>
          <button id="nativeMapTravel" class="native-map-action" type="button">Travel there</button>
        </article>
        <article class="native-card">
          <span class="native-kicker">Risk level</span>
          <div class="native-risk-value"><span id="nativeMapRisk">0</span>%</div>
          <p class="native-caption">Available markers are safe enough to approach. Locked areas may become dangerous later.</p>
        </article>
      </div>
    `;
    screen.appendChild(shell);
    shell.querySelector('.native-gear').addEventListener('click',()=>document.getElementById('resetBtn')?.click());

    const map=shell.querySelector('#nativeMapCard');
    const nodes=[
      [32,31,'Your House','rest',false],
      [52,39,'Café Hollow','emily',false],
      [29,62,'Police Station','mason',false],
      [46,72,'Library','library',false],
      [19,42,'Blackwood Forest','forest',false],
      [75,42,'Lake Road','anonymous',false],
      [58,20,'Water Tower',null,true],
      [77,28,'Sawmill',null,true],
      [71,57,'Old Church',null,true],
      [62,76,'Hospital',null,true],
      [48,86,'Cemetery',null,true]
    ];
    nodes.forEach(([x,y,label,task,locked])=>{
      const button=document.createElement('button');
      button.type='button';
      button.className=`map-node${locked?' locked':''}`;
      button.style.left=`${x}%`;
      button.style.top=`${y}%`;
      button.textContent=label;
      button.addEventListener('click',()=>selectMapLocation(label,task,locked));
      map.appendChild(button);
    });
    shell.querySelector('#nativeMapTravel').addEventListener('click',()=>{
      const task=shell.querySelector('#nativeMapTravel').dataset.task;
      if(task)triggerTask(task);else showToast('Choose an available map location first.');
    });
  }

  function buildEmilyScene(){
    const scene=document.querySelector('#sceneOverlay .scene');
    if(!scene||document.getElementById('nativeEmily'))return;
    const native=document.createElement('div');
    native.id='nativeEmily';
    native.className='native-scene';
    native.innerHTML=`
      ${brandMarkup()}
      <section class="native-scene-hero">
        <div class="native-scene-meta">Blackwood<br>Toward Café Hollow<br><span id="nativeSceneTime">Living time</span><br>Raining</div>
      </section>
      <article class="native-scene-paper native-paper">
        <h2>Chapter II · Shadows in the Rain</h2>
        <p id="nativeSceneNarrative">The rain had not let up since afternoon. Café Hollow glowed like a secret against the mist.</p>
      </article>
      <article class="native-card native-character-card">
        <div class="native-character-portrait" aria-label="Emily Hart"></div>
        <div class="native-character-copy">
          <h3>Emily Hart</h3>
          <small>Librarian · Blackwood Library</small>
          <p id="nativeEmilyReply">“I wasn’t sure you’d come.”</p>
        </div>
      </article>
      <div class="native-state-row">
        <div class="native-state">Trust<strong id="nativeTrust">42%</strong></div>
        <div class="native-state">Focus<strong id="nativeFocus">68%</strong></div>
        <div class="native-state">Fear<strong id="nativeFear">28%</strong></div>
        <div class="native-state">Suspicion<strong id="nativeSuspicion">36%</strong></div>
      </div>
      <div id="nativeLiveReply" class="native-live-reply"></div>
      <div id="nativeChoices" class="native-choice-list"></div>
      <div class="native-talk">
        <textarea id="nativeTalkInput" maxlength="400" placeholder="Say anything to Emily..."></textarea>
        <button id="nativeTalkSend" type="button" aria-label="Send message">➤</button>
      </div>
    `;
    scene.insertBefore(native,scene.firstChild);
    native.querySelector('.native-gear').addEventListener('click',closeScene);
    native.querySelector('#nativeTalkSend').addEventListener('click',sendTalk);
    native.querySelector('#nativeTalkInput').addEventListener('keydown',event=>{
      if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendTalk();}
    });
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

  function brandMarkup(){
    return `<header class="native-brand"><span class="native-brand-mark">♠</span><h1>EXPOSURE</h1><p>Blackwood · The Living Book</p><button class="native-gear" type="button" aria-label="Settings">⚙</button></header>`;
  }

  function wrapLegacy(screen){
    const legacy=document.createElement('div');
    legacy.className='exact-legacy';
    while(screen.firstChild)legacy.appendChild(screen.firstChild);
    screen.appendChild(legacy);
  }

  function syncAll(){
    syncHome();
    syncScene();
    syncDock();
  }

  function syncHome(){
    setText('nativeNews',textOf('news')||'Local teen disappears without a trace.');
    setText('nativeTime',textOf('time')||formatNow());
    setText('nativeDate',textOf('dateDisplay')||new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'}));
    setText('nativeWeather',textOf('periodDisplay')||'Living Time · Blackwood');

    const stamina=numberOf('stamina');
    const exposure=numberOf('exposure');
    setText('nativeStamina',stamina);
    setText('nativeExposure',exposure);
    setWidth('nativeStaminaBar',stamina);
    setWidth('nativeExposureBar',exposure);
    setText('nativeMapRisk',exposure);

    setText('nativeChapterTitle',textOf('currentChapterTitle')||'The Road Into Blackwood');
    setText('nativeChapterMeta',`${textOf('currentChapterMeta')||'Prologue'} · Evidence updates live.`);

    const recent=textOf('recentMemoryText')||textOf('storyLog');
    if(recent)setText('nativeRecentEvent',recent.slice(0,320));
    syncTasks();
  }

  function syncTasks(){
    const source=[...document.querySelectorAll('#tasks button')];
    const signature=source.map(button=>`${button.disabled}:${button.innerText}`).join('|');
    if(signature===homeTaskSignature)return;
    homeTaskSignature=signature;
    const target=document.getElementById('nativeTasks');
    if(!target)return;
    target.replaceChildren();
    if(!source.length){
      target.innerHTML='<p class="native-caption">No active tasks yet.</p>';
      return;
    }
    source.slice(0,4).forEach(sourceButton=>{
      const button=document.createElement('button');
      button.type='button';
      button.className='native-task';
      button.disabled=sourceButton.disabled;
      const lines=sourceButton.innerText.split('\n').map(value=>value.trim()).filter(Boolean);
      button.innerHTML=`${escapeHtml(lines[0]||'Open task')}${lines[1]?`<small>${escapeHtml(lines.slice(1).join(' · '))}</small>`:''}`;
      button.addEventListener('click',()=>sourceButton.click());
      target.appendChild(button);
    });
  }

  function syncScene(){
    const overlay=document.getElementById('sceneOverlay');
    const sceneOpen=overlay&&!overlay.classList.contains('hidden');
    const emilyOpen=sceneOpen&&currentNpcId()==='emily_hart';
    document.body.classList.toggle('native-emily-active',emilyOpen);
    if(!emilyOpen)return;

    setText('nativeSceneTime',textOf('time')||formatNow());
    const narrative=textOf('sceneText');
    if(narrative)setText('nativeSceneNarrative',narrative.slice(0,420));
    parseNpcStats(textOf('npcStateBox'));
    syncChoices();
    updateReply();
  }

  function syncChoices(){
    const source=[...document.querySelectorAll('#sceneChoices button')];
    const signature=source.map(button=>button.innerText).join('|');
    if(signature===sceneChoiceSignature)return;
    sceneChoiceSignature=signature;
    const target=document.getElementById('nativeChoices');
    if(!target)return;
    target.replaceChildren();
    source.slice(0,4).forEach(sourceButton=>{
      const button=document.createElement('button');
      button.type='button';
      button.className='native-choice';
      button.textContent=`“ ${sourceButton.innerText.trim()} ”`;
      button.addEventListener('click',()=>{
        sourceButton.click();
        setTimeout(updateReply,60);
      });
      target.appendChild(button);
    });
  }

  function parseNpcStats(text){
    const values={Trust:42,Focus:68,Fear:28,Suspicion:36};
    Object.keys(values).forEach(label=>{
      const match=String(text||'').match(new RegExp(`${label}\\s*:?\\s*(\\d+)`,'i'));
      if(match)values[label]=Number(match[1]);
    });
    setText('nativeTrust',`${values.Trust}%`);
    setText('nativeFocus',`${values.Focus}%`);
    setText('nativeFear',`${values.Fear}%`);
    setText('nativeSuspicion',`${values.Suspicion}%`);
  }

  function observeDialogue(){
    const source=document.getElementById('sceneText');
    if(source)new MutationObserver(updateReply).observe(source,{childList:true,subtree:true,characterData:true});
  }

  function updateReply(){
    const source=document.getElementById('sceneText');
    if(!source||source.innerHTML===lastSceneHtml)return;
    lastSceneHtml=source.innerHTML;
    const full=source.innerText.replace(/\s+/g,' ').trim();
    if(!full)return;
    const latest=full.split('You:').pop().trim();
    setText('nativeEmilyReply',latest.slice(-220)||'“I wasn’t sure you’d come.”');
    const live=document.getElementById('nativeLiveReply');
    if(live){live.textContent=latest.slice(-300);live.classList.add('show');}
  }

  function selectMapLocation(label,task,locked){
    setText('nativeMapObjective',label);
    const copy=document.getElementById('nativeMapCopy');
    const travel=document.getElementById('nativeMapTravel');
    if(locked){
      if(copy)copy.textContent='This location remains unknown. Continue investigating to unlock it.';
      if(travel){travel.dataset.task='';travel.textContent='Location locked';travel.disabled=true;}
      return;
    }
    if(copy)copy.textContent=`Travel to ${label}. Time of day, exposure and relationships may alter the outcome.`;
    if(travel){travel.dataset.task=task||'';travel.textContent=`Travel to ${label}`;travel.disabled=!task;}
  }

  function triggerTask(key){
    const label=taskLabels[key];
    const button=[...document.querySelectorAll('#tasks button')].find(item=>item.textContent.includes(label));
    if(!button){showToast('That investigation is not available yet.');return;}
    if(button.disabled){showToast('That task is unavailable at this time. Check your Phone, appointment or Stamina.');return;}
    button.click();
  }

  function sendTalk(){
    const visible=document.getElementById('nativeTalkInput');
    const hidden=document.getElementById('freeTalk');
    const send=document.getElementById('sendTalkBtn');
    const value=visible?.value.trim();
    if(!value||!hidden||!send)return;
    hidden.value=value;
    visible.value='';
    send.click();
    setTimeout(updateReply,140);
  }

  function closeScene(){
    document.getElementById('leaveSceneBtn')?.click();
    document.getElementById('sceneOverlay')?.classList.add('hidden');
    document.body.classList.remove('native-emily-active');
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
  function setWidth(id,value){const node=document.getElementById(id);if(node)node.style.width=`${Math.max(0,Math.min(100,Number(value)||0))}%`;}
  function formatNow(){return new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});}
  function escapeHtml(value){return String(value||'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));}
  function showToast(text){
    let toast=document.getElementById('nativeToast');
    if(!toast){toast=document.createElement('div');toast.id='nativeToast';toast.className='native-toast';document.body.appendChild(toast);}
    toast.textContent=text;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer=setTimeout(()=>toast.classList.remove('show'),2400);
  }
})();