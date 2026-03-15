/**
 * TAG CONFIGURATION & STYLING
 * ===========================
 * Central configuration for all tags in the Adventure Finder
 * Each tag includes: name, icon (emoji), background color, and text color
 * Optional: category and subcategory for hierarchy organization
 *
 * Version: v7.0.113+
 * Date: March 13, 2026
 */

const TAG_CONFIG = {
  // ========== ACTIVITY TAGS ==========
  'Hiking': {
    icon: '🥾',
    bg: '#dcfce7',
    color: '#166534',
    border: '#86efac',
    category: 'Activities',
    subcategory: 'Land Sports'
  },
  'Waterfall': {
    icon: '💧',
    bg: '#e0f2fe',
    color: '#0c4a6e',
    border: '#7dd3fc'
  },
  'Biking': {
    icon: '🚴',
    bg: '#fef3c7',
    color: '#78350f',
    border: '#fcd34d'
  },
  'Kayaking': {
    icon: '🛶',
    bg: '#cce5ff',
    color: '#0c2d57',
    border: '#93c5fd'
  },
  'Fishing': {
    icon: '🎣',
    bg: '#e0e7ff',
    color: '#312e81',
    border: '#c7d2fe'
  },
  'Camping': {
    icon: '⛺',
    bg: '#fecaca',
    color: '#7c2d12',
    border: '#fca5a5'
  },
  'Birding': {
    icon: '🦅',
    bg: '#f3e8ff',
    color: '#5b21b6',
    border: '#e9d5ff'
  },
  'Rock Climbing': {
    icon: '🧗',
    bg: '#fed7aa',
    color: '#7c2d12',
    border: '#fdba74'
  },
  'Skiing': {
    icon: '⛷️',
    bg: '#e0f2fe',
    color: '#0c4a6e',
    border: '#7dd3fc'
  },

  // ========== LOCATION TAGS ==========
  'Park': {
    icon: '🌳',
    bg: '#dcfce7',
    color: '#166534',
    border: '#86efac'
  },
  'Greenway': {
    icon: '🛤️',
    bg: '#dcfce7',
    color: '#166534',
    border: '#86efac'
  },
  'Parking Location': {
    icon: '🅿️',
    bg: '#f3e8ff',
    color: '#5b21b6',
    border: '#e9d5ff'
  },
  'Dog Walk Location': {
    icon: '🐕',
    bg: '#fecaca',
    color: '#7c2d12',
    border: '#fca5a5'
  },
  'Biking Location': {
    icon: '🚴‍♂️',
    bg: '#fef3c7',
    color: '#78350f',
    border: '#fcd34d'
  },
  'Birding Location': {
    icon: '🦜',
    bg: '#f3e8ff',
    color: '#5b21b6',
    border: '#e9d5ff'
  },

  // ========== FOOD & DINING TAGS ==========
  'Coffee Shop': {
    icon: '☕',
    bg: '#fed7aa',
    color: '#7c2d12',
    border: '#fdba74'
  },
  'Bakery': {
    icon: '🥐',
    bg: '#fed7aa',
    color: '#7c2d12',
    border: '#fdba74'
  },
  'Diner': {
    icon: '🍽️',
    bg: '#fecaca',
    color: '#7c2d12',
    border: '#fca5a5'
  },
  'Breakfast Joint': {
    icon: '🥞',
    bg: '#fed7aa',
    color: '#7c2d12',
    border: '#fdba74'
  },
  'BBQ': {
    icon: '🍖',
    bg: '#fecaca',
    color: '#7c2d12',
    border: '#fca5a5'
  },
  'Pub': {
    icon: '🍺',
    bg: '#cce5ff',
    color: '#0c2d57',
    border: '#93c5fd'
  },
  'Sandwiches': {
    icon: '🥪',
    bg: '#fecaca',
    color: '#7c2d12',
    border: '#fca5a5'
  },
  'Pho': {
    icon: '🍜',
    bg: '#dcfce7',
    color: '#166534',
    border: '#86efac'
  },
  'Sushi': {
    icon: '🍣',
    bg: '#cce5ff',
    color: '#0c2d57',
    border: '#93c5fd'
  },
  'Ramen': {
    icon: '🍜',
    bg: '#f3e8ff',
    color: '#5b21b6',
    border: '#e9d5ff'
  },
  'Indian Food': {
    icon: '🍛',
    bg: '#fef3c7',
    color: '#78350f',
    border: '#fcd34d'
  },
  'Thai Food': {
    icon: '🌶️',
    bg: '#fecaca',
    color: '#7c2d12',
    border: '#fca5a5'
  },
  'German Food': {
    icon: '🍖',
    bg: '#fed7aa',
    color: '#7c2d12',
    border: '#fdba74'
  },
  'Korean BBQ': {
    icon: '🔥',
    bg: '#fecaca',
    color: '#7c2d12',
    border: '#fca5a5'
  },
  'Korean Hot Pot': {
    icon: '🍲',
    bg: '#fecaca',
    color: '#7c2d12',
    border: '#fca5a5'
  },
  'Chinese Food': {
    icon: '🥡',
    bg: '#f3e8ff',
    color: '#5b21b6',
    border: '#e9d5ff'
  },
  'Seafood Joint': {
    icon: '🦞',
    bg: '#cce5ff',
    color: '#0c2d57',
    border: '#93c5fd'
  },
  'Comfort Food': {
    icon: '🥘',
    bg: '#fed7aa',
    color: '#7c2d12',
    border: '#fdba74'
  },
  'Fruit Veggie Stand': {
    icon: '🥕',
    bg: '#dcfce7',
    color: '#166534',
    border: '#86efac'
  },
  'Farmers Market': {
    icon: '🌽',
    bg: '#dcfce7',
    color: '#166534',
    border: '#86efac'
  },

  // ========== SHOPPING TAGS ==========
  'Shopping': {
    icon: '🛍️',
    bg: '#f3e8ff',
    color: '#5b21b6',
    border: '#e9d5ff'
  },
  'Clothing Store': {
    icon: '👕',
    bg: '#f3e8ff',
    color: '#5b21b6',
    border: '#e9d5ff'
  },
  'Outdoor Store': {
    icon: '⛺',
    bg: '#dcfce7',
    color: '#166534',
    border: '#86efac'
  },
  'Grocery Store': {
    icon: '🛒',
    bg: '#e0f2fe',
    color: '#0c4a6e',
    border: '#7dd3fc'
  },
  'Local Shop': {
    icon: '🏪',
    bg: '#f3e8ff',
    color: '#5b21b6',
    border: '#e9d5ff'
  },
  'Art Store': {
    icon: '🎨',
    bg: '#fecaca',
    color: '#7c2d12',
    border: '#fca5a5'
  },
  'Thrift Store': {
    icon: '♻️',
    bg: '#dcfce7',
    color: '#166534',
    border: '#86efac'
  },

  // ========== BEVERAGE TAGS ==========
  'NA Beer Sold Here': {
    icon: '🍺',
    bg: '#cce5ff',
    color: '#0c2d57',
    border: '#93c5fd'
  },

  // ========== DEAL/HUNTING TAGS ==========
  'Deal Hunting': {
    icon: '🎯',
    bg: '#fef3c7',
    color: '#78350f',
    border: '#fcd34d'
  },
  'Local Owned': {
    icon: '❤️',
    bg: '#fecaca',
    color: '#7c2d12',
    border: '#fca5a5'
  }
};

/**
 * Get tag styling information
 * @param {string} tagName - The tag name
 * @returns {object} Tag configuration with icon, colors, etc.
 */
function getTagStyle(tagName) {
  return TAG_CONFIG[tagName] || {
    icon: '🏷️',
    bg: '#e0e7ff',
    color: '#312e81',
    border: '#c7d2fe'
  };
}

/**
 * Generate HTML for a tag badge
 * @param {string} tagName - The tag name
 * @returns {string} HTML for the tag badge
 */
function renderTagBadge(tagName) {
  const config = getTagStyle(tagName);
  return `
    <span class="tag-badge" style="
      background-color: ${config.bg};
      color: ${config.color};
      border: 1px solid ${config.border};
      padding: 4px 10px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
    ">
      <span>${config.icon}</span>
      <span>${tagName}</span>
    </span>
  `;
}

/**
 * Get all available tags
 * @returns {array} Array of all tag names
 */
function getAllAvailableTags() {
  return Object.keys(TAG_CONFIG).sort();
}

/**
 * Export for use in modules
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TAG_CONFIG,
    getTagStyle,
    renderTagBadge,
    getAllAvailableTags
  };
}

