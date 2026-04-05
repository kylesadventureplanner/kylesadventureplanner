/*
 * Visited Locations Tab System
 * Gamified progress tracking + smart suggestions for adventures.
 */

(function() {
  const STORAGE_KEY = 'visitedLocationsTrackerV1';
  const CHALLENGE_STATE_KEY = 'visitedLocationsChallengeStateV1';

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

  const state = {
    initialized: false,
    weatherMode: 'auto',
    searchText: '',
    categoryFilter: 'all',
    challengeState: {},
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

  function renderSummary(stats, challengeProgress) {
    const completedChallenges = challengeProgress.filter(challenge => challenge.completed).length;
    const challengeXp = challengeProgress
      .filter(challenge => challenge.completed)
      .reduce((sum, challenge) => sum + challenge.points, 0);
    const level = getPlayerLevel(stats.xpFromVisits + challengeXp);

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
    const suggestions = generateSuggestions(adventures, visitMap, challengeProgress);

    renderSummary(stats, challengeProgress);
    renderCategories(stats);
    renderChallenges(challengeProgress);
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

