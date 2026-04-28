/**
 * PERSISTENT DIAGNOSTICS TRACKER
 * =============================
 *
 * Real-time tracking system for data provider health and fallback metrics.
 * Provides a persistent status line in the diagnostics panel showing:
 * - live-provider-unavailable counter
 * - cached-row fallback count
 * - last affected operation context
 *
 * Version: 1.0.0
 * Date: April 27, 2026
 */

(function initPersistentDiagnosticsTracker() {
  'use strict';

  console.log('🔍 Persistent Diagnostics Tracker initializing...');

  // ============================================================
  // GLOBAL TRACKER STATE
  // ============================================================

  window.PersistentDiagnosticsTracker = window.PersistentDiagnosticsTracker || {
    metrics: {
      liveProviderUnavailableCount: 0,
      cachedRowFallbackCount: 0,
      lastAffectedOperation: null,
      lastAffectedOperationTime: null,
      lastAffectedOperationContext: {}
    },

    history: {
      providerEvents: [],
      fallbackEvents: [],
      maxHistorySize: 100
    },

    // Track when live provider becomes unavailable
    recordLiveProviderUnavailable: function(reason, context) {
      this.metrics.liveProviderUnavailableCount += 1;
      const timestamp = new Date().toISOString();

      const event = {
        timestamp,
        reason: String(reason || 'Unknown'),
        context: context || {},
        count: this.metrics.liveProviderUnavailableCount
      };

      this.history.providerEvents.push(event);
      if (this.history.providerEvents.length > this.history.maxHistorySize) {
        this.history.providerEvents.shift();
      }

      console.log('⚠️ [DiagTracker] Live provider unavailable:', {
        count: this.metrics.liveProviderUnavailableCount,
        reason,
        timestamp
      });

      this.updateStatusLine();
      this.dispatchMetricsUpdate();
      return event;
    },

    // Track when we fall back to cached rows
    recordCachedRowFallback: function(operationName, rowsCount, context) {
      this.metrics.cachedRowFallbackCount += 1;
      const timestamp = new Date().toISOString();

      this.metrics.lastAffectedOperation = String(operationName || 'unknown-operation');
      this.metrics.lastAffectedOperationTime = timestamp;
      this.metrics.lastAffectedOperationContext = {
        operationName,
        rowsCount: Number(rowsCount || 0),
        ...context
      };

      const event = {
        timestamp,
        operationName,
        rowsCount: Number(rowsCount || 0),
        context: context || {},
        totalCount: this.metrics.cachedRowFallbackCount
      };

      this.history.fallbackEvents.push(event);
      if (this.history.fallbackEvents.length > this.history.maxHistorySize) {
        this.history.fallbackEvents.shift();
      }

      console.log('📦 [DiagTracker] Cached row fallback recorded:', {
        operation: operationName,
        rows: rowsCount,
        totalCount: this.metrics.cachedRowFallbackCount,
        timestamp
      });

      this.updateStatusLine();
      this.dispatchMetricsUpdate();
      return event;
    },

    // Update the persistent status line
    updateStatusLine: function() {
      const statusEl = document.getElementById('persistentDiagnosticsStatusLine');
      if (!statusEl) return;

      const providerStatus = this.metrics.liveProviderUnavailableCount > 0 ? 'warn' : 'ok';
      const fallbackStatus = this.metrics.cachedRowFallbackCount > 0 ? 'warn' : 'ok';

      const lastOpTime = this.metrics.lastAffectedOperationTime
        ? this.formatRelativeTime(new Date(this.metrics.lastAffectedOperationTime))
        : 'never';

      const html = [
        '<div class="persistent-diag-status-container">',
        '<span class="persistent-diag-metric" data-status="' + providerStatus + '">',
        '<strong>Live Provider:</strong> ',
        this.metrics.liveProviderUnavailableCount,
        ' unavailable</span>',
        '<span class="persistent-diag-metric" data-status="' + fallbackStatus + '">',
        '<strong>Cached Rows:</strong> ',
        this.metrics.cachedRowFallbackCount,
        ' fallbacks</span>',
        '<span class="persistent-diag-metric">',
        '<strong>Last Operation:</strong> ',
        this.metrics.lastAffectedOperation ? this.metrics.lastAffectedOperation + ' (' + lastOpTime + ')' : 'none',
        '</span>',
        '</div>'
      ].join('');

      statusEl.innerHTML = html;
    },

    // Format relative time
    formatRelativeTime: function(date) {
      if (!(date instanceof Date)) return 'unknown';
      const now = Date.now();
      const diff = now - date.getTime();

      if (diff < 1000) return 'just now';
      if (diff < 60000) return Math.floor(diff / 1000) + 's ago';
      if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
      if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';

      return Math.floor(diff / 86400000) + 'd ago';
    },

    // Dispatch custom event for UI updates
    dispatchMetricsUpdate: function() {
      const event = new CustomEvent('diagnostics-metrics-updated', {
        detail: this.getMetrics(),
        bubbles: true,
        cancelable: false
      });
      document.dispatchEvent(event);
    },

    // Get current metrics snapshot
    getMetrics: function() {
      return {
        liveProviderUnavailableCount: this.metrics.liveProviderUnavailableCount,
        cachedRowFallbackCount: this.metrics.cachedRowFallbackCount,
        lastAffectedOperation: this.metrics.lastAffectedOperation,
        lastAffectedOperationTime: this.metrics.lastAffectedOperationTime,
        lastAffectedOperationContext: this.metrics.lastAffectedOperationContext,
        timestamp: new Date().toISOString()
      };
    },

    // Get full history
    getHistory: function() {
      return {
        providerEvents: this.history.providerEvents.slice(),
        fallbackEvents: this.history.fallbackEvents.slice(),
        metrics: this.getMetrics()
      };
    },

    // Reset all metrics
    reset: function() {
      this.metrics.liveProviderUnavailableCount = 0;
      this.metrics.cachedRowFallbackCount = 0;
      this.metrics.lastAffectedOperation = null;
      this.metrics.lastAffectedOperationTime = null;
      this.metrics.lastAffectedOperationContext = {};
      this.history.providerEvents = [];
      this.history.fallbackEvents = [];
      console.log('🔄 [DiagTracker] Metrics reset');
      this.updateStatusLine();
      this.dispatchMetricsUpdate();
    },

    // Export metrics as JSON
    export: function() {
      return JSON.stringify(this.getHistory(), null, 2);
    }
  };

  // ============================================================
  // DIAGNOSTICS STATUS LINE STYLES
  // ============================================================

  function ensureStatusLineStyles() {
    if (document.getElementById('persistentDiagnosticsStatusLineStyles')) return;

    const style = document.createElement('style');
    style.id = 'persistentDiagnosticsStatusLineStyles';
    style.textContent = `
      #persistentDiagnosticsStatusLine {
        padding: 12px 16px;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border-bottom: 2px solid #e2e8f0;
        font-size: 13px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        position: sticky;
        top: 0;
        z-index: 10;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
      }

      .persistent-diag-status-container {
        display: flex;
        gap: 24px;
        flex-wrap: wrap;
        align-items: center;
      }

      .persistent-diag-metric {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: white;
        border-radius: 6px;
        border: 1px solid #cbd5e1;
        color: #475569;
        font-weight: 500;
      }

      .persistent-diag-metric[data-status="ok"] {
        border-color: #bbf7d0;
        background: #f0fdf4;
        color: #047857;
      }

      .persistent-diag-metric[data-status="warn"] {
        border-color: #fed7aa;
        background: #fff7ed;
        color: #b45309;
      }

      .persistent-diag-metric strong {
        font-weight: 700;
        color: inherit;
      }

      @media (max-width: 768px) {
        .persistent-diag-status-container {
          gap: 12px;
          font-size: 12px;
        }

        .persistent-diag-metric {
          padding: 5px 10px;
          font-size: 11px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ============================================================
  // CREATE STATUS LINE MOUNT POINT
  // ============================================================

  function createStatusLineMount() {
    // Check if it already exists
    if (document.getElementById('persistentDiagnosticsStatusLine')) return;

    // Create the mount element
    const mount = document.createElement('div');
    mount.id = 'persistentDiagnosticsStatusLine';
    mount.setAttribute('role', 'status');
    mount.setAttribute('aria-live', 'polite');
    mount.setAttribute('aria-atomic', 'true');

    // Try to insert as first child of diagnosticsHubMount if it exists
    const hubMount = document.getElementById('diagnosticsHubMount');
    if (hubMount && hubMount.parentNode) {
      hubMount.parentNode.insertBefore(mount, hubMount);
    } else {
      // Otherwise append to body
      document.body.appendChild(mount);
    }

    // Initialize status line
    window.PersistentDiagnosticsTracker.updateStatusLine();
  }

  // ============================================================
  // INITIALIZATION
  // ============================================================

  function initialize() {
    ensureStatusLineStyles();

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        createStatusLineMount();
        console.log('✅ Persistent Diagnostics Tracker initialized');
      });
    } else {
      createStatusLineMount();
      console.log('✅ Persistent Diagnostics Tracker initialized');
    }

    // Listen for metrics updates from other systems
    document.addEventListener('diagnostics-metrics-updated', function(event) {
      console.log('📊 Metrics updated:', event.detail);
    });
  }

  initialize();

  console.log('✅ Persistent Diagnostics Tracker ready');
})();

