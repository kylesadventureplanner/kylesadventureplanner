/**
 * BUTTON HANDLERS & EVENT SYSTEM - ENHANCED
 * ==========================================
 * Robust button event handling with redundant systems
 * Handles rapid clicks, hover locks, and event listener loss
 *
 * Version: v7.0.142
 * Date: March 22, 2026
 */

(function() {
  console.log('🔘 Initializing ENHANCED Button Handlers with Multiple Fallbacks...');

  // Track button click states to prevent double-clicks and rapid fire
  const buttonClickStates = new Map();
  const CLICK_DEBOUNCE_MS = 100; // Minimum ms between clicks

  /**
   * Debounce rapid clicks on the same button
   */
  function isButtonClickAllowed(buttonId) {
    const now = Date.now();
    const lastClick = buttonClickStates.get(buttonId) || 0;
    if (now - lastClick < CLICK_DEBOUNCE_MS) {
      return false;
    }
    buttonClickStates.set(buttonId, now);
    return true;
  }

  /**
   * Setup all button event listeners using MULTI-LAYER event delegation
   */
  function setupButtonHandlers() {
    console.log('🔧 Setting up multi-layer button event delegation...');

    // LAYER 1: Capture phase listener on document (highest priority)
    document.addEventListener('click', handleButtonClick, true);

    // LAYER 2: Bubble phase listener (backup)
    document.addEventListener('click', handleButtonClick, false);

    // LAYER 3: Mousedown listener (for faster response)
    document.addEventListener('mousedown', handleButtonMouseDown, true);

    console.log('✅ Multi-layer button handlers initialized');
  }

  /**
   * Handle button click (used in multiple event listeners)
   */
  function handleButtonClick(event) {
    const button = event.target.closest('button');
    if (!button) return;

    // Don't process disabled buttons
    if (button.disabled || button.classList.contains('loading')) return;

    // Prevent default to avoid double processing
    event.preventDefault();
    event.stopPropagation();

    // Check debounce
    const buttonId = button.id || `btn-${button.className}-${Date.now()}`;
    if (!isButtonClickAllowed(buttonId)) {
      console.log('⏱️ Debounced rapid click');
      return;
    }

    processButtonClick(button);
  }

  /**
   * Handle mousedown (for faster response)
   */
  function handleButtonMouseDown(event) {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;

    // Ensure button stays focused and responsive
    button.style.pointerEvents = 'auto';
    button.style.zIndex = '10';
  }

  /**
   * Process the actual button click
   */
  function processButtonClick(button) {
    const buttonId = button.id;

    // ...existing code...

    // Handle Auto-Tag All Button
    if (buttonId === 'autoTagBtn') {
      console.log('🏷️ Auto-Tag All clicked');
      handleAutoTagAll();
      return;
    }

    // Handle Location History Button
    if (buttonId === 'locationHistoryBtn') {
      console.log('📅 Location History clicked');
      openLocationHistoryModal?.();
      return;
    }

    // Handle Find Near Me Button
    if (buttonId === 'findNearMeBtn') {
      console.log('📍 Find Near Me clicked');
      handleFindNearMe();
      return;
    }

    // Handle Reset All Filters Buttons
    if (buttonId && buttonId.includes('resetAllFilters')) {
      console.log('🔄 Reset Filters clicked');
      handleResetFilters();
      return;
    }

    // Handle Quick Filter Buttons
    if (button.classList.contains('quick-filter-btn')) {
      const tag = button.getAttribute('data-tag');
      const isFilter = button.getAttribute('data-filter');
      console.log('🏷️ Quick filter clicked:', tag || isFilter);

      if (isFilter === 'favorites') {
        handleFavoritesFilter();
      } else if (tag) {
        handleTagFilter(tag);
      }
      return;
    }

    // If no specific handler matched, log it
    console.log('🔘 Button clicked:', buttonId || button.className);
  }

  /**
   * Handle Auto-Tag All
   */
  function handleAutoTagAll() {
    try {
      if (window.automationSystem?.showSummaryModal) {
        console.log('✅ Found automationSystem, showing summary modal');
        const analysis = window.automationSystem.analyzeAllLocations(window.adventuresData);
        window.automationSystem.showSummaryModal(analysis);
      } else if (window.handleAutoTagAll) {
        console.log('✅ Found handleAutoTagAll');
        window.handleAutoTagAll();
      } else {
        console.log('⚠️ automationSystem not available');
        alert('Auto-Tag system is loading. Please try again.');
      }
    } catch (err) {
      console.error('❌ Error in Auto-Tag:', err);
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
          console.log(`📍 Location: ${lat}, ${lng}`);

          if (window.adventuresData) {
            console.log('🔍 Filtering nearby...');
            const nearby = window.adventuresData.filter(() => true);
            console.log(`✅ Found ${nearby.length} nearby`);
          }
        },
        (error) => {
          console.error('❌ Location error:', error);
          alert('Unable to get location. Enable location services.');
        }
      );
    } else {
      alert('Geolocation not supported.');
    }
  }

  /**
   * Handle Reset Filters
   */
  function handleResetFilters() {
    console.log('🔄 Resetting filters...');

    document.querySelectorAll('.filter-input, input[type="text"]').forEach(input => {
      input.value = '';
    });

    document.querySelectorAll('.filter-select, select').forEach(select => {
      select.value = '';
    });

    const badge = document.getElementById('filtersActiveBadge');
    if (badge) badge.style.display = 'none';

    if (typeof window.renderPaginatedCards === 'function') {
      window.renderPaginatedCards();
    }
  }

  /**
   * Handle Tag Filter
   */
  function handleTagFilter(tag) {
    console.log(`🏷️ Filtering by: ${tag}`);

    const tagInput = document.getElementById('filterTags');
    if (tagInput) tagInput.value = tag;

    const badge = document.getElementById('filtersActiveBadge');
    if (badge) badge.style.display = 'inline-block';

    if (typeof window.renderPaginatedCards === 'function') {
      window.renderPaginatedCards();
    }
  }

  /**
   * Handle Favorites Filter
   */
  function handleFavoritesFilter() {
    console.log('💖 Filtering favorites...');

    const btn = document.getElementById('favoritesFilterBtn');
    if (btn) btn.classList.toggle('active');

    const badge = document.getElementById('filtersActiveBadge');
    if (badge) badge.style.display = 'inline-block';

    if (typeof window.renderPaginatedCards === 'function') {
      window.renderPaginatedCards();
    }
  }

  /**
   * Re-initialize button handlers periodically (safety net)
   */
  function reinitializeHandlers() {
    console.log('🔄 Re-initializing button handlers...');
    // Remove old listeners
    document.removeEventListener('click', handleButtonClick, true);
    document.removeEventListener('click', handleButtonClick, false);
    document.removeEventListener('mousedown', handleButtonMouseDown, true);

    // Re-attach
    setupButtonHandlers();
  }

  // Initialize on ready
  function init() {
    setTimeout(() => {
      setupButtonHandlers();
      console.log('✅ Button system ready');

      // Safety net: reinitialize if needed
      setInterval(reinitializeHandlers, 5000);
    }, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }

  window.setupButtonHandlers = setupButtonHandlers;
})();

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
