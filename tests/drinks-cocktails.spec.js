/**
 * Drinks Cocktails Tab – Filter & Subtab Integration Tests
 * =========================================================
 * Covers:
 *  - Subtab switching (na-brew → thc-bev → thc-edible → thc-cocktail-recipes)
 *  - Brand search filter
 *  - Min-rating filter
 *  - Location filter
 *  - Tags filter (taste/effects)
 *  - Sort order
 *  - Type filter (THC-specific trackers)
 *  - Schema-check banner visibility/dismissal when taste_tags /
 *    potency_effect_tags columns are absent from the Excel response
 */

const { test, expect } = require('./reliability-test');
const {
  buildDrinksStorage,
  openDrinksTab: openDrinksTabBase,
  drinksSubtab,
  countVisibleCards,
  readDrinksStorage
} = require('./drinks-cocktails-test-helpers');

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

function makeItem(overrides = {}) {
  return Object.assign(
    {
      id: 'test-' + String(Math.random()).slice(2),
      type: '',
      brand: 'Generic Brand',
      flavor: 'Original',
      strengthMg: '',
      myRating: 3,
      tasteNotes: '',
      tasteTags: [],
      effectsNotes: '',
      effectsTags: [],
      purchaseLocation: 'Total Wine',
      city: 'Charlotte',
      state: 'NC',
      updatedAt: Date.now()
    },
    overrides
  );
}

async function openDrinksTab(page, storageData = buildDrinksStorage()) {
  return openDrinksTabBase(page, expect, storageData);
}

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------

test.describe('Drinks Cocktails – subtab switching', () => {
  test('switches between na-brew, thc-bev, thc-edible, and thc-cocktail-recipes', async ({ page }) => {
    const storage = buildDrinksStorage({
      'na-brew': [makeItem({ brand: 'Athletic Brewing', flavor: 'Run Wild IPA' })],
      'thc-bev': [makeItem({ type: 'Seltzer (THC infused)', brand: 'Cann', flavor: 'Grapefruit' })],
    });
    const root = await openDrinksTab(page, storage);

    // NA Brew is active by default
    await expect(drinksSubtab(page, 'na-brew')).toHaveAttribute('aria-selected', 'true');
    await expect(root.locator('[data-dc-pane="na-brew"]')).toBeVisible();

    // Switch to THC Bev
    await drinksSubtab(page, 'thc-bev').click();
    await expect(drinksSubtab(page, 'thc-bev')).toHaveAttribute('aria-selected', 'true');
    await expect(root.locator('[data-dc-pane="thc-bev"]')).toBeVisible();
    await expect(root.locator('[data-dc-pane="na-brew"]')).toBeHidden();

    // Switch to THC Edible
    await drinksSubtab(page, 'thc-edible').click();
    await expect(drinksSubtab(page, 'thc-edible')).toHaveAttribute('aria-selected', 'true');
    await expect(root.locator('[data-dc-pane="thc-edible"]')).toBeVisible();

    // Switch to THC Cocktail Recipes
    await drinksSubtab(page, 'thc-cocktail-recipes').click();
    await expect(drinksSubtab(page, 'thc-cocktail-recipes')).toHaveAttribute('aria-selected', 'true');
    await expect(root.locator('[data-dc-pane="thc-cocktail-recipes"]')).toBeVisible();
  });
});

test.describe('Drinks Cocktails – brand filter (na-brew)', () => {
  test('filters cards by brand search input', async ({ page }) => {
    const storage = buildDrinksStorage({
      'na-brew': [
        makeItem({ brand: 'Athletic Brewing', flavor: 'Run Wild IPA', myRating: 4 }),
        makeItem({ brand: 'Gruvi', flavor: 'Stout', myRating: 3 }),
        makeItem({ brand: 'Athletic Brewing', flavor: 'Cerveza', myRating: 5 }),
      ]
    });
    const root = await openDrinksTab(page, storage);

    // All 3 cards visible initially
    expect(await countVisibleCards(page)).toBe(3);

    const brandInput = root.locator(
      '[data-dc-action="set-brand-filter"][data-tracker="na-brew"]'
    );
    await brandInput.fill('Athletic');
    await brandInput.dispatchEvent('change');

    // Only Athletic Brewing cards (2) should remain
    await expect.poll(() => countVisibleCards(page)).toBe(2);
    await expect(root.locator('[data-dc-pane="na-brew"] .dc-item-card')).toHaveCount(2);

    // Clear filter
    await brandInput.fill('');
    await brandInput.dispatchEvent('change');
    await expect.poll(() => countVisibleCards(page)).toBe(3);
  });
});

test.describe('Drinks Cocktails – min-rating filter (na-brew)', () => {
  test('shows only items at or above the selected minimum rating', async ({ page }) => {
    const storage = buildDrinksStorage({
      'na-brew': [
        makeItem({ brand: 'A', myRating: 2 }),
        makeItem({ brand: 'B', myRating: 4 }),
        makeItem({ brand: 'C', myRating: 5 }),
      ]
    });
    const root = await openDrinksTab(page, storage);
    expect(await countVisibleCards(page)).toBe(3);

    const ratingSelect = root.locator(
      '[data-dc-action="set-rating-filter"][data-tracker="na-brew"]'
    );
    await ratingSelect.selectOption('4');
    await expect.poll(() => countVisibleCards(page)).toBe(2);

    await ratingSelect.selectOption('5');
    await expect.poll(() => countVisibleCards(page)).toBe(1);

    await ratingSelect.selectOption('');
    await expect.poll(() => countVisibleCards(page)).toBe(3);
  });
});

test.describe('Drinks Cocktails – location filter (na-brew)', () => {
  test('filters cards by purchase location / city / state', async ({ page }) => {
    const storage = buildDrinksStorage({
      'na-brew': [
        makeItem({ brand: 'A', purchaseLocation: 'Total Wine', city: 'Charlotte', state: 'NC' }),
        makeItem({ brand: 'B', purchaseLocation: 'Publix', city: 'Atlanta', state: 'GA' }),
        makeItem({ brand: 'C', purchaseLocation: 'Total Wine', city: 'Raleigh', state: 'NC' }),
      ]
    });
    const root = await openDrinksTab(page, storage);
    expect(await countVisibleCards(page)).toBe(3);

    const locationInput = root.locator(
      '[data-dc-action="set-location-filter"][data-tracker="na-brew"]'
    );
    await locationInput.fill('Total Wine');
    await locationInput.dispatchEvent('change');
    await expect.poll(() => countVisibleCards(page)).toBe(2);

    await locationInput.fill('Atlanta');
    await locationInput.dispatchEvent('change');
    await expect.poll(() => countVisibleCards(page)).toBe(1);

    await locationInput.fill('NC');
    await locationInput.dispatchEvent('change');
    await expect.poll(() => countVisibleCards(page)).toBe(2);

    await locationInput.fill('');
    await locationInput.dispatchEvent('change');
    await expect.poll(() => countVisibleCards(page)).toBe(3);
  });
});

test.describe('Drinks Cocktails – tags filter', () => {
  test('filters na-brew cards by taste tag text', async ({ page }) => {
    const storage = buildDrinksStorage({
      'na-brew': [
        makeItem({ brand: 'A', tasteTags: ['refreshing', 'tart'] }),
        makeItem({ brand: 'B', tasteTags: ['bitter', 'hops'] }),
        makeItem({ brand: 'C', tasteTags: ['sweet', 'refreshing'] }),
      ]
    });
    const root = await openDrinksTab(page, storage);
    expect(await countVisibleCards(page)).toBe(3);

    const tagsInput = root.locator(
      '[data-dc-action="set-tags-filter"][data-tracker="na-brew"]'
    );
    await tagsInput.fill('refreshing');
    await tagsInput.dispatchEvent('change');
    await expect.poll(() => countVisibleCards(page)).toBe(2);

    await tagsInput.fill('hops');
    await tagsInput.dispatchEvent('change');
    await expect.poll(() => countVisibleCards(page)).toBe(1);

    await tagsInput.fill('');
    await tagsInput.dispatchEvent('change');
    await expect.poll(() => countVisibleCards(page)).toBe(3);
  });

  test('filters thc-bev cards by effects tag text', async ({ page }) => {
    const storage = buildDrinksStorage({
      'thc-bev': [
        makeItem({ type: 'Seltzer (THC infused)', brand: 'X', effectsTags: ['fast-acting', 'energetic'] }),
        makeItem({ type: 'Soda (THC infused)', brand: 'Y', effectsTags: ['sleepy', 'extra-relaxing'] }),
        makeItem({ type: 'Seltzer (THC infused)', brand: 'Z', effectsTags: ['clear-headed'] }),
      ]
    });
    const root = await openDrinksTab(page, storage);

    // Switch to THC Bev
    await drinksSubtab(page, 'thc-bev').click();
    await expect(root.locator('[data-dc-pane="thc-bev"]')).toBeVisible();

    const allCards = await page.evaluate(() => {
      const pane = document.querySelector('[data-dc-pane="thc-bev"]');
      return pane ? pane.querySelectorAll('.dc-item-card').length : 0;
    });
    expect(allCards).toBe(3);

    const tagsInput = root.locator(
      '[data-dc-action="set-tags-filter"][data-tracker="thc-bev"]'
    );
    await tagsInput.fill('sleepy');
    await tagsInput.dispatchEvent('change');

    await expect.poll(async () => {
      return page.evaluate(() => {
        const pane = document.querySelector('[data-dc-pane="thc-bev"]:not([hidden])');
        return pane ? pane.querySelectorAll('.dc-item-card').length : 0;
      });
    }).toBe(1);
  });
});

test.describe('Drinks Cocktails – sort order (na-brew)', () => {
  test('sorts cards by rating high-to-low and low-to-high', async ({ page }) => {
    const storage = buildDrinksStorage({
      'na-brew': [
        makeItem({ brand: 'Mid', myRating: 3, flavor: 'Mid' }),
        makeItem({ brand: 'Top', myRating: 5, flavor: 'Best' }),
        makeItem({ brand: 'Low', myRating: 1, flavor: 'Worst' }),
      ]
    });
    const root = await openDrinksTab(page, storage);

    const sortSelect = root.locator(
      '[data-dc-action="set-sort"][data-tracker="na-brew"]'
    );

    // Sort rating high → low; first card should be the 5-star item
    await sortSelect.selectOption('rating-desc');
    const firstBrandDesc = await root
      .locator('[data-dc-pane="na-brew"] .dc-item-card')
      .first()
      .locator('[data-dc-card-brand="1"]')
      .textContent();
    expect(String(firstBrandDesc || '')).toContain('Top');

    // Sort rating low → high; first card should be the 1-star item
    await sortSelect.selectOption('rating-asc');
    const firstBrandAsc = await root
      .locator('[data-dc-pane="na-brew"] .dc-item-card')
      .first()
      .locator('[data-dc-card-brand="1"]')
      .textContent();
    expect(String(firstBrandAsc || '')).toContain('Low');

    // Sort brand A-Z; first card should be 'Low' alphabetically
    await sortSelect.selectOption('brand-asc');
    const firstBrandAlpha = await root
      .locator('[data-dc-pane="na-brew"] .dc-item-card')
      .first()
      .locator('[data-dc-card-brand="1"]')
      .textContent();
    expect(String(firstBrandAlpha || '')).toContain('Low');

    // Sort brand Z-A; first card should be 'Top'
    await sortSelect.selectOption('brand-desc');
    const firstBrandZA = await root
      .locator('[data-dc-pane="na-brew"] .dc-item-card')
      .first()
      .locator('[data-dc-card-brand="1"]')
      .textContent();
    expect(String(firstBrandZA || '')).toContain('Top');
  });
});

test.describe('Drinks Cocktails – type filter (thc-bev)', () => {
  test('filters thc-bev cards by type selection', async ({ page }) => {
    const storage = buildDrinksStorage({
      'thc-bev': [
        makeItem({ type: 'Seltzer (THC infused)', brand: 'Cann', myRating: 4 }),
        makeItem({ type: 'Soda (THC infused)', brand: 'Wowie', myRating: 3 }),
        makeItem({ type: 'Seltzer (THC infused)', brand: 'Trip', myRating: 5 }),
        makeItem({ type: 'Juice (THC infused)', brand: 'JuiceCo', myRating: 2 }),
      ]
    });
    const root = await openDrinksTab(page, storage);

    // Switch to THC Bev subtab
    await drinksSubtab(page, 'thc-bev').click();
    await expect(root.locator('[data-dc-pane="thc-bev"]')).toBeVisible();

    const countThcCards = () =>
      page.evaluate(() => {
        const pane = document.querySelector('[data-dc-pane="thc-bev"]:not([hidden])');
        return pane ? pane.querySelectorAll('.dc-item-card').length : 0;
      });

    expect(await countThcCards()).toBe(4);

    const typeSelect = root.locator(
      '[data-dc-action="set-type-filter"][data-tracker="thc-bev"]'
    );
    await typeSelect.selectOption('Seltzer (THC infused)');
    await expect.poll(countThcCards).toBe(2);

    await typeSelect.selectOption('Soda (THC infused)');
    await expect.poll(countThcCards).toBe(1);

    await typeSelect.selectOption('all');
    await expect.poll(countThcCards).toBe(4);
  });
});

test.describe('Drinks Cocktails – combined filters', () => {
  test('applies brand + min-rating + tags together', async ({ page }) => {
    const storage = buildDrinksStorage({
      'na-brew': [
        makeItem({ brand: 'Athletic', myRating: 5, tasteTags: ['refreshing'] }),
        makeItem({ brand: 'Athletic', myRating: 2, tasteTags: ['bitter'] }),
        makeItem({ brand: 'Gruvi', myRating: 5, tasteTags: ['refreshing'] }),
      ]
    });
    const root = await openDrinksTab(page, storage);
    expect(await countVisibleCards(page)).toBe(3);

    const brandInput = root.locator('[data-dc-action="set-brand-filter"][data-tracker="na-brew"]');
    const ratingSelect = root.locator('[data-dc-action="set-rating-filter"][data-tracker="na-brew"]');
    const tagsInput = root.locator('[data-dc-action="set-tags-filter"][data-tracker="na-brew"]');

    await brandInput.fill('Athletic');
    await brandInput.dispatchEvent('change');
    await ratingSelect.selectOption('4');
    await tagsInput.fill('refreshing');
    await tagsInput.dispatchEvent('change');

    // Only 1 item matches all three: Athletic + rating≥4 + refreshing
    await expect.poll(() => countVisibleCards(page)).toBe(1);
  });
});

test.describe('Drinks Cocktails – schema-check banner', () => {
  /**
   * Injects a Graph API route that returns columns _without_ taste_tags /
   * potency_effect_tags, then triggers a sync to activate the schema banner.
   */
  async function setupSchemaBannerTest(page) {
    await page.addInitScript(() => {
      window.accessToken = 'test-schema-token';
    });

    await page.route(/https:\/\/graph\.microsoft\.com.*/, async (route) => {
      const url = route.request().url();

      if (/\/columns/.test(url)) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            value: [
              { name: 'Brand', index: 0 },
              { name: 'Flavor', index: 1 },
              { name: 'My Rating', index: 2 },
              { name: 'Taste Notes', index: 3 },
              { name: 'Purchase Locations', index: 4 },
              { name: 'City', index: 5 },
              { name: 'State', index: 6 }
            ]
          })
        });
        return;
      }

      if (/\/rows/.test(url)) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ value: [] })
        });
        return;
      }

      if (/\/root:\/Recipes/.test(url)) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ name: 'Recipes.xlsx', id: 'wb-1' })
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ value: [] })
      });
    });

    return openDrinksTab(page, buildDrinksStorage());
  }

  test('schema banner appears when taste_tags is absent after a sync', async ({ page }) => {
    const root = await setupSchemaBannerTest(page);

    // Trigger a sync from Excel (the mocked Graph returns columns without taste_tags)
    await page.evaluate(() => {
      if (window.DrinksCocktailsTabSystem && typeof window.DrinksCocktailsTabSystem.syncFromExcel === 'function') {
        return window.DrinksCocktailsTabSystem.syncFromExcel('na-brew');
      }
    });

    // The banner should become visible
    await expect(
      root.locator('[data-dc-schema-banner="na-brew"]')
    ).toBeVisible({ timeout: 8000 });

    await expect(
      root.locator('[data-dc-schema-banner="na-brew"]')
    ).toContainText('taste_tags');
  });

  test('schema banner can be dismissed', async ({ page }) => {
    const root = await setupSchemaBannerTest(page);

    await page.evaluate(() => {
      if (window.DrinksCocktailsTabSystem && typeof window.DrinksCocktailsTabSystem.syncFromExcel === 'function') {
        return window.DrinksCocktailsTabSystem.syncFromExcel('na-brew');
      }
    });

    await expect(
      root.locator('[data-dc-schema-banner="na-brew"]')
    ).toBeVisible({ timeout: 8000 });

    // Click the dismiss (×) button
    await root
      .locator('[data-dc-schema-banner="na-brew"] [data-dc-action="dismiss-schema-banner"]')
      .click();

    await expect(
      root.locator('[data-dc-schema-banner="na-brew"]')
    ).toBeHidden();
  });

  test('schema banner for thc-bev includes potency_effect_tags', async ({ page }) => {
    const root = await setupSchemaBannerTest(page);

    // Switch to THC Bev and sync
    await drinksSubtab(page, 'thc-bev').click();
    await expect(root.locator('[data-dc-pane="thc-bev"]')).toBeVisible();

    await page.evaluate(() => {
      if (window.DrinksCocktailsTabSystem && typeof window.DrinksCocktailsTabSystem.syncFromExcel === 'function') {
        return window.DrinksCocktailsTabSystem.syncFromExcel('thc-bev');
      }
    });

    await expect(
      root.locator('[data-dc-schema-banner="thc-bev"]')
    ).toBeVisible({ timeout: 8000 });

    const bannerText = await root
      .locator('[data-dc-schema-banner="thc-bev"]')
      .textContent();
    expect(bannerText).toContain('potency_effect_tags');
  });

  test('no schema banner when all required columns are present', async ({ page }) => {
    await page.addInitScript(() => {
      window.accessToken = 'test-schema-full-token';
    });

    await page.route(/https:\/\/graph\.microsoft\.com.*/, async (route) => {
      const url = route.request().url();

      if (/\/columns/.test(url)) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            value: [
              { name: 'Brand', index: 0 },
              { name: 'Flavor', index: 1 },
              { name: 'My Rating', index: 2 },
              { name: 'Taste Notes', index: 3 },
              { name: 'taste_tags', index: 4 },
              { name: 'potency_effect_tags', index: 5 },
              { name: 'Purchase Locations', index: 6 },
              { name: 'City', index: 7 },
              { name: 'State', index: 8 }
            ]
          })
        });
        return;
      }

      if (/\/rows/.test(url)) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ value: [] })
        });
        return;
      }

      if (/\/root:\/Recipes/.test(url)) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ name: 'Recipes.xlsx', id: 'wb-1' })
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ value: [] })
      });
    });

    const root = await openDrinksTab(page, buildDrinksStorage());

    await page.evaluate(() => {
      if (window.DrinksCocktailsTabSystem && typeof window.DrinksCocktailsTabSystem.syncFromExcel === 'function') {
        return window.DrinksCocktailsTabSystem.syncFromExcel('na-brew');
      }
    });
    await expect(
      root.locator('[data-dc-schema-banner="na-brew"]')
    ).toHaveCount(0);
  });
});

test.describe('Drinks Cocktails – modal flows', () => {
  test('adds a new NA brew item through the modal and persists it to localStorage', async ({ page }) => {
    const root = await openDrinksTab(page);

    await expect(drinksSubtab(page, 'na-brew')).toHaveAttribute('aria-selected', 'true');
    await root.locator('[data-dc-action="add-item"][data-tracker="na-brew"]').click();

    const modal = page.locator('.dc-modal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Add NA Brew Tracker item');

    await modal.locator('[data-dc-modal-field="brand"]').fill('Athletic Brewing');
    await modal.locator('[data-dc-modal-field="flavor"]').fill('Run Wild IPA');
    await modal.locator('[data-dc-modal-action="save"]').click();

    await expect(modal).toBeHidden();
    await expect(root.locator('[data-dc-pane="na-brew"] .dc-item-card')).toHaveCount(1);
    await expect(root.locator('[data-dc-pane="na-brew"] [data-dc-card-brand="1"]')).toContainText('Athletic Brewing');
    await expect(root.locator('#drinksCocktailsStatus')).toContainText('Added new item to NA Brew Tracker.');

    const stored = await readDrinksStorage(page);
    expect(Array.isArray(stored['na-brew'])).toBe(true);
    expect(stored['na-brew']).toHaveLength(1);
    expect(stored['na-brew'][0].brand).toBe('Athletic Brewing');
    expect(stored['na-brew'][0].flavor).toBe('Run Wild IPA');
  });

  test('requires a brand before adding a new tracker item', async ({ page }) => {
    const root = await openDrinksTab(page);

    await root.locator('[data-dc-action="add-item"][data-tracker="na-brew"]').click();
    const modal = page.locator('.dc-modal');
    await expect(modal).toBeVisible();

    await modal.locator('[data-dc-modal-action="save"]').click();

    await expect(modal).toBeVisible();
    await expect(root.locator('#drinksCocktailsStatus')).toContainText('Brand is required before saving this item.');
    await expect(root.locator('[data-dc-pane="na-brew"] .dc-item-card')).toHaveCount(0);
  });

  test('adds a THC cocktail recipe through the modal and persists it to localStorage', async ({ page }) => {
    const root = await openDrinksTab(page);

    await drinksSubtab(page, 'thc-cocktail-recipes').click();
    await expect(drinksSubtab(page, 'thc-cocktail-recipes')).toHaveAttribute('aria-selected', 'true');
    await expect(root.locator('[data-dc-pane="thc-cocktail-recipes"]')).toBeVisible();

    await root.locator('[data-dc-action="add-cocktail-recipe"]').click();

    const modal = page.locator('.dc-modal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Add THC cocktail recipe');

    await modal.locator('[data-dc-modal-field="name"]').fill('Purple Nightcap');
    await modal.locator('[data-dc-modal-field="ingredients"]').fill('THC seltzer\nblackberry syrup\nlime juice');
    await modal.locator('[data-dc-modal-field="instructions"]').fill('Shake with ice, then strain into a chilled glass.');
    await modal.locator('[data-dc-modal-action="save"]').click();

    await expect(modal).toBeHidden();
    await expect(root.locator('[data-dc-pane="thc-cocktail-recipes"] .dc-item-card')).toHaveCount(1);
    await expect(root.locator('[data-dc-pane="thc-cocktail-recipes"] [data-dc-recipe-name="1"]')).toContainText('Purple Nightcap');
    await expect(root.locator('#drinksCocktailsStatus')).toContainText('Added THC cocktail recipe.');

    const stored = await readDrinksStorage(page);
    expect(Array.isArray(stored['thc-cocktail-recipes'])).toBe(true);
    expect(stored['thc-cocktail-recipes']).toHaveLength(1);
    expect(stored['thc-cocktail-recipes'][0].name).toBe('Purple Nightcap');
    expect(stored['thc-cocktail-recipes'][0].ingredients).toContain('THC seltzer');
  });
});




