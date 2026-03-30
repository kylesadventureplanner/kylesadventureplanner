/**
 * DRY RUN TOGGLES & CITY VIEWER - DEEP DIVE FIX - v7.0.140
 * =========================================================
 * Comprehensive fixes for:
 * 1. Dry run toggle sliders not responding to clicks
 * 2. City Viewer not opening in new tab
 * 3. All interception and initialization issues
 *
 * Date: March 15, 2026
 */

console.log('🚀 DEEP DIVE FIX v7.0.140 LOADING...');

// ============================================================
// 1. DRY RUN TOGGLE FIX - MAKE SLIDERS CLICKABLE
// ============================================================

/**
 * Fix dry run toggles to actually respond to clicks
 * The checkboxes are hidden, so we need to click them programmatically
 */
function fixDryRunToggles() {
  console.log('🧪 Fixing dry run toggles...');

  const toggleIds = [
    'singleDryRun',
    'bulkDryRun',
    'chainDryRun',
    'missingDryRun',
    'hoursDryRun',
    'refreshDryRun',
    'autoTagDryRun'
  ];

  toggleIds.forEach(checkboxId => {
    const checkbox = document.getElementById(checkboxId);
    if (!checkbox) {
      console.log(`⏭️ Not in this window: ${checkboxId}`);
      return;
    }

    console.log(`✅ Found: ${checkboxId}`);

    // Get the toggle container
    const toggleContainer = checkbox.closest('.dry-run-toggle');
    if (!toggleContainer) {
      console.warn(`⚠️ No toggle container for ${checkboxId}`);
      return;
    }

    // Make the ENTIRE toggle container clickable
    toggleContainer.style.cursor = 'pointer';
    toggleContainer.style.userSelect = 'none';

    // Add click handler to the container
    toggleContainer.addEventListener('click', function(e) {
      // Don't trigger if clicking directly on the checkbox
      if (e.target === checkbox) return;

      e.preventDefault();
      e.stopPropagation();

      console.log(`🖱️ Toggle clicked: ${checkboxId}`);

      // Toggle the checkbox
      checkbox.checked = !checkbox.checked;

      // Trigger change event
      const event = new Event('change', { bubbles: true });
      checkbox.dispatchEvent(event);

      console.log(`✅ Toggled: ${checkboxId} = ${checkbox.checked}`);
    }, true);

    // Also add click handler to the slider specifically
    const slider = toggleContainer.querySelector('.toggle-slider');
    if (slider) {
      slider.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        console.log(`🎛️ Slider clicked: ${checkboxId}`);

        checkbox.checked = !checkbox.checked;
        const event = new Event('change', { bubbles: true });
        checkbox.dispatchEvent(event);

        console.log(`✅ Toggled via slider: ${checkboxId} = ${checkbox.checked}`);
      }, true);
    }

    // Add click to label
    const label = toggleContainer.querySelector('label');
    if (label) {
      label.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        console.log(`📝 Label clicked: ${checkboxId}`);

        checkbox.checked = !checkbox.checked;
        const event = new Event('change', { bubbles: true });
        checkbox.dispatchEvent(event);

        console.log(`✅ Toggled via label: ${checkboxId} = ${checkbox.checked}`);
      }, true);
    }
  });

  console.log('✅ Dry run toggles fixed');
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fixDryRunToggles);
} else {
  fixDryRunToggles();
}

// Also initialize after a delay
setTimeout(fixDryRunToggles, 500);
setTimeout(fixDryRunToggles, 1000);

// ============================================================
// 2. CITY VIEWER - GUARANTEED NEW TAB OPENER
// ============================================================

/**
 * DEFINITIVE City Viewer opener
 */
window.openCityViewerWindow = function(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  console.log('🌆 CITY VIEWER - OPENING IN NEW TAB');

  // Generate the URL based on where we are
  const baseUrl = window.location.origin;
  const url = `${baseUrl}/HTML Files/city-viewer-window.html`;

  console.log(`📍 Opening URL: ${url}`);

  // Method 1: Try with full URL
  try {
    const tab = window.open(url, '_blank', 'noopener,noreferrer');
    if (tab) {
      tab.focus();
      console.log('✅ City Viewer opened in NEW TAB');
      return tab;
    }
  } catch (error) {
    console.log('⚠️ Method 1 failed:', error.message);
  }

  // Method 2: Try without full URL
  try {
    const tab = window.open('/HTML Files/city-viewer-window.html', '_blank', 'noopener,noreferrer');
    if (tab) {
      tab.focus();
      console.log('✅ City Viewer opened in NEW TAB (Method 2)');
      return tab;
    }
  } catch (error) {
    console.log('⚠️ Method 2 failed:', error.message);
  }

  // Method 3: Try relative path
  try {
    const tab = window.open('HTML Files/city-viewer-window.html', '_blank');
    if (tab) {
      tab.focus();
      console.log('✅ City Viewer opened in NEW TAB (Method 3)');
      return tab;
    }
  } catch (error) {
    console.log('⚠️ Method 3 failed:', error.message);
  }

  console.error('❌ Could not open City Viewer in tab');
  alert('⚠️ Please enable pop-ups in your browser settings');
  return null;
};

// Set all function names to point here
window.openCityViewerInTab = window.openCityViewerWindow;
window.viewCityDetails = window.openCityViewerWindow;
window.viewCity = window.openCityViewerWindow;
window.showCityViewer = window.openCityViewerWindow;

console.log('✅ City Viewer opener installed');

// ============================================================
// 3. ENSURE BUTTON USES CORRECT FUNCTION
// ============================================================

/**
 * Monitor and fix City Viewer button
 */
function fixCityViewerButton() {
  console.log('🔍 Checking City Viewer button...');

  // Find City Viewer button - look through all buttons
  const allButtons = document.querySelectorAll('button');
  let foundButton = null;

  allButtons.forEach(btn => {
    const text = btn.textContent?.toLowerCase() || '';
    const onclick = btn.getAttribute('onclick') || '';

    if (text.includes('city') || onclick.includes('city')) {
      foundButton = btn;
      console.log(`✅ Found button: ${btn.textContent}`);
    }
  });

  if (foundButton) {
    console.log('✅ Found City Viewer button');

    // Override the onclick
    foundButton.onclick = function(e) {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      window.openCityViewerWindow(e);
      return false;
    };

    // Update onclick attribute
    foundButton.setAttribute('onclick', 'window.openCityViewerWindow(); return false;');

    console.log('✅ City Viewer button fixed');
  } else {
    console.log('⏭️ City Viewer button not found on this page');
  }
}

// Check on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fixCityViewerButton);
} else {
  fixCityViewerButton();
}

// Check after delays
setTimeout(fixCityViewerButton, 500);

// ============================================================
// 4. INTERCEPT window.open TO FORCE NEW TAB
// ============================================================

const originalOpen = window.open;
window.open = function(url, target, features) {
  // If City Viewer, force new tab
  if (url && (url.includes('city-viewer') || url.includes('city-viewer-window'))) {
    console.log('🌆 Intercepted City Viewer window.open - forcing new tab');
    return originalOpen(url, '_blank', 'noopener,noreferrer');
  }

  // If Find Near Me, force new tab
  if (url && (url.includes('find-near-me') || url.includes('find-near-me-window'))) {
    console.log('📍 Intercepted Find Near Me window.open - forcing new tab');
    return originalOpen(url, '_blank', 'noopener,noreferrer');
  }

  // Otherwise use original
  return originalOpen.apply(this, arguments);
};

console.log('✅ window.open interceptor installed');

// ============================================================
// 5. INTERCEPT showModal TO PREVENT MODAL OPENING
// ============================================================

const originalShowModal = HTMLElement.prototype.showModal;
if (originalShowModal) {
  HTMLElement.prototype.showModal = function() {
    const id = this.id || '';
    const classes = this.className || '';
    const text = this.textContent || '';

    // Check if this is City Viewer
    if (id.includes('city') || classes.includes('city') || text.includes('City Viewer')) {
      console.log('🌆 Blocked City Viewer modal - opening in tab instead');
      window.openCityViewerWindow();
      return;
    }

    // Allow other modals
    return originalShowModal.call(this);
  };

  console.log('✅ showModal interceptor installed');
}

// ============================================================
// 6. DETAILED LOGGING FOR VERIFICATION
// ============================================================

console.log('✅ DEEP DIVE FIX v7.0.140 READY');
console.log('  - Dry run toggles: FIXED');
console.log('  - Toggle click handlers: ADDED');
console.log('  - City Viewer button: FIXED');
console.log('  - window.open interceptor: INSTALLED');
console.log('  - showModal interceptor: INSTALLED');
console.log('🚀 All systems ready!');

