/**
 * TAG AUTOCOMPLETE INPUT FIELD - COMPLETE IMPLEMENTATION
 * ========================================================
 * Production-ready tag input with autocomplete, conflict detection,
 * and validation using the advanced tag system v7.0.200
 *
 * Deploy this by including in your HTML and calling initTagAutocomplete()
 */

// ============================================================
// HTML STRUCTURE (Add to your page)
// ============================================================

const TAG_AUTOCOMPLETE_HTML = `
<div class="tag-autocomplete-container">
  <div class="tag-input-wrapper">
    <input 
      type="text" 
      id="tagAutocompleteInput" 
      class="tag-input-field"
      placeholder="🏷️ Type tag name... (e.g., 'hiking', 'family')"
      autocomplete="off">
    <span class="tag-input-hint" id="tagInputHint">Start typing for suggestions</span>
  </div>
  
  <div id="tagSuggestionsContainer" class="tag-suggestions-container" style="display: none;">
    <div class="tag-suggestions-header">
      <span>Suggestions</span>
      <button type="button" class="close-suggestions" onclick="closeTagSuggestions()">✕</button>
    </div>
    <div id="tagSuggestionsList" class="tag-suggestions-list"></div>
  </div>
  
  <div id="selectedTagsContainer" class="selected-tags-container">
    <div class="selected-tags-header">
      <span>Selected Tags</span>
      <span id="selectedTagsCount" class="tag-count">0</span>
    </div>
    <div id="selectedTagsList" class="selected-tags-list"></div>
  </div>
  
  <div id="validationMessagesContainer" class="validation-messages-container"></div>
</div>

<style>
.tag-autocomplete-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  max-width: 600px;
  margin: 20px 0;
}

/* Input Field */
.tag-input-wrapper {
  position: relative;
  margin-bottom: 10px;
}

.tag-input-field {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.tag-input-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.tag-input-field::placeholder {
  color: #9ca3af;
}

.tag-input-hint {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #9ca3af;
  pointer-events: none;
}

/* Suggestions Container */
.tag-suggestions-container {
  position: relative;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  max-height: 400px;
  overflow-y: auto;
  z-index: 100;
}

.tag-suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid #f3f4f6;
  font-weight: 600;
  font-size: 12px;
  color: #6b7280;
  background: #f9fafb;
}

.close-suggestions {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: #9ca3af;
  font-size: 16px;
  transition: color 0.2s;
}

.close-suggestions:hover {
  color: #6b7280;
}

.tag-suggestions-list {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tag-suggestion-item {
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.15s ease;
  border: 1px solid transparent;
}

.tag-suggestion-item:hover {
  background-color: #f3f4f6;
  border-color: #e5e7eb;
}

.tag-suggestion-item:active {
  background-color: #e5e7eb;
}

.tag-suggestion-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.tag-suggestion-name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-suggestion-meta {
  display: flex;
  gap: 8px;
  margin-left: auto;
  flex-shrink: 0;
}

.tag-suggestion-type {
  font-size: 11px;
  padding: 2px 6px;
  background: #f0f9ff;
  color: #0369a1;
  border-radius: 3px;
  font-weight: 600;
}

.tag-suggestion-score {
  font-size: 11px;
  color: #9ca3af;
  padding: 2px 6px;
}

/* Empty State */
.tag-suggestions-empty {
  padding: 20px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}

/* Selected Tags */
.selected-tags-container {
  background: #fafbfc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 15px;
}

.selected-tags-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
}

.tag-count {
  background: #dbeafe;
  color: #0c4a6e;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 700;
}

.selected-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 32px;
}

.tag-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid;
  animation: slideIn 0.2s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.tag-badge-remove {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 16px;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.2s;
  line-height: 1;
}

.tag-badge-remove:hover {
  opacity: 1;
}

.selected-tags-empty {
  color: #9ca3af;
  font-size: 13px;
  font-style: italic;
}

/* Validation Messages */
.validation-messages-container {
  pointer-events: none;
}

.validation-message {
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 8px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.validation-error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.validation-warning {
  background: #fef3c7;
  color: #78350f;
  border: 1px solid #fcd34d;
}

.validation-success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #86efac;
}

.validation-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.validation-text {
  flex: 1;
}

.validation-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 16px;
  color: inherit;
  opacity: 0.5;
  transition: opacity 0.2s;
  pointer-events: auto;
}

.validation-close:hover {
  opacity: 1;
}

/* Loading State */
.loading {
  opacity: 0.6;
  pointer-events: none;
}

/* Responsive */
@media (max-width: 640px) {
  .tag-autocomplete-container {
    margin: 15px 0;
  }

  .tag-suggestion-item {
    padding: 8px 10px;
  }

  .tag-suggestion-meta {
    display: none;
  }
}
</style>
`;

// ============================================================
// JAVASCRIPT IMPLEMENTATION
// ============================================================

class TagAutocompleteInput {
  constructor(config = {}) {
    this.config = {
      maxTags: config.maxTags || 10,
      minSearchLength: config.minSearchLength || 1,
      suggestionLimit: config.suggestionLimit || 10,
      debounceDelay: config.debounceDelay || 150,
      showConflictWarnings: config.showConflictWarnings !== false,
      onSelectionChange: config.onSelectionChange || null,
      ...config
    };

    this.selectedTags = [];
    this.debounceTimer = null;
    this.validationMessages = [];

    this.initializeElements();
    this.attachEventListeners();
  }

  /**
   * Initialize DOM elements
   */
  initializeElements() {
    this.container = document.getElementById('tagAutocompleteInput')?.parentElement.parentElement;
    this.inputElement = document.getElementById('tagAutocompleteInput');
    this.suggestionsContainer = document.getElementById('tagSuggestionsContainer');
    this.suggestionsList = document.getElementById('tagSuggestionsList');
    this.selectedContainer = document.getElementById('selectedTagsContainer');
    this.selectedList = document.getElementById('selectedTagsList');
    this.validationContainer = document.getElementById('validationMessagesContainer');
    this.selectedCountBadge = document.getElementById('selectedTagsCount');

    if (!this.inputElement) {
      console.error('❌ Tag autocomplete elements not found. Make sure to insert TAG_AUTOCOMPLETE_HTML.');
      return;
    }
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    if (!this.inputElement) return;

    // Input event with debounce
    this.inputElement.addEventListener('input', (e) => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.handleInput(e.target.value);
      }, this.config.debounceDelay);
    });

    // Focus event
    this.inputElement.addEventListener('focus', () => {
      if (this.inputElement.value.length >= this.config.minSearchLength) {
        this.showSuggestions();
      }
    });

    // Blur event
    this.inputElement.addEventListener('blur', () => {
      setTimeout(() => {
        this.hideSuggestions();
      }, 200);
    });

    // Keyboard navigation
    this.inputElement.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideSuggestions();
      } else if (e.key === 'Enter') {
        e.preventDefault();
      }
    });

    // Close suggestions on click outside
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        this.hideSuggestions();
      }
    });
  }

  /**
   * Handle input change
   */
  handleInput(value) {
    const query = value.trim();

    if (query.length < this.config.minSearchLength) {
      this.hideSuggestions();
      return;
    }

    this.updateSuggestions(query);
    this.showSuggestions();
  }

  /**
   * Update suggestions based on search query
   */
  updateSuggestions(query) {
    if (!window.tagSearchEngine) {
      console.error('❌ Tag search engine not available');
      return;
    }

    // Get search results
    const allTags = Object.values(TAG_CONFIG || {});
    const results = window.tagSearchEngine.fullTextSearch(query, allTags);

    // Filter out already selected tags
    const filtered = results.filter(
      result => !this.selectedTags.includes(result.tag)
        && !(window.isDisabledTagOption && window.isDisabledTagOption(result.tag))
    );

    // Limit results
    const limited = filtered.slice(0, this.config.suggestionLimit);

    // Render suggestions
    this.renderSuggestions(limited);
  }

  /**
   * Render suggestions
   */
  renderSuggestions(suggestions) {
    if (suggestions.length === 0) {
      this.suggestionsList.innerHTML = `
        <div class="tag-suggestions-empty">
          No tags found. Try different keywords.
        </div>
      `;
      return;
    }

    this.suggestionsList.innerHTML = suggestions
      .map(suggestion => {
        const config = getTagStyle?.(suggestion.tag) || {
          icon: '🏷️',
          bg: '#e0e7ff',
          color: '#312e81',
          border: '#c7d2fe'
        };

        const matchTypeLabel = {
          exact: '⭐ Exact',
          prefix: '🎯 Prefix',
          substring: '🔍 Match',
          description: '📝 Description',
          fuzzy: '✨ Fuzzy'
        }[suggestion.matchType] || 'Match';

        const scorePercent = Math.round(suggestion.score * 100);

        return `
          <div class="tag-suggestion-item" data-tag="${suggestion.tag}">
            <span class="tag-suggestion-icon">${config.icon}</span>
            <span class="tag-suggestion-name">${suggestion.tag}</span>
            <div class="tag-suggestion-meta">
              <span class="tag-suggestion-type">${matchTypeLabel}</span>
              <span class="tag-suggestion-score">${scorePercent}%</span>
            </div>
          </div>
        `;
      })
      .join('');

    // Add click handlers
    this.suggestionsList.querySelectorAll('.tag-suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const tag = item.dataset.tag;
        this.addTag(tag);
        this.inputElement.value = '';
        this.hideSuggestions();
        this.inputElement.focus();
      });
    });
  }

  /**
   * Add tag with validation
   */
  addTag(tag) {
    // Resolve alias
    const canonical = resolveTagAlias?.(tag) || tag;

    if (window.isDisabledTagOption && window.isDisabledTagOption(canonical)) {
      this.addValidationMessage(`"${canonical}" is no longer available as a tag option`, 'warning');
      return;
    }

    // Check if already selected
    if (this.selectedTags.includes(canonical)) {
      this.addValidationMessage(`"${canonical}" is already selected`, 'warning');
      return;
    }

    // Check max tags limit
    if (this.selectedTags.length >= this.config.maxTags) {
      this.addValidationMessage(
        `Maximum ${this.config.maxTags} tags allowed`,
        'error'
      );
      return;
    }

    // Check for conflicts
    if (this.config.showConflictWarnings && window.tagConflictDetector) {
      const testTags = [...this.selectedTags, canonical];
      const validation = window.tagConflictDetector.validate(testTags);

      if (!validation.valid) {
        const conflicts = validation.conflicts
          .map(c => `"${c.tag1}" ↔ "${c.tag2}"`)
          .join(', ');
        this.addValidationMessage(
          `Conflict detected: ${conflicts}`,
          'error'
        );
        return;
      }

      // Show warnings
      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => {
          this.addValidationMessage(
            `⚠️ "${warning.tag1}" and "${warning.tag2}" are usually separate`,
            'warning'
          );
        });
      }
    }

    // Add the tag
    this.selectedTags.push(canonical);
    this.renderSelectedTags();
    this.triggerSelectionChange();

    // Show success message
    this.addValidationMessage(`✅ Added "${canonical}"`, 'success', 2000);
  }

  /**
   * Remove tag
   */
  removeTag(tag) {
    this.selectedTags = this.selectedTags.filter(t => t !== tag);
    this.renderSelectedTags();
    this.triggerSelectionChange();

    // Flash success message
    this.addValidationMessage(`Removed "${tag}"`, 'success', 1500);
  }

  /**
   * Render selected tags
   */
  renderSelectedTags() {
    if (this.selectedTags.length === 0) {
      this.selectedList.innerHTML =
        '<span class="selected-tags-empty">No tags selected yet</span>';
      this.selectedCountBadge.textContent = '0';
      return;
    }

    this.selectedList.innerHTML = this.selectedTags
      .map(tag => {
        const config = getTagStyle?.(tag) || {
          icon: '🏷️',
          bg: '#e0e7ff',
          color: '#312e81',
          border: '#c7d2fe'
        };

        return `
          <span class="tag-badge" style="
            background-color: ${config.bg};
            color: ${config.color};
            border-color: ${config.border};
          ">
            <span>${config.icon}</span>
            <span>${tag}</span>
            <button 
              type="button"
              class="tag-badge-remove" 
              onclick="window.tagAutocompleteInstance.removeTag('${tag}')"
              title="Remove tag"
            >✕</button>
          </span>
        `;
      })
      .join('');

    this.selectedCountBadge.textContent = this.selectedTags.length;
  }

  /**
   * Add validation message
   */
  addValidationMessage(text, type = 'info', autoDismissMs = 4000) {
    const messageId = `msg-${Date.now()}`;

    const iconMap = {
      error: '❌',
      warning: '⚠️',
      success: '✅',
      info: 'ℹ️'
    };

    const message = document.createElement('div');
    message.id = messageId;
    message.className = `validation-message validation-${type}`;
    message.innerHTML = `
      <span class="validation-icon">${iconMap[type]}</span>
      <span class="validation-text">${text}</span>
      <button type="button" class="validation-close" onclick="document.getElementById('${messageId}').remove()">✕</button>
    `;

    this.validationContainer.appendChild(message);

    // Auto-dismiss
    if (autoDismissMs > 0) {
      setTimeout(() => {
        message.style.opacity = '0';
        message.style.transform = 'translateY(-10px)';
        message.style.transition = 'all 0.3s ease';
        setTimeout(() => message.remove(), 300);
      }, autoDismissMs);
    }
  }

  /**
   * Show suggestions container
   */
  showSuggestions() {
    this.suggestionsContainer.style.display = 'block';
  }

  /**
   * Hide suggestions container
   */
  hideSuggestions() {
    this.suggestionsContainer.style.display = 'none';
  }

  /**
   * Get selected tags
   */
  getSelectedTags() {
    return [...this.selectedTags];
  }

  /**
   * Set selected tags
   */
  setSelectedTags(tags) {
    this.selectedTags = Array.from(new Set((Array.isArray(tags) ? tags : [])
      .map((t) => resolveTagAlias?.(t) || t)
      .map((t) => String(t || '').trim())
      .filter(Boolean)
      .filter((t) => !(window.isDisabledTagOption && window.isDisabledTagOption(t)))));
    this.renderSelectedTags();
    this.triggerSelectionChange();
  }

  /**
   * Clear all tags
   */
  clearTags() {
    this.selectedTags = [];
    this.renderSelectedTags();
    this.triggerSelectionChange();
  }

  /**
   * Trigger selection change callback
   */
  triggerSelectionChange() {
    if (this.config.onSelectionChange) {
      this.config.onSelectionChange(this.getSelectedTags());
    }
  }
}

/**
 * Global function to close suggestions
 */
window.closeTagSuggestions = function() {
  if (window.tagAutocompleteInstance) {
    window.tagAutocompleteInstance.hideSuggestions();
  }
};

/**
 * Initialize the tag autocomplete input
 */
function initTagAutocomplete(config = {}) {
  // Check if tag system is loaded
  if (!window.tagSearchEngine || !window.tagConflictDetector) {
    console.error('❌ Tag system not loaded. Include consolidated-tag-system-v7-0-141.js first.');
    return null;
  }

  // Create instance
  const instance = new TagAutocompleteInput(config);

  // Store globally
  window.tagAutocompleteInstance = instance;

  console.log('✅ Tag autocomplete initialized');
  return instance;
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TagAutocompleteInput,
    initTagAutocomplete,
    TAG_AUTOCOMPLETE_HTML
  };
}

console.log('✨ Tag Autocomplete Input v1.0.0 loaded');

