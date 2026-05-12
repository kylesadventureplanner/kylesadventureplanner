/**
 * Recipes & Shopping List Management System
 * Handles saved ingredients library, recipe creation, grocery shopping list generation,
 * and pantry filtering with missing recommended items view
 */

(function initRecipesShoppingSystem(global) {
  'use strict';

  // ========================================================
  // CONSTANTS & STORAGE KEYS
  // ========================================================
   var SAVED_INGREDIENTS_STORAGE_KEY = 'kap_saved_ingredients_v1';
   var SAVED_RECIPES_STORAGE_KEY = 'kap_saved_recipes_v1';
   var SHOPPING_LISTS_STORAGE_KEY = 'kap_shopping_lists_v1';
   var PANTRY_ITEMS_STORAGE_KEY = 'kap_pantry_items_v1';
   var PANTRY_FILTER_MODE_STORAGE_KEY = 'kap_pantry_filter_mode_v1';
   var RECIPE_SYNC_STATUS_STORAGE_KEY = 'kap_recipe_sync_status_v1';

  // Default saved ingredients library organized by category
  var DEFAULT_INGREDIENTS_LIBRARY = {
    'spices': [
      'italian seasoning',
      'onion powder',
      'minced onion',
      'garlic powder',
      'minced garlic',
      'parsley',
      'oregano',
      'rosemary',
      'chives',
      'cilantro',
      'bay leaves',
      'crushed red pepper',
      'cayenne pepper',
      'paprika',
      'pepper',
      'salt',
      'seasoned salt',
      'himalayan sea salt',
      'tumeric',
      'nutmeg',
      'coriander',
      'thyme',
      'cloves',
      'curry powder',
      'chili powder',
      'lemon pepper',
      'burger seasoning',
      'taco seasoning',
      'fajita seasoning',
      'ground cinnamon',
      'cinnamon sticks',
      'cinnamon sugar',
      'cajun seasoning',
      'creole seasoning',
      'seafood boil seasoning packet',
      'seafood boil seasoning liquid'
    ],
    'proteins': [
      'chicken breast',
      'skirt steak',
      'sirloin steak',
      'ribeye steak',
      'stew meat',
      'ground beef',
      'beef roast',
      'burger patties',
      'ground turkey',
      'bacon',
      'turkey bacon',
      'white meat chicken (canned)',
      'dark meat chicken (canned)',
      'chili (canned)',
      'chili with beans (canned)'
    ],
    'sauces': [
      'soy sauce',
      'teriyaki sauce',
      'general tso sauce',
      'worcestershire sauce',
      'taco sauce',
      'hot sauce',
      'lemon juice',
      'lime juice',
      'balsamic vinegar',
      'rice vinegar',
      'olive oil',
      'canola oil'
    ],
    'canned-goods': [
      'diced tomatoes (canned)',
      'petite diced tomatoes (canned)',
      'stewed tomatoes (canned)',
      'crushed tomatoes (canned)',
      'tomato paste (canned)',
      'cut green beans (canned)',
      'french green beans (canned)',
      'sweet corn (canned)',
      'black eyed peas (canned)',
      'pinto beans (canned)',
      'red beans (canned)',
      'chili beans (canned)',
      'black beans (canned)',
      'white northern beans (canned)',
      'kidney beans (canned)',
      'dark kidney beans (canned)',
      'diced potatoes (canned)',
      'whole potatoes (canned)',
      'sliced potatoes (canned)',
      'mixed vegetables (canned)',
      'bamboo shoots (canned)',
      'baby corn (canned)',
      'rotel (canned)',
      'sliced carrots (canned)',
      'mushrooms (canned)',
      'spinach (canned)',
      'turnip greens (canned)',
      'collard greens (canned)',
      'red enchiladas sauce (canned)',
      'green enchiladas sauce (canned)',
      'salsa mild (canned)',
      'cheese sauce (canned)',
      'parmesan cheese (bottle)',
      'velveeta cheese'
    ],
    'dry-goods': [
      'red lentils',
      'green lentils',
      'yellow lentils',
      'split peas'
    ],
    'produce': [
      'baby carrots',
      'whole carrots',
      'celery',
      'broccoli',
      'baby red potatoes',
      'baby white potatoes',
      'mini multi-colored potatoes',
      'russet potatoes',
      'baking potatoes',
      'yellow onions',
      'red onions',
      'white onions',
      'red bell peppers',
      'yellow bell peppers',
      'orange bell peppers',
      'green bell peppers',
      'mushroom slices',
      'mushroom whole',
      'asparagus',
      'green beans',
      'cherry tomatoes',
      'grape tomatoes',
      'roma tomatoes',
      'regular tomatoes',
      'squash',
      'zucchini',
      'cabbage',
      'iceberg lettuce',
      'cauliflower',
      'bean sprouts',
      'bok choy'
    ],
    'dairy': [
      'milk',
      'heavy cream',
      'sour cream',
      'butter',
      'cream cheese',
      'mexican blend cheese',
      'colby jack cheese',
      'parmesan cheese',
      'mozzarella cheese',
      'eggs'
    ],
    'frozen': [
      'corn (frozen)',
      'green beans (frozen)',
      'broccoli (frozen)',
      'cauliflower (frozen)',
      'stir fry veggies (frozen)',
      'mixed veggies (frozen)',
      'diced potatoes (frozen)',
      'dumplings (frozen)',
      'meatballs (frozen)',
      'grilled chicken strips (frozen)'
    ],
    'pasta': [
      'angel hair pasta',
      'fettuccine pasta',
      'spaghetti pasta',
      'manicotti pasta',
      'lasagna pasta',
      'elbow pasta',
      'fidello pasta',
      'rigatoni pasta',
      'egg noodles',
      'rice noodles',
      'mac and cheese'
    ],
    'rice': [
      'jasmine rice',
      'sushi rice',
      'basmati rice'
    ],
    'bread': [
      'hamburger buns',
      'hot dog buns',
      'rolls',
      'white bread',
      'wheat bread',
      'flour tortillas',
      'corn tortillas',
      'naan bread',
      'pita bread',
      'french bread',
      'sourdough bread',
      'kings hawaiian bread',
      'bagels',
      'english muffins'
    ]
  };

  // Category friendly names for display
  var CATEGORY_DISPLAY_NAMES = {
    'spices': '🧂 Spices & Seasonings',
    'proteins': '🥩 Proteins',
    'sauces': '🍯 Sauces & Oils',
    'canned-goods': '🥫 Canned Goods',
    'dry-goods': '🌾 Dry Goods',
    'produce': '🥕 Produce',
    'dairy': '🧈 Dairy',
    'frozen': '❄️ Frozen Items',
    'pasta': '🍝 Pasta & Noodles',
    'rice': '🍚 Rice',
    'bread': '🍞 Bread'
  };

  // ========================================================
  // INITIALIZATION & STORAGE MANAGEMENT
  // ========================================================

  /**
   * Initialize or get saved ingredients library from storage
   */
  function initSavedIngredientsLibrary() {
    try {
      var stored = window.localStorage ? window.localStorage.getItem(SAVED_INGREDIENTS_STORAGE_KEY) : null;
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load saved ingredients library:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_INGREDIENTS_LIBRARY));
  }

  /**
   * Save ingredients library to storage
   */
  function saveSavedIngredientsLibrary(library) {
    try {
      if (window.localStorage) {
        window.localStorage.setItem(SAVED_INGREDIENTS_STORAGE_KEY, JSON.stringify(library));
      }
    } catch (e) {
      console.warn('Failed to save ingredients library:', e);
    }
  }

  /**
   * Get saved recipes from storage
   */
  function getSavedRecipes() {
    try {
      var stored = window.localStorage ? window.localStorage.getItem(SAVED_RECIPES_STORAGE_KEY) : null;
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.warn('Failed to load saved recipes:', e);
      return {};
    }
  }

  /**
   * Save recipe to storage
   */
  function saveRecipe(recipeId, recipe) {
    try {
      var recipes = getSavedRecipes();
      recipes[recipeId] = Object.assign({}, recipe, { id: recipeId, savedAt: Date.now() });
      if (window.localStorage) {
        window.localStorage.setItem(SAVED_RECIPES_STORAGE_KEY, JSON.stringify(recipes));
      }
    } catch (e) {
      console.warn('Failed to save recipe:', e);
    }
  }

  /**
   * Get shopping lists from storage
   */
  function getShoppingLists() {
    try {
      var stored = window.localStorage ? window.localStorage.getItem(SHOPPING_LISTS_STORAGE_KEY) : null;
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.warn('Failed to load shopping lists:', e);
      return {};
    }
  }

  /**
   * Save shopping list
   */
  function saveShoppingList(listId, shoppingList) {
    try {
      var lists = getShoppingLists();
      lists[listId] = Object.assign({}, shoppingList, {
        id: listId,
        createdAt: shoppingList.createdAt || Date.now(),
        updatedAt: Date.now()
      });
      if (window.localStorage) {
        window.localStorage.setItem(SHOPPING_LISTS_STORAGE_KEY, JSON.stringify(lists));
      }
    } catch (e) {
      console.warn('Failed to save shopping list:', e);
    }
  }

  /**
   * Get pantry inventory items
   */
  function getPantryItems() {
    try {
      var stored = window.localStorage ? window.localStorage.getItem(PANTRY_ITEMS_STORAGE_KEY) : null;
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.warn('Failed to load pantry items:', e);
      return {};
    }
  }

  /**
   * Save pantry item
   */
  function savePantryItem(itemId, item) {
    try {
      var items = getPantryItems();
      items[itemId] = Object.assign({}, item, {
        id: itemId,
        addedAt: item.addedAt || Date.now(),
        lastUpdated: Date.now()
      });
      if (window.localStorage) {
        window.localStorage.setItem(PANTRY_ITEMS_STORAGE_KEY, JSON.stringify(items));
      }
    } catch (e) {
      console.warn('Failed to save pantry item:', e);
    }
  }

  /**
   * Get current pantry filter mode ('all' or 'missing-recommended')
   */
  function getPantryFilterMode() {
    try {
      var stored = window.localStorage ? window.localStorage.getItem(PANTRY_FILTER_MODE_STORAGE_KEY) : null;
      return stored ? JSON.parse(stored) : 'all';
    } catch (e) {
      return 'all';
    }
  }

  /**
   * Set current pantry filter mode
   */
  function setPantryFilterMode(mode) {
    try {
      if (window.localStorage) {
        window.localStorage.setItem(PANTRY_FILTER_MODE_STORAGE_KEY, JSON.stringify(mode));
      }
    } catch (e) {
      console.warn('Failed to save pantry filter mode:', e);
    }
  }

  // ========================================================
  // SHOPPING LIST GENERATION
  // ========================================================

  /**
   * Create a shopping list from selected recipes
   * @param {Array} selectedRecipeIds - Array of recipe IDs to include
   * @returns {Object} - Shopping list with consolidated ingredients by category
   */
  function generateShoppingListFromRecipes(selectedRecipeIds) {
    var recipes = getSavedRecipes();
    var consolidatedItems = {};

    // Consolidate ingredients from all selected recipes
    selectedRecipeIds.forEach(function(recipeId) {
      var recipe = recipes[recipeId];
      if (!recipe || !recipe.ingredients) return;

      recipe.ingredients.forEach(function(item) {
        var key = item.name.toLowerCase();
        if (!consolidatedItems[key]) {
          consolidatedItems[key] = {
            name: item.name,
            category: item.category,
            quantity: 0,
            unit: item.unit || '',
            recipes: []
          };
        }
        consolidatedItems[key].quantity += (item.quantity || 1);
        if (!consolidatedItems[key].recipes.includes(recipeId)) {
          consolidatedItems[key].recipes.push(recipeId);
        }
      });
    });

    // Organize by category
    var byCategory = {};
    Object.keys(consolidatedItems).forEach(function(key) {
      var item = consolidatedItems[key];
      var cat = item.category || 'other';
      if (!byCategory[cat]) {
        byCategory[cat] = [];
      }
      byCategory[cat].push(item);
    });

    return {
      id: 'shopping-list-' + Date.now(),
      recipeCounts: selectedRecipeIds.length,
      createdAt: Date.now(),
      items: consolidatedItems,
      byCategory: byCategory,
      checkedOffItems: {}
    };
  }

  /**
   * Add item to shopping list
   */
  function addItemToShoppingList(listId, item) {
    var lists = getShoppingLists();
    var list = lists[listId];
    if (!list) return;

    var key = item.name.toLowerCase();
    list.items[key] = item;
    list.updatedAt = Date.now();
    saveShoppingList(listId, list);
  }

  /**
   * Toggle item as checked off in shopping list
   */
  function toggleShoppingListItem(listId, itemName) {
    var lists = getShoppingLists();
    var list = lists[listId];
    if (!list) return;

    var key = itemName.toLowerCase();
    if (!list.checkedOffItems) {
      list.checkedOffItems = {};
    }
    list.checkedOffItems[key] = !list.checkedOffItems[key];
    list.updatedAt = Date.now();
    saveShoppingList(listId, list);
  }

  // ========================================================
  // PANTRY FILTER SYSTEM
  // ========================================================

  /**
   * Get pantry items filtered by mode
   * @param {string} mode - 'all' or 'missing-recommended'
   * @returns {Object} - Filtered pantry items
   */
  function getFilteredPantryItems(mode) {
    var pantryItems = getPantryItems();
    var library = initSavedIngredientsLibrary();

    if (mode === 'all') {
      return pantryItems;
    }

    if (mode === 'missing-recommended') {
      // Filter to show only items that have a "recommended" flag but are not in pantry
      var missingRecommended = {};
      var recommendedItems = getRecommendedPantryItems(library);

      recommendedItems.forEach(function(item) {
        var key = item.toLowerCase();
        if (!pantryItems[key]) {
          missingRecommended[key] = {
            name: item,
            category: findItemCategory(item, library),
            isMissing: true,
            isRecommended: true
          };
        }
      });

      return missingRecommended;
    }

    return pantryItems;
  }

  /**
   * Get list of recommended spices to track
   */
  function getRecommendedPantryItems(library) {
    // For spices, we recommend all items in the library
    // For other categories, you could add logic to mark specific items as "recommended"
    var recommended = [];
    if (library.spices) {
      recommended = recommended.concat(library.spices);
    }
    return recommended;
  }

  /**
   * Find which category an item belongs to
   */
  function findItemCategory(itemName, library) {
    var lowerName = itemName.toLowerCase();
    for (var cat in library) {
      if (library[cat]) {
        for (var i = 0; i < library[cat].length; i++) {
          if (library[cat][i].toLowerCase() === lowerName) {
            return cat;
          }
        }
      }
    }
    return 'other';
  }

  /**
   * Add item to pantry inventory
   */
  function addPantryItem(itemName, category, quantity, unit) {
    var key = itemName.toLowerCase().replace(/\s+/g, '-');
    savePantryItem(key, {
      name: itemName,
      category: category || 'other',
      quantity: quantity || 1,
      unit: unit || '',
      inStock: true
    });
  }

  /**
   * Mark pantry item as used/consumed
   */
  function usePantryItem(itemId, quantity) {
    var items = getPantryItems();
    var item = items[itemId];
    if (!item) return;

    item.quantity = Math.max(0, (item.quantity || 1) - (quantity || 1));
    if (item.quantity === 0) {
      item.inStock = false;
    }
    savePantryItem(itemId, item);
  }

  /**
   * Get pantry items by category
   */
  function getPantryItemsByCategory(filterMode) {
    var items = getFilteredPantryItems(filterMode || getPantryFilterMode());
    var byCategory = {};

    Object.keys(items).forEach(function(key) {
      var item = items[key];
      var cat = item.category || 'other';
      if (!byCategory[cat]) {
        byCategory[cat] = [];
      }
      byCategory[cat].push(item);
    });

    return byCategory;
  }

   // ========================================================
   // RECIPE IMPORT & PARSING
   // ========================================================

   /**
    * Parse recipe text to extract ingredients
    * @param {string} recipeText - Raw recipe text pasted by user
    * @returns {Array} - Array of parsed ingredients with categories
    */
   function parseRecipeText(recipeText) {
     if (!recipeText || typeof recipeText !== 'string') return [];

     var library = initSavedIngredientsLibrary();
     var allLibraryItems = [];

     // Build a complete list of all known ingredients with their categories
     Object.keys(library).forEach(function(category) {
       if (library[category]) {
         library[category].forEach(function(item) {
           allLibraryItems.push({
             name: item.toLowerCase(),
             category: category,
             original: item
           });
         });
       }
     });

     // Split recipe text by common delimiters and newlines
     var lines = recipeText.split(/[\n\r,;–—-]/);
     var parsedIngredients = [];
     var processedNames = {};

     lines.forEach(function(line) {
       line = line.trim();
       if (!line || line.length < 2) return;

       // Extract the ingredient name (first few words after quantities)
       var cleanLine = line
         .replace(/^\d+[\s\/]*\d*\s*(cups?|tbsp|tsp|oz|lbs?|grams?|ml|pinch|dash|clove|slice|can|jar|box|package|pkg|pkt|c|T|t|g|ml)\s+/i, '')
         .replace(/^\(.*?\)\s*/, '')
         .trim();

       if (!cleanLine || cleanLine.length < 2) return;

       // Try to match against library items
       var lowerClean = cleanLine.toLowerCase();
       var matchedItem = null;

       // First try exact or close match
       for (var i = 0; i < allLibraryItems.length; i++) {
         var libItem = allLibraryItems[i];
         if (libItem.name === lowerClean || lowerClean.indexOf(libItem.name) !== -1) {
           matchedItem = libItem;
           break;
         }
       }

       // If no match, try substring matching (take first match)
       if (!matchedItem) {
         for (var i = 0; i < allLibraryItems.length; i++) {
           var libItem = allLibraryItems[i];
           if (lowerClean.indexOf(libItem.name) !== -1 || libItem.name.indexOf(lowerClean) !== -1) {
             matchedItem = libItem;
             break;
           }
         }
       }

       if (matchedItem) {
         var key = matchedItem.original.toLowerCase();
         if (!processedNames[key]) {
           processedNames[key] = true;
           parsedIngredients.push({
             name: matchedItem.original,
             category: matchedItem.category,
             quantity: 1,
             unit: '',
             source: 'imported'
           });
         }
       } else if (cleanLine.length > 2 && cleanLine.length < 50) {
         // If no library match, add as custom ingredient
         var key = cleanLine.toLowerCase();
         if (!processedNames[key]) {
           processedNames[key] = true;
           parsedIngredients.push({
             name: cleanLine.charAt(0).toUpperCase() + cleanLine.slice(1),
             category: 'other',
             quantity: 1,
             unit: '',
             source: 'imported-custom'
           });
         }
       }
     });

     return parsedIngredients;
   }

   /**
    * Create a recipe from imported text with sync tracking
    * @param {string} name - Recipe name
    * @param {string} recipeText - Raw recipe text
    * @returns {string} - Recipe ID
    */
   function createRecipeFromImport(name, recipeText) {
     var ingredients = parseRecipeText(recipeText);
     var recipeId = 'recipe-' + Date.now();

     saveRecipe(recipeId, {
       name: name,
       description: 'Imported recipe',
       ingredients: ingredients,
       source: 'imported',
       originalText: recipeText,
       syncStatus: 'local-only',
       syncedAt: null,
       createdAt: Date.now()
     });

     // Update sync status tracking
     updateRecipeSyncStatus(recipeId, 'local-only');

     // Alert via Excel schema checker if available
     if (window.ExcelSchemaCheckHelper && window.ExcelSchemaCheckHelper.upsertGlobalBanner) {
       window.ExcelSchemaCheckHelper.upsertGlobalBanner('recipe-sync-warning', {
         title: '📋 Recipe Not Synced',
         message: 'The recipe " ' + name + ' " is saved locally only and not synced with Excel backend.',
         details: 'To sync: Export this recipe from the app menu or use manual sync.',
         tone: 'warning'
       });
     }

     return recipeId;
   }

   // ========================================================
   // SYNC STATUS TRACKING
   // ========================================================

   /**
    * Get all recipe sync statuses
    */
   function getRecipeSyncStatuses() {
     try {
       var stored = window.localStorage ? window.localStorage.getItem(RECIPE_SYNC_STATUS_STORAGE_KEY) : null;
       return stored ? JSON.parse(stored) : {};
     } catch (e) {
       console.warn('Failed to load recipe sync statuses:', e);
       return {};
     }
   }

   /**
    * Update sync status for a recipe
    */
   function updateRecipeSyncStatus(recipeId, status) {
     try {
       var statuses = getRecipeSyncStatuses();
       statuses[recipeId] = {
         status: status, // 'synced', 'local-only', 'pending-sync'
         lastUpdated: Date.now()
       };
       if (window.localStorage) {
         window.localStorage.setItem(RECIPE_SYNC_STATUS_STORAGE_KEY, JSON.stringify(statuses));
       }
     } catch (e) {
       console.warn('Failed to save recipe sync status:', e);
     }
   }

   /**
    * Get sync status for a specific recipe
    */
   function getRecipeSyncStatus(recipeId) {
     var statuses = getRecipeSyncStatuses();
     return statuses[recipeId] ? statuses[recipeId].status : 'unknown';
   }

   /**
    * Get count of local-only recipes
    */
   function getLocalOnlyRecipeCount() {
     var recipes = getSavedRecipes();
     var localOnlyCount = 0;

     Object.keys(recipes).forEach(function(recipeId) {
       if (getRecipeSyncStatus(recipeId) === 'local-only') {
         localOnlyCount++;
       }
     });

     return localOnlyCount;
   }

   /**
    * Mark a recipe as synced with Excel backend
    */
   function markRecipeAsSynced(recipeId) {
     updateRecipeSyncStatus(recipeId, 'synced');
     var recipes = getSavedRecipes();
     if (recipes[recipeId]) {
       recipes[recipeId].syncedAt = Date.now();
       saveRecipe(recipeId, recipes[recipeId]);
     }

     // Clear warning banner
     if (window.ExcelSchemaCheckHelper && window.ExcelSchemaCheckHelper.clearGlobalBanner) {
       window.ExcelSchemaCheckHelper.clearGlobalBanner('recipe-sync-warning');
     }
   }

   // ========================================================
   // PUBLIC API
   // ========================================================

   var api = {
     // Ingredients library management
     getIngredientsLibrary: initSavedIngredientsLibrary,
     saveIngredientsLibrary: saveSavedIngredientsLibrary,

     // Recipe management
     getSavedRecipes: getSavedRecipes,
     saveRecipe: saveRecipe,

     // Recipe import & parsing
     parseRecipeText: parseRecipeText,
     createRecipeFromImport: createRecipeFromImport,

     // Recipe sync status
     getRecipeSyncStatuses: getRecipeSyncStatuses,
     updateRecipeSyncStatus: updateRecipeSyncStatus,
     getRecipeSyncStatus: getRecipeSyncStatus,
     getLocalOnlyRecipeCount: getLocalOnlyRecipeCount,
     markRecipeAsSynced: markRecipeAsSynced,

     // Shopping list management
     getShoppingLists: getShoppingLists,
     saveShoppingList: saveShoppingList,
     generateShoppingListFromRecipes: generateShoppingListFromRecipes,
     addItemToShoppingList: addItemToShoppingList,
     toggleShoppingListItem: toggleShoppingListItem,

     // Pantry management
     getPantryItems: getPantryItems,
     savePantryItem: savePantryItem,
     addPantryItem: addPantryItem,
     usePantryItem: usePantryItem,
     getPantryItemsByCategory: getPantryItemsByCategory,
     getFilteredPantryItems: getFilteredPantryItems,

     // Pantry filter
     getPantryFilterMode: getPantryFilterMode,
     setPantryFilterMode: setPantryFilterMode,

     // Constants & utilities
     DEFAULT_INGREDIENTS_LIBRARY: DEFAULT_INGREDIENTS_LIBRARY,
     CATEGORY_DISPLAY_NAMES: CATEGORY_DISPLAY_NAMES,
     findItemCategory: findItemCategory
   };

  // Expose API globally
  global.RecipesShoppingSystem = api;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

})(typeof window !== 'undefined' ? window : global);

