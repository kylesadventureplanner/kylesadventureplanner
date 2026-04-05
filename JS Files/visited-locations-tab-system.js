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

  const state = {
    initialized: false,
    weatherMode: 'auto',
    searchText: '',
    categoryFilter: 'all',
    challengeState: {},
    metaState: {},
    lastRenderAt: null
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

  function getVisitMap() {
    return safeJsonParse(localStorage.getItem(STORAGE_KEY), {}) || {};
  }

  function saveVisitMap(map) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  }

  function parseAdventure(adventure, index) {
    const values = adventure?.values?.[0] || adventure?.row?.values?.[0] || null;
    if (!Array.isArray(values)) return null;

    const rawTags = String(values[3] || '').split(',').map(tag => norm(tag)).filter(Boolean);
    const name = String(values[0] || 'Unknown').trim();
    const placeId = String(values[1] || '').trim();

    return {
      index,
      id: placeId || name,
      placeId,
      name,
      tags: rawTags,
      driveTime: String(values[4] || '').trim(),
      hours: String(values[5] || '').trim(),
      difficulty: String(values[7] || '').trim(),
      state: String(values[9] || '').trim(),
      city: String(values[10] || '').trim(),
      cost: String(values[14] || '').trim(),
      description: String(values[16] || '').trim()
    };
  }

  function readAdventures() {
    const rows = Array.isArray(window.adventuresData) ? window.adventuresData : [];
    return rows.map(parseAdventure).filter(Boolean);
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

        if (openState === true) {
          score += 30;
          reasons.push('Open now');
        } else if (openState === false) {
          score -= 25;
          reasons.push('Likely closed right now');
        } else {
          score += 8;
          reasons.push('Hours unknown, worth checking');
        }

        if (driveMinutes <= 30) {
          score += 18;
          reasons.push('Quick drive');
        } else if (driveMinutes <= 60) {
          score += 10;
        }

        categories.forEach(category => {
          if (weatherPreferred.includes(category)) {
            score += 16;
            reasons.push(`${getCategoryMeta(category)?.label || category} matches weather`);
          }
          if (unfinishedPriority.has(category)) {
            score += 20;
            reasons.push('Moves an active challenge forward');
          }
        });

        if (weekend && categories.includes('scenic')) score += 8;
        if (!weekend && categories.includes('coffee')) score += 6;

        return {
          ...adventure,
          categories,
          score,
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
      const prev = buckets.get(key) || { city, state: stateText, count: 0 };
      prev.count += 1;
      buckets.set(key, prev);
    });

    return Array.from(buckets.values())
      .map((entry) => {
        const coords = getApproximateCoordinates(entry.city, entry.state);
        return { ...entry, lat: Number(coords.lat), lng: Number(coords.lng) };
      })
      .filter(entry => Number.isFinite(entry.lat) && Number.isFinite(entry.lng))
      .sort((a, b) => b.count - a.count);
  }

  function renderHeatmap(stats) {
    const canvas = document.getElementById('visitedHeatmapCanvas');
    const hotspots = document.getElementById('visitedHeatmapHotspots');
    if (!canvas || !hotspots) return;

    const buckets = buildHeatmapBuckets(stats);
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
      });
    }

    hotspots.innerHTML = buckets.slice(0, 8).map((bucket, idx) => `
      <div class="visited-hotspot-item">
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
            <button class="quick-filter-btn visited-category-filter-btn ${state.categoryFilter === category.key ? 'active' : ''}" data-category-filter="${category.key}">Focus</button>
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
          </div>
          <div class="adventure-card-footer">
            <div class="card-action-buttons">
              <button class="card-btn card-btn-primary" data-visit-action="toggle" data-location-id="${escapeHtml(suggestion.id)}">✅ Mark Visited</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
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

    return adventures.filter(adventure => {
      const matchesSearch = !text || `${norm(adventure.name)} ${norm(adventure.city)} ${norm(adventure.state)} ${adventure.tags.join(' ')}`.includes(text);
      if (!matchesSearch) return false;

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

  function renderCatalog(adventures, visitMap) {
    const container = document.getElementById('visitedAdventureCatalog');
    if (!container) return;

    const filtered = filterCatalog(adventures, visitMap).slice(0, 80);
    if (filtered.length === 0) {
      container.innerHTML = '<div class="visited-empty">No locations match your search right now.</div>';
      return;
    }

    container.innerHTML = filtered.map(adventure => {
      const visited = Boolean(visitMap[adventure.id]);
      const categories = categoriesForAdventure(adventure).map(category => getCategoryMeta(category)?.icon || '📍').join(' ');
      return `
        <div class="visited-catalog-row">
          <div>
            <div class="visited-catalog-name">${escapeHtml(adventure.name)} ${categories}</div>
            <div class="visited-catalog-meta">${escapeHtml(adventure.city)}, ${escapeHtml(adventure.state)} • ${escapeHtml(adventure.driveTime || 'Drive time unknown')}</div>
          </div>
          <button class="quick-filter-btn ${visited ? 'active' : ''}" data-visit-action="toggle" data-location-id="${escapeHtml(adventure.id)}">
            ${visited ? '✅ Visited' : '➕ Mark'}
          </button>
        </div>
      `;
    }).join('');
  }

  function refreshTab() {
    const adventures = readAdventures();
    const visitMap = getVisitMap();
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
      dataStatus.textContent = `${adventures.length} adventures loaded • ${stats.visited.length} visited tracked`;
    }

    state.lastRenderAt = new Date().toISOString();
  }

  function findAdventureById(locationId) {
    const adventures = readAdventures();
    return adventures.find(adventure => adventure.id === locationId) || null;
  }

  function toggleVisited(locationId) {
    const visitMap = getVisitMap();
    if (visitMap[locationId]) {
      delete visitMap[locationId];
      saveVisitMap(visitMap);
      if (typeof window.showToast === 'function') {
        window.showToast('Visit removed from tracker', 'info', 2000);
      }
      refreshTab();
      return;
    }

    const adventure = findAdventureById(locationId);
    visitMap[locationId] = {
      name: adventure ? adventure.name : locationId,
      visitedAt: new Date().toISOString()
    };

    saveVisitMap(visitMap);

    if (typeof window.showToast === 'function') {
      window.showToast(`Logged: ${adventure ? adventure.name : 'Location'} 🎉`, 'success', 2500);
    }

    refreshTab();
  }

  function bindControls() {
    const root = document.getElementById('visitedLocationsRoot');
    if (!root || root.dataset.bound === '1') return;

    root.dataset.bound = '1';

    root.addEventListener('click', (event) => {
      const toggleBtn = event.target.closest('[data-visit-action="toggle"]');
      if (toggleBtn) {
        const locationId = toggleBtn.getAttribute('data-location-id');
        if (locationId) toggleVisited(locationId);
        return;
      }

      const categoryBtn = event.target.closest('[data-category-filter]');
      if (categoryBtn) {
        const nextFilter = categoryBtn.getAttribute('data-category-filter') || 'all';
        state.categoryFilter = state.categoryFilter === nextFilter ? 'all' : nextFilter;
        refreshTab();
        return;
      }
    });

    const refreshBtn = document.getElementById('visitedRefreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => refreshTab());
    }

    const weatherEl = document.getElementById('visitedWeatherMode');
    if (weatherEl) {
      weatherEl.addEventListener('change', () => refreshTab());
    }

    const searchInput = document.getElementById('visitedSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        state.searchText = searchInput.value || '';
        renderCatalog(readAdventures(), getVisitMap());
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

  function initializeVisitedLocationsTab() {
    loadChallengeState();
    loadMetaState();
    bindControls();
    refreshTab();
    scheduleDataRefreshCheck();

    if (!state.initialized) {
      console.log('✅ Visited Locations tab initialized');
      state.initialized = true;
    }
  }

  window.initializeVisitedLocationsTab = initializeVisitedLocationsTab;
  window.initVisitedLocationsTab = window.initVisitedLocationsTab || initializeVisitedLocationsTab;
})();

