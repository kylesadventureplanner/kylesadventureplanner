/*
 * Adventure Challenge Tab System
 * Gamified progress tracking + smart suggestions for adventures.
 */

(function() {
  const STORAGE_KEY = 'visitedLocationsTrackerV1';
  const CHALLENGE_STATE_KEY = 'visitedLocationsChallengeStateV1';
  const VISITED_META_KEY = 'visitedLocationsMetaV1';
  const VISIT_RECORDS_KEY = 'visitedLocationRecordsV1';
  const EXPLORER_CARD_STATE_KEY = 'visitedExplorerCardStateV1';

  const CATEGORY_DEFS = [
    { key: 'hiking', label: 'Hiking Trails', icon: '🥾', keywords: ['hiking', 'trail', 'mountain', 'summit'] },
    { key: 'bike', label: 'Bike Trails', icon: '🚴', keywords: ['biking', 'bike', 'cycling', 'paved trail', 'gravel'] },
    { key: 'waterfall', label: 'Waterfalls', icon: '💧', keywords: ['waterfall', 'falls', 'cascade'] },
    { key: 'park', label: 'Parks', icon: '🌳', keywords: ['park', 'nature preserve', 'state park', 'national park'] },
    { key: 'scenic', label: 'Scenic Drives', icon: '🛣️', keywords: ['scenic drive', 'parkway', 'overlook', 'scenic'] },
    { key: 'coffee', label: 'Coffee Shops', icon: '☕', keywords: ['coffee', 'cafe', 'espresso', 'latte'] },
    { key: 'camping', label: 'Camping Spots', icon: '⛺', keywords: ['camp', 'campground', 'campsite', 'rv park'] },
    { key: 'lakes', label: 'Lakes and Rivers', icon: '🏞️', keywords: ['lake', 'river', 'reservoir', 'shore'] },
    { key: 'wildlife', label: 'Wildlife', icon: '🦉', keywords: ['wildlife', 'bird', 'sanctuary', 'zoo', 'rehabilitation'] }
  ];

  const CHALLENGES = [
    { id: 'hiking-rookie', icon: '🥾', title: 'Trail Rookie', category: 'hiking', goal: 5, points: 140, tip: 'Hit 5 hiking trails.' },
    { id: 'bike-blazer', icon: '🚴', title: 'Pedal Blazer', category: 'bike', goal: 5, points: 140, tip: 'Ride 5 bike trail spots.' },
    { id: 'waterfall-hunter', icon: '💧', title: 'Waterfall Hunter', category: 'waterfall', goal: 4, points: 120, tip: 'Visit 4 waterfall locations.' },
    { id: 'park-passport', icon: '🌳', title: 'Park Passport', category: 'park', goal: 6, points: 160, tip: 'Check off 6 parks.' },
    { id: 'road-tripper', icon: '🛣️', title: 'Road Tripper', category: 'scenic', goal: 4, points: 120, tip: 'Complete 4 scenic drives.' },
    { id: 'coffee-circuit', icon: '☕', title: 'Coffee Circuit', category: 'coffee', goal: 6, points: 160, tip: 'Try 6 coffee spots.' },
    { id: 'camp-setup', icon: '⛺', title: 'Camp Setup', category: 'camping', goal: 4, points: 150, tip: 'Log 4 camping destinations.' },
    { id: 'lake-loop', icon: '🏞️', title: 'Lake Loop', category: 'lakes', goal: 5, points: 150, tip: 'Visit 5 lakeside or riverside spots.' },
    { id: 'wildlife-spotter', icon: '🦉', title: 'Wildlife Spotter', category: 'wildlife', goal: 4, points: 150, tip: 'Visit 4 wildlife-focused locations.' },
    { id: 'well-rounded', icon: '🏆', title: 'Well Rounded Explorer', category: null, goal: 9, points: 260, tip: 'Visit at least one in every category.' },
    { id: 'triple-streak', icon: '🔥', title: 'Streak Starter', category: null, goal: 3, points: 180, tip: 'Visit places on 3 consecutive days.' }
  ];

  const WEATHER_PROFILES = {
    auto: { label: 'Auto (season-aware)', preferred: [] },
    sunny: { label: 'Sunny', preferred: ['hiking', 'scenic', 'waterfall', 'bike'] },
    rainy: { label: 'Rainy', preferred: ['coffee', 'scenic', 'park'] },
    cold: { label: 'Cold', preferred: ['coffee', 'scenic', 'park'] },
    hot: { label: 'Hot', preferred: ['waterfall', 'coffee', 'park'] },
    cloudy: { label: 'Cloudy', preferred: ['hiking', 'bike', 'scenic'] }
  };

  const BADGE_DEFS = [
    { id: 'first-checkin', icon: '🎯', title: 'First Check-In', rarity: 'common', points: 40, metric: 'visited', goal: 1, description: 'Mark your first visited location.' },
    { id: 'trail-mixer', icon: '🧩', title: 'Trail Mixer', rarity: 'rare', points: 90, metric: 'categoryCoverage', goal: 3, description: 'Visit at least 3 different categories.' },
    { id: 'state-hopper', icon: '🗺️', title: 'State Hopper', rarity: 'epic', points: 140, metric: 'states', goal: 3, description: 'Visit locations in 3 different states.' },
    { id: 'weekend-warrior', icon: '🌞', title: 'Weekend Warrior', rarity: 'rare', points: 120, metric: 'weekendVisits', goal: 5, description: 'Log 5 weekend adventures.' },
    { id: 'coffee-connoisseur', icon: '☕', title: 'Coffee Connoisseur', rarity: 'epic', points: 160, metric: 'category', category: 'coffee', goal: 8, description: 'Visit 8 coffee spots.' },
    { id: 'campfire-keeper', icon: '🔥', title: 'Campfire Keeper', rarity: 'rare', points: 110, metric: 'category', category: 'camping', goal: 4, description: 'Visit 4 camping destinations.' },
    { id: 'river-runner', icon: '🌊', title: 'River Runner', rarity: 'epic', points: 150, metric: 'category', category: 'lakes', goal: 5, description: 'Visit 5 lakes and river spots.' },
    { id: 'wildlife-guardian', icon: '🦉', title: 'Wildlife Guardian', rarity: 'epic', points: 150, metric: 'category', category: 'wildlife', goal: 4, description: 'Visit 4 wildlife-focused places.' },
    { id: 'trailblazer-25', icon: '🚩', title: 'Trailblazer 25', rarity: 'legendary', points: 260, metric: 'visited', goal: 25, description: 'Log 25 total visited locations.' },
    { id: 'all-terrain', icon: '🏅', title: 'All Terrain Master', rarity: 'legendary', points: 280, metric: 'categoryCoverage', goal: 9, description: 'Unlock every category at least once.' },
    { id: 'seven-day-flame', icon: '🔥', title: 'Seven Day Flame', rarity: 'legendary', points: 220, metric: 'streak', goal: 7, description: 'Reach a 7-day visit streak.' }
  ];

  const WEEKLY_QUEST_POOL = [
    { id: 'wk-three-visits', icon: '⚡', title: '3 Visits This Week', metric: 'visitsInPeriod', goal: 3, points: 80 },
    { id: 'wk-two-categories', icon: '🧭', title: '2 Categories This Week', metric: 'categoriesInPeriod', goal: 2, points: 90 },
    { id: 'wk-city-hop', icon: '🏙️', title: '3 Cities This Week', metric: 'citiesInPeriod', goal: 3, points: 95 },
    { id: 'wk-waterfall', icon: '💧', title: '1 Waterfall This Week', metric: 'categoryInPeriod', category: 'waterfall', goal: 1, points: 85 },
    { id: 'wk-coffee', icon: '☕', title: '2 Coffee Spots This Week', metric: 'categoryInPeriod', category: 'coffee', goal: 2, points: 85 }
  ];

  const MONTHLY_QUEST_POOL = [
    { id: 'mo-ten-visits', icon: '🏁', title: '10 Visits This Month', metric: 'visitsInPeriod', goal: 10, points: 180 },
    { id: 'mo-four-categories', icon: '🎨', title: '4 Categories This Month', metric: 'categoriesInPeriod', goal: 4, points: 200 },
    { id: 'mo-state-tour', icon: '🗺️', title: '2 States This Month', metric: 'statesInPeriod', goal: 2, points: 170 },
    { id: 'mo-scenic-pair', icon: '🛣️', title: '2 Scenic Drives This Month', metric: 'categoryInPeriod', category: 'scenic', goal: 2, points: 160 },
    { id: 'mo-bike-pack', icon: '🚴', title: '3 Bike Spots This Month', metric: 'categoryInPeriod', category: 'bike', goal: 3, points: 160 }
  ];

  const QUARTERLY_QUEST_POOL = [
    { id: 'qt-twenty-visits', icon: '🚀', title: '20 Visits This Quarter', metric: 'visitsInPeriod', goal: 20, points: 300 },
    { id: 'qt-six-categories', icon: '🧩', title: '6 Categories This Quarter', metric: 'categoriesInPeriod', goal: 6, points: 320 },
    { id: 'qt-three-states', icon: '🗺️', title: '3 States This Quarter', metric: 'statesInPeriod', goal: 3, points: 290 },
    { id: 'qt-park-pack', icon: '🌳', title: '4 Parks This Quarter', metric: 'categoryInPeriod', category: 'park', goal: 4, points: 280 },
    { id: 'qt-hiking-run', icon: '🥾', title: '5 Hiking Spots This Quarter', metric: 'categoryInPeriod', category: 'hiking', goal: 5, points: 290 }
  ];

  const YEARLY_QUEST_POOL = [
    { id: 'yr-fifty-visits', icon: '🏆', title: '50 Visits This Year', metric: 'visitsInPeriod', goal: 50, points: 700 },
    { id: 'yr-all-categories', icon: '🌈', title: 'All 9 Categories This Year', metric: 'categoriesInPeriod', goal: 9, points: 760 },
    { id: 'yr-five-states', icon: '🧭', title: '5 States This Year', metric: 'statesInPeriod', goal: 5, points: 680 },
    { id: 'yr-waterfall-chase', icon: '💧', title: '8 Waterfalls This Year', metric: 'categoryInPeriod', category: 'waterfall', goal: 8, points: 640 },
    { id: 'yr-bike-expedition', icon: '🚴', title: '10 Bike Spots This Year', metric: 'categoryInPeriod', category: 'bike', goal: 10, points: 660 }
  ];

  const LIFETIME_QUEST_POOL = [
    { id: 'lt-fifty-visits', icon: '⭐', title: '50 Lifetime Visits', metric: 'visitsInPeriod', goal: 50, points: 900 },
    { id: 'lt-hundred-visits', icon: '🌟', title: '100 Lifetime Visits', metric: 'visitsInPeriod', goal: 100, points: 1400 },
    { id: 'lt-all-categories', icon: '🧠', title: 'Master All Categories', metric: 'categoriesInPeriod', goal: 9, points: 1100 },
    { id: 'lt-ten-cities', icon: '🏙️', title: '10 Lifetime Cities', metric: 'citiesInPeriod', goal: 10, points: 980 },
    { id: 'lt-five-states', icon: '🗺️', title: '5 Lifetime States', metric: 'statesInPeriod', goal: 5, points: 1020 }
  ];

  const RARITY_STYLES = {
    common: { label: 'Common', className: 'rarity-common' },
    rare: { label: 'Rare', className: 'rarity-rare' },
    epic: { label: 'Epic', className: 'rarity-epic' },
    legendary: { label: 'Legendary', className: 'rarity-legendary' }
  };

  const CATALOG_INITIAL_LIMIT = 60;
  const CATALOG_LOAD_STEP = 40;
  const TOOLTIP_INFO_ICON_MIN_CHARS = 34;
  const PROGRESS_SUBTAB_KEYS = ['outdoors', 'entertainment', 'food-drink', 'retail', 'wildlife-animals', 'regional-festivals', 'bike-trails'];
  const PROGRESS_SUBTAB_STATUS_LABELS = {
    outdoors: 'Outdoors',
    entertainment: 'Entertainment',
    'food-drink': 'Food & Drink',
    retail: 'Retail',
    'wildlife-animals': 'Wildlife & Animals',
    'regional-festivals': 'Regional Festivals',
    'bike-trails': 'Bike Trails'
  };
  const PROGRESS_SUBTAB_EXPLORE_LABELS = {
    outdoors: 'Outdoors',
    entertainment: 'Entertainment',
    'food-drink': 'Food & Drink',
    retail: 'Retail',
    'wildlife-animals': 'Wildlife & Animal Locations',
    'regional-festivals': 'Regional Festivals',
    'bike-trails': 'Bike Trails'
  };
  const CITY_EXPLORER_PREFILTERS = {
    outdoors: { tag: 'hiking', label: 'Outdoors' },
    entertainment: { tag: 'entertainment', label: 'Entertainment' },
    'food-drink': { tag: 'restaurant', label: 'Food & Drink' },
    retail: { tag: 'retail', label: 'Retail' },
    'wildlife-animals': { tag: 'wildlife', label: 'Wildlife & Animals' },
    'regional-festivals': { tag: 'festival', label: 'Regional Festivals' },
    'bike-trails': { tag: 'bike', label: 'Bike Trails' }
  };
  // Prefer known Copilot workbook folders first to avoid predictable root-level 404 probe noise.
  const EXPLORER_WORKBOOK_PREFIXES = ['Copilot_Apps/Kyles_Adventure_Finder/', 'Copilot_Apps/Kyles_Adventure_Finder/Adventure Challenge/', ''];
  const VISIT_LOG_MEDIA_ROOT_DEFAULT = 'Copilot_Apps/Kyles_Adventure_Finder/Adventure Challenge/Visit_Photos';
  const VISIT_LOG_MEDIA_SUBTAB_FOLDERS = {
    outdoors: 'Outdoors',
    entertainment: 'Entertainment',
    'food-drink': 'Food_and_Drink',
    retail: 'Retail',
    'wildlife-animals': 'Wildlife_and_Animals',
    'regional-festivals': 'Regional_Festivals',
    'bike-trails': 'Bike_Trails'
  };
  const EXPLORER_COLUMN_CANDIDATES = {
    title: ['name', 'location', 'place', 'venue', 'destination', 'business', 'shop', 'restaurant', 'coffee', 'festival', 'event', 'site'],
    placeId: ['google place id', 'googleplaceid', 'place id', 'placeid'],
    city: ['city', 'town', 'municipality'],
    state: ['state', 'province', 'region'],
    tags: ['tags', 'keywords', 'category', 'categories', 'type'],
    description: ['description', 'notes', 'summary', 'details'],
    address: ['address', 'street', 'location address'],
    hours: ['hours', 'open hours', 'business hours'],
    drive: ['drive time', 'distance', 'travel time'],
    website: ['website', 'url', 'site', 'homepage'],
    phone: ['phone', 'phone number', 'telephone'],
    rating: ['google rating', 'rating'],
    cost: ['cost', 'price'],
    googleUrl: ['google url', 'maps url', 'google maps', 'google maps url']
  };
  const ADVENTURE_SUBTAB_EXPLORER_CONFIG = {
    outdoors: {
      key: 'outdoors',
      openAction: 'open-explorer-outdoors',
      closeAction: 'close-explorer-outdoors',
      emptyLabel: 'outdoor locations',
      sources: [
        { workbook: 'Nature_Locations.xlsx', table: 'Nature_Locations' }
      ]
    },
    entertainment: {
      key: 'entertainment',
      openAction: 'open-explorer-entertainment',
      closeAction: 'close-explorer-entertainment',
      emptyLabel: 'entertainment locations',
      sources: [
        { workbook: 'Entertainment_Locations.xlsx', table: 'General_Entertainment' }
      ]
    },
    'food-drink': {
      key: 'food-drink',
      openAction: 'open-explorer-food-drink',
      closeAction: 'close-explorer-food-drink',
      emptyLabel: 'food and drink locations',
      sources: [
        { workbook: 'Retail_Food_and_Drink.xlsx', table: 'Restaurants' },
        { workbook: 'Retail_Food_and_Drink.xlsx', table: 'Coffee' }
      ]
    },
    retail: {
      key: 'retail',
      openAction: 'open-explorer-retail',
      closeAction: 'close-explorer-retail',
      emptyLabel: 'retail locations',
      sources: [
        { workbook: 'Retail_Food_and_Drink.xlsx', table: 'Retail' }
      ]
    },
    'wildlife-animals': {
      key: 'wildlife-animals',
      openAction: 'open-explorer-wildlife-animals',
      closeAction: 'close-explorer-wildlife-animals',
      emptyLabel: 'wildlife and animal locations',
      sources: [
        { workbook: 'Entertainment_Locations.xlsx', table: 'Wildlife_Animals' }
      ]
    },
    'regional-festivals': {
      key: 'regional-festivals',
      openAction: 'open-explorer-regional-festivals',
      closeAction: 'close-explorer-regional-festivals',
      emptyLabel: 'regional festivals',
      sources: [
        { workbook: 'Entertainment_Locations.xlsx', table: 'Festivals' }
      ]
    }
  };

   const state = {
     initialized: false,
     activeProgressSubTab: 'outdoors',
     activeOverviewView: 'main',
     weatherMode: 'auto',
     searchText: '',
     categoryFilter: 'all',
     catalogVisitFilter: 'all',
     catalogSourceFilter: 'all',
     catalogRenderLimit: CATALOG_INITIAL_LIMIT,
     latestVisitMap: {},
     challengeState: {},
     metaState: {},
     latestLocations: [],
     isRefreshing: false,
     busyVisitToggles: new Set(),
     bikeLoadRequested: false,
     mobileTooltip: {
       pressTimerId: 0,
       hideTimerId: 0,
       chipHideTimerId: 0,
       longPressActive: false,
       suppressClickUntil: 0,
       targetEl: null,
       lastLongPressTarget: null,
       bubbleEl: null
     },
     loadingUiActive: false,
     subTabCheckTimerId: 0,
     lastSubTabBlockerLabel: '',
     tracerEnabled: Boolean(window.__visitedClickTrace),
     diagnosticsEnabled: Boolean(window.__visitedDiagnostics),
     tracerLastPointer: null,
     visitedColumnIndexCache: {
       adventure: null,
       bike: null
     },
      explorerColumnIndexCache: {},
     lastRenderAt: null,
     lastCategoryFilterClick: 0,
     categoryFilterDebounceMs: 100
      ,
      subtabExplorer: {},
       visitRecords: [],
       explorerCardState: {},
       visitLogLocationOptions: [],
       visitLogLocationQuery: ''
   };

  function shouldLogVisitedDiagnostics() {
    return Boolean(state.tracerEnabled || state.diagnosticsEnabled);
  }

  function logVisitedDiagnostics(...args) {
    if (!shouldLogVisitedDiagnostics()) return;
    console.log(...args);
  }

  function getVisitedSubTabDockElements() {
    return {
      row: document.getElementById('appSubTabsRow'),
      cutout: document.getElementById('appSubTabsCutout'),
      slot: document.getElementById('appSubTabsSlot')
    };
  }

  function getVisitedSubTabsElement(root) {
    const docked = document.querySelector('#appSubTabsSlot .visited-progress-subtabs');
    if (docked) return docked;
    return root ? root.querySelector('.visited-progress-subtabs') : null;
  }

  function getVisitedSubTabLabel(rawLabel) {
    const text = String(rawLabel || '').trim().replace(/^[^A-Za-z0-9]+/, '').trim();
    return text || 'Outdoors';
  }

  function updateVisitedChallengeTitle(root) {
    if (!root) return;
    const titleEl = root.querySelector('#visitedChallengeTitle');
    if (!titleEl) return;
    const active = PROGRESS_SUBTAB_KEYS.includes(state.activeProgressSubTab) ? state.activeProgressSubTab : 'outdoors';
    const activeButton = getProgressSubTabButtons(root).find((btn) => btn.getAttribute('data-progress-subtab') === active);
    const label = getVisitedSubTabLabel(activeButton ? activeButton.textContent : active);
    titleEl.textContent = `Adventure Challenge - ${label}`;
  }

  function updateVisitedSubTabRowVisibility(row, slot) {
    if (!row || !slot) return;
    const hasVisibleChild = Array.from(slot.children || []).some((child) => !child.hidden && child.getAttribute('aria-hidden') !== 'true');
    row.hidden = !hasVisibleChild;
    row.setAttribute('aria-hidden', hasVisibleChild ? 'false' : 'true');
  }

  function positionVisitedSubTabDock() {
    const { row, cutout } = getVisitedSubTabDockElements();
    if (!row || !cutout || row.hidden) return;

    const subTabs = document.querySelector('#appSubTabsSlot .visited-progress-subtabs');
    if (!subTabs || subTabs.hidden || subTabs.getAttribute('aria-hidden') === 'true') return;

    const activePrimaryTab = document.querySelector('.app-tab-btn.active[data-tab="visited-locations"]');
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

  function syncVisitedSubTabDock(root) {
    const { row, slot } = getVisitedSubTabDockElements();
    if (!row || !slot || !root) return;

    const subTabs = getVisitedSubTabsElement(root);
    if (!subTabs) {
      updateVisitedSubTabRowVisibility(row, slot);
      return;
    }

    const activePrimaryTab = document.querySelector('.app-tab-btn.active[data-tab]');
    const activeTabId = activePrimaryTab ? String(activePrimaryTab.getAttribute('data-tab') || '') : '';
    const shouldShow = activeTabId === 'visited-locations' && state.activeOverviewView !== 'suggestions';

    if (shouldShow && !slot.contains(subTabs)) {
      slot.appendChild(subTabs);
    }

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

    updateVisitedSubTabRowVisibility(row, slot);
    if (!shouldShow) return;
    requestAnimationFrame(() => positionVisitedSubTabDock());
  }

  function bindVisitedPrimaryTabFallbackSync(root) {
    if (!root || root.dataset.visitedPrimaryTabFallbackBound === '1') return;
    root.dataset.visitedPrimaryTabFallbackBound = '1';

    const resync = () => {
      const liveRoot = document.getElementById('visitedLocationsRoot');
      if (!liveRoot) return;
      syncVisitedSubTabDock(liveRoot);
    };

    document.addEventListener('click', (event) => {
      const button = event.target && event.target.closest ? event.target.closest('.app-tab-btn[data-tab]') : null;
      if (!button) return;
      requestAnimationFrame(resync);
      window.setTimeout(resync, 40);
    }, true);

    window.addEventListener('pageshow', resync);
  }

   function syncProgressSubTabs(root) {
     if (!root) return;
     const active = PROGRESS_SUBTAB_KEYS.includes(state.activeProgressSubTab) ? state.activeProgressSubTab : 'outdoors';

     getProgressSubTabButtons(root).forEach((btn) => {
       const tabKey = btn.getAttribute('data-progress-subtab');
       const isActive = tabKey === active;
       btn.classList.toggle('active', isActive);
       btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
       btn.setAttribute('tabindex', isActive ? '0' : '-1');
       // Defensive: keep subtab controls always hit-testable, even if another runtime pass mutates styles.
       btn.disabled = false;
       btn.style.pointerEvents = 'auto';
       btn.style.position = 'relative';
       btn.style.zIndex = '2501';
     });

     root.querySelectorAll('[data-progress-pane]').forEach((pane) => {
       const paneKey = pane.getAttribute('data-progress-pane');
       const isActive = paneKey === active;
       pane.classList.toggle('is-active', isActive);
       pane.hidden = !isActive;
       pane.setAttribute('aria-hidden', isActive ? 'false' : 'true');
       // CSS hidden attribute + display:none prevents interaction without aggressive pointer-events toggling
       // Avoid pointer-events: none to prevent race conditions during rapid tab switches
       pane.style.position = 'relative';
       pane.style.zIndex = isActive ? '1' : '0';
        if (getExplorerConfig(paneKey)) {
          setExplorerView(root, paneKey, getExplorerState(paneKey).view || 'overview');
        }
     });

      updateVisitedChallengeTitle(root);

      syncVisitedSubTabDock(root);

      // Run the canonical CTA order pass after pane/view sync updates.
      scheduleVisitedSubtabCtaOrderFinalization(root);
   }

  function announceProgressSubTab(root, tabKey) {
    if (!root) return;
    const announcer = document.getElementById('visitedSubTabAnnouncer');
    if (!announcer) return;
    const btn = getProgressSubTabButtons(root).find((candidate) => candidate.getAttribute('data-progress-subtab') === tabKey);
    const label = btn ? btn.textContent.trim() : 'Outdoors';
    announcer.textContent = `${label} section active`;
  }

  function setActiveProgressSubTab(root, tabKey) {
    if (state.activeOverviewView !== 'main') {
      state.activeOverviewView = 'main';
      syncVisitedOverviewView(root);
    }
    state.activeProgressSubTab = PROGRESS_SUBTAB_KEYS.includes(tabKey) ? tabKey : 'outdoors';
    syncProgressSubTabs(root);
    scheduleVisitedSubtabCtaOrderFinalization(root);
    announceProgressSubTab(root, state.activeProgressSubTab);
    scheduleVisitedSubTabInterceptionCheck(root, 0);
  }

  function jumpToVisitedSection(targetKey) {
    const key = PROGRESS_SUBTAB_KEYS.includes(state.activeProgressSubTab) ? state.activeProgressSubTab : 'outdoors';
    const target = String(targetKey || '').trim();
    const sectionIdByTarget = {
      categories: `achv-section-${key}-category-progression`,
      'challenges-badges': `achv-section-${key}-challenges-badges`,
      quests: `achv-section-${key}-seasonal-quests`,
      bingo: `achv-section-${key}-bingo`
    };

    let el = null;
    if (target === 'diagnostics') {
      const details = document.getElementById('visitedDiagnosticsDetails');
      if (details) {
        details.open = true;
        el = details;
      }
    } else {
      const sectionId = sectionIdByTarget[target] || '';
      if (sectionId) el = document.getElementById(sectionId);
    }
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (typeof el.focus === 'function') {
      el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
      window.setTimeout(() => el.removeAttribute('tabindex'), 700);
    }
  }

  function resolveInlinePageUrl(relativePath) {
    if (typeof window.resolvePlannerPageUrl === 'function') {
      return window.resolvePlannerPageUrl(relativePath);
    }
    return new URL(relativePath.replace(/ /g, '%20'), window.location.href).toString();
  }

  function ensureInlineSubtabToolView(root, subtabKey, type) {
    const pane = root ? root.querySelector(`#visitedProgressPane-${subtabKey}`) : null;
    if (!pane) return null;

    const viewKey = type === 'edit' ? 'edit-mode' : 'city-explorer';
    const title = type === 'edit' ? '📝 Edit Mode' : '🌆 City Explorer';
    const subtitle = type === 'edit'
      ? 'Manage records in Edit Mode without leaving Adventure Challenge.'
      : `City Explorer filtered for ${PROGRESS_SUBTAB_EXPLORE_LABELS[subtabKey] || 'Adventure'}.`;
    const closeAction = type === 'edit' ? `close-edit-mode-${subtabKey}` : `close-city-explorer-${subtabKey}`;
    const frameId = type === 'edit' ? `visitedEditModeFrame-${subtabKey}` : `visitedCityExplorerFrame-${subtabKey}`;
    let view = pane.querySelector(`[data-visited-subtab-view="${viewKey}"]`);
    if (view) return { view, frameId };

    view = document.createElement('div');
    view.className = 'visited-overview-view';
    view.setAttribute('data-visited-subtab-view', viewKey);
    view.hidden = true;
    view.setAttribute('aria-hidden', 'true');
    view.innerHTML = `
      <div class="card" style="margin-top: 10px;">
        <div class="visited-view-header-row">
          <button type="button" class="pill-button app-back-btn" data-visited-subtab-action="${escapeHtml(closeAction)}" title="Back to ${escapeHtml(PROGRESS_SUBTAB_EXPLORE_LABELS[subtabKey] || 'Adventure')}" data-tooltip="Back to ${escapeHtml(PROGRESS_SUBTAB_EXPLORE_LABELS[subtabKey] || 'Adventure')}">← Back to ${escapeHtml(PROGRESS_SUBTAB_EXPLORE_LABELS[subtabKey] || 'Adventure')}</button>
          <div class="visited-view-header-copy">
            <div class="card-title">${title}</div>
            <div class="card-subtitle">${escapeHtml(subtitle)}</div>
          </div>
        </div>
        <iframe id="${escapeHtml(frameId)}" class="visited-inline-tool-frame" title="${escapeHtml(title)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>
      </div>
    `;
    pane.appendChild(view);
    return { view, frameId };
  }

  async function openCityExplorerForSubtab(subtabKey) {
    const root = document.getElementById('visitedLocationsRoot');
    if (!root) return;
    const key = String(subtabKey || state.activeProgressSubTab || 'outdoors').trim();
    const filter = CITY_EXPLORER_PREFILTERS[key] || { tag: '', label: PROGRESS_SUBTAB_EXPLORE_LABELS[key] || 'Adventure' };

    if (state.activeOverviewView !== 'main') {
      state.activeOverviewView = 'main';
      syncVisitedOverviewView(root);
    }
    if (state.activeProgressSubTab !== key) {
      setActiveProgressSubTab(root, key);
    }

    const toolView = ensureInlineSubtabToolView(root, key, 'city');
    if (!toolView) return;
    const frame = document.getElementById(toolView.frameId);
    if (!frame) return;

    let preparedUrl = '';
    if (typeof window.prepareCityViewerInlineUrl === 'function') {
      preparedUrl = await window.prepareCityViewerInlineUrl({
        prefilterTag: filter.tag,
        prefilterLabel: filter.label,
        sourceSubtab: key
      });
    }
    if (!preparedUrl) {
      const fallbackUrl = new URL(resolveInlinePageUrl('HTML Files/city-viewer-window.html'));
      fallbackUrl.searchParams.set('embedded', '1');
      fallbackUrl.searchParams.set('dataMode', 'curated-only');
      if (filter.tag) fallbackUrl.searchParams.set('prefilterTag', filter.tag);
      if (filter.label) fallbackUrl.searchParams.set('prefilterLabel', filter.label);
      fallbackUrl.searchParams.set('sourceSubtab', key);
      fallbackUrl.searchParams.set('ts', String(Date.now()));
      preparedUrl = fallbackUrl.toString();
    }

    try {
      const prepared = new URL(preparedUrl, window.location.href);
      prepared.searchParams.set('embedded', '1');
      prepared.searchParams.set('sourceSubtab', key);
      preparedUrl = prepared.toString();
    } catch (_error) {
      // Keep prepared URL as-is if it cannot be normalized.
    }

    frame.src = preparedUrl;
    setExplorerView(root, key, 'city-explorer');
  }

  function openEditModeForSubtab(subtabKey) {
    const root = document.getElementById('visitedLocationsRoot');
    if (!root) return;
    const key = String(subtabKey || state.activeProgressSubTab || 'outdoors').trim();
    if (state.activeOverviewView !== 'main') {
      state.activeOverviewView = 'main';
      syncVisitedOverviewView(root);
    }
    if (state.activeProgressSubTab !== key) {
      setActiveProgressSubTab(root, key);
    }

    const toolView = ensureInlineSubtabToolView(root, key, 'edit');
    if (!toolView) return;
    const frame = document.getElementById(toolView.frameId);
    if (!frame) return;
    const editModeUrl = new URL(resolveInlinePageUrl('HTML Files/edit-mode-enhanced.html'));
    editModeUrl.searchParams.set('embedded', '1');
    editModeUrl.searchParams.set('sourceSubtab', key);
    editModeUrl.searchParams.set('ts', String(Date.now()));
    frame.src = editModeUrl.toString();
    setExplorerView(root, key, 'edit-mode');
  }

  function closeCityExplorerForSubtab(root, subtabKey) {
    setExplorerView(root, subtabKey, 'overview');
  }

  function closeEditModeForSubtab(root, subtabKey) {
    setExplorerView(root, subtabKey, 'overview');
  }

  function syncExploreActionButtons() {
    PROGRESS_SUBTAB_KEYS.forEach((subtabKey) => {
      const label = PROGRESS_SUBTAB_EXPLORE_LABELS[subtabKey] || 'Locations';
      const exploreAction = subtabKey === 'bike-trails' ? 'explore-bike-trails' : `open-explorer-${subtabKey}`;
      const cityAction = `open-city-explorer-${subtabKey}`;
      const editAction = `open-edit-mode-${subtabKey}`;
      const exploreBtn = document.querySelector(`[data-visited-subtab-action="${exploreAction}"]`);
      const cityBtn = document.querySelector(`[data-visited-subtab-action="${cityAction}"]`);
      const editBtn = document.querySelector(`[data-visited-subtab-action="${editAction}"]`);
      if (exploreBtn) {
        exploreBtn.classList.add('visited-subtab-action-btn--explore');
        exploreBtn.textContent = `🔎 Explore ${label}`;
        if (subtabKey === 'bike-trails') {
          const bikeCount = (state.latestLocations || []).filter((item) => item && item.sourceType === 'bike').length;
          exploreBtn.setAttribute('data-explore-count', bikeCount > 0 ? String(bikeCount) : '');
        } else {
          const explorerState = getExplorerState(subtabKey);
          const total = Array.isArray(explorerState.items) ? explorerState.items.length : 0;
          exploreBtn.setAttribute('data-explore-count', total > 0 ? String(total) : '');
        }
      }
      if (cityBtn) {
        cityBtn.classList.add('visited-subtab-action-btn--city');
        cityBtn.textContent = '🏙️ City Explorer';
        cityBtn.setAttribute('title', `Open City Explorer filtered for ${label}`);
        cityBtn.setAttribute('data-tooltip', `Open City Explorer filtered for ${label}`);
      }
      if (editBtn) {
        editBtn.classList.add('visited-subtab-action-btn--city');
        editBtn.textContent = '📝 Edit Mode';
        editBtn.setAttribute('title', `Open Edit Mode for ${label}`);
        editBtn.setAttribute('data-tooltip', `Open Edit Mode for ${label}`);
      }
    });

    const root = document.getElementById('visitedLocationsRoot');
    if (root) {
      scheduleVisitedSubtabCtaOrderFinalization(root);
    }
  }

  function isCtaNormalizationDebugEnabled() {
    return Boolean(window.navigator && window.navigator.webdriver);
  }

  function setVisitedCtaNormalizedMarker(row) {
    if (!row || !row.setAttribute) return;
    if (isCtaNormalizationDebugEnabled()) {
      row.setAttribute('data-cta-normalized', '1');
      return;
    }
    row.removeAttribute('data-cta-normalized');
  }

  function finalizeVisitedSubtabCtaOrder(root) {
    if (!root) return;
    normalizeVisitedSubtabActionRows(root);
    root.querySelectorAll('.visited-subtab-action-row').forEach((row) => {
      setVisitedCtaNormalizedMarker(row);
    });
  }

  function scheduleVisitedSubtabCtaOrderFinalization(root) {
    if (!root) return;
    root.querySelectorAll('.visited-subtab-action-row').forEach((row) => row.removeAttribute('data-cta-normalized'));
    if (root.__visitedCtaFinalizeRaf) {
      window.cancelAnimationFrame(root.__visitedCtaFinalizeRaf);
    }
    root.__visitedCtaFinalizeRaf = window.requestAnimationFrame(() => {
      root.__visitedCtaFinalizeRaf = 0;
      finalizeVisitedSubtabCtaOrder(root);
    });
  }

  function normalizeVisitedSubtabActionRows(root) {
    if (!root) return;
    const buildOrder = (subtabKey) => {
      if (subtabKey === 'bike-trails') {
        return [
          'explore-bike-trails',
          'open-city-explorer-bike-trails',
          'open-edit-mode-bike-trails',
          'refresh-subtab-bike-trails',
          'undo-subtab-bike-trails'
        ];
      }
      return [
        `open-explorer-${subtabKey}`,
        `open-city-explorer-${subtabKey}`,
        `open-visit-log-${subtabKey}`,
        `open-edit-mode-${subtabKey}`,
        `refresh-subtab-${subtabKey}`,
        `undo-subtab-${subtabKey}`
      ];
    };

    PROGRESS_SUBTAB_KEYS.forEach((subtabKey) => {
      const pane = root.querySelector(`#visitedProgressPane-${subtabKey}`);
      if (!pane) return;
      const row = pane.querySelector('.visited-subtab-action-row');
      if (!row) return;
      buildOrder(subtabKey).forEach((action, idx) => {
        const button = pane.querySelector(`[data-visited-subtab-action="${action}"]`);
        if (!button) return;
        row.appendChild(button);
        if (button.style && typeof button.style.setProperty === 'function') {
          button.style.setProperty('order', String(idx), 'important');
        } else if (button.style) {
          button.style.order = String(idx);
        }
      });
    });
  }

  function syncVisitedOverviewView(root) {
    const scope = root || document.getElementById('visitedLocationsRoot');
    if (!scope) return;
    const suggestionsView = scope.querySelector('#visitedSuggestionsView');
    const mainView = scope.querySelector('#visitedOverviewMainView');
    const subtabBar = getVisitedSubTabsElement(scope);
    const outdoorsPane = scope.querySelector('[data-progress-pane="outdoors"]');

    const isSuggestions = state.activeOverviewView === 'suggestions';

    if (mainView) mainView.hidden = isSuggestions;
    if (suggestionsView) suggestionsView.hidden = !isSuggestions;
    if (subtabBar) subtabBar.hidden = isSuggestions;

    if (outdoorsPane && isSuggestions) {
      scope.querySelectorAll('[data-progress-pane]').forEach((pane) => {
        const isOutdoors = pane === outdoorsPane;
        pane.classList.toggle('is-active', isOutdoors);
        pane.hidden = !isOutdoors;
        pane.setAttribute('aria-hidden', isOutdoors ? 'false' : 'true');
      });
    }

    syncProgressSubTabs(scope);
    if (!isSuggestions) announceProgressSubTab(scope, state.activeProgressSubTab);
  }

  function setVisitedOverviewView(root, viewKey) {
    state.activeOverviewView = viewKey === 'suggestions' ? 'suggestions' : 'main';
    if (state.activeOverviewView === 'suggestions') {
      state.activeProgressSubTab = 'outdoors';
    }
    syncVisitedOverviewView(root);
  }

  function getElementDebugLabel(el) {
    if (!el) return '(unknown)';
    if (el.id) return `#${el.id}`;
    if (el.classList && el.classList.length) return `.${el.classList[0]}`;
    return String(el.tagName || 'element').toLowerCase();
  }

  function setVisitedSubTabBlockerWarning(message) {
    const warningEl = document.getElementById('visitedSubTabBlockerWarning');
    if (!warningEl) return;
    if (!message) {
      warningEl.hidden = true;
      warningEl.textContent = '';
      return;
    }
    warningEl.textContent = message;
    warningEl.hidden = false;
  }

  function findVisitedSubTabBlockingElement(root) {
    if (!root || !root.isConnected) return null;
    const buttons = getProgressSubTabButtons(root);
    for (const btn of buttons) {
      const rect = btn.getBoundingClientRect();
      if (rect.width < 6 || rect.height < 6) continue;
      const x = Math.round(rect.left + (rect.width / 2));
      const y = Math.round(rect.top + (rect.height / 2));
      const topEl = document.elementFromPoint(x, y);
      if (!topEl) continue;
      if (topEl === btn || btn.contains(topEl)) continue;
      const sameTabBtn = topEl.closest ? topEl.closest('[data-progress-subtab]') : null;
      if (sameTabBtn === btn) continue;
      return topEl;
    }
    return null;
  }

  function isVisitedProgressUiVisible(root) {
    if (!root || !root.isConnected) return false;
    const pane = root.closest('.app-tab-pane');
    if (pane && !pane.classList.contains('active')) return false;
    const subtabs = getVisitedSubTabsElement(root);
    if (!subtabs) return false;
    const dockRow = document.getElementById('appSubTabsRow');
    const surface = dockRow && dockRow.contains(subtabs) ? dockRow : subtabs;
    const cs = window.getComputedStyle(surface);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
    const rect = surface.getBoundingClientRect();
    return rect.width > 8 && rect.height > 8;
  }

  function isPointerBlockingElement(el) {
    if (!el) return false;
    const cs = window.getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
    return cs.pointerEvents !== 'none';
  }

  function isExpectedGlobalBlocker(el) {
    if (!el || !el.closest) return false;
    return Boolean(el.closest('#loadingOverlay, #rowDetailModal, #rowDetailModalBackdrop'));
  }

  function checkVisitedSubTabInterception(root) {
    if (!isVisitedProgressUiVisible(root)) {
      state.lastSubTabBlockerLabel = '';
      setVisitedSubTabBlockerWarning('');
      return;
    }

    const blocker = findVisitedSubTabBlockingElement(root);
    if (!blocker) {
      state.lastSubTabBlockerLabel = '';
      setVisitedSubTabBlockerWarning('');
      return;
    }

    if (!isPointerBlockingElement(blocker) || isExpectedGlobalBlocker(blocker)) {
      state.lastSubTabBlockerLabel = '';
      setVisitedSubTabBlockerWarning('');
      return;
    }

    const blockerLabel = getElementDebugLabel(blocker);
    if (state.lastSubTabBlockerLabel !== blockerLabel) {
      console.warn(`[visited] Subtab clicks may be blocked by ${blockerLabel}`, blocker);
      state.lastSubTabBlockerLabel = blockerLabel;
    }

    setVisitedSubTabBlockerWarning(`Heads up: subtab clicks may be blocked by ${blockerLabel}.`);
  }

  function scheduleVisitedSubTabInterceptionCheck(root, delayMs) {
    if (!root) return;
    if (state.subTabCheckTimerId) {
      clearTimeout(state.subTabCheckTimerId);
      state.subTabCheckTimerId = 0;
    }
    const wait = Math.max(0, Number(delayMs) || 0);
    state.subTabCheckTimerId = window.setTimeout(() => {
      state.subTabCheckTimerId = 0;
      checkVisitedSubTabInterception(root);
    }, wait);
  }

  function getTraceLabel(el) {
    if (!el) return '(none)';
    const tag = String(el.tagName || 'el').toLowerCase();
    const id = el.id ? `#${el.id}` : '';
    const cls = el.classList && el.classList.length ? `.${Array.from(el.classList).slice(0, 2).join('.')}` : '';
    return `${tag}${id}${cls}`;
  }

  function isTraceCandidateTarget(target) {
    if (!target || !target.closest) return false;
    return Boolean(target.closest('button, [role="button"], .quick-filter-btn, .card-btn, [data-visit-action], [data-progress-subtab]'));
  }

  function getClosestEventTarget(event, selector) {
    const rawTarget = event && event.target ? event.target : null;
    const elementTarget = rawTarget && rawTarget.nodeType === Node.ELEMENT_NODE
      ? rawTarget
      : (rawTarget && rawTarget.parentElement ? rawTarget.parentElement : null);
    if (!elementTarget || typeof elementTarget.closest !== 'function') return null;
    return elementTarget.closest(selector);
  }

  function installVisitedClickTracer(root) {
    if (!root || root.dataset.visitedClickTracerBound === '1') return;
    root.dataset.visitedClickTracerBound = '1';

    root.addEventListener('pointerdown', (event) => {
      if (!state.tracerEnabled) return;
      if (!isTraceCandidateTarget(event.target)) return;
      const topAtPoint = document.elementFromPoint(event.clientX, event.clientY);
      state.tracerLastPointer = {
        x: event.clientX,
        y: event.clientY,
        target: event.target,
        topAtPoint,
        ts: Date.now()
      };

      const targetBtn = getClosestEventTarget(event, 'button, [role="button"], .quick-filter-btn, .card-btn, [data-visit-action], [data-progress-subtab]');
      const topBtn = topAtPoint && topAtPoint.closest
        ? topAtPoint.closest('button, [role="button"], .quick-filter-btn, .card-btn, [data-visit-action], [data-progress-subtab]')
        : null;
      if (targetBtn && topBtn && targetBtn !== topBtn && !targetBtn.contains(topBtn)) {
        console.warn('[visited-trace] pointerdown blocker mismatch', {
          target: getTraceLabel(targetBtn),
          topAtPoint: getTraceLabel(topBtn),
          rawTopAtPoint: getTraceLabel(topAtPoint)
        });
      }
    }, true);

    root.addEventListener('click', (event) => {
      if (!state.tracerEnabled) return;
      if (!isTraceCandidateTarget(event.target)) return;

      const targetBtn = getClosestEventTarget(event, 'button, [role="button"], .quick-filter-btn, .card-btn, [data-visit-action], [data-progress-subtab]');
      if (!targetBtn) return;

      const topAtPoint = document.elementFromPoint(event.clientX, event.clientY);
      const topBtn = topAtPoint && topAtPoint.closest
        ? topAtPoint.closest('button, [role="button"], .quick-filter-btn, .card-btn, [data-visit-action], [data-progress-subtab]')
        : null;

      const blockedByTopMismatch = Boolean(topBtn && topBtn !== targetBtn && !targetBtn.contains(topBtn));
      const blockedByDefaultPrevented = event.defaultPrevented;
      if (!blockedByTopMismatch && !blockedByDefaultPrevented) return;

      console.warn('[visited-trace] click anomaly detected', {
        target: getTraceLabel(targetBtn),
        topAtPoint: getTraceLabel(topBtn || topAtPoint),
        defaultPrevented: event.defaultPrevented,
        pointer: state.tracerLastPointer
          ? {
              target: getTraceLabel(state.tracerLastPointer.target),
              topAtPoint: getTraceLabel(state.tracerLastPointer.topAtPoint),
              ageMs: Date.now() - state.tracerLastPointer.ts
            }
          : null,
        path: event.composedPath ? event.composedPath().slice(0, 8).map(getTraceLabel) : []
      });
    }, true);
  }

  function getMobileTooltipLongPressMs() {
    const appConfig = (((window.APP_UI_LABELS || {}).visitedProgress || {}).mobileTooltip || {});
    const raw = Number(appConfig.longPressMs);
    if (!Number.isFinite(raw)) return 420;
    return Math.max(250, Math.min(1000, Math.round(raw)));
  }

  function applyTooltipInfoIcons(scope) {
    const root = scope || document;
    const targets = root.querySelectorAll('button[data-tooltip], .quick-filter-btn[data-tooltip], .card-btn[data-tooltip]');
    targets.forEach((btn) => {
      const tooltipText = String(btn.getAttribute('data-tooltip') || '').trim();
      if (tooltipText.length < TOOLTIP_INFO_ICON_MIN_CHARS) return;
      if (btn.querySelector('.visited-tooltip-info')) return;
      const marker = document.createElement('span');
      marker.className = 'visited-tooltip-info';
      marker.setAttribute('aria-hidden', 'true');
      marker.textContent = 'i';
      btn.appendChild(marker);
    });
  }

  function formatRelativeTime(isoText) {
    if (!isoText) return 'just now';
    const date = new Date(isoText);
    if (Number.isNaN(date.getTime())) return 'just now';
    const diffMs = Math.max(0, Date.now() - date.getTime());
    const sec = Math.floor(diffMs / 1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  function getPendingUnsyncedCount(visitMap) {
    const map = visitMap || state.latestVisitMap || {};
    return Object.values(map).filter((entry) => entry && entry.synced === false).length;
  }

  function ensureVisitedHeaderSyncIndicatorStyles() {
    if (document.getElementById('visitedHeaderSyncIndicatorStyles')) return;
    const style = document.createElement('style');
    style.id = 'visitedHeaderSyncIndicatorStyles';
    style.textContent = `
      #visitedHeaderSyncIndicator { display:inline-flex; align-items:center; gap:8px; }
      #visitedHeaderSyncStatus { font-size:12px; font-weight:800; border-radius:999px; padding:6px 10px; border:1px solid #d1d5db; background:#f8fafc; color:#334155; }
      #visitedHeaderSyncStatus.is-pending { border-color:#fca5a5; background:#fef2f2; color:#991b1b; }
      #visitedHeaderSyncStatus.is-ok { border-color:#86efac; background:#ecfdf5; color:#166534; }
      #visitedHeaderSyncRetryBtn.is-flashing { animation: visitedSyncPulse 1.1s ease-in-out infinite; }
      @keyframes visitedSyncPulse { 0% { box-shadow:0 0 0 0 rgba(239,68,68,0.35); } 70% { box-shadow:0 0 0 10px rgba(239,68,68,0); } 100% { box-shadow:0 0 0 0 rgba(239,68,68,0); } }
    `;
    document.head.appendChild(style);
  }

  function ensureVisitedHeaderSyncIndicator() {
    ensureVisitedHeaderSyncIndicatorStyles();
    const row = document.querySelector('.app-header .header-actions-row');
    if (!row) return null;
    let host = document.getElementById('visitedHeaderSyncIndicator');
    if (!host) {
      host = document.createElement('div');
      host.id = 'visitedHeaderSyncIndicator';
      host.innerHTML = `
        <span id="visitedHeaderSyncStatus" class="is-ok" aria-live="polite">All Changes Synced</span>
        <button id="visitedHeaderSyncRetryBtn" type="button" class="auth-btn" title="Retry publishing pending local changes">Retry Sync</button>
      `;
      const signInBtn = row.querySelector('#signInBtn');
      if (signInBtn) row.insertBefore(host, signInBtn);
      else row.appendChild(host);
    }
    const retryBtn = host.querySelector('#visitedHeaderSyncRetryBtn');
    if (retryBtn && retryBtn.dataset.bound !== '1') {
      retryBtn.dataset.bound = '1';
      retryBtn.addEventListener('click', async () => {
        await retryPendingLocalWrites(retryBtn);
      });
    }
    return host;
  }

  function renderVisitedHeaderSyncIndicator(visitMap) {
    const host = ensureVisitedHeaderSyncIndicator();
    if (!host) return;
    const statusChip = host.querySelector('#visitedHeaderSyncStatus');
    const retryBtn = host.querySelector('#visitedHeaderSyncRetryBtn');
    if (!statusChip || !retryBtn) return;
    const pending = getPendingUnsyncedCount(visitMap);
    statusChip.classList.remove('is-pending', 'is-ok');
    if (pending > 0) {
      statusChip.classList.add('is-pending');
      statusChip.textContent = `Unsynced: ${pending}`;
      retryBtn.disabled = false;
      retryBtn.classList.add('is-flashing');
    } else {
      statusChip.classList.add('is-ok');
      statusChip.textContent = 'All Changes Synced';
      retryBtn.disabled = true;
      retryBtn.classList.remove('is-flashing');
    }
  }

  function renderSyncMeta(visitMap) {
    const el = document.getElementById('visitedSyncMeta');
    if (!el) return;
    const map = visitMap || state.latestVisitMap || {};
    const pending = getPendingUnsyncedCount(map);
    const sourceCounts = (state.latestLocations || []).reduce((acc, item) => {
      const key = item && item.sourceType === 'bike' ? 'bike' : 'adventure';
      acc[key] += 1;
      return acc;
    }, { adventure: 0, bike: 0 });
    const since = formatRelativeTime(state.lastRenderAt);
    el.textContent = `Last synced: ${since} • Pending local-only: ${pending} • Sources: ${sourceCounts.adventure} adv / ${sourceCounts.bike} bike`;
    renderVisitedHeaderSyncIndicator(map);
  }

  function getSubtabStatusSourceSummary(subtabKey, explorerState) {
    if (subtabKey === 'bike-trails') return 'Bike Trails workspace';
    const items = explorerState && Array.isArray(explorerState.items) ? explorerState.items : [];
    const itemSources = Array.from(new Set(items.map((item) => String(item && item.sourceLabel ? item.sourceLabel : '').trim()).filter(Boolean)));
    if (itemSources.length) return itemSources.slice(0, 2).join(' + ');
    const cfg = getExplorerConfig(subtabKey);
    if (!cfg || !Array.isArray(cfg.sources) || !cfg.sources.length) return 'unknown';
    return cfg.sources.slice(0, 2).map((source) => `${source.workbook} / ${source.table}`).join(' + ');
  }

  function renderVisitedSubtabStatusBar(el, options) {
    if (!el) return;
    const badgeText = options && options.badgeText ? String(options.badgeText) : 'Adventure data: waiting';
    const metaText = options && options.metaText ? String(options.metaText) : '';
    const tone = options && options.tone ? String(options.tone) : '';
    let health = el.querySelector('.visited-subtab-status-health');
    let meta = el.querySelector('.visited-subtab-status-meta');

    if (!health || !meta) {
      el.innerHTML = '<span class="visited-subtab-status-health"></span><span class="visited-subtab-status-meta"></span>';
      health = el.querySelector('.visited-subtab-status-health');
      meta = el.querySelector('.visited-subtab-status-meta');
    }

    el.classList.remove('is-ok', 'is-warn');
    if (tone === 'ok') el.classList.add('is-ok');
    if (tone === 'warn') el.classList.add('is-warn');

    const formattedMetaText = String(metaText || '').includes(' | Updated ')
      ? String(metaText).replace(' | Updated ', '\nUpdated ')
      : String(metaText || '').includes(' | Source: ')
        ? String(metaText).replace(' | Source: ', '\nSource: ')
        : String(metaText || '');

    if (health) health.textContent = badgeText;
    if (meta) meta.textContent = formattedMetaText;
  }

  function ensureVisitedSubtabStatusHost(subtabKey, label) {
    const pane = document.getElementById(`visitedProgressPane-${subtabKey}`);
    if (!pane) return null;

    let host = document.getElementById(`visitedSubtabStatus-${subtabKey}`);
    if (!host) {
      const empty = pane.querySelector('.visited-empty') || pane.querySelector('.card');
      if (!empty) return null;
      host = document.createElement('div');
      host.id = `visitedSubtabStatus-${subtabKey}`;
      host.className = 'visited-subtab-status ui-status-stack';
      host.setAttribute('aria-live', 'polite');
      empty.insertBefore(host, empty.firstChild || null);
    }

    let health = host.querySelector('.visited-subtab-status-health');
    let meta = host.querySelector('.visited-subtab-status-meta');
    if (!health || !meta) {
      host.innerHTML = '<span class="visited-subtab-status-health ui-status-pill"></span><span class="visited-subtab-status-meta ui-status-meta"></span>';
      health = host.querySelector('.visited-subtab-status-health');
      meta = host.querySelector('.visited-subtab-status-meta');
    }

    if (health && !health.textContent.trim()) {
      health.textContent = `${label} data: waiting...`;
    }
    if (meta && !meta.textContent.trim()) {
      meta.textContent = `Status updates will appear here while ${label} loads.`;
    }

    return host;
  }

  function renderSubtabStatusBars() {
    const signedIn = Boolean(window.accessToken);
    PROGRESS_SUBTAB_KEYS.forEach((subtabKey) => {
      const label = PROGRESS_SUBTAB_STATUS_LABELS[subtabKey] || 'Adventure';
      const el = ensureVisitedSubtabStatusHost(subtabKey, label);
      if (!el) return;

      if (subtabKey === 'bike-trails') {
        const updatedText = state.lastRenderAt ? new Date(state.lastRenderAt).toLocaleString() : '--';
        renderVisitedSubtabStatusBar(el, {
          badgeText: `${label} data: ready`,
          metaText: `Linked workspace | Source: Bike Trails workspace | Updated ${updatedText} | Use Explore Bike Trails to open the full bike workspace.`,
          tone: 'ok'
        });
        return;
      }

      const explorerState = getExplorerState(subtabKey);
      const total = Array.isArray(explorerState.items) ? explorerState.items.length : 0;
      const sourceSummary = getSubtabStatusSourceSummary(subtabKey, explorerState);
      const updatedAt = explorerState.updatedAt || state.lastRenderAt || '';
      const updatedText = updatedAt ? new Date(updatedAt).toLocaleString() : '--';
      let badgeText = `${label} data: waiting`;
      let metaText = `Status updates will appear here while ${label} loads.`;
      let tone = '';

      if (!signedIn) {
        badgeText = `${label} data: sign-in required`;
        metaText = 'Use Sign In, then refresh this tab.';
        tone = 'warn';
      } else if (explorerState.loading) {
        badgeText = `${label} data: loading...`;
        metaText = `Refreshing ${label.toLowerCase()} locations...`;
      } else if (explorerState.error) {
        badgeText = `${label} data: fallback in use`;
        metaText = `${total} locations | Source: ${sourceSummary} | Updated ${updatedText} | ${explorerState.error}`;
        tone = 'warn';
      } else if (explorerState.loaded) {
        badgeText = `${label} data: ready`;
        metaText = `${total} locations | Source: ${sourceSummary} | Updated ${updatedText}`;
        tone = 'ok';
      }

      renderVisitedSubtabStatusBar(el, {
        badgeText,
        metaText,
        tone
      });
    });
    syncExploreActionButtons();
  }

  function renderLoadingState() {
    if (state.loadingUiActive) return;
    state.loadingUiActive = true;

    const skeleton = '<div class="visited-skeleton-stack"><div class="visited-skeleton-block"></div><div class="visited-skeleton-block short"></div><div class="visited-skeleton-block"></div></div>';

    const placeholders = {
      visitedSummaryStats: skeleton,
      visitedCategoryGrid: `${skeleton}${skeleton}`,
      visitedSuggestionList: `${skeleton}${skeleton}`,
      visitedRecentList: skeleton,
      visitedChallengeGrid: `${skeleton}${skeleton}`,
      visitedBadgeGallery: `${skeleton}${skeleton}`,
      visitedWeeklyQuestPanel: skeleton,
      visitedMonthlyQuestPanel: skeleton,
      visitedQuarterlyQuestPanel: skeleton,
      visitedYearlyQuestPanel: skeleton,
      visitedLifetimeQuestPanel: skeleton,
      visitedHeatmapHotspots: skeleton,
      visitedAdventureCatalog: `${skeleton}${skeleton}`
    };

    Object.entries(placeholders).forEach(([id, html]) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    });

    const dataStatus = document.getElementById('visitedDataStatus');
    if (dataStatus) dataStatus.textContent = 'Refreshing Adventure Challenge data...';
  }

  function clearLoadingState() {
    state.loadingUiActive = false;
  }

  function isTouchPrimaryInput() {
    if (typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(hover: none)').matches;
  }

  function getTooltipTextFromElement(el) {
    if (!el) return '';
    const value = el.getAttribute('data-tooltip') || el.getAttribute('title') || '';
    return String(value).trim();
  }

  function clearMobileTooltipTimers() {
    const mt = state.mobileTooltip;
    if (mt.pressTimerId) {
      clearTimeout(mt.pressTimerId);
      mt.pressTimerId = 0;
    }
    if (mt.hideTimerId) {
      clearTimeout(mt.hideTimerId);
      mt.hideTimerId = 0;
    }
    if (mt.chipHideTimerId) {
      clearTimeout(mt.chipHideTimerId);
      mt.chipHideTimerId = 0;
    }
  }

  function ensureMobileTooltipBubble() {
    if (state.mobileTooltip.bubbleEl && document.body.contains(state.mobileTooltip.bubbleEl)) {
      return state.mobileTooltip.bubbleEl;
    }
    const bubble = document.createElement('div');
    bubble.className = 'visited-mobile-tooltip-bubble';
    bubble.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bubble);
    state.mobileTooltip.bubbleEl = bubble;
    return bubble;
  }

  function hideMobileTooltipBubble() {
    const bubble = state.mobileTooltip.bubbleEl;
    if (!bubble) return;
    bubble.classList.remove('is-visible');
    state.mobileTooltip.hideTimerId = window.setTimeout(() => {
      if (!bubble.classList.contains('is-visible')) {
        bubble.remove();
        if (state.mobileTooltip.bubbleEl === bubble) {
          state.mobileTooltip.bubbleEl = null;
        }
      }
      state.mobileTooltip.hideTimerId = 0;
    }, 170);
  }

  function positionMobileTooltipBubble(target, bubble) {
    if (!target || !bubble) return;
    const rect = target.getBoundingClientRect();
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const maxLeft = Math.max(10, vw - bubble.offsetWidth - 10);
    let left = rect.left + (rect.width / 2) - (bubble.offsetWidth / 2);
    left = Math.max(10, Math.min(left, maxLeft));
    let top = rect.top - bubble.offsetHeight - 10;
    if (top < 10) top = rect.bottom + 10;
    bubble.style.left = `${Math.round(left)}px`;
    bubble.style.top = `${Math.round(top)}px`;
  }

  function showMobileTooltipBubble(target, text) {
    if (!target || !text) return;
    const bubble = ensureMobileTooltipBubble();
    bubble.textContent = text;
    bubble.classList.add('is-visible');
    positionMobileTooltipBubble(target, bubble);
  }

  function hideMobileTooltipChip() {
    const chip = document.getElementById('visitedMobileTooltipChip');
    if (!chip) return;
    chip.hidden = true;
    chip.textContent = '';
  }

  function showMobileTooltipChip(text, autoHideMs) {
    const chip = document.getElementById('visitedMobileTooltipChip');
    if (!chip || !text) return;
    chip.textContent = text;
    chip.hidden = false;

    if (state.mobileTooltip.chipHideTimerId) {
      clearTimeout(state.mobileTooltip.chipHideTimerId);
      state.mobileTooltip.chipHideTimerId = 0;
    }

    const ms = Number(autoHideMs) || 0;
    if (ms > 0) {
      state.mobileTooltip.chipHideTimerId = window.setTimeout(() => {
        hideMobileTooltipChip();
      }, ms);
    }
  }

  function clearMobileLongPressState() {
    if (state.mobileTooltip.pressTimerId) {
      clearTimeout(state.mobileTooltip.pressTimerId);
      state.mobileTooltip.pressTimerId = 0;
    }
    state.mobileTooltip.targetEl = null;
    state.mobileTooltip.longPressActive = false;
    hideMobileTooltipBubble();
  }

  function isProgressSubTabElement(el) {
    return Boolean(el && el.closest && el.closest('[data-progress-subtab]'));
  }

  function initMobileTooltipSupport(root) {
    if (!root || root.dataset.mobileTooltipBound === '1') return;
    root.dataset.mobileTooltipBound = '1';
    const longPressMs = getMobileTooltipLongPressMs();
    const suppressMs = Math.max(420, Math.round(longPressMs * 1.55));

    root.addEventListener('focusin', (event) => {
      const target = event.target.closest ? event.target.closest('[data-tooltip]') : null;
      if (!target) return;
      const text = getTooltipTextFromElement(target);
      if (text) showMobileTooltipChip(text, 2400);
    });

    root.addEventListener('click', (event) => {
      const target = event.target.closest ? event.target.closest('[data-tooltip]') : null;
      if (!target || !isTouchPrimaryInput()) return;
      const text = getTooltipTextFromElement(target);
      if (text) showMobileTooltipChip(text, 2200);
    }, true);

    root.addEventListener('touchstart', (event) => {
      if (!isTouchPrimaryInput()) return;
      const target = event.target.closest ? event.target.closest('[data-tooltip]') : null;
      if (!target) return;

      const text = getTooltipTextFromElement(target);
      if (!text) return;

      clearMobileLongPressState();
      state.mobileTooltip.lastLongPressTarget = null;
      state.mobileTooltip.targetEl = target;
      state.mobileTooltip.pressTimerId = window.setTimeout(() => {
        state.mobileTooltip.longPressActive = true;
        state.mobileTooltip.suppressClickUntil = Date.now() + suppressMs;
        state.mobileTooltip.lastLongPressTarget = target;
        showMobileTooltipBubble(target, text);
        showMobileTooltipChip(text, 2600);
      }, longPressMs);
    }, { passive: true });

    root.addEventListener('touchmove', () => {
      clearMobileLongPressState();
    }, { passive: true });

    root.addEventListener('touchend', () => {
      clearMobileLongPressState();
    }, { passive: true });

    root.addEventListener('touchcancel', () => {
      clearMobileLongPressState();
    }, { passive: true });

    root.addEventListener('click', (event) => {
      const target = event.target.closest ? event.target.closest('[data-tooltip]') : null;
      if (!target) return;
      if (!isTouchPrimaryInput()) return;

      if (isProgressSubTabElement(target)) return;

      const now = Date.now();
      if (!state.mobileTooltip.longPressActive && now > state.mobileTooltip.suppressClickUntil) {
        state.mobileTooltip.lastLongPressTarget = null;
        return;
      }

      const longPressTarget = state.mobileTooltip.lastLongPressTarget;
      if (longPressTarget && target !== longPressTarget && !longPressTarget.contains(target)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      state.mobileTooltip.longPressActive = false;
      state.mobileTooltip.suppressClickUntil = 0;
      state.mobileTooltip.lastLongPressTarget = null;
    }, true);

    window.addEventListener('scroll', () => {
      hideMobileTooltipBubble();
    }, { passive: true });

    window.addEventListener('resize', () => {
      hideMobileTooltipBubble();
    });
  }

  function getProgressSubTabButtons(root) {
    const subTabs = getVisitedSubTabsElement(root);
    return subTabs ? Array.from(subTabs.querySelectorAll('[data-progress-subtab]')) : [];
  }

  function bindProgressSubTabButtons(root) {
    const subTabs = getVisitedSubTabsElement(root);
    if (!root || !subTabs || subTabs.dataset.progressSubTabBound === '1') return;
    subTabs.dataset.progressSubTabBound = '1';

    subTabs.addEventListener('pointerdown', () => {
      scheduleVisitedSubTabInterceptionCheck(root, 0);
    }, true);

    subTabs.addEventListener('click', (event) => {
      const progressTabBtn = getClosestEventTarget(event, '[data-progress-subtab]');
      if (!progressTabBtn || !subTabs.contains(progressTabBtn)) return;
      event.preventDefault();
      state.mobileTooltip.longPressActive = false;
      state.mobileTooltip.suppressClickUntil = 0;
      state.mobileTooltip.lastLongPressTarget = null;
      const tabKey = progressTabBtn.getAttribute('data-progress-subtab') || 'outdoors';
      if (tabKey !== state.activeProgressSubTab) {
        setActiveProgressSubTab(root, tabKey);
      }
      scheduleVisitedSubTabInterceptionCheck(root, 0);
    });

    subTabs.addEventListener('keydown', (event) => {
      const currentTabBtn = getClosestEventTarget(event, '[data-progress-subtab]');
      if (!currentTabBtn || !subTabs.contains(currentTabBtn)) return;

      const buttons = getProgressSubTabButtons(root);
      if (buttons.length === 0) return;
      const index = buttons.indexOf(currentTabBtn);
      if (index < 0) return;

      let nextIndex = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % buttons.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + buttons.length) % buttons.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = buttons.length - 1;
      else return;

      event.preventDefault();
      const nextButton = buttons[nextIndex];
      const tabKey = nextButton.getAttribute('data-progress-subtab') || 'outdoors';
      setActiveProgressSubTab(root, tabKey);
      nextButton.focus();
    });
  }

  function setButtonBusy(button, isBusy, busyLabel) {
    if (!button) return;
    if (isBusy) {
      if (!button.dataset.prevLabel) {
        button.dataset.prevLabel = button.textContent || '';
      }
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
      if (busyLabel) button.textContent = busyLabel;
      return;
    }

    button.disabled = false;
    button.removeAttribute('aria-busy');
    if (button.dataset.prevLabel) {
      button.textContent = button.dataset.prevLabel;
      delete button.dataset.prevLabel;
    }
  }

  async function runRefreshWithLock(sourceButton) {
    if (state.isRefreshing) return;
    state.isRefreshing = true;
    setButtonBusy(sourceButton, true, 'Refreshing...');
    try {
      await refreshTab();
    } finally {
      setButtonBusy(sourceButton, false);
      state.isRefreshing = false;
    }
  }

  function norm(value) {
    return String(value || '').trim().toLowerCase();
  }

  function parseVisitedFlag(value) {
    const text = norm(value);
    if (!text) return false;
    return ['yes', 'y', 'true', '1', 'visited', 'done', 'x'].some(flag => text === flag || text.includes(flag));
  }

  function encodeGraphPath(filePath) {
    return String(filePath || '')
      .split('/')
      .filter(Boolean)
      .map(part => encodeURIComponent(part))
      .join('/');
  }

  function sanitizeVisitPhotoFileName(fileName) {
    return String(fileName || '')
      .replace(/[\\/:*?"<>|]/g, '-')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getVisitPhotoUploadRootPath() {
    const configured = window.visitedSyncConfig && window.visitedSyncConfig.mediaFolderPath
      ? String(window.visitedSyncConfig.mediaFolderPath)
      : (window.adventureSyncConfig && window.adventureSyncConfig.mediaFolderPath
        ? String(window.adventureSyncConfig.mediaFolderPath)
        : VISIT_LOG_MEDIA_ROOT_DEFAULT);
    return configured.replace(/^\/+|\/+$/g, '');
  }

  function getVisitPhotoSubtabFolderName(subtabKey) {
    const key = String(subtabKey || state.activeProgressSubTab || 'outdoors').trim().toLowerCase();
    return VISIT_LOG_MEDIA_SUBTAB_FOLDERS[key] || VISIT_LOG_MEDIA_SUBTAB_FOLDERS.outdoors;
  }

  function getVisitLogPhotoFiles() {
    const input = document.getElementById('visitedVisitLogPhotoInput');
    if (!input || !input.files) return [];
    return Array.from(input.files).filter((file) => file && Number(file.size || 0) >= 0);
  }

  function setVisitLogPhotoStatus(message, tone) {
    const statusEl = document.getElementById('visitedVisitLogPhotoStatus');
    if (!statusEl) return;
    statusEl.textContent = String(message || '').trim() || 'Attach one or more photos to upload them to OneDrive when you save.';
    statusEl.style.color = tone === 'error'
      ? '#991b1b'
      : tone === 'success'
        ? '#166534'
        : tone === 'warn'
          ? '#92400e'
          : '#1e3a8a';
  }

  async function uploadVisitPhotoToOneDrive(file, options = {}) {
    if (!file) return null;
    if (!window.accessToken) {
      throw new Error('Sign in required before uploading photos to OneDrive.');
    }

    const subtabFolder = getVisitPhotoSubtabFolderName(options.subtabKey);
    const safeName = sanitizeVisitPhotoFileName(file.name || `visit-photo-${Date.now()}`) || `visit-photo-${Date.now()}`;
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${safeName}`;
    const relativePath = `${getVisitPhotoUploadRootPath()}/${subtabFolder}/${uniqueName}`;
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
        throw new Error(`Photo upload failed (${response.status})${detail ? `: ${detail.slice(0, 200)}` : ''}`);
      }
      return response.json().catch(() => ({}));
    };

    const payload = window.ReliabilityAsync && typeof window.ReliabilityAsync.retryIdempotentWrite === 'function'
      ? await window.ReliabilityAsync.retryIdempotentWrite('Adventure visit photo upload', run, { retries: 1, backoffMs: 450 })
      : await run();

    return {
      id: String(payload.id || ''),
      name: String(payload.name || safeName),
      webUrl: String(payload.webUrl || ''),
      downloadUrl: String(payload['@microsoft.graph.downloadUrl'] || ''),
      path: relativePath,
      mimeType: String(file.type || ''),
      size: Number(file.size || 0)
    };
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
    } catch (error) {
      return fallback;
    }
  }

  function loadChallengeState() {
    state.challengeState = safeJsonParse(localStorage.getItem(CHALLENGE_STATE_KEY), {}) || {};
  }

  function saveChallengeState() {
    localStorage.setItem(CHALLENGE_STATE_KEY, JSON.stringify(state.challengeState || {}));
  }

  function loadMetaState() {
    const base = safeJsonParse(localStorage.getItem(VISITED_META_KEY), {}) || {};
    state.metaState = {
      badges: base.badges || {},
      quests: {
        completions: (base.quests && base.quests.completions) || {}
      }
    };
  }

  function saveMetaState() {
    localStorage.setItem(VISITED_META_KEY, JSON.stringify(state.metaState || {}));
  }

  function loadVisitRecords() {
    state.visitRecords = safeJsonParse(localStorage.getItem(VISIT_RECORDS_KEY), []) || [];
    if (!Array.isArray(state.visitRecords)) state.visitRecords = [];
  }

  function saveVisitRecords() {
    localStorage.setItem(VISIT_RECORDS_KEY, JSON.stringify(state.visitRecords || []));
  }

  function loadExplorerCardState() {
    const parsed = safeJsonParse(localStorage.getItem(EXPLORER_CARD_STATE_KEY), {}) || {};
    state.explorerCardState = parsed && typeof parsed === 'object' ? parsed : {};
  }

  function saveExplorerCardState() {
    localStorage.setItem(EXPLORER_CARD_STATE_KEY, JSON.stringify(state.explorerCardState || {}));
  }

  function getExplorerCardDraft(itemId) {
    const key = String(itemId || '').trim();
    if (!key) return { favorite: false, rating: 0, tags: [], notes: '' };
    const existing = state.explorerCardState && state.explorerCardState[key] ? state.explorerCardState[key] : {};
    const ratingNum = Number(existing.rating);
    return {
      favorite: Boolean(existing.favorite),
      rating: Number.isFinite(ratingNum) ? Math.max(0, Math.min(5, Math.round(ratingNum))) : 0,
      tags: Array.isArray(existing.tags) ? existing.tags.map((tag) => String(tag || '').trim()).filter(Boolean).slice(0, 8) : [],
      notes: String(existing.notes || '').trim()
    };
  }

  function updateExplorerCardDraft(itemId, updater) {
    const key = String(itemId || '').trim();
    if (!key || typeof updater !== 'function') return;
    const current = getExplorerCardDraft(key);
    const next = updater({ ...current }) || current;
    const ratingNum = Number(next.rating);
    state.explorerCardState[key] = {
      favorite: Boolean(next.favorite),
      rating: Number.isFinite(ratingNum) ? Math.max(0, Math.min(5, Math.round(ratingNum))) : 0,
      tags: Array.isArray(next.tags) ? next.tags.map((tag) => String(tag || '').trim()).filter(Boolean).slice(0, 8) : [],
      notes: String(next.notes || '').trim()
    };
    saveExplorerCardState();
  }

  function getVisitRecordsForSubtab(subtabKey) {
    const key = String(subtabKey || '').trim();
    return (state.visitRecords || []).filter((record) => record && record.subtabKey === key);
  }


  function triggerBadgeCelebration(newlyUnlocked) {
    // Celebration FX disabled by UX request (no confetti / no sound toggles).
    void newlyUnlocked;
  }

  function renderVisitedDiagnosticsPanel(visitMap) {
    const panel = document.getElementById('visitedDiagnosticsPanel');
    if (!panel) return;
    const status = getSyncHealthStatus();
    const map = visitMap || state.latestVisitMap || {};
    const pending = Object.values(map).filter((entry) => entry && entry.synced === false).length;
    panel.textContent = `Adventure visited column: ${status.adventureText} | Bike visited column: ${status.bikeText} | Pending local-only rows: ${pending}`;
  }

  function getVisitMap() {
    return safeJsonParse(localStorage.getItem(STORAGE_KEY), {}) || {};
  }

  function saveVisitMap(map) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  }

  function getExplorerConfig(subtabKey) {
    return ADVENTURE_SUBTAB_EXPLORER_CONFIG[subtabKey] || null;
  }

  function getExplorerState(subtabKey) {
    if (!state.subtabExplorer[subtabKey]) {
      state.subtabExplorer[subtabKey] = {
        view: 'overview',
        loading: false,
        loaded: false,
        updatedAt: '',
        error: '',
        items: [],
        query: '',
        sort: 'name-asc',
        stateFilter: 'all',
        cityFilter: 'all'
      };
    }
    return state.subtabExplorer[subtabKey];
  }

  function setExplorerView(root, subtabKey, view) {
    const pane = root ? root.querySelector(`#visitedProgressPane-${subtabKey}`) : null;
    if (!pane) return;
    const explorerState = getExplorerState(subtabKey);
    const nextView = String(view || 'overview').trim();
    explorerState.view = nextView || 'overview';
    const jumpLinks = root ? root.querySelector('.visited-jump-links') : null;
    if (jumpLinks) {
      const hideJumpLinks = explorerState.view === 'city-explorer'
        || explorerState.view === 'explorer'
        || explorerState.view === 'explorer-details';
      jumpLinks.hidden = hideJumpLinks;
      jumpLinks.setAttribute('aria-hidden', hideJumpLinks ? 'true' : 'false');
      jumpLinks.style.display = hideJumpLinks ? 'none' : '';
    }
    pane.querySelectorAll('[data-visited-subtab-view]').forEach((node) => {
      const nodeView = node.getAttribute('data-visited-subtab-view');
      const show = nodeView === explorerState.view;
      node.hidden = !show;
      node.setAttribute('aria-hidden', show ? 'false' : 'true');
    });
  }

  function workbookPathCandidates(workbook) {
    const clean = String(workbook || '').trim();
    if (!clean) return [];
    if (clean.includes('/')) return [clean];
    const unique = new Set();
    EXPLORER_WORKBOOK_PREFIXES.forEach((prefix) => {
      unique.add(`${prefix}${clean}`);
    });
    return Array.from(unique);
  }

  async function fetchTableRangeValues(filePath, tableName) {
    if (!window.accessToken) throw new Error('Sign in required to read workbook data.');
    const encodedPath = encodeGraphPath(filePath);
    const url = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/workbook/tables/${encodeURIComponent(tableName)}/range?$select=values`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${window.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`Unable to load ${tableName} from ${filePath} (HTTP ${response.status})`);
    }
    const payload = await response.json().catch(() => ({}));
    return Array.isArray(payload.values) ? payload.values : [];
  }

  function normalizeExplorerCell(value) {
    return String(value === undefined || value === null ? '' : value).trim();
  }

  function buildExplorerRowObject(headers, rowValues) {
    const row = {};
    headers.forEach((header, idx) => {
      const key = header || `Column ${idx + 1}`;
      row[key] = normalizeExplorerCell(rowValues[idx]);
    });
    return row;
  }

  function pickExplorerValue(row, candidateKeys) {
    const entries = Object.entries(row || {});
    if (!entries.length) return '';
    for (const candidate of (candidateKeys || [])) {
      const candidateNorm = norm(candidate);
      const exact = entries.find(([key]) => norm(key) === candidateNorm);
      if (exact && normalizeExplorerCell(exact[1])) return normalizeExplorerCell(exact[1]);
      const partial = entries.find(([key]) => norm(key).includes(candidateNorm));
      if (partial && normalizeExplorerCell(partial[1])) return normalizeExplorerCell(partial[1]);
    }
    return '';
  }

  function toExplorerItems(matrix, source) {
    if (!Array.isArray(matrix) || matrix.length < 2) return [];
    const headers = (matrix[0] || []).map((header, idx) => {
      const text = normalizeExplorerCell(header);
      return text || `Column ${idx + 1}`;
    });

    return matrix.slice(1).map((values, index) => {
      const row = buildExplorerRowObject(headers, Array.isArray(values) ? values : []);
      const title = pickExplorerValue(row, EXPLORER_COLUMN_CANDIDATES.title)
        || Object.values(row).find((value) => normalizeExplorerCell(value))
        || `Location ${index + 1}`;
      const placeId = pickExplorerValue(row, EXPLORER_COLUMN_CANDIDATES.placeId);
      const city = pickExplorerValue(row, EXPLORER_COLUMN_CANDIDATES.city);
      const stateText = pickExplorerValue(row, EXPLORER_COLUMN_CANDIDATES.state);
      const tagsRaw = pickExplorerValue(row, EXPLORER_COLUMN_CANDIDATES.tags);
      const description = pickExplorerValue(row, EXPLORER_COLUMN_CANDIDATES.description);
      const address = pickExplorerValue(row, EXPLORER_COLUMN_CANDIDATES.address);
      const hours = pickExplorerValue(row, EXPLORER_COLUMN_CANDIDATES.hours);
      const drive = pickExplorerValue(row, EXPLORER_COLUMN_CANDIDATES.drive);
      const website = pickExplorerValue(row, EXPLORER_COLUMN_CANDIDATES.website);
      const phone = pickExplorerValue(row, EXPLORER_COLUMN_CANDIDATES.phone);
      const rating = pickExplorerValue(row, EXPLORER_COLUMN_CANDIDATES.rating);
      const cost = pickExplorerValue(row, EXPLORER_COLUMN_CANDIDATES.cost);
      const googleUrl = pickExplorerValue(row, EXPLORER_COLUMN_CANDIDATES.googleUrl);
      const tags = String(tagsRaw || '')
        .split(/[;,]/)
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 6);

      return {
        id: `${source.key}:${source.table}:${index}:${norm(title) || 'row'}`,
        placeId: String(placeId || '').trim(),
        title,
        city,
        state: stateText,
        tags,
        description,
        address,
        hours,
        driveTime: drive,
        website,
        phone,
        rating,
        cost,
        googleUrl,
        sourceLabel: `${source.workbook} / ${source.table}`,
        sourceWorkbook: String(source.workbook || '').trim(),
        sourceWorkbookPath: String(source.resolvedWorkbookPath || source.workbook || '').trim(),
        sourceTable: String(source.table || '').trim(),
        sourceRowIndex: index
      };
    }).filter((item) => norm(item.title));
  }

  async function loadExplorerSource(source) {
    const candidates = workbookPathCandidates(source.workbook);
    let lastError = null;
    for (const candidate of candidates) {
      try {
        const matrix = await fetchTableRangeValues(candidate, source.table);
        return toExplorerItems(matrix, { ...source, key: source.key || source.table, resolvedWorkbookPath: candidate });
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error(`Unable to load ${source.table}.`);
  }

  async function ensureExplorerDataLoaded(root, subtabKey, forceReload) {
    const config = getExplorerConfig(subtabKey);
    if (!config) return;
    const explorerState = getExplorerState(subtabKey);
    if (explorerState.loading) return;
    if (explorerState.loaded && !forceReload) return;

    explorerState.loading = true;
    explorerState.error = '';
    renderExplorerList(root, subtabKey);
    try {
      const groups = await Promise.all(config.sources.map((source) => loadExplorerSource({ ...source, key: subtabKey })));
      explorerState.items = groups.flat();
      explorerState.loaded = true;
    } catch (error) {
      explorerState.error = error && error.message ? error.message : 'Explorer data could not be loaded.';
      explorerState.items = [];
      explorerState.loaded = false;
    } finally {
      explorerState.updatedAt = new Date().toISOString();
      explorerState.loading = false;
      renderExplorerList(root, subtabKey);
      renderSubtabStatusBars();
    }
  }

  async function forceVisitedExplorerSync(subtabKey) {
    const key = String(subtabKey || '').trim();
    const root = document.getElementById('visitedLocationsRoot');
    if (!root || !getExplorerConfig(key)) return false;
    await ensureExplorerDataLoaded(root, key, true);
    renderSubtabStatusBars();
    return true;
  }

  async function openVisitedVisitLogFromAchievements(options) {
    const raw = options && typeof options === 'object' ? options : { subtabKey: options };
    const key = String(raw.subtabKey || state.activeProgressSubTab || 'outdoors').trim();
    const root = document.getElementById('visitedLocationsRoot');
    if (root && key !== state.activeProgressSubTab) {
      setActiveProgressSubTab(root, key);
    }
    await openVisitLogModal({
      subtabKey: key,
      itemId: raw.itemId,
      mode: raw.mode,
      hint: raw.hint
    });
  }

  function getBadgeMetricProgress(badge, stats, insights) {
    if (badge.metric === 'visited') return stats.visited.length;
    if (badge.metric === 'categoryCoverage') return stats.completedCategories;
    if (badge.metric === 'states') return insights.uniqueStates;
    if (badge.metric === 'weekendVisits') return insights.weekendVisitCount;
    if (badge.metric === 'streak') return stats.streakDays;
    if (badge.metric === 'category') return stats.visitedByCategory[badge.category] || 0;
    return 0;
  }

  function buildBadgeProgress(stats, insights) {
    const now = new Date().toISOString();
    const badges = BADGE_DEFS.map((badge) => {
      const progress = getBadgeMetricProgress(badge, stats, insights);
      const completed = progress >= badge.goal;
      const existing = state.metaState.badges[badge.id] || null;
      let justUnlocked = false;

      if (completed && !existing) {
        state.metaState.badges[badge.id] = { unlockedAt: now };
        justUnlocked = true;
      }

      return {
        ...badge,
        progress,
        completed,
        justUnlocked,
        unlockedAt: state.metaState.badges[badge.id] ? state.metaState.badges[badge.id].unlockedAt : null,
        pct: Math.min(100, Math.round((progress / badge.goal) * 100))
      };
    });

    const newlyUnlocked = badges.filter(item => item.justUnlocked);
    if (newlyUnlocked.length > 0) {
      saveMetaState();
      triggerBadgeCelebration(newlyUnlocked);
      if (typeof window.showToast === 'function') {
        const labels = newlyUnlocked.map(item => `${item.icon} ${item.title}`).join(', ');
        window.showToast(`Badge unlocked: ${labels}`, 'success', 4200);
      }
    }

    return badges;
  }

  function getPlayerLevel(totalXp) {
    const level = Math.max(1, Math.floor(totalXp / 250) + 1);
    const currentLevelFloor = (level - 1) * 250;
    const nextLevelXp = level * 250;
    return {
      level,
      totalXp,
      levelProgressPct: Math.round(((totalXp - currentLevelFloor) / (nextLevelXp - currentLevelFloor)) * 100),
      remainingXp: nextLevelXp - totalXp
    };
  }

  function evaluateWeatherMode() {
    const weatherModeEl = document.getElementById('visitedWeatherMode');
    const mode = weatherModeEl ? weatherModeEl.value : 'auto';
    state.weatherMode = WEATHER_PROFILES[mode] ? mode : 'auto';
    return state.weatherMode;
  }

  function generateSuggestions(adventures, visitMap, challengeProgress) {
    const weatherMode = evaluateWeatherMode();
    const weatherPreferred = weatherMode === 'auto' ? getSeasonalCategoryBoosts() : WEATHER_PROFILES[weatherMode].preferred;

    const unfinishedPriority = new Set(
      challengeProgress
        .filter(challenge => !challenge.completed && challenge.category)
        .map(challenge => challenge.category)
    );

    const weekday = new Date().getDay();
    const weekend = weekday === 0 || weekday === 6;

    return adventures
      .filter(adventure => !visitMap[adventure.id])
      .map(adventure => {
        const categories = categoriesForAdventure(adventure);
        const driveMinutes = parseDriveMinutes(adventure.driveTime);
        const openState = isOpenNow(adventure.hours);

        let score = 0;
        const reasons = [];
        const scoreBreakdown = {
          weather: 0,
          distance: 0,
          categoryProgress: 0,
          questRelevance: 0,
          availability: 0,
          context: 0
        };

        if (openState === true) {
          score += 30;
          scoreBreakdown.availability += 30;
          reasons.push('Open now');
        } else if (openState === false) {
          score -= 25;
          scoreBreakdown.availability -= 25;
          reasons.push('Likely closed right now');
        } else {
          score += 8;
          scoreBreakdown.availability += 8;
          reasons.push('Hours unknown, worth checking');
        }

        if (driveMinutes <= 30) {
          score += 18;
          scoreBreakdown.distance += 18;
          reasons.push('Quick drive');
        } else if (driveMinutes <= 60) {
          score += 10;
          scoreBreakdown.distance += 10;
        }

        categories.forEach(category => {
          if (weatherPreferred.includes(category)) {
            score += 16;
            scoreBreakdown.weather += 16;
            reasons.push(`${getCategoryMeta(category)?.label || category} matches weather`);
          }
          if (unfinishedPriority.has(category)) {
            score += 20;
            scoreBreakdown.questRelevance += 20;
            scoreBreakdown.categoryProgress += 20;
            reasons.push('Moves an active challenge forward');
          }
        });

        if (weekend && categories.includes('scenic')) {
          score += 8;
          scoreBreakdown.context += 8;
        }
        if (!weekend && categories.includes('coffee')) {
          score += 6;
          scoreBreakdown.context += 6;
        }

        return {
          ...adventure,
          categories,
          score,
          scoreBreakdown,
          reasons: Array.from(new Set(reasons)).slice(0, 3),
          openState
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }

  function renderSummary(stats, challengeProgress, badges, questSet) {
    const completedChallenges = challengeProgress.filter(challenge => challenge.completed).length;
    const challengeXp = challengeProgress
      .filter(challenge => challenge.completed)
      .reduce((sum, challenge) => sum + challenge.points, 0);
    const badgeXp = badges.filter(badge => badge.completed).reduce((sum, badge) => sum + badge.points, 0);
    const questXp = questSet.weekly.quests
      .concat(questSet.monthly.quests)
      .concat(questSet.quarterly.quests)
      .concat(questSet.yearly.quests)
      .concat(questSet.lifetime.quests)
      .filter(quest => quest.completed)
      .reduce((sum, quest) => sum + quest.points, 0);
    const level = getPlayerLevel(stats.xpFromVisits + challengeXp + badgeXp + questXp);

    const summaryEl = document.getElementById('visitedSummaryStats');
    if (!summaryEl) return;

    summaryEl.innerHTML = `
      <div class="visited-stat-card">
        <div class="visited-stat-label">Explorer Level</div>
        <div class="visited-stat-value">Lv ${level.level}</div>
        <div class="visited-stat-sub">${level.remainingXp} points to next level</div>
      </div>
      <div class="visited-stat-card">
        <div class="visited-stat-label">Visited</div>
        <div class="visited-stat-value">${stats.visited.length}</div>
        <div class="visited-stat-sub">${stats.completionPct}% of all adventures</div>
      </div>
      <div class="visited-stat-card">
        <div class="visited-stat-label">Challenges</div>
        <div class="visited-stat-value">${completedChallenges}/${challengeProgress.length}</div>
        <div class="visited-stat-sub">Keep stacking wins</div>
      </div>
      <div class="visited-stat-card">
        <div class="visited-stat-label">Badges</div>
        <div class="visited-stat-value">${badges.filter(b => b.completed).length}/${badges.length}</div>
        <div class="visited-stat-sub">Rarity tiers unlocked</div>
      </div>
      <div class="visited-stat-card">
        <div class="visited-stat-label">Current Streak</div>
        <div class="visited-stat-value">${stats.streakDays} days</div>
        <div class="visited-stat-sub">Visit one place daily</div>
      </div>
    `;

    const levelBar = document.getElementById('visitedLevelBarFill');
    if (levelBar) {
      levelBar.style.width = `${Math.max(0, Math.min(100, level.levelProgressPct))}%`;
    }
  }

  function renderBadges(badges) {
    const container = document.getElementById('visitedBadgeGallery');
    if (!container) return;

    container.innerHTML = badges.map((badge) => {
      const rarity = RARITY_STYLES[badge.rarity] || RARITY_STYLES.common;
      const statusText = badge.completed
        ? `Unlocked ${badge.unlockedAt ? new Date(badge.unlockedAt).toLocaleDateString() : ''}`
        : `${badge.progress}/${badge.goal}`;

      return `
        <div class="visited-badge-card ${rarity.className} ${badge.completed ? 'unlocked' : 'locked'} ${badge.justUnlocked ? 'unlock-pop' : ''}">
          <div class="visited-badge-top">
            <div class="visited-badge-icon">${badge.icon}</div>
            <div class="visited-badge-rarity">${rarity.label}</div>
          </div>
          <div class="visited-badge-title">${escapeHtml(badge.title)}</div>
          <div class="visited-badge-desc">${escapeHtml(badge.description)}</div>
          <div class="visited-challenge-progress">${escapeHtml(statusText)}</div>
          <div class="visited-progress-track"><div class="visited-progress-fill" style="width:${badge.pct}%;"></div></div>
        </div>
      `;
    }).join('');
  }

  function renderQuestPanel(containerId, title, subtitle, questBucket) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="visited-quest-panel-title">${escapeHtml(title)}</div>
      <div class="visited-quest-panel-subtitle">${escapeHtml(subtitle)} • ${escapeHtml(questBucket.periodKey)}</div>
      <div class="visited-quest-list">
        ${questBucket.quests.map((quest) => `
          <div class="visited-quest-item ${quest.completed ? 'completed' : ''}">
            <div class="visited-quest-item-title">${quest.icon} ${escapeHtml(quest.title)}</div>
            <div class="visited-challenge-progress">${quest.progress}/${quest.goal}</div>
            <div class="visited-progress-track"><div class="visited-progress-fill" style="width:${quest.pct}%;"></div></div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderRotatingQuests(questSet) {
    renderQuestPanel('visitedWeeklyQuestPanel', 'Weekly Quests', 'Rotates each week', questSet.weekly);
    renderQuestPanel('visitedMonthlyQuestPanel', 'Monthly Quests', 'Rotates each month', questSet.monthly);
    renderQuestPanel('visitedQuarterlyQuestPanel', 'Quarterly Quests', 'Rotates each quarter', questSet.quarterly);
    renderQuestPanel('visitedYearlyQuestPanel', 'Yearly Quests', 'Rotates each year', questSet.yearly);
    renderQuestPanel('visitedLifetimeQuestPanel', 'Lifetime Quest Series', 'All-time progression milestones', questSet.lifetime);
  }

  function projectToCanvas(lat, lng, width, height) {
    const minLat = 24;
    const maxLat = 50;
    const minLng = -125;
    const maxLng = -66;
    const x = ((lng - minLng) / (maxLng - minLng)) * width;
    const y = (1 - ((lat - minLat) / (maxLat - minLat))) * height;
    return { x, y };
  }

  function getApproximateCoordinates(city, stateText) {
    if (window.enhancedCityViz && typeof window.enhancedCityViz.getApproximateCoordinates === 'function') {
      return window.enhancedCityViz.getApproximateCoordinates(city, stateText);
    }
    return { lat: 35.3395, lng: -82.4637 };
  }

  function buildHeatmapBuckets(stats) {
    const buckets = new Map();

    stats.visited.forEach((adventure) => {
      const city = adventure.city || 'Unknown City';
      const stateText = adventure.state || 'Unknown State';
      const key = `${city}, ${stateText}`;
      const prev = buckets.get(key) || { city, state: stateText, count: 0, categoryCounts: {} };
      prev.count += 1;

      categoriesForAdventure(adventure).forEach((categoryKey) => {
        prev.categoryCounts[categoryKey] = (prev.categoryCounts[categoryKey] || 0) + 1;
      });

      buckets.set(key, prev);
    });

    return Array.from(buckets.values())
      .map((entry) => {
        const coords = getApproximateCoordinates(entry.city, entry.state);
        const topCategories = Object.entries(entry.categoryCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([key, count]) => `${getCategoryMeta(key)?.icon || '📍'} ${getCategoryMeta(key)?.label || key} (${count})`);
        return { ...entry, lat: Number(coords.lat), lng: Number(coords.lng), topCategories };
      })
      .filter(entry => Number.isFinite(entry.lat) && Number.isFinite(entry.lng))
      .sort((a, b) => b.count - a.count);
  }

  function showHeatmapTooltip(x, y, html) {
    const tooltip = document.getElementById('visitedHeatmapTooltip');
    if (!tooltip) return;
    tooltip.innerHTML = html;
    tooltip.style.left = `${x + 12}px`;
    tooltip.style.top = `${y + 12}px`;
    tooltip.classList.add('visible');
  }

  function hideHeatmapTooltip() {
    const tooltip = document.getElementById('visitedHeatmapTooltip');
    if (!tooltip) return;
    tooltip.classList.remove('visible');
  }

  function buildHotspotTooltipHtml(bucket) {
    const categories = bucket.topCategories && bucket.topCategories.length > 0
      ? bucket.topCategories.join('<br>')
      : 'No category data yet';
    return `<strong>${escapeHtml(bucket.city)}, ${escapeHtml(bucket.state)}</strong><br>${bucket.count} visits<br>${categories}`;
  }

  function renderHeatmap(stats) {
    const canvas = document.getElementById('visitedHeatmapCanvas');
    const hotspots = document.getElementById('visitedHeatmapHotspots');
    const overlay = document.getElementById('visitedHeatmapOverlay');
    if (!canvas || !hotspots || !overlay) return;

    const buckets = buildHeatmapBuckets(stats);
    overlay.innerHTML = '';
    if (buckets.length === 0) {
      hotspots.innerHTML = '<div class="visited-empty ui-empty-state">No visited locations yet to build heatmap.</div>';
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const width = Math.max(640, canvas.clientWidth || 640);
    const height = 290;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      for (let y = 0; y < height; y += 58) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const maxCount = buckets[0].count || 1;
      buckets.forEach((bucket) => {
        const p = projectToCanvas(bucket.lat, bucket.lng, width, height);
        const intensity = Math.max(0.2, bucket.count / maxCount);
        const radius = 8 + (intensity * 28);

        const grad = ctx.createRadialGradient(p.x, p.y, 4, p.x, p.y, radius);
        grad.addColorStop(0, `rgba(59,130,246,${0.2 + intensity * 0.7})`);
        grad.addColorStop(1, 'rgba(59,130,246,0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();

        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'visited-heat-dot';
        dot.style.left = `${(p.x / width) * 100}%`;
        dot.style.top = `${(p.y / height) * 100}%`;
        dot.style.width = `${Math.max(8, Math.min(18, radius * 0.35))}px`;
        dot.style.height = dot.style.width;
        dot.setAttribute('aria-label', `${bucket.city}, ${bucket.state}: ${bucket.count} visits`);
        dot.setAttribute('title', `Heat spot: ${bucket.city}, ${bucket.state} (${bucket.count} visits)`);
        dot.setAttribute('data-tooltip', `Heat spot: ${bucket.city}, ${bucket.state} (${bucket.count} visits)`);
        dot.dataset.hotspotTooltip = buildHotspotTooltipHtml(bucket);
        overlay.appendChild(dot);
      });
    }

    hotspots.innerHTML = buckets.slice(0, 8).map((bucket, idx) => `
      <div class="visited-hotspot-item" data-hotspot-tooltip="${escapeHtml(buildHotspotTooltipHtml(bucket))}">
        <span>#${idx + 1} ${escapeHtml(bucket.city)}, ${escapeHtml(bucket.state)}</span>
        <span>${bucket.count} visits</span>
      </div>
    `).join('');
  }

  function syncCategoryFocusButtons(root) {
    // Focus buttons removed from category cards by UX request.
    // Keep function as no-op to avoid changing caller flow.
    void root;
  }

    function renderCategories(stats) {
      const grid = document.getElementById('visitedCategoryGrid');
      if (!grid) return;

      const categoryCount = CATEGORY_DEFS.length;
      grid.innerHTML = CATEGORY_DEFS.map(category => {
        const visitedCount = stats.visitedByCategory[category.key] || 0;
        const totalCount = stats.totalByCategory[category.key] || 0;
        const pct = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;
        return `
          <div class="visited-category-card" data-category="${category.key}">
            <div class="visited-category-top">
              <div class="visited-category-title">${category.icon} ${category.label}</div>
            </div>
            <div class="visited-category-meta">${visitedCount} / ${totalCount || 0} visited</div>
            <div class="visited-progress-track"><div class="visited-progress-fill" style="width:${pct}%;"></div></div>
          </div>
        `;
      }).join('');

      logVisitedDiagnostics(`🎨 renderCategories() rendered ${categoryCount} category cards`);
    }

  function maybeCelebrateChallengeCompletions(challengeProgress) {
    let newlyCompleted = [];

    challengeProgress.forEach(challenge => {
      const alreadyCompleted = Boolean(state.challengeState[challenge.id]);
      if (challenge.completed && !alreadyCompleted) {
        state.challengeState[challenge.id] = {
          completedAt: new Date().toISOString(),
          title: challenge.title
        };
        newlyCompleted.push(challenge);
      }
    });

    if (newlyCompleted.length > 0) {
      saveChallengeState();
      const labels = newlyCompleted.map(challenge => `${challenge.icon} ${challenge.title}`).join(', ');
      if (typeof window.showToast === 'function') {
        window.showToast(`Challenge complete: ${labels}`, 'success', 4500);
      }
    }
  }

  function renderChallenges(challengeProgress) {
    const container = document.getElementById('visitedChallengeGrid');
    if (!container) return;

    maybeCelebrateChallengeCompletions(challengeProgress);

    container.innerHTML = challengeProgress.map(challenge => `
      <div class="visited-challenge-card ${challenge.completed ? 'completed' : ''}">
        <div class="visited-challenge-title">${challenge.icon} ${escapeHtml(challenge.title)}</div>
        <div class="visited-challenge-tip">${escapeHtml(challenge.tip)}</div>
        <div class="visited-challenge-progress">${challenge.progress}/${challenge.goal} (${challenge.pct}%)</div>
        <div class="visited-progress-track"><div class="visited-progress-fill" style="width:${challenge.pct}%;"></div></div>
      </div>
    `).join('');
  }

   function renderSuggestions(suggestions) {
     const container = document.getElementById('visitedSuggestionList');
     if (!container) return;

     if (suggestions.length === 0) {
       container.innerHTML = '<div class="visited-empty ui-empty-state">No recommendation candidates yet. Load adventure data first.</div>';
       return;
     }

     container.innerHTML = suggestions.map(suggestion => {
       const categoryLabels = suggestion.categories.map(category => getCategoryMeta(category)?.icon || '📍').join(' ');
       const openBadge = suggestion.openState === true
         ? '<span class="visited-pill open">Open now</span>'
         : suggestion.openState === false
           ? '<span class="visited-pill closed">Likely closed now</span>'
           : '<span class="visited-pill">Check hours</span>';

       const explainId = `visitedSuggestionExplain-${escapeHtml(suggestion.id).replace(/[^a-zA-Z0-9_-]/g, '_')}`;
       const breakdown = suggestion.scoreBreakdown || {};

       return `
         <div class="adventure-card visited-suggestion-card">
           <div class="adventure-card-header">
             <div class="adventure-card-title">${escapeHtml(suggestion.name)}</div>
             <div class="adventure-card-location">📍 ${escapeHtml(suggestion.city)}, ${escapeHtml(suggestion.state)} ${categoryLabels}</div>
             <div class="adventure-card-time">🚗 ${escapeHtml(suggestion.driveTime || 'Drive time unknown')}</div>
           </div>
           <div class="adventure-card-body">
             <div class="visited-pill-row">${openBadge}</div>
             <div class="visited-reason-list">${suggestion.reasons.map(reason => `<span class="visited-pill">${escapeHtml(reason)}</span>`).join('')}</div>
             <button type="button" class="visited-suggestion-explain-btn" data-suggestion-explain-toggle="${explainId}" aria-expanded="false" title="See score breakdown" data-tooltip="See score breakdown" style="pointer-events: auto !important; position: relative !important; z-index: 2501 !important;">Why this now? (${Math.round(suggestion.score)})</button>
             <div id="${explainId}" class="visited-suggestion-breakdown" hidden>
               <div>Availability: ${breakdown.availability || 0}</div>
               <div>Distance: ${breakdown.distance || 0}</div>
               <div>Weather match: ${breakdown.weather || 0}</div>
               <div>Category progress: ${breakdown.categoryProgress || 0}</div>
               <div>Quest relevance: ${breakdown.questRelevance || 0}</div>
               <div>Context bonus: ${breakdown.context || 0}</div>
             </div>
           </div>
           <div class="adventure-card-footer">
             <div class="card-action-buttons">
               <button type="button" class="card-btn card-btn-primary" data-visit-action="toggle" data-location-id="${escapeHtml(suggestion.id)}" title="Mark ${escapeHtml(suggestion.name)} as visited" data-tooltip="Mark ${escapeHtml(suggestion.name)} as visited" style="pointer-events: auto !important; position: relative !important; z-index: 2501 !important;">✅ Mark Visited</button>
             </div>
           </div>
         </div>
       `;
     }).join('');

     applyTooltipInfoIcons(container);
   }

  function renderRecentVisits(stats, visitMap) {
    const container = document.getElementById('visitedRecentList');
    if (!container) return;

    const recent = Object.entries(visitMap)
      .sort((a, b) => new Date(b[1].visitedAt) - new Date(a[1].visitedAt))
      .slice(0, 8)
      .map(([id, entry]) => {
        const adventure = stats.adventures.find(item => item.id === id);
        const name = adventure ? adventure.name : entry.name || id;
        const when = new Date(entry.visitedAt);
        return {
          id,
          name,
          whenText: Number.isNaN(when.getTime()) ? 'Unknown date' : when.toLocaleDateString()
        };
      });

    if (recent.length === 0) {
      container.innerHTML = '<div class="visited-empty ui-empty-state">No visits tracked yet. Mark your first adventure!</div>';
      return;
    }

    container.innerHTML = recent.map(item => `
      <div class="visited-recent-item">
        <span>✅ ${escapeHtml(item.name)}</span>
        <span>${escapeHtml(item.whenText)}</span>
      </div>
    `).join('');
  }

  function filterCatalog(adventures, visitMap) {
    const text = norm(state.searchText);
    const categoryFilter = state.categoryFilter;
    const visitFilter = state.catalogVisitFilter || 'all';
    const sourceFilter = state.catalogSourceFilter || 'all';

    return adventures.filter(adventure => {
      const matchesSearch = !text || `${norm(adventure.name)} ${norm(adventure.city)} ${norm(adventure.state)} ${adventure.tags.join(' ')}`.includes(text);
      if (!matchesSearch) return false;

      const visited = Boolean(visitMap[adventure.id]);
      if (visitFilter === 'visited' && !visited) return false;
      if (visitFilter === 'unvisited' && visited) return false;

      if (sourceFilter !== 'all' && adventure.sourceType !== sourceFilter) return false;

      if (categoryFilter !== 'all') {
        const categories = categoriesForAdventure(adventure);
        if (!categories.includes(categoryFilter)) return false;
      }

      return true;
    }).sort((a, b) => {
      const aVisited = Boolean(visitMap[a.id]);
      const bVisited = Boolean(visitMap[b.id]);
      if (aVisited !== bVisited) return aVisited ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
  }

  function resetCatalogRenderLimit() {
    state.catalogRenderLimit = CATALOG_INITIAL_LIMIT;
  }

   function renderCatalogQuickFilters(adventures, visitMap) {
     const root = document.getElementById('visitedTrackerQuickFilters');
     if (!root) return;

     const allCount = adventures.length;
     const visitedCount = adventures.filter((adventure) => Boolean(visitMap[adventure.id])).length;
     const unvisitedCount = Math.max(0, allCount - visitedCount);
     const advCount = adventures.filter((adventure) => adventure.sourceType === 'adventure').length;
     const bikeCount = adventures.filter((adventure) => adventure.sourceType === 'bike').length;

     root.querySelectorAll('[data-catalog-filter]').forEach((btn) => {
       const group = btn.getAttribute('data-catalog-filter') || '';
       const value = btn.getAttribute('data-catalog-filter-value') || 'all';
       const active = group === 'visit'
         ? state.catalogVisitFilter === value
         : state.catalogSourceFilter === value;
       btn.classList.toggle('active', active);
       btn.setAttribute('aria-pressed', active ? 'true' : 'false');
       btn.style.pointerEvents = 'auto';
       btn.style.position = 'relative';
       btn.style.zIndex = '2501';

       if (group === 'visit' && value === 'all') btn.textContent = `All (${allCount})`;
       if (group === 'visit' && value === 'visited') btn.textContent = `Visited (${visitedCount})`;
       if (group === 'visit' && value === 'unvisited') btn.textContent = `Unvisited (${unvisitedCount})`;
       if (group === 'source' && value === 'all') btn.textContent = `All sources (${allCount})`;
       if (group === 'source' && value === 'adventure') btn.textContent = `Adventure (${advCount})`;
       if (group === 'source' && value === 'bike') btn.textContent = `Bike (${bikeCount})`;
     });
   }

  async function persistVisitedToExcel(location, isVisited) {
    const writeValue = isVisited ? 'TRUE' : '';

    if (location.sourceType === 'adventure') {
      const colIdx = await resolveAdventureVisitedColumnIndex();
      if (colIdx < 0) {
        throw new Error('Adventure table is missing a Visited column mapping.');
      }

      const row = Array.isArray(window.adventuresData) ? window.adventuresData[location.sourceIndex] : null;
      const values = Array.isArray(row?.values?.[0]) ? row.values[0].slice() : (Array.isArray(location.rowValues) ? location.rowValues.slice() : []);
      while (values.length <= colIdx) values.push('');
      values[colIdx] = writeValue;

      if (typeof window.saveToExcel !== 'function' || !location.rowId) {
        throw new Error('Adventure Excel write helper is unavailable for this row.');
      }

      await window.saveToExcel(location.rowId, values);
      if (row && row.values) {
        row.values[0] = values;
      }
      return true;
    }

    if (location.sourceType === 'bike') {
      const colIdx = await resolveBikeVisitedColumnIndex();
      if (colIdx < 0) {
        throw new Error('Bike table is missing a Visited column mapping.');
      }
      if (typeof window.updateBikeTrailRowColumns !== 'function') {
        throw new Error('Bike Excel write helper is unavailable.');
      }

      await window.updateBikeTrailRowColumns(location.sourceIndex, { [colIdx]: writeValue });
      return true;
    }

    throw new Error('Unsupported location source type.');
  }

   function renderCatalog(adventures, visitMap) {
     const container = document.getElementById('visitedAdventureCatalog');
     if (!container) return;

     renderCatalogQuickFilters(adventures, visitMap);
     const filtered = filterCatalog(adventures, visitMap);
     if (filtered.length === 0) {
       container.innerHTML = '<div class="visited-empty ui-empty-state">No locations match your search right now.</div>';
       return;
     }

     const renderLimit = Math.max(CATALOG_INITIAL_LIMIT, Number(state.catalogRenderLimit) || CATALOG_INITIAL_LIMIT);
     const visible = filtered.slice(0, renderLimit);
     const hasMore = filtered.length > visible.length;

     container.innerHTML = visible.map(adventure => {
       const visited = Boolean(visitMap[adventure.id]);
       const categories = categoriesForAdventure(adventure).map(category => getCategoryMeta(category)?.icon || '📍').join(' ');
       return `
         <div class="visited-catalog-row">
           <div>
             <div class="visited-catalog-name">${escapeHtml(adventure.name)} ${categories}</div>
             <div class="visited-catalog-meta">${escapeHtml(adventure.city)}, ${escapeHtml(adventure.state)} • ${escapeHtml(adventure.driveTime || 'Drive time unknown')}</div>
           </div>
           <button type="button" class="quick-filter-btn ${visited ? 'active' : ''}" data-visit-action="toggle" data-location-id="${escapeHtml(adventure.id)}" title="${visited ? 'Mark as not visited' : 'Mark as visited'}" data-tooltip="${visited ? 'Mark as not visited' : 'Mark as visited'}" style="pointer-events: auto !important; position: relative !important; z-index: 2501 !important;">
             ${visited ? '✅ Visited' : '➕ Mark'}
           </button>
         </div>
       `;
     }).join('') + (hasMore
       ? `<div class="visited-catalog-footer"><button type="button" class="visited-load-more-btn" data-catalog-action="load-more" style="pointer-events: auto !important; position: relative !important; z-index: 2501 !important;">Load more (${visible.length}/${filtered.length})</button></div>`
       : '');

     applyTooltipInfoIcons(container);
   }

    async function refreshTab() {
      renderLoadingState();
      try {
        await Promise.all([
          resolveAdventureVisitedColumnIndex().catch(() => -1),
          resolveBikeVisitedColumnIndex().catch(() => -1)
        ]);

        renderSyncHealthBadge();

        const adventures = readAllLocations();
        let visitMap = getVisitMap();
        visitMap = hydrateVisitMapFromExcel(adventures, visitMap);
        saveVisitMap(visitMap);

        state.latestLocations = adventures;
        state.latestVisitMap = visitMap;

        const stats = buildStats(adventures, visitMap);
        const challengeProgress = buildChallengeProgress(stats);
        const insights = computeVisitInsights(stats, visitMap);
        const badges = buildBadgeProgress(stats, insights);
        const questSet = buildRotatingQuests(insights);
        const suggestions = generateSuggestions(adventures, visitMap, challengeProgress);

        renderSummary(stats, challengeProgress, badges, questSet);
        renderCategories(stats);
        renderChallenges(challengeProgress);
        renderBadges(badges);
        renderRotatingQuests(questSet);
        renderHeatmap(stats);
        renderSuggestions(suggestions);
        renderRecentVisits(stats, visitMap);
        renderCatalog(adventures, visitMap);

        const dataStatus = document.getElementById('visitedDataStatus');
        if (dataStatus) {
          const adventureCount = adventures.filter(item => item.sourceType === 'adventure').length;
          const bikeCount = adventures.filter(item => item.sourceType === 'bike').length;
          dataStatus.textContent = `${adventures.length} total locations (${adventureCount} adventure + ${bikeCount} bike) • ${stats.visited.length} visited tracked`;
        }

        state.lastRenderAt = new Date().toISOString();
        renderSyncMeta(visitMap);
        renderVisitedDiagnosticsPanel(visitMap);
        renderSubtabStatusBars();

        const root = document.getElementById('visitedLocationsRoot');
        applyTooltipInfoIcons(root);
        scheduleVisitedSubTabInterceptionCheck(root, 60);

        // Defensive: ensure all buttons are responsive after rendering
        ensureButtonsResponsive();
      } finally {
        clearLoadingState();
      }
    }

  function findAdventureById(locationId) {
    const adventures = Array.isArray(state.latestLocations) && state.latestLocations.length > 0
      ? state.latestLocations
      : readAllLocations();
    return adventures.find(adventure => adventure.id === locationId) || null;
  }

  async function toggleVisited(locationId) {
    const visitMap = getVisitMap();
    const location = findAdventureById(locationId);

    if (visitMap[locationId]) {
      delete visitMap[locationId];
      saveVisitMap(visitMap);

      try {
        if (location) {
          await persistVisitedToExcel(location, false);
        }
        if (typeof window.showToast === 'function') {
          window.showToast('Visit removed from tracker', 'info', 2000);
        }
      } catch (error) {
        if (typeof window.showToast === 'function') {
          window.showToast(`Local-only update: ${error.message}`, 'warning', 3200);
        }
      }

      await refreshTab();
      return;
    }

    const adventure = location;
    visitMap[locationId] = {
      name: adventure ? adventure.name : locationId,
      visitedAt: new Date().toISOString(),
      sourceType: adventure ? adventure.sourceType : 'unknown',
      synced: false
    };

    saveVisitMap(visitMap);

    try {
      if (adventure) {
        await persistVisitedToExcel(adventure, true);
        visitMap[locationId].synced = true;
        saveVisitMap(visitMap);
      }
    } catch (error) {
      if (typeof window.showToast === 'function') {
        window.showToast(`Local-only update: ${error.message}`, 'warning', 3200);
      }
    }

    if (typeof window.showToast === 'function') {
      window.showToast(`Logged: ${adventure ? adventure.name : 'Location'} 🎉`, 'success', 2500);
    }

    await refreshTab();
  }

    function ensureButtonsResponsive() {
      const root = document.getElementById('visitedLocationsRoot');
      if (!root) return;

      // Defensive: ensure all interactive elements are clickable
      const rootButtons = root.querySelectorAll(
        'button, [role="button"], [data-visit-action], [data-progress-subtab], [data-catalog-filter], [data-category-filter], .quick-filter-btn, .card-btn'
      );
      const subTabButtons = getProgressSubTabButtons(root);
      const buttons = Array.from(new Set([...Array.from(rootButtons), ...subTabButtons]));
      const categoryFilterButtons = root.querySelectorAll('[data-category-filter]');

      buttons.forEach((btn) => {
        if (btn.style && typeof btn.style.setProperty === 'function') {
          btn.style.setProperty('pointer-events', 'auto', 'important');
          btn.style.setProperty('position', 'relative', 'important');
          btn.style.setProperty('z-index', '2501', 'important');
        } else if (btn.style) {
          btn.style.pointerEvents = 'auto';
          btn.style.position = 'relative';
          btn.style.zIndex = '2501';
        }
        btn.disabled = false;
      });

      syncCategoryFocusButtons(root);

      logVisitedDiagnostics(`✅ ensureButtonsResponsive() fixed ${buttons.length} buttons (${categoryFilterButtons.length} category filters)`);
    }

    function ensureVisitedSubtabCtaButtons(root) {
      if (!root) return { total: 0, present: 0, added: 0, missing: [] };
      const requiredActions = [
        'refresh-subtab-outdoors', 'undo-subtab-outdoors', 'open-explorer-outdoors', 'open-visit-log-outdoors', 'open-city-explorer-outdoors', 'open-edit-mode-outdoors',
        'refresh-subtab-entertainment', 'undo-subtab-entertainment', 'open-explorer-entertainment', 'open-visit-log-entertainment', 'open-city-explorer-entertainment', 'open-edit-mode-entertainment',
        'refresh-subtab-food-drink', 'undo-subtab-food-drink', 'open-explorer-food-drink', 'open-visit-log-food-drink', 'open-city-explorer-food-drink', 'open-edit-mode-food-drink',
        'refresh-subtab-retail', 'undo-subtab-retail', 'open-explorer-retail', 'open-visit-log-retail', 'open-city-explorer-retail', 'open-edit-mode-retail',
        'refresh-subtab-wildlife-animals', 'undo-subtab-wildlife-animals', 'open-explorer-wildlife-animals', 'open-visit-log-wildlife-animals', 'open-city-explorer-wildlife-animals', 'open-edit-mode-wildlife-animals',
        'refresh-subtab-regional-festivals', 'undo-subtab-regional-festivals', 'open-explorer-regional-festivals', 'open-visit-log-regional-festivals', 'open-city-explorer-regional-festivals', 'open-edit-mode-regional-festivals',
        'refresh-subtab-bike-trails', 'undo-subtab-bike-trails', 'explore-bike-trails', 'open-city-explorer-bike-trails', 'open-edit-mode-bike-trails'
      ];
      const legacyActions = [
        'find-outdoor-adventure',
        'find-entertainment-spot',
        'find-food-drink-spot',
        'find-retail-location',
        'find-wildlife-animals',
        'find-regional-festivals',
        'find-bike-trail'
      ];
      let addedCount = 0;

      const ensureActionRow = (paneSelector) => {
        const pane = root.querySelector(paneSelector);
        if (!pane) return null;
        let row = pane.querySelector('.visited-subtab-action-row');
        if (row) return row;
        row = document.createElement('div');
        row.className = 'visited-subtab-action-row ui-action-rail ui-mobile-primary-stack';
        row.style.marginTop = '12px';
        row.style.display = 'flex';
        row.style.gap = '8px';
        row.style.flexWrap = 'wrap';
        const empty = pane.querySelector('.visited-empty');
        if (empty) {
          empty.appendChild(row);
        } else {
          const card = pane.querySelector('.card');
          if (card) card.appendChild(row);
        }
        return row;
      };

      const ensureButton = (container, action, label, title) => {
        if (!container) return false;
        if (container.querySelector(`[data-visited-subtab-action="${action}"]`)) return false;
        const btn = document.createElement('button');
        btn.type = 'button';
        const className = action.startsWith('refresh-subtab-')
          ? 'visited-subtab-action-btn visited-subtab-action-btn--refresh'
          : action.startsWith('undo-subtab-')
            ? 'visited-subtab-action-btn visited-subtab-action-btn--undo'
            : action.startsWith('open-visit-log-')
              ? 'visited-subtab-action-btn visited-subtab-action-btn--log'
            : 'visited-subtab-action-btn';
        btn.className = className;
        btn.setAttribute('data-visited-subtab-action', action);
        btn.setAttribute('title', title);
        btn.setAttribute('data-tooltip', title);
        btn.textContent = label;
        if (action.startsWith('undo-subtab-')) {
          btn.setAttribute('aria-disabled', 'true');
          btn.disabled = true;
        }
        container.appendChild(btn);
        addedCount += 1;
        return true;
      };

      legacyActions.forEach((action) => {
        root.querySelectorAll(`[data-visited-subtab-action="${action}"]`).forEach((node) => node.remove());
      });

      const ensureCanonicalActionRow = (subtabKey) => {
        const pane = root.querySelector(`#visitedProgressPane-${subtabKey}`);
        if (!pane) return null;
        const row = pane.querySelector('.visited-subtab-action-row') || ensureActionRow(`#visitedProgressPane-${subtabKey}`);
        return row;
      };

      const reorderActionRow = (row, orderedActions) => {
        if (!row) return;
        orderedActions.forEach((action) => {
          const button = row.querySelector(`[data-visited-subtab-action="${action}"]`);
          if (button) row.appendChild(button);
        });
      };

      const canonicalAdventureOrder = (subtabKey) => [
        `open-explorer-${subtabKey}`,
        `open-city-explorer-${subtabKey}`,
        `open-visit-log-${subtabKey}`,
        `open-edit-mode-${subtabKey}`,
        `refresh-subtab-${subtabKey}`,
        `undo-subtab-${subtabKey}`
      ];

      const outdoorsRow = ensureCanonicalActionRow('outdoors');
      ensureButton(outdoorsRow, 'open-explorer-outdoors', 'Explore Outdoors', 'Explore the Outdoors');
      ensureButton(outdoorsRow, 'open-city-explorer-outdoors', 'City Explorer', 'Open City Explorer filtered for Outdoors');
      ensureButton(outdoorsRow, 'open-visit-log-outdoors', 'Log a Visit', 'Log an Outdoors visit');
      ensureButton(outdoorsRow, 'open-edit-mode-outdoors', 'Edit Mode', 'Open Edit Mode for Outdoors');
      ensureButton(outdoorsRow, 'refresh-subtab-outdoors', 'Refresh Data', 'Refresh Outdoors data');
      ensureButton(outdoorsRow, 'undo-subtab-outdoors', '↶ Undo', 'No Outdoors action to undo yet');
      reorderActionRow(outdoorsRow, canonicalAdventureOrder('outdoors'));

      const entertainmentRow = ensureCanonicalActionRow('entertainment');
      ensureButton(entertainmentRow, 'open-explorer-entertainment', 'Explore Entertainment', 'Explore Entertainment');
      ensureButton(entertainmentRow, 'open-city-explorer-entertainment', 'City Explorer', 'Open City Explorer filtered for Entertainment');
      ensureButton(entertainmentRow, 'open-visit-log-entertainment', 'Log a Visit', 'Log an Entertainment visit');
      ensureButton(entertainmentRow, 'open-edit-mode-entertainment', 'Edit Mode', 'Open Edit Mode for Entertainment');
      ensureButton(entertainmentRow, 'refresh-subtab-entertainment', 'Refresh Data', 'Refresh Entertainment data');
      ensureButton(entertainmentRow, 'undo-subtab-entertainment', '↶ Undo', 'No Entertainment action to undo yet');
      reorderActionRow(entertainmentRow, canonicalAdventureOrder('entertainment'));

      const foodDrinkRow = ensureCanonicalActionRow('food-drink');
      ensureButton(foodDrinkRow, 'open-explorer-food-drink', 'Explore Food & Drink', 'Explore Food and Drink');
      ensureButton(foodDrinkRow, 'open-city-explorer-food-drink', 'City Explorer', 'Open City Explorer filtered for Food & Drink');
      ensureButton(foodDrinkRow, 'open-visit-log-food-drink', 'Log a Visit', 'Log a Food and Drink visit');
      ensureButton(foodDrinkRow, 'open-edit-mode-food-drink', 'Edit Mode', 'Open Edit Mode for Food & Drink');
      ensureButton(foodDrinkRow, 'refresh-subtab-food-drink', 'Refresh Data', 'Refresh Food and Drink data');
      ensureButton(foodDrinkRow, 'undo-subtab-food-drink', '↶ Undo', 'No Food and Drink action to undo yet');
      reorderActionRow(foodDrinkRow, canonicalAdventureOrder('food-drink'));

      const retailRow = ensureCanonicalActionRow('retail');
      ensureButton(retailRow, 'open-explorer-retail', 'Explore Retail', 'Explore Retail');
      ensureButton(retailRow, 'open-city-explorer-retail', 'City Explorer', 'Open City Explorer filtered for Retail');
      ensureButton(retailRow, 'open-visit-log-retail', 'Log a Visit', 'Log a Retail visit');
      ensureButton(retailRow, 'open-edit-mode-retail', 'Edit Mode', 'Open Edit Mode for Retail');
      ensureButton(retailRow, 'refresh-subtab-retail', 'Refresh Data', 'Refresh Retail data');
      ensureButton(retailRow, 'undo-subtab-retail', '↶ Undo', 'No Retail action to undo yet');
      reorderActionRow(retailRow, canonicalAdventureOrder('retail'));

      const wildlifeAnimalsRow = ensureCanonicalActionRow('wildlife-animals');
      ensureButton(wildlifeAnimalsRow, 'open-explorer-wildlife-animals', 'Explore Wildlife & Animal Locations', 'Explore Wildlife and Animal Locations');
      ensureButton(wildlifeAnimalsRow, 'open-city-explorer-wildlife-animals', 'City Explorer', 'Open City Explorer filtered for Wildlife & Animals');
      ensureButton(wildlifeAnimalsRow, 'open-visit-log-wildlife-animals', 'Log a Visit', 'Log a Wildlife and Animals visit');
      ensureButton(wildlifeAnimalsRow, 'open-edit-mode-wildlife-animals', 'Edit Mode', 'Open Edit Mode for Wildlife & Animals');
      ensureButton(wildlifeAnimalsRow, 'refresh-subtab-wildlife-animals', 'Refresh Data', 'Refresh Wildlife and Animals data');
      ensureButton(wildlifeAnimalsRow, 'undo-subtab-wildlife-animals', '↶ Undo', 'No Wildlife and Animals action to undo yet');
      reorderActionRow(wildlifeAnimalsRow, canonicalAdventureOrder('wildlife-animals'));

      const regionalFestivalsRow = ensureCanonicalActionRow('regional-festivals');
      ensureButton(regionalFestivalsRow, 'open-explorer-regional-festivals', 'Explore Regional Festivals', 'Explore Regional Festivals');
      ensureButton(regionalFestivalsRow, 'open-city-explorer-regional-festivals', 'City Explorer', 'Open City Explorer filtered for Regional Festivals');
      ensureButton(regionalFestivalsRow, 'open-visit-log-regional-festivals', 'Log a Visit', 'Log a Regional Festivals visit');
      ensureButton(regionalFestivalsRow, 'open-edit-mode-regional-festivals', 'Edit Mode', 'Open Edit Mode for Regional Festivals');
      ensureButton(regionalFestivalsRow, 'refresh-subtab-regional-festivals', 'Refresh Data', 'Refresh Regional Festivals data');
      ensureButton(regionalFestivalsRow, 'undo-subtab-regional-festivals', '↶ Undo', 'No Regional Festivals action to undo yet');
      reorderActionRow(regionalFestivalsRow, canonicalAdventureOrder('regional-festivals'));

      const bikeRow = ensureCanonicalActionRow('bike-trails');
      ensureButton(bikeRow, 'explore-bike-trails', 'Explore Bike Trails', 'Explore Bike Trails');
      ensureButton(bikeRow, 'open-city-explorer-bike-trails', 'City Explorer', 'Open City Explorer filtered for Bike Trails');
      ensureButton(bikeRow, 'open-edit-mode-bike-trails', 'Edit Mode', 'Open Edit Mode for Bike Trails');
      ensureButton(bikeRow, 'refresh-subtab-bike-trails', 'Refresh Data', 'Refresh Bike Trails data');
      ensureButton(bikeRow, 'undo-subtab-bike-trails', '↶ Undo', 'No Bike Trails action to undo yet');
      reorderActionRow(bikeRow, [
        'explore-bike-trails',
        'open-city-explorer-bike-trails',
        'open-edit-mode-bike-trails',
        'refresh-subtab-bike-trails',
        'undo-subtab-bike-trails'
      ]);

      const present = requiredActions.reduce((count, action) => {
        return count + (root.querySelector(`[data-visited-subtab-action="${action}"]`) ? 1 : 0);
      }, 0);
      const missing = requiredActions.filter((action) => !root.querySelector(`[data-visited-subtab-action="${action}"]`));
      return {
        total: requiredActions.length,
        present,
        added: addedCount,
        missing
      };
    }

    function renderVisitedCtaInjectorStatus(root, report) {
      if (!root) return;
      const chip = root.querySelector('#visitedCtaInjectorStatus');
      if (!chip) return;

      const data = report || { total: 0, present: 0, added: 0, missing: [] };
      chip.classList.remove('ok', 'warn');

      if (data.total > 0 && data.present === data.total) {
        chip.classList.add('ok');
        chip.textContent = data.added > 0
          ? `CTA buttons: synced (+${data.added} recovered)`
          : 'CTA buttons: synced';
        return;
      }

      chip.classList.add('warn');
      chip.textContent = `CTA buttons: partial (${data.present}/${data.total})`;
    }

    function bindControls() {
      const root = document.getElementById('visitedLocationsRoot');
      if (!root) return;

      // Fail-safe for stale cached tab markup: ensure requested CTA buttons always exist.
      const ctaSyncReport = ensureVisitedSubtabCtaButtons(root);
      scheduleVisitedSubtabCtaOrderFinalization(root);
      renderVisitedCtaInjectorStatus(root, ctaSyncReport);

      // PREVENT DUPLICATE EVENT LISTENERS: Use a stronger check
      if (root.dataset.bound === '1' && root.__visitedClickHandler) {
        logVisitedDiagnostics('✅ Adventure Challenge controls already bound - skipping rebind');
        return;
      }

      logVisitedDiagnostics('🔌 Binding Adventure Challenge controls...');

      // Store bound flag and handler reference for cleanup/dedup
      root.dataset.bound = '1';

      if (root.dataset.inlineToolMessageBound !== '1') {
        root.dataset.inlineToolMessageBound = '1';
        window.addEventListener('message', (event) => {
          if (!event || event.origin !== window.location.origin) return;
          const data = event.data || {};
          if (data.type !== 'planner-inline-tool-close') return;
          const subtabKey = String(data.sourceSubtab || state.activeProgressSubTab || 'outdoors').trim();
          if (data.tool === 'city-viewer') closeCityExplorerForSubtab(root, subtabKey);
          if (data.tool === 'edit-mode') closeEditModeForSubtab(root, subtabKey);
        });
      }

      const subtabBar = getVisitedSubTabsElement(root);
      if (subtabBar) {
        subtabBar.style.pointerEvents = 'auto';
        subtabBar.style.position = 'relative';
        subtabBar.style.zIndex = '2500';
      }

      syncProgressSubTabs(root);
      syncVisitedOverviewView(root);
      bindAllExplorerFilterInputs(root);
      bindProgressSubTabButtons(root);
      syncVisitedSubTabDock(root);
      announceProgressSubTab(root, state.activeProgressSubTab);
      state.latestVisitMap = getVisitMap();
      renderSyncMeta(state.latestVisitMap);
      renderSubtabStatusBars();
      initMobileTooltipSupport(root);
      installVisitedClickTracer(root);
      applyTooltipInfoIcons(root);
      installExplorerDetailsKeyboardClose();

      // Monitor DOM for dynamically added buttons and ensure they're responsive
      const observer = new MutationObserver((mutations) => {
        let hasButtonChanges = false;
        for (const mutation of mutations) {
          if (mutation.type === 'childList' || mutation.type === 'subtree') {
            const nodes = Array.from(mutation.addedNodes);
            if (nodes.some(node => {
              if (!node.querySelectorAll) return false;
              return node.querySelectorAll('button, [data-visit-action], [data-progress-subtab]').length > 0;
            })) {
              hasButtonChanges = true;
              break;
            }
          }
        }
        if (hasButtonChanges) {
          // Use requestAnimationFrame to batch multiple mutations
          requestAnimationFrame(() => {
            const mutationCtaSyncReport = ensureVisitedSubtabCtaButtons(root);
            scheduleVisitedSubtabCtaOrderFinalization(root);
            renderVisitedCtaInjectorStatus(root, mutationCtaSyncReport);
            ensureButtonsResponsive();
          });
        }
      });

      observer.observe(root, {
        childList: true,
        subtree: true,
        attributes: false
      });

      // CREATE THE MAIN CLICK HANDLER FUNCTION (stored to prevent duplicate attachment)
      if (!root.__visitedClickHandler) {
        root.__visitedClickHandler = function handleVisitedClick(event) {
          // Normalize event target: text nodes don't have .closest(), so resolve to parentElement.
          const rawTgt = event && event.target ? event.target : null;
          const ct = rawTgt && rawTgt.nodeType === Node.ELEMENT_NODE
            ? rawTgt
            : (rawTgt && rawTgt.parentElement ? rawTgt.parentElement : null);
          if (!ct || typeof ct.closest !== 'function') return;

          if (!ct.closest('[data-visited-explorer-quick-actions-toggle]') && !ct.closest('[data-visited-explorer-quick-actions-menu]')) {
            root.querySelectorAll('[data-visited-explorer-quick-actions-menu]').forEach((menu) => {
              menu.hidden = true;
            });
            root.querySelectorAll('[data-visited-explorer-quick-actions-toggle]').forEach((btn) => {
              btn.setAttribute('aria-expanded', 'false');
            });
          }

          const openSuggestionsBtn = ct.closest('#visitedOpenSuggestionsBtn');
          if (openSuggestionsBtn) {
            event.preventDefault();
            setVisitedOverviewView(root, 'suggestions');
            return;
          }

          const backSuggestionsBtn = ct.closest('#visitedSuggestionsBackBtn');
          if (backSuggestionsBtn) {
            event.preventDefault();
            setVisitedOverviewView(root, 'main');
            return;
          }

          const subtabActionBtn = ct.closest('[data-visited-subtab-action]');
          if (subtabActionBtn) {
            event.preventDefault();
            const action = String(subtabActionBtn.getAttribute('data-visited-subtab-action') || '').trim();

            const explorerOpenConfig = Object.values(ADVENTURE_SUBTAB_EXPLORER_CONFIG).find((config) => config.openAction === action);
            if (explorerOpenConfig) {
              openSubtabExplorer(root, explorerOpenConfig.key);
              return;
            }

            const explorerCloseConfig = Object.values(ADVENTURE_SUBTAB_EXPLORER_CONFIG).find((config) => config.closeAction === action);
            if (explorerCloseConfig) {
              closeSubtabExplorer(root, explorerCloseConfig.key);
              return;
            }

            if (action.startsWith('refresh-subtab-')) {
              runRefreshWithLock(subtabActionBtn);
              return;
            }

            if (action.startsWith('undo-subtab-')) {
              if (typeof window.showToast === 'function') {
                window.showToast('No Adventure action to undo yet.', 'info', 2200);
              }
              return;
            }

            if (action.startsWith('open-visit-log-')) {
              const subtabKey = action.replace('open-visit-log-', '');
              if (subtabKey) {
                openVisitLogModal({ subtabKey });
              }
              return;
            }

            if (action === 'explore-bike-trails') {
              if (typeof window.openTrailExplorerWindow === 'function') {
                window.openTrailExplorerWindow();
              } else if (window.tabLoader && typeof window.tabLoader.switchTab === 'function') {
                window.tabLoader.switchTab('bike-trails', { syncUrl: true, historyMode: 'push', source: 'visited-subtab-cta' });
              }
              return;
            }

            if (action.startsWith('open-city-explorer-')) {
              const subtabKey = action.replace('open-city-explorer-', '');
              openCityExplorerForSubtab(subtabKey);
              return;
            }

            if (action.startsWith('close-city-explorer-')) {
              const subtabKey = action.replace('close-city-explorer-', '');
              closeCityExplorerForSubtab(root, subtabKey);
              return;
            }

            if (action.startsWith('open-edit-mode-')) {
              const subtabKey = action.replace('open-edit-mode-', '');
              openEditModeForSubtab(subtabKey);
              return;
            }

            if (action.startsWith('close-edit-mode-')) {
              const subtabKey = action.replace('close-edit-mode-', '');
              closeEditModeForSubtab(root, subtabKey);
              return;
            }

            if (action.startsWith('close-explorer-details-')) {
              const subtabKey = action.replace('close-explorer-details-', '');
              setExplorerView(root, subtabKey, 'explorer');
              return;
            }

          }

          const explainBtn = ct.closest('[data-suggestion-explain-toggle]');
          if (explainBtn) {
            event.preventDefault();
            const targetId = explainBtn.getAttribute('data-suggestion-explain-toggle');
            const panel = targetId ? document.getElementById(targetId) : null;
            if (panel) {
              const expanded = explainBtn.getAttribute('aria-expanded') === 'true';
              explainBtn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
              panel.hidden = expanded;
            }
            return;
          }

          const explorerDetailsBtn = ct.closest('[data-visited-explorer-details]');
          if (explorerDetailsBtn) {
            event.preventDefault();
            const subtabKey = String(explorerDetailsBtn.getAttribute('data-visited-explorer-subtab') || state.activeProgressSubTab || '').trim();
            const itemId = String(explorerDetailsBtn.getAttribute('data-visited-explorer-details') || '').trim();
            if (subtabKey && itemId) {
              openExplorerDetailsPage(root, subtabKey, itemId);
            }
            return;
          }

          const explorerQuickActionsBtn = ct.closest('[data-visited-explorer-quick-actions-toggle]');
          if (explorerQuickActionsBtn) {
            event.preventDefault();
            const itemId = String(explorerQuickActionsBtn.getAttribute('data-visited-explorer-quick-actions-toggle') || '').trim();
            const card = explorerQuickActionsBtn.closest('.visited-explorer-card');
            const targetMenu = card ? card.querySelector(`[data-visited-explorer-quick-actions-menu="${itemId}"]`) : null;
            const willOpen = Boolean(targetMenu && targetMenu.hidden);
            root.querySelectorAll('[data-visited-explorer-quick-actions-menu]').forEach((menu) => {
              menu.hidden = true;
            });
            root.querySelectorAll('[data-visited-explorer-quick-actions-toggle]').forEach((btn) => {
              btn.setAttribute('aria-expanded', 'false');
            });
            if (targetMenu) {
              targetMenu.hidden = !willOpen;
              explorerQuickActionsBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
            }
            return;
          }

          const explorerGoogleBtn = ct.closest('[data-visited-explorer-open-google]');
          if (explorerGoogleBtn) {
            event.preventDefault();
            const subtabKey = String(explorerGoogleBtn.getAttribute('data-visited-explorer-subtab') || state.activeProgressSubTab || '').trim();
            const itemId = String(explorerGoogleBtn.getAttribute('data-visited-explorer-open-google') || '').trim();
            const item = getExplorerItemById(subtabKey, itemId);
            if (item && item.googleUrl) {
              window.open(item.googleUrl, '_blank', 'noopener');
            } else if (typeof window.showToast === 'function') {
              window.showToast('Google URL is unavailable for this location.', 'info', 2200);
            }
            return;
          }

          const explorerDirectionsBtn = ct.closest('[data-visited-explorer-open-directions]');
          if (explorerDirectionsBtn) {
            event.preventDefault();
            const subtabKey = String(explorerDirectionsBtn.getAttribute('data-visited-explorer-subtab') || state.activeProgressSubTab || '').trim();
            const itemId = String(explorerDirectionsBtn.getAttribute('data-visited-explorer-open-directions') || '').trim();
            const item = getExplorerItemById(subtabKey, itemId);
            const directionsUrl = item ? buildExplorerDirectionsUrl(item) : '';
            if (directionsUrl) {
              window.open(directionsUrl, '_blank', 'noopener');
            } else if (typeof window.showToast === 'function') {
              window.showToast('Directions are unavailable for this location.', 'info', 2200);
            }
            return;
          }

          const explorerFavoriteBtn = ct.closest('[data-visited-explorer-favorite]');
          if (explorerFavoriteBtn) {
            event.preventDefault();
            const subtabKey = String(explorerFavoriteBtn.getAttribute('data-visited-explorer-subtab') || state.activeProgressSubTab || '').trim();
            const itemId = String(explorerFavoriteBtn.getAttribute('data-visited-explorer-favorite') || '').trim();
            const before = getExplorerCardDraft(itemId);
            updateExplorerCardDraft(itemId, (draft) => ({ ...draft, favorite: !draft.favorite }));
            renderExplorerList(root, subtabKey);
            if (typeof window.showToast === 'function') {
              window.showToast(before.favorite ? 'Removed from favorites.' : 'Added to favorites.', 'success', 1800);
            }
            return;
          }

          const explorerRateBtn = ct.closest('[data-visited-explorer-rate]');
          if (explorerRateBtn) {
            event.preventDefault();
            const subtabKey = String(explorerRateBtn.getAttribute('data-visited-explorer-subtab') || state.activeProgressSubTab || '').trim();
            const itemId = String(explorerRateBtn.getAttribute('data-visited-explorer-rate') || '').trim();
            const value = Math.max(0, Math.min(5, Number(explorerRateBtn.getAttribute('data-visited-explorer-rating-value') || '0')));
            updateExplorerCardDraft(itemId, (draft) => ({ ...draft, rating: value }));
            renderExplorerList(root, subtabKey);
            return;
          }

          const explorerTagsBtn = ct.closest('[data-visited-explorer-tags]');
          if (explorerTagsBtn) {
            event.preventDefault();
            const subtabKey = String(explorerTagsBtn.getAttribute('data-visited-explorer-subtab') || state.activeProgressSubTab || '').trim();
            const itemId = String(explorerTagsBtn.getAttribute('data-visited-explorer-tags') || '').trim();
            const item = getExplorerItemById(subtabKey, itemId);
            if (item) {
              openExplorerDetailsPage(root, subtabKey, itemId);
              const frame = document.getElementById(`visitedExplorerDetailsFrame-${subtabKey}`);
              if (frame) frame.setAttribute('src', buildExplorerDetailsUrl(subtabKey, item, 'tag-management'));
            }
            return;
          }

          const explorerNotesBtn = ct.closest('[data-visited-explorer-notes]');
          if (explorerNotesBtn) {
            event.preventDefault();
            const subtabKey = String(explorerNotesBtn.getAttribute('data-visited-explorer-subtab') || state.activeProgressSubTab || '').trim();
            const itemId = String(explorerNotesBtn.getAttribute('data-visited-explorer-notes') || '').trim();
            const item = getExplorerItemById(subtabKey, itemId);
            if (item) {
              openExplorerDetailsPage(root, subtabKey, itemId);
              const frame = document.getElementById(`visitedExplorerDetailsFrame-${subtabKey}`);
              if (frame) frame.setAttribute('src', buildExplorerDetailsUrl(subtabKey, item, 'notes'));
            }
            return;
          }

          const explorerLogBtn = ct.closest('[data-visited-explorer-log]');
          if (explorerLogBtn) {
            event.preventDefault();
            const subtabKey = String(explorerLogBtn.getAttribute('data-visited-explorer-subtab') || state.activeProgressSubTab || '').trim();
            const itemId = String(explorerLogBtn.getAttribute('data-visited-explorer-log') || '').trim();
            if (subtabKey) {
              openVisitLogModal({ subtabKey, itemId });
            }
            return;
          }

          const closeExplorerModalBtn = ct.closest('#visitedExplorerDetailsCloseBtn, #visitedExplorerDetailsBackdrop');
          if (closeExplorerModalBtn) {
            event.preventDefault();
            closeExplorerDetailsModal();
            return;
          }

          const closeVisitLogBtn = ct.closest('#visitedVisitLogCloseBtn, #visitedVisitLogCancelBtn, #visitedVisitLogBackdrop');
          if (closeVisitLogBtn) {
            event.preventDefault();
            closeVisitLogModal();
            return;
          }

          const loadMoreBtn = ct.closest('[data-catalog-action="load-more"]');
          if (loadMoreBtn) {
            event.preventDefault();
            state.catalogRenderLimit += CATALOG_LOAD_STEP;
            renderCatalog(state.latestLocations || [], state.latestVisitMap || getVisitMap());
            return;
          }

          const progressTabBtn = ct.closest('[data-progress-subtab]');
          if (progressTabBtn) {
            event.preventDefault();
            // Defensive reset: ensure tooltip long-press suppression never bleeds into normal subtab navigation.
            state.mobileTooltip.longPressActive = false;
            state.mobileTooltip.suppressClickUntil = 0;
            state.mobileTooltip.lastLongPressTarget = null;
            const tabKey = progressTabBtn.getAttribute('data-progress-subtab') || 'outdoors';
            if (tabKey !== state.activeProgressSubTab) {
              setActiveProgressSubTab(root, tabKey);
            }
            scheduleVisitedSubTabInterceptionCheck(root, 0);
            return;
          }

          const categoryFilterBtn = ct.closest('[data-category-filter]');
          if (categoryFilterBtn) {
            event.preventDefault();
            event.stopPropagation();

            const nextCategory = categoryFilterBtn.getAttribute('data-category-filter') || 'all';
            const prevFilter = state.categoryFilter || 'all';
            const now = Date.now();
            const elapsed = now - (state.lastCategoryFilterClick || 0);

            if (elapsed < state.categoryFilterDebounceMs) {
              logVisitedDiagnostics(`⏱️ Category filter click debounced (${elapsed}ms since last click)`);
              return;
            }

            state.lastCategoryFilterClick = now;
            state.categoryFilter = prevFilter === nextCategory ? 'all' : nextCategory;

            window.__debugFocusButtons = {
              clicks: (window.__debugFocusButtons?.clicks || 0) + 1,
              lastClick: {
                timestamp: new Date().toISOString(),
                btn: nextCategory,
                prevFilter,
                newFilter: state.categoryFilter,
                isRefreshing: state.isRefreshing,
                btnDisabled: Boolean(categoryFilterBtn.disabled),
                btnPointerEvents: window.getComputedStyle(categoryFilterBtn).pointerEvents
              }
            };

            logVisitedDiagnostics(
              `🔘 Focus button clicked: ${nextCategory} (was: ${prevFilter}), isRefreshing=${state.isRefreshing}, disabled=${Boolean(categoryFilterBtn.disabled)}`
            );

            resetCatalogRenderLimit();
            syncCategoryFocusButtons(root);
            renderCatalog(state.latestLocations || [], state.latestVisitMap || getVisitMap());
            return;
          }

          const jumpBtn = ct.closest('[data-visited-jump]');
          if (jumpBtn) {
            event.preventDefault();
            jumpToVisitedSection(jumpBtn.getAttribute('data-visited-jump') || '');
            return;
          }

          const toggleBtn = ct.closest('[data-visit-action="toggle"]');
          if (toggleBtn) {
            event.preventDefault();
            const locationId = toggleBtn.getAttribute('data-location-id');
            if (locationId && !state.busyVisitToggles.has(locationId)) {
              state.busyVisitToggles.add(locationId);
              setButtonBusy(toggleBtn, true, 'Saving...');
              toggleVisited(locationId)
                .catch((error) => {
                  console.warn('Visited toggle failed:', error);
                })
                .finally(() => {
                  state.busyVisitToggles.delete(locationId);
                  setButtonBusy(toggleBtn, false);
                });
            }
            return;
          }

          const catalogFilterBtn = ct.closest('[data-catalog-filter]');
          if (catalogFilterBtn) {
            event.preventDefault();
            const group = catalogFilterBtn.getAttribute('data-catalog-filter') || '';
            const value = catalogFilterBtn.getAttribute('data-catalog-filter-value') || 'all';
            if (group === 'visit') state.catalogVisitFilter = value;
            if (group === 'source') state.catalogSourceFilter = value;
            resetCatalogRenderLimit();
            renderCatalog(state.latestLocations || [], state.latestVisitMap || getVisitMap());
            return;
          }

        };

        // ATTACH THE HANDLER ONCE
        root.addEventListener('click', root.__visitedClickHandler);
        logVisitedDiagnostics('✅ Adventure Challenge click handler attached (deduped)');
      }

      root.addEventListener('mousemove', (event) => {
      const _mmTgt = event && event.target ? event.target : null;
      const _mmEl = _mmTgt && _mmTgt.nodeType === Node.ELEMENT_NODE
        ? _mmTgt
        : (_mmTgt && _mmTgt.parentElement ? _mmTgt.parentElement : null);
      const hotspot = _mmEl && typeof _mmEl.closest === 'function' ? _mmEl.closest('[data-hotspot-tooltip]') : null;
      if (!hotspot) {
        hideHeatmapTooltip();
        return;
      }

      const raw = String(hotspot.getAttribute('data-hotspot-tooltip') || '');
      const html = raw.includes('&lt;') ? raw
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        : raw;
      showHeatmapTooltip(event.clientX, event.clientY, html);
    });

    root.addEventListener('mouseleave', () => hideHeatmapTooltip());

    const refreshBtn = document.getElementById('visitedRefreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', (event) => {
        event.preventDefault();
        runRefreshWithLock(refreshBtn);
      });
    }

    const weatherEl = document.getElementById('visitedWeatherMode');
    if (weatherEl) {
      weatherEl.addEventListener('change', () => {
        resetCatalogRenderLimit();
        runRefreshWithLock();
      });
    }

    const searchInput = document.getElementById('visitedSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        state.searchText = searchInput.value || '';
        resetCatalogRenderLimit();
        renderCatalog(state.latestLocations || [], state.latestVisitMap || getVisitMap());
      });
    }

    const visitLogForm = document.getElementById('visitedVisitLogForm');
    if (visitLogForm && visitLogForm.dataset.bound !== '1') {
      visitLogForm.dataset.bound = '1';
      visitLogForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        await submitVisitLogForm();
      });
    }

    const visitLogLocationSelect = document.getElementById('visitedVisitLogLocationSelect');
    if (visitLogLocationSelect && visitLogLocationSelect.dataset.bound !== '1') {
      visitLogLocationSelect.dataset.bound = '1';
      visitLogLocationSelect.addEventListener('change', () => {
        syncVisitLogLocationSelection(visitLogLocationSelect.value);
      });
    }

    const visitLogLocationSearch = document.getElementById('visitedVisitLogLocationSearch');
    if (visitLogLocationSearch && visitLogLocationSearch.dataset.bound !== '1') {
      visitLogLocationSearch.dataset.bound = '1';
      visitLogLocationSearch.addEventListener('input', () => {
        state.visitLogLocationQuery = String(visitLogLocationSearch.value || '').trim();
        const selectedId = renderVisitLogLocationOptions();
        syncVisitLogLocationSelection(selectedId || '');
      });
      visitLogLocationSearch.addEventListener('keydown', (event) => {
        if (!visitLogLocationSelect) return;
        if (event.key === 'Enter') {
          const selectable = Array.from(visitLogLocationSelect.options || [])
            .filter((option) => String(option.value || '').trim());
          if (!selectable.length) return;
          event.preventDefault();
          const currentValue = String(visitLogLocationSelect.value || '').trim();
          const nextValue = selectable.some((option) => String(option.value || '').trim() === currentValue)
            ? currentValue
            : String(selectable[0].value || '').trim();
          syncVisitLogLocationSelection(nextValue);
          return;
        }

        if (event.key === 'Escape') {
          const currentQuery = String(visitLogLocationSearch.value || '').trim();
          if (!currentQuery) return;
          event.preventDefault();
          visitLogLocationSearch.value = '';
          state.visitLogLocationQuery = '';
          const selectedId = renderVisitLogLocationOptions();
          syncVisitLogLocationSelection(selectedId || '');
          return;
        }

        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        const selectable = Array.from(visitLogLocationSelect.options || [])
          .filter((option) => String(option.value || '').trim());
        if (!selectable.length) return;

        event.preventDefault();
        const currentValue = String(visitLogLocationSelect.value || '').trim();
        const currentIndex = selectable.findIndex((option) => String(option.value || '').trim() === currentValue);
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        const seedIndex = currentIndex >= 0 ? currentIndex : (direction > 0 ? -1 : selectable.length);
        const nextIndex = Math.max(0, Math.min(selectable.length - 1, seedIndex + direction));
        const nextValue = String(selectable[nextIndex].value || '').trim();
        syncVisitLogLocationSelection(nextValue);
      });
    }

    const visitLogPhotoInput = document.getElementById('visitedVisitLogPhotoInput');
    if (visitLogPhotoInput && visitLogPhotoInput.dataset.bound !== '1') {
      visitLogPhotoInput.dataset.bound = '1';
      visitLogPhotoInput.addEventListener('change', () => {
        const files = getVisitLogPhotoFiles();
        if (!files.length) {
          setVisitLogPhotoStatus('Attach one or more photos to upload them to OneDrive when you save.');
          return;
        }
        setVisitLogPhotoStatus(`${files.length} photo${files.length === 1 ? '' : 's'} selected for upload.`, 'warn');
      });
    }

    root.addEventListener('pointerdown', (event) => {
      if (!event.target.closest || !event.target.closest('[data-progress-subtab]')) return;
      scheduleVisitedSubTabInterceptionCheck(root, 0);
    }, true);

      if (!root.dataset.tabSwitchListenerBound) {
        root.dataset.tabSwitchListenerBound = '1';
        window.addEventListener('app:tab-switched', (event) => {
          const liveRoot = document.getElementById('visitedLocationsRoot');
          if (!liveRoot) return;
          syncVisitedSubTabDock(liveRoot);
          if (!event || !event.detail || event.detail.tabId !== 'visited-locations') return;
          ensureButtonsResponsive();
          scheduleVisitedSubTabInterceptionCheck(liveRoot, 40);
        });
      }

      if (!root.dataset.visitedSubTabDockResizeBound) {
        root.dataset.visitedSubTabDockResizeBound = '1';
        window.addEventListener('resize', () => {
          const liveRoot = document.getElementById('visitedLocationsRoot');
          if (!liveRoot) return;
          syncVisitedSubTabDock(liveRoot);
          scheduleVisitedSubTabInterceptionCheck(liveRoot, 50);
        });
      }

      bindVisitedPrimaryTabFallbackSync(root);
      ensureVisitedHeaderSyncIndicator();
      renderVisitedHeaderSyncIndicator(state.latestVisitMap || getVisitMap());

    scheduleVisitedSubTabInterceptionCheck(root, 80);
  }

  function scheduleDataRefreshCheck() {
    const currentCount = Array.isArray(window.adventuresData) ? window.adventuresData.length : 0;
    if (currentCount > 0) return;

    let attempts = 0;
    const intervalId = setInterval(() => {
      attempts += 1;
      if (Array.isArray(window.adventuresData) && window.adventuresData.length > 0) {
        refreshTab();
        clearInterval(intervalId);
        return;
      }

      if (attempts >= 60) {
        clearInterval(intervalId);
      }
    }, 1000);
  }

  async function ensureBikeDataLoadedForTracker() {
    if (state.bikeLoadRequested) return;
    if (!window.accessToken || typeof window.loadBikeTable !== 'function') return;
    if (Array.isArray(window.bikeTrailsData) && window.bikeTrailsData.length > 0) return;

    state.bikeLoadRequested = true;
    try {
      await window.loadBikeTable();
    } catch (_) {
      // Bike data load is best-effort here.
    }
  }

  function initializeVisitedLocationsTab() {
    loadChallengeState();
    loadMetaState();
    loadVisitRecords();
    loadExplorerCardState();
    bindControls();
    ensureBikeDataLoadedForTracker().finally(() => refreshTab());
    scheduleDataRefreshCheck();

    if (!state.initialized) {
      logVisitedDiagnostics('✅ Adventure Challenge tab initialized');
      state.initialized = true;
    }
  }

  window.initializeVisitedLocationsTab = initializeVisitedLocationsTab;
  window.initVisitedLocationsTab = window.initVisitedLocationsTab || initializeVisitedLocationsTab;
  window.forceVisitedExplorerSync = forceVisitedExplorerSync;
  window.openVisitedVisitLogFromAchievements = openVisitedVisitLogFromAchievements;
  window.getVisitedTrackerSyncHealth = getSyncHealthStatus;
  window.syncVisitedExplorerDetailFields = syncVisitedExplorerDetailFields;
  window.__visitedState = state;
  window.enableVisitedClickTrace = function() {
    state.tracerEnabled = true;
    window.__visitedClickTrace = true;
    console.log('✅ visited click trace enabled');
  };
  window.disableVisitedClickTrace = function() {
    state.tracerEnabled = false;
    window.__visitedClickTrace = false;
    console.log('✅ visited click trace disabled');
  };
  window.enableVisitedDiagnostics = function() {
    state.diagnosticsEnabled = true;
    window.__visitedDiagnostics = true;
    console.log('✅ visited diagnostics enabled');
  };
  window.disableVisitedDiagnostics = function() {
    state.diagnosticsEnabled = false;
    window.__visitedDiagnostics = false;
    console.log('✅ visited diagnostics disabled');
  };
})();

