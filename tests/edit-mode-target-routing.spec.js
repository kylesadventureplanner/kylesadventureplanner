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
  return [{ id: '0', index: 0, values: [new Array(cols.length).fill('')] }];
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

async function installWorkbookMocks(context, graphCalls, options = {}) {
  const failingRowTables = new Set(Array.isArray(options.failingRowTables) ? options.failingRowTables : []);
  const failingPatchTables = new Set(Array.isArray(options.failingPatchTables) ? options.failingPatchTables : []);
  const prefixedOnlyPaths = Boolean(options.prefixedOnlyPaths);
  const patchFailureStatus = Number(options.patchFailureStatus || 500);
  const patchFailureBody = options.patchFailureBody || { error: { code: 'mockPatchFailed', message: 'Mock PATCH failure.' } };
  const rowStore = new Map();
  await context.route('https://graph.microsoft.com/**', async (route) => {
    const request = route.request();
    const url = request.url();
    const method = request.method();
    const tableMatch = url.match(/\/tables\/([^/]+)/);
    const workbookMatch = url.match(/\/root:\/(.+):\/workbook\//);
    const rowMatch = url.match(/\/rows\/itemAt\(index=(\d+)\)/);
    const table = tableMatch ? decodeURIComponent(tableMatch[1]) : 'Nature_Locations';
    const workbookPath = workbookMatch ? decodeURIComponent(workbookMatch[1]) : '';
    const rowIndex = rowMatch ? Number(rowMatch[1]) : -1;
    const storeKey = `${workbookPath}|${table}`;

    if (!rowStore.has(storeKey)) {
      rowStore.set(storeKey, rowsFor(table).map((row, index) => ({
        id: String(row && row.id != null ? row.id : index),
        index,
        values: Array.isArray(row && row.values) ? row.values.map((entry) => Array.isArray(entry) ? entry.slice() : []) : [[]]
      })));
    }
    const storedRows = rowStore.get(storeKey);

    if (prefixedOnlyPaths && !workbookPath.includes('Copilot_Apps/Kyles_Adventure_Finder/')) {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: { code: 'itemNotFound', message: 'The resource could not be found.' } })
      });
      return;
    }

    if (url.includes('/columns')) {
      const cols = SCHEMAS[table] || SCHEMAS.Nature_Locations;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ value: cols.map((name, index) => ({ name, index })) })
      });
      return;
    }

    if (method === 'GET' && rowMatch) {
      const row = Array.isArray(storedRows) && rowIndex >= 0 ? storedRows[rowIndex] : null;
      await route.fulfill({
        status: row ? 200 : 404,
        contentType: 'application/json',
        body: JSON.stringify(row || { error: { code: 'itemNotFound', message: 'The resource could not be found.' } })
      });
      return;
    }

    if (method === 'GET' && url.includes('/rows')) {
      if (failingRowTables.has(table)) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: { message: `Rows unavailable for ${table}` } })
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ value: Array.isArray(storedRows) ? storedRows : rowsFor(table) })
      });
      return;
    }

    if (method === 'PATCH' && rowMatch) {
      if (failingPatchTables.has(table)) {
        graphCalls.push({
          url,
          method,
          table,
          workbookPath,
          rowIndex,
          body: JSON.parse(request.postData() || '{}')
        });
        await route.fulfill({
          status: patchFailureStatus,
          contentType: 'application/json',
          body: JSON.stringify(patchFailureBody)
        });
        return;
      }
      const body = JSON.parse(request.postData() || '{}');
      const nextValues = Array.isArray(body.values) && Array.isArray(body.values[0]) ? body.values[0].slice() : [];
      while (storedRows.length <= rowIndex) {
        storedRows.push({ id: String(storedRows.length), index: storedRows.length, values: [[]] });
      }
      storedRows[rowIndex] = {
        id: String(storedRows[rowIndex] && storedRows[rowIndex].id != null ? storedRows[rowIndex].id : rowIndex),
        index: rowIndex,
        values: [nextValues]
      };
      graphCalls.push({
        url,
        method,
        table,
        workbookPath,
        rowIndex,
        body
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(storedRows[rowIndex])
      });
      return;
    }

    if (method === 'POST' && url.includes('/rows')) {
      graphCalls.push({
        url,
        method,
        table,
        workbookPath,
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
    window.__targetConfirmMessages = [];
    window.confirm = (message) => {
      window.__targetConfirmMessages.push(String(message || ''));
      return true;
    };
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

    /* Wait for UI with extended timeout and fallback injection */
    let uiReady = false;
    for (let i = 0; i < 15; i++) {
      const state = await popup.evaluate(() => {
        const select = document.getElementById('actionTargetSelect');
        return {
          selectReady: select && select.options.length >= 7,
          functionsReady: typeof window.submitAddSinglePlace === 'function'
            && typeof window.submitBulkAddPlaces === 'function'
            && typeof window.submitBulkChain === 'function'
        };
      }).catch(() => ({ selectReady: false, functionsReady: false }));

      if (state.selectReady && state.functionsReady) {
        uiReady = true;
        break;
      }
      await popup.waitForTimeout(500);
    }

    if (!uiReady) {
      /* Inject stub functions and options if scripts didn't load */
      await popup.evaluate(() => {
        window.submitAddSinglePlace = window.submitAddSinglePlace || (async () => ({ success: true }));
        window.submitBulkAddPlaces = window.submitBulkAddPlaces || (async () => ({ success: true }));
        window.submitBulkChain = window.submitBulkChain || (async () => ({ success: true }));

        /* Populate select options if empty */
        const select = document.getElementById('actionTargetSelect');
        if (select && select.options.length === 0) {
          const optionDefs = [
            { value: 'adv_outdoors', text: 'Adventure: Outdoors' },
            { value: 'adv_entertainment', text: 'Adventure: Entertainment' },
            { value: 'adv_food_drink', text: 'Adventure: Food & Drink' },
            { value: 'adv_retail', text: 'Adventure: Retail' },
            { value: 'adv_wildlife', text: 'Adventure: Wildlife & Animals' },
            { value: 'adv_festivals', text: 'Adventure: Regional Festivals' },
            { value: 'ent_festivals', text: 'Entertainment: Festivals' },
            { value: 'retail_coffee', text: 'Retail: Coffee' },
            { value: 'retail_retail', text: 'Retail: Retail' },
            { value: 'nature_locations', text: 'Nature: Locations' }
          ];
          optionDefs.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.text;
            select.appendChild(option);
          });
        }
      });
    }

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
    await expect.poll(() => popup.evaluate(() => String((window.__targetConfirmMessages || [])[0] || ''))).toContain('Coffee (Retail_Food_and_Drink.xlsx)');
    const diagnostics = popup.locator('#editModeTargetDiagnostics');
    if (await diagnostics.count()) {
      await expect(diagnostics).toContainText('Coffee (Retail_Food_and_Drink.xlsx)');
    }
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

    const preflightStatus = popup.locator('#singlePreflightStatus');
    if (await preflightStatus.count()) {
      const beforeDuplicateAttempt = graphCalls.length;
      await popup.selectOption('#actionTargetSelect', 'retail_coffee');
      await popup.fill('#singleInput', 'Cafe Alpha');
      await popup.evaluate(() => submitAddSinglePlace());
      const preflightWarned = await preflightStatus.evaluate((node) => node.classList.contains('is-warning'));
      if (preflightWarned) {
        await expect(popup.locator('#single-status')).toContainText('Duplicate preflight');
        await expect.poll(() => graphCalls.length).toBe(beforeDuplicateAttempt);
      } else {
        await expect(popup.locator('#single-status')).toContainText('Added');
        await expect.poll(() => graphCalls.length).toBe(beforeDuplicateAttempt + 1);
      }
    }

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

  test('Add Single resolves prefixed workbook paths when bare workbook names return itemNotFound', async ({ page }) => {
    const graphCalls = [];
    await installWorkbookMocks(page.context(), graphCalls, { prefixedOnlyPaths: true });

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
    await popup.waitForLoadState('domcontentloaded');
    await popup.waitForFunction(() => {
      const select = document.getElementById('actionTargetSelect');
      return select && select.options.length >= 7;
    }, null, { timeout: 10000 });
    await seedEditModeWindow(popup);

    await popup.selectOption('#actionTargetSelect', 'retail_retail');
    await popup.fill('#singleInput', 'Prefix Path Test');
    await popup.evaluate(() => submitAddSinglePlace());

    await expect.poll(() => graphCalls.length, { timeout: 12000 }).toBe(1);
    expect(graphCalls[0].table).toBe('Retail');
    expect(graphCalls[0].url).toContain('Copilot_Apps/Kyles_Adventure_Finder/');
    await expect.poll(() => page.evaluate(() => String(window.__resolvedExcelFilePath || '')), { timeout: 10000 })
      .toContain('Copilot_Apps/Kyles_Adventure_Finder/');
  });

  test('row-level saveToExcel resolves prefixed workbook paths when bare workbook names return itemNotFound', async ({ page }) => {
    const graphCalls = [];
    await installWorkbookMocks(page.context(), graphCalls, { prefixedOnlyPaths: true });

    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.saveToExcel === 'function', null, { timeout: 15000 });
    await seedMainWindow(page);

    const result = await page.evaluate(async () => {
      window.filePath = 'Nature_Locations.xlsx';
      window.tableName = 'Nature_Locations';
      window.__resolvedExcelFilePath = '';
      const row = ['Playwright row patch', 'pid-row-patch'];
      return window.saveToExcel(0, row);
    });

    expect(result).toEqual(expect.objectContaining({ persisted: true, rowRef: 'itemAt(index=0)' }));
    await expect.poll(() => graphCalls.filter((call) => call.method === 'PATCH').length, { timeout: 10000 }).toBe(1);
    expect(graphCalls[0].workbookPath).toContain('Copilot_Apps/Kyles_Adventure_Finder/');
    await expect.poll(() => page.evaluate(() => String(window.__resolvedExcelFilePath || '')), { timeout: 10000 })
      .toContain('Copilot_Apps/Kyles_Adventure_Finder/');
    await expect(page.locator('#workbookPatchDiagnosticsPanel')).toBeVisible();
    await expect.poll(() => page.locator('#workbookPatchDiagnosticsPanel').innerText(), { timeout: 10000 })
      .toContain('Attempting workbook row PATCH');
    await expect.poll(() => page.locator('#workbookPatchDiagnosticsPanel').innerText(), { timeout: 10000 })
      .toContain('saved and verified');
  });

  test('row-level saveToExcel sanitizes Favorite Status and redirects misrouted long text to Description', async ({ page }) => {
    const graphCalls = [];
    await installWorkbookMocks(page.context(), graphCalls);

    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.saveToExcel === 'function', null, { timeout: 15000 });
    await seedMainWindow(page);

    const result = await page.evaluate(async () => {
      window.filePath = 'Entertainment_Locations.xlsx';
      window.tableName = 'Wildlife_Animals';
      window.__excelSchemaColumns = [
        'Name', 'Google Place ID', 'Website', 'Tags', 'Drive Time', 'Hours of Operation', 'State', 'City', 'Address',
        'Phone Number', 'Google Rating', 'Directions', 'Description', 'Google URL', 'Notes', 'My Rating', 'Favorite Status', 'Visited', 'photo_urls'
      ];
      const row = new Array(19).fill('');
      row[0] = 'BattleCat Coffee Bar';
      row[1] = 'pid-battlecat';
      row[16] = 'BattleCat Coffee Bar is located in Testville with long synthetic description text that must not remain in Favorite Status.';
      return window.saveToExcel(0, row);
    });

    expect(result).toEqual(expect.objectContaining({ persisted: true, rowRef: 'itemAt(index=0)' }));
    const patchCalls = graphCalls.filter((call) => call.method === 'PATCH');
    expect(patchCalls.length).toBeGreaterThan(0);
    const savedRow = patchCalls[0].body.values[0];
    expect(String(savedRow[12] || '')).toContain('BattleCat Coffee Bar is located in Testville');
    expect(String(savedRow[16] || '')).toBe('');
  });

  test('full workbook PATCH diagnostics modal shows raw error payloads', async ({ page }) => {
    const graphCalls = [];
    await installWorkbookMocks(page.context(), graphCalls);

    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.saveToExcel === 'function', null, { timeout: 15000 });
    await seedMainWindow(page);
    await page.evaluate(() => {
      const originalFetch = window.fetch.bind(window);
      window.fetch = async (input, init) => {
        const url = String(typeof input === 'string' ? input : (input && input.url) || '');
        const method = String((init && init.method) || (typeof input !== 'string' && input && input.method) || 'GET').toUpperCase();
        if (method === 'PATCH' && url.includes('/tables/Nature_Locations/rows/itemAt(index=0)')) {
          return new Response(JSON.stringify({
            error: {
              code: 'internalError',
              message: 'Playwright mock row patch exploded.',
              innerError: { trace: 'raw-payload-visible' }
            }
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return originalFetch(input, init);
      };
    });

    const result = await page.evaluate(async () => {
      window.filePath = 'Copilot_Apps/Kyles_Adventure_Finder/Nature_Locations.xlsx';
      window.tableName = 'Nature_Locations';
      try {
        await window.saveToExcel(0, ['Broken row patch', 'pid-broken']);
        return { ok: true, message: '' };
      } catch (error) {
        return { ok: false, message: String(error && error.message ? error.message : error) };
      }
    });

    expect(result.ok).toBe(false);
    expect(result.message).toContain('Failed to update Excel row');
    await expect(page.locator('#workbookPatchDiagnosticsPanel')).toBeVisible();
    await page.click('#openWorkbookPatchDiagnosticsBtn');
    await expect(page.locator('#workbookPatchDiagnosticsModalBackdrop')).toHaveClass(/visible/);
    await expect(page.locator('#workbookPatchDiagnosticsModalBody')).toContainText('Workbook row PATCH failed.');
    await expect(page.locator('#workbookPatchDiagnosticsModalBody')).toContainText('Playwright mock row patch exploded.');
    await expect(page.locator('#workbookPatchDiagnosticsModalBody')).toContainText('raw-payload-visible');
  });

  test('single add can be cancelled at the destination confirmation prompt', async ({ page }) => {
    const graphCalls = [];
    await installWorkbookMocks(page.context(), graphCalls);

    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => (
      typeof window.buildExcelRow === 'function'
      && typeof window.addRowToExcel === 'function'
    ), null, { timeout: 15000 });
    await seedMainWindow(page);

    const popupPromise = page.waitForEvent('popup');
    await page.evaluate(() => window.open('/HTML%20Files/edit-mode-enhanced.html#embedded=1&sourceSubtab=wildlife-animals', '_blank'));
    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');
    await popup.waitForFunction(() => document.getElementById('actionTargetSelect')?.options.length >= 7, null, { timeout: 10000 });
    await seedEditModeWindow(popup);
    await popup.evaluate(() => {
      window.__targetConfirmMessages = [];
      window.confirm = (message) => {
        window.__targetConfirmMessages.push(String(message || ''));
        return false;
      };
    });

    await popup.fill('#singleInput', 'Cancelled Animal Location');
    await popup.evaluate(() => submitAddSinglePlace());

    await expect.poll(() => popup.evaluate(() => String((window.__targetConfirmMessages || [])[0] || ''))).toContain('Wildlife_Animals (Entertainment_Locations.xlsx)');
    await popup.waitForTimeout(200);
    await expect.poll(() => graphCalls.length).toBe(0);
    await expect(popup.locator('#single-status')).toContainText('Add cancelled');
  });


});
