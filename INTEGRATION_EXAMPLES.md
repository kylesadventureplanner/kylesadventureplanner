## PERSISTENT DIAGNOSTICS - INTEGRATION EXAMPLES

Examples of where and how to use DiagnosticsReport in your application.

### 1. Places API Failures

**Location:** City Viewer, Adventure Details, Location Search

```javascript
// When Places API call fails
async function getPlaceDetails(placeId) {
  try {
    const response = await fetch(`/api/places/${placeId}`);
    if (!response.ok) {
      DiagnosticsReport.providerUnavailable(
        'places-api',
        `HTTP ${response.status}: ${response.statusText}`,
        { placeId, endpoint: `/api/places/${placeId}` }
      );
      
      // Fall back to cached details if available
      const cached = await getCachedPlaceDetails(placeId);
      if (cached) {
        DiagnosticsReport.cachedRowFallback(
          'get-place-details',
          1,
          { source: 'localStorage', cacheAge: getCacheAge(placeId) }
        );
        return cached;
      }
    }
    return await response.json();
  } catch (error) {
    DiagnosticsReport.providerUnavailable(
      'places-api',
      error.message,
      { placeId, errorType: error.name }
    );
    throw error;
  }
}
```

### 2. Excel Sync Failures

**Location:** Visited Locations, Adventures, Persistence Sync

```javascript
// When Excel sync becomes unavailable
async function persistAdventureChallenge(updates) {
  try {
    const response = await syncToExcel(updates);
    return response;
  } catch (error) {
    // Report provider unavailable
    DiagnosticsReport.providerUnavailable(
      'adventure-excel-sync',
      error.message,
      { 
        workbookPath: visitedSyncConfig.persistenceWorkbookPath,
        recordCount: updates.length,
        errorCode: error.code 
      }
    );
    
    // Fall back to local storage
    const cached = JSON.parse(
      localStorage.getItem('visitedLocationsTrackerV1') || '{}'
    );
    
    DiagnosticsReport.cachedRowFallback(
      'persist-adventure-challenge',
      updates.length,
      { 
        source: 'localStorage',
        reason: 'Excel sync failed',
        pendingUpdates: updates.length 
      }
    );
    
    // Store locally for later retry
    Object.assign(cached, updates);
    localStorage.setItem('visitedLocationsTrackerV1', JSON.stringify(cached));
  }
}
```

### 3. Nature Sync Issues

**Location:** Birds Tab, Sighting Logs, Queue Management

```javascript
// When bird sync queue gets backed up
function manageBirdSyncQueue(queueItem) {
  const queue = JSON.parse(
    localStorage.getItem('natureChallengeBirdSyncQueueV1') || '[]'
  );
  
  if (queue.length > 500) {
    DiagnosticsReport.providerUnavailable(
      'nature-excel-sync',
      'Sync queue exceeded threshold',
      { 
        queueSize: queue.length,
        threshold: 500,
        pendingMs: calculateQueueBacklog(queue)
      }
    );
    
    // Serve data from local queue instead
    DiagnosticsReport.cachedRowFallback(
      'queue-bird-sighting',
      queue.length,
      { 
        source: 'sync-queue',
        reason: 'Queue backup',
        queueItems: queue.length 
      }
    );
  }
  
  queue.push(queueItem);
  localStorage.setItem('natureChallengeBirdSyncQueueV1', JSON.stringify(queue));
}
```

### 4. Offline Mode Detection

**Location:** Offline PWA, Connectivity Handler

```javascript
// When offline mode is triggered
function handleOfflineMode(reason) {
  DiagnosticsReport.providerUnavailable(
    'network-connectivity',
    reason,
    { 
      isOnline: navigator.onLine,
      timestamp: new Date().toISOString(),
      reason: reason 
    }
  );
  
  // Report all rows being served from offline storage
  const offlineQueue = window.OfflinePwa?.getQueueItems?.() || [];
  DiagnosticsReport.cachedRowFallback(
    'offline-mode-activated',
    offlineQueue.length,
    { 
      source: 'offline-queue',
      reason: reason,
      queueItems: offlineQueue.length 
    }
  );
}
```

### 5. Google Maps API Issues

**Location:** Map Display, Directions, Nearby Search

```javascript
// When Maps API fails to load
async function loadNearbyRecommendations(location) {
  try {
    const nearby = await google.maps.places.PlacesService(map)
      .nearbySearch(request);
    return nearby;
  } catch (error) {
    DiagnosticsReport.providerUnavailable(
      'google-maps-places',
      error.message,
      { 
        location: `${location.lat},${location.lng}`,
        errorType: error.name,
        code: error.code 
      }
    );
    
    // Fall back to cached nearby results
    const cached = await getCachedNearby(location);
    if (cached.length > 0) {
      DiagnosticsReport.cachedRowFallback(
        'load-nearby-recommendations',
        cached.length,
        { 
          source: '__nearby_attractions_cache_v2',
          cacheAge: getCacheTimestamp(location),
          fallbackReason: 'Maps API failure' 
        }
      );
    }
    return cached;
  }
}
```

### 6. Authentication Failures

**Location:** Device Auth, Microsoft Login, Token Refresh

```javascript
// When token refresh or auth fails
async function ensureValidToken() {
  try {
    const token = await acquireTokenSilent(tokenRequest);
    return token;
  } catch (error) {
    DiagnosticsReport.providerUnavailable(
      'microsoft-auth',
      error.errorCode || error.message,
      { 
        errorCode: error.errorCode,
        errorMessage: error.errorMessage,
        correlationId: error.correlationId 
      }
    );
    
    // Set app to local-only mode
    localStorage.removeItem('accessToken');
    return null;
  }
}
```

### 7. City Viewer Fallback

**Location:** City Explorer Tab

```javascript
// When city data provider fails
async function refreshCityViewerData(cityId) {
  try {
    const liveData = await fetchCityDetails(cityId);
    return liveData;
  } catch (error) {
    DiagnosticsReport.providerUnavailable(
      'city-viewer-api',
      error.message,
      { cityId, endpoint: `/api/cities/${cityId}` }
    );
    
    // Load from local drafts and cache
    const cached = getCityViewerEditCache(cityId);
    const edits = JSON.parse(
      localStorage.getItem(`cityViewer:edits:${cityId}`) || '{}'
    );
    
    DiagnosticsReport.cachedRowFallback(
      'load-city-viewer-data',
      Object.keys(edits).length || 1,
      { 
        source: 'localStorage',
        includedEdits: Object.keys(edits).length,
        cached: !!cached 
      }
    );
    
    return { ...cached, ...edits };
  }
}
```

### 8. Monitoring Integration

**Location:** App Startup, Periodic Health Checks

```javascript
// On app initialization
function setupDiagnosticsMonitoring() {
  // Listen for metric changes
  document.addEventListener('diagnostics-metrics-updated', (event) => {
    const { 
      liveProviderUnavailableCount,
      cachedRowFallbackCount,
      lastAffectedOperation 
    } = event.detail;
    
    // Log unusual patterns
    if (cachedRowFallbackCount > 5) {
      console.warn('⚠️ High fallback rate detected:', cachedRowFallbackCount);
    }
    
    if (liveProviderUnavailableCount > 10) {
      console.error('❌ Multiple providers unavailable:', liveProviderUnavailableCount);
    }
  });
  
  // Periodic health check
  setInterval(() => {
    const metrics = DiagnosticsReport.getMetrics();
    if (metrics.cachedRowFallbackCount > 0) {
      console.log('Current fallback count:', metrics.cachedRowFallbackCount);
    }
  }, 60000);
}
```

### 9. Error Recovery Tracking

**Location:** Button Actions, Form Submissions

```javascript
// When action encounters provider unavailability
async function bulkApplyTags(selectedIds, tags) {
  try {
    return await applyTagsToRows(selectedIds, tags);
  } catch (error) {
    if (error.code === 'SYNC_UNAVAILABLE') {
      DiagnosticsReport.providerUnavailable(
        'bulk-tag-sync',
        'Persistence provider unavailable',
        { 
          rowCount: selectedIds.length,
          tagCount: tags.length 
      });
      
      // Queue locally and use cached state for UI
      const cache = getCachedTagState(selectedIds);
      DiagnosticsReport.cachedRowFallback(
        'bulk-apply-tags',
        selectedIds.length,
        { 
          source: 'cache',
          reason: 'Sync unavailable',
          rows: selectedIds.length 
        }
      );
      
      return cache;
    }
    throw error;
  }
}
```

### 10. Debug Export

**Location:** Support/Debugging Feature

```javascript
// Add button to export diagnostics
function exportDiagnosticsBundle() {
  const bundle = {
    timestamp: new Date().toISOString(),
    browser: navigator.userAgent,
    persistence: DiagnosticsReport.export(),
    metrics: DiagnosticsReport.getMetrics(),
    history: DiagnosticsReport.getHistory(),
    // Add other relevant diagnostics...
  };
  
  // Download as JSON file
  const blob = new Blob([JSON.stringify(bundle, null, 2)], 
    { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `diagnostics-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
```

### 11. Network Status Monitoring

**Location:** Connection Handler, Sync Manager

```javascript
// Monitor network changes
window.addEventListener('online', () => {
  console.log('📡 Connection restored');
  DiagnosticsReport.reset();  // Start fresh tracking
  retryAllPendingSync();
});

window.addEventListener('offline', () => {
  console.log('📴 No connection');
  DiagnosticsReport.providerUnavailable(
    'network',
    'Device offline',
    { isOnline: false }
  );
});

// In sync attempt
async function attemptSync() {
  if (!navigator.onLine) {
    DiagnosticsReport.providerUnavailable(
      'sync-attempt',
      'No network connection',
      { isOnline: false }
    );
    return false;
  }
  // Continue with sync...
}
```

---

## Quick Integration Checklist

- [ ] Identify all provider/API calls in your code
- [ ] Add try-catch blocks to catch failures
- [ ] Call `DiagnosticsReport.providerUnavailable()` on failure
- [ ] Implement fallback to cached/local data
- [ ] Call `DiagnosticsReport.cachedRowFallback()` when using cache
- [ ] Test by checking Diagnostics Hub > Overview
- [ ] Verify metrics increment as expected
- [ ] Test console commands for metrics export
- [ ] Document any provider fallback patterns unique to your system

Use these examples as templates for your specific use cases!

