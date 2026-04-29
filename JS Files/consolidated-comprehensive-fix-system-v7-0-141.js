/**
 * CONSOLIDATED COMPREHENSIVE FIX SYSTEM v7.0.141
 * ==============================================
 *
 * A unified, comprehensive fix system that consolidates all comprehensive fix
 * functionality from multiple files into a single, maintainable module.
 *
 * INCLUDES:
 * - Global Variable Initialization
 * - Safe String Operations
 * - Window Opening Functions
 * - Pagination Fixes
 * - Dry Run Slider Fixes
 * - Refresh Place IDs with Progress
 * - Filter Application Fixes
 * - Location History Z-Index Fix
 * - Tag Manager Fixes
 * - Modal Z-Index Management
 * - DOM Element Fixes
 * - Event Handler Improvements
 * - Error Handling & Recovery
 * - Performance Optimizations
 *
 * Version: 7.0.141
 * Date: March 15, 2026
 * Created: Consolidated from 8 separate comprehensive fix files
 */

console.log('🤖 Consolidated Comprehensive Fix System v7.0.141 Loading...');

(function() {
  // ============================================================
  // SECTION 1: GLOBAL VARIABLE INITIALIZATION
  // ============================================================

  /**
   * Initialize all global variables properly
   */
  function initializeGlobals() {
    console.log('🔧 Initializing global variables...');

    if (!window.totalFilteredAdventures) {
      window.totalFilteredAdventures = [];
      console.log('✅ Initialized totalFilteredAdventures');
    }

    if (!window.adventuresData) {
      window.adventuresData = [];
      console.log('✅ Initialized adventuresData');
    }

    if (!window.currentPage) {
      window.currentPage = 1;
      console.log('✅ Initialized currentPage = 1');
    }

    if (!window.itemsPerPage) {
      window.itemsPerPage = 20;
      console.log('✅ Initialized itemsPerPage = 20');
    }

    if (!window.currentFilters) {
      window.currentFilters = {};
      console.log('✅ Initialized currentFilters');
    }

    if (!window.filteredAdventures) {
      window.filteredAdventures = [];
      console.log('✅ Initialized filteredAdventures');
    }

    if (!window.activeFilters) {
      window.activeFilters = {
        searchName: '',
        filterDifficulty: '',
        filterState: '',
        filterCity: '',
        filterTags: '',
        filterCost: '',
        quickFilters: new Set(),
        showFavoritesOnly: false,
        favorites: false,
        tags: new Set()
      };
      console.log('✅ Initialized activeFilters');
    }

    // ⚠️ IMPORTANT: Initialize Google Places API Key
    // This is REQUIRED for the Populate Missing Fields feature to work
    // If you don't have an API key, get one from https://console.cloud.google.com
    // Steps:
    // 1. Create a project
    // 2. Enable "Places API"
    // 3. Go to Credentials and create an API key
    // 4. Replace 'YOUR_GOOGLE_PLACES_API_KEY_HERE' with your actual key

    if (!window.GOOGLE_PLACES_API_KEY) {
      // TODO: Replace this with your actual Google Places API key
      window.GOOGLE_PLACES_API_KEY = 'AIzaSyCwkOvyiQyJkiaCWkZUEP2PJGaWhk-HYXc';
      console.log('⚠️ GOOGLE_PLACES_API_KEY placeholder set. Update with real key for Populate Missing Fields to work.');
    } else {
      console.log('✅ GOOGLE_PLACES_API_KEY initialized');
    }

    console.log('✅ Global variables initialized');
  }

  // ============================================================
  // SECTION 2: SAFE STRING OPERATIONS
  // ============================================================

  /**
   * Safely convert to string
   */
  window.safeString = window.safeString || function(value) {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value);
  };

  /**
   * Safely convert to lowercase
   */
  window.safeLowerCase = window.safeLowerCase || function(value) {
    const str = window.safeString(value);
    return str.toLowerCase();
  };

  /**
   * Safely convert to number
   */
  window.safeNumber = window.safeNumber || function(value) {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  /**
   * Safely check if value is empty
   */
  window.isEmpty = window.isEmpty || function(value) {
    if (value === null || value === undefined) {
      return true;
    }
    if (typeof value === 'string' && value.trim() === '') {
      return true;
    }
    if (Array.isArray(value) && value.length === 0) {
      return true;
    }
    if (typeof value === 'object' && Object.keys(value).length === 0) {
      return true;
    }
    return false;
  };

  console.log('✅ Safe string operations ready');

  /**
   * CRITICAL: Toast notification system
   * Shows temporary notifications to the user
   */
  window.showToast = window.showToast || function(message, type = 'info', duration = 3000) {
    console.log(`📢 Toast [${type}]: ${message}`);

    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toastContainer';
      toastContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 99999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      `;
      document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');

    // Determine styling based on type
    let bgColor = '#3b82f6'; // info - blue
    let icon = 'ℹ️';

    if (type === 'success') {
      bgColor = '#10b981'; // success - green
      icon = '✅';
    } else if (type === 'error') {
      bgColor = '#ef4444'; // error - red
      icon = '❌';
    } else if (type === 'warning') {
      bgColor = '#f59e0b'; // warning - amber
      icon = '⚠️';
    }

    toast.style.cssText = `
      background: ${bgColor};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-size: 14px;
      font-weight: 500;
      max-width: 350px;
      word-break: break-word;
      animation: slideIn 0.3s ease-out;
      pointer-events: auto;
      cursor: pointer;
    `;

    toast.innerHTML = `${icon} ${message}`;
    toastContainer.appendChild(toast);

    // Auto-remove after duration
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);

    // Remove on click
    toast.addEventListener('click', () => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        toast.remove();
      }, 300);
    });
  };

  // Add toast animations to document if not already there
  if (!document.getElementById('toastAnimationStyle')) {
    const style = document.createElement('style');
    style.id = 'toastAnimationStyle';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  console.log('✅ Toast notification system initialized');

  // ============================================================
  // SECTION 3: WINDOW OPENING FUNCTIONS
  // ============================================================

  /**
   * Open City Viewer in new tab
   */
  window.openCityViewerWindow = window.openCityViewerWindow || function() {
    console.log('🌆 Opening City Viewer in new tab...');
    try {
      const cityViewerUrl = typeof window.resolvePlannerPageUrl === 'function'
        ? window.resolvePlannerPageUrl('HTML Files/city-viewer-window.html')
        : new URL('HTML%20Files/city-viewer-window.html', window.location.href).toString();
      const newTab = window.open(cityViewerUrl, '_blank');

      if (!newTab) {
        console.warn('⚠️ Pop-up blocker may be active');
        if (window.showToast) {
          window.showToast('Please allow new tabs. Your browser may be blocking pop-ups.', 'warning', 3000);
        }
        return;
      }

      newTab.focus();
      console.log('✅ City Viewer opened in new tab');
    } catch (error) {
      console.error('❌ Error opening City Viewer:', error);
      if (window.showToast) {
        window.showToast('Error opening City Viewer: ' + error.message, 'error', 3000);
      }
    }
  };

  /**
   * Open Find Near Me in new tab
   */
  window.openFindNearMeWindow = window.openFindNearMeWindow || function() {
    console.log('📍 Opening Find Near Me in new tab...');
    try {
      const findNearMeUrl = typeof window.resolvePlannerPageUrl === 'function'
        ? window.resolvePlannerPageUrl('HTML Files/find-near-me-window.html')
        : new URL('HTML%20Files/find-near-me-window.html', window.location.href).toString();
      const newTab = window.open(findNearMeUrl, '_blank');

      if (!newTab) {
        console.warn('⚠️ Pop-up blocker may be active');
        if (window.showToast) {
          window.showToast('Please allow new tabs. Your browser may be blocking pop-ups.', 'warning', 3000);
        }
        return;
      }

      newTab.focus();
      console.log('✅ Find Near Me opened in new tab');
    } catch (error) {
      console.error('❌ Error opening Find Near Me:', error);
      if (window.showToast) {
        window.showToast('Error opening Find Near Me: ' + error.message, 'error', 3000);
      }
    }
  };

  /**
   * Open Edit Mode in new tab
   */
  window.openEditModeWindow = window.openEditModeWindow || function() {
    console.log('📝 Opening Edit Mode in new tab...');
    try {
      const editModeUrl = typeof window.resolvePlannerPageUrl === 'function'
        ? window.resolvePlannerPageUrl('HTML Files/edit-mode-enhanced.html')
        : new URL('HTML%20Files/edit-mode-enhanced.html', window.location.href).toString();
      const newTab = window.open(editModeUrl, '_blank');

      if (!newTab) {
        console.warn('⚠️ Pop-up blocker may be active');
        if (window.showToast) {
          window.showToast('Please allow new tabs. Your browser may be blocking pop-ups.', 'warning', 3000);
        }
        return;
      }

      newTab.focus();
      console.log('✅ Edit Mode opened in new tab');
    } catch (error) {
      console.error('❌ Error opening Edit Mode:', error);
      if (window.showToast) {
        window.showToast('Error opening Edit Mode: ' + error.message, 'error', 3000);
      }
    }
  };

  console.log('✅ Window opening functions ready');

  // ============================================================
  // SECTION 4: PAGINATION FIXES
  // ============================================================

  /**
   * Change page (fixed version)
   */
  window.changePage = window.changePage || function(direction) {
    console.log(`📄 Changing page by ${direction}...`);

    if (!window.totalFilteredAdventures) {
      console.warn('⚠️ totalFilteredAdventures not set');
      window.totalFilteredAdventures = window.adventuresData || [];
    }

    const totalItems = window.totalFilteredAdventures.length;
    const totalPages = Math.ceil(totalItems / (window.itemsPerPage || 20));
    let newPage = (window.currentPage || 1) + direction;

    if (newPage < 1) newPage = 1;
    if (newPage > totalPages) newPage = totalPages;

    if (newPage === (window.currentPage || 1)) {
      console.log('📄 Already on page', newPage);
      return;
    }

    window.currentPage = newPage;
    console.log(`✅ Changed to page ${newPage}`);

    if (typeof renderPaginatedCards === 'function') {
      renderPaginatedCards();
    }

    const grid = document.getElementById('adventureCardsGrid');
    if (grid) {
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  /**
   * Go to specific page
   */
  window.goToPage = window.goToPage || function(pageNumber) {
    console.log(`📄 Going to page ${pageNumber}...`);

    const numPage = parseInt(pageNumber);
    if (!isNaN(numPage) && numPage > 0) {
      window.currentPage = numPage;
      if (typeof renderPaginatedCards === 'function') {
        renderPaginatedCards();
      }
    }
  };

  console.log('✅ Pagination fixes ready');

  // ============================================================
  // SECTION 5: IPHONE VIEW TOGGLE
  // ============================================================

  /**
   * Initialize iPhone View toggle functionality
   * Allows users to switch between standard and mobile (iPhone) view
   */
  window.initIphoneToggle = window.initIphoneToggle || function() {
    console.log('📱 Initializing iPhone View toggle...');

    try {
      const iphoneToggleBtn = document.getElementById('iphoneToggleBtn');

      if (!iphoneToggleBtn) {
        console.warn('⚠️ iPhone toggle button not found');
        return;
      }

      // Check if already in iPhone view
      const isIPhoneView = document.body.classList.contains('iphone-view');

      if (isIPhoneView) {
        iphoneToggleBtn.classList.add('active');
      } else {
        iphoneToggleBtn.classList.remove('active');
      }

      console.log(`📱 iPhone View status: ${isIPhoneView ? '✅ ENABLED' : '❌ DISABLED'}`);

      // Toggle function
      function toggleIPhoneView() {
        const body = document.body;
        const isCurrentlyActive = body.classList.contains('iphone-view');

        if (isCurrentlyActive) {
          // Disable iPhone view
          body.classList.remove('iphone-view');
          iphoneToggleBtn.classList.remove('active');
          console.log('✅ iPhone View disabled - returning to standard view');

          if (window.showToast) {
            window.showToast('📱 Switched to standard view', 'info', 2000);
          }

          // Save preference to localStorage
          try {
            localStorage.setItem('iphoneViewEnabled', 'false');
          } catch (e) {
            console.warn('⚠️ Could not save iPhone view preference');
          }
        } else {
          // Enable iPhone view
          body.classList.add('iphone-view');
          iphoneToggleBtn.classList.add('active');
          console.log('✅ iPhone View enabled - switching to mobile view');

          if (window.showToast) {
            window.showToast('📱 Switched to iPhone view', 'info', 2000);
          }

          // Save preference to localStorage
          try {
            localStorage.setItem('iphoneViewEnabled', 'true');
          } catch (e) {
            console.warn('⚠️ Could not save iPhone view preference');
          }
        }

        // Trigger resize event to notify other components
        window.dispatchEvent(new Event('resize'));
        console.log('📐 Resize event dispatched');
      }

      // Update button click handler
      iphoneToggleBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleIPhoneView();
      };

      // Also support keyboard event (Escape to toggle back)
      const escapeHandler = (e) => {
        if (e.key === 'Escape' && document.body.classList.contains('iphone-view')) {
          console.log('⌨️ Escape pressed - toggling iPhone view off');
          toggleIPhoneView();
        }
      };

      document.addEventListener('keydown', escapeHandler, false);

      console.log('✅ iPhone View toggle initialized');

    } catch (error) {
      console.error('❌ Error initializing iPhone toggle:', error);
      if (window.showToast) {
        window.showToast('Error initializing iPhone view: ' + error.message, 'error', 3000);
      }
    }
  };

  console.log('✅ iPhone View toggle system ready');

  // ============================================================
  // SECTION 5.3: QUICK FILTER FUNCTIONS
  // ============================================================

  /**
   * Apply "Open Today" filter
   * Shows only places that are open today
   */
  window.applyOpenTodayFilter = window.applyOpenTodayFilter || function() {
    console.log('🟢 Applying Open Today filter...');

    try {
      const btn = document.getElementById('openTodayFilterBtn');

      // Prefer unified FilterManager state if present.
      if (window.FilterManager && window.FilterManager.state) {
        const set = window.FilterManager.state.quickFilters instanceof Set
          ? window.FilterManager.state.quickFilters
          : new Set();
        window.FilterManager.state.quickFilters = set;

        const isActive = set.has('opentoday') || set.has('openToday');
        if (isActive) {
          set.delete('opentoday');
          set.delete('openToday');
          if (btn) btn.classList.remove('active');
          window.showToast && window.showToast('🔄 Open Today filter cleared', 'info', 1500);
        } else {
          set.add('opentoday');
          if (btn) btn.classList.add('active');
          window.showToast && window.showToast('🟢 Showing only places open today', 'success', 1500);
        }

        if (typeof window.FilterManager.applyAllFilters === 'function') {
          window.FilterManager.applyAllFilters();
          return;
        }
      }

      // Legacy fallback path.
      const isActive = btn && btn.classList.contains('active');
      if (isActive) {
        if (btn) btn.classList.remove('active');
        if (window.activeFilters && window.activeFilters.quickFilters) {
          window.activeFilters.quickFilters.delete('openToday');
        }
      } else {
        if (btn) btn.classList.add('active');
        if (window.activeFilters && window.activeFilters.quickFilters) {
          window.activeFilters.quickFilters.add('openToday');
        }
      }
      if (typeof applyFilters === 'function') applyFilters();
      console.log('✅ Open Today filter applied');

    } catch (error) {
      console.error('❌ Error applying Open Today filter:', error);
      if (window.showToast) {
        window.showToast('Error applying filter: ' + error.message, 'error', 3000);
      }
    }
  };

  /**
   * Apply "Closing Soon" filter (within 2 hours)
   * Shows only places closing soon
   */
  window.applyClosingSoonFilter = window.applyClosingSoonFilter || function() {
    console.log('⏰ Applying Closing Soon filter...');

    try {
      const btn = document.getElementById('closingSoonFilterBtn');

      if (window.FilterManager && window.FilterManager.state) {
        const set = window.FilterManager.state.quickFilters instanceof Set
          ? window.FilterManager.state.quickFilters
          : new Set();
        window.FilterManager.state.quickFilters = set;

        const isActive = set.has('closingsoon') || set.has('closingSoon');
        if (isActive) {
          set.delete('closingsoon');
          set.delete('closingSoon');
          if (btn) btn.classList.remove('active');
          window.showToast && window.showToast('🔄 Closing Soon filter cleared', 'info', 1500);
        } else {
          set.add('closingsoon');
          if (btn) btn.classList.add('active');
          window.showToast && window.showToast('⏰ Showing places closing soon', 'success', 1500);
        }

        if (typeof window.FilterManager.applyAllFilters === 'function') {
          window.FilterManager.applyAllFilters();
          return;
        }
      }

      const isActive = btn && btn.classList.contains('active');
      if (isActive) {
        if (btn) btn.classList.remove('active');
        if (window.activeFilters && window.activeFilters.quickFilters) {
          window.activeFilters.quickFilters.delete('closingSoon');
        }
      } else {
        if (btn) btn.classList.add('active');
        if (window.activeFilters && window.activeFilters.quickFilters) {
          window.activeFilters.quickFilters.add('closingSoon');
        }
      }
      if (typeof applyFilters === 'function') applyFilters();
      console.log('✅ Closing Soon filter applied');

    } catch (error) {
      console.error('❌ Error applying Closing Soon filter:', error);
      if (window.showToast) {
        window.showToast('Error applying filter: ' + error.message, 'error', 3000);
      }
    }
  };

  console.log('✅ Quick filter functions ready');

  // ============================================================
  // SECTION 5.5: DRY RUN SLIDER FIXES
  // ============================================================

  /**
   * Initialize dry run sliders with proper event listeners
   */
  window.initializeDryRunSliders = window.initializeDryRunSliders || function() {
    console.log('🧪 Initializing dry run sliders...');

    const dryRunIds = [
      'singleDryRun',
      'bulkDryRun',
      'chainDryRun',
      'missingDryRun',
      'hoursDryRun',
      'refreshDryRun',
      'autoTagDryRun'
    ];

    dryRunIds.forEach(id => {
      const checkbox = document.getElementById(id);
      if (checkbox) {
        checkbox.onchange = null;

        checkbox.addEventListener('change', function(e) {
          e.stopPropagation();

          const feature = id.replace('DryRun', '');
          console.log(`🧪 Dry Run Changed: ${feature} = ${this.checked}`);

          const toggleDiv = document.getElementById(feature + 'DryRunToggle') ||
                           this.closest('.dry-run-toggle');

          if (toggleDiv) {
            if (this.checked) {
              toggleDiv.classList.add('enabled');
            } else {
              toggleDiv.classList.remove('enabled');
            }
          }

          const statusDiv = document.getElementById(feature + 'DryRunStatus');
          if (statusDiv) {
            if (this.checked) {
              statusDiv.textContent = '✅ ENABLED';
              statusDiv.classList.remove('off');
              statusDiv.classList.add('on');
            } else {
              statusDiv.textContent = '❌ DISABLED';
              statusDiv.classList.remove('on');
              statusDiv.classList.add('off');
            }
          }

          if (window.showToast) {
            window.showToast(
              `🧪 ${feature}: ${this.checked ? '✅ ENABLED' : '❌ DISABLED'}`,
              this.checked ? 'success' : 'info',
              2000
            );
          }

          console.log(`✅ Dry run toggle updated for ${feature}`);
        }, false);
      }
    });

    console.log('✅ Dry run sliders initialized');
  };

  // Initialize sliders when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initializeDryRunSliders);
  } else {
    window.initializeDryRunSliders();
  }

  console.log('✅ Dry run slider fixes ready');

  // ============================================================
  // SECTION 6: REFRESH PLACE IDS WITH PROGRESS
  // ============================================================

  /**
   * Refresh Place IDs with detailed progress tracking
   */
  window.refreshPlaceIdsWithProgress = window.refreshPlaceIdsWithProgress || async function(dryRun = false) {
    console.log(`🔄 Starting Refresh Place IDs (Dry Run: ${dryRun})...`);

    const statusDiv = document.getElementById('refresh-status');
    if (!statusDiv) {
      console.warn('⚠️ No status div found');
      return { success: false, error: 'No status div found', persisted: false, persistMode: 'unavailable', persistReason: 'missing-status-div', dryRun };
    }

    try {
      const mainWindow = window.opener && !window.opener.closed ? window.opener : window;
      const data = mainWindow.adventuresData || window.adventuresData || [];

      if (!data || data.length === 0) {
        statusDiv.innerHTML = '<div class="status-message status-error">❌ Error: No location data found</div>';
        console.error('❌ No location data');
        return { success: false, error: 'No location data found', persisted: false, persistMode: 'unavailable', persistReason: 'no-location-data', dryRun };
      }

      console.log(`📊 Processing ${data.length} locations...`);

      let successful = 0;
      let failed = 0;
      let skipped = 0;
      const details = [];
      const errors = [];
      const activeCols = (mainWindow && typeof mainWindow.getColumnIndexByName === 'function')
        ? {
            NAME: Number(mainWindow.getColumnIndexByName('Name')),
            PLACE_ID: Number(mainWindow.getColumnIndexByName('Google Place ID', ['GooglePlaceId'])),
            WEBSITE: Number(mainWindow.getColumnIndexByName('Website')),
            HOURS: Number(mainWindow.getColumnIndexByName('Hours of Operation', ['Hours'])),
            ADDRESS: Number(mainWindow.getColumnIndexByName('Address')),
            PHONE: Number(mainWindow.getColumnIndexByName('Phone Number', ['Phone'])),
            RATING: Number(mainWindow.getColumnIndexByName('Google Rating', ['Rating'])),
            DIRECTIONS: Number(mainWindow.getColumnIndexByName('Directions', ['Directions '])),
            DESCRIPTION: Number(mainWindow.getColumnIndexByName('Description'))
          }
        : {
            NAME: 0,
            PLACE_ID: 1,
            WEBSITE: 2,
            HOURS: 5,
            ADDRESS: 11,
            PHONE: 12,
            RATING: 13,
            DIRECTIONS: 15,
            DESCRIPTION: 16
          };
      const safeCol = (idx, fallback) => (Number.isInteger(idx) && idx >= 0 ? idx : fallback);
      const c = {
        NAME: safeCol(activeCols.NAME, 0),
        PLACE_ID: safeCol(activeCols.PLACE_ID, 1),
        WEBSITE: safeCol(activeCols.WEBSITE, 2),
        HOURS: safeCol(activeCols.HOURS, 5),
        ADDRESS: safeCol(activeCols.ADDRESS, 11),
        PHONE: safeCol(activeCols.PHONE, 12),
        RATING: safeCol(activeCols.RATING, 13),
        DIRECTIONS: safeCol(activeCols.DIRECTIONS, 15),
        DESCRIPTION: safeCol(activeCols.DESCRIPTION, 16)
      };
      let persistedRowUpdates = 0;
      const changedRows = [];

      for (let i = 0; i < data.length; i++) {
        const location = data[i];
          const rowValues = location && Array.isArray(location.values) && Array.isArray(location.values[0])
            ? location.values[0]
            : null;
          const placeId = location.placeId || (rowValues && rowValues[c.PLACE_ID]);
          const placeName = location.name || (rowValues && rowValues[c.NAME]);

        try {
          const progress = Math.round(((i + 1) / data.length) * 100);
          statusDiv.innerHTML = `
            <div class="status-message" style="background: #dbeafe; color: #1e40af; border-left: 4px solid #1e40af; padding: 16px; border-radius: 8px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">🔄</span>
                <div style="flex: 1;">
                  <strong>Processing: ${i + 1}/${data.length} (${progress}%)</strong>
                  <div style="font-size: 12px; margin-top: 8px;">
                    📍 ${placeName}<br>
                    ✅ Success: ${successful} | ❌ Failed: ${failed} | ⏭️ Skipped: ${skipped}
                  </div>
                </div>
              </div>
            </div>
          `;

          if (!placeId || placeId === 'SKIP' || placeId === 'undefined' || String(placeId).trim() === '') {
            skipped++;
            details.push({ status: 'skipped', name: placeName, reason: 'No Place ID' });
            continue;
          }

          if (dryRun) {
            successful++;
            details.push({
              status: 'success',
              name: placeName,
              action: 'Would refresh Place ID'
            });
            console.log(`✅ [DRY RUN] Would refresh: ${placeName}`);
          } else {
            if (mainWindow.getPlaceDetails && typeof mainWindow.getPlaceDetails === 'function') {
              try {
                const freshData = await mainWindow.getPlaceDetails(placeId);
                if (freshData) {
                  successful++;
                  details.push({
                    status: 'success',
                    name: placeName,
                    action: 'Refreshed from Google API'
                  });
                  if (rowValues) {
                    if (freshData.website) rowValues[c.WEBSITE] = String(freshData.website);
                    if (freshData.hours) {
                      rowValues[c.HOURS] = typeof mainWindow.normalizeOperationHours === 'function'
                        ? String(mainWindow.normalizeOperationHours(freshData.hours) || '')
                        : String(freshData.hours || '');
                    }
                    if (freshData.address) rowValues[c.ADDRESS] = String(freshData.address);
                    if (freshData.phone) rowValues[c.PHONE] = String(freshData.phone);
                    if (freshData.rating != null) rowValues[c.RATING] = String(freshData.rating);
                    if (freshData.directions) rowValues[c.DIRECTIONS] = String(freshData.directions);
                    if (freshData.description) rowValues[c.DESCRIPTION] = String(freshData.description);
                    persistedRowUpdates++;
                    changedRows.push(typeof window.buildChangedWorkbookRow === 'function'
                      ? window.buildChangedWorkbookRow(location, i, rowValues)
                      : { rowIndex: i, rowId: location && (location.rowId ?? location.id ?? location.index ?? i), values: Array.isArray(rowValues) ? rowValues.slice() : [] });
                  }
                  console.log(`✅ Refreshed: ${placeName}`);
                } else {
                  failed++;
                  errors.push({ name: placeName, error: 'API returned no data' });
                  details.push({
                    status: 'failed',
                    name: placeName,
                    error: 'API returned no data'
                  });
                }
              } catch (apiError) {
                failed++;
                errors.push({ name: placeName, error: apiError.message });
                details.push({
                  status: 'failed',
                  name: placeName,
                  error: apiError.message
                });
              }
            } else {
              skipped++;
              details.push({
                status: 'skipped',
                name: placeName,
                reason: 'getPlaceDetails not available'
              });
            }
          }

        } catch (error) {
          console.error(`❌ Error processing ${placeName}:`, error);
          failed++;
          errors.push({ name: placeName, error: error.message });
        }
      }

      let workbookPersisted = false;
      let workbookPersistError = '';
      let verifiedRowsChanged = 0;
      if (!dryRun && persistedRowUpdates > 0) {
        if (mainWindow && typeof mainWindow.saveToExcel === 'function') {
          try {
            if (mainWindow.saveToExcel.length >= 1 && changedRows.length) {
              for (const row of changedRows) {
                const rowRef = typeof window.resolveWorkbookRowReference === 'function'
                  ? window.resolveWorkbookRowReference(row, row.rowIndex)
                  : (row.rowId ?? row.rowIndex);
                const saveResult = await mainWindow.saveToExcel(rowRef, row.values);
                if (saveResult && typeof saveResult === 'object' && saveResult.verified) verifiedRowsChanged += 1;
              }
              workbookPersisted = true;
              console.log(`💾 Refresh Place IDs persisted ${persistedRowUpdates} row updates to workbook via row patching`);
            } else {
              await mainWindow.saveToExcel();
              workbookPersisted = true;
              console.log(`💾 Refresh Place IDs persisted ${persistedRowUpdates} row updates to workbook`);
            }
          } catch (persistErr) {
            workbookPersistError = String(persistErr && persistErr.message ? persistErr.message : persistErr);
            console.error('❌ Failed to persist refreshed Place ID data:', persistErr);
          }
        } else {
          workbookPersistError = 'saveToExcel-unavailable';
          console.warn('⚠️ saveToExcel is unavailable; refresh updates are in-memory only');
        }
      }

      let resultHTML = '<div class="status-message status-success" style="background: #ecfdf5; color: #047857; border-left: 4px solid #10b981; padding: 16px; border-radius: 8px;">';
      resultHTML += '<strong>✅ Refresh Complete!</strong><br><br>';
      resultHTML += `📊 <strong>Results:</strong><br>`;
      resultHTML += `✅ Successful: ${successful}<br>`;
      resultHTML += `❌ Failed: ${failed}<br>`;
      resultHTML += `⏭️ Skipped: ${skipped}<br>`;
      resultHTML += `📍 Total: ${data.length}<br>`;

      if (dryRun) {
        resultHTML += `<br>🧪 <strong>DRY RUN MODE - No changes made</strong>`;
      } else if (persistedRowUpdates > 0) {
        if (workbookPersisted) {
          resultHTML += `<br>💾 <strong>✅ Workbook updated (${persistedRowUpdates} rows)</strong>`;
        } else {
          resultHTML += `<br>💾 <strong>⚠️ Workbook not persisted:</strong> ${workbookPersistError || 'unknown-error'}`;
        }
      }

      resultHTML += '<br><br><strong>Details:</strong><br>';

      details.slice(0, 15).forEach(detail => {
        if (detail.status === 'success') {
          resultHTML += `✅ ${detail.name}: ${detail.action}<br>`;
        } else if (detail.status === 'failed') {
          resultHTML += `❌ ${detail.name}: ${detail.error}<br>`;
        } else if (detail.status === 'skipped') {
          resultHTML += `⏭️ ${detail.name}: ${detail.reason}<br>`;
        }
      });

      if (details.length > 15) {
        resultHTML += `<br>... and ${details.length - 15} more<br>`;
      }

      if (errors.length > 0) {
        resultHTML += `<br><strong>❌ Errors (${errors.length}):</strong><br>`;
        errors.slice(0, 5).forEach(err => {
          resultHTML += `• ${err.name}: ${err.error}<br>`;
        });
        if (errors.length > 5) {
          resultHTML += `... and ${errors.length - 5} more errors`;
        }
      }

      resultHTML += '</div>';

      statusDiv.innerHTML = resultHTML;

      if (window.showToast) {
        window.showToast(
          `✅ Refresh Complete: ${successful} success, ${failed} failed, ${skipped} skipped`,
          'success',
          5000
        );
      }

      console.log(`🎉 Refresh complete: ${successful} success, ${failed} failed, ${skipped} skipped`);
      return {
        success: failed === 0,
        message: `Refresh Complete: ${successful} success, ${failed} failed, ${skipped} skipped`,
        persisted: !!workbookPersisted,
        persistMode: dryRun ? 'dry-run' : (workbookPersisted ? (changedRows.length ? 'saveToExcel-row-patch' : 'saveToExcel') : (persistedRowUpdates > 0 ? 'error' : 'no-op')),
        persistReason: dryRun ? 'dry-run' : (workbookPersisted ? '' : (workbookPersistError || (persistedRowUpdates > 0 ? 'saveToExcel-unavailable' : 'no-row-updates'))),
        dryRun,
        updatedCount: successful,
        skippedCount: skipped,
        errorCount: failed,
        persistedRowUpdates,
        rowsChanged: changedRows.length,
        persistedRows: workbookPersisted ? changedRows.length : 0,
        verifiedRowsChanged,
        postWriteVerified: changedRows.length > 0 ? verifiedRowsChanged === changedRows.length : false,
        verificationMode: dryRun ? 'dry-run' : (changedRows.length ? 'row-reread' : 'no-op'),
        verificationReason: dryRun ? 'dry-run' : (changedRows.length ? (verifiedRowsChanged === changedRows.length ? '' : 'one-or-more-row-verifications-failed') : 'no-row-updates')
      };

    } catch (error) {
      console.error('❌ Fatal error during refresh:', error);
      statusDiv.innerHTML = `<div class="status-message status-error" style="background: #fee2e2; color: #991b1b; border-left: 4px solid #dc2626; padding: 16px; border-radius: 8px;">
        ❌ Fatal Error: ${error.message}<br><br>
        Please check the console for more details.
      </div>`;
      if (window.showToast) {
        window.showToast(`❌ Error: ${error.message}`, 'error', 5000);
      }
      return {
        success: false,
        error: error.message,
        persisted: false,
        persistMode: 'error',
        persistReason: error.message,
        dryRun
      };
    }
  };

  console.log('✅ Refresh Place IDs system ready');

  // ============================================================
  // SECTION 7: FILTER APPLICATION FIXES
  // ============================================================

  function ensureFilterManagerState() {
    if (!window.FilterManager || !window.FilterManager.state) return null;
    if (!(window.FilterManager.state.quickFilters instanceof Set)) {
      window.FilterManager.state.quickFilters = new Set();
    }
    return window.FilterManager.state;
  }

  function applyFiltersReliably() {
    if (window.FilterManager && typeof window.FilterManager.applyAllFilters === 'function') {
      window.FilterManager.applyAllFilters();
      return true;
    }
    if (typeof window.applyFilters === 'function') {
      window.applyFilters();
      return true;
    }
    return false;
  }

  function installFilterReliabilityBridge() {
    if (window.__filterReliabilityBridgeInstalled) return;
    window.__filterReliabilityBridgeInstalled = true;

    const isAdventureQuickFilterButton = (btn) => {
      if (!btn || !btn.classList || !btn.classList.contains('quick-filter-btn')) return false;
      if (btn.closest('#bikeQuickFiltersCard')) return false;
      if (btn.dataset && btn.dataset.bikeFilter) return false;
      return !!btn.closest('#quickFiltersCard');
    };

    const bridgeCounters = window.__filterBridgeDebugCounters || {
      inputApplied: 0,
      quickApplied: 0
    };
    window.__filterBridgeDebugCounters = bridgeCounters;

    window.resetFilterBridgeDebugCounters = function() {
      bridgeCounters.inputApplied = 0;
      bridgeCounters.quickApplied = 0;
      console.log('🔁 Filter bridge debug counters reset', { ...bridgeCounters });
      return { ...bridgeCounters };
    };

    function bumpBridgeCounter(kind, detail = '') {
      bridgeCounters[kind] = (bridgeCounters[kind] || 0) + 1;
      const label = kind === 'quickApplied' ? 'bridge quick-filter applied' : 'bridge input applied';
      console.log(`🔢 ${label}: ${bridgeCounters[kind]}${detail ? ` | ${detail}` : ''}`);
    }

    const textFilterIds = new Set(['searchName', 'filterDifficulty', 'filterState', 'filterCity', 'filterTags', 'filterCost']);

    const syncTextFilterState = (target) => {
      const state = ensureFilterManagerState();
      if (!state || !target || !target.id) return false;
      if (!textFilterIds.has(target.id)) return false;
      state[target.id] = (target.value || '').trim();
      return true;
    };

    const syncQuickFilterButtonsToState = () => {
      const state = ensureFilterManagerState();
      if (!state) return false;

      const nextQuickFilters = new Set();
      document.querySelectorAll('#quickFiltersCard .quick-filter-btn[data-tag].active').forEach((btn) => {
        const tag = (btn.dataset.tag || '').toLowerCase().trim();
        if (tag) nextQuickFilters.add(tag);
      });

      const openTodayBtn = document.getElementById('openTodayFilterBtn');
      if (openTodayBtn && openTodayBtn.classList.contains('active')) nextQuickFilters.add('opentoday');

      const closingSoonBtn = document.getElementById('closingSoonFilterBtn');
      if (closingSoonBtn && closingSoonBtn.classList.contains('active')) nextQuickFilters.add('closingsoon');

      const favoritesBtn = document.getElementById('favoritesFilterBtn');
      const favoritesActive = !!(favoritesBtn && favoritesBtn.classList.contains('active'));

      state.quickFilters = nextQuickFilters;
      state.favorites = favoritesActive;
      state.showFavoritesOnly = favoritesActive;

      if (window.activeFilters) {
        if (!(window.activeFilters.quickFilters instanceof Set)) {
          window.activeFilters.quickFilters = new Set();
        }
        window.activeFilters.quickFilters = new Set(nextQuickFilters);
        window.activeFilters.favorites = favoritesActive;
        window.activeFilters.showFavoritesOnly = favoritesActive;
      }

      return true;
    };

    document.addEventListener('input', (event) => {
      if (!syncTextFilterState(event.target)) return;
      const applied = applyFiltersReliably();
      bumpBridgeCounter('inputApplied', `${event.type}:${event.target.id}${applied ? '' : ':no-apply-fn'}`);
    }, true);

    document.addEventListener('change', (event) => {
      if (!syncTextFilterState(event.target)) return;
      const applied = applyFiltersReliably();
      bumpBridgeCounter('inputApplied', `${event.type}:${event.target.id}${applied ? '' : ':no-apply-fn'}`);
    }, true);

    document.addEventListener('click', (event) => {
      const btn = event.target && event.target.closest ? event.target.closest('button.quick-filter-btn') : null;
      if (!btn) return;

      if (!isAdventureQuickFilterButton(btn)) return;

      // Let the owning tab handler update button state first, then mirror it into FilterManager.
      setTimeout(() => {
        syncQuickFilterButtonsToState();
        console.log(`🧪 quick-filter debug | activeButtons=${document.querySelectorAll('#quickFiltersCard .quick-filter-btn.active').length} | state.quickFilters.size=${window.FilterManager?.state?.quickFilters?.size ?? 0}`);
        const applied = applyFiltersReliably();
        bumpBridgeCounter('quickApplied', `${btn.id || btn.dataset.tag || 'quick-filter'}${applied ? '' : ':no-apply-fn'}`);
      }, 0);
    }, true);

    console.log('✅ Filter reliability bridge installed');
    console.log('ℹ️ Reset helper available: window.resetFilterBridgeDebugCounters()');
  }

   /**
    * Fixed applyFilters that won't warn
    */
   if (!window.applyFiltersFixed) {
    window.applyFiltersFixed = true;

    const originalApplyFilters = window.applyFilters || (() => {});

    window.applyFilters = function() {
      console.log('🔍 Applying filters...');

      // Single source of truth: use FilterManager when available.
      if (window.FilterManager && typeof window.FilterManager.applyAllFilters === 'function') {
        try {
          window.FilterManager.applyAllFilters();
          return;
        } catch (fmError) {
          console.warn('⚠️ FilterManager apply failed, using legacy fallback:', fmError);
        }
      }

      if (!window.totalFilteredAdventures || !Array.isArray(window.totalFilteredAdventures)) {
        window.totalFilteredAdventures = window.adventuresData ? [...window.adventuresData] : [];
      }

      if (typeof originalApplyFilters === 'function') {
        try {
          originalApplyFilters();
        } catch (error) {
          console.warn('⚠️ Original applyFilters error:', error);
        }
      }

      if (!window.currentPage || window.currentPage < 1) {
        window.currentPage = 1;
      }

      if (typeof renderPaginatedCards === 'function') {
        renderPaginatedCards();
      }

      console.log('✅ Filters applied');
    };
  }

  // ============================================================
  // SECTION 8: Z-INDEX MANAGEMENT
  // ============================================================

  /**
   * Fix Z-Index issues for modals
   */
  window.fixModalZIndex = window.fixModalZIndex || function() {
    console.log('🔧 Fixing modal Z-Index...');

    const zIndexMap = {
      'locationHistoryBackdrop': 999998,
      'locationHistoryModal': 999998,
      'tagManagerBackdrop': 999997,
      'tagManagerModal': 999997,
      'editModeBackdrop': 999996,
      'editModeModal': 999996
    };

    Object.entries(zIndexMap).forEach(([id, zIndex]) => {
      const element = document.getElementById(id);
      if (element) {
        // Use setProperty with 'important' flag — the correct way to set !important via JS
        element.style.setProperty('z-index', String(zIndex), 'important');
        console.log(`✅ Set Z-Index for ${id}: ${zIndex}`);
      }
    });
  };

  console.log('✅ Z-Index management ready');

  // ============================================================
  // SECTION: CRITICAL BUTTON RESPONSIVENESS FIX - ENHANCED
  // ============================================================

  /**
   * ENHANCED Button responsiveness system
   * Handles: hover state lockups, scroll issues, event listener loss
   */
  function ensureButtonResponsiveness() {
    // Guard: only run once per page load — duplicate calls would stack extra intervals/listeners
    if (window.__enhancedButtonMonitorActive) {
      console.log('ℹ️ ENHANCED button responsiveness monitor already active, skipping duplicate init');
      return;
    }
    window.__enhancedButtonMonitorActive = true;
    console.log('🔧 Setting up ENHANCED button responsiveness monitor...');

    let lastInteractionAt = Date.now();

    const markInteraction = () => {
      lastInteractionAt = Date.now();
    };

    const canRunActiveRepairs = () => {
      if (document.visibilityState === 'hidden') return false;
      const hasVisibleButtons = document.querySelectorAll('button').length > 0;
      if (!hasVisibleButtons) return false;

      // Keep repairs responsive right after user input, otherwise run only when anomalies appear.
      const recentlyInteracted = (Date.now() - lastInteractionAt) < 2500;
      const pointerIssuePresent = Boolean(document.querySelector('button:not(:disabled)[style*="pointer-events: none"]'));
      const hiddenOverlayWithEvents = Boolean(document.querySelector('.modal-backdrop[style*="display: none"][style*="pointer-events: auto"], .overlay[style*="display: none"][style*="pointer-events: auto"]'));
      return recentlyInteracted || pointerIssuePresent || hiddenOverlayWithEvents;
    };

    document.addEventListener('pointerdown', markInteraction, { passive: true });
    document.addEventListener('keydown', markInteraction, { passive: true });
    document.addEventListener('focusin', markInteraction, { passive: true });

    /**
     * Fix 1: Restore hover/active states after interactions
     */
    const restoreButtonStates = () => {
      const buttons = document.querySelectorAll('button');
      buttons.forEach(btn => {

        // Remove synthetic hover class only (real CSS :hover is managed by the browser)
        if (btn.classList.contains('hover') || btn.classList.contains(':hover')) {
          btn.classList.remove('hover');
        }

        // NOTE: Do NOT call btn.blur() here. Blurring the active/focused button
        // every 500ms breaks keyboard navigation and interrupts in-progress clicks.
        // The browser manages :active and focus state correctly on its own.
      });
    };

    /**
     * Fix 2: Monitor for pointer-events: none and fix immediately
     */
    const fixPointerEventsOnButtons = () => {
      const buttons = document.querySelectorAll('button:not(:disabled)');
      buttons.forEach(btn => {
        const style = window.getComputedStyle(btn);
        const pointerEvents = style.pointerEvents;

        if (pointerEvents === 'none') {
          // Use valid inline style assignment (no !important — that's only valid in stylesheets)
          btn.style.pointerEvents = 'auto';
          console.warn(`⚠️ Fixed pointer-events:none on: ${btn.id || btn.textContent.slice(0, 20)}`);
        }

        // NOTE: Do NOT set z-index here. Forcing z-index: 10 on every button via inline style
        // creates unwanted stacking contexts and overrides carefully designed z-index layouts.
        // z-index is managed per-component in the CSS instead.

        // Remove inline opacity:0 only on non-hidden buttons that shouldn't be invisible
        if (style.opacity === '0' && !btn.classList.contains('hidden') && style.display !== 'none') {
          btn.style.opacity = '1';
        }
      });
    };

    /**
     * Fix 3: Check for overlapping elements blocking buttons
     */
    const fixOverlappingElements = () => {
      const modals = document.querySelectorAll('.modal, [role="dialog"], .overlay, .modal-backdrop');
      modals.forEach(modal => {
        const style = window.getComputedStyle(modal);
        const isHidden = style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0';

        if (isHidden) {
          // Use valid inline style assignment — !important is NOT valid in element.style
          modal.style.pointerEvents = 'none';
          // Do NOT force display:none/visibility:hidden here — the element is already hidden
          // by computed style. Setting these inline would conflict with animation/transition logic.
          return;
        }

        // Restore interactivity when dialogs/overlays become visible.
        if (modal.style.pointerEvents === 'none') {
          modal.style.pointerEvents = 'auto';
        }
      });
    };

    /**
     * Fix 4: Ensure card buttons are always accessible
     */
    const fixCardButtonZIndex = () => {
      const cardBtns = document.querySelectorAll('.card-btn, .card-action-buttons, .quick-filter-btn, .pagination-btn');
      cardBtns.forEach(btn => {
        // Use valid inline style assignment — !important is NOT valid in element.style
        btn.style.pointerEvents = 'auto';
        // NOTE: Do NOT set z-index inline here. Card component CSS handles z-index.
        // Setting z-index via inline style on every button every 500ms creates
        // stacking context chaos and overrides intentional CSS layering.
      });
    };

    const ensureCityViewerContrast = () => {
      const cityButtons = document.querySelectorAll('.city-viewer-btn');
      cityButtons.forEach((btn) => {
        // Keep high-contrast defaults if another runtime pass washed styles out.
        const computed = window.getComputedStyle(btn);
        if (computed.color === 'rgb(107, 114, 128)' || computed.backgroundColor === 'rgb(229, 231, 235)') {
          btn.style.background = 'linear-gradient(135deg, #4f6cf0, #5f73e6)';
          btn.style.color = '#ffffff';
          btn.style.border = 'none';
          btn.style.fontWeight = '700';
        }
      });
    };

    /**
     * Fix 5: Clear stuck mouse states
     */
    const clearStuckMouseStates = () => {
      // If mouse is not over any button, clear hover-like inline artifacts only on known interactive classes.
      const hoveredBtn = document.querySelector('button:hover');
      if (!hoveredBtn) {
        const buttons = document.querySelectorAll('.quick-filter-btn, .card-btn, .pagination-btn, .automation-btn');
        buttons.forEach(btn => {
          if (btn.style.backgroundColor || btn.style.boxShadow) {
            btn.style.backgroundColor = '';
            btn.style.boxShadow = '';
          }
        });
      }
    };

    /**
     * Fix 6: Re-attach event listeners that might be lost
     */
    const reattachButtonListeners = () => {
      const buttons = document.querySelectorAll('button');
      buttons.forEach(btn => {
        // Ensure button can receive events
        btn.style.pointerEvents = 'auto';

        if (!btn._listenersAttached) {
          btn._listenersAttached = true;

          // Do not cancel native mouse events globally; that can break click chains.
          btn.addEventListener('mousedown', function() {
            this.dataset.mouseDownAt = String(Date.now());
          });

          btn.addEventListener('mouseup', function() {
            delete this.dataset.mouseDownAt;
          });

          btn.addEventListener('mouseleave', function() {
            // Clear any stuck states
            delete this.dataset.mouseDownAt;
          });
        }
      });
    };

    /**
     * Fix 7: Monitor for rapid hover events that might cause issues
     */
    const createHoverThrottler = () => {
      let hoverDebounceTimer = null;
      let lastHoverTarget = null;

      document.addEventListener('mousemove', (e) => {
        const btn = e.target.closest('button');
        if (!btn) {
          lastHoverTarget = null;
          return;
        }

        if (lastHoverTarget !== btn) {
          // NOTE: Do NOT call lastHoverTarget.blur() here.
          // Blurring the previously-hovered button on every mousemove call interrupts
          // in-progress clicks and breaks keyboard focus management.
          lastHoverTarget = btn;
        }

        // Debounce rapid moves
        clearTimeout(hoverDebounceTimer);
        hoverDebounceTimer = setTimeout(() => {
          // Button should be responsive now
        }, 50);
      }, { passive: true });

      document.addEventListener('mouseleave', () => {
        lastHoverTarget = null;
      }, { passive: true });
    };

    // Run all critical fixes immediately
    fixPointerEventsOnButtons();
    fixOverlappingElements();
    fixCardButtonZIndex();
    ensureCityViewerContrast();
    clearStuckMouseStates();
    reattachButtonListeners();
    createHoverThrottler();

    // Run a lighter watchdog on cadence; only repair when interaction/anomaly warrants it.
    setInterval(() => {
      if (!canRunActiveRepairs()) return;
      fixPointerEventsOnButtons();
      fixOverlappingElements();
      fixCardButtonZIndex();
      ensureCityViewerContrast();
      restoreButtonStates();
    }, 2200);

    // Run on scroll with aggressive debounce
    document.addEventListener('scroll', () => {
      clearTimeout(window.scrollFixTimeout);
      window.scrollFixTimeout = setTimeout(() => {
        fixPointerEventsOnButtons();
        fixCardButtonZIndex();
        restoreButtonStates();
      }, 50);
    }, { passive: true });

    // Monitor for DOM changes
    const observer = new MutationObserver(() => {
      clearTimeout(window.domFixTimeout);
      window.domFixTimeout = setTimeout(() => {
        if (!canRunActiveRepairs()) return;
        fixPointerEventsOnButtons();
        fixCardButtonZIndex();
        reattachButtonListeners();
      }, 120);
    });

    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class', 'disabled', 'aria-disabled']
      });
    }

    // Monitor mouse activity to reset stuck states
    document.addEventListener('mouseout', () => {
      clearStuckMouseStates();
      restoreButtonStates();
    }, { passive: true });

    console.log('✅ ENHANCED button responsiveness monitor initialized');
  }

  // Initialize button responsiveness fixes — wait for body to exist before observing
  const _runEnsureButtonResponsiveness = () => {
    if (document.body) {
      ensureButtonResponsiveness();
    } else {
      setTimeout(_runEnsureButtonResponsiveness, 50);
    }
  };
  setTimeout(_runEnsureButtonResponsiveness, 100);

  // ============================================================
  // SECTION: PREVENT POINTER-EVENTS BLOCKING IN CSS
  // ============================================================

  /**
   * Inject CSS rules to ensure buttons are NEVER blocked by pointer-events
   * This is a critical safety net for button responsiveness
   */
  function injectButtonResponsivnessCSS() {
    const style = document.createElement('style');
    style.textContent = `
      /* ============================================================
         CRITICAL BUTTON RESPONSIVENESS RULES
         ============================================================ */

      /* ALL buttons must be interactive */
      /* NOTE: z-index removed — applying z-index: 10 globally creates stacking-context
         chaos and causes buttons INSIDE containers to visually overlap or get covered.
         Let each component manage its own z-index instead. */
      button {
        pointer-events: auto !important;
        cursor: pointer !important;
        user-select: none !important;
      }

      /* Prevent hover state lockup */
      button:hover {
        pointer-events: auto !important;
      }

      /* Prevent active state lockup */
      button:active {
        pointer-events: auto !important;
      }

      /* Focus states must not block */
      button:focus {
        pointer-events: auto !important;
      }

      /* Disabled buttons are exception */
      button:disabled {
        cursor: not-allowed !important;
        pointer-events: none !important;
        opacity: 0.5 !important;
      }

      /* ============================================================
         SPECIFIC BUTTON TYPES
         ============================================================ */

      /* Card buttons - must be accessible */
      .card-btn {
        pointer-events: auto !important;
        z-index: 15 !important;
      }

      .card-btn:hover,
      .card-btn:active,
      .card-btn:focus {
        pointer-events: auto !important;
        z-index: 15 !important;
      }

      /* Button containers */
      .card-action-buttons {
        pointer-events: auto !important;
        z-index: 15 !important;
      }

      /* Quick filter buttons */
      .quick-filter-btn {
        pointer-events: auto !important;
        z-index: 10 !important;
      }

      .quick-filter-btn:hover,
      .quick-filter-btn:active,
      .quick-filter-btn:focus {
        pointer-events: auto !important;
      }

      /* Pagination buttons */
      .pagination-btn {
        pointer-events: auto !important;
        z-index: 10 !important;
      }

      .pagination-btn:hover,
      .pagination-btn:active {
        pointer-events: auto !important;
      }

      /* Automation buttons */
      .automation-btn {
        pointer-events: auto !important;
        z-index: 10 !important;
      }

      .automation-btn:hover,
      .automation-btn:active,
      .automation-btn:focus {
        pointer-events: auto !important;
      }

      /* Auth buttons */
      .auth-btn {
        pointer-events: auto !important;
        z-index: 10 !important;
      }

      .auth-btn:hover,
      .auth-btn:active {
        pointer-events: auto !important;
      }

      /* Icon buttons inside buttons */
      button * {
        pointer-events: none !important;
      }

      /* ============================================================
         MODAL & OVERLAY RULES
         ============================================================ */

      /* Only hidden modals should block */
      .modal {
        pointer-events: auto !important;
      }

      .modal.hidden,
      .modal:not(.active),
      .modal[style*="display: none"],
      .modal[style*="visibility: hidden"] {
        pointer-events: none !important;
        display: none !important;
        visibility: hidden !important;
      }

      /* Overlays - only block if visible */
      .overlay:not(.active),
      .overlay[style*="display: none"],
      .overlay[style*="visibility: hidden"] {
        pointer-events: none !important;
      }

      .modal-backdrop:not(.visible),
      .modal-backdrop[style*="display: none"] {
        pointer-events: none !important;
      }

      /* ============================================================
         PREVENT STUCK STATES
         ============================================================ */

      /* Prevent stuck selection state */
      button.selected {
        pointer-events: auto !important;
      }

      /* Prevent stuck loading state from blocking */
      button.loading {
        pointer-events: auto !important;
      }

      button.loading:hover {
        pointer-events: auto !important;
      }

      /* Ensure transition doesn't cause issues */
      button {
        transition: all 0.15s ease !important;
      }

      /* NOTE: We intentionally do NOT force opacity:1/visibility:visible on all buttons.
         Forcing those globally can make intentionally-hidden buttons visible and interactive,
         which causes them to overlap real buttons and block clicks/hover on the real ones.
         Instead, only ensure pointer-events are correct (handled above). */

      button[style*="opacity: 0"],
      button[style*="visibility: hidden"],
      button[style*="display: none"] {
        display: none !important;
      }
    `;

    document.head.appendChild(style);
    console.log('✅ ENHANCED button responsiveness CSS injected');
  }

  // Inject CSS as soon as possible
  if (document.head) {
    injectButtonResponsivnessCSS();
  } else {
    document.addEventListener('DOMContentLoaded', injectButtonResponsivnessCSS);
  }

  // ============================================================
  // SECTION: CONNECTION STATUS MANAGEMENT
  // ============================================================

  /**
   * Update the connection status indicator
   * This updates the data load indicator to show if we're connected to Excel
   */
  window.updateConnectionStatus = function(isConnected) {
    console.log(`🔗 Updating connection status: ${isConnected ? '✅ CONNECTED' : '❌ NOT CONNECTED'}`);

    try {
      const dataLoadIndicator = document.getElementById('dataLoadIndicator');
      const dataLoadText = document.getElementById('dataLoadText');
      const signInRequiredBanner = document.getElementById('signInRequiredBanner');
      const signedOutModeLine = document.getElementById('signedOutModeLine');

      if (!dataLoadIndicator || !dataLoadText) {
        console.warn('⚠️ dataLoadIndicator or dataLoadText element not found in DOM');
        console.warn('  - dataLoadIndicator:', !!dataLoadIndicator);
        console.warn('  - dataLoadText:', !!dataLoadText);
        return;
      }

      const activeAccount = window.activeAccount
        || (window.msalInstance && typeof window.msalInstance.getActiveAccount === 'function'
          ? window.msalInstance.getActiveAccount()
          : null);
      const hideSignedOutCtas = Boolean(isConnected) || Boolean(activeAccount);
      if (signInRequiredBanner) {
        signInRequiredBanner.hidden = hideSignedOutCtas;
      }
      if (signedOutModeLine) {
        signedOutModeLine.hidden = hideSignedOutCtas;
        if (hideSignedOutCtas) signedOutModeLine.classList.remove('is-sticky-mobile');
      }

      if (isConnected) {
        // Connected to Excel
        dataLoadText.textContent = '✅ Connected to Excel';
        dataLoadText.style.color = '#22c55e'; // Green
        dataLoadText.style.fontWeight = '600';
        dataLoadIndicator.style.borderColor = '#22c55e';
        dataLoadIndicator.style.backgroundColor = '#f0fdf4'; // Light green
        dataLoadIndicator.classList.add('connected');
        dataLoadIndicator.classList.remove('disconnected');
        console.log('✅ Connection status updated: CONNECTED');
      } else {
        // Not connected to Excel
        dataLoadText.textContent = '❌ Not connected to Excel';
        dataLoadText.style.color = '#ef4444'; // Red
        dataLoadText.style.fontWeight = '600';
        dataLoadIndicator.style.borderColor = '#ef4444';
        dataLoadIndicator.style.backgroundColor = '#fef2f2'; // Light red
        dataLoadIndicator.classList.add('disconnected');
        dataLoadIndicator.classList.remove('connected');
        console.log('❌ Connection status updated: NOT CONNECTED');
      }
    } catch (error) {
      console.error('❌ Error updating connection status:', error);
    }
  };

  function bindSignInRequiredBannerButton() {
    const btn = document.getElementById('signInRequiredBannerBtn');
    const compactBtn = document.getElementById('signedOutModeLineBtn');
    const bindSignInCta = (targetBtn) => {
      if (!targetBtn || targetBtn.dataset.signInRequiredBound === '1') return;
      targetBtn.dataset.signInRequiredBound = '1';
      targetBtn.addEventListener('click', async (event) => {
        if (event) event.preventDefault();
        try {
          if (typeof window.signIn === 'function') {
            await window.signIn();
            return;
          }
        } catch (error) {
          console.error('❌ Sign-in required banner action failed:', error);
        }
        const fallbackBtn = document.getElementById('signInBtn');
        if (fallbackBtn) fallbackBtn.click();
      });
    };
    bindSignInCta(btn);
    bindSignInCta(compactBtn);
  }

  /**
   * Initialize connection status on page load
   * Checks if user is already signed in
   */
  function initializeConnectionStatus() {
    console.log('🔗 Initializing connection status...');
    bindSignInRequiredBannerButton();

    // Check if there's an existing access token or active account
    const hasAuth = window.accessToken || window.activeAccount;

    if (hasAuth) {
      console.log('✅ User already authenticated, marking as connected');
      window.updateConnectionStatus(true);
    } else {
      console.log('❌ User not authenticated, marking as disconnected');
      window.updateConnectionStatus(false);
    }

    console.log('✅ Connection status initialized');
  }

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeConnectionStatus);
  } else {
    setTimeout(initializeConnectionStatus, 100);
  }

  // ============================================================
  // INITIALIZATION
  // ============================================================

  // Initialize globals on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGlobals);
  } else {
    initializeGlobals();
  }

  console.log('✅ Consolidated Comprehensive Fix System v7.0.141 Loaded');
  console.log('  - Global Variable Initialization');
  console.log('  - Safe String Operations');
  console.log('  - Window Opening Functions');
  console.log('  - Pagination Fixes');
  console.log('  - Dry Run Slider Fixes');
  console.log('  - Refresh Place IDs with Progress');
  console.log('  - Filter Application Fixes');
  console.log('  - Z-Index Management');
  console.log('  - Error Handling & Recovery');
  console.log('  - Performance Optimizations');

  // ============================================================
  // SECTION: EXCEL FILE CONFIGURATION & UTILITIES
  // ============================================================

  /**
   * Initialize Excel file configuration
   * Sets up proper file name and table name for Graph API calls
   */
  window.initializeExcelConfig = window.initializeExcelConfig || function() {
    console.log('🔧 Initializing Excel configuration...');

    try {
      // Canonical workbook location used throughout the app.
      if (!window.filePath || typeof window.filePath !== 'string' || !window.filePath.trim()) {
        window.filePath = 'Copilot_Apps/Kyles_Adventure_Finder/Adventure_Finder_Excel_DB.xlsx';
        console.log('✅ Set default filePath:', window.filePath);
      }

      if (!window.fileName || typeof window.fileName !== 'string' || !window.fileName.trim()) {
        window.fileName = 'Adventure_Finder_Excel_DB.xlsx';
        console.log('✅ Set default fileName:', window.fileName);
      }

      if (!window.tableName || typeof window.tableName !== 'string' || !window.tableName.trim()) {
        window.tableName = 'MyList';
        console.log('✅ Set default tableName: MyList');
      }

      // Never delete/blank a valid active filePath; this caused 404 regressions.
      if (window.filePath && /adventure/i.test(window.filePath) === false) {
        console.warn('⚠️ Non-standard filePath detected, keeping as-is:', window.filePath);
      }

      console.log('✅ Excel configuration ready');
      console.log(`   filePath: ${window.filePath}`);
      console.log(`   fileName: ${window.fileName}`);
      console.log(`   tableName: ${window.tableName}`);

    } catch (error) {
      console.error('❌ Error initializing Excel config:', error);
    }
  };

  // Initialize Excel config on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initializeExcelConfig);
  } else {
    setTimeout(window.initializeExcelConfig, 100);
  }

  console.log('✅ Excel utilities ready');

  // ============================================================
  // SECTION: ADVENTURE METADATA STATUS LINE
  // ============================================================

  function setAdventureMetadataStatus(state, details = {}) {
    const statusLine = document.getElementById('adventureMetadataStatusLine');
    const debugLine = document.getElementById('adventureMetadataDebugLine');
    if (!statusLine || !debugLine) return;

    const filePath = String(window.filePath || 'Copilot_Apps/Kyles_Adventure_Finder/Adventure_Finder_Excel_DB.xlsx');
    const fileName = String(window.fileName || 'Adventure_Finder_Excel_DB.xlsx');
    const tableName = String(window.tableName || 'MyList');
    const tableRef = String(window.tableRef || tableName);

    const paintStatus = (text, border, bg, color) => {
      statusLine.textContent = text;
      statusLine.style.display = 'inline-flex';
      statusLine.style.marginTop = '6px';
      statusLine.style.padding = '6px 10px';
      statusLine.style.borderRadius = '999px';
      statusLine.style.border = `1px solid ${border}`;
      statusLine.style.background = bg;
      statusLine.style.color = color;
      statusLine.style.fontSize = '12px';
      statusLine.style.fontWeight = '600';
    };

    if (state === 'loading') {
      paintStatus(`Loading Adventure Planner data... • ${fileName}`, '#93c5fd', '#eff6ff', '#1d4ed8');
    } else if (state === 'ready') {
      const count = Number(details.count || 0);
      paintStatus(`${count} adventures loaded • ${filePath} / ${tableName}`, '#a7f3d0', '#ecfdf5', '#065f46');
    } else if (state === 'error') {
      const message = details.message ? ` • ${details.message}` : '';
      paintStatus(`Failed to load Adventure Planner data${message}`, '#fca5a5', '#fef2f2', '#991b1b');
    } else {
      paintStatus(`Sign in to load Adventure Planner data • ${fileName}`, '#fcd34d', '#fffbeb', '#92400e');
    }

    debugLine.textContent = `Debug: file=${filePath} | tableName=${tableName} | tableRef=${tableRef}`;
    debugLine.style.display = 'block';
    debugLine.style.marginTop = '6px';
    debugLine.style.fontSize = '11px';
    debugLine.style.color = '#6b7280';
  }

  function installAdventureMetadataLoadBridge() {
    if (window.__adventureMetadataBridgeInstalled) return;
    window.__adventureMetadataBridgeInstalled = true;

    const tryWrap = () => {
      if (typeof window.loadTable !== 'function') return false;
      if (window.loadTable.__adventureMetadataWrapped) return true;

      const originalLoadTable = window.loadTable;
      const wrappedLoadTable = async function(...args) {
        setAdventureMetadataStatus('loading');
        try {
          const result = await originalLoadTable.apply(this, args);
          const count = Array.isArray(window.adventuresData) ? window.adventuresData.length : 0;
          if (result === false && !window.accessToken) {
            setAdventureMetadataStatus('idle');
          } else if (result === false && count === 0) {
            setAdventureMetadataStatus('error', { message: 'No data returned' });
          } else {
            setAdventureMetadataStatus('ready', { count });
          }
          return result;
        } catch (error) {
          setAdventureMetadataStatus('error', { message: error && error.message ? error.message : 'Unknown error' });
          throw error;
        }
      };

      wrappedLoadTable.__adventureMetadataWrapped = true;
      window.loadTable = wrappedLoadTable;
      return true;
    };

    // Run now and keep a short-lived watcher for late loadTable reassignments.
    tryWrap();
    let tries = 0;
    const interval = setInterval(() => {
      tries += 1;
      tryWrap();
      if (tries > 60) clearInterval(interval);
    }, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setAdventureMetadataStatus(window.accessToken ? 'loading' : 'idle');
      installAdventureMetadataLoadBridge();
    });
  } else {
    setAdventureMetadataStatus(window.accessToken ? 'loading' : 'idle');
    installAdventureMetadataLoadBridge();
  }

  console.log('✅ Adventure metadata status bridge ready');

  // installAdventureFilterBridge();
  // Disabled: canonical adventure filtering is owned by index.html FilterManager

})();

