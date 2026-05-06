const { test, expect } = require('./reliability-test');

const favoriteColumns = ['Band_Name'];
const attendedColumns = ['Band_Name', 'Concert_Date'];
const upcomingColumns = ['Band_Name', 'Concert_Date'];
const rockvilleColumns = ['Rockville_Set_Id', 'Rockville_Day', 'Band', 'Stage', 'Set_Start_Time', 'Created_At', 'Updated_At'];

function makeColumns(names) {
  return { value: names.map((name, index) => ({ name, index })) };
}

function makeRows(rows) {
  return { value: rows.map((values, index) => ({ id: `row-${index}`, values: [values] })) };
}

async function mockConcertsGraph(context, options = {}) {
  const state = {
    rockvilleTableExists: options.rockvilleTableExists !== false,
    rockvilleRows: Array.isArray(options.initialRockvilleRows) ? options.initialRockvilleRows.slice() : [],
    addBodies: [],
    patchBodies: [],
    createdWorksheet: false,
    createdTable: false
  };

  await context.route('https://graph.microsoft.com/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    const respondJson = (status, payload) => route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(payload)
    });
    const postData = route.request().postData();
    const body = postData ? JSON.parse(postData) : null;

    if (url.includes('/tables/Favorite_Bands/columns')) return respondJson(200, makeColumns(favoriteColumns));
    if (url.includes('/tables/Favorite_Bands/rows')) return respondJson(200, makeRows([]));

    if (url.includes('/tables/Attended_Concerts/columns')) return respondJson(200, makeColumns(attendedColumns));
    if (url.includes('/tables/Attended_Concerts/rows')) return respondJson(200, makeRows([]));

    if (url.includes('/tables/Upcoming_Concerts/columns')) return respondJson(200, makeColumns(upcomingColumns));
    if (url.includes('/tables/Upcoming_Concerts/rows')) return respondJson(200, makeRows([]));

    if (url.includes('/tables/Rockville_2026_Sets/columns')) {
      if (!state.rockvilleTableExists) {
        return respondJson(404, { error: { code: 'ItemNotFound', message: 'Rockville table missing' } });
      }
      return respondJson(200, makeColumns(rockvilleColumns));
    }
    if (url.includes('/tables/Rockville_2026_Sets/rows') && method === 'GET') {
      if (!state.rockvilleTableExists) {
        return respondJson(404, { error: { code: 'ItemNotFound', message: 'Rockville table missing' } });
      }
      return respondJson(200, makeRows(state.rockvilleRows));
    }
    if (url.includes('/workbook/worksheets?$select=id,name,position')) {
      return respondJson(200, { value: [] });
    }
    if (url.includes('/workbook/worksheets/add') && method === 'POST') {
      state.createdWorksheet = true;
      return respondJson(200, { id: 'rockville-sheet-id', name: 'Rockville_2026' });
    }
    if (url.includes('/workbook/worksheets/') && url.includes('/range(') && method === 'PATCH') {
      return respondJson(200, { ok: true });
    }
    if (url.includes('/workbook/worksheets/') && url.includes('/tables/add') && method === 'POST') {
      state.createdTable = true;
      state.rockvilleTableExists = true;
      return respondJson(200, { name: 'Rockville_2026_Sets' });
    }
    if (url.includes('/tables/Rockville_2026_Sets/rows/add') && method === 'POST') {
      state.addBodies.push(body);
      const values = body && Array.isArray(body.values) && Array.isArray(body.values[0]) ? body.values[0] : [];
      state.rockvilleRows.push(values);
      return respondJson(200, { ok: true });
    }
    if (url.includes('/tables/Rockville_2026_Sets/rows/itemAt(index=') && method === 'PATCH') {
      state.patchBodies.push(body);
      const match = url.match(/itemAt\(index=(\d+)\)/);
      const index = match ? Number(match[1]) : -1;
      const values = body && Array.isArray(body.values) && Array.isArray(body.values[0]) ? body.values[0] : [];
      if (index >= 0) state.rockvilleRows[index] = values;
      return respondJson(200, { ok: true });
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ value: [] })
    });
  });

  return state;
}

test.describe('Rockville 2026 and daily Add location flows', () => {
  test('Rockville 2026 supports day tabs plus add/edit set flows', async ({ page }) => {
    const graphState = await mockConcertsGraph(page.context(), { rockvilleTableExists: false });
    await page.addInitScript(() => {
      window.accessToken = 'test-access-token';
    });

    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('householdConcertsRockville2026V1');
      if (typeof window.setAppMode === 'function') {
        window.setAppMode('advanced');
      } else {
        document.documentElement.setAttribute('data-app-mode', 'advanced');
      }
    });

    await page.locator('.app-tab-btn[data-tab="visited-locations"]').click();
    await expect(page.locator('#visitedProgressTab-concerts')).toBeVisible();
    await page.locator('#visitedProgressTab-concerts').click();

    await expect(page.locator('[data-concert-action="open-rockville-2026"]')).toBeVisible();
    await page.locator('[data-concert-action="open-rockville-2026"]').click();

    await expect(page.locator('#householdConcertsRockvilleMount .household-concerts-rockville-page')).toBeVisible();
    await expect(page.locator('#householdConcertsMainContent')).toBeHidden();
    await expect(page.locator('#householdConcertsRockvilleMount .household-concerts-rockville-day-tab')).toHaveCount(4);
    await expect(page.locator('#householdConcertsRockvilleMount .household-concerts-rockville-day-tab.active')).toContainText('Thursday');
    await expect(page.locator('#householdConcertsRockvilleSyncBadge')).toBeVisible();

    await page.locator('[data-concert-action="open-rockville-set-form"]').click();
    await expect(page.locator('#householdConcertsRockvilleSetForm')).toBeVisible();
    await page.locator('#householdConcertsRockvilleSetBandInput').fill('Bad Omens');
    await page.locator('input[name="Stage"]').fill('Apex Stage');
    await page.locator('input[name="Set_Start_Time"]').fill('18:30');
    await page.locator('#householdConcertsRockvilleSetForm button[type="submit"]').click();

    await expect.poll(() => graphState.createdTable).toBe(true);
    await expect.poll(() => graphState.addBodies.length).toBe(1);
    await expect(page.locator('#householdConcertsRockvilleSyncBadge')).toContainText('Synced to Excel');
    await expect(page.locator('#householdConcertsRockvilleSyncBadge')).toContainText('Last synced');
    await expect(page.locator('#householdConcertsRockvilleSyncBadge')).toHaveAttribute('data-sync-mode', 'synced');
    await expect(page.locator('#householdConcertsRockvilleSyncBadge')).toHaveAttribute('title', /Latest Rockville 2026 changes are synced to Concerts_Bands\.xlsx\./);
    await expect(page.locator('#householdConcertsRockvilleSyncBadge [data-rockville-sync-icon="true"]')).toHaveText('✅');

    await expect(page.locator('#householdConcertsRockvilleMount tbody tr')).toContainText('Bad Omens');
    await expect(page.locator('#householdConcertsRockvilleMount tbody tr')).toContainText('Apex Stage');
    await expect(page.locator('#householdConcertsRockvilleMount tbody tr')).toContainText('18:30');

    await page.locator('#householdConcertsRockvilleMount [data-concert-action="edit-rockville-set"]').click();
    await expect(page.locator('#householdConcertsRockvilleSetForm')).toBeVisible();
    await page.locator('input[name="Stage"]').fill('Monster Energy Stage');
    await page.locator('input[name="Set_Start_Time"]').fill('19:15');
    await page.locator('#householdConcertsRockvilleSetForm button[type="submit"]').click();

    await expect.poll(() => graphState.patchBodies.length).toBe(1);

    await expect(page.locator('#householdConcertsRockvilleMount tbody tr')).toContainText('Monster Energy Stage');
    await expect(page.locator('#householdConcertsRockvilleMount tbody tr')).toContainText('19:15');

    await page.evaluate(() => {
      localStorage.removeItem('householdConcertsRockville2026V1');
    });
    await page.reload();
    await page.evaluate(() => {
      if (typeof window.setAppMode === 'function') {
        window.setAppMode('advanced');
      } else {
        document.documentElement.setAttribute('data-app-mode', 'advanced');
      }
    });

    await page.locator('.app-tab-btn[data-tab="visited-locations"]').click();
    await page.locator('#visitedProgressTab-concerts').click();
    await page.locator('[data-concert-action="open-rockville-2026"]').click();

    await expect(page.locator('#householdConcertsRockvilleSyncBadge')).toContainText('Synced to Excel');
    await expect(page.locator('#householdConcertsRockvilleSyncBadge')).toContainText('Last synced');
    await expect(page.locator('#householdConcertsRockvilleMount tbody tr')).toContainText('Bad Omens');
    await expect(page.locator('#householdConcertsRockvilleMount tbody tr')).toContainText('Monster Energy Stage');
    await expect(page.locator('#householdConcertsRockvilleMount tbody tr')).toContainText('19:15');
  });

  test('daily all-locations Add location opens simplified bulk add mode', async ({ page }) => {
    await mockConcertsGraph(page.context());

    await page.goto('/');
    await page.evaluate(() => {
      if (typeof window.setAppMode === 'function') {
        window.setAppMode('daily');
      } else {
        document.documentElement.removeAttribute('data-app-mode');
      }
    });

    await page.locator('.app-tab-btn[data-tab="visited-locations"]').click();
    await expect(page.locator('#visitedAllLocationsAddLocationBtn')).toBeVisible();

    const popupPromise = page.waitForEvent('popup');
    await page.locator('#visitedAllLocationsAddLocationBtn').click();
    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');
    await popup.waitForFunction(() => {
      const select = document.getElementById('actionTargetSelect');
      return select && select.options.length === 6;
    }, null, { timeout: 15000 });

    await expect(popup.locator('#actionTargetSelectLabel')).toContainText('Choose which table to add these places to');
    await expect(popup.locator('#bulkInputType')).toHaveValue('placeName');
    await expect(popup.locator('#bulkInputType')).toBeDisabled();
    await expect(popup.locator('#candidateSearchFiltersCard')).toBeHidden();
    await expect(popup.locator('#addSingleCard')).toBeHidden();
    await expect(popup.locator('#chainAddCard')).toBeHidden();
    await expect(popup.locator('#bulkSearchFiltersBtn')).toBeHidden();
    await expect(popup.locator('#bulkDryRunToggle')).toBeHidden();
    await expect(popup.locator('#bulkPreflightStatus')).toBeHidden();
    await expect(popup.locator('#bulkSubmitBtn')).toHaveText('Save Locations');

    const optionTexts = await popup.locator('#actionTargetSelect option').allTextContents();
    expect(optionTexts.map((text) => text.trim())).toEqual([
      'Entertainment',
      'Wildlife and Animals',
      'Restaurants',
      'Coffee Shops',
      'Nature Sites',
      'Retail Stores'
    ]);
  });
});

