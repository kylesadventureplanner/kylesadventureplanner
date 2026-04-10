const { test, expect } = require('./reliability-test');

const ADVENTURE_SUBTABS = [
  {
    key: 'wildlife-animals',
    label: 'Wildlife & Animals',
    ctaAction: 'find-wildlife-animals'
  },
  {
    key: 'regional-festivals',
    label: 'Regional Festivals',
    ctaAction: 'find-regional-festivals'
  }
];

test.describe('Adventure Challenge new subtabs smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('.app-tab-btn[data-tab="visited-locations"]').click();
    await expect(page.locator('#visitedLocationsRoot')).toBeVisible();
  });

  ADVENTURE_SUBTABS.forEach(({ key, label, ctaAction }) => {
    test(`subtab smoke: ${label}`, async ({ page }) => {
      const dockButton = page.locator(`#appSubTabsSlot [data-progress-subtab="${key}"]`).first();
      await expect(dockButton).toBeVisible();
      await dockButton.click();

      await expect(page.locator(`#visitedProgressPane-${key}`)).toBeVisible();
      await expect(page.locator(`#appSubTabsSlot [data-progress-subtab="${key}"][aria-selected="true"]`)).toBeVisible();
      await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${ctaAction}"]`).first()).toBeVisible();

      await dockButton.focus();
      await expect(dockButton).toBeFocused();

      await dockButton.press('ArrowRight');
      const selectedAfterRight = page.locator('#appSubTabsSlot [data-progress-subtab][aria-selected="true"]').first();
      await expect(selectedAfterRight).toBeVisible();
      await expect(selectedAfterRight).not.toHaveAttribute('data-progress-subtab', key);

      await selectedAfterRight.press('ArrowLeft');
      await expect(page.locator(`#appSubTabsSlot [data-progress-subtab="${key}"][aria-selected="true"]`).first()).toBeVisible();
    });
  });
});

