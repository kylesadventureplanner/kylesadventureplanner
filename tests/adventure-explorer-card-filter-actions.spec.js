const { test, expect } = require('./reliability-test');
const { installVisitedExplorerSeedFixture } = require('./playwright-helpers');

/**
 * Click the action-sheet option with the given key number, then wait for the
 * sheet to fully close.  Throws if the sheet does not appear within 4 s.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string|number} key  – The `data-vef-action-key` value (e.g. '1', '5').
 */
async function clickActionSheetOption(page, key) {
  const sheet = page.locator('.vef-action-sheet');
  await expect(sheet).toBeVisible({ timeout: 4000 });
  await page.locator(`.vef-action-sheet-option[data-vef-action-key="${key}"]`).click();
  // Wait for the sheet to start closing before continuing.
  await expect(sheet).not.toBeVisible({ timeout: 3000 });
}

test.describe('Adventure explorer card filter actions', () => {
  test('supports tag and address filter actions from explorer cards (in-app action sheet)', async ({ page }) => {
    await installVisitedExplorerSeedFixture(page);
    await page.goto('/');
    await page.locator('.app-tab-btn[data-tab="visited-locations"]').click();
    await expect(page.locator('#visitedLocationsRoot')).toBeVisible();

    const selectedSubtab = 'outdoors';
    await page.locator(`#appSubTabsSlot [data-progress-subtab="${selectedSubtab}"]`).first().click();
    const openExplorerBtn = page.locator(`#visitedProgressPane-${selectedSubtab} [data-visited-subtab-action="open-explorer-${selectedSubtab}"]`).first();
    await expect(openExplorerBtn).toBeVisible();
    await openExplorerBtn.click();
    const list = page.locator(`#visitedExplorerList-${selectedSubtab} .visited-explorer-card`);
    await expect(list.first()).toBeVisible({ timeout: 12000 });

    const advancedFilters = page.locator(`#visitedProgressPane-${selectedSubtab} .visited-explorer-advanced-filters`).first();
    await expect(advancedFilters).toBeVisible();
    await expect(advancedFilters).toHaveJSProperty('open', false);

    await page.evaluate(() => {
      window.__copiedExplorerAddress = '';
      const clipboardMock = {
        writeText: async (value) => {
          window.__copiedExplorerAddress = String(value || '');
        }
      };
      try {
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: clipboardMock });
      } catch (_) {
        // Older browser contexts can reject redefining clipboard; test will still verify button visibility.
      }
    });

    const addressActionsToggle = list.first().locator('[data-visited-explorer-address-actions-toggle]').first();
    await expect(addressActionsToggle).toBeVisible();
    await addressActionsToggle.click();

    const addressCopyBtn = list.first().locator('[data-visited-explorer-address-menu] [data-visited-explorer-address-copy]').first();
    const addressDirectionsBtn = list.first().locator('[data-visited-explorer-address-menu] [data-visited-explorer-open-directions]').first();
    await expect(addressCopyBtn).toBeVisible();
    await addressCopyBtn.focus();
    await page.keyboard.press('ArrowDown');
    await expect(addressDirectionsBtn).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(list.first().locator('[data-visited-explorer-address-menu]')).toBeHidden();
    await expect(addressActionsToggle).toBeFocused();

    await addressActionsToggle.click();
    await expect(addressCopyBtn).toBeVisible();
    await addressCopyBtn.click();
    await expect(addressCopyBtn).toHaveText(/copied/i);
    await expect(addressCopyBtn).toHaveClass(/is-copied/);
    const copiedAddress = await page.evaluate(() => String(window.__copiedExplorerAddress || '').trim());
    expect(copiedAddress.length).toBeGreaterThan(0);

    const initialCount = await list.count();
    const tagButtons = list.first().locator('[data-visited-explorer-tag-filter]');
    const tagCount = await tagButtons.count();
    expect(tagCount).toBeGreaterThan(0);

    // Option 1: replace include filter with this tag.
    await tagButtons.first().click();
    await clickActionSheetOption(page, '1');

    const meta = page.locator(`#visitedExplorerMeta-${selectedSubtab}`);
    await expect(meta).toContainText(/Active filters: tags include:/i);
    expect(await list.count()).toBeLessThanOrEqual(initialCount);

    // Option 2: add another tag to current include filter (if available).
    if (tagCount > 1) {
      await list.first().locator('[data-visited-explorer-tag-filter]').nth(1).click();
      await clickActionSheetOption(page, '2');
      await expect(meta).toContainText(/tags include:/i);
    }

    // Option 5: clear tag include/exclude filters.
    await list.first().locator('[data-visited-explorer-tag-filter]').first().click();
    await clickActionSheetOption(page, '5');
    await expect(meta).not.toContainText(/tags include:|tags excluded:/i);

    const addressBtn = list.first().locator('[data-visited-explorer-address-filter]').first();
    await expect(addressBtn).toBeVisible();

    // Option 1: apply first available address include filter (city or state).
    await addressBtn.click();
    await clickActionSheetOption(page, '1');

    const citySelect = page.locator(`#visitedExplorerCity-${selectedSubtab}`);
    const stateSelect = page.locator(`#visitedExplorerState-${selectedSubtab}`);
    const cityValue = await citySelect.inputValue();
    const stateValue = await stateSelect.inputValue();
    expect(cityValue !== 'all' || stateValue !== 'all').toBeTruthy();
  });
});

