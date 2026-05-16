const { test, expect } = require('./reliability-test');

test.describe('Food / Drink tab grouping', () => {
  test('defaults to Recipes and exposes Recipes as a Food / Drink subtab', async ({ page }) => {
    await page.goto('/');

    await page.locator('.app-tab-btn[data-tab="drinks-cocktails"]').click();

    await expect(page.locator('.app-tab-pane[data-tab="recipes"]')).toHaveClass(/active/);
    await expect(page.locator('#recipesRoot')).toBeVisible();

    const recipesSubtab = page.locator('#appSubTabsSlot [data-dc-subtab="recipes"], #drinksCocktailsRoot [data-dc-subtab="recipes"]').first();
    await expect(recipesSubtab).toBeVisible({ timeout: 15000 });
    await expect(recipesSubtab).toHaveClass(/active/);

    const naBrewSubtab = page.locator('#appSubTabsSlot [data-dc-subtab="na-brew"], #drinksCocktailsRoot [data-dc-subtab="na-brew"]').first();
    await naBrewSubtab.click();

    await expect(page.locator('.app-tab-pane[data-tab="drinks-cocktails"]')).toHaveClass(/active/);
    await expect(page.locator('#drinksCocktailsRoot [data-dc-pane="na-brew"]')).toBeVisible();
  });
});

