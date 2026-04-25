/**
 * DRIVE TIME AUTO-CALCULATOR
 * ==========================
 * Automatically calculates estimated drive time when adding a new location
 *
 * Features:
 * - Fixed home base reference point (100 Co Rd 2008, Hendersonville, NC 28791)
 * - Google Maps API support (optional)
 * - Manual speed/location override
 * - Caching & performance optimization
 * - Works without API (basic haversine formula)
 *
 * Version: 1.1.0
 * Date: April 25, 2026
 */

console.log('🚗 Drive Time Auto-Calculator Loading...');

// ============================================================
// HOME BASE — 100 Co Rd 2008, Hendersonville, NC 28791
// Coordinates geocoded from address; change only if address changes.
// ============================================================

const HOME_BASE = {
  name: 'Home (Hendersonville, NC)',
  address: '100 Co Rd 2008, Hendersonville, NC 28791',
  lat: 35.3938,   // Henderson County, NC — approx. Co Rd 2008 area
  lng: -82.4557
};

// ============================================================
// CONFIGURATION
// ============================================================

const DRIVE_TIME_CONFIG = {
  // Reference location — fixed to HOME_BASE above
  referenceLocation: {
    name: HOME_BASE.name,
    lat: HOME_BASE.lat,
    lng: HOME_BASE.lng,
    address: HOME_BASE.address
  },

  // Average drive speeds (mph) for different situations
  avgSpeeds: {
    urban: 25,        // City driving
    suburban: 35,     // Suburban roads
    highway: 55,      // Highway driving
    mixed: 35         // Mixed (default)
  },

  // Distance-based speed selection
  speedByDistance: {
    0: 'urban',       // 0-5 miles: urban
    5: 'suburban',    // 5-15 miles: suburban
    15: 'mixed',      // 15-50 miles: mixed
    50: 'highway'     // 50+ miles: highway
  },

  // Cache settings
  cacheEnabled: true,
  cacheDurationMs: 3600000, // 1 hour

  // Google Maps API key (optional)
  // If not provided, will use haversine calculation
  googleMapsApiKey: null,
  useGoogleMaps: false,

  // Auto-calculate on form field change
  autoCalculateOnChange: true,
  autoCalculateDebounceMs: 500
};

// ============================================================
// DRIVE TIME CALCULATOR CLASS
// ============================================================

class DriveTimeCalculator {
  constructor(config = {}) {
    this.config = { ...DRIVE_TIME_CONFIG, ...config };
    this.cache = new Map();
    this.debounceTimer = null;
    this.initialized = false;

    console.log('🚗 Drive Time Calculator initialized');
  }

  /**
   * Initialize calculator.
   * Reference location is pre-set to the fixed home base address,
   * so no geolocation prompt is required.
   */
  async initialize() {
    if (this.initialized) return;

    // Home base coordinates are hard-coded — always ready.
    console.log(
      `✅ Drive time reference: ${this.config.referenceLocation.name} ` +
      `(${this.config.referenceLocation.lat.toFixed(4)}, ${this.config.referenceLocation.lng.toFixed(4)})`
    );

    this.initialized = true;
  }

  /**
   * Set reference location manually
   */
  setReferenceLocation(lat, lng, name = 'Reference Point', address = null) {
    this.config.referenceLocation = {
      name,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      address
    };

    console.log(`📍 Reference location set: ${name}`);
    this.clearCache();
  }

  /**
   * Calculate haversine distance between two points (miles)
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
    const distance = R * c;

    return Math.round(distance * 100) / 100;
  }

  /**
   * Get appropriate speed based on distance
   */
  getSpeedByDistance(distanceMiles) {
    const speedType = Object.entries(this.config.speedByDistance)
      .reverse()
      .find(([distance]) => distanceMiles >= parseInt(distance))?.[1] || 'mixed';

    return this.config.avgSpeeds[speedType] || this.config.avgSpeeds.mixed;
  }

  /**
   * Calculate drive time (minutes)
   * Returns: { distanceMiles, durationMinutes, durationReadable, speed, method }
   */
  calculateDriveTime(lat, lng, locationName = 'Destination') {
    // Validate reference location
    if (!this.config.referenceLocation.lat || !this.config.referenceLocation.lng) {
      console.warn('⚠️ Reference location not set. Use setReferenceLocation()');
      return null;
    }

    // Check cache
    const cacheKey = `${lat},${lng}`;
    if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.config.cacheDurationMs) {
        console.log(`📦 Using cached drive time for ${locationName}`);
        return cached.data;
      }
    }

    // Calculate distance
    const distance = this.calculateDistance(
      this.config.referenceLocation.lat,
      this.config.referenceLocation.lng,
      lat,
      lng
    );

    // Determine speed based on distance
    const speed = this.getSpeedByDistance(distance);

    // Calculate duration in minutes
    const durationMinutes = Math.round((distance / speed) * 60);

    const result = {
      distanceMiles: distance,
      durationMinutes: durationMinutes,
      durationReadable: this.formatDuration(durationMinutes),
      speed: speed,
      method: 'haversine',
      calculatedAt: new Date().toISOString(),
      from: this.config.referenceLocation.name,
      to: locationName
    };

    // Cache result
    if (this.config.cacheEnabled) {
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
    }

    return result;
  }

  /**
   * Format duration in human-readable format
   */
  formatDuration(minutes) {
    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}m`;
  }

  /**
   * Calculate drive time using Google Maps API (if available)
   */
  async calculateDriveTimeWithGoogle(lat, lng, locationName = 'Destination') {
    if (!this.config.useGoogleMaps || !this.config.googleMapsApiKey) {
      console.warn('⚠️ Google Maps API not configured');
      return null;
    }

    const origin = `${this.config.referenceLocation.lat},${this.config.referenceLocation.lng}`;
    const destination = `${lat},${lng}`;

    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${this.config.googleMapsApiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.rows[0].elements[0].status === 'OK') {
        const element = data.rows[0].elements[0];
        const distanceMeters = element.distance.value;
        const durationSeconds = element.duration.value;

        const distanceMiles = Math.round((distanceMeters / 1609.34) * 100) / 100;
        const durationMinutes = Math.round(durationSeconds / 60);

        return {
          distanceMiles,
          durationMinutes,
          durationReadable: this.formatDuration(durationMinutes),
          speed: null,
          method: 'google-maps',
          calculatedAt: new Date().toISOString(),
          from: this.config.referenceLocation.name,
          to: locationName,
          trafficConsidered: true
        };
      } else {
        console.error('❌ Google Maps API error:', data.rows[0].elements[0].status);
        return null;
      }
    } catch (error) {
      console.error('❌ Google Maps API call failed:', error);
      return null;
    }
  }

  /**
   * Get drive time (tries Google Maps first, falls back to haversine)
   */
  async getDriveTime(lat, lng, locationName = 'Destination') {
    if (this.config.useGoogleMaps && this.config.googleMapsApiKey) {
      const result = await this.calculateDriveTimeWithGoogle(lat, lng, locationName);
      if (result) return result;
    }

    return this.calculateDriveTime(lat, lng, locationName);
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🧹 Drive time cache cleared');
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }

  /**
   * Format result for display
   */
  formatForDisplay(result) {
    if (!result) return 'N/A';

    return `${result.durationReadable} (${result.distanceMiles} mi)`;
  }

  /**
   * Get detailed report
   */
  getDetailedReport(result) {
    if (!result) return null;

    return `
📍 From: ${result.from}
🎯 To: ${result.to}
📏 Distance: ${result.distanceMiles} miles
⏱️  Estimated Drive Time: ${result.durationReadable}
🚗 Speed: ${result.speed || 'N/A'} mph
🔧 Method: ${result.method}
⏰ Calculated: ${new Date(result.calculatedAt).toLocaleString()}
    `;
  }
}

// Create global instance — pre-initialized with fixed home base
window.driveTimeCalculator = window.driveTimeCalculator || (() => {
  const calc = new DriveTimeCalculator();
  calc.initialized = true; // home base coords are hard-coded, no geolocation needed
  console.log(`📍 Drive time home base: ${HOME_BASE.address}`);
  return calc;
})();

// ============================================================
// AUTO-CALCULATORS FOR FORM INTEGRATION
// ============================================================

/**
 * Auto-calculate drive time on form input change
 */
function setupDriveTimeAutoCalculation(params = {}) {
  const {
    latitudeFieldId = 'latitude',
    longitudeFieldId = 'longitude',
    driveTimeFieldId = 'driveTime',
    locationNameFieldId = 'locationName',
    debounceMs = 500,
    showDetails = false
  } = params;

  const latField = document.getElementById(latitudeFieldId);
  const lngField = document.getElementById(longitudeFieldId);
  const driveTimeField = document.getElementById(driveTimeFieldId);
  const nameField = document.getElementById(locationNameFieldId);

  if (!latField || !lngField || !driveTimeField) {
    console.error('❌ Required fields not found');
    return;
  }

  // Function to calculate and update
  const updateDriveTime = async () => {
    const lat = parseFloat(latField.value);
    const lng = parseFloat(lngField.value);
    const name = nameField ? nameField.value || 'Destination' : 'Destination';

    if (isNaN(lat) || isNaN(lng)) {
      driveTimeField.value = '';
      return;
    }

    const result = await window.driveTimeCalculator.getDriveTime(lat, lng, name);

    if (result) {
      driveTimeField.value = window.driveTimeCalculator.formatForDisplay(result);
      driveTimeField.dataset.calculatedResult = JSON.stringify(result);

      if (showDetails) {
        console.log(window.driveTimeCalculator.getDetailedReport(result));
      }
    }
  };

  // Add debounced listeners
  latField.addEventListener('change', () => {
    clearTimeout(window.driveTimeDebounceTimer);
    window.driveTimeDebounceTimer = setTimeout(updateDriveTime, debounceMs);
  });

  lngField.addEventListener('change', () => {
    clearTimeout(window.driveTimeDebounceTimer);
    window.driveTimeDebounceTimer = setTimeout(updateDriveTime, debounceMs);
  });

  console.log('✅ Drive time auto-calculation setup complete');
}

/**
 * Get calculated result from field
 */
function getDriveTimeResult(fieldId = 'driveTime') {
  const field = document.getElementById(fieldId);
  if (!field || !field.dataset.calculatedResult) return null;

  try {
    return JSON.parse(field.dataset.calculatedResult);
  } catch (e) {
    return null;
  }
}

/**
 * Initialize calculator (no-op when using fixed home base, kept for API compat)
 */
async function initializeDriveTimeCalculator(config = {}) {
  window.driveTimeCalculator = new DriveTimeCalculator(config);
  window.driveTimeCalculator.initialized = true;
  console.log(`📍 Drive time reference: ${window.driveTimeCalculator.config.referenceLocation.name}`);
  return window.driveTimeCalculator;
}

/**
 * Set reference location manually
 */
function setDriveTimeReferenceLocation(lat, lng, name = 'Home', address = null) {
  window.driveTimeCalculator.setReferenceLocation(lat, lng, name, address);
}

/**
 * Get drive time for specific coordinates
 */
async function calculateDriveTime(lat, lng, name = 'Location') {
  return await window.driveTimeCalculator.getDriveTime(lat, lng, name);
}

// ============================================================
// EXPORTS
// ============================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DriveTimeCalculator,
    initializeDriveTimeCalculator,
    setDriveTimeReferenceLocation,
    calculateDriveTime,
    setupDriveTimeAutoCalculation,
    getDriveTimeResult
  };
}

console.log('✅ Drive Time Auto-Calculator v1.1.0 Loaded — Home Base: Hendersonville, NC');

