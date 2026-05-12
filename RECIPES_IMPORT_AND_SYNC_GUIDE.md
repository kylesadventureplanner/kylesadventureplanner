# Recipe Import & Excel Sync Integration Guide

## Overview

This guide explains the new **Recipe Import** feature and **Excel Sync Tracking** system integrated into your Recipes & Shopping Management tool.

## ✨ New Features

### 1. Recipe Import from Text (📥 Import Recipe)

**What It Does:**
- Paste recipe text or ingredients from any source (websites, emails, PDFs, etc.)
- Automatically extracts ingredients and matches them against your ingredients library
- Shows a preview for you to review and edit before saving
- Marks imported recipes as "Local Only" until synced with Excel

**Where to Find It:**
- Go to **Household Tools Tab** → **Recipes** section
- Click **"📥 Import Recipe"** button (next to "Create New Recipe")

**How to Use:**

1. Click **"📥 Import Recipe"**
2. Enter a recipe name (e.g., "Pasta Carbonara")
3. Paste recipe text in the textarea:
   - Can be comma-separated ingredients: `Pasta, Bacon, Eggs, Cheese`
   - Can be multi-line: Each ingredient on a new line
   - Can be from a website: Paste the full recipe text or just the ingredients section
4. Click **"📥 Import & Preview"**
5. Review the extracted ingredients in the preview dialog
6. Remove any ingredients you don't want
7. Add optional description notes
8. Click **"💾 Save Recipe"**

**Smart Ingredient Matching:**
- System uses your 170+ ingredient library to automatically categorize items
- Ingredients from the library appear in **green** (matched)
- Custom ingredients not in library appear in **orange** (custom)
- You can remove any ingredient before saving

### 2. Recipe Edit Capability (✏️ Edit)

**What It Does:**
- Edit imported recipes after they're created
- Modify ingredient names and lists
- Update recipe descriptions

**Where to Find It:**
- Go to **Recipes** tab
- Imported recipes will show an **"✏️ Edit"** button
- Click to open the edit dialog

**What You Can Edit:**
- Recipe name
- Recipe description
- Individual ingredients (add, remove, or rename)

### 3. Sync Status Tracking

**What It Tracks:**
- Whether each recipe is synced with your Excel backend
- Sync status for each recipe is displayed as a badge

**Sync Status Indicators:**

| Badge | Meaning |
|-------|---------|
| ✓ Synced (Green) | Recipe is synced with Excel backend |
| ⚠️ Local Only (Yellow) | Recipe is saved locally, NOT yet synced |
| ⏳ Pending Sync (Blue) | Recipe is marked to be synced (not yet confirmed) |

**Where You See It:**
- Each recipe card displays its sync status
- Recipe name line shows the badge next to the recipe name

### 4. Unsync'd Recipe Alerts

**What It Shows:**
- When you have unsynced recipes, a warning banner appears at the top of the Recipes tab
- Shows count of local-only recipes
- Provides "Learn More" button with instructions

**Example Banner:**
```
⚠️ 2 recipe(s) not synced with Excel backend   [ℹ️ Learn More]
```

**Why This Matters:**
- Local-only recipes are saved in your browser only
- If you clear browser data, local recipes may be lost
- Syncing ensures recipes are backed up in Excel and available everywhere

## 🔄 Data Sync Workflow

### Automatic Sync Status Tracking

The system automatically tracks import status:

1. **When you import a recipe:**
   - Recipe saved locally to browser storage
   - Marked as "Local Only" (⚠️)
   - Yellow badge appears on recipe
   - Alert banner appears (if multiple local recipes)

2. **When you export/sync to Excel:**
   - (Manual process via your app's export feature)
   - After export, mark as synced via app menu
   - Badge turns green ✓ Synced
   - Alert banner hides when all recipes are synced

### Integration with Excel Schema Checker

The system integrates with your existing **ExcelSchemaCheckHelper**:

- **Global Banner**: If available, displays alerts about unsync'd recipes
- **Schema Reporting**: Reports unsync'd recipe count to dashboard
- **Tone**: Warning (yellow) to indicate action may be needed

## 📝 Data Storage

### Where Data Is Stored

**Browser Storage (localStorage):**
- `kap_saved_recipes_v1` - Recipe data
- `kap_recipe_sync_status_v1` - Sync status for each recipe
- `kap_saved_ingredients_v1` - Ingredients library

**What This Means:**
- All recipe data is stored locally in your browser
- No server calls required
- Works completely offline
- Data persists across browser sessions

### Sync Status Data Structure

```javascript
{
  "recipe-1234567890": {
    "status": "local-only",  // 'synced', 'local-only', 'pending-sync'
    "lastUpdated": 1715590400000
  },
  "recipe-1234567891": {
    "status": "synced",
    "lastUpdated": 1715590500000
  }
}
```

## 🎯 Common Workflows

### Workflow 1: Import a Recipe from Website

1. Find recipe on website
2. Copy all text from webpage (Ctrl+A, Ctrl+C)
3. Go to **Recipes** → **"📥 Import Recipe"**
4. Paste text in textarea
5. Click **"📥 Import & Preview"**
6. Review ingredients (green = matched, orange = custom)
7. Remove any unwanted ingredients
8. Click **"💾 Save Recipe"**
9. Recipe is now saved locally (marked ⚠️ Local Only)

### Workflow 2: Sync Recipe to Excel

1. Go to **Recipes** tab
2. Notice the warning banner with unsync'd recipe count
3. Click **"ℹ️ Learn More"** for instructions
4. Use app's export/sync feature to export recipe to Excel
5. Once exported, mark recipe as synced (via admin panel or sync feature)
6. Badge changes from ⚠️ to ✓

### Workflow 3: Edit an Imported Recipe

1. Go to **Recipes** tab
2. Find imported recipe (has ✏️ Edit button)
3. Click **"✏️ Edit"**
4. Modify recipe name, description, or ingredients
5. Click **"💾 Save Changes"**
6. Recipe is updated

### Workflow 4: Multi-Recipe Workflow

1. Import 3-4 recipes
2. See ⚠️ badges on all imported recipes
3. System alerts: "3 recipe(s) not synced"
4. Create shopping list from recipes
5. Export shopping list + recipes to Excel
6. Recipes are now synced (badges change to ✓)

## 🔧 Technical Details

### Recipe Import Parsing Algorithm

**How Ingredient Extraction Works:**

1. **Text Processing:**
   - Splits input by common delimiters: newlines, commas, semicolons, dashes
   - Removes quantity measurements: "2 cups", "1/2 tsp", etc.
   - Removes parenthetical notes: "(optional)", "(fresh)", etc.

2. **Ingredient Matching:**
   - Tries exact match against ingredient library (170+ items)
   - Falls back to substring matching
   - Matches against ingredient categories: spices, proteins, produce, etc.

3. **Custom Ingredient Handling:**
   - If no library match found, creates as "custom" ingredient
   - Marked with orange badge in preview
   - Category set to "other"

**Example Parsing:**

| Input Text | Extracted | Category | Status |
|-----------|-----------|----------|--------|
| `2 cups pasta` | Spaghetti Pasta | pasta | ✓ Matched |
| `1/2 tsp garlic powder` | Garlic Powder | spices | ✓ Matched |
| `4 oz fresh basil` | Basil | (custom) | ◆ Custom |
| `olive oil` | Olive Oil | sauces | ✓ Matched |

### API Functions

**For Developers:**

```javascript
// Parse recipe text to extract ingredients
var parsed = RecipesShoppingSystem.parseRecipeText(recipeText);
// Returns: Array of { name, category, quantity, unit, source }

// Create recipe from import with sync tracking
var recipeId = RecipesShoppingSystem.createRecipeFromImport(name, recipeText);
// Returns: Recipe ID, automatically marked as 'local-only'

// Get sync status for a recipe
var status = RecipesShoppingSystem.getRecipeSyncStatus(recipeId);
// Returns: 'synced', 'local-only', 'pending-sync', or 'unknown'

// Get count of local-only recipes
var count = RecipesShoppingSystem.getLocalOnlyRecipeCount();
// Returns: Number of unsync'd recipes

// Mark recipe as synced with Excel
RecipesShoppingSystem.markRecipeAsSynced(recipeId);
// Updates sync status to 'synced', updates timestamp

// Get all sync statuses
var allStatuses = RecipesShoppingSystem.getRecipeSyncStatuses();
// Returns: Object mapping recipeId -> {status, lastUpdated}
```

## ⚠️ Important Notes

### When Sync Status Changes

**Local Only → Synced:**
- Recipe is marked as backed up to Excel
- Badge changes from ⚠️ to ✓
- If all recipes are synced, warning banner disappears

**Synced → Local Only:**
- (Can happen if recipe is edited after sync)
- Badge changes back to ⚠️
- Warning banner reappears

### Data Backup Recommendations

**To Ensure Recipes Don't Get Lost:**
1. Regularly sync recipes to Excel backend
2. Export recipes periodically to backup file
3. Don't clear browser storage without warning

**If You Clear Browser Data:**
- All local recipes will be lost
- Only synced recipes (in Excel) will remain
- No way to recover local-only recipes

## 🐛 Troubleshooting

### Imported Recipe Shows Wrong Category

**Solution:**
- Click **"✏️ Edit"** to fix ingredient categories
- The system tries to match, but manual fixes are sometimes needed

### Not All Ingredients Were Extracted

**Possible Reasons:**
- Text was formatted strangely
- Ingredient names don't match library
- Very short ingredient names were filtered out

**Solution:**
- Use **"✏️ Edit"** to manually add missing ingredients
- Or re-import with cleaner text format

### I Can't See Edit Button

**Only Imported Recipes Show Edit Button**
- Manually created recipes don't have the Edit button
- If you want to edit a manual recipe, use ✏️ to create a new imported version

### Sync Badge Shows "Unknown"

**Possible Reasons:**
- Recipe created before sync system was enabled
- Browser storage was cleared partially

**Solution:**
- Click "Learn More" on warning banner
- Manually mark recipe sync status through app settings

## 📚 Related Documentation

- **Recipes & Shopping System Guide**: `RECIPES_SHOPPING_IMPLEMENTATION.md`
- **Excel Schema Checker Guide**: In app documentation
- **Quick Start Guide**: `RECIPES_SHOPPING_QUICK_START.md`

## ✅ Next Steps

1. **Start importing recipes** - Click "📥 Import Recipe" and paste a recipe
2. **Review the preview** - Check extracted ingredients
3. **Use Edit feature** - Click "✏️" to make adjustments  
4. **Export to Excel** - Use app's sync feature to backup recipes
5. **Monitor sync status** - Watch for badges and warning banners

---

**Questions?** See the full system documentation in RECIPES_SHOPPING_IMPLEMENTATION.md or contact your system administrator.

