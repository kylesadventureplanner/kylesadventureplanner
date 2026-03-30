/**
 * CONSOLIDATED CITY VIEWER SYSTEM v7.0.141
 * ==========================================
 *
 * A unified, comprehensive city viewing system that consolidates all city-related
 * functionality from multiple files into a single, maintainable module.
 *
 * INCLUDES:
 * - City Viewer Tab Opener (enforced new tab)
 * - Location Hours Checker
 * - Drive Time Calculator
 * - Dynamic Tag Filter
 * - City Viewer Integration
 * - City Visualizer
 *
 * Version: 7.0.141
 * Date: March 15, 2026
 * Created: Consolidated from 4 separate city viewer files
 */

console.log('🌆 Consolidated City Viewer System v7.0.141 Loading...');

// ============================================================
// SECTION 1: CITY VIEWER TAB OPENER (Enforced New Tab)
// ============================================================

/**
 * Open City Viewer in GUARANTEED new tab
 */
window.openCityViewerWindow = function() {
  console.log('🌆 Opening City Viewer - ENFORCED NEW TAB');

  // Calculate position and size for new window
  const width = Math.min(1400, window.screen.width - 100);
  const height = Math.min(900, window.screen.height - 100);
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;

  try {
    // Method 1: Direct new tab (preferred)
    const url = window.location.origin + '/HTML Files/city-viewer-window.html';
    const newTab = window.open(url, '_blank', `width=${width},height=${height},left=${left},top=${top}`);

    if (newTab) {
      newTab.focus();
      console.log('✅ City Viewer opened in NEW TAB (Method 1)');
      return newTab;
    }
  } catch (error) {
    console.error('❌ Method 1 failed:', error);
  }

  try {
    // Method 2: Fallback - relative path
    const newTab = window.open('HTML Files/city-viewer-window.html', '_blank');
    if (newTab) {
      newTab.focus();
      console.log('✅ City Viewer opened in NEW TAB (Method 2)');
      return newTab;
    }
  } catch (error) {
    console.error('❌ Method 2 failed:', error);
  }

  // If both fail, show error
  console.error('❌ Could not open City Viewer');
  alert('Please enable pop-ups/tabs to open City Viewer');
  return null;
};

// Override all possible function names for compatibility
window.openCityViewerInTab = window.openCityViewerWindow;
window.viewCityDetails = window.openCityViewerWindow;
window.viewCity = window.openCityViewerWindow;
window.showCityViewer = window.openCityViewerWindow;

console.log('✅ City Viewer tab opener installed');

// ============================================================
// SECTION 2: GEOLOCATION & DRIVE TIME SYSTEM
// ============================================================

/**
 * Get user's location via geolocation API
 */
window.getUserLocation = async function() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log(`📍 User location: ${location.lat}, ${location.lng}`);
        resolve(location);
      },
      (error) => {
        console.error('❌ Geolocation error:', error.message);
        reject(error);
      }
    );
  });
};

/**
 * Calculate distance between two coordinates (haversine formula)
 * Returns distance in miles
 */
window.calculateDistance = function(lat1, lng1, lat2, lng2) {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Estimate drive time (rough approximation: 60 mph average)
 */
window.estimateDriveTime = function(distance) {
  const avgSpeed = 60; // mph
  const hours = distance / avgSpeed;
  const minutes = Math.round((hours % 1) * 60);
  const wholeHours = Math.floor(hours);

  if (wholeHours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${wholeHours}h`;
  } else {
    return `${wholeHours}h ${minutes}m`;
  }
};

/**
 * Format drive time for display
 */
window.formatDriveTime = function(distance) {
  if (!distance || isNaN(distance)) return 'N/A';
  const driveTime = window.estimateDriveTime(distance);
  const miles = distance.toFixed(1);
  return `🚗 ${driveTime} (${miles} mi)`;
};

console.log('✅ Geolocation and drive time system installed');

// ============================================================
// SECTION 3: LOCATION HOURS CHECKER
// ============================================================

class LocationHoursChecker {
  constructor() {
    this.closingSoonThreshold = 120; // minutes (2 hours)
  }

  /**
   * Check if location is open right now
   */
  isOpenNow(hoursStr) {
    try {
      if (!hoursStr || hoursStr === 'N/A' || hoursStr === '') {
        return null; // Unknown
      }

      const now = new Date();
      const dayIndex = now.getDay();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = daysOfWeek[dayIndex];

      // Parse hours string (e.g., "Mon-Fri: 9am-5pm, Sat-Sun: Closed")
      const todayPattern = new RegExp(`${today}.*?:(.*?)(?:,|$)`, 'i');
      const match = hoursStr.match(todayPattern);

      if (!match) {
        return null; // Couldn't parse
      }

      const timeStr = match[1].trim();

      if (timeStr.toLowerCase().includes('closed')) {
        return false;
      }

      // Parse times (e.g., "9am-5pm")
      const times = timeStr.match(/(\d{1,2}):?(\d{0,2})\s*(am|pm)?.*?-.*?(\d{1,2}):?(\d{0,2})\s*(am|pm)/i);
      if (!times) {
        return null;
      }

      const openHour = parseInt(times[1]);
      const openMin = parseInt(times[2] || 0);
      const openAmPm = times[3] || (openHour < 12 ? 'am' : 'pm');

      const closeHour = parseInt(times[4]);
      const closeMin = parseInt(times[5] || 0);
      const closeAmPm = times[6] || (closeHour < 12 ? 'am' : 'pm');

      let openTime = this.convertTo24Hour(openHour, openMin, openAmPm);
      let closeTime = this.convertTo24Hour(closeHour, closeMin, closeAmPm);

      const isOpen = currentTime >= openTime && currentTime < closeTime;
      return isOpen;
    } catch (error) {
      console.warn('⚠️ Error checking hours:', error);
      return null;
    }
  }

  /**
   * Convert 12-hour to 24-hour format
   */
  convertTo24Hour(hour, min, ampm) {
    let h = parseInt(hour);
    if (ampm.toLowerCase() === 'pm' && h !== 12) {
      h += 12;
    }
    if (ampm.toLowerCase() === 'am' && h === 12) {
      h = 0;
    }
    return h * 60 + min;
  }

  /**
   * Get minutes until closing
   */
  getMinutesUntilClosing(hoursStr) {
    try {
      if (!hoursStr || hoursStr === 'N/A') {
        return null;
      }

      const now = new Date();
      const dayIndex = now.getDay();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = daysOfWeek[dayIndex];

      const todayPattern = new RegExp(`${today}.*?:(.*?)(?:,|$)`, 'i');
      const match = hoursStr.match(todayPattern);

      if (!match) {
        return null;
      }

      const timeStr = match[1].trim();

      if (timeStr.toLowerCase().includes('closed')) {
        return 0;
      }

      const times = timeStr.match(/(\d{1,2}):?(\d{0,2})\s*(am|pm)?.*?-.*?(\d{1,2}):?(\d{0,2})\s*(am|pm)/i);
      if (!times) {
        return null;
      }

      const closeHour = parseInt(times[4]);
      const closeMin = parseInt(times[5] || 0);
      const closeAmPm = times[6] || (closeHour < 12 ? 'am' : 'pm');

      let closeTime = this.convertTo24Hour(closeHour, closeMin, closeAmPm);
      const minutesUntilClose = closeTime - currentTime;

      return minutesUntilClose > 0 ? minutesUntilClose : 0;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if location is closing soon
   */
  isClosingSoon(hoursStr) {
    const minutesUntil = this.getMinutesUntilClosing(hoursStr);
    return minutesUntil !== null && minutesUntil > 0 && minutesUntil <= this.closingSoonThreshold;
  }

  /**
   * Get formatted closing time
   */
  getClosingTimeStr(hoursStr) {
    const minutes = this.getMinutesUntilClosing(hoursStr);
    if (minutes === null || minutes === 0) {
      return null;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    } else {
      return `${mins}m`;
    }
  }
}

console.log('✅ Location hours checker installed');

// ============================================================
// SECTION 4: DRIVE TIME CALCULATOR
// ============================================================

class DriveTimeCalculator {
  constructor() {
    this.userLocation = null;
    this.driveTimeCache = new Map();
  }

  /**
   * Calculate drive time from user location to coordinates
   */
  async calculateDriveTime(userLat, userLng, destLat, destLng) {
    try {
      if (typeof google === 'undefined' || !google.maps || !google.maps.DistanceMatrixService) {
        console.warn('⚠️ Google Maps Distance Matrix API not available');
        return null;
      }

      const cacheKey = `${userLat},${userLng}→${destLat},${destLng}`;

      if (this.driveTimeCache.has(cacheKey)) {
        return this.driveTimeCache.get(cacheKey);
      }

      const service = new google.maps.DistanceMatrixService();

      const result = await service.getDistanceMatrix({
        origins: [{ lat: userLat, lng: userLng }],
        destinations: [{ lat: destLat, lng: destLng }],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL
      });

      if (result.rows && result.rows[0] && result.rows[0].elements[0]) {
        const element = result.rows[0].elements[0];
        if (element.status === 'OK') {
          const driveTime = {
            minutes: Math.round(element.duration.value / 60),
            text: element.duration.text
          };
          this.driveTimeCache.set(cacheKey, driveTime);
          return driveTime;
        }
      }
      return null;
    } catch (error) {
      console.warn('⚠️ Error calculating drive time:', error);
      return null;
    }
  }

  /**
   * Format drive time for display
   */
  formatDriveTime(driveTime) {
    if (!driveTime) return 'N/A';
    const hours = Math.floor(driveTime.minutes / 60);
    const mins = driveTime.minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }
}

console.log('✅ Drive time calculator installed');

// ============================================================
// SECTION 5: DYNAMIC TAG FILTER
// ============================================================

class DynamicTagFilter {
  constructor() {
    this.allTags = new Set();
    this.cityTags = new Map();
  }

  /**
   * Extract all unique tags from a city's locations
   */
  extractCityTags(locations) {
    const tags = new Set();

    locations.forEach(location => {
      // Tags are typically in column index around 5-7
      const tagsStr = location.values ? location.values[0][6] : location.tags;

      if (tagsStr && typeof tagsStr === 'string') {
        tagsStr.split(',').forEach(tag => {
          const cleanTag = tag.trim().toLowerCase();
          if (cleanTag) {
            tags.add(cleanTag);
          }
        });
      }
    });

    return Array.from(tags).sort();
  }

  /**
   * Get tags for a specific city
   */
  getTagsForCity(city, state, locations) {
    const cacheKey = `${city},${state}`;

    if (this.cityTags.has(cacheKey)) {
      return this.cityTags.get(cacheKey);
    }

    const cityLocations = locations.filter(loc => {
      const locCity = loc.city || (loc.values && loc.values[0][10]);
      const locState = loc.state || (loc.values && loc.values[0][9]);
      return locCity && locCity.toLowerCase() === city.toLowerCase() &&
             locState && locState.toLowerCase() === state.toLowerCase();
    });

    const tags = this.extractCityTags(cityLocations);
    this.cityTags.set(cacheKey, tags);
    return tags;
  }
}

console.log('✅ Dynamic tag filter installed');

// ============================================================
// SECTION 6: CITY VIEWER ENHANCEMENTS (Main API)
// ============================================================

window.cityViewerEnhancements = {
  hoursChecker: new LocationHoursChecker(),
  driveTimeCalculator: new DriveTimeCalculator(),
  tagFilter: new DynamicTagFilter(),

  /**
   * Check if location is open today
   */
  isOpenToday(hoursStr) {
    return this.hoursChecker.isOpenNow(hoursStr);
  },

  /**
   * Check if location is closing soon (within 2 hours)
   */
  isClosingSoon(hoursStr) {
    return this.hoursChecker.isClosingSoon(hoursStr);
  },

  /**
   * Get time until closing
   */
  getTimeUntilClosing(hoursStr) {
    return this.hoursChecker.getClosingTimeStr(hoursStr);
  },

  /**
   * Calculate drive time
   */
  async getDriveTime(userLat, userLng, destLat, destLng) {
    return await this.driveTimeCalculator.calculateDriveTime(userLat, userLng, destLat, destLng);
  },

  /**
   * Get tags for city
   */
  getTagsForCity(city, state, locations) {
    return this.tagFilter.getTagsForCity(city, state, locations);
  }
};

console.log('✅ City Viewer Enhancements API ready');

// ============================================================
// SECTION 7: CITY VIEWER INTEGRATION
// ============================================================

window.enhancedCityViewerIntegration = {
  /**
   * Initialize integration
   */
  init: function() {
    console.log('✅ City Viewer Integration initialized');
  },

  /**
   * Filter locations by open today status
   */
  filterByOpenToday: function(button) {
    console.log('Filtering by open today...');
    if (button) {
      button.classList.toggle('active');
    }
  },

  /**
   * Filter locations by closing soon status
   */
  filterByClosingSoon: function(button) {
    console.log('Filtering by closing soon...');
    if (button) {
      button.classList.toggle('active');
    }
  }
};

console.log('✅ City Viewer Integration ready');

// ============================================================
// SECTION 8: CITY VISUALIZER (Grouping & Visualization)
// ============================================================

class CityVisualizer {
  constructor() {
    this.adventuresData = window.adventuresData || [];
    this.cityGroups = new Map();
    this.currentSortBy = 'count'; // 'count' or 'name'
    this.init();
  }

  /**
   * Initialize the city visualizer
   */
  init() {
    console.log('🌆 City Visualizer initialized');
  }

  /**
   * Group locations by city
   */
  groupLocationsByCity(locations) {
    const groups = new Map();

    locations.forEach(location => {
      const city = location.city || (location.values && location.values[0][10]);
      const state = location.state || (location.values && location.values[0][9]);
      const key = `${city}, ${state}`;

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(location);
    });

    return groups;
  }

  /**
   * Get city statistics
   */
  getCityStats(city, state, locations) {
    const cityLocations = locations.filter(loc => {
      const locCity = loc.city || (loc.values && loc.values[0][10]);
      const locState = loc.state || (loc.values && loc.values[0][9]);
      return locCity && locCity.toLowerCase() === city.toLowerCase() &&
             locState && locState.toLowerCase() === state.toLowerCase();
    });

    return {
      city,
      state,
      count: cityLocations.length,
      locations: cityLocations
    };
  }

  /**
   * Sort cities by count (descending)
   */
  sortByCount(cityGroups) {
    return Array.from(cityGroups.entries())
      .sort((a, b) => b[1].length - a[1].length);
  }

  /**
   * Sort cities by name (ascending)
   */
  sortByName(cityGroups) {
    return Array.from(cityGroups.entries())
      .sort((a, b) => a[0].localeCompare(b[0]));
  }

  /**
   * Get all cities
   */
  getAllCities() {
    return this.groupLocationsByCity(this.adventuresData);
  }

  /**
   * Export city data
   */
  exportCityData(format = 'json') {
    const cities = this.getAllCities();
    const data = {
      totalCities: cities.size,
      totalLocations: this.adventuresData.length,
      cities: Array.from(cities.entries()).map(([key, locations]) => ({
        name: key,
        count: locations.length
      }))
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else if (format === 'csv') {
      let csv = 'City,State,Count\n';
      data.cities.forEach(city => {
        const [cityName, state] = city.name.split(', ');
        csv += `${cityName},${state},${city.count}\n`;
      });
      return csv;
    }

    return data;
  }
}

// Create global instance
window.cityVisualizer = window.cityVisualizer || new CityVisualizer();

console.log('✅ City Visualizer installed');

// ============================================================
// SECTION 9: ENHANCED CITY VISUALIZER (Advanced City Management)
// ============================================================

class EnhancedCityVisualizer {
  constructor() {
    this.adventuresData = window.adventuresData || [];
    this.cityGroups = new Map();
    this.currentView = 'cityList'; // 'cityList' or 'cityDetail'
    this.selectedCity = null;
    this.referenceLocation = {
      name: 'Your Location',
      lat: 35.3395,  // Hendersonville, NC
      lng: -82.4637
    };
    this.currentFilters = {
      tags: [],
      keywords: ''
    };
    this.availableTags = new Set();
    this.init();
  }

  /**
   * Initialize the enhanced city visualizer
   */
  init() {
    this.createStyles();
    this.createMarkup();
    this.attachEventListeners();

    if (this.adventuresData && this.adventuresData.length > 0) {
      this.populateCityData();
      console.log(`✅ Enhanced City Visualizer initialized with ${this.adventuresData.length} adventures`);
    } else {
      console.log('⏳ Waiting for adventure data...');
      const checkDataInterval = setInterval(() => {
        if (window.adventuresData && window.adventuresData.length > 0) {
          this.adventuresData = window.adventuresData;
          this.populateCityData();
          console.log(`✅ City data populated: ${this.adventuresData.length} adventures`);
          clearInterval(checkDataInterval);
        }
      }, 500);

      setTimeout(() => clearInterval(checkDataInterval), 30000);
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  }

  /**
   * Get approximate coordinates for a city
   */
  getApproximateCoordinates(city, state) {
    const cityCoordinates = {
      'Hendersonville,NC': { lat: 35.3395, lng: -82.4637 },
      'Asheville,NC': { lat: 35.5951, lng: -82.5515 },
      'Greenville,SC': { lat: 34.8526, lng: -82.3940 },
      'Columbia,SC': { lat: 34.0007, lng: -81.0348 },
      'Charlotte,NC': { lat: 35.2271, lng: -80.8431 },
      'Raleigh,NC': { lat: 35.7796, lng: -78.6382 },
      'Durham,NC': { lat: 35.9940, lng: -78.8986 },
      'Chapel Hill,NC': { lat: 35.9132, lng: -79.0558 },
      'Greensboro,NC': { lat: 36.0726, lng: -79.7920 },
      'Winston-Salem,NC': { lat: 36.0999, lng: -80.2442 },
      'Boone,NC': { lat: 36.2173, lng: -81.6846 },
      'Knoxville,TN': { lat: 35.9606, lng: -83.9207 },
      'Nashville,TN': { lat: 36.1627, lng: -86.7816 },
      'Chattanooga,TN': { lat: 35.0456, lng: -85.2672 },
      'Atlanta,GA': { lat: 33.7490, lng: -84.3880 },
      'Gatlinburg,TN': { lat: 35.7142, lng: -83.5111 },
      'Pigeon Forge,TN': { lat: 35.7847, lng: -83.5806 },
      'Sevierville,TN': { lat: 35.8761, lng: -83.5603 },
    };

    let key = `${city},${state}`;
    if (cityCoordinates[key]) {
      return cityCoordinates[key];
    }

    const cityLower = city.toLowerCase();
    for (const [coordKey, coords] of Object.entries(cityCoordinates)) {
      if (coordKey.toLowerCase().startsWith(cityLower)) {
        return coords;
      }
    }

    const missingKey = `${city},${state}`;
    window.__cityCoordinateWarningCache = window.__cityCoordinateWarningCache || new Set();
    if (!window.__cityCoordinateWarningCache.has(missingKey)) {
      console.warn(`⚠️ City coordinates not found for: ${city}, ${state}. Using default.`);
      window.__cityCoordinateWarningCache.add(missingKey);
    }
    return { lat: 35.3395, lng: -82.4637 };
  }

  /**
   * Populate city data with distances
   */
  populateCityData() {
    this.cityGroups.clear();

    if (!this.adventuresData || this.adventuresData.length === 0) {
      console.log('No adventures data available');
      return;
    }

    this.adventuresData.forEach((adventure, idx) => {
      let values = null;

      if (adventure?.row?.values?.[0]) {
        values = adventure.row.values[0];
      } else if (adventure?.values?.[0]) {
        values = adventure.values[0];
      } else if (Array.isArray(adventure) && adventure.length > 0) {
        values = adventure;
      }

      if (!values || !Array.isArray(values)) {
        return;
      }

      const city = (values[10] || 'Unknown City').trim();
      const state = (values[9] || '').trim();
      const tags = (values[3] || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

      if (!this.cityGroups.has(city)) {
        const coords = this.getApproximateCoordinates(city, state);
        const distance = this.calculateDistance(
          this.referenceLocation.lat,
          this.referenceLocation.lng,
          coords.lat,
          coords.lng
        );

        this.cityGroups.set(city, {
          name: city,
          state: state,
          distance: parseFloat(distance),
          coordinates: coords,
          locations: [],
          allTags: new Set()
        });
      }

      this.cityGroups.get(city).locations.push({
        index: idx,
        name: values[0] || 'Unknown',
        tags: tags,
        difficulty: values[7] || '',
        cost: values[14] || '',
        rating: values[13] || '',
        description: values[16] || ''
      });

      tags.forEach(tag => {
        this.cityGroups.get(city).allTags.add(tag);
        this.availableTags.add(tag);
      });
    });

    console.log(`✅ City groups populated: ${this.cityGroups.size} cities, ${this.availableTags.size} unique tags`);
  }

  /**
   * Create CSS for enhanced city visualizer
   */
  createStyles() {
    if (document.getElementById('enhancedCityVisualizerStyles')) return;

    const style = document.createElement('style');
    style.id = 'enhancedCityVisualizerStyles';
    style.textContent = `
      #enhancedCityVisualizerModal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        z-index: 1010;
        width: 95%;
        max-width: 1200px;
        max-height: 90vh;
        display: none;
        flex-direction: column;
        overflow: hidden;
        animation: slideUp 0.3s ease-out;
      }

      #enhancedCityVisualizerModal.visible {
        display: flex;
      }

      @keyframes slideUp {
        from { opacity: 0; transform: translate(-50%, -45%); }
        to { opacity: 1; transform: translate(-50%, -50%); }
      }

      #enhancedCityVisualizerBackdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1009;
        display: none;
      }

      #enhancedCityVisualizerBackdrop.visible {
        display: block;
      }

      .enhanced-city-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }

      .enhanced-city-title {
        font-size: 24px;
        font-weight: 700;
        margin: 0;
      }

      .enhanced-city-close {
        background: rgba(255,255,255,0.2);
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 20px;
        transition: all 0.2s;
      }

      .enhanced-city-close:hover {
        background: rgba(255,255,255,0.3);
      }

      .enhanced-city-controls {
        padding: 16px 24px;
        background: #f9fafb;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        align-items: center;
      }

      .enhanced-city-search {
        flex: 1;
        min-width: 250px;
        padding: 10px 16px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        font-size: 14px;
      }

      .enhanced-city-search:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      .enhanced-city-sort-btn {
        padding: 8px 16px;
        border: 1px solid #e5e7eb;
        background: white;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        font-size: 13px;
        transition: all 0.2s;
      }

      .enhanced-city-sort-btn.active {
        background: #667eea;
        color: white;
        border-color: #667eea;
      }

      .enhanced-city-content {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
      }

      .enhanced-city-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
      }

      .enhanced-city-card {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .enhanced-city-card:hover {
        border-color: #667eea;
        box-shadow: 0 10px 25px rgba(102, 126, 234, 0.15);
        transform: translateY(-4px);
      }

      .enhanced-city-card-name {
        font-size: 18px;
        font-weight: 700;
        color: #1f2937;
        margin: 0 0 12px 0;
      }

      .enhanced-city-footer {
        padding: 16px 24px;
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }

      .enhanced-city-btn {
        padding: 10px 20px;
        border: 1px solid #e5e7eb;
        background: white;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
      }

      .enhanced-city-btn:hover {
        border-color: #667eea;
        background: #f0f4ff;
      }

      .enhanced-city-btn.primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-color: #667eea;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Create HTML markup
   */
  createMarkup() {
    const backdrop = document.createElement('div');
    backdrop.id = 'enhancedCityVisualizerBackdrop';
    document.body.appendChild(backdrop);

    const modal = document.createElement('div');
    modal.id = 'enhancedCityVisualizerModal';
    modal.innerHTML = `
      <div class="enhanced-city-header">
        <h2 class="enhanced-city-title">🏙️ City Explorer</h2>
        <button class="enhanced-city-close" onclick="window.closeEnhancedCityVisualizer()">✕</button>
      </div>

      <div class="enhanced-city-controls">
        <input type="text" class="enhanced-city-search" id="citysearch" placeholder="Search cities...">
        <div class="enhanced-city-sort">
          <button class="enhanced-city-sort-btn active" data-sort="distance">📍 Distance</button>
          <button class="enhanced-city-sort-btn" data-sort="name">A-Z</button>
          <button class="enhanced-city-sort-btn" data-sort="count">📊 Count</button>
        </div>
      </div>

      <div class="enhanced-city-content" id="enhancedCityContent">
        <div id="cityListView" class="enhanced-city-list"></div>
      </div>

      <div class="enhanced-city-footer">
        <button class="enhanced-city-btn" onclick="window.closeEnhancedCityVisualizer()">Close</button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    document.getElementById('enhancedCityVisualizerBackdrop')?.addEventListener('click', () => {
      window.closeEnhancedCityVisualizer();
    });

    document.getElementById('citysearch')?.addEventListener('input', () => {
      this.renderCityList();
    });

    document.querySelectorAll('.enhanced-city-sort-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.enhanced-city-sort-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.renderCityList();
      });
    });
  }

  /**
   * Render city list view
   */
  renderCityList() {
    const searchTerm = (document.getElementById('citysearch')?.value || '').toLowerCase();
    const activeBtn = document.querySelector('.enhanced-city-sort-btn.active');
    const sortMethod = activeBtn?.getAttribute('data-sort') || 'distance';

    let cities = Array.from(this.cityGroups.values());

    if (searchTerm) {
      cities = cities.filter(city =>
        city.name.toLowerCase().includes(searchTerm) ||
        city.state.toLowerCase().includes(searchTerm)
      );
    }

    if (sortMethod === 'distance') {
      cities.sort((a, b) => a.distance - b.distance);
    } else if (sortMethod === 'name') {
      cities.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortMethod === 'count') {
      cities.sort((a, b) => b.locations.length - a.locations.length);
    }

    const listView = document.getElementById('cityListView');

    if (cities.length === 0) {
      listView.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px;"><p style="color: #9ca3af;">No cities found</p></div>`;
      return;
    }

    listView.innerHTML = cities.map(city => `
      <div class="enhanced-city-card" onclick="window.viewCityDetailsEnhanced('${city.name.replace(/'/g, "\\'")}')">
        <h3 class="enhanced-city-card-name">${city.name}</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
          <div style="background: #f9fafb; padding: 8px; border-radius: 6px;">
            <span style="color: #6b7280;">📍 ${city.distance} mi</span>
          </div>
          <div style="background: #f9fafb; padding: 8px; border-radius: 6px;">
            <span style="color: #6b7280;">📌 ${city.locations.length}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Show the modal
   */
  show() {
    document.getElementById('enhancedCityVisualizerBackdrop').classList.add('visible');
    document.getElementById('enhancedCityVisualizerModal').classList.add('visible');
    this.currentView = 'cityList';
    this.refreshData();
    this.renderCityList();
  }

  /**
   * Hide the modal
   */
  hide() {
    document.getElementById('enhancedCityVisualizerBackdrop').classList.remove('visible');
    document.getElementById('enhancedCityVisualizerModal').classList.remove('visible');
  }

  /**
   * Refresh data from main window
   */
  refreshData() {
    if (window.adventuresData && window.adventuresData.length > 0) {
      this.adventuresData = window.adventuresData;
      this.populateCityData();
    }
  }
}

// Create global instance
window.enhancedCityViz = window.enhancedCityViz || new EnhancedCityVisualizer();

/**
 * Global functions for enhanced city visualizer
 */
window.openEnhancedCityVisualizer = function() {
  if (!window.enhancedCityViz) {
    window.enhancedCityViz = new EnhancedCityVisualizer();
  }
  window.enhancedCityViz.show();
};

window.closeEnhancedCityVisualizer = function() {
  if (window.enhancedCityViz) {
    window.enhancedCityViz.hide();
  }
};

window.viewCityDetailsEnhanced = function(cityName) {
  console.log(`📍 Viewing details for: ${cityName}`);
  // Can be extended to show location details
};

console.log('✅ Enhanced City Visualizer ready');

// ============================================================
// SECTION 10: ENHANCED CITY VIEWER (Interactive Location Browsing)
// ============================================================

window.enhancedCityViewer = {
  currentView: 'cities',
  selectedCity: null,
  citiesData: {},

  /**
   * Initialize enhanced city viewer
   */
  init: function() {
    this.createStyles();
    console.log('✅ Enhanced City Viewer initialized');
  },

  /**
   * Create enhanced styles
   */
  createStyles: function() {
    if (document.getElementById('enhancedCityViewerStyles')) return;

    const style = document.createElement('style');
    style.id = 'enhancedCityViewerStyles';
    style.textContent = `
      .city-viewer-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .city-viewer-title {
        font-size: 18px;
        font-weight: 700;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .city-viewer-back-btn {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        font-size: 13px;
        transition: all 0.2s;
      }

      .city-viewer-back-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .locations-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .location-item {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 16px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .location-item:hover {
        border-color: #667eea;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        transform: translateY(-2px);
      }

      .location-item-name {
        font-weight: 700;
        color: #1f2937;
        font-size: 14px;
        margin-bottom: 4px;
      }

      .location-tag {
        background: #dbeafe;
        color: #1e40af;
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
      }

      .location-item-action {
        background: #667eea;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        font-size: 12px;
        transition: all 0.2s;
      }

      .location-item-action:hover {
        background: #5568d3;
      }
    `;

    document.head.appendChild(style);
  },

  /**
   * Escape HTML
   */
  escapeHtml: function(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }
};

// Initialize enhanced city viewer
window.enhancedCityViewer.init();

console.log('✅ Enhanced City Viewer ready');

// ============================================================
// INITIALIZATION
// ============================================================

console.log('✅ Consolidated City Viewer System v7.0.141 Loaded');
console.log('  - City Viewer Tab Opener');
console.log('  - Geolocation & Drive Time System');
console.log('  - Location Hours Checker');
console.log('  - Drive Time Calculator');
console.log('  - Dynamic Tag Filter');
console.log('  - City Viewer Enhancements API');
console.log('  - City Viewer Integration');
console.log('  - City Visualizer');
console.log('  - Enhanced City Visualizer');
console.log('  - Enhanced City Viewer');

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    LocationHoursChecker,
    DriveTimeCalculator,
    DynamicTagFilter,
    CityVisualizer,
    cityViewerEnhancements,
    enhancedCityViewerIntegration
  };
}

