/**
 * UNIVERSAL PROGRESS TRACKING & API ENHANCEMENT SYSTEM - v7.0.124
 * ================================================================
 *
 * Provides standardized progress tracking for all features that:
 * - Call Google Places API
 * - Write to Excel via Microsoft Graph API
 * - Perform batch operations
 * - Tag locations
 * - Backup data
 *
 * Features:
 * 1. Real-time progress bars (0-100%)
 * 2. Live counters (success/failed/skipped)
 * 3. Current item display
 * 4. Elapsed time tracking
 * 5. Detailed error reporting
 * 6. Copy to clipboard functionality
 * 7. Graceful API error handling with fallbacks
 * 8. Data verification after operations
 * 9. Consistent UI across all features
 * 10. Comprehensive logging
 *
 * Date: March 15, 2026
 * Version: v7.0.124
 */

(function() {
  console.log('🚀 Universal Progress Tracking System v7.0.124 Loading...');

  function normalizeWriteContract(rawResult, defaults = {}) {
    if (typeof window.normalizeWriteResultContract === 'function') {
      return window.normalizeWriteResultContract(rawResult, defaults);
    }
    const raw = rawResult && typeof rawResult === 'object' ? rawResult : {};
    const asCount = (value, fallback = 0) => {
      const parsed = Number(value);
      if (!Number.isFinite(parsed) || parsed < 0) return Math.max(0, Number(fallback) || 0);
      return Math.max(0, Math.round(parsed));
    };
    const rowsChanged = asCount(raw.rowsChanged, asCount(defaults.rowsChanged, 0));
    const persistedRows = asCount(raw.persistedRows, rowsChanged);
    const verifiedRowsChanged = asCount(raw.verifiedRowsChanged, asCount(raw.rowsVerifiedPresent, 0));
    const rowsRequested = asCount(raw.rowsRequested, asCount(raw.total, asCount(defaults.rowsRequested, rowsChanged)));
    const success = typeof raw.success === 'boolean'
      ? raw.success
      : (typeof raw.ok === 'boolean' ? raw.ok : (persistedRows > 0 || rowsChanged > 0 || rowsRequested === 0));
    return {
      ...raw,
      success,
      rowsRequested,
      rowsChanged,
      rowsAppended: asCount(raw.rowsAppended, rowsChanged),
      persistedRows,
      verifiedRowsChanged,
      rowsVerifiedPresent: asCount(raw.rowsVerifiedPresent, verifiedRowsChanged),
      postWriteVerified: typeof raw.postWriteVerified === 'boolean' ? raw.postWriteVerified : (persistedRows > 0 && verifiedRowsChanged === persistedRows),
      verificationMode: String(raw.verificationMode || defaults.verificationMode || '').trim(),
      verificationReason: String(raw.verificationReason || defaults.verificationReason || '').trim()
    };
  }

  function applyWriteContractToSummary(summary, result, defaults = {}) {
    const base = summary && typeof summary === 'object' ? summary : {};
    const normalized = normalizeWriteContract(result, defaults);
    return {
      ...base,
      rowsRequested: normalized.rowsRequested,
      rowsChanged: normalized.rowsChanged,
      rowsAppended: normalized.rowsAppended,
      persistedRows: normalized.persistedRows,
      verifiedRowsChanged: normalized.verifiedRowsChanged,
      rowsVerifiedPresent: normalized.rowsVerifiedPresent,
      postWriteVerified: normalized.postWriteVerified,
      verificationMode: normalized.verificationMode,
      verificationReason: normalized.verificationReason,
      persistMode: String(normalized.persistMode || normalized.mode || '').trim(),
      persistReason: String(normalized.persistReason || normalized.reason || '').trim(),
      persisted: typeof normalized.persisted === 'boolean' ? normalized.persisted : normalized.persistedRows > 0,
      queued: !!normalized.queued,
      offline: !!normalized.offline
    };
  }

  /**
   * UNIVERSAL PROGRESS TRACKER CLASS
   */
  class UniversalProgressTracker {
    constructor(displayElement, title, totalItems, options = {}) {
      this.displayElement = displayElement;
      this.title = title;
      this.totalItems = totalItems;
      this.options = options;

      this.processed = 0;
      this.successCount = 0;
      this.failCount = 0;
      this.skippedCount = 0;
      this.startTime = new Date();
      this.results = [];
      this.dryRun = options.dryRun || false;
      this.updateInterval = options.updateInterval || 100; // ms
      this.lastUpdateTime = 0;
    }

    /**
     * Update progress display
     */
    updateProgress(currentItem = '', details = '') {
      const now = Date.now();
      if (now - this.lastUpdateTime < this.updateInterval) {
        return; // Throttle updates
      }
      this.lastUpdateTime = now;

      const percent = Math.round((this.processed / this.totalItems) * 100);
      const elapsed = Math.round((new Date() - this.startTime) / 1000);

      const progressHTML = `
        <div style="padding: 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px;">
          <div style="font-weight: 600; color: #1e40af; margin-bottom: 12px; font-size: 15px;">
            ${this.dryRun ? '🧪 DRY RUN' : '⏳ PROCESSING'} ${this.title}
          </div>

          <!-- Progress Bar -->
          <div style="margin-bottom: 12px;">
            <div style="font-size: 14px; color: #1f2937; margin-bottom: 6px;">
              Progress: <strong>${this.processed}/${this.totalItems}</strong> (${percent}%)
            </div>
            <div style="width: 100%; height: 12px; background: #e5e7eb; border-radius: 6px; overflow: hidden; margin-bottom: 4px;">
              <div style="width: ${percent}%; height: 100%; background: linear-gradient(90deg, #3b82f6, #2563eb); transition: width 0.3s; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>
            </div>
          </div>

          <!-- Status Cards -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px;">
            <div style="padding: 10px; background: #ecfdf5; border-radius: 6px; text-align: center;">
              <div style="font-size: 24px; font-weight: 700, color: #10b981;">✅ ${this.successCount}</div>
              <div style="font-size: 11px; color: #047857; margin-top: 2px;">Success</div>
            </div>
            <div style="padding: 10px, background: #fee2e2; border-radius: 6px; text-align: center;">
              <div style="font-size: 24px; font-weight: 700; color: #ef4444;">❌ ${this.failCount}</div>
              <div style="font-size: 11px; color: #7f1d1d; margin-top: 2px;">Failed</div>
            </div>
            <div style="padding: 10px; background: #fef3c7; border-radius: 6px; text-align: center;">
              <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">⏭️ ${this.skippedCount}</div>
              <div style="font-size: 11px; color: #92400e; margin-top: 2px;">Skipped</div>
            </div>
            <div style="padding: 10px; background: #f3f4f6; border-radius: 6px; text-align: center;">
              <div style="font-size: 24px; font-weight: 700; color: #6b7280;">⏱️ ${elapsed}s</div>
              <div style="font-size: 11px; color: #4b5563; margin-top: 2px;">Elapsed</div>
            </div>
          </div>

          <!-- Current Item & Details -->
          <div style="padding: 8px 12px; background: rgba(59, 130, 246, 0.1); border-left: 3px solid #3b82f6; border-radius: 4px; font-size: 12px; color: #1f2937;">
            <div>📝 ${currentItem || 'Processing...'}</div>
            ${details ? `<div style="margin-top: 4px; font-size: 11px; color: #6b7280;">${details}</div>` : ''}
          </div>
        </div>
      `;

      this.displayElement.innerHTML = progressHTML;
    }

    /**
     * Record a successful item
     */
    recordSuccess(item, details = '') {
      this.successCount++;
      this.processed++;
      this.results.push({
        item,
        status: 'success',
        details,
        icon: '✅'
      });
      this.updateProgress(item, details);
    }

    /**
     * Record a failed item
     */
    recordFailure(item, error = '', details = '') {
      this.failCount++;
      this.processed++;
      this.results.push({
        item,
        status: 'failed',
        error,
        details,
        icon: '❌'
      });
      this.updateProgress(item, `Error: ${error}`);
    }

    /**
     * Record a skipped item
     */
    recordSkipped(item, reason = '') {
      this.skippedCount++;
      this.processed++;
      this.results.push({
        item,
        status: 'skipped',
        reason,
        icon: '⏭️'
      });
      this.updateProgress(item, `Skipped: ${reason}`);
    }

    /**
     * Display final results
     */
    displayFinalResults(customMessage = '') {
      const elapsed = Math.round((new Date() - this.startTime) / 1000);
      const success = this.failCount === 0;
      const copyText = [
        `${this.title} RESULTS - ${new Date().toLocaleString()}`,
        `Status: ${this.dryRun ? 'DRY RUN' : 'COMPLETED'}`,
        `Success: ${this.successCount} | Failed: ${this.failCount} | Skipped: ${this.skippedCount}`,
        `Time: ${elapsed} seconds`,
        `Total: ${this.totalItems} items`,
        '',
        'DETAILS:',
        ...this.results.map((r, i) => `${i + 1}. ${r.icon} ${r.item} - ${r.details || r.reason || r.error || 'Completed'}`)
      ].join('\n');

      const finalHTML = `
        <div style="padding: 16px; background: ${success ? '#ecfdf5' : '#fef3c7'}; border: 1px solid ${success ? '#6ee7b7' : '#fbbf24'}; border-radius: 8px;">
          <div style="font-weight: 600; color: ${success ? '#047857' : '#92400e'}; margin-bottom: 12px; font-size: 15px;">
            ${this.dryRun ? '🧪 DRY RUN COMPLETE' : success ? '✅ COMPLETED SUCCESSFULLY' : '⚠️ COMPLETED WITH ERRORS'}
          </div>

          ${customMessage ? `<div style="margin-bottom: 12px; padding: 8px; background: rgba(0,0,0,0.05); border-radius: 4px; font-size: 13px;">${customMessage}</div>` : ''}

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px;">
            <div style="padding: 10px; background: #ecfdf5; border-radius: 6px; text-align: center;">
              <div style="font-size: 28px; font-weight: 700; color: #10b981;">✅ ${this.successCount}</div>
              <div style="font-size: 11px; color: #047857; margin-top: 2px;">Success</div>
            </div>
            <div style="padding: 10px; background: #fee2e2; border-radius: 6px; text-align: center;">
              <div style="font-size: 28px; font-weight: 700; color: #ef4444;">❌ ${this.failCount}</div>
              <div style="font-size: 11px; color: #7f1d1d; margin-top: 2px;">Failed</div>
            </div>
            <div style="padding: 10px; background: #fef3c7; border-radius: 6px; text-align: center;">
              <div style="font-size: 28px; font-weight: 700; color: #f59e0b;">⏭️ ${this.skippedCount}</div>
              <div style="font-size: 11px; color: #92400e; margin-top: 2px;">Skipped</div>
            </div>
            <div style="padding: 10px; background: #f3f4f6; border-radius: 6px; text-align: center;">
              <div style="font-size: 28px; font-weight: 700; color: #6b7280;">⏱️ ${elapsed}s</div>
              <div style="font-size: 11px; color: #4b5563; margin-top: 2px;">Total Time</div>
            </div>
          </div>

          <div style="max-height: 400px; overflow-y: auto; background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb; margin-bottom: 12px; font-size: 12px;">
            ${this.results.map((r) => `
              <div style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; display: flex; align-items: flex-start; gap: 8px;">
                <div style="flex-shrink: 0; margin-top: 2px; font-size: 14px;">${r.icon}</div>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-weight: 600; word-break: break-all;">${r.item}</div>
                  <div style="color: #6b7280; font-size: 11px; margin-top: 2px;">
                    ${r.details || r.reason || r.error || 'Completed'}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          <button id="progressTrackerCopyBtn" style="
            padding: 10px 16px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            transition: background 0.2s;
          " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
            📋 Copy Results to Clipboard
          </button>
        </div>
      `;

      this.displayElement.innerHTML = finalHTML;

      const copyBtn = this.displayElement.querySelector('#progressTrackerCopyBtn');
      if (copyBtn) {
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(copyText).then(() => {
            alert('✅ Results copied to clipboard!');
          }).catch(() => {
            alert('❌ Could not copy to clipboard');
          });
        };
      }
    }

    /**
     * Display error
     */
    displayError(errorMessage, details = '') {
      const errorHTML = `
        <div style="padding: 16px; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; color: #7f1d1d;">
          <strong>❌ Error:</strong> ${errorMessage}
          ${details ? `<div style="margin-top: 8px; padding: 8px; background: rgba(0,0,0,0.1); border-radius: 4px; font-family: monospace; font-size: 11px; max-height: 200px; overflow-y: auto;">${details}</div>` : ''}
        </div>
      `;
      this.displayElement.innerHTML = errorHTML;
    }

    /**
     * Get summary
     */
    getSummary() {
      return {
        success: this.failCount === 0,
        successCount: this.successCount,
        failCount: this.failCount,
        skippedCount: this.skippedCount,
        totalItems: this.totalItems,
        elapsed: Math.round((new Date() - this.startTime) / 1000),
        dryRun: this.dryRun,
        results: this.results
      };
    }
  }

  // Export to window
  window.UniversalProgressTracker = UniversalProgressTracker;

  // ============================================================
  // ENHANCED: Add Single Place with Progress
  // ============================================================
  window.handleAddSinglePlaceWithProgress = async function(input, inputType, displayElement, dryRun = false, options = {}) {
    console.log('📍 Adding single place with progress tracking...');

    const tracker = new UniversalProgressTracker(displayElement, 'Add Single Place', 1, { dryRun });

    try {
      tracker.updateProgress('Resolving Google place...');

      if (dryRun) {
        const resolved = typeof window.resolvePlaceInputWithGoogleData === 'function'
          ? await window.resolvePlaceInputWithGoogleData(inputType, input)
          : null;
        tracker.recordSuccess(input, `[DRY RUN] Would add ${resolved?.name || input}`);
        tracker.displayFinalResults('Single location resolved successfully');
        return applyWriteContractToSummary(tracker.getSummary(), {
          rowsRequested: 1,
          rowsChanged: 0,
          rowsAppended: 0,
          persistedRows: 0,
          verifiedRowsChanged: 0,
          rowsVerifiedPresent: 0,
          postWriteVerified: false,
          verificationMode: 'dry-run',
          verificationReason: 'dry-run'
        }, { rowsRequested: 1 });
      }

      const automation = window.enhancedAutomation;
      if (!automation || typeof automation.addSinglePlace !== 'function') {
        throw new Error('Enhanced automation add system is not available.');
      }

      const result = await automation.addSinglePlace(input, inputType, false, options || {});
      if (!result.success) {
        throw new Error(result.error || 'Failed to add location');
      }

      tracker.recordSuccess(
        input,
        result && result.queued
          ? `[PENDING SYNC] ${result.message || ('Queued ' + (result.placeName || input))}`
          : `Added ${result.placeName || input}`
      );
      tracker.displayFinalResults(result && result.queued ? 'Single location saved locally and queued for sync.' : 'Single location processed successfully');
      return applyWriteContractToSummary(tracker.getSummary(), result, { rowsRequested: 1 });
    } catch (err) {
      console.error('❌ Error:', err);
      tracker.displayError(err.message, err.stack);
      return { success: false, error: err.message };
    }
  };

  // ============================================================
  // ENHANCED: Bulk Add Places with Progress
  // ============================================================
  window.handleBulkAddPlacesWithProgress = async function(locations, inputType, displayElement, dryRun = false, options = {}) {
    console.log(`📍 Bulk adding ${locations.length} places with progress...`);

    const tracker = new UniversalProgressTracker(displayElement, 'Bulk Add Places', locations.length, { dryRun });
    const writeTotals = {
      rowsRequested: 0,
      rowsChanged: 0,
      rowsAppended: 0,
      persistedRows: 0,
      verifiedRowsChanged: 0,
      rowsVerifiedPresent: 0
    };

    try {
      const automation = window.enhancedAutomation;
      if (!automation || typeof automation.addSinglePlace !== 'function') {
        throw new Error('Enhanced automation add system is not available.');
      }

      for (let i = 0; i < locations.length; i++) {
        const location = locations[i].trim();

        if (!location) {
          tracker.recordSkipped(`Item ${i + 1}`, 'Empty input');
          continue;
        }

        try {
          tracker.updateProgress(`Resolving: ${location.substring(0, 40)}...`);
          const result = await automation.addSinglePlace(location, inputType, dryRun, options || {});
          const normalized = normalizeWriteContract(result, { rowsRequested: 1 });
          writeTotals.rowsRequested += 1;

          if (result.success) {
            tracker.recordSuccess(
              location,
              dryRun
                ? `[DRY RUN] Would add ${result.placeName || location}`
                : result && result.queued
                  ? `[PENDING SYNC] ${result.message || ('Queued ' + (result.placeName || location))}`
                  : `Added ${result.placeName || location}`
            );
            writeTotals.rowsChanged += Math.max(0, Number(normalized.rowsChanged) || 0);
            writeTotals.rowsAppended += Math.max(0, Number(normalized.rowsAppended) || 0);
            writeTotals.persistedRows += Math.max(0, Number(normalized.persistedRows) || 0);
            writeTotals.verifiedRowsChanged += Math.max(0, Number(normalized.verifiedRowsChanged) || 0);
            writeTotals.rowsVerifiedPresent += Math.max(0, Number(normalized.rowsVerifiedPresent) || 0);
          } else {
            tracker.recordFailure(location, result.error || 'Failed to add location');
          }

          await new Promise(r => setTimeout(r, 120));
        } catch (err) {
          tracker.recordFailure(location, err.message);
        }
      }

      tracker.displayFinalResults(`${locations.length} locations processed`);
      return applyWriteContractToSummary(tracker.getSummary(), {
        rowsRequested: writeTotals.rowsRequested,
        rowsChanged: writeTotals.rowsChanged,
        rowsAppended: writeTotals.rowsAppended,
        persistedRows: writeTotals.persistedRows,
        verifiedRowsChanged: writeTotals.verifiedRowsChanged,
        rowsVerifiedPresent: writeTotals.rowsVerifiedPresent,
        postWriteVerified: writeTotals.persistedRows > 0 && writeTotals.verifiedRowsChanged === writeTotals.persistedRows,
        verificationMode: dryRun ? 'dry-run' : 'loaded-data-presence',
        verificationReason: dryRun
          ? 'dry-run'
          : (writeTotals.persistedRows > 0 && writeTotals.verifiedRowsChanged !== writeTotals.persistedRows
            ? 'one-or-more-added-rows-not-found-in-loaded-data'
            : '')
      }, { rowsRequested: locations.length });
    } catch (err) {
      console.error('❌ Error:', err);
      tracker.displayError(err.message, err.stack);
      return { success: false, error: err.message };
    }
  };

  function renderDelegationStatus(displayElement, text, isError = false, percent = null) {
    if (!displayElement) return;
    const bg = isError ? '#fee2e2' : '#eff6ff';
    const border = isError ? '#fca5a5' : '#bfdbfe';
    const color = isError ? '#7f1d1d' : '#1e40af';
    const safePercent = Number.isFinite(Number(percent)) ? Math.max(0, Math.min(100, Math.round(Number(percent)))) : null;
    const progressHtml = safePercent == null
      ? ''
      : `
        <div style="margin-top: 8px;">
          <div style="font-size: 12px; margin-bottom: 4px;">Progress: ${safePercent}%</div>
          <div style="width: 100%; height: 8px; background: #e5e7eb; border-radius: 999px; overflow: hidden;">
            <div style="width: ${safePercent}%; height: 100%; background: ${isError ? '#ef4444' : '#3b82f6'};"></div>
          </div>
        </div>
      `;
    displayElement.innerHTML = `<div style="padding: 12px; background: ${bg}; border: 1px solid ${border}; border-radius: 8px; color: ${color}; font-size: 13px;">${text}${progressHtml}</div>`;
  }

  function buildStrictWrapperMessage(label, code) {
    const safeLabel = String(label || 'unknown-wrapper').trim();
    const safeCode = String(code || 'UNKNOWN').trim();
    return `❌ [STRICT_WRAPPER:${safeCode}] ${safeLabel}`;
  }

  async function runRealHandler(displayElement, dryRun, handlers, label) {
    const candidates = Array.isArray(handlers) ? handlers : [];
    const resolvedHandler = candidates.find((fn) => typeof fn === 'function');

    if (!resolvedHandler) {
      const msg = buildStrictWrapperMessage(label, 'NO_HANDLER');
      renderDelegationStatus(displayElement, msg, true);
      return { success: false, error: msg };
    }

    renderDelegationStatus(displayElement, `⏳ Running real ${label} handler...`, false, 0);

    const result = await resolvedHandler(displayElement, dryRun);
    if (result && typeof result === 'object') {
      renderDelegationStatus(
        displayElement,
        result.success
          ? `✅ ${label} completed`
          : `⚠️ ${label} completed with issues`,
        !result.success,
        100
      );
      return result;
    }

    const failMsg = buildStrictWrapperMessage(label, 'NON_OBJECT_RESULT');
    renderDelegationStatus(displayElement, failMsg, true, 100);
    return { success: false, error: failMsg };
  }

  // ============================================================
  // ENHANCED: Populate Missing Fields with Progress
  // ============================================================
  window.handlePopulateMissingWithProgress = async function(displayElement, dryRun = false) {
    console.log('📋 Populating missing fields with progress...');

    try {
      return await runRealHandler(displayElement, dryRun, [
        window.handlePopulateMissingFieldsEnhanced,
        window.handlePopulateMissingFields
      ], 'populate-missing-fields');
    } catch (err) {
      console.error('❌ Error:', err);
      renderDelegationStatus(displayElement, `❌ ${err.message}`, true);
      return { success: false, error: err.message };
    }
  };

  // ============================================================
  // ENHANCED: Update Hours with Progress
  // ============================================================
  window.handleUpdateHoursWithProgress = async function(displayElement, dryRun = false) {
    console.log('🕐 Updating hours with progress...');

    try {
      return await runRealHandler(displayElement, dryRun, [
        window.handleUpdateHoursOnlyEnhanced,
        window.handleUpdateHoursOnly
      ], 'update-hours');
    } catch (err) {
      console.error('❌ Error:', err);
      renderDelegationStatus(displayElement, `❌ ${err.message}`, true);
      return { success: false, error: err.message };
    }
  };

  // ============================================================
  // ENHANCED: Refresh Place IDs with Progress
  // ============================================================
  window.handleRefreshPlaceIdsWithProgress = async function(displayElement, dryRun = false) {
    console.log('🔄 Refreshing Place IDs with progress...');

    try {
      const mainWindow = window.opener && !window.opener.closed ? window.opener : window;
      const refreshFn =
        (typeof mainWindow.refreshPlaceIdsWithProgress === 'function' && mainWindow.refreshPlaceIdsWithProgress) ||
        (typeof window.refreshPlaceIdsWithProgress === 'function' && window.refreshPlaceIdsWithProgress) ||
        (typeof mainWindow.handleRefreshPlaceIds === 'function' && mainWindow.handleRefreshPlaceIds) ||
        (typeof window.handleRefreshPlaceIds === 'function' && window.handleRefreshPlaceIds);

      if (typeof refreshFn !== 'function') {
        const msg = buildStrictWrapperMessage('refresh-place-ids', 'NO_HANDLER');
        renderDelegationStatus(displayElement, msg, true);
        return { success: false, error: msg };
      }

      renderDelegationStatus(displayElement, '⏳ Running real refresh-place-ids handler...');
      const result = await refreshFn(dryRun);
      if (result && typeof result === 'object') return result;

      const failMsg = buildStrictWrapperMessage('refresh-place-ids', 'NON_OBJECT_RESULT');
      renderDelegationStatus(displayElement, failMsg, true);
      return { success: false, error: failMsg };
    } catch (err) {
      console.error('❌ Error:', err);
      renderDelegationStatus(displayElement, `❌ ${err.message}`, true);
      return { success: false, error: err.message };
    }
  };

  // ============================================================
  // ENHANCED: Auto Tag with Progress
  // ============================================================
  window.handleAutoTagWithProgress = async function(displayElement, dryRun = false) {
    console.log('🏷️ Auto-tagging with progress...');

    try {
      const legacyFn = typeof window.handleAutoTagAll === 'function' ? window.handleAutoTagAll : null;
      const unifiedFn = typeof window.autoTagAllLocationsUnified === 'function' ? window.autoTagAllLocationsUnified : null;
      if (!legacyFn && !unifiedFn) {
        const msg = buildStrictWrapperMessage('auto-tag', 'NO_HANDLER');
        renderDelegationStatus(displayElement, msg, true);
        return { success: false, error: msg };
      }

      renderDelegationStatus(displayElement, '⏳ Running real auto-tag handler...');
      const result = legacyFn
        ? await legacyFn(dryRun)
        : await unifiedFn({ dryRun: !!dryRun });
      if (result && typeof result === 'object') return result;

      const failMsg = buildStrictWrapperMessage('auto-tag', 'NON_OBJECT_RESULT');
      renderDelegationStatus(displayElement, failMsg, true);
      return { success: false, error: failMsg };
    } catch (err) {
      console.error('❌ Error:', err);
      renderDelegationStatus(displayElement, `❌ ${err.message}`, true);
      return { success: false, error: err.message };
    }
  };

  console.log('✅ Universal Progress Tracking System v7.0.124 Ready');
  console.log('  - UniversalProgressTracker class');
  console.log('  - Add single place with progress');
  console.log('  - Bulk add places with progress');
  console.log('  - Populate missing with progress');
  console.log('  - Update hours with progress');
  console.log('  - Refresh Place IDs with progress');
  console.log('  - Auto tag with progress');
})();
