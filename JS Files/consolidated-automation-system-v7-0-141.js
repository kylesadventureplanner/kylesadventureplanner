/**
 * CONSOLIDATED AUTOMATION FEATURES SYSTEM v7.0.141
 * =================================================
 *
 * A unified, comprehensive automation system that consolidates all automation-related
 * functionality from multiple files into a single, maintainable module.
 *
 * INCLUDES:
 * - Enhanced Automation Features (v2)
 * - Refresh Place IDs with Progress
 * - Result Modal System (Legacy)
 * - Batch Processing Integration
 * - Keyboard Shortcuts
 * - Recent Places Tracking
 * - Multiple Input Methods
 *
 * Version: 7.0.141
 * Date: March 15, 2026
 * Created: Consolidated from 4 separate automation files
 */

console.log('🤖 Consolidated Automation Features System v7.0.141 Loading...');

// ============================================================
// SECTION 1: ENHANCED AUTOMATION FEATURES
// ============================================================

class EnhancedAutomationFeatures {
  constructor() {
    this.dryRunStates = {
      addSingle: false,
      bulkAdd: false,
      bulkChain: false,
      refreshPlaceIds: false,
      populateMissing: false,
      updateHours: false,
      autoTag: false
    };
    this.init();
  }

  /**
   * Initialize features
   */
  init() {
    console.log('✅ Enhanced Automation Features initialized');
  }

  /**
   * Create dry run toggle UI
   */
  createDryRunToggle(featureName, initialState = false) {
    const container = document.createElement('div');
    container.className = 'dry-run-toggle';
    if (initialState) {
      container.classList.add('on');
    }
    container.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f0f4ff;
      border-radius: 8px;
      border: 1px solid #60a5fa;
      margin-bottom: 12px;
      cursor: pointer;
      user-select: none;
    `;

    // Create label with text
    const label = document.createElement('label');
    label.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #1e40af;
      cursor: pointer;
      margin: 0;
      user-select: none;
    `;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = initialState;
    checkbox.className = `dry-run-toggle-${featureName}`;
    checkbox.style.cssText = `
      width: 18px;
      height: 18px;
      cursor: pointer;
    `;

    const labelText = document.createTextNode('🧪 Dry Run (Preview Changes)');
    label.appendChild(checkbox);
    label.appendChild(labelText);

    // Create custom switch for better UX
    const switchElement = document.createElement('div');
    switchElement.className = 'dry-run-switch';
    switchElement.style.cssText = `
      width: 32px;
      height: 18px;
      border-radius: 999px;
      background: #e5e7eb;
      position: relative;
      transition: background 0.2s;
      cursor: pointer;
      flex-shrink: 0;
    `;

    const switchThumb = document.createElement('div');
    switchThumb.className = 'dry-run-switch-thumb';
    switchThumb.style.cssText = `
      width: 14px;
      height: 14px;
      border-radius: 999px;
      background: white;
      position: absolute;
      top: 2px;
      left: 2px;
      transition: transform 0.2s;
      box-shadow: 0 1px 2px rgba(0,0,0,0.2);
      pointer-events: none;
    `;

    switchElement.appendChild(switchThumb);

    // Toggle function
    const toggle = () => {
      checkbox.checked = !checkbox.checked;
      container.classList.toggle('on');

      // Update switch colors
      if (checkbox.checked) {
        switchElement.style.background = '#60a5fa';
      } else {
        switchElement.style.background = '#e5e7eb';
      }

      // Trigger change event
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    };

    // Add click handlers to all clickable areas
    container.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    });

    // Prevent double-toggle on checkbox click
    checkbox.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Add to label
    label.appendChild(switchElement);
    container.appendChild(label);

    return { container, checkbox };
  }

  /**
   * Validate and parse place input
   */
  validatePlaceInput(input, inputType) {
    const trimmed = input.trim();

    if (!trimmed) {
      return { isValid: false, error: 'Input cannot be empty' };
    }

    switch (inputType) {
      case 'placeName':
        return {
          isValid: true,
          type: 'placeName',
          value: trimmed,
          description: `Place: ${trimmed}`
        };

      case 'placeId':
        if (!trimmed.startsWith('ChIJ')) {
          return { isValid: false, error: 'Invalid Place ID (must start with ChIJ)' };
        }
        return {
          isValid: true,
          type: 'placeId',
          value: trimmed,
          description: `Place ID: ${trimmed.substring(0, 20)}...`
        };

      case 'website':
        try {
          new URL(trimmed);
          return {
            isValid: true,
            type: 'website',
            value: trimmed,
            description: `Website: ${trimmed}`
          };
        } catch {
          return { isValid: false, error: 'Invalid website URL' };
        }

      case 'placeUrl':
        if (!trimmed.includes('google.com/maps') && !trimmed.includes('maps.google.com')) {
          return { isValid: false, error: 'Not a valid Google Maps URL' };
        }
        return {
          isValid: true,
          type: 'placeUrl',
          value: trimmed,
          description: `Google Maps URL`
        };

      case 'address':
        return {
          isValid: true,
          type: 'address',
          value: trimmed,
          description: `Address: ${trimmed}`
        };

      case 'placeNameCity':
        const parts = trimmed.split(',');
        if (parts.length < 2) {
          return { isValid: false, error: 'Format: Place Name, City (e.g., Starbucks, Denver)' };
        }
        return {
          isValid: true,
          type: 'placeNameCity',
          value: trimmed,
          description: `${trimmed}`
        };

      default:
        return { isValid: false, error: `Unknown input type: ${inputType}` };
    }
  }

  /**
   * Add single place with multiple input methods
   */
  async addSinglePlace(input, inputType, dryRun = false) {
    const validation = this.validatePlaceInput(input, inputType);

    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    console.log(`${dryRun ? '🧪 DRY RUN' : '➕'} Adding place: ${validation.description}`);

    if (!dryRun) {
      try {
        const mainWindow = window.opener && !window.opener.closed ? window.opener : window;

        if (typeof mainWindow.getPlaceDetails === 'function') {
          const details = await mainWindow.getPlaceDetails(input);

          if (typeof mainWindow.buildExcelRow === 'function') {
            const row = mainWindow.buildExcelRow(input, details);

            if (typeof mainWindow.addRowToExcel === 'function') {
              await mainWindow.addRowToExcel(row);
              return {
                success: true,
                message: `✅ Added: ${row[0] || 'Place'}`,
                placeName: row[0] || 'Place'
              };
            } else {
              throw new Error('addRowToExcel function not available');
            }
          } else {
            throw new Error('buildExcelRow function not available');
          }
        } else {
          throw new Error('getPlaceDetails function not available');
        }
      } catch (error) {
        console.error('❌ Error adding place:', error);
        return { success: false, error: error.message };
      }
    } else {
      return { success: true, isDryRun: true, message: '🧪 [DRY RUN] Would add place' };
    }
  }

  /**
   * Get dry run state for feature
   */
  getDryRunState(feature) {
    return this.dryRunStates[feature] || false;
  }

  /**
   * Set dry run state for feature
   */
  setDryRunState(feature, state) {
    this.dryRunStates[feature] = state;
  }

  /**
   * Toggle dry run state for feature
   */
  toggleDryRunState(feature) {
    this.dryRunStates[feature] = !this.dryRunStates[feature];
    return this.dryRunStates[feature];
  }

  /**
   * Refresh Place IDs - callable from edit mode
   */
  async refreshPlaceIds(dryRun = false) {
    console.log(`🔄 Enhanced Automation: Refreshing Place IDs (Dry Run: ${dryRun})`);
    if (typeof window.refreshPlaceIdsWithProgress === 'function') {
      return await window.refreshPlaceIdsWithProgress(dryRun);
    }
    return { success: false, error: 'Refresh system not available' };
  }

  /**
   * Display results from operations
   */
  displayResults(result, statusDiv) {
    if (!statusDiv) return;

    if (result.success) {
      statusDiv.innerHTML = `<div class="status-message status-success">✅ ${result.message || 'Operation completed successfully'}</div>`;
    } else {
      statusDiv.innerHTML = `<div class="status-message status-error">❌ ${result.error || 'Operation failed'}</div>`;
    }
  }

  /**
   * Populate Missing Fields Only - callable from edit mode
   */
  async populateMissingFieldsOnly(dryRun = false) {
    console.log(`📝 Enhanced Automation: Populating missing fields (Dry Run: ${dryRun})`);
    if (typeof window.handlePopulateMissingFieldsEnhanced === 'function') {
      return await window.handlePopulateMissingFieldsEnhanced(null, dryRun);
    }
    return { success: false, error: 'Populate missing fields system not available' };
  }
}

// Create global instance
window.enhancedAutomation = window.enhancedAutomation || new EnhancedAutomationFeatures();

console.log('✅ Enhanced Automation Features ready');

// ============================================================
// SECTION 2: REFRESH PLACE IDS WITH PROGRESS
// ============================================================

/**
 * Primary refresh place IDs function with real-time progress
 */
window.refreshPlaceIdsWithProgress = window.refreshPlaceIdsWithProgress || async function(dryRun = false) {
  console.log(`🔄 Starting Refresh Place IDs (Dry Run: ${dryRun})...`);

  const statusDiv = document.getElementById('refresh-status');
  if (!statusDiv) {
    console.warn('⚠️ No status div found for refresh-status');
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
    const m365Updates = []; // Collect updates for M365 batch write

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
                // Collect data for M365 batch write
                m365Updates.push({
                  rowIndex: i,
                  name: placeName,
                  placeId: placeId,
                  website: freshData.website || '',
                  phone: freshData.phone || '',
                  hours: freshData.hours || '',
                  address: freshData.address || '',
                  rating: freshData.rating || '',
                  directions: freshData.directions || ''
                });
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

    // STEP 1: Update in-memory data with refreshed details
    console.log(`💾 Updating in-memory data with ${m365Updates.length} refreshed records...`);
    for (const update of m365Updates) {
      if (update.rowIndex >= 0 && update.rowIndex < data.length) {
        const location = data[update.rowIndex];
        if (location.values && location.values[0]) {
          // Update the values array with fresh data
          location.values[0][1] = update.placeId;   // Place ID (Column B)
          location.values[0][2] = update.website;   // Website (Column C)
          location.values[0][3] = update.phone;     // Phone (Column D)
          location.values[0][4] = update.hours;     // Hours (Column E)
          location.values[0][11] = update.address;  // Address (Column L)
          location.values[0][13] = update.rating;   // Rating (Column N)
          location.values[0][15] = update.directions; // Directions (Column P)
        } else if (location.placeId !== undefined) {
          // Direct property update if not using values array
          location.placeId = update.placeId;
          location.website = update.website;
          location.phone = update.phone;
          location.hours = update.hours;
          location.address = update.address;
          location.rating = update.rating;
          location.directions = update.directions;
        }
      }
    }
    console.log(`✅ In-memory data updated with ${m365Updates.length} records`);

    // STEP 2: Batch write to M365 Excel using the same proven method as bulk add operations
    let m365Status = '';
    let m365Count = 0;
    if (!dryRun && m365Updates.length > 0) {
      console.log(`📝 Writing ${m365Updates.length} updates to M365 Excel...`);
      try {
        // ATTEMPT 1: Try writeBatchPlacesToM365 (Office.js context - Excel Add-in mode)
        if (typeof mainWindow.writeBatchPlacesToM365 === 'function') {
          try {
            const writeResult = await mainWindow.writeBatchPlacesToM365(m365Updates);
            if (writeResult && writeResult.success) {
              m365Status = `<br>✅ M365 EXCEL UPDATED: ${writeResult.successCount} rows updated`;
              m365Count = writeResult.successCount;
              console.log(`✅ M365 Excel batch write successful: ${writeResult.successCount}/${writeResult.totalCount}`);
            } else if (writeResult && writeResult.message) {
              m365Status = `<br>⚠️ M365 write: ${writeResult.message}. Data persisted in memory.`;
              console.warn('⚠️ M365 write result:', writeResult);
            }
          } catch (m365DirectError) {
            m365Status = `<br>⚠️ M365 batch write error: ${m365DirectError.message}. Data persisted in memory.`;
            console.warn('⚠️ M365 batch write error:', m365DirectError);
          }
        }

        // ATTEMPT 2: If no batch function, try individual updates via Office context
        if (!m365Status && typeof Office !== 'undefined' && typeof Excel !== 'undefined') {
          try {
            console.log('📝 Attempting individual Excel updates via Office.js...');
            let successCount = 0;
            for (const update of m365Updates) {
              try {
                await mainWindow.writeUpdatedPlaceToM365(update.rowIndex, update);
                successCount++;
              } catch (err) {
                console.warn(`⚠️ Could not update row ${update.rowIndex}:`, err.message);
              }
            }
            if (successCount > 0) {
              m365Status = `<br>✅ M365 EXCEL UPDATED: ${successCount} rows updated`;
              m365Count = successCount;
              console.log(`✅ Individual Excel updates successful: ${successCount}/${m365Updates.length}`);
            }
          } catch (officeErr) {
            m365Status = `<br>⚠️ Office context error: ${officeErr.message}. Data persisted in memory.`;
            console.warn('⚠️ Office context error:', officeErr);
          }
        }

        // ATTEMPT 3: Fallback to saveToExcel() or sync to parent window
        if (!m365Status) {
          try {
            // Check if we have parent window access
            if (mainWindow && mainWindow !== window && mainWindow.adventuresData) {
              console.log(`📝 Syncing ${m365Updates.length} records back to parent window...`);

              // Update parent's adventuresData array with our changes
              let syncCount = 0;
              for (const update of m365Updates) {
                if (mainWindow.adventuresData[update.rowIndex]) {
                  Object.assign(mainWindow.adventuresData[update.rowIndex], update);
                  syncCount++;
                  console.log(`✅ Synced row ${update.rowIndex}: ${update.placeName || 'Unknown'}`);
                }
              }

              console.log(`✅ Successfully synced ${syncCount}/${m365Updates.length} records to parent window`);

              // Now try to trigger the parent window's save function
              // Check for various save function names that might exist
              let saveTriggered = false;

              // Try #1: Direct saveToExcel function
              if (typeof mainWindow.saveToExcel === 'function') {
                console.log('🔄 Calling mainWindow.saveToExcel()...');
                try {
                  await mainWindow.saveToExcel();
                  m365Status = `<br>✅ EXCEL AUTO-SAVED: ${syncCount} records saved to Excel automatically`;
                  m365Count = syncCount;
                  saveTriggered = true;
                  console.log('✅ Excel saved successfully via saveToExcel()');
                } catch (err) {
                  console.warn('⚠️ saveToExcel() threw error:', err.message);
                }
              }

              // Try #2: handleSaveData function
              if (!saveTriggered && typeof mainWindow.handleSaveData === 'function') {
                console.log('🔄 Calling mainWindow.handleSaveData()...');
                try {
                  await mainWindow.handleSaveData();
                  m365Status = `<br>✅ EXCEL AUTO-SAVED: ${syncCount} records saved to Excel automatically`;
                  m365Count = syncCount;
                  saveTriggered = true;
                  console.log('✅ Excel saved successfully via handleSaveData()');
                } catch (err) {
                  console.warn('⚠️ handleSaveData() threw error:', err.message);
                }
              }

              // Try #3: triggerSave function
              if (!saveTriggered && typeof mainWindow.triggerSave === 'function') {
                console.log('🔄 Calling mainWindow.triggerSave()...');
                try {
                  mainWindow.triggerSave();
                  m365Status = `<br>✅ EXCEL AUTO-SAVED: ${syncCount} records saved to Excel automatically`;
                  m365Count = syncCount;
                  saveTriggered = true;
                  console.log('✅ Excel saved successfully via triggerSave()');
                } catch (err) {
                  console.warn('⚠️ triggerSave() threw error:', err.message);
                }
              }

              // If no auto-save function exists, show synced message
              if (!saveTriggered) {
                console.log('ℹ️ No auto-save function found in parent window');
                m365Status = `<br>✅ DATA SYNCED: ${syncCount} records synced to parent window`;
                console.log('ℹ️ Parent window is aware of changes. You should save with Ctrl+S to persist to Excel.');
              }

              m365Count = syncCount;
            }
            // If no parent window, try direct Office.js save
            else if (typeof mainWindow.saveToExcel === 'function') {
              console.log(`📝 Saving ${m365Updates.length} updated records to Excel using saveToExcel()...`);
              await mainWindow.saveToExcel();
              m365Status = `<br>✅ EXCEL SAVED: ${m365Updates.length} rows saved to Excel`;
              m365Count = m365Updates.length;
              console.log(`✅ Excel save successful via saveToExcel()`);
            }
            // Last resort
            else {
              m365Status = `<br>📌 Data persisted in memory (${m365Updates.length} records). Return to main window and save with Ctrl+S`;
              console.log('ℹ️ Not in Office Add-in context. Data updated in memory. User should save manually in Excel.');
            }
          } catch (saveErr) {
            m365Status = `<br>⚠️ Sync error: ${saveErr.message}. Data partially updated in memory.`;
            console.warn('⚠️ Sync error:', saveErr);
          }
        }
      } catch (m365Error) {
        m365Status = `<br>⚠️ M365 write error: ${m365Error.message}. Data persisted in memory.`;
        console.warn('⚠️ M365 write error:', m365Error);
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
    resultHTML += m365Status; // Add M365 status

    // Add instruction based on save status
    if (m365Status && m365Status.includes('AUTO-SAVED')) {
      resultHTML += `<br><br><strong style="color: #10b981;">✅ Auto-Save Successful!</strong><br>`;
      resultHTML += `<span style="background: #d1fae5; padding: 12px; border-radius: 6px; display: block; margin-top: 8px;">
        Your changes have been automatically saved to Excel!<br>
        You may close this window or continue working.
      </span>`;
    } else if (m365Status && m365Status.includes('DATA SYNCED')) {
      resultHTML += `<br><br><strong style="color: #f59e0b;">⚠️ Manual Save Required</strong><br>`;
      resultHTML += `<span style="background: #fef3c7; padding: 12px; border-radius: 6px; display: block; margin-top: 8px;">
        1️⃣ <strong>Close this Edit Mode window</strong><br>
        2️⃣ <strong>Return to the main Adventure Planner window</strong><br>
        3️⃣ <strong>Save your changes</strong> using <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px;">Ctrl+S</code> (or <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px;">Cmd+S</code> on Mac)<br>
        4️⃣ Wait for the save confirmation
      </span>`;
    } else if (m365Status && m365Status.includes('Data persisted')) {
      resultHTML += `<br><br><strong style="color: #f59e0b;">⚠️ In-Memory Update Only</strong><br>`;
      resultHTML += `<span style="background: #fef3c7; padding: 12px; border-radius: 6px; display: block; margin-top: 8px;">
        Changes are in memory. Please return to the main window and press <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px;">Ctrl+S</code> to save to Excel.
      </span>`;
    }

    if (dryRun) {
      resultHTML += `<br>🧪 <strong>DRY RUN MODE - No changes made</strong>`;
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

/**
 * Alias for compatibility
 */
window.refreshPlaceIdsFromEditMode = window.refreshPlaceIdsFromEditMode || async function(dryRun = false) {
  console.log(`🔄 refreshPlaceIdsFromEditMode called (Dry Run: ${dryRun})`);
  return await window.refreshPlaceIdsWithProgress(dryRun);
};

/**
 * Button handler
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

  statusDiv.innerHTML = `
    <div style="background: #dbeafe; color: #1e40af; border-left: 4px solid #1e40af; padding: 16px; border-radius: 8px; margin-bottom: 12px;">
      <span style="display: inline-block; width: 20px; height: 20px; border: 3px solid #e5e7eb; border-top-color: #1e40af; border-radius: 50%; animation: spin 0.8s linear infinite; margin-right: 10px; vertical-align: middle;"></span>
      <strong>🔄 Initializing refresh...</strong>
    </div>
  `;

  if (!document.getElementById('spinnerCSS')) {
    const style = document.createElement('style');
    style.id = 'spinnerCSS';
    style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
  }

  setTimeout(() => {
    try {
      if (window.opener && window.opener.refreshPlaceIdsFromEditMode) {
        window.opener.refreshPlaceIdsFromEditMode(dryRun);
      } else if (window.opener && window.opener.refreshPlaceIdsWithProgress) {
        window.opener.refreshPlaceIdsWithProgress(dryRun);
      } else if (window.refreshPlaceIdsFromEditMode) {
        window.refreshPlaceIdsFromEditMode(dryRun);
      } else if (window.refreshPlaceIdsWithProgress) {
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

console.log('✅ Refresh Place IDs system ready');

// ============================================================
// SECTION 3: RESULT MODAL SYSTEM (Legacy)
// ============================================================

/**
 * Show a professional result modal with summary and details
 */
window.showResultModal = function(title, summaryRows, detailRows) {
  const backdrop = document.createElement('div');
  backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;';

  const modal = document.createElement('div');
  modal.style.cssText = 'background:#fff;border-radius:14px;max-width:760px;width:100%;max-height:80vh;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,.35);';

  // Header
  const header = document.createElement('div');
  header.style.cssText = 'padding:14px 18px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:16px;';
  header.textContent = title;

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = 'border:none;background:transparent;font-size:28px;cursor:pointer;color:#6b7280;';
  closeBtn.onclick = () => {
    backdrop.remove();
  };
  header.appendChild(closeBtn);

  // Summary Grid
  const summaryDiv = document.createElement('div');
  summaryDiv.style.cssText = 'padding:14px 18px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;';
  summaryDiv.innerHTML = summaryRows
    .map(r => `
      <div style="border:1px solid #e5e7eb;border-radius:10px;padding:10px;text-align:center;">
        <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">${r.label}</div>
        <div style="font-size:24px;font-weight:700;color:${r.color};">${r.value}</div>
      </div>
    `)
    .join('');

  // Details
  const detailsDiv = document.createElement('div');
  detailsDiv.style.cssText = 'padding:0 18px 16px 18px;';

  const detailsLabel = document.createElement('div');
  detailsLabel.style.cssText = 'font-size:12px;color:#6b7280;margin-bottom:8px;';
  detailsLabel.textContent = 'Details';
  detailsDiv.appendChild(detailsLabel);

  const detailsContent = document.createElement('div');
  detailsContent.style.cssText = 'border:1px solid #e5e7eb;border-radius:10px;max-height:44vh;overflow:auto;';

  if (detailRows && detailRows.length > 0) {
    detailsContent.innerHTML = detailRows
      .map(d => `<div style="padding:9px 12px;border-bottom:1px solid #f3f4f6;font-size:12px;">${d}</div>`)
      .join('');
  } else {
    detailsContent.innerHTML = '<div style="padding:12px;font-size:12px;color:#6b7280;">No details available.</div>';
  }
  detailsDiv.appendChild(detailsContent);

  modal.appendChild(header);
  modal.appendChild(summaryDiv);
  modal.appendChild(detailsDiv);

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  return backdrop;
};

console.log('✅ Result modal system ready');

// ============================================================
// SECTION 4: KEYBOARD SHORTCUTS & UTILITIES
// ============================================================

/**
 * Safe function access across contexts
 */
window.requireMainFunction = function(functionName) {
  const mainWindow = window.opener && !window.opener.closed ? window.opener : window;
  const func = mainWindow[functionName];

  if (typeof func === 'function') {
    return func;
  }

  console.warn(`⚠️ Function "${functionName}" not available`);
  return null;
};

/**
 * Recent places tracking
 */
window.recentPlacesTracker = {
  storageKey: 'automationRecentPlaces',
  maxItems: 10,
  items: [],

  init() {
    const stored = localStorage.getItem(this.storageKey);
    this.items = stored ? JSON.parse(stored) : [];
  },

  add(placeData) {
    this.items.unshift(placeData);
    if (this.items.length > this.maxItems) {
      this.items.pop();
    }
    localStorage.setItem(this.storageKey, JSON.stringify(this.items));
  },

  getAll() {
    return this.items;
  },

  clear() {
    this.items = [];
    localStorage.removeItem(this.storageKey);
  }
};

// Initialize
window.recentPlacesTracker.init();

console.log('✅ Keyboard shortcuts and utilities ready');

// ============================================================
// INITIALIZATION
// ============================================================

console.log('✅ Consolidated Automation Features System v7.0.141 Loaded');
console.log('  - Enhanced Automation Features');
console.log('  - Refresh Place IDs with Progress');
console.log('  - Result Modal System');
console.log('  - Keyboard Shortcuts');
console.log('  - Recent Places Tracking');
console.log('  - Cross-Context Utilities');

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    EnhancedAutomationFeatures,
    enhancedAutomation,
    recentPlacesTracker,
    showResultModal,
    requireMainFunction,
    refreshPlaceIdsWithProgress,
    refreshPlaceIdsFromEditMode,
    submitRefreshPlaceIds
  };
}

