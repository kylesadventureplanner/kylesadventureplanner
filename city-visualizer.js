/**
 * CITY VISUALIZER - Group and Visualize Locations by City
 * Version: v7.0.116 (City Grouping Feature)
 * Date: March 12, 2026
 *
 * Features:
 * - View all locations grouped by city
 * - See location count per city
 * - Click to filter by city
 * - Sort cities by name or location count
 * - Visual city cards with statistics
 * - Export city data
 */

class CityVisualizer {
  constructor() {
    this.adventuresData = window.adventuresData || [];
    this.cityGroups = new Map();
    this.currentSortBy = 'count'; // 'count' or 'name'
    this.init();
  }

  /**
   * Initialize the city visualizer
   */
  init() {
    this.createStyles();
    this.createMarkup();
    this.attachEventListeners();
  }

  /**
   * Create CSS for city visualization components
   */
  createStyles() {
    if (document.getElementById('cityVisualizerStyles')) return;

    const style = document.createElement('style');
    style.id = 'cityVisualizerStyles';
    style.textContent = `
      /* ============================================================
         CITY VISUALIZER STYLES - MATCHES APP DESIGN SYSTEM
         ============================================================ */

      /* City Visualizer Modal */
      #cityVisualizerModal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-2xl);
        z-index: 1005;
        max-width: 1000px;
        width: 95%;
        max-height: 85vh;
        display: none;
        flex-direction: column;
        overflow: hidden;
        animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid var(--neutral-200);
      }

      #cityVisualizerModal.visible {
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

      /* Backdrop */
      #cityVisualizerBackdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.4);
        z-index: 1004;
        display: none;
        animation: fadeIn 0.2s ease-out;
      }

      #cityVisualizerBackdrop.visible {
        display: block;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      /* Header */
      .city-visualizer-header {
        padding: var(--space-xl);
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(14, 165, 233, 0.02) 100%);
        border-bottom: 1px solid var(--neutral-200);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .city-visualizer-title {
        font-size: 22px;
        font-weight: 700;
        color: var(--neutral-900);
        margin: 0;
        letter-spacing: -0.3px;
      }

      .city-visualizer-subtitle {
        font-size: 13px;
        color: var(--neutral-500);
        margin-top: 4px;
        font-weight: 500;
      }

      .city-visualizer-close {
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

      .city-visualizer-close:hover {
        background: var(--neutral-100);
        color: var(--neutral-700);
        transform: scale(1.1);
      }

      /* Controls */
      .city-visualizer-controls {
        padding: var(--space-lg) var(--space-xl);
        background: var(--neutral-50);
        border-bottom: 1px solid var(--neutral-200);
        display: flex;
        gap: var(--space-lg);
        align-items: center;
        flex-wrap: wrap;
      }

      .city-control-group {
        display: flex;
        gap: var(--space-md);
        align-items: center;
      }

      .city-control-label {
        font-size: 13px;
        font-weight: 600;
        color: var(--neutral-700);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .city-sort-buttons {
        display: flex;
        gap: var(--space-sm);
        background: white;
        padding: var(--space-sm);
        border-radius: var(--radius-md);
        border: 1px solid var(--neutral-200);
      }

      .city-sort-btn {
        padding: var(--space-sm) var(--space-md);
        border: none;
        background: transparent;
        color: var(--neutral-600);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        border-radius: var(--radius-sm);
        transition: all 0.2s;
      }

      .city-sort-btn.active {
        background: var(--primary);
        color: white;
      }

      .city-sort-btn:hover:not(.active) {
        background: var(--neutral-100);
      }

      .city-search {
        flex: 1;
        min-width: 200px;
        padding: var(--space-md) var(--space-lg);
        border: 1px solid var(--neutral-300);
        border-radius: var(--radius-md);
        font-size: 14px;
        font-family: var(--font-sans);
      }

      .city-search:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      /* Content Area */
      .city-visualizer-content {
        flex: 1;
        overflow-y: auto;
        padding: var(--space-xl);
      }

      /* City Grid */
      .city-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: var(--space-lg);
      }

      /* City Card */
      .city-card {
        background: white;
        border: 1px solid var(--neutral-200);
        border-radius: var(--radius-lg);
        padding: var(--space-xl);
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
      }

      .city-card:hover {
        border-color: var(--primary);
        box-shadow: var(--shadow-lg);
        transform: translateY(-4px);
      }

      .city-card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: var(--space-md);
      }

      .city-card-name {
        font-size: 18px;
        font-weight: 700;
        color: var(--neutral-900);
        margin: 0;
      }

      .city-card-state {
        font-size: 12px;
        color: var(--neutral-500);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .city-card-badge {
        background: var(--primary-light);
        color: var(--primary-dark);
        padding: 4px 12px;
        border-radius: var(--radius-full);
        font-size: 12px;
        font-weight: 700;
        min-width: 40px;
        text-align: center;
      }

      /* City Stats */
      .city-card-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-md);
      }

      .city-stat {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: var(--space-md);
        background: var(--neutral-50);
        border-radius: var(--radius-md);
        border: 1px solid var(--neutral-200);
      }

      .city-stat-value {
        font-size: 20px;
        font-weight: 700;
        color: var(--primary);
      }

      .city-stat-label {
        font-size: 11px;
        color: var(--neutral-600);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 600;
      }

      /* City Tags */
      .city-card-tags {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-sm);
        padding-top: var(--space-md);
        border-top: 1px solid var(--neutral-100);
      }

      .city-tag {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: linear-gradient(135deg, var(--primary-light) 0%, rgba(59, 130, 246, 0.05) 100%);
        color: var(--primary-dark);
        padding: 4px 10px;
        border-radius: var(--radius-full);
        font-size: 12px;
        font-weight: 600;
        border: 1px solid var(--primary);
      }

      /* Empty State */
      .city-visualizer-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--space-lg);
        padding: var(--space-3xl) var(--space-xl);
        color: var(--neutral-500);
      }

      .city-visualizer-empty-icon {
        font-size: 64px;
        opacity: 0.5;
      }

      .city-visualizer-empty-text {
        font-size: 18px;
        font-weight: 600;
        color: var(--neutral-700);
      }

      .city-visualizer-empty-subtext {
        font-size: 14px;
        color: var(--neutral-500);
        text-align: center;
        max-width: 300px;
      }

      /* Footer */
      .city-visualizer-footer {
        padding: var(--space-lg) var(--space-xl);
        background: var(--neutral-50);
        border-top: 1px solid var(--neutral-200);
        display: flex;
        gap: var(--space-md);
        justify-content: flex-end;
        flex-wrap: wrap;
      }

      .city-btn {
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
      }

      .city-btn:hover {
        background: var(--neutral-100);
        border-color: var(--neutral-400);
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }

      .city-btn.primary {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
      }

      .city-btn.primary:hover {
        background: var(--primary-dark);
        border-color: var(--primary-dark);
        box-shadow: var(--shadow-lg);
      }

      /* Responsive */
      @media (max-width: 768px) {
        #cityVisualizerModal {
          max-width: 98%;
          max-height: 90vh;
        }

        .city-visualizer-header,
        .city-visualizer-controls,
        .city-visualizer-footer {
          padding: var(--space-lg);
        }

        .city-visualizer-content {
          padding: var(--space-lg);
        }

        .city-grid {
          grid-template-columns: 1fr;
        }

        .city-control-group {
          flex-direction: column;
          width: 100%;
          align-items: flex-start;
        }

        .city-search {
          width: 100%;
        }

        .city-visualizer-footer {
          flex-direction: column;
        }

        .city-btn {
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Create HTML markup for city visualizer modal
   */
  createMarkup() {
    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'cityVisualizerBackdrop';
    document.body.appendChild(backdrop);

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'cityVisualizerModal';
    modal.innerHTML = `
      <div class="city-visualizer-header">
        <div>
          <h2 class="city-visualizer-title">🏙️ Location Viewer by City</h2>
          <div class="city-visualizer-subtitle">Group and visualize all your adventure locations by city</div>
        </div>
        <button class="city-visualizer-close" onclick="window.closeCityVisualizer()">✕</button>
      </div>

      <div class="city-visualizer-controls">
        <div class="city-control-group">
          <span class="city-control-label">Sort By:</span>
          <div class="city-sort-buttons">
            <button class="city-sort-btn active" data-sort="count">📊 Count</button>
            <button class="city-sort-btn" data-sort="name">A-Z Name</button>
          </div>
        </div>
        <input type="text" class="city-search" placeholder="Search cities..." id="citysearch">
      </div>

      <div class="city-visualizer-content" id="cityVisualizerContent">
        <!-- Cities will be rendered here -->
      </div>

      <div class="city-visualizer-footer">
        <button class="city-btn" onclick="window.closeCityVisualizer()">Close</button>
        <button class="city-btn primary" onclick="window.exportCityData()">📥 Export</button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const backdrop = document.getElementById('cityVisualizerBackdrop');
    const modal = document.getElementById('cityVisualizerModal');
    const searchInput = document.getElementById('citySearch');
    const sortButtons = document.querySelectorAll('.city-sort-btn');

    // Backdrop click closes
    if (backdrop) {
      backdrop.addEventListener('click', () => window.closeCityVisualizer());
    }

    // Sort buttons
    sortButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        sortButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentSortBy = e.target.dataset.sort;
        this.renderCities();
      });
    });

    // Search input
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.renderCities(e.target.value);
      });
    }
  }

  /**
   * Group locations by city
   */
  groupByCity() {
    this.cityGroups.clear();

    if (!window.adventuresData || !Array.isArray(window.adventuresData)) {
      return;
    }

    window.adventuresData.forEach(row => {
      const values = row.values && row.values[0];
      if (!values) return;

      const name = values[0] || 'Unknown';
      const city = values[10] || 'Unknown City';
      const state = values[9] || 'Unknown State';
      const cityKey = `${city}, ${state}`;

      if (!this.cityGroups.has(cityKey)) {
        this.cityGroups.set(cityKey, {
          city,
          state,
          locations: [],
          tags: new Set()
        });
      }

      const cityData = this.cityGroups.get(cityKey);
      cityData.locations.push({
        name,
        tags: (values[3] || '').split(',').map(t => t.trim()).filter(Boolean)
      });

      // Collect unique tags
      (values[3] || '').split(',').forEach(tag => {
        const trimmed = tag.trim();
        if (trimmed) cityData.tags.add(trimmed);
      });
    });
  }

  /**
   * Render city cards
   */
  renderCities(searchTerm = '') {
    this.groupByCity();

    const contentArea = document.getElementById('cityVisualizerContent');
    if (!contentArea) return;

    // Filter cities
    let cities = Array.from(this.cityGroups.entries());

    if (searchTerm) {
      cities = cities.filter(([cityKey]) =>
        cityKey.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort cities
    if (this.currentSortBy === 'name') {
      cities.sort((a, b) => a[0].localeCompare(b[0]));
    } else {
      cities.sort((a, b) => b[1].locations.length - a[1].locations.length);
    }

    if (cities.length === 0) {
      contentArea.innerHTML = `
        <div class="city-visualizer-empty">
          <div class="city-visualizer-empty-icon">🏙️</div>
          <div class="city-visualizer-empty-text">No cities found</div>
          <div class="city-visualizer-empty-subtext">
            ${searchTerm ? 'Try a different search term' : 'Load some adventure data to see cities'}
          </div>
        </div>
      `;
      return;
    }

    const citiesHTML = cities.map(([cityKey, cityData]) => {
      const locationCount = cityData.locations.length;
      const tagsArray = Array.from(cityData.tags).slice(0, 4);

      return `
        <div class="city-card" onclick="window.filterByCity('${cityKey}')">
          <div class="city-card-header">
            <div>
              <h3 class="city-card-name">${cityData.city}</h3>
              <div class="city-card-state">${cityData.state}</div>
            </div>
            <div class="city-card-badge">${locationCount}</div>
          </div>
          
          <div class="city-card-stats">
            <div class="city-stat">
              <div class="city-stat-value">${locationCount}</div>
              <div class="city-stat-label">Locations</div>
            </div>
            <div class="city-stat">
              <div class="city-stat-value">${cityData.tags.size}</div>
              <div class="city-stat-label">Tags</div>
            </div>
          </div>

          ${tagsArray.length > 0 ? `
            <div class="city-card-tags">
              ${tagsArray.map(tag => `<span class="city-tag">${tag}</span>`).join('')}
              ${cityData.tags.size > 4 ? `<span class="city-tag">+${cityData.tags.size - 4} more</span>` : ''}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    contentArea.innerHTML = `<div class="city-grid">${citiesHTML}</div>`;
  }
}

// ============================================================
// WINDOW FUNCTIONS FOR CITY VISUALIZER
// ============================================================

/**
 * Open the city visualizer modal
 */
window.openCityVisualizer = function() {
  if (!window.cityVisualizer) {
    window.cityVisualizer = new CityVisualizer();
  }

  const modal = document.getElementById('cityVisualizerModal');
  const backdrop = document.getElementById('cityVisualizerBackdrop');

  if (modal) modal.classList.add('visible');
  if (backdrop) backdrop.classList.add('visible');

  window.cityVisualizer.renderCities();
  console.log('✅ City Visualizer opened');
};

/**
 * Close the city visualizer modal
 */
window.closeCityVisualizer = function() {
  const modal = document.getElementById('cityVisualizerModal');
  const backdrop = document.getElementById('cityVisualizerBackdrop');

  if (modal) modal.classList.remove('visible');
  if (backdrop) backdrop.classList.remove('visible');

  console.log('✅ City Visualizer closed');
};

/**
 * Filter adventures by city
 */
window.filterByCity = function(cityKey) {
  console.log(`🔍 Filtering by city: ${cityKey}`);

  // Close the visualizer
  window.closeCityVisualizer();

  // Apply city filter if filter system exists
  if (typeof applyFilters === 'function') {
    const [city, state] = cityKey.split(', ');

    // Set filter values
    const citySelect = document.getElementById('city');
    const stateSelect = document.getElementById('state');

    if (citySelect) citySelect.value = city;
    if (stateSelect) stateSelect.value = state;

    // Apply filters
    applyFilters();

    console.log(`✅ Filtered by city: ${cityKey}`);
  }
};

/**
 * Export city data
 */
window.exportCityData = function() {
  if (!window.cityVisualizer) return;

  const csvData = [];
  csvData.push(['City', 'State', 'Locations', 'Top Tags']);

  window.cityVisualizer.cityGroups.forEach((cityData, cityKey) => {
    const topTags = Array.from(cityData.tags).slice(0, 5).join('; ');
    csvData.push([
      cityData.city,
      cityData.state,
      cityData.locations.length,
      topTags
    ]);
  });

  // Convert to CSV
  const csv = csvData.map(row =>
    row.map(cell => `"${cell}"`).join(',')
  ).join('\n');

  // Download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `city-data-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);

  console.log('✅ City data exported');
};

// ============================================================
// INITIALIZE ON LOAD
// ============================================================

if (typeof window !== 'undefined') {
  window.CityVisualizer = CityVisualizer;
  console.log('✅ City Visualizer module loaded');
}


