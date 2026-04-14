(function initializePwaOfflineSystem() {
  'use strict';

  var DB_NAME = 'kafOfflineDb';
  var DB_VERSION = 1;
  var STORE_QUEUE = 'writeQueue';
  var LAST_PACK_KEY = 'kafOfflinePackLastPreparedAt';
  var SERVICE_WORKER_PATH = new URL('sw.js', window.location.href).pathname;
  var OFFLINE_PACK_ASSETS = [
    '/',
    '/index.html',
    '/manifest.webmanifest',
    '/CSS/design-tokens.css',
    '/CSS/components.css',
    '/CSS/utilities.css',
    '/CSS/browse-page.css',
    '/CSS/edit-page.css',
    '/CSS/bike-details-window.css',
    '/CSS/mobile-standalone-enhancements.css',
    '/JS%20Files/tab-content-loader.js',
    '/JS%20Files/visited-locations-tab-system.js',
    '/JS%20Files/nature-challenge-tab-system.js',
    '/JS%20Files/pwa-offline-system.js',
    '/HTML%20Files/tabs/visited-locations-tab.html',
    '/HTML%20Files/tabs/nature-challenge-tab.html',
    '/HTML%20Files/tabs/bike-trails-tab.html',
    '/HTML%20Files/tabs/birding-locations-tab.html',
    '/HTML%20Files/tabs/household-tools-tab.html',
    '/HTML%20Files/tabs/recipes-tab.html',
    '/HTML%20Files/tabs/garden-planner-tab.html',
    '/HTML%20Files/tabs/budget-planner-tab.html',
    '/HTML%20Files/adventure-details-window.html',
    '/HTML%20Files/bike-details-window.html',
    '/HTML%20Files/city-viewer-window.html',
    '/HTML%20Files/trail-explorer-window.html',
    '/HTML%20Files/find-near-me-window.html',
    '/HTML%20Files/offline-pack-health.html',
    '/data/nature-challenge-birds.tsv'
  ];

  var status = {
    online: navigator.onLine,
    swReady: false,
    pendingCount: 0,
    syncing: false,
    failedCount: 0,
    replayState: 'idle',
    lastSyncAt: '',
    lastPackAt: localStorage.getItem(LAST_PACK_KEY) || ''
  };

  var listeners = [];
  var flushTimer = null;
  var processorMap = Object.create(null);
  var plannerSaveWrapperInstalled = false;
  var deferredInstallPrompt = null;
  var DISMISS_INSTALL_KEY = 'kafInstallPromptDismissed';
  var swRegistrationPromise = null;
  var offlineModeDelegatedBound = false;
  var APP_VERSION = '2026.04.09.1';
  var lastVersionBannerKey = '';

  function requestServiceWorkerVersion(timeoutMs) {
    if (!('serviceWorker' in navigator)) return Promise.resolve(null);
    var controller = navigator.serviceWorker.controller;
    if (!controller || typeof MessageChannel !== 'function') return Promise.resolve(null);

    return new Promise(function (resolve) {
      var settled = false;
      var channel = new MessageChannel();
      var timerId = window.setTimeout(function () {
        if (settled) return;
        settled = true;
        resolve(null);
      }, Number(timeoutMs || 0) > 0 ? Number(timeoutMs) : 1200);

      channel.port1.onmessage = function (event) {
        if (settled) return;
        settled = true;
        window.clearTimeout(timerId);
        resolve(event && event.data ? event.data : null);
      };

      try {
        controller.postMessage({ type: 'GET_SW_VERSION' }, [channel.port2]);
      } catch (_error) {
        if (settled) return;
        settled = true;
        window.clearTimeout(timerId);
        resolve(null);
      }
    });
  }

  function logVersionBanner(source) {
    var controller = ('serviceWorker' in navigator) ? navigator.serviceWorker.controller : null;
    var controllerUrl = controller && controller.scriptURL ? String(controller.scriptURL) : 'none';
    requestServiceWorkerVersion(1200)
      .then(function (swInfo) {
        var swVersion = swInfo && swInfo.swVersion ? String(swInfo.swVersion) : 'unknown';
        var shellCache = swInfo && swInfo.cacheVersion ? String(swInfo.cacheVersion) : 'unknown';
        var key = [APP_VERSION, swVersion, shellCache, controllerUrl].join('|');
        if (key === lastVersionBannerKey) return;
        lastVersionBannerKey = key;
        console.info('[KAP Version] app=%s sw=%s shell=%s source=%s controller=%s',
          APP_VERSION,
          swVersion,
          shellCache,
          String(source || 'startup'),
          controllerUrl
        );
      })
      .catch(function () {
        var key = [APP_VERSION, 'unknown', 'unknown', controllerUrl].join('|');
        if (key === lastVersionBannerKey) return;
        lastVersionBannerKey = key;
        console.info('[KAP Version] app=%s sw=%s shell=%s source=%s controller=%s',
          APP_VERSION,
          'unknown',
          'unknown',
          String(source || 'startup'),
          controllerUrl
        );
      });
  }

  function emitStatus() {
    listeners.forEach(function (listener) {
      try {
        listener({ ...status });
      } catch (_error) {
        // Keep status stream resilient.
      }
    });
    renderStatusBadges();
    renderQueueConflictPanels();
  }

  function shouldShowInstallPrompt() {
    if (!deferredInstallPrompt) return false;
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return false;
    if (window.navigator && window.navigator.standalone === true) return false;
    return localStorage.getItem(DISMISS_INSTALL_KEY) !== '1';
  }

  function renderInstallBanner() {
    var banner = document.getElementById('offlineInstallBanner');
    if (!banner) return;
    banner.hidden = !shouldShowInstallPrompt();
    renderInstallActions();
  }

  function renderInstallActions() {
    var installBtn = document.getElementById('offlineModeInstallBtn');
    var statusEl = document.getElementById('offlineModeInstallStatus');
    var standalone = Boolean(
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      (window.navigator && window.navigator.standalone === true)
    );
    var installReady = shouldShowInstallPrompt();

    if (installBtn) {
      installBtn.hidden = !installReady;
      installBtn.disabled = !installReady;
    }

    if (!statusEl) return;
    if (standalone) {
      statusEl.textContent = 'This app is already installed or running in standalone mode.';
      return;
    }
    if (installReady) {
      statusEl.textContent = 'Install is ready on this device. Use Install App for faster launches and better offline support.';
      return;
    }
    statusEl.textContent = 'Install will appear here automatically when this browser exposes a supported app-install prompt.';
  }

  function waitForServiceWorkerControl(timeoutMs) {
    if (!('serviceWorker' in navigator)) return Promise.resolve(false);
    if (navigator.serviceWorker.controller) return Promise.resolve(true);

    return new Promise(function (resolve) {
      var settled = false;
      var timeoutId = window.setTimeout(function () {
        finish(Boolean(navigator.serviceWorker.controller));
      }, Number(timeoutMs || 0) > 0 ? Number(timeoutMs) : 5000);

      function finish(value) {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeoutId);
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
        resolve(Boolean(value));
      }

      function handleControllerChange() {
        finish(Boolean(navigator.serviceWorker.controller));
      }

      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    });
  }

  function ensureServiceWorkerRegistration() {
    if (!('serviceWorker' in navigator)) return Promise.resolve(null);
    if (!swRegistrationPromise) {
      swRegistrationPromise = navigator.serviceWorker.register(SERVICE_WORKER_PATH).catch(function (error) {
        swRegistrationPromise = null;
        throw error;
      });
    }
    return swRegistrationPromise;
  }

  function ensureServiceWorkerReady(timeoutMs) {
    if (!('serviceWorker' in navigator)) return Promise.resolve(false);

    return ensureServiceWorkerRegistration()
      .then(function () {
        return Promise.race([
          navigator.serviceWorker.ready.then(function (registration) {
            return registration;
          }),
          new Promise(function (resolve) {
            window.setTimeout(function () {
              resolve(null);
            }, Number(timeoutMs || 0) > 0 ? Number(timeoutMs) : 5000);
          })
        ]);
      })
      .then(function (_registration) {
        return waitForServiceWorkerControl(timeoutMs).then(function (controlled) {
          status.swReady = Boolean(controlled || navigator.serviceWorker.controller);
          emitStatus();
          return status.swReady;
        });
      })
      .catch(function () {
        status.swReady = false;
        emitStatus();
        return false;
      });
  }

  function getActiveTabId() {
    var activeBtn = document.querySelector('.app-tab-btn.active[data-tab]');
    return activeBtn ? String(activeBtn.getAttribute('data-tab') || '') : '';
  }

  function syncOfflineModeButtonState() {
    var isActive = getActiveTabId() === 'offline-mode';
    var button = document.getElementById('offlineModeBtn');
    if (!button) return;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  }

  function dismissBlockingOverlays() {
    if (typeof window.closeRowDetailModal === 'function') {
      try {
        window.closeRowDetailModal();
      } catch (_error) {
        // Fall through to direct DOM cleanup below.
      }
    }

    ['rowDetailModal', 'rowDetailModalBackdrop'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('visible');
      el.style.display = 'none';
      el.style.pointerEvents = 'none';
    });
  }

  function isOfflineDiagnosticsModeEnabled() {
    if (window.__offlineModeDiagnostics === true || window.__offlineDiagnostics === true) return true;
    var params = new URL(window.location.href).searchParams;
    var flag = String(params.get('offlineDebug') || params.get('offlineDiag') || '').trim().toLowerCase();
    return flag === '1' || flag === 'true' || flag === 'on' || flag === 'yes';
  }

  function normalizeOfflineModeOpenSource(options) {
    var rawSource = typeof options === 'string'
      ? options
      : (options && typeof options === 'object' ? options.source : '');
    return String(rawSource || '').trim() || 'programmatic';
  }

  function buildOfflineDebugDetail(source, detail) {
    var parts = ['source=' + normalizeOfflineModeOpenSource(source)];
    var detailText = String(detail || '').trim();
    if (detailText) parts.push(detailText);
    return parts.join(' | ');
  }

  function syncOfflineDebugToolsVisibility() {
    var tools = document.getElementById('offlineModeDebugTools');
    var indicator = document.getElementById('offlineModeDebugIndicator');
    var copyBtn = document.getElementById('offlineModeDebugCopyBtn');
    var enabled = isOfflineDiagnosticsModeEnabled();
    var hasText = Boolean(indicator && String(indicator.textContent || '').trim());
    var shouldShow = enabled && hasText;

    if (tools) tools.hidden = !shouldShow;
    if (indicator) indicator.hidden = !shouldShow;
    if (copyBtn) {
      copyBtn.hidden = !shouldShow;
      copyBtn.disabled = !shouldShow;
    }
  }

  function copyOfflineDebugIndicatorText() {
    var indicator = document.getElementById('offlineModeDebugIndicator');
    var text = indicator ? String(indicator.textContent || '').trim() : '';
    if (!text) {
      if (typeof window.showToast === 'function') {
        window.showToast('No Offline debug message is available to copy yet.', 'info', 1800);
      }
      return Promise.resolve(false);
    }

    return Promise.resolve().then(function () {
      if (navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        return navigator.clipboard.writeText(text);
      }

      var probe = document.createElement('textarea');
      probe.value = text;
      probe.setAttribute('readonly', 'readonly');
      probe.style.position = 'fixed';
      probe.style.top = '-9999px';
      document.body.appendChild(probe);
      probe.select();
      document.execCommand('copy');
      document.body.removeChild(probe);
      return true;
    }).then(function () {
      if (typeof window.showToast === 'function') {
        window.showToast('Offline debug details copied.', 'success', 2000);
      }
      return true;
    }).catch(function () {
      if (typeof window.showToast === 'function') {
        window.showToast('Unable to copy Offline debug details on this device.', 'warning', 2200);
      }
      return false;
    });
  }

  function renderOfflineDebugIndicator(stage, detail) {
    var indicator = document.getElementById('offlineModeDebugIndicator');
    if (!indicator) return;
    if (!isOfflineDiagnosticsModeEnabled()) {
      indicator.textContent = '';
      syncOfflineDebugToolsVisibility();
      return;
    }

    var activeTab = getActiveTabId() || 'none';
    var timestamp = new Date().toLocaleTimeString();
    var detailText = String(detail || '').trim();
    indicator.textContent = [
      '[Offline Debug ' + timestamp + ']',
      stage,
      'activeTab=' + activeTab,
      'tabLoader=' + (window.tabLoader && typeof window.tabLoader.switchTab === 'function' ? 'ready' : 'fallback')
    ].concat(detailText ? [detailText] : []).join(' | ');
    syncOfflineDebugToolsVisibility();
  }

  function openOfflineModePage(options) {
    var openSource = normalizeOfflineModeOpenSource(options);
    renderOfflineDebugIndicator('openOfflineModePage() triggered', buildOfflineDebugDetail(openSource, 'start'));
    dismissBlockingOverlays();

    var currentTab = getActiveTabId();
    if (currentTab && currentTab !== 'offline-mode') {
      window.__offlineModePreviousTab = currentTab;
    }

    if (window.tabLoader && typeof window.tabLoader.switchTab === 'function') {
      window.tabLoader.switchTab('offline-mode', {
        syncUrl: true,
        historyMode: 'push',
        source: 'offline-mode-open:' + openSource
      });
      syncOfflineModeButtonState();
      renderOfflineDebugIndicator('openOfflineModePage() tab switch attempted', buildOfflineDebugDetail(openSource, 'path=tabLoader.switchTab'));
      return true;
    }

    var url = new URL(window.location.href);
    url.searchParams.set('tab', 'offline-mode');
    renderOfflineDebugIndicator('openOfflineModePage() location fallback', buildOfflineDebugDetail(openSource, 'path=window.location.href'));
    window.location.href = url.toString();
    return false;
  }

  function closeOfflineModePage() {
    var previousTab = String(window.__offlineModePreviousTab || '').trim();
    if (!previousTab || previousTab === 'offline-mode') previousTab = 'adventure-planner';

    if (window.tabLoader && typeof window.tabLoader.switchTab === 'function') {
      window.tabLoader.switchTab(previousTab, { syncUrl: true, historyMode: 'push', source: 'offline-mode-close' });
      syncOfflineModeButtonState();
      return true;
    }

    var url = new URL(window.location.href);
    url.searchParams.set('tab', previousTab);
    window.location.href = url.toString();
    return false;
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') return function () {};
    listeners.push(listener);
    listener({ ...status });
    return function () {
      listeners = listeners.filter(function (item) { return item !== listener; });
    };
  }

  function getDb() {
    return new Promise(function (resolve, reject) {
      if (!window.indexedDB) {
        reject(new Error('IndexedDB is unavailable in this browser.'));
        return;
      }
      var openReq = window.indexedDB.open(DB_NAME, DB_VERSION);
      openReq.onupgradeneeded = function () {
        var db = openReq.result;
        if (!db.objectStoreNames.contains(STORE_QUEUE)) {
          var store = db.createObjectStore(STORE_QUEUE, { keyPath: 'id' });
          store.createIndex('byType', 'type', { unique: false });
          store.createIndex('byQueuedAt', 'queuedAt', { unique: false });
        }
      };
      openReq.onsuccess = function () { resolve(openReq.result); };
      openReq.onerror = function () { reject(openReq.error || new Error('Failed to open offline DB.')); };
    });
  }

  function withStore(mode, callback) {
    return getDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE_QUEUE, mode);
        var store = tx.objectStore(STORE_QUEUE);
        var result;
        try {
          result = callback(store, tx);
        } catch (error) {
          reject(error);
          return;
        }
        tx.oncomplete = function () { resolve(result); };
        tx.onerror = function () { reject(tx.error || new Error('Offline queue transaction failed.')); };
      });
    });
  }

  function listQueueItems() {
    return withStore('readonly', function (store) {
      return new Promise(function (resolve, reject) {
        var req = store.getAll();
        req.onsuccess = function () { resolve(Array.isArray(req.result) ? req.result : []); };
        req.onerror = function () { reject(req.error || new Error('Unable to read queue.')); };
      });
    }).then(function (itemsPromise) {
      return Promise.resolve(itemsPromise).then(function (items) {
        items.sort(function (a, b) { return String(a.queuedAt || '').localeCompare(String(b.queuedAt || '')); });
        return items;
      });
    });
  }

  function summarizeQueueItem(item) {
    var meta = item && item.meta ? item.meta : {};
    var attempts = Number(item && item.attempts || 0);
    var conflictCode = String(item && item.conflictCode || '').trim();
    var hasConflict = conflictCode !== '' || (attempts >= 2 && String(item && item.lastError || '').trim() !== '');
    return {
      id: String(item && item.id || ''),
      type: String(item && item.type || 'unknown'),
      queuedAt: String(item && item.queuedAt || ''),
      attempts: attempts,
      source: String(meta.source || ''),
      sourceQueueId: String(meta.sourceQueueId || ''),
      conflictCode: conflictCode,
      lastError: String(item && item.lastError || ''),
      hasConflict: hasConflict,
      payloadPreview: JSON.stringify(item && item.payload ? item.payload : {}).slice(0, 180)
    };
  }

  function getConflictActionHint(code) {
    var normalized = String(code || '').trim().toUpperCase();
    if (normalized === 'AUTH') return 'Sign in again, then retry sync.';
    if (normalized === 'NOT_FOUND') return 'Verify workbook path and required table names, then retry.';
    if (normalized === 'RATE_LIMIT') return 'Wait a minute and retry to avoid throttling.';
    if (normalized === 'SCHEMA') return 'Check workbook table columns/schema and run Workbook Diagnostics.';
    if (normalized === 'NETWORK') return 'Reconnect to the internet, then retry.';
    if (normalized === 'CONFLICT') return 'Review data conflict, then choose keep local or retry.';
    if (normalized === 'SERVER') return 'Service is busy; wait and retry.';
    if (normalized === 'SYNC_PENDING') return 'Remote sync still has pending writes; try Sync Now again.';
    if (normalized === 'RETRY_FAILED' || normalized === 'PROCESSOR_ERROR') return 'Retry now; if it keeps failing, keep local or discard.';
    if (!normalized || normalized === 'N/A') return 'Inspect details and retry when ready.';
    return 'Retry; if this repeats, keep local or discard this queued item.';
  }

  function getConflictHintSeverity(code) {
    var normalized = String(code || '').trim().toUpperCase();
    if (normalized === 'AUTH' || normalized === 'NOT_FOUND' || normalized === 'NETWORK' || normalized === 'CONFLICT') return 'warning';
    if (normalized === 'RATE_LIMIT' || normalized === 'SERVER' || normalized === 'SYNC_PENDING') return 'info';
    if (normalized === 'SCHEMA' || normalized === 'RETRY_FAILED' || normalized === 'PROCESSOR_ERROR') return 'error';
    return '';
  }

  function annotateQueuedWrites(match, patch) {
    var matcher = match || {};
    var patcher = typeof patch === 'function' ? patch : function () { return patch || {}; };
    return listQueueItems().then(function (items) {
      var changes = items.filter(function (item) {
        if (matcher.id && item.id !== matcher.id) return false;
        if (matcher.type && item.type !== matcher.type) return false;
        if (matcher.sourceQueueId && String((item.meta || {}).sourceQueueId || '') !== String(matcher.sourceQueueId)) return false;
        return true;
      });
      if (!changes.length) return 0;
      return withStore('readwrite', function (store) {
        changes.forEach(function (item) {
          var delta = patcher(item) || {};
          store.put({ ...item, ...delta, updatedAt: new Date().toISOString() });
        });
      }).then(function () { return changes.length; });
    }).then(function (count) {
      return refreshPendingCount().then(function () { return count; });
    });
  }

  function refreshPendingCount() {
    return listQueueItems()
      .then(function (items) {
        status.pendingCount = items.length;
        status.failedCount = items
          .map(summarizeQueueItem)
          .filter(function (item) { return item.hasConflict; }).length;
        if (status.syncing) {
          status.replayState = 'syncing';
        } else if (status.failedCount > 0) {
          status.replayState = 'failed';
        } else if (status.pendingCount > 0) {
          status.replayState = 'queued';
        } else {
          status.replayState = 'synced';
        }
        emitStatus();
        return items;
      })
      .catch(function () {
        return [];
      });
  }

  function enqueueWrite(type, payload, meta) {
    var queueItem = {
      id: 'offq-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      type: String(type || 'unknown'),
      payload: payload || {},
      meta: meta || {},
      queuedAt: new Date().toISOString(),
      attempts: 0
    };

    return withStore('readwrite', function (store) {
      store.put(queueItem);
    }).then(function () {
      return refreshPendingCount().then(function () {
        return queueItem;
      });
    });
  }

  function removeQueuedWrites(match) {
    var matcher = match || {};
    return listQueueItems()
      .then(function (items) {
        var removals = items.filter(function (item) {
          if (matcher.id && item.id !== matcher.id) return false;
          if (matcher.type && item.type !== matcher.type) return false;
          if (matcher.sourceQueueId && String((item.meta || {}).sourceQueueId || '') !== String(matcher.sourceQueueId)) return false;
          return true;
        });
        if (!removals.length) return 0;
        return withStore('readwrite', function (store) {
          removals.forEach(function (item) { store.delete(item.id); });
        }).then(function () { return removals.length; });
      })
      .then(function (count) {
        return refreshPendingCount().then(function () { return count; });
      });
  }

  function registerProcessor(type, processor) {
    if (!type || typeof processor !== 'function') return;
    processorMap[type] = processor;
  }

  function flushQueue() {
    if (!status.online) {
      return Promise.resolve({ processed: 0, remaining: status.pendingCount });
    }

    status.syncing = true;
    status.replayState = 'syncing';
    emitStatus();

    return listQueueItems()
      .then(function (items) {
        var processed = 0;
        var chain = Promise.resolve();

        items.forEach(function (item) {
          chain = chain.then(function () {
            var processor = processorMap[item.type];
            if (typeof processor !== 'function') return null;
            return Promise.resolve(processor(item.payload, item))
              .then(function (result) {
                if (result === false) return null;
                return removeQueuedWrites({ id: item.id }).then(function () {
                  processed += 1;
                  return null;
                });
              })
              .catch(function () {
                return annotateQueuedWrites({ id: item.id }, function (row) {
                  return {
                    attempts: Number(row.attempts || 0) + 1,
                    conflictCode: String(row.conflictCode || 'PROCESSOR_ERROR'),
                    lastError: String(row.lastError || 'Sync processor failed while offline queue flush was running.')
                  };
                });
              });
          });
        });

        return chain.then(function () {
          return refreshPendingCount().then(function () {
            status.lastSyncAt = new Date().toISOString();
            return { processed: processed, remaining: status.pendingCount };
          });
        });
      })
      .finally(function () {
        status.syncing = false;
        emitStatus();
      });
  }

  function scheduleFlush() {
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(function () {
      flushQueue();
    }, 450);
  }

  function triggerBirdSyncBridge() {
    if (!status.online) return Promise.resolve(false);
    if (typeof window.runBirdSyncNow !== 'function') return Promise.resolve(false);
    return Promise.resolve(window.runBirdSyncNow())
      .then(function (result) {
        var hasPending = Number(result && result.pendingQueue || 0) > 0;
        var errorCode = String(result && result.syncLastErrorCode || '').trim();
        var errorText = String(result && result.syncLastError || '').trim();

        if (!hasPending && !errorCode) {
          return removeQueuedWrites({ type: 'bird-sync-action' }).then(function () {
            return true;
          });
        }

        return annotateQueuedWrites({ type: 'bird-sync-action' }, function (item) {
          return {
            attempts: Math.max(1, Number(item.attempts || 0)),
            conflictCode: errorCode || String(item.conflictCode || 'SYNC_PENDING'),
            lastError: errorText || String(item.lastError || 'Bird sync still has pending queue items.')
          };
        }).then(function () {
          return true;
        });
      })
      .catch(function () {
        return false;
      });
  }

  function registerPlannerSaveFallback() {
    if (plannerSaveWrapperInstalled) return;
    var originalSaveToExcel = window.saveToExcel;
    if (typeof originalSaveToExcel !== 'function') return;

    plannerSaveWrapperInstalled = true;
    registerProcessor('planner-save-to-excel', function (payload) {
      if (typeof originalSaveToExcel !== 'function') return false;
      var args = Array.isArray(payload && payload.args) ? payload.args : [];
      return originalSaveToExcel.apply(window, args);
    });

    window.saveToExcel = async function () {
      var args = Array.prototype.slice.call(arguments);
      if (navigator.onLine) {
        return originalSaveToExcel.apply(window, args);
      }

      await enqueueWrite('planner-save-to-excel', { args: args }, { source: 'planner' });
      if (typeof window.showToast === 'function') {
        window.showToast('Offline: planner change queued and will sync when online.', 'warning', 2800);
      }
      return { queued: true, offline: true };
    };
  }

  function formatLastPackText(raw) {
    var iso = String(raw || '').trim();
    if (!iso) return 'Not yet prepared';
    var date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleString();
  }

  function renderStatusBadges() {
    var onlineState = status.online ? 'online' : 'offline';
    var connectionText = status.online ? 'Online' : 'Offline mode';
    var queueText = 'Pending sync: ' + String(status.pendingCount);
    var queueState = status.syncing ? 'syncing' : (status.pendingCount > 0 ? 'offline' : 'online');

    if (status.replayState === 'syncing') {
      queueText = 'Syncing queue...';
      queueState = 'syncing';
    } else if (status.replayState === 'failed') {
      queueText = 'Failed queued writes: ' + String(status.failedCount);
      queueState = 'offline';
    } else if (status.replayState === 'queued') {
      queueText = 'Queued for replay: ' + String(status.pendingCount);
      queueState = 'offline';
    } else if (status.replayState === 'synced') {
      queueText = 'Queue synced';
      queueState = 'online';
    }

    ['offlineModeConnectionBadge'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.dataset.state = onlineState;
      el.textContent = 'Offline: ' + connectionText;
    });

    ['offlineModeQueueBadge'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.dataset.state = queueState;
      el.textContent = queueText;
    });

    var replayStatusEl = document.getElementById('offlineModeReplayStatus');
    if (replayStatusEl) {
      var replayText = status.replayState === 'syncing'
        ? 'Syncing queued changes now...'
        : status.replayState === 'failed'
          ? ('Some queued writes need attention (' + String(status.failedCount) + ' failed).')
          : status.replayState === 'queued'
            ? ('Queued changes waiting to sync: ' + String(status.pendingCount))
            : 'All queued changes are synced.';
      if (status.lastSyncAt) replayText += ' Last sync: ' + new Date(status.lastSyncAt).toLocaleTimeString();
      replayStatusEl.textContent = replayText;
    }

    var cacheText = status.swReady ? 'Ready' : 'Preparing';
    var lastPackText = formatLastPackText(status.lastPackAt);

    document.querySelectorAll('.offline-cache-status').forEach(function (el) {
      el.textContent = cacheText;
    });
    document.querySelectorAll('.offline-last-pack').forEach(function (el) {
      el.textContent = lastPackText;
    });
    document.querySelectorAll('.offline-pending-count').forEach(function (el) {
      el.textContent = String(status.pendingCount);
    });
  }

  function renderQueueConflictPanels() {
    listQueueItems().then(function (items) {
      var conflictItems = items
        .map(summarizeQueueItem)
        .filter(function (item) { return item.hasConflict; });

      ['offlineModeQueueConflictPanel'].forEach(function (panelId) {
        var panel = document.getElementById(panelId);
        if (!panel) return;

        if (!conflictItems.length) {
          panel.hidden = true;
          panel.innerHTML = '';
          return;
        }

        panel.hidden = false;
        panel.innerHTML = [
          '<div class="offline-checklist-title">Queued write conflicts</div>',
          '<div class="card-subtitle">Resolve queued writes with repeated failures.</div>'
        ].join('') + conflictItems.map(function (item) {
          return [
            '<div class="offline-conflict-item">',
            '<div><strong>' + item.type + '</strong> • attempts ' + item.attempts + '</div>',
            '<div>Code: ' + (item.conflictCode || 'n/a') + '</div>',
            '<div>Suggested action: <span class="offline-hint--' + getConflictHintSeverity(item.conflictCode) + '">' + getConflictActionHint(item.conflictCode) + '</span></div>',
            '<div>Queued: ' + (item.queuedAt || 'unknown') + '</div>',
            '<div>Error: ' + (item.lastError || 'Unknown failure') + '</div>',
            '<div class="offline-conflict-actions">',
            '<button type="button" class="offline-action-btn" data-offline-conflict-action="retry" data-offline-queue-id="' + item.id + '">Retry now</button>',
            '<button type="button" class="offline-action-btn" data-offline-conflict-action="keep-local" data-offline-queue-id="' + item.id + '">Keep local only</button>',
            '<button type="button" class="offline-action-btn offline-action-btn--danger" data-offline-conflict-action="discard" data-offline-queue-id="' + item.id + '">Discard</button>',
            '</div>',
            '</div>'
          ].join('');
        }).join('');
      });
    }).catch(function () {
      // Diagnostics panel rendering is best-effort.
    });
  }

  function resolveConflictAction(action, queueId) {
    if (!queueId) return Promise.resolve(false);

    if (action === 'discard') {
      return removeQueuedWrites({ id: queueId }).then(function () { return true; });
    }

    if (action === 'keep-local') {
      return removeQueuedWrites({ id: queueId }).then(function () {
        if (typeof window.showToast === 'function') {
          window.showToast('Queued write kept local and removed from remote sync queue.', 'warning', 2800);
        }
        return true;
      });
    }

    if (action === 'retry') {
      return listQueueItems().then(function (items) {
        var target = items.find(function (item) { return item.id === queueId; });
        if (!target) return false;
        var processor = processorMap[target.type];
        if (typeof processor !== 'function') return false;
        return Promise.resolve(processor(target.payload, target))
          .then(function (result) {
            if (result === false) return false;
            return removeQueuedWrites({ id: queueId }).then(function () { return true; });
          })
          .catch(function (error) {
            return annotateQueuedWrites({ id: target.id }, function (row) {
              return {
                attempts: Number(row.attempts || 0) + 1,
                conflictCode: String(row.conflictCode || 'RETRY_FAILED'),
                lastError: String(error && error.message ? error.message : error || 'Retry failed')
              };
            }).then(function () { return false; });
          });
      }).then(function (resolved) {
        return refreshPendingCount().then(function () { return resolved; });
      });
    }

    return Promise.resolve(false);
  }

  async function warmOfflinePack() {
    await ensureServiceWorkerReady(6000);

    var cacheName = 'kaf-offline-pack-v1';
    var cache = await caches.open(cacheName);
    for (var i = 0; i < OFFLINE_PACK_ASSETS.length; i += 1) {
      var asset = OFFLINE_PACK_ASSETS[i];
      try {
        await cache.add(asset);
      } catch (_error) {
        // Keep warm-up best-effort so one missing asset does not abort the pack.
      }
    }

    if ('serviceWorker' in navigator) {
      try {
        var registration = await navigator.serviceWorker.ready;
        if (registration && registration.active) {
          registration.active.postMessage({ type: 'WARM_OFFLINE_PACK' });
        }
        status.swReady = Boolean(status.swReady || (registration && registration.active));
      } catch (_error) {
        // Offline pack can still rely on Cache Storage even if SW messaging fails.
      }
    }

    status.lastPackAt = new Date().toISOString();
    localStorage.setItem(LAST_PACK_KEY, status.lastPackAt);
    emitStatus();
    return { cachedCount: OFFLINE_PACK_ASSETS.length, lastPackAt: status.lastPackAt };
  }

  function bindOfflineButtons() {
    function runGuardedButtonAction(button, key, busyLabel, action) {
      if (!button || typeof action !== 'function') return Promise.resolve(false);
      if (window.ButtonActionGuard && typeof window.ButtonActionGuard.withActionGuard === 'function') {
        return window.ButtonActionGuard.withActionGuard({
          scope: 'offline-mode',
          target: button,
          showBusyLabel: true,
          busyLabel: busyLabel,
          getActionKey: function () { return key; },
          action: action
        });
      }
      return Promise.resolve(action()).then(function () { return true; });
    }

    ['offlineModePackBtn'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (!btn || btn.dataset.offlinePackBound === '1') return;
      btn.addEventListener('click', async function () {
        await runGuardedButtonAction(btn, 'offline-pack', 'Preparing...', async function () {
          var result = await warmOfflinePack();
          if (typeof window.showToast === 'function') {
            window.showToast('Offline pack prepared (' + result.cachedCount + ' assets).', 'success', 2600);
          }
        }).catch(function (error) {
          if (typeof window.showToast === 'function') {
            window.showToast('Offline pack failed: ' + String(error && error.message ? error.message : error), 'error', 3600);
          }
        });
      });
      btn.dataset.offlinePackBound = '1';
    });

    ['offlineModeHealthBtn'].forEach(function (id) {
      var healthBtn = document.getElementById(id);
      if (!healthBtn || healthBtn.dataset.offlineHealthBound === '1') return;
      healthBtn.dataset.offlineHealthBound = '1';
      healthBtn.addEventListener('click', function () {
        var diagnosticsUrl = new URL('HTML Files/offline-pack-health.html', window.location.href).toString();
        var tab = window.open(diagnosticsUrl, '_blank');
        if (tab) tab.focus();
      });
    });

    ['offlineModeInstallBtn'].forEach(function (id) {
      var installNowBtn = document.getElementById(id);
      if (!installNowBtn || installNowBtn.dataset.offlineInstallBound === '1') return;
      installNowBtn.dataset.offlineInstallBound = '1';
      installNowBtn.addEventListener('click', async function () {
        if (!deferredInstallPrompt) return;
        deferredInstallPrompt.prompt();
        try {
          await deferredInstallPrompt.userChoice;
        } catch (_error) {
          // Ignore user cancel.
        }
        deferredInstallPrompt = null;
        renderInstallBanner();
      });
    });

    var offlineDebugCopyBtn = document.getElementById('offlineModeDebugCopyBtn');
    if (offlineDebugCopyBtn && offlineDebugCopyBtn.dataset.offlineDebugBound !== '1') {
      offlineDebugCopyBtn.dataset.offlineDebugBound = '1';
      offlineDebugCopyBtn.addEventListener('click', function () {
        copyOfflineDebugIndicatorText();
      });
    }
    syncOfflineDebugToolsVisibility();

    var offlineModeOpenBtn = document.getElementById('offlineModeBtn');
    if (offlineModeOpenBtn && offlineModeOpenBtn.dataset.offlineModeBound !== '1') {
      offlineModeOpenBtn.dataset.offlineModeBound = '1';
      offlineModeOpenBtn.addEventListener('click', function () {
        openOfflineModePage({ source: 'direct:offlineModeBtn' });
      });
    }

    if (!offlineModeDelegatedBound) {
      offlineModeDelegatedBound = true;
      document.addEventListener('click', function (event) {
        var rawTarget = event && event.target ? event.target : null;
        var elementTarget = rawTarget && rawTarget.nodeType === Node.ELEMENT_NODE
          ? rawTarget
          : (rawTarget && rawTarget.parentElement ? rawTarget.parentElement : null);
        var target = elementTarget && elementTarget.closest
          ? elementTarget.closest('#offlineModeBtn, #offlineInstallOpenModeBtn')
          : null;
        if (!target) return;
        var delegatedSource = 'delegated:' + String(target.id || 'unknown');
        if (target.dataset && target.dataset.offlineModeBound === '1') {
          renderOfflineDebugIndicator('offlineMode delegated click observed', buildOfflineDebugDetail(delegatedSource, 'bound=1'));
          return;
        }
        event.preventDefault();
        openOfflineModePage({ source: delegatedSource });
      }, true);
    }

    var offlineInstallOpenModeBtn = document.getElementById('offlineInstallOpenModeBtn');
    if (offlineInstallOpenModeBtn && offlineInstallOpenModeBtn.dataset.offlineModeBound !== '1') {
      offlineInstallOpenModeBtn.dataset.offlineModeBound = '1';
      offlineInstallOpenModeBtn.addEventListener('click', function () {
        openOfflineModePage({ source: 'direct:offlineInstallOpenModeBtn' });
      });
    }

    var offlineModeBackBtn = document.getElementById('offlineModeBackBtn');
    if (offlineModeBackBtn && offlineModeBackBtn.dataset.offlineModeBound !== '1') {
      offlineModeBackBtn.dataset.offlineModeBound = '1';
      offlineModeBackBtn.addEventListener('click', function () {
        closeOfflineModePage();
      });
    }

    var offlineModeSyncBtn = document.getElementById('offlineModeSyncBtn');
    if (offlineModeSyncBtn && offlineModeSyncBtn.dataset.offlineSyncBound !== '1') {
      offlineModeSyncBtn.dataset.offlineSyncBound = '1';
      offlineModeSyncBtn.addEventListener('click', async function () {
        await runGuardedButtonAction(offlineModeSyncBtn, 'offline-sync', 'Syncing...', async function () {
          var result = await flushQueue();
          if (typeof window.showToast === 'function') {
            window.showToast('Offline sync finished. Processed ' + String(result && result.processed || 0) + ' item(s).', 'success', 2600);
          }
        }).catch(function (error) {
          if (typeof window.showToast === 'function') {
            window.showToast('Offline sync failed: ' + String(error && error.message ? error.message : error), 'error', 3200);
          }
        });
      });
    }

    var installDismissBtn = document.getElementById('offlineInstallDismissBtn');
    if (installDismissBtn && installDismissBtn.dataset.offlineInstallBound !== '1') {
      installDismissBtn.dataset.offlineInstallBound = '1';
      installDismissBtn.addEventListener('click', function () {
        localStorage.setItem(DISMISS_INSTALL_KEY, '1');
        renderInstallBanner();
      });
    }

    document.querySelectorAll('[data-offline-conflict-action]').forEach(function (button) {
      if (!button || button.dataset.offlineConflictBound === '1') return;
      button.dataset.offlineConflictBound = '1';
      button.addEventListener('click', function () {
        var action = String(button.getAttribute('data-offline-conflict-action') || '');
        var queueId = String(button.getAttribute('data-offline-queue-id') || '');
        runGuardedButtonAction(button, 'offline-conflict-' + queueId + '-' + action, 'Working...', function () {
          return resolveConflictAction(action, queueId).then(function (resolved) {
            if (typeof window.showToast === 'function') {
              window.showToast(resolved ? 'Queue item updated.' : 'Unable to resolve queue item.', resolved ? 'success' : 'warning', 2200);
            }
            renderQueueConflictPanels();
          });
        });
      });
    });
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return Promise.resolve(false);
    return ensureServiceWorkerReady(6000)
      .then(function (ready) {
        status.swReady = Boolean(ready);
        emitStatus();
        logVersionBanner('register-service-worker');
        return ready;
      })
      .catch(function () {
        status.swReady = false;
        emitStatus();
        logVersionBanner('register-service-worker-failed');
        return false;
      });
  }

  function initGlobalEvents() {
    window.addEventListener('beforeinstallprompt', function (event) {
      event.preventDefault();
      deferredInstallPrompt = event;
      renderInstallBanner();
    });

    window.addEventListener('appinstalled', function () {
      deferredInstallPrompt = null;
      renderInstallBanner();
    });

    window.addEventListener('app:tab-switched', function (event) {
      syncOfflineModeButtonState();
      bindOfflineButtons();
      var switchSource = event && event.detail ? String(event.detail.source || '').trim() : '';
      renderOfflineDebugIndicator('app:tab-switched', [
        'current=' + (getActiveTabId() || 'none'),
        switchSource ? 'switchSource=' + switchSource : ''
      ].filter(Boolean).join(' | '));
    });

    window.addEventListener('online', function () {
      status.online = true;
      emitStatus();
      triggerBirdSyncBridge();
      scheduleFlush();
    });

    window.addEventListener('offline', function () {
      status.online = false;
      emitStatus();
    });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        logVersionBanner('controllerchange');
      });
    }

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) {
        bindOfflineButtons();
        registerPlannerSaveFallback();
        refreshPendingCount();
        renderInstallBanner();
        syncOfflineModeButtonState();
      }
    });

    if (document.body && typeof MutationObserver === 'function') {
      var observer = new MutationObserver(function () {
        bindOfflineButtons();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  window.OfflinePwa = {
    subscribe: subscribe,
    enqueueWrite: enqueueWrite,
    removeQueuedWrites: removeQueuedWrites,
    registerProcessor: registerProcessor,
    flushQueue: flushQueue,
    warmOfflinePack: warmOfflinePack,
    getConflictActionHint: getConflictActionHint,
    getConflictHintSeverity: getConflictHintSeverity,
    getQueueItems: listQueueItems,
    resolveConflict: resolveConflictAction,
    openOfflineHealthPage: function () {
      var diagnosticsUrl = new URL('HTML Files/offline-pack-health.html', window.location.href).toString();
      var tab = window.open(diagnosticsUrl, '_blank');
      if (tab) tab.focus();
      return Boolean(tab);
    },
    openOfflineModePage: openOfflineModePage,
    closeOfflineModePage: closeOfflineModePage,
    getStatus: function () { return { ...status }; },
    getPendingCount: function () { return status.pendingCount; }
  };

  window.openOfflineModePage = openOfflineModePage;
  window.closeOfflineModePage = closeOfflineModePage;

  initGlobalEvents();
  emitStatus();
  bindOfflineButtons();
  renderInstallBanner();
  syncOfflineModeButtonState();
  registerPlannerSaveFallback();
  registerProcessor('bird-sync-action', function () {
    return triggerBirdSyncBridge();
  });
  refreshPendingCount();
  registerServiceWorker();
})();

