const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await page.click('.app-tab-btn[data-tab="nature-challenge"]');
  await page.click('#appSubTabsSlot [data-nature-subtab="mammals"]');
  await page.waitForTimeout(400);

  const before = await page.evaluate(() => {
    const state = window.__natureChallengeState || {};
    const btn = document.getElementById('birdsExploreBtn');
    const rect = btn ? btn.getBoundingClientRect() : null;
    return {
      subTab: state.activeSubTab || '',
      view: state.activeBirdView || '',
      scrollY: window.scrollY,
      rect: rect ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height } : null
    };
  });

  await page.click('#birdsExploreBtn');
  await page.waitForTimeout(300);

  const after = await page.evaluate(() => {
    const state = window.__natureChallengeState || {};
    return {
      subTab: state.activeSubTab || '',
      view: state.activeBirdView || '',
      scrollY: window.scrollY,
      explorerActive: Boolean(document.querySelector('.nature-birds-view.is-active[data-birds-view="explorer"]'))
    };
  });

  console.log(JSON.stringify({ before, after }, null, 2));
  await browser.close();
})().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});

