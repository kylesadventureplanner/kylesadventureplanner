const { test, expect } = require('./reliability-test');

const CTA_ORDER_CASES = [
  {
    key: 'outdoors',
    label: 'Outdoors',
    expectedActions: [
      'open-explorer-outdoors',
      'open-explorer-newtab-outdoors',
      'open-city-explorer-outdoors',
      'open-city-explorer-newtab-outdoors',
      'open-visit-log-outdoors',
      'open-visit-log-newtab-outdoors',
      'open-edit-mode-outdoors',
      'open-edit-mode-newtab-outdoors',
      'open-batch-tags-outdoors',
      'refresh-subtab-outdoors',
      'undo-subtab-outdoors'
    ]
  },
  {
    key: 'wildlife-animals',
    label: 'Wildlife & Animals',
    expectedActions: [
      'open-explorer-wildlife-animals',
      'open-explorer-newtab-wildlife-animals',
      'open-city-explorer-wildlife-animals',
      'open-city-explorer-newtab-wildlife-animals',
      'open-visit-log-wildlife-animals',
      'open-visit-log-newtab-wildlife-animals',
      'open-edit-mode-wildlife-animals',
      'open-edit-mode-newtab-wildlife-animals',
      'open-batch-tags-wildlife-animals',
      'refresh-subtab-wildlife-animals',
      'undo-subtab-wildlife-animals'
    ],
    legacyFindAction: 'find-wildlife-animals'
  },
  {
    key: 'regional-festivals',
    label: 'Regional Festivals',
    expectedActions: [
      'open-explorer-regional-festivals',
      'open-explorer-newtab-regional-festivals',
      'open-city-explorer-regional-festivals',
      'open-city-explorer-newtab-regional-festivals',
      'open-visit-log-regional-festivals',
      'open-visit-log-newtab-regional-festivals',
      'open-edit-mode-regional-festivals',
      'open-edit-mode-newtab-regional-festivals',
      'open-batch-tags-regional-festivals',
      'refresh-subtab-regional-festivals',
      'undo-subtab-regional-festivals'
    ],
    legacyFindAction: 'find-regional-festivals'
  },
  {
    key: 'retail',
    label: 'Retail',
    expectedActions: [
      'open-explorer-retail',
      'open-explorer-newtab-retail',
      'open-city-explorer-retail',
      'open-city-explorer-newtab-retail',
      'open-visit-log-retail',
      'open-visit-log-newtab-retail',
      'open-edit-mode-retail',
      'open-edit-mode-newtab-retail',
      'open-batch-tags-retail',
      'refresh-subtab-retail',
      'undo-subtab-retail'
    ],
    legacyFindAction: 'find-retail-location'
  },
  {
    key: 'bike-trails',
    label: 'Bike Trails',
    expectedActions: [
      'explore-bike-trails',
      'open-explorer-newtab-bike-trails',
      'open-city-explorer-bike-trails',
      'open-city-explorer-newtab-bike-trails',
      'open-edit-mode-bike-trails',
      'open-edit-mode-newtab-bike-trails',
      'open-batch-tags-bike-trails',
      'refresh-subtab-bike-trails',
      'undo-subtab-bike-trails'
    ],
    legacyFindAction: 'find-bike-trail'
  }
];

async function waitForCtaNormalized(page, subtabKey) {
  await page.waitForFunction((key) => {
    const row = document.querySelector(`#visitedProgressPane-${key} .visited-subtab-action-row`);
    return Boolean(row && row.getAttribute('data-cta-normalized') === '1');
  }, subtabKey);
}

async function readCtaDiagnostics(page, subtabKey) {
  return page.evaluate((key) => {
    const row = document.querySelector(`#visitedProgressPane-${key} .visited-subtab-action-row`);
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

test.describe('Adventure CTA canonical order', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('.app-tab-btn[data-tab="visited-locations"]').click();
    await expect(page.locator('#visitedLocationsRoot')).toBeVisible();
  });

  CTA_ORDER_CASES.forEach(({ key, label, expectedActions, legacyFindAction }) => {
    test(`CTA order: ${label}`, async ({ page }) => {
      await page.locator(`#appSubTabsSlot [data-progress-subtab="${key}"]`).first().click();
      await expect(page.locator(`#visitedProgressPane-${key}`)).toBeVisible();

      await waitForCtaNormalized(page, key);

      if (legacyFindAction) {
        await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${legacyFindAction}"]`)).toHaveCount(0);
      }

      await expect.poll(async () => {
        const snapshot = await readCtaDiagnostics(page, key);
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
        const snapshot = await readCtaDiagnostics(page, key);
        return snapshot.visual;
      }, { timeout: 15000 }).toEqual(expectedActions);
    });
  });

  test('newtab CTA actions route to standalone targets', async ({ page }) => {
    await page.locator('#appSubTabsSlot [data-progress-subtab="outdoors"]').first().click();
    await expect(page.locator('#visitedProgressPane-outdoors')).toBeVisible();
    await waitForCtaNormalized(page, 'outdoors');

    await page.evaluate(() => {
      const opened = [];
      window.__openedNewtabUrls = opened;
      // Force standalone fallback URLs so assertions are deterministic in smoke mode.
      window.openCityViewerInNewTab = undefined;
      window.openCityViewerWindow = undefined;
      window.prepareCityViewerInlineUrl = undefined;
      window.open = (url, target, features) => {
        opened.push({
          url: String(url || ''),
          target: String(target || ''),
          features: String(features || '')
        });
        return { focus() {} };
      };
    });

    const clickAndRead = async (action) => {
      await page.locator(`#visitedProgressPane-outdoors [data-visited-subtab-action="${action}"]`).first().click();
      return page.evaluate(() => {
        const list = Array.isArray(window.__openedNewtabUrls) ? window.__openedNewtabUrls : [];
        return list[list.length - 1] || null;
      });
    };

    const explorer = await clickAndRead('open-explorer-newtab-outdoors');
    expect(explorer).toBeTruthy();
    expect(explorer.target).toBe('_blank');
    expect(explorer.url).toContain('adventure-explorer-window.html');
    expect(explorer.url).toContain('subtab=outdoors');
    expect(explorer.features.includes('noopener')).toBeFalsy();

    const cityExplorer = await clickAndRead('open-city-explorer-newtab-outdoors');
    expect(cityExplorer).toBeTruthy();
    expect(cityExplorer.target).toBe('_blank');
    expect(cityExplorer.url).toContain('city-viewer-window.html');

    const visitLog = await clickAndRead('open-visit-log-newtab-outdoors');
    expect(visitLog).toBeTruthy();
    expect(visitLog.target).toBe('_blank');
    expect(visitLog.url).toContain('visit-log-window.html');
    expect(visitLog.url).not.toContain('embedded=1');

    const editMode = await clickAndRead('open-edit-mode-newtab-outdoors');
    expect(editMode).toBeTruthy();
    expect(editMode.target).toBe('_blank');
    expect(editMode.url).toContain('edit-mode-enhanced.html');
    expect(editMode.url).not.toContain('embedded=1');
  });
});

