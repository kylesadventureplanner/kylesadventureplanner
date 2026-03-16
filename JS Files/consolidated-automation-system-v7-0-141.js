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
    container.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f0f4ff;
      border-radius: 8px;
      border: 1px solid #60a5fa;
      margin-bottom: 12px;
    `;

    const label = document.createElement('label');
    label.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #1e40af;
      cursor: pointer;
      margin: 0;
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

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode('🧪 Dry Run (Preview Changes)'));
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

