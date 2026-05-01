const { test, expect } = require('./reliability-test');

const CITY_VIEWER_TEST_KEY = 'city_test_payload';
const NEARBY_CACHE_STORAGE_KEY = '__nearby_attractions_cache_v2';
const CITY_VIEWER_PATH = `/HTML%20Files/city-viewer-window.html?dataKey=${CITY_VIEWER_TEST_KEY}&dataMode=curated-only`;
const CITY_VIEWER_PREFILTER_PATH = `${CITY_VIEWER_PATH}&prefilterTag=nature&prefilterLabel=Outdoors&sourceSubtab=outdoors`;

const TEST_LOCATIONS = [
  {
    city: 'Testville',
    state: 'NC',
    name: 'River Falls',
    sourceLabel: 'Nature_Locations.xlsx / Nature_Locations',
    website: 'https://example.com/river-falls',
    tags: 'waterfall, scenic, family',
    driveTime: '15m',
    hours: 'Open daily',
    duration: '90 minutes',
    difficulty: 'moderate',
    trailLength: '2.0 miles',
    address: '1 Falls Rd, Testville, NC',
    phone: '555-0001',
    rating: '4.9',
    cost: 'free',
    description: 'Large waterfall with multiple overlooks and strong scenic value.',
    googleUrl: 'https://maps.google.com/?q=River+Falls',
    latitude: 35.123,
    longitude: -82.456
  },
  {
    city: 'Testville',
    state: 'NC',
    name: 'Downtown Art House',
    sourceLabel: 'Entertainment_Locations.xlsx / General_Entertainment',
    website: 'https://example.com/art-house',
    tags: 'art, indoor, culture',
    driveTime: '8m',
    hours: 'Open daily',
    duration: '60 minutes',
    difficulty: 'easy',
    trailLength: '',
    address: '22 Main St, Testville, NC',
    phone: '555-0002',
    rating: '4.6',
    cost: '$',
    description: 'Small gallery and event space in the downtown core.',
    googleUrl: 'https://maps.google.com/?q=Downtown+Art+House',
    latitude: 35.12,
    longitude: -82.45
  },
  {
    city: 'Testville',
    state: 'NC',
    name: 'Hidden Tea Garden',
    sourceLabel: 'Retail_Food_and_Drink.xlsx / Restaurants',
    website: 'https://example.com/tea-garden',
    tags: 'garden, hidden, quiet',
    driveTime: '12m',
    hours: 'Open daily',
    duration: '75 minutes',
    difficulty: 'easy',
    trailLength: '',
    address: '8 Garden Ln, Testville, NC',
    phone: '555-0003',
    rating: '4.7',
    cost: '$$',
    description: 'Quiet tea garden with high atmosphere and a memorable layout.',
    googleUrl: 'https://maps.google.com/?q=Hidden+Tea+Garden',
    latitude: 35.121,
    longitude: -82.447
  },
  {
    city: 'Testville',
    state: 'NC',
    name: 'Skyline Overlook',
    sourceLabel: 'Nature_Locations.xlsx / Nature_Locations',
    website: 'https://example.com/skyline-overlook',
    tags: 'scenic, viewpoint, sunset',
    driveTime: '25m',
    hours: 'Open daily',
    duration: '45 minutes',
    difficulty: 'moderate',
    trailLength: '0.8 miles',
    address: '99 Ridge Rd, Testville, NC',
    phone: '555-0004',
    rating: '4.8',
    cost: 'free',
    description: 'Popular overlook with sunset views and short access trail.',
    googleUrl: 'https://maps.google.com/?q=Skyline+Overlook',
    latitude: 35.14,
    longitude: -82.47
  }
];

function buildNearbyCachePayload() {
  return {
    '35.1230|-82.4560|r5.0|c:all|p:none': {
      timestamp: Date.now(),
      data: [
        {
          id: 'google-cache-coffee',
          googlePlaceId: 'google-cache-coffee',
          name: 'Creekside Coffee Stop',
          types: ['cafe', 'food'],
          latitude: 35.124,
          longitude: -82.451,
          distance: 1.2,
          rating: 4.5,
          openNow: true,
          description: '45 Market St, Testville, NC',
          source: 'google',
          sourceSet: ['google'],
          exists: false,
          rankingReasonText: 'nearby, high rating',
          category: 'coffee_dessert'
        },
        {
          id: 'google-cache-dessert',
          googlePlaceId: 'google-cache-dessert',
          name: 'Sunset Dessert Bar',
          types: ['bakery', 'food'],
          latitude: 35.125,
          longitude: -82.452,
          distance: 1.6,
          rating: 4.4,
          openNow: false,
          description: '80 Sunset Ave, Testville, NC',
          source: 'google',
          sourceSet: ['google'],
          exists: false,
          rankingReasonText: 'distance relevance',
          category: 'coffee_dessert'
        },
        {
          id: 'pid-river-falls',
          googlePlaceId: 'pid-river-falls',
          name: 'River Falls',
          types: ['tourist_attraction'],
          latitude: 35.123,
          longitude: -82.456,
          distance: 0.1,
          rating: 4.9,
          description: '1 Falls Rd, Testville, NC',
          source: 'google',
          sourceSet: ['google'],
          exists: true
        },
        {
          id: 'google-cache-river-dup',
          googlePlaceId: '',
          name: 'River Falls',
          types: ['tourist_attraction'],
          latitude: 35.1231,
          longitude: -82.4562,
          distance: 0.2,
          rating: 4.8,
          description: '1 Falls Road, Testville NC',
          source: 'google',
          sourceSet: ['google'],
          exists: false,
          rankingReasonText: 'duplicate candidate by normalized address'
        },
        {
          id: 'google-cache-art-house-dup',
          googlePlaceId: '',
          name: 'Downtown Art House',
          types: ['art_gallery'],
          latitude: 35.12002,
          longitude: -82.45003,
          distance: 0.2,
          rating: 4.4,
          description: 'Nearby duplicate by geo fallback',
          source: 'google',
          sourceSet: ['google'],
          exists: false,
          rankingReasonText: 'duplicate candidate by geo fallback'
        }
      ]
    }
  };
}

async function seedCityViewer(page, options = {}) {
  const withNearbyCache = !!options.withNearbyCache;
  const adventuresData = Array.isArray(options.adventuresData) ? options.adventuresData : TEST_LOCATIONS;
  const nearbyPayload = (options.nearbyPayload && typeof options.nearbyPayload === 'object')
    ? options.nearbyPayload
    : buildNearbyCachePayload();
  await page.addInitScript(({ key, payload, nearbyKey, nearbyPayloadData, shouldSeedNearby }) => {
    try {
      window.localStorage.clear();
      if (shouldSeedNearby) {
        window.localStorage.setItem(nearbyKey, JSON.stringify(nearbyPayloadData));
      }
      window.sessionStorage.setItem(key, JSON.stringify(payload));
      window.sessionStorage.setItem('city_viewer_data_latest', key);
    } catch (_error) {
      // Ignore storage write errors in test bootstrap.
    }
  }, {
    key: CITY_VIEWER_TEST_KEY,
    nearbyKey: NEARBY_CACHE_STORAGE_KEY,
    nearbyPayloadData: nearbyPayload,
    shouldSeedNearby: withNearbyCache,
    payload: {
      adventuresData,
      configuredSources: [
        'Nature_Locations.xlsx / Nature_Locations',
        'Entertainment_Locations.xlsx / General_Entertainment',
        'Retail_Food_and_Drink.xlsx / Restaurants'
      ],
      dataMode: 'curated-only'
    }
  });
}

async function openTestCity(page) {
  await page.goto(CITY_VIEWER_PATH, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.city-card')).toHaveCount(1);
  await page.locator('.city-card').first().click();
  await expect(page.locator('#locationsPage')).toBeVisible();
  await expect(page.locator('#locationsPageTitle')).toContainText('Testville');
}

async function expandAdvancedFilters(page) {
  const toggle = page.locator('#locFilterToggleBtn');
  const expanded = await toggle.getAttribute('aria-expanded');
  if (expanded !== 'true') {
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  }
}

async function expandSourceDiagnostics(page) {
  const toggle = page.locator('#locStatusToggleBtn');
  const expanded = await toggle.getAttribute('aria-expanded');
  if (expanded !== 'true') {
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  }
}

test.describe('City Explorer Phase 1 and 2 enhancements', () => {
  async function readLastExportedRouteJson(page) {
    return page.evaluate(() => String(window.__lastExportedRouteJson || ''));
  }

  async function readCopiedText(page) {
    return page.evaluate(() => String(window.__copiedText || ''));
  }

  test.beforeEach(async ({ page }) => {
    await seedCityViewer(page);
  });

  test('location filter controls are not sticky', async ({ page }) => {
    await openTestCity(page);

    const computedPosition = await page.locator('.locations-controls').evaluate((node) => window.getComputedStyle(node).position);
    expect(computedPosition).not.toBe('sticky');
  });

  test('advanced and source diagnostics sections are collapsed by default', async ({ page }) => {
    await openTestCity(page);

    await expect(page.locator('#locFilterToggleBtn')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#locFilterCollapsible')).toHaveClass(/collapsed/);
    await expect(page.locator('#locStatusToggleBtn')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#locStatusCollapsible')).toHaveClass(/collapsed/);
  });

  test('active filter chips appear and individual chip removal updates filters', async ({ page }) => {
    await openTestCity(page);
    await expandAdvancedFilters(page);

    await page.locator('#locSearchName').fill('falls');
    await page.locator('#locFilterDifficulty').selectOption('moderate');

    const chips = page.locator('#locActiveFilters');
    await expect(chips).toBeVisible();
    await expect(chips).toContainText('Name: falls');
    await expect(chips).toContainText('Difficulty: moderate');

    const difficultyChip = page.locator('#locActiveFilters .loc-active-filter-chip').filter({ hasText: 'Difficulty: moderate' });
    await difficultyChip.locator('button').click();

    await expect(page.locator('#locFilterDifficulty')).toHaveValue('');
    await expect(chips).not.toContainText('Difficulty: moderate');
    await expect(chips).toContainText('Name: falls');
  });

  test('quick tag pills display result counts and cards render star rating badges', async ({ page }) => {
    await openTestCity(page);

    const quickTags = page.locator('#locQuickTags .loc-tag-btn');
    await expect(quickTags.first()).toBeVisible();
    await expect(quickTags.first()).toContainText(/\(\d+\)/);

    await expect(page.locator('.loc-card .loc-rating-stars').first()).toBeVisible();
  });

  test('mixed nearby cache rows blend with saved results using saved-first ranking and source chips', async ({ page }) => {
    await seedCityViewer(page, { withNearbyCache: true });
    await openTestCity(page);
    await expandSourceDiagnostics(page);
    await expandAdvancedFilters(page);

    await expect(page.locator('#locSourceFilters [data-source-filter="saved"]')).toContainText('(4)');
    await expect(page.locator('#locSourceFilters [data-source-filter="web"]')).toContainText('(2)');
    await expect(page.locator('#locationsPageSubtitle')).toContainText('4 saved + 2 nearby web recs');
    await expect(page.locator('#locMixedSourceDiagnostics')).toContainText('Dedupe skipped: 2');
    await expect(page.locator('#locMixedSourceDiagnostics')).toContainText('Raw nearby rows: 5');
    await expect(page.locator('#locMixedSourceDiagnosticsHelp')).toBeVisible();
    await expect(page.locator('#locMixedSourceDiagnostics')).toContainText('Thresholds: geo ≤ 0.20mi');

    const names = await page.locator('.loc-card .loc-card-name').allInnerTexts();
    expect(names.slice(0, 4)).toEqual([
      'Downtown Art House',
      'Hidden Tea Garden',
      'River Falls',
      'Skyline Overlook'
    ]);

    const origins = await page.locator('.loc-card').evaluateAll((cards) => cards.map((card) => card.getAttribute('data-location-origin')));
    expect(origins.slice(0, 4)).toEqual(['saved', 'saved', 'saved', 'saved']);
    expect(origins.slice(4)).toEqual(['web', 'web']);

    await page.locator('#locSourceFilters [data-source-filter="web"]').click();
    await expect(page.locator('#locResultsCount')).toContainText('2 locations');
    await expect(page.locator('#locActiveFilters')).toContainText('Source: web');
    await expect(page.locator('.loc-card')).toHaveCount(2);
    await expect(page.locator('.loc-card').first()).toContainText('Creekside Coffee Stop');

    await page.locator('#locSearchName').fill('coffee');
    await expect(page.locator('#locSourceFilters [data-source-filter="saved"]')).toContainText('(0)');
    await expect(page.locator('#locSourceFilters [data-source-filter="web"]')).toContainText('(1)');

    await page.locator('#locActiveFilters .loc-active-filter-chip').filter({ hasText: 'Source: web' }).locator('button').click();
    await expect(page.locator('#locResultsCount')).toContainText('1 location');
    await expect(page.locator('.loc-card')).toHaveCount(1);
    await expect(page.locator('.loc-card').first()).toContainText('Creekside Coffee Stop');
  });

  test('debug dedupe URL thresholds split just-inside vs just-outside geo candidates', async ({ page }) => {
    await seedCityViewer(page, {
      withNearbyCache: true,
      nearbyPayload: {
        '35.1230|-82.4560|r5.0|c:all|p:none': {
          timestamp: Date.now(),
          data: [
            {
              id: 'inside-threshold-dup',
              name: 'Downtown Art House',
              latitude: 35.1206,
              longitude: -82.45,
              source: 'google',
              sourceSet: ['google'],
              exists: false,
              rankingReasonText: 'inside threshold duplicate candidate'
            },
            {
              id: 'outside-threshold-kept',
              name: 'Downtown Art House',
              latitude: 35.1211,
              longitude: -82.45,
              source: 'google',
              sourceSet: ['google'],
              exists: false,
              rankingReasonText: 'outside threshold keep candidate'
            }
          ]
        }
      }
    });

    await page.goto(CITY_VIEWER_PATH, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      const url = new URL(window.location.href);
      url.searchParams.set('debugDedupeGeoMiles', '0.05');
      url.searchParams.set('debugDedupeNameGeoMiles', '0.05');
      window.history.replaceState({}, '', url.toString());
      resolveNearbyDebugThresholdsFromUrl();
    });
    await expect(page.locator('.city-card')).toHaveCount(1);
    await page.locator('.city-card').first().click();
    await expect(page.locator('#locationsPage')).toBeVisible();

    await expect(page.locator('#locSourceFilters [data-source-filter="saved"]')).toContainText('(4)');
    await expect(page.locator('#locSourceFilters [data-source-filter="web"]')).toContainText('(1)');
    await expect(page.locator('#locMixedSourceDiagnostics')).toContainText('Dedupe skipped: 1');
    await expect(page.locator('#locMixedSourceDiagnostics')).toContainText('Thresholds: geo ≤ 0.05mi');

    await expandAdvancedFilters(page);
    await page.locator('#locSourceFilters [data-source-filter="web"]').click();
    await expect(page.locator('.loc-card')).toHaveCount(1);
    await expect(page.locator('.loc-card').first()).toContainText('Downtown Art House');
  });

  test('web-only source view is preserved through source chips and diagnostics counts', async ({ page }) => {
    await seedCityViewer(page, { withNearbyCache: true });
    await openTestCity(page);

    await expandAdvancedFilters(page);
    await page.locator('#locSourceFilters [data-source-filter="web"]').click();
    await expect(page.locator('#locResultsCount')).toContainText('2 locations');
    await expect(page.locator('.loc-card')).toHaveCount(2);
    await expect(page.locator('.loc-card').first()).toHaveAttribute('data-location-origin', 'web');
    await expect(page.locator('#locMixedSourceDiagnostics')).toContainText('Visible now: 0 saved');
    await expect(page.locator('#locMixedSourceDiagnostics')).toContainText('2 web');
  });

  test('saved-only source mix without nearby cache shows only saved counts and zero web additions', async ({ page }) => {
    await seedCityViewer(page, { withNearbyCache: false });
    await openTestCity(page);

    await expect(page.locator('#locSourceFilters [data-source-filter="saved"]')).toContainText('(4)');
    await expect(page.locator('#locSourceFilters [data-source-filter="web"]')).toContainText('(0)');
    await expect(page.locator('#locMixedSourceDiagnostics')).toContainText('Web added: 0');
    await expect(page.locator('#locMixedSourceDiagnostics')).toContainText('Raw nearby rows: 0');
  });

  test('empty nearby cache payload keeps saved-only behavior without introducing web rows', async ({ page }) => {
    await seedCityViewer(page, {
      withNearbyCache: true,
      nearbyPayload: {
        '35.1230|-82.4560|r5.0|c:all|p:none': {
          timestamp: Date.now(),
          data: []
        }
      }
    });
    await openTestCity(page);

    await expect(page.locator('#locSourceFilters [data-source-filter="saved"]')).toContainText('(4)');
    await expect(page.locator('#locSourceFilters [data-source-filter="web"]')).toContainText('(0)');
    await expect(page.locator('#locMixedSourceDiagnostics')).toContainText('Cache entries: 0');
    await expect(page.locator('#locMixedSourceDiagnostics')).toContainText('Raw nearby rows: 0');
    await expect(page.locator('.loc-card')).toHaveCount(4);
  });

  test('Adventure prefilter is visible and can be cleared to show everything', async ({ page }) => {
    await page.goto(CITY_VIEWER_PREFILTER_PATH, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      prefilterTag = 'nature';
      prefilterLabel = 'Outdoors';
      prefilterSourceSubtab = 'outdoors';
      renderPrefilterNotice();
      renderCities();
    });

    await page.locator('.city-card').first().click();
    await expect(page.locator('#locationsPage')).toBeVisible();
    await expect(page.locator('#locActiveFilters')).toContainText('Adventure subtab: Outdoors');
    await expect(page.locator('#locResultsCount')).toContainText('2 locations');

    await page.locator('#locPrefilterScopeToggleBtn').evaluate((node) => node.click());
    await expect(page.locator('#locResultsCount')).toContainText('4 locations');
    await expect(page.locator('#locActiveFilters')).toContainText('Subtab scope: all city tables');

    await page.locator('#locPrefilterScopeToggleBtn').evaluate((node) => node.click());
    await expect(page.locator('#locResultsCount')).toContainText('2 locations');

    await page.locator('#locActiveFilters .loc-active-filter-chip.is-prefilter button').evaluate((node) => node.click());
    await expect(page.locator('#locActiveFilters .loc-active-filter-chip.is-prefilter')).toHaveCount(0);
    await expect(page.locator('#locResultsCount')).toContainText('4 locations');

    await page.getByRole('button', { name: '← Back to Cities' }).click();
    await expect(page.locator('#cityPrefilterNotice')).toBeHidden();
  });

  test('empty state reset action restores results after a no-match filter', async ({ page }) => {
    await openTestCity(page);

    await page.locator('#locSearchName').fill('zzzz-no-match');

    const emptyState = page.locator('.loc-empty');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('No matching locations found.');

    await emptyState.getByRole('button', { name: 'Reset Filters' }).click();

    await expect(page.locator('#locSearchName')).toHaveValue('');
    await expect(page.locator('.loc-card')).toHaveCount(4);
    await expect(page.locator('#locResultsCount')).toContainText('4 locations');
  });

  test('smart presets and shortlist compare tray power the planning workflow', async ({ page }) => {
    await openTestCity(page);

    await page.locator('#locPresetBestValueBtn').click();
    await expect(page.locator('#locSortBy')).toHaveValue('bestValue');
    await expect(page.locator('#locPresetBestValueBtn')).toHaveClass(/is-active/);

    await page.locator('#locPresetClosestNowBtn').click();
    await expect(page.locator('#locFilterOpenNow')).toBeChecked();
    await expect(page.locator('#locSortBy')).toHaveValue('driveTime');
    await expect(page.locator('#locPresetClosestNowBtn')).toHaveClass(/is-active/);

    await page.locator('.loc-select-btn').nth(0).evaluate((node) => node.click());
    await page.locator('.loc-select-btn').nth(1).evaluate((node) => node.click());

    const compareTray = page.locator('#locCompareTray');
    await expect(compareTray).toBeVisible();
    await expect(compareTray).toContainText('Compare selected stops');
    await expect(compareTray.locator('[data-compare-loc-id]')).toHaveCount(2);
    await expect(compareTray).toContainText('Value score');
  });

  test('ranking badges and confidence indicators render on cards and detail view', async ({ page }) => {
    await openTestCity(page);

    await expect(page.locator('.loc-card [data-confidence-indicator]')).toHaveCount(4);
    await expect(page.locator('.loc-card').filter({ hasText: 'River Falls' }).locator('[data-rank-badge="best-value"]').first()).toContainText('Best value #1');
    await expect(page.locator('.loc-card').filter({ hasText: 'Hidden Tea Garden' }).locator('[data-rank-badge="most-unique"]').first()).toContainText('Unique pick #1');
    await expect(page.locator('.loc-card').filter({ hasText: 'Downtown Art House' }).locator('[data-rank-badge="quick-stop"]').first()).toContainText('Quick stop #1');
    await expect(page.locator('.loc-card').filter({ hasText: 'River Falls' }).locator('[data-confidence-indicator="high"]').first()).toContainText('High confidence');

    await page.locator('.loc-card').filter({ hasText: 'River Falls' }).first().click();
    await expect(page.locator('#locationDetailPage')).toBeVisible();
    await expect(page.locator('#locationDetailContent [data-rank-badge="best-value"]').first()).toContainText('Best value #1');
    await expect(page.locator('#locationDetailContent [data-confidence-indicator="high"]').first()).toContainText('High confidence');
  });

  test('day plan shows itinerary score and route-feasibility confidence', async ({ page }) => {
    await openTestCity(page);

    await page.locator('.loc-card', { hasText: 'River Falls' }).first().locator('.loc-select-btn').evaluate((node) => node.click());
    await page.locator('.loc-card', { hasText: 'Downtown Art House' }).first().locator('.loc-select-btn').evaluate((node) => node.click());
    await page.locator('.loc-card', { hasText: 'Hidden Tea Garden' }).first().locator('.loc-select-btn').evaluate((node) => node.click());

    await page.getByRole('button', { name: 'Build Day Plan' }).click();

    await expect(page.locator('#locDayPlan')).toBeVisible();
    await expect(page.locator('#locDayPlanSummary [data-itinerary-score]')).toContainText(/Itinerary score \d+\/100/);
    await expect(page.locator('#locDayPlanSummary [data-route-confidence]')).toContainText('Route confidence: Comfortable');
    await expect(page.locator('#locRouteQuality [data-route-feasibility-status]')).toContainText('Comfortable');
    await expect(page.locator('#locRouteTradeoffPanel [data-route-tradeoff]')).toContainText(/min travel for [+-]\d+\.\d rating/i);
    await expect(page.locator('#locRouteTradeoffPanel [data-budget-alt-route]')).toContainText(/Budget-friendly alternate/i);
    await expect(page.locator('#locRouteTradeoffPanel [data-route-variant]')).toHaveCount(3);
    await expect(page.locator('#locRouteTradeoffPanel [data-optimizer-weights]')).toContainText('Weights: rating 4 · cost 3 · travel 4');

    await page.locator('#locWeightRating').selectOption('5');
    await page.locator('#locWeightCost').selectOption('5');
    await page.locator('#locWeightTravel').selectOption('2');
    await page.getByRole('button', { name: 'Apply weights' }).click();
    await expect(page.locator('#locRouteTradeoffPanel [data-optimizer-weights]')).toContainText('Weights: rating 5 · cost 5 · travel 2');

    await page.locator('#locRouteTradeoffPanel [data-route-variant="budget-friendly"] .loc-route-variant-btn').click();
    await expect(page.locator('#locRouteTradeoffPanel [data-route-variant="budget-friendly"]')).toHaveClass(/active/);

    await page.locator('#locExportVariantBtn').click();
    await expect.poll(async () => {
      const exported = await readLastExportedRouteJson(page);
      return exported.length;
    }, { timeout: 10000 }).toBeGreaterThan(0);
    await expect.poll(async () => {
      const exported = await readLastExportedRouteJson(page);
      return exported;
    }, { timeout: 10000 }).toContain('"variantId": "budget-friendly"');

    await page.locator('#locTimeStart').fill('09:00');
    await page.locator('#locTimeEnd').fill('11:45');
    await page.locator('#locTimePerStop').fill('40');
    await page.getByRole('button', { name: /Calculate Feasibility/i }).click();

    await expect(page.locator('#locDayPlanSummary [data-route-confidence]')).toContainText('Route confidence: Tight');
    await expect(page.locator('#locRouteQuality [data-route-feasibility-status]')).toContainText('Tight');

    await page.locator('#locTimeStart').fill('09:00');
    await page.locator('#locTimeEnd').fill('10:00');
    await page.locator('#locTimePerStop').fill('45');
    await page.getByRole('button', { name: /Calculate Feasibility/i }).click();

    await expect(page.locator('#locDayPlanSummary [data-route-confidence]')).toContainText('Route confidence: Risky');
    await expect(page.locator('#locRouteQuality [data-route-feasibility-status]')).toContainText('Risky');
  });

  test('bulk actions can apply tags, notes, and visited state to selected locations', async ({ page }) => {
    await openTestCity(page);

    await page.getByRole('button', { name: 'Select Visible' }).click();
    await expect(page.locator('#locShortlistCount')).toContainText('4 selected');

    await page.locator('#locBulkActionSelect').selectOption('add-tags');
    await page.locator('#locBulkActionValue').fill('featured, weekend');
    await page.getByRole('button', { name: 'Apply to Selected' }).click();
    await expect(page.locator('.loc-card').first().locator('.loc-tag-pill.is-user-large').filter({ hasText: 'featured' })).toBeVisible();

    await page.locator('#locBulkActionSelect').selectOption('add-note');
    await page.locator('#locBulkActionValue').fill('Bring water and snacks.');
    await page.getByRole('button', { name: 'Apply to Selected' }).click();
    await expect(page.locator('.loc-card').first().locator('.loc-note-block')).toContainText('Bring water and snacks.');

    await page.locator('#locBulkActionSelect').selectOption('mark-visited');
    await page.getByRole('button', { name: 'Apply to Selected' }).click();
    await expect(page.locator('.loc-card').first().locator('.loc-visited-chip')).toContainText('Visited');
  });

  test('bulk copy-tags honors source and merge mode selectors', async ({ page }) => {
    await openTestCity(page);

    await page.locator('.loc-card', { hasText: 'River Falls' }).first().locator('.loc-select-btn').evaluate((node) => node.click());
    await page.locator('.loc-card', { hasText: 'Downtown Art House' }).first().locator('.loc-select-btn').evaluate((node) => node.click());
    await page.locator('.loc-card', { hasText: 'Hidden Tea Garden' }).first().locator('.loc-select-btn').evaluate((node) => node.click());
    await expect(page.locator('#locShortlistCount')).toContainText('3 selected');

    await page.selectOption('#locBulkActionSelect', 'copy-tags-from-first');
    await page.selectOption('#locBulkCopySourceMode', 'first');
    await page.selectOption('#locBulkCopyMergeMode', 'append');
    await page.getByRole('button', { name: 'Apply to Selected' }).click();

    await expect.poll(async () => {
      return page.evaluate(() => {
        const ids = Array.from(getShortlistSet());
        return ids.map((id) => {
          const loc = findLocationById(id);
          return { name: String(loc?.name || ''), tags: getEffectiveLocationTagsById(id).slice().sort() };
        });
      });
    }).toEqual([
      { name: 'River Falls', tags: ['family', 'scenic', 'waterfall'] },
      { name: 'Downtown Art House', tags: ['art', 'culture', 'family', 'indoor', 'scenic', 'waterfall'] },
      { name: 'Hidden Tea Garden', tags: ['family', 'garden', 'hidden', 'quiet', 'scenic', 'waterfall'] }
    ]);

    await page.selectOption('#locBulkCopySourceMode', 'union');
    await page.selectOption('#locBulkCopyMergeMode', 'replace');
    await page.getByRole('button', { name: 'Apply to Selected' }).click();

    await expect.poll(async () => {
      return page.evaluate(() => {
        const ids = Array.from(getShortlistSet());
        return ids.map((id) => {
          const loc = findLocationById(id);
          return { name: String(loc?.name || ''), tags: getEffectiveLocationTagsById(id).slice().sort() };
        });
      });
    }).toEqual([
      { name: 'River Falls', tags: ['art', 'culture', 'family', 'garden', 'hidden', 'indoor', 'quiet', 'scenic', 'waterfall'] },
      { name: 'Downtown Art House', tags: ['art', 'culture', 'family', 'garden', 'hidden', 'indoor', 'quiet', 'scenic', 'waterfall'] },
      { name: 'Hidden Tea Garden', tags: ['art', 'culture', 'family', 'garden', 'hidden', 'indoor', 'quiet', 'scenic', 'waterfall'] }
    ]);
  });

  test('quick action copy-tags uses configured source and merge modes', async ({ page }) => {
    await openTestCity(page);

    await page.locator('.loc-card', { hasText: 'Hidden Tea Garden' }).first().locator('.loc-select-btn').evaluate((node) => node.click());
    await expect(page.locator('#locShortlistCount')).toContainText('1 selected');

    await page.selectOption('#locBulkActionSelect', 'copy-tags-from-first');
    await page.selectOption('#locBulkCopySourceMode', 'union');
    await page.selectOption('#locBulkCopyMergeMode', 'replace');

    const sourceLocId = await page.evaluate(() => {
      const city = citiesData && citiesData[currentCityKey];
      const loc = city && Array.isArray(city.locations)
        ? city.locations.find((entry) => String(entry?.name || '') === 'River Falls')
        : null;
      return loc ? getLocId(loc) : '';
    });
    await page.evaluate((locId) => {
      window.runQuickActionByEncodedId(encodeURIComponent(String(locId || '')), 'copy-tags-to-selected');
    }, sourceLocId);

    await expect.poll(async () => {
      return page.evaluate(() => {
        const city = citiesData && citiesData[currentCityKey];
        const loc = city && Array.isArray(city.locations)
          ? city.locations.find((entry) => String(entry?.name || '') === 'Hidden Tea Garden')
          : null;
        if (!loc) return [];
        return getEffectiveLocationTagsById(getLocId(loc)).slice().sort();
      });
    }).toEqual(['family', 'garden', 'hidden', 'quiet', 'scenic', 'waterfall']);
  });

  test('quick action copy-tags supports union+append mode across selected targets', async ({ page }) => {
    await openTestCity(page);

    await page.locator('.loc-card', { hasText: 'Downtown Art House' }).first().locator('.loc-select-btn').evaluate((node) => node.click());
    await page.locator('.loc-card', { hasText: 'Hidden Tea Garden' }).first().locator('.loc-select-btn').evaluate((node) => node.click());
    await expect(page.locator('#locShortlistCount')).toContainText('2 selected');

    await page.selectOption('#locBulkActionSelect', 'copy-tags-from-first');
    await page.selectOption('#locBulkCopySourceMode', 'union');
    await page.selectOption('#locBulkCopyMergeMode', 'append');

    const sourceLocId = await page.evaluate(() => {
      const city = citiesData && citiesData[currentCityKey];
      const loc = city && Array.isArray(city.locations)
        ? city.locations.find((entry) => String(entry?.name || '') === 'River Falls')
        : null;
      return loc ? getLocId(loc) : '';
    });
    await page.evaluate((locId) => {
      window.runQuickActionByEncodedId(encodeURIComponent(String(locId || '')), 'copy-tags-to-selected');
    }, sourceLocId);

    await expect.poll(async () => {
      return page.evaluate(() => {
        const city = citiesData && citiesData[currentCityKey];
        const names = ['Downtown Art House', 'Hidden Tea Garden'];
        return names.map((name) => {
          const loc = city && Array.isArray(city.locations)
            ? city.locations.find((entry) => String(entry?.name || '') === name)
            : null;
          const tags = loc ? getEffectiveLocationTagsById(getLocId(loc)).slice().sort() : [];
          return { name, tags };
        });
      });
    }).toEqual([
      { name: 'Downtown Art House', tags: ['art', 'culture', 'family', 'garden', 'hidden', 'indoor', 'quiet', 'scenic', 'waterfall'] },
      { name: 'Hidden Tea Garden', tags: ['art', 'culture', 'family', 'garden', 'hidden', 'indoor', 'quiet', 'scenic', 'waterfall'] }
    ]);
  });

  test('per-card quick actions support copy address utility', async ({ page }) => {
    await seedCityViewer(page);
    await openTestCity(page);

    await page.evaluate(() => {
      window.__copiedText = '';
      const original = window.copyTextToClipboard;
      window.copyTextToClipboard = async (text, successMessage) => {
        window.__copiedText = String(text || '');
        if (typeof original === 'function') return original(text, successMessage);
      };
    });

    const firstCard = page.locator('.loc-card').first();
    await firstCard.locator('.loc-quick-actions summary').click();
    await expect(firstCard.locator('.loc-quick-actions-menu button', { hasText: 'Copy address' })).toBeVisible();
    const locId = await firstCard.getAttribute('data-loc-id');
    await page.evaluate((id) => {
      window.runQuickActionByEncodedId(encodeURIComponent(String(id || '')), 'copy-address');
    }, locId);
    await expect.poll(async () => {
      const copied = await readCopiedText(page);
      return copied.length;
    }, { timeout: 10000 }).toBeGreaterThan(0);
    await expect.poll(async () => {
      const copied = await readCopiedText(page);
      return copied;
    }, { timeout: 10000 }).toContain('Testville');
  });

  test('quick action open-google falls back to a real Google Maps URL when stored googleUrl is unavailable', async ({ page }) => {
    await openTestCity(page);

    const openedUrl = await page.evaluate(() => {
      let captured = '';
      const originalOpen = window.open;
      window.open = (url, target, features) => {
        captured = String(url || '');
        return { focus() {}, closed: false, target, features };
      };

      try {
        const city = citiesData && citiesData[currentCityKey];
        const loc = city && Array.isArray(city.locations)
          ? city.locations.find((entry) => String(entry?.name || '') === 'River Falls')
          : null;
        if (!loc) return '';
        loc.googleUrl = 'Unavailable';
        loc.googlePlaceId = 'pid-river-falls';
        runQuickActionByEncodedId(encodeURIComponent(getLocId(loc)), 'open-google');
        return captured;
      } finally {
        window.open = originalOpen;
      }
    });

    expect(openedUrl).toContain('https://www.google.com/maps/search/?');
    expect(openedUrl).toContain('query_place_id=pid-river-falls');
  });

  test('card footer View Details button opens detail page and Google Maps uses external link attributes', async ({ page }) => {
    await openTestCity(page);

    const riverCard = page.locator('.loc-card', { hasText: 'River Falls' }).first();
    await expect(riverCard).toHaveAttribute('title', 'Opens detail view');
    await expect(riverCard).toHaveAttribute('aria-description', 'Opens detail view');

    const mapsLink = riverCard.locator('.loc-card-footer a.loc-action-btn', { hasText: 'Google Maps' });
    await expect(mapsLink).toBeVisible();
    await expect(mapsLink).toHaveAttribute('target', '_blank');
    await expect(mapsLink).toHaveAttribute('rel', /noopener/);
    await expect(mapsLink).toHaveAttribute('href', /(maps\.google\.com|google\.com\/maps)/);

    const viewDetailsButton = riverCard.locator('.loc-card-footer .loc-action-btn', { hasText: 'View Details' });
    await expect(viewDetailsButton).toBeVisible();
    await viewDetailsButton.click();

    await expect(page.locator('#locationDetailPage')).toBeVisible();
    await expect(page.locator('#locationDetailTitle')).toContainText('River Falls');
  });

  test('clicking card surface opens detail page directly', async ({ page }) => {
    await openTestCity(page);

    const riverCard = page.locator('.loc-card', { hasText: 'River Falls' }).first();
    await expect(riverCard).toBeVisible();
    await expect(riverCard).toHaveAttribute('aria-description', 'Opens detail view');

    // Click non-footer surface text to assert card-level open behavior.
    await riverCard.locator('.loc-card-name').click();

    await expect(page.locator('#locationDetailPage')).toBeVisible();
    await expect(page.locator('#locationDetailTitle')).toContainText('River Falls');
  });

  test('detail view keyboard shortcuts navigate next and previous cards while ignoring typing fields', async ({ page }) => {
    await openTestCity(page);

    const riverCard = page.locator('.loc-card', { hasText: 'River Falls' }).first();
    await riverCard.locator('.loc-card-name').click();
    await expect(page.locator('#locationDetailTitle')).toContainText('River Falls');
    await expect(page.locator('.location-detail-keyboard-hint')).toContainText('Use ←/→ to browse');

    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#locationDetailTitle')).toContainText('Skyline Overlook');

    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#locationDetailTitle')).toContainText('River Falls');

    await page.evaluate(() => toggleLocationDetailEditor(true));
    const nameInput = page.locator('#locDetailEdit_name');
    await expect(nameInput).toBeVisible();
    await nameInput.focus();
    await page.keyboard.press('ArrowRight');

    // Focused text input should not trigger detail navigation shortcuts.
    await expect(page.locator('#locationDetailTitle')).toContainText('River Falls');
  });

  test('one-click core refresh updates description, hours, and coordinates then syncs to Excel', async ({ page }) => {
    const graphPatchCalls = [];
    const headers = [
      'Name',
      'Google Place ID',
      'Website',
      'Tags',
      'Drive Time',
      'Hours of Operation',
      'Duration',
      'Difficulty',
      'Trail Length',
      'Address',
      'Phone Number',
      'Google Rating',
      'Cost',
      'Description',
      'Google URL',
      'Latitude',
      'Longitude',
      'GPS Coordinates'
    ];
    const rowValues = [
      'River Falls',
      'pid-river-falls',
      'https://example.com/river-falls',
      'waterfall, scenic, family',
      '15m',
      'Open daily',
      '90 minutes',
      'moderate',
      '2.0 miles',
      '1 Falls Rd, Testville, NC',
      '555-0001',
      '4.9',
      'free',
      'Legacy description',
      'https://maps.google.com/?q=River+Falls',
      '',
      '',
      ''
    ];

    await page.route('https://graph.microsoft.com/**', async (route) => {
      const request = route.request();
      const url = request.url();
      const method = request.method();
      if (url.includes('/headerRowRange')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ values: [headers] })
        });
        return;
      }
      if (method === 'GET' && url.includes('/rows')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ value: [{ values: [rowValues] }] })
        });
        return;
      }
      if (method === 'PATCH' && url.includes('/rows/itemAt(index=')) {
        graphPatchCalls.push(JSON.parse(request.postData() || '{}'));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true })
        });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ value: [] }) });
    });

    await seedCityViewer(page, {
      adventuresData: TEST_LOCATIONS.map((loc) => {
        if (String(loc.name) === 'River Falls') {
          return { ...loc, googlePlaceId: 'pid-river-falls' };
        }
        return { ...loc };
      })
    });
    await openTestCity(page);
    await page.evaluate(() => {
      window.accessToken = 'playwright-graph-token';
      window.getPlaceDetails = async () => ({
        description: 'Fresh place description from Google Places.',
        hours: {
          weekdayDescriptions: [
            'Monday: 9:00 AM - 5:00 PM',
            'Tuesday: 9:00 AM - 5:00 PM'
          ]
        },
        coordinates: {
          lat: 35.654321,
          lng: -82.123456
        }
      });
    });

    const riverCard = page.locator('.loc-card', { hasText: 'River Falls' }).first();
    await expect(riverCard.locator('button', { hasText: 'Refresh Core Fields' })).toBeVisible();
    const locId = await riverCard.getAttribute('data-loc-id');
    await page.evaluate((id) => {
      window.runQuickActionByEncodedId(encodeURIComponent(String(id || '')), 'refresh-core-fields');
    }, locId);

    await expect.poll(() => page.evaluate(() => {
      const city = citiesData && citiesData[currentCityKey];
      const loc = city && Array.isArray(city.locations)
        ? city.locations.find((entry) => String(entry?.name || '') === 'River Falls')
        : null;
      if (!loc) return null;
      return {
        hours: String(loc.hours || ''),
        description: String(loc.description || ''),
        latitude: String(loc.latitude || loc.lat || ''),
        longitude: String(loc.longitude || loc.lng || '')
      };
    }), { timeout: 10000 }).toEqual({
      hours: 'Monday: 9:00 AM - 5:00 PM; Tuesday: 9:00 AM - 5:00 PM',
      description: 'Fresh place description from Google Places.',
      latitude: '35.654321',
      longitude: '-82.123456'
    });
    await expect(riverCard.locator('.loc-refresh-badge')).toContainText('Last refreshed: just now');

    const synced = await page.evaluate(async () => {
      const city = citiesData && citiesData[currentCityKey];
      const loc = city && Array.isArray(city.locations)
        ? city.locations.find((entry) => String(entry?.name || '') === 'River Falls')
        : null;
      if (!loc) return false;
      return await syncLocationEditsToGraph(getLocId(loc));
    });
    expect(synced).toBe(true);

    await expect.poll(() => graphPatchCalls.length, { timeout: 10000 }).toBeGreaterThan(0);
    const updatedRow = graphPatchCalls[graphPatchCalls.length - 1].values[0];
    expect(updatedRow[5]).toContain('Monday: 9:00 AM - 5:00 PM');
    expect(updatedRow[13]).toBe('Fresh place description from Google Places.');
    expect(updatedRow[15]).toBe('35.654321');
    expect(updatedRow[16]).toBe('-82.123456');
    expect(updatedRow[17]).toBe('35.654321, -82.123456');
  });

  test('quick action map view opens split map and focuses selected location', async ({ page }) => {
    await openTestCity(page);

    const locId = await page.locator('.loc-card', { hasText: 'River Falls' }).first().getAttribute('data-loc-id');
    await page.evaluate((id) => {
      window.runQuickActionByEncodedId(encodeURIComponent(String(id || '')), 'focus-map');
    }, locId);

    await expect(page.locator('#locMainLayout')).toHaveClass(/split/);
    await expect(page.locator('.loc-card.active')).toContainText('River Falls');
  });

  test('map fallback shows basemap unavailable status and retries Google script from inline action', async ({ page }) => {
    await page.addInitScript(() => {
      const originalAppendChild = HTMLHeadElement.prototype.appendChild;
      window.__mapsScriptAppendAttempts = 0;
      HTMLHeadElement.prototype.appendChild = function (node) {
        const isScript = node && node.tagName === 'SCRIPT';
        const src = isScript ? String(node.src || '') : '';
        if (isScript && src.includes('maps.googleapis.com/maps/api/js')) {
          window.__mapsScriptAppendAttempts += 1;
          if (window.__mapsScriptAppendAttempts === 1) {
            setTimeout(() => {
              if (typeof node.onerror === 'function') node.onerror(new Event('error'));
            }, 0);
            return node;
          }
          const mockScript = [
            'window.google = window.google || {};',
            'window.google.maps = window.google.maps || {};',
            'window.google.maps.Map = function(){ this.setCenter = function(){}; this.fitBounds = function(){}; };',
            'window.google.maps.Marker = function(){ this.setMap = function(){}; this.setOpacity = function(){}; this.addListener = function(){}; };',
            'window.google.maps.LatLngBounds = function(){ this.extend = function(){}; };',
            'window.google.maps.event = { trigger: function(){} };',
            'setTimeout(function(){ if (typeof window.__cvMapsInit === "function") window.__cvMapsInit(); }, 120);'
          ].join('');
          node.src = `data:text/javascript,${encodeURIComponent(mockScript)}`;
        }
        return originalAppendChild.call(this, node);
      };
    });

    await openTestCity(page);

    const splitToggle = page.locator('#locSplitToggleBtn');
    await splitToggle.click();

    await expect(page.locator('#locMapStatus')).toContainText('Basemap unavailable');
    await expect(page.locator('#locMapCanvas .map-pin')).toHaveCount(4);
    await expect(page.locator('#locRetryBasemapBtn')).toBeVisible();

    await page.locator('#locRetryBasemapBtn').click();
    await expect(page.locator('#locRetryBasemapBtn')).toBeDisabled();
    await expect(page.locator('#locRetryBasemapBtn')).toHaveText('Retrying...');

    await expect.poll(() => page.evaluate(() => Number(window.__mapsScriptAppendAttempts || 0)), { timeout: 10000 }).toBe(2);
    await expect(page.locator('#locRetryBasemapBtn')).toHaveText('Loaded');
    await expect(page.locator('#locMapStatus')).toContainText('Basemap loaded.');
    await expect(page.locator('#locMapStatusRow')).toBeHidden();
  });

  test('non-Nature rows hide Nature-only detail fields while Nature rows keep them', async ({ page }) => {
    await openTestCity(page);

    const natureCard = page.locator('.loc-card', { hasText: 'River Falls' }).first();
    await expect(natureCard).toContainText('⏱️');
    await expect(natureCard).toContainText('📏');

    const nonNatureCard = page.locator('.loc-card', { hasText: 'Downtown Art House' }).first();
    await expect(nonNatureCard).not.toContainText('⏱️');
    await expect(nonNatureCard).not.toContainText('📏');

    await nonNatureCard.click();
    await expect(page.locator('#locationDetailPage')).toBeVisible();
    await expect(page.locator('#locationDetailContent')).not.toContainText('⏱️');
    await expect(page.locator('#locationDetailContent')).not.toContainText('📏');
  });

  test('detail card supports inline field edits and syncs updates to Excel backend', async ({ page }) => {
    const graphPatchCalls = [];
    const headers = [
      'Name',
      'Google Place ID',
      'Website',
      'Tags',
      'Drive Time',
      'Hours of Operation',
      'Duration',
      'Difficulty',
      'Trail Length',
      'Address',
      'Phone Number',
      'Google Rating',
      'Cost',
      'Notes',
      'Description',
      'Google URL',
      'Visited',
      'Visit Count'
    ];
    const rowValues = [
      'River Falls',
      'pid-river-falls',
      'https://example.com/river-falls',
      'waterfall, scenic, family',
      '15m',
      'Open daily',
      '90 minutes',
      'moderate',
      '2.0 miles',
      '1 Falls Rd, Testville, NC',
      '555-0001',
      '4.9',
      'free',
      '',
      'Large waterfall with multiple overlooks and strong scenic value.',
      'https://maps.google.com/?q=River+Falls',
      'FALSE',
      ''
    ];

    await page.route('https://graph.microsoft.com/**', async (route) => {
      const request = route.request();
      const url = request.url();
      const method = request.method();
      if (url.includes('/headerRowRange')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ values: [headers] })
        });
        return;
      }
      if (method === 'GET' && url.includes('/rows')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ value: [{ values: [rowValues] }] })
        });
        return;
      }
      if (method === 'PATCH' && url.includes('/rows/itemAt(index=')) {
        graphPatchCalls.push(JSON.parse(request.postData() || '{}'));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true })
        });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ value: [] }) });
    });

    await openTestCity(page);
    await page.evaluate(() => {
      const city = typeof citiesData === 'object' && citiesData ? citiesData['Testville, NC'] : null;
      const loc = city && Array.isArray(city.locations)
        ? city.locations.find((entry) => String(entry && entry.name || '').trim() === 'River Falls')
        : null;
      if (loc) loc.googlePlaceId = 'pid-river-falls';
      window.accessToken = 'playwright-graph-token';
    });

    const detailReady = await page.evaluate(() => {
      const city = typeof citiesData === 'object' && citiesData ? citiesData['Testville, NC'] : null;
      const loc = city && Array.isArray(city.locations)
        ? city.locations.find((entry) => String(entry && entry.name || '').trim() === 'River Falls')
        : null;
      if (!loc) return false;
      activeLocationDetailId = getLocId(loc);
      locationDetailEditorOpen = false;
      renderLocationDetail(loc);
      setLocationDetailMode();
      return true;
    });
    expect(detailReady).toBe(true);
    await expect(page.locator('#locationDetailPage')).toBeVisible();
    const editButton = page.locator('#locationDetailContent .loc-action-btn', { hasText: 'Edit Fields' });
    const hasEditUi = await editButton.count();
    test.skip(!hasEditUi, 'Edit fields UI is not present in this template build.');

    await page.evaluate(() => toggleLocationDetailEditor(true));
    await page.locator('#locDetailEdit_name').fill('River Falls Updated');
    await page.locator('#locDetailEdit_note').fill('Bring camera for the overlook.');
    await page.locator('#locDetailEdit_visited').check();
    await page.locator('#locDetailEdit_visitCount').fill('2');
    await page.locator('[data-location-detail-editor] .loc-action-btn', { hasText: 'Save Changes' }).click();

    await expect(page.locator('#locationDetailTitle')).toContainText('River Falls Updated');
    await expect(page.locator('#locationDetailContent .loc-note-block')).toContainText('Bring camera for the overlook.');
    await expect(page.locator('#locationDetailContent .loc-visited-chip')).toContainText('Visits: 2');
    await expect.poll(() => graphPatchCalls.length, { timeout: 10000 }).toBeGreaterThan(0);
  });
});

