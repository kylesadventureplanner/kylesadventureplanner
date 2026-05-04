const { test, expect } = require('./reliability-test');
const { openAdventureChallenge, waitForEmbeddedFrameReady } = require('./playwright-helpers');

// Keep retries scoped to this spec so flaky CI runs capture a trace.zip
// without broadening retry behavior across the full smoke suite.
test.describe.configure({ retries: process.env.CI ? 1 : 0 });

const MOCK_EXPLORER_TABLE = {
  values: [
    [
      'Name',
      'City',
      'State',
      'Tags',
      'Description',
      'Address',
      'Hours',
      'Drive Time',
      'Website',
      'Phone',
      'Google Rating',
      'Cost',
      'Google URL'
    ],
    [
      'Mock Adventure Spot Alpha',
      'Austin',
      'TX',
      'hiking;scenic',
      'Playwright-seeded alpha location for details flow validation.',
      '123 Trailhead Way',
      '9:00 AM - 6:00 PM',
      '22 min',
      'https://example.com/mock-adventure-spot-alpha',
      '555-0100',
      '4.8',
      '$$',
      'https://maps.google.com/?q=Mock+Adventure+Spot+Alpha'
    ],
    [
      'Mock Adventure Spot Beta',
      'Boone',
      'NC',
      'coffee;outdoors',
      'Playwright-seeded beta location for details flow validation.',
      '456 Summit Road',
      '8:00 AM - 4:00 PM',
      '34 min',
      'https://example.com/mock-adventure-spot-beta',
      '555-0101',
      '4.5',
      '$',
      'https://maps.google.com/?q=Mock+Adventure+Spot+Beta'
    ],
    [
      'Mock Adventure Spot Gamma',
      'Austin',
      'TX',
      'scenic;park',
      'Playwright-seeded gamma location for details flow validation.',
      '789 Creekside Drive',
      '10:00 AM - 7:00 PM',
      '41 min',
      'https://example.com/mock-adventure-spot-gamma',
      '555-0102',
      '4.9',
      '$$$',
      'https://maps.google.com/?q=Mock+Adventure+Spot+Gamma'
    ]
  ]
};

const ONE_PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9sotW1cAAAAASUVORK5CYII=',
  'base64'
);

async function mockExplorerWorkbookRequests(page) {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'accessToken', {
      configurable: true,
      get() {
        return 'playwright-mock-token';
      },
      set(_value) {}
    });
    // Ensure deterministic explorer draft state for each test run.
    localStorage.removeItem('visitedExplorerCardStateV1');
  });

  const headerRow = Array.isArray(MOCK_EXPLORER_TABLE.values) && Array.isArray(MOCK_EXPLORER_TABLE.values[0])
    ? MOCK_EXPLORER_TABLE.values[0].map((value) => String(value || ''))
    : [];
  const columnNames = headerRow
    .concat(['My Rating', 'Favorite Status'])
    .map((name) => String(name || '').trim())
    .filter(Boolean);
  const dataRows = (Array.isArray(MOCK_EXPLORER_TABLE.values) ? MOCK_EXPLORER_TABLE.values.slice(1) : [])
    .map((row) => (Array.isArray(row) ? row.slice() : []));

  await page.route('https://graph.microsoft.com/**', async (route) => {
    const req = route.request();
    const url = req.url();
    const method = req.method();
    if (!url.includes('/workbook/tables/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({})
      });
      return;
    }

    if (url.includes('/columns')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          value: columnNames.map((name, index) => ({ name, index }))
        })
      });
      return;
    }

    const itemAtMatch = url.match(/\/rows\/itemAt\(index=(\d+)\)/i);
    if (itemAtMatch) {
      const rowIndex = Number(itemAtMatch[1]);
      const normalizedRow = Number.isInteger(rowIndex) && rowIndex >= 0 && Array.isArray(dataRows[rowIndex])
        ? dataRows[rowIndex]
        : [];

      if (method === 'PATCH') {
        let payload;
        try {
          payload = req.postDataJSON ? req.postDataJSON() : JSON.parse(String(req.postData() || '{}'));
        } catch (_error) {
          payload = {};
        }
        const incomingValues = payload && Array.isArray(payload.values) && Array.isArray(payload.values[0])
          ? payload.values[0]
          : null;
        if (incomingValues && Number.isInteger(rowIndex) && rowIndex >= 0) {
          dataRows[rowIndex] = incomingValues.slice();
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ values: [incomingValues || normalizedRow] })
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ values: [normalizedRow] })
      });
      return;
    }

    if (!url.includes('/range')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({})
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_EXPLORER_TABLE)
    });
  });
}

const EXPLORER_CASES = [
  { key: 'outdoors', openAction: 'open-explorer-outdoors', closeAction: 'close-explorer-outdoors' },
  { key: 'entertainment', openAction: 'open-explorer-entertainment', closeAction: 'close-explorer-entertainment' },
  { key: 'food-drink', openAction: 'open-explorer-food-drink', closeAction: 'close-explorer-food-drink' },
  { key: 'retail', openAction: 'open-explorer-retail', closeAction: 'close-explorer-retail' },
  { key: 'wildlife-animals', openAction: 'open-explorer-wildlife-animals', closeAction: 'close-explorer-wildlife-animals' },
  { key: 'regional-festivals', openAction: 'open-explorer-regional-festivals', closeAction: 'close-explorer-regional-festivals' }
];

async function gotoAdventureChallenge(page) {
  // This spec iterates advanced-only Adventure subtabs, so always bootstrap in advanced mode.
  await openAdventureChallenge(page, { mode: 'advanced', subtabKey: 'outdoors' });
}

async function openExplorerAndFindDetails(page) {
  for (const config of EXPLORER_CASES) {
    const { key, openAction, closeAction } = config;

    await page.locator(`#appSubTabsSlot [data-progress-subtab="${key}"]`).first().click();
    const paneRoot = page.locator(`#visitedProgressPane-${key}`);
    await expect(paneRoot).toBeVisible();

    const openBtn = paneRoot.locator(`[data-visited-subtab-action="${openAction}"]`).first();
    await expect(openBtn).toBeVisible();
    await openBtn.click();

    const explorerView = paneRoot.locator('[data-visited-subtab-view="explorer"]').first();
    const explorerOpenedViaClick = await expect
      .poll(async () => explorerView.isVisible().catch(() => false), { timeout: 3000 })
      .toBe(true)
      .then(() => true)
      .catch(() => false);
    if (!explorerOpenedViaClick) {
      await openBtn.evaluate((node) => node.click());
    }
    await expect(explorerView).toBeVisible({ timeout: 10000 });

    const list = page.locator(`#visitedExplorerList-${key}`);
    await expect(list).toBeVisible();
    await expect(list).not.toContainText('Loading explorer cards...', { timeout: 20000 });

    const detailsBtn = list.locator('[data-visited-explorer-details]').first();
    if ((await detailsBtn.count()) > 0) {
      return { key, closeAction };
    }

    const closeBtn = paneRoot.locator(`[data-visited-subtab-action="${closeAction}"]`).first();
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await expect(paneRoot.locator('[data-visited-subtab-view="overview"]').first()).toBeVisible();
  }

  throw new Error('No explorer details button was found in any Adventure subtab.');
}

async function withLiveDetailsFrame(detailsFrame, run) {
  const liveFrameHandle = await detailsFrame.elementHandle();
  const liveFrame = liveFrameHandle ? await liveFrameHandle.contentFrame() : null;
  if (!liveFrame) throw new Error('Adventure details iframe was not available.');
  return run(liveFrame);
}

async function ensureDetailsFrameReady(detailsFrame) {
  await waitForEmbeddedFrameReady(detailsFrame, {
    srcPattern: /adventure-details-window\.html/i,
    bodySelector: '#tabs',
    timeout: 15000
  });

  await expect.poll(async () => withLiveDetailsFrame(detailsFrame, (liveFrame) => liveFrame.evaluate(() => {
    if (window.__detailInlineEditState && window.__detailInlineEditState.data) return true;
    if (window.__detailCurrentPayload && window.__detailCurrentPayload.data && typeof window.render === 'function') {
      window.render(window.__detailCurrentPayload);
    }
    return !!(window.__detailInlineEditState && window.__detailInlineEditState.data);
  })), { timeout: 15000 }).toBe(true);
}

async function activateDetailsTab(detailsFrame, detailsFrameLocator, tabId) {
  const requestedTabId = String(tabId || 'overview').trim().toLowerCase();
  const normalizedTabId = requestedTabId === 'details' ? 'overview' : requestedTabId;
  const tabButton = detailsFrameLocator.locator(`#tabs .tab-btn[data-tab="${normalizedTabId}"]`);
  await expect(detailsFrameLocator.locator('#tabs')).toBeVisible();
  await expect(tabButton).toBeVisible();

  await withLiveDetailsFrame(detailsFrame, (liveFrame) => liveFrame.evaluate((targetTabId) => {
    const safeTabId = String(targetTabId || 'overview').replace(/"/g, '');
    if (typeof window.activateTab === 'function') {
      window.activateTab(safeTabId);
      return;
    }
    const btn = document.querySelector(`#tabs .tab-btn[data-tab="${safeTabId}"]`);
    if (btn && typeof btn.click === 'function') btn.click();
  }, normalizedTabId));

  await expect.poll(async () => tabButton.getAttribute('aria-selected'), { timeout: 10000 }).toBe('true');
  await expect.poll(async () => withLiveDetailsFrame(detailsFrame, (liveFrame) => liveFrame.evaluate((targetTabId) => {
    const safeTab = String(targetTabId || '').replace(/"/g, '').trim().toLowerCase();
    const paneKey = (!safeTab || safeTab === 'overview' || safeTab === 'details')
      ? 'details'
      : (safeTab === 'additional' ? 'nearby' : safeTab);
    var pane = document.querySelector(`#pane-${paneKey}`);
    if (!pane && paneKey === 'nearby') pane = document.querySelector('#pane-additional');
    if (!pane) return false;
    return (
      pane.getAttribute('aria-hidden') === 'false'
      && pane.hidden === false
      && pane.classList.contains('active')
    );
  }, normalizedTabId)), { timeout: 10000 }).toBe(true);
}

async function clickDetailsControl(detailsFrame, selector) {
  await withLiveDetailsFrame(detailsFrame, (liveFrame) => liveFrame.evaluate((targetSelector) => {
    const element = document.querySelector(String(targetSelector || ''));
    if (!element || typeof element.click !== 'function') {
      throw new Error(`Missing details control: ${String(targetSelector || '')}`);
    }
    element.click();
  }, selector));
}

async function forceOpenEnrichPasteBody(detailsFrame) {
  await withLiveDetailsFrame(detailsFrame, (liveFrame) => liveFrame.evaluate(() => {
    const body = document.getElementById('enrichPasteBody');
    const arrow = document.getElementById('enrichPasteArrow');
    if (!body) return;
    body.classList.add('open');
    if (arrow) arrow.textContent = '▼';
  }));
}

async function readTagSaveDebug(detailsFrame) {
  return withLiveDetailsFrame(detailsFrame, (liveFrame) => liveFrame.evaluate(() => {
    const debug = window.__lastTagSaveDebug || {};
    const steps = Array.isArray(debug.steps) ? debug.steps : [];
    const hostStep = steps.find((entry) => entry && entry.step === 'host_context');
    return {
      finalStatus: String(debug.finalStatus || ''),
      hostContext: hostStep && hostStep.detail ? String(hostStep.detail.context || '') : '',
      stepCount: steps.length
    };
  }));
}

test.describe('Adventure explorer in-pane details flow', () => {
  test('opens details in-pane, shows richer fields, and returns to list', async ({ page }) => {
    await mockExplorerWorkbookRequests(page);
    await gotoAdventureChallenge(page);

    const { key } = await openExplorerAndFindDetails(page);
    const list = page.locator(`#visitedExplorerList-${key}`);
    const firstCard = list.locator('.visited-explorer-card').first();
    await expect(firstCard).toBeVisible();

    await expect(firstCard.locator('[data-visited-explorer-visit-state]').first()).toHaveAttribute(
      'data-visited-explorer-visit-state',
      /^(visited|unvisited)$/
    );

    const detailsBtn = firstCard.locator('[data-visited-explorer-details]').first();
    const quickActionsBtn = firstCard.locator('[data-visited-explorer-quick-actions-toggle]').first();
    const quickActionsMenu = firstCard.locator('[data-visited-explorer-quick-actions-menu]').first();
    const favoriteBtn = firstCard.locator('[data-visited-explorer-favorite]').first();
    await expect(detailsBtn).toBeVisible();
    await expect(quickActionsBtn).toBeVisible();
    await expect(quickActionsMenu).toBeHidden();
    await expect(quickActionsBtn).toHaveAttribute('aria-expanded', 'false');
    await expect(favoriteBtn).toBeVisible();

    await quickActionsBtn.click();
    await expect(quickActionsMenu).toBeVisible();
    await expect(quickActionsBtn).toHaveAttribute('aria-expanded', 'true');
    await quickActionsBtn.click();
    await expect(quickActionsMenu).toBeHidden();
    await expect(quickActionsBtn).toHaveAttribute('aria-expanded', 'false');

    const headActions = firstCard.locator('.visited-explorer-card-head-actions > button');
    await expect(headActions.first()).toHaveAttribute('data-visited-explorer-details');

    await favoriteBtn.click();
    await expect(firstCard.locator('[data-visited-explorer-favorite]').first()).toContainText('Favorited');

    await firstCard.locator('[data-visited-explorer-rate][data-visited-explorer-rating-value="4"]').first().click();
    await expect(firstCard.locator('.visited-explorer-star.is-active')).toHaveCount(4);

    await expect(detailsBtn).toBeVisible();
    await detailsBtn.click();

    const paneRoot = page.locator(`#visitedProgressPane-${key}`);
    const explorerView = paneRoot.locator('[data-visited-subtab-view="explorer"]').first();
    const detailsView = paneRoot.locator('[data-visited-subtab-view="explorer-details"]').first();
    await expect(detailsView).toBeVisible();
    await expect(explorerView).toBeHidden();

    const title = page.locator(`#visitedExplorerDetailsPageTitle-${key}`);
    await expect(title).toBeVisible();
    await expect(title).not.toHaveText(/^\s*Location Details\s*$/);

    const detailsFrame = page.locator(`#visitedExplorerDetailsFrame-${key}`);
    await expect(detailsFrame).toBeVisible();
    await expect(detailsFrame).toHaveAttribute('src', /adventure-details-window\.html/i);
    await expect(detailsView.locator(':scope > .visited-inline-tool-header-card')).toBeVisible();
    await expect(detailsView.locator(':scope > .visited-inline-tool-frame')).toHaveCount(1);
    const frameHandle = await detailsFrame.elementHandle();
    const plannerDetailsFrame = frameHandle ? await frameHandle.contentFrame() : null;
    expect(plannerDetailsFrame).not.toBeNull();
    const plannerDetailsFrameLocator = page.frameLocator(`#visitedExplorerDetailsFrame-${key}`);

    await expect(plannerDetailsFrameLocator.locator('#tabs .tab-btn[data-tab="overview"]')).toHaveClass(/active/);
    await expect(plannerDetailsFrameLocator.locator('#refreshDescriptionBtn')).toBeVisible();
    await expect(plannerDetailsFrameLocator.locator('#actionBar')).toBeVisible();
    await expect(plannerDetailsFrameLocator.locator('#abBatchTagsBtn')).toBeVisible();
    const ratingResetBtn = plannerDetailsFrameLocator.locator('#abRatingResetBtn');
    await expect(ratingResetBtn).toBeVisible();
    await ratingResetBtn.click();
    await expect(plannerDetailsFrameLocator.locator('.star-btn.lit')).toHaveCount(0);

    await activateDetailsTab(detailsFrame, plannerDetailsFrameLocator, 'tag-management');
    await expect(plannerDetailsFrameLocator.locator('#pane-tag-management')).toBeVisible();
    await clickDetailsControl(detailsFrame, '#tmSaveBtn');

    await expect.poll(async () => {
      const snapshot = await readTagSaveDebug(detailsFrame);
      return snapshot.finalStatus;
    }, { timeout: 20000 }).toMatch(/^(success_excel|success_planner_only|success_local_only|failed)$/);

    await expect.poll(async () => {
      const snapshot = await readTagSaveDebug(detailsFrame);
      return snapshot.hostContext;
    }, { timeout: 20000 }).toMatch(/^(parent|opener)$/);

    await activateDetailsTab(detailsFrame, plannerDetailsFrameLocator, 'notes');
    await expect(plannerDetailsFrameLocator.locator('#pane-notes')).toHaveAttribute('aria-hidden', 'false');
    await expect(plannerDetailsFrameLocator.locator('#detailNotesWrap')).toBeVisible();

    await activateDetailsTab(detailsFrame, plannerDetailsFrameLocator, 'details');
    await expect(plannerDetailsFrameLocator.locator('#refreshHoursBtn')).toBeVisible();
    await expect(plannerDetailsFrameLocator.locator('[data-detail-field-card="googleRating"] .google-rating-stars')).toBeVisible();
    await expect(plannerDetailsFrameLocator.locator('[data-detail-field-card="googleRating"] .google-rating-stars')).toContainText(/★/);
    const inlineEditBtn = plannerDetailsFrameLocator.locator('#abInlineEditBtn');
    if (await inlineEditBtn.count()) {
      const inlineEditPanel = plannerDetailsFrameLocator.locator('#detailInlineEditPanel');
      await expect(inlineEditBtn).toBeVisible();
      await inlineEditBtn.click();
      const panelVisibleAfterFirstClick = await inlineEditPanel.isVisible().catch(() => false);
      if (!panelVisibleAfterFirstClick) {
        await inlineEditBtn.click();
      }
      await expect(inlineEditPanel).toBeVisible({ timeout: 10000 });
      await plannerDetailsFrameLocator.locator('#inlineEdit_hoursOfOperation').fill('11:00 AM - 9:00 PM');
      await expect(plannerDetailsFrameLocator.locator('#detailInlineEditDirtyCount')).toContainText('1 field changed');
      await expect(plannerDetailsFrameLocator.locator('[data-detail-field-card="hoursOfOperation"]')).toHaveClass(/is-dirty/);

      await withLiveDetailsFrame(detailsFrame, (liveFrame) => liveFrame.evaluate(() => {
        window.__inlineEditConfirmPrompts = [];
        window.__inlineEditConfirmResponses = [false, true];
        window.confirm = (message) => {
          const text = String(message || '');
          window.__inlineEditConfirmPrompts.push(text);
          const next = window.__inlineEditConfirmResponses.shift();
          return Boolean(next);
        };
      }));

      await plannerDetailsFrameLocator.locator('#tabs .tab-btn[data-tab="notes"]').click();
      await expect(plannerDetailsFrameLocator.locator('#pane-details[aria-hidden="false"]')).toBeVisible();
      await expect(plannerDetailsFrameLocator.locator('#detailInlineEditPanel')).toBeVisible();
      const firstPrompt = await withLiveDetailsFrame(detailsFrame, (liveFrame) => liveFrame.evaluate(() => String((window.__inlineEditConfirmPrompts || [])[0] || '')));
      if (firstPrompt) {
        expect(firstPrompt).toContain('unsaved inline field edits');
      }

      await withLiveDetailsFrame(detailsFrame, (liveFrame) => liveFrame.evaluate(() => {
        window.__inlineEditConfirmResponses = [true];
      }));
      await activateDetailsTab(detailsFrame, plannerDetailsFrameLocator, 'notes');

      await activateDetailsTab(detailsFrame, plannerDetailsFrameLocator, 'details');
      await expect(plannerDetailsFrameLocator.locator('#detailInlineEditPanel')).toBeVisible();
      const saveInlineBtn = plannerDetailsFrameLocator.locator('#inlineEditSaveBtn');
      await expect(saveInlineBtn).toBeEnabled();
      await withLiveDetailsFrame(detailsFrame, (liveFrame) => liveFrame.evaluate(async () => {
        if (typeof window.saveInlineEditFields === 'function') {
          await window.saveInlineEditFields();
          return;
        }
        const btn = document.getElementById('inlineEditSaveBtn');
        if (btn && typeof btn.click === 'function') btn.click();
      }));
      const clearedDirtyState = await expect.poll(async () => {
        const frameHandleNow = await detailsFrame.elementHandle();
        const liveFrameNow = frameHandleNow ? await frameHandleNow.contentFrame() : null;
        if (!liveFrameNow) return true;
        return liveFrameNow.evaluate(() => {
          const card = document.querySelector('[data-detail-field-card="hoursOfOperation"]');
          return !card || !card.classList.contains('is-dirty');
        });
      }, { timeout: 15000 }).toBe(true).then(() => true).catch(() => false);

      if (!clearedDirtyState) {
        await withLiveDetailsFrame(detailsFrame, (liveFrame) => liveFrame.evaluate(async () => {
          if (typeof window.saveInlineEditFields === 'function') {
            await window.saveInlineEditFields();
            return;
          }
          const btn = document.getElementById('inlineEditSaveBtn');
          if (btn && typeof btn.click === 'function') btn.click();
        }));
      }

      await expect.poll(async () => {
        const frameHandleNow = await detailsFrame.elementHandle();
        const liveFrameNow = frameHandleNow ? await frameHandleNow.contentFrame() : null;
        if (!liveFrameNow) return true;
        return liveFrameNow.evaluate(() => {
          const card = document.querySelector('[data-detail-field-card="hoursOfOperation"]');
          return !card || !card.classList.contains('is-dirty');
        });
      }, { timeout: 15000 }).toBe(true);
    }

    await expect(page.locator('#visitedExplorerDetailsModal')).toBeHidden();

    const backBtn = paneRoot
      .locator(`[data-visited-subtab-action="close-explorer-details-${key}"]`)
      .first();
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    await expect(detailsView).toBeHidden();
    await expect(explorerView).toBeVisible();
    await expect(page.locator(`#visitedExplorerList-${key}`)).toBeVisible();

    await quickActionsBtn.click();
    const tagMenuBtn = firstCard.locator('[data-visited-explorer-quick-actions-menu] [data-visited-explorer-tags]').first();
    if (!(await tagMenuBtn.isVisible())) await quickActionsBtn.click();
    await expect(tagMenuBtn).toBeVisible();
    await tagMenuBtn.click();
    await expect(detailsView).toBeVisible();
    await expect(page.locator(`#visitedExplorerDetailsFrame-${key}`)).toHaveAttribute('src', /initialTab=tag-management/i);
    await backBtn.click();

    await quickActionsBtn.click();
    const notesMenuBtn = firstCard.locator('[data-visited-explorer-quick-actions-menu] [data-visited-explorer-notes]').first();
    if (!(await notesMenuBtn.isVisible())) await quickActionsBtn.click();
    await expect(notesMenuBtn).toBeVisible();
    await notesMenuBtn.click();
    await expect(detailsView).toBeVisible();
    await expect(page.locator(`#visitedExplorerDetailsFrame-${key}`)).toHaveAttribute('src', /initialTab=notes/i);
  });

  test('details enrich modal auto-fetches Google fields and saves them through explorer sync', async ({ page }) => {
    await mockExplorerWorkbookRequests(page);
    await gotoAdventureChallenge(page);

    const { key } = await openExplorerAndFindDetails(page);
    const list = page.locator(`#visitedExplorerList-${key}`);
    const firstCard = list.locator('.visited-explorer-card').first();
    await firstCard.locator('[data-visited-explorer-details]').first().click();

    const detailsFrame = page.locator(`#visitedExplorerDetailsFrame-${key}`);
    await expect(detailsFrame).toBeVisible();
    const plannerDetailsFrameLocator = page.frameLocator(`#visitedExplorerDetailsFrame-${key}`);

    await page.evaluate(() => {
      window.getPlaceDetails = async () => ({
        address: '1600 Amphitheatre Parkway, Mountain View, CA 94043',
        phone: '(650) 253-0000',
        hours: { Monday: '8:00 AM – 5:00 PM', Tuesday: '8:00 AM – 5:00 PM' },
        description: 'A Google-fetched enriched description for Playwright verification.',
        reviews: []
      });
      window.__lastExplorerEnrichUpdates = null;
      window.syncVisitedExplorerDetailFields = async (_sourceMeta, updates) => {
        window.__lastExplorerEnrichUpdates = updates;
        return { synced: true, excelSaved: true, reason: 'saved' };
      };
    });

    await expect(plannerDetailsFrameLocator.locator('#abEnrichBtn')).toBeVisible();
    await plannerDetailsFrameLocator.locator('#abEnrichBtn').click();
    await expect(plannerDetailsFrameLocator.locator('#enrichModal.open')).toBeVisible();

    const frameHandle = await detailsFrame.elementHandle();
    const liveFrame = frameHandle ? await frameHandle.contentFrame() : null;
    expect(liveFrame).not.toBeNull();

    // Reset persisted nearby filters so prior test state cannot hide fresh results.
    await liveFrame.evaluate(() => {
      var defaults = { radiusMiles: 5, category: 'all', minRating: 0, openNow: false, timeBudgetHours: 0 };
      try {
        localStorage.removeItem('__detail_nearby_ui_prefs_v3');
      } catch (_storageErr) {
        // Ignore storage availability issues in hardened test environments.
      }
      if (typeof window.persistNearbyUiState === 'function') {
        window.persistNearbyUiState(defaults);
      } else {
        window.__detailNearbyUiState = defaults;
      }
    });
    await liveFrame.evaluate(() => {
      if (window.__detailEnrichModalState && window.__detailEnrichModalState.data) {
        window.__detailEnrichModalState.data.googlePlaceId = 'ChIJPlaywrightEnrich123';
      }
    });

    await forceOpenEnrichPasteBody(detailsFrame);
    await expect(plannerDetailsFrameLocator.locator('#enrichPasteBody')).toHaveClass(/open/);
    await expect(plannerDetailsFrameLocator.locator('#enrichAutoFetchBtn')).toBeVisible();
    await clickDetailsControl(detailsFrame, '#enrichAutoFetchBtn');
    await expect(plannerDetailsFrameLocator.locator('#enrichAddress')).toHaveValue(/Amphitheatre Parkway/i);
    await expect(plannerDetailsFrameLocator.locator('#enrichPhone')).toHaveValue(/253-0000/);
    await expect(plannerDetailsFrameLocator.locator('#enrichHours')).toHaveValue(/Monday:/i);
    await expect(plannerDetailsFrameLocator.locator('#enrichDescription')).toHaveValue(/Google-fetched enriched description/i);

    await clickDetailsControl(detailsFrame, '#enrichSaveBtn');
    await expect.poll(() => page.evaluate(() => window.__lastExplorerEnrichUpdates), { timeout: 10000 }).toMatchObject({
      address: '1600 Amphitheatre Parkway, Mountain View, CA 94043',
      description: 'A Google-fetched enriched description for Playwright verification.'
    });
  });

  test('details window formats JSON hours payload into readable text', async ({ page }) => {
    const detailKey = `playwright_detail_hours_json_${Date.now()}`;
    const payload = {
      data: {
        name: 'Playwright Hours Payload Spot',
        city: 'Austin',
        state: 'TX',
        hoursOfOperation: JSON.stringify({
          periods: [
            { open: { day: 1, hour: 9, minute: 0 }, close: { day: 1, hour: 18, minute: 0 } },
            { open: { day: 2, hour: 9, minute: 0 }, close: { day: 2, hour: 18, minute: 0 } }
          ],
          weekdayDescriptions: [
            'Monday: 9:00 AM - 6:00 PM',
            'Tuesday: 9:00 AM - 6:00 PM'
          ]
        })
      }
    };

    await page.addInitScript(({ seededDetailKey, seededPayload }) => {
      localStorage.setItem(seededDetailKey, JSON.stringify(seededPayload));
      localStorage.setItem('adventure_details_latest', seededDetailKey);
    }, { seededDetailKey: detailKey, seededPayload: payload });

    await page.goto(`/HTML%20Files/adventure-details-window.html?detailKey=${detailKey}&embedded=1`, {
      waitUntil: 'domcontentloaded'
    });

    await page.locator('#tabs .tab-btn[data-tab="overview"]').click();
    const hoursValue = page.locator('[data-detail-field-card="hoursOfOperation"] .value');
    await expect(hoursValue).toContainText('Monday: 9:00 AM - 6:00 PM');
    await expect(hoursValue).toContainText('Tuesday: 9:00 AM - 6:00 PM');
    await expect(hoursValue).not.toContainText(/"periods"\s*:/i);
  });

  test('refreshable detail cards show source badges and description refresh updates its badge live', async ({ page }) => {
    await mockExplorerWorkbookRequests(page);
    await gotoAdventureChallenge(page);

    const { key } = await openExplorerAndFindDetails(page);
    await page.locator(`#visitedExplorerList-${key} [data-visited-explorer-details]`).first().click();

    const detailsFrame = page.locator(`#visitedExplorerDetailsFrame-${key}`);
    await ensureDetailsFrameReady(detailsFrame);
    const plannerDetailsFrameLocator = page.frameLocator(`#visitedExplorerDetailsFrame-${key}`);

    await page.evaluate(() => {
      window.getPlaceDetails = async () => ({
        description: 'Fresh description from Google Places via Playwright.'
      });
    });

    await withLiveDetailsFrame(detailsFrame, (liveFrame) => liveFrame.evaluate(() => {
      var state = window.__detailInlineEditState;
      if (!state || !state.data) throw new Error('Missing detail inline edit state.');
      state.data.googlePlaceId = 'ChIJPlaywrightDetailBadge123';
      if (window.__detailCurrentPayload && window.__detailCurrentPayload.data) {
        window.__detailCurrentPayload.data.googlePlaceId = 'ChIJPlaywrightDetailBadge123';
      }

      var refreshMap = JSON.parse(window.localStorage.getItem('__adventure_detail_field_refresh_meta_v1') || '{}');
      var now = new Date().toISOString();
      refreshMap.place_ChIJPlaywrightDetailBadge123 = Object.assign({}, refreshMap.place_ChIJPlaywrightDetailBadge123 || {}, {
        driveTime: { updatedAt: now, source: 'google-distance-matrix' },
        hoursOfOperation: { updatedAt: now, source: 'google-places' },
        cost: { updatedAt: now, source: 'cost-inference' },
        nearby: { updatedAt: now, source: 'local-nearby' },
        parking: { updatedAt: now, source: 'openstreetmap' }
      });
      window.localStorage.setItem('__adventure_detail_field_refresh_meta_v1', JSON.stringify(refreshMap));

      if (typeof window.render === 'function') {
        window.render(window.__detailCurrentPayload);
      }
    }));

    await expect.poll(async () => withLiveDetailsFrame(detailsFrame, (liveFrame) => liveFrame.evaluate(() => ({
      driveTime: String(document.getElementById('detailFieldSourceWrap_driveTime')?.textContent || '').trim(),
      hours: String(document.getElementById('detailFieldSourceWrap_hoursOfOperation')?.textContent || '').trim(),
      cost: String(document.getElementById('detailFieldSourceWrap_cost')?.textContent || '').trim(),
      nearby: String(document.getElementById('detailFieldSourceWrap_nearby')?.textContent || '').trim(),
      driveTimeClass: String(document.querySelector('#detailFieldSourceWrap_driveTime .detail-source-badge')?.className || '').trim(),
      hoursClass: String(document.querySelector('#detailFieldSourceWrap_hoursOfOperation .detail-source-badge')?.className || '').trim(),
      costClass: String(document.querySelector('#detailFieldSourceWrap_cost .detail-source-badge')?.className || '').trim(),
      nearbyClass: String(document.querySelector('#detailFieldSourceWrap_nearby .detail-source-badge')?.className || '').trim(),
      description: String(document.getElementById('detailFieldSourceWrap_description')?.textContent || '').trim()
    }))), { timeout: 10000 }).toMatchObject({
      driveTime: 'Source: Google Maps',
      hours: 'Source: Google Places',
      cost: 'Source: Cost inference',
      nearby: 'Source: Local nearby data',
      driveTimeClass: expect.stringContaining('detail-source-badge--google'),
      hoursClass: expect.stringContaining('detail-source-badge--google'),
      costClass: expect.stringContaining('detail-source-badge--inferred'),
      nearbyClass: expect.stringContaining('detail-source-badge--local'),
      description: ''
    });

    await expect(plannerDetailsFrameLocator.locator('#abRefreshDriveTimeBtn')).toHaveCount(0);
    await expect(plannerDetailsFrameLocator.locator('#refreshDriveTimeBtn')).toBeVisible();
    await expect(plannerDetailsFrameLocator.locator('#detailCoordsCopyBtn')).toHaveCount(1);
    await expect(plannerDetailsFrameLocator.locator('#refreshDescriptionBtn')).toBeVisible();
    await clickDetailsControl(detailsFrame, '#refreshDescriptionBtn');

    await expect.poll(async () => withLiveDetailsFrame(detailsFrame, (liveFrame) => liveFrame.evaluate(() => ({
      text: String(document.getElementById('detailDescriptionValue')?.textContent || '').trim(),
      badge: String(document.getElementById('detailFieldSourceWrap_description')?.textContent || '').trim()
    }))), { timeout: 10000 }).toMatchObject({
      text: 'Fresh description from Google Places via Playwright.',
      badge: 'Source: Google Places'
    });

    await activateDetailsTab(detailsFrame, plannerDetailsFrameLocator, 'contact');
    await expect(plannerDetailsFrameLocator.locator('#refreshPlaceIdBtn')).toBeVisible();
    await withLiveDetailsFrame(detailsFrame, (liveFrame) => liveFrame.evaluate(() => {
      if (window.__detailInlineEditState && window.__detailInlineEditState.data) {
        window.__detailInlineEditState.data.googleUrl = 'https://www.google.com/maps/place/?q=place_id:ChIJUpdatedPlaceIdPlaywright123';
      }
    }));
    await clickDetailsControl(detailsFrame, '#refreshPlaceIdBtn');
    await expect.poll(async () => withLiveDetailsFrame(detailsFrame, (liveFrame) => liveFrame.evaluate(() => String(document.getElementById('detailPlaceIdValue')?.textContent || '').trim())), { timeout: 10000 })
      .toBe('ChIJUpdatedPlaceIdPlaywright123');
  });

  test('tag refresh stays non-destructive, apply mutates tags, and save syncs only applied tags', async ({ page }) => {
    await mockExplorerWorkbookRequests(page);
    await gotoAdventureChallenge(page);

    await page.evaluate(() => {
      window.__tagSyncCalls = [];
      window.syncVisitedExplorerDetailFields = async (_sourceMeta, updates) => {
        window.__tagSyncCalls.push(updates || {});
        return { synced: true, excelSaved: true, reason: 'saved' };
      };
    });

    const { key } = await openExplorerAndFindDetails(page);
    await page.locator(`#visitedExplorerList-${key} [data-visited-explorer-details]`).first().click();

    const detailsFrame = page.locator(`#visitedExplorerDetailsFrame-${key}`);
    await expect(detailsFrame).toBeVisible();
    const details = page.frameLocator(`#visitedExplorerDetailsFrame-${key}`);

    await expect(details.locator('#tabs')).toBeVisible();
    await activateDetailsTab(detailsFrame, details, 'tag-management');
    await expect(details.locator('#pane-tag-management')).toBeVisible();

    const frameHandle = await detailsFrame.elementHandle();
    const liveFrame = frameHandle ? await frameHandle.contentFrame() : null;
    expect(liveFrame).not.toBeNull();

    await liveFrame.evaluate(() => {
      window.getTagsForLocationText = () => [
        'Playwright-Rec-A',
        'Playwright-Rec-B'
      ];
      window.confirm = () => true;
    });

    const tagsBeforeRefresh = await liveFrame.evaluate(() => {
      const state = window.__detailTagState || {};
      return Array.isArray(state.tags) ? state.tags.slice() : [];
    });

    await clickDetailsControl(detailsFrame, '#tmRefreshAutoBtn');
    await expect.poll(async () => liveFrame.evaluate(() => {
      const state = window.__detailTagState || {};
      return Array.isArray(state.recommendedTags) ? state.recommendedTags.length : 0;
    }), { timeout: 8000 }).toBeGreaterThan(0);

    const tagsAfterRefresh = await liveFrame.evaluate(() => {
      const state = window.__detailTagState || {};
      return Array.isArray(state.tags) ? state.tags.slice() : [];
    });
    expect(tagsAfterRefresh).toEqual(tagsBeforeRefresh);

    // Save without applying recommendations first; suggested tags must not be persisted.
    await clickDetailsControl(detailsFrame, '#tmSaveBtn');
    await expect.poll(() => page.evaluate(() => {
      const calls = Array.isArray(window.__tagSyncCalls) ? window.__tagSyncCalls : [];
      return calls.length;
    }), { timeout: 10000 }).toBeGreaterThan(0);

    const firstSavedTagsCsv = await page.evaluate(() => {
      const calls = Array.isArray(window.__tagSyncCalls) ? window.__tagSyncCalls : [];
      const first = calls[0] || {};
      return String(first.tagsCsv || '');
    });
    expect(firstSavedTagsCsv).not.toContain('Playwright-Rec-A');
    expect(firstSavedTagsCsv).not.toContain('Playwright-Rec-B');

    await clickDetailsControl(detailsFrame, '#tmRecommendApplyBtn');
    await expect.poll(async () => liveFrame.evaluate(() => {
      const state = window.__detailTagState || {};
      const tags = Array.isArray(state.tags) ? state.tags : [];
      return tags.includes('Playwright-Rec-A') && tags.includes('Playwright-Rec-B');
    }), { timeout: 8000 }).toBe(true);

    await clickDetailsControl(detailsFrame, '#tmSaveBtn');
    await expect.poll(() => page.evaluate(() => {
      const calls = Array.isArray(window.__tagSyncCalls) ? window.__tagSyncCalls : [];
      return calls.length;
    }), { timeout: 10000 }).toBeGreaterThan(1);

    const secondSavedTagsCsv = await page.evaluate(() => {
      const calls = Array.isArray(window.__tagSyncCalls) ? window.__tagSyncCalls : [];
      const second = calls[1] || {};
      return String(second.tagsCsv || '');
    });
    expect(secondSavedTagsCsv).toContain('Playwright-Rec-A');
    expect(secondSavedTagsCsv).toContain('Playwright-Rec-B');
  });

  test('nearby refresh returns cards from Google/local URL-derived coords and empty refresh is non-destructive', async ({ page }, testInfo) => {
    await mockExplorerWorkbookRequests(page);
    await gotoAdventureChallenge(page);

    await page.evaluate(() => {
      window.GOOGLE_PLACES_API_KEY = 'playwright-nearby-key';
      window.__nearbySyncCalls = [];
      window.syncVisitedExplorerDetailFields = async (_sourceMeta, updates) => {
        window.__nearbySyncCalls.push(updates || {});
        return { synced: true, excelSaved: true, reason: 'saved' };
      };
    });

    await page.route('https://maps.googleapis.com/maps/api/place/nearbysearch/json**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'OK',
          results: [
            {
              place_id: 'pw-google-nearby-1',
              name: 'Playwright Coffee Roasters',
              types: ['cafe'],
              geometry: { location: { lat: 35.4014, lng: -82.4482 } },
              rating: 4.7,
              vicinity: 'Nearby test fixture from Google'
            }
          ]
        })
      });
    });

    const { key } = await openExplorerAndFindDetails(page);
    await page.locator(`#visitedExplorerList-${key} [data-visited-explorer-details]`).first().click();

    const detailsFrame = page.locator(`#visitedExplorerDetailsFrame-${key}`);
    await expect(detailsFrame).toBeVisible();
    const details = page.frameLocator(`#visitedExplorerDetailsFrame-${key}`);

    const frameHandle = await detailsFrame.elementHandle();
    const liveFrame = frameHandle ? await frameHandle.contentFrame() : null;
    expect(liveFrame).not.toBeNull();

    await activateDetailsTab(detailsFrame, details, 'nearby');
    await expect(details.locator('#pane-nearby')).toBeVisible();
    const nearbyPane = details.locator('#nearbyAttractionsValue');

    async function refreshNearbyAndWaitForState() {
      const previousUpdatedAt = await liveFrame.evaluate(() => Number(window.__detailNearbyState?.updatedAt || 0));
      await clickDetailsControl(detailsFrame, '#refreshNearbyBtn');
      await expect.poll(async () => {
        return liveFrame.evaluate((prev) => {
          const state = window.__detailNearbyState || {};
          const updatedAt = Number(state.updatedAt || 0);
          if (!(updatedAt > Number(prev || 0))) return -1;
          const attractions = Array.isArray(state.attractions) ? state.attractions : [];
          return attractions.length;
        }, previousUpdatedAt);
      }, { timeout: 15000 }).toBeGreaterThanOrEqual(0);
    }

    async function attachNearbyFailureDump(stage, error) {
      const snapshot = await liveFrame.evaluate(() => {
        const safe = (value, fallback) => {
          if (value === undefined || value === null) return fallback;
          return value;
        };

        let rawPrefs = '';
        try {
          rawPrefs = localStorage.getItem('__detail_nearby_ui_prefs_v3') || '';
        } catch (_storageError) {
          rawPrefs = '';
        }

        let parsedPrefs = null;
        if (rawPrefs) {
          try {
            parsedPrefs = JSON.parse(rawPrefs);
          } catch (_parseError) {
            parsedPrefs = null;
          }
        }

        const nearbyState = window.__detailNearbyState || {};
        const attractions = Array.isArray(nearbyState.attractions) ? nearbyState.attractions : [];

        return {
          rawPrefs,
          parsedPrefs,
          nearbyUiState: safe(window.__detailNearbyUiState, null),
          nearbyState: {
            updatedAt: Number(nearbyState.updatedAt || 0),
            loading: Boolean(nearbyState.loading),
            error: String(nearbyState.error || ''),
            center: safe(nearbyState.center, null),
            attractionCount: attractions.length,
            attractionNames: attractions.slice(0, 10).map((entry) => String(entry && entry.name || ''))
          }
        };
      });

      const payload = {
        stage,
        errorMessage: error instanceof Error ? error.message : String(error || ''),
        snapshot
      };

      await testInfo.attach('nearby-failure-dump', {
        contentType: 'application/json',
        body: Buffer.from(JSON.stringify(payload, null, 2), 'utf8')
      });
    }

    try {
      // Ensure center point is resolvable without relying on geocoding in this test.
      await liveFrame.evaluate(() => {
        if (window.__detailInlineEditState && window.__detailInlineEditState.data) {
          window.__detailInlineEditState.data.googleUrl = 'https://maps.google.com/@35.3995,-82.4521,15z';
        }
      });

      // Phase 1: Google-backed nearby search returns a renderable card.
      await refreshNearbyAndWaitForState();
      await expect.poll(async () => liveFrame.evaluate(() => {
        const list = Array.isArray(window.__detailNearbyState?.attractions) ? window.__detailNearbyState.attractions : [];
        return list.some((entry) => String(entry && entry.name || '').includes('Playwright Coffee Roasters'));
      }), { timeout: 12000 }).toBe(true);
      await expect(nearbyPane.locator('.card').first()).toBeVisible({ timeout: 12000 });
      await expect(nearbyPane).toContainText('Playwright Coffee Roasters');
      await expect(nearbyPane.locator('[data-nearby-quick-add="1"]').first()).toBeVisible();

      // Phase 2: No Google key + local list built from URL-derived coordinates should still produce cards.
      await page.evaluate(() => {
        window.GOOGLE_PLACES_API_KEY = '';
      });

      await liveFrame.evaluate(() => {
        const toLoc = (name, url, sourceIndex) => {
          const parsed = typeof window.parseCoordsFromGoogleUrl === 'function'
            ? window.parseCoordsFromGoogleUrl(url)
            : null;
          return {
            id: 'pw-local-' + String(sourceIndex),
            __sourceIndex: sourceIndex,
            name: name,
            description: 'Playwright local URL-derived fixture',
            latitude: parsed ? Number(parsed.lat) : null,
            longitude: parsed ? Number(parsed.lng) : null
          };
        };
        window.getNearbyFinderAppLocations = function () {
          return [
            toLoc('Playwright Nearby Local A', 'https://maps.google.com/@35.4001,-82.4512,15z', 1001),
            toLoc('Playwright Nearby Local B', 'https://maps.google.com/@35.4010,-82.4530,15z', 1002)
          ];
        };
        if (window.nearbyAttractionsFinder && typeof window.nearbyAttractionsFinder.clearCache === 'function') {
          window.nearbyAttractionsFinder.clearCache();
        }
        if (window.__detailInlineEditState && window.__detailInlineEditState.data) {
          window.__detailInlineEditState.data.name = 'Playwright Nearby Center';
          window.__detailInlineEditState.data.googleUrl = 'https://maps.google.com/@35.4000,-82.4520,15z';
        }
      });

      await refreshNearbyAndWaitForState();
      await expect(nearbyPane.locator('.card').first()).toBeVisible({ timeout: 12000 });
      await expect(nearbyPane).toContainText('✅ In App');
      await expect(nearbyPane).toContainText('Playwright Nearby Local');

      // Phase 3: Empty refresh should not wipe saved nearby text or push destructive sync.
      await liveFrame.evaluate(() => {
        if (window.__detailInlineEditState && window.__detailInlineEditState.data) {
          window.__detailInlineEditState.data.nearby = 'Saved Nearby Snapshot - Preserve Me';
        }
        if (window.nearbyAttractionsFinder) {
          window.nearbyAttractionsFinder.getFormattedNearbyAttractions = async function () { return []; };
        }
      });

      const syncCountBeforeEmptyRefresh = await page.evaluate(() => {
        const calls = Array.isArray(window.__nearbySyncCalls) ? window.__nearbySyncCalls : [];
        return calls.filter((entry) => entry && Object.prototype.hasOwnProperty.call(entry, 'nearby')).length;
      });

      await refreshNearbyAndWaitForState();
      await expect(nearbyPane).toContainText(/(No nearby attractions (found|detected) yet\.?|Only your in-app locations are shown\.)/i, { timeout: 12000 });

      const nearbyAfterEmptyRefresh = await liveFrame.evaluate(() => String(window.__detailInlineEditState?.data?.nearby || ''));
      expect(nearbyAfterEmptyRefresh).toBe('Saved Nearby Snapshot - Preserve Me');

      const syncCountAfterEmptyRefresh = await page.evaluate(() => {
        const calls = Array.isArray(window.__nearbySyncCalls) ? window.__nearbySyncCalls : [];
        return calls.filter((entry) => entry && Object.prototype.hasOwnProperty.call(entry, 'nearby')).length;
      });
      expect(syncCountAfterEmptyRefresh).toBe(syncCountBeforeEmptyRefresh);
    } catch (error) {
      await attachNearbyFailureDump('nearby-refresh-flow', error);
      throw error;
    }
  });


  test('next and previous location follow frozen filtered order from the originating explorer list', async ({ page }) => {
    await mockExplorerWorkbookRequests(page);
    await gotoAdventureChallenge(page);

    const { key } = await openExplorerAndFindDetails(page);
    const paneRoot = page.locator(`#visitedProgressPane-${key}`);
    const list = page.locator(`#visitedExplorerList-${key}`);
    await expect(list).toBeVisible();

    const cityFilter = paneRoot.locator(`#visitedExplorerCity-${key}`);
    const advancedFilters = paneRoot.locator('.visited-explorer-advanced-filters').first();
    if (!(await advancedFilters.evaluate((el) => Boolean(el && el.open)).catch(() => false))) {
      await advancedFilters.locator('summary').first().click();
    }
    await expect(cityFilter).toBeVisible();
    await cityFilter.selectOption('austin');

    const firstCard = list.locator('.visited-explorer-card').first();
    await expect(firstCard).toContainText('Mock Adventure Spot Alpha');
    await firstCard.locator('[data-visited-explorer-details]').first().click();

    await expect(page.locator(`#visitedExplorerDetailsPageTitle-${key}`)).toHaveText('Mock Adventure Spot Alpha');

    const detailsFrame = page.frameLocator(`#visitedExplorerDetailsFrame-${key}`);
    const detailsFrameElement = page.locator(`#visitedExplorerDetailsFrame-${key}`);
    const previousBtn = detailsFrame.locator('#previousLocationBtn');
    const nextBtn = detailsFrame.locator('#nextLocationBtn');
    await expect(previousBtn).toBeVisible();
    await expect(previousBtn).toBeDisabled();
    await expect(nextBtn).toBeVisible();
    await expect(nextBtn).toBeEnabled();
    const detailsTitle = page.locator(`#visitedExplorerDetailsPageTitle-${key}`);
    await detailsFrame.locator('body').click();
    await page.keyboard.press(']');
    const advancedViaKeyboard = await expect
      .poll(async () => detailsTitle.textContent(), { timeout: 1800 })
      .toBe('Mock Adventure Spot Gamma')
      .then(() => true)
      .catch(() => false);
    if (!advancedViaKeyboard) {
      await clickDetailsControl(detailsFrameElement, '#nextLocationBtn');
    }

    await expect(detailsTitle).toHaveText('Mock Adventure Spot Gamma');
    await expect(detailsFrame.locator('h1')).toHaveText('Mock Adventure Spot Gamma');
    await expect(previousBtn).toBeEnabled();
    await expect(detailsFrame.locator('#nextLocationBtn')).toBeDisabled();

    await detailsFrame.locator('body').click();
    await page.keyboard.press('[');
    const reversedViaKeyboard = await expect
      .poll(async () => detailsTitle.textContent(), { timeout: 1800 })
      .toBe('Mock Adventure Spot Alpha')
      .then(() => true)
      .catch(() => false);
    if (!reversedViaKeyboard) {
      await clickDetailsControl(detailsFrameElement, '#previousLocationBtn');
    }
    await expect(detailsTitle).toHaveText('Mock Adventure Spot Alpha');
    await expect(detailsFrame.locator('h1')).toHaveText('Mock Adventure Spot Alpha');
    await expect(previousBtn).toBeDisabled();
    await expect(nextBtn).toBeEnabled();

    await activateDetailsTab(detailsFrameElement, detailsFrame, 'notes');
    const notesInput = detailsFrame.locator('#dnmInput');
    await expect(notesInput).toBeVisible();
    await notesInput.click();
    await page.keyboard.press(']');
    await expect(page.locator(`#visitedExplorerDetailsPageTitle-${key}`)).toHaveText('Mock Adventure Spot Alpha');
    await expect(detailsFrame.locator('h1')).toHaveText('Mock Adventure Spot Alpha');
  });

  test('details card can launch visit logging directly and after marking visited', async ({ page }) => {
    await mockExplorerWorkbookRequests(page);
    await gotoAdventureChallenge(page);

    await page.evaluate(() => {
      window.__visitLogLaunches = [];
      const originalOpenVisitedVisitLog = typeof window.openVisitedVisitLogFromAchievements === 'function'
        ? window.openVisitedVisitLogFromAchievements
        : null;
      window.openVisitedVisitLogFromAchievements = async (options) => {
        window.__visitLogLaunches.push(options || {});
        if (originalOpenVisitedVisitLog) {
          return originalOpenVisitedVisitLog(options);
        }
        return null;
      };
      window.syncVisitedExplorerDetailFields = async () => ({ synced: true });
    });

    const { key } = await openExplorerAndFindDetails(page);
    await page.locator(`#visitedExplorerList-${key} [data-visited-explorer-details]`).first().click();

    const detailsFrame = page.locator(`#visitedExplorerDetailsFrame-${key}`);
    await expect(detailsFrame).toBeVisible();
    const details = page.frameLocator(`#visitedExplorerDetailsFrame-${key}`);

    const logVisitBtn = details.locator('#abLogVisitBtn');
    const linksBtn = details.locator('#abLinksBtn');
    const visitedBtn = details.locator('#abVisitedBtn');

    async function launchVisitLogAndClose(trigger) {
      const popupPromise = page.waitForEvent('popup', { timeout: 3000 }).then((popup) => popup).catch(() => null);
      await trigger.click();
      const popup = await popupPromise;
      if (popup) {
        await popup.waitForLoadState('domcontentloaded');
        await expect(popup.locator('#visitedVisitLogTitle')).toBeVisible();
        await popup.close();
        return;
      }

      const visitLogView = page.locator(`#visitedProgressPane-${key} [data-visited-subtab-view="visit-log"]`).first();
      const visitLogFrame = page.locator(`#visitedVisitLogFrame-${key}`).first();
      await expect(visitLogView).toBeVisible({ timeout: 10000 });
      await expect(visitLogFrame).toBeVisible();
      const frameHandle = await visitLogFrame.elementHandle();
      const inlineFrame = frameHandle ? await frameHandle.contentFrame() : null;
      expect(inlineFrame).not.toBeNull();
      await expect(inlineFrame.locator('#visitedVisitLogTitle')).toBeVisible();
      await inlineFrame.getByRole('button', { name: /Cancel/i }).click();
      await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-view="overview"]`).first()).toBeVisible({ timeout: 10000 });
    }

    async function ensureDetailsActionBarVisible() {
      if (await logVisitBtn.isVisible().catch(() => false)) return;
      const paneRoot = page.locator(`#visitedProgressPane-${key}`);
      const explorerView = paneRoot.locator('[data-visited-subtab-view="explorer"]').first();
      const detailsView = paneRoot.locator('[data-visited-subtab-view="explorer-details"]').first();
      if (!(await explorerView.isVisible().catch(() => false))) {
        const openExplorerBtn = paneRoot.locator(`[data-visited-subtab-action="open-explorer-${key}"]`).first();
        await expect(openExplorerBtn).toBeVisible();
        await openExplorerBtn.click();
        await expect(explorerView).toBeVisible({ timeout: 10000 });
      }
      await page.locator(`#visitedExplorerList-${key} [data-visited-explorer-details]`).first().click();
      await expect(detailsView).toBeVisible({ timeout: 10000 });
      await expect(logVisitBtn).toBeVisible();
      await expect(visitedBtn).toBeVisible();
    }
    await expect(linksBtn).toBeVisible();
    await expect(logVisitBtn).toBeVisible();
    await expect(logVisitBtn).toBeEnabled();
    await expect(visitedBtn).toContainText(/Mark Visited/i);

    await linksBtn.click();
    await expect(details.locator('#linksModal')).toBeVisible();
    await details.locator('#linksRawInput').fill('example.org\nhttps://example.com/two');
    await clickDetailsControl(detailsFrame, '#linksSaveBtn');
    await expect(details.locator('#linksModal')).toBeHidden();
    await expect.poll(async () => {
      const frameHandle = await detailsFrame.elementHandle();
      const liveFrame = frameHandle ? await frameHandle.contentFrame() : null;
      if (!liveFrame) return '';
      return liveFrame.evaluate(() => String(window.__detailInlineEditState?.data?.links || ''));
    }, { timeout: 5000 }).toContain('https://example.org');

    await launchVisitLogAndClose(logVisitBtn);
    await expect.poll(() => page.evaluate(() => (window.__visitLogLaunches || []).length), { timeout: 5000 }).toBe(1);
    await expect.poll(() => page.evaluate(() => {
      const launches = Array.isArray(window.__visitLogLaunches) ? window.__visitLogLaunches : [];
      return launches[0] || {};
    })).toMatchObject({ subtabKey: key });

    await ensureDetailsActionBarVisible();
    await withLiveDetailsFrame(detailsFrame, (liveFrame) => liveFrame.evaluate(() => {
      window.canLaunchVisitLogWorkflow = () => true;
    }));

    await visitedBtn.scrollIntoViewIfNeeded();
    await visitedBtn.click();
    await expect(details.locator('#visitedLogPromptModal')).toBeVisible();
    await launchVisitLogAndClose(details.locator('#visitedLogPromptConfirmBtn'));
    if (await details.locator('#abVisitedBtn').count()) {
      await expect(details.locator('#abVisitedBtn')).toContainText(/Visited/i);
    }
    await expect.poll(() => page.evaluate(() => (window.__visitLogLaunches || []).length), { timeout: 5000 }).toBe(2);
    await expect.poll(() => page.evaluate(() => {
      const launches = Array.isArray(window.__visitLogLaunches) ? window.__visitLogLaunches : [];
      return launches[1] || {};
    })).toMatchObject({ subtabKey: key });

  });

  test('refreshes stale OneDrive photo URLs and persists stable photo metadata on save', async ({ page }) => {
    const detailKey = 'playwright_detail_photo_refresh';
    const placeId = 'pid-photo-refresh';
    const stalePhotoUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9sotW1cAAAAASUVORK5CYII=';
    const storedPhoto = {
      id: 'drive-item-123',
      itemId: 'drive-item-123',
      oneDrivePath: 'Copilot_Apps/Kyles_Adventure_Finder/location-Photos/photo-regression/photo.png',
      webUrl: 'https://onedrive.example.com/item/drive-item-123',
      url: stalePhotoUrl,
      downloadUrl: stalePhotoUrl,
      thumbnail: stalePhotoUrl,
      caption: 'Saved OneDrive photo',
      source: 'onedrive'
    };
    const payload = {
      data: {
        name: 'Photo Regression Spot',
        city: 'Austin',
        state: 'TX',
        googlePlaceId: placeId,
        photoUrls: ''
      }
    };

    await page.addInitScript(({ seededDetailKey, seededPayload, seededPlaceKey, seededPhoto }) => {
      window.accessToken = 'playwright-mock-token';
      localStorage.setItem(seededDetailKey, JSON.stringify(seededPayload));
      localStorage.setItem('adventure_details_latest', seededDetailKey);
      localStorage.setItem('adventureFinderPhotos_v1', JSON.stringify({ [seededPlaceKey]: [seededPhoto] }));
    }, {
      seededDetailKey: detailKey,
      seededPayload: payload,
      seededPlaceKey: placeId,
      seededPhoto: storedPhoto
    });

    let graphItemRefreshCount = 0;
    await page.route('https://graph.microsoft.com/**', async (route) => {
      graphItemRefreshCount += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'drive-item-123',
          webUrl: 'https://onedrive.example.com/item/drive-item-123',
          '@microsoft.graph.downloadUrl': 'https://fresh.example.com/photo.png'
        })
      });
    });
    await page.route('https://fresh.example.com/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'image/png', body: ONE_PIXEL_PNG });
    });

    await page.goto(`/HTML%20Files/adventure-details-window.html?detailKey=${detailKey}&initialTab=photos&embedded=1`, {
      waitUntil: 'networkidle'
    });
    await page.waitForFunction(() => (
      typeof window.handleDetailPhotoThumbError === 'function'
      && typeof window.resolveDetailPhotoUrl === 'function'
    ), null, { timeout: 15000 });

    // Ensure photos tab is activated
    await page.evaluate(() => {
      if (typeof window.activateTab === 'function') {
        window.activateTab('photos');
      }
    });

    const photosPane = page.locator('#pane-photos');
    const galleryThumb = page.locator('#phGallery .ph-thumb').first();
    await expect(photosPane).toBeVisible();
    await expect(galleryThumb).toBeVisible();
    await expect(galleryThumb).toHaveAttribute('src', /data:image\/png;base64/i);
    await page.evaluate(async () => {
      const img = document.querySelector('#phGallery .ph-thumb');
      if (!img || typeof window.handleDetailPhotoThumbError !== 'function') {
        throw new Error('Photo refresh handler not available.');
      }
      await window.handleDetailPhotoThumbError(img, 0);
    });
    await expect(galleryThumb).toHaveAttribute('src', /fresh\.example\.com\/photo\.png/, { timeout: 10000 });
    await expect.poll(() => graphItemRefreshCount, { timeout: 10000 }).toBeGreaterThan(0);

    await page.locator('#phSaveBtn').click();
    await expect(page.locator('#phStatus')).toContainText('Photos saved locally', { timeout: 10000 });

    const savedPhotoPayload = await page.evaluate(() => {
      const raw = String(window.__detailPhotosState?.data?.photoUrls || '');
      const prefix = 'PHOTOS_JSON_V1::';
      if (!raw.startsWith(prefix)) return null;
      const parsed = JSON.parse(raw.slice(prefix.length));
      return Array.isArray(parsed) ? parsed[0] : null;
    });

    expect(savedPhotoPayload).toMatchObject({
      itemId: 'drive-item-123',
      oneDrivePath: 'Copilot_Apps/Kyles_Adventure_Finder/location-Photos/photo-regression/photo.png',
      webUrl: 'https://onedrive.example.com/item/drive-item-123',
      downloadUrl: 'https://fresh.example.com/photo.png',
      url: 'https://fresh.example.com/photo.png',
      thumbnail: 'https://fresh.example.com/photo.png',
      caption: 'Saved OneDrive photo',
      source: 'onedrive'
    });

    await page.locator('#phGallery [data-ph-view-idx="0"]').click();
    await expect(page.locator('#phViewerModal')).toBeVisible();
    await expect(page.locator('#phViewerImg')).toHaveAttribute('src', /fresh\.example\.com\/photo\.png/);
  });
});

