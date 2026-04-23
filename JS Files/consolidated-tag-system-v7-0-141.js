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
 *
 * Version: 7.0.141
 * Date: March 15, 2026
 * Created: Consolidated from 9 separate tag files
 */

console.log('🏷️ Consolidated Tag Management System v7.0.141 Loading...');

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
    showProgress = true,
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

  // Text-based tag recommendation rules (mirrors buildTagRecommendations in details window)
  const RULE_MAP = [
    { keys: ['hike', 'trail', 'hiking', 'trekking', 'mountain', 'alpine'], tags: ['Hiking', 'Outdoor', 'Nature', 'Scenic', 'Adventure'] },
    { keys: ['waterfall', 'cascade', 'falls'], tags: ['Waterfall', 'Nature', 'Scenic', 'Photography', 'Outdoor'] },
    { keys: ['park', 'garden', 'botanical', 'arboretum'], tags: ['Park', 'Nature', 'Family-Friendly', 'Relaxing', 'Scenic'] },
    { keys: ['lake', 'river', 'stream', 'pond', 'creek', 'water'], tags: ['Water Activity', 'Nature', 'Scenic', 'Family-Friendly'] },
    { keys: ['forest', 'woods', 'woodland', 'grove'], tags: ['Nature', 'Hiking', 'Outdoor', 'Relaxing', 'Scenic'] },
    { keys: ['beach', 'shore', 'coast', 'seaside'], tags: ['Beach', 'Outdoor', 'Family-Friendly', 'Scenic', 'Relaxing'] },
    { keys: ['camping', 'camp site', 'campground'], tags: ['Camping', 'Outdoor', 'Adventure', 'Family-Friendly'] },
    { keys: ['restaurant', 'bistro', 'steakhouse', 'grill', 'eatery'], tags: ['Restaurant', 'Dining', 'Local Favorite', 'Worth Visiting'] },
    { keys: ['cafe', 'coffee', 'espresso', 'tea house'], tags: ['Cafe', 'Coffee', 'Local Favorite', 'Relaxing'] },
    { keys: ['diner', 'fast food', 'quick bite'], tags: ['Casual Dining', 'Quick Service'] },
    { keys: ['bakery', 'pastry'], tags: ['Bakery', 'Local Favorite', 'Worth Visiting'] },
    { keys: ['brewery', 'winery', 'distillery', 'bar', 'pub'], tags: ['Beverage', 'Adult Experience', 'Local Favorite'] },
    { keys: ['shop', 'store', 'retail', 'boutique'], tags: ['Shopping', 'Local Business', 'Worth Visiting'] },
    { keys: ['market', 'farmers market', 'farmer market'], tags: ['Market', 'Local Business', 'Family-Friendly', 'Worth Visiting'] },
    { keys: ['museum', 'gallery', 'exhibition', 'exhibit'], tags: ['Museum', 'Cultural', 'Historical', 'Educational', 'Indoor Activity'] },
    { keys: ['historic', 'history', 'monument', 'landmark', 'heritage'], tags: ['Historical', 'Cultural', 'Worth Visiting', 'Educational'] },
    { keys: ['art', 'artist', 'sculpture', 'craft'], tags: ['Cultural', 'Artistic', 'Local Business'] },
    { keys: ['gym', 'fitness', 'yoga', 'pilates'], tags: ['Fitness', 'Health & Wellness'] },
    { keys: ['sport', 'athletic', 'court', 'field', 'stadium'], tags: ['Sports', 'Active', 'Family-Friendly'] },
    { keys: ['movie', 'cinema', 'theater', 'theatre'], tags: ['Entertainment', 'Family-Friendly', 'Indoor Activity'] },
    { keys: ['music', 'concert', 'live performance', 'festival'], tags: ['Entertainment', 'Local Favorite', 'Worth Visiting'] },
    { keys: ['amusement', 'theme park', 'carnival'], tags: ['Entertainment', 'Family-Friendly', 'Fun', 'Adventure'] },
    { keys: ['hotel', 'motel', 'inn', 'resort'], tags: ['Accommodation', 'Travel-Friendly'] },
    { keys: ['wildlife', 'animal', 'bird', 'zoo', 'aquarium', 'nature center'], tags: ['Wildlife', 'Nature', 'Family-Friendly', 'Educational', 'Outdoor'] },
    { keys: ['viewpoint', 'overlook', 'vista', 'lookout'], tags: ['Scenic', 'Photography', 'Outdoor', 'Must-See'] }
  ];

  function getTagsForLocationText(locationData) {
    const textParts = [
      locationData.name || '',
      locationData.description || '',
      locationData.tags || '',
      locationData.city || '',
      locationData.address || '',
      locationData.notes || ''
    ];
    const fullText = textParts.join(' ').toLowerCase();

    const recommended = new Set();
    RULE_MAP.forEach((rule) => {
      const matched = rule.keys.some((k) => fullText.includes(k));
      if (matched) rule.tags.forEach((t) => recommended.add(t));
    });

    // Rating-based tags from Google rating string
    const rating = parseFloat(locationData.googleRating || locationData.rating || 0);
    if (rating >= 4.7) { recommended.add('Top Rated'); recommended.add('Worth Visiting'); }
    else if (rating >= 4.3) { recommended.add('Highly Recommended'); }

    return Array.from(recommended);
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
              changedRows.push({ rowIndex: index, values: Array.isArray(values) ? values.slice() : [] });
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
            const saveResult = await mainWindow.saveToExcel(row.rowIndex, row.values);
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
// INITIALIZATION
// ============================================================

console.log('✅ Consolidated Tag Management System v7.0.141 Loaded');
console.log('  - Configuration & Styling');
console.log('  - Hierarchy System');
console.log('  - Tag Manager (Core)');
console.log('  - Tag Recommendations');
console.log('  - Auto-Tagging System');
console.log('  - Cross-Context Utilities');

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TAG_CONFIG,
    TAG_HIERARCHY,
    TagManager,
    getTagStyle,
    renderTagBadge,
    getAllAvailableTags,
    getFromContext,
    showToastCrossContext
  };
}

