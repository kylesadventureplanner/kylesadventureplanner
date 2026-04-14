const { test, expect } = require('./reliability-test');

async function readBirdsOverviewCtaDiagnostics(page) {
  return page.evaluate(() => {
    const row = document.querySelector('#natureChallengePane-birds .nature-birds-view.is-active[data-birds-view="overview"] .nature-explore-cta-actions');
    if (!row) {
      return { normalized: false, hasMap: false, present: [], visual: [] };
    }
    const nodes = Array.from(row.querySelectorAll('button'));
    const present = nodes.map((node) => String(node.id || '').trim()).filter(Boolean);
    const visual = nodes
      .map((node, index) => {
        const orderRaw = window.getComputedStyle(node).order;
        const order = Number.isFinite(Number(orderRaw)) ? Number(orderRaw) : 0;
        return {
          id: String(node.id || '').trim(),
          order,
          index
        };
      })
      .filter((entry) => entry.id)
      .sort((a, b) => (a.order - b.order) || (a.index - b.index))
      .map((entry) => entry.id);

    return {
      normalized: row.getAttribute('data-cta-normalized') === '1',
      hasMap: !!row.querySelector('#birdsOpenMapBtn'),
      present,
      visual
    };
  });
}

test.describe('Nature map context labels', () => {
  test('birds CTA order keeps injected Map between Log and Refresh', async ({ page }) => {
    await page.goto('/');
    await page.locator('.app-tab-btn[data-tab="nature-challenge"]').click();
    await expect(page.locator('#natureChallengeRoot')).toBeVisible();


    const expectedOrder = [
      'birdsExploreBtn',
      'birdsOpenLogBtn',
      'birdsOpenMapBtn',
      'natureChallengeRefreshBtn',
      'birdsUndoActionBtn'
    ];

    await expect.poll(async () => {
      const snapshot = await readBirdsOverviewCtaDiagnostics(page);
      return {
        hasButtons: snapshot.present.length > 0,
        hasMap: snapshot.hasMap,
        presentCount: snapshot.present.length,
        hasAllExpected: expectedOrder.every((id) => snapshot.present.includes(id))
      };
    }, { timeout: 12000 }).toEqual({
      hasButtons: true,
      hasMap: true,
      presentCount: expectedOrder.length,
      hasAllExpected: true
    });

    await expect.poll(async () => {
      const snapshot = await readBirdsOverviewCtaDiagnostics(page);
      return snapshot.visual;
    }, { timeout: 12000 }).toEqual(expectedOrder);
  });

  test('map header/back reflects active nature subtab context', async ({ page }) => {
    await page.goto('/');
    await page.locator('.app-tab-btn[data-tab="nature-challenge"]').click();
    await expect(page.locator('#natureChallengeRoot')).toBeVisible();

    await page.waitForFunction(() => typeof window.SightingMap?.open === 'function');

    // Subtabs are docked outside the root container, and click handlers are attached asynchronously.
    await page.waitForFunction(() => {
      const dockedTabs = document.querySelector('#appSubTabsSlot .nature-challenge-subtabs');
      return Boolean(dockedTabs && dockedTabs.dataset.natureDockBound === '1');
    });

    const activateNatureSubTab = async (subTabKey, expectedLabel) => {
      const button = page.locator(`#appSubTabsSlot [data-nature-subtab="${subTabKey}"]`).first();
      await button.click();
      await expect(button).toHaveAttribute('aria-selected', 'true');
      await expect(page.locator('#natureChallengeTitle')).toContainText(expectedLabel);
    };

    await activateNatureSubTab('mammals', 'Mammals');
    await page.evaluate(() => window.SightingMap.open());
    await expect(page.locator('#birdsMapOverlay')).toBeVisible();
    await expect(page.locator('#birdsMapCloseBtn')).toContainText('Back to Mammals');
    await expect(page.locator('#birdsMapOverlay .birds-map-title')).toContainText('Mammals Map');
    await page.locator('#birdsMapCloseBtn').click();

    await activateNatureSubTab('wildflowers', 'Wildflowers');
    await page.evaluate(() => window.SightingMap.open());
    await expect(page.locator('#birdsMapOverlay')).toBeVisible();
    await expect(page.locator('#birdsMapCloseBtn')).toContainText('Back to Wildflowers');
    await expect(page.locator('#birdsMapOverlay .birds-map-title')).toContainText('Wildflowers Map');
    await page.locator('#birdsMapCloseBtn').click();
  });
});

