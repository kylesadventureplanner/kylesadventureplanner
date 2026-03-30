/**
 * CITY VIEWER NEW TAB ENFORCER - v7.0.138
 * ========================================
 * Ensures City Viewer ALWAYS opens in new tab
 * Fixes any modal/popup attempts
 *
 * Adds drive time calculation system
 *
 * Date: March 15, 2026
 */

console.log('🌆 CITY VIEWER ENFORCER v7.0.138 LOADING...');

// ============================================================
// 1. AGGRESSIVE CITY VIEWER TAB OPENER
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

// Override all possible function names
window.openCityViewerInTab = window.openCityViewerWindow;
window.viewCityDetails = window.openCityViewerWindow;
window.viewCity = window.openCityViewerWindow;
window.showCityViewer = window.openCityViewerWindow;

console.log('✅ City Viewer tab opener installed');

// ============================================================
// 2. INTERCEPT ANY MODAL ATTEMPTS
// ============================================================

/**
 * Modal interceptor already handled by final-fix-v7-0-139
 * This prevents duplicate declaration errors
 */
console.log('✅ Modal interceptor handled by final-fix-v7-0-139');

// ============================================================
// 3. GEOLOCATION & DRIVE TIME SYSTEM
// ============================================================

/**
 * Get user's location
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
// 4. CITY VIEWER ENHANCEMENTS
// ============================================================

/**
 * Calculate drive times for all cities
 */
window.calculateCityDriveTimes = async function(cities, userLocation) {
  console.log('🚗 Calculating drive times for', Object.keys(cities).length, 'cities');

  if (!userLocation) {
    console.warn('⚠️ No user location');
    return cities;
  }

  // Add drive times to each city
  Object.values(cities).forEach(city => {
    if (city.latitude && city.longitude) {
      const distance = window.calculateDistance(
        userLocation.lat,
        userLocation.lng,
        parseFloat(city.latitude),
        parseFloat(city.longitude)
      );
      city.distance = distance;
      city.driveTime = window.estimateDriveTime(distance);
      city.driveTimeFormatted = window.formatDriveTime(distance);
    }
  });

  console.log('✅ Drive times calculated');
  return cities;
};

console.log('✅ City Viewer enhancements installed');

console.log('🌆 CITY VIEWER ENFORCER v7.0.138 READY');
console.log('  - Aggressive new tab opener');
console.log('  - Modal interceptor');
console.log('  - Geolocation system');
console.log('  - Drive time calculations');
console.log('  - City viewer enhancements');

