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

const EXPLORER_CASES = [
  { key: 'outdoors', openAction: 'open-explorer-outdoors', closeAction: 'close-explorer-outdoors' },
  { key: 'entertainment', openAction: 'open-explorer-entertainment', closeAction: 'close-explorer-entertainment' },
  { key: 'food-drink', openAction: 'open-explorer-food-drink', closeAction: 'close-explorer-food-drink' },
  { key: 'retail', openAction: 'open-explorer-retail', closeAction: 'close-explorer-retail' },
  { key: 'wildlife-animals', openAction: 'open-explorer-wildlife-animals', closeAction: 'close-explorer-wildlife-animals' },
  { key: 'regional-festivals', openAction: 'open-explorer-regional-festivals', closeAction: 'close-explorer-regional-festivals' }
];

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

test.describe('Adventure explorer click stress', () => {
  test('keeps explorer card controls reliable under rapid repeated clicks', async ({ page }, testInfo) => {
    await mockExplorerWorkbookRequests(page);
    await gotoAdventureChallenge(page);

    const { key } = await openExplorerAndFindDetails(page);
    const paneRoot = page.locator(`#visitedProgressPane-${key}`);
    const getFirstCard = () => page.locator(`#visitedExplorerList-${key} .visited-explorer-card`).first();

    const metrics = [];
    const runLoop = async ({ name, attempts, minPassRate, waitMs, runAttempt }) => {
      const metric = { name, attempts, pass: 0, fail: 0, firstFailureAt: -1 };
      for (let i = 0; i < attempts; i += 1) {
        let ok = true;
        try {
          await runAttempt(i);
        } catch (_error) {
          ok = false;
        }
        if (ok) metric.pass += 1;
        else {
          metric.fail += 1;
          if (metric.firstFailureAt < 0) metric.firstFailureAt = i;
        }
        if (waitMs > 0) await page.waitForTimeout(waitMs);
      }
      metric.passRate = attempts > 0 ? Number((metric.pass / attempts).toFixed(4)) : 1;
      metrics.push(metric);
      expect(metric.passRate, `${name} pass rate should remain stable`).toBeGreaterThanOrEqual(minPassRate);
    };

    await runLoop({
      name: 'quick-actions-toggle',
      attempts: 24,
      minPassRate: 0.95,
      waitMs: 150,
      runAttempt: async (i) => {
        const card = getFirstCard();
        const toggle = card.locator('[data-visited-explorer-quick-actions-toggle]').first();
        const menu = card.locator('[data-visited-explorer-quick-actions-menu]').first();
        await toggle.click();
        const expectedExpanded = i % 2 === 0 ? 'true' : 'false';
        await expect(toggle).toHaveAttribute('aria-expanded', expectedExpanded);
        if (expectedExpanded === 'true') await expect(menu).toBeVisible();
        else await expect(menu).toBeHidden();
      }
    });

    const liveQuickMenu = getFirstCard().locator('[data-visited-explorer-quick-actions-menu]').first();
    if (await liveQuickMenu.isVisible()) {
      await getFirstCard().locator('[data-visited-explorer-quick-actions-toggle]').first().click();
      await expect(liveQuickMenu).toBeHidden();
    }

    await runLoop({
      name: 'favorite-toggle',
      attempts: 14,
      minPassRate: 0.95,
      waitMs: 180,
      runAttempt: async (i) => {
        await getFirstCard().locator('[data-visited-explorer-favorite]').first().click();
        const expectedText = i % 2 === 0 ? 'Favorited' : 'Add to Favorites';
        await expect(getFirstCard().locator('[data-visited-explorer-favorite]').first()).toContainText(expectedText);
      }
    });

    const ratings = [1, 3, 5, 2, 4, 5, 1, 2, 3, 4, 5, 3, 1, 4, 2, 5];
    await runLoop({
      name: 'star-rating',
      attempts: ratings.length,
      minPassRate: 0.95,
      waitMs: 120,
      runAttempt: async (i) => {
        const value = ratings[i];
        await getFirstCard()
          .locator(`[data-visited-explorer-rate][data-visited-explorer-rating-value="${value}"]`)
          .first()
          .click();
        await expect(getFirstCard().locator('.visited-explorer-star.is-active')).toHaveCount(value);
      }
    });

    await runLoop({
      name: 'details-open-back',
      attempts: 8,
      minPassRate: 0.95,
      waitMs: 200,
      runAttempt: async () => {
        await getFirstCard().locator('[data-visited-explorer-details]').first().click();
        const detailsView = paneRoot.locator('[data-visited-subtab-view="explorer-details"]').first();
        await expect(detailsView).toBeVisible();
        const backBtn = paneRoot.locator(`[data-visited-subtab-action="close-explorer-details-${key}"]`).first();
        await backBtn.click();
        await expect(paneRoot.locator('[data-visited-subtab-view="explorer"]').first()).toBeVisible();
      }
    });

    await testInfo.attach('adventure-explorer-click-stress-metrics.json', {
      body: Buffer.from(JSON.stringify(metrics, null, 2), 'utf8'),
      contentType: 'application/json'
    });
  });
});

