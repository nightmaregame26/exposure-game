const SAVE_KEY = 'exposure-alpha-03';

const tutorials = [
  'Read the news first. It tells you what changed overnight and what the town believes.',
  'Every task costs time. You cannot do everything in one day.',
  'NPCs now have Health, Stamina, Focus, Stress, Fear, Trust, Interest and Suspicion.',
  'Focus controls how open a character is to talking. Hard questions drain Focus faster.',
  'When an NPC Focus gets low, they naturally end the conversation.',
  'The Phone tab now tracks contacts, messages and threats.'
];

const fallbackCharacters = [
  { id:'emily_hart', name:'Emily Hart', role:'Cafe worker / student', core:true, currentLocation:'cafe_hollow', health:100, stamina:72, focus:46, stress:58, fear:38, trust:22, interest:52, suspicionTowardPlayer:18, memory:[], knownFacts:['Noah said someone was watching him.'], hiddenFacts:['Noah argued with someone in a black ute.'] },
  { id:'detective_mason', name:'Detective Mason', role:'Lead investigator', core:true, currentLocation:'police_station', health:100, stamina:61, focus:34, stress:72, fear:16, trust:8, interest:41, suspicionTowardPlayer:28, memory:[], knownFacts:['Noah is missing.'], hiddenFacts:['There are similarities to an older sealed case.'] },
  { id:'sarah_pike', name:'Sarah Pike', role:'Journalist', core:true, currentLocation:'blackwood_gazette', health:100, stamina:68, focus:62, stress:49, fear:22, trust:10, interest:78, suspicionTowardPlayer:20, memory:[], knownFacts:['Blackwood has buried disappearances.'], hiddenFacts:['She has an illegal police leak.'] },
  { id:'alex_vale', name:'Alex Vale', role:'Mechanic', core:true, currentLocation:'vales_garage', health:100, stamina:82, focus:54, stress:63, fear:25, trust:28, interest:50, suspicionTowardPlayer:18, memory:[], knownFacts:['Old logging roads are still accessible.'], hiddenFacts:['He saw a black ute near Lake Road.'] },
  { id:'mara_bell', name:'Mara Bell', role:'Neighbour / town elder', core:true, currentLocation:'mara_bell_house', health:78, stamina:38, focus:48, stress:46, fear:64, trust:16, interest:45, suspicionTowardPlayer:35, memory:[], knownFacts:['Headlights were seen near the player street.'], hiddenFacts:['The killer signature resembles an older case.'] },
  { id:'noah_williams', name:'Noah Williams', role:'Missing teenager', core:true, currentLocation:'unknown', health:65, stamina:30, focus:0, stress:92, fear:95, trust:0, interest:0, suspicionTowardPlayer:0, memory:[], knownFacts:['Someone was watching him.'], hiddenFacts:['He saw the killer signature before vanishing.'] }
];

const fallbackLocations = [
  { id:'your_house', name:'Your House', risk:'Low', unlocked:true },
  { id:'cafe_hollow', name:'Café Hollow', risk:'Low', unlocked:true },
  { id:'blackwood_high', name:'Blackwood High', risk:'Low', unlocked:true },
  { id:'police_station', name:'Police Station', risk:'Low', unlocked:false },
  { id:'blackwood_forest', name:'Blackwood Forest', risk:'High', unlocked:false },
  { id:'lake_road', name:'Lake Road', risk:'High', unlocked:false },
  { id:'blackwood_gazette', name:'Blackwood Gazette', risk:'Medium', unlocked:false },
  { id:'vales_garage', name:"Vale's Garage", risk:'Medium', unlocked:false }
];

const focusCosts = {
  casualQuestion: 3,
  caseQuestion: 6,
  emotionalQuestion: 8,
  askForSecret: 12,
  accusation: 15,
  threatOrPressure: 18
};

const tasks = [
  { id:'emily', name:'Meet Emily at Café Hollow', t:45, s:8, e:4 },
  { id:'noah', name:"Visit Noah's house", t:120, s:18, e:10 },
  { id:'forest', name:'Search Blackwood Forest', t:180, s:32, e:18 },
  { id:'mason', name:'Visit Detective Mason', t:75, s:8, e:12 },
  { id:'alex', name:'Ask Alex about old roads', t:60, s:6, e:3 },
  { id:'mara', name:'Talk to Mara Bell', t:45, s:5, e:4 },
  { id:'sarah', name:'Help Sarah with article', t:90, s:12, e:15 },
  { id:'anonymous', name:'Follow anonymous text', t:150, s:25, e:30 },
  { id:'library', name:'Library research', t:90, s:10, e:2 },
  { id:'rest', name:'Rest at home', t:120, s:-30, e:-4 }
];

let state;
let currentScene = null;
let dataLocations = fallbackLocations;

function fresh(characters = fallbackCharacters) {
  const people = {};
  characters.forEach(c => {
    people[c.id] = { ...c, sus:'Unknown', phone:false, repliesThisScene:0, memory:c.memory || [] };
  });
  return {
    day:1,
    time:390,
    stamina:100,
    exposure:0,
    tutorial:0,
    clues:[],
    notes:[],
    messages:[
      { from:'Blackwood News', text:'Noah Williams remains missing. Police ask residents to avoid Blackwood Forest after dark.', threat:false },
      { from:'Unknown', text:'Welcome to Blackwood.', threat:true }
    ],
    story:['You moved to Blackwood yesterday. This morning, Noah Williams is missing.'],
    unlocked:['your_house','blackwood_high','cafe_hollow'],
    people,
    killer:{ codename:'The Hunter', style:'Patient, organised, controlled, close to the investigation.', hint:'a carved wooden animal' },
    town:{ publicFear:18, policePresence:22, rumourIntensity:25, mediaAttention:15 }
  };
}

init();

async function init() {
  const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
  const characters = await loadJson('data/characters.json', fallbackCharacters);
  dataLocations = await loadJson('data/locations.json', fallbackLocations);
  state = saved || fresh(characters);
  attachEvents();
  render();
}

async function loadJson(path, fallback) {
  try {
    const response = await fetch(path, { cache:'no-store' });
    if (!response.ok) throw new Error('Failed to load ' + path);
    return await response.json();
  } catch {
    return fallback;
  }
}

const scenes = {
  emily:{ title:'Café Hollow', loc:'Café Hollow', art:'cafe', npc:'emily_hart', open:`The café smells like burnt sugar and rain. Emily keeps looking at the television above the counter.<br><br><span class="speaker">Emily:</span> “You saw the news, right? About Noah?”`, choices:[
    { label:'Tell her you believe Noah did not run away', intent:'emotionalQuestion', result:'Emily lowers her voice. “He said someone was watching him. I thought he was being dramatic.”', trust:12, clue:'Emily says Noah was scared before he vanished', next:[
      { label:'Ask why Noah was scared', intent:'caseQuestion', result:'“He kept looking over his shoulder after work. He said someone was parked outside his house.”', clue:'Noah saw a parked car outside his house' },
      { label:'Ask for her phone number', intent:'casualQuestion', result:'Emily hesitates, then nods. “Fine. But do not text me about this at work.”', trust:4, phone:true }
    ]},
    { label:'Ask if Noah had enemies', intent:'caseQuestion', result:'“Not enemies exactly. But he argued with someone near the carpark. Black ute. Local plates, I think.”', trust:6, clue:'Noah argued with someone in a black ute' },
    { label:'Push her hard for details', intent:'threatOrPressure', result:'<span class="danger">Emily pulls back.</span> “I barely know you. Why are you acting like a cop?”', trust:-8, exposure:8, stress:8, suspicion:6 }
  ]},
  noah:{ title:"Noah's House", loc:"Noah's House", art:'', npc:null, open:`Noah's mother opens the door with red eyes. The house behind her is too quiet.<br><br>“If you're from school, I don't know what else to say.”`, choices:[
    { label:"Politely ask to see Noah's room", result:"She lets you in. Noah's room is untouched except for the open window. Muddy footprints cross the carpet.", unlock:'williams_house', clue:"Muddy footprints at Noah's bedroom window" },
    { label:'Ask if Noah mentioned being watched', result:'Her face changes. “He said that once. I told him it was stress.”', clue:'Noah told his mum he felt watched' },
    { label:'Search without permission', result:"You find a torn notebook page, but a neighbour sees you leaving Noah's room.", exposure:18, clue:"Noah's torn notebook page" }
  ]},
  forest:{ title:'Blackwood Forest', loc:'Blackwood Forest', art:'forest', npc:null, open:'The forest begins behind the school oval. The path splits three ways. Somewhere ahead, a crow screams.', choices:[
    { label:'Follow the muddy trail', result:"The mud leads to a branch where a torn backpack strap hangs. It looks like Noah's school colours.", unlock:'blackwood_forest', clue:'Backpack strap caught on forest branch' },
    { label:'Keep going after dark', result:()=>'On a stump sits ' + state.killer.hint + '. It was left for someone to find. Maybe you.', exposure:25, playerStamina:-18, clue:()=>'Killer hint: ' + state.killer.hint },
    { label:'Turn back before dark', result:'You turn around before the trees swallow the last light. Cowardly? Maybe. Alive? Definitely.', exposure:-2 }
  ]},
  mason:{ title:'Police Station', loc:'Police Station', art:'police', npc:'detective_mason', open:`Detective Mason looks like he has not slept.<br><br><span class="speaker">Mason:</span> “Unless you have evidence, make it quick.”`, choices:[
    { label:'Ask what evidence he needs', intent:'caseQuestion', result:'“Motive. Opportunity. Physical evidence. A witness who will not fall apart in court.”', trust:8, clue:'Mason needs motive, opportunity and physical evidence' },
    { label:'Show him your strongest evidence', intent:'caseQuestion', result:()=>state.clues.length>=3?'Mason finally writes it down. “Bring anything else straight to me.”':'“That is not evidence. That is fear.”', trust:6 },
    { label:'Accuse someone directly', intent:'accusation', result:'“Throw names around again without proof and you become part of my problem.”', trust:-8, exposure:10, suspicion:8 }
  ]},
  alex:{ title:"Vale's Garage", loc:"Vale's Garage", art:'', npc:'alex_vale', open:`Alex is under the bonnet of an old ute.<br><br><span class="speaker">Alex:</span> “You settling in alright? Blackwood can be weird at first.”`, choices:[
    { label:'Ask about old logging roads', intent:'caseQuestion', result:'“Most locals do not use them anymore. Too easy to get lost. But yeah, I know them.”', trust:10, clue:'Alex knows old logging roads' },
    { label:'Mention the black ute', intent:'caseQuestion', result:'For half a second Alex stops moving. “Half the town drives a ute.”', exposure:6, clue:'Alex reacted to black ute question', stress:6 }
  ]},
  mara:{ title:"Mara Bell's Porch", loc:"Mara Bell's House", art:'', npc:'mara_bell', open:'Mara Bell watches from behind a flyscreen.<br><br>“People here talk too much. That is how they get hurt.”', choices:[
    { label:'Tell her you are scared too', intent:'emotionalQuestion', result:'“There were headlights outside your house after midnight. No engine sound. Just lights.”', trust:12, clue:'Mara saw headlights near your street' },
    { label:'Demand answers', intent:'threatOrPressure', result:'“You sound just like the last one.” She shuts the door.', trust:-8, exposure:5, suspicion:8 }
  ]},
  sarah:{ title:'Blackwood Gazette', loc:'Blackwood Gazette', art:'police', npc:'sarah_pike', open:`Sarah Pike's office is stacked with clippings.<br><br><span class="speaker">Sarah:</span> “You saw something, did you not?”`, choices:[
    { label:'Share one clue with Sarah', intent:'caseQuestion', result:'“This is not the first time. Blackwood just keeps forgetting.”', trust:12, exposure:10, clue:'Sarah suspects a historical pattern' },
    { label:'Ask what she knows', intent:'caseQuestion', result:'“I have a leak. A sealed file. But I need something real before I burn my source.”', trust:6, clue:'Sarah has a sealed police leak' }
  ]},
  anonymous:{ title:'Lake Road', loc:'Lake Road', art:'forest', npc:null, open:'The anonymous text said: COME ALONE. LAKE ROAD. 4:30.<br><br>A paper bag sits on the centre line.', choices:[
    { label:'Open the bag', result:()=>'Inside is ' + state.killer.hint + '. Under it, a note: YOU ARE LEARNING.', exposure:20, clue:()=>'Killer hint: ' + state.killer.hint },
    { label:'Photograph it and call Mason', result:'Mason sounds impressed. “Good. Do not move.”', npcTarget:'detective_mason', trust:12, clue:'Photographed killer package' },
    { label:'Run', result:'You run until your lungs burn. Behind you, something metallic taps once against the road.', playerStamina:-20 }
  ]}
};

function $(id){ return document.getElementById(id); }
function fmt(m){ let h=Math.floor(m/60)%24, mm=m%60; return String(h).padStart(2,'0')+':'+String(mm).padStart(2,'0'); }
function clamp(v){ return Math.max(0, Math.min(100, Number(v || 0))); }
function save(){ localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }
function html(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
function addClue(c){ const clue = typeof c === 'function' ? c() : c; if (clue && !state.clues.includes(clue)) state.clues.push(clue); }
function unlock(id){ if(id && !state.unlocked.includes(id)) state.unlocked.push(id); }
function log(x){ state.story.unshift('<b>'+fmt(state.time)+'</b> — '+x); }
function npc(){ return currentScene?.npc ? state.people[currentScene.npc] : null; }

function applyNpcDelta(person, delta = {}) {
  if (!person) return;
  if (delta.trust) person.trust = clamp(person.trust + delta.trust);
  if (delta.focus) person.focus = clamp(person.focus + delta.focus);
  if (delta.stress) person.stress = clamp(person.stress + delta.stress);
  if (delta.fear) person.fear = clamp(person.fear + delta.fear);
  if (delta.interest) person.interest = clamp(person.interest + delta.interest);
  if (delta.suspicion) person.suspicionTowardPlayer = clamp(person.suspicionTowardPlayer + delta.suspicion);
  if (person.trust >= 35) person.phone = true;
}

function focusCost(intent = 'caseQuestion') { return focusCosts[intent] ?? focusCosts.caseQuestion; }

function focusBlocked(person) {
  return person && person.focus <= 8;
}

function applyChoice(choice) {
  const person = npc();
  const cost = currentScene?.npc ? focusCost(choice.intent) : 0;
  if (focusBlocked(person)) {
    $('sceneText').innerHTML += '<hr><span class="danger">'+person.name+' is too drained to keep talking.</span><br>“Not now. I cannot do this.”';
    renderNpcState();
    save();
    return;
  }

  const result = typeof choice.result === 'function' ? choice.result() : choice.result;
  applyNpcDelta(person, { trust:choice.trust || 0, focus:-cost, stress:choice.stress || 0, fear:choice.fear || 0, interest:choice.interest || 0, suspicion:choice.suspicion || 0 });
  if (choice.npcTarget) applyNpcDelta(state.people[choice.npcTarget], { trust: choice.trust || 0 });
  if (choice.phone && person) person.phone = true;
  if (choice.exposure) state.exposure = clamp(state.exposure + choice.exposure);
  if (choice.playerStamina) state.stamina = clamp(state.stamina + choice.playerStamina);
  if (choice.clue) addClue(choice.clue);
  if (choice.unlock) unlock(choice.unlock);
  if (person) person.memory.unshift('Player chose: ' + choice.label);
  $('sceneText').innerHTML += '<hr>' + result;
  log(result.replace(/<[^>]*>/g,''));
  if (choice.next) renderSceneChoices(choice.next);
  render();
  renderNpcState();
}

function renderSceneChoices(list){
  $('sceneChoices').innerHTML = '';
  list.forEach(choice => {
    const b = document.createElement('button');
    const cost = currentScene?.npc ? focusCost(choice.intent) : 0;
    b.innerHTML = choice.label + (cost ? `<div class="meta">NPC Focus -${cost}</div>` : '');
    b.onclick = () => applyChoice(choice);
    $('sceneChoices').appendChild(b);
  });
}

function openScene(id){
  currentScene = scenes[id];
  if (!currentScene) return;
  const person = npc();
  if (person) person.repliesThisScene = 0;
  $('sceneTitle').textContent = currentScene.title;
  $('sceneLocation').textContent = currentScene.loc;
  $('sceneArt').className = 'sceneArt ' + (currentScene.art || '');
  $('sceneText').innerHTML = currentScene.open;
  renderSceneChoices(currentScene.choices);
  $('sceneOverlay').classList.remove('hidden');
  renderNpcState();
}

function startTask(t){
  if (state.stamina - t.s < 0 || state.time + t.t > 1440) return;
  state.time += t.t;
  state.stamina = clamp(state.stamina - t.s);
  state.exposure = clamp(state.exposure + t.e);
  if (t.id === 'rest') { restPlayer(); return; }
  if (t.id === 'library') { unlock('library'); addClue('Old disappearances linked to Blackwood Forest'); log('In the library archive, three old disappearances point back to the forest.'); render(); return; }
  openScene(t.id);
  render();
}

function restPlayer(){
  state.stamina = clamp(state.stamina + 30);
  Object.values(state.people).forEach(p => { p.focus = clamp(p.focus + 8); p.stamina = clamp(p.stamina + 5); });
  log('You rest at home. It helps, but Blackwood moves without you. Some NPC Focus recovers.');
  render();
}

function news(){
  if (state.day === 1) return '<b>BREAKING:</b> Noah Williams remains missing. Police ask residents to avoid Blackwood Forest after dark.';
  if (state.exposure > 70) return '<b>WARNING:</b> A local resident involved in the case reports being followed.';
  if (state.town.publicFear > 55) return '<b>BLACKWOOD ALERT:</b> Residents are being urged to travel in groups after dark.';
  return '<b>BLACKWOOD GAZETTE:</b> Rumours spread as the search for Noah continues.';
}

function render(){
  save();
  $('tutorialText').textContent = tutorials[state.tutorial % tutorials.length];
  $('news').innerHTML = news();
  $('day').textContent = state.day;
  $('time').textContent = fmt(state.time);
  $('stamina').textContent = state.stamina;
  $('exposure').textContent = state.exposure;
  $('staminaBar').style.width = state.stamina + '%';
  $('exposureBar').style.width = state.exposure + '%';
  renderTasks(); renderMap(); renderContacts(); renderPhone(); renderSuspects(); renderDiary(); renderCase();
  $('storyLog').innerHTML = state.story.join('<hr>');
}

function renderTasks(){
  $('tasks').innerHTML = '';
  tasks.forEach(t => {
    const b = document.createElement('button');
    b.disabled = state.stamina - t.s < 0 || state.time + t.t > 1440;
    b.innerHTML = `${t.name}<div class="meta">⏱ ${Math.round(t.t/60*10)/10}h · ⚡ ${(t.s>=0?'-':'+')}${Math.abs(t.s)} · ⚠️ ${(t.e>=0?'+':'')}${t.e}</div>`;
    b.onclick = () => startTask(t);
    $('tasks').appendChild(b);
  });
  const end = document.createElement('button');
  end.className = 'secondary';
  end.textContent = '🌙 End Day / Sleep';
  end.onclick = endDay;
  $('tasks').appendChild(end);
}

function renderMap(){
  $('mapList').innerHTML = dataLocations.map(l => {
    const open = state.unlocked.includes(l.id) || l.unlocked;
    return `<div class="item">${open?'✅':'🔒'} <b>${open?l.name:'Unknown Location'}</b><br><span class="small">Risk: ${open?(l.risk || 'Unknown'):'Unknown'} · ${open?'Unlocked.':'Keep investigating to reveal this place.'}</span></div>`;
  }).join('');
}

function trustLabel(v){ return v<20?'Cold':v<40?'Cautious':v<60?'Open':v<80?'Trusted':'Close Ally'; }
function focusLabel(v){ return v<10?'Done talking':v<30?'Guarded':v<60?'Available':v<85?'Engaged':'Highly open'; }

function renderContacts(){
  $('contactsList').innerHTML = Object.values(state.people).map(p => `
    <div class="item">
      <b>${p.name}</b><br>
      <span class="small">${p.role}<br>Trust: ${trustLabel(p.trust)} · Focus: ${focusLabel(p.focus)} · ${p.phone?'📱 Phone unlocked':'🔒 Phone locked'}</span><br>
      <span class="badge">Health ${p.health}</span><span class="badge">Stamina ${p.stamina}</span><span class="badge gold">Focus ${p.focus}</span><span class="badge red">Stress ${p.stress}</span><span class="badge red">Fear ${p.fear}</span>
      ${p.memory.length?`<br><span class="badge">Memory: ${html(p.memory[0])}</span>`:''}
    </div>`).join('');
}

function renderPhone(){
  const unlocked = Object.values(state.people).filter(p => p.phone);
  $('phoneList').innerHTML = `
    <div class="item"><b>Contacts</b><br>${unlocked.length ? unlocked.map(p => `<span class="badge">${p.name}</span>`).join('') : '<span class="small">No personal numbers unlocked yet.</span>'}</div>
    <div class="item"><b>Messages</b>${state.messages.map(m => `<p class="phoneMsg ${m.threat?'threat':''}"><b>${m.from}:</b> ${html(m.text)}</p>`).join('')}</div>
    <div class="item"><b>Phone Apps</b><br><span class="badge">News</span><span class="badge">Map</span><span class="badge">Notes</span><span class="badge">Evidence</span><span class="badge">Camera soon</span></div>`;
}

function renderSuspects(){
  const box = $('suspectsList');
  box.innerHTML = '';
  Object.values(state.people).forEach(p => {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `<b>${p.name}</b><br><span class="small">Your rating: <b>${p.sus}</b> · Suspicion toward you: ${p.suspicionTowardPlayer}</span>`;
    ['Cleared','Suspicious','Prime Suspect'].forEach(r => {
      const b = document.createElement('button');
      b.className = 'secondary';
      b.textContent = 'Mark ' + r;
      b.onclick = () => { p.sus = r; render(); };
      div.appendChild(b);
    });
    box.appendChild(div);
  });
}

function renderDiary(){
  $('diaryList').innerHTML = '<h3>Evidence</h3>' + (state.clues.length ? state.clues.map(c => `<span class="badge">🧩 ${html(c)}</span>`).join('') : '<p class="small">No evidence yet.</p>') + '<h3>Notes</h3>' + state.notes.map(n => `<div class="item">Day ${n.day}, ${fmt(n.time)} — ${html(n.text)}</div>`).join('');
}

function renderCase(){
  $('caseFile').innerHTML = `<div class="item"><b>${state.killer.codename}</b><br><span class="small">Style: ${state.killer.style}<br>Clues gathered: ${state.clues.length}<br>Public Fear: ${state.town.publicFear}<br>Police Presence: ${state.town.policePresence}<br>Identity: <span class="danger">Unknown</span></span></div>`;
}

function renderNpcState(){
  const person = npc();
  $('npcStateBox').innerHTML = person ? `<span class="badge">Trust ${person.trust}</span><span class="badge gold">Focus ${person.focus}</span><span class="badge red">Stress ${person.stress}</span><span class="badge red">Fear ${person.fear}</span><span class="badge">Interest ${person.interest}</span><span class="badge">Suspicion ${person.suspicionTowardPlayer}</span>` : '';
}

function endDay(){
  runTownTick();
  state.day++;
  state.time = 390;
  state.stamina = 100;
  state.exposure = clamp(state.exposure - 8);
  Object.values(state.people).forEach(p => {
    p.focus = clamp(p.focus + 25);
    p.stamina = clamp(p.stamina + 20);
    p.stress = clamp(p.stress - 8);
  });
  const msg = state.exposure > 65 ? 'You wake to tyres crunching slowly outside. By the time you reach the window, the street is empty.' : 'Another day begins in Blackwood. Everyone has moved a little, even if you did not see it.';
  log('<b>End of Day:</b> ' + msg);
  render();
}

function runTownTick(){
  state.town.publicFear = clamp(state.town.publicFear + Math.floor(state.exposure/25));
  state.town.rumourIntensity = clamp(state.town.rumourIntensity + Math.floor(state.clues.length/3));
  if (state.exposure > 55 && !state.messages.some(m => m.text.includes('Stop asking'))) {
    state.messages.unshift({ from:'Unknown', text:'Stop asking about Noah.', threat:true });
    log('Your phone buzzes with a message from Unknown.');
  }
}

function attachEvents(){
  $('tutorialNext').onclick = () => { state.tutorial++; render(); };
  $('resetBtn').onclick = () => { if (confirm('Reset investigation?')) { localStorage.removeItem(SAVE_KEY); state = fresh(fallbackCharacters); render(); } };
  $('leaveSceneBtn').onclick = () => { $('sceneOverlay').classList.add('hidden'); log('You leave the scene. The town keeps moving.'); render(); };
  $('saveNoteBtn').onclick = () => { const v = $('noteInput').value.trim(); if (v) { state.notes.unshift({ day:state.day, time:state.time, text:v }); $('noteInput').value = ''; render(); } };
  $('sendTalkBtn').onclick = localTalk;
  document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    $(b.dataset.tab).classList.add('active');
    document.querySelectorAll('.tabs button').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    render();
  });
  document.querySelector('.tabs button').classList.add('active');
}

function localTalk(){
  const text = $('freeTalk').value.trim();
  const person = npc();
  if (!text || !person) return;
  if (text.length > 400) { alert('Keep it under 400 characters for Alpha 0.3.'); return; }
  if (focusBlocked(person)) {
    $('sceneText').innerHTML += `<hr><span class="player">You:</span> ${html(text)}<br><br><span class="speaker">${person.name}:</span> “I cannot keep talking about this.”`;
    $('freeTalk').value = '';
    renderNpcState();
    return;
  }
  const intent = inferIntent(text);
  const cost = focusCost(intent);
  applyNpcDelta(person, { focus:-cost, trust:intent==='emotionalQuestion'?2:1, stress:intent==='accusation'?6:0, suspicion:intent==='accusation'?8:0 });
  person.repliesThisScene++;
  person.memory.unshift('Player said: ' + text.slice(0, 120));
  const reply = localReply(person, text, intent);
  $('sceneText').innerHTML += `<hr><span class="player">You:</span> ${html(text)}<br><br><span class="speaker">${person.name}:</span> ${reply}<div class="meta">NPC Focus -${cost}</div>`;
  $('freeTalk').value = '';
  render();
  renderNpcState();
}

function inferIntent(text){
  const t = text.toLowerCase();
  if (t.includes('kill') || t.includes('killer') || t.includes('murder') || t.includes('noah')) return 'caseQuestion';
  if (t.includes('why') || t.includes('scared') || t.includes('feel')) return 'emotionalQuestion';
  if (t.includes('tell me') || t.includes('secret') || t.includes('hide')) return 'askForSecret';
  if (t.includes('you did') || t.includes('liar') || t.includes('accuse')) return 'accusation';
  return 'casualQuestion';
}

function localReply(person, text, intent){
  if (person.focus < 20) return '“Not now. I am done talking.”';
  if (person.id === 'emily_hart') return intent === 'caseQuestion' ? '“Noah was scared. I keep thinking about the way he looked at the door every time someone walked in.”' : '“I want to help, but I need to know I can trust you first.”';
  if (person.id === 'detective_mason') return state.clues.length >= 3 ? '“Put everything in order. Dates, times, names. Then maybe we have something.”' : '“Bring evidence, not theories.”';
  if (person.id === 'alex_vale') return '“Blackwood has old roads people forgot about. That does not mean I know what happened to Noah.”';
  if (person.id === 'mara_bell') return '“This town remembers things poorly. That is why people repeat them.”';
  if (person.id === 'sarah_pike') return '“Careful. Once a story goes public, you cannot put it back in the box.”';
  return '“I do not know what to say.”';
}
