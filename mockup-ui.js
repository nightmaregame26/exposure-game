(() => {
  'use strict';
  if (document.querySelector('script[data-exact-ui-loader]')) return;

  const exact = document.createElement('script');
  exact.src = 'exact-ui.js?v=exact-14';
  exact.defer = true;
  exact.dataset.exactUiLoader = 'true';

  exact.addEventListener('load', () => {
    const rescue = document.createElement('script');
    rescue.src = 'exact-ui-rescue.js?v=exact-14';
    rescue.defer = true;
    rescue.dataset.exactUiRescue = 'true';
    document.head.appendChild(rescue);
  }, { once: true });

  document.head.appendChild(exact);
})();
