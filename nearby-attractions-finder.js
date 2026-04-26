/**
 * NEARBY ATTRACTIONS FINDER
 * =========================
 * Enhanced nearby discovery with blended ranking, cache enrichment,
 * and smart contextual itinerary recommendations v3.0.
 *
 * Version: 3.0.0
 * Date: April 26, 2026
 */

console.log('🎯 Nearby Attractions Finder Loading...');

const NEARBY_ATTRACTIONS_CONFIG = {
  searchRadius: 5,
  radiusPresets: [2, 5, 10, 25],
  maxAttractions: 20,
  attractionTypes: [
    'point_of_interest', 'restaurant', 'cafe', 'park', 'museum',
    'shopping_mall', 'movie_theater', 'zoo', 'aquarium', 'landmark',
    'lodging', 'bar', 'night_club', 'library', 'art_gallery',
    'tourist_attraction', 'natural_feature', 'bakery', 'ice_cream'
  ],
  googlePlacesApiKey: null,
  useLocalDatabase: true,
  cacheDurationMs: 1000 * 60 * 60,
  backgroundEnrichmentTtlMs: 1000 * 60 * 60 * 24,
  dedupeDistanceThresholdMiles: 0.18,
  sourceWeights: {
    local: 0.216,
    google: 0.108,
    existsInApp: 0.363,
    distance: 0.255,
    rating: 0.059
  },
  categoryMap: {
    all: ['*'],
    food: ['restaurant', 'cafe', 'bar', 'night_club', 'bakery', 'food', 'meal_takeaway', 'meal_delivery', 'brewery'],
    nature: ['park', 'campground', 'natural_feature', 'zoo', 'aquarium', 'trail', 'hiking', 'outdoors', 'garden'],
    family: ['zoo', 'aquarium', 'museum', 'movie_theater', 'park', 'amusement_park', 'playground', 'family'],
    nightlife: ['bar', 'night_club', 'restaurant', 'music_venue', 'concert_hall', 'event_venue', 'entertainment'],
    culture: ['museum', 'art_gallery', 'library', 'landmark', 'monument', 'theater', 'tourist_attraction', 'historic_site'],
    shopping: ['shopping_mall', 'store', 'department_store', 'supermarket', 'market'],
    coffee_dessert: ['cafe', 'bakery', 'ice_cream', 'coffee', 'dessert', 'pastry'],
    scenic: ['park', 'natural_feature', 'tourist_attraction', 'campground', 'scenic', 'overlook', 'viewpoint']
  }
};

// ─── Smart Location Profile System ────────────────────────────────────────────

/** Keyword signals per location profile. Order matters: first match wins. */
const LOCATION_PROFILE_SIGNALS = {
  outdoor_adventure: [
    'hiking', 'hike', 'trail', 'nature', 'park', 'scenic', 'overlook', 'viewpoint',
    'waterfall', 'mountain', 'forest', 'outdoor', 'camping', 'wildlife', 'garden',
    'botanical', 'lake', 'river', 'beach', 'kayak', 'canoe', 'rock climbing',
    'state park', 'national park', 'greenway', 'preserve', 'refuge', 'arboretum',
    'gorge', 'canyon', 'ridge', 'summit', 'bald', 'falls', 'creek', 'reservoir'
  ],
  dining: [
    'restaurant', 'cafe', 'coffee', 'bar', 'brewery', 'winery', 'dining', 'food',
    'eatery', 'bistro', 'grill', 'bakery', 'pizza', 'burger', 'sushi', 'steakhouse',
    'brunch', 'tavern', 'pub', 'diner', 'bbq', 'sandwich', 'noodle', 'taco'
  ],
  culture: [
    'museum', 'gallery', 'art', 'history', 'historic', 'monument', 'theater', 'theatre',
    'heritage', 'cultural', 'landmark', 'library', 'historic site', 'mansion', 'castle',
    'battlefield', 'courthouse', 'arch', 'sculpture', 'mural'
  ],
  entertainment: [
    'movie', 'cinema', 'arcade', 'bowling', 'mini golf', 'escape room', 'concert',
    'festival', 'entertainment', 'amphitheater', 'performance', 'comedy', 'sport',
    'stadium', 'arena', 'karting', 'trampoline', 'laser tag'
  ],
  shopping: [
    'mall', 'outlet', 'market', 'boutique', 'store', 'shop', 'retail', 'antique',
    'vintage', 'flea', 'craft', 'farmers market', 'plaza', 'shopping center'
  ],
  family: [
    'zoo', 'aquarium', 'playground', 'children', 'kids', 'family', 'science center',
    'discovery', 'children\'s museum', 'splash pad', 'water park', 'farm'
  ]
};

/**
 * Smart itinerary role plan: for each location profile, define the recommended
 * follow-up stop categories with display labels, icons, and Google Place type hints.
 */
const SMART_RECOMMENDATION_PLAN = {
  outdoor_adventure: [
    {
      role: 'Fuel Up After Your Adventure',
      icon: '🍔',
      subtitle: 'Well-earned meals nearby',
      categoryHint: 'food',
      gTypes: ['restaurant', 'cafe', 'food', 'meal_takeaway'],
      timeHint: 'anytime',
      priority: 1
    },
    {
      role: 'Coffee or Sweet Treat',
      icon: '☕',
      subtitle: 'Celebrate with a coffee, ice cream or snack',
      categoryHint: 'coffee_dessert',
      gTypes: ['cafe', 'bakery', 'ice_cream', 'food'],
      timeHint: 'anytime',
      priority: 2
    },
    {
      role: 'Continue the Adventure',
      icon: '🏞️',
      subtitle: 'Another scenic spot, overlook or trail nearby',
      categoryHint: 'scenic',
      gTypes: ['park', 'natural_feature', 'tourist_attraction', 'campground'],
      timeHint: 'anytime',
      priority: 3
    },
    {
      role: 'Local Retail & Souvenirs',
      icon: '🛍️',
      subtitle: 'Gear shops, local boutiques or trail goods',
      categoryHint: 'shopping',
      gTypes: ['store', 'shopping_mall', 'market'],
      timeHint: 'anytime',
      priority: 4
    },
    {
      role: 'Scenic Drive or Overlook',
      icon: '🚗',
      subtitle: 'Extend the day with a scenic route or drive-up viewpoint',
      categoryHint: 'scenic',
      gTypes: ['tourist_attraction', 'natural_feature', 'park', 'point_of_interest'],
      timeHint: 'afternoon',
      priority: 5
    }
  ],
  dining: [
    {
      role: 'After-Dinner Dessert',
      icon: '🍦',
      subtitle: 'End on a sweet note nearby',
      categoryHint: 'coffee_dessert',
      gTypes: ['cafe', 'bakery', 'ice_cream'],
      timeHint: 'evening',
      priority: 1
    },
    {
      role: 'Evening Activity',
      icon: '🎭',
      subtitle: 'Keep the evening going nearby',
      categoryHint: 'entertainment',
      gTypes: ['bar', 'night_club', 'theater', 'museum', 'entertainment'],
      timeHint: 'evening',
      priority: 2
    },
    {
      role: 'Browse Local Shops',
      icon: '🛍️',
      subtitle: 'Stroll nearby shops after your meal',
      categoryHint: 'shopping',
      gTypes: ['store', 'market', 'boutique', 'shopping_mall'],
      timeHint: 'afternoon',
      priority: 3
    }
  ],
  culture: [
    {
      role: 'Coffee Break',
      icon: '☕',
      subtitle: 'Rest up at a café between exhibits',
      categoryHint: 'coffee_dessert',
      gTypes: ['cafe', 'bakery'],
      timeHint: 'anytime',
      priority: 1
    },
    {
      role: 'Lunch or Dinner',
      icon: '🍽️',
      subtitle: 'Great dining spots to continue the day',
      categoryHint: 'food',
      gTypes: ['restaurant', 'cafe', 'food'],
      timeHint: 'midday',
      priority: 2
    },
    {
      role: 'More Culture Nearby',
      icon: '🏛️',
      subtitle: 'Another museum, gallery or landmark',
      categoryHint: 'culture',
      gTypes: ['museum', 'art_gallery', 'landmark', 'library', 'tourist_attraction'],
      timeHint: 'anytime',
      priority: 3
    },
    {
      role: 'Outdoor Walk',
      icon: '🌿',
      subtitle: 'Clear your head in a nearby park or garden',
      categoryHint: 'nature',
      gTypes: ['park', 'garden', 'tourist_attraction'],
      timeHint: 'afternoon',
      priority: 4
    }
  ],
  entertainment: [
    {
      role: 'Pre-/Post-Show Dining',
      icon: '🍽️',
      subtitle: 'Top dining spots nearby',
      categoryHint: 'food',
      gTypes: ['restaurant', 'cafe', 'bar'],
      timeHint: 'anytime',
      priority: 1
    },
    {
      role: 'Drinks Nearby',
      icon: '🍸',
      subtitle: 'Bars, breweries and lounges nearby',
      categoryHint: 'nightlife',
      gTypes: ['bar', 'night_club', 'brewery'],
      timeHint: 'evening',
      priority: 2
    },
    {
      role: 'More Entertainment',
      icon: '🎯',
      subtitle: 'Other activities and venues nearby',
      categoryHint: 'entertainment',
      gTypes: ['movie_theater', 'amusement_park', 'tourist_attraction'],
      timeHint: 'anytime',
      priority: 3
    }
  ],
  shopping: [
    {
      role: 'Lunch Break',
      icon: '🍽️',
      subtitle: 'Refuel mid-shopping',
      categoryHint: 'food',
      gTypes: ['restaurant', 'cafe', 'food', 'meal_takeaway'],
      timeHint: 'midday',
      priority: 1
    },
    {
      role: 'Coffee & Snack',
      icon: '☕',
      subtitle: 'Quick stop between stores',
      categoryHint: 'coffee_dessert',
      gTypes: ['cafe', 'bakery', 'ice_cream'],
      timeHint: 'anytime',
      priority: 2
    },
    {
      role: 'More Shopping Nearby',
      icon: '🛒',
      subtitle: 'Other retail stops in the area',
      categoryHint: 'shopping',
      gTypes: ['store', 'shopping_mall', 'market', 'boutique'],
      timeHint: 'anytime',
      priority: 3
    }
  ],
  family: [
    {
      role: 'Family Dining',
      icon: '👨‍👩‍👧',
      subtitle: 'Family-friendly restaurants nearby',
      categoryHint: 'food',
      gTypes: ['restaurant', 'cafe', 'food'],
      timeHint: 'midday',
      priority: 1
    },
    {
      role: 'Ice Cream Stop',
      icon: '🍦',
      subtitle: 'Reward the kids!',
      categoryHint: 'coffee_dessert',
      gTypes: ['cafe', 'bakery', 'ice_cream'],
      timeHint: 'afternoon',
      priority: 2
    },
    {
      role: 'More Family Activities',
      icon: '🎡',
      subtitle: 'Keep the fun going nearby',
      categoryHint: 'family',
      gTypes: ['zoo', 'aquarium', 'amusement_park', 'playground', 'movie_theater'],
      timeHint: 'anytime',
      priority: 3
    },
    {
      role: 'Park or Playground',
      icon: '🌿',
      subtitle: 'Let the kids burn off energy',
      categoryHint: 'nature',
      gTypes: ['park', 'playground'],
      timeHint: 'afternoon',
      priority: 4
    }
  ],
  general: [
    {
      role: 'Nearby Dining',
      icon: '🍽️',
      subtitle: 'Top-rated restaurants in the area',
      categoryHint: 'food',
      gTypes: ['restaurant', 'cafe', 'food'],
      timeHint: 'anytime',
      priority: 1
    },
    {
      role: 'Coffee or Snack',
      icon: '☕',
      subtitle: 'Quick recharge stop',
      categoryHint: 'coffee_dessert',
      gTypes: ['cafe', 'bakery'],
      timeHint: 'anytime',
      priority: 2
    },
    {
      role: 'Things To Do Nearby',
      icon: '🎯',
      subtitle: 'Other activities and attractions',
      categoryHint: 'all',
      gTypes: ['tourist_attraction', 'park', 'museum', 'entertainment'],
      timeHint: 'anytime',
      priority: 3
    },
    {
      role: 'Local Shopping',
      icon: '🛍️',
      subtitle: 'Browse nearby shops and markets',
      categoryHint: 'shopping',
      gTypes: ['store', 'market', 'shopping_mall'],
      timeHint: 'anytime',
      priority: 4
    }
  ]
};

/**
 * Infer the location profile from a flat data object with name, tags, description.
 * Returns one of: outdoor_adventure | dining | culture | entertainment | shopping | family | general
 */
function inferLocationProfile(data) {
  if (!data) return 'general';
  const text = [
    String(data.name || ''),
    String(data.tags || ''),
    String(data.description || ''),
    String(data.type || '')
  ].join(' ').toLowerCase();

  const scores = {};
  Object.entries(LOCATION_PROFILE_SIGNALS).forEach(([profile, signals]) => {
    scores[profile] = signals.reduce((n, kw) => n + (text.includes(kw) ? 1 : 0), 0);
  });

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return (best && best[1] > 0) ? best[0] : 'general';
}

/**
 * Given a profile and the full ranked attractions list, return smart itinerary groups:
 * each group has a role label and an array of best-match attractions for that role.
 */
function buildSmartItineraryGroups(profile, attractions) {
  const plan = SMART_RECOMMENDATION_PLAN[profile] || SMART_RECOMMENDATION_PLAN.general;
  const used = new Set();

  return plan.map(function (slot) {
    const candidates = (Array.isArray(attractions) ? attractions : []).filter(function (a) {
      if (used.has(a.id || a.name)) return false;
      const types = Array.isArray(a.types) ? a.types.map(function (t) { return String(t || '').toLowerCase(); }) : [];
      const name = String(a.name || '').toLowerCase();
      const desc = String(a.description || '').toLowerCase();
      const combined = types.concat([name, desc]).join(' ');
      const catMatch = slot.gTypes.some(function (gt) { return combined.includes(gt.replace(/_/g, ' ')); });
      // also allow coffee_dessert categoryHint to catch cafe/bakery without explicit Google type match
      const hintMatch = slot.categoryHint === 'coffee_dessert'
        ? /(cafe|coffee|bakery|ice.cream|dessert|pastry|creamery|fudge|donut|frozen|yogurt)/.test(combined)
        : catMatch;
      return catMatch || hintMatch;
    });

    // Pick top 3, mark them used
    const picks = candidates.slice(0, 3);
    picks.forEach(function (p) { used.add(p.id || p.name); });

    return { ...slot, suggestions: picks };
  }).filter(function (group) { return group.suggestions.length > 0; });
}

/**
 * Get current time-of-day bucket for smart filtering hints.
 * Returns: 'morning' | 'midday' | 'afternoon' | 'evening' | 'night'
 */
function getTimeOfDayBucket() {
  var h = new Date().getHours();
  if (h < 10) return 'morning';
  if (h < 13) return 'midday';
  if (h < 17) return 'afternoon';
  if (h < 21) return 'evening';
  return 'night';
}

// Export for adventure-details-window.html access
if (typeof window !== 'undefined') {
  window.inferLocationProfile = inferLocationProfile;
  window.buildSmartItineraryGroups = buildSmartItineraryGroups;
  window.getTimeOfDayBucket = getTimeOfDayBucket;
}

class NearbyAttractionsFinder {
  constructor(config = {}) {
    this.config = { ...NEARBY_ATTRACTIONS_CONFIG, ...config };
    this.cache = new Map();
    this.appLocations = [];
    this.activeCategory = 'all';
    this.activeRadius = Number(this.config.searchRadius) || 5;
    this.storageKey = '__nearby_attractions_cache_v2';
    this.restorePersistentCache();
    console.log('🎯 Nearby Attractions Finder initialized');
  }

  setAppLocations(locations) {
    this.appLocations = Array.isArray(locations) ? locations : [];
    console.log(`📍 Loaded ${this.appLocations.length} locations from app database`);
  }

  setSearchRadius(miles) {
    const value = Number(miles);
    if (!Number.isFinite(value) || value <= 0) return;
    this.activeRadius = value;
    this.config.searchRadius = value;
  }

  setCategoryFilter(category) {
    const normalized = String(category || 'all').trim().toLowerCase();
    this.activeCategory = this.config.categoryMap[normalized] ? normalized : 'all';
  }

  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 3959;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  calculateDriveTime(distance) {
    const speed = distance < 5 ? 25 : (distance < 50 ? 35 : 55);
    return Math.round((distance / speed) * 60);
  }

  normalizeName(name) {
    return String(name || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  tokenizeName(name) {
    return this.normalizeName(name).split(' ').filter(Boolean);
  }

  calcNameSimilarity(a, b) {
    const setA = new Set(this.tokenizeName(a));
    const setB = new Set(this.tokenizeName(b));
    if (!setA.size || !setB.size) return 0;
    let overlap = 0;
    setA.forEach((token) => { if (setB.has(token)) overlap += 1; });
    return overlap / Math.max(setA.size, setB.size);
  }

  inferCategory(attraction) {
    const types = Array.isArray(attraction.types)
      ? attraction.types.map((t) => String(t || '').toLowerCase())
      : [String(attraction.type || '').toLowerCase()];
    const tags = String(attraction.tags || '').toLowerCase();
    const pairs = Object.entries(this.config.categoryMap);
    for (let i = 0; i < pairs.length; i += 1) {
      const [category, matchTypes] = pairs[i];
      if (category === 'all') continue;
      if (matchTypes.some((type) => types.includes(type) || tags.includes(type.replace(/_/g, ' ')))) {
        return category;
      }
    }
    return 'all';
  }

  matchesCategory(attraction, category) {
    const wanted = String(category || 'all').toLowerCase();
    if (wanted === 'all') return true;
    return this.inferCategory(attraction) === wanted;
  }

  buildAttractionKey(item) {
    const placeId = String(item.googlePlaceId || item.placeId || item.id || '').trim();
    if (placeId) return `pid:${placeId}`;
    const lat = Number(item.latitude);
    const lng = Number(item.longitude);
    return [
      `name:${this.normalizeName(item.name)}`,
      Number.isFinite(lat) ? lat.toFixed(4) : 'na',
      Number.isFinite(lng) ? lng.toFixed(4) : 'na'
    ].join('|');
  }

  isDuplicateAttraction(a, b) {
    if (!a || !b) return false;
    const aPlaceId = String(a.googlePlaceId || a.placeId || '').trim();
    const bPlaceId = String(b.googlePlaceId || b.placeId || '').trim();
    if (aPlaceId && bPlaceId && aPlaceId === bPlaceId) return true;

    const aLat = Number(a.latitude);
    const aLng = Number(a.longitude);
    const bLat = Number(b.latitude);
    const bLng = Number(b.longitude);
    const distance = (Number.isFinite(aLat) && Number.isFinite(aLng) && Number.isFinite(bLat) && Number.isFinite(bLng))
      ? this.calculateDistance(aLat, aLng, bLat, bLng)
      : Number.POSITIVE_INFINITY;
    const similarity = this.calcNameSimilarity(a.name, b.name);
    return similarity >= 0.72 && distance <= this.config.dedupeDistanceThresholdMiles;
  }

  findExistingLocation(attraction) {
    if (!this.appLocations.length) return null;
    const targetName = String(attraction.name || '').trim();
    const targetLat = Number(attraction.latitude);
    const targetLng = Number(attraction.longitude);
    const placeId = String(attraction.googlePlaceId || attraction.placeId || '').trim();

    let best = null;
    let bestScore = -1;

    this.appLocations.forEach((loc) => {
      const locPlaceId = String(loc.googlePlaceId || loc.placeId || '').trim();
      if (placeId && locPlaceId && placeId === locPlaceId) {
        best = loc;
        bestScore = 10;
        return;
      }
      const nameScore = this.calcNameSimilarity(targetName, loc.name);
      let distanceBonus = 0;
      const locLat = Number(loc.latitude);
      const locLng = Number(loc.longitude);
      if (Number.isFinite(targetLat) && Number.isFinite(targetLng) && Number.isFinite(locLat) && Number.isFinite(locLng)) {
        const d = this.calculateDistance(targetLat, targetLng, locLat, locLng);
        if (d <= this.config.dedupeDistanceThresholdMiles) distanceBonus = 0.5;
      }
      const score = nameScore + distanceBonus;
      if (score > bestScore && score >= 0.72) {
        bestScore = score;
        best = loc;
      }
    });
    return best;
  }

  getGoogleMapsUrl(name, lat, lng) {
    return `https://www.google.com/maps/search/${encodeURIComponent(name)}/@${lat},${lng},15z`;
  }

  getNearbyAttractionsLocal(centerLat, centerLng, centerName, options = {}) {
    if (!this.appLocations.length) return [];
    const radiusMiles = Number(options.radiusMiles || this.activeRadius || this.config.searchRadius);
    const wantedCategory = String(options.category || this.activeCategory || 'all');

    return this.appLocations
      .filter((loc) => {
        if ((loc.name || '').toLowerCase() === (centerName || '').toLowerCase()) return false;
        const lat = Number(loc.latitude);
        const lng = Number(loc.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
        const distance = this.calculateDistance(centerLat, centerLng, lat, lng);
        if (distance <= 0 || distance > radiusMiles) return false;
        return this.matchesCategory(loc, wantedCategory);
      })
      .map((loc) => {
        const distance = this.calculateDistance(centerLat, centerLng, Number(loc.latitude), Number(loc.longitude));
        return {
          id: loc.id || loc.placeId || this.buildAttractionKey(loc),
          name: loc.name,
          type: loc.type || 'location',
          types: Array.isArray(loc.types) ? loc.types : [loc.type || 'location'],
          tags: loc.tags || '',
          latitude: Number(loc.latitude),
          longitude: Number(loc.longitude),
          description: loc.description,
          rating: Number(loc.rating || loc.googleRating || 0) || null,
          exists: true,
          existingLocation: loc,
          distance,
          source: 'local',
          sourceSet: ['local']
        };
      });
  }

  async getNearbyAttractionsGoogle(lat, lng, _centerName, options = {}) {
    if (!this.config.googlePlacesApiKey) return [];
    const radiusMiles = Number(options.radiusMiles || this.activeRadius || this.config.searchRadius);
    const radiusMeters = radiusMiles * 1609.34;
    const wantedCategory = String(options.category || this.activeCategory || 'all');
    const keyword = this.config.attractionTypes.join(' ');

    try {
      const url =
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
        `location=${lat},${lng}` +
        `&radius=${radiusMeters}` +
        `&type=point_of_interest` +
        `&keyword=${encodeURIComponent(keyword)}` +
        `&key=${this.config.googlePlacesApiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.status === 'ZERO_RESULTS') return [];
      if (!data || (data.status && data.status !== 'OK')) {
        console.warn('⚠️ Google Places Nearby Search returned non-OK status:', data && data.status, data && data.error_message);
        return [];
      }
      if (!Array.isArray(data.results)) return [];

      return data.results
        .map((place) => {
          const pLat = Number(place && place.geometry && place.geometry.location && place.geometry.location.lat);
          const pLng = Number(place && place.geometry && place.geometry.location && place.geometry.location.lng);
          if (!Number.isFinite(pLat) || !Number.isFinite(pLng)) return null;
          const existsLoc = this.findExistingLocation({
            name: place.name,
            latitude: pLat,
            longitude: pLng,
            googlePlaceId: place.place_id,
            placeId: place.place_id
          });
          const mapped = {
            id: place.place_id || this.buildAttractionKey(place),
            googlePlaceId: place.place_id,
            name: place.name,
            type: place.types && place.types[0] ? place.types[0] : 'point_of_interest',
            types: Array.isArray(place.types) ? place.types : [],
            latitude: pLat,
            longitude: pLng,
            distance: this.calculateDistance(lat, lng, pLat, pLng),
            rating: Number(place.rating || 0) || null,
            openNow: !!(place.opening_hours && place.opening_hours.open_now),
            description: place.vicinity,
            exists: !!existsLoc,
            existingLocation: existsLoc,
            source: 'google',
            sourceSet: ['google']
          };
          return this.matchesCategory(mapped, wantedCategory) ? mapped : null;
        })
        .filter(Boolean);
    } catch (error) {
      console.error('❌ Google Places API error:', error);
      return [];
    }
  }

  mergeAttractions(googleResults = [], localResults = []) {
    const out = [];
    const ingest = (item) => {
      if (!item || !item.name) return;
      const existing = out.find((entry) => this.isDuplicateAttraction(entry, item));
      if (!existing) {
        out.push({ ...item });
        return;
      }
      existing.sourceSet = Array.from(new Set([].concat(existing.sourceSet || [], item.sourceSet || [], item.source || [])));
      existing.source = existing.sourceSet.length > 1 ? 'merged' : (existing.sourceSet[0] || existing.source || item.source);
      if (!existing.exists && item.exists) {
        existing.exists = true;
        existing.existingLocation = item.existingLocation;
      }
      if ((!existing.rating || existing.rating < 0.1) && item.rating) existing.rating = item.rating;
      if ((!existing.description || String(existing.description).length < 6) && item.description) existing.description = item.description;
      if (Number(item.distance || Infinity) < Number(existing.distance || Infinity)) {
        existing.distance = item.distance;
        existing.latitude = item.latitude;
        existing.longitude = item.longitude;
      }
      if (!existing.googlePlaceId && item.googlePlaceId) existing.googlePlaceId = item.googlePlaceId;
      if (!existing.id && item.id) existing.id = item.id;
      if (!existing.types && item.types) existing.types = item.types;
    };

    googleResults.forEach(ingest);
    localResults.forEach(ingest);
    return out;
  }

  applyRanking(attractions, options = {}) {
    const radius = Number(options.radiusMiles || this.activeRadius || this.config.searchRadius);
    const weights = this.config.sourceWeights || {};
    return (Array.isArray(attractions) ? attractions : []).map((item) => {
      const distance = Number(item.distance || 0);
      const distanceScore = Math.max(0, 1 - Math.min(distance / Math.max(radius, 0.1), 1));
      const ratingScore = Math.min(1, Math.max(0, Number(item.rating || 0) / 5));
      const isLocal = item.source === 'local' || (Array.isArray(item.sourceSet) && item.sourceSet.includes('local'));
      const isGoogle = item.source === 'google' || (Array.isArray(item.sourceSet) && item.sourceSet.includes('google'));
      const existsInApp = !!item.exists;
      const blendedScore =
        (distanceScore * Number(weights.distance || 0)) +
        (ratingScore * Number(weights.rating || 0)) +
        (isLocal ? Number(weights.local || 0) : 0) +
        (isGoogle ? Number(weights.google || 0) : 0) +
        (existsInApp ? Number(weights.existsInApp || 0) : 0);

      const reasons = [];
      if (existsInApp) reasons.push('already in app');
      if (distance <= 2) reasons.push('very close');
      else if (distance <= 5) reasons.push('nearby');
      if (ratingScore >= 0.9) reasons.push('high rating');
      if (item.source === 'merged' || (item.sourceSet && item.sourceSet.length > 1)) reasons.push('matched local + Google');
      if (!reasons.length) reasons.push('distance relevance');

      const sourceSet = Array.isArray(item.sourceSet) ? item.sourceSet : [item.source || 'local'];
      const sourceBadge = sourceSet.length > 1
        ? 'Merged'
        : (sourceSet[0] === 'local' ? 'Local' : 'Google');

      return {
        ...item,
        source: sourceSet.length > 1 ? 'merged' : sourceSet[0],
        sourceSet,
        sourceBadge,
        rankingReasons: reasons,
        blendedScore,
        confidence: Math.max(0.2, Math.min(0.98, 0.35 + blendedScore))
      };
    }).sort((a, b) => b.blendedScore - a.blendedScore).slice(0, this.config.maxAttractions);
  }

  getCacheKey(lat, lng, options = {}) {
    const radius = Number(options.radiusMiles || this.activeRadius || this.config.searchRadius);
    const category = String(options.category || this.activeCategory || 'all').toLowerCase();
    const placeKey = String(options.placeKey || '').trim();
    return [
      lat.toFixed(4),
      lng.toFixed(4),
      `r${radius.toFixed(1)}`,
      `c:${category}`,
      placeKey ? `p:${placeKey}` : 'p:none'
    ].join('|');
  }

  savePersistentCache() {
    try {
      const payload = {};
      this.cache.forEach((entry, key) => {
        if (!entry || !Array.isArray(entry.data)) return;
        payload[key] = {
          timestamp: Number(entry.timestamp || 0),
          data: entry.data.slice(0, this.config.maxAttractions)
        };
      });
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.storageKey, JSON.stringify(payload));
      }
    } catch (_err) {}
  }

  restorePersistentCache() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const raw = window.localStorage.getItem(this.storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return;
      const now = Date.now();
      Object.keys(parsed).forEach((key) => {
        const entry = parsed[key];
        const ts = Number(entry && entry.timestamp);
        const data = entry && Array.isArray(entry.data) ? entry.data : null;
        if (!Number.isFinite(ts) || !data) return;
        if ((now - ts) > this.config.backgroundEnrichmentTtlMs) return;
        this.cache.set(key, { timestamp: ts, data });
      });
    } catch (_err) {}
  }

  getCachedFormattedNearbyAttractions(lat, lng, centerName, options = {}) {
    const key = this.getCacheKey(lat, lng, options);
    const cached = this.cache.get(key);
    if (!cached || !Array.isArray(cached.data)) return [];
    const age = Date.now() - Number(cached.timestamp || 0);
    if (age > this.config.backgroundEnrichmentTtlMs) return [];
    return cached.data.map((item) => this.formatAttraction(item, centerName));
  }

  async getNearbyAttractions(lat, lng, centerName, options = {}) {
    const forceRefresh = !!options.forceRefresh;
    const cacheKey = this.getCacheKey(lat, lng, options);
    const cached = this.cache.get(cacheKey);
    if (!forceRefresh && cached && Array.isArray(cached.data)) {
      const age = Date.now() - Number(cached.timestamp || 0);
      if (age < this.config.cacheDurationMs) {
        return cached.data;
      }
      if (age < this.config.backgroundEnrichmentTtlMs) {
        // stale-while-revalidate: return quickly, then refresh in background.
        this.prefetchNearbyAttractions(lat, lng, centerName, options).catch(() => null);
        return cached.data;
      }
    }

    const google = this.config.googlePlacesApiKey
      ? await this.getNearbyAttractionsGoogle(lat, lng, centerName, options)
      : [];
    const local = this.config.useLocalDatabase
      ? this.getNearbyAttractionsLocal(lat, lng, centerName, options)
      : [];
    const merged = this.mergeAttractions(google, local);
    const ranked = this.applyRanking(merged, options);
    this.cache.set(cacheKey, { data: ranked, timestamp: Date.now() });
    this.savePersistentCache();
    return ranked;
  }

  async prefetchNearbyAttractions(lat, lng, centerName, options = {}) {
    const key = this.getCacheKey(lat, lng, options);
    const existing = this.cache.get(key);
    if (existing && (Date.now() - Number(existing.timestamp || 0) < this.config.cacheDurationMs)) {
      return existing.data;
    }
    const data = await this.getNearbyAttractions(lat, lng, centerName, { ...options, forceRefresh: true });
    return data;
  }

  formatAttraction(attraction, centerName = '') {
    const distanceVal = Number(attraction.distance || 0);
    const distance = distanceVal.toFixed(1);
    const driveTime = this.calculateDriveTime(distanceVal);
    const driveTimeText = driveTime < 60 ? `${driveTime} min` : `${Math.round(driveTime / 60)}h`;
    const source = attraction.sourceBadge || (attraction.source === 'local' ? 'Local' : attraction.source === 'google' ? 'Google' : 'Merged');
    return {
      ...attraction,
      distanceText: `${distance} mi`,
      driveTimeText,
      status: attraction.exists ? '✅ In App' : '🔗 Google',
      sourceBadge: source,
      category: this.inferCategory(attraction),
      confidencePct: Math.round(Math.max(0, Math.min(1, Number(attraction.confidence || 0))) * 100),
      rankingReasonText: Array.isArray(attraction.rankingReasons) ? attraction.rankingReasons.join(', ') : 'distance relevance',
      googleUrl: this.getGoogleMapsUrl(attraction.name || centerName || 'Location', attraction.latitude, attraction.longitude)
    };
  }

  async getFormattedNearbyAttractions(lat, lng, centerName, options = {}) {
    const attractions = await this.getNearbyAttractions(lat, lng, centerName, options);
    return attractions.map((attr) => this.formatAttraction(attr, centerName));
  }

  clearCache() {
    this.cache.clear();
    this.savePersistentCache();
    console.log('🧹 Nearby attractions cache cleared');
  }
}

window.nearbyAttractionsFinder = window.nearbyAttractionsFinder || new NearbyAttractionsFinder();

function createAttractionCard(attraction) {
  const ratingStars = attraction.rating ? '⭐'.repeat(Math.round(attraction.rating)) : '';
  let actionButton = '';
  if (attraction.exists && attraction.existingLocation) {
    actionButton = `
      <button class="attraction-btn attraction-btn-primary" onclick="window.dispatchEvent(new CustomEvent('navigate-location', { detail: { location: ${JSON.stringify(attraction.existingLocation).replace(/"/g, '&quot;')} } }))">
        View Details
      </button>
    `;
  } else {
    actionButton = `<a href="${attraction.googleUrl}" target="_blank" class="attraction-btn attraction-btn-secondary">View on Google</a>`;
  }
  return `
    <div class="attraction-card" data-attraction-id="${attraction.id}">
      <div class="attraction-header">
        <h4 class="attraction-title">${attraction.name}</h4>
        <span class="attraction-status">${attraction.status}</span>
      </div>
      <div class="attraction-meta">
        <span class="attraction-distance">📍 ${attraction.distanceText}</span>
        <span class="attraction-drive-time">🚗 ${attraction.driveTimeText}</span>
        ${ratingStars ? `<span class="attraction-rating">${ratingStars} ${Number(attraction.rating).toFixed(1)}</span>` : ''}
      </div>
      ${attraction.description ? `<p class="attraction-description">${attraction.description}</p>` : ''}
      <div class="attraction-actions">
        ${actionButton}
        ${!attraction.exists ? `<button class="attraction-btn attraction-btn-add" onclick="window.dispatchEvent(new CustomEvent('add-attraction', { detail: { attraction: ${JSON.stringify(attraction).replace(/"/g, '&quot;')} } }))">➕ Add to App</button>` : ''}
      </div>
    </div>
  `;
}

function renderNearbyAttractions(attractions, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!attractions || attractions.length === 0) {
    container.innerHTML = '<div class="no-attractions"><p>No nearby attractions found</p></div>';
    return;
  }
  container.innerHTML = `<div class="attractions-list">${attractions.map((attr) => createAttractionCard(attr)).join('')}</div>`;
}

async function autoLoadNearbyAttractions(lat, lng, locationName, containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '<div class="loading-attractions">Loading nearby attractions...</div>';
  try {
    const attractions = await window.nearbyAttractionsFinder.getFormattedNearbyAttractions(lat, lng, locationName, options);
    renderNearbyAttractions(attractions, containerId);
  } catch (error) {
    console.error('❌ Error loading nearby attractions:', error);
    container.innerHTML = '<div class="error-attractions">Error loading attractions</div>';
  }
}

// ─── Day Itinerary Scratchpad ────────────────────────────────────────────────

const DAY_PLAN_STORAGE_KEY = '__adventure_day_plan_v1';

function loadDayPlan() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    var raw = window.localStorage.getItem(DAY_PLAN_STORAGE_KEY);
    if (!raw) return [];
    var parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_e) { return []; }
}

function saveDayPlan(stops) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(DAY_PLAN_STORAGE_KEY, JSON.stringify(stops || []));
    }
  } catch (_e) {}
}

function addStopToDayPlan(stop) {
  var plan = loadDayPlan();
  var key = String(stop.id || stop.name || '').trim();
  if (!key) return false;
  if (plan.some(function (s) { return (s.id || s.name) === key; })) return false;
  plan.push({
    id: key,
    name: stop.name,
    distanceText: stop.distanceText || '—',
    driveTimeText: stop.driveTimeText || '—',
    latitude: stop.latitude,
    longitude: stop.longitude,
    googleUrl: stop.googleUrl || '',
    addedAt: Date.now()
  });
  saveDayPlan(plan);
  return true;
}

function removeStopFromDayPlan(stopId) {
  var plan = loadDayPlan().filter(function (s) { return (s.id || s.name) !== String(stopId); });
  saveDayPlan(plan);
}

function clearDayPlan() {
  saveDayPlan([]);
}

/** Build a Google Maps multi-stop route URL from the current day plan. */
function buildDayPlanRouteUrl() {
  var plan = loadDayPlan();
  if (!plan.length) return null;
  var waypoints = plan.map(function (s) {
    if (Number.isFinite(Number(s.latitude)) && Number.isFinite(Number(s.longitude))) {
      return s.latitude + ',' + s.longitude;
    }
    return encodeURIComponent(s.name);
  });
  if (waypoints.length === 1) {
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(plan[0].name);
  }
  var origin = waypoints[0];
  var destination = waypoints[waypoints.length - 1];
  var mid = waypoints.slice(1, -1).join('|');
  var url = 'https://www.google.com/maps/dir/' + origin + '/' + (mid ? mid + '/' : '') + destination;
  return url;
}

if (typeof window !== 'undefined') {
  window.dayPlanHelpers = {
    load: loadDayPlan,
    save: saveDayPlan,
    addStop: addStopToDayPlan,
    removeStop: removeStopFromDayPlan,
    clear: clearDayPlan,
    buildRouteUrl: buildDayPlanRouteUrl
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    NearbyAttractionsFinder,
    createAttractionCard,
    renderNearbyAttractions,
    autoLoadNearbyAttractions,
    inferLocationProfile,
    buildSmartItineraryGroups,
    getTimeOfDayBucket,
    loadDayPlan,
    saveDayPlan,
    addStopToDayPlan,
    removeStopFromDayPlan,
    clearDayPlan,
    buildDayPlanRouteUrl
  };
}

console.log('✅ Nearby Attractions Finder v3.0.0 Loaded with Smart Recommendations');

