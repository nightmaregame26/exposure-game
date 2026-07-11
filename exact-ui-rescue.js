(() => {
  'use strict';

  const VERSION = 'exact-14';
  const screens = ['home', 'map', 'scene'];

  async function waitForExactUi() {
    for (let attempt = 0; attempt < 80; attempt += 1) {
      if (document.querySelector('#exactUi .exact-artboard')) return true;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    return false;
  }

  async function renderScreen(screen) {
    const artboard = document.querySelector(`#exact-${screen} .exact-artboard`);
    if (!artboard) return;

    const slices = [...artboard.querySelectorAll('.exact-slice')];
    if (slices.length !== 4) return;

    try {
      const dataUris = await Promise.all([0, 1, 2, 3].map(async index => {
        const response = await fetch(`assets/mockups/${screen}-${index}.svg?v=${VERSION}`, {
          cache: 'no-store'
        });
        if (!response.ok) throw new Error(`${screen}-${index} returned ${response.status}`);

        const svg = await response.text();
        const match = svg.match(/href=["'](data:image\/(?:jpeg|jpg|png|webp);base64,[^"']+)["']/i);
        if (!match) throw new Error(`${screen}-${index} contained no embedded image`);
        return match[1];
      }));

      dataUris.forEach((uri, index) => {
        slices[index].style.backgroundImage = `url("${uri}")`;
      });

      artboard.classList.remove('uses-full-art', 'asset-error');
      artboard.classList.add('uses-slices', 'loaded');
      const full = artboard.querySelector('.exact-full-art');
      if (full) full.style.backgroundImage = 'none';
    } catch (error) {
      console.error('Exposure rescue renderer failed:', screen, error);
      artboard.classList.add('asset-error');
    }
  }

  async function init() {
    const ready = await waitForExactUi();
    if (!ready) return;
    await Promise.all(screens.map(renderScreen));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    void init();
  }
})();
