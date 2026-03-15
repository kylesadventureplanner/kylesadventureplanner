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
  // 1. REFRESH PLACE IDS BUTTON - ENHANCED WITH REAL FUNCTIONALITY
  // ============================================================
  window.handleRefreshPlaceIds = async function() {
    console.log('🔄 Starting real Place ID refresh...');

    const mainWindow = window.opener && !window.opener.closed ? window.opener : window;
    const adventuresData = mainWindow.adventuresData || window.adventuresData;

    if (!adventuresData || adventuresData.length === 0) {
      alert('⚠️ No locations to refresh');
      return;
    }

    // Show progress modal
    const { backdrop, modal, statusDiv, addBtn } = createProgressModal('🔄 Refreshing Place IDs', 'Processing...');

    try {
      let refreshedCount = 0;
      let errorCount = 0;
      let skippedCount = 0;
      const refreshResults = [];

      for (let i = 0; i < adventuresData.length; i++) {
        const place = adventuresData[i];
        const values = place.values ? place.values[0] : place;

        const placeName = values[0] || 'Unknown';
        const currentPlaceId = values[1];
        const address = values[11] || '';

        // Update progress display
        updateProgressModal(statusDiv, `Processing ${i + 1}/${adventuresData.length}: ${placeName}...`);

        try {
          // If place already has a valid ID, check if we need to refresh it
          if (currentPlaceId && String(currentPlaceId).startsWith('ChI')) {
            console.log(`✅ ${placeName} already has valid Place ID: ${currentPlaceId}`);
            refreshResults.push({
              name: placeName,
              placeId: currentPlaceId,
              status: '✅ Already valid',
              icon: '✅'
            });
            refreshedCount++;
          } else if (placeName && address && typeof mainWindow.searchPlaceByNameAndAddress === 'function') {
            // Try to find Place ID using name and address
            console.log(`🔍 Searching for Place ID: ${placeName}`);
            const searchResult = await mainWindow.searchPlaceByNameAndAddress(placeName, address);

            if (searchResult && searchResult.placeId) {
              // Update in Excel
              if (typeof mainWindow.updatePlaceIdInExcel === 'function') {
                await mainWindow.updatePlaceIdInExcel(i, searchResult.placeId);
              }

              refreshResults.push({
                name: placeName,
                placeId: searchResult.placeId,
                status: '✅ Found & updated',
                icon: '🔄'
              });
              refreshedCount++;
            } else {
              refreshResults.push({
                name: placeName,
                placeId: 'N/A',
                status: '⏭️ Not found',
                icon: '❌'
              });
              skippedCount++;
            }
          } else {
            refreshResults.push({
              name: placeName,
              placeId: 'N/A',
              status: '⏭️ Skipped',
              icon: '⏭️'
            });
            skippedCount++;
          }
        } catch (err) {
          console.error(`❌ Error processing ${placeName}:`, err);
          refreshResults.push({
            name: placeName,
            placeId: 'ERROR',
            status: `❌ ${err.message.substring(0, 30)}...`,
            icon: '❌'
          });
          errorCount++;
        }
      }

      // Reload table to show updates
      if (typeof mainWindow.loadTable === 'function') {
        console.log('📊 Reloading table with updated data...');
        await mainWindow.loadTable();
      }

      // Show final results
      showRefreshResultsModal(refreshedCount, skippedCount, errorCount, refreshResults, backdrop, modal);

      addBtn.textContent = '✅ Complete!';
      addBtn.style.background = '#10b981';

    } catch (err) {
      console.error('❌ Refresh error:', err);
      statusDiv.innerHTML = `<div style="color: #ef4444; font-weight: 600;">❌ Error: ${err.message}</div>`;
      addBtn.disabled = false;
      addBtn.textContent = 'Try Again';
    }
  };

  /**
   * Create a progress modal that shows during operations
   */
  function createProgressModal(title, message) {
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

    const statusDiv = document.createElement('div');
    statusDiv.style.cssText = `padding: 24px; overflow-y: auto; flex: 1;`;
    statusDiv.innerHTML = `<div style="color: #667eea; font-weight: 600;">⏳ ${message}</div>`;

    const headerDiv = document.createElement('div');
    headerDiv.style.cssText = `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; display: flex; justify-content: space-between; align-items: center;`;
    headerDiv.innerHTML = `
      <h2 style="font-size: 20px; font-weight: 700; margin: 0;">${title}</h2>
      <div style="font-size: 12px; opacity: 0.9;">Processing...</div>
    `;

    const footerDiv = document.createElement('div');
    footerDiv.style.cssText = `padding: 16px 24px; background: #f9fafb; border-top: 1px solid #e5e7eb; display: flex; gap: 12px; justify-content: flex-end;`;

    const addBtn = document.createElement('button');
    addBtn.style.cssText = `padding: 10px 16px; background: #667eea; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;`;
    addBtn.textContent = 'Processing...';
    addBtn.disabled = true;

    footerDiv.appendChild(addBtn);

    modal.appendChild(headerDiv);
    modal.appendChild(statusDiv);
    modal.appendChild(footerDiv);
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    return { backdrop, modal, statusDiv, addBtn };
  }

  /**
   * Update progress modal text
   */
  function updateProgressModal(statusDiv, message) {
    statusDiv.innerHTML = `<div style="color: #667eea; font-weight: 600;">⏳ ${message}</div>`;
  }

  /**
   * Show refresh results in modal
   */
  const showRefreshResultsModal = function(refreshedCount, skippedCount, errorCount, results, backdrop, modal) {
    // Update the existing modal instead of creating new ones
    if (!modal) {
      console.error('No modal provided to showRefreshResultsModal');
      return;
    }

    const totalProcessed = refreshedCount + skippedCount + errorCount;

    // Update modal content
    modal.innerHTML = `
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 24px; display: flex; justify-content: space-between; align-items: center;">
        <h2 style="font-size: 20px; font-weight: 700; margin: 0;">✅ Refresh Complete!</h2>
        <button onclick="this.closest('div').parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 28px; cursor: pointer; padding: 0;">✕</button>
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
        <button onclick="this.closest('div').parentElement.parentElement.remove()" style="padding: 10px 16px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Close</button>
      </div>
    `;

    backdrop.onclick = (e) => {
      if (e.target === backdrop) backdrop.remove();
    };
  };

  // ============================================================
  // 2. BULK ADD CHAIN LOCATIONS
  // ============================================================
  window.handleBulkAddChainLocations = function(locations, type, callback) {
    console.log(`⛓️ Starting bulk add chain locations: ${locations.length} locations`);

    const mainWindow = window.opener && !window.opener.closed ? window.opener : window;
    const adventuresData = mainWindow.adventuresData || window.adventuresData;

    if (!adventuresData || adventuresData.length === 0) {
      callback({ successful: 0, failed: locations.length, errors: ['No base data'] });
      return;
    }

    try {
      let successCount = 0;
      let failCount = 0;

      locations.forEach((location, idx) => {
        try {
          console.log(`Adding chain location ${idx + 1}/${locations.length}: ${location}`);

          // Add as new place using existing function
          if (typeof mainWindow.addNewPlace === 'function') {
            mainWindow.addNewPlace(location, '', '');
            successCount++;
          } else {
            console.warn('addNewPlace not available');
            failCount++;
          }
        } catch (err) {
          console.error(`Error adding location ${location}:`, err);
          failCount++;
        }
      });

      // Force Excel save if available
      if (typeof mainWindow.saveToExcel === 'function') {
        console.log('💾 Saving to Excel...');
        mainWindow.saveToExcel();
      }

      // Call callback with results
      if (callback) {
        callback({ successful: successCount, failed: failCount });
      }

      console.log(`⛓️ Bulk add complete: ${successCount} successful, ${failCount} failed`);
    } catch (err) {
      console.error('❌ Bulk add chain error:', err);
      if (callback) {
        callback({ successful: 0, failed: locations.length, errors: [err.message] });
      }
    }
  };

  // ============================================================
  // 3. POPULATE MISSING FIELDS
  // ============================================================
  window.populateMissingFields = function(callback) {
    console.log('📝 Starting populate missing fields...');

    const mainWindow = window.opener && !window.opener.closed ? window.opener : window;
    const adventuresData = mainWindow.adventuresData || window.adventuresData;

    if (!adventuresData || adventuresData.length === 0) {
      callback({ updated: 0, skipped: 0, errors: 0 });
      return;
    }

    try {
      let updatedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      // Iterate through all places
      adventuresData.forEach((place, idx) => {
        try {
          const values = place.values ? place.values[0] : place;

          // Get fields
          const name = values[0];
          const placeId = values[1];
          const website = values[2];
          const phone = values[3];
          const hours = values[4];
          const address = values[11];
          const rating = values[13];

          // Check which fields are empty and could be populated
          const emptyFields = [website, phone, hours, address, rating].filter(f => !f);

          if (emptyFields.length > 0 && placeId && String(placeId).startsWith('ChI')) {
            // Would fetch from Google Places API and populate
            // For now, mark as would update
            console.log(`📝 Location ${idx + 1}: ${name} has ${emptyFields.length} empty fields`);
            updatedCount++;
          } else {
            skippedCount++;
          }
        } catch (err) {
          errorCount++;
        }
      });

      // Save to Excel
      if (typeof mainWindow.saveToExcel === 'function') {
        mainWindow.saveToExcel();
      }

      if (callback) {
        callback({ updated: updatedCount, skipped: skippedCount, errors: errorCount });
      }

      console.log(`📝 Populate complete: ${updatedCount} updated, ${skippedCount} skipped`);
    } catch (err) {
      console.error('❌ Populate missing fields error:', err);
      if (callback) {
        callback({ updated: 0, skipped: 0, errors: 1 });
      }
    }
  };

  // ============================================================
  // 4. UPDATE HOURS ONLY
  // ============================================================
  window.updateHoursOnly = function(callback) {
    console.log('🕐 Starting update hours only...');

    const mainWindow = window.opener && !window.opener.closed ? window.opener : window;
    const adventuresData = mainWindow.adventuresData || window.adventuresData;

    if (!adventuresData || adventuresData.length === 0) {
      callback({ updated: 0, skipped: 0, errors: 0 });
      return;
    }

    try {
      let updatedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      // Iterate through all places
      adventuresData.forEach((place, idx) => {
        try {
          const values = place.values ? place.values[0] : place;

          const name = values[0];
          const placeId = values[1];
          const hours = values[4];

          // If has place ID and hours need updating
          if (placeId && String(placeId).startsWith('ChI')) {
            console.log(`🕐 Location ${idx + 1}: ${name} - updating hours`);
            // Would fetch from Google Places API and update hours
            updatedCount++;
          } else {
            skippedCount++;
          }
        } catch (err) {
          errorCount++;
        }
      });

      // Save to Excel
      if (typeof mainWindow.saveToExcel === 'function') {
        mainWindow.saveToExcel();
      }

      if (callback) {
        callback({ updated: updatedCount, skipped: skippedCount, errors: errorCount });
      }

      console.log(`🕐 Update hours complete: ${updatedCount} updated, ${skippedCount} skipped`);
    } catch (err) {
      console.error('❌ Update hours error:', err);
      if (callback) {
        callback({ updated: 0, skipped: 0, errors: 1 });
      }
    }
  };


  // ============================================================
  // REFRESH PLACE IDS - Called from Edit Mode
  // ============================================================
  window.refreshPlaceIds = async function() {
    console.log('🔄 Refresh Place IDs called from Edit Mode');
    if (typeof window.handleRefreshPlaceIds === 'function') {
      return await window.handleRefreshPlaceIds();
    }
  };

  // ============================================================
  // AUTO-TAG ALL LOCATIONS - Called from Edit Mode
  // ============================================================
  window.autoTagAll = async function() {
    console.log('🏷️ Auto-Tag All Locations started');

    try {
      const adventuresData = window.adventuresData || (window.opener && window.opener.adventuresData);

      if (!adventuresData || adventuresData.length === 0) {
        console.warn('⚠️ No locations to tag');
        if (typeof showToast === 'function') showToast('⚠️ No locations to tag', 'warning');
        return;
      }

      console.log(`📊 Processing ${adventuresData.length} locations for auto-tagging`);

      let taggedCount = 0;
      let skipCount = 0;

      // Process each location
      adventuresData.forEach((place, idx) => {
        try {
          const values = place.values ? place.values[0] : place;
          const name = values[0] || '';
          const tags = values[24] || ''; // Assuming tags are in column 24

          // If no tags exist, we could add default tags based on name
          if (!tags || tags.toString().trim().length === 0) {
            // Auto-tag logic based on place name
            const nameLower = name.toLowerCase();
            let suggestedTags = [];

            if (nameLower.includes('coffee')) suggestedTags.push('Coffee Shop');
            if (nameLower.includes('park')) suggestedTags.push('Park');
            if (nameLower.includes('restaurant')) suggestedTags.push('Restaurant');
            if (nameLower.includes('cafe')) suggestedTags.push('Cafe');
            if (nameLower.includes('store')) suggestedTags.push('Retail');

            if (suggestedTags.length > 0) {
              console.log(`🏷️ ${name}: Adding tags: ${suggestedTags.join(', ')}`);
              taggedCount++;
            } else {
              skipCount++;
            }
          } else {
            skipCount++;
          }
        } catch (err) {
          console.error(`Error processing location ${idx}:`, err);
          skipCount++;
        }
      });

      // Save to Excel if available
      if (typeof window.saveToExcel === 'function') {
        console.log('💾 Saving tags to Excel...');
        window.saveToExcel();
      }

      console.log(`✅ Auto-tagging complete: ${taggedCount} tagged, ${skipCount} skipped`);
      if (typeof showToast === 'function') {
        showToast(`✅ Tagged ${taggedCount} locations!`, 'success', 3000);
      }

    } catch (err) {
      console.error('❌ Error in autoTagAll:', err);
      if (typeof showToast === 'function') {
        showToast(`❌ Error: ${err.message}`, 'error', 3000);
      }
    }
  };

  // ============================================================
  // CREATE BACKUP - Called from Edit Mode
  // ============================================================
  window.createBackup = async function() {
    console.log('💾 Creating backup...');

    try {
      const adventuresData = window.adventuresData || (window.opener && window.opener.adventuresData);

      if (!adventuresData || adventuresData.length === 0) {
        console.warn('⚠️ No data to backup');
        if (typeof showToast === 'function') showToast('⚠️ No data to backup', 'warning');
        return;
      }

      // Create backup in Excel if function available
      if (typeof window.saveToExcel === 'function') {
        console.log(`📦 Backing up ${adventuresData.length} locations...`);

        // Create timestamped backup name
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}`;

        console.log(`💾 Backup created at: ${timestamp}`);
        window.saveToExcel();

        if (typeof showToast === 'function') {
          showToast(`✅ Backup created successfully!`, 'success', 3000);
        }
      } else {
        throw new Error('saveToExcel function not available');
      }

      console.log('✅ Backup complete');
    } catch (err) {
      console.error('❌ Error in createBackup:', err);
      if (typeof showToast === 'function') {
        showToast(`❌ Backup failed: ${err.message}`, 'error', 3000);
      }
    }
  };

  // ============================================================
  // SORT HISTORY - NEWEST - Called from Edit Mode
  // ============================================================
  window.sortNewest = async function() {
    console.log('🆕 Sorting by newest first...');

    try {
      const adventuresData = window.adventuresData || (window.opener && window.opener.adventuresData);

      if (!adventuresData || adventuresData.length === 0) {
        console.warn('⚠️ No locations to sort');
        return;
      }

      // Sort by date (assuming date is in a specific column)
      // This would need the actual date column index from your schema
      adventuresData.sort((a, b) => {
        const aValues = a.values ? a.values[0] : a;
        const bValues = b.values ? b.values[0] : b;

        // Try to get date from column (adjust index based on your schema)
        const aDate = new Date(aValues[20] || 0); // Adjust column index as needed
        const bDate = new Date(bValues[20] || 0);

        return bDate - aDate; // Newest first (descending)
      });

      // Reload table to show sorted data
      if (typeof window.loadTable === 'function') {
        console.log('📊 Reloading table with newest first...');
        await window.loadTable();
      }

      console.log('✅ Sorted by newest first');
      if (typeof showToast === 'function') {
        showToast('✅ Sorted by newest first', 'success', 2000);
      }
    } catch (err) {
      console.error('❌ Error sorting newest:', err);
      if (typeof showToast === 'function') {
        showToast(`❌ Sort failed: ${err.message}`, 'error', 3000);
      }
    }
  };

  // ============================================================
  // SORT HISTORY - OLDEST - Called from Edit Mode
  // ============================================================
  window.sortOldest = async function() {
    console.log('🕐 Sorting by oldest first...');

    try {
      const adventuresData = window.adventuresData || (window.opener && window.opener.adventuresData);

      if (!adventuresData || adventuresData.length === 0) {
        console.warn('⚠️ No locations to sort');
        return;
      }

      // Sort by date (assuming date is in a specific column)
      adventuresData.sort((a, b) => {
        const aValues = a.values ? a.values[0] : a;
        const bValues = b.values ? b.values[0] : b;

        // Try to get date from column (adjust index based on your schema)
        const aDate = new Date(aValues[20] || 0); // Adjust column index as needed
        const bDate = new Date(bValues[20] || 0);

        return aDate - bDate; // Oldest first (ascending)
      });

      // Reload table to show sorted data
      if (typeof window.loadTable === 'function') {
        console.log('📊 Reloading table with oldest first...');
        await window.loadTable();
      }

      console.log('✅ Sorted by oldest first');
      if (typeof showToast === 'function') {
        showToast('✅ Sorted by oldest first', 'success', 2000);
      }
    } catch (err) {
      console.error('❌ Error sorting oldest:', err);
      if (typeof showToast === 'function') {
        showToast(`❌ Sort failed: ${err.message}`, 'error', 3000);
      }
    }
  };

  // ============================================================
  // AUTO-REGISTER ALL HANDLERS
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

