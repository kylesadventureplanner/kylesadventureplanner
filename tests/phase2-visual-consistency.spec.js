const { test, expect } = require('./reliability-test');

const ASSERT_BASELINE = process.env.PHASE2_VISUAL_ASSERT === '1';
const MAX_DIFF_PIXEL_RATIO = Number(process.env.PHASE2_VISUAL_MAX_DIFF_RATIO || 0.015);
const DESKTOP_MAX_DIFF_PIXEL_RATIO = Number(process.env.PHASE2_VISUAL_DESKTOP_MAX_DIFF_RATIO || 0.01);
const MOBILE_MAX_DIFF_PIXEL_RATIO = Number(process.env.PHASE2_VISUAL_MOBILE_MAX_DIFF_RATIO || 0.012);
const DESKTOP_MAX_DIFF_PIXELS = Number(process.env.PHASE2_VISUAL_DESKTOP_MAX_DIFF_PIXELS || 1400);
const MOBILE_MAX_DIFF_PIXELS = Number(process.env.PHASE2_VISUAL_MOBILE_MAX_DIFF_PIXELS || 2200);

function desktopVisualThresholds() {
  return {
    animations: 'disabled',
    maxDiffPixelRatio: Math.min(MAX_DIFF_PIXEL_RATIO, DESKTOP_MAX_DIFF_PIXEL_RATIO),
    maxDiffPixels: DESKTOP_MAX_DIFF_PIXELS
  };
}

function mobileVisualThresholds() {
  return {
    animations: 'disabled',
    fullPage: true,
    maxDiffPixelRatio: Math.min(MAX_DIFF_PIXEL_RATIO, MOBILE_MAX_DIFF_PIXEL_RATIO),
    maxDiffPixels: MOBILE_MAX_DIFF_PIXELS
  };
}

async function openVisitedChallenge(page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const challengeTab = page.locator('.app-tab-btn[data-tab="visited-locations"]').first();
  await expect(challengeTab).toBeVisible();
  await challengeTab.click();
  await expect(page.locator('#visitedLocationsRoot')).toBeVisible();
  await page.waitForTimeout(180);
}

async function seedCityViewerCache(page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    const key = 'phase2_visual_city_viewer_data';
    const row = new Array(24).fill('');
    row[0] = 'Phase2 Visual Coffee Spot';
    row[1] = 'phase2-place-id';
    row[2] = 'https://example.com/phase2-visual';
    row[9] = 'NC';
    row[10] = 'Asheville';
    row[11] = '123 Snapshot Way';
    row[13] = '4.6';
    row[23] = 'https://maps.google.com/?q=Asheville';

    const payload = {
      adventuresData: [{ rowId: 'phase2-row-1', values: [row] }],
      configuredSources: ['Saved'],
      dataMode: 'full',
      exportedAt: new Date().toISOString(),
      totalCount: 1
    };
    sessionStorage.setItem(key, JSON.stringify(payload));
    sessionStorage.setItem('city_viewer_data_latest', key);
  });
}

test.describe('Phase 2 visual consistency snapshots', () => {
  test.describe('desktop', () => {
    test.use({ viewport: { width: 1366, height: 900 } });

    test('snapshots for Edit Mode, City Viewer, and Visited Challenge', async ({ page }) => {
      await page.goto('/HTML%20Files/edit-mode-enhanced.html', { waitUntil: 'domcontentloaded' });
      const editContainer = page.locator('.container').first();
      await expect(editContainer).toBeVisible();
      await editContainer.screenshot({ path: 'test-results/phase2-visual/edit-mode-enhanced-desktop.png' });
      if (ASSERT_BASELINE) {
        await expect(editContainer).toHaveScreenshot('edit-mode-enhanced-desktop.png', desktopVisualThresholds());
      }

      await seedCityViewerCache(page);
      await page.goto('/HTML%20Files/city-viewer-window.html', { waitUntil: 'domcontentloaded' });
      const cityContainer = page.locator('.container').first();
      await expect(cityContainer).toBeVisible();
      await cityContainer.screenshot({ path: 'test-results/phase2-visual/city-viewer-desktop.png' });
      if (ASSERT_BASELINE) {
        await expect(cityContainer).toHaveScreenshot('city-viewer-desktop.png', desktopVisualThresholds());
      }

      await openVisitedChallenge(page);
      const visitedRoot = page.locator('#visitedLocationsRoot').first();
      await visitedRoot.screenshot({ path: 'test-results/phase2-visual/visited-locations-desktop.png' });
      if (ASSERT_BASELINE) {
        await expect(visitedRoot).toHaveScreenshot('visited-locations-desktop.png', desktopVisualThresholds());
      }
    });
  });

  test.describe('mobile', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test.beforeEach(async ({ context }) => {
      await context.addInitScript(() => {
        try {
          localStorage.setItem('iphoneViewEnabled', '1');
        } catch (_error) {
          // Ignore storage availability issues.
        }
      });
    });

    test('snapshots for Edit Mode, City Viewer, and Visited Challenge', async ({ page }) => {
      await page.goto('/HTML%20Files/edit-mode-enhanced.html', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('body')).toBeVisible();
      await page.waitForTimeout(180);
      await page.screenshot({ path: 'test-results/phase2-visual/edit-mode-enhanced-mobile.png', fullPage: true });
      if (ASSERT_BASELINE) {
        await expect(page).toHaveScreenshot('edit-mode-enhanced-mobile.png', mobileVisualThresholds());
      }

      await seedCityViewerCache(page);
      await page.goto('/HTML%20Files/city-viewer-window.html', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('body')).toBeVisible();
      await page.waitForTimeout(180);
      await page.screenshot({ path: 'test-results/phase2-visual/city-viewer-mobile.png', fullPage: true });
      if (ASSERT_BASELINE) {
        await expect(page).toHaveScreenshot('city-viewer-mobile.png', mobileVisualThresholds());
      }

      await openVisitedChallenge(page);
      await page.screenshot({ path: 'test-results/phase2-visual/visited-locations-mobile.png', fullPage: true });
      if (ASSERT_BASELINE) {
        await expect(page).toHaveScreenshot('visited-locations-mobile.png', mobileVisualThresholds());
      }
    });
  });
});

