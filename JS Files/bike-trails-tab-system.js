/*
 * Bike Trails Tab System
 * Mirrors Adventure Planner behavior with bike-specific data schema and controls.
 */

(function() {
  // ─── File / table config ────────────────────────────────────────────────────
  // These values are the *defaults*. If the Excel file lives at a different path
  // in OneDrive, update BIKE_FILE_PATH_DEFAULT below OR call
  //   window.setBikeConfig({ filePath: 'Your/OneDrive/Path/File.xlsx', tableName: 'TableName' })
  // from the browser console at any time without touching this file.
  const BIKE_FILE_PATH_DEFAULT = 'Copilot_Apps/Kyles_Adventure_Finder/Bike_Trail_Planner.xlsx';
  const BIKE_FILE_NAME         = 'Bike_Trail_Planner.xlsx';
  const BIKE_TABLE_NAME        = 'BikeTrails';
  // Extra candidate table names tried automatically when BIKE_TABLE_NAME 404s
  const BIKE_TABLE_CANDIDATES  = [
    BIKE_TABLE_NAME,
    'Table1', 'Sheet1', 'Bike Trails', 'biketrails', 'Trails', 'trails'
  ];
  const BIKE_DIFFICULTY_SCORE_COLUMN = 'Difficulty Score (0\u2013100)';
  const BIKE_PREFERENCE_COLUMNS = {
    rating: 'My Rating',
    favorite: 'Favorite Status'
  };
  const BIKE_COLUMN_ALIASES = {
    [BIKE_DIFFICULTY_SCORE_COLUMN]: ['Difficulty Score (0-100)'],
    'Google Images': ['Google Images '],
    'Google URL': ['Google Url'],
    'Google Place ID': ['Google Place Id'],
    'Hours of Operation': ['Hours'],
    'Favorite Status': ['Favourite Status']
  };
  const BIKE_NOTES_PREFIX = 'NOTES_JSON_V1::';
  const LEGACY_BIKE_PREFS_MIGRATION_KEY = 'bikeTrailPrefsMigratedToExcel';
  const ITEMS_PER_PAGE = 20;
  const BIKE_EXPLORER_PRESETS_KEY = 'bikeTrailExplorerPresetsV1';
  const BIKE_EXPLORER_LAST_PRESET_KEY = 'bikeTrailExplorerLastPresetV1';
  const BIKE_EXPLORER_DEFAULT_PRESET_KEY = 'bikeTrailExplorerDefaultPresetV1';
  const BIKE_EXPLORER_AUTO_APPLY_KEY = 'bikeTrailExplorerAutoApplyV1';
  const BIKE_EXPLORER_TAB_DATA_KEY_LATEST = 'bikeTrailExplorerTabDataLatestV1';
  const BIKE_EXPLORER_MAX_PRESETS = 8;

  const BIKE_COLUMNS = [
    'Ride Name',
    'Region',
    'Drive Time',
    'Length (miles)',
    'Surface Type',
    'Surface Breakdown (%)',
    'Difficulty',
    BIKE_DIFFICULTY_SCORE_COLUMN,
    'Elevation Gain (ft)',
    'Ride Flow Profile',
    'Ride Commitment Level',
    'Ride Type Classification',
    'Vibes',
    'Ride Mood Tags',
    'Ride Start Experience',
    'Ride Finish Experience',
    'Best Time of Day',
    'Ride Noise Profile',
    'Weather Suitability',
    'Seasonal Notes',
    'Scenic & Nature Highlights',
    'Photo Spots',
    'Local Wildlife Notes',
    'Local History / Fun Fact',
    'Ride Risk Profile',
    'Traffic Exposure Rating',
    'Ride Smoothness Index',
    'Night Riding Suitability',
    'Parking Capacity',
    'Parking Difficulty',
    'Parking Distance to Trail',
    'Parking Cost',
    'Parking Safety / Lighting Notes',
    'Local Regulations',
    'Emergency Access Notes',
    'Cell Coverage Notes',
    'Coffee Nearby',
    'Food Nearby',
    'Brewery Nearby',
    'Bike Shop Nearby',
    'Local Shops Nearby',
    'GPS Coordinates',
    'Maps Link',
    'Parking Link',
    'Recommended Loop',
    'Official Link 1',
    'Official Link 2',
    'Official Link 3',
    'TrailLink',
    'AllTrails',
    'MTBProject',
    'HikingProject',
    'Singletracks',
    'RideWithGPS',
    'OpenStreetMap',
    'Google Maps Trailhead',
    'Google Maps Parking',
    'County/City Page',
    'Visitor Center Page',
    'Notes',
    'My Rating',
    'Google Images',
    'Favorite Status',
    'Google URL',
    'Google Place ID',
    'Hours of Operation',
    'State',
    'City',
    'Cost',
    'Directions'
  ];

  const columnIndex = BIKE_COLUMNS.reduce((acc, name, idx) => {
    acc[name] = idx;
    return acc;
  }, {});

  const state = {
    initialized: false,
    controlsBound: false,
    controlBindAttempts: 0,
    currentPage: 1,
    sortBy: 'name',
    sortAsc: true,
    groupBy: '',
    quickFilters: new Set(),
    showFavoritesOnly: false,
    selectedSourceIndexes: new Set(),
    bulkBusy: false,
    filters: {
      searchName: '',
      region: '',
      difficulty: '',
      surface: '',
      lengthBand: '',
      driveTimeBand: '',
      traffic: '',
      state: '',
      city: '',
      cost: '',
      hours: '',
      tag: ''
    }
  };
  const BULK_STATUS_CONFIRM_THRESHOLD = 20;
  const BIKE_ACTION_GUARD_DEFAULTS = {
    dedupeMs: 300,
    lockTimeoutMs: 8000
  };
  const bikeGuardFallback = {
    inFlight: new Map(),
    lastAt: new Map()
  };

  window.bikeTrailsData = window.bikeTrailsData || [];
  window.bikeFilteredTrails = window.bikeFilteredTrails || [];
  window.bikeTableConfig = {
    ...(window.bikeTableConfig || {}),
    filePath: BIKE_FILE_PATH_DEFAULT,
    tableName: BIKE_TABLE_NAME,
    tableNameCandidates: BIKE_TABLE_CANDIDATES
  };

  function readJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch (error) {
      return fallback;
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function norm(value) {
    return String(value || '').trim().toLowerCase();
  }

  function parseNumber(value) {
    const cleaned = String(value || '').replace(/[^0-9.-]/g, '');
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : 0;
  }

  function getBikeActionKey(target, explicitKey) {
    const key = String(explicitKey || '').trim();
    if (key) return key;
    if (target && target.id) return `id:${target.id}`;
    if (target && typeof target.getAttribute === 'function') {
      const attrs = ['data-bike-filter', 'data-bike-managed-tag', 'data-bike-source-index'];
      for (let i = 0; i < attrs.length; i += 1) {
        const value = target.getAttribute(attrs[i]);
        if (value != null) return `${attrs[i]}:${value}`;
      }
    }
    return `tag:${String(target && target.tagName || '').toLowerCase()}`;
  }

  async function withBikeActionGuard(target, action, options = {}) {
    const dedupeMs = Math.max(0, Number(options.dedupeMs) || BIKE_ACTION_GUARD_DEFAULTS.dedupeMs);
    const lockTimeoutMs = Math.max(1000, Number(options.lockTimeoutMs) || BIKE_ACTION_GUARD_DEFAULTS.lockTimeoutMs);
    const actionKey = getBikeActionKey(target, options.actionKey);

    if (window.ButtonActionGuard && typeof window.ButtonActionGuard.withActionGuard === 'function') {
      return window.ButtonActionGuard.withActionGuard({
        scope: 'bike-trails',
        target,
        action,
        dedupeMs,
        lockTimeoutMs,
        getActionKey: () => actionKey
      });
    }

    if (!target || target.disabled === true || (typeof target.getAttribute === 'function' && target.getAttribute('aria-disabled') === 'true') || (target.dataset && target.dataset.busy === '1')) {
      return false;
    }

    const now = Date.now();
    if (bikeGuardFallback.inFlight.get(actionKey)) return false;
    const lastAt = Number(bikeGuardFallback.lastAt.get(actionKey) || 0);
    if (now - lastAt < dedupeMs) return false;

    bikeGuardFallback.inFlight.set(actionKey, true);
    bikeGuardFallback.lastAt.set(actionKey, now);
    if (target.dataset) target.dataset.busy = '1';

    const safetyTimer = window.setTimeout(() => {
      bikeGuardFallback.inFlight.delete(actionKey);
      if (target.dataset) delete target.dataset.busy;
    }, lockTimeoutMs);

    try {
      await action();
      return true;
    } finally {
      clearTimeout(safetyTimer);
      bikeGuardFallback.inFlight.delete(actionKey);
      if (target.dataset) delete target.dataset.busy;
    }
  }

  function parseDriveMinutes(value) {
    const text = norm(value);
    if (!text) return 0;

    if (/^\d+$/.test(text)) return Number(text);

    const hourMatch = text.match(/(\d+(?:\.\d+)?)\s*h/);
    const minMatch = text.match(/(\d+(?:\.\d+)?)\s*m/);
    if (hourMatch || minMatch) {
      const hours = hourMatch ? Number(hourMatch[1]) : 0;
      const mins = minMatch ? Number(minMatch[1]) : 0;
      return Math.round((hours * 60) + mins);
    }

    const colonMatch = text.match(/^(\d{1,2}):(\d{2})$/);
    if (colonMatch) {
      return (Number(colonMatch[1]) * 60) + Number(colonMatch[2]);
    }

    return parseNumber(value);
  }

  function isTruthyFlag(value) {
    const text = norm(value);
    return ['yes', 'y', 'true', '1', 'available', 'nearby'].some(flag => text === flag || text.includes(flag));
  }

  function inBandLength(lengthMiles, band) {
    if (!band) return true;
    if (band === 'short') return Number(lengthMiles || 0) <= 10;
    if (band === 'medium') return Number(lengthMiles || 0) > 10 && Number(lengthMiles || 0) <= 25;
    if (band === 'long') return Number(lengthMiles || 0) > 25;
    return true;
  }

  function inBandDrive(minutes, band) {
    const mins = Number(minutes || 0);
    if (!band) return true;
    if (band === 'under30') return mins < 30;
    if (band === '30to60') return mins >= 30 && mins <= 60;
    if (band === 'over60') return mins > 60;
    return true;
  }

  function matchesQuickFilter(trail, filterKey) {
    const difficulty = norm(trail && trail.difficulty);
    const surface = norm(trail && trail.surface);

    if (filterKey === 'easy') return difficulty.includes('easy');
    if (filterKey === 'moderate') return difficulty.includes('moderate');
    if (filterKey === 'hard') return difficulty.includes('hard');
    if (filterKey === 'paved') return surface.includes('paved');
    if (filterKey === 'gravel') return surface.includes('gravel');
    if (filterKey === 'under30') return Number(trail && trail.driveMinutes) < 30;
    if (filterKey === 'low-elevation') {
      const elevation = Number(trail && trail.elevationGain);
      return elevation > 0 && elevation <= 500;
    }
    if (filterKey === 'family') {
      const text = `${trail && trail.vibes ? trail.vibes : ''} ${trail && trail.moodTags ? trail.moodTags : ''}`;
      return norm(text).includes('family');
    }
    if (filterKey === 'coffee') return isTruthyFlag(trail && trail.coffeeNearby);
    return true;
  }

  function normalizeColumnName(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[–—]/g, '-')
      .replace(/\s+/g, ' ');
  }

  function uniqueTagsCaseInsensitive(tags) {
    const seen = new Set();
    const out = [];
    (Array.isArray(tags) ? tags : []).forEach((tag) => {
      const value = String(tag || '').trim();
      const key = value.toLowerCase();
      if (!value || seen.has(key)) return;
      seen.add(key);
      out.push(value);
    });
    return out;
  }

  function getBikeTagKey(trail) {
    const placeId = String(trail?.googlePlaceId || '').trim();
    if (placeId) return placeId;
    const fallbackId = String(trail?.id || trail?.sourceIndex || '').trim();
    return `bike:${fallbackId || 'unknown'}`;
  }

  function getBikeManagedTags(trail) {
    const key = getBikeTagKey(trail);
    if (!key || !window.tagManager || typeof window.tagManager.getTagsForPlace !== 'function') return [];
    return uniqueTagsCaseInsensitive(window.tagManager.getTagsForPlace(key) || []);
  }

  function getBikeBaseTags(trail) {
    const moodTags = String(trail?.moodTags || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    return uniqueTagsCaseInsensitive([trail?.surface, trail?.difficulty, ...moodTags]);
  }

  function getBikeDisplayTags(trail) {
    return uniqueTagsCaseInsensitive([...getBikeBaseTags(trail), ...getBikeManagedTags(trail)]);
  }

  window.getBikeTagKey = getBikeTagKey;

  // ─── Notes serialization helpers ───────────────────────────────────────────
  // Format: NOTES_JSON_V1::[...json array...]
  // All notes are stored as a JSON array in a single spreadsheet cell.

  function parseBikeNotesBlob(raw) {
    const text = String(raw == null ? '' : raw).trim();
    if (!text) return [];
    let jsonPayload = '';
    if (text.startsWith(BIKE_NOTES_PREFIX)) {
      jsonPayload = text.slice(BIKE_NOTES_PREFIX.length).trim();
    } else if (text.startsWith('[') && text.endsWith(']')) {
      jsonPayload = text;
    }
    if (jsonPayload) {
      try {
        const parsed = JSON.parse(jsonPayload);
        if (Array.isArray(parsed)) {
          return parsed.map(n => String(n == null ? '' : n).trim()).filter(Boolean);
        }
      } catch (_) {}
    }
    // Legacy fallback: split by divider lines or double newlines
    const byDiv = text.split(/\n-{3,}\n/g).map(p => p.trim()).filter(Boolean);
    if (byDiv.length > 1) return byDiv;
    const byPara = text.split(/\n\s*\n/g).map(p => p.trim()).filter(Boolean);
    if (byPara.length > 1) return byPara;
    return [text];
  }

  function serializeBikeNotesBlob(notes) {
    const clean = (notes || []).map(n => String(n == null ? '' : n).trim()).filter(Boolean);
    return clean.length ? (BIKE_NOTES_PREFIX + JSON.stringify(clean)) : '';
  }

  function formatBikeNotesPreview(raw) {
    const notes = parseBikeNotesBlob(raw);
    if (!notes.length) return 'No notes yet...';
    const first = notes[0];
    const preview = first.length > 80 ? first.substring(0, 80) + '…' : first;
    return notes.length > 1 ? `${preview} (+${notes.length - 1} more)` : preview;
  }

  // Expose on window so bike-details-window.html can call them from opener
  window.getBikeColumnIndexByName = function(name) {
    return getBikeColumnIndex(name);
  };
  window.updateBikeTrailRowColumns = updateBikeRowColumns;
  // ─────────────────────────────────────────────────────────────────────────────

  function getExpectedColumnVariants(fieldName) {
    return [fieldName, ...(BIKE_COLUMN_ALIASES[fieldName] || [])];
  }

  function getBikeSchemaStatus(columnNames) {
    const actualList = Array.isArray(columnNames) ? columnNames : [];
    const actualNormalized = new Set(actualList.map(normalizeColumnName));
    const missing = BIKE_COLUMNS.filter((expected) => {
      return !getExpectedColumnVariants(expected).some((variant) => actualNormalized.has(normalizeColumnName(variant)));
    });
    const extra = actualList.filter((name) => {
      const normalized = normalizeColumnName(name);
      return !BIKE_COLUMNS.some((expected) => getExpectedColumnVariants(expected).some((variant) => normalizeColumnName(variant) === normalized));
    });

    return {
      missing,
      extra,
      columnCount: actualList.length,
      metadataReady: !missing.includes(BIKE_PREFERENCE_COLUMNS.rating) && !missing.includes(BIKE_PREFERENCE_COLUMNS.favorite)
    };
  }

  function updateBikeMetadataStatusLine(status, options = {}) {
    const line = document.getElementById('bikeMetadataStatusLine');
    if (!line) return;

    const palettes = {
      success: { bg: '#ecfdf5', border: '#a7f3d0', color: '#065f46' },
      warning: { bg: '#fffbeb', border: '#fcd34d', color: '#92400e' },
      error: { bg: '#fef2f2', border: '#fca5a5', color: '#991b1b' },
      info: { bg: '#eff6ff', border: '#93c5fd', color: '#1d4ed8' }
    };

    const palette = palettes[status] || palettes.info;
    const detailText = options.detail ? ` • ${options.detail}` : '';
    line.textContent = `${options.text || 'Excel metadata status unavailable'}${detailText}`;
    line.style.display = 'inline-flex';
    line.style.alignItems = 'center';
    line.style.gap = '8px';
    line.style.marginTop = '6px';
    line.style.padding = '6px 10px';
    line.style.borderRadius = '999px';
    line.style.border = `1px solid ${palette.border}`;
    line.style.background = palette.bg;
    line.style.color = palette.color;
    line.style.fontSize = '12px';
    line.style.fontWeight = '600';

    renderBikePreferenceFallbackBanner();
  }

  function getBikePreferenceFallbackState() {
    const params = new URLSearchParams(window.location.search || '');
    const inStandaloneExplorer = params.get('trailExplorerWindow') === '1' || params.get('trailExplorerWindow') === 'true';
    if (inStandaloneExplorer) {
      return { needsFallback: false, message: '' };
    }

    const ratingCol = getBikeWritableColumnIndex(BIKE_PREFERENCE_COLUMNS.rating);
    const favoriteCol = getBikeWritableColumnIndex(BIKE_PREFERENCE_COLUMNS.favorite);
    const missingColumns = [];
    if (ratingCol < 0) missingColumns.push(BIKE_PREFERENCE_COLUMNS.rating);
    if (favoriteCol < 0) missingColumns.push(BIKE_PREFERENCE_COLUMNS.favorite);

    const missingAuth = !window.accessToken;
    const needsFallback = missingAuth || missingColumns.length > 0;

    if (!needsFallback) return { needsFallback: false, message: '' };

    if (missingAuth && missingColumns.length) {
      return {
        needsFallback: true,
        message: `Preferences are using local fallback (not signed in + missing mapped columns: ${missingColumns.join(', ')}).`
      };
    }

    if (missingAuth) {
      return {
        needsFallback: true,
        message: 'Preferences are using local fallback until you sign in to Excel.'
      };
    }

    return {
      needsFallback: true,
      message: `Preferences are using local fallback (missing mapped columns: ${missingColumns.join(', ')}).`
    };
  }

  function renderBikePreferenceFallbackBanner() {
    const statusLine = document.getElementById('bikeMetadataStatusLine');
    if (!statusLine || !statusLine.parentElement) return;

    const host = statusLine.parentElement;
    let banner = document.getElementById('bikePreferenceFallbackBanner');
    const fallback = getBikePreferenceFallbackState();

    if (!fallback.needsFallback) {
      if (banner) banner.remove();
      return;
    }

    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'bikePreferenceFallbackBanner';
      banner.style.marginTop = '8px';
      banner.style.fontSize = '12px';
      banner.style.lineHeight = '1.45';
      banner.style.padding = '8px 10px';
      banner.style.borderRadius = '8px';
      banner.style.border = '1px solid #fcd34d';
      banner.style.background = '#fffbeb';
      banner.style.color = '#92400e';
      host.appendChild(banner);
    }

    banner.textContent = `⚠️ ${fallback.message}`;
  }

  function updateBikeDebugDetailsLine(options = {}) {
    const debugLine = document.getElementById('bikeMetadataDebugLine');
    if (!debugLine) return;

    const config = window.bikeTableConfig || {};
    const filePath = options.filePath || config.filePath || BIKE_FILE_PATH_DEFAULT;
    const tableName = options.tableName || config.tableName || BIKE_TABLE_NAME;
    const tableRef = options.tableRef || config.tableRef || tableName;

    debugLine.textContent = `Debug: file=${filePath} | tableName=${tableName} | tableRef=${tableRef}`;
    debugLine.style.display = 'block';
    debugLine.style.marginTop = '6px';
    debugLine.style.fontSize = '11px';
    debugLine.style.color = '#6b7280';
    debugLine.style.wordBreak = 'break-all';
  }

  function getBikeFilterInputId(filterKey) {
    const map = {
      searchName: 'bikeSearchName',
      region: 'bikeFilterRegion',
      difficulty: 'bikeFilterDifficulty',
      surface: 'bikeFilterSurface',
      lengthBand: 'bikeFilterLengthBand',
      driveTimeBand: 'bikeFilterDriveTimeBand',
      traffic: 'bikeFilterTraffic',
      state: 'bikeFilterState',
      city: 'bikeFilterCity',
      cost: 'bikeFilterCost',
      hours: 'bikeFilterHours',
      tag: 'bikeFilterTag',
      groupBy: 'bikeGroupBy'
    };
    return map[filterKey] || '';
  }

  function getBikeFilterChipLabel(filterKey, value) {
    const labels = {
      searchName: 'Name',
      region: 'Region',
      difficulty: 'Difficulty',
      surface: 'Surface',
      lengthBand: 'Length',
      driveTimeBand: 'Drive',
      traffic: 'Traffic',
      state: 'State',
      city: 'City',
      cost: 'Cost',
      hours: 'Hours',
      tag: 'Tag',
      groupBy: 'Group By'
    };

    const valueLabels = {
      lengthBand: { short: 'Short', medium: 'Medium', long: 'Long' },
      driveTimeBand: { under30: 'Under 30', '30to60': '30-60', over60: 'Over 60' }
    };

    const prettyValue = valueLabels[filterKey]?.[value] || value;
    return `${labels[filterKey] || filterKey}: ${prettyValue}`;
  }

  function clearBikeFilterChip(filterKey, value) {
    if (filterKey === 'favorites') {
      state.showFavoritesOnly = false;
      const favoritesBtn = document.getElementById('bikeFavoritesFilterBtn');
      if (favoritesBtn) favoritesBtn.classList.remove('active');
      window.applyBikeFilters();
      return;
    }

    if (filterKey === 'quick') {
      state.quickFilters.delete(value);
      document.querySelectorAll(`#bikeQuickFiltersCard .quick-filter-btn[data-bike-filter="${value}"]`).forEach((btn) => {
        btn.classList.remove('active');
      });
      window.applyBikeFilters();
      return;
    }

    if (filterKey === 'groupBy') {
      state.groupBy = '';
      const groupBy = document.getElementById('bikeGroupBy');
      if (groupBy) groupBy.value = '';
      window.applyBikeFilters();
      return;
    }

    state.filters[filterKey] = '';
    const inputId = getBikeFilterInputId(filterKey);
    const input = inputId ? document.getElementById(inputId) : null;
    if (input) input.value = '';
    window.applyBikeFilters();
  }

  function renderBikeBreadcrumbChips() {
    const menu = document.getElementById('bikeBreadcrumbFilterMenu');
    const container = document.getElementById('bikeBreadcrumbContainer');
    if (!menu || !container) return;

    const chips = [];

    Object.entries(state.filters).forEach(([key, value]) => {
      if (!value) return;
      chips.push({ key, value, label: getBikeFilterChipLabel(key, value) });
    });

    if (state.groupBy) {
      chips.push({ key: 'groupBy', value: state.groupBy, label: getBikeFilterChipLabel('groupBy', state.groupBy) });
    }

    if (state.showFavoritesOnly) {
      chips.push({ key: 'favorites', value: '1', label: 'Favorites Only' });
    }

    Array.from(state.quickFilters).forEach((quick) => {
      chips.push({ key: 'quick', value: quick, label: `Quick: ${quick}` });
    });

    if (!chips.length) {
      container.innerHTML = '';
      menu.style.display = 'none';
      return;
    }

    container.innerHTML = chips.map((chip) => {
      return `<button type="button" class="pill-button" data-bike-chip-key="${escapeHtml(chip.key)}" data-bike-chip-value="${escapeHtml(chip.value)}" style="margin-right:6px; margin-bottom:6px;">${escapeHtml(chip.label)} ×</button>`;
    }).join('');

    menu.style.display = 'flex';
    container.querySelectorAll('[data-bike-chip-key]').forEach((btn) => {
      btn.addEventListener('click', () => {
        clearBikeFilterChip(btn.dataset.bikeChipKey || '', btn.dataset.bikeChipValue || '');
      });
    });
  }

  function renderBikeManagedTagQuickChips() {
    const container = document.getElementById('bikeManagedTagQuickFilters');
    const dataList = document.getElementById('bikeTagList');
    if (!container) return;

    const trails = getAllBikeTrails();
    const tagCounts = new Map();

    trails.forEach((trail) => {
      // Include all display tags: base tags (surface, difficulty, mood) + managed tags
      getBikeDisplayTags(trail).forEach((tag) => {
        const label = String(tag || '').trim();
        if (!label) return;
        const key = label.toLowerCase();
        const entry = tagCounts.get(key);
        if (entry) {
          entry.count += 1;
        } else {
          tagCounts.set(key, { label, count: 1 });
        }
      });
    });

    const topTags = Array.from(tagCounts.values())
      .sort((a, b) => (b.count - a.count) || a.label.localeCompare(b.label))
      .slice(0, 8);

    if (dataList) {
      const allTags = Array.from(tagCounts.values()).sort((a, b) => a.label.localeCompare(b.label));
      dataList.innerHTML = allTags.map((entry) => `<option value="${escapeHtml(entry.label)}"></option>`).join('');
    }

    if (!topTags.length) {
      container.innerHTML = '<span style="font-size:12px;color:#6b7280;">Add some bike tags to see quick tag filters here.</span>';
      return;
    }

    const activeTag = norm(state.filters.tag);
    container.innerHTML = topTags.map((entry) => {
      const isActive = activeTag && activeTag === norm(entry.label);
      const tooltip = `Used on ${entry.count} trail${entry.count === 1 ? '' : 's'}`;
      return `<button type="button" class="quick-filter-btn${isActive ? ' active' : ''}" aria-pressed="${isActive ? 'true' : 'false'}" data-bike-managed-tag="${escapeHtml(entry.label)}" title="${escapeHtml(tooltip)}" data-tooltip="${escapeHtml(tooltip)}">🏷️ ${escapeHtml(entry.label)} <span class="quick-filter-count">(${entry.count})</span></button>`;
    }).join('');
  }

  function setBikeQuickFilterButtonState(btn, isActive) {
    if (!btn) return;
    const active = Boolean(isActive);
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  }

  function syncBikeQuickFilterButtonsFromState() {
    document.querySelectorAll('#bikeQuickFiltersCard .quick-filter-btn[data-bike-filter]').forEach((btn) => {
      const key = String(btn.getAttribute('data-bike-filter') || '').trim();
      if (!key) return;
      const isActive = key === 'favorites' ? state.showFavoritesOnly : state.quickFilters.has(key);
      setBikeQuickFilterButtonState(btn, isActive);
    });
  }

  function handleBikeQuickFilterButtonActivate(btn) {
    if (!btn) return;
    const key = String(btn.getAttribute('data-bike-filter') || '').trim();
    if (!key) return;

    if (key === 'favorites') {
      state.showFavoritesOnly = !state.showFavoritesOnly;
    } else if (state.quickFilters.has(key)) {
      state.quickFilters.delete(key);
    } else {
      state.quickFilters.add(key);
    }

    state.currentPage = 1;
    syncBikeQuickFilterButtonsFromState();
    applyBikeFilters();
  }

  function cacheBikeQuickFilterBaseLabels() {
    document.querySelectorAll('#bikeQuickFiltersCard .quick-filter-btn[data-bike-filter]').forEach((btn) => {
      if (btn.dataset.baseLabel) return;
      btn.dataset.baseLabel = String(btn.textContent || '').replace(/\s*\([^)]*\)\s*$/, '').trim();
    });
  }

  function matchesBikeBaseFiltersExcludingQuick(trail) {
    if (state.filters.searchName) {
      const haystack = [trail.name, trail.region, trail.city, trail.vibes, trail.moodTags].map(norm).join(' ');
      if (!haystack.includes(norm(state.filters.searchName))) return false;
    }
    if (state.filters.region && !norm(trail.region).includes(norm(state.filters.region))) return false;
    if (state.filters.difficulty && !norm(trail.difficulty).includes(norm(state.filters.difficulty))) return false;
    if (state.filters.surface && !norm(trail.surface).includes(norm(state.filters.surface))) return false;
    if (state.filters.traffic && !norm(trail.traffic).includes(norm(state.filters.traffic))) return false;
    if (state.filters.state && !norm(trail.state).includes(norm(state.filters.state))) return false;
    if (state.filters.city && !norm(trail.city).includes(norm(state.filters.city))) return false;
    if (state.filters.cost && !norm(trail.cost).includes(norm(state.filters.cost))) return false;
    if (state.filters.hours && !norm(trail.hours).includes(norm(state.filters.hours))) return false;
    if (state.filters.tag) {
      const allTags = getBikeDisplayTags(trail).map(norm);
      const needle = norm(state.filters.tag);
      if (!allTags.some((tag) => tag.includes(needle))) return false;
    }
    if (!inBandLength(trail.lengthMiles, state.filters.lengthBand)) return false;
    if (!inBandDrive(trail.driveMinutes, state.filters.driveTimeBand)) return false;
    return true;
  }

  function renderBikeStaticQuickFilterCounts() {
    cacheBikeQuickFilterBaseLabels();
    const trails = getAllBikeTrails();

    document.querySelectorAll('#bikeQuickFiltersCard .quick-filter-btn[data-bike-filter]').forEach((btn) => {
      const key = String(btn.getAttribute('data-bike-filter') || '').trim();
      const baseLabel = btn.dataset.baseLabel || String(btn.textContent || '').replace(/\s*\([^)]*\)\s*$/, '').trim();
      if (!key) {
        btn.textContent = baseLabel;
        return;
      }

      const count = trails.reduce((total, trail) => {
        if (!matchesBikeBaseFiltersExcludingQuick(trail)) return total;
        if (key === 'favorites') return total + (trail.isFavorite ? 1 : 0);
        return total + (matchesQuickFilter(trail, key) ? 1 : 0);
      }, 0);

      btn.textContent = '';
      btn.append(document.createTextNode(baseLabel + ' '));
      const countSpan = document.createElement('span');
      countSpan.className = 'quick-filter-count';
      countSpan.textContent = `(${count})`;
      btn.append(countSpan);
    });
  }

  function getAllBikeTrails() {
    const rows = window.bikeTrailsData || [];
    return rows.map((row, idx) => trailModel(row, idx));
  }

  function parseBulkTagsInput(raw) {
    const seen = new Set();
    return String(raw || '')
      .split(',')
      .map((part) => String(part || '').trim())
      .filter((tag) => {
        const key = tag.toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  function getVisibleBikeSourceIndexSet() {
    const out = new Set();
    const trails = Array.isArray(window.bikeFilteredTrails) ? window.bikeFilteredTrails : [];
    trails.forEach((trail) => {
      const idx = Number(trail && trail.sourceIndex);
      if (Number.isInteger(idx) && idx >= 0) out.add(idx);
    });
    return out;
  }

  function getCurrentBikePageSourceIndexSet() {
    const out = new Set();
    const all = Array.isArray(window.bikeFilteredTrails) ? window.bikeFilteredTrails : [];
    const startIdx = (state.currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = all.slice(startIdx, startIdx + ITEMS_PER_PAGE);
    pageItems.forEach((trail) => {
      const idx = Number(trail && trail.sourceIndex);
      if (Number.isInteger(idx) && idx >= 0) out.add(idx);
    });
    return out;
  }

  function getBikeSelectionScope() {
    const scopeSelect = document.getElementById('bikeBulkSelectionScope');
    return String(scopeSelect && scopeSelect.value ? scopeSelect.value : 'filtered').trim().toLowerCase() === 'page'
      ? 'page'
      : 'filtered';
  }

  function getBikeSelectionScopeLabel() {
    return getBikeSelectionScope() === 'page' ? 'Current Page' : 'Filtered Results';
  }

  function getBikeCopySourceMode() {
    const select = document.getElementById('bikeBulkCopySourceMode');
    return String(select && select.value ? select.value : 'first').trim().toLowerCase() === 'union'
      ? 'union'
      : 'first';
  }

  function getBikeCopyMergeMode() {
    const select = document.getElementById('bikeBulkCopyMergeMode');
    return String(select && select.value ? select.value : 'append').trim().toLowerCase() === 'replace'
      ? 'replace'
      : 'append';
  }

  function getBikeScopeSourceIndexSet() {
    return getBikeSelectionScope() === 'page'
      ? getCurrentBikePageSourceIndexSet()
      : getVisibleBikeSourceIndexSet();
  }

  function pruneBikeSelectionToVisible() {
    const visible = getVisibleBikeSourceIndexSet();
    Array.from(state.selectedSourceIndexes).forEach((idx) => {
      if (!visible.has(idx)) state.selectedSourceIndexes.delete(idx);
    });
  }

  function updateBikeBulkSelectionUi() {
    const count = state.selectedSourceIndexes.size;
    const pageSet = getCurrentBikePageSourceIndexSet();
    const pageSelectedCount = Array.from(state.selectedSourceIndexes).reduce((total, idx) => {
      return total + (pageSet.has(idx) ? 1 : 0);
    }, 0);
    const countEl = document.getElementById('bikeBulkSelectionCount');
    if (countEl) countEl.textContent = `${pageSelectedCount} on page / ${count} total selected`;

    const disable = count === 0 || state.bulkBusy;
    ['bikeBulkApplyTagsBtn', 'bikeBulkCopyTagsBtn', 'bikeBulkApplyRatingBtn', 'bikeBulkMarkFavoriteBtn', 'bikeBulkUnmarkFavoriteBtn', 'bikeBulkMarkVisitedBtn', 'bikeBulkUnmarkVisitedBtn', 'bikeBulkClearSelectionBtn'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.disabled = disable;
    });

    const invertBtn = document.getElementById('bikeBulkInvertSelectionBtn');
    if (invertBtn) {
      const sourceSet = getBikeScopeSourceIndexSet();
      invertBtn.disabled = state.bulkBusy || sourceSet.size === 0;
    }

    document.querySelectorAll('.bike-bulk-select').forEach((checkbox) => {
      const raw = String(checkbox.getAttribute('data-bike-source-index') || '').trim();
      const idx = /^\d+$/.test(raw) ? Number(raw) : NaN;
      checkbox.checked = Number.isInteger(idx) && state.selectedSourceIndexes.has(idx);
      checkbox.disabled = state.bulkBusy;
    });
  }

  function setBikeBulkBusy(isBusy) {
    state.bulkBusy = Boolean(isBusy);
    const selectVisibleBtn = document.getElementById('bikeBulkSelectVisibleBtn');
    if (selectVisibleBtn) selectVisibleBtn.disabled = state.bulkBusy;
    updateBikeBulkSelectionUi();
  }

  function setBikeSelectionFromScope() {
    state.selectedSourceIndexes.clear();
    const sourceSet = getBikeScopeSourceIndexSet();
    sourceSet.forEach((idx) => state.selectedSourceIndexes.add(idx));
    updateBikeBulkSelectionUi();
  }

  function invertBikeSelectionFromScope() {
    const sourceSet = getBikeScopeSourceIndexSet();
    if (!sourceSet.size) {
      showToast?.('No trails available in this scope.', 'info', 2000);
      return;
    }

    sourceSet.forEach((idx) => {
      if (state.selectedSourceIndexes.has(idx)) state.selectedSourceIndexes.delete(idx);
      else state.selectedSourceIndexes.add(idx);
    });
    updateBikeBulkSelectionUi();
    showToast?.(`Selection inverted for ${getBikeSelectionScopeLabel()}.`, 'info', 2000);
  }

  function clearBikeSelection() {
    state.selectedSourceIndexes.clear();
    updateBikeBulkSelectionUi();
  }

  function setBikeCardSelected(sourceIndex, isSelected) {
    if (!Number.isInteger(sourceIndex) || sourceIndex < 0) return;
    if (isSelected) state.selectedSourceIndexes.add(sourceIndex);
    else state.selectedSourceIndexes.delete(sourceIndex);
    updateBikeBulkSelectionUi();
  }

  function syncBikeBulkSelectButtonLabel() {
    const selectBtn = document.getElementById('bikeBulkSelectVisibleBtn');
    const invertBtn = document.getElementById('bikeBulkInvertSelectionBtn');
    const hintEl = document.getElementById('bikeBulkSelectionScopeHint');
    if (!selectBtn) return;
    const scope = getBikeSelectionScope();
    selectBtn.textContent = scope === 'page' ? 'Select Page' : 'Select Filtered';
    if (invertBtn) invertBtn.textContent = scope === 'page' ? 'Invert Page' : 'Invert Filtered';
    if (hintEl) {
      const hintTextEl = hintEl.querySelector('.bulk-scope-hint-text');
      const nextText = scope === 'page'
        ? 'Selection applies to the current page only.'
        : 'Selection applies to all filtered results.';
      if (hintTextEl) hintTextEl.textContent = nextText;
      else hintEl.textContent = nextText;
    }
  }

  function getBikeColumnIndex(fieldName) {
    const config = window.bikeTableConfig || {};
    const direct = config.columnIndexByName?.[fieldName];
    if (Number.isInteger(direct)) return direct;

    const normalizedLookup = config.columnIndexByNormalizedName || {};
    for (const variant of getExpectedColumnVariants(fieldName)) {
      const idx = normalizedLookup[normalizeColumnName(variant)];
      if (Number.isInteger(idx)) return idx;
    }

    const fallback = columnIndex[fieldName];
    return Number.isInteger(fallback) ? fallback : -1;
  }

  // For writes, only use indexes discovered from live workbook schema.
  // This avoids writing to the wrong column when schema order drifts.
  function getBikeWritableColumnIndex(fieldName) {
    const config = window.bikeTableConfig || {};
    const direct = config.columnIndexByName?.[fieldName];
    if (Number.isInteger(direct)) return direct;

    const normalizedLookup = config.columnIndexByNormalizedName || {};
    for (const variant of getExpectedColumnVariants(fieldName)) {
      const idx = normalizedLookup[normalizeColumnName(variant)];
      if (Number.isInteger(idx)) return idx;
    }

    return -1;
  }

  const bikePreferenceCache = {
    ratings: null,
    favorites: null
  };

  function getBikeLegacyPreferenceSnapshot() {
    if (!bikePreferenceCache.ratings) bikePreferenceCache.ratings = readJson('bikeTrailRatings', {});
    if (!bikePreferenceCache.favorites) bikePreferenceCache.favorites = new Set(readJson('bikeTrailFavorites', []));
    return {
      ratings: bikePreferenceCache.ratings,
      favorites: bikePreferenceCache.favorites
    };
  }

  function invalidateBikeLegacyPreferenceSnapshot() {
    bikePreferenceCache.ratings = null;
    bikePreferenceCache.favorites = null;
  }

  function cacheBikeTableSchema(columnNames) {
    const names = Array.isArray(columnNames)
      ? columnNames.map((name) => String(name || '').trim()).filter(Boolean)
      : [];

    const byName = {};
    const byNormalized = {};
    names.forEach((name, idx) => {
      byName[name] = idx;
      byNormalized[normalizeColumnName(name)] = idx;
    });

    window.bikeTableConfig = {
      ...(window.bikeTableConfig || {}),
      filePath: BIKE_FILE_PATH_DEFAULT,
      tableName: window.bikeTableConfig?.tableName || BIKE_TABLE_NAME,
      tableRef: window.bikeTableConfig?.tableRef || window.bikeTableConfig?.tableName || BIKE_TABLE_NAME,
      tableNameCandidates: BIKE_TABLE_CANDIDATES,
      columnNames: names,
      columnIndexByName: byName,
      columnIndexByNormalizedName: byNormalized
    };
  }

  function isBikeFavoriteFlag(value) {
    const text = norm(value);
    return text === 'true' || text === '1' || text === 'yes' || text === 'favorite' || text === 'favorited';
  }

  function getValues(row) {
    if (!row) return [];
    if (Array.isArray(row.values)) {
      return Array.isArray(row.values[0]) ? row.values[0] : row.values;
    }
    return [];
  }

  function getField(row, fieldName) {
    const values = getValues(row);
    const idx = getBikeColumnIndex(fieldName);
    return idx >= 0 ? (values[idx] || '') : '';
  }


  // ─── Bike data loading orchestrator ────────────────────────────────────────
  // loadBikeData is the single entry-point that:
  //   1. Loads & caches the table schema (column names → indexes)
  //   2. Ensures the two preference columns exist (adds them if missing)
  //   3. Fetches all rows and stores them in window.bikeTrailsData
  //   4. Migrates any legacy localStorage prefs to Excel (once)
  //   5. Calls applyBikeFilters() to render the cards
  // ─── Diagnostic helpers ──────────────────────────────────────────────────────

  /** Fetch all table names that exist inside a workbook. Returns [] on failure. */
  async function listWorkbookTables(token, filePath) {
    const encodedPath = encodeGraphPath(filePath);
    const url = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/workbook/tables`;
    console.log('[bike-trails] Listing all tables in workbook:', url);
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!res.ok) {
        console.warn(`[bike-trails] Could not list workbook tables (${res.status}). The workbook may not exist at this path.`);
        return [];
      }
      const json = await res.json();
      return (json.value || []).map((t) => t.name).filter(Boolean);
    } catch (e) {
      console.warn('[bike-trails] listWorkbookTables error:', e.message);
      return [];
    }
  }

  /** List xlsx files inside the folder that contains filePath. Returns [] on failure. */
  async function listFolderFiles(token, filePath) {
    const parts = filePath.split('/').filter(Boolean);
    parts.pop(); // remove filename
    if (!parts.length) return [];
    const folderPath = parts.join('/');
    const encodedFolder = encodeGraphPath(folderPath);
    const url = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedFolder}:/children`;
    console.log('[bike-trails] Listing folder contents:', url);
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!res.ok) {
        console.warn(`[bike-trails] Could not list folder (${res.status}):`, folderPath);
        return [];
      }
      const json = await res.json();
      return (json.value || []).map((f) => f.name).filter(Boolean);
    } catch (e) {
      console.warn('[bike-trails] listFolderFiles error:', e.message);
      return [];
    }
  }

  /** Show a persistent banner inside the bike tab so the user can correct the path. */
  function showBikeConfigBanner(message, detail) {
    const grid = document.getElementById('bikeTrailsCardsGrid');
    if (!grid) return;

    const existing = document.getElementById('bikeConfigBanner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'bikeConfigBanner';
    banner.style.cssText = `
      grid-column: 1 / -1;
      padding: 20px;
      background: #fff7ed;
      border: 2px solid #f97316;
      border-radius: 10px;
      font-size: 14px;
      line-height: 1.6;
    `;
    banner.innerHTML = `
      <div style="font-size:16px; font-weight:700; color:#c2410c; margin-bottom:8px;">⚠️ Bike Trail Excel File Not Found</div>
      <div style="color:#374151; margin-bottom:12px;">${message}</div>
      ${detail ? `<pre style="background:#fee2e2; border-radius:6px; padding:10px; font-size:12px; overflow-x:auto; color:#7f1d1d;">${detail}</pre>` : ''}
      <div style="margin-top:14px; color:#374151; font-size:13px;">
        <strong>To fix this:</strong><br>
        1. Make sure <code>Bike_Trail_Planner.xlsx</code> is uploaded to your OneDrive under:<br>
        &nbsp;&nbsp;&nbsp;<code>Copilot_Apps/Kyles_Adventure_Finder/</code><br>
        2. Or run this in the browser console to point to the correct file:<br>
        <code style="display:block; margin-top:6px; padding:6px; background:#f3f4f6; border-radius:4px;">
          window.setBikeConfig({ filePath: 'Your/Path/File.xlsx', tableName: 'TableName' })
        </code>
        3. Then click <strong>🔄 Refresh Data</strong> to retry.
      </div>
    `;
    grid.innerHTML = '';
    grid.appendChild(banner);
  }

  // ─── Schema resolver with full diagnostics ──────────────────────────────────
  async function resolveSchemaTableRef(token, filePath, primaryRef) {
    // Build full candidate list – start with primary, then fallbacks
    const allCandidates = [
      primaryRef,
      ...BIKE_TABLE_CANDIDATES.filter((c) => c !== primaryRef)
    ];

    for (const candidate of allCandidates) {
      const encodedPath = encodeGraphPath(filePath);
      const url = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/workbook/tables/${encodeURIComponent(candidate)}/columns`;
      console.log(`[bike-trails] Trying table schema: ${url}`);
      try {
        await loadBikeTableSchema(token, filePath, candidate);
        if (candidate !== primaryRef) {
          console.log(`[bike-trails] ✅ Resolved table as '${candidate}' (fallback)`);
        }
        return candidate;
      } catch (e) {
        console.warn(`[bike-trails] Table '${candidate}' not found: ${e.message}`);
      }
    }

    // ── All named candidates failed. Try enumerating workbook tables ──────────
    console.warn('[bike-trails] All named candidates failed. Querying workbook for available tables…');
    const availableTables = await listWorkbookTables(token, filePath);

    if (availableTables.length > 0) {
      console.log('[bike-trails] Tables found in workbook:', availableTables);
      // Automatically try the first available table
      try {
        await loadBikeTableSchema(token, filePath, availableTables[0]);
        console.log(`[bike-trails] ✅ Auto-resolved table as '${availableTables[0]}' (enumerated)`);
        window.bikeTableConfig = {
          ...(window.bikeTableConfig || {}),
          tableRef: availableTables[0],
          tableName: availableTables[0]
        };
        return availableTables[0];
      } catch (e) {
        console.warn(`[bike-trails] Even enumerated table '${availableTables[0]}' failed:`, e.message);
      }
    } else {
      // Workbook itself likely 404 – show folder listing to confirm
      const files = await listFolderFiles(token, filePath);
      const detail = files.length
        ? `Files found in that folder:\n  ${files.join('\n  ')}`
        : `Folder not found either. Check that the path is correct in OneDrive.`;

      console.error('[bike-trails] Workbook not accessible. ' + detail);
      showBikeConfigBanner(
        `The app looked for the file at:<br><code>${filePath}</code><br><br>
         ${files.length
           ? `That folder exists but these are the files inside it:<br><strong>${files.join(', ')}</strong>`
           : `That folder was also not found. Make sure the folder structure exists in your OneDrive.`}`,
        availableTables.length ? `Available tables: ${availableTables.join(', ')}` : null
      );
    }

    return null;
  }

  async function loadBikeData() {
    const token = window.accessToken;
    const config = window.bikeTableConfig || {};
    const filePath = config.filePath || BIKE_FILE_PATH_DEFAULT;

    if (!token) {
      updateBikeMetadataStatusLine('warning', {
        text: 'Sign in to load Bike Trail data',
        detail: BIKE_FILE_NAME
      });
      renderBikePreferenceFallbackBanner();
      return false;
    }

    updateBikeMetadataStatusLine('info', { text: 'Loading Bike Trail data…', detail: BIKE_FILE_NAME });

    // Step 1 – resolve the real table name (BikeTrails or first available)
    const primaryRef = config.tableRef || config.tableName || BIKE_TABLE_NAME;
    const tableRef = await resolveSchemaTableRef(token, filePath, primaryRef);

    if (!tableRef) {
      const msg = `Could not find a usable table in ${filePath}. See the banner in the Bike Trails tab for details.`;
      console.error('[bike-trails]', msg);
      console.error('[bike-trails] Debug: Expected file path:', filePath);
      console.error('[bike-trails] Debug: Please verify the file exists in OneDrive at the specified path');
      updateBikeMetadataStatusLine('error', {
        text: 'Bike Trail Excel file/table not found',
        detail: msg
      });
      renderBikePreferenceFallbackBanner();
      return false;
    }

    if (tableRef !== primaryRef) {
      window.bikeTableConfig = { ...(window.bikeTableConfig || {}), tableRef, tableName: tableRef };
    }

    try {
      // Step 2 – ensure preference columns (adds them when absent)
      try {
        await ensureBikePreferenceColumns(token, filePath, tableRef, 0);
      } catch (prefErr) {
        console.warn('[bike-trails] Could not ensure preference columns:', prefErr.message);
      }

      // Step 3 – fetch all rows
      const rows = await fetchBikeRows(token, filePath, tableRef);
      window.bikeTrailsData = rows;
      console.log(`✅ [bike-trails] Loaded ${rows.length} rows from ${filePath} / ${tableRef}`);

      // Step 4 – migrate legacy localStorage prefs (fire-and-forget)
      migrateLegacyBikePreferencesToExcel(token, filePath, tableRef).catch(() => {});

      // Step 5 – render
      applyBikeFilters();

      // Remove any config error banner
      document.getElementById('bikeConfigBanner')?.remove();

      updateBikeMetadataStatusLine('success', {
        text: `${rows.length} bike trails loaded`,
        detail: `${filePath} / ${tableRef}`
      });
      renderBikePreferenceFallbackBanner();

      return true;
    } catch (err) {
      console.error('[bike-trails] loadBikeData failed:', err.message);
      updateBikeMetadataStatusLine('error', {
        text: 'Failed to load Bike Trail data',
        detail: err.message
      });
      renderBikePreferenceFallbackBanner();
      return false;
    }
  }
  // ────────────────────────────────────────────────────────────────────────────

  async function fetchBikeRows(accessToken, filePath, tableRef) {
    const encodedPath = encodeGraphPath(filePath);
    const apiUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/workbook/tables/${encodeURIComponent(tableRef)}/rows`;

    const run = async () => {
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Bike trail load failed for ${BIKE_FILE_NAME} / ${tableRef}: ${response.status} ${response.statusText}`);
      }

      const json = await response.json();
      const rows = Array.isArray(json.value) ? json.value : [];

      return rows.map((row, index) => ({
        values: [Array.isArray(row.values?.[0]) ? row.values[0] : []],
        rowId: row.id,
        index
      }));
    };

    if (window.ReliabilityAsync && typeof window.ReliabilityAsync.retryRead === 'function') {
      return window.ReliabilityAsync.retryRead('Bike rows read', run, { retries: 2, backoffMs: 350 });
    }
    return run();
  }

  async function loadBikeTableSchema(accessToken, filePath, tableRef) {
    const encodedPath = encodeGraphPath(filePath);
    const schemaUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/workbook/tables/${encodeURIComponent(tableRef)}/columns`;

    const run = async () => {
      const response = await fetch(schemaUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Unable to load schema for bike table '${tableRef}' (${response.status} ${response.statusText})`);
      }

      const json = await response.json();
      const columnNames = (json.value || []).map((item) => item.name).filter(Boolean);
      cacheBikeTableSchema(columnNames);
      updateBikeDebugDetailsLine({ filePath, tableName: window.bikeTableConfig?.tableName || BIKE_TABLE_NAME, tableRef });

      const schemaStatus = getBikeSchemaStatus(columnNames);
      if (schemaStatus.missing.length === 0) {
        updateBikeMetadataStatusLine('success', {
          text: 'Excel metadata columns: My Rating / Favorite Status ready',
          detail: `Schema aligned (${schemaStatus.columnCount} columns)`
        });
      } else {
        updateBikeMetadataStatusLine('warning', {
          text: 'Excel metadata columns need review',
          detail: `Missing: ${schemaStatus.missing.join(', ')}`
        });
      }

      return columnNames;
    };

    if (window.ReliabilityAsync && typeof window.ReliabilityAsync.retryRead === 'function') {
      return window.ReliabilityAsync.retryRead('Bike schema read', run, { retries: 2, backoffMs: 350 });
    }
    return run();
  }

  async function addBikeTableColumn(accessToken, filePath, tableRef, columnName, rowCount) {
    const encodedPath = encodeGraphPath(filePath);
    const baseUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/workbook/tables/${encodeURIComponent(tableRef)}`;
    const values = [[columnName], ...Array.from({ length: rowCount }, () => [''])];
    const payload = { index: null, values };

    const attempts = [`${baseUrl}/columns/add`, `${baseUrl}/columns`];
    let lastError = 'Unknown error';

    for (const url of attempts) {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) return true;
      const detail = await response.text().catch(() => response.statusText || '');
      lastError = `${response.status} ${detail || response.statusText}`;
    }

    throw new Error(`Unable to add bike metadata column '${columnName}' to ${tableRef}: ${lastError}`);
  }

  async function ensureBikePreferenceColumns(accessToken, filePath, tableRef, rowCount) {
    const existingColumns = await loadBikeTableSchema(accessToken, filePath, tableRef);
    const normalized = new Set(existingColumns.map(normalizeColumnName));

    const missing = Object.values(BIKE_PREFERENCE_COLUMNS).filter((name) => {
      return !getExpectedColumnVariants(name).some((variant) => normalized.has(normalizeColumnName(variant)));
    });

    if (!missing.length) return false;

    for (const columnName of missing) {
      await addBikeTableColumn(accessToken, filePath, tableRef, columnName, rowCount);
    }

    await loadBikeTableSchema(accessToken, filePath, tableRef);
    return true;
  }

  async function updateBikeRowColumns(sourceIndex, updatesByColumnIndex, options = {}) {
    const accessToken = options.accessToken || window.accessToken;
    const filePath = options.filePath || window.bikeTableConfig?.filePath || BIKE_FILE_PATH_DEFAULT;
    const tableRef = options.tableRef || window.bikeTableConfig?.tableRef || window.bikeTableConfig?.tableName || BIKE_TABLE_NAME;
    const row = window.bikeTrailsData?.[sourceIndex];

    if (!accessToken) throw new Error('Please sign in to update bike trail preferences in Excel.');
    if (!row) throw new Error(`Bike trail row ${sourceIndex} not found.`);

    const values = getValues(row).slice();
    const updateIndexes = Object.keys(updatesByColumnIndex).map((idx) => Number(idx)).filter(Number.isInteger);
    const maxIndex = Math.max(values.length - 1, ...updateIndexes);
    while (values.length <= maxIndex) values.push('');

    Object.entries(updatesByColumnIndex).forEach(([idx, value]) => {
      values[Number(idx)] = value;
    });

    const encodedPath = encodeGraphPath(filePath);
    const rowUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/workbook/tables/${encodeURIComponent(tableRef)}/rows/itemAt(index=${sourceIndex})`;
    const run = async () => {
      const response = await fetch(rowUrl, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values: [values] })
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => response.statusText || '');
        throw new Error(`Failed to save bike trail changes to Excel (${response.status})${detail ? `: ${detail}` : ''}`);
      }

      row.values = [values];
      return values;
    };

    if (window.ReliabilityAsync && typeof window.ReliabilityAsync.retryIdempotentWrite === 'function') {
      return window.ReliabilityAsync.retryIdempotentWrite('Bike row update', run, { retries: 1, backoffMs: 500 });
    }
    return run();
  }

  async function migrateLegacyBikePreferencesToExcel(accessToken, filePath, tableRef) {
    if (localStorage.getItem(LEGACY_BIKE_PREFS_MIGRATION_KEY) === '1') return false;

    const legacyRatings = readJson('bikeTrailRatings', {});
    const legacyFavorites = new Set(readJson('bikeTrailFavorites', []));
    const hasLegacyRatings = legacyRatings && Object.keys(legacyRatings).length > 0;
    const hasLegacyFavorites = legacyFavorites.size > 0;

    if (!hasLegacyRatings && !hasLegacyFavorites) {
      localStorage.setItem(LEGACY_BIKE_PREFS_MIGRATION_KEY, '1');
      return false;
    }

    const ratingCol = getBikeWritableColumnIndex(BIKE_PREFERENCE_COLUMNS.rating);
    const favoriteCol = getBikeWritableColumnIndex(BIKE_PREFERENCE_COLUMNS.favorite);
    if (ratingCol < 0 || favoriteCol < 0) return false;

    let updatedAny = false;
    for (let sourceIndex = 0; sourceIndex < (window.bikeTrailsData || []).length; sourceIndex += 1) {
      const trail = trailModel(window.bikeTrailsData[sourceIndex], sourceIndex);
      const updates = {};
      const legacyRating = Number(legacyRatings[trail.id] || 0);
      const shouldFavorite = legacyFavorites.has(trail.id);

      if (legacyRating > 0 && legacyRating !== Number(trail.myRating || 0)) updates[ratingCol] = legacyRating;
      if (shouldFavorite && !trail.isFavorite) updates[favoriteCol] = 'TRUE';

      if (Object.keys(updates).length) {
        await updateBikeRowColumns(sourceIndex, updates, { accessToken, filePath, tableRef });
        updatedAny = true;
      }
    }

    localStorage.removeItem('bikeTrailRatings');
    localStorage.removeItem('bikeTrailFavorites');
    localStorage.setItem(LEGACY_BIKE_PREFS_MIGRATION_KEY, '1');
    return updatedAny;
  }

  function buildTrailId(row, fallbackIndex) {
    const name = getField(row, 'Ride Name');
    const region = getField(row, 'Region');
    const coords = getField(row, 'GPS Coordinates');
    const mapsLink = getField(row, 'Maps Link');
    const base = `${name}|${region}|${coords || mapsLink || fallbackIndex}`;
    return base.trim() || `bike-trail-${fallbackIndex}`;
  }

  function findBikeTrailById(trailId) {
    const filteredMatch = (window.bikeFilteredTrails || []).find((trail) => trail.id === trailId);
    if (filteredMatch) return filteredMatch;

    const rows = window.bikeTrailsData || [];
    for (let idx = 0; idx < rows.length; idx += 1) {
      const trail = trailModel(rows[idx], idx);
      if (trail.id === trailId) return trail;
    }

    return null;
  }

  function encodeGraphPath(filePath) {
    return String(filePath || '')
      .split('/')
      .filter(Boolean)
      .map((part) => encodeURIComponent(part))
      .join('/');
  }

  function resolvePlannerUrl(relativePath) {
    const rel = String(relativePath || '').replace(/^\/+/, '');

    if (typeof window.resolvePlannerPageUrl === 'function') {
      try {
        const resolved = window.resolvePlannerPageUrl(rel);
        if (resolved) return resolved;
      } catch (_) {}
    }

    const pathname = window.location.pathname || '/';
    const marker = '/kylesadventureplanner/';
    const markerIdx = pathname.toLowerCase().indexOf(marker);

    let basePath = '/';
    if (markerIdx >= 0) {
      basePath = pathname.slice(0, markerIdx + marker.length);
    } else {
      const slashIdx = pathname.lastIndexOf('/');
      basePath = slashIdx >= 0 ? pathname.slice(0, slashIdx + 1) : '/';
    }

    const origin = window.location.origin && window.location.origin !== 'null' ? window.location.origin : '';
    const baseUrl = origin ? `${origin}${basePath}` : window.location.href;
    return new URL(encodeURI(rel), baseUrl).toString();
  }

  function trailModel(row, sourceIndex) {
    const id = buildTrailId(row, sourceIndex);
    const legacyPrefs = getBikeLegacyPreferenceSnapshot();
    const legacyRating = Number(legacyPrefs.ratings[id] || 0);
    const legacyFavorite = legacyPrefs.favorites.has(id);
    const tableRating = parseNumber(getField(row, BIKE_PREFERENCE_COLUMNS.rating));
    const tableFavorite = isBikeFavoriteFlag(getField(row, BIKE_PREFERENCE_COLUMNS.favorite));
    return {
      id,
      sourceIndex,
      name:                  getField(row, 'Ride Name'),
      region:                getField(row, 'Region'),
      difficulty:            getField(row, 'Difficulty'),
      difficultyScore:       getField(row, BIKE_DIFFICULTY_SCORE_COLUMN),
      surface:               getField(row, 'Surface Type'),
      surfaceBreakdown:      getField(row, 'Surface Breakdown (%)'),
      driveTime:             getField(row, 'Drive Time'),
      driveMinutes:          parseDriveMinutes(getField(row, 'Drive Time')),
      lengthMiles:           parseNumber(getField(row, 'Length (miles)')),
      elevationGain:         parseNumber(getField(row, 'Elevation Gain (ft)')),
      traffic:               getField(row, 'Traffic Exposure Rating'),
      trafficExposureRating: getField(row, 'Traffic Exposure Rating'),
      state:                 getField(row, 'State'),
      city:                  getField(row, 'City'),
      cost:                  getField(row, 'Cost'),
      hours:                 getField(row, 'Hours of Operation'),
      notes:                 getField(row, 'Notes'),
      notesList:             parseBikeNotesBlob(getField(row, 'Notes')),

      // Parking + maps
      parkingCapacity:       getField(row, 'Parking Capacity'),
      parkingDifficulty:     getField(row, 'Parking Difficulty'),
      parkingDistanceToTrail:getField(row, 'Parking Distance to Trail'),
      parkingCost:           getField(row, 'Parking Cost'),
      parkingSafetyNotes:    getField(row, 'Parking Safety / Lighting Notes'),
      mapsLink:              getField(row, 'Maps Link') || getField(row, 'Google URL'),
      googleUrl:             getField(row, 'Google URL'),
       parkingLink:           getField(row, 'Parking Link'),
       gpsCoordinates:        getField(row, 'GPS Coordinates'),
      googlePlaceId:         getField(row, 'Google Place ID'),
       googleMapsTrailhead:   getField(row, 'Google Maps Trailhead'),
       googleMapsParking:     getField(row, 'Google Maps Parking'),

      // Overview
      rideTypeClassification:getField(row, 'Ride Type Classification'),
      rideCommitmentLevel:   getField(row, 'Ride Commitment Level'),
      rideFlowProfile:       getField(row, 'Ride Flow Profile'),
      bestTimeOfDay:         getField(row, 'Best Time of Day'),
      highlights:            getField(row, 'Scenic & Nature Highlights'),
      recommendedLoop:       getField(row, 'Recommended Loop'),
      localRegulations:      getField(row, 'Local Regulations'),

      // Ride profile
      rideStartExperience:   getField(row, 'Ride Start Experience'),
      rideFinishExperience:  getField(row, 'Ride Finish Experience'),
      smoothnessIndex:       getField(row, 'Ride Smoothness Index'),
      moodTags:              getField(row, 'Ride Mood Tags'),
      vibes:                 getField(row, 'Vibes'),
      rideNoiseProfile:      getField(row, 'Ride Noise Profile'),

      // Conditions + safety
      rideRiskProfile:       getField(row, 'Ride Risk Profile'),
      weatherSuitability:    getField(row, 'Weather Suitability'),
      nightRidingSuitability:getField(row, 'Night Riding Suitability'),
      emergencyAccessNotes:  getField(row, 'Emergency Access Notes'),
      cellCoverageNotes:     getField(row, 'Cell Coverage Notes'),

      // Nearby
      coffeeNearby:          getField(row, 'Coffee Nearby'),
      foodNearby:            getField(row, 'Food Nearby'),
      breweryNearby:         getField(row, 'Brewery Nearby'),
      bikeShopNearby:        getField(row, 'Bike Shop Nearby'),
      localShopsNearby:      getField(row, 'Local Shops Nearby'),

      // External links
      allTrails:             getField(row, 'AllTrails'),
      mtbProject:            getField(row, 'MTBProject'),
      hikingProject:         getField(row, 'HikingProject'),
      singletracks:          getField(row, 'Singletracks'),
      rideWithGps:           getField(row, 'RideWithGPS'),
      openStreetMap:         getField(row, 'OpenStreetMap'),
      officialLink1:         getField(row, 'Official Link 1'),
      officialLink2:         getField(row, 'Official Link 2'),
      officialLink3:         getField(row, 'Official Link 3'),
      trailLink:             getField(row, 'TrailLink'),

      // Along the trail
      photoSpots:            getField(row, 'Photo Spots'),
      localWildlifeNotes:    getField(row, 'Local Wildlife Notes'),
      localHistoryFunFact:   getField(row, 'Local History / Fun Fact'),
      seasonalNotes:         getField(row, 'Seasonal Notes'),
      scenicNature:          getField(row, 'Scenic & Nature Highlights'),

      myRating:              tableRating > 0 ? tableRating : legacyRating,
      isFavorite:            tableFavorite || legacyFavorite,
      row
    };
  }

  function compareTrails(a, b) {
    const sortBy = state.sortBy;
    const mult = state.sortAsc ? 1 : -1;

    if (sortBy === 'driveTime') return (a.driveMinutes - b.driveMinutes) * mult;
    if (sortBy === 'length') return (a.lengthMiles - b.lengthMiles) * mult;
    if (sortBy === 'difficulty') return norm(a.difficulty).localeCompare(norm(b.difficulty)) * mult;
    if (sortBy === 'elevation') return (a.elevationGain - b.elevationGain) * mult;
    if (sortBy === 'surface') return norm(a.surface).localeCompare(norm(b.surface)) * mult;
    if (sortBy === 'rating') return (a.myRating - b.myRating) * mult;
    return norm(a.name).localeCompare(norm(b.name)) * mult;
  }

  function buildBikeCardDescriptionHtml(rawDescription, toggleThreshold = 180) {
    const descriptionText = String(rawDescription || '').trim();
    if (!descriptionText) {
      return '<div class="card-description-wrap"><div class="card-description card-description-empty">No description provided.</div></div>';
    }

    const safeDescription = escapeHtml(descriptionText);
    const clipped = descriptionText.length > toggleThreshold
      ? `${safeDescription.slice(0, toggleThreshold).trim()}...`
      : safeDescription;
    return `
      <div class="card-description-wrap">
        <div class="card-description">${clipped}</div>
      </div>
    `;
  }

  function isBikeInteractiveCardTarget(target) {
    if (!target || !target.closest) return false;
    // Keep card-open behavior simple: only true form/link controls block card-open.
    return Boolean(target.closest('a, button, input, select, textarea, label, [contenteditable=""], [contenteditable="true"], .card-address-copy, .card-addr-copy-btn'));
  }

  function bindBikeCardInteractionDelegates() {
    const grid = document.getElementById('bikeTrailsCardsGrid');
    if (!grid || grid.dataset.bikeCardDelegatesBound === '1') return;

    grid.addEventListener('click', (event) => {
      const card = event.target && event.target.closest ? event.target.closest('.bike-trail-card') : null;
      if (!card) return;
      if (isBikeInteractiveCardTarget(event.target)) return;

      const raw = String(card.getAttribute('data-bike-source-index') || '').trim();
      const sourceIndex = /^\d+$/.test(raw) ? Number(raw) : NaN;
      if (!Number.isInteger(sourceIndex) || sourceIndex < 0) return;

      event.preventDefault();
      event.stopPropagation();
      window.openBikeTrailDetailsInNewTab(sourceIndex);
    }, false);

    grid.addEventListener('change', (event) => {
      const checkbox = event.target && event.target.closest ? event.target.closest('.bike-bulk-select') : null;
      if (!checkbox) return;

      event.stopPropagation();
      const raw = String(checkbox.getAttribute('data-bike-source-index') || '').trim();
      const sourceIndex = /^\d+$/.test(raw) ? Number(raw) : NaN;
      if (!Number.isInteger(sourceIndex) || sourceIndex < 0) return;
      setBikeCardSelected(sourceIndex, Boolean(checkbox.checked));
    }, true);

    grid.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const card = event.target && event.target.closest ? event.target.closest('.bike-trail-card') : null;
      if (!card) return;
      if (isBikeInteractiveCardTarget(event.target)) return;

      const raw = String(card.getAttribute('data-bike-source-index') || '').trim();
      const sourceIndex = /^\d+$/.test(raw) ? Number(raw) : NaN;
      if (!Number.isInteger(sourceIndex) || sourceIndex < 0) return;

      event.preventDefault();
      window.openBikeTrailDetailsInNewTab(sourceIndex);
    }, false);

    grid.dataset.bikeCardDelegatesBound = '1';
  }

  function getTrailBySourceIndex(sourceIndex) {
    const row = (window.bikeTrailsData || [])[sourceIndex];
    return row ? trailModel(row, sourceIndex) : null;
  }

  function getBikeGroupValue(trail, groupBy) {
    if (!groupBy) return '';
    if (groupBy === 'Region') return trail.region || 'Unspecified Region';
    if (groupBy === 'Difficulty') return trail.difficulty || 'Unspecified Difficulty';
    if (groupBy === 'Surface Type') return trail.surface || 'Unspecified Surface';
    if (groupBy === 'Drive Time') {
      if (trail.driveMinutes < 30) return 'Under 30 min';
      if (trail.driveMinutes <= 60) return '30-60 min';
      return 'Over 60 min';
    }
    return '';
  }

  function isTrailCityResultsMode() {
    const tabRoot = document.getElementById('bikeTrailsTab');
    return !!(tabRoot && tabRoot.classList.contains('trail-city-results-mode'));
  }

  function buildBikeTrailCardHtml(trail) {
    const sourceIndex = Number(trail.sourceIndex || 0);
    const displayTags = getBikeDisplayTags(trail).slice(0, 4);
    const description = buildBikeCardDescriptionHtml(trail.notes || trail.vibes || trail.highlights || '');
    const isSelected = state.selectedSourceIndexes.has(sourceIndex);
    const selectionControl = `<label style="display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:600;color:#334155;background:#f8fafc;border:1px solid #e2e8f0;border-radius:999px;padding:4px 8px;"><input type="checkbox" class="bike-bulk-select" data-bike-source-index="${sourceIndex}" ${isSelected ? 'checked' : ''}>Select</label>`;

    if (isTrailCityResultsMode()) {
      const shortDescription = escapeHtml(String(trail.notes || trail.vibes || trail.highlights || '').trim());
      const clippedDescription = shortDescription.length > 420
        ? `${shortDescription.slice(0, 420).trim()}...`
        : shortDescription;
      const hasDescription = String(trail.notes || trail.vibes || trail.highlights || '').trim().length > 0;

      return `
        <article class="loc-card bike-trail-card" data-bike-source-index="${sourceIndex}" tabindex="0" role="button" aria-label="Open ${escapeHtml(trail.name || 'trail')} details">
          <div style="display:flex;justify-content:flex-end;padding:10px 12px 0;">${selectionControl}</div>
          <div class="loc-card-header">
            <div class="loc-card-name">${escapeHtml(trail.name || 'Bike Trail')}</div>
            <div class="loc-card-meta">
              ${trail.difficulty ? `<span class="loc-meta-badge">${escapeHtml(trail.difficulty)}</span>` : ''}
              ${trail.cost ? `<span class="loc-meta-badge cost">${escapeHtml(trail.cost)}</span>` : ''}
              ${trail.myRating ? `<span class="loc-meta-badge rating">⭐ ${escapeHtml(String(trail.myRating))}</span>` : ''}
            </div>
          </div>
          ${displayTags.length ? `<div class="loc-card-tags">${displayTags.map((tag) => `<span class="loc-tag-pill">${escapeHtml(tag)}</span>`).join('')}</div>` : ''}
          <div class="loc-card-details">
            <div class="loc-detail-row"><span class="loc-detail-icon">🚗</span><span class="loc-detail-value">${escapeHtml(trail.driveTime || 'Drive time unavailable')}</span></div>
            <div class="loc-detail-row"><span class="loc-detail-icon">📏</span><span class="loc-detail-value">${escapeHtml(trail.lengthMiles ? `${trail.lengthMiles} mi` : 'Length not listed')}</span></div>
            <div class="loc-detail-row"><span class="loc-detail-icon">🛣️</span><span class="loc-detail-value">${escapeHtml(trail.surface || 'Surface not listed')}</span></div>
            <div class="loc-detail-row"><span class="loc-detail-icon">📍</span><span class="loc-detail-value">${escapeHtml([trail.city, trail.state].filter(Boolean).join(', ') || trail.region || 'Location unavailable')}</span></div>
          </div>
          ${hasDescription ? `<div class="loc-card-description">${clippedDescription}</div>` : ''}
          <div class="loc-card-footer">
            ${trail.officialLink1 ? `<a class="loc-action-btn" href="${escapeHtml(trail.officialLink1)}" target="_blank" rel="noopener">🌐 Website</a>` : ''}
            ${trail.mapsLink ? `<a class="loc-action-btn" href="${escapeHtml(trail.mapsLink)}" target="_blank" rel="noopener">🗺️ Trail Map</a>` : ''}
            <button type="button" class="loc-action-btn" onclick="event.stopPropagation(); window.openBikeTrailDetailsInNewTab(${sourceIndex});">Open Details</button>
          </div>
        </article>
      `;
    }

    return `
      <article class="adventure-card bike-trail-card" data-bike-source-index="${sourceIndex}" tabindex="0" role="button" aria-label="Open ${escapeHtml(trail.name || 'trail')} details">
        <div style="display:flex;justify-content:flex-end;padding:10px 12px 0;">${selectionControl}</div>
        <div class="adventure-card-header">
          <h3 class="adventure-card-title">${escapeHtml(trail.name || 'Bike Trail')}</h3>
          <div class="adventure-card-location"><span class="location-icon">📍</span>${escapeHtml([trail.city, trail.state].filter(Boolean).join(', ') || trail.region || 'Location unavailable')}</div>
          <div class="adventure-card-time"><span class="time-icon">🚗</span>${escapeHtml(trail.driveTime || 'Drive time unavailable')}</div>
        </div>
        <div class="adventure-card-tags">${displayTags.length ? displayTags.map((tag) => `<span class="tag-pill">${escapeHtml(tag)}</span>`).join('') : '<span class="tag-pill">No tags</span>'}</div>
        <div class="adventure-card-body">
          ${description}
          <div class="card-info-row"><span class="card-info-icon">📏</span><span class="card-info-label">Length</span><span class="card-info-value">${escapeHtml(trail.lengthMiles ? `${trail.lengthMiles} mi` : 'Not listed')}</span></div>
          <div class="card-info-row"><span class="card-info-icon">🛣️</span><span class="card-info-label">Surface</span><span class="card-info-value">${escapeHtml(trail.surface || 'Not listed')}</span></div>
          <div class="card-info-row"><span class="card-info-icon">📈</span><span class="card-info-label">Difficulty</span><span class="card-info-value">${escapeHtml(trail.difficulty || 'Not listed')}</span></div>
        </div>
        <div class="adventure-card-footer" style="padding: 10px 16px; background: #f8fafc; border-top: 1px solid #e5e7eb; display:flex; align-items:center; justify-content:space-between; gap:8px;">
          <div style="font-size: 12px; color: #64748b;">Click card to open details</div>
        </div>
      </article>
    `;
  }

  function updateBikePaginationUi(totalResults) {
    const total = Math.max(0, Number(totalResults || 0));
    const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
    state.currentPage = Math.min(Math.max(1, state.currentPage), totalPages);
    const hasPagination = total > ITEMS_PER_PAGE;
    const start = total ? ((state.currentPage - 1) * ITEMS_PER_PAGE) + 1 : 0;
    const end = total ? Math.min(total, state.currentPage * ITEMS_PER_PAGE) : 0;

    const controls = [
      document.getElementById('bikePaginationControlsTop'),
      document.getElementById('bikePaginationControls')
    ];
    controls.forEach((el) => {
      if (!el) return;
      el.style.display = hasPagination ? 'flex' : 'none';
    });

    [
      ['bikeCurrentPageNumTop', state.currentPage], ['bikeCurrentPageNum', state.currentPage],
      ['bikeTotalPagesNumTop', totalPages], ['bikeTotalPagesNum', totalPages],
      ['bikeShowingRangeStartTop', start], ['bikeShowingRangeStart', start],
      ['bikeShowingRangeEndTop', end], ['bikeShowingRangeEnd', end],
      ['bikeTotalResultsNumTop', total], ['bikeTotalResultsNum', total]
    ].forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(value);
    });

    [
      ['bikePrevPageBtnTop', state.currentPage <= 1], ['bikePrevPageBtn', state.currentPage <= 1],
      ['bikeNextPageBtnTop', state.currentPage >= totalPages], ['bikeNextPageBtn', state.currentPage >= totalPages]
    ].forEach(([id, disabled]) => {
      const el = document.getElementById(id);
      if (el) el.disabled = Boolean(disabled);
    });
  }

  function renderBikeTrailsPage() {
    const grid = document.getElementById('bikeTrailsCardsGrid');
    if (!grid) return;

    const all = Array.isArray(window.bikeFilteredTrails) ? window.bikeFilteredTrails : [];
    updateBikePaginationUi(all.length);

    const resultsEl = document.getElementById('bikeResultsCount');
    if (resultsEl) resultsEl.textContent = `${all.length} trail${all.length === 1 ? '' : 's'}`;

    if (!all.length) {
      grid.innerHTML = '<div class="trail-empty ui-empty-state" style="grid-column:1/-1;">No bike trails match your current filters.</div>';
      return;
    }

    const startIdx = (state.currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = all.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    const grouped = state.groupBy ? pageItems.reduce((acc, trail) => {
      const key = getBikeGroupValue(trail, state.groupBy) || 'Other';
      if (!acc[key]) acc[key] = [];
      acc[key].push(trail);
      return acc;
    }, {}) : null;

    if (grouped) {
      const html = Object.keys(grouped).sort((a, b) => a.localeCompare(b)).map((groupName) => {
        return `<div style="grid-column:1/-1;font-size:14px;font-weight:700;color:#374151;padding:2px 2px 0;">${escapeHtml(groupName)}</div>`
          + grouped[groupName].map(buildBikeTrailCardHtml).join('');
      }).join('');
      grid.innerHTML = html;
    } else {
      grid.innerHTML = pageItems.map(buildBikeTrailCardHtml).join('');
    }
  }

  function updateBikeFiltersBadge() {
    const badge = document.getElementById('bikeFiltersActiveBadge');
    if (!badge) return;
    const filterCount = Object.values(state.filters).filter((value) => String(value || '').trim() !== '').length;
    const quickCount = state.quickFilters.size;
    const favCount = state.showFavoritesOnly ? 1 : 0;
    const groupCount = state.groupBy ? 1 : 0;
    const total = filterCount + quickCount + favCount + groupCount;
    badge.style.display = total ? 'inline-flex' : 'none';
    badge.textContent = total ? `${total} Filter${total === 1 ? '' : 's'} Active` : 'Filters Active';
  }

  function applyBikeFilters() {
    const trails = getAllBikeTrails();
    const filtered = trails
      .filter((trail) => matchesBikeBaseFiltersExcludingQuick(trail))
      .filter((trail) => {
        if (state.showFavoritesOnly && !trail.isFavorite) return false;
        if (state.quickFilters.size) {
          return Array.from(state.quickFilters).every((quickKey) => matchesQuickFilter(trail, quickKey));
        }
        return true;
      })
      .sort(compareTrails);

    window.bikeFilteredTrails = filtered;
    pruneBikeSelectionToVisible();
    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    state.currentPage = Math.min(Math.max(1, state.currentPage), totalPages);

    renderBikeTrailsPage();
    renderBikeBreadcrumbChips();
    renderBikeManagedTagQuickChips();
    renderBikeStaticQuickFilterCounts();
    updateBikeFiltersBadge();
    renderBikePreferenceFallbackBanner();
    updateBikeBulkSelectionUi();
  }

  function changeBikePage(direction) {
    const total = Array.isArray(window.bikeFilteredTrails) ? window.bikeFilteredTrails.length : 0;
    const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
    state.currentPage = Math.min(totalPages, Math.max(1, state.currentPage + Number(direction || 0)));
    renderBikeTrailsPage();
  }

  async function persistBikePreferenceUpdate(sourceIndex, updates) {
    const ratingCol = getBikeWritableColumnIndex(BIKE_PREFERENCE_COLUMNS.rating);
    const favoriteCol = getBikeWritableColumnIndex(BIKE_PREFERENCE_COLUMNS.favorite);
    const payload = {};
    if (Object.prototype.hasOwnProperty.call(updates, 'myRating') && ratingCol >= 0) payload[ratingCol] = updates.myRating > 0 ? String(updates.myRating) : '';
    if (Object.prototype.hasOwnProperty.call(updates, 'isFavorite') && favoriteCol >= 0) payload[favoriteCol] = updates.isFavorite ? 'TRUE' : '';
    if (!Object.keys(payload).length) return;

    const row = (window.bikeTrailsData || [])[sourceIndex];
    if (!row) return;

    const values = getValues(row).slice();
    Object.entries(payload).forEach(([idx, value]) => {
      const n = Number(idx);
      while (values.length <= n) values.push('');
      values[n] = value;
    });
    row.values = [values];

    if (window.accessToken) {
      try {
        await updateBikeRowColumns(sourceIndex, payload);
      } catch (error) {
        console.warn('[bike-trails] Failed to persist preference update:', error);
      }
    }
  }

  function resolveSourceIndex(candidate) {
    if (Number.isInteger(candidate) && candidate >= 0) return candidate;
    const id = String(candidate || '').trim();
    if (!id) return -1;
    const rows = window.bikeTrailsData || [];
    for (let idx = 0; idx < rows.length; idx += 1) {
      const trail = trailModel(rows[idx], idx);
      if (trail.id === id) return idx;
    }
    return -1;
  }

  async function setBikeRating(sourceOrTrailId, rating) {
    const sourceIndex = resolveSourceIndex(sourceOrTrailId);
    if (sourceIndex < 0) return;
    const normalized = Math.max(0, Math.min(5, Number(rating || 0)));
    await persistBikePreferenceUpdate(sourceIndex, { myRating: normalized });
    applyBikeFilters();
  }

  async function toggleBikeTrailFavorite(sourceOrTrailId) {
    const sourceIndex = resolveSourceIndex(sourceOrTrailId);
    if (sourceIndex < 0) return;
    const trail = getTrailBySourceIndex(sourceIndex);
    const nextValue = !(trail && trail.isFavorite);
    await persistBikePreferenceUpdate(sourceIndex, { isFavorite: nextValue });
    applyBikeFilters();
  }

  async function setBikeVisited(sourceOrTrailId, isVisited) {
    const sourceIndex = resolveSourceIndex(sourceOrTrailId);
    if (sourceIndex < 0) return;

    const writableCol = getBikeWritableColumnIndex('Visited');
    const fallbackCol = getBikeColumnIndex('Visited');
    const visitedCol = writableCol >= 0 ? writableCol : fallbackCol;
    if (visitedCol < 0) {
      throw new Error('Visited column is not available in the bike table schema.');
    }

    const writeValue = isVisited ? 'TRUE' : '';
    await updateBikeRowColumns(sourceIndex, { [visitedCol]: writeValue });
  }

  async function runBikeBulkOperation(label, worker) {
    const targets = Array.from(state.selectedSourceIndexes).filter((idx) => Number.isInteger(idx) && idx >= 0);
    if (!targets.length) {
      showToast?.('Select one or more trails first.', 'warning', 2200);
      return;
    }

    const autoClear = Boolean(document.getElementById('bikeBulkAutoClearToggle')?.checked);

    setBikeBulkBusy(true);
    let success = 0;
    let failed = 0;

    try {
      for (const sourceIndex of targets) {
        try {
          // Run writes in sequence so API calls are easier to reason about.
          await worker(sourceIndex);
          success += 1;
        } catch (error) {
          failed += 1;
          console.warn(`[bike-trails] Bulk ${label} failed for sourceIndex ${sourceIndex}:`, error);
        }
      }

      const scopeLabel = getBikeSelectionScopeLabel();
      const attempted = targets.length;

      if (failed > 0) {
        showToast?.(`Bulk ${label} (${scopeLabel}): ${success}/${attempted} updated, ${failed} failed`, 'warning', 3400);
      } else {
        showToast?.(`Bulk ${label} (${scopeLabel}): ${success}/${attempted} updated`, 'success', 2400);
      }

      if (autoClear && failed === 0) {
        clearBikeSelection();
      }
    } finally {
      setBikeBulkBusy(false);
      applyBikeFilters();
    }
  }

  async function applyBikeBulkTags() {
    const input = document.getElementById('bikeBulkTagsInput');
    const tagsToAdd = parseBulkTagsInput(input ? input.value : '');
    if (!tagsToAdd.length) {
      showToast?.('Enter one or more tags (comma separated).', 'warning', 2200);
      return;
    }

    await runBikeBulkOperation('tag add', async (sourceIndex) => {
      const trail = getTrailBySourceIndex(sourceIndex);
      const tagKey = getBikeTagKey(trail);
      if (!tagKey || !window.tagManager || typeof window.tagManager.addTagsToPlace !== 'function') {
        throw new Error('Tag manager is unavailable.');
      }
      window.tagManager.addTagsToPlace(tagKey, tagsToAdd);
    });
  }

  async function applyBikeBulkCopyTags() {
    const targets = Array.from(state.selectedSourceIndexes)
      .filter((idx) => Number.isInteger(idx) && idx >= 0)
      .sort((a, b) => a - b);
    if (targets.length < 2) {
      showToast?.('Select at least two trails to copy tags.', 'warning', 2200);
      return;
    }

    const sourceMode = getBikeCopySourceMode();
    const mergeMode = getBikeCopyMergeMode();
    const sourceIndices = sourceMode === 'union' ? targets.slice() : [targets[0]];
    const sourceSet = new Set(sourceIndices);
    const effectiveTargets = sourceMode === 'union'
      ? targets.slice()
      : targets.filter((idx) => !sourceSet.has(idx));

    if (!window.tagManager || typeof window.tagManager.getTagsForPlace !== 'function' || typeof window.tagManager.addTagsToPlace !== 'function') {
      showToast?.('Tag manager is unavailable.', 'warning', 2200);
      return;
    }
    if (mergeMode === 'replace' && typeof window.tagManager.setTagsForPlace !== 'function') {
      showToast?.('Tag replace mode is unavailable in this build.', 'warning', 2400);
      return;
    }

    const sourceTagKeys = sourceIndices
      .map((sourceIndex) => {
        const sourceTrail = getTrailBySourceIndex(sourceIndex);
        return getBikeTagKey(sourceTrail);
      })
      .filter(Boolean);
    const sourceTags = typeof window.tagManager.getCopySourceTags === 'function'
      ? (window.tagManager.getCopySourceTags(sourceTagKeys, { sourceMode }).sourceTags || [])
      : uniqueTagsCaseInsensitive(sourceIndices.flatMap((sourceIndex) => {
        const sourceTrail = getTrailBySourceIndex(sourceIndex);
        const sourceTagKey = getBikeTagKey(sourceTrail);
        return sourceTagKey ? (window.tagManager.getTagsForPlace(sourceTagKey) || []) : [];
      }));
    if (!sourceTags.length) {
      showToast?.('Source trail has no tags to copy.', 'info', 2200);
      return;
    }

    if (!effectiveTargets.length) {
      showToast?.('No target trails available for copy.', 'info', 2200);
      return;
    }

    const sourceLabel = sourceMode === 'union'
      ? `${sourceIndices.length} selected source${sourceIndices.length === 1 ? '' : 's'}`
      : (() => {
        const sourceTrail = getTrailBySourceIndex(sourceIndices[0]);
        return `"${String(sourceTrail?.name || `#${sourceIndices[0] + 1}`).trim()}"`;
      })();

    await runBikeBulkOperation(mergeMode === 'replace' ? 'tag copy (replace)' : 'tag copy', async (targetIndex) => {
      if (!effectiveTargets.includes(targetIndex)) return;
      const trail = getTrailBySourceIndex(targetIndex);
      const tagKey = getBikeTagKey(trail);
      if (!tagKey) throw new Error('Trail tag key is unavailable.');
      if (typeof window.tagManager.copyTagsBetweenPlaces === 'function') {
        const copyResult = window.tagManager.copyTagsBetweenPlaces({
          sourceIdentifiers: sourceTagKeys,
          targetIdentifiers: [tagKey],
          sourceMode,
          mergeMode
        });
        if (copyResult && Array.isArray(copyResult.failed) && copyResult.failed.length) {
          throw new Error(copyResult.failed[0].error || 'Tag copy failed.');
        }
      } else if (mergeMode === 'replace') {
        window.tagManager.setTagsForPlace(tagKey, sourceTags);
      } else {
        window.tagManager.addTagsToPlace(tagKey, sourceTags);
      }
    });

    showToast?.(`${mergeMode === 'replace' ? 'Replaced with' : 'Copied'} ${sourceTags.length} tag${sourceTags.length === 1 ? '' : 's'} from ${sourceLabel} to ${effectiveTargets.length} trail${effectiveTargets.length === 1 ? '' : 's'}.`, 'success', 2600);
  }

  async function applyBikeBulkRating() {
    const select = document.getElementById('bikeBulkRatingSelect');
    const value = Number(select && select.value);
    if (!Number.isFinite(value) || value < 1 || value > 5) {
      showToast?.('Choose a rating from 1 to 5.', 'warning', 2200);
      return;
    }

    await runBikeBulkOperation('rating', async (sourceIndex) => {
      await persistBikePreferenceUpdate(sourceIndex, { myRating: value });
    });
  }

  async function applyBikeBulkFavorite() {
    const selected = state.selectedSourceIndexes.size;
    if (selected > BULK_STATUS_CONFIRM_THRESHOLD && !window.confirm(`Apply "Mark Favorite" to ${selected} selected trails?`)) return;
    await runBikeBulkOperation('favorite', async (sourceIndex) => {
      await persistBikePreferenceUpdate(sourceIndex, { isFavorite: true });
    });
  }

  async function applyBikeBulkUnfavorite() {
    const selected = state.selectedSourceIndexes.size;
    if (selected > BULK_STATUS_CONFIRM_THRESHOLD && !window.confirm(`Apply "Unmark Favorite" to ${selected} selected trails?`)) return;
    await runBikeBulkOperation('unfavorite', async (sourceIndex) => {
      await persistBikePreferenceUpdate(sourceIndex, { isFavorite: false });
    });
  }

  async function applyBikeBulkVisited() {
    const selected = state.selectedSourceIndexes.size;
    if (selected > BULK_STATUS_CONFIRM_THRESHOLD && !window.confirm(`Apply "Mark Visited" to ${selected} selected trails?`)) return;
    await runBikeBulkOperation('visited', async (sourceIndex) => {
      await setBikeVisited(sourceIndex, true);
    });
  }

  async function applyBikeBulkUnvisited() {
    const selected = state.selectedSourceIndexes.size;
    if (selected > BULK_STATUS_CONFIRM_THRESHOLD && !window.confirm(`Apply "Unmark Visited" to ${selected} selected trails?`)) return;
    await runBikeBulkOperation('unvisited', async (sourceIndex) => {
      await setBikeVisited(sourceIndex, false);
    });
  }

  function resetAllBikeFilters() {
    Object.keys(state.filters).forEach((key) => {
      state.filters[key] = '';
      const inputId = getBikeFilterInputId(key);
      const input = inputId ? document.getElementById(inputId) : null;
      if (input) input.value = '';
    });
    state.groupBy = '';
    state.quickFilters.clear();
    state.showFavoritesOnly = false;
    const sortBy = document.getElementById('bikeSortBy');
    if (sortBy) sortBy.value = state.sortBy;
    document.querySelectorAll('#bikeQuickFiltersCard .quick-filter-btn').forEach((btn) => setBikeQuickFilterButtonState(btn, false));
  }

  function bindBikeControls() {
    const grid = document.getElementById('bikeTrailsCardsGrid');
    if (!grid) return false;
    if (grid.dataset.bikeControlsBound === '1') return true;
    const bikeRoot = document.getElementById('bikeTrailsTab')
      || document.querySelector('.app-tab-pane[data-tab="bike-trails"]')
      || document.body
      || document.documentElement;

    if (bikeRoot && bikeRoot.dataset.bikeActionDelegatesBound !== '1') {
      bikeRoot.addEventListener('click', (event) => {
        const btn = event && event.target && event.target.closest
          ? event.target.closest('[data-bike-action]')
          : null;
        if (!btn || !bikeRoot || !bikeRoot.contains(btn)) return;
        event.preventDefault();
        const action = String(btn.getAttribute('data-bike-action') || '').trim();

        if (action === 'refresh-data') {
          if (typeof window.refreshBikeTrailData === 'function') window.refreshBikeTrailData();
          return;
        }

        if (action === 'open-trail-explorer') {
          if (typeof window.openTrailExplorerWindow === 'function') window.openTrailExplorerWindow();
          return;
        }

        if (action === 'find-near-me') {
          if (typeof window.startFindNearMe === 'function') window.startFindNearMe();
          else if (typeof window.openFindNearMeWindow === 'function') window.openFindNearMeWindow();
          return;
        }

        if (action === 'change-page') {
          const delta = Number(btn.getAttribute('data-page-delta') || '0');
          if (Number.isFinite(delta) && delta !== 0 && typeof window.changeBikePage === 'function') {
            window.changeBikePage(delta);
          }
        }
      }, true);
      bikeRoot.dataset.bikeActionDelegatesBound = '1';
    }

    Object.keys(state.filters).forEach((filterKey) => {
      const inputId = getBikeFilterInputId(filterKey);
      const input = inputId ? document.getElementById(inputId) : null;
      if (!input) return;
      const eventName = input.tagName === 'SELECT' ? 'change' : 'input';
      input.addEventListener(eventName, () => {
        const value = String(input.value || '').trim();
        state.filters[filterKey] = value;
        state.currentPage = 1;
        applyBikeFilters();
      });
    });

    const groupBy = document.getElementById('bikeGroupBy');
    if (groupBy) {
      groupBy.addEventListener('change', () => {
        state.groupBy = String(groupBy.value || '').trim();
        state.currentPage = 1;
        applyBikeFilters();
      });
    }

    const sortBy = document.getElementById('bikeSortBy');
    if (sortBy) {
      sortBy.addEventListener('change', () => {
        state.sortBy = String(sortBy.value || 'name');
        state.currentPage = 1;
        applyBikeFilters();
      });
    }

    const sortOrderBtn = document.getElementById('bikeSortOrderBtn');
    if (sortOrderBtn) {
      sortOrderBtn.addEventListener('click', () => {
        state.sortAsc = !state.sortAsc;
        const icon = sortOrderBtn.querySelector('.sort-icon');
        if (icon) icon.textContent = state.sortAsc ? '↑' : '↓';
        applyBikeFilters();
      });
    }

    const bikeQuickFiltersCard = document.getElementById('bikeQuickFiltersCard');
    if (bikeQuickFiltersCard && bikeQuickFiltersCard.dataset.bikeQuickDelegatesBound !== '1') {
      bikeQuickFiltersCard.addEventListener('click', (event) => {
        const btn = event.target && event.target.closest ? event.target.closest('.quick-filter-btn[data-bike-filter]') : null;
        if (!btn) return;
        event.preventDefault();
        event.stopPropagation();
        handleBikeQuickFilterButtonActivate(btn);
      }, true);

      bikeQuickFiltersCard.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        const btn = event.target && event.target.closest ? event.target.closest('.quick-filter-btn[data-bike-filter]') : null;
        if (!btn) return;
        event.preventDefault();
        handleBikeQuickFilterButtonActivate(btn);
      }, true);

      bikeQuickFiltersCard.dataset.bikeQuickDelegatesBound = '1';
    }
    syncBikeQuickFilterButtonsFromState();

    const managedTags = document.getElementById('bikeManagedTagQuickFilters');
    if (managedTags) {
      managedTags.addEventListener('click', (event) => {
        const btn = event.target && event.target.closest ? event.target.closest('[data-bike-managed-tag]') : null;
        if (!btn) return;
        const nextTag = String(btn.getAttribute('data-bike-managed-tag') || '').trim();
        state.filters.tag = norm(state.filters.tag) === norm(nextTag) ? '' : nextTag;
        const tagInput = document.getElementById('bikeFilterTag');
        if (tagInput) tagInput.value = state.filters.tag;
        state.currentPage = 1;
        applyBikeFilters();
      });
    }

    ['bikeResetAllFiltersTop', 'bikeResetAllFiltersBottom', 'bikeBreadcrumbResetBtn'].forEach((id) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener('click', () => {
        resetAllBikeFilters();
        state.currentPage = 1;
        applyBikeFilters();
      });
    });

    const selectVisibleBtn = document.getElementById('bikeBulkSelectVisibleBtn');
    if (selectVisibleBtn && selectVisibleBtn.dataset.bound !== '1') {
      selectVisibleBtn.addEventListener('click', () => {
        setBikeSelectionFromScope();
      });
      selectVisibleBtn.dataset.bound = '1';
    }

    const scopeSelect = document.getElementById('bikeBulkSelectionScope');
    if (scopeSelect && scopeSelect.dataset.bound !== '1') {
      scopeSelect.addEventListener('change', () => {
        syncBikeBulkSelectButtonLabel();
      });
      scopeSelect.dataset.bound = '1';
    }

    const clearBtn = document.getElementById('bikeBulkClearSelectionBtn');
    if (clearBtn && clearBtn.dataset.bound !== '1') {
      clearBtn.addEventListener('click', () => {
        clearBikeSelection();
      });
      clearBtn.dataset.bound = '1';
    }

    const invertBtn = document.getElementById('bikeBulkInvertSelectionBtn');
    if (invertBtn && invertBtn.dataset.bound !== '1') {
      invertBtn.addEventListener('click', () => {
        invertBikeSelectionFromScope();
      });
      invertBtn.dataset.bound = '1';
    }

    const tagsBtn = document.getElementById('bikeBulkApplyTagsBtn');
    if (tagsBtn && tagsBtn.dataset.bound !== '1') {
      tagsBtn.addEventListener('click', () => {
        withBikeActionGuard(tagsBtn, () => applyBikeBulkTags(), { actionKey: 'bulk:tags' });
      });
      tagsBtn.dataset.bound = '1';
    }

    const copyTagsBtn = document.getElementById('bikeBulkCopyTagsBtn');
    if (copyTagsBtn && copyTagsBtn.dataset.bound !== '1') {
      copyTagsBtn.addEventListener('click', () => {
        withBikeActionGuard(copyTagsBtn, () => applyBikeBulkCopyTags(), { actionKey: 'bulk:copy-tags' });
      });
      copyTagsBtn.dataset.bound = '1';
    }

    const ratingBtn = document.getElementById('bikeBulkApplyRatingBtn');
    if (ratingBtn && ratingBtn.dataset.bound !== '1') {
      ratingBtn.addEventListener('click', () => {
        withBikeActionGuard(ratingBtn, () => applyBikeBulkRating(), { actionKey: 'bulk:rating' });
      });
      ratingBtn.dataset.bound = '1';
    }

    const favoriteBtn = document.getElementById('bikeBulkMarkFavoriteBtn');
    if (favoriteBtn && favoriteBtn.dataset.bound !== '1') {
      favoriteBtn.addEventListener('click', () => {
        withBikeActionGuard(favoriteBtn, () => applyBikeBulkFavorite(), { actionKey: 'bulk:favorite' });
      });
      favoriteBtn.dataset.bound = '1';
    }

    const unfavoriteBtn = document.getElementById('bikeBulkUnmarkFavoriteBtn');
    if (unfavoriteBtn && unfavoriteBtn.dataset.bound !== '1') {
      unfavoriteBtn.addEventListener('click', () => {
        withBikeActionGuard(unfavoriteBtn, () => applyBikeBulkUnfavorite(), { actionKey: 'bulk:unfavorite' });
      });
      unfavoriteBtn.dataset.bound = '1';
    }

    const visitedBtn = document.getElementById('bikeBulkMarkVisitedBtn');
    if (visitedBtn && visitedBtn.dataset.bound !== '1') {
      visitedBtn.addEventListener('click', () => {
        withBikeActionGuard(visitedBtn, () => applyBikeBulkVisited(), { actionKey: 'bulk:visited' });
      });
      visitedBtn.dataset.bound = '1';
    }

    const unvisitedBtn = document.getElementById('bikeBulkUnmarkVisitedBtn');
    if (unvisitedBtn && unvisitedBtn.dataset.bound !== '1') {
      unvisitedBtn.addEventListener('click', () => {
        withBikeActionGuard(unvisitedBtn, () => applyBikeBulkUnvisited(), { actionKey: 'bulk:unvisited' });
      });
      unvisitedBtn.dataset.bound = '1';
    }

    bindBikeCardInteractionDelegates();
    syncBikeBulkSelectButtonLabel();
    updateBikeBulkSelectionUi();
    grid.dataset.bikeControlsBound = '1';
    return true;
  }

  async function refreshBikeTrailData() {
    const refreshBtn = document.getElementById('bikeRefreshBtn');
    if (refreshBtn) {
      return withBikeActionGuard(refreshBtn, () => loadBikeData(), {
        actionKey: 'refresh:bike-data',
        dedupeMs: 900,
        lockTimeoutMs: 15000
      });
    }
    return loadBikeData();
  }

  function initializeBikeTrailsTab() {
    const params = new URLSearchParams(window.location.search || '');
    const standaloneExplorer = params.get('trailExplorerWindow') === '1' || params.get('trailExplorerWindow') === 'true';
    if (standaloneExplorer) {
      hydrateBikeTrailDataFromExplorerTabCache(params.get('dataKey'));
    }

    const controlsReady = bindBikeControls();

    // Controls may not exist yet while tab HTML is still loading.
    if (!controlsReady && !standaloneExplorer) {
      state.controlsBound = false;
      state.controlBindAttempts += 1;
      if (state.controlBindAttempts <= 10) {
        setTimeout(initializeBikeTrailsTab, 150);
      }
      return;
    }

    state.controlBindAttempts = 0;
    if (controlsReady) {
      renderBikeManagedTagQuickChips();
      renderBikeStaticQuickFilterCounts();
      renderBikeBreadcrumbChips();
      updateBikeFiltersBadge();
      renderBikePreferenceFallbackBanner();
    }

    // Standalone trail explorer now uses its own city-first UI and should not auto-open the legacy modal wizard.
    const wantsExplorer = !standaloneExplorer && (params.get('openTrailExplorer') === '1' || params.get('openTrailExplorer') === 'true');
    if (wantsExplorer && !window.__bikeExplorerAutoOpenedFromUrl) {
      window.__bikeExplorerAutoOpenedFromUrl = true;
      setTimeout(() => openBikeTrailExplorer({ standalone: standaloneExplorer }), 0);
    }

    if (window.accessToken && (!window.bikeTrailsData || !window.bikeTrailsData.length)) {
      loadBikeData();
      return;
    }

    const hasCardsGrid = !!document.getElementById('bikeTrailsCardsGrid');
    if (hasCardsGrid && Array.isArray(window.bikeTrailsData) && window.bikeTrailsData.length) {
      applyBikeFilters();
    }

  }

  function cacheBikeTrailDataForExplorerTab() {
    if (!Array.isArray(window.bikeTrailsData) || window.bikeTrailsData.length === 0) return null;
    const normalizedTrails = getAllBikeTrails().map((trail) => {
      const { row, ...safeTrail } = trail || {};
      return safeTrail;
    });
    const cacheKey = `bike_trail_explorer_data_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const payload = {
      exportedAt: new Date().toISOString(),
      bikeTrailsData: window.bikeTrailsData,
      bikeTrailsNormalized: normalizedTrails
    };
    try {
      window.sessionStorage.setItem(cacheKey, JSON.stringify(payload));
      window.sessionStorage.setItem(BIKE_EXPLORER_TAB_DATA_KEY_LATEST, cacheKey);
      return cacheKey;
    } catch (error) {
      console.warn('[bike-trails] Could not cache bike data for explorer tab:', error);
      return null;
    }
  }

  function hydrateBikeTrailDataFromExplorerTabCache(preferredKey) {
    if (Array.isArray(window.bikeTrailsData) && window.bikeTrailsData.length > 0) return;
    const key = String(preferredKey || '').trim() || String(window.sessionStorage.getItem(BIKE_EXPLORER_TAB_DATA_KEY_LATEST) || '').trim();
    if (!key) return;

    try {
      const parsed = JSON.parse(window.sessionStorage.getItem(key) || '{}');
      if (Array.isArray(parsed.bikeTrailsData) && parsed.bikeTrailsData.length > 0) {
        window.bikeTrailsData = parsed.bikeTrailsData;
      }
      if (Array.isArray(parsed.bikeTrailsNormalized)) {
        window.bikeTrailExplorerModelsCache = parsed.bikeTrailsNormalized;
      }
    } catch (error) {
      console.warn('[bike-trails] Could not restore bike data for explorer tab:', error);
    }
  }

   // ─── Trail Explorer System ───────────────────────────────────────────────────
   // Provides an intuitive browsing interface for finding trails by various criteria

  const explorerState = {
    selectedFilters: {}, // { filterType: filterValue }
    presetEditMode: '',
    restoredPresetName: ''
  };

  function getExplorerPresets() {
    const raw = readJson(BIKE_EXPLORER_PRESETS_KEY, []);
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((entry) => entry && typeof entry.name === 'string' && entry.selectedFilters && typeof entry.selectedFilters === 'object')
      .map((entry) => ({
        name: String(entry.name || '').trim(),
        selectedFilters: { ...entry.selectedFilters }
      }))
      .filter((entry) => !!entry.name);
  }

  function saveExplorerPresets(presets) {
    localStorage.setItem(BIKE_EXPLORER_PRESETS_KEY, JSON.stringify(Array.isArray(presets) ? presets : []));
  }

  function getLastUsedExplorerPresetName() {
    return String(localStorage.getItem(BIKE_EXPLORER_LAST_PRESET_KEY) || '').trim();
  }

  function setLastUsedExplorerPresetName(name) {
    const value = String(name || '').trim();
    if (!value) {
      localStorage.removeItem(BIKE_EXPLORER_LAST_PRESET_KEY);
      return;
    }
    localStorage.setItem(BIKE_EXPLORER_LAST_PRESET_KEY, value);
  }

  function getDefaultExplorerPresetName() {
    return String(localStorage.getItem(BIKE_EXPLORER_DEFAULT_PRESET_KEY) || '').trim();
  }

  function setDefaultExplorerPresetName(name) {
    const value = String(name || '').trim();
    if (!value) {
      localStorage.removeItem(BIKE_EXPLORER_DEFAULT_PRESET_KEY);
      return;
    }
    localStorage.setItem(BIKE_EXPLORER_DEFAULT_PRESET_KEY, value);
  }

  function isExplorerAutoApplyEnabled() {
    const raw = String(localStorage.getItem(BIKE_EXPLORER_AUTO_APPLY_KEY) || '').trim().toLowerCase();
    return raw === '1' || raw === 'true';
  }

  function setExplorerAutoApplyEnabled(enabled) {
    if (enabled) {
      localStorage.setItem(BIKE_EXPLORER_AUTO_APPLY_KEY, '1');
    } else {
      localStorage.removeItem(BIKE_EXPLORER_AUTO_APPLY_KEY);
    }
  }

  function getExplorerFilterLabel(filterType, filterValue) {
    const labels = {
      driveTime: 'Drive Time',
      surface: 'Surface',
      difficulty: 'Difficulty',
      elevation: 'Elevation',
      lengthBand: 'Length',
      timeOfDay: 'Time of Day',
      condition: 'Condition'
    };

    const valueLabels = {
      driveTime: { under30: 'Under 30 min', '30to60': '30-60 min', over60: 'Over 60 min' },
      lengthBand: { short: 'Short', medium: 'Medium', long: 'Long' },
      difficulty: { easy: 'Easy', moderate: 'Moderate', hard: 'Hard' },
      elevation: { low: 'Mostly Flat', medium: 'Some Climbing', high: 'Lots of Climbing' }
    };

    const prettyValue = valueLabels[filterType]?.[filterValue] || String(filterValue || '').trim();
    return `${labels[filterType] || filterType}: ${prettyValue}`;
  }

  // Mobile-friendly shortened labels for preview chips
  function getExplorerFilterLabelShort(filterType, filterValue) {
    const shortLabels = {
      driveTime: 'Drive',
      surface: 'Surface',
      difficulty: 'Difficulty',
      elevation: 'Elevation',
      lengthBand: 'Length',
      timeOfDay: 'Time',
      condition: 'Condition'
    };

    const shortValueLabels = {
      driveTime: { under30: '<30m', '30to60': '30-60m', over60: '>60m' },
      lengthBand: { short: 'Short', medium: 'Med', long: 'Long' },
      difficulty: { easy: 'Easy', moderate: 'Mod', hard: 'Hard' },
      elevation: { low: 'Flat', medium: 'Climb', high: 'Steep' }
    };

    const prettyValue = shortValueLabels[filterType]?.[filterValue] || String(filterValue || '').trim();
    return `${shortLabels[filterType] || filterType}: ${prettyValue}`;
  }

  function buildExplorerFilterState(selection) {
    const base = {
      searchName: '',
      region: '',
      difficulty: '',
      surface: '',
      lengthBand: '',
      driveTimeBand: '',
      traffic: '',
      state: '',
      city: '',
      cost: '',
      hours: '',
      tag: ''
    };

    const selected = selection || {};
    const searchTokens = [];

    Object.entries(selected).forEach(([filterType, filterValue]) => {
      if (filterType === 'driveTime') {
        base.driveTimeBand = String(filterValue || '');
      } else if (filterType === 'surface') {
        base.surface = String(filterValue || '');
      } else if (filterType === 'difficulty') {
        base.difficulty = String(filterValue || '');
      } else if (filterType === 'elevation') {
        if (!base.difficulty) {
          if (filterValue === 'low') base.difficulty = 'easy';
          else if (filterValue === 'medium') base.difficulty = 'moderate';
          else if (filterValue === 'high') base.difficulty = 'hard';
        }
      } else if (filterType === 'lengthBand') {
        base.lengthBand = String(filterValue || '');
      } else if (filterType === 'timeOfDay' || filterType === 'condition') {
        const token = String(filterValue || '').trim();
        if (token) searchTokens.push(token);
      }
    });

    base.searchName = searchTokens.join(' ').trim();
    return base;
  }

  function bikeTrailMatchesFilters(trail, filters) {
    if (filters.searchName) {
      const haystack = [trail.name, trail.region, trail.city, trail.vibes, trail.moodTags].map(norm).join(' ');
      if (!haystack.includes(norm(filters.searchName))) return false;
    }
    if (filters.region && !norm(trail.region).includes(norm(filters.region))) return false;
    if (filters.difficulty && !norm(trail.difficulty).includes(norm(filters.difficulty))) return false;
    if (filters.surface && !norm(trail.surface).includes(norm(filters.surface))) return false;
    if (filters.traffic && !norm(trail.traffic).includes(norm(filters.traffic))) return false;
    if (filters.state && !norm(trail.state).includes(norm(filters.state))) return false;
    if (filters.city && !norm(trail.city).includes(norm(filters.city))) return false;
    if (filters.cost && !norm(trail.cost).includes(norm(filters.cost))) return false;
    if (filters.hours && !norm(trail.hours).includes(norm(filters.hours))) return false;
    if (filters.tag) {
      const allTags = getBikeDisplayTags(trail).map(norm);
      const needle = norm(filters.tag);
      if (!allTags.some((tag) => tag.includes(needle))) return false;
    }
    if (!inBandLength(trail.lengthMiles, filters.lengthBand)) return false;
    if (!inBandDrive(trail.driveMinutes, filters.driveTimeBand)) return false;
    return true;
  }

  function getExplorerPreviewMatchCount() {
    const previewFilters = buildExplorerFilterState(explorerState.selectedFilters);
    return getAllBikeTrails().filter((trail) => bikeTrailMatchesFilters(trail, previewFilters)).length;
  }

  function getExplorerSelectionEntries() {
    return Object.entries(explorerState.selectedFilters || {});
  }

  function getTrailDifficultyBand(trail) {
    const diff = norm(trail.difficulty);
    if (diff.includes('easy')) return 'easy';
    if (diff.includes('moderate') || diff.includes('intermediate')) return 'moderate';
    if (diff.includes('hard') || diff.includes('advanced') || diff.includes('expert')) return 'hard';
    const score = parseNumber(trail.difficultyScore);
    if (score > 0) {
      if (score <= 33) return 'easy';
      if (score <= 66) return 'moderate';
      return 'hard';
    }
    return '';
  }

  function getTrailElevationBand(trail) {
    const gain = Number(trail.elevationGain || 0);
    if (gain <= 500) return 'low';
    if (gain <= 1500) return 'medium';
    return 'high';
  }

  function matchesExplorerCriterion(trail, filterType, filterValue) {
    const value = String(filterValue || '').trim();
    if (!filterType || !value) return false;

    if (filterType === 'driveTime') return inBandDrive(trail.driveMinutes, value);
    if (filterType === 'lengthBand') return inBandLength(trail.lengthMiles, value);
    if (filterType === 'surface') return norm(trail.surface).includes(norm(value));
    if (filterType === 'difficulty') {
      const trailBand = getTrailDifficultyBand(trail);
      return trailBand ? trailBand === value : norm(trail.difficulty).includes(norm(value));
    }
    if (filterType === 'elevation') return getTrailElevationBand(trail) === value;

    if (filterType === 'timeOfDay') {
      const haystack = [trail.bestTimeOfDay, trail.vibes, trail.moodTags, trail.notes].map(norm).join(' ');
      return haystack.includes(norm(value));
    }

    if (filterType === 'condition') {
      const haystack = [trail.weatherSuitability, trail.rideRiskProfile, trail.seasonalNotes, trail.notes].map(norm).join(' ');
      return haystack.includes(norm(value));
    }

    return false;
  }

  function scoreTrailForExplorerSelection(trail, selectionEntries) {
    const entries = Array.isArray(selectionEntries) ? selectionEntries : [];
    const matchedCount = entries.reduce((sum, [type, value]) => (
      sum + (matchesExplorerCriterion(trail, type, value) ? 1 : 0)
    ), 0);
    const ratingBoost = Number(trail.myRating || 0) * 2;
    const drivePenalty = Number(trail.driveMinutes || 0) / 90;
    return (matchedCount * 100) + ratingBoost - drivePenalty;
  }

  function getWhyMatchedChipsForTrail(trail, selectionEntries, fallbackCount = 2) {
    const entries = Array.isArray(selectionEntries) ? selectionEntries : [];
    const matched = entries
      .filter(([type, value]) => matchesExplorerCriterion(trail, type, value))
      .map(([type, value]) => getExplorerFilterLabelShort(type, value));

    if (matched.length) return matched.slice(0, 3);

    const fallback = [];
    if (trail.driveMinutes > 0) fallback.push(`${trail.driveMinutes}m drive`);
    if (trail.lengthMiles > 0) fallback.push(`${trail.lengthMiles}mi`);
    if (trail.difficulty) fallback.push(trail.difficulty.charAt(0).toUpperCase() + trail.difficulty.slice(1));
    return fallback.slice(0, fallbackCount);
  }

  function getTopExplorerPreviewTrails(limit = 3) {
    const selectionEntries = getExplorerSelectionEntries();
    const previewFilters = buildExplorerFilterState(explorerState.selectedFilters);
    return getAllBikeTrails()
      .filter((trail) => bikeTrailMatchesFilters(trail, previewFilters))
      .sort((a, b) => {
        const scoreDiff = scoreTrailForExplorerSelection(b, selectionEntries) - scoreTrailForExplorerSelection(a, selectionEntries);
        if (scoreDiff !== 0) return scoreDiff;
        return Number(a.driveMinutes || 0) - Number(b.driveMinutes || 0);
      })
      .slice(0, Math.max(1, limit));
  }

  function getClosestExplorerCandidates(limit = 3) {
    const selectionEntries = getExplorerSelectionEntries();
    if (!selectionEntries.length) return [];

    return getAllBikeTrails()
      .map((trail) => {
        const matchedCount = selectionEntries.reduce((sum, [type, value]) => (
          sum + (matchesExplorerCriterion(trail, type, value) ? 1 : 0)
        ), 0);
        return { trail, matchedCount, score: scoreTrailForExplorerSelection(trail, selectionEntries) };
      })
      .filter((entry) => entry.matchedCount > 0)
      .sort((a, b) => {
        if (b.matchedCount !== a.matchedCount) return b.matchedCount - a.matchedCount;
        return b.score - a.score;
      })
      .slice(0, Math.max(1, limit));
  }

  function buildSmartRelaxSuggestions(limit = 2) {
    const selected = explorerState.selectedFilters || {};
    const selectedKeys = Object.keys(selected);
    if (!selectedKeys.length) return [];

    const closest = getClosestExplorerCandidates(5);
    if (!closest.length) return selectedKeys.slice(0, limit);

    const mismatchCounts = {};
    selectedKeys.forEach((key) => { mismatchCounts[key] = 0; });

    closest.forEach(({ trail }) => {
      selectedKeys.forEach((key) => {
        if (!matchesExplorerCriterion(trail, key, selected[key])) {
          mismatchCounts[key] += 1;
        }
      });
    });

    return selectedKeys
      .sort((a, b) => (mismatchCounts[b] || 0) - (mismatchCounts[a] || 0))
      .slice(0, Math.max(1, limit));
  }

  function ensureExplorerFeedbackUI(modal) {
    if (!modal) return;
    if (document.getElementById('bikeExplorerFeedbackWrap')) return;

    const tabsBar = modal.querySelector('.bike-explorer-tab')?.parentElement;
    if (!tabsBar) return;

    const wrap = document.createElement('div');
    wrap.id = 'bikeExplorerFeedbackWrap';
    wrap.style.cssText = 'padding: 12px 24px; border-bottom: 1px solid #e5e7eb; background: #faf5ff;';
    wrap.innerHTML = `
      <div style="display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;">
        <div id="bikeExplorerLiveCount" style="font-size:13px;font-weight:700;color:#6d28d9;">Matching trails: --</div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <select id="bikeExplorerPresetSelect" style="padding:6px 8px;border:1px solid #d1d5db;border-radius:6px;background:white;font-size:12px;min-width:180px;">
            <option value="">Saved presets...</option>
          </select>
          <button id="bikeExplorerLoadPresetBtn" type="button" class="bike-explorer-action-btn bike-explorer-action-btn-primary">Load</button>
          <button id="bikeExplorerSavePresetBtn" type="button" class="bike-explorer-action-btn bike-explorer-action-btn-outline">Save Current</button>
          <button id="bikeExplorerRenamePresetBtn" type="button" class="bike-explorer-action-btn bike-explorer-action-btn-outline">Rename</button>
          <button id="bikeExplorerDeletePresetBtn" type="button" class="bike-explorer-action-btn bike-explorer-action-btn-neutral">Delete</button>
          <button id="bikeExplorerSetDefaultPresetBtn" type="button" class="bike-explorer-action-btn bike-explorer-action-btn-outline">Set Default</button>
        </div>
      </div>
      <div id="bikeExplorerPresetMeta" style="margin-top:6px;font-size:11px;color:#6b7280;"></div>
      <label style="display:inline-flex;align-items:center;gap:6px;margin-top:6px;font-size:12px;color:#6b7280;">
        <input id="bikeExplorerAutoApplyToggle" type="checkbox" /> Auto-apply default preset on open
      </label>
      <div id="bikeExplorerPresetEditor" style="display:none;margin-top:8px;gap:8px;align-items:center;flex-wrap:wrap;">
        <span id="bikeExplorerPresetEditorLabel" style="font-size:12px;color:#6d28d9;font-weight:700;">Preset Name</span>
        <input id="bikeExplorerPresetNameInput" type="text" maxlength="80" placeholder="Preset name" style="padding:6px 8px;border:1px solid #d1d5db;border-radius:6px;background:white;font-size:12px;min-width:220px;" />
        <button id="bikeExplorerPresetEditorSaveBtn" type="button" class="bike-explorer-action-btn bike-explorer-action-btn-primary">Save</button>
        <button id="bikeExplorerPresetEditorCancelBtn" type="button" class="bike-explorer-action-btn bike-explorer-action-btn-neutral">Cancel</button>
      </div>
      <div id="bikeExplorerSelectedChips" style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;"></div>
      <div id="bikeExplorerHint" style="margin-top:8px;font-size:12px;color:#7c3aed;"></div>
      <div id="bikeExplorerPreviewCards" class="bike-explorer-preview-cards"></div>
    `;

    tabsBar.insertAdjacentElement('afterend', wrap);
  }

  function renderExplorerPresetOptions() {
    const select = document.getElementById('bikeExplorerPresetSelect');
    if (!select) return;
    const presets = getExplorerPresets();
    const defaultPreset = getDefaultExplorerPresetName();
    select.innerHTML = '<option value="">Saved presets...</option>' + presets.map((preset) => {
      const optionLabel = preset.name === defaultPreset ? `Default: ${preset.name}` : preset.name;
      return `<option value="${escapeHtml(preset.name)}">${escapeHtml(optionLabel)}</option>`;
    }).join('');

    const lastUsed = getLastUsedExplorerPresetName();
    if (lastUsed && presets.some((entry) => entry.name === lastUsed)) {
      select.value = lastUsed;
    }

    renderExplorerPresetMetaUI();
  }

  function renderExplorerPresetMetaUI() {
    const meta = document.getElementById('bikeExplorerPresetMeta');
    const select = document.getElementById('bikeExplorerPresetSelect');
    const setDefaultBtn = document.getElementById('bikeExplorerSetDefaultPresetBtn');
    const autoApplyToggle = document.getElementById('bikeExplorerAutoApplyToggle');
    const defaultPreset = getDefaultExplorerPresetName();
    const selected = String(select?.value || '').trim();

    if (autoApplyToggle) autoApplyToggle.checked = isExplorerAutoApplyEnabled();
    if (meta) {
      meta.textContent = defaultPreset
        ? `Default preset: ${defaultPreset}`
        : 'No default preset selected.';
    }
    if (setDefaultBtn) {
      if (selected && defaultPreset && selected === defaultPreset) {
        setDefaultBtn.textContent = 'Clear Default';
      } else {
        setDefaultBtn.textContent = 'Set Default';
      }
    }
  }

  function setOrClearDefaultFromSelectedPreset() {
    const select = document.getElementById('bikeExplorerPresetSelect');
    const selectedName = String(select?.value || '').trim();
    if (!selectedName) {
      window.showToast?.('Choose a preset first.', 'info', 1800);
      return;
    }

    const defaultPreset = getDefaultExplorerPresetName();
    if (defaultPreset && defaultPreset === selectedName) {
      setDefaultExplorerPresetName('');
      window.showToast?.('Default preset cleared.', 'info', 1800);
    } else {
      setDefaultExplorerPresetName(selectedName);
      window.showToast?.(`Set default preset: ${selectedName}`, 'success', 1800);
    }

    renderExplorerPresetOptions();
    if (select) select.value = selectedName;
    renderExplorerPresetMetaUI();
  }

  function showExplorerPresetEditor(mode, initialName = '') {
    const editor = document.getElementById('bikeExplorerPresetEditor');
    const input = document.getElementById('bikeExplorerPresetNameInput');
    const label = document.getElementById('bikeExplorerPresetEditorLabel');
    if (!editor || !input || !label) return;

    explorerState.presetEditMode = String(mode || 'save');
    label.textContent = explorerState.presetEditMode === 'rename' ? 'Rename Preset' : 'Save Preset';
    input.value = String(initialName || '').trim();
    editor.style.display = 'flex';
    input.focus();
    input.select();
  }

  function hideExplorerPresetEditor() {
    const editor = document.getElementById('bikeExplorerPresetEditor');
    const input = document.getElementById('bikeExplorerPresetNameInput');
    if (editor) editor.style.display = 'none';
    if (input) input.value = '';
    explorerState.presetEditMode = '';
  }

  function renderExplorerSelectedChips() {
    const container = document.getElementById('bikeExplorerSelectedChips');
    if (!container) return;

    const entries = Object.entries(explorerState.selectedFilters || {});
    if (!entries.length) {
      container.innerHTML = '<span style="font-size:12px;color:#94a3b8;">No selections yet. Pick options to preview matching trails.</span>';
      return;
    }

    container.innerHTML = entries.map(([filterType, filterValue]) => {
      const label = getExplorerFilterLabel(filterType, filterValue);
      return `<button type="button" class="bike-explorer-chip-remove bike-explorer-chip-remove-btn" data-explorer-chip-type="${escapeHtml(filterType)}">${escapeHtml(label)} ×</button>`;
    }).join('');
  }

  function renderExplorerFeedbackUI() {
    const countEl = document.getElementById('bikeExplorerLiveCount');
    const hintEl = document.getElementById('bikeExplorerHint');
    const previewEl = document.getElementById('bikeExplorerPreviewCards');
    const previewCount = getExplorerPreviewMatchCount();
    const selectionEntries = getExplorerSelectionEntries();

    if (countEl) {
      const label = previewCount === 1 ? 'trail' : 'trails';
      countEl.textContent = `Matching trails: ${previewCount} ${label}`;
    }

    if (hintEl) {
      const selected = explorerState.selectedFilters || {};
      const restoredBadgeLine = explorerState.restoredPresetName
        ? `<div class="bike-explorer-restored-line"><span class="bike-explorer-restored-label">↺ Restored preset</span><span class="bike-explorer-restored-name">${escapeHtml(explorerState.restoredPresetName)}</span></div>`
        : '';
      if (!Object.keys(selected).length) {
        hintEl.innerHTML = `${restoredBadgeLine}<div>Tip: pick one or more criteria to narrow results before applying.</div>`;
      } else if (previewCount === 0) {
        const suggestions = buildSmartRelaxSuggestions(2);
        const closest = getClosestExplorerCandidates(1)[0];
        const actions = suggestions.map((key) => {
          return `<button type="button" class="bike-explorer-relax-btn bike-explorer-relax-btn-ui" data-explorer-relax="${escapeHtml(key)}">Relax ${escapeHtml(getExplorerFilterLabel(key, selected[key]).split(':')[0])}</button>`;
        }).join('');
        const closestText = closest
          ? ` Closest match: ${escapeHtml(closest.trail.name)} (${closest.matchedCount}/${selectionEntries.length} criteria).`
          : '';
        hintEl.innerHTML = `${restoredBadgeLine}<div>No exact matches yet.${closestText} Try a smart relax suggestion.${actions}</div>`;
      } else {
        hintEl.innerHTML = `${restoredBadgeLine}<div>Looks good. Click Apply Filters & Close to update your trail list.</div>`;
      }
    }

    if (previewEl) {
      if (previewCount === 0) {
        previewEl.innerHTML = '';
      } else {
        const topPreview = getTopExplorerPreviewTrails(3);
        previewEl.innerHTML = topPreview.map((trail) => {
          const whyChips = getWhyMatchedChipsForTrail(trail, selectionEntries).map((chip) => {
            return `<span class="bike-explorer-preview-why-chip">${escapeHtml(chip)}</span>`;
          }).join('');
          return `
            <div class="bike-explorer-preview-card">
              <div class="bike-explorer-preview-card-top">
                <strong class="bike-explorer-preview-card-title">${escapeHtml(trail.name || 'Trail')}</strong>
                <span class="bike-explorer-preview-card-meta">${escapeHtml(String(trail.driveMinutes || 0))} min drive • ${escapeHtml(String(trail.lengthMiles || 0))} mi</span>
              </div>
              <div class="bike-explorer-preview-chip-row">${whyChips}</div>
            </div>
          `;
        }).join('');
      }
    }

    renderExplorerSelectedChips();
  }

  function saveCurrentExplorerPreset() {
    const defaultName = getLastUsedExplorerPresetName() || 'My Trail Explorer Preset';
    showExplorerPresetEditor('save', defaultName);
  }

  function commitExplorerPresetEditor() {
    const input = document.getElementById('bikeExplorerPresetNameInput');
    const name = String(input?.value || '').trim();
    const mode = explorerState.presetEditMode || 'save';

    if (!name) {
      window.showToast?.('Enter a preset name.', 'info', 1800);
      input?.focus();
      return;
    }

    if (mode === 'rename') {
      renameSelectedExplorerPreset(name);
      return;
    }

    const currentSelection = { ...explorerState.selectedFilters };
    if (!Object.keys(currentSelection).length) {
      window.showToast?.('Pick at least one explorer filter before saving a preset.', 'info', 2400);
      return;
    }

    let presets = getExplorerPresets();
    const existingIndex = presets.findIndex((entry) => entry.name.toLowerCase() === name.toLowerCase());
    if (existingIndex >= 0) {
      presets[existingIndex] = { name, selectedFilters: currentSelection };
    } else {
      presets.push({ name, selectedFilters: currentSelection });
      if (presets.length > BIKE_EXPLORER_MAX_PRESETS) presets = presets.slice(presets.length - BIKE_EXPLORER_MAX_PRESETS);
    }

    saveExplorerPresets(presets);
    renderExplorerPresetOptions();
    const select = document.getElementById('bikeExplorerPresetSelect');
    if (select) select.value = name;
    setLastUsedExplorerPresetName(name);
    hideExplorerPresetEditor();
    window.showToast?.('✅ Preset saved', 'success', 1800);
  }

  function beginRenameSelectedExplorerPreset() {
    const select = document.getElementById('bikeExplorerPresetSelect');
    const selectedName = String(select?.value || '').trim();
    if (!selectedName) {
      window.showToast?.('Choose a preset to rename.', 'info', 1800);
      return;
    }
    showExplorerPresetEditor('rename', selectedName);
  }

  function renameSelectedExplorerPreset(nextNameInput) {
    const select = document.getElementById('bikeExplorerPresetSelect');
    const selectedName = String(select?.value || '').trim();
    const nextName = String(nextNameInput || '').trim();
    if (!selectedName) {
      window.showToast?.('Choose a preset to rename.', 'info', 1800);
      return;
    }
    if (!nextName) {
      window.showToast?.('Enter a new preset name.', 'info', 1800);
      return;
    }

    let presets = getExplorerPresets();
    const currentIndex = presets.findIndex((entry) => entry.name === selectedName);
    if (currentIndex < 0) {
      window.showToast?.('Preset not found.', 'warning', 2000);
      return;
    }

    const conflictIndex = presets.findIndex((entry) => entry.name.toLowerCase() === nextName.toLowerCase());
    if (conflictIndex >= 0 && conflictIndex !== currentIndex) {
      window.showToast?.('A preset with that name already exists.', 'warning', 2200);
      return;
    }

    presets[currentIndex] = {
      ...presets[currentIndex],
      name: nextName
    };
    saveExplorerPresets(presets);
    if (getDefaultExplorerPresetName() === selectedName) {
      setDefaultExplorerPresetName(nextName);
    }
    renderExplorerPresetOptions();
    if (select) select.value = nextName;
    setLastUsedExplorerPresetName(nextName);
    hideExplorerPresetEditor();
    window.showToast?.('✅ Preset renamed', 'success', 1800);
  }

  function applyExplorerPresetByName(name, options = {}) {
    const presetName = String(name || '').trim();
    const { silent = false, showSuccessToast = false, showRestoredHint = false } = options;
    if (!presetName) {
      if (!silent) window.showToast?.('Choose a preset to load.', 'info', 1800);
      return false;
    }

    const preset = getExplorerPresets().find((entry) => entry.name === presetName);
    if (!preset) {
      if (!silent) window.showToast?.('Preset not found.', 'warning', 2000);
      return false;
    }

    explorerState.selectedFilters = { ...(preset.selectedFilters || {}) };
    explorerState.restoredPresetName = showRestoredHint ? presetName : '';
    updateExplorerUI();
    renderExplorerFeedbackUI();
    setLastUsedExplorerPresetName(presetName);
    if (showSuccessToast) window.showToast?.(`✅ Loaded preset: ${presetName}`, 'success', 1800);
    return true;
  }

  function loadSelectedExplorerPreset() {
    const select = document.getElementById('bikeExplorerPresetSelect');
    const selectedName = String(select?.value || '').trim();
    applyExplorerPresetByName(selectedName, { silent: false, showSuccessToast: true, showRestoredHint: false });
  }

  function deleteSelectedExplorerPreset() {
    const select = document.getElementById('bikeExplorerPresetSelect');
    const selectedName = String(select?.value || '').trim();
    if (!selectedName) {
      window.showToast?.('Choose a preset to delete.', 'info', 1800);
      return;
    }

    const next = getExplorerPresets().filter((entry) => entry.name !== selectedName);
    saveExplorerPresets(next);
    if (getLastUsedExplorerPresetName() === selectedName) {
      setLastUsedExplorerPresetName('');
    }
    if (getDefaultExplorerPresetName() === selectedName) {
      setDefaultExplorerPresetName('');
    }
    renderExplorerPresetOptions();
    if (select) select.value = '';
    hideExplorerPresetEditor();
    window.showToast?.(`🗑️ Deleted preset: ${selectedName}`, 'info', 1800);
  }

  function enterTrailExplorerStandaloneMode(modal) {
    if (!modal || modal.dataset.explorerStandaloneMode === '1') return;
    modal.dataset.explorerStandaloneMode = '1';

    const tabRoot = document.getElementById('bikeTrailsTab');
    const explorerBtn = document.getElementById('bikeTrailExplorerBtn');
    if (explorerBtn) explorerBtn.style.display = 'none';

    // Move explorer to the top so it behaves like in-page content, not a popup layer.
    if (tabRoot && modal.parentElement === tabRoot) {
      const tabHeader = tabRoot.querySelector('header');
      if (tabHeader && tabHeader.nextSibling !== modal) {
        tabRoot.insertBefore(modal, tabHeader.nextSibling);
      } else if (!tabHeader) {
        tabRoot.insertBefore(modal, tabRoot.firstChild);
      }
    }

    modal.style.position = 'static';
    modal.style.inset = 'auto';
    modal.style.background = 'transparent';
    modal.style.padding = '0 0 12px 0';
    modal.style.zIndex = 'auto';
    modal.style.minHeight = 'auto';
    modal.style.display = 'block';

    const panel = modal.firstElementChild;
    if (panel && panel.style) {
      panel.style.width = '100%';
      panel.style.height = 'auto';
      panel.style.maxHeight = 'none';
      panel.style.margin = '0';
      panel.style.border = '1px solid #e5e7eb';
      panel.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
    }

    const closeBtn = document.getElementById('bikeExplorerCloseBtn');
    if (closeBtn) closeBtn.textContent = 'Done';

    const applyBtn = document.getElementById('bikeExplorerApplyBtn');
    if (applyBtn) applyBtn.textContent = 'Apply Filters';
  }

  function openBikeTrailExplorer(options = {}) {
    const { standalone = false } = options;
    const modal = document.getElementById('bikeTrailExplorerModal');
    if (!modal) {
      console.warn('[bike-trails] bikeTrailExplorerModal not found in DOM');
      return;
    }
    // Always re-bind events — the modal may have been added to the DOM after
    // initializeBikeTrailsTab() ran (dynamic tab HTML load).
    bindTrailExplorerEvents();

    // Reset state and show the first tab's content
    explorerState.selectedFilters = {};
    explorerState.restoredPresetName = '';
    updateExplorerUI();
    ensureExplorerFeedbackUI(modal);
    renderExplorerPresetOptions();
    hideExplorerPresetEditor();
    renderExplorerFeedbackUI();

    const defaultPreset = getDefaultExplorerPresetName();
    const lastPreset = getLastUsedExplorerPresetName();
    const presetToRestore = defaultPreset || lastPreset;
    if (presetToRestore) {
      const restored = applyExplorerPresetByName(presetToRestore, { silent: true, showSuccessToast: false, showRestoredHint: true });
      if (restored && defaultPreset && isExplorerAutoApplyEnabled()) {
        applyExplorerFilters();
      }
    }

    // Activate the first tab
    const firstTab = modal.querySelector('.bike-explorer-tab');
    if (firstTab) firstTab.click();

    // Some global safety patches force hidden backdrops to z-index:-1/pointer-events:none.
    // Restore full visibility state explicitly when opening this modal.
    modal.classList.add('visible');
    modal.style.display = 'flex';
    modal.style.pointerEvents = 'auto';
    modal.style.opacity = '1';
    modal.style.zIndex = '2000';

    if (standalone) {
      enterTrailExplorerStandaloneMode(modal);
    }
  }

  function openTrailExplorerWindowImpl() {
    const params = new URLSearchParams(window.location.search || '');
    const isExplorerContext =
      params.get('trailExplorerWindow') === '1' ||
      params.get('trailExplorerWindow') === 'true' ||
      params.get('openTrailExplorer') === '1' ||
      params.get('openTrailExplorer') === 'true';
    if (isExplorerContext) {
      const modal = document.getElementById('bikeTrailExplorerModal');
      if (modal && modal.classList.contains('visible')) {
        return true;
      }
      const standalone = params.get('trailExplorerWindow') === '1' || params.get('trailExplorerWindow') === 'true';
      openBikeTrailExplorer({ standalone });
      return true;
    }

    try {
      const baseUrl = resolvePlannerUrl('HTML Files/trail-explorer-window.html');

      const url = new URL(baseUrl, window.location.href);
      url.searchParams.set('trailExplorerWindow', '1');
      url.searchParams.set('openTrailExplorer', '1');
      const dataKey = cacheBikeTrailDataForExplorerTab();
      if (dataKey) url.searchParams.set('dataKey', dataKey);
      url.searchParams.set('ts', String(Date.now()));

      const explorerTab = window.open(url.toString(), '_blank');
      if (!explorerTab) {
        window.showToast?.('❌ Failed to open Trail Explorer. Check if pop-ups are blocked.', 'error', 5000);
        return false;
      }

      explorerTab.focus();
      return true;
    } catch (error) {
      console.error('❌ Error opening Trail Explorer tab:', error);
      window.showToast?.('❌ Error opening Trail Explorer: ' + (error?.message || error), 'error', 5000);
      return false;
    }
  }

  window.openTrailExplorerWindow = function() {
    const explorerBtn = document.getElementById('bikeTrailExplorerBtn');
    if (explorerBtn) {
      return withBikeActionGuard(explorerBtn, () => openTrailExplorerWindowImpl(), {
        actionKey: 'open:trail-explorer-window',
        dedupeMs: 1200,
        lockTimeoutMs: 5000
      });
    }
    return openTrailExplorerWindowImpl();
  };

  function closeBikeTrailExplorer() {
    const params = new URLSearchParams(window.location.search || '');
    const standalone = params.get('trailExplorerWindow') === '1' || params.get('trailExplorerWindow') === 'true';
    if (standalone) {
      try {
        window.close();
      } catch (error) {
        console.warn('[bike-trails] Could not close standalone explorer tab:', error);
      }
      return;
    }

    const modal = document.getElementById('bikeTrailExplorerModal');
    if (modal) {
      modal.classList.remove('visible');
      modal.style.display = 'none';
      modal.style.pointerEvents = 'none';
      modal.style.opacity = '0';
      modal.style.zIndex = '-1';
    }
  }

  function updateExplorerUI() {
    // Clear all button selections
    document.querySelectorAll('.bike-explorer-option').forEach((btn) => {
      btn.style.borderColor = '#e5e7eb';
      btn.style.background = 'white';
      btn.style.color = 'inherit';
    });

    // Reapply current selections
    Object.entries(explorerState.selectedFilters).forEach(([filterType, filterValue]) => {
      const buttons = document.querySelectorAll(
        `.bike-explorer-option[data-filter-type="${filterType}"][data-filter-value="${filterValue}"]`
      );
      buttons.forEach((btn) => {
        btn.style.borderColor = '#8b5cf6';
        btn.style.background = '#f3e8ff';
        btn.style.color = '#7c3aed';
      });
    });
  }

  function bindTrailExplorerEvents() {
    const modal = document.getElementById('bikeTrailExplorerModal');
    if (!modal) return;
    // Guard: only wire up once per DOM instance
    if (modal.dataset.explorerBound === '1') return;
    modal.dataset.explorerBound = '1';

    // Close button
    const closeBtn = document.getElementById('bikeExplorerCloseBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeBikeTrailExplorer);
    }

    // Tab switching
    modal.querySelectorAll('.bike-explorer-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-explorer-tab');
        if (!tabName) return;

        // Update tab button styles
        modal.querySelectorAll('.bike-explorer-tab').forEach((t) => {
          t.style.borderColor = '#d1d5db';
          t.style.background = 'transparent';
          t.style.color = '#6b7280';
        });
        tab.style.borderColor = '#8b5cf6';
        tab.style.background = 'white';
        tab.style.color = '#8b5cf6';

        // Show matching content, hide others
        modal.querySelectorAll('.bike-explorer-content').forEach((content) => {
          content.style.display = 'none';
        });
        const activeContent = modal.querySelector(`.bike-explorer-content[data-explorer-content="${tabName}"]`);
        if (activeContent) activeContent.style.display = 'block';
      });
    });

    // Option buttons – toggle selection
    modal.querySelectorAll('.bike-explorer-option').forEach((btn) => {
      btn.addEventListener('click', () => {
        const filterType  = btn.getAttribute('data-filter-type');
        const filterValue = btn.getAttribute('data-filter-value');
        if (!filterType || !filterValue) return;

        if (explorerState.selectedFilters[filterType] === filterValue) {
          delete explorerState.selectedFilters[filterType];
        } else {
          explorerState.selectedFilters[filterType] = filterValue;
        }
        explorerState.restoredPresetName = '';
        updateExplorerUI();
        renderExplorerFeedbackUI();
      });
    });

    // Clear button
    const clearBtn = document.getElementById('bikeExplorerClearBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        explorerState.selectedFilters = {};
        explorerState.restoredPresetName = '';
        updateExplorerUI();
        renderExplorerFeedbackUI();
      });
    }

    const savePresetBtn = document.getElementById('bikeExplorerSavePresetBtn');
    if (savePresetBtn) savePresetBtn.addEventListener('click', saveCurrentExplorerPreset);

    const renamePresetBtn = document.getElementById('bikeExplorerRenamePresetBtn');
    if (renamePresetBtn) renamePresetBtn.addEventListener('click', beginRenameSelectedExplorerPreset);

    const loadPresetBtn = document.getElementById('bikeExplorerLoadPresetBtn');
    if (loadPresetBtn) loadPresetBtn.addEventListener('click', loadSelectedExplorerPreset);

    const deletePresetBtn = document.getElementById('bikeExplorerDeletePresetBtn');
    if (deletePresetBtn) deletePresetBtn.addEventListener('click', deleteSelectedExplorerPreset);

    const setDefaultPresetBtn = document.getElementById('bikeExplorerSetDefaultPresetBtn');
    if (setDefaultPresetBtn) setDefaultPresetBtn.addEventListener('click', setOrClearDefaultFromSelectedPreset);

    const autoApplyToggle = document.getElementById('bikeExplorerAutoApplyToggle');
    if (autoApplyToggle) {
      autoApplyToggle.addEventListener('change', () => {
        setExplorerAutoApplyEnabled(!!autoApplyToggle.checked);
        renderExplorerPresetMetaUI();
      });
    }

    const presetSelect = document.getElementById('bikeExplorerPresetSelect');
    if (presetSelect) {
      presetSelect.addEventListener('change', renderExplorerPresetMetaUI);
    }

    const presetEditorSaveBtn = document.getElementById('bikeExplorerPresetEditorSaveBtn');
    if (presetEditorSaveBtn) presetEditorSaveBtn.addEventListener('click', commitExplorerPresetEditor);

    const presetEditorCancelBtn = document.getElementById('bikeExplorerPresetEditorCancelBtn');
    if (presetEditorCancelBtn) presetEditorCancelBtn.addEventListener('click', hideExplorerPresetEditor);

    const presetNameInput = document.getElementById('bikeExplorerPresetNameInput');
    if (presetNameInput) {
      presetNameInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          commitExplorerPresetEditor();
        } else if (event.key === 'Escape') {
          event.preventDefault();
          hideExplorerPresetEditor();
        }
      });
    }

    modal.addEventListener('click', (event) => {
      const chipRemoveBtn = event.target && event.target.closest ? event.target.closest('.bike-explorer-chip-remove') : null;
      if (chipRemoveBtn) {
        const filterType = String(chipRemoveBtn.getAttribute('data-explorer-chip-remove') || '').trim();
        if (filterType) {
          delete explorerState.selectedFilters[filterType];
          explorerState.restoredPresetName = '';
          updateExplorerUI();
          renderExplorerFeedbackUI();
        }
        return;
      }

      const relaxBtn = event.target && event.target.closest ? event.target.closest('.bike-explorer-relax-btn') : null;
      if (relaxBtn) {
        const filterType = String(relaxBtn.getAttribute('data-explorer-relax') || '').trim();
        if (filterType) {
          delete explorerState.selectedFilters[filterType];
          explorerState.restoredPresetName = '';
          updateExplorerUI();
          renderExplorerFeedbackUI();
        }
      }
    });

    ensureExplorerFeedbackUI(modal);
    renderExplorerPresetOptions();
    renderExplorerFeedbackUI();

    // Apply button
    const applyBtn = document.getElementById('bikeExplorerApplyBtn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        applyExplorerFilters();
        const params = new URLSearchParams(window.location.search || '');
        const standalone = params.get('trailExplorerWindow') === '1' || params.get('trailExplorerWindow') === 'true';
        if (!standalone) {
          closeBikeTrailExplorer();
        } else {
          window.showToast?.('✅ Filters applied.', 'success', 1600);
        }
      });
    }

    // Close on backdrop click (clicking outside the white panel)
    modal.addEventListener('click', (e) => {
      if (e.target !== modal) return;
      const params = new URLSearchParams(window.location.search || '');
      const standalone = params.get('trailExplorerWindow') === '1' || params.get('trailExplorerWindow') === 'true';
      if (!standalone) closeBikeTrailExplorer();
    });
  }

  function applyExplorerFilters() {
    // Reset existing filters first
    Object.keys(state.filters).forEach((key) => {
      state.filters[key] = '';
      const inputId = getBikeFilterInputId(key);
      const input = inputId ? document.getElementById(inputId) : null;
      if (input) input.value = '';
    });

    const mappedFilters = buildExplorerFilterState(explorerState.selectedFilters);
    Object.entries(mappedFilters).forEach(([key, value]) => {
      state.filters[key] = value;
      const inputId = getBikeFilterInputId(key);
      const input = inputId ? document.getElementById(inputId) : null;
      if (input) input.value = value;
    });

    // Trigger filter application
    applyBikeFilters();
    if ((window.bikeFilteredTrails || []).length === 0) {
      window.showToast?.('No matches found. Trail Explorer suggestions are shown on the page to help broaden results.', 'info', 3200);
    }
  }

  // ─── Open Bike Trail Details in New Tab ─────────────────────────────────────
  // Dedup guard: prevents double-clicks or rapid re-triggers from opening 2 tabs.
  const BIKE_DETAIL_OPEN_DEDUP_MS = 700;

  window.openBikeTrailDetailsInNewTab = function(sourceIndex) {
    // Ignore if a details tab was opened less than BIKE_DETAIL_OPEN_DEDUP_MS ago.
    const now = Date.now();
    if (now - (window.__bikeDetailLastOpenTs || 0) < BIKE_DETAIL_OPEN_DEDUP_MS) return;
    window.__bikeDetailLastOpenTs = now;

    const trail = trailModel((window.bikeTrailsData || [])[sourceIndex], sourceIndex);
    if (!trail) {
      window.showToast?.('Trail data not available', 'warning', 2000);
      return;
    }

    console.log('[🚴 openBikeTrailDetailsInNewTab] Trail object:', trail);
    console.log('[🚴 openBikeTrailDetailsInNewTab] Trail keys:', Object.keys(trail));

    // Store the trail data in localStorage so the new window can access it
    const detailKey = `bike_trail_detail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create a serializable copy without the row property (which has circular references)
    const cleanTrail = {};
    Object.keys(trail).forEach(key => {
      if (key !== 'row') {
        cleanTrail[key] = trail[key];
      }
    });

    const payload = {
      sourceIndex: sourceIndex,
      data: cleanTrail
    };

    console.log('[🚴 openBikeTrailDetailsInNewTab] Creating payload with structure:', {
      hasSourceIndex: 'sourceIndex' in payload,
      hasData: 'data' in payload,
      sourceIndexValue: payload.sourceIndex,
      dataKeys: Object.keys(payload.data || {}).slice(0, 10)
    });

    try {
      const jsonString = JSON.stringify(payload);
      console.log('[🚴 openBikeTrailDetailsInNewTab] JSON string length:', jsonString.length);
      console.log('[🚴 openBikeTrailDetailsInNewTab] Storing with key:', detailKey);
      window.localStorage.setItem(detailKey, jsonString);
      window.localStorage.setItem('bike_trail_details_latest', detailKey);
      console.log('[🚴 openBikeTrailDetailsInNewTab] Storage successful');
      // Verify what was stored
      const verification = window.localStorage.getItem(detailKey);
      console.log('[🚴 openBikeTrailDetailsInNewTab] Verification - stored data length:', verification ? verification.length : 'null');
      const verifyParsed = JSON.parse(verification);
      console.log('[🚴 openBikeTrailDetailsInNewTab] Verification - parsed data has:', Object.keys(verifyParsed.data || {}).length, 'properties');
    } catch (err) {
      console.warn('[bike-trails] Failed to store detail payload:', err);
    }

    // Resolve the bike-details-window.html URL
    const detailsWindowUrl = resolvePlannerUrl('HTML Files/bike-details-window.html');

    const urlWithParams = `${detailsWindowUrl}?sourceIndex=${sourceIndex}&detailKey=${encodeURIComponent(detailKey)}`;
    console.log('[🚴 openBikeTrailDetailsInNewTab] Opening URL:', urlWithParams);

    const newTab = window.open(urlWithParams, '_blank');
    if (newTab) {
      newTab.focus();
    } else if (typeof window.showToast === 'function') {
      window.showToast('❌ Failed to open details. Check if pop-ups are blocked.', 'error', 5000);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  window.findBikeTrailById = findBikeTrailById;
  window.applyBikeFilters = applyBikeFilters;
  window.changeBikePage = changeBikePage;
  window.toggleBikeTrailFavorite = toggleBikeTrailFavorite;
  window.setBikeRating = setBikeRating;
  window.setBikeVisited = setBikeVisited;
  window.initializeBikeTrailsTab = initializeBikeTrailsTab;
  // Alias expected by tab-content-loader to ensure bike init always runs.
  window.initBikeTrailsTab = initializeBikeTrailsTab;
  window.loadBikeTable = loadBikeData;           // Called by sign-in / auto-login flows
  window.refreshBikeTrailData = refreshBikeTrailData; // Called by Refresh Data button
  window.openBikeTrailExplorer = openBikeTrailExplorer;
  window.closeBikeTrailExplorer = closeBikeTrailExplorer;
  window.initializeBikeTrailsTabState = state;
  window.renderBikeTrailsPage = renderBikeTrailsPage;
  window.getAllBikeTrailModels = getAllBikeTrails;
  window.getBikeColumnIndexByName = getBikeColumnIndex;
  window.updateBikeTrailRowColumns = updateBikeRowColumns;
  window.parseBikeNotesBlob = parseBikeNotesBlob;
  window.serializeBikeNotesBlob = serializeBikeNotesBlob;

  /**
   * Runtime config override – call from browser console if the file/table name is wrong.
   * Example:
   *   window.setBikeConfig({ filePath: 'Copilot_Apps/MyFolder/Trails.xlsx', tableName: 'Sheet1' })
   * Then click "🔄 Refresh Data".
   */
  window.setBikeConfig = function(opts = {}) {
    window.bikeTableConfig = {
      ...(window.bikeTableConfig || {}),
      ...(opts.filePath  ? { filePath:  opts.filePath }  : {}),
      ...(opts.tableName ? { tableName: opts.tableName, tableRef: opts.tableName } : {}),
      ...(opts.tableRef  ? { tableRef:  opts.tableRef }  : {})
    };
    console.log('[bike-trails] Config updated:', window.bikeTableConfig);
    window.showToast?.('⚙️ Bike config updated – click 🔄 Refresh Data to reload', 'info', 4000);
  };

  if (document.readyState !== 'loading') {
    initializeBikeTrailsTab();
  } else {
    document.addEventListener('DOMContentLoaded', initializeBikeTrailsTab, { once: true });
  }
})();
