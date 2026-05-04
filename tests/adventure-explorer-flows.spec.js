const { test, expect } = require('./reliability-test');
const {
  openAdventureChallenge,
  ensureAdventureSubtabSelected
} = require('./playwright-helpers');

const EXPLORER_CASES = [
  { key: 'all-locations', label: 'All Locations', mode: 'daily', openAction: 'open-explorer-all-locations', closeAction: 'close-explorer-all-locations' },
  { key: 'outdoors', label: 'Outdoors', openAction: 'open-explorer-outdoors', closeAction: 'close-explorer-outdoors' },
  { key: 'entertainment', label: 'Entertainment', openAction: 'open-explorer-entertainment', closeAction: 'close-explorer-entertainment' },
  { key: 'food-drink', label: 'Food & Drink', openAction: 'open-explorer-food-drink', closeAction: 'close-explorer-food-drink' },
  { key: 'retail', label: 'Retail', openAction: 'open-explorer-retail', closeAction: 'close-explorer-retail' },
  { key: 'wildlife-animals', label: 'Wildlife & Animals', openAction: 'open-explorer-wildlife-animals', closeAction: 'close-explorer-wildlife-animals' },
  { key: 'regional-festivals', label: 'Regional Festivals', openAction: 'open-explorer-regional-festivals', closeAction: 'close-explorer-regional-festivals' }
];

test.describe('Adventure explorer open/close flows', () => {
  EXPLORER_CASES.forEach(({ key, label, mode = 'advanced', openAction, closeAction }) => {
    test(`explorer flow: ${label}`, async ({ page }) => {
      await openAdventureChallenge(page, { mode, subtabKey: key });
      await ensureAdventureSubtabSelected(page, key);
      await expect(page.locator(`#visitedProgressPane-${key}`)).toBeVisible();

      const openBtn = page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${openAction}"]`).first();
      await expect(openBtn).toBeVisible();
      await openBtn.click();

      const explorerView = page.locator(`#visitedProgressPane-${key} [data-visited-subtab-view="explorer"]`).first();
      await expect(explorerView).toBeVisible();

      const overviewView = page.locator(`#visitedProgressPane-${key} [data-visited-subtab-view="overview"]`).first();
      await expect(overviewView).toBeHidden();

      const achvRoot = page.locator(`#achv-root-${key}`).first();
      if ((await achvRoot.count()) > 0) {
        await expect(achvRoot).toBeHidden();
      }

      const meta = page.locator(`#visitedExplorerMeta-${key}`).first();
      await expect(meta).toBeVisible();
      await expect(meta).not.toHaveText('');

      const list = page.locator(`#visitedExplorerList-${key}`).first();
      await expect(list).toBeVisible();

      const detailsBtn = page.locator(`#visitedExplorerList-${key} [data-visited-explorer-details]`).first();
      const hasDetailsBtn = (await detailsBtn.count()) > 0;
      if (hasDetailsBtn) {
        await expect(page.locator(`#visitedExplorerList-${key}`).getByText(/Estimated Drive Time:/i).first()).toBeVisible();
        await expect(page.locator(`#visitedExplorerList-${key}`).getByText(/Tags:/i).first()).toBeVisible();
        await expect(page.locator(`#visitedExplorerList-${key}`).getByText(/Physical Address - City - State:/i).first()).toBeVisible();
        await expect(page.locator(`#visitedExplorerList-${key}`).getByText(/Description:/i).first()).toBeVisible();

        await detailsBtn.click();
        await expect(page.locator('#visitedExplorerDetailsModal')).toBeVisible();
        await page.locator('#visitedExplorerDetailsCloseBtn').click();
        await expect(page.locator('#visitedExplorerDetailsModal')).toBeHidden();
      } else {
        await expect(page.locator(`#visitedExplorerList-${key} .visited-empty`).first()).toBeVisible();
      }

      const closeBtn = page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${closeAction}"]`).first();
      await expect(closeBtn).toBeVisible();
      await closeBtn.click();

      await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-view="overview"]`).first()).toBeVisible();
    });
  });
});

