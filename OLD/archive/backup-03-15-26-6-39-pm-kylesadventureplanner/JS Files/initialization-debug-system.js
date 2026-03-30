/**
 * INITIALIZATION & DEBUG SYSTEM - v7.0.114
 * ========================================
 * Ensures all systems load properly and logs what's happening
 * Version: v7.0.114
 * Date: March 13, 2026
 */

(function() {
  console.log('🚀🚀🚀 INITIALIZATION SYSTEM STARTING 🚀🚀🚀');

  const initLog = [];

  // Helper to log initialization
  const logInit = (msg) => {
    console.log(`✅ ${msg}`);
    initLog.push(msg);
  };

  // ============================================================
  // CHECK SYSTEM INITIALIZATION
  // ============================================================

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
  };

  // ============================================================
  // REGISTER BUTTON HANDLERS
  // ============================================================

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

  // ============================================================
  // FIX SPECIFIC ISSUES
  // ============================================================

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

  // ============================================================
  // SHOW STATUS SUMMARY
  // ============================================================

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

    document.body.appendChild(statusDiv);
  };

  // ============================================================
  // MAIN INITIALIZATION
  // ============================================================

  const initialize = function() {
    console.clear();
    console.log('🎯 STARTING v7.0.114 INITIALIZATION SYSTEM\n');

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
  };

  // ============================================================
  // TRIGGER INITIALIZATION
  // ============================================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initialize, 500);
    });
  } else {
    setTimeout(initialize, 500);
  }

  // Also expose for manual trigger
  window.debugInit = initialize;
  window.logInit = logInit;
})();

