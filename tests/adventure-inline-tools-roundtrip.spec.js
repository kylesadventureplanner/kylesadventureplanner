const { test, expect } = require('@playwright/test');

test.describe('Adventure inline tools roundtrip', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('.app-tab-btn[data-tab="visited-locations"]').click();
    await expect(page.locator('#visitedLocationsRoot')).toBeVisible();
    await page.locator('#appSubTabsSlot [data-progress-subtab="outdoors"]').first().click();
    await expect(page.locator('#visitedProgressPane-outdoors')).toBeVisible();
  });

  test('City Explorer inline opens and back returns to overview', async ({ page }) => {
    await page.evaluate(() => {
      window.prepareCityViewerInlineUrl = async function() {
        return 'about:blank#city-inline-test';
      };
    });

    const openCityBtn = page.locator('#visitedProgressPane-outdoors [data-visited-subtab-action="open-city-explorer-outdoors"]').first();
    await expect(openCityBtn).toBeVisible();
    await openCityBtn.click();

    const cityView = page.locator('#visitedProgressPane-outdoors [data-visited-subtab-view="city-explorer"]').first();
    const overviewView = page.locator('#visitedProgressPane-outdoors [data-visited-subtab-view="overview"]').first();
    const cityFrame = page.locator('#visitedCityExplorerFrame-outdoors').first();

    await expect(cityView).toBeVisible();
    await expect(overviewView).toBeHidden();
    await expect(cityFrame).toBeVisible();
    await expect(cityFrame).toHaveAttribute('src', /city-viewer-window\.html|about:blank/i);
    const cityBox = await cityFrame.boundingBox();
    expect(cityBox && cityBox.width ? cityBox.width : 0).toBeGreaterThan(500);
    expect(cityBox && cityBox.height ? cityBox.height : 0).toBeGreaterThan(400);

    const backBtn = page.locator('#visitedProgressPane-outdoors [data-visited-subtab-view="city-explorer"] [data-visited-subtab-action="close-city-explorer-outdoors"]').first();
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    await expect(page.locator('#visitedProgressPane-outdoors [data-visited-subtab-view="overview"]').first()).toBeVisible();
    await expect(page.locator('#visitedProgressPane-outdoors [data-visited-subtab-view="city-explorer"]').first()).toBeHidden();
  });

  test('Edit Mode inline opens and back returns to overview', async ({ page }) => {
    const openEditBtn = page.locator('#visitedProgressPane-outdoors [data-visited-subtab-action="open-edit-mode-outdoors"]').first();
    await expect(openEditBtn).toBeVisible();
    await openEditBtn.click();

    const editView = page.locator('#visitedProgressPane-outdoors [data-visited-subtab-view="edit-mode"]').first();
    const overviewView = page.locator('#visitedProgressPane-outdoors [data-visited-subtab-view="overview"]').first();
    const editFrame = page.locator('#visitedEditModeFrame-outdoors').first();

    await expect(editView).toBeVisible();
    await expect(overviewView).toBeHidden();
    await expect(editFrame).toBeVisible();
    await expect(editFrame).toHaveAttribute('src', /edit-mode-enhanced\.html|edit-mode-enhanced\.html\?/i);
    const editBox = await editFrame.boundingBox();
    expect(editBox && editBox.width ? editBox.width : 0).toBeGreaterThan(500);
    expect(editBox && editBox.height ? editBox.height : 0).toBeGreaterThan(400);

    const backBtn = page.locator('#visitedProgressPane-outdoors [data-visited-subtab-view="edit-mode"] [data-visited-subtab-action="close-edit-mode-outdoors"]').first();
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    await expect(page.locator('#visitedProgressPane-outdoors [data-visited-subtab-view="overview"]').first()).toBeVisible();
    await expect(page.locator('#visitedProgressPane-outdoors [data-visited-subtab-view="edit-mode"]').first()).toBeHidden();
  });
});

