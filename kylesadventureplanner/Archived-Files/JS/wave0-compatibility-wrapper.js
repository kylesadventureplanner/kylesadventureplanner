/**
 * Wave 0 Compatibility Wrapper (no-delete, no-rewrite)
 *
 * Goals:
 * - Preserve legacy global entry points if a future consolidation changes names.
 * - Avoid changing existing behavior by only filling missing aliases.
 * - Run last in the fix stack so it can detect final resolved handlers.
 */
(function () {
  var logPrefix = '[wave0-compat]';

  function bindIfMissing(aliasName, targetName) {
    if (typeof window[aliasName] === 'function') {
      return;
    }
    if (typeof window[targetName] !== 'function') {
      return;
    }

    window[aliasName] = function () {
      return window[targetName].apply(window, arguments);
    };

    console.log(logPrefix + ' bound missing alias:', aliasName, '->', targetName);
  }

  // Edit mode alias safety: older callers may use openEditMode().
  bindIfMissing('openEditMode', 'openEditModeWindow');

  // Find-near-me alias safety: preserve launch entry point if renamed later.
  bindIfMissing('startFindNearMeLegacy', 'startFindNearMe');

  // City viewer alias safety: only fill aliases if final stack did not define them.
  bindIfMissing('openCityViewerInTab', 'openCityViewerWindow');
  bindIfMissing('viewCityDetails', 'openCityViewerWindow');
  bindIfMissing('showCityViewer', 'openCityViewerWindow');

  // Expose metadata for audit docs and runtime debugging.
  window.__wave0Compat = {
    version: 'wave0',
    loadedAt: new Date().toISOString(),
    note: 'No-delete compatibility alias layer loaded last.'
  };

  console.log(logPrefix + ' wrapper loaded');
})();

