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

  function closeModalByClass(className) {
    var modal = document.querySelector('.' + className);
    if (modal) modal.remove();
  }

  function getModalPrimaryButtonStyle() {
    return 'background:linear-gradient(135deg,#8b5cf6 0%,#7c3aed 100%);border:1px solid #7c3aed;color:#fff;font-weight:700;opacity:1;box-shadow:0 2px 8px rgba(139,92,246,.35);';
  }

  function buildPrimaryModalButton(action, label) {
    return '<button type="button" class="pill-button recipes-primary-modal-cta" data-modal-action="' + escapeHtml(action) + '" style="' + getModalPrimaryButtonStyle() + '">' + escapeHtml(label) + '</button>';
  }

  function showModalDialog(options) {
    options = options || {};
    var modal = document.createElement('div');
    modal.className = options.modalClass || 'recipes-shopping-modal';
    modal.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 10020; padding: 20px;';

    var dialog = document.createElement('div');
    dialog.className = options.dialogClass || 'recipes-shopping-dialog';
    dialog.style.cssText = 'background: #fff; border-radius: 12px; padding: 20px; width: min(680px, 96vw); max-height: 85vh; overflow: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);';

    var title = options.title ? '<h2 style="margin:0;font-size:20px;color:#111827;">' + escapeHtml(options.title) + '</h2>' : '';
    dialog.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px;">'
      + title
      + '<button type="button" data-modal-action="close" style="border:0;background:transparent;font-size:22px;cursor:pointer;line-height:1;">×</button>'
      + '</div>'
      + '<div class="recipes-shopping-modal-body">' + (options.bodyHtml || '') + '</div>'
      + '<div style="display:flex;justify-content:flex-end;gap:10px;margin-top:16px;">'
      + (options.footerHtml || '<button type="button" class="pill-button" data-modal-action="close">Close</button>')
      + '</div>';

    modal.appendChild(dialog);
    document.body.appendChild(modal);

    modal.addEventListener('click', function (event) {
      var target = event.target && event.target.nodeType === Node.ELEMENT_NODE ? event.target : null;
      if (!target) return;
      if (target === modal || target.getAttribute('data-modal-action') === 'close') {
        modal.remove();
      }
    });

    return modal;
  }

  function showNoticeModal(title, message) {
    showModalDialog({
      modalClass: 'recipes-shopping-notice-modal',
      title: title,
      bodyHtml: '<p style="margin:0;color:#334155;line-height:1.5;">' + escapeHtml(message) + '</p>'
    });
  }

  function confirmModal(title, message) {
    return new Promise(function (resolve) {
      var modal = showModalDialog({
        modalClass: 'recipes-shopping-confirm-modal',
        title: title,
        bodyHtml: '<p style="margin:0;color:#334155;line-height:1.5;">' + escapeHtml(message) + '</p>',
        footerHtml: '<button type="button" class="pill-button" data-confirm-action="cancel">Cancel</button>'
          + '<button type="button" class="pill-button pill-button--danger" data-confirm-action="confirm">Delete</button>'
      });
      modal.addEventListener('click', function (event) {
        var target = event.target && event.target.nodeType === Node.ELEMENT_NODE ? event.target : null;
        if (!target) return;
        var action = target.getAttribute('data-confirm-action');
        if (action === 'confirm') {
          modal.remove();
          resolve(true);
        }
        if (action === 'cancel') {
          modal.remove();
          resolve(false);
        }
      });
    });
  }

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
               <button class="recipe-action-btn recipe-action-delete" title="Delete recipe" onclick="(window.RecipesShoppingUI || {}).deleteRecipe && window.RecipesShoppingUI.deleteRecipe(\'' + escapeHtml(id) + '\')">🗑️ Delete</button>\
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
          <button class="sync-warning-btn" onclick="(window.RecipesShoppingUI || {}).showSyncHelpModal && window.RecipesShoppingUI.showSyncHelpModal()">ℹ️ Learn More</button>\
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
              <button class="pill-button pill-button--danger" onclick="(window.RecipesShoppingUI || {}).deleteShoppingList && window.RecipesShoppingUI.deleteShoppingList(\'' + escapeHtml(id) + '\')">🗑️ Delete</button>\
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
    showNoticeModal('Shopping list created', 'Your shopping list was created from this recipe.');
    switchTab('shopping-lists');
  }

  /**
   * Create shopping list from multiple recipes
   */
  function createMultiRecipeShoppingList() {
    var recipes = sys.getSavedRecipes();
    if (Object.keys(recipes).length === 0) {
      showNoticeModal('No recipes yet', 'Create or import recipes first, then build a shopping list.');
      return;
    }

    var bodyHtml = '<div style="display:grid;gap:8px;">'
      + Object.keys(recipes).map(function (id) {
        var recipe = recipes[id] || {};
        return '<label style="display:flex;gap:8px;align-items:center;border:1px solid #e5e7eb;border-radius:8px;padding:8px;">'
          + '<input type="checkbox" data-list-recipe-id="' + escapeHtml(id) + '">'
          + '<span>' + escapeHtml(recipe.name || recipe.title || 'Untitled recipe') + '</span>'
          + '</label>';
      }).join('')
      + '</div>';

    var modal = showModalDialog({
      modalClass: 'recipes-shopping-multi-list-modal',
      title: 'Create shopping list',
      bodyHtml: bodyHtml,
      footerHtml: '<button type="button" class="pill-button" data-modal-action="close">Cancel</button>'
        + buildPrimaryModalButton('create-list', 'Create')
    });

    modal.addEventListener('click', function (event) {
      var target = event.target && event.target.nodeType === Node.ELEMENT_NODE ? event.target : null;
      if (!target || target.getAttribute('data-modal-action') !== 'create-list') return;
      var selected = Array.from(modal.querySelectorAll('[data-list-recipe-id]:checked')).map(function (node) {
        return String(node.getAttribute('data-list-recipe-id') || '').trim();
      }).filter(Boolean);
      if (!selected.length) {
        showNoticeModal('Choose recipes', 'Select at least one recipe for this shopping list.');
        return;
      }
      var shoppingList = sys.generateShoppingListFromRecipes(selected);
      sys.saveShoppingList(shoppingList.id, shoppingList);
      modal.remove();
      showNoticeModal('Shopping list created', 'Your shopping list has been created.');
      switchTab('shopping-lists');
    });
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
    var modal = showModalDialog({
      modalClass: 'recipes-shopping-pantry-modal',
      title: 'Add pantry item',
      bodyHtml: '<label style="display:block;margin-bottom:8px;">Item name<input id="pantry-item-name" type="text" style="width:100%;margin-top:4px;"></label>'
        + '<label style="display:block;margin-bottom:8px;">Category<input id="pantry-item-category" type="text" value="other" style="width:100%;margin-top:4px;"></label>'
        + '<label style="display:block;margin-bottom:8px;">Quantity<input id="pantry-item-qty" type="number" min="1" value="1" style="width:100%;margin-top:4px;"></label>'
        + '<label style="display:block;">Unit<input id="pantry-item-unit" type="text" placeholder="cup, tsp, lb" style="width:100%;margin-top:4px;"></label>',
      footerHtml: '<button type="button" class="pill-button" data-modal-action="close">Cancel</button>'
        + buildPrimaryModalButton('save-pantry', 'Save item')
    });

    modal.addEventListener('click', function (event) {
      var target = event.target && event.target.nodeType === Node.ELEMENT_NODE ? event.target : null;
      if (!target || target.getAttribute('data-modal-action') !== 'save-pantry') return;
      var nameInput = modal.querySelector('#pantry-item-name');
      var categoryInput = modal.querySelector('#pantry-item-category');
      var qtyInput = modal.querySelector('#pantry-item-qty');
      var unitInput = modal.querySelector('#pantry-item-unit');
      var name = String(nameInput ? nameInput.value : '').trim();
      if (!name) {
        showNoticeModal('Missing item name', 'Please enter a pantry item name.');
        return;
      }
      sys.addPantryItem(name, String(categoryInput ? categoryInput.value : 'other').trim() || 'other', parseInt(String(qtyInput ? qtyInput.value : '1'), 10) || 1, String(unitInput ? unitInput.value : '').trim());
      modal.remove();
      switchTab('pantry');
    });
  }

   /**
    * Show recipe form
    */
     function getRecipeIngredientPresetGroups() {
       var library = null;
       if (sys && typeof sys.getIngredientsLibrary === 'function') {
         library = sys.getIngredientsLibrary();
       }
       if (!library || typeof library !== 'object') {
         library = (sys && sys.DEFAULT_INGREDIENTS_LIBRARY) || {};
       }
       var categoryOrder = [
         { key: 'proteins', label: 'Proteins' },
         { key: 'produce', label: 'Produce' },
         { key: 'grains', label: 'Grains' },
         { key: 'dairy', label: 'Dairy' },
         { key: 'sauces', label: 'Sauces' },
         { key: 'spices', label: 'Spices' },
         { key: 'frozen', label: 'Frozen' },
         { key: 'canned-goods', label: 'Canned Goods' },
         { key: 'other', label: 'Other' }
       ];
       return categoryOrder.map(function (entry) {
         var items = Array.isArray(library[entry.key]) ? library[entry.key] : [];
         var deduped = Array.from(new Set(items.map(function (item) { return String(item || '').trim(); }).filter(Boolean)));
         return { key: entry.key, label: entry.label, items: deduped.slice(0, 30) };
       }).filter(function (entry) {
         return entry.items.length > 0;
       });
     }

     function renderRecipeIngredientPresetPickerHtml() {
       var groups = getRecipeIngredientPresetGroups();
       if (!groups.length) return '';
       return '<div style="margin-bottom:10px;">'
         + '<div style="font-size:12px;font-weight:700;color:#334155;margin-bottom:6px;">Quick select common ingredients & spices</div>'
         + '<div style="max-height:220px;overflow:auto;border:1px solid #e2e8f0;border-radius:10px;padding:8px;background:#f8fafc;">'
         + groups.map(function (group) {
           return '<div style="margin-bottom:8px;">'
             + '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#64748b;margin:0 0 4px;">' + escapeHtml(group.label) + '</div>'
             + '<div style="display:flex;flex-wrap:wrap;gap:6px;">'
             + group.items.map(function (item) {
               return '<label style="display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border:1px solid #cbd5e1;border-radius:999px;background:#fff;font-size:12px;color:#1f2937;">'
                 + '<input type="checkbox" data-preset-ingredient="1" value="' + escapeHtml(item) + '">'
                 + '<span>' + escapeHtml(item) + '</span>'
                 + '</label>';
             }).join('')
             + '</div>'
             + '</div>';
         }).join('')
         + '</div>'
         + '<div style="margin-top:6px;display:flex;justify-content:flex-end;">'
         + '<button type="button" class="pill-button" data-modal-action="copy-selected-ingredients">Add selected to ingredients box</button>'
         + '</div>'
         + '</div>';
     }

     function parseRecipeIngredientNames(rawText) {
       return String(rawText || '')
         .split(/\r?\n|,|;/)
         .map(function (item) { return String(item || '').trim(); })
         .filter(Boolean);
     }

     function getSelectedPresetIngredients(modal) {
       if (!modal || typeof modal.querySelectorAll !== 'function') return [];
       return Array.from(modal.querySelectorAll('input[data-preset-ingredient="1"]:checked')).map(function (input) {
         return String(input.value || '').trim();
       }).filter(Boolean);
     }

     function mergeUniqueIngredients(primaryList, secondaryList) {
       var seen = Object.create(null);
       return primaryList.concat(secondaryList).map(function (name) {
         return String(name || '').trim();
       }).filter(function (name) {
         if (!name) return false;
         var key = name.toLowerCase();
         if (seen[key]) return false;
         seen[key] = true;
         return true;
       });
     }

    function getPdfRecipeParser() {
      return window.RecipesTabSystem && typeof window.RecipesTabSystem.parseRecipeFromPdfFile === 'function'
        ? window.RecipesTabSystem.parseRecipeFromPdfFile
        : null;
    }

    function saveParsedPdfRecipe(recipeName, parsedResult, descriptionText) {
      var model = parsedResult && parsedResult.model ? parsedResult.model : null;
      if (!model) {
        showNoticeModal('PDF parse failed', 'No recipe data could be extracted from that PDF.');
        return;
      }

      var recipeId = 'recipe-' + Date.now();
      var normalizedName = String(recipeName || model.title || 'Imported recipe').trim();
      sys.saveRecipe(recipeId, Object.assign({}, model, {
        name: normalizedName,
        title: normalizedName,
        description: String(descriptionText || model.description || 'Imported from PDF.').trim() || 'Imported from PDF.',
        source: 'imported-pdf',
        originalText: String(parsedResult.previewText || '').trim(),
        syncStatus: 'local-only'
      }));
      sys.updateRecipeSyncStatus(recipeId, 'local-only');
      renderMainView();
      showNoticeModal('Recipe imported from PDF', 'Your recipe was created from the PDF and saved locally. Open the Recipes tab to sync with Excel if needed.');
    }

    function getPreviewPdfRecipeName(fallbackName, parsedResult) {
      var previewNameInput = document.getElementById('recipe-pdf-preview-name');
      var typedName = String(previewNameInput && previewNameInput.value || '').trim();
      var modelTitle = String(parsedResult && parsedResult.model && parsedResult.model.title || '').trim();
      return typedName || String(fallbackName || modelTitle || 'Imported recipe').trim();
    }

    function showPdfImportRecipeForm() {
      var container = document.getElementById(ROOT_ID);
      if (!container) return;

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
        max-width: 640px; width: 92%; max-height: 85vh; overflow: auto;\
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);\
      ';

      dialog.innerHTML = '\
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">\
          <h2 style="margin:0;font-size:20px;color:#333;">📄 Import Recipe from PDF</h2>\
          <button onclick="this.closest(\'.recipe-import-modal\').remove()" style="border:none;background:none;font-size:24px;cursor:pointer;padding:0;">×</button>\
        </div>\
        <div style="margin-bottom:16px;">\
          <label style="display:block;margin-bottom:8px;color:#555;font-weight:500;">Recipe Name</label>\
          <input type="text" id="recipe-pdf-name" placeholder="e.g., Grandma\'s Chili" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box;font-size:14px;" />\
        </div>\
        <div style="margin-bottom:16px;">\
          <label style="display:block;margin-bottom:8px;color:#555;font-weight:500;">Recipe PDF file</label>\
          <input type="file" id="recipe-pdf-file" accept="application/pdf" style="width:100%;" />\
        </div>\
        <div style="margin-bottom:16px;padding:12px;background:#f0f7ff;border-radius:6px;border-left:4px solid #0066cc;">\
          <p style="margin:0;color:#0066cc;font-size:13px;">\
            Upload a recipe PDF, parse it, review the extracted ingredients/steps, and then save it as a new recipe.\
          </p>\
        </div>\
        <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:24px;">\
          <button onclick="this.closest(\'.recipe-import-modal\').remove()" style="padding:10px 20px;border:1px solid #ddd;background:#f5f5f5;border-radius:6px;cursor:pointer;color:#333;font-weight:500;">Cancel</button>\
          <button data-modal-action="parse-pdf-recipe" style="padding:10px 20px;background:#4CAF50;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:500;">📄 Parse PDF & Preview</button>\
        </div>\
      ';

      modal.appendChild(dialog);
      document.body.appendChild(modal);

      setTimeout(function () {
        var input = document.getElementById('recipe-pdf-name');
        if (input) input.focus();
      }, 100);

      modal.addEventListener('click', function (event) {
        var target = event.target && event.target.nodeType === Node.ELEMENT_NODE ? event.target : null;
        if (!target) return;
        if (String(target.getAttribute('data-modal-action') || '').trim() !== 'parse-pdf-recipe') return;
        var nameInput = modal.querySelector('#recipe-pdf-name');
        var fileInput = modal.querySelector('#recipe-pdf-file');
        var recipeName = String((nameInput && nameInput.value) || '').trim();
        var file = fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
        if (!file) {
          showNoticeModal('PDF required', 'Please choose a recipe PDF before continuing.');
          return;
        }

        var parser = getPdfRecipeParser();
        if (!parser) {
          showNoticeModal('PDF parser unavailable', 'The shared PDF parser is not ready yet. Open the Recipes tab once, then try again.');
          return;
        }

        target.disabled = true;
        target.textContent = 'Parsing…';
        parser(file).then(function (parsedResult) {
          modal.remove();
          showPdfRecipePreview(recipeName, parsedResult);
        }).catch(function (error) {
          target.disabled = false;
          target.textContent = '📄 Parse PDF & Preview';
          showNoticeModal('PDF import failed', error && error.message ? error.message : 'Unable to parse that PDF recipe.');
        });
      });
    }

    function showPdfRecipePreview(recipeName, parsedResult) {
      var model = parsedResult && parsedResult.model ? parsedResult.model : null;
      if (!model) {
        showNoticeModal('PDF parse failed', 'No recipe data could be extracted from that PDF.');
        return;
      }

      var ingredientsHtml = (model.ingredients || []).map(function (ing) {
        return '\
          <li style="margin-bottom:6px;">\
            ' + escapeHtml([ing.quantity, ing.item].filter(Boolean).join(' ').trim() || ing.item || 'Ingredient') + '\
          </li>\
        ';
      }).join('');

      var stepsHtml = (model.steps || []).map(function (step) {
        return '<li style="margin-bottom:6px;">' + escapeHtml(step) + '</li>';
      }).join('');

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
        max-width: 760px; width: 92%; max-height: 88vh; overflow: auto;\
        box-shadow: 0 20px 60px rgba(0,0,0,0.3); margin: 20px auto;\
      ';

      var resolvedRecipeName = String(recipeName || model.title || 'Imported recipe').trim();

      dialog.innerHTML = '\
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">\
          <h2 style="margin:0;font-size:20px;color:#333;">Recipe Preview: ' + escapeHtml(resolvedRecipeName) + '</h2>\
          <button onclick="this.closest(\'.recipe-import-preview-modal\').remove()" style="border:none;background:none;font-size:24px;cursor:pointer;padding:0;">×</button>\
        </div>\
        <div style="margin-bottom:16px;padding:12px;background:#e8f5e9;border-radius:6px;border-left:4px solid #4CAF50;">\
          <p style="margin:0;color:#2e7d32;font-size:13px;">✓ Parsed PDF recipe. Review the ingredients and steps, then save it as a new recipe.</p>\
        </div>\
        <div style="margin-bottom:16px;">\
          <label style="display:block;margin-bottom:8px;color:#555;font-weight:500;">Recipe Name</label>\
          <input type="text" id="recipe-pdf-preview-name" value="' + escapeHtml(resolvedRecipeName) + '" placeholder="e.g., Grandma\'s Chili" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box;font-size:14px;" />\
        </div>\
        <div style="display:grid;gap:18px;margin-bottom:20px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));">\
          <div>\
            <h3 style="margin:0 0 10px 0;color:#555;font-size:14px;text-transform:uppercase;">Ingredients</h3>\
            <ul style="margin:0;padding-left:20px;max-height:220px;overflow:auto;">' + (ingredientsHtml || '<li>No ingredients detected.</li>') + '</ul>\
          </div>\
          <div>\
            <h3 style="margin:0 0 10px 0;color:#555;font-size:14px;text-transform:uppercase;">Steps</h3>\
            <ol style="margin:0;padding-left:20px;max-height:220px;overflow:auto;">' + (stepsHtml || '<li>No steps detected.</li>') + '</ol>\
          </div>\
        </div>\
        <div style="margin-bottom:20px;">\
          <label style="display:block;margin-bottom:8px;color:#555;font-weight:500;">Recipe Description (Optional)</label>\
          <textarea id="recipe-pdf-description-input" placeholder="Add notes about this recipe..." style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box;font-size:13px;min-height:80px;resize:vertical;"></textarea>\
        </div>\
        <div style="display:flex;gap:12px;justify-content:flex-end;">\
          <button onclick="this.closest(\'.recipe-import-preview-modal\').remove()" style="padding:10px 20px;border:1px solid #ddd;background:#f5f5f5;border-radius:6px;cursor:pointer;color:#333;font-weight:500;">Cancel</button>\
          <button data-modal-action="save-pdf-recipe" style="padding:10px 20px;background:#4CAF50;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:500;">💾 Save Recipe</button>\
        </div>\
      ';

      modal.appendChild(dialog);
      document.body.appendChild(modal);

      setTimeout(function () {
        var previewNameInput = document.getElementById('recipe-pdf-preview-name');
        if (previewNameInput) {
          previewNameInput.focus();
          previewNameInput.select();
        }
      }, 100);

      modal.addEventListener('keydown', function (event) {
        var target = event.target && event.target.nodeType === Node.ELEMENT_NODE ? event.target : null;
        if (target && target.id === 'recipe-pdf-preview-name' && event.key === 'Enter') {
          event.preventDefault();
          var saveBtn = modal.querySelector('[data-modal-action="save-pdf-recipe"]');
          if (saveBtn) saveBtn.click();
        }
      });

      modal.addEventListener('click', function (event) {
        var target = event.target && event.target.nodeType === Node.ELEMENT_NODE ? event.target : null;
        if (!target) return;
        if (String(target.getAttribute('data-modal-action') || '').trim() !== 'save-pdf-recipe') return;
      var descriptionInput = modal.querySelector('#recipe-pdf-description-input');
      var effectiveName = getPreviewPdfRecipeName(recipeName, parsedResult);
      saveParsedPdfRecipe(effectiveName, parsedResult, descriptionInput ? descriptionInput.value : '');
        modal.remove();
      });
    }

   function showRecipeForm() {
     var modal = showModalDialog({
       modalClass: 'recipes-shopping-create-recipe-modal',
       title: 'Create new recipe',
       bodyHtml: '<label style="display:block;margin-bottom:8px;">Recipe name<input id="quick-recipe-name" type="text" style="width:100%;margin-top:4px;"></label>'
           + renderRecipeIngredientPresetPickerHtml()
         + '<label style="display:block;margin-bottom:8px;">Ingredients (required)<textarea id="quick-recipe-ingredients" rows="5" placeholder="One ingredient per line" style="width:100%;margin-top:4px;"></textarea></label>'
         + '<label style="display:block;margin-bottom:8px;">Cook instructions (required)<textarea id="quick-recipe-instructions" rows="5" placeholder="Step-by-step instructions" style="width:100%;margin-top:4px;"></textarea></label>'
         + '<label style="display:block;">Description<textarea id="quick-recipe-description" rows="3" placeholder="Optional notes" style="width:100%;margin-top:4px;"></textarea></label>',
        footerHtml: '<button type="button" class="pill-button" data-modal-action="close">Cancel</button>'
          + '<button type="button" class="pill-button" data-modal-action="import-pdf">📄 Import PDF</button>'
          + buildPrimaryModalButton('save-recipe', 'Save recipe')
     });

     modal.addEventListener('click', function (event) {
       var target = event.target && event.target.nodeType === Node.ELEMENT_NODE ? event.target : null;
         if (!target) return;
         var modalAction = String(target.getAttribute('data-modal-action') || '').trim();
         if (modalAction === 'copy-selected-ingredients') {
           var ingredientsField = modal.querySelector('#quick-recipe-ingredients');
           if (!ingredientsField) return;
            ingredientsField.value = mergeUniqueIngredients(getSelectedPresetIngredients(modal), parseRecipeIngredientNames(ingredientsField.value)).join('\n');
           return;
         }
          if (modalAction === 'import-pdf') {
            modal.remove();
            showPdfImportRecipeForm();
            return;
          }
         if (modalAction !== 'save-recipe') return;
       var name = String((modal.querySelector('#quick-recipe-name') || {}).value || '').trim();
         var ingredientsRaw = String((modal.querySelector('#quick-recipe-ingredients') || {}).value || '').trim();
       var instructionsRaw = String((modal.querySelector('#quick-recipe-instructions') || {}).value || '').trim();
       var description = String((modal.querySelector('#quick-recipe-description') || {}).value || '').trim();
         var selectedIngredients = getSelectedPresetIngredients(modal);
         var mergedIngredients = mergeUniqueIngredients(selectedIngredients, parseRecipeIngredientNames(ingredientsRaw));

         if (!name || !mergedIngredients.length || !instructionsRaw) {
         showNoticeModal('Missing required fields', 'Recipe name, ingredients, and cook instructions are required.');
         return;
       }

         var ingredientList = mergedIngredients.map(function (nameValue) {
         return { name: nameValue, category: 'other', quantity: 1 };
       });

       var recipeId = 'recipe-' + Date.now();
       sys.saveRecipe(recipeId, {
         name: name,
         description: description,
         ingredients: ingredientList,
         instructions: instructionsRaw,
         syncStatus: 'local-only',
         source: 'manual'
       });
       sys.updateRecipeSyncStatus(recipeId, 'local-only');

       modal.remove();
       showNoticeModal('Recipe saved', 'Recipe saved locally. Open the Recipes tab to sync with Excel if needed.');
       renderMainView();
     });
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
       showNoticeModal('Recipe name required', 'Please enter a recipe name before importing.');
       return;
     }

     if (!text) {
       showNoticeModal('Recipe text required', 'Please paste recipe text or ingredients to import.');
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

      var ingredientsList = parsedIngredients.map(function(ing) {
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

     showNoticeModal('Recipe imported', 'Recipe "' + name + '" is saved locally. Open the Recipes tab to auto-sync with Excel.');
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

     showNoticeModal('Recipe updated', 'Your recipe changes were saved.');
     renderMainView();
   }

   /**
    * Delete recipe
    */
   async function deleteRecipe(recipeId) {
     var confirmed = await confirmModal('Delete recipe?', 'This recipe will be removed from local storage.');
     if (!confirmed) return;
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
  async function deleteShoppingList(listId) {
    var confirmed = await confirmModal('Delete shopping list?', 'This shopping list will be permanently removed.');
    if (!confirmed) return;
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
    var lists = sys.getShoppingLists();
    var list = lists[listId];
    if (!list) {
      showNoticeModal('List not found', 'Unable to locate this shopping list.');
      return;
    }
    var items = Object.keys(list.items || {}).map(function (key) {
      var entry = list.items[key] || {};
      return '<li>' + escapeHtml(entry.name || key) + '</li>';
    }).join('');
    showModalDialog({
      modalClass: 'recipes-shopping-list-view-modal',
      title: list.name || 'Shopping list details',
      bodyHtml: '<p style="margin-top:0;color:#475569;">' + escapeHtml(String(Object.keys(list.items || {}).length)) + ' total item(s)</p>'
        + '<ul style="margin:0;padding-left:20px;">' + (items || '<li>No items</li>') + '</ul>'
    });
  }

  function showSyncHelpModal() {
    showModalDialog({
      modalClass: 'recipes-shopping-sync-help-modal',
      title: 'How recipe sync works',
      bodyHtml: '<p style="margin:0 0 10px;color:#334155;line-height:1.5;">Recipes in this manager save locally first.</p>'
        + '<p style="margin:0;color:#334155;line-height:1.5;">To sync with Excel, open the main <strong>Recipes</strong> tab. It now auto-syncs on tab open (and can still be refreshed from that tab if needed).</p>'
    });
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
     showSyncHelpModal: showSyncHelpModal,
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

