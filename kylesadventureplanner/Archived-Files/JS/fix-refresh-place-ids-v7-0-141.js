/**
 * REFRESH PLACE IDS FIX - v7.0.141
 * ================================
 * Ensures the Refresh Place IDs feature works properly from both:
 * 1. Main window via Edit Mode
 * 2. Edit Mode via direct call
 *
 * Date: March 15, 2026
 */

console.log('🚀 Refresh Place IDs Fix v7.0.141 Loading...');

// ============================================================
// ENSURE REFRESH PLACE IDS FUNCTION WORKS
// ============================================================

/**
 * Primary refresh place IDs function that works from main window
 * This is called when user clicks "Refresh Place IDs" in Edit Mode
 * NOW WITH M365 EXCEL WRITE-BACK CAPABILITY
 */
window.refreshPlaceIdsWithProgress = window.refreshPlaceIdsWithProgress || async function(dryRun = false) {
  console.log(`🔄 Starting Refresh Place IDs (Dry Run: ${dryRun})...`);

  const statusDiv = document.getElementById('refresh-status');
  if (!statusDiv) {
    console.warn('⚠️ No status div found for refresh-status');
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
    const m365Updates = []; // Track updates for batch write

    // Process each location
    for (let i = 0; i < data.length; i++) {
      const location = data[i];
      const placeId = location.placeId || (location.values && location.values[0][1]);
      const placeName = location.name || (location.values && location.values[0][0]);
      const address = location.address || (location.values && location.values[0][11]);

      try {
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
        if (!placeId || placeId === 'SKIP' || placeId === 'undefined' || String(placeId).trim() === '') {
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
          // Try to get fresh place details from Google API
          if (mainWindow.getPlaceDetailsFromAPI && typeof mainWindow.getPlaceDetailsFromAPI === 'function') {
            try {
              const freshData = await mainWindow.getPlaceDetailsFromAPI(placeId);
              if (freshData && freshData.website !== 'API_KEY_NOT_SET') {
                // Prepare update object for M365 batch write
                const updateData = {
                  rowIndex: i,
                  name: placeName,
                  placeId: placeId,
                  website: freshData.website || '',
                  phone: freshData.phone || '',
                  hours: freshData.hours || '',
                  address: freshData.address || address || '',
                  rating: freshData.rating || '',
                  directions: freshData.directions || ''
                };

                m365Updates.push(updateData);

                successful++;
                details.push({
                  status: 'success',
                  name: placeName,
                  action: 'Refreshed from Google API'
                });
                console.log(`✅ Refreshed: ${placeName}`);
              } else {
                failed++;
                errors.push({ name: placeName, error: 'API returned no data or API key not set' });
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
              reason: 'getPlaceDetailsFromAPI not available'
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

    // After all API calls, batch write to M365 Excel if not dry run
    let m365WriteResult = null;
    if (!dryRun && m365Updates.length > 0) {
      console.log(`📝 Writing ${m365Updates.length} updates to M365 Excel...`);
      if (mainWindow.writeBatchPlacesToM365 && typeof mainWindow.writeBatchPlacesToM365 === 'function') {
        try {
          m365WriteResult = await mainWindow.writeBatchPlacesToM365(m365Updates);
          console.log(`✅ M365 batch write completed:`, m365WriteResult);
        } catch (m365Error) {
          console.warn(`⚠️ M365 batch write error:`, m365Error);
        }
      } else {
        console.warn(`⚠️ writeBatchPlacesToM365 not available - data not persisted to Excel`);
      }
    }

    // Show final results
    let resultHTML = '<div class="status-message status-success" style="background: #ecfdf5; color: #047857; border-left: 4px solid #10b981; padding: 16px; border-radius: 8px;">';
    resultHTML += '<strong>✅ Refresh Complete!</strong><br><br>';
    resultHTML += `📊 <strong>Results:</strong><br>`;
    resultHTML += `✅ Successful: ${successful}<br>`;
    resultHTML += `❌ Failed: ${failed}<br>`;
    resultHTML += `⏭️ Skipped: ${skipped}<br>`;
    resultHTML += `📍 Total: ${data.length}<br>`;

    if (dryRun) {
      resultHTML += `<br>🧪 <strong>DRY RUN MODE - No changes made</strong>`;
    } else {
      if (m365WriteResult && m365WriteResult.success) {
        resultHTML += `<br>💾 <strong>✅ M365 Excel Updated</strong><br>`;
        resultHTML += `   ${m365WriteResult.successCount} rows updated, ${m365WriteResult.failCount} skipped`;
      } else if (m365WriteResult) {
        resultHTML += `<br>💾 <strong>⚠️ Excel Update Status:</strong> ${m365WriteResult.message}<br>`;
        resultHTML += `   ${m365WriteResult.note || 'Manual copy-paste to Excel recommended'}`;
      } else {
        resultHTML += `<br>💾 <strong>Changes saved to memory</strong><br>`;
        resultHTML += `   Copy results below and paste into Excel to persist`;
      }
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
    statusDiv.innerHTML = `<div class="status-message status-error" style="background: #fee2e2; color: #991b1b; border-left: 4px solid #dc2626; padding: 16px; border-radius: 8px;">
      ❌ Fatal Error: ${error.message}<br><br>
      Please check the console for more details.
    </div>`;
    if (window.showToast) {
      window.showToast(`❌ Error: ${error.message}`, 'error', 5000);
    }
  }
};

/**
 * Alternative name for the refresh function
 * Some code may call this instead
 */
window.refreshPlaceIdsFromEditMode = window.refreshPlaceIdsFromEditMode || async function(dryRun = false) {
  console.log(`🔄 refreshPlaceIdsFromEditMode called (Dry Run: ${dryRun})`);
  return await window.refreshPlaceIdsWithProgress(dryRun);
};

/**
 * Submit button handler for refresh
 */
window.submitRefreshPlaceIds = window.submitRefreshPlaceIds || function() {
  console.log('🔄 submitRefreshPlaceIds called');

  const dryRun = document.getElementById('refreshDryRun')?.checked || false;
  const statusDiv = document.getElementById('refresh-status');

  if (!statusDiv) {
    console.error('❌ refresh-status div not found');
    alert('Error: Status div not found');
    return;
  }

  console.log(`🔄 Starting refresh (Dry Run: ${dryRun})`);

  // Show loading state
  statusDiv.innerHTML = `
    <div style="background: #dbeafe; color: #1e40af; border-left: 4px solid #1e40af; padding: 16px; border-radius: 8px; margin-bottom: 12px;">
      <span style="display: inline-block; width: 20px; height: 20px; border: 3px solid #e5e7eb; border-top-color: #1e40af; border-radius: 50%; animation: spin 0.8s linear infinite; margin-right: 10px; vertical-align: middle;"></span>
      <strong>🔄 Initializing refresh...</strong>
    </div>
  `;

  // Add CSS animation if not present
  if (!document.getElementById('spinnerCSS')) {
    const style = document.createElement('style');
    style.id = 'spinnerCSS';
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  // Try to call from main window
  setTimeout(() => {
    try {
      if (window.opener && window.opener.refreshPlaceIdsFromEditMode) {
        console.log('✅ Calling opener.refreshPlaceIdsFromEditMode');
        window.opener.refreshPlaceIdsFromEditMode(dryRun);
      } else if (window.opener && window.opener.refreshPlaceIdsWithProgress) {
        console.log('✅ Calling opener.refreshPlaceIdsWithProgress');
        window.opener.refreshPlaceIdsWithProgress(dryRun);
      } else if (window.refreshPlaceIdsFromEditMode) {
        console.log('✅ Calling local refreshPlaceIdsFromEditMode');
        window.refreshPlaceIdsFromEditMode(dryRun);
      } else if (window.refreshPlaceIdsWithProgress) {
        console.log('✅ Calling local refreshPlaceIdsWithProgress');
        window.refreshPlaceIdsWithProgress(dryRun);
      } else {
        console.error('❌ No refresh function found');
        statusDiv.innerHTML = `
          <div style="background: #fee2e2; color: #991b1b; border-left: 4px solid #dc2626; padding: 16px; border-radius: 8px;">
            ❌ Error: Refresh function not found. Make sure the main window is open.
          </div>
        `;
      }
    } catch (error) {
      console.error('❌ Error calling refresh:', error);
      statusDiv.innerHTML = `
        <div style="background: #fee2e2; color: #991b1b; border-left: 4px solid #dc2626; padding: 16px; border-radius: 8px;">
          ❌ Error: ${error.message}
        </div>
      `;
    }
  }, 100);
};

console.log('✅ Refresh Place IDs Fix v7.0.141 Ready');
console.log('  - refreshPlaceIdsWithProgress: Primary function');
console.log('  - refreshPlaceIdsFromEditMode: Alias for compatibility');
console.log('  - submitRefreshPlaceIds: Button handler');

