/**
 * AUTO-COST INFERENCE ENGINE
 * ==========================
 * Automatically infers cost/pricing information when adding new locations.
 *
 * Improvements (v1.1.0):
 * - Word-boundary keyword matching (prevents "park" → "parking lot" false matches)
 * - Google Places price_level support (0-4) — highest accuracy signal
 * - Removed duplicate "fine dining" keyword that was in both Upscale and Luxury
 * - Low-confidence results now return "Unknown" instead of a silent Mid-Range guess
 * - Confidence % is surfaced in the display string
 * - `type` and `tags` are handled as separate inputs so tag CSV strings
 *   don't accidentally skew keyword scores
 *
 * Version: 1.1.0
 */

console.log('💰 Auto-Cost Inference Engine v1.1.0 Loading...');

// ============================================================
// CONFIGURATION
// ============================================================

const AUTO_COST_CONFIG = {
  costTiers: {
    FREE: 'Free',
    BUDGET: 'Budget-Friendly',
    MIDRANGE: 'Mid-Range',
    UPSCALE: 'Upscale',
    LUXURY: 'Luxury'
  },

  tierColors: {
    'Free': '#10b981',
    'Budget-Friendly': '#3b82f6',
    'Mid-Range': '#f59e0b',
    'Upscale': '#8b5cf6',
    'Luxury': '#dc2626',
    'Unknown': '#6b7280'
  },

  tierIcons: {
    'Free': '🆓',
    'Budget-Friendly': '💵',
    'Mid-Range': '💳',
    'Upscale': '🥂',
    'Luxury': '👑',
    'Unknown': '❓'
  },

  priceRanges: {
    'Free': { min: 0, max: 0, label: '$0' },
    'Budget-Friendly': { min: 1, max: 15, label: '$1–15' },
    'Mid-Range': { min: 15, max: 50, label: '$15–50' },
    'Upscale': { min: 50, max: 150, label: '$50–150' },
    'Luxury': { min: 150, max: 500, label: '$150+' },
    'Unknown': { min: 0, max: 0, label: 'unknown' }
  },

  // Google Places price_level → tier mapping (0 = free/very cheap, 4 = very expensive)
  googlePriceLevelMap: ['Free', 'Budget-Friendly', 'Mid-Range', 'Upscale', 'Luxury'],

  // Confidence threshold below which we return "Unknown" instead of guessing
  unknownThreshold: 0.30,

  // Tags are useful hints but weaker than name/description/type.
  tagSignalWeight: 0.45,

  // If top two tiers are too close, treat as ambiguous.
  ambiguityDeltaThreshold: 0.12,

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
   * Build keyword patterns for cost detection.
   * All keywords are matched as whole words (word boundary) to prevent
   * "park" matching "parking" or "toffee" matching "coffee".
   */
  buildKeywordPatterns() {
    return {
      free: {
        keywords: [
          'free', 'no charge', 'no cost', 'complimentary', 'gratis',
          'public beach', 'nature trail', 'state park', 'national park',
          'city park', 'public park', 'free admission', 'free entry'
        ],
        tier: 'Free',
        confidence: 0.90
      },

      budget: {
        keywords: [
          'cheap', 'affordable', 'budget', 'inexpensive', 'taco truck',
          'food truck', 'fast food', 'diner', 'hole in the wall',
          'local spot', 'cheap eats', 'dollar menu', 'happy hour',
          'food court', 'street food', 'counter service'
        ],
        tier: 'Budget-Friendly',
        confidence: 0.82
      },

      midrange: {
        keywords: [
          'restaurant', 'casual dining', 'moderate', 'standard price',
          'regular price', 'decent price', 'family restaurant', 'bistro',
          'trattoria', 'mid-range', 'mid range', 'average price',
          'reasonable price', 'neighborhood bar', 'sports bar'
        ],
        tier: 'Mid-Range',
        confidence: 0.72
      },

      upscale: {
        keywords: [
          'upscale', 'fine dining', 'elegant', 'sophisticated', 'upmarket',
          'premium', 'gourmet', 'high-end', 'boutique hotel', 'cocktail bar',
          'wine bar', 'rooftop bar', 'tasting menu', 'prix fixe',
          'white tablecloth', 'sommelier', 'craft cocktail'
        ],
        tier: 'Upscale',
        confidence: 0.88
      },

      luxury: {
        keywords: [
          'luxury', 'michelin star', 'michelin-star', 'five star', 'five-star',
          '5-star', 'ultra luxury', 'prestige', 'penthouse', 'vip lounge',
          'private club', 'members only', 'ultra-premium', 'world class',
          'world-class', 'black card', 'omakase'
        ],
        tier: 'Luxury',
        confidence: 0.95
      },

      // Activity/venue type → tier. Keyed as whole terms for direct matching.
      activities: {
        'hiking': 'Free',
        'trail': 'Free',
        'public beach': 'Free',
        'state park': 'Free',
        'national park': 'Free',
        'city park': 'Free',
        'nature reserve': 'Free',
        'botanical garden': 'Budget-Friendly',
        'museum': 'Budget-Friendly',
        'zoo': 'Mid-Range',
        'aquarium': 'Mid-Range',
        'movie theater': 'Budget-Friendly',
        'cinema': 'Budget-Friendly',
        'amusement park': 'Mid-Range',
        'theme park': 'Upscale',
        'water park': 'Mid-Range',
        'concert': 'Mid-Range',
        'live music': 'Mid-Range',
        'theater': 'Upscale',
        'opera': 'Upscale',
        'ballet': 'Upscale',
        'spa': 'Upscale',
        'resort': 'Upscale',
        'hotel': 'Mid-Range',
        'hostel': 'Budget-Friendly',
        'airbnb': 'Mid-Range',
        'cafe': 'Budget-Friendly',
        'coffee shop': 'Budget-Friendly',
        'coffee': 'Budget-Friendly',
        'bar': 'Mid-Range',
        'nightclub': 'Upscale',
        'golf course': 'Upscale',
        'golf': 'Upscale',
        'ski resort': 'Luxury',
        'ski': 'Upscale',
        'gym': 'Budget-Friendly',
        'yoga studio': 'Mid-Range',
        'yoga': 'Mid-Range'
      }
    };
  }

  /**
   * Test if a whole-word (or whole-phrase) keyword is present in text.
   * Uses word boundaries so "park" won't match "parking" or "parkway".
   */
  wordMatch(text, keyword) {
    // Build a regex: word boundary at both ends, case-insensitive
    // Escape special regex chars in the keyword first
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp('(?:^|[\\s,;/()-])' + escaped + '(?=$|[\\s,;/().!?-])', 'i');
    return re.test(text);
  }

  /**
   * Main entry point. Accepts locationData with optional fields:
   *   name, description, type, tags, googlePriceLevel
   */
  inferCostTier(locationData) {
    const cacheKey = [
      (locationData.name || '').toLowerCase(),
      (locationData.type || '').toLowerCase(),
      (locationData.tags || '').toLowerCase(),
      String(locationData.googlePriceLevel != null ? locationData.googlePriceLevel : ''),
      (locationData.description || '').substring(0, 60).toLowerCase()
    ].join('|');

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.config.cacheDurationMs) {
        return cached.data;
      }
    }

    const result = this.analyzeLocationData(locationData);

    this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  }

  analyzeLocationData(locationData) {
    const name = (locationData.name || '').toLowerCase();
    const description = (locationData.description || '').toLowerCase();
    // Accept `type` as a semantic venue type, separate from tags
    const type = (locationData.type || '').toLowerCase();
    // Tags: store separately and score at reduced weight
    const tagsText = (locationData.tags || '').toLowerCase().replace(/,/g, ' ');

    // Primary text scored at full weight; tags are weighted separately.
    const primaryText = `${name} ${description} ${type}`.trim();

    let costScores = {};
    let source = 'keyword';

    // ── 1. Google price_level (most reliable signal) ──────────────────────────
    const gpl = locationData.googlePriceLevel;
    if (gpl != null && !isNaN(Number(gpl))) {
      const idx = Math.max(0, Math.min(4, Math.round(Number(gpl))));
      const tier = this.config.googlePriceLevelMap[idx];
      source = 'google_price_level';
      return this._buildResult(tier, 0.97, source, name);
    }

    // ── 2. Keyword tier scoring ───────────────────────────────────────────────
    for (const [tierKey, tierData] of Object.entries(this.keywordPatterns)) {
      if (tierKey === 'activities') continue;
      const primaryScore = this.calculateTierScore(primaryText, tierData.keywords, tierData.confidence);
      const tagScore = tagsText
        ? this.calculateTierScore(tagsText, tierData.keywords, tierData.confidence) * this.config.tagSignalWeight
        : 0;
      costScores[tierData.tier] = Math.min(primaryScore + tagScore, 1);
    }

    // ── 3. Activity/venue type matching ──────────────────────────────────────
    for (const [activity, tier] of Object.entries(this.keywordPatterns.activities)) {
      if (this.wordMatch(primaryText, activity)) {
        costScores[tier] = Math.max(costScores[tier] || 0, 0.82);
        source = 'activity_type';
      }
      // Tag-only activity matches are weaker hints.
      if (tagsText && this.wordMatch(tagsText, activity)) {
        costScores[tier] = Math.max(costScores[tier] || 0, 0.82 * this.config.tagSignalWeight);
      }
    }

    // ── 4. Pick highest-scoring tier ─────────────────────────────────────────
    const sorted = Object.entries(costScores).filter(([, s]) => s > 0).sort(([, a], [, b]) => b - a);
    if (sorted.length === 0 || sorted[0][1] < this.config.unknownThreshold) {
      return this._buildResult('Unknown', sorted.length ? sorted[0][1] : 0, 'no_signal', name);
    }

    // If top candidates are too close, avoid a brittle single-tier guess.
    if (sorted.length > 1 && (sorted[0][1] - sorted[1][1]) < this.config.ambiguityDeltaThreshold) {
      return this._buildResult('Unknown', sorted[0][1], 'ambiguous_signal', name, {
        topCandidates: sorted.slice(0, 2).map(function (entry) {
          return { tier: entry[0], score: entry[1] };
        })
      });
    }

    const [selectedTier, confidence] = sorted[0];
    return this._buildResult(selectedTier, Math.min(confidence, 1), source, name, {
      topCandidates: sorted.slice(0, 2).map(function (entry) {
        return { tier: entry[0], score: entry[1] };
      })
    });
  }

  _buildResult(tier, confidence, source, name, extra) {
    return {
      tier,
      confidence: Math.min(confidence, 1),
      priceRange: this.config.priceRanges[tier] || this.config.priceRanges['Unknown'],
      icon: this.config.tierIcons[tier] || '❓',
      color: this.config.tierColors[tier] || '#6b7280',
      source,
      reasoning: this.generateReasoning(name, tier, source),
      topCandidates: extra && Array.isArray(extra.topCandidates) ? extra.topCandidates : []
    };
  }

  calculateTierScore(text, keywords, baseConfidence) {
    let score = 0;
    let matches = 0;

    for (const keyword of keywords) {
      if (this.wordMatch(text, keyword)) {
        matches++;
        score += baseConfidence;
      }
    }

    if (matches > 1) score *= 1.15; // modest boost for multiple signals
    return Math.min(score, 1);
  }

  generateReasoning(name, tier, source) {
    if (source === 'google_price_level') return 'Based on Google Places price level data (high accuracy)';
    const reasons = {
      'Free': 'Name/description suggests free admission (park, trail, public venue)',
      'Budget-Friendly': 'Detected casual/affordable venue keywords',
      'Mid-Range': 'Detected typical restaurant or standard activity pricing',
      'Upscale': 'Detected fine dining, premium, or boutique venue keywords',
      'Luxury': 'Detected luxury, Michelin-starred, or VIP venue keywords',
      'Unknown': 'Not enough information to estimate cost — please set manually'
    };
    return reasons[tier] || 'Auto-inferred from location characteristics';
  }

  getAllTiers() {
    return Object.values(this.config.costTiers);
  }

  formatCostForDisplay(costData) {
    if (!costData) return '—';
    if (costData.tier === 'Unknown') return '❓ Unknown cost (set manually)';
    const pct = Math.round(costData.confidence * 100);
    return `${costData.icon} ${costData.tier} (${costData.priceRange.label}) · ~${pct}% confidence`;
  }

  getCostDetails(costData) {
    if (!costData) return null;
    return {
      tier: costData.tier,
      icon: costData.icon,
      priceRange: costData.priceRange,
      confidence: costData.confidence,
      confidencePercent: Math.round(costData.confidence * 100),
      reasoning: costData.reasoning,
      source: costData.source,
      topCandidates: Array.isArray(costData.topCandidates) ? costData.topCandidates : [],
      color: costData.color,
      display: this.formatCostForDisplay(costData)
    };
  }

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
      if (costField) costField.value = '';
      if (costTierField) costTierField.value = '';
      if (priceRangeField) priceRangeField.value = '';
      return;
    }

    const costResult = window.autoCostInferenceEngine.inferCostTier(locationData);
    const details = window.autoCostInferenceEngine.getCostDetails(costResult);

    if (costField) costField.value = details.display;
    if (costTierField) costTierField.value = details.tier;
    if (priceRangeField) priceRangeField.value = details.priceRange.label;

    if (costField) {
      costField.dataset.costResult = JSON.stringify(costResult);
    }
  };

  if (nameField) nameField.addEventListener('input', () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(updateCost, debounceMs); });
  if (descField) descField.addEventListener('input', () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(updateCost, debounceMs); });
  if (typeField) typeField.addEventListener('change', updateCost);

  console.log('✅ Auto-cost fill setup complete');
}

function getCostResult(fieldId = 'cost') {
  const field = document.getElementById(fieldId);
  if (!field || !field.dataset.costResult) return null;
  try { return JSON.parse(field.dataset.costResult); } catch (e) { return null; }
}

/**
 * Manually infer cost for specific data.
 * @param {string} name
 * @param {string} [description]
 * @param {string} [type]      - semantic venue type (NOT tags CSV)
 * @param {string} [tags]      - tag CSV string (used as lower-weight context)
 * @param {number} [googlePriceLevel] - Google Places price_level (0-4), most accurate
 */
function inferCost(name, description = '', type = '', tags = '', googlePriceLevel = null) {
  const loc = { name, description, type, tags };
  if (googlePriceLevel != null && !isNaN(Number(googlePriceLevel))) {
    loc.googlePriceLevel = Number(googlePriceLevel);
  }
  return window.autoCostInferenceEngine.inferCostTier(loc);
}

function getAllCostTiers() {
  return window.autoCostInferenceEngine.getAllTiers();
}

// ============================================================
// EXPORTS
// ============================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AutoCostInferenceEngine, setupAutoCostFill, getCostResult, inferCost, getAllCostTiers };
}

console.log('✅ Auto-Cost Inference Engine v1.1.0 Loaded');
