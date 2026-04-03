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
  const LEGACY_BIKE_PREFS_MIGRATION_KEY = 'bikeTrailPrefsMigratedToExcel';
  const ITEMS_PER_PAGE = 20;

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
    currentPage: 1,
    sortBy: 'name',
    sortAsc: true,
    groupBy: '',
    quickFilters: new Set(),
    showFavoritesOnly: false,
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
      getBikeManagedTags(trail).forEach((tag) => {
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
      return `<button type="button" class="quick-filter-btn${isActive ? ' active' : ''}" data-bike-managed-tag="${escapeHtml(entry.label)}" title="Used on ${entry.count} trail${entry.count === 1 ? '' : 's'}">🏷️ ${escapeHtml(entry.label)} <span style="opacity:0.75;">(${entry.count})</span></button>`;
    }).join('');
  }

  function getAllBikeTrails() {
    const rows = window.bikeTrailsData || [];
    return rows.map((row, idx) => trailModel(row, idx));
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

      return true;
    } catch (err) {
      console.error('[bike-trails] loadBikeData failed:', err.message);
      updateBikeMetadataStatusLine('error', {
        text: 'Failed to load Bike Trail data',
        detail: err.message
      });
      return false;
    }
  }
  // ────────────────────────────────────────────────────────────────────────────

  async function fetchBikeRows(accessToken, filePath, tableRef) {
    const encodedPath = encodeGraphPath(filePath);
    const apiUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/workbook/tables/${encodeURIComponent(tableRef)}/rows`;

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
  }

  async function loadBikeTableSchema(accessToken, filePath, tableRef) {
    const encodedPath = encodeGraphPath(filePath);
    const schemaUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/workbook/tables/${encodeURIComponent(tableRef)}/columns`;
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

    const ratingCol = getBikeColumnIndex(BIKE_PREFERENCE_COLUMNS.rating);
    const favoriteCol = getBikeColumnIndex(BIKE_PREFERENCE_COLUMNS.favorite);
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

  function trailModel(row, sourceIndex) {
    const id = buildTrailId(row, sourceIndex);
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
      visited:               getField(row, 'Visited'),
      googlePlaceId:         getField(row, 'Google Place ID'),

      // Parking + maps
      parkingCapacity:       getField(row, 'Parking Capacity'),
      parkingDifficulty:     getField(row, 'Parking Difficulty'),
      parkingDistanceToTrail:getField(row, 'Parking Distance to Trail'),
      parkingCost:           getField(row, 'Parking Cost'),
      parkingSafetyNotes:    getField(row, 'Parking Safety / Lighting Notes'),
      mapsLink:              getField(row, 'Maps Link') || getField(row, 'Google URL'),
      parkingLink:           getField(row, 'Parking Link'),
      gpsCoordinates:        getField(row, 'GPS Coordinates'),
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

      myRating:              parseNumber(getField(row, BIKE_PREFERENCE_COLUMNS.rating)),
      isFavorite:            isBikeFavoriteFlag(getField(row, BIKE_PREFERENCE_COLUMNS.favorite)),
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

  function renderBikeTrailsPage() {
    const grid = document.getElementById('bikeTrailsCardsGrid');
    const resultsCount = document.getElementById('bikeResultsCount');
    if (!grid) return;

    const total = (window.bikeFilteredTrails || []).length;
    const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
    state.currentPage = Math.min(Math.max(1, state.currentPage), totalPages);

    const startIndex = (state.currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = (window.bikeFilteredTrails || []).slice(startIndex, startIndex + ITEMS_PER_PAGE);

    if (resultsCount) {
      const label = total === 1 ? 'trail' : 'trails';
      resultsCount.textContent = `${total} ${label}`;
    }

    if (!pageItems.length) {
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;text-align:center;padding:40px;color:#9ca3af;">No bike trails match your current filters.</div>';
    } else {
      grid.innerHTML = pageItems.map((trail) => {
        const tags = getBikeDisplayTags(trail);
        const tagPills = tags.map((t) => `<span class="tag-pill">${escapeHtml(t)}</span>`).join('');
        const favIcon = trail.isFavorite ? '💖' : '🤍';
        const rating = Math.max(0, Math.min(5, Number(trail.myRating || 0)));
        const ratingText = rating > 0 ? `${'⭐'.repeat(rating)}${'☆'.repeat(5 - rating)}` : 'No rating';
        const renderKhFeedback = typeof window.renderKhFeedbackBlock === 'function'
          ? window.renderKhFeedbackBlock
          : function(input) {
              const data = input || {};
              const localRating = Math.max(0, Math.min(5, Number(data.ratingValue) || 0));
              const localRatingText = localRating > 0 ? `${'⭐'.repeat(localRating)}${'☆'.repeat(5 - localRating)}` : 'Not yet Reviewed';
              const favNorm = String(data.favoriteValue || '').trim().toLowerCase();
              const localFavorite = favNorm === 'true' || favNorm === '1' || data.favoriteValue === 1
                ? 'Marked as Favorite'
                : 'Not marked as Favorite';
              const visitedNorm = String(data.visitedValue || '').trim().toLowerCase();
              const localVisited = visitedNorm === 'yes'
                ? '<span class="kh-feedback-visited-yes">✅ Visited</span>'
                : 'This Adventure still Awaits...';
              const localNotes = String(data.notesValue || '').trim() || 'No comments yet...';
              return `
                <div class="kh-feedback-block">
                  <div class="kh-feedback-title">K&H Feedback</div>
                  <div class="kh-feedback-row kh-feedback-row-first">Review Rating: <strong>${localRatingText}</strong></div>
                  <div class="kh-feedback-row">Favorite: <strong>${localFavorite}</strong></div>
                  <div class="kh-feedback-row">Visited: ${localVisited}</div>
                  <div class="kh-feedback-row kh-feedback-notes">Notes: ${escapeHtml(localNotes)}</div>
                </div>
              `;
            };

        return `
          <div class="adventure-card bike-trail-card"
               data-card-domain="bike"
               data-bike-source-index="${trail.sourceIndex}"
               data-bike-trail-id="${escapeHtml(trail.id)}"
               data-bike-tag-key="${escapeHtml(getBikeTagKey(trail))}"
               style="cursor:pointer;"
               onclick="window.openBikeTrailDetailsInNewTab(${trail.sourceIndex})"
               title="Click to open details in new tab">
            <div class="card-header">
              <h3 class="card-title">${escapeHtml(trail.name || 'Unnamed Ride')}</h3>
              <div class="card-location">📍 ${escapeHtml(trail.region || trail.city || 'Unknown region')}</div>
              ${trail.driveTime ? `<div class="card-drive-time">🚗 ${escapeHtml(trail.driveTime)}</div>` : ''}
            </div>
            <div class="card-body">
              ${tagPills ? `<div class="card-tags">${tagPills}</div>` : ''}
              ${trail.description ? `<div class="card-description">${escapeHtml(trail.description).substring(0, 140)}${trail.description.length > 140 ? '...' : ''}</div>` : ''}
              <div class="card-info">
                ${trail.lengthMiles ? `<div class="card-info-item">Length: <strong>${escapeHtml(String(trail.lengthMiles))} mi</strong></div>` : ''}
                ${trail.elevationGain ? `<div class="card-info-item">Elevation: <strong>${escapeHtml(String(trail.elevationGain))} ft</strong></div>` : ''}
                ${trail.cost ? `<div class="card-info-item">Cost: <strong>${escapeHtml(trail.cost)}</strong></div>` : ''}
                <div class="card-info-item">Favorite: <strong>${favIcon}</strong></div>
                <div class="card-info-item">Rating: <strong>${ratingText}</strong></div>
              </div>
              ${renderKhFeedback({
                ratingValue: trail.myRating,
                favoriteValue: trail.isFavorite,
                visitedValue: trail.visited,
                notesValue: trail.notes
              })}
            </div>
            <div class="card-footer" style="padding: 10px 16px; background: #f8fafc; border-top: 1px solid #e5e7eb;">
              <div style="font-size: 12px; color: #64748b;">Click card to open details</div>
            </div>
          </div>`;
      }).join('');
    }

    const rangeStart = total ? startIndex + 1 : 0;
    const rangeEnd = total ? Math.min(startIndex + ITEMS_PER_PAGE, total) : 0;
    const visibility = total > ITEMS_PER_PAGE ? 'flex' : 'none';

    const paginationTargets = [
      {
        container: document.getElementById('bikePaginationControls'),
        current: document.getElementById('bikeCurrentPageNum'),
        total: document.getElementById('bikeTotalPagesNum'),
        start: document.getElementById('bikeShowingRangeStart'),
        end: document.getElementById('bikeShowingRangeEnd'),
        all: document.getElementById('bikeTotalResultsNum'),
        prev: document.getElementById('bikePrevPageBtn'),
        next: document.getElementById('bikeNextPageBtn')
      },
      {
        container: document.getElementById('bikePaginationControlsTop'),
        current: document.getElementById('bikeCurrentPageNumTop'),
        total: document.getElementById('bikeTotalPagesNumTop'),
        start: document.getElementById('bikeShowingRangeStartTop'),
        end: document.getElementById('bikeShowingRangeEndTop'),
        all: document.getElementById('bikeTotalResultsNumTop'),
        prev: document.getElementById('bikePrevPageBtnTop'),
        next: document.getElementById('bikeNextPageBtnTop')
      }
    ];

    paginationTargets.forEach((target) => {
      if (!target.container) return;
      target.container.style.display = visibility;
      if (target.current) target.current.textContent = String(state.currentPage);
      if (target.total) target.total.textContent = String(totalPages);
      if (target.start) target.start.textContent = String(rangeStart);
      if (target.end) target.end.textContent = String(rangeEnd);
      if (target.all) target.all.textContent = String(total);
      if (target.prev) target.prev.disabled = state.currentPage <= 1;
      if (target.next) target.next.disabled = state.currentPage >= totalPages;
    });
  }

  function getPreferredTrailMapUrl(trail) {
    return trail.mapsLink || trail.googleMapsTrailhead || trail.googleMapsParking || trail.parkingLink || '';
  }

  function renderBikeModalActionBar(modal, trail, sourceIndex) {
    if (!modal) return;
    // Target the bike-modal-only footer (bk-modal-footer) — never the adventure modal's footer
    const footer = modal.querySelector('.bk-modal-footer');
    if (!footer) return;

    let actionBar = modal.querySelector('#bikeTrailModalActionBar');
    if (!actionBar) {
      actionBar = document.createElement('div');
      actionBar.id = 'bikeTrailModalActionBar';
      actionBar.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:flex-start;margin-right:auto;';
      footer.prepend(actionBar);
    }

    const rating = Math.max(0, Math.min(5, Number(trail.myRating || 0)));
    const mapsUrl = getPreferredTrailMapUrl(trail);

    actionBar.innerHTML = `
      <button type="button" id="bikeTrailModalMapsBtn" class="row-detail-footer-btn" ${mapsUrl ? '' : 'disabled'}>🗺️ Open Maps</button>
      <button type="button" id="bikeTrailModalParkingBtn" class="row-detail-footer-btn" ${trail.parkingLink ? '' : 'disabled'}>🅿️ Parking Map</button>
      <button type="button" id="bikeTrailModalFavoriteBtn" class="row-detail-footer-btn">${trail.isFavorite ? '💖 Favorite' : '🤍 Favorite'}</button>
      <div id="bikeTrailModalRatingControls" style="display:inline-flex;align-items:center;gap:4px;">
        ${[1,2,3,4,5].map((s) => `<button type="button" class="row-detail-footer-btn bike-modal-rating-btn" data-rating="${s}" title="Rate ${s} stars" style="padding:6px 8px;">${rating >= s ? '⭐' : '☆'}</button>`).join('')}
      </div>
    `;


    const mapsBtn = actionBar.querySelector('#bikeTrailModalMapsBtn');
    if (mapsBtn) mapsBtn.onclick = () => {
      if (!mapsUrl) return;
      window.open(mapsUrl, '_blank', 'noopener');
    };

    const parkingBtn = actionBar.querySelector('#bikeTrailModalParkingBtn');
    if (parkingBtn) parkingBtn.onclick = () => {
      if (!trail.parkingLink) return;
      window.open(trail.parkingLink, '_blank', 'noopener');
    };

    const favBtn = actionBar.querySelector('#bikeTrailModalFavoriteBtn');
    if (favBtn) favBtn.onclick = () => {
      window.toggleBikeTrailFavorite(sourceIndex, null);
      const refreshed = trailModel((window.bikeTrailsData || [])[sourceIndex], sourceIndex);
      favBtn.textContent = refreshed.isFavorite ? '💖 Favorite' : '🤍 Favorite';
      renderBikeTrailsPage();
    };

    actionBar.querySelectorAll('.bike-modal-rating-btn').forEach((btn) => {
      btn.onclick = () => {
        const value = Number(btn.getAttribute('data-rating'));
        if (!Number.isInteger(value) || value < 1 || value > 5) return;
        window.setBikeRating(sourceIndex, value);
        const refreshed = trailModel((window.bikeTrailsData || [])[sourceIndex], sourceIndex);
        renderBikeModalActionBar(modal, refreshed, sourceIndex);
      };
    });
  }

  // ─── Bike Trail Details Modal ────────────────────────────────────────────────
  window.showBikeTrailDetails = function(sourceIndex) {
    const rows = window.bikeTrailsData || [];
    if (sourceIndex < 0 || sourceIndex >= rows.length) {
      window.showToast?.('Trail data not available', 'warning', 2000);
      return;
    }
    const trail = trailModel(rows[sourceIndex], sourceIndex);

    const modal   = document.getElementById('bikeTrailDetailModal');
    const backdrop = document.getElementById('bikeTrailDetailModalBackdrop');
    if (!modal) { console.warn('[bike-trails] bikeTrailDetailModal not found in DOM'); return; }

    // ── Populate header ──
    const titleEl    = document.getElementById('bikeTrailDetailTitle');
    const locationEl = document.getElementById('bikeTrailDetailLocation');
    if (titleEl)    titleEl.textContent    = trail.name || 'Unnamed Ride';
    if (locationEl) locationEl.textContent = [trail.region, trail.city, trail.state].filter(Boolean).join(' • ');
    modal.dataset.sourceIndex = String(sourceIndex);

    // ── Populate tab panes (bike-modal uses .bk-tab-pane) ──
    const pane = (tab) => modal.querySelector(`.bk-tab-pane[data-tab="${tab}"]`);

    // Address copy helper — renders value with an inline copy button
    const fieldWithCopy = (label, value) => {
      const raw = String(value == null ? '' : value).trim();
      if (!raw) return field(label, value);
      const safe = escapeHtml(raw);
      const copyBtn = `<button type="button" class="bk-addr-copy-btn" data-copy="${safe}" style="display:inline-flex;align-items:center;gap:3px;margin-left:8px;border:1px solid #d1d5db;background:#f9fafb;color:#374151;border-radius:5px;padding:1px 7px;font-size:11px;font-weight:600;cursor:pointer;vertical-align:middle;" title="Copy ${label}">📋 Copy</button>`;
      return `<div><strong>${label}</strong><br><span style="color:#374151;">${safe}</span>${copyBtn}</div>`;
    };

    // Location and Parking
    const lp = pane('location-parking');
    if (lp) {
      const directionsUrl = (() => {
        if (trail.googleMapsTrailhead && /^https?:\/\//.test(trail.googleMapsTrailhead)) return trail.googleMapsTrailhead;
        if (trail.mapsLink && /^https?:\/\//.test(trail.mapsLink)) return trail.mapsLink;
        if (trail.gpsCoordinates) return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(trail.gpsCoordinates);
        if (trail.city && trail.state) return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(trail.name + ' ' + trail.city + ' ' + trail.state);
        return '';
      })();
      lp.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;padding:16px;">
          ${field('State', trail.state)}
          ${field('City', trail.city)}
          ${field('Drive Time', trail.driveTime)}
          ${fieldWithCopy('GPS Coordinates', trail.gpsCoordinates)}
          ${directionsUrl ? `<div><strong>Directions</strong><br><a href="${escapeHtml(directionsUrl)}" target="_blank" style="color:#3b82f6;">Get Directions ↗</a></div>` : field('Directions', '')}
          ${field('Parking Capacity', trail.parkingCapacity)}
          ${field('Parking Difficulty', trail.parkingDifficulty)}
          ${field('Parking Distance to Trail', trail.parkingDistanceToTrail)}
          ${field('Parking Cost', trail.parkingCost)}
          ${field('Parking Safety', trail.parkingSafetyNotes)}
          ${field('Google Place ID', trail.googlePlaceId)}
        </div>`;
    }

    // Maps
    const maps = pane('maps');
    if (maps) maps.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;padding:16px;">
        ${field('Maps Link', trail.mapsLink, true)}
        ${field('Parking Link', trail.parkingLink, true)}
        ${field('GPS Coordinates', trail.gpsCoordinates)}
        ${field('Google Maps Trailhead', trail.googleMapsTrailhead, true)}
        ${field('Google Maps Parking', trail.googleMapsParking, true)}
      </div>`;

    // Overview
    const ov = pane('overview');
    if (ov) ov.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;padding:16px;">
        ${field('Ride Type Classification', trail.rideTypeClassification)}
        ${field('Surface Type', trail.surface)}
        ${field('Surface Breakdown (%)', trail.surfaceBreakdown)}
        ${field('Length (miles)', trail.lengthMiles ? `${trail.lengthMiles} mi` : '')}
        ${field('Difficulty', trail.difficulty)}
        ${field('Difficulty Score (0-100)', trail.difficultyScore)}
        ${field('Ride Commitment Level', trail.rideCommitmentLevel)}
        ${field('Elevation Gain (ft)', trail.elevationGain ? `${trail.elevationGain} ft` : '')}
        ${field('Best Time of Day', trail.bestTimeOfDay)}
        ${field('Ride Flow Profile', trail.rideFlowProfile)}
        ${field('Highlights', trail.highlights)}
        ${field('Hours of Operation', trail.hours)}
        ${field('Recommended Loop', trail.recommendedLoop)}
        ${field('Local Regulations', trail.localRegulations)}
      </div>`;

    // Ride Profile
    const rp = pane('ride-profile');
    if (rp) rp.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;padding:16px;">
        ${field('Ride Start Experience', trail.rideStartExperience)}
        ${field('Ride Finish Experience', trail.rideFinishExperience)}
        ${field('Smoothness Index', trail.smoothnessIndex)}
        ${field('Ride Mood Tags', trail.moodTags)}
        ${field('Vibes', trail.vibes)}
        ${field('Ride Noise Profile', trail.rideNoiseProfile)}
      </div>`;

    // Conditions and Safety
    const cs = pane('conditions-safety');
    if (cs) cs.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;padding:16px;">
        ${field('Ride Risk Profile', trail.rideRiskProfile)}
        ${field('Weather Suitability', trail.weatherSuitability)}
        ${field('Night Riding Suitability', trail.nightRidingSuitability)}
        ${field('Traffic Exposure Rating', trail.trafficExposureRating)}
        ${field('Lighting Notes', trail.parkingSafetyNotes)}
        ${field('Emergency Access Notes', trail.emergencyAccessNotes)}
        ${field('Cell Coverage Notes', trail.cellCoverageNotes)}
      </div>`;

    // Nearby
    const nearby = pane('nearby');
    if (nearby) nearby.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;padding:16px;">
        ${field('Bike Shop Nearby', trail.bikeShopNearby)}
        ${field('Local Shops Nearby', trail.localShopsNearby)}
        ${field('Coffee Nearby', trail.coffeeNearby)}
        ${field('Food Nearby', trail.foodNearby)}
        ${field('Brewery Nearby', trail.breweryNearby)}
      </div>`;

    // Links and Websites
    const links = pane('links-websites');
    if (links) links.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;padding:16px;">
        ${field('AllTrails', trail.allTrails, true)}
        ${field('MTBProject', trail.mtbProject, true)}
        ${field('HikingProject', trail.hikingProject, true)}
        ${field('Singletracks', trail.singletracks, true)}
        ${field('RideWithGPS', trail.rideWithGps, true)}
        ${field('OpenStreetMap', trail.openStreetMap, true)}
        ${field('Official Link 1', trail.officialLink1, true)}
        ${field('Official Link 2', trail.officialLink2, true)}
        ${field('Official Link 3', trail.officialLink3, true)}
        ${field('TrailLink', trail.trailLink, true)}
      </div>`;

    // Along the Trail
    const alongTrail = pane('along-trail');
    if (alongTrail) alongTrail.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;padding:16px;">
        ${field('Photo Spots', trail.photoSpots)}
        ${field('Local Wildlife Notes', trail.localWildlifeNotes)}
        ${field('Local History / Fun Fact', trail.localHistoryFunFact)}
        ${field('Seasonal Notes', trail.seasonalNotes)}
        ${field('Scenic & Nature', trail.scenicNature)}
      </div>`;

    // ── Tab switching: single delegated listener on the modal, bound only once ──
    if (!modal.dataset.bkTabsBound) {
      modal.dataset.bkTabsBound = '1';
      modal.addEventListener('click', (e) => {
        const btn = e.target && e.target.closest ? e.target.closest('.bk-tab-btn') : null;
        if (!btn) return;
        modal.querySelectorAll('.bk-tab-btn').forEach((b) => b.classList.remove('active'));
        modal.querySelectorAll('.bk-tab-pane').forEach((p) => p.classList.remove('active'));
        btn.classList.add('active');
        const target = modal.querySelector(`.bk-tab-pane[data-tab="${btn.dataset.tab}"]`);
        if (target) target.classList.add('active');
      });

      // Address/GPS copy button handler
      modal.addEventListener('click', (e) => {
        const copyBtn = e.target && e.target.closest ? e.target.closest('.bk-addr-copy-btn') : null;
        if (!copyBtn) return;
        const text = copyBtn.getAttribute('data-copy') || '';
        if (!text) return;
        const doCopy = navigator.clipboard && typeof navigator.clipboard.writeText === 'function'
          ? navigator.clipboard.writeText(text)
          : new Promise((res, rej) => {
              try {
                const area = document.createElement('textarea');
                area.value = text;
                area.setAttribute('readonly', '');
                area.style.cssText = 'position:fixed;opacity:0;';
                document.body.appendChild(area);
                area.select();
                document.execCommand('copy') ? res() : rej();
                document.body.removeChild(area);
              } catch (err) { rej(err); }
            });
        doCopy.then(() => {
          const orig = copyBtn.textContent;
          copyBtn.textContent = '✓ Copied';
          copyBtn.style.borderColor = '#86efac';
          copyBtn.style.background = '#ecfdf5';
          copyBtn.style.color = '#047857';
          setTimeout(() => {
            copyBtn.textContent = orig;
            copyBtn.style.borderColor = '';
            copyBtn.style.background = '';
            copyBtn.style.color = '';
          }, 1400);
        }).catch(() => window.prompt('Copy:', text));
      });
    }

    // Reset to first tab
    const firstTabBtn = modal.querySelector('.bk-tab-btn');
    if (firstTabBtn) {
      modal.querySelectorAll('.bk-tab-btn').forEach((b) => b.classList.remove('active'));
      modal.querySelectorAll('.bk-tab-pane').forEach((p) => p.classList.remove('active'));
      firstTabBtn.classList.add('active');
      const firstPane = modal.querySelector(`.bk-tab-pane[data-tab="${firstTabBtn.dataset.tab}"]`);
      if (firstPane) firstPane.classList.add('active');
    }

    renderBikeModalActionBar(modal, trail, sourceIndex);

    // ── Close handlers (always fresh) ──
    const closeFn = () => {
      modal.style.display = 'none';
      if (backdrop) backdrop.style.display = 'none';
    };
    document.getElementById('bikeTrailDetailCloseBtn')?.addEventListener('click', closeFn, { once: true });
    document.getElementById('bikeTrailDetailCloseFooterBtn')?.addEventListener('click', closeFn, { once: true });
    if (backdrop) {
      backdrop.style.display = 'block';
      backdrop.onclick = closeFn;
    }

    // ── Show modal ──
    modal.style.display = 'flex';
  };

  function field(label, value, isLink) {
    const raw = String(value == null ? '' : value).trim();
    if (!raw) {
      return `<div><strong>${label}</strong><br><span style="color:#9ca3af;font-style:italic;">No data yet</span></div>`;
    }

    const safe = escapeHtml(raw);
    const display = isLink && /^https?:\/\//.test(raw)
      ? `<a href="${safe}" target="_blank" style="color:#3b82f6;word-break:break-all;">${safe}</a>`
      : `<span style="color:#374151;">${safe}</span>`;

    return `<div><strong>${label}</strong><br>${display}</div>`;
  }

  // ─── Bike rating & favourite helpers ────────────────────────────────────────
  window.setBikeRating = function(sourceIndex, rating) {
    const trail = (window.bikeTrailsData || [])[sourceIndex];
    if (!trail) return;
    // Update local model
    const ratingCol = getBikeColumnIndex(BIKE_PREFERENCE_COLUMNS.rating);
    if (ratingCol >= 0) {
      const vals = getValues(trail).slice();
      while (vals.length <= ratingCol) vals.push('');
      vals[ratingCol] = rating;
      trail.values = [vals];
    }
    // Optimistic UI – re-render
    applyBikeFilters();
    window.showToast?.(`Rated ${rating} ⭐`, 'success', 1500);
    // Persist to Excel (fire-and-forget)
    if (window.accessToken && ratingCol >= 0) {
      const cfg = window.bikeTableConfig || {};
      updateBikeRowColumns(sourceIndex, { [ratingCol]: rating }, {
        accessToken: window.accessToken,
        filePath: cfg.filePath || BIKE_FILE_PATH_DEFAULT,
        tableRef: cfg.tableRef || BIKE_TABLE_NAME
      }).catch((e) => console.warn('[bike-trails] rating save failed:', e.message));
    }
  };

  window.toggleBikeTrailFavorite = function(sourceIndex, btnEl) {
    const trail = (window.bikeTrailsData || [])[sourceIndex];
    if (!trail) return;
    const favCol = getBikeColumnIndex(BIKE_PREFERENCE_COLUMNS.favorite);
    const vals = getValues(trail).slice();
    const currentFav = isBikeFavoriteFlag(vals[favCol] || '');
    const newFav = !currentFav;
    if (favCol >= 0) {
      while (vals.length <= favCol) vals.push('');
      vals[favCol] = newFav ? 'TRUE' : 'FALSE';
      trail.values = [vals];
    }
    if (btnEl) {
      btnEl.textContent = newFav ? '💖' : '🤍';
      btnEl.classList.toggle('active', newFav);
    }
    window.showToast?.(newFav ? 'Added to favourites' : 'Removed from favourites', 'success', 1500);
    if (window.accessToken && favCol >= 0) {
      const cfg = window.bikeTableConfig || {};
      updateBikeRowColumns(sourceIndex, { [favCol]: newFav ? 'TRUE' : 'FALSE' }, {
        accessToken: window.accessToken,
        filePath: cfg.filePath || BIKE_FILE_PATH_DEFAULT,
        tableRef: cfg.tableRef || BIKE_TABLE_NAME
      }).catch((e) => console.warn('[bike-trails] favourite save failed:', e.message));
    }
  };

  function readFilterControlValue(filterKey) {
    const inputId = getBikeFilterInputId(filterKey);
    const input = inputId ? document.getElementById(inputId) : null;
    return input ? String(input.value || '').trim() : '';
  }

  function refreshFilterStateFromControls() {
    Object.keys(state.filters).forEach((filterKey) => {
      state.filters[filterKey] = readFilterControlValue(filterKey);
    });
    state.groupBy = readFilterControlValue('groupBy');
  }

  function applyBikeFilters() {
    refreshFilterStateFromControls();

    const searchNeedle = norm(state.filters.searchName);
    const regionNeedle = norm(state.filters.region);
    const difficultyNeedle = norm(state.filters.difficulty);
    const surfaceNeedle = norm(state.filters.surface);
    const trafficNeedle = norm(state.filters.traffic);
    const stateNeedle = norm(state.filters.state);
    const cityNeedle = norm(state.filters.city);
    const costNeedle = norm(state.filters.cost);
    const hoursNeedle = norm(state.filters.hours);
    const tagNeedle = norm(state.filters.tag);

    const trails = getAllBikeTrails().filter((trail) => {
      const managedTags = getBikeManagedTags(trail);
      const managedTagText = norm(managedTags.join(' '));

      if (searchNeedle) {
        const searchCorpus = `${trail.name || ''} ${managedTags.join(' ')}`;
        if (!norm(searchCorpus).includes(searchNeedle)) return false;
      }
      if (regionNeedle && !norm(trail.region).includes(regionNeedle)) return false;
      if (difficultyNeedle && !norm(trail.difficulty).includes(difficultyNeedle)) return false;
      if (surfaceNeedle && !norm(trail.surface).includes(surfaceNeedle)) return false;
      if (trafficNeedle && !norm(trail.traffic).includes(trafficNeedle)) return false;
      if (stateNeedle && !norm(trail.state).includes(stateNeedle)) return false;
      if (cityNeedle && !norm(trail.city).includes(cityNeedle)) return false;
      if (costNeedle && !norm(trail.cost).includes(costNeedle)) return false;
      if (hoursNeedle && !norm(trail.hours).includes(hoursNeedle)) return false;
      if (tagNeedle && !managedTagText.includes(tagNeedle)) return false;
      if (!inBandLength(trail.lengthMiles, state.filters.lengthBand)) return false;
      if (!inBandDrive(trail.driveMinutes, state.filters.driveTimeBand)) return false;
      if (state.showFavoritesOnly && !trail.isFavorite) return false;
      for (const quick of state.quickFilters) {
        if (!matchesQuickFilter(trail, quick)) return false;
      }
      return true;
    });

    trails.sort(compareTrails);

    window.bikeFilteredTrails = trails;
    state.currentPage = 1;
    renderBikeBreadcrumbChips();
    renderBikeManagedTagQuickChips();
    renderBikeTrailsPage();
    return trails;
  }

  function changeBikePage(direction) {
    const nextPage = state.currentPage + Number(direction || 0);
    const totalPages = Math.max(1, Math.ceil((window.bikeFilteredTrails || []).length / ITEMS_PER_PAGE));
    state.currentPage = Math.min(Math.max(1, nextPage), totalPages);
    renderBikeTrailsPage();
  }

  function resetAllBikeFilters() {
    Object.keys(state.filters).forEach((filterKey) => {
      state.filters[filterKey] = '';
      const inputId = getBikeFilterInputId(filterKey);
      const input = inputId ? document.getElementById(inputId) : null;
      if (input) input.value = '';
    });

    state.groupBy = '';
    state.quickFilters.clear();
    state.showFavoritesOnly = false;

    document.querySelectorAll('#bikeQuickFiltersCard .quick-filter-btn').forEach((btn) => {
      btn.classList.remove('active');
    });

    const groupBy = document.getElementById('bikeGroupBy');
    if (groupBy) groupBy.value = '';

    applyBikeFilters();
  }

  function bindBikeControls() {
    if (state.controlsBound) return;

    // Guard: do not mark as bound until bike tab DOM is actually present.
    const bikeRootReady = Boolean(document.getElementById('bikeTrailsCardsGrid'));
    if (!bikeRootReady) return;

    const filterKeys = Object.keys(state.filters);
    let boundCount = 0;
    filterKeys.forEach((key) => {
      const id = getBikeFilterInputId(key);
      const input = id ? document.getElementById(id) : null;
      if (!input) return;
      input.addEventListener('input', applyBikeFilters);
      input.addEventListener('change', applyBikeFilters);
      boundCount += 1;
    });

    const groupBy = document.getElementById('bikeGroupBy');
    if (groupBy) {
      groupBy.addEventListener('change', applyBikeFilters);
      boundCount += 1;
    }

    const sortBy = document.getElementById('bikeSortBy');
    if (sortBy) {
      sortBy.addEventListener('change', () => {
        state.sortBy = sortBy.value || 'name';
        applyBikeFilters();
      });
      boundCount += 1;
    }

    const sortOrderBtn = document.getElementById('bikeSortOrderBtn');
    if (sortOrderBtn) {
      sortOrderBtn.addEventListener('click', () => {
        state.sortAsc = !state.sortAsc;
        const icon = sortOrderBtn.querySelector('.sort-icon');
        if (icon) icon.textContent = state.sortAsc ? '↑' : '↓';
        applyBikeFilters();
      });
      boundCount += 1;
    }

    const favoritesBtn = document.getElementById('bikeFavoritesFilterBtn');
    if (favoritesBtn) {
      favoritesBtn.addEventListener('click', () => {
        state.showFavoritesOnly = !state.showFavoritesOnly;
        favoritesBtn.classList.toggle('active', state.showFavoritesOnly);
        applyBikeFilters();
      });
      boundCount += 1;
    }

    const explorerBtn = document.getElementById('bikeTrailExplorerBtn');
    if (explorerBtn && explorerBtn.dataset.boundExplorerClick !== '1') {
      explorerBtn.addEventListener('click', (event) => {
        event.preventDefault();
        window.openBikeTrailExplorer?.();
      });
      explorerBtn.dataset.boundExplorerClick = '1';
      boundCount += 1;
    }

    document.querySelectorAll('#bikeQuickFiltersCard .quick-filter-btn[data-bike-filter]').forEach((btn) => {
      const key = btn.getAttribute('data-bike-filter') || '';
      if (!key || key === 'favorites') return;
      btn.addEventListener('click', () => {
        if (state.quickFilters.has(key)) {
          state.quickFilters.delete(key);
          btn.classList.remove('active');
        } else {
          state.quickFilters.add(key);
          btn.classList.add('active');
        }
        applyBikeFilters();
      });
      boundCount += 1;
    });

    const resetButtons = ['bikeResetAllFiltersTop', 'bikeResetAllFiltersBottom', 'bikeBreadcrumbResetBtn'];
    resetButtons.forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', resetAllBikeFilters);
        boundCount += 1;
      }
    });

    const managedTagContainer = document.getElementById('bikeManagedTagQuickFilters');
    if (managedTagContainer && managedTagContainer.dataset.boundManagedTagClicks !== '1') {
      managedTagContainer.addEventListener('click', (event) => {
        const button = event.target && event.target.closest ? event.target.closest('[data-bike-managed-tag]') : null;
        if (!button) return;
        const tag = String(button.getAttribute('data-bike-managed-tag') || '').trim();
        const input = document.getElementById('bikeFilterTag');
        if (!tag || !input) return;

        const currentlyActive = norm(input.value) === norm(tag);
        input.value = currentlyActive ? '' : tag;
        applyBikeFilters();
      });
      managedTagContainer.dataset.boundManagedTagClicks = '1';
      boundCount += 1;
    }

    state.controlsBound = boundCount > 0;
  }

  function initializeBikeTrailsTab() {
    bindBikeControls();
    updateBikeDebugDetailsLine();

    if (!state.initialized) {
      state.initialized = true;
    }

    // If we already have rows just render them, otherwise try to load.
    if ((window.bikeTrailsData || []).length > 0) {
      applyBikeFilters();
    } else if (window.accessToken) {
      // Token is available – load data immediately (async, non-blocking).
      loadBikeData();
    } else {
      updateBikeMetadataStatusLine('info', {
        text: 'Sign in to load Bike Trail data',
        detail: `${BIKE_FILE_NAME} will load automatically after sign-in`
      });
      applyBikeFilters();
    }
  }

  // ─── Public refresh handler ─────────────────────────────────────────────────
  // Called by the "Refresh Data" button in bike-trails-tab.html.
  // If already signed in, re-fetches Excel data and re-renders cards.
  // If not signed in, triggers sign-in which will call loadBikeData automatically.
  async function refreshBikeTrailData() {
    const btn = document.getElementById('bikeRefreshBtn');
    const originalHTML = btn ? btn.innerHTML : '';

    try {
      if (!window.accessToken) {
        window.showToast?.('🔐 Not signed in – signing in now...', 'info', 3000);
        await window.signIn?.();
        return; // sign-in flow calls loadBikeTable itself
      }

      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '⏳ Refreshing...';
        btn.style.opacity = '0.7';
      }

      window.showToast?.('🔄 Refreshing bike trail data from Excel...', 'info', 2000);
      const ok = await loadBikeData();

      if (ok !== false) {
        window.showToast?.('✅ Bike trail data refreshed!', 'success', 3000);
      }
    } catch (err) {
      console.error('[bike-trails] refreshBikeTrailData error:', err);
      window.showToast?.(`❌ Refresh failed: ${err.message}`, 'error', 5000);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
        btn.style.opacity = '';
      }
    }
  }
  // ─────────────────────────────────────────────────────────────────────────────

  // ─── Trail Explorer System ───────────────────────────────────────────────────
  // Provides an intuitive browsing interface for finding trails by various criteria

  const explorerState = {
    selectedFilters: {} // { filterType: filterValue }
  };

  function openBikeTrailExplorer() {
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
    updateExplorerUI();

    // Activate the first tab
    const firstTab = modal.querySelector('.bike-explorer-tab');
    if (firstTab) firstTab.click();

    modal.style.display = 'flex';
  }

  function closeBikeTrailExplorer() {
    const modal = document.getElementById('bikeTrailExplorerModal');
    if (modal) {
      modal.style.display = 'none';
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
        updateExplorerUI();
      });
    });

    // Clear button
    const clearBtn = document.getElementById('bikeExplorerClearBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        explorerState.selectedFilters = {};
        updateExplorerUI();
      });
    }

    // Apply button
    const applyBtn = document.getElementById('bikeExplorerApplyBtn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        applyExplorerFilters();
        closeBikeTrailExplorer();
      });
    }

    // Close on backdrop click (clicking outside the white panel)
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeBikeTrailExplorer();
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

    // Apply explorer selections
    Object.entries(explorerState.selectedFilters).forEach(([filterType, filterValue]) => {
      if (filterType === 'driveTime') {
        state.filters.driveTimeBand = filterValue;
        const input = document.getElementById('bikeFilterDriveTimeBand');
        if (input) input.value = filterValue;
      } else if (filterType === 'surface') {
        state.filters.surface = filterValue;
        const input = document.getElementById('bikeFilterSurface');
        if (input) input.value = filterValue;
      } else if (filterType === 'difficulty') {
        state.filters.difficulty = filterValue;
        const input = document.getElementById('bikeFilterDifficulty');
        if (input) input.value = filterValue;
      } else if (filterType === 'elevation') {
        // For elevation, we'll mark it but use difficulty
        if (filterValue === 'low') state.filters.difficulty = 'easy';
        else if (filterValue === 'medium') state.filters.difficulty = 'moderate';
        else if (filterValue === 'high') state.filters.difficulty = 'hard';
      } else if (filterType === 'lengthBand') {
        state.filters.lengthBand = filterValue;
        const input = document.getElementById('bikeFilterLengthBand');
        if (input) input.value = filterValue;
      } else if (filterType === 'timeOfDay') {
        // Store in vibes/mood tags for matching
        state.filters.searchName = filterValue;
        const input = document.getElementById('bikeSearchName');
        if (input) input.value = filterValue;
      } else if (filterType === 'condition') {
        // Store condition preference for matching
        state.filters.searchName = filterValue;
        const input = document.getElementById('bikeSearchName');
        if (input) input.value = filterValue;
      }
    });

    // Trigger filter application
    applyBikeFilters();
  }

  // ─── Open Bike Trail Details in New Tab ─────────────────────────────────────
  window.openBikeTrailDetailsInNewTab = function(sourceIndex) {
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
    const detailsWindowUrl = window.resolvePlannerPageUrl
      ? window.resolvePlannerPageUrl('HTML Files/bike-details-window.html')
      : 'HTML Files/bike-details-window.html';

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
  window.initializeBikeTrailsTab = initializeBikeTrailsTab;
  // Alias expected by tab-content-loader to ensure bike init always runs.
  window.initBikeTrailsTab = initializeBikeTrailsTab;
  window.loadBikeTable = loadBikeData;           // Called by sign-in / auto-login flows
  window.refreshBikeTrailData = refreshBikeTrailData; // Called by Refresh Data button
  window.openBikeTrailExplorer = openBikeTrailExplorer;
  window.closeBikeTrailExplorer = closeBikeTrailExplorer;
  window.initializeBikeTrailsTabState = state;
  window.renderBikeTrailsPage = renderBikeTrailsPage;

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
