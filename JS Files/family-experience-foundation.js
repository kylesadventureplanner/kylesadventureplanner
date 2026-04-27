(function () {
  const STORAGE_KEY = 'familyExperiencePreferencesV1';

  const DEFAULT_PREFERENCES = {
    budgetMode: false,
    freeOnly: false,
    nearbyOnly: true,
    dayTrip: false,
    overnightStay: false,
    petFriendly: false,
    indoorOnly: false,
    lowWalking: false
  };

  const PLAN_PRESETS = {
    '2h-nearby': {
      label: '2-hour nearby',
      durationHours: 2,
      nearbyOnly: true,
      dayTrip: false,
      overnightStay: false
    },
    'half-day': {
      label: 'Half-day',
      durationHours: 4,
      nearbyOnly: false,
      dayTrip: true,
      overnightStay: false
    },
    'rainy-indoor': {
      label: 'Rainy day indoor',
      indoorOnly: true,
      nearbyOnly: true
    },
    'free-activities': {
      label: 'Free activities',
      freeOnly: true,
      budgetMode: true
    },
    'food-plus-one': {
      label: 'Food + 1 activity',
      includeFoodStop: true,
      maxActivities: 1,
      nearbyOnly: true
    }
  };

  const ACTION_ORDER = [
    'Explore',
    'Open in Map',
    'Directions',
    'Log Visit',
    'Batch Tags',
    'Notes'
  ];

  const SHORTCUTS = {
    '/': 'Focus search input',
    Escape: 'Close menu/modal',
    ArrowLeft: 'Previous tab/card context',
    ArrowRight: 'Next tab/card context'
  };

  function mergePreferences(partial) {
    return { ...DEFAULT_PREFERENCES, ...(partial || {}) };
  }

  function loadPreferences() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return mergePreferences();
      return mergePreferences(JSON.parse(raw));
    } catch (_error) {
      return mergePreferences();
    }
  }

  function savePreferences(next) {
    const merged = mergePreferences(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  }

  function applyPreset(preferences, presetKey) {
    const preset = PLAN_PRESETS[presetKey];
    if (!preset) return mergePreferences(preferences);
    return mergePreferences({ ...preferences, ...preset });
  }

  function buildWhySuggested(item, preferences, context) {
    const why = [];
    const driveMinutes = Number(item && item.driveMinutes);
    const isOpenNow = Boolean(item && item.openNow);
    const isIndoor = Boolean(item && item.indoor);
    const allowsPets = Boolean(item && item.petFriendly);
    const freeOrCheap = Boolean(item && (item.isFree || item.costRank <= 1));

    if (Number.isFinite(driveMinutes)) {
      if (preferences.nearbyOnly && driveMinutes <= 30) why.push('Short drive time fits Nearby mode.');
      if (preferences.dayTrip && driveMinutes <= 150) why.push('Drive time fits Day Trip range.');
      if (preferences.overnightStay && driveMinutes >= 120) why.push('Distance fits Overnight Stay planning.');
    }

    if (isOpenNow) why.push('Open now based on latest hours.');
    if (preferences.indoorOnly && isIndoor) why.push('Indoor-friendly for weather flexibility.');
    if (preferences.petFriendly && allowsPets) why.push('Pet-friendly option.');
    if ((preferences.freeOnly || preferences.budgetMode) && freeOrCheap) why.push('Budget fit: free or low-cost.');

    if (context && context.familyFitLabel) {
      why.push(`Family fit: ${context.familyFitLabel}.`);
    }

    if (!why.length) why.push('Strong overall match to your current filters.');
    return why;
  }

  function confidenceScore(item, preferences) {
    let score = 50;

    const driveMinutes = Number(item && item.driveMinutes);
    const hasHours = Boolean(item && item.openNow != null);
    const hasCost = Boolean(item && (item.isFree != null || Number.isFinite(Number(item.costRank))));
    const hasWeather = Boolean(item && item.indoor != null);

    if (hasHours) score += 12;
    if (hasCost) score += 10;
    if (hasWeather) score += 8;

    if (Number.isFinite(driveMinutes)) {
      if (preferences.nearbyOnly && driveMinutes <= 30) score += 10;
      if (preferences.lowWalking && Number(item.walkingBurden || 0) <= 1) score += 8;
    }

    if (preferences.freeOnly && (item && item.isFree)) score += 8;
    if (preferences.indoorOnly && (item && item.indoor)) score += 8;
    if (preferences.petFriendly && (item && item.petFriendly)) score += 8;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  function staleEntryReport(items, options) {
    const maxAgeDays = Number((options && options.maxAgeDays) || 45);
    const now = Date.now();
    const byNameAddress = new Map();
    const stale = [];
    const duplicates = [];

    (Array.isArray(items) ? items : []).forEach((item) => {
      const name = String(item && item.name || '').trim().toLowerCase();
      const address = String(item && item.address || '').trim().toLowerCase();
      const key = `${name}|${address}`;
      if (name && address) {
        if (byNameAddress.has(key)) {
          duplicates.push({ primary: byNameAddress.get(key), duplicate: item });
        } else {
          byNameAddress.set(key, item);
        }
      }

      const updatedAtRaw = item && (item.updatedAt || item.lastVisitedAt || item.createdAt);
      const updatedAt = updatedAtRaw ? Date.parse(String(updatedAtRaw)) : NaN;
      if (!Number.isFinite(updatedAt)) return;
      const ageDays = Math.floor((now - updatedAt) / (1000 * 60 * 60 * 24));
      if (ageDays > maxAgeDays) {
        stale.push({ item, ageDays });
      }
    });

    return { duplicates, stale, maxAgeDays };
  }

  window.FamilyExperienceFoundation = {
    STORAGE_KEY,
    DEFAULT_PREFERENCES,
    PLAN_PRESETS,
    ACTION_ORDER,
    SHORTCUTS,
    loadPreferences,
    savePreferences,
    applyPreset,
    buildWhySuggested,
    confidenceScore,
    staleEntryReport
  };
})();

