const { test, expect } = require('./reliability-test');

test.describe('Adventure log visit modal', () => {
  test('Log Visit fields are interactive and editable', async ({ page }) => {
    await page.goto('/');
    await page.locator('.app-tab-btn[data-tab="visited-locations"]').click();
    await expect(page.locator('#visitedLocationsRoot')).toBeVisible();

    await page.locator('#appSubTabsSlot [data-progress-subtab="outdoors"]').first().click();

    const exploreBtn = page.locator('#visitedProgressPane-outdoors [data-visited-subtab-action="open-explorer-outdoors"]').first();
    await expect(exploreBtn).toBeVisible();
    await exploreBtn.click();

    await page.evaluate(async () => {
      if (typeof window.openVisitedVisitLogFromAchievements === 'function') {
        await window.openVisitedVisitLogFromAchievements({ subtabKey: 'outdoors' });
      }
    });

    const modal = page.locator('#visitedVisitLogModal');
    await expect(modal).toBeVisible();

    const locationSelect = page.locator('#visitedVisitLogLocationSelect');
    const dateInput = page.locator('#visitedVisitLogDate');
    const notesInput = page.locator('#visitedVisitLogNotes');

    await expect(locationSelect).toBeEditable();
    await expect(dateInput).toBeEditable();
    await expect(notesInput).toBeEditable();

    await locationSelect.focus();
    await expect(locationSelect).toBeFocused();

    await notesInput.fill('Playwright interactivity check');
    await expect(notesInput).toHaveValue('Playwright interactivity check');

    await expect(modal).toBeVisible();
  });
});

