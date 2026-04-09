/*
 * Multi-select bulk actions for Adventure Planner tab.
 * Bike Trails bulk actions are handled in bike-trails-tab-system.js.
 */
(function initAdventureBulkActions() {
  const DEBUG = Boolean(window.__bulkDebugVerbose);

  function debugLog(...args) {
    if (DEBUG) {
      console.log('[BULK-DEBUG]', ...args);
    }
  }

  const adventureState = {
    selectedSourceIndexes: new Set(),
    pulsedSelectionSourceIndexes: new Set(),
    busy: false,
    observer: null,
    initialized: false,
    initIntervalId: 0,
    observerDebounceId: 0,
    lastWiringSignature: ''
  };
      function isElementVisible(el) {
        if (!el) return false;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        return el.getClientRects().length > 0;
      }

      function isAdventureBulkContextActive() {
        if (document.visibilityState === 'hidden') return false;
        const grid = document.getElementById('adventureCardsGrid');
        const card = document.getElementById('adventureBulkActionsCard');
        return Boolean(grid && card && isElementVisible(grid) && isElementVisible(card));
      }

  const BULK_STATUS_CONFIRM_THRESHOLD = 20;
  const BULK_SELECTION_STYLE_ID = 'adventureBulkSelectionRailStyles';
  const BULK_BADGE_HIDE_TIMER_KEY = '__bulkBadgeHideTimer';
  const BULK_UNDO_MAX_SNAPSHOTS = 250;
  const BULK_UNDO_RESTORE_CHUNK = 24;

  function ensureAdventureBulkSelectionRailStyles() {
    if (document.getElementById(BULK_SELECTION_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = BULK_SELECTION_STYLE_ID;
    style.textContent = [
      '.adventure-card.adventure-bulk-card-selectable { position: relative; overflow: hidden; }',
      '.adventure-card.adventure-bulk-card-selectable.adventure-bulk-card-selected {',
      '  border-color: #60a5fa;',
      '  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.22), 0 10px 20px rgba(37, 99, 235, 0.10);',
      '}',
      '.adventure-card.adventure-bulk-card-selectable.adventure-bulk-card-selected:hover {',
      '  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3), 0 14px 24px rgba(37, 99, 235, 0.14);',
      '}',
      '.adventure-card.adventure-bulk-card-selectable.adventure-bulk-card-selected-pulse {',
      '  animation: adventureBulkCardSelectedPulse 280ms ease-out;',
      '}',
      '@keyframes adventureBulkCardSelectedPulse {',
      '  0% { transform: scale(0.995); }',
      '  55% { transform: scale(1.01); }',
      '  100% { transform: scale(1); }',
      '}',
      '.adventure-bulk-select-wrap {',
      '  display: flex;',
      '  justify-content: flex-start;',
      '  align-items: center;',
      '  padding: 10px 12px;',
      '  margin: -1px -1px 10px;',
      '  border-bottom: 1px solid #dbeafe;',
      '  background: linear-gradient(180deg, #f8fbff 0%, #f1f5f9 100%);',
      '  position: relative;',
      '  z-index: 3;',
      '}',
      '.adventure-bulk-select-label {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 8px;',
      '  border: 1px solid #bfdbfe;',
      '  border-radius: 10px;',
      '  background: #ffffff;',
      '  padding: 8px 10px;',
      '  color: #1e3a8a;',
      '  font-size: 12px;',
      '  font-weight: 700;',
      '  line-height: 1;',
      '  cursor: pointer;',
      '  user-select: none;',
      '}',
      '.adventure-bulk-select-label:hover { border-color: #93c5fd; background: #eff6ff; }',
      '.adventure-bulk-select-label input.adventure-bulk-select { width: 16px; height: 16px; cursor: pointer; margin: 0; }',
      '.adventure-bulk-selected-badge {',
      '  margin-left: auto;',
      '  display: inline-flex;',
      '  align-items: center;',
      '  border: 1px solid #60a5fa;',
      '  background: #dbeafe;',
      '  color: #1e40af;',
      '  border-radius: 999px;',
      '  padding: 4px 8px;',
      '  font-size: 10px;',
      '  font-weight: 800;',
      '  letter-spacing: 0.02em;',
      '  white-space: nowrap;',
      '  opacity: 0;',
      '  transform: scale(0.96);',
      '  transition: opacity 140ms ease, transform 140ms ease;',
      '  pointer-events: none;',
      '}',
      '.adventure-bulk-selected-badge.is-visible {',
      '  opacity: 1;',
      '  transform: scale(1);',
      '}',
      '.adventure-bulk-selected-badge[hidden] { display: none; }',
      '@media (prefers-reduced-motion: reduce) {',
      '  .adventure-card.adventure-bulk-card-selectable.adventure-bulk-card-selected-pulse { animation: none; }',
      '  .adventure-bulk-selected-badge { transition: none; }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
    debugLog('✅ Bulk selection styles ensured');
  }

  function prefersReducedMotion() {
    return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function setBulkSelectedBadgeState(badge, isVisible) {
    if (!badge) return;

    const prevTimer = badge[BULK_BADGE_HIDE_TIMER_KEY];
    if (prevTimer) {
      clearTimeout(prevTimer);
      badge[BULK_BADGE_HIDE_TIMER_KEY] = 0;
    }

    if (isVisible) {
      badge.hidden = false;
      badge.classList.add('is-visible');
      badge.setAttribute('aria-hidden', 'false');
      return;
    }

    badge.classList.remove('is-visible');
    badge.setAttribute('aria-hidden', 'true');
    badge[BULK_BADGE_HIDE_TIMER_KEY] = window.setTimeout(() => {
      if (!badge.classList.contains('is-visible')) badge.hidden = true;
      badge[BULK_BADGE_HIDE_TIMER_KEY] = 0;
    }, 160);
  }

  function parseTagsInput(raw) {
    const seen = new Set();
    return String(raw || '')
      .split(',')
      .map((part) => String(part || '').trim())
      .filter((tag) => {
        const key = tag.toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  function getAdventureVisibleSourceIndexSet() {
    const out = new Set();
    const list = Array.isArray(window.totalFilteredAdventures) ? window.totalFilteredAdventures : [];
    list.forEach((item) => {
      const idx = Number(item && item.sourceIndex);
      if (Number.isInteger(idx) && idx >= 0) out.add(idx);
    });

    // Fallback for moments when filtered cache is not yet hydrated.
    if (out.size === 0) {
      const grid = document.getElementById('adventureCardsGrid');
      if (grid) {
        grid.querySelectorAll('.adventure-card').forEach((card) => {
          const idx = getCardSourceIndex(card);
          if (Number.isInteger(idx) && idx >= 0) out.add(idx);
        });
      }
    }

    return out;
  }

  function getAdventureCurrentPageSourceIndexSet() {
    const out = new Set();
    const page = Number(window.currentPage || 1);
    const perPage = Number(window.itemsPerPage || 20);
    const list = Array.isArray(window.totalFilteredAdventures) ? window.totalFilteredAdventures : [];
    const start = Math.max(0, (Math.max(1, page) - 1) * Math.max(1, perPage));
    const pageItems = list.slice(start, start + Math.max(1, perPage));
    pageItems.forEach((item) => {
      const idx = Number(item && item.sourceIndex);
      if (Number.isInteger(idx) && idx >= 0) out.add(idx);
    });
    return out;
  }

  function getAdventureSelectionScope() {
    const scopeSelect = document.getElementById('adventureBulkSelectionScope');
    return String(scopeSelect && scopeSelect.value ? scopeSelect.value : 'filtered').trim().toLowerCase() === 'page'
      ? 'page'
      : 'filtered';
  }

  function getAdventureSelectionScopeLabel() {
    return getAdventureSelectionScope() === 'page' ? 'Current Page' : 'Filtered Results';
  }

  function getAdventureScopeSourceIndexSet() {
    return getAdventureSelectionScope() === 'page'
      ? getAdventureCurrentPageSourceIndexSet()
      : getAdventureVisibleSourceIndexSet();
  }

  function pruneAdventureSelectionToVisible() {
    const visible = getAdventureVisibleSourceIndexSet();
    if (visible.size === 0) return;
    const beforeCount = adventureState.selectedSourceIndexes.size;
    Array.from(adventureState.selectedSourceIndexes).forEach((idx) => {
      if (!visible.has(idx)) adventureState.selectedSourceIndexes.delete(idx);
    });
    if (beforeCount !== adventureState.selectedSourceIndexes.size) {
      debugLog(`⚠️ Pruned selection from ${beforeCount} to ${adventureState.selectedSourceIndexes.size}`);
    }
  }

  function updateAdventureBulkSelectionUi() {
    if (!isAdventureBulkContextActive()) return;
    debugLog('🔄 updateAdventureBulkSelectionUi() called - Selection size:', adventureState.selectedSourceIndexes.size, 'Busy:', adventureState.busy);

    pruneAdventureSelectionToVisible();
    const count = adventureState.selectedSourceIndexes.size;
    const pageSet = getAdventureCurrentPageSourceIndexSet();
    const pageSelectedCount = Array.from(adventureState.selectedSourceIndexes).reduce((total, idx) => {
      return total + (pageSet.has(idx) ? 1 : 0);
    }, 0);
    const countEl = document.getElementById('adventureBulkSelectionCount');
    if (countEl) countEl.textContent = `${pageSelectedCount} on page / ${count} total selected`;

    const disable = count === 0 || adventureState.busy;
    debugLog(`  → Button disable state: ${disable} (count=${count}, busy=${adventureState.busy})`);

    ['adventureBulkApplyTagsBtn', 'adventureBulkApplyRatingBtn', 'adventureBulkMarkFavoriteBtn', 'adventureBulkUnmarkFavoriteBtn', 'adventureBulkMarkVisitedBtn', 'adventureBulkUnmarkVisitedBtn', 'adventureBulkClearSelectionBtn'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.disabled = disable;
        debugLog(`    - ${id}: disabled=${disable}`);
      }
    });

    const invertBtn = document.getElementById('adventureBulkInvertSelectionBtn');
    if (invertBtn) {
      const sourceSet = getAdventureScopeSourceIndexSet();
      invertBtn.disabled = adventureState.busy || sourceSet.size === 0;
      debugLog(`    - adventureBulkInvertSelectionBtn: disabled=${invertBtn.disabled}`);
    }

    const selectVisibleBtn = document.getElementById('adventureBulkSelectVisibleBtn');
    if (selectVisibleBtn) {
      selectVisibleBtn.disabled = adventureState.busy;
      debugLog(`    - adventureBulkSelectVisibleBtn: disabled=${selectVisibleBtn.disabled}`);
    }

    document.querySelectorAll('.adventure-bulk-select').forEach((checkbox) => {
      const raw = String(checkbox.getAttribute('data-adventure-source-index') || '').trim();
      const idx = /^\d+$/.test(raw) ? Number(raw) : NaN;
      const isSelected = Number.isInteger(idx) && adventureState.selectedSourceIndexes.has(idx);
      checkbox.checked = isSelected;
      checkbox.disabled = adventureState.busy;

      const card = checkbox.closest ? checkbox.closest('.adventure-card') : null;
      if (card) card.classList.toggle('adventure-bulk-card-selected', isSelected);

      if (Number.isInteger(idx) && idx >= 0) {
        if (!isSelected) {
          adventureState.pulsedSelectionSourceIndexes.delete(idx);
          if (card) card.classList.remove('adventure-bulk-card-selected-pulse');
        } else if (!adventureState.pulsedSelectionSourceIndexes.has(idx) && card && !prefersReducedMotion()) {
          adventureState.pulsedSelectionSourceIndexes.add(idx);
          card.classList.remove('adventure-bulk-card-selected-pulse');
          // Force restart so pulse always plays once when newly selected.
          void card.offsetWidth;
          card.classList.add('adventure-bulk-card-selected-pulse');
          window.setTimeout(() => {
            card.classList.remove('adventure-bulk-card-selected-pulse');
          }, 320);
        }
      }

      const wrap = checkbox.closest ? checkbox.closest('.adventure-bulk-select-wrap') : null;
      const badge = wrap ? wrap.querySelector('.adventure-bulk-selected-badge') : null;
      setBulkSelectedBadgeState(badge, isSelected);
    });
  }

  function setAdventureBulkBusy(isBusy) {
    const wasNotBusy = !adventureState.busy;
    const isNowBusy = Boolean(isBusy);
    if (wasNotBusy && isNowBusy) {
      debugLog('🔒 BULK BUSY: TRUE');
    } else if (!isNowBusy) {
      debugLog('🔓 BULK BUSY: FALSE');
    }
    adventureState.busy = isNowBusy;
    updateAdventureBulkSelectionUi();
  }

  function setAdventureSelectionFromScope() {
    const scope = getAdventureSelectionScope();
    const sourceSet = getAdventureScopeSourceIndexSet();
    adventureState.selectedSourceIndexes.clear();
    sourceSet.forEach((idx) => adventureState.selectedSourceIndexes.add(idx));
    debugLog(`✅ setAdventureSelectionFromScope (${scope}): Selected ${adventureState.selectedSourceIndexes.size} items`);
    updateAdventureBulkSelectionUi();
  }

  function invertAdventureSelectionFromScope() {
    const scope = getAdventureSelectionScope();
    const sourceSet = getAdventureScopeSourceIndexSet();
    if (!sourceSet.size) {
      window.showToast?.('No locations available in this scope.', 'info', 2000);
      return;
    }

    sourceSet.forEach((idx) => {
      if (adventureState.selectedSourceIndexes.has(idx)) adventureState.selectedSourceIndexes.delete(idx);
      else adventureState.selectedSourceIndexes.add(idx);
    });
    debugLog(`🔄 invertAdventureSelectionFromScope (${scope}): Now ${adventureState.selectedSourceIndexes.size} selected`);
    updateAdventureBulkSelectionUi();
    window.showToast?.(`Selection inverted for ${getAdventureSelectionScopeLabel()}.`, 'info', 2000);
  }

  function clearAdventureSelection() {
    debugLog(`🗑️ clearAdventureSelection: Clearing ${adventureState.selectedSourceIndexes.size} items`);
    adventureState.selectedSourceIndexes.clear();
    updateAdventureBulkSelectionUi();
  }

  function syncAdventureBulkSelectButtonLabel() {
    const selectBtn = document.getElementById('adventureBulkSelectVisibleBtn');
    const invertBtn = document.getElementById('adventureBulkInvertSelectionBtn');
    const hintEl = document.getElementById('adventureBulkSelectionScopeHint');
    if (!selectBtn) return;
    const scope = getAdventureSelectionScope();
    selectBtn.textContent = scope === 'page' ? 'Select Page' : 'Select Filtered';
    if (invertBtn) invertBtn.textContent = scope === 'page' ? 'Invert Page' : 'Invert Filtered';
    if (hintEl) {
      const hintTextEl = hintEl.querySelector('.bulk-scope-hint-text');
      const nextText = scope === 'page'
        ? 'Selection applies to the current page only.'
        : 'Selection applies to all filtered results.';
      if (hintTextEl) hintTextEl.textContent = nextText;
      else hintEl.textContent = nextText;
    }
    debugLog(`📝 Button labels synced to scope: ${scope}`);
  }

  function getCardSourceIndex(card) {
    if (!card) return -1;
    const raw = String(card.getAttribute('data-source-index') || card.getAttribute('data-index') || '').trim();
    if (!/^\d+$/.test(raw)) return -1;
    const idx = Number(raw);
    return Number.isInteger(idx) && idx >= 0 ? idx : -1;
  }

  function isBulkSelectionTarget(target) {
    return Boolean(target && target.closest && target.closest('.adventure-bulk-select-wrap, .adventure-bulk-select, [data-no-card-open]'));
  }

  function decorateAdventureCardsForBulkSelection() {
    const grid = document.getElementById('adventureCardsGrid');
    if (!grid) return;

    ensureAdventureBulkSelectionRailStyles();

    let decoratedCount = 0;
    grid.querySelectorAll('.adventure-card').forEach((card) => {
      if (card.querySelector('.adventure-bulk-select-wrap')) return;
      const sourceIndex = getCardSourceIndex(card);
      if (sourceIndex < 0) return;

      card.classList.add('adventure-bulk-card-selectable');

      const wrap = document.createElement('div');
      wrap.className = 'adventure-bulk-select-wrap';
      wrap.setAttribute('data-no-card-open', '1');
      wrap.innerHTML = `<label class="adventure-bulk-select-label" data-no-card-open="1"><input type="checkbox" class="adventure-bulk-select" data-no-card-open="1" data-adventure-source-index="${sourceIndex}"><span>Select for bulk actions</span></label><span class="adventure-bulk-selected-badge" data-no-card-open="1" aria-hidden="true" hidden>Selected</span>`;
      card.insertBefore(wrap, card.firstChild);
      decoratedCount++;
    });

    if (decoratedCount > 0) {
      debugLog(`🎨 Decorated ${decoratedCount} cards with bulk selection UI`);
    }

    updateAdventureBulkSelectionUi();
  }

  function bindAdventureGridSelectionHandlers() {
    const grid = document.getElementById('adventureCardsGrid');
    if (!grid || grid.dataset.adventureBulkDelegatesBound === '1') return;

    debugLog('🔗 Binding grid selection handlers...');

    // Capture phase to keep card-open delegate from firing when checkbox is used.
    grid.addEventListener('pointerdown', (event) => {
      if (!isBulkSelectionTarget(event.target)) return;
      event.stopImmediatePropagation();
      event.stopPropagation();
    }, true);

    grid.addEventListener('mousedown', (event) => {
      if (!isBulkSelectionTarget(event.target)) return;
      event.stopImmediatePropagation();
      event.stopPropagation();
    }, true);

    grid.addEventListener('click', (event) => {
      if (!isBulkSelectionTarget(event.target)) return;
      event.stopImmediatePropagation();
      event.stopPropagation();
    }, true);

    grid.addEventListener('change', (event) => {
      const checkbox = event.target && event.target.closest ? event.target.closest('.adventure-bulk-select') : null;
      if (!checkbox) return;
      event.stopPropagation();

      const raw = String(checkbox.getAttribute('data-adventure-source-index') || '').trim();
      const idx = /^\d+$/.test(raw) ? Number(raw) : NaN;
      if (!Number.isInteger(idx) || idx < 0) {
        debugLog('⚠️ Invalid index for checkbox:', raw);
        return;
      }

      if (checkbox.checked) {
        adventureState.selectedSourceIndexes.add(idx);
        debugLog(`✅ Selected item ${idx} - Total now: ${adventureState.selectedSourceIndexes.size}`);
      } else {
        adventureState.selectedSourceIndexes.delete(idx);
        debugLog(`❌ Deselected item ${idx} - Total now: ${adventureState.selectedSourceIndexes.size}`);
      }
      updateAdventureBulkSelectionUi();
    }, true);

    grid.dataset.adventureBulkDelegatesBound = '1';
    debugLog('✅ Grid selection handlers bound');
  }

  function getAdventureColumnIndex(name, fallback) {
    if (typeof window.getColumnIndexByName === 'function') {
      const idx = Number(window.getColumnIndexByName(name));
      if (Number.isInteger(idx) && idx >= 0) return idx;
    }
    return Number(fallback);
  }

  function getAdventureRow(sourceIndex) {
    const row = Array.isArray(window.adventuresData) ? window.adventuresData[sourceIndex] : null;
    return row || null;
  }

  function getAdventurePlaceId(sourceIndex) {
    const row = getAdventureRow(sourceIndex);
    const values = Array.isArray(row && row.values && row.values[0]) ? row.values[0] : [];
    return String(values[1] || '').trim() || `adventure:${sourceIndex}`;
  }

  async function persistAdventureRowValues(sourceIndex, values) {
    const row = getAdventureRow(sourceIndex);
    if (!row) throw new Error('Adventure row not found.');

    row.values = [values];

    if (window.accessToken && typeof window.saveToExcel === 'function' && row.rowId) {
      await window.saveToExcel(row.rowId, values);
    }
  }

  async function updateAdventureColumns(sourceIndex, updatesByIndex) {
    const row = getAdventureRow(sourceIndex);
    if (!row) throw new Error('Adventure row not found.');
    const values = Array.isArray(row.values && row.values[0]) ? row.values[0].slice() : [];

    Object.entries(updatesByIndex || {}).forEach(([key, value]) => {
      const idx = Number(key);
      if (!Number.isInteger(idx) || idx < 0) return;
      while (values.length <= idx) values.push('');
      values[idx] = value;
    });

    await persistAdventureRowValues(sourceIndex, values);
  }

  function snapshotAdventureRowValues(sourceIndex) {
    const row = getAdventureRow(sourceIndex);
    if (!row) return null;
    const values = Array.isArray(row.values && row.values[0]) ? row.values[0].slice() : [];
    return {
      kind: 'row',
      sourceIndex,
      values
    };
  }

  function snapshotAdventureTagValues(sourceIndex) {
    if (!window.tagManager || typeof window.tagManager.getTagsForPlace !== 'function') return null;
    const placeId = getAdventurePlaceId(sourceIndex);
    const currentTags = window.tagManager.getTagsForPlace(placeId) || [];
    return {
      kind: 'tags',
      placeId,
      tags: Array.isArray(currentTags) ? currentTags.slice() : []
    };
  }

  async function restoreAdventureSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') return false;

    if (snapshot.kind === 'tags') {
      if (!window.tagManager || typeof window.tagManager.setTagsForPlace !== 'function') return false;
      const placeId = String(snapshot.placeId || '').trim();
      if (!placeId) return false;
      const nextTags = Array.isArray(snapshot.tags) ? snapshot.tags.slice() : [];
      window.tagManager.setTagsForPlace(placeId, nextTags);
      return true;
    }

    if (!Number.isInteger(snapshot.sourceIndex) || snapshot.sourceIndex < 0) return false;
    if (!Array.isArray(snapshot.values)) return false;
    await persistAdventureRowValues(snapshot.sourceIndex, snapshot.values.slice());
    return true;
  }

  async function restoreAdventureSnapshots(snapshots, options = {}) {
    const list = Array.isArray(snapshots) ? snapshots : [];
    const chunkSize = Math.max(1, Number(options.chunkSize) || BULK_UNDO_RESTORE_CHUNK);
    let restored = 0;

    for (let i = 0; i < list.length; i += chunkSize) {
      const chunk = list.slice(i, i + chunkSize);
      for (const snapshot of chunk) {
        const didRestore = await restoreAdventureSnapshot(snapshot);
        if (didRestore) restored += 1;
      }
      if (i + chunkSize < list.length) {
        await new Promise((resolve) => window.setTimeout(resolve, 0));
      }
    }

    return restored;
  }

  function refreshAdventureUiAfterBulk() {
    if (window.FilterManager && typeof window.FilterManager.applyAllFilters === 'function') {
      window.FilterManager.applyAllFilters();
      return;
    }
    if (typeof window.renderPaginatedCards === 'function') {
      window.renderPaginatedCards();
    }
  }

  async function runAdventureBulkOperation(label, worker, options = {}) {
    const targets = Array.from(adventureState.selectedSourceIndexes).filter((idx) => Number.isInteger(idx) && idx >= 0);
    if (!targets.length) {
      window.showToast?.('Select one or more locations first.', 'warning', 2200);
      return;
    }

    const autoClear = Boolean(document.getElementById('adventureBulkAutoClearToggle')?.checked);

    setAdventureBulkBusy(true);
    let success = 0;
    let failed = 0;
    const undoSnapshots = [];
    const snapshotBefore = typeof options.snapshotBefore === 'function' ? options.snapshotBefore : null;
    const restoreSnapshots = typeof options.restoreSnapshots === 'function' ? options.restoreSnapshots : restoreAdventureSnapshots;
    const maxUndoSnapshots = Math.max(0, Number(options.maxUndoSnapshots) || BULK_UNDO_MAX_SNAPSHOTS);
    const restoreChunkSize = Math.max(1, Number(options.restoreChunkSize) || BULK_UNDO_RESTORE_CHUNK);
    let undoCoverageLimited = false;

    try {
      for (const sourceIndex of targets) {
        try {
          let snapshot = null;
          if (snapshotBefore) {
            try {
              snapshot = snapshotBefore(sourceIndex);
            } catch (snapshotError) {
              console.warn(`[adventure] Bulk ${label} snapshot failed for sourceIndex ${sourceIndex}:`, snapshotError);
            }
          }
          // Sequential updates keep Excel writes predictable and easier to recover.
          await worker(sourceIndex);
          if (snapshot) {
            if (undoSnapshots.length < maxUndoSnapshots) {
              undoSnapshots.push(snapshot);
            } else {
              undoCoverageLimited = true;
            }
          }
          success += 1;
        } catch (error) {
          failed += 1;
          console.warn(`[adventure] Bulk ${label} failed for sourceIndex ${sourceIndex}:`, error);
        }
      }

      const scopeLabel = getAdventureSelectionScopeLabel();
      const attempted = targets.length;

      if (failed > 0) {
        window.showToast?.(`Bulk ${label} (${scopeLabel}): ${success}/${attempted} updated, ${failed} failed`, 'warning', 3400);
      } else {
        window.showToast?.(`Bulk ${label} (${scopeLabel}): ${success}/${attempted} updated`, 'success', 2400);
      }

      if (success > 0 && undoSnapshots.length > 0 && typeof window.showUndoToast === 'function') {
        const descriptor = String(options.undoLabel || label);
        const coverageNote = undoCoverageLimited ? ` (undo covers first ${undoSnapshots.length})` : '';
        window.showUndoToast(`Bulk ${descriptor} applied to ${undoSnapshots.length} location${undoSnapshots.length === 1 ? '' : 's'}${coverageNote}`, () => {
          restoreSnapshots(undoSnapshots, { chunkSize: restoreChunkSize })
            .then((restoredCount) => {
              window.showToast?.(`Undo applied for bulk ${descriptor}.`, 'success', 2000);
              if (undoCoverageLimited) {
                window.showToast?.(`Undo restored ${restoredCount} of ${attempted} updates (snapshot cap).`, 'info', 2800);
              }
              refreshAdventureUiAfterBulk();
              decorateAdventureCardsForBulkSelection();
            })
            .catch((error) => {
              console.warn(`[adventure] Undo failed for bulk ${descriptor}:`, error);
              window.showToast?.(`Undo failed for bulk ${descriptor}.`, 'error', 2600);
            });
        }, 9000);
      }

      if (autoClear && failed === 0) {
        clearAdventureSelection();
      }
    } finally {
      setAdventureBulkBusy(false);
      refreshAdventureUiAfterBulk();
      decorateAdventureCardsForBulkSelection();
    }
  }

  async function applyAdventureBulkTags() {
    const input = document.getElementById('adventureBulkTagsInput');
    const tagsToAdd = parseTagsInput(input ? input.value : '');
    if (!tagsToAdd.length) {
      window.showToast?.('Enter one or more tags (comma separated).', 'warning', 2200);
      return;
    }

    await runAdventureBulkOperation('tag add', async (sourceIndex) => {
      const placeId = getAdventurePlaceId(sourceIndex);
      if (!window.tagManager || typeof window.tagManager.addTagsToPlace !== 'function') {
        throw new Error('Tag manager is unavailable.');
      }
      window.tagManager.addTagsToPlace(placeId, tagsToAdd);
    }, {
      undoLabel: 'tag add',
      snapshotBefore: snapshotAdventureTagValues
    });
  }

  async function applyAdventureBulkRating() {
    const select = document.getElementById('adventureBulkRatingSelect');
    const value = Number(select && select.value);
    if (!Number.isFinite(value) || value < 1 || value > 5) {
      window.showToast?.('Choose a rating from 1 to 5.', 'warning', 2200);
      return;
    }

    const ratingIdx = getAdventureColumnIndex('My Rating', 21);
    await runAdventureBulkOperation('rating', async (sourceIndex) => {
      await updateAdventureColumns(sourceIndex, { [ratingIdx]: String(value) });
    }, {
      undoLabel: 'rating update',
      snapshotBefore: snapshotAdventureRowValues
    });
  }

  async function applyAdventureBulkFavorite() {
    const favoriteIdx = getAdventureColumnIndex('Favorite Status', 22);
    const selected = adventureState.selectedSourceIndexes.size;
    if (selected > BULK_STATUS_CONFIRM_THRESHOLD && !window.confirm(`Apply "Mark Favorite" to ${selected} selected locations?`)) return;
    await runAdventureBulkOperation('favorite', async (sourceIndex) => {
      await updateAdventureColumns(sourceIndex, { [favoriteIdx]: 'TRUE' });
    }, {
      undoLabel: 'favorite mark',
      snapshotBefore: snapshotAdventureRowValues
    });
  }

  async function applyAdventureBulkUnfavorite() {
    const favoriteIdx = getAdventureColumnIndex('Favorite Status', 22);
    const selected = adventureState.selectedSourceIndexes.size;
    if (selected > BULK_STATUS_CONFIRM_THRESHOLD && !window.confirm(`Apply "Unmark Favorite" to ${selected} selected locations?`)) return;
    await runAdventureBulkOperation('unfavorite', async (sourceIndex) => {
      await updateAdventureColumns(sourceIndex, { [favoriteIdx]: '' });
    }, {
      undoLabel: 'favorite clear',
      snapshotBefore: snapshotAdventureRowValues
    });
  }

  async function applyAdventureBulkVisited() {
    const visitedIdx = getAdventureColumnIndex('Visited', 24);
    const selected = adventureState.selectedSourceIndexes.size;
    if (selected > BULK_STATUS_CONFIRM_THRESHOLD && !window.confirm(`Apply "Mark Visited" to ${selected} selected locations?`)) return;
    await runAdventureBulkOperation('visited', async (sourceIndex) => {
      await updateAdventureColumns(sourceIndex, { [visitedIdx]: 'TRUE' });
    }, {
      undoLabel: 'visited mark',
      snapshotBefore: snapshotAdventureRowValues
    });
  }

  async function applyAdventureBulkUnvisited() {
    const visitedIdx = getAdventureColumnIndex('Visited', 24);
    const selected = adventureState.selectedSourceIndexes.size;
    if (selected > BULK_STATUS_CONFIRM_THRESHOLD && !window.confirm(`Apply "Unmark Visited" to ${selected} selected locations?`)) return;
    await runAdventureBulkOperation('unvisited', async (sourceIndex) => {
      await updateAdventureColumns(sourceIndex, { [visitedIdx]: '' });
    }, {
      undoLabel: 'visited clear',
      snapshotBefore: snapshotAdventureRowValues
    });
  }

  function bindAdventureBulkButtons() {
    const card = document.getElementById('adventureBulkActionsCard');
    if (!card || card.dataset.bound === '1') return;

    const selectVisibleBtn = document.getElementById('adventureBulkSelectVisibleBtn');
    if (selectVisibleBtn) {
      selectVisibleBtn.addEventListener('click', () => {
        setAdventureSelectionFromScope();
      });
    }

    const scopeSelect = document.getElementById('adventureBulkSelectionScope');
    if (scopeSelect) {
      scopeSelect.addEventListener('change', () => {
        syncAdventureBulkSelectButtonLabel();
      });
    }

    const clearBtn = document.getElementById('adventureBulkClearSelectionBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        clearAdventureSelection();
      });
    }

    const invertBtn = document.getElementById('adventureBulkInvertSelectionBtn');
    if (invertBtn) {
      invertBtn.addEventListener('click', () => {
        invertAdventureSelectionFromScope();
      });
    }

    const tagsBtn = document.getElementById('adventureBulkApplyTagsBtn');
    if (tagsBtn) {
      tagsBtn.addEventListener('click', () => {
        applyAdventureBulkTags();
      });
    }

    const ratingBtn = document.getElementById('adventureBulkApplyRatingBtn');
    if (ratingBtn) {
      ratingBtn.addEventListener('click', () => {
        applyAdventureBulkRating();
      });
    }

    const favoriteBtn = document.getElementById('adventureBulkMarkFavoriteBtn');
    if (favoriteBtn) {
      favoriteBtn.addEventListener('click', () => {
        applyAdventureBulkFavorite();
      });
    }

    const unfavoriteBtn = document.getElementById('adventureBulkUnmarkFavoriteBtn');
    if (unfavoriteBtn) {
      unfavoriteBtn.addEventListener('click', () => {
        applyAdventureBulkUnfavorite();
      });
    }

    const visitedBtn = document.getElementById('adventureBulkMarkVisitedBtn');
    if (visitedBtn) {
      visitedBtn.addEventListener('click', () => {
        applyAdventureBulkVisited();
      });
    }

    const unvisitedBtn = document.getElementById('adventureBulkUnmarkVisitedBtn');
    if (unvisitedBtn) {
      unvisitedBtn.addEventListener('click', () => {
        applyAdventureBulkUnvisited();
      });
    }

    card.dataset.bound = '1';
    syncAdventureBulkSelectButtonLabel();
    updateAdventureBulkSelectionUi();
  }

  function ensureAdventureBulkWiring() {
    if (!isAdventureBulkContextActive()) return;

    bindAdventureBulkButtons();
    bindAdventureGridSelectionHandlers();

    const grid = document.getElementById('adventureCardsGrid');
    if (!grid) return;

    const wiringSignature = [
      grid.querySelectorAll('.adventure-card').length,
      grid.querySelectorAll('.adventure-bulk-select-wrap').length,
      adventureState.busy ? 1 : 0,
      adventureState.selectedSourceIndexes.size,
      getAdventureSelectionScope(),
      Number(window.currentPage || 1)
    ].join('|');

    if (adventureState.lastWiringSignature !== wiringSignature) {
      adventureState.lastWiringSignature = wiringSignature;
      decorateAdventureCardsForBulkSelection();
    }

    if (!adventureState.observer) {
      adventureState.observer = new MutationObserver(() => {
        clearTimeout(adventureState.observerDebounceId);
        adventureState.observerDebounceId = window.setTimeout(() => {
          ensureAdventureBulkWiring();
        }, 80);
      });
      adventureState.observer.observe(grid, { childList: true, subtree: false });
    }
  }

  function startInitLoop() {
    if (adventureState.initialized) return;
    adventureState.initialized = true;

    const tick = () => ensureAdventureBulkWiring();
    tick();

    if (!adventureState.initIntervalId) {
      // Keep a light heartbeat for tab/pagination transitions without constant DOM rewrites.
      adventureState.initIntervalId = window.setInterval(tick, 2200);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') tick();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startInitLoop, { once: true });
  } else {
    startInitLoop();
  }
})();

