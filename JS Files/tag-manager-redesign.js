/**
 * TAG MANAGER UI - REDESIGNED
 * ===========================
 * Complete redesign of tag manager modal to match app design standards
 * Features:
 * - Clean, polished modal without weird backgrounds
 * - Auto-complete tag suggestions
 * - Better recommendations display
 * - Improved UX
 *
 * Version: v7.0.117
 * Date: March 13, 2026
 */

// Override tag manager styles with new design
window.fixTagManagerDesign = function() {
  // Remove or hide old styles
  const oldStyle = document.getElementById('tagManagerStyles');
  if (oldStyle) {
    oldStyle.style.display = 'none';
  }

  // Create new, clean styles
  if (document.getElementById('tagManagerStylesNew')) return;

  const style = document.createElement('style');
  style.id = 'tagManagerStylesNew';
  style.textContent = `
    /* NEW TAG MANAGER DESIGN */

    /* Fix the backdrop - remove weird background */
    #tagManagerBackdrop {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background: rgba(0, 0, 0, 0.5) !important;
      z-index: 9999 !important;
      display: none !important;
      animation: fadeIn 0.2s ease-out !important;
      pointer-events: auto !important;
    }

    #tagManagerBackdrop.visible {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    /* Modal - completely clean and polished */
    #tagManagerModal {
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      background: white !important;
      border-radius: 16px !important;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
      z-index: 10000 !important;
      max-width: 650px !important;
      width: 90% !important;
      max-height: 80vh !important;
      overflow: hidden !important;
      display: none !important;
      flex-direction: column !important;
      animation: slideUp 0.3s ease-out !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      box-sizing: border-box !important;
      pointer-events: none !important;
    }

    #tagManagerModal.visible {
      display: flex !important;
      pointer-events: auto !important;
    }

    /* Remove all weird circular backgrounds */
    #tagManagerModal::before,
    #tagManagerModal::after {
      display: none !important;
    }

    #tagManagerBackdrop::before,
    #tagManagerBackdrop::after {
      display: none !important;
    }

    /* Header */
    .tag-manager-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      color: white !important;
      padding: 20px 24px !important;
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      border-radius: 16px 16px 0 0 !important;
      border-bottom: none !important;
    }

    .tag-manager-title {
      font-size: 18px !important;
      font-weight: 700 !important;
      margin: 0 !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
    }

    .tag-manager-close {
      background: none !important;
      border: none !important;
      color: white !important;
      font-size: 28px !important;
      cursor: pointer !important;
      padding: 0 !important;
      width: 36px !important;
      height: 36px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      border-radius: 8px !important;
      transition: background 0.2s !important;
    }

    .tag-manager-close:hover {
      background: rgba(255, 255, 255, 0.2) !important;
    }

    /* Body content */
    .tag-manager-body {
      padding: 24px !important;
      overflow-y: auto !important;
      flex: 1 !important;
    }

    /* Tabs */
    .tag-manager-tabs {
      display: flex !important;
      gap: 8px !important;
      border-bottom: 2px solid #e5e7eb !important;
      margin-bottom: 20px !important;
      padding-bottom: 0 !important;
    }

    .tag-manager-tab {
      background: none !important;
      border: none !important;
      padding: 12px 16px !important;
      font-weight: 600 !important;
      font-size: 14px !important;
      color: #6b7280 !important;
      cursor: pointer !important;
      border-bottom: 3px solid transparent !important;
      transition: all 0.2s !important;
      margin-bottom: -2px !important;
    }

    .tag-manager-tab.active {
      color: #667eea !important;
      border-bottom-color: #667eea !important;
    }

    .tag-manager-tab:hover {
      color: #667eea !important;
    }

    /* Sections */
    .tag-manager-section {
      margin-bottom: 20px !important;
    }

    .tag-manager-section-title {
      font-size: 13px !important;
      font-weight: 700 !important;
      color: #1f2937 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.5px !important;
      margin-bottom: 12px !important;
    }

    /* Input field with autocomplete */
    .tag-input-container {
      position: relative !important;
      margin-bottom: 16px !important;
    }

    .tag-input-field {
      width: 100% !important;
      padding: 12px 16px !important;
      border: 2px solid #e5e7eb !important;
      border-radius: 8px !important;
      font-size: 14px !important;
      font-family: inherit !important;
      transition: all 0.2s !important;
    }

    .tag-input-field:focus {
      outline: none !important;
      border-color: #667eea !important;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
    }

    /* Autocomplete dropdown */
    .tag-autocomplete-list {
      position: absolute !important;
      top: 100% !important;
      left: 0 !important;
      right: 0 !important;
      background: white !important;
      border: 2px solid #e5e7eb !important;
      border-top: none !important;
      border-radius: 0 0 8px 8px !important;
      max-height: 200px !important;
      overflow-y: auto !important;
      z-index: 1001 !important;
      display: none !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
    }

    .tag-autocomplete-list.visible {
      display: block !important;
    }

    .tag-autocomplete-item {
      padding: 10px 16px !important;
      cursor: pointer !important;
      transition: background 0.2s !important;
      font-size: 14px !important;
      color: #1f2937 !important;
    }

    .tag-autocomplete-item:hover {
      background: #f3f4f6 !important;
      color: #667eea !important;
    }

    .tag-autocomplete-item.selected {
      background: #dbeafe !important;
      color: #667eea !important;
      font-weight: 600 !important;
    }

    /* Current tags display */
    .tag-display-container {
      background: #f9fafb !important;
      border: 1px solid #e5e7eb !important;
      border-radius: 12px !important;
      padding: 16px !important;
      margin-bottom: 16px !important;
      min-height: 60px !important;
    }

    .tag-list {
      display: flex !important;
      flex-wrap: wrap !important;
      gap: 8px !important;
      align-items: center !important;
    }

    .tag-item {
      display: inline-flex !important;
      align-items: center !important;
      gap: 8px !important;
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%) !important;
      color: #1e40af !important;
      padding: 6px 12px !important;
      border-radius: 20px !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      animation: tagPop 0.2s ease-out !important;
    }

    .tag-remove-btn {
      background: none !important;
      border: none !important;
      color: #1e40af !important;
      cursor: pointer !important;
      font-size: 16px !important;
      padding: 0 !important;
      width: 18px !important;
      height: 18px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: all 0.2s !important;
    }

    .tag-remove-btn:hover {
      background: rgba(30, 64, 175, 0.1) !important;
      border-radius: 50% !important;
    }

    .tag-item.recommended {
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%) !important;
      color: #065f46 !important;
      border: 1px solid #10b981 !important;
    }

    .tag-item.recommended .tag-remove-btn {
      color: #065f46 !important;
    }

    .tag-item.recommended .tag-remove-btn:hover {
      background: rgba(6, 95, 70, 0.1) !important;
    }

    /* Recommendations section */
    .tag-recommendations {
      background: #f0fdf4 !important;
      border: 2px solid #dcfce7 !important;
      border-radius: 12px !important;
      padding: 16px !important;
      margin-bottom: 16px !important;
    }

    .tag-recommendations-title {
      font-size: 13px !important;
      font-weight: 700 !important;
      color: #065f46 !important;
      margin-bottom: 12px !important;
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
    }

    .tag-recommendations-list {
      display: flex !important;
      flex-wrap: wrap !important;
      gap: 8px !important;
    }

    .tag-suggestion {
      background: white !important;
      border: 2px solid #86efac !important;
      color: #15803d !important;
      padding: 6px 12px !important;
      border-radius: 16px !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.2s !important;
    }

    .tag-suggestion:hover {
      background: #dcfce7 !important;
      transform: translateY(-2px) !important;
    }

    /* Buttons */
    .tag-manager-buttons {
      display: flex !important;
      gap: 12px !important;
      padding: 16px 24px !important;
      border-top: 2px solid #e5e7eb !important;
      background: white !important;
    }

    .tag-manager-btn {
      flex: 1 !important;
      padding: 12px 16px !important;
      border-radius: 8px !important;
      border: none !important;
      font-weight: 600 !important;
      font-size: 14px !important;
      cursor: pointer !important;
      transition: all 0.2s !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 8px !important;
    }

    .tag-manager-btn.secondary {
      background: white !important;
      color: #1f2937 !important;
      border: 2px solid #e5e7eb !important;
    }

    .tag-manager-btn.secondary:hover {
      background: #f9fafb !important;
      border-color: #d1d5db !important;
    }

    .tag-manager-btn.primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      color: white !important;
      border: none !important;
    }

    .tag-manager-btn.primary:hover {
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4) !important;
      transform: translateY(-2px) !important;
    }

    .tag-manager-btn:disabled {
      opacity: 0.6 !important;
      cursor: not-allowed !important;
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

    /* Empty state */
    .tag-empty-state {
      text-align: center !important;
      padding: 32px 16px !important;
      color: #9ca3af !important;
    }

    .tag-empty-state-icon {
      font-size: 48px !important;
      margin-bottom: 12px !important;
    }

    .tag-empty-state-text {
      font-size: 14px !important;
      font-weight: 500 !important;
    }
  `;

  document.head.appendChild(style);

  // Initialize autocomplete functionality
  initializeTagAutocomplete();
};

/**
 * Initialize tag autocomplete functionality
 */
function initializeTagAutocomplete() {
  // Get all available tags from the page
  const tagInput = document.querySelector('.tag-input-field');
  if (!tagInput) return;

  const autocompleteList = document.querySelector('.tag-autocomplete-list');
  if (!autocompleteList) return;

  // Sample available tags - will be populated from tag-manager
  const availableTags = [
    'Restaurant', 'Coffee Shop', 'Park', 'Hiking', 'Nature',
    'Waterfall', 'Mountain', 'Beach', 'Museum', 'Historical',
    'Outdoor', 'Indoor', 'Family-Friendly', 'Adventure', 'Scenic',
    'Photography', 'Wildlife', 'Water-Based', 'Relaxing', 'Sports',
    'Challenging', 'Free', 'Paid', 'Hotel', 'Lodging',
    'Food', 'Dining', 'Social', 'Must-Visit', 'Local-Favorite'
  ];

  tagInput.addEventListener('input', function(e) {
    const value = e.target.value.toLowerCase().trim();

    if (value.length === 0) {
      autocompleteList.classList.remove('visible');
      return;
    }

    // Filter matching tags
    const filtered = availableTags.filter(tag =>
      tag.toLowerCase().includes(value) &&
      !isTagAlreadyAdded(tag)
    );

    if (filtered.length === 0) {
      autocompleteList.classList.remove('visible');
      return;
    }

    // Display suggestions
    autocompleteList.innerHTML = filtered
      .slice(0, 8)
      .map(tag => `
        <div class="tag-autocomplete-item" onclick="addTagFromSuggestion('${tag}')">
          ${tag}
        </div>
      `)
      .join('');

    autocompleteList.classList.add('visible');
  });

  // Hide autocomplete when clicking elsewhere
  document.addEventListener('click', function(e) {
    if (e.target !== tagInput) {
      autocompleteList.classList.remove('visible');
    }
  });
}

/**
 * Check if tag already added
 */
function isTagAlreadyAdded(tag) {
  const tagItems = document.querySelectorAll('.tag-item');
  return Array.from(tagItems).some(item =>
    item.textContent.includes(tag)
  );
}

/**
 * Add tag from suggestion
 */
function addTagFromSuggestion(tag) {
  const input = document.querySelector('.tag-input-field');
  if (input) {
    input.value = '';
    input.focus();
  }

  // Trigger add tag function
  if (window.tagManager && window.tagManager.addTag) {
    window.tagManager.addTag(tag);
  }
}

// Apply fix when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    // Apply styles
    fixTagManagerDesign();

    // Make absolutely sure backdrop and modal are hidden
    setTimeout(() => {
      const backdrop = document.getElementById('tagManagerBackdrop');
      const modal = document.getElementById('tagManagerModal');

      if (backdrop) {
        backdrop.classList.remove('visible');
        backdrop.style.display = 'none !important';
        backdrop.style.pointerEvents = 'none !important';
      }

      if (modal) {
        modal.classList.remove('visible');
        modal.style.display = 'none !important';
      }
    }, 200);
  });
} else {
  fixTagManagerDesign();

  // Make absolutely sure backdrop and modal are hidden
  setTimeout(() => {
    const backdrop = document.getElementById('tagManagerBackdrop');
    const modal = document.getElementById('tagManagerModal');

    if (backdrop) {
      backdrop.classList.remove('visible');
      backdrop.style.display = 'none !important';
      backdrop.style.pointerEvents = 'none !important';
    }

    if (modal) {
      modal.classList.remove('visible');
      modal.style.display = 'none !important';
    }
  }, 200);
}

// Also apply when tag manager is opened
const observer = new MutationObserver(function() {
  const backdrop = document.getElementById('tagManagerBackdrop');
  if (backdrop && backdrop.classList.contains('visible')) {
    fixTagManagerDesign();
    initializeTagAutocomplete();
  }
});

if (document.body) {
  observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class'] });
}

