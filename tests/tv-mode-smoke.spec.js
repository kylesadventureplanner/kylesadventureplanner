const { test, expect } = require('@playwright/test');

test('TV mode toggles and quick rail appears on Adventure Planner', async ({ page }) => {
  await page.goto('/index.html');

  const toggle = page.locator('#tvModeGlobalToggle');
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveText(/TV Mode: OFF/i);

  // Header action-bar button must be present and functional.
  const headerBtn = page.locator('#tvModeHeaderBtn');
  await expect(headerBtn).toBeVisible();

  // Keyboard shortcut should enable TV mode.
  await page.keyboard.press('Control+Alt+T');
  await expect(toggle).toHaveText(/TV Mode: ON/i);
  await expect(page.locator('body')).toHaveClass(/tv-mode-enabled/);

  // Header button text and aria-pressed must reflect ON state.
  await expect(headerBtn).toHaveAttribute('aria-pressed', 'true');

  // Ensure Adventure Planner is active, since the quick rail is mounted in that tab.
  const plannerTab = page.locator('.app-tab-btn[data-tab="adventure-planner"]');
  if (await plannerTab.count()) {
    await plannerTab.first().click();
  }

  // Quick rail is injected near planner controls.
  const quickRail = page.locator('#tvQuickFilterRail');
  await expect(quickRail).toBeVisible();

  // Exercise one preset quickly.
  await page.keyboard.press('2');
  await expect(page.locator('.tv-quick-filter-btn[data-preset="food"]')).toHaveAttribute('data-active', 'true');

  // Toggle off again via header button click.
  await headerBtn.click();
  await expect(toggle).toHaveText(/TV Mode: OFF/i);
  await expect(headerBtn).toHaveAttribute('aria-pressed', 'false');
});
