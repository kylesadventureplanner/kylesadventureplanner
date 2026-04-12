const { test, expect } = require('./reliability-test');

const CITY_VIEWER_TEST_KEY = 'city_test_payload';
const CITY_VIEWER_PATH = `/HTML%20Files/city-viewer-window.html?dataKey=${CITY_VIEWER_TEST_KEY}&dataMode=curated-only`;

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

async function seedCityViewer(page) {
  await page.addInitScript(({ key, payload }) => {
    try {
      window.localStorage.clear();
      window.sessionStorage.setItem(key, JSON.stringify(payload));
      window.sessionStorage.setItem('city_viewer_data_latest', key);
    } catch (_error) {
      // Ignore storage write errors in test bootstrap.
    }
  }, {
    key: CITY_VIEWER_TEST_KEY,
    payload: {
      adventuresData: TEST_LOCATIONS,
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

test.describe('City Explorer Phase 1 and 2 enhancements', () => {
  test.beforeEach(async ({ page }) => {
    await seedCityViewer(page);
  });

  test('active filter chips appear and individual chip removal updates filters', async ({ page }) => {
    await openTestCity(page);

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

  test('empty state reset action restores results after a no-match filter', async ({ page }) => {
    await openTestCity(page);

    await page.locator('#locSearchName').fill('zzzz-no-match');

    const emptyState = page.locator('.loc-empty');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('No locations match your current filters');

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

    await page.locator('.loc-select-btn').nth(0).evaluate((node) => node.click());
    await page.locator('.loc-select-btn').nth(1).evaluate((node) => node.click());

    await page.getByRole('button', { name: 'Build Day Plan' }).click();

    await expect(page.locator('#locDayPlan')).toBeVisible();
    await expect(page.locator('#locDayPlanSummary [data-itinerary-score]')).toContainText(/Itinerary score \d+\/100/);
    await expect(page.locator('#locDayPlanSummary [data-route-confidence]')).toContainText('Route confidence: Comfortable');
    await expect(page.locator('#locRouteQuality [data-route-feasibility-status]')).toContainText('Comfortable');

    await page.locator('#locTimeStart').fill('09:00');
    await page.locator('#locTimeEnd').fill('11:00');
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
});

