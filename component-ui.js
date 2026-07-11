(() => {
  'use strict';

  const VERSION = 'components-3';
  const PANEL_NAMES = [
    'header', 'hero', 'news', 'clock', 'stamina',
    'exposure', 'chapter', 'tasks', 'events', 'nav'
  ];

  let ready = false;
  let syncTimer = null;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    void init();
  }

  async function init() {
    document.body.classList.add('component-ui-active');
    buildShell();
    observeGame();

    try {
      const panels = await preloadPanels();
      applyPanels(panels);
      ready = true;
      document.getElementById('componentUi')?.classList.add('ready');
      syncAll();
      syncTimer = window.setInterval(syncAll, 1000);
    } catch (error) {
      console.error('Exposure component UI failed:', error);
      const message = document.querySelector('#componentUi .component-loading');
      if (message) {
        message.textContent = 'The Blackwood interface could not load. Tap to retry.';
        message.addEventListener('click', () => location.reload(), { once: true });
      }
    }
  }

  function buildShell() {
    if (document.getElementById('componentUi')) return;

    const root = document.createElement('div');
    root.id = 'componentUi';
    root.innerHTML = `
      <main class="component-shell" aria-label="Exposure game dashboard">
        <section class="component-home" id="componentHome">
          <div class="component-panel component-header" data-panel="header"></div>

          <button class="component-panel component-hero" data-panel="hero" id="componentEnter" type="button" aria-label="Enter Blackwood"></button>

          <div class="component-grid two">
            <button class="component-panel component-news" data-panel="news" id="componentNews" type="button">
              <span class="panel-veil news-veil"></span>
              <span class="dynamic news-dynamic">
                <span class="eyebrow">Blackwood News</span>
                <span class="red-dot-label">Latest headline</span>
                <strong id="componentNewsHeadline">Local teen disappears without a trace</strong>
                <span id="componentNewsSummary">No leads. No witnesses. Another name added to the list.</span>
                <small>Read more →</small>
              </span>
            </button>

            <div class="component-panel component-clock" data-panel="clock">
              <span class="panel-veil full-veil"></span>
              <span class="dynamic clock-dynamic">
                <span id="componentDayLabel" class="eyebrow">Day 1 · Saturday</span>
                <strong id="componentTime">--:--</strong>
                <span id="componentDate">Greywick County</span>
                <span id="componentWeather">Raining · 9°C</span>
              </span>
            </div>
          </div>

          <div class="component-grid two">
            <div class="component-panel component-stat" data-panel="stamina">
              <span class="panel-veil stat-veil"></span>
              <span class="dynamic stat-dynamic">
                <span class="eyebrow">⚡ Stamina</span>
                <strong><b id="componentStamina">100</b><small>/100</small></strong>
                <span class="meter"><i id="componentStaminaBar"></i></span>
                <small id="componentStaminaRegen">Ready</small>
              </span>
            </div>

            <div class="component-panel component-stat exposure-stat" data-panel="exposure">
              <span class="panel-veil stat-veil"></span>
              <span class="dynamic stat-dynamic">
                <span class="eyebrow">◉ Exposure</span>
                <strong class="danger"><b id="componentExposure">0</b><small>%</small></strong>
                <span class="meter red"><i id="componentExposureBar"></i></span>
                <small>The darker it gets, the closer it gets.</small>
              </span>
            </div>
          </div>

          <div class="component-grid two lower-grid">
            <button class="component-panel component-chapter" data-panel="chapter" id="componentChapter" type="button">
              <span class="paper-mask"></span>
              <span class="dynamic chapter-dynamic">
                <span class="eyebrow" id="componentChapterMeta">Chapter I</span>
                <strong id="componentChapterTitle">The Road Into Blackwood</strong>
                <span id="componentChapterSummary">Every clue becomes part of your living book.</span>
                <small>View chapter →</small>
              </span>
            </button>

            <div class="component-panel component-tasks" data-panel="tasks">
              <span class="panel-veil tasks-veil"></span>
              <span class="dynamic tasks-dynamic">
                <div class="task-head">
                  <span class="eyebrow">Tasks</span>
                  <small id="componentTaskCount">0 active</small>
                </div>
                <div id="componentTaskList" class="component-task-list"></div>
              </span>
            </div>
          </div>

          <button class="component-panel component-events" data-panel="events" id="componentEvents" type="button">
            <span class="panel-veil events-veil"></span>
            <span class="dynamic events-dynamic">
              <div class="events-head">
                <span class="eyebrow">◷ Recent Events</span>
                <small>View all</small>
              </div>
              <div id="componentEventList" class="component-event-list"></div>
            </span>
          </button>
        </section>

        <nav class="component-panel component-nav" data-panel="nav" aria-label="Primary navigation">
          <span class="nav-veil"></span>
          <div class="dynamic component-nav-items">
            ${navButton('home', '⌂', 'Home')}
            ${navButton('book', '▥', 'Book')}
            ${navButton('map', '⌖', 'Map')}
            ${navButton('contacts', '♟', 'People')}
            ${navButton('phone', '☎', 'Phone')}
            ${navButton('suspects', '♜', 'Suspects')}
            ${navButton('diary', '▤', 'Notes')}
            ${navButton('case', '▣', 'Case')}
          </div>
        </nav>

        <div class="component-loading">Loading Blackwood…</div>
      </main>`;

    document.body.appendChild(root);

    root.querySelector('#componentEnter')?.addEventListener('click', () => openTab('map'));
    root.querySelector('#componentNews')?.addEventListener('click', () => openTab('book'));
    root.querySelector('#componentChapter')?.addEventListener('click', () => {
      document.getElementById('viewMemoryBtn')?.click();
      if (document.getElementById('bookOverlay')?.classList.contains('hidden')) openTab('book');
    });
    root.querySelector('#componentEvents')?.addEventListener('click', () => openTab('book'));
    root.querySelectorAll('[data-component-tab]').forEach(button => {
      button.addEventListener('click', () => openTab(button.dataset.componentTab));
    });
  }

  function navButton(id, icon, label) {
    return `<button type="button" data-component-tab="${id}" aria-label="${label}"><span>${icon}</span><small>${label}</small></button>`;
  }

  async function preloadPanels() {
    const entries = await Promise.all(PANEL_NAMES.map(async name => {
      const webp = `assets/ui/components/${name}.webp?v=${VERSION}`;
      const png = `assets/ui/components/${name}.png?v=${VERSION}`;
      const url = await loadImageWithFallback(webp, png);
      return [name, url];
    }));
    return Object.fromEntries(entries);
  }

  function loadImageWithFallback(primary, fallback) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => resolve(image.currentSrc || image.src);
      image.onerror = () => {
        if (image.dataset.fallback === '1') {
          reject(new Error(`Unable to load ${primary} or ${fallback}`));
          return;
        }
        image.dataset.fallback = '1';
        image.src = fallback;
      };
      image.src = primary;
    });
  }

  function applyPanels(panels) {
    document.querySelectorAll('#componentUi [data-panel]').forEach(panel => {
      const url = panels[panel.dataset.panel];
      if (url) panel.style.setProperty('--panel-image', `url("${url}")`);
    });
  }

  function syncAll() {
    if (!ready) return;
    syncClock();
    syncStats();
    syncNews();
    syncChapter();
    syncTasks();
    syncEvents();
    syncActiveTab();
  }

  function syncClock() {
    const now = new Date();
    setText('componentTime', textOf('time') || now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
    setText(
      'componentDate',
      `${textOf('dateDisplay') || now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })} · Greywick County`
    );
    setText(
      'componentDayLabel',
      textOf('day')
        ? `Day ${textOf('day')} · ${now.toLocaleDateString(undefined, { weekday: 'long' })}`
        : now.toLocaleDateString(undefined, { weekday: 'long' })
    );
    setText('componentWeather', textOf('periodDisplay') || 'Raining · 9°C');
  }

  function syncStats() {
    const stamina = numberOf('stamina', 100);
    const exposure = numberOf('exposure', 0);
    setText('componentStamina', stamina);
    setText('componentExposure', exposure);
    setWidth('componentStaminaBar', stamina);
    setWidth('componentExposureBar', exposure);
  }

  function syncNews() {
    const news = textOf('news');
    if (!news) return;
    setText('componentNewsHeadline', news.replace(/^Blackwood News\s*:?\s*/i, '').trim().slice(0, 110));
  }

  function syncChapter() {
    setText('componentChapterTitle', textOf('currentChapterTitle') || 'The Road Into Blackwood');
    setText('componentChapterMeta', textOf('currentChapterMeta') || 'Current chapter');
    const memory = textOf('recentMemoryText');
    if (memory) setText('componentChapterSummary', memory.slice(0, 120));
  }

  function syncTasks() {
    const sourceButtons = [...document.querySelectorAll('#tasks button')];
    const list = document.getElementById('componentTaskList');
    if (!list) return;

    setText('componentTaskCount', `${sourceButtons.filter(button => !button.disabled).length} active`);
    list.innerHTML = '';

    sourceButtons.slice(0, 3).forEach((source, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.disabled = source.disabled;
      button.innerHTML = `
        <span class="task-icon">${index + 1}</span>
        <span>
          <strong>${escapeHtml(source.textContent.replace(/\s+/g, ' ').trim())}</strong>
          <small>${source.disabled ? 'Unavailable at this time.' : 'Open investigation task.'}</small>
        </span>
        <b>›</b>`;
      button.addEventListener('click', () => source.click());
      list.appendChild(button);
    });
  }

  function syncEvents() {
    const list = document.getElementById('componentEventList');
    if (!list) return;

    const texts = [...document.querySelectorAll('#storyLog > *')]
      .map(node => node.textContent.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .slice(-3)
      .reverse();

    if (!texts.length) {
      texts.push(textOf('recentMemoryText') || 'You arrived in Blackwood. The town has already begun to remember you.');
    }

    list.innerHTML = texts
      .map((text, index) => `<div><time>${index === 0 ? 'NOW' : 'RECENT'}</time><span>${escapeHtml(text.slice(0, 150))}</span></div>`)
      .join('');
  }

  function syncActiveTab() {
    const active = document.querySelector('.screen.active')?.id || 'home';
    document.querySelectorAll('[data-component-tab]').forEach(button => {
      button.classList.toggle('active', button.dataset.componentTab === active);
    });
  }

  function openTab(id) {
    const original = document.querySelector(`nav.tabs button[data-tab="${id}"]`);
    if (!original) return;
    original.click();
    document.body.classList.toggle('component-native-view', id !== 'home');
    syncActiveTab();
  }

  function observeGame() {
    const observer = new MutationObserver(() => {
      const active = document.querySelector('.screen.active')?.id || 'home';
      const bookOpen = Boolean(document.getElementById('bookOverlay') && !document.getElementById('bookOverlay').classList.contains('hidden'));
      const sceneOpen = Boolean(document.getElementById('sceneOverlay') && !document.getElementById('sceneOverlay').classList.contains('hidden'));
      document.body.classList.toggle('component-native-view', active !== 'home' || bookOpen || sceneOpen);
      syncAll();
    });

    document.querySelectorAll('.screen, #bookOverlay, #sceneOverlay, #tasks, #storyLog').forEach(node => {
      observer.observe(node, { childList: true, subtree: true, attributes: true, characterData: true });
    });
  }

  function textOf(id) {
    return document.getElementById(id)?.textContent?.replace(/\s+/g, ' ').trim() || '';
  }

  function numberOf(id, fallback) {
    const parsed = Number.parseInt(textOf(id), 10);
    return Number.isFinite(parsed) ? Math.max(0, Math.min(100, parsed)) : fallback;
  }

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node && node.textContent !== String(value)) node.textContent = String(value);
  }

  function setWidth(id, value) {
    const node = document.getElementById(id);
    if (node) node.style.width = `${Math.max(0, Math.min(100, value))}%`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    })[character]);
  }

  window.addEventListener('beforeunload', () => {
    if (syncTimer) window.clearInterval(syncTimer);
  });
})();
