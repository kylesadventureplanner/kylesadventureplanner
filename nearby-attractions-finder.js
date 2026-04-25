/**
 * NEARBY ATTRACTIONS FINDER
 * =========================
 * Auto-detect nearby attractions and display them in location details
 * with distance sorting, drive time calculation, and quick linking
 *
 * Features:
 * - Find nearby attractions using location proximity or Google Places API
 * - Sort by distance (closest first)
 * - Calculate drive time from original location
 * - Allow navigation to existing locations
 * - Provide Google Maps link for non-existing locations
 * - Option to add new locations from attractions
 *
 * Version: 1.0.0
 * Date: April 24, 2026
 */

console.log('🎯 Nearby Attractions Finder Loading...');

// ============================================================
// CONFIGURATION
// ============================================================

const NEARBY_ATTRACTIONS_CONFIG = {
  // Search radius (miles)
  searchRadius: 5,

  // Max number of attractions to show
  maxAttractions: 15,

  // Attraction types to search for
  attractionTypes: [
    'point_of_interest',
    'restaurant',
    'cafe',
    'park',
    'museum',
    'shopping_mall',
    'movie_theater',
    'zoo',
    'aquarium',
    'landmark',
    'lodging',
    'bar',
    'night_club',
    'library',
    'art_gallery'
  ],

  // Google Places API key (optional)
  googlePlacesApiKey: null,

  // Use local app database as fallback
  useLocalDatabase: true,

  // Cache duration (ms)
  cacheDurationMs: 3600000, // 1 hour

  // Distance calculation method
  useGoogleMaps: false // Set to true if you have Google Maps API
};

// ============================================================
// NEARBY ATTRACTIONS FINDER CLASS
// ============================================================

class NearbyAttractionsFinder {
  constructor(config = {}) {
    this.config = { ...NEARBY_ATTRACTIONS_CONFIG, ...config };
    this.cache = new Map();
    this.appLocations = []; // Will be populated with app's existing locations
    console.log('🎯 Nearby Attractions Finder initialized');
  }

  /**
   * Set the app's location database
   */
  setAppLocations(locations) {
    this.appLocations = Array.isArray(locations) ? locations : [];
    console.log(`📍 Loaded ${this.appLocations.length} locations from app database`);
  }

  /**
   * Calculate distance between two points (miles)
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 3959; // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Calculate drive time (minutes) from source to destination
   */
  calculateDriveTime(distance) {
    // Estimate speed based on distance
    let speed = 35; // Default: suburban speed

    if (distance < 5) speed = 25;          // Urban
    else if (distance < 15) speed = 35;    // Suburban
    else if (distance < 50) speed = 35;    // Mixed
    else speed = 55;                        // Highway

    const minutes = Math.round((distance / speed) * 60);
    return minutes;
  }

  /**
   * Check if attraction already exists in app
   */
  findExistingLocation(attraction) {
    if (!this.appLocations || this.appLocations.length === 0) {
      return null;
    }

    // Search by name similarity
    const searchName = attraction.name.toLowerCase().trim();

    return this.appLocations.find(loc => {
      const locName = (loc.name || '').toLowerCase().trim();
      return locName === searchName || locName.includes(searchName) || searchName.includes(locName);
    }) || null;
  }

  /**
   * Generate Google Maps search URL
   */
  getGoogleMapsUrl(name, lat, lng) {
    return `https://www.google.com/maps/search/${encodeURIComponent(name)}/@${lat},${lng},15z`;
  }

  /**
   * Get nearby attractions using app database
   */
  getNearbyAttractionsLocal(centerLat, centerLng, centerName) {
    if (!this.appLocations || this.appLocations.length === 0) {
      return [];
    }

    const radiusMiles = this.config.searchRadius;

    // Filter locations within radius
    const nearby = this.appLocations
      .filter(loc => {
        // Don't include the center location itself
        if ((loc.name || '').toLowerCase() === (centerName || '').toLowerCase()) {
          return false;
        }

        // Check if within radius
        if (!loc.latitude || !loc.longitude) return false;

        const distance = this.calculateDistance(
          centerLat,
          centerLng,
          loc.latitude,
          loc.longitude
        );

        return distance <= radiusMiles && distance > 0;
      })
      .map(loc => ({
        id: loc.id || loc.placeId,
        name: loc.name,
        type: loc.type || 'location',
        latitude: loc.latitude,
        longitude: loc.longitude,
        description: loc.description,
        rating: loc.rating || loc.googleRating,
        exists: true,
        existingLocation: loc,
        distance: this.calculateDistance(
          centerLat,
          centerLng,
          loc.latitude,
          loc.longitude
        )
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, this.config.maxAttractions);

    return nearby;
  }

  /**
   * Get nearby attractions using Google Places API
   */
  async getNearbyAttractionsGoogle(lat, lng, centerName) {
    if (!this.config.googlePlacesApiKey) {
      console.warn('⚠️ Google Places API key not configured');
      return [];
    }

    const radiusMeters = this.config.searchRadius * 1609.34;
    // Google Nearby Search accepts a single "type" but supports multi-term "keyword".
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

      if (data && data.status === 'ZERO_RESULTS') {
        return [];
      }

      if (!data || (data.status && data.status !== 'OK')) {
        console.warn('⚠️ Google Places Nearby Search returned non-OK status:', data && data.status, data && data.error_message);
        return [];
      }

      if (Array.isArray(data.results)) {
        return data.results
          .map(place => {
            const existingLoc = this.findExistingLocation(place);

            return {
              id: place.place_id,
              name: place.name,
              type: place.types?.[0] || 'point_of_interest',
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
              distance: this.calculateDistance(
                lat,
                lng,
                place.geometry.location.lat,
                place.geometry.location.lng
              ),
              rating: place.rating,
              openNow: place.opening_hours?.open_now,
              description: place.vicinity,
              exists: !!existingLoc,
              existingLocation: existingLoc,
              googlePlaceId: place.place_id
            };
          })
          .sort((a, b) => a.distance - b.distance)
          .slice(0, this.config.maxAttractions);
      }

      return [];
    } catch (error) {
      console.error('❌ Google Places API error:', error);
      return [];
    }
  }

  /**
   * Merge Google/local attraction candidates by normalized name + rounded location.
   */
  mergeAttractions(primary = [], secondary = []) {
    const combined = [];
    const seen = new Set();
    const list = ([]).concat(Array.isArray(primary) ? primary : [], Array.isArray(secondary) ? secondary : []);

    list.forEach((item) => {
      if (!item || !item.name) return;
      const lat = Number(item.latitude);
      const lng = Number(item.longitude);
      const key = [
        String(item.name || '').trim().toLowerCase(),
        Number.isFinite(lat) ? lat.toFixed(3) : 'na',
        Number.isFinite(lng) ? lng.toFixed(3) : 'na'
      ].join('|');
      if (seen.has(key)) return;
      seen.add(key);
      combined.push(item);
    });

    return combined
      .sort((a, b) => Number(a.distance || 0) - Number(b.distance || 0))
      .slice(0, this.config.maxAttractions);
  }

  /**
   * Get nearby attractions (tries Google first, falls back to local)
   */
  async getNearbyAttractions(lat, lng, centerName) {
    // Check cache
    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.config.cacheDurationMs) {
        console.log('📦 Using cached nearby attractions');
        return cached.data;
      }
    }

    let attractions = [];

    // Try Google first if configured
    if (this.config.googlePlacesApiKey) {
      attractions = await this.getNearbyAttractionsGoogle(lat, lng, centerName);
    }

    // Fall back to local database if needed
    if ((!attractions || attractions.length < 5) && this.config.useLocalDatabase) {
      console.log('📍 Falling back to local database');
      const localAttractions = this.getNearbyAttractionsLocal(lat, lng, centerName);
      attractions = this.mergeAttractions(attractions, localAttractions);
    }

    // Cache result
    this.cache.set(cacheKey, {
      data: attractions,
      timestamp: Date.now()
    });

    return attractions;
  }

  /**
   * Format attraction for display
   */
  formatAttraction(attraction) {
    const distance = attraction.distance.toFixed(1);
    const driveTime = this.calculateDriveTime(attraction.distance);
    const driveTimeText = driveTime < 60 ? `${driveTime} min` : `${Math.round(driveTime / 60)}h`;

    return {
      ...attraction,
      distanceText: `${distance} mi`,
      driveTimeText,
      status: attraction.exists ? '✅ In App' : '🔗 View on Google',
      googleUrl: this.getGoogleMapsUrl(attraction.name, attraction.latitude, attraction.longitude)
    };
  }

  /**
   * Get formatted nearby attractions
   */
  async getFormattedNearbyAttractions(lat, lng, centerName) {
    const attractions = await this.getNearbyAttractions(lat, lng, centerName);
    return attractions.map(attr => this.formatAttraction(attr));
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🧹 Nearby attractions cache cleared');
  }
}

// Create global instance
window.nearbyAttractionsFinder = window.nearbyAttractionsFinder || new NearbyAttractionsFinder();

// ============================================================
// UI HELPERS
// ============================================================

/**
 * Generate HTML for nearby attraction card
 */
function createAttractionCard(attraction, onAttractionClick) {
  const ratingStars = attraction.rating
    ? '⭐'.repeat(Math.round(attraction.rating))
    : '';

  let actionButton = '';
  if (attraction.exists && attraction.existingLocation) {
    actionButton = `
      <button 
        class="attraction-btn attraction-btn-primary"
        onclick="window.dispatchEvent(new CustomEvent('navigate-location', { detail: { location: ${JSON.stringify(
          attraction.existingLocation
        ).replace(/"/g, '&quot;')} } }))"
      >
        View Details
      </button>
    `;
  } else {
    actionButton = `
      <a href="${attraction.googleUrl}" target="_blank" class="attraction-btn attraction-btn-secondary">
        View on Google
      </a>
    `;
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
        ${ratingStars ? `<span class="attraction-rating">${ratingStars} ${attraction.rating.toFixed(1)}</span>` : ''}
      </div>
      
      ${attraction.description ? `<p class="attraction-description">${attraction.description}</p>` : ''}
      
      <div class="attraction-actions">
        ${actionButton}
        ${!attraction.exists ? `
          <button class="attraction-btn attraction-btn-add" onclick="window.dispatchEvent(new CustomEvent('add-attraction', { detail: { attraction: ${JSON.stringify(
            attraction
          ).replace(/"/g, '&quot;')} } }))">
            ➕ Add to App
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Render nearby attractions list
 */
function renderNearbyAttractions(attractions, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!attractions || attractions.length === 0) {
    container.innerHTML = `
      <div class="no-attractions">
        <p>No nearby attractions found</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="attractions-list">
      ${attractions.map(attr => createAttractionCard(attr)).join('')}
    </div>
  `;
}

/**
 * Auto-load nearby attractions for a location
 */
async function autoLoadNearbyAttractions(lat, lng, locationName, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Show loading state
  container.innerHTML = '<div class="loading-attractions">Loading nearby attractions...</div>';

  try {
    const attractions = await window.nearbyAttractionsFinder.getFormattedNearbyAttractions(
      lat,
      lng,
      locationName
    );

    renderNearbyAttractions(attractions, containerId);
  } catch (error) {
    console.error('❌ Error loading nearby attractions:', error);
    container.innerHTML = '<div class="error-attractions">Error loading attractions</div>';
  }
}

// ============================================================
// EXPORTS
// ============================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    NearbyAttractionsFinder,
    createAttractionCard,
    renderNearbyAttractions,
    autoLoadNearbyAttractions
  };
}

console.log('✅ Nearby Attractions Finder v1.0.0 Loaded');

