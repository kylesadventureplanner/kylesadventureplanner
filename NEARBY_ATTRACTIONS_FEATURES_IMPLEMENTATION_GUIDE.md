#!/usr/bin/env node

# 🎯 NEARBY ATTRACTIONS v3.0.0 - FEATURE IMPLEMENTATION GUIDE
## How to Use All 6 Built-In Features (Already Complete ✅)

---

## 🚀 FEATURE #1: Smart Location Profiles (5 Categories)

### What It Does
Automatically detects location type and adjusts recommendations accordingly.

**5 Built-In Profiles:**
- 🏕️ `outdoor_adventure` - Hiking, trails, nature
- 🍽️ `dining` - Restaurants, cafes, bars
- 🏛️ `culture` - Museums, galleries, landmarks
- 🎭 `entertainment` - Movies, concerts, sports
- 🛍️ `shopping` - Malls, boutiques, markets
- 👨‍👩‍👧 `family` - Zoos, playgrounds, kid-friendly

### Code Location
**File**: `nearby-attractions-finder.js` (lines 50-82)

```javascript
const LOCATION_PROFILE_SIGNALS = {
  outdoor_adventure: [
    'hiking', 'hike', 'trail', 'nature', 'park', 'scenic', ...
  ],
  dining: [
    'restaurant', 'cafe', 'coffee', 'bar', 'brewery', ...
  ],
  // ... etc
};
```

### How to Use It

```javascript
// Automatically detects profile from location data
const profile = inferLocationProfile({
  name: "Blue Ridge Parkway",
  description: "Scenic hiking trail with waterfalls",
  tags: "nature,outdoor,trail"
});
// Returns: 'outdoor_adventure'

// Use it to customize recommendations
const recommendations = buildSmartItineraryGroups(profile, attractions);
```

### Example Data
```javascript
// User adds location
{
  name: "Waterfall Trail at Asheville",
  latitude: 35.5951,
  longitude: -82.5515,
  description: "Popular hiking trail near Asheville with scenic waterfall",
  type: "park",
  tags: "hiking,nature,waterfall,outdoor"
}

// System detects: 'outdoor_adventure' profile ✅
// Recommendations: "Fuel Up After", "Coffee Break", "Continue Adventure", etc.
```

---

## 🎪 FEATURE #2: Context-Aware Itineraries

### What It Does
Recommends follow-up stops that match the location type. Recommendations change based on activity.

**For Outdoor Adventures, suggests:**
- 🍔 Fuel Up After Your Adventure (restaurants)
- ☕ Coffee or Sweet Treat
- 🏞️ Continue the Adventure (more scenic spots)
- 🛍️ Local Retail & Souvenirs
- 🚗 Scenic Drive or Overlook

**For Dining, suggests:**
- 🍦 After-Dinner Dessert
- 🎭 Evening Activity
- 🛍️ Browse Local Shops

### Code Location
**File**: `nearby-attractions-finder.js` (lines 88-337)

```javascript
const SMART_RECOMMENDATION_PLAN = {
  outdoor_adventure: [
    {
      role: 'Fuel Up After Your Adventure',
      icon: '🍔',
      categoryHint: 'food',
      gTypes: ['restaurant', 'cafe'],
      priority: 1
    },
    // ... more recommendations
  ],
  // ... other profiles
};
```

### How to Use It

```javascript
// Get smart recommendations for a location
const itinerary = buildSmartItineraryGroups(
  'outdoor_adventure',           // profile (auto-detected)
  allAttractionsNearby,          // ranked attractions
  {
    weatherBias: 'outdoor',      // or 'indoor' if rainy
    minRating: 4.0,              // only 4+ rated
    timeBudgetHours: 4           // fit in 4 hours
  }
);

// Result:
[
  {
    role: 'Fuel Up After Your Adventure',
    icon: '🍔',
    suggestions: [
      { name: 'Restaurant ABC', driveTimeMinutes: 5 },
      { name: 'Burger Joint', driveTimeMinutes: 8 }
    ]
  },
  {
    role: 'Coffee or Sweet Treat',
    icon: '☕',
    suggestions: [...]
  }
  // ... more recommendation slots
]
```

### Implementation Example

```javascript
document.addEventListener('DOMContentLoaded', async () => {
  // When user adds a location with coordinates
  const locationData = {
    name: "Waterfall Trail",
    latitude: 35.5951,
    longitude: -82.5515,
    description: "Scenic hiking trail"
  };

  // 1️⃣ Detect profile
  const profile = inferLocationProfile(locationData);
  console.log(`Profile: ${profile}`); // "outdoor_adventure"

  // 2️⃣ Get nearby attractions
  const attractions = await window.nearbyAttractionsFinder
    .getFormattedNearbyAttractions(
      locationData.latitude, 
      locationData.longitude, 
      locationData.name
    );

  // 3️⃣ Generate itinerary
  const itinerary = buildSmartItineraryGroups(profile, attractions);
  console.log(itinerary); // Smart recommendations for this activity type
});
```

---

## 🌤️ FEATURE #3: Weather Integration

### What It Does
Fetches real-time weather and adjusts recommendations. Rainy day? Show indoor activities.

**Weather Conditions Detected:**
- ☀️ Clear → Outdoor bias
- 🌧️ Rain → Indoor bias (strong)
- ❄️ Snow → Indoor bias (strong)
- 🌤️ Cloudy → Neutral

### Code Location
**File**: `nearby-attractions-finder.js` (lines 464-521)

```javascript
async function fetchWeatherCondition(lat, lng) {
  // Calls Open-Meteo API (FREE, no key needed)
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat +
              '&longitude=' + lng + '&current_weather=true';
  const json = await fetch(url).then(r => r.json());
  // Returns: { condition, emoji, bias, tempC }
}

function classifyWeatherCode(code, isDay) {
  // WMO codes → usable conditions
  if (code === 0) return { condition: 'clear', emoji: '☀️', bias: 'outdoor' };
  if (code <= 67) return { condition: 'rain', emoji: '🌧️', bias: 'indoor_strong' };
  // ... etc
}
```

### How to Use It

```javascript
// Get weather at location
const weather = await fetchWeatherCondition(35.5951, -82.5515);
console.log(weather);
// Returns:
// {
//   condition: "rainy",
//   emoji: "🌧️",
//   bias: "indoor_strong",
//   tempC: 12,
//   description: "Rainy"
// }

// Use weather to adjust recommendations
const itinerary = buildSmartItineraryGroups(
  profile,
  attractions,
  {
    weatherBias: weather.bias,  // ← Adjusts recommendations!
    minRating: 4.0
  }
);
```

### Result Example

```javascript
// Without weather bias (sunny day):
[
  { role: 'Continue the Adventure', priority: 3 },        // Scenic outdoor spot
  { role: 'Scenic Drive', priority: 5 }                   // Another outdoor activity
]

// With rainy weather bias:
[
  { role: 'Coffee Break', priority: 1 },                  // Indoor cafe ⬆️ moved up
  { role: 'More Culture Nearby', priority: 2 },           // Indoor museum ⬆️ moved up
  { role: 'Continue the Adventure', priority: 6 },        // Outdoor ⬇️ moved down
  { role: 'Scenic Drive', priority: 8 }                   // Outdoor ⬇️ moved down
]
```

---

## 🔍 FEATURE #4: Hybrid Search (Google + Local DB)

### What It Does
Searches BOTH Google Places API AND your app's local database, then merges results intelligently.

**Dual Sources:**
- 🔵 **Google Places** - Real-time, comprehensive, ratings
- 🟢 **Local Database** - Your app's existing locations

**Merge Strategy:**
- Deduplicates (same location from both sources = merge)
- Preserves Google ratings + your local data
- Combines source sets (show mixed badge)

### Code Location
**File**: `nearby-attractions-finder.js` (lines 684-812)

```javascript
async getNearbyAttractions(lat, lng, centerName, options = {}) {
  // Get from Google Places API (if configured)
  const google = this.config.googlePlacesApiKey
    ? await this.getNearbyAttractionsGoogle(lat, lng, centerName, options)
    : [];
  
  // Get from your app's local database
  const local = this.config.useLocalDatabase
    ? this.getNearbyAttractionsLocal(lat, lng, centerName, options)
    : [];
  
  // Merge intelligently
  const merged = this.mergeAttractions(google, local);
  
  // Rank with blended algorithm (next feature!)
  const ranked = this.applyRanking(merged, options);
  
  return ranked;
}
```

### How to Use It

```javascript
// Step 1: Load your app's locations
const allLocations = [
  {
    id: 'loc-1',
    name: 'Central Park',
    latitude: 40.7829,
    longitude: -73.9654,
    type: 'park',
    description: 'Famous NYC park',
    rating: 4.8
  },
  { /* ... more locations ... */ }
];

window.nearbyAttractionsFinder.setAppLocations(allLocations);

// Step 2: Get nearby attractions (searches both sources)
const attractions = await window.nearbyAttractionsFinder
  .getNearbyAttractions(
    40.7580,           // lat (Times Square)
    -73.9855,          // lng
    'Times Square',
    {
      radiusMiles: 5,
      useLocalDatabase: true,      // ✅ Search your DB
      googlePlacesApiKey: 'YOUR_KEY' // ✅ Also search Google (optional)
    }
  );

console.log(attractions);
// Result: Mix of local + Google results, deduplicated & merged!
```

### Example Result

```javascript
[
  {
    id: 'loc-1',
    name: 'Central Park',
    source: 'local',           // From your database
    exists: true,              // Already in app
    rating: 4.8,
    distance: 1.2,
    description: 'Famous NYC park'
  },
  {
    id: 'ChIJ...',
    name: 'Empire State Building',
    source: 'merged',          // Found in BOTH Google + your DB!
    sourceSet: ['google', 'local'],
    exists: true,
    rating: 4.6,               // Google + local blended
    distance: 0.5
  },
  {
    id: 'ChIJ...',
    name: 'Random Cafe',
    source: 'google',          // Only on Google, not in app yet
    exists: false,
    rating: 4.3,
    distance: 0.8,
    description: 'Nice coffee shop'
  }
]
```

---

## 🎯 FEATURE #5: Smart Ranking (5-Factor Algorithm)

### What It Does
Ranks attractions using 5 weighted factors:

1. **Distance** (25.5%) - Closer is better
2. **Rating** (5.9%) - Higher rated preferred
3. **Local Source** (21.6%) - Your app's locations weighted higher
4. **Google Source** (10.8%) - Google results trusted
5. **Exists in App** (36.3%) - Already-added locations score highest

### Code Location
**File**: `nearby-attractions-finder.js` (lines 814-854)

```javascript
const sourceWeights = {
  local: 0.216,           // Your locations: 21.6%
  google: 0.108,          // Google results: 10.8%
  existsInApp: 0.363,     // Already in app: 36.3%
  distance: 0.255,        // Proximity: 25.5%
  rating: 0.059           // Reviews: 5.9%
};

applyRanking(attractions, options = {}) {
  return attractions.map((item) => {
    const distanceScore = 1 - (distance / radius);        // 0-1
    const ratingScore = rating / 5;                        // 0-1
    const blendedScore = 
      (distanceScore * weights.distance) +
      (ratingScore * weights.rating) +
      (isLocal ? weights.local : 0) +
      (isGoogle ? weights.google : 0) +
      (existsInApp ? weights.existsInApp : 0);
    
    return { ...item, blendedScore };
  });
}
```

### How It Works

```javascript
// Example: 3 attractions near Times Square
[
  {
    name: 'Central Park',
    distance: 1.2,
    rating: 4.8,
    source: 'local',        // Your database
    exists: true            // Is in app
    // Score calculation:
    // distance: 1 - (1.2/5) = 0.76  × 0.255 = 0.194
    // rating: 4.8/5 = 0.96 × 0.059 = 0.057
    // local: ✓ × 0.216 = 0.216
    // existsInApp: ✓ × 0.363 = 0.363
    // TOTAL: 0.830 (🥇 RANK #1)
  },
  {
    name: 'Random Cafe',
    distance: 0.8,          // Closer!
    rating: 4.2,
    source: 'google',       // Only on Google
    exists: false           // Not in app
    // Score calculation:
    // distance: 1 - (0.8/5) = 0.84 × 0.255 = 0.214
    // rating: 4.2/5 = 0.84 × 0.059 = 0.050
    // google: ✓ × 0.108 = 0.108
    // existsInApp: ✗ × 0 = 0
    // TOTAL: 0.372 (🥉 RANK #3)
  },
  {
    name: 'Gem Museum',
    distance: 2.1,
    rating: 4.5,
    source: 'merged',       // Found in both!
    exists: true
    // Score: 0.645 (🥈 RANK #2)
  }
]

// Sorted by blendedScore: Central Park → Gem Museum → Random Cafe ✅
```

### Customize the Weights

```javascript
// Create custom ranker if you want different priorities
const customFinder = new NearbyAttractionsFinder({
  sourceWeights: {
    distance: 0.4,        // Prioritize proximity (40%)
    rating: 0.3,          // Then quality (30%)
    existsInApp: 0.2,     // Then existing (20%)
    local: 0.05,          // Then local source (5%)
    google: 0.05          // Then Google source (5%)
  }
});
```

---

## 📍 FEATURE #6: Day Planning (Multi-Stop Route Generation)

### What It Does
Builds a day itinerary and generates Google Maps multi-stop route URL.

**Features:**
- Add stops to a "day plan"
- Store stops persistently (localStorage)
- Generate shareable Google Maps link
- Show cumulative drive times

### Code Location
**File**: `nearby-attractions-finder.js` (lines 1041-1120)

```javascript
window.dayPlanHelpers = {
  load: loadDayPlan,           // Get current stops
  save: saveDayPlan,           // Save stops
  addStop: addStopToDayPlan,   // Add attraction
  removeStop: removeStopFromDayPlan,
  clear: clearDayPlan,
  buildRouteUrl: buildDayPlanRouteUrl  // ← Google Maps URL
};
```

### How to Use It

```javascript
// Step 1: Add stops to day plan
const stop1 = {
  id: 'waterfall-trail',
  name: 'Waterfall Trail',
  latitude: 35.5951,
  longitude: -82.5515,
  distanceText: '2.3 mi',
  driveTimeText: '8 min'
};

window.dayPlanHelpers.addStop(stop1);
window.dayPlanHelpers.addStop(stop2);
window.dayPlanHelpers.addStop(stop3);

// Step 2: Load current plan
const dayPlan = window.dayPlanHelpers.load();
console.log(dayPlan);
// [
//   { id: 'waterfall-trail', name: 'Waterfall Trail', ... },
//   { id: 'cafe-abc', name: 'Mountain Cafe', ... },
//   { id: 'overlook', name: 'Scenic Overlook', ... }
// ]

// Step 3: Generate Google Maps route
const routeUrl = window.dayPlanHelpers.buildRouteUrl();
console.log(routeUrl);
// https://www.google.com/maps/dir/35.5951,-82.5515/35.6123,-82.4891/35.6234,-82.5012

// Step 4: Share or open route
window.open(routeUrl); // Opens in Google Maps!

// Step 5: Clear when done
window.dayPlanHelpers.clear();
```

### Example Day Plan Flow

```javascript
// User's day plan for hiking adventure:

// 9:00 AM - Start
waypoint[0]: "35.5951, -82.5515" → Waterfall Trail (START)

// 10:00 AM - Fuel up (8 min drive)
waypoint[1]: "35.6123, -82.4891" → Mountain Cafe (12 min stop)

// 12:00 PM - Scenic overlook (15 min drive)
waypoint[2]: "35.6234, -82.5012" → Scenic Overlook (20 min stop)

// 1:30 PM - Dinner (25 min drive)
waypoint[3]: "35.5823, -82.4734" → Restaurant (60 min stop)

// Generated Google Maps URL:
https://www.google.com/maps/dir/
  35.5951,-82.5515/
  35.6123,-82.4891/
  35.6234,-82.5012/
  35.5823,-82.4734

// Total distance: ~35 miles
// Total drive time: ~50 minutes
// Total stop time: ~92 minutes
// Full day: ~2.5 hours
```

### Persistent Storage

```javascript
// Day plan automatically saves to localStorage
// Survives page refresh!

// On page load, auto-restore
const savedPlan = window.dayPlanHelpers.load();
// Your stops are still there ✅

// Clear only when user explicitly clears
window.dayPlanHelpers.clear();
// Removes from localStorage
```

---

## 🔌 INTEGRATION EXAMPLE: Full Workflow

Here's how all 6 features work together:

```javascript
document.addEventListener('DOMContentLoaded', async () => {
  // ✅ SETUP: Load your locations
  const allLocations = await getAllLocationsFromDatabase();
  window.nearbyAttractionsFinder.setAppLocations(allLocations);

  // When user adds a location:
  document.getElementById('addLocationForm').addEventListener('submit', async (e) => {
    const formData = {
      name: e.target.name.value,
      latitude: parseFloat(e.target.latitude.value),
      longitude: parseFloat(e.target.longitude.value),
      description: e.target.description.value,
      type: e.target.type.value
    };

    // ✅ FEATURE #1: Detect profile
    const profile = inferLocationProfile(formData);
    console.log(`📍 Profile: ${profile}`);

    // ✅ FEATURE #3: Get weather
    const weather = await fetchWeatherCondition(
      formData.latitude, 
      formData.longitude
    );
    console.log(`🌤️ Weather: ${weather.emoji} ${weather.condition}`);

    // ✅ FEATURE #4: Hybrid search (Google + Local)
    const attractions = await window.nearbyAttractionsFinder
      .getNearbyAttractions(
        formData.latitude,
        formData.longitude,
        formData.name,
        { radiusMiles: 5 }
      );
    // Returns: merged & deduplicated results

    // ✅ FEATURE #5: Smart ranking
    // (Already done in getNearbyAttractions, returns sorted by blendedScore)
    console.log(`Found ${attractions.length} nearby attractions (sorted by relevance)`);

    // ✅ FEATURE #2: Context-aware itineraries
    const itinerary = buildSmartItineraryGroups(
      profile,
      attractions,
      { 
        weatherBias: weather.bias,
        timeBudgetHours: 4
      }
    );
    console.log(`📋 Suggested itinerary for your ${profile} activity:`);
    itinerary.forEach(slot => {
      console.log(`  ${slot.icon} ${slot.role}`);
      slot.suggestions.forEach(s => {
        console.log(`    → ${s.name} (${s.driveTimeText})`);
        
        // ✅ FEATURE #6: Add to day plan
        window.dayPlanHelpers.addStop(s);
      });
    });

    // Show generated route
    const routeUrl = window.dayPlanHelpers.buildRouteUrl();
    console.log(`📍 View on Google Maps: ${routeUrl}`);
  });
});
```

### Output Example (Outdoor Adventure, Rainy Day)

```
📍 Profile: outdoor_adventure
🌤️ Weather: 🌧️ rainy (indoor bias)
Found 47 nearby attractions (sorted by relevance)
📋 Suggested itinerary for your outdoor_adventure activity:

☕ Coffee or Sweet Treat (prioritized due to rain)
  → Mountain Café (5 min)
  → Bakery & Brew (8 min)
  → Coffee House (12 min)

🏛️ More Culture Nearby (indoor alternative)
  → Mountain Museum (3 min)
  → Local History Center (7 min)
  → Art Gallery (10 min)

🍔 Fuel Up After Your Adventure (when weather clears)
  → Restaurant A (8 min)
  → Grill House (12 min)

📍 View on Google Maps: https://maps.google.com/maps/dir/...
```

---

## 📊 Configuration & Customization

### Full Configuration Object

```javascript
const config = {
  // Search
  searchRadius: 5,                     // miles
  radiusPresets: [2, 5, 10, 25],      // quick buttons
  maxAttractions: 20,                 // results limit

  // APIs
  googlePlacesApiKey: null,           // optional
  useLocalDatabase: true,             // use your DB

  // Caching
  cacheDurationMs: 1000 * 60 * 60,   // 1 hour
  backgroundEnrichmentTtlMs: 1000 * 60 * 60 * 24,  // 1 day

  // Ranking (weights must sum to ~1.0)
  sourceWeights: {
    local: 0.216,       // Your locations
    google: 0.108,      // Google results
    existsInApp: 0.363, // Already added
    distance: 0.255,    // Proximity
    rating: 0.059       // Quality
  },

  // Deduplication
  dedupeDistanceThresholdMiles: 0.18  // ~300 feet

  // Categories
  categoryMap: {
    all: ['*'],
    food: ['restaurant', 'cafe', 'bar', ...],
    nature: ['park', 'trail', 'natural_feature', ...],
    // ... more
  }
};

const finder = new NearbyAttractionsFinder(config);
```

---

## 🧪 Testing & Validation

### Test Each Feature

```javascript
// Test Feature #1: Profiles
console.assert(inferLocationProfile({name: 'Central Park'}) === 'outdoor_adventure');

// Test Feature #2: Itineraries
const itinerary = buildSmartItineraryGroups('dining', []);
console.assert(itinerary.length > 0, 'Itinerary should have slots');

// Test Feature #3: Weather
const weather = await fetchWeatherCondition(40.7128, -74.0060);
console.assert(weather.condition, 'Weather should have condition');

// Test Feature #4 & #5: Search & Ranking
const attrs = await window.nearbyAttractionsFinder
  .getFormattedNearbyAttractions(40.7128, -74.0060, 'NYC');
console.assert(attrs.length > 0, 'Should find attractions');
console.assert(attrs[0].blendedScore >= attrs[1].blendedScore, 'Should be sorted');

// Test Feature #6: Day Planning
window.dayPlanHelpers.addStop({name: 'Stop 1', latitude: 40, longitude: -74});
const plan = window.dayPlanHelpers.load();
console.assert(plan.length === 1, 'Should have 1 stop');
```

---

## ✅ Summary: All 6 Features Ready to Use

| # | Feature | Status | Location | How to Use |
|---|---------|--------|----------|-----------|
| 1 | Smart Profiles | ✅ Built | Lines 50-82 | `inferLocationProfile()` |
| 2 | Context Itineraries | ✅ Built | Lines 88-337 | `buildSmartItineraryGroups()` |
| 3 | Weather Integration | ✅ Built | Lines 464-521 | `fetchWeatherCondition()` |
| 4 | Hybrid Search | ✅ Built | Lines 684-812 | `.getNearbyAttractions()` |
| 5 | Smart Ranking | ✅ Built | Lines 814-854 | `.applyRanking()` |
| 6 | Day Planning | ✅ Built | Lines 1041-1120 | `window.dayPlanHelpers.*` |

**All features are production-ready and documented!** 🚀


