/**
 * DIAGNOSTICS REPORTING UTILITIES
 * ================================
 *
 * Helper functions for application code to report diagnostic events:
 * - Data provider unavailability
 * - Cached row fallbacks
 * - Operation context
 *
 * Usage examples:
 *
 *   // Report a live provider becoming unavailable
 *   DiagnosticsReport.providerUnavailable('city-viewer', 'Network timeout', {
 *     endpoint: '/api/cities',
 *     statusCode: 0
 *   });
 *
 *   // Report a fallback to cached rows
 *   DiagnosticsReport.cachedRowFallback('load-adventure-details', 50, {
 *     source: 'indexedDB',
 *     cacheAge: '5m'
 *   });
 *
 * Version: 1.0.0
 * Date: April 27, 2026
 */

window.DiagnosticsReport = window.DiagnosticsReport || (function() {
  'use strict';

  var GOOGLE_DIAG_STORAGE_KEY = '__google_api_diagnostics_v1';

  function safeJsonParse(raw, fallback) {
    try {
      var parsed = JSON.parse(String(raw || ''));
      return parsed == null ? fallback : parsed;
    } catch (_error) {
      return fallback;
    }
  }

  function readGoogleDiagStore() {
    var fallback = {
      keyStatus: null,
      lastHealthCheck: null,
      recentRuns: [],
      updatedAt: ''
    };
    try {
      var raw = window.localStorage ? window.localStorage.getItem(GOOGLE_DIAG_STORAGE_KEY) : '';
      var parsed = safeJsonParse(raw, fallback);
      return parsed && typeof parsed === 'object'
        ? {
            keyStatus: parsed.keyStatus || null,
            lastHealthCheck: parsed.lastHealthCheck || null,
            recentRuns: Array.isArray(parsed.recentRuns) ? parsed.recentRuns.slice(0, 12) : [],
            updatedAt: String(parsed.updatedAt || '')
          }
        : fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function writeGoogleDiagStore(store) {
    var payload = store && typeof store === 'object' ? store : readGoogleDiagStore();
    payload.updatedAt = new Date().toISOString();
    try {
      if (window.localStorage) {
        window.localStorage.setItem(GOOGLE_DIAG_STORAGE_KEY, JSON.stringify(payload));
      }
    } catch (_error) {
      // Best effort only.
    }
    window.__googleApiDiagnosticsSnapshot = payload;
    return payload;
  }

  function normalizeGoogleApiKeyStatus(rawKey) {
    var key = String(rawKey == null ? '' : rawKey).trim();
    var upper = key.toUpperCase();
    var looksMissing = !key;
    var looksPlaceholder = !!key && (
      upper.indexOf('YOUR_GOOGLE') >= 0 ||
      upper.indexOf('YOUR_API_KEY') >= 0 ||
      upper.indexOf('PLACEHOLDER') >= 0 ||
      upper.indexOf('REPLACE_THIS') >= 0 ||
      upper.indexOf('REPLACE WITH YOUR') >= 0 ||
      upper.indexOf('INSERT_KEY_HERE') >= 0 ||
      upper.indexOf('PASTE_KEY_HERE') >= 0
    );
    var state = looksMissing ? 'missing' : (looksPlaceholder ? 'placeholder' : 'configured');
    var preview = key
      ? (key.length > 12 ? (key.slice(0, 6) + '…' + key.slice(-4)) : key)
      : '';
    return {
      state: state,
      configured: state === 'configured',
      missing: state === 'missing',
      placeholder: state === 'placeholder',
      preview: preview,
      detail: state === 'configured'
        ? 'A non-placeholder Google API key is present on window.GOOGLE_PLACES_API_KEY.'
        : (state === 'placeholder'
          ? 'A placeholder-style Google API key string is present. Replace it with a real key before relying on live Places calls.'
          : 'No Google API key is present on window.GOOGLE_PLACES_API_KEY.'),
      checkedAt: new Date().toISOString()
    };
  }

  function normalizeGoogleUpdateMode(rawMode, fallbackMode) {
    var fallback = String(fallbackMode || 'missing-only').trim().toLowerCase() === 'refresh-all'
      ? 'refresh-all'
      : 'missing-only';
    var mode = String(rawMode || '').trim().toLowerCase();
    if (!mode) return fallback;
    return mode === 'refresh-all' ? 'refresh-all' : 'missing-only';
  }

  function getGoogleUpdateModeLabel(rawMode) {
    return normalizeGoogleUpdateMode(rawMode) === 'refresh-all'
      ? 'refresh all values'
      : 'missing / blank values only';
  }

  function getGoogleOperationModeGuide(operationName) {
    var key = String(operationName || '').trim().toLowerCase();
    if (key === 'populate-missing-fields') {
      return {
        expectedDefaultMode: 'missing-only',
        expectedDefaultLabel: getGoogleUpdateModeLabel('missing-only'),
        note: 'Use refresh-all only when you intentionally want to overwrite existing Google-backed fields.'
      };
    }
    if (key === 'update-hours-only') {
      return {
        expectedDefaultMode: 'refresh-all',
        expectedDefaultLabel: getGoogleUpdateModeLabel('refresh-all'),
        note: 'Switch to missing-only if you only want to backfill blank hours entries.'
      };
    }
    if (key === 'refresh-place-ids' || key === 'search-missing-place-ids') {
      return {
        expectedDefaultMode: key === 'search-missing-place-ids' ? 'missing-only' : 'refresh-all',
        expectedDefaultLabel: getGoogleUpdateModeLabel(key === 'search-missing-place-ids' ? 'missing-only' : 'refresh-all'),
        note: key === 'search-missing-place-ids'
          ? 'This path is intended for missing-ID backfills only.'
          : 'Use missing-only for targeted Place ID backfill; use refresh-all to re-check every row.'
      };
    }
    return {
      expectedDefaultMode: 'missing-only',
      expectedDefaultLabel: getGoogleUpdateModeLabel('missing-only'),
      note: 'Mode expectations are not explicitly configured for this operation yet.'
    };
  }

  function summarizeGoogleRun(run) {
    var safe = run && typeof run === 'object' ? run : {};
    var operation = String(safe.operation || 'unknown').trim() || 'unknown';
    var modeGuide = getGoogleOperationModeGuide(operation);
    var normalizedMode = normalizeGoogleUpdateMode(safe.mode, modeGuide.expectedDefaultMode);
    var totals = {
      totalRows: Math.max(0, Number(safe.totals && safe.totals.totalRows) || 0),
      updatedRows: Math.max(0, Number(safe.totals && safe.totals.updatedRows) || 0),
      skippedRows: Math.max(0, Number(safe.totals && safe.totals.skippedRows) || 0),
      errorRows: Math.max(0, Number(safe.totals && safe.totals.errorRows) || 0),
      persistedRows: Math.max(0, Number(safe.totals && safe.totals.persistedRows) || 0)
    };
    var googleApi = safe.googleApi && typeof safe.googleApi === 'object' ? safe.googleApi : {};
    var attemptedRows = Math.max(0, Number(googleApi.attemptedRows) || 0);
    var isSuccessfulNoOp = !safe.dryRun
      && totals.updatedRows === 0
      && totals.errorRows === 0
      && (totals.totalRows > 0 || attemptedRows > 0)
      && (totals.skippedRows > 0 || attemptedRows > 0);
    var summaryText = String(safe.summary || '').trim();
    if (isSuccessfulNoOp) {
      summaryText = 'No changes needed (already up to date).';
    }
    return {
      operation: operation,
      mode: normalizedMode,
      modeLabel: getGoogleUpdateModeLabel(normalizedMode),
      modeGuide: modeGuide,
      dryRun: !!safe.dryRun,
      target: String(safe.target || '').trim(),
      success: safe.success !== false,
      summary: summaryText,
      totals: totals,
      skipReasonCounts: safe.skipReasonCounts && typeof safe.skipReasonCounts === 'object' ? safe.skipReasonCounts : {},
      googleApi: googleApi,
      samples: Array.isArray(safe.samples) ? safe.samples.slice(0, 5) : [],
      timestamp: String(safe.timestamp || new Date().toISOString())
    };
  }

  return {
    /**
     * Report that a live data provider became unavailable
     * @param {string} providerName - Name of the provider/service (e.g., 'places-api', 'excel-sync')
     * @param {string} reason - Why the provider is unavailable (e.g., 'Network timeout', 'Invalid credentials')
     * @param {object} context - Optional context object with additional details
     */
    providerUnavailable: function(providerName, reason, context) {
      if (window.PersistentDiagnosticsTracker) {
        return window.PersistentDiagnosticsTracker.recordLiveProviderUnavailable(
          String(providerName || 'unknown') + ': ' + String(reason || 'no reason provided'),
          {
            provider: providerName,
            reason: reason,
            ...context
          }
        );
      }
      return null;
    },

    /**
     * Report that we're falling back to cached rows instead of live data
     * @param {string} operationName - Name of the operation (e.g., 'load-adventures', 'sync-challenge')
     * @param {number} rowsCount - Number of rows being served from cache
     * @param {object} context - Optional context object with cache details, source, etc.
     */
    cachedRowFallback: function(operationName, rowsCount, context) {
      if (window.PersistentDiagnosticsTracker) {
        return window.PersistentDiagnosticsTracker.recordCachedRowFallback(
          operationName,
          rowsCount,
          context
        );
      }
      return null;
    },

    classifyGoogleApiKey: function(rawKey) {
      return normalizeGoogleApiKeyStatus(rawKey);
    },

    normalizeGoogleUpdateMode: function(rawMode, fallbackMode) {
      return normalizeGoogleUpdateMode(rawMode, fallbackMode);
    },

    describeGoogleUpdateMode: function(rawMode) {
      return getGoogleUpdateModeLabel(rawMode);
    },

    getGoogleOperationModeGuide: function(operationName) {
      return getGoogleOperationModeGuide(operationName);
    },

    getGoogleApiKeyStatus: function() {
      var current = normalizeGoogleApiKeyStatus(window.GOOGLE_PLACES_API_KEY || '');
      var store = readGoogleDiagStore();
      store.keyStatus = current;
      writeGoogleDiagStore(store);
      return current;
    },

    recordPlacesHealthCheck: function(result) {
      var safe = result && typeof result === 'object' ? result : {};
      var store = readGoogleDiagStore();
      store.keyStatus = normalizeGoogleApiKeyStatus(window.GOOGLE_PLACES_API_KEY || '');
      store.lastHealthCheck = {
        ok: !!safe.ok,
        status: String(safe.status || '').trim() || 'unknown',
        summary: String(safe.summary || '').trim(),
        query: String(safe.query || '').trim(),
        placeIdUsed: String(safe.placeIdUsed || '').trim(),
        durationMs: Math.max(0, Number(safe.durationMs) || 0),
        startedAt: String(safe.startedAt || '').trim(),
        finishedAt: String(safe.finishedAt || '').trim(),
        steps: Array.isArray(safe.steps) ? safe.steps.slice(0, 10) : []
      };
      writeGoogleDiagStore(store);
      return store.lastHealthCheck;
    },

    recordGoogleAutomationRun: function(operationName, payload) {
      var safePayload = payload && typeof payload === 'object' ? payload : {};
      var store = readGoogleDiagStore();
      store.keyStatus = normalizeGoogleApiKeyStatus(window.GOOGLE_PLACES_API_KEY || '');
      var normalizedRun = summarizeGoogleRun({
        operation: operationName,
        ...safePayload,
        timestamp: safePayload.timestamp || new Date().toISOString()
      });
      store.recentRuns.unshift(normalizedRun);
      store.recentRuns = store.recentRuns.slice(0, 12);
      writeGoogleDiagStore(store);
      return normalizedRun;
    },

    getGoogleApiSnapshot: function() {
      var store = readGoogleDiagStore();
      if (!store.keyStatus) {
        store.keyStatus = normalizeGoogleApiKeyStatus(window.GOOGLE_PLACES_API_KEY || '');
        writeGoogleDiagStore(store);
      }
      return store;
    },

    /**
     * Get current diagnostic metrics
     * @returns {object} Current metrics snapshot
     */
    getMetrics: function() {
      if (window.PersistentDiagnosticsTracker) {
        return window.PersistentDiagnosticsTracker.getMetrics();
      }
      return null;
    },

    /**
     * Get full diagnostic history
     * @returns {object} Complete history of events and metrics
     */
    getHistory: function() {
      if (window.PersistentDiagnosticsTracker) {
        return window.PersistentDiagnosticsTracker.getHistory();
      }
      return null;
    },

    /**
     * Export diagnostics as JSON for debugging
     * @returns {string} JSON string of full history
     */
    export: function() {
      if (window.PersistentDiagnosticsTracker) {
        return window.PersistentDiagnosticsTracker.export();
      }
      return null;
    },

    /**
     * Reset all diagnostics metrics
     */
    reset: function() {
      if (window.PersistentDiagnosticsTracker) {
        return window.PersistentDiagnosticsTracker.reset();
      }
    }
  };
})();

console.log('✅ Diagnostics Reporting Utilities loaded');

