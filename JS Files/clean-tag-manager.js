/**
 * CLEAN TAG MANAGER
 * Single-source implementation to avoid old modal/circle regressions.
 * Version: v7.0.120
 */

(function () {
  const EXCLUDED_RECOMMENDATIONS = new Set([
    'city center',
    'downtown',
    'urban',
    'commercial'
  ]);
  const DISABLED_RECOMMENDATION_TAGS = new Set([
    'Farm-to-Table',
    'Vegetarian-Friendly',
    'Gluten-Free Options',
    'Family-Friendly',
    'Top Rated',
    'Worth Visiting',
    'Relaxing',
    'Dining'
  ]);

  function esc(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function hideLegacyTagModal() {
    const legacyBackdrop = document.getElementById('tagManagerBackdrop');
    const legacyModal = document.getElementById('tagManagerModal');

    if (legacyBackdrop) {
      legacyBackdrop.classList.remove('visible');
      legacyBackdrop.style.display = 'none';
      legacyBackdrop.style.visibility = 'hidden';
      legacyBackdrop.style.pointerEvents = 'none';
      legacyBackdrop.style.opacity = '0';
      legacyBackdrop.style.zIndex = '-1';
    }

    if (legacyModal) {
      legacyModal.classList.remove('visible');
      legacyModal.style.display = 'none';
      legacyModal.style.visibility = 'hidden';
      legacyModal.style.pointerEvents = 'none';
      legacyModal.style.opacity = '0';
      legacyModal.style.zIndex = '-1';
    }
  }

  function ensureStyles() {
    if (document.getElementById('cleanTagManagerStyles')) return;

    const style = document.createElement('style');
    style.id = 'cleanTagManagerStyles';
    style.textContent = `
      /* Force-hide legacy tag modal to prevent old circular artifact */
      #tagManagerBackdrop,
      #tagManagerModal {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        z-index: -1 !important;
      }
      /* Neutralize legacy pseudo-elements that create circular overlays */
      #tagManagerBackdrop::before,
      #tagManagerBackdrop::after,
      #tagManagerModal::before,
      #tagManagerModal::after,
      .tag-manager-modal::before,
      .tag-manager-modal::after,
      .tag-manager-content::before,
      .tag-manager-content::after {
        content: none !important;
        display: none !important;
      }
      #cleanTagManagerBackdrop {
        position: fixed !important;
        inset: 0 !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        background: rgba(15, 23, 42, 0.45);
        backdrop-filter: blur(2px);
        z-index: 999999 !important;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      #cleanTagManagerBackdrop.visible {
        display: flex !important;
        z-index: 999999 !important;
      }
      #cleanTagManagerModal {
        width: min(760px, 96vw);
        max-height: 90vh;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 16px;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        position: relative;
        z-index: 1000000 !important;
      }
      .ctm-header {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: #fff;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .ctm-title { font-size: 22px; font-weight: 700; margin: 0; }
      .ctm-subtitle { font-size: 12px; opacity: 0.95; margin-top: 2px; }
      .ctm-close {
        background: transparent;
        border: 0;
        color: #fff;
        font-size: 30px;
        line-height: 1;
        cursor: pointer;
        width: 36px;
        height: 36px;
      }
      .ctm-body {
        padding: 18px 20px;
        overflow: auto;
        background: #fff;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .ctm-section-title {
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.3px;
        text-transform: uppercase;
        color: #374151;
        margin-bottom: 8px;
      }
      .ctm-tag-box {
        min-height: 52px;
        border: 1px solid #d1d5db;
        border-radius: 12px;
        background: #f9fafb;
        padding: 10px;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;
      }
      .ctm-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border-radius: 999px;
        border: 1px solid #60a5fa;
        background: #eff6ff;
        color: #1e40af;
        font-weight: 600;
        font-size: 13px;
        padding: 6px 10px;
      }
      .ctm-pill button {
        border: 0;
        background: transparent;
        color: #1e40af;
        cursor: pointer;
        font-weight: 700;
        font-size: 13px;
      }
      .ctm-pill-category {
        font-size: 11px;
        font-weight: 700;
        opacity: 0.9;
        margin-left: 2px;
      }
      .ctm-pill-category-select {
        border: 1px solid #93c5fd;
        border-radius: 8px;
        background: #ffffff;
        color: #1e3a8a;
        font-size: 11px;
        font-weight: 700;
        padding: 2px 6px;
        margin-left: 4px;
      }
      .ctm-row {
        display: flex;
        gap: 8px;
      }
      .ctm-row input {
        flex: 1;
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 10px;
        font-size: 14px;
      }
      .ctm-row select {
        min-width: 170px;
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 10px;
        font-size: 13px;
        background: #fff;
        color: #1f2937;
      }
      .ctm-btn {
        border: 0;
        border-radius: 10px;
        padding: 10px 14px;
        font-weight: 700;
        cursor: pointer;
      }
      .ctm-btn-primary {
        background: #3b82f6;
        color: #fff;
      }
      .ctm-btn-secondary {
        background: #fff;
        border: 1px solid #d1d5db;
        color: #374151;
      }
      .ctm-btn-danger {
        background: #ef4444;
        color: #fff;
      }
      .ctm-suggestions {
        border: 1px solid #86efac;
        border-radius: 12px;
        background: #f0fdf4;
        padding: 10px;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .ctm-suggestion {
        border: 1px solid #34d399;
        border-radius: 12px;
        background: #fff;
        color: #047857;
        padding: 8px 10px;
        font-weight: 600;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
        text-align: left;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .ctm-suggestion:hover {
        background: #f0fdf4;
        border-color: #10b981;
        box-shadow: 0 4px 8px rgba(16, 185, 129, 0.15);
      }
      .ctm-live-matches {
        border: 1px solid #dbeafe;
        border-radius: 12px;
        background: #eff6ff;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .ctm-live-match-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        background: #ffffff;
        border: 1px solid #bfdbfe;
        border-radius: 10px;
        padding: 8px 10px;
      }
      .ctm-live-match-tag {
        font-size: 13px;
        font-weight: 600;
        color: #1e3a8a;
      }
      .ctm-live-match-btn {
        border: 1px solid #60a5fa;
        border-radius: 8px;
        background: #dbeafe;
        color: #1e40af;
        font-size: 12px;
        font-weight: 700;
        padding: 6px 10px;
        cursor: pointer;
      }
      .ctm-live-match-btn.is-selected {
        border-color: #93c5fd;
        background: #f8fafc;
        color: #334155;
      }
      .ctm-footer {
        padding: 14px 20px;
        border-top: 1px solid #e5e7eb;
        background: #f9fafb;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }
      .ctm-empty {
        color: #6b7280;
        font-size: 13px;
        font-style: italic;
      }
      /* Conflict / warning banner below current tags */
      .ctm-conflict-banner {
        border-radius: 10px;
        padding: 8px 12px;
        font-size: 12px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-top: 6px;
      }
      .ctm-conflict-banner:empty { display: none; }
      .ctm-conflict-banner--has-conflicts {
        background: #fff7ed;
        border: 1px solid #fdba74;
        color: #92400e;
      }
      .ctm-conflict-banner--has-warnings {
        background: #fefce8;
        border: 1px solid #fde047;
        color: #713f12;
      }
      .ctm-conflict-item {
        display: flex;
        align-items: flex-start;
        gap: 5px;
        line-height: 1.4;
      }

      /* ── Mobile compactness ─────────────────────────────────────── */
      @media (max-width: 540px) {
        #cleanTagManagerModal {
          border-radius: 12px;
          max-height: 92vh;
        }
        .ctm-header {
          padding: 12px 14px;
        }
        .ctm-title { font-size: 18px; }
        .ctm-body {
          padding: 12px 14px;
          gap: 10px;
        }
        .ctm-footer {
          padding: 10px 14px;
          gap: 8px;
          flex-wrap: wrap;
        }
        /* Add-tag row: wrap so category + button move to line 2 */
        .ctm-row {
          flex-wrap: wrap;
        }
        .ctm-row input {
          width: 100%;
          min-width: 0;
        }
        .ctm-row select {
          flex: 1 1 auto;
          min-width: 0;
          font-size: 12px;
          padding: 8px 8px;
        }
        .ctm-row .ctm-btn {
          flex-shrink: 0;
          padding: 8px 12px;
          font-size: 13px;
        }
        /* Per-pill inline category selector: compact chip */
        .ctm-pill-category-select {
          font-size: 10px;
          padding: 1px 3px;
          max-width: 88px;
          margin-left: 2px;
        }
        /* Pill label text slightly smaller */
        .ctm-pill {
          font-size: 12px;
          padding: 5px 8px;
          gap: 4px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function parseExcelTags(rawTags) {
    const parsed = String(rawTags || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    // Resolve typo aliases (e.g. "Shushi" → "Sushi") using the consolidated system
    if (typeof window.normalizeTags === 'function') {
      return window.normalizeTags(parsed);
    }
    return parsed;
  }

  function normalizeHookTags(value) {
    if (Array.isArray(value)) return value;
    return parseExcelTags(value);
  }

  function getModalHook(hookName) {
    const hook = window.cleanTagManager?.contextOptions?.[hookName];
    return typeof hook === 'function' ? hook : null;
  }

  function getExcelTagsForPlace(placeId) {
    const id = String(placeId || '').trim();
    if (!id) return [];

    const contextualHook = getModalHook('getExcelTags');
    if (contextualHook) {
      try {
        return normalizeHookTags(contextualHook(id));
      } catch (error) {
        console.warn('[clean-tag-manager] getExcelTags hook failed:', error);
      }
    }

    const rows = Array.isArray(window.adventuresData) ? window.adventuresData : [];
    const normalizedId = id.toLowerCase();
    const row = rows.find((r) => {
      const pid = String(r?.values?.[0]?.[1] || '').trim();
      return pid && pid.toLowerCase() === normalizedId;
    });

    const rawTags = row?.values?.[0]?.[3] || '';
    return parseExcelTags(rawTags);
  }

  function getContextualExcelTags(placeId) {
    const normalizedId = String(placeId || '').trim().toLowerCase();

    const contextualHook = getModalHook('getContextualTags');
    if (contextualHook) {
      try {
        return normalizeHookTags(contextualHook(normalizedId));
      } catch (error) {
        console.warn('[clean-tag-manager] getContextualTags hook failed:', error);
      }
    }

    // Prefer currently edited row if it matches the active Place ID.
    const currentRowTags = window.currentEditingRow?.values?.[0]?.[3];
    const currentRowPid = String(window.currentEditingRow?.values?.[0]?.[1] || '').trim().toLowerCase();
    if (currentRowTags && currentRowPid && currentRowPid === normalizedId) {
      return parseExcelTags(currentRowTags);
    }

    // Fallback: read tags already rendered on card dataset for this Place ID.
    const cards = Array.from(document.querySelectorAll('.adventure-card[data-google-place-id]'));
    const card = cards.find((el) => String(el.getAttribute('data-google-place-id') || '').trim().toLowerCase() === normalizedId);
    if (card) {
      return parseExcelTags(card.getAttribute('data-tags') || '');
    }

    return [];
  }

  function mergeUniqueTags(...tagLists) {
    const seen = new Set();
    const merged = [];
    tagLists.flat().forEach((tag) => {
      const value = String(tag || '').trim();
      const key = value.toLowerCase();
      if (!value || seen.has(key)) return;
      seen.add(key);
      merged.push(value);
    });
    return merged.sort((a, b) => a.localeCompare(b));
  }

  function getAvailableTagCategories() {
    if (typeof window.getAllTagCategories === 'function') {
      const categories = window.getAllTagCategories();
      if (Array.isArray(categories) && categories.length) return categories;
    }
    return ['Activities', 'Locations', 'Food & Dining', 'Shopping', 'Beverages', 'Social & Discovery', 'Custom'];
  }

  function getCategoryStyleDefaults(categoryName) {
    if (typeof window.getTagCategoryPalette === 'function') {
      return window.getTagCategoryPalette(categoryName);
    }
    return {
      icon: '🏷️',
      bg: '#ede9fe',
      color: '#5b21b6',
      border: '#c4b5fd'
    };
  }

  function buildCategoryOptionsMarkup(selected) {
    const value = String(selected || '').trim();
    return getAvailableTagCategories().map((category) => {
      const isSelected = category === value ? ' selected' : '';
      return `<option value="${esc(category)}"${isSelected}>${esc(category)}</option>`;
    }).join('');
  }

  function patchLegacyOpenersToClean() {
    // If legacy UI manager is used anywhere, route it to clean manager.
    if (!window.tagUIManager || window.tagUIManager.__cleanPatched) return;
    const legacyOpen = window.tagUIManager.openModal;

    window.tagUIManager.openModal = function (placeId, placeName) {
      if (window.cleanTagManager && typeof window.cleanTagManager.openModal === 'function') {
        window.cleanTagManager.openModal(placeId, placeName || placeId);
        return;
      }
      if (typeof legacyOpen === 'function') {
        legacyOpen.call(window.tagUIManager, placeId, placeName);
      }
    };

    window.tagUIManager.__cleanPatched = true;
  }

  function ensureDom() {
    if (document.getElementById('cleanTagManagerBackdrop')) return;

    const backdrop = document.createElement('div');
    backdrop.id = 'cleanTagManagerBackdrop';

    backdrop.innerHTML = `
      <div id="cleanTagManagerModal" role="dialog" aria-modal="true" aria-label="Tag Manager">
        <div class="ctm-header">
          <div>
            <h2 class="ctm-title">Tag Manager</h2>
            <div id="ctmSubtitle" class="ctm-subtitle"></div>
          </div>
          <button id="ctmClose" class="ctm-close" aria-label="Close">&times;</button>
        </div>

        <div class="ctm-body">
          <div>
            <div class="ctm-section-title">Current Tags</div>
            <div id="ctmCurrentTags" class="ctm-tag-box"></div>
            <div id="ctmConflictBanner" class="ctm-conflict-banner" role="status" aria-live="polite"></div>
          </div>

          <div>
            <div class="ctm-section-title">Add Tag</div>
            <div class="ctm-row">
              <input id="ctmInput" type="text" list="ctmTagOptions" placeholder="Type a tag and press Enter" autocomplete="off" />
              <select id="ctmTagCategory" aria-label="Tag category for custom tags"></select>
              <datalist id="ctmTagOptions"></datalist>
              <button id="ctmAdd" class="ctm-btn ctm-btn-primary">Add Tag</button>
            </div>
            <div id="ctmLiveMatches" class="ctm-live-matches" style="margin-top:8px;"></div>
          </div>

          <div>
            <div class="ctm-section-title">Suggested Tags</div>
            <div id="ctmSuggestions" class="ctm-suggestions"></div>
          </div>
        </div>

        <div class="ctm-footer">
          <button id="ctmCancel" class="ctm-btn ctm-btn-secondary">Cancel</button>
          <button id="ctmClear" class="ctm-btn ctm-btn-danger">Clear All Tags</button>
          <button id="ctmSave" class="ctm-btn ctm-btn-primary">Save Changes</button>
        </div>
      </div>
    `;

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) window.cleanTagManager.closeModal();
    });

    document.body.appendChild(backdrop);

    document.getElementById('ctmClose').addEventListener('click', () => window.cleanTagManager.closeModal());
    document.getElementById('ctmCancel').addEventListener('click', () => window.cleanTagManager.closeModal());
    document.getElementById('ctmClear').addEventListener('click', () => window.cleanTagManager.clearAllTags());
    document.getElementById('ctmSave').addEventListener('click', () => window.cleanTagManager.saveAndClose());
    document.getElementById('ctmAdd').addEventListener('click', () => window.cleanTagManager.addTagFromInput());

    const input = document.getElementById('ctmInput');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        window.cleanTagManager.addTagFromInput();
      }
    });
    input.addEventListener('input', () => window.cleanTagManager.renderLiveMatches());
  }

  window.cleanTagManager = {
    currentPlaceId: null,
    currentTags: [],
    contextOptions: null,

    init() {
      ensureStyles();
      ensureDom();
      hideLegacyTagModal();
      this.startLegacyGuard();
      patchLegacyOpenersToClean();
      console.log('Clean Tag Manager initialized');
    },

    startLegacyGuard() {
      if (this._legacyGuardObserver) return;

      const enforceHidden = () => {
        hideLegacyTagModal();
        patchLegacyOpenersToClean();
      };

      enforceHidden();
      this._legacyGuardObserver = new MutationObserver(enforceHidden);
      this._legacyGuardObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });

      // Disconnect after 30 s — the legacy modal is very unlikely to reappear
      // once the page has settled, so there's no need to fire on every DOM mutation.
      setTimeout(() => {
        try {
          if (this._legacyGuardObserver) {
            this._legacyGuardObserver.disconnect();
            this._legacyGuardObserver = null;
          }
        } catch (_disconnectErr) {}
      }, 30000);
    },

    openModal(placeId, placeName, contextOptions = null) {
      hideLegacyTagModal();
      this.currentPlaceId = String(placeId || '').trim();
      this.contextOptions = contextOptions && typeof contextOptions === 'object' ? contextOptions : null;
      if (!this.currentPlaceId) {
        if (typeof window.showToast === 'function') {
          window.showToast('No Place ID found for this location', 'warning', 2500);
        }
        return;
      }

      const subtitle = document.getElementById('ctmSubtitle');
      if (subtitle) {
        subtitle.textContent = placeName || `Place ID: ${this.currentPlaceId}`;
      }

      this.loadCurrentTags();
      this.populateCategoryOptions();
      this.renderCurrentTags();
      this.renderSuggestions();
      this.renderAutocomplete();
      this.renderLiveMatches();

      const backdrop = document.getElementById('cleanTagManagerBackdrop');
      if (backdrop) backdrop.classList.add('visible');

      const input = document.getElementById('ctmInput');
      if (input) input.focus();
    },

    closeModal() {
      const backdrop = document.getElementById('cleanTagManagerBackdrop');
      if (backdrop) backdrop.classList.remove('visible');
    },

    loadCurrentTags() {
      if (!this.currentPlaceId) {
        this.currentTags = [];
        return;
      }

      const managedTags = (window.tagManager && typeof window.tagManager.getTagsForPlace === 'function')
        ? (window.tagManager.getTagsForPlace(this.currentPlaceId) || [])
        : [];

      const excelTags = getExcelTagsForPlace(this.currentPlaceId);
      const contextualTags = getContextualExcelTags(this.currentPlaceId);
      this.currentTags = mergeUniqueTags(excelTags, contextualTags, managedTags);
    },

    populateCategoryOptions(defaultCategory) {
      const select = document.getElementById('ctmTagCategory');
      if (!select) return;
      const selected = String(defaultCategory || select.value || 'Custom').trim() || 'Custom';
      select.innerHTML = buildCategoryOptionsMarkup(selected);
    },

    getSelectedCategory() {
      const select = document.getElementById('ctmTagCategory');
      return String((select && select.value) || 'Custom').trim() || 'Custom';
    },

    ensureCustomTagCategory(tagName, categoryName) {
      const cleanTag = String(tagName || '').trim();
      if (!cleanTag || !window.customTagRegistry) return;
      const selectedCategory = String(categoryName || 'Custom').trim() || 'Custom';
      const existingCustom = typeof window.customTagRegistry.getCustomTag === 'function'
        ? window.customTagRegistry.getCustomTag(cleanTag)
        : null;

      const defaults = getCategoryStyleDefaults(selectedCategory);
      if (existingCustom && typeof window.customTagRegistry.updateCustomTag === 'function') {
        window.customTagRegistry.updateCustomTag(cleanTag, {
          category: selectedCategory,
          icon: defaults.icon || existingCustom.icon || '🏷️',
          bg: defaults.bg || existingCustom.bg,
          color: defaults.color || existingCustom.color,
          border: defaults.border || existingCustom.border
        });
        return;
      }

      const allKnown = (window.tagManager && typeof window.tagManager.getAllTags === 'function')
        ? window.tagManager.getAllTags()
        : [];
      const existsAsBuiltIn = allKnown.some((tag) => String(tag || '').trim().toLowerCase() === cleanTag.toLowerCase());
      if (existsAsBuiltIn) return;

      if (typeof window.customTagRegistry.createCustomTag === 'function') {
        window.customTagRegistry.createCustomTag(cleanTag, {
          category: selectedCategory,
          icon: defaults.icon || '🏷️',
          bg: defaults.bg,
          color: defaults.color,
          border: defaults.border
        });
      }
    },

    updateCustomTagCategory(tagName, categoryName) {
      const cleanTag = String(tagName || '').trim();
      const nextCategory = String(categoryName || 'Custom').trim() || 'Custom';
      if (!cleanTag || !window.customTagRegistry || typeof window.customTagRegistry.updateCustomTag !== 'function') return;
      const current = typeof window.customTagRegistry.getCustomTag === 'function'
        ? window.customTagRegistry.getCustomTag(cleanTag)
        : null;
      if (!current) return;
      const defaults = getCategoryStyleDefaults(nextCategory);
      window.customTagRegistry.updateCustomTag(cleanTag, {
        category: nextCategory,
        icon: defaults.icon || current.icon || '🏷️',
        bg: defaults.bg || current.bg,
        color: defaults.color || current.color,
        border: defaults.border || current.border
      });
      this.renderCurrentTags();
      this.renderAutocomplete();
      this.renderLiveMatches();
    },

    renderCurrentTags() {
      const wrap = document.getElementById('ctmCurrentTags');
      if (!wrap) return;

      if (!this.currentTags.length) {
        wrap.innerHTML = '<span class="ctm-empty">No tags yet</span>';
        return;
      }

      wrap.innerHTML = this.currentTags.map((tag) => `
        <span class="ctm-pill">
          <span>${esc(tag)}</span>
          ${window.customTagRegistry && typeof window.customTagRegistry.getCustomTag === 'function' && window.customTagRegistry.getCustomTag(tag)
            ? `<span class="ctm-pill-category">${esc(window.customTagRegistry.getCustomTag(tag).category || 'Custom')}</span>`
            : ''}
          ${window.customTagRegistry && typeof window.customTagRegistry.getCustomTag === 'function' && window.customTagRegistry.getCustomTag(tag)
            ? `<select class="ctm-pill-category-select" data-custom-category-tag="${esc(tag)}">${buildCategoryOptionsMarkup(window.customTagRegistry.getCustomTag(tag).category || 'Custom')}</select>`
            : ''}
          <button type="button" data-remove-tag="${esc(tag)}">&times;</button>
        </span>
      `).join('');

      wrap.querySelectorAll('[data-remove-tag]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const tag = btn.getAttribute('data-remove-tag');
          this.removeTag(tag);
        });
      });
      wrap.querySelectorAll('[data-custom-category-tag]').forEach((select) => {
        select.addEventListener('change', () => {
          const tag = select.getAttribute('data-custom-category-tag');
          this.updateCustomTagCategory(tag, select.value);
        });
      });
    },

    renderConflictBanner() {
      const banner = document.getElementById('ctmConflictBanner');
      if (!banner) return;

      if (!window.tagConflictDetector || typeof window.tagConflictDetector.validate !== 'function') {
        banner.innerHTML = '';
        return;
      }

      const result = window.tagConflictDetector.validate(this.currentTags);
      if (!result.issues || !result.issues.length) {
        banner.innerHTML = '';
        banner.className = 'ctm-conflict-banner';
        return;
      }

      const hasConflict = result.conflictCount > 0;
      banner.className = `ctm-conflict-banner ctm-conflict-banner--has-${hasConflict ? 'conflicts' : 'warnings'}`;
      banner.innerHTML = result.issues.slice(0, 4).map((issue) => {
        const icon = issue.severity === 'conflict' ? '⚠️' : 'ℹ️';
        return `<div class="ctm-conflict-item">${icon} ${esc(issue.message)}</div>`;
      }).join('');
    },

    renderAutocomplete() {
      const options = document.getElementById('ctmTagOptions');
      if (!options) return;
      const all = (window.tagManager && typeof window.tagManager.getAllTags === 'function')
        ? window.tagManager.getAllTags()
        : [];
      const filtered = all.filter((tag) => !this.currentTags.includes(tag));
      options.innerHTML = filtered.map((tag) => `<option value="${esc(tag)}"></option>`).join('');
    },

    renderLiveMatches() {
      const wrap = document.getElementById('ctmLiveMatches');
      const input = document.getElementById('ctmInput');
      if (!wrap || !input) return;
      const query = String(input.value || '').trim().toLowerCase();
      if (!query) {
        wrap.innerHTML = '<span class="ctm-empty">Start typing to see existing tag matches</span>';
        return;
      }
      const all = (window.tagManager && typeof window.tagManager.getAllTags === 'function')
        ? (window.tagManager.getAllTags() || [])
        : [];

      // Prefer fuzzy search (handles typos like "Coffe" → Coffee) with substring fallback
      let matches;
      if (window.tagSearchEngine && typeof window.tagSearchEngine.fuzzySearch === 'function') {
        const results = window.tagSearchEngine.fuzzySearch(query, all, 2);
        // fuzzySearch returns [{tag, score, ...}]; also mix in substring results for short queries
        const fuzzyTags = new Set(results.map((r) => String(r.tag || r)).filter(Boolean));
        all.filter((t) => String(t).toLowerCase().includes(query) && !fuzzyTags.has(t))
          .forEach((t) => fuzzyTags.add(t));
        matches = Array.from(fuzzyTags).slice(0, 8);
      } else {
        matches = all
          .map((tag) => String(tag || '').trim())
          .filter(Boolean)
          .filter((tag) => tag.toLowerCase().includes(query))
          .slice(0, 8);
      }
      if (!matches.length) {
        wrap.innerHTML = '<span class="ctm-empty">No existing tag matches</span>';
        return;
      }
      wrap.innerHTML = matches.map((tag) => {
        const selected = this.currentTags.includes(tag);
        return `<div class="ctm-live-match-row">` +
          `<span class="ctm-live-match-tag">${esc(tag)}</span>` +
          `<button type="button" class="ctm-live-match-btn${selected ? ' is-selected' : ''}" data-live-tag="${esc(tag)}">${selected ? 'Added' : 'Add'}</button>` +
        `</div>`;
      }).join('');
      wrap.querySelectorAll('[data-live-tag]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const tag = btn.getAttribute('data-live-tag');
          if (!tag) return;
          if (!this.currentTags.includes(tag)) {
            this.addTag(tag);
          }
          this.renderLiveMatches();
        });
      });
    },

    getRowForCurrentPlace() {
      const rowHook = this.contextOptions && typeof this.contextOptions.getRow === 'function'
        ? this.contextOptions.getRow
        : null;
      if (rowHook) {
        try {
          const hookRow = rowHook(this.currentPlaceId);
          if (hookRow) return hookRow;
        } catch (error) {
          console.warn('[clean-tag-manager] getRow hook failed:', error);
        }
      }

      const rows = Array.isArray(window.adventuresData) ? window.adventuresData : [];
      return rows.find((row) => {
        const values = row?.values?.[0] || [];
        return String(values[1] || '').trim() === this.currentPlaceId;
      }) || null;
    },

    buildRecommendations() {
      const recs = new Map();

      // Use the shared auto-tag engine from consolidated-tag-system as the sole source.
      if (typeof window.getTagsForLocationText === 'function') {
        const row = this.getRowForCurrentPlace();
        const values = (row && row.values && row.values[0]) ? row.values[0] : [];
        try {
          const shared = window.getTagsForLocationText({
            name: values[0] || '',
            tags: values[3] || '',
            city: values[10] || '',
            address: values[11] || '',
            description: values[16] || '',
            googleRating: values[13] || ''
          }) || [];
          shared.forEach((tag) => {
            recs.set(tag, Math.max(recs.get(tag) || 0, 0.96));
          });
        } catch (_error) {
          // Engine unavailable — surface no suggestions rather than crashing
        }
      }

      // Use consolidated system's disabled-tag check, fall back to local set
      const isTagDisabled = typeof window.isDisabledTagOption === 'function'
        ? window.isDisabledTagOption
        : (t) => DISABLED_RECOMMENDATION_TAGS.has(String(t).trim());

      const filtered = Array.from(recs.entries())
        .filter(([tag]) => !this.currentTags.includes(tag))
        .filter(([tag]) => !isTagDisabled(String(tag).trim()))
        .filter(([tag]) => !EXCLUDED_RECOMMENDATIONS.has(String(tag).toLowerCase()))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

      return filtered.map(([tag, confidence]) => ({
        tag,
        confidence,
        description: this.getTagDescription(tag)
      }));
    },

    getTagDescription(tag) {
      const descriptions = {
        'Hiking': '🥾 Great for hiking activities',
        'Outdoor': '🌳 Outdoor experience',
        'Nature': '🌲 Natural environment',
        'Scenic': '📸 Beautiful views & photography',
        'Adventure': '🎒 Adventure activities',
        'Waterfall': '💧 Features waterfall(s)',
        'Family-Friendly': '👨‍👩‍👧‍👦 Good for families',
        'Restaurant': '🍽️ Dining establishment',
        'Cafe': '☕ Coffee/beverage venue',
        'Shopping': '🛍️ Shopping opportunity',
        'Museum': '🏛️ Museum or gallery',
        'Historical': '📜 Historical significance',
        'Entertainment': '🎭 Entertainment venue',
        'Beach': '🏖️ Beach location',
        'Park': '🏞️ Park or recreational area',
        'Relaxing': '😌 Peaceful & relaxing',
        'Worth Visiting': '⭐ Popular & recommended',
        'Top Rated': '🌟 Highly rated location',
        'Highly Recommended': '👍 Strong reviews'
      };
      return descriptions[tag] || '';
    },

    renderSuggestions() {
      const wrap = document.getElementById('ctmSuggestions');
      if (!wrap) return;

      const recs = this.buildRecommendations();
      if (!recs.length) {
        wrap.innerHTML = '<span class="ctm-empty">All recommendations already added</span>';
        return;
      }

      wrap.innerHTML = recs.map((rec) => {
        const confidencePercent = Math.round(rec.confidence * 100);
        const confidenceBar = '█'.repeat(Math.round(rec.confidence * 5)) + '░'.repeat(5 - Math.round(rec.confidence * 5));
        return `
          <button 
            type="button" 
            class="ctm-suggestion" 
            data-suggest-tag="${esc(rec.tag)}"
            title="${rec.description ? rec.description : 'Recommended tag'}"
          >
            <div style="display: flex; flex-direction: column; gap: 2px; align-items: flex-start;">
              <span>${esc(rec.tag)} +</span>
              <span style="font-size: 11px; opacity: 0.8;">${confidenceBar} ${confidencePercent}%</span>
              ${rec.description ? `<span style="font-size: 10px; opacity: 0.7;">${esc(rec.description)}</span>` : ''}
            </div>
          </button>
        `;
      }).join('');

      wrap.querySelectorAll('[data-suggest-tag]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.addTag(btn.getAttribute('data-suggest-tag'));
        });
      });
    },

    addTag(tag, options = {}) {
      const clean = String(tag || '').trim();
      if (!clean) return;
      if (this.currentTags.includes(clean)) return;
      if (options && options.enableCustomCategory) {
        this.ensureCustomTagCategory(clean, options.category || this.getSelectedCategory());
      }

      // Track usage so customTagRegistry.getStats().mostUsed stays accurate
      if (window.customTagRegistry && typeof window.customTagRegistry.getCustomTag === 'function') {
        const customTag = window.customTagRegistry.getCustomTag(clean);
        if (customTag && typeof window.customTagRegistry.updateCustomTag === 'function') {
          window.customTagRegistry.updateCustomTag(clean, { usageCount: (customTag.usageCount || 0) + 1 });
        }
      }

      this.currentTags.push(clean);
      this.currentTags.sort((a, b) => a.localeCompare(b));
      this.renderCurrentTags();
      this.renderConflictBanner();
      this.renderSuggestions();
      this.renderAutocomplete();
      this.renderLiveMatches();
      const input = document.getElementById('ctmInput');
      if (input) {
        input.value = '';
        this.renderLiveMatches();
      }
    },

    addTagFromInput() {
      const input = document.getElementById('ctmInput');
      if (!input) return;
      this.addTag(input.value, {
        enableCustomCategory: true,
        category: this.getSelectedCategory()
      });
    },

    removeTag(tag) {
      this.currentTags = this.currentTags.filter((t) => t !== tag);
      this.renderCurrentTags();
      this.renderConflictBanner();
      this.renderSuggestions();
      this.renderAutocomplete();
      this.renderLiveMatches();
    },

    clearAllTags() {
      this.currentTags = [];
      this.renderCurrentTags();
      this.renderConflictBanner();
      this.renderSuggestions();
      this.renderAutocomplete();
      this.renderLiveMatches();
    },

    saveAndClose() {
      if (!window.tagManager || !this.currentPlaceId) {
        this.closeModal();
        return;
      }

      // Run deduplication (fixes casing variants, spacing, resolves aliases) before persisting
      const tagsToSave = (window.tagDeduplicator && typeof window.tagDeduplicator.deduplicate === 'function')
        ? window.tagDeduplicator.deduplicate(this.currentTags)
        : this.currentTags;
      this.currentTags = tagsToSave;

      window.tagManager.setTagsForPlace(this.currentPlaceId, tagsToSave);
      window.tagManager.saveTags();
      if (typeof window.showToast === 'function') {
        window.showToast('Tags saved', 'success', 1500);
      }
      this.closeModal();

      const onSaveHook = this.contextOptions && typeof this.contextOptions.onSave === 'function'
        ? this.contextOptions.onSave
        : null;
      if (onSaveHook) {
        try {
          onSaveHook({
            placeId: this.currentPlaceId,
            tags: [...tagsToSave],
            domain: this.contextOptions?.domain || 'default'
          });
        } catch (error) {
          console.warn('[clean-tag-manager] onSave hook failed:', error);
        }
      }

      // Refresh visible cards to reflect new tags.
      if (typeof window.renderPaginatedCards === 'function') {
        window.renderPaginatedCards();
      }
      if (typeof window.renderBikeTrailsPage === 'function') {
        window.renderBikeTrailsPage();
      }
    }
  };

  // Ensure initialization happens
  function ensureInit() {
    if (window.cleanTagManager._initialized) return;
    try {
      window.cleanTagManager.init();
      window.cleanTagManager._initialized = true;
      console.log('✅ Clean Tag Manager initialized successfully');
    } catch (e) {
      console.error('❌ Clean Tag Manager initialization error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ensureInit());
  } else {
    ensureInit();
  }

  // Also ensure init on first openModal call
  const origOpenModal = window.cleanTagManager.openModal;
  window.cleanTagManager.openModal = function(placeId, placeName, contextOptions) {
    if (!window.cleanTagManager._initialized) {
      ensureInit();
    }
    return origOpenModal.call(this, placeId, placeName, contextOptions);
  };
})();
