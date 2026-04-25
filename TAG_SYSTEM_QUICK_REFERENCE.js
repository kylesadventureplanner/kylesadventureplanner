/**
 * TAG SYSTEM v7.0.200 - QUICK REFERENCE & DEMO
 * ============================================================================
 */

// ============================================================================
// QUICK START - MOST COMMON OPERATIONS
// ============================================================================

console.log('=== QUICK START DEMO ===\n');

// 1. RESOLVE TAG ALIASES (Normalize Synonyms)
console.log('1️⃣ Tag Aliases - Normalize Similar Tags:');
console.log('  resolveTagAlias("Café") →', resolveTagAlias('Coffee'));
console.log('  resolveTagAlias("Trekking") →', resolveTagAlias('Trekking'));
console.log('  getTagAliases("Hiking") →', getTagAliases('Hiking'));

// 2. CREATE CUSTOM TAGS
console.log('\n2️⃣ Custom Tags - Create User-Defined Tags:');
const customResult = window.customTagRegistry.createCustomTag('Yoga Studio', {
  icon: '🧘',
  bg: '#f3e8ff',
  color: '#5b21b6',
  category: 'Wellness',
  description: 'Yoga and mindfulness studios'
});
console.log('  Created custom tag:', customResult.success ? '✅' : '❌', customResult.tag?.name);

// 3. SEARCH FOR TAGS
console.log('\n3️⃣ Search & Filtering - Find Tags:');
const searchResults = window.tagSearchEngine.fullTextSearch('fam', Object.values(TAG_CONFIG));
console.log('  Search "fam":', searchResults.slice(0, 3).map(r => r.tag).join(', '));

// 4. AUTOCOMPLETE SUGGESTIONS
console.log('\n4️⃣ Autocomplete - Smart Suggestions:');
const suggestions = window.tagSearchEngine.autocomplete('hik', Object.values(TAG_CONFIG), 5);
console.log('  Suggest "hik":', suggestions.map(s => s.tag).join(', '));

// 5. CHECK FOR CONFLICTS
console.log('\n5️⃣ Conflict Detection - Find Contradictions:');
const conflictTest = ['Easy', 'Challenging', 'Budget-Friendly', 'Upscale'];
const conflicts = window.tagConflictDetector.validate(conflictTest);
console.log('  Tags:', conflictTest.join(', '));
console.log('  Conflicts found:', conflicts.conflictCount);
conflicts.conflicts.slice(0, 2).forEach(c => {
  console.log(`    ⚠️ "${c.tag1}" ↔ "${c.tag2}"`);
});

// 6. DEDUPLICATE TAGS
console.log('\n6️⃣ Deduplication - Clean Up Tags:');
const messyTags = ['Hiking', 'hiking', 'HIKING', 'Trekking', 'Coffee Shop', 'coffee shop'];
const cleaned = window.tagDeduplicator.deduplicate(messyTags);
console.log('  Before:', messyTags.length, 'tags');
console.log('  After:', cleaned.length, 'unique tags');
console.log('  Result:', cleaned.join(', '));

// ============================================================================
// ADVANCED OPERATIONS
// ============================================================================

console.log('\n\n=== ADVANCED OPERATIONS ===\n');

// TAG ALIAS MAPPING
console.log('📚 Available Tag Aliases:');
const sampleAliases = ['Hiking', 'Coffee Shop', 'Budget-Friendly', 'Photography-Worthy'];
sampleAliases.forEach(tag => {
  const aliases = getTagAliases(tag);
  if (aliases.length > 0) {
    console.log(`  ${tag} → [${aliases.slice(0, 2).join(', ')} ...]`);
  }
});

// CUSTOM TAG MANAGEMENT
console.log('\n🏷️ Custom Tag Operations:');
const registry = window.customTagRegistry;

// Get all custom tags
const allCustom = registry.getAllCustomTags();
console.log(`  Total custom tags: ${allCustom.length}`);

// Get stats
const stats = registry.getStats();
console.log(`  Active tags: ${stats.active}, Deprecated: ${stats.deprecated}`);

// SEARCH OPERATIONS
console.log('\n🔍 Advanced Search:');
const engine = window.tagSearchEngine;

// Full-text search with ranking
const allTags = Object.values(TAG_CONFIG);
const ftsResults = engine.fullTextSearch('park', allTags);
console.log(`  Full-text search "park": ${ftsResults.length} results`);

// Fuzzy search for typos
const fuzzyResults = engine.fuzzySearch('parkng', allTags, 2);
console.log(`  Fuzzy search "parkng" (typo): ${fuzzyResults.length} results`);

// Filter by category
const filtered = engine.filterTags(TAG_CONFIG, {
  category: 'Activities',
  sortByUsage: true,
  excludeDeprecated: true
});
console.log(`  Filtered by "Activities": ${Object.keys(filtered).length} tags`);

// CONFLICT RESOLUTION
console.log('\n⚠️ Conflict Detection:');
const detector = window.tagConflictDetector;

const testTags = ['Easy', 'Relaxing', 'Family-Friendly', 'Budget-Friendly', 'Upscale'];
const validation = detector.validate(testTags);
console.log(`  Validating: ${testTags.join(', ')}`);
console.log(`  Valid: ${validation.valid}`);
console.log(`  Issues: ${validation.issues.length}`);

// Get suggestions
const suggestions_fix = detector.suggestFixes(testTags);
console.log(`  Fix suggestions: ${suggestions_fix.length}`);

// DEDUPLICATION ANALYSIS
console.log('\n🧹 Deduplication Analysis:');
const dedup = window.tagDeduplicator;

const messyData = [
  'Hiking', 'hiking', 'HIKING',
  'Photography-Worthy', 'Instagrammable',
  'Coffee Shop', 'Coffee  Shop',
  'Budget-Friendly', 'Budget Friendly'
];

const analysis = dedup.analyze(messyData);
console.log(`  Original: ${messyData.length} tags`);
console.log(`  Unique: ${analysis.uniqueCount} tags`);
console.log(`  Near-duplicates: ${analysis.duplicates.length}`);
console.log(`  Casing variants: ${analysis.cassingVariants.length}`);
console.log(`  Spacing variants: ${analysis.spacingVariants.length}`);
console.log(`  Alias groups: ${analysis.aliasGroups.length}`);

// ============================================================================
// CONSOLE HELPER FUNCTIONS
// ============================================================================

console.log('\n\n=== HELPER FUNCTIONS FOR CONSOLE ===\n');

// Helper: Quick tag validation
window.quickValidateTag = function(tags) {
  console.log('🔍 Tag Validation Report');
  console.log('─'.repeat(50));

  const validation = window.tagConflictDetector.validate(tags);
  console.log(`Tags: ${tags.join(', ')}`);
  console.log(`Valid: ${validation.valid ? '✅' : '❌'}`);

  if (validation.issues.length > 0) {
    console.log('\nIssues:');
    validation.issues.forEach(issue => {
      console.log(`  ⚠️ ${issue.tag1} ↔ ${issue.tag2}`);
      console.log(`     ${issue.message}`);
    });
  }

  const analysis = window.tagDeduplicator.analyze(tags);
  if (analysis.suggestions.length > 0) {
    console.log('\nSuggestions:');
    analysis.suggestions.forEach(s => console.log(`  → ${s}`));
  }
};

// Helper: Create and test custom tag
window.createAndTest = function(name, config = {}) {
  const result = window.customTagRegistry.createCustomTag(name, config);
  if (result.success) {
    console.log(`✅ Custom tag "${name}" created successfully`);
    console.log('   Config:', result.tag);
  } else {
    console.log(`❌ Failed to create "${name}"`);
    console.log('   Errors:', result.errors);
  }
  return result;
};

// Helper: Search and analyze
window.searchAndAnalyze = function(query) {
  console.log(`🔍 Search & Analysis: "${query}"`);
  console.log('─'.repeat(50));

  const results = window.tagSearchEngine.fullTextSearch(
    query,
    Object.values(TAG_CONFIG)
  );

  console.log(`\nFull-text matches: ${results.length}`);
  results.slice(0, 5).forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.tag} (${Math.round(r.score * 100)}%)`);
  });

  const fuzzy = window.tagSearchEngine.fuzzySearch(query, Object.values(TAG_CONFIG), 2);
  console.log(`\nFuzzy matches: ${fuzzy.length}`);
};

// Helper: Get all conflicts
window.showAllConflicts = function() {
  console.log('⚠️ All defined tag conflicts:');
  console.log('─'.repeat(50));

  const conflicts = window.tagConflictDetector.conflicts;
  let count = 0;

  for (const [tag, conflicting] of Object.entries(conflicts)) {
    console.log(`\n${tag}:`);
    conflicting.forEach(c => console.log(`  ↔ ${c}`));
    count += conflicting.length;
  }

  console.log(`\nTotal conflict pairs: ${count}`);
};

console.log('✅ Helper functions available:');
console.log('  • quickValidateTag(tags)');
console.log('  • createAndTest(name, config)');
console.log('  • searchAndAnalyze(query)');
console.log('  • showAllConflicts()');

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

console.log('\n\n=== USAGE EXAMPLES ===\n');

console.log('Example 1: Normalize user-entered tags');
console.log('─'.repeat(50));
console.log(`
  const userTags = ['hiking', 'trekking', 'Café', 'coffee shop'];
  const normalized = normalizeTags(userTags);
  // Result: ['Hiking', 'Hiking', 'Coffee Shop', 'Coffee Shop']
`);

console.log('\nExample 2: Validate and clean tags before adding');
console.log('─'.repeat(50));
console.log(`
  const tags = ['Easy', 'Photography-Worthy', 'Family-Friendly', 'Budget-Friendly'];
  
  // Check for conflicts
  const validation = tagConflictDetector.validate(tags);
  if (!validation.valid) {
    console.log('Fix these conflicts:', validation.conflicts);
    return; // Don't add tags with conflicts
  }
  
  // Add to location
  tagManager.setTagsForPlace('location-123', tags);
`);

console.log('\nExample 3: Bulk cleanup with deduplication');
console.log('─'.repeat(50));
console.log(`
  const allLocations = adventuresData;
  
  for (const location of allLocations) {
    const tags = location.tags.split(',').map(t => t.trim());
    const cleaned = tagDeduplicator.deduplicate(tags);
    location.tags = cleaned.join(', ');
  }
`);

console.log('\nExample 4: Search with autocomplete');
console.log('─'.repeat(50));
console.log(`
  function onUserTypingTag(query) {
    if (query.length < 2) return;
    
    const suggestions = tagSearchEngine.autocomplete(
      query,
      Object.values(TAG_CONFIG),
      10
    );
    
    displaySuggestions(suggestions);
  }
`);

console.log('\nExample 5: Create custom tag system');
console.log('─'.repeat(50));
console.log(`
  // Custom tags for your domain
  customTagRegistry.createCustomTag('Sunset Hike', {
    icon: '🌅',
    category: 'Hiking',
    description: 'Best at sunset for views'
  });
  
  const stats = customTagRegistry.getStats();
  console.log(\`Total: \${stats.total}, Most used: \${stats.mostUsed[0].name}\`);
`);

console.log('\n✨ All systems ready!\n');

