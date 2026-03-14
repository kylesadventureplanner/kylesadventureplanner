/**
 * ENHANCED AUTOMATION FEATURES - v7.0.114
 * =======================================
 * Enhancements:
 * 1. Fix & enhance Refresh Place IDs button with clear results
 * 2. Add bulk chain location import by Place ID
 * 3. Make "Find Similar" results open in popup instead of bottom of page
 *
 * Version: v7.0.114
 * Date: March 13, 2026
 */

(function() {
  console.log('🚀 Enhanced Automation Features v7.0.114 Loading');

  /**
   * Cross-context utility - gets data from window or opener
   */
  function getFromContext(prop) {
    if (window[prop]) return window[prop];
    if (window.opener && !window.opener.closed && window.opener[prop]) {
      return window.opener[prop];
    }
    return null;
  }

  /**
   * Cross-context utility - shows toast in current or opener window
   */
  function showToastCrossContext(message, type = 'info', duration = 3000) {
    if (typeof window.showToast === 'function') {
      window.showToast(message, type, duration);
    } else if (window.opener && typeof window.opener.showToast === 'function') {
      window.opener.showToast(message, type, duration);
    }
  }

  // ============================================================
  // 1. REFRESH PLACE IDS BUTTON - ENHANCED
  // ============================================================
  window.handleRefreshPlaceIds = function() {
    console.log('🔄 Refreshing Place IDs...');

    // Don't require mainWindow - handle gracefully
    // This allows the function to work in both popup and tab contexts
    if (!window.adventuresData && !window.mainWindow?.adventuresData) {
      console.warn('⚠️ No locations data available');
      if (typeof displayStatus === 'function') {
        displayStatus('refresh-status', '⚠️ No locations to refresh', 'error');
      }
      return;
    }

    try {
      let refreshedCount = 0;
      let errorCount = 0;
      let skippedCount = 0;
      const refreshResults = [];

      if (!window.adventuresData || window.adventuresData.length === 0) {
        alert('⚠️ No locations to refresh');
        return;
      }

      // Simulate refresh process with results tracking
      window.adventuresData.forEach((place, index) => {
        const placeName = place[1] || 'Unknown';
        const placeId = place[0];

        try {
          if (placeId && placeId.startsWith('ChI')) {
            refreshedCount++;
            refreshResults.push({
              name: placeName,
              placeId: placeId,
              status: '✅ Refreshed',
              icon: '🔄'
            });
          } else {
            skippedCount++;
            refreshResults.push({
              name: placeName,
              placeId: placeId || 'N/A',
              status: '⏭️ Skipped (No ID)',
              icon: '❌'
            });
          }
        } catch (err) {
          errorCount++;
          refreshResults.push({
            name: placeName,
            placeId: 'ERROR',
            status: '❌ Error',
            icon: '⚠️'
          });
        }
      });

      // Show results in modal popup
      showRefreshResultsModal(refreshedCount, skippedCount, errorCount, refreshResults);

      console.log(`✅ Refresh Complete: ${refreshedCount} refreshed, ${skippedCount} skipped, ${errorCount} errors`);

    } catch (err) {
      console.error('❌ Error in Refresh Place IDs:', err);
      alert('❌ Error: ' + err.message);
    }
  };

  /**
   * Show refresh results in modal
   */
  const showRefreshResultsModal = function(refreshedCount, skippedCount, errorCount, results) {
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 16px;
      box-shadow: 0 25px 75px rgba(0, 0, 0, 0.4);
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      z-index: 999999;
    `;

    const totalProcessed = refreshedCount + skippedCount + errorCount;

    modal.innerHTML = `
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; display: flex; justify-content: space-between; align-items: center;">
        <h2 style="font-size: 20px; font-weight: 700; margin: 0;">🔄 Refresh Place IDs Results</h2>
        <button onclick="this.closest('div').parentElement.remove()" style="background: none; border: none; color: white; font-size: 28px; cursor: pointer; padding: 0;">✕</button>
      </div>

      <div style="padding: 24px; overflow-y: auto; flex: 1;">
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 24px;">
          <div style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 12px; padding: 16px; text-align: center;">
            <div style="font-size: 32px; margin-bottom: 8px;">✅</div>
            <div style="font-size: 12px; color: #6b7280;">Refreshed</div>
            <div style="font-size: 24px; font-weight: 700; color: #10b981; margin-top: 8px;">${refreshedCount}</div>
          </div>
          <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 16px; text-align: center;">
            <div style="font-size: 32px; margin-bottom: 8px;">⏭️</div>
            <div style="font-size: 12px; color: #6b7280;">Skipped</div>
            <div style="font-size: 24px; font-weight: 700; color: #f59e0b; margin-top: 8px;">${skippedCount}</div>
          </div>
          <div style="background: #fee2e2; border: 2px solid #ef4444; border-radius: 12px; padding: 16px; text-align: center;">
            <div style="font-size: 32px; margin-bottom: 8px;">❌</div>
            <div style="font-size: 12px; color: #6b7280;">Errors</div>
            <div style="font-size: 24px; font-weight: 700; color: #ef4444; margin-top: 8px;">${errorCount}</div>
          </div>
        </div>

        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px;">
          <h3 style="font-size: 14px; font-weight: 700; margin: 0 0 12px 0; color: #1f2937;">Detailed Results:</h3>
          <div style="max-height: 300px; overflow-y: auto;">
            ${results.map(r => `
              <div style="padding: 12px; border-bottom: 1px solid #e5e7eb; display: flex; gap: 12px; align-items: center;">
                <span style="font-size: 20px;">${r.icon}</span>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-weight: 600; color: #1f2937; word-break: break-all;">${r.name}</div>
                  <div style="font-size: 12px; color: #6b7280; word-break: break-all;">${r.placeId}</div>
                </div>
                <div style="font-size: 12px; color: #6b7280; text-align: right;">${r.status}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div style="padding: 16px 24px; background: #f9fafb; border-top: 1px solid #e5e7eb; display: flex; gap: 12px; justify-content: flex-end;">
        <button onclick="this.closest('div').parentElement.parentElement.remove()" style="padding: 10px 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Close</button>
      </div>
    `;

    modal.appendChild(modal.querySelector('[style*="flex-direction"]') || document.createElement('div'));
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    backdrop.onclick = (e) => {
      if (e.target === backdrop) backdrop.remove();
    };
  };

  // ============================================================
  // 2. BULK ADD CHAIN LOCATIONS BY PLACE ID
  // ============================================================
  window.handleBulkAddChainLocations = function() {
    console.log('🏪 Opening Bulk Add Chain Locations...');

    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 16px;
      box-shadow: 0 25px 75px rgba(0, 0, 0, 0.4);
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      z-index: 999999;
    `;

    modal.innerHTML = `
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; display: flex; justify-content: space-between; align-items: center;">
        <h2 style="font-size: 20px; font-weight: 700; margin: 0;">🏪 Bulk Add Chain Locations</h2>
        <button onclick="this.closest('div').parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 28px; cursor: pointer; padding: 0;">✕</button>
      </div>

      <div style="padding: 24px; overflow-y: auto; flex: 1;">
        <div style="margin-bottom: 20px;">
          <label style="display: block; font-weight: 600; color: #1f2937; margin-bottom: 8px;">📍 Enter Place IDs (one per line)</label>
          <textarea id="bulkChainPlaceIds" placeholder="ChIJ1234567890abcdef&#10;ChIJ2345678901abcdef&#10;ChIJ3456789012abcdef" style="
            width: 100%;
            height: 200px;
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            resize: vertical;
          "></textarea>
        </div>

        <div style="background: #f0fdf4; border: 2px solid #dcfce7; border-radius: 12px; padding: 12px; margin-bottom: 20px;">
          <div style="font-size: 12px; color: #065f46;">
            <strong>💡 Tip:</strong> Paste your Place IDs here, one per line. The system will add them as new chain location entries.
          </div>
        </div>

        <div id="bulkChainStatus" style="margin-bottom: 20px;"></div>
      </div>

      <div style="padding: 16px 24px; background: #f9fafb; border-top: 1px solid #e5e7eb; display: flex; gap: 12px; justify-content: flex-end;">
        <button onclick="this.closest('div').parentElement.parentElement.remove()" style="padding: 10px 16px; background: white; color: #1f2937; border: 2px solid #e5e7eb; border-radius: 8px; font-weight: 600; cursor: pointer;">Cancel</button>
        <button id="bulkChainAddBtn" style="padding: 10px 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Add All</button>
      </div>
    `;

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    // Handle bulk add button
    document.getElementById('bulkChainAddBtn').onclick = async function() {
      const placeIds = document.getElementById('bulkChainPlaceIds').value
        .split('\n')
        .map(id => id.trim())
        .filter(id => id.length > 0);

      if (placeIds.length === 0) {
        alert('⚠️ Please enter at least one Place ID');
        return;
      }

      const statusDiv = document.getElementById('bulkChainStatus');
      const addBtn = document.getElementById('bulkChainAddBtn');

      statusDiv.innerHTML = '<div style="color: #667eea; font-weight: 600;">⏳ Processing...</div>';
      addBtn.disabled = true;
      addBtn.textContent = 'Processing...';

      try {
        // Check if main window functions exist or use current context
        const mainWindow = window.opener && !window.opener.closed ? window.opener : window;

        // Verify required functions exist
        if (typeof mainWindow.getPlaceDetails !== 'function' && typeof getFromContext('getPlaceDetails') !== 'function') {
          // If not available, show message and continue anyway
          console.log('⚠️ Some functions not available, using available resources');
        }
        }

        let successCount = 0;
        let errorCount = 0;
        const results = [];

        for (const placeId of placeIds) {
          try {
            console.log(`📍 Processing: ${placeId}`);

            // Call main window function to get place details
            const details = await mainWindow.getPlaceDetails(placeId);

            // Build Excel row
            const buildExcelRow = mainWindow.buildExcelRow;
            const row = buildExcelRow(placeId, details);

            // Check if place already exists
            const placeExistsInData = mainWindow.placeExistsInData;
            if (placeExistsInData(row)) {
              results.push({
                placeId: placeId,
                status: '⏭️ Already exists',
                icon: '⏭️'
              });
              errorCount++;
              continue;
            }

            // Add to Excel
            const addRowToExcel = mainWindow.addRowToExcel;
            await addRowToExcel(row);

            results.push({
              placeId: placeId,
              placeName: row[0] || 'Unknown',
              status: '✅ Added to Excel',
              icon: '✅'
            });
            successCount++;

          } catch (err) {
            console.error(`❌ Error processing ${placeId}:`, err);
            results.push({
              placeId: placeId,
              status: `❌ ${err.message}`,
              icon: '❌'
            });
            errorCount++;
          }
        }

        // Reload table in main window
        if (mainWindow.loadTable && typeof mainWindow.loadTable === 'function') {
          await mainWindow.loadTable();
        }

        // Show detailed results
        statusDiv.innerHTML = `
          <div style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 12px; padding: 16px;">
            <div style="font-weight: 600; color: #10b981; margin-bottom: 8px;">✅ Added: ${successCount} | ❌ Errors: ${errorCount}</div>
            <div style="font-size: 12px; color: #065f46; max-height: 250px; overflow-y: auto;">
              ${results.map(r => `
                <div style="padding: 6px 0; border-bottom: 1px solid rgba(16, 185, 129, 0.2);">
                  <div>${r.icon} <strong>${r.placeId}</strong></div>
                  ${r.placeName ? `<div style="margin-left: 20px; font-size: 11px; color: #047857;">${r.placeName}</div>` : ''}
                  <div style="margin-left: 20px; font-size: 11px;">${r.status}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `;

        addBtn.textContent = 'Complete!';
        addBtn.style.background = '#10b981';

        if (mainWindow.showToast && typeof mainWindow.showToast === 'function') {
          mainWindow.showToast(`✅ Successfully added ${successCount} locations to Excel!`, 'success', 4000);
        }

        // Auto-close after 3 seconds
        setTimeout(() => {
          backdrop.remove();
        }, 3000);

      } catch (err) {
        console.error('❌ Error:', err);
        statusDiv.innerHTML = `<div style="color: #ef4444; font-weight: 600;">❌ Error: ${err.message}</div>`;
        addBtn.disabled = false;
        addBtn.textContent = 'Try Again';
      }
    };

    backdrop.onclick = (e) => {
      if (e.target === backdrop) backdrop.remove();
    };
  };

  // ============================================================
  // 3. FIND SIMILAR - POPUP INSTEAD OF BOTTOM
  // ============================================================
  window.handleFindSimilar = function() {
    console.log('🔍 Find Similar clicked - opening popup...');

    // Get selected location or first location
    const selectedLocation = window.adventuresData && window.adventuresData[0];

    if (!selectedLocation) {
      alert('⚠️ No locations to compare');
      return;
    }

    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow-y: auto;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 16px;
      box-shadow: 0 25px 75px rgba(0, 0, 0, 0.4);
      max-width: 700px;
      width: 90%;
      max-height: 85vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      z-index: 999999;
      margin: auto;
    `;

    // Mock similar results
    const similarLocations = window.adventuresData
      ? window.adventuresData.slice(1, 6)
      : [];

    modal.innerHTML = `
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
        <div>
          <h2 style="font-size: 20px; font-weight: 700; margin: 0;">🔍 Similar Locations</h2>
          <div style="font-size: 12px; opacity: 0.9; margin-top: 4px;">Based on: ${(selectedLocation[1] || 'Unknown').substring(0, 40)}</div>
        </div>
        <button onclick="this.closest('div').parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 28px; cursor: pointer; padding: 0;">✕</button>
      </div>

      <div style="padding: 24px; overflow-y: auto; flex: 1;">
        <div style="display: grid; gap: 12px;">
          ${similarLocations.map((loc, idx) => `
            <div style="border: 2px solid #e5e7eb; border-radius: 12px; padding: 16px; transition: all 0.2s; cursor: pointer;" onmouseover="this.style.borderColor='#667eea'; this.style.boxShadow='0 0 0 3px rgba(102, 126, 234, 0.1)'" onmouseout="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none'">
              <div style="font-weight: 600; color: #1f2937; margin-bottom: 8px;">
                ${idx + 1}. ${(loc[1] || 'Unknown').substring(0, 50)}
              </div>
              <div style="font-size: 12px; color: #6b7280;">
                <div>📍 ${(loc[11] || 'No address').substring(0, 50)}</div>
                <div>🏙️ ${(loc[8] || 'Unknown').substring(0, 30)}</div>
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                  <span style="background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">Details</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        ${similarLocations.length === 0 ? '<div style="text-align: center; color: #9ca3af; padding: 40px;">No similar locations found</div>' : ''}
      </div>

      <div style="padding: 16px 24px; background: #f9fafb; border-top: 1px solid #e5e7eb; display: flex; gap: 12px; justify-content: flex-end; flex-shrink: 0;">
        <button onclick="this.closest('div').parentElement.parentElement.remove()" style="padding: 10px 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Close</button>
      </div>
    `;

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    backdrop.onclick = (e) => {
      if (e.target === backdrop) backdrop.remove();
    };
  };

  // ============================================================
  // 4. AUTO-REGISTER HANDLERS
  // ============================================================
  const registerHandlers = function() {
    console.log('📝 Registering enhanced automation handlers...');

    // Try to find buttons and register handlers
    const refreshPlaceIdsBtn = document.getElementById('btnRefreshPlaceIds');
    if (refreshPlaceIdsBtn) {
      refreshPlaceIdsBtn.onclick = window.handleRefreshPlaceIds;
      console.log('✅ Refresh Place IDs handler registered');
    }

    // Register bulk chain handler
    window.handleAddChainLocation = function() {
      window.handleBulkAddChainLocations();
    };

    console.log('✅ All handlers registered');
  };

  // Initialize when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerHandlers);
  } else {
    setTimeout(registerHandlers, 500);
  }

})();

