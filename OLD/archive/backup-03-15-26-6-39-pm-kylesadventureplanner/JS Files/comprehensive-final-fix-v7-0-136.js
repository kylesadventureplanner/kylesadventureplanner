/**
 * COMPREHENSIVE FINAL FIX - v7.0.136
 * ==================================
 * Fixes:
 * 1. City Viewer modal/popup → opens in new tab properly
 * 2. Duplicate prevention in add location features
 * 3. Dry run toggle working (bulletproof approach)
 *
 * Date: March 15, 2026
 */

console.log('🚀 Comprehensive Final Fix v7.0.136 Loading...');

// ============================================================
// 1. FIX CITY VIEWER - ENSURE IT OPENS IN NEW TAB
// ============================================================

/**
 * Open City Viewer in SEPARATE TAB (not modal)
 */
window.openCityViewerInTab = function() {
  console.log('🌆 Opening City Viewer in separate tab...');
  try {
    const url = 'HTML Files/city-viewer-window.html';
    const newTab = window.open(url, '_blank');

    if (!newTab) {
      console.warn('⚠️ Pop-up blocked');
      alert('Please enable pop-ups/tabs to open City Viewer');
      return;
    }

    newTab.focus();
    console.log('✅ City Viewer opened in new tab');
  } catch (error) {
    console.error('❌ Error:', error);
    alert('Error opening City Viewer: ' + error.message);
  }
};

// Override the existing function
window.openCityViewerWindow = window.openCityViewerInTab;

// ============================================================
// 2. DUPLICATE PREVENTION FOR ADD LOCATION FEATURES
// ============================================================

/**
 * Check if location already exists in adventure data
 */
window.locationExists = function(locationName, city, state) {
  if (!window.adventuresData || !window.opener?.adventuresData) {
    console.log('⏭️ No data to check duplicates');
    return false;
  }

  const data = window.adventuresData || window.opener.adventuresData;
  const searchName = (locationName || '').toLowerCase().trim();
  const searchCity = (city || '').toLowerCase().trim();
  const searchState = (state || '').toLowerCase().trim();

  for (let adventure of data) {
    const existingName = (adventure.name || (adventure.values && adventure.values[0][0]) || '').toLowerCase().trim();
    const existingCity = (adventure.city || (adventure.values && adventure.values[0][10]) || '').toLowerCase().trim();
    const existingState = (adventure.state || (adventure.values && adventure.values[0][9]) || '').toLowerCase().trim();

    if (existingName === searchName && existingCity === searchCity && existingState === searchState) {
      console.log(`⚠️ Duplicate found: ${locationName}, ${city}, ${state}`);
      return true;
    }
  }

  return false;
};

/**
 * Check for duplicates in a batch
 */
window.checkDuplicatesInBatch = function(locations) {
  const duplicates = [];
  const unique = [];

  locations.forEach((loc, index) => {
    if (window.locationExists(loc.name, loc.city, loc.state)) {
      duplicates.push({
        index: index + 1,
        name: loc.name,
        city: loc.city,
        state: loc.state
      });
    } else {
      unique.push(loc);
    }
  });

  return { duplicates, unique };
};

/**
 * Show duplicate alert
 */
window.showDuplicateAlert = function(duplicates) {
  if (!duplicates || duplicates.length === 0) return;

  let message = `⚠️ ${duplicates.length} duplicate location(s) were skipped:\n\n`;
  duplicates.forEach(dup => {
    message += `❌ ${dup.name}, ${dup.city}, ${dup.state}\n`;
  });

  console.warn(message);
  alert(message);
};

// ============================================================
// 3. FIX DRY RUN TOGGLE - BULLETPROOF
// ============================================================

/**
 * Initialize dry run toggles AGGRESSIVELY
 */
window.initDryRunToggles = function() {
  console.log('🧪 Initializing dry run toggles (Final Fix)...');

  const toggleIds = {
    'singleDryRun': 'single',
    'bulkDryRun': 'bulk',
    'chainDryRun': 'chain',
    'missingDryRun': 'missing',
    'hoursDryRun': 'hours',
    'refreshDryRun': 'refresh',
    'autoTagDryRun': 'autotag'
  };

  Object.keys(toggleIds).forEach(checkboxId => {
    const checkbox = document.getElementById(checkboxId);
    if (!checkbox) {
      console.warn(`❌ Not found: ${checkboxId}`);
      return;
    }

    console.log(`✅ Found: ${checkboxId}`);

    // Clear old handlers
    checkbox.onclick = null;
    checkbox.onchange = null;

    // DIRECT ONCLICK - Most reliable
    checkbox.onclick = function(e) {
      console.log(`🖱️ ONCLICK: ${checkboxId} = ${this.checked}`);
      updateDryRunDisplay(checkboxId, this.checked);
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // CHANGE EVENT
    checkbox.addEventListener('change', function(e) {
      console.log(`🔄 CHANGE: ${checkboxId} = ${this.checked}`);
      updateDryRunDisplay(checkboxId, this.checked);
    }, true);

    // CLICK EVENT
    checkbox.addEventListener('click', function(e) {
      console.log(`🖱️ CLICK: ${checkboxId} = ${this.checked}`);
      updateDryRunDisplay(checkboxId, this.checked);
    }, true);
  });

  console.log('✅ Dry run toggles initialized');
};

/**
 * Update dry run display
 */
window.updateDryRunDisplay = function(checkboxId, isChecked) {
  console.log(`📋 Updating display for ${checkboxId}`);

  const checkbox = document.getElementById(checkboxId);
  if (!checkbox) return;

  // Get base name
  const baseName = checkboxId.replace('DryRun', '');

  // Update toggle appearance
  const toggleDiv = document.getElementById(baseName + 'DryRunToggle');
  if (toggleDiv) {
    if (isChecked) {
      toggleDiv.classList.add('enabled');
      console.log(`✅ Added enabled to ${baseName}DryRunToggle`);
    } else {
      toggleDiv.classList.remove('enabled');
      console.log(`✅ Removed enabled from ${baseName}DryRunToggle`);
    }
  }

  // Update status
  const statusDiv = document.getElementById(baseName + 'DryRunStatus');
  if (statusDiv) {
    if (isChecked) {
      statusDiv.textContent = '✅ ENABLED';
      statusDiv.classList.remove('off');
      statusDiv.classList.add('on');
    } else {
      statusDiv.textContent = '❌ DISABLED';
      statusDiv.classList.remove('on');
      statusDiv.classList.add('off');
    }
  }

  console.log(`✅ Updated ${baseName} display`);
};

// Initialize immediately
console.log('Initializing toggles now...');
window.initDryRunToggles();

// Re-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Re-initializing after DOM ready...');
    window.initDryRunToggles();
  });
}

// Re-initialize after delays
setTimeout(() => {
  console.log('Re-initializing after 500ms...');
  window.initDryRunToggles();
}, 500);

setTimeout(() => {
  console.log('Re-initializing after 1000ms...');
  window.initDryRunToggles();
}, 1000);

console.log('✅ Comprehensive Final Fix v7.0.136 Ready');
console.log('  - City Viewer fixed to open in tab');
console.log('  - Duplicate prevention added');
console.log('  - Dry run toggles bulletproof');

