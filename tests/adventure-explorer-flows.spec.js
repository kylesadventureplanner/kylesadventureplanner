const { test, expect } = require('./reliability-test');

const EXPLORER_CASES = [
  { key: 'outdoors', label: 'Outdoors', openAction: 'open-explorer-outdoors', closeAction: 'close-explorer-outdoors' },
  { key: 'entertainment', label: 'Entertainment', openAction: 'open-explorer-entertainment', closeAction: 'close-explorer-entertainment' },
  { key: 'food-drink', label: 'Food & Drink', openAction: 'open-explorer-food-drink', closeAction: 'close-explorer-food-drink' },
  { key: 'retail', label: 'Retail', openAction: 'open-explorer-retail', closeAction: 'close-explorer-retail' },
  { key: 'wildlife-animals', label: 'Wildlife & Animals', openAction: 'open-explorer-wildlife-animals', closeAction: 'close-explorer-wildlife-animals' },
  { key: 'regional-festivals', label: 'Regional Festivals', openAction: 'open-explorer-regional-festivals', closeAction: 'close-explorer-regional-festivals' }
];

test.describe('Adventure explorer open/close flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('.app-tab-btn[data-tab="visited-locations"]').click();
    await expect(page.locator('#visitedLocationsRoot')).toBeVisible();
  });

  EXPLORER_CASES.forEach(({ key, label, openAction, closeAction }) => {
    test(`explorer flow: ${label}`, async ({ page }) => {
      await page.locator(`#appSubTabsSlot [data-progress-subtab="${key}"]`).first().click();
      await expect(page.locator(`#visitedProgressPane-${key}`)).toBeVisible();

      const openBtn = page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${openAction}"]`).first();
      await expect(openBtn).toBeVisible();
      await openBtn.click();

      const explorerView = page.locator(`#visitedProgressPane-${key} [data-visited-subtab-view="explorer"]`).first();
      await expect(explorerView).toBeVisible();

      const meta = page.locator(`#visitedExplorerMeta-${key}`).first();
      await expect(meta).toBeVisible();
      await expect(meta).not.toHaveText('');

      const list = page.locator(`#visitedExplorerList-${key}`).first();
      await expect(list).toBeVisible();

      const closeBtn = page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${closeAction}"]`).first();
      await expect(closeBtn).toBeVisible();
      await closeBtn.click();

      await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-view="overview"]`).first()).toBeVisible();
    });
  });
});

