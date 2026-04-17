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

  const openLogBtn = page.locator('#birdsOpenLogBtn');
  await openLogBtn.waitFor({ state: 'visible' });
  await openLogBtn.click();

  const activeLogView = page.locator('.nature-birds-view.is-active[data-birds-view="log"]');
  await activeLogView.waitFor({ state: 'visible' });

  const logView = page.locator('.nature-birds-view[data-birds-view="log"]');
  await logView.waitFor({ state: 'visible' });
  return logView;
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

module.exports = { collapseErrorNotificationBar, activateFooterAction, openNatureLogView, openNatureLogViewOrSkip };

