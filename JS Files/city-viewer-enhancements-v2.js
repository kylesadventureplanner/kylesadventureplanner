/**
 * CITY VIEWER ENHANCEMENTS - v7.0.128
 * ====================================
 * Enhanced features for city viewer:
 * 1. Drive time calculation and display
 * 2. Dynamic tag filters based on city data
 * 3. Open today filter
 * 4. Closing soon alerts
 *
 * Date: March 15, 2026
 */

(function() {
  console.log('🚀 City Viewer Enhancements v7.0.128 Loading...');

  // ============================================================
  // 1. LOCATION HOURS CHECKER - Check if open today/closing soon
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

  // ============================================================
  // 2. DRIVE TIME CALCULATOR - Calculate drive times to cities
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

  // ============================================================
  // 3. DYNAMIC TAG FILTER - Extract unique tags for city
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

  // ============================================================
  // 4. EXPORT TO GLOBAL SCOPE
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

  console.log('✅ City Viewer Enhancements v7.0.128 Ready');
  console.log('  - Location hours checking');
  console.log('  - Drive time calculation');
  console.log('  - Dynamic tag filters');
})();

