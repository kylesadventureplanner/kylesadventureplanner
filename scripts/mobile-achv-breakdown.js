const { chromium } = require('@playwright/test');

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

  await page.waitForTimeout(1800);

  const data = await page.evaluate(() => {
    function block(el) {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        id: el.id || null,
        className: String(el.className || '').slice(0, 120),
        height: Math.round(r.height),
        marginTop: cs.marginTop,
        marginBottom: cs.marginBottom,
        paddingTop: cs.paddingTop,
        paddingBottom: cs.paddingBottom,
        display: cs.display
      };
    }

    const targets = [
      'achv-section-outdoors-category-progression',
      'achv-section-outdoors-challenges-badges',
      'achv-section-outdoors-seasonal-quests',
      'achv-section-outdoors-bingo'
    ];

    const sections = targets.map((id) => {
      const section = document.getElementById(id);
      if (!section) return { id, found: false };

      const childBlocks = Array.from(section.children)
        .filter((el) => {
          const cs = getComputedStyle(el);
          return cs.display !== 'none' && !el.hidden && el.getBoundingClientRect().height > 0;
        })
        .map((el) => ({
          tag: el.tagName.toLowerCase(),
          ...block(el)
        }))
        .sort((a, b) => b.height - a.height)
        .slice(0, 20);

      return {
        id,
        found: true,
        section: block(section),
        counts: {
          categoryCards: section.querySelectorAll('.adventure-achv-cat-card').length,
          challengeCards: section.querySelectorAll('.adventure-achv-challenge-card').length,
          badgeCards: section.querySelectorAll('.adventure-achv-badge-card').length,
          questCards: section.querySelectorAll('.adventure-achv-quest-card').length,
          bingoTiles: section.querySelectorAll('.adventure-achv-bingo-tile').length,
          tierChips: section.querySelectorAll('.adventure-achv-tier-chip').length
        },
        childBlocks
      };
    });

    return {
      scrollHeight: document.documentElement.scrollHeight,
      sections
    };
  });

  console.log(JSON.stringify(data, null, 2));

  await context.close();
  await browser.close();
})();

