/**
 * BUTTON RELIABILITY LAYER
 * ========================
 * Keeps buttons responsive and stabilizes row-detail modal interactions.
 *
 * Version: v7.0.142
 * Date: March 22, 2026
 */

(function () {
  console.log('🔘 Initializing SAFE Button Reliability Layer...');

  let rowDetailFixInstalled = false;
  let globalDetailDelegatesBound = false;
  let filterReliabilityBound = false;
  let filterReliabilityLogShown = false;

  function normalizeButton(button) {
    if (!button) return;
    button.style.pointerEvents = 'auto';
    if (!button.disabled && !button.style.touchAction) {
      button.style.touchAction = 'manipulation';
    }
  }

  function touchButtonFromEvent(event) {
    const button = event.target && event.target.closest ? event.target.closest('button') : null;
    if (!button) return;
    normalizeButton(button);
  }

  function refreshVisibleButtons() {
    document.querySelectorAll('button').forEach(normalizeButton);
  }

  function getRowDetailParts() {
    return {
      modal: document.getElementById('rowDetailModal'),
      backdrop: document.getElementById('rowDetailModalBackdrop'),
      title: document.getElementById('rowDetailTitle'),
      location: document.getElementById('rowDetailLocation'),
      tabs: document.getElementById('rowDetailTabsContainer'),
      content: document.getElementById('rowDetailContent'),
      closeBtn: document.getElementById('rowDetailCloseBtn'),
      closeFooterBtn: document.getElementById('rowDetailCloseFooterBtn'),
      editBtn: document.getElementById('rowDetailEditBtn')
    };
  }

  function isVisible(element) {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  }

  function isInteractiveCardTarget(target) {
    if (!target || !target.closest) return false;
    return Boolean(target.closest(
      'button, a, input, select, textarea, label, .rating-star, .tag-pill, .card-address-copy, .tag-manager-btn, .card-favorite-btn, .card-rating'
    ));
  }

  function isInAdventureCardsGrid(target) {
    return Boolean(target && target.closest && target.closest('#adventureCardsGrid'));
  }

  function isAdventureDomainTarget(target) {
    const card = target && target.closest ? target.closest('[data-card-domain]') : null;
    return Boolean(card && card.getAttribute('data-card-domain') === 'adventure');
  }

  function resolveCardIndexFromElement(element) {
    if (!element) return null;

    const fromSourceAttr = Number(element.getAttribute('data-source-index'));
    if (Number.isInteger(fromSourceAttr) && fromSourceAttr >= 0) return fromSourceAttr;

    const detailsButton = element.querySelector('.card-details-btn');
    const fromDetailsSource = detailsButton ? Number(detailsButton.getAttribute('data-source-index')) : NaN;
    if (Number.isInteger(fromDetailsSource) && fromDetailsSource >= 0) return fromDetailsSource;

    const fromDetails = detailsButton ? Number(detailsButton.getAttribute('data-index')) : NaN;
    if (Number.isInteger(fromDetails) && fromDetails >= 0) return fromDetails;

    const fromDataAttr = Number(element.getAttribute('data-index'));
    if (Number.isInteger(fromDataAttr) && fromDataAttr >= 0) return fromDataAttr;

    return null;
  }

  function extractDetailIndexFromSimilarItem(item) {
    if (!item) return null;

    const dataIndex = Number(item.getAttribute('data-detail-index') || item.getAttribute('data-index'));
    if (Number.isInteger(dataIndex) && dataIndex >= 0) return dataIndex;

    const onclickText = String(item.getAttribute('onclick') || '');
    const match = onclickText.match(/showCardDetails\((\d+)\)/);
    if (match) return Number(match[1]);

    return null;
  }

  function ensureEditingRowFromModalDataset() {
    const parts = getRowDetailParts();
    const raw = parts.modal ? parts.modal.dataset.currentRowIndex : '';
    const sourceIndex = Number(raw);

    if (!Number.isInteger(sourceIndex) || sourceIndex < 0) return false;
    if (!Array.isArray(window.adventuresData) || !window.adventuresData[sourceIndex]) return false;

    window.currentEditingRowIndex = sourceIndex;
    window.currentEditingRow = window.adventuresData[sourceIndex];
    return true;
  }

  function syncRowDetailContextFromGlobals() {
    const parts = getRowDetailParts();
    if (!parts.modal) return;

    if (Number.isInteger(window.currentEditingRowIndex) && window.currentEditingRowIndex >= 0) {
      parts.modal.dataset.currentRowIndex = String(window.currentEditingRowIndex);
    }
  }

  function isEditModeActive() {
    if (window.isInEditMode === true) return true;
    const parts = getRowDetailParts();
    const editText = String(parts.editBtn ? parts.editBtn.textContent : '').toLowerCase();
    return editText.includes('save');
  }

  function captureRowDetailFormSnapshot() {
    const parts = getRowDetailParts();
    if (!parts.modal) return [];

    return Array.from(parts.modal.querySelectorAll('input, select, textarea'))
      .filter((el) => !el.disabled && el.type !== 'hidden')
      .map((el, idx) => ({
        ref: el,
        id: el.id || '',
        name: el.name || '',
        index: idx,
        type: el.type || '',
        value: el.value,
        checked: !!el.checked
      }));
  }

  function restoreRowDetailFormSnapshot(snapshot) {
    if (!Array.isArray(snapshot) || snapshot.length === 0) return;
    const parts = getRowDetailParts();
    if (!parts.modal) return;

    snapshot.forEach((field) => {
      let target = field.ref && field.ref.isConnected ? field.ref : null;
      if (!target && field.id) {
        target = parts.modal.querySelector(`#${field.id}`);
      }
      if (!target && field.name) {
        const candidates = parts.modal.querySelectorAll(`[name="${field.name}"]`);
        target = candidates[field.index] || candidates[0] || null;
      }
      if (!target) return;

      if (field.type === 'checkbox' || field.type === 'radio') {
        target.checked = !!field.checked;
      } else {
        target.value = field.value;
      }

      target.dispatchEvent(new Event('input', { bubbles: true }));
      target.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  function clearRowDetailSaveErrorBanner() {
    const parts = getRowDetailParts();
    if (!parts.modal) return;
    const banner = parts.modal.querySelector('#rowDetailSaveErrorBanner');
    if (banner) banner.remove();
  }

  function setRetryButtonState() {
    const parts = getRowDetailParts();
    if (!parts.editBtn) return;
    parts.editBtn.textContent = '💾 Retry Save';
    parts.editBtn.style.background = '#dc2626';
    parts.editBtn.style.color = '#ffffff';
    parts.editBtn.dataset.rowDetailSaveState = 'retry';
  }

  function clearRetryButtonState() {
    const parts = getRowDetailParts();
    if (!parts.editBtn) return;
    parts.editBtn.dataset.rowDetailSaveState = '';
    parts.editBtn.style.background = '';
    parts.editBtn.style.color = '';
  }

  function showRowDetailSaveErrorBanner(message, diagnosticCode = null) {
    const parts = getRowDetailParts();
    if (!parts.modal) return;

    clearRowDetailSaveErrorBanner();

    const codePrefix = diagnosticCode ? `[${diagnosticCode}] ` : '';
    const banner = document.createElement('div');
    banner.id = 'rowDetailSaveErrorBanner';
    banner.style.cssText = 'margin: 12px 0; padding: 10px 12px; border-radius: 8px; border: 1px solid #fca5a5; background: #fef2f2; color: #991b1b; font-size: 12px;';
    banner.innerHTML = `
      <div style="font-weight: 700; margin-bottom: 6px;">${codePrefix}Save failed. Your edits are still here.</div>
      <div style="margin-bottom: 8px;">${String(message || 'Unknown save error')}</div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button type="button" id="rowDetailRetrySaveBtn" style="padding: 6px 10px; border: none; border-radius: 6px; background: #dc2626; color: #fff; cursor: pointer;">Retry Save</button>
        <button type="button" id="rowDetailDismissSaveErrorBtn" style="padding: 6px 10px; border: 1px solid #fca5a5; border-radius: 6px; background: #fff; color: #991b1b; cursor: pointer;">Dismiss</button>
      </div>
    `;

    const host = parts.content || parts.tabs || parts.modal;
    if (host && host.parentNode) {
      host.parentNode.insertBefore(banner, host);
    } else {
      parts.modal.prepend(banner);
    }
  }

  function keepRowDetailInEditForRetry() {
    if (!window.currentEditingRow || !Number.isInteger(window.currentEditingRowIndex)) {
      ensureEditingRowFromModalDataset();
    }
    window.isInEditMode = true;
    setRetryButtonState();
    syncRowDetailContextFromGlobals();
  }

  const ROW_DETAIL_SAVE_CODES = Object.freeze({
    SAFE_WRAPPER_MISSING: { code: 'RD_SAVE_001', reason: 'safe save wrapper missing' },
    RETRY_WRAPPER_MISSING: { code: 'RD_SAVE_002', reason: 'retry clicked but safe save wrapper missing' },
    SAVE_UNCONFIRMED: { code: 'RD_SAVE_003', reason: 'save returned false or unconfirmed' },
    SAVE_EXCEPTION: { code: 'RD_SAVE_004', reason: 'exception thrown during save' },
    SAVE_FUNCTION_UNAVAILABLE: { code: 'RD_SAVE_005', reason: 'save function unavailable' },
    UNKNOWN: { code: 'RD_SAVE_999', reason: 'unknown save diagnostic' }
  });

  function logRowDetailSaveDiagnostic(reasonOrKey, error, context = {}) {
    const mapped = ROW_DETAIL_SAVE_CODES[reasonOrKey] || null;
    const reason = mapped ? mapped.reason : String(reasonOrKey || ROW_DETAIL_SAVE_CODES.UNKNOWN.reason);
    const diagnosticCode = mapped ? mapped.code : ROW_DETAIL_SAVE_CODES.UNKNOWN.code;

    const safeContext = {
      diagnosticCode,
      rowIndex: Number.isInteger(window.currentEditingRowIndex) ? window.currentEditingRowIndex : -1,
      inEditMode: !!window.isInEditMode,
      ...context
    };

    const errorMessage = error && error.message ? error.message : '';
    const stack = error && error.stack ? String(error.stack) : '';
    const contextText = JSON.stringify(safeContext);
    const detailText = [contextText, errorMessage, stack].filter(Boolean).join('\n');
    const barMessage = `[${diagnosticCode}] Row detail save failure: ${reason}`;

    if (typeof window.logErrorToBar === 'function') {
      window.logErrorToBar('error', barMessage, detailText);
    }

    if (window.errorManager && typeof window.errorManager.logError === 'function') {
      window.errorManager.logError(`${barMessage} | ${contextText}${errorMessage ? ` | ${errorMessage}` : ''}`, 'row-detail-save');
    }

    console.error(`❌ ${barMessage}`, { reason, diagnosticCode, context: safeContext, error });
  }

  function getAdventureEntry(index) {
    const num = Number(index);
    if (!Number.isInteger(num) || num < 0) return null;

    const filtered = Array.isArray(window.totalFilteredAdventures) ? window.totalFilteredAdventures : [];
    const filteredEntry = filtered[num];
    if (filteredEntry && filteredEntry.row) {
      const sourceIndex = Number.isInteger(filteredEntry.sourceIndex)
        ? filteredEntry.sourceIndex
        : Array.isArray(window.adventuresData) ? window.adventuresData.indexOf(filteredEntry.row) : -1;

      if (sourceIndex >= 0) {
        return { row: filteredEntry.row, sourceIndex, filteredIndex: num };
      }
    }

    const sourceRow = Array.isArray(window.adventuresData) ? window.adventuresData[num] : null;
    if (sourceRow) {
      return {
        row: sourceRow,
        sourceIndex: num,
        filteredIndex: filtered.findIndex((entry) => entry && entry.row === sourceRow)
      };
    }

    return null;
  }

  function formatTags(tags) {
    return String(tags || '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag) => `<span class="tag-pill">${tag}</span>`)
      .join('');
  }

  function makeSection(title, body) {
    return `<div class="modal-detail-section"><h3>${title}</h3>${body}</div>`;
  }

  function buildRowDetailTabs(values) {
    const [
      _name,
      googlePlaceId,
      website,
      tags,
      driveTime,
      hoursOfOperation,
      activityDuration,
      difficulty,
      trailLength,
      state,
      city,
      address,
      phoneNumber,
      googleRating,
      cost,
      directions,
      description,
      nearby,
      links,
      links2,
      notes,
      myRating
    ] = values;

    return [
      {
        id: 'overview',
        label: '📋 Overview',
        content: [
          makeSection('📍 Location', `
            <p><strong>Address:</strong> ${address || 'Not available'}</p>
            <p><strong>City:</strong> ${city || 'N/A'}</p>
            <p><strong>State:</strong> ${state || 'N/A'}</p>
            <p><strong>Drive Time:</strong> ${driveTime || 'N/A'}</p>
          `),
          description ? makeSection('📖 Description', `<p>${description}</p>`) : '',
          tags ? makeSection('🏷️ Tags', `<div>${formatTags(tags)}</div>`) : ''
        ].join('')
      },
      {
        id: 'details',
        label: 'ℹ️ Details',
        content: makeSection('Adventure Details', `
          <p><strong>Difficulty:</strong> ${difficulty || 'N/A'}</p>
          <p><strong>Trail Length:</strong> ${trailLength || 'N/A'}</p>
          <p><strong>Duration:</strong> ${activityDuration || 'N/A'}</p>
          <p><strong>Hours:</strong> ${hoursOfOperation || 'N/A'}</p>
          <p><strong>Cost:</strong> ${cost || 'N/A'}</p>
          <p><strong>Google Rating:</strong> ${googleRating || 'N/A'}</p>
          <p><strong>My Rating:</strong> ${myRating || 'N/A'}</p>
        `)
      },
      {
        id: 'contact',
        label: '📞 Contact',
        content: makeSection('Contact & Links', `
          <p><strong>Phone:</strong> ${phoneNumber ? `<a href="tel:${String(phoneNumber).replace(/\s+/g, '')}">${phoneNumber}</a>` : 'Not available'}</p>
          <p><strong>Website:</strong> ${website ? `<a href="${website}" target="_blank" rel="noopener">Visit Website</a>` : 'Not available'}</p>
          <p><strong>Directions:</strong> ${directions ? `<a href="${directions}" target="_blank" rel="noopener">Get Directions</a>` : 'Not available'}</p>
          <p><strong>Google Place ID:</strong> ${googlePlaceId || 'Not available'}</p>
          <p><strong>Links:</strong> ${links ? `<a href="${links}" target="_blank" rel="noopener">Open Link</a>` : 'Not available'}</p>
          <p><strong>More Links:</strong> ${links2 ? `<a href="${links2}" target="_blank" rel="noopener">Open Link</a>` : 'Not available'}</p>
        `)
      },
      {
        id: 'additional',
        label: '📌 Additional',
        content: [
          nearby ? makeSection('🌟 Nearby Attractions', `<p>${nearby}</p>`) : '',
          notes ? makeSection('📝 Notes', `<p>${notes}</p>`) : ''
        ].join('') || makeSection('Additional Info', '<p>No additional information available.</p>')
      }
    ];
  }

  function renderRowDetailFallback(entry) {
    const parts = getRowDetailParts();
    if (!parts.modal || !parts.backdrop || !parts.title || !parts.content || !parts.tabs) {
      console.warn('⚠️ Row detail modal elements not found for fallback render');
      return false;
    }

    const values = entry && entry.row && entry.row.values ? entry.row.values[0] : null;
    if (!Array.isArray(values)) return false;

    const name = values[0] || 'Adventure Details';
    const city = values[10] || 'Unknown';
    const state = values[9] || '';
    const driveTime = values[4] || 'N/A';
    const tabs = buildRowDetailTabs(values);

    parts.modal.dataset.currentRowIndex = String(entry.sourceIndex);
    parts.title.textContent = name;
    if (parts.location) {
      parts.location.innerHTML = `<span>📍 ${city}${state ? `, ${state}` : ''}</span><span>⏱️ ${driveTime}</span>`;
    }

    parts.tabs.innerHTML = tabs.map((tab, idx) => `
      <button class="row-detail-tab-btn ${idx === 0 ? 'active' : ''}" data-tab-id="${tab.id}" type="button">${tab.label}</button>
    `).join('');

    parts.content.innerHTML = tabs.map((tab, idx) => `
      <div class="row-detail-tab-pane ${idx === 0 ? 'active' : ''}" data-tab-id="${tab.id}">${tab.content}</div>
    `).join('');

    parts.tabs.querySelectorAll('.row-detail-tab-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab-id');
        parts.tabs.querySelectorAll('.row-detail-tab-btn').forEach((btn) => btn.classList.remove('active'));
        parts.content.querySelectorAll('.row-detail-tab-pane').forEach((pane) => pane.classList.remove('active'));
        button.classList.add('active');
        const pane = parts.content.querySelector(`.row-detail-tab-pane[data-tab-id="${tabId}"]`);
        if (pane) pane.classList.add('active');
      });
    });

    parts.modal.style.display = 'flex';
    parts.modal.classList.add('visible');
    parts.modal.style.pointerEvents = 'auto';
    parts.backdrop.style.display = 'block';
    parts.backdrop.classList.add('visible');
    parts.backdrop.style.pointerEvents = 'auto';
    document.body.style.overflow = 'hidden';

    return true;
  }

  function closeRowDetailModalHard() {
    const parts = getRowDetailParts();
    if (parts.modal) {
      parts.modal.classList.remove('visible');
      parts.modal.style.display = 'none';
      parts.modal.style.pointerEvents = 'none';
    }
    if (parts.backdrop) {
      parts.backdrop.classList.remove('visible');
      parts.backdrop.style.display = 'none';
      parts.backdrop.style.pointerEvents = 'none';
    }
    document.body.style.overflow = '';
    window.currentEditingRow = null;
    window.currentEditingRowIndex = null;
    return true;
  }

  function bindRowDetailCloseHandlers() {
    const parts = getRowDetailParts();
    const closeTargets = [parts.closeBtn, parts.closeFooterBtn].filter(Boolean);

    closeTargets.forEach((element) => {
      if (element.dataset.rowDetailCloseBound === '1') return;
      element.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        window.closeRowDetailModal();
      }, true);
      element.dataset.rowDetailCloseBound = '1';
    });

    if (parts.backdrop && parts.backdrop.dataset.rowDetailBackdropBound !== '1') {
      parts.backdrop.addEventListener('click', (event) => {
        if (event.target === parts.backdrop) {
          event.preventDefault();
          event.stopPropagation();
          window.closeRowDetailModal();
        }
      }, true);
      parts.backdrop.dataset.rowDetailBackdropBound = '1';
    }
  }

  function bindRowDetailEditHandler() {
    const parts = getRowDetailParts();
    const editButton = parts.editBtn;
    if (!editButton || editButton.dataset.rowDetailEditBound === '1') return;

    editButton.addEventListener('click', async (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (!window.currentEditingRow || !Number.isInteger(window.currentEditingRowIndex)) {
        ensureEditingRowFromModalDataset();
      }
      syncRowDetailContextFromGlobals();

      if (isEditModeActive()) {
        if (typeof window.__rowDetailSafeSaveEditedData === 'function') {
          await window.__rowDetailSafeSaveEditedData();
        } else {
          logRowDetailSaveDiagnostic('SAFE_WRAPPER_MISSING', null, { path: 'editButton' });
        }
        syncRowDetailContextFromGlobals();
        return;
      }

      if (typeof window.__rowDetailOriginalEnableEditMode === 'function') {
        window.__rowDetailOriginalEnableEditMode();
        syncRowDetailContextFromGlobals();
      } else if (typeof window.enableEditMode === 'function' && window.enableEditMode !== window.__rowDetailSafeEnableEditMode) {
        window.enableEditMode();
        syncRowDetailContextFromGlobals();
      } else if (window.showToast) {
        window.showToast('Edit mode is still loading. Please try again.', 'warning', 2000);
      }
    }, true);

    editButton.dataset.rowDetailEditBound = '1';
  }

  function openRowDetailFromAnySource(index) {
    const safeShow = typeof window.__rowDetailSafeShowCardDetails === 'function'
      ? window.__rowDetailSafeShowCardDetails
      : (typeof window.showCardDetails === 'function' ? window.showCardDetails : null);

    if (typeof safeShow !== 'function') {
      console.error('❌ Row detail handler unavailable for index', index);
      return false;
    }

    return safeShow(index);
  }

  function bindGlobalDetailDelegates() {
    if (globalDetailDelegatesBound) return;
    globalDetailDelegatesBound = true;

    document.addEventListener('click', (event) => {
      if (!isInAdventureCardsGrid(event.target)) return;
      if (!isAdventureDomainTarget(event.target)) return;
      const detailsButton = event.target && event.target.closest ? event.target.closest('.card-details-btn') : null;
      if (!detailsButton) return;
      event.preventDefault();
      event.stopPropagation();
      const index = detailsButton.getAttribute('data-index');
      openRowDetailFromAnySource(index);
    }, true);

    document.addEventListener('click', (event) => {
      if (!isInAdventureCardsGrid(event.target)) return;
      if (!isAdventureDomainTarget(event.target)) return;
      const card = event.target && event.target.closest ? event.target.closest('.adventure-card') : null;
      if (!card) return;
      if (isInteractiveCardTarget(event.target)) return;

      const index = resolveCardIndexFromElement(card);
      if (!Number.isInteger(index) || index < 0) return;

      event.preventDefault();
      event.stopPropagation();
      openRowDetailFromAnySource(index);
    }, true);

    document.addEventListener('click', (event) => {
      const item = event.target && event.target.closest ? event.target.closest('#similarAdventuresModal .similar-adventure-item') : null;
      if (!item) return;
      if (isInteractiveCardTarget(event.target)) return;

      const index = extractDetailIndexFromSimilarItem(item);
      if (!Number.isInteger(index) || index < 0) return;

      event.preventDefault();
      event.stopPropagation();
      if (typeof window.closeSimilarAdventuresModal === 'function') {
        window.closeSimilarAdventuresModal();
      }
      openRowDetailFromAnySource(index);
    }, true);

    document.addEventListener('click', (event) => {
      // Never touch clicks inside the bike trail modal — it manages its own tabs
      if (event.target && event.target.closest && event.target.closest('#bikeTrailDetailModal')) return;
      // Scoped strictly to adventure planner modal tab buttons
      const tabButton = event.target && event.target.closest ? event.target.closest('#rowDetailModal .row-detail-tab-btn') : null;
      if (!tabButton) return;
      ensureEditingRowFromModalDataset();
      syncRowDetailContextFromGlobals();
      setTimeout(syncRowDetailContextFromGlobals, 0);
    }, true);

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      const parts = getRowDetailParts();
      if (!isVisible(parts.modal)) return;
      event.preventDefault();
      window.closeRowDetailModal();
    }, true);

    document.addEventListener('click', async (event) => {
      const retryBtn = event.target && event.target.closest ? event.target.closest('#rowDetailRetrySaveBtn') : null;
      if (!retryBtn) return;
      event.preventDefault();
      event.stopPropagation();
      if (typeof window.__rowDetailSafeSaveEditedData === 'function') {
        await window.__rowDetailSafeSaveEditedData();
      } else {
        logRowDetailSaveDiagnostic('RETRY_WRAPPER_MISSING', null, { path: 'retryButton' });
      }
    }, true);

    document.addEventListener('click', (event) => {
      const dismissBtn = event.target && event.target.closest ? event.target.closest('#rowDetailDismissSaveErrorBtn') : null;
      if (!dismissBtn) return;
      event.preventDefault();
      event.stopPropagation();
      clearRowDetailSaveErrorBanner();
    }, true);
  }

  function installRowDetailFixes() {
    if (rowDetailFixInstalled) return;
    rowDetailFixInstalled = true;

    const originalShow = typeof window.showCardDetails === 'function' ? window.showCardDetails : null;
    const originalClose = typeof window.closeRowDetailModal === 'function' ? window.closeRowDetailModal : null;
    const originalEnableEdit = typeof window.enableEditMode === 'function' ? window.enableEditMode : null;
    const originalSaveEdited = typeof window.saveEditedData === 'function' ? window.saveEditedData : null;
    const originalCancelEdit = typeof window.cancelEdit === 'function' ? window.cancelEdit : null;

    window.__rowDetailOriginalShowCardDetails = originalShow;
    window.__rowDetailOriginalClose = originalClose;
    window.__rowDetailOriginalEnableEditMode = originalEnableEdit;
    window.__rowDetailOriginalSaveEditedData = originalSaveEdited;
    window.__rowDetailOriginalCancelEdit = originalCancelEdit;

    window.initRowDetailModal = function () {
      bindRowDetailCloseHandlers();
      bindRowDetailEditHandler();
      return true;
    };

    window.closeRowDetailModal = function () {
      try {
        if (typeof originalClose === 'function' && originalClose !== window.closeRowDetailModal) {
          originalClose();
        }
      } catch (error) {
        console.warn('⚠️ Original closeRowDetailModal failed:', error);
      }
      return closeRowDetailModalHard();
    };

    window.__rowDetailSafeEnableEditMode = function () {
      if (!window.currentEditingRow || !Number.isInteger(window.currentEditingRowIndex)) {
        ensureEditingRowFromModalDataset();
      }

      if (typeof originalEnableEdit === 'function') {
        const result = originalEnableEdit();
        clearRowDetailSaveErrorBanner();
        clearRetryButtonState();
        syncRowDetailContextFromGlobals();
        return result;
      }

      if (window.showToast) {
        window.showToast('Edit mode is not available yet.', 'warning', 2000);
      }
      return false;
    };

    window.__rowDetailSafeSaveEditedData = async function () {
      if (!window.currentEditingRow || !Number.isInteger(window.currentEditingRowIndex)) {
        ensureEditingRowFromModalDataset();
      }

      const snapshot = captureRowDetailFormSnapshot();
      const partsBeforeSave = getRowDetailParts();
      const saveAttemptedWhileVisible = isVisible(partsBeforeSave.modal);

      try {
        if (typeof originalSaveEdited === 'function') {
          const result = await originalSaveEdited();
          const partsAfterSave = getRowDetailParts();
          const modalStillVisible = isVisible(partsAfterSave.modal);

          if (result === false || (saveAttemptedWhileVisible && modalStillVisible && window.isInEditMode === false)) {
            restoreRowDetailFormSnapshot(snapshot);
            keepRowDetailInEditForRetry();
            const unconfirmedCode = ROW_DETAIL_SAVE_CODES.SAVE_UNCONFIRMED.code;
            showRowDetailSaveErrorBanner('The save could not be confirmed. Fix any issues and retry.', unconfirmedCode);
            logRowDetailSaveDiagnostic('SAVE_UNCONFIRMED', null, {
              modalStillVisible,
              saveAttemptedWhileVisible,
              path: 'safeSaveResult'
            });
            return false;
          }

          clearRowDetailSaveErrorBanner();
          clearRetryButtonState();
          syncRowDetailContextFromGlobals();
          return result;
        }
      } catch (error) {
        restoreRowDetailFormSnapshot(snapshot);
        keepRowDetailInEditForRetry();
        const exceptionCode = ROW_DETAIL_SAVE_CODES.SAVE_EXCEPTION.code;
        showRowDetailSaveErrorBanner(error && error.message ? error.message : 'Save failed unexpectedly.', exceptionCode);
        logRowDetailSaveDiagnostic('SAVE_EXCEPTION', error, { path: 'safeSaveCatch' });
        if (window.showToast) {
          window.showToast('Save failed. Your edits were preserved for retry.', 'error', 3500);
        }
        return false;
      }

      keepRowDetailInEditForRetry();
      const unavailableCode = ROW_DETAIL_SAVE_CODES.SAVE_FUNCTION_UNAVAILABLE.code;
      showRowDetailSaveErrorBanner('Save function is not available yet.', unavailableCode);
      logRowDetailSaveDiagnostic('SAVE_FUNCTION_UNAVAILABLE', null, { path: 'safeSaveMissingFunction' });
      return false;
    };

    window.__rowDetailSafeCancelEdit = function () {
      if (!window.currentEditingRow || !Number.isInteger(window.currentEditingRowIndex)) {
        ensureEditingRowFromModalDataset();
      }
      if (typeof originalCancelEdit === 'function') {
        const result = originalCancelEdit();
        clearRowDetailSaveErrorBanner();
        clearRetryButtonState();
        syncRowDetailContextFromGlobals();
        return result;
      }
      return window.closeRowDetailModal();
    };

    window.enableEditMode = window.__rowDetailSafeEnableEditMode;
    if (typeof originalSaveEdited === 'function') {
      window.saveEditedData = window.__rowDetailSafeSaveEditedData;
    }
    if (typeof originalCancelEdit === 'function') {
      window.cancelEdit = window.__rowDetailSafeCancelEdit;
    }

    window.__rowDetailSafeShowCardDetails = function (index) {
      const entry = getAdventureEntry(index);
      if (!entry) {
        console.error('❌ Row detail: could not resolve adventure for index', index);
        return false;
      }

      window.currentEditingRow = entry.row;
      window.currentEditingRowIndex = entry.sourceIndex;
      window.initRowDetailModal();
      syncRowDetailContextFromGlobals();

      let opened = false;
      if (typeof originalShow === 'function' && originalShow !== window.__rowDetailSafeShowCardDetails) {
        try {
          // Only explicit true counts as opened; placeholder/legacy undefined should not.
          opened = originalShow(entry.sourceIndex) === true;
        } catch (error) {
          console.warn('⚠️ Original showCardDetails failed, using fallback renderer:', error);
        }
      }

      // New behavior: card details open in a separate tab, not in-modal.
      if (window.rowDetailOpenMode === 'tab') {
        if (!opened && typeof window.openAdventureDetailsTab === 'function') {
          // Pass the resolved entry object to avoid index remapping bugs.
          opened = window.openAdventureDetailsTab(entry) !== false;
        }
        syncRowDetailContextFromGlobals();
        return opened;
      }

      const parts = getRowDetailParts();
      const modalLooksClosed = !isVisible(parts.modal) || !parts.title || !String(parts.title.textContent || '').trim();
      if (!opened || modalLooksClosed) {
        renderRowDetailFallback(entry);
      } else {
        parts.modal.dataset.currentRowIndex = String(entry.sourceIndex);
        parts.modal.style.pointerEvents = 'auto';
        if (parts.backdrop) parts.backdrop.style.pointerEvents = 'auto';
      }

      syncRowDetailContextFromGlobals();
      return true;
    };

    window.showCardDetails = window.__rowDetailSafeShowCardDetails;

    bindGlobalDetailDelegates();
    bindRowDetailCloseHandlers();
    bindRowDetailEditHandler();
    console.log('✅ Row detail modal runtime fix installed');
  }

  function reassertRowDetailBindings() {
    if (typeof window.__rowDetailSafeShowCardDetails === 'function' && window.showCardDetails !== window.__rowDetailSafeShowCardDetails) {
      window.showCardDetails = window.__rowDetailSafeShowCardDetails;
    }
    if (typeof window.__rowDetailSafeEnableEditMode === 'function' && window.enableEditMode !== window.__rowDetailSafeEnableEditMode) {
      window.enableEditMode = window.__rowDetailSafeEnableEditMode;
    }
    if (typeof window.__rowDetailSafeSaveEditedData === 'function' && window.saveEditedData !== window.__rowDetailSafeSaveEditedData) {
      window.saveEditedData = window.__rowDetailSafeSaveEditedData;
    }
    if (typeof window.__rowDetailSafeCancelEdit === 'function' && window.cancelEdit !== window.__rowDetailSafeCancelEdit) {
      window.cancelEdit = window.__rowDetailSafeCancelEdit;
    }
  }

  function installHandlers() {
    ['pointerdown', 'mousedown', 'touchstart', 'mouseover', 'focusin', 'click'].forEach((type) => {
      document.addEventListener(type, touchButtonFromEvent, true);
    });

    document.addEventListener('click', (event) => {
      const button = event.target && event.target.closest ? event.target.closest('button') : null;
      if (!button) return;
      normalizeButton(button);
      if (button.id) {
        console.log(`🔘 Button observed: ${button.id}`);
      }
    }, false);
  }

  function installFilterReliabilityFallback() {
    // Intentionally re-runnable: bike/adventure tab DOM is injected dynamically.

    const adventureControlIds = [
      'searchName',
      'filterDifficulty',
      'filterState',
      'filterCity',
      'filterTags',
      'filterCost',
      'groupBy',
      'groupBySecondary'
    ];

    const bikeControlIds = [
      'bikeSearchName',
      'bikeFilterRegion',
      'bikeFilterDifficulty',
      'bikeFilterSurface',
      'bikeFilterLengthBand',
      'bikeFilterDriveTimeBand',
      'bikeFilterTraffic',
      'bikeFilterState',
      'bikeFilterCity',
      'bikeFilterCost',
      'bikeFilterHours',
      'bikeGroupBy',
      'bikeSortBy'
    ];

    const callAdventureApply = () => {
      if (window.FilterManager && typeof window.FilterManager.applyAllFilters === 'function') {
        window.FilterManager.applyAllFilters();
        return;
      }
      if (typeof window.applyFilters === 'function') {
        window.applyFilters();
      }
    };

    const callBikeApply = () => {
      if (typeof window.applyBikeFilters === 'function') {
        window.applyBikeFilters();
      }
    };

    let boundAnything = false;

    adventureControlIds.forEach((id) => {
      const input = document.getElementById(id);
      if (!input || input.dataset.filterReliabilityBound === '1') return;
      input.addEventListener('input', callAdventureApply, false);
      input.addEventListener('change', callAdventureApply, false);
      input.dataset.filterReliabilityBound = '1';
      boundAnything = true;
    });

    const quickFiltersCard = document.getElementById('quickFiltersCard');
    if (quickFiltersCard && quickFiltersCard.dataset.filterReliabilityBound !== '1') {
      quickFiltersCard.addEventListener('click', (event) => {
        const button = event.target && event.target.closest ? event.target.closest('.quick-filter-btn') : null;
        if (!button) return;
        setTimeout(callAdventureApply, 0);
      }, false);
      quickFiltersCard.dataset.filterReliabilityBound = '1';
      boundAnything = true;
    }

    ['resetAllFiltersTop', 'resetAllFiltersBottom', 'breadcrumbResetBtn'].forEach((id) => {
      const button = document.getElementById(id);
      if (!button || button.dataset.filterReliabilityBound === '1') return;
      button.addEventListener('click', () => setTimeout(callAdventureApply, 0), false);
      button.dataset.filterReliabilityBound = '1';
      boundAnything = true;
    });

    bikeControlIds.forEach((id) => {
      const input = document.getElementById(id);
      if (!input || input.dataset.bikeFilterReliabilityBound === '1') return;
      input.addEventListener('input', callBikeApply, false);
      input.addEventListener('change', callBikeApply, false);
      input.dataset.bikeFilterReliabilityBound = '1';
      boundAnything = true;
    });

    const bikeQuickFiltersCard = document.getElementById('bikeQuickFiltersCard');
    if (bikeQuickFiltersCard && bikeQuickFiltersCard.dataset.bikeFilterReliabilityBound !== '1') {
      bikeQuickFiltersCard.addEventListener('click', (event) => {
        const button = event.target && event.target.closest ? event.target.closest('.quick-filter-btn') : null;
        if (!button) return;
        setTimeout(callBikeApply, 0);
      }, false);
      bikeQuickFiltersCard.dataset.bikeFilterReliabilityBound = '1';
      boundAnything = true;
    }

    ['bikeResetAllFiltersTop', 'bikeResetAllFiltersBottom', 'bikeBreadcrumbResetBtn'].forEach((id) => {
      const button = document.getElementById(id);
      if (!button || button.dataset.bikeFilterReliabilityBound === '1') return;
      button.addEventListener('click', () => setTimeout(callBikeApply, 0), false);
      button.dataset.bikeFilterReliabilityBound = '1';
      boundAnything = true;
    });

    const bikeExplorerBtn = document.getElementById('bikeTrailExplorerBtn');
    if (bikeExplorerBtn && bikeExplorerBtn.dataset.bikeExplorerReliabilityBound !== '1') {
      bikeExplorerBtn.addEventListener('click', (event) => {
        event.preventDefault();
        window.openBikeTrailExplorer?.();
      }, false);
      bikeExplorerBtn.dataset.bikeExplorerReliabilityBound = '1';
      boundAnything = true;
    }

    if (boundAnything) {
      filterReliabilityBound = true;
      if (!filterReliabilityLogShown) {
        console.log('✅ Filter reliability fallback bound');
        filterReliabilityLogShown = true;
      }
    }
  }

  function init() {
    installHandlers();
    refreshVisibleButtons();
    installRowDetailFixes();
    installFilterReliabilityFallback();

    const observer = new MutationObserver(() => {
      refreshVisibleButtons();
      bindRowDetailCloseHandlers();
      bindRowDetailEditHandler();
      reassertRowDetailBindings();
      installFilterReliabilityFallback();
    });

    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }

    setTimeout(reassertRowDetailBindings, 0);
    setTimeout(reassertRowDetailBindings, 300);
    setTimeout(reassertRowDetailBindings, 1000);
    setTimeout(reassertRowDetailBindings, 2000);

    console.log('✅ Safe button reliability layer ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  window.setupButtonHandlers = refreshVisibleButtons;

  window.rowDetailOpenMode = 'tab';

  function cacheAdventureDetailsForTab(entry) {
    const values = entry && entry.row && entry.row.values ? entry.row.values[0] : [];
    if (!Array.isArray(values)) return null;

    const [
      name, googlePlaceId, website, tags, driveTime, hoursOfOperation,
      activityDuration, difficulty, trailLength, state, city, address,
      phoneNumber, googleRating, cost, directions, description, nearby,
      links, links2, notes, myRating, favoriteStatus, googleUrl
    ] = values;

    const detailKey = `adventure_details_${entry.sourceIndex}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const payload = {
      sourceIndex: entry.sourceIndex,
      exportedAt: new Date().toISOString(),
      data: {
        name, googlePlaceId, website, tags, driveTime, hoursOfOperation,
        activityDuration, difficulty, trailLength, state, city, address,
        phoneNumber, googleRating, cost, directions, description, nearby,
        links, links2, notes, myRating, favoriteStatus, googleUrl
      }
    };

    try {
      window.localStorage.setItem(detailKey, JSON.stringify(payload));
      window.localStorage.setItem('adventure_details_latest', detailKey);
      return detailKey;
    } catch (error) {
      console.warn('⚠️ Could not cache adventure details payload:', error);
      return null;
    }
  }

  function resolvePlannerUrl(relativePath) {
    if (typeof window.resolvePlannerPageUrl === 'function') {
      return window.resolvePlannerPageUrl(relativePath);
    }

    const rel = String(relativePath || '').replace(/^\/+/, '');
    const pathname = window.location.pathname || '/';
    const marker = '/kylesadventureplanner/';
    const markerIdx = pathname.toLowerCase().indexOf(marker);

    let basePath = '/';
    if (markerIdx >= 0) {
      basePath = pathname.slice(0, markerIdx + marker.length);
    } else {
      const slashIdx = pathname.lastIndexOf('/');
      basePath = slashIdx >= 0 ? pathname.slice(0, slashIdx + 1) : '/';
    }

    const origin = window.location.origin && window.location.origin !== 'null' ? window.location.origin : '';
    const baseUrl = origin ? `${origin}${basePath}` : window.location.href;
    return new URL(encodeURI(rel), baseUrl).toString();
  }

  window.cacheAdventureDetailsForTab = cacheAdventureDetailsForTab;

  window.openAdventureDetailsTab = function (sourceIndexOrEntry) {
    const entry = sourceIndexOrEntry && sourceIndexOrEntry.row
      ? sourceIndexOrEntry
      : getAdventureEntry(sourceIndexOrEntry);
    if (!entry) return false;

    const detailKey = cacheAdventureDetailsForTab(entry);
    const detailsUrl = new URL(resolvePlannerUrl('HTML Files/adventure-details-window.html'), window.location.href);
    detailsUrl.searchParams.set('sourceIndex', String(entry.sourceIndex));

    const values = entry && entry.row && entry.row.values ? entry.row.values[0] : [];
    const debugName = Array.isArray(values) ? String(values[0] || '') : '';
    const debugPlaceId = Array.isArray(values) ? String(values[1] || '') : '';

    // URL debug markers help verify which card identity was sent to the new tab.
    detailsUrl.searchParams.set('debugSourceIndex', String(entry.sourceIndex));
    detailsUrl.searchParams.set('debugName', debugName);
    detailsUrl.searchParams.set('debugPlaceId', debugPlaceId);

    if (detailKey) detailsUrl.searchParams.set('detailKey', detailKey);
    detailsUrl.searchParams.set('ts', String(Date.now()));

    console.log('🔎 Opening details tab with debug marker:', {
      sourceIndex: entry.sourceIndex,
      name: debugName,
      placeId: debugPlaceId,
      detailKey: detailKey || '(none)'
    });

    const detailTab = window.open(detailsUrl.toString(), '_blank');
    if (!detailTab) {
      if (typeof window.showToast === 'function') {
        window.showToast('❌ Failed to open details tab. Check if pop-ups are blocked.', 'error', 5000);
      }
      return false;
    }

    detailTab.focus();
    return true;
  };

})();
