/**
 * TAG MANAGEMENT UI COMPONENTS
 * ============================
 * Handles rendering and interaction for tag management UI
 * including modals, inline editors, and batch operations
 *
 * Version: v7.0.112+
 * Date: March 11, 2026
 */

class TagUIManager {
  constructor() {
    this.currentPlaceId = null;
    this.currentMode = 'view'; // view, edit, batch
    this.selectedPlaces = [];
    this.availableTags = [];
    this.init();
  }

  init() {
    this.createStyles();
    this.createMarkup();
    this.attachEventListeners();
    this.loadAvailableTags();
  }

  /**
   * Escape HTML special characters to prevent XSS
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Create CSS for tag UI components
   */
  createStyles() {
    if (document.getElementById('tagManagerStyles')) return;

    const style = document.createElement('style');
    style.id = 'tagManagerStyles';
    style.textContent = `
      /* ============================================================
         TAG MANAGER MODAL STYLING - MATCHES APP DESIGN SYSTEM
         ============================================================ */

      /* Animations */
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translate(-50%, -45%);
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

      /* Backdrop */
      #tagManagerBackdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.4);
        z-index: 1000;
        display: none;
        animation: fadeIn 0.2s ease-out;
      }

      #tagManagerBackdrop.visible {
        display: block;
      }

      /* Modal Container */
      #tagManagerModal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-2xl);
        z-index: 1001;
        max-width: 650px;
        width: 90%;
        max-height: 85vh;
        display: none;
        flex-direction: column;
        overflow: hidden;
        animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid var(--neutral-200);
      }

      #tagManagerModal.visible {
        display: flex;
      }

      /* Modal Header */
      .tag-modal-header {
        padding: var(--space-xl);
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(14, 165, 233, 0.02) 100%);
        border-bottom: 1px solid var(--neutral-200);
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      .tag-modal-title {
        font-size: 20px;
        font-weight: 700;
        margin: 0;
        color: var(--neutral-900);
        letter-spacing: -0.3px;
      }

      .tag-modal-subtitle {
        font-size: 12px;
        color: var(--neutral-500);
        margin-top: var(--space-sm);
        font-weight: 500;
      }

      .tag-modal-close {
        background: none;
        border: none;
        color: var(--neutral-500);
        font-size: 24px;
        cursor: pointer;
        padding: var(--space-sm);
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-md);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .tag-modal-close:hover {
        background: var(--neutral-100);
        color: var(--neutral-700);
        transform: scale(1.1);
      }

      /* Modal Body */
      .tag-modal-body {
        padding: var(--space-xl);
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
      }

      /* Tabs */
      .tag-tabs {
        display: flex;
        gap: var(--space-md);
        border-bottom: 2px solid var(--neutral-200);
        margin-bottom: var(--space-lg);
      }

      .tag-tab {
        padding: var(--space-md) var(--space-lg);
        background: none;
        border: none;
        cursor: pointer;
        font-weight: 600;
        color: var(--neutral-500);
        border-bottom: 3px solid transparent;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        font-size: 14px;
        position: relative;
        margin-bottom: -2px;
      }

      .tag-tab.active {
        color: var(--primary);
        border-bottom-color: var(--primary);
      }

      .tag-tab:hover {
        color: var(--primary-dark);
      }

      /* Sections */
      .tag-current-section,
      .tag-recommended-section,
      .tag-batch-section {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
      }

      /* Section Labels */
      .tag-current-label,
      .tag-recommended-label {
        font-size: 12px;
        font-weight: 700;
        color: var(--neutral-700);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      /* Tag Input Section */
      .tag-input-section {
        display: flex;
        gap: var(--space-sm);
        position: relative;
      }

      .tag-input {
        flex: 1;
        padding: var(--space-md) var(--space-lg);
        border: 1px solid var(--neutral-300);
        background: white;
        border-radius: var(--radius-md);
        font-size: 14px;
        font-family: var(--font-sans);
        color: var(--neutral-900);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .tag-input::placeholder {
        color: var(--neutral-400);
      }

      .tag-input:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        background: white;
      }

      /* Tag Suggestions Dropdown */
      .tag-input-suggestions {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid var(--neutral-200);
        border-top: none;
        border-radius: 0 0 var(--radius-md) var(--radius-md);
        max-height: 220px;
        overflow-y: auto;
        z-index: 1010;
        box-shadow: var(--shadow-lg);
        display: none;
        animation: fadeIn 0.15s ease-out;
        margin-top: -1px;
      }

      .tag-input-suggestions.visible {
        display: block;
      }

      .tag-suggestion {
        padding: var(--space-md) var(--space-lg);
        cursor: pointer;
        transition: all 0.1s;
        border-bottom: 1px solid var(--neutral-100);
        color: var(--neutral-700);
        font-size: 14px;
      }

      .tag-suggestion:last-child {
        border-bottom: none;
      }

      .tag-suggestion:hover {
        background: var(--neutral-50);
        color: var(--primary);
        padding-left: calc(var(--space-lg) + 4px);
      }

      .tag-suggestion.selected {
        background: var(--primary-light);
        color: var(--primary);
        font-weight: 600;
      }

      /* Current Tags List */
      .tag-current-list {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-sm);
        min-height: 44px;
        padding: var(--space-md) var(--space-lg);
        background: var(--neutral-50);
        border-radius: var(--radius-md);
        border: 1px solid var(--neutral-200);
        align-items: center;
      }

      .tag-current-empty {
        color: var(--neutral-400);
        font-size: 14px;
        font-style: italic;
        display: flex;
        align-items: center;
        height: 32px;
      }

      /* Tag Pill */
      .tag-pill {
        display: inline-flex;
        align-items: center;
        gap: var(--space-sm);
        background: linear-gradient(135deg, var(--primary-light) 0%, rgba(59, 130, 246, 0.05) 100%);
        color: var(--primary-dark);
        padding: var(--space-sm) var(--space-md);
        border-radius: var(--radius-full);
        font-size: 13px;
        font-weight: 600;
        border: 1px solid var(--primary);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        animation: tagPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .tag-pill:hover {
        background: var(--primary);
        color: white;
        border-color: var(--primary-dark);
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
      }

      .tag-pill-remove {
        cursor: pointer;
        font-size: 16px;
        opacity: 0.7;
        transition: all 0.2s;
        padding: 0;
        background: none;
        border: none;
        color: inherit;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
      }

      .tag-pill:hover .tag-pill-remove {
        opacity: 1;
      }

      .tag-pill-remove:hover {
        transform: scale(1.3);
      }

      /* Recommended Tags */
      .tag-recommended-list {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-sm);
        padding: var(--space-lg);
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.02) 0%, rgba(16, 185, 129, 0.01) 100%);
        border-radius: var(--radius-md);
        border: 1px solid var(--accent-success);
        border-opacity: 0.3;
        min-height: 50px;
        align-items: center;
      }

      .tag-recommended-empty {
        color: var(--neutral-500);
        font-size: 14px;
        font-style: italic;
      }

      .tag-recommended-pill {
        display: inline-flex;
        align-items: center;
        gap: var(--space-sm);
        background: linear-gradient(135deg, var(--accent-success) 0%, rgba(16, 185, 129, 0.8) 100%);
        color: white;
        padding: var(--space-sm) var(--space-md);
        border-radius: var(--radius-full);
        font-size: 13px;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: var(--shadow-sm);
      }

      .tag-recommended-pill:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
        filter: brightness(1.1);
      }

      .tag-recommended-pill:active {
        transform: translateY(0);
        box-shadow: var(--shadow-sm);
      }

      /* Batch Mode */
      .tag-batch-section {
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
      }

      .tag-batch-info {
        background: linear-gradient(135deg, var(--accent-warning) 0%, rgba(245, 158, 11, 0.8) 100%);
        border: 1px solid var(--accent-warning);
        padding: var(--space-lg);
        border-radius: var(--radius-md);
        font-size: 14px;
        color: #78350f;
        font-weight: 500;
        box-shadow: var(--shadow-sm);
      }

      .tag-batch-places {
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid var(--neutral-200);
        border-radius: var(--radius-md);
        padding: var(--space-md);
        background: var(--neutral-50);
      }

      .tag-batch-place {
        padding: var(--space-md) var(--space-lg);
        background: white;
        border-radius: var(--radius-sm);
        margin-bottom: var(--space-sm);
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: var(--space-md);
        border: 1px solid var(--neutral-200);
        transition: all 0.2s;
      }

      .tag-batch-place:hover {
        background: var(--neutral-50);
        border-color: var(--primary);
      }

      .tag-batch-place input[type="checkbox"] {
        cursor: pointer;
        width: 18px;
        height: 18px;
        accent-color: var(--primary);
      }

      /* Modal Footer */
      .tag-modal-footer {
        padding: var(--space-lg) var(--space-xl);
        border-top: 1px solid var(--neutral-200);
        display: flex;
        gap: var(--space-md);
        justify-content: flex-end;
        flex-wrap: wrap;
        background: var(--neutral-50);
      }

      /* Buttons */
      .tag-btn {
        padding: var(--space-md) var(--space-xl);
        border-radius: var(--radius-md);
        border: 1px solid var(--neutral-300);
        background: white;
        color: var(--neutral-700);
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: var(--font-sans);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 100px;
      }

      .tag-btn:hover:not(:disabled) {
        background: var(--neutral-100);
        border-color: var(--neutral-400);
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }

      .tag-btn:active:not(:disabled) {
        transform: translateY(0);
      }

      /* Primary Button */
      .tag-btn.primary {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
      }

      .tag-btn.primary:hover:not(:disabled) {
        background: var(--primary-dark);
        border-color: var(--primary-dark);
        box-shadow: var(--shadow-lg);
      }

      /* Danger Button */
      .tag-btn.danger {
        background: linear-gradient(135deg, var(--accent-danger) 0%, rgba(239, 68, 68, 0.8) 100%);
        color: white;
        border-color: var(--accent-danger);
      }

      .tag-btn.danger:hover:not(:disabled) {
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1), var(--shadow-lg);
        transform: translateY(-1px);
      }

      .tag-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Statistics */
      .tag-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: var(--space-lg);
        margin-top: var(--space-lg);
      }

      .tag-stat-card {
        background: white;
        border: 1px solid var(--neutral-200);
        padding: var(--space-lg);
        border-radius: var(--radius-md);
        text-align: center;
        transition: all 0.2s;
        box-shadow: var(--shadow-sm);
      }

      .tag-stat-card:hover {
        box-shadow: var(--shadow-md);
        border-color: var(--primary);
        transform: translateY(-2px);
      }

      .tag-stat-value {
        font-size: 24px;
        font-weight: 700;
        color: var(--primary);
      }

      .tag-stat-label {
        font-size: 11px;
        color: var(--neutral-500);
        margin-top: var(--space-sm);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 600;
      }

      /* Tag Manager Button (in cards/table) */
      .tag-manager-btn {
        border-radius: var(--radius-full);
        border: 1px solid var(--neutral-300);
        background: var(--neutral-100);
        color: var(--neutral-600);
        padding: var(--space-sm);
        font-size: 16px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .tag-manager-btn:hover {
        background: var(--neutral-200);
        border-color: var(--neutral-400);
        transform: scale(1.1);
        box-shadow: var(--shadow-md);
      }

      .tag-manager-btn.has-tags {
        background: var(--primary-light);
        border-color: var(--primary);
        color: var(--primary-dark);
      }

      /* Scrollbar styling */
      .tag-modal-body::-webkit-scrollbar,
      .tag-batch-places::-webkit-scrollbar,
      .tag-input-suggestions::-webkit-scrollbar {
        width: 6px;
      }

      .tag-modal-body::-webkit-scrollbar-track,
      .tag-batch-places::-webkit-scrollbar-track,
      .tag-input-suggestions::-webkit-scrollbar-track {
        background: transparent;
      }

      .tag-modal-body::-webkit-scrollbar-thumb,
      .tag-batch-places::-webkit-scrollbar-thumb,
      .tag-input-suggestions::-webkit-scrollbar-thumb {
        background: var(--neutral-300);
        border-radius: 3px;
      }

      .tag-modal-body::-webkit-scrollbar-thumb:hover,
      .tag-batch-places::-webkit-scrollbar-thumb:hover,
      .tag-input-suggestions::-webkit-scrollbar-thumb:hover {
        background: var(--neutral-400);
      }

      /* Mobile Responsiveness */
      @media (max-width: 768px) {
        #tagManagerModal {
          max-width: 95%;
          max-height: 90vh;
        }

        .tag-modal-header {
          padding: var(--space-lg);
        }

        .tag-modal-body {
          padding: var(--space-lg);
          gap: var(--space-md);
        }

        .tag-modal-footer {
          padding: var(--space-lg);
          flex-direction: column-reverse;
        }

        .tag-btn {
          width: 100%;
        }

        .tag-tabs {
          flex-wrap: wrap;
        }

        .tag-tab {
          padding: var(--space-md) var(--space-lg);
          font-size: 13px;
          flex: 1;
          min-width: 120px;
        }

        .tag-stats {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Create HTML markup for tag management modal
   */
  createMarkup() {
    if (document.getElementById('tagManagerModal')) return;

    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'tagManagerBackdrop';
    backdrop.addEventListener('click', () => this.closeModal());

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'tagManagerModal';
    modal.innerHTML = `
      <div class="tag-modal-header">
        <div>
          <div class="tag-modal-title">🏷️ Tag Manager</div>
          <div class="tag-modal-subtitle" id="tagModalSubtitle"></div>
        </div>
        <button class="tag-modal-close" onclick="tagUIManager.closeModal()">✕</button>
      </div>

      <div class="tag-modal-body">
        <!-- Tabs -->
        <div class="tag-tabs">
          <button class="tag-tab active" data-tab="single" onclick="tagUIManager.switchTab('single')">
            Single Place
          </button>
          <button class="tag-tab" data-tab="batch" onclick="tagUIManager.switchTab('batch')">
            Batch Mode
          </button>
          <button class="tag-tab" data-tab="recommendations" onclick="tagUIManager.switchTab('recommendations')">
            💡 Recommendations
          </button>
        </div>

        <!-- Single Place Tab -->
        <div class="tag-tab-content" data-content="single">
          <div class="tag-current-section">
            <label class="tag-current-label">Current Tags</label>
            <div class="tag-current-list" id="tagCurrentList">
              <span class="tag-current-empty">No tags yet</span>
            </div>
          </div>

          <div class="tag-input-section">
            <input 
              type="text" 
              id="tagInput" 
              class="tag-input" 
              placeholder="Enter a tag and press Enter or click Add..."
              autocomplete="off"
            />
            <button class="tag-btn primary" onclick="tagUIManager.addTagFromInput()">Add Tag</button>
          </div>

          <div id="tagSuggestions" class="tag-input-suggestions"></div>

          <div class="tag-recommended-section">
            <label class="tag-recommended-label">✨ Suggested Tags</label>
            <div class="tag-recommended-list" id="tagRecommendedList">
              <span class="tag-recommended-empty">Load a place to see recommendations</span>
            </div>
          </div>
        </div>

        <!-- Batch Mode Tab -->
        <div class="tag-tab-content" data-content="batch" style="display: none;">
          <div class="tag-batch-section">
            <div class="tag-batch-info">
              Select multiple places and apply tags to all of them at once.
            </div>

            <label class="tag-current-label">Select Places</label>
            <div class="tag-batch-places" id="tagBatchPlaces">
              <span class="tag-current-empty">No places available</span>
            </div>

            <div class="tag-input-section">
              <input 
                type="text" 
                id="tagBatchInput" 
                class="tag-input" 
                placeholder="Enter tags to apply to selected places..."
                autocomplete="off"
              />
              <button class="tag-btn primary" onclick="tagUIManager.addTagsToSelected()">Add to All</button>
            </div>

            <div class="tag-stats" id="tagStats"></div>
          </div>
        </div>

        <!-- Recommendations Tab -->
        <div class="tag-tab-content" data-content="recommendations" style="display: none;">
          <div class="tag-recommended-section">
            <label class="tag-current-label">Recommended Tags Based on Place Type</label>
            <div class="tag-recommended-list" id="tagRecommendedListFull">
              <span class="tag-recommended-empty">Load a place to see detailed recommendations</span>
            </div>
          </div>

          <div class="tag-stats" id="tagStatsRecommendations"></div>
        </div>
      </div>

      <div class="tag-modal-footer">
        <button class="tag-btn" onclick="tagUIManager.closeModal()">Cancel</button>
        <button class="tag-btn danger" onclick="tagUIManager.clearAllTags()">Clear All Tags</button>
        <button class="tag-btn primary" onclick="tagUIManager.saveAndClose()">Save Changes</button>
      </div>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(modal);

    // Create global instance for tagUIManager
    window.tagUIManager = this;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const tagInput = document.getElementById('tagInput');
    if (tagInput) {
      tagInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.addTagFromInput();
          e.preventDefault();
        }
      });

      tagInput.addEventListener('input', (e) => {
        this.updateSuggestions(e.target.value);
      });
    }
  }

  /**
   * Load available tags from tag manager
   */
  loadAvailableTags() {
    if (window.tagManager) {
      this.availableTags = window.tagManager.getAllTags();
    }
  }

  /**
   * Open tag manager for a place
   */
  openModal(placeId, characteristics = null) {
    this.currentPlaceId = placeId;
    this.currentMode = 'single';

    const modal = document.getElementById('tagManagerModal');
    const backdrop = document.getElementById('tagManagerBackdrop');
    const subtitle = document.getElementById('tagModalSubtitle');

    subtitle.textContent = `Place ID: ${placeId.substring(0, 30)}...`;

    this.updateCurrentTags();

    if (characteristics) {
      this.updateRecommendations(characteristics);
    }

    modal.classList.add('visible');
    backdrop.classList.add('visible');
  }

  /**
   * Close modal
   */
  closeModal() {
    const modal = document.getElementById('tagManagerModal');
    const backdrop = document.getElementById('tagManagerBackdrop');

    modal.classList.remove('visible');
    backdrop.classList.remove('visible');

    this.currentPlaceId = null;
  }

  /**
   * Switch between tabs
   */
  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tag-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll('.tag-tab-content').forEach(content => {
      content.style.display = content.dataset.content === tabName ? 'flex' : 'none';
    });

    this.currentMode = tabName;
  }

  /**
   * Update current tags display
   */
  updateCurrentTags() {
    if (!this.currentPlaceId || !window.tagManager) return;

    const tags = window.tagManager.getTagsForPlace(this.currentPlaceId);
    const tagList = document.getElementById('tagCurrentList');

    if (tags.length === 0) {
      tagList.innerHTML = '<span class="tag-current-empty">No tags yet</span>';
    } else {
      tagList.innerHTML = tags.map(tag => `
        <span class="tag-pill">
          ${this.escapeHtml(tag)}
          <button class="tag-pill-remove" data-tag="${this.escapeHtml(tag)}">×</button>
        </span>
      `).join('');

      // Attach event listeners to remove buttons
      tagList.querySelectorAll('.tag-pill-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const tag = e.target.dataset.tag;
          this.removeTag(tag);
        });
      });
    }
  }

  /**
   * Update suggestions as user types
   */
  updateSuggestions(input) {
    const suggestionsDiv = document.getElementById('tagSuggestions');

    if (!input || input.length < 1) {
      suggestionsDiv.classList.remove('visible');
      return;
    }

    this.loadAvailableTags();
    const matching = this.availableTags.filter(tag =>
      tag.toLowerCase().includes(input.toLowerCase())
    );

    if (matching.length === 0) {
      suggestionsDiv.classList.remove('visible');
      return;
    }

    suggestionsDiv.innerHTML = matching.map(tag => `
      <div class="tag-suggestion" data-tag="${this.escapeHtml(tag)}">
        ${this.escapeHtml(tag)}
      </div>
    `).join('');

    // Attach event listeners to suggestion items
    suggestionsDiv.querySelectorAll('.tag-suggestion').forEach(item => {
      item.addEventListener('click', (e) => {
        const tag = e.target.dataset.tag;
        this.selectSuggestion(tag);
      });
    });

    suggestionsDiv.classList.add('visible');
  }

  /**
   * Select a suggestion
   */
  selectSuggestion(tag) {
    const tagInput = document.getElementById('tagInput');
    tagInput.value = tag;
    document.getElementById('tagSuggestions').classList.remove('visible');
    this.addTagFromInput();
  }

  /**
   * Add tag from input field
   */
  addTagFromInput() {
    if (!this.currentPlaceId || !window.tagManager) return;

    const input = document.getElementById('tagInput');
    const tag = input.value.trim();

    if (!tag) return;

    window.tagManager.addTagToPlace(this.currentPlaceId, tag);
    input.value = '';
    document.getElementById('tagSuggestions').classList.remove('visible');

    this.updateCurrentTags();
    this.loadAvailableTags();
  }

  /**
   * Remove a tag
   */
  removeTag(tag) {
    if (!this.currentPlaceId || !window.tagManager) return;

    window.tagManager.removeTagFromPlace(this.currentPlaceId, tag);
    this.updateCurrentTags();
  }

  /**
   * Update recommendations
   */
  updateRecommendations(characteristics) {
    if (!window.tagManager) return;

    const recommended = window.tagManager.getRecommendedTags(characteristics);
    const currentTags = window.tagManager.getTagsForPlace(this.currentPlaceId);

    const availableRecs = recommended.filter(tag => !currentTags.includes(tag));

    const recList = document.getElementById('tagRecommendedList');
    const recListFull = document.getElementById('tagRecommendedListFull');

    if (availableRecs.length === 0) {
      recList.innerHTML = '<span class="tag-recommended-empty">All recommendations already added</span>';
      recListFull.innerHTML = '<span class="tag-recommended-empty">All recommendations already added</span>';
    } else {
      const html = availableRecs.map(tag => `
        <span class="tag-recommended-pill" data-tag="${this.escapeHtml(tag)}">
          + ${this.escapeHtml(tag)}
        </span>
      `).join('');

      recList.innerHTML = html;
      recListFull.innerHTML = html;

      // Attach event listeners to recommended pills
      recList.querySelectorAll('.tag-recommended-pill').forEach(pill => {
        pill.addEventListener('click', (e) => {
          const tag = e.target.closest('.tag-recommended-pill').dataset.tag;
          this.addRecommendedTag(tag);
        });
      });

      recListFull.querySelectorAll('.tag-recommended-pill').forEach(pill => {
        pill.addEventListener('click', (e) => {
          const tag = e.target.closest('.tag-recommended-pill').dataset.tag;
          this.addRecommendedTag(tag);
        });
      });
    }
  }

  /**
   * Add recommended tag
   */
  addRecommendedTag(tag) {
    if (!this.currentPlaceId || !window.tagManager) return;

    window.tagManager.addTagToPlace(this.currentPlaceId, tag);
    this.updateCurrentTags();
  }

  /**
   * Clear all tags
   */
  clearAllTags() {
    if (!this.currentPlaceId || !window.tagManager) return;

    if (confirm('Are you sure you want to remove all tags from this place?')) {
      window.tagManager.clearTagsForPlace(this.currentPlaceId);
      this.updateCurrentTags();
    }
  }

  /**
   * Save and close
   */
  saveAndClose() {
    if (window.tagManager) {
      window.tagManager.saveTags();
    }

    // Refresh card display if renderPaginatedCards exists (integrate with main app)
    if (typeof window.renderPaginatedCards === 'function') {
      console.log('🔄 Refreshing card display after tag changes...');
      setTimeout(() => {
        window.renderPaginatedCards();
      }, 100);
    }

    this.closeModal();
  }

  /**
   * Add tags to selected places (batch)
   */
  addTagsToSelected() {
    if (!window.tagManager) return;

    const input = document.getElementById('tagBatchInput');
    const tagsToAdd = input.value.split(',').map(t => t.trim()).filter(t => t);

    if (tagsToAdd.length === 0 || this.selectedPlaces.length === 0) return;

    window.tagManager.addTagsToBatchPlaces(this.selectedPlaces, tagsToAdd);
    input.value = '';

    this.updateBatchStats();
  }

  /**
   * Update batch statistics
   */
  updateBatchStats() {
    if (!window.tagManager) return;

    const stats = window.tagManager.getTagStats();
    const statsDiv = document.getElementById('tagStats');
    const statsHtml = `
      <div class="tag-stat-card">
        <div class="tag-stat-value">${Object.keys(stats).length}</div>
        <div class="tag-stat-label">Total Tags</div>
      </div>
      <div class="tag-stat-card">
        <div class="tag-stat-value">${window.tagManager.tags.size}</div>
        <div class="tag-stat-label">Places Tagged</div>
      </div>
    `;
    statsDiv.innerHTML = statsHtml;
  }
}

// Create global instance - wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('📦 Initializing TagUIManager...');
    window.tagUIManager = new TagUIManager();
    console.log('✅ TagUIManager initialized successfully');
  });
} else {
  console.log('📦 Initializing TagUIManager...');
  window.tagUIManager = new TagUIManager();
  console.log('✅ TagUIManager initialized successfully');
}

