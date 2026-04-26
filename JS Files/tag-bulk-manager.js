/**
 * Tag Bulk Manager
 * Allows cloning tags from one card to multiple others, and bulk-applying tags to multi-selected cards.
 */

(function initTagBulkManager() {
  'use strict';

  const state = {
    multiSelectMode:     false,
    selectedCards:       new Set(),
    cloneSourceTags:     null,
    cloneSourceName:     null
  };

  // ─── Card tag extraction ───────────────────────────────────────────────

  function getCardTags(el) {
    if (!el) return [];
    const tagsContainer = el.querySelector('.adventure-card-tags');
    if (!tagsContainer) return [];
    const tags = Array.from(tagsContainer.querySelectorAll('.tag-pill'))
      .map(pill => pill.getAttribute('data-tag') || pill.textContent.trim())
      .filter(Boolean);
    return tags;
  }

  function getCardInfo(el) {
    if (!el) return null;
    const title = el.querySelector('.adventure-card-title')?.textContent?.trim() || 'Unknown';
    const location = el.querySelector('.adventure-card-location')?.textContent?.trim() || '';
    const tags = getCardTags(el);
    return { title, location, tags, element: el };
  }

  // ─── Modal UI ──────────────────────────────────────────────────────────

  function ensureCloneTagsModal() {
    if (document.getElementById('cloneTagsModal')) return;
    const modal = document.createElement('div');
    modal.id = 'cloneTagsModal';
    modal.className = 'tag-bulk-modal';
    modal.innerHTML = `
      <div class="tag-bulk-modal-backdrop" onclick="closeCloneTagsModal()"></div>
      <div class="tag-bulk-modal-content">
        <div class="tag-bulk-modal-header">
          <h3>Clone Tags</h3>
          <button class="tag-bulk-close" onclick="closeCloneTagsModal()">✕</button>
        </div>
        <div class="tag-bulk-modal-body">
          <div class="tag-bulk-section">
            <label>From:</label>
            <div id="cloneTagsSourceDisplay" style="padding: 8px; background: #f0f4f8; border-radius: 4px; margin: 8px 0; font-weight: 600;"></div>
          </div>
          <div class="tag-bulk-section">
            <label>Search target locations:</label>
            <input type="text" id="cloneTagsSearch" placeholder="Search by name or location..." style="width: 100%; padding: 8px; font-size: 14px; border: 1px solid #cbd5e1; border-radius: 4px; margin: 8px 0;">
            <div id="cloneTagsResults" style="max-height: 300px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 4px; margin: 8px 0;"></div>
          </div>
          <div class="tag-bulk-section">
            <label style="display: flex; gap: 12px; align-items: center;">
              <input type="radio" name="cloneTagsMode" value="replace" checked> Replace all tags
            </label>
            <label style="display: flex; gap: 12px; align-items: center;">
              <input type="radio" name="cloneTagsMode" value="append"> Append to existing tags
            </label>
          </div>
        </div>
        <div class="tag-bulk-modal-footer">
          <button class="tag-bulk-btn" onclick="closeCloneTagsModal()">Cancel</button>
          <button class="tag-bulk-btn tag-bulk-btn-primary" id="cloneTagsApplyBtn" onclick="applyClonedTags()" disabled>Apply to Selected</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  function openCloneTagsModal(sourceCard) {
    ensureCloneTagsModal();
    const modal = document.getElementById('cloneTagsModal');
    const info = getCardInfo(sourceCard);

    state.cloneSourceTags = info.tags;
    state.cloneSourceName = info.title;
    state.selectedCards.clear();

    // Display source
    const sourceDisplay = document.getElementById('cloneTagsSourceDisplay');
    sourceDisplay.textContent = `${info.title}${info.location ? ' — ' + info.location : ''} [${info.tags.join(', ') || 'No tags'}]`;

    // Clear search and results
    document.getElementById('cloneTagsSearch').value = '';
    const resultsDiv = document.getElementById('cloneTagsResults');
    resultsDiv.innerHTML = '';

    modal.classList.add('visible');
    document.getElementById('cloneTagsSearch').focus();

    // Add search listener
    document.getElementById('cloneTagsSearch').addEventListener('input', performCloneTagsSearch);
  }

  window.openCloneTagsModal = openCloneTagsModal;
  window.closeCloneTagsModal = function() {
    const modal = document.getElementById('cloneTagsModal');
    if (modal) modal.classList.remove('visible');
    state.selectedCards.clear();
  };

  function performCloneTagsSearch(event) {
    const query = (event.target.value || '').toLowerCase();
    const resultsDiv = document.getElementById('cloneTagsResults');
    resultsDiv.innerHTML = '';

    if (query.length < 2) return;

    const cards = Array.from(document.querySelectorAll('.adventure-card'));
    cards.forEach((card) => {
      const info = getCardInfo(card);
      const match = info.title.toLowerCase().includes(query) || info.location.toLowerCase().includes(query);
      if (!match) return;

      const resultItem = document.createElement('div');
      resultItem.className = 'tag-bulk-result-item';
      resultItem.style.cssText = 'padding: 8px; border-bottom: 1px solid #e2e8f0; cursor: pointer; display: flex; align-items: center; gap: 8px;';
      const isSelected = state.selectedCards.has(card);
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = isSelected;
      checkbox.style.cursor = 'pointer';
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          state.selectedCards.add(card);
        } else {
          state.selectedCards.delete(card);
        }
        updateApplyButtonState();
      });

      const label = document.createElement('label');
      label.style.cssText = 'flex: 1; cursor: pointer; margin: 0;';
      label.innerHTML = `<strong>${info.title}</strong><br><small>${info.location || 'No location'}</small>`;
      label.addEventListener('click', () => {
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change'));
      });

      resultItem.appendChild(checkbox);
      resultItem.appendChild(label);
      resultsDiv.appendChild(resultItem);
    });
  }

  function updateApplyButtonState() {
    const btn = document.getElementById('cloneTagsApplyBtn');
    if (btn) btn.disabled = state.selectedCards.size === 0;
  }

  window.applyClonedTags = function() {
    const mode = document.querySelector('input[name="cloneTagsMode"]:checked')?.value || 'replace';
    if (!state.cloneSourceTags || state.selectedCards.size === 0) return;

    state.selectedCards.forEach(card => {
      applyTagsToCard(card, state.cloneSourceTags, mode);
    });

    if (typeof window.showToast === 'function') {
      window.showToast(`Tags ${mode}d to ${state.selectedCards.size} location(s)`, 'success', 1500);
    }

    window.closeCloneTagsModal();
  };

  // ─── Multi-select mode ────────────────────────────────────────────────

  function initMultiSelectToggle() {
    const plannerTab = document.querySelector('[data-tab="adventure-planner"]');
    if (!plannerTab) return;

    const topActions = plannerTab.querySelector('.planner-top-actions');
    if (!topActions) return;

    if (document.getElementById('multiSelectToggleBtn')) return;

    const btn = document.createElement('button');
    btn.id = 'multiSelectToggleBtn';
    btn.className = 'planner-top-btn';
    btn.textContent = '📋 Multi-Select';
    btn.title = 'Enable multi-select mode to bulk-apply tags';
    btn.style.cssText = 'background: #f0f4f8; color: #1e293b;';
    btn.addEventListener('click', toggleMultiSelectMode);

    topActions.parentElement.insertBefore(btn, topActions);
  }

  function toggleMultiSelectMode() {
    state.multiSelectMode = !state.multiSelectMode;
    const btn = document.getElementById('multiSelectToggleBtn');
    if (btn) {
      btn.style.background = state.multiSelectMode ? '#3b82f6' : '#f0f4f8';
      btn.style.color = state.multiSelectMode ? '#fff' : '#1e293b';
    }

    if (state.multiSelectMode) {
      enableMultiSelect();
    } else {
      disableMultiSelect();
    }
  }

  function enableMultiSelect() {
    document.querySelectorAll('.adventure-card').forEach(card => {
      if (card.querySelector('.card-multi-select')) return;
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'card-multi-select';
      checkbox.style.cssText = 'position: absolute; top: 8px; left: 8px; width: 20px; height: 20px; cursor: pointer; z-index: 10;';
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          state.selectedCards.add(card);
          card.style.borderColor = '#3b82f6';
          card.style.borderWidth = '3px';
        } else {
          state.selectedCards.delete(card);
          card.style.borderColor = '';
          card.style.borderWidth = '';
        }
        updateBulkActionBar();
      });
      card.style.position = 'relative';
      card.appendChild(checkbox);
    });

    ensureBulkActionBar();
  }

  function disableMultiSelect() {
    document.querySelectorAll('.card-multi-select').forEach(cb => cb.remove());
    document.querySelectorAll('.adventure-card').forEach(card => {
      card.style.borderColor = '';
      card.style.borderWidth = '';
    });
    state.selectedCards.clear();
    const bar = document.getElementById('bulkActionBar');
    if (bar) bar.remove();
  }

  function ensureBulkActionBar() {
    if (document.getElementById('bulkActionBar')) return;
    const bar = document.createElement('div');
    bar.id = 'bulkActionBar';
    bar.className = 'tag-bulk-action-bar';
    bar.innerHTML = `
      <span id="bulkActionInfo" style="flex: 1;">0 locations selected</span>
      <input type="text" id="bulkTagsInput" placeholder="Enter tags (comma-separated)..." style="flex: 2; padding: 8px; font-size: 14px; border: 1px solid #cbd5e1; border-radius: 4px;">
      <label style="display: flex; gap: 8px; align-items: center;">
        <input type="radio" name="bulkTagsMode" value="replace" checked> Replace
      </label>
      <label style="display: flex; gap: 8px; align-items: center;">
        <input type="radio" name="bulkTagsMode" value="append"> Append
      </label>
      <button onclick="applyBulkTags()" class="planner-top-btn">Apply</button>
    `;
    bar.style.cssText = 'display: flex; gap: 12px; align-items: center; padding: 12px; background: #f8fafc; border-top: 1px solid #e2e8f0; margin-top: 12px;';
    document.querySelector('.planner-top-actions').parentElement.appendChild(bar);
  }

  function updateBulkActionBar() {
    const info = document.getElementById('bulkActionInfo');
    if (info) info.textContent = `${state.selectedCards.size} location(s) selected`;
  }

  window.applyBulkTags = function() {
    const tagsText = document.getElementById('bulkTagsInput')?.value || '';
    const tags = tagsText.split(',').map(t => t.trim()).filter(Boolean);
    const mode = document.querySelector('input[name="bulkTagsMode"]:checked')?.value || 'replace';

    if (tags.length === 0 || state.selectedCards.size === 0) return;

    state.selectedCards.forEach(card => {
      applyTagsToCard(card, tags, mode);
    });

    if (typeof window.showToast === 'function') {
      window.showToast(`Applied ${tags.length} tag(s) to ${state.selectedCards.size} location(s)`, 'success', 1500);
    }

    document.getElementById('bulkTagsInput').value = '';
  };

  // ─── Tag application ──────────────────────────────────────────────────

  function applyTagsToCard(card, tagsToApply, mode) {
    if (!card || !tagsToApply || tagsToApply.length === 0) return;

    let currentTags = getCardTags(card);

    if (mode === 'append') {
      currentTags = [...new Set([...currentTags, ...tagsToApply])];
    } else {
      currentTags = tagsToApply;
    }

    // Update the data attribute if it exists
    const cardIndex = Array.from(document.querySelectorAll('.adventure-card')).indexOf(card);
    // This is a simplified approach - in real implementation you'd update the data source
    // For now, we just update the display

    const tagsContainer = card.querySelector('.adventure-card-tags');
    if (tagsContainer) {
      tagsContainer.innerHTML = currentTags
        .map(tag => `<span class="tag-pill tag-${tag.toLowerCase().replace(/[^a-z0-9]+/g, '-')}" data-tag="${tag}">${tag}</span>`)
        .join('');
    }

    // Dispatch change event so parent app can track it
    card.dispatchEvent(new CustomEvent('tagsChanged', { detail: { tags: currentTags } }));
  }

  // ─── Boot ──────────────────────────────────────────────────────────────

  function boot() {
    try {
      if (!document.body) {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
        return;
      }

      initMultiSelectToggle();

      // Add "Clone tags" button to each adventure card
      function markCards() {
        try {
          document.querySelectorAll('.adventure-card:not([data-clone-tags-bound])').forEach(card => {
            card.setAttribute('data-clone-tags-bound', '1');

            const footer = card.querySelector('.adventure-card-footer');
            if (footer) {
              const cloneBtn = document.createElement('button');
              cloneBtn.className = 'planner-top-btn';
              cloneBtn.style.cssText = 'font-size: 12px; padding: 4px 8px; min-height: auto;';
              cloneBtn.textContent = '🏷️ Clone Tags';
              cloneBtn.title = 'Clone tags to other locations';
              cloneBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openCloneTagsModal(card);
              });
              footer.appendChild(cloneBtn);
            }
          });
        } catch (e) {
          console.warn('Tag Bulk Manager card marking error:', e);
        }
      }

      markCards();
      const observer = new MutationObserver(markCards);
      observer.observe(document.body, { childList: true, subtree: true });

      console.log('✅ Tag Bulk Manager ready');
    } catch (e) {
      console.error('Tag Bulk Manager boot error:', e);
    }
  }

  boot();
})();

