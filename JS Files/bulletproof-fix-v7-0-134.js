/**
 * BULLETPROOF DRY RUN & REFRESH FIX - v7.0.134
 * ============================================
 * Direct, simple fixes that will DEFINITELY work
 *
 * Date: March 15, 2026
 */

console.log('🚀 Bulletproof Fix v7.0.134 LOADING...');

// ============================================================
// 1. DIRECT CHECKBOX CLICK HANDLER
// ============================================================

/**
 * Initialize all dry run checkboxes with direct onclick handlers
 */
function setupDryRunCheckboxes() {
  console.log('🔧 Setting up dry run checkboxes...');

  // List of all dry run checkboxes
  const checkboxes = [
    'singleDryRun',
    'bulkDryRun',
    'chainDryRun',
    'missingDryRun',
    'hoursDryRun',
    'refreshDryRun',
    'autoTagDryRun'
  ];

  checkboxes.forEach(checkboxId => {
    const checkbox = document.getElementById(checkboxId);
    if (checkbox) {
      console.log(`✅ Found: ${checkboxId}`);

      // DIRECT ONCLICK - Most reliable
      checkbox.onclick = function() {
        console.log(`🖱️ CLICKED: ${checkboxId}, checked=${this.checked}`);
        handleDryRunToggle(checkboxId, this.checked);
        return false; // Prevent default
      };

      // Also try addEventListener
      checkbox.addEventListener('click', function(e) {
        console.log(`🖱️ CLICK EVENT: ${checkboxId}, checked=${this.checked}`);
        handleDryRunToggle(checkboxId, this.checked);
      });

      // And change event
      checkbox.addEventListener('change', function(e) {
        console.log(`🔄 CHANGE EVENT: ${checkboxId}, checked=${this.checked}`);
        handleDryRunToggle(checkboxId, this.checked);
      });

    } else {
      console.warn(`❌ NOT FOUND: ${checkboxId}`);
    }
  });

  console.log('✅ Dry run checkboxes setup complete');
}

/**
 * Handle dry run toggle change - SIMPLE AND DIRECT
 */
function handleDryRunToggle(checkboxId, isChecked) {
  console.log(`📋 Handling toggle: ${checkboxId} = ${isChecked}`);

  // Get the checkbox
  const checkbox = document.getElementById(checkboxId);
  if (!checkbox) {
    console.error(`❌ Checkbox not found: ${checkboxId}`);
    return;
  }

  // Extract base name (e.g., "refresh" from "refreshDryRun")
  const baseName = checkboxId.replace('DryRun', '');
  console.log(`📍 Base name: ${baseName}`);

  // Update toggle div if it exists
  const toggleId = baseName + 'DryRunToggle';
  const toggleDiv = document.getElementById(toggleId);
  if (toggleDiv) {
    if (isChecked) {
      toggleDiv.classList.add('enabled');
      console.log(`✅ Added 'enabled' to ${toggleId}`);
    } else {
      toggleDiv.classList.remove('enabled');
      console.log(`✅ Removed 'enabled' from ${toggleId}`);
    }
  }

  // Update status if it exists
  const statusId = baseName + 'DryRunStatus';
  const statusDiv = document.getElementById(statusId);
  if (statusDiv) {
    if (isChecked) {
      statusDiv.textContent = '✅ ENABLED';
      statusDiv.classList.remove('off');
      statusDiv.classList.add('on');
      console.log(`✅ Set ${statusId} to ENABLED`);
    } else {
      statusDiv.textContent = '❌ DISABLED';
      statusDiv.classList.remove('on');
      statusDiv.classList.add('off');
      console.log(`✅ Set ${statusId} to DISABLED`);
    }
  }

  console.log(`✅ Toggle ${checkboxId} handled`);
}

// Initialize immediately
console.log('Initializing checkboxes now...');
setupDryRunCheckboxes();

// Also init on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Re-initializing after DOM ready...');
    setupDryRunCheckboxes();
  });
}

// Also init after delay
setTimeout(() => {
  console.log('Re-initializing after 500ms...');
  setupDryRunCheckboxes();
}, 500);

// ============================================================
// 2. DIRECT REFRESH PLACE IDS FUNCTION
// ============================================================

/**
 * Submit Refresh Place IDs - SIMPLE AND DIRECT
 */
window.submitRefreshPlaceIds = function() {
  console.log('🔄 submitRefreshPlaceIds CALLED');

  const dryRun = document.getElementById('refreshDryRun')?.checked || false;
  console.log(`🧪 Dry Run: ${dryRun}`);

  const statusDiv = document.getElementById('refresh-status');
  if (!statusDiv) {
    console.error('❌ refresh-status div NOT found');
    alert('Error: Status div not found');
    return;
  }

  console.log('✅ refresh-status div found');

  // Show loading
  statusDiv.innerHTML = `
    <div style="
      background: #dbeafe;
      color: #1e40af;
      border-left: 4px solid #1e40af;
      padding: 16px;
      border-radius: 8px;
      margin-top: 12px;
    ">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid #e5e7eb;
          border-top-color: #1e40af;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        "></span>
        <strong>🔄 Initializing refresh...</strong>
      </div>
    </div>
  `;

  console.log('✅ Loading state displayed');

  // Add animation
  if (!document.getElementById('spinAnim')) {
    const style = document.createElement('style');
    style.id = 'spinAnim';
    style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(style);
    console.log('✅ Added spinner animation');
  }

  // Call from main window after delay
  setTimeout(() => {
    try {
      console.log('Attempting to call refresh from main window...');

      // Try to get from opener
      if (window.opener) {
        console.log('✅ Opener exists');

        if (window.opener.refreshPlaceIdsFromEditMode) {
          console.log('✅ Calling opener.refreshPlaceIdsFromEditMode');
          window.opener.refreshPlaceIdsFromEditMode(dryRun);
          return;
        }

        if (window.opener.refreshPlaceIdsWithProgress) {
          console.log('✅ Calling opener.refreshPlaceIdsWithProgress');
          window.opener.refreshPlaceIdsWithProgress(dryRun);
          return;
        }
      }

      // Try local
      if (window.refreshPlaceIdsFromEditMode) {
        console.log('✅ Calling local refreshPlaceIdsFromEditMode');
        window.refreshPlaceIdsFromEditMode(dryRun);
        return;
      }

      if (window.refreshPlaceIdsWithProgress) {
        console.log('✅ Calling local refreshPlaceIdsWithProgress');
        window.refreshPlaceIdsWithProgress(dryRun);
        return;
      }

      // None found
      console.error('❌ No refresh function found');
      statusDiv.innerHTML = `
        <div style="
          background: #fee2e2;
          color: #991b1b;
          border-left: 4px solid #dc2626;
          padding: 16px;
          border-radius: 8px;
          margin-top: 12px;
        ">
          ❌ Error: Refresh function not available<br>
          Make sure the main window is open
        </div>
      `;

    } catch (error) {
      console.error('❌ Error:', error);
      statusDiv.innerHTML = `
        <div style="
          background: #fee2e2;
          color: #991b1b;
          border-left: 4px solid #dc2626;
          padding: 16px;
          border-radius: 8px;
          margin-top: 12px;
        ">
          ❌ Error: ${error.message}
        </div>
      `;
    }
  }, 100);
};

console.log('✅ Bulletproof Fix v7.0.134 READY');
console.log('  - Dry run checkboxes setup');
console.log('  - Refresh function overridden');
console.log('  - Direct event handlers attached');

