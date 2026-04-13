const { test, expect } = require('./reliability-test');

test.describe('Adventure log visit modal', () => {
  test('Log Visit fields are interactive and editable', async ({ page }) => {
    await page.goto('/');
    await page.locator('.app-tab-btn[data-tab="visited-locations"]').click();
    await expect(page.locator('#visitedLocationsRoot')).toBeVisible();

    await page.locator('#appSubTabsSlot [data-progress-subtab="outdoors"]').first().click();

    const logBtn = page.locator('#visitedProgressPane-outdoors [data-visited-subtab-action="open-visit-log-outdoors"]').first();
    await expect(logBtn).toBeVisible();
    await logBtn.click();

    const modal = page.locator('#visitedVisitLogModal');
    await expect(modal).toBeVisible();

    const locationSelect = page.locator('#visitedVisitLogLocationSelect');
    const dateInput = page.locator('#visitedVisitLogDate');
    const notesInput = page.locator('#visitedVisitLogNotes');
    const photoInput = page.locator('#visitedVisitLogPhotoInput');
    const photoStatus = page.locator('#visitedVisitLogPhotoStatus');

    await expect(locationSelect).toBeEditable();
    await expect(dateInput).toBeEditable();
    await expect(notesInput).toBeEditable();
    await expect(photoInput).toBeVisible();
    await expect(photoInput).toHaveAttribute('multiple', '');
    await expect(photoStatus).toContainText(/OneDrive/i);

    await locationSelect.focus();
    await expect(locationSelect).toBeFocused();

    await notesInput.fill('Playwright interactivity check');
    await expect(notesInput).toHaveValue('Playwright interactivity check');

    await expect(modal).toBeVisible();
  });
});

