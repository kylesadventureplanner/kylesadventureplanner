/**
 * TAG MANAGEMENT SYSTEM
 * =====================
 * Comprehensive tag management for Adventure Finder with:
 * - Single & Batch tag operations (add/edit/remove)
 * - Tag recommendations based on place type
 * - Excel integration for tag persistence
 * - Beautiful UI for tag management
 *
 * Version: v7.0.112+
 * Date: March 11, 2026
 */

class TagManager {
  constructor() {
    this.tags = new Map();
    this.recommendations = this.initializeRecommendations();
    this.storageKey = 'adventureFinderTags';
    this.loadTags();
  }

  /**
   * Initialize tag recommendations based on place characteristics
   */
  initializeRecommendations() {
    return {
      // Activity-based recommendations
      hiking: ['outdoor', 'nature', 'exercise', 'scenic', 'family-friendly'],
      camping: ['outdoor', 'nature', 'family-friendly', 'adventure', 'budget'],
      fishing: ['outdoor', 'nature', 'relaxing', 'water-based', 'wildlife'],
      skiing: ['outdoor', 'sports', 'winter', 'adventure', 'challenging'],
      beach: ['outdoor', 'water-based', 'relaxing', 'family-friendly', 'scenic'],
      kayaking: ['water-based', 'outdoor', 'adventure', 'sports', 'scenic'],
      rock_climbing: ['outdoor', 'adventure', 'sports', 'challenging', 'scenic'],
      biking: ['outdoor', 'sports', 'nature', 'exercise', 'scenic'],

      // Difficulty-based recommendations
      easy: ['beginner-friendly', 'family-friendly', 'accessible'],
      moderate: ['intermediate', 'fit-required', 'scenic'],
      hard: ['challenging', 'experienced-only', 'adventure'],

      // Season-based recommendations
      summer: ['outdoor', 'warm-weather', 'family-friendly'],
      winter: ['snow', 'cold-weather', 'adventure'],
      spring: ['nature', 'scenic', 'wildflowers'],
      fall: ['nature', 'scenic', 'foliage'],

      // Cost-based recommendations
      free: ['budget', 'family-friendly', 'accessible'],
      paid: ['developed', 'facilities', 'maintained'],

      // Type-based recommendations
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

      // Rating-based recommendations
      highly_rated: ['must-visit', 'popular', 'quality'],
      low_rated: ['needs-improvement', 'caution', 'check-reviews'],
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
   * Get tags for a place (by Place ID or name)
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
   * Get recommended tags for a place based on characteristics
   */
  getRecommendedTags(characteristics) {
    const recommended = new Set();

    // characteristics should be an array or object with keys matching recommendation categories
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
   * Get all unique tags across all places
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
   * Add tags to multiple places (batch operation)
   */
  addTagsToBatchPlaces(placeIdentifiers, tagsToAdd) {
    const results = {
      successful: [],
      failed: [],
      noChange: []
    };

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
   * Remove tags from multiple places (batch operation)
   */
  removeTagsFromBatchPlaces(placeIdentifiers, tagsToRemove) {
    const results = {
      successful: [],
      failed: [],
      noChange: []
    };

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
   * ========== HIERARCHY SUPPORT METHODS ==========
   * These methods work with TAG_HIERARCHY to provide category-based organization
   */

  /**
   * Get tags organized by category hierarchy
   * @returns {object} Nested structure of categories and tags
   */
  getTagsByHierarchy() {
    if (typeof TAG_HIERARCHY === 'undefined') return null;

    const result = {};
    const categories = TAG_HIERARCHY.getAllCategories();

    for (const category of categories) {
      const tags = TAG_HIERARCHY.getTagsInCategory(category);
      result[category] = tags;
    }
    return result;
  }

  /**
   * Get category information for a specific tag
   * @param {string} tagName
   * @returns {object} Category, subcategory, and icons
   */
  getTagCategoryInfo(tagName) {
    if (typeof TAG_HIERARCHY === 'undefined') return null;
    return TAG_HIERARCHY.getTagCategory(tagName);
  }

  /**
   * Get related tags (same category, different subcategory)
   * @param {string} tagName
   * @returns {array} Related tags
   */
  getRelatedTags(tagName) {
    if (typeof TAG_HIERARCHY === 'undefined') return [];
    return TAG_HIERARCHY.getRelatedTags(tagName);
  }

  /**
   * Get sibling tags (same subcategory)
   * @param {string} tagName
   * @returns {array} Sibling tags
   */
  getSiblingTags(tagName) {
    if (typeof TAG_HIERARCHY === 'undefined') return [];
    return TAG_HIERARCHY.getSiblingTags(tagName);
  }

  /**
   * Get tag affinity scores for intelligent recommendations
   * @param {string} tagName
   * @returns {object} Map of tags with affinity scores
   */
  getTagAffinities(tagName) {
    if (typeof TAG_HIERARCHY === 'undefined') return {};
    return TAG_HIERARCHY.getTagAffinities(tagName);
  }

  /**
   * Suggest tags based on existing tags on a place
   * Considers hierarchy and affinity
   * @param {string} placeIdentifier
   * @param {number} limit How many suggestions to return
   * @returns {array} Suggested tag names with scores
   */
  suggestTagsForPlace(placeIdentifier, limit = 5) {
    const existingTags = this.getTagsForPlace(placeIdentifier);
    if (existingTags.length === 0) return [];

    const suggestions = new Map();

    // For each existing tag, get related tags
    for (const tag of existingTags) {
      const relatedTags = this.getRelatedTags(tag);
      const siblingTags = this.getSiblingTags(tag);
      const affinities = this.getTagAffinities(tag);

      // Add related and sibling tags as suggestions
      [...relatedTags, ...siblingTags].forEach(sugTag => {
        if (!existingTags.includes(sugTag)) {
          const currentScore = suggestions.get(sugTag) || 0;
          const newScore = currentScore + (affinities[sugTag] || 0.5);
          suggestions.set(sugTag, newScore);
        }
      });
    }

    // Sort by score and return top N
    return Array.from(suggestions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, score]) => ({ tag, score: Math.round(score * 100) / 100 }));
  }

  /**
   * Get all tags in a specific category
   * @param {string} categoryName
   * @returns {array} Tags in the category
   */
  getTagsInCategory(categoryName) {
    if (typeof TAG_HIERARCHY === 'undefined') return [];
    return TAG_HIERARCHY.getTagsInCategory(categoryName);
  }

  /**
   * Filter places by tag hierarchy
   * More flexible than simple tag matching
   * @param {array} places Array of places with tags
   * @param {array} tagsToMatch Tags to filter by
   * @param {string} matchMode 'any' or 'all'
   * @returns {array} Filtered places
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
   * Get tag hierarchy statistics
   * Useful for analytics and UI optimization
   * @returns {object} Statistics about tag usage
   */
  getHierarchyStats() {
    if (typeof TAG_HIERARCHY === 'undefined') return null;

    const stats = {
      totalCategories: TAG_HIERARCHY.getAllCategories().length,
      totalTags: 0,
      tagsByCategory: {},
      mostUsedTags: [],
      leastUsedTags: [],
      categoryCoverage: {}
    };

    // Count tags by category
    for (const category of TAG_HIERARCHY.getAllCategories()) {
      const tags = TAG_HIERARCHY.getTagsInCategory(category);
      stats.totalTags += tags.length;
      stats.tagsByCategory[category] = tags.length;

      // Count places using tags in this category
      let categoryUsageCount = 0;
      for (const tag of tags) {
        for (const [placeId, placeTags] of this.tags.entries()) {
          if (placeTags.includes(tag)) categoryUsageCount++;
        }
      }
      stats.categoryCoverage[category] = categoryUsageCount;
    }

    // Find most/least used tags
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
window.tagManager = new TagManager();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TagManager;
}

