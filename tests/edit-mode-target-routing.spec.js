const { test, expect, isIgnoredExtensionNoise } = require('./reliability-test');

const SCHEMAS = {
  Coffee: ['Address', 'City', 'State', 'Name', 'Phone Number', 'Website', 'Google Place ID', 'Tags', 'Google Rating', 'Directions', 'Hours of Operation'],
  Festivals: ['Description', 'Name', 'Address', 'City', 'State', 'Official Website', 'Phone Number', 'Rating', 'Directions', 'Google Place ID', 'Google URL'],
  Nature_Locations: ['Name', 'Google Place ID', 'Website', 'Tags', 'Drive Time', 'Hours of Operation', 'State', 'City', 'Address', 'Phone Number', 'Google Rating', 'Directions']
};

function slugify(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item';
}

function rowsFor(table) {
  const cols = SCHEMAS[table] || SCHEMAS.Nature_Locations;
  return [{ values: [new Array(cols.length).fill('')] }];
}

function buildResolvedPlace(label) {
  const safeLabel = String(label || '').trim();
  const slug = slugify(safeLabel);
  return {
    placeId: `pid-${slug}`,
    name: `Name ${safeLabel}`,
    address: `${safeLabel} Address, Denver, CO`,
    website: `https://${slug}.example.com`,
    businessType: `tag-${slug}`,
    hours: `9-5 ${safeLabel}`,
    phone: `555-${String(slug.length).padStart(4, '0')}`,
    rating: '4.7',
    userRatingsTotal: 123,
    directions: `https://maps.example.com/${slug}`
  };
}

async function installWorkbookMocks(context, graphCalls) {
  await context.route('https://graph.microsoft.com/**', async (route) => {
    const request = route.request();
    const url = request.url();
    const method = request.method();
    const tableMatch = url.match(/\/tables\/([^/]+)/);
    const table = tableMatch ? decodeURIComponent(tableMatch[1]) : 'Nature_Locations';

    if (url.includes('/columns')) {
      const cols = SCHEMAS[table] || SCHEMAS.Nature_Locations;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ value: cols.map((name, index) => ({ name, index })) })
      });
      return;
    }

    if (method === 'GET' && url.includes('/rows')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ value: rowsFor(table) })
      });
      return;
    }

    if (method === 'POST' && url.includes('/rows')) {
      graphCalls.push({
        url,
        table,
        body: JSON.parse(request.postData() || '{}')
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, table })
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ value: [] })
    });
  });
}

async function seedMainWindow(page) {
  await page.evaluate(() => {
    window.accessToken = 'playwright-mock-token';
    window.activeAccount = { username: 'test@example.com' };
    window.showToast = () => {};
    window.renderAdventureCards = async () => {};
    window.FilterManager = { applyAllFilters() {}, renderQuickFilterCounts() {} };
    window.normalizeOperationHours = (value) => String(value || '');
  });
}

async function seedEditModeWindow(popup) {
  await popup.evaluate(() => {
    window.showToast = () => {};
    window.resolvePlaceInputWithGoogleData = async (_inputType, inputValue) => {
      const label = String(inputValue || '').trim();
      const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item';
      return {
        placeId: `pid-${slug}`,
        name: `Name ${label}`,
        address: `${label} Address, Denver, CO`,
        website: `https://${slug}.example.com`,
        businessType: `tag-${slug}`,
        hours: `9-5 ${label}`,
        phone: `555-${String(slug.length).padStart(4, '0')}`,
        rating: '4.7',
        userRatingsTotal: 123,
        directions: `https://maps.example.com/${slug}`
      };
    };
  });
}

async function collectPopupErrors(popup) {
  const popupErrors = [];
  popup.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const location = msg.location ? msg.location() : { url: '' };
    const text = msg.text();
    if (isIgnoredExtensionNoise(text, location && location.url)) return;
    popupErrors.push(`[console] ${text}${location && location.url ? ` (${location.url})` : ''}`);
  });
  popup.on('pageerror', (error) => {
    const message = error && error.message ? String(error.message) : String(error || 'Unknown popup page error');
    const stack = error && error.stack ? String(error.stack) : '';
    if (isIgnoredExtensionNoise(`${message}\n${stack}`, '')) return;
    popupErrors.push(`[pageerror] ${message}`);
  });
  return popupErrors;
}

test.describe('Edit Mode target-table routing', () => {
  test('Add Single, Bulk Add, and Bulk Chain write using the currently selected target schema', async ({ page }) => {
    const graphCalls = [];
    const context = page.context();
    await installWorkbookMocks(context, graphCalls);

    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => (
      typeof window.buildExcelRow === 'function'
      && typeof window.addRowToExcel === 'function'
      && typeof window.getColumnIndexByName === 'function'
    ), null, { timeout: 15000 });
    await seedMainWindow(page);

    const popupPromise = page.waitForEvent('popup');
    await page.evaluate(() => window.open('/HTML%20Files/edit-mode-enhanced.html', '_blank'));
    const popup = await popupPromise;
    const popupErrors = await collectPopupErrors(popup);
    await popup.waitForLoadState('domcontentloaded');
    await popup.waitForFunction(() => {
      const select = document.getElementById('actionTargetSelect');
      return select && select.options.length >= 7;
    }, null, { timeout: 10000 });
    await popup.waitForFunction(() => (
      typeof window.submitAddSinglePlace === 'function'
      && typeof window.submitBulkAddPlaces === 'function'
      && typeof window.submitBulkChain === 'function'
    ), null, { timeout: 10000 });
    await seedEditModeWindow(popup);

    const runSingle = async (targetValue, input) => {
      const before = graphCalls.length;
      await popup.selectOption('#actionTargetSelect', targetValue);
      await popup.fill('#singleInput', input);
      await popup.evaluate(() => submitAddSinglePlace());
      await expect.poll(() => graphCalls.length, { timeout: 10000 }).toBe(before + 1);
      return graphCalls.slice(before);
    };

    const runBulk = async (targetValue, inputs) => {
      const before = graphCalls.length;
      await popup.selectOption('#actionTargetSelect', targetValue);
      await popup.fill('#bulkInput', inputs.join('\n'));
      await popup.evaluate(() => submitBulkAddPlaces());
      await expect.poll(() => graphCalls.length, { timeout: 10000 }).toBe(before + inputs.length);
      return graphCalls.slice(before);
    };

    const runChain = async (targetValue, inputs) => {
      const before = graphCalls.length;
      await popup.selectOption('#actionTargetSelect', targetValue);
      await popup.fill('#chainInput', inputs.join('\n'));
      await popup.selectOption('#chainInputType', 'placeNameCity');
      await popup.evaluate(() => submitBulkChain());
      await expect.poll(() => graphCalls.length, { timeout: 12000 }).toBe(before + inputs.length);
      return graphCalls.slice(before);
    };

    const singleCalls = await runSingle('retail_coffee', 'Cafe Alpha');
    expect(singleCalls).toHaveLength(1);
    const singleCall = singleCalls[0];
    const singleRow = singleCall.body.values[0];
    expect(singleCall.table).toBe('Coffee');
    expect(singleRow).toHaveLength(SCHEMAS.Coffee.length);
    expect(singleRow[0]).toBe('Cafe Alpha Address, Denver, CO');
    expect(singleRow[3]).toBe('Name Cafe Alpha');
    expect(singleRow[5]).toBe('https://cafe-alpha.example.com');
    expect(singleRow[6]).toBe('pid-cafe-alpha');
    expect(singleRow[10]).toBe('9-5 Cafe Alpha');
    await expect.poll(() => page.evaluate(() => ({
      filePath: window.filePath,
      tableName: window.tableName,
      schemaColumns: window.__excelSchemaColumns,
      columnCount: window.__excelColumnCount
    }))).toEqual({
      filePath: 'Retail_Food_and_Drink.xlsx',
      tableName: 'Coffee',
      schemaColumns: SCHEMAS.Coffee,
      columnCount: SCHEMAS.Coffee.length
    });

    const bulkCalls = await runBulk('ent_festivals', ['Fest One', 'Fest Two']);
    expect(bulkCalls).toHaveLength(2);
    for (const [index, call] of bulkCalls.entries()) {
      const label = index === 0 ? 'Fest One' : 'Fest Two';
      const resolved = buildResolvedPlace(label);
      const row = call.body.values[0];
      expect(call.table).toBe('Festivals');
      expect(row).toHaveLength(SCHEMAS.Festivals.length);
      expect(row[0]).toContain(resolved.businessType);
      expect(row[1]).toBe(resolved.name);
      expect(row[5]).toBe(resolved.website);
      expect(row[7]).toBe(String(resolved.rating));
      expect(row[9]).toBe(resolved.placeId);
      expect(String(row[10] || '')).toContain(resolved.placeId);
    }
    await expect.poll(() => page.evaluate(() => ({
      filePath: window.filePath,
      tableName: window.tableName,
      schemaColumns: window.__excelSchemaColumns,
      columnCount: window.__excelColumnCount
    }))).toEqual({
      filePath: 'Entertainment_Locations.xlsx',
      tableName: 'Festivals',
      schemaColumns: SCHEMAS.Festivals,
      columnCount: SCHEMAS.Festivals.length
    });

    const chainCalls = await runChain('nature_locations', ['Trail Head', 'River Bend']);
    expect(chainCalls).toHaveLength(2);
    for (const [index, call] of chainCalls.entries()) {
      const label = index === 0 ? 'Trail Head' : 'River Bend';
      const resolved = buildResolvedPlace(label);
      const row = call.body.values[0];
      expect(call.table).toBe('Nature_Locations');
      expect(row).toHaveLength(SCHEMAS.Nature_Locations.length);
      expect(row[0]).toBe(resolved.name);
      expect(row[1]).toBe(resolved.placeId);
      expect(row[2]).toBe(resolved.website);
      expect(row[5]).toBe(resolved.hours);
      expect(row[8]).toBe(resolved.address);
      expect(String(row[11] || '')).toContain(`destination_place_id=${resolved.placeId}`);
    }
    await expect.poll(() => page.evaluate(() => ({
      filePath: window.filePath,
      tableName: window.tableName,
      schemaColumns: window.__excelSchemaColumns,
      columnCount: window.__excelColumnCount
    }))).toEqual({
      filePath: 'Nature_Locations.xlsx',
      tableName: 'Nature_Locations',
      schemaColumns: SCHEMAS.Nature_Locations,
      columnCount: SCHEMAS.Nature_Locations.length
    });

    expect(popupErrors).toEqual([]);
  });

});
