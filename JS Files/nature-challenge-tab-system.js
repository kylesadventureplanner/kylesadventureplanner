/*
 * Nature Challenge Tab System
 * Birds overview + species explorer + species detail workflow.
 */

(function() {
  const BIRD_DATA_URL = 'data/nature-challenge-birds.tsv';
  const BIRD_SIGHTINGS_KEY = 'natureChallengeBirdSightingsV1';
  const BIRD_CACHE_KEY = 'natureChallengeBirdDatasetCacheV1';
  const BIRD_FAVORITES_KEY = 'natureChallengeBirdFavoritesV1';
  const BIRD_SIGHTING_LOG_KEY = 'natureChallengeBirdSightingLogV1';
  const BIRD_SYNC_QUEUE_KEY = 'natureChallengeBirdSyncQueueV1';
  const BIRD_SYNC_CONFLICTS_KEY = 'natureChallengeBirdSyncConflictsV1';
  const BIRD_GAMIFICATION_KEY = 'natureChallengeBirdGamificationV1';
  const EXCEL_TABLE_NAME = 'birds';
  const EXCEL_FILE_CANDIDATES = [
    'Nature_records.xlsx',
    'Copilot_Apps/Kyles_Adventure_Finder/Nature_records.xlsx'
  ];
  const SUBTAB_KEYS = ['birds', 'mammals', 'reptiles', 'amphibians', 'insects', 'arachnids', 'wildflowers', 'trees', 'shrubs'];
  const BIRD_VIEWS = ['overview', 'log', 'explorer', 'detail'];

  const RARITY_META = {
    common: { label: 'Common', className: 'rarity-common', weight: 1 },
    regular: { label: 'Regular', className: 'rarity-regular', weight: 1.5 },
    uncommon: { label: 'Uncommon', className: 'rarity-uncommon', weight: 2 },
    rare: { label: 'Rare', className: 'rarity-rare', weight: 3 },
    veryRare: { label: 'Very Rare', className: 'rarity-very-rare', weight: 4 },
    extremelyRare: { label: 'Extremely Rare', className: 'rarity-extremely-rare', weight: 5 }
  };

  const SEASON_META = {
    spring: { label: 'Spring', icon: 'Spring', className: 'season-spring' },
    summer: { label: 'Summer', icon: 'Summer', className: 'season-summer' },
    fall: { label: 'Fall', icon: 'Fall', className: 'season-fall' },
    winter: { label: 'Winter', icon: 'Winter', className: 'season-winter' },
    migration: { label: 'Migration', icon: 'Migration', className: 'season-migration' }
  };

  const BIRD_PROGRESSION_SPEC = {
    dailyPickCount: 3,
    streak: {
      freezeAwardEveryDays: 7,
      maxFreezeCredits: 3
    },
    bingo: {
      tileCount: 9,
      rerollLimitPerSeason: 1,
      badgeGoalTiles: 3
    },
    challengeDefs: [
      { id: 'challenge-daily-pulse', icon: 'Daily', title: 'Daily Pulse', description: 'Keep your log active today.', metric: 'todayLogCount', goal: 1, xp: 40 },
      { id: 'challenge-weekly-wings', icon: 'Weekly', title: 'Weekly Wings', description: 'Log fresh bird species this week.', metric: 'weeklySightedCount', goal: 3, xp: 80 },
      { id: 'challenge-monthly-milestone', icon: 'Monthly', title: 'Monthly Milestone', description: 'Build steady momentum across the month.', metric: 'monthlySightedCount', goal: 10, xp: 140 },
      { id: 'challenge-quarterly-flight-plan', icon: 'Quarterly', title: 'Quarterly Flight Plan', description: 'Keep your seasonal list moving this quarter.', metric: 'quarterlySightedCount', goal: 25, xp: 220 },
      { id: 'challenge-lifetime-lister', icon: 'All Time', title: 'Lifetime Lister', description: 'Grow your all-time bird checklist.', metric: 'totalSighted', goal: 100, xp: 300 },
      { id: 'challenge-season-sweep', icon: '{seasonLabel}', title: '{seasonLabel} Sweep', description: 'Mark birds that are available in {season} right now.', metric: 'inSeasonSightedCount', goal: 15, xp: 130 },
      { id: 'challenge-rare-radar', icon: 'Rare', title: 'Rare Radar', description: 'Find rare, very rare, or extremely rare species.', metric: 'rareSightedCount', goal: 5, xp: 170 },
      { id: 'challenge-family-forager', icon: 'Families', title: 'Family Forager', description: 'Get at least one sighting in different bird families.', metric: 'familiesStarted', goal: 12, xp: 120 },
      { id: 'challenge-migration-mapper', icon: 'Migration', title: 'Migration Mapper', description: 'Track birds that show up during migration windows.', metric: 'migrationSightedCount', goal: 8, xp: 150 },
      { id: 'challenge-season-questline', icon: 'Quest', title: 'Season Questline', description: 'Log 12 sightings during {season} to complete your chapter.', metric: 'seasonalLogCount', goal: 12, xp: 180 }
    ],
    badgeDefs: [
      { id: 'badge-first-feather', icon: 'First', title: 'First Feather', description: 'Mark your first bird species as sighted.', rarity: 'common', metric: 'totalSighted', goal: 1, xp: 50 },
      { id: 'badge-common-core', icon: 'Common', title: 'Common Core', description: 'Build a strong base with common species.', rarity: 'common', metric: 'commonSightedCount', goal: 25, xp: 120 },
      { id: 'badge-rare-find', icon: 'Rare', title: 'Rare Find', description: 'Spot five rare-or-better birds.', rarity: 'rare', metric: 'rareSightedCount', goal: 5, xp: 180 },
      { id: 'badge-migration-mapper', icon: 'Migration', title: 'Migration Mapper', description: 'Log species associated with migration seasons.', rarity: 'rare', metric: 'migrationSightedCount', goal: 10, xp: 220 },
      { id: 'badge-season-spotter', icon: '{seasonLabel}', title: '{seasonLabel} Spotter', description: 'Track birds available during {season}.', rarity: 'epic', metric: 'inSeasonSightedCount', goal: 20, xp: 260 },
      { id: 'badge-family-finisher', icon: 'Family', title: 'Family Finisher', description: 'Completely finish one family list.', rarity: 'epic', metric: 'familiesCompleted', goal: 1, xp: 280 },
      { id: 'badge-legendary-lister', icon: 'Legend', title: 'Legendary Lister', description: 'Reach 100 total bird species sighted.', rarity: 'legendary', metric: 'totalSighted', goal: 100, xp: 400 },
      { id: 'badge-ultra-rarity', icon: 'Ultra', title: 'Ultra-Rarity', description: 'Sight at least one very rare or extremely rare bird.', rarity: 'legendary', metric: 'veryRareSightedCount', goal: 1, xp: 350 },
      { id: 'badge-streak-keeper', icon: 'Streak', title: 'Streak Keeper', description: 'Build a 7-day birding streak.', rarity: 'rare', metric: 'streak.currentStreak', goal: 7, xp: 210 },
      { id: 'badge-bingo-beginner', icon: 'Bingo', title: 'Bingo Beginner', description: 'Complete 3 bingo tiles in the current season.', rarity: 'epic', metric: 'bingo.completedCount', goal: 3, xp: 240 },
      { id: 'badge-season-chapter-clear', icon: 'Quest', title: 'Season Chapter Clear', description: 'Finish all seasonal questline steps.', rarity: 'legendary', metric: 'seasonQuestCompletedCount', goal: 4, xp: 320 }
    ],
    dailyChallengeDefs: [
      { id: 'daily-log-1', icon: 'Daily', title: 'Show Up Today', description: 'Log at least one sighting today.', metric: 'todayLogCount', goal: 1, xp: 30 },
      { id: 'daily-new-species', icon: 'Discovery', title: 'Fresh Feathers', description: 'Log 2 unique species today.', metric: 'todayUniqueSpeciesCount', goal: 2, xp: 45 },
      { id: 'daily-context-mix', icon: 'Explorer', title: 'Context Mixer', description: 'Log sightings in 2 different regions or habitats today.', metric: 'todayContextMixCount', goal: 2, xp: 35 },
      { id: 'daily-rare', icon: 'Rare', title: 'Rare Radar (Daily)', description: 'Log one rare-or-better species today.', metric: 'todayRareLogCount', goal: 1, xp: 55 },
      { id: 'daily-confidence', icon: 'Quality', title: 'Certain Signal', description: 'Log 2 sightings with confidence set to Certain today.', metric: 'todayCertainCount', goal: 2, xp: 40 }
    ],
    bingoObjectiveDefs: [
      { id: 'b1', label: 'Log 2 birds this week', metric: 'weeklyLogCount', goal: 2, xp: 35 },
      { id: 'b2', label: 'Log 6 birds this month', metric: 'monthlyLogCount', goal: 6, xp: 45 },
      { id: 'b3', label: 'Spot 1 rare-or-better', metric: 'rareSightedCount', goal: 1, xp: 55 },
      { id: 'b4', label: 'Mark 3 in-season birds', metric: 'inSeasonSightedCount', goal: 3, xp: 40 },
      { id: 'b5', label: 'Log 2 habitats this season', metric: 'seasonHabitatCount', goal: 2, xp: 40 },
      { id: 'b6', label: 'Start 4 families', metric: 'familiesStarted', goal: 4, xp: 40 },
      { id: 'b7', label: 'Log 2 certain sightings today', metric: 'todayCertainCount', goal: 2, xp: 35 },
      { id: 'b8', label: 'Reach 15 total species', metric: 'totalSighted', goal: 15, xp: 60 },
      { id: 'b9', label: 'Log 2 unique species today', metric: 'todayUniqueSpeciesCount', goal: 2, xp: 35 },
      { id: 'b10', label: 'Log 3 regions this season', metric: 'seasonRegionCount', goal: 3, xp: 40 },
      { id: 'b11', label: 'Spot 2 migration birds', metric: 'migrationSightedCount', goal: 2, xp: 45 },
      { id: 'b12', label: 'Complete 1 family', metric: 'familiesCompleted', goal: 1, xp: 70 }
    ],
    seasonQuestDefs: [
      { id: 'sq-1', icon: 'Scout', title: 'Scout Phase', description: 'Log 5 sightings this season.', metric: 'seasonalLogCount', goal: 5, xp: 80 },
      { id: 'sq-2', icon: 'Variety', title: 'Variety Phase', description: 'Log sightings across 3 habitats this season.', metric: 'seasonHabitatCount', goal: 3, xp: 90 },
      { id: 'sq-3', icon: 'Rare', title: 'Rare Phase', description: 'Find 2 rare-or-better species this season.', metric: 'rareSightedCount', goal: 2, xp: 110 },
      { id: 'sq-4', icon: 'Mastery', title: 'Mastery Phase', description: 'Reach 15 seasonal sightings.', metric: 'seasonalLogCount', goal: 15, xp: 140 }
    ]
  };

  const state = {
    initialized: false,
    activeSubTab: 'birds',
    activeBirdView: 'overview',
    selectedBirdId: '',
    birdSearch: '',
    birdSort: 'family-asc',
    birdPage: 1,
    birdPageSize: 12,
    birdFilters: {
      season: 'all',
      rarity: 'all',
      family: 'all',
      region: 'all',
      habitat: 'all',
      favoritesOnly: false,
      seasonChips: [],
      rarityChips: [],
      familyChips: []
    },
    birdsLoaded: false,
    birdsLoading: false,
    birdsError: '',
    birdsSource: '',
    birds: [],
    families: [],
    sightings: loadSightings(),
    favorites: loadFavorites(),
    sightingLog: loadSightingLog(),
    logSuccessMessage: '',
    gamification: loadGamificationState(),
    syncQueue: loadSyncQueue(),
    syncConflicts: loadSyncConflicts(),
    lastSyncAttemptAt: '',
    lastSyncSuccessAt: '',
    lastLoadedAt: null
  };

  function norm(value) {
    return String(value || '').trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function safeJsonParse(value, fallback) {
    try {
      return JSON.parse(value);
    } catch (_) {
      return fallback;
    }
  }

  function loadSightings() {
    return safeJsonParse(localStorage.getItem(BIRD_SIGHTINGS_KEY), {}) || {};
  }

  function saveSightings() {
    localStorage.setItem(BIRD_SIGHTINGS_KEY, JSON.stringify(state.sightings || {}));
  }

  function loadFavorites() {
    const list = safeJsonParse(localStorage.getItem(BIRD_FAVORITES_KEY), []);
    return Array.isArray(list) ? list : [];
  }

  function saveFavorites() {
    localStorage.setItem(BIRD_FAVORITES_KEY, JSON.stringify(state.favorites || []));
  }

  function loadSightingLog() {
    const list = safeJsonParse(localStorage.getItem(BIRD_SIGHTING_LOG_KEY), []);
    return Array.isArray(list) ? list : [];
  }

  function saveSightingLog() {
    localStorage.setItem(BIRD_SIGHTING_LOG_KEY, JSON.stringify(state.sightingLog || []));
  }

  function loadSyncQueue() {
    const list = safeJsonParse(localStorage.getItem(BIRD_SYNC_QUEUE_KEY), []);
    return Array.isArray(list) ? list : [];
  }

  function saveSyncQueue() {
    localStorage.setItem(BIRD_SYNC_QUEUE_KEY, JSON.stringify(state.syncQueue || []));
  }

  function loadSyncConflicts() {
    const list = safeJsonParse(localStorage.getItem(BIRD_SYNC_CONFLICTS_KEY), []);
    return Array.isArray(list) ? list : [];
  }

  function defaultGamificationState() {
    return {
      streak: {
        freezeCredits: 1,
        bestStreak: 0,
        lastAwardedMilestone: 0,
        frozenDates: []
      },
      bingo: {
        bySeason: {}
      }
    };
  }

  function loadGamificationState() {
    const saved = safeJsonParse(localStorage.getItem(BIRD_GAMIFICATION_KEY), null);
    const defaults = defaultGamificationState();
    if (!saved || typeof saved !== 'object') return defaults;

    return {
      streak: {
        freezeCredits: Math.max(0, Number(saved.streak && saved.streak.freezeCredits) || defaults.streak.freezeCredits),
        bestStreak: Math.max(0, Number(saved.streak && saved.streak.bestStreak) || 0),
        lastAwardedMilestone: Math.max(0, Number(saved.streak && saved.streak.lastAwardedMilestone) || 0),
        frozenDates: Array.isArray(saved.streak && saved.streak.frozenDates)
          ? saved.streak.frozenDates.filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value)))
          : []
      },
      bingo: {
        bySeason: saved.bingo && typeof saved.bingo.bySeason === 'object' && saved.bingo.bySeason
          ? saved.bingo.bySeason
          : {}
      }
    };
  }

  function saveGamificationState() {
    localStorage.setItem(BIRD_GAMIFICATION_KEY, JSON.stringify(state.gamification || defaultGamificationState()));
  }

  function saveSyncConflicts() {
    localStorage.setItem(BIRD_SYNC_CONFLICTS_KEY, JSON.stringify(state.syncConflicts || []));
  }

  function saveBirdCache(dataset, source) {
    const payload = {
      birds: dataset.birds || [],
      families: dataset.families || [],
      source: source || 'cache',
      cachedAt: new Date().toISOString()
    };
    localStorage.setItem(BIRD_CACHE_KEY, JSON.stringify(payload));
  }

  function loadBirdCache() {
    const cached = safeJsonParse(localStorage.getItem(BIRD_CACHE_KEY), null);
    if (!cached || !Array.isArray(cached.birds) || !Array.isArray(cached.families)) return null;
    return cached;
  }

  function encodeGraphPath(filePath) {
    return String(filePath || '')
      .split('/')
      .filter(Boolean)
      .map((part) => encodeURIComponent(part))
      .join('/');
  }

  async function fetchGraphJson(url) {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${window.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`Graph request failed (${response.status})`);
    }
    return response.json().catch(() => ({}));
  }

  function getCurrentSeason() {
    const month = new Date().getMonth() + 1;
    if (month === 12 || month <= 2) return 'winter';
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    return 'fall';
  }

  function getCurrentQuarterStart(date) {
    const quarterStartMonth = Math.floor(date.getMonth() / 3) * 3;
    return new Date(date.getFullYear(), quarterStartMonth, 1, 0, 0, 0, 0);
  }

  function getStartOfWeek(date) {
    const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = copy.getDay();
    const diff = (day + 6) % 7;
    copy.setDate(copy.getDate() - diff);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }

  function getDateKey(input) {
    const date = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function parseObservedDate(value) {
    if (!value) return null;
    const str = String(value).trim();
    if (!str) return null;
    const date = /^\d{4}-\d{2}-\d{2}$/.test(str)
      ? new Date(`${str}T12:00:00`)
      : new Date(str);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function getSeasonWindow(date, seasonKey) {
    const year = date.getFullYear();
    if (seasonKey === 'winter') {
      return {
        key: `${year}-winter`,
        start: new Date(year, 11, 1, 0, 0, 0, 0),
        end: new Date(year + 1, 2, 1, 0, 0, 0, 0)
      };
    }
    if (seasonKey === 'spring') {
      return {
        key: `${year}-spring`,
        start: new Date(year, 2, 1, 0, 0, 0, 0),
        end: new Date(year, 5, 1, 0, 0, 0, 0)
      };
    }
    if (seasonKey === 'summer') {
      return {
        key: `${year}-summer`,
        start: new Date(year, 5, 1, 0, 0, 0, 0),
        end: new Date(year, 8, 1, 0, 0, 0, 0)
      };
    }
    return {
      key: `${year}-fall`,
      start: new Date(year, 8, 1, 0, 0, 0, 0),
      end: new Date(year, 11, 1, 0, 0, 0, 0)
    };
  }

  function createSeededRandom(seedText) {
    let seed = 0;
    for (let i = 0; i < seedText.length; i += 1) {
      seed = (seed * 31 + seedText.charCodeAt(i)) >>> 0;
    }
    return function next() {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }

  function pickDeterministic(list, count, seedText) {
    const items = list.slice();
    const rand = createSeededRandom(seedText);
    for (let i = items.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rand() * (i + 1));
      const temp = items[i];
      items[i] = items[j];
      items[j] = temp;
    }
    return items.slice(0, Math.min(count, items.length));
  }

  function getMetricValue(stats, metricPath) {
    if (!metricPath) return 0;
    if (metricPath === 'todayContextMixCount') {
      return Math.max(Number(stats.todayDistinctRegionCount) || 0, Number(stats.todayDistinctHabitatCount) || 0);
    }

    return String(metricPath)
      .split('.')
      .reduce((acc, key) => (acc && typeof acc === 'object' ? acc[key] : undefined), stats) || 0;
  }

  function applyProgressionTemplate(text, stats) {
    return String(text || '')
      .replace(/\{seasonLabel\}/g, String(stats.currentSeasonLabel || 'Season'))
      .replace(/\{season\}/g, String(stats.currentSeason || 'season').toLowerCase());
  }

  function toProgressionCard(definition, stats) {
    const goal = Math.max(1, Number(definition.goal) || 1);
    const progress = Math.max(0, Number(getMetricValue(stats, definition.metric)) || 0);
    return {
      id: definition.id,
      icon: applyProgressionTemplate(definition.icon, stats),
      title: applyProgressionTemplate(definition.title, stats),
      description: applyProgressionTemplate(definition.description, stats),
      label: applyProgressionTemplate(definition.label, stats),
      metric: definition.metric,
      goal,
      progress,
      xp: Math.max(0, Number(definition.xp) || 0),
      completed: progress >= goal,
      pct: Math.max(0, Math.min(100, Math.round((progress / goal) * 100)))
    };
  }

  function getCanonicalGroupKey(label) {
    return norm(String(label || '').split('(')[0]).replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function getSpeciesKey(speciesName) {
    return norm(speciesName).replace(/[^a-z0-9]+/g, '-');
  }

  function getCanonicalSpeciesId(speciesName) {
    const normalized = norm(speciesName)
      .replace(/\([^)]*\)/g, ' ')
      .replace(/\b(atlantic|pacific|boreal|gulf stream|southern|northern|eastern|western)\b/g, ' ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
    return normalized.replace(/\s+/g, '-');
  }

  function getDisplayLabel(candidate, current) {
    if (!current) return candidate;
    return candidate.length > current.length ? candidate : current;
  }

  function normalizeRarity(rawRarity) {
    const raw = String(rawRarity || '').trim();
    const lower = norm(raw);
    let key = 'common';

    if (lower.includes('extremely rare')) key = 'extremelyRare';
    else if (lower.includes('very rare')) key = 'veryRare';
    else if (lower.includes('rare')) key = 'rare';
    else if (lower.includes('uncommon')) key = 'uncommon';
    else if (lower.includes('regular')) key = 'regular';

    const flags = [];
    ['introduced', 'escapee', 'vagrant', 'mountains', 'coastal', 'domestic'].forEach((flag) => {
      if (lower.includes(flag)) flags.push(flag);
    });

    return {
      raw,
      key,
      flags,
      ...RARITY_META[key]
    };
  }

  function normalizeSeasons(rawSeasons) {
    const raw = String(rawSeasons || '').trim();
    const lower = norm(raw)
      .replace(/year-round/g, 'all seasons')
      .replace(/year round/g, 'all seasons');

    const tokens = new Set();
    if (lower.includes('all seasons')) {
      ['spring', 'summer', 'fall', 'winter'].forEach((token) => tokens.add(token));
    }
    if (lower.includes('spring')) tokens.add('spring');
    if (lower.includes('summer')) tokens.add('summer');
    if (lower.includes('fall') || lower.includes('autumn')) tokens.add('fall');
    if (lower.includes('winter')) tokens.add('winter');
    if (lower.includes('migration')) {
      tokens.add('migration');
      tokens.add('spring');
      tokens.add('fall');
    }

    if (!tokens.size) {
      tokens.add('spring');
      tokens.add('summer');
      tokens.add('fall');
      tokens.add('winter');
    }

    const orderedTokens = Object.keys(SEASON_META).filter((token) => tokens.has(token));
    return {
      raw,
      tokens: orderedTokens,
      isAvailableNow: tokens.has(getCurrentSeason())
    };
  }

  function pickField(details, aliases) {
    const detailsKeys = Object.keys(details || {});
    for (let i = 0; i < aliases.length; i += 1) {
      const alias = aliases[i];
      const matchedKey = detailsKeys.find((key) => norm(key) === norm(alias));
      if (matchedKey && String(details[matchedKey] || '').trim()) {
        return String(details[matchedKey] || '').trim();
      }
    }
    return '';
  }

  function buildDatasetFromRecords(records) {
    const speciesMap = new Map();
    const familyLabelMap = new Map();

    records.forEach((record) => {
      const familyLabel = String(record.family || '').trim();
      const genusLabel = String(record.genus || '').trim();
      const speciesName = String(record.species || '').trim();
      if (!familyLabel || !genusLabel || !speciesName) return;

      const familyKey = getCanonicalGroupKey(familyLabel);
      const speciesKey = getSpeciesKey(speciesName);
      const canonicalId = getCanonicalSpeciesId(speciesName);
      const rarity = normalizeRarity(record.rarity || 'Common');
      const seasons = normalizeSeasons(record.seasons || 'All seasons');

      familyLabelMap.set(familyKey, getDisplayLabel(familyLabel, familyLabelMap.get(familyKey) || ''));

      const existing = speciesMap.get(speciesKey);
      if (existing) {
        existing.familyLabel = getDisplayLabel(familyLabelMap.get(familyKey) || familyLabel, existing.familyLabel);
        existing.genusLabel = getDisplayLabel(genusLabel, existing.genusLabel);
        existing.seasons.raw = getDisplayLabel(seasons.raw, existing.seasons.raw);
        seasons.tokens.forEach((token) => {
          if (!existing.seasons.tokens.includes(token)) existing.seasons.tokens.push(token);
        });
        existing.seasons.tokens.sort((a, b) => Object.keys(SEASON_META).indexOf(a) - Object.keys(SEASON_META).indexOf(b));
        existing.seasons.isAvailableNow = existing.seasons.tokens.includes(getCurrentSeason());
        if (rarity.weight > existing.rarity.weight) existing.rarity = rarity;
        existing.rarityNotes = Array.from(new Set(existing.rarityNotes.concat(rarity.flags)));
        Object.entries(record.details || {}).forEach(([key, value]) => {
          if (!existing.details[key] && String(value || '').trim()) {
            existing.details[key] = String(value || '').trim();
          }
        });
        return;
      }

      speciesMap.set(speciesKey, {
        id: speciesKey,
        canonicalId,
        familyKey,
        familyLabel: familyLabelMap.get(familyKey) || familyLabel,
        genusLabel,
        speciesName,
        seasons,
        rarity,
        rarityNotes: Array.from(rarity.flags),
        defaultRegion: String(record.region || '').trim().toLowerCase(),
        defaultHabitat: String(record.habitat || '').trim().toLowerCase(),
        details: { ...(record.details || {}) }
      });
    });

    const birds = Array.from(speciesMap.values())
      .sort((a, b) => {
        if (a.familyLabel !== b.familyLabel) return a.familyLabel.localeCompare(b.familyLabel);
        return a.speciesName.localeCompare(b.speciesName);
      });

    const familyMap = new Map();
    birds.forEach((bird) => {
      if (!familyMap.has(bird.familyKey)) {
        familyMap.set(bird.familyKey, {
          key: bird.familyKey,
          label: familyLabelMap.get(bird.familyKey) || bird.familyLabel,
          species: []
        });
      }
      familyMap.get(bird.familyKey).species.push(bird);
    });

    const families = Array.from(familyMap.values())
      .map((family) => ({
        ...family,
        species: family.species.sort((a, b) => a.speciesName.localeCompare(b.speciesName))
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return { birds, families };
  }

  function parseBirdData(tsvText) {
    const lines = String(tsvText || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const rows = [];
    lines.slice(1).forEach((line) => {
      const [family, genus, species, seasons, rarity] = line.split('\t');
      if (!family || !genus || !species) return;
      rows.push({
        family,
        genus,
        species,
        seasons,
        rarity,
        details: {
          'Family (English)': family,
          'Genus (English)': genus,
          'Species (English)': species,
          'Seasons Found': seasons,
          'Rare or Common': rarity
        }
      });
    });

    return buildDatasetFromRecords(rows);
  }

  function parseBirdDataFromExcelRows(columns, rows) {
    const columnNamesByIndex = {};
    (columns || []).forEach((column, index) => {
      const idx = Number.isInteger(column.index) ? column.index : index;
      columnNamesByIndex[idx] = String(column.name || `Column ${idx + 1}`);
    });

    const normalizedRows = [];

    (rows || []).forEach((row) => {
      const values = Array.isArray(row.values) && Array.isArray(row.values[0]) ? row.values[0] : [];
      const details = {};
      values.forEach((value, index) => {
        const key = columnNamesByIndex[index] || `Column ${index + 1}`;
        details[key] = String(value == null ? '' : value).trim();
      });

      const family = pickField(details, ['Family (English)', 'Family']);
      const genus = pickField(details, ['Genus (English)', 'Genus']);
      const species = pickField(details, ['Species (English)', 'Species', 'Bird Species']);
      const seasons = pickField(details, ['Seasons Found', 'Season', 'Seasons']);
      const rarity = pickField(details, ['Rare or Common', 'Rarity', 'Commonality']);

      if (!family || !genus || !species) return;

      normalizedRows.push({
        family,
        genus,
        species,
        seasons: seasons || 'All seasons',
        rarity: rarity || 'Common',
        details
      });
    });

    return buildDatasetFromRecords(normalizedRows);
  }

  function getBirdFileCandidates() {
    const configured = window.natureBirdTableConfig && window.natureBirdTableConfig.filePath
      ? [String(window.natureBirdTableConfig.filePath)]
      : [];

    return Array.from(new Set(configured.concat(EXCEL_FILE_CANDIDATES)));
  }

  async function loadBirdDataFromExcel() {
    if (!window.accessToken) {
      throw new Error('Excel source unavailable: you are not signed in.');
    }

    const tableName = window.natureBirdTableConfig?.tableName || EXCEL_TABLE_NAME;
    const fileCandidates = getBirdFileCandidates();
    const errors = [];

    for (let i = 0; i < fileCandidates.length; i += 1) {
      const filePath = fileCandidates[i];
      const encodedPath = encodeGraphPath(filePath);
      const baseUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/workbook/tables/${encodeURIComponent(tableName)}`;

      try {
        const columnsPayload = await fetchGraphJson(`${baseUrl}/columns?$select=name,index`);
        const rowsPayload = await fetchGraphJson(`${baseUrl}/rows?$top=5000`);

        const dataset = parseBirdDataFromExcelRows(columnsPayload.value || [], rowsPayload.value || []);
        return {
          dataset,
          source: `Excel table '${tableName}' in ${filePath}`
        };
      } catch (error) {
        errors.push(`${filePath}: ${error && error.message ? error.message : 'Failed to read birds table.'}`);
      }
    }

    throw new Error(errors.join(' | '));
  }

  async function loadBirdDataFromTsv(forceRefresh) {
    const response = await fetch(BIRD_DATA_URL, { cache: forceRefresh ? 'reload' : 'default' });
    if (!response.ok) {
      throw new Error(`Unable to load local bird dataset (${response.status}).`);
    }

    return {
      dataset: parseBirdData(await response.text()),
      source: `Local dataset (${BIRD_DATA_URL})`
    };
  }

  function applyBirdDataset(datasetResult) {
    state.birds = datasetResult.dataset.birds;
    state.families = datasetResult.dataset.families;
    state.birdsLoaded = true;
    state.birdsSource = datasetResult.source;
    state.lastLoadedAt = new Date().toISOString();
    saveBirdCache(datasetResult.dataset, datasetResult.source);
  }

  async function loadBirdDataset(forceRefresh) {
    if (state.birdsLoading) return;
    if (state.birdsLoaded && !forceRefresh) return;

    state.birdsLoading = true;
    state.birdsError = '';
    renderBirdHeaderStatus();

    const errors = [];

    try {
      try {
        const excelResult = await loadBirdDataFromExcel();
        applyBirdDataset(excelResult);
      } catch (excelError) {
        errors.push(excelError && excelError.message ? excelError.message : 'Excel birds source unavailable.');
        const tsvResult = await loadBirdDataFromTsv(forceRefresh);
        applyBirdDataset(tsvResult);
      }

      if (state.activeBirdView === 'detail' && !findBirdById(state.selectedBirdId)) {
        state.selectedBirdId = '';
        state.activeBirdView = 'explorer';
      }

      renderBirds();
    } catch (error) {
      errors.push(error && error.message ? error.message : 'Unable to load birds data.');
      const cached = loadBirdCache();

      if (cached) {
        state.birds = cached.birds;
        state.families = cached.families;
        state.birdsLoaded = true;
        state.birdsSource = `Cached dataset (${cached.source || 'local cache'})`;
        state.lastLoadedAt = cached.cachedAt || new Date().toISOString();
        state.birdsError = `Live sources unavailable. Using cached bird data. ${errors.join(' | ')}`;
        renderBirds();
      } else {
        state.birdsError = errors.join(' | ');
        renderBirdHeaderStatus();
        renderBirdError();
      }
    } finally {
      state.birdsLoading = false;
      renderBirdHeaderStatus();
    }
  }

  function findBirdById(birdId) {
    if (!birdId) return null;
    return state.birds.find((bird) => bird.id === birdId) || null;
  }

  function getBirdStatusKey(bird) {
    return bird && (bird.canonicalId || bird.id);
  }

  function isBirdSighted(bird) {
    return Boolean(state.sightings[getBirdStatusKey(bird)]);
  }

  function isBirdFavorited(bird) {
    return state.favorites.includes(bird.id);
  }

  function toggleBirdFavorite(birdId) {
    if (!birdId) return;
    const has = state.favorites.includes(birdId);
    state.favorites = has
      ? state.favorites.filter((id) => id !== birdId)
      : state.favorites.concat([birdId]);
    saveFavorites();
    enqueueSyncAction('favorite-toggle', { birdId, favorited: !has });
    renderBirdExplorerList();
    if (state.activeBirdView === 'detail') renderBirdDetail();
    renderSyncStatusPanel();
  }

  function getSightingDate(bird) {
    const entry = state.sightings[getBirdStatusKey(bird)];
    if (!entry || !entry.sightedAt) return null;
    const parsed = new Date(entry.sightedAt);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function countSightedBirds(birds) {
    return birds.filter(isBirdSighted).length;
  }

  function enqueueSyncAction(type, payload) {
    state.syncQueue.push({
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      payload,
      queuedAt: new Date().toISOString()
    });
    saveSyncQueue();
  }

  function isValidLatLng(lat, lng) {
    if (lat === '' || lng === '') return false;
    const latNum = Number(lat);
    const lngNum = Number(lng);
    return !Number.isNaN(latNum) && !Number.isNaN(lngNum) && latNum >= -90 && latNum <= 90 && lngNum >= -180 && lngNum <= 180;
  }

  function readAttachmentName(inputId) {
    const input = document.getElementById(inputId);
    if (!input || !input.files || !input.files[0]) return '';
    return input.files[0].name || '';
  }

  function getBirdLogBySpeciesKey(statusKey) {
    return state.sightingLog.filter((entry) => entry.speciesStatusKey === statusKey);
  }

  function updateBirdingStatusFromLog() {
    const latestByKey = {};
    state.sightingLog.forEach((entry) => {
      if (!entry || !entry.speciesStatusKey) return;
      const current = latestByKey[entry.speciesStatusKey];
      if (!current || new Date(entry.dateObserved).getTime() > new Date(current.dateObserved).getTime()) {
        latestByKey[entry.speciesStatusKey] = entry;
      }
    });

    const nextSightings = {};
    Object.values(latestByKey).forEach((entry) => {
      nextSightings[entry.speciesStatusKey] = {
        sightedAt: entry.dateObserved,
        source: 'log'
      };
    });
    state.sightings = nextSightings;
    saveSightings();
  }

  function addConflictIfNeeded(newEntry) {
    const duplicate = state.sightingLog.find((entry) => (
      entry.id !== newEntry.id
      && entry.speciesStatusKey === newEntry.speciesStatusKey
      && entry.dateObserved === newEntry.dateObserved
      && entry.locationName === newEntry.locationName
      && entry.notes !== newEntry.notes
    ));

    if (!duplicate) return;

    state.syncConflicts.push({
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      localEntryId: newEntry.id,
      remoteLikeEntryId: duplicate.id,
      speciesName: newEntry.speciesName,
      createdAt: new Date().toISOString(),
      resolution: 'pending'
    });
    saveSyncConflicts();
  }

  function addSightingLogEntry(entry) {
    state.sightingLog.unshift(entry);
    state.sightingLog = state.sightingLog.slice(0, 600);
    saveSightingLog();
    addConflictIfNeeded(entry);
    updateBirdingStatusFromLog();
    enqueueSyncAction('log-sighting', entry);
  }

  function getLogEntriesByDay() {
    const byDay = {};
    state.sightingLog.forEach((entry) => {
      const parsed = parseObservedDate(entry.dateObserved || entry.createdAt);
      const key = getDateKey(parsed);
      if (!key) return;
      if (!byDay[key]) byDay[key] = [];
      byDay[key].push(entry);
    });
    return byDay;
  }

  function getDailyMicroChallenges(stats) {
    const todayKey = getDateKey(new Date());
    const pool = (BIRD_PROGRESSION_SPEC.dailyChallengeDefs || []).map((definition) => toProgressionCard(definition, stats));
    return pickDeterministic(pool, BIRD_PROGRESSION_SPEC.dailyPickCount || 3, `daily:${todayKey}`);
  }

  function computeStreakMetrics(dayEntries) {
    const today = new Date();
    const todayKey = getDateKey(today);
    const loggedDays = new Set(Object.keys(dayEntries));
    const frozenDays = new Set((state.gamification.streak.frozenDates || []).filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value))));

    const hasActivityOn = (date) => {
      const key = getDateKey(date);
      return loggedDays.has(key) || frozenDays.has(key);
    };

    const countBack = (startDate) => {
      const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      let count = 0;
      while (hasActivityOn(cursor)) {
        count += 1;
        cursor.setDate(cursor.getDate() - 1);
      }
      return count;
    };

    const currentStreak = countBack(today);
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    const atRiskStreak = !loggedDays.has(todayKey) && !frozenDays.has(todayKey) ? countBack(yesterday) : 0;
    const freezeCredits = Math.max(0, Number(state.gamification.streak.freezeCredits) || 0);
    const freezeAvailable = atRiskStreak > 0 && freezeCredits > 0;

    return {
      todayKey,
      currentStreak,
      atRiskStreak,
      freezeCredits,
      freezeAvailable,
      loggedToday: loggedDays.has(todayKey),
      frozenToday: frozenDays.has(todayKey)
    };
  }

  function applyStreakAwards(streakMetrics) {
    const streakState = state.gamification.streak;
    const best = Math.max(Number(streakState.bestStreak) || 0, streakMetrics.currentStreak);
    let changed = false;
    if (best !== streakState.bestStreak) {
      streakState.bestStreak = best;
      changed = true;
    }

    const cadence = Math.max(1, Number(BIRD_PROGRESSION_SPEC.streak.freezeAwardEveryDays) || 7);
    const maxCredits = Math.max(0, Number(BIRD_PROGRESSION_SPEC.streak.maxFreezeCredits) || 3);
    const milestone = Math.floor(streakMetrics.currentStreak / cadence);
    if (milestone > (Number(streakState.lastAwardedMilestone) || 0)) {
      const delta = milestone - (Number(streakState.lastAwardedMilestone) || 0);
      streakState.lastAwardedMilestone = milestone;
      streakState.freezeCredits = Math.min(maxCredits, (Number(streakState.freezeCredits) || 0) + delta);
      changed = true;
      if (typeof window.showToast === 'function' && delta > 0) {
        window.showToast('Streak reward unlocked: +1 freeze credit', 'success', 2400);
      }
    }

    if (changed) saveGamificationState();
  }

  function getBingoObjectiveDefinitions(stats) {
    return (BIRD_PROGRESSION_SPEC.bingoObjectiveDefs || []).map((definition) => {
      const card = toProgressionCard(definition, stats);
      return {
        id: card.id,
        label: card.label,
        goal: card.goal,
        progress: card.progress,
        xp: card.xp,
        pct: card.pct,
        completed: card.completed
      };
    });
  }

  function getSeasonalBingo(stats) {
    const seasonKey = getSeasonWindow(new Date(), stats.currentSeason).key;
    const bingoStore = state.gamification.bingo.bySeason;
    if (!bingoStore[seasonKey]) bingoStore[seasonKey] = { rerollsUsed: 0, objectiveIds: [] };
    const seasonState = bingoStore[seasonKey];
    const tileCount = BIRD_PROGRESSION_SPEC.bingo.tileCount || 9;

    const objectives = getBingoObjectiveDefinitions(stats);
    if (!Array.isArray(seasonState.objectiveIds) || seasonState.objectiveIds.length !== tileCount) {
      seasonState.objectiveIds = pickDeterministic(objectives.map((item) => item.id), tileCount, `bingo:${seasonKey}:0`);
      saveGamificationState();
    }

    const objectiveMap = {};
    objectives.forEach((item) => { objectiveMap[item.id] = item; });
    const tiles = seasonState.objectiveIds
      .map((id) => objectiveMap[id])
      .filter(Boolean);
    const completedCount = tiles.filter((tile) => tile.completed).length;

    return {
      seasonKey,
      rerollsUsed: Number(seasonState.rerollsUsed) || 0,
      canReroll: (Number(seasonState.rerollsUsed) || 0) < (BIRD_PROGRESSION_SPEC.bingo.rerollLimitPerSeason || 1),
      tiles,
      completedCount,
      bingoAchieved: completedCount >= (BIRD_PROGRESSION_SPEC.bingo.badgeGoalTiles || 3)
    };
  }

  function rerollSeasonBingo(stats) {
    const seasonKey = getSeasonWindow(new Date(), stats.currentSeason).key;
    const bingoStore = state.gamification.bingo.bySeason;
    if (!bingoStore[seasonKey]) bingoStore[seasonKey] = { rerollsUsed: 0, objectiveIds: [] };
    const seasonState = bingoStore[seasonKey];

    if ((Number(seasonState.rerollsUsed) || 0) >= (BIRD_PROGRESSION_SPEC.bingo.rerollLimitPerSeason || 1)) {
      if (typeof window.showToast === 'function') window.showToast('You already used your seasonal bingo reroll.', 'info', 2200);
      return;
    }

    const objectives = getBingoObjectiveDefinitions(stats);
    seasonState.rerollsUsed = (Number(seasonState.rerollsUsed) || 0) + 1;
    seasonState.objectiveIds = pickDeterministic(
      objectives.map((item) => item.id),
      BIRD_PROGRESSION_SPEC.bingo.tileCount || 9,
      `bingo:${seasonKey}:${seasonState.rerollsUsed}`
    );
    saveGamificationState();
    renderBirds();
  }

  function useStreakFreezeToday() {
    const byDay = getLogEntriesByDay();
    const streak = computeStreakMetrics(byDay);
    if (!streak.freezeAvailable) {
      if (typeof window.showToast === 'function') window.showToast('Freeze is not available right now.', 'info', 2200);
      return;
    }

    state.gamification.streak.freezeCredits = Math.max(0, (Number(state.gamification.streak.freezeCredits) || 0) - 1);
    const frozenDates = new Set(state.gamification.streak.frozenDates || []);
    frozenDates.add(streak.todayKey);
    state.gamification.streak.frozenDates = Array.from(frozenDates).sort();
    saveGamificationState();

    if (typeof window.showToast === 'function') {
      window.showToast('Streak freeze used for today. Your streak is protected.', 'success', 2400);
    }
    renderBirds();
  }

  async function processSyncQueue() {
    state.lastSyncAttemptAt = new Date().toISOString();
    if (!window.accessToken) {
      renderSyncStatusPanel();
      return;
    }

    // This queue currently provides resilient local-first behavior and status visibility.
    // Excel row writes can be attached here once table schema for sightings log is finalized.
    state.syncQueue = [];
    state.lastSyncSuccessAt = new Date().toISOString();
    saveSyncQueue();
    renderSyncStatusPanel();
  }

  function resolveSyncConflict(conflictId, strategy) {
    const conflict = state.syncConflicts.find((item) => item.id === conflictId);
    if (!conflict) return;
    conflict.resolution = strategy;
    conflict.resolvedAt = new Date().toISOString();
    state.syncConflicts = state.syncConflicts.filter((item) => item.id !== conflictId);
    saveSyncConflicts();
    renderSyncStatusPanel();
  }

  function logSightingFromForm() {
    const speciesSelect = document.getElementById('birdsLogSpeciesSelect');
    const dateInput = document.getElementById('birdsLogDateInput');
    const locationInput = document.getElementById('birdsLogLocationInput');
    const countInput = document.getElementById('birdsLogCountInput');
    const regionInput = document.getElementById('birdsLogRegionInput');
    const habitatInput = document.getElementById('birdsLogHabitatInput');
    const latInput = document.getElementById('birdsLogLatInput');
    const lngInput = document.getElementById('birdsLogLngInput');
    const confidenceInput = document.getElementById('birdsLogConfidenceInput');
    const notesInput = document.getElementById('birdsLogNotesInput');

    const selectedBird = findBirdById(speciesSelect ? speciesSelect.value : '');
    if (!selectedBird) {
      if (typeof window.showToast === 'function') window.showToast('Pick a species before logging.', 'info', 2000);
      return;
    }

    const dateObserved = dateInput && dateInput.value ? dateInput.value : new Date().toISOString().slice(0, 10);
    const locationName = locationInput ? locationInput.value.trim() : '';
    const count = Math.max(1, Number(countInput && countInput.value ? countInput.value : 1) || 1);
    const region = regionInput ? (regionInput.value || '').trim().toLowerCase() : '';
    const habitat = habitatInput ? (habitatInput.value || '').trim().toLowerCase() : '';
    const lat = latInput ? latInput.value : '';
    const lng = lngInput ? lngInput.value : '';
    const confidence = confidenceInput ? confidenceInput.value : 'certain';
    const notes = notesInput ? notesInput.value.trim() : '';

    const hasCoords = isValidLatLng(lat, lng);

    const entry = {
      id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      speciesId: selectedBird.id,
      speciesStatusKey: getBirdStatusKey(selectedBird),
      canonicalId: selectedBird.canonicalId || selectedBird.id,
      speciesName: selectedBird.speciesName,
      familyLabel: selectedBird.familyLabel,
      dateObserved,
      locationName,
      count,
      region,
      habitat,
      latitude: hasCoords ? Number(lat) : null,
      longitude: hasCoords ? Number(lng) : null,
      confidence,
      notes,
      photoName: readAttachmentName('birdsLogPhotoInput'),
      audioName: readAttachmentName('birdsLogAudioInput'),
      createdAt: new Date().toISOString(),
      synced: false
    };

    addSightingLogEntry(entry);
    state.logSuccessMessage = `Saved ${selectedBird.speciesName} for ${dateObserved}${locationName ? ` at ${locationName}` : ''}.`;
    if (typeof window.showToast === 'function') {
      window.showToast(`Logged sighting: ${selectedBird.speciesName}`, 'success', 2200);
    }

    if (locationInput) locationInput.value = '';
    if (notesInput) notesInput.value = '';
    if (countInput) countInput.value = '1';
    if (latInput) latInput.value = '';
    if (lngInput) lngInput.value = '';
    const photoInput = document.getElementById('birdsLogPhotoInput');
    if (photoInput) photoInput.value = '';
    const audioInput = document.getElementById('birdsLogAudioInput');
    if (audioInput) audioInput.value = '';

    renderBirds();
  }

  function getBirdStats() {
    const allBirds = state.birds;
    const now = new Date();
    const weekStart = getStartOfWeek(now);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const quarterStart = getCurrentQuarterStart(now);
    const yearStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const currentSeason = getCurrentSeason();
    const seasonWindow = getSeasonWindow(now, currentSeason);
    const dayEntries = getLogEntriesByDay();
    const todayKey = getDateKey(now);
    const todayEntries = dayEntries[todayKey] || [];

    const sightedBirds = allBirds.filter(isBirdSighted);
    const rareSightedBirds = sightedBirds.filter((bird) => bird.rarity.weight >= RARITY_META.rare.weight);
    const veryRareSightedBirds = sightedBirds.filter((bird) => bird.rarity.weight >= RARITY_META.veryRare.weight);
    const migrationSightedBirds = sightedBirds.filter((bird) => bird.seasons.tokens.includes('migration'));
    const commonSightedBirds = sightedBirds.filter((bird) => bird.rarity.key === 'common');
    const inSeasonBirds = allBirds.filter((bird) => bird.seasons.tokens.includes(currentSeason));
    const inSeasonSightedBirds = inSeasonBirds.filter(isBirdSighted);

    const weeklySighted = sightedBirds.filter((bird) => {
      const sightedAt = getSightingDate(bird);
      return sightedAt && sightedAt >= weekStart;
    });

    const monthlySighted = sightedBirds.filter((bird) => {
      const sightedAt = getSightingDate(bird);
      return sightedAt && sightedAt >= monthStart;
    });

    const quarterlySighted = sightedBirds.filter((bird) => {
      const sightedAt = getSightingDate(bird);
      return sightedAt && sightedAt >= quarterStart;
    });

    const yearlySighted = sightedBirds.filter((bird) => {
      const sightedAt = getSightingDate(bird);
      return sightedAt && sightedAt >= yearStart;
    });

    const allLogEntries = state.sightingLog.slice();
    const weeklyLogEntries = allLogEntries.filter((entry) => {
      const observed = parseObservedDate(entry.dateObserved || entry.createdAt);
      return observed && observed >= weekStart;
    });
    const monthlyLogEntries = allLogEntries.filter((entry) => {
      const observed = parseObservedDate(entry.dateObserved || entry.createdAt);
      return observed && observed >= monthStart;
    });
    const seasonalLogEntries = allLogEntries.filter((entry) => {
      const observed = parseObservedDate(entry.dateObserved || entry.createdAt);
      return observed && observed >= seasonWindow.start && observed < seasonWindow.end;
    });

    const todayUniqueSpeciesCount = new Set(todayEntries.map((entry) => entry.speciesStatusKey).filter(Boolean)).size;
    const todayDistinctRegionCount = new Set(todayEntries.map((entry) => norm(entry.region)).filter(Boolean)).size;
    const todayDistinctHabitatCount = new Set(todayEntries.map((entry) => norm(entry.habitat)).filter(Boolean)).size;
    const todayCertainCount = todayEntries.filter((entry) => norm(entry.confidence) === 'certain').length;
    const todayRareLogCount = todayEntries.filter((entry) => {
      const bird = findBirdById(entry.speciesId);
      return bird && bird.rarity.weight >= RARITY_META.rare.weight;
    }).length;

    const seasonRegionCount = new Set(seasonalLogEntries.map((entry) => norm(entry.region)).filter(Boolean)).size;
    const seasonHabitatCount = new Set(seasonalLogEntries.map((entry) => norm(entry.habitat)).filter(Boolean)).size;
    const streak = computeStreakMetrics(dayEntries);
    applyStreakAwards(streak);

    const familyProgress = state.families.map((family) => {
      const sightedCount = countSightedBirds(family.species);
      return {
        ...family,
        sightedCount,
        completionPct: family.species.length ? Math.round((sightedCount / family.species.length) * 100) : 0,
        completed: family.species.length > 0 && sightedCount === family.species.length,
        started: sightedCount > 0
      };
    });

    return {
      currentSeason,
      currentSeasonLabel: SEASON_META[currentSeason].label,
      totalBirds: allBirds.length,
      totalSighted: sightedBirds.length,
      rareSightedCount: rareSightedBirds.length,
      veryRareSightedCount: veryRareSightedBirds.length,
      migrationSightedCount: migrationSightedBirds.length,
      commonSightedCount: commonSightedBirds.length,
      inSeasonCount: inSeasonBirds.length,
      inSeasonSightedCount: inSeasonSightedBirds.length,
      familiesStarted: familyProgress.filter((family) => family.started).length,
      familiesCompleted: familyProgress.filter((family) => family.completed).length,
      weeklySightedCount: weeklySighted.length,
      monthlySightedCount: monthlySighted.length,
      quarterlySightedCount: quarterlySighted.length,
      yearlySightedCount: yearlySighted.length,
      weeklyLogCount: weeklyLogEntries.length,
      monthlyLogCount: monthlyLogEntries.length,
      seasonalLogCount: seasonalLogEntries.length,
      seasonWindowKey: seasonWindow.key,
      todayLogCount: todayEntries.length,
      todayUniqueSpeciesCount,
      todayDistinctRegionCount,
      todayDistinctHabitatCount,
      todayCertainCount,
      todayRareLogCount,
      seasonRegionCount,
      seasonHabitatCount,
      streak,
      familyProgress
    };
  }

  function getBirdChallenges(stats) {
    return (BIRD_PROGRESSION_SPEC.challengeDefs || []).map((definition) => toProgressionCard(definition, stats));
  }

  function getBirdBadges(stats) {
    const badges = (BIRD_PROGRESSION_SPEC.badgeDefs || []).map((definition) => ({
      ...toProgressionCard(definition, stats),
      rarity: definition.rarity || 'common'
    }));

    return badges.map((badge) => {
      const rarityClass = badge.rarity === 'legendary'
        ? 'badge-rarity-legendary'
        : badge.rarity === 'epic'
          ? 'badge-rarity-epic'
          : badge.rarity === 'rare'
            ? 'badge-rarity-rare'
            : 'badge-rarity-common';

      return {
        ...badge,
        rarityClass,
        completed: badge.progress >= badge.goal,
        pct: Math.max(0, Math.min(100, Math.round((badge.progress / badge.goal) * 100)))
      };
    });
  }

  function renderBirdHeaderStatus() {
    const syncBadge = document.getElementById('natureSyncHealthBadge');
    const syncMeta = document.getElementById('natureSyncMeta');
    if (!syncBadge || !syncMeta) return;

    syncBadge.classList.remove('ok', 'warn');

    if (state.birdsLoading) {
      syncBadge.textContent = 'Bird data: loading...';
      syncMeta.textContent = 'Refreshing bird species source...';
      return;
    }

    if (state.birdsError && !state.birdsLoaded) {
      syncBadge.classList.add('warn');
      syncBadge.textContent = 'Bird data: unavailable';
      syncMeta.textContent = state.birdsError;
      return;
    }

    if (!state.birdsLoaded) {
      syncBadge.textContent = 'Bird data: waiting';
      syncMeta.textContent = 'Bird dataset has not been loaded yet.';
      return;
    }

    syncBadge.classList.add(state.birdsError ? 'warn' : 'ok');
    syncBadge.textContent = state.birdsError ? 'Bird data: fallback in use' : 'Bird data: ready';
    const source = state.birdsSource ? `Source: ${state.birdsSource}` : 'Source: unknown';
    const updated = state.lastLoadedAt ? new Date(state.lastLoadedAt).toLocaleString() : '--';
    const warning = state.birdsError ? ` | ${state.birdsError}` : '';
    syncMeta.textContent = `${state.birds.length} species | ${source} | Updated ${updated}${warning}`;
  }

  function renderBirdLegend(stats) {
    const container = document.getElementById('birdsVisualLegend');
    if (!container) return;

    container.innerHTML = `
      <div class="nature-legend-card">
        <div class="nature-legend-title">Rarity markers</div>
        <div class="nature-chip-row nature-chip-row--wrap">
          ${Object.values(RARITY_META).map((rarity) => `<span class="nature-chip ${rarity.className}">${escapeHtml(rarity.label)}</span>`).join('')}
        </div>
      </div>
      <div class="nature-legend-card">
        <div class="nature-legend-title">Season markers</div>
        <div class="nature-chip-row nature-chip-row--wrap">
          ${Object.entries(SEASON_META).map(([key, season]) => `<span class="nature-chip ${season.className} ${key === stats.currentSeason ? 'is-current' : ''}">${escapeHtml(season.label)}</span>`).join('')}
        </div>
      </div>
      <div class="nature-legend-card">
        <div class="nature-legend-title">Explorer flow</div>
        <div class="nature-legend-copy">Use <strong>Explore Bird Species</strong> to browse searchable species cards, then open a species detail page with all available fields from your bird records.</div>
      </div>
    `;
  }

  function renderBirdStats(stats) {
    const setText = (id, value) => {
      const element = document.getElementById(id);
      if (element) element.textContent = String(value);
    };

    setText('birdsTotalSighted', stats.totalSighted);
    setText('birdsTotalSpecies', stats.totalBirds);
    setText('birdsInSeasonSighted', stats.inSeasonSightedCount);
    setText('birdsRareSighted', stats.rareSightedCount);
    setText('birdsFamiliesCompleted', stats.familiesCompleted);
    setText('birdsMigrationSighted', stats.migrationSightedCount);

    const snapshot = document.getElementById('birdsProgressSnapshot');
    if (snapshot) {
      snapshot.innerHTML = `
        <strong>${escapeHtml(stats.currentSeasonLabel)} focus:</strong>
        ${stats.inSeasonSightedCount} of ${stats.inSeasonCount} currently available species marked sighted | 
        ${stats.weeklySightedCount} this week | ${stats.monthlySightedCount} this month | ${stats.quarterlySightedCount} this quarter | ${stats.yearlySightedCount} this year | 
        Streak: ${stats.streak.currentStreak} day(s) (${stats.streak.freezeCredits} freeze credit${stats.streak.freezeCredits === 1 ? '' : 's'}).
      `;
    }
  }

  function getSeasonQuestline(stats) {
    const steps = (BIRD_PROGRESSION_SPEC.seasonQuestDefs || []).map((definition) => toProgressionCard(definition, stats));

    return {
      steps,
      completedCount: steps.filter((step) => step.completed).length
    };
  }

  function renderBirdChallenges(challenges) {
    const container = document.getElementById('birdsChallengeGrid');
    if (!container) return;

    container.innerHTML = challenges.map((challenge) => `
      <div class="nature-challenge-card ${challenge.completed ? 'completed' : ''}">
        <div class="nature-challenge-card-header">${escapeHtml(challenge.icon)} ${escapeHtml(challenge.title)}</div>
        <div class="nature-challenge-card-description">${escapeHtml(challenge.description)}</div>
        <div class="nature-challenge-progress"><div class="nature-challenge-progress-fill" style="width:${challenge.pct}%;"></div></div>
        <div class="nature-challenge-meta"><span>${challenge.progress}/${challenge.goal}</span><span>${challenge.completed ? 'Complete' : `${challenge.pct}%`}</span></div>
      </div>
    `).join('');
  }

  function renderBirdBadges(badges) {
    const container = document.getElementById('birdsBadgeGrid');
    if (!container) return;

    container.innerHTML = badges.map((badge) => `
      <div class="nature-badge-card ${badge.completed ? 'unlocked' : 'locked'} ${badge.rarityClass}">
        <div class="nature-badge-icon">${escapeHtml(badge.icon)}</div>
        <div class="nature-badge-card-title">${escapeHtml(badge.title)}</div>
        <div class="nature-badge-card-description">${escapeHtml(badge.description)}</div>
        <div class="nature-badge-progress">${badge.progress}/${badge.goal}</div>
        <div class="nature-progress-track"><div class="nature-progress-fill" style="width:${badge.pct}%;"></div></div>
      </div>
    `).join('');
  }

  function renderBirdDailyChallenges(challenges) {
    const container = document.getElementById('birdsDailyChallengeGrid');
    if (!container) return;

    container.innerHTML = challenges.map((challenge) => `
      <div class="nature-challenge-card ${challenge.completed ? 'completed' : ''}">
        <div class="nature-challenge-card-header">${escapeHtml(challenge.icon)} ${escapeHtml(challenge.title)}</div>
        <div class="nature-challenge-card-description">${escapeHtml(challenge.description)}</div>
        <div class="nature-challenge-progress"><div class="nature-challenge-progress-fill" style="width:${challenge.pct}%;"></div></div>
        <div class="nature-challenge-meta"><span>${challenge.progress}/${challenge.goal}</span><span>${challenge.completed ? 'Complete' : `${challenge.pct}%`}</span></div>
      </div>
    `).join('');
  }

  function renderBirdStreakPanel(streak) {
    const body = document.getElementById('birdsStreakSummary');
    const freezeBtn = document.getElementById('birdsUseFreezeBtn');
    const streakValue = document.getElementById('birdsCurrentStreakStat');
    if (!body || !freezeBtn || !streakValue) return;

    const riskLine = streak.atRiskStreak > 0 && !streak.frozenToday
      ? `Streak at risk: ${streak.atRiskStreak} days. Use a freeze to protect today.`
      : 'Streak is active and protected.';

    streakValue.textContent = String(streak.currentStreak);

    body.innerHTML = `
      <div>Best: ${Math.max(streak.currentStreak, Number(state.gamification.streak.bestStreak) || 0)} days</div>
      <div>Freeze credits: ${streak.freezeCredits}</div>
      <div>${escapeHtml(riskLine)}</div>
    `;

    freezeBtn.disabled = !streak.freezeAvailable;
    freezeBtn.textContent = streak.freezeAvailable ? 'Use Freeze Today' : 'Freeze Unavailable';
  }

  function renderBirdLogView(stats) {
    const banner = document.getElementById('birdsLogSuccessBanner');
    const trendStats = document.getElementById('birdsLogTrendStats');
    const timeline = document.getElementById('birdsLogTimeline');
    if (!banner || !trendStats || !timeline) return;

    banner.hidden = !state.logSuccessMessage;
    banner.textContent = state.logSuccessMessage || '';

    trendStats.innerHTML = `
      <div class="nature-stat-card">
        <div class="nature-stat-label">Today</div>
        <div class="nature-stat-value">${stats.todayLogCount}</div>
        <div class="nature-stat-sub">logs today</div>
      </div>
      <div class="nature-stat-card">
        <div class="nature-stat-label">This Week</div>
        <div class="nature-stat-value">${stats.weeklyLogCount}</div>
        <div class="nature-stat-sub">entries this week</div>
      </div>
      <div class="nature-stat-card">
        <div class="nature-stat-label">Unique Today</div>
        <div class="nature-stat-value">${stats.todayUniqueSpeciesCount}</div>
        <div class="nature-stat-sub">species logged today</div>
      </div>
    `;

    const recentEntries = state.sightingLog.slice(0, 6);
    if (recentEntries.length === 0) {
      timeline.innerHTML = '<div class="nature-empty-state">No sightings logged yet. Your newest entries will appear here.</div>';
      return;
    }

    timeline.innerHTML = recentEntries.map((entry) => {
      const when = parseObservedDate(entry.dateObserved || entry.createdAt);
      const location = entry.locationName ? ` • ${escapeHtml(entry.locationName)}` : '';
      const context = [entry.region, entry.habitat].filter(Boolean).map((value) => escapeHtml(value)).join(' • ');
      return `
        <div class="nature-log-item">
          <strong>${escapeHtml(entry.speciesName)}</strong> • ${escapeHtml(when ? when.toLocaleDateString() : entry.dateObserved || '--')}${location}
          <div>${escapeHtml(entry.confidence || 'certain')} confidence${context ? ` • ${context}` : ''}</div>
          ${entry.notes ? `<div>${escapeHtml(entry.notes)}</div>` : ''}
        </div>
      `;
    }).join('');
  }

  function renderBirdBingoPanel(bingo) {
    const meta = document.getElementById('birdsBingoMeta');
    const grid = document.getElementById('birdsBingoGrid');
    const rerollBtn = document.getElementById('birdsBingoRefreshBtn');
    if (!meta || !grid || !rerollBtn) return;

    meta.textContent = `${bingo.completedCount}/9 tiles complete${bingo.bingoAchieved ? ' | Bingo unlocked!' : ''}`;
    grid.innerHTML = bingo.tiles.map((tile) => `
      <div class="nature-badge-card ${tile.completed ? 'unlocked' : 'locked'}">
        <div class="nature-badge-card-title">${escapeHtml(tile.label)}</div>
        <div class="nature-badge-progress">${tile.progress}/${tile.goal}</div>
        <div class="nature-progress-track"><div class="nature-progress-fill" style="width:${tile.pct}%;"></div></div>
      </div>
    `).join('');

    rerollBtn.disabled = !bingo.canReroll;
    rerollBtn.textContent = bingo.canReroll ? 'Reroll Bingo Card (1/season)' : 'Bingo Reroll Used';
  }

  function renderSeasonQuestlinePanel(questline, stats) {
    const container = document.getElementById('birdsSeasonQuestGrid');
    const meta = document.getElementById('birdsSeasonQuestMeta');
    if (!container || !meta) return;

    meta.textContent = `${stats.currentSeasonLabel} chapter: ${questline.completedCount}/${questline.steps.length} steps completed`;
    container.innerHTML = questline.steps.map((step) => `
      <div class="nature-challenge-card ${step.completed ? 'completed' : ''}">
        <div class="nature-challenge-card-header">${escapeHtml(step.icon)} ${escapeHtml(step.title)}</div>
        <div class="nature-challenge-card-description">${escapeHtml(step.description)}</div>
        <div class="nature-challenge-progress"><div class="nature-challenge-progress-fill" style="width:${step.pct}%;"></div></div>
        <div class="nature-challenge-meta"><span>${step.progress}/${step.goal}</span><span>${step.completed ? 'Complete' : `${step.pct}%`}</span></div>
      </div>
    `).join('');
  }


  function getBirdSearchQuery() {
    return norm(state.birdSearch);
  }

  function updateFamilyFilterOptions() {
    const select = document.getElementById('birdsExplorerFamilyFilter');
    const familyChipGroup = document.getElementById('birdsFamilyChipGroup');
    if ((!select && !familyChipGroup) || !state.birdsLoaded) return;
    const current = state.birdFilters.family;
    const families = Array.from(new Set(state.birds.map((bird) => bird.familyLabel))).sort((a, b) => a.localeCompare(b));
    if (select) {
      select.innerHTML = '<option value="all">Family: All</option>' + families.map((family) => `<option value="${escapeHtml(family)}">${escapeHtml(family)}</option>`).join('');
    }

    if (familyChipGroup) {
      familyChipGroup.innerHTML = '<span class="nature-chip-filter-label">Family chips</span>' + families.map((family) => {
        const isActive = state.birdFilters.familyChips.includes(family);
        return `<button type="button" class="nature-chip-filter ${isActive ? 'is-active' : ''}" data-birds-filter-chip="family" data-chip-value="${escapeHtml(family)}">${escapeHtml(family)}</button>`;
      }).join('');
    }

    if (current !== 'all' && families.includes(current)) {
      if (select) select.value = current;
    } else {
      if (select) select.value = 'all';
      state.birdFilters.family = 'all';
    }

    state.birdFilters.familyChips = state.birdFilters.familyChips.filter((value) => families.includes(value));
  }

  function setChipButtonState() {
    const chipButtons = document.querySelectorAll('#birdsExplorerQuickFilterBar [data-birds-filter-chip]');
    chipButtons.forEach((button) => {
      const group = button.getAttribute('data-birds-filter-chip');
      const value = button.getAttribute('data-chip-value') || '';
      let active = false;
      if (group === 'season') active = state.birdFilters.seasonChips.includes(value);
      if (group === 'rarity') active = state.birdFilters.rarityChips.includes(value);
      if (group === 'family') active = state.birdFilters.familyChips.includes(value);
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function toggleChipFilter(group, value) {
    if (!group || !value) return;

    const key = group === 'season'
      ? 'seasonChips'
      : group === 'rarity'
        ? 'rarityChips'
        : group === 'family'
          ? 'familyChips'
          : '';
    if (!key) return;

    const list = state.birdFilters[key] || [];
    state.birdFilters[key] = list.includes(value)
      ? list.filter((entry) => entry !== value)
      : list.concat([value]);
  }

  function resetBirdExplorerFilters() {
    state.birdSearch = '';
    state.birdSort = 'family-asc';
    state.birdPageSize = 12;
    state.birdPage = 1;
    state.birdFilters = {
      season: 'all',
      rarity: 'all',
      family: 'all',
      region: 'all',
      habitat: 'all',
      favoritesOnly: false,
      seasonChips: [],
      rarityChips: [],
      familyChips: []
    };
  }

  function clearBirdChipFilters() {
    state.birdFilters.seasonChips = [];
    state.birdFilters.rarityChips = [];
    state.birdFilters.familyChips = [];
  }

  function removeExplorerFilter(filterKey) {
    if (!filterKey) return;

    if (filterKey === 'search') state.birdSearch = '';
    else if (filterKey === 'sort') state.birdSort = 'family-asc';
    else if (filterKey === 'season-select') state.birdFilters.season = 'all';
    else if (filterKey === 'rarity-select') state.birdFilters.rarity = 'all';
    else if (filterKey === 'family-select') state.birdFilters.family = 'all';
    else if (filterKey === 'region-select') state.birdFilters.region = 'all';
    else if (filterKey === 'habitat-select') state.birdFilters.habitat = 'all';
    else if (filterKey === 'favorites-only') state.birdFilters.favoritesOnly = false;
    else if (filterKey.startsWith('season-chip:')) {
      const value = filterKey.slice('season-chip:'.length);
      state.birdFilters.seasonChips = (state.birdFilters.seasonChips || []).filter((entry) => entry !== value);
    } else if (filterKey.startsWith('rarity-chip:')) {
      const value = filterKey.slice('rarity-chip:'.length);
      state.birdFilters.rarityChips = (state.birdFilters.rarityChips || []).filter((entry) => entry !== value);
    } else if (filterKey.startsWith('family-chip:')) {
      const value = filterKey.slice('family-chip:'.length);
      state.birdFilters.familyChips = (state.birdFilters.familyChips || []).filter((entry) => entry !== value);
    }

    state.birdPage = 1;
  }

  function applyExplorerControlsFromState() {
    const searchInput = document.getElementById('birdsSpeciesSearchInput');
    const sortSelect = document.getElementById('birdsExplorerSortSelect');
    const pageSizeSelect = document.getElementById('birdsExplorerPageSizeSelect');
    const seasonSelect = document.getElementById('birdsExplorerSeasonFilter');
    const raritySelect = document.getElementById('birdsExplorerRarityFilter');
    const familySelect = document.getElementById('birdsExplorerFamilyFilter');
    const regionSelect = document.getElementById('birdsExplorerRegionFilter');
    const habitatSelect = document.getElementById('birdsExplorerHabitatFilter');
    const favoritesOnlyToggle = document.getElementById('birdsExplorerFavoritesOnly');

    if (searchInput) searchInput.value = state.birdSearch;
    if (sortSelect) sortSelect.value = state.birdSort;
    if (pageSizeSelect) pageSizeSelect.value = String(state.birdPageSize);
    if (seasonSelect) seasonSelect.value = state.birdFilters.season;
    if (raritySelect) raritySelect.value = state.birdFilters.rarity;
    if (familySelect) familySelect.value = state.birdFilters.family;
    if (regionSelect) regionSelect.value = state.birdFilters.region;
    if (habitatSelect) habitatSelect.value = state.birdFilters.habitat;
    if (favoritesOnlyToggle) favoritesOnlyToggle.checked = Boolean(state.birdFilters.favoritesOnly);
    setChipButtonState();
  }

  function sortExplorerBirds(birds) {
    const sorted = birds.slice();
    const bySpecies = (a, b) => a.speciesName.localeCompare(b.speciesName);

    if (state.birdSort === 'favorites-first') {
      sorted.sort((a, b) => {
        const af = isBirdFavorited(a) ? 1 : 0;
        const bf = isBirdFavorited(b) ? 1 : 0;
        if (bf !== af) return bf - af;
        return a.familyLabel.localeCompare(b.familyLabel) || bySpecies(a, b);
      });
      return sorted;
    }

    if (state.birdSort === 'species-asc') {
      sorted.sort(bySpecies);
      return sorted;
    }

    if (state.birdSort === 'species-desc') {
      sorted.sort((a, b) => bySpecies(b, a));
      return sorted;
    }

    if (state.birdSort === 'rarity-desc') {
      sorted.sort((a, b) => b.rarity.weight - a.rarity.weight || bySpecies(a, b));
      return sorted;
    }

    if (state.birdSort === 'rarity-asc') {
      sorted.sort((a, b) => a.rarity.weight - b.rarity.weight || bySpecies(a, b));
      return sorted;
    }

    if (state.birdSort === 'sighted-recent') {
      sorted.sort((a, b) => {
        const ad = getSightingDate(a);
        const bd = getSightingDate(b);
        const at = ad ? ad.getTime() : -1;
        const bt = bd ? bd.getTime() : -1;
        if (bt !== at) return bt - at;
        return bySpecies(a, b);
      });
      return sorted;
    }

    sorted.sort((a, b) => a.familyLabel.localeCompare(b.familyLabel) || bySpecies(a, b));
    return sorted;
  }

  function renderActiveFilterSummary() {
    const row = document.getElementById('birdsExplorerActiveFiltersRow');
    const pillsContainer = document.getElementById('birdsExplorerActiveFiltersPills');
    if (!row || !pillsContainer) return;

    const sortLabelMap = {
      'family-asc': 'Family / Species (A-Z)',
      'favorites-first': 'Favorites first',
      'species-asc': 'Species (A-Z)',
      'species-desc': 'Species (Z-A)',
      'rarity-desc': 'Rarity (highest first)',
      'rarity-asc': 'Rarity (lowest first)',
      'sighted-recent': 'Recently sighted first'
    };

    const pills = [];
    if (state.birdSearch.trim()) pills.push({ key: 'search', label: `Search: ${state.birdSearch.trim()}` });
    if (state.birdSort !== 'family-asc') pills.push({ key: 'sort', label: `Sort: ${sortLabelMap[state.birdSort] || state.birdSort}` });
    if (state.birdFilters.season !== 'all') pills.push({ key: 'season-select', label: `Season: ${state.birdFilters.season}` });
    if (state.birdFilters.rarity !== 'all') pills.push({ key: 'rarity-select', label: `Rarity: ${state.birdFilters.rarity}` });
    if (state.birdFilters.family !== 'all') pills.push({ key: 'family-select', label: `Family: ${state.birdFilters.family}` });
    if (state.birdFilters.region !== 'all') pills.push({ key: 'region-select', label: `Region: ${state.birdFilters.region}` });
    if (state.birdFilters.habitat !== 'all') pills.push({ key: 'habitat-select', label: `Habitat: ${state.birdFilters.habitat}` });
    if (state.birdFilters.favoritesOnly) pills.push({ key: 'favorites-only', label: 'Favorites only' });
    (state.birdFilters.seasonChips || []).forEach((value) => pills.push({ key: `season-chip:${value}`, label: `Season chip: ${value}` }));
    (state.birdFilters.rarityChips || []).forEach((value) => pills.push({ key: `rarity-chip:${value}`, label: `Rarity chip: ${value}` }));
    (state.birdFilters.familyChips || []).forEach((value) => pills.push({ key: `family-chip:${value}`, label: `Family chip: ${value}` }));

    row.hidden = pills.length === 0;
    pillsContainer.innerHTML = pills.map((pill) => `
      <span class="nature-active-filter-pill">
        ${escapeHtml(pill.label)}
        <button type="button" data-birds-remove-filter="${escapeHtml(pill.key)}" title="Remove filter">x</button>
      </span>
    `).join('');
  }

  function birdHasLoggedContext(bird, type, value) {
    if (!value || value === 'all') return true;
    const statusKey = getBirdStatusKey(bird);
    return state.sightingLog.some((entry) => {
      if (entry.speciesStatusKey !== statusKey) return false;
      return norm(entry[type]) === norm(value);
    });
  }

  function filterBirdsForExplorer() {
    const query = getBirdSearchQuery();

    let filtered = state.birds.filter((bird) => {
      if (state.birdFilters.seasonChips.length > 0 && !state.birdFilters.seasonChips.some((token) => bird.seasons.tokens.includes(token))) return false;
      if (state.birdFilters.rarityChips.length > 0 && !state.birdFilters.rarityChips.includes(bird.rarity.key)) return false;
      if (state.birdFilters.familyChips.length > 0 && !state.birdFilters.familyChips.includes(bird.familyLabel)) return false;
      if (state.birdFilters.season !== 'all' && !bird.seasons.tokens.includes(state.birdFilters.season)) return false;
      if (state.birdFilters.rarity !== 'all' && bird.rarity.key !== state.birdFilters.rarity) return false;
      if (state.birdFilters.family !== 'all' && bird.familyLabel !== state.birdFilters.family) return false;
      if (state.birdFilters.region !== 'all') {
        const regionMatch = norm(bird.defaultRegion) === norm(state.birdFilters.region) || birdHasLoggedContext(bird, 'region', state.birdFilters.region);
        if (!regionMatch) return false;
      }
      if (state.birdFilters.habitat !== 'all') {
        const habitatMatch = norm(bird.defaultHabitat) === norm(state.birdFilters.habitat) || birdHasLoggedContext(bird, 'habitat', state.birdFilters.habitat);
        if (!habitatMatch) return false;
      }
      if (state.birdFilters.favoritesOnly && !isBirdFavorited(bird)) return false;

      if (!query) return true;
      const searchable = [
        bird.speciesName,
        bird.familyLabel,
        bird.genusLabel,
        bird.rarity.label,
        bird.rarity.raw,
        bird.seasons.raw,
        bird.seasons.tokens.join(' '),
        ...Object.values(bird.details || {})
      ].join(' ');
      return norm(searchable).includes(query);
    });

    filtered = sortExplorerBirds(filtered);
    return filtered;
  }

  function renderPinnedFavorites() {
    const section = document.getElementById('birdsPinnedFavoritesSection');
    const meta = document.getElementById('birdsPinnedFavoritesMeta');
    const grid = document.getElementById('birdsPinnedFavoritesGrid');
    if (!section || !meta || !grid) return;

    if (!state.birdsLoaded) {
      section.hidden = true;
      return;
    }

    const pinned = sortExplorerBirds(state.birds.filter((bird) => isBirdFavorited(bird)));
    if (pinned.length === 0) {
      section.hidden = true;
      return;
    }

    section.hidden = false;
    meta.textContent = `${pinned.length} favorited species pinned for quick access.`;
    grid.innerHTML = pinned.map((bird) => {
      const sighted = isBirdSighted(bird);
      const sightedDate = getSightingDate(bird);
      return `
        <div class="adventure-card nature-bird-card ${bird.rarity.className}">
          <div class="adventure-card-header">
            <div class="adventure-card-title">${escapeHtml(bird.speciesName)}</div>
            <div class="adventure-card-location">Family: ${escapeHtml(bird.familyLabel)}</div>
          </div>
          <div class="adventure-card-body">
            <div class="card-subtitle">${sighted ? `Sighted on ${escapeHtml(sightedDate ? sightedDate.toLocaleDateString() : '')}` : 'Not sighted yet'}</div>
          </div>
          <div class="adventure-card-footer">
            <div class="card-action-buttons">
              <button type="button" class="card-btn card-btn-primary" data-bird-open="${escapeHtml(bird.id)}">Open Details</button>
              <button type="button" class="nature-bird-fav-btn is-favorited" data-bird-favorite="${escapeHtml(bird.id)}">★ Favorited</button>
              <button type="button" class="card-btn" data-bird-toggle="${escapeHtml(bird.id)}">${sighted ? 'Mark Not Sighted' : 'Mark Sighted'}</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderBirdExplorerList() {
    const container = document.getElementById('birdsSpeciesCardGrid');
    const meta = document.getElementById('birdsSpeciesSearchMeta');
    if (!container || !meta) return;

    if (!state.birdsLoaded) {
      renderPinnedFavorites();
      renderActiveFilterSummary();
      container.innerHTML = '<div class="nature-empty-state">Bird data is still loading.</div>';
      meta.textContent = 'Loading birds...';
      return;
    }

    updateFamilyFilterOptions();
    applyExplorerControlsFromState();
    renderActiveFilterSummary();
    renderPinnedFavorites();

    const filtered = filterBirdsForExplorer();

    const pageSize = Math.max(1, Number(state.birdPageSize) || 12);
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    state.birdPage = Math.max(1, Math.min(totalPages, Number(state.birdPage) || 1));
    const pageStart = (state.birdPage - 1) * pageSize;
    const pageItems = filtered.slice(pageStart, pageStart + pageSize);

    meta.textContent = `${filtered.length} of ${state.birds.length} species shown | page ${state.birdPage}/${totalPages}`;

    const pageInfo = document.getElementById('birdsExplorerPageInfo');
    const prevBtn = document.getElementById('birdsExplorerPrevPageBtn');
    const nextBtn = document.getElementById('birdsExplorerNextPageBtn');
    if (pageInfo) pageInfo.textContent = `Page ${state.birdPage} of ${totalPages}`;
    if (prevBtn) prevBtn.disabled = state.birdPage <= 1;
    if (nextBtn) nextBtn.disabled = state.birdPage >= totalPages;

    if (filtered.length === 0) {
      container.innerHTML = '<div class="nature-empty-state">No birds matched your search. Try a different keyword.</div>';
      return;
    }

    container.innerHTML = pageItems.map((bird) => {
      const sighted = isBirdSighted(bird);
      const favorited = isBirdFavorited(bird);
      const sightedDate = getSightingDate(bird);
      const seasonChips = bird.seasons.tokens
        .map((seasonKey) => `<span class="nature-chip ${SEASON_META[seasonKey].className}">${escapeHtml(SEASON_META[seasonKey].label)}</span>`)
        .join('');

      return `
        <div class="adventure-card nature-bird-card ${bird.rarity.className}">
          <div class="adventure-card-header">
            <div class="adventure-card-title">${escapeHtml(bird.speciesName)}</div>
            <div class="adventure-card-location">Family: ${escapeHtml(bird.familyLabel)}</div>
            <div class="adventure-card-time">Genus: ${escapeHtml(bird.genusLabel)}</div>
          </div>
          <div class="adventure-card-body">
            <div class="nature-chip-row nature-chip-row--wrap">
              <span class="nature-chip ${bird.rarity.className}">${escapeHtml(bird.rarity.label)}</span>
              ${seasonChips}
            </div>
            <div class="card-subtitle">${sighted ? `Sighted on ${escapeHtml(sightedDate ? sightedDate.toLocaleDateString() : '')}` : 'Not sighted yet'}</div>
          </div>
          <div class="adventure-card-footer">
            <div class="card-action-buttons">
              <button type="button" class="card-btn card-btn-primary" data-bird-open="${escapeHtml(bird.id)}">Open Details</button>
              <button type="button" class="nature-bird-fav-btn ${favorited ? 'is-favorited' : ''}" data-bird-favorite="${escapeHtml(bird.id)}">${favorited ? '★ Favorited' : '☆ Favorite'}</button>
              <button type="button" class="card-btn" data-bird-toggle="${escapeHtml(bird.id)}">${sighted ? 'Mark Not Sighted' : 'Mark Sighted'}</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function orderedBirdDetailEntries(bird) {
    const priority = ['Species (English)', 'Family (English)', 'Genus (English)', 'Seasons Found', 'Rare or Common'];

    const detailEntries = Object.entries(bird.details || {}).filter(([, value]) => String(value || '').trim());

    return detailEntries.sort((a, b) => {
      const aIndex = priority.findIndex((item) => norm(item) === norm(a[0]));
      const bIndex = priority.findIndex((item) => norm(item) === norm(b[0]));
      const av = aIndex === -1 ? 999 : aIndex;
      const bv = bIndex === -1 ? 999 : bIndex;
      if (av !== bv) return av - bv;
      return a[0].localeCompare(b[0]);
    });
  }

  function renderBirdDetail() {
    const container = document.getElementById('birdsSpeciesDetailContent');
    if (!container) return;

    const bird = findBirdById(state.selectedBirdId);
    if (!bird) {
      container.innerHTML = '<div class="card"><div class="nature-empty-state">No bird selected. Go back to the explorer and choose a species card.</div></div>';
      return;
    }

    const sighted = isBirdSighted(bird);
    const favorited = isBirdFavorited(bird);
    const sightedDate = getSightingDate(bird);
    const seasonChips = bird.seasons.tokens
      .map((seasonKey) => `<span class="nature-chip ${SEASON_META[seasonKey].className}">${escapeHtml(SEASON_META[seasonKey].label)}</span>`)
      .join('');

    const detailRows = orderedBirdDetailEntries(bird)
      .map(([key, value]) => `
        <div class="nature-bird-detail-row">
          <div class="nature-bird-detail-label">${escapeHtml(key)}</div>
          <div class="nature-bird-detail-value">${escapeHtml(value)}</div>
        </div>
      `)
      .join('');

    container.innerHTML = `
      <div class="adventure-card nature-bird-card">
        <div class="adventure-card-header">
          <div class="adventure-card-title">${escapeHtml(bird.speciesName)}</div>
          <div class="adventure-card-location">Family: ${escapeHtml(bird.familyLabel)}</div>
          <div class="adventure-card-time">Genus: ${escapeHtml(bird.genusLabel)}</div>
        </div>
        <div class="adventure-card-body">
          <div class="nature-chip-row nature-chip-row--wrap">
            <span class="nature-chip ${bird.rarity.className}">${escapeHtml(bird.rarity.label)}</span>
            ${seasonChips}
          </div>
          <div class="card-subtitle">${sighted ? `Sighted on ${escapeHtml(sightedDate ? sightedDate.toLocaleDateString() : '')}` : 'Not sighted yet'}</div>
          <button type="button" class="nature-bird-fav-btn ${favorited ? 'is-favorited' : ''}" data-bird-favorite="${escapeHtml(bird.id)}">${favorited ? '★ Favorited' : '☆ Favorite'}</button>
          <button type="button" class="card-btn" data-bird-toggle="${escapeHtml(bird.id)}">${sighted ? 'Mark Not Sighted' : 'Mark Sighted'}</button>
          <div class="nature-bird-detail-list">${detailRows}</div>
        </div>
      </div>
    `;
  }

  function renderBirdError() {
    [
      'birdsDailyChallengeGrid',
      'birdsBingoGrid',
      'birdsSeasonQuestGrid',
      'birdsChallengeGrid',
      'birdsBadgeGrid',
      'birdsSpeciesCardGrid',
      'birdsSpeciesDetailContent'
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.innerHTML = `<div class="nature-empty-state">${escapeHtml(state.birdsError || 'Bird data could not be loaded.')}</div>`;
      }
    });
  }

  function renderBirds() {
    if (!state.birdsLoaded) return;
    const stats = getBirdStats();
    const dailyChallenges = getDailyMicroChallenges(stats);
    const bingo = getSeasonalBingo(stats);
    const seasonQuestline = getSeasonQuestline(stats);
    const badgeStats = {
      ...stats,
      bingo,
      seasonQuestCompletedCount: seasonQuestline.completedCount
    };
    const challenges = getBirdChallenges(stats);
    const badges = getBirdBadges(badgeStats);

    renderBirdHeaderStatus();
    renderBirdStats(stats);
    renderBirdLegend(stats);
    renderBirdDailyChallenges(dailyChallenges);
    renderBirdStreakPanel(stats.streak);
    renderBirdLogView(stats);
    renderBirdBingoPanel(bingo);
    renderSeasonQuestlinePanel(seasonQuestline, stats);
    renderBirdChallenges(challenges);
    renderBirdBadges(badges);
    renderBirdExplorerList();
    renderBirdDetail();
  }

  function renderPlaceholderSubTabs() {
    SUBTAB_KEYS.filter((key) => key !== 'birds').forEach((key) => {
      const familyGrid = document.getElementById(`${key}FamilyGrid`);
      const challengeGrid = document.getElementById(`${key}ChallengeGrid`);
      const badgeGrid = document.getElementById(`${key}BadgeGrid`);
      const totalSpecies = document.getElementById(`${key}TotalSpecies`);

      if (totalSpecies) totalSpecies.textContent = '0';
      [familyGrid, challengeGrid, badgeGrid].forEach((el) => {
        if (el && !el.dataset.placeholderReady) {
          el.dataset.placeholderReady = '1';
          el.innerHTML = '<div class="nature-empty-state">Structure is ready. Species data, season logic, badges, and challenges can be added next.</div>';
        }
      });
    });
  }

  function syncNatureSubTabs(root) {
    if (!root) return;

    root.querySelectorAll('[data-nature-subtab]').forEach((button) => {
      const key = button.getAttribute('data-nature-subtab');
      const isActive = key === state.activeSubTab;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
      button.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    root.querySelectorAll('[data-nature-pane]').forEach((pane) => {
      const key = pane.getAttribute('data-nature-pane');
      const isActive = key === state.activeSubTab;
      pane.classList.toggle('is-active', isActive);
      pane.hidden = !isActive;
      pane.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });
  }

  function announceNatureSubTab(root) {
    const announcer = document.getElementById('natureChallengeSubTabAnnouncer');
    if (!announcer || !root) return;
    const button = root.querySelector(`[data-nature-subtab="${state.activeSubTab}"]`);
    announcer.textContent = `${button ? button.textContent.trim() : state.activeSubTab} section active`;
  }

  function syncBirdViews(root) {
    if (!root) return;

    root.querySelectorAll('[data-birds-view]').forEach((viewPane) => {
      const viewKey = viewPane.getAttribute('data-birds-view');
      const isActive = viewKey === state.activeBirdView;
      viewPane.classList.toggle('is-active', isActive);
      viewPane.hidden = !isActive;
      viewPane.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });
  }

  function getBirdCollapsibleSections(root) {
    const scope = root || document;
    return Array.from(scope.querySelectorAll('[data-birds-collapsible]'));
  }

  function syncBirdCollapseAllButton(root) {
    const button = document.getElementById('birdsToggleCollapsiblesBtn');
    if (!button) return;
    const sections = getBirdCollapsibleSections(root);
    if (sections.length === 0) {
      button.disabled = true;
      button.textContent = 'Expand All';
      return;
    }

    button.disabled = false;
    const allOpen = sections.every((section) => section.open);
    button.textContent = allOpen ? 'Collapse All' : 'Expand All';
    button.setAttribute('aria-pressed', allOpen ? 'true' : 'false');
  }

  function toggleBirdCollapsibleSections(root) {
    const sections = getBirdCollapsibleSections(root);
    if (sections.length === 0) return;
    const shouldOpen = sections.some((section) => !section.open);
    sections.forEach((section) => {
      section.open = shouldOpen;
    });
    syncBirdCollapseAllButton(root);
  }

  function ensureNatureButtonsResponsive(root) {
    if (!root) return;
    const controls = root.querySelectorAll(
      'button, [role="button"], .pill-button, .card-btn, [data-bird-open], [data-bird-toggle], [data-bird-favorite], [data-birds-filter-chip], [data-sync-resolve]'
    );

    controls.forEach((btn) => {
      if (!btn || !btn.style) return;
      btn.style.setProperty('pointer-events', 'auto', 'important');
      btn.style.setProperty('touch-action', 'manipulation', 'important');
      btn.style.setProperty('position', 'relative', 'important');
      btn.style.setProperty('z-index', '30', 'important');
      btn.style.setProperty('cursor', 'pointer', 'important');
    });
  }

  function installNatureButtonReliabilityObserver(root) {
    if (!root || root.dataset.natureButtonObserverBound === '1') return;
    root.dataset.natureButtonObserverBound = '1';

    const observer = new MutationObserver((mutations) => {
      let shouldRecheck = false;
      for (const mutation of mutations) {
        if (mutation.type !== 'childList') continue;
        const added = Array.from(mutation.addedNodes || []);
        if (added.some((node) => node.querySelectorAll && node.querySelectorAll('button, [role="button"], .pill-button').length > 0)) {
          shouldRecheck = true;
          break;
        }
      }
      if (!shouldRecheck) return;
      requestAnimationFrame(() => ensureNatureButtonsResponsive(root));
    });

    observer.observe(root, { childList: true, subtree: true });
  }

  function setBirdView(root, viewKey) {
    state.activeBirdView = BIRD_VIEWS.includes(viewKey) ? viewKey : 'overview';
    syncBirdViews(root);
    if (state.activeBirdView === 'log') return;
    if (state.activeBirdView === 'explorer') renderBirdExplorerList();
    if (state.activeBirdView === 'detail') renderBirdDetail();
  }

  function setActiveNatureSubTab(root, key) {
    state.activeSubTab = SUBTAB_KEYS.includes(key) ? key : 'birds';
    syncNatureSubTabs(root);
    announceNatureSubTab(root);

    if (state.activeSubTab !== 'birds') {
      state.activeBirdView = 'overview';
      state.selectedBirdId = '';
      state.birdSearch = '';
    }

    syncBirdViews(root);
    if (state.activeSubTab === 'birds') syncBirdCollapseAllButton(root);
  }

  function toggleBirdSighting(birdId) {
    const bird = findBirdById(birdId);
    if (!bird) return;

    if (state.sightings[bird.id]) {
      delete state.sightings[bird.id];
      if (typeof window.showToast === 'function') {
        window.showToast('Bird removed from sightings', 'info', 2000);
      }
    } else {
      state.sightings[bird.id] = { sightedAt: new Date().toISOString() };
      if (typeof window.showToast === 'function') {
        window.showToast(`Sighted: ${bird.speciesName}`, 'success', 2000);
      }
    }

    saveSightings();
    renderBirds();
  }

  function bindNatureControls(root) {
    if (!root || root.dataset.natureControlsBound === '1') return;
    root.dataset.natureControlsBound = '1';
    ensureNatureButtonsResponsive(root);
    installNatureButtonReliabilityObserver(root);

    root.addEventListener('click', (event) => {
      const subTabButton = event.target.closest('[data-nature-subtab]');
      if (subTabButton) {
        ensureNatureButtonsResponsive(root);
        setActiveNatureSubTab(root, subTabButton.getAttribute('data-nature-subtab'));
        return;
      }

      const toggleButton = event.target.closest('[data-bird-toggle]');
      if (toggleButton) {
        toggleBirdSighting(toggleButton.getAttribute('data-bird-toggle'));
        return;
      }

      const favoriteButton = event.target.closest('[data-bird-favorite]');
      if (favoriteButton) {
        toggleBirdFavorite(favoriteButton.getAttribute('data-bird-favorite'));
        return;
      }

      const openButton = event.target.closest('[data-bird-open]');
      if (openButton) {
        state.selectedBirdId = openButton.getAttribute('data-bird-open') || '';
        setBirdView(root, 'detail');
        return;
      }

      const prevPageButton = event.target.closest('#birdsExplorerPrevPageBtn');
      if (prevPageButton) {
        state.birdPage = Math.max(1, state.birdPage - 1);
        renderBirdExplorerList();
        return;
      }

      const nextPageButton = event.target.closest('#birdsExplorerNextPageBtn');
      if (nextPageButton) {
        state.birdPage += 1;
        renderBirdExplorerList();
        return;
      }

      const chipButton = event.target.closest('[data-birds-filter-chip]');
      if (chipButton) {
        const group = chipButton.getAttribute('data-birds-filter-chip');
        const value = chipButton.getAttribute('data-chip-value') || '';
        toggleChipFilter(group, value);
        state.birdPage = 1;
        renderBirdExplorerList();
        return;
      }

      const clearFiltersButton = event.target.closest('#birdsExplorerClearFiltersBtn');
      if (clearFiltersButton) {
        resetBirdExplorerFilters();
        renderBirdExplorerList();
        return;
      }

      const clearChipFiltersButton = event.target.closest('#birdsExplorerClearChipFiltersBtn');
      if (clearChipFiltersButton) {
        clearBirdChipFilters();
        state.birdPage = 1;
        renderBirdExplorerList();
        return;
      }

      const removeFilterButton = event.target.closest('[data-birds-remove-filter]');
      if (removeFilterButton) {
        removeExplorerFilter(removeFilterButton.getAttribute('data-birds-remove-filter') || '');
        renderBirdExplorerList();
        return;
      }

      const conflictResolveButton = event.target.closest('[data-sync-resolve]');
      if (conflictResolveButton) {
        const conflictId = conflictResolveButton.getAttribute('data-conflict-id') || '';
        const strategy = conflictResolveButton.getAttribute('data-sync-resolve') || 'local';
        resolveSyncConflict(conflictId, strategy);
        return;
      }
    });

    const refreshButton = document.getElementById('natureChallengeRefreshBtn');
    if (refreshButton && refreshButton.dataset.natureRefreshBound !== '1') {
      refreshButton.dataset.natureRefreshBound = '1';
      refreshButton.addEventListener('click', () => loadBirdDataset(true));
    }

    const exploreButton = document.getElementById('birdsExploreBtn');
    if (exploreButton && exploreButton.dataset.natureExploreBound !== '1') {
      exploreButton.dataset.natureExploreBound = '1';
      exploreButton.addEventListener('click', () => setBirdView(root, 'explorer'));
    }

    const openLogButton = document.getElementById('birdsOpenLogBtn');
    if (openLogButton && openLogButton.dataset.natureOpenLogBound !== '1') {
      openLogButton.dataset.natureOpenLogBound = '1';
      openLogButton.addEventListener('click', () => setBirdView(root, 'log'));
    }

    const logBackButton = document.getElementById('birdsLogBackBtn');
    if (logBackButton && logBackButton.dataset.natureLogBackBound !== '1') {
      logBackButton.dataset.natureLogBackBound = '1';
      logBackButton.addEventListener('click', () => setBirdView(root, 'overview'));
    }

    const explorerBackButton = document.getElementById('birdsExplorerBackBtn');
    if (explorerBackButton && explorerBackButton.dataset.natureExplorerBackBound !== '1') {
      explorerBackButton.dataset.natureExplorerBackBound = '1';
      explorerBackButton.addEventListener('click', () => setBirdView(root, 'overview'));
    }

    const detailBackButton = document.getElementById('birdsDetailBackBtn');
    if (detailBackButton && detailBackButton.dataset.natureDetailBackBound !== '1') {
      detailBackButton.dataset.natureDetailBackBound = '1';
      detailBackButton.addEventListener('click', () => setBirdView(root, 'explorer'));
    }

    const searchInput = document.getElementById('birdsSpeciesSearchInput');
    if (searchInput && searchInput.dataset.natureSearchBound !== '1') {
      searchInput.dataset.natureSearchBound = '1';
      searchInput.addEventListener('input', () => {
        state.birdSearch = searchInput.value || '';
        state.birdPage = 1;
        renderBirdExplorerList();
      });
    }

    const sortSelect = document.getElementById('birdsExplorerSortSelect');
    if (sortSelect && sortSelect.dataset.natureSortBound !== '1') {
      sortSelect.dataset.natureSortBound = '1';
      sortSelect.addEventListener('change', () => {
        state.birdSort = sortSelect.value || 'family-asc';
        state.birdPage = 1;
        renderBirdExplorerList();
      });
    }

    const pageSizeSelect = document.getElementById('birdsExplorerPageSizeSelect');
    if (pageSizeSelect && pageSizeSelect.dataset.naturePageSizeBound !== '1') {
      pageSizeSelect.dataset.naturePageSizeBound = '1';
      pageSizeSelect.addEventListener('change', () => {
        state.birdPageSize = Math.max(1, Number(pageSizeSelect.value) || 12);
        state.birdPage = 1;
        renderBirdExplorerList();
      });
    }

    const seasonFilter = document.getElementById('birdsExplorerSeasonFilter');
    if (seasonFilter && seasonFilter.dataset.natureSeasonFilterBound !== '1') {
      seasonFilter.dataset.natureSeasonFilterBound = '1';
      seasonFilter.addEventListener('change', () => {
        state.birdFilters.season = seasonFilter.value || 'all';
        state.birdFilters.seasonChips = [];
        state.birdPage = 1;
        renderBirdExplorerList();
      });
    }

    const rarityFilter = document.getElementById('birdsExplorerRarityFilter');
    if (rarityFilter && rarityFilter.dataset.natureRarityFilterBound !== '1') {
      rarityFilter.dataset.natureRarityFilterBound = '1';
      rarityFilter.addEventListener('change', () => {
        state.birdFilters.rarity = rarityFilter.value || 'all';
        state.birdFilters.rarityChips = [];
        state.birdPage = 1;
        renderBirdExplorerList();
      });
    }

    const familyFilter = document.getElementById('birdsExplorerFamilyFilter');
    if (familyFilter && familyFilter.dataset.natureFamilyFilterBound !== '1') {
      familyFilter.dataset.natureFamilyFilterBound = '1';
      familyFilter.addEventListener('change', () => {
        state.birdFilters.family = familyFilter.value || 'all';
        state.birdFilters.familyChips = [];
        state.birdPage = 1;
        renderBirdExplorerList();
      });
    }

    const regionFilter = document.getElementById('birdsExplorerRegionFilter');
    if (regionFilter && regionFilter.dataset.natureRegionFilterBound !== '1') {
      regionFilter.dataset.natureRegionFilterBound = '1';
      regionFilter.addEventListener('change', () => {
        state.birdFilters.region = regionFilter.value || 'all';
        state.birdPage = 1;
        renderBirdExplorerList();
      });
    }

    const habitatFilter = document.getElementById('birdsExplorerHabitatFilter');
    if (habitatFilter && habitatFilter.dataset.natureHabitatFilterBound !== '1') {
      habitatFilter.dataset.natureHabitatFilterBound = '1';
      habitatFilter.addEventListener('change', () => {
        state.birdFilters.habitat = habitatFilter.value || 'all';
        state.birdPage = 1;
        renderBirdExplorerList();
      });
    }


    const logSightingBtn = document.getElementById('birdsLogSightingBtn');
    if (logSightingBtn && logSightingBtn.dataset.natureLogBound !== '1') {
      logSightingBtn.dataset.natureLogBound = '1';
      logSightingBtn.addEventListener('click', () => logSightingFromForm());
    }

    const syncNowBtn = document.getElementById('birdsSyncNowBtn');
    if (syncNowBtn && syncNowBtn.dataset.natureSyncNowBound !== '1') {
      syncNowBtn.dataset.natureSyncNowBound = '1';
      syncNowBtn.addEventListener('click', () => processSyncQueue());
    }

    const useFreezeBtn = document.getElementById('birdsUseFreezeBtn');
    if (useFreezeBtn && useFreezeBtn.dataset.natureUseFreezeBound !== '1') {
      useFreezeBtn.dataset.natureUseFreezeBound = '1';
      useFreezeBtn.addEventListener('click', () => useStreakFreezeToday());
    }

    const bingoRefreshBtn = document.getElementById('birdsBingoRefreshBtn');
    if (bingoRefreshBtn && bingoRefreshBtn.dataset.natureBingoRefreshBound !== '1') {
      bingoRefreshBtn.dataset.natureBingoRefreshBound = '1';
      bingoRefreshBtn.addEventListener('click', () => {
        const stats = getBirdStats();
        rerollSeasonBingo(stats);
      });
    }

    const runQualityBtn = document.getElementById('birdsRunDataQualityBtn');
    if (runQualityBtn && runQualityBtn.dataset.natureQualityBound !== '1') {
      runQualityBtn.dataset.natureQualityBound = '1';
      runQualityBtn.addEventListener('click', () => renderBirds());
    }

    const collapseAllBtn = document.getElementById('birdsToggleCollapsiblesBtn');
    if (collapseAllBtn && collapseAllBtn.dataset.natureCollapseAllBound !== '1') {
      collapseAllBtn.dataset.natureCollapseAllBound = '1';
      collapseAllBtn.addEventListener('click', () => {
        toggleBirdCollapsibleSections(root);
      });
    }

    getBirdCollapsibleSections(root).forEach((section) => {
      if (section.dataset.natureCollapseSectionBound === '1') return;
      section.dataset.natureCollapseSectionBound = '1';
      section.addEventListener('toggle', () => {
        syncBirdCollapseAllButton(root);
      });
    });

    const favoritesOnlyToggle = document.getElementById('birdsExplorerFavoritesOnly');
    if (favoritesOnlyToggle && favoritesOnlyToggle.dataset.natureFavoritesOnlyBound !== '1') {
      favoritesOnlyToggle.dataset.natureFavoritesOnlyBound = '1';
      favoritesOnlyToggle.addEventListener('change', () => {
        state.birdFilters.favoritesOnly = Boolean(favoritesOnlyToggle.checked);
        state.birdPage = 1;
        renderBirdExplorerList();
      });
    }
  }

  function initializeNatureChallengeTab() {
    const root = document.getElementById('natureChallengeRoot');
    if (!root) return;

    ensureNatureButtonsResponsive(root);
    bindNatureControls(root);
    const logDateInput = document.getElementById('birdsLogDateInput');
    if (logDateInput && !logDateInput.value) {
      logDateInput.value = new Date().toISOString().slice(0, 10);
    }
    renderPlaceholderSubTabs();
    setActiveNatureSubTab(root, state.activeSubTab || 'birds');
    setBirdView(root, state.activeBirdView || 'overview');
    syncBirdCollapseAllButton(root);
    renderBirdHeaderStatus();
    loadBirdDataset(false);

    if (!state.initialized) {
      console.log('Nature Challenge tab initialized');
      state.initialized = true;
    }
  }

  window.initializeNatureChallengeTab = initializeNatureChallengeTab;
  window.initNatureChallengeTab = window.initNatureChallengeTab || initializeNatureChallengeTab;
  window.BIRD_PROGRESSION_SPEC = BIRD_PROGRESSION_SPEC;
})();

