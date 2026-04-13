const { test, expect } = require('./reliability-test');

const SUBTABS = [
  { key: 'outdoors', pane: '#visitedProgressPane-outdoors' },
  { key: 'entertainment', pane: '#visitedProgressPane-entertainment' },
  { key: 'food-drink', pane: '#visitedProgressPane-food-drink' },
  { key: 'retail', pane: '#visitedProgressPane-retail' },
  { key: 'wildlife-animals', pane: '#visitedProgressPane-wildlife-animals' }
];

const REQUIRED_SECTION_TEXT = [
  /Category Progression/i,
  /Challenges/i,
  /Badges/i,
  /Seasonal Quests/i,
  /Bingo/i
];

test.describe('Adventure achievements dashboard smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('.app-tab-btn[data-tab="visited-locations"]').click();
    await expect(page.locator('#visitedLocationsRoot')).toBeVisible();
  });

  SUBTABS.forEach(({ key, pane }) => {
    test(`renders achievement sections for ${key}`, async ({ page }) => {
      const dockButton = page.locator(`#appSubTabsSlot [data-progress-subtab="${key}"]`).first();
      await expect(dockButton).toBeVisible();
      await dockButton.click();
      await expect(dockButton).toHaveAttribute('aria-selected', 'true', { timeout: 8000 });

      const paneLocator = page.locator(pane);
      await expect(paneLocator).toBeVisible({ timeout: 10000 });

      const achvRoot = page.locator(`#achv-root-${key}`);
      await expect(achvRoot).toBeVisible({ timeout: 12000 });

      for (const label of REQUIRED_SECTION_TEXT) {
        await expect(achvRoot.getByText(label).first()).toBeVisible({ timeout: 12000 });
      }
    });
  });

  test('sync mode selector keeps automated matching modes only', async ({ page }) => {
    const dockButton = page.locator('#appSubTabsSlot [data-progress-subtab="outdoors"]').first();
    await expect(dockButton).toBeVisible();
    await dockButton.click();
    await expect(dockButton).toHaveAttribute('aria-selected', 'true', { timeout: 8000 });

    const diagnosticsDetails = page.locator('#visitedDiagnosticsDetails');
    await expect(diagnosticsDetails).toBeVisible({ timeout: 12000 });
    if (!(await diagnosticsDetails.evaluate((el) => Boolean(el && el.open)))) {
      await diagnosticsDetails.locator('summary').click();
    }

    const diagnosticsModeSelect = page.locator('#visitedDiagnosticsSyncModeHost [data-achv-sync-mode][data-achv-subtab="outdoors"]:visible').first();
    const legacyModeSelect = page.locator('#achv-root-outdoors [data-achv-sync-mode]:visible').first();

    await page.waitForFunction(() => {
      const diagnostics = document.querySelector('#visitedDiagnosticsSyncModeHost [data-achv-sync-mode][data-achv-subtab="outdoors"]');
      const legacy = document.querySelector('#achv-root-outdoors [data-achv-sync-mode]');
      return Boolean(diagnostics || legacy);
    }, undefined, { timeout: 12000 });

    const useDiagnosticsSelect = (await diagnosticsModeSelect.count()) > 0;
    const modeSelect = useDiagnosticsSelect ? diagnosticsModeSelect : legacyModeSelect;
    const syncScope = useDiagnosticsSelect
      ? page.locator('#visitedDiagnosticsSyncModeHost')
      : page.locator('#achv-root-outdoors');
    await expect(modeSelect).toBeVisible({ timeout: 12000 });
    await expect(syncScope.getByText(/Matched by place ID:/i).first()).toBeVisible({ timeout: 12000 });
    await expect(syncScope.getByText(/catalog rows scanned:/i).first()).toBeVisible({ timeout: 12000 });
    await expect(syncScope.getByText(/categorized rows:/i).first()).toBeVisible({ timeout: 12000 });
    await expect(page.locator('#achv-root-outdoors .adventure-achv-tier-chip:visible .adventure-achv-tier-chip-name').filter({ hasText: /Rookie/i }).first()).toBeVisible({ timeout: 12000 });
    await expect(page.locator('#achv-root-outdoors .adventure-achv-tier-chip:visible .adventure-achv-tier-chip-name').filter({ hasText: /MVP/i }).first()).toBeVisible({ timeout: 12000 });

    // Manual fallback is intentionally removed; only automated matching modes remain.
    await expect(modeSelect.locator('option[value="manual"]')).toHaveCount(0);
    await modeSelect.selectOption('name-only');
    await expect(modeSelect).toHaveValue('name-only');
    await expect(syncScope.getByText(/Ignores Place IDs/i).first()).toBeVisible();

    // Ensure dashboard content still renders after switching matching mode.
    await expect(page.locator('#achv-root-outdoors').getByText(/Category Progression/i).first()).toBeVisible();
    await expect(page.locator('#achv-root-outdoors').getByText(/Challenges/i).first()).toBeVisible();
  });

  test('category totals sync CTA lives in the status row instead of Category Progression', async ({ page }) => {
    const dockButton = page.locator('#appSubTabsSlot [data-progress-subtab="outdoors"]').first();
    await expect(dockButton).toBeVisible();
    await dockButton.click();
    await expect(dockButton).toHaveAttribute('aria-selected', 'true', { timeout: 8000 });

    const statusSyncBtn = page.locator('#visitedSubtabStatus-outdoors [data-achv-sync-totals][data-achv-subtab="outdoors"]').first();
    await expect(statusSyncBtn).toBeVisible({ timeout: 12000 });
    await expect(statusSyncBtn).toHaveClass(/visited-subtab-status-sync-btn/);
    await expect(statusSyncBtn).toHaveClass(/is-needs-sync/);
    await expect(page.locator('#achv-root-outdoors [data-achv-sync-totals]')).toHaveCount(0);

    await statusSyncBtn.evaluate((node) => node.click());
    await expect(statusSyncBtn).not.toHaveClass(/is-needs-sync/);
  });
});

