/**
 * Recipes Shopping – Modal-Flow Integration Tests
 * ================================================
 * Covers the modal-based flows inside the RecipesShoppingUI that lives in the
 * Household Tools tab → Recipes sub-tab:
 *
 *  - Create new recipe modal (open → fill → save → card appears)
 *  - Missing required fields notice modal (validation guard)
 *  - Delete recipe confirm modal (confirm path + cancel path)
 *  - Add pantry item modal (open → fill → save → pantry updated)
 *  - Sync-help notice modal (opens / closes)
 *  - Shopping list "View" modal (shows list items)
 *  - Multi-recipe shopping list creation modal (select recipes → create)
 */

const { test, expect } = require('./reliability-test');


// ---------------------------------------------------------------------------
// Navigation helper – open Household Tools → Recipes pane
// ---------------------------------------------------------------------------

async function openHouseholdRecipesPane(page) {
  await page.goto('/');

  // Switch to household-tools tab
  await page.evaluate(() => {
    if (window.tabLoader && typeof window.tabLoader.switchTab === 'function') {
      window.tabLoader.switchTab('household-tools', {
        syncUrl: true,
        historyMode: 'replace',
        source: 'recipes-shopping-spec'
      });
    }
  });

  const root = page.locator('#householdToolsRoot');
  await expect(root).toBeVisible({ timeout: 15000 });

  // The Recipes pane is active by default in Household Tools.
  // Wait for RecipesShoppingUI to mount the pane.
  await page.waitForFunction(() => {
    const pane = document.getElementById('recipesShoppingPane');
    return pane && pane.children.length > 0;
  }, { timeout: 12000 });

  return root;
}

// ---------------------------------------------------------------------------
// Shared beforeEach setup
// ---------------------------------------------------------------------------

test.describe('Recipes Shopping – Create recipe modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.removeItem('kap_saved_recipes_v1');
      window.localStorage.removeItem('kap_shopping_lists_v1');
      window.localStorage.removeItem('kap_pantry_items_v1');
      window.localStorage.removeItem('kap_recipe_sync_status_v1');
    });
  });

  test('opens create recipe modal and saves a new recipe', async ({ page }) => {
    await openHouseholdRecipesPane(page);
    const pane = page.locator('#recipesShoppingPane');

    // Click "Create New Recipe"
    await pane.locator('button:has-text("Create New Recipe")').click();

    const modal = page.locator('.recipes-shopping-create-recipe-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal).toContainText('Create new recipe');

    // Fill in the form
    await modal.locator('#quick-recipe-name').fill('Spiced Salmon Bowl');
    await modal.locator('#quick-recipe-ingredients').fill('salmon\nrice\nspinach');
    await modal.locator('#quick-recipe-instructions').fill(
      '1. Season salmon. 2. Cook rice. 3. Sauté spinach. 4. Assemble bowl.'
    );
    await modal.locator('#quick-recipe-description').fill('A healthy protein-packed bowl.');

    // Save
    await modal.locator('[data-modal-action="save-recipe"]').click();

    // Create-recipe modal closes; a notice modal should confirm success
    const noticeModal = page.locator('.recipes-shopping-notice-modal');
    await expect(noticeModal).toBeVisible({ timeout: 5000 });
    await expect(noticeModal).toContainText('Recipe saved');
    await noticeModal.locator('[data-modal-action="close"]').click();

    // The new recipe card should now appear in the recipes list
    await expect(pane.locator('.recipe-card-title:has-text("Spiced Salmon Bowl")')).toBeVisible({
      timeout: 5000
    });
  });

  test('shows validation notice when required fields are missing', async ({ page }) => {
    await openHouseholdRecipesPane(page);
    const pane = page.locator('#recipesShoppingPane');

    await pane.locator('button:has-text("Create New Recipe")').click();
    const modal = page.locator('.recipes-shopping-create-recipe-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Attempt save without filling anything
    await modal.locator('[data-modal-action="save-recipe"]').click();

    // A notice modal about missing fields should appear
    const notice = page.locator('.recipes-shopping-notice-modal');
    await expect(notice).toBeVisible({ timeout: 4000 });
    await expect(notice).toContainText('Missing required fields');

    // Dismiss notice; create modal should still be open
    await notice.locator('[data-modal-action="close"]').click();
    await expect(modal).toBeVisible();
  });

  test('create recipe modal closes via the × button', async ({ page }) => {
    await openHouseholdRecipesPane(page);
    const pane = page.locator('#recipesShoppingPane');

    await pane.locator('button:has-text("Create New Recipe")').click();
    const modal = page.locator('.recipes-shopping-create-recipe-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Click the × close button
    await modal.locator('[data-modal-action="close"]').first().click();
    await expect(modal).toBeHidden();
  });
});

test.describe('Recipes Shopping – Delete recipe confirm modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const recipes = {
        'recipe-test-1': {
          name: 'Pasta Carbonara',
          description: 'Classic Italian pasta',
          ingredients: [{ name: 'pasta', category: 'other', quantity: 1 }],
          instructions: 'Cook pasta, mix eggs and cheese.',
          syncStatus: 'local-only',
          source: 'manual'
        }
      };
      window.localStorage.setItem('kap_saved_recipes_v1', JSON.stringify(recipes));
      window.localStorage.setItem(
        'kap_recipe_sync_status_v1',
        JSON.stringify({ 'recipe-test-1': 'local-only' })
      );
      window.localStorage.removeItem('kap_shopping_lists_v1');
      window.localStorage.removeItem('kap_pantry_items_v1');
    });
  });

  test('shows confirm modal and deletes recipe on confirm', async ({ page }) => {
    await openHouseholdRecipesPane(page);
    const pane = page.locator('#recipesShoppingPane');

    await expect(pane.locator('.recipe-card-title:has-text("Pasta Carbonara")')).toBeVisible();

    // Click Delete on the recipe card
    await pane
      .locator('.recipe-card:has(.recipe-card-title:has-text("Pasta Carbonara")) .recipe-action-delete')
      .click();

    const confirmModal = page.locator('.recipes-shopping-confirm-modal');
    await expect(confirmModal).toBeVisible({ timeout: 5000 });
    await expect(confirmModal).toContainText('Delete recipe?');

    // Confirm deletion
    await confirmModal.locator('[data-confirm-action="confirm"]').click();
    await expect(confirmModal).toBeHidden({ timeout: 4000 });

    // Recipe card should be gone
    await expect(
      pane.locator('.recipe-card-title:has-text("Pasta Carbonara")')
    ).toHaveCount(0);
  });

  test('cancels deletion when Cancel is clicked', async ({ page }) => {
    await openHouseholdRecipesPane(page);
    const pane = page.locator('#recipesShoppingPane');

    await expect(pane.locator('.recipe-card-title:has-text("Pasta Carbonara")')).toBeVisible();

    await pane
      .locator('.recipe-card:has(.recipe-card-title:has-text("Pasta Carbonara")) .recipe-action-delete')
      .click();

    const confirmModal = page.locator('.recipes-shopping-confirm-modal');
    await expect(confirmModal).toBeVisible({ timeout: 5000 });

    // Cancel – recipe should persist
    await confirmModal.locator('[data-confirm-action="cancel"]').click();
    await expect(confirmModal).toBeHidden({ timeout: 4000 });
    await expect(pane.locator('.recipe-card-title:has-text("Pasta Carbonara")')).toBeVisible();
  });
});

test.describe('Recipes Shopping – Add pantry item modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.removeItem('kap_saved_recipes_v1');
      window.localStorage.removeItem('kap_shopping_lists_v1');
      window.localStorage.removeItem('kap_pantry_items_v1');
    });
  });

  test('opens pantry modal, fills it, and saves a new item', async ({ page }) => {
    await openHouseholdRecipesPane(page);
    const pane = page.locator('#recipesShoppingPane');

    // Navigate to Pantry sub-tab
    await pane.locator('[data-recipes-tab="pantry"]').click();
    await expect(pane.locator('.section-title:has-text("Pantry Inventory")')).toBeVisible({
      timeout: 5000
    });

    // Click "Add Item"
    await pane.locator('button:has-text("Add Item")').click();

    const modal = page.locator('.recipes-shopping-pantry-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal).toContainText('Add pantry item');

    await modal.locator('#pantry-item-name').fill('Coconut Aminos');
    await modal.locator('#pantry-item-category').fill('sauces');
    await modal.locator('#pantry-item-qty').fill('2');
    await modal.locator('#pantry-item-unit').fill('bottle');

    await modal.locator('[data-modal-action="save-pantry"]').click();
    await expect(modal).toBeHidden({ timeout: 4000 });

    // New item should appear in the pantry view
    await expect(pane.locator('.pantry-item-name:has-text("Coconut Aminos")')).toBeVisible({
      timeout: 5000
    });
  });

  test('shows notice modal when pantry item name is empty', async ({ page }) => {
    await openHouseholdRecipesPane(page);
    const pane = page.locator('#recipesShoppingPane');

    // Switch to pantry tab
    await pane.locator('[data-recipes-tab="pantry"]').click();
    await pane.locator('button:has-text("Add Item")').click();

    const modal = page.locator('.recipes-shopping-pantry-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Save without a name
    await modal.locator('[data-modal-action="save-pantry"]').click();

    const notice = page.locator('.recipes-shopping-notice-modal');
    await expect(notice).toBeVisible({ timeout: 4000 });
    await expect(notice).toContainText('Missing item name');

    await notice.locator('[data-modal-action="close"]').click();
    await expect(modal).toBeVisible(); // pantry modal still open
  });
});

test.describe('Recipes Shopping – Sync help modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      // Seed one local-only recipe so the sync warning banner appears
      const recipes = {
        'recipe-sync-test': {
          name: 'Unsynced Soup',
          description: '',
          ingredients: [{ name: 'broth', category: 'other', quantity: 1 }],
          instructions: 'Heat broth.',
          syncStatus: 'local-only',
          source: 'manual'
        }
      };
      window.localStorage.setItem('kap_saved_recipes_v1', JSON.stringify(recipes));
      window.localStorage.setItem(
        'kap_recipe_sync_status_v1',
        JSON.stringify({ 'recipe-sync-test': 'local-only' })
      );
      window.localStorage.removeItem('kap_shopping_lists_v1');
    });
  });

  test('sync-help button opens the how-sync-works modal', async ({ page }) => {
    await openHouseholdRecipesPane(page);
    const pane = page.locator('#recipesShoppingPane');

    // The sync warning banner should show since we have a local-only recipe
    const learnMoreBtn = pane.locator('.sync-warning-btn:has-text("Learn More")');
    await expect(learnMoreBtn).toBeVisible({ timeout: 8000 });
    await learnMoreBtn.click();

    const helpModal = page.locator('.recipes-shopping-sync-help-modal');
    await expect(helpModal).toBeVisible({ timeout: 5000 });
    await expect(helpModal).toContainText('How recipe sync works');
    await expect(helpModal).toContainText('Recipes tab');

    // Close modal
    await helpModal.locator('[data-modal-action="close"]').click();
    await expect(helpModal).toBeHidden({ timeout: 4000 });
  });

  test('sync help modal can also be triggered programmatically', async ({ page }) => {
    await openHouseholdRecipesPane(page);

    await page.evaluate(() => {
      if (window.RecipesShoppingUI && typeof window.RecipesShoppingUI.showSyncHelpModal === 'function') {
        window.RecipesShoppingUI.showSyncHelpModal();
      }
    });

    const helpModal = page.locator('.recipes-shopping-sync-help-modal');
    await expect(helpModal).toBeVisible({ timeout: 5000 });
    await expect(helpModal).toContainText('How recipe sync works');

    // Close via backdrop click
    await helpModal.click({ position: { x: 5, y: 5 } });
    await expect(helpModal).toBeHidden({ timeout: 4000 });
  });
});

test.describe('Recipes Shopping – Shopping list view modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const listId = 'list-view-test-1';
      const lists = {};
      lists[listId] = {
        id: listId,
        name: 'Weekend Trip Shopping',
        createdAt: Date.now() - 60000,
        items: {
          'i1': { name: 'olive oil', category: 'sauces', quantity: 1 },
          'i2': { name: 'garlic powder', category: 'spices', quantity: 1 },
          'i3': { name: 'chicken breast', category: 'proteins', quantity: 2 }
        },
        checkedOffItems: {}
      };
      window.localStorage.setItem('kap_shopping_lists_v1', JSON.stringify(lists));
      window.localStorage.removeItem('kap_saved_recipes_v1');
      window.localStorage.removeItem('kap_pantry_items_v1');
    });
  });

  test('View button opens a shopping list details modal', async ({ page }) => {
    await openHouseholdRecipesPane(page);
    const pane = page.locator('#recipesShoppingPane');

    // Navigate to Shopping Lists sub-tab
    await pane.locator('[data-recipes-tab="shopping-lists"]').click();
    await expect(pane.locator('.section-title:has-text("Shopping Lists")')).toBeVisible({
      timeout: 5000
    });

    // Find the list card and click View
    await expect(
      pane.locator('.shopping-list-title:has-text("Weekend Trip Shopping")')
    ).toBeVisible({ timeout: 5000 });

    await pane.locator('.shopping-list-card:has(.shopping-list-title:has-text("Weekend Trip Shopping")) .pill-button:has-text("View")').click();

    const listModal = page.locator('.recipes-shopping-list-view-modal');
    await expect(listModal).toBeVisible({ timeout: 5000 });
    await expect(listModal).toContainText('Weekend Trip Shopping');
    await expect(listModal).toContainText('olive oil');
    await expect(listModal).toContainText('chicken breast');

    // Close the modal
    await listModal.locator('[data-modal-action="close"]').click();
    await expect(listModal).toBeHidden({ timeout: 4000 });
  });

  test('shopping list delete modal confirms and removes the list', async ({ page }) => {
    await openHouseholdRecipesPane(page);
    const pane = page.locator('#recipesShoppingPane');

    await pane.locator('[data-recipes-tab="shopping-lists"]').click();
    await expect(
      pane.locator('.shopping-list-title:has-text("Weekend Trip Shopping")')
    ).toBeVisible({ timeout: 5000 });

    await pane
      .locator('.shopping-list-card:has(.shopping-list-title:has-text("Weekend Trip Shopping")) .pill-button--danger')
      .click();

    const confirmModal = page.locator('.recipes-shopping-confirm-modal');
    await expect(confirmModal).toBeVisible({ timeout: 5000 });
    await expect(confirmModal).toContainText('Delete shopping list?');

    await confirmModal.locator('[data-confirm-action="confirm"]').click();
    await expect(confirmModal).toBeHidden({ timeout: 4000 });

    await expect(
      pane.locator('.shopping-list-title:has-text("Weekend Trip Shopping")')
    ).toHaveCount(0);
  });
});

test.describe('Recipes Shopping – Multi-recipe shopping list creation modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const recipes = {
        'recipe-multi-1': {
          name: 'Zucchini Pasta',
          description: '',
          ingredients: [{ name: 'zucchini', category: 'produce', quantity: 2 }],
          instructions: 'Spiralize zucchini and toss with sauce.',
          syncStatus: 'local-only',
          source: 'manual'
        },
        'recipe-multi-2': {
          name: 'Chicken Caesar Salad',
          description: '',
          ingredients: [
            { name: 'chicken breast', category: 'proteins', quantity: 1 },
            { name: 'romaine', category: 'produce', quantity: 1 }
          ],
          instructions: 'Grill chicken. Assemble salad.',
          syncStatus: 'local-only',
          source: 'manual'
        }
      };
      window.localStorage.setItem('kap_saved_recipes_v1', JSON.stringify(recipes));
      window.localStorage.setItem(
        'kap_recipe_sync_status_v1',
        JSON.stringify({ 'recipe-multi-1': 'local-only', 'recipe-multi-2': 'local-only' })
      );
      window.localStorage.removeItem('kap_shopping_lists_v1');
    });
  });

  test('opens multi-recipe modal and creates a shopping list from selected recipes', async ({ page }) => {
    await openHouseholdRecipesPane(page);
    const pane = page.locator('#recipesShoppingPane');

    // Navigate to Shopping Lists
    await pane.locator('[data-recipes-tab="shopping-lists"]').click();
    await expect(pane.locator('.section-title:has-text("Shopping Lists")')).toBeVisible({
      timeout: 5000
    });

    // Click "Create New Shopping List"
    await pane.locator('button:has-text("Create New Shopping List")').click();

    const multiModal = page.locator('.recipes-shopping-multi-list-modal');
    await expect(multiModal).toBeVisible({ timeout: 5000 });
    await expect(multiModal).toContainText('Create shopping list');

    // Both recipes should be listed as checkboxes
    await expect(
      multiModal.locator('label:has-text("Zucchini Pasta") input[type="checkbox"]')
    ).toBeVisible();
    await expect(
      multiModal.locator('label:has-text("Chicken Caesar Salad") input[type="checkbox"]')
    ).toBeVisible();

    // Select both recipes
    await multiModal.locator('label:has-text("Zucchini Pasta") input[type="checkbox"]').check();
    await multiModal.locator('label:has-text("Chicken Caesar Salad") input[type="checkbox"]').check();

    // Create the list
    await multiModal.locator('[data-modal-action="create-list"]').click();

    // A notice modal should confirm creation
    const notice = page.locator('.recipes-shopping-notice-modal');
    await expect(notice).toBeVisible({ timeout: 5000 });
    await expect(notice).toContainText('Shopping list created');
    await notice.locator('[data-modal-action="close"]').click();

    // The shopping lists view should show the new entry
    const listCards = pane.locator('.shopping-list-card');
    await expect(listCards).toHaveCount(1);
  });

  test('shows notice when no recipes are selected before creating a list', async ({ page }) => {
    await openHouseholdRecipesPane(page);
    const pane = page.locator('#recipesShoppingPane');

    await pane.locator('[data-recipes-tab="shopping-lists"]').click();
    await pane.locator('button:has-text("Create New Shopping List")').click();

    const multiModal = page.locator('.recipes-shopping-multi-list-modal');
    await expect(multiModal).toBeVisible({ timeout: 5000 });

    // Try creating without selecting anything
    await multiModal.locator('[data-modal-action="create-list"]').click();

    const notice = page.locator('.recipes-shopping-notice-modal');
    await expect(notice).toBeVisible({ timeout: 4000 });
    await expect(notice).toContainText('Choose recipes');

    await notice.locator('[data-modal-action="close"]').click();
    await expect(multiModal).toBeVisible(); // still open
  });

  test('multi-recipe modal closes via Cancel', async ({ page }) => {
    await openHouseholdRecipesPane(page);
    const pane = page.locator('#recipesShoppingPane');

    await pane.locator('[data-recipes-tab="shopping-lists"]').click();
    await pane.locator('button:has-text("Create New Shopping List")').click();

    const multiModal = page.locator('.recipes-shopping-multi-list-modal');
    await expect(multiModal).toBeVisible({ timeout: 5000 });

    await multiModal.locator('[data-modal-action="close"]').click();
    await expect(multiModal).toBeHidden({ timeout: 4000 });
  });
});

