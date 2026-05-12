# Recipe Import & Sync - Quick Start Guide

## ⚡ 5-Minute Setup

You're ready to go! No setup needed. Just start using it.

## 🚀 Get Started Now

### Step 1: Import Your First Recipe (2 minutes)

1. Open your app and go to **Household Tools** tab
2. Click the **📋 Recipes** section
3. Click the **"📥 Import Recipe"** button (green button, next to Create New)
4. You'll see a dialog like this:

```
Recipe Name: [_________________]

Paste Recipe Text:
[_______________________________
  Paste recipe here...
_______________________________]
```

5. Enter a recipe name, e.g., `Spaghetti Carbonara`
6. Paste recipe text in the textarea:

**Example 1 - Comma-separated:**
```
Pasta, Bacon, Eggs, Parmesan Cheese, Salt, Black Pepper
```

**Example 2 - From website:**
```
Ingredients:
1 lb spaghetti pasta
4 ounces bacon, chopped
4 eggs
1 cup parmesan cheese, grated
Salt and pepper to taste
Optional: fresh parsley
```

**Example 3 - Multi-line:**
```
- 2 cups flour
- 1 cup sugar
- 2 eggs
- Vanilla extract
- Baking powder
- Butter
```

7. Click **"📥 Import & Preview"** (blue button)

### Step 2: Review Ingredients (1 minute)

The system will show you a preview:

```
Recipe Preview: Spaghetti Carbonara

✓ Found 6 ingredient(s). You can remove items...

Ingredients:
┌─────────────────────────────┐
│ Spaghetti Pasta             │  [Remove]
│ pasta                       │
├─────────────────────────────┤
│ Bacon                       │  [Remove]
│ proteins                    │
├─────────────────────────────┤
│ Eggs (Custom)               │  [Remove]
│ other                       │
└─────────────────────────────┘
```

**What the colors mean:**
- 🟢 **Green items** = Found in your ingredient library (spices, proteins, etc.)
- 🟠 **Orange items** = Custom ingredients not in library

8. Remove any ingredients you don't want (click [Remove])
9. Add recipe description if you want (optional):
   ```
   Classic carbonara pasta from Italy, creamy and delicious
   ```
10. Click **"💾 Save Recipe"** (green button)

### Step 3: See Your Recipe (1 minute)

Your recipe appears in the list with a **⚠️ Local Only** badge:

```
📋 Recipes (1)

┌─────────────────────────────────────┐
│ Spaghetti Carbonara ⚠️ Local Only   │
│                                     │
│ Ingredients: 6 items                │
│                                     │
│ [✏️ Edit] [🛒 Add...] [🗑️ Delete]   │
└─────────────────────────────────────┘

⚠️ 1 recipe(s) not synced with Excel backend [ℹ️ Learn More]
```

**That's it!** Your recipe is imported and saved.

## 🎯 What You Can Do Now

### Edit an Imported Recipe

1. Find your recipe in the list
2. Click the **"✏️ Edit"** button (appears on imported recipes)
3. Modify:
   - Recipe name
   - Description
   - Ingredients (add, remove, rename)
4. Click **"💾 Save Changes"**

### Create Shopping List from Imported Recipe

1. Go to **Recipes** tab
2. Click **"🛒 Add to Shopping List"** on your recipe
3. Shopping list is created with all ingredients from recipe
4. Go to **🛒 Shopping Lists** tab to view it

### Sync with Excel (Optional)

1. See the warning: `⚠️ 1 recipe(s) not synced...`
2. Click **"ℹ️ Learn More"** for sync instructions
3. Use your app's export feature to backup recipes to Excel
4. After export, recipe badge changes to **✓ Synced**

## 📝 Example Recipes to Try

### Example 1: Simple Ingredients List
```
Pasta Recipe
```
**Text to paste:**
```
Pasta, Tomato Sauce, Ground Beef, Onions, Garlic, Olive Oil, Parmesan
```

### Example 2: Website Recipe
```
Chocolate Chip Cookies
```
**Text to paste:**
```
2 1/4 cups all-purpose flour
1 tsp baking soda
1 tsp salt
1 cup butter, softened
3/4 cup granulated sugar
3/4 cup packed brown sugar
2 large eggs
2 tsp vanilla extract
2 cups chocolate chips
```

### Example 3: Mixed Format
```
Tacos
```
**Text to paste:**
```
Ground Beef - 1 lb
Taco Shells, Lettuce, Tomato
Cheese (Mexican Blend), Sour Cream
Salsa, Black Beans
```

## ✅ Verification Checklist

- [ ] "📥 Import Recipe" button appears next to "Create New"
- [ ] Can paste recipe text in the modal
- [ ] Preview shows extracted ingredients
- [ ] Can remove unwanted ingredients
- [ ] Recipe saves and appears with ⚠️ badge
- [ ] ✏️ Edit button appears on imported recipes
- [ ] Can edit recipe name and ingredients
- [ ] Warning banner shows unsync'd count
- [ ] Shopping list can be created from recipe

## ❓ Quick Q&A

**Q: Can I import from any website?**
A: Yes! Just copy the ingredients section and paste. The system is smart about parsing.

**Q: What if an ingredient isn't recognized?**
A: It'll show as "Custom" (orange badge). You can rename it or remove it.

**Q: Will I lose recipes if I close my browser?**
A: No! Recipes are saved in browser storage and stay there.

**Q: What does "Local Only" mean?**
A: Recipe is only in your browser, not backed up to Excel yet.

**Q: How do I sync to Excel?**
A: Use your app's export/sync feature. See "Learn More" button for details.

**Q: Can I edit recipes after importing?**
A: Yes! Click ✏️ Edit on any imported recipe.

## 🎓 Next Steps

1. **Import 2-3 recipes** to get comfortable with the process
2. **Edit one recipe** to see how easy it is to make changes
3. **Create shopping lists** from your recipes
4. **Export to Excel** when you're ready to sync them
5. **Read full guide** for more advanced features: `RECIPES_IMPORT_AND_SYNC_GUIDE.md`

## 📱 Mobile Tips

If using on phone/tablet:
- The modals are fully responsive
- Tap to switch between recipes and shopping lists
- Warning banner will show on top
- All buttons are touch-friendly

## 🆘 Troubleshooting

**"Import Recipe button not showing?"**
- Refresh the page
- Make sure you're in Household Tools → Recipes tab

**"Preview looks wrong?"**
- Click ✏️ Edit to manually fix ingredients
- Try pasting cleaner text (no special characters)

**"Recipe disappeared?"**
- Check you're in Recipes tab (not Shopping Lists)
- Recipes appear in a grid below the buttons

**"Edit button not showing?"**
- Only imported recipes have ✏️ Edit
- Manually created recipes use Create New

---

**Ready to import recipes? Click the 📥 button and get started!**

For more details, see: `RECIPES_IMPORT_AND_SYNC_GUIDE.md`

