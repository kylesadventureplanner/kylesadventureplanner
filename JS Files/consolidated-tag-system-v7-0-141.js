/**
 * CONSOLIDATED TAG MANAGEMENT SYSTEM v7.0.141
 * =============================================
 *
 * A unified, comprehensive tag management system that consolidates all tag-related
 * functionality from multiple files into a single, maintainable module.
 *
 * INCLUDES:
 * - Tag Configuration & Styling
 * - Tag Hierarchy System
 * - Tag Manager (Core Operations)
 * - Tag Hierarchy UI
 * - Tag Automation
 * - Tag Button Injector
 * - Tag UI Manager
 * - Tag Aliases & Synonyms
 * - Custom Tag Support
 * - Search & Filtering
 * - Tag Conflict Detection
 * - Tag Deduplication
 *
 * Version: 7.0.200 (Enhanced with Advanced Features)
 * Date: April 24, 2026
 * Created: Consolidated from 9 separate tag files + Advanced Systems
 */

console.log('🏷️ Consolidated Tag Management System v7.0.200 Loading...');

// ============================================================
// SECTION 1: TAG CONFIGURATION & STYLING
// ============================================================

const TAG_CONFIG = {
  // ========== ACTIVITY TAGS ==========
  'Hiking': {
    icon: '🥾',
    bg: '#dcfce7',
    color: '#166534',
    border: '#86efac',
    category: 'Activities',
    subcategory: 'Land Sports'
  },
  'Waterfall': {
    icon: '💧',
    bg: '#e0f2fe',
    color: '#0c4a6e',
    border: '#7dd3fc'
  },
  'Biking': {
    icon: '🚴',
    bg: '#fef3c7',
    color: '#78350f',
    border: '#fcd34d'
  },
  'Kayaking': {
    icon: '🛶',
    bg: '#cce5ff',
    color: '#0c2d57',
    border: '#93c5fd'
  },
  'Fishing': {
    icon: '🎣',
    bg: '#e0e7ff',
    color: '#312e81',
    border: '#c7d2fe'
  },
  'Camping': {
    icon: '⛺',
    bg: '#fecaca',
    color: '#7c2d12',
    border: '#fca5a5'
  },
  'Birding': {
    icon: '🦅',
    bg: '#f3e8ff',
    color: '#5b21b6',
    border: '#e9d5ff'
  },
  'Rock Climbing': {
    icon: '🧗',
    bg: '#fed7aa',
    color: '#7c2d12',
    border: '#fdba74'
  },
  'Skiing': {
    icon: '⛷️',
    bg: '#e0f2fe',
    color: '#0c4a6e',
    border: '#7dd3fc'
  },

  // ========== LOCATION TAGS ==========
  'Park': {
    icon: '🌳',
    bg: '#dcfce7',
    color: '#166534',
    border: '#86efac'
  },
  'Greenway': {
    icon: '🛤️',
    bg: '#dcfce7',
    color: '#166534',
    border: '#86efac'
  },
  'Parking Location': {
    icon: '🅿️',
    bg: '#f3e8ff',
    color: '#5b21b6',
    border: '#e9d5ff'
  },
  'Dog Walk Location': {
    icon: '🐕',
    bg: '#fecaca',
    color: '#7c2d12',
    border: '#fca5a5'
  },
  'Biking Location': {
    icon: '🚴‍♂️',
    bg: '#fef3c7',
    color: '#78350f',
    border: '#fcd34d'
  },
  'Birding Location': {
    icon: '🦜',
    bg: '#f3e8ff',
    color: '#5b21b6',
    border: '#e9d5ff'
  },

  // ========== FOOD & DINING TAGS ==========
  'Coffee Shop': {
    icon: '☕',
    bg: '#fed7aa',
    color: '#7c2d12',
    border: '#fdba74'
  },
  'Bakery': {
    icon: '🥐',
    bg: '#fed7aa',
    color: '#7c2d12',
    border: '#fdba74'
  },
  'Diner': {
    icon: '🍽️',
    bg: '#fecaca',
    color: '#7c2d12',
    border: '#fca5a5'
  },
  'Breakfast Joint': {
    icon: '🥞',
    bg: '#fed7aa',
    color: '#7c2d12',
    border: '#fdba74'
  },
  'BBQ': {
    icon: '🍖',
    bg: '#fecaca',
    color: '#7c2d12',
    border: '#fca5a5'
  },
  'Pub': {
    icon: '🍺',
    bg: '#cce5ff',
    color: '#0c2d57',
    border: '#93c5fd'
  },
  'Sandwiches': {
    icon: '🥪',
    bg: '#fecaca',
    color: '#7c2d12',
    border: '#fca5a5'
  },
  'Pho': {
    icon: '🍜',
    bg: '#dcfce7',
    color: '#166534',
    border: '#86efac'
  },
  'Sushi': {
    icon: '🍣',
    bg: '#cce5ff',
    color: '#0c2d57',
    border: '#93c5fd'
  },
  'Ramen': {
    icon: '🍜',
    bg: '#f3e8ff',
    color: '#5b21b6',
    border: '#e9d5ff'
  },
  'Indian Food': {
    icon: '🍛',
    bg: '#fef3c7',
    color: '#78350f',
    border: '#fcd34d'
  },
  'Thai Food': {
    icon: '🌶️',
    bg: '#fecaca',
    color: '#7c2d12',
    border: '#fca5a5'
  },
  'German Food': {
    icon: '🍖',
    bg: '#fed7aa',
    color: '#7c2d12',
    border: '#fdba74'
  },
  'Korean BBQ': {
    icon: '🔥',
    bg: '#fecaca',
    color: '#7c2d12',
    border: '#fca5a5'
  },
  'Korean Hot Pot': {
    icon: '🍲',
    bg: '#fecaca',
    color: '#7c2d12',
    border: '#fca5a5'
  },
  'Chinese Food': {
    icon: '🥡',
    bg: '#f3e8ff',
    color: '#5b21b6',
    border: '#e9d5ff'
  },
  'Seafood Joint': {
    icon: '🦞',
    bg: '#cce5ff',
    color: '#0c2d57',
    border: '#93c5fd'
  },
  'Comfort Food': {
    icon: '🥘',
    bg: '#fed7aa',
    color: '#7c2d12',
    border: '#fdba74'
  },
  'Fruit Veggie Stand': {
    icon: '🥕',
    bg: '#dcfce7',
    color: '#166534',
    border: '#86efac'
  },
  'Farmers Market': {
    icon: '🌽',
    bg: '#dcfce7',
    color: '#166534',
    border: '#86efac'
  },

  // ========== SHOPPING TAGS ==========
  'Shopping': {
    icon: '🛍️',
    bg: '#f3e8ff',
    color: '#5b21b6',
    border: '#e9d5ff'
  },
  'Clothing Store': {
    icon: '👕',
    bg: '#f3e8ff',
    color: '#5b21b6',
    border: '#e9d5ff'
  },
  'Outdoor Store': {
    icon: '⛺',
    bg: '#dcfce7',
    color: '#166534',
    border: '#86efac'
  },
  'Grocery Store': {
    icon: '🛒',
    bg: '#e0f2fe',
    color: '#0c4a6e',
    border: '#7dd3fc'
  },
  'Local Shop': {
    icon: '🏪',
    bg: '#f3e8ff',
    color: '#5b21b6',
    border: '#e9d5ff'
  },
  'Art Store': {
    icon: '🎨',
    bg: '#fecaca',
    color: '#7c2d12',
    border: '#fca5a5'
  },
  'Thrift Store': {
    icon: '♻️',
    bg: '#dcfce7',
    color: '#166534',
    border: '#86efac'
  },

  // ========== BEVERAGE TAGS ==========
  'NA Beer Sold Here': {
    icon: '🍺',
    bg: '#cce5ff',
    color: '#0c2d57',
    border: '#93c5fd'
  },

  // ========== DEAL/HUNTING TAGS ==========
  'Deal Hunting': {
    icon: '🎯',
    bg: '#fef3c7',
    color: '#78350f',
    border: '#fcd34d'
  },
  'Local Owned': {
    icon: '❤️',
    bg: '#fecaca',
    color: '#7c2d12',
    border: '#fca5a5'
  }
};

/**
 * Get tag styling information
 */
function getTagStyle(tagName) {
  return TAG_CONFIG[tagName] || {
    icon: '🏷️',
    bg: '#e0e7ff',
    color: '#312e81',
    border: '#c7d2fe'
  };
}

/**
 * Generate HTML for a tag badge
 */
function renderTagBadge(tagName) {
  const config = getTagStyle(tagName);
  return `
    <span class="tag-badge" style="
      background-color: ${config.bg};
      color: ${config.color};
      border: 1px solid ${config.border};
      padding: 4px 10px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
    ">
      <span>${config.icon}</span>
      <span>${tagName}</span>
    </span>
  `;
}

/**
 * Get all available tags
 */
function getAllAvailableTags() {
  return Object.keys(TAG_CONFIG).sort();
}

// ============================================================
// SECTION 2: TAG HIERARCHY SYSTEM
// ============================================================

const TAG_HIERARCHY = {
  categories: {
    'Activities': {
      description: 'Physical activities and adventure types',
      icon: '🏃',
      color: '#3b82f6',
      subcategories: {
        'Water Sports': {
          tags: ['Kayaking', 'Fishing', 'Waterfall'],
          icon: '🌊'
        },
        'Land Sports': {
          tags: ['Hiking', 'Biking', 'Rock Climbing', 'Skiing'],
          icon: '⛰️'
        },
        'Outdoor Recreation': {
          tags: ['Camping', 'Birding'],
          icon: '🏕️'
        }
      }
    },

    'Locations': {
      description: 'Specific location types and venues',
      icon: '📍',
      color: '#10b981',
      subcategories: {
        'Nature Spots': {
          tags: ['Park', 'Greenway', 'Birding Location'],
          icon: '🌳'
        },
        'Practical Locations': {
          tags: ['Parking Location', 'Dog Walk Location', 'Biking Location'],
          icon: '🅿️'
        }
      }
    },

    'Food & Dining': {
      description: 'Restaurants, cafes, and food establishments',
      icon: '🍽️',
      color: '#f59e0b',
      subcategories: {
        'Coffee & Breakfast': {
          tags: ['Coffee Shop', 'Bakery', 'Breakfast Joint'],
          icon: '☕'
        },
        'Quick Service': {
          tags: ['Diner', 'Sandwiches', 'BBQ', 'Comfort Food'],
          icon: '🍔'
        },
        'Casual Dining': {
          tags: ['Pub', 'Seafood Joint', 'Farmers Market', 'Fruit Veggie Stand'],
          icon: '🍺'
        },
        'International Cuisine': {
          tags: ['Pho', 'Sushi', 'Ramen', 'Indian Food', 'Thai Food', 'German Food', 'Korean BBQ', 'Korean Hot Pot', 'Chinese Food'],
          icon: '🌍'
        }
      }
    },

    'Shopping': {
      description: 'Retail and shopping venues',
      icon: '🛍️',
      color: '#a855f7',
      subcategories: {
        'General Retail': {
          tags: ['Shopping', 'Clothing Store', 'Local Shop', 'Thrift Store'],
          icon: '🏪'
        },
        'Specialty Retail': {
          tags: ['Outdoor Store', 'Art Store'],
          icon: '🎨'
        },
        'Grocery & Market': {
          tags: ['Grocery Store'],
          icon: '🛒'
        }
      }
    },

    'Beverages': {
      description: 'Beverage venues and beer/alcohol',
      icon: '🍺',
      color: '#0ea5e9',
      subcategories: {
        'Specialty Drinks': {
          tags: ['NA Beer Sold Here'],
          icon: '🍺'
        }
      }
    },

    'Social & Discovery': {
      description: 'Tags for community, deals, and recommendations',
      icon: '❤️',
      color: '#ef4444',
      subcategories: {
        'Community': {
          tags: ['Local Owned'],
          icon: '❤️'
        },
        'Hunting & Deals': {
          tags: ['Deal Hunting'],
          icon: '🎯'
        }
      }
    }
  },

  /**
   * Get all tags in a category
   */
  getTagsInCategory(categoryName) {
    const category = this.categories[categoryName];
    if (!category) return [];
    const tags = [];
    Object.values(category.subcategories || {}).forEach(sub => {
      tags.push(...(sub.tags || []));
    });
    return tags;
  },

  /**
   * Get category info for a specific tag
   */
  getTagCategory(tagName) {
    for (const [catName, catData] of Object.entries(this.categories)) {
      for (const [subName, subData] of Object.entries(catData.subcategories || {})) {
        if (subData.tags && subData.tags.includes(tagName)) {
          return {
            category: catName,
            subcategory: subName,
            categoryIcon: catData.icon,
            subcategoryIcon: subData.icon,
            categoryColor: catData.color
          };
        }
      }
    }
    return null;
  },

  /**
   * Get sibling tags (same subcategory)
   */
  getSiblingTags(tagName) {
    const catInfo = this.getTagCategory(tagName);
    if (!catInfo) return [];
    const subcategoryTags = this.categories[catInfo.category]
      .subcategories[catInfo.subcategory].tags;
    return subcategoryTags.filter(t => t !== tagName);
  },

  /**
   * Get related tags (same category, different subcategory)
   */
  getRelatedTags(tagName) {
    const catInfo = this.getTagCategory(tagName);
    if (!catInfo) return [];
    return this.getTagsInCategory(catInfo.category)
      .filter(t => t !== tagName);
  },

  /**
   * Get all root categories
   */
  getAllCategories() {
    return Object.keys(this.categories);
  },

  /**
   * Get subcategories for a category
   */
  getSubcategories(categoryName) {
    return this.categories[categoryName]?.subcategories || {};
  },

  /**
   * Get hierarchical tree structure
   */
  getHierarchyTree() {
    const tree = {};
    for (const [catName, catData] of Object.entries(this.categories)) {
      tree[catName] = {
        icon: catData.icon,
        description: catData.description,
        color: catData.color,
        subcategories: {}
      };
      for (const [subName, subData] of Object.entries(catData.subcategories || {})) {
        tree[catName].subcategories[subName] = {
          icon: subData.icon,
          tags: subData.tags || []
        };
      }
    }
    return tree;
  },

  /**
   * Get tag affinities for recommendations
   */
  getTagAffinities(tagName) {
    const catInfo = this.getTagCategory(tagName);
    if (!catInfo) return {};
    const affinities = {};
    this.getSiblingTags(tagName).forEach(tag => {
      affinities[tag] = 0.8;
    });
    this.getRelatedTags(tagName).forEach(tag => {
      if (!affinities[tag]) {
        affinities[tag] = 0.4;
      }
    });
    return affinities;
  }
};

// ============================================================
// SECTION 3: TAG MANAGER (Core Operations)
// ============================================================

class TagManager {
  constructor() {
    this.tags = new Map();
    this.recommendations = this.initializeRecommendations();
    this.storageKey = 'adventureFinderTags';
    this.loadTags();
  }

  /**
   * Initialize tag recommendations
   */
  initializeRecommendations() {
    return {
      hiking: ['outdoor', 'nature', 'exercise', 'scenic', 'family-friendly'],
      camping: ['outdoor', 'nature', 'family-friendly', 'adventure', 'budget'],
      fishing: ['outdoor', 'nature', 'relaxing', 'water-based', 'wildlife'],
      skiing: ['outdoor', 'sports', 'winter', 'adventure', 'challenging'],
      beach: ['outdoor', 'water-based', 'relaxing', 'family-friendly', 'scenic'],
      kayaking: ['water-based', 'outdoor', 'adventure', 'sports', 'scenic'],
      rock_climbing: ['outdoor', 'adventure', 'sports', 'challenging', 'scenic'],
      biking: ['outdoor', 'sports', 'nature', 'exercise', 'scenic'],
      easy: ['beginner-friendly', 'family-friendly', 'accessible'],
      moderate: ['intermediate', 'fit-required', 'scenic'],
      hard: ['challenging', 'experienced-only', 'adventure'],
      summer: ['outdoor', 'warm-weather', 'family-friendly'],
      winter: ['snow', 'cold-weather', 'adventure'],
      spring: ['nature', 'scenic', 'wildflowers'],
      fall: ['nature', 'scenic', 'foliage'],
      free: ['budget', 'family-friendly', 'accessible'],
      paid: ['developed', 'facilities', 'maintained'],
      restaurant: ['food', 'dining', 'social', 'must-visit', 'local-favorite'],
      cafe: ['food', 'coffee', 'relaxing', 'social', 'casual'],
      hotel: ['accommodation', 'lodging', 'comfort', 'convenient'],
      viewpoint: ['scenic', 'photography', 'nature', 'outdoor', 'must-see'],
      park: ['outdoor', 'nature', 'family-friendly', 'recreational', 'scenic'],
      trail: ['outdoor', 'hiking', 'nature', 'exercise', 'scenic'],
      mountain: ['outdoor', 'nature', 'challenging', 'scenic', 'adventure'],
      lake: ['water-based', 'nature', 'scenic', 'relaxing', 'outdoor'],
      waterfall: ['nature', 'scenic', 'photography', 'outdoor', 'must-see'],
      beach_location: ['water-based', 'outdoor', 'relaxing', 'family-friendly', 'scenic'],
      highly_rated: ['must-visit', 'popular', 'quality'],
      low_rated: ['needs-improvement', 'caution', 'check-reviews']
    };
  }

  /**
   * Load tags from localStorage
   */
  loadTags() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.tags = new Map(Object.entries(data));
      } catch (e) {
        console.error('Failed to load tags:', e);
        this.tags = new Map();
      }
    }
  }

  /**
   * Save tags to localStorage
   */
  saveTags() {
    const data = Object.fromEntries(this.tags);
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  /**
   * Get tags for a place
   */
  getTagsForPlace(placeIdentifier) {
    return this.tags.get(placeIdentifier) || [];
  }

  /**
   * Add a single tag to a place
   */
  addTagToPlace(placeIdentifier, tag) {
    const currentTags = this.getTagsForPlace(placeIdentifier);
    if (!currentTags.includes(tag)) {
      currentTags.push(tag);
      this.tags.set(placeIdentifier, currentTags);
      this.saveTags();
      return true;
    }
    return false;
  }

  /**
   * Remove a tag from a place
   */
  removeTagFromPlace(placeIdentifier, tag) {
    const currentTags = this.getTagsForPlace(placeIdentifier);
    const index = currentTags.indexOf(tag);
    if (index > -1) {
      currentTags.splice(index, 1);
      this.tags.set(placeIdentifier, currentTags);
      this.saveTags();
      return true;
    }
    return false;
  }

  /**
   * Add multiple tags to a place
   */
  addTagsToPlace(placeIdentifier, tagsToAdd) {
    const currentTags = this.getTagsForPlace(placeIdentifier);
    let added = 0;
    tagsToAdd.forEach(tag => {
      if (!currentTags.includes(tag)) {
        currentTags.push(tag);
        added++;
      }
    });
    if (added > 0) {
      this.tags.set(placeIdentifier, currentTags);
      this.saveTags();
    }
    return added;
  }

  /**
   * Remove multiple tags from a place
   */
  removeTagsFromPlace(placeIdentifier, tagsToRemove) {
    const currentTags = this.getTagsForPlace(placeIdentifier);
    let removed = 0;
    tagsToRemove.forEach(tag => {
      const index = currentTags.indexOf(tag);
      if (index > -1) {
        currentTags.splice(index, 1);
        removed++;
      }
    });
    if (removed > 0) {
      this.tags.set(placeIdentifier, currentTags);
      this.saveTags();
    }
    return removed;
  }

  /**
   * Replace all tags for a place
   */
  setTagsForPlace(placeIdentifier, newTags) {
    this.tags.set(placeIdentifier, newTags);
    this.saveTags();
  }

  /**
   * Get recommended tags for a place
   */
  getRecommendedTags(characteristics) {
    const recommended = new Set();
    const chars = Array.isArray(characteristics) ? characteristics : Object.keys(characteristics).filter(k => characteristics[k]);
    chars.forEach(char => {
      const key = char.toLowerCase().replace(/\s+/g, '_');
      if (this.recommendations[key]) {
        this.recommendations[key].forEach(tag => recommended.add(tag));
      }
    });
    return Array.from(recommended).sort();
  }

  /**
   * Get all unique tags
   */
  getAllTags() {
    const allTags = new Set();
    this.tags.forEach(tagArray => {
      tagArray.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  }

  /**
   * Search places by tag
   */
  getPlacesByTag(tag) {
    const places = [];
    this.tags.forEach((tags, placeId) => {
      if (tags.includes(tag)) {
        places.push(placeId);
      }
    });
    return places;
  }

  /**
   * Get tag statistics
   */
  getTagStats() {
    const stats = {};
    this.tags.forEach(tags => {
      tags.forEach(tag => {
        stats[tag] = (stats[tag] || 0) + 1;
      });
    });
    return stats;
  }

  /**
   * Clear all tags for a place
   */
  clearTagsForPlace(placeIdentifier) {
    this.tags.delete(placeIdentifier);
    this.saveTags();
  }

  /**
   * Batch add tags to multiple places
   */
  addTagsToBatchPlaces(placeIdentifiers, tagsToAdd) {
    const results = { successful: [], failed: [], noChange: [] };
    placeIdentifiers.forEach(placeId => {
      try {
        const added = this.addTagsToPlace(placeId, tagsToAdd);
        if (added > 0) {
          results.successful.push(placeId);
        } else {
          results.noChange.push(placeId);
        }
      } catch (e) {
        results.failed.push({ placeId, error: e.message });
      }
    });
    return results;
  }

  /**
   * Batch remove tags from multiple places
   */
  removeTagsFromBatchPlaces(placeIdentifiers, tagsToRemove) {
    const results = { successful: [], failed: [], noChange: [] };
    placeIdentifiers.forEach(placeId => {
      try {
        const removed = this.removeTagsFromPlace(placeId, tagsToRemove);
        if (removed > 0) {
          results.successful.push(placeId);
        } else {
          results.noChange.push(placeId);
        }
      } catch (e) {
        results.failed.push({ placeId, error: e.message });
      }
    });
    return results;
  }

  /**
   * Export tags to JSON
   */
  exportTags() {
    return JSON.stringify(Object.fromEntries(this.tags), null, 2);
  }

  /**
   * Import tags from JSON
   */
  importTags(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      this.tags = new Map(Object.entries(data));
      this.saveTags();
      return { success: true, count: this.tags.size };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Get tags organized by hierarchy
   */
  getTagsByHierarchy() {
    const result = {};
    const categories = TAG_HIERARCHY.getAllCategories();
    for (const category of categories) {
      const tags = TAG_HIERARCHY.getTagsInCategory(category);
      result[category] = tags;
    }
    return result;
  }

  /**
   * Get category info for tag
   */
  getTagCategoryInfo(tagName) {
    return TAG_HIERARCHY.getTagCategory(tagName);
  }

  /**
   * Get related tags
   */
  getRelatedTags(tagName) {
    return TAG_HIERARCHY.getRelatedTags(tagName);
  }

  /**
   * Get sibling tags
   */
  getSiblingTags(tagName) {
    return TAG_HIERARCHY.getSiblingTags(tagName);
  }

  /**
   * Get tag affinities
   */
  getTagAffinities(tagName) {
    return TAG_HIERARCHY.getTagAffinities(tagName);
  }

  /**
   * Suggest tags for a place
   */
  suggestTagsForPlace(placeIdentifier, limit = 5) {
    const existingTags = this.getTagsForPlace(placeIdentifier);
    if (existingTags.length === 0) return [];

    const suggestions = new Map();
    for (const tag of existingTags) {
      const relatedTags = this.getRelatedTags(tag);
      const siblingTags = this.getSiblingTags(tag);
      const affinities = this.getTagAffinities(tag);

      [...relatedTags, ...siblingTags].forEach(sugTag => {
        if (!existingTags.includes(sugTag)) {
          const currentScore = suggestions.get(sugTag) || 0;
          const newScore = currentScore + (affinities[sugTag] || 0.5);
          suggestions.set(sugTag, newScore);
        }
      });
    }

    return Array.from(suggestions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, score]) => ({ tag, score: Math.round(score * 100) / 100 }));
  }

  /**
   * Get tags in a specific category
   */
  getTagsInCategory(categoryName) {
    return TAG_HIERARCHY.getTagsInCategory(categoryName);
  }

  /**
   * Filter places by tag hierarchy
   */
  filterPlacesByTagHierarchy(places, tagsToMatch, matchMode = 'any') {
    if (!tagsToMatch || tagsToMatch.length === 0) return places;
    return places.filter(place => {
      const placeTags = this.getTagsForPlace(place.id || place.name);
      if (matchMode === 'all') {
        return tagsToMatch.every(tag => placeTags.includes(tag));
      } else {
        return tagsToMatch.some(tag => placeTags.includes(tag));
      }
    });
  }

  /**
   * Get hierarchy statistics
   */
  getHierarchyStats() {
    const stats = {
      totalCategories: TAG_HIERARCHY.getAllCategories().length,
      totalTags: 0,
      tagsByCategory: {},
      mostUsedTags: [],
      leastUsedTags: [],
      categoryCoverage: {}
    };

    for (const category of TAG_HIERARCHY.getAllCategories()) {
      const tags = TAG_HIERARCHY.getTagsInCategory(category);
      stats.totalTags += tags.length;
      stats.tagsByCategory[category] = tags.length;

      let categoryUsageCount = 0;
      for (const tag of tags) {
        for (const [placeId, placeTags] of this.tags.entries()) {
          if (placeTags.includes(tag)) categoryUsageCount++;
        }
      }
      stats.categoryCoverage[category] = categoryUsageCount;
    }

    const tagUsage = new Map();
    for (const [placeId, tags] of this.tags.entries()) {
      for (const tag of tags) {
        const count = (tagUsage.get(tag) || 0) + 1;
        tagUsage.set(tag, count);
      }
    }

    stats.mostUsedTags = Array.from(tagUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    stats.leastUsedTags = Array.from(tagUsage.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    return stats;
  }
}

// Create global instance
window.tagManager = window.tagManager || new TagManager();

// ============================================================
// SECTION 4: CROSS-CONTEXT UTILITIES
// ============================================================

/**
 * Get data from window or opener
 */
function resolveContextWindow(requiredProp) {
  const prop = String(requiredProp || '').trim();
  const candidates = [];
  const pushSafe = (value) => {
    try {
      if (!value || candidates.includes(value)) return;
      candidates.push(value);
    } catch (_error) {}
  };

  pushSafe(window);
  try {
    if (window.parent && window.parent !== window) pushSafe(window.parent);
  } catch (_error) {}
  try {
    if (window.opener && !window.opener.closed) pushSafe(window.opener);
  } catch (_error) {}
  try {
    if (window.top && window.top !== window) pushSafe(window.top);
  } catch (_error) {}

  if (!prop) return candidates[0] || window;
  return candidates.find((candidate) => candidate && candidate[prop]) || candidates[0] || window;
}

function getFromContext(prop) {
  const host = resolveContextWindow(prop);
  if (host && host[prop]) return host[prop];
  return null;
}

/**
 * Show toast across contexts
 */
function showToastCrossContext(message, type = 'info', duration = 3000) {
  const host = resolveContextWindow('showToast');
  if (host && typeof host.showToast === 'function') {
    host.showToast(message, type, duration);
  }
}

// ============================================================
// SECTION 5: AUTO-TAG SYSTEM
// ============================================================

/**
 * Auto-tag all locations
 */
window.autoTagAllLocationsUnified = async function(options = {}) {
  const {
    dryRun = false
  } = options;

  console.log('🏷️ Starting auto-tag for all locations...');

  const adventuresData = getFromContext('adventuresData');
  const mainWindow = resolveContextWindow('saveToExcel');
  const getColumnIndex = (primary, aliases = [], fallback = -1) => {
    try {
      if (mainWindow && typeof mainWindow.getColumnIndexByName === 'function') {
        const idx = Number(mainWindow.getColumnIndexByName(primary, aliases));
        if (Number.isInteger(idx) && idx >= 0) return idx;
      }
    } catch (_error) {}
    return fallback;
  };
  const tagsCol = getColumnIndex('Tags', [], 3);
  let workbookTagUpdates = 0;
  if (!adventuresData || adventuresData.length === 0) {
    console.warn('⚠️ No locations to tag');
    showToastCrossContext('⚠️ No locations found', 'warning', 2000);
    return { success: 0, failed: 0, skipped: 0 };
  }

  // Enhanced semantic tagging system with pattern matching + location type detection

  /**
   * Priority 1: Detect location type (outdoor, dining, shopping, cultural, etc.)
   */
  function detectLocationType(text) {
    const patterns = {
      outdoor: /\b(hike|trail|hiking|trekking|mountain|alpine|peak|summit|waterfall|cascade|falls|lake|river|stream|creek|pond|beach|shore|coast|seaside|camping|campground|forest|woods|woodland|grove|nature preserve|national park|viewpoint|overlook|vista|lookout|rock climbing|skiing|snowshoe)\b/gi,
      dining: /\b(restaurant|bistro|steakhouse|grill|eatery|cafe|coffee|espresso|tea house|diner|fast food|bakery|pastry|pub|bar|brewery|winery|distillery|pizzeria|taqueria|ramen|sushi)\b/gi,
      shopping: /\b(shop|store|retail|boutique|market|farmers market|outlet|mall|shopping)\b/gi,
      cultural: /\b(museum|gallery|exhibition|exhibit|theater|theatre|concert|music|art|artist|sculpture|craft|historic|history|monument|landmark|heritage|library|cultural center)\b/gi,
      entertainment: /\b(amusement|theme park|carnival|movie|cinema|arcade|bowling|billiards|fun center)\b/gi,
      wellness: /\b(gym|fitness|yoga|pilates|spa|massage|sauna|wellness|health|workout)\b/gi,
      wildlife: /\b(zoo|aquarium|wildlife|animal|bird|nature center|sanctuary|park)\b/gi,
      accommodation: /\b(hotel|motel|inn|resort|lodge|bed.?and.?breakfast|airbnb|hostel|campground|rv park)\b/gi
    };

    const typeScores = {};
    for (const [type, pattern] of Object.entries(patterns)) {
      const matches = text.match(pattern) || [];
      typeScores[type] = matches.length;
    }

    return Object.entries(typeScores).sort(([, a], [, b]) => b - a).map(([type]) => type);
  }

  /**
   * Priority 2: Detect cuisine and specialty for dining locations
   */
  function detectCuisineAndSpecialty(text) {
    const specialties = new Set();

    const cuisines = {
      'Italian': /\b(italian|pasta|risotto|pizzeria|gelato)\b/gi,
      'Mexican': /\b(mexican|taco|burrito|enchilada|quesadilla|salsa)\b/gi,
      'Asian': /\b(asian|sushi|ramen|dim sum|pho|thai|korean|japanese|chinese|vietn|laos)\b/gi,
      'Indian': /\b(indian|curry|tandoori|naan|samosa)\b/gi,
      'Mediterranean': /\b(mediterranean|greek|spanish|portuguese)\b/gi,
      'American': /\b(american|burger|steakhouse|bbq|barbecue|diner)\b/gi,
      'French': /\b(french|bistro|cafe)\b/gi,
      'Vegan': /\b(vegan|plant.?based|vegetarian)\b/gi,
      'Seafood': /\b(seafood|fish|shellfish|oyster|salmon|tuna)\b/gi,
      'Brunch': /\b(brunch|breakfast|brunch spot)\b/gi,
      'Fine Dining': /\b(fine dining|upscale|michelin|tasting menu|haute cuisine)\b/gi,
      'Casual': /\b(casual|laid.?back|relaxed|cozy|comfort food)\b/gi,
      'Fast Casual': /\b(fast casual|quick service|grab and go)\b/gi,
      'Bakery': /\b(bakery|pastry|donut|croissant|bread)\b/gi
    };

    for (const [cuisine, pattern] of Object.entries(cuisines)) {
      if (pattern.test(text)) specialties.add(cuisine);
    }

    // Dietary options
    if (/\b(vegan|plant.?based)\b/gi.test(text)) specialties.add('Vegan-Friendly');
    if (/\b(gluten.?free|gf)\b/gi.test(text)) specialties.add('Gluten-Free');
    if (/\b(organic|locally.?sourced|farm.?to.?table)\b/gi.test(text)) specialties.add('Local/Organic');

    return Array.from(specialties);
  }

  /**
   * Priority 3: Detect activity attributes (duration, difficulty, accessibility)
   */
  function detectActivityAttributes(text) {
    const attributes = new Set();

    // Duration indicators
    if (/\b(2.?hour|3.?hour|4.?hour|5.?hour|half.?day|full.?day|day.?long|long hike|all.?day)\b/gi.test(text))
      attributes.add('Half-Day+ Experience');
    if (/\b(30.?min|45.?min|1.?hour|quick|short|easy stroll|brief|quick walk)\b/gi.test(text))
      attributes.add('Quick Visit');

    // Difficulty indicators
    if (/\b(steep|challenging|difficult|advanced|technical|scramble|elevation gain|strenuous|tough)\b/gi.test(text))
      attributes.add('Challenging');
    if (/\b(easy|beginner.?friendly|simple|gentle|beginner|novice)\b/gi.test(text))
      attributes.add('Easy');
    if (/\b(moderate|intermediate|some experience|general fitness)\b/gi.test(text))
      attributes.add('Intermediate');

    // Accessibility indicators
    if (/\b(wheelchair|handicap|accessible|ada|mobility|pushchair|stroller|paved|flat|level)\b/gi.test(text))
      attributes.add('Accessible');
    if (/\b(pet.?friendly|dogs allowed|leashed pets|dog park)\b/gi.test(text))
      attributes.add('Pet-Friendly');
    if (/\b(no steps|level access|ramp|elevator|lift)\b/gi.test(text))
      attributes.add('Wheelchair-Accessible');
    if (/\b(family.?friendly|kids|children|toddler|playground|kid.?friendly)\b/gi.test(text))
      attributes.add('Family-Friendly');

    // Experience type
    if (/\b(photography|photo|scenic|views|photo.?op|instagrammable)\b/gi.test(text))
      attributes.add('Photography-Worthy');
    if (/\b(hidden gem|secret|off.?the.?beaten|lesser.?known|undiscovered)\b/gi.test(text))
      attributes.add('Hidden Gem');
    if (/\b(must.?see|must.?visit|iconic|famous|popular|well.?known)\b/gi.test(text))
      attributes.add('Must-See');
    if (/\b(relaxing|peaceful|calm|tranquil|serene|quiet)\b/gi.test(text))
      attributes.add('Relaxing');
    if (/\b(adventure|thrilling|exciting|adrenaline|rush)\b/gi.test(text))
      attributes.add('Adventure');

    return Array.from(attributes);
  }

  /**
   * Feature 4: Pricing & Budget Indicators
   */
  function detectPricingIndicators(text) {
    const tags = new Set();

    if (/\b(budget.?friendly|affordable|cheap|inexpensive|reasonable|bargain)\b/gi.test(text))
      tags.add('Budget-Friendly');
    if (/\b(expensive|pricey|costly|upscale|fine dining|high.?end|splurge|luxury)\b/gi.test(text))
      tags.add('Upscale');
    if (/\b(free|no charge|complimentary|no cost)\b/gi.test(text))
      tags.add('Free');
    if (/\b(happy hour|discount|deals?|sale|special|promotion|coupon)\b/gi.test(text))
      tags.add('Budget Hack');
    if (/\b(admission|entry fee|entrance fee|paid|ticket|membership)\b/gi.test(text))
      tags.add('Paid Admission');
    if (/\b(all.?you.?can|unlimited|all.?inclusive)\b/gi.test(text))
      tags.add('All-You-Can Experience');

    return Array.from(tags);
  }

  /**
   * Feature 6: Seasonal & Temporal Tagging
   */
  function detectSeasonalAndTemporal(text) {
    const tags = new Set();

    // Summer
    if (/\b(summer|best in summer|summer only|june|july|august|hot weather)\b/gi.test(text))
      tags.add('Summer Destination');

    // Winter
    if (/\b(winter|snow|skiing|snowboard|december|january|february|cold|frost)\b/gi.test(text))
      tags.add('Winter Activity');

    // Fall
    if (/\b(fall|autumn|fall colors|foliage|september|october|november)\b/gi.test(text))
      tags.add('Seasonal Beauty');

    // Spring
    if (/\b(spring|spring break|easter|april|may|bloom|blossom|cherry|wildflower)\b/gi.test(text))
      tags.add('Spring Destination');

    // Time of day
    if (/\b(sunset|sunrise|dusk|dawn|golden hour|best at sunset|best at sunrise)\b/gi.test(text))
      tags.add('Best at Sunrise/Sunset');

    // Duration
    if (/\b(overnight|multi.?day|week.?long|extended|camping|backpacking)\b/gi.test(text))
      tags.add('Multi-Day Experience');

    if (/\b(weekend|weekend getaway|two.?day|three.?day)\b/gi.test(text))
      tags.add('Weekend Destination');

    // All-season
    if (/\b(year.?round|all.?season|anytime|ganzjährig|open|always|evergreen)\b/gi.test(text))
      tags.add('Year-Round Destination');

    return Array.from(tags);
  }

  /**
   * Feature 7: Parking & Logistics
   */
  function detectParkingAndLogistics(text) {
    const tags = new Set();

    // Parking
    if (/\b(free parking|ample parking|plenty of parking|large parking lot)\b/gi.test(text))
      tags.add('Free Parking');
    if (/\b(limited parking|paid parking|parking fee|parking available)\b/gi.test(text))
      tags.add('Parking Available');
    if (/\b(no parking|street parking only|valet)\b/gi.test(text))
      tags.add('Limited Parking');

    // Transit
    if (/\b(public transit|metro|subway|bus|train|light rail|accessible by transit|transit friendly)\b/gi.test(text))
      tags.add('Public Transit-Friendly');
    if (/\b(requires driving|remote|off.?road|car required|drive required|long drive|motorway)\b/gi.test(text))
      tags.add('Car Required');
    if (/\b(walkable|pedestrian friendly|downtown|central location)\b/gi.test(text))
      tags.add('Walkable');

    // Accessibility logistics
    if (/\b(easy to find|well.?signed|clearly marked|directions available)\b/gi.test(text))
      tags.add('Easy to Navigate');
    if (/\b(hard to find|hidden location|unmarked|no signs)\b/gi.test(text))
      tags.add('Off the Radar');

    return Array.from(tags);
  }

  /**
   * Feature 8: Crowd & Authenticity
   */
  function detectCrowdAndAuthenticity(text) {
    const tags = new Set();

    // Authenticity
    if (/\b(authentic|local|traditional|genuine|real deal|not touristy)\b/gi.test(text))
      tags.add('Authentic Experience');
    if (/\b(local favorite|locals only|insider tip|where locals go)\b/gi.test(text))
      tags.add('Local Favorite');
    if (/\b(off.?the.?beaten path|hidden gem|secret|undiscovered|lesser.?known)\b/gi.test(text))
      tags.add('Hidden Gem');

    // Tourist aspect
    if (/\b(touristy|tourist trap|tourist hotspot|commercialized)\b/gi.test(text))
      tags.add('Touristy');
    if (/\b(popular|crowded|busy|packed|long wait|peak season)\b/gi.test(text))
      tags.add('Popular/Crowded');
    if (/\b(quiet|peaceful|serene|not crowded|less touristy|peaceful escape)\b/gi.test(text))
      tags.add('Less Touristy');

    // Warning tags
    if (/\b(overrated|overhyped|disappointing|not worth|skip|avoid)\b/gi.test(text))
      tags.add('Overhyped');
    if (/\b(hidden|secret|avoid crowds|quiet|escape|getaway)\b/gi.test(text))
      tags.add('Crowd-Escape');

    return Array.from(tags);
  }

  /**
   * Feature 9: Equipment & Preparation
   */
  function detectEquipmentAndPreparation(text) {
    const tags = new Set();

    // Footwear
    if (/\b(hiking boots|sturdy shoes|trail shoes|water shoes|waterproof|boots required)\b/gi.test(text))
      tags.add('Hiking Boots Recommended');

    // Water gear
    if (/\b(swimsuit|water gear|wet suit|water shoes|bathing suit|swim)\b/gi.test(text))
      tags.add('Bring Swimsuit');

    // Photography
    if (/\b(camera|photography|photo.?op|instagrammabl|photo gear|bring camera|drone)\b/gi.test(text))
      tags.add('Photography Gear Recommended');

    // Wildlife viewing
    if (/\b(binoculars|bird watching|wildlife|telescope|spotting scope|binocs)\b/gi.test(text))
      tags.add('Binoculars Recommended');

    // Food/picnic
    if (/\b(picnic|bring food|pack lunch|bring snacks|byo|byob|food allowed)\b/gi.test(text))
      tags.add('BYO Picnic');

    // Sun protection
    if (/\b(sunscreen|sun protection|hat|sunhat\.?|exposed|no shade)\b/gi.test(text))
      tags.add('Bring Sun Protection');

    // Winter gear
    if (/\b(warm clothes|layers|winter gear|insulated|thermals|warm jacket)\b/gi.test(text))
      tags.add('Bring Winter Gear');

    // Rain gear
    if (/\b(raincoat|rain gear|waterproof|umbrella|moisture)\b/gi.test(text))
      tags.add('Bring Rain Gear');

    // Insect protection
    if (/\b(mosquito|bug|insect repellent|deet|tick|midges)\b/gi.test(text))
      tags.add('Bring Insect Repellent');

    return Array.from(tags);
  }

  /**
   * Feature 12: Smart Multi-Pattern Combinations
   */
  function detectMultiPatternCombos(text, detectedTags) {
    const tags = new Set(detectedTags);

    // Romantic + Dining + Italian/French → Date Night
    if (/romantic|date|couples?|intimate/gi.test(text) &&
        (tags.has('Dining') || tags.has('Italian') || tags.has('French') || /restaurant|cafe|bistro/gi.test(text))) {
      tags.add('Date Night');
      tags.add('Romantic');
    }

    // Family + Water + Park → Family Water Fun
    if (/family|kids?|children|toddler/gi.test(text) &&
        (/water|pool|beach|splash|swim/gi.test(text) || tags.has('Water Activity'))) {
      tags.add('Family Water Fun');
    }

    // Easy + Short + Scenic → Perfect for Groups
    if ((tags.has('Easy') || tags.has('Quick Visit')) &&
        (tags.has('Scenic') || /scenic|beautiful|views|vista/gi.test(text))) {
      tags.add('Perfect for Groups');
    }

    // Wheelchair + Accessible + Dining → Fully Accessible Dining
    if (tags.has('Wheelchair-Accessible') &&
        (tags.has('Dining') || /restaurant|cafe|diner/gi.test(text))) {
      tags.add('Inclusive Dining');
    }

    // Hidden + Scenic + Local → True Local Gem
    if (tags.has('Hidden Gem') && tags.has('Scenic') && tags.has('Local Favorite')) {
      tags.add('Local Gem');
    }

    // Adventure + Family-Friendly + Outdoor → Family Adventure
    if ((tags.has('Adventure') || tags.has('Challenging')) &&
        tags.has('Family-Friendly') &&
        (tags.has('Outdoor') || /nature|hiking|trail/gi.test(text))) {
      tags.add('Family-Friendly Adventure');
    }

    // Photography + Scenic + Sunset → Photography Paradise
    if ((tags.has('Photography-Worthy') || /photography/gi.test(text)) &&
        tags.has('Scenic') &&
        tags.has('Best at Sunrise/Sunset')) {
      tags.add('Photography Paradise');
    }

    // Hiking + Intermediate + Water → Scenic Water Hike
    if (/hiking|trail|trek/gi.test(text) &&
        tags.has('Intermediate') &&
        (tags.has('Water Activity') || /waterfall|lake|river|creek/gi.test(text))) {
      tags.add('Scenic Water Hike');
    }

    // Budget-Friendly + Family-Friendly + Outdoor → Budget Family Day Out
    if (tags.has('Budget-Friendly') && tags.has('Family-Friendly') && tags.has('Outdoor')) {
      tags.add('Budget Family Day');
    }

    // Upscale + Romantic + International Cuisine → Special Occasion Dining
    if (tags.has('Upscale') && tags.has('Romantic') &&
        (tags.has('Italian') || tags.has('French') || tags.has('Mediterranean') || tags.has('Asian'))) {
      tags.add('Special Occasion Dining');
    }

    // Summer + Beach + Family → Beach Day Paradise
    if (tags.has('Summer Destination') &&
        (tags.has('Beach') || tags.has('Water Activity')) &&
        tags.has('Family-Friendly')) {
      tags.add('Perfect Beach Day');
    }

    return tags;
  }

  /**
   * Enhanced main tagging function with semantic analysis
   */
  function getTagsForLocationText(locationData) {
    const textParts = [
      locationData.name || '',
      locationData.description || '',
      locationData.tags || '',
      locationData.city || '',
      locationData.address || '',
      locationData.notes || ''
    ];
    const fullText = textParts.join(' ');
    const lowerText = fullText.toLowerCase();

    const recommended = new Set();

    // Priority 1: Detect location type
    const types = detectLocationType(lowerText);
    const primaryType = types[0];

    // Add type-specific base tags
    if (primaryType === 'outdoor') {
      recommended.add('Outdoor');
      recommended.add('Nature');
      if (/\b(scenic|beautiful|views|vista)\b/gi.test(lowerText)) recommended.add('Scenic');
    } else if (primaryType === 'dining') {
      recommended.add('Dining');
      recommended.add('Local Favorite');
      // Priority 2: Cuisine detection for dining
      const cuisines = detectCuisineAndSpecialty(lowerText);
      cuisines.forEach((c) => recommended.add(c));
    } else if (primaryType === 'shopping') {
      recommended.add('Shopping');
      recommended.add('Local Business');
    } else if (primaryType === 'cultural') {
      recommended.add('Cultural');
      recommended.add('Educational');
      if (/\b(historic|history|heritage)\b/gi.test(lowerText)) recommended.add('Historical');
    } else if (primaryType === 'entertainment') {
      recommended.add('Entertainment');
      recommended.add('Family-Friendly');
    } else if (primaryType === 'wellness') {
      recommended.add('Health & Wellness');
      recommended.add('Active');
    } else if (primaryType === 'wildlife') {
      recommended.add('Wildlife');
      recommended.add('Educational');
      recommended.add('Family-Friendly');
    }

    // Priority 3: Activity attributes (duration, difficulty, accessibility)
    const attributes = detectActivityAttributes(lowerText);
    attributes.forEach((a) => recommended.add(a));

    // Feature 4: Pricing & Budget Indicators
    const pricing = detectPricingIndicators(lowerText);
    pricing.forEach((p) => recommended.add(p));

    // Feature 6: Seasonal & Temporal Tagging
    const seasonal = detectSeasonalAndTemporal(lowerText);
    seasonal.forEach((s) => recommended.add(s));

    // Feature 7: Parking & Logistics
    const logistics = detectParkingAndLogistics(lowerText);
    logistics.forEach((l) => recommended.add(l));

    // Feature 8: Crowd & Authenticity
    const crowd = detectCrowdAndAuthenticity(lowerText);
    crowd.forEach((c) => recommended.add(c));

    // Feature 9: Equipment & Preparation
    const equipment = detectEquipmentAndPreparation(lowerText);
    equipment.forEach((e) => recommended.add(e));

    // Universal patterns
    if (/\b(park|garden|scenic|nature|outdoor)\b/gi.test(lowerText)) recommended.add('Scenic');
    if (/\b(water|lake|river|beach|waterfall|aquatic)\b/gi.test(lowerText)) recommended.add('Water Activity');
    if (/\b(historic|monument|heritage)\b/gi.test(lowerText)) recommended.add('Worth Visiting');

    // Rating-based tags
    const rating = parseFloat(locationData.googleRating || locationData.rating || 0);
    if (rating >= 4.7) {
      recommended.add('Top Rated');
      recommended.add('Worth Visiting');
    } else if (rating >= 4.3) {
      recommended.add('Highly Recommended');
    }

    // Feature 12: Smart Multi-Pattern Combinations
    const withCombos = detectMultiPatternCombos(fullText, recommended);

    return Array.from(withCombos);
  }

  const results = { success: 0, failed: 0, skipped: 0, details: [] };
  const changedRows = [];

  try {
    for (let index = 0; index < adventuresData.length; index++) {
      const location = adventuresData[index];
      // Support both flat objects and values[][] structure
      const values = location?.values?.[0] || null;
      const placeId = values ? (values[1] || '') : (location?.placeId || location?.id || '');
      const locationName = values ? (values[0] || '') : (location?.name || '');

      // Build a data object for text matching
      const dataObj = {
        name: locationName,
        description: values ? (values[16] || '') : (location?.description || ''),
        googleRating: values ? (values[13] || '') : (location?.googleRating || location?.rating || ''),
        city: values ? (values[10] || '') : (location?.city || ''),
        address: values ? (values[11] || '') : (location?.address || ''),
        tags: values ? (values[3] || '') : (location?.tags || ''),
        notes: ''
      };

      const identifier = placeId || locationName;
      if (!identifier) {
        results.skipped++;
        continue;
      }

      try {
        const recommendedTags = getTagsForLocationText(dataObj);

        if (!dryRun && recommendedTags.length > 0) {
          const added = window.tagManager.addTagsToPlace(identifier, recommendedTags);
          if (values && tagsCol >= 0) {
            const existing = String(values[tagsCol] || '').split(',').map((t) => String(t || '').trim()).filter(Boolean);
            const merged = Array.from(new Set(existing.concat(recommendedTags)));
            if (merged.join(', ') !== String(values[tagsCol] || '').trim()) {
              values[tagsCol] = merged.join(', ');
              workbookTagUpdates++;
              changedRows.push(typeof window.buildChangedWorkbookRow === 'function'
                ? window.buildChangedWorkbookRow(location, index, values)
                : { rowIndex: index, rowId: location && (location.rowId ?? location.id ?? location.index ?? index), values: Array.isArray(values) ? values.slice() : [] });
            }
          }
          results.success++;
          results.details.push({ name: locationName, added: Math.max(added, recommendedTags.length), tags: recommendedTags });
          console.log(`✅ Tagged "${locationName}": ${recommendedTags.join(', ')}`);
        } else if (dryRun && recommendedTags.length > 0) {
          results.success++;
          results.details.push({ name: locationName, dryRun: true, tags: recommendedTags });
          console.log(`🧪 [DRY RUN] Would tag "${locationName}": ${recommendedTags.join(', ')}`);
        } else {
          results.skipped++;
          console.log(`⏭ No tags matched for "${locationName}"`);
        }
      } catch (e) {
        results.failed++;
        console.warn(`Warning tagging ${locationName}:`, e);
      }
    }

    const verb = dryRun ? 'would tag' : 'tagged';

    if (!dryRun && workbookTagUpdates > 0) {
      try {
        if (mainWindow && typeof mainWindow.saveToExcel === 'function' && mainWindow.saveToExcel.length >= 1 && changedRows.length) {
          let verifiedRowsChanged = 0;
          for (const row of changedRows) {
            const rowRef = typeof window.resolveWorkbookRowReference === 'function'
              ? window.resolveWorkbookRowReference(row, row.rowIndex)
              : (row.rowId ?? row.rowIndex);
            const saveResult = await mainWindow.saveToExcel(rowRef, row.values);
            if (saveResult && typeof saveResult === 'object' && saveResult.verified) verifiedRowsChanged += 1;
          }
          results.persisted = true;
          results.persistMode = 'saveToExcel-row-patch';
          results.rowsChanged = changedRows.length;
          results.persistedRows = changedRows.length;
          results.verifiedRowsChanged = verifiedRowsChanged;
          results.postWriteVerified = verifiedRowsChanged === changedRows.length;
          results.verificationMode = 'row-reread';
          results.verificationReason = results.postWriteVerified ? '' : 'one-or-more-row-verifications-failed';
        } else if (mainWindow && typeof mainWindow.saveToExcel === 'function') {
          await mainWindow.saveToExcel();
          results.persisted = true;
          results.persistMode = 'saveToExcel';
          results.rowsChanged = changedRows.length;
          results.persistedRows = changedRows.length;
          results.verifiedRowsChanged = 0;
          results.postWriteVerified = false;
          results.verificationMode = 'not-supported';
          results.verificationReason = 'bulk-save-verification-unavailable';
        } else {
          results.persisted = false;
          results.persistMode = 'unavailable';
          results.persistReason = 'saveToExcel-unavailable';
          results.rowsChanged = changedRows.length;
          results.persistedRows = 0;
          results.verifiedRowsChanged = 0;
          results.postWriteVerified = false;
          results.verificationMode = 'unavailable';
          results.verificationReason = 'saveToExcel-unavailable';
        }
      } catch (error) {
        results.persisted = false;
        results.persistMode = 'error';
        results.persistReason = String(error && error.message ? error.message : error);
        results.rowsChanged = changedRows.length;
        results.persistedRows = 0;
        results.verifiedRowsChanged = 0;
        results.postWriteVerified = false;
        results.verificationMode = 'error';
        results.verificationReason = String(error && error.message ? error.message : error);
      }
    } else if (!dryRun) {
      results.persisted = workbookTagUpdates === 0;
      results.persistMode = workbookTagUpdates === 0 ? 'no-op' : 'skipped';
      results.persistReason = workbookTagUpdates === 0 ? 'no-row-tag-changes' : '';
      results.rowsChanged = changedRows.length;
      results.persistedRows = workbookTagUpdates === 0 ? 0 : changedRows.length;
      results.verifiedRowsChanged = 0;
      results.postWriteVerified = false;
      results.verificationMode = workbookTagUpdates === 0 ? 'no-op' : 'skipped';
      results.verificationReason = workbookTagUpdates === 0 ? 'no-row-tag-changes' : '';
    }

    console.log(`✅ Auto-tag complete: ${results.success} ${verb}, ${results.failed} failed, ${results.skipped} skipped`);
    showToastCrossContext(
      `✅ ${dryRun ? '[DRY RUN] ' : ''}Auto-tag: ${results.success} location${results.success !== 1 ? 's' : ''} tagged${!dryRun && workbookTagUpdates > 0 ? ` • ${workbookTagUpdates} workbook row${workbookTagUpdates === 1 ? '' : 's'} updated` : ''}`,
      'success', 3000
    );

  } catch (error) {
    console.error('❌ Error during auto-tag:', error);
    showToastCrossContext('❌ Error during tagging', 'error', 3000);
  }

  return results;
};

// ============================================================
// SECTION 6: TAG ALIASES & SYNONYMS SYSTEM
// ============================================================

/**
 * Tag Aliases - Map similar tags together for improved discovery
 * Example: "Hiking" = ["Trekking", "Walking", "Backpacking"]
 */
const TAG_ALIASES = {
  // Hiking
  'Hiking': ['Trekking', 'Walking', 'Backpacking', 'Trail Walking', 'Rambling'],
  'Trekking': ['Hiking', 'Backpacking', 'Mountain Walking'],

  // Dining Tags
  'Coffee Shop': ['Coffee', 'Espresso Bar', 'Coffee Cafe', 'Coffeehouse', 'Cafe'],
  'Coffee': ['Coffee Shop', 'Espresso Bar', 'Coffeehouse', 'Cafe'],

  // Upscale Dining
  'Upscale': ['Fine Dining', 'Premium', 'High-End', 'Luxury'],
  'Fine Dining': ['Upscale', 'Premium Restaurant', 'Luxury Dining'],

  // Budget
  'Budget-Friendly': ['Affordable', 'Inexpensive', 'Cheap', 'Budget', 'Value'],
  'Budget Hack': ['Deal', 'Discount', 'Happy Hour', 'Special'],

  // Family-Friendly
  'Family-Friendly': ['Kid-Friendly', 'Kids Welcome', 'Family Place', 'Good for Families'],

  // Wheelchair
  'Wheelchair-Accessible': ['Accessible', 'ADA-Compliant', 'Accessible Entry', 'Mobility Friendly'],
  'Accessible': ['Wheelchair-Accessible', 'ADA-Compliant', 'Mobility Friendly'],

  // Water
  'Water Activity': ['Water Sports', 'Aquatic', 'Water-Based', 'Water Recreation'],

  // Hidden
  'Hidden Gem': ['Secret Spot', 'Off-Beaten Path', 'Lesser Known', 'Undiscovered', 'Secret Location'],

  // Romantic
  'Romantic': ['Romance', 'Date-Friendly', 'Couples', 'Intimate'],

  // Photography
  'Photography-Worthy': ['Instagrammable', 'Photo Op', 'Scenic Views', 'Picture Perfect', 'Photo Spot'],
  'Instagrammable': ['Photography-Worthy', 'Photo Op', 'Picture Perfect', 'Photo Location'],

  // Local
  'Local Favorite': ['Local Hotspot', 'Local Preferred', 'Favorite Locally', 'Popular Locally'],
  'Authentic Experience': ['Local Experience', 'Genuine', 'Real Experience', 'Authentic'],

  // Beach
  'Beach': ['Shoreline', 'Coastal', 'Seaside', 'Ocean Beach'],

  // Mountain
  'Mountain': ['Alpine', 'Peak', 'Summit', 'Highland', 'Mountainous'],

  // Wildlife
  'Wildlife': ['Animals', 'Animals Spotting', 'Wild Life', 'Nature Wildlife', 'Animal Viewing'],
  'Birding': ['Bird Watching', 'Bird Spotting', 'Ornithology'],

  // Easy/Hard
  'Easy': ['Beginner-Friendly', 'Simple', 'Gentle', 'Accessible to All', 'Not Difficult'],
  'Challenging': ['Difficult', 'Advanced', 'Tough', 'Strenuous', 'Not for Beginners'],

  // Scenic
  'Scenic': ['Beautiful', 'Picturesque', 'Stunning Views', 'Scenic Views', 'Breathtaking'],

  // Shopping
  'Shopping': ['Retail', 'Shopping Area', 'Boutique', 'Shopping District'],

  // Relaxing
  'Relaxing': ['Peaceful', 'Calm', 'Tranquil', 'Serene', 'Stress-Free'],

  // Adventure
  'Adventure': ['Thrilling', 'Exciting', 'Adrenaline', 'Action-Packed', 'Epic'],

  // Must-See
  'Must-See': ['Must-Visit', 'Not to Miss', 'Essential', 'Iconic', 'Famous', 'Top Attraction'],
  'Worth Visiting': ['Must-Visit', 'Worth Your Time', 'Recommended', 'Great Visit'],

  // Year-Round
  'Year-Round Destination': ['Open Year-Round', 'All-Season', 'Always Open', 'Perennial'],

  // Outdoor
  'Outdoor': ['Outdoors', 'Exterior', 'Outside', 'Nature-Based'],

  // Bookstore suggestion
  'Bookstore': ['Books', 'Library', 'Book Shop'],
  'Library': ['Bookstore', 'Books', 'Learning Centre']
};

/**
 * Resolve tag alias - returns canonical tag name
 */
function resolveTagAlias(tagName) {
  if (!tagName) return null;

  // Check if the tag itself is in TAG_ALIASES (it's the primary)
  if (TAG_ALIASES[tagName]) {
    return tagName;
  }

  // Check if this tag is an alias of something else
  for (const [primary, aliases] of Object.entries(TAG_ALIASES)) {
    if (aliases.includes(tagName)) {
      return primary;
    }
  }

  return tagName; // Return as-is if no alias found
}

/**
 * Get all aliases for a tag
 */
function getTagAliases(tagName) {
  const canonical = resolveTagAlias(tagName);
  return TAG_ALIASES[canonical] || [];
}

/**
 * Normalize tags by resolving aliases to primary tags
 */
function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags.map(t => resolveTagAlias(t)).filter(Boolean);
}

// ============================================================
// SECTION 7: CUSTOM TAG REGISTRY
// ============================================================

class CustomTagRegistry {
  constructor() {
    this.customTags = new Map();
    this.storageKey = 'adventureFinderCustomTags';
    this.validationRules = {
      minLength: 2,
      maxLength: 50,
      allowedChars: /^[a-zA-Z0-9\s\-&.,'()]+$/,
      reserved: ['All', 'None', 'Custom', 'System', 'Admin']
    };
    this.loadCustomTags();
  }

  /**
   * Validate tag name
   */
  validateTagName(name) {
    const errors = [];

    if (!name || typeof name !== 'string') {
      errors.push('Tag name must be a string');
    } else {
      if (name.length < this.validationRules.minLength) {
        errors.push(`Tag name too short (min ${this.validationRules.minLength} chars)`);
      }
      if (name.length > this.validationRules.maxLength) {
        errors.push(`Tag name too long (max ${this.validationRules.maxLength} chars)`);
      }
      if (!this.validationRules.allowedChars.test(name)) {
        errors.push('Tag contains invalid characters');
      }
      if (this.validationRules.reserved.includes(name)) {
        errors.push(`"${name}" is a reserved tag name`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Create custom tag
   */
  createCustomTag(name, config = {}) {
    const validation = this.validateTagName(name);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    // Check for duplicates (case-insensitive)
    const existing = Array.from(this.customTags.keys()).find(
      t => t.toLowerCase() === name.toLowerCase()
    );
    if (existing) {
      return { success: false, errors: [`Tag "${existing}" already exists`] };
    }

    const customTag = {
      name,
      icon: config.icon || '🏷️',
      bg: config.bg || '#e0e7ff',
      color: config.color || '#312e81',
      border: config.border || '#c7d2fe',
      category: config.category || 'Custom',
      description: config.description || '',
      createdAt: new Date().toISOString(),
      usageCount: 0,
      deprecated: false
    };

    this.customTags.set(name, customTag);
    this.saveCustomTags();
    console.log(`✅ Custom tag created: "${name}"`);
    return { success: true, tag: customTag };
  }

  /**
   * Get custom tag
   */
  getCustomTag(name) {
    return this.customTags.get(name);
  }

  /**
   * Update custom tag
   */
  updateCustomTag(name, updates = {}) {
    const tag = this.customTags.get(name);
    if (!tag) {
      return { success: false, error: `Tag "${name}" not found` };
    }

    const updated = {
      ...tag,
      ...updates,
      name: tag.name, // Prevent renaming
      createdAt: tag.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString()
    };

    this.customTags.set(name, updated);
    this.saveCustomTags();
    return { success: true, tag: updated };
  }

  /**
   * Delete custom tag
   */
  deleteCustomTag(name) {
    if (!this.customTags.has(name)) {
      return { success: false, error: `Tag "${name}" not found` };
    }

    const tag = this.customTags.get(name);
    this.customTags.delete(name);
    this.saveCustomTags();
    console.log(`✅ Custom tag deleted: "${name}"`);
    return { success: true, deletedTag: tag };
  }

  /**
   * Get all custom tags
   */
  getAllCustomTags() {
    return Array.from(this.customTags.values());
  }

  /**
   * Get custom tags by category
   */
  getCustomTagsByCategory(category) {
    return this.getAllCustomTags().filter(t => t.category === category);
  }

  /**
   * Load custom tags from storage
   */
  loadCustomTags() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.customTags = new Map(Object.entries(data));
      }
    } catch (e) {
      console.error('Failed to load custom tags:', e);
      this.customTags = new Map();
    }
  }

  /**
   * Save custom tags to storage
   */
  saveCustomTags() {
    const data = Object.fromEntries(this.customTags);
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  /**
   * Get statistics
   */
  getStats() {
    const tags = this.getAllCustomTags();
    return {
      total: tags.length,
      active: tags.filter(t => !t.deprecated).length,
      deprecated: tags.filter(t => t.deprecated).length,
      categories: [...new Set(tags.map(t => t.category))],
      mostUsed: tags.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0)).slice(0, 5),
      leastUsed: tags.sort((a, b) => (a.usageCount || 0) - (b.usageCount || 0)).filter(t => (t.usageCount || 0) === 0)
    };
  }
}

// Create global instance
window.customTagRegistry = window.customTagRegistry || new CustomTagRegistry();

// ============================================================
// SECTION 8: TAG SEARCH & FILTERING
// ============================================================

class TagSearchEngine {
  constructor() {
    this.searchHistory = [];
    this.maxHistorySize = 50;
  }

  /**
   * Normalize string for searching
   */
  normalize(str) {
    return String(str || '').toLowerCase().trim();
  }

  /**
   * Levenshtein distance - for fuzzy matching
   */
  levenshteinDistance(s1, s2) {
    const shorter = s1.length < s2.length ? s1 : s2;
    const longer = s1.length < s2.length ? s2 : s1;
    const costs = [];

    for (let i = 0; i < longer.length + 1; i++) {
      let lastValue = i;
      for (let j = 0; j < shorter.length + 1; j++) {
        if (i === 0) costs[j] = j;
        else if (j > 0) {
          let newValue = costs[j - 1];
          if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[shorter.length] = lastValue;
    }

    return costs[shorter.length];
  }

  /**
   * Calculate similarity score (0-1)
   */
  calculateSimilarity(s1, s2) {
    const maxLen = Math.max(s1.length, s2.length);
    if (maxLen === 0) return 1;
    const distance = this.levenshteinDistance(s1, s2);
    return 1 - distance / maxLen;
  }

  /**
   * Full-text search across tags
   */
  fullTextSearch(query, allTags = []) {
    if (!query || typeof query !== 'string') return [];

    const normalizedQuery = this.normalize(query);
    const results = [];

    for (const tag of allTags) {
      const tagName = String(tag.name || tag);
      const normalized = this.normalize(tagName);
      const description = String(tag.description || '').toLowerCase();

      // Exact match (highest score)
      if (normalized === normalizedQuery) {
        results.push({ tag: tagName, score: 1.0, matchType: 'exact' });
      }
      // Starts with (high score)
      else if (normalized.startsWith(normalizedQuery)) {
        results.push({ tag: tagName, score: 0.9, matchType: 'prefix' });
      }
      // Contains (medium score)
      else if (normalized.includes(normalizedQuery)) {
        results.push({ tag: tagName, score: 0.7, matchType: 'substring' });
      }
      // Description match
      else if (description.includes(normalizedQuery)) {
        results.push({ tag: tagName, score: 0.5, matchType: 'description' });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Fuzzy search for typo tolerance
   */
  fuzzySearch(query, allTags = [], maxDistance = 2) {
    if (!query || typeof query !== 'string') return [];

    const normalizedQuery = this.normalize(query);
    const results = [];

    for (const tag of allTags) {
      const tagName = String(tag.name || tag);
      const normalized = this.normalize(tagName);
      const distance = this.levenshteinDistance(normalizedQuery, normalized);

      if (distance <= maxDistance) {
        const similarity = this.calculateSimilarity(normalizedQuery, normalized);
        results.push({
          tag: tagName,
          distance,
          similarity,
          score: (1 - distance / Math.max(normalizedQuery.length, normalized.length))
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Autocomplete suggestions
   */
  autocomplete(query, allTags = [], limit = 10) {
    if (!query || typeof query !== 'string') return [];

    const normalizedQuery = this.normalize(query);
    const suggestions = [];

    for (const tag of allTags) {
      const tagName = String(tag.name || tag);
      const normalized = this.normalize(tagName);

      if (normalized.startsWith(normalizedQuery)) {
        suggestions.push({
          tag: tagName,
          displayName: tag.name || tagName,
          icon: tag.icon || '🏷️'
        });
      }
    }

    return suggestions.slice(0, limit);
  }

  /**
   * Filter tags by criteria
   */
  filterTags(allTags = {}, criteria = {}) {
    let results = Object.entries(allTags);

    // Filter by category
    if (criteria.category) {
      results = results.filter(([, tag]) =>
        (tag.category || '').toLowerCase() === criteria.category.toLowerCase()
      );
    }

    // Filter by usage frequency
    if (criteria.minUsage !== undefined) {
      results = results.filter(([, tag]) =>
        (tag.usageCount || 0) >= criteria.minUsage
      );
    }

    // Filter by creation date
    if (criteria.since) {
      results = results.filter(([, tag]) =>
        new Date(tag.createdAt) >= new Date(criteria.since)
      );
    }

    // Filter by name pattern
    if (criteria.namePattern) {
      const regex = new RegExp(criteria.namePattern, 'i');
      results = results.filter(([tagName]) => regex.test(tagName));
    }

    // Exclude deprecated
    if (criteria.excludeDeprecated !== false) {
      results = results.filter(([, tag]) => !tag.deprecated);
    }

    // Sort by usage
    if (criteria.sortByUsage) {
      results.sort((a, b) => (b[1].usageCount || 0) - (a[1].usageCount || 0));
    }

    return Object.fromEntries(results);
  }

  /**
   * Add search to history
   */
  addToHistory(query) {
    if (!query) return;
    this.searchHistory.unshift(query);
    if (this.searchHistory.length > this.maxHistorySize) {
      this.searchHistory.pop();
    }
  }

  /**
   * Get search history
   */
  getHistory(limit = 10) {
    return [...new Set(this.searchHistory)].slice(0, limit);
  }

  /**
   * Clear search history
   */
  clearHistory() {
    this.searchHistory = [];
  }
}

// Create global instance
window.tagSearchEngine = window.tagSearchEngine || new TagSearchEngine();

// ============================================================
// SECTION 9: TAG CONFLICT DETECTION
// ============================================================

class TagConflictDetector {
  constructor() {
    // Define conflicting tag pairs/groups
    this.conflicts = {
      'Easy': ['Challenging', 'Advanced', 'Difficult', 'Strenuous', 'Technical'],
      'Challenging': ['Easy', 'Beginner-Friendly', 'Simple', 'Gentle'],
      'Budget-Friendly': ['Upscale', 'Fine Dining', 'Luxury', 'High-End', 'Premium'],
      'Upscale': ['Budget-Friendly', 'Affordable', 'Cheap', 'Budget'],
      'Popular/Crowded': ['Hidden Gem', 'Off the Radar', 'Secret Location', 'Lesser Known'],
      'Hidden Gem': ['Touristy', 'Popular/Crowded', 'Crowded', 'Busy'],
      'Touristy': ['Authentic', 'Local Favorite', 'Hidden Gem'],
      'Authentic Experience': ['Touristy', 'Commercialized', 'Tourist Trap'],
      'Free': ['Paid Admission', 'Paid', 'Entry Fee'],
      'Paid Admission': ['Free', 'No Charge', 'Complimentary'],
      'Quick Visit': ['Half-Day+ Experience', 'Multi-Day Experience', 'Weekend Destination'],
      'Half-Day+ Experience': ['Quick Visit'],
      'Relaxing': ['Adventure', 'Thrilling', 'Adrenaline', 'Challenging'],
      'Adventure': ['Relaxing', 'Peaceful', 'Calm'],
      'Family-Friendly': ['Adults Only', 'Mature Content', 'Risky'],
      'Quiet': ['Busy', 'Loud', 'Popular/Crowded', 'Lively'],
      'Lively': ['Quiet', 'Peaceful', 'Calm', 'Serene'],
      'Summer Destination': ['Winter Activity', 'Cold Weather', 'Snow'],
      'Winter Activity': ['Summer Destination', 'Hot Weather', 'Heat'],
      'Wheelchair-Accessible': ['Steep Terrain', 'Difficult Terrain', 'Technical Rocks'],
      'Beginner-Friendly': ['Expert-Only', 'Advanced Climbers', 'Technical'],
    };

    // Warnings - tags that are compatible but might need verification
    this.warnings = {
      'Upscale': ['Casual', 'Budget Hack', 'Deal Hunting'],
      'Family-Friendly': ['Late Night', 'Bar Scene', 'Adult Entertainment'],
      'Photography-Worthy': ['Hidden Gem'], // Hidden gems are hard to photograph if truly hidden
      'Romantic': ['Family-Friendly'], // Can be both but might be confusing
      'Wheelchair-Accessible': ['Steep Climb', 'Long Hike'],
    };
  }

  /**
   * Detect conflicts between tags
   */
  detectConflicts(tags) {
    if (!Array.isArray(tags)) return [];

    const conflicts = [];
    const tagSet = new Set(tags.map(t => String(t).trim()));

    for (const tag of tags) {
      const conflictingTags = this.conflicts[tag] || [];
      for (const conflicting of conflictingTags) {
        if (tagSet.has(conflicting)) {
          conflicts.push({
            tag1: tag,
            tag2: conflicting,
            severity: 'conflict',
            message: `"${tag}" and "${conflicting}" are contradictory`,
            recommendation: `Consider removing one of these tags`
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Detect warnings (compatible but unusual combinations)
   */
  detectWarnings(tags) {
    if (!Array.isArray(tags)) return [];

    const warnings = [];
    const tagSet = new Set(tags.map(t => String(t).trim()));

    for (const tag of tags) {
      const warningTags = this.warnings[tag] || [];
      for (const warning of warningTags) {
        if (tagSet.has(warning)) {
          warnings.push({
            tag1: tag,
            tag2: warning,
            severity: 'warning',
            message: `"${tag}" and "${warning}" are usually separate`,
            recommendation: `Verify this combination makes sense for this location`
          });
        }
      }
    }

    return warnings;
  }

  /**
   * Full validation - conflicts + warnings
   */
  validate(tags) {
    const conflicts = this.detectConflicts(tags);
    const warnings = this.detectWarnings(tags);
    const issues = [...conflicts, ...warnings];

    return {
      valid: conflicts.length === 0,
      conflictCount: conflicts.length,
      warningCount: warnings.length,
      issues,
      conflicts,
      warnings,
      summary: {
        hasConflicts: conflicts.length > 0,
        hasWarnings: warnings.length > 0,
        message: conflicts.length > 0 ? `${conflicts.length} conflict(s) found` : warnings.length > 0 ? `${warnings.length} warning(s)` : 'No issues detected'
      }
    };
  }

  /**
   * Suggest fixes for conflicts
   */
  suggestFixes(tags) {
    const conflicts = this.detectConflicts(tags);
    const suggestions = [];

    for (const conflict of conflicts) {
      suggestions.push({
        conflict: `${conflict.tag1} ↔ ${conflict.tag2}`,
        options: [
          `Remove "${conflict.tag1}" and keep "${conflict.tag2}"`,
          `Remove "${conflict.tag2}" and keep "${conflict.tag1}"`,
          `Review the location data - one tag may be incorrect`
        ]
      });
    }

    return suggestions;
  }
}

// Create global instance
window.tagConflictDetector = window.tagConflictDetector || new TagConflictDetector();

// ============================================================
// SECTION 10: SMART TAG DEDUPLICATION
// ============================================================

class TagDeduplicator {
  constructor() {
    this.deduplicationBuffer = [];
  }

  /**
   * Find near-duplicate tags
   */
  findNearDuplicates(tags, similarityThreshold = 0.75) {
    if (!Array.isArray(tags)) return [];

    const searchEngine = window.tagSearchEngine || new TagSearchEngine();
    const duplicates = [];
    const checked = new Set();

    for (let i = 0; i < tags.length; i++) {
      const tag1 = tags[i];
      if (checked.has(tag1)) continue;

      for (let j = i + 1; j < tags.length; j++) {
        const tag2 = tags[j];
        if (checked.has(tag2)) continue;

        const similarity = searchEngine.calculateSimilarity(
          searchEngine.normalize(tag1),
          searchEngine.normalize(tag2)
        );

        if (similarity >= similarityThreshold) {
          duplicates.push({
            primary: tag1,
            duplicate: tag2,
            similarity: Math.round(similarity * 100),
            action: 'merge'
          });
          checked.add(tag2);
        }
      }
    }

    return duplicates;
  }

  /**
   * Find tags with different casing
   */
  findCasingVariants(tags) {
    if (!Array.isArray(tags)) return [];

    const tagMap = new Map();
    const variants = [];

    for (const tag of tags) {
      const normalized = String(tag).toLowerCase().trim();
      if (!tagMap.has(normalized)) {
        tagMap.set(normalized, []);
      }
      tagMap.get(normalized).push(tag);
    }

    for (const [normalized, variants_list] of tagMap.entries()) {
      if (variants_list.length > 1) {
        variants.push({
          variants: variants_list,
          normalized,
          count: variants_list.length,
          recommendation: `Standardize to one casing: "${variants_list[0]}"`
        });
      }
    }

    return variants;
  }

  /**
   * Find tags with extra spaces
   */
  findSpacingVariants(tags) {
    if (!Array.isArray(tags)) return [];

    const tagMap = new Map();
    const variants = [];

    for (const tag of tags) {
      const normalized = String(tag).replace(/\s+/g, ' ').trim();
      if (!tagMap.has(normalized)) {
        tagMap.set(normalized, []);
      }
      tagMap.get(normalized).push(tag);
    }

    for (const [normalized, variants_list] of tagMap.entries()) {
      if (variants_list.length > 1) {
        variants.push({
          variants: variants_list,
          normalized,
          count: variants_list.length,
          recommendation: `Consolidate spacing: "${normalized}"`
        });
      }
    }

    return variants;
  }

  /**
   * Comprehensive deduplication analysis
   */
  analyze(tags) {
    if (!Array.isArray(tags)) return { success: false, error: 'Tags must be an array' };

    const analysis = {
      originalCount: tags.length,
      uniqueCount: new Set(tags).size,
      duplicates: [],
      cassingVariants: [],
      spacingVariants: [],
      aliasGroups: [],
      suggestions: []
    };

    // Near-duplicates
    analysis.duplicates = this.findNearDuplicates(tags, 0.8);

    // Casing variants
    analysis.cassingVariants = this.findCasingVariants(tags);

    // Spacing variants
    analysis.spacingVariants = this.findSpacingVariants(tags);

    // Alias groups
    for (const tag of new Set(tags)) {
      const aliases = TAG_ALIASES[tag] || [];
      const foundAliases = tags.filter(t => aliases.includes(t));
      if (foundAliases.length > 0) {
        analysis.aliasGroups.push({
          primary: tag,
          aliases: foundAliases,
          count: foundAliases.length
        });
      }
    }

    // Generate suggestions
    const possibleReductions = analysis.duplicates.length +
                              analysis.cassingVariants.length +
                              analysis.spacingVariants.length +
                              analysis.aliasGroups.length;

    analysis.suggestions = [
      ...analysis.cassingVariants.map(v => v.recommendation),
      ...analysis.spacingVariants.map(v => v.recommendation),
      ...analysis.duplicates.map(d => `Merge "${d.duplicate}" into "${d.primary}"`),
      ...analysis.aliasGroups.map(g => `Consider merging ${g.aliases.length} alias variant(s) of "${g.primary}"`)
    ];

    analysis.summary = {
      hasDuplicates: analysis.duplicates.length > 0,
      hasVariants: analysis.cassingVariants.length + analysis.spacingVariants.length > 0,
      hasAliases: analysis.aliasGroups.length > 0,
      possibleReductions,
      recommendation: possibleReductions > 0 ? `${possibleReductions} deduplication action(s) available` : 'No deduplication needed'
    };

    return analysis;
  }

  /**
   * Deduplicate tags - returns cleaned array
   */
  deduplicate(tags) {
    if (!Array.isArray(tags)) return [];

    let cleaned = [...tags];

    // 1. Fix spacing
    cleaned = cleaned.map(t => String(t).replace(/\s+/g, ' ').trim());

    // 2. Standardize casing
    const caseMap = new Map();
    for (const tag of cleaned) {
      const lower = tag.toLowerCase();
      if (!caseMap.has(lower)) {
        caseMap.set(lower, tag);
      }
    }
    cleaned = cleaned.map(t => caseMap.get(t.toLowerCase()));

    // 3. Resolve aliases
    cleaned = normalizeTags(cleaned);

    // 4. Remove duplicates
    return Array.from(new Set(cleaned));
  }

  /**
   * Merge near-duplicate tags
   */
  mergeTags(tag1, tag2) {
    return {
      mergedTag: tag1,
      removedTag: tag2,
      reason: 'Merged near-identical tags',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get deduplication stats
   */
  getStats() {
    return {
      buffer: this.deduplicationBuffer.length,
      pendingActions: this.deduplicationBuffer.filter(a => a.status === 'pending').length,
      completedActions: this.deduplicationBuffer.filter(a => a.status === 'completed').length,
      recentActions: this.deduplicationBuffer.slice(-5)
    };
  }
}

// Create global instance
window.tagDeduplicator = window.tagDeduplicator || new TagDeduplicator();

// ============================================================
// INITIALIZATION
// ============================================================

console.log('✅ Consolidated Tag Management System v7.0.200 Loaded');
console.log('  - Configuration & Styling');
console.log('  - Hierarchy System');
console.log('  - Tag Manager (Core)');
console.log('  - Tag Recommendations');
console.log('  - Auto-Tagging System');
console.log('  - Cross-Context Utilities');
console.log('  - Tag Aliases & Synonyms');
console.log('  - Custom Tag Registry');
console.log('  - Search & Filtering Engine');
console.log('  - Conflict Detection');
console.log('  - Smart Deduplication');

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Configuration
    TAG_CONFIG,
    TAG_HIERARCHY,
    TAG_ALIASES,

    // Core Classes
    TagManager,
    CustomTagRegistry,
    TagSearchEngine,
    TagConflictDetector,
    TagDeduplicator,

    // Utilities
    getTagStyle,
    renderTagBadge,
    getAllAvailableTags,
    getFromContext,
    showToastCrossContext,

    // Alias functions
    resolveTagAlias,
    getTagAliases,
    normalizeTags,

    // Global instances
    tagManager: window.tagManager,
    customTagRegistry: window.customTagRegistry,
    tagSearchEngine: window.tagSearchEngine,
    tagConflictDetector: window.tagConflictDetector,
    tagDeduplicator: window.tagDeduplicator
  };
}

