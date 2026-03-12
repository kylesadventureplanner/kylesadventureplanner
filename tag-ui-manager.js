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
   * Create CSS for tag UI components
   */
  createStyles() {
    if (document.getElementById('tagManagerStyles')) return;

    const style = document.createElement('style');
    style.id = 'tagManagerStyles';
    style.textContent = `
      /* Tag Manager Modal */
      #tagManagerModal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 2px solid #3b82f6;
        border-radius: 12px;
        box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
        z-index: 1001;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        display: none;
        flex-direction: column;
        overflow: hidden;
        animation: slideUp 0.3s ease-out;
      }

      #tagManagerModal.visible {
        display: flex;
      }

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

      #tagManagerBackdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        display: none;
      }

      #tagManagerBackdrop.visible {
        display: block;
      }

      /* Modal Header */
      .tag-modal-header {
        padding: 20px;
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #1e40af;
      }

      .tag-modal-title {
        font-size: 18px;
        font-weight: 700;
        margin: 0;
      }

      .tag-modal-subtitle {
        font-size: 12px;
        opacity: 0.9;
        margin-top: 4px;
      }

      .tag-modal-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        transition: all 0.2s;
      }

      .tag-modal-close:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: scale(1.1);
      }

      /* Modal Body */
      .tag-modal-body {
        padding: 20px;
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      /* Tabs */
      .tag-tabs {
        display: flex;
        gap: 8px;
        border-bottom: 2px solid #e5e7eb;
        margin-bottom: 16px;
      }

      .tag-tab {
        padding: 12px 16px;
        background: none;
        border: none;
        cursor: pointer;
        font-weight: 600;
        color: #6b7280;
        border-bottom: 3px solid transparent;
        transition: all 0.2s;
        font-size: 14px;
      }

      .tag-tab.active {
        color: #3b82f6;
        border-bottom-color: #3b82f6;
      }

      .tag-tab:hover {
        color: #1e40af;
      }

      /* Tag Input Section */
      .tag-input-section {
        display: flex;
        gap: 8px;
      }

      .tag-input {
        flex: 1;
        padding: 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
        font-family: inherit;
        transition: all 0.2s;
      }

      .tag-input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .tag-input-suggestions {
        position: absolute;
        background: white;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        max-height: 200px;
        overflow-y: auto;
        width: 100%;
        z-index: 1010;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        display: none;
      }

      .tag-input-suggestions.visible {
        display: block;
      }

      .tag-suggestion {
        padding: 8px 12px;
        cursor: pointer;
        transition: all 0.1s;
      }

      .tag-suggestion:hover {
        background: #f3f4f6;
      }

      .tag-suggestion.selected {
        background: #dbeafe;
        color: #1e40af;
      }

      /* Tag Pill */
      .tag-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: #dbeafe;
        color: #1e40af;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
        border: 1px solid #93c5fd;
        transition: all 0.2s;
        animation: tagPop 0.3s ease-out;
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

      .tag-pill:hover {
        background: #bfdbfe;
        border-color: #60a5fa;
      }

      .tag-pill-remove {
        cursor: pointer;
        font-size: 16px;
        opacity: 0.6;
        transition: all 0.2s;
        padding: 0;
        background: none;
        border: none;
        color: inherit;
      }

      .tag-pill-remove:hover {
        opacity: 1;
        transform: scale(1.2);
      }

      /* Current Tags Display */
      .tag-current-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .tag-current-label {
        font-size: 13px;
        font-weight: 600;
        color: #374151;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .tag-current-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        min-height: 32px;
        padding: 8px;
        background: #f9fafb;
        border-radius: 6px;
        border: 1px solid #e5e7eb;
      }

      .tag-current-empty {
        color: #9ca3af;
        font-style: italic;
        display: flex;
        align-items: center;
        height: 32px;
      }

      /* Recommended Tags */
      .tag-recommended-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .tag-recommended-label {
        font-size: 13px;
        font-weight: 600;
        color: #374151;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .tag-recommended-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 8px;
        background: #f0fdf4;
        border-radius: 6px;
        border: 1px solid #bbf7d0;
      }

      .tag-recommended-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #ecfdf5;
        color: #047857;
        padding: 6px 10px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 600;
        border: 1px solid #6ee7b7;
        cursor: pointer;
        transition: all 0.2s;
      }

      .tag-recommended-pill:hover {
        background: #d1fae5;
        border-color: #10b981;
        transform: scale(1.05);
      }

      .tag-recommended-empty {
        color: #6b7280;
        font-style: italic;
      }

      /* Batch Selection */
      .tag-batch-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .tag-batch-info {
        background: #fef3c7;
        border: 1px solid #fbbf24;
        padding: 12px;
        border-radius: 6px;
        font-size: 13px;
        color: #92400e;
      }

      .tag-batch-places {
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        padding: 8px;
        background: #f9fafb;
      }

      .tag-batch-place {
        padding: 8px;
        background: white;
        border-radius: 4px;
        margin-bottom: 4px;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .tag-batch-place input[type="checkbox"] {
        cursor: pointer;
        width: 18px;
        height: 18px;
      }

      /* Modal Footer */
      .tag-modal-footer {
        padding: 16px 20px;
        border-top: 1px solid #e5e7eb;
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        flex-wrap: wrap;
      }

      .tag-btn {
        padding: 10px 16px;
        border-radius: 6px;
        border: 1px solid #d1d5db;
        background: white;
        color: #374151;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.2s;
      }

      .tag-btn:hover {
        background: #f3f4f6;
        border-color: #9ca3af;
      }

      .tag-btn.primary {
        background: #3b82f6;
        color: white;
        border-color: #3b82f6;
      }

      .tag-btn.primary:hover {
        background: #2563eb;
        border-color: #2563eb;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      }

      .tag-btn.danger {
        background: #fee2e2;
        color: #dc2626;
        border-color: #fca5a5;
      }

      .tag-btn.danger:hover {
        background: #fecaca;
        border-color: #f87171;
      }

      .tag-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Statistics */
      .tag-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 12px;
        margin-top: 12px;
      }

      .tag-stat-card {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        padding: 12px;
        border-radius: 6px;
        text-align: center;
      }

      .tag-stat-value {
        font-size: 20px;
        font-weight: 700;
        color: #3b82f6;
      }

      .tag-stat-label {
        font-size: 11px;
        color: #6b7280;
        margin-top: 4px;
        text-transform: uppercase;
      }

      /* Tag Manager Button (in table) */
      .tag-manager-btn {
        border-radius: 50%;
        border: 1px solid #d1d5db;
        background: #f3f4f6;
        color: #374151;
        padding: 6px;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.2s;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .tag-manager-btn:hover {
        background: #e5e7eb;
        border-color: #6b7280;
        transform: scale(1.1);
      }

      .tag-manager-btn.has-tags {
        background: #dbeafe;
        border-color: #3b82f6;
        color: #1e40af;
      }

      /* Mobile responsiveness */
      @media (max-width: 768px) {
        #tagManagerModal {
          max-width: 95%;
          max-height: 90vh;
        }

        .tag-modal-header {
          padding: 16px;
        }

        .tag-modal-body {
          padding: 16px;
        }

        .tag-modal-footer {
          flex-direction: column;
        }

        .tag-btn {
          width: 100%;
        }

        .tag-tabs {
          flex-wrap: wrap;
        }

        .tag-tab {
          padding: 10px 12px;
          font-size: 12px;
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
          ${tag}
          <button class="tag-pill-remove" onclick="tagUIManager.removeTag('${tag}')">×</button>
        </span>
      `).join('');
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
      <div class="tag-suggestion" onclick="tagUIManager.selectSuggestion('${tag}')">
        ${tag}
      </div>
    `).join('');

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
        <span class="tag-recommended-pill" onclick="tagUIManager.addRecommendedTag('${tag}')">
          + ${tag}
        </span>
      `).join('');

      recList.innerHTML = html;
      recListFull.innerHTML = html;
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

