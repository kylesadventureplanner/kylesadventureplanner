const { test, expect } = require('./reliability-test');

test.describe('Central diagnostics hub smoke', () => {
  test('deep-link opens diagnostics hub and selected section', async ({ page }) => {
    await page.goto('/?tab=diagnostics-hub&diagSection=sync');

    await expect(page.locator('#diagnosticsHubTab')).toHaveClass(/active/);
    await expect(page.locator('#diagnosticsHubMount .diagnostics-hub-shell')).toBeVisible();
    await expect(page.locator('#diagnosticsHubMount .diagnostics-hub-tab.active')).toContainText('Sync recovery');
  });

  test('header diagnostics button opens hub', async ({ page }) => {
    await page.goto('/');

    await page.evaluate(() => {
      if (typeof window.setAppMode === 'function') {
        window.setAppMode('advanced');
        return;
      }
      document.documentElement.setAttribute('data-app-mode', 'advanced');
    });

    await expect(page.locator('#diagnosticsHubBtn')).toBeVisible();

    await page.locator('#diagnosticsHubBtn').click();

    await expect(page.locator('#diagnosticsHubTab')).toHaveClass(/active/);
    await expect(page.locator('#diagnosticsHubMount .diagnostics-hub-shell')).toBeVisible();
  });

  test('legacy adventure-planner deep links redirect to Adventure Challenge', async ({ page }) => {
    await page.goto('/?tab=adventure-planner');

    await expect(page.locator('.app-tab-btn.active')).toHaveAttribute('data-tab', 'visited-locations');
    await expect(page).toHaveURL(/tab=visited-locations/);
  });

  test('legacy household concerts deep link resolves to Adventure Challenge tab', async ({ page }) => {
    await page.goto('/?tab=household-tools&householdSubtab=concerts');

    await page.locator('.app-tab-btn[data-tab="visited-locations"]').click();

    await expect(page.locator('.app-tab-btn.active')).toHaveAttribute('data-tab', 'visited-locations');
    await expect(page.locator('#appSubTabsSlot [data-progress-subtab="concerts"]').first()).toHaveAttribute('aria-selected', 'true');
  });
});

