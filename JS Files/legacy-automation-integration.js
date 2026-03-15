/**
 * LEGACY AUTOMATION INTEGRATION - v7.0.122
 * ==========================================
 * Extracted and adapted key features from old automation-control-panel.html
 *
 * Features integrated:
 * 1. showResultModal() - Professional result modals
 * 2. submitBatchAddPlaces() - Full batch processing
 * 3. Batch result rendering - Real-time display
 * 4. Keyboard shortcuts - Power user features
 * 5. Recent places tracking - Usage history
 * 6. requireMainFunction() - Safe function access
 * 7. Enter key submit - Better UX
 *
 * Date: March 15, 2026
 */

(function() {
  console.log('🔄 Legacy Automation Integration v7.0.122 Loading...');

  // ============================================================
  // 1. RESULT MODAL SYSTEM
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

    // Assemble modal
    modal.appendChild(header);
    modal.appendChild(summaryDiv);
    modal.appendChild(detailsDiv);
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    // Event handlers
    const close = () => backdrop.remove();
    closeBtn.onclick = close;
    backdrop.onclick = (e) => { if (e.target === backdrop) close(); };

    return backdrop;
  };

  // ============================================================
  // 2. HELPER FUNCTIONS
  // ============================================================

  /**
   * Safely require a function from main window
   */
  window.requireMainFunction = function(name) {
    const mainWindow = window.opener && !window.opener.closed ? window.opener : window;
    if (!mainWindow) throw new Error('Main window is not connected');
    const fn = mainWindow[name];
    if (typeof fn !== 'function') {
      throw new Error(`${name} is not available in main window`);
    }
    return fn;
  };

  /**
   * Get main window context
   */
  function getMainWindow() {
    return (window.opener && !window.opener.closed) ? window.opener : window;
  }

  // ============================================================
  // 3. RECENT PLACES TRACKING
  // ============================================================

  const RECENT_PLACES_KEY = 'adventure_finder_recent_places';
  const RECENT_CHAINS_KEY = 'adventure_finder_recent_chains';
  const MAX_RECENT = 8;

  /**
   * Add recent place to history
   */
  window.addRecentPlace = function(place) {
    try {
      let recent = JSON.parse(localStorage.getItem(RECENT_PLACES_KEY) || '[]');
      recent.unshift(place);
      recent = recent.slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_PLACES_KEY, JSON.stringify(recent));
      console.log('📝 Added to recent places:', place.name);
    } catch (err) {
      console.warn('⚠️ Could not save recent place:', err);
    }
  };

  /**
   * Add recent chain to history
   */
  window.addRecentChain = function(chain) {
    try {
      let recent = JSON.parse(localStorage.getItem(RECENT_CHAINS_KEY) || '[]');
      recent.unshift(chain);
      recent = recent.slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_CHAINS_KEY, JSON.stringify(recent));
      console.log('⛓️ Added to recent chains:', chain.chainName);
    } catch (err) {
      console.warn('⚠️ Could not save recent chain:', err);
    }
  };

  /**
   * Load recent places
   */
  window.loadRecentPlaces = function() {
    try {
      return JSON.parse(localStorage.getItem(RECENT_PLACES_KEY) || '[]');
    } catch (err) {
      return [];
    }
  };

  /**
   * Load recent chains
   */
  window.loadRecentChains = function() {
    try {
      return JSON.parse(localStorage.getItem(RECENT_CHAINS_KEY) || '[]');
    } catch (err) {
      return [];
    }
  };

  // ============================================================
  // 4. BATCH PROCESSING WITH RESULT RENDERING
  // ============================================================

  /**
   * Submit batch add places with real-time progress
   */
  window.submitBatchAddPlacesWithProgress = async function(values, inputType, displayElement, dryRun = false) {
    if (!displayElement) {
      console.error('❌ No display element provided');
      return;
    }

    const mainWindow = getMainWindow();
    const adventuresData = mainWindow.adventuresData || window.adventuresData;

    if (!adventuresData) {
      displayElement.innerHTML = '<div style="padding:16px;background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;color:#7f1d1d;">❌ No data available</div>';
      return;
    }

    if (!Array.isArray(values) || values.length === 0) {
      displayElement.innerHTML = '<div style="padding:16px;background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;color:#7f1d1d;">❌ No values provided</div>';
      return;
    }

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    // Show initial progress
    const updateDisplay = () => {
      displayElement.innerHTML = renderBatchProgress(results, successCount, failureCount, values.length, dryRun);
    };

    updateDisplay();

    try {
      // Get required functions
      const resolvePlaceIdFromInput = mainWindow.resolvePlaceIdFromInput || (() => {
        throw new Error('resolvePlaceIdFromInput not available');
      });
      const getPlaceDetails = mainWindow.getPlaceDetails || (() => {
        throw new Error('getPlaceDetails not available');
      });
      const buildExcelRow = mainWindow.buildExcelRow || (() => {
        throw new Error('buildExcelRow not available');
      });
      const placeExistsInData = mainWindow.placeExistsInData || (() => false);
      const addRowToExcel = mainWindow.addRowToExcel || (() => {});
      const loadTable = mainWindow.loadTable || (() => {});

      // Process each value
      for (let i = 0; i < values.length; i++) {
        const inputValue = values[i];

        try {
          // Resolve Place ID
          let placeId;
          try {
            placeId = await resolvePlaceIdFromInput(inputType, inputValue);
          } catch (err) {
            throw new Error(`Could not resolve: ${err.message}`);
          }

          // Get place details
          let details;
          try {
            details = await getPlaceDetails(placeId);
          } catch (err) {
            throw new Error(`Could not fetch details: ${err.message}`);
          }

          // Build Excel row
          const row = buildExcelRow(placeId, details);
          const placeName = row[0] || 'Unknown Place';

          // Check if place already exists
          if (placeExistsInData(row)) {
            results.push({
              status: 'skipped',
              name: placeName,
              input: inputValue,
              reason: 'Already exists'
            });
            failureCount++;
          } else {
            if (!dryRun) {
              await addRowToExcel(row);
            }

            results.push({
              status: dryRun ? 'preview' : 'success',
              name: placeName,
              input: inputValue,
              placeId: placeId
            });
            successCount++;

            // Track in recent
            if (typeof window.addRecentPlace === 'function') {
              window.addRecentPlace({
                name: placeName,
                placeId: placeId || '',
                inputType,
                inputValue,
                dryRun: !!dryRun,
                when: new Date().toLocaleTimeString()
              });
            }
          }
        } catch (err) {
          results.push({
            status: 'error',
            input: inputValue,
            error: err.message
          });
          failureCount++;
        }

        // Update display
        updateDisplay();
      }

      // Final refresh
      if (!dryRun) {
        await loadTable();
      }

      // Show final results modal
      const summaryRows = [
        { label: 'Successful', value: successCount, color: '#10b981' },
        { label: 'Failed', value: failureCount, color: '#ef4444' },
        { label: 'Total', value: values.length, color: '#3b82f6' }
      ];

      const detailRows = results.map((r, idx) => {
        const icon = r.status === 'success' || r.status === 'preview' ? '✅' : r.status === 'skipped' ? '⏭️' : '❌';
        return `${icon} ${r.name || r.input}: ${r.reason || r.error || 'Added'}`;
      });

      if (typeof window.showResultModal === 'function') {
        window.showResultModal(
          dryRun ? 'Batch Add (Preview)' : 'Batch Add Complete',
          summaryRows,
          detailRows
        );
      }

      displayElement.innerHTML = `
        <div style="padding:16px;background:#ecfdf5;border:1px solid #6ee7b7;border-radius:8px;color:#047857;">
          <strong>✅ ${dryRun ? 'Preview' : 'Complete'}</strong>
          <div style="font-size:14px;margin-top:8px;">
            ✅ Success: ${successCount} | ❌ Failed: ${failureCount} | Total: ${values.length}
          </div>
        </div>
      `;

      return { success: failureCount === 0, successCount, failureCount, results };
    } catch (err) {
      console.error('❌ Batch add error:', err);
      displayElement.innerHTML = `
        <div style="padding:16px;background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;color:#7f1d1d;">
          <strong>❌ Error:</strong> ${err.message}
        </div>
      `;
      return { success: false, error: err.message };
    }
  };

  /**
   * Render batch progress display
   */
  function renderBatchProgress(results, success, failure, total, dryRun) {
    const processed = results.length;
    const percent = Math.round((processed / total) * 100);

    return `
      <div style="padding:16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;">
        <div style="font-weight:600;color:#1e40af;margin-bottom:12px;">
          ${dryRun ? '🧪 PREVIEW' : '⏳ Processing'} Batch Add Places
        </div>
        <div style="margin-bottom:12px;">
          <div style="font-size:14px;color:#1f2937;margin-bottom:4px;">
            Progress: ${processed}/${total} (${percent}%)
          </div>
          <div style="width:100%;height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden;">
            <div style="width:${percent}%;height:100%;background:#3b82f6;transition:width 0.3s;"></div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;font-size:13px;">
          <div style="padding:8px;background:#ecfdf5;border-radius:4px;color:#047857;">✅ Success: ${success}</div>
          <div style="padding:8px;background:#fee2e2;border-radius:4px;color:#7f1d1d;">❌ Failed: ${failure}</div>
          <div style="padding:8px;background:#f3f4f6;border-radius:4px;color:#4b5563;">📊 Total: ${total}</div>
        </div>
      </div>
    `;
  }

  // ============================================================
  // 5. KEYBOARD SHORTCUTS
  // ============================================================

  /**
   * Setup keyboard shortcuts
   */
  window.setupKeyboardShortcuts = function(shortcuts) {
    document.addEventListener('keydown', (e) => {
      if (!e.altKey) return;

      const key = e.key.toUpperCase();
      const buttonId = shortcuts[key];

      if (buttonId) {
        e.preventDefault();
        const btn = document.getElementById(buttonId);
        if (btn) {
          console.log(`⌨️ Keyboard shortcut: Alt+${key} → ${buttonId}`);
          btn.click();
        }
      }
    });

    console.log('⌨️ Keyboard shortcuts active');
  };

  // ============================================================
  // 6. FORM SUBMIT HELPERS
  // ============================================================

  /**
   * Enable Enter key for input submission
   */
  window.enableEnterKeySubmit = function(inputSelector, submitFn) {
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const input = document.querySelector(inputSelector);
      if (!input || document.activeElement !== input) return;
      e.preventDefault();
      console.log('📝 Enter key pressed');
      submitFn();
    });
  };

  console.log('✅ Legacy Automation Integration v7.0.122 Ready');
  console.log('  - showResultModal()');
  console.log('  - submitBatchAddPlacesWithProgress()');
  console.log('  - Keyboard shortcuts');
  console.log('  - Recent places tracking');
  console.log('  - Form submit helpers');
})();

