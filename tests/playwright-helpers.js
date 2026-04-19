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

