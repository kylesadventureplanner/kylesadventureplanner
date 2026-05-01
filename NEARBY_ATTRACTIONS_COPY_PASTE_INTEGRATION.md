#!/usr/bin/env node

# 🚀 COPY-PASTE INTEGRATION CODE
## All 6 Features Ready to Deploy

---

## Basic Integration (Drop this in your location form)

```javascript
// On page load - setup
document.addEventListener('DOMContentLoaded', async () => {
  // Load your app's locations
  const allLocations = await getAllLocationsFromDatabase();
  window.nearbyAttractionsFinder.setAppLocations(allLocations);
});

// When user submits location form
document.getElementById('locationForm').addEventListener('submit', async (e) => {
  const formData = new FormData(e.target);
  const locationData = {
    name: formData.get('name'),
    latitude: parseFloat(formData.get('latitude')),
    longitude: parseFloat(formData.get('longitude')),
    description: formData.get('description'),
    tags: formData.get('tags'),
    type: formData.get('type') || 'location'
  };

  // ✅ FEATURE #1: Detect location profile
  const profile = inferLocationProfile(locationData);
  console.log(`📍 Location Type: ${profile}`);

  // ✅ FEATURE #3: Get weather
  const weather = await fetchWeatherCondition(
    locationData.latitude,
    locationData.longitude
  );
  console.log(`🌤️ Weather: ${weather.emoji} ${weather.condition}`);

  // ✅ FEATURE #4 & #5: Get attractions (hybrid search + ranking)
  const attractions = await window.nearbyAttractionsFinder
    .getFormattedNearbyAttractions(
      locationData.latitude,
      locationData.longitude,
      locationData.name,
      { radiusMiles: 5 }
    );
  console.log(`🎯 Found ${attractions.length} attractions`);

  // ✅ FEATURE #2: Generate smart itinerary
  const itinerary = buildSmartItineraryGroups(profile, attractions, {
    weatherBias: weather.bias,     // Indoor-bias if rainy
    minRating: 4.0,                // Min rating
    timeBudgetHours: 4             // Time limit
  });

  // ✅ FEATURE #6: Build day plan with stops
  itinerary.forEach(slot => {
    slot.suggestions.slice(0, 2).forEach(stop => {
      window.dayPlanHelpers.addStop(stop);
    });
  });

  // Get shareable Google Maps route
  const routeUrl = window.dayPlanHelpers.buildRouteUrl();
  console.log(`📍 Route: ${routeUrl}`);
});
```

---

## Feature Reference

### Feature #1: Profile Detection
```javascript
const profile = inferLocationProfile({
  name: "Waterfall Trail",
  description: "Scenic hiking",
  tags: "nature,outdoor,trail"
});
// Returns: 'outdoor_adventure' | 'dining' | 'culture' | 
//          'entertainment' | 'shopping' | 'family' | 'general'
```

### Feature #2: Smart Itinerary
```javascript
const itinerary = buildSmartItineraryGroups(profile, attractions, {
  weatherBias: 'indoor',      // 'none' | 'outdoor' | 'indoor' | 'indoor_strong'
  minRating: 4.0,             // Optional: filter by rating
  openNow: true,              // Optional: only open locations
  timeBudgetHours: 4          // Optional: fit in time limit
});

// Result: Array of recommendation slots
// Each has: { role, icon, suggestions: [] }
```

### Feature #3: Weather
```javascript
const weather = await fetchWeatherCondition(lat, lng);
// Returns: {
//   condition: 'clear' | 'rainy' | 'snowing' | ...,
//   emoji: '☀️' | '🌧️' | '❄️',
//   bias: 'outdoor' | 'indoor' | 'indoor_strong' | 'none',
//   tempC: 12.5,
//   description: 'Human readable'
// }
```

### Feature #4: Hybrid Search
```javascript
const attrs = await window.nearbyAttractionsFinder.getNearbyAttractions(
  lat, lng, locationName,
  {
    radiusMiles: 5,
    useLocalDatabase: true,      // ✅ Your app's locations
    googlePlacesApiKey: 'KEY',   // ✅ Google Places (optional)
    forceRefresh: false          // Use cache if available
  }
);
// Returns: Deduplicated, merged attractions
```

### Feature #5: Smart Ranking
```javascript
// Already applied in getNearbyAttractions()
// Attractions sorted by: distance + rating + source + app-match

// Weights:
{
  distance: 0.255,        // 25.5%
  rating: 0.059,          // 5.9%
  local: 0.216,           // 21.6% (your DB)
  google: 0.108,          // 10.8% (Google)
  existsInApp: 0.363      // 36.3% (in app)
}
```

### Feature #6: Day Planning
```javascript
// Add stops
window.dayPlanHelpers.addStop({
  id: 'unique-id',
  name: 'Stop Name',
  latitude: 40.7128,
  longitude: -74.0060,
  driveTimeText: '8 min',
  distanceText: '2.3 mi'
});

// Get route
const url = window.dayPlanHelpers.buildRouteUrl();
window.open(url); // Opens in Google Maps

// Manage
const plan = window.dayPlanHelpers.load();     // Get all stops
window.dayPlanHelpers.removeStop('id');        // Remove one
window.dayPlanHelpers.clear();                 // Clear all
```

---

## HTML Form Template

```html
<form id="locationForm">
  <input type="text" name="name" placeholder="Location name" required>
  <input type="number" name="latitude" placeholder="Latitude" step="0.0001" required>
  <input type="number" name="longitude" placeholder="Longitude" step="0.0001" required>
  <textarea name="description" placeholder="Description"></textarea>
  <input type="text" name="tags" placeholder="hiking, nature, trail">
  <select name="type">
    <option value="location">Location</option>
    <option value="attraction">Attraction</option>
    <option value="restaurant">Restaurant</option>
  </select>
  <button type="submit">Find Nearby Attractions</button>
</form>
```

---

## Complete Working Example

See: **nearby-attractions-v3.1-preview.html** or create integration using code above

---

## Configuration (Optional)

```javascript
const finder = new NearbyAttractionsFinder({
  searchRadius: 5,                  // miles
  maxAttractions: 15,               // result limit
  useLocalDatabase: true,           // your DB
  googlePlacesApiKey: null,         // optional
  cacheDurationMs: 3600000,         // 1 hour
  sourceWeights: {
    distance: 0.255,
    rating: 0.059,
    local: 0.216,
    google: 0.108,
    existsInApp: 0.363
  }
});

window.nearbyAttractionsFinder = finder;
```

---

## That's It! 🚀

All 6 features are wired up and ready. Copy the integration code into your form handler and you're done.


