(function initDrinksCocktailsTabSystem(global) {
  'use strict';

  var ROOT_ID = 'drinksCocktailsRoot';
  var STATUS_ID = 'drinksCocktailsStatus';
  var STORAGE_KEY = 'kap_drinks_cocktails_v1';
  var WORKBOOK_CANDIDATES = ['Recipes.xlsx', 'recipes.xlsx', 'Recipes.xlsm', 'recipes.xlsm', 'recipes'];
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
      workbookPath: ''
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

  async function resolveWorkbookPath() {
    if (state.excel.workbookPath) return state.excel.workbookPath;

    for (var i = 0; i < WORKBOOK_CANDIDATES.length; i += 1) {
      var candidate = WORKBOOK_CANDIDATES[i];
      try {
        await graphFetchJson('https://graph.microsoft.com/v1.0/me/drive/root:/' + encodeGraphPath(candidate));
        state.excel.workbookPath = candidate;
        return state.excel.workbookPath;
      } catch (_error) {
        // Try next candidate.
      }
    }

    var search = await graphFetchJson("https://graph.microsoft.com/v1.0/me/drive/root/search(q='Recipes')?$select=name,parentReference");
    var list = Array.isArray(search.value) ? search.value : [];
    var match = list.find(function (item) {
      return String(item.name || '').toLowerCase().indexOf('recipes') >= 0;
    });
    if (!match || !match.parentReference) throw new Error('Could not find workbook named Recipes.');

    var parentPath = String(match.parentReference.path || '').replace('/drive/root:', '').replace(/^\/+/, '');
    state.excel.workbookPath = parentPath ? (parentPath + '/' + match.name) : match.name;
    return state.excel.workbookPath;
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

    var path = await resolveWorkbookPath();
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
  }

  async function writeTrackerToExcel(trackerKey) {
    var def = TRACKERS[trackerKey];
    if (!def) return;

    var path = await resolveWorkbookPath();
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

  function renderRatingStars(rating) {
    var numeric = Number(rating || 0) || 0;
    var html = '<div class="dc-rating-stars">';
    for (var i = 1; i <= 5; i += 1) {
      var activeClass = i <= numeric ? ' is-active' : '';
      html += '<button type="button" class="dc-star' + activeClass + '" data-dc-rating-value="' + i + '" title="Rate ' + i + ' out of 5">' + (i <= numeric ? '★' : '☆') + '</button>';
    }
    html += '</div>';
    return html;
  }

  function renderTagGroup(tags, selected, groupName) {
    var selectedSet = {};
    (Array.isArray(selected) ? selected : []).forEach(function (tag) {
      selectedSet[String(tag || '').toLowerCase()] = true;
    });

    return '<div class="dc-tag-group" data-tag-group="' + safeText(groupName) + '">'
      + tags.map(function (tag) {
        var key = String(tag || '').toLowerCase();
        var activeClass = selectedSet[key] ? ' is-active' : '';
        return '<button type="button" class="dc-tag-chip' + activeClass + '" data-dc-tag-toggle="1" data-tag-value="' + safeText(tag) + '">' + safeText(tag) + '</button>';
      }).join('')
      + '</div>';
  }

  function renderTypeSelect(def, value, trackerKey) {
    if (!def.hasType) return '';
    var options = (def.typeOptions || []).slice();
    (state.data[trackerKey] || []).forEach(function (item) {
      var typeName = String(item.type || '').trim();
      if (typeName && options.indexOf(typeName) < 0) options.push(typeName);
    });

    var selected = String(value || '').trim();
    return '<label class="dc-field">Type'
      + '<select data-field="type">'
      + '<option value="">Select type</option>'
      + options.map(function (option) {
        var isSelected = option === selected ? ' selected' : '';
        return '<option value="' + safeText(option) + '"' + isSelected + '>' + safeText(option) + '</option>';
      }).join('')
      + '</select>'
      + '</label>';
  }

  function renderLocationSelect(value) {
    var options = getAllLocationOptions();
    var selected = String(value || '').trim();
    var hasPreset = options.indexOf(selected) >= 0;

    var html = '<label class="dc-field">Purchase Location'
      + '<select data-field="purchaseLocationSelect">'
      + '<option value="">Select location</option>'
      + options.map(function (name) {
        var isSelected = name === selected ? ' selected' : '';
        return '<option value="' + safeText(name) + '"' + isSelected + '>' + safeText(name) + '</option>';
      }).join('')
      + '<option value="__custom__"' + (!hasPreset && selected ? ' selected' : '') + '>Custom...</option>'
      + '</select>'
      + '</label>';

    html += '<label class="dc-field dc-custom-location"' + (!hasPreset && selected ? '' : ' hidden') + '>Custom Store'
      + '<input type="text" data-field="purchaseLocationCustom" value="' + safeText(!hasPreset ? selected : '') + '" placeholder="Store name" />'
      + '</label>';

    return html;
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
      var ratingValue = Number(item.myRating || 0) || 0;
      var card = '<article class="dc-item-card" data-item-id="' + safeText(item.id) + '" data-tracker="' + trackerKey + '">'
        + '<div class="dc-item-grid">'
        + renderTypeSelect(def, item.type, trackerKey)
        + '<label class="dc-field">Brand<input type="text" data-field="brand" value="' + safeText(item.brand) + '" /></label>'
        + '<label class="dc-field">Flavor<input type="text" data-field="flavor" value="' + safeText(item.flavor) + '" /></label>';

      if (def.hasStrength) {
        card += '<label class="dc-field">Strength mg<input type="number" step="0.1" min="0" data-field="strengthMg" value="' + safeText(item.strengthMg) + '" /></label>';
      }

      card += '<label class="dc-field dc-field-wide">My Rating'
        + '<input type="hidden" data-field="myRating" value="' + ratingValue + '" />'
        + renderRatingStars(ratingValue)
        + '</label>'
        + '<label class="dc-field dc-field-wide">Taste Notes<textarea rows="2" data-field="tasteNotes">' + safeText(item.tasteNotes) + '</textarea></label>'
        + '<div class="dc-field dc-field-wide"><div class="dc-field-label">Taste Tags</div>' + renderTagGroup(TASTE_TAGS, item.tasteTags, 'taste') + '</div>';

      if (def.hasEffects) {
        card += '<label class="dc-field dc-field-wide">Potency / Effects Notes<textarea rows="2" data-field="effectsNotes">' + safeText(item.effectsNotes) + '</textarea></label>'
          + '<div class="dc-field dc-field-wide"><div class="dc-field-label">Potency / Effects Tags</div>' + renderTagGroup(EFFECT_TAGS, item.effectsTags, 'effects') + '</div>';
      }

      card += renderLocationSelect(item.purchaseLocation)
        + '<label class="dc-field">City<input type="text" data-field="city" value="' + safeText(item.city) + '" /></label>'
        + '<label class="dc-field">State<input type="text" maxlength="32" data-field="state" value="' + safeText(item.state) + '" /></label>'
        + '</div>'
        + '<div class="dc-card-actions">'
        + '<button type="button" class="pill-button" data-dc-action="save-item" data-tracker="' + trackerKey + '">Save item</button>'
        + '<button type="button" class="pill-button pill-button--danger" data-dc-action="delete-item" data-tracker="' + trackerKey + '">Delete</button>'
        + '</div>'
        + '</article>';

      return card;
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
        + '<div class="dc-item-grid">'
        + '<label class="dc-field dc-field-wide">Recipe Name<input type="text" data-field="name" value="' + safeText(entry.name || '') + '" /></label>'
        + '<label class="dc-field dc-field-wide">Ingredients<textarea rows="3" data-field="ingredients">' + safeText(entry.ingredients || '') + '</textarea></label>'
        + '<label class="dc-field dc-field-wide">Instructions<textarea rows="4" data-field="instructions">' + safeText(entry.instructions || '') + '</textarea></label>'
        + '</div>'
        + '<div class="dc-card-actions">'
        + '<button type="button" class="pill-button" data-dc-action="save-cocktail-recipe">Save recipe</button>'
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

    root.querySelectorAll('[data-dc-subtab]').forEach(function (button) {
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

  function updateStarVisuals(card, rating) {
    var stars = card.querySelectorAll('[data-dc-rating-value]');
    stars.forEach(function (star) {
      var value = Number(star.getAttribute('data-dc-rating-value') || 0);
      var active = value <= rating;
      star.classList.toggle('is-active', active);
      star.textContent = active ? '★' : '☆';
    });
    var ratingInput = card.querySelector('input[data-field="myRating"]');
    if (ratingInput) ratingInput.value = String(rating || 0);
  }

  function addItem(trackerKey) {
    var def = TRACKERS[trackerKey];
    if (!def) return;
    var brand = prompt('Brand:');
    if (!brand) return;
    var flavor = prompt('Flavor:', '');
    var type = '';
    var strengthMg = '';

    if (def.hasType) {
      type = prompt('Type:', (def.typeOptions && def.typeOptions[0]) || '');
    }
    if (def.hasStrength) {
      strengthMg = prompt('Strength mg:', '');
    }

    state.data[trackerKey].unshift(normalizeTrackerItem(trackerKey, {
      id: uid(trackerKey),
      brand: brand,
      flavor: flavor,
      type: type,
      strengthMg: strengthMg,
      myRating: 0,
      tasteNotes: '',
      tasteTags: [],
      effectsNotes: '',
      effectsTags: [],
      purchaseLocation: '',
      city: '',
      state: ''
    }));

    saveState();
    renderTrackerPane(trackerKey);
    setStatus('Added new item to ' + def.title + '.', false);
  }

  function saveTrackerItem(card, trackerKey) {
    var list = state.data[trackerKey] || [];
    var itemId = String(card.getAttribute('data-item-id') || '');
    var index = list.findIndex(function (entry) { return String(entry.id) === itemId; });
    if (index < 0) return;

    list[index] = normalizeTrackerItem(trackerKey, {
      id: itemId,
      type: card.querySelector('[data-field="type"]') ? card.querySelector('[data-field="type"]').value : '',
      brand: card.querySelector('[data-field="brand"]') ? card.querySelector('[data-field="brand"]').value : '',
      flavor: card.querySelector('[data-field="flavor"]') ? card.querySelector('[data-field="flavor"]').value : '',
      strengthMg: card.querySelector('[data-field="strengthMg"]') ? card.querySelector('[data-field="strengthMg"]').value : '',
      myRating: card.querySelector('[data-field="myRating"]') ? Number(card.querySelector('[data-field="myRating"]').value || 0) : 0,
      tasteNotes: card.querySelector('[data-field="tasteNotes"]') ? card.querySelector('[data-field="tasteNotes"]').value : '',
      tasteTags: Array.from(card.querySelectorAll('[data-tag-group="taste"] .dc-tag-chip.is-active')).map(function (node) { return String(node.getAttribute('data-tag-value') || '').trim(); }).filter(Boolean),
      effectsNotes: card.querySelector('[data-field="effectsNotes"]') ? card.querySelector('[data-field="effectsNotes"]').value : '',
      effectsTags: Array.from(card.querySelectorAll('[data-tag-group="effects"] .dc-tag-chip.is-active')).map(function (node) { return String(node.getAttribute('data-tag-value') || '').trim(); }).filter(Boolean),
      purchaseLocation: (function () {
        var select = card.querySelector('[data-field="purchaseLocationSelect"]');
        if (!select) return '';
        if (select.value !== '__custom__') return select.value;
        var custom = card.querySelector('[data-field="purchaseLocationCustom"]');
        return custom ? String(custom.value || '').trim() : '';
      })(),
      city: card.querySelector('[data-field="city"]') ? card.querySelector('[data-field="city"]').value : '',
      state: card.querySelector('[data-field="state"]') ? card.querySelector('[data-field="state"]').value : ''
    });
    saveState();
    setStatus('Saved item locally. Sync to Excel when ready.', false);
    renderTrackerPane(trackerKey);
  }

  function deleteTrackerItem(card, trackerKey) {
    var list = state.data[trackerKey] || [];
    var itemId = String(card.getAttribute('data-item-id') || '');
    state.data[trackerKey] = list.filter(function (entry) { return String(entry.id) !== itemId; });
    saveState();
    renderTrackerPane(trackerKey);
    setStatus('Item removed.', false);
  }

  function addCocktailRecipe() {
    var name = prompt('Cocktail recipe name:');
    if (!name) return;
    var ingredients = prompt('Ingredients:', '');
    var instructions = prompt('Instructions:', '');
    state.data['thc-cocktail-recipes'].unshift({
      id: uid('thc-cocktail-recipe'),
      name: name,
      ingredients: ingredients,
      instructions: instructions
    });
    saveState();
    renderCocktailRecipesPane();
    setStatus('Added THC cocktail recipe.', false);
  }

  function saveCocktailRecipe(card) {
    var id = String(card.getAttribute('data-item-id') || '');
    var list = state.data['thc-cocktail-recipes'] || [];
    var idx = list.findIndex(function (entry) { return String(entry.id) === id; });
    if (idx < 0) return;
    list[idx] = {
      id: id,
      name: card.querySelector('[data-field="name"]') ? card.querySelector('[data-field="name"]').value : '',
      ingredients: card.querySelector('[data-field="ingredients"]') ? card.querySelector('[data-field="ingredients"]').value : '',
      instructions: card.querySelector('[data-field="instructions"]') ? card.querySelector('[data-field="instructions"]').value : ''
    };
    saveState();
    setStatus('Saved cocktail recipe.', false);
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
      setStatus((error && error.message) ? error.message : 'Excel sync failed.', true);
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
      setStatus((error && error.message) ? error.message : 'Excel write failed.', true);
    }
  }

  function handleClick(event) {
    var root = getRoot();
    if (!root) return;
    var target = event.target;

    var subtab = target.closest('[data-dc-subtab]');
    if (subtab && root.contains(subtab)) {
      state.activeSubtab = String(subtab.getAttribute('data-dc-subtab') || 'na-brew');
      render();
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
    if (action === 'save-item' && card) {
      saveTrackerItem(card, trackerKey);
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
    if (action === 'save-cocktail-recipe' && card) {
      saveCocktailRecipe(card);
      return;
    }
    if (action === 'delete-cocktail-recipe' && card) {
      deleteCocktailRecipe(card);
      return;
    }

    var tagNode = target.closest('[data-dc-tag-toggle="1"]');
    if (tagNode && card && root.contains(tagNode)) {
      tagNode.classList.toggle('is-active');
      return;
    }

    var star = target.closest('[data-dc-rating-value]');
    if (star && card && root.contains(star)) {
      var value = Number(star.getAttribute('data-dc-rating-value') || 0) || 0;
      updateStarVisuals(card, value);
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

    if (target.matches('[data-field="purchaseLocationSelect"]')) {
      var card = target.closest('.dc-item-card');
      if (!card) return;
      var customWrap = card.querySelector('.dc-custom-location');
      if (!customWrap) return;
      customWrap.hidden = target.value !== '__custom__';
      if (target.value !== '__custom__') {
        var customInput = card.querySelector('[data-field="purchaseLocationCustom"]');
        if (customInput) customInput.value = '';
      }
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
      + '#drinksCocktailsRoot .dc-item-card{border:1px solid #e2e8f0;border-radius:10px;padding:10px;margin-bottom:10px;background:#f8fafc;}'
      + '#drinksCocktailsRoot .dc-item-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;}'
      + '#drinksCocktailsRoot .dc-field{display:flex;flex-direction:column;gap:4px;font-size:12px;font-weight:700;color:#334155;}'
      + '#drinksCocktailsRoot .dc-field input,#drinksCocktailsRoot .dc-field select,#drinksCocktailsRoot .dc-field textarea{border:1px solid #cbd5e1;border-radius:8px;padding:7px 9px;font-size:13px;font-weight:500;background:#fff;color:#0f172a;}'
      + '#drinksCocktailsRoot .dc-field-wide{grid-column:1 / -1;}'
      + '#drinksCocktailsRoot .dc-card-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:10px;}'
      + '#drinksCocktailsRoot .dc-rating-stars{display:flex;gap:4px;flex-wrap:wrap;}'
      + '#drinksCocktailsRoot .dc-star{border:1px solid #cbd5e1;background:#fff;border-radius:6px;padding:4px 7px;cursor:pointer;font-size:14px;line-height:1;color:#64748b;}'
      + '#drinksCocktailsRoot .dc-star.is-active{border-color:#f59e0b;color:#d97706;background:#fffbeb;}'
      + '#drinksCocktailsRoot .dc-tag-group{display:flex;gap:6px;flex-wrap:wrap;}'
      + '#drinksCocktailsRoot .dc-tag-chip{border:1px solid #cbd5e1;background:#fff;border-radius:999px;padding:5px 10px;font-size:11px;font-weight:700;color:#334155;cursor:pointer;}'
      + '#drinksCocktailsRoot .dc-tag-chip.is-active{border-color:#2563eb;background:#dbeafe;color:#1e3a8a;}'
      + '#drinksCocktailsRoot .dc-field-label{font-size:12px;font-weight:700;color:#334155;margin-bottom:3px;}'
      + '#drinksCocktailsRoot .pill-button--danger{border-color:#fecaca;background:#fef2f2;color:#b91c1c;}'
      + '#drinksCocktailsRoot .dc-schema-banner{display:flex;gap:8px;align-items:flex-start;padding:10px 12px;margin-bottom:10px;border:1px solid #fcd34d;background:#fffbeb;border-radius:8px;font-size:12px;color:#92400e;}'
      + '#drinksCocktailsRoot .dc-schema-banner-icon{flex-shrink:0;font-size:14px;line-height:1.4;}'
      + '#drinksCocktailsRoot .dc-schema-banner-message{flex:1;line-height:1.5;}'
      + '#drinksCocktailsRoot .dc-schema-banner-message code{background:#fef3c7;border:1px solid #fde68a;border-radius:3px;padding:1px 4px;font-family:monospace;font-size:11px;}'
      + '#drinksCocktailsRoot .dc-schema-banner-close{flex-shrink:0;border:0;background:transparent;font-size:16px;cursor:pointer;color:#92400e;padding:0 2px;line-height:1;}';
    document.head.appendChild(style);
  }

  function bindEvents() {
    var root = getRoot();
    if (!root || root.dataset.drinksCocktailsBound === '1') return;
    root.dataset.drinksCocktailsBound = '1';
    root.addEventListener('click', handleClick);
    root.addEventListener('change', handleChange);
  }

  function ensureSeedData() {
    if (!state.data['thc-bev'].length) {
      state.data['thc-bev'].push(normalizeTrackerItem('thc-bev', { type: 'Seltzer (THC infused)' }));
      state.data['thc-bev'].push(normalizeTrackerItem('thc-bev', { type: 'Soda (THC infused)' }));
      state.data['thc-bev'].push(normalizeTrackerItem('thc-bev', { type: 'Juice (THC infused)' }));
    }
    if (!state.data['thc-edible'].length) {
      state.data['thc-edible'].push(normalizeTrackerItem('thc-edible', { type: 'Chocolate (THC infused)' }));
      state.data['thc-edible'].push(normalizeTrackerItem('thc-edible', { type: 'Gummies (THC infused)' }));
    }
  }

  function init() {
    var root = getRoot();
    if (!root) return;
    ensureStyles();
    loadState();
    ensureSeedData();
    bindEvents();

    if (!state._tabOpenSyncBound) {
      state._tabOpenSyncBound = true;
      window.addEventListener('app:tab-switched', function (event) {
        var tabId = event && event.detail ? event.detail.tabId : '';
        if (tabId !== 'drinks-cocktails') return;
        autoSyncTracker(state.activeSubtab, 'tab-open');
      });
    }

    render();
    setStatus('Drinks / Cocktails tracker ready. Auto-sync runs when this tab opens.', false);

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

