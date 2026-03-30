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
    `;

    document.head.appendChild(style);
  }

  function parseExcelTags(rawTags) {
    return String(rawTags || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }

  function getExcelTagsForPlace(placeId) {
    const id = String(placeId || '').trim();
    if (!id) return [];

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
          </div>

          <div>
            <div class="ctm-section-title">Add Tag</div>
            <div class="ctm-row">
              <input id="ctmInput" type="text" list="ctmTagOptions" placeholder="Type a tag and press Enter" autocomplete="off" />
              <datalist id="ctmTagOptions"></datalist>
              <button id="ctmAdd" class="ctm-btn ctm-btn-primary">Add Tag</button>
            </div>
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
  }

  window.cleanTagManager = {
    currentPlaceId: null,
    currentTags: [],

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
    },

    openModal(placeId, placeName) {
      hideLegacyTagModal();
      this.currentPlaceId = String(placeId || '').trim();
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
      this.renderCurrentTags();
      this.renderSuggestions();
      this.renderAutocomplete();

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

    renderCurrentTags() {
      const wrap = document.getElementById('ctmCurrentTags');
      if (!wrap) return;

      if (!this.currentTags.length) {
        wrap.innerHTML = '<span class="ctm-empty">No tags yet</span>';
        return;
      }

      wrap.innerHTML = this.currentTags.map((tag) => `
        <span class="ctm-pill">
          ${esc(tag)}
          <button type="button" data-remove-tag="${esc(tag)}">&times;</button>
        </span>
      `).join('');

      wrap.querySelectorAll('[data-remove-tag]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const tag = btn.getAttribute('data-remove-tag');
          this.removeTag(tag);
        });
      });
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

    getRowForCurrentPlace() {
      const rows = Array.isArray(window.adventuresData) ? window.adventuresData : [];
      return rows.find((row) => {
        const values = row?.values?.[0] || [];
        return String(values[1] || '').trim() === this.currentPlaceId;
      }) || null;
    },

    buildRecommendations() {
      const recs = new Map(); // Use Map to track confidence scores
      const row = this.getRowForCurrentPlace();
      const values = row?.values?.[0] || [];

      // Extract all relevant text fields (Name, Tags, City, Address, Description)
      const name = String(values[0] || '').toLowerCase();
      const existingTags = String(values[3] || '').toLowerCase();
      const city = String(values[10] || '').toLowerCase();
      const address = String(values[11] || '').toLowerCase();
      const description = String(values[16] || '').toLowerCase();
      const googleRating = parseFloat(values[13]) || 0;

      // Combine all text for analysis
      const fullText = `${name} ${existingTags} ${city} ${address} ${description}`;

      // ENHANCED CATEGORY RULES with confidence scoring
      const ruleMap = [
        // Outdoor & Nature Categories
        {
          keys: ['hike', 'trail', 'hiking', 'trekking', 'mountain', 'alpine'],
          tags: ['Hiking', 'Outdoor', 'Nature', 'Scenic', 'Adventure'],
          confidence: 0.95
        },
        {
          keys: ['waterfall', 'cascade', 'falls'],
          tags: ['Waterfall', 'Nature', 'Scenic', 'Photography', 'Outdoor'],
          confidence: 0.9
        },
        {
          keys: ['park', 'garden', 'botanical', 'arboretum'],
          tags: ['Park', 'Nature', 'Family-Friendly', 'Relaxing', 'Scenic'],
          confidence: 0.85
        },
        {
          keys: ['lake', 'river', 'stream', 'pond', 'creek', 'water'],
          tags: ['Water Activity', 'Nature', 'Scenic', 'Family-Friendly'],
          confidence: 0.8
        },
        {
          keys: ['forest', 'woods', 'woodland', 'grove'],
          tags: ['Nature', 'Hiking', 'Outdoor', 'Relaxing', 'Scenic'],
          confidence: 0.85
        },
        {
          keys: ['beach', 'shore', 'coast', 'seaside'],
          tags: ['Beach', 'Outdoor', 'Family-Friendly', 'Scenic', 'Relaxing'],
          confidence: 0.9
        },
        {
          keys: ['camping', 'camp site'],
          tags: ['Camping', 'Outdoor', 'Adventure', 'Family-Friendly'],
          confidence: 0.9
        },

        // Dining & Food Categories
        {
          keys: ['restaurant', 'bistro', 'steakhouse', 'grill'],
          tags: ['Restaurant', 'Dining', 'Local Favorite', 'Worth Visiting'],
          confidence: 0.95
        },
        {
          keys: ['cafe', 'coffee', 'espresso', 'tea house'],
          tags: ['Cafe', 'Coffee', 'Local Favorite', 'Relaxing'],
          confidence: 0.9
        },
        {
          keys: ['diner', 'fast food', 'quick bite'],
          tags: ['Casual Dining', 'Quick Service'],
          confidence: 0.8
        },
        {
          keys: ['bakery', 'pastry'],
          tags: ['Bakery', 'Local Favorite', 'Worth Visiting'],
          confidence: 0.85
        },
        {
          keys: ['brewery', 'winery', 'distillery', 'bar', 'pub'],
          tags: ['Beverage', 'Adult Experience', 'Local Favorite'],
          confidence: 0.85
        },
        {
          keys: ['food truck', 'street food'],
          tags: ['Quick Service', 'Casual Dining', 'Local Favorite'],
          confidence: 0.8
        },

        // Shopping & Market Categories
        {
          keys: ['shop', 'store', 'retail', 'boutique'],
          tags: ['Shopping', 'Local Business', 'Worth Visiting'],
          confidence: 0.8
        },
        {
          keys: ['market', 'farmer market', 'farmers market'],
          tags: ['Market', 'Local Business', 'Family-Friendly', 'Worth Visiting'],
          confidence: 0.9
        },
        {
          keys: ['mall', 'shopping center'],
          tags: ['Shopping', 'Family-Friendly'],
          confidence: 0.75
        },

        // Cultural & Historical Categories
        {
          keys: ['museum', 'gallery', 'exhibition', 'exhibit'],
          tags: ['Museum', 'Cultural', 'Historical', 'Educational', 'Indoor Activity'],
          confidence: 0.9
        },
        {
          keys: ['historic', 'history', 'monument', 'landmark', 'heritage'],
          tags: ['Historical', 'Cultural', 'Worth Visiting', 'Educational'],
          confidence: 0.85
        },
        {
          keys: ['art', 'artist', 'sculpture', 'craft'],
          tags: ['Cultural', 'Artistic', 'Local Business'],
          confidence: 0.8
        },

        // Sports & Recreation Categories
        {
          keys: ['gym', 'fitness', 'yoga', 'pilates'],
          tags: ['Fitness', 'Health & Wellness'],
          confidence: 0.85
        },
        {
          keys: ['sport', 'athletic', 'court', 'field', 'stadium'],
          tags: ['Sports', 'Active', 'Family-Friendly'],
          confidence: 0.8
        },
        {
          keys: ['bowling', 'arcade', 'recreation'],
          tags: ['Entertainment', 'Family-Friendly', 'Fun'],
          confidence: 0.8
        },

        // Entertainment Categories
        {
          keys: ['movie', 'cinema', 'theater', 'theatre'],
          tags: ['Entertainment', 'Family-Friendly', 'Indoor Activity'],
          confidence: 0.9
        },
        {
          keys: ['music', 'concert', 'live performance'],
          tags: ['Entertainment', 'Local Favorite', 'Worth Visiting'],
          confidence: 0.85
        },
        {
          keys: ['amusement', 'theme park', 'carnival'],
          tags: ['Entertainment', 'Family-Friendly', 'Fun', 'Adventure'],
          confidence: 0.9
        },

        // Accommodation Categories
        {
          keys: ['hotel', 'motel', 'inn', 'resort'],
          tags: ['Accommodation', 'Travel-Friendly'],
          confidence: 0.85
        },
        {
          keys: ['bed & breakfast', 'bed and breakfast', 'airbnb'],
          tags: ['Accommodation', 'Local Experience'],
          confidence: 0.8
        }
      ];

      // Apply rule-based recommendations
      ruleMap.forEach((rule) => {
        const matchCount = rule.keys.filter((k) => {
          // Check for word boundaries to avoid partial matches
          const regex = new RegExp(`\\b${k}\\b`, 'i');
          return regex.test(fullText);
        }).length;

        if (matchCount > 0) {
          const scoreBoost = matchCount > 1 ? 1.1 : 1.0; // Boost if multiple matches
          rule.tags.forEach((tag) => {
            const existingScore = recs.get(tag) || 0;
            recs.set(tag, Math.max(existingScore, rule.confidence * scoreBoost));
          });
        }
      });

      // Rating-based recommendations
      if (googleRating >= 4.7) {
        recs.set('Top Rated', Math.max(recs.get('Top Rated') || 0, 0.95));
        recs.set('Worth Visiting', Math.max(recs.get('Worth Visiting') || 0, 0.9));
      } else if (googleRating >= 4.3) {
        recs.set('Highly Recommended', Math.max(recs.get('Highly Recommended') || 0, 0.85));
      }

      // Family-friendly inference based on keywords
      const familyKeywords = ['family', 'kids', 'child', 'playground', 'park', 'children', 'school', 'educational'];
      if (familyKeywords.some((k) => fullText.includes(k))) {
        recs.set('Family-Friendly', Math.max(recs.get('Family-Friendly') || 0, 0.8));
      }

      // Relaxing/peaceful inference
      const relaxingKeywords = ['relax', 'peaceful', 'quiet', 'serene', 'tranquil', 'spa', 'wellness'];
      if (relaxingKeywords.some((k) => fullText.includes(k))) {
        recs.set('Relaxing', Math.max(recs.get('Relaxing') || 0, 0.8));
      }

      // Remove excluded recommendations and current tags
      const filtered = Array.from(recs.entries())
        .filter(([tag]) => !this.currentTags.includes(tag))
        .filter(([tag]) => !EXCLUDED_RECOMMENDATIONS.has(String(tag).toLowerCase()))
        .sort((a, b) => b[1] - a[1]) // Sort by confidence (highest first)
        .slice(0, 8); // Limit to top 8 recommendations

      return filtered.map(([tag, confidence]) => ({
        tag,
        confidence: confidence,
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

    addTag(tag) {
      const clean = String(tag || '').trim();
      if (!clean) return;
      if (this.currentTags.includes(clean)) return;
      this.currentTags.push(clean);
      this.currentTags.sort((a, b) => a.localeCompare(b));
      this.renderCurrentTags();
      this.renderSuggestions();
      this.renderAutocomplete();
      const input = document.getElementById('ctmInput');
      if (input) input.value = '';
    },

    addTagFromInput() {
      const input = document.getElementById('ctmInput');
      if (!input) return;
      this.addTag(input.value);
    },

    removeTag(tag) {
      this.currentTags = this.currentTags.filter((t) => t !== tag);
      this.renderCurrentTags();
      this.renderSuggestions();
      this.renderAutocomplete();
    },

    clearAllTags() {
      this.currentTags = [];
      this.renderCurrentTags();
      this.renderSuggestions();
      this.renderAutocomplete();
    },

    saveAndClose() {
      if (!window.tagManager || !this.currentPlaceId) {
        this.closeModal();
        return;
      }
      window.tagManager.setTagsForPlace(this.currentPlaceId, this.currentTags);
      window.tagManager.saveTags();
      if (typeof window.showToast === 'function') {
        window.showToast('Tags saved', 'success', 1500);
      }
      this.closeModal();

      // Refresh visible cards to reflect new tags.
      if (typeof window.renderPaginatedCards === 'function') {
        window.renderPaginatedCards();
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
  window.cleanTagManager.openModal = function(placeId, placeName) {
    if (!window.cleanTagManager._initialized) {
      ensureInit();
    }
    return origOpenModal.call(this, placeId, placeName);
  };
})();
