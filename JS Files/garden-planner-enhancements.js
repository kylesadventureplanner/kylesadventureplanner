/**
 * Garden Planner Enhancements – 19-feature pack
 * Requires garden-planner-system.js (exposes window.kapGarden + window.kapGardenHooks)
 *
 * Features:
 *  1. Planting Calendar + Reminders  (Henderson County, NC – Zone 7a)
 *  2. Photo Gallery UX               (thumbnail strip, lightbox, drag-to-reorder, captions, primary pick)
 *  3. Observation Log Timeline       (dated sightings + season bar-chart + inline edit)
 *  4. Native Priority Score          (NC/Henderson native + pollinator host composite)
 *  5. Bulk Actions                   (bulk edit location, flags, custom tags)
 *  6. Duplicate Detection            (fuzzy name matching on save)
 *  7. Sync Conflict Panel            (local vs last-Excel-snapshot diff before overwrite)
 *  8. Export Views                   (pollinator-only, bird-support, to-buy – CSV + print)
 *  9. Toast Confirmations & Undo     (plant saved, synced, delete undo toast + history panel)
 * 10. Active Filter Chips            (one-click filter removal)
 *  A. Bloom Timeline Bar             (compact 12-month color-coded bar on every card)
 *  B. Per-Plant Task / Care Log      (watered, fertilized, pruned, transplanted + undo)
 *  C. Companion Planting Widget      (neighbors by shared bloom season, location, wildlife)
 *  D. Phenology Journaling           (first-bloom date per year, auto-captured from 🌸 obs, year-over-year chart)
 *  E. Garden Map / Bed Diagram       (CSS-grid drag-and-drop bed map keyed to locationPlanted)
 *  F. Succession Planting Planner    (bloom-gap chart + Henderson County native fill-in suggestions)
 *  G. Weather + Watering Integration (Open-Meteo free API, 💧 alerts when dry week + no watering logged)
 *  H. NC Native Plant Lookup         (iNaturalist autocomplete + USDA Plants NC native status auto-fill)
 *  I. Freeze/Frost Alerts            (Open-Meteo forecast min temps, 🧊 badge on frost-sensitive plants)
 *  J. QR Code Plant Labels           (printable 3-up labels per plant + batch all-plants label sheet)
 *  K. Species Interaction Network    (D3.js v7 force graph of plants ↔ butterfly/bee/bird species)
 *  L. Mobile Field-Use Mode          (big-button quick logger for bloom, watering, and sightings)
 */
(function () {
  'use strict';

  // ─── Storage ────────────────────────────────────────────────────────────────
  var ENH_KEY = 'kapGardenEnhV1';

  var enhState = {
    obsLog:        {},   // { [plantId]: [{id,date,type,species,count,notes}] }
    taskLog:       {},   // { [plantId]: [{id,date,type,notes}] }  gardener actions
    customTags:    {},   // { [plantId]: string[] }
    excelSnapshot: {},   // { [plantId]: plant }  last known Excel state
    photoCaptions: {},   // { [plantId]: { [url]: caption } }
    phenology:     {},   // { [plantId]: { [year]: 'YYYY-MM-DD' } }  first-bloom dates
    fieldRecentPlants: [], // recent plant ids used in mobile field mode
    fieldFavorites: [], // pinned favorites for patrols / repeated checks
    fieldPatrolPlants: [], // route-specific plants checked often
    fieldOfflineQueue: [], // local-only field actions recorded while offline
    fieldMediaLog:   {}, // { [plantId]: [{id,date,url,caption,kind,ts}] }
    locationCoords:  {}, // { [locationName]: { lat, lon, ts } }
    fieldTheme:      'default',
    weatherCache:  null, // { fetchedAt, totalMm, days }  Open-Meteo cache
    bulkSelected:  [],
    bulkMode:      false,
    lightboxPlantId: null,
    lightboxIndex:   0,
    calMonth: new Date().getMonth()
  };

  var fieldModeState = {
    selectedPlantId: '',
    search: '',
    date: new Date().toISOString().slice(0, 10),
    sightingType: 'bee',
    showSightingExtras: false,
    sightingSpecies: '',
    sightingCount: '1',
    sightingNotes: '',
    lastActionText: '',
    voiceListening: false,
    voiceTranscript: '',
    voiceDraft: null,
    currentPosition: null,
    geoStatus: '',
    locationRequestedAt: 0
  };

  // ── Undo history (in-memory only, not persisted) ─────────────────────────
  var undoHistory = [];   // [{id, label, ts, fn}]  newest first
  var MAX_UNDO_HISTORY = 10;

  function pushUndoHistory(label, fn) {
    undoHistory.unshift({ id: uid(), label: label, ts: Date.now(), fn: fn });
    if (undoHistory.length > MAX_UNDO_HISTORY) undoHistory.length = MAX_UNDO_HISTORY;
    refreshUndoPanel();
  }

  function timeAgo(ts) {
    var s = Math.round((Date.now() - ts) / 1000);
    if (s < 10)  return 'just now';
    if (s < 60)  return s + 's ago';
    if (s < 3600) return Math.round(s / 60) + 'm ago';
    return Math.round(s / 3600) + 'h ago';
  }

  function refreshUndoPanel() {
    var panel = document.getElementById('gardenUndoHistoryPanel');
    if (!panel || panel.style.display === 'none') return;
    renderUndoPanelContent(panel);
  }

  function renderUndoPanelContent(panel) {
    if (!undoHistory.length) {
      panel.innerHTML = '<div style="padding:14px 16px;color:#6b7280;font-size:13px;text-align:center;">No recent actions yet.</div>';
      return;
    }
    panel.innerHTML = '<ul style="list-style:none;margin:0;padding:0;">'
      + undoHistory.map(function (item) {
          return '<li style="display:flex;justify-content:space-between;align-items:center;padding:8px 14px;border-bottom:1px solid #f1f5f9;gap:8px;">'
            + '<span style="display:grid;gap:1px;">'
            + '<span style="font-size:13px;color:#0f172a;font-weight:600;">' + esc(item.label) + '</span>'
            + '<span class="garden-undo-panel-ts" style="font-size:11px;color:#94a3b8;" data-ts="' + item.ts + '">' + esc(timeAgo(item.ts)) + '</span>'
            + '</span>'
            + '<button type="button" class="garden-btn" style="font-size:11px;padding:4px 10px;background:#dbeafe;color:#1d4ed8;border-color:#bfdbfe;white-space:nowrap;" data-undo-id="' + esc(item.id) + '">↩ Undo</button>'
            + '</li>';
        }).join('')
      + '</ul>';
    panel.querySelectorAll('[data-undo-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-undo-id');
        var idx = undoHistory.findIndex ? undoHistory.findIndex(function (h) { return h.id === id; }) : -1;
        if (idx < 0) {
          for (var i = 0; i < undoHistory.length; i++) { if (undoHistory[i].id === id) { idx = i; break; } }
        }
        if (idx < 0) return;
        var item = undoHistory.splice(idx, 1)[0];
        if (typeof item.fn === 'function') item.fn();
        refreshUndoPanel();
        gardenToast('Undone: ' + item.label, 'info', 1800);
      });
    });
  }

  // Refresh relative timestamps every 30s
  setInterval(function () {
    document.querySelectorAll('.garden-undo-panel-ts[data-ts]').forEach(function (el) {
      el.textContent = timeAgo(parseInt(el.getAttribute('data-ts'), 10));
    });
  }, 30000);

  function saveEnh() {
    try {
      localStorage.setItem(ENH_KEY, JSON.stringify({
        obsLog:        enhState.obsLog,
        taskLog:       enhState.taskLog,
        customTags:    enhState.customTags,
        excelSnapshot: enhState.excelSnapshot,
        photoCaptions: enhState.photoCaptions,
        phenology:     enhState.phenology,
        fieldRecentPlants: enhState.fieldRecentPlants,
        fieldFavorites: enhState.fieldFavorites,
        fieldPatrolPlants: enhState.fieldPatrolPlants,
        fieldOfflineQueue: enhState.fieldOfflineQueue,
        fieldMediaLog: enhState.fieldMediaLog,
        locationCoords: enhState.locationCoords,
        fieldTheme: enhState.fieldTheme
      }));
    } catch (_) {}
  }

  function loadEnh() {
    try {
      var d = JSON.parse(localStorage.getItem(ENH_KEY) || '{}');
      enhState.obsLog        = d.obsLog        || {};
      enhState.taskLog       = d.taskLog       || {};
      enhState.customTags    = d.customTags    || {};
      enhState.excelSnapshot = d.excelSnapshot || {};
      enhState.photoCaptions = d.photoCaptions || {};
      enhState.phenology     = d.phenology     || {};
      enhState.fieldRecentPlants = d.fieldRecentPlants || [];
      enhState.fieldFavorites = d.fieldFavorites || [];
      enhState.fieldPatrolPlants = d.fieldPatrolPlants || [];
      enhState.fieldOfflineQueue = d.fieldOfflineQueue || [];
      enhState.fieldMediaLog = d.fieldMediaLog || {};
      enhState.locationCoords = d.locationCoords || {};
      enhState.fieldTheme = d.fieldTheme || 'default';
    } catch (_) {}
  }

  // ─── Tiny helpers ────────────────────────────────────────────────────────────
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }
  function uid() { return 'enh_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7); }
  function G()    { return window.kapGarden; }

  function gardenToast(message, type, duration) {
    if (window.showToast) window.showToast(message, type || 'success', duration || 2500);
  }

  function cloneJson(v) {
    return JSON.parse(JSON.stringify(v));
  }

  function todayIso() {
    return new Date().toISOString().slice(0, 10);
  }

  function getPlantById(plantId) {
    var kapG = G();
    if (!kapG || !kapG.state || !kapG.state.plants) return null;
    return kapG.state.plants.find(function (p) { return p.id === plantId; }) || null;
  }

  function touchFieldRecentPlant(plantId) {
    if (!plantId) return;
    enhState.fieldRecentPlants = (enhState.fieldRecentPlants || []).filter(function (id) { return id !== plantId; });
    enhState.fieldRecentPlants.unshift(plantId);
    if (enhState.fieldRecentPlants.length > 8) enhState.fieldRecentPlants.length = 8;
    saveEnh();
  }

  function toggleIdInEnhList(key, plantId, maxLen) {
    if (!plantId) return false;
    var exists = (enhState[key] || []).indexOf(plantId) >= 0;
    enhState[key] = (enhState[key] || []).filter(function (id) { return id !== plantId; });
    var enabled = !exists;
    if (enabled) enhState[key].unshift(plantId);
    if (maxLen && enhState[key].length > maxLen) enhState[key].length = maxLen;
    saveEnh();
    return enabled;
  }

  function hasEnhListId(key, plantId) {
    return (enhState[key] || []).indexOf(plantId) >= 0;
  }

  function getPlantLocationKey(plant) {
    return String(plant && plant.locationPlanted || '').trim();
  }

  function isFieldModeOpen() {
    var modal = document.getElementById('gardenFieldModeModal');
    return !!(modal && modal.classList.contains('open'));
  }

  function isBrowserOnline() {
    return navigator.onLine !== false;
  }

  function enqueueOfflineFieldAction(kind, plantId, label, extra) {
    if (isBrowserOnline()) return;
    enhState.fieldOfflineQueue = enhState.fieldOfflineQueue || [];
    enhState.fieldOfflineQueue.unshift({
      id: uid(),
      kind: kind || 'field',
      plantId: plantId || '',
      label: label || 'Field action saved locally',
      ts: Date.now(),
      date: todayIso(),
      extra: extra || {}
    });
    if (enhState.fieldOfflineQueue.length > 30) enhState.fieldOfflineQueue.length = 30;
    saveEnh();
  }

  function clearOfflineFieldQueue() {
    enhState.fieldOfflineQueue = [];
    saveEnh();
  }

  function renderFieldQueueBanner() {
    var queue = enhState.fieldOfflineQueue || [];
    if (isBrowserOnline() && !queue.length) return '';
    var labels = queue.slice(0, 3).map(function (item) { return '• ' + item.label; }).join('<br>');
    if (!isBrowserOnline()) {
      return '<div class="garden-field-queue-banner is-offline">'
        + '<strong>📡 Offline — field notes are saving locally.</strong>'
        + '<span>' + (queue.length ? queue.length + ' queued local note' + (queue.length !== 1 ? 's' : '') + ' ready to review later.' : 'You can keep logging bloom, watering, sightings, and photos without signal.') + '</span>'
        + (labels ? '<div class="garden-field-queue-list">' + labels + '</div>' : '')
        + '</div>';
    }
    return '<div class="garden-field-queue-banner is-online">'
      + '<strong>✅ Back online.</strong>'
      + '<span>' + queue.length + ' field note' + (queue.length !== 1 ? 's were' : ' was') + ' saved locally while offline. They are safe here and can be synced to Excel later.</span>'
      + (labels ? '<div class="garden-field-queue-list">' + labels + '</div>' : '')
      + '<div><button type="button" class="garden-btn" id="gardenFieldQueueClearBtn">Clear queue banner</button></div>'
      + '</div>';
  }

  function haversineMiles(aLat, aLon, bLat, bLon) {
    var toRad = Math.PI / 180;
    var dLat = (bLat - aLat) * toRad;
    var dLon = (bLon - aLon) * toRad;
    var aa = Math.sin(dLat / 2) * Math.sin(dLat / 2)
      + Math.cos(aLat * toRad) * Math.cos(bLat * toRad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 3958.8 * (2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa)));
  }

  function getNearbyPlants(position, plants) {
    if (!position || !plants || !plants.length) return [];
    return plants.map(function (plant) {
      var locKey = getPlantLocationKey(plant);
      var coords = locKey && enhState.locationCoords ? enhState.locationCoords[locKey] : null;
      if (!coords) return null;
      return {
        plant: plant,
        distanceMiles: haversineMiles(position.lat, position.lon, coords.lat, coords.lon),
        location: locKey
      };
    }).filter(Boolean).sort(function (a, b) {
      var favDelta = (hasEnhListId('fieldFavorites', a.plant.id) ? -1 : 0) - (hasEnhListId('fieldFavorites', b.plant.id) ? -1 : 0);
      if (favDelta) return favDelta;
      return a.distanceMiles - b.distanceMiles;
    });
  }

  function requestFieldPosition(onSuccess) {
    if (!navigator.geolocation) {
      fieldModeState.geoStatus = 'Geolocation is not supported on this device/browser.';
      if (isFieldModeOpen()) renderFieldMode();
      return;
    }
    fieldModeState.geoStatus = 'Finding your current location…';
    fieldModeState.locationRequestedAt = Date.now();
    if (isFieldModeOpen()) renderFieldMode();
    navigator.geolocation.getCurrentPosition(function (pos) {
      fieldModeState.currentPosition = {
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        ts: Date.now()
      };
      fieldModeState.geoStatus = 'Using your current location' + (pos.coords.accuracy ? ' (±' + Math.round(pos.coords.accuracy) + ' m)' : '') + '.';
      if (typeof onSuccess === 'function') onSuccess(fieldModeState.currentPosition);
      if (isFieldModeOpen()) renderFieldMode();
    }, function (err) {
      fieldModeState.geoStatus = err && err.message ? err.message : 'Could not get your location.';
      if (isFieldModeOpen()) renderFieldMode();
    }, { enableHighAccuracy: true, maximumAge: 60000, timeout: 12000 });
  }

  function saveCurrentSpotForPlantLocation(plant) {
    if (!plant) return;
    var locKey = getPlantLocationKey(plant);
    if (!locKey) {
      gardenToast('Set a plant location before saving a rough bed spot.', 'error', 2200);
      return;
    }
    var doSave = function (pos) {
      enhState.locationCoords = enhState.locationCoords || {};
      enhState.locationCoords[locKey] = { lat: pos.lat, lon: pos.lon, ts: Date.now() };
      saveEnh();
      fieldModeState.lastActionText = '📍 Saved a rough location for ' + locKey + '.';
      if (isFieldModeOpen()) renderFieldMode();
      gardenToast('Saved rough map spot for ' + locKey, 'success', 2000);
    };
    if (fieldModeState.currentPosition) doSave(fieldModeState.currentPosition);
    else requestFieldPosition(doSave);
  }

  function getSpeechRecognitionCtor() {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }

  function parseSpokenFieldTranscript(transcript, plant) {
    var raw = String(transcript || '').trim();
    if (!raw) return null;
    var lower = raw.toLowerCase();
    var numWords = { one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10, a:1, an:1 };
    var count = '1';
    var numMatch = lower.match(/\b(\d+)\b/);
    if (numMatch) count = numMatch[1];
    else Object.keys(numWords).some(function (word) {
      if (new RegExp('\\b' + word + '\\b').test(lower)) { count = String(numWords[word]); return true; }
      return false;
    });

    var action = 'sighting';
    if (/\b(water|watered|watering|soaked|hose|irrigat)/.test(lower)) action = 'watered';
    else if (/\b(bloom|blooming|flowered|flowering|first bloom|opened up)/.test(lower)) action = 'bloom';

    var type = 'other';
    if (/\b(swallowtail|monarch|skipper|butterfl)/.test(lower)) type = 'butterfly';
    else if (/\b(bee|bumble|carpenter bee|mason bee|sweat bee)/.test(lower)) type = 'bee';
    else if (/\b(bird|robin|finch|cardinal|wren|hummingbird)/.test(lower)) type = 'bird';
    else if (/\b(deer)/.test(lower)) type = 'deer';
    else if (/\b(rabbit|bunny)/.test(lower)) type = 'rabbit';
    else if (/\b(insect|beetle|moth|dragonfly|hoverfly)/.test(lower)) type = 'insect';

    var species = raw
      .replace(/^\s*(i\s+)?(saw|seen|noticed|found|spotted|there\s+(?:was|were)|logged?)\s+/i, '')
      .replace(/\b(on|at|near|by)\b.*$/i, '')
      .replace(/\b(?:a|an|one|two|three|four|five|six|seven|eight|nine|ten|\d+)\b/ig, '')
      .replace(/\b(?:watering|watered|water|bloom|blooming|flowered|flowering|first)\b/ig, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (plant && plant.commonName) {
      var plantRe = new RegExp(String(plant.commonName).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig');
      species = species.replace(plantRe, '').replace(/\s+/g, ' ').trim();
    }
    if (action !== 'sighting') species = '';
    return {
      transcript: raw,
      action: action,
      type: type,
      count: count,
      species: species,
      notes: action === 'sighting' ? '' : raw
    };
  }

  function applyVoiceDraftToFieldMode(draft) {
    if (!draft) return;
    fieldModeState.voiceDraft = draft;
    fieldModeState.voiceTranscript = draft.transcript || '';
    if (draft.action === 'sighting') {
      fieldModeState.sightingType = draft.type || 'other';
      fieldModeState.sightingCount = draft.count || '1';
      fieldModeState.sightingSpecies = draft.species || '';
      fieldModeState.sightingNotes = draft.notes || '';
      fieldModeState.showSightingExtras = true;
      fieldModeState.lastActionText = '🎙 Voice note drafted a ' + fieldModeState.sightingType + ' sighting. Review and tap log.';
    } else {
      fieldModeState.lastActionText = '🎙 Voice draft ready: ' + draft.action + '. Review below and apply when ready.';
    }
  }

  function startFieldVoiceCapture() {
    var Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      gardenToast('Speech recognition is not supported in this browser.', 'error', 2500);
      return;
    }
    if (fieldModeState.voiceListening && fieldModeState._recognition) {
      fieldModeState._recognition.stop();
      return;
    }
    var recognition = new Ctor();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    fieldModeState._recognition = recognition;
    fieldModeState.voiceListening = true;
    fieldModeState.lastActionText = '🎙 Listening… say something like “Saw two swallowtails on coneflower.”';
    if (isFieldModeOpen()) renderFieldMode();
    recognition.onresult = function (event) {
      var transcript = event.results && event.results[0] && event.results[0][0] ? event.results[0][0].transcript : '';
      var draft = parseSpokenFieldTranscript(transcript, getPlantById(fieldModeState.selectedPlantId));
      applyVoiceDraftToFieldMode(draft);
      fieldModeState.voiceListening = false;
      if (isFieldModeOpen()) renderFieldMode();
    };
    recognition.onerror = function (event) {
      fieldModeState.voiceListening = false;
      fieldModeState.lastActionText = '🎙 Voice capture failed: ' + (event && event.error ? event.error : 'unknown error') + '.';
      if (isFieldModeOpen()) renderFieldMode();
    };
    recognition.onend = function () {
      fieldModeState.voiceListening = false;
      if (isFieldModeOpen()) renderFieldMode();
    };
    recognition.start();
  }

  function addFieldMediaEntry(plantId, data, options) {
    options = options || {};
    if (!plantId || !data || !data.url) return null;
    var beforeLog = cloneJson(enhState.fieldMediaLog[plantId] || []);
    var entry = {
      id: uid(),
      date: data.date || todayIso(),
      url: data.url,
      caption: data.caption || '',
      kind: data.kind || 'field-photo',
      ts: Date.now()
    };
    if (!enhState.fieldMediaLog[plantId]) enhState.fieldMediaLog[plantId] = [];
    enhState.fieldMediaLog[plantId].unshift(entry);
    if (enhState.fieldMediaLog[plantId].length > 10) enhState.fieldMediaLog[plantId].length = 10;
    saveEnh();
    touchFieldRecentPlant(plantId);
    enqueueOfflineFieldAction('photo', plantId, options.queueLabel || '📸 Field snapshot saved locally', { date: entry.date, caption: entry.caption });
    if (options.undoLabel) {
      showUndoToast(options.undoLabel, function () {
        enhState.fieldMediaLog[plantId] = beforeLog;
        saveEnh();
        if (typeof options.onAfterUndo === 'function') options.onAfterUndo(entry);
      });
    }
    if (typeof options.onAfterSave === 'function') options.onAfterSave(entry);
    return entry;
  }

  function compressImageFile(file, callback) {
    if (!file) { callback(null); return; }
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var maxDim = 1200;
        var scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        var canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        var ctx = canvas.getContext('2d');
        if (!ctx) { callback(reader.result); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        callback(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.onerror = function () { callback(reader.result); };
      img.src = reader.result;
    };
    reader.onerror = function () { callback(null); };
    reader.readAsDataURL(file);
  }

  function renderFieldMediaStrip(plantId) {
    var entries = (enhState.fieldMediaLog[plantId] || []).slice(0, 4);
    if (!entries.length) return '';
    return '<div class="garden-field-photo-strip">'
      + entries.map(function (entry) {
          return '<button type="button" class="garden-field-photo-thumb" data-field-photo-view="' + esc(entry.url) + '" title="' + esc(entry.caption || entry.date) + '">'
            + '<img src="' + esc(entry.url) + '" alt="Field snapshot ' + esc(entry.date) + '">'
            + '<span>' + esc(entry.date) + '</span>'
            + '</button>';
        }).join('')
      + '</div>';
  }

  function renderFieldMediaDetailSection(plantId) {
    var entries = (enhState.fieldMediaLog[plantId] || []).slice(0, 8);
    if (!entries.length) return '';
    return '<div id="gardenFieldSnapshotSection">'
      + '<h4 style="margin:14px 0 6px;font-size:14px;color:#0f766e;">📸 Field snapshots</h4>'
      + '<p style="font-size:12px;color:#6b7280;margin:0 0 8px;">Quick photos captured in Field Mode.</p>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px;">'
      + entries.map(function (entry) {
          return '<button type="button" class="garden-field-detail-photo" data-field-photo-view="' + esc(entry.url) + '" style="padding:0;background:#fff;border-radius:10px;overflow:hidden;cursor:pointer;border:1px solid #d1d5db;text-align:left;">'
            + '<img src="' + esc(entry.url) + '" alt="Field snapshot ' + esc(entry.date) + '" style="display:block;width:100%;height:90px;object-fit:cover;">'
            + '<span style="display:block;padding:6px 8px;font-size:11px;color:#475569;">' + esc(entry.caption || entry.date) + '</span>'
            + '</button>';
        }).join('')
      + '</div>'
      + '</div>';
  }

  function addObservationEntry(plantId, data, options) {
    options = options || {};
    if (!plantId) return null;
    var beforeLog = cloneJson(enhState.obsLog[plantId] || []);
    var beforePhenology = cloneJson(enhState.phenology[plantId] || {});
    var entry = {
      id: uid(),
      date: data && data.date ? data.date : todayIso(),
      type: data && data.type ? data.type : 'other',
      species: data && data.species ? String(data.species).trim() : '',
      count: data && data.count ? String(data.count) : '1',
      notes: data && data.notes ? String(data.notes).trim() : ''
    };
    if (!enhState.obsLog[plantId]) enhState.obsLog[plantId] = [];
    enhState.obsLog[plantId].push(entry);
    saveEnh();
    touchFieldRecentPlant(plantId);
    enqueueOfflineFieldAction('observation', plantId, options.queueLabel || ((OBS_ICONS[entry.type] || '👁️') + ' ' + entry.type + ' logged locally'), { type: entry.type, date: entry.date });
    if (entry.type === 'bloom') {
      var isFirst = maybeCaptureFirstBloom(plantId, entry.date);
      if (isFirst && options.showFirstBloomToast !== false) {
        gardenToast('🌸 First bloom date recorded for ' + entry.date.slice(0, 4) + '!', 'success', 2200);
      }
    }
    if (typeof options.onAfterSave === 'function') options.onAfterSave(entry);
    if (options.refreshCards !== false && G() && typeof G().renderCards === 'function') G().renderCards();
    if (options.undoLabel) {
      showUndoToast(options.undoLabel, function () {
        enhState.obsLog[plantId] = beforeLog;
        enhState.phenology[plantId] = beforePhenology;
        saveEnh();
        if (typeof options.onAfterUndo === 'function') options.onAfterUndo(entry);
        if (options.refreshCards !== false && G() && typeof G().renderCards === 'function') G().renderCards();
      });
    } else if (options.toastMessage) {
      gardenToast(options.toastMessage, options.toastType || 'success', options.toastDuration || 1800);
    }
    return entry;
  }

  function addTaskEntry(plantId, data, options) {
    options = options || {};
    if (!plantId) return null;
    var beforeLog = cloneJson(enhState.taskLog[plantId] || []);
    var entry = {
      id: uid(),
      date: data && data.date ? data.date : todayIso(),
      type: data && data.type ? data.type : 'other',
      notes: data && data.notes ? String(data.notes).trim() : ''
    };
    if (!enhState.taskLog[plantId]) enhState.taskLog[plantId] = [];
    enhState.taskLog[plantId].push(entry);
    saveEnh();
    touchFieldRecentPlant(plantId);
    enqueueOfflineFieldAction('task', plantId, options.queueLabel || ((TASK_LOG_ICONS[entry.type] || '🪴') + ' ' + entry.type + ' logged locally'), { type: entry.type, date: entry.date });
    if (typeof options.onAfterSave === 'function') options.onAfterSave(entry);
    if (options.refreshCards !== false && G() && typeof G().renderCards === 'function') G().renderCards();
    if (options.undoLabel) {
      showUndoToast(options.undoLabel, function () {
        enhState.taskLog[plantId] = beforeLog;
        saveEnh();
        if (typeof options.onAfterUndo === 'function') options.onAfterUndo(entry);
        if (options.refreshCards !== false && G() && typeof G().renderCards === 'function') G().renderCards();
      });
    } else if (options.toastMessage) {
      gardenToast(options.toastMessage, options.toastType || 'success', options.toastDuration || 1800);
    }
    return entry;
  }

  var undoToastState = null;

  function clearUndoToast() {
    if (!undoToastState) return;
    if (undoToastState.timer) clearTimeout(undoToastState.timer);
    if (undoToastState.el && undoToastState.el.parentNode) undoToastState.el.parentNode.removeChild(undoToastState.el);
    undoToastState = null;
  }

  function showUndoToast(message, onUndo) {
    clearUndoToast();
    // Always push to history panel regardless of toast container
    pushUndoHistory(message, onUndo);
    var container = document.getElementById('toastContainer');
    if (!container) {
      gardenToast(message, 'success');
      return;
    }
    var toast = document.createElement('div');
    toast.className = 'toast toast-info garden-undo-toast';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '10px';
    toast.style.justifyContent = 'space-between';
    toast.innerHTML = '<span style="display:flex;align-items:center;gap:8px;"><span class="toast-icon">↩</span><span>' + esc(message) + '</span></span>'
      + '<span style="display:flex;align-items:center;gap:8px;"><button type="button" class="garden-undo-btn" style="border:none;border-radius:999px;padding:6px 12px;font-weight:700;cursor:pointer;background:#dbeafe;color:#1d4ed8;">Undo</button><button type="button" class="toast-close">×</button></span>';
    container.appendChild(toast);
    var remove = function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
      if (undoToastState && undoToastState.el === toast) undoToastState = null;
    };
    toast.querySelector('.garden-undo-btn').addEventListener('click', function () {
      clearUndoToast();
      if (typeof onUndo === 'function') onUndo();
    });
    toast.querySelector('.toast-close').addEventListener('click', remove);
    undoToastState = {
      el: toast,
      timer: setTimeout(remove, 6500)
    };
  }

  function snapshotPlantForUndo(plant) {
    return cloneJson(plant);
  }

  function splitTags(value) {
    return String(value || '')
      .split(/[\n,]+/)
      .map(function (t) { return t.trim().replace(/^#+/, ''); })
      .filter(Boolean);
  }

  function normalizeDupeName(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/\((?:cv\.?|cultivar)[^)]+\)/g, ' ')
      .replace(/["'“”’`]/g, ' ')
      .replace(/\b(cv|cultivar|var|ssp|subsp|sp)\b\.?/g, ' ')
      .replace(/[×*]/g, ' x ')
      .replace(/[^a-z0-9 ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function nameTokens(value) {
    var out = normalizeDupeName(value).split(' ').filter(Boolean);
    return out.filter(function (token, idx) { return out.indexOf(token) === idx; });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FEATURE 4 – NATIVE PRIORITY SCORE
  // ═══════════════════════════════════════════════════════════════════════════
  function nativeScore(plant) {
    var s = 0;
    if (plant.nativeToNc        === 'Yes') s += 2;
    if (plant.nativeToHenderson === 'Yes') s += 3;
    if (plant.supportsSpecialistBees === 'Yes') s += 2;
    if (plant.butterflyHost     === 'Yes') s += 1.5;
    if (plant.supportsBirds     === 'Yes') s += 1;
    if (plant.supportsMoths     === 'Yes') s += 0.5;
    return Math.min(10, Math.round(s * 10) / 10);
  }

  function scoreBadgeHtml(score) {
    var col = score >= 7 ? '#166534' : score >= 4 ? '#92400e' : '#374151';
    var bg  = score >= 7 ? '#dcfce7' : score >= 4 ? '#fef3c7' : '#f3f4f6';
    return '<span class="garden-native-score" '
      + 'title="Native Priority Score – NC native (+2), Henderson native (+3), specialist bees (+2), butterfly host (+1.5), birds (+1), moths (+0.5)" '
      + 'style="display:inline-flex;align-items:center;gap:3px;background:' + bg
      + ';color:' + col + ';border-radius:999px;padding:2px 8px;font-size:11px;font-weight:700;cursor:help;margin-left:6px;">'
      + '★\u202f' + score + '/10</span>';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FEATURE 1 – PLANTING CALENDAR  (Henderson County, NC – Zone 7a)
  // ═══════════════════════════════════════════════════════════════════════════
  var MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  var HENDERSON_TASKS = [
    /* Jan */ [{ t:'plan',      l:'Plan beds & order native seed/plant lists' },
               { t:'prune',     l:'Prune dormant trees & deciduous shrubs' },
               { t:'general',   l:'Inspect stored tender bulbs/tubers' }],
    /* Feb */ [{ t:'seed',      l:'Start slow-growing annuals indoors (snapdragons, begonias, 8-10 wks before last frost)' },
               { t:'seed',      l:'Start native perennials from seed indoors' },
               { t:'prune',     l:'Prune ornamental grasses before new growth' },
               { t:'prune',     l:'Prune roses (late Feb)' }],
    /* Mar */ [{ t:'seed',      l:'Start most warm-season annuals indoors (6–8 wks before last frost ~Apr 15)' },
               { t:'transplant',l:'Divide & transplant summer/fall-blooming perennials' },
               { t:'seed',      l:'Direct sow cool-season annuals & hardy natives outdoors' },
               { t:'prune',     l:'Cut back ornamental grasses if still standing' }],
    /* Apr */ [{ t:'transplant',l:'Last frost ~Apr 15 – harden off seedlings the week before' },
               { t:'transplant',l:'Transplant hardened seedlings outdoors after Apr 15' },
               { t:'seed',      l:'Direct sow zinnias, marigolds, & native wildflowers' },
               { t:'transplant',l:'Plant purchased native shrubs & trees' },
               { t:'prune',     l:'Prune spring-blooming shrubs right after bloom' }],
    /* May */ [{ t:'transplant',l:'Transplant all warm-season seedlings outdoors' },
               { t:'seed',      l:'Direct sow sunflowers, beans, cucumbers' },
               { t:'prune',     l:'Deadhead spring bulbs & early perennials' },
               { t:'transplant',l:'Divide spring-blooming perennials after bloom' }],
    /* Jun */ [{ t:'prune',     l:'Deadhead perennials to extend bloom' },
               { t:'prune',     l:'Pinch annuals for bushiness' },
               { t:'general',   l:'Take stem cuttings of desired perennials' },
               { t:'general',   l:'Water deeply during dry spells' }],
    /* Jul */ [{ t:'general',   l:'Collect seeds from early-blooming natives' },
               { t:'prune',     l:'Deadhead to prevent unwanted self-seeding' },
               { t:'general',   l:'Water consistently – peak heat stress this month' }],
    /* Aug */ [{ t:'seed',      l:'Start fall seedlings indoors (kale, pansies, asters)' },
               { t:'prune',     l:'Cut back summer perennials by ~1/3 to refresh growth' },
               { t:'general',   l:'Collect & dry seeds from summer bloomers' }],
    /* Sep */ [{ t:'transplant',l:'Transplant fall seedlings outdoors' },
               { t:'transplant',l:'Divide & transplant spring/early-summer perennials' },
               { t:'transplant',l:'Plant spring bulbs (daffodils, tulips)' },
               { t:'transplant',l:'Plant native trees & shrubs – excellent timing' },
               { t:'general',   l:'Collect seeds before first frost' }],
    /* Oct */ [{ t:'general',   l:'First frost ~Oct 15 – protect tender plants' },
               { t:'general',   l:'Collect final seeds before hard freeze' },
               { t:'prune',     l:'Cut back frost-killed annuals & perennials if desired' },
               { t:'transplant',l:'Continue planting native trees & shrubs' },
               { t:'transplant',l:'Plant spring-blooming bulbs' }],
    /* Nov */ [{ t:'general',   l:'Mulch perennials after hard freeze' },
               { t:'transplant',l:'Plant native shrubs & trees (roots establish over winter)' },
               { t:'general',   l:'Clean up beds; remove diseased material' }],
    /* Dec */ [{ t:'plan',      l:'Plan for next season; review & expand plant list' },
               { t:'general',   l:'Maintain & sharpen tools' },
               { t:'general',   l:'Protect cold-sensitive plants with mulch/frost cloth' },
               { t:'transplant',l:'Continue planting natives if ground is not frozen' }]
  ];

  var TASK_ICON = { seed:'🌱', transplant:'🌿', prune:'✂️', plan:'📋', general:'📌' };

  var MONTH_MAP = {
    jan:0,january:0,feb:1,february:1,mar:2,march:2,apr:3,april:3,
    may:4,jun:5,june:5,jul:6,july:6,aug:7,august:7,
    sep:8,september:8,oct:9,october:9,nov:10,november:10,dec:11,december:11
  };
  var SEASON_MAP = { spring:[2,3,4], summer:[5,6,7], fall:[8,9,10], autumn:[8,9,10], winter:[11,0,1] };

  function parseMonths(text) {
    var out = [];
    String(text || '').toLowerCase().split(/[\s,\-\/]+/).forEach(function (w) {
      if (MONTH_MAP[w] !== undefined) out.push(MONTH_MAP[w]);
      else if (SEASON_MAP[w]) out = out.concat(SEASON_MAP[w]);
    });
    return out.filter(function (v, i, a) { return a.indexOf(v) === i; });
  }

  function plantRemindersForMonth(plant, m) {
    var out = [];
    var seedMonths = parseMonths(plant.bestTimeSeed);
    if (seedMonths.indexOf(m) >= 0) out.push({ t:'seed',      l:'Start seeds (based on "best time to seed" field)' });
    var transplantMonths = seedMonths.map(function (sm) { return (sm + 2) % 12; });
    if (transplantMonths.indexOf(m) >= 0) out.push({ t:'transplant', l:'Transplant seedlings outdoors' });
    var bloomMonths = parseMonths(plant.bloomMonths || plant.bloomSeasons);
    if (bloomMonths.indexOf(m) >= 0) out.push({ t:'prune',     l:'Deadhead to extend bloom' });
    var collectMonths = bloomMonths.map(function (bm) { return (bm + 1) % 12; });
    if (collectMonths.indexOf(m) >= 0 && plant.seedHarvestMethod) out.push({ t:'general', l:'Collect seeds – ' + plant.seedHarvestMethod });
    var lc = String(plant.lifeCycle || '').toLowerCase();
    if (lc.indexOf('perennial') >= 0 && (m === 2 || m === 3 || m === 8 || m === 9)) {
      out.push({ t:'transplant', l:'Consider dividing or transplanting' });
    }
    return out;
  }

  function renderCalendar() {
    var container = document.getElementById('gardenCalendarPanel');
    if (!container) return;
    var m = enhState.calMonth;
    var tasks  = HENDERSON_TASKS[m];
    var kapG   = G();
    var plantReminders = [];
    if (kapG) {
      kapG.state.plants.forEach(function (p) {
        plantRemindersForMonth(p, m).forEach(function (r) {
          plantReminders.push({ plant: p, r: r });
        });
      });
    }

    var html = '<div class="garden-cal-header">'
      + '<button type="button" class="garden-btn garden-cal-nav" id="gardenCalPrev">‹</button>'
      + '<strong>' + esc(MONTHS_FULL[m]) + ' – Henderson County, NC (Zone 7a)</strong>'
      + '<button type="button" class="garden-btn garden-cal-nav" id="gardenCalNext">›</button>'
      + '</div><div class="garden-cal-body">'
      + '<p class="garden-cal-section-title">📅 General Tasks</p><ul class="garden-cal-tasks">'
      + tasks.map(function (t) {
          return '<li class="garden-cal-task garden-cal-type-' + t.t + '">'
            + (TASK_ICON[t.t] || '📌') + ' ' + esc(t.l) + '</li>';
        }).join('')
      + '</ul>';

    if (plantReminders.length) {
      html += '<p class="garden-cal-section-title">🌿 Your Plant Reminders</p><ul class="garden-cal-tasks">'
        + plantReminders.map(function (item) {
            return '<li class="garden-cal-task garden-cal-type-' + item.r.t + '">'
              + (TASK_ICON[item.r.t] || '📌') + ' <strong>' + esc(item.plant.commonName) + '</strong>: ' + esc(item.r.l) + '</li>';
          }).join('')
        + '</ul>';
    }
    html += '</div>';
    container.innerHTML = html;

    var prev = document.getElementById('gardenCalPrev');
    var next = document.getElementById('gardenCalNext');
    if (prev) prev.addEventListener('click', function () { enhState.calMonth = (enhState.calMonth + 11) % 12; renderCalendar(); });
    if (next) next.addEventListener('click', function () { enhState.calMonth = (enhState.calMonth + 1)  % 12; renderCalendar(); });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FEATURE 2 – PHOTO GALLERY
  // ═══════════════════════════════════════════════════════════════════════════
  var _dragSrcIdx = -1;

  function renderPhotoGallery(plant) {
    var photos = Array.isArray(plant.photos) ? plant.photos.filter(Boolean) : [];
    if (!photos.length) {
      return '<div style="padding:10px 0;">'
        + '<p style="color:#6b7280;font-size:13px;margin:0 0 4px;">No photos yet.</p>'
        + '<p style="color:#9ca3af;font-size:12px;margin:0;">Open <strong>Edit</strong> and paste photo URLs into the photos field, one per line.</p>'
        + '</div>';
    }
    var captions = enhState.photoCaptions[plant.id] || {};
    var html = '<div class="garden-photo-strip" id="gardenPhotoStrip" data-plant-id="' + esc(plant.id) + '">';
    photos.forEach(function (url, idx) {
      var caption = captions[url] || '';
      var isPrimary = (idx === 0);
      html += '<div class="garden-photo-thumb' + (isPrimary ? ' garden-photo-primary' : '') + '" '
        + 'draggable="true" data-idx="' + idx + '" title="' + (isPrimary ? 'Primary photo – drag to reorder' : 'Drag to reorder') + '">'
        + '<img src="' + esc(url) + '" alt="' + (caption ? esc(caption) : 'Photo ' + (idx + 1)) + '" loading="lazy" class="garden-photo-img">'
        + (isPrimary ? '<span class="garden-photo-primary-badge">⭐ Primary</span>' : '')
        + '<div class="garden-photo-actions">'
        + '<button type="button" class="garden-photo-view-btn" data-photo-idx="' + idx + '" title="View full size">🔍</button>'
        + (!isPrimary ? '<button type="button" class="garden-photo-primary-btn" data-photo-idx="' + idx + '" title="Make this the primary photo">⭐</button>' : '')
        + '</div>'
        + '<input type="text" class="garden-photo-caption-input" data-photo-url="' + esc(url) + '" '
        + 'placeholder="Add a caption…" value="' + esc(caption) + '" '
        + 'title="Caption for this photo" aria-label="Caption for photo ' + (idx + 1) + '">'
        + '</div>';
    });
    return html + '</div>'
      + '<p style="font-size:11px;color:#9ca3af;margin:6px 0 0;">Drag thumbnails to reorder · First photo is the primary · ⭐ to set primary · 🔍 to view full size</p>';
  }

  function bindPhotoGalleryExtras(container, plantId, galleryEl) {
    if (!container) return;
    // Caption save on blur or Enter
    container.querySelectorAll('.garden-photo-caption-input').forEach(function (input) {
      function saveCaption() {
        var url = input.getAttribute('data-photo-url');
        if (!url) return;
        if (!enhState.photoCaptions[plantId]) enhState.photoCaptions[plantId] = {};
        var prev = enhState.photoCaptions[plantId][url] || '';
        var next = input.value.trim();
        if (prev === next) return;
        enhState.photoCaptions[plantId][url] = next;
        saveEnh();
        gardenToast('Caption saved', 'success', 1500);
      }
      input.addEventListener('blur', saveCaption);
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); saveCaption(); input.blur(); }
      });
    });
    // Make Primary button
    container.querySelectorAll('.garden-photo-primary-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var idx = parseInt(btn.getAttribute('data-photo-idx'), 10);
        var kapG = G();
        var plant = kapG.state.plants.find(function (p) { return p.id === plantId; });
        if (!plant || !Array.isArray(plant.photos) || idx <= 0) return;
        var photos = plant.photos.slice();
        var chosen = photos.splice(idx, 1)[0];
        photos.unshift(chosen);
        plant.photos = photos;
        plant.updatedAt = new Date().toISOString();
        kapG.state.dirty = true;
        kapG.saveLocal();
        if (galleryEl) {
          var inner = galleryEl.querySelector('.garden-gallery-inner');
          if (inner) {
            inner.innerHTML = renderPhotoGallery(plant);
            initPhotoDragDrop(inner.querySelector('#gardenPhotoStrip'), plantId);
            bindPhotoActions(inner, plantId);
            bindBrokenPhotoFallbacks(inner);
            bindPhotoGalleryExtras(inner, plantId, galleryEl);
          }
        }
        gardenToast('Primary photo updated', 'success', 1800);
      });
    });
  }

  function bindBrokenPhotoFallbacks(container) {
    if (!container) return;
    container.querySelectorAll('img.garden-photo-img').forEach(function (img) {
      if (img.dataset.gardenErrorBound === 'true') return;
      img.dataset.gardenErrorBound = 'true';
      img.addEventListener('error', function () {
        img.style.display = 'none';
      });
    });
  }

  function openLightbox(plantId, idx) {
    var kapG = G();
    var plant = kapG.state.plants.find(function (p) { return p.id === plantId; });
    if (!plant) return;
    var photos = (plant.photos || []).filter(Boolean);
    if (!photos.length) return;
    enhState.lightboxPlantId = plantId;
    enhState.lightboxIndex   = Math.max(0, Math.min(idx, photos.length - 1));
    updateLightbox();
    var modal = document.getElementById('gardenLightboxModal');
    if (modal) modal.classList.add('open');
  }

  function updateLightbox() {
    var kapG  = G();
    var plant = kapG.state.plants.find(function (p) { return p.id === enhState.lightboxPlantId; });
    if (!plant) return;
    var photos  = (plant.photos || []).filter(Boolean);
    var img     = document.getElementById('gardenLightboxImg');
    var counter = document.getElementById('gardenLightboxCounter');
    if (img)     img.src = photos[enhState.lightboxIndex] || '';
    if (counter) counter.textContent = (enhState.lightboxIndex + 1) + ' / ' + photos.length;
  }

  function closeLightbox() {
    var modal = document.getElementById('gardenLightboxModal');
    if (modal) modal.classList.remove('open');
  }

  function lightboxNav(dir) {
    var kapG  = G();
    var plant = kapG.state.plants.find(function (p) { return p.id === enhState.lightboxPlantId; });
    if (!plant) return;
    var photos = (plant.photos || []).filter(Boolean);
    enhState.lightboxIndex = (enhState.lightboxIndex + dir + photos.length) % photos.length;
    updateLightbox();
  }

  function initPhotoDragDrop(strip, plantId) {
    if (!strip) return;
    var thumbs = strip.querySelectorAll('.garden-photo-thumb');
    thumbs.forEach(function (el) {
      el.addEventListener('dragstart', function (e) {
        _dragSrcIdx = parseInt(el.getAttribute('data-idx'), 10);
        e.dataTransfer.effectAllowed = 'move';
        el.classList.add('dragging');
      });
      el.addEventListener('dragend', function () { el.classList.remove('dragging'); _dragSrcIdx = -1; });
      el.addEventListener('dragover',  function (e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
      el.addEventListener('drop', function (e) {
        e.preventDefault();
        var targetIdx = parseInt(el.getAttribute('data-idx'), 10);
        if (_dragSrcIdx < 0 || _dragSrcIdx === targetIdx) return;
        var kapG  = G();
        var plant = kapG.state.plants.find(function (p) { return p.id === plantId; });
        if (!plant || !Array.isArray(plant.photos)) return;
        var photos = plant.photos.slice();
        var moved  = photos.splice(_dragSrcIdx, 1)[0];
        photos.splice(targetIdx, 0, moved);
        plant.photos     = photos;
        plant.updatedAt  = new Date().toISOString();
        kapG.state.dirty = true;
        kapG.saveLocal();
        var galleryEl = document.getElementById('gardenPhotoGallery');
        if (galleryEl) {
          var inner = galleryEl.querySelector('.garden-gallery-inner');
          if (inner) {
            inner.innerHTML = renderPhotoGallery(plant);
            initPhotoDragDrop(inner.querySelector('#gardenPhotoStrip'), plantId);
            bindPhotoActions(inner, plantId);
            bindBrokenPhotoFallbacks(inner);
            bindPhotoGalleryExtras(inner, plantId, galleryEl);
          }
        }
      });
    });
  }

  function bindPhotoActions(container, plantId) {
    container.querySelectorAll('.garden-photo-view-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        openLightbox(plantId, parseInt(btn.getAttribute('data-photo-idx'), 10));
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FEATURE 3 – OBSERVATION LOG + SEASON CHART
  // ═══════════════════════════════════════════════════════════════════════════
  var OBS_TYPES = ['bee', 'butterfly', 'bird', 'deer', 'rabbit', 'insect', 'bloom', 'other'];
  var OBS_ICONS = { bee:'🐝', butterfly:'🦋', bird:'🐦', deer:'🦌', rabbit:'🐇', insect:'🪲', bloom:'🌸', other:'👁️' };
  var OBS_COLORS= { bee:'#f59e0b', butterfly:'#8b5cf6', bird:'#3b82f6', deer:'#84cc16', rabbit:'#f97316', insect:'#6b7280', bloom:'#ec4899', other:'#14b8a6' };

  function renderSeasonChart(plantId) {
    var entries = enhState.obsLog[plantId] || [];
    if (!entries.length) return '';
    var monthly = {};
    OBS_TYPES.forEach(function (t) { monthly[t] = new Array(12).fill(0); });
    entries.forEach(function (e) {
      var m = parseInt(String(e.date || '').slice(5, 7), 10) - 1;
      if (m >= 0 && m < 12 && monthly[e.type]) monthly[e.type][m]++;
    });
    var maxCount = 0;
    OBS_TYPES.forEach(function (t) { maxCount = Math.max(maxCount, Math.max.apply(null, monthly[t])); });
    if (!maxCount) return '';

    var bars = '';
    for (var i = 0; i < 12; i++) {
      var total = OBS_TYPES.reduce(function (s, t) { return s + monthly[t][i]; }, 0);
      var h = total ? Math.max(5, Math.round((total / maxCount) * 56)) : 2;
      var segments = OBS_TYPES.filter(function (t) { return monthly[t][i] > 0; })
        .map(function (t) {
          var pct = Math.round((monthly[t][i] / total) * 100);
          return '<div style="flex:' + pct + ';background:' + OBS_COLORS[t] + ';min-height:2px;" title="' + t + ':' + monthly[t][i] + '"></div>';
        }).join('');
      bars += '<div style="display:flex;flex-direction:column;align-items:center;gap:2px;">'
        + '<div style="height:' + h + 'px;width:100%;display:flex;flex-direction:column-reverse;">' + segments + '</div>'
        + '<span style="font-size:9px;color:#9ca3af;">JFMAMJJASOND'[i] + '</span>'
        + '</div>';
    }

    var legend = OBS_TYPES.filter(function (t) { return monthly[t].reduce(function (s,v){return s+v;},0) > 0; })
      .map(function (t) {
        var tot = monthly[t].reduce(function (s,v){return s+v;},0);
        return '<span style="font-size:11px;display:flex;align-items:center;gap:3px;">'
          + '<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:' + OBS_COLORS[t] + ';"></span>'
          + OBS_ICONS[t] + ' ' + t + ' (' + tot + ')</span>';
      }).join('');

    return '<div class="garden-season-chart">'
      + '<p style="font-size:12px;font-weight:700;color:#374151;margin:8px 0 4px;">Seasonal Activity</p>'
      + '<div style="display:grid;grid-template-columns:repeat(12,1fr);gap:3px;align-items:end;height:64px;">' + bars + '</div>'
      + '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;">' + legend + '</div>'
      + '</div>';
  }

  function renderObsLog(plantId) {
    var entries = (enhState.obsLog[plantId] || []).slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
    var html = '<div class="garden-obs-add">'
      + '<p style="font-weight:700;font-size:13px;margin:0 0 8px;">Log a Sighting</p>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;">'
      + '<input id="gardenObsDate" type="date" value="' + new Date().toISOString().slice(0, 10) + '" style="padding:6px 8px;border:1px solid #d1d5db;border-radius:6px;font:inherit;">'
      + '<select id="gardenObsType" style="padding:6px 8px;border:1px solid #d1d5db;border-radius:6px;font:inherit;">'
      + OBS_TYPES.map(function (t) { return '<option value="' + t + '">' + (OBS_ICONS[t] || '') + ' ' + t.charAt(0).toUpperCase() + t.slice(1) + '</option>'; }).join('')
      + '</select>'
      + '<input id="gardenObsSpecies" type="text" placeholder="Species (optional)" style="padding:6px 8px;border:1px solid #d1d5db;border-radius:6px;font:inherit;">'
      + '<input id="gardenObsCount" type="number" min="1" value="1" placeholder="Count" style="padding:6px 8px;border:1px solid #d1d5db;border-radius:6px;font:inherit;width:80px;">'
      + '<input id="gardenObsNotes" type="text" placeholder="Notes (optional)" style="padding:6px 8px;border:1px solid #d1d5db;border-radius:6px;font:inherit;">'
      + '<button type="button" class="garden-btn primary" style="font-size:12px;padding:6px 12px;" '
      + 'id="gardenObsAddBtn" data-plant-id="' + esc(plantId) + '">+ Log</button>'
      + '</div></div>'
      + renderSeasonChart(plantId)
      + '<div class="garden-obs-timeline">';
    if (!entries.length) {
      html += '<p style="color:#6b7280;font-size:13px;text-align:center;padding:12px 0;">No sightings yet. Add the first bee, butterfly, or bird you notice to build a seasonal timeline.</p>';
    } else {
      html += entries.map(function (e) {
        return '<div class="garden-obs-entry" data-obs-id="' + esc(e.id) + '">'
          + '<span class="garden-obs-icon">' + (OBS_ICONS[e.type] || '👁️') + '</span>'
          + '<div class="garden-obs-body">'
          + '<strong>' + esc(e.date) + '</strong> — '
          + (e.species ? '<em>' + esc(e.species) + '</em> ' : '')
          + '<span class="garden-obs-type-badge">' + esc(e.type) + '</span>'
          + (e.count && String(e.count) !== '1' ? ' ×' + esc(e.count) : '')
          + (e.notes ? '<p style="margin:2px 0 0;font-size:12px;color:#6b7280;">' + esc(e.notes) + '</p>' : '')
          + '</div>'
          + '<span style="display:flex;gap:4px;align-items:center;">'
          + '<button type="button" class="garden-obs-edit" data-obs-id="' + esc(e.id) + '" '
          + 'title="Edit sighting" style="background:none;border:none;color:#3b82f6;cursor:pointer;font-size:14px;padding:0 4px;">✏️</button>'
          + '<button type="button" class="garden-obs-delete" data-obs-id="' + esc(e.id) + '" '
          + 'data-plant-id="' + esc(plantId) + '" title="Delete sighting" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:16px;padding:0 4px;">✕</button>'
          + '</span>'
          + '</div>';
      }).join('');
    }
    return html + '</div>';
  }

  function renderAndBindObsSection(section, plantId) {
    section.innerHTML = '<h4 style="margin:14px 0 6px;font-size:14px;color:#166534;">🔭 Observation Log</h4>'
      + renderObsLog(plantId);
    var addBtn = section.querySelector('#gardenObsAddBtn');
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        var d = section.querySelector('#gardenObsDate');
        var t = section.querySelector('#gardenObsType');
        var s = section.querySelector('#gardenObsSpecies');
        var c = section.querySelector('#gardenObsCount');
        var n = section.querySelector('#gardenObsNotes');
        addObservationEntry(plantId, {
          date: d ? d.value : todayIso(),
          type: t ? t.value : 'other',
          species: s ? s.value.trim() : '',
          count: c ? c.value : '1',
          notes: n ? n.value.trim() : ''
        }, {
          refreshCards: true,
          onAfterSave: function () { renderAndBindObsSection(section, plantId); }
        });
      });
    }
    section.querySelectorAll('.garden-obs-edit').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var obsId = btn.getAttribute('data-obs-id');
        var entry = (enhState.obsLog[plantId] || []).find(function (e) { return e.id === obsId; });
        if (!entry) return;
        var row = section.querySelector('.garden-obs-entry[data-obs-id="' + obsId + '"]');
        if (!row) return;

        var typeOptions = OBS_TYPES.map(function (t) {
          return '<option value="' + t + '"' + (entry.type === t ? ' selected' : '') + '>'
            + (OBS_ICONS[t] || '') + ' ' + t.charAt(0).toUpperCase() + t.slice(1) + '</option>';
        }).join('');

        row.innerHTML = '<div class="garden-obs-edit-form" style="display:grid;gap:6px;width:100%;">'
          + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:6px;">'
          + '<input type="date" class="garden-obs-ef-date" value="' + esc(entry.date) + '" style="padding:5px 8px;border:1px solid #d1d5db;border-radius:6px;font:inherit;">'
          + '<select class="garden-obs-ef-type" style="padding:5px 8px;border:1px solid #d1d5db;border-radius:6px;font:inherit;">' + typeOptions + '</select>'
          + '<input type="text" class="garden-obs-ef-species" value="' + esc(entry.species || '') + '" placeholder="Species (optional)" style="padding:5px 8px;border:1px solid #d1d5db;border-radius:6px;font:inherit;">'
          + '<input type="number" class="garden-obs-ef-count" value="' + esc(entry.count || '1') + '" min="1" style="padding:5px 8px;border:1px solid #d1d5db;border-radius:6px;font:inherit;width:80px;">'
          + '</div>'
          + '<input type="text" class="garden-obs-ef-notes" value="' + esc(entry.notes || '') + '" placeholder="Notes (optional)" style="padding:5px 8px;border:1px solid #d1d5db;border-radius:6px;font:inherit;">'
          + '<div style="display:flex;gap:6px;">'
          + '<button type="button" class="garden-btn primary garden-obs-ef-save" style="font-size:12px;padding:5px 12px;">Save</button>'
          + '<button type="button" class="garden-btn garden-obs-ef-cancel" style="font-size:12px;padding:5px 12px;">Cancel</button>'
          + '</div>'
          + '</div>';

        row.querySelector('.garden-obs-ef-cancel').addEventListener('click', function () {
          renderAndBindObsSection(section, plantId);
        });

        row.querySelector('.garden-obs-ef-save').addEventListener('click', function () {
          var before = cloneJson(entry);
          var entries = enhState.obsLog[plantId] || [];
          var target = entries.find(function (e) { return e.id === obsId; });
          if (!target) return;
          target.date    = row.querySelector('.garden-obs-ef-date').value;
          target.type    = row.querySelector('.garden-obs-ef-type').value;
          target.species = row.querySelector('.garden-obs-ef-species').value.trim();
          target.count   = row.querySelector('.garden-obs-ef-count').value;
          target.notes   = row.querySelector('.garden-obs-ef-notes').value.trim();
          saveEnh();
          renderAndBindObsSection(section, plantId);
          G().renderCards();
          showUndoToast('Sighting updated', function () {
            var t2 = (enhState.obsLog[plantId] || []).find(function (e) { return e.id === obsId; });
            if (t2) { Object.assign(t2, before); saveEnh(); renderAndBindObsSection(section, plantId); G().renderCards(); }
          });
        });

        row.querySelector('.garden-obs-ef-date').focus();
      });
    });

    section.querySelectorAll('.garden-obs-delete').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var obsId = btn.getAttribute('data-obs-id');
        var before = cloneJson(enhState.obsLog[plantId] || []);
        enhState.obsLog[plantId] = before.filter(function (e) { return e.id !== obsId; });
        saveEnh();
        renderAndBindObsSection(section, plantId);
        G().renderCards();
        showUndoToast('Sighting deleted', function () {
          enhState.obsLog[plantId] = before;
          saveEnh();
          renderAndBindObsSection(section, plantId);
          G().renderCards();
          gardenToast('Delete undone', 'info', 1800);
        });
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FEATURE A – BLOOM TIMELINE BAR
  // ═══════════════════════════════════════════════════════════════════════════
  var BLOOM_MONTH_ABBR = ['J','F','M','A','M','J','J','A','S','O','N','D'];

  function renderBloomBar(plant) {
    var months = parseMonths(plant.bloomMonths || plant.bloomSeasons || '');
    if (!months.length) return '';
    var segments = BLOOM_MONTH_ABBR.map(function (abbr, i) {
      var active = months.indexOf(i) >= 0;
      var radius = i === 0 ? '3px 0 0 3px' : i === 11 ? '0 3px 3px 0' : '0';
      return '<span style="flex:1;height:100%;background:' + (active ? '#16a34a' : '#e5e7eb') + ';'
        + 'border-radius:' + radius + ';" title="' + MONTHS_FULL[i] + (active ? ' – blooming' : '') + '"></span>';
    }).join('');
    var letters = BLOOM_MONTH_ABBR.map(function (abbr, i) {
      var active = months.indexOf(i) >= 0;
      return '<span style="flex:1;text-align:center;color:' + (active ? '#16a34a' : '#d1d5db') + ';font-weight:' + (active ? '700' : '400') + ';">' + abbr + '</span>';
    }).join('');
    return '<div class="garden-bloom-bar" aria-label="Bloom timeline" title="Bloom months across the year" '
      + 'style="margin:3px 0 0;">'
      + '<div style="display:flex;height:5px;width:100%;border-radius:3px;overflow:hidden;gap:1px;">' + segments + '</div>'
      + '<div style="display:flex;width:100%;font-size:8px;line-height:1.4;letter-spacing:0;margin-top:1px;">' + letters + '</div>'
      + '</div>';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FEATURE B – PER-PLANT TASK LOG  (watering, fertilizing, pruning…)
  // ═══════════════════════════════════════════════════════════════════════════
  var TASK_LOG_TYPES  = ['watered','fertilized','pruned','transplanted','mulched','treated','other'];
  var TASK_LOG_ICONS  = { watered:'💧', fertilized:'🌾', pruned:'✂️', transplanted:'🌿', mulched:'🍂', treated:'🧪', other:'📝' };
  var TASK_LOG_COLORS = { watered:'#3b82f6', fertilized:'#84cc16', pruned:'#f59e0b', transplanted:'#10b981', mulched:'#92400e', treated:'#8b5cf6', other:'#6b7280' };

  function renderTaskLog(plantId) {
    var entries = (enhState.taskLog[plantId] || []).slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
    var typeOptions = TASK_LOG_TYPES.map(function (t) {
      return '<option value="' + t + '">' + (TASK_LOG_ICONS[t] || '') + ' ' + t.charAt(0).toUpperCase() + t.slice(1) + '</option>';
    }).join('');

    var html = '<div class="garden-obs-add" style="border-top:1px solid #f1f5f9;padding-top:10px;">'
      + '<p style="font-weight:700;font-size:13px;margin:0 0 8px;">Log a Gardener Action</p>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;">'
      + '<input id="gardenTaskDate" type="date" value="' + new Date().toISOString().slice(0, 10) + '" style="padding:6px 8px;border:1px solid #d1d5db;border-radius:6px;font:inherit;">'
      + '<select id="gardenTaskType" style="padding:6px 8px;border:1px solid #d1d5db;border-radius:6px;font:inherit;">' + typeOptions + '</select>'
      + '<input id="gardenTaskNotes" type="text" placeholder="Notes (product, rate, observations…)" style="padding:6px 8px;border:1px solid #d1d5db;border-radius:6px;font:inherit;">'
      + '<button type="button" class="garden-btn primary" style="font-size:12px;padding:6px 12px;" '
      + 'id="gardenTaskAddBtn" data-plant-id="' + esc(plantId) + '">+ Log</button>'
      + '</div></div>';

    // Quick-action chip buttons
    html += '<div style="display:flex;flex-wrap:wrap;gap:5px;margin:8px 0;">'
      + TASK_LOG_TYPES.slice(0,-1).map(function (t) {
          return '<button type="button" class="garden-task-quick-chip" data-task-type="' + t + '" '
            + 'style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:999px;padding:3px 10px;font-size:11px;cursor:pointer;display:flex;align-items:center;gap:3px;">'
            + TASK_LOG_ICONS[t] + ' ' + t.charAt(0).toUpperCase() + t.slice(1) + '</button>';
        }).join('')
      + '</div>';

    html += '<div class="garden-task-timeline">';
    if (!entries.length) {
      html += '<p style="color:#6b7280;font-size:13px;text-align:center;padding:10px 0;">No actions logged yet. Track every watering, feeding, or pruning here.</p>';
    } else {
      // Monthly streaks summary
      var monthly = new Array(12).fill(0);
      entries.forEach(function (e) {
        var m = parseInt(String(e.date || '').slice(5, 7), 10) - 1;
        if (m >= 0 && m < 12) monthly[m]++;
      });
      var maxM = Math.max.apply(null, monthly);
      if (maxM > 0) {
        var miniBar = monthly.map(function (v, i) {
          var h = v ? Math.max(4, Math.round((v / maxM) * 28)) : 2;
          var col = v ? '#3b82f6' : '#e5e7eb';
          return '<div style="flex:1;height:' + h + 'px;background:' + col + ';border-radius:2px;" title="' + MONTHS_FULL[i] + ': ' + v + ' action' + (v!==1?'s':'') + '"></div>';
        }).join('');
        html += '<div style="margin:6px 0 10px;">'
          + '<p style="font-size:11px;font-weight:700;color:#374151;margin:0 0 3px;">Activity This Year</p>'
          + '<div style="display:flex;gap:2px;align-items:flex-end;height:32px;">' + miniBar + '</div>'
          + '<div style="display:flex;font-size:8px;color:#9ca3af;gap:2px;margin-top:1px;">'
          + BLOOM_MONTH_ABBR.map(function(l){ return '<span style="flex:1;text-align:center;">' + l + '</span>'; }).join('')
          + '</div></div>';
      }

      html += entries.map(function (e) {
        var col  = TASK_LOG_COLORS[e.type] || '#6b7280';
        var icon = TASK_LOG_ICONS[e.type]  || '📝';
        return '<div class="garden-obs-entry" data-task-id="' + esc(e.id) + '">'
          + '<span class="garden-obs-icon" style="color:' + col + ';">' + icon + '</span>'
          + '<div class="garden-obs-body">'
          + '<strong>' + esc(e.date) + '</strong> — '
          + '<span class="garden-obs-type-badge" style="background:' + col + '20;color:' + col + ';">' + esc(e.type) + '</span>'
          + (e.notes ? '<p style="margin:2px 0 0;font-size:12px;color:#6b7280;">' + esc(e.notes) + '</p>' : '')
          + '</div>'
          + '<span style="display:flex;gap:4px;align-items:center;">'
          + '<button type="button" class="garden-task-edit" data-task-id="' + esc(e.id) + '" '
          + 'title="Edit action" style="background:none;border:none;color:#3b82f6;cursor:pointer;font-size:14px;padding:0 4px;">✏️</button>'
          + '<button type="button" class="garden-task-delete" data-task-id="' + esc(e.id) + '" '
          + 'data-plant-id="' + esc(plantId) + '" title="Delete action" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:16px;padding:0 4px;">✕</button>'
          + '</span>'
          + '</div>';
      }).join('');
    }
    return html + '</div>';
  }

  function renderAndBindTaskSection(section, plantId) {
    section.innerHTML = '<h4 style="margin:14px 0 6px;font-size:14px;color:#1d4ed8;">🪴 Task / Care Log</h4>'
      + renderTaskLog(plantId);

    var addBtn = section.querySelector('#gardenTaskAddBtn');
    function doAddTask(typeOverride) {
      var d = section.querySelector('#gardenTaskDate');
      var t = section.querySelector('#gardenTaskType');
      var n = section.querySelector('#gardenTaskNotes');
      var selectedType = typeOverride || (t ? t.value : 'other');
      addTaskEntry(plantId, {
        date: d ? d.value : todayIso(),
        type: selectedType,
        notes: n ? n.value.trim() : ''
      }, {
        refreshCards: true,
        onAfterSave: function () { renderAndBindTaskSection(section, plantId); },
        toastMessage: TASK_LOG_ICONS[selectedType] + ' ' + selectedType.charAt(0).toUpperCase() + selectedType.slice(1) + ' logged',
        toastDuration: 1600
      });
    }

    if (addBtn) addBtn.addEventListener('click', function () { doAddTask(); });

    // Quick chips — one-tap logging
    section.querySelectorAll('.garden-task-quick-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var typeVal = chip.getAttribute('data-task-type');
        var tSel = section.querySelector('#gardenTaskType');
        if (tSel) tSel.value = typeVal;
        doAddTask(typeVal);
      });
    });

    section.querySelectorAll('.garden-task-edit').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var taskId = btn.getAttribute('data-task-id');
        var entry = (enhState.taskLog[plantId] || []).find(function (e) { return e.id === taskId; });
        if (!entry) return;
        var row = section.querySelector('.garden-obs-entry[data-task-id="' + taskId + '"]');
        if (!row) return;
        var typeOptions = TASK_LOG_TYPES.map(function (t) {
          return '<option value="' + t + '"' + (entry.type === t ? ' selected' : '') + '>'
            + (TASK_LOG_ICONS[t] || '') + ' ' + t.charAt(0).toUpperCase() + t.slice(1) + '</option>';
        }).join('');
        row.innerHTML = '<div style="display:grid;gap:6px;width:100%;">'
          + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:6px;">'
          + '<input type="date" class="garden-task-ef-date" value="' + esc(entry.date) + '" style="padding:5px 8px;border:1px solid #d1d5db;border-radius:6px;font:inherit;">'
          + '<select class="garden-task-ef-type" style="padding:5px 8px;border:1px solid #d1d5db;border-radius:6px;font:inherit;">' + typeOptions + '</select>'
          + '</div>'
          + '<input type="text" class="garden-task-ef-notes" value="' + esc(entry.notes || '') + '" placeholder="Notes (optional)" style="padding:5px 8px;border:1px solid #d1d5db;border-radius:6px;font:inherit;">'
          + '<div style="display:flex;gap:6px;">'
          + '<button type="button" class="garden-btn primary garden-task-ef-save" style="font-size:12px;padding:5px 12px;">Save</button>'
          + '<button type="button" class="garden-btn garden-task-ef-cancel" style="font-size:12px;padding:5px 12px;">Cancel</button>'
          + '</div></div>';
        row.querySelector('.garden-task-ef-cancel').addEventListener('click', function () { renderAndBindTaskSection(section, plantId); });
        row.querySelector('.garden-task-ef-save').addEventListener('click', function () {
          var before = cloneJson(entry);
          var target = (enhState.taskLog[plantId] || []).find(function (e) { return e.id === taskId; });
          if (!target) return;
          target.date  = row.querySelector('.garden-task-ef-date').value;
          target.type  = row.querySelector('.garden-task-ef-type').value;
          target.notes = row.querySelector('.garden-task-ef-notes').value.trim();
          saveEnh();
          renderAndBindTaskSection(section, plantId);
          showUndoToast('Action updated', function () {
            var t2 = (enhState.taskLog[plantId] || []).find(function (e) { return e.id === taskId; });
            if (t2) { Object.assign(t2, before); saveEnh(); renderAndBindTaskSection(section, plantId); }
          });
        });
        row.querySelector('.garden-task-ef-date').focus();
      });
    });

    section.querySelectorAll('.garden-task-delete').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var taskId = btn.getAttribute('data-task-id');
        var before = cloneJson(enhState.taskLog[plantId] || []);
        enhState.taskLog[plantId] = before.filter(function (e) { return e.id !== taskId; });
        saveEnh();
        renderAndBindTaskSection(section, plantId);
        G().renderCards();
        showUndoToast('Action deleted', function () {
          enhState.taskLog[plantId] = before;
          saveEnh();
          renderAndBindTaskSection(section, plantId);
          G().renderCards();
        });
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FEATURE C – COMPANION PLANTING / PLANT SIMILARITY WIDGET
  // ═══════════════════════════════════════════════════════════════════════════
  var COMPANION_WILDLIFE_FIELDS = [
    { field: 'butterflyHost',        label: 'butterfly host' },
    { field: 'supportsSpecialistBees', label: 'specialist bee support' },
    { field: 'supportsBirds',        label: 'bird support' },
    { field: 'supportsMoths',        label: 'moth support' },
    { field: 'supportsDragonflies',  label: 'dragonfly support' }
  ];

  function findCompanions(plant, allPlants) {
    var myMonths   = parseMonths(plant.bloomMonths || plant.bloomSeasons || '');
    var myLocation = String(plant.locationPlanted || '').toLowerCase().trim();
    var results    = [];

    allPlants.forEach(function (p) {
      if (p.id === plant.id) return;
      var reasons = [];

      // Shared bloom months (≥ 2 in common)
      var pMonths = parseMonths(p.bloomMonths || p.bloomSeasons || '');
      var shared  = myMonths.filter(function (m) { return pMonths.indexOf(m) >= 0; });
      if (shared.length >= 2) {
        reasons.push('blooms ' + shared.map(function (m) { return MONTHS_FULL[m].slice(0,3); }).join('/'));
      } else if (shared.length === 1) {
        reasons.push('blooms ' + MONTHS_FULL[shared[0]].slice(0,3));
      }

      // Same garden location
      var pLocation = String(p.locationPlanted || '').toLowerCase().trim();
      if (myLocation && pLocation && myLocation === pLocation) {
        reasons.push('same location (' + esc(p.locationPlanted) + ')');
      }

      // Shared wildlife support
      var wildlife = COMPANION_WILDLIFE_FIELDS.filter(function (wf) {
        return plant[wf.field] === 'Yes' && p[wf.field] === 'Yes';
      }).map(function (wf) { return wf.label; });
      if (wildlife.length) reasons.push('both support ' + wildlife.slice(0,2).join(' & '));

      // Same life cycle
      var lc = String(plant.lifeCycle || '').toLowerCase();
      var plc = String(p.lifeCycle || '').toLowerCase();
      if (lc && plc && lc === plc && reasons.length) reasons.push(lc);

      if (reasons.length >= 1) {
        results.push({ plant: p, reasons: reasons, score: reasons.length + (shared.length * 0.1) });
      }
    });

    return results.sort(function (a, b) { return b.score - a.score; }).slice(0, 8);
  }

  function renderCompanionsWidget(plant, allPlants) {
    var companions = findCompanions(plant, allPlants);
    if (!companions.length) {
      return '<p style="color:#6b7280;font-size:13px;margin:0;padding:8px 0;">No close companions found yet — add more plants with overlapping locations, bloom times, or wildlife support to see neighbors here.</p>';
    }

    var items = companions.map(function (c) {
      var sc   = nativeScore(c.plant);
      var scBg = sc >= 7 ? '#dcfce7' : sc >= 4 ? '#fef3c7' : '#f3f4f6';
      var scCol= sc >= 7 ? '#166534' : sc >= 4 ? '#92400e' : '#374151';
      var bloomBar = renderBloomBar(c.plant);
      return '<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:10px 12px;cursor:pointer;" class="garden-companion-card" data-pid="' + esc(c.plant.id) + '">'
        + '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px;">'
        + '<div>'
        + '<span style="font-size:13px;font-weight:700;color:#0f172a;">' + esc(c.plant.commonName || 'Unknown') + '</span>'
        + (c.plant.scientificName ? '<span style="font-size:11px;color:#6b7280;font-style:italic;display:block;margin-top:1px;">' + esc(c.plant.scientificName) + '</span>' : '')
        + '</div>'
        + (sc > 0 ? '<span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:999px;white-space:nowrap;background:' + scBg + ';color:' + scCol + ';">★' + sc + '</span>' : '')
        + '</div>'
        + (bloomBar ? '<div style="margin:5px 0 3px;">' + bloomBar + '</div>' : '')
        + '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">'
        + c.reasons.map(function (r) {
            return '<span style="font-size:10px;background:#e0f2fe;color:#0369a1;border-radius:999px;padding:1px 7px;">' + esc(r) + '</span>';
          }).join('')
        + '</div>'
        + '</div>';
    }).join('');

    return '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;">' + items + '</div>'
      + '<p style="margin:8px 0 0;font-size:11px;color:#9ca3af;">Click a neighbor card to open its details.</p>';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FEATURE 5 – BULK ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  function toggleBulkMode() {
    enhState.bulkMode = !enhState.bulkMode;
    if (!enhState.bulkMode) enhState.bulkSelected = [];
    var btn = document.getElementById('gardenBulkModeBtn');
    if (btn) btn.textContent = enhState.bulkMode ? '✓ Exit Bulk' : '☑ Bulk Select';
    renderBulkToolbar();
    G().renderCards();
  }

  function toggleBulkSelect(plantId) {
    var idx = enhState.bulkSelected.indexOf(plantId);
    if (idx >= 0) enhState.bulkSelected.splice(idx, 1);
    else           enhState.bulkSelected.push(plantId);
    renderBulkToolbar();
  }

  function renderBulkToolbar() {
    var toolbar = document.getElementById('gardenBulkToolbar');
    if (!toolbar) return;
    var count = enhState.bulkSelected.length;
    if (!enhState.bulkMode || count === 0) { toolbar.style.display = 'none'; return; }
    toolbar.style.display = 'flex';
    var counter = toolbar.querySelector('#gardenBulkCount');
    if (counter) counter.textContent = count + ' plant' + (count !== 1 ? 's' : '') + ' selected';
    var summary = document.getElementById('gardenBulkSummary');
    if (summary) summary.textContent = count + ' plant' + (count !== 1 ? 's' : '') + ' selected. Changes will apply to every selected plant.';
  }

  function applyBulkEdit() {
    var location  = (document.getElementById('gardenBulkLocation')  || {}).value;
    var tag       = (document.getElementById('gardenBulkTag')        || {}).value;
    var nativeFlag= (document.getElementById('gardenBulkNative')     || {}).value;
    var birdFlag  = (document.getElementById('gardenBulkBird')       || {}).value;
    var tags      = splitTags(tag);
    var now = new Date().toISOString();
    var kapG = G();
    var undoPlants = {};
    var undoTags = {};
    var appliedCount = enhState.bulkSelected.length;
    enhState.bulkSelected.forEach(function (id) {
      var plant = kapG.state.plants.find(function (p) { return p.id === id; });
      if (!plant) return;
      undoPlants[id] = snapshotPlantForUndo(plant);
      undoTags[id] = cloneJson(enhState.customTags[id] || []);
      if (location  && location.trim())  plant.locationPlanted = location.trim();
      if (nativeFlag && nativeFlag !== '') plant.nativeToNc = nativeFlag;
      if (birdFlag  && birdFlag !== '')   plant.supportsBirds = birdFlag;
      if (tags.length) {
        if (!enhState.customTags[id]) enhState.customTags[id] = [];
        tags.forEach(function (trimTag) {
          if (!enhState.customTags[id].includes(trimTag)) enhState.customTags[id].push(trimTag);
        });
      }
      plant.updatedAt = now;
    });
    kapG.state.dirty = true;
    kapG.saveLocal();
    saveEnh();
    kapG.renderCards();
    var modal = document.getElementById('gardenBulkModal');
    if (modal) modal.classList.remove('open');
    if (appliedCount) {
      showUndoToast(appliedCount + ' plant' + (appliedCount !== 1 ? 's' : '') + ' updated', function () {
        Object.keys(undoPlants).forEach(function (id) {
          var idx = kapG.state.plants.findIndex(function (p) { return p.id === id; });
          if (idx >= 0) kapG.state.plants[idx] = cloneJson(undoPlants[id]);
          if (undoTags[id] && undoTags[id].length) enhState.customTags[id] = cloneJson(undoTags[id]);
          else delete enhState.customTags[id];
        });
        kapG.state.dirty = true;
        kapG.saveLocal();
        saveEnh();
        kapG.renderCards();
        gardenToast('Bulk changes undone', 'info', 1800);
      });
    }
    enhState.bulkSelected = [];
    renderBulkToolbar();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FEATURE 6 – DUPLICATE DETECTION
  // ═══════════════════════════════════════════════════════════════════════════
  function normStr(s) {
    return normalizeDupeName(s);
  }

  function levenshtein(a, b) {
    var m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    var row = [], prev = [];
    for (var j = 0; j <= n; j++) prev[j] = j;
    for (var i = 1; i <= m; i++) {
      row[0] = i;
      for (var jj = 1; jj <= n; jj++) {
        row[jj] = a[i - 1] === b[jj - 1] ? prev[jj - 1] :
          1 + Math.min(prev[jj], row[jj - 1], prev[jj - 1]);
      }
      prev = row.slice();
    }
    return prev[n];
  }

  function findDuplicates(plant, allPlants) {
    var nc = normStr(plant.commonName);
    var ns = normStr(plant.scientificName);
    var nct = nameTokens(plant.commonName);
    var nst = nameTokens(plant.scientificName);
    return allPlants.filter(function (p) {
      if (p.id === plant.id) return false;
      var pc = normStr(p.commonName);
      var ps = normStr(p.scientificName);
      var pct = nameTokens(p.commonName);
      var pst = nameTokens(p.scientificName);
      var reasons = [];

      if (nc && pc) {
        var cd = levenshtein(nc, pc);
        if (cd <= 3) reasons.push('common names are very similar');
        if (nc === pc) reasons.push('common names match');
        if (nc.indexOf(pc) >= 0 || pc.indexOf(nc) >= 0) reasons.push('common name contains the other');
      }
      if (ns && ps) {
        var sd = levenshtein(ns, ps);
        if (sd <= 4) reasons.push('scientific names are very similar');
        if (ns === ps) reasons.push('scientific names match');
        if (ns.indexOf(ps) >= 0 || ps.indexOf(ns) >= 0) reasons.push('scientific name contains the other');
      }

      if (!reasons.length && nct.length && pct.length) {
        var commonOverlap = nct.filter(function (token) { return pct.indexOf(token) >= 0; }).length;
        if (commonOverlap >= 2) reasons.push('common names share multiple words');
      }
      if (!reasons.length && nst.length && pst.length) {
        var sciOverlap = nst.filter(function (token) { return pst.indexOf(token) >= 0; }).length;
        if (sciOverlap >= 2) reasons.push('scientific names share multiple words');
      }

      return reasons.length ? { plant: p, reasons: reasons } : null;
    }).filter(Boolean).sort(function (a, b) {
      return b.reasons.length - a.reasons.length;
    });
  }

  function showDupeWarning(plant, dupes, onContinue) {
    var modal = document.getElementById('gardenDupeModal');
    var list  = document.getElementById('gardenDupeList');
    var summary = document.getElementById('gardenDupeSummary');
    if (!modal || !list) { onContinue(); return; }
    if (summary) summary.textContent = dupes.length + ' possible match' + (dupes.length !== 1 ? 'es' : '') + ' found. Review before saving.';
    list.innerHTML = '<ul style="margin:0;padding-left:20px;">'
      + dupes.map(function (d) {
          return '<li style="margin-bottom:8px;"><strong>' + esc(d.plant.commonName) + '</strong>'
            + (d.plant.scientificName ? ' <em>(' + esc(d.plant.scientificName) + ')</em>' : '')
            + (d.plant.locationPlanted ? ' — ' + esc(d.plant.locationPlanted) : '')
            + '<div style="font-size:12px;color:#92400e;margin-top:2px;">Possible match: ' + esc(d.reasons.join(', ')) + '</div></li>';
        }).join('')
      + '</ul>';
    modal.classList.add('open');
    var contBtn   = document.getElementById('gardenDupeContinueBtn');
    var cancelBtn = document.getElementById('gardenDupeCancelBtn');
    function cleanup() { modal.classList.remove('open'); contBtn.onclick = null; if (cancelBtn) cancelBtn.onclick = null; }
    if (contBtn)   contBtn.onclick  = function () { cleanup(); onContinue(); };
    if (cancelBtn) cancelBtn.onclick = function () { cleanup(); };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FEATURE 7 – SYNC CONFLICT PANEL
  // ═══════════════════════════════════════════════════════════════════════════
  var DIFF_FIELDS = ['commonName','scientificName','locationPlanted','bloomMonths','bloomSeasons','bestTimeSeed','notes','lifeCycle','nativeToNc','nativeToHenderson','supportsBirds','butterflyHost','supportsSpecialistBees'];
  var DIFF_LABELS = { commonName:'Common Name', scientificName:'Scientific Name', locationPlanted:'Location', bloomMonths:'Bloom Months', bloomSeasons:'Bloom Seasons', bestTimeSeed:'Seed Time', notes:'Notes', lifeCycle:'Life Cycle', nativeToNc:'NC Native', nativeToHenderson:'Henderson Native', supportsBirds:'Supports Birds', butterflyHost:'Butterfly Host', supportsSpecialistBees:'Specialist Bees' };

  function storeExcelSnapshot(plants) {
    enhState.excelSnapshot = {};
    plants.forEach(function (p) { enhState.excelSnapshot[p.id] = JSON.parse(JSON.stringify(p)); });
    saveEnh();
  }

  function buildLocalVsSnapshotDiffs() {
    var kapG = G();
    var conflicts = [];
    kapG.state.plants.forEach(function (local) {
      var snap = enhState.excelSnapshot[local.id];
      if (!snap) return;
      var diffs = DIFF_FIELDS.filter(function (f) {
        var lv = Array.isArray(local[f]) ? local[f].join('\n') : String(local[f] || '');
        var sv = Array.isArray(snap[f])  ? snap[f].join('\n')  : String(snap[f]  || '');
        return lv !== sv;
      });
      if (diffs.length) conflicts.push({ local: local, snap: snap, diffs: diffs });
    });
    return conflicts;
  }

  function showConflictPanel(conflicts, onResolved) {
    var panel   = document.getElementById('gardenConflictModal');
    var content = document.getElementById('gardenConflictContent');
    var summaryTop = document.getElementById('gardenConflictSummaryTop');
    if (!panel || !content || !conflicts.length) { onResolved([]); return; }

    panel._choices = [];

    var totalDiffs = conflicts.reduce(function (sum, c) { return sum + c.diffs.length; }, 0);
    if (summaryTop) {
      summaryTop.textContent = conflicts.length + ' plant' + (conflicts.length !== 1 ? 's' : '') + ' need review and ' + totalDiffs + ' field change' + (totalDiffs !== 1 ? 's' : '') + ' were found.';
    }
    content.innerHTML = conflicts.map(function (c, ci) {
      var fieldNames = c.diffs.map(function (f) { return DIFF_LABELS[f] || f; }).join(', ');
      return '<div class="garden-conflict-item" data-ci="' + ci + '">'
        + '<h4 style="margin:0 0 6px;">' + esc(c.local.commonName || 'Unnamed') + '</h4>'
        + '<div class="garden-conflict-summary">'
        + '<strong style="color:#0f172a;">Local changed vs Excel changed</strong>'
        + '<span>Changed fields: ' + esc(fieldNames) + '</span>'
        + '</div>'
        + '<table style="width:100%;border-collapse:collapse;font-size:12px;">'
        + '<tr><th style="padding:4px;background:#f9fafb;text-align:left;">Field</th>'
        + '<th style="padding:4px;background:#fef3c7;text-align:left;">Local (changed)</th>'
        + '<th style="padding:4px;background:#eff6ff;text-align:left;">Last Excel Sync</th></tr>'
        + c.diffs.map(function (f) {
            var lv = Array.isArray(c.local[f]) ? c.local[f].join(', ') : c.local[f] || '';
            var sv = Array.isArray(c.snap[f])  ? c.snap[f].join(', ')  : c.snap[f]  || '';
            return '<tr><td style="padding:4px;border-top:1px solid #e5e7eb;">' + esc(DIFF_LABELS[f] || f) + '</td>'
              + '<td style="padding:4px;border-top:1px solid #e5e7eb;background:#fef9c3;">' + esc(lv) + '</td>'
              + '<td style="padding:4px;border-top:1px solid #e5e7eb;background:#dbeafe;">' + esc(sv) + '</td></tr>';
          }).join('')
        + '</table>'
        + '<div style="display:flex;gap:8px;margin-top:8px;">'
        + '<button type="button" class="garden-btn" style="font-size:12px;" data-ci="' + ci + '" data-choice="keep">Keep Local</button>'
        + '<button type="button" class="garden-btn" style="font-size:12px;background:#dbeafe;" data-ci="' + ci + '" data-choice="revert">Revert to Snapshot</button>'
        + '</div></div>';
    }).join('');

    panel.classList.add('open');

    content.querySelectorAll('[data-choice]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var ci     = parseInt(btn.getAttribute('data-ci'), 10);
        var choice = btn.getAttribute('data-choice');
        panel._choices[ci] = choice;
        // If reverting, apply snapshot values now
        if (choice === 'revert') {
          var kapG = G();
          var c    = conflicts[ci];
          var idx  = kapG.state.plants.findIndex(function (p) { return p.id === c.local.id; });
          if (idx >= 0) {
            var before = snapshotPlantForUndo(kapG.state.plants[idx]);
            c.diffs.forEach(function (f) { kapG.state.plants[idx][f] = c.snap[f]; });
            kapG.saveLocal();
            showUndoToast('Reverted changes applied', function () {
              kapG.state.plants[idx] = before;
              kapG.state.dirty = true;
              kapG.saveLocal();
              kapG.renderCards();
              gardenToast('Revert undone', 'info', 1800);
            });
          }
        }
        var item = content.querySelector('[data-ci="' + ci + '"]');
        if (item) { item.style.opacity = '0.5'; item.querySelectorAll('button').forEach(function (b) { b.disabled = true; }); }
        if (panel._choices.filter(Boolean).length === conflicts.length) {
          setTimeout(function () { panel.classList.remove('open'); onResolved(panel._choices); }, 250);
        }
      });
    });

    var allLocal = document.getElementById('gardenConflictAllLocal');
    var allSnap  = document.getElementById('gardenConflictAllSnap');
    if (allLocal) allLocal.onclick = function () { panel._choices = conflicts.map(function () { return 'keep'; }); panel.classList.remove('open'); onResolved(panel._choices); };
    if (allSnap)  allSnap.onclick  = function () {
      panel._choices = conflicts.map(function () { return 'revert'; });
      // Revert all
      var kapG = G();
      var beforeAll = {};
      conflicts.forEach(function (c) {
        var idx = kapG.state.plants.findIndex(function (p) { return p.id === c.local.id; });
        if (idx >= 0) {
          beforeAll[c.local.id] = snapshotPlantForUndo(kapG.state.plants[idx]);
          c.diffs.forEach(function (f) { kapG.state.plants[idx][f] = c.snap[f]; });
        }
      });
      kapG.saveLocal();
      panel.classList.remove('open');
      onResolved(panel._choices);
      showUndoToast('Excel version applied', function () {
        Object.keys(beforeAll).forEach(function (id) {
          var idx = kapG.state.plants.findIndex(function (p) { return p.id === id; });
          if (idx >= 0) kapG.state.plants[idx] = cloneJson(beforeAll[id]);
        });
        kapG.state.dirty = true;
        kapG.saveLocal();
        kapG.renderCards();
        gardenToast('Revert undone', 'info', 1800);
      });
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FEATURE 8 – EXPORT VIEWS
  // ═══════════════════════════════════════════════════════════════════════════
  function exportPollinators() {
    var plants = G().state.plants.filter(function (p) {
      return p.butterflyHost === 'Yes' || p.supportsSpecialistBees === 'Yes' ||
             p.supportsDragonflies === 'Yes' || p.supportsHoverflies === 'Yes' || p.supportsMoths === 'Yes';
    });
    runExport('Pollinator Plants', plants,
      ['commonName','scientificName','locationPlanted','butterflyHostSpecies','specialistBeeSpecies','bloomSeasons','bloomMonths','nativeToNc','nativeToHenderson']);
  }

  function exportBirdSupport() {
    var plants = G().state.plants.filter(function (p) { return p.supportsBirds === 'Yes'; });
    runExport('Bird Support Plants', plants,
      ['commonName','scientificName','locationPlanted','birdSpeciesSupported','bloomSeasons','bloomMonths','nativeToNc','nativeToHenderson']);
  }

  function exportToBuy() {
    var plants = G().state.plants.filter(function (p) {
      return p.alreadyOnProperty !== 'Yes' && p.startedFromSeed !== 'Yes' && p.startedFromLivePlant !== 'Yes';
    });
    runExport('To Buy This Season', plants,
      ['commonName','scientificName','locationPlanted','wherePurchased','bloomSeasons','lifeCycle','nativeToNc','nativeToHenderson','notes']);
  }

  var EXPORT_LABELS = {
    commonName:'Common Name', scientificName:'Scientific Name', locationPlanted:'Location',
    butterflyHostSpecies:'Butterfly Host Spp.', specialistBeeSpecies:'Bee Spp.',
    bloomSeasons:'Bloom Seasons', bloomMonths:'Bloom Months', nativeToNc:'NC Native',
    nativeToHenderson:'Henderson Native', birdSpeciesSupported:'Bird Spp.',
    wherePurchased:'Source', lifeCycle:'Life Cycle', notes:'Notes'
  };

  function runExport(title, plants, fields) {
    plants = plants.slice().sort(function (a, b) {
      return String(a.commonName || '').localeCompare(String(b.commonName || ''));
    });
    // CSV
    var rows = [fields.map(function (f) { return '"' + (EXPORT_LABELS[f] || f) + '"'; }).join(',')];
    plants.forEach(function (p) {
      rows.push(fields.map(function (f) {
        var v = Array.isArray(p[f]) ? p[f].join('; ') : (p[f] || '');
        return '"' + String(v).replace(/"/g, '""') + '"';
      }).join(','));
    });
    var csvBlob = new Blob([rows.join('\n')], { type: 'text/csv' });
    var a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(csvBlob),
      download: title.replace(/\s+/g, '-').toLowerCase() + '.csv'
    });
    a.click();
    URL.revokeObjectURL(a.href);

    // Printable window
    var scoreFn = nativeScore;
    var tableRows = plants.map(function (p) {
      var sc = scoreFn(p);
      var scColor = sc >= 7 ? '#166534' : sc >= 4 ? '#92400e' : '#374151';
      var scBg    = sc >= 7 ? '#dcfce7' : sc >= 4 ? '#fef3c7' : '#f3f4f6';
      return '<tr>' + fields.map(function (f) {
        var v = Array.isArray(p[f]) ? p[f].join(', ') : (p[f] || '—');
        return '<td>' + String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;') + '</td>';
      }).join('') + '<td><span style="display:inline-block;padding:2px 8px;border-radius:999px;font-weight:700;font-size:11px;background:' + scBg + ';color:' + scColor + ';">★' + sc + '</span></td></tr>';
    }).join('');

    var win = window.open('', '_blank');
    if (!win) return;
    win.document.write('<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>' + title + '</title>'
      + '<style>body{font-family:system-ui,sans-serif;padding:20px;max-width:1000px;margin:0 auto}'
      + 'h1{font-size:20px}p.sub{color:#6b7280;font-size:13px;margin:0 0 14px}'
      + 'table{width:100%;border-collapse:collapse;font-size:12px}th{background:#166534;color:#fff;padding:8px 6px;text-align:left}'
      + 'tr:nth-child(even){background:#f9fafb}td{padding:6px;border-bottom:1px solid #e5e7eb}'
      + 'button{background:#166534;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;margin-bottom:14px}'
      + '@media print{button{display:none}}</style></head><body>'
      + '<h1>🌿 ' + title + '</h1>'
      + '<p class="sub">Henderson County Garden Planner · ' + plants.length + ' plant' + (plants.length !== 1 ? 's' : '') + ' · ' + new Date().toLocaleDateString() + '</p>'
      + '<button onclick="window.print()">🖨️ Print</button>'
      + '<table><thead><tr>' + fields.map(function (f) { return '<th>' + (EXPORT_LABELS[f] || f) + '</th>'; }).join('') + '<th>★ Score</th></tr></thead><tbody>'
      + tableRows + '</tbody></table>'
      + '<p style="margin-top:16px;font-size:11px;color:#9ca3af;">Kyle\'s Garden Planner · Henderson County, NC</p>'
      + '</body></html>');
    win.document.close();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FEATURE D – PHENOLOGY JOURNALING  (first-bloom dates, year-over-year chart)
  // ═══════════════════════════════════════════════════════════════════════════
  function maybeCaptureFirstBloom(plantId, date) {
    if (!date) return false;
    var year = date.substring(0, 4);
    if (!enhState.phenology[plantId]) enhState.phenology[plantId] = {};
    var existing = enhState.phenology[plantId][year];
    if (!existing || date < existing) {
      enhState.phenology[plantId][year] = date;
      saveEnh();
      return !existing; // true = brand-new first bloom this year
    }
    return false;
  }

  function _dayOfYear(dateStr) {
    try {
      var d = new Date(dateStr + 'T12:00:00');
      var start = new Date(d.getFullYear(), 0, 0);
      return Math.floor((d - start) / 864e5);
    } catch (_) { return 0; }
  }

  function renderPhenologyHtml(plantId) {
    var byYear = enhState.phenology[plantId] || {};
    var years  = Object.keys(byYear).sort();
    var html = '<div class="garden-phenology-outer">'
      + '<h4 style="margin:14px 0 4px;font-size:14px;color:#0891b2;">📅 Phenology: First Bloom Dates</h4>'
      + '<p style="font-size:12px;color:#6b7280;margin:0 0 8px;">Track when this plant first bloomed each year. Log a <strong>🌸 bloom</strong> observation to auto-capture, or record manually below.</p>'
      + '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px;">'
      + '<input type="number" class="garden-pheno-year-input" min="2000" max="2099" value="' + new Date().getFullYear() + '" style="width:88px;padding:5px 8px;border:1px solid #d1d5db;border-radius:6px;font:inherit;">'
      + '<input type="date" class="garden-pheno-date-input" value="' + new Date().toISOString().slice(0,10) + '" style="padding:5px 8px;border:1px solid #d1d5db;border-radius:6px;font:inherit;">'
      + '<button type="button" class="garden-btn primary garden-pheno-add" style="font-size:12px;padding:5px 12px;" data-pid="' + esc(plantId) + '">Record First Bloom</button>'
      + '</div>';

    if (!years.length) {
      html += '<p style="color:#6b7280;font-size:13px;text-align:center;padding:10px;background:#f0f9ff;border-radius:8px;border:1px dashed #bae6fd;">No first-bloom dates recorded yet. Log a 🌸 bloom sighting or tap "Record First Bloom" above.</p>';
    } else {
      var rows = years.map(function(y) { return { year: y, date: byYear[y], doy: _dayOfYear(byYear[y]) }; });
      var doys = rows.map(function(r) { return r.doy; });
      var minD = Math.min.apply(null, doys);
      var maxD = Math.max.apply(null, doys);
      var range = maxD - minD || 1;

      if (rows.length >= 2) {
        var drift = rows[rows.length - 1].doy - rows[0].doy;
        var trendBg = drift < -3 ? '#fff1f2' : drift > 3 ? '#eff6ff' : '#f0fdf4';
        var trendColor = drift < -3 ? '#be123c' : drift > 3 ? '#1d4ed8' : '#166534';
        var trendMsg = drift < -3
          ? '🌡️ Blooming ' + Math.abs(drift) + ' day' + (Math.abs(drift) !== 1 ? 's' : '') + ' earlier since ' + rows[0].year + ' — possible climate shift'
          : drift > 3
          ? '❄️ Blooming ' + drift + ' day' + (drift !== 1 ? 's' : '') + ' later since ' + rows[0].year
          : '✅ Bloom date is stable across years';
        html += '<p style="font-size:12px;font-weight:600;padding:6px 10px;border-radius:6px;margin:0 0 8px;background:' + trendBg + ';color:' + trendColor + ';">' + trendMsg + '</p>';
      }

      html += '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:12px;min-width:340px;">'
        + '<thead><tr>'
        + '<th style="text-align:left;padding:5px 6px;background:#ecfeff;color:#0891b2;">Year</th>'
        + '<th style="text-align:left;padding:5px 6px;background:#ecfeff;color:#0891b2;">First Bloom</th>'
        + '<th style="text-align:left;padding:5px 6px;background:#ecfeff;color:#0891b2;">Day #</th>'
        + '<th style="padding:5px 6px;background:#ecfeff;color:#0891b2;width:40%">Timeline</th>'
        + '<th style="padding:5px 6px;background:#ecfeff;"></th>'
        + '</tr></thead><tbody>';

      rows.forEach(function(row, idx) {
        var pct  = Math.round(((row.doy - minD) / range) * 80); // cap at 80% so dot has room
        var prev = idx > 0 ? rows[idx - 1].doy : row.doy;
        var tColor = idx === 0 ? '#374151' : row.doy < prev ? '#dc2626' : row.doy > prev ? '#2563eb' : '#166534';
        var tIcon  = idx === 0 ? '' : (row.doy < prev ? ' ↑ earlier' : row.doy > prev ? ' ↓ later' : ' →');
        html += '<tr>'
          + '<td style="padding:5px 6px;font-weight:700;">' + esc(row.year) + '</td>'
          + '<td style="padding:5px 6px;">' + esc(row.date) + '</td>'
          + '<td style="padding:5px 6px;color:' + tColor + ';font-size:11px;">' + row.doy + esc(tIcon) + '</td>'
          + '<td style="padding:5px 6px;">'
          + '<div style="position:relative;height:12px;background:#e0f7fa;border-radius:3px;">'
          + '<div style="position:absolute;left:' + pct + '%;top:1px;width:10px;height:10px;background:#0891b2;border-radius:50%;transform:translateX(-50%);transition:left .3s;"></div>'
          + '</div></td>'
          + '<td style="padding:5px 6px;">'
          + '<button type="button" class="garden-pheno-del" data-pheno-year="' + esc(row.year) + '" data-pid="' + esc(plantId) + '" title="Remove" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:12px;padding:2px;">✕</button>'
          + '</td></tr>';
      });
      html += '</tbody></table></div>';
    }
    return html + '</div>';
  }

  function bindPhenologySection(outerEl, plantId) {
    function rerender() {
      outerEl.innerHTML = renderPhenologyHtml(plantId);
      bindPhenologySection(outerEl, plantId);
    }

    var addBtn = outerEl.querySelector('.garden-pheno-add');
    if (addBtn) {
      addBtn.addEventListener('click', function() {
        var yEl = outerEl.querySelector('.garden-pheno-year-input');
        var dEl = outerEl.querySelector('.garden-pheno-date-input');
        var year = String(yEl ? yEl.value : new Date().getFullYear());
        var date = dEl ? dEl.value : '';
        if (!date) { gardenToast('Please pick a date', 'error', 1600); return; }
        var before = cloneJson(enhState.phenology[plantId] || {});
        if (!enhState.phenology[plantId]) enhState.phenology[plantId] = {};
        enhState.phenology[plantId][year] = date;
        saveEnh();
        rerender();
        gardenToast('First bloom recorded for ' + year, 'success', 1800);
        showUndoToast('First bloom added (' + year + ')', function() {
          enhState.phenology[plantId] = before;
          saveEnh();
          rerender();
        });
      });
    }

    outerEl.querySelectorAll('.garden-pheno-del').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var pyear = btn.getAttribute('data-pheno-year');
        var before = cloneJson(enhState.phenology[plantId] || {});
        if (enhState.phenology[plantId]) delete enhState.phenology[plantId][pyear];
        saveEnh();
        rerender();
        showUndoToast('First bloom removed (' + pyear + ')', function() {
          enhState.phenology[plantId] = before;
          saveEnh();
          rerender();
        });
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FEATURE E – GARDEN MAP / BED DIAGRAM
  // ═══════════════════════════════════════════════════════════════════════════
  var MAP_BED_COLORS = [
    '#bbf7d0','#bfdbfe','#fde68a','#fecaca','#ddd6fe',
    '#fed7aa','#cffafe','#d9f99d','#fce7f3','#e0e7ff'
  ];
  var MAP_BED_TEXT = [
    '#166534','#1d4ed8','#92400e','#b91c1c','#6d28d9',
    '#9a3412','#0e7490','#3f6212','#9d174d','#3730a3'
  ];

  function renderGardenMap() {
    var kapG = G();
    if (!kapG || !kapG.state || !kapG.state.plants.length) {
      document.getElementById('gardenMapContent').innerHTML =
        '<p style="color:#6b7280;text-align:center;padding:20px;">No plants in your garden yet. Add some plants first!</p>';
      return;
    }

    // Group plants by locationPlanted
    var beds = {};
    kapG.state.plants.forEach(function(p) {
      var loc = (p.locationPlanted || '').trim() || 'Unassigned';
      if (!beds[loc]) beds[loc] = [];
      beds[loc].push(p);
    });

    var bedNames = Object.keys(beds).sort(function(a, b) {
      if (a === 'Unassigned') return 1;
      if (b === 'Unassigned') return -1;
      return a.localeCompare(b);
    });

    var content = document.getElementById('gardenMapContent');
    content.innerHTML = bedNames.map(function(bedName, bi) {
      var color = MAP_BED_COLORS[bi % MAP_BED_COLORS.length];
      var textColor = MAP_BED_TEXT[bi % MAP_BED_TEXT.length];
      var plants = beds[bedName];
      var chips = plants.map(function(p) {
        var sc = nativeScore(p);
        return '<div draggable="true" class="garden-map-plant-chip" data-pid="' + esc(p.id) + '" data-pname="' + esc(p.commonName) + '" '
          + 'style="background:#fff;border:1px solid #d1d5db;border-radius:8px;padding:5px 9px;font-size:12px;cursor:grab;display:inline-flex;align-items:center;gap:5px;margin:4px 3px;transition:box-shadow .15s;'
          + (sc >= 7 ? 'border-left:3px solid #166534;' : '') + '">'
          + '<span>' + esc(p.commonName || 'Unnamed') + '</span>'
          + (sc > 0 ? '<span style="font-size:10px;color:#6b7280;" title="Native score">★' + sc + '</span>' : '')
          + (renderBloomBar(p) ? '<span style="width:44px;display:inline-block;">' + renderBloomBar(p).replace(/margin:[^;]+;/g,'') + '</span>' : '')
          + '</div>';
      }).join('');

      return '<div class="garden-map-bed" data-bed-name="' + esc(bedName) + '" '
        + 'style="background:' + color + ';border-radius:12px;padding:12px;min-height:80px;'
        + 'border:2px dashed transparent;transition:border-color .2s;">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">'
        + '<strong style="font-size:13px;color:' + textColor + ';">' + esc(bedName) + '</strong>'
        + '<span style="font-size:11px;color:' + textColor + ';opacity:.7;">' + plants.length + ' plant' + (plants.length !== 1 ? 's' : '') + '</span>'
        + '</div>'
        + '<div class="garden-map-bed-plants" style="display:flex;flex-wrap:wrap;gap:0;">' + chips + '</div>'
        + '</div>';
    }).join('');

    // Wire drag-and-drop
    content.querySelectorAll('.garden-map-plant-chip').forEach(function(chip) {
      chip.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('text/plain', chip.getAttribute('data-pid'));
        e.dataTransfer.effectAllowed = 'move';
        chip.style.opacity = '0.4';
      });
      chip.addEventListener('dragend', function() { chip.style.opacity = '1'; });
      chip.addEventListener('click', function() {
        var pid = chip.getAttribute('data-pid');
        var kapG2 = G();
        if (!kapG2) return;
        var plant = kapG2.state.plants.find(function(p) { return p.id === pid; });
        if (plant && typeof kapG2.openDetails === 'function') {
          document.getElementById('gardenMapModal').classList.remove('open');
          kapG2.openDetails(plant);
        }
      });
    });

    content.querySelectorAll('.garden-map-bed').forEach(function(bed) {
      bed.addEventListener('dragover', function(e) {
        e.preventDefault();
        bed.style.borderColor = '#166534';
      });
      bed.addEventListener('dragleave', function() {
        bed.style.borderColor = 'transparent';
      });
      bed.addEventListener('drop', function(e) {
        e.preventDefault();
        bed.style.borderColor = 'transparent';
        var pid   = e.dataTransfer.getData('text/plain');
        var newLoc = bed.getAttribute('data-bed-name');
        var kapG2  = G();
        if (!kapG2 || !pid) return;
        var plant = kapG2.state.plants.find(function(p) { return p.id === pid; });
        if (!plant) return;
        var oldLoc = plant.locationPlanted || 'Unassigned';
        if (oldLoc === newLoc) return;
        var before = cloneJson(plant);
        plant.locationPlanted = newLoc === 'Unassigned' ? '' : newLoc;
        kapG2.saveLocal();
        kapG2.renderCards();
        renderGardenMap();
        gardenToast(esc(plant.commonName) + ' moved to ' + newLoc, 'success', 1800);
        showUndoToast('Moved to ' + newLoc, function() {
          plant.locationPlanted = before.locationPlanted;
          kapG2.saveLocal();
          kapG2.renderCards();
          renderGardenMap();
        });
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FEATURE F – SUCCESSION PLANTING PLANNER
  // ═══════════════════════════════════════════════════════════════════════════
  // Curated NC / Henderson County native fill-in suggestions
  var NC_FILL_INS = [
    { name: 'Bloodroot',              scientific: 'Sanguinaria canadensis',  months: [1,2],   why: 'Earliest spring bloom, deep shade tolerant' },
    { name: 'Wild Columbine',         scientific: 'Aquilegia canadensis',     months: [2,3,4], why: 'Hummingbird & bee magnet, part shade' },
    { name: 'Wild Blue Phlox',        scientific: 'Phlox divaricata',         months: [3,4],   why: 'Spring groundcover, butterfly nectar' },
    { name: 'Golden Alexanders',      scientific: 'Zizia aurea',              months: [3,4,5], why: 'Host for black swallowtail, early pollinators' },
    { name: 'Spiderwort',             scientific: 'Tradescantia ohiensis',    months: [4,5],   why: 'Long bloom, specialist bee host' },
    { name: 'Purple Coneflower',      scientific: 'Echinacea purpurea',       months: [5,6,7], why: 'Iconic summer pollinator magnet, seeds for birds' },
    { name: 'Wild Bergamot',          scientific: 'Monarda fistulosa',        months: [5,6,7], why: 'Native bee specialist host, aromatic' },
    { name: 'Butterfly Weed',         scientific: 'Asclepias tuberosa',       months: [5,6,7], why: 'Monarch host, specialist bee pollen' },
    { name: 'Blue Wild Indigo',       scientific: 'Baptisia australis',       months: [4,5],   why: 'Long-lived perennial, cloudless sulphur host' },
    { name: 'Mountain Mint',          scientific: 'Pycnanthemum virginianum', months: [6,7,8], why: 'Top-10 insect attractor, late bee sustainer' },
    { name: 'Cup Plant',              scientific: 'Silphium perfoliatum',     months: [6,7,8], why: 'Water for insects in leaf cups, bird seed' },
    { name: 'Ironweed',               scientific: 'Vernonia noveboracensis',  months: [7,8,9], why: 'Late-summer native bee feast' },
    { name: 'Joe Pye Weed',           scientific: 'Eutrochium purpureum',     months: [7,8,9], why: 'Tall late-summer pollinator beacon' },
    { name: 'Black-eyed Susan',       scientific: 'Rudbeckia hirta',          months: [6,7,8,9], why: 'Goldfinch seeds, mid-summer bloomer' },
    { name: 'Cardinal Flower',        scientific: 'Lobelia cardinalis',       months: [7,8,9], why: 'Ruby-throated hummingbird specialist' },
    { name: 'Blue Mistflower',        scientific: 'Conoclinium coelestinum',  months: [8,9,10], why: 'Late nectar for fall migrants & monarchs' },
    { name: 'Goldenrod (stiff)',      scientific: 'Solidago rigida',          months: [8,9,10], why: 'Fall pollinator gold mine, specialist bees' },
    { name: 'New England Aster',      scientific: 'Symphyotrichum novae-angliae', months: [9,10,11], why: 'Critical fall nectar for monarchs & bees' },
    { name: 'Witch-hazel',            scientific: 'Hamamelis virginiana',     months: [10,11], why: 'Fall/winter bloom, only native witch-hazel' },
    { name: 'Swamp Rose Mallow',      scientific: 'Hibiscus moscheutos',      months: [7,8,9], why: 'Giant blooms, specialist mallow bees' }
  ];

  function computeBloomCoverage(plants) {
    var counts = new Array(12).fill(0);
    plants.forEach(function(p) {
      var months = parseMonths(p.bloomMonths || p.bloomSeasons || '');
      months.forEach(function(m) { if (m >= 0 && m < 12) counts[m]++; });
    });
    return counts;
  }

  function renderSuccessionPlanner() {
    var kapG = G();
    var plants = kapG && kapG.state ? kapG.state.plants : [];
    var coverage = computeBloomCoverage(plants);
    var maxCoverage = Math.max.apply(null, coverage) || 1;

    var barColors = coverage.map(function(c) {
      if (c === 0) return '#fca5a5';
      if (c === 1) return '#fed7aa';
      if (c <= 3)  return '#fde68a';
      return '#86efac';
    });

    var monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    // Build the bar chart HTML
    var chartHtml = '<div style="margin:0 0 12px;">'
      + '<p style="font-size:12px;font-weight:700;color:#374151;margin:0 0 6px;">Bloom Coverage by Month — ' + plants.length + ' plants</p>'
      + '<div style="display:flex;gap:3px;align-items:flex-end;height:80px;">'
      + coverage.map(function(c, i) {
          var h = Math.max(4, Math.round((c / maxCoverage) * 70));
          return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;">'
            + '<span style="font-size:9px;color:#64748b;font-weight:700;">' + (c || '') + '</span>'
            + '<div style="width:100%;height:' + h + 'px;background:' + barColors[i] + ';border-radius:3px 3px 0 0;" title="' + monthLabels[i] + ': ' + c + ' plant' + (c!==1?'s':'') + ' blooming"></div>'
            + '</div>';
        }).join('')
      + '</div>'
      + '<div style="display:flex;gap:3px;margin-top:2px;">'
      + monthLabels.map(function(m) { return '<div style="flex:1;text-align:center;font-size:9px;color:#9ca3af;">' + m + '</div>'; }).join('')
      + '</div>'
      + '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;font-size:11px;">'
      + '<span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:#fca5a5;border-radius:2px;display:inline-block;"></span> No bloom</span>'
      + '<span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:#fed7aa;border-radius:2px;display:inline-block;"></span> 1 plant</span>'
      + '<span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:#fde68a;border-radius:2px;display:inline-block;"></span> 2–3 plants</span>'
      + '<span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:#86efac;border-radius:2px;display:inline-block;"></span> 4+ plants</span>'
      + '</div></div>';

    // Identify gaps (0–1 plants) and suggest fill-ins
    var gapMonths = coverage.reduce(function(arr, c, i) { if (c <= 1) arr.push(i); return arr; }, []);
    var suggestHtml = '';

    if (gapMonths.length === 0) {
      suggestHtml = '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;font-size:13px;color:#166534;">'
        + '🎉 <strong>Excellent coverage!</strong> Every month has 2+ blooming plants. Your garden supports pollinators year-round.</div>';
    } else {
      var gapStr = gapMonths.map(function(i) { return monthLabels[i]; }).join(', ');
      suggestHtml = '<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:10px 12px;margin-bottom:10px;font-size:13px;">'
        + '<strong style="color:#92400e;">⚠️ Bloom gaps found in: ' + gapStr + '</strong>'
        + '<p style="margin:4px 0 0;color:#78350f;font-size:12px;">The plants below are Henderson County natives that bloom during your gap months.</p></div>';

      // Find fill-in suggestions for gap months
      var suggestions = NC_FILL_INS.filter(function(s) {
        return s.months.some(function(m) { return gapMonths.indexOf(m) >= 0; });
      }).filter(function(s) {
        // Exclude plants already in the garden by name match
        var sName = s.name.toLowerCase();
        return !plants.some(function(p) {
          return (p.commonName || '').toLowerCase().indexOf(sName) >= 0
            || (p.scientificName || '').toLowerCase().indexOf(s.scientific.toLowerCase()) >= 0;
        });
      });

      if (!suggestions.length) {
        suggestHtml += '<p style="color:#6b7280;font-size:13px;">You already have good natives for these months — consider adding more of what you have!</p>';
      } else {
        suggestHtml += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:8px;margin-top:6px;">'
          + suggestions.map(function(s) {
              var gapHit = s.months.filter(function(m) { return gapMonths.indexOf(m) >= 0; });
              var gapLabels = gapHit.map(function(m) { return monthLabels[m]; }).join(', ');
              return '<div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:10px;">'
                + '<p style="font-weight:700;font-size:13px;margin:0 0 2px;">' + esc(s.name) + '</p>'
                + '<p style="font-size:11px;color:#6b7280;margin:0 0 5px;font-style:italic;">' + esc(s.scientific) + '</p>'
                + '<p style="font-size:11px;color:#374151;margin:0 0 5px;">' + esc(s.why) + '</p>'
                + '<span style="font-size:11px;background:#fde68a;color:#92400e;border-radius:4px;padding:2px 7px;">Fills: ' + gapLabels + '</span>'
                + '</div>';
            }).join('')
          + '</div>';
      }
    }

    // Wishlist plants (not yet on property)
    var wishlist = plants.filter(function(p) {
      return p.alreadyOnProperty !== 'Yes' && p.startedFromSeed !== 'Yes' && p.startedFromLivePlant !== 'Yes';
    });
    var wishlistHtml = '';
    if (wishlist.length) {
      wishlistHtml = '<div style="margin-top:12px;">'
        + '<p style="font-weight:700;font-size:13px;margin:0 0 6px;color:#374151;">🛒 Your Wishlist Plants (' + wishlist.length + ') — Check if they fill gaps</p>'
        + '<div style="display:flex;flex-wrap:wrap;gap:6px;">'
        + wishlist.map(function(p) {
            var months = parseMonths(p.bloomMonths || p.bloomSeasons || '');
            var fillsGap = months.some(function(m) { return gapMonths.indexOf(m) >= 0; });
            return '<span style="background:' + (fillsGap ? '#fde68a' : '#f9fafb') + ';border:1px solid ' + (fillsGap ? '#fcd34d' : '#e5e7eb') + ';border-radius:999px;padding:3px 10px;font-size:12px;" title="' + esc(p.bloomMonths || p.bloomSeasons || 'unknown bloom') + '">'
              + (fillsGap ? '⭐ ' : '') + esc(p.commonName || 'Unknown')
              + '</span>';
          }).join('')
        + '</div></div>';
    }

    document.getElementById('gardenSuccessionContent').innerHTML = chartHtml + suggestHtml + wishlistHtml;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FEATURE G – WEATHER + WATERING-NEED INTEGRATION  (Open-Meteo, free, no key)
  // ═══════════════════════════════════════════════════════════════════════════
  var HENDERSON_LAT  =  35.3173;
  var HENDERSON_LON  = -82.4612;
  var WEATHER_CACHE_KEY = 'kapGardenWeatherV1';
  var WEATHER_TTL_MS    = 6 * 60 * 60 * 1000; // 6 hours
  var WATER_THRESHOLD_MM = 6;  // ~0.25 in per week = "dry"
  var WATER_DAYS_WINDOW  = 7;

  function loadWeatherCache() {
    try {
      var c = JSON.parse(localStorage.getItem(WEATHER_CACHE_KEY) || 'null');
      if (c && c.fetchedAt && (Date.now() - c.fetchedAt) < WEATHER_TTL_MS) {
        enhState.weatherCache = c;
        return true;
      }
    } catch (_) {}
    return false;
  }

  function fetchWeatherData() {
    if (loadWeatherCache()) { renderWeatherBanner(); return; }
    // Fetch precipitation (last 7 days) + min temperature (next 7 days) for frost detection
    var url = 'https://api.open-meteo.com/v1/forecast'
      + '?latitude=' + HENDERSON_LAT
      + '&longitude=' + HENDERSON_LON
      + '&daily=precipitation_sum,temperature_2m_min,temperature_2m_max'
      + '&past_days=' + WATER_DAYS_WINDOW
      + '&forecast_days=7'
      + '&timezone=America%2FNew_York';
    fetch(url).then(function(r) { return r.json(); }).then(function(data) {
      var d = data.daily || {};
      var precip  = d.precipitation_sum || [];
      var minTemp = d.temperature_2m_min || [];
      var dates   = d.time || [];
      var today   = new Date().toISOString().slice(0, 10);

      // Past 7 days precipitation
      var pastPrecip = [];
      for (var i = 0; i < dates.length; i++) {
        if (dates[i] <= today) pastPrecip.push(precip[i] || 0);
      }
      var totalMm = pastPrecip.reduce(function(s, v) { return s + v; }, 0);

      // Future frost days (min temp < 2°C = 35.6°F)
      var frostDays = [];
      for (var j = 0; j < dates.length; j++) {
        if (dates[j] > today && minTemp[j] !== undefined && minTemp[j] < 2) {
          frostDays.push({ date: dates[j], minC: minTemp[j], minF: Math.round(minTemp[j] * 9 / 5 + 32) });
        }
      }

      enhState.weatherCache = {
        fetchedAt: Date.now(),
        totalMm:   totalMm,
        days:      pastPrecip,
        frostDays: frostDays,
        minTemps:  minTemp,
        dates:     dates
      };
      try { localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(enhState.weatherCache)); } catch (_) {}
      renderWeatherBanner();
      G() && G().renderCards && G().renderCards();
    }).catch(function() {
      enhState.weatherCache = null;
    });
  }

  function plantNeedsWater(plantId) {
    if (!enhState.weatherCache) return false;
    if (enhState.weatherCache.totalMm >= WATER_THRESHOLD_MM) return false; // enough rain
    // Check if watered recently
    var tasks = enhState.taskLog[plantId] || [];
    var cutoff = new Date(Date.now() - WATER_DAYS_WINDOW * 864e5).toISOString().slice(0, 10);
    var recentWatered = tasks.some(function(t) {
      return (t.type === 'watered' || t.type === 'other') && t.date >= cutoff;
    });
    return !recentWatered;
  }

  function renderWeatherBanner() {
    var banner = document.getElementById('gardenWeatherBanner');
    if (!banner) return;
    if (!enhState.weatherCache) { banner.style.display = 'none'; return; }

    var totalMm = enhState.weatherCache.totalMm;
    var totalIn  = (totalMm / 25.4).toFixed(2);
    var isDry    = totalMm < WATER_THRESHOLD_MM;
    var kapG     = G();
    var needCount = 0;
    if (kapG && kapG.state) {
      needCount = kapG.state.plants.filter(function(p) { return plantNeedsWater(p.id); }).length;
    }
    var frostDays  = enhState.weatherCache.frostDays || [];
    var frostWarning = frostDays.length ? '🧊 <strong>Frost alert: ' + frostDays.length + ' night' + (frostDays.length > 1 ? 's' : '') + ' below freezing forecast</strong> — '
      + frostDays.map(function(f) { return f.date + ' (' + f.minF + '°F)'; }).join(', ') + '. Protect tender plants!' : '';

    var parts = [];
    if (!isDry) {
      parts.push('🌦️ <strong>Last 7 days: ' + totalIn + '" (' + totalMm.toFixed(1) + ' mm)</strong> — Adequate rainfall.');
    } else if (needCount > 0) {
      parts.push('🚿 <strong>' + needCount + ' plant' + (needCount !== 1 ? 's' : '') + ' may need water</strong> — Only ' + totalIn + '" rain this week. Check 💧 plants.');
    } else {
      parts.push('☀️ <strong>Dry week: ' + totalIn + '"</strong> — Plants have been watered recently. ✓');
    }
    if (frostWarning) parts.push(frostWarning);

    var bgColor = frostDays.length ? '#eff6ff' : (needCount > 0 ? '#fef2f2' : (isDry ? '#fff7ed' : '#ecfdf5'));
    var bdColor = frostDays.length ? '#bfdbfe' : (needCount > 0 ? '#fca5a5' : (isDry ? '#fcd34d' : '#6ee7b7'));
    var txColor = frostDays.length ? '#1d4ed8' : (needCount > 0 ? '#991b1b' : (isDry ? '#78350f' : '#065f46'));

    banner.style.display = 'block';
    banner.innerHTML = '<div style="background:' + bgColor + ';border:1px solid ' + bdColor + ';border-radius:8px;padding:8px 14px;font-size:12px;color:' + txColor + ';display:flex;align-items:flex-start;gap:8px;flex-wrap:wrap;">'
      + '<span style="flex:1;">' + parts.join('<br>') + '</span>'
      + '<button type="button" id="gardenWeatherDismiss" style="background:none;border:none;cursor:pointer;color:inherit;font-size:14px;padding:0 4px;flex-shrink:0;" title="Dismiss">✕</button>'
      + '</div>';
    var dismiss = banner.querySelector('#gardenWeatherDismiss');
    if (dismiss) dismiss.addEventListener('click', function() { banner.style.display = 'none'; });
  }

  // ─── Frost-sensitive plant detection ─────────────────────────────────────
  function plantIsFrostSensitive(plant) {
    var coldRes = String(plant.coldResistance || '').toLowerCase();
    var notes   = String(plant.notes || '').toLowerCase();
    if (/tender|frost.sensitive|bring.in|protect|not.frost/i.test(coldRes + ' ' + notes)) return true;
    // Parse temperature strings like "40°F", "50 degrees", "Hardy to 20F"
    var match = coldRes.match(/(\d+)\s*[°º]?\s*f/i);
    if (match && parseInt(match[1], 10) > 35) return true; // not reliably frost-hardy
    return false;
  }

  function gardenFrostAlert() {
    if (!enhState.weatherCache) return null;
    var fd = (enhState.weatherCache.frostDays || []);
    return fd.length ? fd : null;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FEATURE H – NC NATIVE PLANT LOOKUP  (iNaturalist + USDA Plants)
  // ═══════════════════════════════════════════════════════════════════════════
  var INAT_BASE  = 'https://api.inaturalist.org/v1';
  var USDA_BASE  = 'https://plantsdb.xyz';
  var _inatCache = {};

  function inatLookup(query, callback) {
    var key = (query || '').toLowerCase().trim();
    if (key.length < 2) return;
    if (_inatCache[key]) { callback(_inatCache[key]); return; }
    fetch(INAT_BASE + '/taxa/autocomplete?q=' + encodeURIComponent(key) + '&all_names=true&per_page=8')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var results = (data.results || [])
          .filter(function(r) { return r.rank === 'species' || r.rank === 'subspecies' || r.rank === 'variety'; })
          .map(function(r) {
            return { scientificName: r.name, commonName: r.preferred_common_name || '', rank: r.rank, taxonGroup: r.iconic_taxon_name || '' };
          });
        _inatCache[key] = results;
        callback(results);
      })
      .catch(function() { callback([]); });
  }

  function usdaLookup(scientificName, callback) {
    if (!scientificName) { callback(null); return; }
    fetch(USDA_BASE + '/search?q=' + encodeURIComponent(scientificName) + '&fields=Symbol,ScientificName,CommonName,NativeStatus,Duration,GrowthHabit')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var rows = data.data || [];
        var match = rows.find(function(row) {
          return (row.ScientificName || '').toLowerCase().indexOf(scientificName.toLowerCase()) >= 0;
        }) || rows[0];
        if (!match) { callback(null); return; }
        var ns = match.NativeStatus || '';
        callback({
          symbol: match.Symbol,
          scientificName: match.ScientificName,
          commonName: match.CommonName,
          nativeToNc: /\bNC\(\s*N\s*\)/i.test(ns) ? 'Yes' : (/\bNC\(\s*I\s*\)/i.test(ns) ? 'No' : ''),
          nativeL48: /\bL48\(\s*N\s*\)/i.test(ns) ? 'Yes' : '',
          duration: match.Duration || '',
          growthHabit: match.GrowthHabit || '',
          rawNativeStatus: ns
        });
      })
      .catch(function() { callback(null); });
  }

  function injectEditorLookupUI() {
    var form = document.getElementById('gardenEditorForm');
    if (!form || form.querySelector('#gardenPlantLookupBar')) return;

    var bar = document.createElement('div');
    bar.id = 'gardenPlantLookupBar';
    bar.style.cssText = 'background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:10px 12px;margin-bottom:10px;';
    bar.innerHTML = '<p style="font-size:12px;font-weight:700;color:#166534;margin:0 0 6px;">🔍 Auto-fill from iNaturalist + USDA Plants</p>'
      + '<div style="display:flex;gap:8px;flex-wrap:wrap;">'
      + '<input id="gardenLookupInput" type="text" placeholder="Type a plant name to search…" autocomplete="off" style="flex:1;min-width:180px;padding:7px 10px;border:1px solid #d1d5db;border-radius:8px;font:inherit;">'
      + '<button type="button" id="gardenLookupBtn" class="garden-btn primary" style="font-size:12px;padding:6px 14px;">Search</button>'
      + '</div>'
      + '<div id="gardenLookupResults" style="display:none;background:#fff;border:1px solid #e2e8f0;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,.1);margin-top:5px;max-height:200px;overflow-y:auto;"></div>'
      + '<p id="gardenLookupStatus" style="font-size:11px;color:#6b7280;margin:4px 0 0;display:none;"></p>';

    var grid = form.querySelector('.garden-form-grid');
    if (grid) form.insertBefore(bar, grid); else form.insertBefore(bar, form.firstChild);

    var input   = bar.querySelector('#gardenLookupInput');
    var btn     = bar.querySelector('#gardenLookupBtn');
    var results = bar.querySelector('#gardenLookupResults');
    var status  = bar.querySelector('#gardenLookupStatus');

    function doSearch() {
      var q = input.value.trim();
      if (q.length < 2) return;
      btn.disabled = true; btn.textContent = '…';
      status.style.display = 'block';
      status.textContent = 'Searching iNaturalist for "' + q + '"…';
      results.style.display = 'none';
      inatLookup(q, function(data) {
        btn.disabled = false; btn.textContent = 'Search';
        if (!data.length) { status.textContent = 'No results. Try the scientific name or a simpler common name.'; return; }
        status.style.display = 'none';
        results.style.display = 'block';
        results.innerHTML = '<div style="padding:5px 10px;font-size:10px;font-weight:700;color:#6b7280;background:#f8fafc;border-bottom:1px solid #e2e8f0;border-radius:8px 8px 0 0;">'
          + data.length + ' results — click to auto-fill fields</div>'
          + data.map(function(r) {
              return '<div class="garden-lookup-row" data-sci="' + esc(r.scientificName) + '" data-common="' + esc(r.commonName) + '" '
                + 'style="padding:7px 12px;cursor:pointer;border-bottom:1px solid #f1f5f9;font-size:13px;display:flex;justify-content:space-between;align-items:center;gap:8px;">'
                + '<span><strong>' + esc(r.commonName || r.scientificName) + '</strong> <em style="font-size:11px;color:#6b7280;">' + esc(r.scientificName) + '</em></span>'
                + '<span style="font-size:10px;color:#9ca3af;white-space:nowrap;">' + esc(r.taxonGroup || r.rank) + '</span>'
                + '</div>';
            }).join('');

        results.querySelectorAll('.garden-lookup-row').forEach(function(row) {
          row.addEventListener('mouseenter', function() { row.style.background = '#f0fdf4'; });
          row.addEventListener('mouseleave', function() { row.style.background = ''; });
          row.addEventListener('click', function() {
            var sci    = row.getAttribute('data-sci') || '';
            var common = row.getAttribute('data-common') || '';
            var fCommon = form.querySelector('[name="commonName"]');
            var fSci    = form.querySelector('[name="scientificName"]');
            if (fCommon && !fCommon.value) fCommon.value = common;
            if (fSci) fSci.value = sci;
            results.style.display = 'none';
            status.style.display = 'block';
            status.textContent = '✓ Filled from iNaturalist. Checking USDA for NC native status…';
            usdaLookup(sci, function(usda) {
              if (!usda) { status.textContent = '✓ Filled from iNaturalist. (USDA data unavailable)'; return; }
              var fNativeNc  = form.querySelector('[name="nativeToNc"]');
              var fLifeCycle = form.querySelector('[name="lifeCycle"]');
              if (fNativeNc  && !fNativeNc.value  && usda.nativeToNc)  fNativeNc.value  = usda.nativeToNc;
              if (fLifeCycle && !fLifeCycle.value && usda.duration) {
                var dur = usda.duration.toLowerCase();
                if (dur.indexOf('perennial') >= 0) fLifeCycle.value = 'Perennial';
                else if (dur.indexOf('annual') >= 0) fLifeCycle.value = 'Annual';
              }
              var msgs = ['✓ Auto-filled from iNaturalist + USDA Plants.'];
              if (usda.nativeToNc) msgs.push('NC Native: ' + usda.nativeToNc + '.');
              if (usda.rawNativeStatus) msgs.push('USDA Status: ' + usda.rawNativeStatus + '.');
              status.textContent = msgs.join(' ');
            });
          });
        });
      });
    }

    btn.addEventListener('click', doSearch);
    input.addEventListener('keydown', function(e) { if (e.key === 'Enter') { e.preventDefault(); doSearch(); } });
    var _debounce;
    input.addEventListener('input', function() {
      clearTimeout(_debounce);
      _debounce = setTimeout(function() { if (input.value.trim().length >= 3) doSearch(); }, 420);
    });
    document.addEventListener('click', function(e) { if (!bar.contains(e.target)) results.style.display = 'none'; });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FEATURE J – QR CODE PLANT LABELS
  // ═══════════════════════════════════════════════════════════════════════════
  var QR_API = 'https://api.qrserver.com/v1/create-qr-code/';

  function generatePlantQRLabel(plant) {
    var appUrl = window.location.href.replace(/#.*$/, '') + '#garden-plant-' + esc(plant.id);
    var qrUrl  = QR_API + '?size=180x180&margin=8&data=' + encodeURIComponent(appUrl);
    var bloomText = '';
    var bMonths = parseMonths(plant.bloomMonths || plant.bloomSeasons || '');
    if (bMonths.length) {
      var mAbbr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      bloomText = bMonths.map(function(m) { return mAbbr[m]; }).join(', ');
    }
    var sc = nativeScore(plant);
    var win = window.open('', '_blank');
    if (!win) { gardenToast('Allow pop-ups to print labels.', 'error', 2400); return; }
    var rows = [plant, plant, plant]; // 3-up per page
    win.document.write('<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">'
      + '<title>Plant Label – ' + esc(plant.commonName || '') + '</title>'
      + '<style>'
      + '*{box-sizing:border-box} body{font-family:system-ui,sans-serif;background:#fff;margin:0;padding:20px;}'
      + 'h1{font-size:14px;margin:0 0 4px;} .sub{font-size:10px;color:#6b7280;margin:0 0 14px;}'
      + '.page{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;max-width:860px;margin:0 auto;}'
      + '.label{border:2px solid #166534;border-radius:12px;padding:12px;display:grid;grid-template-columns:90px 1fr;gap:10px;align-items:start;page-break-inside:avoid;}'
      + '.name{font-size:14px;font-weight:800;color:#0f172a;margin:0 0 2px;line-height:1.2;}'
      + '.sci{font-size:10px;font-style:italic;color:#4b5563;margin:0 0 6px;}'
      + '.tag{display:inline-block;font-size:9px;font-weight:700;border-radius:4px;padding:2px 6px;margin:1px 2px 1px 0;}'
      + '.t-green{background:#dcfce7;color:#166534;} .t-amber{background:#fde68a;color:#92400e;} .t-blue{background:#dbeafe;color:#1d4ed8;}'
      + '.qr img{width:90px;height:90px;border-radius:6px;display:block;border:1px solid #e5e7eb;}'
      + '.score{font-size:9px;font-weight:700;background:#f0fdf4;color:#166534;border-radius:999px;padding:2px 7px;margin-top:4px;display:inline-block;}'
      + '.foot{font-size:8px;color:#9ca3af;margin-top:5px;} .print-btn{background:#166534;color:#fff;border:none;padding:8px 18px;border-radius:8px;cursor:pointer;font-size:13px;margin-bottom:14px;}'
      + '@media print{.print-btn{display:none;} .no-print{display:none;}}'
      + '</style></head><body>'
      + '<button class="print-btn" onclick="window.print()">🖨️ Print Labels</button>'
      + '<p class="sub no-print">3 copies per page — great for Avery 5164 labels or cardstock. Laminate for outdoor use.</p>'
      + '<div class="page">'
      + rows.map(function() {
          return '<div class="label">'
            + '<div class="qr"><img src="' + qrUrl + '" alt="QR code for ' + esc(plant.commonName || '') + '" /></div>'
            + '<div>'
            + '<p class="name">' + esc(plant.commonName || 'Unnamed Plant') + '</p>'
            + (plant.scientificName ? '<p class="sci">' + esc(plant.scientificName) + '</p>' : '')
            + (plant.nativeToHenderson === 'Yes' ? '<span class="tag t-green">Henderson Native</span>' : (plant.nativeToNc === 'Yes' ? '<span class="tag t-green">NC Native</span>' : ''))
            + (bloomText ? '<span class="tag t-amber">🌸 ' + esc(bloomText) + '</span>' : '')
            + (plant.locationPlanted ? '<span class="tag t-blue">📍 ' + esc(plant.locationPlanted) + '</span>' : '')
            + (plant.lifeCycle ? '<span class="tag t-blue">' + esc(plant.lifeCycle) + '</span>' : '')
            + (sc > 0 ? '<div class="score">★ ' + sc + '/10 Native Score</div>' : '')
            + '<p class="foot">Kyle\'s Garden · Henderson County, NC<br>' + new Date().toLocaleDateString() + '</p>'
            + '</div></div>';
        }).join('')
      + '</div></body></html>');
    win.document.close();
  }

  function generateBatchQRLabels() {
    var kapG = G();
    var plants = kapG && kapG.state ? kapG.state.plants : [];
    if (!plants.length) { gardenToast('No plants to print labels for.', 'error', 1800); return; }
    var win = window.open('', '_blank');
    if (!win) { gardenToast('Allow pop-ups to print labels.', 'error', 2400); return; }
    var mAbbr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    function bloomStr(p) {
      var bm = parseMonths(p.bloomMonths || p.bloomSeasons || '');
      return bm.length ? bm.map(function(m) { return mAbbr[m]; }).join(', ') : '';
    }
    win.document.write('<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>All Plant Labels – Kyle\'s Garden</title>'
      + '<style>*{box-sizing:border-box} body{font-family:system-ui,sans-serif;background:#fff;margin:0;padding:20px;}'
      + '.page{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;max-width:860px;margin:0 auto;}'
      + '.label{border:2px solid #166534;border-radius:10px;padding:10px;display:grid;grid-template-columns:80px 1fr;gap:8px;align-items:start;page-break-inside:avoid;margin-bottom:4px;}'
      + '.name{font-size:13px;font-weight:800;color:#0f172a;margin:0 0 2px;} .sci{font-size:9px;font-style:italic;color:#4b5563;margin:0 0 4px;}'
      + '.tag{display:inline-block;font-size:8px;font-weight:700;border-radius:3px;padding:1px 5px;margin:1px 2px 1px 0;}'
      + '.t-green{background:#dcfce7;color:#166534;} .t-amber{background:#fde68a;color:#92400e;} .t-blue{background:#dbeafe;color:#1d4ed8;}'
      + '.qr img{width:80px;height:80px;border-radius:4px;display:block;} .foot{font-size:7px;color:#9ca3af;margin-top:3px;}'
      + '.pb{background:#166534;color:#fff;border:none;padding:8px 18px;border-radius:8px;cursor:pointer;font-size:13px;margin-bottom:14px;}'
      + '@media print{.pb,.no-print{display:none;}}</style></head><body>'
      + '<button class="pb" onclick="window.print()">🖨️ Print All ' + plants.length + ' Labels</button>'
      + '<p class="no-print" style="font-size:11px;color:#6b7280;margin:0 0 14px;">One label per plant · 3 columns · use cardstock or Avery labels</p>'
      + '<div class="page">'
      + plants.sort(function(a,b) { return (a.commonName||'').localeCompare(b.commonName||''); }).map(function(plant) {
          var qrUrl = QR_API + '?size=160x160&margin=6&data=' + encodeURIComponent(window.location.href.replace(/#.*$/, '') + '#garden-plant-' + plant.id);
          var sc = nativeScore(plant);
          var bt = bloomStr(plant);
          return '<div class="label">'
            + '<div class="qr"><img src="' + qrUrl + '" alt="QR" loading="lazy" /></div>'
            + '<div>'
            + '<p class="name">' + esc(plant.commonName || 'Unnamed') + '</p>'
            + (plant.scientificName ? '<p class="sci">' + esc(plant.scientificName) + '</p>' : '')
            + (plant.nativeToNc === 'Yes' ? '<span class="tag t-green">NC Native</span>' : '')
            + (bt ? '<span class="tag t-amber">🌸 ' + esc(bt) + '</span>' : '')
            + (plant.locationPlanted ? '<span class="tag t-blue">📍 ' + esc(plant.locationPlanted) + '</span>' : '')
            + (sc > 0 ? '<div style="font-size:8px;font-weight:700;color:#166534;margin-top:2px;">★' + sc + '/10</div>' : '')
            + '<p class="foot">Kyle\'s Garden · ' + new Date().toLocaleDateString() + '</p>'
            + '</div></div>';
        }).join('')
      + '</div></body></html>');
    win.document.close();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FEATURE K – SPECIES INTERACTION NETWORK  (D3.js v7 force graph)
  // ═══════════════════════════════════════════════════════════════════════════
  function _splitLines(v) {
    return String(v || '').split(/[\n,;]+/).map(function(s) { return s.trim(); }).filter(Boolean);
  }

  function loadD3(callback) {
    if (window.d3) { callback(); return; }
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js';
    s.onload = callback;
    s.onerror = function() {
      gardenToast('Could not load D3.js — check internet connection.', 'error', 3500);
      var sp = document.getElementById('gardenNetworkSpinner');
      if (sp) sp.innerHTML = '<p style="color:#ef4444;padding:20px;text-align:center;">⚠️ D3.js failed to load. Ensure you are online.</p>';
    };
    document.head.appendChild(s);
  }

  function buildInteractionGraph(plants) {
    var nodes = [], links = [], nodeIndex = {};
    function addNode(id, label, type, data) {
      if (nodeIndex[id] !== undefined) return nodeIndex[id];
      var idx = nodes.length;
      nodes.push({ id: id, label: label, type: type, data: data || {},
        color: type === 'plant' ? '#166534' : type === 'butterfly' ? '#8b5cf6' : type === 'bee' ? '#f59e0b' : type === 'bird' ? '#3b82f6' : '#6b7280',
        size:  type === 'plant' ? 11 : 6 });
      nodeIndex[id] = idx;
      return idx;
    }
    plants.forEach(function(p) {
      if (!p.commonName) return;
      var pid = 'plant_' + p.id;
      addNode(pid, p.commonName, 'plant', p);
      var speciesSets = [
        { kind: 'butterfly', vals: _splitLines(p.butterflySpeciesSeen || '').concat(_splitLines(p.butterflyHostSpecies || '')) },
        { kind: 'bee',       vals: _splitLines(p.beeSpeciesSeen || '').concat(_splitLines(p.specialistBeeSpecies || '')) },
        { kind: 'bird',      vals: _splitLines(p.birdSpeciesSeen || '') }
      ];
      speciesSets.forEach(function(ss) {
        ss.vals.forEach(function(sp) {
          if (!sp) return;
          var sid = ss.kind + '_' + sp;
          addNode(sid, sp, ss.kind, {});
          links.push({ source: pid, target: sid, kind: ss.kind });
        });
      });
    });
    return { nodes: nodes, links: links };
  }

  function renderInteractionNetwork() {
    var container = document.getElementById('gardenNetworkContent');
    if (!container) return;
    container.innerHTML = '<div id="gardenNetworkSpinner" style="text-align:center;padding:40px;color:#6b7280;font-size:13px;">🔄 Loading D3.js and building map…</div>';

    var kapG   = G();
    var plants = kapG && kapG.state ? kapG.state.plants : [];
    if (!plants.length) {
      container.innerHTML = '<p style="text-align:center;padding:30px;color:#6b7280;">No plants yet. Add some plants first!</p>';
      return;
    }
    var graph = buildInteractionGraph(plants);
    if (!graph.links.length) {
      container.innerHTML = '<div style="text-align:center;padding:24px 20px;"><p style="font-size:14px;font-weight:600;color:#374151;">No species interactions to map yet.</p>'
        + '<p style="font-size:12px;color:#6b7280;max-width:400px;margin:8px auto;">Fill in "Butterfly species seen", "Bee species seen", "Bird species seen", "Butterfly host species", or "Specialist bee species" on your plants to generate the network.</p></div>';
      return;
    }

    loadD3(function() {
      container.innerHTML = '';
      var W = Math.max(container.offsetWidth || 0, 500);
      var H = Math.min(560, Math.max(380, graph.nodes.length * 16));

      // Legend bar
      var legend = document.createElement('div');
      legend.style.cssText = 'display:flex;gap:14px;flex-wrap:wrap;padding:7px 10px;font-size:11px;background:#f8fafc;border-radius:8px;margin-bottom:6px;';
      legend.innerHTML = [
        { c:'#166534', l:'Plant (click to open)', r:7 },
        { c:'#8b5cf6', l:'Butterfly', r:5 },
        { c:'#f59e0b', l:'Bee species', r:5 },
        { c:'#3b82f6', l:'Bird', r:5 }
      ].map(function(item) {
        return '<span style="display:flex;align-items:center;gap:5px;">'
          + '<svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="' + item.r + '" fill="' + item.c + '"/></svg>'
          + esc(item.l) + '</span>';
      }).join('');
      container.appendChild(legend);

      var plantN   = graph.nodes.filter(function(n){ return n.type === 'plant'; }).length;
      var speciesN = graph.nodes.length - plantN;
      var statsEl  = document.createElement('p');
      statsEl.style.cssText = 'font-size:11px;color:#6b7280;margin:0 0 5px;';
      statsEl.textContent = plantN + ' plants · ' + speciesN + ' species nodes · ' + graph.links.length + ' interactions. Drag nodes • scroll to zoom • click plant to view.';
      container.appendChild(statsEl);

      var svg = window.d3.select(container)
        .append('svg')
        .attr('width', '100%')
        .attr('height', H)
        .attr('viewBox', '0 0 ' + W + ' ' + H)
        .style('background', '#fafafa')
        .style('border-radius', '10px')
        .style('border', '1px solid #e5e7eb');

      var g = svg.append('g');
      svg.call(window.d3.zoom().scaleExtent([0.25, 4]).on('zoom', function(ev) { g.attr('transform', ev.transform); }));

      var sim = window.d3.forceSimulation(graph.nodes)
        .force('link',   window.d3.forceLink(graph.links).id(function(d){ return d.id; }).distance(90))
        .force('charge', window.d3.forceManyBody().strength(-180))
        .force('center', window.d3.forceCenter(W / 2, H / 2))
        .force('collide', window.d3.forceCollide().radius(function(d){ return d.size + 7; }));

      var linkEl = g.append('g').selectAll('line').data(graph.links).join('line')
        .attr('stroke', function(d) { return d.kind === 'butterfly' ? '#c4b5fd' : d.kind === 'bee' ? '#fcd34d' : d.kind === 'bird' ? '#93c5fd' : '#d1d5db'; })
        .attr('stroke-width', 1.5).attr('stroke-opacity', 0.6);

      var nodeEl = g.append('g').selectAll('g').data(graph.nodes).join('g')
        .call(window.d3.drag()
          .on('start', function(ev, d) { if (!ev.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
          .on('drag',  function(ev, d) { d.fx = ev.x; d.fy = ev.y; })
          .on('end',   function(ev, d) { if (!ev.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

      nodeEl.append('circle')
        .attr('r',      function(d) { return d.size; })
        .attr('fill',   function(d) { return d.color; })
        .attr('stroke', '#fff').attr('stroke-width', 1.5)
        .style('cursor', function(d) { return d.type === 'plant' ? 'pointer' : 'default'; })
        .on('click', function(ev, d) {
          if (d.type !== 'plant') return;
          var kapG2 = G();
          if (!kapG2) return;
          var target = kapG2.state.plants.find(function(p) { return p.id === d.data.id; });
          if (target && typeof kapG2.openDetails === 'function') {
            document.getElementById('gardenNetworkModal').classList.remove('open');
            var oldTT = document.getElementById('gardenNetworkTooltip');
            if (oldTT && oldTT.parentNode) oldTT.parentNode.removeChild(oldTT);
            kapG2.openDetails(target);
          }
        })
        .on('mouseover', function(ev, d) {
          tooltip.style('opacity', '0.97')
            .html('<strong style="font-size:12px;">' + esc(d.label) + '</strong><br><span style="font-size:10px;opacity:.8;">' + esc(d.type) + '</span>')
            .style('left', (ev.clientX + 12) + 'px').style('top', (ev.clientY - 24) + 'px');
        })
        .on('mouseout', function() { tooltip.style('opacity', '0'); });

      nodeEl.filter(function(d) { return d.type === 'plant'; }).append('text')
        .text(function(d) { return d.label.length > 15 ? d.label.slice(0, 13) + '…' : d.label; })
        .attr('x', function(d) { return d.size + 3; }).attr('y', 4)
        .attr('font-size', '9px').attr('fill', '#374151').attr('pointer-events', 'none');

      var tooltip = window.d3.select('body').append('div')
        .attr('id', 'gardenNetworkTooltip')
        .style('position', 'fixed').style('background', 'rgba(15,23,42,.88)').style('color', '#fff')
        .style('font-size', '12px').style('padding', '6px 10px').style('border-radius', '6px')
        .style('pointer-events', 'none').style('opacity', '0').style('z-index', '9999')
        .style('max-width', '220px').style('line-height', '1.4').style('transition', 'opacity .15s');

      sim.on('tick', function() {
        linkEl
          .attr('x1', function(d) { return d.source.x; }).attr('y1', function(d) { return d.source.y; })
          .attr('x2', function(d) { return d.target.x; }).attr('y2', function(d) { return d.target.y; });
        nodeEl.attr('transform', function(d) {
          return 'translate(' + [Math.max(d.size, Math.min(W - d.size, d.x || 0)), Math.max(d.size, Math.min(H - d.size, d.y || 0))] + ')';
        });
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FEATURE L – MOBILE FIELD-USE MODE
  // ═══════════════════════════════════════════════════════════════════════════
  function openFieldMode(plantId) {
    var modal = document.getElementById('gardenFieldModeModal');
    if (!modal) return;
    fieldModeState.search = '';
    fieldModeState.voiceDraft = null;
    fieldModeState.voiceTranscript = '';
    if (plantId) fieldModeState.selectedPlantId = plantId;
    if (!fieldModeState.selectedPlantId && enhState.fieldRecentPlants && enhState.fieldRecentPlants.length) {
      fieldModeState.selectedPlantId = enhState.fieldRecentPlants[0];
    }
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    renderFieldMode();
  }

  function closeFieldMode() {
    var modal = document.getElementById('gardenFieldModeModal');
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  function renderFieldModePlantChoices(plants, selectedPlantId, search) {
    search = String(search || '').toLowerCase().trim();
    var filtered = plants.filter(function (plant) {
      if (!search) return true;
      var hay = [plant.commonName, plant.scientificName, plant.locationPlanted].join(' ').toLowerCase();
      return hay.indexOf(search) >= 0;
    }).sort(function (a, b) {
      var aFav = hasEnhListId('fieldFavorites', a.id) ? 1 : 0;
      var bFav = hasEnhListId('fieldFavorites', b.id) ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;
      var aPatrol = hasEnhListId('fieldPatrolPlants', a.id) ? 1 : 0;
      var bPatrol = hasEnhListId('fieldPatrolPlants', b.id) ? 1 : 0;
      if (aPatrol !== bPatrol) return bPatrol - aPatrol;
      var aRecent = (enhState.fieldRecentPlants || []).indexOf(a.id);
      var bRecent = (enhState.fieldRecentPlants || []).indexOf(b.id);
      if (aRecent >= 0 || bRecent >= 0) {
        if (aRecent < 0) return 1;
        if (bRecent < 0) return -1;
        return aRecent - bRecent;
      }
      return String(a.commonName || '').localeCompare(String(b.commonName || ''));
    });
    if (!filtered.length) {
      return '<p style="margin:0;padding:12px;border:1px dashed #cbd5e1;border-radius:12px;color:#64748b;font-size:13px;text-align:center;">No plants match that search. Try a simpler name or clear the search.</p>';
    }
    return '<div class="garden-field-plant-grid">'
      + filtered.map(function (plant) {
          var isActive = plant.id === selectedPlantId;
          var subtitle = [plant.locationPlanted || '', plant.scientificName || ''].filter(Boolean).join(' · ');
          return '<button type="button" class="garden-field-plant-btn' + (isActive ? ' is-active' : '') + '" data-field-plant-id="' + esc(plant.id) + '">'
            + '<span class="garden-field-plant-name">' + esc(plant.commonName || 'Unnamed plant') + '</span>'
          + '<span class="garden-field-plant-badges">'
          + (hasEnhListId('fieldFavorites', plant.id) ? '<span>⭐ Favorite</span>' : '')
          + (hasEnhListId('fieldPatrolPlants', plant.id) ? '<span>🛤 Patrol</span>' : '')
          + '</span>'
            + (subtitle ? '<span class="garden-field-plant-meta">' + esc(subtitle) + '</span>' : '<span class="garden-field-plant-meta">Tap to quick-log here</span>')
            + '</button>';
        }).join('')
      + '</div>';
  }

  function renderFieldPlantChipCollection(label, ids, emptyHtml, extraClass) {
    var plants = (ids || []).map(function (id) { return getPlantById(id); }).filter(Boolean);
    if (!plants.length) return emptyHtml || '';
    return '<div class="garden-field-recent ' + esc(extraClass || '') + '">'
      + '<p class="garden-field-mini-label">' + esc(label) + '</p>'
      + '<div class="garden-field-chip-row">'
      + plants.map(function (plant) {
          return '<button type="button" class="garden-field-chip" data-field-plant-id="' + esc(plant.id) + '">' + esc(plant.commonName || 'Unnamed plant') + '</button>';
        }).join('')
      + '</div></div>';
  }

  function renderFieldModeRecentPlants() {
    return renderFieldPlantChipCollection('Recent plants', enhState.fieldRecentPlants || [], '');
  }

  function renderFieldNearMeSection(plants) {
    var coordsCount = Object.keys(enhState.locationCoords || {}).length;
    var nearby = getNearbyPlants(fieldModeState.currentPosition, plants).slice(0, 6);
    var status = fieldModeState.geoStatus ? '<p class="garden-field-geo-status">' + esc(fieldModeState.geoStatus) + '</p>' : '';
    if (!fieldModeState.currentPosition) {
      return '<div class="garden-field-recent">'
        + '<p class="garden-field-mini-label">Near me</p>'
        + '<div class="garden-field-empty-inline">Use your location to surface nearby beds.' + (coordsCount ? ' ' + coordsCount + ' bed spot' + (coordsCount !== 1 ? 's are' : ' is') + ' already saved.' : ' Save a rough bed spot first.') + '</div>'
        + status
        + '</div>';
    }
    if (!nearby.length) {
      return '<div class="garden-field-recent">'
        + '<p class="garden-field-mini-label">Near me</p>'
        + '<div class="garden-field-empty-inline">No rough bed locations are saved yet. Tap “Save this bed here” on a selected plant to build nearby suggestions.</div>'
        + status
        + '</div>';
    }
    return '<div class="garden-field-recent">'
      + '<p class="garden-field-mini-label">Near me</p>'
      + '<div class="garden-field-chip-row">'
      + nearby.map(function (item) {
          return '<button type="button" class="garden-field-chip" data-field-plant-id="' + esc(item.plant.id) + '">' + esc(item.plant.commonName || 'Unnamed') + ' · ' + item.distanceMiles.toFixed(item.distanceMiles < 1 ? 1 : 0) + ' mi</button>';
        }).join('')
      + '</div>'
      + status
      + '</div>';
  }

  function renderFieldModeActionPanel(plant) {
    if (!plant) {
      return '<div class="garden-field-empty">'
        + '<strong>Pick a plant to start.</strong>'
        + '<p>Then tap Bloom, Watering, or Sighting. Today is prefilled so most updates are just one tap.</p>'
        + '</div>';
    }
    var obsCount = (enhState.obsLog[plant.id] || []).length;
    var taskCount = (enhState.taskLog[plant.id] || []).length;
    var mediaCount = (enhState.fieldMediaLog[plant.id] || []).length;
    var defaultType = fieldModeState.sightingType || 'bee';
    var isFavorite = hasEnhListId('fieldFavorites', plant.id);
    var isPatrol = hasEnhListId('fieldPatrolPlants', plant.id);
    var locKey = getPlantLocationKey(plant);
    var typeChips = OBS_TYPES.filter(function (t) { return t !== 'bloom'; }).map(function (t) {
      var active = t === defaultType;
      return '<button type="button" class="garden-field-type-chip' + (active ? ' is-active' : '') + '" data-field-sighting-type="' + esc(t) + '">'
        + (OBS_ICONS[t] || '👁️') + ' ' + esc(t.charAt(0).toUpperCase() + t.slice(1)) + '</button>';
    }).join('');
    var voiceDraftHtml = '';
    if (fieldModeState.voiceDraft) {
      voiceDraftHtml = '<div class="garden-field-voice-draft">'
        + '<p class="garden-field-mini-label">Voice draft</p>'
        + '<p class="garden-field-voice-transcript">“' + esc(fieldModeState.voiceDraft.transcript || '') + '”</p>'
        + '<p class="garden-field-voice-summary">'
        + (fieldModeState.voiceDraft.action === 'sighting'
          ? (OBS_ICONS[fieldModeState.voiceDraft.type] || '👁️') + ' Drafted ' + esc(fieldModeState.voiceDraft.type) + ' sighting ×' + esc(fieldModeState.voiceDraft.count || '1')
          : (fieldModeState.voiceDraft.action === 'bloom' ? '🌸 Drafted bloom log' : '💧 Drafted watering log'))
        + '</p>'
        + (fieldModeState.voiceDraft.action !== 'sighting'
          ? '<button type="button" class="garden-btn primary" data-field-action="voice-apply">Apply parsed ' + esc(fieldModeState.voiceDraft.action) + '</button>'
          : '')
        + '</div>';
    }
    return '<div class="garden-field-selected-card">'
      + '<div class="garden-field-selected-top">'
      + '<div>'
      + '<p class="garden-field-selected-name">' + esc(plant.commonName || 'Unnamed plant') + '</p>'
      + '<p class="garden-field-selected-meta">'
      + esc(plant.locationPlanted || 'Location not set')
      + (plant.scientificName ? ' · ' + esc(plant.scientificName) : '')
      + '</p>'
      + '</div>'
      + '<div class="garden-field-counts">'
      + '<span>👁️ ' + obsCount + '</span><span>🪴 ' + taskCount + '</span><span>📸 ' + mediaCount + '</span>'
      + '</div></div>'
      + '<div class="garden-field-pin-row">'
      + '<button type="button" class="garden-field-pin-btn' + (isFavorite ? ' is-active' : '') + '" data-field-action="toggle-favorite">' + (isFavorite ? '⭐ Favorite' : '☆ Favorite') + '</button>'
      + '<button type="button" class="garden-field-pin-btn' + (isPatrol ? ' is-active' : '') + '" data-field-action="toggle-patrol">' + (isPatrol ? '🛤 On patrol route' : '🛤 Add to patrol') + '</button>'
      + '</div>'
      + '<div class="garden-field-action-grid">'
      + '<button type="button" class="garden-field-action garden-field-action-bloom" data-field-action="bloom">'
      + '<span class="garden-field-action-emoji">🌸</span><span class="garden-field-action-label">Log bloom</span><span class="garden-field-action-note">One tap · updates phenology</span></button>'
      + '<button type="button" class="garden-field-action garden-field-action-water" data-field-action="watered">'
      + '<span class="garden-field-action-emoji">💧</span><span class="garden-field-action-label">Log watering</span><span class="garden-field-action-note">One tap · clears dry alert</span></button>'
      + '<button type="button" class="garden-field-action garden-field-action-sighting" data-field-action="toggle-sighting">'
      + '<span class="garden-field-action-emoji">👁️</span><span class="garden-field-action-label">Log sighting</span><span class="garden-field-action-note">Bee, butterfly, bird, and more</span></button>'
      + '<button type="button" class="garden-field-action garden-field-action-camera" data-field-action="snap-photo">'
      + '<span class="garden-field-action-emoji">📸</span><span class="garden-field-action-label">Snap and log</span><span class="garden-field-action-note">Photo + timestamp + plant</span></button>'
      + '<button type="button" class="garden-field-action garden-field-action-voice" data-field-action="voice-start">'
      + '<span class="garden-field-action-emoji">🎙️</span><span class="garden-field-action-label">Speak note</span><span class="garden-field-action-note">Draft from speech-to-text</span></button>'
      + '<button type="button" class="garden-field-action garden-field-action-location" data-field-action="use-location">'
      + '<span class="garden-field-action-emoji">📍</span><span class="garden-field-action-label">Plants near me</span><span class="garden-field-action-note">Use GPS + saved bed spots</span></button>'
      + '</div>'
      + '<input id="gardenFieldCameraInput" type="file" accept="image/*" capture="environment" style="display:none;">'
      + voiceDraftHtml
      + '<div class="garden-field-sighting-panel' + (fieldModeState.showSightingExtras ? ' is-open' : '') + '">'
      + '<p class="garden-field-mini-label">What did you see?</p>'
      + '<div class="garden-field-chip-row">' + typeChips + '</div>'
      + '<div class="garden-field-form-grid">'
      + '<label><span>Species (optional)</span><input id="gardenFieldSpecies" type="text" placeholder="e.g. Eastern tiger swallowtail" value="' + esc(fieldModeState.sightingSpecies || '') + '"></label>'
      + '<label><span>How many?</span><input id="gardenFieldCount" type="number" min="1" value="' + esc(fieldModeState.sightingCount || '1') + '"></label>'
      + '<label class="span-2"><span>Notes (optional)</span><input id="gardenFieldNotes" type="text" placeholder="quick note for later" value="' + esc(fieldModeState.sightingNotes || '') + '"></label>'
      + '</div>'
      + '<button type="button" class="garden-btn primary garden-field-sighting-submit" data-field-action="sighting-submit">'
      + (OBS_ICONS[defaultType] || '👁️') + ' Log ' + esc(defaultType) + ' sighting</button>'
      + '</div>'
      + '<div class="garden-field-geo-controls">'
      + '<button type="button" class="garden-btn" data-field-action="save-bed-location"' + (locKey ? '' : ' disabled') + '>📍 Save this bed here</button>'
      + (locKey && enhState.locationCoords[locKey] ? '<span class="garden-field-inline-note">Saved rough spot for ' + esc(locKey) + '.</span>' : '<span class="garden-field-inline-note">Save a rough spot for this location to power “Near me”.</span>')
      + '</div>'
      + renderFieldMediaStrip(plant.id)
      + '<div class="garden-field-footer-actions">'
      + '<button type="button" class="garden-btn" data-field-action="details">Open full details</button>'
      + '</div>'
      + '</div>';
  }

  function renderFieldMode() {
    var modal = document.getElementById('gardenFieldModeModal');
    var content = document.getElementById('gardenFieldModeContent');
    var kapG = G();
    var plants = kapG && kapG.state ? kapG.state.plants.slice() : [];
    if (!modal || !content) return;
    if (!plants.length) {
      content.innerHTML = '<div class="garden-field-empty"><strong>No plants yet.</strong><p>Add at least one plant before using Field Mode.</p></div>';
      return;
    }
    if (!fieldModeState.selectedPlantId || !getPlantById(fieldModeState.selectedPlantId)) {
      fieldModeState.selectedPlantId = (enhState.fieldRecentPlants && enhState.fieldRecentPlants[0]) || plants[0].id;
    }
    var selectedPlant = getPlantById(fieldModeState.selectedPlantId);
    content.innerHTML = '<div class="garden-field-shell' + (enhState.fieldTheme === 'glare' ? ' is-glare' : '') + '">'
      + '<div class="garden-field-banner">'
      + '<div><p class="garden-field-title">I\'m in the garden now</p><p class="garden-field-subtitle">Big buttons, bright contrast, and today prefilled for quick field notes.</p></div>'
      + '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;">'
      + '<button type="button" class="garden-btn" id="gardenFieldThemeToggleBtn">' + (enhState.fieldTheme === 'glare' ? '🌤 Standard view' : '☀️ Sun-glare view') + '</button>'
      + '<button type="button" class="garden-btn" id="gardenFieldCloseTop">Done</button>'
      + '</div>'
      + '</div>'
      + renderFieldQueueBanner()
      + (fieldModeState.lastActionText ? '<div class="garden-field-last-action">' + esc(fieldModeState.lastActionText) + '</div>' : '')
      + '<div class="garden-field-toolbar">'
      + '<label><span>Date</span><input id="gardenFieldDate" type="date" value="' + esc(fieldModeState.date || todayIso()) + '"></label>'
      + '<label class="grow"><span>Find a plant</span><input id="gardenFieldSearch" type="text" placeholder="Search by plant or location" value="' + esc(fieldModeState.search || '') + '"></label>'
      + '</div>'
      + renderFieldPlantChipCollection('Favorite plants', enhState.fieldFavorites || [], '')
      + renderFieldPlantChipCollection('Patrol route', enhState.fieldPatrolPlants || [], '')
      + renderFieldModeRecentPlants()
      + renderFieldNearMeSection(plants)
      + '<div class="garden-field-layout">'
      + '<div class="garden-field-list-wrap"><p class="garden-field-mini-label">Choose plant</p>' + renderFieldModePlantChoices(plants, fieldModeState.selectedPlantId, fieldModeState.search) + '</div>'
      + '<div class="garden-field-panel-wrap">' + renderFieldModeActionPanel(selectedPlant) + '</div>'
      + '</div>'
      + '</div>';
    bindFieldModeUI();
  }

  function bindFieldModePlantButtons(scope) {
    if (!scope) return;
    scope.querySelectorAll('[data-field-plant-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        fieldModeState.selectedPlantId = btn.getAttribute('data-field-plant-id');
        fieldModeState.showSightingExtras = false;
          fieldModeState.voiceDraft = null;
        renderFieldMode();
      });
    });
  }

  function bindFieldModeUI() {
    var modal = document.getElementById('gardenFieldModeModal');
    var content = document.getElementById('gardenFieldModeContent');
    if (!modal || !content) return;

    var closeTop = content.querySelector('#gardenFieldCloseTop');
    if (closeTop) closeTop.addEventListener('click', closeFieldMode);

    var themeToggleBtn = content.querySelector('#gardenFieldThemeToggleBtn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', function () {
        enhState.fieldTheme = enhState.fieldTheme === 'glare' ? 'default' : 'glare';
        saveEnh();
        renderFieldMode();
      });
    }

    var clearQueueBtn = content.querySelector('#gardenFieldQueueClearBtn');
    if (clearQueueBtn) {
      clearQueueBtn.addEventListener('click', function () {
        clearOfflineFieldQueue();
        fieldModeState.lastActionText = '🧹 Cleared the offline queue banner.';
        renderFieldMode();
      });
    }

    var search = content.querySelector('#gardenFieldSearch');
    if (search) {
      search.addEventListener('input', function () {
        fieldModeState.search = search.value;
        var listWrap = content.querySelector('.garden-field-list-wrap');
        var kapG = G();
        var plants = kapG && kapG.state ? kapG.state.plants.slice() : [];
        if (listWrap) {
          listWrap.innerHTML = '<p class="garden-field-mini-label">Choose plant</p>' + renderFieldModePlantChoices(plants, fieldModeState.selectedPlantId, fieldModeState.search);
          bindFieldModePlantButtons(listWrap);
        }
      });
    }

    var dateInput = content.querySelector('#gardenFieldDate');
    if (dateInput) {
      dateInput.addEventListener('change', function () {
        fieldModeState.date = dateInput.value || todayIso();
      });
    }

    var fieldSpecies = content.querySelector('#gardenFieldSpecies');
    if (fieldSpecies) fieldSpecies.addEventListener('input', function () { fieldModeState.sightingSpecies = fieldSpecies.value; });
    var fieldCount = content.querySelector('#gardenFieldCount');
    if (fieldCount) fieldCount.addEventListener('input', function () { fieldModeState.sightingCount = fieldCount.value || '1'; });
    var fieldNotes = content.querySelector('#gardenFieldNotes');
    if (fieldNotes) fieldNotes.addEventListener('input', function () { fieldModeState.sightingNotes = fieldNotes.value; });

    var cameraInput = content.querySelector('#gardenFieldCameraInput');
    if (cameraInput) {
      cameraInput.addEventListener('change', function () {
        var plant = getPlantById(fieldModeState.selectedPlantId);
        var date = fieldModeState.date || todayIso();
        var file = cameraInput.files && cameraInput.files[0];
        if (!plant || !file) return;
        compressImageFile(file, function (dataUrl) {
          if (!dataUrl) {
            gardenToast('Could not read that photo.', 'error', 2200);
            return;
          }
          addFieldMediaEntry(plant.id, {
            date: date,
            url: dataUrl,
            caption: 'Field snapshot · ' + date,
            kind: 'camera'
          }, {
            undoLabel: 'Field snapshot added for ' + (plant.commonName || 'plant'),
            queueLabel: '📸 Field snapshot saved locally for ' + (plant.commonName || 'plant'),
            onAfterSave: function () {
              fieldModeState.lastActionText = '📸 Snapshot saved for ' + (plant.commonName || 'plant') + ' on ' + date + '.';
              renderFieldMode();
            },
            onAfterUndo: function () {
              fieldModeState.lastActionText = '↩ Snapshot removed for ' + (plant.commonName || 'plant') + '.';
              renderFieldMode();
            }
          });
        });
        cameraInput.value = '';
      });
    }

    bindFieldModePlantButtons(content);

    content.querySelectorAll('[data-field-photo-view]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var url = btn.getAttribute('data-field-photo-view');
        if (url) window.open(url, '_blank');
      });
    });

    content.querySelectorAll('[data-field-sighting-type]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        fieldModeState.sightingType = btn.getAttribute('data-field-sighting-type') || 'bee';
        fieldModeState.showSightingExtras = true;
        renderFieldMode();
      });
    });

    content.querySelectorAll('[data-field-action]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var plantId = fieldModeState.selectedPlantId;
        var plant = getPlantById(plantId);
        var action = btn.getAttribute('data-field-action');
        var dateEl = content.querySelector('#gardenFieldDate');
        var date = dateEl && dateEl.value ? dateEl.value : todayIso();
        fieldModeState.date = date;
        if (!plant) {
          gardenToast('Choose a plant first.', 'error', 1800);
          return;
        }
        if (action === 'toggle-sighting') {
          fieldModeState.showSightingExtras = !fieldModeState.showSightingExtras;
          renderFieldMode();
          return;
        }
        if (action === 'details') {
          closeFieldMode();
          if (G() && typeof G().openDetails === 'function') G().openDetails(plant.id);
          return;
        }
        if (action === 'toggle-favorite') {
          var favEnabled = toggleIdInEnhList('fieldFavorites', plant.id, 20);
          fieldModeState.lastActionText = favEnabled ? '⭐ Added ' + (plant.commonName || 'plant') + ' to favorites.' : '☆ Removed ' + (plant.commonName || 'plant') + ' from favorites.';
          renderFieldMode();
          return;
        }
        if (action === 'toggle-patrol') {
          var patrolEnabled = toggleIdInEnhList('fieldPatrolPlants', plant.id, 20);
          fieldModeState.lastActionText = patrolEnabled ? '🛤 Added ' + (plant.commonName || 'plant') + ' to your patrol route.' : '🛤 Removed ' + (plant.commonName || 'plant') + ' from your patrol route.';
          renderFieldMode();
          return;
        }
        if (action === 'voice-start') {
          startFieldVoiceCapture();
          return;
        }
        if (action === 'voice-apply') {
          if (!fieldModeState.voiceDraft) return;
          if (fieldModeState.voiceDraft.action === 'bloom') {
            addObservationEntry(plantId, { date: date, type: 'bloom', count: '1', notes: fieldModeState.voiceDraft.transcript }, {
              undoLabel: 'Voice bloom logged for ' + (plant.commonName || 'plant'),
              queueLabel: '🌸 Voice bloom saved locally for ' + (plant.commonName || 'plant'),
              refreshCards: true,
              onAfterSave: function () {
                fieldModeState.voiceDraft = null;
                fieldModeState.lastActionText = '🎙 Applied bloom log for ' + (plant.commonName || 'plant') + '.';
                renderFieldMode();
              }
            });
          } else if (fieldModeState.voiceDraft.action === 'watered') {
            addTaskEntry(plantId, { date: date, type: 'watered', notes: fieldModeState.voiceDraft.transcript }, {
              undoLabel: 'Voice watering logged for ' + (plant.commonName || 'plant'),
              queueLabel: '💧 Voice watering saved locally for ' + (plant.commonName || 'plant'),
              refreshCards: true,
              onAfterSave: function () {
                fieldModeState.voiceDraft = null;
                fieldModeState.lastActionText = '🎙 Applied watering log for ' + (plant.commonName || 'plant') + '.';
                renderFieldMode();
              }
            });
          }
          return;
        }
        if (action === 'snap-photo') {
          if (cameraInput) cameraInput.click();
          return;
        }
        if (action === 'use-location') {
          requestFieldPosition();
          return;
        }
        if (action === 'save-bed-location') {
          saveCurrentSpotForPlantLocation(plant);
          return;
        }
        if (action === 'bloom') {
          addObservationEntry(plantId, { date: date, type: 'bloom', count: '1' }, {
            undoLabel: 'Bloom logged for ' + (plant.commonName || 'plant'),
            queueLabel: '🌸 Bloom saved locally for ' + (plant.commonName || 'plant'),
            refreshCards: true,
            showFirstBloomToast: true,
            onAfterSave: function () {
              fieldModeState.lastActionText = '🌸 Bloom logged for ' + (plant.commonName || 'plant') + ' on ' + date + '.';
              fieldModeState.showSightingExtras = false;
              renderFieldMode();
            },
            onAfterUndo: function () {
              fieldModeState.lastActionText = '↩ Bloom entry removed for ' + (plant.commonName || 'plant') + '.';
              renderFieldMode();
            }
          });
          return;
        }
        if (action === 'watered') {
          addTaskEntry(plantId, { date: date, type: 'watered' }, {
            undoLabel: 'Watering logged for ' + (plant.commonName || 'plant'),
            queueLabel: '💧 Watering saved locally for ' + (plant.commonName || 'plant'),
            refreshCards: true,
            onAfterSave: function () {
              fieldModeState.lastActionText = '💧 Watering logged for ' + (plant.commonName || 'plant') + ' on ' + date + '.';
              fieldModeState.showSightingExtras = false;
              renderFieldMode();
            },
            onAfterUndo: function () {
              fieldModeState.lastActionText = '↩ Watering entry removed for ' + (plant.commonName || 'plant') + '.';
              renderFieldMode();
            }
          });
          return;
        }
        if (action === 'sighting-submit') {
          var speciesEl = content.querySelector('#gardenFieldSpecies');
          var countEl = content.querySelector('#gardenFieldCount');
          var notesEl = content.querySelector('#gardenFieldNotes');
          var sightingType = fieldModeState.sightingType || 'bee';
          addObservationEntry(plantId, {
            date: date,
            type: sightingType,
            species: speciesEl ? speciesEl.value : '',
            count: countEl ? countEl.value : '1',
            notes: notesEl ? notesEl.value : ''
          }, {
            undoLabel: OBS_ICONS[sightingType] + ' Sighting logged for ' + (plant.commonName || 'plant'),
            queueLabel: (OBS_ICONS[sightingType] || '👁️') + ' ' + sightingType + ' saved locally for ' + (plant.commonName || 'plant'),
            refreshCards: true,
            onAfterSave: function () {
              fieldModeState.lastActionText = (OBS_ICONS[sightingType] || '👁️') + ' ' + sightingType.charAt(0).toUpperCase() + sightingType.slice(1) + ' logged for ' + (plant.commonName || 'plant') + '.';
              fieldModeState.showSightingExtras = true;
              fieldModeState.sightingSpecies = '';
              fieldModeState.sightingCount = '1';
              fieldModeState.sightingNotes = '';
              fieldModeState.voiceDraft = null;
              renderFieldMode();
            },
            onAfterUndo: function () {
              fieldModeState.lastActionText = '↩ Sighting removed for ' + (plant.commonName || 'plant') + '.';
              renderFieldMode();
            }
          });
        }
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  HOOKS
  // ═══════════════════════════════════════════════════════════════════════════
  function afterRenderCards(filtered) {
    var host = document.getElementById('gardenCards');
    if (!host) return;
    var articles = host.querySelectorAll('.garden-card');
    filtered.forEach(function (plant, i) {
      var card = articles[i];
      if (!card) return;

      // Native score badge
      var h3 = card.querySelector('h3');
      if (h3 && !card.querySelector('.garden-native-score')) {
        var sc = nativeScore(plant);
        if (sc > 0) h3.insertAdjacentHTML('beforeend', scoreBadgeHtml(sc));
      }

      // Field-mode launcher
      var cardActions = card.querySelector('.garden-card-actions');
      if (cardActions && !card.querySelector('.garden-field-launch-btn')) {
        var fieldBtn = document.createElement('button');
        fieldBtn.type = 'button';
        fieldBtn.className = 'garden-btn garden-field-launch-btn';
        fieldBtn.style.cssText = 'background:#0f172a;color:#fff;border-color:#0f172a;';
        fieldBtn.textContent = '📱 Field';
        fieldBtn.title = 'Open quick mobile field logger for this plant';
        cardActions.insertBefore(fieldBtn, cardActions.firstChild);
        fieldBtn.addEventListener('click', function () { openFieldMode(plant.id); });
      }

      // Frost-sensitive badge (Feature I)
      if (gardenFrostAlert() && plantIsFrostSensitive(plant) && !card.querySelector('.garden-frost-badge')) {
        var fBadge = document.createElement('span');
        fBadge.className = 'garden-pill garden-frost-badge';
        fBadge.style.cssText = 'background:#dbeafe;color:#1d4ed8;cursor:default;';
        fBadge.title = 'Frost predicted — this plant may need protection based on its cold resistance.';
        fBadge.textContent = '🧊 Protect tonight';
        var fActions = card.querySelector('.garden-card-actions');
        if (fActions) fActions.insertBefore(fBadge, fActions.firstChild);
      }

      // Bloom timeline bar
      if (!card.querySelector('.garden-bloom-bar')) {
        var bloomBarHtml = renderBloomBar(plant);
        if (bloomBarHtml) {
          var tagsOrActions = card.querySelector('.garden-card-tags') || card.querySelector('.garden-card-actions');
          if (tagsOrActions) {
            var bloomBarEl = document.createElement('div');
            bloomBarEl.style.cssText = 'padding:0 12px 4px;';
            bloomBarEl.innerHTML = bloomBarHtml;
            tagsOrActions.parentNode.insertBefore(bloomBarEl, tagsOrActions);
          }
        }
      }

      // Task log count badge
      var taskCount = (enhState.taskLog[plant.id] || []).length;
      if (taskCount && !card.querySelector('.garden-task-count')) {
        var taskBadge = document.createElement('span');
        taskBadge.className = 'garden-pill garden-task-count';
        taskBadge.style.cssText = 'background:#eff6ff;color:#1d4ed8;cursor:default;';
        taskBadge.title = taskCount + ' care action' + (taskCount !== 1 ? 's' : '') + ' logged';
        taskBadge.textContent = '🪴 ' + taskCount;
        var taskCardActions = card.querySelector('.garden-card-actions');
        if (taskCardActions) taskCardActions.insertBefore(taskBadge, taskCardActions.firstChild);
      }

      // Custom tags
      var tagsDiv = card.querySelector('.garden-card-tags');
      if (tagsDiv) {
        (enhState.customTags[plant.id] || []).forEach(function (t) {
          if (!tagsDiv.querySelector('[data-ctag="' + t + '"]')) {
            var pill = document.createElement('span');
            pill.className = 'garden-pill';
            pill.setAttribute('data-ctag', t);
            pill.style.cssText = 'background:#dbeafe;color:#1d4ed8;';
            pill.textContent = '#' + t;
            tagsDiv.appendChild(pill);
          }
        });
      }

      // Observation count
      var obsCount = (enhState.obsLog[plant.id] || []).length;
      if (obsCount && !card.querySelector('.garden-obs-count')) {
        var badge = document.createElement('span');
        badge.className = 'garden-pill garden-obs-count';
        badge.style.cssText = 'background:#f0fdf4;color:#166534;cursor:default;';
        badge.title = obsCount + ' sighting' + (obsCount !== 1 ? 's' : '') + ' logged';
        badge.textContent = '👁️ ' + obsCount;
        var obsCardActions = card.querySelector('.garden-card-actions');
        if (obsCardActions) obsCardActions.insertBefore(badge, obsCardActions.firstChild);
      }

      // Bulk checkbox
      if (enhState.bulkMode) {
        if (!card.querySelector('.garden-bulk-check')) {
          var cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.className = 'garden-bulk-check';
          cb.checked = enhState.bulkSelected.indexOf(plant.id) >= 0;
          cb.style.cssText = 'position:absolute;top:10px;right:10px;width:18px;height:18px;cursor:pointer;accent-color:#166534;';
          cb.setAttribute('data-pid', plant.id);
          card.style.position = 'relative';
          card.insertBefore(cb, card.firstChild);
          cb.addEventListener('change', function () { toggleBulkSelect(plant.id); });
        }
      }

      // Water-need badge (Feature G)
      if (plantNeedsWater(plant.id) && !card.querySelector('.garden-water-badge')) {
        var wBadge = document.createElement('span');
        wBadge.className = 'garden-pill garden-water-badge';
        wBadge.style.cssText = 'background:#fee2e2;color:#b91c1c;cursor:default;';
        wBadge.title = 'Dry week — may need watering. Log a "watered" task to clear this alert.';
        wBadge.textContent = '💧 Needs water?';
        var wActions = card.querySelector('.garden-card-actions');
        if (wActions) wActions.insertBefore(wBadge, wActions.firstChild);
      }
    });
  }

  function afterOpenDetails(plant) {
    var detailContent = document.getElementById('gardenDetailContent');
    if (!detailContent) return;

    // Photo gallery
    var gallerySection = document.createElement('div');
    gallerySection.id = 'gardenPhotoGallery';
    gallerySection.innerHTML = '<h4 style="margin:14px 0 6px;font-size:14px;color:#166534;">📷 Photo Gallery</h4>'
      + '<div class="garden-gallery-inner">' + renderPhotoGallery(plant) + '</div>';
    detailContent.appendChild(gallerySection);
    var inner = gallerySection.querySelector('.garden-gallery-inner');
    initPhotoDragDrop(inner && inner.querySelector('#gardenPhotoStrip'), plant.id);
    bindPhotoActions(inner || gallerySection, plant.id);
    bindBrokenPhotoFallbacks(inner || gallerySection);
    bindPhotoGalleryExtras(inner || gallerySection, plant.id, gallerySection);

    var fieldMediaMarkup = renderFieldMediaDetailSection(plant.id);
    if (fieldMediaMarkup) {
      var fieldMediaSection = document.createElement('div');
      fieldMediaSection.innerHTML = fieldMediaMarkup;
      detailContent.appendChild(fieldMediaSection);
      fieldMediaSection.querySelectorAll('[data-field-photo-view]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var url = btn.getAttribute('data-field-photo-view');
          if (url) window.open(url, '_blank');
        });
      });
    }

    // Observation log
    var obsSection   = document.createElement('div');
    obsSection.id    = 'gardenObsSection';
    detailContent.appendChild(obsSection);
    renderAndBindObsSection(obsSection, plant.id);

    // Task / care log
    var taskSection = document.createElement('div');
    taskSection.id  = 'gardenTaskSection';
    detailContent.appendChild(taskSection);
    renderAndBindTaskSection(taskSection, plant.id);

    // Companion / neighbors widget
    var kapG = G();
    if (kapG && kapG.state && kapG.state.plants && kapG.state.plants.length > 1) {
      var compSection = document.createElement('div');
      compSection.id = 'gardenCompanionsSection';
      compSection.innerHTML = '<h4 style="margin:16px 0 6px;font-size:14px;color:#7c3aed;">🌐 Companion Plants & Neighbors</h4>'
        + '<p style="font-size:12px;color:#6b7280;margin:0 0 8px;">Other plants in your list that share bloom season, garden location, or wildlife support.</p>'
        + renderCompanionsWidget(plant, kapG.state.plants);
      detailContent.appendChild(compSection);

      // Make companion cards clickable — open their details
      compSection.querySelectorAll('.garden-companion-card[data-pid]').forEach(function (card) {
        card.addEventListener('click', function () {
          var pid = card.getAttribute('data-pid');
          var target = kapG.state.plants.find(function (p) { return p.id === pid; });
          if (target && typeof kapG.openDetails === 'function') kapG.openDetails(target);
        });
        card.style.transition = 'box-shadow .15s,transform .15s';
        card.addEventListener('mouseenter', function () { card.style.boxShadow = '0 4px 14px rgba(0,0,0,.10)'; card.style.transform = 'translateY(-1px)'; });
        card.addEventListener('mouseleave', function () { card.style.boxShadow = ''; card.style.transform = ''; });
      });
    }

    // Phenology section — Feature D
    var phenoOuter = document.createElement('div');
    phenoOuter.id = 'gardenPhenologyOuter';
    phenoOuter.innerHTML = renderPhenologyHtml(plant.id);
    detailContent.appendChild(phenoOuter);
    bindPhenologySection(phenoOuter, plant.id);

    // Weather watering status — Feature G
    if (plantNeedsWater(plant.id)) {
      var weatherAlert = document.createElement('div');
      weatherAlert.innerHTML = '<div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;padding:10px 12px;font-size:13px;color:#991b1b;margin-top:10px;">'
        + '💧 <strong>Watering may be needed.</strong> Less than ' + (WATER_THRESHOLD_MM / 25.4).toFixed(2) + '" of rain in the last 7 days and no watering logged. '
        + 'Log a <em>watered</em> task above to clear this alert.</div>';
      detailContent.appendChild(weatherAlert);
    }

    // Frost alert for this plant — Feature I
    var frostDays = gardenFrostAlert();
    if (frostDays && plantIsFrostSensitive(plant)) {
      var frostAlert = document.createElement('div');
      frostAlert.innerHTML = '<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:10px 12px;font-size:13px;color:#1d4ed8;margin-top:8px;">'
        + '🧊 <strong>Frost predicted!</strong> Based on this plant\'s cold resistance, it may need protection. '
        + 'Forecasted frost nights: <strong>' + frostDays.map(function(f) { return f.date + ' (' + f.minF + '°F)'; }).join(', ') + '</strong>.'
        + ' Cover or move tender plants before nightfall.</div>';
      detailContent.appendChild(frostAlert);
    }

    // QR Label button — Feature J
    var qrSection = document.createElement('div');
    qrSection.style.cssText = 'margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;';
    qrSection.innerHTML = '<button type="button" class="garden-btn" id="gardenQRPrintBtn" style="font-size:12px;padding:6px 14px;" title="Opens a print-friendly page with 3 QR code labels for this plant">🏷️ Print QR Label</button>'
      + '<span style="font-size:11px;color:#6b7280;">Scan QR in the field to open this plant\'s detail page.</span>';
    detailContent.appendChild(qrSection);
    var qrBtn = qrSection.querySelector('#gardenQRPrintBtn');
    if (qrBtn) qrBtn.addEventListener('click', function() { generatePlantQRLabel(plant); });

    var fieldSection = document.createElement('div');
    fieldSection.style.cssText = 'margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;';
    fieldSection.innerHTML = '<button type="button" class="garden-btn primary" id="gardenFieldDetailBtn" style="font-size:12px;padding:8px 14px;">📱 Quick Field Log</button>'
      + '<span style="font-size:11px;color:#6b7280;">Use the bright, large-button view for fast updates while you\'re standing in the garden.</span>';
    detailContent.appendChild(fieldSection);
    var fieldDetailBtn = fieldSection.querySelector('#gardenFieldDetailBtn');
    if (fieldDetailBtn) fieldDetailBtn.addEventListener('click', function () { openFieldMode(plant.id); });
  }

  function beforeSavePlant(plant, onContinue) {
    var dupes = findDuplicates(plant, G().state.plants);
    if (dupes.length) { showDupeWarning(plant, dupes, onContinue); return false; }
    return true;
  }

  function afterExcelSync(plants) {
    storeExcelSnapshot(plants);
  }

  function beforeSyncToExcel() {
    var conflicts = buildLocalVsSnapshotDiffs();
    if (!conflicts.length) return true;
    return new Promise(function (resolve) {
      showConflictPanel(conflicts, function () { resolve(true); });
    });
  }

  function registerHooks() {
    if (!window.kapGardenHooks) return false;
    window.kapGardenHooks.afterRenderCards  = afterRenderCards;
    window.kapGardenHooks.afterOpenDetails  = afterOpenDetails;
    window.kapGardenHooks.beforeSavePlant   = beforeSavePlant;
    window.kapGardenHooks.afterExcelSync    = afterExcelSync;
    window.kapGardenHooks.beforeSyncToExcel = beforeSyncToExcel;
    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  BIND NEW UI ELEMENTS
  // ═══════════════════════════════════════════════════════════════════════════
  function bindEnhUI() {
    // Calendar panel toggle
    var calToggle = document.getElementById('gardenCalToggle');
    var calPanel  = document.getElementById('gardenCalendarPanel');
    if (calToggle) {
      calToggle.addEventListener('click', function () {
        var open = !calPanel || calPanel.style.display !== 'none';
        if (calPanel) calPanel.style.display = open ? 'none' : '';
        calToggle.textContent = open ? '📅 Show Planting Calendar' : '📅 Hide Calendar';
        if (!open) renderCalendar();
      });
    }

    // Bulk mode
    var bulkModeBtn = document.getElementById('gardenBulkModeBtn');
    if (bulkModeBtn) bulkModeBtn.addEventListener('click', toggleBulkMode);

    var bulkEditBtn = document.getElementById('gardenBulkEditBtn');
    if (bulkEditBtn) bulkEditBtn.addEventListener('click', function () {
      if (!enhState.bulkSelected.length) return;
      var m = document.getElementById('gardenBulkModal');
      if (m) m.classList.add('open');
    });

    var bulkTagChips = document.querySelectorAll('.garden-bulk-tag-chip');
    var bulkTagInput = document.getElementById('gardenBulkTag');
    bulkTagChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        if (!bulkTagInput) return;
        var tag = String(chip.getAttribute('data-tag') || '').trim();
        if (!tag) return;
        var current = splitTags(bulkTagInput.value);
        if (current.indexOf(tag) < 0) current.push(tag);
        bulkTagInput.value = current.join(', ');
        bulkTagInput.focus();
      });
    });

    var bulkDeselectBtn = document.getElementById('gardenBulkDeselectBtn');
    if (bulkDeselectBtn) bulkDeselectBtn.addEventListener('click', function () {
      enhState.bulkSelected = [];
      renderBulkToolbar();
      G().renderCards();
    });

    var bulkApplyBtn = document.getElementById('gardenBulkApplyBtn');
    if (bulkApplyBtn) bulkApplyBtn.addEventListener('click', applyBulkEdit);

    var bulkCancelBtn = document.getElementById('gardenBulkCancelBtn');
    if (bulkCancelBtn) bulkCancelBtn.addEventListener('click', function () {
      var m = document.getElementById('gardenBulkModal');
      if (m) m.classList.remove('open');
    });

    // Mobile field mode — Feature L
    var fieldModeBtn = document.getElementById('gardenFieldModeBtn');
    if (fieldModeBtn) fieldModeBtn.addEventListener('click', function () { openFieldMode(); });
    var fieldModeCloseBtn = document.getElementById('gardenFieldModeCloseBtn');
    if (fieldModeCloseBtn) fieldModeCloseBtn.addEventListener('click', closeFieldMode);
    var fieldModeModal = document.getElementById('gardenFieldModeModal');
    if (fieldModeModal) fieldModeModal.addEventListener('click', function (e) {
      if (e.target === fieldModeModal) closeFieldMode();
    });

    // Exports
    var expPoll = document.getElementById('gardenExportPollinators');
    if (expPoll) expPoll.addEventListener('click', exportPollinators);
    var expBird = document.getElementById('gardenExportBirds');
    if (expBird) expBird.addEventListener('click', exportBirdSupport);
    var expBuy  = document.getElementById('gardenExportToBuy');
    if (expBuy)  expBuy.addEventListener('click', exportToBuy);

    // Garden Map — Feature E
    var mapBtn = document.getElementById('gardenMapBtn');
    if (mapBtn) {
      mapBtn.addEventListener('click', function() {
        var modal = document.getElementById('gardenMapModal');
        if (modal) { modal.classList.add('open'); renderGardenMap(); }
      });
    }
    var mapClose = document.getElementById('gardenMapCloseBtn');
    if (mapClose) mapClose.addEventListener('click', function() {
      var modal = document.getElementById('gardenMapModal');
      if (modal) modal.classList.remove('open');
    });
    var mapModal = document.getElementById('gardenMapModal');
    if (mapModal) mapModal.addEventListener('click', function(e) {
      if (e.target === mapModal) mapModal.classList.remove('open');
    });

    // Succession Planner — Feature F
    var succBtn = document.getElementById('gardenSuccessionBtn');
    if (succBtn) {
      succBtn.addEventListener('click', function() {
        var modal = document.getElementById('gardenSuccessionModal');
        if (modal) { modal.classList.add('open'); renderSuccessionPlanner(); }
      });
    }
    var succClose = document.getElementById('gardenSuccessionCloseBtn');
    if (succClose) succClose.addEventListener('click', function() {
      var modal = document.getElementById('gardenSuccessionModal');
      if (modal) modal.classList.remove('open');
    });
    var succModal = document.getElementById('gardenSuccessionModal');
    if (succModal) succModal.addEventListener('click', function(e) {
      if (e.target === succModal) succModal.classList.remove('open');
    });

    // Species Interaction Network — Feature K
    var netBtn = document.getElementById('gardenNetworkBtn');
    if (netBtn) {
      netBtn.addEventListener('click', function() {
        var modal = document.getElementById('gardenNetworkModal');
        if (modal) { modal.classList.add('open'); renderInteractionNetwork(); }
      });
    }
    var netClose = document.getElementById('gardenNetworkCloseBtn');
    if (netClose) netClose.addEventListener('click', function() {
      document.getElementById('gardenNetworkModal').classList.remove('open');
      var tt = document.getElementById('gardenNetworkTooltip');
      if (tt && tt.parentNode) tt.parentNode.removeChild(tt);
    });
    var netModal = document.getElementById('gardenNetworkModal');
    if (netModal) netModal.addEventListener('click', function(e) {
      if (e.target !== netModal) return;
      netModal.classList.remove('open');
      var tt = document.getElementById('gardenNetworkTooltip');
      if (tt && tt.parentNode) tt.parentNode.removeChild(tt);
    });

    // Print All QR Labels — Feature J
    var labelsBtn = document.getElementById('gardenPrintLabelsBtn');
    if (labelsBtn) labelsBtn.addEventListener('click', generateBatchQRLabels);

    // Auto-fill lookup (Feature H) — inject into editor when it opens
    var editorBackdrop = document.getElementById('gardenEditorBackdrop');
    if (editorBackdrop) {
      var _editorObserver = new MutationObserver(function() {
        if (editorBackdrop.classList.contains('open')) injectEditorLookupUI();
      });
      _editorObserver.observe(editorBackdrop, { attributes: true, attributeFilter: ['class'] });
    }

    // Lightbox
    var lbClose = document.getElementById('gardenLightboxClose');
    var lbPrev  = document.getElementById('gardenLightboxPrev');
    var lbNext  = document.getElementById('gardenLightboxNext');
    var lbModal = document.getElementById('gardenLightboxModal');
    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    if (lbPrev)  lbPrev .addEventListener('click', function () { lightboxNav(-1); });
    if (lbNext)  lbNext .addEventListener('click', function () { lightboxNav(1);  });
    if (lbModal) lbModal.addEventListener('click', function (e) { if (e.target === lbModal) closeLightbox(); });
    document.addEventListener('keydown', function (e) {
      if (!lbModal || !lbModal.classList.contains('open')) return;
      if (e.key === 'ArrowLeft')  lightboxNav(-1);
      if (e.key === 'ArrowRight') lightboxNav(1);
      if (e.key === 'Escape')     closeLightbox();
    });

    // Close modal backdrops when clicking outside
    ['gardenBulkModal', 'gardenDupeModal', 'gardenConflictModal'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('click', function (e) { if (e.target === el) el.classList.remove('open'); });
    });
  }

  function injectUndoPanel() {
    var root = document.getElementById('gardenPlannerRoot');
    if (!root || document.getElementById('gardenUndoHistoryPanel')) return;

    var panel = document.createElement('div');
    panel.id = 'gardenUndoHistoryPanel';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'Recent garden actions');
    panel.style.cssText = [
      'position:fixed',
      'bottom:70px',
      'right:16px',
      'width:320px',
      'max-height:340px',
      'overflow-y:auto',
      'background:#fff',
      'border:1px solid #e2e8f0',
      'border-radius:12px',
      'box-shadow:0 8px 32px rgba(0,0,0,.13)',
      'z-index:1500',
      'display:none'
    ].join(';');

    var header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:700;color:#0f172a;position:sticky;top:0;background:#fff;z-index:1;';
    header.innerHTML = '<span>↩ Recent Actions</span>'
      + '<button type="button" id="gardenUndoPanelClose" style="background:none;border:none;cursor:pointer;color:#64748b;font-size:16px;line-height:1;padding:0 2px;" title="Close">&times;</button>';
    panel.appendChild(header);

    var list = document.createElement('div');
    list.id = 'gardenUndoHistoryList';
    list.innerHTML = '<div style="padding:14px 16px;color:#6b7280;font-size:13px;text-align:center;">No recent actions yet.</div>';
    panel.appendChild(list);

    var toggle = document.createElement('button');
    toggle.id = 'gardenUndoToggleBtn';
    toggle.type = 'button';
    toggle.title = 'Recent actions';
    toggle.setAttribute('aria-label', 'Show undo history');
    toggle.style.cssText = [
      'position:fixed',
      'bottom:16px',
      'right:16px',
      'background:#166534',
      'color:#fff',
      'border:none',
      'border-radius:999px',
      'padding:8px 16px',
      'font-size:13px',
      'font-weight:700',
      'cursor:pointer',
      'box-shadow:0 2px 10px rgba(0,0,0,.18)',
      'z-index:1500',
      'display:flex',
      'align-items:center',
      'gap:6px'
    ].join(';');
    toggle.innerHTML = '↩ History <span id="gardenUndoBadge" style="background:#dcfce7;color:#166534;border-radius:999px;padding:1px 7px;font-size:11px;display:none;">0</span>';

    document.body.appendChild(panel);
    document.body.appendChild(toggle);

    toggle.addEventListener('click', function () {
      var isOpen = panel.style.display !== 'none';
      panel.style.display = isOpen ? 'none' : 'block';
      if (!isOpen) renderUndoPanelContent(list);
    });

    panel.querySelector('#gardenUndoPanelClose').addEventListener('click', function () {
      panel.style.display = 'none';
    });

    // Override refreshUndoPanel to also update badge
    refreshUndoPanel = function () {
      var badge = document.getElementById('gardenUndoBadge');
      if (badge) {
        badge.textContent = undoHistory.length;
        badge.style.display = undoHistory.length ? 'inline' : 'none';
      }
      if (panel.style.display !== 'none') renderUndoPanelContent(list);
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  INIT
  // ═══════════════════════════════════════════════════════════════════════════
  var _fieldConnectivityBound = false;

  function init() {
    loadEnh();
    if (!registerHooks()) return;
    bindEnhUI();
    renderCalendar();
    renderBulkToolbar();
    injectUndoPanel();
    if (!_fieldConnectivityBound) {
      _fieldConnectivityBound = true;
      window.addEventListener('online', function () {
        if (isFieldModeOpen()) renderFieldMode();
        renderWeatherBanner();
      });
      window.addEventListener('offline', function () {
        if (isFieldModeOpen()) renderFieldMode();
        renderWeatherBanner();
      });
    }
    // Feature G: fetch weather in background so banner is ready when cards render
    fetchWeatherData();
  }

  // Poll until garden tab is ready
  var _poll = setInterval(function () {
    var root = document.getElementById('gardenPlannerRoot');
    if (root && root.dataset.gardenInit === 'true' && window.kapGardenHooks) {
      clearInterval(_poll);
      init();
    }
  }, 150);

  window.initGardenEnhancements = init;

  window.kapGardenEnh = {
    nativeScore:              nativeScore,
    exportPollinators:        exportPollinators,
    exportBirdSupport:        exportBirdSupport,
    exportToBuy:              exportToBuy,
    renderBloomBar:           renderBloomBar,
    findCompanions:           findCompanions,
    renderCompanionsWidget:   renderCompanionsWidget,
    maybeCaptureFirstBloom:   maybeCaptureFirstBloom,
    renderPhenologyHtml:      renderPhenologyHtml,
    renderGardenMap:          renderGardenMap,
    renderSuccessionPlanner:  renderSuccessionPlanner,
    computeBloomCoverage:     computeBloomCoverage,
    fetchWeatherData:         fetchWeatherData,
    plantNeedsWater:          plantNeedsWater,
    plantIsFrostSensitive:    plantIsFrostSensitive,
    gardenFrostAlert:         gardenFrostAlert,
    inatLookup:               inatLookup,
    usdaLookup:               usdaLookup,
    generatePlantQRLabel:     generatePlantQRLabel,
    generateBatchQRLabels:    generateBatchQRLabels,
    renderInteractionNetwork: renderInteractionNetwork,
    buildInteractionGraph:    buildInteractionGraph,
    openFieldMode:            openFieldMode,
    closeFieldMode:           closeFieldMode,
    renderFieldMode:          renderFieldMode,
    startFieldVoiceCapture:   startFieldVoiceCapture,
    requestFieldPosition:     requestFieldPosition,
    saveCurrentSpotForPlantLocation: saveCurrentSpotForPlantLocation,
    parseSpokenFieldTranscript: parseSpokenFieldTranscript
  };
})();



