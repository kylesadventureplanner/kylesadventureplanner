(function runtimeHotfixes() {
  var HOTFIX_VERSION = '2026-04-03.runtime.2';
  var FILTER_CONTROL_SELECTOR = '.control-panel-card input, .control-panel-card select';
  var AUTOCOMPLETE_BINDINGS = [
    ['searchName', 'nameList'],
    ['filterState', 'stateList'],
    ['filterCity', 'cityList'],
    ['filterTags', 'tagsList'],
    ['filterCost', 'costList']
  ];

  function installLegacyContextFilterGuards() {
    function safeCloseMenus() {
      if (typeof window.closeCardContextMenu === 'function') window.closeCardContextMenu();
      if (typeof window.hideContextMenu === 'function') window.hideContextMenu();
    }

    window.removeFromContextFilter = function(field, value) {
      safeCloseMenus();
      window.filterState = window.filterState || {};
      window.filterState.contextFilters = Array.isArray(window.filterState.contextFilters)
        ? window.filterState.contextFilters
        : [];
      window.filterState.contextFilters = window.filterState.contextFilters.filter(function(f) {
        return !(f.field === field && f.value === value);
      });

      if (typeof window.applyFiltersNow === 'function') window.applyFiltersNow();
      if (typeof window.updateBreadcrumbMenu === 'function') window.updateBreadcrumbMenu();
    };

    window.clearAllContextFilters = function() {
      safeCloseMenus();
      window.filterState = window.filterState || {};
      window.filterState.contextFilters = [];

      if (typeof window.applyFiltersNow === 'function') window.applyFiltersNow();
      if (typeof window.updateBreadcrumbMenu === 'function') window.updateBreadcrumbMenu();
      if (typeof window.showToast === 'function') window.showToast('All filters cleared', 'success', 1500);
    };

    window.applyFiltersNow = function() {
      if (window.FilterManager && typeof window.FilterManager.applyAllFilters === 'function') {
        window.FilterManager.applyAllFilters();
      } else if (typeof window.applyFilters === 'function') {
        window.applyFilters();
      }

      if (typeof window.renderPaginatedCards === 'function') {
        window.renderPaginatedCards();
        if (typeof window.updatePaginationControls === 'function') {
          window.updatePaginationControls();
        }
      } else if (typeof window.renderAdventureCards === 'function') {
        window.renderAdventureCards();
      }
    };
  }

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
    document.querySelectorAll(FILTER_CONTROL_SELECTOR).forEach(function(el) {
      el.style.pointerEvents = 'auto';
      if (typeof el.disabled !== 'undefined') {
        el.disabled = false;
      }
    });
  }

  function clearStaleBlockingOverlays() {
    var selectors = '.modal-backdrop, [id$="Backdrop"], #contextMenu';
    document.querySelectorAll(selectors).forEach(function(el) {
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
      window.showContextMenu = function(x, y, value, fieldInfo) {
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
      window.hideContextMenu = function() {
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

    AUTOCOMPLETE_BINDINGS.forEach(function(pair) {
      var input = document.getElementById(pair[0]);
      var list = document.getElementById(pair[1]);
      if (!input || !list) return;

      input.addEventListener('focus', ensureAutocompleteData, false);
      input.addEventListener('click', ensureAutocompleteData, false);
    });
  }

  function injectDebugBadge() {
    var legacyBadge = document.getElementById('overlayDebugBadge');
    if (legacyBadge) legacyBadge.remove();

    var badge = document.getElementById('overlayStatusBadge');
    if (badge) return;

    var header = document.querySelector('#errorNotificationBar .error-header .error-header-left') ||
      document.querySelector('#errorNotificationBar .error-header');
    if (!header) return;

    badge = document.createElement('span');
    badge.id = 'overlayStatusBadge';
    badge.className = 'overlay-status-badge overlay-ok';
    badge.textContent = 'Overlay: OK';
    header.appendChild(badge);
  }

  function getElementLabel(el) {
    if (!el) return '(unknown)';
    if (el.id) return '#' + el.id;
    if (el.classList && el.classList.length > 0) return '.' + el.classList[0];
    return el.tagName ? el.tagName.toLowerCase() : '(unknown)';
  }

  function findLikelyBlockingOverlay() {
    var target = document.getElementById('searchName') || document.getElementById('filterState');
    if (!target) return null;

    var rect = target.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return null;

    var x = rect.left + Math.min(rect.width / 2, 12);
    var y = rect.top + Math.min(rect.height / 2, 12);
    var topEl = document.elementFromPoint(x, y);

    if (!topEl) return null;
    if (topEl === target || target.contains(topEl) || topEl.closest('.control-panel-card')) {
      return null;
    }

    var suspect = topEl.closest('#contextMenu, #tagContextMenu, .modal-backdrop, [id$="Backdrop"]') || topEl;
    var cs = window.getComputedStyle(suspect);
    var isVisible = cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) > 0;
    var blocksPointer = cs.pointerEvents !== 'none';

    if (isVisible && blocksPointer) {
      return suspect;
    }

    return null;
  }

  function updateDebugBadge() {
    var badge = document.getElementById('overlayStatusBadge') || document.getElementById('overlayDebugBadge');
    if (!badge) return;

    var blocker = findLikelyBlockingOverlay();
    if (blocker) {
      badge.classList.remove('overlay-ok', 'ok');
      badge.classList.add('overlay-blocked');
      badge.textContent = 'Overlay blocked: ' + getElementLabel(blocker);
    } else {
      badge.classList.remove('overlay-blocked', 'blocked');
      badge.classList.add('overlay-ok');
      badge.textContent = 'Overlay: OK';
    }
  }

  function safeAttr(value) {
    return String(value == null ? '' : value).replace(/'/g, "\\'");
  }

  function installCardContextMenuIsolation() {
    if (window.__cardContextMenuHotfixInstalled) return;

    function closeCardContextMenu() {
      var existing = document.getElementById('cardContextMenu');
      if (existing) existing.remove();
    }

    function showCardGeneralContextMenu(e) {
      closeCardContextMenu();
      var menu = document.createElement('div');
      menu.id = 'cardContextMenu';
      menu.className = 'visible';
      menu.style.position = 'fixed';
      menu.style.top = e.clientY + 'px';
      menu.style.left = e.clientX + 'px';
      menu.style.zIndex = '1000000';
      menu.style.minWidth = '280px';
      menu.style.background = '#fff';
      menu.style.border = '2px solid #1d4ed8';
      menu.style.borderRadius = '8px';
      menu.style.boxShadow = '0 12px 28px rgba(0,0,0,0.28)';
      menu.innerHTML = [
        '<div class="context-menu-header">Card Options</div>',
        '<div class="context-menu-item" data-card-menu-action="apply">',
        '  <span class="context-menu-icon">🔍</span> Apply Current Filters',
        '</div>',
        '<div class="context-menu-item danger" data-card-menu-action="clear">',
        '  <span class="context-menu-icon">⚠️</span> Clear All Filters',
        '</div>'
      ].join('');
      document.body.appendChild(menu);

      menu.addEventListener('click', function(evt) {
        var item = evt.target.closest('[data-card-menu-action]');
        if (!item) return;
        var action = item.getAttribute('data-card-menu-action');
        if (action === 'apply' && typeof window.applyFiltersNow === 'function') window.applyFiltersNow();
        if (action === 'clear' && typeof window.clearAllContextFilters === 'function') window.clearAllContextFilters();
        closeCardContextMenu();
      });

      setTimeout(function() {
        document.addEventListener('click', closeCardContextMenu, { once: true });
        document.addEventListener('contextmenu', closeCardContextMenu, { once: true });
      }, 0);
    }

    function showCardContextMenu(e, card) {
      var clicked = e.target;
      var fieldName = null;
      var fieldValue = null;
      var filterField = null;

      if (clicked.closest('.adventure-card-title')) {
        fieldName = 'Name';
        fieldValue = card.querySelector('.adventure-card-title') && card.querySelector('.adventure-card-title').textContent;
        filterField = 'name';
      } else if (clicked.closest('.adventure-card-location')) {
        fieldName = 'Location';
        fieldValue = card.querySelector('.adventure-card-location') && card.querySelector('.adventure-card-location').textContent;
        filterField = 'location';
      } else if (clicked.closest('.tag-pill')) {
        fieldName = 'Tag';
        fieldValue = clicked.closest('.tag-pill').getAttribute('data-tag') || clicked.closest('.tag-pill').textContent;
        filterField = 'tag';
      } else if (clicked.closest('.card-info-row')) {
        var row = clicked.closest('.card-info-row');
        var icon = row.querySelector('.card-info-icon') && row.querySelector('.card-info-icon').textContent;
        var rowText = row.textContent || '';
        var cleanValue = rowText.replace(icon || '', '').trim();
        fieldValue = cleanValue;
        if (icon === '💬') { fieldName = 'Difficulty'; filterField = 'difficulty'; }
        if (icon === '💰') { fieldName = 'Cost'; filterField = 'cost'; }
        if (icon === '🕐') { fieldName = 'Hours'; filterField = 'hours'; }
        if (icon === '☎️') { fieldName = 'Phone'; filterField = 'phone'; }
        if (icon === '📍') { fieldName = 'Address'; filterField = 'address'; }
      }

      if (!fieldValue || !filterField) {
        showCardGeneralContextMenu(e);
        return;
      }

      closeCardContextMenu();
      var safeValue = safeAttr(String(fieldValue).trim());
      var menu = document.createElement('div');
      menu.id = 'cardContextMenu';
      menu.className = 'visible';
      menu.style.position = 'fixed';
      menu.style.top = e.clientY + 'px';
      menu.style.left = e.clientX + 'px';
      menu.style.zIndex = '1000000';
      menu.style.minWidth = '320px';
      menu.style.background = '#fff';
      menu.style.border = '2px solid #1d4ed8';
      menu.style.borderRadius = '8px';
      menu.style.boxShadow = '0 12px 28px rgba(0,0,0,0.28)';
      menu.innerHTML = [
        '<div class="context-menu-header"><strong>' + fieldName + '</strong>: ' + safeValue + '</div>',
        '<div class="context-menu-item" data-op="contains"><span class="context-menu-icon">✓</span> Contains "' + safeValue + '"</div>',
        '<div class="context-menu-item" data-op="notcontains"><span class="context-menu-icon">✗</span> Does NOT Contain "' + safeValue + '"</div>',
        '<div class="context-menu-item" data-op="equals"><span class="context-menu-icon">⭐</span> Equals "' + safeValue + '"</div>',
        '<div class="context-menu-item" data-op="remove"><span class="context-menu-icon">−</span> Remove from Filter</div>',
        '<div class="context-menu-item danger" data-op="clear"><span class="context-menu-icon">⚠️</span> Clear All Filters</div>'
      ].join('');
      document.body.appendChild(menu);

      menu.addEventListener('click', function(evt) {
        var item = evt.target.closest('[data-op]');
        if (!item) return;
        var op = item.getAttribute('data-op');
        if (op === 'clear' && typeof window.clearAllContextFilters === 'function') window.clearAllContextFilters();
        if (op === 'remove' && typeof window.removeFromContextFilter === 'function') window.removeFromContextFilter(filterField, fieldValue);
        if ((op === 'contains' || op === 'notcontains' || op === 'equals') && typeof window.addToContextFilter === 'function') {
          window.addToContextFilter(filterField, fieldValue, op);
        }
        closeCardContextMenu();
      });

      setTimeout(function() {
        document.addEventListener('click', closeCardContextMenu, { once: true });
        document.addEventListener('contextmenu', closeCardContextMenu, { once: true });
      }, 0);
    }

    window.closeCardContextMenu = closeCardContextMenu;
    window.showCardGeneralContextMenu = showCardGeneralContextMenu;
    window.showCardContextMenu = showCardContextMenu;
    window.__cardContextMenuHotfixInstalled = true;
  }

  function getAdventureFilterManager() {
    if (window.FilterManager && typeof window.FilterManager.applyAllFilters === 'function') return window.FilterManager;
    return null;
  }

  function normalizeKey(value) {
    return String(value || '').trim().toLowerCase();
  }

  function syncAdventureQuickFilterState(manager) {
    if (!manager || !manager.state) return;
    if (!(manager.state.quickFilters instanceof Set)) manager.state.quickFilters = new Set();
    manager.state.quickFilters.clear();
    manager.state.showFavoritesOnly = false;

    document.querySelectorAll('#quickFiltersCard .quick-filter-btn.active').forEach(function(btn) {
      var id = btn.id || '';
      var dataFilter = normalizeKey(btn.getAttribute('data-filter'));
      var dataTag = normalizeKey(btn.getAttribute('data-tag'));

      if (id === 'favoritesFilterBtn' || dataFilter === 'favorites') {
        manager.state.showFavoritesOnly = true;
        return;
      }

      var key = dataTag || dataFilter;
      if (key) manager.state.quickFilters.add(key);
    });
  }

  function applyAdventureFiltersSafe() {
    var manager = getAdventureFilterManager();
    if (manager) {
      manager.applyAllFilters();
      return;
    }

    if (typeof window.applyFilters === 'function') {
      window.applyFilters();
    }
  }

  function bindAdventureFilterRuntime() {
    if (window.__adventureFilterHotfixBound) return;

    var controlPanel = document.querySelector('.control-panel-card');
    var quickCard = document.getElementById('quickFiltersCard');
    if (!controlPanel || !quickCard) return;

    var manager = getAdventureFilterManager();
    if (!manager) return;

    window.__adventureFilterHotfixBound = true;

    // Legacy inline handlers compete with delegated filtering and can no-op.
    document.querySelectorAll('#quickFiltersCard .quick-filter-btn').forEach(function(btn) {
      btn.onclick = null;
    });

    controlPanel.addEventListener('input', function(event) {
      var el = event.target;
      if (!el || !el.id) return;
      if (el.id !== 'searchName' && el.id !== 'filterDifficulty' && el.id !== 'filterState' && el.id !== 'filterCity' && el.id !== 'filterTags' && el.id !== 'filterCost') {
        return;
      }
      applyAdventureFiltersSafe();
    }, true);

    controlPanel.addEventListener('change', function(event) {
      var el = event.target;
      if (!el || !el.id) return;
      if (el.id !== 'searchName' && el.id !== 'filterDifficulty' && el.id !== 'filterState' && el.id !== 'filterCity' && el.id !== 'filterTags' && el.id !== 'filterCost') {
        return;
      }
      applyAdventureFiltersSafe();
    }, true);

    quickCard.addEventListener('click', function(event) {
      var btn = event.target && event.target.closest ? event.target.closest('.quick-filter-btn') : null;
      if (!btn) return;

      event.preventDefault();
      event.stopPropagation();

      btn.classList.toggle('active');
      syncAdventureQuickFilterState(getAdventureFilterManager());
      applyAdventureFiltersSafe();
    }, true);

    ['resetAllFiltersTop', 'resetAllFiltersBottom', 'breadcrumbResetBtn'].forEach(function(id) {
      var btn = document.getElementById(id);
      if (!btn || btn.dataset.filterResetHotfixBound === '1') return;
      btn.dataset.filterResetHotfixBound = '1';
      btn.addEventListener('click', function(event) {
        event.preventDefault();
        var activeManager = getAdventureFilterManager();
        if (activeManager && typeof activeManager.resetAllFilters === 'function') {
          activeManager.resetAllFilters();
          return;
        }
        if (typeof window.resetAllFilters === 'function') window.resetAllFilters();
      }, true);
    });

    // Preserve compatibility with legacy inline button attributes.
    window.applyOpenTodayFilter = function() {
      var btn = document.getElementById('openTodayFilterBtn');
      if (btn) btn.click();
    };

    window.applyClosingSoonFilter = function() {
      var btn = document.getElementById('closingSoonFilterBtn');
      if (btn) btn.click();
    };

    console.log('[Hotfix] Adventure filter runtime bound');
  }

  function installBikeFilterReinitHook() {
    if (window.__bikeFilterHotfixBound) return;
    window.__bikeFilterHotfixBound = true;

    document.addEventListener('click', function(event) {
      var tabBtn = event.target && event.target.closest ? event.target.closest('.app-tab-btn[data-tab="bike-trails"]') : null;
      if (!tabBtn) return;

      window.setTimeout(function() {
        if (typeof window.initBikeTrailsTab === 'function') {
          window.initBikeTrailsTab();
        } else if (typeof window.initializeBikeTrailsTab === 'function') {
          window.initializeBikeTrailsTab();
        }
      }, 50);
    }, true);
  }

  function init() {
    injectContextMenuCssFix();
    injectDebugBadge();
    enforceFilterControlInteractivity();
    clearStaleBlockingOverlays();
    patchContextMenuFunctions();
    bindAutocompleteOnFocus();
    updateDebugBadge();
    installCardContextMenuIsolation();
    installLegacyContextFilterGuards();
    // Adventure filter runtime binding is disabled to avoid conflicting listeners.
    // Canonical ownership now stays with index.html FilterManager only.
    if (false) {
      bindAdventureFilterRuntime();
    }
    installBikeFilterReinitHook();

    if (!window.__runtimeHotfixesInterval) {
      window.__runtimeHotfixesInterval = window.setInterval(function() {
        enforceFilterControlInteractivity();
        clearStaleBlockingOverlays();
        updateDebugBadge();
        // Adventure filter runtime binding is disabled to avoid conflicting listeners.
        // Canonical ownership now stays with index.html FilterManager only.
        if (false) {
          bindAdventureFilterRuntime();
        }
      }, 1500);
    }

    console.log('[Hotfix] Runtime hotfixes active:', HOTFIX_VERSION);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

