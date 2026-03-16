/**
 * CONSOLIDATED DEBUG & ERROR HANDLING SYSTEM v7.0.141
 * ===================================================
 *
 * A unified system for initialization debugging, error tracking, and management.
 * Consolidates all debug and error handling functionality into a single module.
 *
 * INCLUDES:
 * - Initialization & Debug System (v7.0.114)
 * - Error Management System (v7.0.125)
 * - System checker and validator
 * - Button handler registration
 * - Centralized error tracking
 * - Error display and UI
 * - Error clearing and reporting
 *
 * Version: 7.0.141
 * Date: March 15, 2026
 * Created: Consolidated from 2 separate debug/error files
 */

console.log('🚀 Consolidated Debug & Error Handling System v7.0.141 Loading...');

// ============================================================
// SECTION 1: ERROR MANAGEMENT SYSTEM
// ============================================================

/**
 * Safely append element to body
 */
function appendToBodySafe(el) {
  if (!el) return;
  if (document.body) {
    document.body.appendChild(el);
    return;
  }

  const onReady = () => {
    if (document.body && !el.isConnected) {
      document.body.appendChild(el);
    }
  };

  window.addEventListener('DOMContentLoaded', onReady, { once: true });
}

/**
 * Error Manager Class - Centralized error tracking and display
 */
class ErrorManager {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
    this.displayElement = null;
    this.toggleButton = null;
    this.init();
  }

  /**
   * Initialize error manager
   */
  init() {
    // Override global error handlers
    window.addEventListener('error', (e) => this.handleError(e));
    window.addEventListener('unhandledrejection', (e) => this.handleRejection(e));

    // Override console.error to capture logs
    const originalError = console.error;
    console.error = (...args) => {
      originalError.apply(console, args);
      this.logError(args.join(' '), 'console');
    };

    // Create UI elements
    this.createToggleButton();
    this.createDisplayElement();

    console.log('✅ Error Manager initialized');
  }

  /**
   * Handle window errors
   */
  handleError(event) {
    const errorMsg = event.message || 'Unknown error';
    const source = event.filename || 'unknown';
    const lineno = event.lineno || 0;

    this.logError(errorMsg, 'window', { source, lineno });
  }

  /**
   * Handle unhandled promise rejections
   */
  handleRejection(event) {
    const reason = event.reason || 'Unknown rejection';
    this.logError(String(reason), 'promise');
  }

  /**
   * Log an error
   */
  logError(message, type = 'general', context = {}) {
    const timestamp = new Date().toLocaleTimeString();
    const error = {
      id: Date.now() + Math.random(),
      timestamp,
      message,
      type,
      context,
      seen: false
    };

    this.errors.push(error);

    // Keep array size manageable
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    console.log(`📝 Error logged [${type}]: ${message}`);
    this.updateDisplay();
    this.showToggleButton();
  }

  /**
   * Clear all errors
   */
  clearAllErrors() {
    const count = this.errors.length;
    this.errors = [];
    console.log(`🗑️ Cleared ${count} errors`);
    this.updateDisplay();
    return count;
  }

  /**
   * Clear errors of specific type
   */
  clearErrorsByType(type) {
    const before = this.errors.length;
    this.errors = this.errors.filter(e => e.type !== type);
    const removed = before - this.errors.length;
    console.log(`🗑️ Cleared ${removed} errors of type: ${type}`);
    this.updateDisplay();
    return removed;
  }

  /**
   * Get recent errors
   */
  getRecentErrors(count = 10) {
    return this.errors.slice(-count).reverse();
  }

  /**
   * Get error count
   */
  getErrorCount() {
    return this.errors.length;
  }

  /**
   * Check if there are errors
   */
  hasErrors() {
    return this.errors.length > 0;
  }

  /**
   * Update display
   */
  updateDisplay() {
    if (!this.displayElement) {
      this.createDisplayElement();
    }

    if (this.errors.length === 0) {
      this.displayElement.innerHTML = '<div style="padding: 16px; text-align: center; color: #6b7280;">✅ No errors</div>';
      return;
    }

    const recentErrors = this.getRecentErrors(20);
    const self = this;

    let html = '<div style="padding: 16px;">' +
      '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">' +
      '<div style="font-weight: 700; color: #ef4444;">❌ ' + this.errors.length + ' Error' + (this.errors.length !== 1 ? 's' : '') + '</div>' +
      '<button id="error-clear-all-btn" style="padding: 6px 12px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px;">🗑️ Clear All</button>' +
      '</div>';

    html += '<div style="max-height: 400px; overflow-y: auto; border: 1px solid #fca5a5; border-radius: 8px; background: #fef2f2;">';

    for (let error of recentErrors) {
      html += '<div style="padding: 12px; border-bottom: 1px solid #fecaca; display: flex; gap: 8px; align-items: flex-start;">' +
        '<div style="flex-shrink: 0; margin-top: 2px;">❌</div>' +
        '<div style="flex: 1; min-width: 0;">' +
        '<div style="font-size: 12px; color: #7f1d1d; word-break: break-word;">' + error.message + '</div>' +
        '<div style="font-size: 11px; color: #991b1b; margin-top: 4px;">' + error.timestamp + ' [' + error.type + ']</div>' +
        '</div>' +
        '</div>';
    }

    html += '</div>' +
      '<div style="margin-top: 12px; padding: 12px; background: #fee2e2; border-radius: 6px; font-size: 12px; color: #7f1d1d;">' +
      '💡 Errors are logged automatically. Click "Copy All" to share error details for debugging.' +
      '</div>' +
      '<button id="error-copy-all-btn" style="width: 100%; margin-top: 12px; padding: 10px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">📋 Copy All Errors</button>' +
      '</div>';

    this.displayElement.innerHTML = html;

    // Attach event listeners after HTML is rendered
    const clearBtn = document.getElementById('error-clear-all-btn');
    const copyBtn = document.getElementById('error-copy-all-btn');

    if (clearBtn) {
      clearBtn.onclick = () => {
        self.clearAllErrors();
        self.updateDisplay();
      };
    }

    if (copyBtn) {
      copyBtn.onclick = () => {
        const text = self.errors.map(e => e.timestamp + ' [' + e.type + '] ' + e.message).join('\n');
        navigator.clipboard.writeText(text).then(() => {
          alert('✅ Errors copied to clipboard!');
        }).catch(() => {
          alert('❌ Failed to copy errors');
        });
      };
    }
  }

  /**
   * Create display element
   */
  createDisplayElement() {
    if (!document.getElementById('error-report-container')) {
      const container = document.createElement('div');
      container.id = 'error-report-container';
      container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; width: 400px; background: white; border: 2px solid #fca5a5; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); z-index: 99999; max-height: 600px; display: none;';
      appendToBodySafe(container);
      this.displayElement = container;
    }
    return this.displayElement;
  }

  /**
   * Create toggle button
   */
  createToggleButton() {
    if (!document.getElementById('error-report-toggle')) {
      const toggleBtn = document.createElement('button');
      toggleBtn.id = 'error-report-toggle';
      toggleBtn.style.cssText = 'position: fixed; bottom: 20px; right: 430px; width: 50px; height: 50px; background: #ef4444; color: white; border: none; border-radius: 50%; font-size: 20px; cursor: pointer; z-index: 99998; display: none; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4); transition: all 0.2s; font-weight: 700;';
      toggleBtn.textContent = '❌';
      toggleBtn.title = 'Click to view errors';

      toggleBtn.onclick = () => this.toggleErrorReport();
      toggleBtn.onmouseover = () => toggleBtn.style.background = '#dc2626';
      toggleBtn.onmouseout = () => toggleBtn.style.background = '#ef4444';

      appendToBodySafe(toggleBtn);
      this.toggleButton = toggleBtn;
    }
    return this.toggleButton;
  }

  /**
   * Show toggle button
   */
  showToggleButton() {
    if (this.toggleButton && this.errors.length > 0) {
      this.toggleButton.style.display = 'block';
    }
  }

  /**
   * Toggle error report visibility
   */
  toggleErrorReport() {
    if (!this.displayElement) {
      this.createDisplayElement();
    }

    if (this.displayElement.style.display === 'none') {
      this.displayElement.style.display = 'block';
    } else {
      this.displayElement.style.display = 'none';
    }
  }

  /**
   * Show error report
   */
  showErrorReport() {
    if (!this.displayElement) {
      this.createDisplayElement();
    }
    this.displayElement.style.display = 'block';
    this.updateDisplay();
  }

  /**
   * Hide error report
   */
  hideErrorReport() {
    if (this.displayElement) {
      this.displayElement.style.display = 'none';
    }
  }
}

// Initialize error manager globally
window.errorManager = new ErrorManager();

console.log('✅ Error Management System ready');

// ============================================================
// SECTION 2: INITIALIZATION & DEBUG SYSTEM
// ============================================================

(function() {
  console.log('🚀🚀🚀 INITIALIZATION DEBUG SYSTEM STARTING 🚀🚀🚀');

  const initLog = [];

  /**
   * Helper to log initialization
   */
  const logInit = (msg) => {
    console.log(`✅ ${msg}`);
    initLog.push(msg);
  };

  /**
   * Check system initialization
   */
  const checkSystems = function() {
    console.log('\n📋 CHECKING LOADED SYSTEMS:\n');

    // Check comprehensive fix system
    if (window.handleRefreshPlaceIds) {
      logInit('✅ handleRefreshPlaceIds function exists');
    } else {
      console.error('❌ handleRefreshPlaceIds NOT FOUND');
    }

    // Check enhanced automation
    if (window.handleBulkAddChainLocations) {
      logInit('✅ handleBulkAddChainLocations function exists');
    } else {
      console.error('❌ handleBulkAddChainLocations NOT FOUND');
    }

    if (window.handleFindSimilar) {
      logInit('✅ handleFindSimilar function exists');
    } else {
      console.error('❌ handleFindSimilar NOT FOUND');
    }

    // Check other systems
    if (window.cleanTagManager) {
      logInit('✅ cleanTagManager loaded');
    }

    if (window.locationHistoryManager) {
      logInit('✅ locationHistoryManager loaded');
    }

    if (window.adventuresData) {
      logInit(`✅ adventuresData loaded (${window.adventuresData.length} locations)`);
    }

    // Check error manager
    if (window.errorManager) {
      logInit('✅ Error Manager loaded');
    }
  };

  /**
   * Register button handlers
   */
  const registerButtons = function() {
    console.log('\n🔘 REGISTERING BUTTON HANDLERS:\n');

    // Refresh Place IDs button - with fallback
    const refreshBtn = document.getElementById('btnRefreshPlaceIds');
    if (refreshBtn) {
      const origOnClick = refreshBtn.onclick;
      refreshBtn.onclick = function() {
        if (typeof window.handleRefreshPlaceIds === 'function') {
          window.handleRefreshPlaceIds();
        } else if (typeof origOnClick === 'function') {
          origOnClick.call(this);
        } else {
          console.warn('⚠️ Refresh Place IDs handler not available');
        }
      };
      logInit('🔘 Refresh Place IDs button registered');
    }

    // Bulk Add Chain button - with fallback
    const bulkChainBtn = document.getElementById('btnBulkAddChain');
    if (bulkChainBtn) {
      const origOnClick = bulkChainBtn.onclick;
      bulkChainBtn.onclick = function() {
        if (typeof window.handleBulkAddChainLocations === 'function') {
          window.handleBulkAddChainLocations();
        } else if (typeof origOnClick === 'function') {
          origOnClick.call(this);
        } else {
          console.warn('⚠️ Bulk Add Chain handler not available');
        }
      };
      logInit('🔘 Bulk Add Chain button registered');
    }

    // Find Similar button - on main page
    const similarBtns = document.querySelectorAll('[class*="similar"]');
    if (similarBtns.length > 0) {
      logInit(`🔘 ${similarBtns.length} Similar buttons found`);
    }

    // Sign In button - CRITICAL
    const signInBtn = document.getElementById('signInBtn');
    if (signInBtn) {
      signInBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔐🔐🔐 SIGN IN BUTTON CLICKED 🔐🔐🔐');
        console.log('typeof signIn:', typeof signIn);
        console.log('msalInstance:', typeof msalInstance !== 'undefined' ? 'EXISTS' : 'MISSING');

        if (typeof signIn === 'function') {
          console.log('✅ Calling signIn() function');
          signIn();
        } else {
          console.error('❌ signIn function not found!');
          console.error('Available window functions:', Object.keys(window).filter(k => k.includes('sign') || k.includes('Sign')));
        }
      });
      logInit('🔐 Sign In button registered');
    } else {
      console.error('❌ Sign In button (id="signInBtn") NOT FOUND');
    }

    // Sign Out button
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔐 SIGN OUT BUTTON CLICKED');
        if (typeof signOut === 'function') {
          signOut();
        } else {
          console.error('❌ signOut function not found!');
        }
      });
      logInit('🔐 Sign Out button registered');
    }
  };

  /**
   * Apply quick fixes
   */
  const applyQuickFixes = function() {
    console.log('\n🔧 APPLYING QUICK FIXES:\n');

    // Hide old tag manager backdrop
    const oldTagBackdrop = document.getElementById('tagManagerBackdrop');
    if (oldTagBackdrop) {
      oldTagBackdrop.style.display = 'none !important';
      oldTagBackdrop.style.zIndex = '-9999 !important';
      logInit('🔧 Hidden old tag manager backdrop');
    }

    // Fix Location History Z-index
    if (window.locationHistoryManager && window.locationHistoryManager.openModal) {
      const origOpen = window.locationHistoryManager.openModal;
      window.locationHistoryManager.openModal = function() {
        console.log('📋 Opening Location History with fixed z-index');
        origOpen.call(this);
        const backdrop = document.getElementById('locationHistoryBackdrop');
        if (backdrop) {
          backdrop.style.zIndex = '999998 !important';
          logInit('🔧 Location History z-index fixed');
        }
      };
    }
  };

  /**
   * Show status summary
   */
  const showStatus = function() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 INITIALIZATION STATUS SUMMARY');
    console.log('='.repeat(50));
    console.log(initLog.join('\n'));
    console.log('='.repeat(50) + '\n');

    // Create visual indicator
    const statusDiv = document.createElement('div');
    statusDiv.id = 'initStatusIndicator';
    statusDiv.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-weight: 600;
      z-index: 999999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease-out;
    `;
    statusDiv.textContent = `✅ App Ready - ${initLog.length} systems initialized`;

    // Auto-remove after 5 seconds
    setTimeout(() => {
      statusDiv.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => statusDiv.remove(), 300);
    }, 5000);

    appendToBodySafe(statusDiv);
  };

  /**
   * Main initialization
   */
  const initialize = function() {
    console.clear();
    console.log('🎯 STARTING v7.0.141 INITIALIZATION DEBUG SYSTEM\n');

    // Check what's loaded
    checkSystems();

    // Apply fixes
    applyQuickFixes();

    // Register buttons
    registerButtons();

    // Show summary
    showStatus();

    console.log('✅ INITIALIZATION COMPLETE\n');
    console.log('📝 Ready to use:');
    console.log('   - Refresh Place IDs (with results modal)');
    console.log('   - Bulk Add Chain Locations');
    console.log('   - Find Similar (popup)');
    console.log('   - Location History (fixed z-index)');
    console.log('   - Tag Manager (circle fixed)');
    console.log('   - Error Management (centralized tracking)');
  };

  /**
   * Trigger initialization
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initialize, 500);
    });
  } else {
    setTimeout(initialize, 500);
  }

  // Expose for manual trigger
  window.debugInit = initialize;
  window.logInit = logInit;
})();

// ============================================================
// SECTION 3: UTILITY FUNCTIONS
// ============================================================

/**
 * Get initialization log
 */
window.getInitLog = function() {
  console.log(window.logInit);
};

/**
 * Get error summary
 */
window.getErrorSummary = function() {
  if (window.errorManager) {
    console.log(`Total Errors: ${window.errorManager.getErrorCount()}`);
    console.log(window.errorManager.getRecentErrors(10));
  }
};

/**
 * Clear all errors
 */
window.clearAllErrors = function() {
  if (window.errorManager) {
    return window.errorManager.clearAllErrors();
  }
};

/**
 * Show error report
 */
window.showErrors = function() {
  if (window.errorManager) {
    window.errorManager.showErrorReport();
  }
};

/**
 * Hide error report
 */
window.hideErrors = function() {
  if (window.errorManager) {
    window.errorManager.hideErrorReport();
  }
};

// ============================================================
// INITIALIZATION
// ============================================================

console.log('✅ Consolidated Debug & Error Handling System v7.0.141 Loaded');
console.log('  - Error Management System');
console.log('  - Initialization & Debug System');
console.log('  - System checker');
console.log('  - Button handler registration');
console.log('  - Centralized error tracking');
console.log('  - Error display and UI');
console.log('  - Utility functions');

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ErrorManager,
    errorManager: window.errorManager
  };
}

