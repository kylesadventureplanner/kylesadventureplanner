/* TV Mode Controller
 * Enables large-screen, remote-friendly navigation for Samsung TV browser use.
 */
(function initTvModeController() {
  'use strict';

  const STORAGE_KEY = 'kap_tv_mode_enabled';
  const TOGGLE_ID = 'tvModeGlobalToggle';
  const HUD_ID = 'tvModeShortcutHud';
  const QUICK_RAIL_ID = 'tvQuickFilterRail';
  const DIRECTION_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

  const state = {
    enabled: false,
    hudVisible: false,
    lastFocused: null,
    lastPreset: ''
  };

  function isVisibleElement(el) {
    if (!el || !(el instanceof HTMLElement)) return false;
    if (el.hidden) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.pointerEvents === 'none') return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function getFocusableElements() {
    const selector = [
      '[data-tv-focusable="true"]',
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    return Array.from(document.querySelectorAll(selector)).filter(isVisibleElement);
  }

  function centerOf(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function distanceScore(from, to, dir) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    if (dir === 'ArrowRight' && dx <= 3) return Number.POSITIVE_INFINITY;
    if (dir === 'ArrowLeft' && dx >= -3) return Number.POSITIVE_INFINITY;
    if (dir === 'ArrowDown' && dy <= 3) return Number.POSITIVE_INFINITY;
    if (dir === 'ArrowUp' && dy >= -3) return Number.POSITIVE_INFINITY;

    const primary = (dir === 'ArrowLeft' || dir === 'ArrowRight') ? Math.abs(dx) : Math.abs(dy);
    const secondary = (dir === 'ArrowLeft' || dir === 'ArrowRight') ? Math.abs(dy) : Math.abs(dx);

    // Favor the direction axis heavily, but keep nearby lanes preferred.
    return primary * 1.1 + secondary * 0.55;
  }

  function moveFocus(direction) {
    const focusables = getFocusableElements();
    if (!focusables.length) return;

    const active = document.activeElement;
    const activeIsValid = active && focusables.includes(active);

    if (!activeIsValid) {
      focusables[0].focus();
      state.lastFocused = focusables[0];
      return;
    }

    const currentCenter = centerOf(active);
    let best = null;
    let bestScore = Number.POSITIVE_INFINITY;

    for (const candidate of focusables) {
      if (candidate === active) continue;
      const score = distanceScore(currentCenter, centerOf(candidate), direction);
      if (score < bestScore) {
        best = candidate;
        bestScore = score;
      }
    }

    if (best) {
      best.focus();
      state.lastFocused = best;
    }
  }

  function clickFocusedElement() {
    const active = document.activeElement;
    if (!active || !(active instanceof HTMLElement)) return;

    const tag = (active.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') {
      active.focus();
      return;
    }

    if (typeof active.click === 'function') active.click();
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
        el.click();
        return true;
      }
    }

    if (typeof window.closeEnhancedCityVisualizer === 'function') {
      window.closeEnhancedCityVisualizer();
      return true;
    }

    const backdrop = document.querySelector('.modal-backdrop.visible, #enhancedCityVisualizerBackdrop.visible');
    if (backdrop && typeof backdrop.click === 'function') {
      backdrop.click();
      return true;
    }

    return false;
  }

  function setEnabled(enabled) {
    state.enabled = Boolean(enabled);
    document.body.classList.toggle('tv-mode-enabled', state.enabled);
    document.documentElement.classList.toggle('tv-mode-enabled', state.enabled);

    try {
      localStorage.setItem(STORAGE_KEY, state.enabled ? '1' : '0');
    } catch (_err) {}

    const toggle = document.getElementById(TOGGLE_ID);
    if (toggle) {
      toggle.setAttribute('data-enabled', state.enabled ? 'true' : 'false');
      toggle.textContent = state.enabled ? 'TV Mode: ON' : 'TV Mode: OFF';
      toggle.setAttribute('aria-pressed', state.enabled ? 'true' : 'false');
    }

    // Keep the header action-bar button visually in-sync.
    const headerBtn = document.getElementById('tvModeHeaderBtn');
    if (headerBtn) {
      headerBtn.setAttribute('data-enabled', state.enabled ? 'true' : 'false');
      headerBtn.textContent = state.enabled ? '📺 TV Mode: ON' : '📺 TV Mode';
      headerBtn.setAttribute('aria-pressed', state.enabled ? 'true' : 'false');
      headerBtn.style.background = state.enabled ? 'linear-gradient(135deg,#0ea5e9,#2563eb)' : '';
      headerBtn.style.color = state.enabled ? '#fff' : '';
      headerBtn.style.borderColor = state.enabled ? '#2563eb' : '';
    }

    const rail = document.getElementById(QUICK_RAIL_ID);
    if (rail) rail.style.display = state.enabled ? 'flex' : 'none';

    if (state.enabled) {
      requestAnimationFrame(() => {
        const focusables = getFocusableElements();
        if (focusables.length) {
          focusables[0].focus();
          state.lastFocused = focusables[0];
        }
      });
    }

    if (typeof window.showToast === 'function') {
      window.showToast(state.enabled ? 'TV Mode enabled' : 'TV Mode disabled', 'info', 1600);
    }
  }

  function toggleTvMode() {
    setEnabled(!state.enabled);
  }

  function ensureToggleButton() {
    if (document.getElementById(TOGGLE_ID)) return;
    const btn = document.createElement('button');
    btn.id = TOGGLE_ID;
    btn.type = 'button';
    btn.setAttribute('data-tv-focusable', 'true');
    btn.setAttribute('aria-pressed', 'false');
    btn.textContent = 'TV Mode: OFF';
    btn.addEventListener('click', toggleTvMode);
    document.body.appendChild(btn);
  }

  function ensureHud() {
    if (document.getElementById(HUD_ID)) return;
    const hud = document.createElement('div');
    hud.id = HUD_ID;
    hud.setAttribute('aria-live', 'polite');
    hud.innerHTML = [
      '<div class="tv-hud-title">TV Shortcuts</div>',
      '<div><kbd>Arrows</kbd> Move focus</div>',
      '<div><kbd>Enter</kbd> Select</div>',
      '<div><kbd>Esc</kbd> Back/Close</div>',
      '<div><kbd>H</kbd> Toggle this help</div>',
      '<div><kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>T</kbd> TV mode</div>',
      '<div><kbd>1</kbd>-<kbd>5</kbd> Quick presets</div>'
    ].join('');
    document.body.appendChild(hud);
  }

  function toggleHud(forceVisible) {
    const hud = document.getElementById(HUD_ID);
    if (!hud) return;
    if (typeof forceVisible === 'boolean') state.hudVisible = forceVisible;
    else state.hudVisible = !state.hudVisible;
    hud.classList.toggle('visible', state.hudVisible);
  }

  function setFilterValue(id, value) {
    const el = document.getElementById(id);
    if (!el) return false;
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  function runApplyFilters() {
    if (window.FilterManager && typeof window.FilterManager.applyAllFilters === 'function') {
      window.FilterManager.applyAllFilters();
      return;
    }
    if (typeof window.applyFilters === 'function') {
      window.applyFilters();
    }
  }

  function applyPreset(preset) {
    state.lastPreset = preset;

    // Clear core filters first so presets are deterministic.
    setFilterValue('searchName', '');
    setFilterValue('filterTags', '');
    setFilterValue('filterCost', '');

    if (preset === 'outdoor') {
      setFilterValue('filterTags', 'hiking');
    } else if (preset === 'food') {
      setFilterValue('filterTags', 'restaurant');
    } else if (preset === 'family') {
      setFilterValue('filterTags', 'family');
    } else if (preset === 'budget') {
      setFilterValue('filterCost', 'free');
    } else if (preset === 'favorites') {
      const favoritesBtn = document.getElementById('favoritesFilterBtn');
      if (favoritesBtn && typeof favoritesBtn.click === 'function') {
        favoritesBtn.click();
      }
    } else if (preset === 'clear') {
      if (window.FilterManager && typeof window.FilterManager.resetAllFilters === 'function') {
        window.FilterManager.resetAllFilters();
      } else if (typeof window.resetAllFilters === 'function') {
        window.resetAllFilters();
      }
    }

    runApplyFilters();

    const buttons = document.querySelectorAll('.tv-quick-filter-btn[data-preset]');
    buttons.forEach((btn) => {
      const isActive = btn.getAttribute('data-preset') === preset && preset !== 'clear';
      btn.setAttribute('data-active', isActive ? 'true' : 'false');
    });
  }

  function ensureQuickFilterRail() {
    if (document.getElementById(QUICK_RAIL_ID)) return;

    const plannerTab = document.getElementById('adventurePlannerTab') || document.querySelector('#adventure-planner.app-tab-pane');
    const plannerTopActions = plannerTab
      ? plannerTab.querySelector('.planner-top-actions')
      : document.querySelector('.planner-top-actions');
    if (!plannerTopActions || !plannerTopActions.parentElement) return;

    const rail = document.createElement('div');
    rail.id = QUICK_RAIL_ID;
    rail.setAttribute('aria-label', 'TV quick filters');

    const presets = [
      { label: '1 Outdoor', key: 'outdoor' },
      { label: '2 Food', key: 'food' },
      { label: '3 Family', key: 'family' },
      { label: '4 Budget', key: 'budget' },
      { label: '5 Favorites', key: 'favorites' },
      { label: 'Clear', key: 'clear' }
    ];

    presets.forEach((preset) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tv-quick-filter-btn';
      btn.setAttribute('data-preset', preset.key);
      btn.setAttribute('data-tv-focusable', 'true');
      btn.textContent = preset.label;
      btn.addEventListener('click', () => applyPreset(preset.key));
      rail.appendChild(btn);
    });

    plannerTopActions.parentElement.insertBefore(rail, plannerTopActions.nextSibling);
    rail.style.display = state.enabled ? 'flex' : 'none';
  }

  function onKeyDown(event) {
    // Global toggle always available.
    if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 't') {
      event.preventDefault();
      toggleTvMode();
      return;
    }

    if (!state.enabled) return;

    if (DIRECTION_KEYS.has(event.key)) {
      event.preventDefault();
      moveFocus(event.key);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      clickFocusedElement();
      return;
    }

    if (event.key === 'Escape' || event.key === 'Backspace') {
      event.preventDefault();
      closeTopModal();
      return;
    }

    if (event.key.toLowerCase() === 'h') {
      event.preventDefault();
      toggleHud();
      return;
    }

    if (event.key >= '1' && event.key <= '5') {
      const map = {
        '1': 'outdoor',
        '2': 'food',
        '3': 'family',
        '4': 'budget',
        '5': 'favorites'
      };
      const preset = map[event.key];
      if (preset) {
        event.preventDefault();
        applyPreset(preset);
      }
    }
  }

  function installCityViewerTvHooks() {
    if (typeof window.EnhancedCityVisualizer !== 'function' && typeof window.enhancedCityViz !== 'object') {
      return;
    }

    // Tag future city cards as focusable using delegated mutation-safe pass.
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

  function boot() {
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', boot, { once: true });
      return;
    }

    ensureToggleButton();
    ensureHud();
    ensureQuickFilterRail();
    installCityViewerTvHooks();

    document.addEventListener('keydown', onKeyDown, true);

    let shouldEnable = false;
    try {
      shouldEnable = localStorage.getItem(STORAGE_KEY) === '1';
    } catch (_err) {}
    setEnabled(shouldEnable);

    window.toggleTvMode = toggleTvMode;
    window.setTvModeEnabled = setEnabled;
    window.applyTvQuickPreset = applyPreset;

    // Re-attempt rail injection after dynamic tab content loaders run.
    setTimeout(ensureQuickFilterRail, 600);
    setTimeout(ensureQuickFilterRail, 1800);

    console.log('✅ TV Mode controller ready');
  }

  boot();
})();

