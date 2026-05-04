const { expect } = require('@playwright/test');

function normalizeAppMode(mode) {
  return String(mode || '').trim().toLowerCase() === 'advanced' ? 'advanced' : 'daily';
}

/**
 * Seeds the persisted app mode before the next navigation.
 *
 * @param {import('@playwright/test').Page} page
 * @param {'daily'|'advanced'} [mode='daily']
 */
async function primeAppModeStorage(page, mode = 'daily') {
  const normalized = normalizeAppMode(mode);
  await page.addInitScript((appMode) => {
    try {
      window.localStorage.setItem('kapAppModeV1', appMode);
    } catch (_error) {
      // Ignore storage bootstrap failures in test mode.
    }
  }, normalized);
  return normalized;
}

/**
 * Switches app mode on a live page and waits for the DOM attribute to update.
 *
 * @param {import('@playwright/test').Page} page
 * @param {'daily'|'advanced'} [mode='daily']
 */
async function setAppMode(page, mode = 'daily') {
  const normalized = normalizeAppMode(mode);
  await page.evaluate((appMode) => {
    try {
      window.localStorage.setItem('kapAppModeV1', appMode);
    } catch (_error) {
      // Ignore storage write failures in test mode.
    }
    if (typeof window.setAppMode === 'function') {
      window.setAppMode(appMode);
      return;
    }
    document.documentElement.setAttribute('data-app-mode', appMode);
  }, normalized);
  await expect.poll(() => page.evaluate(() => String(document.documentElement.getAttribute('data-app-mode') || ''))).toBe(normalized);
  return normalized;
}

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
    errorBar.style.maxHeight = '36px';
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
 * Waits for Adventure Challenge to be mounted and a specific subtab pane to be
 * interactive.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} [subtabKey='all-locations']
 */
async function waitForAdventureChallengeReady(page, subtabKey = 'all-locations') {
  const safeSubtabKey = String(subtabKey || 'all-locations');
  await expect(page.locator('#visitedLocationsRoot')).toBeVisible({ timeout: 15000 });
  await page.waitForFunction((key) => {
    const root = document.getElementById('visitedLocationsRoot');
    if (!root) return false;
    const bound = root.dataset && root.dataset.bound === '1';
    const pane = document.getElementById(`visitedProgressPane-${key}`);
    const dock = document.querySelector(`#appSubTabsSlot [data-progress-subtab="${key}"]`);
    if (!pane || !dock) return false;
    const paneVisible = !pane.hidden && pane.getAttribute('aria-hidden') !== 'true';
    const dockVisible = dock instanceof HTMLElement && dock.offsetParent !== null;
    return bound && paneVisible && dockVisible;
  }, safeSubtabKey, { timeout: 15000 });
  await expect(page.locator(`#visitedProgressPane-${safeSubtabKey}`)).toBeVisible({ timeout: 15000 });
}

/**
 * Opens Adventure Challenge using the requested app mode and waits for a target
 * subtab to become interactive.
 *
 * @param {import('@playwright/test').Page} page
 * @param {{ mode?: 'daily'|'advanced', subtabKey?: string }} [options]
 */
async function openAdventureChallenge(page, options = {}) {
  const mode = normalizeAppMode(options.mode || 'daily');
  const subtabKey = String(options.subtabKey || (mode === 'advanced' ? 'outdoors' : 'all-locations')).trim();
  const initialSubtabKey = 'all-locations';
  await primeAppModeStorage(page, mode);
  await page.goto('/');
  await setAppMode(page, mode);
  await activateFooterAction(page, page.locator('.app-tab-btn[data-tab="visited-locations"]'));
  await waitForAdventureChallengeReady(page, initialSubtabKey);
  if (subtabKey && subtabKey !== initialSubtabKey) {
    await ensureAdventureSubtabSelected(page, subtabKey);
  }
  return subtabKey;
}

/**
 * Ensures an Adventure subtab is selected and ready.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} subtabKey
 */
async function ensureAdventureSubtabSelected(page, subtabKey) {
  const safeSubtabKey = String(subtabKey || '').trim();
  const dockButton = page.locator(`#appSubTabsSlot [data-progress-subtab="${safeSubtabKey}"]`).first();
  await expect(dockButton).toBeVisible({ timeout: 15000 });
  const isSelected = await dockButton.getAttribute('aria-selected').catch(() => null);
  if (isSelected !== 'true') {
    await activateFooterAction(page, dockButton);
  }
  await waitForAdventureChallengeReady(page, safeSubtabKey);
  return dockButton;
}

/**
 * Returns the visible Adventure subtab keys in dock order.
 *
 * @param {import('@playwright/test').Page} page
 */
async function readVisibleAdventureSubtabs(page) {
  return page.evaluate(() => {
    return Array.from(document.querySelectorAll('#appSubTabsSlot [data-progress-subtab]'))
      .filter((node) => node instanceof HTMLElement && !node.hidden && node.getAttribute('aria-hidden') !== 'true' && node.offsetParent !== null)
      .map((node) => String(node.getAttribute('data-progress-subtab') || '').trim())
      .filter(Boolean);
  });
}

/**
 * Waits for a specific Adventure subtab view to become visible/hidden.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} subtabKey
 * @param {string} viewKey
 * @param {{ visible?: boolean, timeout?: number }} [options]
 */
async function waitForAdventureSubtabView(page, subtabKey, viewKey, options) {
  const config = options || {};
  const visible = config.visible !== false;
  const timeout = Number(config.timeout || 10000);
  const safeSubtabKey = String(subtabKey || 'outdoors');
  const safeViewKey = String(viewKey || 'overview');
  await expect.poll(async () => page.evaluate(({ key, view }) => {
    const node = document.querySelector(`#visitedProgressPane-${key} [data-visited-subtab-view="${view}"]`);
    if (!node) return { exists: false, visible: false };
    const style = window.getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    const isVisible = !node.hidden
      && node.getAttribute('aria-hidden') !== 'true'
      && style.display !== 'none'
      && style.visibility !== 'hidden'
      && rect.width > 0
      && rect.height > 0;
    return { exists: true, visible: isVisible };
  }, { key: safeSubtabKey, view: safeViewKey }), { timeout }).toEqual(visible ? {
    exists: true,
    visible: true
  } : expect.objectContaining({ visible: false }));
  return page.locator(`#visitedProgressPane-${safeSubtabKey} [data-visited-subtab-view="${safeViewKey}"]`).first();
}

/**
 * Clicks an Adventure subtab action and waits for a target sub-view to activate.
 * Falls back to in-page click when Playwright's click does not transition the UI.
 *
 * @param {import('@playwright/test').Page} page
 * @param {{ subtabKey: string, action: string, targetView: string, timeout?: number }} options
 */
async function openAdventureSubtabView(page, options) {
  const config = options || {};
  const subtabKey = String(config.subtabKey || 'outdoors');
  const action = String(config.action || '');
  const targetView = String(config.targetView || 'overview');
  const timeout = Number(config.timeout || 10000);
  const button = page.locator(`#visitedProgressPane-${subtabKey} [data-visited-subtab-action="${action}"]`).first();
  await expect(button).toBeVisible({ timeout });

  let activated = false;
  for (let attempt = 0; attempt < 2 && !activated; attempt += 1) {
    await activateFooterAction(page, button);
    activated = await waitForAdventureSubtabView(page, subtabKey, targetView, { timeout: 4000 })
      .then(() => true)
      .catch(() => false);
  }

  if (!activated) {
    await button.evaluate((node) => {
      if (node && typeof node.click === 'function') node.click();
    });
  }

  await waitForAdventureSubtabView(page, subtabKey, targetView, { timeout });
  return button;
}

/**
 * Waits for the Adventure jump-links container to reflect hidden/visible state.
 *
 * @param {import('@playwright/test').Page} page
 * @param {{ hidden: boolean, timeout?: number }} options
 */
async function waitForAdventureJumpLinksState(page, options) {
  const config = options || {};
  const hidden = Boolean(config.hidden);
  const timeout = Number(config.timeout || 10000);
  await expect.poll(async () => page.evaluate(() => {
    const node = document.querySelector('#visitedLocationsRoot .visited-jump-links');
    if (!node) return { exists: false, hiddenAttr: false, ariaHidden: '', visible: false };
    const style = window.getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return {
      exists: true,
      hiddenAttr: node.hasAttribute('hidden'),
      ariaHidden: String(node.getAttribute('aria-hidden') || ''),
      visible: !node.hidden && style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0
    };
  }), { timeout }).toEqual(hidden
    ? expect.objectContaining({ exists: true, hiddenAttr: true, ariaHidden: 'true', visible: false })
    : expect.objectContaining({ exists: true, hiddenAttr: false, visible: true }));
  return page.locator('#visitedLocationsRoot .visited-jump-links').first();
}

/**
 * Waits until an embedded iframe is visible, sized, and its content is ready.
 *
 * @param {import('@playwright/test').Locator} frameLocator
 * @param {{ srcPattern?: RegExp, bodySelector?: string, minWidth?: number, minHeight?: number, timeout?: number }} [options]
 */
async function waitForEmbeddedFrameReady(frameLocator, options) {
  const config = options || {};
  const timeout = Number(config.timeout || 10000);
  const minWidth = Number(config.minWidth || 250);
  const minHeight = Number(config.minHeight || 120);
  await expect(frameLocator).toBeVisible({ timeout });
  if (config.srcPattern) {
    await expect(frameLocator).toHaveAttribute('src', config.srcPattern, { timeout });
  }
  await expect.poll(async () => frameLocator.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return {
      width: Math.max(Number(rect.width || 0), Number(node.clientWidth || 0), Number(node.offsetWidth || 0)),
      height: Math.max(Number(rect.height || 0), Number(node.clientHeight || 0), Number(node.offsetHeight || 0))
    };
  }), { timeout }).toEqual(expect.objectContaining({
    width: expect.any(Number),
    height: expect.any(Number)
  }));
  await expect.poll(async () => {
    const metrics = await frameLocator.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return {
        width: Math.max(Number(rect.width || 0), Number(node.clientWidth || 0), Number(node.offsetWidth || 0)),
        height: Math.max(Number(rect.height || 0), Number(node.clientHeight || 0), Number(node.offsetHeight || 0))
      };
    });
    return metrics.width > minWidth && metrics.height > minHeight;
  }, { timeout }).toBe(true);

  const liveFrame = await expect.poll(async () => {
    const handle = await frameLocator.elementHandle();
    return handle ? await handle.contentFrame() : null;
  }, { timeout }).not.toBeNull().then(async () => {
    const handle = await frameLocator.elementHandle();
    return handle ? await handle.contentFrame() : null;
  });

  if (config.bodySelector && liveFrame) {
    await expect(liveFrame.locator(config.bodySelector)).toBeVisible({ timeout });
  }
  return liveFrame;
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
  primeAppModeStorage,
  setAppMode,
  collapseErrorNotificationBar,
  activateFooterAction,
  waitForAdventureChallengeReady,
  openAdventureChallenge,
  ensureAdventureSubtabSelected,
  readVisibleAdventureSubtabs,
  waitForAdventureSubtabView,
  openAdventureSubtabView,
  waitForAdventureJumpLinksState,
  waitForEmbeddedFrameReady,
  openNatureOverviewView,
  openNatureLogView,
  openNatureLogViewOrSkip,
  installVisitedExplorerSeedFixture
};

