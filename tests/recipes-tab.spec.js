const { test, expect } = require('./reliability-test');

function tinyPngBuffer() {
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9s4q5Z0AAAAASUVORK5CYII=',
    'base64'
  );
}

test.describe('Recipes tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.removeItem('kapRecipesV1');
      window.localStorage.removeItem('kapRecipesV2');
    });

    await page.goto('/');
    await page.evaluate(() => {
      if (window.tabLoader && typeof window.tabLoader.switchTab === 'function') {
        window.tabLoader.switchTab('recipes', { syncUrl: true, historyMode: 'replace', source: 'recipes-spec' });
      }
    });
    await expect(page.locator('.app-tab-pane[data-tab="recipes"]')).toHaveClass(/active/);
    await expect(page.locator('#recipesRoot')).toBeVisible();
  });

  test('supports card display, manual add, details, notes, and filtering', async ({ page }) => {
    await expect(page.locator('#recipesCards .recipes-card')).toHaveCount(2);

    await page.locator('#recipesAddBtn').click();
    await page.locator('[data-recipes-intake-action="start-manual"]').click();

    await page.locator('#recipesEditorForm input[name="title"]').fill('Turkey Taco Bowls');
    await page.locator('#recipesEditorForm textarea[name="description"]').fill('High-protein meal prep bowl.');

    await page.locator('#recipesEditorProteinInput').fill('Turkey');
    await page.locator('#recipesEditorProteinInput').press('Enter');
    await page.locator('#recipesEditorCuisineInput').fill('Mexican');
    await page.locator('#recipesEditorCuisineInput').press('Enter');
    await page.locator('#recipesEditorMethodInput').fill('Skillet');
    await page.locator('#recipesEditorMethodInput').press('Enter');

    await page.locator('#recipesEditorForm input[name="prepMinutes"]').fill('20');
    await page.locator('#recipesEditorForm input[name="cookMinutes"]').fill('15');
    await page.locator('#recipesEditorForm select[name="courseCategory"]').selectOption('entree');
    await page.locator('#recipesEditorForm select[name="healthiness"]').selectOption('more_healthy');

    await page.locator('#recipesIngredientsList .recipes-ingredient-qty').first().fill('1 lb');
    await page.locator('#recipesIngredientsList .recipes-ingredient-item').first().fill('Ground turkey');
    await page.locator('#recipesStepsList .recipes-step-text').first().fill('Brown turkey in a skillet over medium heat.');

    await page.locator('#recipesPhotoFileInput').setInputFiles({
      name: 'tiny.png',
      mimeType: 'image/png',
      buffer: tinyPngBuffer()
    });
    await expect(page.locator('#recipesPhotoPreview .recipes-photo-tile')).toHaveCount(1);

    await page.locator('#recipesEditorForm').locator('button[type="submit"]').click();

    await expect(page.locator('#recipesCards .recipes-card:has-text("Turkey Taco Bowls")')).toBeVisible();

    await page.locator('#recipesCards .recipes-card:has-text("Turkey Taco Bowls")').click();
    await expect(page.locator('#recipesDetails')).toBeVisible();
    await expect(page.locator('#recipesDetailsBody')).toContainText('1 lb');
    await expect(page.locator('#recipesDetailsBody')).toContainText('Ground turkey');
    await expect(page.locator('#recipesDetailsBody')).toContainText('Course: Entree');
    await expect(page.locator('#recipesDetailsBody')).toContainText('Healthiness: More healthy');

    await page.locator('#recipesAddNoteBtn').click();
    const firstNote = page.locator('#recipesNotesList .recipes-note-row').first();
    await firstNote.locator('input').fill('Great with avocado and lime.');
    await firstNote.locator('[data-note-action="save"]').click();
    await expect(page.locator('#recipesNotesList .recipes-note-row').first().locator('input')).toHaveValue('Great with avocado and lime.');

    await page.locator('#recipesFilterProteinInput').fill('Turkey');
    await page.locator('#recipesFilterProteinInput').press('Enter');
    await page.locator('#recipesFilterCourseCategory').selectOption('entree');
    await page.locator('#recipesFilterHealthiness').selectOption('more_healthy');
    await expect(page.locator('#recipesCards .recipes-card')).toHaveCount(1);
    await expect(page.locator('#recipesCards .recipes-card')).toContainText('Turkey Taco Bowls');
  });

  test('tracks pantry spices and recommended additions', async ({ page }) => {
    await expect(page.locator('#recipesPantrySpiceList')).toContainText('Italian Seasoning');
    await expect(page.locator('#recipesPantryMissingList')).toContainText('Cumin');

    await page.locator('#recipesPantrySpiceInput').fill('sumac');
    await page.locator('#recipesAddPantrySpiceBtn').click();
    await expect(page.locator('#recipesPantrySpiceList')).toContainText('Sumac');

    const recommendedToAdd = page.locator('#recipesPantryMissingList [data-pantry-action="add-recommended"]').first();
    const recommendedName = await recommendedToAdd.getAttribute('data-spice-name');
    await recommendedToAdd.click();
    await expect(page.locator('#recipesPantrySpiceList')).toContainText(new RegExp(String(recommendedName || '').replace(/_/g, ' '), 'i'));

    await page.locator('#recipesPantrySpiceList [data-pantry-action="remove"][data-spice-name="sumac"]').click();
    await expect(page.locator('#recipesPantrySpiceList')).not.toContainText('Sumac');
  });

  test('shows entree pairings, ingredient substitutions, and similar recipes', async ({ page }) => {
    async function addRecipe(model) {
      if (await page.locator('#recipesIntakePanel').isHidden()) {
        await page.locator('#recipesAddBtn').click();
      }
      await page.locator('[data-recipes-intake-action="start-manual"]').click();
      await page.locator('#recipesEditorForm input[name="title"]').fill(model.title);
      await page.locator('#recipesEditorForm textarea[name="description"]').fill(model.description || '');
      if (model.protein) {
        await page.locator('#recipesEditorProteinInput').fill(model.protein);
        await page.locator('#recipesEditorProteinInput').press('Enter');
      }
      if (model.cuisine) {
        await page.locator('#recipesEditorCuisineInput').fill(model.cuisine);
        await page.locator('#recipesEditorCuisineInput').press('Enter');
      }
      if (model.method) {
        await page.locator('#recipesEditorMethodInput').fill(model.method);
        await page.locator('#recipesEditorMethodInput').press('Enter');
      }
      await page.locator('#recipesEditorForm select[name="courseCategory"]').selectOption(model.courseCategory);
      await page.locator('#recipesEditorForm select[name="healthiness"]').selectOption(model.healthiness);
      await page.locator('#recipesIngredientsList .recipes-ingredient-item').first().fill(model.ingredient);
      await page.locator('#recipesStepsList .recipes-step-text').first().fill(model.step || 'Cook and serve.');
      await page.locator('#recipesEditorForm button[type="submit"]').click();
      await expect(page.locator('#recipesEditorOverlay')).toBeHidden();
    }

    await addRecipe({
      title: 'Garlic Green Beans',
      description: 'Simple side dish.',
      protein: 'Vegetarian',
      cuisine: 'American',
      method: 'Skillet',
      courseCategory: 'side_dish',
      healthiness: 'more_healthy',
      ingredient: 'Green beans'
    });

    await addRecipe({
      title: 'Berry Yogurt Parfait',
      description: 'Light dessert.',
      protein: 'Vegetarian',
      cuisine: 'American',
      method: 'No Cook',
      courseCategory: 'dessert',
      healthiness: 'more_healthy',
      ingredient: 'Greek yogurt'
    });

    await addRecipe({
      title: 'Turkey Taco Salad',
      description: 'A related entree for similarity checks.',
      protein: 'Turkey',
      cuisine: 'Mexican',
      method: 'Skillet',
      courseCategory: 'entree',
      healthiness: 'more_healthy',
      ingredient: 'Ground turkey'
    });

    await addRecipe({
      title: 'Turkey Taco Bowls',
      description: 'Primary entree recipe.',
      protein: 'Turkey',
      cuisine: 'Mexican',
      method: 'Skillet',
      courseCategory: 'entree',
      healthiness: 'more_healthy',
      ingredient: 'Ground turkey'
    });

    await page.locator('#recipesCards .recipes-card:has-text("Turkey Taco Bowls")').click();
    await expect(page.locator('#recipesDetailsBody')).toContainText('Pairings for this entree');
    await expect(page.locator('#recipesDetailsBody')).toContainText('Garlic Green Beans');
    await expect(page.locator('#recipesDetailsBody')).toContainText('Berry Yogurt Parfait');
    await expect(page.locator('#recipesDetailsBody')).toContainText('Why this pairing:');

    await page.locator('#recipesSubIngredientSelect').selectOption({ label: 'Ground turkey' });
    await page.locator('#recipesFindSubstitutionsBtn').click();
    await expect(page.locator('#recipesSubstitutionsResult')).toContainText('Potential substitutions for Ground turkey');
    await expect(page.locator('#recipesSubstitutionsResult')).toContainText('Ground chicken');

    await page.locator('#recipesSafeCookItemSelect').selectOption('chicken');
    await page.locator('#recipesFindSafeTempBtn').click();
    await expect(page.locator('#recipesSafeTempResult')).toContainText('Chicken: 165F (74C)');
    await expect(page.locator('#recipesSafeTempResult')).toContainText('USDA-safe target');

    await page.locator('#recipesSafeCookItemSelect').selectOption('steak_medium_rare');
    await page.locator('#recipesFindSafeTempBtn').click();
    await expect(page.locator('#recipesSafeTempResult')).toContainText('Steak - Medium Rare: 145F (63C)');
    await page.locator('#recipesSafeTempStrictMode').uncheck();
    await page.locator('#recipesFindSafeTempBtn').click();
    await expect(page.locator('#recipesSafeTempResult')).toContainText('Steak - Medium Rare: 130F (54C)');
    await expect(page.locator('#recipesSafeTempResult')).toContainText('Culinary target');

    await page.locator('#recipesCookTimeItemSelect').selectOption('chicken_breast');
    await page.locator('#recipesCookTimeMethodSelect').selectOption('air_fryer');
    await page.locator('#recipesFindCookTimeBtn').click();
    await expect(page.locator('#recipesCookTimeResult')).toContainText('Chicken Breast (Air Fry): 14-18 min @ 375F');

    const cardCountBeforeVariation = await page.locator('#recipesCards .recipes-card').count();
    await page.locator('[data-variation-title-index="0"]').fill('Spicy Weeknight Variation');
    await page.locator('[data-variation-text-index="0"]').fill('Add chipotle peppers, reduce prep steps, and finish with lime for a faster spicy version.');
    await page.locator('[data-variation-action="accept"][data-variation-index="0"]').click();
    await expect(page.locator('#recipesDetailsBody')).toContainText('Saved variations');
    await expect(page.locator('#recipesDetailsBody')).toContainText('faster spicy version');
    await expect(page.locator('#recipesCards .recipes-card')).toHaveCount(cardCountBeforeVariation);

    const savedVariationId = await page.locator('[data-variation-action="update-saved"]').first().getAttribute('data-variation-id');
    await page.locator('[data-saved-variation-title-id="' + savedVariationId + '"]').fill('Spicy Citrus Variation');
    await page.locator('[data-saved-variation-text-id="' + savedVariationId + '"]').fill('Add lime zest and chipotle for a brighter flavor profile.');
    await page.locator('[data-variation-action="update-saved"][data-variation-id="' + savedVariationId + '"]').click();
    await expect(page.locator('[data-saved-variation-title-id="' + savedVariationId + '"]')).toHaveValue('Spicy Citrus Variation');
    await expect(page.locator('#recipesDetailsBody')).toContainText('brighter flavor profile');

    await page.locator('[data-variation-action="delete-saved"][data-variation-id="' + savedVariationId + '"]').click();
    await expect(page.locator('#recipesDetailsBody')).not.toContainText('Spicy Citrus Variation');

    await expect(page.locator('#recipesDetailsBody')).toContainText('Turkey Taco Salad');
    await page.locator('#recipesDetailsBody [data-similar-recipe-id]:has-text("Turkey Taco Salad")').first().click();
    await expect(page.locator('#recipesDetailsTitle')).toHaveText('Turkey Taco Salad');
  });

  test('parses URL and pasted text into the editor workflow', async ({ page }) => {
    await page.locator('#recipesAddBtn').click();

    await page.locator('[data-recipes-intake-tab="url"]').click();
    await page.locator('#recipesUrlInput').fill('https://recipes.example.com/spicy-chicken-ramen');
    await page.locator('[data-recipes-intake-action="parse-url"]').click();
    await expect(page.locator('#recipesEditorOverlay')).toBeVisible();
    await expect(page.locator('#recipesEditorForm input[name="title"]')).toHaveValue('Spicy Chicken Ramen');
    await page.locator('#recipesEditorCancel').click();

    await page.locator('[data-recipes-intake-tab="paste"]').click();
    await page.locator('#recipesPasteInput').fill([
      'Easy Beef Stir Fry',
      'Ingredients',
      '- 1 lb beef',
      '- 2 cups broccoli',
      'Instructions',
      '1. Heat skillet over medium heat.',
      '2. Cook beef and broccoli for 8 minutes.'
    ].join('\n'));
    await page.locator('[data-recipes-intake-action="parse-text"]').click();

    await expect(page.locator('#recipesEditorOverlay')).toBeVisible();
    await expect(page.locator('#recipesEditorForm input[name="title"]')).toHaveValue('Easy Beef Stir Fry');
    await expect(page.locator('#recipesIngredientsList .recipes-ingredient-item').first()).toHaveValue('beef');
    await expect(page.locator('#recipesStepsList .recipes-step-text').first()).toHaveValue('Heat skillet over medium heat.');
  });

  test('supports json export and import', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#recipesExportBtn').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('recipes-export-');

    const importPayload = {
      recipes: [
        {
          title: 'Imported Sushi Bowl',
          description: 'Imported from JSON',
          proteins: ['Seafood'],
          cuisines: ['Japanese'],
          methods: ['No Cook'],
          prepMinutes: 15,
          cookMinutes: 0,
          ingredients: [{ quantity: '1 cup', item: 'Rice' }],
          steps: ['Assemble ingredients and serve.'],
          photos: [],
          notes: []
        }
      ]
    };

    await page.locator('#recipesImportFileInput').setInputFiles({
      name: 'recipes-import.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(importPayload), 'utf8')
    });

    await expect(page.locator('#recipesCards .recipes-card')).toHaveCount(1);
    await expect(page.locator('#recipesCards .recipes-card')).toContainText('Imported Sushi Bowl');
  });
});
