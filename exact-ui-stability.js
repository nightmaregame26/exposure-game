(() => {
  'use strict';

  const VERSION = 'exact-16';
  const SCREENS = ['home', 'map', 'scene'];
  const rendered = new Set();
  let repairTimer = null;
  let fallbackTimer = null;

  function waitForElement(selector, attempts = 120) {
    return new Promise(resolve => {
      let count = 0;
      const tick = () => {
        const element = document.querySelector(selector);
        if (element || count >= attempts) {
          resolve(element || null);
          return;
        }
        count += 1;
        window.setTimeout(tick, 50);
      };
      tick();
    });
  }

  async function loadApprovedSlices(screen) {
    if (rendered.has(screen)) return true;

    const artboard = await waitForElement(`#exact-${screen} .exact-artboard`);
    if (!artboard) return false;

    const slices = [...artboard.querySelectorAll('.exact-slice')];
    if (slices.length !== 4) return false;

    try {
      const dataUris = await Promise.all([0, 1, 2, 3].map(async index => {
        const response = await fetch(`assets/mockups/${screen}-${index}.svg?v=${VERSION}`, {
          cache: 'no-store'
        });
        if (!response.ok) throw new Error(`${screen}-${index} returned ${response.status}`);

        const svg = await response.text();
        const match = svg.match(/href=["'](data:image\/(?:jpeg|jpg|png|webp);base64,[^"']+)["']/i);
        if (!match) throw new Error(`${screen}-${index} contained no embedded artwork`);
        return match[1];
      }));

      dataUris.forEach((uri, index) => {
        slices[index].style.backgroundImage = `url("${uri}")`;
      });

      const fullArt = artboard.querySelector('.exact-full-art');
      if (fullArt) fullArt.style.backgroundImage = 'none';

      artboard.classList.remove('uses-full-art', 'asset-error');
      artboard.classList.add('uses-slices', 'loaded');
      rendered.add(screen);
      return true;
    } catch (error) {
      console.error(`Exposure approved ${screen} artwork recovery failed`, error);
      return false;
    }
  }

  function bookIsOpen() {
    const overlay = document.getElementById('bookOverlay');
    return Boolean(overlay && !overlay.classList.contains('hidden'));
  }

  function sceneIsOpen() {
    const overlay = document.getElementById('sceneOverlay');
    return Boolean(overlay && !overlay.classList.contains('hidden'));
  }

  function sceneIsEmily() {
    const title = `${document.getElementById('sceneTitle')?.textContent || ''} ${document.getElementById('sceneLocation')?.textContent || ''}`.toLowerCase();
    return title.includes('emily') || title.includes('café hollow') || title.includes('cafe hollow');
  }

  function showStage(name) {
    SCREENS.forEach(screen => {
      const stage = document.getElementById(`exact-${screen}`);
      if (stage) stage.hidden = screen !== name;
    });
  }

  function activateArtworkView(screen) {
    const exactUi = document.getElementById('exactUi');
    if (!exactUi) return false;

    document.body.classList.remove('exact-native-mode', 'exact-native-scene');
    exactUi.removeAttribute('aria-hidden');
    exactUi.style.removeProperty('display');
    showStage(screen);
    return true;
  }

  function activateNativeFallback(reason) {
    console.warn('Exposure switched to native fallback:', reason);
    document.body.classList.add('exact-native-mode');
    document.body.classList.toggle('exact-native-scene', sceneIsOpen());
    document.getElementById('exactUi')?.setAttribute('aria-hidden', 'true');
  }

  async function repairView() {
    window.clearTimeout(repairTimer);
    repairTimer = null;

    if (bookIsOpen()) return;

    const activeTab = document.querySelector('.screen.active')?.id || 'home';
    let target = null;

    if (sceneIsOpen()) {
      if (sceneIsEmily()) target = 'scene';
      else {
        activateNativeFallback('A non-artwork scene is open.');
        return;
      }
    } else if (activeTab === 'home' || activeTab === 'map') {
      target = activeTab;
    } else {
      activateNativeFallback(`The ${activeTab} screen uses the standard interface.`);
      return;
    }

    const activated = activateArtworkView(target);
    if (!activated) {
      activateNativeFallback('The approved artwork shell was unavailable.');
      return;
    }

    const loaded = await loadApprovedSlices(target);
    if (loaded) return;

    window.clearTimeout(fallbackTimer);
    fallbackTimer = window.setTimeout(() => {
      const artboard = document.querySelector(`#exact-${target} .exact-artboard`);
      if (!artboard?.classList.contains('loaded')) {
        activateNativeFallback(`The ${target} artwork did not finish loading.`);
      }
    }, 1500);
  }

  function queueRepair(delay = 40) {
    window.clearTimeout(repairTimer);
    repairTimer = window.setTimeout(() => {
      void repairView();
    }, delay);
  }

  async function init() {
    const exactUi = await waitForElement('#exactUi');
    if (!exactUi) {
      document.body.classList.add('exact-native-mode');
      return;
    }

    await Promise.all(SCREENS.map(loadApprovedSlices));

    const observer = new MutationObserver(() => queueRepair(30));
    [
      document.getElementById('bookOverlay'),
      document.getElementById('sceneOverlay'),
      ...document.querySelectorAll('.screen')
    ].filter(Boolean).forEach(node => {
      observer.observe(node, { attributes: true, attributeFilter: ['class'] });
    });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) queueRepair(10);
    });
    window.addEventListener('pageshow', () => queueRepair(10));
    window.addEventListener('orientationchange', () => queueRepair(150));
    window.addEventListener('resize', () => queueRepair(80));
    window.addEventListener('exposure:book-closed', () => queueRepair(10));

    queueRepair(80);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    void init();
  }
})();
