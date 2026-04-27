/**
 * CATEGORY PROGRESS PREVIEW SYSTEM
 * Shows which locations would count toward category progression if visited
 * Integrated into location cards to make it obvious which visits help meet goals
 *
 * Features:
 * - Badge on location cards showing matching categories
 * - Color-coded by progress (not started / in progress / complete)
 * - Hover tooltip showing contribution details
 * - Filter by "Would help me complete" criteria
 * - Visual progress indicators on badges
 */

window.CategoryProgressPreview = (function () {
  'use strict';

  console.log('🎯 Category Progress Preview System loading...');

  // Storage keys
  const STORAGE_KEY = 'categoryProgressData';

  // Reference to achievement system
  const AchievementData = window.AdventureAchievements ? window.AdventureAchievements.CONFIGS : {};

  /**
   * Get category goals for a subtab
   */
  function getCategoryGoals(subtab) {
    const config = AchievementData[subtab];
    if (!config || !config.categories) return [];

    return config.categories.map(cat => ({
      key: cat.key,
      label: cat.label,
      icon: cat.icon,
      goal: getCategoryGoalCount(subtab, cat.key)
    }));
  }

  /**
   * Determine the goal count for a category from challenges
   */
  function getCategoryGoalCount(subtab, categoryKey) {
    const config = AchievementData[subtab];
    if (!config || !config.challenges) return 5; // default

    // Find matching challenge for this category
    const challenge = config.challenges.find(ch => ch.cat === categoryKey);
    return challenge ? challenge.goal : 5;
  }

  /**
   * Get current progress for a category
   */
  function getCategoryProgress(subtab, categoryKey) {
    const stored = localStorage.getItem(STORAGE_KEY);
    const data = stored ? JSON.parse(stored) : {};
    const key = `${subtab}_${categoryKey}`;
    return data[key] || { visited: 0, goal: getCategoryGoalCount(subtab, categoryKey) };
  }

  /**
   *Determine which categories a location belongs to based on name/tags
   */
  function getLocationCategories(location, subtab) {
    const name = (location.name || '').toLowerCase();
    const tags = (location.tags || '').toLowerCase();
    const description = (location.description || '').toLowerCase();
    const searchText = `${name} ${tags} ${description}`;

    const config = AchievementData[subtab];
    if (!config || !config.categories) return [];

    const matchingCategories = [];

    config.categories.forEach(cat => {
      // Define keywords for each category
      const keywords = getCategoryKeywords(subtab, cat.key);

      // Check if any keyword matches
      if (keywords.some(kw => searchText.includes(kw))) {
        matchingCategories.push({
          key: cat.key,
          label: cat.label,
          icon: cat.icon
        });
      }
    });

    return matchingCategories;
  }

  /**
   * Get search keywords for category detection
   */
  function getCategoryKeywords(subtab, categoryKey) {
    const keywordMap = {
      'wildlife-animals': {
        'farm': ['farm', 'farming', 'ranch'],
        'petting': ['petting zoo', 'petting farm', 'interactive animal'],
        'wildlife': ['wildlife rehab', 'rehabilitation', 'wildlife center', 'sanctuary', 'rescue', 'rehab'],
        'rescue': ['animal rescue', 'rescue center', 'animal shelter'],
        'cat-cafe': ['cat cafe', 'cat restaurant'],
        'aquarium': ['aquarium', 'marine', 'fish tank'],
        'zoo': ['zoo', 'zoological'],
        'safari': ['safari', 'drive-through', 'drive thru'],
        'sanctuary': ['sanctuary', 'animal sanctuary', 'wildlife sanctuary']
      },
      'outdoors': {
        'trailhead': ['trail', 'hiking', 'trailhead', 'footpath', 'pathway'],
        'waterfall': ['waterfall', 'waterfall', 'cascade', 'falls'],
        'scenic': ['scenic', 'overlook', 'viewpoint', 'vista'],
        'campground': ['campground', 'camping', 'camp site', 'campsite'],
        'state-park': ['state park', 'state recreation'],
        'national-park': ['national park', 'national forest'],
        'beach': ['beach', 'shore', 'seashore', 'coast'],
        'lake': ['lake', 'pond', 'water'],
        'rec-area': ['recreation area', 'recreation', 'day-use'],
        'gardens': ['garden', 'botanical', 'arboretum']
      },
      'entertainment': {
        'movie-theater': ['theater', 'cinema', 'movie'],
        'escape-room': ['escape room', 'escape game'],
        'bowling': ['bowling', 'bowl'],
        'museum': ['museum', 'exhibit'],
        'art-gallery': ['gallery', 'art gallery'],
        'amusement-park': ['amusement', 'theme park', 'park'],
        'arcade': ['arcade', 'game room'],
        'theater-live': ['theater', 'performance', 'concert', 'show'],
        'rock-climb': ['rock climb', 'climbing', 'ropes course'],
        'water-park': ['water park', 'splash pad'],
        'ice-skate': ['ice skate', 'roller skate', 'skating rink'],
        'historical': ['historical', 'historic', 'site']
      },
      'food-drink': {
        'coffee': ['coffee', 'cafe', 'espresso', 'tea shop'],
        'pub': ['pub', 'bar', 'tavern', 'brewery'],
        'bakery': ['bakery', 'bakehouse'],
        'pizza': ['pizza', 'pizzeria'],
        'sushi': ['sushi', 'ramen', 'japanese'],
        'asian': ['asian', 'chinese', 'thai', 'vietnamese'],
        'bbq': ['barbecue', 'bbq', 'smokehouse'],
        'mexican': ['mexican', 'taco', 'latin'],
        'breakfast': ['breakfast', 'diner', 'pancake'],
        'ice-cream': ['ice cream', 'gelato', 'frozen yogurt'],
        'seafood': ['seafood', 'steak', 'fish'],
        'european': ['european', 'french', 'italian', 'german']
      },
      'retail': {
        'thrift': ['thrift', 'consignment', 'secondhand'],
        'bargain': ['bargain', 'discount', 'outlet'],
        'grocery': ['grocery', 'market', 'supermarket', 'trader'],
        'specialty': ['specialty market', 'international', 'asian market', 'mexican market'],
        'home': ['home', 'hardware', 'improvement', 'lowe', 'home depot'],
        'antiques': ['antique', 'antiques', 'vintage'],
        'art': ['art', 'pottery', 'craft'],
        'crafts': ['craft', 'crafts'],
        'pet': ['pet store', 'pets'],
        'mall': ['mall', 'shopping'],
        'flea': ['flea market', 'flea'],
        'bike-shop': ['bike', 'bicycle']
      }
    };

    const categoryMap = keywordMap[subtab];
    return categoryMap && categoryMap[categoryKey] ? categoryMap[categoryKey] : [];
  }

  /**
   * Create progress badge HTML
   */
  function createCategoryProgressBadge(location, subtab) {
    const categories = getLocationCategories(location, subtab);
    if (categories.length === 0) return '';

    const badgeHTML = categories.map(cat => {
      const progress = getCategoryProgress(subtab, cat.key);
      const percentage = Math.min(100, Math.floor((progress.visited / progress.goal) * 100));
      const isComplete = progress.visited >= progress.goal;
      const status = isComplete ? 'complete' : percentage >= 50 ? 'partial' : 'started';

      const colors = {
        started: { bg: '#f3f4f6', text: '#6b7280', bar: '#d1d5db' },
        partial: { bg: '#fef3c7', text: '#92400e', bar: '#fcd34d' },
        complete: { bg: '#dcfce7', text: '#166534', bar: '#86efac' }
      };

      const colorScheme = colors[status];

      return `
        <div 
          class="category-progress-badge" 
          data-category="${cat.key}"
          data-subtab="${subtab}"
          title="Would count toward: ${cat.label} (${progress.visited}/${progress.goal})"
          style="
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            background: ${colorScheme.bg};
            border: 1px solid ${colorScheme.bar};
            border-radius: 16px;
            font-size: 12px;
            font-weight: 600;
            color: ${colorScheme.text};
            margin: 2px;
            cursor: help;
          "
        >
          <span>${cat.icon}</span>
          <span>${cat.label}</span>
          <span style="font-weight: 700;">${progress.visited}/${progress.goal}</span>
          ${percentage > 0 ? `
            <div style="
              width: 40px;
              height: 4px;
              background: rgba(0,0,0,0.1);
              border-radius: 2px;
              overflow: hidden;
            ">
              <div style="
                width: ${percentage}%;
                height: 100%;
                background: ${colorScheme.bar};
                transition: width 0.3s ease;
              "></div>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    return `
      <div class="category-badges-container" style="margin-top: 8px;">
        ${badgeHTML}
      </div>
    `;
  }

  /**
   * Update progress when location is marked as visited
   */
  function recordVisitedLocation(location, subtab) {
    const categories = getLocationCategories(location, subtab);
    const stored = localStorage.getItem(STORAGE_KEY) || '{}';
    const data = JSON.parse(stored);

    categories.forEach(cat => {
      const key = `${subtab}_${cat.key}`;
      if (!data[key]) {
        data[key] = { visited: 0, goal: getCategoryGoalCount(subtab, cat.key), lastUpdated: new Date().toISOString() };
      }
      data[key].visited++;
      data[key].lastUpdated = new Date().toISOString();
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    // Trigger update event for UI refresh
    window.dispatchEvent(new CustomEvent('categoryProgressUpdated', {
      detail: { subtab, categories }
    }));
  }

  /**
   * Get summary of locations that would help complete a category
   */
  function getLocationsForCategory(subtab, categoryKey, locationList = []) {
    if (!locationList || locationList.length === 0) return [];

    return locationList.filter(loc => {
      const categories = getLocationCategories(loc, subtab);
      return categories.some(cat => cat.key === categoryKey);
    });
  }

  /**
   * Create category progress overlay for location cards
   */
  function addProgressIndicatorToCard(cardElement, location, subtab) {
    if (!cardElement) return;

    const categories = getLocationCategories(location, subtab);
    if (categories.length === 0) return;

    // Find or create badges container
    let badgesContainer = cardElement.querySelector('.category-badges-container');
    if (!badgesContainer) {
      badgesContainer = document.createElement('div');
      badgesContainer.className = 'category-badges-container';

      // Insert after the description or name
      const descElement = cardElement.querySelector('[class*="description"]') ||
                         cardElement.querySelector('[class*="name"]');
      if (descElement) {
        descElement.parentNode.insertBefore(badgesContainer, descElement.nextSibling);
      } else {
        cardElement.appendChild(badgesContainer);
      }
    }

    // Update badges HTML
    badgesContainer.innerHTML = createCategoryProgressBadge(location, subtab);
  }

  /**
   * Create filter button for "Show locations that help me complete categories"
   */
  function createProgressFilterButton(subtab) {
    return `
      <button 
        class="category-progress-filter-btn"
        data-subtab="${subtab}"
        title="Show locations that would help complete your category goals"
        style="
          padding: 8px 16px;
          background: linear-gradient(135deg, #dcfce7 0%, #c6f6d5 100%);
          border: 1px solid #86efac;
          border-radius: 20px;
          color: #166534;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        "
      >
        🎯 Would Help Me Complete
      </button>
    `;
  }

  /**
   * Filter locations by category progress helpfulness
   */
  function filterByProgressHelp(locations, subtab) {
    return locations.filter(location => {
      const categories = getLocationCategories(location, subtab);
      if (categories.length === 0) return false;

      // Include if ANY category isn't complete yet
      return categories.some(cat => {
        const progress = getCategoryProgress(subtab, cat.key);
        return progress.visited < progress.goal;
      });
    });
  }

  /**
   * Get category completion dashboard
   */
  function getCategoryCompletionDashboard(subtab) {
    const categories = getCategoryGoals(subtab);
    const dashboard = categories.map(cat => {
      const progress = getCategoryProgress(subtab, cat.key);
      const percentage = Math.min(100, Math.floor((progress.visited / progress.goal) * 100));
      const isComplete = progress.visited >= progress.goal;

      return {
        ...cat,
        progress: progress.visited,
        percentage,
        isComplete,
        remaining: Math.max(0, progress.goal - progress.visited)
      };
    });

    return {
      subtab,
      categories: dashboard,
      totalComplete: dashboard.filter(c => c.isComplete).length,
      totalCategories: dashboard.length,
      overallPercentage: Math.round(dashboard.reduce((sum, c) => sum + c.percentage, 0) / dashboard.length)
    };
  }

  /**
   * Render category completion status visualization
   */
  function renderCompletionStatus(subtab, containerId) {
    const dashboard = getCategoryCompletionDashboard(subtab);
    const container = document.getElementById(containerId);
    if (!container) return;

    const statusHTML = `
      <div class="category-completion-dashboard" style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 12px;
        margin-bottom: 20px;
      ">
        ${dashboard.categories.map(cat => `
          <div class="category-completion-card" style="
            padding: 12px;
            border-radius: 8px;
            background: ${cat.isComplete ? '#dcfce7' : cat.percentage >= 50 ? '#fef3c7' : '#f3f4f6'};
            border: 2px solid ${cat.isComplete ? '#86efac' : cat.percentage >= 50 ? '#fcd34d' : '#d1d5db'};
            text-align: center;
          ">
            <div style="font-size: 24px; margin-bottom: 4px;">${cat.icon}</div>
            <div style="font-size: 12px; font-weight: 600; color: ${cat.isComplete ? '#166534' : cat.percentage >= 50 ? '#92400e' : '#6b7280'}">
              ${cat.label}
            </div>
            <div style="font-size: 14px; font-weight: 700; color: #1f2937; margin: 6px 0;">
              ${cat.progress}/${cat.goal}
            </div>
            <div style="
              width: 100%;
              height: 6px;
              background: rgba(0,0,0,0.1);
              border-radius: 3px;
              overflow: hidden;
            ">
              <div style="
                width: ${cat.percentage}%;
                height: 100%;
                background: ${cat.isComplete ? '#22c55e' : cat.percentage >= 50 ? '#f59e0b' : '#d1d5db'};
                transition: width 0.3s ease;
              "></div>
            </div>
            ${cat.isComplete ? `
              <div style="font-size: 11px; margin-top: 6px; color: #166534; font-weight: 700;">✅ Complete</div>
            ` : `
              <div style="font-size: 11px; margin-top: 6px; color: #6b7280;">Need: ${cat.remaining} more</div>
            `}
          </div>
        `).join('')}
      </div>
    `;

    container.innerHTML = statusHTML;
  }

  // Listen for location visits being recorded
  window.addEventListener('locationVisitRecorded', (event) => {
    if (event.detail && event.detail.location && event.detail.subtab) {
      recordVisitedLocation(event.detail.location, event.detail.subtab);
    }
  });

  // Export public API
  return {
    createBadge: createCategoryProgressBadge,
    getCategories: getLocationCategories,
    recordVisit: recordVisitedLocation,
    addIndicator: addProgressIndicatorToCard,
    getLocationsForCategory,
    filterByProgressHelp,
    getCategoryGoals,
    getCategoryProgress,
    getDashboard: getCategoryCompletionDashboard,
    renderDashboard: renderCompletionStatus,
    createFilterButton,
    getKeywords: getCategoryKeywords,
    STORAGE_KEY
  };
})();

console.log('✅ Category Progress Preview System ready. Use window.CategoryProgressPreview');

