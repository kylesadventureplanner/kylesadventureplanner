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
  console.log('🔘 Initializing Button Handlers with Event Delegation...');

  /**
   * Setup all button event listeners using event delegation
   */
  function setupButtonHandlers() {
    console.log('🔧 Setting up button handlers with event delegation...');

    // Delegate click events to the document
    document.addEventListener('click', function(event) {
      const button = event.target.closest('button');
      if (!button) return;

      // Handle Auto-Tag All Button
      if (button.id === 'autoTagBtn') {
        event.preventDefault();
        console.log('🏷️ Auto-Tag All clicked');
        handleAutoTagAll();
      }

      // Handle Location History Button
      if (button.id === 'locationHistoryBtn') {
        event.preventDefault();
        console.log('📅 Location History clicked');
        openLocationHistoryModal();
      }

      // Handle Find Near Me Button
      if (button.id === 'findNearMeBtn') {
        event.preventDefault();
        console.log('📍 Find Near Me clicked');
        handleFindNearMe();
      }

      // Handle Reset All Filters Buttons
      if (button.id && button.id.includes('resetAllFilters')) {
        event.preventDefault();
        console.log('🔄 Reset Filters clicked');
        handleResetFilters();
      }

      // Handle Quick Filter Buttons
      if (button.classList.contains('quick-filter-btn')) {
        event.preventDefault();
        const tag = button.getAttribute('data-tag');
        const isFilter = button.getAttribute('data-filter');
        console.log('🏷️ Quick filter clicked:', tag || isFilter);
        if (isFilter === 'favorites') {
          handleFavoritesFilter();
        } else if (tag) {
          handleTagFilter(tag);
        }
      }
    });

    console.log('✅ Button handlers set up successfully with event delegation');
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
            const nearby = window.adventuresData.filter(() => {
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

  // Initialize when DOM is ready
  function init() {
    setTimeout(() => {
      setupButtonHandlers();
      console.log('✅ Button system initialized with event delegation');
    }, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }

  window.setupButtonHandlers = setupButtonHandlers;
})();
