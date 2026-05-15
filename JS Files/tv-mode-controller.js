/* TV Mode Controller
 * Enables large-screen, remote-friendly navigation for Samsung TV browser use.
 *
 * v5.1 additions:
 *  - Improved HUD: Unicode arrows (⬅️ ⬆️) + emoji indicators for better readability at 10 ft
 *  - Audio feedback: Optional navigation beeps. Toggle via checkbox. localStorage persists.
 *  - Better kbd styling: larger font, better contrast
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
    openerStack:       [],
    _preClickElement:  null,
    _beaconTimer:      null,
    _keyRepeatTimer:   null,
    _keyRepeatHeld:    false,
    _keyRepeatDir:     null,
    _keyRepeatStart:   0,
    _directionsCache:  {},
    audioFeedback:     true  // toggle for navigation beeps
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

  /**
   * Returns true when the user is actively typing in a form field.
   * Used to prevent D-pad shortcuts from interfering with text input.
   */
  function isTypingContext() {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
    if (el.isContentEditable) return true;
    return false;
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
    // Must be strictly in the correct half-plane (3 px dead zone stays).
    if (dir === 'ArrowRight' && dx <= 3)  return Number.POSITIVE_INFINITY;
    if (dir === 'ArrowLeft'  && dx >= -3) return Number.POSITIVE_INFINITY;
    if (dir === 'ArrowDown'  && dy <= 3)  return Number.POSITIVE_INFINITY;
    if (dir === 'ArrowUp'    && dy >= -3) return Number.POSITIVE_INFINITY;

    const primary   = (dir === 'ArrowLeft' || dir === 'ArrowRight') ? Math.abs(dx) : Math.abs(dy);
    const secondary = (dir === 'ArrowLeft' || dir === 'ArrowRight') ? Math.abs(dy) : Math.abs(dx);

    // Cone filter: if cross-axis displacement exceeds 2× the primary distance
    // the element is outside a ~63° directional cone and is skipped.
    // This prevents ArrowRight jumping to a card far below that happens to be
    // slightly to the right of a wide grid.
    if (secondary > primary * 2.0) return Number.POSITIVE_INFINITY;

    // Heavy cross-axis penalty (2×) ensures elements inline with the direction
    // of travel beat tangential ones decisively.
    return primary + secondary * 2.0;
  }

  function scrollIntoFocus(el) {
    if (!el || typeof el.scrollIntoView !== 'function') return;
    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    } catch (_) { el.scrollIntoView(false); }
  }

  /**
   * Ensures focus is never orphaned on <body> (which happens when a filtered card
   * disappears or a modal closes before focus-restore completes). If focus is on
   * <body>, jump to the first focusable element.
   */
  function ensureFocusNotOrphaned() {
    if (document.activeElement !== document.body) return;
    const focusables = getFocusableElements();
    if (focusables.length) {
      focusables[0].focus();
      scrollIntoFocus(focusables[0]);
      state.lastFocused = focusables[0];
      announceFocus(focusables[0]);
      updateFocusBeacon(focusables[0]);
    }
  }

  /**
   * Schedules a repeated D-pad move with acceleration. Repeat rate interpolates
   * from 100 ms (slow, no acceleration) to 50 ms (fast, after 3 s of hold).
   * This makes held-arrow navigation snappy instead of sluggish.
   */
  function scheduleKeyRepeat(direction) {
    clearTimeout(state._keyRepeatTimer);
    const elapsed = Date.now() - state._keyRepeatStart;
    // Interpolate: at 0 ms → 100 ms delay, at 3000 ms → 50 ms delay
    const delayMs = Math.max(50, 100 - (elapsed / 3000) * 50);
    state._keyRepeatTimer = setTimeout(() => {
      if (state._keyRepeatHeld && state._keyRepeatDir === direction) {
        moveFocus(direction);
        scheduleKeyRepeat(direction);
      }
    }, delayMs);
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
      announceFocus(focusables[0]);
      updateFocusBeacon(focusables[0]);
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
      announceFocus(best);
      updateFocusBeacon(best);
      updateDirectionPreview(best);
      updateModalBadge();
      playNavigationBeep();
      ensureFocusNotOrphaned();
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
      announceFocus(next); updateFocusBeacon(next);
      ensureFocusNotOrphaned();
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
          announceFocus(focusables[0]); updateFocusBeacon(focusables[0]);
          updateDirectionPreview(focusables[0]); updateModalBadge();
          ensureFocusNotOrphaned();
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
    btn.setAttribute('data-advanced-only', 'true');
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
    hud.setAttribute('data-advanced-only', 'true');
    hud.setAttribute('aria-live', 'polite');
    hud.setAttribute('role', 'status');
    hud.innerHTML = [
      '<div class="tv-hud-header">',
      '  <span class="tv-hud-title">📺 TV Shortcuts</span>',
      '  <button id="tvModeShortcutHudClose" class="tv-hud-close" aria-label="Close shortcuts HUD">✕</button>',
      '</div>',
      '<div class="tv-hud-grid">',
      '  <div><kbd class="tv-kbd-arrows">⬅️ ⬆️ ➡️ ⬇️</kbd> Move</div>',
      '  <div><kbd class="tv-kbd">↵ Enter</kbd> Select</div>',
      '  <div><kbd class="tv-kbd">Esc</kbd> Back</div>',
      '  <div><kbd class="tv-kbd">H</kbd> Help</div>',
      '  <div><kbd class="tv-kbd">[</kbd><kbd class="tv-kbd">]</kbd> Tabs</div>',
      '  <div><kbd class="tv-kbd">T</kbd> Cycle</div>',
      '  <div><kbd class="tv-kbd">1–5</kbd> Presets</div>',
      '  <div><label style="display:flex;align-items:center;gap:6px;margin-top:8px;"><input type="checkbox" id="tvAudioFeedback" style="cursor:pointer;"> 🔊 Feedback</label></div>',
      '</div>'
    ].join('\n');
    hud.querySelector('#tvModeShortcutHudClose').addEventListener('click', () => toggleHud(false));

    // Audio toggle
    setTimeout(() => {
      const audioToggle = document.getElementById('tvAudioFeedback');
      if (audioToggle) {
        audioToggle.checked = state.audioFeedback;
        audioToggle.addEventListener('change', (e) => {
          state.audioFeedback = e.target.checked;
          try { localStorage.setItem('kap_tv_audio_feedback', state.audioFeedback ? '1' : '0'); } catch (_) {}
        });
      }
    }, 10);

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
    const challengeTabButton = document.querySelector('.app-tab-btn[data-tab="visited-locations"]');
    if (!challengeTabButton) return;
    const challengeTab = document.getElementById('visitedLocationsTab') || document.querySelector('[data-tab="visited-locations"].app-tab-pane');
    const plannerTopActions = challengeTab
      ? challengeTab.querySelector('.planner-top-actions')
      : document.querySelector('.planner-top-actions');
    if (!plannerTopActions || !plannerTopActions.parentElement) return;

    const rail = document.createElement('div');
    rail.id = QUICK_RAIL_ID;
    rail.setAttribute('data-advanced-only', 'true');
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

  // ─── Adventure card TV hooks ───────────────────────────────────────────
  // Adventure cards are rendered as plain <div>s. Mark them focusable so
  // the D-pad can land on them directly and Enter can open their detail modal.

  function installAdventureCardTvHooks() {
    const markCards = () => {
      document.querySelectorAll('.adventure-card:not([data-tv-focusable])').forEach((card) => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('data-tv-focusable', 'true');
        card.setAttribute('role', 'button');
        // Build a readable label from card title + location + keyboard hint.
        const title    = card.querySelector('.adventure-card-title')?.textContent?.trim() || '';
        const location = card.querySelector('.adventure-card-location')?.textContent?.trim() || '';
        const hint     = '[Enter to open]';
        card.setAttribute('aria-label', [title, location, hint].filter(Boolean).join(' — '));
        // Make Enter / Space activate the card (mirrors mouse click).
        if (!card.dataset.tvKeyBound) {
          card.dataset.tvKeyBound = '1';
          card.addEventListener('keydown', (e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !e.defaultPrevented) {
              e.preventDefault(); e.stopPropagation(); card.click();
            }
          });
        }
      });
    };
    markCards();
    const observer = new MutationObserver(markCards);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ─── Focus beacon ─────────────────────────────────────────────────────
  // A 2.5 s label that pops at bottom-right when D-pad lands on an element.
  // Readable at 10 ft without having to squint at the pulsing outline ring.

  function ensureFocusBeacon() {
    if (document.getElementById('tvFocusBeacon')) return;
    const beacon = document.createElement('div');
    beacon.id = 'tvFocusBeacon';
    beacon.setAttribute('aria-hidden', 'true');
    document.body.appendChild(beacon);
  }

  function updateFocusBeacon(el) {
    if (!state.enabled) return;
    const beacon = document.getElementById('tvFocusBeacon');
    if (!beacon) return;
    const label = (
      el.getAttribute('aria-label') ||
      el.getAttribute('title') ||
      el.textContent?.trim().replace(/\s+/g, ' ').slice(0, 60)
    )?.trim();
    if (!label) { beacon.classList.remove('visible'); return; }
    beacon.textContent = label;
    beacon.classList.add('visible');
    clearTimeout(state._beaconTimer);
    state._beaconTimer = setTimeout(() => beacon.classList.remove('visible'), 2500);
  }

  // ─── aria-live focus announcer ─────────────────────────────────────────
  // A visually-hidden live region that announces the focused element's name
  // through the TV's TTS / accessibility API.

  function ensureFocusAnnouncer() {
    if (document.getElementById('tvFocusAnnouncer')) return;
    const el = document.createElement('div');
    el.id = 'tvFocusAnnouncer';
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-atomic', 'true');
    el.className = 'tv-sr-only';
    document.body.appendChild(el);
  }

  function announceFocus(el) {
    if (!state.enabled) return;
    const announcer = document.getElementById('tvFocusAnnouncer');
    if (!announcer) return;
    const label = (
      el.getAttribute('aria-label') ||
      el.getAttribute('title') ||
      el.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80)
    )?.trim() || '';
    // Double rAF trick forces a new DOM change so aria-live fires reliably.
    announcer.textContent = '';
    requestAnimationFrame(() => requestAnimationFrame(() => { announcer.textContent = label; }));
  }

  // ─── Direction preview HUD ─────────────────────────────────────────────
  // Calculate which focusable neighbors exist in each cardinal direction.
  // Returns e.g. { up: 2, down: 5, left: null, right: 3 } (null = no neighbor)

  function getDirectionPreview(el) {
    if (!el) return { up: null, down: null, left: null, right: null };
    const focusables = getFocusableElements();
    const current = centerOf(el);
    const directions = { up: null, down: null, left: null, right: null };

    const found = { up: [], down: [], left: [], right: [] };
    for (const candidate of focusables) {
      if (candidate === el) continue;
      const cand = centerOf(candidate);
      if (cand.y < current.y - 10) found.up.push(cand);
      else if (cand.y > current.y + 10) found.down.push(cand);
      else if (cand.x < current.x - 10) found.left.push(cand);
      else if (cand.x > current.x + 10) found.right.push(cand);
    }

    // Count nearest in each direction (closest element).
    if (found.up.length) directions.up = found.up.length;
    if (found.down.length) directions.down = found.down.length;
    if (found.left.length) directions.left = found.left.length;
    if (found.right.length) directions.right = found.right.length;

    return directions;
  }

  /**
   * Update the HUD to show direction previews when a card is focused.
   * E.g. "↑ 2 up · ↓ 5 down · → 3 right"
   */
  function updateDirectionPreview(el) {
    if (!state.enabled) return;
    const hud = document.getElementById(HUD_ID);
    if (!hud) return;

    // Only show if focused element is a card-like thing.
    if (!el.classList.contains('adventure-card') && !el.classList.contains('enhanced-city-card')) {
      // Clear preview from other elements.
      const preview = hud.querySelector('.tv-hud-directions');
      if (preview) preview.remove();
      return;
    }

    // Remove old preview if exists.
    const oldPreview = hud.querySelector('.tv-hud-directions');
    if (oldPreview) oldPreview.remove();

    const dirs = getDirectionPreview(el);
    const parts = [];
    if (dirs.up)    parts.push(`<span>↑ ${dirs.up}</span>`);
    if (dirs.down)  parts.push(`<span>↓ ${dirs.down}</span>`);
    if (dirs.left)  parts.push(`<span>← ${dirs.left}</span>`);
    if (dirs.right) parts.push(`<span>→ ${dirs.right}</span>`);

    if (!parts.length) return;

    const preview = document.createElement('div');
    preview.className = 'tv-hud-directions';
    preview.innerHTML = parts.join('<span class="tv-hud-separator">·</span>');
    hud.appendChild(preview);
  }

  // ─── Modal active badge ────────────────────────────────────────────────
  // Show a small "🔒 Modal Active" badge at the top when the user is
  // trapped inside a modal (focus trap is active).

  function ensureModalBadge() {
    if (document.getElementById('tvModalBadge')) return;
    const badge = document.createElement('div');
    badge.id = 'tvModalBadge';
    badge.className = 'tv-modal-badge';
    badge.innerHTML = '🔒 <strong>Modal</strong> — <kbd>Esc</kbd> to close';
    badge.setAttribute('aria-live', 'polite');
    document.body.appendChild(badge);
  }

  function updateModalBadge() {
    const badge = document.getElementById('tvModalBadge');
    if (!badge) return;
    const inModal = getModalScope() !== null;
    badge.classList.toggle('visible', inModal);
  }

  // ─── Audio feedback for navigation ─────────────────────────────────────
  // Play subtle beeps for D-pad movement, card open, etc. Helps low-vision users.

  function playTone(freqHz = 150, durationMs = 40, volumeDb = -12) {
    if (!state.audioFeedback || !state.enabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freqHz;
      gain.gain.value = Math.pow(10, volumeDb / 20); // convert dB to linear
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch (_) {
      // AudioContext not available or blocked
    }
  }

  function playNavigationBeep() { playTone(150, 40, -14); }
  function playSelectBeep() { playTone(200, 60, -12); }
  function playModalBeep() { playTone(120, 80, -12); }

  // ─── Keyboard handler ──────────────────────────────────────────────────

  function onKeyDown(event) {
    // Global toggle — always available regardless of TV mode state or focus context.
    if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 't') {
      event.preventDefault(); toggleTvMode(); return;
    }
    if (!state.enabled) return;

    // ── typing-context guard ─────────────────────────────────────────────
    const typing = isTypingContext();

    // ── Direction keys with key repeat acceleration ──────────────────────
    if (DIRECTION_KEYS.has(event.key)) {
      if (typing) return;
      event.preventDefault();
      // First press: move immediately and set up repeat acceleration.
      if (!state._keyRepeatHeld) {
        moveFocus(event.key);
        state._keyRepeatHeld = true;
        state._keyRepeatDir  = event.key;
        state._keyRepeatStart = Date.now();
        // Schedule the first repeat after ~300 ms (standard OS repeat delay).
        scheduleKeyRepeat(event.key);
      } else if (event.key !== state._keyRepeatDir) {
        // Direction changed mid-hold — restart the acceleration timer.
        moveFocus(event.key);
        state._keyRepeatDir  = event.key;
        state._keyRepeatStart = Date.now();
        scheduleKeyRepeat(event.key);
      }
      // If same direction held, don't re-move; repeat timer will handle it.
      return;
    }

    // PageDown / PageUp → big scroll for long card grids.
    if (event.key === 'PageDown' || event.key === 'PageUp') {
      if (typing) return;
      event.preventDefault();
      window.scrollBy({ top: (event.key === 'PageDown' ? 1 : -1) * Math.round(window.innerHeight * 0.72), behavior: 'smooth' });
      return;
    }

    // Home / End shortcuts (standard TV app pattern).
    if (event.key === 'Home') {
      if (typing) return;
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Focus the first filter input (search box) if it exists.
      const searchInput = document.getElementById('searchName');
      if (searchInput && isVisibleElement(searchInput)) {
        searchInput.focus(); scrollIntoFocus(searchInput); state.lastFocused = searchInput;
        announceFocus(searchInput); updateFocusBeacon(searchInput);
        updateDirectionPreview(searchInput); updateModalBadge();
      } else {
        // Fallback: focus first focusable element.
        const focusables = getFocusableElements();
        if (focusables.length) {
          focusables[0].focus(); scrollIntoFocus(focusables[0]); state.lastFocused = focusables[0];
          announceFocus(focusables[0]); updateFocusBeacon(focusables[0]);
          updateDirectionPreview(focusables[0]); updateModalBadge();
        }
      }
      return;
    }
    if (event.key === 'End') {
      if (typing) return;
      event.preventDefault();
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      // Focus the first adventure card if it exists, otherwise first focusable.
      const card = document.querySelector('.adventure-card[data-tv-focusable]');
      if (card && isVisibleElement(card)) {
        card.focus(); scrollIntoFocus(card); state.lastFocused = card;
        announceFocus(card); updateFocusBeacon(card);
        updateDirectionPreview(card); updateModalBadge();
      } else {
        // Fallback: focus last focusable element.
        const focusables = getFocusableElements();
        if (focusables.length) {
          const last = focusables[focusables.length - 1];
          last.focus(); scrollIntoFocus(last); state.lastFocused = last;
          announceFocus(last); updateFocusBeacon(last);
          updateDirectionPreview(last); updateModalBadge();
        }
      }
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      if (typing) return;
      event.preventDefault();
      playSelectBeep();
      clickFocusedElement();
      return;
    }

    // Esc always closes modals; Backspace only when NOT typing.
    if (event.key === 'Escape') {
      event.preventDefault();
      playModalBeep();
      closeTopModal();
      return;
    }
    if (event.key === 'Backspace' && !typing) {
      event.preventDefault();
      playModalBeep();
      closeTopModal();
      return;
    }

    if (typing) return;

    if (event.key.toLowerCase() === 'h') {
      event.preventDefault(); toggleHud(); return;
    }
    if (event.key === '[' || event.key === ']') {
      event.preventDefault(); cycleMainTab(event.key === '[' ? -1 : 1); return;
    }
    if (event.key.toLowerCase() === 't' && !event.ctrlKey && !event.altKey) {
      event.preventDefault(); cycleMainTab(1); return;
    }
    if (event.key >= '1' && event.key <= '5') {
      const map = { '1': 'outdoor', '2': 'food', '3': 'family', '4': 'budget', '5': 'favorites' };
      const preset = map[event.key];
      if (preset) { event.preventDefault(); applyPreset(preset); }
    }
  }

  /**
   * keyup handler: stop key repeat acceleration when the user releases a D-pad key.
   */
  function onKeyUp(event) {
    if (!state.enabled) return;
    if (DIRECTION_KEYS.has(event.key)) {
      if (event.key === state._keyRepeatDir) {
        clearTimeout(state._keyRepeatTimer);
        state._keyRepeatHeld = false;
        state._keyRepeatDir  = null;
      }
    }
  }

  // ─── Boot ──────────────────────────────────────────────────────────────

  function boot() {
    if (!document.body) { document.addEventListener('DOMContentLoaded', boot, { once: true }); return; }

    ensureToggleButton();
    ensureHud();
    ensureFocusBeacon();
    ensureFocusAnnouncer();
    ensureModalBadge();
    ensureQuickFilterRail();
    installCityViewerTvHooks();
    installAdventureCardTvHooks();
    installModalOpenerTracker();

    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('keyup', onKeyUp, true);

    let shouldEnable = false;
    try { shouldEnable = localStorage.getItem(STORAGE_KEY) === '1'; } catch (_) {}

    // Restore audio feedback preference
    try {
      const audioEnabled = localStorage.getItem('kap_tv_audio_feedback');
      if (audioEnabled !== null) state.audioFeedback = audioEnabled === '1';
    } catch (_) {}

    setEnabled(shouldEnable);

    window.toggleTvMode       = toggleTvMode;
    window.setTvModeEnabled   = setEnabled;
    window.applyTvQuickPreset = applyPreset;
    window.cycleTvTab         = cycleMainTab;

    setTimeout(ensureQuickFilterRail, 600);
    setTimeout(ensureQuickFilterRail, 1800);

    console.log('✅ TV Mode controller v5.1 ready');
  }

  boot();
})();

