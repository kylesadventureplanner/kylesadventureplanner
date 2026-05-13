function buildDrinksStorage(overrides = {}) {
  return {
    'na-brew': [],
    'thc-bev': [],
    'thc-edible': [],
    'thc-cocktail-recipes': [],
    ...overrides
  };
}

async function openDrinksTab(page, expect, storageData = buildDrinksStorage()) {
  await page.addInitScript((data) => {
    try {
      window.localStorage.setItem('kap_drinks_cocktails_v1', JSON.stringify(data));
      // Prevent auto-sync from attempting real Graph calls in tests unless a
      // spec intentionally seeded a mock access token earlier.
      if (!window.accessToken) window.accessToken = '';
    } catch (_err) {}
  }, storageData);

  await page.goto('/');

  await page.evaluate(() => {
    if (window.tabLoader && typeof window.tabLoader.switchTab === 'function') {
      window.tabLoader.switchTab('drinks-cocktails', {
        syncUrl: true,
        historyMode: 'replace',
        source: 'drinks-test-helper'
      });
    }
  });

  const root = page.locator('#drinksCocktailsRoot');
  await expect(root).toBeVisible({ timeout: 15000 });

  await page.waitForFunction(() => {
    const r = document.getElementById('drinksCocktailsRoot');
    return r && r.dataset.drinksCocktailsBound === '1';
  }, { timeout: 10000 });

  return root;
}

function drinksSubtab(page, key) {
  return page.locator(`#appSubTabsSlot [data-dc-subtab="${key}"], #drinksCocktailsRoot [data-dc-subtab="${key}"]`).first();
}

async function countVisibleCards(page) {
  return page.evaluate(() => {
    const activePane = document.querySelector('#drinksCocktailsRoot [data-dc-pane]:not([hidden])');
    if (!activePane) return 0;
    return activePane.querySelectorAll('.dc-item-card').length;
  });
}

async function readDrinksStorage(page) {
  return page.evaluate(() => JSON.parse(window.localStorage.getItem('kap_drinks_cocktails_v1') || '{}'));
}

module.exports = {
  buildDrinksStorage,
  openDrinksTab,
  drinksSubtab,
  countVisibleCards,
  readDrinksStorage
};

