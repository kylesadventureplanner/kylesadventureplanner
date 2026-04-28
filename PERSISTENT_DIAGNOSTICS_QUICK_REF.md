# Persistent Diagnostics Status Line Guide

## Overview

A persistent status line has been added to track three key metrics:
- **Live Provider Unavailability** - Count of provider failures
- **Cached Row Fallback Count** - Count of cache usage events  
- **Last Affected Operation** - Most recent fallback operation with timestamp

## Quick Start

### Report Provider Unavailability
```javascript
DiagnosticsReport.providerUnavailable(
  'provider-name',
  'failure reason',
  { additionalContext: 'value' }
);
```

### Report Cached Row Fallback
```javascript
DiagnosticsReport.cachedRowFallback(
  'operation-name',
  rowCount,
  { source: 'cache-type', cacheAge: '5m' }
);
```

### Get Metrics
```javascript
DiagnosticsReport.getMetrics();     // Current snapshot
DiagnosticsReport.getHistory();     // Full history
DiagnosticsReport.export();         // JSON export
DiagnosticsReport.reset();          // Clear all metrics
```

## Location

Visible in **Diagnostics Hub > Overview** tab as a prominent 3-column card showing all metrics with:
- Color coding (orange for warnings, green for healthy)
- Relative timestamps
- Context details

## Files Created/Modified

- Created: `persistent-diagnostics-tracker.js` - Core system
- Created: `diagnostics-reporting-utils.js` - Helper API
- Modified: `index.html` - Added script includes
- Modified: `diagnostics-hub-system.js` - Added metrics card rendering

## Event Listener

```javascript
document.addEventListener('diagnostics-metrics-updated', (event) => {
  console.log('New metrics:', event.detail);
});
```

## Data Storage

- In-memory storage (max 100 events per type)
- Exported as JSON via console
- Resets on page reload

## Integration Points

Use in any code that handles:
- API failures and timeouts
- Cache fallbacks
- Sync conflicts
- Rate limiting or auth failures

See PERSISTENT_DIAGNOSTICS_GUIDE_FULL.md for detailed usage examples.

