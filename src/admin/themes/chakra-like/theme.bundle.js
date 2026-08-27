// Minimal theme bundle to satisfy AdminJS theme asset loading.
(() => {
  if (typeof window === 'undefined') {
    return;
  }
  window.THEME_COMPONENTS = window.THEME_COMPONENTS || {};
})();
