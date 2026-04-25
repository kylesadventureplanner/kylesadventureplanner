# Tag System Integration Guide - Real-World Examples
## v7.0.200 - April 24, 2026

---

## 🎯 Integration Scenarios

This guide shows how to integrate the advanced tag system into your adventure planner application.

---

## 1. Tag Input Field with Autocomplete

### HTML
```html
<div class="tag-input-container">
  <input 
    type="text" 
    id="tagInput" 
    placeholder="Type tag name..."
    autocomplete="off">
  <div id="tagSuggestions" class="tag-suggestions"></div>
  <div id="selectedTags" class="selected-tags"></div>
</div>
```

### JavaScript
```javascript
const tagInput = document.getElementById('tagInput');
const suggestionsDiv = document.getElementById('tagSuggestions');
const selectedTagsDiv = document.getElementById('selectedTags');
const selectedTags = [];

// On input, show suggestions
tagInput.addEventListener('input', (e) => {
  const query = e.target.value.trim();
  
  if (query.length < 1) {
    suggestionsDiv.innerHTML = '';
    return;
  }
  
  // Get suggestions
  const suggestions = window.tagSearchEngine.autocomplete(
    query,
    Object.values(TAG_CONFIG),
    10
  );
  
  // Display suggestions
  suggestionsDiv.innerHTML = suggestions
    .map(s => `
      <div class="suggestion-item" data-tag="${s.tag}">
        <span>${s.icon}</span>
        <span>${s.tag}</span>
      </div>
    `)
    .join('');
  
  // Add click handlers
  suggestionsDiv.querySelectorAll('.suggestion-item').forEach(item => {
    item.addEventListener('click', () => {
      addTag(item.dataset.tag);
      tagInput.value = '';
      suggestionsDiv.innerHTML = '';
    });
  });
});

// Add tag to selection
function addTag(tag) {
  // Resolve alias
  const canonical = resolveTagAlias(tag);
  
  // Check if already selected
  if (selectedTags.includes(canonical)) {
    alert(`"${canonical}" already selected`);
    return;
  }
  
  // Check for conflicts
  const validation = window.tagConflictDetector.validate([...selectedTags, canonical]);
  if (!validation.valid) {
    const conflicts = validation.conflicts
      .map(c => `"${c.tag1}" conflicts with "${c.tag2}"`)
      .join('\n');
    alert(`Conflict detected:\n${conflicts}`);
    return;
  }
  
  selectedTags.push(canonical);
  renderSelectedTags();
}

// Render selected tags
function renderSelectedTags() {
  selectedTagsDiv.innerHTML = selectedTags
    .map(tag => {
      const config = getTagStyle(tag);
      return `
        <span class="tag-badge" style="
          background-color: ${config.bg};
          color: ${config.color};
          border: 1px solid ${config.border};
          padding: 4px 10px;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin: 4px;
        ">
          <span>${config.icon}</span>
          <span>${tag}</span>
          <button onclick="removeTag('${tag}')" style="
            border: none;
            background: none;
            cursor: pointer;
            padding: 0;
            margin-left: 4px;
          ">✕</button>
        </span>
      `;
    })
    .join('');
}

// Remove tag
window.removeTag = function(tag) {
  selectedTags.splice(selectedTags.indexOf(tag), 1);
  renderSelectedTags();
};
```

---

## 2. Bulk Tag Cleanup Workflow

### Scenario
You have 500 locations with inconsistent tags. Clean them all up:

```javascript
/**
 * Bulk Cleanup Workflow
 */
async function cleanupAllLocationTags() {
  console.log('🧹 Starting bulk tag cleanup...');
  
  const locations = window.adventuresData; // All your locations
  const stats = {
    processed: 0,
    cleaned: 0,
    conflicts: 0,
    duplicatesRemoved: 0,
    totalBefore: 0,
    totalAfter: 0
  };
  
  for (const location of locations) {
    try {
      // Parse existing tags
      const rawTags = String(location.tags || '')
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
      
      if (rawTags.length === 0) continue;
      
      stats.totalBefore += rawTags.length;
      
      // Step 1: Deduplicate
      const dedup = window.tagDeduplicator.deduplicate(rawTags);
      stats.duplicatesRemoved += rawTags.length - dedup.length;
      
      // Step 2: Check conflicts
      const validation = window.tagConflictDetector.validate(dedup);
      if (!validation.valid) {
        console.warn(`Location "${location.name}" has conflicts:`, validation.conflicts);
        stats.conflicts++;
        
        // Optional: Auto-fix by removing conflicting tags
        // Keep only the highest-priority tags
        const fixed = dedup.filter(t => !validation.conflicts.some(c => c.tag2 === t));
        location.tags = fixed.join(', ');
      } else {
        location.tags = dedup.join(', ');
      }
      
      stats.totalAfter += dedup.length;
      stats.cleaned++;
      
    } catch (e) {
      console.error(`Error processing "${location.name}":`, e);
    }
    
    stats.processed++;
  }
  
  // Save all changes
  console.log('💾 Saving cleaned tags...');
  if (typeof window.saveToExcel === 'function') {
    await window.saveToExcel();
  }
  
  // Report
  console.log('✅ Cleanup complete!');
  console.log('─'.repeat(50));
  console.table({
    'Locations Processed': stats.processed,
    'Locations Cleaned': stats.cleaned,
    'With Conflicts': stats.conflicts,
    'Duplicates Removed': stats.duplicatesRemoved,
    'Tags Before': stats.totalBefore,
    'Tags After': stats.totalAfter,
    'Reduction': `${Math.round((stats.totalBefore - stats.totalAfter) / stats.totalBefore * 100)}%`
  });
  
  return stats;
}

// Run cleanup
// await cleanupAllLocationTags();
```

---

## 3. Create Domain-Specific Custom Tags

### Scenario
You want to create specialized tags for different location types:

```javascript
/**
 * Setup Custom Tags for Domain
 */
function setupCustomTagSystem() {
  const registry = window.customTagRegistry;
  
  console.log('🏷️ Setting up custom tags...');
  
  // Hiking-specific tags
  const hikingTags = [
    {
      name: 'Alpine Meadows',
      icon: '🌾',
      category: 'Hiking',
      description: 'High-altitude meadows with wildflowers'
    },
    {
      name: 'Scramble Required',
      icon: '🧗',
      category: 'Hiking',
      description: 'Requires rock scrambling skills'
    },
    {
      name: 'Wildflower Bloom',
      icon: '🌸',
      category: 'Hiking',
      description: 'Spring/summer wildflower blooms'
    }
  ];
  
  // Dining-specific tags
  const diningTags = [
    {
      name: 'Farm to Table',
      icon: '🌾',
      category: 'Dining',
      description: 'Locally sourced ingredients'
    },
    {
      name: 'Chef\'s Special',
      icon: '👨‍🍳',
      category: 'Dining',
      description: 'Outstanding chef recommendations'
    },
    {
      name: 'Outdoor Seating',
      icon: '🪑',
      category: 'Dining',
      description: 'Patio or outdoor dining'
    }
  ];
  
  // Create all tags
  const allCustomTags = [...hikingTags, ...diningTags];
  const results = { success: 0, failed: 0 };
  
  for (const tagConfig of allCustomTags) {
    const result = registry.createCustomTag(tagConfig.name, tagConfig);
    if (result.success) {
      results.success++;
    } else {
      results.failed++;
      console.warn(`Failed to create "${tagConfig.name}":`, result.errors);
    }
  }
  
  console.log(`✅ Created ${results.success} custom tags`);
  console.log(`⚠️ Failed: ${results.failed}`);
  
  return results;
}

// Run setup
// setupCustomTagSystem();
```

---

## 4. Enhanced Location Editor with Tag Validation

### HTML
```html
<div class="location-editor">
  <input type="text" id="locationName" placeholder="Location name">
  <textarea id="locationDescription" placeholder="Description"></textarea>
  
  <div class="tag-section">
    <h3>Tags</h3>
    <input type="text" id="tagSearch" placeholder="Search tags...">
    <div id="tagRecommendations" class="tag-recommendations"></div>
    <div id="selectedTagsDisplay" class="selected-tags"></div>
    <div id="validationErrors" class="validation-errors"></div>
  </div>
  
  <button onclick="saveLocation()">Save Location</button>
</div>
```

### JavaScript
```javascript
let selectedTags = [];

/**
 * Enhanced location editor with tag validation
 */
function initializeLocationEditor() {
  const tagSearch = document.getElementById('tagSearch');
  const recommendations = document.getElementById('tagRecommendations');
  const errors = document.getElementById('validationErrors');
  
  // Search and display recommendations
  tagSearch.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    if (query.length < 2) {
      recommendations.innerHTML = '';
      return;
    }
    
    // Search
    const results = window.tagSearchEngine.fullTextSearch(
      query,
      Object.values(TAG_CONFIG)
    );
    
    // Display results with match type
    recommendations.innerHTML = results
      .slice(0, 10)
      .map(r => `
        <div class="tag-recommendation" data-tag="${r.tag}">
          <span class="tag-icon">${getTagStyle(r.tag).icon}</span>
          <span class="tag-name">${r.tag}</span>
          <span class="match-type">${r.matchType}</span>
          <span class="match-score">${Math.round(r.score * 100)}%</span>
        </div>
      `)
      .join('');
    
    // Add click handlers
    recommendations.querySelectorAll('.tag-recommendation').forEach(item => {
      item.addEventListener('click', () => {
        addTagToSelected(item.dataset.tag);
        tagSearch.value = '';
        recommendations.innerHTML = '';
      });
    });
  });
}

/**
 * Add tag to selection with validation
 */
function addTagToSelected(tag) {
  const canonical = resolveTagAlias(tag);
  
  // Already selected?
  if (selectedTags.includes(canonical)) return;
  
  // Check conflicts
  const testTags = [...selectedTags, canonical];
  const validation = window.tagConflictDetector.validate(testTags);
  
  selectedTags = testTags;
  
  // Update display
  renderSelectedTags();
  
  // Show validation errors if any
  const errorDiv = document.getElementById('validationErrors');
  if (!validation.valid) {
    errorDiv.innerHTML = validation.issues
      .map(issue => `
        <div class="validation-error">
          <strong>⚠️ ${issue.severity.toUpperCase()}</strong>
          <p>${issue.message}</p>
          <p>${issue.recommendation}</p>
        </div>
      `)
      .join('');
    errorDiv.style.display = 'block';
  } else {
    errorDiv.style.display = 'none';
  }
}

/**
 * Render selected tags with removal buttons
 */
function renderSelectedTags() {
  const display = document.getElementById('selectedTagsDisplay');
  display.innerHTML = selectedTags
    .map(tag => renderTagBadge(tag) + `
      <button onclick="removeFromSelected('${tag}')" class="remove-btn">✕</button>
    `)
    .join('');
}

window.removeFromSelected = function(tag) {
  selectedTags = selectedTags.filter(t => t !== tag);
  renderSelectedTags();
};

/**
 * Save location with validated tags
 */
async function saveLocation() {
  const name = document.getElementById('locationName').value.trim();
  const description = document.getElementById('locationDescription').value.trim();
  
  if (!name || !description) {
    alert('Please fill in all fields');
    return;
  }
  
  // Final validation
  const validation = window.tagConflictDetector.validate(selectedTags);
  if (!validation.valid) {
    alert('Cannot save: Please resolve tag conflicts first');
    return;
  }
  
  // Create location object
  const location = {
    name,
    description,
    tags: selectedTags.join(', '),
    createdAt: new Date().toISOString()
  };
  
  // Save to system
  console.log('💾 Saving location:', location);
  
  // TODO: Implement your save logic
  // await window.saveToExcel();
  
  alert('✅ Location saved successfully!');
}

// Initialize on page load
initializeLocationEditor();
```

---

## 5. Tag Analytics Dashboard

### JavaScript
```javascript
/**
 * Tag Analytics Dashboard
 */
class TagAnalyticsDashboard {
  constructor() {
    this.tagManager = window.tagManager;
    this.customRegistry = window.customTagRegistry;
  }
  
  /**
   * Get comprehensive tag analytics
   */
  getAnalytics() {
    const stats = this.tagManager.getTagStats();
    const customTags = this.customRegistry.getAllCustomTags();
    const hierarchyStats = this.tagManager.getHierarchyStats();
    
    return {
      standard: {
        total: Object.keys(TAG_CONFIG).length,
        used: Object.keys(stats).length,
        unused: Object.keys(TAG_CONFIG)
          .filter(t => !stats[t])
          .length,
        mostUsed: hierarchyStats.mostUsedTags.slice(0, 5),
        leastUsed: hierarchyStats.leastUsedTags.slice(0, 5)
      },
      custom: {
        total: customTags.length,
        active: customTags.filter(t => !t.deprecated).length,
        byCategory: this.countByCategory(customTags),
        mostUsed: customTags
          .filter(t => (t.usageCount || 0) > 0)
          .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
          .slice(0, 5)
      },
      categories: hierarchyStats.tagsByCategory
    };
  }
  
  /**
   * Count tags by category
   */
  countByCategory(tags) {
    const counts = {};
    tags.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }
  
  /**
   * Find unused tags
   */
  getUnusedTags() {
    const stats = this.tagManager.getTagStats();
    return Object.keys(TAG_CONFIG).filter(t => !stats[t]);
  }
  
  /**
   * Find suspicious tag combinations
   */
  findSuspiciousCombinations() {
    const conflicts = window.tagConflictDetector.conflicts;
    const stats = this.tagManager.getTagStats();
    
    const suspicious = [];
    for (const [tag, conflicts_list] of Object.entries(conflicts)) {
      for (const conflicting of conflicts_list) {
        // Find locations with both conflicting tags
        const places1 = this.tagManager.getPlacesByTag(tag);
        const places2 = this.tagManager.getPlacesByTag(conflicting);
        const both = places1.filter(p => places2.includes(p));
        
        if (both.length > 0) {
          suspicious.push({
            tag1: tag,
            tag2: conflicting,
            locations: both.length
          });
        }
      }
    }
    
    return suspicious;
  }
  
  /**
   * Generate HTML report
   */
  generateReport() {
    const analytics = this.getAnalytics();
    const unused = this.getUnusedTags();
    const suspicious = this.findSuspiciousCombinations();
    
    let html = `
      <div class="tag-analytics-report">
        <h2>📊 Tag Analytics Report</h2>
        
        <div class="section">
          <h3>Standard Tags</h3>
          <p>Total: ${analytics.standard.total} | Used: ${analytics.standard.used} | Unused: ${analytics.standard.unused}</p>
          
          <h4>Most Used</h4>
          <ul>
            ${analytics.standard.mostUsed
              .map(t => `<li>${t.tag}: ${t.count} locations</li>`)
              .join('')}
          </ul>
        </div>
        
        <div class="section">
          <h3>Custom Tags</h3>
          <p>Total: ${analytics.custom.total} | Active: ${analytics.custom.active}</p>
          
          <h4>By Category</h4>
          <ul>
            ${Object.entries(analytics.custom.byCategory)
              .map(([cat, count]) => `<li>${cat}: ${count}</li>`)
              .join('')}
          </ul>
        </div>
        
        <div class="section warning">
          <h3>⚠️ Issues Found</h3>
          <p>Unused tags: ${unused.length}</p>
          ${unused.length > 0 ? `
            <ul>
              ${unused.slice(0, 10).map(t => `<li>${t}</li>`).join('')}
            </ul>
          ` : '<p>None</p>'}
        </div>
        
        <div class="section error">
          <h3>❌ Conflicting Combinations</h3>
          <p>Found: ${suspicious.length}</p>
          ${suspicious.length > 0 ? `
            <ul>
              ${suspicious
                .map(s => `<li>"${s.tag1}" ↔ "${s.tag2}" (${s.locations} locations)</li>`)
                .join('')}
            </ul>
          ` : '<p>None</p>'}
        </div>
      </div>
    `;
    
    return html;
  }
}

// Usage
const dashboard = new TagAnalyticsDashboard();
const report = dashboard.generateReport();
// Display report somewhere: document.getElementById('report').innerHTML = report;
```

---

## 6. Batch Tag Operations

### Scenario
Apply tags to multiple locations at once:

```javascript
/**
 * Batch Tag Operations
 */

// Add same tags to multiple locations
function tagMultipleLocations(locationIds, tagsToAdd) {
  console.log(`📌 Adding ${tagsToAdd.length} tags to ${locationIds.length} locations...`);
  
  const results = {
    success: 0,
    partial: 0,
    failed: 0,
    conflicts: []
  };
  
  for (const locId of locationIds) {
    try {
      // Get existing tags
      const existing = window.tagManager.getTagsForPlace(locId);
      const testTags = [...existing, ...tagsToAdd];
      
      // Validate
      const validation = window.tagConflictDetector.validate(testTags);
      
      if (!validation.valid) {
        results.conflicts.push({
          location: locId,
          issues: validation.conflicts
        });
        results.partial++;
        continue;
      }
      
      // Add tags
      window.tagManager.addTagsToPlace(locId, tagsToAdd);
      results.success++;
      
    } catch (e) {
      console.error(`Error tagging ${locId}:`, e);
      results.failed++;
    }
  }
  
  console.log(`✅ Success: ${results.success}, ⚠️ Partial: ${results.partial}, ❌ Failed: ${results.failed}`);
  return results;
}

// Remove tags from multiple locations
function untagMultipleLocations(locationIds, tagsToRemove) {
  const results = window.tagManager.removeTagsFromBatchPlaces(locationIds, tagsToRemove);
  console.log(`Removed from ${results.successful.length} locations`);
  return results;
}

// Replace tags on multiple locations
function replaceTagsOnMultipleLocations(locationIds, oldTag, newTag) {
  const canonical = resolveTagAlias(newTag);
  let replaced = 0;
  
  for (const locId of locationIds) {
    const tags = window.tagManager.getTagsForPlace(locId);
    const idx = tags.indexOf(oldTag);
    
    if (idx >= 0) {
      tags[idx] = canonical;
      window.tagManager.setTagsForPlace(locId, tags);
      replaced++;
    }
  }
  
  console.log(`🔄 Replaced "${oldTag}" with "${canonical}" on ${replaced} locations`);
  return replaced;
}

// Example usage:
// tagMultipleLocations(['loc1', 'loc2', 'loc3'], ['Hiking', 'Photography-Worthy']);
// untagMultipleLocations(['loc1', 'loc2'], ['Touristy']);
// replaceTagsOnMultipleLocations(['loc1', 'loc2'], 'Easy', 'Beginner-Friendly');
```

---

## 7. Tag Export & Backup

### Scenario
Export tags for backup or sharing:

```javascript
/**
 * Tag Export & Backup System
 */

/**
 * Export all tags to JSON
 */
function exportAllTags() {
  const tagData = {
    exportDate: new Date().toISOString(),
    version: '7.0.200',
    data: {
      locationTags: JSON.parse(window.tagManager.exportTags()),
      customTags: window.customTagRegistry.getAllCustomTags(),
      aliases: TAG_ALIASES,
      config: TAG_CONFIG
    }
  };
  
  return JSON.stringify(tagData, null, 2);
}

/**
 * Download tags to file
 */
function downloadTagsBackup() {
  const data = exportAllTags();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tags-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import tags from JSON
 */
async function importTagsFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Import location tags
        const tagImport = window.tagManager.importTags(JSON.stringify(data.data.locationTags));
        
        // Import custom tags
        for (const tag of data.data.customTags) {
          window.customTagRegistry.createCustomTag(tag.name, tag);
        }
        
        resolve({
          success: true,
          imported: {
            locations: tagImport.count,
            customTags: data.data.customTags.length
          }
        });
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsText(file);
  });
}

// Usage:
// downloadTagsBackup();
//
// File input handler:
// document.getElementById('importFile').addEventListener('change', async (e) => {
//   const result = await importTagsFromFile(e.target.files[0]);
//   console.log('Import complete:', result);
// });
```

---

## Implementation Checklist

- [ ] Review documentation: `ADVANCED_TAG_SYSTEM_FEATURES.md`
- [ ] Test quick reference: `TAG_SYSTEM_QUICK_REFERENCE.js`
- [ ] Implement tag input with autocomplete
- [ ] Run bulk cleanup on existing locations
- [ ] Set up custom tags for your domain
- [ ] Add conflict validation to location editor
- [ ] Create analytics dashboard
- [ ] Implement batch operations handlers
- [ ] Set up backup/export functionality
- [ ] Train users on new features

---

## Support & Questions

For detailed API reference, see `ADVANCED_TAG_SYSTEM_FEATURES.md`

All instances are globally available:
```javascript
window.tagManager
window.customTagRegistry
window.tagSearchEngine
window.tagConflictDetector
window.tagDeduplicator
```

