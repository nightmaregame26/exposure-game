(() => {
  'use strict';

  const VERSION = 'android-3';
  const MEDIA = window.matchMedia('(max-width: 700px) and (orientation: portrait)');
  const CHUNKS = [
    `mobile-assets/exact-home/00.txt?v=${VERSION}`,
    `mobile-assets/exact-home/01.txt?v=${VERSION}`,
    `mobile-assets/exact-home/02.txt?v=${VERSION}`
  ];

  let root = null;
  let artworkUrl = null;
  let observer = null;
  let initialized = false;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  function start() {
    if (initialized || !MEDIA.matches) return;
    initialized = true;
    document.body.classList.add('android-mobile-active');
    build();
    bindObserver();
    void loadArtwork();
    syncViewState();

    window.addEventListener('pageshow', recover);
    window.addEventListener('orientationchange', recover);
    MEDIA.addEventListener?.('change', recover);
  }

  function build() {
    if (document.getElementById('androidBuild')) {
      root = document.getElementById('androidBuild');
      return;
    }

    root = document.createElement('div');
    root.id = 'androidBuild';
    root.innerHTML = `
      <main class="android-exact-shell" aria-label="Exposure mobile game home">
        <div class="android-exact-stage">
          <img class="android-exact-image" alt="Exposure — Blackwood mobile game home" decoding="async" fetchpriority="high" />
          <div class="android-exact-loading" role="status">Loading Blackwood…</div>

          <button class="android-hotspot hot-hero" data-action="map" type="button" aria-label="Enter Blackwood"></button>
          <button class="android-hotspot hot-news" data-action="book" type="button" aria-label="Open Blackwood News"></button>
          <button class="android-hotspot hot-clock" data-action="phone" type="button" aria-label="Open phone"></button>
          <button class="android-hotspot hot-stamina" data-action="home" type="button" aria-label="Stamina"></button>
          <button class="android-hotspot hot-exposure" data-action="case" type="button" aria-label="Open case file"></button>
          <button class="android-hotspot hot-chapter" data-action="chapter" type="button" aria-label="Open current chapter"></button>
          <button class="android-hotspot hot-tasks" data-action="task" type="button" aria-label="Open active task"></button>
          <button class="android-hotspot hot-events" data-action="book" type="button" aria-label="Open recent events"></button>

          <nav class="android-nav-hotspots" aria-label="Exposure navigation">
            ${['home', 'book', 'map', 'contacts', 'phone', 'suspects', 'diary', 'case']
              .map(tab => `<button type="button" data-tab="${tab}" aria-label="${tab}"></button>`)
              .join('')}
          </nav>
        </div>
      </main>`;

    document.body.appendChild(root);
    root.addEventListener('click', handleTap);
  }

  async function loadArtwork() {
    if (!root) return;
    root.classList.remove('ready', 'failed');

    try {
      const parts = await Promise.all(CHUNKS.map(async path => {
        const response = await fetch(path, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Artwork chunk returned ${response.status}`);
        return (await response.text()).trim();
      }));

      const base64 = parts.join('').replace(/\s+/g, '');
      const bytes = base64ToBytes(base64);
      const blob = new Blob([bytes], { type: 'image/avif' });

      if (artworkUrl) URL.revokeObjectURL(artworkUrl);
      artworkUrl = URL.createObjectURL(blob);

      const image = root.querySelector('.android-exact-image');
      await loadIntoImage(image, artworkUrl);
      root.classList.add('ready');
    } catch (error) {
      console.error('Exposure exact Android artwork failed:', error);
      failToNative();
    }
  }

  function base64ToBytes(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  }

  function loadIntoImage(image, src) {
    return new Promise((resolve, reject) => {
      let settled = false;
      const done = callback => event => {
        if (settled) return;
        settled = true;
        callback(event);
      };
      image.onload = done(resolve);
      image.onerror = done(() => reject(new Error('Composed mobile artwork could not decode.')));
      image.src = src;
      image.decode?.().then(done(resolve)).catch(() => {});
    });
  }

  function handleTap(event) {
    const tab = event.target.closest('[data-tab]')?.dataset.tab;
    if (tab) {
      if (tab === 'home') returnHome();
      else openNativeTab(tab);
      return;
    }

    const action = event.target.closest('[data-action]')?.dataset.action;
    if (!action || action === 'home') return;

    if (action === 'chapter') {
      document.getElementById('viewMemoryBtn')?.click();
      requestAnimationFrame(syncViewState);
      return;
    }

    if (action === 'task') {
      const task = [...document.querySelectorAll('#tasks button')].find(button => !button.disabled);
      if (task) task.click();
      else openNativeTab('case');
      requestAnimationFrame(syncViewState);
      return;
    }

    openNativeTab(action);
  }

  function openNativeTab(tab) {
    const button = document.querySelector(`nav.tabs button[data-tab="${tab}"]`);
    if (!button) return;
    document.body.classList.add('android-native-view');
    button.click();
    requestAnimationFrame(syncViewState);
  }

  function returnHome() {
    document.querySelector('nav.tabs button[data-tab="home"]')?.click();
    document.body.classList.remove('android-native-view');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function bindObserver() {
    observer = new MutationObserver(syncViewState);
    document.querySelectorAll('.screen, #bookOverlay, #sceneOverlay').forEach(node => {
      observer.observe(node, { attributes: true, attributeFilter: ['class'] });
    });
  }

  function syncViewState() {
    if (!MEDIA.matches || !root) return;
    const activeScreen = document.querySelector('.screen.active')?.id || 'home';
    const bookOpen = overlayOpen('bookOverlay');
    const sceneOpen = overlayOpen('sceneOverlay');
    document.body.classList.toggle('android-native-view', activeScreen !== 'home' || bookOpen || sceneOpen);
  }

  function overlayOpen(id) {
    const node = document.getElementById(id);
    return Boolean(node && !node.classList.contains('hidden'));
  }

  function failToNative() {
    root?.classList.add('failed');
    document.body.classList.remove('android-mobile-active', 'android-native-view');
    root?.remove();
    root = null;
  }

  function recover() {
    if (!MEDIA.matches) {
      document.body.classList.remove('android-mobile-active', 'android-native-view');
      root?.remove();
      root = null;
      initialized = false;
      return;
    }

    if (!root) {
      initialized = true;
      document.body.classList.add('android-mobile-active');
      build();
      bindObserver();
      void loadArtwork();
    }

    syncViewState();
  }

  window.addEventListener('beforeunload', () => {
    observer?.disconnect();
    if (artworkUrl) URL.revokeObjectURL(artworkUrl);
  });
})();
