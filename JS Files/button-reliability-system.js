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
    },
    shortcutDrawerOpen: false
  };

  const SHORTCUT_HELP_STYLE_ID = 'pageShortcutHelpStyles';
  const SHORTCUT_HELP_DEFAULTS = {
    title: 'Keyboard Shortcuts',
    buttonLabel: '⌨️ Shortcuts',
    sections: [
      {
        title: 'General',
        items: [
          { keys: ['?'], description: 'Open keyboard shortcuts' },
          { keys: ['Esc'], description: 'Close the shortcuts drawer or active dialog' }
        ]
      }
    ]
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

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getPageShortcutConfig() {
    const raw = window.PAGE_SHORTCUTS_HELP && typeof window.PAGE_SHORTCUTS_HELP === 'object'
      ? window.PAGE_SHORTCUTS_HELP
      : {};
    const rawSections = Array.isArray(raw.sections) ? raw.sections : [];
    const sections = SHORTCUT_HELP_DEFAULTS.sections.concat(rawSections).map((section) => ({
      title: String(section && section.title || 'Shortcuts').trim() || 'Shortcuts',
      items: Array.isArray(section && section.items) ? section.items : []
    })).filter((section) => section.items.length);
    return {
      disabled: raw.disabled === true,
      title: String(raw.title || SHORTCUT_HELP_DEFAULTS.title).trim() || SHORTCUT_HELP_DEFAULTS.title,
      buttonLabel: String(raw.buttonLabel || SHORTCUT_HELP_DEFAULTS.buttonLabel).trim() || SHORTCUT_HELP_DEFAULTS.buttonLabel,
      sections: sections.length ? sections : SHORTCUT_HELP_DEFAULTS.sections
    };
  }

  function isAdvancedAppMode() {
    if (typeof window.getAppMode === 'function') {
      return window.getAppMode() === 'advanced';
    }
    return document.documentElement.getAttribute('data-app-mode') === 'advanced';
  }

  function ensureShortcutHelpStyles() {
    if (document.getElementById(SHORTCUT_HELP_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = SHORTCUT_HELP_STYLE_ID;
    style.textContent = [
      '#pageShortcutHelpToggle{position:fixed;left:14px;bottom:14px;z-index:10030;display:inline-flex;align-items:center;gap:8px;border:1px solid #bfdbfe;background:linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%);color:#1d4ed8;border-radius:999px;padding:10px 14px;font-size:12px;font-weight:700;box-shadow:0 10px 24px rgba(30,64,175,.18);cursor:pointer;}',
      '#pageShortcutHelpToggle:hover{transform:translateY(-1px);box-shadow:0 12px 28px rgba(30,64,175,.24);}',
      '#pageShortcutHelpBackdrop{position:fixed;inset:0;background:rgba(15,23,42,.3);backdrop-filter:blur(2px);z-index:10028;display:none;}',
      '#pageShortcutHelpBackdrop.open{display:block;}',
      '#pageShortcutHelpDrawer{position:fixed;top:0;right:0;height:100vh;width:min(420px,calc(100vw - 24px));background:#fff;border-left:1px solid #dbeafe;box-shadow:-12px 0 36px rgba(15,23,42,.18);z-index:10029;transform:translateX(104%);transition:transform .22s ease;display:flex;flex-direction:column;}',
      '#pageShortcutHelpDrawer.open{transform:translateX(0);}',
      '.page-shortcut-help-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:16px 18px;border-bottom:1px solid #e5e7eb;background:linear-gradient(135deg,#1d4ed8 0%,#2563eb 100%);color:#fff;}',
      '.page-shortcut-help-body{padding:16px 18px;overflow:auto;display:grid;gap:18px;}',
      '.page-shortcut-help-section{display:grid;gap:10px;}',
      '.page-shortcut-help-section-title{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#64748b;}',
      '.page-shortcut-help-item{display:grid;grid-template-columns:minmax(120px,auto) 1fr;gap:12px;align-items:start;}',
      '.page-shortcut-help-keys{display:flex;flex-wrap:wrap;gap:6px;}',
      '.page-shortcut-help-desc{font-size:13px;color:#334155;line-height:1.45;}',
      '.page-shortcut-help-close{border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.14);color:#fff;border-radius:999px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;}',
      '@media (max-width:640px){#pageShortcutHelpToggle{left:12px;right:12px;bottom:12px;justify-content:center;}#pageShortcutHelpDrawer{width:min(100vw,420px);}}'
    ].join('');
    document.head.appendChild(style);
  }

  function renderShortcutKeys(keys) {
    const list = Array.isArray(keys) ? keys : [keys];
    return list.map((key) => '<span class="ui-kbd-shortcut">' + escapeHtml(String(key || '').trim()) + '</span>').join('');
  }

  function ensureShortcutHelpUi() {
    const config = getPageShortcutConfig();
    if (config.disabled) return;
    ensureShortcutHelpStyles();

    let toggle = document.getElementById('pageShortcutHelpToggle');
    let backdrop = document.getElementById('pageShortcutHelpBackdrop');
    let drawer = document.getElementById('pageShortcutHelpDrawer');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.id = 'pageShortcutHelpToggle';
      toggle.type = 'button';
      toggle.className = 'ui-focusable';
      document.body.appendChild(toggle);
    }
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'pageShortcutHelpBackdrop';
      document.body.appendChild(backdrop);
    }
    if (!drawer) {
      drawer = document.createElement('aside');
      drawer.id = 'pageShortcutHelpDrawer';
      drawer.setAttribute('role', 'dialog');
      drawer.setAttribute('aria-modal', 'true');
      drawer.setAttribute('aria-labelledby', 'pageShortcutHelpTitle');
      document.body.appendChild(drawer);
    }

    toggle.setAttribute('data-advanced-only', 'true');
    backdrop.setAttribute('data-advanced-only', 'true');
    drawer.setAttribute('data-advanced-only', 'true');

    toggle.textContent = config.buttonLabel;
    toggle.title = config.buttonLabel + ' (?)';
    toggle.setAttribute('data-tooltip', config.buttonLabel + ' (?)');
    drawer.innerHTML = '<div class="page-shortcut-help-head">'
      + '<div><div id="pageShortcutHelpTitle" style="font-size:18px;font-weight:800;">' + escapeHtml(config.title) + '</div>'
      + '<div style="font-size:12px;opacity:.9;margin-top:4px;">Available shortcuts for this page</div></div>'
      + '<button type="button" id="pageShortcutHelpCloseBtn" class="page-shortcut-help-close">Close</button></div>'
      + '<div class="page-shortcut-help-body">'
      + config.sections.map((section) => '<section class="page-shortcut-help-section"><div class="page-shortcut-help-section-title">' + escapeHtml(section.title) + '</div>'
        + section.items.map((item) => '<div class="page-shortcut-help-item"><div class="page-shortcut-help-keys">' + renderShortcutKeys(item.keys) + '</div><div class="page-shortcut-help-desc">' + escapeHtml(item.description || '') + '</div></div>').join('')
        + '</section>').join('')
      + '</div>';

    if (!toggle.dataset.shortcutHelpBound) {
      toggle.dataset.shortcutHelpBound = '1';
      toggle.addEventListener('click', function () { toggleShortcutHelpDrawer(true); });
    }
    if (!backdrop.dataset.shortcutHelpBound) {
      backdrop.dataset.shortcutHelpBound = '1';
      backdrop.addEventListener('click', function () { toggleShortcutHelpDrawer(false); });
    }
    const closeBtn = document.getElementById('pageShortcutHelpCloseBtn');
    if (closeBtn && !closeBtn.dataset.shortcutHelpBound) {
      closeBtn.dataset.shortcutHelpBound = '1';
      closeBtn.addEventListener('click', function () { toggleShortcutHelpDrawer(false); });
    }
    applyShortcutTooltips(config);
    syncShortcutHelpUiVisibility();
  }

  function toggleShortcutHelpDrawer(forceOpen) {
    const backdrop = document.getElementById('pageShortcutHelpBackdrop');
    const drawer = document.getElementById('pageShortcutHelpDrawer');
    if (!backdrop || !drawer) return;
    const nextOpen = typeof forceOpen === 'boolean' ? forceOpen : !SYSTEM.shortcutDrawerOpen;
    if (nextOpen && !isAdvancedAppMode()) return;
    SYSTEM.shortcutDrawerOpen = nextOpen;
    backdrop.classList.toggle('open', nextOpen);
    drawer.classList.toggle('open', nextOpen);
    if (nextOpen) {
      const closeBtn = document.getElementById('pageShortcutHelpCloseBtn');
      if (closeBtn && typeof closeBtn.focus === 'function') closeBtn.focus();
    }
  }

  function syncShortcutHelpUiVisibility() {
    const isAdvanced = isAdvancedAppMode();
    const toggle = document.getElementById('pageShortcutHelpToggle');
    const backdrop = document.getElementById('pageShortcutHelpBackdrop');
    const drawer = document.getElementById('pageShortcutHelpDrawer');

    [toggle, backdrop, drawer].forEach((el) => {
      if (!el) return;
      el.hidden = !isAdvanced;
      el.setAttribute('aria-hidden', isAdvanced ? 'false' : 'true');
      el.style.display = isAdvanced ? '' : 'none';
    });

    if (!isAdvanced) {
      SYSTEM.shortcutDrawerOpen = false;
      if (backdrop) backdrop.classList.remove('open');
      if (drawer) drawer.classList.remove('open');
    }
  }

  function applyShortcutTooltips(config) {
    (config.sections || []).forEach((section) => {
      (section.items || []).forEach((item) => {
        const selector = String(item && item.buttonSelector || '').trim();
        if (!selector) return;
        document.querySelectorAll(selector).forEach((element) => {
          if (!element) return;
          const suffix = 'Shortcut: ' + (Array.isArray(item.keys) ? item.keys.join(' / ') : String(item.keys || ''));
          const base = String(item.tooltip || element.getAttribute('title') || element.getAttribute('data-tooltip') || element.textContent || '').trim();
          const nextTip = (base ? (base + ' • ' + suffix) : suffix).trim();
          element.setAttribute('title', nextTip);
          element.setAttribute('data-tooltip', nextTip);
        });
      });
    });
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
    ensureShortcutHelpUi();
    document.addEventListener('kap:app-mode-changed', syncShortcutHelpUiVisibility);

    document.addEventListener('keydown', function (event) {
      if (!event) return;
      if (event.key === 'Escape' && SYSTEM.shortcutDrawerOpen) {
        event.preventDefault();
        toggleShortcutHelpDrawer(false);
        return;
      }
      if ((event.key === '?' || (event.key === '/' && event.shiftKey)) && !event.metaKey && !event.ctrlKey && !event.altKey) {
        if (!isAdvancedAppMode()) return;
        var target = event.target;
        var editable = target && target.closest && target.closest('input, textarea, select, [contenteditable], [role="textbox"]');
        if (editable) return;
        event.preventDefault();
        toggleShortcutHelpDrawer(true);
      }
    }, true);

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

    refreshShortcutHelp() {
      ensureShortcutHelpUi();
      return { open: SYSTEM.shortcutDrawerOpen, config: getPageShortcutConfig() };
    },

    openShortcutHelp() {
      ensureShortcutHelpUi();
      toggleShortcutHelpDrawer(true);
    },

    closeShortcutHelp() {
      toggleShortcutHelpDrawer(false);
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
