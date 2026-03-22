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

  function resolveCardIndexFromElement(element) {
    if (!element) return null;

    const detailsButton = element.querySelector('.card-details-btn');
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

    const values = entry?.row?.values?.[0];
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
        if (typeof window.__rowDetailOriginalSaveEditedData === 'function') {
          await window.__rowDetailOriginalSaveEditedData();
          syncRowDetailContextFromGlobals();
          return;
        }
        if (typeof window.saveEditedData === 'function' && window.saveEditedData !== window.__rowDetailSafeSaveEditedData) {
          await window.saveEditedData();
          syncRowDetailContextFromGlobals();
          return;
        }
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

  function bindGlobalDetailDelegates() {
    if (globalDetailDelegatesBound) return;
    globalDetailDelegatesBound = true;

    // Details button click.
    document.addEventListener('click', (event) => {
      const detailsButton = event.target && event.target.closest ? event.target.closest('.card-details-btn') : null;
      if (!detailsButton) return;
      event.preventDefault();
      event.stopPropagation();
      const index = detailsButton.getAttribute('data-index');
      window.showCardDetails(index);
    }, true);

    // Whole-card click opens details unless clicking interactive controls.
    document.addEventListener('click', (event) => {
      const card = event.target && event.target.closest ? event.target.closest('.adventure-card') : null;
      if (!card) return;
      if (isInteractiveCardTarget(event.target)) return;

      const index = resolveCardIndexFromElement(card);
      if (!Number.isInteger(index) || index < 0) return;

      event.preventDefault();
      event.stopPropagation();
      window.showCardDetails(index);
    }, true);

    // Similar modal item -> details handoff.
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
      window.showCardDetails(index);
    }, true);

    // Tab switching should not drop context.
    document.addEventListener('click', (event) => {
      const tabButton = event.target && event.target.closest ? event.target.closest('#rowDetailModal .row-detail-tab-btn') : null;
      if (!tabButton) return;
      ensureEditingRowFromModalDataset();
      syncRowDetailContextFromGlobals();
      setTimeout(syncRowDetailContextFromGlobals, 0);
    }, true);

    // Escape closes row detail modal.
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      const parts = getRowDetailParts();
      if (!isVisible(parts.modal)) return;
      event.preventDefault();
      window.closeRowDetailModal();
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
      if (typeof originalSaveEdited === 'function') {
        const result = await originalSaveEdited();
        syncRowDetailContextFromGlobals();
        return result;
      }
      return false;
    };

    window.__rowDetailSafeCancelEdit = function () {
      if (!window.currentEditingRow || !Number.isInteger(window.currentEditingRowIndex)) {
        ensureEditingRowFromModalDataset();
      }
      if (typeof originalCancelEdit === 'function') {
        const result = originalCancelEdit();
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
          originalShow(entry.sourceIndex);
          opened = true;
        } catch (error) {
          console.warn('⚠️ Original showCardDetails failed, using fallback renderer:', error);
        }
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

  function init() {
    installHandlers();
    refreshVisibleButtons();
    installRowDetailFixes();

    const observer = new MutationObserver(() => {
      refreshVisibleButtons();
      bindRowDetailCloseHandlers();
      bindRowDetailEditHandler();
      reassertRowDetailBindings();
    });

    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }

    setTimeout(reassertRowDetailBindings, 0);
    setTimeout(reassertRowDetailBindings, 300);
    setTimeout(reassertRowDetailBindings, 1000);

    console.log('✅ Safe button reliability layer ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  window.setupButtonHandlers = refreshVisibleButtons;
})();
