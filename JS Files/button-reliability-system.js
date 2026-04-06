/**
 * ULTIMATE BUTTON RELIABILITY SYSTEM - v1.0.2 (CLEAN REBUILD)
 * Ensures 100% button responsiveness through multiple layers of protection.
 *
 * NOTE: This file was rebuilt on 2026-04-05.
 * The prior version was corrupted (syntax error at line 40) and failed to load entirely.
 */
(function () {
  'use strict';

  const SYSTEM = {
    initialized: false,
    mutationObserverRunning: false,
    hoverTrackingActive: false,
    clickInterceptionActive: false,
    debugModeEnabled: false,
    lastHoveredButton: null,
    lastClickedButton: null,
    buttonStates: new Map(),
    eventLog: [],
    maxLogSize: 200,
    healthCheckInterval: null,
    _scanPending: false,
    stats: {
      totalButtonsTracked: 0,
      hoverEventsDetected: 0,
      clickEventsDetected: 0,
      interferedClicks: 0,
      repairsAttempted: 0,
      repairsSuccessful: 0,
      buttonsWithIssues: 0
    }
  };

  // ============================================================
  // LOGGING
  // ============================================================

  function log(level, message, data) {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${timestamp}] 🔘 ${message}`;
    SYSTEM.eventLog.push({ timestamp: Date.now(), level, message, data: data || null });
    if (SYSTEM.eventLog.length > SYSTEM.maxLogSize) SYSTEM.eventLog.shift();

    if (SYSTEM.debugModeEnabled) {
      if (level === 'warn') console.warn(prefix, data || '');
      else if (level === 'error') console.error(prefix, data || '');
      else console.log(prefix, data || '');
    }
  }

  // ============================================================
  // BUTTON INSPECTION
  // ============================================================

  function checkButtonIssues(button) {
    if (!button) return { hasIssues: false };
    const cs = window.getComputedStyle(button);
    const hasPointerEventsIssue = cs.pointerEvents === 'none' && !button.disabled;
    const hasOpacityIssue = parseFloat(cs.opacity) < 0.1 && !button.disabled;
    return {
      hasIssues: hasPointerEventsIssue || hasOpacityIssue,
      hasPointerEventsIssue,
      hasOpacityIssue,
      isHidden: cs.visibility === 'hidden' || cs.display === 'none',
      pointerEvents: cs.pointerEvents,
      opacity: cs.opacity,
      visibility: cs.visibility,
      display: cs.display
    };
  }

  // ============================================================
  // BUTTON REPAIR
  // ============================================================

  function repairButton(button) {
    if (!button) return false;
    SYSTEM.stats.repairsAttempted++;
    const issues = checkButtonIssues(button);
    if (!issues.hasIssues) return true;

    log('warn', `Repairing button: ${button.id || button.textContent.trim().substring(0, 30)}`, issues);
    if (issues.hasPointerEventsIssue) button.style.pointerEvents = 'auto';
    if (issues.hasOpacityIssue) button.style.opacity = '1';

    const after = checkButtonIssues(button);
    if (!after.hasIssues) { SYSTEM.stats.repairsSuccessful++; return true; }
    return false;
  }

  // ============================================================
  // SCAN & TRACK
  // ============================================================

  function scanAndRepairAllButtons() {
    const buttons = document.querySelectorAll('button');
    SYSTEM.stats.totalButtonsTracked = buttons.length;
    SYSTEM.stats.buttonsWithIssues = 0;

    neutralizeStaleOverlays();

    buttons.forEach((button) => {
      if (button.disabled) return;
      const issues = checkButtonIssues(button);
      if (issues.hasIssues && !issues.isHidden) {
        SYSTEM.stats.buttonsWithIssues++;
        repairButton(button);
      }

      if (!button.dataset.reliabilityTracked) {
        button.addEventListener('mouseenter', () => {
          SYSTEM.lastHoveredButton = button;
          SYSTEM.stats.hoverEventsDetected++;
        });
        button.addEventListener('click', () => {
          SYSTEM.lastClickedButton = button;
          SYSTEM.stats.clickEventsDetected++;
        });
        button.dataset.reliabilityTracked = '1';
      }
    });

    return SYSTEM.stats;
  }

  function normalizeInteractiveTargetFromEvent(event) {
    const target = event && event.target && event.target.closest ? event.target.closest('button, [role="button"], .btn, .button') : null;
    if (!target) return;

    const computed = window.getComputedStyle(target);
    const ariaDisabled = String(target.getAttribute('aria-disabled') || '').toLowerCase() === 'true';
    const nativeDisabled = Boolean(target.disabled);

    // Only normalize clickable targets; keep intentionally disabled controls untouched.
    if (!ariaDisabled && !nativeDisabled && computed.pointerEvents === 'none') {
      target.style.pointerEvents = 'auto';
      SYSTEM.stats.repairsAttempted++;
      SYSTEM.stats.repairsSuccessful++;
      if (SYSTEM.debugModeEnabled) {
        log('warn', `Normalized pointer-events for interactive target: ${target.id || target.className || target.tagName}`);
      }
    }
  }

  // ============================================================
  // OVERLAY SAFETY
  // ============================================================

  function neutralizeStaleOverlays() {
    const overlaySelectors = [
      '#loadingOverlay',
      '.modal-backdrop',
      '[id$="Backdrop"]',
      '#contextMenu',
      '#cardContextMenu'
    ].join(', ');

    document.querySelectorAll(overlaySelectors).forEach((el) => {
      const cs = window.getComputedStyle(el);
      const isHiddenByStyle = cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity || '1') === 0;
      const startupComplete = el.classList.contains('startup-complete') || el.dataset.startupLock === '0';
      const isInactiveContextMenu = (el.id === 'contextMenu' || el.id === 'cardContextMenu') && !el.classList.contains('visible');

      if (isHiddenByStyle || startupComplete || isInactiveContextMenu) {
        if (el.style.pointerEvents !== 'none') el.style.pointerEvents = 'none';
      }
    });
  }

  // ============================================================
  // BLOCKING OVERLAY DETECTION
  // ============================================================

  function detectBlockingOverlays() {
    const checkPoints = [
      { x: window.innerWidth * 0.25, y: window.innerHeight * 0.3, label: 'left area' },
      { x: window.innerWidth * 0.5, y: window.innerHeight * 0.3, label: 'center area' },
      { x: window.innerWidth * 0.75, y: window.innerHeight * 0.3, label: 'right area' },
      { x: window.innerWidth * 0.5, y: window.innerHeight * 0.6, label: 'lower center' }
    ];

    const seen = new Set();
    const blockers = [];

    checkPoints.forEach((point) => {
      const el = document.elementFromPoint(point.x, point.y);
      if (!el) return;
      const suspect = (el.closest ? el.closest('#loadingOverlay, .modal-backdrop, [id$="Backdrop"], #contextMenu, #cardContextMenu') : null) || el;
      if (seen.has(suspect)) return;

      const cs = window.getComputedStyle(suspect);
      const isVisible = cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity || '1') > 0.1;
      const blocksPointer = cs.pointerEvents !== 'none';
      const isOverlayLike =
        suspect.id === 'loadingOverlay' ||
        suspect.classList.contains('modal-backdrop') ||
        (suspect.id && suspect.id.endsWith('Backdrop')) ||
        suspect.id === 'contextMenu' ||
        suspect.id === 'cardContextMenu';

      if (isVisible && blocksPointer && isOverlayLike) {
        seen.add(suspect);
        blockers.push({ element: suspect, id: suspect.id || '(no id)', classes: Array.from(suspect.classList).join(' '), area: point.label });
      }
    });

    return blockers;
  }

  // ============================================================
  // INITIALIZATION
  // ============================================================

  function getShortStack() {
    try {
      return String(new Error().stack || '')
        .split('\n')
        .slice(2, 6)
        .map((line) => line.trim())
        .join(' | ');
    } catch (_err) {
      return '';
    }
  }

  function initialize() {
    if (SYSTEM.initialized) return;
    SYSTEM.initialized = true;

    scanAndRepairAllButtons();

    SYSTEM.healthCheckInterval = setInterval(scanAndRepairAllButtons, 5000);

    if (window.MutationObserver && document.body) {
      const observer = new MutationObserver((mutations) => {
        for (let i = 0; i < mutations.length; i += 1) {
          const m = mutations[i];
          if (m.type === 'attributes' && m.target && m.target.tagName === 'BUTTON' && (m.attributeName === 'disabled' || m.attributeName === 'class' || m.attributeName === 'style')) {
            if (SYSTEM.debugModeEnabled) {
              log('info', `Button attribute changed (${m.attributeName}): ${m.target.id || m.target.className || '(unnamed button)'}`, {
                disabled: Boolean(m.target.disabled),
                className: m.target.className,
                stack: getShortStack()
              });
            }
          }
        }

        if (SYSTEM._scanPending) return;
        SYSTEM._scanPending = true;
        setTimeout(() => { SYSTEM._scanPending = false; scanAndRepairAllButtons(); }, 150);
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class', 'disabled', 'aria-disabled']
      });
      SYSTEM.mutationObserverRunning = true;
    }

    // Normalize interactivity as early as possible for dynamically created controls.
    ['pointerdown', 'mousedown', 'touchstart', 'mouseover', 'click', 'focusin'].forEach((type) => {
      document.addEventListener(type, normalizeInteractiveTargetFromEvent, true);
    });

    log('info', '✅ Button Reliability System v1.0.2 initialized', { buttonsFound: SYSTEM.stats.totalButtonsTracked });
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  window.ButtonReliability = {
    testButton(buttonId) {
      const button = document.getElementById(buttonId) || document.querySelector(`[data-id="${buttonId}"]`);
      if (!button) { console.warn(`❌ Button not found: ${buttonId}`); return false; }
      return repairButton(button);
    },

    scanAllButtons() {
      scanAndRepairAllButtons();
      return SYSTEM.stats;
    },

    detectBlockingOverlays() {
      const blockers = detectBlockingOverlays();
      if (blockers.length === 0) {
        console.log('✅ ButtonReliability: No blocking overlays detected');
      } else {
        console.warn('⚠️ ButtonReliability: BLOCKING OVERLAYS DETECTED:');
        blockers.forEach((b) => console.warn(`  → #${b.id} in ${b.area} | classes: "${b.classes}"`));
      }
      return blockers;
    },

    forceFixBlockingOverlays() {
      const blockers = detectBlockingOverlays();
      blockers.forEach((b) => {
        console.log(`🔧 ButtonReliability: Force-hiding blocking overlay: #${b.id}`);
        b.element.style.display = 'none';
        b.element.style.pointerEvents = 'none';
        b.element.style.zIndex = '-1';
      });
      return blockers.length;
    },

    getEventLog(limit) { return SYSTEM.eventLog.slice(-(limit || 50)); },
    clearEventLog() { SYSTEM.eventLog = []; },
    setDebugMode(enabled) {
      SYSTEM.debugModeEnabled = Boolean(enabled);
      console.log(`🔘 ButtonReliability debug mode: ${SYSTEM.debugModeEnabled ? 'ON' : 'OFF'}`);
    },

    getAllButtonStates() {
      const states = [];
      SYSTEM.buttonStates.forEach((state) => {
        states.push({
          id: state.id,
          text: state.element ? state.element.textContent.trim().substring(0, 50) : '',
          isHovered: state.isHovered,
          clicksDetected: state.clicksDetected,
          hasIssues: state.hasPointerEventsIssue || state.hasOpacityIssue,
          isRepaired: state.isRepaired
        });
      });
      return states;
    },

    getStatus() {
      return {
        initialized: SYSTEM.initialized,
        mutationObserverRunning: SYSTEM.mutationObserverRunning,
        stats: { ...SYSTEM.stats },
        lastHoveredButton: SYSTEM.lastHoveredButton
          ? (SYSTEM.lastHoveredButton.id || SYSTEM.lastHoveredButton.textContent.trim().substring(0, 30))
          : null,
        lastClickedButton: SYSTEM.lastClickedButton
          ? (SYSTEM.lastClickedButton.id || SYSTEM.lastClickedButton.textContent.trim().substring(0, 30))
          : null
      };
    },

    /**
     * Full diagnostic — run this in the browser console when buttons don't work.
     * Usage: ButtonReliability.diagnose()
     */
    diagnose() {
      console.group('🔘 Button Reliability Full Diagnostic');
      console.log('System status:', this.getStatus());

      const blockers = detectBlockingOverlays();
      if (blockers.length > 0) {
        console.warn('⚠️ BLOCKING OVERLAYS FOUND — these are covering the UI:');
        blockers.forEach((b) => console.warn(`  → #${b.id} (${b.area})`));
        console.log('→ Fix: ButtonReliability.forceFixBlockingOverlays()');
      } else {
        console.log('✅ No blocking overlays found');
      }

      neutralizeStaleOverlays();

      // Check loadingOverlay specifically
      const lo = document.getElementById('loadingOverlay');
      if (lo) {
        const loCs = window.getComputedStyle(lo);
        if (loCs.display !== 'none' && loCs.visibility !== 'hidden') {
          console.warn('⚠️ #loadingOverlay is still VISIBLE — it may be blocking the entire page!');
          console.warn('   display:', loCs.display, '| visibility:', loCs.visibility, '| opacity:', loCs.opacity, '| data-startup-lock:', lo.dataset.startupLock);
          console.log('→ Fix: document.getElementById("loadingOverlay").style.display = "none"');
        }
      }

      const buttons = document.querySelectorAll('button:not(:disabled)');
      let issueCount = 0;
      buttons.forEach((btn) => {
        const issues = checkButtonIssues(btn);
        if (issues.hasIssues) {
          issueCount++;
          console.warn(`⚠️ Button CSS issue: "${btn.id || btn.textContent.trim().substring(0, 30)}"`, issues);
        }
      });

      if (issueCount === 0) console.log(`✅ All ${buttons.length} enabled buttons have correct pointer-events`);
      else console.warn(`⚠️ ${issueCount}/${buttons.length} enabled buttons have CSS pointer-event issues`);

      console.groupEnd();
    }
  };

  // ============================================================
  // BOOT
  // ============================================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }

})();
