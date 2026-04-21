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

// Navigate directly to the edit-mode page (no auth required for UI smoke).
async function gotoEditMode(page) {
  await page.goto('/HTML Files/edit-mode-enhanced.html');
  // Wait for the target selectors to be populated by initTargetSelectors().
  await page.waitForFunction(() => {
    const sel = document.getElementById('actionTargetSelect');
    return sel && sel.options.length >= 7;
  }, { timeout: 10000 });
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
    // The chip should now mention Retail
    const chipText = await chipGrid.innerText();
    expect(chipText).toContain('Retail_Food_and_Drink.xlsx / Retail');
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

  test('automation tab includes Festival Sources config panel and persists settings', async ({ page }) => {
    await page.click('.tab-btn[data-tab="automation"]');

    await expect(page.locator('.card-title', { hasText: 'Festival Sources' })).toBeVisible();
    await expect(page.locator('#festivalProviderTicketmasterEnabled')).toBeChecked();
    await expect(page.locator('#festivalProviderOfficialEnabled')).toBeChecked();
    await expect(page.locator('#festivalProviderChamberEnabled')).toBeChecked();
    await expect(page.locator('#festivalLoadStarterFeedsBtn')).toBeVisible();

    await page.click('#festivalLoadStarterFeedsBtn');
    await expect(page.locator('#festivalOfficialCalendarsFeeds')).toHaveValue(/ncapplefestival\.org\/feed/i);
    await expect(page.locator('#festivalChamberFeeds')).toHaveValue(/southernhighlandguild\.org\/events\/feed/i);

    await page.fill('#festivalOfficialCalendarsFeeds', 'Visit NC|https://example.com/nc-events.rss');
    await page.fill('#festivalChamberFeeds', 'Hendo Chamber|https://example.com/chamber.ics');
    await page.uncheck('#festivalProviderTicketmasterEnabled');
    await page.check('#festivalProviderEventbriteEnabled');
    await page.click('#festivalSaveSourcesBtn');
    await expect(page.locator('#festival-sources-status')).toContainText('saved and applied');

    await page.reload();
    await page.waitForFunction(() => {
      const sel = document.getElementById('actionTargetSelect');
      return sel && sel.options.length >= 7;
    }, { timeout: 10000 });
    await page.click('.tab-btn[data-tab="automation"]');

    await expect(page.locator('#festivalProviderTicketmasterEnabled')).not.toBeChecked();
    await expect(page.locator('#festivalProviderEventbriteEnabled')).toBeChecked();
    await expect(page.locator('#festivalOfficialCalendarsFeeds')).toHaveValue(/nc-events\.rss/);
    await expect(page.locator('#festivalChamberFeeds')).toHaveValue(/chamber\.ics/);

    await expect(page.locator('#festivalTestTicketmasterBtn')).toBeVisible();
    await expect(page.locator('#festivalTestEventbriteBtn')).toBeVisible();
    await expect(page.locator('#festivalTestFeedsBtn')).toBeVisible();
    await expect(page.locator('#festivalProviderOrderList [data-provider-key]')).toHaveCount(4);
    await expect(page.locator('#festivalProviderOrderList [data-provider-key]').first()).toHaveAttribute('data-provider-key', 'official_calendars');
    await expect(page.locator('#festivalWeightOfficial')).toHaveValue('1.5');

    await page.check('#festivalKeysVisibleToggle');
    await expect(page.locator('#festivalTicketmasterApiKey')).toHaveAttribute('type', 'text');

    await page.click('#festivalExportSourcesBtn');
    await expect(page.locator('#festivalSourcesJsonPayload')).toHaveValue(/"providers"/);

    await page.fill('#festivalSourcesJsonPayload', JSON.stringify({
      providers: { ticketmaster: true, eventbrite: true, officialCalendars: true, chamberFeeds: false },
      providerOrder: ['ticketmaster', 'eventbrite', 'official_calendars', 'chamber_feeds'],
      providerWeight: { ticketmaster: 2.0, eventbrite: 1.2, officialCalendars: 0.9, chamberFeeds: 0.8 }
    }));
    await page.click('#festivalImportSourcesBtn');
    await expect(page.locator('#festivalProviderEventbriteEnabled')).toBeChecked();
    await expect(page.locator('#festivalProviderChamberEnabled')).not.toBeChecked();
    await expect(page.locator('#festivalProviderOrderList [data-provider-key]').first()).toHaveAttribute('data-provider-key', 'ticketmaster');
    await expect(page.locator('#festivalWeightTicketmaster')).toHaveValue('2');
  });
});

