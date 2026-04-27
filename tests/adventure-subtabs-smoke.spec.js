const { test, expect } = require('./reliability-test');

const ADVENTURE_SUBTABS = [
  {
    key: 'wildlife-animals',
    label: 'Wildlife & Animals',
    refreshAction: 'refresh-subtab-wildlife-animals',
    undoAction: 'undo-subtab-wildlife-animals',
    exploreAction: 'open-explorer-wildlife-animals',
    logAction: 'open-visit-log-wildlife-animals',
    legacyFindAction: 'find-wildlife-animals'
  },
  {
    key: 'regional-festivals',
    label: 'Regional Festivals',
    refreshAction: 'refresh-subtab-regional-festivals',
    undoAction: 'undo-subtab-regional-festivals',
    exploreAction: 'open-explorer-regional-festivals',
    logAction: 'open-visit-log-regional-festivals',
    legacyFindAction: 'find-regional-festivals'
  },
  {
    key: 'retail',
    label: 'Retail',
    refreshAction: 'refresh-subtab-retail',
    undoAction: 'undo-subtab-retail',
    exploreAction: 'open-explorer-retail',
    logAction: 'open-visit-log-retail',
    legacyFindAction: 'find-retail-location'
  }
];

test.describe('Adventure Challenge new subtabs smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('.app-tab-btn[data-tab="visited-locations"]').click();
    await expect(page.locator('#visitedLocationsRoot')).toBeVisible();
  });

  test('legacy top header controls are removed from Adventure Challenge', async ({ page }) => {
    await expect(page.locator('#visitedRefreshBtn')).toHaveCount(0);
    await expect(page.locator('#visitedWeatherMode')).toHaveCount(0);
    await expect(page.locator('#visitedCtaInjectorStatus')).toHaveCount(0);
  });

  test('default Outdoors pane uses Nature-style status pills', async ({ page }) => {
    await expect(page.locator('#visitedSubtabStatus-outdoors .visited-subtab-status-health')).toBeVisible();
    await expect(page.locator('#visitedSubtabStatus-outdoors .visited-subtab-status-meta')).toBeVisible();
    await expect(page.locator('#visitedSubtabStatus-outdoors .visited-subtab-status-health')).toContainText(/Outdoors data:/i);
  });

  test('adventure achievement sections keep sticky section-header style hook', async ({ page }) => {
    const stickyRulePresent = await page.evaluate(() => {
      const selectorNeedle = '#visitedLocationsRoot .adventure-achv-section > .card-header';
      const hasRequiredDeclarations = (text) => {
        return text.includes('position: sticky') && text.includes('top: 82px');
      };

      return Array.from(document.styleSheets).some((sheet) => {
        let cssText = '';
        try {
          const rules = sheet && sheet.cssRules ? Array.from(sheet.cssRules) : [];
          cssText = rules.map((rule) => String(rule.cssText || '')).join('\n');
        } catch (_error) {
          const ownerNode = sheet && sheet.ownerNode ? sheet.ownerNode : null;
          cssText = ownerNode ? String(ownerNode.textContent || '') : '';
        }

        return cssText.includes(selectorNeedle) && hasRequiredDeclarations(cssText);
      });
    });
    expect(stickyRulePresent).toBe(true);
  });

  test('jump links hide while Outdoors explorer view is open', async ({ page }) => {
    const jumpLinks = page.locator('#visitedLocationsRoot .visited-jump-links');
    await expect(jumpLinks).toHaveAttribute('aria-hidden', 'false');

    const openExplorerBtn = page.locator('#visitedProgressPane-outdoors [data-visited-subtab-action="open-explorer-outdoors"]').first();
    await expect(openExplorerBtn).toBeVisible();
    await openExplorerBtn.click();

    await expect(page.locator('#visitedProgressPane-outdoors [data-visited-subtab-view="explorer"]').first()).toBeVisible();
    await expect(jumpLinks).toHaveAttribute('hidden', '');
    await expect(jumpLinks).toHaveAttribute('aria-hidden', 'true');

    const closeExplorerBtn = page.locator('#visitedProgressPane-outdoors [data-visited-subtab-action="close-explorer-outdoors"]').first();
    await expect(closeExplorerBtn).toBeVisible();
    await closeExplorerBtn.click();

    await expect(page.locator('#visitedProgressPane-outdoors [data-visited-subtab-view="overview"]').first()).toBeVisible();
    await expect(jumpLinks).not.toHaveAttribute('hidden', '');
    await expect(jumpLinks).toHaveAttribute('aria-hidden', 'false');
  });

  ADVENTURE_SUBTABS.forEach(({ key, label, refreshAction, undoAction, exploreAction, logAction, legacyFindAction }) => {
    test(`subtab smoke: ${label}`, async ({ page }) => {
      const dockButton = page.locator(`#appSubTabsSlot [data-progress-subtab="${key}"]`).first();
      await expect(dockButton).toBeVisible();
      await dockButton.click();

      await expect(page.locator(`#visitedProgressPane-${key}`)).toBeVisible();
      await expect(page.locator(`#appSubTabsSlot [data-progress-subtab="${key}"][aria-selected="true"]`)).toBeVisible();
      await expect(page.locator(`#visitedSubtabStatus-${key} .visited-subtab-status-health`)).toBeVisible();
      await expect(page.locator(`#visitedSubtabStatus-${key} .visited-subtab-status-meta`)).toBeVisible();
      await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${refreshAction}"]`)).toHaveCount(1);
      await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${undoAction}"]`)).toHaveCount(1);
      await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${exploreAction}"]`)).toHaveCount(1);
      await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${logAction}"]`)).toHaveCount(1);
      await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${legacyFindAction}"]`)).toHaveCount(0);


      await dockButton.focus();
      await expect(dockButton).toBeFocused();

      await dockButton.press('ArrowRight');
      const selectedAfterRight = page.locator('#appSubTabsSlot [data-progress-subtab][aria-selected="true"]').first();
      await expect(selectedAfterRight).toBeVisible();
      await expect(selectedAfterRight).not.toHaveAttribute('data-progress-subtab', key);

      await selectedAfterRight.press('ArrowLeft');
      await expect(page.locator(`#appSubTabsSlot [data-progress-subtab="${key}"][aria-selected="true"]`).first()).toBeVisible();
    });
  });
});
