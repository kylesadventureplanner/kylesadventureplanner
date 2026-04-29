const { test, expect } = require('./reliability-test');

test.describe('Adventure log visit window', () => {
  test('Log Visit fields are interactive and editable', async ({ page }) => {
    await page.goto('/');
    await page.locator('.app-tab-btn[data-tab="visited-locations"]').click();
    await expect(page.locator('#visitedLocationsRoot')).toBeVisible();

    await page.locator('#appSubTabsSlot [data-progress-subtab="outdoors"]').first().click();

    const logBtn = page.locator('#visitedProgressPane-outdoors [data-visited-subtab-action="open-visit-log-outdoors"]').first();
    await expect(logBtn).toBeVisible();

    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      logBtn.click()
    ]);
    await popup.waitForLoadState('domcontentloaded');

    const locationSelect = popup.locator('#visitedVisitLogLocationSelect');
    const dateInput = popup.locator('#visitedVisitLogDate');
    const notesInput = popup.locator('#visitedVisitLogNotes');
    const photoInput = popup.locator('#visitedVisitLogPhotoInput');
    const photoStatus = popup.locator('#visitedVisitLogPhotoStatus');

    await expect(locationSelect).toBeVisible({ timeout: 10000 });
    await expect(dateInput).toBeEditable();
    await expect(notesInput).toBeEditable();
    await expect(photoInput).toBeVisible();
    await expect(photoInput).toHaveAttribute('multiple', '');
    await expect(photoStatus).toContainText(/OneDrive/i);

    await locationSelect.focus();
    await expect(locationSelect).toBeFocused();

    await notesInput.fill('Playwright interactivity check');
    await expect(notesInput).toHaveValue('Playwright interactivity check');

    // Title should be in header
    await expect(popup.locator('#visitedVisitLogTitle')).toBeVisible();
  });

  test('challenge cards open qualifying-locations window and support Add Missing Qualifying Location', async ({ page }) => {
    await page.goto('/');
    await page.locator('.app-tab-btn[data-tab="visited-locations"]').click();
    await expect(page.locator('#visitedLocationsRoot')).toBeVisible();

    await page.locator('#appSubTabsSlot [data-progress-subtab="outdoors"]').first().click();
    await expect(page.locator('#achv-root-outdoors')).toBeVisible({ timeout: 12000 });

    const qualifyingBtn = page.locator('#achv-root-outdoors [data-achv-view-qualifying][data-achv-scope="challenge"]').first();
    await expect(qualifyingBtn).toBeVisible();

    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      qualifyingBtn.click()
    ]);
    await popup.waitForLoadState('domcontentloaded');

    await expect(popup.locator('#visitedVisitLogTitle')).toBeVisible({ timeout: 8000 });
    await expect(popup.locator('#visitedVisitLogQualifierSummary')).toBeVisible({ timeout: 8000 });
    await expect(popup.locator('#visitedVisitLogQualifierSummary')).toContainText(/filtering by category/i);

    const refreshBtn = popup.locator('#visitedVisitLogRefreshBtn');
    await expect(refreshBtn).toBeVisible();
    await refreshBtn.click();
    await expect(popup.locator('#visitedVisitLogHelp')).toContainText(/Refreshed qualifying locations/i, { timeout: 10000 });

    const addMissingBtn = popup.locator('#visitedVisitLogAddMissingBtn');
    await expect(addMissingBtn).toBeVisible();
    await addMissingBtn.click();
  });
});
