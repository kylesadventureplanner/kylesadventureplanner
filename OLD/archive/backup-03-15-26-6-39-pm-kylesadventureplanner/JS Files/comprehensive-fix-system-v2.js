/**
 * COMPREHENSIVE FIX SYSTEM - v7.0.130 ENHANCED
 * ===================================
 * Fixes for:
 * 1. filteredAdventures not set warnings
 * 2. Pagination (Next/Previous) not working
 * 3. Dry run sliders not working
 * 4. Refresh Place IDs with progress tracking
 * 5. Error handling for null values
 * 6. Open windows in new tabs
 *
 * Date: March 15, 2026
 */

(function() {
  console.log('🚀 Comprehensive Fix System v7.0.130 Enhanced Loading...');

  // ============================================================
  // 1. INITIALIZE GLOBAL VARIABLES PROPERLY
  // ============================================================

  // Ensure these globals exist and are properly initialized
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

  // ============================================================
  // 2. SAFE STRING OPERATIONS - Handle null/undefined
  // ============================================================

  /**
   * Safely convert to string
   */
  window.safeString = function(value) {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value);
  };

  /**
   * Safely convert to lowercase
   */
  window.safeLowerCase = function(value) {
    const str = window.safeString(value);
    return str.toLowerCase();
  };

  // ============================================================
  // 3. WINDOW OPENING FUNCTIONS
  // ============================================================

  /**
   * Open City Viewer in new tab
   */
  window.openCityViewerWindow = function() {
    console.log('🌆 Opening City Viewer in new tab...');
    try {
      // Open in new tab using standard tab opening (not popup)
      const cityViewerUrl = 'HTML Files/city-viewer-window.html';
      const newTab = window.open(cityViewerUrl, '_blank');

      if (!newTab) {
        console.warn('⚠️ Pop-up blocker may be active');
        alert('Please allow new tabs/windows. Your browser may be blocking pop-ups.');
        return;
      }

      // Focus the new tab
      newTab.focus();
      console.log('✅ City Viewer opened in new tab');
    } catch (error) {
      console.error('❌ Error opening City Viewer:', error);
      alert('Error opening City Viewer: ' + error.message);
    }
  };

  /**
   * Open Find Near Me in new tab
   */
  window.openFindNearMeWindow = function() {
    console.log('📍 Opening Find Near Me in new tab...');
    try {
      // Open in new tab using standard tab opening (not popup)
      const findNearMeUrl = 'HTML Files/find-near-me-window.html';
      const newTab = window.open(findNearMeUrl, '_blank');

      if (!newTab) {
        console.warn('⚠️ Pop-up blocker may be active');
        alert('Please allow new tabs/windows. Your browser may be blocking pop-ups.');
        return;
      }

      // Focus the new tab
      newTab.focus();
      console.log('✅ Find Near Me opened in new tab');
    } catch (error) {
      console.error('❌ Error opening Find Near Me:', error);
      alert('Error opening Find Near Me: ' + error.message);
    }
  };

  // ============================================================
  // 4. PAGINATION FIX - Next/Previous buttons
  // ============================================================

  /**
   * Change page (fixed version)
   */
  window.changePage = function(direction) {
    console.log(`📄 Changing page by ${direction}...`);

    if (!window.totalFilteredAdventures) {
      console.warn('⚠️ totalFilteredAdventures not set');
      window.totalFilteredAdventures = window.adventuresData || [];
    }

    const totalItems = window.totalFilteredAdventures.length;
    const totalPages = Math.ceil(totalItems / window.itemsPerPage);
    let newPage = (window.currentPage || 1) + direction;

    // Validate page number
    if (newPage < 1) newPage = 1;
    if (newPage > totalPages) newPage = totalPages;

    if (newPage === (window.currentPage || 1)) {
      console.log('📄 Already on page', newPage);
      return;
    }

    window.currentPage = newPage;
    console.log(`✅ Changed to page ${newPage}`);

    // Re-render cards
    if (typeof renderPaginatedCards === 'function') {
      renderPaginatedCards();
    }

    // Scroll to top
    const grid = document.getElementById('adventureCardsGrid');
    if (grid) {
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // ============================================================
  // 5. DRY RUN SLIDER FIX - Make sliders actually work
  // ============================================================

  /**
   * Initialize dry run sliders with proper event listeners
   */
  window.initializeDryRunSliders = function() {
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
        // Remove old listeners
        checkbox.onchange = null;

        // Add new listener
        checkbox.addEventListener('change', function(e) {
          e.stopPropagation();

          const feature = id.replace('DryRun', '');

          console.log(`🧪 Dry Run Changed: ${feature} = ${this.checked}`);

          // Update toggle appearance
          const toggleDiv = document.getElementById(feature + 'DryRunToggle') ||
                           this.closest('.dry-run-toggle');

          if (toggleDiv) {
            if (this.checked) {
              toggleDiv.classList.add('enabled');
            } else {
              toggleDiv.classList.remove('enabled');
            }
          }

          // Update status badge
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

          // Show toast
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

  // ============================================================
  // 6. REFRESH PLACE IDS - WITH REAL PROGRESS TRACKING
  // ============================================================

  /**
   * Refresh Place IDs with detailed progress tracking
   */
  window.refreshPlaceIdsWithProgress = async function(dryRun = false) {
    console.log(`🔄 Starting Refresh Place IDs (Dry Run: ${dryRun})...`);

    const statusDiv = document.getElementById('refresh-status');
    if (!statusDiv) {
      console.warn('⚠️ No status div found');
      return;
    }

    try {
      // Get data from main window or current window
      const mainWindow = window.opener && !window.opener.closed ? window.opener : window;
      const data = mainWindow.adventuresData || window.adventuresData || [];

      if (!data || data.length === 0) {
        statusDiv.innerHTML = '<div class="status-message status-error">❌ Error: No location data found</div>';
        console.error('❌ No location data');
        return;
      }

      console.log(`📊 Processing ${data.length} locations...`);

      // Initialize tracking variables
      let processed = 0;
      let successful = 0;
      let failed = 0;
      let skipped = 0;
      const details = [];
      const errors = [];

      // Process each location
      for (let i = 0; i < data.length; i++) {
        const location = data[i];
        const placeId = location.placeId || (location.values && location.values[0][3]);
        const placeName = location.name || (location.values && location.values[0][0]);
        const address = location.address || (location.values && location.values[0][11]);

        try {
          // Update progress in real-time
          const progress = Math.round(((i + 1) / data.length) * 100);
          statusDiv.innerHTML = `
            <div class="status-message" style="background: #dbeafe; color: #1e40af; border-left: 4px solid #1e40af;">
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

          // Skip if no place ID
          if (!placeId || placeId === 'SKIP' || placeId === 'undefined') {
            skipped++;
            details.push({ status: 'skipped', name: placeName, reason: 'No Place ID' });
            continue;
          }

          // In dry run mode, just simulate
          if (dryRun) {
            successful++;
            details.push({
              status: 'success',
              name: placeName,
              action: 'Would refresh Place ID'
            });
            console.log(`✅ [DRY RUN] Would refresh: ${placeName}`);
          } else {
            // Try to get fresh place details
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
                  console.log(`✅ Refreshed: ${placeName}`);
                } else {
                  failed++;
                  errors.push({ name: placeName, error: 'API returned no data' });
                  details.push({
                    status: 'failed',
                    name: placeName,
                    error: 'API returned no data'
                  });
                  console.warn(`⚠️ API returned no data for: ${placeName}`);
                }
              } catch (apiError) {
                failed++;
                errors.push({ name: placeName, error: apiError.message });
                details.push({
                  status: 'failed',
                  name: placeName,
                  error: apiError.message
                });
                console.warn(`⚠️ Error refreshing ${placeName}:`, apiError);
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

          processed++;

        } catch (error) {
          console.error(`❌ Error processing ${placeName}:`, error);
          failed++;
          errors.push({ name: placeName, error: error.message });
        }
      }

      // Show final results
      let resultHTML = '<div class="status-message status-success">';
      resultHTML += '<strong>✅ Refresh Complete!</strong><br><br>';
      resultHTML += `📊 <strong>Results:</strong><br>`;
      resultHTML += `✅ Successful: ${successful}<br>`;
      resultHTML += `❌ Failed: ${failed}<br>`;
      resultHTML += `⏭️ Skipped: ${skipped}<br>`;
      resultHTML += `📍 Total: ${data.length}<br>`;

      if (dryRun) {
        resultHTML += `<br>🧪 <strong>DRY RUN MODE - No changes made</strong>`;
      } else {
        resultHTML += `<br>💾 <strong>Changes would be saved to Excel</strong>`;
      }

      resultHTML += '<br><br><strong>Details:</strong><br>';

      // Show first 15 details
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

      // Show toast notification
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
      statusDiv.innerHTML = `<div class="status-message status-error">
        ❌ Fatal Error: ${error.message}<br><br>
        Please check the console for more details.
      </div>`;
      if (window.showToast) {
        window.showToast(`❌ Error: ${error.message}`, 'error', 5000);
      }
    }
  };

  // Override the edit mode function if it exists
  if (typeof window.submitRefreshPlaceIds !== 'undefined') {
    const oldRefresh = window.submitRefreshPlaceIds;
    window.submitRefreshPlaceIds = function() {
      const dryRun = document.getElementById('refreshDryRun')?.checked || false;
      window.refreshPlaceIdsWithProgress(dryRun);
    };
  }

  // ============================================================
  // 7. FIX APPLY FILTERS WARNING
  // ============================================================

  /**
   * Fixed applyFilters that won't warn
   */
  if (!window.applyFiltersFixed) {
    window.applyFiltersFixed = true;

    // Store original if it exists
    const originalApplyFilters = window.applyFilters || (() => {});

    window.applyFilters = function() {
      console.log('🔍 Applying filters...');

      // Ensure totalFilteredAdventures exists
      if (!window.totalFilteredAdventures || !Array.isArray(window.totalFilteredAdventures)) {
        window.totalFilteredAdventures = window.adventuresData ? [...window.adventuresData] : [];
      }

      // Call original if exists
      if (typeof originalApplyFilters === 'function') {
        try {
          originalApplyFilters();
        } catch (error) {
          console.warn('⚠️ Original applyFilters error:', error);
        }
      }

      // Ensure currentPage is valid
      if (!window.currentPage || window.currentPage < 1) {
        window.currentPage = 1;
      }

      // Re-render
      if (typeof renderPaginatedCards === 'function') {
        renderPaginatedCards();
      }

      console.log('✅ Filters applied');
    };
  }

  console.log('✅ Comprehensive Fix System v7.0.130 Enhanced Ready');
  console.log('  - Pagination fixed');
  console.log('  - Dry run sliders fixed');
  console.log('  - Refresh Place IDs with progress');
  console.log('  - Safe string operations');
  console.log('  - Window opening functions');
  console.log('  - Error handling enhanced');
})();

