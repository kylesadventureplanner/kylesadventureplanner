const { test, expect } = require('./reliability-test');

const ADVENTURE_SUBTABS = [
  {
    key: 'wildlife-animals',
    label: 'Wildlife & Animals',
    refreshAction: 'refresh-subtab-wildlife-animals',
    undoAction: 'undo-subtab-wildlife-animals',
    exploreAction: 'open-explorer-wildlife-animals',
    legacyFindAction: 'find-wildlife-animals'
  },
  {
    key: 'regional-festivals',
    label: 'Regional Festivals',
    refreshAction: 'refresh-subtab-regional-festivals',
    undoAction: 'undo-subtab-regional-festivals',
    exploreAction: 'open-explorer-regional-festivals',
    legacyFindAction: 'find-regional-festivals'
  },
  {
    key: 'retail',
    label: 'Retail',
    refreshAction: 'refresh-subtab-retail',
    undoAction: 'undo-subtab-retail',
    exploreAction: 'open-explorer-retail',
    legacyFindAction: 'find-retail-location'
  }
];

test.describe('Adventure Challenge new subtabs smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('.app-tab-btn[data-tab="visited-locations"]').click();
    await expect(page.locator('#visitedLocationsRoot')).toBeVisible();
  });

  test('legacy top header controls are removed from Adventure Challenge', async ({ page }) => {
    await expect(page.locator('#visitedRefreshBtn')).toHaveCount(0);
    await expect(page.locator('#visitedWeatherMode')).toHaveCount(0);
    await expect(page.locator('#visitedCtaInjectorStatus')).toHaveCount(0);
  });

  test('default Outdoors pane uses Nature-style status pills', async ({ page }) => {
    await expect(page.locator('#visitedSubtabStatus-outdoors .visited-subtab-status-health')).toBeVisible();
    await expect(page.locator('#visitedSubtabStatus-outdoors .visited-subtab-status-meta')).toBeVisible();
    await expect(page.locator('#visitedSubtabStatus-outdoors .visited-subtab-status-health')).toContainText(/Outdoors data:/i);
  });

  ADVENTURE_SUBTABS.forEach(({ key, label, refreshAction, undoAction, exploreAction, legacyFindAction }) => {
    test(`subtab smoke: ${label}`, async ({ page }) => {
      const dockButton = page.locator(`#appSubTabsSlot [data-progress-subtab="${key}"]`).first();
      await expect(dockButton).toBeVisible();
      await dockButton.click();

      await expect(page.locator(`#visitedProgressPane-${key}`)).toBeVisible();
      await expect(page.locator(`#appSubTabsSlot [data-progress-subtab="${key}"][aria-selected="true"]`)).toBeVisible();
      await expect(page.locator(`#visitedSubtabStatus-${key} .visited-subtab-status-health`)).toBeVisible();
      await expect(page.locator(`#visitedSubtabStatus-${key} .visited-subtab-status-meta`)).toBeVisible();
      await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${refreshAction}"]`)).toHaveCount(1);
      await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${undoAction}"]`)).toHaveCount(1);
      await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${exploreAction}"]`)).toHaveCount(1);
      await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${legacyFindAction}"]`)).toHaveCount(0);

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

