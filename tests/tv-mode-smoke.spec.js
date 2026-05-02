const { test, expect } = require('@playwright/test');

test('TV mode toggles and retired Adventure Planner affordances stay gone', async ({ page }) => {
  await page.goto('/index.html');

  const toggle = page.locator('#tvModeGlobalToggle');
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveText(/TV Mode: OFF/i);

  // Header action-bar button must be present.
  const headerBtn = page.locator('#tvModeHeaderBtn');
  await expect(headerBtn).toBeVisible();

  // Enable TV mode.
  await page.keyboard.press('Control+Alt+T');
  await expect(toggle).toHaveText(/TV Mode: ON/i);
  await expect(page.locator('body')).toHaveClass(/tv-mode-enabled/);
  await expect(headerBtn).toHaveAttribute('aria-pressed', 'true');

  // HUD auto-shows on first enable.
  const hud = page.locator('#tvModeShortcutHud');
  await expect(hud).toHaveClass(/visible/);
  const hudClose = page.locator('#tvModeShortcutHudClose');
  await expect(hudClose).toBeVisible();
  await hudClose.click();
  await expect(hud).not.toHaveClass(/visible/);

  // H key toggles HUD.
  await page.keyboard.press('h');
  await expect(hud).toHaveClass(/visible/);
  await page.keyboard.press('h');
  await expect(hud).not.toHaveClass(/visible/);

  const plannerTab = page.locator('.app-tab-btn[data-tab="adventure-planner"]');
  await expect(plannerTab).toHaveCount(0);

  // Legacy planner quick rail should not be injected once the tab is retired.
  const quickRail = page.locator('#tvQuickFilterRail');
  await expect(quickRail).toHaveCount(0);

  // Focus beacon + aria-live announcer injected into DOM.
  await expect(page.locator('#tvFocusBeacon')).toBeAttached();
  await expect(page.locator('#tvFocusAnnouncer')).toBeAttached();


  // Tab cycling: ] moves to the next tab.
  const activeTabBefore = await page.locator('.app-tab-btn.active').first().getAttribute('data-tab');
  await page.keyboard.press(']');
  const activeTabAfter = await page.locator('.app-tab-btn.active').first().getAttribute('data-tab');
  expect(activeTabAfter).not.toBe(activeTabBefore);

  // Toggle off via header button.
  await headerBtn.click();
  await expect(toggle).toHaveText(/TV Mode: OFF/i);
  await expect(headerBtn).toHaveAttribute('aria-pressed', 'false');
});
