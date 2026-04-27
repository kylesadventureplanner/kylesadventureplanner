const { test, expect } = require('./reliability-test');

const ASSERT_VISUAL_BASELINE = process.env.UI_SHELL_VISUAL_ASSERT === '1';
const MAX_DIFF_PIXEL_RATIO = Number(process.env.UI_SHELL_VISUAL_MAX_DIFF_RATIO || 0.01);

async function clearTransientUi(page) {
  await page.evaluate(() => {
    const toastContainer = document.getElementById('toastContainer');
    if (toastContainer) toastContainer.innerHTML = '';
  });
}

test.describe('UI shell visual snapshots', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('Bike Details shell and control rails stay visually consistent', async ({ page }) => {
    await page.goto('/HTML%20Files/bike-details-window.html', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('.wrap')).toHaveClass(/\bui-page-shell\b/);
    await expect(page.locator('#tabs')).toHaveClass(/\bui-control-bar\b/);
    await expect(page.locator('#actionBar')).toHaveClass(/\bui-control-bar\b/);

    await page.evaluate(() => {
      const actionBar = document.getElementById('actionBar');
      if (actionBar) actionBar.classList.remove('u-hidden');
    });
    await clearTransientUi(page);
    await page.waitForTimeout(150);

    const wrap = page.locator('.wrap').first();
    await expect(wrap).toBeVisible();
    await wrap.screenshot({ path: 'test-results/ui-shell-visual/bike-details-shell.png' });

    if (ASSERT_VISUAL_BASELINE) {
      await expect(wrap).toHaveScreenshot('bike-details-shell.png', {
        animations: 'disabled',
        maxDiffPixelRatio: MAX_DIFF_PIXEL_RATIO
      });
    }
  });

  test('Edit Mode shell and tab rail stay visually consistent', async ({ page }) => {
    await page.goto('/HTML%20Files/edit-mode-new.html', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('.app-container').first()).toHaveClass(/\bui-page-shell\b/);
    await expect(page.locator('.tabs-nav').first()).toHaveClass(/\bui-control-bar\b/);

    await clearTransientUi(page);
    await page.waitForTimeout(150);

    const container = page.locator('.app-container').first();
    await expect(container).toBeVisible();
    await container.screenshot({ path: 'test-results/ui-shell-visual/edit-mode-shell.png' });

    if (ASSERT_VISUAL_BASELINE) {
      await expect(container).toHaveScreenshot('edit-mode-shell.png', {
        animations: 'disabled',
        maxDiffPixelRatio: MAX_DIFF_PIXEL_RATIO
      });
    }
  });
});

