const { test, expect } = require('./reliability-test');

const ASSERT_VISUAL_BASELINE = process.env.MOBILE_QA_ASSERT === '1';
const MAX_DIFF_PIXEL_RATIO = Number(process.env.MOBILE_QA_MAX_DIFF_RATIO || 0.015);

test.describe('Mobile UX snapshots', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('captures iPhone-view snapshots across key pages', async ({ browser }) => {
	const context = await browser.newContext({ viewport: { width: 390, height: 844 } });

	await context.addInitScript(() => {
	  try {
		localStorage.setItem('iphoneViewEnabled', '1');
	  } catch (_error) {
		// Ignore storage availability issues.
	  }
	});

	const mainPage = await context.newPage();
	await mainPage.goto('/', { waitUntil: 'domcontentloaded' });
	await mainPage.evaluate(() => {
	  if (typeof window.applyIphoneViewState === 'function') {
		window.applyIphoneViewState(true);
		return;
	  }
	  document.body.classList.add('mobile-view', 'iphone-view');
	  document.body.dataset.mobileView = '1';
	});

	await expect(mainPage.locator('body')).toBeVisible();
	await mainPage.waitForTimeout(250);
	await mainPage.screenshot({ path: 'test-results/mobile-ux/index-mobile.png', fullPage: true });
	if (ASSERT_VISUAL_BASELINE) {
	  await expect(mainPage).toHaveScreenshot('index-mobile.png', {
		fullPage: true,
		animations: 'disabled',
		maxDiffPixelRatio: MAX_DIFF_PIXEL_RATIO
	  });
	}

	const pagePaths = [
	  '/HTML%20Files/adventure-details-window.html',
	  '/HTML%20Files/bike-details-window.html',
	  '/HTML%20Files/city-viewer-window.html',
	  '/HTML%20Files/trail-explorer-window.html',
	  '/HTML%20Files/find-near-me-window.html',
	  '/HTML%20Files/edit-mode-new.html'
	];

	for (const path of pagePaths) {
	  const page = await context.newPage();
	  await page.goto(path, { waitUntil: 'domcontentloaded' });
	  await expect(page.locator('body')).toBeVisible();
	  await page.waitForTimeout(200);

	  const slug = path
		.replace(/^\/+/, '')
		.replace(/%20/g, '-')
		.replace(/[^a-zA-Z0-9.-]/g, '-')
		.replace(/-+/g, '-');

	  await page.screenshot({
		path: `test-results/mobile-ux/${slug}.png`,
		fullPage: true
	  });

	  if (ASSERT_VISUAL_BASELINE) {
		await expect(page).toHaveScreenshot(`${slug}.png`, {
		  fullPage: true,
		  animations: 'disabled',
		  maxDiffPixelRatio: MAX_DIFF_PIXEL_RATIO
		});
	  }

	  await page.close();
	}

	await context.close();
  });
});

