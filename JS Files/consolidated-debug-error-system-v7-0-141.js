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

    // Auth buttons: do not clone or attach listeners here.
    // Native index.html bindings keep sole ownership of sign-in/out behavior.
    const signInBtn = document.getElementById('signInBtn');
    if (signInBtn) {
      logInit('🔐 Sign In button detected (native binding preserved)');
    } else {
      console.error('❌ Sign In button (id="signInBtn") NOT FOUND');
    }

    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
      logInit('🔐 Sign Out button detected (native binding preserved)');
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

    checkAndFixSignIn();

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

const FALLBACK_MSAL_CONFIG = {
    auth: {
        clientId: "54cd5065-43b4-4f98-9390-0fbba95da3f2",
        authority: "https://login.microsoftonline.com/5b9b0c40-0a71-4cc2-a98a-8a1fc03a20bc"
    }
};

const FALLBACK_LOGIN_REQUEST = {
    scopes: ["User.Read", "Files.ReadWrite", "Sites.ReadWrite.All"]
};

// Keep fallback auth disabled unless explicitly turned on for emergency recovery.
const ENABLE_FALLBACK_AUTH = false;

function logDebug(message, details) {
    if (typeof details === 'undefined') {
        console.log(message);
    } else {
        console.log(message, details);
    }
}

function logSuccess(message, details) {
    if (typeof details === 'undefined') {
        console.log(`✅ ${message}`);
    } else {
        console.log(`✅ ${message}`, details);
    }
}

function logError(level, message, details) {
    const fullMessage = typeof details === 'undefined' ? message : `${message} ${details}`;
    if (window.errorManager?.logError) {
        window.errorManager.logError(fullMessage, level || 'general');
    }
    if (level === 'warn') {
        console.warn(fullMessage);
    } else {
        console.error(fullMessage);
    }
}


function bootstrapAuthEarly() {
    // Do not eagerly create fallback handlers during startup.
    // The click handlers will bootstrap fallback auth only if native handlers are missing.
    if (document.readyState === 'complete') {
        if (typeof window.signIn !== 'function' || typeof window.signOut !== 'function') {
            logDebug('Native auth handlers not ready at startup; fallback auth will initialize on demand.');
        }
        return;
    }

    window.addEventListener('load', () => {
        if (typeof window.signIn !== 'function' || typeof window.signOut !== 'function') {
            logDebug('Native auth handlers still missing after load; fallback auth will initialize on demand.');
        }
    }, { once: true });
}

let fallbackMsalInitPromise = null;
let fallbackMsalInstance = null;

function fallbackNotify(message, type = 'info', duration = 4000) {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type, duration);
        return;
    }
    console.log(message);
}

function syncFallbackAuthState(token, account) {
    window.accessToken = token || null;
    window.activeAccount = account || null;
    window.isConnectedToExcel = !!(token && account);
}

function updateFallbackAuthUI(account) {
    const authStatus = document.getElementById('authStatus');
    const signInBtn = document.getElementById('signInBtn');
    const signOutBtn = document.getElementById('signOutBtn');

    if (authStatus) {
        authStatus.textContent = account?.username ? `Signed in as ${account.username}` : 'Not signed in';
    }
    if (signInBtn) signInBtn.style.display = account ? 'none' : 'inline-block';
    if (signOutBtn) signOutBtn.style.display = account ? 'inline-block' : 'none';

    if (typeof window.updateConnectionStatus === 'function') {
        window.updateConnectionStatus(!!account);
    }
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveSignedInRenderStrategy() {
    if (typeof window.loadTable === 'function') {
        return { type: 'loadTable' };
    }

    if (typeof window.renderAdventureCards === 'function' && Array.isArray(window.adventuresData) && window.adventuresData.length > 0) {
        return { type: 'renderAdventureCards' };
    }

    if (typeof window.renderPaginatedCards === 'function') {
        return { type: 'renderPaginatedCards' };
    }

    return null;
}

async function loadSignedInData() {
    logSuccess('loadSignedInData called - loading adventure data...');

    let strategy = resolveSignedInRenderStrategy();

    // Give late-bound globals a short window to finish exporting.
    if (!strategy) {
        for (let i = 0; i < 6 && !strategy; i += 1) {
            await delay(150);
            strategy = resolveSignedInRenderStrategy();
        }
    }

    if (!strategy) {
        const state = {
            readyState: document.readyState,
            hasLoadTable: typeof window.loadTable === 'function',
            hasRenderAdventureCards: typeof window.renderAdventureCards === 'function',
            hasRenderPaginatedCards: typeof window.renderPaginatedCards === 'function',
            adventureCount: Array.isArray(window.adventuresData) ? window.adventuresData.length : 0
        };
        logError('warn', 'No loadTable/render function available after sign-in. Cards may not render.', JSON.stringify(state));
    } else if (strategy.type === 'loadTable') {
        logSuccess('Calling window.loadTable()...');
        try {
            await window.loadTable();
            logSuccess('window.loadTable() completed');
        } catch (err) {
            logError('error', 'window.loadTable() threw error', err?.message || err);
        }
    } else if (strategy.type === 'renderAdventureCards') {
        logSuccess('Calling renderAdventureCards() with existing data...');
        try {
            window.renderAdventureCards(window.adventuresData);
        } catch (err) {
            logError('error', 'renderAdventureCards() threw error', err?.message || err);
        }
    } else if (strategy.type === 'renderPaginatedCards') {
        logSuccess('Calling window.renderPaginatedCards()...');
        try {
            window.renderPaginatedCards();
        } catch (err) {
            logError('error', 'window.renderPaginatedCards() threw error', err?.message || err);
        }
    }

    if (typeof window.initFindNearMe === 'function') window.initFindNearMe();
    if (typeof window.initContextMenu === 'function') window.initContextMenu();
    if (typeof window.initRowDetailModal === 'function') window.initRowDetailModal();
}

async function rehydrateFallbackAuth() {
    if (!fallbackMsalInstance) return false;

    const cachedAccount = fallbackMsalInstance.getActiveAccount() || fallbackMsalInstance.getAllAccounts?.()[0] || null;
    if (!cachedAccount) {
        syncFallbackAuthState(null, null);
        updateFallbackAuthUI(null);
        return false;
    }

    fallbackMsalInstance.setActiveAccount(cachedAccount);

    try {
        const tokenResponse = await fallbackMsalInstance.acquireTokenSilent({
            ...FALLBACK_LOGIN_REQUEST,
            account: cachedAccount
        });

        syncFallbackAuthState(tokenResponse?.accessToken || null, cachedAccount);
        updateFallbackAuthUI(cachedAccount);
        return !!tokenResponse?.accessToken;
    } catch (error) {
        logError('warn', 'Silent auth restore failed', error?.message || error);
        syncFallbackAuthState(null, cachedAccount);
        updateFallbackAuthUI(cachedAccount);
        return false;
    }
}

async function ensureFallbackAuth(forceRecreate = false) {
    if (!ENABLE_FALLBACK_AUTH) {
        logDebug('Fallback auth is disabled. Native window.signIn/window.signOut are required.');
        return false;
    }

    // If real auth handlers already exist, do not override them with fallback handlers.
    if (!forceRecreate &&
        typeof window.signIn === 'function' &&
        typeof window.signOut === 'function') {
        logDebug('Fallback auth skipped override: existing window.signIn/window.signOut preserved');
        return true;
    }

    if (forceRecreate) {
        fallbackMsalInitPromise = null;
        fallbackMsalInstance = null;
    }

    if (fallbackMsalInitPromise) {
        return fallbackMsalInitPromise;
    }

    if (!window.msal?.PublicClientApplication) {
        logError('error', 'MSAL browser library is not available for fallback auth');
        fallbackNotify('Microsoft sign-in library is missing on the page.', 'error', 6000);
        return false;
    }

    fallbackMsalInitPromise = (async () => {
        try {
            fallbackMsalInstance = window.msalInstance || new window.msal.PublicClientApplication(FALLBACK_MSAL_CONFIG);
            await fallbackMsalInstance.initialize();

            if (window.location.search.includes('code=') || window.location.search.includes('error=')) {
                try {
                    await fallbackMsalInstance.handleRedirectPromise();
                } catch (redirectError) {
                    logError('warn', 'Fallback redirect handling warning', redirectError?.message || redirectError);
                }
            }

            window.msalInstance = fallbackMsalInstance;

            window.rehydrateAuthState = async function () {
                await ensureFallbackAuth();
                return rehydrateFallbackAuth();
            };

            if (typeof window.signIn !== 'function') {
                window.signIn = async function () {
                    await ensureFallbackAuth();

                    const existingAccount = fallbackMsalInstance.getActiveAccount() || fallbackMsalInstance.getAllAccounts?.()[0] || null;
                    if (existingAccount) {
                        fallbackMsalInstance.setActiveAccount(existingAccount);
                        try {
                            const silentToken = await fallbackMsalInstance.acquireTokenSilent({
                                ...FALLBACK_LOGIN_REQUEST,
                                account: existingAccount
                            });
                            syncFallbackAuthState(silentToken?.accessToken || null, existingAccount);
                            updateFallbackAuthUI(existingAccount);
                            await loadSignedInData();
                            fallbackNotify('✓ Successfully signed in!', 'success', 3000);
                            return;
                        } catch (_silentError) {
                            logError('warn', 'Silent token acquisition failed, continuing to popup auth');
                        }
                    }

                    const loginResponse = await fallbackMsalInstance.loginPopup(FALLBACK_LOGIN_REQUEST);
                    const account = loginResponse?.account || fallbackMsalInstance.getActiveAccount();
                    if (!account) {
                        throw new Error('Microsoft account was not returned by loginPopup');
                    }

                    fallbackMsalInstance.setActiveAccount(account);
                    const tokenResponse = await fallbackMsalInstance.acquireTokenSilent({
                        ...FALLBACK_LOGIN_REQUEST,
                        account
                    });

                    syncFallbackAuthState(tokenResponse?.accessToken || null, account);
                    updateFallbackAuthUI(account);
                    await loadSignedInData();
                    fallbackNotify('✓ Successfully signed in!', 'success', 3000);
                };
            }

            if (typeof window.signOut !== 'function') {
                window.signOut = async function () {
                    await ensureFallbackAuth();
                    const account = fallbackMsalInstance.getActiveAccount() || fallbackMsalInstance.getAllAccounts?.()[0] || null;
                    syncFallbackAuthState(null, null);
                    updateFallbackAuthUI(null);

                    if (account) {
                        await fallbackMsalInstance.logoutPopup({
                            account,
                            postLogoutRedirectUri: window.location.origin
                        });
                    }
                };
            }

            const restored = await rehydrateFallbackAuth();
            logSuccess(`Fallback auth bootstrap ready${restored ? ' (restored cached session)' : ''}`);
            return true;
        } catch (error) {
            fallbackMsalInitPromise = null;
            logError('error', 'Fallback auth bootstrap failed', error?.message || error);
            fallbackNotify(`Microsoft sign-in setup failed: ${error?.message || error}`, 'error', 6000);
            return false;
        }
    })();

    return fallbackMsalInitPromise;
}

function checkAndFixSignIn() {
    if (typeof window.signIn !== 'function') {
        logDebug('signIn not ready yet - waiting for native app auth export');
    } else {
        logSuccess('signIn function exists');
    }
}

bootstrapAuthEarly();
