/**
 * DRIVE TIME AUTO-CALCULATOR
 * ==========================
 * Automatically calculates estimated drive time when adding a new location
 *
 * Features:
 * - Geolocation-based calculation
 * - Google Maps API support (optional)
 * - Manual speed/location override
 * - Caching & performance optimization
 * - Works without API (basic haversine formula)
 *
 * Version: 1.0.0
 * Date: April 24, 2026
 */

console.log('🚗 Drive Time Auto-Calculator Loading...');

// ============================================================
// CONFIGURATION
// ============================================================

const DRIVE_TIME_CONFIG = {
  // Reference location (user's home/starting point)
  // Can be set manually or auto-detected
  referenceLocation: {
    name: 'My Location',
    lat: null,
    lng: null,
    address: null
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
   * Initialize calculator (detect user location)
   */
  async initialize() {
    if (this.initialized) return;

    try {
      if (navigator.geolocation) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        this.config.referenceLocation.lat = position.coords.latitude;
        this.config.referenceLocation.lng = position.coords.longitude;

        console.log(
          `✅ Location detected: ${this.config.referenceLocation.lat.toFixed(4)}, ${this.config.referenceLocation.lng.toFixed(4)}`
        );

        this.initialized = true;
      } else {
        console.warn('⚠️ Geolocation not supported. Manual location setup required.');
      }
    } catch (error) {
      console.error('❌ Geolocation error:', error);
    }
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

// Create global instance
window.driveTimeCalculator = window.driveTimeCalculator || new DriveTimeCalculator();

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
 * Initialize calculator with user location
 */
async function initializeDriveTimeCalculator(config = {}) {
  window.driveTimeCalculator = new DriveTimeCalculator(config);
  await window.driveTimeCalculator.initialize();
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

console.log('✅ Drive Time Auto-Calculator v1.0.0 Loaded');

