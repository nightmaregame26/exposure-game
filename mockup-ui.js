(() => {
  'use strict';
  if (document.querySelector('script[data-component-ui-loader]')) return;
  const script = document.createElement('script');
  script.src = 'component-ui.js?v=components-2';
  script.defer = true;
  script.dataset.componentUiLoader = 'true';
  document.head.appendChild(script);
})();
