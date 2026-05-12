/**
 * Recipes & Shopping List UI System
 * Handles rendering and interaction for recipes, shopping lists, and pantry management
 */

(function initRecipesShoppingUISystem(global) {
  'use strict';

  var sys = global.RecipesShoppingSystem;
  if (!sys) {
    console.error('RecipesShoppingSystem not initialized. Load recipes-shopping-system.js first.');
    return;
  }

  var ROOT_ID = 'recipesShoppingPane';
  var MAIN_VIEW_ID = 'recipesMainView';

  // ========================================================
  // RENDERING - MAIN INTERFACE
  // ========================================================

  /**
   * Render the main recipes & shopping interface
   */
  function renderMainView() {
    var pane = document.getElementById(ROOT_ID);
    if (!pane) return;

    var recipes = sys.getSavedRecipes();
    var recipeCount = Object.keys(recipes).length;
    var lists = sys.getShoppingLists();
    var listCount = Object.keys(lists).length;

    pane.innerHTML = '\
      <div class="recipes-shopping-header">\
        <div class="recipes-shopping-title">👨‍🍳 Recipes & Shopping Management</div>\
        <div class="recipes-shopping-subtitle">Manage recipes, create shopping lists, and track your pantry</div>\
      </div>\
      \
      <div class="recipes-shopping-tabs">\
        <button class="recipes-tab-btn active" data-recipes-tab="recipes" onclick="(window.RecipesShoppingUI || {}).switchTab && window.RecipesShoppingUI.switchTab(\'recipes\')">📋 Recipes (' + recipeCount + ')</button>\
        <button class="recipes-tab-btn" data-recipes-tab="shopping-lists" onclick="(window.RecipesShoppingUI || {}).switchTab && window.RecipesShoppingUI.switchTab(\'shopping-lists\')">🛒 Shopping Lists (' + listCount + ')</button>\
        <button class="recipes-tab-btn" data-recipes-tab="pantry" onclick="(window.RecipesShoppingUI || {}).switchTab && window.RecipesShoppingUI.switchTab(\'pantry\')">🧂 Pantry</button>\
        <button class="recipes-tab-btn" data-recipes-tab="ingredients" onclick="(window.RecipesShoppingUI || {}).switchTab && window.RecipesShoppingUI.switchTab(\'ingredients\')">📦 Ingredients Library</button>\
      </div>\
      \
      <div id="' + MAIN_VIEW_ID + '" class="recipes-tab-pane active">\
        ' + renderRecipesView() + '\
      </div>\
    ';
  }

   /**
    * Render recipes view with list and create button
    */
   function renderRecipesView() {
     var recipes = sys.getSavedRecipes();
     var localOnlyCount = sys.getLocalOnlyRecipeCount();

     var recipeList = Object.keys(recipes).map(function(id) {
       var recipe = recipes[id];
       var syncStatus = sys.getRecipeSyncStatus(id);
       var syncBadge = '';

       if (syncStatus === 'local-only') {
         syncBadge = '<span class="recipe-sync-badge recipe-sync-badge--local" title="Not synced with Excel">⚠️ Local Only</span>';
       } else if (syncStatus === 'synced') {
         syncBadge = '<span class="recipe-sync-badge recipe-sync-badge--synced" title="Synced with Excel">✓ Synced</span>';
       } else if (syncStatus === 'pending-sync') {
         syncBadge = '<span class="recipe-sync-badge recipe-sync-badge--pending" title="Pending sync">⏳ Pending Sync</span>';
       }

       return '\
         <div class="recipe-card">\
           <div class="recipe-card-header">\
             <div class="recipe-card-title">' + escapeHtml(recipe.name || 'Untitled Recipe') + ' ' + syncBadge + '</div>\
             <div class="recipe-card-actions">\
               ' + (recipe.source === 'imported' ? '<button class="recipe-action-btn" title="Edit imported recipe" onclick="(window.RecipesShoppingUI || {}).showEditImportedRecipeForm && window.RecipesShoppingUI.showEditImportedRecipeForm(\'' + escapeHtml(id) + '\')">✏️ Edit</button>' : '') + '\
               <button class="recipe-action-btn" title="Create shopping list from this recipe" onclick="(window.RecipesShoppingUI || {}).createShoppingListFromRecipe && window.RecipesShoppingUI.createShoppingListFromRecipe(\'' + escapeHtml(id) + '\')">🛒 Add to Shopping List</button>\
               <button class="recipe-action-btn recipe-action-delete" title="Delete recipe" onclick="if(confirm(\'Delete this recipe?\')) (window.RecipesShoppingUI || {}).deleteRecipe && window.RecipesShoppingUI.deleteRecipe(\'' + escapeHtml(id) + '\')">🗑️ Delete</button>\
             </div>\
           </div>\
           <div class="recipe-card-content">\
             ' + (recipe.description ? '<div class="recipe-description">' + escapeHtml(recipe.description) + '</div>' : '') + '\
             <div class="recipe-ingredients-summary">\
               Ingredients: ' + (recipe.ingredients ? recipe.ingredients.length : 0) + ' items\
             </div>\
           </div>\
         </div>\
       ';
     });

     var syncWarning = localOnlyCount > 0 ? '\
       <div class="recipe-sync-warning">\
         <span class="sync-warning-icon">⚠️</span>\
         <span class="sync-warning-text">' + localOnlyCount + ' recipe(s) not synced with Excel backend</span>\
         <button class="sync-warning-btn" onclick="alert(\'To sync recipes: Please export from the Recipes tab or use the app\\'s sync menu.\')">ℹ️ Learn More</button>\
       </div>\
     ' : '';

     return '\
       <div class="recipes-section">\
         ' + syncWarning + '\
         <div class="section-header">\
           <div class="section-title">Saved Recipes</div>\
           <div class="section-controls">\
             <button class="planner-top-btn planner-top-btn--success" onclick="(window.RecipesShoppingUI || {}).showImportRecipeForm && window.RecipesShoppingUI.showImportRecipeForm()">📥 Import Recipe</button>\
             <button class="planner-top-btn planner-top-btn--accent" onclick="(window.RecipesShoppingUI || {}).showRecipeForm && window.RecipesShoppingUI.showRecipeForm()">➕ Create New Recipe</button>\
           </div>\
         </div>\
         ' + (recipeList.length > 0 ? '<div class="recipe-cards-list">' + recipeList.join('') + '</div>' : '<div class="empty-state">No recipes yet. Create one or import one to get started!</div>') + '\
       </div>\
     ';
   }

  /**
   * Render shopping lists view
   */
  function renderShoppingListsView() {
    var lists = sys.getShoppingLists();
    var listEntries = Object.keys(lists).map(function(id) {
      var list = lists[id];
      var itemCount = Object.keys(list.items || {}).length;
      var checkedCount = Object.keys(list.checkedOffItems || {}).filter(function(key) {
        return list.checkedOffItems[key];
      }).length;
      var createdDate = new Date(list.createdAt).toLocaleDateString();

      return '\
        <div class="shopping-list-card">\
          <div class="shopping-list-header">\
            <div>\
              <div class="shopping-list-title">' + (list.name || 'Shopping List - ' + createdDate) + '</div>\
              <div class="shopping-list-meta">Created: ' + createdDate + ' | ' + checkedCount + '/' + itemCount + ' items</div>\
            </div>\
            <div class="shopping-list-actions">\
              <button class="pill-button" onclick="(window.RecipesShoppingUI || {}).viewShoppingList && window.RecipesShoppingUI.viewShoppingList(\'' + escapeHtml(id) + '\')">📋 View</button>\
              <button class="pill-button pill-button--danger" onclick="if(confirm(\'Delete this shopping list?\')) (window.RecipesShoppingUI || {}).deleteShoppingList && window.RecipesShoppingUI.deleteShoppingList(\'' + escapeHtml(id) + '\')">🗑️ Delete</button>\
            </div>\
          </div>\
        </div>\
      ';
    });

    return '\
      <div class="recipes-section">\
        <div class="section-header">\
          <div class="section-title">Shopping Lists</div>\
          <button class="planner-top-btn planner-top-btn--success" onclick="(window.RecipesShoppingUI || {}).createMultiRecipeShoppingList && window.RecipesShoppingUI.createMultiRecipeShoppingList()">🛒 Create New Shopping List</button>\
        </div>\
        ' + (listEntries.length > 0 ? '<div class="shopping-list-cards">' + listEntries.join('') + '</div>' : '<div class="empty-state">No shopping lists yet. Create one from your recipes!</div>') + '\
      </div>\
    ';
  }

  /**
   * Render pantry view with filter toggle
   */
  function renderPantryView() {
    var filterMode = sys.getPantryFilterMode();
    var itemsByCategory = sys.getPantryItemsByCategory(filterMode);
    var allItems = sys.getPantryItems();

    var categoryHTML = Object.keys(itemsByCategory).map(function(category) {
      var items = itemsByCategory[category];
      var displayName = sys.CATEGORY_DISPLAY_NAMES[category] || category;

      var itemsHTML = items.map(function(item) {
        return '\
          <div class="pantry-item" data-category="' + category + '">\
            <div class="pantry-item-info">\
              <span class="pantry-item-name">' + escapeHtml(item.name) + '</span>\
              ' + (item.quantity ? '<span class="pantry-item-qty">' + item.quantity + (item.unit ? ' ' + item.unit : '') + '</span>' : '') + '\
              ' + (item.isRecommended ? '<span class="pantry-item-badge recommended">Recommended</span>' : '') + '\
            </div>\
            <div class="pantry-item-actions">\
              ' + (item.inStock !== false ? '<button class="pantry-action-btn" title="Mark as used" onclick="(window.RecipesShoppingUI || {}).usePantryItem && window.RecipesShoppingUI.usePantryItem(\'' + escapeHtml(item.id || item.name) + '\')">✓ Used</button>' : '<span class="pantry-item-empty">Out of stock</span>') + '\
            </div>\
          </div>\
        ';
      }).join('');

      return '\
        <div class="pantry-category">\
          <div class="pantry-category-title">' + displayName + ' (' + items.length + ')</div>\
          <div class="pantry-items-list">' + itemsHTML + '</div>\
        </div>\
      ';
    }).join('');

    return '\
      <div class="recipes-section">\
        <div class="section-header">\
          <div class="section-title">Pantry Inventory</div>\
          <div class="section-controls">\
            <div class="filter-toggle">\
              <label class="filter-toggle-label">Show Filter:</label>\
              <button class="filter-toggle-btn ' + (filterMode === 'all' ? 'active' : '') + '" data-filter="all" onclick="(window.RecipesShoppingUI || {}).setPantryFilter && window.RecipesShoppingUI.setPantryFilter(\'all\')">📦 All Items (' + Object.keys(allItems).length + ')</button>\
              <button class="filter-toggle-btn ' + (filterMode === 'missing-recommended' ? 'active' : '') + '" data-filter="missing-recommended" onclick="(window.RecipesShoppingUI || {}).setPantryFilter && window.RecipesShoppingUI.setPantryFilter(\'missing-recommended\')">⚠️ Missing Recommended</button>\
            </div>\
            <button class="planner-top-btn planner-top-btn--accent" onclick="(window.RecipesShoppingUI || {}).showAddPantryItemForm && window.RecipesShoppingUI.showAddPantryItemForm()">➕ Add Item</button>\
          </div>\
        </div>\
        ' + (categoryHTML ? '<div class="pantry-inventory">' + categoryHTML + '</div>' : '<div class="empty-state">Pantry is empty</div>') + '\
      </div>\
    ';
  }

  /**
   * Render ingredients library view
   */
  function renderIngredientsLibraryView() {
    var library = sys.getIngredientsLibrary();
    var categoryHTML = Object.keys(library).map(function(category) {
      var items = library[category] || [];
      var displayName = sys.CATEGORY_DISPLAY_NAMES[category] || category;

      var itemsHTML = items.map(function(item) {
        return '<div class="ingredient-item">' + escapeHtml(item) + '</div>';
      }).join('');

      return '\
        <div class="ingredient-category">\
          <div class="ingredient-category-title">' + displayName + ' (' + items.length + ')</div>\
          <div class="ingredient-items-list">' + itemsHTML + '</div>\
        </div>\
      ';
    }).join('');

    return '\
      <div class="recipes-section">\
        <div class="section-header">\
          <div class="section-title">Ingredients Library</div>\
          <div class="section-subtitle">Pre-saved ingredients organized by category for quick recipe creation</div>\
        </div>\
        ' + (categoryHTML ? '<div class="ingredients-library">' + categoryHTML + '</div>' : '') + '\
      </div>\
    ';
  }

  // ========================================================
  // INTERACTION HANDLERS
  // ========================================================

  /**
   * Switch between tabs
   */
  function switchTab(tabName) {
    var pane = document.getElementById(ROOT_ID);
    if (!pane) return;

    // Update tab buttons
    var tabBtns = pane.querySelectorAll('[data-recipes-tab]');
    tabBtns.forEach(function(btn) {
      btn.classList.toggle('active', btn.getAttribute('data-recipes-tab') === tabName);
    });

    // Update tab content
    var mainView = pane.querySelector('#' + MAIN_VIEW_ID);
    if (!mainView) return;

    var tabContent = '';
    switch (tabName) {
      case 'recipes':
        tabContent = renderRecipesView();
        break;
      case 'shopping-lists':
        tabContent = renderShoppingListsView();
        break;
      case 'pantry':
        tabContent = renderPantryView();
        break;
      case 'ingredients':
        tabContent = renderIngredientsLibraryView();
        break;
    }

    mainView.innerHTML = tabContent;
  }

  /**
   * Set pantry filter mode
   */
  function setPantryFilter(mode) {
    sys.setPantryFilterMode(mode);

    // Update filter buttons
    var pane = document.getElementById(ROOT_ID);
    if (pane) {
      var filterBtns = pane.querySelectorAll('.filter-toggle-btn');
      filterBtns.forEach(function(btn) {
        btn.classList.toggle('active', btn.getAttribute('data-filter') === mode);
      });
    }

    // Re-render pantry view
    switchTab('pantry');
  }

  /**
   * Create shopping list from single recipe
   */
  function createShoppingListFromRecipe(recipeId) {
    var shoppingList = sys.generateShoppingListFromRecipes([recipeId]);
    sys.saveShoppingList(shoppingList.id, shoppingList);

    // Show success and switch to shopping lists view
    alert('Shopping list created for this recipe!');
    switchTab('shopping-lists');
  }

  /**
   * Create shopping list from multiple recipes
   */
  function createMultiRecipeShoppingList() {
    var recipes = sys.getSavedRecipes();
    if (Object.keys(recipes).length === 0) {
      alert('No recipes found. Create some recipes first!');
      return;
    }

    // For now, create a simple dialog
    var selectedIds = prompt('Enter recipe IDs (comma-separated) to include in shopping list:', '');
    if (!selectedIds) return;

    var ids = selectedIds.split(',').map(function(s) { return s.trim(); });
    var shoppingList = sys.generateShoppingListFromRecipes(ids);
    sys.saveShoppingList(shoppingList.id, shoppingList);

    alert('Shopping list created!');
    switchTab('shopping-lists');
  }

  /**
   * Use pantry item
   */
  function usePantryItem(itemId) {
    sys.usePantryItem(itemId, 1);
    switchTab('pantry');
  }

  /**
   * Show add pantry item form
   */
  function showAddPantryItemForm() {
    var name = prompt('Item name:');
    if (!name) return;

    var category = prompt('Category (e.g., spices, proteins, dairy):', 'other');
    var quantity = prompt('Quantity:', '1');
    var unit = prompt('Unit (e.g., cup, tsp, lb):', '');

    sys.addPantryItem(name, category, parseInt(quantity) || 1, unit);
    switchTab('pantry');
  }

   /**
    * Show recipe form
    */
   function showRecipeForm() {
     // Simple implementation - in a full system, you'd have a detailed form
     var name = prompt('Recipe name:');
     if (!name) return;

     var ingredients = prompt('Ingredients (comma-separated):', '');
     var ingredientList = ingredients.split(',').map(function(ing) {
       return { name: ing.trim(), category: 'other', quantity: 1 };
     });

     var recipeId = 'recipe-' + Date.now();
     sys.saveRecipe(recipeId, {
       name: name,
       description: '',
       ingredients: ingredientList,
       syncStatus: 'local-only'
     });

     sys.updateRecipeSyncStatus(recipeId, 'local-only');

     alert('Recipe saved!');
     renderMainView();
   }

   /**
    * Show import recipe form with text paste capability
    */
   function showImportRecipeForm() {
     var container = document.getElementById(ROOT_ID);
     if (!container) return;

     // Create modal dialog
     var modal = document.createElement('div');
     modal.className = 'recipe-import-modal';
     modal.style.cssText = '\
       position: fixed; top: 0; left: 0; right: 0; bottom: 0;\
       background: rgba(0,0,0,0.5); display: flex; align-items: center;\
       justify-content: center; z-index: 10000;\
     ';

     var dialog = document.createElement('div');
     dialog.className = 'recipe-import-dialog';
     dialog.style.cssText = '\
       background: white; border-radius: 12px; padding: 24px;\
       max-width: 600px; width: 90%; max-height: 80vh; overflow: auto;\
       box-shadow: 0 20px 60px rgba(0,0,0,0.3);\
     ';

     dialog.innerHTML = '\
       <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">\
         <h2 style="margin: 0; font-size: 20px; color: #333;">📥 Import Recipe</h2>\
         <button onclick="this.closest(\'.recipe-import-modal\').remove()" style="border: none; background: none; font-size: 24px; cursor: pointer; padding: 0;">×</button>\
       </div>\
       \
       <div style="margin-bottom: 16px;">\
         <label style="display: block; margin-bottom: 8px; color: #555; font-weight: 500;">Recipe Name</label>\
         <input type="text" id="recipe-import-name" placeholder="e.g., Pasta Carbonara" style="\
           width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;\
           box-sizing: border-box; font-size: 14px;" />\
       </div>\
       \
       <div style="margin-bottom: 16px;">\
         <label style="display: block; margin-bottom: 8px; color: #555; font-weight: 500;">Paste Recipe Text</label>\
         <p style="margin: 0 0 8px 0; color: #888; font-size: 12px;">Paste ingredients list or full recipe text. We\'ll automatically extract ingredients.</p>\
         <textarea id="recipe-import-text" placeholder="Paste recipe ingredients here... (comma-separated, newline-separated, or pasted directly from websites)" style="\
           width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px;\
           box-sizing: border-box; font-size: 13px; font-family: monospace;\
           min-height: 200px; resize: vertical;" />\
       </div>\
       \
       <div style="margin-bottom: 16px; padding: 12px; background: #f0f7ff; border-radius: 6px; border-left: 4px solid #0066cc;">\
         <p style="margin: 0; color: #0066cc; font-size: 13px;">\
           🔍 <strong>How it works:</strong> Paste any recipe text. Our system will automatically detect and extract ingredients from our library, then show you a preview to edit before saving.\
         </p>\
       </div>\
       \
       <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">\
         <button onclick="this.closest(\'.recipe-import-modal\').remove()" style="\
           padding: 10px 20px; border: 1px solid #ddd; background: #f5f5f5; border-radius: 6px;\
           cursor: pointer; color: #333; font-weight: 500;" >\
           Cancel\
         </button>\
         <button onclick="(window.RecipesShoppingUI || {}).processImportRecipe && window.RecipesShoppingUI.processImportRecipe()" style="\
           padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 6px;\
           cursor: pointer; font-weight: 500;" >\
           📥 Import & Preview\
         </button>\
       </div>\
     ';

     modal.appendChild(dialog);
     document.body.appendChild(modal);

     // Focus on name input
     setTimeout(function() {
       var input = document.getElementById('recipe-import-name');
       if (input) input.focus();
     }, 100);
   }

   /**
    * Process the imported recipe - parse and show preview
    */
   function processImportRecipe() {
     var nameInput = document.getElementById('recipe-import-name');
     var textInput = document.getElementById('recipe-import-text');

     if (!nameInput || !textInput) return;

     var name = nameInput.value.trim();
     var text = textInput.value.trim();

     if (!name) {
       alert('Please enter a recipe name');
       return;
     }

     if (!text) {
       alert('Please paste recipe text or ingredients');
       return;
     }

     // Parse the recipe text
     var parsedIngredients = sys.parseRecipeText(text);

     // Close import modal
     var modal = document.querySelector('.recipe-import-modal');
     if (modal) modal.remove();

     // Show preview dialog
     showRecipeImportPreview(name, text, parsedIngredients);
   }

   /**
    * Show preview of imported recipe with ability to edit
    */
   function showRecipeImportPreview(name, originalText, parsedIngredients) {
     var modal = document.createElement('div');
     modal.className = 'recipe-import-preview-modal';
     modal.style.cssText = '\
       position: fixed; top: 0; left: 0; right: 0; bottom: 0;\
       background: rgba(0,0,0,0.5); display: flex; align-items: center;\
       justify-content: center; z-index: 10001; overflow: auto;\
     ';

     var dialog = document.createElement('div');
     dialog.className = 'recipe-import-preview-dialog';
     dialog.style.cssText = '\
       background: white; border-radius: 12px; padding: 24px;\
       max-width: 700px; width: 90%; max-height: 85vh; overflow: auto;\
       box-shadow: 0 20px 60px rgba(0,0,0,0.3); margin: 20px auto;\
     ';

     var ingredientsList = parsedIngredients.map(function(ing, idx) {
       var isCustom = ing.source === 'imported-custom';
       return '\
         <div style="display: flex; gap: 12px; margin-bottom: 12px; padding: 12px; background: #f9f9f9; border-radius: 6px; border-left: 3px solid ' + (isCustom ? '#ff9800' : '#4CAF50') + ';">\
           <div style="flex: 1;">\
             <div style="font-weight: 500; color: #333;">' + escapeHtml(ing.name) + '</div>\
             <div style="font-size: 12px; color: #999;">' + escapeHtml(ing.category) + (isCustom ? ' (Custom)' : '') + '</div>\
           </div>\
           <button onclick="this.parentElement.remove()" title="Remove ingredient" style="\
             border: none; background: #ff4444; color: white; padding: 6px 10px;\
             border-radius: 4px; cursor: pointer; font-size: 12px;" >\
             Remove\
           </button>\
         </div>\
       ';
     }).join('');

     dialog.innerHTML = '\
       <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">\
         <h2 style="margin: 0; font-size: 20px; color: #333;">Recipe Preview: ' + escapeHtml(name) + '</h2>\
         <button onclick="this.closest(\'.recipe-import-preview-modal\').remove()" style="border: none; background: none; font-size: 24px; cursor: pointer; padding: 0;">×</button>\
       </div>\
       \
       <div style="margin-bottom: 20px; padding: 12px; background: #e8f5e9; border-radius: 6px; border-left: 4px solid #4CAF50;">\
         <p style="margin: 0; color: #2e7d32; font-size: 13px;">\
           ✓ Found ' + parsedIngredients.length + ' ingredient(s). You can remove items you don\'t want. Ingredients marked as (Custom) are not in our library.\
         </p>\
       </div>\
       \
       <div style="margin-bottom: 24px;">\
         <h3 style="margin: 0 0 12px 0; color: #555; font-size: 14px; text-transform: uppercase;">Ingredients</h3>\
         ' + ingredientsList + '\
       </div>\
       \
       <div style="margin-bottom: 20px;">\
         <label style="display: block; margin-bottom: 8px; color: #555; font-weight: 500;">Recipe Description (Optional)</label>\
         <textarea id="recipe-description-input" placeholder="Add notes about this recipe..." style="\
           width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;\
           box-sizing: border-box; font-size: 13px; min-height: 80px; resize: vertical;" />\
       </div>\
       \
       <div style="display: flex; gap: 12px; justify-content: flex-end;">\
         <button onclick="this.closest(\'.recipe-import-preview-modal\').remove()" style="\
           padding: 10px 20px; border: 1px solid #ddd; background: #f5f5f5; border-radius: 6px;\
           cursor: pointer; color: #333; font-weight: 500;" >\
           Cancel\
         </button>\
         <button onclick="(window.RecipesShoppingUI || {}).finalizeImportRecipe && window.RecipesShoppingUI.finalizeImportRecipe(\'' + escapeHtml(name) + '\', \'' + escapeHtml(originalText) + '\')" style="\
           padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 6px;\
           cursor: pointer; font-weight: 500;" >\
           💾 Save Recipe\
         </button>\
       </div>\
     ';

     modal.appendChild(dialog);
     document.body.appendChild(modal);
   }

   /**
    * Finalize and save the imported recipe
    */
   function finalizeImportRecipe(name, originalText) {
     // Get current ingredients from preview (those not removed)
     var ingredientElements = document.querySelectorAll('.recipe-import-preview-modal .recipe-import-preview-dialog > div');
     var description = document.getElementById('recipe-description-input');
     var descriptionText = description ? description.value.trim() : '';

     // Create recipe from import
     var recipeId = sys.createRecipeFromImport(name, originalText);

     // Get the recipe and add description
     var recipe = sys.getSavedRecipes()[recipeId];
     if (recipe) {
       recipe.description = descriptionText;
       sys.saveRecipe(recipeId, recipe);
     }

     // Close modal
     var modal = document.querySelector('.recipe-import-preview-modal');
     if (modal) modal.remove();

     alert('Recipe "' + name + '" has been imported and saved locally.\n\nNote: This recipe is not yet synced with your Excel backend. Synced recipes are marked with a ✓ badge.');
     renderMainView();
   }

   /**
    * Show edit form for imported recipe
    */
   function showEditImportedRecipeForm(recipeId) {
     var recipes = sys.getSavedRecipes();
     var recipe = recipes[recipeId];
     if (!recipe) return;

     var container = document.getElementById(ROOT_ID);
     if (!container) return;

     var modal = document.createElement('div');
     modal.className = 'recipe-edit-modal';
     modal.style.cssText = '\
       position: fixed; top: 0; left: 0; right: 0; bottom: 0;\
       background: rgba(0,0,0,0.5); display: flex; align-items: center;\
       justify-content: center; z-index: 10000; overflow: auto;\
     ';

     var dialog = document.createElement('div');
     dialog.className = 'recipe-edit-dialog';
     dialog.style.cssText = '\
       background: white; border-radius: 12px; padding: 24px;\
       max-width: 600px; width: 90%; max-height: 80vh; overflow: auto;\
       box-shadow: 0 20px 60px rgba(0,0,0,0.3); margin: 20px auto;\
     ';

     var ingredientsList = (recipe.ingredients || []).map(function(ing, idx) {
       return '\
         <div style="display: flex; gap: 12px; margin-bottom: 10px; padding: 10px; background: #f9f9f9; border-radius: 6px;">\
           <div style="flex: 1;">\
             <input type="text" value="' + escapeHtml(ing.name) + '" data-ingredient-idx="' + idx + '" class="ingredient-name-input" style="\
               width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;" />\
           </div>\
           <button onclick="this.parentElement.remove()" style="\
             border: none; background: #ff4444; color: white; padding: 6px 10px;\
             border-radius: 4px; cursor: pointer; font-size: 12px;" >\
             Remove\
           </button>\
         </div>\
       ';
     }).join('');

     dialog.innerHTML = '\
       <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">\
         <h2 style="margin: 0; font-size: 20px; color: #333;">✏️ Edit Recipe: ' + escapeHtml(recipe.name) + '</h2>\
         <button onclick="this.closest(\'.recipe-edit-modal\').remove()" style="border: none; background: none; font-size: 24px; cursor: pointer; padding: 0;">×</button>\
       </div>\
       \
       <div style="margin-bottom: 16px;">\
         <label style="display: block; margin-bottom: 8px; color: #555; font-weight: 500;">Recipe Name</label>\
         <input type="text" id="recipe-edit-name" value="' + escapeHtml(recipe.name) + '" style="\
           width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;\
           box-sizing: border-box; font-size: 14px;" />\
       </div>\
       \
       <div style="margin-bottom: 16px;">\
         <label style="display: block; margin-bottom: 8px; color: #555; font-weight: 500;">Description</label>\
         <textarea id="recipe-edit-description" style="\
           width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;\
           box-sizing: border-box; font-size: 13px; min-height: 60px; resize: vertical;" >' + escapeHtml(recipe.description || '') + '</textarea>\
       </div>\
       \
       <div style="margin-bottom: 16px;">\
         <label style="display: block; margin-bottom: 8px; color: #555; font-weight: 500;">Ingredients</label>\
         <div id="recipe-edit-ingredients">' + ingredientsList + '</div>\
       </div>\
       \
       <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">\
         <button onclick="this.closest(\'.recipe-edit-modal\').remove()" style="\
           padding: 10px 20px; border: 1px solid #ddd; background: #f5f5f5; border-radius: 6px;\
           cursor: pointer; color: #333; font-weight: 500;" >\
           Cancel\
         </button>\
         <button onclick="(window.RecipesShoppingUI || {}).saveEditedRecipe && window.RecipesShoppingUI.saveEditedRecipe(\'' + escapeHtml(recipeId) + '\')" style="\
           padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 6px;\
           cursor: pointer; font-weight: 500;" >\
           💾 Save Changes\
         </button>\
       </div>\
     ';

     modal.appendChild(dialog);
     document.body.appendChild(modal);
   }

   /**
    * Save edited recipe
    */
   function saveEditedRecipe(recipeId) {
     var recipes = sys.getSavedRecipes();
     var recipe = recipes[recipeId];
     if (!recipe) return;

     var nameInput = document.getElementById('recipe-edit-name');
     var descriptionInput = document.getElementById('recipe-edit-description');
     var ingredientsDiv = document.getElementById('recipe-edit-ingredients');

     if (!nameInput || !descriptionInput || !ingredientsDiv) return;

     // Update recipe data
     recipe.name = nameInput.value.trim();
     recipe.description = descriptionInput.value.trim();

     // Get ingredients from updated list
     var ingredientInputs = ingredientsDiv.querySelectorAll('.ingredient-name-input');
     var updatedIngredients = [];
     ingredientInputs.forEach(function(input) {
       var name = input.value.trim();
       if (name) {
         updatedIngredients.push({
           name: name,
           category: 'other',
           quantity: 1
         });
       }
     });

     recipe.ingredients = updatedIngredients;

     // Save updated recipe
     sys.saveRecipe(recipeId, recipe);

     // Close modal
     var modal = document.querySelector('.recipe-edit-modal');
     if (modal) modal.remove();

     alert('Recipe updated!');
     renderMainView();
   }

   /**
    * Delete recipe
    */
   function deleteRecipe(recipeId) {
     var recipes = sys.getSavedRecipes();
     delete recipes[recipeId];
     if (window.localStorage) {
       window.localStorage.setItem('kap_saved_recipes_v1', JSON.stringify(recipes));
     }
     // Also clean up sync status
     var statuses = sys.getRecipeSyncStatuses();
     delete statuses[recipeId];
     if (window.localStorage) {
       window.localStorage.setItem('kap_recipe_sync_status_v1', JSON.stringify(statuses));
     }
     renderMainView();
   }

  /**
   * Delete shopping list
   */
  function deleteShoppingList(listId) {
    var lists = sys.getShoppingLists();
    delete lists[listId];
    if (window.localStorage) {
      window.localStorage.setItem('kap_shopping_lists_v1', JSON.stringify(lists));
    }
    switchTab('shopping-lists');
  }

  /**
   * View shopping list details
   */
  function viewShoppingList(listId) {
    alert('Viewing shopping list: ' + listId);
    // Implementation for viewing detailed shopping list
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ========================================================
  // PUBLIC API
  // ========================================================

   var api = {
     init: function() {
       renderMainView();
     },
     render: renderMainView,
     renderMainView: renderMainView,
     switchTab: switchTab,
     setPantryFilter: setPantryFilter,
     createShoppingListFromRecipe: createShoppingListFromRecipe,
     createMultiRecipeShoppingList: createMultiRecipeShoppingList,
     usePantryItem: usePantryItem,
     showAddPantryItemForm: showAddPantryItemForm,
     showRecipeForm: showRecipeForm,
     showImportRecipeForm: showImportRecipeForm,
     processImportRecipe: processImportRecipe,
     showRecipeImportPreview: showRecipeImportPreview,
     finalizeImportRecipe: finalizeImportRecipe,
     showEditImportedRecipeForm: showEditImportedRecipeForm,
     saveEditedRecipe: saveEditedRecipe,
     deleteRecipe: deleteRecipe,
     deleteShoppingList: deleteShoppingList,
     viewShoppingList: viewShoppingList
   };

  // Expose globally
  global.RecipesShoppingUI = api;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

})(typeof window !== 'undefined' ? window : global);

