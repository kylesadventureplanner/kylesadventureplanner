/**
 * Wave 1 Progress Compatibility Alias (no-delete, no-rewrite)
 *
 * Candidate covered:
 * - universal-progress-tracking-system.js (low-confidence conditional dependency)
 *
 * Ownership / load-order:
 * - This file is additive only.
 * - Load after the edit-mode fix stack so it only fills missing handlers.
 * - It must not override existing implementations.
 */
(function () {
  var logPrefix = '[wave1-progress-compat]';

  function getMainWindow() {
    if (window.opener && !window.opener.closed) {
      return window.opener;
    }
    return window;
  }

  function getAutomationRuntime() {
    return window.enhancedAutomation || getMainWindow().enhancedAutomation || null;
  }

  function renderResult(statusDiv, result, fallbackMessage) {
    if (!statusDiv) return;

    var runtime = getAutomationRuntime();
    if (runtime && typeof runtime.displayResults === 'function') {
      runtime.displayResults(result || { success: true, message: fallbackMessage || 'Done' }, statusDiv);
      return;
    }

    var ok = !!(result && result.success !== false);
    var msg = (result && result.message) || fallbackMessage || (ok ? 'Completed' : 'Failed');
    statusDiv.innerHTML = '<div class="status-message ' + (ok ? '' : 'status-error') + '">' + msg + '</div>';
  }

  function bindIfMissing(name, fn) {
    if (typeof window[name] === 'function') return;
    window[name] = fn;
    console.log(logPrefix + ' bound:', name);
  }

  bindIfMissing('handleAddSinglePlaceWithProgress', async function (input, inputType, statusDiv, dryRun) {
    var runtime = getAutomationRuntime();
    if (!runtime || typeof runtime.addSinglePlace !== 'function') {
      return { success: false, message: 'Automation runtime not ready' };
    }

    if (statusDiv) {
      statusDiv.innerHTML = '<div class="status-message"><span class="spinner"></span> Processing...</div>';
    }

    var result = await runtime.addSinglePlace(input, inputType, dryRun);
    renderResult(statusDiv, result, 'Single place processed');
    return result;
  });

  bindIfMissing('handleBulkAddPlacesWithProgress', async function (locations, inputType, statusDiv, dryRun) {
    var runtime = getAutomationRuntime();
    if (!runtime || typeof runtime.bulkAddPlaces !== 'function') {
      return { success: false, message: 'Automation runtime not ready' };
    }

    if (statusDiv) {
      statusDiv.innerHTML = '<div class="status-message"><span class="spinner"></span> Processing...</div>';
    }

    var input = Array.isArray(locations) ? locations.join('\n') : String(locations || '');
    var result = await runtime.bulkAddPlaces(input, inputType, dryRun);
    renderResult(statusDiv, result, 'Bulk add processed');
    return result;
  });

  bindIfMissing('handlePopulateMissingWithProgress', async function (statusDiv, dryRun) {
    if (typeof window.handlePopulateMissingFieldsEnhanced === 'function') {
      return window.handlePopulateMissingFieldsEnhanced(statusDiv, dryRun);
    }

    var runtime = getAutomationRuntime();
    if (!runtime || typeof runtime.populateMissingFieldsOnly !== 'function') {
      return { success: false, message: 'Automation runtime not ready' };
    }

    if (statusDiv) {
      statusDiv.innerHTML = '<div class="status-message"><span class="spinner"></span> Processing...</div>';
    }

    var result = await runtime.populateMissingFieldsOnly(dryRun);
    renderResult(statusDiv, result, 'Populate missing complete');
    return result;
  });

  bindIfMissing('handleUpdateHoursWithProgress', async function (statusDiv, dryRun) {
    if (typeof window.handleUpdateHoursOnlyEnhanced === 'function') {
      return window.handleUpdateHoursOnlyEnhanced(statusDiv, dryRun);
    }

    var runtime = getAutomationRuntime();
    if (!runtime || typeof runtime.updateHoursOnly !== 'function') {
      return { success: false, message: 'Automation runtime not ready' };
    }

    if (statusDiv) {
      statusDiv.innerHTML = '<div class="status-message"><span class="spinner"></span> Processing...</div>';
    }

    var result = await runtime.updateHoursOnly(dryRun);
    renderResult(statusDiv, result, 'Hours update complete');
    return result;
  });

  bindIfMissing('handleRefreshPlaceIdsWithProgress', async function (statusDiv, dryRun) {
    var runtime = getAutomationRuntime();
    if (!runtime || typeof runtime.refreshPlaceIds !== 'function') {
      return { success: false, message: 'Automation runtime not ready' };
    }

    if (statusDiv) {
      statusDiv.innerHTML = '<div class="status-message"><span class="spinner"></span> Processing...</div>';
    }

    var result = await runtime.refreshPlaceIds(dryRun);
    renderResult(statusDiv, result, 'Place ID refresh complete');
    return result;
  });

  bindIfMissing('handleAutoTagWithProgress', async function (statusDiv, dryRun) {
    if (typeof window.autoTagAllLocationsUnified !== 'function') {
      return { success: false, message: 'Auto-tag system not ready' };
    }

    if (statusDiv) {
      statusDiv.innerHTML = '<div class="status-message"><span class="spinner"></span> Processing...</div>';
    }

    var result = await window.autoTagAllLocationsUnified({ dryRun: !!dryRun });
    var message = dryRun
      ? 'Preview complete: auto-tag dry run finished'
      : 'Auto-tag complete';
    renderResult(statusDiv, { success: true, message: message, details: result }, message);
    return { success: true, result: result };
  });

  window.__wave1ProgressCompat = {
    version: 'wave1',
    loadedAt: new Date().toISOString(),
    candidate: 'universal-progress-tracking-system.js',
    mode: 'no-delete-alias'
  };

  console.log(logPrefix + ' loaded');
})();

