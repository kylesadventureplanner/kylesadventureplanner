(function initializeDiagnosticsHubSystem() {
  'use strict';

  var TAB_ID = 'diagnostics-hub';
  var SECTION_KEYS = ['overview', 'storage', 'sync', 'setup', 'nearby', 'places'];
  var STORAGE_REASON_CATALOG = [
    {
      test: function (key) { return /^cityViewer:edits:/i.test(key); },
      label: 'City Explorer local draft edits',
      backend: 'Best-effort Excel sync when matching workbook rows are available',
      reason: 'Draft edits stay local first so the browser can recover if Excel sync is unavailable.',
      area: 'City Explorer'
    },
    {
      test: function (key) { return /^cityViewer:shortlist:/i.test(key); },
      label: 'City Explorer shortlist',
      backend: 'Device only',
      reason: 'Trip planning shortlist is a personal workspace preference and is not written to Excel.',
      area: 'City Explorer'
    },
    {
      test: function (key) { return /^cityViewer:presets:/i.test(key) || /^cityViewer:lastState:/i.test(key); },
      label: 'City Explorer filters and presets',
      backend: 'Device only',
      reason: 'Saved filter presets and last-view state are UI preferences designed to stay on this device.',
      area: 'City Explorer'
    },
    {
      test: function (key) { return key === 'visitedLocationsTrackerV1'; },
      label: 'Adventure Challenge visited tracker map',
      backend: 'Partially mirrored via visited persistence events',
      reason: 'The tracker keeps a fast local working copy; unsynced items remain local until persistence replay succeeds.',
      area: 'Adventure Challenge'
    },
    {
      test: function (key) { return key === 'visitedLocationsChallengeStateV1' || key === 'visitedLocationsMetaV1' || key === 'visitedLocationRecordsV1'; },
      label: 'Adventure Challenge progress and visit metadata',
      backend: 'Mostly device only; selected events can mirror to persistence workbook',
      reason: 'Challenge progress is computed locally for responsiveness, while only specific persistence events are published.',
      area: 'Adventure Challenge'
    },
    {
      test: function (key) { return key === 'natureChallengeBirdSyncQueueV1' || key === 'natureChallengeBirdSyncConflictsV1'; },
      label: 'Nature Challenge sync queue',
      backend: 'Excel sync target expected',
      reason: 'Nature writes are queued locally until workbook sync succeeds.',
      area: 'Nature Challenge'
    },
    {
      test: function (key) { return /^natureChallenge.*(Sightings|Favorites|SightingLog|Gamification|BirdCache)/.test(key); },
      label: 'Nature Challenge local state',
      backend: 'Mixed: sightings can sync, caches/preferences stay local',
      reason: 'The app keeps an immediate local copy for offline use and faster species tracking.',
      area: 'Nature Challenge'
    },
    {
      test: function (key) { return key === '__nearby_attractions_cache_v2' || /^__detail_nearby_ui_prefs_/i.test(key); },
      label: 'Nearby recommendations cache and filters',
      backend: 'Device only',
      reason: 'Nearby lookups are cached locally to speed up repeated searches and reduce web/API calls.',
      area: 'Nearby & details'
    },
    {
      test: function (key) { return /^__detail_parking_/i.test(key) || /^__adventure_day_plan_v1$/i.test(key); },
      label: 'Adventure detail helpers',
      backend: 'Device only',
      reason: 'Parking intelligence, temporary plans, and helper metadata are local convenience features.',
      area: 'Adventure details'
    },
    {
      test: function (key) { return /^kaf/i.test(key) || /^kap_/i.test(key) || /^iphoneViewEnabled$/i.test(key); },
      label: 'Offline / app shell preferences',
      backend: 'Device only',
      reason: 'Offline readiness, install prompts, service-worker state, and view preferences are browser-specific settings.',
      area: 'App shell'
    },
    {
      test: function (key) { return /^reliability/i.test(key) || /^birdsClickDiag$/i.test(key); },
      label: 'Diagnostics and reliability baselines',
      backend: 'Device only',
      reason: 'Diagnostics snapshots and click tracing are intentionally local so they do not pollute workbook data.',
      area: 'Diagnostics'
    }
  ];

  function safeJsonParse(raw, fallback) {
    try {
      var parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch (_error) {
      return fallback;
    }
  }

  function ensureHubStyles() {
    if (document.getElementById('diagnosticsHubRuntimeStyles')) return;
    var style = document.createElement('style');
    style.id = 'diagnosticsHubRuntimeStyles';
    style.textContent = [
      '.diagnostics-hub-shell{display:grid;gap:var(--ui-space-12,12px);}',
      '.diagnostics-hub-header-row{display:flex;justify-content:space-between;align-items:flex-start;gap:var(--ui-space-12,12px);flex-wrap:wrap;}',
      '.diagnostics-hub-summary-pills{display:flex;gap:var(--ui-space-8,8px);flex-wrap:wrap;}',
      '.diagnostics-hub-section-tabs{display:flex;gap:var(--ui-space-8,8px);flex-wrap:wrap;}',
      '.diagnostics-hub-tab{border:1px solid var(--ui-chip-border,#d1d5db);background:#fff;color:#374151;border-radius:999px;padding:7px 12px;font-size:12px;font-weight:700;cursor:pointer;}',
      '.diagnostics-hub-tab.active{background:var(--ui-status-info-bg,#eff6ff);border-color:var(--ui-status-info-border,#93c5fd);color:var(--ui-status-info-text,#1d4ed8);}',
      '.diagnostics-hub-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:var(--ui-space-12,12px);}',
      '.diagnostics-hub-card{border:1px solid var(--ui-card-border,#e5e7eb);border-radius:var(--ui-card-radius,12px);background:var(--ui-card-bg,#fff);padding:var(--ui-card-padding-y,12px) var(--ui-card-padding-x,14px);box-shadow:var(--ui-card-shadow,0 1px 2px rgba(15,23,42,.05));}',
      '.diagnostics-hub-card--wide{grid-column:1/-1;}',
      '.diagnostics-hub-card-title{font-size:13px;font-weight:800;color:#1f2937;margin-bottom:6px;}',
      '.diagnostics-hub-kpi{font-size:24px;font-weight:800;line-height:1.1;color:#111827;}',
      '.diagnostics-hub-kpi.is-warn{color:#b45309;}',
      '.diagnostics-hub-kpi.is-good{color:#047857;}',
      '.diagnostics-hub-note{font-size:12px;color:#64748b;line-height:1.4;}',
      '.diagnostics-hub-bullets{margin:0;padding-left:18px;display:grid;gap:6px;font-size:12px;color:#334155;}',
      '.diagnostics-hub-action-row{display:flex;gap:var(--ui-space-8,8px);flex-wrap:wrap;margin-top:var(--ui-space-8,8px);}',
      '.diagnostics-hub-actions-inline{display:flex;gap:6px;flex-wrap:wrap;margin-top:var(--ui-space-8,8px);}',
      '.diagnostics-hub-list-item{border:1px solid #e2e8f0;border-radius:10px;padding:10px;background:#f8fafc;margin-top:8px;}',
      '.diagnostics-hub-list-head{display:flex;justify-content:space-between;gap:8px;align-items:center;}',
      '.diagnostics-hub-badge{display:inline-flex;align-items:center;padding:2px 8px;border:1px solid #cbd5e1;border-radius:999px;background:#fff;font-size:11px;font-weight:700;color:#475569;}',
      '.diagnostics-hub-table-wrap{overflow:auto;max-height:440px;}',
      '.diagnostics-hub-table{width:100%;border-collapse:collapse;font-size:12px;}',
      '.diagnostics-hub-table th,.diagnostics-hub-table td{padding:8px;border-bottom:1px solid #e5e7eb;text-align:left;vertical-align:top;}',
      '.diagnostics-hub-empty,.diagnostics-hub-loading{padding:var(--ui-empty-padding,20px);border:1px dashed var(--ui-empty-border,#cbd5e1);border-radius:var(--ui-card-radius,12px);background:var(--ui-empty-bg,#f8fafc);color:var(--ui-empty-text,#475569);font-size:12px;}',
      '.diagnostics-hub-guide-row{font-size:12px;color:#334155;line-height:1.45;margin-top:6px;}',
      '.diagnostics-tone-error{border-color:#fecaca;background:#fff1f2;}',
      '.diagnostics-tone-warn{border-color:#fed7aa;background:#fff7ed;}',
      '.diagnostics-tone-ok{border-color:#bbf7d0;background:#f0fdf4;}',
      '.diagnostics-tone-info{border-color:#bfdbfe;background:#eff6ff;}',
      '.diagnostics-hub-shell .planner-top-btn{min-height:var(--ui-action-height,42px);border-radius:var(--ui-action-radius,12px);}',
      '.diagnostics-hub-shell .planner-top-btn:not(.planner-top-btn--success):not(.planner-top-btn--accent){border:1px solid var(--ui-action-secondary-border,#cbd5e1);background:var(--ui-action-secondary-bg,#fff);color:var(--ui-action-secondary-text,#334155);}',
      '.diagnostics-hub-shell .planner-top-btn--success{background:var(--ui-action-primary-bg,linear-gradient(135deg,#667eea 0%,#764ba2 100%));color:var(--ui-action-primary-text,#fff);}',
      '.diagnostics-hub-shell .planner-top-btn--accent{background:var(--ui-feedback-info-bg,#eff6ff);border-color:var(--ui-feedback-info-border,#bfdbfe);color:var(--ui-feedback-info-text,#1e40af);}'
    ].join('');
    document.head.appendChild(style);
  }

  function escHtml(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatTime(value) {
    var text = String(value || '').trim();
    if (!text) return '—';
    var ts = Date.parse(text);
    if (!Number.isFinite(ts)) return text;
    return new Date(ts).toLocaleString();
  }

  function formatRelativeAge(value) {
    var ts = Date.parse(String(value || ''));
    if (!Number.isFinite(ts)) return 'unknown';
    var minutes = Math.max(0, Math.round((Date.now() - ts) / 60000));
    if (minutes < 1) return 'just now';
    if (minutes < 60) return minutes + 'm ago';
    var hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + 'h ago';
    var days = Math.floor(hours / 24);
    return days + 'd ago';
  }

  function formatBytes(bytes) {
    var size = Math.max(0, Number(bytes) || 0);
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function composeDiagnosticsStatusHtml(options) {
    var safeOptions = options && typeof options === 'object' ? options : {};
    var tone = String(safeOptions.tone || 'info').trim().toLowerCase();
    if (tone !== 'success' && tone !== 'warning' && tone !== 'error') tone = 'info';
    var icon = String(safeOptions.icon || (tone === 'success' ? '✅' : tone === 'warning' ? '⚠️' : tone === 'error' ? '❌' : 'ℹ️'));
    var text = String(safeOptions.text || '').trim();
    var detail = String(safeOptions.detail || '').trim();
    if (typeof window.composeStatusMessageHTML === 'function') {
      return window.composeStatusMessageHTML({
        tone: tone,
        icon: icon,
        text: text,
        detail: detail,
        className: 'diagnostics-hub-status'
      });
    }
    return '<div class="diagnostics-hub-note">' + escHtml([icon, text, detail].filter(Boolean).join(' ')) + '</div>';
  }

  function describeStorageKey(key) {
    for (var i = 0; i < STORAGE_REASON_CATALOG.length; i += 1) {
      var entry = STORAGE_REASON_CATALOG[i];
      if (entry && typeof entry.test === 'function' && entry.test(String(key || ''))) {
        return entry;
      }
    }
    return null;
  }

  function readStorageArea(areaName) {
    var storage = areaName === 'session' ? window.sessionStorage : window.localStorage;
    var items = [];
    if (!storage) return items;
    for (var i = 0; i < storage.length; i += 1) {
      var key = storage.key(i);
      if (!key) continue;
      var descriptor = describeStorageKey(key);
      if (!descriptor) continue;
      var raw = String(storage.getItem(key) || '');
      items.push({
        area: areaName,
        key: key,
        label: descriptor.label,
        backend: descriptor.backend,
        reason: descriptor.reason,
        featureArea: descriptor.area,
        bytes: raw.length,
        preview: raw.slice(0, 160)
      });
    }
    items.sort(function (a, b) {
      return String(a.featureArea || '').localeCompare(String(b.featureArea || '')) || String(a.key || '').localeCompare(String(b.key || ''));
    });
    return items;
  }

  function readVisitedFallbackSnapshot() {
    var visitMap = safeJsonParse(window.localStorage.getItem('visitedLocationsTrackerV1') || '{}', {});
    var pending = Object.keys(visitMap).filter(function (key) {
      return visitMap[key] && visitMap[key].synced === false;
    }).map(function (key) {
      var item = visitMap[key] || {};
      return {
        id: key,
        placeKey: key,
        title: String(item.name || item.title || key),
        synced: item.synced === true,
        sourceType: String(item.sourceType || 'adventure'),
        visited: item.visited === true,
        updatedAt: String(item.updatedAt || item.lastUpdatedAt || '')
      };
    });
    return {
      available: pending.length > 0 || Object.keys(visitMap).length > 0,
      syncHealth: null,
      pendingLocalOnlyCount: pending.length,
      pendingLocalOnlyItems: pending,
      persistenceStatus: { text: 'Adventure Challenge snapshot unavailable', detail: '', pathIssue: false },
      migrationStatus: null,
      persistenceTarget: null
    };
  }

  function readNatureFallbackSnapshot() {
    var queue = safeJsonParse(window.localStorage.getItem('natureChallengeBirdSyncQueueV1') || '[]', []);
    return {
      available: Array.isArray(queue) && queue.length > 0,
      pendingQueueCount: Array.isArray(queue) ? queue.length : 0,
      queueItems: Array.isArray(queue) ? queue : [],
      syncLastError: '',
      syncLastErrorCode: '',
      schemaDiagnostics: null,
      workbookPath: ''
    };
  }

  function getAdventureSnapshot() {
    if (typeof window.getAdventureChallengeDiagnosticsSnapshot === 'function') {
      try { return window.getAdventureChallengeDiagnosticsSnapshot() || readVisitedFallbackSnapshot(); } catch (_error) {}
    }
    return readVisitedFallbackSnapshot();
  }

  function getNatureSnapshot() {
    if (typeof window.getNatureChallengeDiagnosticsSnapshot === 'function') {
      try { return window.getNatureChallengeDiagnosticsSnapshot() || readNatureFallbackSnapshot(); } catch (_error) {}
    }
    return readNatureFallbackSnapshot();
  }

  function getPlacesHealthSnapshot() {
    if (typeof window.runPlacesHealthCheck === 'function') {
      try {
        var result = {};
        return Promise.resolve(window.runPlacesHealthCheck({ query: '', placeId: '' })).then(function(health) {
          result.available = health && health.ok !== false;
          result.status = health && health.status ? health.status : 'unknown';
          result.ok = health && health.ok ? health.ok : false;
          result.summary = health && health.summary ? health.summary : 'Not tested';
          result.query = health && health.query ? health.query : '';
          result.placeIdUsed = health && health.placeIdUsed ? health.placeIdUsed : '';
          result.steps = Array.isArray(health && health.steps) ? health.steps : [];
          return result;
        }).catch(function(_error) {
          return { available: false, status: 'error', ok: false, summary: 'Health check failed', query: '', placeIdUsed: '', steps: [] };
        });
      } catch (_error) {
        return Promise.resolve({ available: false, status: 'error', ok: false, summary: 'Health check unavailable', query: '', placeIdUsed: '', steps: [] });
      }
    }
    return Promise.resolve({ available: false, status: 'unknown', ok: false, summary: 'Places API not loaded', query: '', placeIdUsed: '', steps: [] });
  }

  function classifyQueueIssue(item) {
    var meta = item && item.meta ? item.meta : {};
    var code = String(item && item.conflictCode || meta.conflictCode || '').trim().toUpperCase();
    var lastError = String(item && item.lastError || meta.failureReason || '').trim();
    if (code === 'AUTH' || /sign in required|auth/i.test(lastError)) {
      return {
        title: 'Authentication required',
        reason: 'The app kept this change locally because the current browser session is not signed in or the token expired.',
        suggestion: 'Sign in again, then use Retry sync.'
      };
    }
    if (code === 'NOT_FOUND') {
      return {
        title: 'Backend file or table missing',
        reason: 'The target workbook path or table name could not be found in OneDrive/Excel.',
        suggestion: 'Verify workbook paths and table names, then retry sync.'
      };
    }
    if (code === 'SCHEMA') {
      return {
        title: 'Backend schema mismatch',
        reason: 'The Excel backend is missing required columns or the expected table layout changed.',
        suggestion: 'Add the required columns/table schema, then retry sync.'
      };
    }
    if (code === 'NETWORK' || /failed to fetch|network|timeout/i.test(lastError)) {
      return {
        title: 'Temporary connectivity issue',
        reason: 'The browser could not reach the backend when the write was attempted.',
        suggestion: 'Reconnect to the internet and retry sync.'
      };
    }
    if (code === 'SYNC_PENDING') {
      return {
        title: 'Another sync still pending',
        reason: 'The app deferred this write until the earlier sync sequence finishes.',
        suggestion: 'Run Sync again once the queue is idle.'
      };
    }
    if (code === 'RATE_LIMIT' || code === 'SERVER') {
      return {
        title: 'Backend temporarily busy',
        reason: 'The remote service throttled or rejected the write for now.',
        suggestion: 'Wait briefly, then retry sync.'
      };
    }
    if (code === 'CONFLICT') {
      return {
        title: 'Remote/local conflict',
        reason: 'The backend could not safely apply this write without review.',
        suggestion: 'Inspect the record, then retry, keep local only, or discard.'
      };
    }
    return {
      title: 'Retry required',
      reason: lastError || 'The app kept this write locally because the remote sync did not complete.',
      suggestion: 'Retry sync. If it repeats, inspect configuration or keep the record local only.'
    };
  }

  function buildSetupGuide(snapshot) {
    var cards = [];
    var offlineItems = snapshot && snapshot.offline && Array.isArray(snapshot.offline.queueItems) ? snapshot.offline.queueItems : [];
    var hasAuthIssue = !window.accessToken || offlineItems.some(function (item) {
      return String(item && item.conflictCode || '').trim().toUpperCase() === 'AUTH';
    }) || String(snapshot && snapshot.nature && snapshot.nature.syncLastErrorCode || '').trim().toUpperCase() === 'AUTH';
    if (hasAuthIssue) {
      cards.push({
        tone: 'warn',
        title: 'Sign-in is required for backend sync',
        why: 'Any Excel or OneDrive write needs a valid Microsoft session. Without it, changes stay local only.',
        fix: 'Use Sign In in the main app, then come back here and choose Retry all syncs.'
      });
    }

    var visited = snapshot && snapshot.adventure ? snapshot.adventure : {};
    if (visited.persistenceStatus && visited.persistenceStatus.pathIssue) {
      cards.push({
        tone: 'error',
        title: 'Adventure Challenge persistence workbook is missing or misrouted',
        why: String(visited.persistenceStatus.text || 'The persistence workbook path is not resolving.'),
        fix: 'Update `visitedSyncConfig.persistenceWorkbookPath` or upload the workbook/table to the expected OneDrive location, then retry sync.'
      });
    }

    var nature = snapshot && snapshot.nature ? snapshot.nature : {};
    var natureCode = String(nature.syncLastErrorCode || '').trim().toUpperCase();
    if (natureCode === 'NOT_FOUND' || !String(nature.workbookPath || '').trim()) {
      cards.push({
        tone: 'warn',
        title: 'Nature Challenge sync workbook is not configured or not found',
        why: 'The Birds/Nature sync target workbook could not be resolved, so writes stay in the local queue.',
        fix: 'Make sure the expected workbook and tables exist in OneDrive. If you recently renamed files, update the sync file candidates or restore the original names.'
      });
    }
    if (natureCode === 'SCHEMA' || (nature.schemaDiagnostics && nature.schemaDiagnostics.status && nature.schemaDiagnostics.status !== 'ok' && nature.schemaDiagnostics.status !== 'unknown')) {
      cards.push({
        tone: 'error',
        title: 'Nature Challenge backend schema needs attention',
        why: 'Required columns are missing or the workbook schema no longer matches what the app writes.',
        fix: 'Open Workbook Diagnostics from the Nature tab, add the missing columns/tables, then rerun sync.'
      });
    }

    if (!cards.length) {
      cards.push({
        tone: 'ok',
        title: 'No obvious backend configuration blockers detected',
        why: 'Current diagnostics do not show a missing workbook/table/schema requirement.',
        fix: 'If data is still local-only, use Retry all syncs and inspect any remaining queue item errors for the exact record.'
      });
    }

    cards.push({
      tone: 'info',
      title: 'Nearby/web recommendations setup',
      why: 'Web recommendations require a working Google Maps / Places API key and usable coordinates for the city or location center.',
      fix: 'If nearby web results are empty, confirm the Google key is present and the source city/location has coordinates or a valid Google Maps URL.'
    });

    return cards;
  }

  function createSyncSummary(snapshot) {
    var offlinePending = Number(snapshot && snapshot.offline && snapshot.offline.status && snapshot.offline.status.pendingCount || 0);
    var adventurePending = Number(snapshot && snapshot.adventure && snapshot.adventure.pendingLocalOnlyCount || 0);
    var naturePending = Number(snapshot && snapshot.nature && snapshot.nature.pendingQueueCount || 0);
    var inventory = snapshot && snapshot.storageInventory ? snapshot.storageInventory : [];
    return {
      pendingSyncRecords: offlinePending + adventurePending + naturePending,
      deviceOnlyEntries: inventory.length,
      authReady: Boolean(window.accessToken),
      hasSetupIssues: buildSetupGuide(snapshot).some(function (item) { return item.tone === 'warn' || item.tone === 'error'; })
    };
  }

  function buildStorageInventory() {
    return readStorageArea('local').concat(readStorageArea('session'));
  }

  function readReliabilitySnapshot() {
    if (typeof window.__reliabilityStatus === 'function') {
      try { return window.__reliabilityStatus() || null; } catch (_error) {}
    }
    return null;
  }

  function readKnownGoodInfo() {
    if (window.ReliabilityKnownGood && typeof window.ReliabilityKnownGood.list === 'function') {
      try {
        var list = window.ReliabilityKnownGood.list() || [];
        return { count: Array.isArray(list) ? list.length : 0, latest: Array.isArray(list) && list[0] ? list[0] : null };
      } catch (_error) {}
    }
    return { count: 0, latest: null };
  }

  function collectOfflineSnapshot() {
    if (!window.OfflinePwa) {
      return Promise.resolve({ available: false, status: null, queueItems: [] });
    }
    var status = typeof window.OfflinePwa.getStatus === 'function' ? window.OfflinePwa.getStatus() : null;
    var queuePromise = typeof window.OfflinePwa.getQueueItems === 'function'
      ? Promise.resolve(window.OfflinePwa.getQueueItems()).catch(function () { return []; })
      : Promise.resolve([]);
    return queuePromise.then(function (items) {
      var normalized = (Array.isArray(items) ? items : []).map(function (item) {
        var issue = classifyQueueIssue(item);
        return {
          id: String(item && item.id || ''),
          type: String(item && item.type || 'unknown'),
          queuedAt: String(item && item.queuedAt || ''),
          attempts: Number(item && item.attempts || 0),
          source: String(item && item.meta && item.meta.source || ''),
          destination: String(item && item.meta && (item.meta.destination || item.meta.sourceQueueId) || ''),
          conflictCode: String(item && item.conflictCode || ''),
          lastError: String(item && item.lastError || item && item.meta && item.meta.failureReason || ''),
          reasonTitle: issue.title,
          localOnlyReason: issue.reason,
          suggestion: issue.suggestion
        };
      });
      return { available: true, status: status, queueItems: normalized };
    });
  }

   function renderPersistentMetricsCard(snapshot) {
     var tracker = window.PersistentDiagnosticsTracker || { metrics: {} };
     var metrics = tracker.getMetrics ? tracker.getMetrics() : tracker.metrics;
     var lastOpTime = metrics.lastAffectedOperationTime
       ? formatRelativeAge(metrics.lastAffectedOperationTime)
       : 'never';

     return [
       '<section class="diagnostics-hub-card">',
       '<div class="diagnostics-hub-card-title">📊 Active Data Provider Health</div>',
       '<div class="diagnostics-hub-grid" style="grid-template-columns:repeat(3,1fr);gap:12px;">',
       '<div style="border:1px solid #cbd5e1;padding:10px;border-radius:6px;background:#fff7ed;">',
       '<div class="diagnostics-hub-kpi is-warn" style="font-size:20px;margin-bottom:4px;">' + escHtml(String(metrics.liveProviderUnavailableCount || 0)) + '</div>',
       '<div class="diagnostics-hub-note" style="font-size:11px;">Live provider unavailable</div>',
       '</div>',
       '<div style="border:1px solid #cbd5e1;padding:10px;border-radius:6px;background:#fff7ed;">',
       '<div class="diagnostics-hub-kpi is-warn" style="font-size:20px;margin-bottom:4px;">' + escHtml(String(metrics.cachedRowFallbackCount || 0)) + '</div>',
       '<div class="diagnostics-hub-note" style="font-size:11px;">Cached row fallbacks</div>',
       '</div>',
       '<div style="border:1px solid #bfdbfe;padding:10px;border-radius:6px;background:#eff6ff;">',
       '<div style="font-size:11px;font-weight:700;color:#1d4ed8;margin-bottom:4px;">Last operation</div>',
       '<div class="diagnostics-hub-note" style="font-size:11px;">' + escHtml(metrics.lastAffectedOperation || 'none') + '</div>',
       '<div class="diagnostics-hub-note" style="font-size:10px;color:#64748b;">' + escHtml(lastOpTime) + '</div>',
       '</div>',
       '</div>',
       '<div class="diagnostics-hub-note" style="margin-top:8px;">These metrics track when data retrieval falls back to cached rows due to live provider unavailability. Each event is logged and can be exported for debugging.</div>',
       '</section>'
     ].join('');
   }

   function renderOverviewSection(snapshot) {
     var summary = createSyncSummary(snapshot);
     var reliability = snapshot.reliability;
     var knownGood = snapshot.knownGood;
     return [
       '<div class="diagnostics-hub-grid">',
       renderPersistentMetricsCard(snapshot),
       '<section class="diagnostics-hub-card">',
       '<div class="diagnostics-hub-card-title">Local-only data that still needs backend sync</div>',
       '<div class="diagnostics-hub-kpi">' + escHtml(String(summary.pendingSyncRecords)) + '</div>',
       '<div class="diagnostics-hub-note">Includes offline queue items, Adventure Challenge pending tracker rows, and Nature Challenge queued writes.</div>',
       '</section>',
       '<section class="diagnostics-hub-card">',
       '<div class="diagnostics-hub-card-title">Device-only storage entries</div>',
       '<div class="diagnostics-hub-kpi">' + escHtml(String(summary.deviceOnlyEntries)) + '</div>',
       '<div class="diagnostics-hub-note">Preferences, caches, drafts, and reliability baselines that intentionally stay on this device.</div>',
       '</section>',
       '<section class="diagnostics-hub-card">',
       '<div class="diagnostics-hub-card-title">Backend readiness</div>',
       '<div class="diagnostics-hub-kpi ' + (summary.hasSetupIssues ? 'is-warn' : 'is-good') + '">' + escHtml(summary.hasSetupIssues ? 'Needs review' : 'Ready') + '</div>',
       '<div class="diagnostics-hub-note">Flags missing auth, workbook routing issues, and schema mismatches that can force data to remain local-only.</div>',
       '</section>',
       '<section class="diagnostics-hub-card">',
       '<div class="diagnostics-hub-card-title">Reliability snapshot</div>',
       '<div class="diagnostics-hub-kpi">' + escHtml(reliability ? String(reliability.errorCount || 0) : '0') + '</div>',
       '<div class="diagnostics-hub-note">Recent runtime errors. Known-good baselines saved in this browser: ' + escHtml(String(knownGood.count || 0)) + '.</div>',
       '</section>',
       '</div>',
       '<section class="diagnostics-hub-card diagnostics-hub-card--wide">',
       '<div class="diagnostics-hub-card-title">How to use this hub</div>',
       '<ul class="diagnostics-hub-bullets">',
       '<li><strong>Overview</strong> gives a quick health check across queues, device-only storage, reliability, and data provider health.</li>',
       '<li><strong>Local-only data</strong> lists what is currently stored in this browser and whether it is supposed to sync to Excel.</li>',
       '<li><strong>Sync recovery</strong> provides one-click retry actions for queue replays and export-ready diagnostics.</li>',
       '<li><strong>Setup guide</strong> explains why a record may be local only because configuration is missing or mismatched.</li>',
       '<li><strong>Nearby & City Explorer</strong> explains saved-vs-web recommendation behavior, filters, and map actions.</li>',
       '<li><strong>Data Provider Health</strong> tracks when live data providers become unavailable and when cached row fallbacks occur.</li>',
       '</ul>',
       '</section>'
     ].join('');
   }

  function renderStorageSection(snapshot) {
    var offline = snapshot.offline || { queueItems: [] };
    var adventure = snapshot.adventure || {};
    var nature = snapshot.nature || {};
    var inventory = snapshot.storageInventory || [];
    var inventoryRows = inventory.map(function (item) {
      return [
        '<tr>',
        '<td><strong>' + escHtml(item.label) + '</strong><div class="diagnostics-hub-note">' + escHtml(item.key) + '</div></td>',
        '<td>' + escHtml(item.featureArea) + '</td>',
        '<td>' + escHtml(item.backend) + '</td>',
        '<td>' + escHtml(item.reason) + '</td>',
        '<td>' + escHtml(item.area) + ' · ' + escHtml(formatBytes(item.bytes)) + '</td>',
        '</tr>'
      ].join('');
    }).join('');
    var adventureRows = (adventure.pendingLocalOnlyItems || []).map(function (item) {
      return '<li><strong>' + escHtml(item.title || item.placeKey || item.id) + '</strong> · ' + escHtml(item.sourceType || 'adventure') + ' · updated ' + escHtml(formatTime(item.updatedAt)) + '</li>';
    }).join('');
    var natureRows = (nature.queueItems || []).map(function (item) {
      var issue = classifyQueueIssue(item);
      return '<li><strong>' + escHtml(item.type || 'sync') + '</strong> · ' + escHtml(item.subTabKey || 'birds') + ' · ' + escHtml(issue.title) + '</li>';
    }).join('');
    var offlineRows = offline.queueItems.map(function (item) {
      return [
        '<div class="diagnostics-hub-list-item">',
        '<div><strong>' + escHtml(item.type) + '</strong> <span class="diagnostics-hub-badge">' + escHtml(item.reasonTitle) + '</span></div>',
        '<div class="diagnostics-hub-note">Queued ' + escHtml(formatTime(item.queuedAt)) + ' · attempts ' + escHtml(String(item.attempts)) + '</div>',
        '<div class="diagnostics-hub-note">Why local only: ' + escHtml(item.localOnlyReason) + '</div>',
        '</div>'
      ].join('');
    }).join('');
    return [
      '<div class="diagnostics-hub-grid">',
      '<section class="diagnostics-hub-card">',
      '<div class="diagnostics-hub-card-title">Offline queue mirror</div>',
      '<div class="diagnostics-hub-note">These writes are supposed to reach the backend. They remain local only until replay succeeds.</div>',
      (offlineRows || '<div class="diagnostics-hub-empty">No offline queue items are currently pending.</div>'),
      '</section>',
      '<section class="diagnostics-hub-card">',
      '<div class="diagnostics-hub-card-title">Adventure Challenge pending tracker rows</div>',
      '<div class="diagnostics-hub-note">Fast local tracker state that still needs persistence replay.</div>',
      ((adventure.pendingLocalOnlyItems || []).length ? '<ul class="diagnostics-hub-bullets">' + adventureRows + '</ul>' : '<div class="diagnostics-hub-empty">No pending Adventure Challenge tracker rows.</div>'),
      '</section>',
      '<section class="diagnostics-hub-card">',
      '<div class="diagnostics-hub-card-title">Nature Challenge pending writes</div>',
      '<div class="diagnostics-hub-note">Queued sightings/favorites that have not finished syncing to Excel yet.</div>',
      ((nature.queueItems || []).length ? '<ul class="diagnostics-hub-bullets">' + natureRows + '</ul>' : '<div class="diagnostics-hub-empty">No Nature Challenge queue items are pending.</div>'),
      '</section>',
      '</div>',
      '<section class="diagnostics-hub-card diagnostics-hub-card--wide">',
      '<div class="diagnostics-hub-card-title">Device-only inventory</div>',
      '<div class="diagnostics-hub-note">These browser entries are app-related, but are not designed to be written to the Excel backend unless noted.</div>',
      '<div class="diagnostics-hub-table-wrap"><table class="diagnostics-hub-table"><thead><tr><th>Stored item</th><th>Area</th><th>Backend expectation</th><th>Why it stays local</th><th>Storage</th></tr></thead><tbody>' + inventoryRows + '</tbody></table></div>',
      '</section>'
    ].join('');
  }

  function renderSyncSection(snapshot) {
    var offline = snapshot.offline || { queueItems: [], status: {} };
    var nature = snapshot.nature || {};
    var adventure = snapshot.adventure || {};
    var queueHtml = offline.queueItems.map(function (item) {
      return [
        '<div class="diagnostics-hub-list-item">',
        '<div class="diagnostics-hub-list-head">',
        '<strong>' + escHtml(item.type) + '</strong>',
        '<span class="diagnostics-hub-badge">' + escHtml(item.conflictCode || 'queued') + '</span>',
        '</div>',
        '<div class="diagnostics-hub-note">Why local only: ' + escHtml(item.localOnlyReason) + '</div>',
        '<div class="diagnostics-hub-note">Suggested fix: ' + escHtml(item.suggestion) + '</div>',
        '<div class="diagnostics-hub-actions-inline">',
        '<button type="button" class="planner-top-btn" data-diagnostics-action="retry-queue-item" data-queue-id="' + escHtml(item.id) + '">Retry item</button>',
        '<button type="button" class="planner-top-btn" data-diagnostics-action="keep-local-item" data-queue-id="' + escHtml(item.id) + '">Keep local only</button>',
        '</div>',
        '</div>'
      ].join('');
    }).join('');
    return [
      '<section class="diagnostics-hub-card diagnostics-hub-card--wide">',
      '<div class="diagnostics-hub-card-title">Retry and recovery actions</div>',
      '<div class="diagnostics-hub-note">Use these when a sync error caused data to remain local only.</div>',
      '<div class="diagnostics-hub-action-row">',
      '<button type="button" class="planner-top-btn planner-top-btn--success" data-diagnostics-action="retry-all-syncs">Retry all syncs</button>',
      '<button type="button" class="planner-top-btn" data-diagnostics-action="retry-offline-syncs">Retry offline queue</button>',
      '<button type="button" class="planner-top-btn" data-diagnostics-action="retry-nature-syncs">Retry Nature sync</button>',
      '<button type="button" class="planner-top-btn" data-diagnostics-action="open-offline-center">Open Offline Readiness Center</button>',
      '<button type="button" class="planner-top-btn planner-top-btn--accent" data-diagnostics-action="download-reliability-bundle">Download reliability bundle</button>',
      '</div>',
      '<div id="diagnosticsHubActionStatus" aria-live="polite">' + composeDiagnosticsStatusHtml({
        tone: 'info',
        icon: 'ℹ️',
        text: 'Sync queue snapshot is ready.',
        detail: 'Adventure pending: ' + String(adventure.pendingLocalOnlyCount || 0) + ' · Offline queue: ' + String(offline.status && offline.status.pendingCount || 0) + ' · Nature queue: ' + String(nature.pendingQueueCount || 0)
      }) + '</div>',
      '</section>',
      '<section class="diagnostics-hub-card diagnostics-hub-card--wide">',
      '<div class="diagnostics-hub-card-title">Per-item replay hints</div>',
      (queueHtml || '<div class="diagnostics-hub-empty">No queued retry items are currently waiting for intervention.</div>'),
      '</section>'
    ].join('');
  }

  function renderSetupSection(snapshot) {
    var cards = buildSetupGuide(snapshot).map(function (item) {
      return [
        '<div class="diagnostics-hub-card diagnostics-hub-card--guide diagnostics-tone-' + escHtml(item.tone || 'info') + '">',
        '<div class="diagnostics-hub-card-title">' + escHtml(item.title) + '</div>',
        '<div class="diagnostics-hub-guide-row"><strong>Why this causes local-only data:</strong> ' + escHtml(item.why) + '</div>',
        '<div class="diagnostics-hub-guide-row"><strong>How to fix it:</strong> ' + escHtml(item.fix) + '</div>',
        '</div>'
      ].join('');
    }).join('');
    return '<div class="diagnostics-hub-grid diagnostics-hub-grid--guide">' + cards + '</div>';
  }

  function renderNearbySection(snapshot) {
    return [
      '<section class="diagnostics-hub-card diagnostics-hub-card--wide">',
      '<div class="diagnostics-hub-card-title">Nearby / City Explorer diagnostics</div>',
      '<div class="diagnostics-hub-note">The refreshed nearby flow now blends saved app locations with web recommendations. Saved locations are intentionally ranked first, while web recommendations remain visible with clear origin badges.</div>',
      '<ul class="diagnostics-hub-bullets">',
      '<li><strong>Saved in app</strong> badges mark locations already stored in your workbooks or synced local drafts.</li>',
      '<li><strong>Web recommendation</strong> badges mark Google/web suggestions that are not yet saved in the app.</li>',
      '<li>Quick-tag pills now show how many results would match if that pill were applied.</li>',
      '<li>Non-Nature rows hide Nature-only fields such as duration, difficulty, and trail length.</li>',
      '<li>Quick Actions now include a direct shortcut into the split map view for the selected location.</li>',
      '</ul>',
      '<div class="diagnostics-hub-action-row">',
      '<button type="button" class="planner-top-btn" data-diagnostics-action="open-city-viewer-nearby">Open City Explorer</button>',
      '<button type="button" class="planner-top-btn" data-diagnostics-action="open-adventure-planner">Open Adventure Planner</button>',
      '</div>',
      '</section>',
      '<section class="diagnostics-hub-card diagnostics-hub-card--wide">',
      '<div class="diagnostics-hub-card-title">When to use this section</div>',
      '<div class="diagnostics-hub-note">Use this when nearby recommendations look incomplete, filters do not behave as expected, or you need to confirm whether a result is coming from your saved data or the web. If web recommendations are empty, review the setup guide for API-key and coordinate prerequisites.</div>',
      '</section>'
    ].join('');
  }

  function renderPlacesHealthSection(snapshot) {
    var places = snapshot.placesHealth || { available: false, status: 'unknown', ok: false, summary: 'Not tested', steps: [] };
    var statusColor = places.ok ? '#047857' : (places.status === 'unknown' ? '#64748b' : '#b45309');
    var statusLabel = places.ok ? '✓ Healthy' : (places.status === 'unknown' ? '? Not tested' : '⚠ Issues detected');
    var stepsHtml = (Array.isArray(places.steps) ? places.steps : []).map(function(step) {
      var stepStatus = step.status === 'pass' ? '✓' : (step.status === 'fail' ? '✕' : '•');
      var stepColor = step.status === 'pass' ? '#047857' : (step.status === 'fail' ? '#dc2626' : '#64748b');
      return [
        '<div class="diagnostics-hub-list-item" style="border-left:3px solid ' + escHtml(stepColor) + ';">',
        '<div style="font-weight:700;color:' + escHtml(stepColor) + ';">' + escHtml(stepStatus) + ' ' + escHtml(step.key || 'step') + '</div>',
        '<div class="diagnostics-hub-note">' + escHtml(step.detail || '') + '</div>',
        (step.advice ? '<div class="diagnostics-hub-note"><strong>💡 Suggestion:</strong> ' + escHtml(step.advice) + '</div>' : ''),
        '</div>'
      ].join('');
    }).join('');

    return [
      '<div class="diagnostics-hub-grid">',
      '<section class="diagnostics-hub-card">',
      '<div class="diagnostics-hub-card-title">🌍 Places API Status</div>',
      '<div class="diagnostics-hub-kpi ' + (places.ok ? 'is-good' : places.status === 'unknown' ? '' : 'is-warn') + '" style="color:' + escHtml(statusColor) + ';">' + escHtml(statusLabel) + '</div>',
      '<div class="diagnostics-hub-note">Overall status: ' + escHtml(places.summary || 'Not available') + '</div>',
      '</section>',
      '<section class="diagnostics-hub-card">',
      '<div class="diagnostics-hub-card-title">Test Details</div>',
      '<div class="diagnostics-hub-note"><strong>Query:</strong> ' + escHtml(places.query || 'Not specified') + '</div>',
      '<div class="diagnostics-hub-note"><strong>Place ID:</strong> ' + escHtml(places.placeIdUsed || 'Not used') + '</div>',
      '<div class="diagnostics-hub-note"><strong>Test Status:</strong> ' + escHtml(places.status || 'unknown') + '</div>',
      '</section>',
      '</div>',
      '<section class="diagnostics-hub-card diagnostics-hub-card--wide">',
      '<div class="diagnostics-hub-card-title">Health Check Steps</div>',
      (stepsHtml ? stepsHtml : '<div class="diagnostics-hub-empty">No health check data available. Run the Places API health test.</div>'),
      '</section>',
      '<section class="diagnostics-hub-card diagnostics-hub-card--wide">',
      '<div class="diagnostics-hub-card-title">About Places API Health</div>',
      '<ul class="diagnostics-hub-bullets">',
      '<li>This section validates your Google Places API key configuration and connectivity.</li>',
      '<li>The health check tests Place search, Place details retrieval, and Google Maps library availability.</li>',
      '<li>If any step fails, check your API key in the browser console and ensure the required APIs are enabled in Google Cloud Console.</li>',
      '<li>To run a full health check in the browser, use the Places API test in the automation panel or the developer console.</li>',
      '</ul>',
      '</section>'
    ].join('');
  }

  function renderNav(state) {
    var labels = {
      overview: 'Overview',
      storage: 'Local-only data',
      sync: 'Sync recovery',
      setup: 'Setup guide',
      nearby: 'Nearby & City Explorer',
      places: 'Places API health'
    };
    return SECTION_KEYS.map(function (key) {
      var active = state.currentSection === key;
      return '<button type="button" class="diagnostics-hub-tab' + (active ? ' active' : '') + '" data-diagnostics-section="' + escHtml(key) + '" aria-pressed="' + (active ? 'true' : 'false') + '">' + escHtml(labels[key]) + '</button>';
    }).join('');
  }

  function renderHub(snapshot, state) {
    var host = document.getElementById('diagnosticsHubMount');
    if (!host) return;
    var summary = createSyncSummary(snapshot);
    var sectionHtml = '';
    if (state.currentSection === 'storage') sectionHtml = renderStorageSection(snapshot);
    else if (state.currentSection === 'sync') sectionHtml = renderSyncSection(snapshot);
    else if (state.currentSection === 'setup') sectionHtml = renderSetupSection(snapshot);
    else if (state.currentSection === 'nearby') sectionHtml = renderNearbySection(snapshot);
    else if (state.currentSection === 'places') sectionHtml = renderPlacesHealthSection(snapshot);
    else sectionHtml = renderOverviewSection(snapshot);

    host.innerHTML = [
      '<div class="diagnostics-hub-shell">',
      '<div class="diagnostics-hub-header-row ui-section-header-row">',
      '<div>',
      '<div class="card-title">🩺 Central Diagnostics Hub</div>',
      '<div class="card-subtitle">Unified visibility into local-only data, queue replay, backend setup issues, and nearby recommendation behavior.</div>',
      '</div>',
      '<div class="diagnostics-hub-summary-pills ui-section-header-actions">',
      '<span class="offline-badge" data-state="' + (summary.pendingSyncRecords > 0 ? 'syncing' : 'ready') + '">Pending sync: ' + escHtml(String(summary.pendingSyncRecords)) + '</span>',
      '<span class="offline-badge" data-state="' + (summary.authReady ? 'ready' : 'warning') + '">Auth: ' + escHtml(summary.authReady ? 'ready' : 'local only') + '</span>',
      '<span class="offline-badge" data-state="' + (summary.hasSetupIssues ? 'warning' : 'ready') + '">Setup: ' + escHtml(summary.hasSetupIssues ? 'review needed' : 'ready') + '</span>',
      '</div>',
      '</div>',
      '<div class="diagnostics-hub-section-tabs">' + renderNav(state) + '</div>',
      sectionHtml,
      '</div>'
    ].join('');
  }

  function getState() {
    if (!window.__diagnosticsHubState) {
      window.__diagnosticsHubState = { currentSection: 'overview', source: 'manual' };
    }
    return window.__diagnosticsHubState;
  }

  function normalizeSection(section) {
    var candidate = String(section || '').trim().toLowerCase();
    return SECTION_KEYS.indexOf(candidate) >= 0 ? candidate : 'overview';
  }

  function readSectionFromUrl() {
    try {
      var params = new URLSearchParams(window.location.search || '');
      return normalizeSection(params.get('diagSection') || 'overview');
    } catch (_error) {
      return 'overview';
    }
  }

  function syncHubUrl(section, source, historyMode) {
    try {
      var url = new URL(window.location.href);
      url.searchParams.set('tab', TAB_ID);
      url.searchParams.set('diagSection', normalizeSection(section));
      if (source) url.searchParams.set('diagSource', String(source));
      else url.searchParams.delete('diagSource');
      if (historyMode === 'push') window.history.pushState(window.history.state, '', url.toString());
      else window.history.replaceState(window.history.state, '', url.toString());
    } catch (_error) {
      // Best effort only.
    }
  }

  function collectSnapshot() {
    var state = getState();
    return collectOfflineSnapshot().then(function (offline) {
      return getPlacesHealthSnapshot().then(function(placesHealth) {
        return {
          offline: offline,
          adventure: getAdventureSnapshot(),
          nature: getNatureSnapshot(),
          placesHealth: placesHealth,
          storageInventory: buildStorageInventory(),
          reliability: readReliabilitySnapshot(),
          knownGood: readKnownGoodInfo(),
          source: state.source
        };
      });
    });
  }

  function refreshDiagnosticsHub() {
    var state = getState();
    var mount = document.getElementById('diagnosticsHubMount');
    if (!mount) return Promise.resolve(null);
    mount.innerHTML = '<div class="diagnostics-hub-loading ui-loading-state">' + composeDiagnosticsStatusHtml({ tone: 'info', icon: '⏳', text: 'Refreshing diagnostics...', detail: 'Please wait while local and sync snapshots are collected.' }) + '</div>';
    return collectSnapshot().then(function (snapshot) {
      renderHub(snapshot, state);
      window.__diagnosticsHubLastSnapshot = snapshot;
      return snapshot;
    }).catch(function (error) {
      mount.innerHTML = '<div class="diagnostics-hub-empty ui-empty-state">' + composeDiagnosticsStatusHtml({ tone: 'error', icon: '❌', text: 'Diagnostics could not be rendered right now.', detail: String(error && error.message ? error.message : error || 'Unknown error') }) + '</div>';
      return null;
    });
  }

  function setActionStatus(text, tone, detail) {
    var el = document.getElementById('diagnosticsHubActionStatus');
    if (!el) return;
    el.innerHTML = composeDiagnosticsStatusHtml({
      tone: tone || 'info',
      icon: tone === 'error' ? '❌' : (tone === 'success' ? '✅' : (tone === 'warning' ? '⚠️' : 'ℹ️')),
      text: String(text || '').trim(),
      detail: String(detail || '').trim()
    });
  }

  function openTab(tabId, source) {
    if (window.tabLoader && typeof window.tabLoader.switchTab === 'function') {
      window.tabLoader.switchTab(tabId, { syncUrl: false, source: source || 'diagnostics-hub' });
      return true;
    }
    return false;
  }

  function openDiagnosticsHubPage(options) {
    var opts = options || {};
    var state = getState();
    var activeBtn = document.querySelector('.app-tab-btn.active');
    var activeTab = String(activeBtn && activeBtn.getAttribute ? activeBtn.getAttribute('data-tab') || '' : '');
    if (activeTab && activeTab !== TAB_ID) {
      state.previousTab = activeTab;
    }
    state.currentSection = normalizeSection(opts.section || readSectionFromUrl());
    state.source = String(opts.source || 'manual');
    // Write desired section first so tab-switch listeners read the intended deep-link.
    syncHubUrl(state.currentSection, state.source, opts.historyMode === 'replace' ? 'replace' : 'push');
    if (window.tabLoader && typeof window.tabLoader.switchTab === 'function') {
      window.tabLoader.switchTab(TAB_ID, { syncUrl: false, source: 'diagnostics-open:' + state.source });
    }
    refreshDiagnosticsHub();
    return true;
  }

  function runDiagnosticsAction(action, queueId) {
    if (action === 'retry-all-syncs') {
      setActionStatus('Retrying all sync paths...', 'info');
      return Promise.all([
        window.OfflinePwa && typeof window.OfflinePwa.flushQueue === 'function' ? window.OfflinePwa.flushQueue() : Promise.resolve(null),
        typeof window.runBirdSyncNow === 'function' ? window.runBirdSyncNow() : Promise.resolve(null)
      ]).then(function () {
        setActionStatus('Retry all syncs finished.', 'success', 'Refreshing diagnostics now.');
        return refreshDiagnosticsHub();
      });
    }
    if (action === 'retry-offline-syncs') {
      setActionStatus('Retrying offline queue...', 'info');
      return Promise.resolve(window.OfflinePwa && typeof window.OfflinePwa.flushQueue === 'function' ? window.OfflinePwa.flushQueue() : null)
        .then(function () { setActionStatus('Offline queue replay finished.', 'success'); return refreshDiagnosticsHub(); });
    }
    if (action === 'retry-nature-syncs') {
      setActionStatus('Retrying Nature Challenge sync...', 'info');
      return Promise.resolve(typeof window.runBirdSyncNow === 'function' ? window.runBirdSyncNow() : null)
        .then(function () { setActionStatus('Nature Challenge sync finished.', 'success'); return refreshDiagnosticsHub(); });
    }
    if (action === 'retry-queue-item' && queueId && window.OfflinePwa && typeof window.OfflinePwa.resolveConflict === 'function') {
      setActionStatus('Retrying queued item...', 'info');
      return Promise.resolve(window.OfflinePwa.resolveConflict('retry', queueId))
        .then(function () { setActionStatus('Queued item retry finished.', 'success'); return refreshDiagnosticsHub(); });
    }
    if (action === 'keep-local-item' && queueId && window.OfflinePwa && typeof window.OfflinePwa.resolveConflict === 'function') {
      setActionStatus('Keeping queued item local-only...', 'warning', 'This removes it from backend replay attempts.');
      return Promise.resolve(window.OfflinePwa.resolveConflict('keep-local', queueId))
        .then(function () { setActionStatus('Queued item was kept local-only.', 'warning'); return refreshDiagnosticsHub(); });
    }
    if (action === 'open-offline-center') {
      if (typeof window.openOfflineModePage === 'function') {
        window.openOfflineModePage({ source: 'diagnostics-hub' });
      } else {
        openTab('offline-mode', 'diagnostics-hub');
      }
      return Promise.resolve(true);
    }
    if (action === 'download-reliability-bundle' && typeof window.exportReliabilityDiagnosticsBundle === 'function') {
      window.exportReliabilityDiagnosticsBundle();
      return Promise.resolve(true);
    }
    if (action === 'open-city-viewer-nearby') {
      if (typeof window.openCityViewerWindow === 'function') {
        window.openCityViewerWindow({ sourceSubtab: 'diagnostics-hub-nearby', prefilterLabel: 'Diagnostics Hub Nearby' });
      }
      return Promise.resolve(true);
    }
    if (action === 'open-adventure-planner') {
      openTab('adventure-planner', 'diagnostics-hub');
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  function bindHubEvents() {
    if (document.body && document.body.dataset.diagnosticsHubBound === '1') return;
    document.addEventListener('click', function (event) {
      var target = event.target && event.target.closest ? event.target.closest('[data-diagnostics-section], [data-diagnostics-action]') : null;
      if (!target) return;
      if (target.hasAttribute('data-diagnostics-section')) {
        event.preventDefault();
        var section = normalizeSection(target.getAttribute('data-diagnostics-section'));
        var state = getState();
        state.currentSection = section;
        syncHubUrl(section, state.source, 'replace');
        refreshDiagnosticsHub();
        return;
      }
      if (target.hasAttribute('data-diagnostics-action')) {
        event.preventDefault();
        runDiagnosticsAction(target.getAttribute('data-diagnostics-action'), target.getAttribute('data-queue-id'));
      }
    }, true);
    if (document.body) document.body.dataset.diagnosticsHubBound = '1';
  }

  function bindLauncherButtons() {
    if (!document.body || document.body.dataset.diagnosticsHubLaunchersBound === '1') return;
    var headerBtn = document.getElementById('diagnosticsHubBtn');
    if (headerBtn) {
      headerBtn.addEventListener('click', function () {
        openDiagnosticsHubPage({ section: 'overview', source: 'header' });
      });
    }
    var backBtn = document.getElementById('diagnosticsHubBackBtn');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        var state = getState();
        if (!openTab(state.previousTab || 'adventure-planner', 'diagnostics-hub-back')) {
          window.location.href = '?tab=' + encodeURIComponent(state.previousTab || 'adventure-planner');
        }
      });
    }
    document.body.dataset.diagnosticsHubLaunchersBound = '1';
  }

  window.openDiagnosticsHubPage = openDiagnosticsHubPage;
  window.refreshDiagnosticsHub = refreshDiagnosticsHub;
  window.getDiagnosticsHubSnapshot = function () {
    return window.__diagnosticsHubLastSnapshot || null;
  };

  ensureHubStyles();
  bindHubEvents();
  bindLauncherButtons();

  window.addEventListener('app:tab-switched', function (event) {
    var tabId = event && event.detail ? event.detail.tabId : '';
    if (tabId !== TAB_ID) return;
    var state = getState();
    state.currentSection = readSectionFromUrl() || state.currentSection;
    refreshDiagnosticsHub();
  });

  if (readSectionFromUrl()) {
    var initState = getState();
    initState.currentSection = readSectionFromUrl();
  }
})();

