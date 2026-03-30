/**
 * BUTTON HANDLERS & EVENT SYSTEM
 * ==============================
 * Centralized button event handling
 * Makes all UI buttons functional
 *
 * Version: v7.0.121
 * Date: March 13, 2026
 */

(function() {
  console.log('🔘 Initializing Button Handlers...');

  /**
   * Setup all button event listeners
   */
  function setupButtonHandlers() {
    console.log('🔧 Setting up button handlers...');

    // Auto-Tag All Button
    const autoTagBtn = document.getElementById('autoTagBtn');
    if (autoTagBtn) {
      autoTagBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('🏷️ Auto-Tag All clicked');
        handleAutoTagAll();
      });
    }

    // Location History Button
    const locationHistoryBtn = document.getElementById('locationHistoryBtn');
    if (locationHistoryBtn) {
      locationHistoryBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('📅 Location History clicked');
        openLocationHistoryModal();
      });
    }

    // Find Near Me Button
    const findNearMeBtn = document.getElementById('findNearMeBtn');
    if (findNearMeBtn) {
      findNearMeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('📍 Find Near Me clicked');
        handleFindNearMe();
      });
    }

    // Reset All Filters Buttons
    const resetBtns = document.querySelectorAll('[id*="resetAllFilters"]');
    resetBtns.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('🔄 Reset Filters clicked');
        handleResetFilters();
      });
    });

    // Quick Filter Buttons
    const quickFilterBtns = document.querySelectorAll('.quick-filter-btn');
    quickFilterBtns.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const tag = this.getAttribute('data-tag');
        const isFilter = this.getAttribute('data-filter');
        console.log('🏷️ Quick filter clicked:', tag || isFilter);
        if (isFilter === 'favorites') {
          handleFavoritesFilter();
        } else if (tag) {
          handleTagFilter(tag);
        }
      });
    });

    console.log('✅ Button handlers set up successfully');
  }

  /**
   * Handle Auto-Tag All
   */
  function handleAutoTagAll() {
    try {
      if (window.automationSystem && window.automationSystem.showSummaryModal) {
        console.log('✅ Found automationSystem, showing summary modal');
        const analysis = window.automationSystem.analyzeAllLocations(window.adventuresData);
        window.automationSystem.showSummaryModal(analysis);
      } else if (window.handleAutoTagAll) {
        console.log('✅ Found handleAutoTagAll in automation-control-panel');
        window.handleAutoTagAll();
      } else {
        console.log('⚠️ automationSystem not available yet');
        alert('Auto-Tag system is loading. Please try again in a moment.');
      }
    } catch (err) {
      console.error('❌ Error in Auto-Tag All:', err);
      alert('Error: ' + err.message);
    }
  }

  /**
   * Handle Find Near Me
   */
  function handleFindNearMe() {
    if (navigator.geolocation) {
      console.log('📍 Getting user location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          console.log(`📍 User location: ${lat}, ${lng}`);

          // Find nearby locations
          if (window.adventuresData) {
            console.log('🔍 Filtering nearby locations...');
            // Simple distance calculation (can be improved)
            const nearby = window.adventuresData.filter(loc => {
              // This is a simplified version - proper distance calculation would be better
              return true; // Placeholder
            });
            console.log(`✅ Found ${nearby.length} nearby locations`);
          }
        },
        (error) => {
          console.error('❌ Location error:', error);
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  }

  /**
   * Handle Reset Filters
   */
  function handleResetFilters() {
    console.log('🔄 Resetting all filters...');

    // Reset search inputs
    const searchInputs = document.querySelectorAll('.filter-input, input[type="text"]');
    searchInputs.forEach(input => {
      input.value = '';
    });

    // Reset selects
    const selects = document.querySelectorAll('.filter-select, select');
    selects.forEach(select => {
      select.value = '';
    });

    // Remove active filter badge
    const badge = document.getElementById('filtersActiveBadge');
    if (badge) {
      badge.style.display = 'none';
    }

    console.log('✅ Filters reset');

    // Trigger data refresh if function exists
    if (typeof window.renderPaginatedCards === 'function') {
      window.renderPaginatedCards();
    }
  }

  /**
   * Handle Tag Filter
   */
  function handleTagFilter(tag) {
    console.log(`🏷️ Filtering by tag: ${tag}`);

    const tagInput = document.getElementById('filterTags');
    if (tagInput) {
      tagInput.value = tag;
    }

    // Show active filter badge
    const badge = document.getElementById('filtersActiveBadge');
    if (badge) {
      badge.style.display = 'inline-block';
    }

    // Trigger data refresh
    if (typeof window.renderPaginatedCards === 'function') {
      window.renderPaginatedCards();
    }
  }

  /**
   * Handle Favorites Filter
   */
  function handleFavoritesFilter() {
    console.log('💖 Filtering favorites...');

    // Toggle favorites filter
    const btn = document.getElementById('favoritesFilterBtn');
    if (btn) {
      btn.classList.toggle('active');
    }

    // Show active filter badge
    const badge = document.getElementById('filtersActiveBadge');
    if (badge) {
      badge.style.display = 'inline-block';
    }

    // Trigger data refresh
    if (typeof window.renderPaginatedCards === 'function') {
      window.renderPaginatedCards();
    }
  }

  /**
   * Initialize when DOM is ready
   */
  function init() {
    // Wait a bit for other systems to load
    setTimeout(() => {
      setupButtonHandlers();
      console.log('✅ Button system initialized');
    }, 500);
  }

  // Start when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }

  // Expose functions globally
  window.setupButtonHandlers = setupButtonHandlers;
})();

