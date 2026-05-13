(function initHouseholdConcertsSystem(global) {
  'use strict';

  var ROOT_ID = 'householdConcertsPane';
  var MODAL_HOST_ID = 'householdConcertsModalHost';
  var STATUS_ID = 'householdConcertsStatus';
  var SUMMARY_ID = 'householdConcertsSummaryGrid';
  var ACTIVE_FILTERS_ID = 'householdConcertsActiveFilters';
  var GENRE_CHIPS_ID = 'householdConcertsGenreChips';
  var TIER_CHIPS_ID = 'householdConcertsTierChips';
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
  var ROCKVILLE_2026_TABLE = 'Rockville_2026_Sets';
  var ROCKVILLE_2026_WORKSHEET = 'Rockville_2026';
  var WORKBOOK_NAME = 'Concerts_Bands.xlsx';
  var DISTANCE_STOPS = [25, 50, 75, 100, 250, 1000];
  var CONCERT_ATTENDEE_OPTIONS = ['Kyle', 'Heather', 'Both'];
  var VENUE_PRESET_OPTIONS = [
    'The Prophet Bar - Dallas, TX',
    'The Door - Dallas, TX',
    'Southside Ball Room - Dallas, TX',
    'Curtain Club - Dallas, TX',
    'House of Blues - Dallas, TX',
    'The Bomb Factory - Dallas, TX',
    'American Airlines Center - Dallas, TX',
    'Gilley\'s - Dallas, TX',
    'So What Music Festival - Arlington, TX',
    'Gas Monkey Garage - Dallas, TX'
  ];
  var HISTORIC_RADIUS_OPTIONS = [25, 50, 100];
  var HISTORIC_DEFAULT_FROM_YEAR = 2006;
  var BAND_DASHBOARD_PAGE_SIZE = 12;
  var HISTORIC_SEARCH_LOCATIONS = [
    { id: 'richardson', label: 'Richardson, TX 75081', latitude: 32.9483, longitude: -96.7299 },
    { id: 'hendersonville', label: 'Hendersonville, NC 28791', latitude: 35.3187, longitude: -82.4609 }
  ];
  var LOCATION_STORAGE_KEY = 'kap_user_gps';
  var CONCERTS_LOCATION_MODE_STORAGE_KEY = 'householdConcertsLocationModeV1';
  var CONCERTS_SETTINGS_STORAGE_KEY = 'householdConcertsSettingsV1';
  var NOTES_STORAGE_KEY = 'householdConcertsNotesV1';
  var HISTORIC_EDIT_META_STORAGE_KEY = 'householdConcertsHistoricEditMetaV1';
  var GEOCODE_STORAGE_KEY = 'householdConcertsGeocodeCacheV1';
  var DISCOVERY_STORAGE_KEY = 'householdConcertsDiscoveryCacheV1';
  var NOT_INTERESTED_RECOMMENDATIONS_STORAGE_KEY = 'householdConcertsNotInterestedRecommendationsV1';
  var BAND_PROFILE_META_STORAGE_KEY = 'householdConcertsBandProfileMetaV1';
  var BAND_PROFILE_OVERRIDES_STORAGE_KEY = 'householdConcertsBandProfileOverridesV1';
  var BAND_PROFILE_LOCKS_STORAGE_KEY = 'householdConcertsBandProfileLocksV1';
  var BACKEND_WRITE_AUDIT_STORAGE_KEY = 'householdConcertsBackendWriteAuditV1';
  var WORKBOOK_PATH_STORAGE_KEY = 'householdConcertsWorkbookPathV1';
  var BAND_TIER_STORAGE_KEY = 'householdConcertsBandTierOverridesV1';
  var SHOW_TIER4_STORAGE_KEY = 'householdConcertsShowTier4BandsV1';
  var PRIORITY_BANDS_STORAGE_KEY = 'householdConcertsPriorityBandsV1';
  var UPCOMING_TICKETS_STORAGE_KEY = 'householdConcertsUpcomingTicketsV1';
  var BAND_CARD_COLS_STORAGE_KEY = 'householdConcertsBandCardColsV1';
  var ROCKVILLE_2026_STORAGE_KEY = 'householdConcertsRockville2026V1';
  var ROCKVILLE_2026_DAYS = [
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];
  var ROCKVILLE_2026_COLUMNS = [
    'Rockville_Set_Id',
    'Rockville_Day',
    'Band',
    'Stage',
    'Set_Start_Time',
    'Created_At',
    'Updated_At'
  ];
  var ROCKVILLE_2026_FIELD_ALIASES = {
    id: ['Rockville_Set_Id', 'Rockville Set Id', 'Set_Id', 'Set ID'],
    day: ['Rockville_Day', 'Rockville Day', 'Day'],
    band: ['Band', 'Band_Name', 'Band Name'],
    stage: ['Stage'],
    setStartTime: ['Set_Start_Time', 'Set Start Time', 'SetStartTime'],
    createdAt: ['Created_At', 'Created At'],
    updatedAt: ['Updated_At', 'Updated At']
  };
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
    wikipediaUrl: 'Wikipedia URL',
    lastReleaseDate: 'Last Release Date',
    memberTimeline: 'Member Timeline'
  };
  var FAVORITE_BAND_FIELD_ALIASES = {
    bandName: ['Band_Name', 'Band Name', 'Name'],
    bandMembers: ['Band_Members', 'Band Members', 'Band Members + Roles', 'Band Members and Roles', 'Band Member Roles'],
    bandLogoUrl: ['Band_Logo_URL', 'Band Logo URL'],
    bandCoverPhotoUrl: ['Band_Cover_Photo_URL', 'Band Cover Photo URL', 'Band Cover Image URL', 'Band Cover URL'],
    origin: ['Origin'],
    founded: ['Founded'],
    recordLabel: ['Record_Label', 'Record _Label', 'Record Label', 'Label'],
    discography: ['Discography'],
    topSongs: ['Top_Songs', 'Top Songs'],
    associatedGenres: ['Associated_Genres', 'Associated Genres', 'Genres'],
    websiteUrl: ['Website_URL', 'Website URL'],
    tourPageUrl: ['Tour_Page_URL', 'Tour Page URL'],
    facebookUrl: ['Facebook_URL', 'Facebook URL'],
    instagramUrl: ['Instagram_URL', 'Instagram URL'],
    youTubeUrl: ['YouTube_URL', 'YouTube URL'],
    setlistUrl: ['Setlist.fm_URL', 'Setlist FM URL'],
    bandsintownUrl: ['Bandsintown_URL', 'Bandsintown URL'],
    wikipediaUrl: ['Wikipedia_URL', 'Wikipedia URL'],
    bandTier: ['Band_Tier', 'Band Tier', 'Tier'],
    coverPositionX: ['Cover_Position_X', 'Cover Position X'],
    coverPositionY: ['Cover_Position_Y', 'Cover Position Y'],
    coverZoom: ['Cover_Zoom', 'Cover Zoom'],
    logoPositionX: ['Logo_Position_X', 'Logo Position X'],
    logoPositionY: ['Logo_Position_Y', 'Logo Position Y']
  };
  var BAND_TIER_OPTIONS = [
    { key: 'tier1', value: 'Tier 1 (The Best Bands)' },
    { key: 'tier2', value: 'Tier 2 (Great Bands)' },
    { key: 'tier3', value: 'Tier 3 (Good Bands)' },
    { key: 'tier4', value: 'Tier 4 (Attended Concert / Not Favorite)' }
  ];
  var TABLE_WRITE_COLUMN_ALIASES = {
    bandmembersroles: ['bandmembers'],
    bandmembersandroles: ['bandmembers'],
    bandmemberroles: ['bandmembers'],
    recordlabel: ['recordlabel', 'record_label'],
    bandcoverimageurl: ['bandcoverphotourl'],
    bandcoverurl: ['bandcoverphotourl'],
    attendedby: ['attendee', 'attendees', 'whoattended'],
    coverpositionx: ['coverx', 'coverposx'],
    coverpositiony: ['covery', 'coverposy'],
    coverzoom: ['zoom', 'coverphotosize'],
    logopositionx: ['logox', 'logoposx'],
    logopositiony: ['logoy', 'logoposy']
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
    Wikipedia_URL: 'wikipediaUrl',
    Last_Release_Date: 'lastReleaseDate',
    Member_Timeline: 'memberTimeline',
    Band_Tier: 'bandTier'
  };
  var FAVORITE_SYNC_FIELD_KEYS = Object.keys(BAND_PROFILE_FIELD_LABELS).concat(['bandTier']);

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
    'Copilot_Apps/Kyles_Adventure_Finder/',
    'Concerts/',
    ''
  ];
  var BAND_PHOTOS_ROOT_PATH = 'Copilot_Apps/Band_Photos';

   var state = {
     initialized: false,
     loading: false,
     workbookPath: '',
      workbookPathHint: readStringStorage(WORKBOOK_PATH_STORAGE_KEY, ''),
      lastWorkbookPathDiagnosticsReport: null,
      tableSchemaCache: {},
     favoriteBands: [],
     attendedConcerts: [],
     upcomingConcerts: [],
     searchResults: [],
     activeBandKey: '',
     bandFilter: '',
     genreFilter: '',
      tierFilter: '',
      showTier4Bands: readStringStorage(SHOW_TIER4_STORAGE_KEY, '0') === '1',
      bandSummaryFilter: '',
      bandsPage: 1,
     distanceIndex: 3,
     searchBusy: false,
     geocodeBusy: false,
     discoveryBusyKey: '',
     location: restoreLocation(),
     localNotes: readJsonStorage(NOTES_STORAGE_KEY, {}),
      historicEditMeta: readJsonStorage(HISTORIC_EDIT_META_STORAGE_KEY, {}),
     geocodeCache: readJsonStorage(GEOCODE_STORAGE_KEY, {}),
     discoveryCache: readJsonStorage(DISCOVERY_STORAGE_KEY, {}),
      notInterestedRecommendations: readJsonStorage(NOT_INTERESTED_RECOMMENDATIONS_STORAGE_KEY, {}),
      bandTierOverrides: readJsonStorage(BAND_TIER_STORAGE_KEY, {}),
     bandProfileMeta: readJsonStorage(BAND_PROFILE_META_STORAGE_KEY, {}),
      bandProfileOverrides: readJsonStorage(BAND_PROFILE_OVERRIDES_STORAGE_KEY, {}),
      bandProfileLocks: readJsonStorage(BAND_PROFILE_LOCKS_STORAGE_KEY, {}),
      fieldUndoStacks: {},
      bandImagePicker: null,
      pendingEnrichmentDiffs: null,
       pendingRecommendationAdds: {},
      recommendationToast: null,
      unsyncedBandsReport: null,
      unsyncedScanBusy: false,
      priorityBands: readJsonStorage(PRIORITY_BANDS_STORAGE_KEY, {}),
       upcomingTickets: readJsonStorage(UPCOMING_TICKETS_STORAGE_KEY, {}),
      bandCardColumns: Math.max(1, Math.min(4, Number(readStringStorage(BAND_CARD_COLS_STORAGE_KEY, '2')) || 2)),
      rockville2026: normalizeRockville2026Data(readJsonStorage(ROCKVILLE_2026_STORAGE_KEY, {})),
      rockvilleView: {
        open: false,
        page: 'schedule',
        activeDay: 'thursday',
        formDay: 'thursday',
        editingSetId: ''
      },
      rockvilleSyncStatus: {
        mode: 'local-only',
        label: 'Local only',
        detail: 'Rockville 2026 sets are currently stored locally until Excel sync succeeds.',
        updatedAt: 0,
        lastSyncedAt: 0
      },
      bulkProfileRefreshBusy: false,
      bulkProfileRefreshProgress: { current: 0, total: 0, bandName: '' },
      festivalDashboard: { busy: false, generatedAt: 0, festivals: [], message: '' },
      apiOutages: {},
     pendingSearchQuery: '',
     attendedUploadFiles: [],
     attendedUploadedPhotoUrls: [],
     attendedLastUploadedPhotoUrls: [],
     attendedUploadBusy: false,
     attendedUploadStatus: { tone: 'info', message: '' },
      attendedBySchemaWarning: '',
      historicFinderBusy: false,
      historicFinderResults: [],
      historicFinderSourcesUsed: [],
      historicFinderStatus: { tone: 'info', message: '' },
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

  function readStringStorage(key, fallback) {
    try {
      var raw = global.localStorage.getItem(key);
      return raw == null ? String(fallback || '') : String(raw || '');
    } catch (_error) {
      return String(fallback || '');
    }
  }

  function writeStringStorage(key, value) {
    try {
      global.localStorage.setItem(key, String(value || ''));
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
    if (key === 'setlist.fm' || key === 'setlistfm') return 'Setlist.fm';
    if (key === 'members') return 'Members/Roles';
    if (key === 'user') return 'User';
    return String(sourceKey || 'Unknown source').trim() || 'Unknown source';
  }

  function normalizeBandTier(value) {
    var text = normalizeText(value);
    if (text.indexOf('tier 1') >= 0 || text.indexOf('the best bands') >= 0 || text === 'tier1') return BAND_TIER_OPTIONS[0].value;
    if (text.indexOf('tier 2') >= 0 || text.indexOf('great bands') >= 0 || text === 'tier2') return BAND_TIER_OPTIONS[1].value;
    if (text.indexOf('tier 3') >= 0 || text.indexOf('good bands') >= 0 || text === 'tier3') return BAND_TIER_OPTIONS[2].value;
    if (text.indexOf('tier 4') >= 0 || text.indexOf('not favorite') >= 0 || text === 'tier4') return BAND_TIER_OPTIONS[3].value;
    return BAND_TIER_OPTIONS[1].value;
  }

  function getBandTierRank(value) {
    var tier = normalizeBandTier(value);
    for (var i = 0; i < BAND_TIER_OPTIONS.length; i += 1) {
      if (BAND_TIER_OPTIONS[i].value === tier) return i + 1;
    }
    return 2;
  }

  function isTier4Band(value) {
    return normalizeBandTier(value) === BAND_TIER_OPTIONS[3].value;
  }

  function getNextBandTierValue(currentTier) {
    var normalized = normalizeBandTier(currentTier);
    var idx = BAND_TIER_OPTIONS.findIndex(function (option) { return option.value === normalized; });
    var nextIdx = idx >= 0 ? ((idx + 1) % BAND_TIER_OPTIONS.length) : 1;
    return BAND_TIER_OPTIONS[nextIdx].value;
  }

  function getBandTierOverride(bandNameOrKey) {
    var key = normalizeKey(bandNameOrKey);
    if (!key) return '';
    var raw = state.bandTierOverrides && state.bandTierOverrides[key] ? state.bandTierOverrides[key] : '';
    return raw ? normalizeBandTier(raw) : '';
  }

  function setBandTierOverride(bandNameOrKey, tierValue) {
    var key = normalizeKey(bandNameOrKey);
    if (!key) return;
    state.bandTierOverrides[key] = normalizeBandTier(tierValue);
    writeJsonStorage(BAND_TIER_STORAGE_KEY, state.bandTierOverrides);
  }

  function removeRecommendationNotInterested(bandName) {
    var key = normalizeKey(bandName);
    if (!key || !state.notInterestedRecommendations[key]) return;
    delete state.notInterestedRecommendations[key];
    writeJsonStorage(NOT_INTERESTED_RECOMMENDATIONS_STORAGE_KEY, state.notInterestedRecommendations);
  }

  function isRecommendationNotInterested(bandName) {
    var key = normalizeKey(bandName);
    return !!(key && state.notInterestedRecommendations && state.notInterestedRecommendations[key]);
  }

  function markRecommendationNotInterested(bandName) {
    var clean = String(bandName || '').trim();
    var key = normalizeKey(clean);
    if (!key) return;
    state.notInterestedRecommendations[key] = {
      bandName: clean,
      markedAt: Date.now()
    };
    writeJsonStorage(NOT_INTERESTED_RECOMMENDATIONS_STORAGE_KEY, state.notInterestedRecommendations);
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

  function getDefaultRockville2026Days() {
    return ROCKVILLE_2026_DAYS.reduce(function (acc, day) {
      acc[day.key] = [];
      return acc;
    }, {});
  }

  function generateRockvilleSetId() {
    return 'rockville-set-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  function normalizeRockvilleDayKey(value) {
    var normalized = normalizeText(value).replace(/[^a-z]/g, '');
    var match = ROCKVILLE_2026_DAYS.find(function (day) {
      return normalizeText(day.key) === normalized || normalizeText(day.label) === normalized;
    });
    return match ? match.key : ROCKVILLE_2026_DAYS[0].key;
  }

  function getRockvilleDayMeta(dayKey) {
    var key = normalizeRockvilleDayKey(dayKey);
    return ROCKVILLE_2026_DAYS.find(function (day) { return day.key === key; }) || ROCKVILLE_2026_DAYS[0];
  }

  function normalizeRockvilleTimestamp(value, fallbackValue) {
    var fallback = Number(fallbackValue) || Date.now();
    if (Number.isFinite(Number(value)) && Number(value) > 0) return Number(value);
    var text = String(value || '').trim();
    if (!text) return fallback;
    var parsed = Date.parse(text);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  function normalizeRockvilleSet(entry) {
    var source = entry && typeof entry === 'object' ? entry : {};
    var createdAt = normalizeRockvilleTimestamp(source.createdAt || source.Created_At, Date.now());
    var updatedAt = normalizeRockvilleTimestamp(source.updatedAt || source.Updated_At, createdAt);
    return {
      id: String(source.id || source.setId || '').trim() || generateRockvilleSetId(),
      band: String(source.band || source.Band || '').trim(),
      stage: String(source.stage || source.Stage || '').trim(),
      setStartTime: String(source.setStartTime || source.Set_Start_Time || source.SetStartTime || '').trim(),
      createdAt: createdAt,
      updatedAt: updatedAt,
      __rowIndex: Number.isInteger(Number(source.__rowIndex)) ? Number(source.__rowIndex) : -1,
      __rowId: String(source.__rowId || '').trim()
    };
  }

  function parseRockvilleWorkbookSet(record) {
    var source = record && typeof record === 'object' ? record : {};
    return {
      dayKey: normalizeRockvilleDayKey(readValue(source, ROCKVILLE_2026_FIELD_ALIASES.day)),
      set: normalizeRockvilleSet({
        id: readValue(source, ROCKVILLE_2026_FIELD_ALIASES.id),
        band: readValue(source, ROCKVILLE_2026_FIELD_ALIASES.band),
        stage: readValue(source, ROCKVILLE_2026_FIELD_ALIASES.stage),
        setStartTime: readValue(source, ROCKVILLE_2026_FIELD_ALIASES.setStartTime),
        createdAt: readValue(source, ROCKVILLE_2026_FIELD_ALIASES.createdAt),
        updatedAt: readValue(source, ROCKVILLE_2026_FIELD_ALIASES.updatedAt),
        __rowIndex: source.__rowIndex,
        __rowId: source.__rowId
      })
    };
  }

  function buildRockvilleWorkbookRecord(dayKey, setEntry) {
    var set = normalizeRockvilleSet(setEntry);
    return {
      Rockville_Set_Id: set.id,
      Rockville_Day: normalizeRockvilleDayKey(dayKey),
      Band: set.band,
      Stage: set.stage,
      Set_Start_Time: set.setStartTime,
      Created_At: set.createdAt,
      Updated_At: set.updatedAt
    };
  }

  function pickPreferredRockvilleSet(currentEntry, nextEntry) {
    if (!currentEntry) return normalizeRockvilleSet(nextEntry);
    if (!nextEntry) return normalizeRockvilleSet(currentEntry);
    var current = normalizeRockvilleSet(currentEntry);
    var next = normalizeRockvilleSet(nextEntry);
    var winner = next.updatedAt >= current.updatedAt ? next : current;
    if ((!winner.__rowId || winner.__rowIndex < 0) && (current.__rowId || current.__rowIndex >= 0)) {
      winner.__rowId = current.__rowId;
      winner.__rowIndex = current.__rowIndex;
    }
    if ((!winner.__rowId || winner.__rowIndex < 0) && (next.__rowId || next.__rowIndex >= 0)) {
      winner.__rowId = next.__rowId;
      winner.__rowIndex = next.__rowIndex;
    }
    return winner;
  }

  function mergeRockville2026Sources(localData, backendData) {
    var mergedDays = getDefaultRockville2026Days();
    var localDays = normalizeRockville2026Data(localData).days;
    var backendDays = normalizeRockville2026Data(backendData).days;
    Object.keys(mergedDays).forEach(function (dayKey) {
      var mergedById = new Map();
      localDays[dayKey].forEach(function (entry) {
        var normalized = normalizeRockvilleSet(entry);
        mergedById.set(normalized.id, normalized);
      });
      backendDays[dayKey].forEach(function (entry) {
        var normalized = normalizeRockvilleSet(entry);
        mergedById.set(normalized.id, pickPreferredRockvilleSet(mergedById.get(normalized.id), normalized));
      });
      mergedDays[dayKey] = Array.from(mergedById.values()).sort(function (a, b) {
        var timeCompare = String(a.setStartTime || '').localeCompare(String(b.setStartTime || ''));
        if (timeCompare !== 0) return timeCompare;
        return String(a.band || '').localeCompare(String(b.band || ''));
      });
    });
    return { days: mergedDays };
  }

  function upsertRockvilleSetForDay(dayKey, setEntry) {
    var key = normalizeRockvilleDayKey(dayKey);
    var nextSet = normalizeRockvilleSet(setEntry);
    var daySets = getRockvilleSetsForDay(key).slice();
    var existingIndex = daySets.findIndex(function (entry) {
      return String((entry && entry.id) || '').trim() === nextSet.id;
    });
    if (existingIndex >= 0) {
      nextSet.createdAt = Number(daySets[existingIndex].createdAt) || nextSet.createdAt;
      daySets[existingIndex] = pickPreferredRockvilleSet(daySets[existingIndex], nextSet);
    } else {
      daySets.push(nextSet);
    }
    state.rockville2026.days[key] = daySets;
    return { existingIndex: existingIndex, savedSet: getRockvilleSetById(key, nextSet.id) || nextSet };
  }

  function excelColumnNameFromIndex(index) {
    var safeIndex = Math.max(0, Number(index) || 0);
    var name = '';
    while (safeIndex >= 0) {
      name = String.fromCharCode((safeIndex % 26) + 65) + name;
      safeIndex = Math.floor(safeIndex / 26) - 1;
    }
    return name;
  }

  function getRockville2026HeaderRange() {
    return 'A1:' + excelColumnNameFromIndex(ROCKVILLE_2026_COLUMNS.length - 1) + '1';
  }

  function normalizeRockville2026Data(raw) {
    var source = raw && typeof raw === 'object' ? raw : {};
    var baseDays = getDefaultRockville2026Days();
    Object.keys(baseDays).forEach(function (dayKey) {
      var inputList = source.days && Array.isArray(source.days[dayKey])
        ? source.days[dayKey]
        : (Array.isArray(source[dayKey]) ? source[dayKey] : []);
      baseDays[dayKey] = inputList.map(normalizeRockvilleSet);
    });
    return { days: baseDays };
  }

  function persistRockville2026Data() {
    writeJsonStorage(ROCKVILLE_2026_STORAGE_KEY, state.rockville2026);
  }

  function setRockvilleSyncStatus(mode, detail, timestamp) {
    var normalizedMode = String(mode || '').trim() === 'synced' ? 'synced' : 'local-only';
    var fallbackDetail = normalizedMode === 'synced'
      ? 'Rockville 2026 sets are syncing with your Excel backend.'
      : 'Rockville 2026 sets are currently stored locally until Excel sync succeeds.';
    var existing = state.rockvilleSyncStatus && typeof state.rockvilleSyncStatus === 'object'
      ? state.rockvilleSyncStatus
      : {};
    var stamp = Number(timestamp) || Date.now();
    var lastSyncedAt = normalizedMode === 'synced'
      ? stamp
      : (Number(existing.lastSyncedAt) || 0);
    state.rockvilleSyncStatus = {
      mode: normalizedMode,
      label: normalizedMode === 'synced' ? 'Synced to Excel' : 'Local only',
      detail: String(detail || '').trim() || fallbackDetail,
      updatedAt: stamp,
      lastSyncedAt: lastSyncedAt
    };
  }

  function renderRockvilleSyncBadge() {
    var sync = state.rockvilleSyncStatus && typeof state.rockvilleSyncStatus === 'object'
      ? state.rockvilleSyncStatus
      : { mode: 'local-only', label: 'Local only', detail: '', updatedAt: 0, lastSyncedAt: 0 };
    var mode = String(sync.mode || '').trim() === 'synced' ? 'synced' : 'local-only';
    var label = String(sync.label || (mode === 'synced' ? 'Synced to Excel' : 'Local only')).trim();
    var detail = String(sync.detail || '').trim();
    var icon = mode === 'synced' ? '✅' : '⚠️';
    var lastSyncedAt = Number(sync.lastSyncedAt) || 0;
    var updatedAt = Number(sync.updatedAt) || 0;
    var metaText = mode === 'synced'
      ? (lastSyncedAt ? ('Last synced ' + formatTimeShort(lastSyncedAt)) : '')
      : ((lastSyncedAt ? ('Last synced ' + formatTimeShort(lastSyncedAt)) : '') || (updatedAt ? ('Updated ' + formatTimeShort(updatedAt)) : ''));
    return '<div id="householdConcertsRockvilleSyncBadge" class="household-concerts-rockville-sync-badge household-concerts-rockville-sync-badge--' + mode + '"'
      + ' data-sync-mode="' + mode + '"'
      + (detail ? (' title="' + escapeHtml(detail) + '"') : '')
      + '><span class="household-concerts-rockville-sync-icon" data-rockville-sync-icon="true" aria-hidden="true">' + escapeHtml(icon) + '</span>'
      + '<span class="household-concerts-rockville-sync-label">' + escapeHtml(label) + '</span>'
      + (metaText ? ('<span class="household-concerts-rockville-sync-meta">' + escapeHtml(metaText) + '</span>') : '')
      + '</div>';
  }

  function getRockvilleSetsForDay(dayKey) {
    var key = normalizeRockvilleDayKey(dayKey);
    var days = state.rockville2026 && state.rockville2026.days ? state.rockville2026.days : getDefaultRockville2026Days();
    return Array.isArray(days[key]) ? days[key] : [];
  }

  function getRockvilleSetById(dayKey, setId) {
    var targetId = String(setId || '').trim();
    if (!targetId) return null;
    var matches = getRockvilleSetsForDay(dayKey);
    for (var i = 0; i < matches.length; i += 1) {
      if (String(matches[i].id || '').trim() === targetId) return matches[i];
    }
    return null;
  }

  function formatRockvilleTableCell(value) {
    var text = String(value || '').trim();
    return text ? escapeHtml(text) : '<span class="household-concerts-rockville-empty">—</span>';
  }

  function renderRockville2026() {
    var mount = document.getElementById('householdConcertsRockvilleMount');
    var mainContent = document.getElementById('householdConcertsMainContent');
    if (!mount) return;

    var view = state.rockvilleView || {};
    var isOpen = !!view.open;
    if (mainContent) mainContent.hidden = isOpen;
    mount.hidden = !isOpen;
    if (!isOpen) {
      mount.innerHTML = '';
      return;
    }

    view.activeDay = normalizeRockvilleDayKey(view.activeDay);
    view.formDay = normalizeRockvilleDayKey(view.formDay || view.activeDay);
    state.rockvilleView = view;

    if (view.page === 'form') {
      var formDay = getRockvilleDayMeta(view.formDay);
      var editingSet = getRockvilleSetById(formDay.key, view.editingSetId);
      var isEdit = !!editingSet;
      mount.innerHTML = '<section class="household-concerts-rockville-page">'
        + '<div class="household-concerts-rockville-header">'
        + '<div><div class="household-concerts-eyebrow">🎸 Rockville 2026</div><h3>' + escapeHtml(isEdit ? ('Edit ' + formDay.label + ' Set') : ('Add ' + formDay.label + ' Set')) + '</h3><p class="household-concerts-muted">All fields are optional. Save whenever you are ready.</p>' + renderRockvilleSyncBadge() + '</div>'
        + '<div class="household-concerts-form-actions"><button type="button" class="pill-button" data-concert-action="cancel-rockville-set-form">← Back to Rockville 2026</button></div>'
        + '</div>'
        + '<form id="householdConcertsRockvilleSetForm" class="household-concerts-rockville-form">'
        + '<input type="hidden" name="Rockville_Day" value="' + escapeHtml(formDay.key) + '">'
        + '<input type="hidden" name="Rockville_Set_Id" value="' + escapeHtml(editingSet ? editingSet.id : '') + '">'
        + '<label class="household-concerts-rockville-field"><span>Band</span><input id="householdConcertsRockvilleSetBandInput" type="text" name="Band" value="' + escapeHtml(editingSet ? editingSet.band : '') + '" placeholder="Optional band name"></label>'
        + '<label class="household-concerts-rockville-field"><span>Stage</span><input type="text" name="Stage" value="' + escapeHtml(editingSet ? editingSet.stage : '') + '" placeholder="Optional stage name"></label>'
        + '<label class="household-concerts-rockville-field"><span>Set Start Time</span><input type="time" name="Set_Start_Time" value="' + escapeHtml(editingSet ? editingSet.setStartTime : '') + '"></label>'
        + '<div class="household-concerts-form-actions"><button type="submit" class="pill-button pill-button-primary">' + escapeHtml(isEdit ? 'Save Changes' : 'Add Set') + '</button><button type="button" class="pill-button" data-concert-action="cancel-rockville-set-form">Cancel</button></div>'
        + '</form>'
        + '</section>';
      return;
    }

    var activeDay = getRockvilleDayMeta(view.activeDay);
    var daySets = getRockvilleSetsForDay(activeDay.key);
    mount.innerHTML = '<section class="household-concerts-rockville-page">'
      + '<div class="household-concerts-rockville-header">'
      + '<div><div class="household-concerts-eyebrow">🎸 Rockville 2026</div><h3>Festival schedule planner</h3><p class="household-concerts-muted">Switch days, add sets, and edit anything later as the schedule changes.</p>' + renderRockvilleSyncBadge() + '</div>'
      + '<div class="household-concerts-form-actions"><button type="button" class="pill-button" data-concert-action="close-rockville-2026">← Back to Concerts</button></div>'
      + '</div>'
      + '<div class="household-concerts-rockville-day-tabs" role="tablist" aria-label="Rockville 2026 festival days">'
      + ROCKVILLE_2026_DAYS.map(function (day) {
        var isActive = day.key === activeDay.key;
        return '<button type="button" class="household-concerts-rockville-day-tab' + (isActive ? ' active' : '') + '" role="tab" aria-selected="' + (isActive ? 'true' : 'false') + '" data-concert-action="select-rockville-day" data-rockville-day="' + escapeHtml(day.key) + '">' + escapeHtml(day.label) + '</button>';
      }).join('')
      + '</div>'
      + '<div class="household-concerts-rockville-toolbar"><div class="household-concerts-rockville-day-label">' + escapeHtml(activeDay.label) + '</div><button type="button" class="pill-button pill-button-primary" data-concert-action="open-rockville-set-form" data-rockville-day="' + escapeHtml(activeDay.key) + '">＋ Add Set</button></div>'
      + '<div class="household-concerts-rockville-table-wrap"><table class="household-concerts-rockville-table"><thead><tr><th>Band</th><th>Stage</th><th>Set Start Time</th><th>Edit</th></tr></thead><tbody>'
      + (daySets.length
        ? daySets.map(function (entry) {
          return '<tr>'
            + '<td>' + formatRockvilleTableCell(entry.band) + '</td>'
            + '<td>' + formatRockvilleTableCell(entry.stage) + '</td>'
            + '<td>' + formatRockvilleTableCell(entry.setStartTime) + '</td>'
            + '<td><button type="button" class="pill-button" data-concert-action="edit-rockville-set" data-rockville-day="' + escapeHtml(activeDay.key) + '" data-rockville-set-id="' + escapeHtml(entry.id) + '">Edit</button></td>'
            + '</tr>';
        }).join('')
        : '<tr><td colspan="4" class="household-concerts-rockville-empty-row">No sets added for ' + escapeHtml(activeDay.label) + ' yet.</td></tr>')
      + '</tbody></table></div>'
      + '</section>';
  }

  async function saveRockvilleSet(form) {
    var record = serializeForm(form);
    var dayKey = normalizeRockvilleDayKey(record.Rockville_Day || (state.rockvilleView && state.rockvilleView.formDay) || 'thursday');
    var setId = String(record.Rockville_Set_Id || '').trim();
    var existingSet = getRockvilleSetById(dayKey, setId);
    var nextSet = normalizeRockvilleSet({
      id: setId || generateRockvilleSetId(),
      band: record.Band,
      stage: record.Stage,
      setStartTime: record.Set_Start_Time,
      createdAt: existingSet ? existingSet.createdAt : Date.now(),
      updatedAt: Date.now()
    });
    if (existingSet) {
      nextSet.__rowIndex = existingSet.__rowIndex;
      nextSet.__rowId = existingSet.__rowId;
    }
    var saveResult = upsertRockvilleSetForDay(dayKey, nextSet);
    persistRockville2026Data();
    setRockvilleSyncStatus('local-only', 'Rockville 2026 set saved locally. Waiting for Excel sync to finish.');
    state.rockvilleView.open = true;
    state.rockvilleView.page = 'schedule';
    state.rockvilleView.activeDay = dayKey;
    state.rockvilleView.formDay = dayKey;
    state.rockvilleView.editingSetId = '';
    renderAll();
    try {
      var syncedSet = await syncRockvilleSetToWorkbook(dayKey, saveResult.savedSet || nextSet);
      upsertRockvilleSetForDay(dayKey, syncedSet);
      persistRockville2026Data();
      setRockvilleSyncStatus('synced', 'Latest Rockville 2026 changes are synced to ' + WORKBOOK_NAME + '.');
      setStatus((saveResult.existingIndex >= 0 ? 'Updated' : 'Added') + ' Rockville 2026 set for ' + getRockvilleDayMeta(dayKey).label + ' and synced it to ' + WORKBOOK_NAME + '.', 'success');
    } catch (error) {
      console.warn('⚠️ Rockville 2026 Excel sync pending:', error && error.message ? error.message : error);
      setRockvilleSyncStatus('local-only', 'Latest Rockville 2026 changes are stored locally because Excel sync is pending.');
      setStatus((saveResult.existingIndex >= 0 ? 'Updated' : 'Added') + ' Rockville 2026 set for ' + getRockvilleDayMeta(dayKey).label + ' locally. Excel sync is pending: ' + (error && error.message ? error.message : 'Unknown sync error') + '.', 'warning');
    }
    renderAll();
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

  function getAllKnownVenueOptions() {
    var fromHistory = uniqueStrings([].concat(
      state.attendedConcerts.map(function (item) { return String((item && item.venue) || '').trim(); }),
      state.upcomingConcerts.map(function (item) { return String((item && item.venue) || '').trim(); })
    ).filter(Boolean));
    return uniqueStrings([].concat(VENUE_PRESET_OPTIONS, fromHistory)).sort(function (a, b) {
      return String(a || '').localeCompare(String(b || ''));
    });
  }

  function renderVenueDatalistHtml(listId) {
    return '<datalist id="' + escapeHtml(listId) + '">' + getAllKnownVenueOptions().map(function (venueName) {
      return '<option value="' + escapeHtml(venueName) + '"></option>';
    }).join('') + '</datalist>';
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

  function excelSerialToIsoDate(serialValue) {
    var numeric = Number(serialValue);
    if (!Number.isFinite(numeric)) return '';
    var wholeDays = Math.floor(numeric);
    // Prevent treating plain years (e.g. 2024) as serials.
    if (wholeDays < 20000 || wholeDays > 80000) return '';
    var excelEpochUtc = Date.UTC(1899, 11, 30);
    var utcMs = excelEpochUtc + (wholeDays * 24 * 60 * 60 * 1000);
    var date = new Date(utcMs);
    if (Number.isNaN(date.getTime())) return '';
    return [date.getUTCFullYear(), String(date.getUTCMonth() + 1).padStart(2, '0'), String(date.getUTCDate()).padStart(2, '0')].join('-');
  }

  function toIsoDate(value) {
    if (!value && value !== 0) return '';
    var str = String(value).trim();
    if (!str) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    if (/^\d+(?:\.\d+)?$/.test(str)) {
      var excelIso = excelSerialToIsoDate(str);
      if (excelIso) return excelIso;
    }
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

  function formatTimeShort(value) {
    if (!value) return '';
    var date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString(undefined, {
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

  function parseYearFromDateString(value) {
    var text = String(value || '').trim();
    var match = text.match(/(19|20)\d{2}/);
    return match ? String(match[0]) : '';
  }

  function mergeDiscographyEntriesWithYears(baseValue, additions) {
    var baseList = splitList(baseValue);
    var extra = Array.isArray(additions) ? additions : [];
    var byKey = {};
    baseList.forEach(function (entry) {
      var clean = String(entry || '').trim();
      if (!clean) return;
      byKey[normalizeText(clean)] = clean;
    });
    extra.forEach(function (row) {
      var title = String(row && row.title ? row.title : '').trim();
      if (!title) return;
      var year = parseYearFromDateString(row && row.year ? row.year : '');
      var label = year ? (title + ' (' + year + ')') : title;
      byKey[normalizeText(title)] = label;
    });
    return Object.keys(byKey).map(function (key) { return byKey[key]; }).filter(Boolean).join(', ');
  }

  function mergeTopSongCandidates(baseCandidates, incomingCandidates) {
    var merged = {};
    function absorb(list) {
      (Array.isArray(list) ? list : []).forEach(function (item) {
        var title = String(item && item.title ? item.title : item).trim();
        if (!title) return;
        var key = normalizeText(title);
        var score = Number(item && item.score);
        var source = String(item && item.source ? item.source : '').trim();
        if (!merged[key]) merged[key] = { title: title, score: 0, sources: [] };
        merged[key].score += Number.isFinite(score) ? score : 1;
        if (source) merged[key].sources.push(source);
        if (title.length > merged[key].title.length) merged[key].title = title;
      });
    }
    absorb(baseCandidates);
    absorb(incomingCandidates);
    return Object.keys(merged).map(function (key) {
      var row = merged[key];
      return {
        title: row.title,
        score: row.score,
        sources: uniqueStrings(row.sources)
      };
    }).sort(function (a, b) {
      return b.score - a.score || a.title.localeCompare(b.title);
    });
  }

  function formatTopSongsFromCandidates(candidates) {
    return mergeTopSongCandidates(candidates, []).slice(0, 8).map(function (item) {
      return item.title;
    }).join(', ');
  }

  function summarizeLinkCompletenessForBandShape(bandLike) {
    var source = bandLike && typeof bandLike === 'object' ? bandLike : {};
    var checks = [
      { key: 'websiteUrl', label: 'Website' },
      { key: 'tourPageUrl', label: 'Tour' },
      { key: 'facebookUrl', label: 'Facebook' },
      { key: 'instagramUrl', label: 'Instagram' },
      { key: 'youTubeUrl', label: 'YouTube' },
      { key: 'setlistUrl', label: 'Setlist.fm' },
      { key: 'bandsintownUrl', label: 'Bandsintown' },
      { key: 'wikipediaUrl', label: 'Wikipedia' }
    ];
    var missing = checks.filter(function (entry) {
      return !String(source[entry.key] || '').trim();
    }).map(function (entry) { return entry.label; });
    var score = Math.round(((checks.length - missing.length) / checks.length) * 100);
    return {
      score: score,
      missing: missing
    };
  }

  function computeBandEnrichmentHealth(bandLike, metaLike) {
    var band = bandLike && typeof bandLike === 'object' ? bandLike : {};
    var meta = metaLike && typeof metaLike === 'object' ? metaLike : {};
    var links = summarizeLinkCompletenessForBandShape(band);
    var releases = Array.isArray(band.releases) && band.releases.length
      ? band.releases
      : splitList(band.discography || '');
    var songs = Array.isArray(band.songs) && band.songs.length
      ? band.songs
      : splitList(band.topSongs || '');
    var candidates = mergeTopSongCandidates(band.topSongCandidates || [], []);
    var timelineText = String(band.memberTimeline || '').trim();
    var membersCount = Array.isArray(band.members) && band.members.length
      ? band.members.length
      : splitList(band.bandMembers || '').length;
    var hasLastReleaseDate = !!toIsoDate(band.lastReleaseDate);

    var components = [];

    components.push({
      key: 'links',
      label: 'Links',
      weight: 35,
      available: true,
      score: links.score
    });

    var timelineScore = 0;
    var timelineAvailable = !!(timelineText || membersCount);
    if (timelineText) {
      var timelineMarkers = (timelineText.match(/(19|20)\d{2}/g) || []).length;
      timelineScore = Math.min(100, 55 + (timelineMarkers * 12) + (timelineText.length >= 90 ? 15 : 0));
    } else if (membersCount) {
      timelineScore = Math.min(45, 20 + (membersCount * 8));
    }
    components.push({
      key: 'timeline',
      label: 'Timeline',
      weight: 25,
      available: timelineAvailable,
      score: timelineScore
    });

    var releaseScore = 0;
    var releaseAvailable = releases.length > 0 || hasLastReleaseDate;
    if (releaseAvailable) {
      releaseScore = Math.min(100, Math.round((Math.min(releases.length, 8) / 8) * 90 + (hasLastReleaseDate ? 10 : 0)));
    }
    components.push({
      key: 'releases',
      label: 'Release depth',
      weight: 20,
      available: releaseAvailable,
      score: releaseScore
    });

    var topTrackScore = 0;
    var topTrackAvailable = candidates.length > 0 || songs.length > 0;
    if (candidates.length) {
      var totalCandidateScore = candidates.reduce(function (sum, entry) {
        var score = Number(entry && entry.score);
        return sum + (Number.isFinite(score) && score > 0 ? score : 1);
      }, 0);
      var leadScore = Number(candidates[0] && candidates[0].score);
      var leadShare = totalCandidateScore > 0
        ? ((Number.isFinite(leadScore) && leadScore > 0 ? leadScore : 1) / totalCandidateScore)
        : 0;
      var coverage = Math.min(candidates.length, 8) / 8;
      topTrackScore = Math.round(Math.min(1, (leadShare * 0.6) + (coverage * 0.4)) * 100);
    } else if (songs.length) {
      topTrackScore = Math.min(70, 35 + (songs.length * 7));
    }
    components.push({
      key: 'topTracks',
      label: 'Top tracks',
      weight: 20,
      available: topTrackAvailable,
      score: topTrackScore
    });

    var availableComponents = components.filter(function (entry) { return !!entry.available; });
    var weightSum = availableComponents.reduce(function (sum, entry) { return sum + entry.weight; }, 0);
    var rawScore = weightSum
      ? Math.round(availableComponents.reduce(function (sum, entry) { return sum + (entry.score * entry.weight); }, 0) / weightSum)
      : 0;

    var evidenceCap = 100;
    if (availableComponents.length <= 1) evidenceCap = 60;
    else if (availableComponents.length === 2) evidenceCap = 80;
    else if (availableComponents.length === 3) evidenceCap = 92;

    var score = Math.max(0, Math.min(evidenceCap, rawScore));
    var sourceCount = Array.isArray(meta.sourceKeys) ? meta.sourceKeys.length : 0;
    var confidenceLabel = String(meta.enrichmentConfidence || '').trim();

    return {
      score: score,
      availableSignals: availableComponents.length,
      confidence: confidenceLabel,
      sourceCount: sourceCount,
      breakdown: components.map(function (entry) {
        return {
          key: entry.key,
          label: entry.label,
          score: Math.round(Math.max(0, Math.min(100, Number(entry.score) || 0))),
          available: !!entry.available,
          weight: entry.weight
        };
      })
    };
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
    var schemaWarning = String(state.attendedBySchemaWarning || '').trim();
    el.className = 'household-concerts-status household-concerts-status--' + tone;
    el.innerHTML = '<span>' + escapeHtml(state.status && state.status.message ? state.status.message : '') + '</span>'
      + (schemaWarning
        ? '<small id="householdConcertsSchemaWarning" class="household-concerts-schema-warning">'
          + '<span>' + escapeHtml(schemaWarning) + '</span> '
          + '<button type="button" class="pill-button household-concerts-schema-warning-copy" data-concert-action="copy-schema-fix-steps">Copy schema fix steps</button>'
          + '</small>'
        : '');
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
    return BAND_PHOTOS_ROOT_PATH + '/' + bandPart + '/' + stamp + '-' + rolePart + '-' + namePart;
  }

  function parentFolderPath(filePath) {
    var value = String(filePath || '').trim();
    if (!value || value.indexOf('/') < 0) return '';
    return value.slice(0, value.lastIndexOf('/'));
  }

  async function ensureDriveFolderPath(folderPath) {
    var cleanPath = String(folderPath || '').trim().replace(/^\/+|\/+$/g, '');
    if (!cleanPath) return;
    var segments = cleanPath.split('/').map(function (part) { return String(part || '').trim(); }).filter(Boolean);
    if (!segments.length) return;

    var currentPath = '';
    var currentItem = { id: 'root', isRoot: true };
    for (var i = 0; i < segments.length; i += 1) {
      var segment = segments[i];
      currentPath = currentPath ? (currentPath + '/' + segment) : segment;
      try {
        currentItem = await fetchJson('https://graph.microsoft.com/v1.0/me/drive/root:/' + encodeGraphPath(currentPath));
        currentItem.isRoot = false;
        continue;
      } catch (error) {
        if (!isGraphItemNotFoundError(error)) throw error;
      }

      var createUrl = currentItem.isRoot
        ? 'https://graph.microsoft.com/v1.0/me/drive/root/children'
        : ('https://graph.microsoft.com/v1.0/me/drive/items/' + encodeURIComponent(currentItem.id) + '/children');
      currentItem = await fetchJson(createUrl, {
        method: 'POST',
        body: {
          name: segment,
          folder: {},
          '@microsoft.graph.conflictBehavior': 'replace'
        }
      });
      currentItem.isRoot = false;
    }
  }

  function getBandPageCount(totalCount) {
    var count = Math.max(1, Number(totalCount) || 0);
    return Math.max(1, Math.ceil(count / BAND_DASHBOARD_PAGE_SIZE));
  }

  function clampBandsPage(totalCount) {
    var pageCount = getBandPageCount(totalCount);
    state.bandsPage = Math.max(1, Math.min(pageCount, Number(state.bandsPage) || 1));
    return state.bandsPage;
  }

  function parseTimelineEntry(rawLine) {
    var raw = String(rawLine || '').trim();
    if (!raw) return null;
    var status = /^(former|past)/i.test(raw) ? 'former' : (/^(current|present)/i.test(raw) ? 'current' : 'member');
    var cleaned = raw.replace(/^(former|past|current|present)\s*:\s*/i, '').trim();
    var yearMatch = cleaned.match(/(19|20)\d{2}\s*[-]\s*((19|20)\d{2}|present)/i);
    var era = yearMatch ? yearMatch[0].replace(/\s+/g, ' ').trim() : '';
    var name = cleaned.replace(/\(([^)]*)\)/g, '').replace(/\s{2,}/g, ' ').trim();
    if (!name) name = cleaned;
    return { name: name, era: era, status: status };
  }

  function getBandTimelineEntries(band) {
    var rows = [];
    var timelineRows = String((band && band.memberTimeline) || '').split(/\n+/);
    timelineRows.forEach(function (row) {
      var parsed = parseTimelineEntry(row);
      if (parsed) rows.push(parsed);
    });
    if (!rows.length) {
      splitList((band && band.bandMembers) || '').forEach(function (memberRow) {
        var memberName = String(memberRow || '').split('—')[0].trim();
        if (!memberName) return;
        rows.push({ name: memberName, era: '', status: 'member' });
      });
    }
    return rows.slice(0, 14);
  }

  function renderBandTimelineVisual(band) {
    var entries = getBandTimelineEntries(band);
    if (!entries.length) return '<p class="household-concerts-muted">Use refresh to enrich current/former members by era.</p>';
    return '<div class="household-concerts-timeline">' + entries.map(function (entry) {
      return '<div class="household-concerts-timeline-item household-concerts-timeline-item--' + escapeHtml(entry.status) + '">'
        + '<span class="household-concerts-timeline-dot" aria-hidden="true"></span>'
        + '<div class="household-concerts-timeline-content"><strong>' + escapeHtml(entry.name) + '</strong>' + (entry.era ? ('<span>' + escapeHtml(entry.era) + '</span>') : '') + '</div>'
        + '</div>';
    }).join('') + '</div>';
  }

  async function uploadBandImageToOneDrive(fileOrBlob, meta, role, fileName) {
    if (!fileOrBlob) throw new Error('Select an image first.');
    var safeMeta = meta && typeof meta === 'object' ? meta : {};
    var inferredName = fileName || fileOrBlob.name || (normalizeKey(safeMeta.bandName || 'band') || 'band') + '-' + (role || 'image') + '.jpg';
    var uploadPath = buildBandPhotoUploadPath(safeMeta, inferredName, role);
    var folderPath = parentFolderPath(uploadPath);
    if (folderPath) await ensureDriveFolderPath(folderPath);
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
    return {
      url: resolvedUrl,
      uploadPath: uploadPath,
      fileId: String(payload.id || '').trim(),
      fileName: String(payload.name || inferredName || '').trim()
    };
  }

  async function uploadBandImageFromUrl(imageUrl, meta, role) {
    var url = String(imageUrl || '').trim();
    if (!url) throw new Error('Enter an image URL first.');
    var blob = await fetchBandImageBlobWithFallback(url);
    var extension = inferImageExtensionFromMime(blob.type, url);
    var result = await uploadBandImageToOneDrive(blob, meta, role, (normalizeKey((meta && meta.bandName) || 'band') || 'band') + '-' + role + extension);
    return result && result.url ? result.url : String(result || '').trim();
  }

  function inferImageExtensionFromMime(mimeType, sourceUrl) {
    var mime = String(mimeType || '').toLowerCase();
    if (mime.indexOf('image/png') === 0) return '.png';
    if (mime.indexOf('image/webp') === 0) return '.webp';
    if (mime.indexOf('image/gif') === 0) return '.gif';
    if (mime.indexOf('image/svg') === 0) return '.svg';
    if (mime.indexOf('image/jpeg') === 0 || mime.indexOf('image/jpg') === 0) return '.jpg';
    var safeSource = String(sourceUrl || '').toLowerCase();
    if (/\.png(\?|$)/.test(safeSource)) return '.png';
    if (/\.webp(\?|$)/.test(safeSource)) return '.webp';
    if (/\.gif(\?|$)/.test(safeSource)) return '.gif';
    if (/\.svg(\?|$)/.test(safeSource)) return '.svg';
    return '.jpg';
  }

  function isImageBlobLike(blob, sourceUrl) {
    if (!blob) return false;
    var mime = String(blob.type || '').toLowerCase();
    if (/^image\//.test(mime)) return true;
    return /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(String(sourceUrl || ''));
  }

  async function fetchImageBlobDirect(url) {
    var response = await fetch(safeUrl(url), {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit'
    });
    if (!response.ok) throw new Error('Could not download image (' + response.status + ').');
    var blob = await response.blob();
    if (!isImageBlobLike(blob, url)) {
      throw new Error('That URL did not return an image file.');
    }
    return blob;
  }

  async function fetchImageBlobViaProxy(url) {
    var response = await fetch('/api/public/image-fetch?url=' + encodeURIComponent(url), {
      method: 'GET',
      headers: { Accept: 'image/*' }
    });
    if (!response.ok) throw new Error('Proxy image fetch failed (' + response.status + ').');
    var blob = await response.blob();
    if (!isImageBlobLike(blob, url)) {
      throw new Error('Proxy response was not an image file.');
    }
    return blob;
  }

  async function fetchBandImageBlobWithFallback(url) {
    var directError = null;
    try {
      return await fetchImageBlobDirect(url);
    } catch (error) {
      directError = error;
    }
    try {
      return await fetchImageBlobViaProxy(url);
    } catch (proxyError) {
      var directMessage = directError && directError.message ? String(directError.message) : 'Direct fetch failed.';
      var proxyMessage = proxyError && proxyError.message ? String(proxyError.message) : 'Proxy fetch failed.';
      throw new Error('Could not import image URL. ' + directMessage + ' ' + proxyMessage + '');
    }
  }

  function scoreBandImageCandidate(candidate, cleanBandName) {
    var safe = candidate && typeof candidate === 'object' ? candidate : {};
    var score = 0;
    var source = normalizeText(safe.source);
    var intent = normalizeText(safe.intent);
    var haystack = normalizeText([safe.label, safe.url, safe.thumbUrl].join(' '));
    var bandKey = normalizeText(cleanBandName).replace(/^the\s+/, '');

    if (source.indexOf('wikimedia') >= 0) score += 90;
    if (source.indexOf('apple') >= 0) score += 30;
    if (intent === 'logo') score += 50;
    if (intent === 'group-photo') score += 45;
    if (bandKey && haystack.indexOf(bandKey) >= 0) score += 20;
    if (/\blogo\b/.test(haystack)) score += 30;
    if (/\b(group|band)\s+(photo|image|members?)\b/.test(haystack)) score += 25;
    if (/\b(album|single|ep|soundtrack|cover art|artwork)\b/.test(haystack)) score -= 45;

    return score;
  }

   async function fetchWikimediaImageCandidates(bandName) {
     var cleanName = String(bandName || '').trim();
     if (!cleanName) return [];
     var intents = [
       { key: 'logo', query: cleanName + ' band logo' },
       { key: 'group-photo', query: cleanName + ' band photo' }
     ];
    var candidates = [];

    for (var i = 0; i < intents.length; i += 1) {
      var intent = intents[i];
      var searchUrl = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&list=search&srnamespace=6&srlimit=8&srsearch=' + encodeURIComponent(intent.query);
      var searchPayload = await fetchJsonPublic(searchUrl).catch(function () { return {}; });
      var rows = searchPayload && searchPayload.query && Array.isArray(searchPayload.query.search)
        ? searchPayload.query.search
        : [];
      var titles = rows.map(function (row) { return String(row && row.title ? row.title : '').trim(); }).filter(Boolean);
      if (!titles.length) continue;

      var detailUrl = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=url|mime&iiurlwidth=320&titles=' + encodeURIComponent(titles.join('|'));
      var detailPayload = await fetchJsonPublic(detailUrl).catch(function () { return {}; });
      var pages = detailPayload && detailPayload.query && detailPayload.query.pages ? detailPayload.query.pages : {};

      Object.keys(pages).forEach(function (pageKey) {
        var page = pages[pageKey] || {};
        var imageInfo = Array.isArray(page.imageinfo) ? page.imageinfo[0] : null;
        var imageUrl = String(imageInfo && imageInfo.url ? imageInfo.url : '').trim();
        if (!imageUrl) return;
        candidates.push({
          url: imageUrl,
          thumbUrl: String(imageInfo.thumburl || imageUrl).trim(),
          label: String(page.title || intent.query).replace(/^File:/i, '').trim(),
          source: 'Wikimedia Commons',
          intent: intent.key
        });
      });
    }

    return candidates;
  }

  async function fetchBandImageCandidates(bandName) {
    var cleanName = String(bandName || '').trim();
    if (!cleanName) throw new Error('Enter a band name first.');
    var sources = [];
    var commonsCandidates = await fetchWikimediaImageCandidates(cleanName).catch(function () { return []; });
    sources.push.apply(sources, commonsCandidates);
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
        source: 'Apple Music',
        intent: /\b(album|single|ep)\b/i.test(String(entry.collectionName || entry.trackName || '')) ? 'album' : 'artist'
      });
    });
    var unique = [];
    sources.forEach(function (item) {
      if (!item.url) return;
      if (unique.some(function (existing) { return normalizeText(existing.url) === normalizeText(item.url); })) return;
      item.rankScore = scoreBandImageCandidate(item, cleanName);
      unique.push(item);
    });
    unique.sort(function (a, b) {
      return (Number(b.rankScore) || 0) - (Number(a.rankScore) || 0);
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
    return [state.workbookPathHint].concat(WORKBOOK_PREFIXES.map(function (prefix) {
      return String(prefix || '') + WORKBOOK_NAME;
    })).filter(function (candidate) {
      if (!candidate || seen.has(candidate)) return false;
      seen.add(candidate);
      return true;
    });
  }

  async function probeWorkbookPathCandidate(filePath) {
    var candidate = String(filePath || '').trim();
    if (!candidate) {
      return { ok: false, message: 'empty candidate' };
    }
    var encodedPath = encodeGraphPath(candidate);
    var tableRef = encodeURIComponent(FAVORITE_TABLE);
    var baseUrl = 'https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/tables/' + tableRef;
    var payload = await fetchJson(baseUrl + '/columns?$select=name,index');
    var columns = Array.isArray(payload.value) ? payload.value : [];
    return {
      ok: true,
      columnCount: columns.length
    };
  }

  async function collectWorkbookPathDiagnostics() {
    var report = {
      generatedAt: Date.now(),
      currentResolvedPath: String(state.workbookPath || '').trim(),
      currentHintPath: String(state.workbookPathHint || '').trim(),
      resolvedPath: '',
      discoveryError: '',
      checks: []
    };

    var seen = new Set();
    var candidates = getWorkbookPathCandidates().map(function (path) {
      return { path: path, source: 'configured' };
    });

    try {
      var discovered = await discoverWorkbookPathCandidates();
      discovered.forEach(function (path) {
        var key = normalizeText(path);
        if (!key || seen.has(key)) return;
        seen.add(key);
        candidates.push({ path: path, source: 'drive-search' });
      });
    } catch (error) {
      report.discoveryError = String(error && error.message ? error.message : 'Discovery request failed.');
    }

    candidates.forEach(function (entry) {
      var key = normalizeText(entry.path);
      if (!key || seen.has(key)) return;
      seen.add(key);
      report.checks.push({ path: entry.path, source: entry.source, ok: false, message: 'pending' });
    });

    for (var i = 0; i < report.checks.length; i += 1) {
      var check = report.checks[i];
      try {
        var probe = await probeWorkbookPathCandidate(check.path);
        check.ok = !!probe.ok;
        check.message = probe.ok
          ? ('Found table "' + FAVORITE_TABLE + '" (' + (probe.columnCount || 0) + ' columns).')
          : String(probe.message || 'Probe failed.');
        if (!report.resolvedPath && check.ok) report.resolvedPath = check.path;
      } catch (error) {
        check.ok = false;
        check.message = String(error && error.message ? error.message : 'Probe failed.');
      }
    }

    return report;
  }

  function renderWorkbookPathDiagnosticsHtml(report) {
    var safe = report && typeof report === 'object' ? report : {};
    var checks = Array.isArray(safe.checks) ? safe.checks : [];
    var generatedLabel = formatDateTimeShort(safe.generatedAt) || 'Unknown time';
    var resolvedPath = String(safe.resolvedPath || '').trim();
    var currentPath = String(safe.currentResolvedPath || '').trim();
    var hintPath = String(safe.currentHintPath || '').trim();
    return '<div class="household-concerts-band-profile">'
      + '<p class="household-concerts-muted">Generated: ' + escapeHtml(generatedLabel) + '</p>'
      + '<div class="household-concerts-band-detail-grid">'
      + detailLine('Resolved by probe', resolvedPath || 'Not found')
      + detailLine('Current cached path', currentPath || 'None')
      + detailLine('Current hint path', hintPath || 'None')
      + '</div>'
      + (safe.discoveryError ? ('<div class="household-concerts-upload-status household-concerts-upload-status--warning">Drive search warning: ' + escapeHtml(safe.discoveryError) + '</div>') : '')
      + '<div class="household-concerts-panel"><h4>Path checks</h4>'
      + (checks.length
        ? checks.map(function (check) {
          return '<article class="household-concerts-entry-card">'
            + '<div class="household-concerts-entry-head"><div><h4>' + escapeHtml(check.path || '') + '</h4><p>' + escapeHtml(check.source || 'configured') + '</p></div><div class="household-concerts-upcoming-distance">' + (check.ok ? 'OK' : 'Fail') + '</div></div>'
            + '<p class="household-concerts-muted">' + escapeHtml(check.message || '') + '</p>'
            + '</article>';
        }).join('')
        : '<p class="household-concerts-muted">No candidate paths were available.</p>')
      + '</div>'
      + '<div class="household-concerts-form-actions"><button type="button" class="pill-button" data-concert-action="copy-workbook-path-diagnostics-json">Copy Diagnostics JSON</button><button type="button" class="pill-button" data-concert-action="download-workbook-path-diagnostics-json">Download Diagnostics .json</button><button type="button" class="pill-button" data-concert-action="open-workbook-path-diagnostics">Re-run diagnostics</button><button type="button" class="pill-button" data-concert-action="close-modal">Close</button></div>'
      + '</div>';
  }

  function downloadWorkbookPathDiagnosticsJson(report) {
    var payload = report && typeof report === 'object' ? report : null;
    if (!payload) return false;
    var rawStamp = String(new Date(payload.generatedAt || Date.now()).toISOString());
    var stamp = rawStamp.replace(/[:]/g, '-').replace(/\..+$/, '');
    var fileName = 'concerts-workbook-path-diagnostics-' + stamp + '.json';
    var body = JSON.stringify(payload, null, 2);
    var blob = new Blob([body], { type: 'application/json;charset=utf-8' });
    var objectUrl = URL.createObjectURL(blob);
    var anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(objectUrl);
    return true;
  }

  function openWorkbookPathDiagnosticsModal() {
    state.lastWorkbookPathDiagnosticsReport = null;
    openModal(
      '<div class="household-concerts-modal-head"><div><h3>Workbook Path Diagnostics</h3><p>Shows every workbook path candidate checked for Concerts data loading.</p></div><button type="button" class="household-concerts-icon-btn" data-concert-action="close-modal">✕</button></div>'
      + '<div id="householdConcertsWorkbookDiagnosticsBody" class="household-concerts-band-profile">'
      + '<div class="household-concerts-upload-status household-concerts-upload-status--info">Checking workbook path candidates…</div>'
      + '</div>'
    );
    (async function () {
      var bodyEl = document.getElementById('householdConcertsWorkbookDiagnosticsBody');
      if (!bodyEl) return;
      try {
        var report = await collectWorkbookPathDiagnostics();
        state.lastWorkbookPathDiagnosticsReport = report;
        bodyEl.innerHTML = renderWorkbookPathDiagnosticsHtml(report);
      } catch (error) {
        state.lastWorkbookPathDiagnosticsReport = null;
        bodyEl.innerHTML = '<div class="household-concerts-upload-status household-concerts-upload-status--error">'
          + escapeHtml(error && error.message ? error.message : 'Could not run workbook diagnostics.')
          + '</div><div class="household-concerts-form-actions"><button type="button" class="pill-button" data-concert-action="open-workbook-path-diagnostics">Retry</button><button type="button" class="pill-button" data-concert-action="close-modal">Close</button></div>';
      }
    })();
  }

  function buildWorkbookPathFromDriveItem(item) {
    var safeItem = item && typeof item === 'object' ? item : {};
    var itemName = String(safeItem.name || '').trim();
    if (!itemName) return '';
    var parentPath = String((safeItem.parentReference && safeItem.parentReference.path) || '').trim();
    var rootPrefix = '/drive/root:';
    if (parentPath.indexOf(rootPrefix) === 0) {
      parentPath = parentPath.slice(rootPrefix.length);
    }
    parentPath = parentPath.replace(/^\/+|\/+$/g, '');
    return parentPath ? (parentPath + '/' + itemName) : itemName;
  }

  async function discoverWorkbookPathCandidates() {
    var searchUrl = 'https://graph.microsoft.com/v1.0/me/drive/root/search(q=%27' + encodeURIComponent(WORKBOOK_NAME) + '%27)?$select=name,parentReference';
    var payload = await fetchJson(searchUrl);
    var seen = new Set();
    return (Array.isArray(payload.value) ? payload.value : []).map(function (item) {
      return buildWorkbookPathFromDriveItem(item);
    }).filter(function (candidate) {
      if (!candidate || seen.has(candidate)) return false;
      seen.add(candidate);
      return true;
    });
  }

  function getTableSchemaCacheKey(filePath, tableName) {
    return normalizeKey(filePath) + '::' + normalizeKey(tableName);
  }

  function cloneTableColumns(columns) {
    return (Array.isArray(columns) ? columns : []).map(function (column, index) {
      return {
        name: String(column && column.name ? column.name : '').trim(),
        index: Number.isInteger(column && column.index) ? column.index : index
      };
    }).filter(function (column) {
      return !!column.name;
    });
  }

  function getCachedTableColumns(filePath, tableName) {
    var cacheKey = getTableSchemaCacheKey(filePath, tableName);
    var cached = state.tableSchemaCache && typeof state.tableSchemaCache === 'object'
      ? state.tableSchemaCache[cacheKey]
      : null;
    return cloneTableColumns(cached);
  }

  function rememberResolvedWorkbookPath(filePath) {
    var resolved = String(filePath || '').trim();
    if (!resolved) return;
    state.workbookPath = resolved;
    state.workbookPathHint = resolved;
    writeStringStorage(WORKBOOK_PATH_STORAGE_KEY, resolved);
  }

  function clearResolvedWorkbookPath(filePath) {
    var resolved = String(filePath || '').trim();
    if (!resolved || state.workbookPath === resolved) state.workbookPath = '';
    if (!resolved || state.workbookPathHint === resolved) state.workbookPathHint = '';
    writeStringStorage(WORKBOOK_PATH_STORAGE_KEY, state.workbookPathHint || '');
  }

  function rememberResolvedTableSchema(filePath, tableName, columns) {
    var cacheKey = getTableSchemaCacheKey(filePath, tableName);
    var nextColumns = cloneTableColumns(columns);
    if (!cacheKey || !nextColumns.length) return;
    state.tableSchemaCache[cacheKey] = nextColumns;
  }

  function clearResolvedTableSchema(filePath, tableName) {
    var cacheKey = getTableSchemaCacheKey(filePath, tableName);
    if (!cacheKey || !state.tableSchemaCache || !Object.prototype.hasOwnProperty.call(state.tableSchemaCache, cacheKey)) return;
    delete state.tableSchemaCache[cacheKey];
  }

  function isGraphItemNotFoundError(error) {
    var message = String(error && error.message ? error.message : '').trim();
    return /graph request failed \(404\)/i.test(message)
      || /itemnotfound/i.test(message)
      || /resource could not be found/i.test(message);
  }

  function isGraphDimensionMismatchError(error) {
    var message = String(error && error.message ? error.message : '').trim();
    return /graph request failed \(400\)/i.test(message)
      && /doesn't match the size or dimensions of the range/i.test(message);
  }

  async function fetchTableColumns(filePath, tableName) {
    var cachedColumns = getCachedTableColumns(filePath, tableName);
    if (cachedColumns.length) return cachedColumns;
    var encodedPath = encodeGraphPath(filePath);
    var tableRef = encodeURIComponent(tableName);
    var baseUrl = 'https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/tables/' + tableRef;
    try {
      var columnsPayload = await fetchJson(baseUrl + '/columns?$select=name,index');
      var columns = Array.isArray(columnsPayload.value) ? columnsPayload.value : [];
      rememberResolvedWorkbookPath(filePath);
      rememberResolvedTableSchema(filePath, tableName, columns);
      return cloneTableColumns(columns);
    } catch (error) {
      if (isGraphItemNotFoundError(error)) {
        clearResolvedTableSchema(filePath, tableName);
        clearResolvedWorkbookPath(filePath);
      }
      throw error;
    }
  }

  async function fetchTableColumnsAndRows(filePath, tableName, top) {
    var columns = await fetchTableColumns(filePath, tableName);
    var safeTop = Math.max(1, Number(top) || 1000);
    var encodedPath = encodeGraphPath(filePath);
    var tableRef = encodeURIComponent(tableName);
    var baseUrl = 'https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/tables/' + tableRef;
    try {
      var rowsPayload = await fetchJson(baseUrl + '/rows?$top=' + safeTop);
      rememberResolvedWorkbookPath(filePath);
      return {
        columns: columns,
        rows: Array.isArray(rowsPayload.value) ? rowsPayload.value : []
      };
    } catch (error) {
      if (isGraphItemNotFoundError(error)) {
        clearResolvedTableSchema(filePath, tableName);
        clearResolvedWorkbookPath(filePath);
      }
      throw error;
    }
  }

  function toRowObjects(columns, rows) {
    var namesByIndex = {};
    (Array.isArray(columns) ? columns : []).forEach(function (column, idx) {
      var index = Number.isInteger(column.index) ? column.index : idx;
      namesByIndex[index] = String(column.name || 'column_' + index).trim();
    });
    return (Array.isArray(rows) ? rows : []).map(function (row, index) {
      var values = Array.isArray(row.values) && Array.isArray(row.values[0]) ? row.values[0] : [];
      var record = {};
      values.forEach(function (value, index) {
        record[namesByIndex[index] || ('column_' + index)] = value;
      });
      record.__rowIndex = Number.isInteger(index) ? index : -1;
      record.__rowId = String(row && row.id ? row.id : '').trim();
      return record;
    });
  }

  async function findWorkbookPath() {
    if (state.workbookPath) return state.workbookPath;
    var candidates = getWorkbookPathCandidates();
    var checked = candidates.slice();
    for (var i = 0; i < candidates.length; i += 1) {
      var candidate = candidates[i];
      try {
        await fetchTableColumns(candidate, FAVORITE_TABLE);
        rememberResolvedWorkbookPath(candidate);
        return candidate;
      } catch (_error) {
        // Probe next candidate.
      }
    }
    try {
      var discoveredCandidates = await discoverWorkbookPathCandidates();
      for (var j = 0; j < discoveredCandidates.length; j += 1) {
        var discovered = discoveredCandidates[j];
        if (!discovered || checked.indexOf(discovered) >= 0) continue;
        checked.push(discovered);
        try {
          await fetchTableColumns(discovered, FAVORITE_TABLE);
          rememberResolvedWorkbookPath(discovered);
          return discovered;
        } catch (_error2) {
          // Probe next discovered candidate.
        }
      }
    } catch (_discoveryError) {
      // Fall through to final error.
    }
    throw new Error('Could not locate ' + WORKBOOK_NAME + '. Checked: ' + checked.join(', '));
  }

  function isConcertsWorkbookUnavailableError(error) {
    var message = String(error && error.message || '').trim();
    return message.indexOf('Could not locate ' + WORKBOOK_NAME + '.') === 0;
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
    var encodedPath = encodeGraphPath(filePath);
    var url = 'https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/tables/' + encodeURIComponent(tableName) + '/rows/add';
    var attemptedSchemaRefresh = false;
    for (;;) {
      try {
        var columns = await fetchTableColumns(filePath, tableName);
        var row = mapRecordToRowByColumns(record, columns || [], {
          audit: true,
          tableName: tableName,
          context: 'appendRecordToTable'
        });
        await fetchJson(url, { method: 'POST', body: { values: [row] } });
        return;
      } catch (error) {
        if (!attemptedSchemaRefresh && isGraphDimensionMismatchError(error)) {
          attemptedSchemaRefresh = true;
          clearResolvedTableSchema(filePath, tableName);
          continue;
        }
        throw error;
      }
    }
  }

  async function updateRecordInTableByIndex(filePath, tableName, rowIndex, record) {
    var safeRowIndex = Number(rowIndex);
    if (!Number.isInteger(safeRowIndex) || safeRowIndex < 0) {
      throw new Error('Could not determine the target row index for this Favorite Band update.');
    }
    var encodedPath = encodeGraphPath(filePath);
    var url = 'https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/tables/' + encodeURIComponent(tableName) + '/rows/itemAt(index=' + safeRowIndex + ')';
    var attemptedSchemaRefresh = false;
    for (;;) {
      try {
        var columns = await fetchTableColumns(filePath, tableName);
        var row = mapRecordToRowByColumns(record, columns || [], {
          audit: true,
          tableName: tableName,
          context: 'updateRecordInTableByIndex'
        });
        await fetchJson(url, { method: 'PATCH', body: { values: [row] } });
        return;
      } catch (error) {
        if (!attemptedSchemaRefresh && isGraphDimensionMismatchError(error)) {
          attemptedSchemaRefresh = true;
          clearResolvedTableSchema(filePath, tableName);
          continue;
        }
        throw error;
      }
    }
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

  function readFavoriteBandValue(record, fieldKey) {
    return readValue(record, FAVORITE_BAND_FIELD_ALIASES[fieldKey] || []);
  }

  function concertNoteKey(bandName, concertDate, venue) {
    return [normalizeKey(bandName), toIsoDate(concertDate), normalizeKey(venue)].join('::');
  }

  function normalizeHistoricEditMetaEntry(entry) {
    var source = entry && typeof entry === 'object' ? entry : {};
    var editedAtValue = Number(source.editedAt);
    return {
      editedAt: Number.isFinite(editedAtValue) ? editedAtValue : 0,
      note: String(source.note || '').trim()
    };
  }

  function readHistoricEditMetaByNoteKey(noteKey) {
    var key = String(noteKey || '').trim();
    if (!key) return { editedAt: 0, note: '' };
    return normalizeHistoricEditMetaEntry(state.historicEditMeta[key]);
  }

  function writeHistoricEditMetaByNoteKey(noteKey, meta) {
    var key = String(noteKey || '').trim();
    if (!key) return;
    var normalized = normalizeHistoricEditMetaEntry(meta);
    if (!normalized.editedAt && !normalized.note) {
      delete state.historicEditMeta[key];
    } else {
      state.historicEditMeta[key] = normalized;
    }
    writeJsonStorage(HISTORIC_EDIT_META_STORAGE_KEY, state.historicEditMeta);
  }

  function removeHistoricEditMetaByNoteKey(noteKey) {
    var key = String(noteKey || '').trim();
    if (!key) return;
    if (!Object.prototype.hasOwnProperty.call(state.historicEditMeta, key)) return;
    delete state.historicEditMeta[key];
    writeJsonStorage(HISTORIC_EDIT_META_STORAGE_KEY, state.historicEditMeta);
  }

  function isHistoricImportNote(noteText) {
    return /^\s*imported from\s+/i.test(String(noteText || ''));
  }

  function isHistoricImportedConcert(concertLike) {
    var concert = concertLike && typeof concertLike === 'object' ? concertLike : {};
    if (isHistoricImportNote(concert.notes || '')) return true;
    var noteKey = concertNoteKey(concert.bandName, concert.concertDate, concert.venue);
    var historicMeta = readHistoricEditMetaByNoteKey(noteKey);
    return !!historicMeta.editedAt;
  }

  function formatHistoricEditBadgeLabel(metaLike) {
    var meta = normalizeHistoricEditMetaEntry(metaLike);
    if (!meta.editedAt) return '';
    var timeLabel = formatDateTimeShort(new Date(meta.editedAt));
    return timeLabel ? ('Historic import edited ' + timeLabel) : 'Historic import edited';
  }

  function normalizeAttendedBy(value) {
    var raw = String(value || '').trim();
    if (!raw) return 'Both';
    var normalized = raw.toLowerCase().replace(/\s+/g, ' ').trim();
    if (normalized === 'kyle') return 'Kyle';
    if (normalized === 'heather') return 'Heather';
    if (normalized === 'both') return 'Both';
    if (normalized.indexOf('kyle') >= 0 && normalized.indexOf('heather') >= 0) return 'Both';
    return 'Both';
  }

  function getAttendedByLabel(value) {
    var normalized = normalizeAttendedBy(value);
    if (normalized === 'Kyle') return 'Kyle';
    if (normalized === 'Heather') return 'Heather';
    return 'Kyle + Heather';
  }

  function getAttendedByParticipants(value) {
    var normalized = normalizeAttendedBy(value);
    if (normalized === 'Both') return ['Kyle', 'Heather'];
    return [normalized];
  }

  function summarizeAttendeeCounts(concerts) {
    var summary = {
      householdTotal: Array.isArray(concerts) ? concerts.length : 0,
      kyleCount: 0,
      heatherCount: 0,
      bothCount: 0,
      kyleSoloCount: 0,
      heatherSoloCount: 0
    };
    (Array.isArray(concerts) ? concerts : []).forEach(function (concert) {
      var attendedBy = normalizeAttendedBy(concert && concert.attendedBy);
      if (attendedBy === 'Both') {
        summary.kyleCount += 1;
        summary.heatherCount += 1;
        summary.bothCount += 1;
        return;
      }
      if (attendedBy === 'Kyle') {
        summary.kyleCount += 1;
        summary.kyleSoloCount += 1;
        return;
      }
      summary.heatherCount += 1;
      summary.heatherSoloCount += 1;
    });
    return summary;
  }

  function formatAttendeeBreakdown(summary) {
    var source = summary && typeof summary === 'object' ? summary : summarizeAttendeeCounts([]);
    return 'Kyle ' + source.kyleCount + ' • Heather ' + source.heatherCount + ' • Together ' + source.bothCount;
  }

  function getAttendedBySchemaFixStepsText() {
    return [
      'Fix Attended_By schema in Excel:',
      '1) Open workbook "' + WORKBOOK_NAME + '".',
      '2) Open table "' + ATTENDED_TABLE + '".',
      '3) Add a text column named "Attended_By".',
      '4) Allowed values: Kyle, Heather, Both.',
      '5) Save workbook and click Refresh in Concerts.'
    ].join('\n');
  }

  async function copyTextToClipboard(text) {
    var value = String(text || '').trim();
    if (!value) return false;
    try {
      if (global.navigator && global.navigator.clipboard && typeof global.navigator.clipboard.writeText === 'function') {
        await global.navigator.clipboard.writeText(value);
        return true;
      }
    } catch (_error) {
      // Fallback below.
    }
    try {
      var textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.setAttribute('readonly', 'readonly');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      var copied = document.execCommand('copy');
      document.body.removeChild(textarea);
      return copied;
    } catch (_error) {
      return false;
    }
  }

  function getHistoricSearchLocationById(locationId) {
    var key = normalizeKey(locationId);
    return HISTORIC_SEARCH_LOCATIONS.find(function (item) {
      return normalizeKey(item.id) === key;
    }) || HISTORIC_SEARCH_LOCATIONS[1];
  }

  function getDefaultHistoricFinderQuery(seedBandName) {
    var nowYear = new Date().getFullYear();
    return {
      bandName: String(seedBandName || '').trim(),
      fromYear: HISTORIC_DEFAULT_FROM_YEAR,
      toYear: nowYear,
      radiusMiles: 50,
      locationId: 'hendersonville'
    };
  }

  function normalizeHistoricFinderQuery(raw) {
    var defaults = getDefaultHistoricFinderQuery('');
    var source = raw && typeof raw === 'object' ? raw : {};
    var fromYear = Math.max(1960, Number(source.fromYear) || defaults.fromYear);
    var toYear = Math.max(fromYear, Number(source.toYear) || defaults.toYear);
    var radius = Number(source.radiusMiles) || defaults.radiusMiles;
    if (HISTORIC_RADIUS_OPTIONS.indexOf(radius) < 0) radius = defaults.radiusMiles;
    var location = getHistoricSearchLocationById(source.locationId || defaults.locationId);
    return {
      bandName: String(source.bandName || '').trim(),
      fromYear: fromYear,
      toYear: toYear,
      radiusMiles: radius,
      locationId: location.id
    };
  }

  function hasAttendedByColumn(columns) {
    var expected = new Set(['attendedby']);
    var aliasList = TABLE_WRITE_COLUMN_ALIASES.attendedby || [];
    aliasList.forEach(function (alias) {
      var normalized = normalizeColumnName(alias);
      if (normalized) expected.add(normalized);
    });
    return (Array.isArray(columns) ? columns : []).some(function (column) {
      var normalized = normalizeColumnName(column && column.name ? column.name : '');
      return normalized && expected.has(normalized);
    });
  }

  function updateAttendedBySchemaWarning(columns) {
    var helper = window.ExcelSchemaCheckHelper;
    if (hasAttendedByColumn(columns)) {
      state.attendedBySchemaWarning = '';
      if (helper && typeof helper.reportSchemaStatus === 'function') {
        helper.reportSchemaStatus('concerts', {
          feature: 'Concerts',
          table: 'Attended_Concerts',
          missingRequired: [],
          missingRecommended: [],
          tone: 'success',
          checkedAt: Date.now()
        });
      }
      if (helper && typeof helper.clearGlobalBanner === 'function') helper.clearGlobalBanner('concerts');
      return;
    }
    state.attendedBySchemaWarning = 'Workbook note: "Attended_By" column is missing in Attended_Concerts. New attendee selections default to Both after reload until that column exists.';
    if (helper && typeof helper.reportSchemaStatus === 'function') {
      helper.reportSchemaStatus('concerts', {
        feature: 'Concerts',
        table: 'Attended_Concerts',
        missingRequired: [],
        missingRecommended: ['attended_by'],
        tone: 'warning',
        checkedAt: Date.now()
      });
    }
    if (helper && typeof helper.upsertGlobalBanner === 'function') {
      helper.upsertGlobalBanner('concerts', {
        title: 'Concerts Excel schema check',
        message: 'Your Attended_Concerts table is missing a recommended attendee column.',
        details: 'Missing: attended_by',
        tone: 'warning'
      });
    }
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
      lastReleaseDate: String(safeBand.lastReleaseDate || '').trim(),
      memberTimeline: String(safeBand.memberTimeline || '').trim(),
      coverPositionX: Number.isFinite(Number(safeBand.coverPositionX)) ? Number(safeBand.coverPositionX) : null,
      coverPositionY: Number.isFinite(Number(safeBand.coverPositionY)) ? Number(safeBand.coverPositionY) : null,
      coverZoom: Number.isFinite(Number(safeBand.coverZoom)) ? Number(safeBand.coverZoom) : null,
      logoPositionX: Number.isFinite(Number(safeBand.logoPositionX)) ? Number(safeBand.logoPositionX) : null,
      logoPositionY: Number.isFinite(Number(safeBand.logoPositionY)) ? Number(safeBand.logoPositionY) : null,
      topSongCandidates: Array.isArray(safeBand.topSongCandidates) ? safeBand.topSongCandidates.slice() : [],
      linkCompletenessScore: Number.isFinite(Number(safeBand.linkCompletenessScore)) ? Number(safeBand.linkCompletenessScore) : null,
      enrichmentHealthScore: Number.isFinite(Number(safeBand.enrichmentHealthScore)) ? Number(safeBand.enrichmentHealthScore) : null,
      bandTier: normalizeBandTier(safeBand.bandTier || ''),
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
    var nextBand = Object.assign({}, band, {
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
      lastReleaseDate: merged.lastReleaseDate || band.lastReleaseDate,
      memberTimeline: merged.memberTimeline || band.memberTimeline,
      coverPositionX: Number.isFinite(Number(merged.coverPositionX)) ? Number(merged.coverPositionX) : (Number.isFinite(Number(band.coverPositionX)) ? Number(band.coverPositionX) : null),
      coverPositionY: Number.isFinite(Number(merged.coverPositionY)) ? Number(merged.coverPositionY) : (Number.isFinite(Number(band.coverPositionY)) ? Number(band.coverPositionY) : null),
      coverZoom: Number.isFinite(Number(merged.coverZoom)) ? Number(merged.coverZoom) : (Number.isFinite(Number(band.coverZoom)) ? Number(band.coverZoom) : null),
      logoPositionX: Number.isFinite(Number(merged.logoPositionX)) ? Number(merged.logoPositionX) : (Number.isFinite(Number(band.logoPositionX)) ? Number(band.logoPositionX) : null),
      logoPositionY: Number.isFinite(Number(merged.logoPositionY)) ? Number(merged.logoPositionY) : (Number.isFinite(Number(band.logoPositionY)) ? Number(band.logoPositionY) : null),
      topSongCandidates: mergeTopSongCandidates(band.topSongCandidates || [], merged.topSongCandidates || []),
      linkCompletenessScore: Number.isFinite(Number(merged.linkCompletenessScore)) ? Number(merged.linkCompletenessScore) : band.linkCompletenessScore,
      enrichmentHealthScore: Number.isFinite(Number(merged.enrichmentHealthScore)) ? Number(merged.enrichmentHealthScore) : band.enrichmentHealthScore,
      bandTier: normalizeBandTier(merged.bandTier || band.bandTier || getBandTierOverride(band.id || band.bandName)),
      genres: splitGenres(merged.associatedGenres || band.associatedGenres),
      members: splitList(merged.bandMembers || band.bandMembers),
      songs: splitList(merged.topSongs || band.topSongs),
      releases: splitList(merged.discography || band.discography)
    });
    var meta = getBandProfileMeta(nextBand.id || nextBand.bandName) || {};
    nextBand.enrichmentHealthScore = computeBandEnrichmentHealth(nextBand, meta).score;
    return nextBand;
  }

    function parseFavoriteBandRecord(record, options) {
    var safeOptions = options && typeof options === 'object' ? options : {};
    var bandName = String(readFavoriteBandValue(record, 'bandName') || '').trim();
    if (!bandName) return null;
    var parsed = {
      id: normalizeKey(bandName) || ('band-' + Math.random().toString(36).slice(2, 8)),
      bandName: bandName,
      bandMembers: String(readFavoriteBandValue(record, 'bandMembers') || '').trim(),
      bandLogoUrl: String(readFavoriteBandValue(record, 'bandLogoUrl') || '').trim(),
      bandCoverPhotoUrl: String(readFavoriteBandValue(record, 'bandCoverPhotoUrl') || '').trim(),
      origin: String(readFavoriteBandValue(record, 'origin') || '').trim(),
      founded: String(readFavoriteBandValue(record, 'founded') || '').trim(),
      recordLabel: String(readFavoriteBandValue(record, 'recordLabel') || '').trim(),
      discography: String(readFavoriteBandValue(record, 'discography') || '').trim(),
      topSongs: String(readFavoriteBandValue(record, 'topSongs') || '').trim(),
      associatedGenres: String(readFavoriteBandValue(record, 'associatedGenres') || '').trim(),
      websiteUrl: String(readFavoriteBandValue(record, 'websiteUrl') || '').trim(),
      tourPageUrl: String(readFavoriteBandValue(record, 'tourPageUrl') || '').trim(),
      facebookUrl: String(readFavoriteBandValue(record, 'facebookUrl') || '').trim(),
      instagramUrl: String(readFavoriteBandValue(record, 'instagramUrl') || '').trim(),
      youTubeUrl: String(readFavoriteBandValue(record, 'youTubeUrl') || '').trim(),
      setlistUrl: String(readFavoriteBandValue(record, 'setlistUrl') || '').trim(),
      bandsintownUrl: String(readFavoriteBandValue(record, 'bandsintownUrl') || '').trim(),
      wikipediaUrl: String(readFavoriteBandValue(record, 'wikipediaUrl') || '').trim(),
      lastReleaseDate: String(readValue(record, ['Last_Release_Date', 'Last Release Date']) || '').trim(),
      memberTimeline: String(readValue(record, ['Member_Timeline', 'Member Timeline']) || '').trim(),
      bandTier: normalizeBandTier(readFavoriteBandValue(record, 'bandTier') || getBandTierOverride(bandName)),
      coverPositionX: Number.isFinite(Number(readFavoriteBandValue(record, 'coverPositionX'))) ? Number(readFavoriteBandValue(record, 'coverPositionX')) : null,
      coverPositionY: Number.isFinite(Number(readFavoriteBandValue(record, 'coverPositionY'))) ? Number(readFavoriteBandValue(record, 'coverPositionY')) : null,
      coverZoom: Number.isFinite(Number(readFavoriteBandValue(record, 'coverZoom'))) ? Number(readFavoriteBandValue(record, 'coverZoom')) : null,
      logoPositionX: Number.isFinite(Number(readFavoriteBandValue(record, 'logoPositionX'))) ? Number(readFavoriteBandValue(record, 'logoPositionX')) : null,
      logoPositionY: Number.isFinite(Number(readFavoriteBandValue(record, 'logoPositionY'))) ? Number(readFavoriteBandValue(record, 'logoPositionY')) : null,
      __rowIndex: Number.isInteger(Number(record && record.__rowIndex)) ? Number(record.__rowIndex) : -1,
      __rowId: String(record && record.__rowId ? record.__rowId : '').trim(),
      genres: splitGenres(readFavoriteBandValue(record, 'associatedGenres')),
      members: splitList(readFavoriteBandValue(record, 'bandMembers')),
      songs: splitList(readFavoriteBandValue(record, 'topSongs')),
      releases: splitList(readFavoriteBandValue(record, 'discography'))
    };
    return safeOptions.applyOverride === false ? parsed : applyBandProfileOverride(parsed);
  }

  function parseFavoriteBand(record) {
    return parseFavoriteBandRecord(record, { applyOverride: true });
  }

  function buildFavoriteRecordFromBandModel(bandModel) {
    return buildFavoriteRecordFromPrefill(mapBandToPrefillShape(bandModel || {}));
  }

  async function resolveFavoriteBandRowIndex(filePath, band) {
    if (band && Number.isInteger(Number(band.__rowIndex)) && Number(band.__rowIndex) >= 0) {
      return Number(band.__rowIndex);
    }
    var targetName = normalizeText(band && band.bandName ? band.bandName : '');
    if (!targetName) return -1;
    var rows = await readTableSafe(filePath, FAVORITE_TABLE);
    for (var idx = 0; idx < rows.length; idx += 1) {
      var rowName = normalizeText(readFavoriteBandValue(rows[idx], 'bandName'));
      if (rowName === targetName) {
        return Number.isInteger(Number(rows[idx].__rowIndex)) ? Number(rows[idx].__rowIndex) : idx;
      }
    }
    return -1;
  }

  function getNextFavoriteBandRowIndex() {
    var maxIndex = -1;
    state.favoriteBands.forEach(function (entry) {
      var rowIndex = Number(entry && entry.__rowIndex);
      if (Number.isInteger(rowIndex) && rowIndex > maxIndex) maxIndex = rowIndex;
    });
    return maxIndex + 1;
  }

  async function persistFavoriteBandProfilePatch(band, patch, options) {
    var safeBand = band && typeof band === 'object' ? band : null;
    var safePatch = patch && typeof patch === 'object' ? patch : null;
    var safeOptions = options && typeof options === 'object' ? options : {};
    if (!safeBand || !safePatch) throw new Error('No band changes were provided to sync.');

    var workbookPath = await findWorkbookPath();
    var rowIndex = await resolveFavoriteBandRowIndex(workbookPath, safeBand);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      throw new Error('Could not locate the Favorite_Bands row for ' + (safeBand.bandName || 'this band') + '.');
    }

    var mergedBand = Object.assign({}, safeBand, safePatch, { __rowIndex: rowIndex });
    var record = buildFavoriteRecordFromBandModel(mergedBand);
    await updateRecordInTableByIndex(workbookPath, FAVORITE_TABLE, rowIndex, record);

    state.favoriteBands = state.favoriteBands.map(function (entry) {
      if (!entry || entry.id !== safeBand.id) return entry;
      var mergedEntry = Object.assign({}, entry, safePatch, { __rowIndex: rowIndex });
      return applyBandProfileOverride(mergedEntry);
    });
    if (!safeOptions.skipRender) renderAll();
    return getBandByKey(safeBand.id || safeBand.bandName) || Object.assign({}, safeBand, safePatch, { __rowIndex: rowIndex });
  }

  function formatSyncDriftFieldValue(value) {
    var text = String(value == null ? '' : value).trim();
    return text || '';
  }

  function collectFavoriteBandSyncDiffs(localBand, backendBand) {
    var local = localBand && typeof localBand === 'object' ? localBand : {};
    var backend = backendBand && typeof backendBand === 'object' ? backendBand : {};
    var diffs = [];
    FAVORITE_SYNC_FIELD_KEYS.forEach(function (fieldKey) {
      var localValue = formatSyncDriftFieldValue(local[fieldKey]);
      var backendValue = formatSyncDriftFieldValue(backend[fieldKey]);
      if (normalizeText(localValue) === normalizeText(backendValue)) return;
      diffs.push({
        fieldKey: fieldKey,
        label: BAND_PROFILE_FIELD_LABELS[fieldKey] || (fieldKey === 'bandTier' ? 'Band Tier' : fieldKey),
        localValue: localValue,
        backendValue: backendValue
      });
    });
    return diffs;
  }

  function renderUnsyncedBandChangesReport(report) {
    var payload = report && typeof report === 'object' ? report : { items: [] };
    var items = Array.isArray(payload.items) ? payload.items : [];
    var generatedAt = payload.generatedAt ? formatDateTimeShort(payload.generatedAt) : '';
    openModal(
      '<div class="household-concerts-modal-head"><div><h3>Unsynced Band Profile Changes</h3><p>'
        + (generatedAt ? ('Scan completed ' + escapeHtml(generatedAt) + '.') : 'Scan complete.')
        + '</p></div><button type="button" class="household-concerts-icon-btn" data-concert-action="close-modal">✕</button></div>'
      + '<div class="household-concerts-band-profile">'
      + (items.length
        ? ('<div class="household-concerts-sync-drift-list">' + items.map(function (item) {
          var fields = Array.isArray(item.fields) ? item.fields : [];
          return '<article class="household-concerts-sync-drift-item">'
            + '<div class="household-concerts-sync-drift-head"><strong>' + escapeHtml(item.bandName || 'Band') + '</strong>'
            + '<button type="button" class="pill-button" data-concert-action="force-sync-band-change" data-band-key="' + escapeHtml(item.bandKey || '') + '">Force Sync</button></div>'
            + '<ul>' + fields.map(function (field) {
              return '<li><strong>' + escapeHtml(field.label || field.fieldKey || 'Field') + ':</strong> '
                + '<span class="household-concerts-sync-drift-local">Local: ' + escapeHtml(safeTruncate(field.localValue || '(empty)', 120)) + '</span> '
                + '<span class="household-concerts-sync-drift-backend">Excel: ' + escapeHtml(safeTruncate(field.backendValue || '(empty)', 120)) + '</span></li>';
            }).join('') + '</ul>'
            + '</article>';
        }).join('') + '</div>')
        : '<p class="household-concerts-muted">No unsynced band profile changes found. Local app and Excel are in sync.</p>')
      + '<div class="household-concerts-form-actions">'
      + '<button type="button" class="pill-button" data-concert-action="scan-unsynced-band-changes">Re-scan</button>'
      + (items.length ? '<button type="button" class="pill-button pill-button-primary" data-concert-action="force-sync-all-band-changes">Force Sync All</button>' : '')
      + '<button type="button" class="pill-button" data-concert-action="close-modal">Close</button>'
      + '</div></div>'
    );
  }

  async function scanUnsyncedBandChanges(options) {
    var safeOptions = options && typeof options === 'object' ? options : {};
    if (state.unsyncedScanBusy) return state.unsyncedBandsReport;
    state.unsyncedScanBusy = true;
    if (!safeOptions.silent) setStatus('Scanning Favorite Bands for unsynced profile changes…', 'info');
    try {
      var workbookPath = await findWorkbookPath();
      var backendRows = await readTableSafe(workbookPath, FAVORITE_TABLE);
      var backendBands = backendRows.map(function (row) {
        return parseFavoriteBandRecord(row, { applyOverride: false });
      }).filter(Boolean);
      var backendByKey = new Map();
      backendBands.forEach(function (band) {
        backendByKey.set(normalizeKey(band.bandName), band);
      });

      var items = [];
      state.favoriteBands.forEach(function (localBand) {
        if (!localBand) return;
        var key = normalizeKey(localBand.bandName || localBand.id || '');
        if (!key) return;
        var backendBand = backendByKey.get(key);
        if (!backendBand) {
          items.push({
            bandKey: key,
            bandName: String(localBand.bandName || '').trim(),
            fields: [{
              fieldKey: 'bandName',
              label: 'Band record',
              localValue: 'Present in app',
              backendValue: 'Missing in Favorite_Bands table'
            }]
          });
          return;
        }
        var diffs = collectFavoriteBandSyncDiffs(localBand, backendBand);
        if (!diffs.length) return;
        items.push({ bandKey: key, bandName: localBand.bandName, fields: diffs });
      });

      state.unsyncedBandsReport = {
        generatedAt: Date.now(),
        workbookPath: workbookPath,
        items: items
      };
      if (!safeOptions.silent) {
        setStatus(items.length
          ? ('Found ' + items.length + ' band profile entr' + (items.length === 1 ? 'y' : 'ies') + ' with unsynced changes.')
          : 'No unsynced band profile changes found.', items.length ? 'warning' : 'success');
      }
      return state.unsyncedBandsReport;
    } finally {
      state.unsyncedScanBusy = false;
    }
  }

  async function forceSyncBandChangesByKey(bandKey, options) {
    var safeOptions = options && typeof options === 'object' ? options : {};
    var targetBand = getBandByKey(bandKey);
    if (!targetBand) throw new Error('Band not found for sync.');
    var patch = mapBandToPrefillShape(targetBand);
    await persistFavoriteBandProfilePatch(targetBand, patch, { skipRender: true });
    saveBandProfileOverride(targetBand.id || targetBand.bandName, patch);
    if (!safeOptions.silent) {
      setStatus('Force-synced ' + targetBand.bandName + ' to Favorite_Bands in Excel.', 'success');
    }
    renderAll();
    return true;
  }

  function parseAttendedConcert(record) {
    var bandName = String(readValue(record, ['Band_Name', 'Band Name']) || '').trim();
    var concertDate = toIsoDate(readValue(record, ['Concert_Date', 'Concert Date']));
    var venue = String(readValue(record, ['Venue']) || '').trim();
    if (!bandName) return null;
    var key = concertNoteKey(bandName, concertDate, venue);
    var photoUrls = parsePhotoUrlsField(readValue(record, ['Photo_URL', 'Photo URL']));
    var notes = String(readValue(record, ['Notes']) || state.localNotes[key] || '').trim();
    var historicMeta = readHistoricEditMetaByNoteKey(key);
    return {
      id: key || ('attended-' + Math.random().toString(36).slice(2, 8)),
      bandKey: normalizeKey(bandName),
      bandName: bandName,
      concertDate: concertDate,
      venue: venue,
      attendedBy: normalizeAttendedBy(readValue(record, ['Attended_By', 'Attended By', 'Who Attended', 'Attendees'])),
      rating: Math.max(0, Math.min(5, Number(readValue(record, ['Rating']) || 0) || 0)),
      photoUrl: photoUrls[0] || '',
      photoUrls: photoUrls,
      videoUrl: String(readValue(record, ['Video_URL', 'Video URL']) || '').trim(),
      setlistUrl: String(readValue(record, ['Setlist_URL', 'Setlist URL']) || '').trim(),
      notes: notes,
      __rowIndex: Number.isInteger(Number(record && record.__rowIndex)) ? Number(record.__rowIndex) : -1,
      isHistoricImported: isHistoricImportNote(notes),
      historicEditMeta: historicMeta
    };
  }

  function parseUpcomingConcert(record) {
    var bandName = String(readValue(record, ['Band_Name', 'Band Name']) || '').trim();
    if (!bandName) return null;
    var concertDate = toIsoDate(readValue(record, ['Concert_Date', 'Concert Date']));
    var city = String(readValue(record, ['City']) || '').trim();
    var stateName = String(readValue(record, ['State']) || '').trim();
    var key = [normalizeKey(bandName), concertDate, normalizeKey(readValue(record, ['Venue']) || ''), normalizeKey(city), normalizeKey(stateName)].join('::');
    var ticketRaw = String(readValue(record, ['Tickets_Purchased', 'Tickets Purchased', 'Ticket Purchased']) || '').trim();
    var ticketLocal = !!state.upcomingTickets[normalizeKey(key)];
    var ticketsPurchased = /^(yes|true|1|purchased)$/i.test(ticketRaw) || ticketLocal;
    return {
      id: key,
      bandKey: normalizeKey(bandName),
      bandName: bandName,
      concertDate: concertDate,
      dayOfWeek: String(readValue(record, ['Day_of_Week', 'Day Of Week']) || formatDayOfWeek(concertDate)).trim(),
      venue: String(readValue(record, ['Venue']) || '').trim(),
      city: city,
      state: stateName,
      distanceMiles: null,
      ticketsPurchased: ticketsPurchased,
      __rowIndex: Number.isInteger(Number(record && record.__rowIndex)) ? Number(record.__rowIndex) : -1
    };
  }

  function getBandByKey(key) {
    var target = normalizeKey(key);
    return state.favoriteBands.find(function (band) {
      return band.id === target || normalizeKey(band.bandName) === target;
    }) || null;
  }

  function isPriorityBand(bandLike) {
    var key = normalizeKey((bandLike && (bandLike.id || bandLike.bandName)) || '');
    if (!key) return false;
    return !!state.priorityBands[key];
  }

  function setPriorityBandFlag(bandLike, enabled) {
    var key = normalizeKey((bandLike && (bandLike.id || bandLike.bandName)) || '');
    if (!key) return;
    if (enabled) state.priorityBands[key] = { at: Date.now() };
    else delete state.priorityBands[key];
    writeJsonStorage(PRIORITY_BANDS_STORAGE_KEY, state.priorityBands);
  }

  function setUpcomingTicketFlag(concert, enabled) {
    var key = normalizeKey(concert && concert.id);
    if (!key) return;
    if (enabled) state.upcomingTickets[key] = { at: Date.now() };
    else delete state.upcomingTickets[key];
    writeJsonStorage(UPCOMING_TICKETS_STORAGE_KEY, state.upcomingTickets);
  }

  function buildUpcomingRecordFromConcert(concert) {
    var safe = concert && typeof concert === 'object' ? concert : {};
    return {
      Band_Name: String(safe.bandName || '').trim(),
      Concert_Date: toIsoDate(safe.concertDate),
      Day_of_Week: String(safe.dayOfWeek || formatDayOfWeek(safe.concertDate)).trim(),
      Venue: String(safe.venue || '').trim(),
      City: String(safe.city || '').trim(),
      State: String(safe.state || '').trim(),
      Tickets_Purchased: safe.ticketsPurchased ? 'Yes' : 'No'
    };
  }

  async function persistUpcomingTicketStatus(concert) {
    if (!concert) return;
    try {
      var workbookPath = await findWorkbookPath();
      await updateRecordInTableByIndex(workbookPath, UPCOMING_TABLE, concert.__rowIndex, buildUpcomingRecordFromConcert(concert));
    } catch (_error) {
      // Keep local fallback even if workbook schema does not include ticket column yet.
    }
  }

  async function updateBandTierForBand(band, tierValue, options) {
    if (!band) return;
    var nextTier = normalizeBandTier(tierValue || '');
    var safeOptions = options && typeof options === 'object' ? options : {};
    try {
      await persistFavoriteBandProfilePatch(band, { bandTier: nextTier }, { skipRender: true });
      setBandTierOverride(band.id || band.bandName, nextTier);
      state.favoriteBands = state.favoriteBands.map(function (entry) {
        if (normalizeKey(entry.id) !== normalizeKey(band.id)) return entry;
        return Object.assign({}, entry, { bandTier: nextTier });
      });
      if (!safeOptions.silentStatus) setStatus('Updated tier for ' + band.bandName + ' to ' + nextTier + '.', 'success');
      renderAll();
      if (safeOptions.reopenProfile) openBandDetails(getBandByKey(band.id));
    } catch (error) {
      setStatus(error && error.message ? error.message : 'Could not update band tier.', 'error');
    }
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
      if (isTier4Band(band.bandTier)) return;
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
    var tierFilter = normalizeText(state.tierFilter);
    var summaryFilter = normalizeText(state.bandSummaryFilter);
    return state.favoriteBands.filter(function (band) {
      var isTier4 = isTier4Band(band.bandTier);
      if (tierFilter) {
        if (normalizeText(normalizeBandTier(band.bandTier)) !== tierFilter) return false;
      } else if (!state.showTier4Bands && isTier4) {
        return false;
      }
      if (genreFilter) {
        var hasGenre = (band.genres || []).some(function (genre) { return normalizeText(genre) === genreFilter; });
        if (!hasGenre) return false;
      }
      if (summaryFilter) {
        var stats = computeBandStats(band.id);
        if (summaryFilter === 'favorite-bands' && isTier4) return false;
        if (summaryFilter === 'seen-live-not-favorites' && !isTier4) return false;
        if (summaryFilter === 'concerts-seen' && (!stats || stats.attendedCount < 1)) return false;
        if (summaryFilter === 'upcoming-in-range' && (!stats || stats.upcomingCount < 1)) return false;
        if (summaryFilter === 'average-rating' && (!stats || !(Number(stats.averageRating) > 0))) return false;
      }
      if (!query) return true;
      var haystack = [
        band.bandName,
        band.bandTier,
        band.origin,
        band.recordLabel,
        band.associatedGenres,
        band.topSongs,
        band.discography,
        band.bandMembers
      ].join(' ').toLowerCase();
      return haystack.indexOf(query) >= 0;
    }).sort(function (a, b) {
      var tierRankDiff = getBandTierRank(a.bandTier) - getBandTierRank(b.bandTier);
      if (tierRankDiff !== 0) return tierRankDiff;
      return String(a.bandName || '').localeCompare(String(b.bandName || ''));
    });
  }

  function getSummaryFilterLabel(filterKey) {
    var key = normalizeText(filterKey);
    if (key === 'favorite-bands') return 'Favorite Bands';
    if (key === 'seen-live-not-favorites') return 'Bands Seen Live (Not Favorites)';
    if (key === 'concerts-seen') return 'Concerts Seen';
    if (key === 'upcoming-in-range') return 'Upcoming In Range';
    if (key === 'average-rating') return 'Average Rating';
    return '';
  }

  function isSummaryCardActive(summaryKey) {
    return normalizeText(state.bandSummaryFilter) === normalizeText(summaryKey);
  }

  function getActiveBandFilterCrumbs() {
    var crumbs = [];
    if (state.bandFilter) crumbs.push({ kind: 'query', label: 'Search: ' + state.bandFilter });
    if (state.genreFilter) crumbs.push({ kind: 'genre', label: 'Genre: ' + state.genreFilter });
    if (state.tierFilter) crumbs.push({ kind: 'tier', label: 'Tier: ' + state.tierFilter });
    if (state.showTier4Bands && !state.tierFilter) crumbs.push({ kind: 'tier4', label: 'Including Tier 4' });
    if (state.bandSummaryFilter) crumbs.push({ kind: 'summary', label: getSummaryFilterLabel(state.bandSummaryFilter) });
    return crumbs;
  }

  function renderActiveFilterBreadcrumbs() {
    var el = $(ACTIVE_FILTERS_ID);
    if (!el) return;
    var crumbs = getActiveBandFilterCrumbs();
    if (!crumbs.length) {
      el.innerHTML = '';
      el.style.display = 'none';
      return;
    }
    el.style.display = 'flex';
    el.innerHTML = '<div class="household-concerts-crumb-list">'
      + crumbs.map(function (crumb) {
        return '<button type="button" class="household-concerts-crumb" data-concert-action="remove-band-filter" data-filter-kind="' + escapeHtml(crumb.kind) + '"><span>' + escapeHtml(crumb.label) + '</span><strong>×</strong></button>';
      }).join('')
      + '</div>'
      + '<button type="button" class="pill-button" data-concert-action="clear-all-band-filters">Clear All Filters</button>';
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
    var favoriteCount = state.favoriteBands.filter(function (band) { return !isTier4Band(band.bandTier); }).length;
    var seenLiveNotFavoriteCount = state.favoriteBands.filter(function (band) { return isTier4Band(band.bandTier); }).length;
    var attendedCount = state.attendedConcerts.length;
    var attendeeCounts = summarizeAttendeeCounts(state.attendedConcerts);
    var upcomingNearbyCount = getFilteredUpcomingConcerts().length;
    var averageRating = attendedCount
      ? state.attendedConcerts.reduce(function (sum, item) { return sum + (Number(item.rating) || 0); }, 0) / attendedCount
      : 0;
    var activeBand = resolveActiveBand();
    var activeStats = activeBand ? computeBandStats(activeBand.id) : null;

    el.innerHTML = [
      summaryCard('Favorite Bands', String(favoriteCount), 'Artists you actively follow and want to keep up with.', 'favorite-bands'),
      summaryCard('Bands Seen Live (Not Favorites)', String(seenLiveNotFavoriteCount), 'Tier 4 bands tracked separately from favorites.', 'seen-live-not-favorites'),
      summaryCard('Concerts Seen', String(attendedCount), 'Every show you have logged, rated, and documented. ' + formatAttendeeBreakdown(attendeeCounts) + '.', 'concerts-seen'),
      summaryCard('Upcoming In Range', String(upcomingNearbyCount), state.location ? (isDefaultConcertsLocation(state.location) ? ('Based on your default concert home base: ' + state.location.label + '.') : 'Based on your current distance slider and saved location.') : 'Set your location to turn on nearby concert filtering.', 'upcoming-in-range'),
      summaryCard('Average Rating', averageRating ? averageRating.toFixed(1) + ' / 5' : '—', 'How your attended shows are trending overall.', 'average-rating'),
      summaryCard('Active Band Focus', activeBand ? activeBand.bandName : 'Pick a band', activeStats ? (activeStats.attendedCount + ' seen • ' + activeStats.upcomingCount + ' upcoming') : 'Select a band card to see similar artists and recommendations.')
    ].join('');
  }

  function summaryCard(label, value, hint, filterKey) {
    var clickable = !!filterKey;
    var active = clickable && isSummaryCardActive(filterKey);
    return '<article class="household-concerts-summary-card' + (active ? ' is-active-filter' : '') + '"' + (clickable ? (' data-concert-action="set-summary-filter" data-summary-filter="' + escapeHtml(filterKey) + '" role="button" tabindex="0"') : '') + '>'
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

  function renderTierChips() {
    var el = $(TIER_CHIPS_ID);
    if (!el) return;
    var viewMode = [
      '<button type="button" class="household-concerts-chip' + ((!state.showTier4Bands && !state.tierFilter) ? ' is-active' : '') + '" data-concert-action="set-tier4-visibility" data-tier4-visible="0">Favorites (Tier 1-3)</button>',
      '<button type="button" class="household-concerts-chip' + ((state.showTier4Bands && !state.tierFilter) ? ' is-active' : '') + '" data-concert-action="set-tier4-visibility" data-tier4-visible="1">Include Tier 4</button>'
    ];
    var html = viewMode.concat(['<button type="button" class="household-concerts-chip' + (state.tierFilter ? '' : ' is-active') + '" data-concert-action="set-tier-filter" data-tier="">All visible tiers</button>']);
    BAND_TIER_OPTIONS.forEach(function (option) {
      var active = normalizeText(option.value) === normalizeText(state.tierFilter);
      html.push('<button type="button" class="household-concerts-chip' + (active ? ' is-active' : '') + '" data-concert-action="set-tier-filter" data-tier="' + escapeHtml(option.value) + '">' + escapeHtml(option.value) + '</button>');
    });
    el.innerHTML = html.join('');
  }

   function renderFavoriteBands() {
     var el = $(FAVORITES_GRID_ID);
     if (!el) return;
     var bands = getFilteredBands();
     if (!bands.length) {
       state.bandsPage = 1;
       el.innerHTML = emptyState('No bands match the current filters.', 'Try a different search, tier filter, or add a new band from the web search panel.');
       return;
     }
     var page = clampBandsPage(bands.length);
     var start = (page - 1) * BAND_DASHBOARD_PAGE_SIZE;
     var end = start + BAND_DASHBOARD_PAGE_SIZE;
     var pagedBands = bands.slice(start, end);
     var activeBandKey = normalizeKey(resolveActiveBand() && resolveActiveBand().id);
     var favoriteBands = pagedBands.filter(function (band) { return !isTier4Band(band.bandTier); });
     var seenLiveBands = pagedBands.filter(function (band) { return isTier4Band(band.bandTier); });
     // Total counts across all filtered bands (not just current page)
     var totalFavoriteBands = bands.filter(function (band) { return !isTier4Band(band.bandTier); }).length;
     var totalSeenLiveBands = bands.filter(function (band) { return isTier4Band(band.bandTier); }).length;
     var renderBandCard = function (band) {
       var stats = computeBandStats(band.id);
       var isActive = normalizeKey(band.id) === activeBandKey;
       var members = (band.members || []).slice(0, 4);
       var genres = (band.genres || []).slice(0, 4);
       var songs = (band.songs || []).slice(0, 4);
       var tags = getBandTags(band.bandName);
       var priority = isPriorityBand(band);
        var enrichmentBadge = renderBandEnrichmentBadge(band);
          var lockBadge = renderBandLockBadge(band);
        var links = renderBandLinks(band, true);
        var coverStyle = buildCoverStyle(band);
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
         + '<div class="household-concerts-band-meta">' + escapeHtml(band.origin || 'Origin not set') + ' • ' + escapeHtml(band.founded || 'Founded date not set') + ' • ' + escapeHtml(normalizeBandTier(band.bandTier)) + '</div>'
          + enrichmentBadge
         + '</div>'
         + '</div>'
         + '<div class="household-concerts-band-stats">'
         + statPill('Seen', String(stats.attendedCount))
         + statPill('Upcoming', String(stats.upcomingCount))
         + statPill('Avg', stats.averageRating ? stats.averageRating.toFixed(1) + '★' : '—')
         + '</div>'
         + '<div class="household-concerts-tag-display">' + (tags.length ? tags.map(function (tag) { return '<span class="household-concerts-tag-badge">' + escapeHtml(tag) + '</span>'; }).join('') : '') + '</div>'
         + '<div class="household-concerts-tag-row household-concerts-tag-row--band-card">' + (genres.length ? genres.map(renderTag).join('') : '') + '</div>'
         + '<div class="household-concerts-band-detail-grid">'
         + detailLine('Tier', normalizeBandTier(band.bandTier))
         + detailLine('Last Release', band.lastReleaseDate ? formatDate(band.lastReleaseDate) : 'Unknown')
         + detailLine('Label', band.recordLabel || 'Not set')
         + detailLine('Top Songs', songs.length ? songs.join(', ') : 'Add favorite songs')
         + detailLine('Members', members.length ? members.join(' • ') : 'Add members and roles')
         + detailLine('Lineup Timeline', band.memberTimeline || 'Run Auto-fill Profile to capture current/former eras')
         + '</div>'
         + '<div class="household-concerts-band-links-block">' + links + '</div>'
         + '<div class="household-concerts-band-actions">'
         + '<button type="button" class="pill-button" data-concert-action="select-band" data-band-key="' + escapeHtml(band.id) + '">Focus</button>'
         + '<button type="button" class="pill-button" data-concert-action="open-band-details" data-band-key="' + escapeHtml(band.id) + '">View Profile</button>'
         + '<button type="button" class="pill-button" data-concert-action="cycle-band-tier" data-band-key="' + escapeHtml(band.id) + '">Tier: ' + escapeHtml(normalizeBandTier(band.bandTier).replace(/\s*\(.+\)$/, '')) + '</button>'
         + '<button type="button" class="pill-button" data-concert-action="toggle-priority-band" data-band-key="' + escapeHtml(band.id) + '">' + (priority ? '⭐ Prioritized' : '☆ Prioritize Live') + '</button>'
         + '<button type="button" class="pill-button" data-concert-action="open-band-image-picker" data-band-key="' + escapeHtml(band.id) + '">Manage Photos</button>'
         + '<button type="button" class="pill-button household-concerts-refresh-profile-btn pill-button-refresh-profile" data-concert-action="refresh-band-profile" data-band-key="' + escapeHtml(band.id) + '">↻ Refresh Profile</button>'
         + '<button type="button" class="pill-button" data-concert-action="open-log-concert" data-band-key="' + escapeHtml(band.id) + '">Log Concert</button>'
         + '<button type="button" class="pill-button" data-concert-action="open-add-upcoming" data-band-key="' + escapeHtml(band.id) + '">Add Upcoming</button>'
         + (band.bandsintownUrl ? '<button type="button" class="pill-button" data-concert-action="sync-tour" data-band-key="' + escapeHtml(band.id) + '" title="Fetch tour dates from Bandsintown">🔄 Sync Tour</button>' : '')
         + '</div>'
         + '</div>'
         + '</article>';
     };
      var pageCount = getBandPageCount(bands.length);
      var cols = Math.max(1, Math.min(4, Number(state.bandCardColumns) || 2));
      var gridStyle = 'grid-template-columns:repeat(' + cols + ',minmax(0,1fr))';

      function buildPagination(modifier) {
        return '<div class="household-concerts-pagination household-concerts-pagination--' + modifier + '">'
          + '<button type="button" class="pill-button" data-concert-action="set-bands-page" data-page="' + (page - 1) + '"' + (page <= 1 ? ' disabled' : '') + '>◀ Previous</button>'
          + '<span>Page ' + page + ' of ' + pageCount + ' • ' + (start + 1) + '–' + Math.min(end, bands.length) + ' of ' + bands.length + '</span>'
          + '<button type="button" class="pill-button" data-concert-action="set-bands-page" data-page="' + (page + 1) + '"' + (page >= pageCount ? ' disabled' : '') + '>Next ▶</button>'
          + '</div>';
      }

      var refreshProgress = state.bulkProfileRefreshProgress || { current: 0, total: 0 };
      var refreshLabel = state.bulkProfileRefreshBusy
        ? ('Refreshing ' + Math.min(refreshProgress.current, refreshProgress.total || refreshProgress.current) + '/' + (refreshProgress.total || bands.length) + '...')
        : 'Refresh All Profiles';

      var columnControl = '<div class="household-concerts-col-control">'
        + '<span class="household-concerts-col-control-label">Columns:</span>'
        + [1, 2, 3, 4].map(function (n) {
          return '<button type="button" class="household-concerts-chip' + (cols === n ? ' is-active' : '') + '" data-concert-action="set-band-columns" data-columns="' + n + '" title="' + n + ' column' + (n === 1 ? '' : 's') + '">' + n + '</button>';
        }).join('')
        + '<button type="button" class="pill-button household-concerts-refresh-all-btn" data-concert-action="refresh-all-band-profiles"' + (state.bulkProfileRefreshBusy ? ' disabled' : '') + '>' + refreshLabel + '</button>'
        + '</div>';

      var toolbar = '<div class="household-concerts-bands-toolbar">' + columnControl + buildPagination('top') + '</div>';

      var favCardHtml = favoriteBands.length
        ? '<div class="household-concerts-band-grid" style="' + gridStyle + '">' + favoriteBands.map(renderBandCard).join('') + '</div>'
        : '<p class="household-concerts-muted">No favorites in this filter range.</p>';
      var favoriteSection = '<section class="household-concerts-tier-section"><div class="household-concerts-panel-head"><div><h4>Favorite Bands</h4><p>' + totalFavoriteBands + ' band' + (totalFavoriteBands === 1 ? '' : 's') + '</p></div></div>' + favCardHtml + '</section>';

      var shouldShowSeenLiveSection = state.showTier4Bands || normalizeText(state.tierFilter) === normalizeText(BAND_TIER_OPTIONS[3].value);
      var seenCardHtml = seenLiveBands.length
        ? '<div class="household-concerts-band-grid" style="' + gridStyle + '">' + seenLiveBands.map(renderBandCard).join('') + '</div>'
        : '<p class="household-concerts-muted">No Tier 4 bands in this filter range.</p>';
      var seenLiveSection = shouldShowSeenLiveSection
        ? '<section class="household-concerts-tier-section"><div class="household-concerts-panel-head"><div><h4>Bands Seen Live (Not Favorites)</h4><p>' + totalSeenLiveBands + ' band' + (totalSeenLiveBands === 1 ? '' : 's') + '</p></div></div>' + seenCardHtml + '</section>'
        : '';
      el.innerHTML = toolbar + favoriteSection + seenLiveSection + buildPagination('bottom');
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
    var completeness = summarizeLinkCompletenessForBandShape(band);
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
    var missingText = completeness.missing.length ? ('Missing: ' + completeness.missing.join(', ')) : 'All key links found.';
    var linksHtml = links.length
      ? ('<div class="household-concerts-link-row">' + links.map(function (item) {
        return '<a class="household-concerts-link-pill" href="' + escapeHtml(safeUrl(item.url)) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(item.label) + '</a>';
      }).join('') + '</div>')
      : (compact ? '' : '<p class="household-concerts-muted">Add website and social links to build out the full band profile.</p>');
    var enrichBtn = band && band.id && completeness.missing.length
      ? '<button type="button" class="pill-button" data-concert-action="enrich-missing-links" data-band-key="' + escapeHtml(band.id) + '">Fill Missing Links</button>'
      : '';
    return '<div class="household-concerts-muted">Link completeness: ' + completeness.score + '% • ' + escapeHtml(missingText) + '</div>' + linksHtml + (enrichBtn ? ('<div class="household-concerts-form-actions">' + enrichBtn + '</div>') : '');
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

  function resolveAdjacentBand(band, direction) {
    var list = getFilteredBands();
    if (!list.length || !band) return null;
    var currentIndex = list.findIndex(function (entry) { return normalizeKey(entry.id) === normalizeKey(band.id); });
    if (currentIndex < 0) currentIndex = 0;
    var delta = direction === 'prev' ? -1 : 1;
    var nextIndex = currentIndex + delta;
    if (nextIndex < 0 || nextIndex >= list.length) return null;
    return list[nextIndex] || null;
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
    var recommendations = getVisibleDiscoveryRecommendationsForBand(activeBand.id || cacheKey);
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
          return '<div class="household-concerts-discovery-item household-concerts-discovery-item--suggested"><div><strong>' + escapeHtml(item.bandName) + '</strong><span>' + escapeHtml(item.reason || item.genreText || 'Genre-adjacent recommendation') + '</span></div><div class="household-concerts-form-actions"><button type="button" class="pill-button" data-concert-action="open-add-band" data-discovery-id="' + escapeHtml(item.id) + '" data-band-key="' + escapeHtml(activeBand.id) + '">Add</button><button type="button" class="pill-button" data-concert-action="mark-recommendation-not-interested" data-discovery-id="' + escapeHtml(item.id) + '" data-band-key="' + escapeHtml(activeBand.id) + '">Not Interested</button></div></div>';
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
    var groups = [];
    var groupMap = {};
    concerts.forEach(function (concert) {
      var groupKey = [toIsoDate(concert.concertDate), normalizeKey(concert.venue || 'venue-not-set')].join('::');
      if (!groupMap[groupKey]) {
        groupMap[groupKey] = {
          concertDate: toIsoDate(concert.concertDate),
          venue: concert.venue,
          items: []
        };
        groups.push(groupMap[groupKey]);
      }
      groupMap[groupKey].items.push(concert);
    });
    el.innerHTML = groups.map(function (group) {
      var groupBands = uniqueStrings(group.items.map(function (item) { return String(item.bandName || '').trim(); }).filter(Boolean));
      return '<section class="household-concerts-tier-section">'
        + '<div class="household-concerts-panel-head"><div><h4>' + escapeHtml(formatDate(group.concertDate)) + ' • ' + escapeHtml(group.venue || 'Venue not set') + '</h4><p>' + group.items.length + ' log entr' + (group.items.length === 1 ? 'y' : 'ies') + (groupBands.length ? (' • ' + escapeHtml(groupBands.join(', '))) : '') + '</p></div></div>'
        + group.items.map(function (concert) {
          var photoUrls = Array.isArray(concert.photoUrls) && concert.photoUrls.length
            ? concert.photoUrls
            : (concert.photoUrl ? [concert.photoUrl] : []);
          var historicMeta = normalizeHistoricEditMetaEntry(concert.historicEditMeta || {});
          var editedHistoricLabel = formatHistoricEditBadgeLabel(historicMeta);
          var editedHistoricBadge = editedHistoricLabel
            ? '<span class="household-concerts-history-badge" title="' + escapeHtml(editedHistoricLabel) + '">Edited Historic Entry</span>'
            : '';
          var editedHistoricNote = editedHistoricLabel
            ? '<p class="household-concerts-entry-history-note">📝 ' + escapeHtml(editedHistoricLabel) + '</p>'
            : '';
          return '<article class="household-concerts-entry-card">'
            + '<div class="household-concerts-entry-head"><div><h4>' + escapeHtml(concert.bandName) + ' ' + editedHistoricBadge + '</h4><p>' + escapeHtml(formatDate(concert.concertDate)) + ' • ' + escapeHtml(concert.venue || 'Venue not set') + '</p></div><div class="household-concerts-rating">' + escapeHtml(formatRatingStars(concert.rating)) + '</div></div>'
            + '<p class="household-concerts-muted">Attended by ' + escapeHtml(getAttendedByLabel(concert.attendedBy)) + '</p>'
            + editedHistoricNote
            + (concert.notes ? '<p class="household-concerts-entry-note">' + escapeHtml(concert.notes) + '</p>' : '')
            + '<div class="household-concerts-link-row">'
            + photoUrls.map(function (photoUrl, idx) {
              var label = photoUrls.length > 1 ? ('Photo ' + (idx + 1)) : 'Photo';
              return '<a class="household-concerts-link-pill" href="' + escapeHtml(safeUrl(photoUrl)) + '" target="_blank" rel="noopener noreferrer">' + label + '</a>';
            }).join('')
            + (concert.videoUrl ? '<a class="household-concerts-link-pill" href="' + escapeHtml(safeUrl(concert.videoUrl)) + '" target="_blank" rel="noopener noreferrer">Video</a>' : '')
            + (concert.setlistUrl ? '<a class="household-concerts-link-pill" href="' + escapeHtml(safeUrl(concert.setlistUrl)) + '" target="_blank" rel="noopener noreferrer">Setlist</a>' : '')
            + '</div>'
            + '<div class="household-concerts-form-actions"><button type="button" class="pill-button" data-concert-action="edit-attended-concert" data-attended-id="' + escapeHtml(concert.id) + '">Edit Log</button><button type="button" class="pill-button" data-concert-action="duplicate-attended-concert" data-attended-id="' + escapeHtml(concert.id) + '">Copy Log</button></div>'
            + '</article>';
        }).join('')
        + '</section>';
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
        + '<div class="household-concerts-form-actions">'
        + (concert.ticketsPurchased ? '<span class="household-concerts-tag">🎟 Tickets Purchased</span>' : '<span class="household-concerts-muted">No tickets marked yet.</span>')
        + '<button type="button" class="pill-button" data-concert-action="toggle-upcoming-ticket" data-upcoming-id="' + escapeHtml(concert.id) + '">' + (concert.ticketsPurchased ? 'Mark Tickets Not Purchased' : 'Mark Tickets Purchased') + '</button>'
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

  function renderPriorityBandsDashboard() {
    var el = document.getElementById('householdConcertsPriorityDashboard');
    if (!el) return;
    var prioritized = state.favoriteBands.filter(function (band) { return isPriorityBand(band); });
    var prioritizedKeys = new Set(prioritized.map(function (band) { return normalizeKey(band.id); }));
    var relatedUpcoming = state.upcomingConcerts.filter(function (concert) {
      return prioritizedKeys.has(normalizeKey(concert.bandKey));
    }).sort(function (a, b) {
      return String(a.concertDate || '').localeCompare(String(b.concertDate || ''));
    }).slice(0, 20);
    el.innerHTML = '<div class="household-concerts-panel-head"><div><h3>Priority Live Targets</h3><p>Bands you want to prioritize seeing live, with their nearby/upcoming shows.</p></div>'
      + '<button type="button" class="pill-button" data-concert-action="refresh-priority-dashboard">Refresh Priority Concerts</button></div>'
      + (prioritized.length
        ? '<div class="household-concerts-tag-row">' + prioritized.map(function (band) {
          return '<span class="household-concerts-tag">⭐ ' + escapeHtml(band.bandName) + '</span>';
        }).join('') + '</div>'
        : '<p class="household-concerts-muted">Mark bands as prioritized from a band card or profile.</p>')
      + (relatedUpcoming.length
        ? '<div class="household-concerts-entry-list">' + relatedUpcoming.map(function (concert) {
          return '<article class="household-concerts-entry-card"><h4>' + escapeHtml(concert.bandName) + '</h4><p>' + escapeHtml(formatDate(concert.concertDate)) + ' • ' + escapeHtml(concert.venue || 'Venue TBD') + '</p><p class="household-concerts-muted">' + escapeHtml([concert.city, concert.state].filter(Boolean).join(', ')) + '</p></article>';
        }).join('') + '</div>'
        : '<p class="household-concerts-muted">No upcoming shows saved yet for prioritized bands. Use Sync Tour on those bands.</p>');
  }

  function looksLikeFestivalEvent(event) {
    var hay = normalizeText([
      event && event.venue && event.venue.name,
      event && event.title,
      event && event.description
    ].join(' '));
    return /festival|fest\b|music festival|lineup/.test(hay);
  }

  async function refreshFestivalDashboard() {
    if (state.festivalDashboard.busy) return;
    state.festivalDashboard.busy = true;
    state.festivalDashboard.message = 'Scanning favorite bands for upcoming festival appearances...';
    renderFestivalDashboard();
    try {
      var map = {};
      var bands = state.favoriteBands.filter(function (band) { return !isTier4Band(band.bandTier); }).slice(0, 24);
      for (var i = 0; i < bands.length; i += 1) {
        var band = bands[i];
        var events = [];
        try {
          events = await fetchBandsintownEventsByArtistKey(extractBandsintownArtistSlug(band.bandsintownUrl) || band.bandName);
        } catch (_error) {
          events = [];
        }
        events.filter(looksLikeFestivalEvent).forEach(function (event) {
          var date = String((event && event.datetime) || '').slice(0, 10);
          var venueName = String((event && event.venue && event.venue.name) || 'Festival').trim();
          var city = String((event && event.venue && event.venue.city) || '').trim();
          var region = String((event && event.venue && event.venue.region) || '').trim();
          var key = normalizeKey(venueName + '::' + date + '::' + city + '::' + region);
          if (!map[key]) {
            map[key] = {
              key: key,
              name: venueName,
              date: date,
              city: city,
              state: region,
              url: String((event && event.url) || '').trim(),
              bands: []
            };
          }
          if (map[key].bands.indexOf(band.bandName) < 0) map[key].bands.push(band.bandName);
        });
      }
      state.festivalDashboard.festivals = Object.keys(map).map(function (key) { return map[key]; }).sort(function (a, b) {
        return String(a.date || '').localeCompare(String(b.date || ''));
      });
      state.festivalDashboard.generatedAt = Date.now();
      state.festivalDashboard.message = state.festivalDashboard.festivals.length
        ? ('Found ' + state.festivalDashboard.festivals.length + ' festival match' + (state.festivalDashboard.festivals.length === 1 ? '' : 'es') + '.')
        : 'No upcoming festival matches found for favorite bands.';
    } finally {
      state.festivalDashboard.busy = false;
      renderFestivalDashboard();
    }
  }

  function renderFestivalDashboard() {
    var el = document.getElementById('householdConcertsFestivalDashboard');
    if (!el) return;
    var data = state.festivalDashboard || { festivals: [], message: '' };
    el.innerHTML = '<div class="household-concerts-panel-head"><div><h3>Music Festival Dashboard</h3><p>Upcoming festivals across the country featuring your favorite bands.</p></div>'
      + '<button type="button" class="pill-button" data-concert-action="refresh-festival-dashboard">' + (data.busy ? 'Refreshing...' : 'Refresh Festivals') + '</button></div>'
      + (data.message ? '<p class="household-concerts-muted">' + escapeHtml(data.message) + '</p>' : '')
      + (Array.isArray(data.festivals) && data.festivals.length
        ? '<div class="household-concerts-entry-list">' + data.festivals.slice(0, 20).map(function (festival) {
          return '<article class="household-concerts-entry-card"><h4>' + escapeHtml(festival.name) + '</h4><p>' + escapeHtml(formatDate(festival.date)) + ' • ' + escapeHtml([festival.city, festival.state].filter(Boolean).join(', ')) + '</p>'
            + '<p class="household-concerts-muted">Favorite bands playing: ' + escapeHtml(festival.bands.join(', ')) + '</p>'
            + (festival.url ? ('<a class="household-concerts-link-pill" href="' + escapeHtml(safeUrl(festival.url)) + '" target="_blank" rel="noopener noreferrer">Open Festival</a>') : '')
            + '</article>';
        }).join('') + '</div>'
        : '<p class="household-concerts-muted">Run Refresh Festivals to scan for nationwide festival opportunities.</p>');
  }

   function renderAll() {
     renderStatus();
     renderSummary();
     renderGenreChips();
     renderTierChips();
      renderActiveFilterBreadcrumbs();
     renderFavoriteBands();
     renderSearchResults();
     renderDiscovery();
     renderAttendedConcerts();
     renderUpcomingConcerts();
     renderTicketedCalendar();
     renderPriorityBandsDashboard();
     renderFestivalDashboard();
     // ENHANCEMENT: New renderers
     renderPersonalStats();
     renderVenuePerformance();
     renderAchievements();
     renderPhotoGallery();
     renderAnalyticsDashboard();
     renderRecommendationToast();
      renderRockville2026();
   }

  async function readTableSafe(filePath, tableName) {
    try {
      var payload = await fetchTableColumnsAndRows(filePath, tableName, 1500);
      return toRowObjects(payload.columns, payload.rows);
    } catch (_error) {
      return [];
    }
  }

  async function fetchConcertWorkbookWorksheets(filePath) {
    var encodedPath = encodeGraphPath(filePath);
    var url = 'https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/worksheets?$select=id,name,position';
    var payload = await fetchJson(url);
    return Array.isArray(payload.value) ? payload.value : [];
  }

  async function createConcertWorkbookWorksheet(filePath, worksheetName) {
    var encodedPath = encodeGraphPath(filePath);
    var url = 'https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/worksheets/add';
    return fetchJson(url, { method: 'POST', body: { name: worksheetName } });
  }

  async function writeRockville2026HeaderRow(filePath, worksheetIdentifier) {
    var encodedPath = encodeGraphPath(filePath);
    var worksheetRef = encodeURIComponent(String(worksheetIdentifier || ROCKVILLE_2026_WORKSHEET).trim());
    var url = 'https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/worksheets/' + worksheetRef + '/range(address=\'' + getRockville2026HeaderRange() + '\')';
    await fetchJson(url, { method: 'PATCH', body: { values: [ROCKVILLE_2026_COLUMNS.slice()] } });
  }

  async function createRockville2026Table(filePath, worksheetIdentifier) {
    var encodedPath = encodeGraphPath(filePath);
    var worksheetRef = encodeURIComponent(String(worksheetIdentifier || ROCKVILLE_2026_WORKSHEET).trim());
    var url = 'https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/worksheets/' + worksheetRef + '/tables/add';
    await fetchJson(url, {
      method: 'POST',
      body: {
        address: getRockville2026HeaderRange(),
        hasHeaders: true,
        name: ROCKVILLE_2026_TABLE
      }
    });
    clearResolvedTableSchema(filePath, ROCKVILLE_2026_TABLE);
  }

  async function ensureRockville2026TableReady(filePath) {
    try {
      await fetchTableColumns(filePath, ROCKVILLE_2026_TABLE);
      return { available: true, created: false };
    } catch (error) {
      if (!isGraphItemNotFoundError(error)) throw error;
    }

    var worksheets = await fetchConcertWorkbookWorksheets(filePath);
    var worksheet = worksheets.find(function (entry) {
      return normalizeText(entry && entry.name) === normalizeText(ROCKVILLE_2026_WORKSHEET);
    });
    if (!worksheet) {
      worksheet = await createConcertWorkbookWorksheet(filePath, ROCKVILLE_2026_WORKSHEET);
    }
    await writeRockville2026HeaderRow(filePath, worksheet && (worksheet.id || worksheet.name || ROCKVILLE_2026_WORKSHEET));
    await createRockville2026Table(filePath, worksheet && (worksheet.id || worksheet.name || ROCKVILLE_2026_WORKSHEET));
    await fetchTableColumns(filePath, ROCKVILLE_2026_TABLE);
    rememberResolvedWorkbookPath(filePath);
    return { available: true, created: true };
  }

  async function readRockville2026WorkbookData(filePath) {
    var payload = await fetchTableColumnsAndRows(filePath, ROCKVILLE_2026_TABLE, 1000);
    var rows = toRowObjects(payload.columns, payload.rows);
    var days = getDefaultRockville2026Days();
    rows.forEach(function (record) {
      var parsed = parseRockvilleWorkbookSet(record);
      days[parsed.dayKey].push(parsed.set);
    });
    return { days: days };
  }

  async function findRockville2026WorkbookSet(filePath, setId) {
    var targetId = String(setId || '').trim();
    if (!targetId) return null;
    var rows = await readTableSafe(filePath, ROCKVILLE_2026_TABLE);
    for (var i = 0; i < rows.length; i += 1) {
      var parsed = parseRockvilleWorkbookSet(rows[i]);
      if (parsed.set.id === targetId) {
        return { dayKey: parsed.dayKey, set: parsed.set };
      }
    }
    return null;
  }

  async function syncRockvilleSetToWorkbook(dayKey, setEntry) {
    var workbookPath = await findWorkbookPath();
    await ensureRockville2026TableReady(workbookPath);
    var nextSet = normalizeRockvilleSet(setEntry);
    var backendMatch = (nextSet.__rowIndex >= 0 || nextSet.__rowId)
      ? { dayKey: normalizeRockvilleDayKey(dayKey), set: nextSet }
      : await findRockville2026WorkbookSet(workbookPath, nextSet.id);
    var targetRowIndex = backendMatch && backendMatch.set && Number.isInteger(Number(backendMatch.set.__rowIndex))
      ? Number(backendMatch.set.__rowIndex)
      : -1;
    var record = buildRockvilleWorkbookRecord(dayKey, Object.assign({}, backendMatch && backendMatch.set ? backendMatch.set : {}, nextSet));
    if (targetRowIndex >= 0) {
      await updateRecordInTableByIndex(workbookPath, ROCKVILLE_2026_TABLE, targetRowIndex, record);
    } else {
      await appendRecordToTable(workbookPath, ROCKVILLE_2026_TABLE, record);
    }
    var persisted = await findRockville2026WorkbookSet(workbookPath, nextSet.id);
    return persisted
      ? normalizeRockvilleSet(Object.assign({}, persisted.set, nextSet, { __rowIndex: persisted.set.__rowIndex, __rowId: persisted.set.__rowId }))
      : nextSet;
  }

  async function refreshData() {
    if (state.loading) return;
    state.loading = true;
    setStatus('Loading Concerts workbook data…', 'info');
    renderAll();
    try {
      var workbookPath = await findWorkbookPath();
      var attendedColumns = await fetchTableColumns(workbookPath, ATTENDED_TABLE);
      updateAttendedBySchemaWarning(attendedColumns);
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
      try {
        var backendRockville = await readRockville2026WorkbookData(workbookPath);
        state.rockville2026 = mergeRockville2026Sources(state.rockville2026, backendRockville);
        persistRockville2026Data();
        setRockvilleSyncStatus('synced', 'Rockville 2026 sets are loading from and saving to ' + WORKBOOK_NAME + '.');
      } catch (rockvilleError) {
        setRockvilleSyncStatus('local-only', 'Rockville 2026 is using local storage because Excel sync is currently unavailable.');
        if (!isGraphItemNotFoundError(rockvilleError)) {
          console.warn('⚠️ Rockville 2026 workbook sync unavailable:', rockvilleError && rockvilleError.message ? rockvilleError.message : rockvilleError);
        }
      }
      if (!getBandByKey(state.activeBandKey)) {
        state.activeBandKey = state.favoriteBands[0] ? state.favoriteBands[0].id : '';
      }
      setStatus('Concerts synced from ' + WORKBOOK_NAME + '. Favorite bands, attended concerts, and upcoming shows are ready.', 'success');
      renderAll();
      maybeHydrateUpcomingDistances();
      if (resolveActiveBand()) loadDiscoveryForBand(resolveActiveBand(), false);
     } catch (error) {
       if (isConcertsWorkbookUnavailableError(error)) {
         console.warn('⚠️ Concerts workbook unavailable; loading local-only tools:', error && error.message ? error.message : error);
       } else {
         console.error('❌ Concerts feature failed to load:', error);
       }
       state.attendedBySchemaWarning = '';
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
    function outageKeyForUrl(rawUrl) {
      var text = String(rawUrl || '');
      if (text.indexOf('/api/public/bandsintown') >= 0) return 'bandsintown';
      if (text.indexOf('/api/public/historic-shows') >= 0) return 'historic-shows';
      return '';
    }
    var outageKey = outageKeyForUrl(url);
    var now = Date.now();
    if (outageKey && state.apiOutages[outageKey] && Number(state.apiOutages[outageKey].until || 0) > now) {
      throw new Error('Temporary outage for ' + outageKey + ' API. Retry in a few minutes.');
    }
    var opts = options && typeof options === 'object' ? options : {};
    var response = await fetch(url, {
      method: opts.method || 'GET',
      headers: opts.headers || {}
    });
    if (!response.ok) {
      if (outageKey && response.status >= 500) {
        state.apiOutages[outageKey] = { until: now + (3 * 60 * 1000), status: response.status };
      }
      throw new Error('Request failed (' + response.status + ')');
    }
    if (outageKey) {
      delete state.apiOutages[outageKey];
    }
    return response.json().catch(function () { return {}; });
  }

  function sourceKeyFromLabel(label) {
    var text = normalizeText(label);
    if (!text) return '';
    if (text.indexOf('apple') >= 0) return 'apple';
    if (text.indexOf('musicbrainz') >= 0) return 'musicbrainz';
    if (text.indexOf('wikipedia') >= 0) return 'wikipedia';
    if (text.indexOf('bandsintown') >= 0) return 'bandsintown';
    if (text.indexOf('setlist') >= 0) return 'setlist.fm';
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
      var payload = await fetchBandsintownArtistMeta(cleanName);
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

  function isLocalHostname(host) {
    var cleanHost = String(host || '').trim().toLowerCase();
    return cleanHost === 'localhost'
      || cleanHost === '127.0.0.1'
      || cleanHost === '0.0.0.0'
      || cleanHost === '[::1]';
  }

  function canUseBandsintownProxy() {
    if (!(global && global.location)) return false;
    if (global.__forceBandsintownProxy === true) return true;
    var protocol = String(global.location.protocol || '');
    if (!/^https?:$/i.test(protocol)) return false;
    var host = String(global.location.hostname || '').trim().toLowerCase();
    if (!host) return false;
    return !isLocalHostname(host);
  }

  function canUseBandsintownDirectFallback() {
    if (global.__allowBandsintownDirect === true) return true;
    if (!(global && global.location)) return true;
    var host = String(global.location.hostname || '').trim().toLowerCase();
    if (!host) return true;
    return isLocalHostname(host);
  }

  function buildBandsintownProxyUrl(route, artistKey) {
    var cleanRoute = String(route || '').trim();
    var cleanArtist = String(artistKey || '').trim();
    if (!cleanRoute || !cleanArtist) return '';
    return '/api/public/bandsintown?route=' + encodeURIComponent(cleanRoute) + '&artist=' + encodeURIComponent(cleanArtist);
  }

  async function fetchBandsintownViaProxy(route, artistKey) {
    var url = buildBandsintownProxyUrl(route, artistKey);
    if (!url) throw new Error('Bandsintown proxy request is missing route or artist key.');
    var payload = await fetchJsonPublic(url);
    if (!payload || payload.ok !== true) {
      var reason = payload && payload.error ? String(payload.error).trim() : 'bandsintown_proxy_failed';
      var message = payload && payload.message ? String(payload.message).trim() : '';
      throw new Error('Bandsintown proxy failed (' + reason + ')' + (message ? ': ' + message : ''));
    }
    return payload.data;
  }

  function isBandsintownProxyUnavailableError(error) {
    var message = String(error && error.message ? error.message : '').trim();
    return /request failed \((404|405|501)\)/i.test(message)
      || /bandsintown proxy failed \(invalid_route\)/i.test(message);
  }

  async function fetchBandsintownArtistMeta(artistKey) {
    var key = String(artistKey || '').trim();
    if (!key) return {};
    if (canUseBandsintownProxy()) {
      try {
        return await fetchBandsintownViaProxy('artist', key);
      } catch (proxyError) {
        // If it's a known unavailability (404/5xx/timeout), try direct fallback or return {}
        // For any other unexpected error also fall back rather than crashing — meta is non-critical
        if (!canUseBandsintownDirectFallback()) {
          return {}; // Web build — can't hit Bandsintown directly; artist meta is optional
        }
        // On local dev, fall through to direct API below
      }
    }
    try {
      return await fetchJsonPublic('https://www.bandsintown.com/api/v2/artists/' + encodeURIComponent(key) + '?app_id=kyles_adventure_planner');
    } catch (_directError) {
      return {}; // Direct API also unavailable — return empty, sync continues with band name
    }
  }

  function extractMemberRolesFromMusicBrainzRelations(relations) {
    var list = Array.isArray(relations) ? relations : [];
    var timelineRows = [];
    var rows = list.map(function (relation) {
      if (!relation || !relation.artist || !relation.artist.name) return '';
      var type = normalizeText(relation.type || '');
      if (type.indexOf('member') < 0 && type.indexOf('founder') < 0) return '';
      var attributes = Array.isArray(relation.attributes) ? relation.attributes : [];
      var role = attributes.length ? attributes.join(', ') : (type.indexOf('founder') >= 0 ? 'Founder' : 'Member');
      var begin = String(relation.begin || '').slice(0, 4);
      var end = String(relation.end || '').slice(0, 4);
      var era = begin ? (begin + ' - ' + (end || 'present')) : '';
      var ended = relation.ended || !!end;
      timelineRows.push((ended ? 'Former: ' : 'Current: ') + String(relation.artist.name || '').trim() + (era ? (' (' + era + ')') : ''));
      return String(relation.artist.name || '').trim() + ' — ' + role;
    }).filter(Boolean);
    return {
      bandMembers: uniqueStrings(rows).slice(0, 12).join('\n'),
      memberTimeline: uniqueStrings(timelineRows).slice(0, 16).join('\n')
    };
  }

  async function fetchAppleBandEnrichment(bandName) {
    var cleanName = String(bandName || '').trim();
    if (!cleanName) return {};

    var artistPayload = await fetchJsonPublic('https://itunes.apple.com/search?entity=musicArtist&limit=8&term=' + encodeURIComponent(cleanName));
    var artistResults = Array.isArray(artistPayload.results) ? artistPayload.results : [];
    var artist = chooseBestNameMatch(cleanName, artistResults, function (item) { return item.artistName; }) || {};

    var songPayload = await fetchJsonPublic('https://itunes.apple.com/search?entity=song&attribute=artistTerm&limit=8&term=' + encodeURIComponent(cleanName));
    var songResults = Array.isArray(songPayload.results) ? songPayload.results : [];
    var topSongCandidates = uniqueStrings(songResults
      .filter(function (item) {
        var artistName = normalizeText(item.artistName || '');
        return artistName === normalizeText(cleanName) || normalizeText(cleanName).indexOf(artistName) >= 0;
      })
      .map(function (item) { return String(item.trackName || '').trim(); })
      .filter(Boolean)).slice(0, 12).map(function (title, idx) {
      return { title: title, score: Math.max(0.5, 4 - (idx * 0.25)), source: 'apple' };
    });
    var topSongs = uniqueStrings(songResults
      .filter(function (item) {
        var artistName = normalizeText(item.artistName || '');
        return artistName === normalizeText(cleanName) || normalizeText(cleanName).indexOf(artistName) >= 0;
      })
      .map(function (item) { return String(item.trackName || '').trim(); })
      .filter(Boolean)).slice(0, 6).join(', ');

    var albumPayload = await fetchJsonPublic('https://itunes.apple.com/search?entity=album&attribute=artistTerm&limit=8&term=' + encodeURIComponent(cleanName));
    var albumResults = Array.isArray(albumPayload.results) ? albumPayload.results : [];
    var albumEntries = uniqueStrings(albumResults
      .filter(function (item) {
        var artistName = normalizeText(item.artistName || '');
        return artistName === normalizeText(cleanName) || normalizeText(cleanName).indexOf(artistName) >= 0;
      })
      .map(function (item) {
        return JSON.stringify({
          title: String(item.collectionName || '').trim(),
          year: String(item.releaseDate || '').slice(0, 4)
        });
      })
      .filter(Boolean)).map(function (entry) {
      try { return JSON.parse(entry); } catch (_error) { return null; }
    }).filter(Boolean);
    var discography = uniqueStrings(albumResults
      .filter(function (item) {
        var artistName = normalizeText(item.artistName || '');
        return artistName === normalizeText(cleanName) || normalizeText(cleanName).indexOf(artistName) >= 0;
      })
      .map(function (item) { return String(item.collectionName || '').trim(); })
      .filter(Boolean)).slice(0, 6).join(', ');
    var albumCoverCandidates = albumResults
      .filter(function (item) {
        var artistName = normalizeText(item.artistName || '');
        return artistName === normalizeText(cleanName) || normalizeText(cleanName).indexOf(artistName) >= 0;
      })
      .map(function (item) {
        var art = String(item.artworkUrl100 || item.artworkUrl60 || '').trim();
        if (!art) return null;
        return {
          url: art.replace(/\/\d+x\d+bb\./, '/1200x1200bb.'),
          label: String(item.collectionName || '').trim(),
          releaseDate: String(item.releaseDate || '').trim()
        };
      })
      .filter(Boolean)
      .slice(0, 8);

    var lastReleaseDate = albumResults
      .map(function (item) { return String(item.releaseDate || '').trim(); })
      .filter(Boolean)
      .sort(function (a, b) { return b.localeCompare(a); })[0] || '';

    return {
      bandName: String(artist.artistName || cleanName).trim(),
      associatedGenres: String(artist.primaryGenreName || '').trim(),
      topSongs: topSongs,
      topSongCandidates: topSongCandidates,
      discography: mergeDiscographyEntriesWithYears(discography, albumEntries),
      lastReleaseDate: lastReleaseDate ? String(lastReleaseDate).slice(0, 10) : '',
      tourPageUrl: String(artist.artistLinkUrl || '').trim(),
      bandsintownUrl: await resolveBandsintownArtistUrl(cleanName),
      youTubeUrl: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(cleanName),
      setlistUrl: 'https://www.setlist.fm/search?query=' + encodeURIComponent(cleanName),
      wikipediaUrl: 'https://en.wikipedia.org/w/index.php?search=' + encodeURIComponent(cleanName),
      albumCoverCandidates: albumCoverCandidates,
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
    var memberInfo = extractMemberRolesFromMusicBrainzRelations(relations);

    var recordingsPayload = await fetchJsonPublic('https://musicbrainz.org/ws/2/recording/?fmt=json&limit=15&query=' + encodeURIComponent('artist:"' + cleanName + '"'));
    var recordings = Array.isArray(recordingsPayload.recordings) ? recordingsPayload.recordings : [];
    var topSongCandidates = uniqueStrings(recordings.map(function (recording) {
      return String(recording.title || '').trim();
    }).filter(Boolean)).slice(0, 10).map(function (title, idx) {
      var rec = recordings.find(function (recording) { return normalizeText(recording.title || '') === normalizeText(title); }) || {};
      var score = Number(rec.score);
      return {
        title: title,
        score: Number.isFinite(score) ? Math.max(0.4, score / 30) : Math.max(0.4, 3 - (idx * 0.2)),
        source: 'musicbrainz'
      };
    });

    return {
      origin: preferFilledValue('', ((detailPayload['begin-area'] || {}).name) || ((detailPayload.area || {}).name) || ((artist['begin-area'] || {}).name) || ((artist.area || {}).name) || ''),
      founded: formedYear,
      websiteUrl: officialSite ? String(officialSite.url.resource || '').trim() : '',
      wikipediaUrl: wikipedia ? String(wikipedia.url.resource || '').trim() : '',
      bandMembers: memberInfo.bandMembers,
      memberTimeline: memberInfo.memberTimeline,
      topSongCandidates: topSongCandidates,
      associatedGenres: uniqueStrings(tags.map(function (tag) { return String(tag.name || '').trim(); }).filter(Boolean)).slice(0, 6).join(', '),
      sourceLabel: memberInfo.bandMembers ? 'Auto-filled from MusicBrainz metadata + relationships' : 'Auto-filled from MusicBrainz metadata',
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

  async function fetchSetlistSongStatsEnrichment(bandName) {
    var cleanName = String(bandName || '').trim();
    if (!cleanName) return {};
    try {
      var nowYear = new Date().getFullYear();
      var payload = await fetchJsonPublic('/api/public/historic-shows?mode=song-stats&band=' + encodeURIComponent(cleanName) + '&fromYear=' + encodeURIComponent(Math.max(1990, nowYear - 25)) + '&toYear=' + encodeURIComponent(nowYear) + '&radiusMiles=5000&latitude=35.3187&longitude=-82.4609');
      if (!payload || payload.ok !== true) return {};
      var rows = Array.isArray(payload.data) ? payload.data : [];
      return {
        topSongCandidates: rows.slice(0, 12).map(function (entry) {
          return {
            title: String(entry.song || '').trim(),
            score: Number(entry.frequency) || 1,
            source: 'setlist.fm'
          };
        }).filter(function (entry) { return entry.title; }),
        sourceLabel: rows.length ? 'Auto-filled from Setlist.fm song-frequency data' : '',
        sourceKey: rows.length ? 'setlist.fm' : ''
      };
    } catch (_error) {
      return {};
    }
  }

    function mergeBandPrefill(base, addition) {
    var current = base && typeof base === 'object' ? base : {};
    var incoming = addition && typeof addition === 'object' ? addition : {};
    var mergedTopSongCandidates = mergeTopSongCandidates(current.topSongCandidates || [], incoming.topSongCandidates || []);
    var mergedTopSongs = formatTopSongsFromCandidates(mergedTopSongCandidates) || mergeDelimitedValues(current.topSongs, incoming.topSongs);
    return {
      bandName: preferFilledValue(current.bandName, incoming.bandName),
      bandMembers: preferFilledValue(current.bandMembers, incoming.bandMembers),
      bandLogoUrl: preferFilledValue(current.bandLogoUrl, incoming.bandLogoUrl),
      bandCoverPhotoUrl: preferFilledValue(current.bandCoverPhotoUrl, incoming.bandCoverPhotoUrl),
      origin: preferFilledValue(current.origin, incoming.origin),
      founded: preferFilledValue(current.founded, incoming.founded),
      recordLabel: preferFilledValue(current.recordLabel, incoming.recordLabel),
      discography: mergeDiscographyEntriesWithYears(mergeDelimitedValues(current.discography, incoming.discography), []),
      topSongs: mergedTopSongs,
      topSongCandidates: mergedTopSongCandidates,
      associatedGenres: mergeDelimitedValues(current.associatedGenres, incoming.associatedGenres),
      websiteUrl: preferSpecificUrl(current.websiteUrl, incoming.websiteUrl),
      tourPageUrl: preferSpecificUrl(current.tourPageUrl, incoming.tourPageUrl),
      facebookUrl: preferFilledValue(current.facebookUrl, incoming.facebookUrl),
      instagramUrl: preferFilledValue(current.instagramUrl, incoming.instagramUrl),
      youTubeUrl: preferSpecificUrl(current.youTubeUrl, incoming.youTubeUrl),
      setlistUrl: preferSpecificUrl(current.setlistUrl, incoming.setlistUrl),
      bandsintownUrl: preferSpecificUrl(current.bandsintownUrl, incoming.bandsintownUrl),
      wikipediaUrl: preferSpecificUrl(current.wikipediaUrl, incoming.wikipediaUrl),
      lastReleaseDate: preferFilledValue(current.lastReleaseDate, incoming.lastReleaseDate),
      memberTimeline: preferFilledValue(current.memberTimeline, incoming.memberTimeline),
      coverPositionX: Number.isFinite(Number(incoming.coverPositionX)) ? Number(incoming.coverPositionX) : (Number.isFinite(Number(current.coverPositionX)) ? Number(current.coverPositionX) : null),
      coverPositionY: Number.isFinite(Number(incoming.coverPositionY)) ? Number(incoming.coverPositionY) : (Number.isFinite(Number(current.coverPositionY)) ? Number(current.coverPositionY) : null),
      coverZoom: Number.isFinite(Number(incoming.coverZoom)) ? Number(incoming.coverZoom) : (Number.isFinite(Number(current.coverZoom)) ? Number(current.coverZoom) : null),
      logoPositionX: Number.isFinite(Number(incoming.logoPositionX)) ? Number(incoming.logoPositionX) : (Number.isFinite(Number(current.logoPositionX)) ? Number(current.logoPositionX) : null),
      logoPositionY: Number.isFinite(Number(incoming.logoPositionY)) ? Number(incoming.logoPositionY) : (Number.isFinite(Number(current.logoPositionY)) ? Number(current.logoPositionY) : null),
      albumCoverCandidates: uniqueStrings([].concat(current.albumCoverCandidates || [], incoming.albumCoverCandidates || []).map(function (item) {
        if (!item || !item.url) return '';
        return JSON.stringify({
          url: String(item.url || '').trim(),
          label: String(item.label || '').trim(),
          releaseDate: String(item.releaseDate || '').trim()
        });
      }).filter(Boolean)).map(function (entry) {
        try { return JSON.parse(entry); } catch (_error) { return null; }
      }).filter(Boolean),
      linkCompletenessScore: Number.isFinite(Number(incoming.linkCompletenessScore)) ? Number(incoming.linkCompletenessScore) : (Number.isFinite(Number(current.linkCompletenessScore)) ? Number(current.linkCompletenessScore) : null),
      enrichmentHealthScore: Number.isFinite(Number(incoming.enrichmentHealthScore)) ? Number(incoming.enrichmentHealthScore) : (Number.isFinite(Number(current.enrichmentHealthScore)) ? Number(current.enrichmentHealthScore) : null),
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
    tasks.push(fetchSetlistSongStatsEnrichment(bandName));
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
    var completeness = summarizeLinkCompletenessForBandShape(merged);
    merged.linkCompletenessScore = completeness.score;
    if (completeness.missing.length) {
      merged.missingLinks = completeness.missing;
    }
    merged.enrichmentHealthScore = computeBandEnrichmentHealth(merged, {
      sourceKeys: merged.sourceKeys,
      enrichmentConfidence: merged.enrichmentConfidence
    }).score;
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

  function pickBestAlbumCoverCandidate(enriched) {
    var list = Array.isArray(enriched && enriched.albumCoverCandidates) ? enriched.albumCoverCandidates.slice() : [];
    if (!list.length) return null;
    list.sort(function (a, b) {
      return String(b && b.releaseDate || '').localeCompare(String(a && a.releaseDate || ''));
    });
    return list[0] || null;
  }

  function shouldImportAlbumCover(enriched, existingBand) {
    var currentCover = String((enriched && enriched.bandCoverPhotoUrl) || (existingBand && existingBand.bandCoverPhotoUrl) || '').trim();
    if (!currentCover) return true;
    return /itunes|mzstatic|apple\.com/i.test(currentCover);
  }

  async function maybeImportAlbumCoverToOneDrive(enriched, existingBand) {
    if (!enriched || typeof enriched !== 'object') return enriched;
    if (!shouldImportAlbumCover(enriched, existingBand)) return enriched;
    var candidate = pickBestAlbumCoverCandidate(enriched);
    if (!candidate || !candidate.url) return enriched;
    try {
      var uploadedCoverUrl = await uploadBandImageFromUrl(candidate.url, {
        bandName: String((enriched.bandName || (existingBand && existingBand.bandName) || '')).trim()
      }, 'album-cover');
      enriched.bandCoverPhotoUrl = uploadedCoverUrl;
      return enriched;
    } catch (_error) {
      return enriched;
    }
  }

  function renderBandEnrichmentBadge(band) {
    var meta = getBandProfileMeta(band && band.id ? band.id : band && band.bandName);
    var health = computeBandEnrichmentHealth(band, meta || {});
    var breakdownText = health.breakdown.filter(function (entry) { return entry.available; }).map(function (entry) {
      return entry.label + ': ' + entry.score + '%';
    }).join(' • ');
    var healthLabel = 'Profile ' + health.score + '% complete';
    var healthTitle = breakdownText ? ('Enrichment health — ' + breakdownText + '.') : 'Enrichment health score.';
    if (!meta || !meta.lastEnrichedFrom) {
      return '<span class="household-concerts-enrichment-badge household-concerts-enrichment-badge--static" title="' + escapeHtml(healthTitle) + '">✨ ' + escapeHtml(healthLabel) + '</span>';
    }
    var stamp = formatDateTimeShort(meta.lastEnrichedAt);
    var title = (stamp ? ('Last enriched ' + stamp) : 'Band profile was auto-enriched') + '. ' + healthTitle;
    return '<button type="button" class="household-concerts-enrichment-badge" data-concert-action="open-band-refresh-history" data-band-key="' + escapeHtml(band.id || normalizeKey(band.bandName)) + '" title="' + escapeHtml(title + ' Click for refresh history.') + '">✨ ' + escapeHtml(healthLabel) + ' • Last enriched from ' + escapeHtml(meta.lastEnrichedFrom) + (stamp ? ' • ' + escapeHtml(stamp) : '') + '</button>';
  }

  function renderSourceIcon(sourceKey) {
    var key = normalizeText(sourceKey);
    var map = {
      apple: { icon: 'A', label: 'Apple Music' },
      musicbrainz: { icon: 'MB', label: 'MusicBrainz' },
      wikipedia: { icon: 'W', label: 'Wikipedia' },
      bandsintown: { icon: 'BT', label: 'Bandsintown' },
      'setlist.fm': { icon: 'SL', label: 'Setlist.fm' },
      setlistfm: { icon: 'SL', label: 'Setlist.fm' },
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

  function getVisibleDiscoveryRecommendationsForBand(bandKey) {
    return getDiscoveryRecommendationsForBand(bandKey).filter(function (item) {
      return !isRecommendationNotInterested(item && item.bandName);
    });
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
      + '<div class="household-concerts-form-actions"><button type="button" class="pill-button" data-concert-action="refresh-band-profile-preview" data-band-key="' + escapeHtml(band.id) + '">↻ Refresh with Preview</button><button type="button" class="pill-button household-concerts-refresh-profile-btn pill-button-refresh-profile" data-concert-action="refresh-band-profile" data-band-key="' + escapeHtml(band.id) + '">↻ Refresh (apply all)</button><button type="button" class="pill-button" data-concert-action="clear-band-refresh-history" data-band-key="' + escapeHtml(band.id) + '">Clear History</button><button type="button" class="pill-button" data-concert-action="close-modal">Done</button></div>'
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
    state.attendedLastUploadedPhotoUrls = [];
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
        state.attendedUploadedPhotoUrls = uniqueStrings([].concat(state.attendedUploadedPhotoUrls, uploadedUrls).map(function (url) {
          return String(url || '').trim();
        }).filter(Boolean));
          state.attendedLastUploadedPhotoUrls = uploadedUrls.slice();
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
      lastReleaseDate: String(raw.Last_Release_Date || '').trim(),
      memberTimeline: String(raw.Member_Timeline || '').trim(),
      bandTier: normalizeBandTier(raw.Band_Tier || ''),
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
      bandTier: 'Band_Tier',
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
      if (!safeOptions.silent) {
        enriched = await maybeImportAlbumCoverToOneDrive(enriched, current);
      }
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

  // ===== IMAGE CROP / POSITION =====

  function getBandImageCrop(bandId) {
    var key = normalizeKey(bandId);
    var overrides = (key && state.bandProfileOverrides && state.bandProfileOverrides[key]) ? state.bandProfileOverrides[key] : {};
    var band = key ? getBandByKey(key) : null;
    return {
      coverPositionX: Number.isFinite(Number(overrides.coverPositionX)) ? Number(overrides.coverPositionX) : (Number.isFinite(Number(band && band.coverPositionX)) ? Number(band.coverPositionX) : 50),
      coverPositionY: Number.isFinite(Number(overrides.coverPositionY)) ? Number(overrides.coverPositionY) : (Number.isFinite(Number(band && band.coverPositionY)) ? Number(band.coverPositionY) : 50),
      coverZoom: (Number.isFinite(Number(overrides.coverZoom)) && Number(overrides.coverZoom) >= 100)
        ? Number(overrides.coverZoom)
        : ((Number.isFinite(Number(band && band.coverZoom)) && Number(band && band.coverZoom) >= 100) ? Number(band.coverZoom) : 100),
      logoPositionX: Number.isFinite(Number(overrides.logoPositionX)) ? Number(overrides.logoPositionX) : (Number.isFinite(Number(band && band.logoPositionX)) ? Number(band.logoPositionX) : 50),
      logoPositionY: Number.isFinite(Number(overrides.logoPositionY)) ? Number(overrides.logoPositionY) : (Number.isFinite(Number(band && band.logoPositionY)) ? Number(band.logoPositionY) : 50)
    };
  }

  function buildCoverStyle(band) {
    if (!band || !band.bandCoverPhotoUrl) return '';
    var crop = getBandImageCrop(band.id);
    var bgPos = crop.coverPositionX + '% ' + crop.coverPositionY + '%';
    var bgSize = crop.coverZoom > 100 ? crop.coverZoom + '%' : 'cover';
    return ' style="background-image:url(' + escapeHtml(safeUrl(band.bandCoverPhotoUrl)) + ');background-position:' + bgPos + ';background-size:' + bgSize + '"';
  }

  function openImagePositionModal(bandKey, imageType) {
    var band = getBandByKey(bandKey);
    if (!band) return;
    var imageUrl = imageType === 'logo' ? band.bandLogoUrl : band.bandCoverPhotoUrl;
    if (!imageUrl) {
      setStatus('No ' + imageType + ' image is set for ' + band.bandName + '. Use Manage Photos to add one first.', 'warning');
      return;
    }
    var crop = getBandImageCrop(band.id);
    var currentX = imageType === 'logo' ? crop.logoPositionX : crop.coverPositionX;
    var currentY = imageType === 'logo' ? crop.logoPositionY : crop.coverPositionY;
    var currentZoom = crop.coverZoom;
    var safeImgUrl = escapeHtml(safeUrl(imageUrl));
    var previewHtml = imageType === 'logo'
      ? '<div class="household-concerts-crop-preview-wrap"><img id="hcCropPreviewLogo" class="household-concerts-crop-preview-logo" src="' + safeImgUrl + '" alt="Logo preview" style="object-position:' + currentX + '% ' + currentY + '%"></div>'
      : '<div class="household-concerts-crop-preview-wrap"><div id="hcCropPreviewCover" class="household-concerts-crop-preview-cover" style="background-image:url(' + safeImgUrl + ');background-position:' + currentX + '% ' + currentY + '%;background-size:' + (currentZoom > 100 ? currentZoom + '%' : 'cover') + '"></div></div>';
    var zoomRowHtml = imageType === 'cover'
      ? '<div class="household-concerts-form-row"><label>Zoom <span id="hcCropZoomLabel" class="household-concerts-crop-value-badge">' + currentZoom + '%</span></label><input id="householdConcertsCropZoom" type="range" min="100" max="300" step="5" value="' + currentZoom + '"></div>'
      : '';
    openModal(
      '<div class="household-concerts-modal-head"><div><h3>Adjust ' + (imageType === 'logo' ? 'Logo' : 'Cover Photo') + ' Position</h3><p>Use the sliders to reposition. Preview updates live.</p></div><button type="button" class="household-concerts-icon-btn" data-concert-action="close-modal">✕</button></div>'
      + '<div class="household-concerts-band-profile" data-image-position-band-key="' + escapeHtml(band.id) + '" data-image-position-type="' + imageType + '">'
      + previewHtml
      + '<div class="household-concerts-form">'
      + '<div class="household-concerts-form-row"><label>Horizontal Position <span id="hcCropXLabel" class="household-concerts-crop-value-badge">' + currentX + '%</span></label><input id="householdConcertsCropX" type="range" min="0" max="100" step="1" value="' + currentX + '"></div>'
      + '<div class="household-concerts-form-row"><label>Vertical Position <span id="hcCropYLabel" class="household-concerts-crop-value-badge">' + currentY + '%</span></label><input id="householdConcertsCropY" type="range" min="0" max="100" step="1" value="' + currentY + '"></div>'
      + zoomRowHtml
      + '<div class="household-concerts-form-actions">'
      + '<button type="button" class="pill-button" data-concert-action="reset-image-position" data-band-key="' + escapeHtml(band.id) + '" data-image-type="' + imageType + '">↺ Reset to Default</button>'
      + '<button type="button" class="pill-button" data-concert-action="close-modal">Cancel</button>'
      + '<button type="button" class="pill-button pill-button-primary" data-concert-action="apply-image-position" data-band-key="' + escapeHtml(band.id) + '" data-image-type="' + imageType + '">✓ Apply Position</button>'
      + '</div>'
      + '</div>'
      + '</div>'
    );
  }

  function updateImageCropPreview() {
    var xInput = document.getElementById('householdConcertsCropX');
    var yInput = document.getElementById('householdConcertsCropY');
    var zInput = document.getElementById('householdConcertsCropZoom');
    var x = xInput ? Number(xInput.value) : 50;
    var y = yInput ? Number(yInput.value) : 50;
    var zoom = zInput ? Number(zInput.value) : 100;
    var xLabel = document.getElementById('hcCropXLabel');
    var yLabel = document.getElementById('hcCropYLabel');
    var zLabel = document.getElementById('hcCropZoomLabel');
    if (xLabel) xLabel.textContent = x + '%';
    if (yLabel) yLabel.textContent = y + '%';
    if (zLabel) zLabel.textContent = zoom + '%';
    var coverPreview = document.getElementById('hcCropPreviewCover');
    if (coverPreview) {
      coverPreview.style.backgroundPosition = x + '% ' + y + '%';
      coverPreview.style.backgroundSize = zoom > 100 ? zoom + '%' : 'cover';
    }
    var logoPreview = document.getElementById('hcCropPreviewLogo');
    if (logoPreview) {
      logoPreview.style.objectPosition = x + '% ' + y + '%';
    }
  }

  async function applyImagePosition(bandKey, imageType) {
    var xInput = document.getElementById('householdConcertsCropX');
    var yInput = document.getElementById('householdConcertsCropY');
    var zInput = document.getElementById('householdConcertsCropZoom');
    var x = xInput ? Number(xInput.value) : 50;
    var y = yInput ? Number(yInput.value) : 50;
    var zoom = zInput ? Number(zInput.value) : 100;
    var patch = imageType === 'logo'
      ? { logoPositionX: x, logoPositionY: y }
      : { coverPositionX: x, coverPositionY: y, coverZoom: zoom };
    try {
      await persistBandImagePositionPatch(bandKey, patch);
      closeModal();
      renderAll();
      var band = getBandByKey(bandKey);
      setStatus((band ? band.bandName : 'Band') + ' ' + (imageType === 'logo' ? 'logo' : 'cover photo') + ' position updated.', 'success');
    } catch (error) {
      setStatus(error && error.message ? error.message : 'Could not update image position.', 'error');
    }
  }

  async function persistBandImagePositionPatch(bandKey, patch) {
    var safeBandKey = String(bandKey || '').trim();
    if (!safeBandKey || !patch || typeof patch !== 'object') return;
    var band = getBandByKey(safeBandKey);
    saveBandProfileOverride(safeBandKey, patch);
    if (!band) return;
    state.favoriteBands = state.favoriteBands.map(function (entry) {
      if (!entry || normalizeKey(entry.id || entry.bandName) !== normalizeKey(band.id || band.bandName)) return entry;
      return Object.assign({}, entry, patch);
    });
    await persistFavoriteBandProfilePatch(band, patch, { skipRender: true });
  }

  async function resetImagePosition(bandKey, imageType) {
    var safeType = String(imageType || '').trim();
    var patch = safeType === 'logo'
      ? { logoPositionX: 50, logoPositionY: 50 }
      : { coverPositionX: 50, coverPositionY: 50, coverZoom: 100 };
    try {
      await persistBandImagePositionPatch(bandKey, patch);
      openImagePositionModal(bandKey, safeType);
    } catch (error) {
      setStatus(error && error.message ? error.message : 'Could not reset image position.', 'error');
    }
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
    var pickerBandKey = state.bandImagePicker.sourceType === 'band'
      ? normalizeKey(state.bandImagePicker.sourceBandKey || state.bandImagePicker.bandName || '')
      : '';
    openModal(
      '<div class="household-concerts-modal-head"><div><h3>Select Band Images</h3><p>Choose a cover and logo, then upload to OneDrive `Copilot_Apps/Band_Photos`.</p></div><button type="button" class="household-concerts-icon-btn" data-concert-action="close-modal">✕</button></div>'
      + '<div class="household-concerts-band-profile">'
      + '<div id="householdConcertsBandImagePickerStatus" class="household-concerts-upload-status household-concerts-upload-status--info">Pick candidate images, or upload/import your own.</div>'
      + renderBandImagePickerCandidates(state.bandImagePicker.candidates)
      + '<div class="household-concerts-band-image-manual-grid">'
      + '<div class="household-concerts-form-row"><label>Upload logo file</label><input id="householdConcertsBandLogoFileInput" type="file" accept="image/*"><button type="button" class="pill-button" data-concert-action="upload-band-logo-file">Upload Logo</button></div>'
      + '<div class="household-concerts-form-row"><label>Upload cover file</label><input id="householdConcertsBandCoverFileInput" type="file" accept="image/*"><button type="button" class="pill-button" data-concert-action="upload-band-cover-file">Upload Cover</button></div>'
      + '<div class="household-concerts-form-row"><label>Import logo from URL</label><input id="householdConcertsBandLogoUrlInput" placeholder="https://..."><button type="button" class="pill-button" data-concert-action="import-band-logo-url">Import Logo URL</button></div>'
      + '<div class="household-concerts-form-row"><label>Import cover from URL</label><input id="householdConcertsBandCoverUrlInput" placeholder="https://..."><button type="button" class="pill-button" data-concert-action="import-band-cover-url">Import Cover URL</button></div>'
      + '</div>'
      + (pickerBandKey
        ? '<div class="household-concerts-form-row"><label>Adjust image position</label><div class="household-concerts-form-actions"><button type="button" class="pill-button" data-concert-action="open-image-position-cover" data-band-key="' + escapeHtml(pickerBandKey) + '">Adjust Cover Position</button><button type="button" class="pill-button" data-concert-action="open-image-position-logo" data-band-key="' + escapeHtml(pickerBandKey) + '">Adjust Logo Position</button></div></div>'
        : '')
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
          var imagePatch = {
            bandLogoUrl: formData.bandLogoUrl || sourceBand.bandLogoUrl,
            bandCoverPhotoUrl: formData.bandCoverPhotoUrl || sourceBand.bandCoverPhotoUrl
          };
          await persistFavoriteBandProfilePatch(sourceBand, imagePatch, { skipRender: true });
          saveBandProfileOverride(sourceBandKey, imagePatch);
          state.favoriteBands = state.favoriteBands.map(function (entry) {
            if (!entry) return entry;
            var sameId = normalizeKey(entry.id || '') === normalizeKey(sourceBand.id || '');
            var sameName = normalizeKey(entry.bandName || '') === normalizeKey(sourceBand.bandName || '');
            if (!sameId && !sameName) return entry;
            return Object.assign({}, entry, imagePatch);
          });
        }
        closeModal();
        renderAll();
        openBandDetails(getBandByKey(sourceBandKey));
        setStatus('Band images uploaded to OneDrive `Copilot_Apps/Band_Photos` and applied to ' + (sourceBand ? sourceBand.bandName : 'this band') + '.', 'success');
        return;
      }
      closeModal();
      openBandForm(formData);
      setStatus('Band images uploaded to OneDrive `Copilot_Apps/Band_Photos` and applied to the form.', 'success');
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
      var uploadResult = await uploadBandImageToOneDrive(file, { bandName: String(formData.bandName || state.bandImagePicker.bandName || '').trim() }, role, file.name || 'band-image.jpg');
      var url = uploadResult && uploadResult.url ? uploadResult.url : String(uploadResult || '').trim();
      if (formFieldName === 'Band_Logo_URL') formData.bandLogoUrl = url;
      if (formFieldName === 'Band_Cover_Photo_URL') formData.bandCoverPhotoUrl = url;
      state.bandImagePicker.formData = formData;
      var locationHint = uploadResult && uploadResult.uploadPath ? (' Saved to ' + uploadResult.uploadPath + '.') : '';
      setBandImagePickerStatus('Uploaded successfully and applied to form.' + locationHint, 'success');
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
      lastReleaseDate: '',
      memberTimeline: '',
      bandTier: BAND_TIER_OPTIONS[1].value,
      sourceLabel: ''
    }, prefill || {});
    openModal(
      '<div class="household-concerts-modal-head"><div><h3>Add Favorite Band</h3><p data-band-form-source>' + escapeHtml(data.sourceLabel || 'Use search results or fill this out manually. Any fields you leave blank can be enriched later.') + '</p></div><button type="button" class="household-concerts-icon-btn" data-concert-action="close-modal">✕</button></div>'
      + '<form id="householdConcertsBandForm" class="household-concerts-form">'
      + '<input type="hidden" name="sourceLabel" value="' + escapeHtml(data.sourceLabel || '') + '">'
      + '<input type="hidden" name="enrichmentConfidence" value="' + escapeHtml(data.enrichmentConfidence || '') + '">'
      + '<input type="hidden" name="sourceKeys" value="' + escapeHtml(Array.isArray(data.sourceKeys) ? data.sourceKeys.join(',') : (data.sourceKeys || '')) + '">'
      + '<input type="hidden" name="Last_Release_Date" value="' + escapeHtml(data.lastReleaseDate || '') + '">'
      + '<input type="hidden" name="Member_Timeline" value="' + escapeHtml(data.memberTimeline || '') + '">'
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
      + formRow('Band Ranking Tier', '<select name="Band_Tier">' + BAND_TIER_OPTIONS.map(function (option) { return '<option value="' + escapeHtml(option.value) + '"' + (normalizeBandTier(data.bandTier) === option.value ? ' selected' : '') + '>' + escapeHtml(option.value) + '</option>'; }).join('') + '</select>')
      + '<div class="household-concerts-form-actions"><button type="button" class="pill-button" data-concert-action="close-modal">Cancel</button><button type="submit" class="pill-button pill-button-primary">Save Favorite Band</button></div>'
      + '</form>'
    );
    var bandForm = document.getElementById('householdConcertsBandForm');
    if (bandForm) {
      bandForm.dataset.userTouchedFields = '';
      applyBandFormFieldTooltips(bandForm);
      updateAutoFillButtonBadge(bandForm, 0);
    }
    var shouldAutoFillOnOpen = data.bandName && (
      normalizeConcertSettings(state.settings).autoFillOnOpen
      || /search|recommend/i.test(String(data.sourceLabel || ''))
    );
    if (shouldAutoFillOnOpen) {
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

     function buildAttendedBandOptionsHtml(selectedBandName, searchTerm) {
     var selected = normalizeText(selectedBandName);
     var filter = normalizeText(searchTerm);
     var options = state.favoriteBands.filter(function (item) {
       if (!filter) return true;
       return normalizeText(item.bandName).indexOf(filter) >= 0;
     }).map(function (item) {
       var isSelected = normalizeText(item.bandName) === selected ? ' selected' : '';
       return '<option value="' + escapeHtml(item.bandName) + '"' + isSelected + '>' + escapeHtml(item.bandName) + '</option>';
     });
     return '<option value="">Choose a favorite band</option>' + options.join('');
   }

   function updateAttendedBandSelectOptions(searchTerm) {
     var select = document.querySelector('#householdConcertsAttendedForm select[name="Band_Name"]');
     if (!select) return;
     var currentValue = String(select.value || '').trim();
     select.innerHTML = buildAttendedBandOptionsHtml(currentValue, searchTerm || '');
     if (currentValue && !Array.from(select.options).some(function (opt) { return String(opt.value || '').trim() === currentValue; })) {
       select.value = '';
     }
   }

   function formatHistoricFinderSourceLabel(sourceKey) {
     return sourceLabelFromKey(sourceKey);
   }

   function renderHistoricFinderStatusHtml() {
     var status = state.historicFinderStatus && typeof state.historicFinderStatus === 'object'
       ? state.historicFinderStatus
       : { tone: 'info', message: '' };
     var sourcesUsed = Array.isArray(state.historicFinderSourcesUsed) ? state.historicFinderSourcesUsed.filter(Boolean) : [];
     var friendlySources = sourcesUsed.map(formatHistoricFinderSourceLabel).filter(Boolean);
     return '<div id="householdConcertsHistoricFinderStatus" class="household-concerts-upload-status household-concerts-upload-status--' + escapeHtml(status.tone || 'info') + '">' + escapeHtml(status.message || 'Search for historical performances by band, timeframe, and distance.') + (friendlySources.length ? ('<br><small>Sources used: ' + escapeHtml(friendlySources.join(', ')) + '</small>') : '') + '</div>';
   }

   function renderHistoricFinderResultsHtml() {
     if (state.historicFinderBusy) {
       return '<p class="household-concerts-muted">Searching historical concerts…</p>';
     }
     if (!state.historicFinderResults.length) {
       return '<p class="household-concerts-muted">No historical results yet. Choose a band, years, and radius, then click Search.</p>';
     }
     return '<div class="household-concerts-historic-results-grid">' + state.historicFinderResults.map(function (item, index) {
       var band = String(item.bandName || '').trim();
       var matchedBand = getBandByKey(band);
       var canQuickLog = !!matchedBand;
        var sources = Array.isArray(item.sources) && item.sources.length
          ? item.sources
          : (item.source ? [item.source] : ['setlist.fm']);
        var sourceBadges = '<span class="household-concerts-source-icons-row">' + sources.map(function (source) {
          return '<span class="household-concerts-source-icon">' + escapeHtml(formatHistoricFinderSourceLabel(source)) + '</span>';
        }).join('') + '</span>';
        var sourceUrls = Array.isArray(item.sourceUrls) && item.sourceUrls.length
          ? item.sourceUrls
          : (item.sourceUrl ? [item.sourceUrl] : []);
       return '<article class="household-concerts-entry-card">'
         + '<div class="household-concerts-entry-head"><div><h4>' + escapeHtml(band || 'Unknown band') + '</h4><p>' + escapeHtml(formatDate(item.concertDate) || item.dateLabel || 'Date unknown') + ' • ' + escapeHtml(item.venue || 'Venue unknown') + '</p></div><div class="household-concerts-upcoming-distance">' + escapeHtml(Number.isFinite(item.distanceMiles) ? (item.distanceMiles.toFixed(item.distanceMiles < 10 ? 1 : 0) + ' mi') : 'Distance N/A') + '</div></div>'
         + '<p class="household-concerts-muted">' + escapeHtml([item.city, item.state, item.country].filter(Boolean).join(', ') || 'Location unknown') + '</p>'
         + sourceBadges
         + '<div class="household-concerts-link-row">'
         + sourceUrls.map(function (sourceUrl, sourceIdx) {
           var label = sourceUrls.length > 1 ? ('Open Source ' + (sourceIdx + 1)) : 'Open Source';
           return '<a class="household-concerts-link-pill" href="' + escapeHtml(safeUrl(sourceUrl)) + '" target="_blank" rel="noopener noreferrer">' + label + '</a>';
         }).join('')
         + (canQuickLog
           ? '<button type="button" class="pill-button" data-concert-action="add-historic-result-to-attended" data-result-index="' + index + '">Log This Concert</button>'
           : '<button type="button" class="pill-button" data-concert-action="open-add-band-prefill" data-band-name="' + escapeHtml(band) + '">Add Band First</button>')
         + '</div>'
         + (canQuickLog ? '' : '<p class="household-concerts-muted">Add this band to Favorite Bands first, then log this concert.</p>')
         + '</article>';
     }).join('') + '</div>';
   }

   function updateHistoricFinderModalUi() {
     var statusEl = document.getElementById('householdConcertsHistoricFinderStatusHost');
     if (statusEl) statusEl.innerHTML = renderHistoricFinderStatusHtml();
     var resultsEl = document.getElementById('householdConcertsHistoricFinderResults');
     if (resultsEl) resultsEl.innerHTML = renderHistoricFinderResultsHtml();
   }

   async function searchHistoricConcerts(form) {
     if (!form || state.historicFinderBusy) return;
     var query = normalizeHistoricFinderQuery({
       bandName: (form.querySelector('[name="BandName"]') || {}).value || '',
       fromYear: (form.querySelector('[name="FromYear"]') || {}).value || HISTORIC_DEFAULT_FROM_YEAR,
       toYear: (form.querySelector('[name="ToYear"]') || {}).value || new Date().getFullYear(),
       radiusMiles: (form.querySelector('[name="RadiusMiles"]') || {}).value || 50,
       locationId: (form.querySelector('[name="SearchLocation"]') || {}).value || 'hendersonville'
     });
     if (!query.bandName) {
       state.historicFinderStatus = { tone: 'warning', message: 'Enter a band name before searching historical concerts.' };
       updateHistoricFinderModalUi();
       return;
     }
     state.historicFinderBusy = true;
     state.historicFinderSourcesUsed = [];
     state.historicFinderStatus = { tone: 'info', message: 'Searching setlist.fm + Bandsintown historical concerts…' };
     updateHistoricFinderModalUi();
     try {
       var location = getHistoricSearchLocationById(query.locationId);
       var params = new URLSearchParams({
         band: query.bandName,
         fromYear: String(query.fromYear),
         toYear: String(query.toYear),
         radiusMiles: String(query.radiusMiles),
         latitude: String(location.latitude),
         longitude: String(location.longitude),
         locationLabel: location.label
       });
       var payload = await fetchJsonPublic('/api/public/historic-shows?' + params.toString());
       if (!payload || payload.ok !== true) {
         throw new Error(String((payload && payload.message) || 'Historic concert search failed.'));
       }
       state.historicFinderSourcesUsed = Array.isArray(payload.sourcesSucceeded)
         ? payload.sourcesSucceeded.map(function (value) { return String(value || '').trim(); }).filter(Boolean)
         : [];
       var results = Array.isArray(payload.data) ? payload.data : [];
       state.historicFinderResults = results.map(function (item) {
         return {
           bandName: String(item.bandName || query.bandName).trim(),
           concertDate: toIsoDate(item.concertDate || item.date || ''),
           dateLabel: String(item.dateLabel || item.concertDate || '').trim(),
           venue: String(item.venue || '').trim(),
           city: String(item.city || '').trim(),
           state: String(item.state || '').trim(),
           country: String(item.country || '').trim(),
           distanceMiles: Number.isFinite(Number(item.distanceMiles)) ? Number(item.distanceMiles) : null,
           source: String(item.source || 'setlist.fm').trim(),
            sourceUrl: String(item.sourceUrl || '').trim(),
            sources: Array.isArray(item.sources) ? item.sources.map(function (value) { return String(value || '').trim(); }).filter(Boolean) : [],
            sourceUrls: Array.isArray(item.sourceUrls) ? item.sourceUrls.map(function (value) { return String(value || '').trim(); }).filter(Boolean) : []
         };
       });
       state.historicFinderStatus = {
         tone: results.length ? 'success' : 'info',
         message: results.length
           ? ('Found ' + results.length + ' historical concert' + (results.length === 1 ? '' : 's') + ' within ' + query.radiusMiles + ' miles of ' + location.label + '.')
           : ('No historical concerts found for this filter. Try a wider year range or larger radius.')
       };
     } catch (error) {
       state.historicFinderResults = [];
       state.historicFinderSourcesUsed = [];
       state.historicFinderStatus = { tone: 'warning', message: error && error.message ? error.message : 'Could not load historical concerts right now.' };
     } finally {
       state.historicFinderBusy = false;
       updateHistoricFinderModalUi();
     }
   }

   function openHistoricFinderModal(seedBandName) {
     var defaults = normalizeHistoricFinderQuery(getDefaultHistoricFinderQuery(seedBandName || (resolveActiveBand() || {}).bandName || ''));
     var favorites = state.favoriteBands.map(function (band) { return '<option value="' + escapeHtml(band.bandName) + '"></option>'; }).join('');
     state.historicFinderResults = [];
     state.historicFinderSourcesUsed = [];
     state.historicFinderStatus = { tone: 'info', message: 'Search setlist.fm + Bandsintown by year range and radius. Default date range is 2006 to present.' };
     openModal(
       '<div class="household-concerts-modal-head"><div><h3>Historic Performance Finder</h3><p>Search past concerts near your preferred home base, then prefill your attended log.</p></div><button type="button" class="household-concerts-icon-btn" data-concert-action="close-modal">✕</button></div>'
       + '<form id="householdConcertsHistoricFinderForm" class="household-concerts-form">'
       + '<datalist id="householdConcertsFavoriteBandOptions">' + favorites + '</datalist>'
       + formRow('Band Name', '<input name="BandName" list="householdConcertsFavoriteBandOptions" value="' + escapeHtml(defaults.bandName) + '" placeholder="e.g. Depeche Mode" required>')
       + '<div class="household-concerts-form-row"><label>Date Range</label><div class="household-concerts-search-row"><input type="number" name="FromYear" min="1960" max="' + new Date().getFullYear() + '" value="' + defaults.fromYear + '" placeholder="From year"><input type="number" name="ToYear" min="1960" max="' + new Date().getFullYear() + '" value="' + defaults.toYear + '" placeholder="To year"></div></div>'
       + formRow('Search Radius', '<select name="RadiusMiles">' + HISTORIC_RADIUS_OPTIONS.map(function (value) { return '<option value="' + value + '"' + (value === defaults.radiusMiles ? ' selected' : '') + '>' + value + ' miles</option>'; }).join('') + '</select>')
       + formRow('Distance From', '<select name="SearchLocation">' + HISTORIC_SEARCH_LOCATIONS.map(function (item) { return '<option value="' + escapeHtml(item.id) + '"' + (item.id === defaults.locationId ? ' selected' : '') + '>' + escapeHtml(item.label) + '</option>'; }).join('') + '</select>')
       + '<div id="householdConcertsHistoricFinderStatusHost">' + renderHistoricFinderStatusHtml() + '</div>'
       + '<div class="household-concerts-form-actions"><button type="button" class="pill-button" data-concert-action="close-modal">Close</button><button type="submit" class="pill-button pill-button-primary">Search Historic Concerts</button></div>'
       + '</form>'
       + '<div id="householdConcertsHistoricFinderResults" class="household-concerts-panel">' + renderHistoricFinderResultsHtml() + '</div>'
     );
   }

   // Text Parser Modal Functions
   function openTextParserModal(formType) {
     var title = formType === 'attended' ? 'Log Concert from Text' : 'Add Upcoming Concert from Text';
     var instructions = formType === 'attended'
       ? 'Paste concert details (band name, date, venue, rating, etc.) and we\'ll extract and populate the form for you.'
       : 'Paste concert details (band name, date, venue, city, state) and we\'ll extract and populate the form for you.';
     
     openModal(
       '<div class="household-concerts-modal-head"><div><h3>' + title + '</h3><p>' + instructions + '</p></div><button type="button" class="household-concerts-icon-btn" data-concert-action="close-modal">✕</button></div>'
       + '<form id="householdConcertsTextParserForm" class="household-concerts-form">'
       + formRow('Paste Concert Details', '<textarea id="householdConcertsTextParserInput" rows="8" placeholder="Example:\nBand: Nine Inch Nails\nDate: August 13, 2024\nVenue: The Orange Peel\nCity: Asheville\nState: NC\nRating: 5 stars\n\nOr copy-paste from an email, ticket confirmation, setlist.fm, etc." style="font-family:monospace;"></textarea>')
       + formRow('Parsing Status', '<div id="householdConcertsParsingStatus" style="min-height:20px;"></div>')
       + '<div class="household-concerts-form-actions">'
       + '<button type="button" class="pill-button" data-concert-action="close-modal">Cancel</button>'
       + '<button type="button" class="pill-button pill-button-primary" data-concert-action="parse-concert-text" data-parser-form-type="' + formType + '">Parse & Apply</button>'
       + '</div>'
       + '</form>'
     );
   }

   function handleConcertTextParsing(formType) {
     if (!window.ConcertTextParser) {
       setStatus('Text parser module not loaded. Please refresh the page.', 'error');
       return;
     }

     var textarea = document.getElementById('householdConcertsTextParserInput');
     if (!textarea) return;

     var text = textarea.value.trim();
     if (!text) {
       showParsingStatus('Please paste some concert details first.', 'warning');
       return;
     }

     // Get favorite band names for validation
     var favoriteBandNames = state.favoriteBands.map(function(band) {
       return band.bandName;
     });

     // Parse the text
     var result = window.ConcertTextParser.parseConcertText(text, favoriteBandNames);

     if (!result.success) {
       showParsingStatus('Could not extract any concert details. Please check the format and try again.', 'error');
       return;
     }

     // Show parsing results
     var statusHtml = '<div style="padding:10px;background:#e8f5e9;border-radius:4px;border-left:4px solid #4CAF50;">'
       + '<strong>✓ Extracted Details:</strong><br>'
       + (result.data.bandName ? '🎵 Band: ' + escapeHtml(result.data.bandName) + ' <span style="font-size:11px;">' + window.ConcertTextParser.getConfidenceBadge(result.data.confidence.bandName) + '</span><br>' : '')
       + (result.data.date ? '📅 Date: ' + escapeHtml(result.data.date) + ' <span style="font-size:11px;">' + window.ConcertTextParser.getConfidenceBadge(result.data.confidence.date) + '</span><br>' : '')
       + (result.data.venue ? '🎪 Venue: ' + escapeHtml(result.data.venue) + ' <span style="font-size:11px;">' + window.ConcertTextParser.getConfidenceBadge(result.data.confidence.venue) + '</span><br>' : '')
       + (result.data.city ? '🏙️ City: ' + escapeHtml(result.data.city) + (result.data.state ? ', ' + escapeHtml(result.data.state) : '') + ' <span style="font-size:11px;">' + window.ConcertTextParser.getConfidenceBadge(result.data.confidence.location) + '</span><br>' : '')
       + (result.data.rating ? '⭐ Rating: ' + result.data.rating + '/5 stars<br>' : '')
       + '<p style="margin:8px 0 0 0;font-size:12px;"><strong>Applying to form… Click "Parse & Apply" again to confirm or adjust values.</strong></p>'
       + '</div>';

     showParsingStatus(statusHtml, 'success');

     var matchedBand = getBandByKey(result.data.bandName);
     var attendedPrefill = {
       bandName: result.data.bandName || '',
       concertDate: result.data.date || '',
       venue: result.data.venue || '',
       rating: Number(result.data.rating) || 0,
       attendedBy: result.data.attendedBy || 'Both',
       videoUrl: result.data.videoUrl || '',
       setlistUrl: result.data.setlistUrl || '',
       notes: result.data.notes || ''
     };
     var upcomingPrefill = {
       bandName: result.data.bandName || '',
       concertDate: result.data.date || '',
       venue: result.data.venue || '',
       city: result.data.city || '',
       state: result.data.state || ''
     };

     setTimeout(function() {
       closeModal();
       if (formType === 'attended') {
         openAttendedConcertForm(matchedBand, attendedPrefill);
       } else {
         openUpcomingConcertForm(matchedBand, upcomingPrefill);
       }
       setStatus('Concert details parsed and applied. Review and save when ready.', 'success');
     }, 400);
   }

   function showParsingStatus(message, tone) {
     var statusDiv = document.getElementById('householdConcertsParsingStatus');
     if (statusDiv) {
       statusDiv.innerHTML = message;
       if (tone === 'error') {
         statusDiv.style.color = '#d32f2f';
       } else if (tone === 'warning') {
         statusDiv.style.color = '#f57c00';
       } else {
         statusDiv.style.color = '#388e3c';
       }
     }
   }

   function openAttendedConcertForm(band, prefill) {
     state.attendedUploadFiles = [];
      var safePrefill = prefill && typeof prefill === 'object' ? prefill : {};
      var seededPhotoUrls = mergePhotoUrlLists(
        Array.isArray(safePrefill.photoUrls) ? safePrefill.photoUrls : [],
        safePrefill.photoUrl ? [safePrefill.photoUrl] : []
      );
      state.attendedUploadedPhotoUrls = seededPhotoUrls;
      state.attendedLastUploadedPhotoUrls = [];
     state.attendedUploadBusy = false;
     state.attendedUploadStatus = {
       tone: 'info',
       message: 'Optional: upload a concert photo directly to OneDrive, or paste a URL manually.'
     };
     var bandName = String(safePrefill.bandName || (band && band.bandName) || '').trim();
     var concertDate = toIsoDate(safePrefill.concertDate || '');
     var venue = String(safePrefill.venue || '').trim();
      var rating = Math.max(0, Math.min(5, Number(safePrefill.rating) || 0));
      var videoUrl = String(safePrefill.videoUrl || '').trim();
     var setlistUrl = String(safePrefill.setlistUrl || '').trim();
     var notes = String(safePrefill.notes || '').trim();
      var editConcertId = String(safePrefill.attendedConcertId || safePrefill.id || '').trim();
      var editRowIndex = Number.isInteger(Number(safePrefill.attendedRowIndex)) ? Number(safePrefill.attendedRowIndex) : -1;
      var isEditing = !!editConcertId || editRowIndex >= 0;
      var photoTextareaValue = seededPhotoUrls.join('\n');
     var attendedBy = normalizeAttendedBy(safePrefill.attendedBy || 'Both');
     var bandOptions = buildAttendedBandOptionsHtml(bandName, '');
      var venueListId = 'householdConcertsVenueOptionsAttended';
     openModal(
       '<div class="household-concerts-modal-head"><div><h3>' + (isEditing ? 'Update Concert Log' : 'Log Attended Concert') + '</h3><p>Track the band, date, venue, star rating, photos, notes, and setlist links for a show you have seen.</p></div><button type="button" class="household-concerts-icon-btn" data-concert-action="close-modal">✕</button></div>'
       + '<form id="householdConcertsAttendedForm" class="household-concerts-form">'
       + '<input type="hidden" name="Attended_Concert_Id" value="' + escapeHtml(editConcertId) + '">'
       + '<input type="hidden" name="Attended_Row_Index" value="' + escapeHtml(editRowIndex >= 0 ? String(editRowIndex) : '') + '">'
       + formRow('Find Favorite Band', '<input id="householdConcertsAttendedBandSearch" type="search" placeholder="Type to filter favorite bands…" aria-label="Filter favorite bands for attended concert">')
       + formRow('Band', '<select name="Band_Name" required>' + bandOptions + '</select>')
       + formRow('Concert Date', '<input type="date" name="Concert_Date" required value="' + escapeHtml(concertDate) + '">')
        + formRow('Venue', '<input name="Venue" list="' + venueListId + '" required placeholder="Venue name" value="' + escapeHtml(venue) + '"><small class="household-concerts-muted">Choose from saved venues or type a new one.</small>')
        + renderVenueDatalistHtml(venueListId)
       + formRow('Attended By', '<select name="Attended_By">' + CONCERT_ATTENDEE_OPTIONS.map(function (option) { return '<option value="' + option + '"' + (option === attendedBy ? ' selected' : '') + '>' + option + '</option>'; }).join('') + '</select>')
        + '<div class="household-concerts-form-row"><label>Rating</label><div class="household-concerts-star-row">' + renderRatingStars(rating) + '</div><input type="hidden" name="Rating" value="' + rating + '"></div>'
       + '<div class="household-concerts-form-row household-concerts-upload-row"><label>Upload Photos to OneDrive</label><div class="household-concerts-upload-inline"><input id="householdConcertsPhotoFileInput" type="file" accept="image/*" multiple><button type="button" class="pill-button" data-concert-action="upload-attended-photo">Upload Selected</button></div><div id="householdConcertsAttendedUploadStatus" class="household-concerts-upload-status household-concerts-upload-status--info">' + escapeHtml(state.attendedUploadStatus.message) + '</div></div>'
        + formRow('Photo URL(s)', '<textarea name="Photo_URL" rows="2" placeholder="Single URL, multiple URLs separated by new lines/commas, or JSON array.">' + escapeHtml(photoTextareaValue) + '</textarea>')
       + '<div class="household-concerts-form-row"><label>Manage Photos</label><div id="householdConcertsPhotoPreview" class="household-concerts-manage-photos-container">' + renderManagedPhotosPreview() + '</div></div>'
        + formRow('Video URL', '<input name="Video_URL" placeholder="https://…" value="' + escapeHtml(videoUrl) + '">')
       + formRow('Setlist URL', '<input name="Setlist_URL" placeholder="https://…" value="' + escapeHtml(setlistUrl) + '">')
       + formRow('Notes', '<textarea name="Notes" rows="4" placeholder="Favorite moments, opening acts, sound quality, crowd, etc.">' + escapeHtml(notes) + '</textarea>')
       + '<div class="household-concerts-form-actions"><button type="button" class="pill-button" data-concert-action="open-text-parser" data-parser-form-type="attended">Parse from Text</button><button type="button" class="pill-button" data-concert-action="close-modal">Cancel</button><button type="submit" class="pill-button pill-button-primary">' + (isEditing ? 'Update Concert Log' : 'Save Concert Log') + '</button></div>'
       + '</form>'
     );
   }

     function openUpcomingConcertForm(band, prefill) {
    var safePrefill = prefill && typeof prefill === 'object' ? prefill : {};
    var bandName = String(safePrefill.bandName || (band && band.bandName) || '').trim();
    var concertDate = toIsoDate(safePrefill.concertDate || '');
    var venue = String(safePrefill.venue || '').trim();
    var city = String(safePrefill.city || '').trim();
    var stateName = String(safePrefill.state || '').trim();
    var hasTickets = /^(yes|true|1)$/i.test(String(safePrefill.ticketsPurchased || ''));
    var bandOptions = state.favoriteBands.map(function (item) {
      var selected = normalizeText(item.bandName) === normalizeText(bandName) ? ' selected' : '';
      return '<option value="' + escapeHtml(item.bandName) + '"' + selected + '>' + escapeHtml(item.bandName) + '</option>';
    }).join('');
    var venueListId = 'householdConcertsVenueOptionsUpcoming';
    openModal(
      '<div class="household-concerts-modal-head"><div><h3>Add Upcoming Concert</h3><p>Store future shows, then use your location and distance slider to keep nearby opportunities front and center.</p></div><button type="button" class="household-concerts-icon-btn" data-concert-action="close-modal">✕</button></div>'
      + '<form id="householdConcertsUpcomingForm" class="household-concerts-form">'
      + formRow('Band', '<select name="Band_Name" required><option value="">Choose a favorite band</option>' + bandOptions + '</select>')
      + formRow('Concert Date', '<input type="date" name="Concert_Date" required value="' + escapeHtml(concertDate) + '">')
      + formRow('Venue', '<input name="Venue" list="' + venueListId + '" required placeholder="Venue name" value="' + escapeHtml(venue) + '"><small class="household-concerts-muted">Choose from saved venues or type a new one.</small>')
      + renderVenueDatalistHtml(venueListId)
      + formRow('City', '<input name="City" required placeholder="City" value="' + escapeHtml(city) + '">')
      + formRow('State', '<input name="State" required placeholder="State / Region" value="' + escapeHtml(stateName) + '">')
      + formRow('Tickets Purchased', '<label><input type="checkbox" name="Tickets_Purchased" value="Yes"' + (hasTickets ? ' checked' : '') + '> We already purchased tickets</label>')
      + '<div class="household-concerts-form-actions"><button type="button" class="pill-button" data-concert-action="open-text-parser" data-parser-form-type="upcoming">Parse from Text</button><button type="button" class="pill-button" data-concert-action="close-modal">Cancel</button><button type="submit" class="pill-button pill-button-primary">Save Upcoming Concert</button></div>'
      + '</form>'
    );
  }

  function openConcertSettingsModal() {
    var settings = normalizeConcertSettings(state.settings);
    var writeAuditEnabled = isBackendWriteAuditEnabled();
    var notInterestedList = Object.keys(state.notInterestedRecommendations || {}).map(function (key) {
      return state.notInterestedRecommendations[key];
    }).filter(function (entry) {
      return entry && entry.bandName;
    }).sort(function (a, b) {
      return String(a.bandName || '').localeCompare(String(b.bandName || ''));
    });
    var tierRows = state.favoriteBands.slice().sort(function (a, b) {
      return String(a.bandName || '').localeCompare(String(b.bandName || ''));
    }).map(function (band) {
      var key = normalizeKey(band.bandName);
      var tier = normalizeBandTier(getBandTierOverride(key) || band.bandTier);
      return '<div class="household-concerts-settings-tier-row"><label>' + escapeHtml(band.bandName) + '</label><select data-band-tier-select="1" data-band-tier-key="' + escapeHtml(key) + '">' + BAND_TIER_OPTIONS.map(function (option) {
        return '<option value="' + escapeHtml(option.value) + '"' + (option.value === tier ? ' selected' : '') + '>' + escapeHtml(option.value) + '</option>';
      }).join('') + '</select></div>';
    }).join('');
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
      + '<button type="button" class="pill-button" data-concert-action="open-workbook-path-diagnostics">Workbook Path Diagnostics</button>'
      + '</div></div>'
      + '<div class="household-concerts-form-row"><label>Enrichment Sources</label>'
      + '<div class="household-concerts-settings-stack">'
      + '<label><input type="checkbox" name="source_apple" value="1"' + (settings.enrichmentSources.apple ? ' checked' : '') + '> Apple Music metadata</label>'
      + '<label><input type="checkbox" name="source_musicbrainz" value="1"' + (settings.enrichmentSources.musicbrainz ? ' checked' : '') + '> MusicBrainz metadata</label>'
      + '<label><input type="checkbox" name="source_wikipedia" value="1"' + (settings.enrichmentSources.wikipedia ? ' checked' : '') + '> Wikipedia link</label>'
      + '<label><input type="checkbox" name="source_bandsintown" value="1"' + (settings.enrichmentSources.bandsintown ? ' checked' : '') + '> Bandsintown artist mapping</label>'
      + '<label><input type="checkbox" name="source_members" value="1"' + (settings.enrichmentSources.members ? ' checked' : '') + '> Band members + roles</label>'
      + '</div></div>'
      + '<div class="household-concerts-form-row"><label>Manage Not Interested</label>'
      + '<div class="household-concerts-settings-stack">'
      + (notInterestedList.length
        ? notInterestedList.map(function (entry) {
          return '<div class="household-concerts-settings-inline-row"><span>' + escapeHtml(entry.bandName) + '</span><button type="button" class="pill-button" data-concert-action="remove-not-interested-band" data-band-name="' + escapeHtml(entry.bandName) + '">Unhide</button></div>';
        }).join('')
        : '<p class="household-concerts-muted">No hidden recommendations.</p>')
      + '</div></div>'
      + '<div class="household-concerts-form-row"><label>Manage Band Rankings</label>'
      + '<div class="household-concerts-settings-stack">'
      + (tierRows || '<p class="household-concerts-muted">Add favorite bands to manage tiers.</p>')
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
    Array.from(form.querySelectorAll('[data-band-tier-select="1"]')).forEach(function (select) {
      var bandKey = String(select.getAttribute('data-band-tier-key') || '').trim();
      var tierValue = String(select.value || '').trim();
      if (bandKey) setBandTierOverride(bandKey, tierValue);
    });
    state.favoriteBands = state.favoriteBands.map(function (band) {
      return Object.assign({}, band, {
        bandTier: normalizeBandTier(getBandTierOverride(band.id || band.bandName) || band.bandTier)
      });
    });
    setBackendWriteAuditEnabled(!!form.querySelector('[name="backendWriteAudit"]:checked'));
    if (next.homeBaseMode === 'hendersonville') {
      resetConcertsLocationToDefault();
    } else {
      setConcertsLocationMode('follow-user');
      setStatus('Concert settings saved. Capturing your current location…', 'info');
      captureUserLocation();
    }
    renderAll();
    closeModal();
  }

   function openBandDetails(band) {
     if (!band) return;
     // Ensure we apply the latest profile overrides
     var bandWithOverrides = applyBandProfileOverride(band);
     var stats = computeBandStats(bandWithOverrides.id);
     var similar = computeSimilarBands(bandWithOverrides);
     var recommendations = getVisibleDiscoveryRecommendationsForBand(bandWithOverrides.id || normalizeKey(bandWithOverrides.bandName));
     var enrichmentBadge = renderBandEnrichmentBadge(bandWithOverrides);
     var prevBand = resolveAdjacentBand(bandWithOverrides, 'prev');
     var nextBand = resolveAdjacentBand(bandWithOverrides, 'next');
     var detailCrop = getBandImageCrop(bandWithOverrides.id);
     var detailCoverObjPos = detailCrop.coverPositionX + '% ' + detailCrop.coverPositionY + '%';
     var detailLogoObjPos = detailCrop.logoPositionX + '% ' + detailCrop.logoPositionY + '%';
     openModal(
       '<div class="household-concerts-modal-head"><div><h3>' + escapeHtml(bandWithOverrides.bandName) + '</h3><p>' + escapeHtml(bandWithOverrides.origin || 'Origin not set') + ' • ' + escapeHtml(bandWithOverrides.founded || 'Founded date not set') + '</p></div><div class="household-concerts-form-actions">'
       + '<button type="button" class="pill-button" data-concert-action="open-band-details-prev" data-band-key="' + escapeHtml(bandWithOverrides.id) + '"' + (prevBand ? '' : ' disabled') + '>Previous Band</button>'
       + '<button type="button" class="pill-button" data-concert-action="open-band-details-next" data-band-key="' + escapeHtml(bandWithOverrides.id) + '"' + (nextBand ? '' : ' disabled') + '>Next Band</button>'
       + '<button type="button" class="household-concerts-icon-btn" data-concert-action="close-modal">✕</button></div></div>'
       + '<div class="household-concerts-band-profile">'
       + (bandWithOverrides.bandCoverPhotoUrl ? '<img class="household-concerts-band-profile-cover" src="' + escapeHtml(safeUrl(bandWithOverrides.bandCoverPhotoUrl)) + '" alt="' + escapeHtml(bandWithOverrides.bandName) + ' cover image" style="object-position:' + detailCoverObjPos + '">' : '')
       + '<div class="household-concerts-band-profile-head">'
       + (bandWithOverrides.bandLogoUrl ? '<img class="household-concerts-band-profile-logo" src="' + escapeHtml(safeUrl(bandWithOverrides.bandLogoUrl)) + '" alt="' + escapeHtml(bandWithOverrides.bandName) + ' logo" style="object-position:' + detailLogoObjPos + '">' : '<div class="household-concerts-band-profile-logo household-concerts-band-logo--placeholder">🎵</div>')
       + '<div>'
       + '<div class="household-concerts-band-stats">' + statPill('Seen', String(stats.attendedCount)) + statPill('Upcoming', String(stats.upcomingCount)) + statPill('Average', stats.averageRating ? stats.averageRating.toFixed(1) + '★' : '—') + '</div>'
       + (bandWithOverrides.genres.length ? '<div class="household-concerts-tag-row">' + bandWithOverrides.genres.map(renderTag).join('') + '</div>' : '')
       + enrichmentBadge
       + '</div>'
       + '</div>'
       + '<div class="household-concerts-band-profile-grid">'
       + detailLine('Tier', normalizeBandTier(bandWithOverrides.bandTier))
       + detailLine('Last Release', bandWithOverrides.lastReleaseDate ? formatDate(bandWithOverrides.lastReleaseDate) : 'Unknown')
       + detailLine('Record Label', bandWithOverrides.recordLabel || 'Not set')
       + detailLine('Discography', bandWithOverrides.releases.length ? bandWithOverrides.releases.join(', ') : bandWithOverrides.discography || 'Add albums or eras')
       + detailLine('Top Songs', bandWithOverrides.songs.length ? bandWithOverrides.songs.join(', ') : bandWithOverrides.topSongs || 'Add notable tracks')
       + detailLine('Band Members', bandWithOverrides.members.length ? bandWithOverrides.members.join(' • ') : bandWithOverrides.bandMembers || 'Add members and roles')
       + '</div>'
       + '<div class="household-concerts-form-row"><label>Update Band Tier</label><div class="household-concerts-form-actions">'
       + '<select id="householdConcertsBandTierQuickSelect">' + BAND_TIER_OPTIONS.map(function (option) {
         return '<option value="' + escapeHtml(option.value) + '"' + (normalizeBandTier(bandWithOverrides.bandTier) === option.value ? ' selected' : '') + '>' + escapeHtml(option.value) + '</option>';
       }).join('') + '</select>'
       + '<button type="button" class="pill-button" data-concert-action="save-band-tier" data-band-key="' + escapeHtml(bandWithOverrides.id) + '">Save Tier</button>'
       + '<button type="button" class="pill-button" data-concert-action="toggle-priority-band" data-band-key="' + escapeHtml(bandWithOverrides.id) + '">' + (isPriorityBand(bandWithOverrides) ? '⭐ Prioritized for Live Shows' : '☆ Prioritize Live') + '</button>'
       + '</div></div>'
       + '<div class="household-concerts-band-profile-timeline"><h4>Lineup Timeline</h4>' + renderBandTimelineVisual(bandWithOverrides) + '</div>'
       + renderBandLinks(bandWithOverrides, false)
       + '<div class="household-concerts-band-profile-columns">'
       + '<div><h4>Similar favorite bands</h4>' + (similar.length ? '<div class="household-concerts-similar-list">' + similar.map(function (entry) {
         var candidate = entry.band;
         return '<button type="button" class="household-concerts-similar-item" data-concert-action="open-band-details" data-band-key="' + escapeHtml(candidate.id) + '" data-band-name="' + escapeHtml(candidate.bandName) + '">'
           + (candidate.bandLogoUrl ? '<img class="household-concerts-similar-logo" src="' + escapeHtml(safeUrl(candidate.bandLogoUrl)) + '" alt="' + escapeHtml(candidate.bandName) + ' logo">' : '<span class="household-concerts-similar-logo household-concerts-band-logo--placeholder">🎵</span>')
           + '<span><strong>' + escapeHtml(candidate.bandName) + '</strong><em>' + escapeHtml((candidate.genres || []).slice(0, 3).join(', ') || candidate.origin || 'Shared style') + '</em></span>'
           + '</button>';
       }).join('') + '</div>' : '<p class="household-concerts-muted">No close matches among current favorites yet.</p>') + '</div>'
       + '<div><h4>Recommended bands to add</h4>' + (recommendations.length
         ? '<div class="household-concerts-recommended-list">' + recommendations.map(function (entry) {
           return '<label class="household-concerts-recommended-item"><input type="checkbox" name="householdConcertsRecommendedBand" value="' + escapeHtml(entry.id) + '" data-band-key="' + escapeHtml(bandWithOverrides.id) + '"><div><strong>' + escapeHtml(entry.bandName) + '</strong><span>' + escapeHtml(entry.reason || entry.genreText || 'Related recommendation') + '</span></div><div class="household-concerts-form-actions"><button type="button" class="pill-button" data-concert-action="quick-add-recommended-band" data-discovery-id="' + escapeHtml(entry.id) + '" data-band-key="' + escapeHtml(bandWithOverrides.id) + '">Add</button><button type="button" class="pill-button" data-concert-action="mark-recommendation-not-interested" data-discovery-id="' + escapeHtml(entry.id) + '" data-band-key="' + escapeHtml(bandWithOverrides.id) + '">Not Interested</button></div></label>';
         }).join('') + '</div><div class="household-concerts-form-actions"><button type="button" class="pill-button" data-concert-action="add-selected-recommended" data-band-key="' + escapeHtml(bandWithOverrides.id) + '">Add Selected</button></div>'
         : '<p class="household-concerts-muted">Refresh discovery to pull additional artist suggestions.</p>')
       + '</div>'
       + '</div>'
       + '<div class="household-concerts-form-actions"><button type="button" class="pill-button" data-concert-action="open-log-concert" data-band-key="' + escapeHtml(bandWithOverrides.id) + '">Log Concert</button><button type="button" class="pill-button" data-concert-action="open-add-upcoming" data-band-key="' + escapeHtml(bandWithOverrides.id) + '">Add Upcoming</button><button type="button" class="pill-button" data-concert-action="open-band-image-picker" data-band-key="' + escapeHtml(bandWithOverrides.id) + '">Manage Photos</button>'
       + (bandWithOverrides.bandCoverPhotoUrl ? '<button type="button" class="pill-button" data-concert-action="open-image-position-cover" data-band-key="' + escapeHtml(bandWithOverrides.id) + '">📐 Cover Position</button>' : '')
       + (bandWithOverrides.bandLogoUrl ? '<button type="button" class="pill-button" data-concert-action="open-image-position-logo" data-band-key="' + escapeHtml(bandWithOverrides.id) + '">📐 Logo Position</button>' : '')
       + '<button type="button" class="pill-button household-concerts-refresh-profile-btn pill-button-refresh-profile" data-concert-action="refresh-band-profile" data-band-key="' + escapeHtml(bandWithOverrides.id) + '">↻ Refresh Profile</button><button type="button" class="pill-button" data-concert-action="refresh-discovery" data-band-key="' + escapeHtml(bandWithOverrides.id) + '">Refresh Discovery</button></div>'
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
    return {
      bandName: String(readFavoriteBandValue(record, 'bandName') || '').trim(),
      bandMembers: String(readFavoriteBandValue(record, 'bandMembers') || '').trim(),
      bandLogoUrl: String(readFavoriteBandValue(record, 'bandLogoUrl') || '').trim(),
      bandCoverPhotoUrl: String(readFavoriteBandValue(record, 'bandCoverPhotoUrl') || '').trim(),
      origin: String(readFavoriteBandValue(record, 'origin') || '').trim(),
      founded: String(readFavoriteBandValue(record, 'founded') || '').trim(),
      recordLabel: String(readFavoriteBandValue(record, 'recordLabel') || '').trim(),
      discography: String(readFavoriteBandValue(record, 'discography') || '').trim(),
      topSongs: String(readFavoriteBandValue(record, 'topSongs') || '').trim(),
      associatedGenres: String(readFavoriteBandValue(record, 'associatedGenres') || '').trim(),
      websiteUrl: String(readFavoriteBandValue(record, 'websiteUrl') || '').trim(),
      tourPageUrl: String(readFavoriteBandValue(record, 'tourPageUrl') || '').trim(),
      facebookUrl: String(readFavoriteBandValue(record, 'facebookUrl') || '').trim(),
      instagramUrl: String(readFavoriteBandValue(record, 'instagramUrl') || '').trim(),
      youTubeUrl: String(readFavoriteBandValue(record, 'youTubeUrl') || '').trim(),
      setlistUrl: String(readFavoriteBandValue(record, 'setlistUrl') || '').trim(),
      bandsintownUrl: String(readFavoriteBandValue(record, 'bandsintownUrl') || '').trim(),
      wikipediaUrl: String(readFavoriteBandValue(record, 'wikipediaUrl') || '').trim()
    };
  }

  async function saveFavoriteBand(form) {
    var record = serializeForm(form);
    var touchedKeys = uniqueStrings(String(form && form.dataset && form.dataset.userTouchedFields || '').split(',').map(function (item) { return String(item || '').trim(); }).filter(Boolean));
    var bandName = String(record.Band_Name || '').trim();
    record.Band_Tier = normalizeBandTier(record.Band_Tier || '');
    record.Last_Release_Date = String(record.Last_Release_Date || '').trim();
    record.Member_Timeline = String(record.Member_Timeline || '').trim();
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
      setBandTierOverride(bandName, record.Band_Tier);
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
      var localRecord = Object.assign({ __rowIndex: getNextFavoriteBandRowIndex() }, record);
      state.favoriteBands.unshift(parseFavoriteBand(localRecord));
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
      Last_Release_Date: String(safePrefill.lastReleaseDate || '').trim(),
       Member_Timeline: String(safePrefill.memberTimeline || '').trim(),
       Band_Tier: normalizeBandTier(safePrefill.bandTier || ''),
       Cover_Position_X: Number.isFinite(Number(safePrefill.coverPositionX)) ? Number(safePrefill.coverPositionX) : '',
       Cover_Position_Y: Number.isFinite(Number(safePrefill.coverPositionY)) ? Number(safePrefill.coverPositionY) : '',
       Cover_Zoom: Number.isFinite(Number(safePrefill.coverZoom)) ? Number(safePrefill.coverZoom) : '',
       Logo_Position_X: Number.isFinite(Number(safePrefill.logoPositionX)) ? Number(safePrefill.logoPositionX) : '',
       Logo_Position_Y: Number.isFinite(Number(safePrefill.logoPositionY)) ? Number(safePrefill.logoPositionY) : '',
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
    record.Band_Tier = normalizeBandTier(record.Band_Tier || '');
    if (!bandName) return false;
    try {
      if (!record.Bandsintown_URL || isGenericBandsintownSearchUrl(record.Bandsintown_URL)) {
        record.Bandsintown_URL = await resolveBandsintownArtistUrl(bandName, record.Bandsintown_URL || '');
      }
      var workbookPath = await findWorkbookPath();
      await appendRecordToTable(workbookPath, FAVORITE_TABLE, record);
      setBandTierOverride(bandName, record.Band_Tier);
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
        var localRecord = Object.assign({ __rowIndex: getNextFavoriteBandRowIndex() }, record);
        state.favoriteBands.unshift(parseFavoriteBand(localRecord));
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
    if (!safeOptions.silent) setStatus('Refreshing band profile for ' + band.bandName + '…', 'info');
    try {
      var enriched = await enrichBandProfileData(mapBandToPrefillShape(band));
      if (safeOptions.importAlbumCover === true) {
        enriched = await maybeImportAlbumCoverToOneDrive(enriched, band);
      }
      if (safeOptions.noPreview) {
        // Direct apply (old behaviour, used from band cards Refresh Profile button)
        await persistFavoriteBandProfilePatch(band, enriched, { skipRender: true });
        saveBandProfileOverride(bandKey, enriched);
        saveBandProfileMeta(bandKey, {
          lastEnrichedFrom: String(enriched.sourceLabel || '').replace(/^Auto-filled from\s+/i, '').trim() || 'public metadata',
          lastEnrichedAt: Date.now(),
          enrichmentConfidence: String(enriched.enrichmentConfidence || '').trim(),
          sources: Array.isArray(enriched.sourceKeys) ? enriched.sourceKeys : inferSourceKeysFromLabel(enriched.sourceLabel || ''),
          fieldProvenance: normalizeFieldProvenanceMap(enriched.fieldProvenance || {}),
          fieldValues: enriched
        });
        if (!safeOptions.skipRender) renderAll();
        if (!safeOptions.silent) setStatus('Band profile refreshed for ' + band.bandName + '.', 'success');
      } else {
        // Show preview so user can pick what to keep
        openRefreshPreviewModal(band, enriched);
        if (!safeOptions.silent) setStatus('Review the ' + (enriched ? 'enrichment' : '') + ' changes for ' + band.bandName + ' before applying.', 'info');
      }
      return enriched;
    } catch (error) {
      console.error('❌ Could not refresh band profile:', error);
      if (!safeOptions.silent) setStatus(error && error.message ? error.message : 'Could not refresh band profile.', 'warning');
      return null;
    }
  }

  async function refreshAllBandProfiles() {
    if (state.bulkProfileRefreshBusy) return;
    var bands = getFilteredBands();
    if (!bands.length) {
      setStatus('No band cards are visible for bulk refresh right now.', 'warning');
      return;
    }
    state.bulkProfileRefreshBusy = true;
    state.bulkProfileRefreshProgress = { current: 0, total: bands.length, bandName: '' };
    renderFavoriteBands();
    var successCount = 0;
    var failedCount = 0;
    try {
      for (var idx = 0; idx < bands.length; idx += 1) {
        var band = bands[idx];
        state.bulkProfileRefreshProgress = { current: idx + 1, total: bands.length, bandName: band.bandName };
        renderFavoriteBands();
        setStatus('Refreshing profile ' + (idx + 1) + '/' + bands.length + ': ' + band.bandName + '…', 'info');
        var result = await refreshSavedBandProfile(band, {
          noPreview: true,
          silent: true,
          skipRender: true
        });
        if (result) successCount += 1;
        else failedCount += 1;
      }
      renderAll();
      setStatus('Bulk profile refresh complete: ' + successCount + ' updated' + (failedCount ? (', ' + failedCount + ' failed') : '') + '.', failedCount ? 'warning' : 'success');
    } finally {
      state.bulkProfileRefreshBusy = false;
      state.bulkProfileRefreshProgress = { current: 0, total: 0, bandName: '' };
      renderFavoriteBands();
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
    try {
      await persistFavoriteBandProfilePatch(pending.band, partial, { skipRender: true });
      saveBandProfileOverride(bandKey, patchedBand);
      saveBandProfileMeta(bandKey, {
        lastEnrichedFrom: String(pending.enriched.sourceLabel || '').replace(/^Auto-filled from\s+/i, '').trim() || 'public metadata',
        lastEnrichedAt: Date.now(),
        enrichmentConfidence: String(pending.enriched.enrichmentConfidence || '').trim(),
        sources: Array.isArray(pending.enriched.sourceKeys) ? pending.enriched.sourceKeys : inferSourceKeysFromLabel(pending.enriched.sourceLabel || ''),
        fieldProvenance: normalizeFieldProvenanceMap(pending.enriched.fieldProvenance || {}),
        fieldValues: patchedBand
      });
      state.pendingEnrichmentDiffs = null;
      closeModal();
      setStatus('Applied ' + selectedKeys.size + ' field update' + (selectedKeys.size !== 1 ? 's' : '') + ' to ' + pending.band.bandName + ' and synced to Excel.', 'success');
      renderAll();
    } catch (error) {
      console.error('❌ Could not apply refresh preview updates:', error);
      setStatus(error && error.message ? error.message : 'Could not sync selected profile updates to Excel.', 'error');
    }
  }

  async function saveAttendedConcert(form) {
    if (state.attendedUploadBusy) {
      setStatus('Please wait for the photo upload to finish before saving this concert.', 'warning');
      return;
    }
    var record = serializeForm(form);
    var editConcertId = String(record.Attended_Concert_Id || '').trim();
    // IMPORTANT: Number('') === 0 in JS, so we must guard against the empty-string
    // case explicitly.  An empty Attended_Row_Index means "new concert" (index = -1),
    // not "row 0".  Without this guard every new concert silently overwrites row 0.
    var rawRowIndex = String(record.Attended_Row_Index || '').trim();
    var editRowIndex = rawRowIndex !== '' && Number.isInteger(Number(rawRowIndex)) ? Number(rawRowIndex) : -1;
    var previousConcert = editConcertId ? getAttendedConcertById(editConcertId) : null;
    if (!previousConcert && editRowIndex >= 0) {
      previousConcert = state.attendedConcerts.find(function (item) {
        return Number(item && item.__rowIndex) === editRowIndex;
      }) || null;
    }
    var previousNoteKey = previousConcert ? concertNoteKey(previousConcert.bandName, previousConcert.concertDate, previousConcert.venue) : '';
    var previousHistoricMeta = readHistoricEditMetaByNoteKey(previousNoteKey);
    delete record.Attended_Concert_Id;
    delete record.Attended_Row_Index;
    record.Concert_Date = toIsoDate(record.Concert_Date);
    record.Attended_By = normalizeAttendedBy(record.Attended_By);
    record.Rating = String(Math.max(0, Math.min(5, Number(record.Rating) || 0)));
    record.Notes = String(record.Notes || '').trim();
    if (!record.Band_Name || !record.Concert_Date || !record.Venue) {
      setStatus('Band, concert date, and venue are required to log a concert.', 'warning');
      return;
    }
    var manualPhotoUrls = parsePhotoUrlsField(record.Photo_URL);
    var combinedPhotoUrls = mergePhotoUrlLists(manualPhotoUrls, state.attendedUploadedPhotoUrls, state.attendedLastUploadedPhotoUrls);
    if (!combinedPhotoUrls.length && state.attendedUploadFiles.length) {
      try {
        combinedPhotoUrls = mergePhotoUrlLists(combinedPhotoUrls, await uploadAttendedPhotoFromForm(form));
      } catch (_error) {
        setStatus('Could not upload concert photo. Fix the upload issue or remove the file and try saving again.', 'warning');
        return;
      }
    }
    record.Photo_URL = serializePhotoUrlsForStorage(combinedPhotoUrls);
    var nextNoteKey = concertNoteKey(record.Band_Name, record.Concert_Date, record.Venue);
    try {
      var workbookPath = await findWorkbookPath();
      var isEdit = editRowIndex >= 0;
      if (isEdit) {
        await updateRecordInTableByIndex(workbookPath, ATTENDED_TABLE, editRowIndex, record);
      } else {
        await appendRecordToTable(workbookPath, ATTENDED_TABLE, record);
      }
      if (record.Notes) {
        state.localNotes[concertNoteKey(record.Band_Name, record.Concert_Date, record.Venue)] = record.Notes;
        writeJsonStorage(NOTES_STORAGE_KEY, state.localNotes);
      }
      if (previousNoteKey && previousNoteKey !== concertNoteKey(record.Band_Name, record.Concert_Date, record.Venue)) {
        delete state.localNotes[previousNoteKey];
        writeJsonStorage(NOTES_STORAGE_KEY, state.localNotes);
      }
      if (previousNoteKey && previousNoteKey !== nextNoteKey) {
        removeHistoricEditMetaByNoteKey(previousNoteKey);
      }
      if (isEdit && (isHistoricImportedConcert(previousConcert) || previousHistoricMeta.editedAt)) {
        writeHistoricEditMetaByNoteKey(nextNoteKey, {
          editedAt: Date.now(),
          note: 'Updated via Edit Log'
        });
      }
      if (isEdit) {
        var updatedConcert = parseAttendedConcert(Object.assign({}, record, { __rowIndex: editRowIndex }));
        var existingIndex = state.attendedConcerts.findIndex(function (item) {
          return (editConcertId && String(item.id || '') === editConcertId)
            || Number(item.__rowIndex) === editRowIndex;
        });
        if (updatedConcert && existingIndex >= 0) {
          state.attendedConcerts[existingIndex] = updatedConcert;
        } else if (updatedConcert) {
          state.attendedConcerts.unshift(updatedConcert);
        }
      } else {
        var appendedConcert = parseAttendedConcert(Object.assign({}, record, { __rowIndex: state.attendedConcerts.length }));
        if (appendedConcert) state.attendedConcerts.unshift(appendedConcert);
      }
      closeModal();
      setStatus((editRowIndex >= 0 ? 'Concert log updated for ' : 'Concert log saved for ') + record.Band_Name + '.', 'success');
      renderAll();
    } catch (error) {
      console.error('❌ Could not save attended concert:', error);
      setStatus(error && error.message ? error.message : 'Could not save attended concert.', 'error');
    }
  }

  function getAttendedConcertById(concertId) {
    var targetId = String(concertId || '').trim();
    if (!targetId) return null;
    return state.attendedConcerts.find(function (item) {
      return String((item && item.id) || '').trim() === targetId;
    }) || null;
  }

  async function saveUpcomingConcert(form) {
    var record = serializeForm(form);
    record.Concert_Date = toIsoDate(record.Concert_Date);
    record.Day_of_Week = formatDayOfWeek(record.Concert_Date);
    record.Tickets_Purchased = form.querySelector('[name="Tickets_Purchased"]:checked') ? 'Yes' : 'No';
    if (!record.Band_Name || !record.Concert_Date || !record.Venue || !record.City || !record.State) {
      setStatus('Band, date, venue, city, and state are required for an upcoming concert.', 'warning');
      return;
    }
    try {
      var workbookPath = await findWorkbookPath();
      await appendRecordToTable(workbookPath, UPCOMING_TABLE, record);
      var parsedUpcoming = parseUpcomingConcert(record);
      if (parsedUpcoming) {
        parsedUpcoming.ticketsPurchased = /^(yes|true|1)$/i.test(String(record.Tickets_Purchased || ''));
        parsedUpcoming.__rowIndex = state.upcomingConcerts.length;
        setUpcomingTicketFlag(parsedUpcoming, parsedUpcoming.ticketsPurchased);
        state.upcomingConcerts.push(parsedUpcoming);
      }
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
         stats[venue] = { count: 0, totalRating: 0, bands: new Set(), distanceSum: 0, attendeeCounts: summarizeAttendeeCounts([]) };
       }
       stats[venue].count += 1;
       stats[venue].totalRating += Number(concert.rating) || 0;
       stats[venue].bands.add(concert.bandName);
       var normalizedAttendedBy = normalizeAttendedBy(concert.attendedBy);
       if (normalizedAttendedBy === 'Both') {
         stats[venue].attendeeCounts.kyleCount += 1;
         stats[venue].attendeeCounts.heatherCount += 1;
         stats[venue].attendeeCounts.bothCount += 1;
       } else if (normalizedAttendedBy === 'Kyle') {
         stats[venue].attendeeCounts.kyleCount += 1;
         stats[venue].attendeeCounts.kyleSoloCount += 1;
       } else {
         stats[venue].attendeeCounts.heatherCount += 1;
         stats[venue].attendeeCounts.heatherSoloCount += 1;
       }
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
         + '<div class="stat"><span>Concerts</span><strong>' + data.count + '</strong></div>'
         + '<div class="stat"><span>Avg Rating</span><strong>' + (data.averageRating ? data.averageRating.toFixed(1) + '★' : '—') + '</strong></div>'
         + '<div class="stat"><span>Bands</span><strong>' + data.bandCount + '</strong></div>'
         + '</div>'
          + '<p class="household-concerts-muted">Attendee Mix: ' + escapeHtml(formatAttendeeBreakdown(data.attendeeCounts)) + '</p>'
         + '</article>';
     }).join('');
   }


    function renderTicketedCalendar() {
      var el = document.getElementById('householdConcertsTicketedCalendar');
      if (!el) return;
      var ticketed = state.upcomingConcerts.filter(function (concert) { return !!concert.ticketsPurchased; }).slice().sort(function (a, b) {
        return String(a.concertDate || '').localeCompare(String(b.concertDate || ''));
      });
      if (!ticketed.length) {
        el.innerHTML = '<div class="household-concerts-panel-head"><div><h3>Ticketed Concert Calendar</h3></div></div><p class="household-concerts-muted">Mark upcoming shows as purchased to build this calendar.</p>';
        return;
      }
      var byMonth = {};
      ticketed.forEach(function (concert) {
        var month = String(concert.concertDate || '').slice(0, 7) || 'Unknown';
        if (!byMonth[month]) byMonth[month] = [];
        byMonth[month].push(concert);
      });
      var months = Object.keys(byMonth).sort();
        function formatMonthLabel(monthKey) {
          if (!/^\d{4}-\d{2}$/.test(String(monthKey || ''))) return String(monthKey || 'Unknown');
          var dt = new Date(monthKey + '-01T00:00:00');
          if (Number.isNaN(dt.getTime())) return monthKey;
          return dt.toLocaleString(undefined, { month: 'long', year: 'numeric' });
        }
      el.innerHTML = '<div class="household-concerts-panel-head"><div><h3>Ticketed Concert Calendar</h3><p>Shows where tickets are already purchased.</p></div></div>'
        + months.map(function (month) {
            return '<section class="household-concerts-tier-section"><div class="household-concerts-panel-head"><div><h4>' + escapeHtml(formatMonthLabel(month)) + '</h4><p>' + byMonth[month].length + ' concert' + (byMonth[month].length === 1 ? '' : 's') + '</p></div></div>'
            + byMonth[month].map(function (concert) {
              return '<article class="household-concerts-entry-card"><h4>' + escapeHtml(concert.bandName) + '</h4><p>' + escapeHtml(formatDate(concert.concertDate)) + ' • ' + escapeHtml(concert.venue || 'Venue TBD') + '</p><p class="household-concerts-muted">' + escapeHtml([concert.city, concert.state].filter(Boolean).join(', ')) + '</p></article>';
            }).join('')
            + '</section>';
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
     var attendeeCounts = summarizeAttendeeCounts(state.attendedConcerts);
       var favoriteOnlyCount = state.favoriteBands.filter(function (band) { return !isTier4Band(band.bandTier); }).length;
     var achievements = {
       'first-concert': state.attendedConcerts.length >= 1,
       'concert-dozen': state.attendedConcerts.length >= 12,
       'concert-fifty': state.attendedConcerts.length >= 50,
       'concert-century': state.attendedConcerts.length >= 100,
        'band-collector': favoriteOnlyCount >= 10,
        'band-mega': favoriteOnlyCount >= 50,
       'five-star': state.attendedConcerts.some(function (c) { return c.rating === 5; }),
       'completionist': state.attendedConcerts.length > 0 && state.attendedConcerts.every(function (c) { return c.rating > 0; }),
       'kyle-first-concert': attendeeCounts.kyleCount >= 1,
       'heather-first-concert': attendeeCounts.heatherCount >= 1,
       'duo-night-out': attendeeCounts.bothCount >= 1,
       'kyle-concert-dozen': attendeeCounts.kyleCount >= 12,
       'heather-concert-dozen': attendeeCounts.heatherCount >= 12,
       'duo-concert-dozen': attendeeCounts.bothCount >= 12,
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
       'kyle-first-concert': '🎸',
       'heather-first-concert': '🎤',
       'duo-night-out': '💞',
       'kyle-concert-dozen': '🤘',
       'heather-concert-dozen': '🎶',
       'duo-concert-dozen': '🫶',
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
     var attendeeCounts = summarizeAttendeeCounts(state.attendedConcerts);
     var total = attendeeCounts.householdTotal;
     var avgRating = total ? state.attendedConcerts.reduce(function (sum, c) { return sum + (c.rating || 0); }, 0) / total : 0;
     var favoritePool = state.favoriteBands.filter(function (band) { return !isTier4Band(band.bandTier); });
     var favoredBand = favoritePool.length ? favoritePool.reduce(function (best, band) {
       var count = state.attendedConcerts.filter(function (c) { return normalizeKey(c.bandName) === normalizeKey(band.bandName); }).length;
       return count > (best.count || 0) ? { name: band.bandName, count: count } : best;
     }, {}) : null;
     return {
       total: total,
       attendeeCounts: attendeeCounts,
       avgRating: avgRating,
       favoriteBand: favoredBand && favoredBand.count > 0 && favoredBand.name ? favoredBand.name : '—'
     };
   }

   function renderPersonalStats() {
     var container = document.getElementById('householdConcertsPersonalStats');
     if (!container) return;
     var stats = computePersonalStats();
     container.innerHTML = '<div class="household-concerts-personal-stats">'
       + '<div class="stat-card"><div class="stat-value">' + stats.total + '</div><div class="stat-label">Concerts</div></div>'
       + '<div class="stat-card"><div class="stat-value">' + stats.attendeeCounts.kyleCount + '</div><div class="stat-label">Kyle</div></div>'
       + '<div class="stat-card"><div class="stat-value">' + stats.attendeeCounts.heatherCount + '</div><div class="stat-label">Heather</div></div>'
       + '<div class="stat-card"><div class="stat-value">' + stats.attendeeCounts.bothCount + '</div><div class="stat-label">Together</div></div>'
       + '<div class="stat-card"><div class="stat-value">' + (stats.avgRating ? stats.avgRating.toFixed(1) : '—') + '</div><div class="stat-label">Avg Rating</div></div>'
        + '<div class="stat-card"><div class="stat-value">' + escapeHtml(safeTruncate(stats.favoriteBand, 12)) + '</div><div class="stat-label">Most Seen</div></div>'
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
     var attendeeCounts = summarizeAttendeeCounts(state.attendedConcerts);
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
       byGenre: Array.from(byGenre.entries()).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 8),
       attendeeCounts: attendeeCounts
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
       + '<div class="analytics-card"><h4>Attendee Mix</h4><strong>' + escapeHtml(formatAttendeeBreakdown(data.attendeeCounts)) + '</strong><span>' + (data.attendeeCounts.bothCount ? (data.attendeeCounts.bothCount + ' shared concert' + (data.attendeeCounts.bothCount === 1 ? '' : 's')) : 'No shared concerts yet') + '</span></div>'
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
     var payload;
     if (canUseBandsintownProxy()) {
       try {
         payload = await fetchBandsintownViaProxy('events', key);
       } catch (proxyError) {
         if (!isBandsintownProxyUnavailableError(proxyError)) throw proxyError;
          if (!canUseBandsintownDirectFallback()) {
            throw new Error('Bandsintown proxy is unavailable. Deploy /api/public/bandsintown to enable tour sync in web builds.');
          }
       }
     }
     if (typeof payload === 'undefined') {
       var url = 'https://www.bandsintown.com/api/v2/artists/' + encodeURIComponent(key) + '/events?app_id=kyles_adventure_planner';
       var response = await fetch(url);
       if (!response.ok) throw new Error('Events request failed (' + response.status + ')');
       payload = await response.json().catch(function () { return []; });
     }
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
        var artistPayload = await fetchBandsintownArtistMeta(cleanName);
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
          var syncMessage = String(error && error.message ? error.message : '').trim();
          var isBandsintownDown = /bandsintown proxy failed|bandsintown request timed out|request failed \((500|502|503)\)|upstream_error|temporarily unavailable/i.test(syncMessage);
          var proxyMessage = isBandsintownDown
            ? 'Bandsintown is temporarily unavailable. Tour dates cannot be synced right now — please add upcoming dates manually or retry in a few minutes.'
            : 'Could not sync tour schedule. You can add upcoming dates manually instead.';
          setStatus(proxyMessage + (syncMessage && !isBandsintownDown ? ' (' + syncMessage + ')' : ''), 'warning');
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
         case 'copy-schema-fix-steps':
           (async function () {
             var copied = await copyTextToClipboard(getAttendedBySchemaFixStepsText());
             setStatus(copied ? 'Copied Attended_By schema fix steps to clipboard.' : 'Could not copy to clipboard. Open console and copy manually.', copied ? 'success' : 'warning');
           })();
           break;
         case 'refresh-data':
           refreshData();
           break;
          case 'scan-unsynced-band-changes':
            (async function () {
              try {
                var report = await scanUnsyncedBandChanges();
                renderUnsyncedBandChangesReport(report);
              } catch (error) {
                console.error('❌ Could not scan unsynced band profile changes:', error);
                setStatus(error && error.message ? error.message : 'Could not scan unsynced band profile changes.', 'error');
              }
            })();
            break;
          case 'force-sync-band-change':
            (async function () {
              try {
                await forceSyncBandChangesByKey(target.getAttribute('data-band-key'));
                var refreshedReport = await scanUnsyncedBandChanges({ silent: true });
                renderUnsyncedBandChangesReport(refreshedReport);
              } catch (error) {
                console.error('❌ Could not force-sync band profile changes:', error);
                setStatus(error && error.message ? error.message : 'Could not force-sync this band profile.', 'error');
              }
            })();
            break;
          case 'force-sync-all-band-changes':
            (async function () {
              try {
                var reportToSync = state.unsyncedBandsReport && Array.isArray(state.unsyncedBandsReport.items)
                  ? state.unsyncedBandsReport
                  : await scanUnsyncedBandChanges({ silent: true });
                var items = Array.isArray(reportToSync && reportToSync.items) ? reportToSync.items : [];
                for (var itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
                  await forceSyncBandChangesByKey(items[itemIndex].bandKey, { silent: true });
                }
                var reportAfterSync = await scanUnsyncedBandChanges({ silent: true });
                renderUnsyncedBandChangesReport(reportAfterSync);
                setStatus(items.length ? ('Force-synced ' + items.length + ' band profile entr' + (items.length === 1 ? 'y' : 'ies') + ' to Excel.') : 'No unsynced band profile changes were found.', items.length ? 'success' : 'info');
              } catch (error) {
                console.error('❌ Could not force-sync all band profile changes:', error);
                setStatus(error && error.message ? error.message : 'Could not force-sync all band profiles.', 'error');
              }
            })();
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
        case 'mark-recommendation-not-interested': {
          var niDiscoveryId = String(target.getAttribute('data-discovery-id') || '').trim();
          var niBandKey = String(target.getAttribute('data-band-key') || '').trim();
          var niResult = findDiscoveryById(niDiscoveryId, niBandKey);
          if (!niResult || !niResult.bandName) break;
          markRecommendationNotInterested(niResult.bandName);
          setStatus('Marked ' + niResult.bandName + ' as not interested. It will no longer appear in recommendations.', 'success');
          renderAll();
          var currentBand = getBandByKey(niBandKey);
          var modal = document.querySelector('#householdConcertsModalHost .household-concerts-modal');
          if (modal && currentBand && modal.textContent.indexOf('Recommended bands to add') >= 0) {
            openBandDetails(currentBand);
          }
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
        case 'open-rockville-2026':
          state.rockvilleView.open = true;
          state.rockvilleView.page = 'schedule';
          state.rockvilleView.activeDay = normalizeRockvilleDayKey(state.rockvilleView.activeDay || 'thursday');
          state.rockvilleView.formDay = state.rockvilleView.activeDay;
          state.rockvilleView.editingSetId = '';
          renderAll();
          break;
        case 'close-rockville-2026':
          state.rockvilleView.open = false;
          state.rockvilleView.page = 'schedule';
          state.rockvilleView.editingSetId = '';
          renderAll();
          break;
        case 'select-rockville-day':
          state.rockvilleView.open = true;
          state.rockvilleView.page = 'schedule';
          state.rockvilleView.activeDay = normalizeRockvilleDayKey(target.getAttribute('data-rockville-day'));
          state.rockvilleView.formDay = state.rockvilleView.activeDay;
          state.rockvilleView.editingSetId = '';
          renderAll();
          break;
        case 'open-rockville-set-form':
          state.rockvilleView.open = true;
          state.rockvilleView.page = 'form';
          state.rockvilleView.formDay = normalizeRockvilleDayKey(target.getAttribute('data-rockville-day') || state.rockvilleView.activeDay);
          state.rockvilleView.activeDay = state.rockvilleView.formDay;
          state.rockvilleView.editingSetId = '';
          renderAll();
          break;
        case 'edit-rockville-set':
          state.rockvilleView.open = true;
          state.rockvilleView.page = 'form';
          state.rockvilleView.formDay = normalizeRockvilleDayKey(target.getAttribute('data-rockville-day') || state.rockvilleView.activeDay);
          state.rockvilleView.activeDay = state.rockvilleView.formDay;
          state.rockvilleView.editingSetId = String(target.getAttribute('data-rockville-set-id') || '').trim();
          renderAll();
          break;
        case 'cancel-rockville-set-form':
          state.rockvilleView.open = true;
          state.rockvilleView.page = 'schedule';
          state.rockvilleView.activeDay = normalizeRockvilleDayKey(state.rockvilleView.formDay || state.rockvilleView.activeDay);
          state.rockvilleView.formDay = state.rockvilleView.activeDay;
          state.rockvilleView.editingSetId = '';
          renderAll();
          break;
        case 'open-workbook-path-diagnostics':
          openWorkbookPathDiagnosticsModal();
          break;
        case 'copy-workbook-path-diagnostics-json': {
          var diagnosticsReport = state.lastWorkbookPathDiagnosticsReport;
          if (!diagnosticsReport || typeof diagnosticsReport !== 'object') {
            setStatus('Run workbook diagnostics first, then copy the report JSON.', 'warning');
            break;
          }
          (async function () {
            var payload = JSON.stringify(diagnosticsReport, null, 2);
            var copied = await copyTextToClipboard(payload);
            setStatus(copied ? 'Copied workbook diagnostics JSON to clipboard.' : 'Could not copy diagnostics JSON. Open console and copy manually.', copied ? 'success' : 'warning');
          })();
          break;
        }
        case 'download-workbook-path-diagnostics-json': {
          var diagnosticsDownloadReport = state.lastWorkbookPathDiagnosticsReport;
          if (!diagnosticsDownloadReport || typeof diagnosticsDownloadReport !== 'object') {
            setStatus('Run workbook diagnostics first, then download the report JSON.', 'warning');
            break;
          }
          var downloaded = false;
          try {
            downloaded = downloadWorkbookPathDiagnosticsJson(diagnosticsDownloadReport);
          } catch (_error) {
            downloaded = false;
          }
          setStatus(downloaded ? 'Downloaded workbook diagnostics JSON.' : 'Could not download diagnostics JSON on this browser.', downloaded ? 'success' : 'warning');
          break;
        }
        case 'remove-not-interested-band': {
          var restoreBand = String(target.getAttribute('data-band-name') || '').trim();
          if (!restoreBand) break;
          removeRecommendationNotInterested(restoreBand);
          setStatus('Removed "' + restoreBand + '" from Not Interested recommendations.', 'success');
          openConcertSettingsModal();
          renderAll();
          break;
        }
        case 'open-historic-finder':
          openHistoricFinderModal(($('householdConcertsSearchInput') || {}).value || ((resolveActiveBand() || {}).bandName || ''));
          break;
        case 'open-text-parser':
          openTextParserModal(String(target.getAttribute('data-parser-form-type') || '').trim() || 'attended');
          break;
        case 'parse-concert-text':
          handleConcertTextParsing(String(target.getAttribute('data-parser-form-type') || '').trim() || 'attended');
          break;
        case 'open-add-band-prefill': {
          var prefillName = String(target.getAttribute('data-band-name') || '').trim();
          openBandForm(buildSearchPrefill(prefillName, '', '', 'Historic finder prefill'));
          break;
        }
        case 'add-historic-result-to-attended': {
          var resultIndex = Number(target.getAttribute('data-result-index') || -1);
          var result = resultIndex >= 0 ? state.historicFinderResults[resultIndex] : null;
          if (!result) break;
          var matched = getBandByKey(result.bandName);
          if (!matched) {
            setStatus('Add this band to Favorite Bands first, then log the historic concert.', 'warning');
            break;
          }
          openAttendedConcertForm(matched, {
            bandName: result.bandName,
            concertDate: result.concertDate,
            venue: result.venue,
            setlistUrl: result.sourceUrl,
            notes: 'Imported from ' + (result.source || 'historic finder') + (result.distanceMiles != null ? (' (~' + result.distanceMiles.toFixed(1) + ' mi)') : ''),
            attendedBy: 'Both'
          });
          break;
        }
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
        case 'open-image-position-cover':
          openImagePositionModal(String(target.getAttribute('data-band-key') || '').trim(), 'cover');
          break;
        case 'open-image-position-logo':
          openImagePositionModal(String(target.getAttribute('data-band-key') || '').trim(), 'logo');
          break;
        case 'apply-image-position': {
          var positionBandKey = String(target.getAttribute('data-band-key') || '').trim();
          var positionImageType = String(target.getAttribute('data-image-type') || '').trim();
          applyImagePosition(positionBandKey, positionImageType);
          break;
        }
        case 'reset-image-position': {
          var resetBandKey = String(target.getAttribute('data-band-key') || '').trim();
          var resetImageType = String(target.getAttribute('data-image-type') || '').trim();
          resetImagePosition(resetBandKey, resetImageType);
          break;
        }
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
        case 'duplicate-attended-concert': {
          var sourceConcert = getAttendedConcertById(target.getAttribute('data-attended-id'));
          if (!sourceConcert) break;
          openAttendedConcertForm(getBandByKey(sourceConcert.bandKey), {
            bandName: sourceConcert.bandName,
            concertDate: sourceConcert.concertDate,
            venue: sourceConcert.venue,
            attendedBy: sourceConcert.attendedBy,
            rating: sourceConcert.rating,
            photoUrls: sourceConcert.photoUrls,
            photoUrl: sourceConcert.photoUrl,
            videoUrl: sourceConcert.videoUrl,
            setlistUrl: sourceConcert.setlistUrl,
            notes: sourceConcert.notes
          });
          setStatus('Copied concert log. Update the band (or any field) and save as a new entry.', 'info');
          break;
        }
        case 'edit-attended-concert': {
          var editConcert = getAttendedConcertById(target.getAttribute('data-attended-id'));
          if (!editConcert) break;
          openAttendedConcertForm(getBandByKey(editConcert.bandKey), {
            attendedConcertId: editConcert.id,
            attendedRowIndex: editConcert.__rowIndex,
            bandName: editConcert.bandName,
            concertDate: editConcert.concertDate,
            venue: editConcert.venue,
            attendedBy: editConcert.attendedBy,
            rating: editConcert.rating,
            photoUrls: editConcert.photoUrls,
            photoUrl: editConcert.photoUrl,
            videoUrl: editConcert.videoUrl,
            setlistUrl: editConcert.setlistUrl,
            notes: editConcert.notes
          });
          break;
        }
        case 'open-add-upcoming':
          openUpcomingConcertForm(getBandByKey(target.getAttribute('data-band-key')) || resolveActiveBand());
          break;
        case 'toggle-upcoming-ticket': {
          var upcomingId = String(target.getAttribute('data-upcoming-id') || '').trim();
          var concert = state.upcomingConcerts.find(function (item) { return String(item.id || '') === upcomingId; });
          if (!concert) break;
          concert.ticketsPurchased = !concert.ticketsPurchased;
          setUpcomingTicketFlag(concert, concert.ticketsPurchased);
          persistUpcomingTicketStatus(concert).catch(function () {
            // Local status remains if backend table does not support Tickets_Purchased yet.
          });
          setStatus((concert.ticketsPurchased ? 'Marked tickets purchased for ' : 'Marked tickets not purchased for ') + concert.bandName + '.', 'success');
          renderUpcomingConcerts();
          renderTicketedCalendar();
          break;
        }
        case 'select-band':
          state.activeBandKey = normalizeKey(target.getAttribute('data-band-key'));
          renderAll();
          loadDiscoveryForBand(resolveActiveBand(), false);
          break;
        case 'open-band-details':
          openBandDetails(getBandByKey(target.getAttribute('data-band-key')) || getBandByKey(target.getAttribute('data-band-name')));
          break;
         case 'cycle-band-tier': {
           var cycleBand = getBandByKey(target.getAttribute('data-band-key'));
           if (!cycleBand) break;
           updateBandTierForBand(cycleBand, getNextBandTierValue(cycleBand.bandTier));
           break;
         }
         case 'save-band-tier': {
           var tierBand = getBandByKey(target.getAttribute('data-band-key'));
           if (!tierBand) break;
           var tierSelect = document.getElementById('householdConcertsBandTierQuickSelect');
           updateBandTierForBand(tierBand, String((tierSelect && tierSelect.value) || tierBand.bandTier || '').trim(), { reopenProfile: true });
           break;
         }
         case 'toggle-priority-band': {
           var priorityBand = getBandByKey(target.getAttribute('data-band-key'));
           if (!priorityBand) break;
           var nextPriority = !isPriorityBand(priorityBand);
           setPriorityBandFlag(priorityBand, nextPriority);
           setStatus((nextPriority ? 'Prioritized ' : 'Removed priority for ') + priorityBand.bandName + '.', 'success');
           renderAll();
           if (document.querySelector('#householdConcertsModalHost .household-concerts-modal')) {
             openBandDetails(priorityBand);
           }
           break;
         }
         case 'open-band-details-prev': {
           var prevCurrent = getBandByKey(target.getAttribute('data-band-key')) || resolveActiveBand();
           var prevBand = resolveAdjacentBand(prevCurrent, 'prev');
           if (prevBand) openBandDetails(prevBand);
           break;
         }
         case 'open-band-details-next': {
           var nextCurrent = getBandByKey(target.getAttribute('data-band-key')) || resolveActiveBand();
           var nextBand = resolveAdjacentBand(nextCurrent, 'next');
           if (nextBand) openBandDetails(nextBand);
           break;
         }
         case 'refresh-band-profile':
           refreshSavedBandProfile(getBandByKey(target.getAttribute('data-band-key')), { noPreview: false });
           break;
         case 'refresh-all-band-profiles':
           refreshAllBandProfiles();
           break;
         case 'refresh-band-profile-no-preview':
           refreshSavedBandProfile(getBandByKey(target.getAttribute('data-band-key')), { noPreview: true });
           break;
         case 'refresh-band-profile-preview':
           refreshSavedBandProfile(getBandByKey(target.getAttribute('data-band-key')), { noPreview: false });
           break;
         case 'enrich-missing-links': {
           var enrichBand = getBandByKey(target.getAttribute('data-band-key'));
           if (!enrichBand) break;
           setStatus('Attempting to fill missing links for ' + enrichBand.bandName + '…', 'info');
           refreshSavedBandProfile(enrichBand, { noPreview: true });
           break;
         }
         case 'set-genre-filter':
           state.genreFilter = String(target.getAttribute('data-genre') || '').trim();
           state.bandsPage = 1;
           renderAll();
           break;
         case 'set-summary-filter': {
           var summaryKey = String(target.getAttribute('data-summary-filter') || '').trim();
            state.bandSummaryFilter = normalizeText(state.bandSummaryFilter) === normalizeText(summaryKey) ? '' : summaryKey;
           state.bandsPage = 1;
           renderAll();
           break;
         }
         case 'remove-band-filter': {
           var filterKind = String(target.getAttribute('data-filter-kind') || '').trim();
           if (filterKind === 'query') {
             state.bandFilter = '';
             var searchInput = $('householdConcertsFilterInput');
             if (searchInput) searchInput.value = '';
           } else if (filterKind === 'genre') {
             state.genreFilter = '';
           } else if (filterKind === 'tier') {
             state.tierFilter = '';
           } else if (filterKind === 'tier4') {
             state.showTier4Bands = false;
             writeStringStorage(SHOW_TIER4_STORAGE_KEY, '0');
           } else if (filterKind === 'summary') {
             state.bandSummaryFilter = '';
           }
           state.bandsPage = 1;
           renderAll();
           break;
         }
         case 'clear-all-band-filters': {
           state.bandFilter = '';
           state.genreFilter = '';
           state.tierFilter = '';
           state.bandSummaryFilter = '';
           state.showTier4Bands = false;
           writeStringStorage(SHOW_TIER4_STORAGE_KEY, '0');
           var filterInput = $('householdConcertsFilterInput');
           if (filterInput) filterInput.value = '';
           state.bandsPage = 1;
           renderAll();
           break;
         }
         case 'set-tier4-visibility':
           state.showTier4Bands = String(target.getAttribute('data-tier4-visible') || '') === '1';
           if (!state.showTier4Bands && normalizeText(state.tierFilter) === normalizeText(BAND_TIER_OPTIONS[3].value)) {
             state.tierFilter = '';
           }
           state.bandsPage = 1;
           writeStringStorage(SHOW_TIER4_STORAGE_KEY, state.showTier4Bands ? '1' : '0');
           renderAll();
           break;
         case 'set-tier-filter':
           state.tierFilter = String(target.getAttribute('data-tier') || '').trim();
           state.bandsPage = 1;
           if (normalizeText(state.tierFilter) === normalizeText(BAND_TIER_OPTIONS[3].value)) {
             state.showTier4Bands = true;
             writeStringStorage(SHOW_TIER4_STORAGE_KEY, '1');
           }
           renderAll();
           break;
         case 'set-bands-page':
           state.bandsPage = Number(target.getAttribute('data-page') || 1) || 1;
           renderFavoriteBands();
           break;
         case 'set-band-columns': {
           var newCols = Math.max(1, Math.min(4, Number(target.getAttribute('data-columns') || 2) || 2));
           state.bandCardColumns = newCols;
           writeStringStorage(BAND_CARD_COLS_STORAGE_KEY, String(newCols));
           renderFavoriteBands();
           break;
         }
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
        case 'refresh-priority-dashboard':
          (async function () {
            var prioritizedBands = state.favoriteBands.filter(function (band) { return isPriorityBand(band); });
            for (var idx = 0; idx < prioritizedBands.length; idx += 1) {
              await syncTourScheduleForBand(prioritizedBands[idx]);
            }
            renderPriorityBandsDashboard();
          })();
          break;
        case 'refresh-festival-dashboard':
          refreshFestivalDashboard();
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
         state.bandsPage = 1;
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
        if (target.id === 'householdConcertsAttendedBandSearch') {
          updateAttendedBandSelectOptions(target.value || '');
        }
        if (target.id === 'householdConcertsCropX' || target.id === 'householdConcertsCropY' || target.id === 'householdConcertsCropZoom') {
          updateImageCropPreview();
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
      if (form.id === 'householdConcertsRockvilleSetForm') saveRockvilleSet(form);
      if (form.id === 'householdConcertsSettingsForm') saveConcertSettingsFromForm(form);
      if (form.id === 'householdConcertsHistoricFinderForm') searchHistoricConcerts(form);
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

