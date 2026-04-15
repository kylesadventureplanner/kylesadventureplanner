const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await page.click('.app-tab-btn[data-tab="nature-challenge"]');
  await page.waitForTimeout(500);

  const initial = await page.evaluate(() => {
    const ids = ['birdsExploreBtn', 'birdsOpenLogBtn', 'birdsOpenMapBtn', 'natureChallengeRefreshBtn'];
    return ids.map((id) => {
      const el = document.getElementById(id);
      const rect = el ? el.getBoundingClientRect() : null;
      return { id, exists: !!el, rect: rect ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height } : null };
    });
  });

  const results = [];

  await page.click('#birdsExploreBtn');
  await page.waitForTimeout(250);
  results.push(await page.evaluate(() => ({ action: 'explore', explorerActive: !!document.querySelector('.nature-birds-view.is-active[data-birds-view="explorer"]') })));

  const backFromExplorer = page.locator('#birdsExplorerBackBtn');
  if (await backFromExplorer.count()) {
    await backFromExplorer.click();
    await page.waitForTimeout(200);
  }

  await page.click('#birdsOpenLogBtn');
  await page.waitForTimeout(250);
  results.push(await page.evaluate(() => ({ action: 'log', logActive: !!document.querySelector('.nature-birds-view.is-active[data-birds-view="log"]') })));

  const backFromLog = page.locator('#birdsLogBackBtn');
  if (await backFromLog.count()) {
    await backFromLog.click();
    await page.waitForTimeout(200);
  }

  await page.click('#birdsOpenMapBtn');
  await page.waitForTimeout(250);
  results.push(await page.evaluate(() => ({ action: 'map', mapVisible: !!document.querySelector('#birdsMapOverlay:not([hidden])') })));

  if (await page.locator('#birdsMapCloseBtn').count()) {
    await page.click('#birdsMapCloseBtn');
    await page.waitForTimeout(200);
  }

  await page.click('#natureChallengeRefreshBtn');
  await page.waitForTimeout(250);
  results.push(await page.evaluate(() => ({
    action: 'refresh',
    badge: (document.getElementById('natureSyncHealthBadgeInline') || {}).textContent || ''
  })));

  console.log(JSON.stringify({ initial, results }, null, 2));
  await browser.close();
})().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});

