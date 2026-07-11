(() => {
  'use strict';

  const VERSION = 'production-2';
  const ASSETS = {
    header:`assets/ui/production/home-header.webp?v=${VERSION}`,
    hero:`assets/ui/production/home-hero.webp?v=${VERSION}`,
    news:`assets/ui/production/home-news.webp?v=${VERSION}`,
    clock:`assets/ui/production/home-clock.webp?v=${VERSION}`,
    stamina:`assets/ui/production/home-stamina.webp?v=${VERSION}`,
    exposure:`assets/ui/production/home-exposure.webp?v=${VERSION}`,
    chapter:`assets/ui/production/home-chapter.webp?v=${VERSION}`,
    tasks:`assets/ui/production/home-tasks.webp?v=${VERSION}`,
    events:`assets/ui/production/home-events.webp?v=${VERSION}`,
    nav:`assets/ui/production/home-nav.webp?v=${VERSION}`,
    map:`assets/ui/production/map-full.webp?v=${VERSION}`,
    scene:`assets/ui/production/scene-full.webp?v=${VERSION}`
  };
  const TABS=['home','book','map','contacts','phone','suspects','diary','case'];
  let timer=null;

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else void init();

  async function init(){
    build();
    observe();
    await loadAssets();
    document.getElementById('productionUi')?.classList.add('ready');
    sync();
    timer=window.setInterval(sync,750);
  }

  function build(){
    if(document.getElementById('productionUi')) return;
    const root=document.createElement('div');
    root.id='productionUi';
    root.innerHTML=`<div class="game-frame">
      <section id="productionHome" class="production-screen active">
        ${panel('header','home-header','<div class="dynamic-mask header-fallback"><div class="header-title">EXPOSURE</div><div class="header-sub">Blackwood · The Living Book</div></div>')}
        ${panel('hero','home-hero','<div class="dynamic-mask hero-location"><strong>Blackwood</strong>Greywick County<br>Est. 1882</div><button class="panel-button" id="productionEnter" type="button" aria-label="Enter Blackwood"></button>')}
        ${panel('news','home-news','<div class="dynamic-mask news-cover"></div><div class="dynamic-content news-content"><div class="eyebrow">Blackwood News</div><b id="productionNewsHeadline">Local teen disappears without a trace</b><span id="productionNewsSummary">No leads. No witnesses. Another name added to the list.</span><small>Read more →</small></div><button class="panel-button" id="productionNews" type="button" aria-label="Read Blackwood News"></button>')}
        ${panel('clock','home-clock','<div class="dynamic-mask clock-cover"></div><div class="dynamic-content clock-content"><div class="eyebrow" id="productionDay">Day 1 · Saturday</div><b id="productionTime">--:--</b><span id="productionDate">Greywick County</span><span id="productionWeather">Raining · 9°C</span></div>')}
        ${panel('stamina','home-stamina','<div class="dynamic-mask stat-cover"></div><div class="dynamic-content stat-content"><div class="eyebrow">⚡ Stamina</div><b><span id="productionStamina">100</span><small>/100</small></b><div class="meter"><i id="productionStaminaBar"></i></div><small>Ready</small></div>')}
        ${panel('exposure','home-exposure','<div class="dynamic-mask stat-cover"></div><div class="dynamic-content stat-content"><div class="eyebrow">◉ Exposure</div><b class="red"><span id="productionExposure">0</span><small>%</small></b><div class="meter red"><i id="productionExposureBar"></i></div><small>The darker it gets, the closer it gets.</small></div>')}
        ${panel('chapter','home-chapter','<div class="dynamic-mask chapter-cover"></div><div class="dynamic-content chapter-content"><div class="eyebrow" id="productionChapterMeta">Current chapter</div><b id="productionChapterTitle">The Road Into Blackwood</b><span id="productionChapterSummary">Every clue becomes part of your living book.</span><small>View chapter →</small></div><button class="panel-button" id="productionChapter" type="button" aria-label="View chapter"></button>')}
        ${panel('tasks','home-tasks','<div class="dynamic-mask tasks-cover"></div><div class="dynamic-content tasks-content"><div class="tasks-head"><div class="eyebrow">Tasks</div><small id="productionTaskCount">0 active</small></div><div class="task-list" id="productionTaskList"></div></div>')}
        ${panel('events','home-events','<div class="dynamic-mask events-cover"></div><div class="dynamic-content events-content"><div class="events-head"><div class="eyebrow">◷ Recent Events</div><small>View all</small></div><div class="event-list" id="productionEventList"></div></div><button class="panel-button" id="productionEvents" type="button" aria-label="View recent events"></button>')}
        ${panel('nav','home-nav','<div class="dynamic-mask events-cover"></div>'+nav('home'))}
      </section>
      <section id="productionMap" class="production-screen">
        <div class="full-art-screen" data-full-asset="map"></div>
        ${mapHit('house','map-hot-house','Your House')}${mapHit('cafe','map-hot-cafe','Café Hollow')}${mapHit('forest','map-hot-forest','Blackwood Forest')}${mapHit('police','map-hot-police','Police Station')}${mapHit('library','map-hot-library','Library')}${mapHit('school','map-hot-school','Blackwood High')}${mapHit('lake','map-hot-lake','Lake Road')}${navHits('map')}
      </section>
      <section id="productionScene" class="production-screen">
        <div class="full-art-screen" data-full-asset="scene"></div>
        <button class="hotspot scene-choice-0" data-scene-choice="0" type="button" aria-label="Dialogue choice one"></button>
        <button class="hotspot scene-choice-1" data-scene-choice="1" type="button" aria-label="Dialogue choice two"></button>
        <button class="hotspot scene-choice-2" data-scene-choice="2" type="button" aria-label="Dialogue choice three"></button>
        <div class="scene-talk"><textarea id="productionTalk" maxlength="400" placeholder="Say anything to Emily..."></textarea><button id="productionTalkSend" type="button">➤</button></div>
        ${navHits('home')}
      </section>
      <div class="loading-screen">Loading Blackwood…</div>
    </div>`;
    document.body.appendChild(root);

    q('#productionEnter')?.addEventListener('click',()=>show('map'));
    q('#productionNews')?.addEventListener('click',()=>nativeTab('book'));
    q('#productionChapter')?.addEventListener('click',openBook);
    q('#productionEvents')?.addEventListener('click',()=>nativeTab('book'));
    root.querySelectorAll('[data-production-tab]').forEach(button=>button.addEventListener('click',()=>navigate(button.dataset.productionTab)));
    root.querySelectorAll('[data-map-location]').forEach(button=>button.addEventListener('click',()=>mapLocation(button.dataset.mapLocation)));
    root.querySelectorAll('[data-scene-choice]').forEach(button=>button.addEventListener('click',()=>sceneChoice(Number(button.dataset.sceneChoice))));
    q('#productionTalkSend')?.addEventListener('click',sendTalk);
    q('#productionTalk')?.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendTalk();}});
  }

  function panel(asset,className,content){return `<article class="asset-panel ${className}" data-panel-asset="${asset}">${content}</article>`}
  function nav(active){return `<nav class="bottom-nav">${TABS.map(id=>`<button type="button" data-production-tab="${id}" class="${id===active?'active':''}"><span class="icon">${icon(id)}</span><span class="label">${label(id)}</span></button>`).join('')}</nav>`}
  function navHits(active){return TABS.map((id,index)=>`<button type="button" class="hotspot map-hot-nav" data-production-tab="${id}" aria-label="${label(id)}" style="left:${index*12.5}%;width:12.5%"></button>`).join('')}
  function mapHit(id,className,labelText){return `<button type="button" class="hotspot ${className}" data-map-location="${id}" aria-label="${labelText}"></button>`}
  function icon(id){return ({home:'⌂',book:'▥',map:'⌖',contacts:'♟',phone:'☎',suspects:'♜',diary:'▤',case:'▣'})[id]||'•'}
  function label(id){return ({home:'Home',book:'Book',map:'Map',contacts:'People',phone:'Phone',suspects:'Suspects',diary:'Notes',case:'Case'})[id]||id}

  async function loadAssets(){
    const jobs=[];
    qa('[data-panel-asset]').forEach(node=>jobs.push(background(node,ASSETS[node.dataset.panelAsset])));
    qa('[data-full-asset]').forEach(node=>jobs.push(background(node,ASSETS[node.dataset.fullAsset])));
    await Promise.allSettled(jobs);
  }
  function background(node,url){return new Promise(resolve=>{const image=new Image();image.decoding='async';image.onload=()=>{node.style.backgroundImage=`url("${url}")`;node.classList.remove('asset-missing');resolve(true)};image.onerror=()=>{node.classList.add('asset-missing');resolve(false)};image.src=url;})}

  function sync(){syncClock();syncStats();syncNews();syncChapter();syncTasks();syncEvents();syncState()}
  function syncClock(){const now=new Date();set('productionTime',text('time')||now.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}));const date=text('dateDisplay')||now.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'});set('productionDate',`${date} · Greywick County`);set('productionDay',`${text('day')?`Day ${text('day')} · `:''}${now.toLocaleDateString(undefined,{weekday:'long'})}`);set('productionWeather',text('periodDisplay')||'Raining · 9°C')}
  function syncStats(){const stamina=num('stamina',100),exposure=num('exposure',0);set('productionStamina',stamina);set('productionExposure',exposure);width('productionStaminaBar',stamina);width('productionExposureBar',exposure)}
  function syncNews(){const value=text('news');if(value)set('productionNewsHeadline',value.replace(/^Blackwood News\s*:?\s*/i,'').trim().slice(0,120))}
  function syncChapter(){set('productionChapterTitle',text('currentChapterTitle')||'The Road Into Blackwood');set('productionChapterMeta',text('currentChapterMeta')||'Current chapter');if(text('recentMemoryText'))set('productionChapterSummary',text('recentMemoryText').slice(0,120))}
  function syncTasks(){const source=qa('#tasks button'),list=q('#productionTaskList');if(!list)return;set('productionTaskCount',`${source.filter(button=>!button.disabled).length} active`);const sig=source.slice(0,3).map(button=>`${button.textContent}|${button.disabled}`).join('~');if(list.dataset.signature===sig)return;list.dataset.signature=sig;list.innerHTML='';source.slice(0,3).forEach(button=>{const item=document.createElement('button');item.type='button';item.disabled=button.disabled;item.innerHTML=`<span><strong>${esc(button.textContent.replace(/\s+/g,' ').trim())}</strong><small>${button.disabled?'Unavailable at this time.':'Open investigation task.'}</small></span><em>›</em>`;item.addEventListener('click',()=>button.click());list.appendChild(item);});}
  function syncEvents(){const list=q('#productionEventList');if(!list)return;let events=qa('#storyLog > *').map(node=>node.textContent.replace(/\s+/g,' ').trim()).filter(Boolean).slice(-3).reverse();if(!events.length)events=[text('recentMemoryText')||'You arrived in Blackwood. The town has already begun to remember you.'];const sig=events.join('~');if(list.dataset.signature===sig)return;list.dataset.signature=sig;list.innerHTML=events.map((value,index)=>`<div class="event-row"><time>${index===0?'NOW':'RECENT'}</time><span>${esc(value.slice(0,150))}</span></div>`).join('')}

  function syncState(){
    const bookOpen=open('bookOverlay'),sceneOpen=open('sceneOverlay');
    if(bookOpen){document.body.classList.add('native-mode','native-book');return;}
    document.body.classList.remove('native-book');
    if(sceneOpen&&isEmily()){document.body.classList.remove('native-mode','native-scene');show('scene');return;}
    if(sceneOpen){document.body.classList.add('native-mode','native-scene');return;}
    document.body.classList.remove('native-scene');
  }
  function navigate(id){if(id==='home'||id==='map'){closeOverlays();document.body.classList.remove('native-mode','native-scene','native-book');show(id);return;}nativeTab(id)}
  function show(id){qa('.production-screen').forEach(screen=>screen.classList.toggle('active',screen.id===`production${id.charAt(0).toUpperCase()+id.slice(1)}`))}
  function nativeTab(id){closeOverlays();q(`nav.tabs button[data-tab="${id}"]`)?.click();document.body.classList.add('native-mode')}
  function openBook(){q('#viewMemoryBtn')?.click();window.setTimeout(()=>{if(!open('bookOverlay'))nativeTab('book')},20)}

  function mapLocation(id){const aliases={house:['Rest at home'],cafe:['Meet Emily','Café Hollow'],forest:['Blackwood Forest'],police:['Detective Mason','Police Station'],library:['Library research','Library'],school:["Noah's house",'Noah'],lake:['Lake Road','anonymous']};const button=qa('#tasks button').find(item=>aliases[id]?.some(needle=>item.textContent.toLowerCase().includes(needle.toLowerCase())));if(button&&!button.disabled)button.click()}
  function sceneChoice(index){const button=qa('#sceneChoices button')[index];if(button&&!button.disabled)button.click()}
  function sendTalk(){const input=q('#productionTalk'),hidden=q('#freeTalk'),send=q('#sendTalkBtn'),value=input?.value.trim();if(!value||!hidden||!send)return;hidden.value=value;input.value='';send.click()}
  function observe(){const observer=new MutationObserver(sync);qa('.screen,#sceneOverlay,#bookOverlay,#tasks,#storyLog').forEach(node=>observer.observe(node,{childList:true,subtree:true,attributes:true,characterData:true}))}
  function isEmily(){const value=`${text('sceneTitle')} ${text('sceneLocation')}`.toLowerCase();try{if(typeof currentScene!=='undefined'&&currentScene?.npc==='emily_hart')return true}catch{}return value.includes('emily')||value.includes('café hollow')||value.includes('cafe hollow')}
  function closeOverlays(){q('#leaveSceneBtn')?.click();q('#sceneOverlay')?.classList.add('hidden');q('#bookCloseBtn')?.click();q('#bookOverlay')?.classList.add('hidden')}
  function open(id){const node=q(`#${id}`);return Boolean(node&&!node.classList.contains('hidden'))}
  function q(selector){return document.querySelector(selector)}
  function qa(selector){return [...document.querySelectorAll(selector)]}
  function text(id){return q(`#${id}`)?.textContent?.replace(/\s+/g,' ').trim()||''}
  function num(id,fallback){const value=Number.parseInt(text(id),10);return Number.isFinite(value)?Math.max(0,Math.min(100,value)):fallback}
  function set(id,value){const node=q(`#${id}`);if(node&&node.textContent!==String(value))node.textContent=String(value)}
  function width(id,value){const node=q(`#${id}`);if(node)node.style.width=`${Math.max(0,Math.min(100,value))}%`}
  function esc(value){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]))}
  window.addEventListener('beforeunload',()=>{if(timer)clearInterval(timer)});
})();
