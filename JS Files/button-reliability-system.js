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
    blockedInteractionLog: [],
    maxLogSize: 200,
    maxBlockedLogSize: 80,
    healthCheckInterval: null,
    _scanPending: false,
    stats: {
      totalButtonsTracked: 0,
      hoverEventsDetected: 0,
      clickEventsDetected: 0,
      interferedClicks: 0,
      blockedInteractionsDetected: 0,
      repairsAttempted: 0,
      repairsSuccessful: 0,
      buttonsWithIssues: 0,
      updateBannerShown: 0,
      updateBannerReloadClicked: 0,
      updateBannerDismissClicked: 0
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

  function capBlockedInteractionLog() {
    if (SYSTEM.blockedInteractionLog.length > SYSTEM.maxBlockedLogSize) {
      SYSTEM.blockedInteractionLog.splice(0, SYSTEM.blockedInteractionLog.length - SYSTEM.maxBlockedLogSize);
    }
  }

  function getInteractiveSelector() {
    return 'button, [role="button"], a[href], input:not([type="hidden"]), select, textarea, summary, .pill-button, .planner-top-btn, .nature-explore-birds-btn, .nature-command-btn, .quick-filter-btn, .card-btn, .action-btn';
  }

  function describeElement(element) {
    if (!element) return null;
    const rect = typeof element.getBoundingClientRect === 'function' ? element.getBoundingClientRect() : null;
    return {
      tag: element.tagName ? String(element.tagName).toLowerCase() : '',
      id: element.id || '',
      className: element.className ? String(element.className).slice(0, 180) : '',
      text: element.textContent ? String(element.textContent).replace(/\s+/g, ' ').trim().slice(0, 120) : '',
      pointerEvents: window.getComputedStyle ? window.getComputedStyle(element).pointerEvents : '',
      rect: rect ? {
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      } : null
    };
  }

  function getActiveTabId() {
    const pane = document.querySelector('.app-tab-pane.active[data-tab]');
    if (pane) return String(pane.getAttribute('data-tab') || '');
    const button = document.querySelector('.app-tab-btn.active[data-tab]');
    return button ? String(button.getAttribute('data-tab') || '') : '';
  }

  function recordBlockedInteraction(kind, event, target, blocker, stack) {
    const entry = {
      at: new Date().toISOString(),
      kind: String(kind || 'blocked-interaction'),
      eventType: event && event.type ? String(event.type) : '',
      activeTab: getActiveTabId(),
      pointerType: event && event.pointerType ? String(event.pointerType) : '',
      x: event && Number.isFinite(event.clientX) ? Math.round(event.clientX) : null,
      y: event && Number.isFinite(event.clientY) ? Math.round(event.clientY) : null,
      target: describeElement(target),
      blocker: describeElement(blocker),
      stack: Array.isArray(stack) ? stack.slice(0, 6).map(describeElement) : []
    };

    SYSTEM.stats.blockedInteractionsDetected += 1;
    SYSTEM.stats.interferedClicks += 1;
    SYSTEM.blockedInteractionLog.push(entry);
    capBlockedInteractionLog();
    log('warn', 'Blocked interactive attempt detected', entry);

    try {
      window.dispatchEvent(new CustomEvent('reliability:overlay-interception', {
        detail: {
          buttonId: entry.target && entry.target.id ? entry.target.id : '',
          blockedPointCount: entry.stack.length,
          kind: entry.kind,
          activeTab: entry.activeTab
        }
      }));
    } catch (_error) {
      // Ignore telemetry event issues.
    }
  }

  function inspectInteractionPath(event) {
    // Synthetic .click() / keyboard activations can report (0,0) and topElement=body/html.
    // Those are not real pointer interceptions and should not increment overlay telemetry.
    if (event && event.type === 'click') {
      const syntheticLike = event.isTrusted === false;
      const keyboardLike = Number(event.detail || 0) === 0 && !Number.isFinite(event.clientX) && !Number.isFinite(event.clientY);
      const zeroPointLike = Number(event.clientX || 0) === 0 && Number(event.clientY || 0) === 0 && Number(event.detail || 0) === 0;
      if (syntheticLike || keyboardLike || zeroPointLike) return;
    }

    if (!event || !Number.isFinite(event.clientX) || !Number.isFinite(event.clientY) || typeof document.elementsFromPoint !== 'function') return;

    const interactiveSelector = getInteractiveSelector();
    const stack = document.elementsFromPoint(event.clientX, event.clientY) || [];
    if (!stack.length) return;

    const topElement = stack[0] || null;
    const directTarget = event.target && event.target.closest ? event.target.closest(interactiveSelector) : null;
    const intendedTarget = directTarget || stack
      .map((node) => (node && node.closest ? node.closest(interactiveSelector) : null))
      .find(Boolean);

    if (!intendedTarget || !topElement) return;
    if (topElement === intendedTarget || intendedTarget.contains(topElement)) return;

    const blocker = topElement.closest
      ? (topElement.closest('#loadingOverlay, .modal-backdrop, [id$="Backdrop"], #rowDetailModal, #contextMenu, #tagContextMenu, #cardContextMenu, .tab-loading-indicator') || topElement)
      : topElement;

    const blockerStyle = window.getComputedStyle ? window.getComputedStyle(blocker) : null;
    const blocksPointer = !blockerStyle || blockerStyle.pointerEvents !== 'none';
    const visible = !blockerStyle || (blockerStyle.display !== 'none' && blockerStyle.visibility !== 'hidden' && parseFloat(blockerStyle.opacity || '1') > 0.01);
    if (!blocksPointer || !visible) return;

    recordBlockedInteraction('overlay-intercepted', event, intendedTarget, blocker, stack);
  }

  function recordUpdateBannerTelemetry(event) {
    const detail = event && event.detail ? event.detail : {};
    const eventName = String(detail.eventName || '').trim();
    if (!eventName) return;

    if (eventName === 'update-banner-shown') SYSTEM.stats.updateBannerShown += 1;
    if (eventName === 'reload-clicked') SYSTEM.stats.updateBannerReloadClicked += 1;
    if (eventName === 'dismiss-clicked') SYSTEM.stats.updateBannerDismissClicked += 1;

    log('info', `Update banner telemetry: ${eventName}`, {
      eventName,
      appVersion: detail.appVersion || '',
      swVersion: detail.swVersion || '',
      versionKey: detail.versionKey || '',
      activeTab: detail.activeTab || ''
    });
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
      '#tagContextMenu',
      '#cardContextMenu'
    ].join(', ');

    document.querySelectorAll(overlaySelectors).forEach((el) => {
      const cs = window.getComputedStyle(el);
      const isHiddenByStyle = cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity || '1') === 0;
      const startupComplete = el.classList.contains('startup-complete') || el.dataset.startupLock === '0';
      const isInactiveContextMenu = (el.id === 'contextMenu' || el.id === 'tagContextMenu' || el.id === 'cardContextMenu') && !el.classList.contains('visible');

      if (isHiddenByStyle || startupComplete || isInactiveContextMenu) {
        if (el.style.pointerEvents !== 'none') el.style.pointerEvents = 'none';
        if ((el.id === 'contextMenu' || el.id === 'tagContextMenu' || el.id === 'cardContextMenu') && el.style.display !== 'none') {
          el.style.display = 'none';
        }
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
      const suspect = (el.closest ? el.closest('#loadingOverlay, .modal-backdrop, [id$="Backdrop"], #contextMenu, #tagContextMenu, #cardContextMenu') : null) || el;
      if (seen.has(suspect)) return;

      const cs = window.getComputedStyle(suspect);
      const isVisible = cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity || '1') > 0.1;
      const blocksPointer = cs.pointerEvents !== 'none';
      const isOverlayLike =
        suspect.id === 'loadingOverlay' ||
        suspect.classList.contains('modal-backdrop') ||
        (suspect.id && suspect.id.endsWith('Backdrop')) ||
        suspect.id === 'contextMenu' ||
        suspect.id === 'tagContextMenu' ||
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

    ['pointerdown', 'click'].forEach((type) => {
      document.addEventListener(type, inspectInteractionPath, true);
    });

    window.addEventListener('reliability:update-banner-event', recordUpdateBannerTelemetry);

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

    probeClickPath(buttonId, options) {
      const safeId = String(buttonId || '').trim();
      const allMatches = safeId ? Array.from(document.querySelectorAll(`#${safeId}`)) : [];
      const target = allMatches
        .slice()
        .sort((a, b) => {
          const ar = a.getBoundingClientRect ? a.getBoundingClientRect() : { width: 0, height: 0, top: 0 };
          const br = b.getBoundingClientRect ? b.getBoundingClientRect() : { width: 0, height: 0, top: 0 };
          const aVisible = (a.offsetParent || a.getClientRects().length) ? 1 : 0;
          const bVisible = (b.offsetParent || b.getClientRects().length) ? 1 : 0;
          const aInViewport = ar.bottom > 0 && ar.top < window.innerHeight ? 1 : 0;
          const bInViewport = br.bottom > 0 && br.top < window.innerHeight ? 1 : 0;
          if (bInViewport !== aInViewport) return bInViewport - aInViewport;
          if (bVisible !== aVisible) return bVisible - aVisible;
          return Math.abs(ar.top) - Math.abs(br.top);
        })[0] || document.getElementById(safeId);

      if (!target) {
        const missing = { ok: false, reason: 'not-found', buttonId: String(buttonId || '') };
        console.warn('⚠️ ButtonReliability.probeClickPath: button not found', missing);
        return missing;
      }

      const rect = target.getBoundingClientRect();
      if (!rect || rect.width < 2 || rect.height < 2) {
        // Check if the zero-size rect is because the button is inside an inactive
        // (hidden) tab pane — that is expected and not a real blockage.
        const inactivePane = target.closest
          ? (target.closest('.app-tab-pane:not(.active)') ||
             target.closest('[hidden]') ||
             target.closest('[style*="display: none"]') ||
             target.closest('[style*="display:none"]'))
          : null;
        if (inactivePane) {
          const inactiveResult = {
            ok: true,
            reason: 'inactive-tab',
            note: 'Button is in a hidden/inactive tab pane — not a reliability concern.',
            buttonId: target.id || '',
            paneId: inactivePane.id || inactivePane.dataset.tab || '',
            rect: { width: rect ? rect.width : 0, height: rect ? rect.height : 0 }
          };
          return inactiveResult;
        }
        const invalid = {
          ok: false,
          reason: 'invalid-rect',
          buttonId: target.id || '',
          rect: { width: rect ? rect.width : 0, height: rect ? rect.height : 0 }
        };
        console.warn('⚠️ ButtonReliability.probeClickPath: invalid rect', invalid);
        return invalid;
      }

      const sample = {
        center: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
        topLeftInset: { x: rect.left + 6, y: rect.top + 6 },
        topRightInset: { x: rect.right - 6, y: rect.top + 6 },
        bottomLeftInset: { x: rect.left + 6, y: rect.bottom - 6 },
        bottomRightInset: { x: rect.right - 6, y: rect.bottom - 6 }
      };

      const points = Object.entries(sample).map(([label, point]) => {
        const inViewport = point.x >= 0
          && point.y >= 0
          && point.x <= (window.innerWidth - 1)
          && point.y <= (window.innerHeight - 1);
        if (!inViewport) {
          return {
            label,
            x: Math.round(point.x),
            y: Math.round(point.y),
            reachable: false,
            offscreen: true,
            topTag: '',
            topId: '',
            topClass: ''
          };
        }

        const topEl = document.elementFromPoint(point.x, point.y);
        const reachable = Boolean(topEl && (topEl === target || target.contains(topEl)));
        return {
          label,
          x: Math.round(point.x),
          y: Math.round(point.y),
          reachable,
          offscreen: false,
          topTag: topEl && topEl.tagName ? String(topEl.tagName).toLowerCase() : '',
          topId: topEl && topEl.id ? topEl.id : '',
          topClass: topEl && topEl.className ? String(topEl.className).slice(0, 120) : ''
        };
      });

      const blockedPoints = points.filter((entry) => !entry.reachable);
      const offscreenCount = blockedPoints.filter((entry) => entry.offscreen).length;
      const allBlockedOffscreen = blockedPoints.length > 0 && offscreenCount === blockedPoints.length;
      const result = {
        ok: blockedPoints.length === 0,
        reason: allBlockedOffscreen ? 'offscreen' : '',
        buttonId: target.id || '',
        candidateCount: allMatches.length,
        rect: {
          left: Math.round(rect.left),
          top: Math.round(rect.top),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        },
        viewport: {
          width: Math.round(window.innerWidth || 0),
          height: Math.round(window.innerHeight || 0),
          scrollY: Math.round(window.scrollY || 0)
        },
        points,
        blockedPoints
      };

      if (result.ok) {
        console.log('✅ ButtonReliability.probeClickPath: target surface reachable', result);
      } else {
        if (!allBlockedOffscreen) {
          try {
            window.dispatchEvent(new CustomEvent('reliability:overlay-interception', {
              detail: {
                buttonId: result.buttonId,
                blockedPointCount: result.blockedPoints.length
              }
            }));
          } catch (_error) {
            // Ignore telemetry event issues.
          }
        }
        const label = allBlockedOffscreen
          ? '⚠️ ButtonReliability.probeClickPath: target is offscreen (not overlay-blocked)'
          : '⚠️ ButtonReliability.probeClickPath: surface blocked';
        console.warn(label, result);
      }
      return result;
    },

    getEventLog(limit) { return SYSTEM.eventLog.slice(-(limit || 50)); },
    clearEventLog() { SYSTEM.eventLog = []; },
    getBlockedInteractionLog(limit) { return SYSTEM.blockedInteractionLog.slice(-(limit || 30)); },
    clearBlockedInteractionLog() { SYSTEM.blockedInteractionLog = []; },
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

    getUpdateBannerTelemetry() {
      return {
        updateBannerShown: Number(SYSTEM.stats.updateBannerShown || 0),
        updateBannerReloadClicked: Number(SYSTEM.stats.updateBannerReloadClicked || 0),
        updateBannerDismissClicked: Number(SYSTEM.stats.updateBannerDismissClicked || 0)
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
