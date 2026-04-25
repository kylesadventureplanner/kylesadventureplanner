/**
 * AUTO-COST INFERENCE ENGINE
 * ==========================
 * Automatically infers cost/pricing information when adding new locations
 *
 * Features:
 * - Analyzes location type, name, and description
 * - Detects price keywords and indicators
 * - Infers pricing tier (Free, Budget, Mid-Range, Upscale, Luxury)
 * - Provides cost range estimates
 * - Caches predictions
 * - Handles various location categories
 *
 * Version: 1.0.0
 * Date: April 24, 2026
 */

console.log('💰 Auto-Cost Inference Engine Loading...');

// ============================================================
// CONFIGURATION
// ============================================================

const AUTO_COST_CONFIG = {
  // Cost tiers
  costTiers: {
    FREE: 'Free',
    BUDGET: 'Budget-Friendly',
    MIDRANGE: 'Mid-Range',
    UPSCALE: 'Upscale',
    LUXURY: 'Luxury'
  },

  // Cost tier colors (for UI)
  tierColors: {
    'Free': '#10b981',           // Green
    'Budget-Friendly': '#3b82f6', // Blue
    'Mid-Range': '#f59e0b',       // Amber
    'Upscale': '#8b5cf6',         // Purple
    'Luxury': '#dc2626'            // Red
  },

  // Cost tier icons
  tierIcons: {
    'Free': '🆓',
    'Budget-Friendly': '💵',
    'Mid-Range': '💳',
    'Upscale': '🥂',
    'Luxury': '👑'
  },

  // Estimated price ranges per tier (USD)
  priceRanges: {
    'Free': { min: 0, max: 0, label: '$0' },
    'Budget-Friendly': { min: 1, max: 15, label: '$1-15' },
    'Mid-Range': { min: 15, max: 50, label: '$15-50' },
    'Upscale': { min: 50, max: 150, label: '$50-150' },
    'Luxury': { min: 150, max: 500, label: '$150+' }
  },

  // Cache duration
  cacheDurationMs: 3600000 // 1 hour
};

// ============================================================
// COST INFERENCE ENGINE
// ============================================================

class AutoCostInferenceEngine {
  constructor(config = {}) {
    this.config = { ...AUTO_COST_CONFIG, ...config };
    this.cache = new Map();
    this.keywordPatterns = this.buildKeywordPatterns();
    console.log('💰 Auto-Cost Inference Engine initialized');
  }

  /**
   * Build keyword patterns for cost detection
   */
  buildKeywordPatterns() {
    return {
      // Free indicators
      free: {
        keywords: ['free', 'no charge', 'no cost', 'complimentary', 'gratis', 'park', 'public beach', 'nature trail'],
        tier: 'Free',
        confidence: 0.95
      },

      // Budget indicators
      budget: {
        keywords: ['cheap', 'affordable', 'budget', 'inexpensive', 'taco', 'food truck', 'fast food', 'diner', 'hole in the wall', 'local spot', '$', 'under $', 'cheap eats'],
        tier: 'Budget-Friendly',
        confidence: 0.85
      },

      // Mid-range indicators
      midrange: {
        keywords: ['restaurant', 'casual', 'moderate', 'standard', 'typical', 'regular', 'decent', 'good food', 'nice place', '$$', 'mid-range'],
        tier: 'Mid-Range',
        confidence: 0.75
      },

      // Upscale indicators
      upscale: {
        keywords: ['upscale', 'fine dining', 'elegant', 'sophisticated', 'upmarket', 'premium', 'gourmet', 'high-end', 'boutique', 'exclusive', '$$$', 'cocktail bar', 'wine bar'],
        tier: 'Upscale',
        confidence: 0.90
      },

      // Luxury indicators
      luxury: {
        keywords: ['luxury', 'michelin', 'fine dining', 'five-star', '5-star', 'exclusive', 'ultra-luxury', 'prestige', '$$$$', 'penthouse', 'vip', 'private club', 'resort'],
        tier: 'Luxury',
        confidence: 0.95
      },

      // Activity indicators
      activities: {
        'hiking': 'Free',
        'trail': 'Free',
        'beach': 'Free',
        'park': 'Free',
        'museum': 'Mid-Range',
        'zoo': 'Mid-Range',
        'aquarium': 'Mid-Range',
        'movie theater': 'Budget-Friendly',
        'cinema': 'Budget-Friendly',
        'concert': 'Upscale',
        'theater': 'Upscale',
        'spa': 'Upscale',
        'hotel': 'Mid-Range',
        'resort': 'Upscale',
        'hostel': 'Budget-Friendly',
        'airbnb': 'Mid-Range',
        'cafe': 'Budget-Friendly',
        'coffee': 'Budget-Friendly',
        'bar': 'Mid-Range',
        'nightclub': 'Mid-Range',
        'golf': 'Upscale',
        'ski': 'Upscale',
        'gym': 'Budget-Friendly',
        'yoga': 'Mid-Range'
      }
    };
  }

  /**
   * Infer cost tier from location data
   */
  inferCostTier(locationData) {
    const cacheKey = `${(locationData.name || '').toLowerCase()}_${(locationData.description || '').substring(0, 50).toLowerCase()}`;

    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.config.cacheDurationMs) {
        return cached.data;
      }
    }

    const result = this.analyzeLocationData(locationData);

    // Cache result
    this.cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  }

  /**
   * Analyze location data to infer cost
   */
  analyzeLocationData(locationData) {
    const name = (locationData.name || '').toLowerCase();
    const description = (locationData.description || '').toLowerCase();
    const type = (locationData.type || '').toLowerCase();
    const fullText = `${name} ${description} ${type}`;

    let costScores = {};

    // Score each tier
    for (const [tierKey, tierData] of Object.entries(this.keywordPatterns)) {
      if (tierKey === 'activities') continue;

      costScores[tierData.tier] = this.calculateTierScore(
        fullText,
        tierData.keywords,
        tierData.confidence
      );
    }

    // Check activity type
    const activityScore = this.scoreActivityType(fullText);
    if (activityScore) {
      costScores[activityScore.tier] = Math.max(
        costScores[activityScore.tier] || 0,
        activityScore.score
      );
    }

    // Find highest scoring tier
    const topTier = Object.entries(costScores).sort(([, a], [, b]) => b - a)[0];
    const selectedTier = topTier ? topTier[0] : 'Mid-Range';
    const confidence = topTier ? topTier[1] : 0.5;

    return {
      tier: selectedTier,
      confidence: Math.min(confidence, 1),
      priceRange: this.config.priceRanges[selectedTier],
      icon: this.config.tierIcons[selectedTier],
      color: this.config.tierColors[selectedTier],
      reasoning: this.generateReasoning(name, description, selectedTier)
    };
  }

  /**
   * Calculate tier score
   */
  calculateTierScore(text, keywords, baseConfidence) {
    let score = 0;
    let matches = 0;

    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        matches++;
        score += baseConfidence;
      }
    }

    // Boost score if multiple keywords match
    if (matches > 1) {
      score *= 1.2;
    }

    return Math.min(score, 1);
  }

  /**
   * Score based on activity type
   */
  scoreActivityType(text) {
    const activities = this.keywordPatterns.activities;

    for (const [activity, tier] of Object.entries(activities)) {
      if (text.includes(activity)) {
        return {
          tier,
          score: 0.85
        };
      }
    }

    return null;
  }

  /**
   * Generate reasoning explanation
   */
  generateReasoning(name, description, tier) {
    const reasons = {
      'Free': 'Based on location type (e.g., park, trail, beach)',
      'Budget-Friendly': 'Based on keywords like "affordable", "cheap", or casual venue type',
      'Mid-Range': 'Based on typical restaurant/activity pricing',
      'Upscale': 'Based on keywords like "fine dining", "elegant", or boutique type',
      'Luxury': 'Based on keywords like "luxury", "Michelin", or high-end type'
    };

    return reasons[tier] || 'Auto-inferred based on location characteristics';
  }

  /**
   * Get all available cost tiers
   */
  getAllTiers() {
    return Object.values(this.config.costTiers);
  }

  /**
   * Format cost for display
   */
  formatCostForDisplay(costData) {
    if (!costData) return '—';

    const confidence = Math.round(costData.confidence * 100);
    return `${costData.icon} ${costData.tier} (${costData.priceRange.label})`;
  }

  /**
   * Get cost details for display
   */
  getCostDetails(costData) {
    if (!costData) return null;

    return {
      tier: costData.tier,
      icon: costData.icon,
      priceRange: costData.priceRange,
      confidence: costData.confidence,
      confidencePercent: Math.round(costData.confidence * 100),
      reasoning: costData.reasoning,
      color: costData.color,
      display: `${costData.icon} ${costData.tier} (${costData.priceRange.label})`
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🧹 Cost inference cache cleared');
  }
}

// Create global instance
window.autoCostInferenceEngine = window.autoCostInferenceEngine || new AutoCostInferenceEngine();

// ============================================================
// AUTO-FILL HELPERS
// ============================================================

/**
 * Auto-fill cost field when location changes
 */
function setupAutoCostFill(params = {}) {
  const {
    locationNameFieldId = 'locationName',
    descriptionFieldId = 'description',
    typeFieldId = 'type',
    costFieldId = 'cost',
    costTierFieldId = 'costTier',
    priceRangeFieldId = 'priceRange',
    debounceMs = 500
  } = params;

  const nameField = document.getElementById(locationNameFieldId);
  const descField = document.getElementById(descriptionFieldId);
  const typeField = document.getElementById(typeFieldId);
  const costField = document.getElementById(costFieldId);
  const costTierField = document.getElementById(costTierFieldId);
  const priceRangeField = document.getElementById(priceRangeFieldId);

  if (!nameField && !descField && !typeField) {
    console.error('❌ Required fields not found for auto-cost fill');
    return;
  }

  let debounceTimer;

  const updateCost = () => {
    const locationData = {
      name: nameField ? nameField.value : '',
      description: descField ? descField.value : '',
      type: typeField ? typeField.value : ''
    };

    if (!locationData.name && !locationData.description) {
      // Clear fields
      if (costField) costField.value = '';
      if (costTierField) costTierField.value = '';
      if (priceRangeField) priceRangeField.value = '';
      return;
    }

    // Infer cost
    const costResult = window.autoCostInferenceEngine.inferCostTier(locationData);
    const details = window.autoCostInferenceEngine.getCostDetails(costResult);

    // Update fields
    if (costField) costField.value = details.display;
    if (costTierField) costTierField.value = details.tier;
    if (priceRangeField) priceRangeField.value = details.priceRange.label;

    // Store full result in data attribute
    if (costField) {
      costField.dataset.costResult = JSON.stringify(costResult);
    }
  };

  // Add listeners
  if (nameField) {
    nameField.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(updateCost, debounceMs);
    });
  }

  if (descField) {
    descField.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(updateCost, debounceMs);
    });
  }

  if (typeField) {
    typeField.addEventListener('change', updateCost);
  }

  console.log('✅ Auto-cost fill setup complete');
}

/**
 * Get cost result from field
 */
function getCostResult(fieldId = 'cost') {
  const field = document.getElementById(fieldId);
  if (!field || !field.dataset.costResult) return null;

  try {
    return JSON.parse(field.dataset.costResult);
  } catch (e) {
    return null;
  }
}

/**
 * Manually infer cost for specific data
 */
function inferCost(name, description = '', type = '') {
  return window.autoCostInferenceEngine.inferCostTier({
    name,
    description,
    type
  });
}

/**
 * Get all cost tiers
 */
function getAllCostTiers() {
  return window.autoCostInferenceEngine.getAllTiers();
}

// ============================================================
// EXPORTS
// ============================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AutoCostInferenceEngine,
    setupAutoCostFill,
    getCostResult,
    inferCost,
    getAllCostTiers
  };
}

console.log('✅ Auto-Cost Inference Engine v1.0.0 Loaded');

