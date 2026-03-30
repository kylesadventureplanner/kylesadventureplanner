/**
 * Compatibility shim for legacy script name.
 *
 * Purpose:
 * - Preserve existing HTML references to `enhanced-automation-features.js`
 * - Load the current implementation `enhanced-automation-features-v2.js`
 *
 * Safety:
 * - No functional rewrite.
 * - Idempotent: avoids duplicate loads.
 */
(function () {
  var SHIM_FLAG = '__enhancedAutomationShimLoading';

  // If runtime is already available, do nothing.
  if (window.enhancedAutomation) {
    console.log('[compat] enhancedAutomation already available; shim no-op');
    return;
  }

  // Avoid duplicate injections.
  if (window[SHIM_FLAG]) {
    return;
  }
  window[SHIM_FLAG] = true;

  var current = document.currentScript;
  var targetSrc = '../JS Files/enhanced-automation-features-v2.js';

  // Resolve v2 path relative to this shim script URL when possible.
  if (current && current.src) {
    targetSrc = current.src.replace(/enhanced-automation-features\.js(\?.*)?$/, 'enhanced-automation-features-v2.js$1');
  }

  // If v2 is already queued/loaded, keep shim passive.
  var alreadyPresent = Array.prototype.some.call(document.scripts, function (s) {
    return !!s.src && s.src.indexOf('enhanced-automation-features-v2.js') !== -1;
  });

  if (alreadyPresent) {
    console.log('[compat] v2 script already present; shim no-op');
    window[SHIM_FLAG] = false;
    return;
  }

  var script = document.createElement('script');
  script.src = targetSrc;
  script.async = false; // preserve classic script execution ordering expectations

  script.onload = function () {
    console.log('[compat] loaded enhanced-automation-features-v2.js via shim');
    window[SHIM_FLAG] = false;
  };

  script.onerror = function () {
    console.error('[compat] failed to load enhanced-automation-features-v2.js from shim:', targetSrc);
    window[SHIM_FLAG] = false;
  };

  (document.head || document.documentElement).appendChild(script);
})();
