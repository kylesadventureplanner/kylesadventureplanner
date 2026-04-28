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

