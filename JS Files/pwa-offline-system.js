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
    '/HTML%20Files/adventure-details-window.html',
    '/HTML%20Files/bike-details-window.html',
    '/HTML%20Files/city-viewer-window.html',
    '/HTML%20Files/trail-explorer-window.html',
    '/HTML%20Files/find-near-me-window.html',
    '/data/nature-challenge-birds.tsv'
  ];

  var status = {
    online: navigator.onLine,
    swReady: false,
    pendingCount: 0,
    syncing: false,
    lastPackAt: localStorage.getItem(LAST_PACK_KEY) || ''
  };

  var listeners = [];
  var flushTimer = null;
  var processorMap = Object.create(null);
  var plannerSaveWrapperInstalled = false;

  function emitStatus() {
    listeners.forEach(function (listener) {
      try {
        listener({ ...status });
      } catch (_error) {
        // Keep status stream resilient.
      }
    });
    renderStatusBadges();
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

  function refreshPendingCount() {
    return listQueueItems()
      .then(function (items) {
        status.pendingCount = items.length;
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
                return withStore('readwrite', function (store) {
                  store.put({ ...item, attempts: Number(item.attempts || 0) + 1 });
                });
              });
          });
        });

        return chain.then(function () {
          return refreshPendingCount().then(function () {
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
      .then(function () {
        return removeQueuedWrites({ type: 'bird-sync-action' }).then(function () {
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
    var queueText = status.syncing ? 'Syncing queue...' : ('Pending sync: ' + String(status.pendingCount));
    var queueState = status.syncing ? 'syncing' : (status.pendingCount > 0 ? 'offline' : 'online');

    ['offlinePlannerConnectionBadge', 'offlineBirdConnectionBadge'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.dataset.state = onlineState;
      el.textContent = 'Offline: ' + connectionText;
    });

    ['offlinePlannerQueueBadge', 'offlineBirdQueueBadge'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.dataset.state = queueState;
      el.textContent = queueText;
    });

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

  async function warmOfflinePack() {
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

    status.lastPackAt = new Date().toISOString();
    localStorage.setItem(LAST_PACK_KEY, status.lastPackAt);
    emitStatus();
    return { cachedCount: OFFLINE_PACK_ASSETS.length, lastPackAt: status.lastPackAt };
  }

  function bindOfflineButtons() {
    ['offlinePackBtn', 'birdsOfflinePackBtn'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (!btn || btn.dataset.offlinePackBound === '1') return;
      btn.addEventListener('click', async function () {
        btn.disabled = true;
        try {
          var result = await warmOfflinePack();
          if (typeof window.showToast === 'function') {
            window.showToast('Offline pack prepared (' + result.cachedCount + ' assets).', 'success', 2600);
          }
        } catch (error) {
          if (typeof window.showToast === 'function') {
            window.showToast('Offline pack failed: ' + String(error && error.message ? error.message : error), 'error', 3600);
          }
        } finally {
          btn.disabled = false;
        }
      });
      btn.dataset.offlinePackBound = '1';
    });
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return Promise.resolve(false);
    return navigator.serviceWorker.register(SERVICE_WORKER_PATH)
      .then(function () {
        status.swReady = true;
        emitStatus();
        return true;
      })
      .catch(function () {
        status.swReady = false;
        emitStatus();
        return false;
      });
  }

  function initGlobalEvents() {
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

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) {
        bindOfflineButtons();
        registerPlannerSaveFallback();
        refreshPendingCount();
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
    getStatus: function () { return { ...status }; },
    getPendingCount: function () { return status.pendingCount; }
  };

  initGlobalEvents();
  emitStatus();
  bindOfflineButtons();
  registerPlannerSaveFallback();
  registerProcessor('bird-sync-action', function () {
    return triggerBirdSyncBridge();
  });
  refreshPendingCount();
  registerServiceWorker();
})();

