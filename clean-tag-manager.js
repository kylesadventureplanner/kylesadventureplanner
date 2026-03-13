/**
 * CLEAN TAG MANAGER - COMPLETE REDESIGN
 * =====================================
 * Completely new tag manager UI with no weird backgrounds
 * Clean, professional, and fully functional
 *
 * Version: v7.0.118
 * Date: March 13, 2026
 */

(function() {
  // Immediately hide the old tag manager system
  const hideOldSystem = function() {
    // Hide old styles
    const oldStyle = document.getElementById('tagManagerStyles');
    if (oldStyle) {
      oldStyle.innerHTML = `
        #tagManagerBackdrop { display: none !important; visibility: hidden !important; }
        #tagManagerModal { display: none !important; visibility: hidden !important; }
      `;
    }

    // Hide old elements
    setTimeout(() => {
      const backdrop = document.getElementById('tagManagerBackdrop');
      const modal = document.getElementById('tagManagerModal');
      if (backdrop) {
        backdrop.style.display = 'none !important';
        backdrop.style.visibility = 'hidden !important';
        backdrop.classList.remove('visible');
      }
      if (modal) {
        modal.style.display = 'none !important';
        modal.style.visibility = 'hidden !important';
        modal.classList.remove('visible');
      }
    }, 100);
  };

  // Create completely clean tag manager styles
  const createCleanStyles = function() {
    if (document.getElementById('cleanTagManagerStyles')) return;

    const style = document.createElement('style');
    style.id = 'cleanTagManagerStyles';
    style.textContent = `
      /* CLEAN TAG MANAGER - NO WEIRD BACKGROUNDS */

      /* Hide the old backdrop completely */
      #tagManagerBackdrop {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }

      /* Hide the old modal completely */
      #tagManagerModal {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }

      /* NEW CLEAN TAG MANAGER */
      .clean-tag-manager-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9999;
        display: none;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease-out;
      }

      .clean-tag-manager-backdrop.visible {
        display: flex;
      }

      .clean-tag-manager-modal {
        background: white;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        max-width: 700px;
        width: 90%;
        max-height: 85vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: slideUp 0.3s ease-out;
      }

      /* Header */
      .clean-tag-manager-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
      }

      .clean-tag-manager-title {
        font-size: 20px;
        font-weight: 700;
        margin: 0;
      }

      .clean-tag-manager-subtitle {
        font-size: 12px;
        opacity: 0.9;
        margin-top: 4px;
      }

      .clean-tag-manager-close {
        background: none;
        border: none;
        color: white;
        font-size: 28px;
        cursor: pointer;
        padding: 0;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        border-radius: 8px;
      }

      .clean-tag-manager-close:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      /* Body */
      .clean-tag-manager-body {
        padding: 24px;
        overflow-y: auto;
        flex: 1;
      }

      /* Tabs */
      .clean-tag-tabs {
        display: flex;
        gap: 12px;
        border-bottom: 2px solid #e5e7eb;
        margin-bottom: 20px;
        padding-bottom: 0;
      }

      .clean-tag-tab {
        background: none;
        border: none;
        padding: 12px 16px;
        font-weight: 600;
        font-size: 14px;
        color: #6b7280;
        cursor: pointer;
        border-bottom: 3px solid transparent;
        transition: all 0.2s;
        margin-bottom: -2px;
      }

      .clean-tag-tab:hover {
        color: #667eea;
      }

      .clean-tag-tab.active {
        color: #667eea;
        border-bottom-color: #667eea;
      }

      /* Section */
      .clean-tag-section {
        margin-bottom: 24px;
      }

      .clean-tag-section-title {
        font-size: 13px;
        font-weight: 700;
        color: #1f2937;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 12px;
      }

      /* Current tags display */
      .clean-tag-display {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 16px;
        min-height: 60px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: flex-start;
      }

      .clean-tag-item {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
        color: #1e40af;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
        animation: tagPop 0.2s ease-out;
      }

      .clean-tag-remove {
        background: none;
        border: none;
        color: #1e40af;
        cursor: pointer;
        font-size: 16px;
        padding: 0;
        width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .clean-tag-remove:hover {
        background: rgba(30, 64, 175, 0.1);
        border-radius: 50%;
      }

      .clean-tag-item.recommended {
        background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
        color: #065f46;
        border: 1px solid #10b981;
      }

      .clean-tag-item.recommended .clean-tag-remove {
        color: #065f46;
      }

      /* Input */
      .clean-tag-input-wrapper {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
      }

      .clean-tag-input {
        flex: 1;
        padding: 12px 16px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        font-size: 14px;
        font-family: inherit;
        transition: all 0.2s;
      }

      .clean-tag-input:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      /* Recommendations */
      .clean-tag-recommendations {
        background: #f0fdf4;
        border: 2px solid #dcfce7;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 16px;
      }

      .clean-tag-recommendations-title {
        font-size: 13px;
        font-weight: 700;
        color: #065f46;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .clean-tag-suggestions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .clean-tag-suggestion {
        background: white;
        border: 2px solid #86efac;
        color: #15803d;
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .clean-tag-suggestion:hover {
        background: #dcfce7;
        transform: translateY(-2px);
      }

      /* Empty state */
      .clean-tag-empty {
        text-align: center;
        padding: 32px 16px;
        color: #9ca3af;
      }

      .clean-tag-empty-icon {
        font-size: 48px;
        margin-bottom: 12px;
      }

      /* Footer */
      .clean-tag-manager-footer {
        padding: 16px 24px;
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        flex-wrap: wrap;
      }

      .clean-tag-btn {
        padding: 10px 16px;
        border-radius: 8px;
        border: none;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .clean-tag-btn.secondary {
        background: white;
        color: #1f2937;
        border: 2px solid #e5e7eb;
      }

      .clean-tag-btn.secondary:hover {
        background: #f3f4f6;
        border-color: #d1d5db;
      }

      .clean-tag-btn.danger {
        background: white;
        color: #dc2626;
        border: 2px solid #fecaca;
      }

      .clean-tag-btn.danger:hover {
        background: #fee2e2;
      }

      .clean-tag-btn.primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
      }

      .clean-tag-btn.primary:hover {
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        transform: translateY(-2px);
      }

      /* Animations */
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translate(-50%, -40%);
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%);
        }
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes tagPop {
        from {
          opacity: 0;
          transform: scale(0.8);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    `;

    document.head.appendChild(style);
  };

  /**
   * Create clean tag manager modal
   */
  const createCleanModal = function() {
    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'clean-tag-manager-backdrop';
    backdrop.id = 'cleanTagManagerBackdrop';

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'clean-tag-manager-modal';
    modal.id = 'cleanTagManagerModal';

    modal.innerHTML = `
      <div class="clean-tag-manager-header">
        <div>
          <div class="clean-tag-manager-title">🏷️ Tag Manager</div>
          <div class="clean-tag-manager-subtitle" id="cleanTagSubtitle"></div>
        </div>
        <button class="clean-tag-manager-close" onclick="window.cleanTagManager.closeModal()">✕</button>
      </div>

      <div class="clean-tag-manager-body">
        <!-- Tabs -->
        <div class="clean-tag-tabs">
          <button class="clean-tag-tab active" onclick="window.cleanTagManager.switchTab('single')">
            Single Place
          </button>
          <button class="clean-tag-tab" onclick="window.cleanTagManager.switchTab('recommendations')">
            💡 Recommendations
          </button>
        </div>

        <!-- Single Place Tab -->
        <div id="cleanTabSingle">
          <div class="clean-tag-section">
            <div class="clean-tag-section-title">Current Tags</div>
            <div class="clean-tag-display" id="cleanTagDisplay">
              <div class="clean-tag-empty" style="width: 100%; text-align: center;">No tags yet</div>
            </div>
          </div>

          <div class="clean-tag-section">
            <div class="clean-tag-section-title">Add New Tag</div>
            <div class="clean-tag-input-wrapper">
              <input
                type="text"
                id="cleanTagInput"
                class="clean-tag-input"
                placeholder="Type tag name..."
                autocomplete="off"
              />
              <button class="clean-tag-btn primary" onclick="window.cleanTagManager.addTagFromInput()">Add</button>
            </div>
          </div>

          <div class="clean-tag-section">
            <div class="clean-tag-section-title">✨ Suggested Tags</div>
            <div class="clean-tag-recommendations">
              <div class="clean-tag-recommendations-title">📍 Recommendations based on location</div>
              <div class="clean-tag-suggestions" id="cleanTagSuggestions">
                <div style="width: 100%; text-align: center; color: #9ca3af; font-size: 13px;">
                  Load a place to see recommendations
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recommendations Tab -->
        <div id="cleanTabRecommendations" style="display: none;">
          <div class="clean-tag-section">
            <div class="clean-tag-section-title">Recommended Tags</div>
            <div class="clean-tag-recommendations">
              <div class="clean-tag-recommendations-title">Smart suggestions based on place type</div>
              <div class="clean-tag-suggestions" id="cleanAllRecommendations">
                <div style="width: 100%; text-align: center; color: #9ca3af; font-size: 13px;">
                  Load a place to see detailed recommendations
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="clean-tag-manager-footer">
        <button class="clean-tag-btn secondary" onclick="window.cleanTagManager.closeModal()">Cancel</button>
        <button class="clean-tag-btn danger" onclick="window.cleanTagManager.clearAllTags()">Clear All</button>
        <button class="clean-tag-btn primary" onclick="window.cleanTagManager.saveAndClose()">Save Changes</button>
      </div>
    `;

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    // Close on backdrop click
    backdrop.onclick = (e) => {
      if (e.target === backdrop) {
        window.cleanTagManager.closeModal();
      }
    };
  };

  /**
   * Clean Tag Manager System
   */
  window.cleanTagManager = {
    currentPlaceId: null,
    currentTab: 'single',
    currentTags: [],

    init: function() {
      createCleanStyles();
      createCleanModal();
      this.attachEventListeners();
    },

    attachEventListeners: function() {
      const input = document.getElementById('cleanTagInput');
      if (input) {
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            this.addTagFromInput();
          }
        });

        input.addEventListener('input', (e) => {
          this.updateSuggestions(e.target.value);
        });
      }
    },

    openModal: function(placeId, placeName) {
      this.currentPlaceId = placeId;
      this.currentTab = 'single';

      const subtitle = document.getElementById('cleanTagSubtitle');
      if (subtitle) {
        subtitle.textContent = placeName || `Place ID: ${placeId.substring(0, 30)}...`;
      }

      this.loadCurrentTags();
      this.loadRecommendations();

      const backdrop = document.getElementById('cleanTagManagerBackdrop');
      if (backdrop) {
        backdrop.classList.add('visible');
      }
    },

    closeModal: function() {
      const backdrop = document.getElementById('cleanTagManagerBackdrop');
      if (backdrop) {
        backdrop.classList.remove('visible');
      }
    },

    switchTab: function(tab) {
      this.currentTab = tab;

      // Hide all tabs
      const singleTab = document.getElementById('cleanTabSingle');
      const recommendationsTab = document.getElementById('cleanTabRecommendations');

      if (singleTab) singleTab.style.display = 'none';
      if (recommendationsTab) recommendationsTab.style.display = 'none';

      // Show selected tab
      if (tab === 'single' && singleTab) singleTab.style.display = 'block';
      if (tab === 'recommendations' && recommendationsTab) recommendationsTab.style.display = 'block';

      // Update tab buttons
      const tabs = document.querySelectorAll('.clean-tag-tab');
      tabs.forEach(t => t.classList.remove('active'));
      event.target.classList.add('active');
    },

    loadCurrentTags: function() {
      if (!this.currentPlaceId || !window.tagManager) return;

      const tags = window.tagManager.getTagsForPlace(this.currentPlaceId) || [];
      this.currentTags = tags;
      this.renderCurrentTags();
    },

    renderCurrentTags: function() {
      const display = document.getElementById('cleanTagDisplay');
      if (!display) return;

      if (this.currentTags.length === 0) {
        display.innerHTML = '<div class="clean-tag-empty" style="width: 100%; text-align: center;">No tags yet</div>';
        return;
      }

      display.innerHTML = this.currentTags.map(tag => `
        <span class="clean-tag-item">
          ${this.escapeHtml(tag)}
          <button class="clean-tag-remove" onclick="window.cleanTagManager.removeTag('${tag}')">✕</button>
        </span>
      `).join('');
    },

    addTagFromInput: function() {
      const input = document.getElementById('cleanTagInput');
      if (!input || !input.value.trim()) return;

      const tag = input.value.trim();
      if (!this.currentTags.includes(tag)) {
        this.currentTags.push(tag);
        this.renderCurrentTags();
        input.value = '';
      }
    },

    removeTag: function(tag) {
      this.currentTags = this.currentTags.filter(t => t !== tag);
      this.renderCurrentTags();
    },

    clearAllTags: function() {
      if (confirm('Clear all tags from this location?')) {
        this.currentTags = [];
        this.renderCurrentTags();
      }
    },

    loadRecommendations: function() {
      // Smart recommendation engine based on place analysis
      const suggestions = document.getElementById('cleanTagSuggestions');
      if (!suggestions || !this.currentPlaceId) return;

      let recommendations = this.generateSmartRecommendations();

      if (recommendations.length === 0) {
        suggestions.innerHTML = '<div style="width: 100%; text-align: center; color: #9ca3af; font-size: 13px;">No additional recommendations</div>';
        return;
      }

      suggestions.innerHTML = recommendations.map(tag => `
        <button class="clean-tag-suggestion" onclick="window.cleanTagManager.addSuggestedTag('${tag}')">
          ${tag} +
        </button>
      `).join('');
    },

    generateSmartRecommendations: function() {
      // Get place data from adventure data
      if (!window.adventuresData || !this.currentPlaceId) {
        return this.getDefaultRecommendations();
      }

      const place = window.adventuresData.find(p => p[0] === this.currentPlaceId);
      if (!place) {
        return this.getDefaultRecommendations();
      }

      const recommendations = new Set();

      // Extract place characteristics
      const name = (place[1] || '').toLowerCase();
      const type = (place[4] || '').toLowerCase();
      const address = (place[11] || '').toLowerCase();

      // Keywords to exclude
      const excludedTags = new Set(['City Center', 'city center', 'downtown', 'urban', 'commercial']);

      // Smart recommendation rules
      const recommendationRules = [
        // Restaurant indicators
        {
          keywords: ['restaurant', 'cafe', 'coffee', 'diner', 'bistro', 'pizza', 'sushi', 'burger', 'grill', 'pub', 'bar'],
          tags: ['Restaurant', 'Dining', 'Food Scene', 'Local Favorite']
        },
        // Outdoor/Nature indicators
        {
          keywords: ['park', 'trail', 'hiking', 'nature', 'forest', 'river', 'mountain', 'waterfall', 'lake', 'outdoor'],
          tags: ['Outdoor', 'Nature', 'Scenic', 'Family-Friendly', 'Wildlife']
        },
        // Sports/Recreation indicators
        {
          keywords: ['gym', 'athletic', 'sports', 'fitness', 'court', 'field', 'stadium', 'recreation'],
          tags: ['Sports', 'Recreation', 'Athletic', 'Active']
        },
        // Water/Beach indicators
        {
          keywords: ['beach', 'water', 'river', 'lake', 'kayak', 'boat', 'swim', 'fishing'],
          tags: ['Water-Based', 'Beach', 'Swimming', 'Scenic']
        },
        // Historical/Cultural indicators
        {
          keywords: ['museum', 'historical', 'historic', 'monument', 'gallery', 'cultural', 'heritage'],
          tags: ['Historical', 'Cultural', 'Educational', 'Must-Visit']
        },
        // Shopping/Retail indicators
        {
          keywords: ['shop', 'mall', 'store', 'market', 'retail', 'boutique'],
          tags: ['Shopping', 'Local Business', 'Unique Find']
        },
        // Entertainment indicators
        {
          keywords: ['theater', 'cinema', 'movie', 'entertainment', 'music', 'concert', 'show'],
          tags: ['Entertainment', 'Night Life', 'Social']
        },
        // Photography indicators
        {
          keywords: ['scenic', 'vista', 'overlook', 'viewpoint', 'waterfall', 'landscape', 'sunset'],
          tags: ['Photography', 'Scenic', 'Instagram-Worthy']
        }
      ];

      // Apply recommendation rules
      recommendationRules.forEach(rule => {
        if (rule.keywords.some(keyword => name.includes(keyword) || type.includes(keyword) || address.includes(keyword))) {
          rule.tags.forEach(tag => {
            if (!excludedTags.has(tag) && !this.currentTags.includes(tag)) {
              recommendations.add(tag);
            }
          });
        }
      });

      // If no specific recommendations, use defaults
      if (recommendations.size === 0) {
        return this.getDefaultRecommendations();
      }

      // Convert to array and remove already assigned tags
      return Array.from(recommendations).filter(tag => !this.currentTags.includes(tag)).slice(0, 6);
    },

    getDefaultRecommendations: function() {
      const defaults = [
        'Outdoor',
        'Scenic',
        'Family-Friendly',
        'Worth Visiting',
        'Relaxing',
        'Adventure'
      ];

      // Filter out already assigned tags and excluded tags
      return defaults.filter(tag =>
        !this.currentTags.includes(tag) &&
        tag !== 'City Center'
      ).slice(0, 6);
    },

    addSuggestedTag: function(tag) {
      if (!this.currentTags.includes(tag)) {
        this.currentTags.push(tag);
        this.renderCurrentTags();
      }
    },

    saveAndClose: function() {
      if (this.currentPlaceId && window.tagManager) {
        window.tagManager.setTagsForPlace(this.currentPlaceId, this.currentTags);
        window.tagManager.saveTags();
      }
      this.closeModal();
    },

    updateSuggestions: function(value) {
      // Could add autocomplete logic here
    },

    escapeHtml: function(text) {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return String(text).replace(/[&<>"']/g, m => map[m]);
    }
  };

  // Override old tag manager openModal function BEFORE old system runs
  if (window.tagUIManager) {
    window.tagUIManager.openModal = function(placeId, characteristics) {
      window.cleanTagManager.openModal(placeId, placeId);
    };
    // Also override closeModal
    window.tagUIManager.closeModal = function() {
      window.cleanTagManager.closeModal();
    };
  }

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      hideOldSystem();
      window.cleanTagManager.init();
      hideOldSystem(); // Call again to ensure it stays hidden
    });
  } else {
    hideOldSystem();
    window.cleanTagManager.init();
    hideOldSystem();
  }

  // Watch for any attempts to show old system and block them
  setTimeout(() => {
    const observer = new MutationObserver(() => {
      hideOldSystem();
    });

    const backdrop = document.getElementById('tagManagerBackdrop');
    const modal = document.getElementById('tagManagerModal');

    if (backdrop) observer.observe(backdrop, { attributes: true, attributeFilter: ['class', 'style'] });
    if (modal) observer.observe(modal, { attributes: true, attributeFilter: ['class', 'style'] });
  }, 500);
})();

