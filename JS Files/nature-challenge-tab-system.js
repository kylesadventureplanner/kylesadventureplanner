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
  const BIRD_UI_PREFS_KEY = 'natureChallengeBirdUiPrefsV1';
  const EXCEL_TABLE_NAME = 'birds';
  const EXCEL_FILE_CANDIDATES = [
    'Nature_records.xlsx',
    'Copilot_Apps/Kyles_Adventure_Finder/Nature_records.xlsx'
  ];
  const SUBTAB_KEYS = ['birds', 'mammals', 'reptiles', 'amphibians', 'insects', 'arachnids', 'wildflowers', 'trees', 'shrubs'];
  const BIRD_VIEWS = ['overview', 'log', 'explorer', 'detail', 'collection'];
  const BIRD_OVERVIEW_LIMITS = {
    challenges: 4,
    badges: 4,
    quests: 3,
    bingo: 4
  };

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
    activeBirdView: loadBirdUiPrefs().activeBirdView,
    activeBirdCollection: 'challenges',
    selectedBirdId: '',
    birdSearch: '',
    birdSort: 'family-asc',
    birdPage: 1,
    birdPageSize: 12,
    birdLoadMoreRows: 0,
    birdPaginationMode: loadBirdUiPrefs().birdPaginationMode,
    explorerDensity: loadBirdUiPrefs().explorerDensity,
    overviewDensity: loadBirdUiPrefs().overviewDensity,
    overviewQuickFilters: loadBirdUiPrefs().overviewQuickFilters,
    commandChordStartedAt: 0,
    activeOverviewSection: loadBirdUiPrefs().activeOverviewSection,
    commandInputValue: loadBirdUiPrefs().commandInputValue,
    birdRecommendationStrategy: loadBirdUiPrefs().birdRecommendationStrategy,
    birdViewScrollPositions: {},
    recentUpdateUntil: 0,
    recentUpdateTimerId: 0,
    lastUndoAction: null,
    birdFilters: {
      season: 'all',
      rarity: 'all',
      family: 'all',
      region: 'all',
      habitat: 'all',
      sightingStatus: 'all',
      favoritesOnly: false,
      notYetSeenOnly: false,
      alreadySeenOnly: false,
      seenRecentlyOnly: false,
      notSeenRecentlyOnly: false,
      favoritedOnly: false,
      inSeasonNotSeenOnly: false,
      rareNotSeenOnly: false,
      seasonChips: [],
      rarityChips: [],
      familyChips: [],
      focusChips: []
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
    birdCollectionsCache: {
      stats: null,
      challenges: [],
      badges: [],
      questline: { steps: [], completedCount: 0 },
      bingo: null
    },
    lastSyncAttemptAt: '',
    lastSyncSuccessAt: '',
    lastLoadedAt: null
  };

  const birdsClickDiagnostics = {
    enabled: true,
    panel: null,
    total: 0,
    clickCount: 0,
    pointerupCount: 0,
    dedupedClicks: 0,
    lastEvent: '-',
    lastTarget: '-'
  };

  function isBirdClickDiagnosticsEnabled() {
    if (typeof window === 'undefined') return false;
    if (window.__BIRDS_CLICK_DIAG__ === false) return false;
    if (window.__BIRDS_CLICK_DIAG__ === true) return true;
    try {
      const params = new URLSearchParams(window.location.search || '');
      if (params.get('birdsClickDiag') === '1') return true;
      if (params.get('birdsClickDiag') === '0') return false;
    } catch (_error) {
      // Ignore malformed URL state and fall through.
    }
    try {
      const stored = window.localStorage.getItem('birdsClickDiag');
      if (stored === '1') return true;
      if (stored === '0') return false;
    } catch (_error) {
      // Ignore storage availability issues and use the visible in-app default.
    }
    return true;
  }

  function renderBirdClickDiagnosticsPanel() {
    if (!birdsClickDiagnostics.panel) return;
    if (!birdsClickDiagnostics.enabled) {
      birdsClickDiagnostics.panel.innerHTML = `
        <div class="nature-click-diagnostics-heading">
          <span>Bird button diagnostics</span>
          <span class="nature-click-diagnostics-status">Paused</span>
        </div>
        <div class="nature-click-diagnostics-empty">Diagnostics are currently disabled. Use <code>window.setBirdClickDiagnosticsEnabled(true)</code> to turn live tracking back on.</div>
      `;
      return;
    }

    const hasEvents = birdsClickDiagnostics.total > 0 || birdsClickDiagnostics.dedupedClicks > 0;
    birdsClickDiagnostics.panel.innerHTML = `
      <div class="nature-click-diagnostics-heading">
        <span>Bird button diagnostics</span>
        <span class="nature-click-diagnostics-status">Live in-app tracking</span>
      </div>
      <div class="nature-click-diagnostics-grid">
        <div class="nature-click-diagnostics-stat">
          <span class="nature-click-diagnostics-label">Total</span>
          <strong class="nature-click-diagnostics-value">${birdsClickDiagnostics.total}</strong>
        </div>
        <div class="nature-click-diagnostics-stat">
          <span class="nature-click-diagnostics-label">Click</span>
          <strong class="nature-click-diagnostics-value">${birdsClickDiagnostics.clickCount}</strong>
        </div>
        <div class="nature-click-diagnostics-stat">
          <span class="nature-click-diagnostics-label">Pointer</span>
          <strong class="nature-click-diagnostics-value">${birdsClickDiagnostics.pointerupCount}</strong>
        </div>
        <div class="nature-click-diagnostics-stat">
          <span class="nature-click-diagnostics-label">Deduped</span>
          <strong class="nature-click-diagnostics-value">${birdsClickDiagnostics.dedupedClicks}</strong>
        </div>
      </div>
      <div class="nature-click-diagnostics-meta">
        <div class="nature-click-diagnostics-row"><strong>Last event</strong><span>${escapeHtml(birdsClickDiagnostics.lastEvent || '-')}</span></div>
        <div class="nature-click-diagnostics-row"><strong>Last target</strong><span>${escapeHtml(birdsClickDiagnostics.lastTarget || '-')}</span></div>
        <div class="nature-click-diagnostics-row"><strong>Status</strong><span>${hasEvents ? 'Tracking recent Birds button activations.' : 'Waiting for your next Birds button interaction.'}</span></div>
      </div>
    `;
  }

  function ensureBirdClickDiagnosticsPanel(root) {
    birdsClickDiagnostics.enabled = isBirdClickDiagnosticsEnabled();
    if (!root) return;
    if (!birdsClickDiagnostics.panel) {
      birdsClickDiagnostics.panel = document.getElementById('birdsButtonClickDiagnosticsPanel');
    }
    if (!birdsClickDiagnostics.panel) return;
    birdsClickDiagnostics.panel.hidden = false;
    renderBirdClickDiagnosticsPanel();
  }

  function recordBirdClickDiagnostic(eventType, target, options = {}) {
    if (!birdsClickDiagnostics.enabled) return;
    if (options.deduped) birdsClickDiagnostics.dedupedClicks += 1;
    else birdsClickDiagnostics.total += 1;
    if (eventType === 'click') birdsClickDiagnostics.clickCount += 1;
    if (eventType === 'pointerup') birdsClickDiagnostics.pointerupCount += 1;
    birdsClickDiagnostics.lastEvent = eventType || '-';
    const rawLabel =
      target.id ||
      target.getAttribute('data-bird-toggle') ||
      target.getAttribute('data-bird-open') ||
      target.getAttribute('data-birds-overview-jump') ||
      target.getAttribute('data-birds-back-to-top') ||
      target.getAttribute('data-birds-more') ||
      target.getAttribute('data-sync-resolve') ||
      target.getAttribute('data-nature-subtab') ||
      target.textContent ||
      target.tagName ||
      '-';
    birdsClickDiagnostics.lastTarget = String(rawLabel).trim().slice(0, 28) || '-';
    renderBirdClickDiagnosticsPanel();
  }

  function resetBirdClickDiagnosticsState() {
    birdsClickDiagnostics.total = 0;
    birdsClickDiagnostics.clickCount = 0;
    birdsClickDiagnostics.pointerupCount = 0;
    birdsClickDiagnostics.dedupedClicks = 0;
    birdsClickDiagnostics.lastEvent = '-';
    birdsClickDiagnostics.lastTarget = '-';
    renderBirdClickDiagnosticsPanel();
    return {
      total: birdsClickDiagnostics.total,
      clickCount: birdsClickDiagnostics.clickCount,
      pointerupCount: birdsClickDiagnostics.pointerupCount,
      dedupedClicks: birdsClickDiagnostics.dedupedClicks,
      lastEvent: birdsClickDiagnostics.lastEvent,
      lastTarget: birdsClickDiagnostics.lastTarget
    };
  }

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

  function tooltipAttrs(label) {
    const safeLabel = escapeHtml(label);
    return `title="${safeLabel}" data-tooltip="${safeLabel}"`;
  }

  function buildUnifiedStateHtml(message, options = {}) {
    const icon = options.icon || 'ℹ️';
    const hint = options.hint ? `<div class="nature-empty-state-hint">${escapeHtml(options.hint)}</div>` : '';
    return `
      <div class="nature-empty-state nature-empty-state--unified">
        <div class="nature-empty-state-icon" aria-hidden="true">${escapeHtml(icon)}</div>
        <div>${escapeHtml(message)}</div>
        ${hint}
      </div>
    `;
  }

  function isRecentUpdateActive() {
    return Number(state.recentUpdateUntil) > Date.now();
  }

  function markRecentUpdatePulse() {
    if (isRecentUpdateActive()) return;
    state.recentUpdateUntil = Date.now() + 4200;
    if (state.recentUpdateTimerId) {
      clearTimeout(state.recentUpdateTimerId);
    }
    state.recentUpdateTimerId = window.setTimeout(() => {
      state.recentUpdateUntil = 0;
      state.recentUpdateTimerId = 0;
      renderBirds();
    }, 4300);
  }

  function formatProgressSummary(item) {
    const progress = Math.max(0, Number(item && item.progress) || 0);
    const goal = Math.max(1, Number(item && item.goal) || 1);
    const pct = Math.max(0, Math.min(100, Number(item && item.pct) || 0));
    const status = item && item.completed ? 'Complete' : `${pct}%`;
    return {
      fraction: `${progress}/${goal}`,
      status,
      summary: `${progress}/${goal} | ${status}`
    };
  }

  function applyOverviewDensity(root) {
    const overview = (root || document).querySelector('.nature-birds-view[data-birds-view="overview"]');
    if (!overview) return;
    const compact = state.overviewDensity === 'compact';
    overview.classList.toggle('is-density-compact', compact);
    const compactBtn = document.getElementById('birdsDensityCompactBtn');
    const comfortBtn = document.getElementById('birdsDensityComfortBtn');
    if (compactBtn) {
      compactBtn.classList.toggle('is-active', compact);
      compactBtn.setAttribute('aria-pressed', compact ? 'true' : 'false');
    }
    if (comfortBtn) {
      comfortBtn.classList.toggle('is-active', !compact);
      comfortBtn.setAttribute('aria-pressed', !compact ? 'true' : 'false');
    }
  }

  function applyExplorerDensity(root) {
    const explorer = (root || document).querySelector('.nature-birds-view[data-birds-view="explorer"]');
    if (!explorer) return;
    const mode = ['compact', 'comfortable', 'field'].includes(state.explorerDensity)
      ? state.explorerDensity
      : 'comfortable';
    explorer.classList.toggle('is-density-compact', mode === 'compact');
    explorer.classList.toggle('is-density-field', mode === 'field');
    const compactBtn = document.getElementById('birdsExplorerDensityCompactBtn');
    const comfortBtn = document.getElementById('birdsExplorerDensityComfortBtn');
    const fieldBtn = document.getElementById('birdsExplorerDensityFieldBtn');
    if (compactBtn) {
      compactBtn.classList.toggle('is-active', mode === 'compact');
      compactBtn.setAttribute('aria-pressed', mode === 'compact' ? 'true' : 'false');
    }
    if (comfortBtn) {
      comfortBtn.classList.toggle('is-active', mode === 'comfortable');
      comfortBtn.setAttribute('aria-pressed', mode === 'comfortable' ? 'true' : 'false');
    }
    if (fieldBtn) {
      fieldBtn.classList.toggle('is-active', mode === 'field');
      fieldBtn.setAttribute('aria-pressed', mode === 'field' ? 'true' : 'false');
    }
  }

  function syncOverviewFilterChipState() {
    const filterButtons = document.querySelectorAll('[data-birds-overview-filter]');
    filterButtons.forEach((button) => {
      const key = button.getAttribute('data-birds-overview-filter') || '';
      const active = key === 'in-season'
        ? Boolean(state.overviewQuickFilters.inSeason)
        : key === 'almost-there'
          ? Boolean(state.overviewQuickFilters.almostThere)
          : key === 'high-reward'
            ? Boolean(state.overviewQuickFilters.highReward)
            : false;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function syncBirdCommandInputFromState() {
    const input = document.getElementById('birdsOverviewCommandInput');
    if (!input) return;
    input.value = state.commandInputValue || '';
  }

  function resetBirdUiPreferences(root) {
    state.overviewDensity = 'comfortable';
    state.overviewQuickFilters = { inSeason: false, almostThere: false, highReward: false };
    state.commandInputValue = '';
    state.explorerDensity = 'comfortable';
    state.birdPaginationMode = 'paged';
    state.activeOverviewSection = 'daily';
    state.activeBirdCollection = 'challenges';
    state.birdViewScrollPositions = {};
    saveBirdUiPrefs();
    syncBirdCommandInputFromState();
    setBirdView(root, 'overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderBirds();
  }

  function renderOverviewSectionSummaries(summary) {
    const tagIcons = {
      'in-season': '🍃',
      'almost-there': '🎯',
      'high-reward': '🏆'
    };
    const activeTags = [];
    if (state.overviewQuickFilters.inSeason) activeTags.push({ key: 'in-season', label: 'In Season' });
    if (state.overviewQuickFilters.almostThere) activeTags.push({ key: 'almost-there', label: 'Almost There' });
    if (state.overviewQuickFilters.highReward) activeTags.push({ key: 'high-reward', label: 'High Reward' });

    const renderSummary = (mainText) => {
      const chips = activeTags.length
        ? `<span class="nature-section-summary-filters">${activeTags.map((tag) => `
            <span class="nature-summary-filter-pill">
              <span class="nature-summary-filter-icon" aria-hidden="true">${escapeHtml(tagIcons[tag.key] || '✨')}</span>
              ${escapeHtml(tag.label)}
              <button type="button" data-birds-overview-remove-filter="${escapeHtml(tag.key)}" aria-label="Remove ${escapeHtml(tag.label)} filter" ${tooltipAttrs(`Remove ${tag.label} filter`)}>x</button>
            </span>
          `).join('')}</span>`
        : '<span class="nature-section-summary-filters"></span>';

      return `<span class="nature-section-summary-main">${escapeHtml(mainText)}</span>${chips}`;
    };

    const set = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = renderSummary(text);
    };
    set('birdsDailySummary', `Showing ${summary.dailyShown} of ${summary.dailyTotal} daily picks`);
    set('birdsChallengesSummary', `Showing ${summary.challengeShown} of ${summary.challengeTotal} challenges`);
    set('birdsBadgesSummary', `Showing ${summary.badgeShown} of ${summary.badgeTotal} badges`);
    set('birdsQuestsSummary', `Showing ${summary.questShown} of ${summary.questTotal} quests`);
    set('birdsBingoSummary', `Showing ${summary.bingoShown} of ${summary.bingoTotal} bingo tiles`);
  }

  function announceOverviewFilterState(summary) {
    const announcer = document.getElementById('birdsOverviewFilterAnnouncer');
    if (!announcer) return;
    const flags = [];
    if (state.overviewQuickFilters.inSeason) flags.push('In Season');
    if (state.overviewQuickFilters.almostThere) flags.push('Almost There');
    if (state.overviewQuickFilters.highReward) flags.push('High Reward');
    const filterText = flags.length ? `Filters active: ${flags.join(', ')}` : 'No overview filters active';
    announcer.textContent = `${filterText}. Showing ${summary.challengeShown} challenges, ${summary.badgeShown} badges, ${summary.questShown} quests, and ${summary.bingoShown} bingo tiles.`;
  }

  function renderBirdLoadingSkeletons() {
    const shell = `
      <div class="nature-skeleton-card">
        <div class="nature-skeleton line-lg"></div>
        <div class="nature-skeleton line-md"></div>
        <div class="nature-skeleton line-md"></div>
        <div class="nature-skeleton line-sm"></div>
      </div>
    `;
    ['birdsDailyChallengeGrid', 'birdsChallengeGrid', 'birdsBadgeGrid', 'birdsSeasonQuestGrid', 'birdsBingoGrid'].forEach((id) => {
      const el = document.getElementById(id);
      if (el && !el.innerHTML.trim()) el.innerHTML = shell.repeat(3);
    });
  }

  function renderBirdTodayFocus(stats) {
    const strip = document.getElementById('birdsTodayFocusStrip');
    if (!strip || !stats) return;
    const actions = [];
    if (stats.todayLogCount < 1) actions.push(`<button type="button" class="pill-button" data-birds-overview-jump="daily" ${tooltipAttrs('Go to daily micro-challenges')}>Log your first sighting today</button>`);
    if (stats.streak && stats.streak.atRiskStreak > 0) actions.push(`<button type="button" class="pill-button" data-birds-overview-jump="daily" ${tooltipAttrs('Go to daily micro-challenges')}>Protect your streak today</button>`);
    if (stats.inSeasonSightedCount < stats.inSeasonCount) actions.push(`<button type="button" class="pill-button" data-birds-overview-jump="quests" ${tooltipAttrs('Go to seasonal quests')}>Find one more in-season species</button>`);
    actions.push(`<button type="button" class="pill-button" id="birdsTodayFocusLogBtn" data-birds-overview-jump="daily" ${tooltipAttrs('Open the sighting log')}>Log one sighting now</button>`);
    strip.innerHTML = actions.slice(0, 3).join('');
  }

  function renderBirdUndoPrompt() {
    const prompt = document.getElementById('birdsUndoPrompt');
    const text = document.getElementById('birdsUndoPromptText');
    const promptButton = document.getElementById('birdsUndoPromptBtn');
    const actionButton = document.getElementById('birdsUndoActionBtn');
    if (!prompt || !text) return;
    if (!state.lastUndoAction) {
      prompt.hidden = true;
      if (promptButton) {
        promptButton.disabled = true;
        promptButton.setAttribute('aria-disabled', 'true');
        promptButton.setAttribute('title', 'No Birds action to undo yet');
        promptButton.setAttribute('data-tooltip', 'No Birds action to undo yet');
      }
      if (actionButton) {
        actionButton.disabled = true;
        actionButton.setAttribute('aria-disabled', 'true');
        actionButton.setAttribute('title', 'No Birds action to undo yet');
        actionButton.setAttribute('data-tooltip', 'No Birds action to undo yet');
      }
      return;
    }
    const label = state.lastUndoAction.label || 'Last birds action';
    text.textContent = `${label} can be undone.`;
    prompt.hidden = false;
    const tooltip = `Undo the last Birds action: ${label}`;
    if (promptButton) {
      promptButton.disabled = false;
      promptButton.setAttribute('aria-disabled', 'false');
      promptButton.setAttribute('title', tooltip);
      promptButton.setAttribute('data-tooltip', tooltip);
    }
    if (actionButton) {
      actionButton.disabled = false;
      actionButton.setAttribute('aria-disabled', 'false');
      actionButton.setAttribute('title', tooltip);
      actionButton.setAttribute('data-tooltip', tooltip);
    }
  }

  function setUndoAction(action) {
    state.lastUndoAction = action || null;
    renderBirdUndoPrompt();
  }

  function undoLastBirdAction() {
    const action = state.lastUndoAction;
    if (!action) return false;

    if (action.type === 'toggle-sighting') {
      const bird = findBirdById(action.birdId);
      if (!bird) return false;
      if (action.wasSighted) state.sightings[bird.id] = action.snapshot || { sightedAt: new Date().toISOString() };
      else delete state.sightings[bird.id];
      saveSightings();
      renderBirds();
      state.lastUndoAction = null;
      renderBirdUndoPrompt();
      return true;
    }

    if (action.type === 'log-sighting') {
      state.sightingLog = state.sightingLog.filter((entry) => entry.id !== action.entryId);
      saveSightingLog();
      updateBirdingStatusFromLog();
      renderBirds();
      state.lastUndoAction = null;
      renderBirdUndoPrompt();
      return true;
    }

    if (action.type === 'clear-overview-filters') {
      state.overviewQuickFilters = {
        inSeason: Boolean(action.prev && action.prev.inSeason),
        almostThere: Boolean(action.prev && action.prev.almostThere),
        highReward: Boolean(action.prev && action.prev.highReward)
      };
      saveBirdUiPrefs();
      renderBirds();
      state.lastUndoAction = null;
      renderBirdUndoPrompt();
      return true;
    }

    return false;
  }

  function handleBirdUndoAction() {
    const undone = undoLastBirdAction();
    if (undone && typeof window.showToast === 'function') {
      window.showToast('Undid last birds action', 'success', 1800);
    }
    return undone;
  }

  function safeJsonParse(value, fallback) {
    try {
      return JSON.parse(value);
    } catch (_) {
      return fallback;
    }
  }

  function loadBirdUiPrefs() {
    const prefs = safeJsonParse(localStorage.getItem(BIRD_UI_PREFS_KEY), {}) || {};
    return {
      overviewDensity: prefs.overviewDensity === 'compact' ? 'compact' : 'comfortable',
      explorerDensity: ['compact', 'comfortable', 'field'].includes(prefs.explorerDensity)
        ? prefs.explorerDensity
        : 'comfortable',
      overviewQuickFilters: {
        inSeason: Boolean(prefs.overviewQuickFilters && prefs.overviewQuickFilters.inSeason),
        almostThere: Boolean(prefs.overviewQuickFilters && prefs.overviewQuickFilters.almostThere),
        highReward: Boolean(prefs.overviewQuickFilters && prefs.overviewQuickFilters.highReward)
      },
      activeBirdView: ['overview', 'log', 'explorer', 'detail', 'collection'].includes(prefs.activeBirdView)
        ? prefs.activeBirdView
        : 'overview',
      activeOverviewSection: ['daily', 'challenges', 'badges', 'quests', 'bingo'].includes(prefs.activeOverviewSection)
        ? prefs.activeOverviewSection
        : 'daily',
      commandInputValue: String(prefs.commandInputValue || ''),
      birdRecommendationStrategy: ['progress-first', 'rarity-first', 'season-first'].includes(prefs.birdRecommendationStrategy)
        ? prefs.birdRecommendationStrategy
        : 'progress-first',
      birdPaginationMode: ['paged', 'load-more'].includes(prefs.birdPaginationMode)
        ? prefs.birdPaginationMode
        : 'paged'
    };
  }

  function saveBirdUiPrefs() {
    localStorage.setItem(BIRD_UI_PREFS_KEY, JSON.stringify({
      overviewDensity: state.overviewDensity === 'compact' ? 'compact' : 'comfortable',
      explorerDensity: ['compact', 'comfortable', 'field'].includes(state.explorerDensity)
        ? state.explorerDensity
        : 'comfortable',
      overviewQuickFilters: {
        inSeason: Boolean(state.overviewQuickFilters && state.overviewQuickFilters.inSeason),
        almostThere: Boolean(state.overviewQuickFilters && state.overviewQuickFilters.almostThere),
        highReward: Boolean(state.overviewQuickFilters && state.overviewQuickFilters.highReward)
      },
      activeBirdView: state.activeBirdView,
      activeOverviewSection: state.activeOverviewSection || 'daily',
      commandInputValue: state.commandInputValue || '',
      birdRecommendationStrategy: ['progress-first', 'rarity-first', 'season-first'].includes(state.birdRecommendationStrategy)
        ? state.birdRecommendationStrategy
        : 'progress-first',
      birdPaginationMode: ['paged', 'load-more'].includes(state.birdPaginationMode)
        ? state.birdPaginationMode
        : 'paged'
    }));
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

  function normalizePhrase(value) {
    return norm(value).replace(/[^a-z0-9\s]+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function formatProgressionHeading(icon, title) {
    const iconText = String(icon || '').trim();
    const titleText = String(title || '').trim();
    if (!iconText) return titleText;
    if (!titleText) return iconText;

    const iconTokens = normalizePhrase(iconText).split(' ').filter(Boolean);
    const titleTokens = normalizePhrase(titleText).split(' ').filter(Boolean);
    const titlePrefix = titleTokens.slice(0, iconTokens.length).join(' ');
    if (iconTokens.length > 0 && titlePrefix === iconTokens.join(' ')) {
      return titleText;
    }
    return `${iconText} ${titleText}`;
  }

  function getFamilyChipLabel(familyLabel) {
    const label = String(familyLabel || '').trim();
    if (!label) return '';
    const match = label.match(/\(([^)]+)\)/);
    if (match && String(match[1] || '').trim()) {
      return String(match[1]).trim();
    }
    return label.split('(')[0].trim() || label;
  }

  function isSeasonRelevantCard(card, stats) {
    if (!card || !stats) return false;
    const metric = String(card.metric || '');
    if (['inSeasonSightedCount', 'seasonalLogCount', 'seasonHabitatCount', 'seasonRegionCount'].includes(metric)) return true;
    const season = norm(stats.currentSeasonLabel || stats.currentSeason || '');
    const searchable = norm(`${card.id || ''} ${card.title || ''} ${card.description || ''}`);
    return Boolean(season) && searchable.includes(season);
  }

  function getOverviewPriorityScore(card, stats) {
    if (!card) return 0;
    let score = card.completed ? -100 : 200;
    score += Math.max(0, Math.min(100, Number(card.pct) || 0));
    if (!card.completed && Number(card.pct) >= 70) score += 45;
    else if (!card.completed && Number(card.pct) >= 40) score += 20;
    if (!card.completed && Math.max(0, Number(card.goal) - Number(card.progress)) <= 1) score += 18;
    if (isSeasonRelevantCard(card, stats)) score += 30;
    score += Math.min(40, Math.round((Number(card.xp) || 0) / 10));
    return score;
  }

  const OVERVIEW_REASON_META = {
    almostComplete: { key: 'almost-complete', label: 'Almost there', icon: '🎯' },
    highProgress: { key: 'high-progress', label: 'Strong progress', icon: '⚡' },
    seasonFocus: { key: 'season-focus', label: 'Season focus', icon: '🍃' },
    highReward: { key: 'high-reward', label: 'Big reward', icon: '🏆' },
    recommended: { key: 'recommended', label: 'Recommended', icon: '✨' }
  };

  function getOverviewPriorityReason(card, stats) {
    if (!card) return OVERVIEW_REASON_META.recommended;
    const remaining = Math.max(0, Number(card.goal) - Number(card.progress));
    if (!card.completed && remaining <= 1) return OVERVIEW_REASON_META.almostComplete;
    if (!card.completed && Number(card.pct) >= 70) return OVERVIEW_REASON_META.highProgress;
    if (isSeasonRelevantCard(card, stats)) {
      return {
        ...OVERVIEW_REASON_META.seasonFocus,
        label: `${stats.currentSeasonLabel || 'Season'} focus`
      };
    }
    if (Number(card.xp) >= 180) return OVERVIEW_REASON_META.highReward;
    return OVERVIEW_REASON_META.recommended;
  }

  function getPrioritizedOverviewCards(cards, stats, limit) {
    return (cards || [])
      .slice()
      .sort((a, b) => {
        const scoreDiff = getOverviewPriorityScore(b, stats) - getOverviewPriorityScore(a, stats);
        if (scoreDiff !== 0) return scoreDiff;
        return String(a.title || '').localeCompare(String(b.title || ''));
      })
      .slice(0, Math.max(1, Number(limit) || 1))
      .map((card) => {
        const reason = getOverviewPriorityReason(card, stats);
        return {
          ...card,
          whyShown: reason.label,
          whyShownKey: reason.key,
          whyShownClass: `nature-why-shown-badge--${reason.key}`,
          whyShownIcon: reason.icon || OVERVIEW_REASON_META.recommended.icon
        };
      });
  }

  function renderWhyShownBadge(item) {
    if (!item || !item.whyShown) return '';
    const badgeClass = item.whyShownClass ? ` ${escapeHtml(item.whyShownClass)}` : '';
    const icon = item.whyShownIcon ? `<span class="nature-why-shown-icon" aria-hidden="true">${escapeHtml(item.whyShownIcon)}</span>` : '';
    return `<div class="nature-why-shown-badge${badgeClass}">${icon}<span>${escapeHtml(item.whyShown)}</span></div>`;
  }

  function cardMatchesOverviewQuickFilters(card, stats) {
    if (!card) return false;
    const filters = state.overviewQuickFilters || {};
    const noFilter = !filters.inSeason && !filters.almostThere && !filters.highReward;
    if (noFilter) return true;

    const remaining = Math.max(0, Number(card.goal) - Number(card.progress));
    if (filters.inSeason && isSeasonRelevantCard(card, stats)) return true;
    if (filters.almostThere && !card.completed && remaining <= 2) return true;
    if (filters.highReward && Number(card.xp) >= 160) return true;
    return false;
  }

  function applyOverviewQuickFilters(cards, stats) {
    const list = Array.isArray(cards) ? cards : [];
    return list.filter((card) => cardMatchesOverviewQuickFilters(card, stats));
  }

  function scrollToBirdOverviewSection(sectionKey) {
    const map = {
      daily: 'birdsOverviewSectionDaily',
      challenges: 'birdsOverviewSectionChallenges',
      badges: 'birdsOverviewSectionBadges',
      quests: 'birdsOverviewSectionQuests',
      bingo: 'birdsOverviewSectionBingo'
    };
    const target = document.getElementById(map[sectionKey] || '');
    if (!target) return false;
    state.activeOverviewSection = sectionKey;
    saveBirdUiPrefs();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const header = target.querySelector('.card-header');
    if (header) {
      header.setAttribute('tabindex', '-1');
      window.setTimeout(() => {
        try { header.focus({ preventScroll: true }); } catch (_) { header.focus(); }
      }, 180);
    }
    const announcer = document.getElementById('birdsOverviewJumpAnnouncer');
    if (announcer) announcer.textContent = `Jumped to ${String(sectionKey || '').charAt(0).toUpperCase()}${String(sectionKey || '').slice(1)}`;
    return true;
  }

  function runBirdOverviewCommand(root, raw) {
    const query = String(raw || '').trim();
    if (!query) return;
    state.commandInputValue = query;
    saveBirdUiPrefs();
    const normalized = norm(query);

    if (normalized === 'log' || normalized === 'open log' || normalized === 'go log') {
      setBirdView(root, 'log');
      return;
    }
    if (normalized === 'explore' || normalized === 'open explorer' || normalized === 'go explorer') {
      setBirdView(root, 'explorer');
      return;
    }
    if (normalized === 'go overview' || normalized === 'overview') {
      setBirdView(root, 'overview');
      return;
    }
    if (normalized.includes('go challenges') || normalized === 'challenges') {
      setBirdView(root, 'overview');
      scrollToBirdOverviewSection('challenges');
      return;
    }
    if (normalized.includes('go badges') || normalized === 'badges') {
      setBirdView(root, 'overview');
      scrollToBirdOverviewSection('badges');
      return;
    }
    if (normalized.includes('go quests') || normalized.includes('quest')) {
      setBirdView(root, 'overview');
      scrollToBirdOverviewSection('quests');
      return;
    }
    if (normalized.includes('go bingo') || normalized === 'bingo') {
      setBirdView(root, 'overview');
      scrollToBirdOverviewSection('bingo');
      return;
    }
    if (normalized.startsWith('search ')) {
      const searchText = query.slice(7).trim();
      state.birdSearch = searchText;
      state.birdPage = 1;
      setBirdView(root, 'explorer');
      renderBirdExplorerList();
      return;
    }

    state.birdSearch = query;
    state.birdPage = 1;
    setBirdView(root, 'explorer');
    renderBirdExplorerList();
  }

  function handleBirdKeyboardShortcuts(root, event) {
    if (!root || state.activeSubTab !== 'birds') return;
    const target = event.target;
    const inTextInput = target && (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    );

    if (event.key === '/' && !inTextInput) {
      event.preventDefault();
      const cmdInput = document.getElementById('birdsOverviewCommandInput');
      if (cmdInput) cmdInput.focus();
      return;
    }

    if (!inTextInput && norm(event.key) === 'z') {
      const undone = handleBirdUndoAction();
      if (undone) return;
    }

    const key = norm(event.key);
    const now = Date.now();
    if (!inTextInput && key === 'g') {
      state.commandChordStartedAt = now;
      return;
    }
    if (!inTextInput && state.commandChordStartedAt && now - state.commandChordStartedAt <= 900) {
      state.commandChordStartedAt = 0;
      if (key === 'o') {
        setBirdView(root, 'overview');
      } else if (key === 'l') {
        setBirdView(root, 'log');
      } else if (key === 'e') {
        setBirdView(root, 'explorer');
      }
    }

    if (!inTextInput && state.activeBirdView === 'overview') {
      if (key === '1') scrollToBirdOverviewSection('challenges');
      if (key === '2') scrollToBirdOverviewSection('badges');
      if (key === '3') scrollToBirdOverviewSection('quests');
      if (key === '4') scrollToBirdOverviewSection('bingo');
    }
  }

  function updateBirdMoreButtons(counts) {
    const sections = ['challenges', 'badges', 'quests', 'bingo'];
    const badgeMap = {
      challenges: 'birdsChallengesCountBadge',
      badges: 'birdsBadgesCountBadge',
      quests: 'birdsQuestsCountBadge',
      bingo: 'birdsBingoCountBadge'
    };
    sections.forEach((section) => {
      const button = document.querySelector(`[data-birds-more="${section}"]`);
      const shown = Math.max(0, Number(counts && counts[section] && counts[section].shown) || 0);
      const total = Math.max(shown, Number(counts && counts[section] && counts[section].total) || shown);
      if (button) button.textContent = 'More';
      const badge = document.getElementById(badgeMap[section]);
      if (badge) badge.textContent = `${shown}/${total}`;
    });
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
    setUndoAction({ type: 'log-sighting', entryId: entry.id, label: 'Logged sighting' });
    state.logSuccessMessage = `Saved ${selectedBird.speciesName} for ${dateObserved}${locationName ? ` at ${locationName}` : ''}.`;
    if (typeof window.showToast === 'function') {
      window.showToast(`Logged sighting: ${selectedBird.speciesName}. Use Undo pill or press z.`, 'success', 2800);
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

    markRecentUpdatePulse();
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

  function renderBirdChallenges(challenges, containerId = 'birdsChallengeGrid') {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!Array.isArray(challenges) || challenges.length === 0) {
      container.innerHTML = buildUnifiedStateHtml('No challenge cards match current overview filters.', { icon: '🎯', hint: 'Try clearing overview filter chips.' });
      return;
    }

    container.innerHTML = challenges.map((challenge) => `
      <div class="nature-challenge-card ${challenge.completed ? 'completed' : ''} ${isRecentUpdateActive() ? 'is-recently-updated' : ''}">
        ${renderWhyShownBadge(challenge)}
        <div class="nature-challenge-card-header">${escapeHtml(formatProgressionHeading(challenge.icon, challenge.title))}</div>
        <div class="nature-challenge-card-description">${escapeHtml(challenge.description)}</div>
        <div class="nature-challenge-progress"><div class="nature-challenge-progress-fill" style="width:${challenge.pct}%;"></div></div>
        <div class="nature-challenge-meta"><span>${escapeHtml(formatProgressSummary(challenge).fraction)}</span><span>${escapeHtml(formatProgressSummary(challenge).status)}</span></div>
      </div>
    `).join('');
  }

  function renderBirdBadges(badges, containerId = 'birdsBadgeGrid') {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!Array.isArray(badges) || badges.length === 0) {
      container.innerHTML = buildUnifiedStateHtml('No badge cards match current overview filters.', { icon: '🏅', hint: 'Try clearing overview filter chips.' });
      return;
    }

    container.innerHTML = badges.map((badge) => `
      <div class="nature-badge-card ${badge.completed ? 'unlocked' : 'locked'} ${badge.rarityClass} ${isRecentUpdateActive() ? 'is-recently-updated' : ''}">
        ${renderWhyShownBadge(badge)}
        <div class="nature-badge-icon">${escapeHtml(badge.icon)}</div>
        <div class="nature-badge-card-title">${escapeHtml(badge.title)}</div>
        <div class="nature-badge-card-description">${escapeHtml(badge.description)}</div>
        <div class="nature-badge-progress">${escapeHtml(formatProgressSummary(badge).summary)}</div>
        <div class="nature-progress-track"><div class="nature-progress-fill" style="width:${badge.pct}%;"></div></div>
      </div>
    `).join('');
  }

  function renderBirdDailyChallenges(challenges) {
    const container = document.getElementById('birdsDailyChallengeGrid');
    if (!container) return;
    if (!Array.isArray(challenges) || challenges.length === 0) {
      container.innerHTML = buildUnifiedStateHtml('Daily micro-challenges will appear after load.', { icon: '⚡' });
      return;
    }

    container.innerHTML = challenges.map((challenge) => `
      <div class="nature-challenge-card ${challenge.completed ? 'completed' : ''} ${isRecentUpdateActive() ? 'is-recently-updated' : ''}">
        <div class="nature-challenge-card-header">${escapeHtml(formatProgressionHeading(challenge.icon, challenge.title))}</div>
        <div class="nature-challenge-card-description">${escapeHtml(challenge.description)}</div>
        <div class="nature-challenge-progress"><div class="nature-challenge-progress-fill" style="width:${challenge.pct}%;"></div></div>
        <div class="nature-challenge-meta"><span>${escapeHtml(formatProgressSummary(challenge).fraction)}</span><span>${escapeHtml(formatProgressSummary(challenge).status)}</span></div>
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

  function renderBirdBingoPanel(bingo, options = {}) {
    const meta = document.getElementById(options.metaId || 'birdsBingoMeta');
    const grid = document.getElementById(options.containerId || 'birdsBingoGrid');
    const rerollBtn = document.getElementById('birdsBingoRefreshBtn');
    if (!meta || !grid) return;

    const completedCount = Number.isFinite(options.completedCountOverride)
      ? options.completedCountOverride
      : bingo.completedCount;
    const totalTileCount = Number.isFinite(options.totalTileCountOverride)
      ? options.totalTileCountOverride
      : bingo.tiles.length;
    if (!Array.isArray(bingo.tiles) || bingo.tiles.length === 0) {
      meta.textContent = `${completedCount}/${totalTileCount} tiles complete`;
      grid.innerHTML = buildUnifiedStateHtml('No bingo tiles match current overview filters.', { icon: '🟩', hint: 'Try clearing overview filter chips.' });
      return;
    }
    meta.textContent = `${completedCount}/${totalTileCount} tiles complete${bingo.bingoAchieved ? ' | Bingo unlocked!' : ''}`;
    grid.innerHTML = bingo.tiles.map((tile) => `
      <div class="nature-badge-card ${tile.completed ? 'unlocked' : 'locked'} ${isRecentUpdateActive() ? 'is-recently-updated' : ''}">
        ${renderWhyShownBadge(tile)}
        <div class="nature-badge-card-title">${escapeHtml(tile.label)}</div>
        <div class="nature-badge-progress">${escapeHtml(formatProgressSummary(tile).summary)}</div>
        <div class="nature-progress-track"><div class="nature-progress-fill" style="width:${tile.pct}%;"></div></div>
      </div>
    `).join('');

    if (!options.allowRerollControl) return;
    if (!rerollBtn) return;
    rerollBtn.disabled = !bingo.canReroll;
    rerollBtn.textContent = bingo.canReroll ? 'Reroll Bingo Card (1/season)' : 'Bingo Reroll Used';
  }

  function renderSeasonQuestlinePanel(questline, stats, options = {}) {
    const container = document.getElementById(options.containerId || 'birdsSeasonQuestGrid');
    const meta = document.getElementById(options.metaId || 'birdsSeasonQuestMeta');
    if (!container || !meta) return;

    meta.textContent = `${stats.currentSeasonLabel} chapter: ${questline.completedCount}/${questline.steps.length} steps completed`;
    if (!Array.isArray(questline.steps) || questline.steps.length === 0) {
      container.innerHTML = buildUnifiedStateHtml('No seasonal quests match current overview filters.', { icon: '📚', hint: 'Try clearing overview filter chips.' });
      return;
    }
    container.innerHTML = questline.steps.map((step) => `
      <div class="nature-challenge-card ${step.completed ? 'completed' : ''} ${isRecentUpdateActive() ? 'is-recently-updated' : ''}">
        ${renderWhyShownBadge(step)}
        <div class="nature-challenge-card-header">${escapeHtml(formatProgressionHeading(step.icon, step.title))}</div>
        <div class="nature-challenge-card-description">${escapeHtml(step.description)}</div>
        <div class="nature-challenge-progress"><div class="nature-challenge-progress-fill" style="width:${step.pct}%;"></div></div>
        <div class="nature-challenge-meta"><span>${escapeHtml(formatProgressSummary(step).fraction)}</span><span>${escapeHtml(formatProgressSummary(step).status)}</span></div>
      </div>
    `).join('');
  }


  function getBirdSearchQuery() {
    return norm(state.birdSearch);
  }

  function getBirdSearchIntent() {
    const raw = String(state.birdSearch || '').trim();
    const normalized = norm(raw);
    const cleaned = normalized.replace(/[^a-z0-9\s-]+/g, ' ').replace(/\s+/g, ' ').trim();
    const words = cleaned ? cleaned.split(' ') : [];
    const consumed = new Array(words.length).fill(false);

    const flags = {
      notSeen: false,
      seen: false,
      rare: false,
      favorites: false,
      migration: false,
      seenRecently: false,
      notSeenRecently: false
    };
    let season = '';
    let region = '';
    let habitat = '';

    const consumePhrase = (phrase, onMatch) => {
      const parts = phrase.split(' ');
      const maxStart = words.length - parts.length;
      for (let i = 0; i <= maxStart; i += 1) {
        let matches = true;
        for (let j = 0; j < parts.length; j += 1) {
          if (words[i + j] !== parts[j] || consumed[i + j]) {
            matches = false;
            break;
          }
        }
        if (!matches) continue;
        for (let j = 0; j < parts.length; j += 1) consumed[i + j] = true;
        onMatch();
      }
    };

    // Expected interpretation examples:
    // - "migration heron" => migration=true, season=migration, freeText="heron"
    // - "rare not seen" => rare=true + notSeen=true (notSeen overrides seen)
    // - "winter marsh" => season=winter, region=marsh, habitat=marsh
    consumePhrase('not seen recently', () => { flags.notSeenRecently = true; });
    consumePhrase('not recently seen', () => { flags.notSeenRecently = true; });
    consumePhrase('seen recently', () => { flags.seenRecently = true; });
    consumePhrase('recently seen', () => { flags.seenRecently = true; });
    consumePhrase('not yet seen', () => { flags.notSeen = true; });
    consumePhrase('not seen', () => { flags.notSeen = true; });
    consumePhrase('not-yet-seen', () => { flags.notSeen = true; });
    consumePhrase('not yet', () => { flags.notSeen = true; });
    consumePhrase('already seen', () => { flags.seen = true; });
    consumePhrase('seen', () => { flags.seen = true; });
    consumePhrase('sighted', () => { flags.seen = true; });
    consumePhrase('unseen', () => { flags.notSeen = true; });
    consumePhrase('very rare', () => { flags.rare = true; });
    consumePhrase('rare', () => { flags.rare = true; });
    consumePhrase('favorite', () => { flags.favorites = true; });
    consumePhrase('favorites', () => { flags.favorites = true; });
    consumePhrase('favourite', () => { flags.favorites = true; });
    consumePhrase('favourites', () => { flags.favorites = true; });
    consumePhrase('migration', () => {
      flags.migration = true;
      season = season || 'migration';
    });
    ['spring', 'summer', 'fall', 'winter'].forEach((token) => {
      consumePhrase(token, () => { season = season || token; });
    });
    consumePhrase('coastal', () => {
      region = region || 'coast';
      habitat = habitat || 'coast';
    });
    ['coast', 'marsh', 'forest', 'urban'].forEach((token) => {
      consumePhrase(token, () => {
        region = region || token;
        habitat = habitat || token;
      });
    });

    // Precedence: negated variants win over positive variants.
    if (flags.notSeen) flags.seen = false;
    if (flags.notSeenRecently) flags.seenRecently = false;

    const scrubbed = words.filter((_, index) => !consumed[index]).join(' ').trim();

    return {
      raw,
      normalized,
      flags,
      season,
      region,
      habitat,
      freeText: scrubbed
    };
  }

  function updateBirdSearchSuggestions() {
    const datalist = document.getElementById('birdsExplorerSearchSuggestions');
    if (!datalist || !state.birdsLoaded) return;
    const intent = getBirdSearchIntent();
    const q = intent.normalized;
    const familyMatches = state.birds
      .map((bird) => bird.familyLabel)
      .filter(Boolean)
      .filter((name, idx, list) => list.indexOf(name) === idx)
      .filter((name) => !q || norm(name).includes(q))
      .slice(0, 4);
    const speciesMatches = state.birds
      .map((bird) => bird.speciesName)
      .filter((name) => !q || norm(name).includes(q))
      .slice(0, 6);
    const generic = [
      'rare birds',
      'very rare birds',
      'migration birds',
      'coastal birds',
      'rare not seen',
      'winter marsh',
      'favorite coast',
      'seen recently',
      'not seen recently',
      'in season not seen'
    ];
    const options = speciesMatches
      .concat(familyMatches)
      .concat(generic.filter((item) => !q || norm(item).includes(q)))
      .filter((item, index, list) => list.indexOf(item) === index)
      .slice(0, 12);
    datalist.innerHTML = options.map((item) => `<option value="${escapeHtml(item)}"></option>`).join('');
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
        return `<button type="button" class="nature-chip-filter ${isActive ? 'is-active' : ''}" data-birds-filter-chip="family" data-chip-value="${escapeHtml(family)}" ${tooltipAttrs(`Filter to ${getFamilyChipLabel(family)} family Birds`)}>${escapeHtml(getFamilyChipLabel(family))}</button>`;
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
      if (group === 'focus') active = (state.birdFilters.focusChips || []).includes(value);
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
          : group === 'focus'
            ? 'focusChips'
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
    state.birdLoadMoreRows = 0;
    state.birdPaginationMode = 'paged';
    state.birdPage = 1;
    state.birdFilters = {
      season: 'all',
      rarity: 'all',
      family: 'all',
      region: 'all',
      habitat: 'all',
      sightingStatus: 'all',
      favoritesOnly: false,
      notYetSeenOnly: false,
      alreadySeenOnly: false,
      seenRecentlyOnly: false,
      notSeenRecentlyOnly: false,
      favoritedOnly: false,
      inSeasonNotSeenOnly: false,
      rareNotSeenOnly: false,
      seasonChips: [],
      rarityChips: [],
      familyChips: [],
      focusChips: []
    };
  }

  function clearBirdChipFilters() {
    state.birdFilters.seasonChips = [];
    state.birdFilters.rarityChips = [];
    state.birdFilters.familyChips = [];
    state.birdFilters.focusChips = [];
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
    else if (filterKey === 'sighting-status') state.birdFilters.sightingStatus = 'all';
    else if (filterKey === 'favorites-only') state.birdFilters.favoritesOnly = false;
    else if (filterKey === 'not-yet-seen') state.birdFilters.notYetSeenOnly = false;
    else if (filterKey === 'already-seen') state.birdFilters.alreadySeenOnly = false;
    else if (filterKey === 'seen-recently') state.birdFilters.seenRecentlyOnly = false;
    else if (filterKey === 'not-seen-recently') state.birdFilters.notSeenRecentlyOnly = false;
    else if (filterKey === 'favorited-only') state.birdFilters.favoritedOnly = false;
    else if (filterKey === 'in-season-not-seen') state.birdFilters.inSeasonNotSeenOnly = false;
    else if (filterKey === 'rare-not-seen') state.birdFilters.rareNotSeenOnly = false;
    else if (filterKey.startsWith('season-chip:')) {
      const value = filterKey.slice('season-chip:'.length);
      state.birdFilters.seasonChips = (state.birdFilters.seasonChips || []).filter((entry) => entry !== value);
    } else if (filterKey.startsWith('rarity-chip:')) {
      const value = filterKey.slice('rarity-chip:'.length);
      state.birdFilters.rarityChips = (state.birdFilters.rarityChips || []).filter((entry) => entry !== value);
    } else if (filterKey.startsWith('family-chip:')) {
      const value = filterKey.slice('family-chip:'.length);
      state.birdFilters.familyChips = (state.birdFilters.familyChips || []).filter((entry) => entry !== value);
    } else if (filterKey.startsWith('focus-chip:')) {
      const value = filterKey.slice('focus-chip:'.length);
      state.birdFilters.focusChips = (state.birdFilters.focusChips || []).filter((entry) => entry !== value);
    }

    state.birdPage = 1;
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
      'sighted-recent': 'Recently sighted first',
      'best-next-targets': 'Best next targets',
      'best-today': 'Best for today',
      'best-quests': 'Best for quests',
      'best-badges': 'Best for badges',
      'family-completion': 'Best for family completion',
      'not-seen-opportunity': 'Best not-yet-seen opportunities'
    };

    const pills = [];
    if (state.birdSearch.trim()) pills.push({ key: 'search', label: `Search: ${state.birdSearch.trim()}` });
    if (state.birdSort !== 'family-asc') pills.push({ key: 'sort', label: `Sort: ${sortLabelMap[state.birdSort] || state.birdSort}` });
    if (state.birdFilters.season !== 'all') pills.push({ key: 'season-select', label: `Season: ${state.birdFilters.season}` });
    if (state.birdFilters.rarity !== 'all') pills.push({ key: 'rarity-select', label: `Rarity: ${state.birdFilters.rarity}` });
    if (state.birdFilters.family !== 'all') pills.push({ key: 'family-select', label: `Family: ${state.birdFilters.family}` });
    if (state.birdFilters.region !== 'all') pills.push({ key: 'region-select', label: `Region: ${state.birdFilters.region}` });
    if (state.birdFilters.habitat !== 'all') pills.push({ key: 'habitat-select', label: `Habitat: ${state.birdFilters.habitat}` });
    if (state.birdFilters.sightingStatus && state.birdFilters.sightingStatus !== 'all') pills.push({ key: 'sighting-status', label: `Seen status: ${state.birdFilters.sightingStatus}` });
    if (state.birdFilters.favoritesOnly) pills.push({ key: 'favorites-only', label: 'Favorites only' });
    if (state.birdFilters.notYetSeenOnly) pills.push({ key: 'not-yet-seen', label: 'Not yet sighted' });
    if (state.birdFilters.alreadySeenOnly) pills.push({ key: 'already-seen', label: 'Already sighted' });
    if (state.birdFilters.seenRecentlyOnly) pills.push({ key: 'seen-recently', label: 'Seen recently' });
    if (state.birdFilters.notSeenRecentlyOnly) pills.push({ key: 'not-seen-recently', label: 'Not seen recently' });
    if (state.birdFilters.favoritedOnly) pills.push({ key: 'favorited-only', label: 'Favorited' });
    if (state.birdFilters.inSeasonNotSeenOnly) pills.push({ key: 'in-season-not-seen', label: 'In season + not seen' });
    if (state.birdFilters.rareNotSeenOnly) pills.push({ key: 'rare-not-seen', label: 'Rare + not seen' });
    (state.birdFilters.seasonChips || []).forEach((value) => pills.push({ key: `season-chip:${value}`, label: `Season chip: ${value}` }));
    (state.birdFilters.rarityChips || []).forEach((value) => pills.push({ key: `rarity-chip:${value}`, label: `Rarity chip: ${value}` }));
    (state.birdFilters.familyChips || []).forEach((value) => pills.push({ key: `family-chip:${value}`, label: `Family chip: ${getFamilyChipLabel(value)}` }));
    (state.birdFilters.focusChips || []).forEach((value) => pills.push({ key: `focus-chip:${value}`, label: `Focus chip: ${value}` }));

    row.hidden = pills.length === 0;
    pillsContainer.innerHTML = pills.map((pill) => `
      <span class="nature-active-filter-pill">
        ${escapeHtml(pill.label)}
        <button type="button" data-birds-remove-filter="${escapeHtml(pill.key)}" aria-label="Remove ${escapeHtml(pill.label)}" ${tooltipAttrs(`Remove ${pill.label}`)}>x</button>
      </span>
    `).join('');
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
    const sightingStatusSelect = document.getElementById('birdsExplorerSightingStatusFilter');
    const favoritesOnlyToggle = document.getElementById('birdsExplorerFavoritesOnly');
    const pageJumpInput = document.getElementById('birdsExplorerPageJumpInput');
    const paginationModeSelect = document.getElementById('birdsExplorerPaginationMode');

    if (searchInput) searchInput.value = state.birdSearch;
    if (sortSelect) sortSelect.value = state.birdSort;
    if (pageSizeSelect) pageSizeSelect.value = String(state.birdPageSize);
    if (seasonSelect) seasonSelect.value = state.birdFilters.season;
    if (raritySelect) raritySelect.value = state.birdFilters.rarity;
    if (familySelect) familySelect.value = state.birdFilters.family;
    if (regionSelect) regionSelect.value = state.birdFilters.region;
    if (habitatSelect) habitatSelect.value = state.birdFilters.habitat;
    if (sightingStatusSelect) sightingStatusSelect.value = state.birdFilters.sightingStatus || 'all';
    if (favoritesOnlyToggle) favoritesOnlyToggle.checked = Boolean(state.birdFilters.favoritesOnly);
    if (pageJumpInput) pageJumpInput.value = String(state.birdPage || 1);
    if (paginationModeSelect) paginationModeSelect.value = ['paged', 'load-more'].includes(state.birdPaginationMode) ? state.birdPaginationMode : 'paged';
    const bindToggle = (id, checked) => {
      const el = document.getElementById(id);
      if (el) el.checked = Boolean(checked);
    };
    bindToggle('birdsExplorerToggleNotYetSeen', state.birdFilters.notYetSeenOnly);
    bindToggle('birdsExplorerToggleAlreadySeen', state.birdFilters.alreadySeenOnly);
    bindToggle('birdsExplorerToggleSeenRecently', state.birdFilters.seenRecentlyOnly);
    bindToggle('birdsExplorerToggleNotSeenRecently', state.birdFilters.notSeenRecentlyOnly);
    bindToggle('birdsExplorerToggleFavorited', state.birdFilters.favoritedOnly);
    bindToggle('birdsExplorerToggleInSeasonNotSeen', state.birdFilters.inSeasonNotSeenOnly);
    bindToggle('birdsExplorerToggleRareNotSeen', state.birdFilters.rareNotSeenOnly);
    setChipButtonState();
    applyExplorerDensity(document.getElementById('natureChallengeRoot'));
  }

  function renderExplorerOfflineStatusLine() {
    const el = document.getElementById('birdsExplorerOfflineStatus');
    if (!el) return;
    const lastSync = state.lastSyncSuccessAt ? parseObservedDate(state.lastSyncSuccessAt) : null;
    const lastSyncCopy = lastSync
      ? `Last synced ${lastSync.toLocaleDateString()} at ${lastSync.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
      : 'Last synced locally';
    const localLogs = Array.isArray(state.sightingLog) ? state.sightingLog.length : 0;
    el.textContent = `Bird list available offline | ${lastSyncCopy} | Explorer ready for field use | ${localLogs} recent logs saved locally`;
  }

  function renderSearchIntentBadges(intent) {
    const row = document.getElementById('birdsSearchIntentBadges');
    if (!row) return;
    const chips = [];
    if (intent.flags.notSeen) chips.push('Not yet seen');
    if (intent.flags.seen) chips.push('Seen');
    if (intent.flags.rare) chips.push('Rare or better');
    if (intent.flags.favorites) chips.push('Favorited');
    if (intent.flags.migration) chips.push('Migration birds');
    if (intent.flags.seenRecently) chips.push('Seen recently');
    if (intent.flags.notSeenRecently) chips.push('Not seen recently');
    if (intent.season) chips.push(`Season: ${toTitleCase(intent.season)}`);
    if (intent.region) chips.push(`Region: ${toTitleCase(intent.region)}`);
    if (intent.habitat) chips.push(`Habitat: ${toTitleCase(intent.habitat)}`);
    if (!chips.length) {
      row.hidden = true;
      row.innerHTML = '';
      return;
    }
    row.hidden = false;
    row.innerHTML = chips
      .slice(0, 8)
      .map((label) => `<span class="nature-search-intent-chip">Interpreted: ${escapeHtml(label)}</span>`)
      .join('');
  }

  function toTitleCase(value) {
    const raw = String(value || '').trim();
    if (!raw) return 'Unknown';
    return raw
      .split(/\s+/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  function buildFamilyProgressLookup(stats) {
    const lookup = {};
    const list = Array.isArray(stats && stats.familyProgress) ? stats.familyProgress : [];
    list.forEach((family) => {
      lookup[family.key] = family;
    });
    return lookup;
  }

  function getBirdExplorerInsight(bird, stats, familyLookup) {
    const seen = isBirdSighted(bird);
    const inSeason = Boolean(bird && bird.seasons && Array.isArray(bird.seasons.tokens) && bird.seasons.tokens.includes(stats.currentSeason));
    const favorite = isBirdFavorited(bird);
    const sightedAt = getSightingDate(bird);
    const seenRecently = Boolean(sightedAt && ((Date.now() - sightedAt.getTime()) / (1000 * 60 * 60 * 24)) <= 14);
    const family = familyLookup[bird.familyKey] || null;
    const familyRemaining = family ? Math.max(0, family.species.length - family.sightedCount) : 99;
    const nearCompletion = familyRemaining > 0 && familyRemaining <= 2;
    const highValue = bird.rarity.weight >= RARITY_META.rare.weight;
    const rareChance = bird.rarity.weight >= RARITY_META.veryRare.weight && inSeason;
    const seasonalTarget = !seen && inSeason;
    const recommended = seasonalTarget || nearCompletion || rareChance || (favorite && inSeason);

    const reasons = [];
    if (inSeason) reasons.push('In season now');
    if (!seen) reasons.push('You have not seen this one yet');
    if (favorite) reasons.push('Favorited');
    if (highValue && !seen) reasons.push('Rare opportunity');
    if (nearCompletion && !seen) reasons.push('Helps complete a family');
    if (seasonalTarget || nearCompletion || (highValue && !seen)) reasons.push('Good fit for your current quest');
    if (seenRecently) reasons.push('Seen recently');
    if (!reasons.length) reasons.push('Good optional target');

    let priorityLabel = 'Optional target';
    let priorityClass = '';
    if (rareChance && !seen) {
      priorityLabel = 'Rare chance';
      priorityClass = 'is-rare';
    } else if (nearCompletion && !seen) {
      priorityLabel = 'Progress boost';
      priorityClass = 'is-progress';
    } else if (seasonalTarget) {
      priorityLabel = 'Look for now';
      priorityClass = 'is-progress';
    }

    let score = 0;
    if (!seen) score += 55;
    if (inSeason) score += 28;
    if (!inSeason) score -= 14;
    if (nearCompletion) score += 24;
    if (highValue) score += 16;
    if (favorite) score += 8;
    if (seenRecently) score -= 8;

    return {
      seen,
      inSeason,
      favorite,
      nearCompletion,
      highValue,
      rareChance,
      recommended,
      seasonalTarget,
      familyRemaining,
      reasons,
      primaryReason: reasons[0] || 'Good optional target',
      priorityLabel,
      priorityClass,
      score,
      seenRecently,
      bestHabitat: toTitleCase(bird.defaultHabitat || ''),
      bestRegion: toTitleCase(bird.defaultRegion || '')
    };
  }

  function sortExplorerBirds(birds) {
    const sorted = (Array.isArray(birds) ? birds : []).slice();
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

    if (['best-next-targets', 'best-today', 'best-quests', 'best-badges', 'family-completion', 'not-seen-opportunity'].includes(state.birdSort)) {
      const stats = state.birdCollectionsCache && state.birdCollectionsCache.stats ? state.birdCollectionsCache.stats : getBirdStats();
      const familyLookup = buildFamilyProgressLookup(stats);
      sorted.sort((a, b) => {
        const ai = getBirdExplorerInsight(a, stats, familyLookup);
        const bi = getBirdExplorerInsight(b, stats, familyLookup);
        const aScore = state.birdSort === 'best-today'
          ? ai.score + (ai.inSeason ? 18 : -6)
          : state.birdSort === 'family-completion'
            ? ai.score + (ai.familyRemaining === 1 ? 24 : ai.familyRemaining === 2 ? 12 : 0)
            : state.birdSort === 'not-seen-opportunity'
              ? ai.score + (ai.seen ? -24 : 20)
              : ai.score;
        const bScore = state.birdSort === 'best-today'
          ? bi.score + (bi.inSeason ? 18 : -6)
          : state.birdSort === 'family-completion'
            ? bi.score + (bi.familyRemaining === 1 ? 24 : bi.familyRemaining === 2 ? 12 : 0)
            : state.birdSort === 'not-seen-opportunity'
              ? bi.score + (bi.seen ? -24 : 20)
              : bi.score;
        if (bScore !== aScore) return bScore - aScore;
        return bySpecies(a, b);
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
        const at = getSightingDate(a);
        const bt = getSightingDate(b);
        const av = at ? at.getTime() : -1;
        const bv = bt ? bt.getTime() : -1;
        if (bv !== av) return bv - av;
        return bySpecies(a, b);
      });
      return sorted;
    }

    sorted.sort((a, b) => a.familyLabel.localeCompare(b.familyLabel) || bySpecies(a, b));
    return sorted;
  }

  function renderBirdExplorerRecommendationStrip(stats, familyLookup) {
    const container = document.getElementById('birdsExplorerRecommendationStrip');
    if (!container) return;
    if (!state.birdsLoaded) {
      container.textContent = 'Loading recommendations...';
      return;
    }

    const candidates = sortExplorerBirds(state.birds)
      .map((bird) => ({ bird, insight: getBirdExplorerInsight(bird, stats, familyLookup) }))
      .filter((entry) => !entry.insight.seen)
      .slice(0, 8);

    if (!candidates.length) {
      container.innerHTML = '<section class="nature-explorer-reco-card"><div class="nature-explorer-reco-title">What to look for now</div><div class="nature-explorer-reco-subtitle">No unlogged targets right now.</div></section>';
      return;
    }

    const topNow = candidates.slice(0, 4);
    const rareNow = candidates.filter((entry) => entry.insight.rareChance || entry.bird.rarity.weight >= RARITY_META.rare.weight).slice(0, 4);
    const progressNow = candidates.filter((entry) => entry.insight.nearCompletion || entry.insight.seasonalTarget).slice(0, 4);

    const renderBucket = (title, subtitle, list) => `
      <section class="nature-explorer-reco-card">
        <div class="nature-explorer-reco-title">${escapeHtml(title)}</div>
        <div class="nature-explorer-reco-subtitle">${escapeHtml(subtitle)}</div>
        <div class="nature-explorer-reco-list">
          ${(list || []).map((entry) => `
            <button type="button" class="nature-explorer-reco-btn" data-bird-open="${escapeHtml(entry.bird.id)}" ${tooltipAttrs(`Open bird details for ${entry.bird.speciesName}`)}>
              ${escapeHtml(entry.bird.speciesName)} - ${escapeHtml(entry.insight.primaryReason)}
            </button>
          `).join('') || '<span class="card-subtitle">No recommendations in this bucket right now.</span>'}
        </div>
      </section>
    `;

    container.innerHTML = [
      renderBucket('Look for these today', 'Best birds for right now', topNow),
      renderBucket('Rare opportunities', 'High rarity birds worth prioritizing', rareNow),
      renderBucket('Progress opportunities', 'Strong progress and completion targets', progressNow)
    ].join('');
  }

  function filterBirdsForExplorer() {
    const query = getBirdSearchQuery();
    const intent = getBirdSearchIntent();
    const stats = state.birdCollectionsCache && state.birdCollectionsCache.stats ? state.birdCollectionsCache.stats : getBirdStats();
    const familyLookup = buildFamilyProgressLookup(stats);

    let filtered = state.birds.filter((bird) => {
      const insight = getBirdExplorerInsight(bird, stats, familyLookup);
      if (state.birdFilters.seasonChips.length > 0 && !state.birdFilters.seasonChips.some((token) => bird.seasons.tokens.includes(token))) return false;
      if (state.birdFilters.rarityChips.length > 0 && !state.birdFilters.rarityChips.includes(bird.rarity.key)) return false;
      if (state.birdFilters.familyChips.length > 0 && !state.birdFilters.familyChips.includes(bird.familyLabel)) return false;
      const focusChips = state.birdFilters.focusChips || [];
      if (focusChips.includes('not-yet-sighted') && insight.seen) return false;
      if (focusChips.includes('in-season') && !insight.inSeason) return false;
      if (focusChips.includes('high-value') && !insight.highValue) return false;
      if (focusChips.includes('near-completion') && !insight.nearCompletion) return false;
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
      if (intent.flags.seenRecently && !insight.seenRecently) return false;
      if (intent.flags.notSeenRecently && insight.seenRecently) return false;
      if (intent.flags.seen && !insight.seen) return false;
      if (intent.flags.notSeen && insight.seen) return false;
      if (intent.flags.rare && bird.rarity.weight < RARITY_META.rare.weight) return false;
      if (intent.flags.favorites && !insight.favorite) return false;
      if (intent.flags.migration && !bird.seasons.tokens.includes('migration')) return false;
      if (intent.season && !bird.seasons.tokens.includes(intent.season)) return false;
      if (intent.region) {
        const regionMatch = norm(bird.defaultRegion) === norm(intent.region) || birdHasLoggedContext(bird, 'region', intent.region);
        if (!regionMatch) return false;
      }
      if (intent.habitat) {
        const habitatMatch = norm(bird.defaultHabitat) === norm(intent.habitat) || birdHasLoggedContext(bird, 'habitat', intent.habitat);
        if (!habitatMatch) return false;
      }

      if (!query) return true;
      const searchable = [
        bird.speciesName,
        bird.familyLabel,
        bird.genusLabel,
        bird.rarity.label,
        bird.rarity.raw,
        bird.seasons.raw,
        bird.seasons.tokens.join(' '),
        bird.defaultHabitat,
        bird.defaultRegion,
        ...Object.values(bird.details || {})
      ].join(' ');
      const needle = intent.freeText || query;
      return norm(searchable).includes(needle);
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
              <button type="button" class="card-btn card-btn-primary" data-bird-open="${escapeHtml(bird.id)}" ${tooltipAttrs(`Open bird details for ${bird.speciesName}`)}>Open Details</button>
              <button type="button" class="nature-bird-fav-btn is-favorited" data-bird-favorite="${escapeHtml(bird.id)}" ${tooltipAttrs(`Remove ${bird.speciesName} from favorites`)}>★ Favorited</button>
              <button type="button" class="card-btn" data-bird-toggle="${escapeHtml(bird.id)}" ${tooltipAttrs(`Mark ${bird.speciesName} as ${sighted ? 'not sighted' : 'sighted'}`)}>${sighted ? 'Mark Not Sighted' : 'Mark Sighted'}</button>
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
      renderBirdExplorerRecommendationStrip({ currentSeason: getCurrentSeason(), familyProgress: [] }, {});
      renderPinnedFavorites();
      renderActiveFilterSummary();
      container.innerHTML = buildUnifiedStateHtml('Bird data is still loading.', { icon: '⏳', hint: 'Try refresh if loading takes unusually long.' });
      meta.textContent = 'Loading birds...';
      return;
    }

    updateFamilyFilterOptions();
    applyExplorerControlsFromState();
    renderActiveFilterSummary();
    renderExplorerOfflineStatusLine();
    renderSearchIntentBadges(getBirdSearchIntent());
    renderPinnedFavorites();
    updateBirdSearchSuggestions();
    const stats = state.birdCollectionsCache && state.birdCollectionsCache.stats ? state.birdCollectionsCache.stats : getBirdStats();
    const familyLookup = buildFamilyProgressLookup(stats);
    renderBirdExplorerRecommendationStrip(stats, familyLookup);

    const filtered = filterBirdsForExplorer();

    const pagerMode = ['paged', 'load-more'].includes(state.birdPaginationMode) ? state.birdPaginationMode : 'paged';
    const pageSize = Math.max(1, Number(state.birdPageSize) || 12);
    const visibleCount = pagerMode === 'load-more' ? Math.max(pageSize, pageSize + Number(state.birdLoadMoreRows || 0)) : pageSize;
    const totalPages = Math.max(1, Math.ceil(filtered.length / visibleCount));
    state.birdPage = Math.max(1, Math.min(totalPages, Number(state.birdPage) || 1));
    const pageStart = pagerMode === 'load-more' ? 0 : (state.birdPage - 1) * visibleCount;
    const pageItems = filtered.slice(pageStart, pageStart + visibleCount);

    meta.textContent = pagerMode === 'load-more'
      ? `${pageItems.length} of ${filtered.length} species shown | load-more mode`
      : `${filtered.length} of ${state.birds.length} species shown | page ${state.birdPage}/${totalPages}`;

    const pageInfo = document.getElementById('birdsExplorerPageInfo');
    const rangeInfo = document.getElementById('birdsExplorerRangeInfo');
    const firstBtn = document.getElementById('birdsExplorerFirstPageBtn');
    const prevBtn = document.getElementById('birdsExplorerPrevPageBtn');
    const nextBtn = document.getElementById('birdsExplorerNextPageBtn');
    const lastBtn = document.getElementById('birdsExplorerLastPageBtn');
    const jumpInput = document.getElementById('birdsExplorerPageJumpInput');
    const loadMoreBtn = document.getElementById('birdsExplorerLoadMoreBtn');
    const paginationModeSelect = document.getElementById('birdsExplorerPaginationMode');
    if (pageInfo) pageInfo.textContent = pagerMode === 'load-more' ? `Loaded ${pageItems.length}` : `Page ${state.birdPage} of ${totalPages}`;
    if (jumpInput) jumpInput.value = String(state.birdPage);
    if (paginationModeSelect) paginationModeSelect.value = ['paged', 'load-more'].includes(state.birdPaginationMode) ? state.birdPaginationMode : 'paged';

    if (rangeInfo) {
      const start = filtered.length ? pageStart + 1 : 0;
      const end = Math.min(filtered.length, pageStart + pageItems.length);
      rangeInfo.textContent = `Showing ${start}-${end} of ${filtered.length}`;
    }

    const hasMoreToLoad = pageItems.length < filtered.length;
    if (firstBtn) {
      firstBtn.hidden = pagerMode === 'load-more';
      firstBtn.disabled = state.birdPage <= 1;
    }
    if (prevBtn) {
      prevBtn.hidden = pagerMode === 'load-more';
      prevBtn.disabled = state.birdPage <= 1;
    }
    if (nextBtn) {
      nextBtn.hidden = pagerMode === 'load-more';
      nextBtn.disabled = state.birdPage >= totalPages;
    }
    if (lastBtn) {
      lastBtn.hidden = pagerMode === 'load-more';
      lastBtn.disabled = state.birdPage >= totalPages;
    }
    if (jumpInput) jumpInput.hidden = pagerMode === 'load-more';
    const jumpLabel = document.querySelector('label[for="birdsExplorerPageJumpInput"]');
    if (jumpLabel) jumpLabel.hidden = pagerMode === 'load-more';
    const jumpBtn = document.getElementById('birdsExplorerJumpPageBtn');
    if (jumpBtn) jumpBtn.hidden = pagerMode === 'load-more';
    if (loadMoreBtn) {
      loadMoreBtn.hidden = pagerMode !== 'load-more';
      loadMoreBtn.disabled = !hasMoreToLoad;
      loadMoreBtn.textContent = hasMoreToLoad ? `Load more (${Math.min(12, filtered.length - pageItems.length)} more)` : 'All birds loaded';
    }

    const fieldMode = state.explorerDensity === 'field';

    if (filtered.length === 0) {
      container.innerHTML = `
        ${buildUnifiedStateHtml('No birds matched your search.', { icon: '🔎', hint: 'Try fewer filters or use one of the quick fixes below.' })}
        <div class="nature-log-form-actions" style="justify-content:center; margin-top:8px;">
          <button type="button" class="pill-button" data-birds-empty-action="show-in-season" ${tooltipAttrs('Show only in-season Birds')}>Show in-season only</button>
          <button type="button" class="pill-button" data-birds-empty-action="clear-high-reward" ${tooltipAttrs('Clear the high-value overview filter')}>Clear high reward filter</button>
          <button type="button" class="pill-button" data-birds-empty-action="clear-overview" ${tooltipAttrs('Clear the overview filters')}>Clear overview filters</button>
        </div>
      `;
      return;
    }

    container.innerHTML = pageItems.map((bird) => {
      const sighted = isBirdSighted(bird);
      const favorited = isBirdFavorited(bird);
      const sightedDate = getSightingDate(bird);
      const insight = getBirdExplorerInsight(bird, stats, familyLookup);
      const whyReasonChips = insight.reasons.slice(0, fieldMode ? 3 : 6)
        .concat(state.birdFilters.habitat !== 'all' ? ['Matches habitat filter'] : [])
        .filter((item, index, list) => list.indexOf(item) === index)
        .map((reason) => `<span class="nature-why-chip">${escapeHtml(reason)}</span>`)
        .join('');
      const seasonChips = bird.seasons.tokens
        .map((seasonKey) => `<span class="nature-chip ${SEASON_META[seasonKey].className}">${escapeHtml(SEASON_META[seasonKey].label)}</span>`)
        .join('');

      return `
        <div class="adventure-card nature-bird-card ${bird.rarity.className}">
          <div class="adventure-card-header">
            <div class="nature-priority-badge ${escapeHtml(insight.priorityClass)}">${escapeHtml(insight.priorityLabel)}</div>
            <div class="adventure-card-title">${escapeHtml(bird.speciesName)}</div>
            <div class="adventure-card-location">Family: ${escapeHtml(bird.familyLabel)}</div>
            <div class="adventure-card-time">Genus: ${escapeHtml(bird.genusLabel)}</div>
          </div>
          <div class="adventure-card-body">
            <div class="nature-explorer-status-row">
              <span class="nature-explorer-status-pill ${sighted ? 'is-good' : 'is-alert'}">${sighted ? 'Seen' : 'Not seen'}</span>
              <span class="nature-explorer-status-pill ${insight.inSeason ? 'is-good' : ''}">${insight.inSeason ? 'In season now' : 'Out of season'}</span>
              <span class="nature-explorer-status-pill ${insight.recommended ? 'is-alert' : ''}">${insight.recommended ? 'Recommended' : 'Optional'}</span>
              <span class="nature-explorer-status-pill ${bird.rarity.weight >= RARITY_META.rare.weight ? 'is-rare' : ''}">${escapeHtml(bird.rarity.label)}</span>
            </div>
            <div class="nature-chip-row nature-chip-row--wrap">
              <span class="nature-chip ${bird.rarity.className}">${escapeHtml(bird.rarity.label)}</span>
              ${seasonChips}
            </div>
            <div class="card-subtitle">${sighted ? `Sighted on ${escapeHtml(sightedDate ? sightedDate.toLocaleDateString() : '')}` : 'Not sighted yet'}</div>
            <div class="nature-explorer-insight">Best habitat: ${escapeHtml(insight.bestHabitat)} | Best region: ${escapeHtml(insight.bestRegion)} | Quick ID cue: ${escapeHtml(idPointsFromBird(bird)[0])}</div>
            <div class="nature-why-showing-row">${whyReasonChips}</div>
          </div>
          <div class="adventure-card-footer">
            <div class="card-action-buttons">
              <button type="button" class="card-btn card-btn-primary" data-bird-open="${escapeHtml(bird.id)}" ${tooltipAttrs(`Open bird details for ${bird.speciesName}`)}>Open Details</button>
              <button type="button" class="nature-bird-fav-btn ${favorited ? 'is-favorited' : ''}" data-bird-favorite="${escapeHtml(bird.id)}" ${tooltipAttrs(`${favorited ? 'Remove' : 'Add'} ${bird.speciesName} ${favorited ? 'from' : 'to'} favorites`)}>${favorited ? '★ Favorited' : '☆ Favorite'}</button>
              <button type="button" class="card-btn" data-bird-toggle="${escapeHtml(bird.id)}" ${tooltipAttrs(`Mark ${bird.speciesName} as ${sighted ? 'not sighted' : 'sighted'}`)}>${fieldMode ? 'Log Sighting' : (sighted ? 'Mark Not Sighted' : 'Mark Sighted')}</button>
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

  function splitFieldNotes(raw, fallback) {
    const text = String(raw || '').trim();
    if (!text) return [fallback];
    const pieces = text
      .split(/[.;\n]+/)
      .map((part) => part.trim())
      .filter(Boolean);
    return pieces.length ? pieces.slice(0, 4) : [fallback];
  }

  function idPointsFromBird(bird) {
    const idHint = pickField(bird && bird.details ? bird.details : {}, ['Identification', 'Field Marks', 'Distinguishing Features']) || `Start with silhouette, bill shape, and wing profile for ${bird ? bird.speciesName : 'this bird'}.`;
    return splitFieldNotes(idHint, `Start with silhouette, bill shape, and wing profile for ${bird ? bird.speciesName : 'this bird'}.`);
  }

  function getSimilarBirdCandidates(bird, limit = 3) {
    if (!bird) return [];
    return state.birds
      .filter((candidate) => candidate.id !== bird.id)
      .filter((candidate) => candidate.familyKey === bird.familyKey || candidate.rarity.key === bird.rarity.key)
      .sort((a, b) => {
        const sameFamilyA = a.familyKey === bird.familyKey ? 1 : 0;
        const sameFamilyB = b.familyKey === bird.familyKey ? 1 : 0;
        if (sameFamilyB !== sameFamilyA) return sameFamilyB - sameFamilyA;
        return a.speciesName.localeCompare(b.speciesName);
      })
      .slice(0, Math.max(1, Number(limit) || 3));
  }

  function getBirdHistorySummary(bird) {
    const statusKey = getBirdStatusKey(bird);
    const logs = getBirdLogBySpeciesKey(statusKey);
    if (!logs.length) {
      return {
        count: 0,
        firstSeen: null,
        lastSeen: null,
        topRegion: '',
        topHabitat: '',
        notes: []
      };
    }

    const dated = logs
      .map((entry) => ({ entry, observed: parseObservedDate(entry.dateObserved || entry.createdAt) }))
      .filter((item) => item.observed)
      .sort((a, b) => a.observed.getTime() - b.observed.getTime());

    const tally = (field) => {
      const map = {};
      logs.forEach((entry) => {
        const key = norm(entry[field]);
        if (!key) return;
        map[key] = (map[key] || 0) + 1;
      });
      const top = Object.entries(map).sort((a, b) => b[1] - a[1])[0];
      return top ? toTitleCase(top[0]) : '';
    };

    return {
      count: logs.length,
      firstSeen: dated[0] ? dated[0].observed : null,
      lastSeen: dated[dated.length - 1] ? dated[dated.length - 1].observed : null,
      topRegion: tally('region'),
      topHabitat: tally('habitat'),
      notes: logs
        .map((entry) => String(entry.notes || '').trim())
        .filter(Boolean)
        .slice(-3)
    };
  }

  function renderBirdDetail() {
    const container = document.getElementById('birdsSpeciesDetailContent');
    if (!container) return;

    const bird = findBirdById(state.selectedBirdId);
    if (!bird) {
      container.innerHTML = `<div class="card">${buildUnifiedStateHtml('No bird selected yet.', { icon: '🧭', hint: 'Go back to explorer and choose a species card.' })}</div>`;
      return;
    }

    const sighted = isBirdSighted(bird);
    const favorited = isBirdFavorited(bird);
    const sightedDate = getSightingDate(bird);
    const stats = state.birdCollectionsCache && state.birdCollectionsCache.stats ? state.birdCollectionsCache.stats : getBirdStats();
    const familyLookup = buildFamilyProgressLookup(stats);
    const insight = getBirdExplorerInsight(bird, stats, familyLookup);
    const history = getBirdHistorySummary(bird);
    const similarBirds = getSimilarBirdCandidates(bird, 3);

    const habitatHint = pickField(bird.details || {}, ['Habitat', 'Habitat Notes', 'Where to Look']) || bird.defaultHabitat || 'mixed habitat edges';
    const behaviorHint = pickField(bird.details || {}, ['Behavior', 'Behavior Notes']) || 'watch for movement patterns, feeding style, and posture clues';
    const idHint = pickField(bird.details || {}, ['Identification', 'Field Marks', 'Distinguishing Features']) || `Start with silhouette, bill shape, and wing profile for ${bird.speciesName}.`;
    const similarHint = pickField(bird.details || {}, ['Similar Species', 'Look Alikes']) || '';

    const idPoints = splitFieldNotes(idHint, `Start with silhouette, bill shape, and wing profile for ${bird.speciesName}.`);
    const habitatPoints = splitFieldNotes(habitatHint, `Look in ${insight.bestHabitat.toLowerCase()} zones when conditions are favorable.`);
    const behaviorPoints = splitFieldNotes(behaviorHint, 'Watch feeding style, movement, and call behavior for confirmation.');
    const similarPoints = splitFieldNotes(similarHint, 'Compare shape, bill, and habitat with nearby related species.');
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

    const historyCopy = history.count > 0
      ? `First seen: ${history.firstSeen ? history.firstSeen.toLocaleDateString() : 'Unknown'} | Last seen: ${history.lastSeen ? history.lastSeen.toLocaleDateString() : 'Unknown'} | Total sightings: ${history.count}${history.topRegion ? ` | Top region: ${history.topRegion}` : ''}${history.topHabitat ? ` | Top habitat: ${history.topHabitat}` : ''}`
      : 'No sightings logged yet for this species.';

    const similarButtons = similarBirds.length
      ? similarBirds.map((candidate) => `<button type="button" class="pill-button" data-bird-open="${escapeHtml(candidate.id)}" ${tooltipAttrs(`Open bird details for ${candidate.speciesName}`)}>${escapeHtml(candidate.speciesName)}</button>`).join('')
      : '<span class="card-subtitle">No similar species suggestions available yet.</span>';

    const progressReasons = insight.reasons.length
      ? insight.reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join('')
      : '<li>General progress opportunity.</li>';

    container.innerHTML = `
      <div class="adventure-card nature-bird-card">
        <div class="adventure-card-header">
          <div class="nature-priority-badge ${escapeHtml(insight.priorityClass)}">${escapeHtml(insight.priorityLabel)}</div>
          <div class="adventure-card-title">${escapeHtml(bird.speciesName)}</div>
          <div class="adventure-card-location">Family: ${escapeHtml(bird.familyLabel)}</div>
          <div class="adventure-card-time">Genus: ${escapeHtml(bird.genusLabel)}</div>
        </div>
        <div class="adventure-card-body">
          <div class="nature-explorer-status-row">
            <span class="nature-explorer-status-pill ${sighted ? 'is-good' : 'is-alert'}">${sighted ? 'Seen' : 'Not seen'}</span>
            <span class="nature-explorer-status-pill ${insight.inSeason ? 'is-good' : ''}">${insight.inSeason ? 'In season now' : 'Out of season'}</span>
            <span class="nature-explorer-status-pill ${insight.recommended ? 'is-good' : ''}">${insight.recommended ? 'Recommended now' : 'Optional now'}</span>
            <span class="nature-explorer-status-pill">${escapeHtml(bird.rarity.label)}</span>
          </div>
          <div class="nature-chip-row nature-chip-row--wrap">
            <span class="nature-chip ${bird.rarity.className}">${escapeHtml(bird.rarity.label)}</span>
            ${seasonChips}
          </div>
          <div class="card-subtitle">${sighted ? `Sighted on ${escapeHtml(sightedDate ? sightedDate.toLocaleDateString() : '')}` : 'Not sighted yet'}</div>
          <div class="nature-explorer-insight">Best habitat: ${escapeHtml(insight.bestHabitat)} | Best region: ${escapeHtml(insight.bestRegion)} | Why it matters: ${escapeHtml(insight.primaryReason)}</div>

          <section class="nature-detail-section">
            <div class="nature-detail-section-title">Field ID Quick Take</div>
            <ul class="nature-detail-list">${idPoints.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
          </section>

          <section class="nature-detail-section">
            <div class="nature-detail-section-title">Look For in the Field</div>
            <ul class="nature-detail-list">
              <li>Silhouette cue: ${escapeHtml(idPoints[0] || `Body shape and posture cues for ${bird.speciesName}`)}</li>
              <li>Bill / neck / wing clue: ${escapeHtml(idPoints[1] || 'Compare bill length, neck position, and wing shape during movement.')}</li>
              <li>Common behavior: ${escapeHtml(behaviorPoints[0] || 'Watch feeding behavior and movement cadence.')}</li>
              <li>Likely setting: ${escapeHtml(habitatPoints[0] || 'Check likely habitat edges and transition zones.')}</li>
              <li>Likely confusion species: ${escapeHtml((similarBirds[0] && similarBirds[0].speciesName) || 'Related species in the same family')}</li>
            </ul>
          </section>

          <section class="nature-detail-section">
            <div class="nature-detail-section-title">Where to Look</div>
            <ul class="nature-detail-list">${habitatPoints.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
          </section>

          <section class="nature-detail-section">
            <div class="nature-detail-section-title">When and How to Look</div>
            <ul class="nature-detail-list">${behaviorPoints.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
          </section>

          <section class="nature-detail-section">
            <div class="nature-detail-section-title">Why It Matters for Your Progress</div>
            <ul class="nature-detail-list">${progressReasons}</ul>
          </section>

          <section class="nature-detail-section">
            <div class="nature-detail-section-title">Recent Logs and History</div>
            <div class="nature-detail-section-copy">${escapeHtml(historyCopy)}</div>
            ${history.notes && history.notes.length
              ? `<ul class="nature-detail-list">${history.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join('')}</ul>`
              : ''}
          </section>

          <section class="nature-detail-section">
            <div class="nature-detail-section-title">Similar Birds</div>
            <ul class="nature-detail-list">${similarPoints.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
            <div class="nature-log-form-actions" style="margin-top:8px;">${similarButtons}</div>
          </section>

          <section class="nature-detail-section">
            <div class="nature-detail-section-title">Quick Actions</div>
            <div class="nature-log-form-actions">
              <button type="button" id="birdsDetailLogSightingBtn" class="pill-button" ${tooltipAttrs(`Open the sighting log for ${bird.speciesName}`)}>Log a sighting</button>
              <button type="button" id="birdsDetailBackToExplorerBtn" class="pill-button" ${tooltipAttrs('Back to the filtered explorer list')}>Back to filtered list</button>
            </div>
          </section>

          <button type="button" class="nature-bird-fav-btn ${favorited ? 'is-favorited' : ''}" data-bird-favorite="${escapeHtml(bird.id)}" ${tooltipAttrs(`${favorited ? 'Remove' : 'Add'} ${bird.speciesName} ${favorited ? 'from' : 'to'} favorites`)}>${favorited ? '★ Favorited' : '☆ Favorite'}</button>
          <button type="button" class="card-btn" data-bird-toggle="${escapeHtml(bird.id)}" ${tooltipAttrs(`Mark ${bird.speciesName} as ${sighted ? 'not sighted' : 'sighted'}`)}>${sighted ? 'Mark Not Sighted' : 'Mark Sighted'}</button>
          <div class="nature-bird-detail-list">${detailRows}</div>
        </div>
      </div>
    `;
  }

  function renderBirdCollectionView() {
    const title = document.getElementById('birdsCollectionTitle');
    const subtitle = document.getElementById('birdsCollectionSubtitle');
    const meta = document.getElementById('birdsCollectionMeta');
    const grid = document.getElementById('birdsCollectionGrid');
    if (!title || !subtitle || !meta || !grid) return;

    const key = ['challenges', 'badges', 'quests', 'bingo'].includes(state.activeBirdCollection)
      ? state.activeBirdCollection
      : 'challenges';
    const cache = state.birdCollectionsCache || {};
    const stats = cache.stats;

    if (!stats) {
      title.textContent = 'All Items';
      subtitle.textContent = 'Bird data is still loading.';
      meta.textContent = 'Collection data will appear after bird data loads.';
      grid.className = 'nature-challenge-grid';
      grid.innerHTML = buildUnifiedStateHtml('Bird data is still loading.', { icon: '⏳' });
      return;
    }

    if (key === 'badges') {
      const items = Array.isArray(cache.badges) ? cache.badges : [];
      title.textContent = '🏅 All Badges';
      subtitle.textContent = 'See every birding badge and your current progress.';
      meta.textContent = `${items.filter((item) => item.completed).length}/${items.length} badges unlocked`;
      grid.className = 'nature-badge-grid';
      renderBirdBadges(items, 'birdsCollectionGrid');
      return;
    }

    if (key === 'quests') {
      const questline = cache.questline || { steps: [], completedCount: 0 };
      title.textContent = '📚 Seasonal Quests';
      subtitle.textContent = 'Follow every quest step for the current season chapter.';
      grid.className = 'nature-challenge-grid';
      renderSeasonQuestlinePanel(questline, stats, {
        containerId: 'birdsCollectionGrid',
        metaId: 'birdsCollectionMeta'
      });
      return;
    }

    if (key === 'bingo') {
      const bingo = cache.bingo;
      title.textContent = '🟩 Birding Bingo';
      subtitle.textContent = 'View every seasonal bingo tile and current progress.';
      grid.className = 'nature-badge-grid';
      if (!bingo) {
        meta.textContent = 'Bingo data is still loading.';
        grid.innerHTML = buildUnifiedStateHtml('Bingo data is still loading.', { icon: '🟩' });
        return;
      }
      renderBirdBingoPanel(bingo, {
        containerId: 'birdsCollectionGrid',
        metaId: 'birdsCollectionMeta'
      });
      return;
    }

    const items = Array.isArray(cache.challenges) ? cache.challenges : [];
    title.textContent = '🎯 All Challenges';
    subtitle.textContent = 'See every challenge and focus on what is closest to completion.';
    meta.textContent = `${items.filter((item) => item.completed).length}/${items.length} challenges complete`;
    grid.className = 'nature-challenge-grid';
    renderBirdChallenges(items, 'birdsCollectionGrid');
  }

  function renderBirdError() {
    [
      'birdsDailyChallengeGrid',
      'birdsBingoGrid',
      'birdsSeasonQuestGrid',
      'birdsChallengeGrid',
      'birdsBadgeGrid',
      'birdsCollectionGrid',
      'birdsSpeciesCardGrid',
      'birdsSpeciesDetailContent'
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.innerHTML = buildUnifiedStateHtml(state.birdsError || 'Bird data could not be loaded.', { icon: '⚠️', hint: 'Open Diagnostics, Sync and Clean Up for details.' });
      }
    });
  }

  function renderBirds() {
    if (!state.birdsLoaded) {
      renderBirdLoadingSkeletons();
      return;
    }
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
    const filteredChallenges = applyOverviewQuickFilters(challenges, stats);
    const filteredBadges = applyOverviewQuickFilters(badges, stats);
    const filteredQuests = applyOverviewQuickFilters(seasonQuestline.steps, stats);
    const filteredBingoTiles = applyOverviewQuickFilters(bingo.tiles, stats);
    const overviewChallenges = getPrioritizedOverviewCards(filteredChallenges, stats, BIRD_OVERVIEW_LIMITS.challenges);
    const overviewBadges = getPrioritizedOverviewCards(filteredBadges, stats, BIRD_OVERVIEW_LIMITS.badges);
    const overviewQuests = getPrioritizedOverviewCards(filteredQuests, stats, BIRD_OVERVIEW_LIMITS.quests);
    const overviewBingoTiles = getPrioritizedOverviewCards(filteredBingoTiles, stats, BIRD_OVERVIEW_LIMITS.bingo);

    state.birdCollectionsCache = {
      stats,
      challenges,
      badges,
      questline: seasonQuestline,
      bingo
    };

    updateBirdMoreButtons({
      challenges: { shown: overviewChallenges.length, total: challenges.length },
      badges: { shown: overviewBadges.length, total: badges.length },
      quests: { shown: overviewQuests.length, total: seasonQuestline.steps.length },
      bingo: { shown: overviewBingoTiles.length, total: bingo.tiles.length }
    });
    const summary = {
      dailyShown: dailyChallenges.length,
      dailyTotal: BIRD_PROGRESSION_SPEC.dailyPickCount || dailyChallenges.length,
      challengeShown: overviewChallenges.length,
      challengeTotal: challenges.length,
      badgeShown: overviewBadges.length,
      badgeTotal: badges.length,
      questShown: overviewQuests.length,
      questTotal: seasonQuestline.steps.length,
      bingoShown: overviewBingoTiles.length,
      bingoTotal: bingo.tiles.length
    };
    renderOverviewSectionSummaries(summary);
    announceOverviewFilterState(summary);
    renderBirdUndoPrompt();
    renderBirdTodayFocus(stats);
    syncOverviewFilterChipState();
    applyOverviewDensity(document.getElementById('natureChallengeRoot'));

    renderBirdHeaderStatus();
    renderBirdStats(stats);
    renderBirdDailyChallenges(dailyChallenges);
    renderBirdStreakPanel(stats.streak);
    renderBirdLogView(stats);
    renderBirdBingoPanel({
      ...bingo,
      tiles: overviewBingoTiles,
      completedCount: overviewBingoTiles.filter((tile) => tile.completed).length
    }, {
      allowRerollControl: true,
      completedCountOverride: bingo.completedCount,
      totalTileCountOverride: bingo.tiles.length
    });
    renderSeasonQuestlinePanel({
      steps: overviewQuests,
      completedCount: overviewQuests.filter((step) => step.completed).length
    }, stats);
    renderBirdChallenges(overviewChallenges);
    renderBirdBadges(overviewBadges);
    renderBirdCollectionView();
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
    const previousView = state.activeBirdView;
    state.birdViewScrollPositions[previousView || 'overview'] = window.scrollY || 0;
    state.activeBirdView = BIRD_VIEWS.includes(viewKey) ? viewKey : 'overview';
    saveBirdUiPrefs();
    syncBirdViews(root);
    const exploreButton = document.getElementById('birdsExploreBtn');
    const logButton = document.getElementById('birdsOpenLogBtn');
    if (exploreButton) exploreButton.setAttribute('aria-current', state.activeBirdView === 'explorer' ? 'page' : 'false');
    if (logButton) logButton.setAttribute('aria-current', state.activeBirdView === 'log' ? 'page' : 'false');
    if (state.activeBirdView === 'overview') applyOverviewDensity(root);
    if (state.activeBirdView === 'explorer') renderBirdExplorerList();
    if (state.activeBirdView === 'detail') renderBirdDetail();
    if (state.activeBirdView === 'collection') renderBirdCollectionView();
    const restoreY = Number(state.birdViewScrollPositions[state.activeBirdView]) || 0;
    window.scrollTo({ top: restoreY, behavior: 'auto' });
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
  }

  function toggleBirdSighting(birdId) {
    const bird = findBirdById(birdId);
    if (!bird) return;
    const wasSighted = Boolean(state.sightings[bird.id]);
    const snapshot = wasSighted ? { ...state.sightings[bird.id] } : null;

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
    setUndoAction({ type: 'toggle-sighting', birdId: bird.id, wasSighted, snapshot, label: 'Updated sighting status' });
    if (typeof window.showToast === 'function') {
      window.showToast('Use Undo pill or press z to undo', 'info', 2200);
    }
    renderBirds();
  }

  const NATURE_DELEGATED_ACTION_SELECTOR = [
    '[data-nature-subtab]',
    '#natureChallengeRefreshBtn',
    '#birdsUndoActionBtn',
    '#birdsExploreBtn',
    '#birdsOpenLogBtn',
    '[data-bird-toggle]',
    '[data-bird-favorite]',
    '[data-bird-open]',
    '#birdsExplorerPrevPageBtn',
    '#birdsExplorerNextPageBtn',
    '#birdsExplorerFirstPageBtn',
    '#birdsExplorerLastPageBtn',
    '#birdsExplorerJumpPageBtn',
    '#birdsExplorerLoadMoreBtn',
    '[data-birds-explorer-density]',
    '[data-birds-filter-chip]',
    '[data-birds-overview-filter]',
    '[data-birds-overview-remove-filter]',
    '#birdsOverviewClearFiltersBtn',
    '#birdsUndoPromptBtn',
    '[data-birds-density]',
    '[data-birds-overview-jump]',
    '#birdsOverviewCommandClearBtn',
    '#birdsResetUiBtn',
    '#birdsClearClickDiagnosticsBtn',
    '[data-birds-back-to-top]',
    '#birdsExplorerClearFiltersBtn',
    '#birdsExplorerClearChipFiltersBtn',
    '#birdsDetailLogSightingBtn',
    '#birdsDetailBackToExplorerBtn',
    '[data-birds-remove-filter]',
    '[data-birds-empty-action]',
    '[data-birds-more]',
    '[data-sync-resolve]'
  ].join(',');

  function getDelegatedNatureActionTarget(root, event) {
    if (!root || !event || !event.target || typeof event.target.closest !== 'function') return null;
    const target = event.target.closest(NATURE_DELEGATED_ACTION_SELECTOR);
    if (!target || !root.contains(target)) return null;
    return target;
  }

  function bindNatureControls(root) {
    if (!root || root.dataset.natureControlsBound === '1') return;
    root.dataset.natureControlsBound = '1';
    ensureNatureButtonsResponsive(root);
    installNatureButtonReliabilityObserver(root);
    ensureBirdClickDiagnosticsPanel(root);

    const handleDelegatedActivation = (event) => {
      const delegatedTarget = getDelegatedNatureActionTarget(root, event);
      if (!delegatedTarget) return;

      if (event.type === 'pointerup') {
        const pointerType = String(event.pointerType || '').toLowerCase();
        if (pointerType !== 'touch' && pointerType !== 'pen') return;
        if (event.isPrimary === false || Number(event.button) > 0) return;
        delegatedTarget.dataset.naturePointerHandledAt = String(Date.now());
        event.preventDefault();
      }

      if (event.type === 'click') {
        const lastPointerHandledAt = Number(delegatedTarget.dataset.naturePointerHandledAt || 0);
        if (lastPointerHandledAt && (Date.now() - lastPointerHandledAt) < 700) {
          recordBirdClickDiagnostic(event.type, delegatedTarget, { deduped: true });
          delegatedTarget.removeAttribute('data-nature-pointer-handled-at');
          return;
        }
      }

      recordBirdClickDiagnostic(event.type, delegatedTarget);

      const subTabButton = event.target.closest('[data-nature-subtab]');
      if (subTabButton) {
        ensureNatureButtonsResponsive(root);
        setActiveNatureSubTab(root, subTabButton.getAttribute('data-nature-subtab'));
        return;
      }

      const refreshButton = event.target.closest('#natureChallengeRefreshBtn');
      if (refreshButton) {
        loadBirdDataset(true);
        return;
      }

      const undoActionButton = event.target.closest('#birdsUndoActionBtn');
      if (undoActionButton) {
        handleBirdUndoAction();
        return;
      }

      const exploreButton = event.target.closest('#birdsExploreBtn');
      if (exploreButton) {
        setBirdView(root, 'explorer');
        return;
      }

      const openLogButton = event.target.closest('#birdsOpenLogBtn');
      if (openLogButton) {
        setBirdView(root, 'log');
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
        state.birdLoadMoreRows = 0;
        state.birdPage = Math.max(1, state.birdPage - 1);
        renderBirdExplorerList();
        return;
      }

      const nextPageButton = event.target.closest('#birdsExplorerNextPageBtn');
      if (nextPageButton) {
        state.birdLoadMoreRows = 0;
        state.birdPage += 1;
        renderBirdExplorerList();
        return;
      }

      const firstPageButton = event.target.closest('#birdsExplorerFirstPageBtn');
      if (firstPageButton) {
        state.birdLoadMoreRows = 0;
        state.birdPage = 1;
        renderBirdExplorerList();
        return;
      }

      const lastPageButton = event.target.closest('#birdsExplorerLastPageBtn');
      if (lastPageButton) {
        state.birdLoadMoreRows = 0;
        const filtered = filterBirdsForExplorer();
        const totalPages = Math.max(1, Math.ceil(filtered.length / Math.max(1, Number(state.birdPageSize) || 12)));
        state.birdPage = totalPages;
        renderBirdExplorerList();
        return;
      }

      const jumpPageButton = event.target.closest('#birdsExplorerJumpPageBtn');
      if (jumpPageButton) {
        const jumpInput = document.getElementById('birdsExplorerPageJumpInput');
        const filtered = filterBirdsForExplorer();
        const totalPages = Math.max(1, Math.ceil(filtered.length / Math.max(1, Number(state.birdPageSize) || 12)));
        const wanted = Math.max(1, Math.min(totalPages, Number(jumpInput && jumpInput.value) || 1));
        state.birdLoadMoreRows = 0;
        state.birdPage = wanted;
        renderBirdExplorerList();
        return;
      }

      const loadMoreButton = event.target.closest('#birdsExplorerLoadMoreBtn');
      if (loadMoreButton) {
        state.birdLoadMoreRows += 12;
        state.birdPage = 1;
        renderBirdExplorerList();
        return;
      }

      const explorerDensityButton = event.target.closest('[data-birds-explorer-density]');
      if (explorerDensityButton) {
        const mode = explorerDensityButton.getAttribute('data-birds-explorer-density') || 'comfortable';
        state.explorerDensity = ['compact', 'comfortable', 'field'].includes(mode) ? mode : 'comfortable';
        saveBirdUiPrefs();
        applyExplorerDensity(root);
        renderBirdExplorerList();
        return;
      }

      const chipButton = event.target.closest('[data-birds-filter-chip]');
      if (chipButton) {
        const group = chipButton.getAttribute('data-birds-filter-chip');
        const value = chipButton.getAttribute('data-chip-value') || '';
        toggleChipFilter(group, value);
        state.birdPage = 1;
        state.birdLoadMoreRows = 0;
        renderBirdExplorerList();
        return;
      }

      const overviewFilterButton = event.target.closest('[data-birds-overview-filter]');
      if (overviewFilterButton) {
        const filterKey = overviewFilterButton.getAttribute('data-birds-overview-filter') || '';
        if (filterKey === 'in-season') state.overviewQuickFilters.inSeason = !state.overviewQuickFilters.inSeason;
        if (filterKey === 'almost-there') state.overviewQuickFilters.almostThere = !state.overviewQuickFilters.almostThere;
        if (filterKey === 'high-reward') state.overviewQuickFilters.highReward = !state.overviewQuickFilters.highReward;
        saveBirdUiPrefs();
        renderBirds();
        return;
      }

      const removeOverviewFilterButton = event.target.closest('[data-birds-overview-remove-filter]');
      if (removeOverviewFilterButton) {
        const filterKey = removeOverviewFilterButton.getAttribute('data-birds-overview-remove-filter') || '';
        if (filterKey === 'in-season') state.overviewQuickFilters.inSeason = false;
        if (filterKey === 'almost-there') state.overviewQuickFilters.almostThere = false;
        if (filterKey === 'high-reward') state.overviewQuickFilters.highReward = false;
        saveBirdUiPrefs();
        renderBirds();
        return;
      }

      const clearOverviewFiltersButton = event.target.closest('#birdsOverviewClearFiltersBtn');
      if (clearOverviewFiltersButton) {
        setUndoAction({
          type: 'clear-overview-filters',
          prev: { ...state.overviewQuickFilters },
          label: 'Cleared overview filters'
        });
        state.overviewQuickFilters = { inSeason: false, almostThere: false, highReward: false };
        saveBirdUiPrefs();
        if (typeof window.showToast === 'function') window.showToast('Overview filters cleared. Use Undo pill or press z.', 'info', 2400);
        renderBirds();
        return;
      }

      const undoPromptButton = event.target.closest('#birdsUndoPromptBtn');
      if (undoPromptButton) {
        handleBirdUndoAction();
        return;
      }

      const densityButton = event.target.closest('[data-birds-density]');
      if (densityButton) {
        const densityMode = densityButton.getAttribute('data-birds-density') || 'comfortable';
        state.overviewDensity = densityMode === 'compact' ? 'compact' : 'comfortable';
        saveBirdUiPrefs();
        applyOverviewDensity(root);
        return;
      }

      const jumpButton = event.target.closest('[data-birds-overview-jump]');
      if (jumpButton) {
        if (jumpButton.id === 'birdsTodayFocusLogBtn') {
          setBirdView(root, 'log');
          return;
        }
        setBirdView(root, 'overview');
        scrollToBirdOverviewSection(jumpButton.getAttribute('data-birds-overview-jump') || 'daily');
        return;
      }

      const clearCommandButton = event.target.closest('#birdsOverviewCommandClearBtn');
      if (clearCommandButton) {
        state.commandInputValue = '';
        saveBirdUiPrefs();
        syncBirdCommandInputFromState();
        const cmdInput = document.getElementById('birdsOverviewCommandInput');
        if (cmdInput) cmdInput.focus();
        return;
      }

      const resetUiButton = event.target.closest('#birdsResetUiBtn');
      if (resetUiButton) {
        resetBirdUiPreferences(root);
        if (typeof window.showToast === 'function') window.showToast('Birds UI has been reset to defaults.', 'info', 2200);
        return;
      }

      const clearDiagnosticsButton = event.target.closest('#birdsClearClickDiagnosticsBtn');
      if (clearDiagnosticsButton) {
        resetBirdClickDiagnosticsState();
        if (typeof window.showToast === 'function') window.showToast('Bird button diagnostics cleared.', 'info', 1800);
        return;
      }

      const backToTopButton = event.target.closest('[data-birds-back-to-top]');
      if (backToTopButton) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
        state.birdLoadMoreRows = 0;
        renderBirdExplorerList();
        return;
      }

      const detailLogButton = event.target.closest('#birdsDetailLogSightingBtn');
      if (detailLogButton) {
        setBirdView(root, 'log');
        const speciesSelect = document.getElementById('birdsLogSpeciesSelect');
        if (speciesSelect && state.selectedBirdId) speciesSelect.value = state.selectedBirdId;
        return;
      }

      const detailBackToExplorerButton = event.target.closest('#birdsDetailBackToExplorerBtn');
      if (detailBackToExplorerButton) {
        setBirdView(root, 'explorer');
        return;
      }

      const removeFilterButton = event.target.closest('[data-birds-remove-filter]');
      if (removeFilterButton) {
        removeExplorerFilter(removeFilterButton.getAttribute('data-birds-remove-filter') || '');
        renderBirdExplorerList();
        return;
      }

      const emptyActionButton = event.target.closest('[data-birds-empty-action]');
      if (emptyActionButton) {
        const action = emptyActionButton.getAttribute('data-birds-empty-action') || '';
        if (action === 'show-in-season') {
          const season = getCurrentSeason();
          state.birdFilters.season = season;
          state.birdPage = 1;
          renderBirdExplorerList();
          return;
        }
        if (action === 'clear-high-reward') {
          state.overviewQuickFilters.highReward = false;
          saveBirdUiPrefs();
          renderBirds();
          return;
        }
        if (action === 'clear-overview') {
          state.overviewQuickFilters = { inSeason: false, almostThere: false, highReward: false };
          saveBirdUiPrefs();
          renderBirds();
          return;
        }
      }

      const moreButton = event.target.closest('[data-birds-more]');
      if (moreButton) {
        state.activeBirdCollection = moreButton.getAttribute('data-birds-more') || 'challenges';
        setBirdView(root, 'collection');
        return;
      }

      const conflictResolveButton = event.target.closest('[data-sync-resolve]');
      if (conflictResolveButton) {
        const conflictId = conflictResolveButton.getAttribute('data-conflict-id') || '';
        const strategy = conflictResolveButton.getAttribute('data-sync-resolve') || 'local';
        resolveSyncConflict(conflictId, strategy);
        return;
      }
    };

    root.addEventListener('click', handleDelegatedActivation, true);
    if (typeof window.PointerEvent === 'function') {
      root.addEventListener('pointerup', handleDelegatedActivation, true);
    }

    root.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') root.classList.add('is-keyboard-mode');
      handleBirdKeyboardShortcuts(root, event);
    });

    root.addEventListener('mousedown', () => {
      root.classList.remove('is-keyboard-mode');
    });


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

    // Fallback direct bindings: keep core Birds entry buttons responsive even if other
    // global handlers interfere with delegated click routing.
    const exploreSpeciesButton = document.getElementById('birdsExploreBtn');
    if (exploreSpeciesButton && exploreSpeciesButton.dataset.natureExploreDirectBound !== '1') {
      exploreSpeciesButton.dataset.natureExploreDirectBound = '1';
      exploreSpeciesButton.addEventListener('click', (event) => {
        if (event.defaultPrevented) return;
        setBirdView(root, 'explorer');
      });
    }

    const refreshBirdsButton = document.getElementById('natureChallengeRefreshBtn');
    if (refreshBirdsButton && refreshBirdsButton.dataset.natureRefreshDirectBound !== '1') {
      refreshBirdsButton.dataset.natureRefreshDirectBound = '1';
      refreshBirdsButton.addEventListener('click', (event) => {
        if (event.defaultPrevented) return;
        loadBirdDataset(true);
      });
    }

    const detailBackButton = document.getElementById('birdsDetailBackBtn');
    if (detailBackButton && detailBackButton.dataset.natureDetailBackBound !== '1') {
      detailBackButton.dataset.natureDetailBackBound = '1';
      detailBackButton.addEventListener('click', () => setBirdView(root, 'explorer'));
    }

    const collectionBackButton = document.getElementById('birdsCollectionBackBtn');
    if (collectionBackButton && collectionBackButton.dataset.natureCollectionBackBound !== '1') {
      collectionBackButton.dataset.natureCollectionBackBound = '1';
      collectionBackButton.addEventListener('click', () => setBirdView(root, 'overview'));
    }

    const overviewCommandRunBtn = document.getElementById('birdsOverviewCommandRunBtn');
    const overviewCommandInput = document.getElementById('birdsOverviewCommandInput');
    if (overviewCommandRunBtn && overviewCommandRunBtn.dataset.natureCmdRunBound !== '1') {
      overviewCommandRunBtn.dataset.natureCmdRunBound = '1';
      overviewCommandRunBtn.addEventListener('click', () => {
        runBirdOverviewCommand(root, overviewCommandInput ? overviewCommandInput.value : '');
      });
    }

    if (overviewCommandInput && overviewCommandInput.dataset.natureCmdInputBound !== '1') {
      overviewCommandInput.dataset.natureCmdInputBound = '1';
      overviewCommandInput.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;
        runBirdOverviewCommand(root, overviewCommandInput.value || '');
      });
      overviewCommandInput.addEventListener('input', () => {
        state.commandInputValue = overviewCommandInput.value || '';
        saveBirdUiPrefs();
      });
    }


    const searchInput = document.getElementById('birdsSpeciesSearchInput');
    if (searchInput && searchInput.dataset.natureSearchBound !== '1') {
      searchInput.dataset.natureSearchBound = '1';
      searchInput.addEventListener('input', () => {
        state.birdSearch = searchInput.value || '';
        state.birdPage = 1;
        state.birdLoadMoreRows = 0;
        updateBirdSearchSuggestions();
        renderBirdExplorerList();
      });
    }

    const sortSelect = document.getElementById('birdsExplorerSortSelect');
    if (sortSelect && sortSelect.dataset.natureSortBound !== '1') {
      sortSelect.dataset.natureSortBound = '1';
      sortSelect.addEventListener('change', () => {
        state.birdSort = sortSelect.value || 'family-asc';
        state.birdPage = 1;
        state.birdLoadMoreRows = 0;
        renderBirdExplorerList();
      });
    }

    const pageSizeSelect = document.getElementById('birdsExplorerPageSizeSelect');
    if (pageSizeSelect && pageSizeSelect.dataset.naturePageSizeBound !== '1') {
      pageSizeSelect.dataset.naturePageSizeBound = '1';
      pageSizeSelect.addEventListener('change', () => {
        state.birdPageSize = Math.max(1, Number(pageSizeSelect.value) || 12);
        state.birdPage = 1;
        state.birdLoadMoreRows = 0;
        renderBirdExplorerList();
      });
    }

    const pageJumpInput = document.getElementById('birdsExplorerPageJumpInput');
    if (pageJumpInput && pageJumpInput.dataset.naturePageJumpBound !== '1') {
      pageJumpInput.dataset.naturePageJumpBound = '1';
      pageJumpInput.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;
        const jumpBtn = document.getElementById('birdsExplorerJumpPageBtn');
        if (jumpBtn) jumpBtn.click();
      });
    }

    const paginationModeSelect = document.getElementById('birdsExplorerPaginationMode');
    if (paginationModeSelect && paginationModeSelect.dataset.naturePagerModeBound !== '1') {
      paginationModeSelect.dataset.naturePagerModeBound = '1';
      paginationModeSelect.addEventListener('change', () => {
        state.birdPaginationMode = paginationModeSelect.value === 'load-more' ? 'load-more' : 'paged';
        state.birdLoadMoreRows = 0;
        state.birdPage = 1;
        saveBirdUiPrefs();
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
        state.birdLoadMoreRows = 0;
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
        state.birdLoadMoreRows = 0;
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
        state.birdLoadMoreRows = 0;
        renderBirdExplorerList();
      });
    }

    const regionFilter = document.getElementById('birdsExplorerRegionFilter');
    if (regionFilter && regionFilter.dataset.natureRegionFilterBound !== '1') {
      regionFilter.dataset.natureRegionFilterBound = '1';
      regionFilter.addEventListener('change', () => {
        state.birdFilters.region = regionFilter.value || 'all';
        state.birdPage = 1;
        state.birdLoadMoreRows = 0;
        renderBirdExplorerList();
      });
    }

    const habitatFilter = document.getElementById('birdsExplorerHabitatFilter');
    if (habitatFilter && habitatFilter.dataset.natureHabitatFilterBound !== '1') {
      habitatFilter.dataset.natureHabitatFilterBound = '1';
      habitatFilter.addEventListener('change', () => {
        state.birdFilters.habitat = habitatFilter.value || 'all';
        state.birdPage = 1;
        state.birdLoadMoreRows = 0;
        renderBirdExplorerList();
      });
    }

    const sightingStatusFilter = document.getElementById('birdsExplorerSightingStatusFilter');
    if (sightingStatusFilter && sightingStatusFilter.dataset.natureSightingStatusBound !== '1') {
      sightingStatusFilter.dataset.natureSightingStatusBound = '1';
      sightingStatusFilter.addEventListener('change', () => {
        state.birdFilters.sightingStatus = sightingStatusFilter.value || 'all';
        state.birdPage = 1;
        state.birdLoadMoreRows = 0;
        renderBirdExplorerList();
      });
    }

    const bindWorkflowToggle = (id, key) => {
      const el = document.getElementById(id);
      if (!el || el.dataset.natureWorkflowToggleBound === '1') return;
      el.dataset.natureWorkflowToggleBound = '1';
      el.addEventListener('change', () => {
        state.birdFilters[key] = Boolean(el.checked);
        state.birdPage = 1;
        state.birdLoadMoreRows = 0;
        renderBirdExplorerList();
      });
    };
    bindWorkflowToggle('birdsExplorerToggleNotYetSeen', 'notYetSeenOnly');
    bindWorkflowToggle('birdsExplorerToggleAlreadySeen', 'alreadySeenOnly');
    bindWorkflowToggle('birdsExplorerToggleSeenRecently', 'seenRecentlyOnly');
    bindWorkflowToggle('birdsExplorerToggleNotSeenRecently', 'notSeenRecentlyOnly');
    bindWorkflowToggle('birdsExplorerToggleFavorited', 'favoritedOnly');
    bindWorkflowToggle('birdsExplorerToggleInSeasonNotSeen', 'inSeasonNotSeenOnly');
    bindWorkflowToggle('birdsExplorerToggleRareNotSeen', 'rareNotSeenOnly');


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

    const favoritesOnlyToggle = document.getElementById('birdsExplorerFavoritesOnly');
    if (favoritesOnlyToggle && favoritesOnlyToggle.dataset.natureFavoritesOnlyBound !== '1') {
      favoritesOnlyToggle.dataset.natureFavoritesOnlyBound = '1';
      favoritesOnlyToggle.addEventListener('change', () => {
        state.birdFilters.favoritesOnly = Boolean(favoritesOnlyToggle.checked);
        state.birdPage = 1;
        state.birdLoadMoreRows = 0;
        renderBirdExplorerList();
      });
    }
  }

  function initializeNatureChallengeTab() {
    const root = document.getElementById('natureChallengeRoot');
    if (!root) return;

    ensureNatureButtonsResponsive(root);
    ensureBirdClickDiagnosticsPanel(root);
    bindNatureControls(root);
    applyExplorerDensity(root);
    const diagnostics = document.getElementById('birdsDiagnosticsDetails');
    if (diagnostics) diagnostics.open = true;
    const logDateInput = document.getElementById('birdsLogDateInput');
    if (logDateInput && !logDateInput.value) {
      logDateInput.value = new Date().toISOString().slice(0, 10);
    }
    renderPlaceholderSubTabs();
    syncBirdCommandInputFromState();
    setActiveNatureSubTab(root, state.activeSubTab || 'birds');
    setBirdView(root, state.activeBirdView || 'overview');
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
  window.setBirdClickDiagnosticsEnabled = function(enabled) {
    try {
      if (enabled) window.localStorage.setItem('birdsClickDiag', '1');
      else window.localStorage.setItem('birdsClickDiag', '0');
    } catch (_error) {
      // Ignore storage availability issues.
    }
    birdsClickDiagnostics.enabled = Boolean(enabled);
    ensureBirdClickDiagnosticsPanel(document.getElementById('natureChallengeRoot'));
  };
  window.resetBirdClickDiagnostics = function() {
    return resetBirdClickDiagnosticsState();
  };
})();

