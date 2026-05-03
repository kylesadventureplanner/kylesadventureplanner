(function initHouseholdConcertsSystem(global) {
  'use strict';

  var ROOT_ID = 'householdConcertsPane';
  var MODAL_HOST_ID = 'householdConcertsModalHost';
  var STATUS_ID = 'householdConcertsStatus';
  var SUMMARY_ID = 'householdConcertsSummaryGrid';
  var GENRE_CHIPS_ID = 'householdConcertsGenreChips';
  var FAVORITES_GRID_ID = 'householdConcertsFavoritesGrid';
  var TOAST_HOST_ID = 'householdConcertsToastHost';
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
  var CONCERTS_LOCATION_MODE_STORAGE_KEY = 'householdConcertsLocationModeV1';
  var CONCERTS_SETTINGS_STORAGE_KEY = 'householdConcertsSettingsV1';
  var NOTES_STORAGE_KEY = 'householdConcertsNotesV1';
  var GEOCODE_STORAGE_KEY = 'householdConcertsGeocodeCacheV1';
  var DISCOVERY_STORAGE_KEY = 'householdConcertsDiscoveryCacheV1';
  var BAND_PROFILE_META_STORAGE_KEY = 'householdConcertsBandProfileMetaV1';
  var BAND_PROFILE_OVERRIDES_STORAGE_KEY = 'householdConcertsBandProfileOverridesV1';
  var BAND_PROFILE_LOCKS_STORAGE_KEY = 'householdConcertsBandProfileLocksV1';
  var BACKEND_WRITE_AUDIT_STORAGE_KEY = 'householdConcertsBackendWriteAuditV1';
  var DEFAULT_CONCERTS_LOCATION = {
    latitude: 35.3187,
    longitude: -82.4609,
    label: 'Hendersonville, NC USA',
    source: 'default'
  };
  var BAND_PROFILE_FIELD_LABELS = {
    bandName: 'Band Name',
    bandMembers: 'Band Members + Roles',
    bandLogoUrl: 'Band Logo URL',
    bandCoverPhotoUrl: 'Band Cover Image URL',
    origin: 'Origin',
    founded: 'Founded',
    recordLabel: 'Record Label',
    discography: 'Discography',
    topSongs: 'Top Songs',
    associatedGenres: 'Genres',
    websiteUrl: 'Website URL',
    tourPageUrl: 'Tour Page URL',
    facebookUrl: 'Facebook URL',
    instagramUrl: 'Instagram URL',
    youTubeUrl: 'YouTube URL',
    setlistUrl: 'Setlist.fm URL',
    bandsintownUrl: 'Bandsintown URL',
    wikipediaUrl: 'Wikipedia URL'
  };
  var TABLE_WRITE_COLUMN_ALIASES = {
    bandmembersroles: ['bandmembers'],
    bandmembersandroles: ['bandmembers'],
    bandmemberroles: ['bandmembers'],
    recordlabel: ['recordlabel', 'record_label'],
    bandcoverimageurl: ['bandcoverphotourl'],
    bandcoverurl: ['bandcoverphotourl']
  };
  var BAND_FORM_NAME_TO_PREFILL_KEY = {
    Band_Name: 'bandName',
    Band_Members: 'bandMembers',
    Band_Logo_URL: 'bandLogoUrl',
    Band_Cover_Photo_URL: 'bandCoverPhotoUrl',
    Origin: 'origin',
    Founded: 'founded',
    Record_Label: 'recordLabel',
    Discography: 'discography',
    Top_Songs: 'topSongs',
    Associated_Genres: 'associatedGenres',
    Website_URL: 'websiteUrl',
    Tour_Page_URL: 'tourPageUrl',
    Facebook_URL: 'facebookUrl',
    Instagram_URL: 'instagramUrl',
    YouTube_URL: 'youTubeUrl',
    'Setlist.fm_URL': 'setlistUrl',
    Bandsintown_URL: 'bandsintownUrl',
    Wikipedia_URL: 'wikipediaUrl'
  };

  function getDefaultConcertSettings() {
    return {
      homeBaseMode: 'hendersonville',
      autoFillOnOpen: true,
      enrichmentSources: {
        apple: true,
        musicbrainz: true,
        wikipedia: true,
        bandsintown: true,
        members: true
      }
    };
  }
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
     bandProfileMeta: readJsonStorage(BAND_PROFILE_META_STORAGE_KEY, {}),
      bandProfileOverrides: readJsonStorage(BAND_PROFILE_OVERRIDES_STORAGE_KEY, {}),
      bandProfileLocks: readJsonStorage(BAND_PROFILE_LOCKS_STORAGE_KEY, {}),
      fieldUndoStacks: {},
      bandImagePicker: null,
      pendingEnrichmentDiffs: null,
       pendingRecommendationAdds: {},
      recommendationToast: null,
     pendingSearchQuery: '',
     attendedUploadFiles: [],
     attendedUploadedPhotoUrls: [],
     attendedUploadBusy: false,
     attendedUploadStatus: { tone: 'info', message: '' },
     status: { tone: 'info', message: 'Concerts loads from your Excel workbook and can also search the web for artists to add.' },
     // ENHANCEMENT: New feature states
     bandTags: readJsonStorage('householdConcertsBandTagsV1', {}),
     venueStats: {},
     achievements: readJsonStorage('householdConcertsAchievementsV1', {}),
     tourSyncBusy: false,
     notificationsEnabled: readJsonStorage('householdConcertsNotifyV1', { enabled: true, frequency: 'weekly' }),
      settings: normalizeConcertSettings(readJsonStorage(CONCERTS_SETTINGS_STORAGE_KEY, {})),
     currentView: 'default'
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

  function normalizeConcertSettings(raw) {
    var defaults = getDefaultConcertSettings();
    var incoming = raw && typeof raw === 'object' ? raw : {};
    return {
      homeBaseMode: incoming.homeBaseMode === 'follow-user' ? 'follow-user' : defaults.homeBaseMode,
      autoFillOnOpen: incoming.autoFillOnOpen !== false,
      enrichmentSources: Object.assign({}, defaults.enrichmentSources, incoming.enrichmentSources || {})
    };
  }

  function confidenceRank(value) {
    var tone = confidenceTone(value);
    if (tone === 'high') return 3;
    if (tone === 'medium') return 2;
    return 1;
  }

  function bestConfidence(left, right) {
    var a = String(left || '').trim();
    var b = String(right || '').trim();
    if (!a) return b;
    if (!b) return a;
    return confidenceRank(b) > confidenceRank(a) ? b : a;
  }

  function normalizeFieldProvenanceMap(raw) {
    var input = raw && typeof raw === 'object' ? raw : {};
    var normalized = {};
    Object.keys(input).forEach(function (fieldKey) {
      if (!BAND_PROFILE_FIELD_LABELS[fieldKey]) return;
      var entry = input[fieldKey] && typeof input[fieldKey] === 'object' ? input[fieldKey] : {};
      var sources = uniqueStrings([].concat(entry.sources || []).map(function (source) { return normalizeText(source); }).filter(Boolean));
      normalized[fieldKey] = {
        confidence: String(entry.confidence || '').trim(),
        sources: sources,
        updatedAt: entry.updatedAt || Date.now()
      };
    });
    return normalized;
  }

  function mergeFieldProvenanceMaps(base, incoming) {
    var left = normalizeFieldProvenanceMap(base);
    var right = normalizeFieldProvenanceMap(incoming);
    var merged = Object.assign({}, left);
    Object.keys(right).forEach(function (fieldKey) {
      var existing = merged[fieldKey] || { confidence: '', sources: [], updatedAt: Date.now() };
      var next = right[fieldKey];
      merged[fieldKey] = {
        confidence: bestConfidence(existing.confidence, next.confidence),
        sources: uniqueStrings([].concat(existing.sources || [], next.sources || [])).filter(Boolean),
        updatedAt: next.updatedAt || existing.updatedAt || Date.now()
      };
    });
    return merged;
  }

  function buildFieldProvenanceFromPatch(patch, sourceKey, confidence) {
    var payload = patch && typeof patch === 'object' ? patch : {};
    var source = normalizeText(sourceKey || sourceKeyFromLabel(payload.sourceLabel || ''));
    var map = {};
    Object.keys(BAND_PROFILE_FIELD_LABELS).forEach(function (fieldKey) {
      var value = String(payload[fieldKey] || '').trim();
      if (!value) return;
      map[fieldKey] = {
        confidence: String(confidence || payload.enrichmentConfidence || '').trim(),
        sources: source ? [source] : [],
        updatedAt: Date.now()
      };
    });
    return map;
  }

  function sourceLabelFromKey(sourceKey) {
    var key = normalizeText(sourceKey);
    if (key === 'apple') return 'Apple Music';
    if (key === 'musicbrainz') return 'MusicBrainz';
    if (key === 'wikipedia') return 'Wikipedia';
    if (key === 'bandsintown') return 'Bandsintown';
    if (key === 'members') return 'Members/Roles';
    if (key === 'user') return 'User';
    return String(sourceKey || 'Unknown source').trim() || 'Unknown source';
  }

  function formatFieldProvenanceTooltip(entry) {
    var safeEntry = entry && typeof entry === 'object' ? entry : {};
    var updatedAt = formatDateTimeShort(safeEntry.updatedAt) || 'Unknown time';
    var firstSource = Array.isArray(safeEntry.sources) && safeEntry.sources.length ? safeEntry.sources[0] : '';
    return 'Last updated: ' + updatedAt + ' · source: ' + sourceLabelFromKey(firstSource);
  }

  function saveConcertSettings(nextSettings) {
    state.settings = normalizeConcertSettings(nextSettings || {});
    writeJsonStorage(CONCERTS_SETTINGS_STORAGE_KEY, state.settings);
  }

  function buildConcertsLocation(latitude, longitude, source, label) {
    return {
      latitude: Number(latitude),
      longitude: Number(longitude),
      source: String(source || 'saved').trim() || 'saved',
      label: String(label || '').trim() || DEFAULT_CONCERTS_LOCATION.label
    };
  }

  function isDefaultConcertsLocation(location) {
    return !!(location && location.source === 'default');
  }

  function getConcertsLocationMode() {
    var raw = String(global.localStorage.getItem(CONCERTS_LOCATION_MODE_STORAGE_KEY) || '').trim();
    return raw || 'default';
  }

  function setConcertsLocationMode(mode) {
    try {
      global.localStorage.setItem(CONCERTS_LOCATION_MODE_STORAGE_KEY, String(mode || 'default'));
    } catch (_error) {
      // Ignore storage failures.
    }
  }

  function getDefaultConcertsLocation() {
    return buildConcertsLocation(DEFAULT_CONCERTS_LOCATION.latitude, DEFAULT_CONCERTS_LOCATION.longitude, DEFAULT_CONCERTS_LOCATION.source, DEFAULT_CONCERTS_LOCATION.label);
  }

  function restoreLocation() {
    try {
      var persistedSettings = normalizeConcertSettings(readJsonStorage(CONCERTS_SETTINGS_STORAGE_KEY, {}));
      if (persistedSettings.homeBaseMode === 'hendersonville') {
        return getDefaultConcertsLocation();
      }
      if (getConcertsLocationMode() === 'default') {
        return getDefaultConcertsLocation();
      }
      if (global.userLocation && Number.isFinite(global.userLocation.latitude) && Number.isFinite(global.userLocation.longitude)) {
        return buildConcertsLocation(global.userLocation.latitude, global.userLocation.longitude, 'live', 'Live device location');
      }
      var raw = global.localStorage.getItem(LOCATION_STORAGE_KEY);
      if (!raw) return getDefaultConcertsLocation();
      var parsed = JSON.parse(raw);
      if (!parsed || !Number.isFinite(parsed.latitude) || !Number.isFinite(parsed.longitude)) {
        return getDefaultConcertsLocation();
      }
      return buildConcertsLocation(parsed.latitude, parsed.longitude, 'saved', parsed.label || 'Saved location');
    } catch (_error) {
      return getDefaultConcertsLocation();
    }
  }

  function resetConcertsLocationToDefault() {
    state.location = getDefaultConcertsLocation();
    state.settings.homeBaseMode = 'hendersonville';
    saveConcertSettings(state.settings);
    setConcertsLocationMode('default');
    state.upcomingConcerts.forEach(function (concert) {
      concert.distanceMiles = null;
    });
    setStatus('Upcoming concerts are using Hendersonville, NC USA as your home base again.', 'success');
    renderUpcomingConcerts();
    renderSummary();
    maybeHydrateUpcomingDistances();
  }

  function getRoot() {
    return document.getElementById(ROOT_ID);
  }

  function getModalHost() {
    return document.getElementById(MODAL_HOST_ID);
  }

  function getToastHost() {
    return document.getElementById(TOAST_HOST_ID);
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

  function isBackendWriteAuditEnabled() {
    try {
      if (global.__HOUSEHOLD_CONCERTS_WRITE_AUDIT === true) return true;
      return String(global.localStorage.getItem(BACKEND_WRITE_AUDIT_STORAGE_KEY) || '').trim() === '1';
    } catch (_error) {
      return global.__HOUSEHOLD_CONCERTS_WRITE_AUDIT === true;
    }
  }

  function setBackendWriteAuditEnabled(enabled) {
    var next = !!enabled;
    global.__HOUSEHOLD_CONCERTS_WRITE_AUDIT = next;
    try {
      if (next) global.localStorage.setItem(BACKEND_WRITE_AUDIT_STORAGE_KEY, '1');
      else global.localStorage.removeItem(BACKEND_WRITE_AUDIT_STORAGE_KEY);
    } catch (_error) {
      // Ignore storage errors.
    }
    return next;
  }

  function summarizeAuditValue(value) {
    var str = String(value == null ? '' : value);
    if (!str) return '<empty>';
    return str.length > 80 ? (str.slice(0, 80) + '…') : str;
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

  function formatDateTimeShort(value) {
    if (!value) return '';
    var date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function safeUrl(value) {
    var str = String(value || '').trim();
    if (!str) return '';
    if (/^https?:\/\//i.test(str)) return str;
    return 'https://' + str.replace(/^\/+/, '');
  }

  function safeTruncate(value, maxLength) {
    var str = String(value == null ? '' : value).trim();
    if (!str) return '—';
    return str.length > maxLength ? str.slice(0, maxLength) : str;
  }

  function preferFilledValue(currentValue, nextValue) {
    var current = String(currentValue == null ? '' : currentValue).trim();
    var next = String(nextValue == null ? '' : nextValue).trim();
    return current || next || '';
  }

  function preferSpecificUrl(currentValue, nextValue) {
    var current = String(currentValue == null ? '' : currentValue).trim();
    var next = String(nextValue == null ? '' : nextValue).trim();
    if (!current) return next;
    if (!next) return current;
    var currentIsSearchUrl = /wikipedia\.org\/w\/index\.php\?search=|bandsintown\.com\/search\?|setlist\.fm\/search\?|youtube\.com\/results\?search_query=/i.test(current);
    var nextIsSearchUrl = /wikipedia\.org\/w\/index\.php\?search=|bandsintown\.com\/search\?|setlist\.fm\/search\?|youtube\.com\/results\?search_query=/i.test(next);
    if (currentIsSearchUrl && !nextIsSearchUrl) return next;
    return current;
  }

  function mergeDelimitedValues() {
    var merged = [];
    for (var i = 0; i < arguments.length; i += 1) {
      merged = merged.concat(splitList(arguments[i]));
    }
    return uniqueStrings(merged).join(', ');
  }

  function chooseBestNameMatch(query, items, getName) {
    var normalizedQuery = normalizeText(query);
    var list = Array.isArray(items) ? items : [];
    var resolver = typeof getName === 'function' ? getName : function (item) { return item; };
    var exact = list.find(function (item) {
      return normalizeText(resolver(item)) === normalizedQuery;
    });
    if (exact) return exact;
    var contains = list.find(function (item) {
      var candidate = normalizeText(resolver(item));
      return candidate.indexOf(normalizedQuery) >= 0 || normalizedQuery.indexOf(candidate) >= 0;
    });
    return contains || list[0] || null;
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

  function buildBandPhotoUploadPath(meta, fileName, role) {
    var safeMeta = meta && typeof meta === 'object' ? meta : {};
    var bandPart = normalizeKey(safeMeta.bandName || 'unknown-band') || 'unknown-band';
    var rolePart = normalizeKey(role || 'image') || 'image';
    var stamp = new Date().toISOString().replace(/[:.]/g, '-');
    var namePart = sanitizeFileName(fileName || (rolePart + '.jpg'));
    return 'Band_Photos/' + bandPart + '/' + stamp + '-' + rolePart + '-' + namePart;
  }

  async function uploadBandImageToOneDrive(fileOrBlob, meta, role, fileName) {
    if (!fileOrBlob) throw new Error('Select an image first.');
    var safeMeta = meta && typeof meta === 'object' ? meta : {};
    var inferredName = fileName || fileOrBlob.name || (normalizeKey(safeMeta.bandName || 'band') || 'band') + '-' + (role || 'image') + '.jpg';
    var uploadPath = buildBandPhotoUploadPath(safeMeta, inferredName, role);
    var encodedPath = encodeGraphPath(uploadPath);
    var url = 'https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/content';
    var response = await fetchGraphRaw(url, {
      method: 'PUT',
      headers: {
        'Content-Type': fileOrBlob.type || 'application/octet-stream'
      },
      body: fileOrBlob
    });
    var payload = await response.json().catch(function () { return {}; });
    var resolvedUrl = String(payload.webUrl || payload['@microsoft.graph.downloadUrl'] || '').trim();
    if (!resolvedUrl) throw new Error('Upload succeeded but OneDrive did not return a shareable URL.');
    return resolvedUrl;
  }

  async function uploadBandImageFromUrl(imageUrl, meta, role) {
    var url = String(imageUrl || '').trim();
    if (!url) throw new Error('Enter an image URL first.');
    var response = await fetch(safeUrl(url));
    if (!response.ok) throw new Error('Could not download image (' + response.status + ').');
    var blob = await response.blob();
    var extension = (/image\/png/i.test(blob.type) ? '.png' : (/image\/webp/i.test(blob.type) ? '.webp' : '.jpg'));
    return uploadBandImageToOneDrive(blob, meta, role, (normalizeKey((meta && meta.bandName) || 'band') || 'band') + '-' + role + extension);
  }

  async function fetchBandImageCandidates(bandName) {
    var cleanName = String(bandName || '').trim();
    if (!cleanName) throw new Error('Enter a band name first.');
    var sources = [];
    var songPayload = await fetchJsonPublic('https://itunes.apple.com/search?entity=song&limit=12&term=' + encodeURIComponent(cleanName));
    var albumPayload = await fetchJsonPublic('https://itunes.apple.com/search?entity=album&limit=12&term=' + encodeURIComponent(cleanName));
    var all = [].concat(songPayload.results || [], albumPayload.results || []);
    all.forEach(function (entry) {
      var artistName = String(entry.artistName || '').trim();
      if (!artistName || safeArtistMatchScore(cleanName, artistName) < 70) return;
      var art = String(entry.artworkUrl100 || entry.artworkUrl60 || '').trim();
      if (!art) return;
      var highRes = art.replace(/\/\d+x\d+bb\./, '/1200x1200bb.');
      sources.push({
        url: highRes,
        thumbUrl: art,
        label: String(entry.collectionName || entry.trackName || artistName).trim(),
        source: 'Apple Music'
      });
    });
    var unique = [];
    sources.forEach(function (item) {
      if (!item.url) return;
      if (unique.some(function (existing) { return normalizeText(existing.url) === normalizeText(item.url); })) return;
      unique.push(item);
    });
    return unique.slice(0, 24);
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

  function mapRecordToRowByColumns(record, columns, options) {
    var safeOptions = options && typeof options === 'object' ? options : {};
    var normalizedValues = {};
    Object.entries(record || {}).forEach(function (entry) {
      var normalized = normalizeColumnName(entry[0]);
      if (normalized) normalizedValues[normalized] = entry[1];
    });
    function resolveValueForColumn(normalizedName) {
      if (Object.prototype.hasOwnProperty.call(normalizedValues, normalizedName)) {
        return { value: normalizedValues[normalizedName], sourceKey: normalizedName, sourceType: 'exact' };
      }
      var aliases = TABLE_WRITE_COLUMN_ALIASES[normalizedName] || [];
      for (var aliasIdx = 0; aliasIdx < aliases.length; aliasIdx += 1) {
        var alias = normalizeColumnName(aliases[aliasIdx]);
        if (alias && Object.prototype.hasOwnProperty.call(normalizedValues, alias)) {
          return { value: normalizedValues[alias], sourceKey: alias, sourceType: 'alias' };
        }
      }
      // Handles workbook variants like "Band Members + Roles" or "Band Members and Roles".
      if (/bandmembers/.test(normalizedName) && Object.prototype.hasOwnProperty.call(normalizedValues, 'bandmembers')) {
        return { value: normalizedValues.bandmembers, sourceKey: 'bandmembers', sourceType: 'pattern' };
      }
      return { value: '', sourceKey: '', sourceType: 'missing' };
    }
    var auditRows = [];
    var rowValues = (Array.isArray(columns) ? columns : [])
      .slice()
      .sort(function (a, b) {
        var ai = Number.isInteger(a.index) ? a.index : 0;
        var bi = Number.isInteger(b.index) ? b.index : 0;
        return ai - bi;
      })
      .map(function (column) {
        var normalizedName = normalizeColumnName(column.name || '');
        var resolved = resolveValueForColumn(normalizedName);
        var value = resolved.value;
        auditRows.push({
          column: String(column.name || '').trim(),
          normalizedColumn: normalizedName,
          sourceKey: resolved.sourceKey,
          sourceType: resolved.sourceType,
          valuePreview: summarizeAuditValue(value)
        });
        return value == null ? '' : value;
      });
    if (safeOptions.audit && isBackendWriteAuditEnabled()) {
      console.groupCollapsed('[Concerts Write Audit] ' + (safeOptions.tableName || 'Unknown table') + ' -> ' + (safeOptions.context || 'row add'));
      console.table(auditRows);
      console.log('Record keys:', Object.keys(record || {}));
      console.log('Raw record:', record || {});
      console.groupEnd();
    }
    return rowValues;
  }

  async function appendRecordToTable(filePath, tableName, record) {
    var schema = await fetchTableColumnsAndRows(filePath, tableName, 1);
    var row = mapRecordToRowByColumns(record, schema.columns || [], {
      audit: true,
      tableName: tableName,
      context: 'appendRecordToTable'
    });
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

  function getBandProfileMeta(bandNameOrKey) {
    var key = normalizeKey(bandNameOrKey);
    return key ? (state.bandProfileMeta[key] || null) : null;
  }

  function saveBandProfileMeta(bandNameOrKey, meta) {
    var key = normalizeKey(bandNameOrKey);
    if (!key || !meta || typeof meta !== 'object') return;
    var existing = state.bandProfileMeta[key] || {};
    var next = Object.assign({}, existing, meta);
    next.fieldProvenance = mergeFieldProvenanceMaps(existing.fieldProvenance || {}, meta.fieldProvenance || {});
    var fieldValuesSnapshot = meta.fieldValues && typeof meta.fieldValues === 'object'
      ? Object.keys(BAND_PROFILE_FIELD_LABELS).reduce(function (acc, key) {
        acc[key] = String(meta.fieldValues[key] || '').trim();
        return acc;
      }, {})
      : (existing.fieldValues || {});
    if (Object.keys(fieldValuesSnapshot).length) next.fieldValues = fieldValuesSnapshot;
    var sourceKeys = uniqueStrings([].concat(
      Array.isArray(meta.sources) ? meta.sources : [],
      Array.isArray(existing.sourceKeys) ? existing.sourceKeys : [],
      inferSourceKeysFromLabel(meta.lastEnrichedFrom || '')
    ));
    if (sourceKeys.length) next.sourceKeys = sourceKeys;
    if (meta.lastEnrichedFrom || meta.lastEnrichedAt) {
      var history = Array.isArray(existing.history) ? existing.history.slice() : [];
      history.unshift({
        source: String(meta.lastEnrichedFrom || existing.lastEnrichedFrom || '').trim(),
        at: meta.lastEnrichedAt || Date.now(),
        confidence: String(meta.enrichmentConfidence || existing.enrichmentConfidence || '').trim(),
        sources: sourceKeys,
        fieldProvenance: next.fieldProvenance,
        fieldValues: fieldValuesSnapshot
      });
      next.history = history.filter(function (entry) {
        return entry && entry.source;
      }).slice(0, 12);
    }
    state.bandProfileMeta[key] = next;
    writeJsonStorage(BAND_PROFILE_META_STORAGE_KEY, state.bandProfileMeta);
  }

  function getBandProfileOverride(bandNameOrKey) {
    var key = normalizeKey(bandNameOrKey);
    return key ? (state.bandProfileOverrides[key] || null) : null;
  }

  function saveBandProfileOverride(bandNameOrKey, override) {
    var key = normalizeKey(bandNameOrKey);
    if (!key || !override || typeof override !== 'object') return;
    state.bandProfileOverrides[key] = Object.assign({}, state.bandProfileOverrides[key] || {}, override);
    writeJsonStorage(BAND_PROFILE_OVERRIDES_STORAGE_KEY, state.bandProfileOverrides);
  }

  // ===== PER-FIELD LOCK CONTROLS =====

  function getBandFieldLocks(bandKey) {
    var key = normalizeKey(bandKey);
    return key && state.bandProfileLocks[key] ? state.bandProfileLocks[key] : {};
  }

  function isBandFieldLocked(bandKey, fieldKey) {
    if (!bandKey || !fieldKey) return false;
    return !!getBandFieldLocks(bandKey)[fieldKey];
  }

  function toggleBandFieldLock(bandKey, fieldKey) {
    var key = normalizeKey(bandKey);
    if (!key || !fieldKey) return false;
    if (!state.bandProfileLocks[key]) state.bandProfileLocks[key] = {};
    var next = !state.bandProfileLocks[key][fieldKey];
    if (next) {
      state.bandProfileLocks[key][fieldKey] = true;
    } else {
      delete state.bandProfileLocks[key][fieldKey];
    }
    writeJsonStorage(BAND_PROFILE_LOCKS_STORAGE_KEY, state.bandProfileLocks);
    return next;
  }

  function setBandFieldLock(bandKey, fieldKey, shouldLock) {
    var key = normalizeKey(bandKey);
    if (!key || !fieldKey) return false;
    if (!state.bandProfileLocks[key]) state.bandProfileLocks[key] = {};
    if (shouldLock) {
      state.bandProfileLocks[key][fieldKey] = true;
      writeJsonStorage(BAND_PROFILE_LOCKS_STORAGE_KEY, state.bandProfileLocks);
      return true;
    }
    delete state.bandProfileLocks[key][fieldKey];
    writeJsonStorage(BAND_PROFILE_LOCKS_STORAGE_KEY, state.bandProfileLocks);
    return false;
  }

  function getAllLockedFieldsForBand(bandKey) {
    return Object.keys(getBandFieldLocks(bandKey));
  }

  function renderFieldLockBtn(bandKey, fieldKey, actionName) {
    var locked = isBandFieldLocked(bandKey, fieldKey);
    var action = actionName || 'toggle-form-field-lock';
    var meta = getBandProfileMeta(bandKey) || {};
    var provenance = meta.fieldProvenance && meta.fieldProvenance[fieldKey] ? meta.fieldProvenance[fieldKey] : null;
    var tooltip = provenance ? formatFieldProvenanceTooltip(provenance) : '';
    return '<button type="button"'
      + ' class="household-concerts-field-lock-btn' + (locked ? ' is-locked' : '') + '"'
      + ' data-concert-action="' + escapeHtml(action) + '"'
      + ' data-field-key="' + escapeHtml(fieldKey) + '"'
      + ' data-band-key="' + escapeHtml(bandKey) + '"'
      + ' title="' + escapeHtml((locked ? 'Field locked — auto-fill will not overwrite it. Click to unlock.' : 'Click to lock this field so auto-fill never overwrites it.') + (tooltip ? ('\n' + tooltip) : '')) + '"'
      + ' aria-pressed="' + (locked ? 'true' : 'false') + '"'
      + '>' + (locked ? '🔒' : '🔓') + '</button>';
  }

  function renderBandLockBadge(band) {
    var key = band && (band.id || band.bandName);
    var count = key ? getAllLockedFieldsForBand(key).length : 0;
    if (!count) return '';
    return '<span class="household-concerts-lock-summary-badge" title="' + escapeHtml('Locked fields: ' + count) + '">🔒 <strong>' + count + '</strong></span>';
  }

  function mapBandToPrefillShape(band) {
    var safeBand = band && typeof band === 'object' ? band : {};
    return {
      bandName: String(safeBand.bandName || '').trim(),
      bandMembers: String(safeBand.bandMembers || '').trim(),
      bandLogoUrl: String(safeBand.bandLogoUrl || '').trim(),
      bandCoverPhotoUrl: String(safeBand.bandCoverPhotoUrl || '').trim(),
      origin: String(safeBand.origin || '').trim(),
      founded: String(safeBand.founded || '').trim(),
      recordLabel: String(safeBand.recordLabel || '').trim(),
      discography: String(safeBand.discography || '').trim(),
      topSongs: String(safeBand.topSongs || '').trim(),
      associatedGenres: String(safeBand.associatedGenres || '').trim(),
      websiteUrl: String(safeBand.websiteUrl || '').trim(),
      tourPageUrl: String(safeBand.tourPageUrl || '').trim(),
      facebookUrl: String(safeBand.facebookUrl || '').trim(),
      instagramUrl: String(safeBand.instagramUrl || '').trim(),
      youTubeUrl: String(safeBand.youTubeUrl || '').trim(),
      setlistUrl: String(safeBand.setlistUrl || '').trim(),
      bandsintownUrl: String(safeBand.bandsintownUrl || '').trim(),
      wikipediaUrl: String(safeBand.wikipediaUrl || '').trim(),
      sourceLabel: String((getBandProfileMeta(safeBand.id || safeBand.bandName) || {}).lastEnrichedFrom || '').trim(),
      sourceKeys: (getBandProfileMeta(safeBand.id || safeBand.bandName) || {}).sourceKeys || [],
      fieldProvenance: (getBandProfileMeta(safeBand.id || safeBand.bandName) || {}).fieldProvenance || {}
    };
  }

  function applyBandProfileOverride(band) {
    if (!band || !band.id) return band;
    var override = getBandProfileOverride(band.id);
    if (!override) return band;
    var merged = mergeBandPrefill(mapBandToPrefillShape(band), override);
    return Object.assign({}, band, {
      bandName: merged.bandName || band.bandName,
      bandMembers: merged.bandMembers || band.bandMembers,
      bandLogoUrl: merged.bandLogoUrl || band.bandLogoUrl,
      bandCoverPhotoUrl: merged.bandCoverPhotoUrl || band.bandCoverPhotoUrl,
      origin: merged.origin || band.origin,
      founded: merged.founded || band.founded,
      recordLabel: merged.recordLabel || band.recordLabel,
      discography: merged.discography || band.discography,
      topSongs: merged.topSongs || band.topSongs,
      associatedGenres: merged.associatedGenres || band.associatedGenres,
      websiteUrl: merged.websiteUrl || band.websiteUrl,
      tourPageUrl: merged.tourPageUrl || band.tourPageUrl,
      facebookUrl: merged.facebookUrl || band.facebookUrl,
      instagramUrl: merged.instagramUrl || band.instagramUrl,
      youTubeUrl: merged.youTubeUrl || band.youTubeUrl,
      setlistUrl: merged.setlistUrl || band.setlistUrl,
      bandsintownUrl: merged.bandsintownUrl || band.bandsintownUrl,
      wikipediaUrl: merged.wikipediaUrl || band.wikipediaUrl,
      genres: splitGenres(merged.associatedGenres || band.associatedGenres),
      members: splitList(merged.bandMembers || band.bandMembers),
      songs: splitList(merged.topSongs || band.topSongs),
      releases: splitList(merged.discography || band.discography)
    });
  }

  function parseFavoriteBand(record) {
    var bandName = String(readValue(record, ['Band_Name', 'Band Name', 'Name']) || '').trim();
    if (!bandName) return null;
    return applyBandProfileOverride({
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
    });
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
      summaryCard('Upcoming In Range', String(upcomingNearbyCount), state.location ? (isDefaultConcertsLocation(state.location) ? ('Based on your default concert home base: ' + state.location.label + '.') : 'Based on your current distance slider and saved location.') : 'Set your location to turn on nearby concert filtering.'),
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
       var tags = getBandTags(band.bandName);
        var enrichmentBadge = renderBandEnrichmentBadge(band);
         var lockBadge = renderBandLockBadge(band);
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
          + '<h3>' + escapeHtml(band.bandName) + lockBadge + '</h3>'
         + '<div class="household-concerts-band-meta">' + escapeHtml(band.origin || 'Origin not set') + ' • ' + escapeHtml(band.founded || 'Founded date not set') + '</div>'
          + enrichmentBadge
         + '</div>'
         + '</div>'
         + '<div class="household-concerts-band-stats">'
         + statPill('Seen', String(stats.attendedCount))
         + statPill('Upcoming', String(stats.upcomingCount))
         + statPill('Avg', stats.averageRating ? stats.averageRating.toFixed(1) + '★' : '—')
         + '</div>'
         + (tags.length ? '<div class="household-concerts-tag-display">' + tags.map(function (tag) { return '<span class="household-concerts-tag-badge">' + escapeHtml(tag) + '</span>'; }).join('') + '</div>' : '')
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
         + '<button type="button" class="pill-button" data-concert-action="refresh-band-profile" data-band-key="' + escapeHtml(band.id) + '">↻ Refresh Profile</button>'
         + '<button type="button" class="pill-button" data-concert-action="open-log-concert" data-band-key="' + escapeHtml(band.id) + '">Log Concert</button>'
         + '<button type="button" class="pill-button" data-concert-action="open-add-upcoming" data-band-key="' + escapeHtml(band.id) + '">Add Upcoming</button>'
         + (band.bandsintownUrl ? '<button type="button" class="pill-button" data-concert-action="sync-tour" data-band-key="' + escapeHtml(band.id) + '" title="Fetch tour dates from Bandsintown">🔄 Sync Tour</button>' : '')
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
    var chipEl = $('householdConcertsLocationChip');
    if (chipEl) {
      chipEl.textContent = isDefaultConcertsLocation(state.location)
        ? ('Using ' + (state.location && state.location.label ? state.location.label : DEFAULT_CONCERTS_LOCATION.label))
        : ('Using ' + ((state.location && state.location.label) || 'your current location'));
      chipEl.className = 'household-concerts-location-chip' + (isDefaultConcertsLocation(state.location) ? '' : ' is-user-location');
    }
    var resetBtn = $('householdConcertsResetLocationBtn');
    if (resetBtn) resetBtn.hidden = !state.location || isDefaultConcertsLocation(state.location);
    var locationEl = $(LOCATION_TEXT_ID);
    if (locationEl) {
      locationEl.textContent = state.location
        ? (isDefaultConcertsLocation(state.location)
          ? ('Using ' + state.location.label + ' as your default concert home base. Click “Use My Location” to override it.')
          : 'Location ready for nearby filtering.')
        : 'Save your location to filter upcoming concerts by distance.';
    }

    var concerts = getFilteredUpcomingConcerts().slice().sort(function (a, b) {
      return (toIsoDate(a.concertDate) || '').localeCompare(toIsoDate(b.concertDate) || '');
    });
    if (!concerts.length) {
      el.innerHTML = emptyState('No upcoming concerts in the current view', state.location ? (isDefaultConcertsLocation(state.location) ? ('Try increasing the distance slider, add another upcoming concert, or change your home base from ' + state.location.label + '.') : 'Try increasing the distance slider or add another upcoming concert.') : 'Add an upcoming concert or set your location to unlock nearby filtering.');
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

  function renderRecommendationToast() {
    var host = getToastHost();
    if (!host) return;
    var toast = state.recommendationToast;
    if (!toast || !toast.token || !state.pendingRecommendationAdds[toast.token]) {
      host.innerHTML = '';
      return;
    }
    host.innerHTML = '<div class="household-concerts-toast" role="status" aria-live="polite">'
      + '<span>Added from recommendations: <strong>' + escapeHtml(toast.bandName || 'Band') + '</strong></span>'
      + '<button type="button" class="pill-button" data-concert-action="undo-recommended-add" data-toast-token="' + escapeHtml(toast.token) + '">Undo</button>'
      + '</div>';
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
     // ENHANCEMENT: New renderers
     renderPersonalStats();
     renderVenuePerformance();
     renderAchievements();
     renderPhotoGallery();
     renderAnalyticsDashboard();
     renderRecommendationToast();
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
       // ENHANCEMENT: Post-load checks
       detectAchievements();
       checkAndNotifyUpcomingConcerts();
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
      sourceLabel: sourceLabel || 'Search result',
      enrichmentConfidence: 'search'
    };
  }

  async function fetchJsonPublic(url, options) {
    var opts = options && typeof options === 'object' ? options : {};
    var response = await fetch(url, {
      method: opts.method || 'GET',
      headers: opts.headers || {}
    });
    if (!response.ok) throw new Error('Request failed (' + response.status + ')');
    return response.json().catch(function () { return {}; });
  }

  function sourceKeyFromLabel(label) {
    var text = normalizeText(label);
    if (!text) return '';
    if (text.indexOf('apple') >= 0) return 'apple';
    if (text.indexOf('musicbrainz') >= 0) return 'musicbrainz';
    if (text.indexOf('wikipedia') >= 0) return 'wikipedia';
    if (text.indexOf('bandsintown') >= 0) return 'bandsintown';
    if (text.indexOf('member') >= 0 || text.indexOf('relationship') >= 0) return 'members';
    return '';
  }

  function inferSourceKeysFromLabel(label) {
    var raw = String(label || '').trim();
    if (!raw) return [];
    return uniqueStrings(raw.split('+').map(function (part) {
      return sourceKeyFromLabel(part);
    }).filter(Boolean));
  }

  function safeArtistMatchScore(a, b) {
    var left = normalizeText(a).replace(/^the\s+/, '');
    var right = normalizeText(b).replace(/^the\s+/, '');
    if (!left || !right) return 0;
    if (left === right) return 100;
    if (left.indexOf(right) >= 0 || right.indexOf(left) >= 0) return 70;
    return 0;
  }

  async function resolveBandsintownArtistUrl(bandName, seedUrl) {
    var cleanName = String(bandName || '').trim();
    var fallbackUrl = String(seedUrl || '').trim() || ('https://www.bandsintown.com/search?q=' + encodeURIComponent(cleanName));
    if (!cleanName) return fallbackUrl;
    try {
      var payload = await fetchJsonPublic('https://www.bandsintown.com/api/v2/artists/' + encodeURIComponent(cleanName) + '?app_id=kyles_adventure_planner');
      var candidateUrl = String(payload && payload.url ? payload.url : '').trim();
      var candidateName = String(payload && payload.name ? payload.name : '').trim();
      if (candidateUrl && safeArtistMatchScore(cleanName, candidateName) >= 70) {
        return candidateUrl;
      }
      return fallbackUrl;
    } catch (_error) {
      return fallbackUrl;
    }
  }

  function isGenericBandsintownSearchUrl(url) {
    return /bandsintown\.com\/search\?/i.test(String(url || ''));
  }

  function extractMemberRolesFromMusicBrainzRelations(relations) {
    var list = Array.isArray(relations) ? relations : [];
    var rows = list.map(function (relation) {
      if (!relation || !relation.artist || !relation.artist.name) return '';
      var type = normalizeText(relation.type || '');
      if (type.indexOf('member') < 0 && type.indexOf('founder') < 0) return '';
      var attributes = Array.isArray(relation.attributes) ? relation.attributes : [];
      var role = attributes.length ? attributes.join(', ') : (type.indexOf('founder') >= 0 ? 'Founder' : 'Member');
      return String(relation.artist.name || '').trim() + ' — ' + role;
    }).filter(Boolean);
    return uniqueStrings(rows).slice(0, 12).join('\n');
  }

  async function fetchAppleBandEnrichment(bandName) {
    var cleanName = String(bandName || '').trim();
    if (!cleanName) return {};

    var artistPayload = await fetchJsonPublic('https://itunes.apple.com/search?entity=musicArtist&limit=8&term=' + encodeURIComponent(cleanName));
    var artistResults = Array.isArray(artistPayload.results) ? artistPayload.results : [];
    var artist = chooseBestNameMatch(cleanName, artistResults, function (item) { return item.artistName; }) || {};

    var songPayload = await fetchJsonPublic('https://itunes.apple.com/search?entity=song&attribute=artistTerm&limit=8&term=' + encodeURIComponent(cleanName));
    var songResults = Array.isArray(songPayload.results) ? songPayload.results : [];
    var topSongs = uniqueStrings(songResults
      .filter(function (item) {
        var artistName = normalizeText(item.artistName || '');
        return artistName === normalizeText(cleanName) || normalizeText(cleanName).indexOf(artistName) >= 0;
      })
      .map(function (item) { return String(item.trackName || '').trim(); })
      .filter(Boolean)).slice(0, 6).join(', ');

    var albumPayload = await fetchJsonPublic('https://itunes.apple.com/search?entity=album&attribute=artistTerm&limit=8&term=' + encodeURIComponent(cleanName));
    var albumResults = Array.isArray(albumPayload.results) ? albumPayload.results : [];
    var discography = uniqueStrings(albumResults
      .filter(function (item) {
        var artistName = normalizeText(item.artistName || '');
        return artistName === normalizeText(cleanName) || normalizeText(cleanName).indexOf(artistName) >= 0;
      })
      .map(function (item) { return String(item.collectionName || '').trim(); })
      .filter(Boolean)).slice(0, 6).join(', ');

    return {
      bandName: String(artist.artistName || cleanName).trim(),
      associatedGenres: String(artist.primaryGenreName || '').trim(),
      topSongs: topSongs,
      discography: discography,
      tourPageUrl: String(artist.artistLinkUrl || '').trim(),
      bandsintownUrl: await resolveBandsintownArtistUrl(cleanName),
      youTubeUrl: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(cleanName),
      setlistUrl: 'https://www.setlist.fm/search?query=' + encodeURIComponent(cleanName),
      wikipediaUrl: 'https://en.wikipedia.org/w/index.php?search=' + encodeURIComponent(cleanName),
      sourceLabel: 'Auto-filled from Apple Music metadata',
      sourceKey: 'apple',
      enrichmentConfidence: artist.artistName ? 'high' : 'medium'
    };
  }

  async function fetchMusicBrainzBandEnrichment(bandName) {
    var cleanName = String(bandName || '').trim();
    if (!cleanName) return {};

    var searchPayload = await fetchJsonPublic('https://musicbrainz.org/ws/2/artist/?fmt=json&limit=5&query=' + encodeURIComponent('artist:"' + cleanName + '"'));
    var artists = Array.isArray(searchPayload.artists) ? searchPayload.artists : [];
    var artist = chooseBestNameMatch(cleanName, artists, function (item) { return item.name; });
    if (!artist || !artist.id) return {};

    var detailPayload = await fetchJsonPublic('https://musicbrainz.org/ws/2/artist/' + encodeURIComponent(artist.id) + '?fmt=json&inc=url-rels+tags+artist-rels');
    var relations = Array.isArray(detailPayload.relations) ? detailPayload.relations : [];
    var tags = Array.isArray(detailPayload.tags) ? detailPayload.tags : [];
    var officialSite = relations.find(function (relation) { return relation.type === 'official homepage' && relation.url && relation.url.resource; });
    var wikipedia = relations.find(function (relation) { return relation.type === 'wikipedia' && relation.url && relation.url.resource; });
    var formedYear = String((((detailPayload['life-span'] || {}).begin) || ((artist['life-span'] || {}).begin) || '')).slice(0, 4);

    var memberRoles = extractMemberRolesFromMusicBrainzRelations(relations);

    return {
      origin: preferFilledValue('', ((detailPayload['begin-area'] || {}).name) || ((detailPayload.area || {}).name) || ((artist['begin-area'] || {}).name) || ((artist.area || {}).name) || ''),
      founded: formedYear,
      websiteUrl: officialSite ? String(officialSite.url.resource || '').trim() : '',
      wikipediaUrl: wikipedia ? String(wikipedia.url.resource || '').trim() : '',
      bandMembers: memberRoles,
      associatedGenres: uniqueStrings(tags.map(function (tag) { return String(tag.name || '').trim(); }).filter(Boolean)).slice(0, 6).join(', '),
      sourceLabel: memberRoles ? 'Auto-filled from MusicBrainz metadata + relationships' : 'Auto-filled from MusicBrainz metadata',
      sourceKey: 'musicbrainz',
      enrichmentConfidence: 'high'
    };
  }

  async function fetchWikipediaBandEnrichment(bandName) {
    var cleanName = String(bandName || '').trim();
    if (!cleanName) return {};
    var payload = await fetchJsonPublic('https://en.wikipedia.org/w/api.php?action=opensearch&limit=1&namespace=0&format=json&origin=*&search=' + encodeURIComponent(cleanName));
    var urls = Array.isArray(payload && payload[3]) ? payload[3] : [];
    return {
      wikipediaUrl: String(urls[0] || '').trim(),
      sourceLabel: urls[0] ? 'Auto-filled from Wikipedia search' : '',
      sourceKey: urls[0] ? 'wikipedia' : ''
    };
  }

  function mergeBandPrefill(base, addition) {
    var current = base && typeof base === 'object' ? base : {};
    var incoming = addition && typeof addition === 'object' ? addition : {};
    return {
      bandName: preferFilledValue(current.bandName, incoming.bandName),
      bandMembers: preferFilledValue(current.bandMembers, incoming.bandMembers),
      bandLogoUrl: preferFilledValue(current.bandLogoUrl, incoming.bandLogoUrl),
      bandCoverPhotoUrl: preferFilledValue(current.bandCoverPhotoUrl, incoming.bandCoverPhotoUrl),
      origin: preferFilledValue(current.origin, incoming.origin),
      founded: preferFilledValue(current.founded, incoming.founded),
      recordLabel: preferFilledValue(current.recordLabel, incoming.recordLabel),
      discography: mergeDelimitedValues(current.discography, incoming.discography),
      topSongs: mergeDelimitedValues(current.topSongs, incoming.topSongs),
      associatedGenres: mergeDelimitedValues(current.associatedGenres, incoming.associatedGenres),
      websiteUrl: preferSpecificUrl(current.websiteUrl, incoming.websiteUrl),
      tourPageUrl: preferSpecificUrl(current.tourPageUrl, incoming.tourPageUrl),
      facebookUrl: preferFilledValue(current.facebookUrl, incoming.facebookUrl),
      instagramUrl: preferFilledValue(current.instagramUrl, incoming.instagramUrl),
      youTubeUrl: preferSpecificUrl(current.youTubeUrl, incoming.youTubeUrl),
      setlistUrl: preferSpecificUrl(current.setlistUrl, incoming.setlistUrl),
      bandsintownUrl: preferSpecificUrl(current.bandsintownUrl, incoming.bandsintownUrl),
      wikipediaUrl: preferSpecificUrl(current.wikipediaUrl, incoming.wikipediaUrl),
      sourceLabel: preferFilledValue(incoming.sourceLabel, current.sourceLabel),
      enrichmentConfidence: preferFilledValue(incoming.enrichmentConfidence, current.enrichmentConfidence),
      sourceKeys: uniqueStrings([].concat(
        current.sourceKeys || [],
        incoming.sourceKeys || [],
        incoming.sourceKey ? [incoming.sourceKey] : [],
        inferSourceKeysFromLabel(incoming.sourceLabel || ''),
        inferSourceKeysFromLabel(current.sourceLabel || '')
      ))
    };
  }

  async function enrichBandProfileData(prefill) {
    var seed = prefill && typeof prefill === 'object' ? prefill : {};
    var bandName = String(seed.bandName || '').trim();
    if (!bandName) throw new Error('Enter a band name first so the profile can be auto-filled.');

    var merged = mergeBandPrefill({}, seed);
    var fieldProvenance = mergeFieldProvenanceMaps({}, seed.fieldProvenance || {});
    var fieldCandidates = {};
    var sourceLabels = [];
    var settings = normalizeConcertSettings(state.settings);
    var tasks = [];
    if (settings.enrichmentSources.apple) tasks.push(fetchAppleBandEnrichment(bandName));
    if (settings.enrichmentSources.musicbrainz) tasks.push(fetchMusicBrainzBandEnrichment(bandName));
    if (settings.enrichmentSources.wikipedia) tasks.push(fetchWikipediaBandEnrichment(bandName));
    var results = await Promise.allSettled(tasks);
    results.forEach(function (result) {
      if (result.status === 'fulfilled' && result.value) {
        if (!settings.enrichmentSources.members && result.value.bandMembers) {
          delete result.value.bandMembers;
        }
        if (!settings.enrichmentSources.bandsintown && result.value.bandsintownUrl) {
          delete result.value.bandsintownUrl;
        }
        fieldProvenance = mergeFieldProvenanceMaps(
          fieldProvenance,
          buildFieldProvenanceFromPatch(result.value, result.value.sourceKey, result.value.enrichmentConfidence)
        );
        Object.keys(BAND_PROFILE_FIELD_LABELS).forEach(function (fieldKey) {
          var candidateValue = String(result.value[fieldKey] || '').trim();
          if (!candidateValue) return;
          if (!fieldCandidates[fieldKey]) fieldCandidates[fieldKey] = [];
          fieldCandidates[fieldKey].push({
            value: candidateValue,
            sourceKey: normalizeText(result.value.sourceKey || sourceKeyFromLabel(result.value.sourceLabel || '')),
            confidence: String(result.value.enrichmentConfidence || '').trim()
          });
        });
        merged = mergeBandPrefill(merged, result.value);
        if (result.value.sourceLabel) sourceLabels.push(String(result.value.sourceLabel).replace(/^Auto-filled from\s+/i, '').trim());
      }
    });
    if (sourceLabels.length) merged.sourceLabel = 'Auto-filled from ' + uniqueStrings(sourceLabels).join(' + ');
    var conflicts = {};
    Object.keys(fieldCandidates).forEach(function (fieldKey) {
      var candidates = fieldCandidates[fieldKey] || [];
      var unique = [];
      candidates.forEach(function (candidate) {
        var exists = unique.some(function (existing) { return normalizeText(existing.value) === normalizeText(candidate.value); });
        if (!exists) unique.push(candidate);
      });
      if (unique.length > 1) conflicts[fieldKey] = unique;
    });
    merged.conflicts = conflicts;
    merged.fieldProvenance = fieldProvenance;
    return merged;
  }

  function renderBandEnrichmentBadge(band) {
    var meta = getBandProfileMeta(band && band.id ? band.id : band && band.bandName);
    if (!meta || !meta.lastEnrichedFrom) return '';
    var stamp = formatDateTimeShort(meta.lastEnrichedAt);
    var title = stamp ? ('Last enriched ' + stamp) : 'Band profile was auto-enriched';
    return '<button type="button" class="household-concerts-enrichment-badge" data-concert-action="open-band-refresh-history" data-band-key="' + escapeHtml(band.id || normalizeKey(band.bandName)) + '" title="' + escapeHtml(title + '. Click for refresh history.') + '">✨ Last enriched from ' + escapeHtml(meta.lastEnrichedFrom) + (stamp ? ' • ' + escapeHtml(stamp) : '') + '</button>';
  }

  function renderSourceIcon(sourceKey) {
    var key = normalizeText(sourceKey);
    var map = {
      apple: { icon: 'A', label: 'Apple Music' },
      musicbrainz: { icon: 'MB', label: 'MusicBrainz' },
      wikipedia: { icon: 'W', label: 'Wikipedia' },
      bandsintown: { icon: 'BT', label: 'Bandsintown' },
      members: { icon: 'M', label: 'Members/Roles' },
      user: { icon: 'U', label: 'User' }
    };
    var entry = map[key] || { icon: '?', label: sourceLabelFromKey(sourceKey) };
    return '<span class="household-concerts-source-icon" title="' + escapeHtml(entry.label) + '">' + escapeHtml(entry.icon) + '</span>';
  }

  function confidenceTone(value) {
    var normalized = normalizeText(value);
    if (!normalized) return 'low';
    if (normalized.indexOf('high') >= 0) return 'high';
    if (normalized.indexOf('medium') >= 0) return 'medium';
    return 'low';
  }

  function getDiscoveryRecommendationsForBand(bandKey) {
    var band = getBandByKey(bandKey) || resolveActiveBand();
    if (!band) return [];
    return Array.isArray(state.discoveryCache[normalizeKey(band.bandName)])
      ? state.discoveryCache[normalizeKey(band.bandName)]
      : [];
  }

  function clearBandRefreshHistory(band) {
    if (!band) return;
    var key = normalizeKey(band.id || band.bandName);
    if (!key || !state.bandProfileMeta[key]) return;
    var nextMeta = Object.assign({}, state.bandProfileMeta[key]);
    delete nextMeta.history;
    delete nextMeta.lastEnrichedAt;
    delete nextMeta.lastEnrichedFrom;
    delete nextMeta.enrichmentConfidence;
    delete nextMeta.sourceKeys;
    delete nextMeta.fieldProvenance;
    delete nextMeta.fieldValues;
    state.bandProfileMeta[key] = nextMeta;
    writeJsonStorage(BAND_PROFILE_META_STORAGE_KEY, state.bandProfileMeta);
    renderAll();
    setStatus('Cleared profile refresh history for ' + band.bandName + '.', 'success');
  }

  function renderFieldProvenancePanel(fieldProvenance, bandKey) {
    var normalized = normalizeFieldProvenanceMap(fieldProvenance || {});
    var keys = Object.keys(normalized);
    if (!keys.length) {
      return '<div class="household-concerts-field-provenance-panel"><h4>Field confidence by profile field</h4><p class="household-concerts-muted">No field-level confidence snapshot yet.</p></div>';
    }
    return '<div class="household-concerts-field-provenance-panel"><h4>Field confidence &amp; locks</h4><p class="household-concerts-muted">Lock a field to prevent auto-fill from ever overwriting it.</p>'
      + (bandKey ? '<div class="household-concerts-form-actions"><button type="button" class="pill-button" data-concert-action="bulk-lock-high-confidence" data-band-key="' + escapeHtml(bandKey) + '">Auto-lock all high confidence</button></div>' : '')
      + '<div class="household-concerts-field-provenance-list">'
      + keys.map(function (fieldKey) {
        var entry = normalized[fieldKey];
        var tone = confidenceTone(entry.confidence);
        var locked = bandKey ? isBandFieldLocked(bandKey, fieldKey) : false;
        var tooltip = formatFieldProvenanceTooltip(entry);
        return '<article class="household-concerts-field-provenance-item' + (locked ? ' is-locked' : '') + '">'
          + '<div class="provenance-item-head">'
          + '<strong>' + escapeHtml(BAND_PROFILE_FIELD_LABELS[fieldKey] || fieldKey) + '</strong>'
          + (bandKey ? renderFieldLockBtn(bandKey, fieldKey, 'toggle-provenance-field-lock') : '')
          + '</div>'
          + (entry.sources && entry.sources.length ? ('<div class="household-concerts-source-icons-row">' + entry.sources.map(renderSourceIcon).join('') + '</div>') : '')
          + (entry.confidence ? ('<em class="household-concerts-refresh-confidence household-concerts-refresh-confidence--' + escapeHtml(tone) + '">' + escapeHtml(entry.confidence) + ' confidence</em>') : '')
          + '<span class="household-concerts-muted" title="' + escapeHtml(tooltip) + '">' + escapeHtml(tooltip) + '</span>'
          + '</article>';
      }).join('')
      + '</div></div>';
  }

  function buildHistoryEntryDiff(newer, older) {
    var nextValues = newer && newer.fieldValues && typeof newer.fieldValues === 'object' ? newer.fieldValues : {};
    var prevValues = older && older.fieldValues && typeof older.fieldValues === 'object' ? older.fieldValues : {};
    var nextProvenance = normalizeFieldProvenanceMap((newer && newer.fieldProvenance) || {});
    var prevProvenance = normalizeFieldProvenanceMap((older && older.fieldProvenance) || {});
    return Object.keys(BAND_PROFILE_FIELD_LABELS).map(function (fieldKey) {
      var oldValue = String(prevValues[fieldKey] || '').trim();
      var newValue = String(nextValues[fieldKey] || '').trim();
      var oldMeta = prevProvenance[fieldKey] || {};
      var newMeta = nextProvenance[fieldKey] || {};
      var changed = oldValue !== newValue
        || String(oldMeta.confidence || '') !== String(newMeta.confidence || '')
        || normalizeText((oldMeta.sources || []).join('|')) !== normalizeText((newMeta.sources || []).join('|'));
      if (!changed) return null;
      return {
        fieldKey: fieldKey,
        label: BAND_PROFILE_FIELD_LABELS[fieldKey],
        oldValue: oldValue,
        newValue: newValue,
        confidence: String(newMeta.confidence || '').trim(),
        sources: Array.isArray(newMeta.sources) ? newMeta.sources : []
      };
    }).filter(Boolean);
  }

  function renderHistoryDiffPanel(history, selectedIndex) {
    if (!Array.isArray(history) || !history.length) return '';
    var index = Math.max(0, Math.min(history.length - 1, Number(selectedIndex) || 0));
    var current = history[index] || null;
    if (!current) return '';
    var previous = history[index + 1] || null;
    var diffs = buildHistoryEntryDiff(current, previous);
    var heading = previous ? 'Changes vs previous run' : 'Initial enrichment snapshot';
    return '<div class="household-concerts-history-diff-panel"><h4>' + heading + '</h4>'
      + (diffs.length
        ? '<div class="household-concerts-history-diff-list">' + diffs.map(function (diff) {
          var tone = confidenceTone(diff.confidence);
          return '<article class="household-concerts-history-diff-item"><strong>' + escapeHtml(diff.label) + '</strong>'
            + '<div class="diff-item-values"><div class="diff-old">' + (diff.oldValue ? escapeHtml(safeTruncate(diff.oldValue, 100)) : '<em class="diff-empty">empty</em>') + '</div><div class="diff-arrow">→</div><div class="diff-new">' + (diff.newValue ? escapeHtml(safeTruncate(diff.newValue, 100)) : '<em class="diff-empty">empty</em>') + '</div></div>'
            + '<div class="diff-item-badges">' + (diff.sources.length ? diff.sources.map(renderSourceIcon).join('') : '') + (diff.confidence ? '<em class="household-concerts-refresh-confidence household-concerts-refresh-confidence--' + escapeHtml(tone) + '">' + escapeHtml(diff.confidence) + '</em>' : '') + '</div>'
            + '</article>';
        }).join('') + '</div>'
        : '<p class="household-concerts-muted">No field-level differences captured for this run yet.</p>')
      + '</div>';
  }

  function openBandRefreshHistoryModal(band, selectedIndex) {
    if (!band) return;
    var meta = getBandProfileMeta(band.id || band.bandName) || {};
    var history = Array.isArray(meta.history) ? meta.history : [];
    var latestFieldProvenance = history.length && history[0].fieldProvenance ? history[0].fieldProvenance : (meta.fieldProvenance || {});
    var selected = Math.max(0, Math.min(history.length - 1, Number(selectedIndex) || 0));
    openModal(
      '<div class="household-concerts-modal-head"><div><h3>Profile Refresh History</h3><p>' + escapeHtml(band.bandName) + '</p></div><button type="button" class="household-concerts-icon-btn" data-concert-action="close-modal">✕</button></div>'
      + '<div class="household-concerts-band-profile">'
      + (history.length
        ? '<div class="household-concerts-refresh-history-list">' + history.map(function (entry, idx) {
          var sourceKeys = uniqueStrings([].concat(entry.sources || [], inferSourceKeysFromLabel(entry.source || '')));
          var tone = confidenceTone(entry.confidence);
          return '<button type="button" class="household-concerts-refresh-history-item' + (idx === selected ? ' is-active' : '') + '" data-concert-action="view-refresh-history-diff" data-band-key="' + escapeHtml(band.id || normalizeKey(band.bandName)) + '" data-history-index="' + idx + '"><strong>' + escapeHtml(entry.source || 'Unknown source') + '</strong><span>' + escapeHtml(formatDateTimeShort(entry.at) || 'Unknown time') + '</span>' + (sourceKeys.length ? ('<div class="household-concerts-source-icons-row">' + sourceKeys.map(renderSourceIcon).join('') + '</div>') : '') + (entry.confidence ? ('<em class="household-concerts-refresh-confidence household-concerts-refresh-confidence--' + escapeHtml(tone) + '">' + escapeHtml(entry.confidence) + ' confidence</em>') : '') + '</button>';
        }).join('') + '</div>'
        : '<p class="household-concerts-muted">This band has not been enriched yet.</p>')
      + renderHistoryDiffPanel(history, selected)
      + renderFieldProvenancePanel(latestFieldProvenance, band.id || normalizeKey(band.bandName))
      + '<div class="household-concerts-form-actions"><button type="button" class="pill-button" data-concert-action="refresh-band-profile-preview" data-band-key="' + escapeHtml(band.id) + '">↻ Refresh with Preview</button><button type="button" class="pill-button" data-concert-action="refresh-band-profile" data-band-key="' + escapeHtml(band.id) + '">↻ Refresh (apply all)</button><button type="button" class="pill-button" data-concert-action="clear-band-refresh-history" data-band-key="' + escapeHtml(band.id) + '">Clear History</button><button type="button" class="pill-button" data-concert-action="close-modal">Done</button></div>'
      + '</div>'
    );
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

  function computeRecommendationReliability(baseBand, candidate) {
    var band = baseBand && typeof baseBand === 'object' ? baseBand : {};
    var item = candidate && typeof candidate === 'object' ? candidate : {};
    var score = 0;
    if (safeArtistMatchScore(band.bandName, item.bandName) >= 70) score -= 100;
    var genres = Array.isArray(band.genres) ? band.genres : [];
    if (item.genreText && genres.some(function (genre) { return normalizeText(genre) === normalizeText(item.genreText); })) score += 40;
    if (item.reason && /shared genre/i.test(item.reason)) score += 20;
    if (normalizeText(item.bandName || '').indexOf(normalizeText((band.bandName || '').split(' ')[0])) >= 0) score += 10;
    if (item.referenceUrl) score += 8;
    return Math.max(0, Math.min(100, score));
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
      }).map(function (item) {
        var reliability = computeRecommendationReliability(band, item);
        return Object.assign({}, item, {
          reliability: reliability,
          reason: (item.reason || 'Related recommendation') + ' • reliability ' + reliability + '%'
        });
      }).filter(function (item) {
        return item.reliability >= 25;
      }).sort(function (a, b) {
        return b.reliability - a.reliability || a.bandName.localeCompare(b.bandName);
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
        state.location = buildConcertsLocation(position.coords.latitude, position.coords.longitude, 'saved', 'Your current location');
        state.settings.homeBaseMode = 'follow-user';
        saveConcertSettings(state.settings);
        setConcertsLocationMode('follow-user');
        if (typeof global.persistUserLocation === 'function') {
          global.persistUserLocation(state.location.latitude, state.location.longitude);
        } else {
          writeJsonStorage(LOCATION_STORAGE_KEY, {
            latitude: state.location.latitude,
            longitude: state.location.longitude,
            label: state.location.label,
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

  function findDiscoveryById(id, bandKey) {
    var list = getDiscoveryRecommendationsForBand(bandKey);
    return list.find(function (item) { return item.id === id; }) || null;
  }

   function openModal(innerHtml) {
     var host = getModalHost();
     if (!host) return;
     host.innerHTML = '<div class="household-concerts-modal-backdrop"><div class="household-concerts-modal" role="dialog" aria-modal="true">' + innerHtml + '</div></div>';
   }

  function closeModal() {
    var host = getModalHost();
    if (!host) return;
    host.innerHTML = '';
    state.attendedUploadFiles = [];
    state.attendedUploadedPhotoUrls = [];
    state.attendedUploadBusy = false;
    state.attendedUploadStatus = { tone: 'info', message: '' };
    state.bandImagePicker = null;
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

  function getBandFormStatusEl() {
    return document.getElementById('householdConcertsBandFormStatus');
  }

  function setBandFormStatus(message, tone) {
    var statusEl = getBandFormStatusEl();
    if (!statusEl) return;
    statusEl.className = 'household-concerts-upload-status household-concerts-upload-status--' + (tone || 'info');
    statusEl.textContent = String(message || '').trim();
  }

  function serializeBandForm(form) {
    var raw = serializeForm(form);
    return {
      bandName: String(raw.Band_Name || '').trim(),
      bandMembers: String(raw.Band_Members || '').trim(),
      bandLogoUrl: String(raw.Band_Logo_URL || '').trim(),
      bandCoverPhotoUrl: String(raw.Band_Cover_Photo_URL || '').trim(),
      origin: String(raw.Origin || '').trim(),
      founded: String(raw.Founded || '').trim(),
      recordLabel: String(raw.Record_Label || '').trim(),
      discography: String(raw.Discography || '').trim(),
      topSongs: String(raw.Top_Songs || '').trim(),
      associatedGenres: String(raw.Associated_Genres || '').trim(),
      websiteUrl: String(raw.Website_URL || '').trim(),
      tourPageUrl: String(raw.Tour_Page_URL || '').trim(),
      facebookUrl: String(raw.Facebook_URL || '').trim(),
      instagramUrl: String(raw.Instagram_URL || '').trim(),
      youTubeUrl: String(raw.YouTube_URL || '').trim(),
      setlistUrl: String(raw['Setlist.fm_URL'] || '').trim(),
      bandsintownUrl: String(raw.Bandsintown_URL || '').trim(),
      wikipediaUrl: String(raw.Wikipedia_URL || '').trim(),
      sourceLabel: String(raw.sourceLabel || '').trim(),
      enrichmentConfidence: String(raw.enrichmentConfidence || '').trim(),
      sourceKeys: String(raw.sourceKeys || '').trim(),
      fieldProvenanceJson: String(raw.fieldProvenanceJson || '').trim()
    };
  }

  function getFieldProvenanceFromForm(form) {
    if (!form) return {};
    var input = form.querySelector('input[name="fieldProvenanceJson"]');
    if (!input) return {};
    try {
      return normalizeFieldProvenanceMap(input.value ? JSON.parse(input.value) : {});
    } catch (_error) {
      return {};
    }
  }

  function applyBandFormFieldTooltips(form) {
    if (!form) return;
    var provenanceMap = getFieldProvenanceFromForm(form);
    Object.keys(BAND_FORM_NAME_TO_PREFILL_KEY).forEach(function (name) {
      var field = form.querySelector('[name="' + name + '"]');
      if (!field) return;
      var fieldKey = BAND_FORM_NAME_TO_PREFILL_KEY[name];
      var entry = provenanceMap[fieldKey];
      if (!entry) {
        field.removeAttribute('title');
        return;
      }
      field.title = formatFieldProvenanceTooltip(entry);
    });
  }

  function updateAutoFillButtonBadge(form, diffCount) {
    if (!form) return;
    var btn = form.querySelector('[data-concert-action="auto-fill-band-profile"]');
    if (!btn) return;
    var count = Math.max(0, Number(diffCount) || 0);
    btn.textContent = count ? ('✨ Auto-fill Profile (' + count + ' changes)') : '✨ Auto-fill Profile';
  }

  function pushFieldUndoSnapshot(bandKey, fieldKey, previousValue) {
    var band = normalizeKey(bandKey);
    if (!band || !fieldKey) return;
    var stackKey = band + '::' + fieldKey;
    if (!state.fieldUndoStacks[stackKey]) state.fieldUndoStacks[stackKey] = [];
    var stack = state.fieldUndoStacks[stackKey];
    stack.push(String(previousValue || ''));
    while (stack.length > 5) stack.shift();
  }

  function popFieldUndoSnapshot(bandKey, fieldKey) {
    var band = normalizeKey(bandKey);
    if (!band || !fieldKey) return null;
    var stack = state.fieldUndoStacks[band + '::' + fieldKey];
    if (!Array.isArray(stack) || !stack.length) return null;
    return stack.pop();
  }

  function applyFieldUndoForInput(form, input) {
    if (!form || !input) return false;
    var bandName = String((form.querySelector('[name="Band_Name"]') || {}).value || '').trim();
    var fieldKey = BAND_FORM_NAME_TO_PREFILL_KEY[input.name || ''];
    if (!bandName || !fieldKey) return false;
    var previous = popFieldUndoSnapshot(bandName, fieldKey);
    if (previous == null) return false;
    input.value = previous;
    return true;
  }

  function patchBandFormWithPrefill(form, prefill, bandKey, options) {
    if (!form || !prefill) return;
    var safeOptions = options && typeof options === 'object' ? options : {};
    var trackUndo = safeOptions.trackUndo !== false;
    var resolvedBandKey = String(bandKey || (form.querySelector('[name="Band_Name"]') || {}).value || '').trim();
    var mapping = {
      bandName: 'Band_Name',
      bandMembers: 'Band_Members',
      bandLogoUrl: 'Band_Logo_URL',
      bandCoverPhotoUrl: 'Band_Cover_Photo_URL',
      origin: 'Origin',
      founded: 'Founded',
      recordLabel: 'Record_Label',
      discography: 'Discography',
      topSongs: 'Top_Songs',
      associatedGenres: 'Associated_Genres',
      websiteUrl: 'Website_URL',
      tourPageUrl: 'Tour_Page_URL',
      facebookUrl: 'Facebook_URL',
      instagramUrl: 'Instagram_URL',
      youTubeUrl: 'YouTube_URL',
      setlistUrl: 'Setlist.fm_URL',
      bandsintownUrl: 'Bandsintown_URL',
      wikipediaUrl: 'Wikipedia_URL',
      sourceLabel: 'sourceLabel',
      enrichmentConfidence: 'enrichmentConfidence',
      sourceKeys: 'sourceKeys',
      fieldProvenanceJson: 'fieldProvenanceJson'
    };
    Object.keys(mapping).forEach(function (key) {
      if (isBandFieldLocked(resolvedBandKey, key)) return; // honour per-field lock
      var field = form.querySelector('[name="' + mapping[key] + '"]');
      if (!field) return;
      var current = String(field.value || '').trim();
      var next = String(prefill[key] || '').trim();
      var resolved = (key === 'sourceLabel' || key === 'enrichmentConfidence')
        ? preferFilledValue(next, current)
        : (/Url$/i.test(key) ? preferSpecificUrl(current, next) : preferFilledValue(current, next));
      if (resolved && resolved !== current) {
        if (trackUndo) pushFieldUndoSnapshot(resolvedBandKey, key, current);
        field.value = resolved;
      }
    });
    var noteEl = form.querySelector('[data-band-form-source]');
    if (noteEl && prefill.sourceLabel) noteEl.textContent = prefill.sourceLabel;
    applyBandFormFieldTooltips(form);
  }

  async function autoFillBandForm(form, options) {
    var safeOptions = options && typeof options === 'object' ? options : {};
    if (!form) return null;
    if (form.dataset.bandProfileBusy === '1') return null;
    var current = serializeBandForm(form);
    if (!current.bandName) {
      setBandFormStatus('Enter a band name first so the profile can be auto-filled.', 'warning');
      return null;
    }
    form.dataset.bandProfileBusy = '1';
    setBandFormStatus('Fetching enrichment data for ' + current.bandName + '…', 'info');
    try {
      var enriched = await enrichBandProfileData(current);
      var bandKey = current.bandName;
      if (safeOptions.silent || safeOptions.noPreview) {
        // Direct apply (used by auto-fill-on-open for new bands with no existing values)
        patchBandFormWithPrefill(form, enriched, bandKey, { trackUndo: !safeOptions.silent });
        var fieldMetaInput = form.querySelector('input[name="fieldProvenanceJson"]');
        if (fieldMetaInput) fieldMetaInput.value = JSON.stringify(enriched.fieldProvenance || {});
        applyBandFormFieldTooltips(form);
        updateAutoFillButtonBadge(form, 0);
        setBandFormStatus('Profile filled in. Review and save when ready.', 'success');
      } else {
        // Show change preview so the user can pick what to apply
        var diffs = buildFieldChangeDiff(form, enriched, bandKey);
        updateAutoFillButtonBadge(form, diffs.length);
        if (!diffs.length) {
          setBandFormStatus('Auto-fill found no new data — all fields are already up to date.', 'info');
        } else {
          mountChangePreviewInForm(form, diffs, enriched, bandKey);
          setBandFormStatus(diffs.length + ' update' + (diffs.length !== 1 ? 's' : '') + ' ready — review and click Apply Selected below.', 'success');
        }
      }
      if (!safeOptions.silent) setStatus('Auto-fill complete for ' + current.bandName + '.', 'success');
      return enriched;
    } catch (error) {
      setBandFormStatus(error && error.message ? error.message : 'Auto-fill could not find band details right now.', 'warning');
      if (!safeOptions.silent) setStatus(error && error.message ? error.message : 'Band profile auto-fill failed.', 'warning');
      return null;
    } finally {
      form.dataset.bandProfileBusy = '0';
    }
  }

  // ===== CHANGE PREVIEW HELPERS =====

  var PREFILL_TO_FORM_NAME = {
    bandName: 'Band_Name', bandMembers: 'Band_Members', bandLogoUrl: 'Band_Logo_URL',
    bandCoverPhotoUrl: 'Band_Cover_Photo_URL', origin: 'Origin', founded: 'Founded',
    recordLabel: 'Record_Label', discography: 'Discography', topSongs: 'Top_Songs',
    associatedGenres: 'Associated_Genres', websiteUrl: 'Website_URL', tourPageUrl: 'Tour_Page_URL',
    facebookUrl: 'Facebook_URL', instagramUrl: 'Instagram_URL', youTubeUrl: 'YouTube_URL',
    setlistUrl: 'Setlist.fm_URL', bandsintownUrl: 'Bandsintown_URL', wikipediaUrl: 'Wikipedia_URL'
  };

  function buildFieldChangeDiff(form, enriched, bandKey) {
    var diffs = [];
    Object.keys(PREFILL_TO_FORM_NAME).forEach(function (prefillKey) {
      var field = form.querySelector('[name="' + PREFILL_TO_FORM_NAME[prefillKey] + '"]');
      if (!field) return;
      var oldVal = String(field.value || '').trim();
      var newVal = String(enriched[prefillKey] || '').trim();
      if (!newVal || oldVal === newVal) return;
      var locked = isBandFieldLocked(bandKey, prefillKey);
      var provenance = enriched.fieldProvenance && enriched.fieldProvenance[prefillKey] ? enriched.fieldProvenance[prefillKey] : {};
      var conflictOptions = enriched.conflicts && enriched.conflicts[prefillKey] ? enriched.conflicts[prefillKey] : [];
      diffs.push({
        prefillKey: prefillKey,
        formName: PREFILL_TO_FORM_NAME[prefillKey],
        label: BAND_PROFILE_FIELD_LABELS[prefillKey] || prefillKey,
        oldVal: oldVal,
        newVal: newVal,
        locked: locked,
        confidence: provenance.confidence || enriched.enrichmentConfidence || '',
        sources: Array.isArray(provenance.sources) ? provenance.sources : [],
        conflictOptions: Array.isArray(conflictOptions) ? conflictOptions : []
      });
    });
    return diffs;
  }

  function renderChangePreviewInForm(diffs, bandKey) {
    var unlockedCount = diffs.filter(function (d) { return !d.locked; }).length;
    var lockedCount = diffs.length - unlockedCount;
    return '<div id="householdConcertsChangePreview" class="household-concerts-change-preview">'
      + '<div class="change-preview-header">'
      + '<strong>✨ ' + diffs.length + ' field update' + (diffs.length !== 1 ? 's' : '') + ' available</strong>'
      + '<span class="household-concerts-muted">' + unlockedCount + ' will apply · ' + lockedCount + ' locked</span>'
      + '</div>'
      + '<div class="household-concerts-change-diff-list">'
      + diffs.map(function (diff) {
        var tone = confidenceTone(diff.confidence);
        var sourceBadges = diff.sources.map(renderSourceIcon).join('');
        return '<article class="household-concerts-diff-item' + (diff.locked ? ' is-locked' : '') + '" data-diff-field="' + escapeHtml(diff.prefillKey) + '">'
          + '<div class="diff-item-top">'
          + '<label class="diff-check-label">'
          + '<input type="checkbox" class="diff-checkbox" data-diff-key="' + escapeHtml(diff.prefillKey) + '"' + (!diff.locked ? ' checked' : ' disabled') + '>'
          + '<span class="diff-field-name">' + escapeHtml(diff.label) + '</span>'
          + '</label>'
          + '<div class="diff-item-badges">'
          + (sourceBadges ? sourceBadges : '')
          + (diff.confidence ? '<em class="household-concerts-refresh-confidence household-concerts-refresh-confidence--' + escapeHtml(tone) + '">' + escapeHtml(diff.confidence) + '</em>' : '')
          + '</div>'
          + renderFieldLockBtn(bandKey, diff.prefillKey, 'toggle-preview-field-lock')
          + '</div>'
          + '<div class="diff-item-values">'
          + '<div class="diff-old">' + (diff.oldVal ? escapeHtml(safeTruncate(diff.oldVal, 100)) : '<em class="diff-empty">empty</em>') + '</div>'
          + '<div class="diff-arrow">→</div>'
          + '<div class="diff-new">' + escapeHtml(safeTruncate(diff.newVal, 100)) + '</div>'
          + '</div>'
          + (diff.conflictOptions && diff.conflictOptions.length > 1
            ? ('<div class="household-concerts-conflict-picker-row"><label>Choose one</label><select class="household-concerts-conflict-picker" data-diff-conflict-key="' + escapeHtml(diff.prefillKey) + '">' + diff.conflictOptions.map(function (option) {
              return '<option value="' + escapeHtml(option.value) + '"' + (normalizeText(option.value) === normalizeText(diff.newVal) ? ' selected' : '') + '>' + escapeHtml(option.value + ' (' + sourceLabelFromKey(option.sourceKey || '') + ')') + '</option>';
            }).join('') + '</select></div>')
            : '')
          + '</article>';
      }).join('')
      + '</div>'
      + '<div class="household-concerts-form-actions">'
      + '<button type="button" class="pill-button" data-concert-action="dismiss-change-preview">Dismiss</button>'
      + '<button type="button" class="pill-button pill-button-primary" data-concert-action="apply-change-preview">Apply Selected</button>'
      + '</div>'
      + '</div>';
  }

  function mountChangePreviewInForm(form, diffs, enriched, bandKey) {
    var existing = document.getElementById('householdConcertsChangePreview');
    if (existing) existing.remove();
    state.pendingEnrichmentDiffs = { form: form, enriched: enriched, diffs: diffs, bandKey: bandKey };
    var anchor = form.querySelector('#householdConcertsBandFormStatus');
    if (anchor && anchor.parentElement) {
      anchor.insertAdjacentHTML('afterend', renderChangePreviewInForm(diffs, bandKey));
    }
  }

  function refreshMountedChangePreview() {
    var pending = state.pendingEnrichmentDiffs;
    if (!pending) return;
    var existing = document.getElementById('householdConcertsChangePreview');
    if (!existing) return;
    var rebuildDiffs = buildFieldChangeDiff(pending.form, pending.enriched, pending.bandKey);
    pending.diffs = rebuildDiffs;
    existing.outerHTML = renderChangePreviewInForm(rebuildDiffs, pending.bandKey);
  }

  function applySelectedChangesFromPreview() {
    var pending = state.pendingEnrichmentDiffs;
    if (!pending || !pending.form) return;
    var preview = document.getElementById('householdConcertsChangePreview');
    var checkboxes = preview ? Array.from(preview.querySelectorAll('.diff-checkbox:checked:not(:disabled)')) : [];
    var selectedKeys = new Set(checkboxes.map(function (cb) { return String(cb.getAttribute('data-diff-key') || '').trim(); }));
    var partial = {};
    Object.keys(pending.enriched).forEach(function (key) {
      if (selectedKeys.has(key)) partial[key] = pending.enriched[key];
    });
    var conflictPickers = preview ? Array.from(preview.querySelectorAll('.household-concerts-conflict-picker')) : [];
    conflictPickers.forEach(function (picker) {
      var conflictKey = String(picker.getAttribute('data-diff-conflict-key') || '').trim();
      if (conflictKey && selectedKeys.has(conflictKey)) partial[conflictKey] = String(picker.value || '').trim();
    });
    partial.fieldProvenance = pending.enriched.fieldProvenance;
    patchBandFormWithPrefill(pending.form, partial, pending.bandKey);
    var fieldMetaInput = pending.form.querySelector('input[name="fieldProvenanceJson"]');
    if (fieldMetaInput) fieldMetaInput.value = JSON.stringify(pending.enriched.fieldProvenance || {});
    applyBandFormFieldTooltips(pending.form);
    if (preview) preview.remove();
    state.pendingEnrichmentDiffs = null;
    setBandFormStatus('Applied ' + selectedKeys.size + ' field update' + (selectedKeys.size !== 1 ? 's' : '') + '. Review and save.', 'success');
  }

  function openRefreshPreviewModal(band, enriched) {
    if (!band || !enriched) return;
    var bandKey = band.id || normalizeKey(band.bandName);
    var fields = Object.keys(BAND_PROFILE_FIELD_LABELS);
    var diffs = fields.map(function (prefillKey) {
      var oldVal = String((band[prefillKey] || band[prefillKey === 'associatedGenres' ? 'genres' : '']) || '').trim();
      if (Array.isArray(oldVal)) oldVal = oldVal.join(', ');
      var newVal = String(enriched[prefillKey] || '').trim();
      if (!newVal || oldVal === newVal) return null;
      var locked = isBandFieldLocked(bandKey, prefillKey);
      var provenance = enriched.fieldProvenance && enriched.fieldProvenance[prefillKey] ? enriched.fieldProvenance[prefillKey] : {};
      var conflictOptions = enriched.conflicts && enriched.conflicts[prefillKey] ? enriched.conflicts[prefillKey] : [];
      return {
        prefillKey: prefillKey,
        label: BAND_PROFILE_FIELD_LABELS[prefillKey] || prefillKey,
        oldVal: oldVal,
        newVal: newVal,
        locked: locked,
        confidence: provenance.confidence || enriched.enrichmentConfidence || '',
        sources: Array.isArray(provenance.sources) ? provenance.sources : [],
        conflictOptions: Array.isArray(conflictOptions) ? conflictOptions : []
      };
    }).filter(Boolean);

    var unlockedCount = diffs.filter(function (d) { return !d.locked; }).length;
    openModal(
      '<div class="household-concerts-modal-head"><div><h3>Refresh Preview — ' + escapeHtml(band.bandName) + '</h3>'
      + '<p>' + diffs.length + ' change' + (diffs.length !== 1 ? 's' : '') + ' found · ' + unlockedCount + ' unlocked · ' + (diffs.length - unlockedCount) + ' locked</p>'
      + '</div><button type="button" class="household-concerts-icon-btn" data-concert-action="close-modal">✕</button></div>'
      + '<div class="household-concerts-band-profile household-concerts-change-preview">'
      + (diffs.length
        ? '<p class="household-concerts-muted">Select the fields to apply, toggle locks to protect specific values, then click Apply Selected.</p>'
          + '<div class="household-concerts-change-diff-list">'
          + diffs.map(function (diff) {
            var tone = confidenceTone(diff.confidence);
            var sourceBadges = diff.sources.map(renderSourceIcon).join('');
            return '<article class="household-concerts-diff-item' + (diff.locked ? ' is-locked' : '') + '" data-diff-field="' + escapeHtml(diff.prefillKey) + '">'
              + '<div class="diff-item-top">'
              + '<label class="diff-check-label"><input type="checkbox" class="diff-checkbox" data-diff-key="' + escapeHtml(diff.prefillKey) + '"' + (!diff.locked ? ' checked' : ' disabled') + '>'
              + '<span class="diff-field-name">' + escapeHtml(diff.label) + '</span></label>'
              + '<div class="diff-item-badges">' + (sourceBadges || '') + (diff.confidence ? '<em class="household-concerts-refresh-confidence household-concerts-refresh-confidence--' + escapeHtml(tone) + '">' + escapeHtml(diff.confidence) + '</em>' : '') + '</div>'
              + renderFieldLockBtn(bandKey, diff.prefillKey, 'toggle-refresh-preview-lock')
              + '</div>'
              + '<div class="diff-item-values"><div class="diff-old">' + (diff.oldVal ? escapeHtml(safeTruncate(diff.oldVal, 100)) : '<em class="diff-empty">empty</em>') + '</div><div class="diff-arrow">→</div><div class="diff-new">' + escapeHtml(safeTruncate(diff.newVal, 100)) + '</div></div>'
              + (diff.conflictOptions && diff.conflictOptions.length > 1
                ? ('<div class="household-concerts-conflict-picker-row"><label>Choose one</label><select class="household-concerts-conflict-picker" data-diff-conflict-key="' + escapeHtml(diff.prefillKey) + '">' + diff.conflictOptions.map(function (option) {
                  return '<option value="' + escapeHtml(option.value) + '"' + (normalizeText(option.value) === normalizeText(diff.newVal) ? ' selected' : '') + '>' + escapeHtml(option.value + ' (' + sourceLabelFromKey(option.sourceKey || '') + ')') + '</option>';
                }).join('') + '</select></div>')
                : '')
              + '</article>';
          }).join('')
          + '</div>'
        : '<p class="household-concerts-muted">No new changes found — the profile is already up to date.</p>')
      + '<div class="household-concerts-form-actions">'
      + '<button type="button" class="pill-button" data-concert-action="close-modal">Cancel</button>'
      + (diffs.length ? '<button type="button" class="pill-button pill-button-primary" data-concert-action="apply-refresh-preview" data-band-key="' + escapeHtml(bandKey) + '">Apply Selected</button>' : '')
      + '</div>'
      + '</div>'
    );
    state.pendingEnrichmentDiffs = { band: band, enriched: enriched, diffs: diffs, bandKey: bandKey };
  }

  function renderBandImagePickerCandidates(candidates) {
    var list = Array.isArray(candidates) ? candidates : [];
    if (!list.length) return '<p class="household-concerts-muted">No candidate images found for this band.</p>';
    return '<div class="household-concerts-image-candidate-grid">' + list.map(function (candidate, idx) {
      var coverSelected = state.bandImagePicker && Number(state.bandImagePicker.selectedCoverIndex) === idx;
      var logoSelected = state.bandImagePicker && Number(state.bandImagePicker.selectedLogoIndex) === idx;
      return '<article class="household-concerts-image-candidate-item">'
        + '<img src="' + escapeHtml(safeUrl(candidate.thumbUrl || candidate.url)) + '" alt="Candidate image ' + (idx + 1) + '">'
        + '<div class="household-concerts-image-candidate-meta"><strong>' + escapeHtml(candidate.label || ('Candidate ' + (idx + 1))) + '</strong><span>' + escapeHtml(candidate.source || 'Public source') + '</span></div>'
        + '<div class="household-concerts-form-actions">'
        + '<button type="button" class="pill-button' + (coverSelected ? ' pill-button-primary' : '') + '" data-concert-action="select-band-cover-candidate" data-candidate-index="' + idx + '">' + (coverSelected ? 'Cover Selected' : 'Use as Cover') + '</button>'
        + '<button type="button" class="pill-button' + (logoSelected ? ' pill-button-primary' : '') + '" data-concert-action="select-band-logo-candidate" data-candidate-index="' + idx + '">' + (logoSelected ? 'Logo Selected' : 'Use as Logo') + '</button>'
        + '</div>'
        + '</article>';
    }).join('') + '</div>';
  }

  function openBandImagePickerModal(form, candidates, options) {
    var safeOptions = options && typeof options === 'object' ? options : {};
    var existing = state.bandImagePicker && typeof state.bandImagePicker === 'object' ? state.bandImagePicker : null;
    var formData = form
      ? serializeBandForm(form)
      : (safeOptions.formData && typeof safeOptions.formData === 'object'
        ? Object.assign({}, safeOptions.formData)
        : (existing ? Object.assign({}, existing.formData || {}) : {}));
    var bandName = String(formData.bandName || '').trim();
    var selectedCoverIndex = existing ? Number(existing.selectedCoverIndex) : -1;
    var selectedLogoIndex = existing ? Number(existing.selectedLogoIndex) : -1;
    state.bandImagePicker = {
      bandName: bandName,
      formData: formData,
      sourceType: String(safeOptions.sourceType || (existing && existing.sourceType) || 'form').trim() || 'form',
      sourceBandKey: String(safeOptions.sourceBandKey || (existing && existing.sourceBandKey) || '').trim(),
      candidates: Array.isArray(candidates) ? candidates.slice() : (existing ? (existing.candidates || []).slice() : []),
      selectedCoverIndex: Number.isFinite(selectedCoverIndex) ? selectedCoverIndex : -1,
      selectedLogoIndex: Number.isFinite(selectedLogoIndex) ? selectedLogoIndex : -1
    };
    openModal(
      '<div class="household-concerts-modal-head"><div><h3>Select Band Images</h3><p>Choose a cover and logo, then upload to OneDrive `Band_Photos`.</p></div><button type="button" class="household-concerts-icon-btn" data-concert-action="close-modal">✕</button></div>'
      + '<div class="household-concerts-band-profile">'
      + '<div id="householdConcertsBandImagePickerStatus" class="household-concerts-upload-status household-concerts-upload-status--info">Pick candidate images, or upload/import your own.</div>'
      + renderBandImagePickerCandidates(state.bandImagePicker.candidates)
      + '<div class="household-concerts-band-image-manual-grid">'
      + '<div class="household-concerts-form-row"><label>Upload logo file</label><input id="householdConcertsBandLogoFileInput" type="file" accept="image/*"><button type="button" class="pill-button" data-concert-action="upload-band-logo-file">Upload Logo</button></div>'
      + '<div class="household-concerts-form-row"><label>Upload cover file</label><input id="householdConcertsBandCoverFileInput" type="file" accept="image/*"><button type="button" class="pill-button" data-concert-action="upload-band-cover-file">Upload Cover</button></div>'
      + '<div class="household-concerts-form-row"><label>Import logo from URL</label><input id="householdConcertsBandLogoUrlInput" placeholder="https://..."><button type="button" class="pill-button" data-concert-action="import-band-logo-url">Import Logo URL</button></div>'
      + '<div class="household-concerts-form-row"><label>Import cover from URL</label><input id="householdConcertsBandCoverUrlInput" placeholder="https://..."><button type="button" class="pill-button" data-concert-action="import-band-cover-url">Import Cover URL</button></div>'
      + '</div>'
      + '<div class="household-concerts-form-actions"><button type="button" class="pill-button" data-concert-action="close-modal">Cancel</button><button type="button" class="pill-button pill-button-primary" data-concert-action="apply-band-image-selection">Save Selected to OneDrive</button></div>'
      + '</div>'
    );
  }

  function setBandImagePickerStatus(message, tone) {
    var el = document.getElementById('householdConcertsBandImagePickerStatus');
    if (!el) return;
    el.className = 'household-concerts-upload-status household-concerts-upload-status--' + (tone || 'info');
    el.textContent = String(message || '').trim();
  }

  async function applyBandImageSelection() {
    if (!state.bandImagePicker) return;
    var formData = Object.assign({}, state.bandImagePicker.formData || {});
    var candidates = state.bandImagePicker.candidates || [];
    var coverIdx = Number(state.bandImagePicker.selectedCoverIndex);
    var logoIdx = Number(state.bandImagePicker.selectedLogoIndex);
    var cover = Number.isFinite(coverIdx) && coverIdx >= 0 ? (candidates[coverIdx] || null) : null;
    var logo = Number.isFinite(logoIdx) && logoIdx >= 0 ? (candidates[logoIdx] || null) : null;
    var hasManual = !!(formData.bandCoverPhotoUrl || formData.bandLogoUrl);
    if (!cover && !logo && !hasManual) {
      setBandImagePickerStatus('Select at least one candidate or use manual upload/import first.', 'warning');
      return;
    }
    setBandImagePickerStatus('Uploading selected image(s) to OneDrive...', 'info');
    var bandName = String(formData.bandName || state.bandImagePicker.bandName || '').trim();
    var meta = { bandName: bandName };
    try {
      if (cover && cover.url) {
        var coverUrl = await uploadBandImageFromUrl(cover.url, meta, 'cover');
        formData.bandCoverPhotoUrl = coverUrl;
      }
      if (logo && logo.url) {
        var logoUrl = await uploadBandImageFromUrl(logo.url, meta, 'logo');
        formData.bandLogoUrl = logoUrl;
      }
      if (state.bandImagePicker.sourceType === 'band') {
        var sourceBandKey = String(state.bandImagePicker.sourceBandKey || '').trim();
        var sourceBand = getBandByKey(sourceBandKey);
        if (sourceBand) {
          saveBandProfileOverride(sourceBandKey, {
            bandLogoUrl: formData.bandLogoUrl || sourceBand.bandLogoUrl,
            bandCoverPhotoUrl: formData.bandCoverPhotoUrl || sourceBand.bandCoverPhotoUrl
          });
          state.favoriteBands = state.favoriteBands.map(function (entry) {
            if (entry.id !== sourceBand.id) return entry;
            var merged = Object.assign({}, entry, {
              bandLogoUrl: formData.bandLogoUrl || entry.bandLogoUrl,
              bandCoverPhotoUrl: formData.bandCoverPhotoUrl || entry.bandCoverPhotoUrl
            });
            return applyBandProfileOverride(merged);
          });
        }
        closeModal();
        renderAll();
        openBandDetails(getBandByKey(sourceBandKey));
        setStatus('Band images uploaded to OneDrive `Band_Photos` and applied to ' + (sourceBand ? sourceBand.bandName : 'this band') + '.', 'success');
        return;
      }
      closeModal();
      openBandForm(formData);
      setStatus('Band images uploaded to OneDrive `Band_Photos` and applied to the form.', 'success');
    } catch (error) {
      setBandImagePickerStatus(error && error.message ? error.message : 'Could not upload selected image(s).', 'error');
    }
  }

  async function uploadBandImageFromFileInput(inputId, formFieldName, role) {
    if (!state.bandImagePicker) return;
    var formData = Object.assign({}, state.bandImagePicker.formData || {});
    var input = document.getElementById(inputId);
    var file = input && input.files && input.files[0] ? input.files[0] : null;
    if (!file) {
      setBandImagePickerStatus('Select a file first.', 'warning');
      return;
    }
    setBandImagePickerStatus('Uploading file to OneDrive...', 'info');
    try {
      var url = await uploadBandImageToOneDrive(file, { bandName: String(formData.bandName || state.bandImagePicker.bandName || '').trim() }, role, file.name || 'band-image.jpg');
      if (formFieldName === 'Band_Logo_URL') formData.bandLogoUrl = url;
      if (formFieldName === 'Band_Cover_Photo_URL') formData.bandCoverPhotoUrl = url;
      state.bandImagePicker.formData = formData;
      setBandImagePickerStatus('Uploaded successfully and applied to form.', 'success');
    } catch (error) {
      setBandImagePickerStatus(error && error.message ? error.message : 'Upload failed.', 'error');
    }
  }

  async function importBandImageFromUrlInput(inputId, formFieldName, role) {
    if (!state.bandImagePicker) return;
    var formData = Object.assign({}, state.bandImagePicker.formData || {});
    var input = document.getElementById(inputId);
    var rawUrl = String((input || {}).value || '').trim();
    if (!rawUrl) {
      setBandImagePickerStatus('Enter an image URL first.', 'warning');
      return;
    }
    setBandImagePickerStatus('Downloading image URL and uploading to OneDrive...', 'info');
    try {
      var uploadedUrl = await uploadBandImageFromUrl(rawUrl, { bandName: String(formData.bandName || state.bandImagePicker.bandName || '').trim() }, role);
      if (formFieldName === 'Band_Logo_URL') formData.bandLogoUrl = uploadedUrl;
      if (formFieldName === 'Band_Cover_Photo_URL') formData.bandCoverPhotoUrl = uploadedUrl;
      state.bandImagePicker.formData = formData;
      setBandImagePickerStatus('Imported URL and uploaded successfully.', 'success');
    } catch (error) {
      setBandImagePickerStatus(error && error.message ? error.message : 'Could not import image URL.', 'error');
    }
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
      '<div class="household-concerts-modal-head"><div><h3>Add Favorite Band</h3><p data-band-form-source>' + escapeHtml(data.sourceLabel || 'Use search results or fill this out manually. Any fields you leave blank can be enriched later.') + '</p></div><button type="button" class="household-concerts-icon-btn" data-concert-action="close-modal">✕</button></div>'
      + '<form id="householdConcertsBandForm" class="household-concerts-form">'
      + '<input type="hidden" name="sourceLabel" value="' + escapeHtml(data.sourceLabel || '') + '">'
      + '<input type="hidden" name="enrichmentConfidence" value="' + escapeHtml(data.enrichmentConfidence || '') + '">'
      + '<input type="hidden" name="sourceKeys" value="' + escapeHtml(Array.isArray(data.sourceKeys) ? data.sourceKeys.join(',') : (data.sourceKeys || '')) + '">'
      + '<input type="hidden" name="fieldProvenanceJson" value="' + escapeHtml(typeof data.fieldProvenanceJson === 'string' ? data.fieldProvenanceJson : JSON.stringify(data.fieldProvenance || {})) + '">'
      + '<div class="household-concerts-form-actions" style="justify-content:flex-start;margin-top:-4px;">'
      + '<button type="button" class="pill-button" data-concert-action="auto-fill-band-profile">✨ Auto-fill Profile</button>'
      + '<button type="button" class="pill-button" data-concert-action="open-band-image-picker">🖼 Find Photos</button>'
      + '<div id="householdConcertsBandFormStatus" class="household-concerts-upload-status household-concerts-upload-status--info">Enter a band name and use Auto-fill Profile to pull public metadata.</div>'
      + '</div>'
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
    var bandForm = document.getElementById('householdConcertsBandForm');
    if (bandForm) {
      bandForm.dataset.userTouchedFields = '';
      applyBandFormFieldTooltips(bandForm);
      updateAutoFillButtonBadge(bandForm, 0);
    }
    if (data.bandName && normalizeConcertSettings(state.settings).autoFillOnOpen) {
      global.setTimeout(function () {
        var form = document.getElementById('householdConcertsBandForm');
        if (form) autoFillBandForm(form, { silent: true });
      }, 0);
    }
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

  function openConcertSettingsModal() {
    var settings = normalizeConcertSettings(state.settings);
    var writeAuditEnabled = isBackendWriteAuditEnabled();
    openModal(
      '<div class="household-concerts-modal-head"><div><h3>Concert Settings</h3><p>Set your home base and enrichment preferences for band profiles.</p></div><button type="button" class="household-concerts-icon-btn" data-concert-action="close-modal">✕</button></div>'
      + '<form id="householdConcertsSettingsForm" class="household-concerts-form">'
      + '<div class="household-concerts-form-row"><label>Home Base</label>'
      + '<div class="household-concerts-settings-stack">'
      + '<label><input type="radio" name="homeBaseMode" value="hendersonville"' + (settings.homeBaseMode === 'hendersonville' ? ' checked' : '') + '> Hendersonville, NC USA (default)</label>'
      + '<label><input type="radio" name="homeBaseMode" value="follow-user"' + (settings.homeBaseMode === 'follow-user' ? ' checked' : '') + '> Use saved/current location</label>'
      + '</div></div>'
      + '<div class="household-concerts-form-row"><label>Auto-fill Behavior</label>'
      + '<div class="household-concerts-settings-stack">'
      + '<label><input type="checkbox" name="autoFillOnOpen" value="1"' + (settings.autoFillOnOpen ? ' checked' : '') + '> Auto-fill profile when opening Add Favorite Band from search</label>'
      + '<label><input type="checkbox" name="backendWriteAudit" value="1"' + (writeAuditEnabled ? ' checked' : '') + '> Enable backend write audit logs (debug field-to-column mapping)</label>'
      + '<p class="household-concerts-debug-tip">Debug tip: open browser DevTools console and look for <strong>[Concerts Write Audit]</strong> entries after saving records.</p>'
      + '</div></div>'
      + '<div class="household-concerts-form-row"><label>Enrichment Sources</label>'
      + '<div class="household-concerts-settings-stack">'
      + '<label><input type="checkbox" name="source_apple" value="1"' + (settings.enrichmentSources.apple ? ' checked' : '') + '> Apple Music metadata</label>'
      + '<label><input type="checkbox" name="source_musicbrainz" value="1"' + (settings.enrichmentSources.musicbrainz ? ' checked' : '') + '> MusicBrainz metadata</label>'
      + '<label><input type="checkbox" name="source_wikipedia" value="1"' + (settings.enrichmentSources.wikipedia ? ' checked' : '') + '> Wikipedia link</label>'
      + '<label><input type="checkbox" name="source_bandsintown" value="1"' + (settings.enrichmentSources.bandsintown ? ' checked' : '') + '> Bandsintown artist mapping</label>'
      + '<label><input type="checkbox" name="source_members" value="1"' + (settings.enrichmentSources.members ? ' checked' : '') + '> Band members + roles</label>'
      + '</div></div>'
      + '<div class="household-concerts-form-actions"><button type="button" class="pill-button" data-concert-action="close-modal">Cancel</button><button type="submit" class="pill-button pill-button-primary">Save Settings</button></div>'
      + '</form>'
    );
  }

  function saveConcertSettingsFromForm(form) {
    if (!form) return;
    var next = normalizeConcertSettings({
      homeBaseMode: String((form.querySelector('[name="homeBaseMode"]:checked') || {}).value || 'hendersonville').trim(),
      autoFillOnOpen: !!form.querySelector('[name="autoFillOnOpen"]:checked'),
      enrichmentSources: {
        apple: !!form.querySelector('[name="source_apple"]:checked'),
        musicbrainz: !!form.querySelector('[name="source_musicbrainz"]:checked'),
        wikipedia: !!form.querySelector('[name="source_wikipedia"]:checked'),
        bandsintown: !!form.querySelector('[name="source_bandsintown"]:checked'),
        members: !!form.querySelector('[name="source_members"]:checked')
      }
    });

    if (!next.enrichmentSources.apple && !next.enrichmentSources.musicbrainz && !next.enrichmentSources.wikipedia) {
      setStatus('Enable at least one core enrichment source (Apple Music, MusicBrainz, or Wikipedia).', 'warning');
      return;
    }

    saveConcertSettings(next);
    setBackendWriteAuditEnabled(!!form.querySelector('[name="backendWriteAudit"]:checked'));
    if (next.homeBaseMode === 'hendersonville') {
      resetConcertsLocationToDefault();
    } else {
      setConcertsLocationMode('follow-user');
      setStatus('Concert settings saved. Capturing your current location…', 'info');
      captureUserLocation();
    }
    closeModal();
  }

  function openBandDetails(band) {
    if (!band) return;
    var stats = computeBandStats(band.id);
    var similar = computeSimilarBands(band);
    var recommendations = Array.isArray(state.discoveryCache[normalizeKey(band.bandName)]) ? state.discoveryCache[normalizeKey(band.bandName)] : [];
    var enrichmentBadge = renderBandEnrichmentBadge(band);
    openModal(
      '<div class="household-concerts-modal-head"><div><h3>' + escapeHtml(band.bandName) + '</h3><p>' + escapeHtml(band.origin || 'Origin not set') + ' • ' + escapeHtml(band.founded || 'Founded date not set') + '</p></div><button type="button" class="household-concerts-icon-btn" data-concert-action="close-modal">✕</button></div>'
      + '<div class="household-concerts-band-profile">'
      + (band.bandCoverPhotoUrl ? '<img class="household-concerts-band-profile-cover" src="' + escapeHtml(safeUrl(band.bandCoverPhotoUrl)) + '" alt="' + escapeHtml(band.bandName) + ' cover image">' : '')
      + '<div class="household-concerts-band-profile-head">'
      + (band.bandLogoUrl ? '<img class="household-concerts-band-profile-logo" src="' + escapeHtml(safeUrl(band.bandLogoUrl)) + '" alt="' + escapeHtml(band.bandName) + ' logo">' : '<div class="household-concerts-band-profile-logo household-concerts-band-logo--placeholder">🎵</div>')
      + '<div>'
      + '<div class="household-concerts-band-stats">' + statPill('Seen', String(stats.attendedCount)) + statPill('Upcoming', String(stats.upcomingCount)) + statPill('Average', stats.averageRating ? stats.averageRating.toFixed(1) + '★' : '—') + '</div>'
      + (band.genres.length ? '<div class="household-concerts-tag-row">' + band.genres.map(renderTag).join('') + '</div>' : '')
      + enrichmentBadge
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
      + '<div><h4>Similar favorite bands</h4>' + (similar.length ? '<div class="household-concerts-similar-list">' + similar.map(function (entry) {
        var candidate = entry.band;
        return '<button type="button" class="household-concerts-similar-item" data-concert-action="open-band-details" data-band-key="' + escapeHtml(candidate.id) + '">'
          + (candidate.bandLogoUrl ? '<img class="household-concerts-similar-logo" src="' + escapeHtml(safeUrl(candidate.bandLogoUrl)) + '" alt="' + escapeHtml(candidate.bandName) + ' logo">' : '<span class="household-concerts-similar-logo household-concerts-band-logo--placeholder">🎵</span>')
          + '<span><strong>' + escapeHtml(candidate.bandName) + '</strong><em>' + escapeHtml((candidate.genres || []).slice(0, 3).join(', ') || candidate.origin || 'Shared style') + '</em></span>'
          + '</button>';
      }).join('') + '</div>' : '<p class="household-concerts-muted">No close matches among current favorites yet.</p>') + '</div>'
      + '<div><h4>Recommended bands to add</h4>' + (recommendations.length
        ? '<div class="household-concerts-recommended-list">' + recommendations.map(function (entry) {
          return '<label class="household-concerts-recommended-item"><input type="checkbox" name="householdConcertsRecommendedBand" value="' + escapeHtml(entry.id) + '" data-band-key="' + escapeHtml(band.id) + '"><div><strong>' + escapeHtml(entry.bandName) + '</strong><span>' + escapeHtml(entry.reason || entry.genreText || 'Related recommendation') + '</span></div><button type="button" class="pill-button" data-concert-action="quick-add-recommended-band" data-discovery-id="' + escapeHtml(entry.id) + '" data-band-key="' + escapeHtml(band.id) + '">Add</button></label>';
        }).join('') + '</div><div class="household-concerts-form-actions"><button type="button" class="pill-button" data-concert-action="add-selected-recommended" data-band-key="' + escapeHtml(band.id) + '">Add Selected</button></div>'
        : '<p class="household-concerts-muted">Refresh discovery to pull additional artist suggestions.</p>')
      + '</div>'
      + '</div>'
      + '<div class="household-concerts-form-actions"><button type="button" class="pill-button" data-concert-action="open-log-concert" data-band-key="' + escapeHtml(band.id) + '">Log Concert</button><button type="button" class="pill-button" data-concert-action="open-add-upcoming" data-band-key="' + escapeHtml(band.id) + '">Add Upcoming</button><button type="button" class="pill-button" data-concert-action="open-band-image-picker" data-band-key="' + escapeHtml(band.id) + '">Manage Photos</button><button type="button" class="pill-button" data-concert-action="refresh-band-profile" data-band-key="' + escapeHtml(band.id) + '">↻ Refresh Profile</button><button type="button" class="pill-button" data-concert-action="refresh-discovery" data-band-key="' + escapeHtml(band.id) + '">Refresh Discovery</button></div>'
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

  function buildFieldValuesSnapshotFromRecord(record) {
    var source = record && typeof record === 'object' ? record : {};
    return {
      bandName: String(source.Band_Name || '').trim(),
      bandMembers: String(source.Band_Members || '').trim(),
      bandLogoUrl: String(source.Band_Logo_URL || '').trim(),
      bandCoverPhotoUrl: String(source.Band_Cover_Photo_URL || '').trim(),
      origin: String(source.Origin || '').trim(),
      founded: String(source.Founded || '').trim(),
      recordLabel: String(source.Record_Label || source['Record _Label'] || '').trim(),
      discography: String(source.Discography || '').trim(),
      topSongs: String(source.Top_Songs || '').trim(),
      associatedGenres: String(source.Associated_Genres || '').trim(),
      websiteUrl: String(source.Website_URL || '').trim(),
      tourPageUrl: String(source.Tour_Page_URL || '').trim(),
      facebookUrl: String(source.Facebook_URL || '').trim(),
      instagramUrl: String(source.Instagram_URL || '').trim(),
      youTubeUrl: String(source.YouTube_URL || '').trim(),
      setlistUrl: String(source['Setlist.fm_URL'] || '').trim(),
      bandsintownUrl: String(source.Bandsintown_URL || '').trim(),
      wikipediaUrl: String(source.Wikipedia_URL || '').trim()
    };
  }

  async function saveFavoriteBand(form) {
    var record = serializeForm(form);
    var touchedKeys = uniqueStrings(String(form && form.dataset && form.dataset.userTouchedFields || '').split(',').map(function (item) { return String(item || '').trim(); }).filter(Boolean));
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
      if (!record.Bandsintown_URL || isGenericBandsintownSearchUrl(record.Bandsintown_URL)) {
        record.Bandsintown_URL = await resolveBandsintownArtistUrl(bandName, record.Bandsintown_URL || '');
      }
      var workbookPath = await findWorkbookPath();
      await appendRecordToTable(workbookPath, FAVORITE_TABLE, record);
      if (record.sourceLabel || touchedKeys.length) {
        var sourceKeys = uniqueStrings(String(record.sourceKeys || '').split(',').map(function (part) { return normalizeText(part); }).filter(Boolean));
        var fieldProvenance = normalizeFieldProvenanceMap((function () {
          try {
            return record.fieldProvenanceJson ? JSON.parse(record.fieldProvenanceJson) : {};
          } catch (_error) {
            return {};
          }
        })());
        touchedKeys.forEach(function (fieldKey) {
          fieldProvenance[fieldKey] = {
            confidence: 'high',
            sources: ['user'],
            updatedAt: Date.now()
          };
        });
        saveBandProfileMeta(bandName, {
          lastEnrichedFrom: String(record.sourceLabel || (touchedKeys.length ? 'user' : '')).replace(/^Auto-filled from\s+/i, '').trim(),
          lastEnrichedAt: Date.now(),
          enrichmentConfidence: String(record.enrichmentConfidence || (touchedKeys.length ? 'high' : '')).trim(),
          sources: sourceKeys,
          fieldProvenance: fieldProvenance,
          fieldValues: buildFieldValuesSnapshotFromRecord(record)
        });
      }
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

  function buildFavoriteRecordFromPrefill(prefill) {
    var safePrefill = prefill && typeof prefill === 'object' ? prefill : {};
    return {
      Band_Name: String(safePrefill.bandName || '').trim(),
      Band_Members: String(safePrefill.bandMembers || '').trim(),
      Band_Logo_URL: String(safePrefill.bandLogoUrl || '').trim(),
      Band_Cover_Photo_URL: String(safePrefill.bandCoverPhotoUrl || '').trim(),
      Origin: String(safePrefill.origin || '').trim(),
      Founded: String(safePrefill.founded || '').trim(),
      Record_Label: String(safePrefill.recordLabel || '').trim(),
      Discography: String(safePrefill.discography || '').trim(),
      Top_Songs: String(safePrefill.topSongs || '').trim(),
      Associated_Genres: String(safePrefill.associatedGenres || '').trim(),
      Website_URL: String(safePrefill.websiteUrl || '').trim(),
      Tour_Page_URL: String(safePrefill.tourPageUrl || '').trim(),
      Facebook_URL: String(safePrefill.facebookUrl || '').trim(),
      Instagram_URL: String(safePrefill.instagramUrl || '').trim(),
      YouTube_URL: String(safePrefill.youTubeUrl || '').trim(),
      'Setlist.fm_URL': String(safePrefill.setlistUrl || '').trim(),
      Bandsintown_URL: String(safePrefill.bandsintownUrl || '').trim(),
      Wikipedia_URL: String(safePrefill.wikipediaUrl || '').trim(),
      sourceLabel: String(safePrefill.sourceLabel || '').trim(),
      enrichmentConfidence: String(safePrefill.enrichmentConfidence || '').trim(),
      sourceKeys: Array.isArray(safePrefill.sourceKeys) ? safePrefill.sourceKeys.join(',') : String(safePrefill.sourceKeys || ''),
      fieldProvenanceJson: JSON.stringify(safePrefill.fieldProvenance || {})
    };
  }

  function removeFavoriteBandByName(bandName) {
    var key = normalizeKey(bandName);
    var next = state.favoriteBands.filter(function (item) {
      return normalizeKey(item.bandName) !== key;
    });
    state.favoriteBands = next;
    if (!getBandByKey(state.activeBandKey)) {
      state.activeBandKey = next[0] ? next[0].id : '';
    }
  }

  async function persistRecommendedBandRecord(record, options) {
    var safeOptions = options && typeof options === 'object' ? options : {};
    var bandName = String(record.Band_Name || '').trim();
    if (!bandName) return false;
    try {
      if (!record.Bandsintown_URL || isGenericBandsintownSearchUrl(record.Bandsintown_URL)) {
        record.Bandsintown_URL = await resolveBandsintownArtistUrl(bandName, record.Bandsintown_URL || '');
      }
      var workbookPath = await findWorkbookPath();
      await appendRecordToTable(workbookPath, FAVORITE_TABLE, record);
      if (record.sourceLabel) {
        var sourceKeys = uniqueStrings(String(record.sourceKeys || '').split(',').map(function (part) { return normalizeText(part); }).filter(Boolean));
        var fieldProvenance = normalizeFieldProvenanceMap((function () {
          try {
            return record.fieldProvenanceJson ? JSON.parse(record.fieldProvenanceJson) : {};
          } catch (_error) {
            return {};
          }
        })());
        saveBandProfileMeta(bandName, {
          lastEnrichedFrom: String(record.sourceLabel || '').replace(/^Auto-filled from\s+/i, '').trim(),
          lastEnrichedAt: Date.now(),
          enrichmentConfidence: String(record.enrichmentConfidence || '').trim(),
          sources: sourceKeys,
          fieldProvenance: fieldProvenance,
          fieldValues: buildFieldValuesSnapshotFromRecord(record)
        });
      }
      if (!safeOptions.skipLocalInsert) {
        state.favoriteBands.unshift(parseFavoriteBand(record));
        state.favoriteBands = state.favoriteBands.filter(Boolean).sort(function (a, b) { return a.bandName.localeCompare(b.bandName); });
        renderAll();
      }
      if (!safeOptions.silent) setStatus('Added ' + bandName + ' to Favorite Bands.', 'success');
      return true;
    } catch (error) {
      console.error('❌ Could not add recommended band:', error);
      if (!safeOptions.silent) setStatus(error && error.message ? error.message : 'Could not add recommended band.', 'error');
      return false;
    }
  }

  function undoRecommendedAdd(token) {
    var key = String(token || '').trim();
    var pending = state.pendingRecommendationAdds[key];
    if (!pending) return;
    try {
      global.clearTimeout(pending.timeoutId);
    } catch (_error) {
      // Ignore clear timeout failures.
    }
    delete state.pendingRecommendationAdds[key];
    if (state.recommendationToast && state.recommendationToast.token === key) {
      state.recommendationToast = null;
    }
    removeFavoriteBandByName(pending.bandName);
    renderAll();
    setStatus('Undid add from recommendations for ' + pending.bandName + '.', 'success');
  }

  function queueRecommendedAddWithUndo(record, options) {
    var safeOptions = options && typeof options === 'object' ? options : {};
    var bandName = String(record.Band_Name || '').trim();
    if (!bandName) return false;
    var parsed = parseFavoriteBand(record);
    if (!parsed) return false;

    state.favoriteBands.unshift(parsed);
    state.favoriteBands = state.favoriteBands.filter(Boolean).sort(function (a, b) { return a.bandName.localeCompare(b.bandName); });
    var token = 'rec-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    var timeoutMs = Math.max(2000, Number(safeOptions.undoMs || 7000));
    var timeoutId = global.setTimeout(function () {
      var pending = state.pendingRecommendationAdds[token];
      if (!pending) return;
      delete state.pendingRecommendationAdds[token];
      if (state.recommendationToast && state.recommendationToast.token === token) state.recommendationToast = null;
      persistRecommendedBandRecord(pending.record, { silent: true, skipLocalInsert: true }).then(function (saved) {
        if (!saved) {
          removeFavoriteBandByName(pending.bandName);
          renderAll();
          setStatus('Could not complete add for ' + pending.bandName + '. It has been removed from favorites.', 'error');
          return;
        }
        setStatus('Added ' + pending.bandName + ' to Favorite Bands.', 'success');
        renderAll();
      });
    }, timeoutMs);

    state.pendingRecommendationAdds[token] = {
      token: token,
      bandName: bandName,
      record: Object.assign({}, record),
      timeoutId: timeoutId
    };
    state.recommendationToast = { token: token, bandName: bandName };
    setStatus('Added from recommendations. Undo if this was a mistake.', 'info');
    renderAll();
    return true;
  }

  async function addFavoriteBandFromPrefill(prefill, options) {
    var safePrefill = prefill && typeof prefill === 'object' ? prefill : {};
    var safeOptions = options && typeof options === 'object' ? options : {};
    var bandName = String(safePrefill.bandName || '').trim();
    if (!bandName) return false;
    if (state.favoriteBands.some(function (band) { return normalizeText(band.bandName) === normalizeText(bandName); })) {
      if (!safeOptions.silent) setStatus('Skipped ' + bandName + ' because it is already in your favorite list.', 'warning');
      return false;
    }

    var record = buildFavoriteRecordFromPrefill(safePrefill);
    if (safeOptions.withUndoToast) {
      return queueRecommendedAddWithUndo(record, safeOptions);
    }
    return persistRecommendedBandRecord(record, safeOptions);
  }

  async function refreshSavedBandProfile(band, options) {
    if (!band) return null;
    var safeOptions = options && typeof options === 'object' ? options : {};
    var bandKey = band.id || band.bandName;
    setStatus('Refreshing band profile for ' + band.bandName + '…', 'info');
    try {
      var enriched = await enrichBandProfileData(mapBandToPrefillShape(band));
      if (safeOptions.noPreview) {
        // Direct apply (old behaviour, used from band cards Refresh Profile button)
        saveBandProfileOverride(bandKey, enriched);
        saveBandProfileMeta(bandKey, {
          lastEnrichedFrom: String(enriched.sourceLabel || '').replace(/^Auto-filled from\s+/i, '').trim() || 'public metadata',
          lastEnrichedAt: Date.now(),
          enrichmentConfidence: String(enriched.enrichmentConfidence || '').trim(),
          sources: Array.isArray(enriched.sourceKeys) ? enriched.sourceKeys : inferSourceKeysFromLabel(enriched.sourceLabel || ''),
          fieldProvenance: normalizeFieldProvenanceMap(enriched.fieldProvenance || {}),
          fieldValues: enriched
        });
        state.favoriteBands = state.favoriteBands.map(function (entry) {
          if (entry.id !== band.id) return entry;
          return applyBandProfileOverride(Object.assign({}, entry));
        });
        renderAll();
        setStatus('Band profile refreshed for ' + band.bandName + '.', 'success');
      } else {
        // Show preview so user can pick what to keep
        openRefreshPreviewModal(band, enriched);
        setStatus('Review the ' + (enriched ? 'enrichment' : '') + ' changes for ' + band.bandName + ' before applying.', 'info');
      }
      return enriched;
    } catch (error) {
      console.error('❌ Could not refresh band profile:', error);
      setStatus(error && error.message ? error.message : 'Could not refresh band profile.', 'warning');
      return null;
    }
  }

  async function applyRefreshPreview() {
    var pending = state.pendingEnrichmentDiffs;
    if (!pending || !pending.band || !pending.enriched) return;
    var modal = document.querySelector('.household-concerts-modal');
    var checkboxes = modal ? Array.from(modal.querySelectorAll('.diff-checkbox:checked:not(:disabled)')) : [];
    var selectedKeys = new Set(checkboxes.map(function (cb) { return String(cb.getAttribute('data-diff-key') || '').trim(); }));
    var partial = {};
    Object.keys(pending.enriched).forEach(function (key) {
      if (selectedKeys.has(key)) partial[key] = pending.enriched[key];
    });
    var conflictPickers = modal ? Array.from(modal.querySelectorAll('.household-concerts-conflict-picker')) : [];
    conflictPickers.forEach(function (picker) {
      var conflictKey = String(picker.getAttribute('data-diff-conflict-key') || '').trim();
      if (conflictKey && selectedKeys.has(conflictKey)) partial[conflictKey] = String(picker.value || '').trim();
    });
    var patchedBand = Object.assign({}, pending.band, partial);
    var bandKey = pending.band.id || normalizeKey(pending.band.bandName);
    saveBandProfileOverride(bandKey, patchedBand);
    saveBandProfileMeta(bandKey, {
      lastEnrichedFrom: String(pending.enriched.sourceLabel || '').replace(/^Auto-filled from\s+/i, '').trim() || 'public metadata',
      lastEnrichedAt: Date.now(),
      enrichmentConfidence: String(pending.enriched.enrichmentConfidence || '').trim(),
      sources: Array.isArray(pending.enriched.sourceKeys) ? pending.enriched.sourceKeys : inferSourceKeysFromLabel(pending.enriched.sourceLabel || ''),
      fieldProvenance: normalizeFieldProvenanceMap(pending.enriched.fieldProvenance || {}),
      fieldValues: patchedBand
    });
    state.favoriteBands = state.favoriteBands.map(function (entry) {
      if (entry.id !== pending.band.id) return entry;
      return applyBandProfileOverride(Object.assign({}, entry));
    });
    state.pendingEnrichmentDiffs = null;
    closeModal();
    setStatus('Applied ' + selectedKeys.size + ' field update' + (selectedKeys.size !== 1 ? 's' : '') + ' to ' + pending.band.bandName + '.', 'success');
    renderAll();
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

   // ===== ENHANCEMENT: VENUE PERFORMANCE ANALYTICS =====
   function getVenueStats() {
     var stats = {};
     state.attendedConcerts.forEach(function (concert) {
       var venue = concert.venue || 'Unknown Venue';
       if (!stats[venue]) {
         stats[venue] = { count: 0, totalRating: 0, bands: new Set(), distanceSum: 0 };
       }
       stats[venue].count += 1;
       stats[venue].totalRating += Number(concert.rating) || 0;
       stats[venue].bands.add(concert.bandName);
     });
     Object.keys(stats).forEach(function (venue) {
       stats[venue].averageRating = stats[venue].totalRating / stats[venue].count;
       stats[venue].bandCount = stats[venue].bands.size;
       stats[venue].bands = Array.from(stats[venue].bands);
     });
     return stats;
   }

   function renderVenuePerformance() {
     var container = document.getElementById('householdConcertsVenueReport');
     if (!container) return;
     var stats = getVenueStats();
     var venues = Object.entries(stats).sort(function (a, b) { return b[1].count - a[1].count; }).slice(0, 8);
     if (!venues.length) {
       container.innerHTML = '<div class="household-concerts-empty"><strong>No venues yet</strong><p>Log concerts to see venue performance data.</p></div>';
       return;
     }
     container.innerHTML = venues.map(function (entry) {
       var venueName = entry[0];
       var data = entry[1];
       return '<article class="household-concerts-venue-card">'
         + '<div class="household-concerts-venue-header"><h4>' + escapeHtml(venueName) + '</h4></div>'
         + '<div class="household-concerts-venue-stats">'
         + '<div class="stat"><span>Concerts</span><strong>' + data.count + '</strong></div>'
         + '<div class="stat"><span>Avg Rating</span><strong>' + (data.averageRating ? data.averageRating.toFixed(1) + '★' : '—') + '</strong></div>'
         + '<div class="stat"><span>Bands</span><strong>' + data.bandCount + '</strong></div>'
         + '</div>'
         + '</article>';
     }).join('');
   }

   // ===== ENHANCEMENT: SMART TAGGING SYSTEM =====
   function getBandTags(bandName) {
     var key = normalizeKey(bandName);
     return Array.isArray(state.bandTags[key]) ? state.bandTags[key] : [];
   }

   function saveBandTag(bandName, tag) {
     var key = normalizeKey(bandName);
     if (!state.bandTags[key]) state.bandTags[key] = [];
     if (state.bandTags[key].indexOf(tag) < 0) state.bandTags[key].push(tag);
     writeJsonStorage('householdConcertsBandTagsV1', state.bandTags);
   }

   function removeBandTag(bandName, tag) {
     var key = normalizeKey(bandName);
     if (Array.isArray(state.bandTags[key])) {
       var idx = state.bandTags[key].indexOf(tag);
       if (idx >= 0) state.bandTags[key].splice(idx, 1);
       writeJsonStorage('householdConcertsBandTagsV1', state.bandTags);
     }
   }

   function renderBandTagsUI(band) {
     var tags = getBandTags(band.bandName);
     var allTags = ['Live Favorite', 'Festival Only', 'Tribute Band', 'Still Active', 'Retired', 'Local Favorite'];
     return '<div class="household-concerts-tag-manager">'
       + '<div class="household-concerts-tag-display">'
       + tags.map(function (tag) {
         return '<span class="household-concerts-tag-badge">' + escapeHtml(tag) + ' <button type="button" data-concert-action="remove-tag" data-band-key="' + escapeHtml(band.id) + '" data-tag="' + escapeHtml(tag) + '" aria-label="Remove tag">✕</button></span>';
       }).join('')
       + '</div>'
       + '</div>';
   }

   // ===== ENHANCEMENT: GAMIFICATION SYSTEM =====
   function detectAchievements() {
     var achievements = {
       'first-concert': state.attendedConcerts.length >= 1,
       'concert-dozen': state.attendedConcerts.length >= 12,
       'concert-fifty': state.attendedConcerts.length >= 50,
       'concert-century': state.attendedConcerts.length >= 100,
       'band-collector': state.favoriteBands.length >= 10,
       'band-mega': state.favoriteBands.length >= 50,
       'five-star': state.attendedConcerts.some(function (c) { return c.rating === 5; }),
       'completionist': state.attendedConcerts.every(function (c) { return c.rating > 0; }),
       'multi-state': (function () {
         var states = new Set();
         state.upcomingConcerts.forEach(function (c) { if (c.state) states.add(c.state); });
         return states.size >= 5;
       })(),
       'nearby-hunter': state.upcomingConcerts.filter(function (c) { return Number.isFinite(c.distanceMiles) && c.distanceMiles < 50; }).length >= 3
     };
     Object.keys(achievements).forEach(function (key) {
       if (achievements[key] && !state.achievements[key]) {
         state.achievements[key] = { unlockedAt: Date.now() };
         setStatus('🏆 Achievement unlocked: ' + key.replace(/-/g, ' ') + '!', 'success');
       }
     });
     writeJsonStorage('householdConcertsAchievementsV1', state.achievements);
     return achievements;
   }

   function renderAchievements() {
     var container = document.getElementById('householdConcertsAchievements');
     if (!container) return;
     var achievements = detectAchievements();
     var iconMap = {
       'first-concert': '🎵',
       'concert-dozen': '🎫',
       'concert-fifty': '⭐',
       'concert-century': '👑',
       'band-collector': '📚',
       'band-mega': '🌟',
       'five-star': '✨',
       'completionist': '✓',
       'multi-state': '🗺️',
       'nearby-hunter': '🎯'
     };
     var items = Object.entries(achievements).map(function (entry) {
       var key = entry[0];
       var unlocked = entry[1];
       var icon = iconMap[key] || '🏆';
       return '<div class="household-concerts-achievement' + (unlocked ? ' is-unlocked' : '') + '" title="' + key.replace(/-/g, ' ') + '">'
         + '<div class="achievement-icon">' + icon + '</div>'
         + '<div class="achievement-name">' + key.replace(/-/g, ' ') + '</div>'
         + '</div>';
     }).join('');
     container.innerHTML = '<div class="household-concerts-achievements-grid">' + items + '</div>';
   }

   // ===== ENHANCEMENT: PERSONAL STATISTICS CARDS =====
   function computePersonalStats() {
     var total = state.attendedConcerts.length;
     var avgRating = total ? state.attendedConcerts.reduce(function (sum, c) { return sum + (c.rating || 0); }, 0) / total : 0;
     var favoredBand = state.favoriteBands.length ? state.favoriteBands.reduce(function (best, band) {
       var count = state.attendedConcerts.filter(function (c) { return normalizeKey(c.bandName) === normalizeKey(band.bandName); }).length;
       return count > (best.count || 0) ? { name: band.bandName, count: count } : best;
     }, {}) : null;
     var rareGenres = (function () {
       var genreCounts = new Map();
       state.favoriteBands.forEach(function (band) {
         (band.genres || []).forEach(function (genre) {
           genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
         });
       });
       return Array.from(genreCounts.entries())
         .sort(function (a, b) { return a[1] - b[1]; })
         .slice(0, 1)
         .map(function (e) { return e[0]; })[0] || '—';
     })();
     return {
       total: total,
       avgRating: avgRating,
        favoriteBand: favoredBand && favoredBand.count > 0 && favoredBand.name ? favoredBand.name : '—',
       concerts: total > 0 ? 'Seen ' + total + ' shows' : 'No concerts logged',
       rareGenre: rareGenres
     };
   }

   function renderPersonalStats() {
     var container = document.getElementById('householdConcertsPersonalStats');
     if (!container) return;
     var stats = computePersonalStats();
     container.innerHTML = '<div class="household-concerts-personal-stats">'
       + '<div class="stat-card"><div class="stat-value">' + stats.total + '</div><div class="stat-label">Concerts</div></div>'
       + '<div class="stat-card"><div class="stat-value">' + (stats.avgRating ? stats.avgRating.toFixed(1) : '—') + '</div><div class="stat-label">Avg Rating</div></div>'
        + '<div class="stat-card"><div class="stat-value">' + escapeHtml(safeTruncate(stats.favoriteBand, 12)) + '</div><div class="stat-label">Most Seen</div></div>'
        + '<div class="stat-card"><div class="stat-value">' + escapeHtml(safeTruncate(stats.rareGenre, 15)) + '</div><div class="stat-label">Rarest Genre</div></div>'
       + '</div>';
   }

   // ===== ENHANCEMENT: PHOTO GALLERY =====
   function collectAllPhotos() {
     var photos = [];
     state.attendedConcerts.forEach(function (concert) {
       var urls = Array.isArray(concert.photoUrls) ? concert.photoUrls : (concert.photoUrl ? [concert.photoUrl] : []);
       urls.forEach(function (url) {
         photos.push({
           url: url,
           band: concert.bandName,
           date: concert.concertDate,
           venue: concert.venue,
           rating: concert.rating
         });
       });
     });
     return photos.sort(function (a, b) { return (toIsoDate(b.date) || '').localeCompare(toIsoDate(a.date) || ''); });
   }

   function renderPhotoGallery() {
     var container = document.getElementById('householdConcertsPhotoGallery');
     if (!container) return;
     var photos = collectAllPhotos();
     if (!photos.length) {
       container.innerHTML = '<div class="household-concerts-empty"><strong>No photos yet</strong><p>Upload concert photos to see your gallery here.</p></div>';
       return;
     }
     container.innerHTML = '<div class="household-concerts-gallery-grid">'
       + photos.map(function (photo, idx) {
         return '<div class="gallery-item" data-photo-index="' + idx + '">'
           + '<img src="' + escapeHtml(safeUrl(photo.url)) + '" alt="' + escapeHtml(photo.band) + ' concert" class="gallery-img">'
           + '<div class="gallery-overlay">'
           + '<div><strong>' + escapeHtml(photo.band) + '</strong></div>'
           + '<div>' + escapeHtml(formatDate(photo.date)) + '</div>'
           + '</div>'
           + '</div>';
       }).join('')
       + '</div>';
   }

   // ===== ENHANCEMENT: CONCERT ATTENDANCE ANALYTICS =====
   function computeAnalytics() {
     var byMonth = new Map();
     var byGenre = new Map();
     var byYear = new Map();
     state.attendedConcerts.forEach(function (concert) {
       var iso = toIsoDate(concert.concertDate);
        if (!iso) return;
       var month = iso ? iso.substring(0, 7) : '';
       var year = iso ? iso.substring(0, 4) : '';
       byMonth.set(month, (byMonth.get(month) || 0) + 1);
       byYear.set(year, (byYear.get(year) || 0) + 1);
        (((state.favoriteBands.find(function (b) { return normalizeKey(b.bandName) === concert.bandKey; }) || {}).genres) || []).forEach(function (genre) {
         byGenre.set(genre, (byGenre.get(genre) || 0) + 1);
       });
     });
     return {
       byMonth: Array.from(byMonth.entries()).sort(),
       byYear: Array.from(byYear.entries()).sort(),
       byGenre: Array.from(byGenre.entries()).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 8)
     };
   }

   function renderAnalyticsDashboard() {
     var container = document.getElementById('householdConcertsAnalyticsDash');
     if (!container) return;
     var data = computeAnalytics();
     var peakMonth = data.byMonth.length ? data.byMonth.reduce(function (max, item) { return item[1] > max[1] ? item : max; }) : null;
     var peakYear = data.byYear.length ? data.byYear.reduce(function (max, item) { return item[1] > max[1] ? item : max; }) : null;
     container.innerHTML = '<div class="household-concerts-analytics-grid">'
       + '<div class="analytics-card"><h4>Peak Month</h4><strong>' + (peakMonth ? peakMonth[0] : '—') + '</strong><span>' + (peakMonth ? peakMonth[1] + ' concerts' : 'No data') + '</span></div>'
       + '<div class="analytics-card"><h4>Peak Year</h4><strong>' + (peakYear ? peakYear[0] : '—') + '</strong><span>' + (peakYear ? peakYear[1] + ' concerts' : 'No data') + '</span></div>'
       + '<div class="analytics-card"><h4>Top Genres</h4><strong>' + (data.byGenre.length ? data.byGenre.slice(0, 2).map(function (g) { return g[0]; }).join(', ') : '—') + '</strong><span>' + (data.byGenre.length ? data.byGenre.length + ' genres seen' : 'No data') + '</span></div>'
       + '</div>';
   }

   // ===== ENHANCEMENT: TOUR SCHEDULE SYNC =====
   function extractBandsintownArtistSlug(url) {
     var raw = String(url || '').trim();
     if (!raw) return '';
     var match = raw.match(/bandsintown\.com\/a\/([^/?#]+)/i);
     return match ? String(match[1] || '').trim() : '';
   }

   async function fetchBandsintownEventsByArtistKey(artistKey) {
     var key = String(artistKey || '').trim();
     if (!key) return [];
     var url = 'https://www.bandsintown.com/api/v2/artists/' + encodeURIComponent(key) + '/events?app_id=kyles_adventure_planner';
     var response = await fetch(url);
     if (!response.ok) throw new Error('Events request failed (' + response.status + ')');
     var payload = await response.json().catch(function () { return []; });
     return Array.isArray(payload) ? payload : [];
   }

   async function syncTourScheduleForBand(bandOrName) {
     if (state.tourSyncBusy) return [];
     state.tourSyncBusy = true;
     var bandObj = bandOrName && typeof bandOrName === 'object' ? bandOrName : null;
     var cleanName = String((bandObj && bandObj.bandName) || bandOrName || '').trim();
     setStatus('Syncing tour schedule for ' + cleanName + '...', 'info');
     try {
        if (!cleanName) throw new Error('Band name is required before syncing.');
        var keysToTry = uniqueStrings([
          extractBandsintownArtistSlug((bandObj && bandObj.bandsintownUrl) || ''),
          cleanName
        ].filter(Boolean));
        var artistPayload = await fetchJsonPublic('https://www.bandsintown.com/api/v2/artists/' + encodeURIComponent(cleanName) + '?app_id=kyles_adventure_planner');
        var resolvedName = String(artistPayload.name || '').trim();
        if (resolvedName) keysToTry.unshift(resolvedName);

        var events = [];
        var lastError = null;
        for (var keyIndex = 0; keyIndex < keysToTry.length; keyIndex += 1) {
          var artistKey = keysToTry[keyIndex];
          try {
            events = await fetchBandsintownEventsByArtistKey(artistKey);
            if (events.length || keyIndex === keysToTry.length - 1) break;
          } catch (eventsError) {
            lastError = eventsError;
          }
        }
        if (!Array.isArray(events)) events = [];
        if (!events.length && lastError) {
          throw new Error(lastError && lastError.message ? lastError.message : 'Tour sync failed.');
        }
       var added = 0;
       var workbookPath = await findWorkbookPath();
       var slicedEvents = events.slice(0, 10);
       for (var eventIdx = 0; eventIdx < slicedEvents.length; eventIdx += 1) {
         var event = slicedEvents[eventIdx];
         var existsAlready = state.upcomingConcerts.some(function (c) {
           return normalizeText(c.bandName) === normalizeText(cleanName) && toIsoDate(c.concertDate) === toIsoDate(event.datetime);
         });
         if (existsAlready || !event.venue) continue;
         var upcomingRecord = {
           Band_Name: cleanName,
           Concert_Date: toIsoDate(event.datetime),
           Day_of_Week: formatDayOfWeek(event.datetime),
           Venue: event.venue.name || '',
           City: event.venue.city || '',
           State: event.venue.country === 'United States' ? event.venue.region : ''
         };
         await appendRecordToTable(workbookPath, UPCOMING_TABLE, upcomingRecord);
         state.upcomingConcerts.push(parseUpcomingConcert(upcomingRecord));
         added += 1;
       }
        setStatus('Synced ' + added + ' tour dates for ' + cleanName + '.', 'success');
       renderAll();
       maybeHydrateUpcomingDistances();
       return added;
     } catch (error) {
       console.error('Tour sync failed:', error);
        setStatus('Could not sync tour schedule. Using manual entry instead. ' + (error && error.message ? '(' + error.message + ')' : ''), 'warning');
       return 0;
     } finally {
       state.tourSyncBusy = false;
     }
   }

   // ===== ENHANCEMENT: CONCERT NOTIFICATIONS =====
   function enableNotifications() {
     if (!('Notification' in global)) {
       setStatus('Notifications not supported in this browser.', 'warning');
       return;
     }
     if (global.Notification.permission === 'granted') return;
     if (global.Notification.permission !== 'denied') {
       global.Notification.requestPermission().then(function () {
         state.notificationsEnabled.enabled = true;
         writeJsonStorage('householdConcertsNotifyV1', state.notificationsEnabled);
       });
     }
   }

   function checkAndNotifyUpcomingConcerts() {
     if (!state.notificationsEnabled.enabled || global.Notification.permission !== 'granted') return;
     var inSevenDays = new Date();
     inSevenDays.setDate(inSevenDays.getDate() + 7);
     var soon = state.upcomingConcerts.filter(function (c) {
       var concertDate = new Date(c.concertDate + 'T00:00:00');
       return concertDate <= inSevenDays && concertDate >= new Date();
     });
     soon.slice(0, 3).forEach(function (concert) {
       new global.Notification('🎵 Upcoming: ' + concert.bandName, {
         body: formatDate(concert.concertDate) + ' at ' + concert.venue,
         tag: 'concert-' + concert.id,
         requireInteraction: false
       });
     });
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
          var discoveryBandKey = String(target.getAttribute('data-band-key') || '').trim();
          var result = searchId ? findSearchResultById(searchId) : (discoveryId ? findDiscoveryById(discoveryId, discoveryBandKey) : null);
          openBandForm(result && result.prefill ? result.prefill : null);
          break;
        }
        case 'quick-add-recommended-band': {
          var quickDiscoveryId = String(target.getAttribute('data-discovery-id') || '').trim();
          var quickBandKey = String(target.getAttribute('data-band-key') || '').trim();
          var quickResult = findDiscoveryById(quickDiscoveryId, quickBandKey);
          if (!quickResult || !quickResult.prefill) break;
          (async function () {
            var added = await addFavoriteBandFromPrefill(quickResult.prefill, { withUndoToast: true });
            if (added) closeModal();
          })();
          break;
        }
        case 'add-selected-recommended': {
          var selectedBandKey = String(target.getAttribute('data-band-key') || '').trim();
          var checked = Array.from(document.querySelectorAll('input[name="householdConcertsRecommendedBand"][data-band-key="' + selectedBandKey + '"]:checked'));
          if (!checked.length) {
            setStatus('Select one or more recommended bands first.', 'warning');
            break;
          }
          (async function () {
            var addedCount = 0;
            for (var idx = 0; idx < checked.length; idx += 1) {
              var item = checked[idx];
              var recommendation = findDiscoveryById(String(item.value || '').trim(), selectedBandKey);
              if (!recommendation || !recommendation.prefill) continue;
              var added = await addFavoriteBandFromPrefill(recommendation.prefill, { silent: true, withUndoToast: true });
              if (added) addedCount += 1;
            }
            setStatus(addedCount ? ('Added ' + addedCount + ' recommended band' + (addedCount === 1 ? '' : 's') + '.') : 'No new recommended bands were added.', addedCount ? 'success' : 'warning');
            if (addedCount) closeModal();
          })();
          break;
        }
        case 'open-concert-settings':
          openConcertSettingsModal();
          break;
        case 'auto-fill-band-profile': {
          var bandForm = target.closest('form');
          if (!bandForm) break;
          autoFillBandForm(bandForm);
          break;
        }
        case 'open-band-image-picker': {
          var imageForm = target.closest('form');
          var sourceBandKey = String(target.getAttribute('data-band-key') || '').trim();
          var sourceBand = sourceBandKey ? getBandByKey(sourceBandKey) : null;
          var imageBandName = imageForm
            ? String((imageForm.querySelector('[name="Band_Name"]') || {}).value || '').trim()
            : String((sourceBand && sourceBand.bandName) || '').trim();
          if (!imageBandName) {
            if (imageForm) setBandFormStatus('Enter a band name first, then find photos.', 'warning');
            else setStatus('Band name is required before loading photo candidates.', 'warning');
            break;
          }
          if (imageForm) setBandFormStatus('Searching for candidate cover/logo images...', 'info');
          else setStatus('Searching for candidate cover/logo images for ' + imageBandName + '...', 'info');
          (async function () {
            try {
              var candidates = await fetchBandImageCandidates(imageBandName);
              if (!candidates.length) {
                if (imageForm) setBandFormStatus('No candidate images found. Use manual upload or URL import.', 'warning');
                else setStatus('No candidate images found. Use manual upload or URL import.', 'warning');
                return;
              }
              openBandImagePickerModal(imageForm, candidates, imageForm
                ? { sourceType: 'form' }
                : { sourceType: 'band', sourceBandKey: sourceBandKey, formData: mapBandToPrefillShape(sourceBand || {}) });
            } catch (error) {
              if (imageForm) setBandFormStatus(error && error.message ? error.message : 'Could not load image candidates.', 'warning');
              else setStatus(error && error.message ? error.message : 'Could not load image candidates.', 'warning');
            }
          })();
          break;
        }
        case 'select-band-cover-candidate':
        case 'select-band-logo-candidate': {
          if (!state.bandImagePicker) break;
          var selectedIndex = Number(target.getAttribute('data-candidate-index') || 0);
          if (!Number.isFinite(selectedIndex) || selectedIndex < 0) break;
          if (action === 'select-band-cover-candidate') state.bandImagePicker.selectedCoverIndex = selectedIndex;
          if (action === 'select-band-logo-candidate') state.bandImagePicker.selectedLogoIndex = selectedIndex;
          openBandImagePickerModal(null, state.bandImagePicker.candidates || []);
          break;
        }
        case 'apply-band-image-selection':
          applyBandImageSelection();
          break;
        case 'upload-band-logo-file':
          uploadBandImageFromFileInput('householdConcertsBandLogoFileInput', 'Band_Logo_URL', 'logo');
          break;
        case 'upload-band-cover-file':
          uploadBandImageFromFileInput('householdConcertsBandCoverFileInput', 'Band_Cover_Photo_URL', 'cover');
          break;
        case 'import-band-logo-url':
          importBandImageFromUrlInput('householdConcertsBandLogoUrlInput', 'Band_Logo_URL', 'logo');
          break;
        case 'import-band-cover-url':
          importBandImageFromUrlInput('householdConcertsBandCoverUrlInput', 'Band_Cover_Photo_URL', 'cover');
          break;
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
         case 'refresh-band-profile':
           refreshSavedBandProfile(getBandByKey(target.getAttribute('data-band-key')), { noPreview: false });
           break;
         case 'refresh-band-profile-no-preview':
           refreshSavedBandProfile(getBandByKey(target.getAttribute('data-band-key')), { noPreview: true });
           break;
         case 'refresh-band-profile-preview':
           refreshSavedBandProfile(getBandByKey(target.getAttribute('data-band-key')), { noPreview: false });
           break;
         case 'set-genre-filter':
           state.genreFilter = String(target.getAttribute('data-genre') || '').trim();
           renderAll();
           break;
         case 'toggle-form-field-lock':
         case 'toggle-preview-field-lock':
         case 'toggle-provenance-field-lock':
         case 'toggle-refresh-preview-lock': {
           var tlFieldKey = String(target.getAttribute('data-field-key') || '').trim();
           var tlBandKey = String(target.getAttribute('data-band-key') || '').trim();
           if (tlFieldKey && tlBandKey) {
             var nowLocked = toggleBandFieldLock(tlBandKey, tlFieldKey);
              var tlMeta = getBandProfileMeta(tlBandKey) || {};
              var tlEntry = tlMeta.fieldProvenance && tlMeta.fieldProvenance[tlFieldKey] ? tlMeta.fieldProvenance[tlFieldKey] : null;
              var tlTooltip = tlEntry ? ('\n' + formatFieldProvenanceTooltip(tlEntry)) : '';
             target.textContent = nowLocked ? '🔒' : '🔓';
              target.title = (nowLocked ? 'Field locked — auto-fill will not overwrite it. Click to unlock.' : 'Click to lock this field so auto-fill never overwrites it.') + tlTooltip;
             target.setAttribute('aria-pressed', nowLocked ? 'true' : 'false');
             target.classList.toggle('is-locked', nowLocked);
             // Disable the companion checkbox when locked
             var diffItem = target.closest('[data-diff-field]') || target.closest('.household-concerts-diff-item');
             if (diffItem) {
               var cb = diffItem.querySelector('.diff-checkbox');
               if (cb) { cb.disabled = nowLocked; if (nowLocked) cb.checked = false; else cb.checked = true; }
               diffItem.classList.toggle('is-locked', nowLocked);
             }
             // Also refresh provenance panel if it's in view
             var provPanel = target.closest('.household-concerts-field-provenance-item');
             if (provPanel) provPanel.classList.toggle('is-locked', nowLocked);
              renderFavoriteBands();
           }
           break;
         }
         case 'dismiss-change-preview': {
           var cp = document.getElementById('householdConcertsChangePreview');
           if (cp) cp.remove();
           state.pendingEnrichmentDiffs = null;
           setBandFormStatus('Preview dismissed. Click Auto-fill Profile again to re-fetch.', 'info');
           break;
         }
         case 'apply-change-preview':
           applySelectedChangesFromPreview();
           break;
         case 'apply-refresh-preview':
           applyRefreshPreview();
           break;
        case 'refresh-discovery':
          loadDiscoveryForBand(getBandByKey(target.getAttribute('data-band-key')) || resolveActiveBand(), true);
          break;
        case 'use-location':
          captureUserLocation();
          break;
        case 'reset-location':
          resetConcertsLocationToDefault();
          break;
        case 'open-band-refresh-history':
          openBandRefreshHistoryModal(getBandByKey(target.getAttribute('data-band-key')));
          break;
        case 'view-refresh-history-diff': {
          var historyBand = getBandByKey(target.getAttribute('data-band-key'));
          var historyIndex = Number(target.getAttribute('data-history-index') || 0);
          openBandRefreshHistoryModal(historyBand, historyIndex);
          break;
        }
        case 'bulk-lock-high-confidence': {
          var lockBandKey = String(target.getAttribute('data-band-key') || '').trim();
          var lockMeta = getBandProfileMeta(lockBandKey) || {};
          var lockMap = normalizeFieldProvenanceMap(lockMeta.fieldProvenance || {});
          var applied = 0;
          Object.keys(lockMap).forEach(function (fieldKey) {
            if (confidenceTone(lockMap[fieldKey].confidence) !== 'high') return;
            if (!isBandFieldLocked(lockBandKey, fieldKey)) {
              setBandFieldLock(lockBandKey, fieldKey, true);
              applied += 1;
            }
          });
          setStatus(applied ? ('Auto-locked ' + applied + ' high-confidence field' + (applied === 1 ? '' : 's') + '.') : 'No unlocked high-confidence fields were found.', applied ? 'success' : 'info');
          var lockBand = getBandByKey(lockBandKey);
          openBandRefreshHistoryModal(lockBand || resolveActiveBand());
          renderAll();
          break;
        }
        case 'undo-recommended-add':
          undoRecommendedAdd(target.getAttribute('data-toast-token'));
          break;
        case 'clear-band-refresh-history':
          clearBandRefreshHistory(getBandByKey(target.getAttribute('data-band-key')));
          closeModal();
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
          case 'remove-tag': {
            var bandKey = String(target.getAttribute('data-band-key') || '').trim();
            var tag = String(target.getAttribute('data-tag') || '').trim();
            var band = getBandByKey(bandKey);
            if (band) {
              removeBandTag(band.bandName, tag);
              renderAll();
            }
            break;
          }
          case 'add-tag': {
            var bandKey = String(target.getAttribute('data-band-key') || '').trim();
            var band = getBandByKey(bandKey);
            if (band) {
              var tagInput = target.closest('.household-concerts-tag-manager') ? target.closest('.household-concerts-tag-manager').querySelector('input[type="text"]') : null;
              if (tagInput && tagInput.value) {
                saveBandTag(band.bandName, tagInput.value);
                tagInput.value = '';
                renderFavoriteBands();
              }
            }
            break;
          }
          case 'sync-tour': {
            var bandKey = String(target.getAttribute('data-band-key') || '').trim();
            var band = getBandByKey(bandKey);
            if (band) syncTourScheduleForBand(band);
            break;
          }
          case 'enable-notifications':
            enableNotifications();
            break;
          case 'view-gallery':
            state.currentView = 'gallery';
            renderAll();
            break;
          case 'view-analytics':
            state.currentView = 'analytics';
            renderAll();
            break;
          case 'view-default':
            state.currentView = 'default';
            renderAll();
            break;
        }
     });

     // FIX: Handle modal backdrop clicks properly (only close on backdrop, not content)
     root.addEventListener('click', function (event) {
       var backdrop = event.target && event.target.classList && event.target.classList.contains('household-concerts-modal-backdrop') ? event.target : null;
       if (backdrop && event.target === backdrop) {
         closeModal();
       }
     });

      root.addEventListener('input', function (event) {
       var target = event.target;
       if (!target) return;
       var parentForm = target.closest ? target.closest('form') : null;
       if (parentForm && parentForm.id === 'householdConcertsBandForm' && BAND_FORM_NAME_TO_PREFILL_KEY[target.name || '']) {
         var existingTouched = uniqueStrings(String(parentForm.dataset.userTouchedFields || '').split(',').map(function (entry) { return String(entry || '').trim(); }).filter(Boolean));
         var touchedKey = BAND_FORM_NAME_TO_PREFILL_KEY[target.name || ''];
         if (existingTouched.indexOf(touchedKey) < 0) existingTouched.push(touchedKey);
         parentForm.dataset.userTouchedFields = existingTouched.join(',');
       }
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
      if (!target || !(event.metaKey || event.ctrlKey) || String(event.key || '').toLowerCase() !== 'z') return;
      var undoForm = target.closest ? target.closest('#householdConcertsBandForm') : null;
      if (!undoForm) return;
      var activeInput = undoForm.querySelector(':focus');
      if (!activeInput || !BAND_FORM_NAME_TO_PREFILL_KEY[activeInput.name || '']) return;
      if (applyFieldUndoForInput(undoForm, activeInput)) {
        event.preventDefault();
        setBandFormStatus('Undid the last enrichment change for ' + (BAND_PROFILE_FIELD_LABELS[BAND_FORM_NAME_TO_PREFILL_KEY[activeInput.name || '']] || 'this field') + '.', 'info');
      }
    });

    root.addEventListener('submit', function (event) {
      var form = event.target;
      if (!form || !form.id) return;
      event.preventDefault();
      if (form.id === 'householdConcertsBandForm') saveFavoriteBand(form);
      if (form.id === 'householdConcertsAttendedForm') saveAttendedConcert(form);
      if (form.id === 'householdConcertsUpcomingForm') saveUpcomingConcert(form);
      if (form.id === 'householdConcertsSettingsForm') saveConcertSettingsFromForm(form);
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
    setBackendWriteAuditEnabled: setBackendWriteAuditEnabled,
    isBackendWriteAuditEnabled: isBackendWriteAuditEnabled,
    __state: state
  };
})(window);

