# Places API Health Check Integration

## Overview
The Places API health check functionality from `places-health-check-live.js` has been successfully wired into the central Diagnostics Hub system.

## Changes Made

### 1. **Enhanced Diagnostics Hub System** (`JS Files/diagnostics-hub-system.js`)

#### New Section Added
- Added `'places'` to `SECTION_KEYS` array for tab navigation
- New tab label: "Places API health"

#### New Functions
- **`getPlacesHealthSnapshot()`**: Asynchronously collects Places API health data by calling `window.runPlacesHealthCheck()` when available
  - Handles both success and error cases gracefully
  - Returns structured health data with status, steps, and details
  
- **`renderPlacesHealthSection(snapshot)`**: Renders the Places API health diagnostics view
  - Displays overall health status with color coding (green = healthy, orange/red = issues)
  - Shows individual test steps with pass/fail indicators
  - Includes helpful suggestions for troubleshooting
  - Provides information about API configuration

#### Updated Functions
- **`collectSnapshot()`**: Now includes `placesHealth` in the snapshot object
  - Calls `getPlacesHealthSnapshot()` asynchronously
  - Includes Places health data alongside other diagnostics
  
- **`renderHub()`**: Updated to handle the new 'places' section
  - Routes to `renderPlacesHealthSection()` when 'places' tab is active
  
- **`renderNav()`**: Added label for "Places API health" tab

## How It Works

### Browser Integration
When a user navigates to the Diagnostics Hub and selects the "Places API health" tab:

1. The hub calls `refreshDiagnosticsHub()`
2. This triggers `collectSnapshot()` which now includes Places health data
3. If `window.runPlacesHealthCheck()` is available, it's called with default parameters
4. The results are structured and included in the snapshot
5. The UI renders the Places health status with:
   - Overall health status indicator
   - Individual health check steps
   - Test details (query and place ID used)
   - Troubleshooting suggestions

### Fallback Behavior
If the Places API health check function is not available or fails:
- The section displays "Not tested" status
- Users can still navigate to other diagnostics
- No errors are thrown; diagnostics hub remains functional

## Status Indicators

### Health Status Colors
- **✓ Healthy** (Green #047857): All checks passed
- **? Not tested** (Gray #64748b): Health check hasn't been run
- **⚠ Issues detected** (Orange #b45309): One or more checks failed

## Related Files

### Main Integration Point
- `JS Files/diagnostics-hub-system.js` - Updated with Places health support

### Related Scripts
- `scripts/places-health-check-live.js` - Node.js test harness (reference implementation)
- `index.html` - Loads the diagnostics hub system
- `JS Files/diagnostics-reporting-utils.js` - Companion diagnostics utilities

## Usage

### From Browser Console
```javascript
// Open diagnostics hub to Places API health tab
window.openDiagnosticsHubPage({ section: 'places' });

// Get the current snapshot (includes placesHealth)
const snapshot = window.getDiagnosticsHubSnapshot();
console.log(snapshot.placesHealth);
```

### From UI
1. Navigate to the Diagnostics Hub (central tab)
2. Click the "Places API health" tab
3. View the current health status

## Testing

The Places API health check validates:
1. **API Key Availability**: Configuration of Google Places API key
2. **Library Loading**: Successful loading of Google Maps library
3. **Search Functionality**: Ability to search for places
4. **Details Retrieval**: Ability to fetch place details
5. **Overall Connectivity**: Network connectivity to Google services

## Future Enhancements

Possible additions:
- Auto-refresh interval for continuous monitoring
- Historical trend data for API reliability
- Integration with alerting system for critical issues
- Export health history for debugging

## Troubleshooting

If Places API health shows issues:

1. **Check API Key**: Verify `window.GOOGLE_PLACES_API_KEY` is set
2. **Enable APIs**: Ensure Places API and Maps JavaScript API are enabled in Google Cloud Console
3. **Network**: Verify internet connectivity
4. **Permissions**: Check that API key has proper quota and quotas haven't been exceeded
5. **Browser Console**: Look for detailed error messages about Places API calls

## Technical Details

### API Contract
The health check expects `window.runPlacesHealthCheck()` to be available with signature:
```javascript
window.runPlacesHealthCheck({ 
  query: string,     // Optional search query
  placeId: string    // Optional place ID to test
}) -> Promise<HealthCheckResult>
```

### Result Object Structure
```javascript
{
  available: boolean,    // Whether check ran
  status: string,        // 'pass', 'fail', 'error', 'unknown'
  ok: boolean,           // Overall status
  summary: string,       // Human-readable summary
  query: string,         // Query used in test
  placeIdUsed: string,   // Place ID used in test
  steps: Array<{
    key: string,         // Step identifier
    status: string,      // 'pass', 'fail'
    detail: string,      // Human-readable detail
    advice: string       // Optional suggestion
  }>
}
```

## Version History

- **v1.0.0** (April 28, 2026): Initial integration of Places API health check into diagnostics hub

