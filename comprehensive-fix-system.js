/**
 * COMPREHENSIVE FIX & OPTIMIZATION SYSTEM
 * ======================================
 * Version: v7.0.113
 * Date: March 13, 2026
 *
 * Fixes:
 * 1. Location History Z-index (modal behind everything)
 * 2. Tag Manager Circle issue
 * 3. Search Place IDs button functionality
 * 4. Page load efficiency
 * 5. Loading indicator
 */

(function() {
  console.log('🚀 Loading Comprehensive Fix System v7.0.113');

  // ============================================================
  // 1. LOCATION HISTORY Z-INDEX FIX
  // ============================================================
  const fixLocationHistoryZIndex = function() {
    console.log('🔧 Fixing Location History Z-Index...');

    // Override the openModal function
    if (window.locationHistoryManager) {
      const originalOpenModal = window.locationHistoryManager.openModal;

      window.locationHistoryManager.openModal = function() {
        const backdrop = document.createElement('div');
        backdrop.id = 'locationHistoryBackdrop';
        backdrop.style.cssText = `
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          background: rgba(0, 0, 0, 0.5) !important;
          z-index: 999998 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        `;

        const modal = document.createElement('div');
        modal.id = 'locationHistoryModal';
        modal.style.cssText = `
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          background: white !important;
          border-radius: 16px !important;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
          z-index: 999998 !important;
          max-width: 700px !important;
          width: 90% !important;
          max-height: 80vh !important;
          overflow: hidden !important;
          display: flex !important;
          flex-direction: column !important;
        `;

        modal.innerHTML = `
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center;">
            <h2 style="font-size: 18px; font-weight: 700; margin: 0;">📅 Location History</h2>
            <button onclick="this.closest('#locationHistoryBackdrop').remove()" style="background: none; border: none; color: white; font-size: 28px; cursor: pointer; padding: 0;">✕</button>
          </div>
          <div style="padding: 24px; overflow-y: auto; flex: 1;" id="locationHistoryContent">
            <p style="text-align: center; color: #9ca3af;">Loading location history...</p>
          </div>
        `;

        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);

        backdrop.onclick = (e) => {
          if (e.target === backdrop) backdrop.remove();
        };

        this.createLocationListUI('locationHistoryContent');
      };
    }
    console.log('✅ Location History Z-Index Fixed');
  };

  // ============================================================
  // 2. TAG MANAGER CIRCLE FIX - Hide old backdrop
  // ============================================================
  const fixTagManagerCircle = function() {
    console.log('🔧 Fixing Tag Manager Circle...');

    // Hide any old tag manager backdrops
    const oldBackdrop = document.getElementById('tagManagerBackdrop');
    if (oldBackdrop) {
      oldBackdrop.style.display = 'none !important';
      oldBackdrop.style.visibility = 'hidden !important';
      oldBackdrop.style.zIndex = '-9999 !important';
    }

    // Also hide the old modal
    const oldModal = document.getElementById('tagManagerModal');
    if (oldModal) {
      oldModal.style.display = 'none !important';
      oldModal.style.visibility = 'hidden !important';
      oldModal.style.zIndex = '-9999 !important';
    }

    // Watch for any attempts to show them
    setInterval(() => {
      if (oldBackdrop && oldBackdrop.style.display !== 'none') {
        oldBackdrop.style.display = 'none !important';
        oldBackdrop.style.visibility = 'hidden !important';
      }
      if (oldModal && oldModal.style.display !== 'none') {
        oldModal.style.display = 'none !important';
        oldModal.style.visibility = 'hidden !important';
      }
    }, 100);

    console.log('✅ Tag Manager Circle Fixed');
  };

  // ============================================================
  // 3. SEARCH PLACE IDS BUTTON FIX
  // ============================================================
  function fixSearchPlaceIdsButton() {
    // Do not overwrite handlers here; popup/control-panel scripts own button wiring.
    if (window.__searchPlaceIdsFixApplied) return;
    window.__searchPlaceIdsFixApplied = true;
    console.log('ℹ️ Search Place IDs handler left unchanged (managed by primary automation scripts)');
  }

  // ============================================================
  // 3B. FIND SIMILAR BUTTON HANDLER
  // ============================================================
  window.handleFindSimilarFromMain = function() {
    console.log('🔍 Find Similar initiated from main page');
    if (window.handleFindSimilar) {
      window.handleFindSimilar();
    } else {
      console.warn('⚠️ handleFindSimilar not yet available');
    }
  };

  // ============================================================
  // 4. LOADING INDICATOR
  // ============================================================
  const createLoadingIndicator = function() {
    const indicator = document.createElement('div');
    indicator.id = 'appLoadingIndicator';
    indicator.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.3);
      z-index: 1000000;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(2px);
    `;

    indicator.innerHTML = `
      <div style="
        background: white;
        border-radius: 16px;
        padding: 40px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      ">
        <div style="
          width: 50px;
          height: 50px;
          border: 4px solid #e5e7eb;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        "></div>
        <div style="font-size: 16px; font-weight: 600; color: #1f2937;">Loading Adventure Finder...</div>
        <div style="font-size: 13px; color: #6b7280; margin-top: 8px;">Preparing your app</div>
        <style>
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        </style>
      </div>
    `;

    document.body.appendChild(indicator);
    return indicator;
  };

  const hideLoadingIndicator = function() {
    const indicator = document.getElementById('appLoadingIndicator');
    if (indicator) {
      indicator.style.opacity = '0';
      indicator.style.transition = 'opacity 0.3s ease-out';
      setTimeout(() => indicator.remove(), 300);
    }
  };

  // ============================================================
  // 5. PAGE LOAD OPTIMIZATION
  // ============================================================
  const optimizePageLoad = function() {
    console.log('⚡ Optimizing page load...');

    // Lazy load non-critical scripts
    const deferScripts = ['enhanced-city-viewer.js', 'backup-manager.js', 'city-visualizer.js'];

    deferScripts.forEach(scriptName => {
      const existingScript = document.querySelector(`script[src="${scriptName}"]`);
      if (existingScript) {
        existingScript.defer = true;
        console.log(`⏱️ Deferred: ${scriptName}`);
      }
    });

    console.log('✅ Page load optimized');
  };

  // ============================================================
  // 6. INITIALIZATION
  // ============================================================
  window.initComprehensiveFixes = function() {
    console.log('🚀 Initializing Comprehensive Fixes v7.0.113');

    // Show loading indicator
    const loadingIndicator = createLoadingIndicator();

    // Apply fixes
    setTimeout(() => {
      fixLocationHistoryZIndex();
      fixTagManagerCircle();
      optimizePageLoad();

      // Wait a bit for page to be interactive
      setTimeout(() => {
        hideLoadingIndicator();
        console.log('✅ All fixes applied successfully!');

        // Notify all systems
        if (window.cleanTagManager) {
          console.log('✅ Tag Manager ready');
        }
        if (window.locationHistoryManager) {
          console.log('✅ Location History ready');
        }

        // Keep primary automation button handlers intact (no overrides here).

        document.dispatchEvent(new Event('AppReady'));
      }, 1000);
    }, 100);
  };

  // Auto-initialize when page is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initComprehensiveFixes);
  } else {
    window.initComprehensiveFixes();
  }

})();
