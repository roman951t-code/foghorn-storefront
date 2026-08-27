(function () {
  function getCurrentAdmin() {
    try {
      var appState = window.__APP_STATE__ || {};
      if (appState && appState.currentAdmin) return appState.currentAdmin;
      var reduxState = window.REDUX_STATE || {};
      if (reduxState && reduxState.session) return reduxState.session;
      return null;
    } catch (e) {
      return null;
    }
  }

  function isReadOnlyAdmin(admin) {
    if (!admin) return false;
    return admin.role === 'readonly' || admin.email === 'readonly@mail.com';
  }

  function disableSaveButtons() {
    var saveButtons = document.querySelectorAll('[data-testid="button-save"]');
    saveButtons.forEach(function (btn) {
      if (btn.hasAttribute('disabled')) return;
      btn.setAttribute('disabled', 'true');
      btn.setAttribute('aria-disabled', 'true');
      btn.style.pointerEvents = 'none';
      btn.style.opacity = '0.6';
      if (!btn.getAttribute('title')) {
        btn.setAttribute('title', 'Read-only account: changes are disabled.');
      }
    });
  }

  var admin = getCurrentAdmin();
  if (!isReadOnlyAdmin(admin)) return;

  document.documentElement.dataset.adminReadonly = 'true';
  disableSaveButtons();

  var observer = new MutationObserver(function () {
    disableSaveButtons();
  });

  var observe = function () {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'data-testid'],
    });
  };

  if (document.body) {
    observe();
  } else {
    window.addEventListener('DOMContentLoaded', function () {
      disableSaveButtons();
      observe();
    });
  }
})();
