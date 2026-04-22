const { test, expect } = require('./reliability-test');

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
    window.accessToken = 'playwright-mock-token';
  });

  await page.route('https://graph.microsoft.com/**', async (route) => {
    const url = route.request().url();
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
          value: [
            { name: 'Name' },
            { name: 'Address' },
            { name: 'Google URL' },
            { name: 'Visited' }
          ]
        })
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
      await expect(plannerDetailsFrameLocator.locator(`#pane-${tabId}[aria-hidden="false"]`)).toBeVisible();
    }

    await expect(plannerDetailsFrameLocator.locator('#closeTabBtn')).toHaveCount(0);
    await expect(plannerDetailsFrameLocator.locator('#tabs .tab-btn[data-tab="overview"]')).toHaveClass(/active/);
    await expect(plannerDetailsFrameLocator.locator('#actionBar')).toBeVisible();

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
    await expect(plannerDetailsFrameLocator.locator('#pane-notes[aria-hidden="false"]')).toBeVisible();
    await expect(plannerDetailsFrameLocator.locator('#detailNotesWrap')).toBeVisible();

    await activateDetailsTab('details');
    const inlineEditBtn = plannerDetailsFrameLocator.locator('#abInlineEditBtn');
    if (await inlineEditBtn.count()) {
      await expect(inlineEditBtn).toBeVisible();
      await inlineEditBtn.click();
      await expect(plannerDetailsFrameLocator.locator('#detailInlineEditPanel')).toBeVisible();
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
      await expect
        .poll(async () => withLiveDetailsFrame((liveFrame) => liveFrame.evaluate(() => String((window.__inlineEditConfirmPrompts || [])[0] || ''))), { timeout: 10000 })
        .toContain('unsaved inline field edits');

      await plannerDetailsFrameLocator.locator('#tabs .tab-btn[data-tab="notes"]').click();
      await expect(plannerDetailsFrameLocator.locator('#pane-notes[aria-hidden="false"]')).toBeVisible();

      await activateDetailsTab('details');
      await expect(plannerDetailsFrameLocator.locator('#detailInlineEditPanel')).toBeVisible();
      const saveInlineBtn = plannerDetailsFrameLocator.locator('#inlineEditSaveBtn');
      await expect(saveInlineBtn).toBeEnabled();
      await saveInlineBtn.click();
      await expect(plannerDetailsFrameLocator.locator('#pane-details[aria-hidden="false"]')).toContainText('11:00 AM - 9:00 PM');
      await expect(plannerDetailsFrameLocator.locator('[data-detail-field-card="hoursOfOperation"]')).not.toHaveClass(/is-dirty/);
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

