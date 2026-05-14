const { test, expect } = require('./reliability-test');

const CITY_VIEWER_KEY = 'city_daily_pagination_fixture';
const BASE_PATH = '/HTML%20Files/city-viewer-window.html';

function buildRows(count) {
  return Array.from({ length: count }, (_, idx) => {
    const n = idx + 1;
    return {
      city: 'Fixturetown',
      state: 'NC',
      name: `Fixture Plant Stop ${n}`,
      sourceLabel: 'Nature_Locations.xlsx / Nature_Locations',
      website: `https://example.com/fixture-${n}`,
      tags: n % 2 === 0 ? 'garden, nature' : 'trail, nature',
      driveTime: `${10 + n}m`,
      hours: 'Open daily',
      duration: '45 minutes',
      difficulty: n % 3 === 0 ? 'moderate' : 'easy',
      trailLength: `${(n % 5) + 0.5} miles`,
      address: `${n} Fixture Rd, Fixturetown, NC`,
      phone: `555-10${String(n).padStart(2, '0')}`,
      rating: '4.7',
      cost: n % 4 === 0 ? '$$' : 'free',
      description: `Synthetic location row ${n}`,
      googleUrl: `https://maps.google.com/?q=Fixture+Plant+Stop+${n}`,
      latitude: 35.3 + (n * 0.001),
      longitude: -82.4 - (n * 0.001)
    };
  });
}

async function seedCityViewer(page, rowCount = 41) {
  const payload = {
    adventuresData: buildRows(rowCount),
    configuredSources: ['Nature_Locations.xlsx / Nature_Locations'],
    dataMode: 'curated-only'
  };

  await page.addInitScript(({ key, data }) => {
    try {
      window.localStorage.clear();
      window.sessionStorage.setItem(key, JSON.stringify(data));
      window.sessionStorage.setItem('city_viewer_data_latest', key);
    } catch (_error) {
      // Ignore storage failures in CI bootstrap.
    }
  }, { key: CITY_VIEWER_KEY, data: payload });
}

async function openCityViewer(page, mode) {
  const url = `${BASE_PATH}?dataKey=${CITY_VIEWER_KEY}&dataMode=curated-only&appMode=${mode}`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.city-card')).toHaveCount(1);
  await page.locator('.city-card').first().click();
  await expect(page.locator('#locationsPage')).toBeVisible();
  await expect(page.locator('#locResultsCount')).toContainText('41 locations');
  // Force mode in-fixture so pagination regression is isolated from shell URL routing nuances.
  await page.evaluate((nextMode) => {
    cityViewerAppMode = nextMode;
    locCurrentPage = 1;
    applyLocFilters();
  }, mode);
}

test.describe('City Viewer daily pagination regression', () => {
  test.beforeEach(async ({ page }) => {
    await seedCityViewer(page, 41);
  });

  test('daily mode paginates results and resets page after filtering', async ({ page }) => {
    await openCityViewer(page, 'daily');

    const cards = page.locator('.loc-card');
    const pagination = page.locator('#locPagination');

    await expect(cards).toHaveCount(16);
    await expect(pagination).toBeVisible();
    await expect(pagination).toContainText(/Page\s*1\s*of\s*3/i);

    await pagination.getByRole('button', { name: /Next/i }).click();
    await expect(pagination).toContainText(/Page\s*2\s*of\s*3/i);
    await expect(cards).toHaveCount(16);

    await pagination.getByRole('button', { name: /Next/i }).click();
    await expect(pagination).toContainText(/Page\s*3\s*of\s*3/i);
    await expect(cards).toHaveCount(9);

    await page.locator('#locSearchName').fill('Fixture Plant Stop 39');
    await expect(page.locator('#locResultsCount')).toContainText('1 location');
    await expect(cards).toHaveCount(1);
    await expect(pagination).toBeHidden();
  });

  test('advanced mode disables pagination and shows full result set', async ({ page }) => {
    await openCityViewer(page, 'advanced');
    await expect(page.locator('.loc-card')).toHaveCount(41);
    await expect(page.locator('#locPagination')).toBeHidden();
  });
});


