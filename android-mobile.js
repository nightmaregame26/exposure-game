(() => {
  'use strict';

  const VERSION = 'android-2';
  const MEDIA = window.matchMedia('(max-width: 700px) and (orientation: portrait)');
  const MASTER_WIDTH = 864;
  const MASTER_HEIGHT = 1536;
  const CROPS = {
    header: [0, 0, 864, 174],
    hero: [26, 174, 812, 390],
    news: [27, 568, 431, 202],
    clock: [466, 568, 372, 202],
    stamina: [28, 777, 363, 171],
    exposure: [398, 777, 440, 171],
    chapter: [28, 953, 386, 239],
    tasks: [421, 953, 417, 239],
    events: [28, 1198, 810, 208],
    nav: [14, 1425, 837, 105]
  };

  let root = null;
  let syncTimer = null;
  let observer = null;
  const objectUrls = [];

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  function init() {
    if (!MEDIA.matches) return;

    document.body.classList.add('android-mobile-active');
    buildMobileHome();
    bindGameObservers();
    loadApprovedArtwork();
    syncAll();

    syncTimer = window.setInterval(syncAll, 1000);
    window.addEventListener('pageshow', recover);
    window.addEventListener('orientationchange', recover);
    MEDIA.addEventListener?.('change', recover);
  }

  function buildMobileHome() {
    if (document.getElementById('androidBuild')) {
      root = document.getElementById('androidBuild');
      return;
    }

    root = document.createElement('div');
    root.id = 'androidBuild';
    root.innerHTML = `
      <main class="android-shell" aria-label="Exposure mobile game home">
        <section class="android-home" id="androidHome">
          <div class="android-panel android-header" data-panel="header" aria-label="Exposure — Blackwood, Greywick County"></div>

          <button class="android-panel android-hero" data-panel="hero" data-open-tab="map" type="button" aria-label="Enter Blackwood"></button>

          <div class="android-row android-row-news">
            <button class="android-panel android-news" data-panel="news" data-open-tab="book" type="button" aria-label="Open Blackwood News">
              <span class="android-veil news-veil"></span>
              <span class="android-dynamic news-content">
                <span class="ui-title">▤ Blackwood News</span>
                <span class="ui-alert">● Latest headline</span>
                <strong id="androidNewsHeadline">Local Teen Disappears Without a Trace</strong>
                <span id="androidNewsSummary">No leads. No witnesses. Another name added to the list.</span>
                <small>Read more →</small>
              </span>
            </button>

            <div class="android-panel android-clock" data-panel="clock" aria-label="Current Blackwood time">
              <span class="android-veil clock-veil"></span>
              <span class="android-dynamic clock-content">
                <span class="ui-title" id="androidDayLabel">Day 1 · Saturday</span>
                <strong id="androidTime">--:--</strong>
                <span id="androidDate">Greywick County</span>
                <span id="androidWeather">Raining · 9°C</span>
              </span>
            </div>
          </div>

          <div class="android-row android-row-stats">
            <div class="android-panel android-stat" data-panel="stamina" aria-label="Stamina">
              <span class="android-veil stat-veil"></span>
              <span class="android-dynamic stat-content">
                <span class="ui-title">⚡ Stamina</span>
                <strong><b id="androidStamina">100</b><small>/100</small></strong>
                <span class="ui-meter"><i id="androidStaminaBar"></i></span>
                <span class="stat-caption" id="androidStaminaCaption">Ready</span>
              </span>
            </div>

            <div class="android-panel android-stat android-exposure" data-panel="exposure" aria-label="Exposure">
              <span class="android-veil exposure-veil"></span>
              <span class="android-dynamic stat-content">
                <span class="ui-title">◉ Exposure</span>
                <strong class="danger"><b id="androidExposure">0</b><small>%</small></strong>
                <span class="ui-meter red"><i id="androidExposureBar"></i></span>
                <span class="stat-caption">The darker it gets, the closer it gets.</span>
              </span>
            </div>
          </div>

          <div class="android-row android-row-lower">
            <button class="android-panel android-chapter" data-panel="chapter" id="androidChapter" type="button" aria-label="Open current chapter">
              <span class="android-veil chapter-veil"></span>
              <span class="android-dynamic chapter-content">
                <span class="chapter-label" id="androidChapterMeta">Prologue</span>
                <strong id="androidChapterTitle">The Road Into Blackwood</strong>
                <span id="androidChapterSummary">The truth is here. You just have to connect it.</span>
                <small>View chapter →</small>
              </span>
            </button>

            <div class="android-panel android-tasks" data-panel="tasks" aria-label="Active investigation tasks">
              <span class="android-veil tasks-veil"></span>
              <span class="android-dynamic tasks-content">
                <div class="tasks-heading"><span class="ui-title">▣ Tasks</span><small id="androidTaskCount">0 active</small></div>
                <div id="androidTaskList" class="android-task-list"></div>
              </span>
            </div>
          </div>

          <button class="android-panel android-events" data-panel="events" data-open-tab="book" type="button" aria-label="Open recent events">
            <span class="android-veil events-veil"></span>
            <span class="android-dynamic events-content">
              <div class="events-heading"><span class="ui-title">◷ Recent Events</span><small>View all</small></div>
              <div id="androidEventList" class="android-event-list"></div>
            </span>
          </button>
        </section>

        <nav class="android-panel android-nav" data-panel="nav" aria-label="Exposure navigation">
          <span class="android-veil nav-veil"></span>
          <div class="android-nav-items">
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

        <div class="android-loading" role="status">Loading Blackwood…</div>
      </main>`;

    document.body.appendChild(root);

    root.addEventListener('click', event => {
      const taskButton = event.target.closest('[data-source-task]');
      if (taskButton) {
        const taskIndex = Number(taskButton.dataset.sourceTask);
        const source = [...document.querySelectorAll('#tasks button')][taskIndex];
        source?.click();
        return;
      }

      const tabButton = event.target.closest('[data-mobile-tab]');
      if (tabButton) {
        const tab = tabButton.dataset.mobileTab;
        if (tab === 'home') returnHome();
        else openNativeTab(tab);
        return;
      }

      const openButton = event.target.closest('[data-open-tab]');
      if (openButton) openNativeTab(openButton.dataset.openTab);
    });

    root.querySelector('#androidChapter')?.addEventListener('click', () => {
      document.getElementById('viewMemoryBtn')?.click();
      requestAnimationFrame(syncViewState);
    });
  }

  function navButton(id, icon, label) {
    return `<button type="button" data-mobile-tab="${id}" aria-label="${label}"></button>`;
  }

  async function loadApprovedArtwork() {
    try {
      const master = await loadImage(`/api/artwork?screen=home&v=${VERSION}`);
      const panels = await cropApprovedPanels(master);

      root.querySelectorAll('[data-panel]').forEach(panel => {
        const url = panels[panel.dataset.panel];
        if (url) panel.style.setProperty('--panel-image', `url("${url}")`);
      });

      root.classList.add('ready');
    } catch (error) {
      console.error('Exposure Android artwork failed:', error);
      failToNativeUI();
    }
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Artwork failed to load: ${src}`));
      image.src = src;
      image.decode?.().then(() => {
        if (image.naturalWidth) resolve(image);
      }).catch(() => {});
    });
  }

  async function cropApprovedPanels(image) {
    const scaleX = image.naturalWidth / MASTER_WIDTH;
    const scaleY = image.naturalHeight / MASTER_HEIGHT;
    const entries = [];

    for (const [name, [x, y, width, height]] of Object.entries(CROPS)) {
      const sourceX = Math.round(x * scaleX);
      const sourceY = Math.round(y * scaleY);
      const sourceWidth = Math.round(width * scaleX);
      const sourceHeight = Math.round(height * scaleY);
      const canvas = document.createElement('canvas');
      canvas.width = sourceWidth;
      canvas.height = sourceHeight;
      const context = canvas.getContext('2d', { alpha: false });

      if (!context) throw new Error('Canvas rendering is unavailable.');
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);

      const blob = await canvasBlob(canvas);
      const url = URL.createObjectURL(blob);
      objectUrls.push(url);
      entries.push([name, url]);
    }

    return Object.fromEntries(entries);
  }

  function canvasBlob(canvas) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error('Approved panel could not be rendered.'));
      }, 'image/webp', 0.96);
    });
  }

  function bindGameObservers() {
    observer = new MutationObserver(() => {
      syncViewState();
      syncAll();
    });

    document.querySelectorAll('.screen, #bookOverlay, #sceneOverlay, #tasks, #storyLog').forEach(node => {
      observer.observe(node, {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true
      });
    });

    syncViewState();
  }

  function syncViewState() {
    const activeScreen = document.querySelector('.screen.active')?.id || 'home';
    const bookOpen = isOverlayOpen('bookOverlay');
    const sceneOpen = isOverlayOpen('sceneOverlay');
    const showNative = activeScreen !== 'home' || bookOpen || sceneOpen;

    document.body.classList.toggle('android-native-view', showNative);
    syncActiveNavigation(activeScreen);
  }

  function isOverlayOpen(id) {
    const overlay = document.getElementById(id);
    return Boolean(overlay && !overlay.classList.contains('hidden'));
  }

  function openNativeTab(tab) {
    const button = document.querySelector(`nav.tabs button[data-tab="${tab}"]`);
    if (!button) return;
    document.body.classList.add('android-native-view');
    button.click();
    requestAnimationFrame(syncViewState);
  }

  function returnHome() {
    const button = document.querySelector('nav.tabs button[data-tab="home"]');
    button?.click();
    document.body.classList.remove('android-native-view');
    window.scrollTo({ top: 0, behavior: 'auto' });
    syncActiveNavigation('home');
  }

  function syncAll() {
    if (!root) return;
    syncClock();
    syncStats();
    syncNews();
    syncChapter();
    syncTasks();
    syncEvents();
  }

  function syncClock() {
    const now = new Date();
    const gameTime = textOf('time') || now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const dayNumber = textOf('day') || '1';
    const weekday = now.toLocaleDateString(undefined, { weekday: 'long' });
    const date = textOf('dateDisplay') || now.toLocaleDateString(undefined, { day: 'numeric', month: 'long' });
    const period = textOf('periodDisplay') || 'Raining · 9°C';

    setText('androidTime', gameTime);
    setText('androidDayLabel', `Day ${dayNumber} · ${weekday}`);
    setText('androidDate', `${date} · Greywick County`);
    setText('androidWeather', period);
  }

  function syncStats() {
    const stamina = numberOf('stamina', 100);
    const exposure = numberOf('exposure', 0);

    setText('androidStamina', stamina);
    setText('androidExposure', exposure);
    setWidth('androidStaminaBar', stamina);
    setWidth('androidExposureBar', exposure);
    setText('androidStaminaCaption', stamina >= 95 ? 'Ready' : 'Recovering');
  }

  function syncNews() {
    const source = textOf('news');
    if (!source) return;

    const cleaned = source.replace(/^Blackwood News\s*:?\s*/i, '').trim();
    const pieces = cleaned.split(/[.!?]\s+/).filter(Boolean);
    setText('androidNewsHeadline', (pieces[0] || cleaned).slice(0, 80));
    if (pieces.length > 1) setText('androidNewsSummary', pieces.slice(1).join('. ').slice(0, 95));
  }

  function syncChapter() {
    setText('androidChapterTitle', textOf('currentChapterTitle') || 'The Road Into Blackwood');
    setText('androidChapterMeta', textOf('currentChapterMeta') || 'Prologue');
    const summary = textOf('recentMemoryText');
    if (summary) setText('androidChapterSummary', summary.slice(0, 105));
  }

  function syncTasks() {
    const sourceTasks = [...document.querySelectorAll('#tasks button')];
    const target = document.getElementById('androidTaskList');
    if (!target) return;

    const activeCount = sourceTasks.filter(task => !task.disabled).length;
    setText('androidTaskCount', `${activeCount} active`);

    if (!sourceTasks.length) {
      target.innerHTML = '<div class="empty-task">No active tasks.</div>';
      return;
    }

    target.innerHTML = sourceTasks.slice(0, 3).map((task, index) => {
      const title = task.textContent.replace(/\s+/g, ' ').trim();
      return `<button type="button" data-source-task="${index}" ${task.disabled ? 'disabled' : ''}>
        <span class="task-number">${index + 1}</span>
        <span><strong>${escapeHtml(title.slice(0, 72))}</strong><small>${task.disabled ? 'Unavailable at this time.' : 'Open investigation task.'}</small></span>
        <b>›</b>
      </button>`;
    }).join('');
  }

  function syncEvents() {
    const target = document.getElementById('androidEventList');
    if (!target) return;

    const events = [...document.querySelectorAll('#storyLog > *')]
      .map(node => node.textContent.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .slice(-3)
      .reverse();

    if (!events.length) {
      events.push(textOf('recentMemoryText') || 'You arrived in Blackwood. The town has already begun to remember you.');
    }

    target.innerHTML = events.map((event, index) => `
      <div><time>${index === 0 ? 'NOW' : 'RECENT'}</time><span>${escapeHtml(event.slice(0, 145))}</span></div>
    `).join('');
  }

  function syncActiveNavigation(activeScreen) {
    root?.querySelectorAll('[data-mobile-tab]').forEach(button => {
      button.classList.toggle('active', button.dataset.mobileTab === activeScreen);
    });
  }

  function textOf(id) {
    return document.getElementById(id)?.textContent?.replace(/\s+/g, ' ').trim() || '';
  }

  function numberOf(id, fallback) {
    const value = Number.parseInt(textOf(id), 10);
    return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : fallback;
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
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[character]);
  }

  function failToNativeUI() {
    document.body.classList.remove('android-mobile-active', 'android-native-view');
    root?.remove();
    root = null;
  }

  function recover() {
    if (!MEDIA.matches) {
      document.body.classList.remove('android-mobile-active', 'android-native-view');
      root?.remove();
      root = null;
      return;
    }

    if (!root) {
      document.body.classList.add('android-mobile-active');
      buildMobileHome();
      loadApprovedArtwork();
      bindGameObservers();
    }

    syncViewState();
    syncAll();
  }

  window.addEventListener('beforeunload', () => {
    if (syncTimer) window.clearInterval(syncTimer);
    observer?.disconnect();
    objectUrls.forEach(url => URL.revokeObjectURL(url));
  });
})();