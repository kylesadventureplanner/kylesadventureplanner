const { chromium } = require('@playwright/test');

function summarize(page, label) {
  return page.evaluate((checkpointLabel) => {
    function rectInfo(el) {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        className: String(el.className || '').slice(0, 120),
        top: Math.round(r.top + window.scrollY),
        height: Math.round(r.height),
        marginTop: cs.marginTop,
        marginBottom: cs.marginBottom,
        display: cs.display
      };
    }

    const root = document.querySelector('.app-container') || document.body;
    const visibleChildren = Array.from(root.children).filter((el) => {
      const cs = getComputedStyle(el);
      return cs.display !== 'none' && !el.hidden && el.getBoundingClientRect().height > 0;
    });

    const topChildren = visibleChildren
      .map(rectInfo)
      .sort((a, b) => b.height - a.height)
      .slice(0, 20);

    const visitedRoot = document.getElementById('visitedLocationsRoot');
    const visitedChildren = visitedRoot
      ? Array.from(visitedRoot.children)
          .filter((el) => {
            const cs = getComputedStyle(el);
            return cs.display !== 'none' && !el.hidden && el.getBoundingClientRect().height > 0;
          })
          .map(rectInfo)
          .sort((a, b) => b.height - a.height)
          .slice(0, 30)
      : [];

    const achvSections = Array.from(document.querySelectorAll('[id^="achv-section-"]'))
      .filter((el) => getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().height > 0)
      .map((el) => ({ id: el.id, ...rectInfo(el) }))
      .sort((a, b) => b.height - a.height)
      .slice(0, 30);

    const detailsState = Array.from(document.querySelectorAll('details')).map((el) => ({
      id: el.id || null,
      open: Boolean(el.open),
      height: Math.round(el.getBoundingClientRect().height)
    }));

    return {
      checkpoint: checkpointLabel,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      page: {
        documentScrollHeight: document.documentElement.scrollHeight,
        bodyScrollHeight: document.body.scrollHeight
      },
      topChildren,
      visitedChildren,
      achvSections,
      detailsState
    };
  }, label);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });

  await context.addInitScript(() => {
    try {
      localStorage.setItem('iphoneViewEnabled', '1');
    } catch (_error) {
      // ignore
    }
  });

  const page = await context.newPage();
  await page.goto(process.env.APP_URL || 'http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    if (typeof window.applyIphoneViewState === 'function') {
      window.applyIphoneViewState(true);
      return;
    }
    document.body.classList.add('mobile-view', 'iphone-view');
    document.body.dataset.mobileView = '1';
  });
  await page.waitForTimeout(250);
  const t250 = await summarize(page, 't+250ms');
  await page.waitForTimeout(1000);
  const t1250 = await summarize(page, 't+1250ms');
  await page.waitForTimeout(2000);
  const t3250 = await summarize(page, 't+3250ms');

  console.log(JSON.stringify({ checkpoints: [t250, t1250, t3250] }, null, 2));

  await context.close();
  await browser.close();
})();

