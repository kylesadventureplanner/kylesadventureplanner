/*
 * Visited Locations Tab System
 * Gamified progress tracking + smart suggestions for adventures.
 */

(function() {
  const STORAGE_KEY = 'visitedLocationsTrackerV1';
  const CHALLENGE_STATE_KEY = 'visitedLocationsChallengeStateV1';
  const VISITED_META_KEY = 'visitedLocationsMetaV1';

  const CATEGORY_DEFS = [
    { key: 'hiking', label: 'Hiking Trails', icon: '🥾', keywords: ['hiking', 'trail', 'mountain', 'summit'] },
    { key: 'bike', label: 'Bike Trails', icon: '🚴', keywords: ['biking', 'bike', 'cycling', 'paved trail', 'gravel'] },
    { key: 'waterfall', label: 'Waterfalls', icon: '💧', keywords: ['waterfall', 'falls', 'cascade'] },
    { key: 'park', label: 'Parks', icon: '🌳', keywords: ['park', 'nature preserve', 'state park', 'national park'] },
    { key: 'scenic', label: 'Scenic Drives', icon: '🛣️', keywords: ['scenic drive', 'parkway', 'overlook', 'scenic'] },
    { key: 'coffee', label: 'Coffee Shops', icon: '☕', keywords: ['coffee', 'cafe', 'espresso', 'latte'] }
  ];

  const CHALLENGES = [
    { id: 'hiking-rookie', icon: '🥾', title: 'Trail Rookie', category: 'hiking', goal: 5, points: 140, tip: 'Hit 5 hiking trails.' },
    { id: 'bike-blazer', icon: '🚴', title: 'Pedal Blazer', category: 'bike', goal: 5, points: 140, tip: 'Ride 5 bike trail spots.' },
    { id: 'waterfall-hunter', icon: '💧', title: 'Waterfall Hunter', category: 'waterfall', goal: 4, points: 120, tip: 'Visit 4 waterfall locations.' },
    { id: 'park-passport', icon: '🌳', title: 'Park Passport', category: 'park', goal: 6, points: 160, tip: 'Check off 6 parks.' },
    { id: 'road-tripper', icon: '🛣️', title: 'Road Tripper', category: 'scenic', goal: 4, points: 120, tip: 'Complete 4 scenic drives.' },
    { id: 'coffee-circuit', icon: '☕', title: 'Coffee Circuit', category: 'coffee', goal: 6, points: 160, tip: 'Try 6 coffee spots.' },
    { id: 'well-rounded', icon: '🏆', title: 'Well Rounded Explorer', category: null, goal: 6, points: 220, tip: 'Visit at least one in every category.' },
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
    { id: 'all-terrain', icon: '🏅', title: 'All Terrain Master', rarity: 'legendary', points: 250, metric: 'categoryCoverage', goal: 6, description: 'Unlock every category at least once.' },
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

  const RARITY_STYLES = {
    common: { label: 'Common', className: 'rarity-common' },
    rare: { label: 'Rare', className: 'rarity-rare' },
    epic: { label: 'Epic', className: 'rarity-epic' },
    legendary: { label: 'Legendary', className: 'rarity-legendary' }
  };

  const CATALOG_INITIAL_LIMIT = 60;
  const CATALOG_LOAD_STEP = 40;
  const TOOLTIP_INFO_ICON_MIN_CHARS = 34;

  const state = {
    initialized: false,
    activeProgressSubTab: 'overview',
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
      bubbleEl: null
    },
    loadingUiActive: false,
    visitedColumnIndexCache: {
      adventure: null,
      bike: null
    },
    lastRenderAt: null
  };

  function syncProgressSubTabs(root) {
    if (!root) return;
    const active = state.activeProgressSubTab || 'overview';

    root.querySelectorAll('[data-progress-subtab]').forEach((btn) => {
      const tabKey = btn.getAttribute('data-progress-subtab');
      const isActive = tabKey === active;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      btn.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    root.querySelectorAll('[data-progress-pane]').forEach((pane) => {
      const paneKey = pane.getAttribute('data-progress-pane');
      const isActive = paneKey === active;
      pane.classList.toggle('is-active', isActive);
      pane.hidden = !isActive;
      pane.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });
  }

  function announceProgressSubTab(root, tabKey) {
    if (!root) return;
    const announcer = document.getElementById('visitedSubTabAnnouncer');
    if (!announcer) return;
    const btn = root.querySelector(`[data-progress-subtab="${tabKey}"]`);
    const label = btn ? btn.textContent.trim() : 'Overview';
    announcer.textContent = `${label} section active`;
  }

  function setActiveProgressSubTab(root, tabKey) {
    state.activeProgressSubTab = tabKey || 'overview';
    syncProgressSubTabs(root);
    announceProgressSubTab(root, state.activeProgressSubTab);
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

  function renderSyncMeta(visitMap) {
    const el = document.getElementById('visitedSyncMeta');
    if (!el) return;
    const map = visitMap || state.latestVisitMap || {};
    const pending = Object.values(map).filter((entry) => entry && entry.synced === false).length;
    const sourceCounts = (state.latestLocations || []).reduce((acc, item) => {
      const key = item && item.sourceType === 'bike' ? 'bike' : 'adventure';
      acc[key] += 1;
      return acc;
    }, { adventure: 0, bike: 0 });
    const since = formatRelativeTime(state.lastRenderAt);
    el.textContent = `Last synced: ${since} • Pending local-only: ${pending} • Sources: ${sourceCounts.adventure} adv / ${sourceCounts.bike} bike`;
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
      visitedHeatmapHotspots: skeleton,
      visitedAdventureCatalog: `${skeleton}${skeleton}`
    };

    Object.entries(placeholders).forEach(([id, html]) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    });

    const dataStatus = document.getElementById('visitedDataStatus');
    if (dataStatus) dataStatus.textContent = 'Refreshing adventure progress...';
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
      state.mobileTooltip.targetEl = target;
      state.mobileTooltip.pressTimerId = window.setTimeout(() => {
        state.mobileTooltip.longPressActive = true;
        state.mobileTooltip.suppressClickUntil = Date.now() + suppressMs;
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
      if (!state.mobileTooltip.longPressActive && Date.now() > state.mobileTooltip.suppressClickUntil) return;
      const target = event.target.closest ? event.target.closest('[data-tooltip]') : null;
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      state.mobileTooltip.longPressActive = false;
      state.mobileTooltip.suppressClickUntil = 0;
    }, true);

    window.addEventListener('scroll', () => {
      hideMobileTooltipBubble();
    }, { passive: true });

    window.addEventListener('resize', () => {
      hideMobileTooltipBubble();
    });
  }

  function getProgressSubTabButtons(root) {
    return root ? Array.from(root.querySelectorAll('[data-progress-subtab]')) : [];
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

  function prefersReducedMotion() {
    return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
      },
      preferences: {
        confettiEnabled: base.preferences?.confettiEnabled !== false,
        soundEnabled: Boolean(base.preferences?.soundEnabled)
      }
    };

    if (prefersReducedMotion()) {
      state.metaState.preferences.confettiEnabled = false;
    }
  }

  function saveMetaState() {
    localStorage.setItem(VISITED_META_KEY, JSON.stringify(state.metaState || {}));
  }

  function getCelebrationPreferences() {
    if (!state.metaState.preferences) {
      state.metaState.preferences = { confettiEnabled: true, soundEnabled: false };
    }
    return state.metaState.preferences;
  }

  function renderCelebrationControls() {
    const confettiBtn = document.querySelector('[data-celebration-toggle="confetti"]');
    const soundBtn = document.querySelector('[data-celebration-toggle="sound"]');
    const prefs = getCelebrationPreferences();

    if (confettiBtn) {
      confettiBtn.classList.toggle('active', Boolean(prefs.confettiEnabled));
      confettiBtn.setAttribute('aria-pressed', prefs.confettiEnabled ? 'true' : 'false');
    }
    if (soundBtn) {
      soundBtn.classList.toggle('active', Boolean(prefs.soundEnabled));
      soundBtn.setAttribute('aria-pressed', prefs.soundEnabled ? 'true' : 'false');
    }
  }

  function toggleCelebrationPreference(type) {
    const prefs = getCelebrationPreferences();
    if (type === 'confetti') prefs.confettiEnabled = !prefs.confettiEnabled;
    if (type === 'sound') prefs.soundEnabled = !prefs.soundEnabled;
    saveMetaState();
    renderCelebrationControls();
  }

  function playBadgeSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const tones = [523.25, 659.25, 783.99];
      tones.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.value = 0.0001;
        osc.connect(gain);
        gain.connect(ctx.destination);

        const start = ctx.currentTime + (idx * 0.08);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.05, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
        osc.start(start);
        osc.stop(start + 0.17);
      });
    } catch (error) {
      // Audio is optional; ignore blocked autoplay contexts.
    }
  }

  function launchBadgeConfetti(count) {
    const layer = document.getElementById('visitedConfettiLayer');
    if (!layer) return;

    const pieces = Math.max(12, Math.min(48, (count || 1) * 16));
    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

    for (let i = 0; i < pieces; i += 1) {
      const piece = document.createElement('span');
      piece.className = 'visited-confetti-piece';
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colors[i % colors.length];
      piece.style.animationDelay = `${Math.random() * 0.12}s`;
      piece.style.transform = `translateY(-10px) rotate(${Math.round(Math.random() * 360)}deg)`;
      layer.appendChild(piece);

      setTimeout(() => piece.remove(), 1400);
    }
  }

  function triggerBadgeCelebration(newlyUnlocked) {
    const prefs = getCelebrationPreferences();
    if (prefs.confettiEnabled) {
      launchBadgeConfetti(newlyUnlocked.length);
    }
    if (prefs.soundEnabled) {
      playBadgeSound();
    }
  }

  function getVisitMap() {
    return safeJsonParse(localStorage.getItem(STORAGE_KEY), {}) || {};
  }

  function saveVisitMap(map) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  }

  async function resolveTableVisitedColumnIndex(filePath, tableName, cacheKey) {
    if (Number.isInteger(state.visitedColumnIndexCache[cacheKey])) {
      return state.visitedColumnIndexCache[cacheKey];
    }

    if (!window.accessToken || !filePath || !tableName) {
      return -1;
    }

    try {
      const encodedPath = encodeGraphPath(filePath);
      const url = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/workbook/tables/${encodeURIComponent(tableName)}/columns?$select=name,index`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${window.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) return -1;

      const payload = await response.json().catch(() => ({}));
      const columns = Array.isArray(payload.value) ? payload.value : [];
      const match = columns.find((col, idx) => norm(col?.name) === 'visited');

      if (!match) {
        state.visitedColumnIndexCache[cacheKey] = -1;
        return -1;
      }

      const index = Number.isInteger(match.index)
        ? match.index
        : columns.findIndex(col => norm(col?.name) === 'visited');

      state.visitedColumnIndexCache[cacheKey] = Number.isInteger(index) ? index : -1;
      return state.visitedColumnIndexCache[cacheKey];
    } catch (error) {
      return -1;
    }
  }

  async function resolveAdventureVisitedColumnIndex() {
    if (Number.isInteger(state.visitedColumnIndexCache.adventure)) {
      return state.visitedColumnIndexCache.adventure;
    }

    const filePath = window.filePath || 'Copilot_Apps/Kyles_Adventure_Finder/Adventure_Finder_Excel_DB.xlsx';
    const tableName = window.tableName || 'MyList';
    return await resolveTableVisitedColumnIndex(filePath, tableName, 'adventure');
  }

  async function resolveBikeVisitedColumnIndex() {
    const direct = typeof window.getBikeColumnIndexByName === 'function'
      ? Number(window.getBikeColumnIndexByName('Visited'))
      : -1;

    if (Number.isInteger(direct) && direct >= 0) {
      state.visitedColumnIndexCache.bike = direct;
      return direct;
    }

    if (Number.isInteger(state.visitedColumnIndexCache.bike)) {
      return state.visitedColumnIndexCache.bike;
    }

    const filePath = window.bikeTableConfig?.filePath || 'Copilot_Apps/Kyles_Adventure_Finder/Bike_Trail_Planner.xlsx';
    const tableName = window.bikeTableConfig?.tableRef || window.bikeTableConfig?.tableName || 'BikeTrails';
    return await resolveTableVisitedColumnIndex(filePath, tableName, 'bike');
  }

  function getSyncHealthStatus() {
    const adventureCol = getKnownAdventureVisitedColumnIndex();
    const bikeCol = getKnownBikeVisitedColumnIndex();

    const adventureSynced = adventureCol >= 0;
    const bikeSynced = bikeCol >= 0;

    return {
      adventureSynced,
      bikeSynced,
      adventureText: adventureSynced ? 'synced' : 'missing',
      bikeText: bikeSynced ? 'synced' : 'missing',
      allSynced: adventureSynced && bikeSynced
    };
  }

  function renderSyncHealthBadge() {
    const badge = document.getElementById('visitedSyncHealthBadge');
    if (!badge) return;

    const status = getSyncHealthStatus();
    badge.classList.remove('ok', 'warn');
    badge.classList.add(status.allSynced ? 'ok' : 'warn');
    badge.textContent = `Sync - Adventure Visited: ${status.adventureText} | Bike Visited: ${status.bikeText}`;
  }

  function getKnownAdventureVisitedColumnIndex() {
    return Number.isInteger(state.visitedColumnIndexCache.adventure) ? state.visitedColumnIndexCache.adventure : -1;
  }

  function getKnownBikeVisitedColumnIndex() {
    return Number.isInteger(state.visitedColumnIndexCache.bike) ? state.visitedColumnIndexCache.bike : -1;
  }

  function parseAdventure(adventure, index) {
    const values = adventure?.values?.[0] || adventure?.row?.values?.[0] || null;
    if (!Array.isArray(values)) return null;

    const rawTags = String(values[3] || '').split(',').map(tag => norm(tag)).filter(Boolean);
    const name = String(values[0] || 'Unknown').trim();
    const placeId = String(values[1] || '').trim();

    const visitedIdx = getKnownAdventureVisitedColumnIndex();
    const visitedCell = visitedIdx >= 0 ? values[visitedIdx] : undefined;

    return {
      index,
      id: `adv:${placeId || name || adventure?.rowId || index}`,
      placeId,
      name,
      tags: rawTags,
      driveTime: String(values[4] || '').trim(),
      hours: String(values[5] || '').trim(),
      difficulty: String(values[7] || '').trim(),
      state: String(values[9] || '').trim(),
      city: String(values[10] || '').trim(),
      cost: String(values[14] || '').trim(),
      description: String(values[16] || '').trim(),
      sourceType: 'adventure',
      sourceIndex: index,
      rowId: adventure?.rowId || null,
      rowValues: values,
      excelVisitedKnown: visitedIdx >= 0,
      excelVisited: parseVisitedFlag(visitedCell)
    };
  }

  function readAdventures() {
    const rows = Array.isArray(window.adventuresData) ? window.adventuresData : [];
    return rows.map(parseAdventure).filter(Boolean);
  }

  function parseBikeTrailToLocation(trail, fallbackIndex) {
    const sourceIndex = Number.isInteger(trail?.sourceIndex) ? trail.sourceIndex : fallbackIndex;
    const tags = [
      trail?.surface,
      trail?.difficulty,
      trail?.rideTypeClassification,
      trail?.vibes,
      ...(String(trail?.moodTags || '').split(',').map(item => item.trim()))
    ]
      .map(item => norm(item))
      .filter(Boolean);

    const bikeVisitedIdx = getKnownBikeVisitedColumnIndex();
    const bikeValues = trail?.row?.values?.[0];
    const bikeVisitedCell = (bikeVisitedIdx >= 0 && Array.isArray(bikeValues)) ? bikeValues[bikeVisitedIdx] : undefined;

    return {
      index: sourceIndex,
      id: `bike:${trail?.id || trail?.googlePlaceId || trail?.name || sourceIndex}`,
      placeId: String(trail?.googlePlaceId || '').trim(),
      name: String(trail?.name || 'Unknown Bike Trail').trim(),
      tags,
      driveTime: String(trail?.driveTime || '').trim(),
      hours: String(trail?.hours || '').trim(),
      difficulty: String(trail?.difficulty || '').trim(),
      state: String(trail?.state || '').trim(),
      city: String(trail?.city || '').trim(),
      cost: String(trail?.cost || '').trim(),
      description: String(trail?.notes || trail?.highlights || trail?.vibes || '').trim(),
      sourceType: 'bike',
      sourceIndex,
      rowId: null,
      rowValues: Array.isArray(bikeValues) ? bikeValues : null,
      excelVisitedKnown: bikeVisitedIdx >= 0,
      excelVisited: parseVisitedFlag(bikeVisitedCell)
    };
  }

  function readBikeTrails() {
    const models = typeof window.getAllBikeTrailModels === 'function'
      ? window.getAllBikeTrailModels()
      : (Array.isArray(window.bikeTrailsData) ? window.bikeTrailsData : []);

    if (!Array.isArray(models)) return [];

    return models.map((trail, idx) => {
      if (trail && trail.sourceIndex !== undefined && trail.row) {
        return parseBikeTrailToLocation(trail, idx);
      }

      // Fallback shape from raw rows.
      const sourceIndex = idx;
      const values = trail?.values?.[0] || [];
      const pseudo = {
        sourceIndex,
        id: `fallback-${sourceIndex}`,
        googlePlaceId: values[108] || '',
        name: values[0] || '',
        driveTime: values[2] || '',
        hours: values[109] || '',
        difficulty: values[6] || '',
        state: values[110] || '',
        city: values[111] || '',
        cost: values[112] || '',
        notes: values[103] || '',
        moodTags: values[13] || '',
        surface: values[4] || '',
        vibes: values[12] || '',
        row: trail
      };
      return parseBikeTrailToLocation(pseudo, idx);
    }).filter(Boolean);
  }

  function readAllLocations() {
    return readAdventures().concat(readBikeTrails());
  }

  function hydrateVisitMapFromExcel(locations, visitMap) {
    const nextMap = { ...(visitMap || {}) };

    locations.forEach((location) => {
      if (!location.excelVisitedKnown) return;

      if (location.excelVisited) {
        const existing = nextMap[location.id] || {};
        nextMap[location.id] = {
          ...existing,
          name: location.name,
          visitedAt: existing.visitedAt || new Date().toISOString(),
          sourceType: location.sourceType,
          synced: true
        };
      } else {
        delete nextMap[location.id];
      }
    });

    return nextMap;
  }

  function categoriesForAdventure(adventure) {
    const tagsText = adventure.tags.join(' ');
    const nameText = norm(adventure.name);
    const descText = norm(adventure.description);
    const haystack = `${tagsText} ${nameText} ${descText}`;

    return CATEGORY_DEFS
      .filter(def => def.keywords.some(keyword => haystack.includes(norm(keyword))))
      .map(def => def.key);
  }

  function getCategoryMeta(key) {
    return CATEGORY_DEFS.find(category => category.key === key);
  }

  function getCurrentSeason() {
    const month = new Date().getMonth() + 1;
    if (month === 12 || month <= 2) return 'winter';
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    return 'fall';
  }

  function getSeasonalCategoryBoosts() {
    const season = getCurrentSeason();
    if (season === 'winter') return ['coffee', 'scenic', 'park'];
    if (season === 'spring') return ['hiking', 'waterfall', 'park'];
    if (season === 'summer') return ['waterfall', 'bike', 'scenic'];
    return ['hiking', 'scenic', 'coffee'];
  }

  function parseDriveMinutes(driveTime) {
    const text = norm(driveTime);
    if (!text) return 999;

    const hourMatch = text.match(/(\d+(?:\.\d+)?)\s*h/);
    const minMatch = text.match(/(\d+(?:\.\d+)?)\s*m/);

    if (hourMatch || minMatch) {
      return Math.round((hourMatch ? Number(hourMatch[1]) * 60 : 0) + (minMatch ? Number(minMatch[1]) : 0));
    }

    const numeric = Number(String(text).replace(/[^0-9.]/g, ''));
    return Number.isFinite(numeric) && numeric > 0 ? Math.round(numeric) : 999;
  }

  function isOpenNow(hoursText) {
    if (!hoursText) return null;
    if (window.cityViewerEnhancements && typeof window.cityViewerEnhancements.isOpenToday === 'function') {
      return window.cityViewerEnhancements.isOpenToday(hoursText);
    }
    return null;
  }

  function getVisitedLocations(adventures, visitMap) {
    return adventures.filter(adventure => Boolean(visitMap[adventure.id]));
  }

  function getDayStreak(visitMap) {
    const dayList = Object.values(visitMap)
      .map(entry => new Date(entry.visitedAt))
      .filter(date => !Number.isNaN(date.getTime()))
      .map(date => date.toISOString().slice(0, 10));

    const uniqueDays = Array.from(new Set(dayList)).sort();
    if (uniqueDays.length === 0) return 0;

    let streak = 1;
    for (let i = uniqueDays.length - 1; i > 0; i -= 1) {
      const current = new Date(uniqueDays[i]);
      const previous = new Date(uniqueDays[i - 1]);
      const diffDays = Math.round((current - previous) / 86400000);
      if (diffDays === 1) {
        streak += 1;
      } else {
        break;
      }
    }
    return streak;
  }

  function getVisitDate(entry) {
    const date = new Date(entry && entry.visitedAt);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function getWeekKey(date) {
    const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    utc.setUTCDate(utc.getUTCDate() + 4 - (utc.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((utc - yearStart) / 86400000) + 1) / 7);
    return `${utc.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }

  function getMonthKey(date) {
    return `${date.getFullYear()}-M${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  function computeVisitInsights(stats, visitMap) {
    const stateSet = new Set();
    const citySet = new Set();
    const weekendVisits = [];
    const weekEntries = [];
    const monthEntries = [];

    const now = new Date();
    const nowWeek = getWeekKey(now);
    const nowMonth = getMonthKey(now);

    stats.visited.forEach((adventure) => {
      const stateText = norm(adventure.state);
      const cityText = norm(adventure.city);
      if (stateText) stateSet.add(stateText);
      if (cityText) citySet.add(`${cityText}|${stateText}`);
    });

    Object.entries(visitMap).forEach(([locationId, entry]) => {
      const date = getVisitDate(entry);
      if (!date) return;

      const adventure = stats.adventures.find(item => item.id === locationId);
      const categories = adventure ? categoriesForAdventure(adventure) : [];

      const payload = {
        locationId,
        date,
        adventure,
        categories,
        weekKey: getWeekKey(date),
        monthKey: getMonthKey(date)
      };

      if (date.getDay() === 0 || date.getDay() === 6) weekendVisits.push(payload);
      if (payload.weekKey === nowWeek) weekEntries.push(payload);
      if (payload.monthKey === nowMonth) monthEntries.push(payload);
    });

    return {
      uniqueStates: stateSet.size,
      uniqueCities: citySet.size,
      weekendVisitCount: weekendVisits.length,
      weekEntries,
      monthEntries,
      weekKey: nowWeek,
      monthKey: nowMonth
    };
  }

  function buildStats(adventures, visitMap) {
    const visited = getVisitedLocations(adventures, visitMap);
    const visitedIds = new Set(visited.map(item => item.id));

    const totalByCategory = {};
    const visitedByCategory = {};

    CATEGORY_DEFS.forEach(category => {
      totalByCategory[category.key] = 0;
      visitedByCategory[category.key] = 0;
    });

    adventures.forEach(adventure => {
      const cats = categoriesForAdventure(adventure);
      cats.forEach(categoryKey => {
        if (totalByCategory[categoryKey] !== undefined) {
          totalByCategory[categoryKey] += 1;
        }
      });
    });

    visited.forEach(adventure => {
      const cats = categoriesForAdventure(adventure);
      cats.forEach(categoryKey => {
        if (visitedByCategory[categoryKey] !== undefined) {
          visitedByCategory[categoryKey] += 1;
        }
      });
    });

    const completedCategories = CATEGORY_DEFS.filter(category => (visitedByCategory[category.key] || 0) > 0).length;
    const streakDays = getDayStreak(visitMap);
    const xpFromVisits = visited.length * 30;

    return {
      adventures,
      visited,
      visitedIds,
      totalByCategory,
      visitedByCategory,
      completionPct: adventures.length ? Math.round((visited.length / adventures.length) * 100) : 0,
      completedCategories,
      streakDays,
      xpFromVisits
    };
  }

  function buildChallengeProgress(stats) {
    return CHALLENGES.map(challenge => {
      let progress = 0;
      if (challenge.category) {
        progress = stats.visitedByCategory[challenge.category] || 0;
      } else if (challenge.id === 'well-rounded') {
        progress = stats.completedCategories;
      } else if (challenge.id === 'triple-streak') {
        progress = stats.streakDays;
      }

      const completed = progress >= challenge.goal;
      return {
        ...challenge,
        progress,
        completed,
        pct: Math.min(100, Math.round((progress / challenge.goal) * 100))
      };
    });
  }

  function seededPick(pool, seedText, count) {
    let seed = 0;
    for (let i = 0; i < seedText.length; i += 1) {
      seed = (seed * 31 + seedText.charCodeAt(i)) >>> 0;
    }

    const scored = pool.map((item, idx) => {
      const value = (seed ^ ((idx + 1) * 2654435761)) >>> 0;
      return { item, value };
    });

    return scored
      .sort((a, b) => a.value - b.value)
      .slice(0, count)
      .map(entry => entry.item);
  }

  function calcQuestProgress(quest, entries) {
    if (quest.metric === 'visitsInPeriod') return entries.length;

    if (quest.metric === 'categoriesInPeriod') {
      const set = new Set();
      entries.forEach(entry => entry.categories.forEach(category => set.add(category)));
      return set.size;
    }

    if (quest.metric === 'citiesInPeriod') {
      const set = new Set();
      entries.forEach(entry => {
        const city = norm(entry.adventure && entry.adventure.city);
        const state = norm(entry.adventure && entry.adventure.state);
        if (city || state) set.add(`${city}|${state}`);
      });
      return set.size;
    }

    if (quest.metric === 'statesInPeriod') {
      const set = new Set();
      entries.forEach(entry => {
        const stateText = norm(entry.adventure && entry.adventure.state);
        if (stateText) set.add(stateText);
      });
      return set.size;
    }

    if (quest.metric === 'categoryInPeriod') {
      return entries.filter(entry => entry.categories.includes(quest.category)).length;
    }

    return 0;
  }

  function buildQuestSet(type, periodKey, pool, entries) {
    const selected = seededPick(pool, `${type}:${periodKey}`, 3);
    const justCompleted = [];

    const quests = selected.map((quest) => {
      const progress = calcQuestProgress(quest, entries);
      const completed = progress >= quest.goal;
      const completionKey = `${type}:${periodKey}:${quest.id}`;

      if (completed && !state.metaState.quests.completions[completionKey]) {
        state.metaState.quests.completions[completionKey] = new Date().toISOString();
        justCompleted.push(quest);
      }

      return {
        ...quest,
        progress,
        completed,
        completionKey,
        pct: Math.min(100, Math.round((progress / quest.goal) * 100))
      };
    });

    return { type, periodKey, quests, justCompleted };
  }

  function buildRotatingQuests(insights) {
    const weekly = buildQuestSet('weekly', insights.weekKey, WEEKLY_QUEST_POOL, insights.weekEntries);
    const monthly = buildQuestSet('monthly', insights.monthKey, MONTHLY_QUEST_POOL, insights.monthEntries);

    const allNew = weekly.justCompleted.concat(monthly.justCompleted);
    if (allNew.length > 0) {
      saveMetaState();
      if (typeof window.showToast === 'function') {
        const labels = allNew.map(item => `${item.icon} ${item.title}`).join(', ');
        window.showToast(`Quest complete: ${labels}`, 'success', 4200);
      }
    }

    return { weekly, monthly };
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
    const questXp = questSet.weekly.quests.concat(questSet.monthly.quests)
      .filter(quest => quest.completed)
      .reduce((sum, quest) => sum + quest.points, 0);
    const level = getPlayerLevel(stats.xpFromVisits + challengeXp + badgeXp + questXp);

    const summaryEl = document.getElementById('visitedSummaryStats');
    if (!summaryEl) return;

    summaryEl.innerHTML = `
      <div class="visited-stat-card">
        <div class="visited-stat-label">Explorer Level</div>
        <div class="visited-stat-value">Lv ${level.level}</div>
        <div class="visited-stat-sub">${level.remainingXp} XP to next level</div>
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
      hotspots.innerHTML = '<div class="visited-empty">No visited locations yet to build heatmap.</div>';
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

  function renderCategories(stats) {
    const grid = document.getElementById('visitedCategoryGrid');
    if (!grid) return;

    grid.innerHTML = CATEGORY_DEFS.map(category => {
      const visitedCount = stats.visitedByCategory[category.key] || 0;
      const totalCount = stats.totalByCategory[category.key] || 0;
      const pct = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;

      return `
        <div class="visited-category-card" data-category="${category.key}">
          <div class="visited-category-top">
            <div class="visited-category-title">${category.icon} ${category.label}</div>
            <button type="button" class="quick-filter-btn visited-category-filter-btn ${state.categoryFilter === category.key ? 'active' : ''}" data-category-filter="${category.key}" title="Filter tracker to ${escapeHtml(category.label)}" data-tooltip="Filter tracker to ${escapeHtml(category.label)}">Focus</button>
          </div>
          <div class="visited-category-meta">${visitedCount} / ${totalCount || 0} visited</div>
          <div class="visited-progress-track"><div class="visited-progress-fill" style="width:${pct}%;"></div></div>
        </div>
      `;
    }).join('');
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
      container.innerHTML = '<div class="visited-empty">No recommendation candidates yet. Load adventure data first.</div>';
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
            <button type="button" class="visited-suggestion-explain-btn" data-suggestion-explain-toggle="${explainId}" aria-expanded="false" title="See score breakdown" data-tooltip="See score breakdown">Why this now? (${Math.round(suggestion.score)})</button>
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
              <button type="button" class="card-btn card-btn-primary" data-visit-action="toggle" data-location-id="${escapeHtml(suggestion.id)}" title="Mark ${escapeHtml(suggestion.name)} as visited" data-tooltip="Mark ${escapeHtml(suggestion.name)} as visited">✅ Mark Visited</button>
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
      container.innerHTML = '<div class="visited-empty">No visits tracked yet. Mark your first adventure!</div>';
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
      container.innerHTML = '<div class="visited-empty">No locations match your search right now.</div>';
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
          <button type="button" class="quick-filter-btn ${visited ? 'active' : ''}" data-visit-action="toggle" data-location-id="${escapeHtml(adventure.id)}" title="${visited ? 'Mark as not visited' : 'Mark as visited'}" data-tooltip="${visited ? 'Mark as not visited' : 'Mark as visited'}">
            ${visited ? '✅ Visited' : '➕ Mark'}
          </button>
        </div>
      `;
    }).join('') + (hasMore
      ? `<div class="visited-catalog-footer"><button type="button" class="visited-load-more-btn" data-catalog-action="load-more">Load more (${visible.length}/${filtered.length})</button></div>`
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
      renderCelebrationControls();
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

      const root = document.getElementById('visitedLocationsRoot');
      applyTooltipInfoIcons(root);
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

  function bindControls() {
    const root = document.getElementById('visitedLocationsRoot');
    if (!root || root.dataset.bound === '1') return;

    root.dataset.bound = '1';
    syncProgressSubTabs(root);
    announceProgressSubTab(root, state.activeProgressSubTab);
    state.latestVisitMap = getVisitMap();
    renderSyncMeta(state.latestVisitMap);
    initMobileTooltipSupport(root);
    applyTooltipInfoIcons(root);

    root.addEventListener('keydown', (event) => {
      const currentTabBtn = event.target.closest('[data-progress-subtab]');
      if (!currentTabBtn) return;

      const buttons = getProgressSubTabButtons(root);
      if (buttons.length === 0) return;
      const index = buttons.indexOf(currentTabBtn);
      if (index < 0) return;

      let nextIndex = index;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % buttons.length;
      else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + buttons.length) % buttons.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = buttons.length - 1;
      else return;

      event.preventDefault();
      const nextButton = buttons[nextIndex];
      const tabKey = nextButton.getAttribute('data-progress-subtab') || 'overview';
      setActiveProgressSubTab(root, tabKey);
      nextButton.focus();
    });

    root.addEventListener('click', (event) => {
      const explainBtn = event.target.closest('[data-suggestion-explain-toggle]');
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

      const loadMoreBtn = event.target.closest('[data-catalog-action="load-more"]');
      if (loadMoreBtn) {
        event.preventDefault();
        state.catalogRenderLimit += CATALOG_LOAD_STEP;
        renderCatalog(state.latestLocations || [], state.latestVisitMap || getVisitMap());
        return;
      }

      const progressTabBtn = event.target.closest('[data-progress-subtab]');
      if (progressTabBtn) {
        event.preventDefault();
        const tabKey = progressTabBtn.getAttribute('data-progress-subtab') || 'overview';
        if (tabKey === state.activeProgressSubTab) return;
        setActiveProgressSubTab(root, tabKey);
        return;
      }

      const toggleBtn = event.target.closest('[data-visit-action="toggle"]');
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

      const categoryBtn = event.target.closest('[data-category-filter]');
      if (categoryBtn) {
        event.preventDefault();
        const nextFilter = categoryBtn.getAttribute('data-category-filter') || 'all';
        state.categoryFilter = state.categoryFilter === nextFilter ? 'all' : nextFilter;
        resetCatalogRenderLimit();
        runRefreshWithLock(categoryBtn);
        return;
      }

      const catalogFilterBtn = event.target.closest('[data-catalog-filter]');
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

      const celebrationBtn = event.target.closest('[data-celebration-toggle]');
      if (celebrationBtn) {
        event.preventDefault();
        const prefType = celebrationBtn.getAttribute('data-celebration-toggle');
        if (prefType) toggleCelebrationPreference(prefType);
        return;
      }
    });

    root.addEventListener('mousemove', (event) => {
      const hotspot = event.target.closest('[data-hotspot-tooltip]');
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
    bindControls();
    ensureBikeDataLoadedForTracker().finally(() => refreshTab());
    scheduleDataRefreshCheck();

    if (!state.initialized) {
      console.log('✅ Visited Locations tab initialized');
      state.initialized = true;
    }
  }

  window.initializeVisitedLocationsTab = initializeVisitedLocationsTab;
  window.initVisitedLocationsTab = window.initVisitedLocationsTab || initializeVisitedLocationsTab;
  window.getVisitedTrackerSyncHealth = getSyncHealthStatus;
})();

