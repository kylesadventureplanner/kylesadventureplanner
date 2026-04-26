/**
 * Shared Playwright helpers used across smoke / integration specs.
 */

/**
 * Collapses the global error-notification bar so it does not overlap clickable
 * footer / action elements.  Safe to call even when the bar is already
 * collapsed or not present on the page.
 *
 * @param {import('@playwright/test').Page} page
 */
async function collapseErrorNotificationBar(page) {
  await page.evaluate(() => {
    const errorBar = document.getElementById('errorNotificationBar');
    if (!errorBar || errorBar.classList.contains('collapsed')) return;
    if (typeof window.toggleErrorBar === 'function') {
      window.toggleErrorBar();
      return;
    }
    errorBar.classList.add('collapsed');
    errorBar.style.maxHeight = '44px';
  });
}

/**
 * Scrolls a locator into view, collapses the error bar, and clicks it.
 * Falls back to an in-page `.click()` call if the Playwright click times out
 * (e.g. the element is partially obscured by a floating overlay).
 *
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Locator} locator
 */
async function activateFooterAction(page, locator) {
  await locator.scrollIntoViewIfNeeded();
  await collapseErrorNotificationBar(page);
  try {
    await locator.click({ timeout: 5000 });
  } catch (_error) {
    await collapseErrorNotificationBar(page);
    await locator.evaluate((node) => node.click());
  }
}

/**
 * Opens Nature Challenge -> Birds Log view and returns the log pane locator.
 * Safe to call from a fresh page or when already inside Nature Challenge.
 *
 * @param {import('@playwright/test').Page} page
 */
async function openNatureLogView(page) {
  const natureRoot = page.locator('#natureChallengeRoot');
  let rootVisible = false;
  try {
    rootVisible = await natureRoot.isVisible();
  } catch (_err) {
    rootVisible = false;
  }

  if (!rootVisible) {
    await page.goto('/');
    await page.locator('.app-tab-btn[data-tab="nature-challenge"]').click();
    await natureRoot.waitFor({ state: 'visible' });
  }

  await page.waitForFunction(() => {
    const root = document.getElementById('natureChallengeRoot');
    return Boolean(root && root.dataset && root.dataset.natureControlsBound === '1');
  });

  const logView = page.locator('.nature-birds-view[data-birds-view="log"]');
  if (await logView.isVisible().catch(() => false)) {
    return logView;
  }

  const openLogBtn = page.locator('#birdsOpenLogBtn');
  await openLogBtn.waitFor({ state: 'visible' });
  const activeLogView = page.locator('.nature-birds-view.is-active[data-birds-view="log"]');

  const waitForLogActivation = async () => {
    await page.waitForFunction(() => {
      const logViewEl = document.querySelector('.nature-birds-view[data-birds-view="log"]');
      if (!logViewEl) return false;
      const isVisible = !logViewEl.hidden && logViewEl.getAttribute('aria-hidden') !== 'true';
      const isActive = logViewEl.classList.contains('is-active');
      const logBtn = document.getElementById('birdsOpenLogBtn');
      const buttonCurrent = logBtn ? String(logBtn.getAttribute('aria-current') || '') : '';
      return isVisible && (isActive || buttonCurrent === 'page');
    }, { timeout: 8000 });
  };

  let activated = false;
  for (let attempt = 0; attempt < 2 && !activated; attempt += 1) {
    await activateFooterAction(page, openLogBtn);
    activated = await waitForLogActivation()
      .then(() => true)
      .catch(() => false);
  }

  if (!activated) {
    await collapseErrorNotificationBar(page);
    await openLogBtn.evaluate((node) => {
      if (node && typeof node.click === 'function') node.click();
    });
    await waitForLogActivation();
  }

  await activeLogView.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
  await logView.waitFor({ state: 'visible' });
  return logView;
}

/**
 * Opens Nature Challenge and waits for the Birds overview controls to be
 * fully interactive.
 *
 * @param {import('@playwright/test').Page} page
 */
async function openNatureOverviewView(page) {
  await page.locator('.app-tab-btn[data-tab="nature-challenge"]').click();

  const natureRoot = page.locator('#natureChallengeRoot');
  await natureRoot.waitFor({ state: 'visible', timeout: 10000 });

  await page.waitForFunction(() => {
    const root = document.getElementById('natureChallengeRoot');
    if (!root) return false;

    const controlsBound = root.dataset && root.dataset.natureControlsBound === '1';
    const tabLoaded = (window.tabLoader && typeof window.tabLoader.isTabLoaded === 'function')
      ? !!window.tabLoader.isTabLoaded('nature-challenge')
      : true;
    const exploreBtn = document.getElementById('birdsExploreBtn');
    const hasExploreControl = Boolean(exploreBtn && exploreBtn.offsetParent !== null);

    return controlsBound && tabLoaded && hasExploreControl;
  }, { timeout: 10000 });

  const explore = page.locator('#birdsExploreBtn');
  await explore.waitFor({ state: 'visible', timeout: 10000 });
  return explore;
}

/**
 * Opens Nature Challenge -> Birds Log view and optionally skips the test when
 * required UI elements are unavailable on the current build.
 *
 * @param {import('@playwright/test').TestInfo} testInfo
 * @param {import('@playwright/test').Page} page
 * @param {{ requiredSelectors?: string[], skipMessage?: string }} [options]
 */
async function openNatureLogViewOrSkip(testInfo, page, options) {
  const config = options || {};
  const requiredSelectors = Array.isArray(config.requiredSelectors) ? config.requiredSelectors : [];
  const skipMessage = config.skipMessage || 'Required Nature log UI is not available on this APP_URL build.';
  const logView = await openNatureLogView(page);

  const hasRequiredUi = (await Promise.all(requiredSelectors.map(async (selector) => {
    return (await logView.locator(selector).count()) > 0;
  }))).every(Boolean);
  testInfo.skip(!hasRequiredUi, skipMessage);

  return logView;
}

/**
 * Seeds Adventure explorer table fetches with deterministic fixture rows so
 * explorer cards are always available in smoke environments.
 *
 * @param {import('@playwright/test').Page} page
 */
async function installVisitedExplorerSeedFixture(page) {
  await page.addInitScript(() => {
    // Explorer table reads require a token; a stub value is enough for mocked responses.
    window.accessToken = 'playwright-visited-seed-token';
    window.visitedSyncConfig = {
      persistenceWorkbookPath: 'Copilot_Apps/Kyles_Adventure_Finder/Adventure_Finder_Excel_DB.xlsx',
      persistenceTableName: 'VisitedFeaturePersistence',
      persistenceWorksheetName: 'VisitedPersistence'
    };
  });

  const fixtureMatrix = {
    values: [
      ['name', 'city', 'state', 'description', 'address', 'hours', 'phone', 'google url', 'tags'],
      [
        'Playwright Seed Location',
        'Austin',
        'TX',
        'Seed baseline description',
        '123 Seed Street',
        'Mon-Fri 9am-5pm',
        '(512) 555-0001',
        'https://maps.google.com/?q=123+Seed+Street+Austin+TX',
        'seed;smoke'
      ]
    ]
  };

  await page.route(/https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/root:\/.*\/workbook\/tables\/[^/]+\/range\?.*/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(fixtureMatrix)
    });
  });

  await page.route(/https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/root:\/.*\/workbook\/tables\/[^/]+\/columns(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        value: [
          { name: 'Name', index: 0 },
          { name: 'City', index: 1 },
          { name: 'State', index: 2 },
          { name: 'Visited', index: 3 }
        ]
      })
    });
  });

  await page.route(/https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/root:\/.*\/workbook\/tables$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        value: [
          { name: 'VisitedFeaturePersistence' }
        ]
      })
    });
  });

  await page.route(/https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/root:\/.*\/workbook\/worksheets\?\$select=id,name,position$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        value: [
          { id: 'sheet-visited', name: 'VisitedPersistence', position: 0 }
        ]
      })
    });
  });

  await page.route(/https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/root:\/.*\/workbook\/tables\/[^/]+\/columns\/add(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: 'seed-column', name: 'Visited', index: 3 })
    });
  });

  await page.route(/https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/root:\/.*\/workbook\/tables\/[^/]+\/rows(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ value: [] })
    });
  });
}

module.exports = {
  collapseErrorNotificationBar,
  activateFooterAction,
  openNatureOverviewView,
  openNatureLogView,
  openNatureLogViewOrSkip,
  installVisitedExplorerSeedFixture
};

