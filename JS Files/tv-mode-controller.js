/* TV Mode Controller
 * Enables large-screen, remote-friendly navigation for Samsung TV browser use.
 *
 * Improvements v2:
 *  - Focus trap: D-pad navigation is scoped to the innermost open modal
 *  - Focus return: MutationObserver saves the opener before a modal opens and
 *    restores focus when the modal closes
 *  - Auto-scroll: focused elements scroll into view after every D-pad move
 *  - Tab cycling: [ / ] keys cycle main tabs; T also cycles forward
 *  - HUD auto-shows 4 s on first activation, now has a close × button
 *  - Quick-filter buttons carry emoji labels for at-a-glance recognition
 *  - Toast fired per preset to confirm the filter change
 *  - scroll-margin-top respected via JS scrollIntoView
 */
(function initTvModeController() {
  'use strict';

  const STORAGE_KEY   = 'kap_tv_mode_enabled';
  const FIRST_USE_KEY = 'kap_tv_mode_first_use_done';
  const TOGGLE_ID     = 'tvModeGlobalToggle';
  const HUD_ID        = 'tvModeShortcutHud';
  const QUICK_RAIL_ID = 'tvQuickFilterRail';
  const DIRECTION_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

  const state = {
    enabled:           false,
    hudVisible:        false,
    lastFocused:       null,
    lastPreset:        '',
    openerStack:       [],   // elements that opened modals — restored on close
    _preClickElement:  null
  };

  // ─── Visibility helpers ────────────────────────────────────────────────

  function isVisibleElement(el) {
    if (!el || !(el instanceof HTMLElement)) return false;
    if (el.hidden) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.pointerEvents === 'none') return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  // ─── Modal scope (focus trap) ──────────────────────────────────────────

  function getModalScope() {
    const candidates = [
      '#rowDetailModalBackdrop.visible',
      '#enhancedCityVisualizerBackdrop.visible',
      '.modal-backdrop.visible'
    ];
    for (const sel of candidates) {
      const backdrop = document.querySelector(sel);
      if (!backdrop) continue;
      const dialog =
        backdrop.querySelector('[role="dialog"], .modal, .row-detail-modal') ||
        document.querySelector('#rowDetailModal.visible') ||
        document.querySelector('#enhancedCityVisualizerModal');
      if (dialog && isVisibleElement(dialog)) return dialog;
    }
    const standalone = document.querySelector('#rowDetailModal.visible');
    if (standalone && isVisibleElement(standalone)) return standalone;
    return null;
  }

  // ─── Focusable elements (scoped to modal when one is open) ────────────

  function getFocusableElements() {
    const root = getModalScope() || document;
    const selector = [
      '[data-tv-focusable="true"]',
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');
    return Array.from(root.querySelectorAll(selector)).filter(isVisibleElement);
  }

  // ─── Spatial navigation ────────────────────────────────────────────────

  function centerOf(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function distanceScore(from, to, dir) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    if (dir === 'ArrowRight' && dx <= 3)  return Number.POSITIVE_INFINITY;
    if (dir === 'ArrowLeft'  && dx >= -3) return Number.POSITIVE_INFINITY;
    if (dir === 'ArrowDown'  && dy <= 3)  return Number.POSITIVE_INFINITY;
    if (dir === 'ArrowUp'    && dy >= -3) return Number.POSITIVE_INFINITY;
    const primary   = (dir === 'ArrowLeft' || dir === 'ArrowRight') ? Math.abs(dx) : Math.abs(dy);
    const secondary = (dir === 'ArrowLeft' || dir === 'ArrowRight') ? Math.abs(dy) : Math.abs(dx);
    return primary * 1.1 + secondary * 0.55;
  }

  function scrollIntoFocus(el) {
    if (!el || typeof el.scrollIntoView !== 'function') return;
    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    } catch (_) { el.scrollIntoView(false); }
  }

  function moveFocus(direction) {
    const focusables = getFocusableElements();
    if (!focusables.length) return;
    const active        = document.activeElement;
    const activeIsValid = active && focusables.includes(active);
    if (!activeIsValid) {
      focusables[0].focus();
      scrollIntoFocus(focusables[0]);
      state.lastFocused = focusables[0];
      return;
    }
    const currentCenter = centerOf(active);
    let best = null, bestScore = Number.POSITIVE_INFINITY;
    for (const candidate of focusables) {
      if (candidate === active) continue;
      const score = distanceScore(currentCenter, centerOf(candidate), direction);
      if (score < bestScore) { best = candidate; bestScore = score; }
    }
    if (best) {
      best.focus();
      scrollIntoFocus(best);
      state.lastFocused = best;
    }
  }

  // ─── Click / activate ──────────────────────────────────────────────────

  function clickFocusedElement() {
    const active = document.activeElement;
    if (!active || !(active instanceof HTMLElement)) return;
    const tag = (active.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') { active.focus(); return; }
    if (isVisibleElement(active)) state._preClickElement = active;
    if (typeof active.click === 'function') active.click();
    // Push opener to stack ~120 ms later, if a modal did open.
    setTimeout(() => {
      if (getModalScope() && state._preClickElement) {
        if (!state.openerStack.includes(state._preClickElement)) {
          state.openerStack.push(state._preClickElement);
        }
        state._preClickElement = null;
      }
    }, 120);
  }

  // ─── Close top modal + focus return ───────────────────────────────────

  function restoreFocusAfterClose() {
    setTimeout(() => {
      if (getModalScope()) return; // another modal is still open
      if (state.openerStack.length) {
        const opener = state.openerStack.pop();
        if (opener && document.body.contains(opener) && isVisibleElement(opener)) {
          opener.focus(); scrollIntoFocus(opener); state.lastFocused = opener; return;
        }
      }
      if (state.lastFocused && document.body.contains(state.lastFocused) && isVisibleElement(state.lastFocused)) {
        state.lastFocused.focus(); scrollIntoFocus(state.lastFocused);
      }
    }, 100);
  }

  function closeTopModal() {
    const closeCandidates = [
      '#rowDetailCloseBtn',
      '.enhanced-city-close',
      '.automation-progress-close',
      '#tvModeShortcutHudClose'
    ];
    for (const selector of closeCandidates) {
      const el = document.querySelector(selector);
      if (isVisibleElement(el) && typeof el.click === 'function') {
        el.click(); restoreFocusAfterClose(); return true;
      }
    }
    if (typeof window.closeEnhancedCityVisualizer === 'function') {
      window.closeEnhancedCityVisualizer(); restoreFocusAfterClose(); return true;
    }
    const backdrop = document.querySelector('.modal-backdrop.visible, #enhancedCityVisualizerBackdrop.visible');
    if (backdrop && typeof backdrop.click === 'function') {
      backdrop.click(); restoreFocusAfterClose(); return true;
    }
    return false;
  }

  // ─── MutationObserver – opener stack via class changes ────────────────

  function installModalOpenerTracker() {
    const observer = new MutationObserver((mutations) => {
      for (const mut of mutations) {
        if (mut.type !== 'attributes' || mut.attributeName !== 'class') continue;
        const el         = mut.target;
        const wasVisible = mut.oldValue && mut.oldValue.includes('visible');
        const nowVisible = el.classList.contains('visible');
        const isBackdrop = el.id === 'rowDetailModalBackdrop' ||
                           el.id === 'enhancedCityVisualizerBackdrop' ||
                           el.classList.contains('modal-backdrop');
        if (!isBackdrop) continue;
        // Modal just opened → save opener.
        if (!wasVisible && nowVisible) {
          const focused = document.activeElement;
          if (focused && isVisibleElement(focused) && !state.openerStack.includes(focused)) {
            state.openerStack.push(focused);
          }
        }
        // Modal just closed → restore focus.
        if (wasVisible && !nowVisible && state.enabled) {
          restoreFocusAfterClose();
        }
      }
    });
    observer.observe(document.body, {
      subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ['class']
    });
  }

  // ─── Tab cycling ───────────────────────────────────────────────────────

  const MAIN_TABS = [
    'visited-locations', 'nature-challenge', 'adventure-planner',
    'household-tools', 'birding', 'bike-trails'
  ];

  function cycleMainTab(delta) {
    const buttons = Array.from(
      document.querySelectorAll('.app-tab-btn:not(.tab-utility-hidden):not([aria-hidden="true"])')
    ).filter(isVisibleElement);
    if (!buttons.length) return;
    const activeIdx = buttons.findIndex((b) => b.classList.contains('active'));
    const nextIdx   = ((activeIdx === -1 ? 0 : activeIdx) + delta + buttons.length) % buttons.length;
    const next      = buttons[nextIdx];
    if (next && typeof next.click === 'function') {
      next.click(); next.focus(); scrollIntoFocus(next); state.lastFocused = next;
    }
  }

  // ─── Enable / disable ─────────────────────────────────────────────────

  function setEnabled(enabled) {
    state.enabled = Boolean(enabled);
    document.body.classList.toggle('tv-mode-enabled', state.enabled);
    document.documentElement.classList.toggle('tv-mode-enabled', state.enabled);
    try { localStorage.setItem(STORAGE_KEY, state.enabled ? '1' : '0'); } catch (_) {}

    const toggle = document.getElementById(TOGGLE_ID);
    if (toggle) {
      toggle.setAttribute('data-enabled', state.enabled ? 'true' : 'false');
      toggle.textContent = state.enabled ? 'TV Mode: ON' : 'TV Mode: OFF';
      toggle.setAttribute('aria-pressed', state.enabled ? 'true' : 'false');
    }

    const headerBtn = document.getElementById('tvModeHeaderBtn');
    if (headerBtn) {
      headerBtn.setAttribute('data-enabled', state.enabled ? 'true' : 'false');
      headerBtn.textContent = state.enabled ? '📺 TV Mode: ON' : '📺 TV Mode';
      headerBtn.setAttribute('aria-pressed', state.enabled ? 'true' : 'false');
      headerBtn.style.background  = state.enabled ? 'linear-gradient(135deg,#0ea5e9,#2563eb)' : '';
      headerBtn.style.color       = state.enabled ? '#fff' : '';
      headerBtn.style.borderColor = state.enabled ? '#2563eb' : '';
    }

    const rail = document.getElementById(QUICK_RAIL_ID);
    if (rail) rail.style.display = state.enabled ? 'flex' : 'none';

    if (state.enabled) {
      // First-run: auto-show HUD for 4 s so shortcuts are discoverable.
      let firstUse = false;
      try { firstUse = localStorage.getItem(FIRST_USE_KEY) !== '1'; } catch (_) {}
      if (firstUse) {
        toggleHud(true);
        setTimeout(() => { if (state.hudVisible) toggleHud(false); }, 4000);
        try { localStorage.setItem(FIRST_USE_KEY, '1'); } catch (_) {}
      }
      requestAnimationFrame(() => {
        const focusables = getFocusableElements();
        if (focusables.length) {
          focusables[0].focus(); scrollIntoFocus(focusables[0]); state.lastFocused = focusables[0];
        }
      });
    } else {
      toggleHud(false);
    }

    if (typeof window.showToast === 'function') {
      window.showToast(
        state.enabled ? '📺 TV Mode enabled — press H for shortcuts' : 'TV Mode disabled',
        'info', 2000
      );
    }
  }

  function toggleTvMode() { setEnabled(!state.enabled); }

  // ─── Ensure floating toggle ────────────────────────────────────────────

  function ensureToggleButton() {
    if (document.getElementById(TOGGLE_ID)) return;
    const btn = document.createElement('button');
    btn.id = TOGGLE_ID; btn.type = 'button';
    btn.setAttribute('data-tv-focusable', 'true');
    btn.setAttribute('aria-pressed', 'false');
    btn.textContent = 'TV Mode: OFF';
    btn.addEventListener('click', toggleTvMode);
    document.body.appendChild(btn);
  }

  // ─── HUD ──────────────────────────────────────────────────────────────

  function ensureHud() {
    if (document.getElementById(HUD_ID)) return;
    const hud = document.createElement('div');
    hud.id    = HUD_ID;
    hud.setAttribute('aria-live', 'polite');
    hud.setAttribute('role', 'status');
    hud.innerHTML = [
      '<div class="tv-hud-header">',
      '  <span class="tv-hud-title">📺 TV Shortcuts</span>',
      '  <button id="tvModeShortcutHudClose" class="tv-hud-close" aria-label="Close shortcuts HUD">✕</button>',
      '</div>',
      '<div class="tv-hud-grid">',
      '  <div><kbd>↑↓←→</kbd> Move focus</div>',
      '  <div><kbd>Enter</kbd> Select</div>',
      '  <div><kbd>Esc</kbd> Back / Close</div>',
      '  <div><kbd>H</kbd> Toggle this help</div>',
      '  <div><kbd>[</kbd><kbd>]</kbd> Prev / Next tab</div>',
      '  <div><kbd>T</kbd> Cycle tabs forward</div>',
      '  <div><kbd>1</kbd>–<kbd>5</kbd> Quick presets</div>',
      '  <div><kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>T</kbd> Toggle TV mode</div>',
      '</div>'
    ].join('\n');
    hud.querySelector('#tvModeShortcutHudClose').addEventListener('click', () => toggleHud(false));
    document.body.appendChild(hud);
  }

  function toggleHud(forceVisible) {
    const hud = document.getElementById(HUD_ID);
    if (!hud) return;
    if (typeof forceVisible === 'boolean') state.hudVisible = forceVisible;
    else state.hudVisible = !state.hudVisible;
    hud.classList.toggle('visible', state.hudVisible);
  }

  // ─── Filter helpers ────────────────────────────────────────────────────

  function setFilterValue(id, value) {
    const el = document.getElementById(id);
    if (!el) return false;
    el.value = value;
    el.dispatchEvent(new Event('input',  { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  function runApplyFilters() {
    if (window.FilterManager && typeof window.FilterManager.applyAllFilters === 'function') {
      window.FilterManager.applyAllFilters(); return;
    }
    if (typeof window.applyFilters === 'function') window.applyFilters();
  }

  // ─── Quick presets ─────────────────────────────────────────────────────

  const PRESET_LABELS = {
    outdoor: '🌲 Outdoor', food: '🍔 Food', family: '👨‍👩‍👧 Family',
    budget: '💰 Budget', favorites: '⭐ Favorites', clear: '✕ Clear'
  };

  function applyPreset(preset) {
    state.lastPreset = preset;
    setFilterValue('searchName', '');
    setFilterValue('filterTags', '');
    setFilterValue('filterCost', '');

    if      (preset === 'outdoor')   setFilterValue('filterTags', 'hiking');
    else if (preset === 'food')      setFilterValue('filterTags', 'restaurant');
    else if (preset === 'family')    setFilterValue('filterTags', 'family');
    else if (preset === 'budget')    setFilterValue('filterCost', 'free');
    else if (preset === 'favorites') {
      const btn = document.getElementById('favoritesFilterBtn');
      if (btn && typeof btn.click === 'function') btn.click();
    } else if (preset === 'clear') {
      if (window.FilterManager && typeof window.FilterManager.resetAllFilters === 'function') {
        window.FilterManager.resetAllFilters();
      } else if (typeof window.resetAllFilters === 'function') {
        window.resetAllFilters();
      }
    }

    runApplyFilters();

    document.querySelectorAll('.tv-quick-filter-btn[data-preset]').forEach((btn) => {
      const isActive = btn.getAttribute('data-preset') === preset && preset !== 'clear';
      btn.setAttribute('data-active', isActive ? 'true' : 'false');
    });

    if (typeof window.showToast === 'function' && preset !== 'clear') {
      window.showToast('Preset: ' + (PRESET_LABELS[preset] || preset), 'info', 1400);
    }
  }

  // ─── Quick filter rail ─────────────────────────────────────────────────

  function ensureQuickFilterRail() {
    if (document.getElementById(QUICK_RAIL_ID)) return;
    const plannerTab        = document.getElementById('adventurePlannerTab') || document.querySelector('#adventure-planner.app-tab-pane');
    const plannerTopActions = plannerTab
      ? plannerTab.querySelector('.planner-top-actions')
      : document.querySelector('.planner-top-actions');
    if (!plannerTopActions || !plannerTopActions.parentElement) return;

    const rail = document.createElement('div');
    rail.id = QUICK_RAIL_ID;
    rail.setAttribute('aria-label', 'TV quick filters');
    rail.setAttribute('role', 'toolbar');

    [
      { label: '🌲 1 Outdoor',     key: 'outdoor'   },
      { label: '🍔 2 Food',        key: 'food'      },
      { label: '👨\u200d👩\u200d👧 3 Family', key: 'family' },
      { label: '💰 4 Budget',      key: 'budget'    },
      { label: '⭐ 5 Favorites',   key: 'favorites' },
      { label: '✕ Clear',          key: 'clear'     }
    ].forEach((preset) => {
      const btn = document.createElement('button');
      btn.type  = 'button';
      btn.className = 'tv-quick-filter-btn';
      btn.setAttribute('data-preset',       preset.key);
      btn.setAttribute('data-tv-focusable', 'true');
      btn.setAttribute('data-active',       'false');
      btn.textContent = preset.label;
      btn.addEventListener('click', () => applyPreset(preset.key));
      rail.appendChild(btn);
    });

    plannerTopActions.parentElement.insertBefore(rail, plannerTopActions.nextSibling);
    rail.style.display = state.enabled ? 'flex' : 'none';
  }

  // ─── City viewer TV hooks ──────────────────────────────────────────────

  function installCityViewerTvHooks() {
    if (typeof window.EnhancedCityVisualizer !== 'function' && typeof window.enhancedCityViz !== 'object') return;
    const markCards = () => {
      document.querySelectorAll('.enhanced-city-card').forEach((card) => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('data-tv-focusable', 'true');
      });
      document.querySelectorAll('.enhanced-city-sort-btn, #citysearch, .enhanced-city-close').forEach((el) => {
        el.setAttribute('data-tv-focusable', 'true');
      });
    };
    markCards();
    const observer = new MutationObserver(markCards);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ─── Keyboard handler ──────────────────────────────────────────────────

  function onKeyDown(event) {
    if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 't') {
      event.preventDefault(); toggleTvMode(); return;
    }
    if (!state.enabled) return;

    if (DIRECTION_KEYS.has(event.key)) {
      event.preventDefault(); moveFocus(event.key); return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); clickFocusedElement(); return;
    }
    if (event.key === 'Escape' || event.key === 'Backspace') {
      event.preventDefault(); closeTopModal(); return;
    }
    if (event.key.toLowerCase() === 'h') {
      event.preventDefault(); toggleHud(); return;
    }
    // [ / ] → prev / next tab.
    if (event.key === '[' || event.key === ']') {
      event.preventDefault(); cycleMainTab(event.key === '[' ? -1 : 1); return;
    }
    // T → cycle tabs forward (single-key Samsung TV convenience).
    if (event.key.toLowerCase() === 't' && !event.ctrlKey && !event.altKey) {
      event.preventDefault(); cycleMainTab(1); return;
    }
    // 1–5 → quick presets.
    if (event.key >= '1' && event.key <= '5') {
      const map = { '1': 'outdoor', '2': 'food', '3': 'family', '4': 'budget', '5': 'favorites' };
      const preset = map[event.key];
      if (preset) { event.preventDefault(); applyPreset(preset); }
    }
  }

  // ─── Boot ──────────────────────────────────────────────────────────────

  function boot() {
    if (!document.body) { document.addEventListener('DOMContentLoaded', boot, { once: true }); return; }

    ensureToggleButton();
    ensureHud();
    ensureQuickFilterRail();
    installCityViewerTvHooks();
    installModalOpenerTracker();

    document.addEventListener('keydown', onKeyDown, true);

    let shouldEnable = false;
    try { shouldEnable = localStorage.getItem(STORAGE_KEY) === '1'; } catch (_) {}
    setEnabled(shouldEnable);

    window.toggleTvMode       = toggleTvMode;
    window.setTvModeEnabled   = setEnabled;
    window.applyTvQuickPreset = applyPreset;
    window.cycleTvTab         = cycleMainTab;

    setTimeout(ensureQuickFilterRail, 600);
    setTimeout(ensureQuickFilterRail, 1800);

    console.log('✅ TV Mode controller v2 ready');
  }

  boot();
})();

