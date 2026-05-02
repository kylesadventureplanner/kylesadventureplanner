(function initHouseholdConcertsSystem(global) {
  'use strict';

  var ROOT_ID = 'householdConcertsPane';
  var MODAL_HOST_ID = 'householdConcertsModalHost';
  var STATUS_ID = 'householdConcertsStatus';
  var SUMMARY_ID = 'householdConcertsSummaryGrid';
  var GENRE_CHIPS_ID = 'householdConcertsGenreChips';
  var FAVORITES_GRID_ID = 'householdConcertsFavoritesGrid';
  var SEARCH_RESULTS_ID = 'householdConcertsSearchResults';
  var DISCOVERY_ID = 'householdConcertsDiscovery';
  var ATTENDED_ID = 'householdConcertsAttendedList';
  var UPCOMING_ID = 'householdConcertsUpcomingList';
  var LOCATION_TEXT_ID = 'householdConcertsLocationText';
  var DISTANCE_VALUE_ID = 'householdConcertsDistanceValue';
  var FAVORITE_TABLE = 'Favorite_Bands';
  var ATTENDED_TABLE = 'Attended_Concerts';
  var UPCOMING_TABLE = 'Upcoming_Concerts';
  var WORKBOOK_NAME = 'Concerts_Bands.xlsx';
  var DISTANCE_STOPS = [25, 50, 75, 100, 250, 1000];
  var LOCATION_STORAGE_KEY = 'kap_user_gps';
  var NOTES_STORAGE_KEY = 'householdConcertsNotesV1';
  var GEOCODE_STORAGE_KEY = 'householdConcertsGeocodeCacheV1';
  var DISCOVERY_STORAGE_KEY = 'householdConcertsDiscoveryCacheV1';
  var WORKBOOK_PREFIXES = [
    'Copilot_Apps/Kyles_Adventure_Finder/Household Tools/',
    'Copilot_Apps/Kyles_Adventure_Finder/Household/',
    'Copilot_Apps/Kyles_Adventure_Finder/',
    'Concerts/',
    ''
  ];

  var state = {
    initialized: false,
    loading: false,
    workbookPath: '',
    favoriteBands: [],
    attendedConcerts: [],
    upcomingConcerts: [],
    searchResults: [],
    activeBandKey: '',
    bandFilter: '',
    genreFilter: '',
    distanceIndex: 3,
    searchBusy: false,
    geocodeBusy: false,
    discoveryBusyKey: '',
    location: restoreLocation(),
    localNotes: readJsonStorage(NOTES_STORAGE_KEY, {}),
    geocodeCache: readJsonStorage(GEOCODE_STORAGE_KEY, {}),
    discoveryCache: readJsonStorage(DISCOVERY_STORAGE_KEY, {}),
    pendingSearchQuery: '',
    attendedUploadFiles: [],
    attendedUploadedPhotoUrls: [],
    attendedUploadBusy: false,
    attendedUploadStatus: { tone: 'info', message: '' },
    status: { tone: 'info', message: 'Concerts loads from your Excel workbook and can also search the web for artists to add.' }
  };

  function readJsonStorage(key, fallback) {
    try {
      var raw = global.localStorage.getItem(key);
      if (!raw) return fallback;
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function writeJsonStorage(key, value) {
    try {
      global.localStorage.setItem(key, JSON.stringify(value));
    } catch (_error) {
      // Ignore storage failures.
    }
  }

  function restoreLocation() {
    try {
      if (global.userLocation && Number.isFinite(global.userLocation.latitude) && Number.isFinite(global.userLocation.longitude)) {
        return { latitude: Number(global.userLocation.latitude), longitude: Number(global.userLocation.longitude) };
      }
      var raw = global.localStorage.getItem(LOCATION_STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !Number.isFinite(parsed.latitude) || !Number.isFinite(parsed.longitude)) return null;
      return { latitude: Number(parsed.latitude), longitude: Number(parsed.longitude) };
    } catch (_error) {
      return null;
    }
  }

  function getRoot() {
    return document.getElementById(ROOT_ID);
  }

  function getModalHost() {
    return document.getElementById(MODAL_HOST_ID);
  }

  function $(id) {
    return document.getElementById(id);
  }

  function normalizeText(value) {
    return String(value == null ? '' : value)
      .trim()
      .toLowerCase();
  }

  function normalizeKey(value) {
    return normalizeText(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-');
  }

  function normalizeColumnName(value) {
    return normalizeText(value).replace(/[^a-z0-9]/g, '');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function uniqueStrings(list) {
    var seen = new Set();
    return (Array.isArray(list) ? list : []).filter(function (item) {
      var key = normalizeText(item);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function splitList(value) {
    if (!value) return [];
    return uniqueStrings(String(value)
      .split(/\n|\||•|;|,(?=\s*[A-Za-z#])/)
      .map(function (item) { return String(item || '').trim(); })
      .filter(Boolean));
  }

  function splitGenres(value) {
    if (!value) return [];
    return uniqueStrings(String(value)
      .split(/[\n|;,]/)
      .map(function (item) { return String(item || '').trim(); })
      .filter(Boolean));
  }

  function parsePhotoUrlsField(value) {
    var raw = String(value || '').trim();
    if (!raw) return [];

    var candidate = raw;
    try {
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return uniqueStrings(parsed.map(function (entry) { return String(entry || '').trim(); }).filter(Boolean));
      }
      if (typeof parsed === 'string') {
        candidate = parsed;
      }
    } catch (_error) {
      // Keep raw value as-is.
    }

    return uniqueStrings(String(candidate || '')
      .split(/[\n;,]/)
      .map(function (entry) { return String(entry || '').trim(); })
      .filter(Boolean));
  }

  function serializePhotoUrlsForStorage(urls) {
    var list = uniqueStrings((Array.isArray(urls) ? urls : []).map(function (entry) {
      return String(entry || '').trim();
    }).filter(Boolean));
    if (!list.length) return '';
    if (list.length === 1) return list[0];
    return JSON.stringify(list);
  }

  function mergePhotoUrlLists() {
    var merged = [];
    for (var i = 0; i < arguments.length; i += 1) {
      var source = parsePhotoUrlsField(serializePhotoUrlsForStorage(arguments[i]));
      merged = merged.concat(source);
    }
    return uniqueStrings(merged);
  }

  function toIsoDate(value) {
    if (!value) return '';
    var str = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    var date = new Date(str);
    if (Number.isNaN(date.getTime())) return '';
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  }

  function formatDate(value) {
    var iso = toIsoDate(value);
    if (!iso) return 'Date not set';
    var date = new Date(iso + 'T12:00:00');
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function formatDayOfWeek(value) {
    var iso = toIsoDate(value);
    if (!iso) return '';
    var date = new Date(iso + 'T12:00:00');
    return date.toLocaleDateString(undefined, { weekday: 'long' });
  }

  function safeUrl(value) {
    var str = String(value || '').trim();
    if (!str) return '';
    if (/^https?:\/\//i.test(str)) return str;
    return 'https://' + str.replace(/^\/+/, '');
  }

  function formatRatingStars(value) {
    var rating = Math.max(0, Math.min(5, Number(value) || 0));
    if (!rating) return 'Not rated';
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  }

  function getDistanceLabel(index) {
    var miles = DISTANCE_STOPS[Math.max(0, Math.min(DISTANCE_STOPS.length - 1, Number(index) || 0))];
    return miles >= 1000 ? 'Anywhere' : miles + ' miles';
  }

  function setStatus(message, tone) {
    state.status = {
      tone: tone || 'info',
      message: String(message || '').trim()
    };
    renderStatus();
  }

  function renderStatus() {
    var el = $(STATUS_ID);
    if (!el) return;
    var tone = state.status && state.status.tone ? state.status.tone : 'info';
    el.className = 'household-concerts-status household-concerts-status--' + tone;
    el.innerHTML = '<span>' + escapeHtml(state.status && state.status.message ? state.status.message : '') + '</span>';
  }

  function getHostWindow() {
    if (global.parent && global.parent !== global) return global.parent;
    if (global.opener && !global.opener.closed) return global.opener;
    return global;
  }

  async function ensureAccessToken() {
    var host = getHostWindow();
    var direct = String((host && host.accessToken) || global.accessToken || '').trim();
    if (direct) return direct;
    var rehydrate = (host && typeof host.rehydrateAuthState === 'function')
      ? host.rehydrateAuthState
      : (typeof global.rehydrateAuthState === 'function' ? global.rehydrateAuthState : null);
    if (rehydrate) {
      try {
        await rehydrate();
      } catch (_error) {
        // Continue to final token check.
      }
    }
    return String((host && host.accessToken) || global.accessToken || '').trim();
  }

  function encodeGraphPath(path) {
    return String(path || '').split('/').map(function (segment) {
      return encodeURIComponent(segment);
    }).join('/');
  }

  function sanitizeFileName(fileName) {
    var raw = String(fileName || '').trim() || ('concert-photo-' + Date.now() + '.jpg');
    return raw
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 120) || ('concert-photo-' + Date.now() + '.jpg');
  }

  function buildConcertPhotoUploadPath(meta, fileName) {
    var safeMeta = meta && typeof meta === 'object' ? meta : {};
    var bandPart = normalizeKey(safeMeta.bandName || 'unknown-band') || 'unknown-band';
    var datePart = toIsoDate(safeMeta.concertDate) || new Date().toISOString().slice(0, 10);
    var namePart = sanitizeFileName(fileName);
    return 'Concerts/Uploads/' + bandPart + '/' + datePart + '-' + namePart;
  }

  async function fetchGraphRaw(url, options) {
    var token = await ensureAccessToken();
    if (!token) throw new Error('Sign in is required to upload photos to OneDrive.');

    var opts = options && typeof options === 'object' ? options : {};
    var headers = Object.assign({}, opts.headers || {}, { Authorization: 'Bearer ' + token });
    var response = await fetch(url, {
      method: opts.method || 'GET',
      headers: headers,
      body: opts.body
    });

    if (response.status === 401) {
      var refreshed = await ensureAccessToken();
      if (refreshed && refreshed !== token) {
        headers.Authorization = 'Bearer ' + refreshed;
        response = await fetch(url, {
          method: opts.method || 'GET',
          headers: headers,
          body: opts.body
        });
      }
    }

    if (!response.ok) {
      var text;
      try {
        text = await response.text();
      } catch (_error) {
        text = '';
      }
      throw new Error('Upload failed (' + response.status + '): ' + (text || response.statusText || 'Unknown error'));
    }

    return response;
  }

  async function uploadConcertPhotoToOneDrive(file, meta) {
    if (!file) throw new Error('Select a photo file before uploading.');
    var safeMeta = meta && typeof meta === 'object' ? meta : {};
    var uploadPath = buildConcertPhotoUploadPath(safeMeta, file.name || 'concert-photo.jpg');
    var encodedPath = encodeGraphPath(uploadPath);
    var url = 'https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/content';
    var response = await fetchGraphRaw(url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'application/octet-stream'
      },
      body: file
    });
    var payload = await response.json().catch(function () { return {}; });
    var resolvedUrl = String(payload.webUrl || payload['@microsoft.graph.downloadUrl'] || '').trim();
    if (!resolvedUrl) throw new Error('Upload succeeded but OneDrive did not return a shareable URL.');
    return {
      url: resolvedUrl,
      fileId: String(payload.id || '').trim(),
      fileName: String(payload.name || file.name || '').trim()
    };
  }

  async function fetchJson(url, options) {
    var token = await ensureAccessToken();
    if (!token) {
      throw new Error('Sign in is required to read or write your Concerts workbook.');
    }
    var opts = options && typeof options === 'object' ? options : {};
    var headers = Object.assign({}, opts.headers || {}, {
      Authorization: 'Bearer ' + token
    });
    if (opts.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

    var response = await fetch(url, {
      method: opts.method || 'GET',
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    });

    if (response.status === 401) {
      var refreshed = await ensureAccessToken();
      if (refreshed && refreshed !== token) {
        headers.Authorization = 'Bearer ' + refreshed;
        response = await fetch(url, {
          method: opts.method || 'GET',
          headers: headers,
          body: opts.body ? JSON.stringify(opts.body) : undefined
        });
      }
    }

    if (!response.ok) {
      var text;
      try {
        text = await response.text();
      } catch (_error) {
        text = '';
      }
      throw new Error('Graph request failed (' + response.status + '): ' + (text || response.statusText || 'Unknown error'));
    }

    return response.json().catch(function () { return {}; });
  }

  function getWorkbookPathCandidates() {
    var seen = new Set();
    return WORKBOOK_PREFIXES.map(function (prefix) {
      return String(prefix || '') + WORKBOOK_NAME;
    }).filter(function (candidate) {
      if (!candidate || seen.has(candidate)) return false;
      seen.add(candidate);
      return true;
    });
  }

  async function fetchTableColumnsAndRows(filePath, tableName, top) {
    var encodedPath = encodeGraphPath(filePath);
    var tableRef = encodeURIComponent(tableName);
    var safeTop = Math.max(1, Number(top) || 1000);
    var baseUrl = 'https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/tables/' + tableRef;
    var columnsPayload = await fetchJson(baseUrl + '/columns?$select=name,index');
    var rowsPayload = await fetchJson(baseUrl + '/rows?$top=' + safeTop);
    return {
      columns: Array.isArray(columnsPayload.value) ? columnsPayload.value : [],
      rows: Array.isArray(rowsPayload.value) ? rowsPayload.value : []
    };
  }

  function toRowObjects(columns, rows) {
    var namesByIndex = {};
    (Array.isArray(columns) ? columns : []).forEach(function (column, idx) {
      var index = Number.isInteger(column.index) ? column.index : idx;
      namesByIndex[index] = String(column.name || 'column_' + index).trim();
    });
    return (Array.isArray(rows) ? rows : []).map(function (row) {
      var values = Array.isArray(row.values) && Array.isArray(row.values[0]) ? row.values[0] : [];
      var record = {};
      values.forEach(function (value, index) {
        record[namesByIndex[index] || ('column_' + index)] = value;
      });
      return record;
    });
  }

  async function findWorkbookPath() {
    if (state.workbookPath) return state.workbookPath;
    var candidates = getWorkbookPathCandidates();
    for (var i = 0; i < candidates.length; i += 1) {
      var candidate = candidates[i];
      try {
        await fetchTableColumnsAndRows(candidate, FAVORITE_TABLE, 1);
        state.workbookPath = candidate;
        return candidate;
      } catch (_error) {
        // Probe next candidate.
      }
    }
    throw new Error('Could not locate ' + WORKBOOK_NAME + '. Checked: ' + candidates.join(', '));
  }

  function mapRecordToRowByColumns(record, columns) {
    var normalizedValues = {};
    Object.entries(record || {}).forEach(function (entry) {
      var normalized = normalizeColumnName(entry[0]);
      if (normalized) normalizedValues[normalized] = entry[1];
    });
    return (Array.isArray(columns) ? columns : [])
      .slice()
      .sort(function (a, b) {
        var ai = Number.isInteger(a.index) ? a.index : 0;
        var bi = Number.isInteger(b.index) ? b.index : 0;
        return ai - bi;
      })
      .map(function (column) {
        var normalizedName = normalizeColumnName(column.name || '');
        var value = Object.prototype.hasOwnProperty.call(normalizedValues, normalizedName)
          ? normalizedValues[normalizedName]
          : '';
        return value == null ? '' : value;
      });
  }

  async function appendRecordToTable(filePath, tableName, record) {
    var schema = await fetchTableColumnsAndRows(filePath, tableName, 1);
    var row = mapRecordToRowByColumns(record, schema.columns || []);
    var encodedPath = encodeGraphPath(filePath);
    var url = 'https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/tables/' + encodeURIComponent(tableName) + '/rows/add';
    await fetchJson(url, { method: 'POST', body: { values: [row] } });
  }

  function readValue(record, aliases) {
    var source = record && typeof record === 'object' ? record : {};
    var normalizedSource = {};
    Object.keys(source).forEach(function (key) {
      normalizedSource[normalizeColumnName(key)] = source[key];
    });
    for (var i = 0; i < aliases.length; i += 1) {
      var alias = normalizeColumnName(aliases[i]);
      if (alias && Object.prototype.hasOwnProperty.call(normalizedSource, alias)) {
        return normalizedSource[alias];
      }
    }
    return '';
  }

  function concertNoteKey(bandName, concertDate, venue) {
    return [normalizeKey(bandName), toIsoDate(concertDate), normalizeKey(venue)].join('::');
  }

  function parseFavoriteBand(record) {
    var bandName = String(readValue(record, ['Band_Name', 'Band Name', 'Name']) || '').trim();
    if (!bandName) return null;
    return {
      id: normalizeKey(bandName) || ('band-' + Math.random().toString(36).slice(2, 8)),
      bandName: bandName,
      bandMembers: String(readValue(record, ['Band_Members', 'Band Members']) || '').trim(),
      bandLogoUrl: String(readValue(record, ['Band_Logo_URL', 'Band Logo URL']) || '').trim(),
      bandCoverPhotoUrl: String(readValue(record, ['Band_Cover_Photo_URL', 'Band Cover Photo URL']) || '').trim(),
      origin: String(readValue(record, ['Origin']) || '').trim(),
      founded: String(readValue(record, ['Founded']) || '').trim(),
      recordLabel: String(readValue(record, ['Record_Label', 'Record _Label', 'Label']) || '').trim(),
      discography: String(readValue(record, ['Discography']) || '').trim(),
      topSongs: String(readValue(record, ['Top_Songs', 'Top Songs']) || '').trim(),
      associatedGenres: String(readValue(record, ['Associated_Genres', 'Associated Genres', 'Genres']) || '').trim(),
      websiteUrl: String(readValue(record, ['Website_URL', 'Website URL']) || '').trim(),
      tourPageUrl: String(readValue(record, ['Tour_Page_URL', 'Tour Page URL']) || '').trim(),
      facebookUrl: String(readValue(record, ['Facebook_URL', 'Facebook URL']) || '').trim(),
      instagramUrl: String(readValue(record, ['Instagram_URL', 'Instagram URL']) || '').trim(),
      youTubeUrl: String(readValue(record, ['YouTube_URL', 'YouTube URL']) || '').trim(),
      setlistUrl: String(readValue(record, ['Setlist.fm_URL', 'Setlist FM URL']) || '').trim(),
      bandsintownUrl: String(readValue(record, ['Bandsintown_URL', 'Bandsintown URL']) || '').trim(),
      wikipediaUrl: String(readValue(record, ['Wikipedia_URL', 'Wikipedia URL']) || '').trim(),
      genres: splitGenres(readValue(record, ['Associated_Genres', 'Genres'])),
      members: splitList(readValue(record, ['Band_Members', 'Band Members'])),
      songs: splitList(readValue(record, ['Top_Songs', 'Top Songs'])),
      releases: splitList(readValue(record, ['Discography']))
    };
  }

  function parseAttendedConcert(record) {
    var bandName = String(readValue(record, ['Band_Name', 'Band Name']) || '').trim();
    var concertDate = toIsoDate(readValue(record, ['Concert_Date', 'Concert Date']));
    var venue = String(readValue(record, ['Venue']) || '').trim();
    if (!bandName) return null;
    var key = concertNoteKey(bandName, concertDate, venue);
    var photoUrls = parsePhotoUrlsField(readValue(record, ['Photo_URL', 'Photo URL']));
    return {
      id: key || ('attended-' + Math.random().toString(36).slice(2, 8)),
      bandKey: normalizeKey(bandName),
      bandName: bandName,
      concertDate: concertDate,
      venue: venue,
      rating: Math.max(0, Math.min(5, Number(readValue(record, ['Rating']) || 0) || 0)),
      photoUrl: photoUrls[0] || '',
      photoUrls: photoUrls,
      videoUrl: String(readValue(record, ['Video_URL', 'Video URL']) || '').trim(),
      setlistUrl: String(readValue(record, ['Setlist_URL', 'Setlist URL']) || '').trim(),
      notes: String(readValue(record, ['Notes']) || state.localNotes[key] || '').trim()
    };
  }

  function parseUpcomingConcert(record) {
    var bandName = String(readValue(record, ['Band_Name', 'Band Name']) || '').trim();
    if (!bandName) return null;
    var concertDate = toIsoDate(readValue(record, ['Concert_Date', 'Concert Date']));
    var city = String(readValue(record, ['City']) || '').trim();
    var stateName = String(readValue(record, ['State']) || '').trim();
    return {
      id: [normalizeKey(bandName), concertDate, normalizeKey(readValue(record, ['Venue']) || ''), normalizeKey(city), normalizeKey(stateName)].join('::'),
      bandKey: normalizeKey(bandName),
      bandName: bandName,
      concertDate: concertDate,
      dayOfWeek: String(readValue(record, ['Day_of_Week', 'Day Of Week']) || formatDayOfWeek(concertDate)).trim(),
      venue: String(readValue(record, ['Venue']) || '').trim(),
      city: city,
      state: stateName,
      distanceMiles: null
    };
  }

  function getBandByKey(key) {
    var target = normalizeKey(key);
    return state.favoriteBands.find(function (band) {
      return band.id === target || normalizeKey(band.bandName) === target;
    }) || null;
  }

  function computeBandStats(bandKey) {
    var key = normalizeKey(bandKey);
    var attended = state.attendedConcerts.filter(function (item) { return item.bandKey === key; });
    var upcoming = state.upcomingConcerts.filter(function (item) { return item.bandKey === key; });
    var averageRating = attended.length
      ? attended.reduce(function (sum, item) { return sum + (Number(item.rating) || 0); }, 0) / attended.length
      : 0;
    return {
      attendedCount: attended.length,
      upcomingCount: upcoming.length,
      averageRating: averageRating
    };
  }

  function getTopGenres() {
    var counts = new Map();
    state.favoriteBands.forEach(function (band) {
      (band.genres || []).forEach(function (genre) {
        counts.set(genre, (counts.get(genre) || 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .sort(function (a, b) { return b[1] - a[1] || a[0].localeCompare(b[0]); })
      .slice(0, 10);
  }

  function getFilteredBands() {
    var query = normalizeText(state.bandFilter);
    var genreFilter = normalizeText(state.genreFilter);
    return state.favoriteBands.filter(function (band) {
      if (genreFilter) {
        var hasGenre = (band.genres || []).some(function (genre) { return normalizeText(genre) === genreFilter; });
        if (!hasGenre) return false;
      }
      if (!query) return true;
      var haystack = [
        band.bandName,
        band.origin,
        band.recordLabel,
        band.associatedGenres,
        band.topSongs,
        band.discography,
        band.bandMembers
      ].join(' ').toLowerCase();
      return haystack.indexOf(query) >= 0;
    });
  }

  function getFilteredAttendedConcerts() {
    var allowedBandKeys = new Set(getFilteredBands().map(function (band) { return normalizeKey(band.bandName); }));
    if (!state.bandFilter && !state.genreFilter) return state.attendedConcerts.slice();
    return state.attendedConcerts.filter(function (concert) { return allowedBandKeys.has(concert.bandKey); });
  }

  function getFilteredUpcomingConcerts() {
    var allowedBandKeys = new Set(getFilteredBands().map(function (band) { return normalizeKey(band.bandName); }));
    var maxDistance = DISTANCE_STOPS[state.distanceIndex] || DISTANCE_STOPS[3];
    return state.upcomingConcerts.filter(function (concert) {
      if ((state.bandFilter || state.genreFilter) && !allowedBandKeys.has(concert.bandKey)) return false;
      if (state.location && Number.isFinite(concert.distanceMiles)) {
        return concert.distanceMiles <= maxDistance;
      }
      return true;
    });
  }

  function renderSummary() {
    var el = $(SUMMARY_ID);
    if (!el) return;
    var favoriteCount = state.favoriteBands.length;
    var attendedCount = state.attendedConcerts.length;
    var upcomingNearbyCount = getFilteredUpcomingConcerts().length;
    var averageRating = attendedCount
      ? state.attendedConcerts.reduce(function (sum, item) { return sum + (Number(item.rating) || 0); }, 0) / attendedCount
      : 0;
    var activeBand = resolveActiveBand();
    var activeStats = activeBand ? computeBandStats(activeBand.id) : null;

    el.innerHTML = [
      summaryCard('Favorite Bands', String(favoriteCount), 'Artists you actively follow and want to keep up with.'),
      summaryCard('Concerts Seen', String(attendedCount), 'Every show you have logged, rated, and documented.'),
      summaryCard('Upcoming In Range', String(upcomingNearbyCount), state.location ? 'Based on your current distance slider and saved location.' : 'Set your location to turn on nearby concert filtering.'),
      summaryCard('Average Rating', averageRating ? averageRating.toFixed(1) + ' / 5' : '—', 'How your attended shows are trending overall.'),
      summaryCard('Active Band Focus', activeBand ? activeBand.bandName : 'Pick a band', activeStats ? (activeStats.attendedCount + ' seen • ' + activeStats.upcomingCount + ' upcoming') : 'Select a band card to see similar artists and recommendations.')
    ].join('');
  }

  function summaryCard(label, value, hint) {
    return '<article class="household-concerts-summary-card">'
      + '<div class="household-concerts-summary-label">' + escapeHtml(label) + '</div>'
      + '<div class="household-concerts-summary-value">' + escapeHtml(value) + '</div>'
      + '<div class="household-concerts-summary-hint">' + escapeHtml(hint) + '</div>'
      + '</article>';
  }

  function renderGenreChips() {
    var el = $(GENRE_CHIPS_ID);
    if (!el) return;
    var chips = getTopGenres();
    var html = ['<button type="button" class="household-concerts-chip' + (state.genreFilter ? '' : ' is-active') + '" data-concert-action="set-genre-filter" data-genre="">All genres</button>'];
    chips.forEach(function (entry) {
      var genre = entry[0];
      var count = entry[1];
      var active = normalizeText(genre) === normalizeText(state.genreFilter);
      html.push('<button type="button" class="household-concerts-chip' + (active ? ' is-active' : '') + '" data-concert-action="set-genre-filter" data-genre="' + escapeHtml(genre) + '">' + escapeHtml(genre) + ' <span>' + count + '</span></button>');
    });
    el.innerHTML = html.join('');
  }

  function renderFavoriteBands() {
    var el = $(FAVORITES_GRID_ID);
    if (!el) return;
    var bands = getFilteredBands();
    if (!bands.length) {
      el.innerHTML = emptyState('No favorite bands match the current filters.', 'Try a different search or add a new band from the web search panel.');
      return;
    }
    var activeBandKey = normalizeKey(resolveActiveBand() && resolveActiveBand().id);
    el.innerHTML = bands.map(function (band) {
      var stats = computeBandStats(band.id);
      var isActive = normalizeKey(band.id) === activeBandKey;
      var members = (band.members || []).slice(0, 4);
      var genres = (band.genres || []).slice(0, 4);
      var songs = (band.songs || []).slice(0, 4);
      var links = renderBandLinks(band, true);
      var coverStyle = band.bandCoverPhotoUrl ? ' style="background-image:url(\'' + escapeHtml(safeUrl(band.bandCoverPhotoUrl)) + '\')"' : '';
      var logo = band.bandLogoUrl
        ? '<img class="household-concerts-band-logo" src="' + escapeHtml(safeUrl(band.bandLogoUrl)) + '" alt="' + escapeHtml(band.bandName) + ' logo">'
        : '<div class="household-concerts-band-logo household-concerts-band-logo--placeholder">🎵</div>';
      return '<article class="household-concerts-band-card' + (isActive ? ' is-active' : '') + '" data-concert-band-key="' + escapeHtml(band.id) + '">'
        + '<div class="household-concerts-band-cover"' + coverStyle + '></div>'
        + '<div class="household-concerts-band-card-body">'
        + '<div class="household-concerts-band-header">'
        + logo
        + '<div>'
        + '<h3>' + escapeHtml(band.bandName) + '</h3>'
        + '<div class="household-concerts-band-meta">' + escapeHtml(band.origin || 'Origin not set') + ' • ' + escapeHtml(band.founded || 'Founded date not set') + '</div>'
        + '</div>'
        + '</div>'
        + '<div class="household-concerts-band-stats">'
        + statPill('Seen', String(stats.attendedCount))
        + statPill('Upcoming', String(stats.upcomingCount))
        + statPill('Avg', stats.averageRating ? stats.averageRating.toFixed(1) + '★' : '—')
        + '</div>'
        + (genres.length ? '<div class="household-concerts-tag-row">' + genres.map(renderTag).join('') + '</div>' : '')
        + '<div class="household-concerts-band-detail-grid">'
        + detailLine('Label', band.recordLabel || 'Not set')
        + detailLine('Top Songs', songs.length ? songs.join(', ') : 'Add favorite songs')
        + detailLine('Members', members.length ? members.join(' • ') : 'Add members and roles')
        + '</div>'
        + links
        + '<div class="household-concerts-band-actions">'
        + '<button type="button" class="pill-button" data-concert-action="select-band" data-band-key="' + escapeHtml(band.id) + '">Focus</button>'
        + '<button type="button" class="pill-button" data-concert-action="open-band-details" data-band-key="' + escapeHtml(band.id) + '">View Profile</button>'
        + '<button type="button" class="pill-button" data-concert-action="open-log-concert" data-band-key="' + escapeHtml(band.id) + '">Log Concert</button>'
        + '<button type="button" class="pill-button" data-concert-action="open-add-upcoming" data-band-key="' + escapeHtml(band.id) + '">Add Upcoming</button>'
        + '</div>'
        + '</div>'
        + '</article>';
    }).join('');
  }

  function statPill(label, value) {
    return '<div class="household-concerts-stat-pill"><span>' + escapeHtml(label) + '</span><strong>' + escapeHtml(value) + '</strong></div>';
  }

  function detailLine(label, value) {
    return '<div class="household-concerts-detail-line"><strong>' + escapeHtml(label) + '</strong><span>' + escapeHtml(value) + '</span></div>';
  }

  function renderTag(value) {
    return '<span class="household-concerts-tag">' + escapeHtml(value) + '</span>';
  }

  function renderBandLinks(band, compact) {
    var links = [
      { label: 'Website', url: band.websiteUrl },
      { label: 'Tour', url: band.tourPageUrl },
      { label: 'Facebook', url: band.facebookUrl },
      { label: 'Instagram', url: band.instagramUrl },
      { label: 'YouTube', url: band.youTubeUrl },
      { label: 'Setlist.fm', url: band.setlistUrl },
      { label: 'Bandsintown', url: band.bandsintownUrl },
      { label: 'Wikipedia', url: band.wikipediaUrl }
    ].filter(function (item) { return item.url; });
    if (!links.length) return compact ? '' : '<p class="household-concerts-muted">Add website and social links to build out the full band profile.</p>';
    return '<div class="household-concerts-link-row">' + links.map(function (item) {
      return '<a class="household-concerts-link-pill" href="' + escapeHtml(safeUrl(item.url)) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(item.label) + '</a>';
    }).join('') + '</div>';
  }

  function emptyState(title, subtitle) {
    return '<div class="household-concerts-empty"><strong>' + escapeHtml(title) + '</strong><p>' + escapeHtml(subtitle) + '</p></div>';
  }

  function resolveActiveBand() {
    var current = getBandByKey(state.activeBandKey);
    if (current) return current;
    var fallback = getFilteredBands()[0] || state.favoriteBands[0] || null;
    state.activeBandKey = fallback ? fallback.id : '';
    return fallback;
  }

  function renderSearchResults() {
    var el = $(SEARCH_RESULTS_ID);
    if (!el) return;
    if (state.searchBusy) {
      el.innerHTML = emptyState('Searching for artists…', 'Matching artists from the public music search catalog will appear here.');
      return;
    }
    if (!state.searchResults.length) {
      el.innerHTML = emptyState('Search for a band to add', 'Type a band name above, search the catalog, then pick the right artist to prefill your favorite-band form.');
      return;
    }
    el.innerHTML = state.searchResults.map(function (result) {
      return '<article class="household-concerts-search-card">'
        + '<div class="household-concerts-search-card-main">'
        + '<h4>' + escapeHtml(result.bandName) + '</h4>'
        + '<p>' + escapeHtml(result.genreText || 'Genre unknown') + '</p>'
        + '<div class="household-concerts-search-reason">' + escapeHtml(result.sourceLabel || 'Music search result') + '</div>'
        + '</div>'
        + '<div class="household-concerts-search-actions">'
        + '<button type="button" class="pill-button" data-concert-action="open-add-band" data-search-result-id="' + escapeHtml(result.id) + '">Add Band</button>'
        + (result.referenceUrl ? '<a class="pill-button household-concerts-link-btn" href="' + escapeHtml(safeUrl(result.referenceUrl)) + '" target="_blank" rel="noopener noreferrer">Open</a>' : '')
        + '</div>'
        + '</article>';
    }).join('');
  }

  function computeSimilarBands(band) {
    if (!band) return [];
    var bandGenres = new Set((band.genres || []).map(normalizeText));
    return state.favoriteBands
      .filter(function (candidate) { return candidate.id !== band.id; })
      .map(function (candidate) {
        var score = 0;
        (candidate.genres || []).forEach(function (genre) {
          if (bandGenres.has(normalizeText(genre))) score += 4;
        });
        if (normalizeText(candidate.origin) && normalizeText(candidate.origin) === normalizeText(band.origin)) score += 2;
        if (normalizeText(candidate.recordLabel) && normalizeText(candidate.recordLabel) === normalizeText(band.recordLabel)) score += 1;
        return { band: candidate, score: score };
      })
      .filter(function (entry) { return entry.score > 0; })
      .sort(function (a, b) { return b.score - a.score || a.band.bandName.localeCompare(b.band.bandName); })
      .slice(0, 5);
  }

  function renderDiscovery() {
    var el = $(DISCOVERY_ID);
    if (!el) return;
    var activeBand = resolveActiveBand();
    if (!activeBand) {
      el.innerHTML = emptyState('Build your favorite band list first', 'Once you add bands, this panel will show similar favorites and recommended bands you have not added yet.');
      return;
    }
    var similar = computeSimilarBands(activeBand);
    var cacheKey = normalizeKey(activeBand.bandName);
    var recommendations = Array.isArray(state.discoveryCache[cacheKey]) ? state.discoveryCache[cacheKey] : [];
    var loading = state.discoveryBusyKey === cacheKey;
    el.innerHTML = '<div class="household-concerts-discovery-head">'
      + '<div><strong>Discovery for ' + escapeHtml(activeBand.bandName) + '</strong><p>See which favorite bands overlap, plus outside recommendations to consider next.</p></div>'
      + '<button type="button" class="pill-button" data-concert-action="refresh-discovery" data-band-key="' + escapeHtml(activeBand.id) + '">' + (loading ? 'Refreshing…' : 'Refresh Discovery') + '</button>'
      + '</div>'
      + '<div class="household-concerts-discovery-columns">'
      + '<div>'
      + '<h4>Already favorited and similar</h4>'
      + (similar.length
        ? '<div class="household-concerts-discovery-list">' + similar.map(function (entry) {
          return '<button type="button" class="household-concerts-discovery-item" data-concert-action="select-band" data-band-key="' + escapeHtml(entry.band.id) + '"><strong>' + escapeHtml(entry.band.bandName) + '</strong><span>' + escapeHtml((entry.band.genres || []).slice(0, 3).join(' • ') || entry.band.origin || 'Shared vibe') + '</span></button>';
        }).join('') + '</div>'
        : '<p class="household-concerts-muted">Add more bands with shared genres, labels, or origin cities to make this similarity graph stronger.</p>')
      + '</div>'
      + '<div>'
      + '<h4>Recommended to add next</h4>'
      + (recommendations.length
        ? '<div class="household-concerts-discovery-list">' + recommendations.map(function (item) {
          return '<div class="household-concerts-discovery-item household-concerts-discovery-item--suggested"><div><strong>' + escapeHtml(item.bandName) + '</strong><span>' + escapeHtml(item.reason || item.genreText || 'Genre-adjacent recommendation') + '</span></div><button type="button" class="pill-button" data-concert-action="open-add-band" data-discovery-id="' + escapeHtml(item.id) + '" data-band-key="' + escapeHtml(activeBand.id) + '">Add</button></div>';
        }).join('') + '</div>'
        : '<p class="household-concerts-muted">Use Refresh Discovery to search for additional artists related to ' + escapeHtml(activeBand.bandName) + '.</p>')
      + '</div>'
      + '</div>';
  }

  function renderAttendedConcerts() {
    var el = $(ATTENDED_ID);
    if (!el) return;
    var concerts = getFilteredAttendedConcerts().slice().sort(function (a, b) {
      return (toIsoDate(b.concertDate) || '').localeCompare(toIsoDate(a.concertDate) || '');
    });
    if (!concerts.length) {
      el.innerHTML = emptyState('No concerts logged yet', 'Use “Log Concert” to capture the date, venue, rating, photos, notes, and setlist links for a show you attended.');
      return;
    }
    el.innerHTML = concerts.map(function (concert) {
      var photoUrls = Array.isArray(concert.photoUrls) && concert.photoUrls.length
        ? concert.photoUrls
        : (concert.photoUrl ? [concert.photoUrl] : []);
      return '<article class="household-concerts-entry-card">'
        + '<div class="household-concerts-entry-head"><div><h4>' + escapeHtml(concert.bandName) + '</h4><p>' + escapeHtml(formatDate(concert.concertDate)) + ' • ' + escapeHtml(concert.venue || 'Venue not set') + '</p></div><div class="household-concerts-rating">' + escapeHtml(formatRatingStars(concert.rating)) + '</div></div>'
        + (concert.notes ? '<p class="household-concerts-entry-note">' + escapeHtml(concert.notes) + '</p>' : '')
        + '<div class="household-concerts-link-row">'
        + photoUrls.map(function (photoUrl, idx) {
          var label = photoUrls.length > 1 ? ('Photo ' + (idx + 1)) : 'Photo';
          return '<a class="household-concerts-link-pill" href="' + escapeHtml(safeUrl(photoUrl)) + '" target="_blank" rel="noopener noreferrer">' + label + '</a>';
        }).join('')
        + (concert.videoUrl ? '<a class="household-concerts-link-pill" href="' + escapeHtml(safeUrl(concert.videoUrl)) + '" target="_blank" rel="noopener noreferrer">Video</a>' : '')
        + (concert.setlistUrl ? '<a class="household-concerts-link-pill" href="' + escapeHtml(safeUrl(concert.setlistUrl)) + '" target="_blank" rel="noopener noreferrer">Setlist</a>' : '')
        + '</div>'
        + '</article>';
    }).join('');
  }

  function renderUpcomingConcerts() {
    var el = $(UPCOMING_ID);
    if (!el) return;
    var labelEl = $(DISTANCE_VALUE_ID);
    if (labelEl) labelEl.textContent = getDistanceLabel(state.distanceIndex);
    var locationEl = $(LOCATION_TEXT_ID);
    if (locationEl) {
      locationEl.textContent = state.location
        ? 'Location ready for nearby filtering.'
        : 'Save your location to filter upcoming concerts by distance.';
    }

    var concerts = getFilteredUpcomingConcerts().slice().sort(function (a, b) {
      return (toIsoDate(a.concertDate) || '').localeCompare(toIsoDate(b.concertDate) || '');
    });
    if (!concerts.length) {
      el.innerHTML = emptyState('No upcoming concerts in the current view', state.location ? 'Try increasing the distance slider or add another upcoming concert.' : 'Add an upcoming concert or set your location to unlock nearby filtering.');
      return;
    }
    el.innerHTML = concerts.map(function (concert) {
      var distanceText = Number.isFinite(concert.distanceMiles)
        ? concert.distanceMiles.toFixed(concert.distanceMiles < 10 ? 1 : 0) + ' mi away'
        : (state.location ? 'Distance pending…' : 'Set location to calculate distance');
      return '<article class="household-concerts-entry-card">'
        + '<div class="household-concerts-entry-head"><div><h4>' + escapeHtml(concert.bandName) + '</h4><p>' + escapeHtml(formatDate(concert.concertDate)) + (concert.dayOfWeek ? ' • ' + escapeHtml(concert.dayOfWeek) : '') + '</p></div><div class="household-concerts-upcoming-distance">' + escapeHtml(distanceText) + '</div></div>'
        + '<div class="household-concerts-upcoming-meta">'
        + '<span>' + escapeHtml(concert.venue || 'Venue not set') + '</span>'
        + '<span>' + escapeHtml([concert.city, concert.state].filter(Boolean).join(', ') || 'City / state not set') + '</span>'
        + '</div>'
        + '</article>';
    }).join('');
  }

  function renderAll() {
    renderStatus();
    renderSummary();
    renderGenreChips();
    renderFavoriteBands();
    renderSearchResults();
    renderDiscovery();
    renderAttendedConcerts();
    renderUpcomingConcerts();
  }

  async function readTableSafe(filePath, tableName) {
    try {
      var payload = await fetchTableColumnsAndRows(filePath, tableName, 1500);
      return toRowObjects(payload.columns, payload.rows);
    } catch (_error) {
      return [];
    }
  }

  async function refreshData() {
    if (state.loading) return;
    state.loading = true;
    setStatus('Loading Concerts workbook data…', 'info');
    renderAll();
    try {
      var workbookPath = await findWorkbookPath();
      var payloads = await Promise.all([
        readTableSafe(workbookPath, FAVORITE_TABLE),
        readTableSafe(workbookPath, ATTENDED_TABLE),
        readTableSafe(workbookPath, UPCOMING_TABLE)
      ]);
      state.favoriteBands = payloads[0].map(parseFavoriteBand).filter(Boolean).sort(function (a, b) {
        return a.bandName.localeCompare(b.bandName);
      });
      state.attendedConcerts = payloads[1].map(parseAttendedConcert).filter(Boolean);
      state.upcomingConcerts = payloads[2].map(parseUpcomingConcert).filter(Boolean);
      if (!getBandByKey(state.activeBandKey)) {
        state.activeBandKey = state.favoriteBands[0] ? state.favoriteBands[0].id : '';
      }
      setStatus('Concerts synced from ' + WORKBOOK_NAME + '. Favorite bands, attended concerts, and upcoming shows are ready.', 'success');
      renderAll();
      maybeHydrateUpcomingDistances();
      if (resolveActiveBand()) loadDiscoveryForBand(resolveActiveBand(), false);
    } catch (error) {
      console.error('❌ Concerts feature failed to load:', error);
      state.favoriteBands = [];
      state.attendedConcerts = [];
      state.upcomingConcerts = [];
      setStatus(error && error.message ? error.message : 'Concerts data could not be loaded.', 'error');
      renderAll();
    } finally {
      state.loading = false;
    }
  }

  function buildSearchPrefill(bandName, genreText, referenceUrl, sourceLabel) {
    var cleanName = String(bandName || '').trim();
    var encodedBand = encodeURIComponent(cleanName);
    return {
      bandName: cleanName,
      associatedGenres: String(genreText || '').trim(),
      websiteUrl: '',
      tourPageUrl: referenceUrl || ('https://www.bandsintown.com/search?q=' + encodedBand),
      facebookUrl: '',
      instagramUrl: '',
      youTubeUrl: 'https://www.youtube.com/results?search_query=' + encodedBand,
      setlistUrl: 'https://www.setlist.fm/search?query=' + encodedBand,
      bandsintownUrl: 'https://www.bandsintown.com/search?q=' + encodedBand,
      wikipediaUrl: 'https://en.wikipedia.org/w/index.php?search=' + encodedBand,
      sourceLabel: sourceLabel || 'Search result'
    };
  }

  async function searchBands(query) {
    var trimmed = String(query || '').trim();
    if (!trimmed) {
      state.searchResults = [];
      state.pendingSearchQuery = '';
      renderSearchResults();
      return;
    }
    state.searchBusy = true;
    state.pendingSearchQuery = trimmed;
    renderSearchResults();
    try {
      var url = 'https://itunes.apple.com/search?entity=musicArtist&limit=10&term=' + encodeURIComponent(trimmed);
      var response = await fetch(url);
      if (!response.ok) {
        setStatus('Artist search failed (' + response.status + ').', 'error');
        state.searchResults = [];
        return;
      }
      var payload = await response.json().catch(function () { return {}; });
      var results = Array.isArray(payload.results) ? payload.results : [];
      state.searchResults = uniqueStrings(results.map(function (item) {
        return String(item.artistName || '').trim();
      })).map(function (bandName) {
        var match = results.find(function (entry) {
          return String(entry.artistName || '').trim() === bandName;
        }) || {};
        var prefill = buildSearchPrefill(match.artistName || bandName, match.primaryGenreName || '', match.artistLinkUrl || '', 'Matched from Apple Music artist search');
        return {
          id: normalizeKey(bandName) || ('search-' + Math.random().toString(36).slice(2, 7)),
          bandName: prefill.bandName,
          genreText: prefill.associatedGenres,
          referenceUrl: match.artistLinkUrl || '',
          sourceLabel: prefill.sourceLabel,
          prefill: prefill
        };
      });
      setStatus(state.searchResults.length ? 'Found ' + state.searchResults.length + ' candidate artists for “' + trimmed + '”.' : 'No artist matches found for “' + trimmed + '”. Try a different spelling or add the band manually.', state.searchResults.length ? 'success' : 'warning');
    } catch (error) {
      console.error('❌ Concert artist search failed:', error);
      state.searchResults = [];
      setStatus(error && error.message ? error.message : 'Artist search failed.', 'error');
    } finally {
      state.searchBusy = false;
      renderSearchResults();
    }
  }

  async function loadDiscoveryForBand(band, forceRefresh) {
    if (!band) return;
    var cacheKey = normalizeKey(band.bandName);
    if (!forceRefresh && Array.isArray(state.discoveryCache[cacheKey]) && state.discoveryCache[cacheKey].length) {
      renderDiscovery();
      return;
    }
    state.discoveryBusyKey = cacheKey;
    renderDiscovery();
    try {
      var queries = uniqueStrings((band.genres || []).slice(0, 2).concat(band.bandName));
      var allResults = [];
      for (var i = 0; i < queries.length; i += 1) {
        var response = await fetch('https://itunes.apple.com/search?entity=musicArtist&limit=8&term=' + encodeURIComponent(queries[i]));
        if (!response.ok) continue;
        var payload = await response.json().catch(function () { return {}; });
        var results = Array.isArray(payload.results) ? payload.results : [];
        results.forEach(function (item) {
          var bandName = String(item.artistName || '').trim();
          if (!bandName) return;
          allResults.push({
            id: normalizeKey(bandName) || ('discovery-' + Math.random().toString(36).slice(2, 7)),
            bandName: bandName,
            genreText: String(item.primaryGenreName || '').trim(),
            referenceUrl: String(item.artistLinkUrl || '').trim(),
            reason: normalizeText(item.primaryGenreName) && (band.genres || []).some(function (genre) {
              return normalizeText(genre) === normalizeText(item.primaryGenreName);
            })
              ? 'Shared genre with ' + band.bandName
              : 'Related to your interest in ' + band.bandName,
            prefill: buildSearchPrefill(bandName, item.primaryGenreName || '', item.artistLinkUrl || '', 'Recommended from discovery search')
          });
        });
      }
      var favoriteNames = new Set(state.favoriteBands.map(function (item) { return normalizeText(item.bandName); }));
      state.discoveryCache[cacheKey] = allResults.filter(function (item, index, arr) {
        if (!item.bandName) return false;
        if (favoriteNames.has(normalizeText(item.bandName))) return false;
        return arr.findIndex(function (other) { return normalizeText(other.bandName) === normalizeText(item.bandName); }) === index;
      }).slice(0, 8);
      writeJsonStorage(DISCOVERY_STORAGE_KEY, state.discoveryCache);
    } catch (error) {
      console.error('❌ Concert discovery refresh failed:', error);
      setStatus('Discovery suggestions could not be refreshed right now, but your saved concert data is still available.', 'warning');
    } finally {
      state.discoveryBusyKey = '';
      renderDiscovery();
    }
  }

  function haversineMiles(aLat, aLng, bLat, bLng) {
    var toRad = function (value) { return value * Math.PI / 180; };
    var earthMiles = 3958.8;
    var dLat = toRad(bLat - aLat);
    var dLng = toRad(bLng - aLng);
    var lat1 = toRad(aLat);
    var lat2 = toRad(bLat);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
      + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthMiles * c;
  }

  async function geocodePlace(query) {
    var key = normalizeKey(query);
    if (!key) return null;
    if (state.geocodeCache[key]) return state.geocodeCache[key];
    var url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=' + encodeURIComponent(query);
    var response = await fetch(url, {
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error('Geocoding failed (' + response.status + ').');
    var payload = await response.json().catch(function () { return []; });
    var hit = Array.isArray(payload) && payload[0] ? payload[0] : null;
    if (!hit || !Number.isFinite(Number(hit.lat)) || !Number.isFinite(Number(hit.lon))) return null;
    state.geocodeCache[key] = { latitude: Number(hit.lat), longitude: Number(hit.lon) };
    writeJsonStorage(GEOCODE_STORAGE_KEY, state.geocodeCache);
    return state.geocodeCache[key];
  }

  async function maybeHydrateUpcomingDistances() {
    if (!state.location || state.geocodeBusy || !state.upcomingConcerts.length) {
      renderUpcomingConcerts();
      renderSummary();
      return;
    }
    state.geocodeBusy = true;
    renderUpcomingConcerts();
    try {
      for (var i = 0; i < state.upcomingConcerts.length; i += 1) {
        var concert = state.upcomingConcerts[i];
        if (Number.isFinite(concert.distanceMiles)) continue;
        var query = [concert.venue, concert.city, concert.state].filter(Boolean).join(', ') || [concert.city, concert.state].filter(Boolean).join(', ');
        if (!query) continue;
        var hit = await geocodePlace(query);
        if (!hit) continue;
        concert.distanceMiles = haversineMiles(state.location.latitude, state.location.longitude, hit.latitude, hit.longitude);
      }
    } catch (error) {
      console.error('❌ Upcoming concert geocoding failed:', error);
      setStatus('Could not update all concert distances right now. You can still browse the full upcoming list.', 'warning');
    } finally {
      state.geocodeBusy = false;
      renderUpcomingConcerts();
      renderSummary();
    }
  }

  async function captureUserLocation() {
    if (!navigator.geolocation) {
      setStatus('Geolocation is not available in this browser.', 'error');
      return;
    }
    setStatus('Requesting your location for nearby concert filtering…', 'info');
    await new Promise(function (resolve) {
      navigator.geolocation.getCurrentPosition(function (position) {
        state.location = {
          latitude: Number(position.coords.latitude),
          longitude: Number(position.coords.longitude)
        };
        if (typeof global.persistUserLocation === 'function') {
          global.persistUserLocation(state.location.latitude, state.location.longitude);
        } else {
          writeJsonStorage(LOCATION_STORAGE_KEY, {
            latitude: state.location.latitude,
            longitude: state.location.longitude,
            timestamp: Date.now()
          });
        }
        setStatus('Location saved. Upcoming concerts are now being filtered by distance.', 'success');
        renderUpcomingConcerts();
        renderSummary();
        maybeHydrateUpcomingDistances();
        resolve();
      }, function (error) {
        setStatus(error && error.message ? error.message : 'Location access was declined.', 'warning');
        resolve();
      }, {
        enableHighAccuracy: false,
        timeout: 12000,
        maximumAge: 300000
      });
    });
  }

  function findSearchResultById(id) {
    return state.searchResults.find(function (item) { return item.id === id; }) || null;
  }

  function findDiscoveryById(id) {
    var activeBand = resolveActiveBand();
    if (!activeBand) return null;
    var list = state.discoveryCache[normalizeKey(activeBand.bandName)] || [];
    return list.find(function (item) { return item.id === id; }) || null;
  }

  function openModal(innerHtml) {
    var host = getModalHost();
    if (!host) return;
    host.innerHTML = '<div class="household-concerts-modal-backdrop" data-concert-action="close-modal"><div class="household-concerts-modal" role="dialog" aria-modal="true">' + innerHtml + '</div></div>';
  }

  function closeModal() {
    var host = getModalHost();
    if (!host) return;
    host.innerHTML = '';
    state.attendedUploadFiles = [];
    state.attendedUploadedPhotoUrls = [];
    state.attendedUploadBusy = false;
    state.attendedUploadStatus = { tone: 'info', message: '' };
  }

  function setAttendedUploadStatus(message, tone) {
    state.attendedUploadStatus = {
      tone: tone || 'info',
      message: String(message || '').trim()
    };
    var statusEl = document.getElementById('householdConcertsAttendedUploadStatus');
    if (!statusEl) return;
    statusEl.className = 'household-concerts-upload-status household-concerts-upload-status--' + (state.attendedUploadStatus.tone || 'info');
    statusEl.textContent = state.attendedUploadStatus.message;
  }

  function resolveAttendedUploadMeta(form) {
    var safeForm = form && typeof form.querySelector === 'function' ? form : null;
    return {
      bandName: safeForm ? String((safeForm.querySelector('[name="Band_Name"]') || {}).value || '').trim() : '',
      concertDate: safeForm ? String((safeForm.querySelector('[name="Concert_Date"]') || {}).value || '').trim() : ''
    };
  }

   async function uploadAttendedPhotoFromForm(form) {
     if (!form) return [];
     if (state.attendedUploadBusy) return state.attendedUploadedPhotoUrls.slice();
     if (!state.attendedUploadFiles.length) {
       setAttendedUploadStatus('Choose a photo file first.', 'warning');
       return state.attendedUploadedPhotoUrls.slice();
     }

     var selectedFiles = state.attendedUploadFiles.slice();
     state.attendedUploadBusy = true;
     setAttendedUploadStatus('Uploading ' + selectedFiles.length + ' photo' + (selectedFiles.length === 1 ? '' : 's') + ' to OneDrive...', 'info');
     try {
       var uploadedUrls = [];
       for (var i = 0; i < selectedFiles.length; i += 1) {
         var uploaded = await uploadConcertPhotoToOneDrive(selectedFiles[i], resolveAttendedUploadMeta(form));
         uploadedUrls.push(uploaded.url);
       }
       state.attendedUploadedPhotoUrls = mergePhotoUrlLists(state.attendedUploadedPhotoUrls, uploadedUrls);
       var photoInput = form.querySelector('[name="Photo_URL"]');
       if (photoInput) {
         var manualUrls = parsePhotoUrlsField(photoInput.value || '');
         var merged = mergePhotoUrlLists(manualUrls, state.attendedUploadedPhotoUrls);
         state.attendedUploadedPhotoUrls = merged.slice();
         photoInput.value = serializePhotoUrlsForStorage(merged);
       }
       var fileInput = form.querySelector('#householdConcertsPhotoFileInput');
       if (fileInput) fileInput.value = '';
       state.attendedUploadFiles = [];
       syncPhotoPreview();
       setAttendedUploadStatus(uploadedUrls.length + ' photo' + (uploadedUrls.length === 1 ? '' : 's') + ' uploaded to OneDrive and linked to this concert log.', 'success');
       return state.attendedUploadedPhotoUrls.slice();
     } catch (error) {
       console.error('❌ Concert photo upload failed:', error);
       setAttendedUploadStatus(error && error.message ? error.message : 'Photo upload failed.', 'error');
       throw error;
     } finally {
       state.attendedUploadBusy = false;
     }
   }

  function renderRatingStars(selectedValue) {
    var rating = Math.max(0, Math.min(5, Number(selectedValue) || 0));
    var html = [];
    for (var value = 1; value <= 5; value += 1) {
      html.push('<button type="button" class="household-concerts-star' + (value <= rating ? ' is-active' : '') + '" data-concert-action="set-rating" data-rating-value="' + value + '" aria-label="' + value + ' star' + (value === 1 ? '' : 's') + '">★</button>');
    }
    return html.join('');
  }

  function openBandForm(prefill) {
    var data = Object.assign({
      bandName: '',
      bandMembers: '',
      bandLogoUrl: '',
      bandCoverPhotoUrl: '',
      origin: '',
      founded: '',
      recordLabel: '',
      discography: '',
      topSongs: '',
      associatedGenres: '',
      websiteUrl: '',
      tourPageUrl: '',
      facebookUrl: '',
      instagramUrl: '',
      youTubeUrl: '',
      setlistUrl: '',
      bandsintownUrl: '',
      wikipediaUrl: '',
      sourceLabel: ''
    }, prefill || {});
    openModal(
      '<div class="household-concerts-modal-head"><div><h3>Add Favorite Band</h3><p>' + escapeHtml(data.sourceLabel || 'Use search results or fill this out manually. Any fields you leave blank can be enriched later.') + '</p></div><button type="button" class="household-concerts-icon-btn" data-concert-action="close-modal">✕</button></div>'
      + '<form id="householdConcertsBandForm" class="household-concerts-form">'
      + formRow('Band Name', '<input name="Band_Name" required value="' + escapeHtml(data.bandName) + '" placeholder="Enter band name">')
      + formRow('Origin', '<input name="Origin" value="' + escapeHtml(data.origin) + '" placeholder="e.g. Sydney, Australia">')
      + formRow('Founded', '<input name="Founded" value="' + escapeHtml(data.founded) + '" placeholder="Year or exact date">')
      + formRow('Genres', '<input name="Associated_Genres" value="' + escapeHtml(data.associatedGenres) + '" placeholder="Separate genres with commas">')
      + formRow('Record Label', '<input name="Record_Label" value="' + escapeHtml(data.recordLabel) + '" placeholder="Current or most notable label">')
      + formRow('Band Members + Roles', '<textarea name="Band_Members" rows="4" placeholder="Lead Vocals — Jane Doe\nLead Guitar — John Doe">' + escapeHtml(data.bandMembers) + '</textarea>')
      + formRow('Discography', '<textarea name="Discography" rows="3" placeholder="Albums, EPs, or eras">' + escapeHtml(data.discography) + '</textarea>')
      + formRow('Top Songs', '<textarea name="Top_Songs" rows="3" placeholder="Top tracks, separated by commas">' + escapeHtml(data.topSongs) + '</textarea>')
      + formRow('Band Logo URL', '<input name="Band_Logo_URL" value="' + escapeHtml(data.bandLogoUrl) + '" placeholder="https://…">')
      + formRow('Band Cover Image URL', '<input name="Band_Cover_Photo_URL" value="' + escapeHtml(data.bandCoverPhotoUrl) + '" placeholder="https://…">')
      + formRow('Website URL', '<input name="Website_URL" value="' + escapeHtml(data.websiteUrl) + '" placeholder="https://…">')
      + formRow('Tour Page URL', '<input name="Tour_Page_URL" value="' + escapeHtml(data.tourPageUrl) + '" placeholder="https://…">')
      + formRow('Facebook URL', '<input name="Facebook_URL" value="' + escapeHtml(data.facebookUrl) + '" placeholder="https://…">')
      + formRow('Instagram URL', '<input name="Instagram_URL" value="' + escapeHtml(data.instagramUrl) + '" placeholder="https://…">')
      + formRow('YouTube URL', '<input name="YouTube_URL" value="' + escapeHtml(data.youTubeUrl) + '" placeholder="https://…">')
      + formRow('Setlist.fm URL', '<input name="Setlist.fm_URL" value="' + escapeHtml(data.setlistUrl) + '" placeholder="https://…">')
      + formRow('Bandsintown URL', '<input name="Bandsintown_URL" value="' + escapeHtml(data.bandsintownUrl) + '" placeholder="https://…">')
      + formRow('Wikipedia URL', '<input name="Wikipedia_URL" value="' + escapeHtml(data.wikipediaUrl) + '" placeholder="https://…">')
      + '<div class="household-concerts-form-actions"><button type="button" class="pill-button" data-concert-action="close-modal">Cancel</button><button type="submit" class="pill-button pill-button-primary">Save Favorite Band</button></div>'
      + '</form>'
    );
  }

   function renderManagedPhotosPreview() {
     var urls = state.attendedUploadedPhotoUrls;
     if (!urls.length) {
       return '<div class="household-concerts-manage-photos-empty">No photos uploaded yet. Upload or paste URLs above.</div>';
     }
     return '<div class="household-concerts-manage-photos-grid">'
       + urls.map(function (url, index) {
         return '<div class="household-concerts-photo-item" data-photo-index="' + index + '">'
           + '<div class="household-concerts-photo-thumbnail" style="background-image:url(\'' + escapeHtml(safeUrl(url)) + '\')"></div>'
           + '<div class="household-concerts-photo-item-controls">'
           + (index > 0 ? '<button type="button" class="household-concerts-photo-btn" data-concert-action="move-photo-up" data-photo-index="' + index + '" title="Move up">↑</button>' : '<div style="width:28px;height:28px;"></div>')
           + (index < urls.length - 1 ? '<button type="button" class="household-concerts-photo-btn" data-concert-action="move-photo-down" data-photo-index="' + index + '" title="Move down">↓</button>' : '<div style="width:28px;height:28px;"></div>')
           + '<button type="button" class="household-concerts-photo-btn household-concerts-photo-btn--remove" data-concert-action="remove-photo" data-photo-index="' + index + '" title="Remove">✕</button>'
           + '</div>'
           + '</div>';
       }).join('')
       + '</div>';
   }

   function syncPhotoPreview() {
     var previewEl = document.getElementById('householdConcertsPhotoPreview');
     if (previewEl) {
       previewEl.innerHTML = renderManagedPhotosPreview();
     }
   }

   function openAttendedConcertForm(band) {
     state.attendedUploadFiles = [];
     state.attendedUploadedPhotoUrls = [];
     state.attendedUploadBusy = false;
     state.attendedUploadStatus = {
       tone: 'info',
       message: 'Optional: upload a concert photo directly to OneDrive, or paste a URL manually.'
     };
     var bandName = band && band.bandName ? band.bandName : '';
     var bandOptions = state.favoriteBands.map(function (item) {
       var selected = normalizeText(item.bandName) === normalizeText(bandName) ? ' selected' : '';
       return '<option value="' + escapeHtml(item.bandName) + '"' + selected + '>' + escapeHtml(item.bandName) + '</option>';
     }).join('');
     openModal(
       '<div class="household-concerts-modal-head"><div><h3>Log Attended Concert</h3><p>Track the band, date, venue, star rating, photos, notes, and setlist links for a show you have seen.</p></div><button type="button" class="household-concerts-icon-btn" data-concert-action="close-modal">✕</button></div>'
       + '<form id="householdConcertsAttendedForm" class="household-concerts-form">'
       + formRow('Band', '<select name="Band_Name" required><option value="">Choose a favorite band</option>' + bandOptions + '</select>')
       + formRow('Concert Date', '<input type="date" name="Concert_Date" required>')
       + formRow('Venue', '<input name="Venue" required placeholder="Venue name">')
       + '<div class="household-concerts-form-row"><label>Rating</label><div class="household-concerts-star-row">' + renderRatingStars(0) + '</div><input type="hidden" name="Rating" value="0"></div>'
       + '<div class="household-concerts-form-row household-concerts-upload-row"><label>Upload Photos to OneDrive</label><div class="household-concerts-upload-inline"><input id="householdConcertsPhotoFileInput" type="file" accept="image/*" multiple><button type="button" class="pill-button" data-concert-action="upload-attended-photo">Upload Selected</button></div><div id="householdConcertsAttendedUploadStatus" class="household-concerts-upload-status household-concerts-upload-status--info">' + escapeHtml(state.attendedUploadStatus.message) + '</div></div>'
       + formRow('Photo URL(s)', '<textarea name="Photo_URL" rows="2" placeholder="Single URL, multiple URLs separated by new lines/commas, or JSON array."></textarea>')
       + '<div class="household-concerts-form-row"><label>Manage Photos</label><div id="householdConcertsPhotoPreview" class="household-concerts-manage-photos-container">' + renderManagedPhotosPreview() + '</div></div>'
       + formRow('Video URL', '<input name="Video_URL" placeholder="https://…">')
       + formRow('Setlist URL', '<input name="Setlist_URL" placeholder="https://…">')
       + formRow('Notes', '<textarea name="Notes" rows="4" placeholder="Favorite moments, opening acts, sound quality, crowd, etc."></textarea>')
       + '<div class="household-concerts-form-actions"><button type="button" class="pill-button" data-concert-action="close-modal">Cancel</button><button type="submit" class="pill-button pill-button-primary">Save Concert Log</button></div>'
       + '</form>'
     );
   }

  function openUpcomingConcertForm(band) {
    var bandName = band && band.bandName ? band.bandName : '';
    var bandOptions = state.favoriteBands.map(function (item) {
      var selected = normalizeText(item.bandName) === normalizeText(bandName) ? ' selected' : '';
      return '<option value="' + escapeHtml(item.bandName) + '"' + selected + '>' + escapeHtml(item.bandName) + '</option>';
    }).join('');
    openModal(
      '<div class="household-concerts-modal-head"><div><h3>Add Upcoming Concert</h3><p>Store future shows, then use your location and distance slider to keep nearby opportunities front and center.</p></div><button type="button" class="household-concerts-icon-btn" data-concert-action="close-modal">✕</button></div>'
      + '<form id="householdConcertsUpcomingForm" class="household-concerts-form">'
      + formRow('Band', '<select name="Band_Name" required><option value="">Choose a favorite band</option>' + bandOptions + '</select>')
      + formRow('Concert Date', '<input type="date" name="Concert_Date" required>')
      + formRow('Venue', '<input name="Venue" required placeholder="Venue name">')
      + formRow('City', '<input name="City" required placeholder="City">')
      + formRow('State', '<input name="State" required placeholder="State / Region">')
      + '<div class="household-concerts-form-actions"><button type="button" class="pill-button" data-concert-action="close-modal">Cancel</button><button type="submit" class="pill-button pill-button-primary">Save Upcoming Concert</button></div>'
      + '</form>'
    );
  }

  function openBandDetails(band) {
    if (!band) return;
    var stats = computeBandStats(band.id);
    var similar = computeSimilarBands(band);
    var recommendations = Array.isArray(state.discoveryCache[normalizeKey(band.bandName)]) ? state.discoveryCache[normalizeKey(band.bandName)] : [];
    openModal(
      '<div class="household-concerts-modal-head"><div><h3>' + escapeHtml(band.bandName) + '</h3><p>' + escapeHtml(band.origin || 'Origin not set') + ' • ' + escapeHtml(band.founded || 'Founded date not set') + '</p></div><button type="button" class="household-concerts-icon-btn" data-concert-action="close-modal">✕</button></div>'
      + '<div class="household-concerts-band-profile">'
      + (band.bandCoverPhotoUrl ? '<img class="household-concerts-band-profile-cover" src="' + escapeHtml(safeUrl(band.bandCoverPhotoUrl)) + '" alt="' + escapeHtml(band.bandName) + ' cover image">' : '')
      + '<div class="household-concerts-band-profile-head">'
      + (band.bandLogoUrl ? '<img class="household-concerts-band-profile-logo" src="' + escapeHtml(safeUrl(band.bandLogoUrl)) + '" alt="' + escapeHtml(band.bandName) + ' logo">' : '<div class="household-concerts-band-profile-logo household-concerts-band-logo--placeholder">🎵</div>')
      + '<div>'
      + '<div class="household-concerts-band-stats">' + statPill('Seen', String(stats.attendedCount)) + statPill('Upcoming', String(stats.upcomingCount)) + statPill('Average', stats.averageRating ? stats.averageRating.toFixed(1) + '★' : '—') + '</div>'
      + (band.genres.length ? '<div class="household-concerts-tag-row">' + band.genres.map(renderTag).join('') + '</div>' : '')
      + '</div>'
      + '</div>'
      + '<div class="household-concerts-band-profile-grid">'
      + detailLine('Record Label', band.recordLabel || 'Not set')
      + detailLine('Discography', band.releases.length ? band.releases.join(', ') : band.discography || 'Add albums or eras')
      + detailLine('Top Songs', band.songs.length ? band.songs.join(', ') : band.topSongs || 'Add notable tracks')
      + detailLine('Band Members', band.members.length ? band.members.join(' • ') : band.bandMembers || 'Add members and roles')
      + '</div>'
      + renderBandLinks(band, false)
      + '<div class="household-concerts-band-profile-columns">'
      + '<div><h4>Similar favorite bands</h4>' + (similar.length ? '<ul>' + similar.map(function (entry) { return '<li>' + escapeHtml(entry.band.bandName) + ' — ' + escapeHtml((entry.band.genres || []).slice(0, 3).join(', ') || entry.band.origin || 'Shared style') + '</li>'; }).join('') + '</ul>' : '<p class="household-concerts-muted">No close matches among current favorites yet.</p>') + '</div>'
      + '<div><h4>Recommended bands to add</h4>' + (recommendations.length ? '<ul>' + recommendations.map(function (entry) { return '<li>' + escapeHtml(entry.bandName) + ' — ' + escapeHtml(entry.reason || entry.genreText || 'Related recommendation') + '</li>'; }).join('') + '</ul>' : '<p class="household-concerts-muted">Refresh discovery to pull additional artist suggestions.</p>') + '</div>'
      + '</div>'
      + '<div class="household-concerts-form-actions"><button type="button" class="pill-button" data-concert-action="open-log-concert" data-band-key="' + escapeHtml(band.id) + '">Log Concert</button><button type="button" class="pill-button" data-concert-action="open-add-upcoming" data-band-key="' + escapeHtml(band.id) + '">Add Upcoming</button><button type="button" class="pill-button" data-concert-action="refresh-discovery" data-band-key="' + escapeHtml(band.id) + '">Refresh Discovery</button></div>'
      + '</div>'
    );
  }

  function formRow(label, controlHtml) {
    return '<div class="household-concerts-form-row"><label>' + escapeHtml(label) + '</label>' + controlHtml + '</div>';
  }

  function serializeForm(form) {
    var data = {};
    Array.from(new FormData(form).entries()).forEach(function (entry) {
      data[entry[0]] = String(entry[1] || '').trim();
    });
    return data;
  }

  async function saveFavoriteBand(form) {
    var record = serializeForm(form);
    var bandName = String(record.Band_Name || '').trim();
    if (!bandName) {
      setStatus('Band name is required.', 'warning');
      return;
    }
    if (state.favoriteBands.some(function (band) { return normalizeText(band.bandName) === normalizeText(bandName); })) {
      setStatus('That band is already in your favorite list.', 'warning');
      closeModal();
      return;
    }
    try {
      var workbookPath = await findWorkbookPath();
      await appendRecordToTable(workbookPath, FAVORITE_TABLE, record);
      state.favoriteBands.unshift(parseFavoriteBand(record));
      state.favoriteBands = state.favoriteBands.filter(Boolean).sort(function (a, b) { return a.bandName.localeCompare(b.bandName); });
      state.activeBandKey = normalizeKey(bandName);
      closeModal();
      setStatus('Added ' + bandName + ' to Favorite Bands.', 'success');
      renderAll();
      loadDiscoveryForBand(resolveActiveBand(), true);
    } catch (error) {
      console.error('❌ Could not save favorite band:', error);
      setStatus(error && error.message ? error.message : 'Could not save favorite band.', 'error');
    }
  }

  async function saveAttendedConcert(form) {
    if (state.attendedUploadBusy) {
      setStatus('Please wait for the photo upload to finish before saving this concert.', 'warning');
      return;
    }
    var record = serializeForm(form);
    record.Concert_Date = toIsoDate(record.Concert_Date);
    record.Rating = String(Math.max(0, Math.min(5, Number(record.Rating) || 0)));
    record.Notes = String(record.Notes || '').trim();
    if (!record.Band_Name || !record.Concert_Date || !record.Venue) {
      setStatus('Band, concert date, and venue are required to log a concert.', 'warning');
      return;
    }
    var manualPhotoUrls = parsePhotoUrlsField(record.Photo_URL);
    var combinedPhotoUrls = mergePhotoUrlLists(manualPhotoUrls, state.attendedUploadedPhotoUrls);
    if (!combinedPhotoUrls.length && state.attendedUploadFiles.length) {
      try {
        combinedPhotoUrls = mergePhotoUrlLists(combinedPhotoUrls, await uploadAttendedPhotoFromForm(form));
      } catch (_error) {
        setStatus('Could not upload concert photo. Fix the upload issue or remove the file and try saving again.', 'warning');
        return;
      }
    }
    record.Photo_URL = serializePhotoUrlsForStorage(combinedPhotoUrls);
    try {
      var workbookPath = await findWorkbookPath();
      await appendRecordToTable(workbookPath, ATTENDED_TABLE, record);
      if (record.Notes) {
        state.localNotes[concertNoteKey(record.Band_Name, record.Concert_Date, record.Venue)] = record.Notes;
        writeJsonStorage(NOTES_STORAGE_KEY, state.localNotes);
      }
      state.attendedConcerts.unshift(parseAttendedConcert(record));
      closeModal();
      setStatus('Concert log saved for ' + record.Band_Name + '.', 'success');
      renderAll();
    } catch (error) {
      console.error('❌ Could not save attended concert:', error);
      setStatus(error && error.message ? error.message : 'Could not save attended concert.', 'error');
    }
  }

  async function saveUpcomingConcert(form) {
    var record = serializeForm(form);
    record.Concert_Date = toIsoDate(record.Concert_Date);
    record.Day_of_Week = formatDayOfWeek(record.Concert_Date);
    if (!record.Band_Name || !record.Concert_Date || !record.Venue || !record.City || !record.State) {
      setStatus('Band, date, venue, city, and state are required for an upcoming concert.', 'warning');
      return;
    }
    try {
      var workbookPath = await findWorkbookPath();
      await appendRecordToTable(workbookPath, UPCOMING_TABLE, record);
      state.upcomingConcerts.push(parseUpcomingConcert(record));
      closeModal();
      setStatus('Upcoming concert saved for ' + record.Band_Name + '.', 'success');
      renderAll();
      maybeHydrateUpcomingDistances();
    } catch (error) {
      console.error('❌ Could not save upcoming concert:', error);
      setStatus(error && error.message ? error.message : 'Could not save upcoming concert.', 'error');
    }
  }

  function bindEvents(root) {
    if (!root || root.dataset.householdConcertsBound === '1') return;
    root.dataset.householdConcertsBound = '1';

    root.addEventListener('click', function (event) {
      var target = event.target && event.target.closest ? event.target.closest('[data-concert-action]') : null;
      if (!target) return;
      var action = String(target.getAttribute('data-concert-action') || '').trim();
      if (!action) return;
      if (action === 'close-modal' && event.target === target) {
        closeModal();
        return;
      }
      if (action === 'close-modal' || target.classList.contains('household-concerts-icon-btn')) {
        closeModal();
        return;
      }
      switch (action) {
        case 'refresh-data':
          refreshData();
          break;
        case 'search-web':
          searchBands(($('householdConcertsSearchInput') || {}).value || '');
          break;
        case 'open-add-band': {
          var searchId = String(target.getAttribute('data-search-result-id') || '').trim();
          var discoveryId = String(target.getAttribute('data-discovery-id') || '').trim();
          var result = searchId ? findSearchResultById(searchId) : (discoveryId ? findDiscoveryById(discoveryId) : null);
          openBandForm(result && result.prefill ? result.prefill : null);
          break;
        }
        case 'open-log-concert':
          openAttendedConcertForm(getBandByKey(target.getAttribute('data-band-key')) || resolveActiveBand());
          break;
        case 'open-add-upcoming':
          openUpcomingConcertForm(getBandByKey(target.getAttribute('data-band-key')) || resolveActiveBand());
          break;
        case 'select-band':
          state.activeBandKey = normalizeKey(target.getAttribute('data-band-key'));
          renderAll();
          loadDiscoveryForBand(resolveActiveBand(), false);
          break;
        case 'open-band-details':
          openBandDetails(getBandByKey(target.getAttribute('data-band-key')));
          break;
        case 'set-genre-filter':
          state.genreFilter = String(target.getAttribute('data-genre') || '').trim();
          renderAll();
          break;
        case 'refresh-discovery':
          loadDiscoveryForBand(getBandByKey(target.getAttribute('data-band-key')) || resolveActiveBand(), true);
          break;
        case 'use-location':
          captureUserLocation();
          break;
        case 'set-rating': {
          var form = target.closest('form');
          if (!form) break;
          var ratingInput = form.querySelector('input[name="Rating"]');
          if (!ratingInput) break;
          ratingInput.value = String(target.getAttribute('data-rating-value') || '0');
          var starRow = target.parentElement;
          if (starRow) starRow.innerHTML = renderRatingStars(ratingInput.value);
          break;
        }
        case 'upload-attended-photo': {
           var uploadForm = target.closest('form');
           if (!uploadForm) break;
           uploadAttendedPhotoFromForm(uploadForm).catch(function () {
             // Status UI is already set in upload helper.
           });
           break;
         }
         case 'remove-photo': {
           var photoIndex = Number(target.getAttribute('data-photo-index') || -1);
           if (photoIndex >= 0 && photoIndex < state.attendedUploadedPhotoUrls.length) {
             state.attendedUploadedPhotoUrls.splice(photoIndex, 1);
             syncPhotoPreview();
             var photoInput = target.closest('form') ? target.closest('form').querySelector('input[name="Photo_URL"]') : null;
             if (photoInput) {
               photoInput.value = serializePhotoUrlsForStorage(state.attendedUploadedPhotoUrls);
             }
           }
           break;
         }
         case 'move-photo-up': {
           var idx = Number(target.getAttribute('data-photo-index') || -1);
           if (idx > 0 && idx < state.attendedUploadedPhotoUrls.length) {
             var temp = state.attendedUploadedPhotoUrls[idx];
             state.attendedUploadedPhotoUrls[idx] = state.attendedUploadedPhotoUrls[idx - 1];
             state.attendedUploadedPhotoUrls[idx - 1] = temp;
             syncPhotoPreview();
             var photoInput = target.closest('form') ? target.closest('form').querySelector('input[name="Photo_URL"]') : null;
             if (photoInput) {
               photoInput.value = serializePhotoUrlsForStorage(state.attendedUploadedPhotoUrls);
             }
           }
           break;
         }
         case 'move-photo-down': {
           var idx = Number(target.getAttribute('data-photo-index') || -1);
           if (idx >= 0 && idx < state.attendedUploadedPhotoUrls.length - 1) {
             var temp = state.attendedUploadedPhotoUrls[idx];
             state.attendedUploadedPhotoUrls[idx] = state.attendedUploadedPhotoUrls[idx + 1];
             state.attendedUploadedPhotoUrls[idx + 1] = temp;
             syncPhotoPreview();
             var photoInput = target.closest('form') ? target.closest('form').querySelector('input[name="Photo_URL"]') : null;
             if (photoInput) {
               photoInput.value = serializePhotoUrlsForStorage(state.attendedUploadedPhotoUrls);
             }
           }
           break;
         }
      }
    });

     root.addEventListener('input', function (event) {
       var target = event.target;
       if (!target) return;
       if (target.id === 'householdConcertsFilterInput') {
         state.bandFilter = String(target.value || '').trim();
         renderAll();
       }
       if (target.id === 'householdConcertsDistanceSlider') {
         state.distanceIndex = Math.max(0, Math.min(DISTANCE_STOPS.length - 1, Number(target.value) || 0));
         renderUpcomingConcerts();
         renderSummary();
       }
       if (target.id === 'householdConcertsPhotoFileInput') {
         state.attendedUploadFiles = target.files ? Array.from(target.files) : [];
         if (state.attendedUploadFiles.length) {
           setAttendedUploadStatus('Ready to upload ' + state.attendedUploadFiles.length + ' photo' + (state.attendedUploadFiles.length === 1 ? '' : 's') + '.', 'info');
         } else {
           setAttendedUploadStatus('Optional: upload a concert photo directly to OneDrive, or paste a URL manually.', 'info');
         }
       }
       if (target.name === 'Photo_URL') {
         var manualUrls = parsePhotoUrlsField(target.value || '');
         state.attendedUploadedPhotoUrls = mergePhotoUrlLists(manualUrls, state.attendedUploadedPhotoUrls.filter(function (url) {
           return !manualUrls.some(function (manual) { return normalizeText(manual) === normalizeText(url); });
         }));
         syncPhotoPreview();
       }
     });

    root.addEventListener('keydown', function (event) {
      var target = event.target;
      if (target && target.id === 'householdConcertsSearchInput' && event.key === 'Enter') {
        event.preventDefault();
        searchBands(target.value || '');
      }
    });

    root.addEventListener('submit', function (event) {
      var form = event.target;
      if (!form || !form.id) return;
      event.preventDefault();
      if (form.id === 'householdConcertsBandForm') saveFavoriteBand(form);
      if (form.id === 'householdConcertsAttendedForm') saveAttendedConcert(form);
      if (form.id === 'householdConcertsUpcomingForm') saveUpcomingConcert(form);
    });
  }

  function init(root) {
    var liveRoot = root && typeof root.querySelector === 'function'
      ? root.querySelector('#' + ROOT_ID) || getRoot()
      : getRoot();
    if (!liveRoot) return;
    bindEvents(liveRoot);
    renderAll();
    if (!state.initialized) {
      state.initialized = true;
      refreshData();
    }
  }

  global.HouseholdConcerts = {
    init: init,
    refresh: refreshData,
    __state: state
  };
})(window);

