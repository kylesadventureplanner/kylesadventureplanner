const { test, expect } = require('./reliability-test');

async function mockConcertsGraph(context) {
  await context.route('https://graph.microsoft.com/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ value: [] })
    });
  });
}

test.describe('Rockville 2026 and daily Add location flows', () => {
  test('Rockville 2026 supports day tabs plus add/edit set flows', async ({ page }) => {
    await mockConcertsGraph(page.context());

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

    await page.locator('[data-concert-action="open-rockville-set-form"]').click();
    await expect(page.locator('#householdConcertsRockvilleSetForm')).toBeVisible();
    await page.locator('#householdConcertsRockvilleSetBandInput').fill('Bad Omens');
    await page.locator('input[name="Stage"]').fill('Apex Stage');
    await page.locator('input[name="Set_Start_Time"]').fill('18:30');
    await page.locator('#householdConcertsRockvilleSetForm button[type="submit"]').click();

    await expect(page.locator('#householdConcertsRockvilleMount tbody tr')).toContainText('Bad Omens');
    await expect(page.locator('#householdConcertsRockvilleMount tbody tr')).toContainText('Apex Stage');
    await expect(page.locator('#householdConcertsRockvilleMount tbody tr')).toContainText('18:30');

    await page.locator('#householdConcertsRockvilleMount [data-concert-action="edit-rockville-set"]').click();
    await expect(page.locator('#householdConcertsRockvilleSetForm')).toBeVisible();
    await page.locator('input[name="Stage"]').fill('Monster Energy Stage');
    await page.locator('input[name="Set_Start_Time"]').fill('19:15');
    await page.locator('#householdConcertsRockvilleSetForm button[type="submit"]').click();

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

