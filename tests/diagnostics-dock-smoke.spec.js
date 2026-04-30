const { test, expect } = require('./reliability-test');

test.describe('diagnostics dock responsiveness', () => {
  test('error bar and advanced debug console remain compact and interactive', async ({ page }) => {
    await page.goto('/');

    const drawer = page.locator('#diagnosticsDrawer');
    const drawerToggle = page.locator('#diagnosticsDrawerToggle');
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveClass(/\bis-collapsed\b/);
    await drawerToggle.click();
    await expect(drawer).not.toHaveClass(/\bis-collapsed\b/);

    const errorBar = page.locator('#errorNotificationBar');
    const debugConsole = page.locator('#debuggingConsole');
    const errorHeader = page.locator('#errorNotificationBar .error-header');
    const debugHeader = page.locator('#debuggingConsole .debug-console-header');

    await expect(errorBar).toBeVisible();
    await expect(debugConsole).toBeVisible();
    await expect(errorBar).toHaveClass(/\bcollapsed\b/);
    await expect(debugConsole).toHaveClass(/\bcollapsed\b/);

    const initialMetrics = await page.evaluate(() => {
      const errorBarEl = document.getElementById('errorNotificationBar');
      const debugConsoleEl = document.getElementById('debuggingConsole');
      const errorHeaderEl = errorBarEl && errorBarEl.querySelector('.error-header');
      const debugHeaderEl = debugConsoleEl && debugConsoleEl.querySelector('.debug-console-header');
      const errorRect = errorBarEl ? errorBarEl.getBoundingClientRect() : null;
      const debugRect = debugConsoleEl ? debugConsoleEl.getBoundingClientRect() : null;
      return {
        viewportWidth: window.innerWidth,
        errorWidth: errorRect ? Math.round(errorRect.width) : 0,
        debugWidth: debugRect ? Math.round(debugRect.width) : 0,
        errorPointerEvents: errorHeaderEl ? getComputedStyle(errorHeaderEl).pointerEvents : 'missing',
        debugPointerEvents: debugHeaderEl ? getComputedStyle(debugHeaderEl).pointerEvents : 'missing'
      };
    });

    expect(initialMetrics.errorPointerEvents).toBe('auto');
    expect(initialMetrics.debugPointerEvents).toBe('auto');
    expect(await errorBar.evaluate((el) => Math.round(el.getBoundingClientRect().height))).toBeLessThanOrEqual(38);
    expect(await debugConsole.evaluate((el) => Math.round(el.getBoundingClientRect().height))).toBeLessThanOrEqual(38);
    expect(initialMetrics.errorWidth).toBeLessThanOrEqual(Math.min(420, initialMetrics.viewportWidth - 24) + 2);
    expect(initialMetrics.debugWidth).toBeLessThanOrEqual(Math.min(420, initialMetrics.viewportWidth - 24) + 2);

    await errorHeader.click();
    await expect(errorBar).not.toHaveClass(/\bcollapsed\b/);
    await expect(debugConsole).toHaveAttribute('data-dock-obscured', '1');

    await errorHeader.click();
    await expect(errorBar).toHaveClass(/\bcollapsed\b/);
    await expect(debugConsole).toHaveAttribute('data-dock-obscured', '0');

    await debugHeader.click();
    await expect(debugConsole).not.toHaveClass(/\bcollapsed\b/);
    await expect(errorBar).toHaveAttribute('data-dock-obscured', '1');

    const expandedMetrics = await page.evaluate(() => {
      const debugConsoleEl = document.getElementById('debuggingConsole');
      const errorBarEl = document.getElementById('errorNotificationBar');
      const debugRect = debugConsoleEl ? debugConsoleEl.getBoundingClientRect() : null;
      const errorStyle = errorBarEl ? getComputedStyle(errorBarEl) : null;
      return {
        viewportWidth: window.innerWidth,
        debugWidth: debugRect ? Math.round(debugRect.width) : 0,
        debugBottom: debugRect ? Math.round(window.innerHeight - debugRect.bottom) : -1,
        errorVisibility: errorStyle ? errorStyle.visibility : 'missing',
        errorPointerEvents: errorStyle ? errorStyle.pointerEvents : 'missing'
      };
    });

    expect(expandedMetrics.debugWidth).toBeLessThanOrEqual(Math.min(420, expandedMetrics.viewportWidth - 24) + 2);
    expect(expandedMetrics.debugBottom).toBeGreaterThanOrEqual(8);
    expect(expandedMetrics.errorVisibility).toBe('hidden');
    expect(expandedMetrics.errorPointerEvents).toBe('none');
  });
});

