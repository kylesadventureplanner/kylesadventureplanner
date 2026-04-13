const { test, expect } = require('./reliability-test');

const ASSERT_VISUAL_BASELINE = process.env.MOBILE_QA_ASSERT === '1';
const MAX_DIFF_PIXEL_RATIO = Number(process.env.MOBILE_QA_MAX_DIFF_RATIO || 0.015);
const EXPECTED_MOBILE_SCROLL_HEIGHT = Number(process.env.MOBILE_QA_EXPECTED_HEIGHT || 7816);
const MIN_MOBILE_SCROLL_HEIGHT = Number(process.env.MOBILE_QA_MIN_HEIGHT || 7600);
const MAX_MOBILE_SCROLL_HEIGHT = Number(process.env.MOBILE_QA_MAX_HEIGHT || 8600);

function parseStrictMobileHeight() {
  if (process.env.MOBILE_QA_STRICT_HEIGHT === '1') return EXPECTED_MOBILE_SCROLL_HEIGHT;
  if (process.env.MOBILE_QA_EXPECTED_HEIGHT) return EXPECTED_MOBILE_SCROLL_HEIGHT;
  return null;
}

async function waitForStableMobileSnapshotState(page) {
  const timeoutMs = Number(process.env.MOBILE_QA_READY_TIMEOUT_MS || 12000);
  const stableSamplesRequired = Number(process.env.MOBILE_QA_STABLE_SAMPLES || 3);
  const intervalMs = Number(process.env.MOBILE_QA_STABLE_INTERVAL_MS || 250);
  const strictHeight = parseStrictMobileHeight();
  const start = Date.now();
  let lastHeight = -1;
  let stableSamples = 0;
  const sampledHeights = [];
  let lastState = null;

  while (Date.now() - start <= timeoutMs) {
	const state = await page.evaluate(() => {
	  const root = document.getElementById('visitedLocationsRoot');
	  const challengeSection = document.getElementById('achv-section-outdoors-challenges-badges');
	  return {
		scrollHeight: document.documentElement.scrollHeight,
		hasVisitedRoot: Boolean(root),
		hasChallengeSection: Boolean(challengeSection),
		challengeSectionHeight: challengeSection ? Math.round(challengeSection.getBoundingClientRect().height) : 0
	  };
	});
	lastState = state;
	sampledHeights.push(state.scrollHeight);
	if (sampledHeights.length > 8) sampledHeights.shift();

	if (state.scrollHeight === lastHeight) {
	  stableSamples += 1;
	} else {
	  stableSamples = 1;
	  lastHeight = state.scrollHeight;
	}

	const heightReady = strictHeight != null
	  ? state.scrollHeight === strictHeight
	  : state.scrollHeight >= MIN_MOBILE_SCROLL_HEIGHT && state.scrollHeight <= MAX_MOBILE_SCROLL_HEIGHT;

	const ready = stableSamples >= stableSamplesRequired
	  && state.hasVisitedRoot
	  && state.hasChallengeSection
	  && state.challengeSectionHeight >= 320
	  && heightReady;

	if (ready) return state;
	await page.waitForTimeout(intervalMs);
  }

  const finalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const sampledText = sampledHeights.join(', ');
  const modeText = strictHeight != null
	? `strict=${strictHeight}`
	: `range=${MIN_MOBILE_SCROLL_HEIGHT}-${MAX_MOBILE_SCROLL_HEIGHT}`;
  throw new Error(
	`Mobile snapshot readiness timeout. Final height=${finalHeight}; mode=${modeText}; stableSamples=${stableSamples}/${stableSamplesRequired}; sampled=[${sampledText}]; hasVisitedRoot=${Boolean(lastState && lastState.hasVisitedRoot)}; hasChallengeSection=${Boolean(lastState && lastState.hasChallengeSection)}; challengeSectionHeight=${Number(lastState && lastState.challengeSectionHeight) || 0}`
  );
}

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
	await waitForStableMobileSnapshotState(mainPage);
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

