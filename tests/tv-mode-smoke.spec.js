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

  // Header button must reflect ON state.
  await expect(headerBtn).toHaveAttribute('aria-pressed', 'true');

  // On first enable the HUD should auto-appear.
  const hud = page.locator('#tvModeShortcutHud');
  await expect(hud).toHaveClass(/visible/);

  // HUD must contain a close button.
  const hudClose = page.locator('#tvModeShortcutHudClose');
  await expect(hudClose).toBeVisible();

  // Closing the HUD via [ ] button works.
  await hudClose.click();
  await expect(hud).not.toHaveClass(/visible/);

  // H key re-opens the HUD.
  await page.keyboard.press('h');
  await expect(hud).toHaveClass(/visible/);
  await page.keyboard.press('h');
  await expect(hud).not.toHaveClass(/visible/);

  // Ensure Adventure Planner is active — quick rail is scoped to it.
  const plannerTab = page.locator('.app-tab-btn[data-tab="adventure-planner"]');
  if (await plannerTab.count()) {
    await plannerTab.first().click();
  }

  // Quick rail visible in TV mode.
  const quickRail = page.locator('#tvQuickFilterRail');
  await expect(quickRail).toBeVisible();

  // Exercise one preset via keyboard.
  await page.keyboard.press('2');
  await expect(page.locator('.tv-quick-filter-btn[data-preset="food"]')).toHaveAttribute('data-active', 'true');

  // Tab cycling: ] moves to the next tab.
  const activeTabBefore = await page.locator('.app-tab-btn.active').first().getAttribute('data-tab');
  await page.keyboard.press(']');
  const activeTabAfter = await page.locator('.app-tab-btn.active').first().getAttribute('data-tab');
  expect(activeTabAfter).not.toBe(activeTabBefore);

  // Toggle off via header button click.
  await headerBtn.click();
  await expect(toggle).toHaveText(/TV Mode: OFF/i);
  await expect(headerBtn).toHaveAttribute('aria-pressed', 'false');
});
