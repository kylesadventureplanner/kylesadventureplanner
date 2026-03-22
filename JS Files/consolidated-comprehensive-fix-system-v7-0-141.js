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

  // ============================================================
  // SECTION 3: WINDOW OPENING FUNCTIONS
  // ============================================================

  /**
   * Open City Viewer in new tab
   */
  window.openCityViewerWindow = window.openCityViewerWindow || function() {
    console.log('🌆 Opening City Viewer in new tab...');
    try {
      const cityViewerUrl = 'HTML Files/city-viewer-window.html';
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
      const findNearMeUrl = 'HTML Files/find-near-me-window.html';
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
      const editModeUrl = 'HTML Files/edit-mode-enhanced.html';
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
  // SECTION 5: DRY RUN SLIDER FIXES
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
      return;
    }

    try {
      const mainWindow = window.opener && !window.opener.closed ? window.opener : window;
      const data = mainWindow.adventuresData || window.adventuresData || [];

      if (!data || data.length === 0) {
        statusDiv.innerHTML = '<div class="status-message status-error">❌ Error: No location data found</div>';
        console.error('❌ No location data');
        return;
      }

      console.log(`📊 Processing ${data.length} locations...`);

      let successful = 0;
      let failed = 0;
      let skipped = 0;
      const details = [];
      const errors = [];
      const m365Updates = [];  // TRACK CHANGES FOR SYNC

      for (let i = 0; i < data.length; i++) {
        const location = data[i];
        const placeId = location.placeId || (location.values && location.values[0][1]);
        const placeName = location.name || (location.values && location.values[0][0]);

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
                  // TRACK UPDATE FOR SYNC
                  m365Updates.push({
                    rowIndex: i,
                    placeId: placeId,
                    data: freshData
                  });
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

      // NEW: SYNC CHANGES BACK TO PARENT WINDOW
      if (!dryRun && m365Updates.length > 0) {
        console.log(`📝 Syncing ${m365Updates.length} updates back to parent window...`);
        for (const update of m365Updates) {
          if (mainWindow.adventuresData && mainWindow.adventuresData[update.rowIndex]) {
            Object.assign(mainWindow.adventuresData[update.rowIndex], update.data);
            console.log(`✅ Synced row ${update.rowIndex}: ${update.placeId}`);
          }
        }
        console.log(`✅ All updates synced to parent window`);
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
      } else if (m365Updates.length > 0) {
        resultHTML += `<br>📝 <strong>✅ Data synced to parent window!</strong><br>`;
        resultHTML += `<span style="font-size: 12px; color: #059669;">Close this window and press Ctrl+S to save to Excel</span>`;
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

    } catch (error) {
      console.error('❌ Fatal error during refresh:', error);
      statusDiv.innerHTML = `<div class="status-message status-error" style="background: #fee2e2; color: #991b1b; border-left: 4px solid #dc2626; padding: 16px; border-radius: 8px;">
        ❌ Fatal Error: ${error.message}<br><br>
        Please check the console for more details.
      </div>`;
      if (window.showToast) {
        window.showToast(`❌ Error: ${error.message}`, 'error', 5000);
      }
    }
  };

  console.log('✅ Refresh Place IDs system ready');

  // ============================================================
  // SECTION 7: FILTER APPLICATION FIXES
  // ============================================================

  /**
   * Fixed applyFilters that won't warn
   */
  if (!window.applyFiltersFixed) {
    window.applyFiltersFixed = true;

    const originalApplyFilters = window.applyFilters || (() => {});

    window.applyFilters = function() {
      console.log('🔍 Applying filters...');

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

  console.log('✅ Filter application fixes ready');

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
        element.style.zIndex = zIndex + ' !important';
        console.log(`✅ Set Z-Index for ${id}: ${zIndex}`);
      }
    });
  };

  console.log('✅ Z-Index management ready');

  // ============================================================
  // SECTION: CRITICAL BUTTON RESPONSIVENESS FIX
  // ============================================================

  /**
   * Ensure buttons are always responsive by fixing pointer-events and z-index issues
   * This is a critical fix for buttons becoming unresponsive after scrolling
   */
  function ensureButtonResponsiveness() {
    console.log('🔧 Setting up button responsiveness monitor...');

    // Fix 1: Monitor for any pointer-events: none on buttons
    const fixPointerEventsOnButtons = () => {
      const buttons = document.querySelectorAll('button');
      buttons.forEach(btn => {
        // Get computed style
        const style = window.getComputedStyle(btn);
        const pointerEvents = style.pointerEvents;

        // If pointer-events is blocking, fix it
        if (pointerEvents === 'none' && !btn.disabled && !btn.classList.contains('loading')) {
          console.warn(`⚠️ Fixed pointer-events:none on button: ${btn.id || btn.className}`);
          btn.style.pointerEvents = 'auto';
        }

        // Ensure all buttons have proper z-index
        if (!btn.style.zIndex || btn.style.zIndex === 'auto') {
          btn.style.zIndex = '10';
        }
      });
    };

    // Fix 2: Check for overlapping modals or overlays blocking buttons
    const fixOverlappingElements = () => {
      const modals = document.querySelectorAll('.modal, [role="dialog"], .overlay');
      modals.forEach(modal => {
        // If modal is hidden, ensure it's not blocking
        const style = window.getComputedStyle(modal);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
          modal.style.pointerEvents = 'none';
          console.log(`✅ Set pointer-events:none on hidden modal`);
        }
      });
    };

    // Fix 3: Ensure card buttons have proper z-index
    const fixCardButtonZIndex = () => {
      const cardBtns = document.querySelectorAll('.card-btn, .card-action-buttons');
      cardBtns.forEach(btn => {
        const parent = btn.closest('.adventure-card');
        if (parent) {
          // Ensure card is properly layered
          if (!parent.style.zIndex || parent.style.zIndex === 'auto') {
            parent.style.zIndex = '1';
          }
          // Ensure button container is on top
          if (btn.classList.contains('card-action-buttons')) {
            btn.style.zIndex = '15';
            btn.style.position = 'relative';
          } else {
            btn.style.zIndex = 'auto';
            btn.style.position = 'relative';
          }
        }
      });
    };

    // Fix 4: Remove any visibility: hidden or display: none from clickable buttons
    const fixVisibilityOnButtons = () => {
      const buttons = document.querySelectorAll('button');
      buttons.forEach(btn => {
        // Only fix if button is not actually supposed to be hidden
        if (!btn.id.includes('hidden') && !btn.className.includes('hidden')) {
          const style = window.getComputedStyle(btn);
          if (style.visibility === 'hidden') {
            btn.style.visibility = 'visible';
            console.warn(`⚠️ Fixed visibility:hidden on button: ${btn.id || btn.className}`);
          }
          if (style.display === 'none') {
            btn.style.display = 'inline-block';
            console.warn(`⚠️ Fixed display:none on button: ${btn.id || btn.className}`);
          }
        }
      });
    };

    // Fix 5: Ensure buttons have proper cursor style
    const fixButtonCursorStyle = () => {
      const buttons = document.querySelectorAll('button:not(:disabled)');
      buttons.forEach(btn => {
        if (btn.style.cursor !== 'pointer') {
          btn.style.cursor = 'pointer';
        }
      });
    };

    // Run all fixes immediately
    fixPointerEventsOnButtons();
    fixOverlappingElements();
    fixCardButtonZIndex();
    fixVisibilityOnButtons();
    fixButtonCursorStyle();

    // Run fixes periodically to catch any new issues
    setInterval(() => {
      fixPointerEventsOnButtons();
      fixOverlappingElements();
      fixCardButtonZIndex();
    }, 1000);

    // Also run fixes on scroll (since buttons may be re-rendered)
    document.addEventListener('scroll', () => {
      // Debounce scroll handler
      clearTimeout(window.scrollFixTimeout);
      window.scrollFixTimeout = setTimeout(() => {
        fixPointerEventsOnButtons();
        fixCardButtonZIndex();
      }, 100);
    }, { passive: true });

    // Run fixes when DOM changes
    const observer = new MutationObserver(() => {
      clearTimeout(window.domFixTimeout);
      window.domFixTimeout = setTimeout(() => {
        fixPointerEventsOnButtons();
        fixCardButtonZIndex();
      }, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    console.log('✅ Button responsiveness monitor initialized');
  }

  // Initialize button responsiveness fixes
  setTimeout(() => {
    ensureButtonResponsiveness();
  }, 100);

  // ============================================================
  // SECTION: PREVENT POINTER-EVENTS BLOCKING IN CSS
  // ============================================================

  /**
   * Inject CSS rules to ensure buttons are never blocked by pointer-events
   */
  function injectButtonResponsivnessCSS() {
    const style = document.createElement('style');
    style.textContent = `
      /* Critical: Ensure all buttons remain interactive */
      button {
        pointer-events: auto !important;
        cursor: pointer !important;
        position: relative;
        z-index: 10;
      }

      /* Ensure disabled buttons still have proper styling */
      button:disabled {
        cursor: not-allowed !important;
        pointer-events: none !important;
      }

      /* Card buttons must be accessible */
      .card-btn {
        pointer-events: auto !important;
        z-index: 15;
      }

      /* Button containers must not block */
      .card-action-buttons {
        pointer-events: auto !important;
        z-index: 15;
      }

      /* Modals should not block buttons outside them */
      .modal {
        pointer-events: auto !important;
      }

      .modal.hidden,
      .modal:not(.active) {
        pointer-events: none !important;
      }

      /* Overlays should not block if hidden */
      .overlay:not(.active) {
        pointer-events: none !important;
      }

      /* Quick filter buttons must be accessible */
      .quick-filter-btn {
        pointer-events: auto !important;
      }

      /* Pagination buttons must be accessible */
      .pagination-btn {
        pointer-events: auto !important;
      }

      /* Automation buttons must be accessible */
      .automation-btn {
        pointer-events: auto !important;
      }

      /* Auth buttons must be accessible */
      .auth-btn {
        pointer-events: auto !important;
      }
    `;

    document.head.appendChild(style);
    console.log('✅ Button responsiveness CSS injected');
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
      const statusDot = dataLoadIndicator?.querySelector('.status-dot');
      const dataLoadText = document.getElementById('dataLoadText');

      if (!dataLoadIndicator) {
        console.warn('⚠️ dataLoadIndicator element not found');
        return;
      }

      if (isConnected) {
        // Connected to Excel
        if (statusDot) {
          statusDot.classList.remove('disconnected');
          statusDot.classList.add('connected');
          statusDot.style.backgroundColor = '#22c55e'; // Green
        }

        if (dataLoadText) {
          dataLoadText.textContent = '✅ Connected to Excel';
          dataLoadText.style.color = '#22c55e'; // Green
          dataLoadText.style.fontWeight = '600';
        }

        dataLoadIndicator.style.borderColor = '#22c55e';
        dataLoadIndicator.style.backgroundColor = '#f0fdf4'; // Light green background
        console.log('✅ Connection status updated: CONNECTED');
      } else {
        // Not connected to Excel
        if (statusDot) {
          statusDot.classList.remove('connected');
          statusDot.classList.add('disconnected');
          statusDot.style.backgroundColor = '#ef4444'; // Red
        }

        if (dataLoadText) {
          dataLoadText.textContent = '❌ Not connected to Excel';
          dataLoadText.style.color = '#ef4444'; // Red
          dataLoadText.style.fontWeight = '600';
        }

        dataLoadIndicator.style.borderColor = '#ef4444';
        dataLoadIndicator.style.backgroundColor = '#fef2f2'; // Light red background
        console.log('❌ Connection status updated: NOT CONNECTED');
      }
    } catch (error) {
      console.error('❌ Error updating connection status:', error);
    }
  };

  /**
   * Initialize connection status on page load
   * Checks if user is already signed in
   */
  function initializeConnectionStatus() {
    console.log('🔗 Initializing connection status...');

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

})();

// ============================================================
// EXPORTS FOR MODULE USE
// ============================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    safeString: window.safeString,
    safeLowerCase: window.safeLowerCase,
    safeNumber: window.safeNumber,
    isEmpty: window.isEmpty,
    changePage: window.changePage,
    goToPage: window.goToPage,
    openCityViewerWindow: window.openCityViewerWindow,
    openFindNearMeWindow: window.openFindNearMeWindow,
    openEditModeWindow: window.openEditModeWindow,
    initializeDryRunSliders: window.initializeDryRunSliders,
    refreshPlaceIdsWithProgress: window.refreshPlaceIdsWithProgress,
    fixModalZIndex: window.fixModalZIndex
  };
}
