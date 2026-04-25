# Advanced Tag System Features Documentation
## v7.0.200 - April 24, 2026

---

## Overview

The consolidated tag system now includes five advanced features to improve tag management, discoverability, and consistency:

1. **Tag Aliases & Synonyms** - Normalize similar tags
2. **Custom Tag Support** - Create and manage user-defined tags
3. **Search & Filtering** - Full-text search with fuzzy matching and autocomplete
4. **Conflict Detection** - Identify contradictory tag combinations
5. **Smart Deduplication** - Find and merge near-duplicate tags

---

## 1. TAG ALIASES & SYNONYMS SYSTEM

Maps similar tags together to improve discovery and prevent fragmentation.

### Usage

#### Resolve Tag Alias
```javascript
// Get canonical tag name
resolveTagAlias('Café'); // Returns 'Coffee Shop'
resolveTagAlias('Trekking'); // Returns 'Hiking'
resolveTagAlias('Backpacking'); // Returns 'Hiking'
```

#### Get All Aliases
```javascript
// Get all aliases for a tag
getTagAliases('Hiking');
// Returns: ['Trekking', 'Walking', 'Backpacking', 'Trail Walking', 'Rambling']

getTagAliases('Coffee Shop');
// Returns: ['Café', 'Espresso Bar', 'Coffee Cafe', 'Coffeehouse']
```

#### Normalize Multiple Tags
```javascript
// Clean up and normalize a tag array
const dirtyTags = ['Hiking', 'Trekking', 'Trekking', 'Coffee Shop', 'Café'];
const clean = normalizeTags(dirtyTags);
// Returns: ['Hiking', 'Hiking', 'Hiking', 'Coffee Shop', 'Coffee Shop']
```

### Available Tag Aliases

- **Activity Tags**: Hiking ↔ Trekking, Walking, Backpacking
- **Dining Tags**: Coffee Shop ↔ Café, Espresso Bar, Coffeehouse
- **Budget Tags**: Budget-Friendly ↔ Affordable, Inexpensive, Value
- **Pricing Tags**: Upscale ↔ Fine Dining, Premium, Luxury
- **Family Tags**: Family-Friendly ↔ Kid-Friendly, Family Place
- **Accessibility**: Wheelchair-Accessible ↔ Accessible, ADA-Compliant
- **Experience**: Hidden Gem ↔ Secret Spot, Off-Beaten Path, Lesser Known
- **Quality**: Photography-Worthy ↔ Instagrammable, Photo Op, Picture Perfect
- **Local**: Local Favorite ↔ Local Hotspot, Where Locals Go
- **Terrain**: Mountain ↔ Alpine, Peak, Summit, Highland
- **Wildlife**: Birding ↔ Bird Watching, Bird Spotting
- **Difficulty**: Easy ↔ Beginner-Friendly, Simple, Gentle
- **Mood**: Relaxing ↔ Peaceful, Calm, Tranquil, Serene
- **Season**: Year-Round Destination ↔ Open Year-Round, All-Season

---

## 2. CUSTOM TAG REGISTRY

Create and manage user-defined tags with validation and custom styling.

### Creating Custom Tags

```javascript
// Access the global registry
const registry = window.customTagRegistry;

// Create a custom tag
const result = registry.createCustomTag('Wine Tasting', {
  icon: '🍷',
  bg: '#fecaca',
  color: '#7c2d12',
  border: '#fca5a5',
  category: 'Experiences',
  description: 'Wine tasting and vineyard visits'
});

if (result.success) {
  console.log('Custom tag created:', result.tag);
} else {
  console.log('Validation errors:', result.errors);
}
```

### Tag Validation Rules

- **Minimum Length**: 2 characters
- **Maximum Length**: 50 characters
- **Allowed Characters**: `a-zA-Z0-9 \-&.,'()`
- **Reserved Names**: 'All', 'None', 'Custom', 'System', 'Admin'

### Validation Example

```javascript
// Validation happens automatically
registry.createCustomTag('X'); // Error: too short
registry.createCustomTag('This tag is way too long for the system to handle'); // Error: too long
registry.createCustomTag('Tag@#$%'); // Error: invalid characters
registry.createCustomTag('Custom'); // Error: reserved name
```

### Managing Custom Tags

```javascript
// Get a custom tag
const tag = registry.getCustomTag('Wine Tasting');

// Update a custom tag
registry.updateCustomTag('Wine Tasting', {
  icon: '🍾',
  description: 'Wine tasting venues and experiences'
});

// Delete a custom tag
registry.deleteCustomTag('Wine Tasting');

// Get all custom tags
const allCustom = registry.getAllCustomTags();

// Get custom tags by category
const experiences = registry.getCustomTagsByCategory('Experiences');

// Get statistics
const stats = registry.getStats();
console.log(`Total custom tags: ${stats.total}`);
console.log(`Most used: ${stats.mostUsed[0].name}`);
console.log(`Least used (unused): ${stats.leastUsed.length}`);
```

### Example Custom Tags

```javascript
// Modern café style
registry.createCustomTag('Third Wave Coffee', {
  icon: '☕',
  bg: '#fed7aa',
  color: '#7c2d12',
  category: 'Coffee Culture'
});

// Adventure-specific
registry.createCustomTag('Rock Scrambling', {
  icon: '🧗',
  bg: '#fed7aa',
  category: 'Adventure'
});

// Food scenes
registry.createCustomTag('Ramen House', {
  icon: '🍜',
  bg: '#f3e8ff',
  category: 'Dining'
});

// Specialty experiences
registry.createCustomTag('Farmers Market', {
  icon: '🌽',
  bg: '#dcfce7',
  category: 'Shopping'
});
```

---

## 3. SEARCH & FILTERING ENGINE

Advanced search with multiple matching strategies.

### Full-Text Search

```javascript
const engine = window.tagSearchEngine;
const allTags = Object.values(TAG_CONFIG);

// Search with ranked results
const results = engine.fullTextSearch('hiking', allTags);
// Results: [
//   { tag: 'Hiking', score: 1.0, matchType: 'exact' },
//   { tag: 'Hiking Boots Recommended', score: 0.7, matchType: 'substring' }
// ]
```

### Fuzzy Search (Typo Tolerant)

```javascript
// Find tags despite typos
const fuzzyResults = engine.fuzzySearch('coffe shop', allTags);
// Returns 'Coffee Shop' even though you typed 'coffe'

const typoResults = engine.fuzzySearch('accesible', allTags);
// Returns 'Accessible', 'Wheelchair-Accessible', etc.
```

### Autocomplete Suggestions

```javascript
// Get suggestions while typing
const suggestions = engine.autocomplete('fam', allTags, 10);
// Returns: [
//   { tag: 'Family-Friendly', displayName: 'Family-Friendly', icon: '👨‍👩‍👧' },
//   { tag: 'Farmers Market', displayName: 'Farmers Market', icon: '🌽' }
// ]
```

### Filter by Criteria

```javascript
// Filter tags
const filtered = engine.filterTags(TAG_CONFIG, {
  category: 'Activities',
  minUsage: 5,
  sortByUsage: true,
  excludeDeprecated: true
});

// Filter with custom patterns
const filtered2 = engine.filterTags(TAG_CONFIG, {
  namePattern: '^Multi-',  // Tags starting with 'Multi-'
  since: '2026-01-01'      // Tags created since date
});
```

### Search History

```javascript
// Track searches
engine.addToHistory('hiking');
engine.addToHistory('family friendly');

// Get recent searches
const history = engine.getHistory(5);
// Returns: ['family friendly', 'hiking']

// Clear history
engine.clearHistory();
```

---

## 4. CONFLICT DETECTION

Identify contradictory or unusual tag combinations.

### Detecting Conflicts

```javascript
const detector = window.tagConflictDetector;

const tags = ['Easy', 'Challenging', 'Family-Friendly', 'Budget-Friendly', 'Upscale'];

// Full validation
const validation = detector.validate(tags);
// Result:
// {
//   valid: false,
//   conflictCount: 2,
//   conflictCount: 1,
//   conflicts: [
//     { tag1: 'Easy', tag2: 'Challenging', severity: 'conflict' },
//     { tag1: 'Budget-Friendly', tag2: 'Upscale', severity: 'conflict' }
//   ],
//   warnings: [
//     { tag1: 'Upscale', tag2: 'Casual', severity: 'warning' }
//   ],
//   summary: '2 conflict(s) found'
// }
```

### Get Fix Suggestions

```javascript
const suggestions = detector.suggestFixes(['Easy', 'Challenging']);
// Returns:
// [
//   {
//     conflict: 'Easy ↔ Challenging',
//     options: [
//       'Remove "Easy" and keep "Challenging"',
//       'Remove "Challenging" and keep "Easy"',
//       'Review the location data - one tag may be incorrect'
//     ]
//   }
// ]
```

### Defined Conflicts

#### Hard Conflicts (Mutually Exclusive)
- Easy ↔ Challenging, Advanced, Difficult, Strenuous
- Budget-Friendly ↔ Upscale, Fine Dining, Premium
- Popular/Crowded ↔ Hidden Gem, Off the Radar, Secret
- Free ↔ Paid Admission
- Romantic ↔ Adults Only, Mature Content (if exists)
- Summer Destination ↔ Winter Activity, Cold Weather
- Wheelchair-Accessible ↔ Steep Terrain, Technical Rocks

#### Soft Warnings (Usually Separate)
- Upscale + Casual Dining (verify if it's high-end casual)
- Family-Friendly + Late Night (verify if kid-friendly at night)
- Photography-Worthy + Hidden Gem (hard to photo if truly hidden)
- Wheelchair-Accessible + Steep Climb (verify accessibility claim)

---

## 5. SMART TAG DEDUPLICATION

Find and consolidate duplicate and near-duplicate tags.

### Analyze Tags for Duplicates

```javascript
const dedup = window.tagDeduplicator;

const tags = [
  'Hiking', 'hiking', 'HIKING',
  'Coffee Shop', 'coffee shop',
  'Hiking', 'Trekking',
  'Photography-Worthy', 'Instagrammable'
];

// Comprehensive analysis
const analysis = dedup.analyze(tags);
// Result:
// {
//   originalCount: 8,
//   uniqueCount: 5,
//   duplicates: [
//     { primary: 'Hiking', duplicate: 'Trekking', similarity: 85 }
//   ],
//   cassingVariants: [
//     { variants: ['Hiking', 'hiking', 'HIKING'], count: 3 },
//     { variants: ['Coffee Shop', 'coffee shop'], count: 2 }
//   ],
//   spacingVariants: [],
//   aliasGroups: [
//     { primary: 'Hiking', aliases: ['Trekking'], count: 1 },
//     { primary: 'Photography-Worthy', aliases: ['Instagrammable'], count: 1 }
//   ],
//   suggestions: [
//     'Standardize to: Hiking',
//     'Standardize to: Coffee Shop',
//     'Merge Instagrammable into Photography-Worthy'
//   ],
//   summary: {
//     hasDuplicates: true,
//     hasVariants: true,
//     hasAliases: true,
//     possibleReductions: 6,
//     recommendation: '6 deduplication action(s) available'
//   }
// }
```

### Deduplicate Tags

```javascript
// Clean up tags automatically
const cleanTags = dedup.deduplicate(tags);
// Returns: ['Hiking', 'Coffee Shop', 'Photography-Worthy']

// The deduplicator:
// 1. Fixes spacing (multiple spaces → single space)
// 2. Standardizes casing (Hiking ← hiking ← HIKING)
// 3. Resolves aliases (Trekking → Hiking, Instagrammable → Photography-Worthy)
// 4. Removes exact duplicates
```

### Find Specific Issues

```javascript
// Find only near-duplicates
const duplicates = dedup.findNearDuplicates(tags, 0.75);
// Returns tags 75%+ similar

// Find casing variations
const casings = dedup.findCasingVariants(tags);
// Returns: { variants: ['Coffee', 'coffee', 'COFFEE'], normalized: 'coffee' }

// Find spacing variations
const spacing = dedup.findSpacingVariants(tags);
// Returns tags with inconsistent spacing

// Check for alias groups
// (done within analyze())
```

### Statistics

```javascript
const stats = dedup.getStats();
// Returns:
// {
//   buffer: 5,
//   pendingActions: 2,
//   completedActions: 3,
//   recentActions: [...]
// }
```

---

## Integration Examples

### Complete Tag Management Workflow

```javascript
// 1. Search for existing tags
const searchResults = window.tagSearchEngine.fullTextSearch('café', Object.values(TAG_CONFIG));

// 2. Normalize if needed
const normalized = normalizeTags(['Café', 'Coffee Shop', 'Hiking']);

// 3. Check for conflicts
const conflicts = window.tagConflictDetector.validate(['Easy', 'Challenging', 'Family-Friendly']);
if (!conflicts.valid) {
  console.log('Fix conflicts:', conflicts.issues);
}

// 4. Deduplicate
const clean = window.tagDeduplicator.deduplicate(normalized);

// 5. Add to location
window.tagManager.setTagsForPlace('location-123', clean);
```

### Creating Curated Tag Collections

```javascript
const registry = window.customTagRegistry;

// Create a themed collection
const hikingTags = [
  'Hiking',
  'Mountain',
  'Challenging',
  'Scenic',
  'Photography-Worthy'
];

// Enhance with custom tags
registry.createCustomTag('High Altitude Hiking', {
  category: 'Hiking',
  description: 'Above 8000 feet elevation gain'
});

registry.createCustomTag('Wildflower Trail', {
  category: 'Hiking',
  description: 'Spring or summer bloom season'
});
```

### Bulk Tag Cleanup

```javascript
// Get all tags for a location
const locationTags = window.tagManager.getTagsForPlace('location-123');

// Analyze for issues
const analysis = window.tagDeduplicator.analyze(locationTags);

// Check for conflicts
const conflicts = window.tagConflictDetector.detectConflicts(locationTags);

// Clean and deduplicate
const cleaned = window.tagDeduplicator.deduplicate(locationTags);

// Update location
window.tagManager.setTagsForPlace('location-123', cleaned);

console.log(`Cleaned ${locationTags.length} tags → ${cleaned.length} unique tags`);
console.log(`Found ${analysis.duplicates.length} near-duplicates`);
console.log(`Found ${conflicts.length} conflicts`);
```

### Advanced Filtering

```javascript
// Get all activity tags that are easy
const activityTags = TAG_HIERARCHY.getTagsInCategory('Activities');
const easyActivities = activityTags.filter(t => {
  const conflicts = window.tagConflictDetector.detectConflicts([t, 'Easy']);
  return conflicts.length === 0;
});

// Find trending custom tags
const customTags = window.customTagRegistry.getAllCustomTags();
const trending = customTags
  .filter(t => (t.usageCount || 0) > 5)
  .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
```

---

## Console Commands Reference

### Quick Commands

```javascript
// Resolve aliases
resolveTagAlias('Café');                    // 'Coffee Shop'

// Get aliases
getTagAliases('Hiking');                    // Array of aliases

// Search tags
tagSearchEngine.fullTextSearch('hik');      // Search results

// Create custom tag
customTagRegistry.createCustomTag('Winter Hike', {
  icon: '❄️',
  category: 'Activities'
});

// Check conflicts
tagConflictDetector.validate(['Easy', 'Challenging']); // Conflict report

// Deduplicate
tagDeduplicator.deduplicate(['Tag', 'tag', 'Tag']); // ['Tag']

// Add tag to location
tagManager.addTagToPlace('location-123', 'Hiking');

// Get tag stats
tagManager.getTagStats();                   // Usage count per tag
```

---

## Best Practices

### ✅ DO:
- Use the search engine for user-facing tag selection
- Normalize user input tags before adding to locations
- Check conflicts before batch-adding tags
- Use custom tags for venue-specific categories
- Deduplicate tags periodically
- Leverage aliases to unify user input variations

### ❌ DON'T:
- Bypass conflict detection for "special cases"
- Create custom tags that duplicate built-in tags
- Mix conflicting tags without documenting why
- Leave spacing or casing inconsistencies
- Create custom tags with very similar names

---

## Migration Guide (v7.0.141 → v7.0.200)

### Automatic:
- Tag aliases are automatically resolved when loading tags
- No changes needed to existing tag references

### Optional Enhancements:
1. **Run tag cleanup** on existing locations:
   ```javascript
   const allTags = window.tagManager.getAllTags();
   const cleaned = window.tagDeduplicator.deduplicate(allTags);
   ```

2. **Create custom tags** for venue-specific categories

3. **Set up alias mappings** for user-specific variations

4. **Configure conflict rules** for your domain

---

## Performance Notes

- **Fuzzy matching**: O(n*m) where n=tags, m=query length (capped at 50 chars)
- **Deduplication**: O(n²) similarity check (acceptable for < 1000 tags)
- **Conflict detection**: O(n) linear scan
- **Full-text search**: O(n) single pass

All operations complete in < 100ms for typical tag sets (< 500 tags).

---

## Debugging

### Enable Detailed Logging

```javascript
// Tag resolution tracing
function traceTagResolution(tag) {
  console.log(`Original: ${tag}`);
  console.log(`Canonical: ${resolveTagAlias(tag)}`);
  console.log(`Aliases: ${getTagAliases(tag).join(', ')}`);
}

// Conflict analysis
function analyzeTagSet(tags) {
  console.log('=== Tag Analysis ===');
  console.table(window.tagConflictDetector.validate(tags));
  console.table(window.tagDeduplicator.analyze(tags));
}
```

---

## API Summary

### Functions
- `resolveTagAlias(tagName)` → canonical tag name
- `getTagAliases(tagName)` → array of alias tags  
- `normalizeTags(tags)` → deduplicated array

### Classes
- `TagManager` - Core tag operations
- `CustomTagRegistry` - Custom tag management
- `TagSearchEngine` - Search & filtering
- `TagConflictDetector` - Conflict analysis
- `TagDeduplicator` - Deduplication & cleaning

### Global Instances
- `window.tagManager`
- `window.customTagRegistry`
- `window.tagSearchEngine`
- `window.tagConflictDetector`
- `window.tagDeduplicator`

---

## Version History

- **v7.0.200** (Apr 24, 2026) - Added advanced features
- **v7.0.141** (Mar 15, 2026) - Consolidated core system
- **v6.x.x** - Previous versions

