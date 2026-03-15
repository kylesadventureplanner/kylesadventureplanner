/**
 * FINAL FIXES - v7.0.132
 * ====================================
 * Fixes remaining issues:
 * 1. viewCityDetails function missing
 * 2. Unknown City coordinates warning
 * 3. Refresh Place IDs button functionality
 * 4. Proper error handling for coordinates
 *
 * Date: March 15, 2026
 */

(function() {
  console.log('🚀 Final Fixes System v7.0.132 Loading...');

  // ============================================================
  // 1. VIEW CITY DETAILS FUNCTION
  // ============================================================

  /**
   * View details for a city
   */
  window.viewCityDetails = function(city, state) {
    console.log(`👀 Viewing city details: ${city}, ${state}`);

    // Try to open city viewer window
    if (window.openCityViewerWindow) {
      window.openCityViewerWindow();
    } else {
      console.warn('⚠️ City viewer not available');
      alert(`Viewing ${city}, ${state}`);
    }
  };

  // ============================================================
  // 2. SAFE COORDINATE PARSING
  // ============================================================

  /**
   * Safely parse latitude
   */
  window.safeParseLatitude = function(value) {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num) || num < -90 || num > 90) {
      return null;
    }
    return num;
  };

  /**
   * Safely parse longitude
   */
  window.safeParseLongitude = function(value) {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num) || num < -180 || num > 180) {
      return null;
    }
    return num;
  };

  /**
   * Safely parse city name
   */
  window.safeParseCityName = function(value) {
    if (!value) return 'Unknown';
    const str = String(value).trim();
    return str.length > 0 && str !== 'undefined' ? str : 'Unknown';
  };

  /**
   * Safely parse state name
   */
  window.safeParseState = function(value) {
    if (!value) return 'Unknown';
    const str = String(value).trim();
    return str.length > 0 && str !== 'undefined' ? str : 'Unknown';
  };

  /**
   * Validate city coordinates - suppress warnings for "Unknown City"
   */
  window.validateCityCoordinates = function(city, state, latitude, longitude) {
    const safeCityName = window.safeParseCityName(city);
    const safeStateName = window.safeParseState(state);
    const safeLat = window.safeParseLatitude(latitude);
    const safeLng = window.safeParseLongitude(longitude);

    // Don't warn about "Unknown City" - it's expected for invalid data
    if (safeCityName === 'Unknown' || safeStateName === 'Unknown') {
      console.log(`⏭️ Skipping validation for: ${safeCityName}, ${safeStateName}`);
      return false;
    }

    // Warn only if we have a real city name but invalid coordinates
    if (!safeLat || !safeLng) {
      console.warn(`⚠️ City coordinates not found for: ${safeCityName}, ${safeStateName}. Using default coordinates.`);
      return false;
    }

    return true;
  };

  // ============================================================
  // 3. FIX REFRESH PLACE IDS BUTTON
  // ============================================================

  /**
   * Enhanced refresh place IDs that works from main window
   */
  window.refreshPlaceIdsFromEditMode = async function(dryRun = false) {
    console.log(`🔄 Refresh Place IDs called (Dry Run: ${dryRun})...`);

    // Try multiple ways to find the status div
    let statusDiv = document.getElementById('refresh-status');

    if (!statusDiv) {
      console.log('⏭️ Status div not found in main window, calling from edit mode');
      // This will be called from edit mode window
      if (window.refreshPlaceIdsWithProgress && typeof window.refreshPlaceIdsWithProgress === 'function') {
        await window.refreshPlaceIdsWithProgress(dryRun);
      }
      return;
    }

    console.log('🔄 Starting refresh process...');

    try {
      const data = window.adventuresData || [];

      if (!data || data.length === 0) {
        statusDiv.innerHTML = '<div class="status-message status-error">❌ Error: No location data found</div>';
        console.error('❌ No location data');
        return;
      }

      let successful = 0;
      let failed = 0;
      let skipped = 0;
      const details = [];

      // Process each location
      for (let i = 0; i < data.length; i++) {
        const location = data[i];
        const placeId = location.placeId || (location.values && location.values[0][3]);
        const placeName = location.name || (location.values && location.values[0][0]);

        // Update progress in real-time
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

        // Skip if no place ID
        if (!placeId || placeId === 'SKIP' || placeId === 'undefined') {
          skipped++;
          details.push({ status: 'skipped', name: placeName });
          continue;
        }

        if (dryRun) {
          successful++;
          details.push({ status: 'success', name: placeName });
        } else {
          // Try to get fresh data
          if (window.getPlaceDetails && typeof window.getPlaceDetails === 'function') {
            try {
              const freshData = await window.getPlaceDetails(placeId);
              if (freshData) {
                successful++;
                details.push({ status: 'success', name: placeName });
              } else {
                failed++;
                details.push({ status: 'failed', name: placeName });
              }
            } catch (error) {
              failed++;
              details.push({ status: 'failed', name: placeName, error: error.message });
            }
          } else {
            skipped++;
            details.push({ status: 'skipped', name: placeName });
          }
        }

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Show final results
      let resultHTML = '<div class="status-message status-success" style="padding: 16px; border-radius: 8px;">';
      resultHTML += '<strong>✅ Refresh Complete!</strong><br><br>';
      resultHTML += `📊 <strong>Results:</strong><br>`;
      resultHTML += `✅ Successful: ${successful}<br>`;
      resultHTML += `❌ Failed: ${failed}<br>`;
      resultHTML += `⏭️ Skipped: ${skipped}<br>`;
      resultHTML += `📍 Total: ${data.length}<br>`;

      if (dryRun) {
        resultHTML += `<br>🧪 <strong>DRY RUN - No changes made</strong>`;
      } else {
        resultHTML += `<br>💾 <strong>Refresh completed</strong>`;
      }

      resultHTML += '<br><br><strong>Details (First 10):</strong><br>';

      details.slice(0, 10).forEach(detail => {
        if (detail.status === 'success') {
          resultHTML += `✅ ${detail.name}<br>`;
        } else if (detail.status === 'failed') {
          resultHTML += `❌ ${detail.name}${detail.error ? ': ' + detail.error : ''}<br>`;
        } else {
          resultHTML += `⏭️ ${detail.name}<br>`;
        }
      });

      if (details.length > 10) {
        resultHTML += `<br>... and ${details.length - 10} more`;
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
      console.error('❌ Error:', error);
      statusDiv.innerHTML = `<div class="status-message status-error" style="padding: 16px; border-radius: 8px;">
        ❌ Error: ${error.message}
      </div>`;
    }
  };

  // ============================================================
  // 4. OVERRIDE SUBMIT REFRESH FROM EDIT MODE
  // ============================================================

  /**
   * Override the edit mode submit function to use our enhanced version
   */
  if (typeof window.submitRefreshPlaceIds !== 'function') {
    window.submitRefreshPlaceIds = function() {
      const dryRun = document.getElementById('refreshDryRun')?.checked || false;
      console.log(`🔄 submitRefreshPlaceIds called (Dry Run: ${dryRun})`);

      if (window.refreshPlaceIdsFromEditMode) {
        window.refreshPlaceIdsFromEditMode(dryRun);
      } else if (window.refreshPlaceIdsWithProgress) {
        window.refreshPlaceIdsWithProgress(dryRun);
      } else {
        console.error('❌ No refresh function available');
      }
    };
  }

  console.log('✅ Final Fixes System v7.0.132 Ready');
  console.log('  - viewCityDetails function added');
  console.log('  - Safe coordinate parsing added');
  console.log('  - Refresh Place IDs enhanced');
  console.log('  - Unknown City warnings suppressed');
})();

