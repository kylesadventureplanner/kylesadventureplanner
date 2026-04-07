/*
 * Nature Challenge Tab System
 * Birds sub-tab data, progression, challenges, badges, and local sighting state.
 */

(function() {
  const BIRD_DATA_URL = 'data/nature-challenge-birds.tsv';
  const BIRD_SIGHTINGS_KEY = 'natureChallengeBirdSightingsV1';
  const SUBTAB_KEYS = ['birds', 'mammals', 'reptiles', 'amphibians', 'insects', 'arachnids', 'wildflowers', 'trees', 'shrubs'];

  const RARITY_META = {
    common: { label: 'Common', className: 'rarity-common', weight: 1 },
    regular: { label: 'Regular', className: 'rarity-regular', weight: 1.5 },
    uncommon: { label: 'Uncommon', className: 'rarity-uncommon', weight: 2 },
    rare: { label: 'Rare', className: 'rarity-rare', weight: 3 },
    veryRare: { label: 'Very Rare', className: 'rarity-very-rare', weight: 4 },
    extremelyRare: { label: 'Extremely Rare', className: 'rarity-extremely-rare', weight: 5 }
  };

  const SEASON_META = {
    spring: { label: 'Spring', icon: '🌱', className: 'season-spring' },
    summer: { label: 'Summer', icon: '☀️', className: 'season-summer' },
    fall: { label: 'Fall', icon: '🍂', className: 'season-fall' },
    winter: { label: 'Winter', icon: '❄️', className: 'season-winter' },
    migration: { label: 'Migration', icon: '🧭', className: 'season-migration' }
  };

  const state = {
    initialized: false,
    activeSubTab: 'birds',
    birdsLoaded: false,
    birdsLoading: false,
    birdsError: '',
    birds: [],
    families: [],
    sightings: loadSightings(),
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

  function getCurrentSeason() {
    const month = new Date().getMonth() + 1;
    if (month === 12 || month <= 2) return 'winter';
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    return 'fall';
  }

  function getCurrentQuarterStart(date) {
    const month = date.getMonth();
    const quarterStartMonth = Math.floor(month / 3) * 3;
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

  function getCanonicalGroupKey(label) {
    return norm(String(label || '').split('(')[0]).replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function getSpeciesKey(speciesName) {
    return norm(speciesName).replace(/[^a-z0-9]+/g, '-');
  }

  function getDisplayLabel(candidate, current) {
    if (!current) return candidate;
    return candidate.length > current.length ? candidate : current;
  }

  function normalizeRarity(rawRarity) {
    const raw = String(rawRarity || '').trim();
    const lower = norm(raw);
    let key = 'common';

    if (lower.includes('extremely rare')) {
      key = 'extremelyRare';
    } else if (lower.includes('very rare')) {
      key = 'veryRare';
    } else if (lower.includes('rare')) {
      key = 'rare';
    } else if (lower.includes('uncommon')) {
      key = 'uncommon';
    } else if (lower.includes('regular')) {
      key = 'regular';
    }

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

    const displayTokens = Object.keys(SEASON_META).filter((token) => tokens.has(token));
    return {
      raw,
      tokens: displayTokens,
      isAvailableNow: tokens.has(getCurrentSeason())
    };
  }

  function parseBirdData(tsvText) {
    const rows = String(tsvText || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (rows.length <= 1) {
      return { birds: [], families: [] };
    }

    const speciesMap = new Map();
    const familyLabelMap = new Map();

    rows.slice(1).forEach((line) => {
      const [familyLabel, genusLabel, speciesName, seasonsFound, rarityText] = line.split('\t');
      if (!familyLabel || !genusLabel || !speciesName) return;

      const familyKey = getCanonicalGroupKey(familyLabel);
      const speciesKey = getSpeciesKey(speciesName);
      const rarity = normalizeRarity(rarityText);
      const seasons = normalizeSeasons(seasonsFound);

      familyLabelMap.set(familyKey, getDisplayLabel(familyLabel, familyLabelMap.get(familyKey) || ''));

      const existing = speciesMap.get(speciesKey);
      if (existing) {
        existing.familyLabel = getDisplayLabel(familyLabelMap.get(familyKey) || familyLabel, existing.familyLabel);
        existing.genusLabel = getDisplayLabel(genusLabel, existing.genusLabel);
        existing.seasons.raw = getDisplayLabel(seasons.raw, existing.seasons.raw);
        seasons.tokens.forEach((token) => {
          if (!existing.seasons.tokens.includes(token)) existing.seasons.tokens.push(token);
        });
        existing.seasons.isAvailableNow = existing.seasons.tokens.includes(getCurrentSeason());
        if (rarity.weight > existing.rarity.weight) {
          existing.rarity = rarity;
        }
        existing.rarityNotes = Array.from(new Set(existing.rarityNotes.concat(rarity.flags)));
        return;
      }

      speciesMap.set(speciesKey, {
        id: speciesKey,
        familyKey,
        familyLabel: familyLabelMap.get(familyKey) || familyLabel,
        genusLabel,
        speciesName,
        seasons,
        rarity,
        rarityNotes: Array.from(rarity.flags)
      });
    });

    const birds = Array.from(speciesMap.values())
      .map((bird) => ({
        ...bird,
        seasons: {
          ...bird.seasons,
          tokens: bird.seasons.tokens.sort((a, b) => Object.keys(SEASON_META).indexOf(a) - Object.keys(SEASON_META).indexOf(b)),
          isAvailableNow: bird.seasons.tokens.includes(getCurrentSeason())
        }
      }))
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

  async function loadBirdDataset(forceRefresh) {
    if (state.birdsLoading) return;
    if (state.birdsLoaded && !forceRefresh) return;

    state.birdsLoading = true;
    state.birdsError = '';
    renderBirdHeaderStatus();

    try {
      const response = await fetch(BIRD_DATA_URL, { cache: forceRefresh ? 'reload' : 'default' });
      if (!response.ok) {
        throw new Error(`Unable to load bird dataset (${response.status})`);
      }

      const dataset = parseBirdData(await response.text());
      state.birds = dataset.birds;
      state.families = dataset.families;
      state.birdsLoaded = true;
      state.lastLoadedAt = new Date().toISOString();
      renderBirds();
    } catch (error) {
      state.birdsError = error && error.message ? error.message : 'Unable to load bird data.';
      renderBirdHeaderStatus();
      renderBirdError();
    } finally {
      state.birdsLoading = false;
      renderBirdHeaderStatus();
    }
  }

  function isBirdSighted(bird) {
    return Boolean(state.sightings[bird.id]);
  }

  function getSightingDate(bird) {
    const entry = state.sightings[bird.id];
    if (!entry || !entry.sightedAt) return null;
    const parsed = new Date(entry.sightedAt);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function countSightedBirds(birds) {
    return birds.filter(isBirdSighted).length;
  }

  function getBirdStats() {
    const allBirds = state.birds;
    const now = new Date();
    const weekStart = getStartOfWeek(now);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const quarterStart = getCurrentQuarterStart(now);
    const yearStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const currentSeason = getCurrentSeason();

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

    const familiesStarted = familyProgress.filter((family) => family.started).length;
    const familiesCompleted = familyProgress.filter((family) => family.completed).length;

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
      familiesStarted,
      familiesCompleted,
      weeklySightedCount: weeklySighted.length,
      monthlySightedCount: monthlySighted.length,
      quarterlySightedCount: quarterlySighted.length,
      yearlySightedCount: yearlySighted.length,
      familyProgress,
      sightedBirds
    };
  }

  function getBirdChallenges(stats) {
    return [
      {
        id: 'weekly-wings',
        icon: '📅',
        title: 'Weekly Wings',
        description: 'Log fresh bird species this week.',
        progress: stats.weeklySightedCount,
        goal: 3,
        emphasis: 'time'
      },
      {
        id: 'monthly-milestone',
        icon: '🗓️',
        title: 'Monthly Milestone',
        description: 'Build steady momentum across the month.',
        progress: stats.monthlySightedCount,
        goal: 10,
        emphasis: 'time'
      },
      {
        id: 'quarterly-flight-plan',
        icon: '🧭',
        title: 'Quarterly Flight Plan',
        description: 'Keep your seasonal list moving this quarter.',
        progress: stats.quarterlySightedCount,
        goal: 25,
        emphasis: 'time'
      },
      {
        id: 'lifetime-lister',
        icon: '🪶',
        title: 'Lifetime Lister',
        description: 'Grow your all-time bird checklist.',
        progress: stats.totalSighted,
        goal: 100,
        emphasis: 'all-time'
      },
      {
        id: 'seasonal-sweep',
        icon: SEASON_META[stats.currentSeason].icon,
        title: `${stats.currentSeasonLabel} Sweep`,
        description: `Mark birds that are available in ${stats.currentSeason.toLowerCase()} right now.`,
        progress: stats.inSeasonSightedCount,
        goal: 15,
        emphasis: 'seasonal'
      },
      {
        id: 'rare-radar',
        icon: '💎',
        title: 'Rare Radar',
        description: 'Find rare, very rare, or extremely rare species.',
        progress: stats.rareSightedCount,
        goal: 5,
        emphasis: 'rarity'
      },
      {
        id: 'family-forager',
        icon: '🪺',
        title: 'Family Forager',
        description: 'Get at least one sighting in different bird families.',
        progress: stats.familiesStarted,
        goal: 12,
        emphasis: 'families'
      },
      {
        id: 'migration-mapper',
        icon: '🛫',
        title: 'Migration Mapper',
        description: 'Track birds that show up during migration windows.',
        progress: stats.migrationSightedCount,
        goal: 8,
        emphasis: 'migration'
      }
    ].map((challenge) => ({
      ...challenge,
      completed: challenge.progress >= challenge.goal,
      pct: Math.max(0, Math.min(100, Math.round((challenge.progress / challenge.goal) * 100)))
    }));
  }

  function getBirdBadges(stats) {
    return [
      {
        id: 'first-feather',
        icon: '🐣',
        title: 'First Feather',
        description: 'Mark your first bird species as sighted.',
        rarity: 'common',
        progress: stats.totalSighted,
        goal: 1
      },
      {
        id: 'common-core',
        icon: '🌿',
        title: 'Common Core',
        description: 'Build a strong base with common species.',
        rarity: 'common',
        progress: stats.commonSightedCount,
        goal: 25
      },
      {
        id: 'rare-find',
        icon: '🔭',
        title: 'Rare Find',
        description: 'Spot five rare-or-better birds.',
        rarity: 'rare',
        progress: stats.rareSightedCount,
        goal: 5
      },
      {
        id: 'migration-mapper-badge',
        icon: '🗺️',
        title: 'Migration Mapper',
        description: 'Log species associated with migration seasons.',
        rarity: 'rare',
        progress: stats.migrationSightedCount,
        goal: 10
      },
      {
        id: 'seasonal-spotter',
        icon: SEASON_META[stats.currentSeason].icon,
        title: `${stats.currentSeasonLabel} Spotter`,
        description: `Track birds that are available during ${stats.currentSeason.toLowerCase()}.`,
        rarity: 'epic',
        progress: stats.inSeasonSightedCount,
        goal: 20
      },
      {
        id: 'family-finisher',
        icon: '🏷️',
        title: 'Family Finisher',
        description: 'Completely finish one family card.',
        rarity: 'epic',
        progress: stats.familiesCompleted,
        goal: 1
      },
      {
        id: 'legendary-lister',
        icon: '🏆',
        title: 'Legendary Lister',
        description: 'Reach 100 total bird species sighted.',
        rarity: 'legendary',
        progress: stats.totalSighted,
        goal: 100
      },
      {
        id: 'ultra-rarity',
        icon: '✨',
        title: 'Ultra-Rarity',
        description: 'Sight at least one very rare or extremely rare bird.',
        rarity: 'legendary',
        progress: stats.veryRareSightedCount,
        goal: 1
      }
    ].map((badge) => {
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
      syncMeta.textContent = 'Refreshing bird families, seasons, and rarity...';
      return;
    }

    if (state.birdsError) {
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

    syncBadge.classList.add('ok');
    syncBadge.textContent = 'Bird data: ready';
    syncMeta.textContent = `${state.birds.length} unique species • ${state.families.length} families • Updated ${new Date(state.lastLoadedAt).toLocaleString()}`;
  }

  function renderBirdLegend(stats) {
    const container = document.getElementById('birdsVisualLegend');
    if (!container) return;

    container.innerHTML = `
      <div class="nature-legend-card">
        <div class="nature-legend-title">Rarity markers</div>
        <div class="nature-chip-row nature-chip-row--wrap">
          ${Object.values(RARITY_META).map((rarity) => `
            <span class="nature-chip ${rarity.className}">${escapeHtml(rarity.label)}</span>
          `).join('')}
        </div>
      </div>
      <div class="nature-legend-card">
        <div class="nature-legend-title">Season markers</div>
        <div class="nature-chip-row nature-chip-row--wrap">
          ${Object.entries(SEASON_META).map(([key, season]) => `
            <span class="nature-chip ${season.className} ${key === stats.currentSeason ? 'is-current' : ''}">${season.icon} ${escapeHtml(season.label)}</span>
          `).join('')}
        </div>
      </div>
      <div class="nature-legend-card">
        <div class="nature-legend-title">What the birds tab tracks</div>
        <div class="nature-legend-copy">
          Challenges and badges now use <strong>rarity</strong>, <strong>seasonal availability</strong>, and <strong>when you marked a bird as sighted</strong> for weekly, monthly, quarterly, and lifetime progress.
        </div>
      </div>
    `;
  }

  function renderBirdStats(stats) {
    const totalSighted = document.getElementById('birdsTotalSighted');
    const totalSpecies = document.getElementById('birdsTotalSpecies');
    const inSeason = document.getElementById('birdsInSeasonSighted');
    const rareSighted = document.getElementById('birdsRareSighted');
    const familiesCompleted = document.getElementById('birdsFamiliesCompleted');
    const migrationSighted = document.getElementById('birdsMigrationSighted');
    const snapshot = document.getElementById('birdsProgressSnapshot');

    if (totalSighted) totalSighted.textContent = String(stats.totalSighted);
    if (totalSpecies) totalSpecies.textContent = String(stats.totalBirds);
    if (inSeason) inSeason.textContent = String(stats.inSeasonSightedCount);
    if (rareSighted) rareSighted.textContent = String(stats.rareSightedCount);
    if (familiesCompleted) familiesCompleted.textContent = String(stats.familiesCompleted);
    if (migrationSighted) migrationSighted.textContent = String(stats.migrationSightedCount);

    if (snapshot) {
      snapshot.innerHTML = `
        <strong>${escapeHtml(stats.currentSeasonLabel)} focus:</strong>
        ${stats.inSeasonSightedCount} of ${stats.inSeasonCount} currently available species marked sighted •
        ${stats.weeklySightedCount} logged this week •
        ${stats.monthlySightedCount} this month •
        ${stats.quarterlySightedCount} this quarter •
        ${stats.yearlySightedCount} this year.
      `;
    }
  }

  function renderBirdFamilies(stats) {
    const container = document.getElementById('birdsFamilyGrid');
    if (!container) return;

    const families = stats.familyProgress
      .slice()
      .sort((a, b) => {
        if (b.sightedCount !== a.sightedCount) return b.sightedCount - a.sightedCount;
        return a.label.localeCompare(b.label);
      });

    container.innerHTML = families.map((family) => `
      <div class="nature-family-card ${family.completed ? 'is-complete' : ''}">
        <div class="nature-family-card-header">
          <div>
            <div class="nature-family-card-title">🏷️ ${escapeHtml(family.label)}</div>
            <div class="nature-family-card-meta">${family.sightedCount}/${family.species.length} sighted • ${family.completed ? 'Family complete' : family.started ? 'In progress' : 'Not started'}</div>
          </div>
          <div class="nature-family-card-count">${family.completionPct}%</div>
        </div>
        <div class="nature-progress-track">
          <div class="nature-progress-fill" style="width:${family.completionPct}%;"></div>
        </div>
        <div class="nature-family-card-body">
          ${family.species.map((bird) => {
            const sighted = isBirdSighted(bird);
            const seasonChips = bird.seasons.tokens.map((seasonKey) => {
              const season = SEASON_META[seasonKey];
              const currentClass = seasonKey === stats.currentSeason ? 'is-current' : '';
              return `<span class="nature-chip ${season.className} ${currentClass}">${season.icon} ${escapeHtml(season.label)}</span>`;
            }).join('');

            const rarityNoteChips = bird.rarityNotes.map((note) => `<span class="nature-chip nature-chip--note">${escapeHtml(note)}</span>`).join('');

            return `
              <button type="button" class="nature-species-item ${sighted ? 'sighted' : ''} ${bird.seasons.isAvailableNow ? 'is-current-season' : ''} ${bird.rarity.className}" data-bird-toggle="${escapeHtml(bird.id)}" aria-pressed="${sighted ? 'true' : 'false'}" title="${sighted ? 'Mark as not sighted' : 'Mark as sighted'}">
                <span class="nature-species-main">
                  <span class="nature-species-name">${sighted ? '✅' : '⬜️'} ${escapeHtml(bird.speciesName)}</span>
                  <span class="nature-species-meta">${escapeHtml(bird.genusLabel)} • ${sighted && getSightingDate(bird) ? `Sighted ${escapeHtml(getSightingDate(bird).toLocaleDateString())}` : 'Not sighted yet'}</span>
                </span>
                <span class="nature-species-chips">
                  <span class="nature-chip ${bird.rarity.className}">${escapeHtml(bird.rarity.label)}</span>
                  ${seasonChips}
                  ${rarityNoteChips}
                </span>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');
  }

  function renderBirdChallenges(challenges) {
    const container = document.getElementById('birdsChallengeGrid');
    if (!container) return;

    container.innerHTML = challenges.map((challenge) => `
      <div class="nature-challenge-card ${challenge.completed ? 'completed' : ''}">
        <div class="nature-challenge-card-header">${challenge.icon} ${escapeHtml(challenge.title)}</div>
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
        <div class="nature-badge-icon">${badge.icon}</div>
        <div class="nature-badge-card-title">${escapeHtml(badge.title)}</div>
        <div class="nature-badge-card-description">${escapeHtml(badge.description)}</div>
        <div class="nature-badge-progress">${badge.progress}/${badge.goal}</div>
        <div class="nature-progress-track">
          <div class="nature-progress-fill" style="width:${badge.pct}%;"></div>
        </div>
      </div>
    `).join('');
  }

  function renderBirdError() {
    const targets = ['birdsFamilyGrid', 'birdsChallengeGrid', 'birdsBadgeGrid'];
    targets.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.innerHTML = `<div class="nature-empty-state">${escapeHtml(state.birdsError || 'Bird data could not be loaded.')}</div>`;
      }
    });
  }

  function renderBirds() {
    if (!state.birdsLoaded) return;
    const stats = getBirdStats();
    renderBirdHeaderStatus();
    renderBirdStats(stats);
    renderBirdLegend(stats);
    renderBirdFamilies(stats);
    renderBirdChallenges(getBirdChallenges(stats));
    renderBirdBadges(getBirdBadges(stats));
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

  function setActiveNatureSubTab(root, key) {
    state.activeSubTab = SUBTAB_KEYS.includes(key) ? key : 'birds';
    syncNatureSubTabs(root);
    announceNatureSubTab(root);
  }

  function toggleBirdSighting(birdId) {
    if (!birdId) return;

    if (state.sightings[birdId]) {
      delete state.sightings[birdId];
      if (typeof window.showToast === 'function') {
        window.showToast('Bird removed from sightings', 'info', 2000);
      }
    } else {
      state.sightings[birdId] = { sightedAt: new Date().toISOString() };
      if (typeof window.showToast === 'function') {
        window.showToast('Bird marked as sighted', 'success', 2000);
      }
    }

    saveSightings();
    renderBirds();
  }

  function bindNatureControls(root) {
    if (!root || root.dataset.natureControlsBound === '1') return;
    root.dataset.natureControlsBound = '1';

    root.addEventListener('click', (event) => {
      const subTabButton = event.target.closest('[data-nature-subtab]');
      if (subTabButton) {
        setActiveNatureSubTab(root, subTabButton.getAttribute('data-nature-subtab'));
        return;
      }

      const birdToggle = event.target.closest('[data-bird-toggle]');
      if (birdToggle) {
        toggleBirdSighting(birdToggle.getAttribute('data-bird-toggle'));
        return;
      }
    });

    const refreshButton = document.getElementById('natureChallengeRefreshBtn');
    if (refreshButton && refreshButton.dataset.natureRefreshBound !== '1') {
      refreshButton.dataset.natureRefreshBound = '1';
      refreshButton.addEventListener('click', () => loadBirdDataset(true));
    }
  }

  function initializeNatureChallengeTab() {
    const root = document.getElementById('natureChallengeRoot');
    if (!root) return;

    bindNatureControls(root);
    renderPlaceholderSubTabs();
    setActiveNatureSubTab(root, state.activeSubTab || 'birds');
    renderBirdHeaderStatus();
    loadBirdDataset(false);

    if (!state.initialized) {
      console.log('✅ Nature Challenge tab initialized');
      state.initialized = true;
    }
  }

  window.initializeNatureChallengeTab = initializeNatureChallengeTab;
  window.initNatureChallengeTab = window.initNatureChallengeTab || initializeNatureChallengeTab;
})();

