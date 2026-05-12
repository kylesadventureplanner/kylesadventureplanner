# Recipes & Shopping List System - Implementation Guide

## Overview

The Recipes & Shopping List system has been fully integrated into the Household Tools tab. This comprehensive system allows you to:

1. **Manage Recipes** - Create and save recipes with ingredients
2. **Generate Shopping Lists** - Create shopping lists from one or more recipes with automatic consolidation
3. **Track Pantry Inventory** - Manage your pantry stock with ingredient tracking
4. **Filter Pantry by Status** - View all items or only missing recommended spices
5. **Access Ingredients Library** - Browse the pre-saved ingredients database organized by categories

## Features

### 1. Recipes Management 📋

**Create New Recipe:**
- Navigate to Household Tools → Recipes tab
- Click "➕ Create New Recipe" button
- Enter recipe name and ingredients
- Save the recipe

**Pre-saved Ingredients:**
- All ingredients are pre-organized in the database
- Categories include:
  - 🧂 Spices & Seasonings (36+ items)
  - 🥩 Proteins (15+ items)
  - 🍯 Sauces & Oils (12+ items)
  - 🥫 Canned Goods (35+ items)
  - 🌾 Dry Goods (4+ items)
  - 🥕 Produce (32+ items)
  - 🧈 Dairy (10+ items)
  - ❄️ Frozen Items (10+ items)
  - 🍝 Pasta & Noodles (11+ items)
  - 🍚 Rice (3+ items)
  - 🍞 Bread (14+ items)

**View Saved Recipes:**
- All your saved recipes appear in the Recipes tab
- Shows ingredient count and description
- Quick actions: Add to Shopping List, Delete

### 2. Shopping Lists 🛒

**Create Shopping List from Single Recipe:**
1. Go to Recipes tab
2. Find your recipe
3. Click "🛒 Add to Shopping List"
4. Shopping list is automatically created

**Create Shopping List from Multiple Recipes:**
1. Go to Shopping Lists tab
2. Click "🛒 Create New Shopping List"
3. Enter comma-separated recipe IDs
4. System consolidates all ingredients by category
5. Duplicate ingredients are combined with quantities

**Shopping List Features:**
- Automatic consolidation of ingredients
- Items organized by category
- Track which recipes each ingredient comes from
- Check off items as you shop
- View meta info (creation date, items completed)

### 3. Pantry Management 🧂

**Add Items to Pantry:**
1. Go to Household Tools → Pantry tab
2. Click "➕ Add Item"
3. Enter:
   - Item name
   - Category (spices, proteins, dairy, etc.)
   - Quantity (number)
   - Unit (cup, tsp, lb, etc.)

**Pantry Features:**
- Organized by category with emoji indicators
- Shows quantity and unit for each item
- Mark items as used to update inventory
- Filter between:
  - 📦 **All Items** - See complete pantry inventory
  - ⚠️ **Missing Recommended** - See only missing recommended spices

### 4. Pantry Filter Toggle ⚠️

**Missing Recommended Filter:**
- Shows spices that are in the recommended list but NOT in your pantry
- Helps quickly identify what spices you need to replenish
- Especially useful for maintaining a well-stocked spice rack

**All Items Filter:**
- Shows complete pantry inventory
- All tracked ingredients regardless of status
- Use for general inventory management

**How to Toggle:**
1. Go to Household Tools → Pantry tab
2. Look for the filter controls at the top
3. Click either "📦 All Items" or "⚠️ Missing Recommended"
4. View updates instantly

### 5. Ingredients Library 📦

**View Pre-saved Ingredients:**
1. Go to Household Tools → Ingredients Library tab
2. Browse all categories with 📦 emoji
3. See complete list of 170+ ingredients

**Categories Included:**
- Spices & Seasonings (36 items)
  - italian seasoning, garlic powder, paprika, etc.
- Proteins (15 items)
  - chicken breast, ground beef, bacon, etc.
- Sauces & Oils (12 items)
  - soy sauce, worcestershire, olive oil, etc.
- Canned Goods (35 items)
  - tomatoes (various types), beans, vegetables, etc.
- Dry Goods (4 items)
  - red/green/yellow lentils, split peas
- Produce (32 items)
  - carrots, broccoli, peppers, potatoes, etc.
- Dairy (10 items)
  - milk, cheese (various types), butter, eggs, etc.
- Frozen Items (10 items)
  - corn, vegetables, dumplings, chicken strips, etc.
- Pasta & Noodles (11 items)
  - angel hair, fettuccine, spaghetti, mac and cheese, etc.
- Rice (3 items)
  - jasmine, sushi, basmati
- Bread (14 items)
  - buns, rolls, tortillas, naan, bagels, etc.

## Data Storage

All data is stored locally in your browser's localStorage:

| Storage Key | Purpose | Max Size |
|-----------|---------|----------|
| `kap_saved_recipes_v1` | Saved recipes | ~5MB |
| `kap_shopping_lists_v1` | Shopping lists | ~5MB |
| `kap_pantry_items_v1` | Pantry inventory | ~5MB |
| `kap_saved_ingredients_v1` | Custom ingredients library | ~1MB |
| `kap_pantry_filter_mode_v1` | Current filter mode | <1KB |

**Data Persistence:**
- Data persists across browser sessions
- No cloud sync required
- Data stays private on your device
- Clear browser data to reset

## API Reference

For developers extending this system:

### RecipesShoppingSystem

```javascript
// Get saved ingredients library
RecipesShoppingSystem.getIngredientsLibrary()

// Get all saved recipes
RecipesShoppingSystem.getSavedRecipes()

// Save a new recipe
RecipesShoppingSystem.saveRecipe(recipeId, recipe)

// Generate shopping list from recipes
RecipesShoppingSystem.generateShoppingListFromRecipes(recipeIds)

// Get pantry items
RecipesShoppingSystem.getPantryItems()

// Add item to pantry
RecipesShoppingSystem.addPantryItem(name, category, quantity, unit)

// Get pantry items filtered by mode
RecipesShoppingSystem.getFilteredPantryItems(mode) // 'all' or 'missing-recommended'

// Set pantry filter mode
RecipesShoppingSystem.setPantryFilterMode(mode)
```

### RecipesShoppingUI

```javascript
// Initialize UI
RecipesShoppingUI.init()

// Switch tabs
RecipesShoppingUI.switchTab(tabName) // 'recipes', 'shopping-lists', 'pantry', 'ingredients'

// Create shopping list from recipe
RecipesShoppingUI.createShoppingListFromRecipe(recipeId)

// Set pantry filter
RecipesShoppingUI.setPantryFilter(mode)
```

## Default Ingredients Included

### Spices & Seasonings (36 items)
- italian seasoning, onion powder, minced onion, garlic powder, minced garlic
- parsley, oregano, rosemary, chives, cilantro
- bay leaves, crushed red pepper, cayenne pepper, paprika
- pepper, salt, seasoned salt, himalayan sea salt
- turmeric, nutmeg, coriander, thyme, cloves
- curry powder, chili powder, lemon pepper
- burger seasoning, taco seasoning, fajita seasoning
- ground cinnamon, cinnamon sticks, cinnamon sugar
- cajun seasoning, creole seasoning
- seafood boil seasoning packet, seafood boil seasoning liquid

### Proteins (15 items)
- chicken breast, skirt steak, sirloin steak, ribeye steak, stew meat
- ground beef, beef roast, burger patties, ground turkey
- bacon, turkey bacon
- white meat chicken (canned), dark meat chicken (canned)
- chili (canned), chili with beans (canned)

### Sauces & Oils (12 items)
- soy sauce, teriyaki sauce, general tso sauce
- worcestershire sauce, taco sauce, hot sauce
- lemon juice, lime juice, balsamic vinegar, rice vinegar
- olive oil, canola oil

### Canned Goods (35 items)
- Tomato products: diced, petite diced, stewed, crushed, paste
- Vegetables: green beans, corn, mixed vegetables, carrots, mushrooms, spinach, greens
- Beans: black eyed peas, pinto, red, chili, black, white northern, kidney, dark kidney
- Potatoes: diced, whole, sliced
- Asian: bamboo shoots, baby corn
- Mexican: Rotel, red/green enchilada sauce, salsa
- Specialty: cheese sauce, parmesan, velveeta

### And many more...

See "Ingredients Library" tab in the app for the complete list!

## Tips & Best Practices

1. **Quick Shopping:** Create shopping lists for your meal prep
2. **Pantry Tracking:** Add items as you stock your pantry
3. **Filter Management:** Use "Missing Recommended" filter to quickly restock essentials
4. **Batch Recipes:** Create shopping lists from multiple recipes at once
5. **Regular Updates:** Keep pantry inventory updated as you use items

## Troubleshooting

**Shopping list not showing items?**
- Make sure recipes have ingredients defined
- Check that ingredients are properly categorized

**Pantry filter not working?**
- Try refreshing the page
- Check browser console for errors
- Clear localStorage and reload

**Data disappeared?**
- Check browser storage limits
- See if data was cleared by browser settings
- Try exporting/importing from backup

## Files Included

- `recipes-shopping-system.js` - Core data management and API
- `recipes-shopping-ui-system.js` - UI rendering and interactions
- `RECIPES_SHOPPING_IMPLEMENTATION.md` - This documentation

## Future Enhancements

Potential features for future versions:
- Export shopping lists to PDF
- Integration with grocery store price data
- Recipe scaling and nutrition info
- Meal planning calendar
- Barcode scanning for pantry items
- Recipe search and filtering
- User ratings and favorites
- Photo capture for pantry inventory

## Support

For issues or feature requests, refer to the main project documentation or contact the development team.

