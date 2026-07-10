(() => {
  'use strict';

  const BOOK_KEY = 'exposure-memory-book-v1';
  const PROLOGUE_KEY = 'exposure-prologue-complete-v1';
  const SPEED_KEY = 'exposure-reader-speed-v1';

  const taskConfig = {
    emily:{id:'emily',name:'Meet Emily at Café Hollow',t:45,s:8,e:4},
    noah:{id:'noah',name:"Visit Noah's house",t:120,s:18,e:10},
    forest:{id:'forest',name:'Search Blackwood Forest',t:180,s:32,e:18},
    mason:{id:'mason',name:'Visit Detective Mason',t:75,s:8,e:12},
    alex:{id:'alex',name:'Ask Alex about old roads',t:60,s:6,e:3},
    mara:{id:'mara',name:'Talk to Mara Bell',t:45,s:5,e:4},
    sarah:{id:'sarah',name:'Help Sarah with article',t:90,s:12,e:15},
    anonymous:{id:'anonymous',name:'Follow anonymous text',t:150,s:25,e:30},
    library:{id:'library',name:'Library research',t:90,s:10,e:2},
    rest:{id:'rest',name:'Rest at home',t:120,s:-30,e:-4}
  };

  const taskByName = Object.fromEntries(Object.values(taskConfig).map(task => [task.name, task]));

  let content = null;
  let active = null;
  let pageIndex = 0;
  let typingTimer = null;
  let fullyRevealed = false;
  let pendingTask = null;
  let lastTaskId = null;
  let originalStartTask = null;
  let readerSpeed = Number(localStorage.getItem(SPEED_KEY) || 18);

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    content = await loadJson('data/book-content.json');
    bindUi();
    interceptTasks();
    interceptSceneExit();
    renderLibrary();

    if (content && !localStorage.getItem(PROLOGUE_KEY)) {
      window.setTimeout(openPrologue, 350);
    }
  }

  async function loadJson(path) {
    try {
      const response = await fetch(path, { cache:'no-store' });
      if (!response.ok) throw new Error(path);
      return await response.json();
    } catch (error) {
      console.error('Book content failed to load', error);
      return null;
    }
  }

  function bindUi() {
    byId('bookNextBtn').addEventListener('click', nextPage);
    byId('bookPrevBtn').addEventListener('click', previousPage);
    byId('bookRevealBtn').addEventListener('click', revealPage);
    byId('bookBookmarkBtn').addEventListener('click', toggleBookmark);
    byId('bookCloseBtn').addEventListener('click', closeReader);
    byId('bookSearch').addEventListener('input', renderLibrary);
    byId('readerSpeed').value = String(readerSpeed);
    byId('readerSpeed').addEventListener('change', event => {
      readerSpeed = Number(event.target.value);
      localStorage.setItem(SPEED_KEY, String(readerSpeed));
    });
  }

  function interceptTasks() {
    originalStartTask = window.startTask;
    const tasks = byId('tasks');

    tasks.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button || button.disabled) return;
      const title = button.childNodes[0]?.textContent?.trim() || button.textContent.trim();
      const task = taskByName[title];
      if (!task || !content?.tasks?.[task.id]) return;

      const livingGate = window.ExposureLiving?.evaluateTask?.(task) || { allowed:true };
      if (!livingGate.allowed) {
        event.preventDefault();
        event.stopImmediatePropagation();
        window.ExposureLiving?.openTaskGate?.(task, livingGate);
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      pendingTask = task;
      lastTaskId = task.id;
      window.ExposureLiving?.onTaskStarted?.(task, livingGate);

      openTaskChapter(task.id, 'outbound', () => {
        if (typeof originalStartTask === 'function') originalStartTask(task);
      });
    }, true);
  }

  function interceptSceneExit() {
    const leave = byId('leaveSceneBtn');
    leave.addEventListener('click', () => {
      if (!lastTaskId) return;
      const returnId = lastTaskId;
      window.ExposureLiving?.onTaskCompleted?.(returnId);
      if (!content?.tasks?.[returnId]?.return) return;
      window.setTimeout(() => openTaskChapter(returnId, 'return'), 180);
    });
  }

  function openPrologue() {
    if (!content?.prologue) return;
    const prologue = content.prologue;
    openReader({
      id:prologue.id,
      day:prologue.day,
      chapter:prologue.chapter,
      title:prologue.title,
      pages:deepClone(prologue.pages),
      type:'prologue',
      onComplete:() => {
        localStorage.setItem(PROLOGUE_KEY, 'true');
        saveEntry({
          id:prologue.id,
          day:0,
          chapter:'Prologue',
          title:prologue.title,
          pages:prologue.pages.map(page => ({ text:page.text })),
          completedAt:new Date().toISOString(),
          bookmarked:false,
          type:'prologue'
        });
        renderLibrary();
      }
    });
  }

  function openTaskChapter(taskId, phase, onComplete) {
    const sourceSection = content?.tasks?.[taskId]?.[phase];
    if (!sourceSection) {
      onComplete?.();
      return;
    }

    const section = window.ExposureLiving?.decorateChapter?.(taskId, phase, sourceSection) || deepClone(sourceSection);
    const day = Number(byId('day')?.textContent || 1);
    const chapterNumber = readBook().length + 1;

    openReader({
      id:`${taskId}_${phase}_${Date.now()}`,
      taskId,
      phase,
      day,
      chapter:`Chapter ${chapterNumber}`,
      title:section.title,
      pages:deepClone(section.pages),
      type:phase === 'return' ? 'reflection' : 'travel',
      onComplete:() => {
        const entry = {
          id:active.id,
          day,
          chapter:active.chapter,
          title:active.title,
          taskId,
          phase,
          pages:active.pages.map(page => ({
            text:page.text,
            selectedChoice:page.selectedChoice || null,
            choiceResult:page.choiceResult || null
          })),
          completedAt:new Date().toISOString(),
          bookmarked:false,
          type:active.type
        };
        saveEntry(entry);
        renderLibrary();
        onComplete?.();
      }
    });
  }

  function openReader(chapter) {
    clearTyping();
    active = chapter;
    pageIndex = 0;
    fullyRevealed = false;
    byId('bookOverlay').classList.remove('hidden');
    document.body.classList.add('book-open');
    renderPage();
  }

  function closeReader() {
    if (active?.type === 'prologue' && !localStorage.getItem(PROLOGUE_KEY)) return;
    clearTyping();
    byId('bookOverlay').classList.add('hidden');
    document.body.classList.remove('book-open');
    active = null;
  }

  function renderPage() {
    if (!active) return;
    clearTyping();
    fullyRevealed = false;

    const page = active.pages[pageIndex];
    byId('bookDay').textContent = active.day === 0 ? 'Before Day One' : `Day ${active.day}`;
    byId('bookChapter').textContent = active.chapter;
    byId('bookTitle').textContent = active.title;
    byId('bookPageNumber').textContent = `Page ${pageIndex + 1} of ${active.pages.length}`;
    byId('bookText').textContent = '';
    byId('bookChoices').innerHTML = '';
    byId('bookPrevBtn').disabled = pageIndex === 0;
    byId('bookNextBtn').textContent = pageIndex === active.pages.length - 1 ? 'Close chapter' : 'Continue';
    byId('bookBookmarkBtn').style.display = active.type === 'memory' ? '' : 'none';
    byId('bookCloseBtn').style.visibility = active.type === 'prologue' && !localStorage.getItem(PROLOGUE_KEY) ? 'hidden' : 'visible';

    if (active.type === 'memory' || readerSpeed === 0) {
      byId('bookText').textContent = page.text;
      fullyRevealed = true;
      renderChoices(page);
      return;
    }

    typeText(page.text, () => renderChoices(page));
  }

  function typeText(text, done) {
    let index = 0;
    const target = byId('bookText');
    typingTimer = window.setInterval(() => {
      target.textContent += text[index] || '';
      index += 1;
      if (index >= text.length) {
        clearTyping();
        fullyRevealed = true;
        done?.();
      }
    }, readerSpeed);
  }

  function revealPage() {
    if (!active) return;
    const page = active.pages[pageIndex];
    clearTyping();
    byId('bookText').textContent = page.text;
    fullyRevealed = true;
    renderChoices(page);
  }

  function renderChoices(page) {
    const box = byId('bookChoices');
    box.innerHTML = '';
    if (!page.choices?.length || page.selectedChoice) {
      if (page.choiceResult) {
        const result = document.createElement('div');
        result.className = 'book-choice-result';
        result.textContent = page.choiceResult;
        box.appendChild(result);
      }
      return;
    }

    page.choices.forEach(choice => {
      const button = document.createElement('button');
      button.className = 'book-choice';
      button.textContent = choice.label;
      button.addEventListener('click', () => selectChoice(page, choice));
      box.appendChild(button);
    });
  }

  function selectChoice(page, choice) {
    page.selectedChoice = choice.label;
    page.choiceResult = choice.result;

    if (choice.clue && typeof window.addClue === 'function') {
      window.addClue(choice.clue);
      if (typeof window.log === 'function') window.log(`Observation recorded: ${choice.clue}`);
      if (typeof window.render === 'function') window.render();
    }

    renderChoices(page);
  }

  function nextPage() {
    if (!active) return;
    if (!fullyRevealed) {
      revealPage();
      return;
    }

    const page = active.pages[pageIndex];
    if (page.choices?.length && !page.selectedChoice) return;

    if (pageIndex < active.pages.length - 1) {
      pageIndex += 1;
      renderPage();
      return;
    }

    const complete = active.onComplete;
    clearTyping();
    byId('bookOverlay').classList.add('hidden');
    document.body.classList.remove('book-open');
    complete?.();
    active = null;
    pendingTask = null;
  }

  function previousPage() {
    if (!active || pageIndex === 0) return;
    pageIndex -= 1;
    renderPage();
  }

  function clearTyping() {
    if (typingTimer) window.clearInterval(typingTimer);
    typingTimer = null;
  }

  function readBook() {
    try {
      return JSON.parse(localStorage.getItem(BOOK_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function saveEntry(entry) {
    const book = readBook();
    const existing = book.findIndex(item => item.id === entry.id);
    if (existing >= 0) book[existing] = entry;
    else book.unshift(entry);
    localStorage.setItem(BOOK_KEY, JSON.stringify(book.slice(0, 250)));
  }

  function renderLibrary() {
    const list = byId('bookList');
    if (!list) return;
    const query = (byId('bookSearch')?.value || '').trim().toLowerCase();
    const entries = readBook().filter(entry => {
      const searchable = `${entry.title} ${entry.chapter} ${entry.pages.map(page => page.text).join(' ')}`.toLowerCase();
      return !query || searchable.includes(query);
    });

    if (!entries.length) {
      list.innerHTML = '<div class="empty-book">Your Memory Book is empty. Begin the story to create the first chapter.</div>';
      return;
    }

    list.innerHTML = '';
    entries.forEach(entry => {
      const card = document.createElement('button');
      card.className = 'memory-entry';
      card.innerHTML = `<span class="memory-entry-meta">${entry.day === 0 ? 'Before Day One' : `Day ${entry.day}`} · ${escapeHtml(entry.chapter)}</span><strong>${entry.bookmarked ? '🔖 ' : ''}${escapeHtml(entry.title)}</strong><span>${escapeHtml(entry.pages[0]?.text || '').slice(0, 130)}...</span>`;
      card.addEventListener('click', () => openMemory(entry.id));
      list.appendChild(card);
    });
  }

  function openMemory(id) {
    const entry = readBook().find(item => item.id === id);
    if (!entry) return;
    openReader({ ...deepClone(entry), type:'memory', onComplete:null });
    byId('bookBookmarkBtn').style.display = '';
  }

  function toggleBookmark() {
    if (!active?.id) return;
    const book = readBook();
    const entry = book.find(item => item.id === active.id);
    if (!entry) return;
    entry.bookmarked = !entry.bookmarked;
    active.bookmarked = entry.bookmarked;
    localStorage.setItem(BOOK_KEY, JSON.stringify(book));
    byId('bookBookmarkBtn').textContent = entry.bookmarked ? 'Remove bookmark' : 'Bookmark page';
    renderLibrary();
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function deepClone(value) {
    return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, char => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
    }[char]));
  }

  window.ExposureBook = {
    openPrologue,
    openMemory,
    openReader,
    saveEntry,
    renderLibrary,
    readBook
  };
})();
