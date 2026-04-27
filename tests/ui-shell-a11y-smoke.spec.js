const { test, expect } = require('./reliability-test');

test.describe('UI shell accessibility smoke', () => {
  test('Trail Explorer adopts shared shell and keeps keyboard flow in controls', async ({ page }) => {
    await page.goto('/HTML%20Files/trail-explorer-window.html');

    await expect(page.locator('body')).toHaveClass(/\bui-page-shell\b/);
    const controlBar = page.locator('#trailCitiesPage .trail-cities-controls');
    await expect(controlBar).toHaveClass(/\bui-control-bar\b/);

    await page.evaluate(() => {
      const citiesPage = document.getElementById('trailCitiesPage');
      if (citiesPage) citiesPage.classList.remove('hidden');
    });

    const searchInput = page.locator('#trailCitySearchInput');
    const sortSelect = page.locator('#trailCitySortSelect');
    const driveButton = page.locator('#trailCityDriveTimesBtn');

    await searchInput.focus();
    await expect(searchInput).toBeFocused();

    await searchInput.press('Tab');
    await expect(sortSelect).toBeFocused();

    await sortSelect.press('Tab');
    await expect(driveButton).toBeFocused();
  });

  test('Adventure Details adopts shared shell and keeps tab focus order', async ({ page }) => {
    await page.goto('/HTML%20Files/adventure-details-window.html');

    await expect(page.locator('.wrap').first()).toHaveClass(/\bui-page-shell\b/);
    await expect(page.locator('#tabs')).toHaveClass(/\bui-control-bar\b/);
    await expect(page.locator('#actionBar')).toHaveClass(/\bui-control-bar\b/);
    await expect(page.locator('#tabs')).toHaveAttribute('aria-label', /Adventure details tabs/i);

    const firstTab = page.locator('#tabs .tab-btn').first();
    const secondTab = page.locator('#tabs .tab-btn').nth(1);

    await firstTab.focus();
    await expect(firstTab).toBeFocused();

    await secondTab.focus();
    await expect(secondTab).toBeFocused();
    await secondTab.press('Enter');
    await expect(secondTab).toHaveAttribute('aria-selected', 'true');

    await page.evaluate(() => {
      const actionBar = document.getElementById('actionBar');
      if (actionBar) actionBar.classList.remove('u-hidden');
    });

    const quickActionBtn = page.locator('#abFavBtn');
    await quickActionBtn.focus();
    await expect(quickActionBtn).toBeFocused();
  });

  test('Bike Details adopts shared shell and keeps tab/button focus behavior', async ({ page }) => {
    await page.goto('/HTML%20Files/bike-details-window.html');

    await expect(page.locator('.wrap').first()).toHaveClass(/\bui-page-shell\b/);
    await expect(page.locator('#tabs')).toHaveClass(/\bui-control-bar\b/);
    await expect(page.locator('#actionBar')).toHaveClass(/\bui-control-bar\b/);
    await expect(page.locator('#tabs')).toHaveAttribute('aria-label', /Bike trail details tabs/i);

    const secondTab = page.locator('#tabs .tab-btn').nth(1);
    await secondTab.focus();
    await expect(secondTab).toBeFocused();
    await secondTab.press('Enter');

    await expect.poll(async () => {
      const classes = await secondTab.getAttribute('class');
      const ariaSelected = await secondTab.getAttribute('aria-selected');
      return Boolean((classes && /\bactive\b/.test(classes)) || ariaSelected === 'true');
    }).toBe(true);

    await page.evaluate(() => {
      const actionBar = document.getElementById('actionBar');
      if (actionBar) actionBar.classList.remove('u-hidden');
    });

    const quickActionBtn = page.locator('#abFavBtn');
    await quickActionBtn.focus();
    await expect(quickActionBtn).toBeFocused();
  });

  test('Edit Mode adopts shared shell and keeps tab navigation focusable', async ({ page }) => {
    await page.goto('/HTML%20Files/edit-mode-new.html');

    await expect(page.locator('.app-container').first()).toHaveClass(/\bui-page-shell\b/);
    await expect(page.locator('.tabs-nav').first()).toHaveClass(/\bui-control-bar\b/);
    await expect(page.locator('.tabs-nav').first()).toHaveAttribute('aria-label', /Edit mode tabs/i);

    const firstTab = page.locator('.tabs-nav .tab-btn').first();
    const secondTab = page.locator('.tabs-nav .tab-btn').nth(1);

    await firstTab.focus();
    await expect(firstTab).toBeFocused();
    await firstTab.press('Tab');
    await expect(secondTab).toBeFocused();
  });
});

