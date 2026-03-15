/**
 * TAG HIERARCHY SYSTEM
 * ====================
 * Defines a hierarchical structure for tags without modifying the flat tag system.
 * This metadata layer organizes existing tags into categories and subcategories
 * for improved browsing and discovery while maintaining backward compatibility.
 *
 * Architecture:
 * - Pure reference data structure (no side effects)
 * - Maps existing flat tags to hierarchical positions
 * - Enables parent→child and sibling relationships
 * - Optional: tags can belong to multiple hierarchies
 *
 * Version: v7.0.113
 * Date: March 13, 2026
 */

const TAG_HIERARCHY = {
  // Root categories
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
   * Convenience method: Get all tags in a category
   * @param {string} categoryName
   * @returns {array} Flat array of all tags in category
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
   * @param {string} tagName
   * @returns {object|null} {category, subcategory, icon, description}
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
   * Get all tags that share the same subcategory (siblings)
   * @param {string} tagName
   * @returns {array} Sibling tags (excluding the tag itself)
   */
  getSiblingTags(tagName) {
    const catInfo = this.getTagCategory(tagName);
    if (!catInfo) return [];

    const subcategoryTags = this.categories[catInfo.category]
      .subcategories[catInfo.subcategory].tags;

    return subcategoryTags.filter(t => t !== tagName);
  },

  /**
   * Get tags in the same category but different subcategory
   * @param {string} tagName
   * @returns {array} Related tags in same category
   */
  getRelatedTags(tagName) {
    const catInfo = this.getTagCategory(tagName);
    if (!catInfo) return [];

    return this.getTagsInCategory(catInfo.category)
      .filter(t => t !== tagName);
  },

  /**
   * Get all root categories
   * @returns {array} Array of category names
   */
  getAllCategories() {
    return Object.keys(this.categories);
  },

  /**
   * Get subcategories for a category
   * @param {string} categoryName
   * @returns {object} Subcategories with their tags
   */
  getSubcategories(categoryName) {
    return this.categories[categoryName]?.subcategories || {};
  },

  /**
   * Get hierarchical tree structure
   * @returns {object} Full tree representation
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
   * Calculate tag co-occurrence - which tags are frequently used together
   * This is a placeholder that can be enhanced with actual usage data
   * @param {string} tagName
   * @returns {object} Score of related tags (higher = more similar)
   */
  getTagAffinities(tagName) {
    const catInfo = this.getTagCategory(tagName);
    if (!catInfo) return {};

    const affinities = {};

    // Siblings have high affinity (same subcategory)
    this.getSiblingTags(tagName).forEach(tag => {
      affinities[tag] = 0.8;
    });

    // Related tags have medium affinity (same category)
    this.getRelatedTags(tagName).forEach(tag => {
      if (!affinities[tag]) {
        affinities[tag] = 0.4;
      }
    });

    return affinities;
  }
};

/**
 * Export for use in modules
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TAG_HIERARCHY };
}

