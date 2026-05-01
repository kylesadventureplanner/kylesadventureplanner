/**
 * edit-mode-global.spec.js
 * Tests:
 *  1. Global header "Edit Mode" button is present and wired to openEditModeWindow.
 *  2. edit-mode-enhanced.html loads with all 7 target-table options populated for
 *     action target (places tab) and automation-default target (automation tab).
 *  3. target controls are scoped to their relevant tab.
 */
const { test, expect } = require('./reliability-test');

const EXPECTED_TARGET_IDS = [
  'nature_locations',
  'retail_coffee',
  'retail_retail',
  'retail_restaurants',
  'ent_festivals',
  'ent_wildlife_animals',
  'ent_general'
];

const RESULT_KEYS = {
  LAST_ADDED_ROW_VALUES: '__lastAddedRowValues',
  ADD_PERSIST_RESULT: '__addPersistResult',
  GRAPH_PAYLOAD_CAPTURE: '__graphPayloadCapture',
  GRAPH_REREAD_SNAPSHOT: '__graphRereadSnapshot',
  GRAPH_PARITY_RESULT: '__graphParityResult',
  GRAPH_REORDERED_PAYLOAD_CAPTURE: '__graphReorderedPayloadCapture',
  GRAPH_REORDERED_REREAD_SNAPSHOT: '__graphReorderedRereadSnapshot',
  GRAPH_REORDERED_RESULT: '__graphReorderedResult',
  POPULATE_PERSIST_RESULT: '__populatePersistResult',
  HOURS_PERSIST_RESULT: '__hoursPersistResult',
  TAG_PERSIST_RESULT: '__tagPersistResult',
  NEGATIVE_ROW_REREAD_RESULT: '__negativeRowRereadResult'
};

// Navigate directly to the edit-mode page (no auth required for UI smoke).
async function gotoEditMode(page, url = '/HTML Files/edit-mode-enhanced.html') {
  await page.goto(url);
  // Wait for the target selectors to be populated by initTargetSelectors().
  await page.waitForFunction(() => {
    const sel = document.getElementById('actionTargetSelect');
    return sel && sel.options.length >= 7;
  }, { timeout: 10000 });
}

async function expandTabCardsIfAvailable(page, tabName) {
  // Directly expand all collapsible cards using JavaScript for better reliability in CI
  await page.evaluate((tabId) => {
    const tabContent = document.getElementById(tabId);
    if (!tabContent) return;

    const cards = Array.from(tabContent.querySelectorAll(':scope > .card.edit-collapsible-card'));
    const placesMainCards = tabId === 'places-tab' ? Array.from(tabContent.querySelectorAll('#placesMainContent > .card.edit-collapsible-card')) : [];
    const allCards = cards.concat(placesMainCards);

    allCards.forEach((card) => {
      const body = card.querySelector(':scope > .edit-collapsible-card-body');
      const toggleBtn = card.querySelector(':scope > .edit-card-collapse-btn');
      if (body && toggleBtn) {
        card.classList.remove('is-collapsed');
        body.hidden = false;
        toggleBtn.setAttribute('aria-expanded', 'true');
        toggleBtn.textContent = '▲ Collapse';
        toggleBtn.title = 'Collapse section';
      }
    });
  }, `${tabName}-tab`);
}

async function installGraphRowsMock(page, schemaColumns) {
  const graphPostBodies = [];
  const graphStoredRows = [];

  await page.route('https://graph.microsoft.com/**', async (route) => {
    const request = route.request();
    const url = request.url();
    const method = request.method();

    if (method === 'GET' && /\/workbook\/tables\/[^/]+\/columns(?:\?|$)/.test(url)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ value: schemaColumns.map((name, index) => ({ index, name })) })
      });
      return;
    }

    if (method === 'POST' && /\/workbook\/tables\/[^/]+\/rows(?:\/add)?(?:\?|$)/.test(url)) {
      const payload = JSON.parse(request.postData() || '{}');
      graphPostBodies.push(payload);
      const values = Array.isArray(payload?.values?.[0]) ? payload.values[0].slice() : [];
      graphStoredRows.push({ values: [values] });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ index: graphStoredRows.length - 1, values: [values] })
      });
      return;
    }

    if (method === 'GET' && /\/workbook\/tables\/[^/]+\/rows(?:\?|$)/.test(url)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ value: graphStoredRows })
      });
      return;
    }

    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ value: [] }) });
  });

  return { graphPostBodies, graphStoredRows };
}

async function runAddFlowWithGraphBackedWriter(page, options) {
  await page.evaluate(async (rawOptions) => {
    const opts = rawOptions && typeof rawOptions === 'object' ? rawOptions : {};
    const schemaColumns = Array.isArray(opts.schemaColumns) ? opts.schemaColumns : [];
    const resolvedDetails = opts.resolvedDetails && typeof opts.resolvedDetails === 'object' ? opts.resolvedDetails : {};
    const inputLabel = String(opts.inputLabel || resolvedDetails.name || 'Playwright Graph Location').trim() || 'Playwright Graph Location';
    const resultKey = String(opts.resultKey || '__graphParityResult').trim() || '__graphParityResult';
    const payloadKey = String(opts.payloadKey || '__graphPayloadCapture').trim() || '__graphPayloadCapture';
    const rereadKey = String(opts.rereadKey || '__graphRereadSnapshot').trim() || '__graphRereadSnapshot';
    const buildRowMode = String(opts.buildRowMode || 'legacy-indexed').trim() || 'legacy-indexed';

    window.filePath = 'Nature_Locations.xlsx';
    window.tableName = 'nature_locations';
    window.accessToken = 'playwright-token';
    window.adventuresData = [];
    window.__excelSchemaColumns = schemaColumns.map((name, index) => ({ name, index }));
    window.__excelColumnCount = window.__excelSchemaColumns.length;

    window.resolvePlaceInputWithGoogleData = async () => ({ ...resolvedDetails });

    if (buildRowMode === 'legacy-indexed') {
      window.buildExcelRow = (placeId, details) => {
        const row = new Array(schemaColumns.length || 30).fill('');
        row[0] = String(details.name || '');
        row[1] = String(placeId || '');
        row[11] = String(details.address || '');
        row[16] = String(details.description || '');
        row[27] = String(details.coordinates?.lat ?? '');
        row[28] = String(details.coordinates?.lng ?? '');
        row[29] = details.coordinates ? `${details.coordinates.lat}, ${details.coordinates.lng}` : '';
        return row;
      };
    } else if (typeof window.buildExcelRow !== 'function') {
      window.buildExcelRow = (placeId, details) => {
        const row = new Array(window.__excelSchemaColumns.length).fill('');
        const setByName = (names, value) => {
          const normalizedNames = (Array.isArray(names) ? names : []).map((n) => String(n || '').trim().toLowerCase());
          const idx = window.__excelSchemaColumns.findIndex((entry) => normalizedNames.includes(String(entry?.name || '').trim().toLowerCase()));
          if (idx >= 0) row[idx] = value == null ? '' : String(value);
        };
        setByName(['Name'], details?.name || '');
        setByName(['Google Place ID', 'GooglePlaceId'], placeId || '');
        setByName(['Address'], details?.address || '');
        setByName(['Description'], details?.description || '');
        if (details?.coordinates) {
          setByName(['Latitude', 'Lat'], details.coordinates.lat);
          setByName(['Longitude', 'Lng', 'Long'], details.coordinates.lng);
          setByName(['GPS Coordinates', 'GPS'], `${details.coordinates.lat}, ${details.coordinates.lng}`);
        }
        return row;
      };
    }

    window[payloadKey] = [];
    window[rereadKey] = [];

    window.addRowToExcel = async (rowValues) => {
      const schemaResp = await fetch(`https://graph.microsoft.com/v1.0/me/drive/root:/${window.filePath}:/workbook/tables/${window.tableName}/columns`, {
        headers: { Authorization: `Bearer ${window.accessToken}` }
      });
      const schemaData = await schemaResp.json();
      const cols = Array.isArray(schemaData?.value) ? schemaData.value : [];
      window.__excelSchemaColumns = cols.map((entry, index) => ({ name: String(entry?.name || ''), index }));
      window.__excelColumnCount = window.__excelSchemaColumns.length;

      const normalized = typeof window.normalizeExcelRowForSchema === 'function'
        ? window.normalizeExcelRowForSchema(rowValues, window)
        : (Array.isArray(rowValues) ? rowValues.slice() : []);

      const payload = { values: [normalized] };
      window[payloadKey].push(payload);

      await fetch(`https://graph.microsoft.com/v1.0/me/drive/root:/${window.filePath}:/workbook/tables/${window.tableName}/rows`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${window.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const rereadResp = await fetch(`https://graph.microsoft.com/v1.0/me/drive/root:/${window.filePath}:/workbook/tables/${window.tableName}/rows`, {
        headers: { Authorization: `Bearer ${window.accessToken}` }
      });
      const rereadData = await rereadResp.json();
      window[rereadKey] = Array.isArray(rereadData?.value) ? rereadData.value : [];
      window.adventuresData = window[rereadKey].map((entry) => ({ values: [Array.isArray(entry?.values?.[0]) ? entry.values[0].slice() : []] }));

      return {
        success: true,
        rowsChanged: 1,
        persistedRows: 1,
        verifiedRowsChanged: 1,
        rowsVerifiedPresent: 1,
        postWriteVerified: true,
        verificationMode: 'row-reread'
      };
    };

    if (typeof window.handleAddSinglePlaceWithProgress === 'function') {
      const status = document.createElement('div');
      document.body.appendChild(status);
      window[resultKey] = await window.handleAddSinglePlaceWithProgress(inputLabel, 'placeName', status, false, {});
      return;
    }
    if (window.enhancedAutomation && typeof window.enhancedAutomation.addSinglePlace === 'function') {
      window[resultKey] = await window.enhancedAutomation.addSinglePlace(inputLabel, 'placeName', false, {});
      return;
    }
    throw new Error('No add handler available for Graph parity test harness');
  }, options || {});
}

function normalizeExpectedGpsFields(expected) {
  const safe = expected && typeof expected === 'object' ? expected : {};
  return {
    description: String(safe.description || ''),
    latitude: String(safe.latitude || ''),
    longitude: String(safe.longitude || ''),
    gps: String(safe.gps || '')
  };
}

function assertGpsFieldsInRow(rowValues, indexes, expected) {
  const row = Array.isArray(rowValues) ? rowValues : [];
  const idx = indexes && typeof indexes === 'object' ? indexes : {};
  const target = normalizeExpectedGpsFields(expected);
  expect(String(row[idx.description] || '')).toBe(target.description);
  expect(String(row[idx.latitude] || '')).toBe(target.latitude);
  expect(String(row[idx.longitude] || '')).toBe(target.longitude);
  expect(String(row[idx.gps] || '')).toBe(target.gps);
}

async function pollGpsFieldsFromRowArrayKey(page, rowKey, indexes, expected) {
  const key = String(rowKey || '').trim();
  const target = normalizeExpectedGpsFields(expected);
  await expect.poll(() => page.evaluate(({ sourceKey, sourceIndexes }) => ({
    description: String(window[sourceKey]?.[sourceIndexes.description] || ''),
    latitude: String(window[sourceKey]?.[sourceIndexes.latitude] || ''),
    longitude: String(window[sourceKey]?.[sourceIndexes.longitude] || ''),
    gps: String(window[sourceKey]?.[sourceIndexes.gps] || '')
  }), { sourceKey: key, sourceIndexes: indexes }), { timeout: 10000 }).toEqual(target);
}

async function pollGpsFieldsFromRowContainerKey(page, containerKey, indexes, expected) {
  const key = String(containerKey || '').trim();
  const target = normalizeExpectedGpsFields(expected);
  await expect.poll(() => page.evaluate(({ sourceKey, sourceIndexes }) => ({
    description: String(window[sourceKey]?.[0]?.values?.[0]?.[sourceIndexes.description] || ''),
    latitude: String(window[sourceKey]?.[0]?.values?.[0]?.[sourceIndexes.latitude] || ''),
    longitude: String(window[sourceKey]?.[0]?.values?.[0]?.[sourceIndexes.longitude] || ''),
    gps: String(window[sourceKey]?.[0]?.values?.[0]?.[sourceIndexes.gps] || '')
  }), { sourceKey: key, sourceIndexes: indexes }), { timeout: 10000 }).toEqual(target);
}

async function assertRowRereadSuccess(page, resultKey, expected = {}) {
  const key = String(resultKey || '').trim();
  const match = expected && typeof expected === 'object' ? expected : {};
  await expect.poll(() => page.evaluate((sourceKey) => {
    const result = window[sourceKey];
    if (!result || typeof result !== 'object') return null;
    return {
      ...result,
      __successTruthy: !!result.success
    };
  }, key), { timeout: 10000 })
    .toMatchObject({
      __successTruthy: true,
      persistedRows: 1,
      verificationMode: 'row-reread',
      ...match
    });
}

async function assertGraphGpsPayloadAndReread(page, options) {
  const opts = options && typeof options === 'object' ? options : {};
  const graphPostBodies = Array.isArray(opts.graphPostBodies) ? opts.graphPostBodies : [];
  const schemaLength = Number(opts.schemaLength) || 0;
  const payloadIndexes = opts.payloadIndexes && typeof opts.payloadIndexes === 'object' ? opts.payloadIndexes : {};
  const rereadIndexes = opts.rereadIndexes && typeof opts.rereadIndexes === 'object' ? opts.rereadIndexes : payloadIndexes;
  const expected = opts.expected && typeof opts.expected === 'object' ? opts.expected : {};
  const rereadKey = String(opts.rereadKey || RESULT_KEYS.GRAPH_REREAD_SNAPSHOT).trim() || RESULT_KEYS.GRAPH_REREAD_SNAPSHOT;
  const resultKey = String(opts.resultKey || RESULT_KEYS.GRAPH_PARITY_RESULT).trim() || RESULT_KEYS.GRAPH_PARITY_RESULT;
  const blankPayloadIndexes = Array.isArray(opts.blankPayloadIndexes) ? opts.blankPayloadIndexes : [];

  expect(graphPostBodies.length).toBe(1);
  expect(Array.isArray(graphPostBodies[0]?.values?.[0])).toBe(true);
  if (schemaLength > 0) {
    expect(graphPostBodies[0].values[0].length).toBe(schemaLength);
  }

  assertGpsFieldsInRow(graphPostBodies[0].values[0], payloadIndexes, expected);

  blankPayloadIndexes.forEach((idx) => {
    expect(String(graphPostBodies[0].values[0][idx] || '')).toBe('');
  });

  await pollGpsFieldsFromRowContainerKey(page, rereadKey, rereadIndexes, expected);

  await assertRowRereadSuccess(page, resultKey);
}

test.describe('Edit Mode – global header button', () => {
  test('header contains #globalEditModeBtn with correct label and handler', async ({ page }) => {
    await page.goto('/');
    const btn = page.locator('#globalEditModeBtn');
    await expect(btn).toBeVisible();
    await expect(btn).toHaveText(/Edit Mode/i);
    const onclick = await btn.getAttribute('onclick');
    expect(onclick).toContain('openEditModeWindow');
  });
});

test.describe('Edit Mode – target-table selectors', () => {
  test.beforeEach(async ({ page }) => {
    await gotoEditMode(page);
    await expandTabCardsIfAvailable(page, 'places');
  });

  test('action target select has all 7 tables', async ({ page }) => {
    const select = page.locator('#actionTargetSelect');
    await expect(select).toBeVisible();
    for (const id of EXPECTED_TARGET_IDS) {
      await expect(select.locator(`option[value="${id}"]`)).toHaveCount(1);
    }
    const count = await select.locator('option').count();
    expect(count).toBe(7);
  });

  test('automation default select has all 7 tables', async ({ page }) => {
    await page.click('.tab-btn[data-tab="automation"]');
    const select = page.locator('#automationTargetSelect');
    await expect(select).toBeVisible();
    const count = await select.locator('option').count();
    expect(count).toBe(7);
  });

  test('tab-specific target controls show only relevant section', async ({ page }) => {
    await expect(page.locator('#actionTargetSelect')).toBeVisible();
    await expect(page.locator('#automationTargetSelect')).toBeHidden();
    await expect(page.locator('#targetSelectionStatus')).toBeVisible();

    await page.click('.tab-btn[data-tab="automation"]');
    await expect(page.locator('#automationTargetSelect')).toBeVisible();
    await expect(page.locator('#actionTargetSelect')).toBeHidden();
    await expect(page.locator('#targetSelectionStatus')).toHaveAttribute('hidden', '');
  });

  test('status chips update when target changes', async ({ page }) => {
    const chipGrid = page.locator('#targetSelectionStatus');
    await expect(chipGrid).toBeVisible();
    // Select "Retail" table in the action selector
    await page.selectOption('#actionTargetSelect', 'retail_retail');
    // Scope assertion to Add/Bulk chip only to avoid unrelated chip text churn.
    const addBulkChip = chipGrid.locator('.target-chip', { hasText: 'Add/Bulk:' });
    await expect(addBulkChip).toContainText(/Add\/Bulk:\s*Retail\s*\(Retail_Food_and_Drink\.xlsx\)/i);
  });

  test('embedded launch defaults add target to the matching source subtab table', async ({ page }) => {
    await gotoEditMode(page, '/HTML%20Files/edit-mode-enhanced.html#embedded=1&sourceSubtab=wildlife-animals');
    await expect(page.locator('#actionTargetSelect')).toHaveValue('ent_wildlife_animals');
    await expect(page.locator('#automationTargetSelect')).toHaveValue('ent_wildlife_animals');
    const addBulkChip = page.locator('#targetSelectionStatus .target-chip', { hasText: 'Add/Bulk:' });
    await expect(addBulkChip).toContainText(/Wildlife_Animals\s*\(Entertainment_Locations\.xlsx\)/i);
  });

  test('tabs switch between Places and Automation panels', async ({ page }) => {
    // Default: places tab active
    await expect(page.locator('#places-tab')).toHaveClass(/active/);
    await expect(page.locator('#automation-tab')).not.toHaveClass(/active/);

    // Click Automation tab
    await page.click('.tab-btn[data-tab="automation"]');
    await expect(page.locator('#automation-tab')).toHaveClass(/active/);
    await expect(page.locator('#places-tab')).not.toHaveClass(/active/);
  });

  test('automation tab exposes dedicated Search Missing Place IDs action', async ({ page }) => {
    await page.click('.tab-btn[data-tab="automation"]');
    await expandTabCardsIfAvailable(page, 'automation');
    const searchBtn = page.locator('#searchMissingPlaceIdsBtn');
    await expect(searchBtn).toBeVisible();
    await expect(searchBtn).toHaveText(/Search Missing Place IDs/i);

    await page.evaluate((keys) => {
      const header = [
        'Name', 'Google Place ID', 'Website', 'Tags', 'Drive Time', 'Hours of Operation', 'Activity Duration', 'Difficulty', 'Trail Length',
        'State', 'City', 'Address', 'Phone Number', 'Google Rating', 'Cost', 'Directions', 'Description', 'Nearby', 'Links', 'Links2',
        'Notes', 'My Rating', 'Favorite', 'Google URL'
      ];
      const indexMap = Object.fromEntries(header.map((name, index) => [name, index]));
      window.getColumnIndexByName = (primary, aliases = []) => {
        const candidates = [primary].concat(Array.isArray(aliases) ? aliases : []).map((value) => String(value || '').trim().toLowerCase());
        const found = Object.keys(indexMap).find((name) => candidates.includes(String(name || '').trim().toLowerCase()));
        return found == null ? -1 : indexMap[found];
      };
      const row = new Array(header.length).fill('');
      row[0] = 'Playwright Missing Place ID Cafe';
      row[9] = 'NC';
      row[10] = 'Durham';
      row[11] = '123 Missing Id Ln, Durham, NC 27701';
      window.adventuresData = [{ rowId: 'row-1', values: [row] }];
      window.__excelColumnCount = header.length;
      window.__excelLoadedRowCount = 1;
      window.__excelSchemaColumns = header.map((name, index) => ({ name, index }));
      window.probeTargetSchema = async () => true;
      window.loadTargetRows = async () => true;
      window.showToast = () => {};
      window.__searchMissingPlaceIdsCalls = [];
      window.searchMissingGooglePlaceIds = async (options = {}) => {
        window.__searchMissingPlaceIdsCalls.push({ ...options });
        return {
          success: true,
          message: 'stub search complete',
          dryRun: !!options.dryRun,
          processedTargets: 1,
          persistedTargets: 0,
          failedTargets: 0,
          rowsChanged: 0,
          persistedRows: 0,
          verifiedRowsChanged: 0,
          persisted: false,
          persistMode: 'dry-run',
          persistReason: '',
          postWriteVerified: false,
          verificationMode: '',
          verificationReason: ''
        };
      };
    });

    await page.evaluate((keys) => {
      const checkbox = document.getElementById('searchPlaceIdsDryRun');
      if (!checkbox) throw new Error('searchPlaceIdsDryRun checkbox missing');
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await searchBtn.click();

    await expect.poll(() => page.evaluate(() => window.__searchMissingPlaceIdsCalls.length), { timeout: 10000 }).toBe(1);
    await expect.poll(() => page.evaluate(() => window.__searchMissingPlaceIdsCalls[0]), { timeout: 10000 })
      .toMatchObject({ dryRun: true });
    await expect(page.locator('#search-place-ids-write-diagnostics')).toContainText(/dry run only/i);
    await expect(page.locator('#automationPreflightBanner')).toBeVisible();
    await expect(page.locator('#automationPreflightBanner')).toContainText(/Preflight:/i);
  });

  test('hard preflight block toggle prevents automation run when auth is missing', async ({ page }) => {
    await page.click('.tab-btn[data-tab="automation"]');
    await expandTabCardsIfAvailable(page, 'automation');

    await page.evaluate((keys) => {
      const header = [
        'Name', 'Google Place ID', 'Website', 'Tags', 'Drive Time', 'Hours of Operation', 'Activity Duration', 'Difficulty', 'Trail Length',
        'State', 'City', 'Address', 'Phone Number', 'Google Rating', 'Cost', 'Directions', 'Description', 'Nearby', 'Links', 'Links2',
        'Notes', 'My Rating', 'Favorite', 'Google URL'
      ];
      const row = new Array(header.length).fill('');
      row[0] = 'Playwright Blocked Preflight Cafe';
      row[11] = '123 Guardrail Ln, Durham, NC 27701';
      window.adventuresData = [{ values: [row] }];
      window.__excelSchemaColumns = header.map((name, index) => ({ name, index }));
      window.__searchMissingPlaceIdsCalls = [];
      window.searchMissingGooglePlaceIds = async (options = {}) => {
        window.__searchMissingPlaceIdsCalls.push({ ...options });
        return { success: true, dryRun: !!options.dryRun, processedTargets: 1, persisted: false };
      };
      try { window.accessToken = ''; } catch (_error) {}
      try {
        if (window.opener && !window.opener.closed) window.opener.accessToken = '';
      } catch (_error) {}
    });

    await page.evaluate(() => {
      const dryRunToggle = document.getElementById('searchPlaceIdsDryRun');
      if (dryRunToggle) {
        dryRunToggle.checked = true;
        dryRunToggle.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const hardBlock = document.getElementById('automationHardPreflightToggle');
      if (!hardBlock) throw new Error('automationHardPreflightToggle missing');
      hardBlock.checked = true;
      hardBlock.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await page.click('#searchMissingPlaceIdsBtn');

    await expect.poll(() => page.evaluate(() => Number(window.__searchMissingPlaceIdsCalls.length || 0)), { timeout: 10000 }).toBe(0);
    await expect(page.locator('#automationPreflightBanner')).toContainText(/Preflight blocked:/i);
    await expect(page.locator('#search-place-ids-write-diagnostics')).toContainText(/blocked by preflight guardrail/i);
    await expect(page.locator('#automationPreflightWhyBlocked')).toBeVisible();
    await expect(page.locator('#automationPreflightWhyBlocked')).toContainText('missing-auth');
    await expect(page.locator('#automationPreflightWhyBlocked')).toContainText(/Sign in again/i);

    await expect(page.locator('#automationCopyPreflightDiagnosticsBtn')).toBeVisible();
    await page.click('#automationCopyPreflightDiagnosticsBtn');
    await expect.poll(() => page.evaluate(() => String(window.__lastAutomationPreflightDiagnosticsCopiedText || '')), { timeout: 10000 })
      .toContain('missing-auth');

    await expect(page.locator('#automationCopyAllDiagnosticsBtn')).toBeVisible();
    await page.click('#automationCopyAllDiagnosticsBtn');
    await expect.poll(() => page.evaluate(() => String(window.__lastAutomationAllDiagnosticsCopiedText || '')), { timeout: 10000 })
      .toContain('search-place-ids-write-diagnostics');
  });

  test('add flow persists coordinates and description across cache clear and reread', async ({ page }) => {
    await page.click('.tab-btn[data-tab="places"]');

    await page.evaluate((keys) => {
      const schemaNames = Array.from({ length: 30 }, (_, idx) => `Column ${idx + 1}`);
      schemaNames[0] = 'Name';
      schemaNames[1] = 'Google Place ID';
      schemaNames[11] = 'Address';
      schemaNames[16] = 'Description';
      schemaNames[27] = 'Latitude';
      schemaNames[28] = 'Longitude';
      schemaNames[29] = 'GPS Coordinates';

      window.__excelColumnCount = schemaNames.length;
      window.__excelSchemaColumns = schemaNames.map((name, index) => ({ name, index }));
      window.adventuresData = [];
      window.accessToken = 'playwright-token';

      window.resolvePlaceInputWithGoogleData = async () => ({
        placeId: 'pid-playwright-add-persist-1',
        name: 'Playwright Scenic Overlook',
        address: '500 Ridge Rd, Asheville, NC 28801',
        description: 'A scenic mountain overlook with long-range Blue Ridge views and a short family-friendly stop.',
        coordinates: {
          lat: 35.777777,
          lng: -82.777777
        }
      });

      window.buildExcelRow = (placeId, details) => {
        const row = new Array(schemaNames.length).fill('');
        row[0] = String(details.name || '');
        row[1] = String(placeId || '');
        row[11] = String(details.address || '');
        row[16] = String(details.description || '');
        row[27] = String(details.coordinates?.lat ?? details.latitude ?? '');
        row[28] = String(details.coordinates?.lng ?? details.longitude ?? '');
        row[29] = details.coordinates ? `${details.coordinates.lat}, ${details.coordinates.lng}` : '';
        return row;
      };

      window.__mockPersistedRows = [];
      window[keys.lastAdded] = null;
      window.addRowToExcel = async (rowValues) => {
        const copy = Array.isArray(rowValues) ? rowValues.slice() : [];
        window[keys.lastAdded] = copy;
        window.__mockPersistedRows.push(copy);
        window.adventuresData.push({ values: [copy] });
        return {
          success: true,
          persisted: true,
          rowsChanged: 1,
          persistedRows: 1,
          verifiedRowsChanged: 1,
          rowsVerifiedPresent: 1,
          postWriteVerified: true,
          verificationMode: 'playwright-mock'
        };
      };

      window.loadTargetRows = async () => {
        const rows = Array.isArray(window.__mockPersistedRows) ? window.__mockPersistedRows : [];
        window.adventuresData = rows.map((values) => ({ values: [Array.isArray(values) ? values.slice() : []] }));
        return true;
      };
    }, { lastAdded: RESULT_KEYS.LAST_ADDED_ROW_VALUES });

    await page.evaluate(async (keys) => {
      const status = document.createElement('div');
      document.body.appendChild(status);
      if (typeof window.handleAddSinglePlaceWithProgress === 'function') {
        window[keys.addPersistResult] = await window.handleAddSinglePlaceWithProgress(
          'Playwright Scenic Overlook',
          'placeName',
          status,
          false,
          {}
        );
        return;
      }
      if (window.enhancedAutomation && typeof window.enhancedAutomation.addSinglePlace === 'function') {
        window[keys.addPersistResult] = await window.enhancedAutomation.addSinglePlace('Playwright Scenic Overlook', 'placeName', false, {});
        return;
      }
      throw new Error('No add handler available for persistence test');
    }, { addPersistResult: RESULT_KEYS.ADD_PERSIST_RESULT });

    await pollGpsFieldsFromRowArrayKey(page, RESULT_KEYS.LAST_ADDED_ROW_VALUES, {
      description: 16,
      latitude: 27,
      longitude: 28,
      gps: 29
    }, {
      description: 'A scenic mountain overlook with long-range Blue Ridge views and a short family-friendly stop.',
      latitude: '35.777777',
      longitude: '-82.777777',
      gps: '35.777777, -82.777777'
    });

    await page.evaluate(async () => {
      localStorage.clear();
      sessionStorage.clear();
      window.adventuresData = [];
      await window.loadTargetRows();
    });

    await pollGpsFieldsFromRowContainerKey(page, 'adventuresData', {
      description: 16,
      latitude: 27,
      longitude: 28,
      gps: 29
    }, {
      description: 'A scenic mountain overlook with long-range Blue Ridge views and a short family-friendly stop.',
      latitude: '35.777777',
      longitude: '-82.777777',
      gps: '35.777777, -82.777777'
    });
    await expect.poll(() => page.evaluate((key) => window[key], RESULT_KEYS.ADD_PERSIST_RESULT), { timeout: 10000 })
      .toMatchObject({ success: true, persistedRows: 1, rowsChanged: 1 });
  });

  test('add flow keeps Graph rows payload aligned with schema for GPS columns', async ({ page }) => {
    await page.click('.tab-btn[data-tab="places"]');

    const schemaColumns = Array.from({ length: 30 }, (_, idx) => `Column ${idx + 1}`);
    schemaColumns[0] = 'Name';
    schemaColumns[1] = 'Google Place ID';
    schemaColumns[11] = 'Address';
    schemaColumns[16] = 'Description';
    schemaColumns[27] = 'Latitude';
    schemaColumns[28] = 'Longitude';
    schemaColumns[29] = 'GPS Coordinates';

    const { graphPostBodies } = await installGraphRowsMock(page, schemaColumns);

    await runAddFlowWithGraphBackedWriter(page, {
      schemaColumns,
      resolvedDetails: {
        placeId: 'pid-playwright-graph-parity-1',
        name: 'Playwright Graph Ridge',
        address: '900 Graph Ridge Rd, Asheville, NC 28801',
        description: 'A ridgeline stop with layered mountain views, picnic pull-offs, and sunset overlooks.',
        coordinates: { lat: 35.812345, lng: -82.654321 }
      },
      inputLabel: 'Playwright Graph Ridge',
      resultKey: RESULT_KEYS.GRAPH_PARITY_RESULT,
      payloadKey: RESULT_KEYS.GRAPH_PAYLOAD_CAPTURE,
      rereadKey: RESULT_KEYS.GRAPH_REREAD_SNAPSHOT,
      buildRowMode: 'legacy-indexed'
    });

    await assertGraphGpsPayloadAndReread(page, {
      graphPostBodies,
      schemaLength: schemaColumns.length,
      payloadIndexes: {
        description: 16,
        latitude: 27,
        longitude: 28,
        gps: 29
      },
      rereadIndexes: {
        description: 16,
        latitude: 27,
        longitude: 28,
        gps: 29
      },
      expected: {
        description: 'A ridgeline stop with layered mountain views, picnic pull-offs, and sunset overlooks.',
        latitude: '35.812345',
        longitude: '-82.654321',
        gps: '35.812345, -82.654321'
      },
      rereadKey: RESULT_KEYS.GRAPH_REREAD_SNAPSHOT,
      resultKey: RESULT_KEYS.GRAPH_PARITY_RESULT
    });
  });

  test('add flow keeps Graph payload GPS mapping correct when schema columns are reordered', async ({ page }) => {
    await page.click('.tab-btn[data-tab="places"]');

    const schemaColumns = Array.from({ length: 30 }, (_, idx) => `Column ${idx + 1}`);
    schemaColumns[2] = 'Longitude';
    schemaColumns[4] = 'Description';
    schemaColumns[7] = 'Name';
    schemaColumns[9] = 'Google Place ID';
    schemaColumns[13] = 'GPS Coordinates';
    schemaColumns[18] = 'Address';
    schemaColumns[22] = 'Latitude';

    const idxDescription = schemaColumns.indexOf('Description');
    const idxLatitude = schemaColumns.indexOf('Latitude');
    const idxLongitude = schemaColumns.indexOf('Longitude');
    const idxGps = schemaColumns.indexOf('GPS Coordinates');

    const { graphPostBodies } = await installGraphRowsMock(page, schemaColumns);

    await runAddFlowWithGraphBackedWriter(page, {
      schemaColumns,
      resolvedDetails: {
        placeId: 'pid-playwright-graph-reorder-1',
        name: 'Playwright Reordered Ridge',
        address: '901 Reorder Ridge Rd, Asheville, NC 28801',
        description: 'A reordered-schema location used to validate name-based GPS payload mapping.',
        coordinates: { lat: 35.901234, lng: -82.210987 }
      },
      inputLabel: 'Playwright Reordered Ridge',
      resultKey: RESULT_KEYS.GRAPH_REORDERED_RESULT,
      payloadKey: RESULT_KEYS.GRAPH_REORDERED_PAYLOAD_CAPTURE,
      rereadKey: RESULT_KEYS.GRAPH_REORDERED_REREAD_SNAPSHOT,
      buildRowMode: 'schema-aware'
    });

    await assertGraphGpsPayloadAndReread(page, {
      graphPostBodies,
      schemaLength: schemaColumns.length,
      payloadIndexes: {
        description: idxDescription,
        latitude: idxLatitude,
        longitude: idxLongitude,
        gps: idxGps
      },
      rereadIndexes: {
        description: 4,
        latitude: 22,
        longitude: 2,
        gps: 13
      },
      expected: {
        description: 'A reordered-schema location used to validate name-based GPS payload mapping.',
        latitude: '35.901234',
        longitude: '-82.210987',
        gps: '35.901234, -82.210987'
      },
      rereadKey: RESULT_KEYS.GRAPH_REORDERED_REREAD_SNAPSHOT,
      resultKey: RESULT_KEYS.GRAPH_REORDERED_RESULT,
      blankPayloadIndexes: [16, 27, 28, 29]
    });
  });

  test('row-reread helper rejects non-row-reread or non-persisted contracts', async ({ page }) => {
    await page.evaluate((key) => {
      window[key] = {
        success: true,
        rowsChanged: 1,
        persistedRows: 0,
        verifiedRowsChanged: 0,
        postWriteVerified: false,
        verificationMode: 'loaded-data-presence'
      };
    }, RESULT_KEYS.NEGATIVE_ROW_REREAD_RESULT);

    let helperRejected = false;
    let helperError = '';
    try {
      await assertRowRereadSuccess(page, RESULT_KEYS.NEGATIVE_ROW_REREAD_RESULT);
    } catch (error) {
      helperRejected = true;
      helperError = String(error && error.message ? error.message : error);
    }

    expect(helperRejected).toBe(true);
    expect(helperError).toContain('persistedRows');
  });

  test('automation mode selectors show recommendation hints and emit change toast', async ({ page }) => {
    await page.click('.tab-btn[data-tab="automation"]');
    await expandTabCardsIfAvailable(page, 'automation');

    await expect(page.locator('#refreshPlaceIdsModeHint')).toContainText('Recommended: Missing only');
    await expect(page.locator('#populateMissingModeHint')).toContainText('Recommended: Missing only');
    await expect(page.locator('#updateHoursModeHint')).toContainText('Recommended: Refresh all');

    await page.evaluate(() => {
      window.__modeToastCalls = [];
      window.showToast = (...args) => {
        window.__modeToastCalls.push(args.map((part) => String(part)));
      };
    });

    await page.selectOption('#populateMissingMode', 'refresh-all');
    await expect(page.locator('#populateMissingModeHint')).toContainText('Recommended: Missing only (now Refresh all)');
    await expect.poll(() => page.evaluate(() => window.__modeToastCalls.length), { timeout: 10000 }).toBeGreaterThan(0);
    await expect.poll(() => page.evaluate(() => window.__modeToastCalls[window.__modeToastCalls.length - 1][0]), { timeout: 10000 })
      .toContain('Fill Missing Fields mode changed to Refresh all');
  });

  test('Update Descriptions automation fills blank descriptions from Google details', async ({ page }) => {
    await page.click('.tab-btn[data-tab="automation"]');
    await page.evaluate(() => {
      const header = [
        'Name', 'Google Place ID', 'Website', 'Tags', 'Drive Time', 'Hours of Operation', 'Activity Duration', 'Difficulty', 'Trail Length',
        'State', 'City', 'Address', 'Phone Number', 'Google Rating', 'Cost', 'Directions', 'Description', 'Nearby', 'Links', 'Links2',
        'Notes', 'My Rating', 'Favorite', 'Google URL'
      ];
      const indexMap = Object.fromEntries(header.map((name, index) => [name, index]));
      window.getColumnIndexByName = (primary, aliases = []) => {
        const candidates = [primary].concat(Array.isArray(aliases) ? aliases : []).map((value) => String(value || '').trim().toLowerCase());
        const found = Object.keys(indexMap).find((name) => candidates.includes(String(name || '').trim().toLowerCase()));
        return found == null ? -1 : indexMap[found];
      };
      const row = new Array(header.length).fill('');
      row[0] = 'Playwright Mock Description Place';
      row[1] = 'ChIJPlaywrightDesc123';
      row[9] = 'NC';
      row[10] = 'Durham';
      row[11] = '500 Test Lane, Durham, NC 27701';
      window.adventuresData = [{ values: [row] }];
      window.getPlaceDetails = async () => ({
        description: 'Google editorial summary for Playwright Mock Description Place.',
        address: '500 Test Lane, Durham, NC 27701',
        rating: 4.8,
        reviews: []
      });
      window.saveToExcel = async () => {
        window.__updateDescriptionsSaved = true;
        return true;
      };
    });

    await page.evaluate(async () => {
      const mount = document.createElement('div');
      mount.id = 'playwright-desc-diagnostics';
      document.body.appendChild(mount);
      window.__updateDescriptionsResult = await window.handleUpdateAllDescriptions(mount, false, false);
    });

    await expect.poll(() => page.evaluate(() => String(window.adventuresData?.[0]?.values?.[0]?.[16] || '')), { timeout: 10000 })
      .toContain('Google editorial summary for Playwright Mock Description Place.');
    await expect.poll(() => page.evaluate(() => Boolean(window.__updateDescriptionsSaved)), { timeout: 10000 }).toBe(true);
    await expect.poll(() => page.evaluate(() => window.__updateDescriptionsResult), { timeout: 10000 }).toMatchObject({ success: true, updatedCount: 1 });
    await expect.poll(() => page.evaluate(() => window.__updateDescriptionsResult?.previewItems || []), { timeout: 10000 })
      .toEqual([
        expect.objectContaining({
          name: 'Playwright Mock Description Place',
          description: 'Google editorial summary for Playwright Mock Description Place.'
        })
      ]);
    await expect.poll(() => page.evaluate(() => String(document.getElementById('playwright-desc-diagnostics')?.innerText || '')), { timeout: 10000 })
      .toContain('Preview of updated descriptions');
    await expect.poll(() => page.evaluate(() => String(document.getElementById('playwright-desc-diagnostics')?.innerText || '')), { timeout: 10000 })
      .toContain('Google editorial summary for Playwright Mock Description Place.');
    await expect.poll(() => page.evaluate(() => {
      const root = document.getElementById('playwright-desc-diagnostics');
      const btn = root ? root.querySelector('button') : null;
      return btn ? String(btn.textContent || '') : '';
    }), { timeout: 10000 }).toContain('Copy preview text');
    await page.evaluate(async () => {
      window.__copyPreviewResult = await window.copyDescriptionPreviewText();
    });
    await expect.poll(() => page.evaluate(() => String(window.__lastDescriptionPreviewCopiedText || '')), { timeout: 10000 })
      .toContain('Playwright Mock Description Place');
    await expect.poll(() => page.evaluate(() => String(window.__lastDescriptionPreviewCopiedText || '')), { timeout: 10000 })
      .toContain('Google editorial summary for Playwright Mock Description Place.');
  });

  test('Update Descriptions automation accepts non-ChI place IDs when overwrite is enabled', async ({ page }) => {
    await page.click('.tab-btn[data-tab="automation"]');
    await page.evaluate(() => {
      const header = [
        'Name', 'Google Place ID', 'Website', 'Tags', 'Drive Time', 'Hours of Operation', 'Activity Duration', 'Difficulty', 'Trail Length',
        'State', 'City', 'Address', 'Phone Number', 'Google Rating', 'Cost', 'Directions', 'Description', 'Nearby', 'Links', 'Links2',
        'Notes', 'My Rating', 'Favorite', 'Google URL'
      ];
      const indexMap = Object.fromEntries(header.map((name, index) => [name, index]));
      window.getColumnIndexByName = (primary, aliases = []) => {
        const candidates = [primary].concat(Array.isArray(aliases) ? aliases : []).map((value) => String(value || '').trim().toLowerCase());
        const found = Object.keys(indexMap).find((name) => candidates.includes(String(name || '').trim().toLowerCase()));
        return found == null ? -1 : indexMap[found];
      };
      const row = new Array(header.length).fill('');
      row[0] = 'Playwright Non ChI Place';
      row[1] = 'pid-playwright-12345';
      row[9] = 'NC';
      row[10] = 'Durham';
      row[11] = '700 Test Lane, Durham, NC 27701';
      row[16] = 'Legacy description to overwrite';
      window.adventuresData = [{ values: [row] }];
      window.getPlaceDetails = async () => ({
        description: 'Updated description from Google for non-ChI place id.',
        address: '700 Test Lane, Durham, NC 27701',
        rating: 4.7,
        reviews: []
      });
      window.saveToExcel = async () => true;
    });

    await page.evaluate(async () => {
      const mount = document.createElement('div');
      document.body.appendChild(mount);
      window.__updateDescriptionsNonChIResult = await window.handleUpdateAllDescriptions(mount, false, true);
    });

    await expect.poll(() => page.evaluate(() => String(window.adventuresData?.[0]?.values?.[0]?.[16] || '')), { timeout: 10000 })
      .toBe('Updated description from Google for non-ChI place id.');
    await expect.poll(() => page.evaluate(() => window.__updateDescriptionsNonChIResult), { timeout: 10000 })
      .toMatchObject({ success: true, updatedCount: 1 });

    await page.evaluate(() => {
      const panel = document.createElement('div');
      panel.id = 'playwright-desc-skip-chip-panel';
      panel.textContent = 'Diagnostics baseline';
      document.body.appendChild(panel);
      window.appendUpdateDescriptionsDiagnosticsSuffix('playwright-desc-skip-chip-panel', {
        updateDescriptionsDiagnostics: {
          skipReasonCounts: {
            'invalid-place-id-format': 2,
            'already-has-description': 1
          },
          googleApi: {
            checked: true,
            attemptedRows: 3,
            returnedRows: 2,
            emptyRows: 1,
            errorRows: 0,
            sourceCounts: {}
          }
        }
      });
    });
    await expect(page.locator('#playwright-desc-skip-chip-panel-skip-reasons')).toContainText('invalid-place-id-format: 2');

    await page.evaluate(() => {
      window.renderAutomationHeaderSkipSummary({
        updateDescriptionsDiagnostics: {
          skipReasonCounts: {
            'invalid-place-id-format': 4,
            'already-has-description': 2,
            'no-description-generated': 1
          },
          googleApi: {
            checked: true,
            attemptedRows: 7,
            returnedRows: 3,
            emptyRows: 4,
            errorRows: 0,
            sourceCounts: {}
          }
        }
      });
    });
    await expect(page.locator('#automationSkipSummaryTop3')).toBeVisible();
    await expect(page.locator('#automationSkipSummaryTop3')).toContainText('invalid-place-id-format: 4');
  });

  test('automation handlers persist workbook writes when rows are updated', async ({ page }) => {
    await page.click('.tab-btn[data-tab="automation"]');
    await page.evaluate(() => {
      const header = [
        'Name', 'Google Place ID', 'Website', 'Tags', 'Drive Time', 'Hours of Operation', 'Activity Duration', 'Difficulty', 'Trail Length',
        'State', 'City', 'Address', 'Phone Number', 'Google Rating', 'Cost', 'Directions', 'Description', 'Nearby', 'Links', 'Links2',
        'Notes', 'My Rating', 'Favorite', 'Google URL'
      ];
      const indexMap = Object.fromEntries(header.map((name, index) => [name, index]));
      window.getColumnIndexByName = (primary, aliases = []) => {
        const candidates = [primary].concat(Array.isArray(aliases) ? aliases : []).map((value) => String(value || '').trim().toLowerCase());
        const found = Object.keys(indexMap).find((name) => candidates.includes(String(name || '').trim().toLowerCase()));
        return found == null ? -1 : indexMap[found];
      };

      const row = new Array(header.length).fill('');
      row[0] = 'Playwright Mountain Trail Cafe';
      row[1] = 'ChIJPlaywrightPersist123';
      row[9] = 'NC';
      row[10] = 'Asheville';
      row[11] = '123 Persist Lane, Asheville, NC 28801';
      window.adventuresData = [{ values: [row] }];

      window.__saveCalls = 0;
      window.__saveRows = [];
      window.saveToExcel = async (rowIndex, values) => {
        window.__saveCalls += 1;
        if (typeof rowIndex === 'number' && Array.isArray(values)) {
          window.__saveRows.push({ rowIndex, values: values.slice() });
          return { persisted: true, verified: true, rowRef: `itemAt(index=${rowIndex})` };
        }
        return true;
      };

      window.getPlaceDetails = async () => ({
        website: 'https://playwright-persist.example',
        phone: '(555) 555-0100',
        hours: { Monday: '8:00 AM - 4:00 PM' },
        address: '123 Persist Lane, Asheville, NC 28801',
        rating: 4.7,
        description: 'Persisted automation description.',
        reviews: []
      });

      if (!window.tagManager) {
        window.tagManager = {
          addTagsToPlace: () => 1,
          getTagsForPlace: () => []
        };
      }
    });

    await page.evaluate(async (keys) => {
      const mount = document.createElement('div');
      document.body.appendChild(mount);
      window[keys.populatePersist] = await window.handlePopulateMissingFields(mount, false);
      // Reset hours cell so the hours handler still has something to write
      // (handlePopulateMissingFields already populated it; the refresh-all optimisation
      // would otherwise skip rows whose value already matches Google).
      if (window.adventuresData?.[0]?.values?.[0]) {
        const hoursIdx = typeof window.getColumnIndexByName === 'function'
          ? Number(window.getColumnIndexByName('Hours of Operation', ['Hours'])) : 5;
        if (hoursIdx >= 0) window.adventuresData[0].values[0][hoursIdx] = '';
      }
      window[keys.hoursPersist] = await window.handleUpdateHoursOnly(mount, false);
      window[keys.tagPersist] = await window.autoTagAllLocationsUnified({ dryRun: false });
    }, {
      populatePersist: RESULT_KEYS.POPULATE_PERSIST_RESULT,
      hoursPersist: RESULT_KEYS.HOURS_PERSIST_RESULT,
      tagPersist: RESULT_KEYS.TAG_PERSIST_RESULT
    });

    await expect.poll(() => page.evaluate(() => Number(window.__saveCalls || 0)), { timeout: 10000 }).toBeGreaterThanOrEqual(2);
    await expect.poll(() => page.evaluate(() => window.__saveRows || []), { timeout: 10000 })
      .toEqual(expect.arrayContaining([
        expect.objectContaining({ rowIndex: 0 })
      ]));
    await expect.poll(() => page.evaluate(() => String(window.adventuresData?.[0]?.values?.[0]?.[2] || '')), { timeout: 10000 })
      .toContain('playwright-persist.example');
    await expect.poll(() => page.evaluate(() => String(window.adventuresData?.[0]?.values?.[0]?.[5] || '')), { timeout: 10000 })
      .toContain('Monday');
    await expect.poll(() => page.evaluate(() => String(window.adventuresData?.[0]?.values?.[0]?.[3] || '')), { timeout: 10000 })
      .not.toBe('');

    await page.evaluate(async () => {
      const mount = document.createElement('div');
      document.body.appendChild(mount);
      window.__diagResult = await window.handleUpdateAllDescriptions(mount, false, false);
      if (typeof window.renderAutomationWriteDiagnostics === 'function') {
        const writeDiagPayload = {
          success: true,
          persisted: true,
          persistMode: 'saveToExcel-row-patch',
          persistReason: '',
          processedTargets: 1,
          persistedTargets: 1,
          rowsChanged: 1,
          persistedRows: 1,
          verifiedRowsChanged: 1,
          verificationMode: 'row-reread',
          verificationReason: '',
          dryRun: false,
          failedTargets: 0
        };
        window.renderAutomationWriteDiagnostics('desc-write-diagnostics', writeDiagPayload);
        window.renderAutomationWriteDiagnostics('force-update-write-diagnostics', writeDiagPayload);
        if (typeof window.appendDescriptionColumnDiagnosticsSuffix === 'function') {
          window.appendDescriptionColumnDiagnosticsSuffix('hours-write-diagnostics', {
            persisted: true,
            processedTargets: 1,
            persistedTargets: 1,
            rowsChanged: 1,
            persistedRows: 1,
            verifiedRowsChanged: 1,
            verificationMode: 'row-reread',
            dryRun: false,
            failedTargets: 0,
            descriptionIndex: 16,
            descriptionColumnName: 'Description'
          });
          window.appendDescriptionColumnDiagnosticsSuffix('force-update-write-diagnostics', {
            descriptionIndex: 16,
            descriptionColumnName: 'Description'
          });
        }
      }
    });

    await expect.poll(() => page.locator('#desc-write-diagnostics').innerText(), { timeout: 10000 })
      .toContain('saved to Excel');
    await assertRowRereadSuccess(page, RESULT_KEYS.POPULATE_PERSIST_RESULT, { rowsChanged: 1, verifiedRowsChanged: 1, postWriteVerified: true });
    await assertRowRereadSuccess(page, RESULT_KEYS.HOURS_PERSIST_RESULT, { rowsChanged: 1, verifiedRowsChanged: 1, postWriteVerified: true });
    await assertRowRereadSuccess(page, RESULT_KEYS.TAG_PERSIST_RESULT, { rowsChanged: 1, verifiedRowsChanged: 1, postWriteVerified: true });
    await expect.poll(() => page.locator('#desc-write-diagnostics').innerText(), { timeout: 10000 })
      .toContain('1 row changed');
    await expect.poll(() => page.locator('#desc-write-diagnostics').innerText(), { timeout: 10000 })
      .toContain('verified 1/1 row');
    await expect.poll(() => page.locator('#hours-write-diagnostics').innerText(), { timeout: 10000 })
      .toMatch(/Description column:\s*index\s*16\s*\(Description\)/i);
    await expect.poll(() => page.locator('#force-update-write-diagnostics').innerText(), { timeout: 10000 })
      .toContain('saved to Excel');
    await expect.poll(() => page.locator('#force-update-write-diagnostics').innerText(), { timeout: 10000 })
      .toMatch(/Description column:\s*index\s*16\s*\(Description\)/i);
  });

  test('update hours normalizes stringified JSON payloads before persisting', async ({ page }) => {
    await page.click('.tab-btn[data-tab="automation"]');
    await page.evaluate(() => {
      const header = [
        'Name', 'Google Place ID', 'Website', 'Tags', 'Drive Time', 'Hours of Operation', 'Activity Duration', 'Difficulty', 'Trail Length',
        'State', 'City', 'Address', 'Phone Number', 'Google Rating', 'Cost', 'Directions', 'Description', 'Nearby', 'Links', 'Links2',
        'Notes', 'My Rating', 'Favorite', 'Google URL'
      ];
      const indexMap = Object.fromEntries(header.map((name, index) => [name, index]));
      window.getColumnIndexByName = (primary, aliases = []) => {
        const candidates = [primary].concat(Array.isArray(aliases) ? aliases : []).map((value) => String(value || '').trim().toLowerCase());
        const found = Object.keys(indexMap).find((name) => candidates.includes(String(name || '').trim().toLowerCase()));
        return found == null ? -1 : indexMap[found];
      };

      const row = new Array(header.length).fill('');
      row[0] = 'Playwright JSON Hours Cafe';
      row[1] = 'ChIJJsonHoursCafe123';
      row[9] = 'NC';
      row[10] = 'Durham';
      row[11] = '123 JSON Hours Way, Durham, NC 27701';
      window.adventuresData = [{ values: [row] }];

      window.saveToExcel = async () => ({ persisted: true, verified: true });
      const serializedHours = JSON.stringify({
        periods: [{ open: { day: 1, hour: 7, minute: 30 }, close: { day: 1, hour: 12, minute: 0 } }],
        weekdayDescriptions: [
          'Monday: 7:30 AM - 12:00 PM',
          'Tuesday: 7:30 AM - 3:30 PM',
          'Wednesday: 7:30 AM - 3:30 PM'
        ],
        specialDays: []
      });
      window.getPlaceDetails = async () => ({
        hours: serializedHours,
        reviews: []
      });
    });

    await page.evaluate(async () => {
      const mount = document.createElement('div');
      document.body.appendChild(mount);
      window.__jsonHoursResult = await window.handleUpdateHoursOnly(mount, false, { updateMode: 'refresh-all' });
    });

    await expect.poll(() => page.evaluate(() => String(window.adventuresData?.[0]?.values?.[0]?.[5] || '')), { timeout: 10000 })
      .toContain('Monday: 7:30 AM - 12:00 PM');
    await expect.poll(() => page.evaluate(() => String(window.adventuresData?.[0]?.values?.[0]?.[5] || '')), { timeout: 10000 })
      .not.toContain('{"periods"');
    await expect.poll(() => page.evaluate(() => window.__jsonHoursResult), { timeout: 10000 })
      .toMatchObject({ success: true, updatedCount: 1 });
  });

  test('refresh place ids normalizes structured JSON hours into readable text', async ({ page }) => {
    await page.click('.tab-btn[data-tab="automation"]');
    await page.evaluate(() => {
      const header = [
        'Name', 'Google Place ID', 'Website', 'Tags', 'Drive Time', 'Hours of Operation', 'Activity Duration', 'Difficulty', 'Trail Length',
        'State', 'City', 'Address', 'Phone Number', 'Google Rating', 'Cost', 'Directions', 'Description', 'Nearby', 'Links', 'Links2',
        'Notes', 'My Rating', 'Favorite', 'Google URL'
      ];
      const indexMap = Object.fromEntries(header.map((name, index) => [name, index]));
      window.getColumnIndexByName = (primary, aliases = []) => {
        const candidates = [primary].concat(Array.isArray(aliases) ? aliases : []).map((value) => String(value || '').trim().toLowerCase());
        const found = Object.keys(indexMap).find((name) => candidates.includes(String(name || '').trim().toLowerCase()));
        return found == null ? -1 : indexMap[found];
      };

      const row = new Array(header.length).fill('');
      row[0] = 'Playwright Refresh JSON Hours Cafe';
      row[1] = 'ChIJRefreshJsonHours123';
      row[9] = 'NC';
      row[10] = 'Durham';
      row[11] = '321 Refresh Way, Durham, NC 27701';
      window.adventuresData = [{ values: [row] }];

      window.saveToExcel = async () => ({ persisted: true, verified: true });
      const serializedHours = JSON.stringify({
        periods: [
          { open: { day: 0, hour: 15, minute: 0 }, close: { day: 0, hour: 23, minute: 0 } },
          { open: { day: 1, hour: 7, minute: 0 }, close: { day: 1, hour: 22, minute: 0 } }
        ],
        weekdayDescriptions: [
          'Monday: 7:00 AM - 10:00 PM',
          'Sunday: 3:00 PM - 11:00 PM'
        ],
        specialDays: []
      });
      window.getPlaceDetails = async () => ({
        placeId: 'ChIJRefreshJsonHours123',
        hours: serializedHours,
        website: '',
        phone: '',
        address: '321 Refresh Way, Durham, NC 27701',
        rating: '',
        reviews: []
      });
    });

    await page.evaluate(async () => {
      window.__refreshJsonHoursResult = await window.refreshPlaceIdsWithProgress(false, { updateMode: 'refresh-all' });
    });

    await expect.poll(() => page.evaluate(() => String(window.adventuresData?.[0]?.values?.[0]?.[5] || '')), { timeout: 10000 })
      .toContain('Monday: 7:00 AM - 10:00 PM');
    await expect.poll(() => page.evaluate(() => String(window.adventuresData?.[0]?.values?.[0]?.[5] || '')), { timeout: 10000 })
      .not.toContain('"periods"');
    await expect.poll(() => page.evaluate(() => window.__refreshJsonHoursResult), { timeout: 10000 })
      .toMatchObject({ success: true });
  });

  test('remove exact duplicates only removes rows with same name and same address', async ({ page }) => {
    await page.click('.tab-btn[data-tab="automation"]');
    await page.evaluate(() => {
      const activeCols = typeof window.getActiveCols === 'function'
        ? window.getActiveCols(window)
        : { NAME: 0, PLACE_ID: 1, ADDRESS: 11 };
      const header = [
        'Name', 'Google Place ID', 'Website', 'Tags', 'Drive Time', 'Hours of Operation', 'Activity Duration', 'Difficulty', 'Trail Length',
        'State', 'City', 'Address', 'Phone Number', 'Google Rating', 'Cost', 'Directions', 'Description', 'Nearby', 'Links', 'Links2',
        'Notes', 'My Rating', 'Favorite', 'Google URL'
      ];
      const rowA = new Array(header.length).fill('');
      rowA[activeCols.NAME] = 'Playwright Duplicate Cafe';
      rowA[activeCols.ADDRESS] = '100 Same St, Durham, NC';
      rowA[activeCols.PLACE_ID] = 'ChIJDupA';

      const rowB = new Array(header.length).fill('');
      rowB[activeCols.NAME] = 'Playwright Duplicate Cafe';
      rowB[activeCols.ADDRESS] = '100 Same St, Durham, NC';
      rowB[activeCols.PLACE_ID] = 'ChIJDupB';

      const rowC = new Array(header.length).fill('');
      rowC[activeCols.NAME] = 'Playwright Duplicate Cafe';
      rowC[activeCols.ADDRESS] = '200 Different Ave, Durham, NC';
      rowC[activeCols.PLACE_ID] = 'ChIJDupC';

      window.adventuresData = [
        { values: [rowA] },
        { values: [rowB] },
        { values: [rowC] }
      ];
      window.__dedupeSaveCalls = 0;
      window.saveToExcel = async () => {
        window.__dedupeSaveCalls += 1;
        return true;
      };
    });

    await page.evaluate(async () => {
      const mount = document.createElement('div');
      document.body.appendChild(mount);
      window.__dedupeResult = await window.handleRemoveExactDuplicates(mount, false);
    });

    await expect.poll(() => page.evaluate(() => Number(window.__dedupeSaveCalls || 0)), { timeout: 10000 }).toBe(1);
    await expect.poll(() => page.evaluate(() => window.adventuresData.length), { timeout: 10000 }).toBe(2);
    await expect.poll(() => page.evaluate(() => {
      const activeCols = typeof window.getActiveCols === 'function'
        ? window.getActiveCols(window)
        : { ADDRESS: 11 };
      return window.adventuresData.map((entry) => String(entry?.values?.[0]?.[activeCols.ADDRESS] || ''));
    }), { timeout: 10000 })
      .toEqual(expect.arrayContaining(['100 Same St, Durham, NC', '200 Different Ave, Durham, NC']));
    await expect.poll(() => page.evaluate(() => window.__dedupeResult), { timeout: 10000 })
      .toMatchObject({ success: true, rowsChanged: 1, persistedRows: 1 });
  });

  test('remove exact duplicates chip updates after dry-run and real run', async ({ page }) => {
    await page.click('.tab-btn[data-tab="automation"]');
    await expandTabCardsIfAvailable(page, 'automation');
    await page.evaluate(() => {
      const activeCols = typeof window.getActiveCols === 'function'
        ? window.getActiveCols(window)
        : { NAME: 0, PLACE_ID: 1, ADDRESS: 11 };
      const header = [
        'Name', 'Google Place ID', 'Website', 'Tags', 'Drive Time', 'Hours of Operation', 'Activity Duration', 'Difficulty', 'Trail Length',
        'State', 'City', 'Address', 'Phone Number', 'Google Rating', 'Cost', 'Directions', 'Description', 'Nearby', 'Links', 'Links2',
        'Notes', 'My Rating', 'Favorite', 'Google URL'
      ];
      const rowA = new Array(header.length).fill('');
      rowA[activeCols.NAME] = 'Playwright Dedupe Chip Cafe';
      rowA[activeCols.ADDRESS] = '300 Chip St, Durham, NC';
      rowA[activeCols.PLACE_ID] = 'ChIJDedupeChipA';

      const rowB = new Array(header.length).fill('');
      rowB[activeCols.NAME] = 'Playwright Dedupe Chip Cafe';
      rowB[activeCols.ADDRESS] = '300 Chip St, Durham, NC';
      rowB[activeCols.PLACE_ID] = 'ChIJDedupeChipB';

      window.adventuresData = [
        { values: [rowA] },
        { values: [rowB] }
      ];
      window.probeTargetSchema = async () => true;
      window.loadTargetRows = async () => true;
      window.__dedupeChipSaveCalls = 0;
      window.saveToExcel = async () => {
        window.__dedupeChipSaveCalls += 1;
        return true;
      };
      window.confirm = () => true;
    });

    await page.evaluate(async () => {
      const toggle = document.getElementById('dedupeDryRun');
      if (toggle) {
        toggle.checked = true;
        toggle.dispatchEvent(new Event('change', { bubbles: true }));
      }
      await window.submitRemoveExactDuplicates();
    });
    await expect.poll(() => page.evaluate(() => String(document.getElementById('dupesRemovedCountChip')?.textContent || '').trim()), { timeout: 10000 })
      .toBe('Would remove: 1');
    await expect.poll(() => page.evaluate(() => {
      const chip = document.getElementById('dupesRemovedCountChip');
      return {
        dryRun: !!chip?.classList?.contains('is-dry-run'),
        success: !!chip?.classList?.contains('is-success')
      };
    }), { timeout: 10000 }).toMatchObject({ dryRun: true, success: false });

    await page.evaluate(async () => {
      const toggle = document.getElementById('dedupeDryRun');
      if (toggle) {
        toggle.checked = false;
        toggle.dispatchEvent(new Event('change', { bubbles: true }));
      }
      await window.submitRemoveExactDuplicates();
    });
    await expect.poll(() => page.evaluate(() => String(document.getElementById('dupesRemovedCountChip')?.textContent || '').trim()), { timeout: 10000 })
      .toBe('Removed: 1');
    await expect.poll(() => page.evaluate(() => {
      const chip = document.getElementById('dupesRemovedCountChip');
      return {
        dryRun: !!chip?.classList?.contains('is-dry-run'),
        success: !!chip?.classList?.contains('is-success')
      };
    }), { timeout: 10000 }).toMatchObject({ dryRun: false, success: true });

    await page.evaluate(async () => {
      const toggle = document.getElementById('dedupeDryRun');
      if (toggle) {
        toggle.checked = false;
        toggle.dispatchEvent(new Event('change', { bubbles: true }));
      }
      await window.submitRemoveExactDuplicates();
    });
    await expect.poll(() => page.evaluate(() => String(document.getElementById('dupesRemovedCountChip')?.textContent || '').trim()), { timeout: 10000 })
      .toBe('Removed: 0');
    await expect.poll(() => page.evaluate(() => {
      const chip = document.getElementById('dupesRemovedCountChip');
      return {
        dryRun: !!chip?.classList?.contains('is-dry-run'),
        success: !!chip?.classList?.contains('is-success')
      };
    }), { timeout: 10000 }).toMatchObject({ dryRun: false, success: false });
    await expect.poll(() => page.evaluate(() => Number(window.__dedupeChipSaveCalls || 0)), { timeout: 10000 }).toBe(1);
  });

  test('automation row persistence prefers workbook row ids when available', async ({ page }) => {
    await page.click('.tab-btn[data-tab="automation"]');
    await page.evaluate(() => {
      const header = [
        'Name', 'Google Place ID', 'Website', 'Tags', 'Drive Time', 'Hours of Operation', 'Activity Duration', 'Difficulty', 'Trail Length',
        'State', 'City', 'Address', 'Phone Number', 'Google Rating', 'Cost', 'Directions', 'Description', 'Nearby', 'Links', 'Links2',
        'Notes', 'My Rating', 'Favorite', 'Google URL'
      ];
      const indexMap = Object.fromEntries(header.map((name, index) => [name, index]));
      window.getColumnIndexByName = (primary, aliases = []) => {
        const candidates = [primary].concat(Array.isArray(aliases) ? aliases : []).map((value) => String(value || '').trim().toLowerCase());
        const found = Object.keys(indexMap).find((name) => candidates.includes(String(name || '').trim().toLowerCase()));
        return found == null ? -1 : indexMap[found];
      };

      const row = new Array(header.length).fill('');
      row[0] = 'Playwright Row ID Preserve';
      row[1] = 'ChIJPlaywrightPersistRowId123';
      row[9] = 'NC';
      row[10] = 'Asheville';
      row[11] = '456 Stable Row Lane, Asheville, NC 28801';
      window.adventuresData = [{ id: 'row-guid-123', values: [row] }];

      window.__saveRowsById = [];
      window.saveToExcel = async (rowRef, values) => {
        window.__saveRowsById.push({ rowRef, values: Array.isArray(values) ? values.slice() : [] });
        return { persisted: true, verified: true, rowRef: String(rowRef) };
      };

      window.getPlaceDetails = async () => ({
        description: 'Persisted via stable workbook row id.',
        reviews: []
      });
    });

    await page.evaluate(async () => {
      const mount = document.createElement('div');
      document.body.appendChild(mount);
      window.__descriptionPersistById = await window.handleUpdateAllDescriptions(mount, false, false);
    });

    await expect.poll(() => page.evaluate(() => String(window.__saveRowsById?.[0]?.rowRef || '')), { timeout: 10000 })
      .toBe('row-guid-123');
    await expect.poll(() => page.evaluate(() => window.__descriptionPersistById), { timeout: 10000 })
      .toMatchObject({ rowsChanged: 1, persistedRows: 1, verifiedRowsChanged: 1, postWriteVerified: true });
  });

  test('Add Places includes Festival Sources config flow with back navigation and persistence', async ({ page }) => {
    await expect(page.locator('#openFestivalSourcesConfigBtn')).toBeVisible();
    await expect(page.locator('#festivalSourcesTabBadge')).toContainText(/providers enabled/i);
    await page.click('#openFestivalSourcesConfigBtn');
    await expect(page.locator('#festival-tab')).toHaveClass(/active/);
    await expect(page.locator('#dedupeBulkInputNowBtn')).toBeVisible();
    await expect(page.locator('#resetTargetStarterRecommendationsBtn')).toBeVisible();
    await expect(page.locator('#targetStarterOfficialOnlyToggle')).toBeVisible();
    await expect(page.locator('#targetStarterRecommendations')).toHaveValue(/alltrails\.com/i);
    await expect(page.locator('#targetStarterRecommendations')).toHaveValue(/\[community\]/i);
    await page.check('#targetStarterOfficialOnlyToggle');
    await expect(page.locator('#targetStarterRecommendations')).not.toHaveValue(/\[community\]/i);
    await expect(page.locator('#targetStarterRecommendations')).toHaveValue(/\[official\]/i);
    await page.uncheck('#targetStarterOfficialOnlyToggle');

    await page.click('#tab-btn-places');
    await expect(page.locator('#places-tab')).toHaveClass(/active/);
    await page.selectOption('#actionTargetSelect', 'nature_locations');
    await page.click('#tab-btn-festival');
    await expect(page.locator('#festival-tab')).toHaveClass(/active/);
    await expect(page.locator('#targetStarterRecommendations')).toHaveValue(/alltrails\.com/i);
    await page.evaluate(() => {
      const bulk = document.getElementById('bulkInput');
      if (bulk) bulk.value = 'Line A\nLine A\nLine B';
    });
    await page.click('#dedupeBulkInputNowBtn');
    await expect.poll(() => page.evaluate(() => String(document.getElementById('bulkInput')?.value || ''))).toBe('Line A\nLine B');

    await page.evaluate(() => {
      const area = document.getElementById('targetStarterRecommendations');
      if (area) area.value = '';
    });
    await page.click('#resetTargetStarterRecommendationsBtn');
    await expect(page.locator('#targetStarterRecommendations')).toHaveValue(/alltrails\.com/i);

    await page.click('#appendTargetStarterRecommendationsBtn');
    await expect.poll(() => page.evaluate(() => String(document.getElementById('bulkInput')?.value || ''))).toMatch(/alltrails\.com/i);

    await page.click('#tab-btn-places');
    await expect(page.locator('#places-tab')).toHaveClass(/active/);
    await page.selectOption('#actionTargetSelect', 'ent_festivals');
    await page.click('#tab-btn-festival');
    await expect(page.locator('#festival-tab')).toHaveClass(/active/);
    await expect(page.locator('#targetStarterRecommendations')).toHaveValue(/ncapplefestival\.org/i);

    await page.click('#festivalSourcesBackToPlacesBtn');
    await expect(page.locator('#places-tab')).toHaveClass(/active/);
    await expect(page.locator('#festival-tab')).not.toHaveClass(/active/);

    await page.click('#openFestivalSourcesConfigBtn');
    await expect(page.locator('#festival-tab')).toHaveClass(/active/);
    await expandTabCardsIfAvailable(page, 'festival');
    await expect(page.locator('#festivalAppliedConfigBadge')).toBeVisible();
    await page.click('#toggleFestivalSourcesSummaryBtn');
    await expect(page.locator('#festivalAppliedConfigSummary')).toBeVisible();
    await expect(page.locator('#festivalAppliedConfigSummary')).toContainText('Enabled:');
    await page.click('#toggleFestivalSourcesSummaryBtn');
    await expect(page.locator('#festivalAppliedConfigSummary')).toBeHidden();
    await expect(page.locator('#festivalSourcesConfigCard .card-title')).toBeVisible();
    await expect(page.locator('#festivalProviderTicketmasterEnabled')).toBeChecked();
    await expect(page.locator('#festivalProviderOfficialEnabled')).toBeChecked();
    await expect(page.locator('#festivalProviderChamberEnabled')).toBeChecked();
    await expect(page.locator('#festivalLoadStarterFeedsBtn')).toBeVisible();
    await expect(page.locator('#festivalValidateFeedsBtn')).toBeVisible();

    await page.click('#festivalLoadStarterFeedsBtn');
    await expect(page.locator('#festivalOfficialCalendarsFeeds')).toHaveValue(/\[official\].*ncapplefestival\.org\/feed/i);
    await expect(page.locator('#festivalChamberFeeds')).toHaveValue(/\[chamber\].*southernhighlandguild\.org\/events\/feed/i);

    await page.route('**/playwright-feed-live.xml', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/xml',
        body: '<rss><channel><item><title>Apple Fest</title></item></channel></rss>'
      });
    });
    await page.route('**/playwright-feed-empty.xml', async (route) => {
      await route.fulfill({ status: 200, contentType: 'text/plain', body: 'No events available.' });
    });
    await page.fill('#festivalOfficialCalendarsFeeds', [
      '[official] Live Feed|http://127.0.0.1:4173/playwright-feed-live.xml',
      '[official] Empty Feed|http://127.0.0.1:4173/playwright-feed-empty.xml'
    ].join('\n'));
    await page.fill('#festivalChamberFeeds', '[chamber] Blocked Feed|http://');
    await page.click('#festivalValidateFeedsBtn');
    await expect(page.locator('#festivalFeedValidationSummary')).toContainText(/live 1/i);
    await expect(page.locator('#festivalFeedValidationSummary')).toContainText(/blocked 1/i);
    await expect(page.locator('#festivalFeedValidationSummary')).toContainText(/empty 1/i);

    await page.fill('#festivalOfficialCalendarsFeeds', 'Visit NC|https://example.com/nc-events.rss');
    await page.fill('#festivalChamberFeeds', 'Hendo Chamber|https://example.com/chamber.ics');
    await page.uncheck('#festivalProviderTicketmasterEnabled');
    await page.check('#festivalProviderEventbriteEnabled');
    await page.uncheck('#festivalProviderChamberEnabled');
    await page.selectOption('#festivalSourceMaxResults', '12');
    await expect(page.locator('#festivalSourcesBackDirtyDot')).toBeVisible();

    await page.evaluate(() => {
      window.__festivalConfirmResponses = [false];
      window.__festivalConfirmMessage = '';
      window.confirm = (message) => {
        window.__festivalConfirmMessage = String(message || '');
        const queue = Array.isArray(window.__festivalConfirmResponses) ? window.__festivalConfirmResponses : [];
        return queue.length ? Boolean(queue.shift()) : true;
      };
    });
    await page.click('#festivalSourcesBackToPlacesBtn');
    await expect.poll(async () => page.evaluate(() => String(window.__festivalConfirmMessage || ''))).toContain('unsaved Festival Sources changes');
    await expect(page.locator('#festivalSourcesConfigPage')).toBeVisible();

    await page.click('#festivalSaveSourcesBtn');
    await expect(page.locator('#festival-sources-status')).toContainText('saved and applied');
    await expect(page.locator('#festivalSourcesBackDirtyDot')).toBeHidden();

    await page.click('#festivalSourcesBackToPlacesBtn');
    await expect(page.locator('#places-tab')).toHaveClass(/active/);
    await expect(page.locator('#festivalAppliedConfigBadge')).toContainText('2 providers enabled');
    await expect(page.locator('#festivalAppliedConfigBadge')).toContainText('max 12');
    await expect(page.locator('#festivalSourcesTabBadge')).toContainText('2 providers enabled');

    await page.click('#openFestivalSourcesConfigBtn');
    await expect(page.locator('#festival-tab')).toHaveClass(/active/);
    await page.click('#copyFestivalSourcesSummaryBtn');
    await expect(page.locator('#festivalAppliedConfigCopyStatus')).toBeVisible();
    await expect(page.locator('#festivalAppliedConfigCopyStatus')).toContainText(/copy|copied/i);

    await page.click('#festivalSourcesBackToPlacesBtn');
    await expect(page.locator('#places-tab')).toHaveClass(/active/);
    await expect(page.locator('#festivalAppliedConfigBadge')).toContainText('2 providers enabled');
    await expect(page.locator('#festivalAppliedConfigBadge')).toContainText('max 12');
    await expect(page.locator('#festivalSourcesTabBadge')).toContainText('2 providers enabled');
  });
});

