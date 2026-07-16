(() => {
  'use strict';

  const VERSION = 'android-1';
  const isAndroidPortrait = () => window.matchMedia('(max-width:600px) and (orientation:portrait)').matches;
  let root;
  let image;
  let currentScreen = 'home';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  function init() {
    if (!isAndroidPortrait()) return;
    document.body.classList.add('android-art-active');
    build();
    showArtwork('home');
    observeOverlays();
    window.addEventListener('pageshow', recover);
    window.addEventListener('orientationchange', recover);
  }

  function build() {
    if (document.getElementById('androidBuild')) return;

    root = document.createElement('div');
    root.id = 'androidBuild';
    root.className = 'android-home';
    root.innerHTML = `
      <div class="android-art-stage">
        <img class="android-art-image" alt="Exposure mobile game interface" decoding="async" />
        <div class="android-loading">Loading Blackwood…</div>
        <div class="android-retry">The interface could not load. Tap to retry.</div>

        <button class="android-hotspot hot-hero" data-action="map" aria-label="Open Blackwood map"></button>
        <button class="android-hotspot hot-news" data-action="book" aria-label="Open Blackwood news"></button>
        <button class="android-hotspot hot-clock" data-action="phone" aria-label="Open phone"></button>
        <button class="android-hotspot hot-stamina" data-action="home" aria-label="Stamina"></button>
        <button class="android-hotspot hot-exposure" data-action="case" aria-label="Open case file"></button>
        <button class="android-hotspot hot-chapter" data-action="book" aria-label="Open current chapter"></button>
        <button class="android-hotspot hot-tasks" data-action="task" aria-label="Open active task"></button>
        <button class="android-hotspot hot-events" data-action="book" aria-label="Open recent events"></button>

        <nav class="android-bottom-hotspots" aria-label="Exposure navigation">
          ${['home','book','map','contacts','phone','suspects','diary','case']
            .map(tab => `<button type="button" data-tab="${tab}" aria-label="${tab}"></button>`)
            .join('')}
        </nav>
      </div>`;

    document.body.appendChild(root);
    image = root.querySelector('.android-art-image');

    root.addEventListener('click', event => {
      if (event.target.closest('.android-retry')) {
        showArtwork(currentScreen);
        return;
      }

      const tab = event.target.closest('[data-tab]')?.dataset.tab;
      if (tab) {
        if (tab === 'home') showArtwork('home');
        else if (tab === 'map') showArtwork('map');
        else openNative(tab);
        return;
      }

      const action = event.target.closest('[data-action]')?.dataset.action;
      if (!action || action === 'home') return;
      if (action === 'map') showArtwork('map');
      else if (action === 'task') openFirstTask();
      else openNative(action);
    });
  }

  function showArtwork(screen) {
    if (!root || !image) return;
    currentScreen = screen === 'map' ? 'map' : 'home';
    document.body.classList.remove('android-native-view');
    root.className = currentScreen === 'map' ? 'android-map' : 'android-home';
    root.classList.remove('ready', 'failed');

    const src = `/api/artwork?screen=${currentScreen}&v=${VERSION}`;
    const probe = new Image();
    probe.decoding = 'async';
    probe.onload = () => {
      image.src = src;
      image.alt = currentScreen === 'map' ? 'Blackwood map' : 'Exposure mobile game home';
      root.classList.add('ready');
    };
    probe.onerror = () => root.classList.add('failed');
    probe.src = src;
  }

  function openNative(tab) {
    const button = document.querySelector(`nav.tabs button[data-tab="${tab}"]`);
    if (!button) return;
    document.body.classList.add('android-native-view');
    button.click();
  }

  function openFirstTask() {
    const task = [...document.querySelectorAll('#tasks button')].find(button => !button.disabled);
    if (task) task.click();
    else openNative('case');
  }

  function observeOverlays() {
    const observer = new MutationObserver(() => {
      const bookOpen = document.getElementById('bookOverlay') && !document.getElementById('bookOverlay').classList.contains('hidden');
      const sceneOpen = document.getElementById('sceneOverlay') && !document.getElementById('sceneOverlay').classList.contains('hidden');
      if (bookOpen || sceneOpen) document.body.classList.add('android-native-view');
    });

    ['bookOverlay', 'sceneOverlay'].forEach(id => {
      const node = document.getElementById(id);
      if (node) observer.observe(node, { attributes: true, attributeFilter: ['class'] });
    });
  }

  function recover() {
    if (!isAndroidPortrait()) {
      document.body.classList.remove('android-art-active', 'android-native-view');
      root?.remove();
      return;
    }

    if (!document.body.classList.contains('android-native-view')) showArtwork(currentScreen);
  }
})();
