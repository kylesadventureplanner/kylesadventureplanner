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
  const BIRD_LOG_DRAFT_KEY = 'natureChallengeBirdLogDraftV1';
  const BIRD_SYNC_DEVICE_KEY = 'natureChallengeBirdSyncDeviceIdV1';
  const EXCEL_TABLE_NAME = 'birds';
  const BIRD_SIGHTINGS_TABLE_NAME = 'birds_sightings';
  const BIRD_USER_STATE_TABLE_NAME = 'birds_user_state';
  const EXCEL_SYNC_FILE_CANDIDATES = [
    'Copilot_Apps/Kyles_Adventure_Finder/Nature_Sightings.xlsx',
    'Nature_Sightings.xlsx'
  ];
  const BIRD_SIGHTINGS_REQUIRED_COLUMNS = ['event_id', 'user_id', 'device_id', 'species_status_key', 'species_id', 'canonical_id', 'date_observed', 'count', 'is_deleted', 'created_at', 'updated_at'];
  const BIRD_SIGHTINGS_EVIDENCE_COLUMNS = ['photo_url', 'audio_url'];
  const BIRD_USER_STATE_REQUIRED_COLUMNS = ['state_id', 'user_id', 'species_status_key', 'species_id', 'canonical_id', 'is_favorite', 'created_at', 'updated_at'];
  const EXCEL_FILE_CANDIDATES = [
    'Copilot_Apps/Kyles_Adventure_Finder/Nature_by_County.xlsx',
    'Nature_by_County.xlsx',
    'Copilot_Apps/Kyles_Adventure_Finder/Nature_records.xlsx',
    'Nature_records.xlsx'
  ];
  const SUBTAB_KEYS = ['birds', 'mammals', 'reptiles', 'amphibians', 'insects', 'arachnids', 'wildflowers', 'trees'];
  const EVIDENCE_UPLOAD_ROOT_DEFAULT = 'Copilot_Apps/Kyles_Adventure_Finder/Photo-Video-Sightings';
  const EVIDENCE_SUBTAB_FOLDER_MAP = {
    birds: 'Birds',
    mammals: 'Mammals',
    reptiles: 'Reptiles',
    amphibians: 'Amphibians',
    insects: 'Insects',
    arachnids: 'Arachnids',
    wildflowers: 'Wildflowers',
    trees: 'Tree-Shrubs'
  };
  const CONFIG_DRIVEN_SUBTABS = ['mammals', 'reptiles', 'amphibians', 'insects', 'arachnids', 'wildflowers', 'trees'];
  const NATURE_SUBTAB_CONFIG = {
    mammals: {
      label: 'Mammals',
      speciesTableName: 'Mammals',
      sightingsTableName: 'mammals_sightings',
      userStateTableName: 'mammals_user_state',
      aliases: {
        family: ['Family (English)', 'Family'],
        genus: ['Genus (English)', 'Genus'],
        species: ['Species (English)', 'Common Name', 'Species'],
        seasons: ['Seasons Found', 'Year-Round or Seasonal Presence', 'Seasonality'],
        rarity: ['Rare or Common', 'Regional Abundance', 'Conservation Status (IUCN)']
      }
    },
    reptiles: {
      label: 'Reptiles',
      speciesTableName: 'reptiles',
      sightingsTableName: 'reptiles_sightings',
      userStateTableName: 'reptiles_user_state',
      aliases: {
        family: ['Family (English)', 'Family'],
        genus: ['Genus (English)', 'Genus'],
        species: ['Species (English)', 'Common Name', 'Species'],
        seasons: ['Seasons Active', 'Year Round or Seasonal Presence', 'Seasonality'],
        rarity: ['Rare or Common', 'Regional Abundance', 'Conservation Status (IUCN)']
      }
    },
    amphibians: {
      label: 'Amphibians',
      speciesTableName: 'amphibians',
      sightingsTableName: 'Amphibians_sightings',
      userStateTableName: 'Amphibians_user_data',
      aliases: {
        family: ['Family (English)', 'Family'],
        genus: ['Genus (English)', 'Genus'],
        species: ['Species (English)', 'Common Name', 'Species'],
        seasons: ['Seasons Active', 'Year Round or Seasonal Presence', 'Seasonality', 'Breeding Months'],
        rarity: ['Rare or Common', 'Regional Abundance', 'Conservation Status (IUCN)']
      }
    },
    insects: {
      label: 'Insects',
      speciesTableName: 'insects',
      sightingsTableName: 'Insects_sightings',
      userStateTableName: 'Insects_user_data',
      aliases: {
        family: ['Family (English)', 'Family'],
        genus: ['Genus (English)', 'Genus'],
        species: ['Species (English)', 'Common Name', 'Species'],
        seasons: ['Seasons Active', 'Active Months', 'Peak Months', 'Year Round or Seasonal Presence'],
        rarity: ['Rare or Common', 'Regional Abundance', 'Conservation Status (IUCN)']
      }
    },
    arachnids: {
      label: 'Arachnids',
      speciesTableName: 'Arachnids',
      sightingsTableName: 'arachnids_sightings',
      userStateTableName: 'arachnids_user_data',
      aliases: {
        family: ['Family'],
        genus: ['Genus'],
        species: ['Common Name', 'Species'],
        seasons: ['Seasonality', 'Active Months', 'Peak Months', 'Presence'],
        rarity: ['Regional Abundance', 'Conservation Status']
      }
    },
    wildflowers: {
      label: 'Wildflowers',
      speciesTableName: 'Wildflowers',
      sightingsTableName: 'Wildflowers_sightings',
      userStateTableName: 'Wildflowers_user_data',
      aliases: {
        family: ['Family'],
        genus: ['Genus'],
        species: ['Common Name', 'Species'],
        seasons: ['Bloom Months', 'Peak Bloom', 'Seasonal Visibility'],
        rarity: ['Regional Abundance', 'Conservation Status']
      }
    },
    trees: {
      label: 'Trees & Shrubs',
      speciesTableName: 'Trees_Shrubs',
      sightingsTableName: 'Trees_Shrubs_sightings',
      userStateTableName: 'Trees_Shrubs_user_data',
      aliases: {
        family: ['Family (English)', 'Family'],
        genus: ['Genus (English)', 'Genus'],
        species: ['Species (English)', 'Common Name', 'Species'],
        seasons: ['Seasons Active', 'Bloom Months', 'Seasonality', 'Year Round or Seasonal Presence'],
        rarity: ['Rare or Common', 'Regional Abundance', 'Conservation Status']
      },
      speciesFileCandidates: [
        'Copilot_Apps/Kyles_Adventure_Finder/Nature_records.xlsx',
        'Nature_records.xlsx'
      ],
      syncFileCandidates: [
        'Copilot_Apps/Kyles_Adventure_Finder/Nature_Sightings.xlsx',
        'Nature_Sightings.xlsx'
      ]
    }
  };
  const NATURE_LOCATION_TABLE_SOURCES = [
    { workbook: 'Copilot_Apps/Kyles_Adventure_Finder/Nature_Locations.xlsx', table: 'Nature_Locations' },
    { workbook: 'Nature_Locations.xlsx', table: 'Nature_Locations' },
    { workbook: 'Copilot_Apps/Kyles_Adventure_Finder/Entertainment_Locations.xlsx', table: 'General_Entertainment' },
    { workbook: 'Entertainment_Locations.xlsx', table: 'General_Entertainment' },
    { workbook: 'Copilot_Apps/Kyles_Adventure_Finder/Retail_Food_and_Drink.xlsx', table: 'Restaurants' },
    { workbook: 'Retail_Food_and_Drink.xlsx', table: 'Restaurants' },
    { workbook: 'Copilot_Apps/Kyles_Adventure_Finder/Retail_Food_and_Drink.xlsx', table: 'Coffee' },
    { workbook: 'Retail_Food_and_Drink.xlsx', table: 'Coffee' },
    { workbook: 'Copilot_Apps/Kyles_Adventure_Finder/Retail_Food_and_Drink.xlsx', table: 'Retail' },
    { workbook: 'Retail_Food_and_Drink.xlsx', table: 'Retail' },
    { workbook: 'Copilot_Apps/Kyles_Adventure_Finder/Entertainment_Locations.xlsx', table: 'Wildlife_Animals' },
    { workbook: 'Entertainment_Locations.xlsx', table: 'Wildlife_Animals' },
    { workbook: 'Copilot_Apps/Kyles_Adventure_Finder/Entertainment_Locations.xlsx', table: 'Festivals' },
    { workbook: 'Entertainment_Locations.xlsx', table: 'Festivals' }
  ];
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

  const PROGRESSION_TIER_META = {
    beginner: {
      label: 'Beginner',
      order: 1,
      className: 'nature-progression-chip--beginner',
      learningCopy: 'Build consistent field habits and learn the core logging loop.'
    },
    intermediate: {
      label: 'Intermediate',
      order: 2,
      className: 'nature-progression-chip--intermediate',
      learningCopy: 'Expand variety across habitats, regions, and seasonal opportunities.'
    },
    advanced: {
      label: 'Advanced',
      order: 3,
      className: 'nature-progression-chip--advanced',
      learningCopy: 'Sharpen identification quality with confidence, evidence, and taxonomy depth.'
    },
    'seasonal-mastery': {
      label: 'Seasonal / Mastery',
      order: 4,
      className: 'nature-progression-chip--mastery',
      learningCopy: 'Sustain long-term progression and complete chapter-level milestones.'
    }
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
      { id: 'challenge-daily-pulse', tier: 'beginner', order: 10, icon: 'Daily', title: 'Daily Pulse', description: 'Keep your log active today.', metric: 'todayLogCount', goal: 1, xp: 40 },
      { id: 'challenge-weekly-wings', tier: 'beginner', order: 20, icon: 'Weekly', title: 'Weekly Wings', description: 'Log fresh bird species this week.', metric: 'weeklySightedCount', goal: 3, xp: 80 },
      { id: 'challenge-family-forager', tier: 'beginner', order: 30, icon: 'Families', title: 'Family Forager', description: 'Get at least one sighting in different bird families.', metric: 'familiesStarted', goal: 12, xp: 120 },
      { id: 'challenge-monthly-milestone', tier: 'intermediate', order: 40, icon: 'Monthly', title: 'Monthly Milestone', description: 'Build steady momentum across the month.', metric: 'monthlySightedCount', goal: 10, xp: 140 },
      { id: 'challenge-season-sweep', tier: 'intermediate', order: 50, icon: '{seasonLabel}', title: '{seasonLabel} Sweep', description: 'Mark birds that are available in {season} right now.', metric: 'inSeasonSightedCount', goal: 15, xp: 130 },
      { id: 'challenge-rare-radar', tier: 'intermediate', order: 60, icon: 'Rare', title: 'Rare Radar', description: 'Find rare, very rare, or extremely rare species.', metric: 'rareSightedCount', goal: 5, xp: 170 },
      { id: 'challenge-migration-mapper', tier: 'intermediate', order: 70, icon: 'Migration', title: 'Migration Mapper', description: 'Track birds that show up during migration windows.', metric: 'migrationSightedCount', goal: 8, xp: 150 },
      { id: 'challenge-habitat-hopper', tier: 'intermediate', order: 80, icon: 'Habitat', title: 'Habitat Hopper', description: 'Log birds across every habitat type this season.', metric: 'seasonHabitatCount', goal: 4, xp: 165 },
      { id: 'challenge-region-circuit', tier: 'intermediate', order: 90, icon: 'Map', title: 'Region Circuit', description: 'Cover every region option in your log this season.', metric: 'seasonRegionCount', goal: 4, xp: 165 },
      { id: 'challenge-confident-calls', tier: 'advanced', order: 100, icon: 'Confidence', title: 'Confident Calls', description: 'Build a track record of certain identifications.', metric: 'totalCertainLogCount', goal: 12, xp: 160 },
      { id: 'challenge-proof-of-presence', tier: 'advanced', order: 110, icon: 'Evidence', title: 'Proof of Presence', description: 'Document sightings with photo or audio evidence.', metric: 'evidenceLogCount', goal: 6, xp: 170 },
      { id: 'challenge-genus-journey', tier: 'advanced', order: 120, icon: 'Genus', title: 'Genus Journey', description: 'Broaden your taxonomy knowledge across distinct genera.', metric: 'generaSightedCount', goal: 18, xp: 190 },
      { id: 'challenge-quarterly-flight-plan', tier: 'advanced', order: 130, icon: 'Quarterly', title: 'Quarterly Flight Plan', description: 'Keep your seasonal list moving this quarter.', metric: 'quarterlySightedCount', goal: 25, xp: 220 },
      { id: 'challenge-season-questline', tier: 'seasonal-mastery', order: 140, icon: 'Quest', title: 'Season Questline', description: 'Log 12 sightings during {season} to complete your chapter.', metric: 'seasonalLogCount', goal: 12, xp: 180 },
      { id: 'challenge-season-bridge', tier: 'seasonal-mastery', order: 150, icon: 'Seasons', title: 'Season Bridge', description: 'Keep birding going across multiple seasons of the year.', metric: 'loggedSeasonCount', goal: 2, xp: 175 },
      { id: 'challenge-lifetime-lister', tier: 'seasonal-mastery', order: 160, icon: 'All Time', title: 'Lifetime Lister', description: 'Grow your all-time bird checklist.', metric: 'totalSighted', goal: 100, xp: 300 }
    ],
    badgeDefs: [
      { id: 'badge-first-feather', tier: 'beginner', order: 10, icon: 'First', title: 'First Feather', description: 'Mark your first bird species as sighted.', rarity: 'common', metric: 'totalSighted', goal: 1, xp: 50 },
      { id: 'badge-common-core', tier: 'beginner', order: 20, icon: 'Common', title: 'Common Core', description: 'Build a strong base with common species.', rarity: 'common', metric: 'commonSightedCount', goal: 25, xp: 120 },
      { id: 'badge-streak-keeper', tier: 'intermediate', order: 30, icon: 'Streak', title: 'Streak Keeper', description: 'Build a 7-day birding streak.', rarity: 'rare', metric: 'streak.currentStreak', goal: 7, xp: 210 },
      { id: 'badge-rare-find', tier: 'intermediate', order: 40, icon: 'Rare', title: 'Rare Find', description: 'Spot five rare-or-better birds.', rarity: 'rare', metric: 'rareSightedCount', goal: 5, xp: 180 },
      { id: 'badge-migration-mapper', tier: 'intermediate', order: 50, icon: 'Migration', title: 'Migration Mapper', description: 'Log species associated with migration seasons.', rarity: 'rare', metric: 'migrationSightedCount', goal: 10, xp: 220 },
      { id: 'badge-habitat-naturalist', tier: 'intermediate', order: 60, icon: 'Habitat', title: 'Habitat Naturalist', description: 'Log birds in all habitat options available in the field log.', rarity: 'rare', metric: 'totalHabitatCount', goal: 4, xp: 220 },
      { id: 'badge-region-ranger', tier: 'intermediate', order: 70, icon: 'Map', title: 'Region Ranger', description: 'Log birds across every region option in the tracker.', rarity: 'rare', metric: 'totalRegionCount', goal: 4, xp: 220 },
      { id: 'badge-season-spotter', tier: 'advanced', order: 80, icon: '{seasonLabel}', title: '{seasonLabel} Spotter', description: 'Track birds available during {season}.', rarity: 'epic', metric: 'inSeasonSightedCount', goal: 20, xp: 260 },
      { id: 'badge-family-finisher', tier: 'advanced', order: 90, icon: 'Family', title: 'Family Finisher', description: 'Completely finish one family list.', rarity: 'epic', metric: 'familiesCompleted', goal: 1, xp: 280 },
      { id: 'badge-sharp-eyed', tier: 'advanced', order: 100, icon: 'Confidence', title: 'Sharp-Eyed', description: 'Accumulate 30 certain sightings through careful identification.', rarity: 'epic', metric: 'totalCertainLogCount', goal: 30, xp: 290 },
      { id: 'badge-proof-positive', tier: 'advanced', order: 110, icon: 'Evidence', title: 'Proof Positive', description: 'Back up 12 sightings with photo or audio evidence.', rarity: 'epic', metric: 'evidenceLogCount', goal: 12, xp: 300 },
      { id: 'badge-genus-guide', tier: 'advanced', order: 120, icon: 'Genus', title: 'Genus Guide', description: 'Sight birds from 30 distinct genera.', rarity: 'epic', metric: 'generaSightedCount', goal: 30, xp: 320 },
      { id: 'badge-bingo-beginner', tier: 'seasonal-mastery', order: 130, icon: 'Bingo', title: 'Bingo Beginner', description: 'Complete 3 bingo tiles in the current season.', rarity: 'epic', metric: 'bingo.completedCount', goal: 3, xp: 240 },
      { id: 'badge-ultra-rarity', tier: 'seasonal-mastery', order: 140, icon: 'Ultra', title: 'Ultra-Rarity', description: 'Sight at least one very rare or extremely rare bird.', rarity: 'legendary', metric: 'veryRareSightedCount', goal: 1, xp: 350 },
      { id: 'badge-season-chapter-clear', tier: 'seasonal-mastery', order: 150, icon: 'Quest', title: 'Season Chapter Clear', description: 'Finish all seasonal questline steps.', rarity: 'legendary', metric: 'seasonQuestCompletedCount', goal: 4, xp: 320 },
      { id: 'badge-year-round-birder', tier: 'seasonal-mastery', order: 160, icon: 'Seasons', title: 'Year-Round Birder', description: 'Log birds in spring, summer, fall, and winter.', rarity: 'legendary', metric: 'loggedSeasonCount', goal: 4, xp: 360 },
      { id: 'badge-legendary-lister', tier: 'seasonal-mastery', order: 170, icon: 'Legend', title: 'Legendary Lister', description: 'Reach 100 total bird species sighted.', rarity: 'legendary', metric: 'totalSighted', goal: 100, xp: 400 }
    ],
    dailyChallengeDefs: [
      { id: 'daily-log-1', icon: 'Daily', title: 'Show Up Today', description: 'Log at least one sighting today.', metric: 'todayLogCount', goal: 1, xp: 30 },
      { id: 'daily-new-species', icon: 'Discovery', title: 'Fresh Feathers', description: 'Log 2 unique species today.', metric: 'todayUniqueSpeciesCount', goal: 2, xp: 45 },
      { id: 'daily-context-mix', icon: 'Explorer', title: 'Context Mixer', description: 'Log sightings in 2 different regions or habitats today.', metric: 'todayContextMixCount', goal: 2, xp: 35 },
      { id: 'daily-rare', icon: 'Rare', title: 'Rare Radar (Daily)', description: 'Log one rare-or-better species today.', metric: 'todayRareLogCount', goal: 1, xp: 55 },
      { id: 'daily-confidence', icon: 'Quality', title: 'Certain Signal', description: 'Log 2 sightings with confidence set to Certain today.', metric: 'todayCertainCount', goal: 2, xp: 40 },
      { id: 'daily-evidence', icon: 'Evidence', title: 'Field Proof', description: 'Add photo or audio evidence to a sighting today.', metric: 'todayEvidenceLogCount', goal: 1, xp: 45 },
      { id: 'daily-family-mix', icon: 'Family', title: 'Family Mix', description: 'Log birds from 2 different families today.', metric: 'todayFamilyMixCount', goal: 2, xp: 45 }
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
      { id: 'b12', label: 'Complete 1 family', metric: 'familiesCompleted', goal: 1, xp: 70 },
      { id: 'b13', label: 'Log 1 evidence-backed sighting this season', metric: 'seasonEvidenceLogCount', goal: 1, xp: 45 },
      { id: 'b14', label: 'Reach 10 certain sightings', metric: 'totalCertainLogCount', goal: 10, xp: 50 },
      { id: 'b15', label: 'Sight 10 genera', metric: 'generaSightedCount', goal: 10, xp: 55 }
    ],
    seasonQuestDefs: [
      { id: 'sq-1', tier: 'beginner', order: 10, icon: 'Scout', title: 'Scout Phase', description: 'Log 5 sightings this season.', metric: 'seasonalLogCount', goal: 5, xp: 80 },
      { id: 'sq-2', tier: 'intermediate', order: 20, icon: 'Variety', title: 'Variety Phase', description: 'Log sightings across 3 habitats this season.', metric: 'seasonHabitatCount', goal: 3, xp: 90 },
      { id: 'sq-3', tier: 'advanced', order: 30, icon: 'Rare', title: 'Rare Phase', description: 'Find 2 rare-or-better species this season.', metric: 'rareSightedCount', goal: 2, xp: 110 },
      { id: 'sq-4', tier: 'seasonal-mastery', order: 40, icon: 'Mastery', title: 'Mastery Phase', description: 'Reach 15 seasonal sightings.', metric: 'seasonalLogCount', goal: 15, xp: 140 }
    ]
  };

  // Keep storage routing independent of `state` initialization to avoid TDZ errors.
  let activePersistenceSubTab = 'birds';

  const state = {
    initialized: false,
    activeSubTab: 'birds',
    activeBirdView: loadBirdUiPrefs().activeBirdView,
    activeBirdCollection: 'challenges-badges',
    collectionTierFilter: loadBirdUiPrefs().collectionTierFilter,
    collectionPathMode: loadBirdUiPrefs().collectionPathMode,
    collectionAlmostCompleteOnly: loadBirdUiPrefs().collectionAlmostCompleteOnly,
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
    birdLogPreset: loadBirdUiPrefs().birdLogPreset,
    birdLogCommandValue: loadBirdUiPrefs().birdLogCommandValue,
    birdLogSpeciesQuery: '',
    lastLoggedBirdId: '',
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
    syncLastError: '',
    syncLastErrorCode: '',
    syncSchemaDiagnostics: {
      status: 'unknown',
      checkedAt: '',
      sightingsMissing: [],
      userStateMissing: [],
      details: ''
    },
    birdDataWorkbookPath: '',
    birdSyncWorkbookPath: '',
    birdCollectionsCache: {
      stats: null,
      challenges: [],
      badges: [],
      questline: { steps: [], completedCount: 0 },
      bingo: null
    },
    locationOptions: {
      loading: false,
      loaded: false,
      values: []
    },
    birdImport: {
      sourceLabel: '',
      candidates: [],
      lastAnalysis: null,
      busy: false
    },
    lastSyncAttemptAt: '',
    lastSyncSuccessAt: '',
    lastLoadedAt: null,
    subTabSwitchToken: 0,
    subTabData: CONFIG_DRIVEN_SUBTABS.reduce((acc, key) => {
      acc[key] = {
        loaded: false,
        loading: false,
        source: '',
        error: '',
        workbookPath: '',
        birds: [],
        families: [],
        sightings: {},
        favorites: [],
        sightingLog: [],
        diagnostics: {
          authState: 'checking',
          workbookPath: '',
          speciesProbe: 'waiting',
          syncProbe: 'waiting'
        }
      };
      return acc;
    }, {})
  };

  const birdsClickDiagnostics = {
    enabled: true,
    panel: null,
    total: 0,
    clickCount: 0,
    pointerupCount: 0,
    dedupedClicks: 0,
    lastEvent: '-',
    lastTarget: '-',
    recentTraces: [],
    maxRecentTraces: 40
  };

  // Per-action-key reliability guard state.
  const birdsActivationGuard = {
    inFlight: new Map(),  // actionKey -> true while async action is running
    lastAt: new Map()     // actionKey -> timestamp of last successful activation
  };
  const BIRDS_ACTIVATION_DEDUPE_MS = 300;      // ignore re-activation within this window
  const BIRDS_ACTIVATION_LOCK_TIMEOUT_MS = 8000; // safety-release stuck lock after this long

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
    const categoryLabel = getActiveCategoryLabel();
    const categorySingular = getActiveCategorySingularLabel();
    if (!birdsClickDiagnostics.enabled) {
      birdsClickDiagnostics.panel.innerHTML = `
        <div class="nature-click-diagnostics-heading">
          <span>${escapeHtml(categoryLabel)} click diagnostics</span>
          <span class="nature-click-diagnostics-status">Paused</span>
        </div>
        <div class="nature-click-diagnostics-empty">Diagnostics are currently disabled. Use <code>window.setBirdClickDiagnosticsEnabled(true)</code> to turn live tracking back on.</div>
        <div class="nature-log-form-actions" style="margin-top:8px;">
          <button type="button" id="birdsCopyRecentClickTraceBtn" class="pill-button" ${birdsClickDiagnostics.recentTraces.length ? '' : 'disabled'}>Copy recent click trace JSON (${birdsClickDiagnostics.recentTraces.length})</button>
          <button type="button" id="birdsDownloadRecentClickTraceBtn" class="pill-button" ${birdsClickDiagnostics.recentTraces.length ? '' : 'disabled'}>Download click trace JSON (${birdsClickDiagnostics.recentTraces.length})</button>
        </div>
      `;
      return;
    }

    const hasEvents = birdsClickDiagnostics.total > 0 || birdsClickDiagnostics.dedupedClicks > 0;
    birdsClickDiagnostics.panel.innerHTML = `
      <div class="nature-click-diagnostics-heading">
        <span>${escapeHtml(categoryLabel)} click diagnostics</span>
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
        <div class="nature-click-diagnostics-row"><strong>Status</strong><span>${hasEvents ? `Tracking recent ${categoryLabel} button activations.` : `Waiting for your next ${categorySingular} button interaction.`}</span></div>
      </div>
      <div class="nature-log-form-actions" style="margin-top:8px;">
        <button type="button" id="birdsCopyRecentClickTraceBtn" class="pill-button" ${birdsClickDiagnostics.recentTraces.length ? '' : 'disabled'}>Copy recent click trace JSON (${birdsClickDiagnostics.recentTraces.length})</button>
        <button type="button" id="birdsDownloadRecentClickTraceBtn" class="pill-button" ${birdsClickDiagnostics.recentTraces.length ? '' : 'disabled'}>Download click trace JSON (${birdsClickDiagnostics.recentTraces.length})</button>
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

  function isBirdConsoleTraceEnabled() {
    if (typeof window === 'undefined') return false;
    return window.__BIRDS_CLICK_DIAG__ === true;
  }

  function getBirdDiagnosticActionKey(target) {
    if (!target || typeof target.getAttribute !== 'function') return 'unknown';
    if (target.id) return `id:${target.id}`;
    if (target.getAttribute('data-nature-subtab')) return `subtab:${target.getAttribute('data-nature-subtab')}`;
    if (target.getAttribute('data-birds-more')) return `more:${target.getAttribute('data-birds-more')}`;
    if (target.getAttribute('data-birds-collection-tier')) return `tier:${target.getAttribute('data-birds-collection-tier')}`;
    if (target.getAttribute('data-birds-overview-jump')) return `jump:${target.getAttribute('data-birds-overview-jump')}`;
    if (target.getAttribute('data-bird-toggle')) return `toggle:${target.getAttribute('data-bird-toggle')}`;
    if (target.getAttribute('data-bird-open')) return `open:${target.getAttribute('data-bird-open')}`;
    if (target.getAttribute('data-bird-favorite')) return `favorite:${target.getAttribute('data-bird-favorite')}`;
    if (target.getAttribute('data-sync-resolve')) return `sync:${target.getAttribute('data-sync-resolve')}`;
    return `tag:${String(target.tagName || '').toLowerCase()}`;
  }

  function emitBirdClickTrace(phase, event, target, extra = {}) {
    if (!isBirdConsoleTraceEnabled()) return;
    const payload = {
      traceId: `birds-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ts: new Date().toISOString(),
      phase: String(phase || 'unknown'),
      eventType: event && event.type ? event.type : 'none',
      actionKey: getBirdDiagnosticActionKey(target),
      activeSubTab: state.activeSubTab,
      activeBirdView: state.activeBirdView,
      selectedBirdId: state.selectedBirdId || '',
      pointerType: event && event.pointerType ? String(event.pointerType) : '',
      isPrimary: event && Object.prototype.hasOwnProperty.call(event, 'isPrimary') ? Boolean(event.isPrimary) : null,
      button: event && Object.prototype.hasOwnProperty.call(event, 'button') ? Number(event.button) : null,
      defaultPrevented: Boolean(event && event.defaultPrevented),
      isTrusted: Boolean(event && event.isTrusted),
      ...extra
    };
    birdsClickDiagnostics.recentTraces.push(payload);
    if (birdsClickDiagnostics.recentTraces.length > birdsClickDiagnostics.maxRecentTraces) {
      birdsClickDiagnostics.recentTraces = birdsClickDiagnostics.recentTraces.slice(-birdsClickDiagnostics.maxRecentTraces);
    }
    try {
      console.debug('[BirdsClickTrace]', payload);
    } catch (_error) {
      // Ignore console sink errors.
    }
  }

  function getRecentBirdClickTraceSnapshot() {
    return {
      copiedAt: new Date().toISOString(),
      traceCount: birdsClickDiagnostics.recentTraces.length,
      traces: birdsClickDiagnostics.recentTraces.slice()
    };
  }

  async function downloadRecentBirdClickTraceJson() {
    const snapshot = getRecentBirdClickTraceSnapshot();
    if (!snapshot.traceCount) {
      if (typeof window.showToast === 'function') window.showToast('No click traces captured yet.', 'info', 1800);
      return false;
    }

    const text = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([text], { type: 'application/json' });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `birds-click-trace-${stamp}.json`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);

    if (typeof window.showToast === 'function') {
      window.showToast(`Downloaded ${snapshot.traceCount} click trace entries.`, 'success', 2200);
    }
    return true;
  }

  async function copyRecentBirdClickTraceJson() {
    const snapshot = getRecentBirdClickTraceSnapshot();
    const text = JSON.stringify(snapshot, null, 2);
    if (!snapshot.traceCount) {
      if (typeof window.showToast === 'function') window.showToast('No click traces captured yet.', 'info', 1800);
      return false;
    }
    try {
      if (navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch (_error) {
      const probe = document.createElement('textarea');
      probe.value = text;
      probe.setAttribute('readonly', 'readonly');
      probe.style.position = 'fixed';
      probe.style.top = '-9999px';
      document.body.appendChild(probe);
      probe.select();
      document.execCommand('copy');
      document.body.removeChild(probe);
    }
    if (typeof window.showToast === 'function') {
      window.showToast(`Copied ${snapshot.traceCount} click trace entries.`, 'success', 2000);
    }
    return true;
  }

  function resetBirdClickDiagnosticsState() {
    birdsClickDiagnostics.total = 0;
    birdsClickDiagnostics.clickCount = 0;
    birdsClickDiagnostics.pointerupCount = 0;
    birdsClickDiagnostics.dedupedClicks = 0;
    birdsClickDiagnostics.lastEvent = '-';
    birdsClickDiagnostics.lastTarget = '-';
    birdsClickDiagnostics.recentTraces = [];
    renderBirdClickDiagnosticsPanel();
    return {
      total: birdsClickDiagnostics.total,
      clickCount: birdsClickDiagnostics.clickCount,
      pointerupCount: birdsClickDiagnostics.pointerupCount,
      dedupedClicks: birdsClickDiagnostics.dedupedClicks,
      lastEvent: birdsClickDiagnostics.lastEvent,
      lastTarget: birdsClickDiagnostics.lastTarget,
      recentTraceCount: birdsClickDiagnostics.recentTraces.length
    };
  }

  // ── Button reliability helpers ───────────────────────────────────────────────

  /**
   * Returns true when a button element is safe to activate.
   * Fails closed: disabled, aria-disabled="true", or data-busy="1" all block.
   */
  function isButtonActivatable(target) {
    if (window.ButtonActionGuard && typeof window.ButtonActionGuard.isActivatable === 'function') {
      return window.ButtonActionGuard.isActivatable(target);
    }
    if (!target) return false;
    if (target.disabled === true) return false;
    if (target.getAttribute('aria-disabled') === 'true') return false;
    if (target.dataset && target.dataset.busy === '1') return false;
    return true;
  }

  /**
   * Derives a stable, unique activation key from a target element.
   * Prefers the element id; falls back to the most specific data-attribute.
   */
  function getBirdsActivationKey(target) {
    if (!target) return 'unknown';
    if (target.id) return target.id;
    const keyAttrs = [
      'data-bird-toggle', 'data-bird-favorite', 'data-bird-open',
      'data-nature-subtab', 'data-birds-more', 'data-sync-resolve',
      'data-birds-collection-tier', 'data-birds-overview-jump',
      'data-birds-overview-filter', 'data-birds-filter-chip'
    ];
    for (let i = 0; i < keyAttrs.length; i++) {
      const val = target.getAttribute(keyAttrs[i]);
      if (val != null) return `${keyAttrs[i]}:${val}`;
    }
    return `tag:${String(target.tagName || '').toLowerCase()}`;
  }

  /**
   * Runs `fn` with three automatic protections applied:
   *   1. Fail-closed disabled/aria-disabled/busy check.
   *   2. Per-action-key in-flight lock (prevents double-activation of async work).
   *   3. 300 ms activation dedupe window (catches rapid repeat taps/clicks).
   * The lock is always released via `finally`; a 8 s safety timeout prevents
   * a hung `fn` from permanently locking a button.
   *
   * Works with both sync and async `fn`.
   */
  async function withBirdsActionGuard(target, fn) {
    if (window.ButtonActionGuard && typeof window.ButtonActionGuard.withActionGuard === 'function') {
      return window.ButtonActionGuard.withActionGuard({
        scope: 'nature-birds',
        target,
        action: fn,
        dedupeMs: BIRDS_ACTIVATION_DEDUPE_MS,
        lockTimeoutMs: BIRDS_ACTIVATION_LOCK_TIMEOUT_MS,
        getActionKey: getBirdsActivationKey,
        onBlocked(reason, meta = {}) {
          if (reason === 'disabled') emitBirdClickTrace('guard-blocked-disabled', null, target);
          else if (reason === 'in-flight') emitBirdClickTrace('guard-blocked-in-flight', null, target, { key: meta.key || '' });
          else if (reason === 'dedupe') emitBirdClickTrace('guard-blocked-dedupe', null, target, { key: meta.key || '', ageMs: Number(meta.ageMs) || 0 });
        }
      });
    }

    if (!isButtonActivatable(target)) {
      emitBirdClickTrace('guard-blocked-disabled', null, target);
      return;
    }
    const key = getBirdsActivationKey(target);
    const now = Date.now();

    if (birdsActivationGuard.inFlight.get(key)) {
      emitBirdClickTrace('guard-blocked-in-flight', null, target, { key });
      return;
    }

    const lastAt = birdsActivationGuard.lastAt.get(key) || 0;
    if (now - lastAt < BIRDS_ACTIVATION_DEDUPE_MS) {
      emitBirdClickTrace('guard-blocked-dedupe', null, target, { key, ageMs: now - lastAt });
      return;
    }

    birdsActivationGuard.inFlight.set(key, true);
    birdsActivationGuard.lastAt.set(key, now);
    if (target.dataset) target.dataset.busy = '1';

    const safetyTimer = window.setTimeout(() => {
      birdsActivationGuard.inFlight.delete(key);
      if (target.dataset) delete target.dataset.busy;
    }, BIRDS_ACTIVATION_LOCK_TIMEOUT_MS);

    try {
      await fn();
    } finally {
      clearTimeout(safetyTimer);
      birdsActivationGuard.inFlight.delete(key);
      if (target.dataset) delete target.dataset.busy;
    }
  }

  // ────────────────────────────────────────────────────────────────────────────

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
    state.birdLogPreset = 'field-full';
    state.birdLogCommandValue = '';
    state.activeOverviewSection = 'daily';
    state.activeBirdCollection = 'challenges-badges';
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
    set('birdsChallengesBadgesSummary', `Showing ${summary.achievementShown} of ${summary.achievementTotal} challenge and badge cards`);
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
    announcer.textContent = `${filterText}. Showing ${summary.achievementShown} challenge and badge cards, ${summary.questShown} quests, and ${summary.bingoShown} bingo tiles.`;
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
    ['birdsDailyChallengeGrid', 'birdsChallengesBadgesGrid', 'birdsSeasonQuestGrid', 'birdsBingoGrid'].forEach((id) => {
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
    const actionButton = document.getElementById('birdsUndoActionBtn');
    const prompt = document.getElementById('birdsUndoPrompt');
    if (prompt) prompt.hidden = true;
    if (!actionButton) return;
    const categoryLabel = getActiveCategoryLabel();
    const categoryLower = categoryLabel.toLowerCase();
    if (!state.lastUndoAction) {
      actionButton.disabled = true;
      actionButton.setAttribute('aria-disabled', 'true');
      actionButton.setAttribute('title', `No ${categoryLabel} action to undo yet`);
      actionButton.setAttribute('data-tooltip', `No ${categoryLabel} action to undo yet`);
      return;
    }
    const label = state.lastUndoAction.label || `Last ${categoryLower} action`;
    const tooltip = `Undo the last ${categoryLabel} action: ${label}`;
    actionButton.disabled = false;
    actionButton.setAttribute('aria-disabled', 'false');
    actionButton.setAttribute('title', tooltip);
    actionButton.setAttribute('data-tooltip', tooltip);
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

  function getBirdSyncDeviceId() {
    const existing = String(localStorage.getItem(BIRD_SYNC_DEVICE_KEY) || '').trim();
    if (existing) return existing;
    const created = `device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(BIRD_SYNC_DEVICE_KEY, created);
    return created;
  }

  function getBirdSyncUserId() {
    const account = window.activeAccount || null;
    if (!account) return '';
    return String(account.username || account.homeAccountId || account.localAccountId || '').trim();
  }

  function parseBooleanFlag(value) {
    const text = norm(value);
    return text === 'true' || text === '1' || text === 'yes';
  }

  function getBirdLogDraftFieldIds() {
    return [
      'birdsLogSpeciesSelect',
      'birdsLogSpeciesSearchInput',
      'birdsLogDateInput',
      'birdsLogLocationInput',
      'birdsLogLocationOtherInput',
      'birdsLogCountInput',
      'birdsLogRegionInput',
      'birdsLogHabitatInput',
      'birdsLogLatInput',
      'birdsLogLngInput',
      'birdsLogConfidenceInput',
      'birdsLogNotesInput',
      'birdsLogCommandInput'
    ];
  }

  function saveBirdLogDraft() {
    const fields = {};
    getBirdLogDraftFieldIds().forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      fields[id] = String(el.value || '');
    });
    try {
      localStorage.setItem(BIRD_LOG_DRAFT_KEY, JSON.stringify({ updatedAt: toIsoNow(), fields }));
    } catch (_error) {
      // Draft autosave is best-effort only.
    }
  }

  function clearBirdLogDraft() {
    try {
      localStorage.removeItem(BIRD_LOG_DRAFT_KEY);
    } catch (_error) {
      // Ignore storage failures.
    }
  }

  function restoreBirdLogDraft() {
    const raw = localStorage.getItem(BIRD_LOG_DRAFT_KEY);
    if (!raw) return false;
    const parsed = safeJsonParse(raw, null);
    if (!parsed || !parsed.fields) return false;
    let restoredAny = false;
    getBirdLogDraftFieldIds().forEach((id) => {
      if (!Object.prototype.hasOwnProperty.call(parsed.fields, id)) return;
      const el = document.getElementById(id);
      if (!el) return;
      const value = String(parsed.fields[id] || '');
      if (!value) return;
      el.value = value;
      restoredAny = true;
    });
    const locationSelect = document.getElementById('birdsLogLocationInput');
    const locationOtherInput = document.getElementById('birdsLogLocationOtherInput');
    if (locationSelect && locationOtherInput) {
      const isOther = locationSelect.value === '__other__';
      locationOtherInput.hidden = !isOther;
    }

    const speciesSearchInput = document.getElementById('birdsLogSpeciesSearchInput');
    const speciesSelect = document.getElementById('birdsLogSpeciesSelect');
    if (speciesSearchInput && speciesSelect && !speciesSelect.value && speciesSearchInput.value) {
      const resolvedId = resolveBirdIdFromLogSpeciesInput(speciesSearchInput.value);
      if (resolvedId) speciesSelect.value = resolvedId;
    }

    if (restoredAny) {
      renderBirdLogValidationBadges();
      renderBirdLogHistoryCard();
      if (typeof window.showToast === 'function') {
        window.showToast('Restored your unsaved bird log draft.', 'info', 2200);
      }
    }
    return restoredAny;
  }

  function normalizeSyncColumnName(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  function getMissingRequiredColumns(columns, requiredColumns) {
    const available = new Set((columns || [])
      .map((column) => normalizeSyncColumnName(column && column.name))
      .filter(Boolean));
    return (requiredColumns || [])
      .map((name) => normalizeSyncColumnName(name))
      .filter((name) => name && !available.has(name));
  }

  function setSyncSchemaDiagnosticsFromColumns(sightingsColumns, userStateColumns) {
    const sightingsMissing = getMissingRequiredColumns(sightingsColumns, BIRD_SIGHTINGS_REQUIRED_COLUMNS);
    const userStateMissing = getMissingRequiredColumns(userStateColumns, BIRD_USER_STATE_REQUIRED_COLUMNS);
    const sightingsOptionalMissing = getMissingRequiredColumns(sightingsColumns, BIRD_SIGHTINGS_EVIDENCE_COLUMNS);
    const hasRequiredMissing = sightingsMissing.length || userStateMissing.length;
    const hasOptionalMissing = sightingsOptionalMissing.length > 0;
    const status = hasRequiredMissing ? 'missing-columns' : (hasOptionalMissing ? 'optional-columns-missing' : 'ok');
    state.syncSchemaDiagnostics = {
      status,
      checkedAt: toIsoNow(),
      sightingsMissing,
      userStateMissing,
      sightingsOptionalMissing,
      details: ''
    };
  }

  function setSyncSchemaDiagnosticsUnknown(details) {
    state.syncSchemaDiagnostics = {
      status: 'unknown',
      checkedAt: toIsoNow(),
      sightingsMissing: [],
      userStateMissing: [],
      sightingsOptionalMissing: [],
      details: String(details || '').trim()
    };
  }

  function getSyncSchemaDiagnosticsSummary() {
    const diag = state.syncSchemaDiagnostics || {};
    if (diag.status === 'ok') return 'OK - required columns detected for both sync tables.';
    if (diag.status === 'optional-columns-missing') {
      const missing = Array.isArray(diag.sightingsOptionalMissing) ? diag.sightingsOptionalMissing : [];
      return `Evidence URL columns not yet added to sightings table (${missing.join(', ')}). Add them to enable OneDrive media link storage. Sightings and filename-only evidence will still save normally.`;
    }
    if (diag.status === 'missing-columns') {
      const notes = [];
      if (Array.isArray(diag.sightingsMissing) && diag.sightingsMissing.length) {
        notes.push(`birds_sightings missing: ${diag.sightingsMissing.join(', ')}`);
      }
      if (Array.isArray(diag.userStateMissing) && diag.userStateMissing.length) {
        notes.push(`birds_user_state missing: ${diag.userStateMissing.join(', ')}`);
      }
      return notes.join(' | ');
    }
    if (diag.details) return `Unknown - ${diag.details}`;
    return 'Unknown - schema has not been checked yet.';
  }

  function getSyncSchemaDiagnosticsChip() {
    const diag = state.syncSchemaDiagnostics || {};
    if (diag.status === 'ok') {
      return { label: 'OK', className: 'is-good' };
    }
    if (diag.status === 'optional-columns-missing') {
      return { label: 'Evidence columns missing', className: 'is-warn' };
    }
    if (diag.status === 'missing-columns') {
      return { label: 'Needs review', className: 'is-alert' };
    }
    return { label: 'Unknown', className: '' };
  }

  function evidenceColumnsAreMissing() {
    const diag = state.syncSchemaDiagnostics || {};
    return (
      diag.status === 'optional-columns-missing'
      || (Array.isArray(diag.sightingsOptionalMissing) && diag.sightingsOptionalMissing.length > 0)
    );
  }

  function parseSyncTimestamp(value) {
    const raw = String(value || '').trim();
    if (!raw) return 0;
    const parsed = Date.parse(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function toIsoNow() {
    return new Date().toISOString();
  }

  function toSafeDateObserved(value) {
    const parsed = parseObservedDate(value);
    return parsed ? getDateKey(parsed) : getDateKey(new Date());
  }

  function normalizeSightingEntry(entry) {
    const base = entry || {};
    const eventId = String(base.eventId || base.id || '').trim() || `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const createdAt = String(base.createdAt || '').trim() || toIsoNow();
    const updatedAt = String(base.updatedAt || '').trim() || createdAt;
    return {
      ...base,
      id: eventId,
      eventId,
      dateObserved: toSafeDateObserved(base.dateObserved || createdAt),
      count: Math.max(1, Number(base.count || 1) || 1),
      photoName: String(base.photoName || '').trim(),
      audioName: String(base.audioName || '').trim(),
      photoUrl: String(base.photoUrl || '').trim(),
      audioUrl: String(base.audioUrl || '').trim(),
      createdAt,
      updatedAt,
      synced: Boolean(base.synced),
      syncedAt: base.syncedAt ? String(base.syncedAt) : ''
    };
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
      activeOverviewSection: ['daily', 'challenges-badges', 'quests', 'bingo'].includes(prefs.activeOverviewSection)
        ? prefs.activeOverviewSection
        : ['challenges', 'badges'].includes(prefs.activeOverviewSection)
          ? 'challenges-badges'
          : 'daily',
      commandInputValue: String(prefs.commandInputValue || ''),
      birdRecommendationStrategy: ['progress-first', 'rarity-first', 'season-first'].includes(prefs.birdRecommendationStrategy)
        ? prefs.birdRecommendationStrategy
        : 'progress-first',
      birdPaginationMode: ['paged', 'load-more'].includes(prefs.birdPaginationMode)
        ? prefs.birdPaginationMode
        : 'paged',
      birdLogPreset: ['quick', 'field-full', 'evidence'].includes(prefs.birdLogPreset)
        ? prefs.birdLogPreset
        : 'field-full',
      birdLogCommandValue: String(prefs.birdLogCommandValue || ''),
      collectionTierFilter: ['all', 'beginner', 'intermediate', 'advanced', 'seasonal-mastery'].includes(prefs.collectionTierFilter)
        ? prefs.collectionTierFilter
        : 'all',
      collectionPathMode: Boolean(prefs.collectionPathMode),
      collectionAlmostCompleteOnly: Boolean(prefs.collectionAlmostCompleteOnly)
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
        : 'paged',
      birdLogPreset: ['quick', 'field-full', 'evidence'].includes(state.birdLogPreset)
        ? state.birdLogPreset
        : 'field-full',
      birdLogCommandValue: state.birdLogCommandValue || '',
      collectionTierFilter: ['all', 'beginner', 'intermediate', 'advanced', 'seasonal-mastery'].includes(state.collectionTierFilter)
        ? state.collectionTierFilter
        : 'all',
      collectionPathMode: Boolean(state.collectionPathMode),
      collectionAlmostCompleteOnly: Boolean(state.collectionAlmostCompleteOnly)
    }));
  }

  function getPersistenceSubTabKey(subTabKey) {
    const active = String(subTabKey || activePersistenceSubTab || 'birds').trim();
    return isConfigDrivenSubTab(active) ? active : 'birds';
  }

  function getSubTabStorageKeys(subTabKey) {
    if (subTabKey === 'birds') {
      return {
        sightings: BIRD_SIGHTINGS_KEY,
        favorites: BIRD_FAVORITES_KEY,
        sightingLog: BIRD_SIGHTING_LOG_KEY
      };
    }
    return {
      sightings: getSubTabStorageKey(subTabKey, 'sightings'),
      favorites: getSubTabStorageKey(subTabKey, 'favorites'),
      sightingLog: getSubTabStorageKey(subTabKey, 'sighting-log')
    };
  }

  function loadSubTabSightingLog(key) {
    const keys = getSubTabStorageKeys(key);
    const list = safeJsonParse(localStorage.getItem(keys.sightingLog), []);
    return Array.isArray(list) ? list : [];
  }

  function saveSubTabSightingLog(key, sightingLog) {
    const keys = getSubTabStorageKeys(key);
    localStorage.setItem(keys.sightingLog, JSON.stringify(Array.isArray(sightingLog) ? sightingLog : []));
  }

  function loadSightings() {
    const keys = getSubTabStorageKeys(getPersistenceSubTabKey(activePersistenceSubTab));
    return safeJsonParse(localStorage.getItem(keys.sightings), {}) || {};
  }

  function saveSightings() {
    const keys = getSubTabStorageKeys(getPersistenceSubTabKey(activePersistenceSubTab));
    localStorage.setItem(keys.sightings, JSON.stringify(state.sightings || {}));
  }

  function loadFavorites() {
    const keys = getSubTabStorageKeys(getPersistenceSubTabKey(activePersistenceSubTab));
    const list = safeJsonParse(localStorage.getItem(keys.favorites), []);
    return Array.isArray(list) ? list : [];
  }

  function saveFavorites() {
    const keys = getSubTabStorageKeys(getPersistenceSubTabKey(activePersistenceSubTab));
    localStorage.setItem(keys.favorites, JSON.stringify(state.favorites || []));
  }

  function loadSightingLog() {
    const keys = getSubTabStorageKeys(getPersistenceSubTabKey(activePersistenceSubTab));
    const list = safeJsonParse(localStorage.getItem(keys.sightingLog), []);
    return Array.isArray(list) ? list : [];
  }

  function saveSightingLog() {
    const keys = getSubTabStorageKeys(getPersistenceSubTabKey(activePersistenceSubTab));
    localStorage.setItem(keys.sightingLog, JSON.stringify(state.sightingLog || []));
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

  async function fetchGraphJson(url, options = {}) {
    const run = async () => {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${window.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const error = new Error(`Graph request failed (${response.status})`);
        error.status = response.status;
        error.url = url;
        throw error;
      }
      return response.json().catch(() => ({}));
    };

    const retries = Math.max(0, Number(options.retries != null ? options.retries : 2) || 0);
    if (window.ReliabilityAsync && typeof window.ReliabilityAsync.retryRead === 'function') {
      if (retries === 0) return run();
      return window.ReliabilityAsync.retryRead('Graph read', run, { retries, backoffMs: 320 });
    }
    return run();
  }

  async function fetchGraphRequest(url, options = {}) {
    const method = String(options.method || 'GET').toUpperCase();
    const run = async () => {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${window.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: options.body ? JSON.stringify(options.body) : undefined
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        throw new Error(`Graph request failed (${response.status})${detail ? `: ${detail.slice(0, 200)}` : ''}`);
      }
      if (response.status === 204) return {};
      return response.json().catch(() => ({}));
    };

    if (window.ReliabilityAsync) {
      if (method === 'GET' && typeof window.ReliabilityAsync.retryRead === 'function') {
        return window.ReliabilityAsync.retryRead('Graph read', run, { retries: 2, backoffMs: 320 });
      }
      if (Boolean(options.idempotentWrite) && typeof window.ReliabilityAsync.retryIdempotentWrite === 'function') {
        return window.ReliabilityAsync.retryIdempotentWrite('Graph idempotent write', run, { retries: 1, backoffMs: 450 });
      }
    }

    return run();
  }

  async function fetchTableColumnsAndRows(filePath, tableName, top = 5000) {
    const encodedPath = encodeGraphPath(filePath);
    const tableRef = encodeURIComponent(tableName);
    const baseUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/workbook/tables/${tableRef}`;
    const columnsPayload = await fetchGraphJson(`${baseUrl}/columns?$select=name,index`, { retries: 0 });
    const rowsPayload = await fetchGraphJson(`${baseUrl}/rows?$top=${Math.max(1, Number(top) || 5000)}`, { retries: 0 });
    return {
      columns: Array.isArray(columnsPayload.value) ? columnsPayload.value : [],
      rows: Array.isArray(rowsPayload.value) ? rowsPayload.value : []
    };
  }

  function toRowObjects(columns, rows) {
    const namesByIndex = {};
    (columns || []).forEach((column, idx) => {
      const index = Number.isInteger(column.index) ? column.index : idx;
      namesByIndex[index] = String(column.name || `column_${index}`).trim();
    });

    return (rows || []).map((row) => {
      const values = Array.isArray(row.values) && Array.isArray(row.values[0]) ? row.values[0] : [];
      const record = {};
      values.forEach((value, index) => {
        const key = namesByIndex[index] || `column_${index}`;
        record[key] = value;
      });
      return record;
    });
  }

  async function appendRowsToTable(filePath, tableName, rows) {
    const rowValues = Array.isArray(rows) ? rows.filter((row) => Array.isArray(row)) : [];
    if (!rowValues.length) return;
    const encodedPath = encodeGraphPath(filePath);
    const url = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/workbook/tables/${encodeURIComponent(tableName)}/rows/add`;
    await fetchGraphRequest(url, { method: 'POST', body: { values: rowValues } });
  }

  function mapRecordToRowByColumns(record, columns, requiredColumns = []) {
    const source = record && typeof record === 'object' ? record : {};
    const valueByNormalizedKey = {};
    Object.entries(source).forEach(([key, value]) => {
      const normalized = normalizeSyncColumnName(key);
      if (!normalized) return;
      valueByNormalizedKey[normalized] = value;
    });

    const availableColumns = (columns || []).map((column, idx) => {
      const index = Number.isInteger(column.index) ? column.index : idx;
      const name = String(column.name || '').trim();
      return { index, name, normalized: normalizeSyncColumnName(name) };
    });

    const availableSet = new Set(availableColumns.map((col) => col.normalized).filter(Boolean));
    const missingRequired = (requiredColumns || [])
      .map((name) => normalizeSyncColumnName(name))
      .filter((name) => name && !availableSet.has(name));

    if (missingRequired.length) {
      throw new Error(`Table schema missing required columns: ${missingRequired.join(', ')}`);
    }

    const sorted = availableColumns.slice().sort((a, b) => a.index - b.index);
    return sorted.map((column) => {
      if (!column.normalized) return '';
      const value = Object.prototype.hasOwnProperty.call(valueByNormalizedKey, column.normalized)
        ? valueByNormalizedKey[column.normalized]
        : '';
      return value == null ? '' : value;
    });
  }

  async function appendRecordsToTable(filePath, tableName, records, requiredColumns = []) {
    const list = Array.isArray(records) ? records.filter((record) => record && typeof record === 'object') : [];
    if (!list.length) return;
    const schema = await fetchTableColumnsAndRows(filePath, tableName, 1);
    const rows = list.map((record) => mapRecordToRowByColumns(record, schema.columns || [], requiredColumns));
    await appendRowsToTable(filePath, tableName, rows);
  }

  async function findWorkbookPathWithTables(tableNames, candidatePaths) {
    const needed = Array.isArray(tableNames) ? tableNames.filter(Boolean) : [];
    if (!needed.length) return '';
    const candidates = Array.isArray(candidatePaths) && candidatePaths.length
      ? candidatePaths
      : getBirdFileCandidates();
    for (let i = 0; i < candidates.length; i += 1) {
      const path = String(candidates[i] || '').trim();
      if (!path) continue;
      let allFound = true;
      for (let j = 0; j < needed.length; j += 1) {
        try {
          await fetchTableColumnsAndRows(path, needed[j], 1);
        } catch (_) {
          allFound = false;
          break;
        }
      }
      if (allFound) return path;
    }
    return '';
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

  function getProgressionTierMeta(tierKey) {
    const key = String(tierKey || '').trim();
    return PROGRESSION_TIER_META[key] || PROGRESSION_TIER_META.intermediate;
  }

  function normalizeProgressionTier(tierKey) {
    return Object.prototype.hasOwnProperty.call(PROGRESSION_TIER_META, String(tierKey || '').trim())
      ? String(tierKey || '').trim()
      : 'intermediate';
  }

  function applyProgressionTemplate(text, stats) {
    const categoryPlural = String(getActiveCategoryLabel() || 'Birds');
    const categorySingular = String(getActiveCategorySingularLabel() || 'Bird');
    const categoryPluralLower = categoryPlural.toLowerCase();
    const categorySingularLower = categorySingular.toLowerCase();

    return String(text || '')
      .replace(/\{seasonLabel\}/g, String(stats.currentSeasonLabel || 'Season'))
      .replace(/\{season\}/g, String(stats.currentSeason || 'season').toLowerCase())
      .replace(/\{categoryPlural\}/g, categoryPlural)
      .replace(/\{categoryPluralLower\}/g, categoryPluralLower)
      .replace(/\{categorySingular\}/g, categorySingular)
      .replace(/\{categorySingularLower\}/g, categorySingularLower)
      .replace(/\bbirding\b/gi, `${categorySingularLower} tracking`)
      .replace(/\bbird checklist\b/gi, `${categorySingularLower} checklist`)
      .replace(/\bbirds\b/gi, categoryPluralLower)
      .replace(/\bbird\b/gi, categorySingularLower);
  }

  function toProgressionCard(definition, stats) {
    const goal = Math.max(1, Number(definition.goal) || 1);
    const progress = Math.max(0, Number(getMetricValue(stats, definition.metric)) || 0);
    const tier = normalizeProgressionTier(definition.tier);
    const tierMeta = getProgressionTierMeta(tier);
    return {
      id: definition.id,
      icon: applyProgressionTemplate(definition.icon, stats),
      title: applyProgressionTemplate(definition.title, stats),
      description: applyProgressionTemplate(definition.description, stats),
      label: applyProgressionTemplate(definition.label, stats),
      metric: definition.metric,
      goal,
      progress,
      valueScore: Math.max(0, Number(definition.xp) || 0),
      tier,
      tierLabel: tierMeta.label,
      tierOrder: tierMeta.order,
      tierClassName: tierMeta.className,
      learningCopy: String(tierMeta.learningCopy || ''),
      sortOrder: Math.max(0, Number(definition.order) || 0),
      completed: progress >= goal,
      pct: Math.max(0, Math.min(100, Math.round((progress / goal) * 100)))
    };
  }

  function compareProgressionCards(a, b) {
    const tierDiff = (Number(a && a.tierOrder) || 0) - (Number(b && b.tierOrder) || 0);
    if (tierDiff !== 0) return tierDiff;
    const orderDiff = (Number(a && a.sortOrder) || 0) - (Number(b && b.sortOrder) || 0);
    if (orderDiff !== 0) return orderDiff;
    const valueDiff = (Number(a && a.valueScore) || 0) - (Number(b && b.valueScore) || 0);
    if (valueDiff !== 0) return valueDiff;
    return String(a && a.title || '').localeCompare(String(b && b.title || ''));
  }

  function sortProgressionCards(cards) {
    return (Array.isArray(cards) ? cards : []).slice().sort(compareProgressionCards);
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
    score += Math.min(35, Math.max(0, Number(card.goal) || 0));
    if (!card.completed) {
      if (card.tier === 'beginner') score += 16;
      else if (card.tier === 'intermediate') score += 9;
      else if (card.tier === 'advanced') score += 4;
      else if (card.tier === 'seasonal-mastery' && isSeasonRelevantCard(card, stats)) score += 12;
    }
    return score;
  }

  const OVERVIEW_REASON_META = {
    almostComplete: { key: 'almost-complete', label: 'Almost there', icon: '🎯' },
    highProgress: { key: 'high-progress', label: 'Strong progress', icon: '⚡' },
    seasonFocus: { key: 'season-focus', label: 'Season focus', icon: '🍃' },
    highReward: { key: 'high-reward', label: 'Big milestone', icon: '🏆' },
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
    if (Number(card.goal) >= 20) return OVERVIEW_REASON_META.highReward;
    return OVERVIEW_REASON_META.recommended;
  }

  function getPrioritizedOverviewCards(cards, stats, limit) {
    return (cards || [])
      .slice()
      .sort((a, b) => {
        const scoreDiff = getOverviewPriorityScore(b, stats) - getOverviewPriorityScore(a, stats);
        if (scoreDiff !== 0) return scoreDiff;
        return compareProgressionCards(a, b);
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

  function renderProgressionChipRow(item, options = {}) {
    if (!item) return '';
    const chips = [];
    if (options.showTier !== false && item.tierLabel) {
      const tierClass = item.tierClassName ? ` ${escapeHtml(item.tierClassName)}` : '';
      chips.push(`<span class="nature-progression-chip${tierClass}">${escapeHtml(item.tierLabel)}</span>`);
    }
    // XP chips intentionally removed to keep progression copy simple.
    if (options.showRarity && item.rarity) {
      chips.push(`<span class="nature-progression-chip nature-progression-chip--rarity">${escapeHtml(String(item.rarity))}</span>`);
    }
    if (options.showTimeHorizon !== false) {
      const horizon = getTimeHorizonLabel(item);
      chips.push(`<span class="nature-progression-chip nature-progression-chip--time">${escapeHtml(horizon)}</span>`);
    }
    if (!chips.length) return '';
    return `<div class="nature-progression-chip-row">${chips.join('')}</div>`;
  }

  function formatTierBreakdown(items) {
    const counts = { beginner: 0, intermediate: 0, advanced: 0, 'seasonal-mastery': 0 };
    (Array.isArray(items) ? items : []).forEach((item) => {
      const key = normalizeProgressionTier(item && item.tier);
      counts[key] += 1;
    });
    return Object.keys(counts)
      .filter((key) => counts[key] > 0)
      .map((key) => `${getProgressionTierMeta(key).label}: ${counts[key]}`)
      .join(' | ');
  }

  function getCollectionTierFilter() {
    const filter = String(state.collectionTierFilter || 'all').trim();
    if (filter === 'all') return 'all';
    return Object.prototype.hasOwnProperty.call(PROGRESSION_TIER_META, filter) ? filter : 'all';
  }

  function filterCardsByTier(items, tierFilter) {
    const list = Array.isArray(items) ? items : [];
    const wanted = String(tierFilter || 'all').trim();
    if (!wanted || wanted === 'all') return list.slice();
    return list.filter((item) => normalizeProgressionTier(item && item.tier) === wanted);
  }

  function getCollectionTierPathState(items) {
    const ordered = Object.keys(PROGRESSION_TIER_META)
      .map((key) => ({ key, ...getProgressionTierMeta(key) }))
      .sort((a, b) => a.order - b.order);
    const byTier = {};
    ordered.forEach((tier, index) => {
      const tierItems = filterCardsByTier(items, tier.key);
      const total = tierItems.length;
      const completed = tierItems.filter((item) => item && item.completed).length;
      const completionPct = total ? Math.round((completed / total) * 100) : 0;
      const prior = ordered[index - 1];
      const priorState = prior ? byTier[prior.key] : null;
      const unlocked = index === 0 || !priorState || priorState.completionPct >= 60;
      byTier[tier.key] = {
        key: tier.key,
        label: tier.label,
        unlocked,
        completionPct,
        completed,
        total,
        lockHint: unlocked ? '' : `Reach 60% in ${prior.label} to unlock this lane.`
      };
    });
    return byTier;
  }

  function getCollectionOverallPathProgress(pathState) {
    const lanes = Object.keys(PROGRESSION_TIER_META)
      .map((key) => pathState && pathState[key])
      .filter(Boolean);
    const totals = lanes.reduce((acc, lane) => {
      acc.completed += Math.max(0, Number(lane.completed) || 0);
      acc.total += Math.max(0, Number(lane.total) || 0);
      return acc;
    }, { completed: 0, total: 0 });
    const pct = totals.total > 0
      ? Math.max(0, Math.min(100, Math.round((totals.completed / totals.total) * 100)))
      : 0;
    return {
      ...totals,
      pct,
      label: `${pct}% complete`,
      summary: `${totals.completed}/${totals.total} goals complete`
    };
  }

  function getCollectionTierPathProgress(pathState, tierKey) {
    const key = normalizeProgressionTier(tierKey);
    const lane = pathState && pathState[key] ? pathState[key] : null;
    const completed = lane ? Math.max(0, Number(lane.completed) || 0) : 0;
    const total = lane ? Math.max(0, Number(lane.total) || 0) : 0;
    const pct = total > 0
      ? Math.max(0, Math.min(100, Math.round((completed / total) * 100)))
      : 0;
    const tierMeta = getProgressionTierMeta(key);
    return {
      key,
      label: tierMeta.label,
      completed,
      total,
      pct,
      summary: `${completed}/${total} goals complete`
    };
  }

  function renderProgressionLearningCopy(item, options = {}) {
    if (!options.showLearning || !item || !item.learningCopy) return '';
    return `<div class="nature-progression-learning-copy"><strong>Why this matters:</strong> ${escapeHtml(item.learningCopy)}</div>`;
  }

  function getTimeHorizonLabel(item) {
    if (!item) return 'Quick';
    const metric = String(item.metric || '');
    if (metric.startsWith('today')) return 'Quick';
    if (metric.startsWith('weekly') || metric === 'streak.currentStreak') return 'This week';
    if (metric.startsWith('season') || metric.includes('Season') || metric === 'migrationSightedCount' || metric === 'inSeasonSightedCount' || metric === 'bingo.completedCount') {
      return 'Seasonal';
    }
    if (metric.startsWith('monthly') || metric.startsWith('quarterly')) return 'Seasonal';
    if (metric.startsWith('total') || metric.includes('lifetime') || metric === 'generaSightedCount' || metric === 'familiesCompleted' || metric === 'loggedSeasonCount') {
      return 'Long-term';
    }
    return (Number(item.goal) || 0) >= 20 ? 'Long-term' : 'Quick';
  }

  function isAlmostCompleteCard(item) {
    if (!item) return false;
    if (item.completed) return false;
    const goal = Math.max(1, Number(item.goal) || 1);
    const progress = Math.max(0, Number(item.progress) || 0);
    const remaining = Math.max(0, goal - progress);
    const pct = Math.max(0, Math.min(100, Number(item.pct) || 0));
    return remaining <= 1 || pct >= 80;
  }

  function filterAlmostCompleteCards(items) {
    const list = Array.isArray(items) ? items : [];
    if (!state.collectionAlmostCompleteOnly) return list.slice();
    return list.filter((item) => isAlmostCompleteCard(item));
  }

  function renderCollectionTierControls(items, options = {}) {
    const controls = document.getElementById('birdsCollectionControls');
    if (!controls) return;
    const list = Array.isArray(items) ? items : [];
    const hasTiers = list.some((item) => item && item.tier);
    if (!hasTiers) {
      controls.hidden = true;
      controls.innerHTML = '';
      return;
    }

    const filter = getCollectionTierFilter();
    const pathToggleAllowed = options.pathToggleAllowed !== false;
    const pathState = getCollectionTierPathState(list);
    const overall = getCollectionOverallPathProgress(pathState);
    const filtered = filter !== 'all' ? getCollectionTierPathProgress(pathState, filter) : null;
    const scopedItems = filterCardsByTier(list, filter);
    const almostCompleteCount = scopedItems.filter((item) => isAlmostCompleteCard(item)).length;
    const tierButtons = ['all'].concat(Object.keys(PROGRESSION_TIER_META)).map((key) => {
      if (key === 'all') {
        const active = filter === 'all';
        return `<button type="button" class="pill-button nature-tier-filter-btn ${active ? 'is-active' : ''}" data-birds-collection-tier="all" aria-pressed="${active ? 'true' : 'false'}">All tiers</button>`;
      }
      const tierMeta = getProgressionTierMeta(key);
      const stateInfo = pathState[key];
      const active = filter === key;
      const lockIcon = state.collectionPathMode && stateInfo && !stateInfo.unlocked ? ' 🔒' : '';
      return `<button type="button" class="pill-button nature-tier-filter-btn ${active ? 'is-active' : ''}" data-birds-collection-tier="${escapeHtml(key)}" aria-pressed="${active ? 'true' : 'false'}">${escapeHtml(tierMeta.label)}${lockIcon}</button>`;
    }).join('');

    const laneSummary = Object.keys(PROGRESSION_TIER_META)
      .map((key) => {
        const lane = pathState[key];
        if (!lane || lane.total < 1) return '';
        const lockText = state.collectionPathMode && !lane.unlocked ? ' | Locked lane' : '';
        return `<span class="nature-collection-lane-pill">${escapeHtml(lane.label)}: ${lane.completed}/${lane.total}${lockText}</span>`;
      })
      .filter(Boolean)
      .join('');

    controls.hidden = false;
    controls.innerHTML = `
      <div class="nature-collection-progress-header" role="status" aria-live="polite">
        <div class="nature-collection-progress-top">
          <strong>Path progress</strong>
          <span>${escapeHtml(overall.label)}</span>
        </div>
        ${filtered ? `
        <div class="nature-collection-progress-legend" aria-hidden="true">
          <span class="nature-collection-progress-legend-item"><span class="nature-collection-progress-swatch"></span><span class="nature-collection-progress-legend-label-full">Overall</span><span class="nature-collection-progress-legend-label-short">O</span></span>
          <span class="nature-collection-progress-legend-item"><span class="nature-collection-progress-swatch nature-collection-progress-swatch--secondary"></span><span class="nature-collection-progress-legend-label-full">Filtered</span><span class="nature-collection-progress-legend-label-short">F</span></span>
        </div>` : ''}
        <div class="nature-collection-progress-track" aria-hidden="true">
          <span class="nature-collection-progress-fill" style="width:${overall.pct}%;"></span>
        </div>
        <div class="nature-collection-progress-meta">${escapeHtml(overall.summary)}</div>
        ${filtered ? `
        <div class="nature-collection-progress-secondary">
          <div class="nature-collection-progress-top nature-collection-progress-top--secondary">
            <strong>${escapeHtml(filtered.label)} progress</strong>
            <span>${escapeHtml(String(filtered.pct))}% complete</span>
          </div>
          <div class="nature-collection-progress-track nature-collection-progress-track--secondary" aria-hidden="true">
            <span class="nature-collection-progress-fill nature-collection-progress-fill--secondary" style="width:${filtered.pct}%;"></span>
          </div>
          <div class="nature-collection-progress-meta">${escapeHtml(filtered.summary)}</div>
        </div>` : ''}
      </div>
      <div class="nature-collection-control-row">
        <div class="nature-collection-tier-filter-row">${tierButtons}</div>
        <div class="nature-collection-toggle-row">
          <button type="button" id="birdsCollectionAlmostCompleteToggleBtn" class="pill-button nature-tier-path-btn ${state.collectionAlmostCompleteOnly ? 'is-active' : ''}" aria-pressed="${state.collectionAlmostCompleteOnly ? 'true' : 'false'}">${state.collectionAlmostCompleteOnly ? 'Almost complete: On' : 'Almost complete: Off'} (${almostCompleteCount})</button>
          ${pathToggleAllowed ? `<button type="button" id="birdsCollectionPathToggleBtn" class="pill-button nature-tier-path-btn ${state.collectionPathMode ? 'is-active' : ''}" aria-pressed="${state.collectionPathMode ? 'true' : 'false'}">${state.collectionPathMode ? 'Path mode: On' : 'Path mode: Off'}</button>` : ''}
        </div>
      </div>
      <div class="nature-collection-lane-row">${laneSummary}</div>
    `;
  }

  function cardMatchesOverviewQuickFilters(card, stats) {
    if (!card) return false;
    const filters = state.overviewQuickFilters || {};
    const noFilter = !filters.inSeason && !filters.almostThere && !filters.highReward;
    if (noFilter) return true;

    const remaining = Math.max(0, Number(card.goal) - Number(card.progress));
    if (filters.inSeason && isSeasonRelevantCard(card, stats)) return true;
    if (filters.almostThere && !card.completed && remaining <= 2) return true;
    if (filters.highReward && Number(card.valueScore) >= 160) return true;
    return false;
  }

  function applyOverviewQuickFilters(cards, stats) {
    const list = Array.isArray(cards) ? cards : [];
    return list.filter((card) => cardMatchesOverviewQuickFilters(card, stats));
  }

  function scrollToBirdOverviewSection(sectionKey) {
    const map = {
      daily: 'birdsOverviewSectionDaily',
      challenges: 'birdsOverviewSectionChallengesBadges',
      badges: 'birdsOverviewSectionChallengesBadges',
      'challenges-badges': 'birdsOverviewSectionChallengesBadges',
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

  function ensureNatureSubtabJumpLinks(root) {
    if (!root) return;
    const jumpDefs = [
      { key: 'categories', label: '📊 Category Progression' },
      { key: 'families', label: '🏷️ Sightings by Family' },
      { key: 'challenges', label: '🏅 Challenges & Badges' }
    ];

    SUBTAB_KEYS.filter((subtabKey) => subtabKey !== 'birds').forEach((subtabKey) => {
      const pane = root.querySelector(`#natureChallengePane-${subtabKey}`);
      if (!pane) return;

      const sectionCards = pane.querySelectorAll(':scope > .card');
      const first = sectionCards[0];
      const second = sectionCards[1];
      const third = sectionCards[2];
      if (first) first.dataset.natureSection = 'categories';
      if (second) second.dataset.natureSection = 'families';
      if (third) third.dataset.natureSection = 'challenges';

      if (pane.querySelector(`[data-nature-jump-links="${subtabKey}"]`)) return;

      const jumpRow = document.createElement('div');
      jumpRow.className = 'nature-jump-links';
      jumpRow.setAttribute('data-nature-jump-links', subtabKey);
      jumpRow.setAttribute('role', 'navigation');
      jumpRow.setAttribute('aria-label', `Jump to section links for ${subtabKey}`);
      jumpRow.innerHTML = `<span class="nature-jump-links-label">Jump to section:</span>${jumpDefs
        .map((item) => `<button type="button" class="pill-button" data-nature-overview-jump="${item.key}" data-nature-overview-subtab="${subtabKey}">${item.label}</button>`)
        .join('')}`;

      const firstCard = pane.querySelector(':scope > .card');
      if (firstCard) {
        pane.insertBefore(jumpRow, firstCard);
      } else {
        pane.appendChild(jumpRow);
      }
    });
  }

  function scrollToNatureOverviewSection(subtabKey, sectionKey) {
    const pane = document.getElementById(`natureChallengePane-${subtabKey}`);
    if (!pane) return false;
    const target = pane.querySelector(`[data-nature-section="${sectionKey}"]`);
    if (!target) return false;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const header = target.querySelector('.card-header');
    if (header) {
      header.setAttribute('tabindex', '-1');
      window.setTimeout(() => {
        try { header.focus({ preventScroll: true }); } catch (_) { header.focus(); }
      }, 160);
    }
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
    if (normalized.includes('go challenges') || normalized.includes('go badges') || normalized.includes('go achievements') || normalized === 'challenges' || normalized === 'badges' || normalized === 'achievements') {
      setBirdView(root, 'overview');
      scrollToBirdOverviewSection('challenges-badges');
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
      if (key === '1') scrollToBirdOverviewSection('challenges-badges');
      if (key === '2') scrollToBirdOverviewSection('quests');
      if (key === '3') scrollToBirdOverviewSection('bingo');
    }
  }

  function updateBirdMoreButtons(counts) {
    const sections = ['challenges-badges', 'quests', 'bingo'];
    const badgeMap = {
      'challenges-badges': 'birdsChallengesBadgesCountBadge',
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

  function parseNatureDataFromExcelRows(columns, rows, aliases) {
    const aliasConfig = aliases || {};
    const speciesAliases = Array.isArray(aliasConfig.species) && aliasConfig.species.length
      ? aliasConfig.species
      : ['Species (English)', 'Common Name', 'Species', 'Bird Species'];
    const familyAliases = Array.isArray(aliasConfig.family) && aliasConfig.family.length
      ? aliasConfig.family
      : ['Family (English)', 'Family'];
    const genusAliases = Array.isArray(aliasConfig.genus) && aliasConfig.genus.length
      ? aliasConfig.genus
      : ['Genus (English)', 'Genus'];
    const seasonsAliases = Array.isArray(aliasConfig.seasons) && aliasConfig.seasons.length
      ? aliasConfig.seasons
      : ['Seasons Found', 'Season', 'Seasons'];
    const rarityAliases = Array.isArray(aliasConfig.rarity) && aliasConfig.rarity.length
      ? aliasConfig.rarity
      : ['Rare or Common', 'Rarity', 'Commonality', 'Regional Abundance'];

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

      const family = pickField(details, familyAliases);
      const genus = pickField(details, genusAliases);
      const species = pickField(details, speciesAliases);
      const seasons = pickField(details, seasonsAliases);
      const rarity = pickField(details, rarityAliases);

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

  function getSubTabConfig(key) {
    return NATURE_SUBTAB_CONFIG[String(key || '').trim()] || null;
  }

  function isConfigDrivenSubTab(key) {
    return Boolean(getSubTabConfig(key));
  }

  function getSubTabStorageKey(key, suffix) {
    return `natureChallenge-${String(key || '').trim()}-${String(suffix || '').trim()}-v1`;
  }

  function loadSubTabStorageValue(key, fallbackValue) {
    try {
      return safeJsonParse(localStorage.getItem(key), fallbackValue);
    } catch (_error) {
      return fallbackValue;
    }
  }

  function saveSubTabStorageValue(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (_error) {
      // Ignore storage availability limits for optional category state.
    }
  }

  function loadSubTabSightings(key) {
    return loadSubTabStorageValue(getSubTabStorageKey(key, 'sightings'), {}) || {};
  }

  function saveSubTabSightings(key, sightings) {
    saveSubTabStorageValue(getSubTabStorageKey(key, 'sightings'), sightings || {});
  }

  function loadSubTabFavorites(key) {
    const list = loadSubTabStorageValue(getSubTabStorageKey(key, 'favorites'), []);
    return Array.isArray(list) ? list.filter(Boolean).map((v) => String(v)) : [];
  }

  function saveSubTabFavorites(key, favorites) {
    const list = Array.isArray(favorites) ? favorites.filter(Boolean).map((v) => String(v)) : [];
    saveSubTabStorageValue(getSubTabStorageKey(key, 'favorites'), list);
  }

  function resolveSubTabSightingsFromRows(rows, dataset) {
    const lookup = new Map();
    (dataset && Array.isArray(dataset.birds) ? dataset.birds : []).forEach((species) => {
      lookup.set(norm(species.id), species.id);
      lookup.set(norm(species.canonicalId || ''), species.id);
      lookup.set(norm(species.speciesName || ''), species.id);
    });

    const result = {};
    (rows || []).forEach((row) => {
      const values = Array.isArray(row.values) && Array.isArray(row.values[0]) ? row.values[0] : [];
      const joined = values.map((v) => String(v == null ? '' : v).trim());
      const candidate = joined.find((value) => lookup.has(norm(value)));
      if (!candidate) return;
      const id = lookup.get(norm(candidate));
      result[id] = { sightedAt: toIsoNow(), source: 'sync' };
    });
    return result;
  }

  function resolveSubTabFavoritesFromRows(rows, dataset) {
    const lookup = new Map();
    (dataset && Array.isArray(dataset.birds) ? dataset.birds : []).forEach((species) => {
      lookup.set(norm(species.id), species.id);
      lookup.set(norm(species.canonicalId || ''), species.id);
      lookup.set(norm(species.speciesName || ''), species.id);
    });

    const favorites = new Set();
    (rows || []).forEach((row) => {
      const values = Array.isArray(row.values) && Array.isArray(row.values[0]) ? row.values[0] : [];
      const joined = values.map((v) => String(v == null ? '' : v).trim());
      const favoriteFlag = joined.some((value) => ['1', 'true', 'yes'].includes(norm(value)));
      if (!favoriteFlag) return;
      const candidate = joined.find((value) => lookup.has(norm(value)));
      if (!candidate) return;
      favorites.add(lookup.get(norm(candidate)));
    });
    return Array.from(favorites);
  }

  async function hydrateSubTabRemoteState(subTabKey, dataset, workbookPath) {
    const cfg = getSubTabConfig(subTabKey);
    if (!cfg || !workbookPath || !window.accessToken) {
      return {
        sightings: loadSubTabSightings(subTabKey),
        favorites: loadSubTabFavorites(subTabKey)
      };
    }

    let sightings = loadSubTabSightings(subTabKey);
    let favorites = loadSubTabFavorites(subTabKey);

    try {
      const sightingsPayload = await fetchTableColumnsAndRows(workbookPath, cfg.sightingsTableName, 5000);
      sightings = resolveSubTabSightingsFromRows(sightingsPayload.rows || [], dataset);
      saveSubTabSightings(subTabKey, sightings);
    } catch (_error) {
      // Keep local sightings if remote table is unavailable.
    }

    try {
      const userStatePayload = await fetchTableColumnsAndRows(workbookPath, cfg.userStateTableName, 5000);
      favorites = resolveSubTabFavoritesFromRows(userStatePayload.rows || [], dataset);
      saveSubTabFavorites(subTabKey, favorites);
    } catch (_error) {
      // Keep local favorites if remote table is unavailable.
    }

    return { sightings, favorites };
  }

  async function loadConfiguredSubTabDataset(subTabKey, forceRefresh) {
    const cfg = getSubTabConfig(subTabKey);
    const subState = state.subTabData[subTabKey];
    if (!cfg || !subState) return;
    if (subState.loading) return;
    if (subState.loaded && !forceRefresh) return;

    subState.loading = true;
    subState.error = '';
    subState.sightings = loadSubTabSightings(subTabKey);
    subState.favorites = loadSubTabFavorites(subTabKey);
    subState.sightingLog = loadSubTabSightingLog(subTabKey);
    subState.diagnostics = {
      authState: window.accessToken ? 'signed in' : 'sign-in required',
      workbookPath: subState.workbookPath || '',
      speciesProbe: window.accessToken ? `probing ${cfg.speciesTableName}...` : 'sign-in required',
      syncProbe: window.accessToken ? `probing ${cfg.sightingsTableName} / ${cfg.userStateTableName}...` : 'sign-in required'
    };
    renderConfiguredSubTabDiagnostics(subTabKey);
    const liveRoot = document.getElementById('natureChallengeRoot');
    if (liveRoot) syncNatureSubTabs(liveRoot);

    const tableName = cfg.speciesTableName;
    const fileCandidates = prioritizeWorkbookCandidates((cfg.speciesFileCandidates || []).concat(EXCEL_FILE_CANDIDATES));
    const errors = [];

    try {
      if (!window.accessToken) {
        throw new Error('Excel source unavailable: sign in to load this category.');
      }

      let loaded = false;
      for (let i = 0; i < fileCandidates.length; i += 1) {
        const filePath = fileCandidates[i];
        const encodedPath = encodeGraphPath(filePath);
        const baseUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/workbook/tables/${encodeURIComponent(tableName)}`;

        try {
          const columnsPayload = await fetchGraphJson(`${baseUrl}/columns?$select=name,index`, { retries: 0 });
          const rowsPayload = await fetchGraphJson(`${baseUrl}/rows?$top=5000`, { retries: 0 });
          const dataset = parseNatureDataFromExcelRows(
            columnsPayload.value || [],
            rowsPayload.value || [],
            cfg.aliases
          );

          const syncWorkbookPath = await findWorkbookPathWithTables(
            [cfg.sightingsTableName, cfg.userStateTableName],
            prioritizeWorkbookCandidates((cfg.syncFileCandidates || []).concat(EXCEL_SYNC_FILE_CANDIDATES))
          );
          const remoteState = await hydrateSubTabRemoteState(subTabKey, dataset, syncWorkbookPath);

          subState.birds = dataset.birds;
          subState.families = dataset.families;
          subState.sightings = remoteState.sightings;
          subState.favorites = remoteState.favorites;
          subState.sightingLog = loadSubTabSightingLog(subTabKey);
          subState.source = `Excel table '${tableName}' in ${filePath}`;
          subState.workbookPath = filePath;
          subState.loaded = true;
          subState.diagnostics = {
            authState: 'signed in',
            workbookPath: filePath,
            speciesProbe: `ready (${cfg.speciesTableName})`,
            syncProbe: syncWorkbookPath
              ? `ready (${cfg.sightingsTableName} / ${cfg.userStateTableName})`
              : `not found (${cfg.sightingsTableName} / ${cfg.userStateTableName})`
          };
          loaded = true;
          break;
        } catch (error) {
          errors.push(`${filePath}: ${error && error.message ? error.message : 'table read failed'}`);
        }
      }

      if (!loaded) {
        throw new Error(errors.join(' | ') || `Unable to load ${cfg.label} species data.`);
      }
    } catch (error) {
      subState.loaded = false;
      const rawError = String(error && error.message ? error.message : error || 'Unable to load category data.');
      if (!window.accessToken) {
        subState.error = `${cfg.label} data requires sign-in. Use Sign In, then refresh this tab.`;
        subState.diagnostics = {
          authState: 'sign-in required',
          workbookPath: '',
          speciesProbe: 'blocked until sign-in',
          syncProbe: 'blocked until sign-in'
        };
      } else {
        subState.error = `${cfg.label} data load failed (${cfg.speciesTableName}). ${rawError}`;
        subState.diagnostics = {
          authState: 'signed in',
          workbookPath: subState.workbookPath || '',
          speciesProbe: `failed (${cfg.speciesTableName})`,
          syncProbe: `check ${cfg.sightingsTableName} / ${cfg.userStateTableName}`
        };
      }
      subState.birds = [];
      subState.families = [];
      subState.sightings = loadSubTabSightings(subTabKey);
      subState.favorites = loadSubTabFavorites(subTabKey);
      subState.sightingLog = loadSubTabSightingLog(subTabKey);
    } finally {
      subState.loading = false;
      renderConfiguredSubTabDiagnostics(subTabKey);
      const liveRoot = document.getElementById('natureChallengeRoot');
      if (liveRoot) syncNatureSubTabs(liveRoot);
    }
  }

  function renderConfiguredSubTab(subTabKey) {
    const cfg = getSubTabConfig(subTabKey);
    const subState = state.subTabData[subTabKey];
    if (!cfg || !subState) return;

    const totalSpeciesEl = document.getElementById(`${subTabKey}TotalSpecies`);
    const totalSightedEl = document.getElementById(`${subTabKey}TotalSighted`);
    const familyGrid = document.getElementById(`${subTabKey}FamilyGrid`);
    const challengeBadgeGrid = document.getElementById(`${subTabKey}ChallengeBadgeGrid`);

    const totalSpecies = Array.isArray(subState.birds) ? subState.birds.length : 0;
    const sightedKeys = new Set(Object.keys(subState.sightings || {}));
    const totalSighted = Array.isArray(subState.birds)
      ? subState.birds.filter((species) => sightedKeys.has(species.id) || sightedKeys.has(species.canonicalId || '')).length
      : 0;

    if (totalSpeciesEl) totalSpeciesEl.textContent = String(totalSpecies);
    if (totalSightedEl) totalSightedEl.textContent = String(totalSighted);

    if (familyGrid) {
      if (subState.loading) {
        familyGrid.innerHTML = `<div class="nature-empty-state">Loading ${escapeHtml(cfg.label)} data...</div>`;
      } else if (subState.error) {
        familyGrid.innerHTML = `<div class="nature-empty-state">${escapeHtml(subState.error)}</div>`;
      } else if (!subState.families.length) {
        familyGrid.innerHTML = `<div class="nature-empty-state">No ${escapeHtml(cfg.label.toLowerCase())} species found yet.</div>`;
      } else {
        familyGrid.innerHTML = subState.families.slice(0, 12).map((family) => {
          const familySighted = family.species.filter((species) => sightedKeys.has(species.id) || sightedKeys.has(species.canonicalId || '')).length;
          return `<div class="nature-family-card"><div class="nature-family-name">${escapeHtml(family.label)}</div><div class="nature-family-progress">${familySighted}/${family.species.length} sighted</div></div>`;
        }).join('');
      }
    }

    const progressPct = totalSpecies > 0 ? Math.round((totalSighted / totalSpecies) * 100) : 0;
    if (challengeBadgeGrid) {
      const favoriteCount = (subState.favorites || []).length;
      challengeBadgeGrid.innerHTML = `
        <div class="nature-badge-card ${totalSighted >= 1 ? 'unlocked' : 'locked'} nature-badge-card--challenge">
          <div class="nature-badge-kind-pill nature-badge-kind-pill--challenge">Challenge</div>
          <div class="nature-badge-icon">🎯</div>
          <div class="nature-badge-card-title">First ${escapeHtml(cfg.label.slice(0, -1) || cfg.label)} Logged</div>
          <div class="nature-badge-card-description">Log your first ${escapeHtml(cfg.label.toLowerCase())} sighting.</div>
          <div class="nature-badge-progress">${Math.min(totalSighted, 1)}/1 complete</div>
          <div class="nature-progress-track"><div class="nature-progress-fill" style="width:${Math.min(100, totalSighted >= 1 ? 100 : totalSighted * 100)}%;"></div></div>
        </div>
        <div class="nature-badge-card ${progressPct >= 25 ? 'unlocked' : 'locked'} nature-badge-card--challenge">
          <div class="nature-badge-kind-pill nature-badge-kind-pill--challenge">Challenge</div>
          <div class="nature-badge-icon">📈</div>
          <div class="nature-badge-card-title">${escapeHtml(cfg.label)} Quarter Checkpoint</div>
          <div class="nature-badge-card-description">Reach 25% completion in your ${escapeHtml(cfg.label.toLowerCase())} collection.</div>
          <div class="nature-badge-progress">${progressPct}% / 25%</div>
          <div class="nature-progress-track"><div class="nature-progress-fill" style="width:${Math.min(100, Math.round((progressPct / 25) * 100))}%;"></div></div>
        </div>
        <div class="nature-badge-card ${progressPct >= 50 ? 'unlocked' : 'locked'} nature-badge-card--challenge">
          <div class="nature-badge-kind-pill nature-badge-kind-pill--challenge">Challenge</div>
          <div class="nature-badge-icon">🏔️</div>
          <div class="nature-badge-card-title">${escapeHtml(cfg.label)} Midpoint</div>
          <div class="nature-badge-card-description">Reach 50% completion in your ${escapeHtml(cfg.label.toLowerCase())} collection.</div>
          <div class="nature-badge-progress">${progressPct}% / 50%</div>
          <div class="nature-progress-track"><div class="nature-progress-fill" style="width:${Math.min(100, Math.round((progressPct / 50) * 100))}%;"></div></div>
        </div>
        <div class="nature-badge-card ${totalSighted >= 5 ? 'unlocked' : 'locked'}">
          <div class="nature-badge-kind-pill nature-badge-kind-pill--badge">Badge</div>
          <div class="nature-badge-icon">🏅</div>
          <div class="nature-badge-card-title">Starter Observer</div>
          <div class="nature-badge-card-description">Log 5 ${escapeHtml(cfg.label.toLowerCase())} species.</div>
          <div class="nature-badge-progress">${Math.min(totalSighted, 5)}/5 progress</div>
          <div class="nature-progress-track"><div class="nature-progress-fill" style="width:${Math.min(100, Math.round((Math.min(totalSighted, 5) / 5) * 100))}%;"></div></div>
        </div>
        <div class="nature-badge-card ${totalSighted >= 15 ? 'unlocked' : 'locked'}">
          <div class="nature-badge-kind-pill nature-badge-kind-pill--badge">Badge</div>
          <div class="nature-badge-icon">🧭</div>
          <div class="nature-badge-card-title">Field Tracker</div>
          <div class="nature-badge-card-description">Log 15 ${escapeHtml(cfg.label.toLowerCase())} species.</div>
          <div class="nature-badge-progress">${Math.min(totalSighted, 15)}/15 progress</div>
          <div class="nature-progress-track"><div class="nature-progress-fill" style="width:${Math.min(100, Math.round((Math.min(totalSighted, 15) / 15) * 100))}%;"></div></div>
        </div>
        <div class="nature-badge-card ${favoriteCount >= 5 ? 'unlocked' : 'locked'}">
          <div class="nature-badge-kind-pill nature-badge-kind-pill--badge">Badge</div>
          <div class="nature-badge-icon">⭐</div>
          <div class="nature-badge-card-title">Favorites Curator</div>
          <div class="nature-badge-card-description">Mark 5 favorite ${escapeHtml(cfg.label.toLowerCase())}.</div>
          <div class="nature-badge-progress">${Math.min(favoriteCount, 5)}/5 progress</div>
          <div class="nature-progress-track"><div class="nature-progress-fill" style="width:${Math.min(100, Math.round((Math.min(favoriteCount, 5) / 5) * 100))}%;"></div></div>
        </div>
      `;
    }

    renderConfiguredSubTabDiagnostics(subTabKey);
  }

  function renderConfiguredSubTabDiagnostics(subTabKey) {
    const cfg = getSubTabConfig(subTabKey);
    const subState = state.subTabData[subTabKey];
    const row = document.getElementById(`${subTabKey}DiagnosticsRow`);
    if (!cfg || !subState || !row) return;

    const diagnostics = subState.diagnostics || {};
    const categoryLabel = cfg.label || getActiveCategoryLabel();
    const authText = diagnostics.authState || (window.accessToken ? 'signed in' : 'sign-in required');
    const workbookText = diagnostics.workbookPath || 'not selected';
    const speciesText = diagnostics.speciesProbe || 'waiting';
    const syncText = diagnostics.syncProbe || 'waiting';

    const authClass = /signed in|authenticated/i.test(authText) ? 'ok' : 'warn';
    const speciesClass = /ready|loaded|found|ok/i.test(speciesText) ? 'ok' : /failed|missing|sign-in/i.test(speciesText) ? 'warn' : '';
    const syncClass = /ready|found|ok/i.test(syncText) ? 'ok' : /failed|missing|sign-in/i.test(syncText) ? 'warn' : '';

    row.innerHTML = `
      <span class="nature-subtab-diagnostics-pill ${authClass}"><strong>Auth</strong> ${escapeHtml(authText)}</span>
      <span class="nature-subtab-diagnostics-pill"><strong>Workbook</strong> ${escapeHtml(workbookText)}</span>
      <span class="nature-subtab-diagnostics-pill ${speciesClass}"><strong>${escapeHtml(categoryLabel)} Species</strong> ${escapeHtml(speciesText)}</span>
      <span class="nature-subtab-diagnostics-pill ${syncClass}"><strong>${escapeHtml(categoryLabel)} Sightings/User State</strong> ${escapeHtml(syncText)}</span>
    `;
  }

  function renderBirdSubtabDiagnostics() {
    const row = document.getElementById('birdsDiagnosticsRow');
    if (!row) return;
    const categoryLabel = getActiveCategoryLabel();

    const signedIn = Boolean(window.accessToken && getBirdSyncUserId());
    const authText = signedIn ? 'signed in' : 'local only';
    const authClass = signedIn ? 'ok' : 'warn';

    const workbookParts = [];
    if (state.birdDataWorkbookPath) workbookParts.push(`data: ${state.birdDataWorkbookPath}`);
    if (state.birdSyncWorkbookPath) workbookParts.push(`sync: ${state.birdSyncWorkbookPath}`);
    const workbookText = workbookParts.length ? workbookParts.join(' | ') : 'not resolved';

    let speciesText = 'waiting';
    let speciesClass = '';
    if (state.birdsLoading) {
      speciesText = 'loading dataset';
    } else if (state.birdsLoaded && state.birdsError) {
      speciesText = 'fallback in use';
      speciesClass = 'warn';
    } else if (state.birdsLoaded) {
      speciesText = `ready (${state.birds.length} species)`;
      speciesClass = 'ok';
    } else if (state.birdsError) {
      speciesText = 'unavailable';
      speciesClass = 'warn';
    }

    let syncText = 'waiting';
    let syncClass = '';
    const pending = Array.isArray(state.syncQueue) ? state.syncQueue.length : 0;
    if (!signedIn) {
      syncText = 'local only';
      syncClass = 'warn';
    } else if (state.syncLastError) {
      syncText = `issue (${state.syncLastErrorCode || 'sync'})`;
      syncClass = 'warn';
    } else if (state.birdSyncWorkbookPath) {
      syncText = pending > 0 ? `ready (${pending} queued)` : 'ready';
      syncClass = 'ok';
    }

    row.innerHTML = `
      <span class="nature-subtab-diagnostics-pill ${authClass}"><strong>Auth</strong> ${escapeHtml(authText)}</span>
      <span class="nature-subtab-diagnostics-pill"><strong>Workbook</strong> ${escapeHtml(workbookText)}</span>
      <span class="nature-subtab-diagnostics-pill ${speciesClass}"><strong>${escapeHtml(categoryLabel)} Species</strong> ${escapeHtml(speciesText)}</span>
      <span class="nature-subtab-diagnostics-pill ${syncClass}"><strong>${escapeHtml(categoryLabel)} Sightings/User State</strong> ${escapeHtml(syncText)}</span>
    `;
  }

  function prioritizeWorkbookCandidates(candidates) {
    const unique = Array.from(new Set((candidates || []).map((item) => String(item || '').trim()).filter(Boolean)));
    const preferred = [];
    const fallback = [];
    unique.forEach((path) => {
      if (/^Copilot_Apps\/Kyles_Adventure_Finder\//i.test(path)) preferred.push(path);
      else fallback.push(path);
    });
    return preferred.concat(fallback);
  }

  function getBirdFileCandidates() {
    const configured = window.natureBirdTableConfig && window.natureBirdTableConfig.filePath
      ? [String(window.natureBirdTableConfig.filePath)]
      : [];

    return prioritizeWorkbookCandidates(configured.concat(EXCEL_FILE_CANDIDATES));
  }

  function getBirdSyncFileCandidates() {
    const configured = window.natureBirdSyncConfig && window.natureBirdSyncConfig.filePath
      ? [String(window.natureBirdSyncConfig.filePath)]
      : [];
    const remembered = state && state.birdSyncWorkbookPath ? [String(state.birdSyncWorkbookPath)] : [];
    const dataWorkbookFallback = state && state.birdDataWorkbookPath ? [String(state.birdDataWorkbookPath)] : [];
    return prioritizeWorkbookCandidates(configured.concat(remembered, EXCEL_SYNC_FILE_CANDIDATES, dataWorkbookFallback));
  }

  function parseGraphStatusFromError(error) {
    const message = String(error && error.message ? error.message : error || '');
    const match = message.match(/\((\d{3})\)/);
    return match ? Number(match[1]) : null;
  }

  function classifyBirdSyncError(error) {
    const message = String(error && error.message ? error.message : error || '').toLowerCase();
    const status = parseGraphStatusFromError(error);
    if (status === 401 || status === 403) return 'AUTH';
    if (status === 404) return 'NOT_FOUND';
    if (status === 409) return 'CONFLICT';
    if (status === 429) return 'RATE_LIMIT';
    if (status && status >= 500) return 'SERVER';
    if (message.includes('network') || message.includes('failed to fetch') || message.includes('timeout')) return 'NETWORK';
    if (message.includes('schema') || message.includes('column') || message.includes('table')) return 'SCHEMA';
    return 'UNKNOWN';
  }

  async function probeWorkbookCandidates(candidatePaths, tableNames) {
    const candidates = Array.isArray(candidatePaths) ? candidatePaths.filter(Boolean).map((v) => String(v).trim()).filter(Boolean) : [];
    const tables = Array.isArray(tableNames) ? tableNames.filter(Boolean).map((v) => String(v).trim()) : [];
    const attempts = [];
    let winningWorkbookPath = '';

    for (let i = 0; i < candidates.length; i += 1) {
      const filePath = candidates[i];
      const tableChecks = [];
      for (let j = 0; j < tables.length; j += 1) {
        const tableName = tables[j];
        try {
          const payload = await fetchTableColumnsAndRows(filePath, tableName, 1);
          tableChecks.push({
            tableName,
            ok: true,
            status: 200,
            columnCount: Array.isArray(payload.columns) ? payload.columns.length : 0,
            rowSampleCount: Array.isArray(payload.rows) ? payload.rows.length : 0,
            error: ''
          });
        } catch (error) {
          tableChecks.push({
            tableName,
            ok: false,
            status: parseGraphStatusFromError(error),
            columnCount: 0,
            rowSampleCount: 0,
            error: String(error && error.message ? error.message : error || 'Unknown probe error')
          });
        }
      }

      const failingTableNames = tableChecks.filter((row) => !row.ok).map((row) => row.tableName);
      const ok = failingTableNames.length === 0;
      if (ok && !winningWorkbookPath) winningWorkbookPath = filePath;
      attempts.push({ filePath, ok, failingTableNames, tableChecks });
    }

    return { candidateList: candidates, winningWorkbookPath, attempts };
  }

  async function runBirdWorkbookDiagnostics() {
    const diagnostics = {
      generatedAt: toIsoNow(),
      signedIn: Boolean(window.accessToken),
      userId: getBirdSyncUserId(),
      configured: {
        natureBirdTableConfig: window.natureBirdTableConfig || null,
        natureBirdSyncConfig: window.natureBirdSyncConfig || null
      },
      statePaths: {
        birdDataWorkbookPath: String(state.birdDataWorkbookPath || ''),
        birdSyncWorkbookPath: String(state.birdSyncWorkbookPath || '')
      },
      data: {
        tableName: window.natureBirdTableConfig?.tableName || EXCEL_TABLE_NAME,
        candidateProbe: null
      },
      sync: {
        tableNames: [BIRD_SIGHTINGS_TABLE_NAME, BIRD_USER_STATE_TABLE_NAME],
        candidateProbe: null
      }
    };

    diagnostics.data.candidateProbe = await probeWorkbookCandidates(
      getBirdFileCandidates(),
      [diagnostics.data.tableName]
    );
    diagnostics.sync.candidateProbe = await probeWorkbookCandidates(
      getBirdSyncFileCandidates(),
      diagnostics.sync.tableNames
    );

    window.__birdsWorkbookDiagnosticsLast = diagnostics;

    console.groupCollapsed('🧪 Birds workbook diagnostics');
    console.log('Summary:', {
      generatedAt: diagnostics.generatedAt,
      signedIn: diagnostics.signedIn,
      userId: diagnostics.userId,
      dataWinningWorkbookPath: diagnostics.data.candidateProbe.winningWorkbookPath || '(none)',
      syncWinningWorkbookPath: diagnostics.sync.candidateProbe.winningWorkbookPath || '(none)'
    });
    console.log('Data candidate list:', diagnostics.data.candidateProbe.candidateList);
    console.log('Sync candidate list:', diagnostics.sync.candidateProbe.candidateList);
    console.table(diagnostics.data.candidateProbe.attempts.map((row) => ({
      filePath: row.filePath,
      ok: row.ok,
      failingTableNames: row.failingTableNames.join(', ') || '(none)'
    })));
    console.table(diagnostics.sync.candidateProbe.attempts.map((row) => ({
      filePath: row.filePath,
      ok: row.ok,
      failingTableNames: row.failingTableNames.join(', ') || '(none)'
    })));
    console.log('Full diagnostics object:', diagnostics);
    console.groupEnd();

    return diagnostics;
  }

  async function runNatureWorkbookDiagnostics(subTabKey) {
    const key = String(subTabKey || state.activeSubTab || 'birds').trim().toLowerCase();
    const cfg = getSubTabConfig(key);
    if (!cfg) {
      const payload = {
        ok: false,
        subTabKey: key,
        reason: 'Unsupported or non-config-driven subtab.'
      };
      console.warn('🧪 Nature workbook diagnostics:', payload);
      return payload;
    }

    const diagnostics = {
      generatedAt: toIsoNow(),
      subTabKey: key,
      label: cfg.label,
      signedIn: Boolean(window.accessToken),
      speciesTableName: cfg.speciesTableName,
      syncTableNames: [cfg.sightingsTableName, cfg.userStateTableName],
      speciesProbe: null,
      syncProbe: null
    };

    diagnostics.speciesProbe = await probeWorkbookCandidates(EXCEL_FILE_CANDIDATES, [cfg.speciesTableName]);
    diagnostics.syncProbe = await probeWorkbookCandidates(EXCEL_SYNC_FILE_CANDIDATES, [cfg.sightingsTableName, cfg.userStateTableName]);

    window.__natureWorkbookDiagnosticsLast = diagnostics;
    console.groupCollapsed(`🧪 Nature workbook diagnostics (${cfg.label})`);
    console.log('Summary:', {
      signedIn: diagnostics.signedIn,
      speciesWorkbook: diagnostics.speciesProbe && diagnostics.speciesProbe.winningWorkbookPath ? diagnostics.speciesProbe.winningWorkbookPath : '(none)',
      syncWorkbook: diagnostics.syncProbe && diagnostics.syncProbe.winningWorkbookPath ? diagnostics.syncProbe.winningWorkbookPath : '(none)'
    });
    console.log('Diagnostics:', diagnostics);
    console.groupEnd();

    return diagnostics;
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
        const columnsPayload = await fetchGraphJson(`${baseUrl}/columns?$select=name,index`, { retries: 0 });
        const rowsPayload = await fetchGraphJson(`${baseUrl}/rows?$top=5000`, { retries: 0 });

        const dataset = parseBirdDataFromExcelRows(columnsPayload.value || [], rowsPayload.value || []);
        return {
          dataset,
          source: `Excel table '${tableName}' in ${filePath}`,
          filePath
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
    state.birdDataWorkbookPath = String(datasetResult.filePath || state.birdDataWorkbookPath || '').trim();
    state.lastLoadedAt = new Date().toISOString();
    saveBirdCache(datasetResult.dataset, datasetResult.source);
  }

  async function resolveBirdSyncWorkbookPath() {
    const remembered = String(state.birdSyncWorkbookPath || '').trim();
    if (remembered) {
      try {
        await fetchTableColumnsAndRows(remembered, BIRD_SIGHTINGS_TABLE_NAME, 1);
        await fetchTableColumnsAndRows(remembered, BIRD_USER_STATE_TABLE_NAME, 1);
        return remembered;
      } catch (_error) {
        state.birdSyncWorkbookPath = '';
      }
    }

    const workbookPath = await findWorkbookPathWithTables(
      [BIRD_SIGHTINGS_TABLE_NAME, BIRD_USER_STATE_TABLE_NAME],
      getBirdSyncFileCandidates()
    );
    if (workbookPath) state.birdSyncWorkbookPath = workbookPath;
    return workbookPath;
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
    const timestamp = toIsoNow();
    const bird = findBirdById(birdId);
    enqueueSyncAction('favorite-toggle', {
      stateId: `fav-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      birdId,
      speciesStatusKey: bird ? getBirdStatusKey(bird) : '',
      canonicalId: bird ? (bird.canonicalId || bird.id) : '',
      favorited: !has,
      updatedAt: timestamp
    });
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
    const queuedItem = {
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      payload,
      queuedAt: toIsoNow(),
      attempts: 0
    };
    state.syncQueue.push(queuedItem);
    saveSyncQueue();

    if (window.OfflinePwa && typeof window.OfflinePwa.enqueueWrite === 'function') {
      window.OfflinePwa.enqueueWrite('bird-sync-action', {
        type,
        payload
      }, {
        source: 'birds',
        sourceQueueId: queuedItem.id
      }).catch(() => {
        // Keep local queue authoritative even if IndexedDB mirror fails.
      });
    }
  }

  function isValidLatLng(lat, lng) {
    if (lat === '' || lng === '') return false;
    const latNum = Number(lat);
    const lngNum = Number(lng);
    return !Number.isNaN(latNum) && !Number.isNaN(lngNum) && latNum >= -90 && latNum <= 90 && lngNum >= -180 && lngNum <= 180;
  }

  function readAttachmentFile(inputId) {
    const input = document.getElementById(inputId);
    if (!input || !input.files || !input.files[0]) return null;
    return input.files[0];
  }

  function readAttachmentName(inputId) {
    const file = readAttachmentFile(inputId);
    return file && file.name ? file.name : '';
  }

  function sanitizeEvidenceFileName(fileName) {
    return String(fileName || '')
      .replace(/[\\/:*?"<>|]/g, '-')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getEvidenceUploadRootPath() {
    const configured = window.natureBirdSyncConfig && window.natureBirdSyncConfig.mediaFolderPath
      ? String(window.natureBirdSyncConfig.mediaFolderPath)
      : EVIDENCE_UPLOAD_ROOT_DEFAULT;
    return configured.replace(/^\/+|\/+$/g, '');
  }

  function getEvidenceCategoryFolderName(subTabKey) {
    const key = String(subTabKey || state.activeSubTab || 'birds').trim().toLowerCase();
    return EVIDENCE_SUBTAB_FOLDER_MAP[key] || EVIDENCE_SUBTAB_FOLDER_MAP.birds;
  }

  async function uploadEvidenceToOneDrive(file, options = {}) {
    if (!file) return null;
    if (!window.accessToken) {
      throw new Error('Graph upload failed (401): missing access token');
    }

    const kind = String(options.kind || 'media').trim().toLowerCase();
    const categoryFolder = getEvidenceCategoryFolderName(options.subTabKey);
    const safeName = sanitizeEvidenceFileName(file.name || `${kind}-${Date.now()}`) || `${kind}-${Date.now()}`;
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${safeName}`;
    const relativePath = `${getEvidenceUploadRootPath()}/${categoryFolder}/${uniqueName}`;
    const encodedPath = encodeGraphPath(relativePath);
    const url = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/content?@microsoft.graph.conflictBehavior=rename`;

    const run = async () => {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${window.accessToken}`,
          'Content-Type': file.type || 'application/octet-stream'
        },
        body: file
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        throw new Error(`Graph upload failed (${response.status})${detail ? `: ${detail.slice(0, 200)}` : ''}`);
      }
      return response.json().catch(() => ({}));
    };

    const payload = window.ReliabilityAsync && typeof window.ReliabilityAsync.retryIdempotentWrite === 'function'
      ? await window.ReliabilityAsync.retryIdempotentWrite('Graph evidence upload', run, { retries: 1, backoffMs: 450 })
      : await run();

    return {
      id: String(payload.id || ''),
      name: String(payload.name || safeName),
      webUrl: String(payload.webUrl || ''),
      downloadUrl: String(payload['@microsoft.graph.downloadUrl'] || ''),
      path: relativePath
    };
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
    const normalized = normalizeSightingEntry(entry);
    state.sightingLog.unshift(normalized);
    state.sightingLog = state.sightingLog.slice(0, 600);
    saveSightingLog();
    addConflictIfNeeded(normalized);
    updateBirdingStatusFromLog();
    enqueueSyncAction('log-sighting', normalized);
  }

  function toBirdSightingRecord(entry, userId, deviceId) {
    const normalized = normalizeSightingEntry(entry);
    const syncedAt = toIsoNow();
    return {
      event_id: normalized.eventId,
      user_id: userId,
      device_id: deviceId,
      species_status_key: String(normalized.speciesStatusKey || ''),
      species_id: String(normalized.speciesId || ''),
      canonical_id: String(normalized.canonicalId || ''),
      date_observed: String(normalized.dateObserved || ''),
      count: Number(normalized.count || 1),
      location_name: String(normalized.locationName || ''),
      region: String(normalized.region || ''),
      habitat: String(normalized.habitat || ''),
      latitude: normalized.latitude == null ? '' : Number(normalized.latitude),
      longitude: normalized.longitude == null ? '' : Number(normalized.longitude),
      confidence: String(normalized.confidence || 'certain'),
      notes: String(normalized.notes || ''),
      photo_name: String(normalized.photoName || ''),
      audio_name: String(normalized.audioName || ''),
      photo_url: String(normalized.photoUrl || ''),
      audio_url: String(normalized.audioUrl || ''),
      is_deleted: normalized.isDeleted ? 'TRUE' : 'FALSE',
      created_at: String(normalized.createdAt || ''),
      updated_at: String(normalized.updatedAt || normalized.createdAt || ''),
      synced_at: syncedAt
    };
  }

  function toBirdUserStateRecord(payload, userId, deviceId) {
    const updatedAt = String(payload && payload.updatedAt ? payload.updatedAt : toIsoNow());
    return {
      state_id: String(payload && payload.stateId ? payload.stateId : `fav-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
      user_id: userId,
      species_status_key: String(payload && payload.speciesStatusKey ? payload.speciesStatusKey : ''),
      species_id: String(payload && payload.birdId ? payload.birdId : ''),
      canonical_id: String(payload && payload.canonicalId ? payload.canonicalId : ''),
      is_favorite: payload && payload.favorited ? 'TRUE' : 'FALSE',
      last_viewed_at: '',
      last_logged_at: updatedAt,
      total_logs: '',
      user_tags: '',
      ui_prefs_json: '',
      created_at: updatedAt,
      updated_at: updatedAt
    };
  }

  function markQueueItemSucceeded(queueItem) {
    if (!queueItem || !queueItem.type || !queueItem.payload) return;
    if (queueItem.type === 'log-sighting') {
      const eventId = String(queueItem.payload.eventId || queueItem.payload.id || '').trim();
      if (!eventId) return;
      const syncedAt = toIsoNow();
      state.sightingLog = (state.sightingLog || []).map((entry) => {
        const normalized = normalizeSightingEntry(entry);
        if (normalized.eventId !== eventId) return entry;
        return { ...normalized, synced: true, syncedAt };
      });
      saveSightingLog();
    }

    if (window.OfflinePwa && typeof window.OfflinePwa.removeQueuedWrites === 'function') {
      window.OfflinePwa.removeQueuedWrites({
        type: 'bird-sync-action',
        sourceQueueId: queueItem.id
      }).catch(() => {
        // Queue mirror cleanup is best-effort.
      });
    }
  }

  function parseBirdSightingRecord(record) {
    const eventId = String(record.event_id || '').trim();
    const speciesStatusKey = String(record.species_status_key || '').trim();
    if (!eventId || !speciesStatusKey) return null;
    const createdAt = String(record.created_at || '').trim() || toIsoNow();
    const updatedAt = String(record.updated_at || '').trim() || createdAt;
    return normalizeSightingEntry({
      id: eventId,
      eventId,
      speciesId: String(record.species_id || '').trim(),
      speciesStatusKey,
      canonicalId: String(record.canonical_id || '').trim(),
      speciesName: String(record.species_name || '').trim(),
      familyLabel: String(record.family_label || '').trim(),
      dateObserved: String(record.date_observed || '').trim() || getDateKey(createdAt),
      locationName: String(record.location_name || '').trim(),
      count: Math.max(1, Number(record.count || 1) || 1),
      region: String(record.region || '').trim(),
      habitat: String(record.habitat || '').trim(),
      latitude: record.latitude === '' || record.latitude == null ? null : Number(record.latitude),
      longitude: record.longitude === '' || record.longitude == null ? null : Number(record.longitude),
      confidence: String(record.confidence || 'certain').trim() || 'certain',
      notes: String(record.notes || '').trim(),
      photoName: String(record.photo_name || '').trim(),
      audioName: String(record.audio_name || '').trim(),
      photoUrl: String(record.photo_url || '').trim(),
      audioUrl: String(record.audio_url || '').trim(),
      isDeleted: parseBooleanFlag(record.is_deleted),
      createdAt,
      updatedAt,
      synced: true,
      syncedAt: String(record.synced_at || '').trim() || toIsoNow()
    });
  }

  function mergeSightingLogsByEventId(localEntries, remoteEntries) {
    const merged = new Map();
    const ingest = (entry, source) => {
      const normalized = normalizeSightingEntry(entry);
      const current = merged.get(normalized.eventId);
      if (!current) {
        merged.set(normalized.eventId, { ...normalized, synced: source === 'remote' || normalized.synced });
        return;
      }
      const curTs = parseSyncTimestamp(current.updatedAt || current.createdAt);
      const nextTs = parseSyncTimestamp(normalized.updatedAt || normalized.createdAt);
      if (nextTs >= curTs) {
        merged.set(normalized.eventId, {
          ...normalized,
          synced: source === 'remote' || normalized.synced
        });
      }
    };

    (Array.isArray(localEntries) ? localEntries : []).forEach((entry) => ingest(entry, 'local'));
    (Array.isArray(remoteEntries) ? remoteEntries : []).forEach((entry) => ingest(entry, 'remote'));

    return Array.from(merged.values())
      .filter((entry) => !entry.isDeleted)
      .sort((a, b) => parseSyncTimestamp(b.createdAt) - parseSyncTimestamp(a.createdAt));
  }

  function applyFavoriteStateRows(rows) {
    if (!Array.isArray(rows) || !rows.length) return;
    const latestByKey = {};
    rows.forEach((record) => {
      const key = String(record.species_status_key || record.canonical_id || record.species_id || '').trim();
      if (!key) return;
      const nextTs = parseSyncTimestamp(record.updated_at || record.created_at);
      const current = latestByKey[key];
      const currentTs = current ? parseSyncTimestamp(current.updated_at || current.created_at) : 0;
      if (!current || nextTs >= currentTs) latestByKey[key] = record;
    });

    const nextFavorites = new Set(state.favorites || []);
    Object.values(latestByKey).forEach((record) => {
      const birdId = String(record.species_id || '').trim();
      const statusKey = String(record.species_status_key || '').trim();
      let resolvedBirdId = birdId;
      if (!resolvedBirdId && statusKey) {
        const bird = state.birds.find((item) => getBirdStatusKey(item) === statusKey);
        resolvedBirdId = bird ? bird.id : '';
      }
      if (!resolvedBirdId) return;
      if (parseBooleanFlag(record.is_favorite)) nextFavorites.add(resolvedBirdId);
      else nextFavorites.delete(resolvedBirdId);
    });
    state.favorites = Array.from(nextFavorites);
    saveFavorites();
  }

  async function pullBirdSyncStateFromRemote() {
    if (!window.accessToken) return;
    const userId = getBirdSyncUserId();
    if (!userId) return;

    const workbookPath = await resolveBirdSyncWorkbookPath();
    if (!workbookPath) return;

    const sightingsPayload = await fetchTableColumnsAndRows(workbookPath, BIRD_SIGHTINGS_TABLE_NAME, 5000);
    const userStatePayload = await fetchTableColumnsAndRows(workbookPath, BIRD_USER_STATE_TABLE_NAME, 5000);
    setSyncSchemaDiagnosticsFromColumns(sightingsPayload.columns, userStatePayload.columns);

    const sightingRecords = toRowObjects(sightingsPayload.columns, sightingsPayload.rows)
      .filter((row) => String(row.user_id || '').trim() === userId)
      .map(parseBirdSightingRecord)
      .filter(Boolean);

    state.sightingLog = mergeSightingLogsByEventId(state.sightingLog, sightingRecords);
    saveSightingLog();
    updateBirdingStatusFromLog();

    const userStateRows = toRowObjects(userStatePayload.columns, userStatePayload.rows)
      .filter((row) => String(row.user_id || '').trim() === userId);
    applyFavoriteStateRows(userStateRows);
    renderBirdLogOfflineStatus();
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

  function hasBirdLogEvidence(entry) {
    if (!entry || typeof entry !== 'object') return false;
    return Boolean(
      String(entry.photoName || '').trim()
      || String(entry.audioName || '').trim()
      || String(entry.photoUrl || '').trim()
      || String(entry.audioUrl || '').trim()
    );
  }

  function getSeasonKeyForDate(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
    const month = date.getMonth() + 1;
    if (month === 12 || month <= 2) return 'winter';
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    return 'fall';
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
    state.syncLastError = '';
    state.syncLastErrorCode = '';
    if (!window.accessToken) {
      state.syncLastErrorCode = 'AUTH';
      renderSyncStatusPanel();
      return;
    }

    const userId = getBirdSyncUserId();
    if (!userId) {
      state.syncLastError = 'Sync skipped: signed-in account identity is unavailable.';
      state.syncLastErrorCode = 'AUTH';
      renderSyncStatusPanel();
      return;
    }

    const deviceId = getBirdSyncDeviceId();
    const workbookPath = await resolveBirdSyncWorkbookPath();
    if (!workbookPath) {
      state.syncLastError = `Sync skipped: workbook with tables '${BIRD_SIGHTINGS_TABLE_NAME}' and '${BIRD_USER_STATE_TABLE_NAME}' was not found.`;
      state.syncLastErrorCode = 'NOT_FOUND';
      renderSyncStatusPanel();
      return;
    }

    let schemaSightings = null;
    let schemaUserState = null;
    try {
      schemaSightings = await fetchTableColumnsAndRows(workbookPath, BIRD_SIGHTINGS_TABLE_NAME, 1);
      schemaUserState = await fetchTableColumnsAndRows(workbookPath, BIRD_USER_STATE_TABLE_NAME, 1);
      setSyncSchemaDiagnosticsFromColumns(schemaSightings.columns, schemaUserState.columns);
    } catch (error) {
      const reason = error && error.message ? error.message : 'failed to fetch table schema';
      setSyncSchemaDiagnosticsUnknown(reason);
      state.syncLastError = `Sync skipped: could not validate table schemas (${reason}).`;
      state.syncLastErrorCode = classifyBirdSyncError(error);
      renderSyncStatusPanel();
      return;
    }

    const pending = Array.isArray(state.syncQueue) ? state.syncQueue.slice() : [];
    if (!pending.length) {
      state.lastSyncSuccessAt = toIsoNow();
      renderSyncStatusPanel();
      return;
    }

    const nextQueue = [];
    const failedNotes = [];

    for (let i = 0; i < pending.length; i += 1) {
      const item = pending[i];
      try {
        if (item.type === 'log-sighting') {
          await appendRecordsToTable(
            workbookPath,
            BIRD_SIGHTINGS_TABLE_NAME,
            [toBirdSightingRecord(item.payload || {}, userId, deviceId)],
            BIRD_SIGHTINGS_REQUIRED_COLUMNS
          );
          markQueueItemSucceeded(item);
        } else if (item.type === 'favorite-toggle') {
          await appendRecordsToTable(
            workbookPath,
            BIRD_USER_STATE_TABLE_NAME,
            [toBirdUserStateRecord(item.payload || {}, userId, deviceId)],
            BIRD_USER_STATE_REQUIRED_COLUMNS
          );
        } else {
          // Unknown queue item type: keep for future processors.
          nextQueue.push(item);
        }
      } catch (error) {
        const attempts = Math.max(0, Number(item.attempts || 0)) + 1;
        const classifiedCode = classifyBirdSyncError(error);
        nextQueue.push({
          ...item,
          attempts,
          conflictCode: classifiedCode,
          lastError: String(error && error.message ? error.message : error || 'Unknown sync error')
        });
        failedNotes.push(`${item.type}: ${error && error.message ? error.message : 'sync failed'}`);
      }
    }

    state.syncQueue = nextQueue;
    saveSyncQueue();
    if (!nextQueue.length) {
      state.lastSyncSuccessAt = toIsoNow();
      state.syncLastError = '';
      state.syncLastErrorCode = '';
    } else {
      state.syncLastError = failedNotes.join(' | ').slice(0, 600);
      state.syncLastErrorCode = String((nextQueue[0] && nextQueue[0].conflictCode) || 'UNKNOWN');
    }
    renderSyncStatusPanel();
    renderBirdLogOfflineStatus();
  }

  function renderSyncStatusPanel() {
    const panel = document.getElementById('birdsSyncStatusPanel');
    const conflictsPanel = document.getElementById('birdsSyncConflictsPanel');
    if (!panel || !conflictsPanel) return;

    const pending = Array.isArray(state.syncQueue) ? state.syncQueue.length : 0;
    const lastAttempt = state.lastSyncAttemptAt ? new Date(state.lastSyncAttemptAt).toLocaleString() : 'Never';
    const lastSuccess = state.lastSyncSuccessAt ? new Date(state.lastSyncSuccessAt).toLocaleString() : 'Not yet';
    const workbook = state.birdSyncWorkbookPath || 'Not resolved';
    const signedIn = Boolean(window.accessToken && getBirdSyncUserId());
    const schemaSummary = getSyncSchemaDiagnosticsSummary();
    const schemaChip = getSyncSchemaDiagnosticsChip();

    panel.innerHTML = `
      <div class="nature-sync-kpi-row">
        <span class="nature-sync-kpi-label">Auth</span>
        <strong>${signedIn ? 'Signed in' : 'Local only'}</strong>
      </div>
      <div class="nature-sync-kpi-row">
        <span class="nature-sync-kpi-label">Pending queue</span>
        <strong>${pending}</strong>
      </div>
      <div class="nature-sync-kpi-row">
        <span class="nature-sync-kpi-label">Last attempt</span>
        <strong>${escapeHtml(lastAttempt)}</strong>
      </div>
      <div class="nature-sync-kpi-row">
        <span class="nature-sync-kpi-label">Last success</span>
        <strong>${escapeHtml(lastSuccess)}</strong>
      </div>
      <div class="nature-sync-kpi-row">
        <span class="nature-sync-kpi-label">Workbook</span>
        <strong>${escapeHtml(workbook)}</strong>
      </div>
      <div class="nature-sync-kpi-row">
        <span class="nature-sync-kpi-label">Sync schema diagnostics</span>
        <strong>
          <span class="nature-explorer-status-pill ${escapeHtml(schemaChip.className)}">${escapeHtml(schemaChip.label)}</span>
          <span>${escapeHtml(schemaSummary)}</span>
        </strong>
      </div>
      ${evidenceColumnsAreMissing() ? `
      <div class="nature-sync-kpi-row">
        <span class="nature-sync-kpi-label">Evidence URL columns</span>
        <strong>
          <span class="nature-explorer-status-pill is-warn">⚠️ Missing</span>
          <span>Add <code>${escapeHtml((state.syncSchemaDiagnostics && Array.isArray(state.syncSchemaDiagnostics.sightingsOptionalMissing) ? state.syncSchemaDiagnostics.sightingsOptionalMissing : ['photo_url', 'audio_url']).join(', '))}</code> columns to <code>birds_sightings</code> in your Excel workbook to save OneDrive media links. Sightings are unaffected.</span>
        </strong>
      </div>` : ''}
      ${state.syncLastError ? `<div class="nature-sync-error">${escapeHtml(state.syncLastError)}</div>` : ''}
    `;

    const conflicts = Array.isArray(state.syncConflicts) ? state.syncConflicts : [];
    renderBirdSubtabDiagnostics();
    if (!conflicts.length) {
      conflictsPanel.innerHTML = '<div class="nature-sync-conflict-empty">No sync conflicts detected.</div>';
      return;
    }

    conflictsPanel.innerHTML = conflicts.map((conflict) => `
      <div class="nature-sync-conflict-card">
        <div><strong>${escapeHtml(conflict.speciesName || 'Bird sighting')}</strong></div>
        <div class="nature-sync-conflict-meta">Created: ${escapeHtml(conflict.createdAt || '--')}</div>
        <div class="nature-sync-conflict-actions">
          <button type="button" class="pill-button" data-conflict-id="${escapeHtml(conflict.id)}" data-sync-resolve="local">Keep Local</button>
          <button type="button" class="pill-button" data-conflict-id="${escapeHtml(conflict.id)}" data-sync-resolve="remote">Use Remote</button>
        </div>
      </div>
    `).join('');
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

  function getBirdLogIntentChipDefs(stats) {
    return [
      { key: 'in-season', label: `In season (${stats.currentSeasonLabel})` },
      { key: 'not-yet-seen', label: 'Not yet seen' },
      { key: 'rare', label: 'Rare' },
      { key: 'seen-recently', label: 'Seen recently' },
      { key: 'favorite', label: 'Favorite' }
    ];
  }

  function applyBirdLogIntentChip(intentKey) {
    if (!intentKey) return;
    const commandInput = document.getElementById('birdsLogCommandInput');
    const map = {
      'in-season': getCurrentSeason(),
      'not-yet-seen': 'not seen',
      rare: 'rare',
      'seen-recently': 'seen recently',
      favorite: 'favorite'
    };
    const token = map[intentKey] || '';
    if (!token) return;
    const nextValue = `${String(state.birdLogCommandValue || '').trim()} ${token}`.trim();
    state.birdLogCommandValue = nextValue;
    saveBirdUiPrefs();
    if (commandInput) commandInput.value = nextValue;
    applyBirdLogCommand(nextValue);
  }

  function getFastLogExampleForActiveSubTab() {
    const examples = {
      birds: 'great blue heron marsh certain',
      mammals: 'white-tailed deer forest certain',
      reptiles: 'painted turtle marsh probable',
      amphibians: 'spring peeper forest certain',
      insects: 'dragonfly marsh certain',
      arachnids: 'orb weaver forest probable',
      wildflowers: 'milkweed meadow certain',
      trees: 'red oak forest certain'
    };
    const key = String(state.activeSubTab || 'birds').trim();
    return examples[key] || examples.birds;
  }

  function getActiveSpeciesOptionsForLog() {
    const query = norm(state.birdLogSpeciesQuery || '');
    const base = Array.isArray(state.birds) ? state.birds.slice() : [];
    if (!query) return base;
    return base.filter((bird) => {
      const haystack = [bird.speciesName, bird.familyLabel, bird.genusLabel, bird.canonicalId].map(norm).join(' ');
      return haystack.includes(query);
    });
  }

  function resolveBirdIdFromLogSpeciesInput(rawValue) {
    const value = String(rawValue || '').trim();
    if (!value) return '';
    const direct = findBirdById(value);
    if (direct) return direct.id;
    const exact = state.birds.find((bird) => norm(bird.speciesName) === norm(value));
    if (exact) return exact.id;
    const contains = state.birds.find((bird) => norm(bird.speciesName).includes(norm(value)));
    return contains ? contains.id : '';
  }

  function normalizeImportHeaderKey(value) {
    return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }

  function parseDelimitedLine(line, delimiter) {
    const cells = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }
      if (char === delimiter && !inQuotes) {
        cells.push(current);
        current = '';
        continue;
      }
      current += char;
    }
    cells.push(current);
    return cells.map((cell) => String(cell || '').trim());
  }

  function parseDelimitedImportRows(rawText) {
    const text = String(rawText || '').replace(/\r\n?/g, '\n').trim();
    if (!text) return [];
    const lines = text.split('\n').filter((line) => String(line || '').trim());
    if (!lines.length) return [];
    const delimiter = lines[0].includes('\t') ? '\t' : ',';
    const headers = parseDelimitedLine(lines[0], delimiter).map((header, idx) => normalizeImportHeaderKey(header || `col_${idx + 1}`));
    return lines.slice(1).map((line) => {
      const cells = parseDelimitedLine(line, delimiter);
      const row = {};
      headers.forEach((key, idx) => {
        row[key] = String(cells[idx] || '').trim();
      });
      return row;
    }).filter((row) => Object.values(row).some((value) => String(value || '').trim()));
  }

  function parseJsonImportRows(rawText) {
    const payload = safeJsonParse(rawText, null);
    if (!payload) return [];
    const list = Array.isArray(payload)
      ? payload
      : Array.isArray(payload.results)
        ? payload.results
        : Array.isArray(payload.observations)
          ? payload.observations
          : [];
    return list.map((entry) => {
      const row = { ...(entry || {}) };
      if (row.taxon && typeof row.taxon === 'object') {
        if (!row.scientific_name && row.taxon.name) row.scientific_name = String(row.taxon.name || '').trim();
        if (!row.species_guess && row.taxon.preferred_common_name) row.species_guess = String(row.taxon.preferred_common_name || '').trim();
      }
      if ((!row.latitude || !row.longitude) && row.geojson && Array.isArray(row.geojson.coordinates)) {
        row.longitude = row.geojson.coordinates[0];
        row.latitude = row.geojson.coordinates[1];
      }
      if (!row.observed_on && row.observed_on_string) row.observed_on = row.observed_on_string;
      return row;
    });
  }

  function pickImportField(record, keys) {
    const row = record || {};
    const entries = Object.entries(row);
    for (let i = 0; i < keys.length; i += 1) {
      const target = normalizeImportHeaderKey(keys[i]);
      const exact = entries.find(([k]) => normalizeImportHeaderKey(k) === target);
      if (exact && String(exact[1] || '').trim()) return String(exact[1] || '').trim();
      const fuzzy = entries.find(([k]) => normalizeImportHeaderKey(k).includes(target));
      if (fuzzy && String(fuzzy[1] || '').trim()) return String(fuzzy[1] || '').trim();
    }
    return '';
  }

  function inferRegionHabitatFromLocation(locationText) {
    const text = norm(locationText);
    if (!text) return { region: '', habitat: '' };
    if (text.includes('coast') || text.includes('beach') || text.includes('shore')) return { region: 'coast', habitat: 'coast' };
    if (text.includes('marsh') || text.includes('wetland') || text.includes('swamp')) return { region: 'marsh', habitat: 'marsh' };
    if (text.includes('forest') || text.includes('wood') || text.includes('trail')) return { region: 'forest', habitat: 'forest' };
    if (text.includes('city') || text.includes('urban') || text.includes('park')) return { region: 'urban', habitat: 'urban' };
    return { region: '', habitat: '' };
  }

  function mapImportConfidence(rawQuality) {
    const quality = norm(rawQuality);
    if (!quality) return 'certain';
    if (quality.includes('needs_id') || quality.includes('casual') || quality.includes('review')) return 'needs-review';
    if (quality.includes('probable')) return 'probable';
    return 'certain';
  }

  function resolveBirdFromImportSpecies(rawSpecies, scientificSpecies) {
    const candidates = [rawSpecies, scientificSpecies].map((value) => String(value || '').trim()).filter(Boolean);
    for (let i = 0; i < candidates.length; i += 1) {
      const fromInput = resolveBirdIdFromLogSpeciesInput(candidates[i]);
      if (fromInput) return findBirdById(fromInput);
      const scientificMatch = state.birds.find((bird) => {
        const scientific = String(pickImportField(bird.details || {}, ['species_scientific', 'scientific_name']) || '').trim();
        return scientific && norm(scientific) === norm(candidates[i]);
      });
      if (scientificMatch) return scientificMatch;
    }
    return null;
  }

  function buildBirdImportEntryFromFields(fields, bird, indexSeed) {
    if (!bird) return null;
    const contextGuess = inferRegionHabitatFromLocation(fields.locationName);
    return normalizeSightingEntry({
      eventId: `imp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${indexSeed}`,
      speciesId: bird.id,
      speciesStatusKey: getBirdStatusKey(bird),
      canonicalId: bird.canonicalId || bird.id,
      speciesName: bird.speciesName,
      familyLabel: bird.familyLabel,
      dateObserved: fields.observedOn || toIsoNow(),
      locationName: fields.locationName,
      count: Math.max(1, Number(fields.countRaw || 1) || 1),
      region: (fields.region || contextGuess.region || '').trim().toLowerCase(),
      habitat: (fields.habitat || contextGuess.habitat || '').trim().toLowerCase(),
      latitude: fields.latRaw === '' ? null : Number(fields.latRaw),
      longitude: fields.lngRaw === '' ? null : Number(fields.lngRaw),
      confidence: mapImportConfidence(fields.quality),
      notes: [
        fields.notes,
        fields.observationUrl ? `Source: ${fields.observationUrl}` : '',
        fields.observationId ? `Obs ID: ${fields.observationId}` : ''
      ].filter(Boolean).join(' | '),
      createdAt: toIsoNow(),
      synced: false
    });
  }

  function scoreBirdImportSuggestion(label, bird) {
    const input = norm(label);
    if (!input || !bird) return 0;
    const speciesName = norm(bird.speciesName);
    const family = norm(bird.familyLabel);
    const genus = norm(bird.genusLabel);
    const inputTokens = input.split(/\s+/).filter(Boolean);
    const speciesTokens = speciesName.split(/\s+/).filter(Boolean);

    let score = 0;
    if (speciesName === input) score += 300;
    if (speciesName.includes(input) || input.includes(speciesName)) score += 180;
    if (family && input.includes(family)) score += 40;
    if (genus && input.includes(genus)) score += 60;

    const overlaps = inputTokens.filter((token) => speciesTokens.includes(token)).length;
    score += overlaps * 35;

    return score;
  }

  function getBirdImportSuggestions(candidate, maxCount = 5) {
    const label = String((candidate && candidate.speciesInput) || '').trim();
    if (!label) return [];
    return (state.birds || [])
      .map((bird) => ({ bird, score: scoreBirdImportSuggestion(label, bird) }))
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxCount)
      .map((row) => row.bird);
  }

  function buildBirdImportCandidates(rawRows, sourceLabel) {
    const rows = Array.isArray(rawRows) ? rawRows : [];
    return rows.map((record, index) => {
      const fields = {
        species: pickImportField(record, ['species_guess', 'common_name', 'species', 'taxon_name', 'name']),
        scientific: pickImportField(record, ['scientific_name', 'taxon_scientific_name', 'taxon_name']),
        observedOn: pickImportField(record, ['observed_on', 'date_observed', 'observed_at', 'date']),
        locationName: pickImportField(record, ['place_guess', 'location_name', 'location', 'place', 'site']),
        region: pickImportField(record, ['region']),
        habitat: pickImportField(record, ['habitat']),
        countRaw: pickImportField(record, ['count', 'individual_count', 'individuals']),
        latRaw: pickImportField(record, ['latitude', 'lat']),
        lngRaw: pickImportField(record, ['longitude', 'lng', 'lon']),
        quality: pickImportField(record, ['quality_grade', 'confidence']),
        notes: pickImportField(record, ['description', 'notes', 'note']),
        observationUrl: pickImportField(record, ['uri', 'url', 'observation_url']),
        observationId: pickImportField(record, ['id', 'observation_id'])
      };

      const bird = resolveBirdFromImportSpecies(fields.species, fields.scientific);
      const entry = buildBirdImportEntryFromFields(fields, bird, index);

      return {
        sourceLabel,
        sourceRowIndex: index,
        rowIndex: index + 1,
        speciesInput: fields.species || fields.scientific,
        fields,
        matchedBirdId: bird ? bird.id : '',
        matchedSpeciesName: bird ? bird.speciesName : '',
        suggestions: [],
        entry,
        raw: record
      };
    });
  }

  function toImportDedupKey(entry) {
    const normalized = normalizeSightingEntry(entry || {});
    return [
      norm(normalized.speciesStatusKey),
      norm(normalized.dateObserved),
      norm(normalized.locationName)
    ].join('|');
  }

  function analyzeBirdImportCandidates(candidates) {
    const rows = Array.isArray(candidates) ? candidates : [];
    const existingKeys = new Set((state.sightingLog || []).map((entry) => toImportDedupKey(entry)));
    const seenImportKeys = new Set();
    const result = {
      total: rows.length,
      matched: 0,
      unmatched: 0,
      duplicates: 0,
      ready: 0,
      readyCandidates: []
    };

    rows.forEach((row) => {
      if (!row || !row.entry || !row.matchedBirdId) {
        row.importStatus = 'unmatched';
        result.unmatched += 1;
        return;
      }
      result.matched += 1;
      const key = toImportDedupKey(row.entry);
      if (!key || existingKeys.has(key) || seenImportKeys.has(key)) {
        row.importStatus = 'duplicate';
        result.duplicates += 1;
        return;
      }
      seenImportKeys.add(key);
      row.importStatus = 'ready';
      result.ready += 1;
      result.readyCandidates.push(row);
    });

    return result;
  }

  function refreshBirdImportAnalysis() {
    const rows = Array.isArray(state.birdImport.candidates) ? state.birdImport.candidates : [];
    rows.forEach((row) => {
      if (!row) return;
      if (row.matchedBirdId) {
        row.suggestions = [];
        return;
      }
      row.suggestions = getBirdImportSuggestions(row, 5).map((bird) => ({
        id: bird.id,
        name: bird.speciesName,
        family: bird.familyLabel
      }));
    });
    state.birdImport.lastAnalysis = analyzeBirdImportCandidates(rows);
    return state.birdImport.lastAnalysis;
  }

  function applyBirdImportManualMatch(sourceRowIndex, birdId) {
    const rowIndex = Number(sourceRowIndex);
    if (!Number.isInteger(rowIndex)) return false;
    const bird = findBirdById(birdId);
    if (!bird) return false;
    const candidate = (state.birdImport.candidates || []).find((row) => Number(row && row.sourceRowIndex) === rowIndex);
    if (!candidate) return false;

    candidate.matchedBirdId = bird.id;
    candidate.matchedSpeciesName = bird.speciesName;
    candidate.entry = buildBirdImportEntryFromFields(candidate.fields || {}, bird, rowIndex);
    candidate.suggestions = [];
    refreshBirdImportAnalysis();
    return true;
  }

  function renderBirdImportMappingModal() {
    const body = document.getElementById('birdsImportMappingBody');
    if (!body) return;
    const rows = Array.isArray(state.birdImport.candidates) ? state.birdImport.candidates : [];
    const unmatched = rows.filter((row) => row && row.importStatus === 'unmatched');
    if (!unmatched.length) {
      body.innerHTML = '<div class="nature-empty-state">No unmatched rows. You are ready to import.</div>';
      return;
    }
    body.innerHTML = unmatched.map((row) => {
      const suggestions = Array.isArray(row.suggestions) ? row.suggestions : [];
      const suggestionHtml = suggestions.length
        ? suggestions.map((item) => `<button type="button" class="pill-button" data-birds-import-map-row="${row.sourceRowIndex}" data-birds-import-map-id="${escapeHtml(item.id)}">${escapeHtml(item.name)} (${escapeHtml(getFamilyChipLabel(item.family))})</button>`).join('')
        : '<div class="card-subtitle">No high-confidence suggestions for this row.</div>';
      return `
        <div class="nature-import-map-row">
          <div><strong>Row ${row.rowIndex}</strong> - ${escapeHtml(row.speciesInput || '(no species)')}</div>
          <div class="card-subtitle">Observed: ${escapeHtml(row.fields && row.fields.observedOn ? row.fields.observedOn : '--')} | Location: ${escapeHtml(row.fields && row.fields.locationName ? row.fields.locationName : '--')}</div>
          <div class="nature-import-map-suggestions">${suggestionHtml}</div>
        </div>
      `;
    }).join('');
  }

  function openBirdImportMappingModal() {
    if (!state.birdImport.lastAnalysis || !Array.isArray(state.birdImport.candidates) || !state.birdImport.candidates.length) {
      if (typeof window.showToast === 'function') window.showToast('Preview import first to open strict mapping report.', 'info', 2200);
      return;
    }
    const modal = document.getElementById('birdsImportMappingModal');
    const backdrop = document.getElementById('birdsImportMappingBackdrop');
    if (!modal || !backdrop) return;
    renderBirdImportMappingModal();
    modal.hidden = false;
    backdrop.hidden = false;
  }

  function closeBirdImportMappingModal() {
    const modal = document.getElementById('birdsImportMappingModal');
    const backdrop = document.getElementById('birdsImportMappingBackdrop');
    if (modal) modal.hidden = true;
    if (backdrop) backdrop.hidden = true;
  }

  function renderBirdImportPanel() {
    const status = document.getElementById('birdsImportStatus');
    const preview = document.getElementById('birdsImportPreview');
    const mappingBtn = document.getElementById('birdsImportMappingBtn');
    if (!status || !preview) return;

    const analysis = state.birdImport.lastAnalysis;
    const rows = Array.isArray(state.birdImport.candidates) ? state.birdImport.candidates : [];
    if (!analysis || !rows.length) {
      status.textContent = 'No import parsed yet.';
      preview.textContent = 'Preview rows will appear here.';
      if (mappingBtn) mappingBtn.disabled = true;
      return;
    }

    status.textContent = `Parsed ${analysis.total} rows from ${state.birdImport.sourceLabel || 'input'} | Matched: ${analysis.matched} | Ready: ${analysis.ready} | Duplicates: ${analysis.duplicates} | Unmatched: ${analysis.unmatched}`;
    const topRows = rows.slice(0, 18);
    preview.innerHTML = topRows.map((row) => {
      const badge = row.importStatus === 'ready' ? 'READY' : row.importStatus === 'duplicate' ? 'DUPLICATE' : 'UNMATCHED';
      const badgeColor = row.importStatus === 'ready' ? '#166534' : row.importStatus === 'duplicate' ? '#92400e' : '#991b1b';
      return `<div style="padding:6px 0; border-bottom:1px solid #e2e8f0;"><strong>${escapeHtml(row.speciesInput || '(no species)')}</strong> → ${escapeHtml(row.matchedSpeciesName || 'No match')} <span style="font-size:11px; font-weight:800; color:${badgeColor};">${badge}</span></div>`;
    }).join('');
    if (rows.length > topRows.length) {
      preview.innerHTML += `<div style="padding-top:6px; font-size:12px; color:#64748b;">Showing ${topRows.length} of ${rows.length} parsed rows.</div>`;
    }
    if (mappingBtn) mappingBtn.disabled = analysis.unmatched === 0;
  }

  async function readBirdImportRawInput() {
    const pasteInput = document.getElementById('birdsImportPasteInput');
    const fileInput = document.getElementById('birdsImportFileInput');
    const pasted = String(pasteInput && pasteInput.value ? pasteInput.value : '').trim();
    if (pasted) {
      return { raw: pasted, sourceLabel: 'pasted text' };
    }
    const file = fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
    if (!file) return { raw: '', sourceLabel: '' };
    const text = await file.text();
    return { raw: String(text || ''), sourceLabel: `file: ${file.name}` };
  }

  async function parseBirdImportInput() {
    if (state.birdImport.busy) return;
    state.birdImport.busy = true;
    try {
      const { raw, sourceLabel } = await readBirdImportRawInput();
      if (!raw.trim()) {
        state.birdImport.sourceLabel = '';
        state.birdImport.candidates = [];
        state.birdImport.lastAnalysis = null;
        renderBirdImportPanel();
        if (typeof window.showToast === 'function') window.showToast('Paste rows or choose a file first.', 'info', 2200);
        return;
      }

      const jsonRows = /^[\[{]/.test(raw.trim()) ? parseJsonImportRows(raw) : [];
      const rows = jsonRows.length ? jsonRows : parseDelimitedImportRows(raw);
      state.birdImport.sourceLabel = sourceLabel || 'import input';
      state.birdImport.candidates = buildBirdImportCandidates(rows, state.birdImport.sourceLabel);
      state.birdImport.lastAnalysis = refreshBirdImportAnalysis();
      renderBirdImportPanel();
      if (typeof window.showToast === 'function') {
        window.showToast(`Import preview ready: ${state.birdImport.lastAnalysis.ready} rows can be imported.`, 'success', 2400);
      }
    } finally {
      state.birdImport.busy = false;
    }
  }

  async function executeBirdImport(dryRun) {
    if (state.birdImport.busy) return;
    if (!state.birdImport.lastAnalysis || !Array.isArray(state.birdImport.candidates) || !state.birdImport.candidates.length) {
      await parseBirdImportInput();
    }
    const analysis = state.birdImport.lastAnalysis;
    if (!analysis) return;

    refreshBirdImportAnalysis();

    if (dryRun) {
      renderBirdImportPanel();
      if (typeof window.showToast === 'function') {
        window.showToast(`Dry run: ${analysis.ready} ready, ${analysis.duplicates} duplicates, ${analysis.unmatched} unmatched.`, 'info', 3200);
      }
      return;
    }

    if (!analysis.readyCandidates.length) {
      if (typeof window.showToast === 'function') window.showToast('No ready rows to import.', 'info', 2200);
      return;
    }

    analysis.readyCandidates.forEach((candidate) => {
      if (!candidate || !candidate.entry) return;
      addSightingLogEntry(candidate.entry);
    });
    state.logSuccessMessage = `Imported ${analysis.readyCandidates.length} sightings from ${state.birdImport.sourceLabel || 'import'}.`;
    if (typeof window.showToast === 'function') {
      window.showToast(`Imported ${analysis.readyCandidates.length} sightings.`, 'success', 2800);
    }
    const fileInput = document.getElementById('birdsImportFileInput');
    if (fileInput) fileInput.value = '';
    renderBirds();
  }

  function toLocationOptionFromRecord(record) {
    const entries = Object.entries(record || {});
    if (!entries.length) return '';
    const pick = (names) => {
      for (let i = 0; i < names.length; i += 1) {
        const key = names[i];
        const exact = entries.find(([k]) => norm(k) === norm(key));
        if (exact && String(exact[1] || '').trim()) return String(exact[1]).trim();
        const fuzzy = entries.find(([k]) => norm(k).includes(norm(key)));
        if (fuzzy && String(fuzzy[1] || '').trim()) return String(fuzzy[1]).trim();
      }
      return '';
    };
    const name = pick(['location', 'name', 'place', 'venue', 'destination', 'site']);
    const city = pick(['city', 'town']);
    const stateName = pick(['state', 'province', 'region']);
    const parts = [name, city, stateName].filter(Boolean);
    return parts.join(', ').trim();
  }

  async function ensureLocationOptionsLoaded() {
    if (state.locationOptions.loading || state.locationOptions.loaded) return;
    if (!window.accessToken) {
      state.locationOptions.loaded = true;
      state.locationOptions.values = [];
      return;
    }
    state.locationOptions.loading = true;
    try {
      const values = new Set();
      const tableCandidates = {};
      NATURE_LOCATION_TABLE_SOURCES.forEach((source) => {
        const tableName = String(source && source.table ? source.table : '').trim();
        const workbookPath = String(source && source.workbook ? source.workbook : '').trim();
        if (!tableName || !workbookPath) return;
        if (!tableCandidates[tableName]) tableCandidates[tableName] = [];
        tableCandidates[tableName].push(workbookPath);
      });

      for (const tableName of Object.keys(tableCandidates)) {
        const workbooks = prioritizeWorkbookCandidates(tableCandidates[tableName]);
        for (let i = 0; i < workbooks.length; i += 1) {
          const workbook = workbooks[i];
          try {
            const payload = await fetchTableColumnsAndRows(workbook, tableName, 2000);
            const rows = toRowObjects(payload.columns || [], payload.rows || []);
            rows.forEach((row) => {
              const label = toLocationOptionFromRecord(row);
              if (label) values.add(label);
            });
            break;
          } catch (_error) {
            // Try next workbook candidate for this specific table.
          }
        }
      }
      state.locationOptions.values = Array.from(values).sort((a, b) => a.localeCompare(b));
      state.locationOptions.loaded = true;
    } finally {
      state.locationOptions.loading = false;
    }
  }

  function syncBirdLogLocationOptions() {
    const select = document.getElementById('birdsLogLocationInput');
    const otherInput = document.getElementById('birdsLogLocationOtherInput');
    if (!select) return;
    const previous = String(select.value || '');
    const options = state.locationOptions.values || [];
    const optionHtml = options.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join('');
    select.innerHTML = `<option value="">Location...</option>${optionHtml}<option value="__other__">Other (type manually)</option>`;
    if (previous && options.includes(previous)) select.value = previous;
    else if (previous && previous !== '__other__') {
      select.value = '__other__';
      if (otherInput) otherInput.value = previous;
    }
    if (select.value === '__other__') {
      if (otherInput) otherInput.hidden = false;
    } else if (otherInput) {
      otherInput.hidden = true;
    }
  }

  function parseBirdLogCommand(raw) {
    const text = String(raw || '').trim();
    const normalized = norm(text);
    if (!normalized) return null;
    const tokens = normalized.split(/\s+/);

    let speciesId = '';
    for (let i = 0; i < state.birds.length; i += 1) {
      const bird = state.birds[i];
      if (normalized.includes(norm(bird.speciesName))) {
        speciesId = bird.id;
        break;
      }
    }

    const hasToken = (value) => tokens.includes(value);
    const region = ['coast', 'marsh', 'forest', 'urban'].find((value) => hasToken(value) || (value === 'coast' && hasToken('coastal'))) || '';
    const habitat = region;
    const confidence = hasToken('probable')
      ? 'probable'
      : (hasToken('review') || hasToken('needs-review') || hasToken('uncertain'))
        ? 'needs-review'
        : 'certain';

    return { speciesId, region, habitat, confidence };
  }

  function applyBirdLogCommand(raw) {
    const parsed = parseBirdLogCommand(raw);
    if (!parsed) return;
    const speciesSelect = document.getElementById('birdsLogSpeciesSelect');
    const speciesSearchInput = document.getElementById('birdsLogSpeciesSearchInput');
    const regionInput = document.getElementById('birdsLogRegionInput');
    const habitatInput = document.getElementById('birdsLogHabitatInput');
    const confidenceInput = document.getElementById('birdsLogConfidenceInput');

    if (speciesSelect && parsed.speciesId) {
      speciesSelect.value = parsed.speciesId;
      applyBirdLogSpeciesDefaults(parsed.speciesId, { preferHistory: true });
      const parsedBird = findBirdById(parsed.speciesId);
      if (speciesSearchInput && parsedBird) speciesSearchInput.value = parsedBird.speciesName;
    }
    if (regionInput && parsed.region) regionInput.value = parsed.region;
    if (habitatInput && parsed.habitat) habitatInput.value = parsed.habitat;
    if (confidenceInput && parsed.confidence) confidenceInput.value = parsed.confidence;
    renderBirdLogValidationBadges();
    renderBirdLogHistoryCard();
  }

  function getSpeciesAutoDefaultsFromHistory(bird) {
    if (!bird) return { region: '', habitat: '', confidence: 'certain' };
    const history = getBirdHistorySummary(bird);
    const logs = getBirdLogBySpeciesKey(getBirdStatusKey(bird));
    const confidence = logs.length
      ? (norm(logs[logs.length - 1].confidence) === 'probable'
        ? 'probable'
        : norm(logs[logs.length - 1].confidence) === 'needs-review'
          ? 'needs-review'
          : 'certain')
      : 'certain';
    return {
      region: norm(history.topRegion),
      habitat: norm(history.topHabitat),
      confidence
    };
  }

  function applyBirdLogSpeciesDefaults(speciesId, options = {}) {
    const bird = findBirdById(speciesId);
    if (!bird) return;
    const regionInput = document.getElementById('birdsLogRegionInput');
    const habitatInput = document.getElementById('birdsLogHabitatInput');
    const confidenceInput = document.getElementById('birdsLogConfidenceInput');
    const defaults = getSpeciesAutoDefaultsFromHistory(bird);
    const useHistory = options.preferHistory !== false;
    if (regionInput && !regionInput.value) regionInput.value = useHistory && defaults.region ? defaults.region : norm(bird.defaultRegion || '');
    if (habitatInput && !habitatInput.value) habitatInput.value = useHistory && defaults.habitat ? defaults.habitat : norm(bird.defaultHabitat || '');
    if (confidenceInput && !confidenceInput.value) confidenceInput.value = defaults.confidence || 'certain';
  }

  function applyBirdLogPresetUi() {
    const logView = document.querySelector('.nature-birds-view[data-birds-view="log"]');
    if (!logView) return;
    const preset = ['quick', 'field-full', 'evidence'].includes(state.birdLogPreset) ? state.birdLogPreset : 'field-full';
    logView.classList.toggle('is-log-preset-field-full', preset === 'field-full');

    const buttons = logView.querySelectorAll('[data-birds-log-preset]');
    buttons.forEach((button) => {
      const active = button.getAttribute('data-birds-log-preset') === preset;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    const fields = logView.querySelectorAll('[data-log-field]');
    fields.forEach((field) => {
      const kind = field.getAttribute('data-log-field');
      const show = preset === 'quick'
        ? kind === 'core'
        : preset === 'evidence'
          ? (kind === 'core' || kind === 'evidence')
          : true;
      field.hidden = !show;
    });
  }

  function renderBirdLogRecommendationStrip(stats, familyLookup) {
    const container = document.getElementById('birdsLogRecommendationStrip');
    if (!container) return;
    if (!state.birdsLoaded) {
      container.textContent = 'Loading best birds to log now...';
      return;
    }
    const picks = sortExplorerBirds(state.birds)
      .map((bird) => ({ bird, insight: getBirdExplorerInsight(bird, stats, familyLookup) }))
      .filter((entry) => !entry.insight.seen || entry.insight.inSeason || entry.insight.rareChance)
      .slice(0, 4);
    if (!picks.length) {
      container.innerHTML = '<div class="nature-log-reco-card">No recommendations available yet.</div>';
      return;
    }

    container.innerHTML = `
      <div class="nature-log-reco-card">
        <div class="nature-log-reco-title">Best birds to log now</div>
        <div class="nature-log-reco-list">
          ${picks.map((entry) => {
            const why = (entry.insight.reasons || []).filter((reason) => ['In season now', 'Helps complete a family', 'Rare opportunity'].includes(reason)).slice(0, 3);
            return `
              <button type="button" class="nature-log-nudge-chip" data-birds-log-prefill="${escapeHtml(entry.bird.id)}" ${tooltipAttrs(`Prefill log form for ${entry.bird.speciesName}`)}>
                ${escapeHtml(entry.bird.speciesName)}${why.length ? ` - ${escapeHtml(why.join(' | '))}` : ''}
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function renderBirdLogValidationBadges() {
    const row = document.getElementById('birdsLogValidationBadges');
    if (!row) return;
    const speciesSelect = document.getElementById('birdsLogSpeciesSelect');
    const latInput = document.getElementById('birdsLogLatInput');
    const lngInput = document.getElementById('birdsLogLngInput');
    const photoInput = document.getElementById('birdsLogPhotoInput');
    const audioInput = document.getElementById('birdsLogAudioInput');
    const hasSpecies = Boolean(speciesSelect && speciesSelect.value);
    const hasCoords = isValidLatLng(latInput ? latInput.value : '', lngInput ? lngInput.value : '');
    const hasEvidenceFile = Boolean(
      (photoInput && photoInput.files && photoInput.files.length)
      || (audioInput && audioInput.files && audioInput.files.length)
    );
    const chips = [
      hasSpecies ? 'Ready to save' : 'Missing species',
      hasCoords ? 'Coordinates ready' : 'Coordinates optional'
    ];
    let html = chips.map((label) => `<span class="nature-log-status-chip">${escapeHtml(label)}</span>`).join('');
    if (hasEvidenceFile && evidenceColumnsAreMissing()) {
      html += `<span class="nature-log-status-chip nature-log-status-chip--warn" title="Add photo_url and audio_url columns to your birds_sightings Excel table to save OneDrive media links. Your file will still upload to OneDrive, but the link won\'t be stored in the sheet.">⚠️ Media URL columns missing in Excel table</span>`;
    } else if (hasEvidenceFile && window.accessToken) {
      html += `<span class="nature-log-status-chip nature-log-status-chip--ok">📎 Evidence will upload to OneDrive</span>`;
    } else if (hasEvidenceFile) {
      html += `<span class="nature-log-status-chip nature-log-status-chip--warn">⚠️ Sign in to upload evidence to OneDrive</span>`;
    }
    row.innerHTML = html;
    renderBirdLogEvidenceSchemaHint(hasEvidenceFile);
  }

  function renderBirdLogEvidenceSchemaHint(hasEvidenceFile) {
    const hint = document.getElementById('birdsLogEvidenceSchemaWarn');
    if (!hint) return;
    if (!hasEvidenceFile || !evidenceColumnsAreMissing()) {
      hint.hidden = true;
      hint.innerHTML = '';
      return;
    }
    const missing = Array.isArray(state.syncSchemaDiagnostics && state.syncSchemaDiagnostics.sightingsOptionalMissing)
      ? state.syncSchemaDiagnostics.sightingsOptionalMissing
      : ['photo_url', 'audio_url'];
    hint.hidden = false;
    hint.innerHTML = `
      <div class="nature-evidence-schema-warn">
        <span class="nature-evidence-schema-warn-icon" aria-hidden="true">⚠️</span>
        <div class="nature-evidence-schema-warn-body">
          <strong>Evidence link columns not found in Excel</strong>
          <span>Your file will still upload to OneDrive, but the cloud link can't be saved to your sightings table until you add these columns to <code>birds_sightings</code>:</span>
          <code class="nature-evidence-schema-warn-cols">${escapeHtml(missing.join(', '))}</code>
          <span>The filename will still be saved. Once the columns exist, the link will be stored on future sightings.</span>
        </div>
      </div>
    `;
  }

  function renderBirdLogOfflineStatus() {
    const el = document.getElementById('birdsLogOfflineStatus');
    if (!el) return;
    const localLogs = Array.isArray(state.sightingLog) ? state.sightingLog.length : 0;
    const syncPending = Array.isArray(state.syncQueue) ? state.syncQueue.length : 0;
    el.textContent = `Recent logs saved locally: ${localLogs} | Sync pending: ${syncPending}`;
  }

  function renderBirdLogHistoryCard() {
    const card = document.getElementById('birdsLogHistoryCard');
    const speciesSelect = document.getElementById('birdsLogSpeciesSelect');
    if (!card || !speciesSelect || !speciesSelect.value) {
      if (card) card.textContent = 'Pick a species to see your history and smart defaults.';
      return;
    }
    const bird = findBirdById(speciesSelect.value);
    const history = bird ? getBirdHistorySummary(bird) : null;
    if (!bird || !history || !history.count) {
      card.textContent = `No prior logs for ${bird ? bird.speciesName : 'this species'} yet.`;
      return;
    }
    const lastNote = history.notes && history.notes.length ? history.notes[history.notes.length - 1] : '';
    card.textContent = `First seen: ${history.firstSeen ? history.firstSeen.toLocaleDateString() : 'Unknown'} | Last seen: ${history.lastSeen ? history.lastSeen.toLocaleDateString() : 'Unknown'} | Total sightings: ${history.count}${history.topRegion ? ` | Top region: ${history.topRegion}` : ''}${history.topHabitat ? ` | Top habitat: ${history.topHabitat}` : ''}${lastNote ? ` | Last note: ${lastNote}` : ''}`;
  }

  function renderBirdLogPostSaveNudges(stats, familyLookup) {
    const row = document.getElementById('birdsLogPostSaveNudges');
    if (!row) return;
    if (!state.lastLoggedBirdId) {
      row.innerHTML = '';
      return;
    }
    const next = sortExplorerBirds(state.birds)
      .map((bird) => ({ bird, insight: getBirdExplorerInsight(bird, stats, familyLookup) }))
      .find((entry) => entry.bird.id !== state.lastLoggedBirdId && !entry.insight.seen);
    row.innerHTML = `
      <button type="button" class="nature-log-nudge-chip" data-birds-log-next-action="log-another">Log another in this family</button>
      ${next ? `<button type="button" class="nature-log-nudge-chip" data-birds-log-next-action="open-next" data-bird-open="${escapeHtml(next.bird.id)}">Open recommended next species</button>` : ''}
      <button type="button" class="nature-log-nudge-chip" data-birds-log-next-action="view-progress">View updated progress</button>
    `;
  }

  async function logSightingFromForm(mode = 'save') {
    const speciesSelect = document.getElementById('birdsLogSpeciesSelect');
    const dateInput = document.getElementById('birdsLogDateInput');
    const locationInput = document.getElementById('birdsLogLocationInput');
    const locationOtherInput = document.getElementById('birdsLogLocationOtherInput');
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
    const selectedLocation = locationInput ? String(locationInput.value || '').trim() : '';
    const otherLocation = locationOtherInput ? String(locationOtherInput.value || '').trim() : '';
    const locationName = selectedLocation === '__other__' ? otherLocation : selectedLocation;
    const count = Math.max(1, Number(countInput && countInput.value ? countInput.value : 1) || 1);
    const region = regionInput ? (regionInput.value || '').trim().toLowerCase() : '';
    const habitat = habitatInput ? (habitatInput.value || '').trim().toLowerCase() : '';
    const lat = latInput ? latInput.value : '';
    const lng = lngInput ? lngInput.value : '';
    const confidence = confidenceInput ? confidenceInput.value : 'certain';
    const notes = notesInput ? notesInput.value.trim() : '';

    const hasCoords = isValidLatLng(lat, lng);
    const photoFile = readAttachmentFile('birdsLogPhotoInput');
    const audioFile = readAttachmentFile('birdsLogAudioInput');

    const uploadErrors = [];
    let uploadedPhoto = null;
    let uploadedAudio = null;

    if (window.accessToken) {
      if (photoFile) {
        try {
          uploadedPhoto = await uploadEvidenceToOneDrive(photoFile, { subTabKey: state.activeSubTab, kind: 'photo' });
        } catch (error) {
          uploadErrors.push(`photo: ${error && error.message ? error.message : 'upload failed'}`);
        }
      }
      if (audioFile) {
        try {
          uploadedAudio = await uploadEvidenceToOneDrive(audioFile, { subTabKey: state.activeSubTab, kind: 'audio' });
        } catch (error) {
          uploadErrors.push(`audio: ${error && error.message ? error.message : 'upload failed'}`);
        }
      }
    } else if (photoFile || audioFile) {
      uploadErrors.push('media upload skipped: sign in to OneDrive to upload evidence files');
    }

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
      photoName: uploadedPhoto && uploadedPhoto.name ? uploadedPhoto.name : (photoFile && photoFile.name ? photoFile.name : ''),
      audioName: uploadedAudio && uploadedAudio.name ? uploadedAudio.name : (audioFile && audioFile.name ? audioFile.name : ''),
      photoUrl: uploadedPhoto && uploadedPhoto.webUrl ? uploadedPhoto.webUrl : '',
      audioUrl: uploadedAudio && uploadedAudio.webUrl ? uploadedAudio.webUrl : '',
      createdAt: new Date().toISOString(),
      synced: false
    };
    if (uploadErrors.length) {
      entry.evidenceUploadError = uploadErrors.join(' | ').slice(0, 500);
    }

    addSightingLogEntry(entry);
    setUndoAction({ type: 'log-sighting', entryId: entry.id, label: 'Logged sighting' });
    state.lastLoggedBirdId = selectedBird.id;
    state.logSuccessMessage = `Saved ${selectedBird.speciesName} for ${dateObserved}${locationName ? ` at ${locationName}` : ''}.`;
    if (typeof window.showToast === 'function') {
      window.showToast(`Logged sighting: ${selectedBird.speciesName}. Use Undo pill or press z.`, 'success', 2800);
      if (uploadErrors.length) {
        window.showToast('Saved sighting, but one or more media uploads did not complete.', 'info', 3200);
      }
    }

    const resetForNew = mode === 'save-new';
    if (resetForNew) {
      if (speciesSelect) speciesSelect.value = '';
      const speciesSearchInput = document.getElementById('birdsLogSpeciesSearchInput');
      if (speciesSearchInput) speciesSearchInput.value = '';
      if (locationInput) locationInput.value = '';
      if (locationOtherInput) {
        locationOtherInput.value = '';
        locationOtherInput.hidden = true;
      }
      if (notesInput) notesInput.value = '';
      if (countInput) countInput.value = '1';
      if (latInput) latInput.value = '';
      if (lngInput) lngInput.value = '';
      if (regionInput) regionInput.value = '';
      if (habitatInput) habitatInput.value = '';
    }
    const photoInput = document.getElementById('birdsLogPhotoInput');
    if (photoInput) photoInput.value = '';
    const audioInput = document.getElementById('birdsLogAudioInput');
    if (audioInput) audioInput.value = '';

    if (mode === 'save-open-next') {
      const root = document.getElementById('natureChallengeRoot');
      const stats = state.birdCollectionsCache && state.birdCollectionsCache.stats ? state.birdCollectionsCache.stats : getBirdStats();
      const familyLookup = buildFamilyProgressLookup(stats);
      const next = sortExplorerBirds(state.birds)
        .map((bird) => ({ bird, insight: getBirdExplorerInsight(bird, stats, familyLookup) }))
        .find((entry) => entry.bird.id !== selectedBird.id && !entry.insight.seen);
      if (next) {
        state.selectedBirdId = next.bird.id;
        setBirdView(root, 'detail');
      }
    }

    markRecentUpdatePulse();
    renderBirds();
    if (mode === 'save-new') clearBirdLogDraft();
    else saveBirdLogDraft();
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

    const totalRegionCount = new Set(allLogEntries.map((entry) => norm(entry.region)).filter(Boolean)).size;
    const totalHabitatCount = new Set(allLogEntries.map((entry) => norm(entry.habitat)).filter(Boolean)).size;
    const totalCertainLogCount = allLogEntries.filter((entry) => norm(entry.confidence) === 'certain').length;
    const evidenceLogCount = allLogEntries.filter((entry) => hasBirdLogEvidence(entry)).length;
    const seasonEvidenceLogCount = seasonalLogEntries.filter((entry) => hasBirdLogEvidence(entry)).length;
    const generaSightedCount = new Set(sightedBirds.map((bird) => norm(bird.genusLabel)).filter(Boolean)).size;
    const loggedSeasonCount = new Set(allLogEntries
      .map((entry) => getSeasonKeyForDate(parseObservedDate(entry.dateObserved || entry.createdAt)))
      .filter(Boolean)).size;

    const todayUniqueSpeciesCount = new Set(todayEntries.map((entry) => entry.speciesStatusKey).filter(Boolean)).size;
    const todayDistinctRegionCount = new Set(todayEntries.map((entry) => norm(entry.region)).filter(Boolean)).size;
    const todayDistinctHabitatCount = new Set(todayEntries.map((entry) => norm(entry.habitat)).filter(Boolean)).size;
    const todayCertainCount = todayEntries.filter((entry) => norm(entry.confidence) === 'certain').length;
    const todayEvidenceLogCount = todayEntries.filter((entry) => hasBirdLogEvidence(entry)).length;
    const todayFamilyMixCount = new Set(todayEntries.map((entry) => {
      const bird = findBirdById(entry.speciesId);
      return bird ? norm(bird.familyKey || bird.familyLabel) : '';
    }).filter(Boolean)).size;
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
      totalRegionCount,
      totalHabitatCount,
      totalCertainLogCount,
      evidenceLogCount,
      seasonEvidenceLogCount,
      generaSightedCount,
      loggedSeasonCount,
      seasonWindowKey: seasonWindow.key,
      todayLogCount: todayEntries.length,
      todayUniqueSpeciesCount,
      todayDistinctRegionCount,
      todayDistinctHabitatCount,
      todayCertainCount,
      todayEvidenceLogCount,
      todayFamilyMixCount,
      todayRareLogCount,
      seasonRegionCount,
      seasonHabitatCount,
      streak,
      familyProgress
    };
  }

  function getBirdChallenges(stats) {
    return sortProgressionCards((BIRD_PROGRESSION_SPEC.challengeDefs || []).map((definition) => toProgressionCard(definition, stats)));
  }

  function getBirdBadges(stats) {
    const badges = sortProgressionCards((BIRD_PROGRESSION_SPEC.badgeDefs || []).map((definition) => ({
      ...toProgressionCard(definition, stats),
      rarity: definition.rarity || 'common'
    })));

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
            const categoryLabel = getActiveCategoryLabel();
            const categorySingular = getActiveCategorySingularLabel();
            const categoryLower = categoryLabel.toLowerCase();
    const syncBadges = [
      document.getElementById('natureSyncHealthBadge'),
      document.getElementById('natureSyncHealthBadgeInline')
    ].filter(Boolean);
    const syncMetas = [
      document.getElementById('natureSyncMeta'),
      document.getElementById('natureSyncMetaInline')
    ].filter(Boolean);
    if (!syncBadges.length || !syncMetas.length) return;

    syncBadges.forEach((badge) => badge.classList.remove('ok', 'warn'));

    function formatSyncMetaTwoLines(text) {
      const raw = String(text || '').trim();
      if (!raw) return raw;
      if (raw.includes(' | Updated ')) return raw.replace(' | Updated ', '\nUpdated ');
      if (raw.includes(' | Source: ')) return raw.replace(' | Source: ', '\nSource: ');
      return raw;
    }

    function setStatus(badgeText, metaText, badgeClass) {
      syncBadges.forEach((badge) => {
        badge.textContent = badgeText;
        if (badgeClass) badge.classList.add(badgeClass);
      });
      syncMetas.forEach((meta) => {
        meta.textContent = formatSyncMetaTwoLines(metaText);
      });
    }

    if (state.birdsLoading) {
      setStatus(`${categorySingular} data: loading...`, `Refreshing ${categoryLower} species source...`, '');
      return;
    }

    if (state.birdsError && !state.birdsLoaded) {
      setStatus(`${categorySingular} data: unavailable`, state.birdsError, 'warn');
      return;
    }

    if (!state.birdsLoaded) {
      setStatus(`${categorySingular} data: waiting`, `${categoryLabel} dataset has not been loaded yet.`, '');
      return;
    }

    const badgeClass = state.birdsError ? 'warn' : 'ok';
    const badgeText = state.birdsError
      ? `${categorySingular} data: fallback in use`
      : `${categorySingular} data: ready`;
    const source = state.birdsSource ? `Source: ${state.birdsSource}` : 'Source: unknown';
    const updated = state.lastLoadedAt ? new Date(state.lastLoadedAt).toLocaleString() : '--';
    const warning = state.birdsError ? ` | ${state.birdsError}` : '';
    setStatus(badgeText, `${state.birds.length} species | ${source} | Updated ${updated}${warning}`, badgeClass);
    renderBirdSubtabDiagnostics();
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
    const steps = sortProgressionCards((BIRD_PROGRESSION_SPEC.seasonQuestDefs || []).map((definition) => toProgressionCard(definition, stats)));

    return {
      steps,
      completedCount: steps.filter((step) => step.completed).length
    };
  }

  function renderTierSectionHeader(item, options = {}) {
    if (!options.groupByTier || !item || !item.tierLabel) return '';
    const lane = options.pathState && item.tier ? options.pathState[item.tier] : null;
    const lockNote = lane && state.collectionPathMode && !lane.unlocked
      ? `<span class="nature-tier-header-note">Locked lane - ${escapeHtml(lane.lockHint || '')}</span>`
      : '';
    return `<div class="nature-tier-section-header">${escapeHtml(item.tierLabel)}${lockNote}</div>`;
  }

  function getPathLockClass(item, options = {}) {
    if (!state.collectionPathMode || !options.pathState || !item || !item.tier) return '';
    const lane = options.pathState[item.tier];
    if (!lane || lane.unlocked || item.completed) return '';
    return 'is-tier-locked';
  }

  function renderBirdChallenges(challenges, containerId = 'birdsChallengeGrid', options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!Array.isArray(challenges) || challenges.length === 0) {
      container.innerHTML = buildUnifiedStateHtml('No challenge cards match current overview filters.', { icon: '🎯', hint: 'Try clearing overview filter chips.' });
      return;
    }

    let previousTier = '';
    container.innerHTML = challenges.map((challenge) => {
      const tierKey = normalizeProgressionTier(challenge && challenge.tier);
      const header = previousTier !== tierKey ? renderTierSectionHeader(challenge, options) : '';
      previousTier = tierKey;
      return `${header}
      <div class="nature-challenge-card ${challenge.completed ? 'completed' : ''} ${getPathLockClass(challenge, options)} ${isRecentUpdateActive() ? 'is-recently-updated' : ''}">
        ${renderWhyShownBadge(challenge)}
        <div class="nature-challenge-card-header">${escapeHtml(formatProgressionHeading(challenge.icon, challenge.title))}</div>
        ${renderProgressionChipRow(challenge)}
        ${renderProgressionLearningCopy(challenge, options)}
        <div class="nature-challenge-card-description">${escapeHtml(challenge.description)}</div>
        <div class="nature-challenge-progress"><div class="nature-challenge-progress-fill" style="width:${challenge.pct}%;"></div></div>
        <div class="nature-challenge-meta"><span>${escapeHtml(formatProgressSummary(challenge).fraction)}</span><span>${escapeHtml(formatProgressSummary(challenge).status)}</span></div>
      </div>
    `;
    }).join('');
  }

  function renderBirdChallengesAndBadges(challenges, badges, containerId = 'birdsChallengesBadgesGrid', options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const challengeItems = Array.isArray(challenges) ? challenges : [];
    const badgeItems = Array.isArray(badges) ? badges : [];
    const items = challengeItems.map((challenge) => ({
      ...challenge,
      kind: 'challenge',
      kindLabel: 'Challenge',
      unlocked: Boolean(challenge.completed),
      rarityClass: 'nature-badge-card--challenge',
      summary: formatProgressSummary(challenge).summary,
      showRarity: false
    })).concat(badgeItems.map((badge) => ({
      ...badge,
      kind: 'badge',
      kindLabel: 'Badge',
      unlocked: Boolean(badge.completed),
      summary: formatProgressSummary(badge).summary,
      showRarity: true
    })));

    if (!items.length) {
      container.innerHTML = buildUnifiedStateHtml('No challenge or badge cards match current overview filters.', { icon: '🏅', hint: 'Try clearing overview filter chips.' });
      return;
    }

    let previousKind = '';
    let previousTier = '';
    container.innerHTML = items.map((item) => {
      const tierKey = normalizeProgressionTier(item && item.tier);
      const groupHeader = options.showKindHeaders !== false && previousKind !== item.kind
        ? `<div class="nature-achievement-group-heading">${escapeHtml(item.kind === 'challenge' ? 'Challenges' : 'Badges')}</div>`
        : '';
      const tierHeader = previousTier !== tierKey ? renderTierSectionHeader(item, options) : '';
      previousKind = item.kind;
      previousTier = tierKey;
      return `${groupHeader}${tierHeader}
      <div class="nature-badge-card ${item.unlocked ? 'unlocked' : 'locked'} ${getPathLockClass(item, options)} ${escapeHtml(item.rarityClass || '')} ${isRecentUpdateActive() ? 'is-recently-updated' : ''}">
        ${renderWhyShownBadge(item)}
        <div class="nature-badge-kind-pill nature-badge-kind-pill--${escapeHtml(item.kind)}">${escapeHtml(item.kindLabel)}</div>
        <div class="nature-badge-icon">${escapeHtml(item.icon || (item.kind === 'challenge' ? '🎯' : '🏅'))}</div>
        <div class="nature-badge-card-title">${escapeHtml(item.title)}</div>
        ${renderProgressionChipRow(item, { showRarity: item.showRarity })}
        ${renderProgressionLearningCopy(item, options)}
        <div class="nature-badge-card-description">${escapeHtml(item.description)}</div>
        <div class="nature-badge-progress">${escapeHtml(item.summary)}</div>
        <div class="nature-progress-track"><div class="nature-progress-fill" style="width:${item.pct}%;"></div></div>
      </div>`;
    }).join('');
  }

  function renderBirdBadges(badges, containerId = 'birdsBadgeGrid', options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!Array.isArray(badges) || badges.length === 0) {
      container.innerHTML = buildUnifiedStateHtml('No badge cards match current overview filters.', { icon: '🏅', hint: 'Try clearing overview filter chips.' });
      return;
    }

    let previousTier = '';
    container.innerHTML = badges.map((badge) => {
      const tierKey = normalizeProgressionTier(badge && badge.tier);
      const header = previousTier !== tierKey ? renderTierSectionHeader(badge, options) : '';
      previousTier = tierKey;
      return `${header}
      <div class="nature-badge-card ${badge.completed ? 'unlocked' : 'locked'} ${getPathLockClass(badge, options)} ${badge.rarityClass} ${isRecentUpdateActive() ? 'is-recently-updated' : ''}">
        ${renderWhyShownBadge(badge)}
        <div class="nature-badge-icon">${escapeHtml(badge.icon)}</div>
        <div class="nature-badge-card-title">${escapeHtml(badge.title)}</div>
        ${renderProgressionChipRow(badge, { showRarity: true })}
        ${renderProgressionLearningCopy(badge, options)}
        <div class="nature-badge-card-description">${escapeHtml(badge.description)}</div>
        <div class="nature-badge-progress">${escapeHtml(formatProgressSummary(badge).summary)}</div>
        <div class="nature-progress-track"><div class="nature-progress-fill" style="width:${badge.pct}%;"></div></div>
      </div>
    `;
    }).join('');
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
    const timelineMeta = document.getElementById('birdsLogTimelineMeta');
    const speciesSelect = document.getElementById('birdsLogSpeciesSelect');
    const speciesSearchInput = document.getElementById('birdsLogSpeciesSearchInput');
    const speciesSearchList = document.getElementById('birdsLogSpeciesSearchList');
    const commandInput = document.getElementById('birdsLogCommandInput');
    const intentRow = document.getElementById('birdsLogIntentChipRow');
    if (!banner || !trendStats || !timeline) return;

    if (speciesSelect) {
      const currentValue = speciesSelect.value;
      const options = state.birds.map((bird) => `<option value="${escapeHtml(bird.id)}">${escapeHtml(bird.speciesName)} (${escapeHtml(getFamilyChipLabel(bird.familyLabel))})</option>`).join('');
      speciesSelect.innerHTML = `<option value="">Select species...</option>${options}`;
      if (currentValue) speciesSelect.value = currentValue;
    }

    if (speciesSearchInput && speciesSearchList) {
      const currentBird = findBirdById(speciesSelect ? speciesSelect.value : '');
      if (currentBird && !speciesSearchInput.value) {
        speciesSearchInput.value = currentBird.speciesName;
      }
      const visibleOptions = getActiveSpeciesOptionsForLog()
        .slice(0, 400)
        .map((bird) => `<option value="${escapeHtml(bird.speciesName)}"></option>`)
        .join('');
      speciesSearchList.innerHTML = visibleOptions;
    }
    if (commandInput) commandInput.value = state.birdLogCommandValue || '';
    syncBirdLogLocationOptions();
    if (intentRow) {
      intentRow.innerHTML = getBirdLogIntentChipDefs(stats)
        .map((chip) => `<button type="button" class="nature-log-intent-chip" data-birds-log-intent="${escapeHtml(chip.key)}">${escapeHtml(chip.label)}</button>`)
        .join('');
    }

    const familyLookup = buildFamilyProgressLookup(stats);
    renderBirdLogRecommendationStrip(stats, familyLookup);
    renderBirdLogValidationBadges();
    renderBirdLogOfflineStatus();
    renderBirdLogHistoryCard();
    renderBirdImportPanel();
    renderBirdLogPostSaveNudges(stats, familyLookup);
    applyBirdLogPresetUi();

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
    if (timelineMeta) {
      const totalLogs = Array.isArray(state.sightingLog) ? state.sightingLog.length : 0;
      timelineMeta.textContent = totalLogs > 6
        ? `Showing latest 6 of ${totalLogs} logs. Use species history in the Entry Form for deeper history by species.`
        : `Showing ${totalLogs} total log${totalLogs === 1 ? '' : 's'}.`;
    }
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

    meta.textContent = `${stats.currentSeasonLabel} chapter: ${questline.completedCount}/${questline.steps.length} steps completed | ${formatTierBreakdown(questline.steps)}`;
    if (!Array.isArray(questline.steps) || questline.steps.length === 0) {
      container.innerHTML = buildUnifiedStateHtml('No seasonal quests match current overview filters.', { icon: '📚', hint: 'Try clearing overview filter chips.' });
      return;
    }
    let previousTier = '';
    container.innerHTML = questline.steps.map((step) => {
      const tierKey = normalizeProgressionTier(step && step.tier);
      const header = previousTier !== tierKey ? renderTierSectionHeader(step, options) : '';
      previousTier = tierKey;
      return `${header}
      <div class="nature-challenge-card ${step.completed ? 'completed' : ''} ${getPathLockClass(step, options)} ${isRecentUpdateActive() ? 'is-recently-updated' : ''}">
        ${renderWhyShownBadge(step)}
        <div class="nature-challenge-card-header">${escapeHtml(formatProgressionHeading(step.icon, step.title))}</div>
        ${renderProgressionChipRow(step)}
        ${renderProgressionLearningCopy(step, options)}
        <div class="nature-challenge-card-description">${escapeHtml(step.description)}</div>
        <div class="nature-challenge-progress"><div class="nature-challenge-progress-fill" style="width:${step.pct}%;"></div></div>
        <div class="nature-challenge-meta"><span>${escapeHtml(formatProgressSummary(step).fraction)}</span><span>${escapeHtml(formatProgressSummary(step).status)}</span></div>
      </div>
    `;
    }).join('');
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
            <div class="nature-explorer-section">
              <div class="nature-explorer-section-label">Status</div>
              <div class="nature-explorer-status-row">
                <span class="nature-explorer-status-pill ${sighted ? 'is-good' : 'is-alert'}">${sighted ? 'Seen' : 'Not seen'}</span>
                <span class="nature-explorer-status-pill ${insight.inSeason ? 'is-good' : ''}">${insight.inSeason ? 'In season now' : 'Out of season'}</span>
                <span class="nature-explorer-status-pill ${insight.recommended ? 'is-alert' : ''}">${insight.recommended ? 'Recommended' : 'Optional'}</span>
                <span class="nature-explorer-status-pill ${bird.rarity.weight >= RARITY_META.rare.weight ? 'is-rare' : ''}">${escapeHtml(bird.rarity.label)}</span>
              </div>
            </div>

            <div class="nature-explorer-section">
              <div class="nature-explorer-section-label">Tags and Seasons</div>
              <div class="nature-chip-row nature-chip-row--wrap">
                <span class="nature-chip ${bird.rarity.className}">${escapeHtml(bird.rarity.label)}</span>
                ${seasonChips}
              </div>
            </div>

            <div class="nature-explorer-section">
              <div class="nature-explorer-section-label">Sighting Snapshot</div>
              <div class="card-subtitle">${sighted ? `Sighted on ${escapeHtml(sightedDate ? sightedDate.toLocaleDateString() : '')}` : 'Not sighted yet'}</div>
            </div>

            <div class="nature-explorer-section">
              <div class="nature-explorer-section-label">Field Insight</div>
              <div class="nature-explorer-insight">Best habitat: ${escapeHtml(insight.bestHabitat)} | Best region: ${escapeHtml(insight.bestRegion)} | Quick ID cue: ${escapeHtml(idPointsFromBird(bird)[0])}</div>
            </div>

            <div class="nature-explorer-section">
              <div class="nature-explorer-section-label">Why this card appears</div>
              <div class="nature-why-showing-row">${whyReasonChips}</div>
            </div>
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
    const categoryLabel = getActiveCategoryLabel();
    const categoryLower = categoryLabel.toLowerCase();

    const bird = findBirdById(state.selectedBirdId);
    if (!bird) {
      container.innerHTML = `<div class="card">${buildUnifiedStateHtml(`No ${categoryLower} selected yet.`, { icon: '🧭', hint: `Go back to explorer and choose a ${categoryLower} card.` })}</div>`;
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
              <button type="button" id="birdsDetailBackToExplorerBtn" class="pill-button" ${tooltipAttrs(`Back to the ${categoryLower} explorer`)}>← Back to ${categoryLabel}</button>
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
    const controls = document.getElementById('birdsCollectionControls');
    if (!title || !subtitle || !meta || !grid) return;

    const key = ['challenges-badges', 'challenges', 'badges', 'quests', 'bingo'].includes(state.activeBirdCollection)
      ? state.activeBirdCollection
      : 'challenges-badges';
    const categoryLabel = getActiveCategoryLabel();
    const categorySingular = getActiveCategorySingularLabel();
    const categoryLower = categoryLabel.toLowerCase();
    const cache = state.birdCollectionsCache || {};
    const stats = cache.stats;

    if (!stats) {
      title.textContent = 'All Items';
      subtitle.textContent = `${categoryLabel} data is still loading.`;
      meta.textContent = `Collection data will appear after ${categoryLower} data loads.`;
      if (controls) {
        controls.hidden = true;
        controls.innerHTML = '';
      }
      grid.className = 'nature-challenge-grid';
      grid.innerHTML = buildUnifiedStateHtml(`${categoryLabel} data is still loading.`, { icon: '⏳' });
      return;
    }

    if (key === 'challenges-badges' || key === 'challenges' || key === 'badges') {
      const allChallenges = Array.isArray(cache.challenges) ? cache.challenges : [];
      const allBadges = Array.isArray(cache.badges) ? cache.badges : [];
      const tierFilter = getCollectionTierFilter();
      const challengeItems = filterAlmostCompleteCards(filterCardsByTier(allChallenges, tierFilter));
      const badgeItems = filterAlmostCompleteCards(filterCardsByTier(allBadges, tierFilter));
      const combined = allChallenges.concat(allBadges);
      const pathState = getCollectionTierPathState(combined);
      title.textContent = '🏅 Challenges & Badges';
      subtitle.textContent = state.collectionPathMode
        ? 'Tier path mode is on. Progress each lane to unlock deeper mastery content across challenge and badge cards.'
        : `See every ${categorySingular.toLowerCase()} challenge and badge in one achievement wall.`;
      meta.textContent = `${challengeItems.filter((item) => item.completed).length + badgeItems.filter((item) => item.completed).length}/${challengeItems.length + badgeItems.length} cards complete or unlocked | ${formatTierBreakdown(challengeItems.concat(badgeItems))}`;
      renderCollectionTierControls(combined, { pathToggleAllowed: true });
      grid.className = 'nature-badge-grid';
      renderBirdChallengesAndBadges(challengeItems, badgeItems, 'birdsCollectionGrid', {
        showLearning: true,
        groupByTier: tierFilter === 'all' && !state.collectionAlmostCompleteOnly,
        pathState,
        showKindHeaders: true
      });
      return;
    }

    if (key === 'quests') {
      const fullQuestline = cache.questline || { steps: [], completedCount: 0 };
      const tierFilter = getCollectionTierFilter();
      const tierSteps = filterCardsByTier(fullQuestline.steps || [], tierFilter);
      const steps = filterAlmostCompleteCards(tierSteps);
      const questline = {
        steps,
        completedCount: steps.filter((step) => step.completed).length
      };
      const pathState = getCollectionTierPathState(fullQuestline.steps || []);
      title.textContent = '📚 Seasonal Quests';
      subtitle.textContent = state.collectionPathMode
        ? 'Quest lanes now follow a game-like path. Clear earlier lanes to unlock the next lane.'
        : 'Follow every quest step for the current season chapter.';
      renderCollectionTierControls(fullQuestline.steps || [], { pathToggleAllowed: true });
      grid.className = 'nature-challenge-grid';
      renderSeasonQuestlinePanel(questline, stats, {
        containerId: 'birdsCollectionGrid',
        metaId: 'birdsCollectionMeta',
        showLearning: true,
        groupByTier: tierFilter === 'all' && !state.collectionAlmostCompleteOnly,
        pathState
      });
      return;
    }

    if (key === 'bingo') {
      const bingo = cache.bingo;
      title.textContent = `🟩 ${categoryLabel} Bingo`;
      subtitle.textContent = `View every seasonal ${categoryLower} bingo tile and current progress.`;
      if (controls) {
        controls.hidden = true;
        controls.innerHTML = '';
      }
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

  }

  function renderBirdError() {
    [
      'birdsDailyChallengeGrid',
      'birdsBingoGrid',
      'birdsSeasonQuestGrid',
      'birdsChallengesBadgesGrid',
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
      renderBirdSubtabDiagnostics();
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
      'challenges-badges': { shown: overviewChallenges.length + overviewBadges.length, total: challenges.length + badges.length },
      quests: { shown: overviewQuests.length, total: seasonQuestline.steps.length },
      bingo: { shown: overviewBingoTiles.length, total: bingo.tiles.length }
    });
    const summary = {
      dailyShown: dailyChallenges.length,
      dailyTotal: BIRD_PROGRESSION_SPEC.dailyPickCount || dailyChallenges.length,
      achievementShown: overviewChallenges.length + overviewBadges.length,
      achievementTotal: challenges.length + badges.length,
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
    renderBirdChallengesAndBadges(overviewChallenges, overviewBadges);
    renderBirdSubtabDiagnostics();
    renderBirdCollectionView();
    renderBirdExplorerList();
    renderBirdDetail();
  }

  function renderPlaceholderSubTabs() {
    SUBTAB_KEYS.filter((key) => key !== 'birds').forEach((key) => {
      const familyGrid = document.getElementById(`${key}FamilyGrid`);
      const challengeBadgeGrid = document.getElementById(`${key}ChallengeBadgeGrid`);
      const totalSpecies = document.getElementById(`${key}TotalSpecies`);

      if (isConfigDrivenSubTab(key)) {
        if (totalSpecies) totalSpecies.textContent = '...';
        [familyGrid, challengeBadgeGrid].forEach((el) => {
          if (el && !el.dataset.placeholderReady) {
            el.dataset.placeholderReady = '1';
            el.innerHTML = '<div class="nature-empty-state">Loading category configuration...</div>';
          }
        });
        return;
      }

      if (totalSpecies) totalSpecies.textContent = '0';
      [familyGrid, challengeBadgeGrid].forEach((el) => {
        if (el && !el.dataset.placeholderReady) {
          el.dataset.placeholderReady = '1';
          el.innerHTML = '<div class="nature-empty-state">Structure is ready. Species data, season logic, badges, and challenges can be added next.</div>';
        }
      });
    });
  }

  function getNatureSubTabDockElements() {
    return {
      row: document.getElementById('appSubTabsRow'),
      cutout: document.getElementById('appSubTabsCutout'),
      slot: document.getElementById('appSubTabsSlot')
    };
  }

  function getNatureSubTabsElement(root) {
    const docked = document.querySelector('#appSubTabsSlot .nature-challenge-subtabs');
    if (docked) return docked;
    return root ? root.querySelector('.nature-challenge-subtabs') : null;
  }

  function getNatureSubTabButtons(root) {
    const subTabs = getNatureSubTabsElement(root);
    return subTabs ? Array.from(subTabs.querySelectorAll('[data-nature-subtab]')) : [];
  }

  function isNatureSubTabLoading(subTabKey) {
    const key = String(subTabKey || '').trim();
    if (!key) return false;
    if (key === 'birds') return Boolean(state.birdsLoading);
    if (!isConfigDrivenSubTab(key)) return false;
    const subState = state.subTabData[key];
    return Boolean(subState && subState.loading);
  }

  function getNatureTitleLabel(rawLabel) {
    const text = String(rawLabel || '').trim().replace(/^[^A-Za-z0-9]+/, '').trim();
    return text || 'Birds';
  }

  function updateNatureChallengeTitle(root) {
    if (!root) return;
    const titleEl = root.querySelector('#natureChallengeTitle');
    if (!titleEl) return;
    const activeButton = getNatureSubTabButtons(root).find((button) => button.getAttribute('data-nature-subtab') === state.activeSubTab);
    const label = getNatureTitleLabel(activeButton ? activeButton.textContent : state.activeSubTab);
    titleEl.textContent = `Nature Challenge - ${label}`;
  }

  function getActiveCategoryLabel() {
    if (state.activeSubTab === 'birds') return 'Birds';
    const cfg = getSubTabConfig(state.activeSubTab);
    return cfg && cfg.label ? cfg.label : 'Birds';
  }

  function toCategorySingularLabel(pluralLabel) {
    const plural = String(pluralLabel || 'Birds').trim() || 'Birds';
    if (plural === 'Birds') return 'Bird';
    if (plural.endsWith('ies')) return `${plural.slice(0, -3)}y`;
    if (plural.endsWith('s')) return plural.slice(0, -1);
    return plural;
  }

  function getActiveCategorySingularLabel() {
    return toCategorySingularLabel(getActiveCategoryLabel());
  }

  function applyActiveCategoryUiLabels(root) {
    if (!root) return;
    const labelPlural = getActiveCategoryLabel();
    const labelSingular = getActiveCategorySingularLabel();

    const commandLabel = document.getElementById('birdsOverviewCommandLabel');
    if (commandLabel) commandLabel.textContent = `${labelPlural} command bar`;

    const commandInput = document.getElementById('birdsOverviewCommandInput');
    if (commandInput) {
      const placeholderNoun = labelPlural === 'Birds' ? 'bird' : labelSingular.toLowerCase();
      commandInput.placeholder = `Type a command (e.g., search ${placeholderNoun}, go badges, log)`;
      commandInput.setAttribute('aria-label', `${labelPlural} command bar`);
    }

    const logCommandInput = document.getElementById('birdsLogCommandInput');
    if (logCommandInput) {
      const example = getFastLogExampleForActiveSubTab();
      logCommandInput.placeholder = `Fast log command (e.g. ${example})`;
      logCommandInput.setAttribute('title', `Fast command for ${labelPlural} logs (e.g. ${example})`);
      logCommandInput.setAttribute('data-tooltip', `Fast command for ${labelPlural} logs (e.g. ${example})`);
    }

    const speciesSearchInput = document.getElementById('birdsLogSpeciesSearchInput');
    if (speciesSearchInput) {
      speciesSearchInput.setAttribute('aria-label', `${labelSingular} species`);
      speciesSearchInput.setAttribute('placeholder', `Select ${labelSingular.toLowerCase()}...`);
    }

    const backButtons = [
      document.getElementById('birdsLogBackBtn'),
      document.getElementById('birdsExplorerBackBtn'),
      document.getElementById('birdsDetailBackBtn'),
      document.getElementById('birdsCollectionBackBtn')
    ];
    backButtons.forEach((button) => {
      if (!button) return;
      button.textContent = `← Back to ${labelPlural}`;
      button.setAttribute('title', `Back to ${labelPlural} overview`);
      button.setAttribute('data-tooltip', `Back to ${labelPlural} overview`);
    });

    const diagnosticsHeading = document.getElementById('birdsDiagnosticsHeading');
    if (diagnosticsHeading) diagnosticsHeading.textContent = `🧰 ${labelPlural} Diagnostics, Sync and Clean Up`;

    const diagnosticsSummary = document.getElementById('birdsDiagnosticsSummaryHelp');
    if (diagnosticsSummary) diagnosticsSummary.textContent = `Quality tools and local/Excel sync controls. Expand this section to inspect ${labelPlural} diagnostics and repair tasks.`;

    const diagnosticsSummaryToggle = root.querySelector('#birdsDiagnosticsDetails > summary');
    if (diagnosticsSummaryToggle) {
      diagnosticsSummaryToggle.setAttribute('title', `Open ${labelPlural} diagnostics, sync, and clean up tools`);
      diagnosticsSummaryToggle.setAttribute('data-tooltip', `Open ${labelPlural} diagnostics, sync, and clean up tools`);
    }

    const bingoTitle = document.getElementById('birdsBingoSectionTitle');
    if (bingoTitle) bingoTitle.textContent = `🟩 ${labelPlural} Bingo`;

    const bingoSubtitle = document.getElementById('birdsBingoSectionSubtitle');
    if (bingoSubtitle) bingoSubtitle.textContent = `Complete seasonal bingo tiles for ${labelPlural.toLowerCase()} and reroll once per season.`;

    const syncBadgeInline = document.getElementById('natureSyncHealthBadgeInline');
    if (syncBadgeInline) syncBadgeInline.textContent = `${labelPlural} data: checking...`;
  }

  function persistConfigDrivenWorkspaceState(subTabKey) {
    if (!isConfigDrivenSubTab(subTabKey)) return;
    const subState = state.subTabData[subTabKey];
    if (!subState) return;
    subState.sightings = { ...(state.sightings || {}) };
    subState.favorites = Array.isArray(state.favorites) ? state.favorites.slice() : [];
    subState.sightingLog = Array.isArray(state.sightingLog) ? state.sightingLog.slice() : [];
    saveSubTabSightings(subTabKey, subState.sightings);
    saveSubTabFavorites(subTabKey, subState.favorites);
    saveSubTabSightingLog(subTabKey, subState.sightingLog);
  }

  function activateConfigDrivenWorkspaceState(subTabKey) {
    const subState = state.subTabData[subTabKey];
    if (!subState) return;
    state.birds = Array.isArray(subState.birds) ? subState.birds.slice() : [];
    state.families = Array.isArray(subState.families) ? subState.families.slice() : [];
    state.sightings = { ...(subState.sightings || {}) };
    state.favorites = Array.isArray(subState.favorites) ? subState.favorites.slice() : [];
    state.sightingLog = Array.isArray(subState.sightingLog) ? subState.sightingLog.slice() : [];
    state.birdsLoaded = true;
    state.birdsError = subState.error || '';
    state.birdsSource = subState.source || '';
  }

  function bindNatureSubTabDock(root, subTabs) {
    if (!root || !subTabs || subTabs.dataset.natureDockBound === '1') return;
    subTabs.dataset.natureDockBound = '1';

    subTabs.addEventListener('click', (event) => {
      const button = event.target.closest('[data-nature-subtab]');
      if (!button || !subTabs.contains(button)) return;
      event.preventDefault();
      setActiveNatureSubTab(root, button.getAttribute('data-nature-subtab'));
    });

    subTabs.addEventListener('keydown', (event) => {
      const button = event.target.closest('[data-nature-subtab]');
      if (!button || !subTabs.contains(button)) return;
      const buttons = getNatureSubTabButtons(root);
      if (!buttons.length) return;

      const currentIndex = buttons.indexOf(button);
      if (currentIndex < 0) return;

      let nextIndex = currentIndex;
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          nextIndex = (currentIndex + 1) % buttons.length;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = buttons.length - 1;
          break;
        default:
          return;
      }

      event.preventDefault();
      const nextButton = buttons[nextIndex];
      if (!nextButton) return;
      setActiveNatureSubTab(root, nextButton.getAttribute('data-nature-subtab'));
      nextButton.focus();
    });
  }

  function positionNatureSubTabDock() {
    const { row, cutout } = getNatureSubTabDockElements();
    if (!row || !cutout || row.hidden) return;

    const subTabs = document.querySelector('#appSubTabsSlot .nature-challenge-subtabs');
    if (!subTabs || subTabs.hidden || subTabs.getAttribute('aria-hidden') === 'true') return;

    const activePrimaryTab = document.querySelector('.app-tab-btn.active[data-tab="nature-challenge"]');
    if (!activePrimaryTab) return;

    const rowRect = row.getBoundingClientRect();
    const activeRect = activePrimaryTab.getBoundingClientRect();
    const cutoutWidth = Math.min(cutout.offsetWidth || 0, Math.max(rowRect.width - 8, 0));
    if (!rowRect.width || !cutoutWidth) {
      cutout.style.left = '50%';
      cutout.style.setProperty('--app-subtabs-pointer-left', '50%');
      return;
    }

    const preferredCenter = (activeRect.left - rowRect.left) + (activeRect.width / 2);
    const padding = 8;
    const minCenter = cutoutWidth / 2 + padding;
    const maxCenter = Math.max(rowRect.width - (cutoutWidth / 2) - padding, minCenter);
    const clampedCenter = Math.min(Math.max(preferredCenter, minCenter), maxCenter);
    cutout.style.left = `${clampedCenter}px`;

    // Keep the bubble within bounds, but let the pointer align to the true active tab center.
    const pointerMin = 14;
    const pointerMax = Math.max(cutoutWidth - 14, pointerMin);
    const pointerLeft = Math.min(
      Math.max((preferredCenter - clampedCenter) + (cutoutWidth / 2), pointerMin),
      pointerMax
    );
    cutout.style.setProperty('--app-subtabs-pointer-left', `${pointerLeft}px`);
  }

  function syncNatureSubTabDock(root) {
    const { row, slot } = getNatureSubTabDockElements();
    if (!row || !slot || !root) return;

    const subTabs = getNatureSubTabsElement(root);
    if (!subTabs) {
      const hasVisibleChild = Array.from(slot.children || []).some((child) => !child.hidden && child.getAttribute('aria-hidden') !== 'true');
      row.hidden = !hasVisibleChild;
      row.setAttribute('aria-hidden', hasVisibleChild ? 'false' : 'true');
      return;
    }

    const activePrimaryTab = document.querySelector('.app-tab-btn.active[data-tab]');
    const activeTabId = activePrimaryTab ? String(activePrimaryTab.getAttribute('data-tab') || '') : '';
    const shouldShow = activeTabId === 'nature-challenge';

    if (shouldShow && !slot.contains(subTabs)) {
      slot.appendChild(subTabs);
    }

    bindNatureSubTabDock(root, subTabs);

    if (shouldShow) {
      Array.from(slot.children || []).forEach((child) => {
        const isCurrent = child === subTabs;
        child.hidden = !isCurrent;
        child.setAttribute('aria-hidden', isCurrent ? 'false' : 'true');
      });
    } else {
      subTabs.hidden = true;
      subTabs.setAttribute('aria-hidden', 'true');
    }

    const hasVisibleChild = Array.from(slot.children || []).some((child) => !child.hidden && child.getAttribute('aria-hidden') !== 'true');
    row.hidden = !hasVisibleChild;
    row.setAttribute('aria-hidden', hasVisibleChild ? 'false' : 'true');

    if (!shouldShow) return;
    requestAnimationFrame(() => positionNatureSubTabDock());
  }

  function bindNaturePrimaryTabFallbackSync(root) {
    if (!root || root.dataset.naturePrimaryTabFallbackBound === '1') return;
    root.dataset.naturePrimaryTabFallbackBound = '1';

    const resync = () => {
      const liveRoot = document.getElementById('natureChallengeRoot');
      if (!liveRoot) return;
      syncNatureSubTabDock(liveRoot);
    };

    // Fallback: some legacy tab flows may not emit app:tab-switched.
    document.addEventListener('click', (event) => {
      const button = event.target && event.target.closest ? event.target.closest('.app-tab-btn[data-tab]') : null;
      if (!button) return;
      requestAnimationFrame(resync);
      window.setTimeout(resync, 40);
    }, true);

    window.addEventListener('pageshow', resync);
  }

  function syncNatureSubTabs(root) {
    if (!root) return;
    const activePaneKey = isConfigDrivenSubTab(state.activeSubTab) ? 'birds' : state.activeSubTab;

    getNatureSubTabButtons(root).forEach((button) => {
      const key = button.getAttribute('data-nature-subtab');
      const isActive = key === state.activeSubTab;
      const isLoading = isNatureSubTabLoading(key);
      button.classList.toggle('active', isActive);
      button.classList.toggle('is-loading', isLoading);
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
      button.setAttribute('tabindex', isActive ? '0' : '-1');
      button.setAttribute('aria-busy', isLoading ? 'true' : 'false');
    });

    root.querySelectorAll('[data-nature-pane]').forEach((pane) => {
      const key = pane.getAttribute('data-nature-pane');
      const isActive = key === activePaneKey;
      pane.classList.toggle('is-active', isActive);
      pane.hidden = !isActive;
      pane.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });

    updateNatureChallengeTitle(root);
    applyActiveCategoryUiLabels(root);

    syncNatureSubTabDock(root);
  }

  function announceNatureSubTab(root) {
    const announcer = document.getElementById('natureChallengeSubTabAnnouncer');
    if (!announcer || !root) return;
    const button = getNatureSubTabButtons(root).find((candidate) => candidate.getAttribute('data-nature-subtab') === state.activeSubTab);
    const label = button ? button.textContent.trim() : state.activeSubTab;
    announcer.textContent = isNatureSubTabLoading(state.activeSubTab)
      ? `${label} is loading...`
      : `${label} section active`;
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

  function forceUnblockNaturePane(root, reason) {
    if (!root) return;
    const pane = root.closest('.app-tab-pane[data-tab="nature-challenge"]');
    if (!pane) return;

    // Remove stale tab loader blockers that can sit on top of the tab surface.
    pane.classList.remove('tab-is-loading');
    const staleIndicators = pane.querySelectorAll('.tab-loading-indicator');
    staleIndicators.forEach((node) => node.remove());

    pane.style.setProperty('pointer-events', 'auto', 'important');
    root.style.setProperty('pointer-events', 'auto', 'important');

    if (isBirdConsoleTraceEnabled()) {
      emitBirdClickTrace('pane-unblocked', null, pane, {
        reason: String(reason || 'unknown'),
        staleIndicatorCount: staleIndicators.length
      });
    }
  }

  function diagnoseNatureButtonSurface(root) {
    if (!root || !isBirdConsoleTraceEnabled()) return;
    const ids = ['natureChallengeRefreshBtn', 'birdsExploreBtn', 'birdsOpenLogBtn', 'birdsOverviewCommandRunBtn'];
    ids.forEach((id) => {
      const button = document.getElementById(id);
      if (!button) return;
      const rect = button.getBoundingClientRect();
      if (!rect || rect.width < 4 || rect.height < 4) return;
      const x = rect.left + (rect.width / 2);
      const y = rect.top + (rect.height / 2);
      const topEl = document.elementFromPoint(x, y);
      const isReachable = Boolean(topEl && (topEl === button || button.contains(topEl)));
      if (isReachable) return;
      emitBirdClickTrace('surface-blocked', null, button, {
        buttonId: id,
        blockerTag: topEl && topEl.tagName ? String(topEl.tagName).toLowerCase() : '',
        blockerId: topEl && topEl.id ? String(topEl.id) : '',
        blockerClass: topEl && topEl.className ? String(topEl.className).slice(0, 120) : ''
      });
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
    if (state.activeBirdView === 'log') {
      const stats = state.birdCollectionsCache && state.birdCollectionsCache.stats ? state.birdCollectionsCache.stats : getBirdStats();
      renderBirdLogView(stats);
    }
    if (state.activeBirdView === 'detail') renderBirdDetail();
    if (state.activeBirdView === 'collection') renderBirdCollectionView();
    const restoreY = Number(state.birdViewScrollPositions[state.activeBirdView]) || 0;
    window.scrollTo({ top: restoreY, behavior: 'auto' });
  }

  async function setActiveNatureSubTab(root, key) {
    const previousSubTab = state.activeSubTab;
    const nextSubTab = SUBTAB_KEYS.includes(key) ? key : 'birds';
    const switchToken = ++state.subTabSwitchToken;
    const switchedSubTab = previousSubTab !== nextSubTab;

    if (previousSubTab && switchedSubTab) {
      persistConfigDrivenWorkspaceState(previousSubTab);
    }

    state.activeSubTab = nextSubTab;
    activePersistenceSubTab = getPersistenceSubTabKey(nextSubTab);

    // Immediately reflect selected subtab in UI so activation feels single-click responsive.
    syncNatureSubTabs(root);
    announceNatureSubTab(root);

    if (switchedSubTab && state.activeBirdView === 'detail') {
      state.activeBirdView = 'explorer';
      state.selectedBirdId = '';
    }

    if (state.activeSubTab !== 'birds') {
      if (isConfigDrivenSubTab(state.activeSubTab)) {
        await loadConfiguredSubTabDataset(state.activeSubTab, true);
        if (switchToken !== state.subTabSwitchToken) return;
        renderConfiguredSubTab(state.activeSubTab);
        activateConfigDrivenWorkspaceState(state.activeSubTab);
      }
    } else {
      state.sightings = loadSightings();
      state.favorites = loadFavorites();
      state.sightingLog = loadSightingLog();
      if (!state.birdsLoaded) await loadBirdDataset(false);
    }

    if (switchToken !== state.subTabSwitchToken) return;

    syncNatureSubTabs(root);
    announceNatureSubTab(root);
    syncBirdViews(root);
    renderBirds();

    if (state.activeBirdView === 'explorer' || state.activeBirdView === 'detail' || state.activeBirdView === 'collection') {
      renderBirdExplorerList();
    }
    if (state.activeBirdView === 'detail') renderBirdDetail();
    if (state.activeBirdView === 'collection') renderBirdCollectionView();
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
    '[data-birds-density]',
    '[data-birds-overview-jump]',
    '[data-nature-overview-jump]',
    '#birdsOverviewCommandClearBtn',
    '#birdsOverviewCommandRunBtn',
    '#birdsResetUiBtn',
    '#birdsClearClickDiagnosticsBtn',
    '#birdsCopyRecentClickTraceBtn',
    '#birdsDownloadRecentClickTraceBtn',
    '[data-birds-back-to-top]',
    '#birdsExplorerClearFiltersBtn',
    '#birdsExplorerClearChipFiltersBtn',
    '#birdsLogSaveNewBtn',
    '#birdsLogSaveOpenNextBtn',
    '#birdsLogCommandApplyBtn',
    '[data-birds-log-intent]',
    '[data-birds-log-prefill]',
    '[data-birds-log-preset]',
    '[data-birds-log-next-action]',
    '#birdsDetailLogSightingBtn',
    '#birdsDetailBackToExplorerBtn',
    '[data-birds-remove-filter]',
    '[data-birds-empty-action]',
    '[data-birds-more]',
    '[data-birds-collection-tier]',
    '#birdsCollectionAlmostCompleteToggleBtn',
    '#birdsCollectionPathToggleBtn',
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
    ensureNatureSubtabJumpLinks(root);
    installNatureButtonReliabilityObserver(root);
    ensureBirdClickDiagnosticsPanel(root);

    const handleDelegatedActivation = (event) => {
      const delegatedTarget = getDelegatedNatureActionTarget(root, event);
      if (!delegatedTarget) {
        emitBirdClickTrace('no-delegated-target', event, event && event.target ? event.target : null);
        return;
      }

      if (event.type === 'pointerup') {
        const pointerType = String(event.pointerType || '').toLowerCase();
        if (pointerType !== 'touch' && pointerType !== 'pen') return;
        if (event.isPrimary === false || Number(event.button) > 0) return;
        delegatedTarget.dataset.naturePointerHandledAt = String(Date.now());
        event.preventDefault();
        emitBirdClickTrace('pointerup-handled', event, delegatedTarget);
      }

      if (event.type === 'click') {
        const lastPointerHandledAt = Number(delegatedTarget.dataset.naturePointerHandledAt || 0);
        const dedupeAgeMs = lastPointerHandledAt ? (Date.now() - lastPointerHandledAt) : 0;
        if (lastPointerHandledAt && dedupeAgeMs < 700) {
          recordBirdClickDiagnostic(event.type, delegatedTarget, { deduped: true });
          emitBirdClickTrace('click-deduped', event, delegatedTarget, { dedupeAgeMs });
          delegatedTarget.removeAttribute('data-nature-pointer-handled-at');
          return;
        }
      }

      recordBirdClickDiagnostic(event.type, delegatedTarget);
      emitBirdClickTrace('delegated-target-resolved', event, delegatedTarget);
      window.__lastActionKey = getBirdDiagnosticActionKey(delegatedTarget);

      // ── Fail-closed disabled/aria-disabled/busy guard ───────────────────────
      // Applied once here so every branch below inherits the same contract.
      if (!isButtonActivatable(delegatedTarget)) {
        emitBirdClickTrace('guard-disabled', event, delegatedTarget);
        return;
      }
      // ────────────────────────────────────────────────────────────────────────

      const subTabButton = event.target.closest('[data-nature-subtab]');
      if (subTabButton) {
        ensureNatureButtonsResponsive(root);
        setActiveNatureSubTab(root, subTabButton.getAttribute('data-nature-subtab'));
        return;
      }

      const refreshButton = event.target.closest('#natureChallengeRefreshBtn');
      if (refreshButton) {
        withBirdsActionGuard(refreshButton, () => loadBirdDataset(true));
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
        withBirdsActionGuard(toggleButton, () => toggleBirdSighting(toggleButton.getAttribute('data-bird-toggle')));
        return;
      }

      const favoriteButton = event.target.closest('[data-bird-favorite]');
      if (favoriteButton) {
        withBirdsActionGuard(favoriteButton, () => toggleBirdFavorite(favoriteButton.getAttribute('data-bird-favorite')));
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

      const natureJumpButton = event.target.closest('[data-nature-overview-jump]');
      if (natureJumpButton) {
        const targetSubtab = String(natureJumpButton.getAttribute('data-nature-overview-subtab') || state.activeSubTab || 'birds').trim();
        const targetSection = String(natureJumpButton.getAttribute('data-nature-overview-jump') || 'categories').trim();
        if (targetSubtab && targetSubtab !== state.activeSubTab) {
          setActiveNatureSubTab(root, targetSubtab);
        }
        scrollToNatureOverviewSection(targetSubtab || state.activeSubTab, targetSection);
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

      const runCommandButton = event.target.closest('#birdsOverviewCommandRunBtn');
      if (runCommandButton) {
        const cmdInput = document.getElementById('birdsOverviewCommandInput');
        runBirdOverviewCommand(root, cmdInput ? (cmdInput.value || '') : '');
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

      const copyDiagnosticsButton = event.target.closest('#birdsCopyRecentClickTraceBtn');
      if (copyDiagnosticsButton) {
        withBirdsActionGuard(copyDiagnosticsButton, () => copyRecentBirdClickTraceJson());
        return;
      }

      const downloadDiagnosticsButton = event.target.closest('#birdsDownloadRecentClickTraceBtn');
      if (downloadDiagnosticsButton) {
        withBirdsActionGuard(downloadDiagnosticsButton, () => downloadRecentBirdClickTraceJson());
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

      const logSaveNewButton = event.target.closest('#birdsLogSaveNewBtn');
      if (logSaveNewButton) {
        withBirdsActionGuard(logSaveNewButton, () => logSightingFromForm('save-new'));
        return;
      }

      const logSaveOpenNextButton = event.target.closest('#birdsLogSaveOpenNextBtn');
      if (logSaveOpenNextButton) {
        withBirdsActionGuard(logSaveOpenNextButton, () => logSightingFromForm('save-open-next'));
        return;
      }

      const logCommandApplyButton = event.target.closest('#birdsLogCommandApplyBtn');
      if (logCommandApplyButton) {
        const commandInput = document.getElementById('birdsLogCommandInput');
        state.birdLogCommandValue = commandInput ? (commandInput.value || '').trim() : '';
        saveBirdUiPrefs();
        applyBirdLogCommand(state.birdLogCommandValue);
        return;
      }

      const logIntentChipButton = event.target.closest('[data-birds-log-intent]');
      if (logIntentChipButton) {
        applyBirdLogIntentChip(logIntentChipButton.getAttribute('data-birds-log-intent') || '');
        return;
      }

      const logPrefillButton = event.target.closest('[data-birds-log-prefill]');
      if (logPrefillButton) {
        const speciesId = logPrefillButton.getAttribute('data-birds-log-prefill') || '';
        const speciesSelect = document.getElementById('birdsLogSpeciesSelect');
        const speciesSearchInput = document.getElementById('birdsLogSpeciesSearchInput');
        if (speciesSelect && speciesId) speciesSelect.value = speciesId;
        const bird = findBirdById(speciesId);
        if (speciesSearchInput && bird) speciesSearchInput.value = bird.speciesName;
        applyBirdLogSpeciesDefaults(speciesId, { preferHistory: true });
        renderBirdLogValidationBadges();
        renderBirdLogHistoryCard();
        return;
      }

      const logPresetButton = event.target.closest('[data-birds-log-preset]');
      if (logPresetButton) {
        const preset = logPresetButton.getAttribute('data-birds-log-preset') || 'field-full';
        state.birdLogPreset = ['quick', 'field-full', 'evidence'].includes(preset) ? preset : 'field-full';
        saveBirdUiPrefs();
        applyBirdLogPresetUi();
        return;
      }

      const logNextActionButton = event.target.closest('[data-birds-log-next-action]');
      if (logNextActionButton) {
        const action = logNextActionButton.getAttribute('data-birds-log-next-action') || '';
        if (action === 'log-another') {
          const speciesSelect = document.getElementById('birdsLogSpeciesSelect');
          const speciesSearchInput = document.getElementById('birdsLogSpeciesSearchInput');
          if (speciesSelect) speciesSelect.value = '';
          if (speciesSearchInput) speciesSearchInput.value = '';
          renderBirdLogValidationBadges();
          renderBirdLogHistoryCard();
          return;
        }
        if (action === 'view-progress') {
          setBirdView(root, 'overview');
          return;
        }
        if (action === 'open-next') {
          const birdId = logNextActionButton.getAttribute('data-bird-open') || '';
          if (birdId) {
            state.selectedBirdId = birdId;
            setBirdView(root, 'detail');
          }
          return;
        }
      }

      const viewFullHistoryButton = event.target.closest('#birdsViewFullHistoryBtn');
      if (viewFullHistoryButton) {
        if (window.SightingMap && typeof window.SightingMap.open === 'function') {
          window.SightingMap.open();
        } else if (typeof window.showToast === 'function') {
          window.showToast('Map history is not available yet. Reload and try again.', 'info', 2600);
        }
        return;
      }

      const detailLogButton = event.target.closest('#birdsDetailLogSightingBtn');
      if (detailLogButton) {
        setBirdView(root, 'log');
        const speciesSelect = document.getElementById('birdsLogSpeciesSelect');
        const speciesSearchInput = document.getElementById('birdsLogSpeciesSearchInput');
        if (speciesSelect && state.selectedBirdId) speciesSelect.value = state.selectedBirdId;
        const selectedBird = findBirdById(state.selectedBirdId);
        if (speciesSearchInput && selectedBird) speciesSearchInput.value = selectedBird.speciesName;
        return;
      }

      const detailBackToExplorerButton = event.target.closest('#birdsDetailBackToExplorerBtn');
      if (detailBackToExplorerButton) {
        setBirdView(root, 'explorer');
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
        const requested = moreButton.getAttribute('data-birds-more') || 'challenges-badges';
        state.activeBirdCollection = (requested === 'challenges' || requested === 'badges') ? 'challenges-badges' : requested;
        setBirdView(root, 'collection');
        return;
      }

      const collectionTierButton = event.target.closest('[data-birds-collection-tier]');
      if (collectionTierButton) {
        state.collectionTierFilter = collectionTierButton.getAttribute('data-birds-collection-tier') || 'all';
        saveBirdUiPrefs();
        renderBirdCollectionView();
        return;
      }

      const almostCompleteToggleButton = event.target.closest('#birdsCollectionAlmostCompleteToggleBtn');
      if (almostCompleteToggleButton) {
        state.collectionAlmostCompleteOnly = !state.collectionAlmostCompleteOnly;
        saveBirdUiPrefs();
        renderBirdCollectionView();
        return;
      }

      const pathToggleButton = event.target.closest('#birdsCollectionPathToggleBtn');
      if (pathToggleButton) {
        state.collectionPathMode = !state.collectionPathMode;
        saveBirdUiPrefs();
        renderBirdCollectionView();
        return;
      }

      const conflictResolveButton = event.target.closest('[data-sync-resolve]');
      if (conflictResolveButton) {
        const conflictId = conflictResolveButton.getAttribute('data-conflict-id') || '';
        const strategy = conflictResolveButton.getAttribute('data-sync-resolve') || 'local';
        withBirdsActionGuard(conflictResolveButton, () => resolveSyncConflict(conflictId, strategy));
        return;
      }

      emitBirdClickTrace('action-unmatched', event, delegatedTarget);
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

    // Canonical routing policy:
    // Keep core Birds controls delegated-only (#natureChallengeRefreshBtn,
    // #birdsExploreBtn, #birdsOpenLogBtn, #birdsOverviewCommandRunBtn) so a
    // single click path owns activation/diagnostics/guard behavior.

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

    const overviewCommandInput = document.getElementById('birdsOverviewCommandInput');

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
      logSightingBtn.addEventListener('click', () => {
        withBirdsActionGuard(logSightingBtn, () => logSightingFromForm());
      });
    }

    const importParseBtn = document.getElementById('birdsImportParseBtn');
    if (importParseBtn && importParseBtn.dataset.natureImportParseBound !== '1') {
      importParseBtn.dataset.natureImportParseBound = '1';
      importParseBtn.addEventListener('click', () => {
        withBirdsActionGuard(importParseBtn, () => parseBirdImportInput());
      });
    }

    const importDryRunBtn = document.getElementById('birdsImportDryRunBtn');
    if (importDryRunBtn && importDryRunBtn.dataset.natureImportDryRunBound !== '1') {
      importDryRunBtn.dataset.natureImportDryRunBound = '1';
      importDryRunBtn.addEventListener('click', () => {
        withBirdsActionGuard(importDryRunBtn, () => executeBirdImport(true));
      });
    }

    const importApplyBtn = document.getElementById('birdsImportApplyBtn');
    if (importApplyBtn && importApplyBtn.dataset.natureImportApplyBound !== '1') {
      importApplyBtn.dataset.natureImportApplyBound = '1';
      importApplyBtn.addEventListener('click', () => {
        withBirdsActionGuard(importApplyBtn, () => executeBirdImport(false));
      });
    }

    const importMappingBtn = document.getElementById('birdsImportMappingBtn');
    if (importMappingBtn && importMappingBtn.dataset.natureImportMappingBound !== '1') {
      importMappingBtn.dataset.natureImportMappingBound = '1';
      importMappingBtn.addEventListener('click', () => {
        openBirdImportMappingModal();
      });
    }

    const importMappingCloseBtn = document.getElementById('birdsImportMappingCloseBtn');
    if (importMappingCloseBtn && importMappingCloseBtn.dataset.natureImportMappingCloseBound !== '1') {
      importMappingCloseBtn.dataset.natureImportMappingCloseBound = '1';
      importMappingCloseBtn.addEventListener('click', () => closeBirdImportMappingModal());
    }

    const importMappingBackdrop = document.getElementById('birdsImportMappingBackdrop');
    if (importMappingBackdrop && importMappingBackdrop.dataset.natureImportMappingBackdropBound !== '1') {
      importMappingBackdrop.dataset.natureImportMappingBackdropBound = '1';
      importMappingBackdrop.addEventListener('click', () => closeBirdImportMappingModal());
    }

    const importMappingBody = document.getElementById('birdsImportMappingBody');
    if (importMappingBody && importMappingBody.dataset.natureImportMappingBodyBound !== '1') {
      importMappingBody.dataset.natureImportMappingBodyBound = '1';
      importMappingBody.addEventListener('click', (event) => {
        const mapBtn = event.target.closest('[data-birds-import-map-row][data-birds-import-map-id]');
        if (!mapBtn) return;
        const rowIndex = mapBtn.getAttribute('data-birds-import-map-row');
        const birdId = mapBtn.getAttribute('data-birds-import-map-id');
        if (!applyBirdImportManualMatch(rowIndex, birdId)) return;
        renderBirdImportPanel();
        renderBirdImportMappingModal();
      });
    }

    const importFileInput = document.getElementById('birdsImportFileInput');
    if (importFileInput && importFileInput.dataset.natureImportFileBound !== '1') {
      importFileInput.dataset.natureImportFileBound = '1';
      importFileInput.addEventListener('change', () => {
        const pasteInput = document.getElementById('birdsImportPasteInput');
        if (pasteInput && importFileInput.files && importFileInput.files.length > 0 && String(pasteInput.value || '').trim()) {
          pasteInput.value = '';
        }
      });
    }

    const logSpeciesSelect = document.getElementById('birdsLogSpeciesSelect');
    if (logSpeciesSelect && logSpeciesSelect.dataset.natureLogSpeciesBound !== '1') {
      logSpeciesSelect.dataset.natureLogSpeciesBound = '1';
      logSpeciesSelect.addEventListener('change', () => {
        const speciesSearchInput = document.getElementById('birdsLogSpeciesSearchInput');
        const bird = findBirdById(logSpeciesSelect.value || '');
        if (speciesSearchInput) speciesSearchInput.value = bird ? bird.speciesName : '';
        applyBirdLogSpeciesDefaults(logSpeciesSelect.value || '', { preferHistory: true });
        renderBirdLogValidationBadges();
        renderBirdLogHistoryCard();
        saveBirdLogDraft();
      });
    }

    const logSpeciesSearchInput = document.getElementById('birdsLogSpeciesSearchInput');
    if (logSpeciesSearchInput && logSpeciesSearchInput.dataset.natureLogSpeciesSearchBound !== '1') {
      logSpeciesSearchInput.dataset.natureLogSpeciesSearchBound = '1';
      logSpeciesSearchInput.addEventListener('input', () => {
        state.birdLogSpeciesQuery = logSpeciesSearchInput.value || '';
        const resolvedId = resolveBirdIdFromLogSpeciesInput(logSpeciesSearchInput.value || '');
        if (logSpeciesSelect && resolvedId) {
          logSpeciesSelect.value = resolvedId;
          applyBirdLogSpeciesDefaults(resolvedId, { preferHistory: true });
        }
        renderBirdLogView(state.birdCollectionsCache && state.birdCollectionsCache.stats ? state.birdCollectionsCache.stats : getBirdStats());
        renderBirdLogValidationBadges();
        renderBirdLogHistoryCard();
        saveBirdLogDraft();
      });
      logSpeciesSearchInput.addEventListener('change', () => {
        const resolvedId = resolveBirdIdFromLogSpeciesInput(logSpeciesSearchInput.value || '');
        if (logSpeciesSelect) logSpeciesSelect.value = resolvedId || '';
        if (resolvedId) applyBirdLogSpeciesDefaults(resolvedId, { preferHistory: true });
        renderBirdLogValidationBadges();
        renderBirdLogHistoryCard();
        saveBirdLogDraft();
      });
    }

    const logCommandInput = document.getElementById('birdsLogCommandInput');
    if (logCommandInput && logCommandInput.dataset.natureLogCommandBound !== '1') {
      logCommandInput.dataset.natureLogCommandBound = '1';
      logCommandInput.addEventListener('input', () => {
        state.birdLogCommandValue = logCommandInput.value || '';
        saveBirdUiPrefs();
        saveBirdLogDraft();
      });
      logCommandInput.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;
        applyBirdLogCommand(logCommandInput.value || '');
      });
    }

    ['birdsLogDateInput', 'birdsLogLatInput', 'birdsLogLngInput', 'birdsLogRegionInput', 'birdsLogHabitatInput', 'birdsLogConfidenceInput', 'birdsLogLocationInput']
      .forEach((id) => {
        const el = document.getElementById(id);
        if (!el || el.dataset.natureLogValidationBound === '1') return;
        el.dataset.natureLogValidationBound = '1';
        el.addEventListener('change', () => {
          renderBirdLogValidationBadges();
          saveBirdLogDraft();
        });
      });

    ['birdsLogCountInput', 'birdsLogNotesInput', 'birdsLogLocationOtherInput']
      .forEach((id) => {
        const el = document.getElementById(id);
        if (!el || el.dataset.natureLogDraftBound === '1') return;
        el.dataset.natureLogDraftBound = '1';
        el.addEventListener('input', saveBirdLogDraft);
      });

    ['birdsLogPhotoInput', 'birdsLogAudioInput']
      .forEach((id) => {
        const el = document.getElementById(id);
        if (!el || el.dataset.natureLogEvidenceBound === '1') return;
        el.dataset.natureLogEvidenceBound = '1';
        el.addEventListener('change', () => renderBirdLogValidationBadges());
      });

    const locationSelect = document.getElementById('birdsLogLocationInput');
    const locationOtherInput = document.getElementById('birdsLogLocationOtherInput');
    if (locationSelect && locationSelect.dataset.natureLocationSelectBound !== '1') {
      locationSelect.dataset.natureLocationSelectBound = '1';
      locationSelect.addEventListener('change', () => {
        const isOther = locationSelect.value === '__other__';
        if (locationOtherInput) locationOtherInput.hidden = !isOther;
        if (!isOther && locationOtherInput) locationOtherInput.value = '';
        saveBirdLogDraft();
      });
    }

    ensureLocationOptionsLoaded().finally(() => syncBirdLogLocationOptions());

    restoreBirdLogDraft();

    const syncNowBtn = document.getElementById('birdsSyncNowBtn');
    if (syncNowBtn && syncNowBtn.dataset.natureSyncNowBound !== '1') {
      syncNowBtn.dataset.natureSyncNowBound = '1';
      syncNowBtn.addEventListener('click', () => processSyncQueue());
    }

    const workbookDiagnosticsBtn = document.getElementById('birdsWorkbookDiagnosticsBtn');
    if (workbookDiagnosticsBtn && workbookDiagnosticsBtn.dataset.natureWorkbookDiagBound !== '1') {
      workbookDiagnosticsBtn.dataset.natureWorkbookDiagBound = '1';
      workbookDiagnosticsBtn.addEventListener('click', () => {
        withBirdsActionGuard(workbookDiagnosticsBtn, async () => {
          const result = await runBirdWorkbookDiagnostics();
          if (typeof window.showToast === 'function') {
            const dataPath = result && result.data && result.data.candidateProbe
              ? result.data.candidateProbe.winningWorkbookPath
              : '';
            const syncPath = result && result.sync && result.sync.candidateProbe
              ? result.sync.candidateProbe.winningWorkbookPath
              : '';
            window.showToast(`Workbook diagnostics printed. Data: ${dataPath || 'not found'} | Sync: ${syncPath || 'not found'}`, 'info', 4200);
          }
        });
      });
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

    forceUnblockNaturePane(root, 'init');
    ensureNatureButtonsResponsive(root);
    ensureBirdClickDiagnosticsPanel(root);
    bindNatureControls(root);
    applyExplorerDensity(root);
    syncNatureSubTabDock(root);

    // ── Re-run button responsiveness every time the nature-challenge tab becomes ──
    // visible.  bindNatureControls only runs once (guard), but the tab may have been
    // preloaded while hidden, leaving stale overlay/z-index state.  This listener
    // fires on every tab switch and proactively clears any leftover loading overlay
    // and re-checks all buttons so clicks are reliable the moment the tab appears.
    if (!root.dataset.tabSwitchListenerBound) {
      root.dataset.tabSwitchListenerBound = '1';
      window.addEventListener('app:tab-switched', (event) => {
        const liveRoot = document.getElementById('natureChallengeRoot');
        if (!liveRoot) return;
        syncNatureSubTabDock(liveRoot);
        if (!event || !event.detail || event.detail.tabId !== 'nature-challenge') return;

        forceUnblockNaturePane(liveRoot, 'tab-switch');

        // 2. Re-run button responsiveness immediately and after the next paint.
        ensureNatureButtonsResponsive(liveRoot);
        ensureBirdClickDiagnosticsPanel(liveRoot);
        diagnoseNatureButtonSurface(liveRoot);
        requestAnimationFrame(() => {
          forceUnblockNaturePane(liveRoot, 'tab-switch-raf');
          ensureNatureButtonsResponsive(liveRoot);
          diagnoseNatureButtonSurface(liveRoot);
        });
      });
    }

    if (!root.dataset.natureSubTabDockResizeBound) {
      root.dataset.natureSubTabDockResizeBound = '1';
      window.addEventListener('resize', () => {
        const liveRoot = document.getElementById('natureChallengeRoot');
        if (!liveRoot) return;
        syncNatureSubTabDock(liveRoot);
      });
    }

    bindNaturePrimaryTabFallbackSync(root);

    if (!root.dataset.natureReliabilityWatchdogBound) {
      root.dataset.natureReliabilityWatchdogBound = '1';
      window.setInterval(() => {
        if (state.activeSubTab !== 'birds') return;
        const liveRoot = document.getElementById('natureChallengeRoot');
        if (!liveRoot) return;
        forceUnblockNaturePane(liveRoot, 'watchdog');
        ensureNatureButtonsResponsive(liveRoot);
      }, 1800);
    }

    const diagnostics = document.getElementById('birdsDiagnosticsDetails');
    if (diagnostics) diagnostics.open = false;
    const logDateInput = document.getElementById('birdsLogDateInput');
    if (logDateInput && !logDateInput.value) {
      logDateInput.value = new Date().toISOString().slice(0, 10);
    }
    renderPlaceholderSubTabs();
    syncBirdCommandInputFromState();
    setActiveNatureSubTab(root, state.activeSubTab || 'birds');
    setBirdView(root, state.activeBirdView || 'overview');
    renderBirdHeaderStatus();
    renderSyncStatusPanel();
    loadBirdDataset(false);
    pullBirdSyncStateFromRemote()
      .then(() => {
        renderBirds();
        renderSyncStatusPanel();
      })
      .catch((error) => {
        state.syncLastError = `Remote pull skipped: ${error && error.message ? error.message : 'unknown error'}`;
        renderSyncStatusPanel();
      });

    if (!state.initialized) {
      console.log('Nature Challenge tab initialized');
      state.initialized = true;
    }
  }

  window.initializeNatureChallengeTab = initializeNatureChallengeTab;
  window.initNatureChallengeTab = window.initNatureChallengeTab || initializeNatureChallengeTab;
  window.runBirdSyncNow = async function() {
    await processSyncQueue();
    return {
      pendingQueue: Array.isArray(state.syncQueue) ? state.syncQueue.length : 0,
      lastSyncSuccessAt: state.lastSyncSuccessAt || '',
      syncLastError: state.syncLastError || '',
      syncLastErrorCode: state.syncLastErrorCode || ''
    };
  };
  window.getRecentBirdClickTraceSnapshot = getRecentBirdClickTraceSnapshot;
  window.runBirdWorkbookDiagnostics = runBirdWorkbookDiagnostics;
  window.runNatureWorkbookDiagnostics = runNatureWorkbookDiagnostics;
  window.getNatureMapContext = function() {
    const selectedDockButtons = Array.from(document.querySelectorAll('#appSubTabsSlot .nature-challenge-subtabs [data-nature-subtab][aria-selected="true"]'));
    const selectedDockButton = selectedDockButtons.find((button) => {
      const host = button.closest('.nature-challenge-subtabs');
      if (!host || host.hidden || host.getAttribute('aria-hidden') === 'true') return false;
      return button.offsetParent !== null || button.getClientRects().length > 0;
    }) || selectedDockButtons[0] || null;
    const dockedSubTabKey = String(selectedDockButton && selectedDockButton.getAttribute('data-nature-subtab') || '').trim();
    const fallbackSubTabKey = String(state.activeSubTab || 'birds').trim() || 'birds';
    const subTabKey = SUBTAB_KEYS.includes(dockedSubTabKey) ? dockedSubTabKey : (SUBTAB_KEYS.includes(fallbackSubTabKey) ? fallbackSubTabKey : 'birds');
    const persistenceKey = getPersistenceSubTabKey(subTabKey);
    const keys = getSubTabStorageKeys(persistenceKey);
    const cfg = getSubTabConfig(subTabKey);
    const labelPlural = subTabKey === 'birds'
      ? 'Birds'
      : (cfg && cfg.label ? cfg.label : 'Birds');
    const fallbackLog = loadSubTabSightingLog(persistenceKey);
    const liveLog = persistenceKey === getPersistenceSubTabKey(activePersistenceSubTab)
      ? (Array.isArray(state.sightingLog) ? state.sightingLog.slice() : fallbackLog)
      : fallbackLog;
    return {
      subTabKey,
      labelPlural,
      labelSingular: toCategorySingularLabel(labelPlural),
      storageKey: keys.sightingLog,
      sightings: liveLog
    };
  };
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

