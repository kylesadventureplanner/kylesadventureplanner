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
}

// Create global instance
window.tagManager = new TagManager();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TagManager;
}

