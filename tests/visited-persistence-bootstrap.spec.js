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

function getColumnIndex(state, name) {
  return state.persistenceColumns.findIndex((entry) => String(entry || '').trim().toLowerCase() === String(name || '').trim().toLowerCase());
}

async function installVisitedPersistenceMock(page, options = {}) {
  const state = {
    worksheetCreated: 0,
    headerWrites: 0,
    tableCreates: 0,
    tableRenames: 0,
    columnAdds: [],
    persistenceRowsAdded: [],
    persistenceColumns: Array.isArray(options.initialColumns) ? options.initialColumns.slice() : [],
    tableReady: !!options.tableInitiallyExists,
    worksheetReady: !!options.worksheetInitiallyExists
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
  });

  await page.route('https://graph.microsoft.com/**', async (route) => {
    const request = route.request();
    const url = request.url();
    const method = request.method().toUpperCase();

    if (options.workbookMissing && (url.endsWith('/workbook/tables') || url.includes('/workbook/worksheets?$select=id,name,position'))) {
      await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ error: 'missing-workbook' }) });
      return;
    }

    if (options.workbookMissing && url.includes(':/children') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ value: [{ name: 'OtherWorkbook.xlsx' }] })
      });
      return;
    }

    if (url.includes('/workbook/tables/VisitedFeaturePersistence/columns') && method === 'GET') {
      if (!state.tableReady) {
        await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ error: 'not-found' }) });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          value: state.persistenceColumns.map((name, index) => ({ name, index }))
        })
      });
      return;
    }

    if (url.includes('/workbook/tables/VisitedFeaturePersistence/rows/add') && method === 'POST') {
      state.persistenceRowsAdded.push(request.postDataJSON());
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
      return;
    }

    if (url.includes('/workbook/tables/VisitedFeaturePersistence/rows?$top=')) {
      if (!state.tableReady) {
        await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ error: 'not-found' }) });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ value: [] }) });
      return;
    }

    if (url.endsWith('/workbook/tables') && method === 'GET') {
      const tables = state.tableReady ? [{ name: 'VisitedFeaturePersistence' }] : [];
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ value: tables }) });
      return;
    }

    if (url.includes('/workbook/worksheets?$select=id,name,position') && method === 'GET') {
      const worksheets = state.worksheetReady ? [{ id: 'sheet-visited', name: 'VisitedPersistence', position: 0 }] : [];
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ value: worksheets }) });
      return;
    }

    if (url.endsWith('/workbook/worksheets/add') && method === 'POST') {
      state.worksheetReady = true;
      state.worksheetCreated += 1;
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'sheet-visited', name: 'VisitedPersistence' }) });
      return;
    }

    if (url.includes('/workbook/worksheets/') && url.includes("/range(address='") && method === 'PATCH') {
      const body = request.postDataJSON();
      state.headerWrites += 1;
      const values = body && Array.isArray(body.values) && Array.isArray(body.values[0]) ? body.values[0] : [];
      if (values.length) {
        state.persistenceColumns = values.map((value) => String(value || '').trim()).filter(Boolean);
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
      return;
    }

    if (url.includes('/workbook/worksheets/') && url.endsWith('/tables/add') && method === 'POST') {
      state.tableReady = true;
      state.tableCreates += 1;
      if (!state.persistenceColumns.length) {
        state.persistenceColumns = DEFAULT_SCHEMA_COLUMNS.slice();
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ name: 'VisitedFeaturePersistence' }) });
      return;
    }

    if (url.includes('/workbook/tables/VisitedFeaturePersistence/columns/add') && method === 'POST') {
      const body = request.postDataJSON();
      const values = body && Array.isArray(body.values) && Array.isArray(body.values[0]) ? body.values[0] : [];
      const columnName = String(values[0] || '').trim();
      if (columnName) {
        state.columnAdds.push(columnName);
        state.persistenceColumns.push(columnName);
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
      return;
    }

    if (url.includes('/workbook/tables/VisitedFeaturePersistence/columns') && method === 'POST') {
      const body = request.postDataJSON();
      const values = body && Array.isArray(body.values) && Array.isArray(body.values[0]) ? body.values[0] : [];
      const columnName = String(values[0] || '').trim();
      if (columnName) {
        state.columnAdds.push(columnName);
        state.persistenceColumns.push(columnName);
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
      return;
    }

    if (url.includes('/workbook/tables/VisitedFeaturePersistence') && method === 'PATCH') {
      state.tableRenames += 1;
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ name: 'VisitedFeaturePersistence' }) });
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

test.describe('Visited persistence bootstrap', () => {
  test('creates worksheet and table automatically before first metadata write', async ({ page }) => {
    const graphState = await installVisitedPersistenceMock(page, {
      tableInitiallyExists: false,
      worksheetInitiallyExists: false
    });

    await gotoVisitedLocations(page);

    await expect.poll(() => graphState.worksheetCreated, { timeout: 10000 }).toBe(1);
    await expect.poll(() => graphState.tableCreates, { timeout: 10000 }).toBe(1);
    await expect.poll(() => graphState.persistenceColumns.length, { timeout: 10000 }).toBe(DEFAULT_SCHEMA_COLUMNS.length);

    await page.evaluate(async () => {
      await window.persistAdventureDetailMetadata({
        kind: 'field-refresh',
        placeKey: 'name_mock_place',
        locationName: 'Mock Place',
        fieldKey: 'address',
        source: 'playwright',
        updatedAt: new Date().toISOString(),
        value: '123 Trailhead Way',
        meta: { fieldKey: 'address' }
      });
    });

    await expect.poll(() => graphState.persistenceRowsAdded.length, { timeout: 10000 }).toBe(1);
    const insertedRow = graphState.persistenceRowsAdded[0].values[0];
    expect(insertedRow[getColumnIndex(graphState, 'Event Type')]).toBe('detail-meta');
    expect(insertedRow[getColumnIndex(graphState, 'Payload Json')]).toContain('field-refresh');
  });

  test('adds missing schema columns automatically when table already exists', async ({ page }) => {
    const graphState = await installVisitedPersistenceMock(page, {
      tableInitiallyExists: true,
      worksheetInitiallyExists: true,
      initialColumns: ['Event Type', 'Created At', 'Payload Json']
    });

    await gotoVisitedLocations(page);

    await expect.poll(() => graphState.columnAdds.length, { timeout: 10000 }).toBeGreaterThan(0);
    await expect.poll(() => graphState.persistenceColumns.length, { timeout: 10000 }).toBe(DEFAULT_SCHEMA_COLUMNS.length);
    expect(graphState.columnAdds).toContain('Event Id');
    expect(graphState.columnAdds).toContain('Source Context');

    await page.evaluate(async () => {
      await window.persistAdventureDetailMetadata({
        kind: 'cost-inference',
        placeKey: 'name_mock_place_2',
        locationName: 'Mock Place 2',
        updatedAt: new Date().toISOString(),
        value: { tier: '$$', confidence: 0.75 }
      });
    });

    await expect.poll(() => graphState.persistenceRowsAdded.length, { timeout: 10000 }).toBe(1);
    const insertedRow = graphState.persistenceRowsAdded[0].values[0];
    expect(insertedRow[getColumnIndex(graphState, 'Event Type')]).toBe('detail-meta');
    expect(insertedRow[getColumnIndex(graphState, 'Payload Json')]).toContain('cost-inference');
  });

  test('surfaces a friendly warning when the persistence workbook path is invalid', async ({ page }) => {
    await installVisitedPersistenceMock(page, { workbookMissing: true });

    await gotoVisitedLocations(page);

    await expect(page.locator('#visitedPersistenceBootstrapStatus')).toContainText('Persistence workbook not found', { timeout: 10000 });
    await expect(page.locator('#visitedPersistenceBootstrapStatus')).toContainText('OtherWorkbook.xlsx');
  });
});

