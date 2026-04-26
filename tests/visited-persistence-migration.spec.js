const { test, expect } = require('./reliability-test');

const DEFAULT_SCHEMA_COLUMNS = [
  'Event Id',
  'Event Type',
  'Action',
  'Created At',
  'Subtab Key',
  'Location Id',
  'Location Title',
  'Place Key',
  'Source Workbook Path',
  'Source Table',
  'Source Row Index',
  'Source Context',
  'Payload Json'
];

async function installLegacyMigrationMock(page) {
  const state = {
    persistenceRowsAdded: []
  };

  await page.addInitScript(() => {
    Object.defineProperty(window, 'accessToken', {
      configurable: true,
      get() {
        return 'playwright-mock-token';
      },
      set(_value) {}
    });
    window.visitedSyncConfig = {
      persistenceWorkbookPath: 'Copilot_Apps/Kyles_Adventure_Finder/Adventure_Finder_Excel_DB.xlsx',
      persistenceTableName: 'VisitedFeaturePersistence',
      persistenceWorksheetName: 'VisitedPersistence'
    };

    localStorage.setItem('__adventure_detail_field_refresh_meta_v1', JSON.stringify({
      name_legacy_place: {
        address: { updatedAt: '2026-04-01T12:00:00.000Z', source: 'legacy-refresh' },
        hours: { updatedAt: '2026-04-02T12:00:00.000Z', source: 'legacy-refresh' }
      }
    }));

    localStorage.setItem('__adventure_detail_rating_history_v1', JSON.stringify({
      name_legacy_place: [
        { value: 4.2, at: '2026-04-03T12:00:00.000Z' },
        { value: 4.4, at: '2026-04-04T12:00:00.000Z' }
      ]
    }));

    localStorage.setItem('__adventure_detail_cost_inference_meta_v1', JSON.stringify({
      name_legacy_place: {
        tier: '$$',
        confidence: 0.73,
        source: 'legacy-local',
        reasoning: 'Stored before backend migration',
        topCandidates: [{ tier: '$$', score: 0.73 }],
        updatedAt: '2026-04-05T12:00:00.000Z'
      }
    }));
  });

  await page.route('https://graph.microsoft.com/**', async (route) => {
    const request = route.request();
    const url = request.url();
    const method = request.method().toUpperCase();

    if (url.includes('/workbook/tables/VisitedFeaturePersistence/columns') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          value: DEFAULT_SCHEMA_COLUMNS.map((name, index) => ({ name, index }))
        })
      });
      return;
    }

    if (url.endsWith('/workbook/tables') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ value: [{ name: 'VisitedFeaturePersistence' }] })
      });
      return;
    }

    if (url.includes('/workbook/tables/VisitedFeaturePersistence/rows?$top=')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ value: [] })
      });
      return;
    }

    if (url.includes('/workbook/tables/VisitedFeaturePersistence/rows/add') && method === 'POST') {
      state.persistenceRowsAdded.push(request.postDataJSON());
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({})
    });
  });

  return state;
}

async function gotoVisitedLocations(page) {
  await page.goto('/');
  await page.evaluate(() => {
    window.loadBikeTable = undefined;
  });
  await page.locator('.app-tab-btn[data-tab="visited-locations"]').click();
  await expect(page.locator('#visitedLocationsRoot')).toBeVisible();
}

test.describe('Visited persistence legacy metadata migration', () => {
  test('imports legacy detail freshness, rating history, and cost metadata into backend events once', async ({ page }) => {
    const graphState = await installLegacyMigrationMock(page);

    await gotoVisitedLocations(page);

    await expect.poll(() => graphState.persistenceRowsAdded.length, { timeout: 10000 }).toBe(5);

    const payloads = graphState.persistenceRowsAdded
      .map((entry) => entry && Array.isArray(entry.values) ? entry.values[0] : [])
      .map((row) => String(row[12] || ''));

    expect(payloads.some((value) => value.includes('field-refresh'))).toBeTruthy();
    expect(payloads.some((value) => value.includes('rating-history'))).toBeTruthy();
    expect(payloads.some((value) => value.includes('cost-inference'))).toBeTruthy();

    const marker = await page.evaluate(() => JSON.parse(localStorage.getItem('visitedLegacyDetailMetadataMigrationV1') || '{}'));
    expect(marker.completed).toBeTruthy();
    expect(marker.count).toBe(5);

    await page.reload();
    await page.evaluate(() => {
      window.loadBikeTable = undefined;
    });
    await page.locator('.app-tab-btn[data-tab="visited-locations"]').click();
    await expect(page.locator('#visitedLocationsRoot')).toBeVisible();

    await page.waitForTimeout(400);
    expect(graphState.persistenceRowsAdded).toHaveLength(5);
  });
});

