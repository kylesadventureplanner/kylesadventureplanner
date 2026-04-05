/**
 * Comprehensive Debug System for Adventure Planner
 * Logs all button clicks, state changes, and mutations
 * Version: 2.0.0 - Enhanced with more granular tracking
 * Purpose: Identify why buttons deactivate immediately and why sub-tab clicks don't work
 *
 * KEY TRACKING FEATURES:
 * - Button enable/disable state changes with stack traces
 * - Event listener registration/execution tracking
 * - DOM attribute change monitoring
 * - Class name changes (active/disabled states)
 * - Click event propagation and prevention
 * - Filter application timing
 * - Subtab interaction detection
 * - Console history replay (last 500 logs)
 */

(function initComprehensiveDebugSystem() {
  const DEBUG = true;
  const DEBUG_BUTTON_CLICKS = true;
  const DEBUG_MUTATIONS = true;
  const DEBUG_STATE_CHANGES = true;
  const DEBUG_ENABLE_REPLAY = true;

  const LOG_PREFIX = '[🔍 DEBUG]';
  const HISTORY_MAX = 500;
  let debugHistory = [];

  // Expose to window for debugging in console
  window.__debugSystem = {
    history: debugHistory,
    getHistory: () => debugHistory.slice(-20),
    getAllHistory: () => debugHistory,
    clearHistory: () => { debugHistory = []; },
    export: () => JSON.stringify(debugHistory, null, 2),
    replay: replayLastN
  };

  function log(...args) {
    if (DEBUG) {
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });
      const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
      console.log(`${LOG_PREFIX} [${timestamp}]`, ...args);

      // Store in history
      if (DEBUG_ENABLE_REPLAY) {
        debugHistory.push({
          timestamp,
          message: msg,
          level: 'info'
        });
        if (debugHistory.length > HISTORY_MAX) {
          debugHistory.shift();
        }
      }
    }
  }

  function logError(...args) {
    if (DEBUG) {
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });
      console.error(`${LOG_PREFIX} [${timestamp}] ❌`, ...args);

      if (DEBUG_ENABLE_REPLAY) {
        debugHistory.push({
          timestamp,
          message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '),
          level: 'error'
        });
        if (debugHistory.length > HISTORY_MAX) {
          debugHistory.shift();
        }
      }
    }
  }

  function logButton(msg, element) {
    if (DEBUG_BUTTON_CLICKS && element) {
      const id = element.id || 'no-id';
      const cls = element.className || 'no-class';
      log(`🖱️ BUTTON: ${msg} | id=${id} | class=${cls} | disabled=${element.disabled}`);
    }
  }

  function getStackTrace() {
    const stack = new Error().stack.split('\n').slice(2, 6);
    return stack.map(s => s.trim()).join('\n  ');
  }

  // ============================================================
  // SECTION 1: Global Button Click Interceptor
  // ============================================================

  function setupGlobalButtonClickLogger() {
    document.addEventListener('click', (event) => {
      const target = event.target;

      // Log clicks on adventure bulk action buttons
      if (target.matches('[id*="adventureBulk"]')) {
        logButton(`Clicked bulk action button`, target);

        // Log the state of all bulk action buttons
        setTimeout(() => {
          const buttons = document.querySelectorAll('[id*="adventureBulk"]');
          buttons.forEach(btn => {
            if (btn.id) {
              log(`  └─ ${btn.id}: disabled=${btn.disabled}, innerHTML="${btn.innerText}"`);
            }
          });
        }, 0);
      }

      // Log clicks on any button with "progress", "filter", or "period" in id/class
      if (target.tagName === 'BUTTON' &&
          (target.id?.includes('progress') ||
           target.id?.includes('filter') ||
           target.id?.includes('period') ||
           target.className?.includes('progress') ||
           target.className?.includes('filter') ||
           target.className?.includes('period'))) {
        logButton(`Clicked period/progress/filter button`, target);
      }

      // Log all buttons within adventure cards/sections
      if (target.closest('.adventure-card, .adventure-section, [id*="adventure"]')) {
        if (target.tagName === 'BUTTON' || target.type === 'checkbox') {
          logButton(`Clicked button in adventure element`, target);
        }
      }
    }, true);

    log('✅ Global button click logger initialized');
  }

  // ============================================================
  // SECTION 2: Adventure Bulk State Monitor
  // ============================================================

  function setupAdventureBulkStateMonitor() {
    setInterval(() => {
      const bulkActionCard = document.getElementById('adventureBulkActionsCard');
      const selectBtn = document.getElementById('adventureBulkSelectVisibleBtn');
      const applyTagsBtn = document.getElementById('adventureBulkApplyTagsBtn');
      const countEl = document.getElementById('adventureBulkSelectionCount');
      const scopeSelect = document.getElementById('adventureBulkSelectionScope');

      if (selectBtn || applyTagsBtn) {
        log(`📊 BULK STATE: scope=${scopeSelect?.value}, selectBtn.disabled=${selectBtn?.disabled}, applyTagsBtn.disabled=${applyTagsBtn?.disabled}, count=${countEl?.innerText}`);
      }
    }, 2000);

    log('✅ Adventure bulk state monitor initialized');
  }

  // ============================================================
  // SECTION 3: DOM Mutation Observer
  // ============================================================

  function setupMutationObserver() {
    if (!DEBUG_MUTATIONS) return;

    const observedElements = new Set();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const target = mutation.target;

        // Log changes to adventure bulk card
        if (target?.id === 'adventureBulkActionsCard' ||
            target?.id === 'adventureBulkSelectionCount') {
          log(`🔄 MUTATION: ${mutation.type} on ${target?.id || 'unknown'}`);

          if (mutation.type === 'characterData' || mutation.type === 'textContent') {
            log(`  └─ Text changed to: "${target?.innerText}"`);
          }

          if (mutation.attributeName === 'disabled') {
            log(`  └─ disabled attribute changed to: ${target?.disabled}`);
            log(`  └─ Stack: ${getStackTrace()}`);
          }
        }

        // Log changes to any button with disabled attribute
        if (target?.tagName === 'BUTTON' && mutation.attributeName === 'disabled') {
          const btnId = target?.id || target?.className || 'unknown';
          log(`🔴 BUTTON DISABLED CHANGED: ${btnId} | new value: ${target?.disabled}`);
          log(`  └─ Stack: ${getStackTrace()}`);
        }

        // Log changes to any element with id containing "bulk"
        if (target?.id?.includes('bulk') ||
            mutation.target?.className?.includes('bulk')) {
          if (mutation.attributeName === 'disabled' || mutation.attributeName === 'class') {
            log(`🔄 BULK MUTATION: ${mutation.type} | ${mutation.attributeName} | target=${mutation.target?.id || mutation.target?.className}`);
          }
        }
      });
    });

    // Observe the bulk actions card and all buttons
    const bulkCard = document.getElementById('adventureBulkActionsCard');
    if (bulkCard) {
      observer.observe(bulkCard, {
        attributes: true,
        attributeFilter: ['disabled', 'class'],
        subtree: true,
        characterData: true,
        childList: true
      });
    }

    // Also observe the adventure cards grid for changes
    const grid = document.getElementById('adventureCardsGrid');
    if (grid) {
      observer.observe(grid, {
        attributes: true,
        attributeFilter: ['class', 'data-source-index'],
        subtree: true,
        childList: true
      });
    }

    log('✅ Mutation observer initialized');
  }

  // ============================================================
  // SECTION 4: Element Focus Tracker
  // ============================================================

  function setupFocusTracker() {
    document.addEventListener('focus', (event) => {
      if (event.target.id?.includes('bulk') ||
          event.target.id?.includes('adventureBulk') ||
          event.target.className?.includes('adventure')) {
        log(`👁️ FOCUS: ${event.target.id || event.target.className}`);
      }
    }, true);

    document.addEventListener('blur', (event) => {
      if (event.target.id?.includes('bulk') ||
          event.target.id?.includes('adventureBulk')) {
        log(`👁️ BLUR: ${event.target.id}`);
      }
    }, true);

    log('✅ Focus tracker initialized');
  }

  // ============================================================
  // SECTION 5: Event Listener Debugger & Disabled Property Interceptor
  // ============================================================

  function setupEventListenerDebugger() {
    // Override addEventListener for bulk buttons
    const bulkButtons = [
      'adventureBulkSelectVisibleBtn',
      'adventureBulkApplyTagsBtn',
      'adventureBulkApplyRatingBtn',
      'adventureBulkMarkFavoriteBtn',
      'adventureBulkUnmarkFavoriteBtn',
      'adventureBulkMarkVisitedBtn',
      'adventureBulkUnmarkVisitedBtn',
      'adventureBulkClearSelectionBtn',
      'adventureBulkInvertSelectionBtn'
    ];

    bulkButtons.forEach((btnId) => {
      setTimeout(() => {
        const btn = document.getElementById(btnId);
        if (!btn) {
          log(`⚠️ MISSING BUTTON: ${btnId}`);
          return;
        }

        // Intercept disabled property changes
        const originalDisabledDesc = Object.getOwnPropertyDescriptor(HTMLButtonElement.prototype, 'disabled');

        Object.defineProperty(btn, 'disabled', {
          get() {
            return originalDisabledDesc?.get?.call(this) ?? false;
          },
          set(value) {
            const oldValue = this.hasAttribute('disabled');
            log(`🚨 DISABLED PROPERTY SET: ${btnId} | ${oldValue} → ${value}`);
            log(`  └─ Stack: ${getStackTrace()}`);
            if (originalDisabledDesc?.set) {
              originalDisabledDesc.set.call(this, value);
            } else {
              if (value) {
                this.setAttribute('disabled', '');
              } else {
                this.removeAttribute('disabled');
              }
            }
          },
          configurable: true
        });

        // Wrap the button's native click handler
        const originalAddEventListener = btn.addEventListener;
        btn.addEventListener = function(type, listener, options) {
          if (type === 'click') {
            log(`📍 Event listener registered: ${btnId} - click`);

            // Wrap the listener to track execution
            const wrappedListener = function(event) {
              log(`🎯 EVENT FIRING: ${btnId} - click event`);
              const beforeDisabled = btn.disabled;
              const result = listener.call(this, event);
              const afterDisabled = btn.disabled;
              log(`  └─ After listener: disabled changed from ${beforeDisabled} to ${afterDisabled}`);
              return result;
            };

            return originalAddEventListener.call(this, type, wrappedListener, options);
          }
          return originalAddEventListener.call(this, type, listener, options);
        };

        log(`✅ Wrapped addEventListener for ${btnId}`);
      }, 500);
    });
  }

  // ============================================================
  // SECTION 6: Tab Click Detector
  // ============================================================

  function setupTabClickDetector() {
    document.addEventListener('click', (event) => {
      const target = event.target;

      // Look for tab buttons and subtab buttons
      if (target.closest('[role="tab"], .tab-btn, [id*="tab"], [class*="subtab"]')) {
        const tabElement = target.closest('[role="tab"], .tab-btn, [id*="tab"], [class*="subtab"]');
        log(`📑 TAB/SUBTAB CLICK: id=${tabElement?.id || 'none'} | class=${tabElement?.className || 'none'}`);

        // Log element details
        log(`  └─ tagName=${tabElement?.tagName}, href=${tabElement?.getAttribute('href') || 'none'}`);
        log(`  └─ aria-selected=${tabElement?.getAttribute('aria-selected') || 'none'}`);

        // Log if this is preventing default behavior
        if (event.defaultPrevented) {
          log(`  └─ ⚠️ DEFAULT PREVENTED by handler!`);
        }

        // Log event details
        log(`  └─ Event bubbles=${event.bubbles}, cancelable=${event.cancelable}`);
        log(`  └─ Stack: ${getStackTrace()}`);
      }
    }, true);

    log('✅ Tab click detector initialized');
  }

  // ============================================================
  // SECTION 7: Filter Change Tracker
  // ============================================================

  function setupFilterChangeTracker() {
    document.addEventListener('change', (event) => {
      const target = event.target;

      if (target.id?.includes('filter') ||
          target.id?.includes('bulk') ||
          target.id?.includes('progress')) {
        log(`⚙️ FILTER CHANGE: ${target.id} = ${target.value || target.checked}`);
      }
    }, true);

    log('✅ Filter change tracker initialized');
  }

  // ============================================================
  // SECTION 8: Selection State Logger
  // ============================================================

  function setupSelectionStateLogger() {
    setInterval(() => {
      // Check all checkboxes
      const checkboxes = document.querySelectorAll('.adventure-bulk-select');
      if (checkboxes.length > 0) {
        const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
        log(`✓ Checked boxes: ${checked}/${checkboxes.length}`);
      }

      // Check if bulk state object exists in window
      if (window.adventureState) {
        log(`📦 adventureState.selectedSourceIndexes.size: ${window.adventureState.selectedSourceIndexes?.size || 'undefined'}`);
        log(`📦 adventureState.busy: ${window.adventureState?.busy || 'undefined'}`);
      }
    }, 3000);

    log('✅ Selection state logger initialized');
  }

  // ============================================================
  // SECTION 9: History Replay Function
  // ============================================================

  function replayLastN(n = 10) {
    const lastN = debugHistory.slice(-n);
    console.group(`📜 Replaying Last ${n} Debug Logs`);
    lastN.forEach((entry, index) => {
      console.log(`[${index + 1}] ${entry.timestamp} | ${entry.message}`);
    });
    console.groupEnd();
    return lastN;
  }

  // ============================================================
  // INITIALIZATION
  // ============================================================

  function init() {
    log('🚀 COMPREHENSIVE DEBUG SYSTEM STARTING');

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setupGlobalButtonClickLogger();
        setupAdventureBulkStateMonitor();
        setupMutationObserver();
        setupFocusTracker();
        setupEventListenerDebugger();
        setupTabClickDetector();
        setupFilterChangeTracker();
        setupSelectionStateLogger();

        log('✅ ALL DEBUG SYSTEMS INITIALIZED');
      });
    } else {
      setupGlobalButtonClickLogger();
      setupAdventureBulkStateMonitor();
      setupMutationObserver();
      setupFocusTracker();
      setupEventListenerDebugger();
      setupTabClickDetector();
      setupFilterChangeTracker();
      setupSelectionStateLogger();

      log('✅ ALL DEBUG SYSTEMS INITIALIZED');
    }
  }

  // Start immediately
  init();
})();

