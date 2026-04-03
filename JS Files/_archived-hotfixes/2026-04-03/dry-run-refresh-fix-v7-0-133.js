/**
 * DRY RUN & REFRESH FIX - v7.0.133
 * ================================
 * Direct fixes for:
 * 1. Dry run toggle sliders not responding to clicks
 * 2. Refresh Place IDs progress not showing
 *
 * This script loads AFTER other systems to override and fix
 * Date: March 15, 2026
 */

console.log('🚀 Dry Run & Refresh Fix v7.0.133 Loading...');

// ============================================================
// 1. FIX DRY RUN TOGGLE SLIDERS
// ============================================================

/**
 * Initialize ALL dry run sliders with direct click handlers
 */
function initializeDryRunToggles() {
  console.log('🧪 Initializing dry run toggles (v7.0.133)...');

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDryRunToggles);
    return;
  }

  const toggleIds = [
    { checkboxId: 'singleDryRun', featureName: 'Single Place' },
    { checkboxId: 'bulkDryRun', featureName: 'Bulk Add' },
    { checkboxId: 'chainDryRun', featureName: 'Chain' },
    { checkboxId: 'missingDryRun', featureName: 'Populate Missing' },
    { checkboxId: 'hoursDryRun', featureName: 'Update Hours' },
    { checkboxId: 'refreshDryRun', featureName: 'Refresh Place IDs' },
    { checkboxId: 'autoTagDryRun', featureName: 'Auto Tag' }
  ];

  toggleIds.forEach(({ checkboxId, featureName }) => {
    const checkbox = document.getElementById(checkboxId);

    if (checkbox) {
      console.log(`✅ Found checkbox: ${checkboxId}`);

      // Remove any old listeners
      checkbox.onchange = null;

      // Add direct click handler
      checkbox.addEventListener('click', function(e) {
        console.log(`🧪 CLICKED: ${checkboxId} = ${this.checked}`);
        handleDryRunToggle(this, checkboxId, featureName);
      }, { once: false, passive: false });

      // Also handle change event
      checkbox.addEventListener('change', function(e) {
        console.log(`🧪 CHANGED: ${checkboxId} = ${this.checked}`);
        handleDryRunToggle(this, checkboxId, featureName);
      }, { once: false, passive: false });

      // Double-check by adding onclick handler
      checkbox.onclick = function(e) {
        console.log(`🧪 ONCLICK: ${checkboxId} = ${this.checked}`);
        handleDryRunToggle(this, checkboxId, featureName);
        return true;
      };
    } else {
      console.warn(`⚠️ Could not find checkbox: ${checkboxId}`);
    }
  });

  console.log('✅ Dry run toggles initialized');
}

/**
 * Handle dry run toggle change
 */
function handleDryRunToggle(checkbox, checkboxId, featureName) {
  console.log(`🧪 Handling toggle: ${checkboxId} (${featureName}), checked=${checkbox.checked}`);

  // Get base ID
  const baseId = checkboxId.replace('DryRun', '');
  const toggleId = baseId + 'DryRunToggle';
  const statusId = baseId + 'DryRunStatus';

  console.log(`🔍 Looking for: toggle=${toggleId}, status=${statusId}`);

  // Update toggle appearance
  const toggle = document.getElementById(toggleId);
  if (toggle) {
    if (checkbox.checked) {
      toggle.classList.add('enabled');
      console.log(`✅ Added 'enabled' class to ${toggleId}`);
    } else {
      toggle.classList.remove('enabled');
      console.log(`✅ Removed 'enabled' class from ${toggleId}`);
    }
  } else {
    console.warn(`⚠️ Could not find toggle: ${toggleId}`);
  }

  // Update status badge
  const status = document.getElementById(statusId);
  if (status) {
    if (checkbox.checked) {
      status.textContent = '✅ ENABLED';
      status.classList.remove('off');
      status.classList.add('on');
      console.log(`✅ Updated status ${statusId} to ENABLED`);
    } else {
      status.textContent = '❌ DISABLED';
      status.classList.remove('on');
      status.classList.add('off');
      console.log(`✅ Updated status ${statusId} to DISABLED`);
    }
  } else {
    console.warn(`⚠️ Could not find status: ${statusId}`);
  }

  // Show notification
  const message = `🧪 ${featureName}: ${checkbox.checked ? '✅ ENABLED' : '❌ DISABLED'}`;
  console.log(`📢 ${message}`);

  // Try to show toast in parent window
  if (window.opener && window.opener.showToast) {
    window.opener.showToast(message, checkbox.checked ? 'success' : 'info', 2000);
  } else if (window.showToast) {
    window.showToast(message, checkbox.checked ? 'success' : 'info', 2000);
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDryRunToggles);
} else {
  initializeDryRunToggles();
}

// Also initialize after a short delay to catch late DOM elements
setTimeout(initializeDryRunToggles, 500);
setTimeout(initializeDryRunToggles, 1000);

// ============================================================
// 2. FIX REFRESH PLACE IDS IN EDIT MODE
// ============================================================

/**
 * Override submitRefreshPlaceIds to ensure it works
 */
window.submitRefreshPlaceIds = function() {
  console.log('🔄 submitRefreshPlaceIds called');

  const dryRun = document.getElementById('refreshDryRun')?.checked || false;
  const statusDiv = document.getElementById('refresh-status');

  if (!statusDiv) {
    console.error('❌ refresh-status div not found');
    alert('Error: Status div not found');
    return;
  }

  console.log(`🔄 Starting refresh (Dry Run: ${dryRun})`);

  // Show loading state
  statusDiv.innerHTML = `
    <div style="background: #dbeafe; color: #1e40af; border-left: 4px solid #1e40af; padding: 16px; border-radius: 8px; margin-bottom: 12px;">
      <span style="display: inline-block; width: 20px; height: 20px; border: 3px solid #e5e7eb; border-top-color: #1e40af; border-radius: 50%; animation: spin 0.8s linear infinite; margin-right: 10px; vertical-align: middle;"></span>
      <strong>🔄 Initializing refresh...</strong>
    </div>
  `;

  // Add CSS animation if not present
  if (!document.getElementById('spinnerCSS')) {
    const style = document.createElement('style');
    style.id = 'spinnerCSS';
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  // Try to call from main window
  setTimeout(() => {
    try {
      if (window.opener && window.opener.refreshPlaceIdsFromEditMode) {
        console.log('✅ Calling opener.refreshPlaceIdsFromEditMode');
        window.opener.refreshPlaceIdsFromEditMode(dryRun);
      } else if (window.opener && window.opener.refreshPlaceIdsWithProgress) {
        console.log('✅ Calling opener.refreshPlaceIdsWithProgress');
        window.opener.refreshPlaceIdsWithProgress(dryRun);
      } else if (window.refreshPlaceIdsFromEditMode) {
        console.log('✅ Calling local refreshPlaceIdsFromEditMode');
        window.refreshPlaceIdsFromEditMode(dryRun);
      } else if (window.refreshPlaceIdsWithProgress) {
        console.log('✅ Calling local refreshPlaceIdsWithProgress');
        window.refreshPlaceIdsWithProgress(dryRun);
      } else {
        console.error('❌ No refresh function found');
        statusDiv.innerHTML = `
          <div style="background: #fee2e2; color: #991b1b; border-left: 4px solid #dc2626; padding: 16px; border-radius: 8px;">
            ❌ Error: Refresh function not found. Make sure the main window is open.
          </div>
        `;
      }
    } catch (error) {
      console.error('❌ Error calling refresh:', error);
      statusDiv.innerHTML = `
        <div style="background: #fee2e2; color: #991b1b; border-left: 4px solid #dc2626; padding: 16px; border-radius: 8px;">
          ❌ Error: ${error.message}
        </div>
      `;
    }
  }, 100);
};

console.log('✅ Dry Run & Refresh Fix v7.0.133 Ready');
console.log('  - Dry run toggles fixed and initialized');
console.log('  - Refresh Place IDs function overridden');
console.log('  - Direct event handlers attached');

