const { test, expect } = require('./reliability-test');

const ADVENTURE_SUBTABS = [
  {
    key: 'wildlife-animals',
    label: 'Wildlife & Animals',
    refreshAction: 'refresh-subtab-wildlife-animals',
    undoAction: 'undo-subtab-wildlife-animals',
    exploreAction: 'open-explorer-wildlife-animals',
    cityAction: 'open-city-explorer-wildlife-animals',
    logAction: 'open-visit-log-wildlife-animals',
    editAction: 'open-edit-mode-wildlife-animals',
    legacyFindAction: 'find-wildlife-animals'
  },
  {
    key: 'regional-festivals',
    label: 'Regional Festivals',
    refreshAction: 'refresh-subtab-regional-festivals',
    undoAction: 'undo-subtab-regional-festivals',
    exploreAction: 'open-explorer-regional-festivals',
    cityAction: 'open-city-explorer-regional-festivals',
    logAction: 'open-visit-log-regional-festivals',
    editAction: 'open-edit-mode-regional-festivals',
    legacyFindAction: 'find-regional-festivals'
  },
  {
    key: 'retail',
    label: 'Retail',
    refreshAction: 'refresh-subtab-retail',
    undoAction: 'undo-subtab-retail',
    exploreAction: 'open-explorer-retail',
    cityAction: 'open-city-explorer-retail',
    logAction: 'open-visit-log-retail',
    editAction: 'open-edit-mode-retail',
    legacyFindAction: 'find-retail-location'
  }
];

function getVisualActionOrder(selector) {
  return async (page) => page.locator(selector).evaluateAll((nodes) => {
    return nodes
      .map((node, index) => {
        const orderRaw = window.getComputedStyle(node).order;
        const order = Number.isFinite(Number(orderRaw)) ? Number(orderRaw) : 0;
        return {
          action: String(node.getAttribute('data-visited-subtab-action') || '').trim(),
          order,
          index
        };
      })
      .filter((entry) => entry.action)
      .sort((a, b) => (a.order - b.order) || (a.index - b.index))
      .map((entry) => entry.action);
  });
}

async function readAdventureCtaDiagnostics(page, subtabKey) {
  return page.evaluate((key) => {
    const row = document.querySelector(`#visitedProgressPane-${key} .ui-intro-card .visited-subtab-action-row`)
      || document.querySelector(`#visitedProgressPane-${key} .visited-subtab-action-row`);
    if (!row) {
      return { normalized: false, present: [], visual: [] };
    }

    const buttons = Array.from(row.querySelectorAll('button[data-visited-subtab-action]'));
    const present = buttons
      .map((node) => String(node.getAttribute('data-visited-subtab-action') || '').trim())
      .filter(Boolean);
    const visual = buttons
      .map((node, index) => {
        const orderRaw = window.getComputedStyle(node).order;
        const order = Number.isFinite(Number(orderRaw)) ? Number(orderRaw) : 0;
        return {
          action: String(node.getAttribute('data-visited-subtab-action') || '').trim(),
          order,
          index
        };
      })
      .filter((entry) => entry.action)
      .sort((a, b) => (a.order - b.order) || (a.index - b.index))
      .map((entry) => entry.action);

    return {
      normalized: row.getAttribute('data-cta-normalized') === '1',
      present,
      visual
    };
  }, subtabKey);
}

async function waitForAdventureCtaNormalized(page, subtabKey) {
  await page.waitForFunction((key) => {
    const row = document.querySelector(`#visitedProgressPane-${key} .visited-subtab-action-row`);
    return Boolean(row && row.getAttribute('data-cta-normalized') === '1');
  }, subtabKey);
}

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
      return Array.from(document.querySelectorAll('style')).some((style) => {
        const text = String(style.textContent || '');
        return text.includes('#visitedLocationsRoot .adventure-achv-section > .card-header')
          && text.includes('position: sticky')
          && text.includes('top: 82px');
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

  test('Outdoors CTA row preserves canonical action order', async ({ page }) => {
    const expectedActions = [
      'open-explorer-outdoors',
      'open-city-explorer-outdoors',
      'open-visit-log-outdoors',
      'open-edit-mode-outdoors',
      'refresh-subtab-outdoors',
      'undo-subtab-outdoors'
    ];
    await waitForAdventureCtaNormalized(page, 'outdoors');
    await expect.poll(async () => {
      const snapshot = await readAdventureCtaDiagnostics(page, 'outdoors');
      return {
        normalized: snapshot.normalized,
        presentCount: snapshot.present.length,
        hasAllExpected: expectedActions.every((action) => snapshot.present.includes(action))
      };
    }, { timeout: 15000 }).toEqual({
      normalized: true,
      presentCount: expectedActions.length,
      hasAllExpected: true
    });
    await expect.poll(async () => {
      const snapshot = await readAdventureCtaDiagnostics(page, 'outdoors');
      return snapshot.visual;
    }, { timeout: 15000 }).toEqual(expectedActions);
  });

  ADVENTURE_SUBTABS.forEach(({ key, label, refreshAction, undoAction, exploreAction, cityAction, logAction, editAction, legacyFindAction }) => {
    test(`subtab smoke: ${label}`, async ({ page }) => {
      const dockButton = page.locator(`#appSubTabsSlot [data-progress-subtab="${key}"]`).first();
      await expect(dockButton).toBeVisible();
      await dockButton.click();

      await expect(page.locator(`#visitedProgressPane-${key}`)).toBeVisible();
      await waitForAdventureCtaNormalized(page, key);
      await expect(page.locator(`#appSubTabsSlot [data-progress-subtab="${key}"][aria-selected="true"]`)).toBeVisible();
      await expect(page.locator(`#visitedSubtabStatus-${key} .visited-subtab-status-health`)).toBeVisible();
      await expect(page.locator(`#visitedSubtabStatus-${key} .visited-subtab-status-meta`)).toBeVisible();
      await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${refreshAction}"]`)).toHaveCount(1);
      await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${undoAction}"]`)).toHaveCount(1);
      await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${exploreAction}"]`)).toHaveCount(1);
      await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${cityAction}"]`)).toHaveCount(1);
      await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${logAction}"]`)).toHaveCount(1);
      await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${editAction}"]`)).toHaveCount(1);
      await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${legacyFindAction}"]`)).toHaveCount(0);

      const expectedActions = [
        exploreAction,
        cityAction,
        logAction,
        editAction,
        refreshAction,
        undoAction
      ];
      await expect.poll(async () => {
        const snapshot = await readAdventureCtaDiagnostics(page, key);
        return {
          normalized: snapshot.normalized,
          presentCount: snapshot.present.length,
          hasAllExpected: expectedActions.every((action) => snapshot.present.includes(action))
        };
      }, { timeout: 15000 }).toEqual({
        normalized: true,
        presentCount: expectedActions.length,
        hasAllExpected: true
      });
      await expect.poll(async () => {
        const snapshot = await readAdventureCtaDiagnostics(page, key);
        return snapshot.visual;
      }, { timeout: 15000 }).toEqual(expectedActions);

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
