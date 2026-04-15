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

module.exports = { collapseErrorNotificationBar, activateFooterAction };

