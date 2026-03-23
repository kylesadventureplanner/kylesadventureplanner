/*
 * Bike Trails Tab System
 * Mirrors Adventure Planner behavior with bike-specific data schema and controls.
 */

(function() {
  const BIKE_FILE_PATH_DEFAULT = 'Copilot_Apps/Kyles_Adventure_Finder/Bike_Trail_Planner.xlsx';
  const BIKE_TABLE_NAME = 'BikeTrails';
  const BIKE_TABLE_CANDIDATES = [BIKE_TABLE_NAME];
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

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
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

  function getValues(row) {
    if (!row) return [];
    if (Array.isArray(row.values)) {
      return Array.isArray(row.values[0]) ? row.values[0] : row.values;
    }
    return [];
  }

  function getField(row, fieldName) {
    const values = getValues(row);
    const idx = columnIndex[fieldName];
    return idx >= 0 ? (values[idx] || '') : '';
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
      difficulty: getField(row, 'Difficulty'),
      difficultyScore: parseNumber(getField(row, 'Difficulty Score (0-100)')),
      elevationGain: parseNumber(getField(row, 'Elevation Gain (ft)')),
      trafficExposure: getField(row, 'Traffic Exposure Rating'),
      rideRisk: getField(row, 'Ride Risk Profile'),
      smoothness: getField(row, 'Ride Smoothness Index'),
      commitment: getField(row, 'Ride Commitment Level'),
      rideType: getField(row, 'Ride Type Classification'),
      vibes: getField(row, 'Vibes'),
      moodTags: getField(row, 'Ride Mood Tags'),
      weatherSuitability: getField(row, 'Weather Suitability'),
      seasonalNotes: getField(row, 'Seasonal Notes'),
      highlights: getField(row, 'Scenic & Nature Highlights'),
      parkingDifficulty: getField(row, 'Parking Difficulty'),
      parkingCost: getField(row, 'Parking Cost'),
      parkingSafety: getField(row, 'Parking Safety / Lighting Notes'),
      coffeeNearby: getField(row, 'Coffee Nearby'),
      foodNearby: getField(row, 'Food Nearby'),
      bikeShopNearby: getField(row, 'Bike Shop Nearby'),
      gpsCoordinates: getField(row, 'GPS Coordinates'),
      mapsLink: getField(row, 'Maps Link'),
      googleMapsTrailhead: getField(row, 'Google Maps Trailhead'),
      googleMapsParking: getField(row, 'Google Maps Parking'),
      trailLink: getField(row, 'TrailLink'),
      allTrails: getField(row, 'AllTrails'),
      mtbProject: getField(row, 'MTBProject'),
      officialLink1: getField(row, 'Official Link 1'),
      officialLink2: getField(row, 'Official Link 2'),
      officialLink3: getField(row, 'Official Link 3')
    };
  }

  function getFavoritesSet() {
    const favorites = readJson('bikeTrailFavorites', []);
    return new Set(Array.isArray(favorites) ? favorites : []);
  }

  function getRatings() {
    return readJson('bikeTrailRatings', {});
  }

  function persistFavorites(set) {
    writeJson('bikeTrailFavorites', Array.from(set));
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
          return Number(ratings[trail.id] || 0);
        case 'name':
        default:
          return norm(trail.name);
      }
    };

    trails.sort((a, b) => {
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
    const ratings = getRatings();
    const favorites = getFavoritesSet();

    const startIdx = (state.currentPage - 1) * ITEMS_PER_PAGE;
    const pageRows = trails.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    if (!pageRows.length) {
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #6b7280;">No bike trails match your filters.</div>';
      updatePaginationControls(trails.length);
      setText('bikeResultsCount', `${trails.length} trails`);
      return;
    }

    grid.innerHTML = pageRows.map((trail) => {
      const currentRating = Number(ratings[trail.id] || 0);
      const isFavorite = favorites.has(trail.id);
      const mapUrl = trail.googleMapsTrailhead || trail.mapsLink || (trail.gpsCoordinates ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trail.gpsCoordinates)}` : '');
      const directionUrl = trail.googleMapsTrailhead || (trail.gpsCoordinates ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(trail.gpsCoordinates)}` : '');

      return `
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
      `;
    }).join('');

    bindCardInteractions(grid);
    updatePaginationControls(trails.length);
    setText('bikeResultsCount', `${trails.length} trails`);
  };

  window.setBikeTrailRating = function(trailId, rating, cardElement) {
    const ratings = getRatings();
    ratings[trailId] = Math.max(0, Math.min(5, Number(rating) || 0));
    writeJson('bikeTrailRatings', ratings);

    const stars = cardElement?.querySelectorAll('.bike-rating-star') || [];
    stars.forEach((star) => {
      const starRating = Number(star.dataset.rating || 0);
      star.classList.toggle('filled', starRating <= ratings[trailId]);
    });

    window.showToast?.(`Rated ${ratings[trailId]} star${ratings[trailId] === 1 ? '' : 's'}`, 'success', 1800);

    if (state.sortBy === 'rating') {
      window.applyBikeFilters(false);
    }
  };

  window.toggleBikeTrailFavorite = function(trailId, event, cardElement) {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    const favorites = getFavoritesSet();
    const btn = cardElement?.querySelector('.bike-favorite-btn');

    if (favorites.has(trailId)) {
      favorites.delete(trailId);
      if (btn) {
        btn.classList.remove('active');
        btn.textContent = '🤍';
      }
      window.showToast?.('Removed from bike favorites', 'info', 1500);
    } else {
      favorites.add(trailId);
      if (btn) {
        btn.classList.add('active');
        btn.textContent = '💖';
      }
      window.showToast?.('Added to bike favorites', 'success', 1500);
    }

    persistFavorites(favorites);

    if (state.showFavoritesOnly) {
      window.applyBikeFilters(false);
    }
  };

  window.showBikeTrailDetails = function(trailId) {
    const trail = (window.bikeFilteredTrails || []).find(item => item.id === trailId)
      || (window.bikeTrailsData || []).map(trailModel).find(item => item.id === trailId);

    if (!trail) {
      window.showToast?.('Trail details not found', 'warning', 1800);
      return;
    }

    const sections = [
      `Ride Flow: ${trail.rideType || 'N/A'}`,
      `Risk: ${trail.rideRisk || 'N/A'}`,
      `Parking: ${trail.parkingDifficulty || 'N/A'}${trail.parkingCost ? ` (${trail.parkingCost})` : ''}`,
      `Weather: ${trail.weatherSuitability || 'N/A'}`,
      `Seasonal: ${trail.seasonalNotes || 'N/A'}`
    ];

    window.showToast?.(sections.join(' | '), 'info', 5000);
  };

  window.applyBikeFilters = function(resetPage = true) {
    updateFilterStateFromUI();
    if (resetPage) state.currentPage = 1;

    const favorites = getFavoritesSet();
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

        if (state.showFavoritesOnly && !favorites.has(trail.id)) return false;

        if (hasQuick) {
          const allQuickFiltersPass = Array.from(state.quickFilters).every(filterName => matchesQuickFilter(trail, filterName));
          if (!allQuickFiltersPass) return false;
        }

        return true;
      });

    window.bikeFilteredTrails = applySort(filtered);

    const hasActiveFilters = state.showFavoritesOnly
      || state.quickFilters.size > 0
      || Object.values(state.filters).some(Boolean);
    updateFilterIndicators(hasActiveFilters);

    window.renderBikeTrailCards();
  };

  window.changeBikePage = function(direction) {
    const totalItems = (window.bikeFilteredTrails || []).length;
    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    const nextPage = Math.max(1, Math.min(totalPages, state.currentPage + Number(direction || 0)));
    if (nextPage === state.currentPage) return;

    state.currentPage = nextPage;
    window.renderBikeTrailCards();

    const grid = document.getElementById('bikeTrailsCardsGrid');
    if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  function toggleQuickFilterButton(btn) {
    const quickName = (btn.dataset.bikeFilter || '').trim();
    if (!quickName) return;

    if (btn.classList.contains('active')) {
      btn.classList.remove('active');
      state.quickFilters.delete(quickName);
    } else {
      btn.classList.add('active');
      state.quickFilters.add(quickName);
    }

    window.applyBikeFilters();
  }

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

    state.quickFilters.clear();
    state.showFavoritesOnly = false;
    document.querySelectorAll('#bikeQuickFiltersCard .quick-filter-btn').forEach((btn) => btn.classList.remove('active'));

    window.applyBikeFilters();
  }

  function populateBikeDatalists() {
    const trails = (window.bikeTrailsData || []).map((row, idx) => trailModel(row, idx));

    const uniqueSorted = (values) => Array.from(new Set(values.filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b)));

    const datalistConfig = [
      { id: 'bikeNameList', values: uniqueSorted(trails.map(t => t.name)) },
      { id: 'bikeRegionList', values: uniqueSorted(trails.map(t => t.region)) },
      { id: 'bikeDifficultyList', values: uniqueSorted(trails.map(t => t.difficulty)) },
      { id: 'bikeSurfaceList', values: uniqueSorted(trails.map(t => t.surfaceType)) },
      { id: 'bikeTrafficList', values: uniqueSorted(trails.map(t => t.trafficExposure)) }
    ];

    datalistConfig.forEach(({ id, values }) => {
      const datalist = document.getElementById(id);
      if (!datalist) return;
      datalist.innerHTML = values.map(value => `<option value="${escapeHtml(value)}"></option>`).join('');
    });
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

      window.bikeTrailsData = rows.map((row, index) => ({
        values: [Array.isArray(row.values?.[0]) ? row.values[0] : []],
        rowId: row.id,
        index
      }));

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

    const nearMeBtn = document.getElementById('bikeFindNearMeBtn');
    if (nearMeBtn) {
      nearMeBtn.addEventListener('click', (event) => {
        event.preventDefault();
        window.showToast?.('Find Near Me for bike trails is next up. Core filtering is ready.', 'info', 2500);
      });
    }

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

