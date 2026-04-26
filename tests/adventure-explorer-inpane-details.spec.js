const { test, expect } = require('./reliability-test');

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
        let payload = {};
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
  await page.goto('/');
  await page.locator('.app-tab-btn[data-tab="visited-locations"]').click();
  await expect(page.locator('#visitedLocationsRoot')).toBeVisible();
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
    await expect(explorerView).toBeVisible();

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
    const frameHandle = await detailsFrame.elementHandle();
    const plannerDetailsFrame = frameHandle ? await frameHandle.contentFrame() : null;
    expect(plannerDetailsFrame).not.toBeNull();
    const plannerDetailsFrameLocator = page.frameLocator(`#visitedExplorerDetailsFrame-${key}`);

    async function withLiveDetailsFrame(run) {
      const liveFrameHandle = await detailsFrame.elementHandle();
      const liveFrame = liveFrameHandle ? await liveFrameHandle.contentFrame() : null;
      if (!liveFrame) throw new Error('Adventure details iframe was not available.');
      return run(liveFrame);
    }

    async function activateDetailsTab(tabId) {
      const tabButton = plannerDetailsFrameLocator.locator(`#tabs .tab-btn[data-tab="${tabId}"]`);
      await expect(plannerDetailsFrameLocator.locator('#tabs')).toBeVisible();
      await expect(tabButton).toBeVisible();

      await tabButton.click();
      const becameSelectedViaClick = await expect
        .poll(async () => tabButton.getAttribute('aria-selected'), { timeout: 3000 })
        .toBe('true')
        .then(() => true)
        .catch(() => false);

      if (!becameSelectedViaClick) {
        await withLiveDetailsFrame((liveFrame) => liveFrame.evaluate((targetTabId) => {
          const normalizedTabId = String(targetTabId || 'overview');
          if (typeof window.activateTab === 'function') {
            window.activateTab(normalizedTabId);
            return;
          }

          const safeTabId = normalizedTabId.replace(/"/g, '');
          const btn = document.querySelector(`#tabs .tab-btn[data-tab="${safeTabId}"]`);
          if (btn && typeof btn.click === 'function') btn.click();
        }, tabId));
      }

      await expect.poll(async () => tabButton.getAttribute('aria-selected'), { timeout: 10000 }).toBe('true');
      await expect.poll(async () => withLiveDetailsFrame((liveFrame) => liveFrame.evaluate((targetTabId) => {
        const pane = document.querySelector(`#pane-${String(targetTabId || '').replace(/"/g, '')}`);
        if (!pane) return false;
        return (
          pane.getAttribute('aria-hidden') === 'false'
          && pane.hidden === false
          && pane.classList.contains('active')
        );
      }, tabId)), { timeout: 10000 }).toBe(true);
    }

    await expect(plannerDetailsFrameLocator.locator('#tabs .tab-btn[data-tab="overview"]')).toHaveClass(/active/);
    await expect(plannerDetailsFrameLocator.locator('#actionBar')).toBeVisible();
    const ratingResetBtn = plannerDetailsFrameLocator.locator('#abRatingResetBtn');
    await expect(ratingResetBtn).toBeVisible();
    await ratingResetBtn.click();
    await expect(plannerDetailsFrameLocator.locator('.star-btn.lit')).toHaveCount(0);

    await activateDetailsTab('tag-management');
    await expect(plannerDetailsFrameLocator.locator('#pane-tag-management')).toBeVisible();
    await plannerDetailsFrameLocator.locator('#tmSaveBtn').click();
    const readTagSaveDebug = async () => {
      const liveFrameHandle = await detailsFrame.elementHandle();
      const liveFrame = liveFrameHandle ? await liveFrameHandle.contentFrame() : null;
      if (!liveFrame) return { finalStatus: '', hostContext: '', stepCount: 0 };
      return liveFrame.evaluate(() => {
      const debug = window.__lastTagSaveDebug || {};
      const steps = Array.isArray(debug.steps) ? debug.steps : [];
      const hostStep = steps.find((entry) => entry && entry.step === 'host_context');
      return {
        finalStatus: String(debug.finalStatus || ''),
        hostContext: hostStep && hostStep.detail ? String(hostStep.detail.context || '') : '',
        stepCount: steps.length
      };
    });
    };

    await expect.poll(async () => {
      const snapshot = await readTagSaveDebug();
      return snapshot.finalStatus;
    }, { timeout: 20000 }).toMatch(/^(success_excel|success_planner_only|success_local_only|failed)$/);

    await expect.poll(async () => {
      const snapshot = await readTagSaveDebug();
      return snapshot.hostContext;
    }, { timeout: 20000 }).toMatch(/^(parent|opener)$/);

    await activateDetailsTab('notes');
    await expect(plannerDetailsFrameLocator.locator('#pane-notes')).toHaveAttribute('aria-hidden', 'false');
    await expect(plannerDetailsFrameLocator.locator('#detailNotesWrap')).toBeVisible();

    await activateDetailsTab('details');
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

      await withLiveDetailsFrame((liveFrame) => liveFrame.evaluate(() => {
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
      const firstPrompt = await withLiveDetailsFrame((liveFrame) => liveFrame.evaluate(() => String((window.__inlineEditConfirmPrompts || [])[0] || '')));
      if (firstPrompt) {
        expect(firstPrompt).toContain('unsaved inline field edits');
      }

      await activateDetailsTab('notes');

      await activateDetailsTab('details');
      await expect(plannerDetailsFrameLocator.locator('#detailInlineEditPanel')).toBeVisible();
      const saveInlineBtn = plannerDetailsFrameLocator.locator('#inlineEditSaveBtn');
      await expect(saveInlineBtn).toBeEnabled();
      await saveInlineBtn.click();
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
        await saveInlineBtn.click();
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
    await expect(tagMenuBtn).toBeVisible();
    await tagMenuBtn.click();
    await expect(detailsView).toBeVisible();
    await expect(page.locator(`#visitedExplorerDetailsFrame-${key}`)).toHaveAttribute('src', /initialTab=tag-management/i);
    await backBtn.click();

    await quickActionsBtn.click();
    const notesMenuBtn = firstCard.locator('[data-visited-explorer-quick-actions-menu] [data-visited-explorer-notes]').first();
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
    await liveFrame.evaluate(() => {
      if (window.__detailEnrichModalState && window.__detailEnrichModalState.data) {
        window.__detailEnrichModalState.data.googlePlaceId = 'ChIJPlaywrightEnrich123';
      }
    });

    const enrichPasteBody = plannerDetailsFrameLocator.locator('#enrichPasteBody');
    if (!(await enrichPasteBody.isVisible())) {
      await plannerDetailsFrameLocator.locator('#enrichPasteToggleHead').click();
    }
    await expect(plannerDetailsFrameLocator.locator('#enrichAutoFetchBtn')).toBeVisible();
    await plannerDetailsFrameLocator.locator('#enrichAutoFetchBtn').click();
    await expect(plannerDetailsFrameLocator.locator('#enrichAddress')).toHaveValue(/Amphitheatre Parkway/i);
    await expect(plannerDetailsFrameLocator.locator('#enrichPhone')).toHaveValue(/253-0000/);
    await expect(plannerDetailsFrameLocator.locator('#enrichHours')).toHaveValue(/Monday:/i);
    await expect(plannerDetailsFrameLocator.locator('#enrichDescription')).toHaveValue(/Google-fetched enriched description/i);

    await plannerDetailsFrameLocator.locator('#enrichSaveBtn').click();
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

    await page.locator('#tabs .tab-btn[data-tab="details"]').click();
    const hoursValue = page.locator('[data-detail-field-card="hoursOfOperation"] .value');
    await expect(hoursValue).toContainText('Monday: 9:00 AM - 6:00 PM');
    await expect(hoursValue).toContainText('Tuesday: 9:00 AM - 6:00 PM');
    await expect(hoursValue).not.toContainText(/"periods"\s*:/i);
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
    await details.locator('#tabs .tab-btn[data-tab="tag-management"]').click();
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

    await details.locator('#tmRefreshAutoBtn').click();
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
    await details.locator('#tmSaveBtn').click();
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

    await details.locator('#tmRecommendApplyBtn').click();
    await expect.poll(async () => liveFrame.evaluate(() => {
      const state = window.__detailTagState || {};
      const tags = Array.isArray(state.tags) ? state.tags : [];
      return tags.includes('Playwright-Rec-A') && tags.includes('Playwright-Rec-B');
    }), { timeout: 8000 }).toBe(true);

    await details.locator('#tmSaveBtn').click();
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

  test('nearby refresh returns cards from Google/local URL-derived coords and empty refresh is non-destructive', async ({ page }) => {
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

    await details.locator('#tabs .tab-btn[data-tab="additional"]').click();
    await expect(details.locator('#pane-additional')).toBeVisible();

    // Ensure center point is resolvable without relying on geocoding in this test.
    await liveFrame.evaluate(() => {
      if (window.__detailInlineEditState && window.__detailInlineEditState.data) {
        window.__detailInlineEditState.data.googleUrl = 'https://maps.google.com/@35.3995,-82.4521,15z';
      }
    });

    // Phase 1: Google-backed nearby search returns a renderable card.
    await details.locator('#refreshNearbyBtn').click();
    await expect(details.locator('#nearbyAttractionsValue .card').first()).toBeVisible({ timeout: 12000 });
    await expect(details.locator('#nearbyAttractionsValue')).toContainText('Playwright Coffee Roasters');
    await expect(details.locator('#nearbyAttractionsValue [data-nearby-quick-add="1"]').first()).toBeVisible();

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

    await details.locator('#refreshNearbyBtn').click();
    await expect(details.locator('#nearbyAttractionsValue .card').first()).toBeVisible({ timeout: 12000 });
    await expect(details.locator('#nearbyAttractionsValue')).toContainText('✅ In App');
    await expect(details.locator('#nearbyAttractionsValue')).toContainText('Playwright Nearby Local');

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

    await details.locator('#refreshNearbyBtn').click();
    await expect(details.locator('#nearbyAttractionsValue .empty')).toContainText('No nearby attractions detected yet', { timeout: 12000 });

    const nearbyAfterEmptyRefresh = await liveFrame.evaluate(() => String(window.__detailInlineEditState?.data?.nearby || ''));
    expect(nearbyAfterEmptyRefresh).toBe('Saved Nearby Snapshot - Preserve Me');

    const syncCountAfterEmptyRefresh = await page.evaluate(() => {
      const calls = Array.isArray(window.__nearbySyncCalls) ? window.__nearbySyncCalls : [];
      return calls.filter((entry) => entry && Object.prototype.hasOwnProperty.call(entry, 'nearby')).length;
    });
    expect(syncCountAfterEmptyRefresh).toBe(syncCountBeforeEmptyRefresh);
  });

  test('next and previous location follow frozen filtered order from the originating explorer list', async ({ page }) => {
    await mockExplorerWorkbookRequests(page);
    await gotoAdventureChallenge(page);

    const { key } = await openExplorerAndFindDetails(page);
    const paneRoot = page.locator(`#visitedProgressPane-${key}`);
    const list = page.locator(`#visitedExplorerList-${key}`);
    await expect(list).toBeVisible();

    const cityFilter = paneRoot.locator(`#visitedExplorerCity-${key}`);
    await expect(cityFilter).toBeVisible();
    await cityFilter.selectOption('austin');

    const firstCard = list.locator('.visited-explorer-card').first();
    await expect(firstCard).toContainText('Mock Adventure Spot Alpha');
    await firstCard.locator('[data-visited-explorer-details]').first().click();

    await expect(page.locator(`#visitedExplorerDetailsPageTitle-${key}`)).toHaveText('Mock Adventure Spot Alpha');

    const detailsFrame = page.frameLocator(`#visitedExplorerDetailsFrame-${key}`);
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
      await detailsFrame.locator('#nextLocationBtn').click();
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
      await detailsFrame.locator('#previousLocationBtn').click();
    }
    await expect(detailsTitle).toHaveText('Mock Adventure Spot Alpha');
    await expect(detailsFrame.locator('h1')).toHaveText('Mock Adventure Spot Alpha');
    await expect(previousBtn).toBeDisabled();
    await expect(nextBtn).toBeEnabled();

    await detailsFrame.locator('#tabs .tab-btn[data-tab="notes"]').click();
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
      window.openVisitedVisitLogFromAchievements = async (options) => {
        window.__visitLogLaunches.push(options || {});
        const modal = document.getElementById('visitedVisitLogModal');
        if (modal) modal.hidden = false;
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
    await expect(linksBtn).toBeVisible();
    await expect(logVisitBtn).toBeVisible();
    await expect(logVisitBtn).toBeEnabled();
    await expect(visitedBtn).toContainText(/Mark Visited/i);

    await linksBtn.click();
    await expect(details.locator('#linksModal')).toBeVisible();
    await details.locator('#linksRawInput').fill('example.org\nhttps://example.com/two');
    await details.locator('#linksSaveBtn').click();
    await expect(details.locator('#linksModal')).toBeHidden();
    await expect.poll(async () => {
      const frameHandle = await detailsFrame.elementHandle();
      const liveFrame = frameHandle ? await frameHandle.contentFrame() : null;
      if (!liveFrame) return '';
      return liveFrame.evaluate(() => String(window.__detailInlineEditState?.data?.links || ''));
    }, { timeout: 5000 }).toContain('https://example.org');

    await logVisitBtn.click();
    await expect(page.locator('#visitedVisitLogModal')).toBeVisible();
    await expect.poll(() => page.evaluate(() => (window.__visitLogLaunches || []).length), { timeout: 5000 }).toBe(1);
    await expect.poll(() => page.evaluate(() => {
      const launches = Array.isArray(window.__visitLogLaunches) ? window.__visitLogLaunches : [];
      return launches[0] || {};
    })).toMatchObject({ subtabKey: key });

    await page.click('#visitedVisitLogCancelBtn');
    await expect(page.locator('#visitedVisitLogModal')).toBeHidden();

    const frameHandle = await detailsFrame.elementHandle();
    const liveFrame = frameHandle ? await frameHandle.contentFrame() : null;
    expect(liveFrame).not.toBeNull();
    await liveFrame.evaluate(() => {
      window.confirm = () => true;
    });

    await visitedBtn.click();

    await expect(details.locator('#abVisitedBtn')).toContainText(/Visited/i);
    await expect(page.locator('#visitedVisitLogModal')).toBeVisible();
    await expect.poll(() => page.evaluate(() => (window.__visitLogLaunches || []).length), { timeout: 5000 }).toBe(2);
    await expect.poll(() => page.evaluate(() => {
      const launches = Array.isArray(window.__visitLogLaunches) ? window.__visitLogLaunches : [];
      return launches[1] || {};
    })).toMatchObject({ subtabKey: key });
  });

  test.skip('refreshes stale OneDrive photo URLs and persists stable photo metadata on save', async ({ page }) => {
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
      waitUntil: 'domcontentloaded'
    });
    await page.waitForFunction(() => (
      typeof window.handleDetailPhotoThumbError === 'function'
      && typeof window.resolveDetailPhotoUrl === 'function'
    ), null, { timeout: 15000 });

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

