const { test, expect } = require('./reliability-test');
const { activateFooterAction } = require('./playwright-helpers');

test.describe('Nature primary grouping', () => {
  test('groups Garden Planner and Birding Locations under Nature with distinct leading subtabs', async ({ page }) => {
    await page.goto('/');

    const adventuresButton = page.locator('.app-tab-btn[data-tab="visited-locations"]');
    await expect(adventuresButton).toContainText('Adventures');

    const natureButton = page.locator('.app-tab-btn[data-tab="nature-challenge"]');
    await expect(natureButton).toContainText('Nature');

    await expect(page.locator('.app-tab-btn[data-tab="birding"]')).toBeHidden();

    await activateFooterAction(page, natureButton);
    await expect(page.locator('#natureChallengeRoot')).toBeVisible({ timeout: 15000 });

    const dockButtons = page.locator('#appSubTabsSlot .nature-challenge-subtabs > button');
    await expect(dockButtons.nth(0)).toHaveAttribute('data-nature-link-tab', 'garden');
    await expect(dockButtons.nth(0)).toContainText('Garden Planner');
    await expect(dockButtons.nth(1)).toHaveAttribute('data-nature-link-tab', 'birding');
    await expect(dockButtons.nth(1)).toContainText('Birding Locations');
    await expect(dockButtons.nth(2)).toHaveAttribute('data-nature-subtab', 'birds');

    await expect(page.locator('#appSubTabsSlot [data-nature-link-tab="garden"]')).toHaveClass(/nature-challenge-subtab--garden-link/);
    await expect(page.locator('#appSubTabsSlot [data-nature-link-tab="birding"]')).toHaveClass(/nature-challenge-subtab--birding-link/);

    const colorSummary = await page.evaluate(() => {
      const read = (selector) => {
        const node = document.querySelector(selector);
        if (!node) return null;
        const style = window.getComputedStyle(node);
        return {
          background: style.backgroundImage || style.backgroundColor,
          border: style.borderColor,
          color: style.color
        };
      };
      return {
        garden: read('#appSubTabsSlot [data-nature-link-tab="garden"]'),
        birding: read('#appSubTabsSlot [data-nature-link-tab="birding"]'),
        birds: read('#appSubTabsSlot [data-nature-subtab="birds"]')
      };
    });

    expect(colorSummary.garden).not.toBeNull();
    expect(colorSummary.birding).not.toBeNull();
    expect(colorSummary.birds).not.toBeNull();
    expect(colorSummary.garden.background).not.toBe(colorSummary.birds.background);
    expect(colorSummary.birding.background).not.toBe(colorSummary.birds.background);

    await activateFooterAction(page, page.locator('#appSubTabsSlot [data-nature-link-tab="garden"]'));
    await expect(page.locator('.app-tab-pane[data-tab="garden"]')).toHaveClass(/active/);
    await expect(page.locator('.app-tab-btn[data-tab="nature-challenge"]')).toHaveClass(/active/);
    await expect(page.locator('#appSubTabsSlot [data-nature-link-tab="garden"]')).toHaveClass(/active/);

    await activateFooterAction(page, page.locator('#appSubTabsSlot [data-nature-link-tab="birding"]'));
    await expect(page.locator('.app-tab-pane[data-tab="birding"]')).toHaveClass(/active/);
    await expect(page.locator('.app-tab-btn[data-tab="nature-challenge"]')).toHaveClass(/active/);
    await expect(page.locator('#appSubTabsSlot [data-nature-link-tab="birding"]')).toHaveClass(/active/);

    await activateFooterAction(page, page.locator('#appSubTabsSlot [data-nature-subtab="birds"]'));
    await expect(page.locator('.app-tab-pane[data-tab="nature-challenge"]')).toHaveClass(/active/);
    await expect(page.locator('#natureChallengeTitle')).toHaveText('Nature - Birds');
  });
});

