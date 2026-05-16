(function initDrinksCocktailsTabSystem(global) {
  'use strict';

  var ROOT_ID = 'drinksCocktailsRoot';
  var STATUS_ID = 'drinksCocktailsStatus';
  var STORAGE_KEY = 'kap_drinks_cocktails_v1';
  var WORKBOOK_CANDIDATES = ['Recipes.xlsx', 'recipes.xlsx', 'Recipes.xlsm', 'recipes.xlsm', 'recipes', 'Excel_DB.xlsx', 'excel_db.xlsx'];
  var WORKBOOK_SEARCH_TERMS = ['Recipes', 'recipes', 'Excel_DB', 'excel'];
  var WORKBOOK_PATH_PREFIXES = ['', 'Copilot_Apps/Kyles_Adventure_Finder/', 'Copilot_Apps/Kyles_Adventure_Finder/Adventure Challenge/'];
  var WORKBOOK_PATH_STORAGE_KEY = 'kap_drinks_workbook_path_v1';
  var AUTO_SYNC_COOLDOWN_MS = 45000;

  var TASTE_TAGS = [
    'Sweet', 'fruity', 'tart', 'sour', 'bananas', 'balanced', 'smooth', 'refreshing',
    'easy to drink', 'bitter', 'tangy', 'hops', 'artificial sweetener', 'after taste'
  ];

  var EFFECT_TAGS = [
    'fast-acting', 'energetic', 'sleepy', 'extra-relaxing', 'mind-fog', 'clear-headed', 'coordination-affecting'
  ];

  var DEFAULT_LOCATIONS = ['Apotheca', 'Total Wine', 'Ingles', 'Publix', 'Food Lion'];

  var TRACKERS = {
    'na-brew': {
      key: 'na-brew',
      title: 'NA Brew Tracker',
      table: 'NA_Bev',
      hasType: false,
      hasStrength: false,
      hasEffects: false,
      columns: ['Brand', 'Flavor', 'My Rating', 'Taste Notes', 'Purchase Locations', 'City', 'State']
    },
    'thc-bev': {
      key: 'thc-bev',
      title: 'THC Bev Tracker',
      table: 'THC_Bev',
      hasType: true,
      hasStrength: true,
      hasEffects: true,
      typeOptions: ['Seltzer (THC infused)', 'Soda (THC infused)', 'Juice (THC infused)'],
      columns: ['Type', 'Brand', 'Flavor', 'Strength mg', 'My Rating', 'Taste Notes', 'potency and effects', 'Purchase Locations', 'City', 'State']
    },
    'thc-edible': {
      key: 'thc-edible',
      title: 'THC Edible Tracker',
      table: 'THC_Edibles',
      hasType: true,
      hasStrength: true,
      hasEffects: true,
      typeOptions: ['Chocolate (THC infused)', 'Gummies (THC infused)'],
      columns: ['Type', 'Brand', 'Flavor', 'Strength mg', 'My Rating', 'Taste Notes', 'potency and effects', 'Purchase Locations', 'City', 'State']
    }
  };

  var state = {
    activeSubtab: 'na-brew',
    lastTrackerSubtab: 'na-brew',
    data: {
      'na-brew': [],
      'thc-bev': [],
      'thc-edible': [],
      'thc-cocktail-recipes': []
    },
    filters: {
      'na-brew': { type: 'all', brand: '', minRating: '', location: '', tags: '', sortBy: 'updated-desc' },
      'thc-bev': { type: 'all', brand: '', minRating: '', location: '', tags: '', sortBy: 'updated-desc' },
      'thc-edible': { type: 'all', brand: '', minRating: '', location: '', tags: '', sortBy: 'updated-desc' }
    },
    excel: {
      workbookPath: readStringStorage(WORKBOOK_PATH_STORAGE_KEY, '')
    },
    autoSync: {
      lastRunAtByTracker: {}
    },
    // Keyed by trackerKey → array of missing column name strings (empty = schema OK).
    schemaBanners: {}
  };

  function getRoot() {
    return document.getElementById(ROOT_ID);
  }

  function readStringStorage(key, fallback) {
    try {
      var value = localStorage.getItem(String(key || ''));
      if (value == null) return String(fallback || '');
      return String(value || '');
    } catch (_error) {
      return String(fallback || '');
    }
  }

  function writeStringStorage(key, value) {
    try {
      localStorage.setItem(String(key || ''), String(value || ''));
    } catch (_error) {}
  }

  function getDrinksSubTabDockElements() {
    return {
      row: document.getElementById('appSubTabsRow'),
      cutout: document.getElementById('appSubTabsCutout'),
      slot: document.getElementById('appSubTabsSlot')
    };
  }

  function getDrinksSubTabsElement(root) {
    var docked = document.querySelector('#appSubTabsSlot .drinks-cocktails-subtabs');
    if (docked) return docked;
    return root ? root.querySelector('.drinks-cocktails-subtabs') : null;
  }

  function getActiveAppTabId() {
    var activePane = document.querySelector('.app-tab-pane.active[data-tab]');
    if (activePane) return String(activePane.getAttribute('data-tab') || '');
    var activeButton = document.querySelector('.app-tab-btn.active[data-tab]');
    return activeButton ? String(activeButton.getAttribute('data-tab') || '') : '';
  }

  function isFoodDrinkAppTab(tabId) {
    return tabId === 'drinks-cocktails' || tabId === 'recipes';
  }

  function setActiveSubtab(subtabKey) {
    var key = String(subtabKey || '').trim() || 'na-brew';
    if (key !== 'recipes') {
      state.lastTrackerSubtab = key;
    }
    state.activeSubtab = key;
  }

  function updateDrinksSubTabRowVisibility(row, slot) {
    if (!row || !slot) return;
    var hasVisibleChild = Array.from(slot.children || []).some(function (child) {
      return !child.hidden && child.getAttribute('aria-hidden') !== 'true';
    });
    row.hidden = !hasVisibleChild;
    row.setAttribute('aria-hidden', hasVisibleChild ? 'false' : 'true');
  }

  function positionDrinksSubTabDock() {
    var dock = getDrinksSubTabDockElements();
    if (!dock.row || !dock.cutout || dock.row.hidden) return;
    var activePrimaryTab = document.querySelector('.app-tab-btn.active[data-tab="drinks-cocktails"]');
    if (!activePrimaryTab) return;
    var rowRect = dock.row.getBoundingClientRect();
    var activeRect = activePrimaryTab.getBoundingClientRect();
    var cutoutWidth = Math.min(dock.cutout.offsetWidth || 0, Math.max(rowRect.width - 8, 0));
    if (!rowRect.width || !cutoutWidth) {
      dock.cutout.style.left = '50%';
      dock.cutout.style.setProperty('--app-subtabs-pointer-left', '50%');
      return;
    }
    var preferredCenter = (activeRect.left - rowRect.left) + (activeRect.width / 2);
    var padding = 8;
    var minCenter = cutoutWidth / 2 + padding;
    var maxCenter = Math.max(rowRect.width - (cutoutWidth / 2) - padding, minCenter);
    var clampedCenter = Math.min(Math.max(preferredCenter, minCenter), maxCenter);
    dock.cutout.style.left = clampedCenter + 'px';
    var pointerMin = 14;
    var pointerMax = Math.max(cutoutWidth - 14, pointerMin);
    var pointerLeft = Math.min(Math.max((preferredCenter - clampedCenter) + (cutoutWidth / 2), pointerMin), pointerMax);
    dock.cutout.style.setProperty('--app-subtabs-pointer-left', pointerLeft + 'px');
  }

  function syncDrinksSubTabDock(root) {
    var dock = getDrinksSubTabDockElements();
    if (!dock.row || !dock.slot || !root) return;
    var subTabs = getDrinksSubTabsElement(root);
    if (!subTabs) {
      updateDrinksSubTabRowVisibility(dock.row, dock.slot);
      return;
    }
    var activeTabId = getActiveAppTabId();
    var shouldShow = isFoodDrinkAppTab(activeTabId);

    if (shouldShow && !dock.slot.contains(subTabs)) {
      dock.slot.appendChild(subTabs);
    }

    if (shouldShow) {
      Array.from(dock.slot.children || []).forEach(function (child) {
        var isCurrent = child === subTabs;
        child.hidden = !isCurrent;
        child.setAttribute('aria-hidden', isCurrent ? 'false' : 'true');
      });
    } else {
      subTabs.hidden = true;
      subTabs.setAttribute('aria-hidden', 'true');
    }

    updateDrinksSubTabRowVisibility(dock.row, dock.slot);
    if (!shouldShow) return;
    requestAnimationFrame(function () { positionDrinksSubTabDock(); });
  }

  function uid(prefix) {
    return String(prefix || 'id') + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  }

  function safeText(value) {
    var div = document.createElement('div');
    div.textContent = String(value == null ? '' : value);
    return div.innerHTML;
  }

  function normalizeColumnName(value) {
    return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }

  function splitTags(value) {
    return String(value || '').split(/[;,\n]/).map(function (tag) { return tag.trim(); }).filter(Boolean);
  }

  function getTrackerFilterState(trackerKey) {
    var defaults = { type: 'all', brand: '', minRating: '', location: '', tags: '', sortBy: 'updated-desc' };
    if (!state.filters[trackerKey] || typeof state.filters[trackerKey] !== 'object') {
      state.filters[trackerKey] = Object.assign({}, defaults);
      return state.filters[trackerKey];
    }
    state.filters[trackerKey] = Object.assign({}, defaults, state.filters[trackerKey]);
    return state.filters[trackerKey];
  }

  function parseTaggedField(value) {
    var text = String(value || '');
    var match = text.match(/\[tags:\s*([^]]*)\]\s*$/i);
    if (!match) {
      return { text: text.trim(), tags: [] };
    }
    var tags = splitTags(match[1]);
    var noteText = text.slice(0, match.index).trim();
    return { text: noteText, tags: tags };
  }

  function formatTaggedField(text, tags) {
    var noteText = String(text || '').trim();
    var normalizedTags = (Array.isArray(tags) ? tags : []).map(function (tag) { return String(tag || '').trim(); }).filter(Boolean);
    if (!normalizedTags.length) return noteText;
    return noteText ? (noteText + ' [tags: ' + normalizedTags.join('; ') + ']') : ('[tags: ' + normalizedTags.join('; ') + ']');
  }

  function getAccessToken() {
    return String(global.accessToken || '').trim();
  }

  function setStatus(message, isError) {
    var root = getRoot();
    if (!root) return;
    var node = root.querySelector('#' + STATUS_ID);
    if (!node) return;
    node.textContent = String(message || '');
    node.style.color = isError ? '#b91c1c' : '#0f766e';
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
    } catch (_error) {}
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return;
      Object.keys(state.data).forEach(function (key) {
        if (Array.isArray(parsed[key])) {
          state.data[key] = parsed[key];
        }
      });
    } catch (_error) {}
  }

  function encodeGraphPath(path) {
    return String(path || '').split('/').map(function (part) { return encodeURIComponent(part); }).join('/');
  }

  async function graphFetchJson(url, options) {
    var token = getAccessToken();
    if (!token) throw new Error('Please sign in to Microsoft first.');
    options = options || {};
    var headers = Object.assign({ Authorization: 'Bearer ' + token }, options.headers || {});
    if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
    var response = await fetch(url, Object.assign({}, options, { headers: headers }));
    if (!response.ok) {
      var bodyText = await response.text();
      throw new Error('Graph request failed (' + response.status + '): ' + bodyText.slice(0, 180));
    }
    if (response.status === 204) return {};
    return response.json();
  }

  function clearWorkbookPath() {
    state.excel.workbookPath = '';
    writeStringStorage(WORKBOOK_PATH_STORAGE_KEY, '');
  }

  function rememberWorkbookPath(path) {
    var normalized = String(path || '').trim();
    if (!normalized) return;
    state.excel.workbookPath = normalized;
    writeStringStorage(WORKBOOK_PATH_STORAGE_KEY, normalized);
  }

  function buildWorkbookPathFromDriveItem(item) {
    var safeItem = item && typeof item === 'object' ? item : {};
    var itemName = String(safeItem.name || '').trim();
    if (!itemName) return '';
    var parentPath = String((safeItem.parentReference && safeItem.parentReference.path) || '').trim();
    if (parentPath.indexOf('/drive/root:') === 0) {
      parentPath = parentPath.slice('/drive/root:'.length);
    }
    parentPath = parentPath.replace(/^\/+|\/+$/g, '');
    return parentPath ? (parentPath + '/' + itemName) : itemName;
  }

  function expandWorkbookCandidatePath(path) {
    var clean = String(path || '').trim().replace(/^\/+/, '');
    if (!clean) return [];
    if (clean.indexOf('/') >= 0) return [clean];
    return WORKBOOK_PATH_PREFIXES.map(function (prefix) {
      return String(prefix || '') + clean;
    }).filter(Boolean);
  }

  async function probeWorkbookForTable(filePath, tableName) {
    var normalizedPath = String(filePath || '').trim();
    var normalizedTable = String(tableName || '').trim();
    if (!normalizedPath || !normalizedTable) return false;
    var encodedPath = encodeGraphPath(normalizedPath);
    var tableRef = encodeURIComponent(normalizedTable);
    try {
      await graphFetchJson('https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/tables/' + tableRef + '/columns?$select=name,index');
      return true;
    } catch (error) {
      if (isGraphItemNotFoundError(error)) return false;
      throw error;
    }
  }

  async function discoverWorkbookPathCandidates() {
    var discovered = [];
    var seen = {};
    for (var i = 0; i < WORKBOOK_SEARCH_TERMS.length; i += 1) {
      var term = String(WORKBOOK_SEARCH_TERMS[i] || '').trim();
      if (!term) continue;
      try {
        var searchUrl = 'https://graph.microsoft.com/v1.0/me/drive/root/search(q=%27' + encodeURIComponent(term) + '%27)?$select=name,parentReference';
        var payload = await graphFetchJson(searchUrl);
        (Array.isArray(payload.value) ? payload.value : []).forEach(function (item) {
          var name = String(item && item.name ? item.name : '').trim();
          if (!name) return;
          var lower = name.toLowerCase();
          if (!/\.(xlsx|xlsm)$/i.test(name) && lower.indexOf('recipes') < 0 && lower.indexOf('excel') < 0) return;
          var path = buildWorkbookPathFromDriveItem(item);
          var key = String(path || '').toLowerCase();
          if (!path || seen[key]) return;
          seen[key] = true;
          discovered.push(path);
        });
      } catch (_searchError) {
        // Ignore discovery issues and continue probing.
      }
    }
    return discovered;
  }

  function isGraphItemNotFoundError(error) {
    var message = String(error && error.message ? error.message : '').trim();
    return /graph request failed \(404\)/i.test(message)
      || /itemnotfound/i.test(message)
      || /resource could not be found/i.test(message);
  }

  function getDrinksWorkbookErrorMessage(error, fallback) {
    var message = String(error && error.message ? error.message : '').trim();
    if (isGraphItemNotFoundError(error) || /^Could not locate a workbook containing table/i.test(message)) {
      return 'Could not find a OneDrive workbook containing Drinks tables (NA_Bev / THC_Bev / THC_Edibles). Verify workbook availability, then retry sync.';
    }
    return message || String(fallback || 'Excel sync failed.').trim();
  }

  async function withWorkbookPathRetry(operation, trackerKey) {
    var tableName = TRACKERS[trackerKey] ? TRACKERS[trackerKey].table : TRACKERS['na-brew'].table;
    var firstPath = await resolveWorkbookPath(tableName);
    try {
      return await operation(firstPath);
    } catch (firstError) {
      if (!isGraphItemNotFoundError(firstError)) throw firstError;
      clearWorkbookPath();
      var secondPath = await resolveWorkbookPath(tableName);
      return operation(secondPath);
    }
  }

  async function resolveWorkbookPath(preferredTableName) {
    var probeTable = String(preferredTableName || TRACKERS['na-brew'].table || '').trim();
    var checked = [];
    var seen = {};

    function appendCandidate(list, path) {
      expandWorkbookCandidatePath(path).forEach(function (expandedPath) {
        var normalized = String(expandedPath || '').trim();
        if (!normalized) return;
        var key = normalized.toLowerCase();
        if (seen[key]) return;
        seen[key] = true;
        list.push(normalized);
      });
    }

    var candidates = [];
    appendCandidate(candidates, state.excel.workbookPath);
    appendCandidate(candidates, readStringStorage(WORKBOOK_PATH_STORAGE_KEY, ''));
    appendCandidate(candidates, global.__resolvedExcelFilePath || global.filePath || '');
    WORKBOOK_CANDIDATES.forEach(function (candidate) {
      appendCandidate(candidates, candidate);
    });

    for (var i = 0; i < candidates.length; i += 1) {
      var candidate = candidates[i];
      checked.push(candidate);
      if (await probeWorkbookForTable(candidate, probeTable)) {
        rememberWorkbookPath(candidate);
        return candidate;
      }
    }

    var discovered = await discoverWorkbookPathCandidates();
    for (var j = 0; j < discovered.length; j += 1) {
      var path = discovered[j];
      if (seen[String(path || '').toLowerCase()]) continue;
      checked.push(path);
      if (await probeWorkbookForTable(path, probeTable)) {
        rememberWorkbookPath(path);
        return path;
      }
    }

    throw new Error('Could not locate a workbook containing table ' + probeTable + '. Checked: ' + checked.join(', '));
  }

  function normalizeTrackerItem(trackerKey, item) {
    var def = TRACKERS[trackerKey] || {};
    var normalized = {
      id: String(item && item.id ? item.id : uid(trackerKey)),
      type: String(item && item.type ? item.type : ''),
      brand: String(item && item.brand ? item.brand : ''),
      flavor: String(item && item.flavor ? item.flavor : ''),
      strengthMg: String(item && item.strengthMg ? item.strengthMg : ''),
      myRating: Number(item && item.myRating ? item.myRating : 0) || 0,
      tasteNotes: String(item && item.tasteNotes ? item.tasteNotes : ''),
      tasteTags: Array.isArray(item && item.tasteTags) ? item.tasteTags.slice() : [],
      effectsNotes: String(item && item.effectsNotes ? item.effectsNotes : ''),
      effectsTags: Array.isArray(item && item.effectsTags) ? item.effectsTags.slice() : [],
      purchaseLocation: String(item && item.purchaseLocation ? item.purchaseLocation : ''),
      city: String(item && item.city ? item.city : ''),
      state: String(item && item.state ? item.state : ''),
      updatedAt: Date.now()
    };
    if (!def.hasType) normalized.type = '';
    if (!def.hasStrength) normalized.strengthMg = '';
    if (!def.hasEffects) {
      normalized.effectsNotes = '';
      normalized.effectsTags = [];
    }
    return normalized;
  }

  function mapExcelRowToItem(trackerKey, row) {
    var def = TRACKERS[trackerKey];
    if (!def) return null;

    var tasteParsed = parseTaggedField(row.taste_notes || '');
    var effectsParsed = parseTaggedField(row.potency_and_effects || '');

    return normalizeTrackerItem(trackerKey, {
      id: uid(trackerKey),
      type: row.type || '',
      brand: row.brand || '',
      flavor: row.flavor || '',
      strengthMg: row.strength_mg || '',
      myRating: Number(row.my_rating || 0) || 0,
      tasteNotes: tasteParsed.text,
      tasteTags: splitTags(row.taste_tags || '').length ? splitTags(row.taste_tags || '') : tasteParsed.tags,
      effectsNotes: effectsParsed.text,
      effectsTags: splitTags(row.potency_effect_tags || row.effects_tags || '').length ? splitTags(row.potency_effect_tags || row.effects_tags || '') : effectsParsed.tags,
      purchaseLocation: row.purchase_locations || '',
      city: row.city || '',
      state: row.state || ''
    });
  }

  function mapItemToExcelObject(trackerKey, item) {
    var def = TRACKERS[trackerKey];
    if (!def) return {};

    var excel = {
      brand: item.brand || '',
      flavor: item.flavor || '',
      my_rating: Number(item.myRating || 0) || '',
      taste_notes: item.tasteNotes || '',
      taste_tags: (item.tasteTags || []).join('; '),
      purchase_locations: item.purchaseLocation || '',
      city: item.city || '',
      state: item.state || ''
    };

    if (def.hasType) excel.type = item.type || '';
    if (def.hasStrength) excel.strength_mg = item.strengthMg || '';
    if (def.hasEffects) {
      excel.potency_and_effects = item.effectsNotes || '';
      excel.potency_effect_tags = (item.effectsTags || []).join('; ');
      excel.effects_tags = (item.effectsTags || []).join('; ');
    }
    return excel;
  }

  function normalizeForSearch(value) {
    return String(value || '').trim().toLowerCase();
  }

  function matchesQuery(source, query) {
    if (!query) return true;
    return normalizeForSearch(source).indexOf(query) >= 0;
  }

  function sortTrackerItems(items, sortBy) {
    var list = (Array.isArray(items) ? items : []).slice();
    return list.sort(function (a, b) {
      if (sortBy === 'rating-desc') return Number(b.myRating || 0) - Number(a.myRating || 0);
      if (sortBy === 'rating-asc') return Number(a.myRating || 0) - Number(b.myRating || 0);
      if (sortBy === 'brand-desc') return String(b.brand || '').localeCompare(String(a.brand || ''));
      if (sortBy === 'brand-asc') return String(a.brand || '').localeCompare(String(b.brand || ''));
      return Number(b.updatedAt || 0) - Number(a.updatedAt || 0);
    });
  }

  function applyTrackerFilters(trackerKey, list) {
    var filterState = getTrackerFilterState(trackerKey);
    var brandQuery = normalizeForSearch(filterState.brand);
    var locationQuery = normalizeForSearch(filterState.location);
    var tagsQuery = normalizeForSearch(filterState.tags);
    var minRating = Number(filterState.minRating || 0) || 0;

    var next = (Array.isArray(list) ? list : []).filter(function (item) {
      if (TRACKERS[trackerKey].hasType && filterState.type !== 'all' && String(item.type || '') !== filterState.type) return false;
      if (minRating > 0 && Number(item.myRating || 0) < minRating) return false;
      if (!matchesQuery(item.brand, brandQuery)) return false;
      if (!matchesQuery([item.purchaseLocation, item.city, item.state].join(' '), locationQuery)) return false;
      if (!matchesQuery([].concat(item.tasteTags || [], item.effectsTags || []).join(' '), tagsQuery)) return false;
      return true;
    });

    return sortTrackerItems(next, filterState.sortBy);
  }

  /**
   * Inspect the column list returned from Excel and record any missing tag
   * columns so a schema-check banner can be rendered in the pane.
   *
   * Required tag columns per tracker:
   *   All trackers → taste_tags
   *   Trackers with hasEffects=true → potency_effect_tags
   */
  function checkTrackerSchema(trackerKey, normalizedColumns) {
    var def = TRACKERS[trackerKey];
    if (!def) return;
    var colSet = {};
    normalizedColumns.forEach(function (c) { colSet[c] = true; });
    var missing = [];
    if (!colSet['taste_tags']) missing.push('taste_tags');
    if (def.hasEffects && !colSet['potency_effect_tags']) missing.push('potency_effect_tags');
    state.schemaBanners[trackerKey] = missing;
  }

  /**
   * Render a warning banner when Excel columns required for tag-based
   * filtering are absent.  Returns an HTML string (empty string when OK).
   */
  function renderSchemaBanner(trackerKey) {
    var missing = state.schemaBanners[trackerKey];
    if (!missing || !missing.length) return '';
    var def = TRACKERS[trackerKey];
    var tableName = def ? safeText(def.table) : safeText(trackerKey);
    var cols = missing.map(function (c) { return '<code>' + safeText(c) + '</code>'; }).join(', ');
    return '<div class="dc-schema-banner" role="alert" data-dc-schema-banner="' + safeText(trackerKey) + '">'
      + '<span class="dc-schema-banner-icon" aria-hidden="true">⚠️</span>'
      + '<span class="dc-schema-banner-message">Missing Excel column(s) in <strong>' + tableName + '</strong>: '
      + cols + '. Add these columns to enable tag filtering and full sync.</span>'
      + '<button type="button" class="dc-schema-banner-close" data-dc-action="dismiss-schema-banner" '
      + 'data-tracker="' + safeText(trackerKey) + '" title="Dismiss" aria-label="Dismiss schema warning">×</button>'
      + '</div>';
  }

  async function readTrackerFromExcel(trackerKey) {
    var def = TRACKERS[trackerKey];
    if (!def) return [];

    return withWorkbookPathRetry(async function (path) {
      var encodedPath = encodeGraphPath(path);
      var tableRef = encodeURIComponent(def.table);

      var columnsResp = await graphFetchJson('https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/tables/' + tableRef + '/columns?$select=name,index');
      var rowsResp = await graphFetchJson('https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/tables/' + tableRef + '/rows?$top=5000');

      var columns = (columnsResp.value || []).slice().sort(function (a, b) { return Number(a.index || 0) - Number(b.index || 0); });
      var normalizedColumns = columns.map(function (col) { return normalizeColumnName(col.name); });

      // Surface missing tag columns via in-pane schema banner.
      checkTrackerSchema(trackerKey, normalizedColumns);

      return (rowsResp.value || []).map(function (row) {
        var values = (row.values && row.values[0]) ? row.values[0] : [];
        var mapped = {};
        normalizedColumns.forEach(function (name, index) {
          mapped[name] = values[index];
        });
        return mapExcelRowToItem(trackerKey, mapped);
      }).filter(Boolean);
    }, trackerKey);
  }

  async function writeTrackerToExcel(trackerKey) {
    var def = TRACKERS[trackerKey];
    if (!def) return;

    await withWorkbookPathRetry(async function (path) {
      var encodedPath = encodeGraphPath(path);
      var tableRef = encodeURIComponent(def.table);
      var columnsResp = await graphFetchJson('https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/tables/' + tableRef + '/columns?$select=name,index');
      var columns = (columnsResp.value || []).slice().sort(function (a, b) { return Number(a.index || 0) - Number(b.index || 0); });
      var normalizedColumns = columns.map(function (col) { return normalizeColumnName(col.name); });

      await graphFetchJson('https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/tables/' + tableRef + '/rows/clear', { method: 'POST' });

      var values = (state.data[trackerKey] || []).map(function (item) {
        var excelObject = mapItemToExcelObject(trackerKey, item);
        return normalizedColumns.map(function (name) {
          return Object.prototype.hasOwnProperty.call(excelObject, name) ? excelObject[name] : '';
        });
      });
      if (!values.length) return;
      await graphFetchJson('https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/tables/' + tableRef + '/rows/add', {
        method: 'POST',
        body: JSON.stringify({ values: values })
      });
    }, trackerKey);
  }

  function getAllLocationOptions() {
    var seen = {};
    var merged = [];

    DEFAULT_LOCATIONS.forEach(function (name) {
      var key = String(name || '').trim().toLowerCase();
      if (!key || seen[key]) return;
      seen[key] = true;
      merged.push(name);
    });

    ['na-brew', 'thc-bev', 'thc-edible'].forEach(function (trackerKey) {
      (state.data[trackerKey] || []).forEach(function (item) {
        var location = String(item.purchaseLocation || '').trim();
        var key = location.toLowerCase();
        if (!location || seen[key]) return;
        seen[key] = true;
        merged.push(location);
      });
    });

    return merged;
  }

  function renderRatingText(rating) {
    var numeric = Math.max(0, Math.min(5, Number(rating || 0) || 0));
    return '★★★★★'.slice(0, numeric) + '☆☆☆☆☆'.slice(0, 5 - numeric);
  }

  function renderStaticTagChips(tags) {
    var list = (Array.isArray(tags) ? tags : []).map(function (tag) { return String(tag || '').trim(); }).filter(Boolean);
    if (!list.length) return '';
    return '<div class="dc-static-chip-row">' + list.map(function (tag) {
      return '<span class="dc-static-chip">' + safeText(tag) + '</span>';
    }).join('') + '</div>';
  }

  function getTrackerTypeOptions(def, trackerKey, selectedValue) {
    var options = (def && Array.isArray(def.typeOptions) ? def.typeOptions.slice() : []);
    (state.data[trackerKey] || []).forEach(function (item) {
      var typeName = String(item.type || '').trim();
      if (typeName && options.indexOf(typeName) < 0) options.push(typeName);
    });
    var selected = String(selectedValue || '').trim();
    if (selected && options.indexOf(selected) < 0) options.unshift(selected);
    return options;
  }

  function renderTrackerPane(trackerKey) {
    var root = getRoot();
    if (!root) return;
    var pane = root.querySelector('[data-dc-pane="' + trackerKey + '"]');
    if (!pane) return;

    var def = TRACKERS[trackerKey];
    if (!def) return;

    var filterState = getTrackerFilterState(trackerKey);
    var list = applyTrackerFilters(trackerKey, state.data[trackerKey] || []);

    var toolbar = '<div class="dc-toolbar">'
      + '<button type="button" class="pill-button" data-dc-action="add-item" data-tracker="' + trackerKey + '">Add item</button>'
      + '<label class="dc-filter">Brand search'
      + '<input type="search" data-dc-action="set-brand-filter" data-tracker="' + trackerKey + '" value="' + safeText(filterState.brand) + '" placeholder="Search brand" />'
      + '</label>'
      + '<label class="dc-filter">Min rating'
      + '<select data-dc-action="set-rating-filter" data-tracker="' + trackerKey + '">'
      + '<option value=""' + (!filterState.minRating ? ' selected' : '') + '>Any</option>'
      + '<option value="1"' + (String(filterState.minRating) === '1' ? ' selected' : '') + '>1+</option>'
      + '<option value="2"' + (String(filterState.minRating) === '2' ? ' selected' : '') + '>2+</option>'
      + '<option value="3"' + (String(filterState.minRating) === '3' ? ' selected' : '') + '>3+</option>'
      + '<option value="4"' + (String(filterState.minRating) === '4' ? ' selected' : '') + '>4+</option>'
      + '<option value="5"' + (String(filterState.minRating) === '5' ? ' selected' : '') + '>5</option>'
      + '</select>'
      + '</label>'
      + '<label class="dc-filter">Location'
      + '<input type="search" data-dc-action="set-location-filter" data-tracker="' + trackerKey + '" value="' + safeText(filterState.location) + '" placeholder="Store, city, state" />'
      + '</label>'
      + '<label class="dc-filter">Tags'
      + '<input type="search" data-dc-action="set-tags-filter" data-tracker="' + trackerKey + '" value="' + safeText(filterState.tags) + '" placeholder="Taste/effects tags" />'
      + '</label>'
      + '<label class="dc-filter">Sort'
      + '<select data-dc-action="set-sort" data-tracker="' + trackerKey + '">'
      + '<option value="updated-desc"' + (filterState.sortBy === 'updated-desc' ? ' selected' : '') + '>Recently updated</option>'
      + '<option value="rating-desc"' + (filterState.sortBy === 'rating-desc' ? ' selected' : '') + '>Rating high-low</option>'
      + '<option value="rating-asc"' + (filterState.sortBy === 'rating-asc' ? ' selected' : '') + '>Rating low-high</option>'
      + '<option value="brand-asc"' + (filterState.sortBy === 'brand-asc' ? ' selected' : '') + '>Brand A-Z</option>'
      + '<option value="brand-desc"' + (filterState.sortBy === 'brand-desc' ? ' selected' : '') + '>Brand Z-A</option>'
      + '</select>'
      + '</label>';

    if (def.hasType) {
      var typeOptions = (def.typeOptions || []).slice();
      var selectedFilter = String(filterState.type || 'all');
      toolbar += '<label class="dc-filter">Type filter'
        + '<select data-dc-action="set-type-filter" data-tracker="' + trackerKey + '">'
        + '<option value="all"' + (selectedFilter === 'all' ? ' selected' : '') + '>All types</option>'
        + typeOptions.map(function (typeName) {
          var selected = selectedFilter === typeName ? ' selected' : '';
          return '<option value="' + safeText(typeName) + '"' + selected + '>' + safeText(typeName) + '</option>';
        }).join('')
        + '</select>'
        + '</label>';
    }

    toolbar += '</div>';

    var cards = list.map(function (item) {
      var title = [String(item.brand || '').trim(), String(item.flavor || '').trim()].filter(Boolean).join(' - ') || 'Untitled item';
      var meta = [];
      if (def.hasType && item.type) meta.push('Type: ' + String(item.type));
      if (def.hasStrength && item.strengthMg) meta.push('Strength: ' + String(item.strengthMg) + ' mg');
      if (item.purchaseLocation || item.city || item.state) {
        meta.push('Location: ' + [item.purchaseLocation, item.city, item.state].filter(Boolean).join(', '));
      }
      return '<article class="dc-item-card" data-item-id="' + safeText(item.id) + '" data-tracker="' + trackerKey + '">'
        + '<div class="dc-item-head">'
        + '<div class="dc-item-title" data-dc-card-brand="1">' + safeText(title) + '</div>'
        + '<div class="dc-item-rating" data-dc-card-rating="1">' + safeText(renderRatingText(item.myRating || 0)) + '</div>'
        + '</div>'
        + (meta.length ? ('<div class="dc-item-meta">' + safeText(meta.join(' | ')) + '</div>') : '')
        + (item.tasteNotes ? ('<div class="dc-item-notes"><strong>Taste:</strong> ' + safeText(item.tasteNotes) + '</div>') : '')
        + (def.hasEffects && item.effectsNotes ? ('<div class="dc-item-notes"><strong>Effects:</strong> ' + safeText(item.effectsNotes) + '</div>') : '')
        + renderStaticTagChips([].concat(item.tasteTags || [], item.effectsTags || []))
        + '<div class="dc-card-actions">'
        + '<button type="button" class="pill-button" data-dc-action="edit-item" data-tracker="' + trackerKey + '">Edit item</button>'
        + '<button type="button" class="pill-button pill-button--danger" data-dc-action="delete-item" data-tracker="' + trackerKey + '">Delete</button>'
        + '</div>'
        + '</article>';
    }).join('');

    pane.innerHTML = renderSchemaBanner(trackerKey) + toolbar + (cards || '<div class="empty-state">No items yet. Click "Add item" to begin.</div>');
  }

  function shouldAutoSync(trackerKey) {
    var lastRunAt = Number(state.autoSync.lastRunAtByTracker[trackerKey] || 0);
    return Date.now() - lastRunAt > AUTO_SYNC_COOLDOWN_MS;
  }

  async function autoSyncTracker(trackerKey, reason) {
    if (!TRACKERS[trackerKey]) return;
    if (!getAccessToken()) {
      setStatus('Sign in to Microsoft to auto-sync ' + TRACKERS[trackerKey].title + '.', true);
      return;
    }
    if (!shouldAutoSync(trackerKey)) return;
    state.autoSync.lastRunAtByTracker[trackerKey] = Date.now();
    await syncFromExcel(trackerKey, { autoSync: true, reason: reason || 'tab-open' });
  }

  function renderCocktailRecipesPane() {
    var root = getRoot();
    if (!root) return;
    var pane = root.querySelector('[data-dc-pane="thc-cocktail-recipes"]');
    if (!pane) return;

    var recipes = state.data['thc-cocktail-recipes'] || [];
    var cards = recipes.map(function (entry) {
      return '<article class="dc-item-card" data-item-id="' + safeText(entry.id) + '" data-tracker="thc-cocktail-recipes">'
        + '<div class="dc-item-title" data-dc-recipe-name="1">' + safeText(entry.name || 'Untitled recipe') + '</div>'
        + (entry.ingredients ? ('<div class="dc-item-notes"><strong>Ingredients:</strong> ' + safeText(entry.ingredients) + '</div>') : '')
        + (entry.instructions ? ('<div class="dc-item-notes"><strong>Instructions:</strong> ' + safeText(entry.instructions) + '</div>') : '')
        + '<div class="dc-card-actions">'
        + '<button type="button" class="pill-button" data-dc-action="edit-cocktail-recipe">Edit recipe</button>'
        + '<button type="button" class="pill-button pill-button--danger" data-dc-action="delete-cocktail-recipe">Delete</button>'
        + '</div>'
        + '</article>';
    }).join('');

    pane.innerHTML = '<div class="dc-toolbar">'
      + '<button type="button" class="pill-button" data-dc-action="add-cocktail-recipe">Add cocktail recipe</button>'
      + '<span class="dc-help">Local-only recipe notes for THC cocktails.</span>'
      + '</div>'
      + (cards || '<div class="empty-state">No cocktail recipes yet. Click "Add cocktail recipe" to begin.</div>');
  }

  function renderSubtabs() {
    var root = getRoot();
    if (!root) return;

    var subTabs = getDrinksSubTabsElement(root);
    if (!subTabs) return;
    subTabs.querySelectorAll('[data-dc-subtab]').forEach(function (button) {
      var key = String(button.getAttribute('data-dc-subtab') || '');
      var isActive = key === state.activeSubtab;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    root.querySelectorAll('[data-dc-pane]').forEach(function (pane) {
      var key = String(pane.getAttribute('data-dc-pane') || '');
      var isActive = key === state.activeSubtab;
      pane.classList.toggle('active', isActive);
      pane.hidden = !isActive;
      pane.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });
  }

  function render() {
    renderSubtabs();
    renderTrackerPane('na-brew');
    renderTrackerPane('thc-bev');
    renderTrackerPane('thc-edible');
    renderCocktailRecipesPane();
  }

  function showDcModal(options) {
    var modal = document.createElement('div');
    modal.className = 'dc-modal-backdrop';
    modal.innerHTML = '<div class="dc-modal" role="dialog" aria-modal="true">'
      + '<div class="dc-modal-head">'
      + '<h3 class="dc-modal-title">' + safeText(options && options.title ? options.title : 'Add item') + '</h3>'
      + '<button type="button" class="dc-modal-close" data-dc-modal-action="close" aria-label="Close">×</button>'
      + '</div>'
      + '<div class="dc-modal-body">' + String(options && options.bodyHtml ? options.bodyHtml : '') + '</div>'
      + '<div class="dc-modal-footer">' + String(options && options.footerHtml ? options.footerHtml : '') + '</div>'
      + '</div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function (event) {
      var target = event.target && event.target.nodeType === 1 ? event.target : null;
      if (!target) return;
      if (target === modal || target.getAttribute('data-dc-modal-action') === 'close') {
        modal.remove();
      }
    });
    return modal;
  }

  function openTrackerItemModal(trackerKey, existingItem) {
    var def = TRACKERS[trackerKey];
    if (!def) return;
    var isEdit = !!(existingItem && existingItem.id);
    var seed = normalizeTrackerItem(trackerKey, existingItem || {});
    var typeField = '';
    if (def.hasType) {
      var typeOptions = getTrackerTypeOptions(def, trackerKey, seed.type);
      typeField = '<label class="dc-field">Type<select data-dc-modal-field="type">'
        + '<option value="">Select type</option>'
        + typeOptions.map(function (option) {
          return '<option value="' + safeText(option) + '"' + (option === seed.type ? ' selected' : '') + '>' + safeText(option) + '</option>';
        }).join('')
        + '</select></label>';
    }
    var bodyHtml = '<div class="dc-item-grid">'
      + typeField
      + '<label class="dc-field">Brand<input type="text" data-dc-modal-field="brand" value="' + safeText(seed.brand) + '" placeholder="Brand" required></label>'
      + '<label class="dc-field">Flavor<input type="text" data-dc-modal-field="flavor" value="' + safeText(seed.flavor) + '" placeholder="Flavor"></label>'
      + (def.hasStrength ? '<label class="dc-field">Strength mg<input type="text" data-dc-modal-field="strengthMg" value="' + safeText(seed.strengthMg) + '" placeholder="e.g. 10"></label>' : '')
      + '<label class="dc-field">My Rating<select data-dc-modal-field="myRating">'
      + '<option value="0"' + (Number(seed.myRating || 0) === 0 ? ' selected' : '') + '>No rating</option>'
      + '<option value="1"' + (Number(seed.myRating || 0) === 1 ? ' selected' : '') + '>1</option>'
      + '<option value="2"' + (Number(seed.myRating || 0) === 2 ? ' selected' : '') + '>2</option>'
      + '<option value="3"' + (Number(seed.myRating || 0) === 3 ? ' selected' : '') + '>3</option>'
      + '<option value="4"' + (Number(seed.myRating || 0) === 4 ? ' selected' : '') + '>4</option>'
      + '<option value="5"' + (Number(seed.myRating || 0) === 5 ? ' selected' : '') + '>5</option>'
      + '</select></label>'
      + '<label class="dc-field">Purchase Location<input type="text" data-dc-modal-field="purchaseLocation" value="' + safeText(seed.purchaseLocation) + '" placeholder="Store"></label>'
      + '<label class="dc-field">City<input type="text" data-dc-modal-field="city" value="' + safeText(seed.city) + '" placeholder="City"></label>'
      + '<label class="dc-field">State<input type="text" maxlength="32" data-dc-modal-field="state" value="' + safeText(seed.state) + '" placeholder="State"></label>'
      + '<label class="dc-field dc-field-wide">Taste Notes<textarea rows="3" data-dc-modal-field="tasteNotes">' + safeText(seed.tasteNotes) + '</textarea></label>'
      + '<label class="dc-field dc-field-wide">Taste Tags (comma separated)<input type="text" data-dc-modal-field="tasteTags" value="' + safeText((seed.tasteTags || []).join(', ')) + '" placeholder="refreshing, smooth"></label>'
      + (def.hasEffects ? '<label class="dc-field dc-field-wide">Potency / Effects Notes<textarea rows="3" data-dc-modal-field="effectsNotes">' + safeText(seed.effectsNotes) + '</textarea></label>' : '')
      + (def.hasEffects ? '<label class="dc-field dc-field-wide">Potency / Effects Tags (comma separated)<input type="text" data-dc-modal-field="effectsTags" value="' + safeText((seed.effectsTags || []).join(', ')) + '" placeholder="fast-acting, energetic"></label>' : '')
      + '</div>';

    var modal = showDcModal({
      title: (isEdit ? 'Edit ' : 'Add ') + def.title + ' item',
      bodyHtml: bodyHtml,
      footerHtml: '<button type="button" class="pill-button" data-dc-modal-action="close">Cancel</button>'
        + '<button type="button" class="pill-button dc-modal-primary" data-dc-modal-action="save">' + (isEdit ? 'Save changes' : 'Add item') + '</button>'
    });

    modal.addEventListener('click', function (event) {
      var target = event.target && event.target.nodeType === 1 ? event.target : null;
      if (!target || target.getAttribute('data-dc-modal-action') !== 'save') return;
      var brandField = modal.querySelector('[data-dc-modal-field="brand"]');
      var brand = String(brandField && brandField.value ? brandField.value : '').trim();
      if (!brand) {
        if (brandField && typeof brandField.focus === 'function') brandField.focus();
        setStatus('Brand is required before saving this item.', true);
        return;
      }
      var nextItem = normalizeTrackerItem(trackerKey, {
        id: isEdit ? seed.id : uid(trackerKey),
        type: def.hasType ? String((modal.querySelector('[data-dc-modal-field="type"]') || {}).value || '').trim() : '',
        brand: brand,
        flavor: String((modal.querySelector('[data-dc-modal-field="flavor"]') || {}).value || '').trim(),
        strengthMg: def.hasStrength ? String((modal.querySelector('[data-dc-modal-field="strengthMg"]') || {}).value || '').trim() : '',
        myRating: Number((modal.querySelector('[data-dc-modal-field="myRating"]') || {}).value || 0) || 0,
        tasteNotes: String((modal.querySelector('[data-dc-modal-field="tasteNotes"]') || {}).value || '').trim(),
        tasteTags: splitTags((modal.querySelector('[data-dc-modal-field="tasteTags"]') || {}).value || ''),
        effectsNotes: def.hasEffects ? String((modal.querySelector('[data-dc-modal-field="effectsNotes"]') || {}).value || '').trim() : '',
        effectsTags: def.hasEffects ? splitTags((modal.querySelector('[data-dc-modal-field="effectsTags"]') || {}).value || '') : [],
        purchaseLocation: String((modal.querySelector('[data-dc-modal-field="purchaseLocation"]') || {}).value || '').trim(),
        city: String((modal.querySelector('[data-dc-modal-field="city"]') || {}).value || '').trim(),
        state: String((modal.querySelector('[data-dc-modal-field="state"]') || {}).value || '').trim()
      });
      var list = state.data[trackerKey] || [];
      if (isEdit) {
        var idx = list.findIndex(function (entry) { return String(entry.id) === String(seed.id); });
        if (idx >= 0) list[idx] = nextItem;
        else list.unshift(nextItem);
      } else {
        list.unshift(nextItem);
      }
      state.data[trackerKey] = list;
      modal.remove();
      saveState();
      renderTrackerPane(trackerKey);
      setStatus((isEdit ? 'Saved changes in ' : 'Added new item to ') + def.title + '.', false);
    });
  }

  function addItem(trackerKey) {
    openTrackerItemModal(trackerKey, null);
  }

  function editTrackerItem(card, trackerKey) {
    var list = state.data[trackerKey] || [];
    var itemId = String(card.getAttribute('data-item-id') || '');
    var current = list.find(function (entry) { return String(entry.id) === itemId; });
    if (!current) return;
    openTrackerItemModal(trackerKey, current);
  }

  function deleteTrackerItem(card, trackerKey) {
    var list = state.data[trackerKey] || [];
    var itemId = String(card.getAttribute('data-item-id') || '');
    state.data[trackerKey] = list.filter(function (entry) { return String(entry.id) !== itemId; });
    saveState();
    renderTrackerPane(trackerKey);
    setStatus('Item removed.', false);
  }

  function openCocktailRecipeModal(existingRecipe) {
    var isEdit = !!(existingRecipe && existingRecipe.id);
    var seed = {
      id: String(existingRecipe && existingRecipe.id ? existingRecipe.id : ''),
      name: String(existingRecipe && existingRecipe.name ? existingRecipe.name : ''),
      ingredients: String(existingRecipe && existingRecipe.ingredients ? existingRecipe.ingredients : ''),
      instructions: String(existingRecipe && existingRecipe.instructions ? existingRecipe.instructions : '')
    };
    var modal = showDcModal({
      title: isEdit ? 'Edit THC cocktail recipe' : 'Add THC cocktail recipe',
      bodyHtml: '<div class="dc-item-grid">'
        + '<label class="dc-field dc-field-wide">Recipe Name<input type="text" data-dc-modal-field="name" value="' + safeText(seed.name) + '" placeholder="Recipe name" required></label>'
        + '<label class="dc-field dc-field-wide">Ingredients<textarea rows="4" data-dc-modal-field="ingredients" placeholder="Ingredients">' + safeText(seed.ingredients) + '</textarea></label>'
        + '<label class="dc-field dc-field-wide">Instructions<textarea rows="5" data-dc-modal-field="instructions" placeholder="Instructions">' + safeText(seed.instructions) + '</textarea></label>'
        + '</div>',
      footerHtml: '<button type="button" class="pill-button" data-dc-modal-action="close">Cancel</button>'
        + '<button type="button" class="pill-button dc-modal-primary" data-dc-modal-action="save">' + (isEdit ? 'Save changes' : 'Add recipe') + '</button>'
    });
    modal.addEventListener('click', function (event) {
      var target = event.target && event.target.nodeType === 1 ? event.target : null;
      if (!target || target.getAttribute('data-dc-modal-action') !== 'save') return;
      var nameField = modal.querySelector('[data-dc-modal-field="name"]');
      var name = String(nameField && nameField.value ? nameField.value : '').trim();
      if (!name) {
        if (nameField && typeof nameField.focus === 'function') nameField.focus();
        setStatus('Recipe name is required.', true);
        return;
      }
      var ingredients = String((modal.querySelector('[data-dc-modal-field="ingredients"]') || {}).value || '').trim();
      var instructions = String((modal.querySelector('[data-dc-modal-field="instructions"]') || {}).value || '').trim();
      var list = state.data['thc-cocktail-recipes'] || [];
      var nextRecipe = {
        id: isEdit ? seed.id : uid('thc-cocktail-recipe'),
        name: name,
        ingredients: ingredients,
        instructions: instructions
      };
      if (isEdit) {
        var idx = list.findIndex(function (entry) { return String(entry.id) === seed.id; });
        if (idx >= 0) list[idx] = nextRecipe;
        else list.unshift(nextRecipe);
      } else {
        list.unshift(nextRecipe);
      }
      state.data['thc-cocktail-recipes'] = list;
      modal.remove();
      saveState();
      renderCocktailRecipesPane();
      setStatus(isEdit ? 'Saved THC cocktail recipe.' : 'Added THC cocktail recipe.', false);
    });
  }

  function addCocktailRecipe() {
    openCocktailRecipeModal(null);
  }

  function editCocktailRecipe(card) {
    var id = String(card.getAttribute('data-item-id') || '');
    var list = state.data['thc-cocktail-recipes'] || [];
    var current = list.find(function (entry) { return String(entry.id) === id; });
    if (!current) return;
    openCocktailRecipeModal(current);
  }

  function deleteCocktailRecipe(card) {
    var id = String(card.getAttribute('data-item-id') || '');
    state.data['thc-cocktail-recipes'] = (state.data['thc-cocktail-recipes'] || []).filter(function (entry) {
      return String(entry.id) !== id;
    });
    saveState();
    renderCocktailRecipesPane();
    setStatus('Deleted cocktail recipe.', false);
  }

  async function syncFromExcel(trackerKey, options) {
    var def = TRACKERS[trackerKey];
    if (!def) return;
    options = options || {};
    try {
      setStatus((options.autoSync ? 'Auto-syncing ' : 'Syncing ') + def.title + ' from Excel...', false);
      var rows = await readTrackerFromExcel(trackerKey);
      state.data[trackerKey] = rows;
      saveState();
      renderTrackerPane(trackerKey);
      setStatus((options.autoSync ? 'Auto-sync complete. ' : '') + 'Loaded ' + rows.length + ' row(s) from ' + def.table + '.', false);
    } catch (error) {
      setStatus(getDrinksWorkbookErrorMessage(error, 'Excel sync failed.'), true);
    }
  }

  async function syncToExcel(trackerKey) {
    var def = TRACKERS[trackerKey];
    if (!def) return;
    try {
      setStatus('Syncing ' + def.title + ' to Excel...', false);
      await writeTrackerToExcel(trackerKey);
      setStatus('Saved ' + (state.data[trackerKey] || []).length + ' row(s) to ' + def.table + '.', false);
    } catch (error) {
      setStatus(getDrinksWorkbookErrorMessage(error, 'Excel write failed.'), true);
    }
  }

  function handleClick(event) {
    var root = getRoot();
    if (!root) return;
    var target = event.target;

    var subtab = target.closest('[data-dc-subtab]');
    var subTabsEl = getDrinksSubTabsElement(root);
    if (subtab && subTabsEl && subTabsEl.contains(subtab)) {
      var subtabKey = String(subtab.getAttribute('data-dc-subtab') || 'na-brew');
      setActiveSubtab(subtabKey);

      if (subtabKey === 'recipes') {
        renderSubtabs();
        syncDrinksSubTabDock(root);
        if (global.tabLoader && typeof global.tabLoader.switchTab === 'function') {
          global.tabLoader.switchTab('recipes', { syncUrl: true, historyMode: 'push', source: 'food-drink-subtab' });
        }
        return;
      }

      render();
      syncDrinksSubTabDock(root);
      if (global.tabLoader && typeof global.tabLoader.switchTab === 'function' && getActiveAppTabId() !== 'drinks-cocktails') {
        global.tabLoader.switchTab('drinks-cocktails', { syncUrl: true, historyMode: 'push', source: 'food-drink-subtab' });
        return;
      }
      if (TRACKERS[state.activeSubtab]) {
        autoSyncTracker(state.activeSubtab, 'subtab-open');
      }
      return;
    }

    var actionNode = target.closest('[data-dc-action]');
    if (!actionNode || !root.contains(actionNode)) return;
    var action = String(actionNode.getAttribute('data-dc-action') || '');
    var trackerKey = String(actionNode.getAttribute('data-tracker') || state.activeSubtab);
    var card = actionNode.closest('.dc-item-card');

    if (action === 'add-item') {
      addItem(trackerKey);
      return;
    }
    if (action === 'dismiss-schema-banner') {
      state.schemaBanners[trackerKey] = [];
      renderTrackerPane(trackerKey);
      return;
    }
    if (action === 'sync-from-excel') {
      syncFromExcel(trackerKey);
      return;
    }
    if (action === 'sync-to-excel') {
      syncToExcel(trackerKey);
      return;
    }
    if (action === 'edit-item' && card) {
      editTrackerItem(card, trackerKey);
      return;
    }
    if (action === 'delete-item' && card) {
      deleteTrackerItem(card, trackerKey);
      return;
    }
    if (action === 'add-cocktail-recipe') {
      addCocktailRecipe();
      return;
    }
    if (action === 'edit-cocktail-recipe' && card) {
      editCocktailRecipe(card);
      return;
    }
    if (action === 'delete-cocktail-recipe' && card) {
      deleteCocktailRecipe(card);
      return;
    }
  }

  function handleChange(event) {
    var root = getRoot();
    if (!root) return;
    var target = event.target;

    var filterSelect = target.closest('[data-dc-action="set-type-filter"]');
    if (filterSelect && root.contains(filterSelect)) {
      var trackerKey = String(filterSelect.getAttribute('data-tracker') || '');
      if (trackerKey) {
        getTrackerFilterState(trackerKey).type = String(filterSelect.value || 'all');
        renderTrackerPane(trackerKey);
      }
      return;
    }

    var brandFilter = target.closest('[data-dc-action="set-brand-filter"]');
    if (brandFilter && root.contains(brandFilter)) {
      getTrackerFilterState(String(brandFilter.getAttribute('data-tracker') || state.activeSubtab)).brand = String(brandFilter.value || '');
      renderTrackerPane(String(brandFilter.getAttribute('data-tracker') || state.activeSubtab));
      return;
    }

    var ratingFilter = target.closest('[data-dc-action="set-rating-filter"]');
    if (ratingFilter && root.contains(ratingFilter)) {
      getTrackerFilterState(String(ratingFilter.getAttribute('data-tracker') || state.activeSubtab)).minRating = String(ratingFilter.value || '');
      renderTrackerPane(String(ratingFilter.getAttribute('data-tracker') || state.activeSubtab));
      return;
    }

    var locationFilter = target.closest('[data-dc-action="set-location-filter"]');
    if (locationFilter && root.contains(locationFilter)) {
      getTrackerFilterState(String(locationFilter.getAttribute('data-tracker') || state.activeSubtab)).location = String(locationFilter.value || '');
      renderTrackerPane(String(locationFilter.getAttribute('data-tracker') || state.activeSubtab));
      return;
    }

    var tagsFilter = target.closest('[data-dc-action="set-tags-filter"]');
    if (tagsFilter && root.contains(tagsFilter)) {
      getTrackerFilterState(String(tagsFilter.getAttribute('data-tracker') || state.activeSubtab)).tags = String(tagsFilter.value || '');
      renderTrackerPane(String(tagsFilter.getAttribute('data-tracker') || state.activeSubtab));
      return;
    }

    var sortFilter = target.closest('[data-dc-action="set-sort"]');
    if (sortFilter && root.contains(sortFilter)) {
      getTrackerFilterState(String(sortFilter.getAttribute('data-tracker') || state.activeSubtab)).sortBy = String(sortFilter.value || 'updated-desc');
      renderTrackerPane(String(sortFilter.getAttribute('data-tracker') || state.activeSubtab));
      return;
    }
  }

  function ensureStyles() {
    if (document.getElementById('drinksCocktailsRuntimeStyles')) return;
    var style = document.createElement('style');
    style.id = 'drinksCocktailsRuntimeStyles';
    style.textContent = ''
      + '#drinksCocktailsRoot .dc-toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px;}'
      + '#drinksCocktailsRoot .dc-help{font-size:12px;color:#6b7280;font-weight:600;}'
      + '#drinksCocktailsRoot .dc-filter{display:flex;gap:6px;align-items:center;font-size:12px;color:#334155;font-weight:700;}'
      + '#drinksCocktailsRoot .dc-filter select,#drinksCocktailsRoot .dc-filter input{padding:6px 8px;border:1px solid #cbd5e1;border-radius:8px;}'
      + '#drinksCocktailsRoot .dc-item-card{border:1px solid #e2e8f0;border-radius:10px;padding:12px;margin-bottom:10px;background:#f8fafc;}'
      + '#drinksCocktailsRoot .dc-item-head{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:6px;}'
      + '#drinksCocktailsRoot .dc-item-title{font-weight:800;color:#0f172a;font-size:15px;line-height:1.3;}'
      + '#drinksCocktailsRoot .dc-item-rating{font-size:14px;color:#d97706;letter-spacing:1px;white-space:nowrap;}'
      + '#drinksCocktailsRoot .dc-item-meta{font-size:12px;color:#475569;font-weight:700;margin-bottom:6px;line-height:1.4;}'
      + '#drinksCocktailsRoot .dc-item-notes{font-size:12px;color:#334155;line-height:1.45;white-space:pre-line;margin-bottom:6px;}'
      + '#drinksCocktailsRoot .dc-static-chip-row{display:flex;gap:6px;flex-wrap:wrap;margin:4px 0 8px;}'
      + '#drinksCocktailsRoot .dc-static-chip{border:1px solid #cbd5e1;background:#fff;border-radius:999px;padding:4px 9px;font-size:11px;font-weight:700;color:#334155;}'
      + '#drinksCocktailsRoot .dc-item-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;}'
      + '#drinksCocktailsRoot .dc-field{display:flex;flex-direction:column;gap:4px;font-size:12px;font-weight:700;color:#334155;}'
      + '#drinksCocktailsRoot .dc-field input,#drinksCocktailsRoot .dc-field select,#drinksCocktailsRoot .dc-field textarea{border:1px solid #cbd5e1;border-radius:8px;padding:7px 9px;font-size:13px;font-weight:500;background:#fff;color:#0f172a;}'
      + '#drinksCocktailsRoot .dc-field-wide{grid-column:1 / -1;}'
      + '#drinksCocktailsRoot .dc-card-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:10px;}'
      + '#drinksCocktailsRoot .pill-button--danger{border-color:#fecaca;background:#fef2f2;color:#b91c1c;}'
      + '#drinksCocktailsRoot .dc-schema-banner{display:flex;gap:8px;align-items:flex-start;padding:10px 12px;margin-bottom:10px;border:1px solid #fcd34d;background:#fffbeb;border-radius:8px;font-size:12px;color:#92400e;}'
      + '#drinksCocktailsRoot .dc-schema-banner-icon{flex-shrink:0;font-size:14px;line-height:1.4;}'
      + '#drinksCocktailsRoot .dc-schema-banner-message{flex:1;line-height:1.5;}'
      + '#drinksCocktailsRoot .dc-schema-banner-message code{background:#fef3c7;border:1px solid #fde68a;border-radius:3px;padding:1px 4px;font-family:monospace;font-size:11px;}'
      + '#drinksCocktailsRoot .dc-schema-banner-close{flex-shrink:0;border:0;background:transparent;font-size:16px;cursor:pointer;color:#92400e;padding:0 2px;line-height:1;}'
      + '.dc-modal-backdrop{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.5);z-index:10040;padding:16px;}'
      + '.dc-modal{width:min(760px,96vw);max-height:86vh;overflow:auto;background:#fff;border-radius:14px;padding:16px;box-shadow:0 20px 60px rgba(0,0,0,.28);}'
      + '.dc-modal-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;}'
      + '.dc-modal-title{margin:0;font-size:20px;color:#111827;}'
      + '.dc-modal-close{border:0;background:transparent;font-size:24px;line-height:1;cursor:pointer;color:#334155;}'
      + '.dc-modal-footer{display:flex;justify-content:flex-end;gap:8px;margin-top:12px;}'
      + '.dc-modal-primary{background:linear-gradient(135deg,#8b5cf6 0%,#7c3aed 100%);border:1px solid #7c3aed;color:#fff;font-weight:700;box-shadow:0 2px 8px rgba(139,92,246,.35);}'
      + '.dc-modal-primary:hover{filter:brightness(.98);}'
      + '.dc-modal .dc-field textarea{min-height:84px;}'
    document.head.appendChild(style);
  }

  function bindEvents() {
    var root = getRoot();
    if (!root || root.dataset.drinksCocktailsBound === '1') return;
    root.dataset.drinksCocktailsBound = '1';
    root.addEventListener('click', handleClick);
    root.addEventListener('change', handleChange);
    document.addEventListener('click', function (event) {
      var target = event.target && event.target.nodeType === 1 ? event.target : null;
      if (!target) return;
      var subtab = target.closest ? target.closest('[data-dc-subtab]') : null;
      if (!subtab) return;
      if (root.contains(subtab)) return;
      var subTabs = getDrinksSubTabsElement(getRoot());
      if (!subTabs || !subTabs.contains(subtab)) return;
      handleClick(event);
    });
    window.addEventListener('resize', function () {
      positionDrinksSubTabDock();
    });
  }

  function ensureSeedData() {}

  function init() {
    var root = getRoot();
    if (!root) return;
    ensureStyles();
    loadState();
    ensureSeedData();
    bindEvents();

    if (getActiveAppTabId() === 'recipes') {
      setActiveSubtab('recipes');
    } else if (state.activeSubtab === 'recipes') {
      setActiveSubtab(state.lastTrackerSubtab || 'na-brew');
    }

    if (!state._tabOpenSyncBound) {
      state._tabOpenSyncBound = true;
      window.addEventListener('app:tab-switched', function (event) {
        var tabId = event && event.detail ? event.detail.tabId : '';
        if (tabId === 'recipes') {
          setActiveSubtab('recipes');
          renderSubtabs();
          syncDrinksSubTabDock(root);
          return;
        }
        if (tabId === 'drinks-cocktails' && state.activeSubtab === 'recipes') {
          setActiveSubtab(state.lastTrackerSubtab || 'na-brew');
        }
        if (tabId === 'drinks-cocktails') {
          render();
        }
        syncDrinksSubTabDock(root);
        if (tabId !== 'drinks-cocktails') return;
        autoSyncTracker(state.activeSubtab, 'tab-open');
      });
    }

    render();
    syncDrinksSubTabDock(root);
    setStatus('Food / Drink hub ready. Auto-sync runs when a drinks tracker opens.', false);

    autoSyncTracker(state.activeSubtab, 'init');
  }

  global.DrinksCocktailsTabSystem = {
    init: init,
    render: render,
    syncFromExcel: syncFromExcel,
    syncToExcel: syncToExcel,
    checkTrackerSchema: checkTrackerSchema,
    getSchemaBanner: function (trackerKey) { return state.schemaBanners[trackerKey] || []; }
  };

  global.initDrinksCocktailsTab = init;
})(typeof window !== 'undefined' ? window : global);

