(function adventureFilterHotfix() {
  var HOTFIX_VERSION = '2026-04-03.1';
  var FILTER_CONTROL_SELECTOR = '.control-panel-card input, .control-panel-card select';
  var AUTOCOMPLETE_BINDINGS = [
    ['searchName', 'nameList'],
    ['filterState', 'stateList'],
    ['filterCity', 'cityList'],
    ['filterTags', 'tagsList'],
    ['filterCost', 'costList']
  ];

  function injectContextMenuCssFix() {
    if (document.getElementById('contextMenuHotfixStyle')) return;
    var style = document.createElement('style');
    style.id = 'contextMenuHotfixStyle';
    style.textContent = [
      '#contextMenu {',
      '  display: none !important;',
      '  pointer-events: none !important;',
      '  visibility: hidden !important;',
      '  opacity: 0 !important;',
      '}',
      '#contextMenu.visible {',
      '  display: flex !important;',
      '  pointer-events: auto !important;',
      '  visibility: visible !important;',
      '  opacity: 1 !important;',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function enforceFilterControlInteractivity() {
    document.querySelectorAll(FILTER_CONTROL_SELECTOR).forEach(function (el) {
      el.style.pointerEvents = 'auto';
      if (typeof el.disabled !== 'undefined') {
        el.disabled = false;
      }
    });
  }

  function clearStaleBlockingOverlays() {
    var selectors = '.modal-backdrop, [id$="Backdrop"], #contextMenu';
    document.querySelectorAll(selectors).forEach(function (el) {
      var cs = window.getComputedStyle(el);
      var isContextMenu = el.id === 'contextMenu';
      var classVisible = el.classList.contains('visible');
      var isHiddenByStyle = cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0;
      var shouldDisable = isHiddenByStyle || (isContextMenu && !classVisible) || (!isContextMenu && !classVisible && el.classList.contains('modal-backdrop'));

      if (shouldDisable) {
        el.classList.remove('visible');
        el.style.pointerEvents = 'none';
        el.style.zIndex = '-1';
      }
    });
  }

  function patchContextMenuFunctions() {
    if (window.__contextMenuHotfixPatched) return;

    if (typeof window.showContextMenu === 'function') {
      var originalShow = window.showContextMenu;
      window.showContextMenu = function (x, y, value, fieldInfo) {
        var result = originalShow.call(this, x, y, value, fieldInfo);
        var menu = document.getElementById('contextMenu');
        if (menu) {
          menu.classList.add('visible');
          menu.style.pointerEvents = 'auto';
          menu.style.zIndex = '999999';
        }
        return result;
      };
    }

    if (typeof window.hideContextMenu === 'function') {
      var originalHide = window.hideContextMenu;
      window.hideContextMenu = function () {
        var result = originalHide.apply(this, arguments);
        var menu = document.getElementById('contextMenu');
        if (menu) {
          menu.classList.remove('visible');
          menu.style.pointerEvents = 'none';
          menu.style.zIndex = '-1';
        }
        return result;
      };
    }

    window.__contextMenuHotfixPatched = true;
  }

  function bindAutocompleteOnFocus() {
    if (window.__autocompleteHotfixBound) return;
    window.__autocompleteHotfixBound = true;

    function ensureAutocompleteData() {
      if (!Array.isArray(window.adventuresData) || window.adventuresData.length === 0) return;
      if (typeof window.populateAutocomplete === 'function') {
        window.populateAutocomplete();
      }
    }

    AUTOCOMPLETE_BINDINGS.forEach(function (pair) {
      var input = document.getElementById(pair[0]);
      var list = document.getElementById(pair[1]);
      if (!input || !list) return;

      input.addEventListener('focus', ensureAutocompleteData, false);
      input.addEventListener('click', ensureAutocompleteData, false);
    });
  }

  function init() {
    injectContextMenuCssFix();
    enforceFilterControlInteractivity();
    clearStaleBlockingOverlays();
    patchContextMenuFunctions();
    bindAutocompleteOnFocus();

    // Keep protections active as dynamic scripts mutate DOM repeatedly.
    if (!window.__adventureFilterHotfixTimer) {
      window.__adventureFilterHotfixTimer = window.setInterval(function () {
        enforceFilterControlInteractivity();
        clearStaleBlockingOverlays();
      }, 1500);
    }

    console.log('[Hotfix] Adventure filter hotfix active:', HOTFIX_VERSION);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

