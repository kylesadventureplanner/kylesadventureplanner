/*
 * Bike Trails Tab System
 * Mirrors Adventure Planner behavior with bike-specific data schema and controls.
 */

(function() {
  const BIKE_FILE_PATH_DEFAULT = 'Copilot_Apps/Kyles_Adventure_Finder/Bike_Trail_Planner.xlsx';
  const BIKE_TABLE_NAME = 'BikeTrails';
  const BIKE_TABLE_CANDIDATES = [BIKE_TABLE_NAME];
  const BIKE_PREFERENCE_COLUMNS = {
    rating: 'My Rating',
    favorite: 'Favorite Status'
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
    'Difficulty Score (0-100)',
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
    'Visitor Center Page'
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
      traffic: ''
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

  function getBikeColumnIndex(fieldName) {
    const dynamicIdx = window.bikeTableConfig?.columnIndexByName?.[fieldName];
    if (Number.isInteger(dynamicIdx)) return dynamicIdx;
    const staticIdx = columnIndex[fieldName];
    return Number.isInteger(staticIdx) ? staticIdx : -1;
  }

  function cacheBikeTableSchema(columnNames) {
    const names = Array.isArray(columnNames)
      ? columnNames.map(name => String(name || '').trim()).filter(Boolean)
      : [];

    const indexByName = {};
    names.forEach((name, idx) => {
      indexByName[name] = idx;
    });

    window.bikeTableConfig = {
      ...(window.bikeTableConfig || {}),
      filePath: BIKE_FILE_PATH_DEFAULT,
      tableName: BIKE_TABLE_NAME,
      tableNameCandidates: BIKE_TABLE_CANDIDATES,
      columnNames: names,
      columnIndexByName: indexByName
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

  async function fetchBikeRows(accessToken, filePath, tableName) {
    const encodedPath = encodeURIComponent(filePath);
    const apiUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/workbook/tables/${encodeURIComponent(tableName)}/rows`;

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Bike trail load failed for Bike_Trail_Planner.xlsx / ${BIKE_TABLE_NAME}: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const rows = Array.isArray(data.value) ? data.value : [];

    return rows.map((row, index) => ({
      values: [Array.isArray(row.values?.[0]) ? row.values[0] : []],
      rowId: row.id,
      index
    }));
  }

  async function loadBikeTableSchema(accessToken, filePath, tableName) {
    const encodedPath = encodeURIComponent(filePath);
    const tablesUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/workbook/tables/${encodeURIComponent(tableName)}/columns`;
    const response = await fetch(tablesUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Unable to load schema for bike table '${BIKE_TABLE_NAME}' (${response.status} ${response.statusText})`);
    }

    const json = await response.json();
    const columnNames = (json.value || []).map(item => item.name).filter(Boolean);
    cacheBikeTableSchema(columnNames);
    return columnNames;
  }

  async function addBikeTableColumn(accessToken, filePath, tableName, columnName, rowCount) {
    const encodedPath = encodeURIComponent(filePath);
    const baseUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/workbook/tables/${encodeURIComponent(tableName)}`;
    const columnValues = [[columnName], ...Array.from({ length: rowCount }, () => [''])];
    const payload = {
      index: null,
      values: columnValues
    };

    const attempts = [
      `${baseUrl}/columns/add`,
      `${baseUrl}/columns`
    ];

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

      if (response.ok) {
        console.log(`✅ Added bike metadata column '${columnName}' using ${url}`);
        return true;
      }

      const detail = await response.text().catch(() => response.statusText || '');
      lastError = `${response.status} ${detail || response.statusText}`;
    }

    throw new Error(`Unable to add bike metadata column '${columnName}' to ${BIKE_TABLE_NAME}: ${lastError}`);
  }

  async function ensureBikePreferenceColumns(accessToken, filePath, tableName, rowCount) {
    const existingColumns = await loadBikeTableSchema(accessToken, filePath, tableName);
    const missingColumns = Object.values(BIKE_PREFERENCE_COLUMNS).filter(name => !existingColumns.includes(name));

    if (!missingColumns.length) return false;

    for (const columnName of missingColumns) {
      await addBikeTableColumn(accessToken, filePath, tableName, columnName, rowCount);
    }

    await loadBikeTableSchema(accessToken, filePath, tableName);
    return true;
  }

  async function updateBikeRowColumns(sourceIndex, updatesByColumnIndex, options = {}) {
    const accessToken = options.accessToken || window.accessToken;
    const filePath = options.filePath || window.bikeTableConfig?.filePath || BIKE_FILE_PATH_DEFAULT;
    const tableName = options.tableName || window.bikeTableConfig?.tableName || BIKE_TABLE_NAME;
    const row = window.bikeTrailsData?.[sourceIndex];

    if (!accessToken) {
      throw new Error('Please sign in to update bike trail preferences in Excel.');
    }
    if (!row) {
      throw new Error(`Bike trail row ${sourceIndex} not found.`);
    }

    const values = getValues(row).slice();
    const updateIndexes = Object.keys(updatesByColumnIndex).map(idx => Number(idx)).filter(Number.isInteger);
    const maxIndex = Math.max(values.length - 1, ...updateIndexes);

    while (values.length <= maxIndex) values.push('');

    Object.entries(updatesByColumnIndex).forEach(([idx, value]) => {
      values[Number(idx)] = value;
    });

    const encodedPath = encodeURIComponent(filePath);
    const apiUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/workbook/tables/${encodeURIComponent(tableName)}/rows/itemAt(index=${sourceIndex})`;
    const response = await fetch(apiUrl, {
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

  async function migrateLegacyBikePreferencesToExcel(accessToken, filePath, tableName) {
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
      const currentRating = Number(trail.myRating || 0);
      const shouldFavorite = legacyFavorites.has(trail.id);

      if (legacyRating > 0 && legacyRating !== currentRating) {
        updates[ratingCol] = legacyRating;
      }
      if (shouldFavorite && !trail.isFavorite) {
        updates[favoriteCol] = 'TRUE';
      }

      if (Object.keys(updates).length > 0) {
        await updateBikeRowColumns(sourceIndex, updates, { accessToken, filePath, tableName });
        updatedAny = true;
      }
    }

    localStorage.removeItem('bikeTrailRatings');
    localStorage.removeItem('bikeTrailFavorites');
    localStorage.setItem(LEGACY_BIKE_PREFS_MIGRATION_KEY, '1');
    return updatedAny;
  }

  function findBikeTrailById(trailId) {
    const filteredMatch = (window.bikeFilteredTrails || []).find(item => item.id === trailId);
    if (filteredMatch) return filteredMatch;

    const rows = window.bikeTrailsData || [];
    for (let index = 0; index < rows.length; index += 1) {
      const trail = trailModel(rows[index], index);
      if (trail.id === trailId) return trail;
    }

    return null;
  }

  function buildTrailId(row, fallbackIndex) {
    const name = getField(row, 'Ride Name');
    const region = getField(row, 'Region');
    const coords = getField(row, 'GPS Coordinates');
    const mapsLink = getField(row, 'Maps Link');
    const base = `${name}|${region}|${coords || mapsLink || fallbackIndex}`;
    return base.trim() || `bike-trail-${fallbackIndex}`;
  }

  function trailModel(row, sourceIndex) {
    return {
      row,
      sourceIndex,
      id: buildTrailId(row, sourceIndex),
      name: getField(row, 'Ride Name'),
      region: getField(row, 'Region'),
      driveTime: getField(row, 'Drive Time'),
      lengthMiles: parseNumber(getField(row, 'Length (miles)')),
      lengthRaw: getField(row, 'Length (miles)'),
      surfaceType: getField(row, 'Surface Type'),
      surfaceBreakdown: getField(row, 'Surface Breakdown (%)'),
      difficulty: getField(row, 'Difficulty'),
      difficultyScore: parseNumber(getField(row, 'Difficulty Score (0-100)')),
      elevationGain: parseNumber(getField(row, 'Elevation Gain (ft)')),
      rideFlowProfile: getField(row, 'Ride Flow Profile'),
      commitment: getField(row, 'Ride Commitment Level'),
      rideType: getField(row, 'Ride Type Classification'),
      vibes: getField(row, 'Vibes'),
      moodTags: getField(row, 'Ride Mood Tags'),
      startExperience: getField(row, 'Ride Start Experience'),
      finishExperience: getField(row, 'Ride Finish Experience'),
      bestTimeOfDay: getField(row, 'Best Time of Day'),
      noiseProfile: getField(row, 'Ride Noise Profile'),
      weatherSuitability: getField(row, 'Weather Suitability'),
      seasonalNotes: getField(row, 'Seasonal Notes'),
      highlights: getField(row, 'Scenic & Nature Highlights'),
      photoSpots: getField(row, 'Photo Spots'),
      wildlifeNotes: getField(row, 'Local Wildlife Notes'),
      historyFact: getField(row, 'Local History / Fun Fact'),
      trafficExposure: getField(row, 'Traffic Exposure Rating'),
      rideRisk: getField(row, 'Ride Risk Profile'),
      smoothness: getField(row, 'Ride Smoothness Index'),
      nightSuitability: getField(row, 'Night Riding Suitability'),
      parkingCapacity: getField(row, 'Parking Capacity'),
      parkingDifficulty: getField(row, 'Parking Difficulty'),
      parkingDistance: getField(row, 'Parking Distance to Trail'),
      parkingCost: getField(row, 'Parking Cost'),
      parkingSafety: getField(row, 'Parking Safety / Lighting Notes'),
      regulations: getField(row, 'Local Regulations'),
      emergencyAccess: getField(row, 'Emergency Access Notes'),
      cellCoverage: getField(row, 'Cell Coverage Notes'),
      coffeeNearby: getField(row, 'Coffee Nearby'),
      foodNearby: getField(row, 'Food Nearby'),
      breweryNearby: getField(row, 'Brewery Nearby'),
      bikeShopNearby: getField(row, 'Bike Shop Nearby'),
      localShopsNearby: getField(row, 'Local Shops Nearby'),
      gpsCoordinates: getField(row, 'GPS Coordinates'),
      mapsLink: getField(row, 'Maps Link'),
      parkingLink: getField(row, 'Parking Link'),
      recommendedLoop: getField(row, 'Recommended Loop'),
      googleMapsTrailhead: getField(row, 'Google Maps Trailhead'),
      googleMapsParking: getField(row, 'Google Maps Parking'),
      trailLink: getField(row, 'TrailLink'),
      allTrails: getField(row, 'AllTrails'),
      mtbProject: getField(row, 'MTBProject'),
      hikingProject: getField(row, 'HikingProject'),
      singletracks: getField(row, 'Singletracks'),
      rideWithGps: getField(row, 'RideWithGPS'),
      openStreetMap: getField(row, 'OpenStreetMap'),
      countyCityPage: getField(row, 'County/City Page'),
      visitorCenterPage: getField(row, 'Visitor Center Page'),
      officialLink1: getField(row, 'Official Link 1'),
      officialLink2: getField(row, 'Official Link 2'),
      officialLink3: getField(row, 'Official Link 3'),
      myRating: parseNumber(getField(row, BIKE_PREFERENCE_COLUMNS.rating)),
      favoriteStatus: getField(row, BIKE_PREFERENCE_COLUMNS.favorite),
      isFavorite: isBikeFavoriteFlag(getField(row, BIKE_PREFERENCE_COLUMNS.favorite))
    };
  }

  function getRatings() {
    return (window.bikeTrailsData || []).reduce((acc, row, idx) => {
      const trail = trailModel(row, idx);
      acc[trail.id] = Number(trail.myRating || 0);
      return acc;
    }, {});
  }

  function updateFilterStateFromUI() {
    const byId = (id) => document.getElementById(id);
    state.filters.searchName = (byId('bikeSearchName')?.value || '').trim();
    state.filters.region = (byId('bikeFilterRegion')?.value || '').trim();
    state.filters.difficulty = (byId('bikeFilterDifficulty')?.value || '').trim();
    state.filters.surface = (byId('bikeFilterSurface')?.value || '').trim();
    state.filters.lengthBand = byId('bikeFilterLengthBand')?.value || '';
    state.filters.driveTimeBand = byId('bikeFilterDriveTimeBand')?.value || '';
    state.filters.traffic = (byId('bikeFilterTraffic')?.value || '').trim();
    state.sortBy = byId('bikeSortBy')?.value || state.sortBy;
    state.groupBy = byId('bikeGroupBy')?.value || '';
  }

  function matchesLengthBand(lengthMiles, band) {
    if (!band) return true;
    if (band === 'short') return lengthMiles <= 10;
    if (band === 'medium') return lengthMiles > 10 && lengthMiles <= 25;
    if (band === 'long') return lengthMiles > 25;
    return true;
  }

  function matchesDriveBand(minutes, band) {
    if (!band) return true;
    if (band === 'under30') return minutes > 0 && minutes < 30;
    if (band === '30to60') return minutes >= 30 && minutes <= 60;
    if (band === 'over60') return minutes > 60;
    return true;
  }

  function matchesQuickFilter(trail, quickFilter) {
    const difficulty = norm(trail.difficulty);
    const surface = norm(trail.surfaceType);
    const vibeBlob = norm(`${trail.vibes} ${trail.moodTags} ${trail.rideType}`);

    switch (quickFilter) {
      case 'easy':
      case 'moderate':
      case 'hard':
        return difficulty.includes(quickFilter);
      case 'paved':
        return surface.includes('paved');
      case 'gravel':
        return surface.includes('gravel') || surface.includes('dirt');
      case 'under30':
        return parseDriveMinutes(trail.driveTime) > 0 && parseDriveMinutes(trail.driveTime) < 30;
      case 'low-elevation':
        return trail.elevationGain <= 500;
      case 'family':
        return vibeBlob.includes('family') || vibeBlob.includes('beginner');
      case 'coffee':
        return isTruthyFlag(trail.coffeeNearby);
      default:
        return true;
    }
  }

  function getTrailGroupMeta(trail, groupBy) {
    switch (groupBy) {
      case 'Region':
        return { label: trail.region || 'Unknown Region', sortValue: norm(trail.region) || 'zzz-region' };
      case 'Difficulty': {
        const difficulty = norm(trail.difficulty);
        const rank = difficulty.includes('easy') ? '1' : difficulty.includes('moderate') ? '2' : difficulty.includes('hard') ? '3' : '9';
        return { label: trail.difficulty || 'Unknown Difficulty', sortValue: `${rank}-${difficulty || 'unknown'}` };
      }
      case 'Surface Type':
        return { label: trail.surfaceType || 'Unknown Surface', sortValue: norm(trail.surfaceType) || 'zzz-surface' };
      case 'Drive Time': {
        const minutes = parseDriveMinutes(trail.driveTime);
        if (!minutes) return { label: 'Unknown Drive Time', sortValue: '9-unknown' };
        if (minutes < 30) return { label: 'Under 30 min', sortValue: '1-under-30' };
        if (minutes <= 60) return { label: '30-60 min', sortValue: '2-30-60' };
        return { label: 'Over 60 min', sortValue: '3-over-60' };
      }
      default:
        return { label: '', sortValue: '' };
    }
  }

  function renderGroupHeader(label) {
    return `
      <div class="card" style="grid-column: 1 / -1; margin-bottom: 0; padding: 14px 18px; background: linear-gradient(135deg, #eff6ff 0%, #f8fbff 100%); border-color: #bfdbfe;">
        <div class="card-title" style="font-size: 16px; color: #1d4ed8;">🗂️ ${escapeHtml(label)}</div>
      </div>
    `;
  }

  function applySort(trails) {
    const ratings = getRatings();
    const direction = state.sortAsc ? 1 : -1;

    const difficultyRank = (text) => {
      const value = norm(text);
      if (value.includes('easy')) return 1;
      if (value.includes('moderate')) return 2;
      if (value.includes('hard')) return 3;
      return 99;
    };

    const getComparable = (trail) => {
      switch (state.sortBy) {
        case 'driveTime':
          return parseDriveMinutes(trail.driveTime);
        case 'length':
          return trail.lengthMiles;
        case 'difficulty':
          return trail.difficultyScore || difficultyRank(trail.difficulty);
        case 'elevation':
          return trail.elevationGain;
        case 'surface':
          return norm(trail.surfaceType);
        case 'rating':
          return Number(ratings[trail.id] || trail.myRating || 0);
        case 'name':
        default:
          return norm(trail.name);
      }
    };

    trails.sort((a, b) => {
      if (state.groupBy) {
        const aGroup = getTrailGroupMeta(a, state.groupBy).sortValue;
        const bGroup = getTrailGroupMeta(b, state.groupBy).sortValue;
        const groupCompare = String(aGroup).localeCompare(String(bGroup));
        if (groupCompare !== 0) return groupCompare;
      }

      const av = getComparable(a);
      const bv = getComparable(b);
      if (typeof av === 'string' || typeof bv === 'string') {
        return direction * String(av).localeCompare(String(bv));
      }
      return direction * ((Number(av) || 0) - (Number(bv) || 0));
    });

    return trails;
  }

  function updateFilterIndicators(hasActiveFilters) {
    const badge = document.getElementById('bikeFiltersActiveBadge');
    const panel = document.getElementById('bikeControlPanelCard');
    const quickCard = document.getElementById('bikeQuickFiltersCard');

    if (badge) badge.classList.toggle('visible', hasActiveFilters);
    if (panel) panel.classList.toggle('filters-active', hasActiveFilters);
    if (quickCard) quickCard.classList.toggle('filters-active', hasActiveFilters);
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = String(value);
  }

  function updatePaginationControls(totalItems) {
    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    if (state.currentPage > totalPages) state.currentPage = totalPages;
    if (state.currentPage < 1) state.currentPage = 1;

    const start = totalItems ? ((state.currentPage - 1) * ITEMS_PER_PAGE) + 1 : 0;
    const end = Math.min(state.currentPage * ITEMS_PER_PAGE, totalItems);

    setText('bikeCurrentPageNumTop', state.currentPage);
    setText('bikeTotalPagesNumTop', totalPages);
    setText('bikeShowingRangeStartTop', start);
    setText('bikeShowingRangeEndTop', end);
    setText('bikeTotalResultsNumTop', totalItems);

    setText('bikeCurrentPageNum', state.currentPage);
    setText('bikeTotalPagesNum', totalPages);
    setText('bikeShowingRangeStart', start);
    setText('bikeShowingRangeEnd', end);
    setText('bikeTotalResultsNum', totalItems);

    const prevIds = ['bikePrevPageBtnTop', 'bikePrevPageBtn'];
    const nextIds = ['bikeNextPageBtnTop', 'bikeNextPageBtn'];
    prevIds.forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) btn.disabled = state.currentPage <= 1;
    });
    nextIds.forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) btn.disabled = state.currentPage >= totalPages;
    });

    const shouldShowPagination = totalItems > ITEMS_PER_PAGE;
    const top = document.getElementById('bikePaginationControlsTop');
    const bottom = document.getElementById('bikePaginationControls');
    if (top) top.style.display = shouldShowPagination ? 'flex' : 'none';
    if (bottom) bottom.style.display = shouldShowPagination ? 'flex' : 'none';
  }

  function renderLinkButton(url, label) {
    if (!url) return '';
    return `<a class="card-btn" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer"><span>🔗</span> ${escapeHtml(label)}</a>`;
  }

  function bindCardInteractions(grid) {
    grid.querySelectorAll('.bike-rating-star').forEach((star) => {
      star.addEventListener('click', () => {
        window.setBikeTrailRating(star.dataset.trailId, Number(star.dataset.rating || 0), star.closest('.adventure-card'));
      });
    });

    grid.querySelectorAll('.bike-favorite-btn').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        window.toggleBikeTrailFavorite(btn.dataset.trailId, event, btn.closest('.adventure-card'));
      });
    });

    grid.querySelectorAll('.bike-details-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        window.showBikeTrailDetails(btn.dataset.trailId);
      });
    });
  }

  window.renderBikeTrailCards = function() {
    const grid = document.getElementById('bikeTrailsCardsGrid');
    if (!grid) return;

    const trails = Array.isArray(window.bikeFilteredTrails) ? window.bikeFilteredTrails : [];
    const startIdx = (state.currentPage - 1) * ITEMS_PER_PAGE;
    const pageRows = trails.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    if (!pageRows.length) {
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #6b7280;">No bike trails match your filters.</div>';
      updatePaginationControls(trails.length);
      setText('bikeResultsCount', `${trails.length} trails`);
      return;
    }

    let currentGroupLabel = '';
    const html = [];

    pageRows.forEach((trail) => {
      const currentRating = Number(trail.myRating || 0);
      const isFavorite = !!trail.isFavorite;
      const mapUrl = trail.googleMapsTrailhead || trail.mapsLink || (trail.gpsCoordinates ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trail.gpsCoordinates)}` : '');
      const directionUrl = trail.googleMapsTrailhead || (trail.gpsCoordinates ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(trail.gpsCoordinates)}` : '');

      if (state.groupBy) {
        const groupMeta = getTrailGroupMeta(trail, state.groupBy);
        if (groupMeta.label !== currentGroupLabel) {
          currentGroupLabel = groupMeta.label;
          html.push(renderGroupHeader(currentGroupLabel));
        }
      }

      html.push(`
        <div class="adventure-card" data-trail-id="${escapeHtml(trail.id)}">
          <div class="card-header">
            <h3 class="card-title">${escapeHtml(trail.name || 'Unnamed Ride')}</h3>
            <div class="card-location">📍 ${escapeHtml(trail.region || 'Unknown Region')}</div>
            ${trail.driveTime ? `<div class="card-drive-time">🚗 ${escapeHtml(trail.driveTime)}</div>` : ''}
          </div>

          <div class="card-body">
            <div class="card-tags">
              ${trail.difficulty ? `<span class="tag-pill">${escapeHtml(trail.difficulty)}</span>` : ''}
              ${trail.surfaceType ? `<span class="tag-pill">${escapeHtml(trail.surfaceType)}</span>` : ''}
              ${trail.rideType ? `<span class="tag-pill">${escapeHtml(trail.rideType)}</span>` : ''}
            </div>

            <div class="card-info">
              ${trail.lengthRaw ? `<div class="card-info-item">Length: <strong>${escapeHtml(trail.lengthRaw)} mi</strong></div>` : ''}
              ${trail.elevationGain ? `<div class="card-info-item">Elevation: <strong>${escapeHtml(trail.elevationGain)} ft</strong></div>` : ''}
              ${trail.trafficExposure ? `<div class="card-info-item">Traffic: <strong>${escapeHtml(trail.trafficExposure)}</strong></div>` : ''}
              ${trail.smoothness ? `<div class="card-info-item">Smoothness: <strong>${escapeHtml(trail.smoothness)}</strong></div>` : ''}
              ${trail.commitment ? `<div class="card-info-item">Commitment: <strong>${escapeHtml(trail.commitment)}</strong></div>` : ''}
            </div>

            ${trail.highlights ? `<div class="card-description">${escapeHtml(trail.highlights).slice(0, 170)}${trail.highlights.length > 170 ? '...' : ''}</div>` : ''}
          </div>

          <div class="card-footer">
            <div class="card-action-buttons">
              ${mapUrl ? `<a class="card-btn" href="${escapeHtml(mapUrl)}" target="_blank" rel="noopener noreferrer"><span>📍</span> Map</a>` : ''}
              ${directionUrl ? `<a class="card-btn" href="${escapeHtml(directionUrl)}" target="_blank" rel="noopener noreferrer"><span>🗺️</span> Directions</a>` : ''}
              ${renderLinkButton(trail.allTrails, 'AllTrails')}
              ${renderLinkButton(trail.trailLink, 'TrailLink')}
              ${renderLinkButton(trail.mtbProject, 'MTB Project')}
              <button class="card-btn bike-details-btn" data-trail-id="${escapeHtml(trail.id)}"><span>📖</span> Details</button>
            </div>

            <div class="card-favorite-rating-container">
              <div class="card-rating">
                ${[1, 2, 3, 4, 5].map((rating) => (
                  `<span class="rating-star bike-rating-star ${currentRating >= rating ? 'filled' : ''}" data-trail-id="${escapeHtml(trail.id)}" data-rating="${rating}" title="${rating} stars">⭐</span>`
                )).join('')}
              </div>

              <button class="card-favorite-btn bike-favorite-btn ${isFavorite ? 'active' : ''}" data-trail-id="${escapeHtml(trail.id)}" title="Toggle favorite">
                ${isFavorite ? '💖' : '🤍'}
              </button>
            </div>
          </div>
        </div>
      `);
    });

    grid.innerHTML = html.join('');
    bindCardInteractions(grid);
    updatePaginationControls(trails.length);
    setText('bikeResultsCount', `${trails.length} trails`);
  };

  window.setBikeTrailRating = async function(trailId, rating, cardElement) {
    try {
      const trail = findBikeTrailById(trailId);
      if (!trail) throw new Error('Bike trail not found.');

      const ratingCol = getBikeColumnIndex(BIKE_PREFERENCE_COLUMNS.rating);
      if (ratingCol < 0) throw new Error(`Bike table column '${BIKE_PREFERENCE_COLUMNS.rating}' is not available.`);

      const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));
      await updateBikeRowColumns(trail.sourceIndex, { [ratingCol]: safeRating || '' });

      const stars = cardElement?.querySelectorAll('.bike-rating-star') || [];
      stars.forEach((star) => {
        const starRating = Number(star.dataset.rating || 0);
        star.classList.toggle('filled', starRating <= safeRating);
      });

      window.showToast?.(`Saved ${safeRating} bike star${safeRating === 1 ? '' : 's'} to Excel`, 'success', 1800);

      if (state.sortBy === 'rating') {
        window.applyBikeFilters(false);
      }
    } catch (error) {
      console.error('❌ setBikeTrailRating error:', error);
      window.showToast?.(`Failed to save rating: ${error.message}`, 'error', 3500);
    }
  };

  window.toggleBikeTrailFavorite = async function(trailId, event, cardElement) {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    try {
      const trail = findBikeTrailById(trailId);
      if (!trail) throw new Error('Bike trail not found.');

      const favoriteCol = getBikeColumnIndex(BIKE_PREFERENCE_COLUMNS.favorite);
      if (favoriteCol < 0) throw new Error(`Bike table column '${BIKE_PREFERENCE_COLUMNS.favorite}' is not available.`);

      const nextValue = trail.isFavorite ? '' : 'TRUE';
      await updateBikeRowColumns(trail.sourceIndex, { [favoriteCol]: nextValue });

      const btn = cardElement?.querySelector('.bike-favorite-btn');
      if (btn) {
        btn.classList.toggle('active', !!nextValue);
        btn.textContent = nextValue ? '💖' : '🤍';
      }

      window.showToast?.(nextValue ? 'Saved favorite to Excel' : 'Removed favorite from Excel', 'success', 1500);
      window.applyBikeFilters(false);
    } catch (error) {
      console.error('❌ toggleBikeTrailFavorite error:', error);
      window.showToast?.(`Failed to save favorite: ${error.message}`, 'error', 3500);
    }
  };

  function buildBikeDetailSection(title, rows) {
    const filteredRows = rows.filter(Boolean).map(item => `<p><strong>${escapeHtml(item.label)}:</strong> ${item.value}</p>`).join('');
    if (!filteredRows) return '';
    return `<div class="modal-detail-section"><h3>${escapeHtml(title)}</h3>${filteredRows}</div>`;
  }

  function renderBikeDetailTab(tabId, trail) {
    const linkList = [
      ['Maps Link', trail.mapsLink],
      ['Parking Link', trail.parkingLink],
      ['Google Maps Trailhead', trail.googleMapsTrailhead],
      ['Google Maps Parking', trail.googleMapsParking],
      ['AllTrails', trail.allTrails],
      ['TrailLink', trail.trailLink],
      ['MTBProject', trail.mtbProject],
      ['HikingProject', trail.hikingProject],
      ['Singletracks', trail.singletracks],
      ['RideWithGPS', trail.rideWithGps],
      ['OpenStreetMap', trail.openStreetMap],
      ['Official Link 1', trail.officialLink1],
      ['Official Link 2', trail.officialLink2],
      ['Official Link 3', trail.officialLink3],
      ['County/City Page', trail.countyCityPage],
      ['Visitor Center Page', trail.visitorCenterPage]
    ].filter(([, value]) => value);

    switch (tabId) {
      case 'overview':
        return [
          buildBikeDetailSection('Ride Snapshot', [
            { label: 'Region', value: escapeHtml(trail.region || 'Unknown') },
            { label: 'Drive Time', value: escapeHtml(trail.driveTime || 'N/A') },
            { label: 'Length', value: escapeHtml(trail.lengthRaw || 'N/A') },
            { label: 'Difficulty', value: escapeHtml(trail.difficulty || 'N/A') },
            { label: 'Surface Type', value: escapeHtml(trail.surfaceType || 'N/A') },
            { label: 'Elevation Gain', value: escapeHtml(trail.elevationGain ? `${trail.elevationGain} ft` : 'N/A') }
          ]),
          buildBikeDetailSection('Scenic Highlights', [
            { label: 'Highlights', value: escapeHtml(trail.highlights || 'N/A') },
            { label: 'Photo Spots', value: escapeHtml(trail.photoSpots || 'N/A') },
            { label: 'Wildlife', value: escapeHtml(trail.wildlifeNotes || 'N/A') },
            { label: 'Local History', value: escapeHtml(trail.historyFact || 'N/A') }
          ])
        ].join('');
      case 'ride-profile':
        return [
          buildBikeDetailSection('Ride Feel', [
            { label: 'Ride Flow Profile', value: escapeHtml(trail.rideFlowProfile || 'N/A') },
            { label: 'Ride Type', value: escapeHtml(trail.rideType || 'N/A') },
            { label: 'Ride Commitment', value: escapeHtml(trail.commitment || 'N/A') },
            { label: 'Vibes', value: escapeHtml(trail.vibes || 'N/A') },
            { label: 'Mood Tags', value: escapeHtml(trail.moodTags || 'N/A') },
            { label: 'Smoothness', value: escapeHtml(trail.smoothness || 'N/A') }
          ]),
          buildBikeDetailSection('Start / Finish', [
            { label: 'Start Experience', value: escapeHtml(trail.startExperience || 'N/A') },
            { label: 'Finish Experience', value: escapeHtml(trail.finishExperience || 'N/A') },
            { label: 'Best Time of Day', value: escapeHtml(trail.bestTimeOfDay || 'N/A') },
            { label: 'Noise Profile', value: escapeHtml(trail.noiseProfile || 'N/A') },
            { label: 'Recommended Loop', value: escapeHtml(trail.recommendedLoop || 'N/A') }
          ])
        ].join('');
      case 'conditions':
        return [
          buildBikeDetailSection('Conditions & Safety', [
            { label: 'Surface Breakdown', value: escapeHtml(trail.surfaceBreakdown || 'N/A') },
            { label: 'Weather Suitability', value: escapeHtml(trail.weatherSuitability || 'N/A') },
            { label: 'Seasonal Notes', value: escapeHtml(trail.seasonalNotes || 'N/A') },
            { label: 'Ride Risk Profile', value: escapeHtml(trail.rideRisk || 'N/A') },
            { label: 'Traffic Exposure', value: escapeHtml(trail.trafficExposure || 'N/A') },
            { label: 'Night Riding Suitability', value: escapeHtml(trail.nightSuitability || 'N/A') }
          ]),
          buildBikeDetailSection('Parking & Access', [
            { label: 'Parking Capacity', value: escapeHtml(trail.parkingCapacity || 'N/A') },
            { label: 'Parking Difficulty', value: escapeHtml(trail.parkingDifficulty || 'N/A') },
            { label: 'Parking Distance', value: escapeHtml(trail.parkingDistance || 'N/A') },
            { label: 'Parking Cost', value: escapeHtml(trail.parkingCost || 'N/A') },
            { label: 'Parking Safety', value: escapeHtml(trail.parkingSafety || 'N/A') },
            { label: 'Cell Coverage', value: escapeHtml(trail.cellCoverage || 'N/A') },
            { label: 'Emergency Access', value: escapeHtml(trail.emergencyAccess || 'N/A') },
            { label: 'Local Regulations', value: escapeHtml(trail.regulations || 'N/A') }
          ])
        ].join('');
      case 'nearby-links':
      default:
        return [
          buildBikeDetailSection('Nearby Stops', [
            { label: 'Coffee Nearby', value: escapeHtml(trail.coffeeNearby || 'N/A') },
            { label: 'Food Nearby', value: escapeHtml(trail.foodNearby || 'N/A') },
            { label: 'Brewery Nearby', value: escapeHtml(trail.breweryNearby || 'N/A') },
            { label: 'Bike Shop Nearby', value: escapeHtml(trail.bikeShopNearby || 'N/A') },
            { label: 'Local Shops Nearby', value: escapeHtml(trail.localShopsNearby || 'N/A') }
          ]),
          `<div class="modal-detail-section"><h3>Maps & Resources</h3>${linkList.length ? `<div style="display:flex;flex-wrap:wrap;gap:8px;">${linkList.map(([label, value]) => `<a class="card-btn" href="${escapeHtml(value)}" target="_blank" rel="noopener noreferrer"><span>🔗</span> ${escapeHtml(label)}</a>`).join('')}</div>` : '<p>No external links available.</p>'}</div>`,
          buildBikeDetailSection('Coordinates', [
            { label: 'GPS Coordinates', value: escapeHtml(trail.gpsCoordinates || 'N/A') }
          ])
        ].join('');
    }
  }

  function setActiveBikeDetailTab(tabId, trail) {
    document.querySelectorAll('#bikeTrailDetailModal .row-detail-tab-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('#bikeTrailDetailModal .row-detail-tab-pane').forEach((pane) => {
      pane.classList.toggle('active', pane.dataset.tab === tabId);
      if (pane.dataset.tab === tabId) {
        pane.innerHTML = renderBikeDetailTab(tabId, trail);
      }
    });
  }

  window.closeBikeTrailDetailModal = function() {
    const modal = document.getElementById('bikeTrailDetailModal');
    const backdrop = document.getElementById('bikeTrailDetailModalBackdrop');
    if (modal) modal.style.display = 'none';
    if (backdrop) backdrop.style.display = 'none';
  };

  window.showBikeTrailDetails = function(trailId) {
    const trail = findBikeTrailById(trailId);
    if (!trail) {
      window.showToast?.('Trail details not found', 'warning', 1800);
      return;
    }

    const modal = document.getElementById('bikeTrailDetailModal');
    const backdrop = document.getElementById('bikeTrailDetailModalBackdrop');
    const title = document.getElementById('bikeTrailDetailTitle');
    const location = document.getElementById('bikeTrailDetailLocation');

    if (!modal || !backdrop || !title || !location) {
      window.showToast?.('Bike detail modal is not available yet.', 'warning', 2200);
      return;
    }

    title.textContent = trail.name || 'Bike Trail Details';
    location.innerHTML = `
      <span>📍 ${escapeHtml(trail.region || 'Unknown Region')}</span>
      <span>🚗 ${escapeHtml(trail.driveTime || 'N/A')}</span>
      <span>📏 ${escapeHtml(trail.lengthRaw || 'N/A')} mi</span>
    `;

    setActiveBikeDetailTab('overview', trail);

    modal.querySelectorAll('.row-detail-tab-btn').forEach((btn) => {
      btn.onclick = () => setActiveBikeDetailTab(btn.dataset.tab, trail);
    });

    modal.style.display = 'flex';
    backdrop.style.display = 'block';
  };

  window.applyBikeFilters = function(resetPage = true) {
    updateFilterStateFromUI();
    if (resetPage) state.currentPage = 1;

    const hasQuick = state.quickFilters.size > 0;

    const filtered = (window.bikeTrailsData || [])
      .map((row, sourceIndex) => trailModel(row, sourceIndex))
      .filter((trail) => {
        if (state.filters.searchName && !norm(trail.name).includes(norm(state.filters.searchName))) return false;
        if (state.filters.region && !norm(trail.region).includes(norm(state.filters.region))) return false;
        if (state.filters.difficulty && !norm(trail.difficulty).includes(norm(state.filters.difficulty))) return false;
        if (state.filters.surface && !norm(trail.surfaceType).includes(norm(state.filters.surface))) return false;
        if (state.filters.traffic && !norm(trail.trafficExposure).includes(norm(state.filters.traffic))) return false;

        if (!matchesLengthBand(trail.lengthMiles, state.filters.lengthBand)) return false;
        if (!matchesDriveBand(parseDriveMinutes(trail.driveTime), state.filters.driveTimeBand)) return false;

        if (state.showFavoritesOnly && !trail.isFavorite) return false;

        if (hasQuick) {
          const allQuickFiltersPass = Array.from(state.quickFilters).every(filterName => matchesQuickFilter(trail, filterName));
          if (!allQuickFiltersPass) return false;
        }

        return true;
      });

    window.bikeFilteredTrails = applySort(filtered);

    const hasActiveFilters = state.showFavoritesOnly
      || state.quickFilters.size > 0
      || Object.values(state.filters).some(Boolean)
      || !!state.groupBy;
    updateFilterIndicators(hasActiveFilters);

    window.renderBikeTrailCards();
  };

  function resetBikeFilters() {
    const setValue = (id, value) => {
      const input = document.getElementById(id);
      if (input) input.value = value;
    };

    setValue('bikeSearchName', '');
    setValue('bikeFilterRegion', '');
    setValue('bikeFilterDifficulty', '');
    setValue('bikeFilterSurface', '');
    setValue('bikeFilterLengthBand', '');
    setValue('bikeFilterDriveTimeBand', '');
    setValue('bikeFilterTraffic', '');
    setValue('bikeGroupBy', '');

    state.groupBy = '';
    state.quickFilters.clear();
    state.showFavoritesOnly = false;
    document.querySelectorAll('#bikeQuickFiltersCard .quick-filter-btn').forEach((btn) => btn.classList.remove('active'));

    window.applyBikeFilters();
  }

  async function detectTableName(accessToken, filePath) {
    const config = window.bikeTableConfig || {};
    if (config.tableName === BIKE_TABLE_NAME) return BIKE_TABLE_NAME;

    const encodedPath = encodeURIComponent(filePath);
    const tablesUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/workbook/tables`;
    const response = await fetch(tablesUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      throw new Error(`Unable to verify bike table '${BIKE_TABLE_NAME}' in Bike_Trail_Planner.xlsx (${response.status} ${response.statusText})`);
    }

    const json = await response.json();
    const allTableNames = (json.value || []).map(item => item.name).filter(Boolean);

    if (!allTableNames.includes(BIKE_TABLE_NAME)) {
      throw new Error(`Required bike trails table '${BIKE_TABLE_NAME}' was not found in Bike_Trail_Planner.xlsx. Available tables: ${allTableNames.join(', ') || 'none'}`);
    }

    return BIKE_TABLE_NAME;
  }

  window.loadBikeTrailsTable = async function(force = false) {
    try {
      if (!force && Array.isArray(window.bikeTrailsData) && window.bikeTrailsData.length) {
        window.applyBikeFilters(false);
        return true;
      }

      const accessToken = window.accessToken;
      if (!accessToken) {
        window.showToast?.('Please sign in to load bike trails from Excel.', 'warning', 3000);
        return false;
      }

      const config = window.bikeTableConfig || {};
      const filePath = BIKE_FILE_PATH_DEFAULT;
      const tableName = await detectTableName(accessToken, filePath);

      config.filePath = BIKE_FILE_PATH_DEFAULT;
      config.tableName = BIKE_TABLE_NAME;
      config.tableNameCandidates = BIKE_TABLE_CANDIDATES;
      window.bikeTableConfig = config;

      let rows = await fetchBikeRows(accessToken, filePath, tableName);
      window.bikeTrailsData = rows;

      await loadBikeTableSchema(accessToken, filePath, tableName);
      const columnsAdded = await ensureBikePreferenceColumns(accessToken, filePath, tableName, rows.length);
      if (columnsAdded) {
        rows = await fetchBikeRows(accessToken, filePath, tableName);
        window.bikeTrailsData = rows;
      }

      const migrated = await migrateLegacyBikePreferencesToExcel(accessToken, filePath, tableName);
      if (migrated) {
        rows = await fetchBikeRows(accessToken, filePath, tableName);
        window.bikeTrailsData = rows;
      }

      state.currentPage = 1;
      populateBikeDatalists();
      window.applyBikeFilters(false);

      window.showToast?.(`Loaded ${rows.length} bike trails from ${BIKE_TABLE_NAME}`, 'success', 2500);
      console.log('✅ Bike trails loaded from locked Excel source', { filePath, tableName, count: rows.length });
      return true;
    } catch (error) {
      console.error('❌ loadBikeTrailsTable error:', error);
      window.showToast?.(`Failed to load bike trails: ${error.message}`, 'error', 5000);
      return false;
    }
  };

  function bindBikeControls() {
    if (state.controlsBound) return;

    const bindInput = (id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', () => window.applyBikeFilters());
      el.addEventListener('change', () => window.applyBikeFilters());
    };

    bindInput('bikeSearchName');
    bindInput('bikeFilterRegion');
    bindInput('bikeFilterDifficulty');
    bindInput('bikeFilterSurface');
    bindInput('bikeFilterLengthBand');
    bindInput('bikeFilterDriveTimeBand');
    bindInput('bikeFilterTraffic');
    bindInput('bikeGroupBy');

    const bikeIphoneToggleBtn = document.getElementById('bikeIphoneToggleBtn');
    if (bikeIphoneToggleBtn) {
      bikeIphoneToggleBtn.addEventListener('click', (event) => {
        event.preventDefault();
        document.body.classList.toggle('mobile-view');
        const isMobile = document.body.classList.contains('mobile-view');
        bikeIphoneToggleBtn.classList.toggle('active', isMobile);
        bikeIphoneToggleBtn.textContent = isMobile ? '💻 Desktop View' : '📱 iPhone View';
      });
    }

    const sortBy = document.getElementById('bikeSortBy');
    if (sortBy) {
      sortBy.addEventListener('change', () => {
        state.sortBy = sortBy.value || 'name';
        window.applyBikeFilters(false);
      });
    }

    const sortOrderBtn = document.getElementById('bikeSortOrderBtn');
    if (sortOrderBtn) {
      sortOrderBtn.addEventListener('click', () => {
        state.sortAsc = !state.sortAsc;
        const icon = sortOrderBtn.querySelector('.sort-icon');
        if (icon) icon.textContent = state.sortAsc ? '↑' : '↓';
        window.applyBikeFilters(false);
      });
    }

    const favoritesBtn = document.getElementById('bikeFavoritesFilterBtn');
    if (favoritesBtn) {
      favoritesBtn.addEventListener('click', (event) => {
        event.preventDefault();
        state.showFavoritesOnly = !state.showFavoritesOnly;
        favoritesBtn.classList.toggle('active', state.showFavoritesOnly);
        window.applyBikeFilters();
      });
    }

    document.querySelectorAll('#bikeQuickFiltersCard .quick-filter-btn[data-bike-filter]').forEach((btn) => {
      if (btn.id === 'bikeFavoritesFilterBtn') return;
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        toggleQuickFilterButton(btn);
      });
    });

    ['bikeResetAllFiltersTop', 'bikeResetAllFiltersBottom', 'bikeBreadcrumbResetBtn'].forEach((id) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        resetBikeFilters();
      });
    });

    const closeBtn = document.getElementById('bikeTrailDetailCloseBtn');
    const closeFooterBtn = document.getElementById('bikeTrailDetailCloseFooterBtn');
    const backdrop = document.getElementById('bikeTrailDetailModalBackdrop');
    if (closeBtn) closeBtn.addEventListener('click', () => window.closeBikeTrailDetailModal());
    if (closeFooterBtn) closeFooterBtn.addEventListener('click', () => window.closeBikeTrailDetailModal());
    if (backdrop) backdrop.addEventListener('click', () => window.closeBikeTrailDetailModal());

    state.controlsBound = true;
  }

  window.initializeBikeTrailsTab = async function() {
    window.bikeTableConfig = {
      ...(window.bikeTableConfig || {}),
      filePath: BIKE_FILE_PATH_DEFAULT,
      tableName: BIKE_TABLE_NAME,
      tableNameCandidates: BIKE_TABLE_CANDIDATES
    };

    bindBikeControls();

    if (!state.initialized) {
      state.initialized = true;
      await window.loadBikeTrailsTable(false);
      return;
    }

    if (!window.bikeTrailsData.length) {
      await window.loadBikeTrailsTable(false);
      return;
    }

    window.applyBikeFilters(false);
  };
})();

