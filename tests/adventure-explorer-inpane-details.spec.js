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
      'Mock Adventure Spot',
      'Austin',
      'TX',
      'hiking;scenic',
      'Playwright-seeded location for details flow validation.',
      '123 Trailhead Way',
      '9:00 AM - 6:00 PM',
      '22 min',
      'https://example.com/mock-adventure-spot',
      '555-0100',
      '4.8',
      '$$',
      'https://maps.google.com/?q=Mock+Adventure+Spot'
    ]
  ]
};

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

    const detailsBtn = firstCard.locator('[data-visited-explorer-details]').first();
    const quickActionsBtn = firstCard.locator('[data-visited-explorer-quick-actions-toggle]').first();
    const favoriteBtn = firstCard.locator('[data-visited-explorer-favorite]').first();
    await expect(detailsBtn).toBeVisible();
    await expect(quickActionsBtn).toBeVisible();
    await expect(favoriteBtn).toBeVisible();

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
    await expect(plannerDetailsFrame.locator('#closeTabBtn')).toHaveCount(0);
    await expect(plannerDetailsFrame.locator('#tabs .tab-btn[data-tab="overview"].active')).toBeVisible();
    await expect(plannerDetailsFrame.locator('#actionBar')).toBeVisible();

    await plannerDetailsFrame.locator('#tabs .tab-btn[data-tab="tag-management"]').click();
    await expect(plannerDetailsFrame.locator('#pane-tag-management.tab-pane.active')).toBeVisible();
    await plannerDetailsFrame.locator('#tmSaveBtn').click();
    await expect.poll(async () => plannerDetailsFrame.evaluate(() => {
      const steps = Array.isArray(window.__lastTagSaveDebug?.steps) ? window.__lastTagSaveDebug.steps : [];
      const hostStep = steps.find((entry) => entry && entry.step === 'host_context');
      return hostStep && hostStep.detail ? String(hostStep.detail.context || '') : '';
    })).toMatch(/^(parent|opener)$/);

    await plannerDetailsFrame.locator('#tabs .tab-btn[data-tab="notes"]').click();
    await expect(plannerDetailsFrame.locator('#pane-notes.tab-pane.active')).toBeVisible();

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
});
