(() => {
  'use strict';
  if (document.querySelector('script[data-exact-ui-loader]')) return;
  const script = document.createElement('script');
  script.src = 'exact-ui.js?v=exact-13';
  script.defer = true;
  script.dataset.exactUiLoader = 'true';
  document.head.appendChild(script);
})();
