/*
 * Reliability Ops
 * Centralized error pipeline, stuck-state recovery, retry helpers, and diagnostics export.
 */
(function() {
  'use strict';

  const STATE = {
    startedAt: Date.now(),
    activeTab: '',
    lastActionKey: '',
    blockedActions: { disabled: 0, 'in-flight': 0, dedupe: 0 },
    overlayInterceptions: 0,
    errors: [],
    recoveryEvents: []
  };

  const MAX_LOG = 200;
  const BUSY_STALE_MS = 15000;
  const LOADER_STALE_MS = 15000;

  function nowIso() {
    return new Date().toISOString();
  }

  function cappedPush(list, value) {
    list.push(value);
    if (list.length > MAX_LOG) list.shift();
  }

  function getActiveTab() {
    const pane = document.querySelector('.app-tab-pane.active[data-tab]');
    if (pane) return String(pane.getAttribute('data-tab') || '').trim();
    const btn = document.querySelector('.app-tab-btn.active[data-tab]');
    return btn ? String(btn.getAttribute('data-tab') || '').trim() : '';
  }

  function getReadinessState() {
    if (!window.__appReadiness || typeof window.__appReadiness.getStatus !== 'function') {
      return { available: false };
    }
    const status = window.__appReadiness.getStatus() || {};
    return {
      available: true,
      interactiveReady: Boolean(status.interactiveReady),
      dismissed: Boolean(status.dismissed),
      dismissReason: String(status.dismissReason || ''),
      msToInteractiveReady: Number(status.msToInteractiveReady || 0),
      msToDismissed: Number(status.msToDismissed || 0)
    };
  }

  function logRecovery(type, detail) {
    const entry = {
      at: nowIso(),
      type: String(type || 'unknown'),
      activeTab: STATE.activeTab || getActiveTab(),
      detail: detail || {}
    };
    cappedPush(STATE.recoveryEvents, entry);
    console.warn('[ReliabilityRecovery]', entry);
  }

  function buildErrorContext() {
    const readiness = getReadinessState();
    return {
      activeTab: STATE.activeTab || getActiveTab(),
      lastActionKey: STATE.lastActionKey || String(window.__lastActionKey || ''),
      readiness
    };
  }

  function installGlobalErrorPipeline() {
    window.addEventListener('error', (event) => {
      const entry = {
        at: nowIso(),
        type: 'error',
        message: String(event && event.message || 'Unknown error'),
        source: String(event && event.filename || ''),
        line: Number(event && event.lineno || 0),
        column: Number(event && event.colno || 0),
        stack: event && event.error && event.error.stack ? String(event.error.stack).slice(0, 2000) : '',
        context: buildErrorContext()
      };
      cappedPush(STATE.errors, entry);
    });

    window.addEventListener('unhandledrejection', (event) => {
      const reason = event && event.reason;
      const entry = {
        at: nowIso(),
        type: 'unhandledrejection',
        message: String(reason && reason.message ? reason.message : reason || 'Unhandled rejection'),
        stack: reason && reason.stack ? String(reason.stack).slice(0, 2000) : '',
        context: buildErrorContext()
      };
      cappedPush(STATE.errors, entry);
    });
  }

  function recoverStuckStates() {
    // 1) lingering loader overlay
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      const cs = window.getComputedStyle(loadingOverlay);
      const visible = cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity || '1') > 0.05;
      const startupLocked = loadingOverlay.dataset && loadingOverlay.dataset.startupLock === '1';
      if (visible && !startupLocked) {
        loadingOverlay.style.display = 'none';
        loadingOverlay.style.pointerEvents = 'none';
        logRecovery('overlay-cleared', { id: 'loadingOverlay' });
      }
    }

    // 2) stale busy buttons
    const busyButtons = document.querySelectorAll('button[data-busy="1"]');
    busyButtons.forEach((button) => {
      const since = Number(button.dataset && button.dataset.busySince || 0);
      const age = since ? (Date.now() - since) : 0;
      if (!since || age > BUSY_STALE_MS) {
        if (button.dataset) {
          delete button.dataset.busy;
          delete button.dataset.busySince;
        }
        logRecovery('busy-cleared', {
          id: button.id || '',
          ageMs: age
        });
      }
    });

    // 3) stale tab loading classes/indicators
    const panes = document.querySelectorAll('.app-tab-pane.tab-is-loading');
    panes.forEach((pane) => {
      const indicator = pane.querySelector('.tab-loading-indicator');
      const createdAt = Number(indicator && indicator.dataset && indicator.dataset.createdAt || 0);
      const age = createdAt ? (Date.now() - createdAt) : 0;
      if (!indicator || age > LOADER_STALE_MS) {
        pane.classList.remove('tab-is-loading');
        if (indicator) indicator.remove();
        logRecovery('pane-loading-cleared', {
          tab: String(pane.getAttribute('data-tab') || ''),
          ageMs: age
        });
      }
    });
  }

  function installStuckStateLoop() {
    window.setInterval(recoverStuckStates, 3000);
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function runWithRetry(config) {
    const options = config || {};
    const operation = typeof options.operation === 'function' ? options.operation : null;
    if (!operation) throw new Error('runWithRetry requires an operation function');

    const kind = String(options.kind || 'read').toLowerCase();
    const opName = String(options.operationName || 'operation');
    const retries = Math.max(0, Number(options.retries) || 0);
    const backoffMs = Math.max(100, Number(options.backoffMs) || 350);
    const idempotent = Boolean(options.idempotent);

    const maxAttempts = kind === 'write' && !idempotent ? 1 : (1 + retries);
    let attempt = 0;
    let lastError = null;

    while (attempt < maxAttempts) {
      attempt += 1;
      try {
        const value = await operation();
        if (attempt > 1 && typeof window.showToast === 'function') {
          window.showToast(`Recovered: ${opName}`, 'success', 1800);
        }
        return value;
      } catch (error) {
        lastError = error;
        if (attempt >= maxAttempts) break;
        if (typeof window.showToast === 'function') {
          window.showToast(`Retrying ${opName} (${attempt + 1}/${maxAttempts})...`, 'info', 1200);
        }
        await sleep(backoffMs * Math.pow(2, attempt - 1));
      }
    }

    if (typeof window.showToast === 'function') {
      window.showToast(`Failed: ${opName}`, 'error', 2200);
    }
    throw lastError || new Error(`${opName} failed`);
  }

  function installActionEventHooks() {
    window.addEventListener('reliability:action-start', (event) => {
      const key = event && event.detail && event.detail.actionKey ? String(event.detail.actionKey) : '';
      if (!key) return;
      STATE.lastActionKey = key;
      window.__lastActionKey = key;
    });

    window.addEventListener('reliability:action-blocked', (event) => {
      const reason = event && event.detail && event.detail.reason ? String(event.detail.reason) : 'unknown';
      if (Object.prototype.hasOwnProperty.call(STATE.blockedActions, reason)) {
        STATE.blockedActions[reason] += 1;
      }
    });

    window.addEventListener('reliability:overlay-interception', () => {
      STATE.overlayInterceptions += 1;
    });

    window.addEventListener('app:tab-switched', (event) => {
      const tabId = event && event.detail && event.detail.tabId ? String(event.detail.tabId) : '';
      if (tabId) STATE.activeTab = tabId;
    });
  }

  function buildReliabilitySnapshot() {
    const readiness = getReadinessState();
    return {
      generatedAt: nowIso(),
      activeTab: STATE.activeTab || getActiveTab(),
      lastActionKey: STATE.lastActionKey || String(window.__lastActionKey || ''),
      blockedActions: { ...STATE.blockedActions },
      overlayInterceptions: STATE.overlayInterceptions,
      startupTiming: readiness,
      errorCount: STATE.errors.length,
      recoveryEventCount: STATE.recoveryEvents.length,
      recentErrors: STATE.errors.slice(-20),
      recentRecoveryEvents: STATE.recoveryEvents.slice(-20)
    };
  }

  window.__reliabilityStatus = function() {
    return buildReliabilitySnapshot();
  };

  window.ReliabilityAsync = {
    retryRead(operationName, operation, options = {}) {
      return runWithRetry({
        operationName,
        operation,
        kind: 'read',
        retries: options.retries != null ? options.retries : 2,
        backoffMs: options.backoffMs != null ? options.backoffMs : 350
      });
    },
    retryIdempotentWrite(operationName, operation, options = {}) {
      return runWithRetry({
        operationName,
        operation,
        kind: 'write',
        idempotent: true,
        retries: options.retries != null ? options.retries : 1,
        backoffMs: options.backoffMs != null ? options.backoffMs : 450
      });
    },
    runWithRetry
  };

  window.exportReliabilityDiagnosticsBundle = function(options = {}) {
    const probeIds = Array.isArray(options.probeIds) && options.probeIds.length
      ? options.probeIds
      : ['natureChallengeRefreshBtn', 'birdsExploreBtn', 'birdsOverviewCommandRunBtn', 'bikeRefreshBtn', 'bikeTrailExplorerBtn'];

    const blockerProbes = {};
    if (window.ButtonReliability && typeof window.ButtonReliability.probeClickPath === 'function') {
      probeIds.forEach((id) => {
        try {
          blockerProbes[id] = window.ButtonReliability.probeClickPath(id);
        } catch (error) {
          blockerProbes[id] = { ok: false, reason: 'probe-failed', message: String(error && error.message || error) };
        }
      });
    }

    const bundle = {
      exportedAt: nowIso(),
      reliabilityStatus: buildReliabilitySnapshot(),
      startupTimingSnapshot: window.__appReadiness && typeof window.__appReadiness.getTelemetry === 'function'
        ? window.__appReadiness.getTelemetry()
        : null,
      recentClickTraces: typeof window.getRecentBirdClickTraceSnapshot === 'function'
        ? window.getRecentBirdClickTraceSnapshot()
        : null,
      buttonReliabilityLog: window.ButtonReliability && typeof window.ButtonReliability.getEventLog === 'function'
        ? window.ButtonReliability.getEventLog(80)
        : [],
      blockingOverlays: window.ButtonReliability && typeof window.ButtonReliability.detectBlockingOverlays === 'function'
        ? window.ButtonReliability.detectBlockingOverlays().map((item) => ({ id: item.id, classes: item.classes, area: item.area }))
        : [],
      blockerProbes
    };

    const shouldDownload = options.download !== false;
    if (shouldDownload) {
      const text = JSON.stringify(bundle, null, 2);
      const blob = new Blob([text], { type: 'application/json' });
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `reliability-diagnostics-${stamp}.json`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      if (typeof window.showToast === 'function') {
        window.showToast('Downloaded reliability diagnostics bundle.', 'success', 2200);
      }
    }

    return bundle;
  };

  installGlobalErrorPipeline();
  installActionEventHooks();
  installStuckStateLoop();
})();

