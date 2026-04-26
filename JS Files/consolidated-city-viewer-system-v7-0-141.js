/**
 * CONSOLIDATED CITY VIEWER SYSTEM v7.0.141
 * ==========================================
 *
 * A unified, comprehensive city viewing system that consolidates all city-related
 * functionality from multiple files into a single, maintainable module.
 *
 * INCLUDES:
 * - City Viewer Tab Opener (enforced new tab)
 * - Location Hours Checker
 * - Drive Time Calculator
 * - Dynamic Tag Filter
 * - City Viewer Integration
 * - City Visualizer
 *
 * Version: 7.0.141
 * Date: March 15, 2026
 * Created: Consolidated from 4 separate city viewer files
 */

console.log('🌆 Consolidated City Viewer System v7.0.141 Loading...');

// ============================================================
// DEFENSIVE FUNCTION DEFINITIONS
// ============================================================
// These are defined early to prevent "not a function" errors
// when called from HTML inline onclick handlers before full script loads

window.viewCityDetailsEnhanced = window.viewCityDetailsEnhanced || function(cityName) {
  console.log(`📍 Viewing details for: ${cityName}`);
};

window.openCityViewerWindow = window.openCityViewerWindow || function() {
  console.log('🌆 Opening City Explorer...');
};

window.closeEnhancedCityVisualizer = window.closeEnhancedCityVisualizer || function() {
  console.log('🌆 Closing City Visualizer...');
};

// ============================================================
// SECTION 1: CITY VIEWER TAB OPENER (Enforced New Tab)
// ============================================================

/**
 * Cache adventure data for City Viewer tab
 * Stores curated city-viewer data in sessionStorage for the city viewer window to access.
 */
const CITY_VIEWER_SOURCE_PREFIXES = ['', 'Copilot_Apps/Kyles_Adventure_Finder/', 'Copilot_Apps/Kyles_Adventure_Finder/Adventure Challenge/'];
const CITY_VIEWER_TABLE_SOURCES = [
  { workbook: 'Retail_Food_and_Drink.xlsx', table: 'Coffee', sourceType: 'coffee' },
  { workbook: 'Retail_Food_and_Drink.xlsx', table: 'Restaurants', sourceType: 'restaurants' },
  { workbook: 'Retail_Food_and_Drink.xlsx', table: 'Retail', sourceType: 'retail' },
  { workbook: 'Nature_Locations.xlsx', table: 'Nature_Locations', sourceType: 'nature' },
  { workbook: 'Entertainment_Locations.xlsx', table: 'Festivals', sourceType: 'festivals' },
  { workbook: 'Entertainment_Locations.xlsx', table: 'Wildlife_Animals', sourceType: 'wildlife' },
  { workbook: 'Entertainment_Locations.xlsx', table: 'General_Entertainment', sourceType: 'entertainment' }
];
const CITY_VIEWER_MISSING_TOKEN_NOTICE_KEY = '__cityViewerMissingTokenNoticeShown';
const CITY_VIEWER_CACHE_MAX_AGE_MS = 10 * 60 * 1000;

function encodeCityViewerGraphPath(filePath) {
  return String(filePath || '')
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function cityViewerWorkbookCandidates(workbook) {
  const clean = String(workbook || '').trim();
  if (!clean) return [];
  if (clean.includes('/')) return [clean];
  return CITY_VIEWER_SOURCE_PREFIXES.map((prefix) => `${prefix}${clean}`);
}

async function fetchCityViewerTableValues(workbook, table) {
  if (!window.accessToken || typeof fetch !== 'function') {
    throw new Error('Missing authentication token for city viewer table load.');
  }

  const candidates = cityViewerWorkbookCandidates(workbook);
  let lastError = null;
  for (const candidate of candidates) {
    const encodedPath = encodeCityViewerGraphPath(candidate);
    const rangeUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/workbook/tables/${encodeURIComponent(table)}/range?$select=values`;
    try {
      const response = await fetch(rangeUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${window.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`Graph ${response.status} for ${candidate} / ${table}`);
      }
      const payload = await response.json();
      const values = Array.isArray(payload && payload.values) ? payload.values : [];
      if (!values.length) {
        throw new Error(`No rows returned for ${candidate} / ${table}`);
      }
      return values;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error(`Unable to load workbook/table ${workbook} / ${table}`);
}

function cityViewerHeaderIndexMap(headers) {
  const map = {};
  headers.forEach((header, idx) => {
    const key = String(header || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, ' ');
    if (key) map[key] = idx;
  });
  return map;
}

function getCellByAliases(row, headerMap, aliases) {
  for (const alias of aliases) {
    const key = String(alias || '').toLowerCase().trim();
    if (!Object.prototype.hasOwnProperty.call(headerMap, key)) continue;
    const idx = headerMap[key];
    const value = Array.isArray(row) ? row[idx] : '';
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function normalizeCityViewerRow(row, headerMap, sourceLabel) {
  const name = getCellByAliases(row, headerMap, ['name']);
  if (!name) return null;

  const canonical = new Array(27).fill('');
  canonical[0] = name;
  canonical[1] = getCellByAliases(row, headerMap, ['google place id', 'googleplaceid', 'place id', 'placeid']);
  canonical[2] = getCellByAliases(row, headerMap, ['website', 'official website']);
  canonical[3] = getCellByAliases(row, headerMap, ['tags', 'tag', 'categories', 'category']);
  canonical[4] = getCellByAliases(row, headerMap, ['drive time', 'travel time', 'distance']);
  canonical[5] = getCellByAliases(row, headerMap, ['hours of operation', 'hours', 'business hours']);
  canonical[7] = getCellByAliases(row, headerMap, ['trail difficulties', 'difficulty']);
  canonical[8] = getCellByAliases(row, headerMap, ['trail lengths', 'trail length']);
  canonical[9] = getCellByAliases(row, headerMap, ['state']);
  canonical[10] = getCellByAliases(row, headerMap, ['city']);
  canonical[11] = getCellByAliases(row, headerMap, ['address']);
  canonical[12] = getCellByAliases(row, headerMap, ['phone number', 'phone']);
  canonical[13] = getCellByAliases(row, headerMap, ['google rating', 'rating']);
  canonical[14] = getCellByAliases(row, headerMap, ['cost', 'price']);
  canonical[16] = getCellByAliases(row, headerMap, ['description']);
  canonical[23] = getCellByAliases(row, headerMap, ['google url', 'maps url', 'directions']);
  canonical[25] = getCellByAliases(row, headerMap, ['gps', 'latitude', 'lat']);
  canonical[26] = getCellByAliases(row, headerMap, ['longitude', 'lng']);

  return {
    sourceLabel,
    city: canonical[10],
    state: canonical[9],
    name: canonical[0],
    googlePlaceId: canonical[1],
    values: [canonical]
  };
}

async function buildCityViewerCuratedData() {
  if (!window.accessToken || typeof fetch !== 'function') {
    if (!window[CITY_VIEWER_MISSING_TOKEN_NOTICE_KEY]) {
      window[CITY_VIEWER_MISSING_TOKEN_NOTICE_KEY] = true;
      console.info('ℹ️ City Viewer curated sources skipped: sign in is required to load workbook tables.');
    }
    return [];
  }

  const sourceResults = await Promise.all(CITY_VIEWER_TABLE_SOURCES.map(async (source) => {
    try {
      const matrix = await fetchCityViewerTableValues(source.workbook, source.table);
      if (!Array.isArray(matrix) || matrix.length < 2) return [];
      const headers = Array.isArray(matrix[0]) ? matrix[0] : [];
      const headerMap = cityViewerHeaderIndexMap(headers);
      return matrix
        .slice(1)
        .map((row) => normalizeCityViewerRow(Array.isArray(row) ? row : [], headerMap, `${source.workbook} / ${source.table}`))
        .filter(Boolean);
    } catch (error) {
      console.warn(`⚠️ City Viewer source load failed for ${source.workbook}/${source.table}:`, error.message || error);
      return [];
    }
  }));

  return sourceResults.flat();
}

async function cacheCityViewerDataForTab(correlationId) {
  const curatedRows = await buildCityViewerCuratedData();
  if (!Array.isArray(curatedRows) || curatedRows.length === 0) {
    console.warn('⚠️ No curated City Explorer rows available from configured sources.');
    return null;
  }

  const cacheKey = `city_viewer_data_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const payload = {
    correlationId: String(correlationId || ''),
    exportedAt: new Date().toISOString(),
    dataMode: 'curated-only',
    adventuresData: curatedRows,
    totalCount: curatedRows.length,
    configuredSources: CITY_VIEWER_TABLE_SOURCES.map((source) => `${source.workbook} / ${source.table}`)
  };

  try {
    window.sessionStorage.setItem(cacheKey, JSON.stringify(payload));
    window.sessionStorage.setItem('city_viewer_data_latest', cacheKey);
    console.log(`✅ City Viewer curated data cached: ${cacheKey} (${curatedRows.length} rows)`);
    return cacheKey;
  } catch (error) {
    console.warn('⚠️ Could not cache city viewer data:', error);
    return null;
  }
}

function readCityViewerCachedPayload(cacheKey) {
  const key = String(cacheKey || '').trim();
  if (!key) return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const payload = JSON.parse(raw);
    if (!payload || !Array.isArray(payload.adventuresData) || !payload.adventuresData.length) return null;
    return payload;
  } catch (_error) {
    return null;
  }
}

function getLatestCityViewerCacheKey() {
  try {
    const latestKey = window.sessionStorage.getItem('city_viewer_data_latest');
    if (!latestKey) return '';
    const payload = readCityViewerCachedPayload(latestKey);
    return payload ? latestKey : '';
  } catch (_error) {
    return '';
  }
}

function getRecentCityViewerCacheKey(maxAgeMs) {
  const ageLimit = Number(maxAgeMs) || CITY_VIEWER_CACHE_MAX_AGE_MS;
  const latestKey = getLatestCityViewerCacheKey();
  if (!latestKey) return '';

  const payload = readCityViewerCachedPayload(latestKey);
  if (!payload) return '';
  const exportedAt = Date.parse(String(payload.exportedAt || ''));
  if (!Number.isFinite(exportedAt)) return latestKey;
  return (Date.now() - exportedAt <= ageLimit) ? latestKey : '';
}

function invalidateCityViewerCuratedCache(reason) {
  try {
    const removed = [];
    const latestKey = window.sessionStorage.getItem('city_viewer_data_latest');
    if (latestKey) {
      window.sessionStorage.removeItem(latestKey);
      removed.push(latestKey);
    }

    const cacheKeys = [];
    for (let i = 0; i < window.sessionStorage.length; i += 1) {
      const key = window.sessionStorage.key(i);
      if (!/^city_viewer_data_/i.test(String(key || ''))) continue;
      cacheKeys.push(String(key));
    }
    cacheKeys.forEach((key) => {
      window.sessionStorage.removeItem(key);
      removed.push(key);
    });

    window.sessionStorage.removeItem('city_viewer_data_latest');
    console.log(`♻️ City Viewer cache invalidated (${removed.length} key${removed.length === 1 ? '' : 's'})${reason ? ` [${reason}]` : ''}`);
    return { removedCount: removed.length, removedKeys: removed };
  } catch (error) {
    console.warn('⚠️ Failed to invalidate City Viewer cache:', error);
    return { removedCount: 0, removedKeys: [] };
  }
}

window.invalidateCityViewerCuratedCache = invalidateCityViewerCuratedCache;

function refreshCityViewerCacheInBackground(correlationId) {
  cacheCityViewerDataForTab(correlationId)
    .then((cacheKey) => {
      if (cacheKey) {
        console.log(`♻️ City Explorer curated cache refreshed in background (${cacheKey})`);
      }
    })
    .catch((error) => {
      console.warn('⚠️ City Explorer background cache refresh failed:', (error && error.message) || error);
    });
}

/**
 * Open City Viewer in a new browser tab
 * Similar to openAdventureDetailsTab but for city viewing
 */
window.prepareCityViewerInlineUrl = async function(options) {
  const prefilterTag = String(options && options.prefilterTag ? options.prefilterTag : '').trim();
  const prefilterLabel = String(options && options.prefilterLabel ? options.prefilterLabel : '').trim();
  const sourceSubtab = String(options && options.sourceSubtab ? options.sourceSubtab : '').trim();

  try {
    // Create correlation ID for tracking
    const correlationId = `corr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Prefer recent cached curated data for fast open, then refresh in background.
    let dataKey = getRecentCityViewerCacheKey(CITY_VIEWER_CACHE_MAX_AGE_MS);
    if (!dataKey) {
      const fallbackKey = getLatestCityViewerCacheKey();
      if (fallbackKey) {
        dataKey = fallbackKey;
        refreshCityViewerCacheInBackground(correlationId);
      }
    }

    // No valid cache available; block once to build a curated cache key.
    if (!dataKey) {
      dataKey = await cacheCityViewerDataForTab(correlationId);
    }
    if (!dataKey) {
      return '';
    }

    // Resolve the URL to the city viewer window
    const cityViewerUrl = typeof window.resolvePlannerPageUrl === 'function'
      ? window.resolvePlannerPageUrl('HTML Files/city-viewer-window.html')
      : new URL('HTML%20Files/city-viewer-window.html', window.location.href).toString();

    // Add correlation ID as query parameter
    const url = new URL(cityViewerUrl);
    url.searchParams.set('corrId', correlationId);
    if (dataKey) url.searchParams.set('dataKey', dataKey);
    url.searchParams.set('dataMode', 'curated-only');
    if (prefilterTag) url.searchParams.set('prefilterTag', prefilterTag);
    if (prefilterLabel) url.searchParams.set('prefilterLabel', prefilterLabel);
    if (sourceSubtab) url.searchParams.set('sourceSubtab', sourceSubtab);
    url.searchParams.set('ts', String(Date.now()));

    return url.toString();
  } catch (error) {
    console.error('❌ Error preparing City Explorer URL:', error);
    return '';
  }
};

window.openCityViewerInNewTab = async function(options) {
  console.log('🌆 Opening City Explorer in new browser tab');
  try {
    const preparedUrl = await window.prepareCityViewerInlineUrl(options);
    if (!preparedUrl) {
      if (typeof window.showToast === 'function') {
        window.showToast('⚠️ City Explorer could not load curated source tables. Sign in and try again.', 'warning', 4200);
      }
      return false;
    }

    // Open in new tab
    const cityViewerTab = window.open(preparedUrl, '_blank');

    if (!cityViewerTab) {
      if (typeof window.showToast === 'function') {
        window.showToast('❌ Failed to open City Explorer. Check if pop-ups are blocked.', 'error', 5000);
      } else {
        alert('Please enable pop-ups to open City Explorer');
      }
      return false;
    }

    // Focus the new tab
    cityViewerTab.focus();
    console.log('✅ City Explorer opened in new tab');
    return true;
  } catch (error) {
    console.error('❌ Error opening City Explorer:', error);
    if (typeof window.showToast === 'function') {
      window.showToast('❌ Error opening City Explorer: ' + error.message, 'error', 5000);
    } else {
      alert('Error opening City Explorer: ' + error.message);
    }
    return false;
  }
};

/**
 * Open City Viewer in GUARANTEED new tab
 * This is the primary function called by the UI
 */
window.openCityViewerWindow = function(options) {
  console.log('🌆 Opening City Explorer - ENFORCED NEW TAB');
  return window.openCityViewerInNewTab(options);
};

// Override all possible function names for compatibility
window.openCityViewerInTab = window.openCityViewerInNewTab;
window.viewCityDetails = window.openCityViewerInNewTab;
window.viewCity = window.openCityViewerInNewTab;
window.showCityViewer = window.openCityViewerInNewTab;

console.log('✅ City Viewer tab opener installed');

// ============================================================
// SECTION 2: GEOLOCATION & DRIVE TIME SYSTEM
// ============================================================

/**
 * Get user's location via geolocation API
 */
window.getUserLocation = async function() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log(`📍 User location: ${location.lat}, ${location.lng}`);

        // Persist so drive time, Find Near Me, and the main app all see it.
        if (typeof window.persistUserLocation === 'function') {
          window.persistUserLocation(location.lat, location.lng);
        } else {
          // Fallback: write directly with the shared key.
          try {
            window.userLocation = window.__userLocation = { latitude: location.lat, longitude: location.lng };
            localStorage.setItem('kap_user_gps', JSON.stringify({ latitude: location.lat, longitude: location.lng, timestamp: Date.now() }));
          } catch (_) {}
        }

        resolve(location);
      },
      (error) => {
        console.error('❌ Geolocation error:', error.message);
        reject(error);
      }
    );
  });
};

/**
 * Calculate distance between two coordinates (haversine formula)
 * Returns distance in miles
 */
window.calculateDistance = function(lat1, lng1, lat2, lng2) {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Estimate drive time (rough approximation: 60 mph average)
 */
window.estimateDriveTime = function(distance) {
  const avgSpeed = 60; // mph
  const hours = distance / avgSpeed;
  const minutes = Math.round((hours % 1) * 60);
  const wholeHours = Math.floor(hours);

  if (wholeHours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${wholeHours}h`;
  } else {
    return `${wholeHours}h ${minutes}m`;
  }
};

/**
 * Format drive time for display
 */
window.formatDriveTime = function(distance) {
  if (!distance || isNaN(distance)) return 'N/A';
  const driveTime = window.estimateDriveTime(distance);
  const miles = distance.toFixed(1);
  return `🚗 ${driveTime} (${miles} mi)`;
};

console.log('✅ Geolocation and drive time system installed');

// ============================================================
// SECTION 3: LOCATION HOURS CHECKER
// ============================================================

class LocationHoursChecker {
  constructor() {
    this.closingSoonThreshold = 120; // minutes (2 hours)
  }

  /**
   * Check if location is open right now
   */
  isOpenNow(hoursStr) {
    try {
      if (!hoursStr || hoursStr === 'N/A' || hoursStr === '') {
        return null; // Unknown
      }

      const now = new Date();
      const dayIndex = now.getDay();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = daysOfWeek[dayIndex];

      // Parse hours string (e.g., "Mon-Fri: 9am-5pm, Sat-Sun: Closed")
      const todayPattern = new RegExp(`${today}.*?:(.*?)(?:,|$)`, 'i');
      const match = hoursStr.match(todayPattern);

      if (!match) {
        return null; // Couldn't parse
      }

      const timeStr = match[1].trim();

      if (timeStr.toLowerCase().includes('closed')) {
        return false;
      }

      // Parse times (e.g., "9am-5pm")
      const times = timeStr.match(/(\d{1,2}):?(\d{0,2})\s*(am|pm)?.*?-.*?(\d{1,2}):?(\d{0,2})\s*(am|pm)/i);
      if (!times) {
        return null;
      }

      const openHour = parseInt(times[1]);
      const openMin = parseInt(times[2] || 0);
      const openAmPm = times[3] || (openHour < 12 ? 'am' : 'pm');

      const closeHour = parseInt(times[4]);
      const closeMin = parseInt(times[5] || 0);
      const closeAmPm = times[6] || (closeHour < 12 ? 'am' : 'pm');

      let openTime = this.convertTo24Hour(openHour, openMin, openAmPm);
      let closeTime = this.convertTo24Hour(closeHour, closeMin, closeAmPm);

      const isOpen = currentTime >= openTime && currentTime < closeTime;
      return isOpen;
    } catch (error) {
      console.warn('⚠️ Error checking hours:', error);
      return null;
    }
  }

  /**
   * Convert 12-hour to 24-hour format
   */
  convertTo24Hour(hour, min, ampm) {
    let h = parseInt(hour);
    if (ampm.toLowerCase() === 'pm' && h !== 12) {
      h += 12;
    }
    if (ampm.toLowerCase() === 'am' && h === 12) {
      h = 0;
    }
    return h * 60 + min;
  }

  /**
   * Get minutes until closing
   */
  getMinutesUntilClosing(hoursStr) {
    try {
      if (!hoursStr || hoursStr === 'N/A') {
        return null;
      }

      const now = new Date();
      const dayIndex = now.getDay();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = daysOfWeek[dayIndex];

      const todayPattern = new RegExp(`${today}.*?:(.*?)(?:,|$)`, 'i');
      const match = hoursStr.match(todayPattern);

      if (!match) {
        return null;
      }

      const timeStr = match[1].trim();

      if (timeStr.toLowerCase().includes('closed')) {
        return 0;
      }

      const times = timeStr.match(/(\d{1,2}):?(\d{0,2})\s*(am|pm)?.*?-.*?(\d{1,2}):?(\d{0,2})\s*(am|pm)/i);
      if (!times) {
        return null;
      }

      const closeHour = parseInt(times[4]);
      const closeMin = parseInt(times[5] || 0);
      const closeAmPm = times[6] || (closeHour < 12 ? 'am' : 'pm');

      let closeTime = this.convertTo24Hour(closeHour, closeMin, closeAmPm);
      const minutesUntilClose = closeTime - currentTime;

      return minutesUntilClose > 0 ? minutesUntilClose : 0;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if location is closing soon
   */
  isClosingSoon(hoursStr) {
    const minutesUntil = this.getMinutesUntilClosing(hoursStr);
    return minutesUntil !== null && minutesUntil > 0 && minutesUntil <= this.closingSoonThreshold;
  }

  /**
   * Get formatted closing time
   */
  getClosingTimeStr(hoursStr) {
    const minutes = this.getMinutesUntilClosing(hoursStr);
    if (minutes === null || minutes === 0) {
      return null;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    } else {
      return `${mins}m`;
    }
  }
}

console.log('✅ Location hours checker installed');

// ============================================================
// SECTION 4: DRIVE TIME CALCULATOR
// ============================================================

class DriveTimeCalculator {
  constructor() {
    this.userLocation = null;
    this.driveTimeCache = new Map();
  }

  /**
   * Calculate drive time from user location to coordinates
   */
  async calculateDriveTime(userLat, userLng, destLat, destLng) {
    try {
      if (typeof google === 'undefined' || !google.maps || !google.maps.DistanceMatrixService) {
        console.warn('⚠️ Google Maps Distance Matrix API not available');
        return null;
      }

      const cacheKey = `${userLat},${userLng}→${destLat},${destLng}`;

      if (this.driveTimeCache.has(cacheKey)) {
        return this.driveTimeCache.get(cacheKey);
      }

      const service = new google.maps.DistanceMatrixService();

      const result = await service.getDistanceMatrix({
        origins: [{ lat: userLat, lng: userLng }],
        destinations: [{ lat: destLat, lng: destLng }],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL
      });

      if (result.rows && result.rows[0] && result.rows[0].elements[0]) {
        const element = result.rows[0].elements[0];
        if (element.status === 'OK') {
          const driveTime = {
            minutes: Math.round(element.duration.value / 60),
            text: element.duration.text
          };
          this.driveTimeCache.set(cacheKey, driveTime);
          return driveTime;
        }
      }
      return null;
    } catch (error) {
      console.warn('⚠️ Error calculating drive time:', error);
      return null;
    }
  }

  /**
   * Format drive time for display
   */
  formatDriveTime(driveTime) {
    if (!driveTime) return 'N/A';
    const hours = Math.floor(driveTime.minutes / 60);
    const mins = driveTime.minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }
}

console.log('✅ Drive time calculator installed');

// ============================================================
// SECTION 5: DYNAMIC TAG FILTER
// ============================================================

class DynamicTagFilter {
  constructor() {
    this.allTags = new Set();
    this.cityTags = new Map();
  }

  /**
   * Extract all unique tags from a city's locations
   */
  extractCityTags(locations) {
    const tags = new Set();

    locations.forEach(location => {
      // Tags are typically in column index around 5-7
      const tagsStr = location.values ? location.values[0][6] : location.tags;

      if (tagsStr && typeof tagsStr === 'string') {
        tagsStr.split(',').forEach(tag => {
          const cleanTag = tag.trim().toLowerCase();
          if (cleanTag) {
            tags.add(cleanTag);
          }
        });
      }
    });

    return Array.from(tags).sort();
  }

  /**
   * Get tags for a specific city
   */
  getTagsForCity(city, state, locations) {
    const cacheKey = `${city},${state}`;

    if (this.cityTags.has(cacheKey)) {
      return this.cityTags.get(cacheKey);
    }

    const cityLocations = locations.filter(loc => {
      const locCity = loc.city || (loc.values && loc.values[0][10]);
      const locState = loc.state || (loc.values && loc.values[0][9]);
      return locCity && locCity.toLowerCase() === city.toLowerCase() &&
             locState && locState.toLowerCase() === state.toLowerCase();
    });

    const tags = this.extractCityTags(cityLocations);
    this.cityTags.set(cacheKey, tags);
    return tags;
  }
}

console.log('✅ Dynamic tag filter installed');

// ============================================================
// SECTION 6: CITY VIEWER ENHANCEMENTS (Main API)
// ============================================================

window.cityViewerEnhancements = {
  hoursChecker: new LocationHoursChecker(),
  driveTimeCalculator: new DriveTimeCalculator(),
  tagFilter: new DynamicTagFilter(),

  /**
   * Check if location is open today
   */
  isOpenToday(hoursStr) {
    return this.hoursChecker.isOpenNow(hoursStr);
  },

  /**
   * Check if location is closing soon (within 2 hours)
   */
  isClosingSoon(hoursStr) {
    return this.hoursChecker.isClosingSoon(hoursStr);
  },

  /**
   * Get time until closing
   */
  getTimeUntilClosing(hoursStr) {
    return this.hoursChecker.getClosingTimeStr(hoursStr);
  },

  /**
   * Calculate drive time
   */
  async getDriveTime(userLat, userLng, destLat, destLng) {
    return await this.driveTimeCalculator.calculateDriveTime(userLat, userLng, destLat, destLng);
  },

  /**
   * Get tags for city
   */
  getTagsForCity(city, state, locations) {
    return this.tagFilter.getTagsForCity(city, state, locations);
  }
};

console.log('✅ City Viewer Enhancements API ready');

// ============================================================
// SECTION 7: CITY VIEWER INTEGRATION
// ============================================================

window.enhancedCityViewerIntegration = {
  /**
   * Initialize integration
   */
  init: function() {
    console.log('✅ City Viewer Integration initialized');
  },

  /**
   * Filter locations by open today status
   */
  filterByOpenToday: function(button) {
    console.log('Filtering by open today...');
    if (button) {
      button.classList.toggle('active');
    }
  },

  /**
   * Filter locations by closing soon status
   */
  filterByClosingSoon: function(button) {
    console.log('Filtering by closing soon...');
    if (button) {
      button.classList.toggle('active');
    }
  }
};

console.log('✅ City Viewer Integration ready');

// ============================================================
// SECTION 8: CITY VISUALIZER (Grouping & Visualization)
// ============================================================

class CityVisualizer {
  constructor() {
    this.adventuresData = window.adventuresData || [];
    this.cityGroups = new Map();
    this.currentSortBy = 'count'; // 'count' or 'name'
    this.init();
  }

  /**
   * Initialize the city visualizer
   */
  init() {
    console.log('🌆 City Visualizer initialized');
  }

  /**
   * Group locations by city
   */
  groupLocationsByCity(locations) {
    const groups = new Map();

    locations.forEach(location => {
      const city = location.city || (location.values && location.values[0][10]);
      const state = location.state || (location.values && location.values[0][9]);
      const key = `${city}, ${state}`;

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(location);
    });

    return groups;
  }

  /**
   * Get city statistics
   */
  getCityStats(city, state, locations) {
    const cityLocations = locations.filter(loc => {
      const locCity = loc.city || (loc.values && loc.values[0][10]);
      const locState = loc.state || (loc.values && loc.values[0][9]);
      return locCity && locCity.toLowerCase() === city.toLowerCase() &&
             locState && locState.toLowerCase() === state.toLowerCase();
    });

    return {
      city,
      state,
      count: cityLocations.length,
      locations: cityLocations
    };
  }

  /**
   * Sort cities by count (descending)
   */
  sortByCount(cityGroups) {
    return Array.from(cityGroups.entries())
      .sort((a, b) => b[1].length - a[1].length);
  }

  /**
   * Sort cities by name (ascending)
   */
  sortByName(cityGroups) {
    return Array.from(cityGroups.entries())
      .sort((a, b) => a[0].localeCompare(b[0]));
  }

  /**
   * Get all cities
   */
  getAllCities() {
    return this.groupLocationsByCity(this.adventuresData);
  }

  /**
   * Export city data
   */
  exportCityData(format = 'json') {
    const cities = this.getAllCities();
    const data = {
      totalCities: cities.size,
      totalLocations: this.adventuresData.length,
      cities: Array.from(cities.entries()).map(([key, locations]) => ({
        name: key,
        count: locations.length
      }))
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else if (format === 'csv') {
      let csv = 'City,State,Count\n';
      data.cities.forEach(city => {
        const [cityName, state] = city.name.split(', ');
        csv += `${cityName},${state},${city.count}\n`;
      });
      return csv;
    }

    return data;
  }
}

// Create global instance
window.cityVisualizer = window.cityVisualizer || new CityVisualizer();

console.log('✅ City Visualizer installed');

// ============================================================
// SECTION 9: ENHANCED CITY VISUALIZER (Advanced City Management)
// ============================================================

class EnhancedCityVisualizer {
  constructor() {
    this.adventuresData = window.adventuresData || [];
    this.cityGroups = new Map();
    this.currentView = 'cityList'; // 'cityList' or 'cityDetail'
    this.selectedCity = null;
    this.referenceLocation = {
      name: 'Your Location',
      lat: 35.3395,  // Hendersonville, NC
      lng: -82.4637
    };
    this.currentFilters = {
      tags: [],
      keywords: ''
    };
    this.availableTags = new Set();
    this._initialized = false;
    this.init();
  }

  /**
   * Initialize the enhanced city visualizer
   */
  init() {
    if (this._initialized) return;

    // This script can execute before <body> exists; defer until DOM is usable.
    if (!document.body || document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init(), { once: true });
      return;
    }

    this._initialized = true;
    this.createStyles();
    this.createMarkup();
    this.attachEventListeners();

    if (this.adventuresData && this.adventuresData.length > 0) {
      this.populateCityData();
      console.log(`✅ Enhanced City Visualizer initialized with ${this.adventuresData.length} adventures`);
    } else {
      console.log('⏳ Waiting for adventure data...');
      const checkDataInterval = setInterval(() => {
        if (window.adventuresData && window.adventuresData.length > 0) {
          this.adventuresData = window.adventuresData;
          this.populateCityData();
          console.log(`✅ City data populated: ${this.adventuresData.length} adventures`);
          clearInterval(checkDataInterval);
        }
      }, 500);

      setTimeout(() => clearInterval(checkDataInterval), 30000);
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  }

  /**
   * Get approximate coordinates for a city
   */
  getApproximateCoordinates(city, state) {
    const cityCoordinates = {
      // Major cities
      'Hendersonville,NC': { lat: 35.3395, lng: -82.4637 },
      'Asheville,NC': { lat: 35.5951, lng: -82.5515 },
      'Greenville,SC': { lat: 34.8526, lng: -82.3940 },
      'Columbia,SC': { lat: 34.0007, lng: -81.0348 },
      'Charlotte,NC': { lat: 35.2271, lng: -80.8431 },
      'Raleigh,NC': { lat: 35.7796, lng: -78.6382 },
      'Durham,NC': { lat: 35.9940, lng: -78.8986 },
      'Chapel Hill,NC': { lat: 35.9132, lng: -79.0558 },
      'Greensboro,NC': { lat: 36.0726, lng: -79.7920 },
      'Winston-Salem,NC': { lat: 36.0999, lng: -80.2442 },
      'Boone,NC': { lat: 36.2173, lng: -81.6846 },
      'Knoxville,TN': { lat: 35.9606, lng: -83.9207 },
      'Nashville,TN': { lat: 36.1627, lng: -86.7816 },
      'Chattanooga,TN': { lat: 35.0456, lng: -85.2672 },
      'Atlanta,GA': { lat: 33.7490, lng: -84.3880 },
      'Gatlinburg,TN': { lat: 35.7142, lng: -83.5111 },
      'Pigeon Forge,TN': { lat: 35.7847, lng: -83.5806 },
      'Sevierville,TN': { lat: 35.8761, lng: -83.5603 },
      // NC Mountain Region
      'Flat Rock,NC': { lat: 35.2800, lng: -82.5500 },
      'Swannanoa,NC': { lat: 35.6300, lng: -82.3500 },
      'Black Mountain,NC': { lat: 35.6233, lng: -82.3178 },
      'Brevard,NC': { lat: 35.2333, lng: -82.7333 },
      'East Flat Rock,NC': { lat: 35.2817, lng: -82.5500 },
      'Fletcher,NC': { lat: 35.4183, lng: -82.5833 },
      'Arden,NC': { lat: 35.3850, lng: -82.6200 },
      'Weaverville,NC': { lat: 35.6667, lng: -82.5167 },
      'Woodfin,NC': { lat: 35.6617, lng: -82.6 },
      'Etowah,NC': { lat: 35.1183, lng: -82.6833 },
      'Horse Shoe,NC': { lat: 35.3650, lng: -82.6850 },
      'Laurel Park,NC': { lat: 35.2933, lng: -82.5233 },
      'Cedar Mountain,NC': { lat: 35.1633, lng: -82.3533 },
      // SC Upstate
      'Spartanburg,SC': { lat: 34.9526, lng: -81.9323 },
      'Landrum,SC': { lat: 34.8817, lng: -82.1300 },
      'Campobello,SC': { lat: 34.9800, lng: -82.1450 },
      'Greer,SC': { lat: 34.9717, lng: -82.2233 },
      'Inman,SC': { lat: 34.9950, lng: -82.1050 },
      'Taylors,SC': { lat: 34.8900, lng: -82.3650 },
      'Drayton,SC': { lat: 34.8950, lng: -82.2800 },
      'Moore,SC': { lat: 34.8767, lng: -82.3967 },
      'Simpsonville,SC': { lat: 34.7417, lng: -82.2600 },
      'Easley,SC': { lat: 34.8050, lng: -82.6167 },
      // TN Region
      'Townsend,TN': { lat: 35.6842, lng: -83.6533 },
      'Baxter,TN': { lat: 35.9633, lng: -84.6200 },
      'Mascot,TN': { lat: 35.9817, lng: -83.7950 },
      'Mount Cammerer,TN': { lat: 35.7467, lng: -83.3600 },
      'Greenback,TN': { lat: 35.8333, lng: -84.4833 },
      'Roan Mountain,TN': { lat: 36.1850, lng: -82.0700 },
      'Vonore,TN': { lat: 35.5583, lng: -84.3417 },
      // Other NC
      'Pineville,NC': { lat: 35.1617, lng: -80.8650 },
      'Columbus,NC': { lat: 35.2650, lng: -82.6383 },
      'Smithfield,NC': { lat: 35.5050, lng: -78.3700 },
      'Burnsville,NC': { lat: 36.1567, lng: -82.2433 },
      'Zirconia,NC': { lat: 35.2450, lng: -82.8183 },
      'Dillsboro,NC': { lat: 35.3783, lng: -83.2417 },
      'Andrews,NC': { lat: 34.6750, lng: -83.8583 },
      'Hillsborough,NC': { lat: 36.0708, lng: -79.2975 },
      'Rutherfordton,NC': { lat: 35.3783, lng: -82.2817 },
      'Tryon,NC': { lat: 35.2167, lng: -82.2683 },
      'Mill Spring,NC': { lat: 35.3350, lng: -82.2333 },
      'Gastonia,NC': { lat: 35.2624, lng: -81.1865 },
      'Lenoir,NC': { lat: 36.1717, lng: -81.5417 },
      // GA Region
      'Hartwell,GA': { lat: 34.3517, lng: -82.9417 },
      'Cleveland,GA': { lat: 34.5833, lng: -83.7667 },
      'Blue Ridge,GA': { lat: 34.2850, lng: -84.1433 },
      // KY Region
      'Stearns,KY': { lat: 36.7283, lng: -84.3483 },
      // MN Region
      'Minneapolis,MN': { lat: 44.9778, lng: -93.2650 },
    };

    let key = `${city},${state}`;
    if (cityCoordinates[key]) {
      return cityCoordinates[key];
    }

    const cityLower = city.toLowerCase();
    for (const [coordKey, coords] of Object.entries(cityCoordinates)) {
      if (coordKey.toLowerCase().startsWith(cityLower)) {
        return coords;
      }
    }

    const missingKey = `${city},${state}`;
    window.__cityCoordinateWarningCache = window.__cityCoordinateWarningCache || new Set();
    if (!window.__cityCoordinateWarningCache.has(missingKey)) {
      console.log(`📍 Using default coordinates for: ${city}, ${state}`);
      window.__cityCoordinateWarningCache.add(missingKey);
    }
    return { lat: 35.3395, lng: -82.4637 };
  }

  /**
   * Populate city data with distances
   */
  populateCityData() {
    this.cityGroups.clear();

    if (!this.adventuresData || this.adventuresData.length === 0) {
      console.log('No adventures data available');
      return;
    }

    this.adventuresData.forEach((adventure, idx) => {
      let values = null;

      if (adventure?.row?.values?.[0]) {
        values = adventure.row.values[0];
      } else if (adventure?.values?.[0]) {
        values = adventure.values[0];
      } else if (Array.isArray(adventure) && adventure.length > 0) {
        values = adventure;
      }

      if (!values || !Array.isArray(values)) {
        return;
      }

      const toCellText = (value) => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return value.trim();
        if (typeof value === 'number' || typeof value === 'boolean') return String(value).trim();
        return '';
      };

      // Support both core adventure schema and alternate tab schemas.
      const city = toCellText(values[10]) || toCellText(values[7]) || 'Unknown City';
      const state = toCellText(values[9]) || toCellText(values[6]);
      const tags = toCellText(values[3]).split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

      if (!this.cityGroups.has(city)) {
        const coords = this.getApproximateCoordinates(city, state);
        const distance = this.calculateDistance(
          this.referenceLocation.lat,
          this.referenceLocation.lng,
          coords.lat,
          coords.lng
        );

        this.cityGroups.set(city, {
          name: city,
          state: state,
          distance: parseFloat(distance),
          coordinates: coords,
          locations: [],
          allTags: new Set()
        });
      }

      this.cityGroups.get(city).locations.push({
        index: idx,
        name: values[0] || 'Unknown',
        tags: tags,
        difficulty: values[7] || '',
        cost: values[14] || '',
        rating: values[13] || '',
        description: values[16] || ''
      });

      tags.forEach(tag => {
        this.cityGroups.get(city).allTags.add(tag);
        this.availableTags.add(tag);
      });
    });

    console.log(`✅ City groups populated: ${this.cityGroups.size} cities, ${this.availableTags.size} unique tags`);
  }

  /**
   * Create CSS for enhanced city visualizer
   */
  createStyles() {
    if (document.getElementById('enhancedCityVisualizerStyles')) return;

    const style = document.createElement('style');
    style.id = 'enhancedCityVisualizerStyles';
    style.textContent = `
      #enhancedCityVisualizerModal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        z-index: 1010;
        width: 95%;
        max-width: 1200px;
        max-height: 90vh;
        display: none;
        flex-direction: column;
        overflow: hidden;
        animation: slideUp 0.3s ease-out;
      }

      #enhancedCityVisualizerModal.visible {
        display: flex;
      }

      @keyframes slideUp {
        from { opacity: 0; transform: translate(-50%, -45%); }
        to { opacity: 1; transform: translate(-50%, -50%); }
      }

      #enhancedCityVisualizerBackdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1009;
        display: none;
      }

      #enhancedCityVisualizerBackdrop.visible {
        display: block;
      }

      .enhanced-city-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }

      .enhanced-city-title {
        font-size: 24px;
        font-weight: 700;
        margin: 0;
      }

      .enhanced-city-close {
        background: rgba(255,255,255,0.2);
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 20px;
        transition: all 0.2s;
      }

      .enhanced-city-close:hover {
        background: rgba(255,255,255,0.3);
      }

      .enhanced-city-controls {
        padding: 16px 24px;
        background: #f9fafb;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        align-items: center;
      }

      .enhanced-city-search {
        flex: 1;
        min-width: 250px;
        padding: 10px 16px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        font-size: 14px;
      }

      .enhanced-city-search:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      .enhanced-city-sort-btn {
        padding: 8px 16px;
        border: 1px solid #e5e7eb;
        background: white;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        font-size: 13px;
        transition: all 0.2s;
      }

      .enhanced-city-sort-btn.active {
        background: #667eea;
        color: white;
        border-color: #667eea;
      }

      .enhanced-city-content {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
      }

      .enhanced-city-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
      }

      .enhanced-city-card {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .enhanced-city-card:hover {
        border-color: #667eea;
        box-shadow: 0 10px 25px rgba(102, 126, 234, 0.15);
        transform: translateY(-4px);
      }

      .enhanced-city-card-name {
        font-size: 18px;
        font-weight: 700;
        color: #1f2937;
        margin: 0 0 12px 0;
      }

      .enhanced-city-footer {
        padding: 16px 24px;
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }

      .enhanced-city-btn {
        padding: 10px 20px;
        border: 1px solid #e5e7eb;
        background: white;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
      }

      .enhanced-city-btn:hover {
        border-color: #667eea;
        background: #f0f4ff;
      }

      .enhanced-city-btn.primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-color: #667eea;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Create HTML markup
   */
  createMarkup() {
    if (!document.body) return;
    if (document.getElementById('enhancedCityVisualizerBackdrop') && document.getElementById('enhancedCityVisualizerModal')) {
      return;
    }

    const backdrop = document.createElement('div');
    backdrop.id = 'enhancedCityVisualizerBackdrop';
    document.body.appendChild(backdrop);

    const modal = document.createElement('div');
    modal.id = 'enhancedCityVisualizerModal';
    modal.innerHTML = `
      <div class="enhanced-city-header">
        <h2 class="enhanced-city-title">🏙️ City Explorer</h2>
        <button class="enhanced-city-close" onclick="window.closeEnhancedCityVisualizer()">✕</button>
      </div>

      <div class="enhanced-city-controls">
        <input type="text" class="enhanced-city-search" id="citysearch" data-tv-focusable="true" placeholder="Search cities...">
        <div class="enhanced-city-sort">
          <button class="enhanced-city-sort-btn active" data-sort="distance" data-tv-focusable="true">📍 Distance</button>
          <button class="enhanced-city-sort-btn" data-sort="name" data-tv-focusable="true">A-Z</button>
          <button class="enhanced-city-sort-btn" data-sort="count" data-tv-focusable="true">📊 Count</button>
        </div>
      </div>

      <div class="enhanced-city-content" id="enhancedCityContent">
        <div id="cityListView" class="enhanced-city-list"></div>
      </div>

      <div class="enhanced-city-footer">
        <button class="enhanced-city-btn" data-tv-focusable="true" onclick="window.closeEnhancedCityVisualizer()">Close</button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    document.getElementById('enhancedCityVisualizerBackdrop')?.addEventListener('click', () => {
      window.closeEnhancedCityVisualizer();
    });

    document.getElementById('citysearch')?.addEventListener('input', () => {
      this.renderCityList();
    });

    document.querySelectorAll('.enhanced-city-sort-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.enhanced-city-sort-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.renderCityList();
      });
    });
  }

  /**
   * Render city list view
   */
  renderCityList() {
    const searchTerm = (document.getElementById('citysearch')?.value || '').toLowerCase();
    const activeBtn = document.querySelector('.enhanced-city-sort-btn.active');
    const sortMethod = activeBtn?.getAttribute('data-sort') || 'distance';

    let cities = Array.from(this.cityGroups.values());

    if (searchTerm) {
      cities = cities.filter(city =>
        city.name.toLowerCase().includes(searchTerm) ||
        city.state.toLowerCase().includes(searchTerm)
      );
    }

    if (sortMethod === 'distance') {
      cities.sort((a, b) => a.distance - b.distance);
    } else if (sortMethod === 'name') {
      cities.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortMethod === 'count') {
      cities.sort((a, b) => b.locations.length - a.locations.length);
    }

    const listView = document.getElementById('cityListView');
    if (!listView) return;

    if (cities.length === 0) {
      listView.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px;"><p style="color: #9ca3af;">No cities found</p></div>`;
      return;
    }

    listView.innerHTML = cities.map(city => `
      <div class="enhanced-city-card" tabindex="0" data-tv-focusable="true" onclick="window.viewCityDetailsEnhanced('${city.name.replace(/'/g, "\\'")}')">
        <h3 class="enhanced-city-card-name">${city.name}</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
          <div style="background: #f9fafb; padding: 8px; border-radius: 6px;">
            <span style="color: #6b7280;">📍 ${city.distance} mi</span>
          </div>
          <div style="background: #f9fafb; padding: 8px; border-radius: 6px;">
            <span style="color: #6b7280;">📌 ${city.locations.length}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Show the modal
   */
  show() {
    const backdrop = document.getElementById('enhancedCityVisualizerBackdrop');
    const modal = document.getElementById('enhancedCityVisualizerModal');
    if (!backdrop || !modal) {
      this.createMarkup();
    }

    const safeBackdrop = document.getElementById('enhancedCityVisualizerBackdrop');
    const safeModal = document.getElementById('enhancedCityVisualizerModal');
    if (!safeBackdrop || !safeModal) return;

    safeBackdrop.classList.add('visible');
    safeModal.classList.add('visible');
    this.currentView = 'cityList';
    this.refreshData();
    this.renderCityList();
  }

  /**
   * Hide the modal
   */
  hide() {
    const backdrop = document.getElementById('enhancedCityVisualizerBackdrop');
    const modal = document.getElementById('enhancedCityVisualizerModal');
    backdrop?.classList.remove('visible');
    modal?.classList.remove('visible');
  }

  /**
   * Refresh data from main window
   */
  refreshData() {
    if (window.adventuresData && window.adventuresData.length > 0) {
      this.adventuresData = window.adventuresData;
      this.populateCityData();
    }
  }
}

// Create global instance after DOM is ready to avoid startup race conditions.
if (!window.enhancedCityViz) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (!window.enhancedCityViz) {
        window.enhancedCityViz = new EnhancedCityVisualizer();
      }
    }, { once: true });
  } else {
    window.enhancedCityViz = new EnhancedCityVisualizer();
  }
}

/**
 * Global functions for enhanced city visualizer
 * Redirects to new tab opener instead of modal
 */
window.openEnhancedCityVisualizer = function() {
  console.log('🌆 City Viewer → opening in new tab (modal disabled)');
  if (typeof window.openCityViewerInNewTab === 'function') {
    window.openCityViewerInNewTab();
  } else if (typeof window.openCityViewerWindow === 'function') {
    window.openCityViewerWindow();
  }
};

window.closeEnhancedCityVisualizer = function() {
  if (window.enhancedCityViz) {
    window.enhancedCityViz.hide();
  }
};

// viewCityDetailsEnhanced is defined early (line 29) to prevent timing issues
// See defensive function definitions at top of file

console.log('✅ Enhanced City Visualizer ready');

// ============================================================
// SECTION 10: ENHANCED CITY VIEWER (Interactive Location Browsing)
// ============================================================

window.enhancedCityViewer = {
  currentView: 'cities',
  selectedCity: null,
  citiesData: {},

  /**
   * Initialize enhanced city viewer
   */
  init: function() {
    this.createStyles();
    console.log('✅ Enhanced City Viewer initialized');
  },

  /**
   * Create enhanced styles
   */
  createStyles: function() {
    if (document.getElementById('enhancedCityViewerStyles')) return;

    const style = document.createElement('style');
    style.id = 'enhancedCityViewerStyles';
    style.textContent = `
      .city-viewer-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .city-viewer-title {
        font-size: 18px;
        font-weight: 700;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .city-viewer-back-btn {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        font-size: 13px;
        transition: all 0.2s;
      }

      .city-viewer-back-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .locations-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .location-item {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 16px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .location-item:hover {
        border-color: #667eea;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        transform: translateY(-2px);
      }

      .location-item-name {
        font-weight: 700;
        color: #1f2937;
        font-size: 14px;
        margin-bottom: 4px;
      }

      .location-tag {
        background: #dbeafe;
        color: #1e40af;
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
      }

      .location-item-action {
        background: #667eea;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        font-size: 12px;
        transition: all 0.2s;
      }

      .location-item-action:hover {
        background: #5568d3;
      }
    `;

    document.head.appendChild(style);
  },

  /**
   * Escape HTML
   */
  escapeHtml: function(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }
};

// Initialize enhanced city viewer
window.enhancedCityViewer.init();

console.log('✅ Enhanced City Viewer ready');

// ============================================================
// INITIALIZATION
// ============================================================

console.log('✅ Consolidated City Viewer System v7.0.141 Loaded');
console.log('  - City Viewer Tab Opener');
console.log('  - Geolocation & Drive Time System');
console.log('  - Location Hours Checker');
console.log('  - Drive Time Calculator');
console.log('  - Dynamic Tag Filter');
console.log('  - City Viewer Enhancements API');
console.log('  - City Viewer Integration');
console.log('  - City Visualizer');
console.log('  - Enhanced City Visualizer');
console.log('  - Enhanced City Viewer');

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    LocationHoursChecker,
    DriveTimeCalculator,
    DynamicTagFilter,
    CityVisualizer,
    cityViewerEnhancements,
    enhancedCityViewerIntegration
  };
}
