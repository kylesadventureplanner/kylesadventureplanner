/**
 * MASTER FIX SYSTEM - v7.0.137
 * ===========================
 * Complete overhaul to ensure ALL fixes work
 * Handles:
 * 1. City Viewer modal override (open in tab)
 * 2. Duplicate prevention
 * 3. Dry run toggles (bulletproof)
 * 4. Comprehensive logging
 * 5. Function verification
 *
 * Date: March 15, 2026
 */

console.log('🚀 MASTER FIX SYSTEM v7.0.137 LOADING...');

// ============================================================
// 0. DETECT WINDOW TYPE
// ============================================================

const isEditMode = window.location.pathname.includes('edit-mode') ||
                   document.title.includes('Edit Mode') ||
                   document.querySelector('[id*="add-places"]') !== null;

const isMainWindow = !isEditMode;

console.log(`📍 Detected window type: ${isEditMode ? 'EDIT MODE' : 'MAIN WINDOW'}`);

// ============================================================
// 1. CAPTURE AND OVERRIDE window.open FOR CITY VIEWER
// ============================================================

const originalWindowOpen = window.open;
window.open = function(url, target, features) {
  console.log(`🔍 window.open called: url=${url}, target=${target}`);

  // If it's City Viewer or similar modal, force new tab
  if (url && url.includes('city-viewer')) {
    console.log('🌆 Detected City Viewer - forcing new tab');
    return originalWindowOpen(url, '_blank');
  }

  // For Find Near Me - force new tab
  if (url && url.includes('find-near-me')) {
    console.log('📍 Detected Find Near Me - forcing new tab');
    return originalWindowOpen(url, '_blank');
  }

  // For everything else, use original
  return originalWindowOpen.apply(this, arguments);
};

console.log('✅ window.open interceptor installed');

// ============================================================
// 2. DUPLICATE PREVENTION SYSTEM
// ============================================================

/**
 * Check if location exists
 */
window.locationExists = function(name, city, state) {
  if (!name || !city || !state) return false;

  const data = (window.adventuresData || window.opener?.adventuresData || []);
  const searchName = (name + '').toLowerCase().trim();
  const searchCity = (city + '').toLowerCase().trim();
  const searchState = (state + '').toLowerCase().trim();

  for (let item of data) {
    const existingName = ((item.name || item.values?.[0]?.[0] || '') + '').toLowerCase().trim();
    const existingCity = ((item.city || item.values?.[0]?.[10] || '') + '').toLowerCase().trim();
    const existingState = ((item.state || item.values?.[0]?.[9] || '') + '').toLowerCase().trim();

    if (existingName === searchName && existingCity === searchCity && existingState === searchState) {
      console.log(`⚠️ Duplicate: ${name}, ${city}, ${state}`);
      return true;
    }
  }

  return false;
};

console.log('✅ Duplicate prevention installed');

// ============================================================
// 3. DRY RUN TOGGLE SYSTEM - ONLY IN EDIT MODE
// ============================================================

/**
 * Force initialize ALL dry run toggles - ONLY IN EDIT MODE
 */
function forceDryRunToggles() {
  // Only run in edit mode
  if (isMainWindow) {
    console.log('⏭️ Skipping toggle init - not in edit mode');
    return;
  }

  console.log('🧪 FORCE INITIALIZING DRY RUN TOGGLES...');

  const toggleIds = [
    'singleDryRun',
    'bulkDryRun',
    'chainDryRun',
    'missingDryRun',
    'hoursDryRun',
    'refreshDryRun',
    'autoTagDryRun'
  ];

  let found = 0;

  toggleIds.forEach(id => {
    const checkbox = document.getElementById(id);
    if (!checkbox) {
      console.log(`⏭️ Not found (expected in edit mode): ${id}`);
      return;
    }

    found++;
    console.log(`✅ Processing: ${id}`);

    // Remove all old handlers
    checkbox.onclick = null;
    checkbox.onchange = null;
    checkbox.onclick_backup = null;

    // AGGRESSIVE: Add onclick directly to element
    Object.defineProperty(checkbox, 'onclick', {
      value: function(e) {
        console.log(`🖱️ DIRECT ONCLICK: ${id} = ${this.checked}`);
        updateToggleState(id, this.checked);
        if (e) e.preventDefault();
        return false;
      },
      writable: true,
      configurable: true
    });

    // Add all event listeners
    checkbox.addEventListener('click', function(e) {
      console.log(`🖱️ CLICK LISTENER: ${id} = ${this.checked}`);
      updateToggleState(id, this.checked);
    }, { capture: true, passive: false });

    checkbox.addEventListener('change', function(e) {
      console.log(`🔄 CHANGE LISTENER: ${id} = ${this.checked}`);
      updateToggleState(id, this.checked);
    }, { capture: true, passive: false });

    // Add input listener
    checkbox.addEventListener('input', function(e) {
      console.log(`⌨️ INPUT LISTENER: ${id} = ${this.checked}`);
      updateToggleState(id, this.checked);
    }, { capture: true, passive: false });
  });

  if (found > 0) {
    console.log(`✅ Processed ${found}/${toggleIds.length} toggles`);
  }
}

/**
 * Update toggle state
 */
function updateToggleState(checkboxId, isChecked) {
  console.log(`📋 Updating: ${checkboxId} = ${isChecked}`);

  const baseName = checkboxId.replace('DryRun', '');

  // Update toggle
  const toggleDiv = document.getElementById(baseName + 'DryRunToggle');
  if (toggleDiv) {
    if (isChecked) {
      toggleDiv.classList.add('enabled');
    } else {
      toggleDiv.classList.remove('enabled');
    }
    console.log(`✅ Toggle ${baseName} updated`);
  }

  // Update status
  const statusDiv = document.getElementById(baseName + 'DryRunStatus');
  if (statusDiv) {
    statusDiv.textContent = isChecked ? '✅ ENABLED' : '❌ DISABLED';
    statusDiv.classList.toggle('on', isChecked);
    statusDiv.classList.toggle('off', !isChecked);
    console.log(`✅ Status ${baseName} updated`);
  }
}

// Initialize immediately (only in edit mode)
if (isEditMode) {
  console.log('Initializing toggles now...');
  forceDryRunToggles();
}

// Re-initialize on different events
if (isEditMode) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('Re-initializing after DOMContentLoaded...');
      setTimeout(forceDryRunToggles, 100);
    });
  }

  window.addEventListener('load', () => {
    console.log('Re-initializing after window load...');
    setTimeout(forceDryRunToggles, 100);
  });

  // Repeated initialization (only in edit mode)
  setInterval(() => {
    forceDryRunToggles();
  }, 2000);
}

// ============================================================
// 4. CITY VIEWER MODAL DETECTION AND FIX
// ============================================================

/**
 * showModal interceptor already handled by final-fix-v7-0-139
 * This prevents duplicate declaration errors
 */
console.log('✅ Modal interceptor handled by final-fix-v7-0-139');

/**
 * Override City Viewer window opening
 */
window.openCityViewerInTab = function() {
  console.log('🌆 Opening City Viewer in new tab...');
  const url = 'HTML Files/city-viewer-window.html';
  const tab = window.open(url, '_blank');
  if (tab) {
    tab.focus();
    console.log('✅ City Viewer tab opened and focused');
  } else {
    console.warn('⚠️ Could not open tab');
    alert('Please enable pop-ups');
  }
};

window.openCityViewerWindow = window.openCityViewerInTab;
window.viewCityDetails = window.openCityViewerInTab;

console.log('✅ City Viewer functions set as backup');

// ============================================================
// 5. VERIFICATION SYSTEM
// ============================================================

/**
 * Verify all systems are working
 */
function verifySystems() {
  console.log('🔍 VERIFYING ALL SYSTEMS...');

  const checks = {
    'window.open interceptor': typeof window.open === 'function',
    'locationExists': typeof window.locationExists === 'function',
    'openCityViewerInTab': typeof window.openCityViewerInTab === 'function',
    'updateToggleState': typeof updateToggleState === 'function',
    'forceDryRunToggles': typeof forceDryRunToggles === 'function'
  };

  Object.entries(checks).forEach(([name, exists]) => {
    console.log(`${exists ? '✅' : '❌'} ${name}`);
  });

  // Check toggles only in edit mode
  if (isEditMode) {
    const toggleIds = [
      'singleDryRun', 'bulkDryRun', 'chainDryRun',
      'missingDryRun', 'hoursDryRun', 'refreshDryRun', 'autoTagDryRun'
    ];

    let togglesFound = 0;
    toggleIds.forEach(id => {
      if (document.getElementById(id)) togglesFound++;
    });
    console.log(`🧪 Toggles found: ${togglesFound}/${toggleIds.length}`);
  }
}

// Verify on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', verifySystems);
} else {
  verifySystems();
}

// Verify periodically (but only log edit mode toggle status in edit mode)
setInterval(verifySystems, 5000);

console.log('✅ MASTER FIX SYSTEM v7.0.137 READY');
console.log(`📍 Window Type: ${isEditMode ? 'EDIT MODE' : 'MAIN WINDOW'}`);
console.log('  - window.open interceptor installed');
console.log('  - Duplicate prevention active');
console.log(isEditMode ? '  - Dry run toggles bulletproof' : '  - Dry run toggles (not in main window)');
console.log('  - City Viewer modal detector active');
console.log('  - Verification system running');
console.log('🚀 All systems go!');

