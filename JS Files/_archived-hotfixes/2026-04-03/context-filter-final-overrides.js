(function installFinalContextFilterHelpers() {
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
})();

