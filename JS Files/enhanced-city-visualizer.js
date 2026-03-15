/**
 * ENHANCED CITY VISUALIZER - Advanced City Management
 * ===================================================
 * Features:
 * - View cities sorted by distance from reference location
 * - Filter cities by tags or keywords
 * - Click city to view locations within that city
 * - Interactive location browser within city view
 * - Search and filter locations within city
 * - Back navigation to city list
 *
 * Version: v2.0 (Enhanced)
 * Date: March 14, 2026
 */

class EnhancedCityVisualizer {
  constructor() {
    this.adventuresData = window.adventuresData || [];
    this.cityGroups = new Map();
    this.currentView = 'cityList'; // 'cityList' or 'cityDetail'
    this.selectedCity = null;
    this.referenceLocation = {
      name: 'Your Location',
      lat: 35.3395,  // Hendersonville, NC - 100 Co Rd 2008
      lng: -82.4637
    };
    this.currentFilters = {
      tags: [],
      keywords: ''
    };
    this.availableTags = new Set(); // Track all available tags
    this.init();
  }

  /**
   * Initialize the enhanced city visualizer
   */
  init() {
    this.createStyles();
    this.createMarkup();
    this.attachEventListeners();

    // Check if data is available
    if (this.adventuresData && this.adventuresData.length > 0) {
      this.populateCityData();
      console.log(`✅ City Visualizer initialized with ${this.adventuresData.length} adventures`);
    } else {
      console.log('⏳ Waiting for adventure data...');
      // Wait for data to load
      const checkDataInterval = setInterval(() => {
        if (window.adventuresData && window.adventuresData.length > 0) {
          this.adventuresData = window.adventuresData;
          this.populateCityData();
          console.log(`✅ City data populated: ${this.adventuresData.length} adventures`);
          clearInterval(checkDataInterval);
        }
      }, 500);

      // Stop checking after 30 seconds
      setTimeout(() => clearInterval(checkDataInterval), 30000);
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  }

  /**
   * Get approximate coordinates for a city (simplified - would use geocoding API in production)
   */
  getApproximateCoordinates(city, state) {
    // Comprehensive city coordinates database
    const cityCoordinates = {
      'Hendersonville,NC': { lat: 35.3395, lng: -82.4637 },
      'Asheville,NC': { lat: 35.5951, lng: -82.5515 },
      'Greenville,SC': { lat: 34.8526, lng: -82.3940 },
      'Columbia,SC': { lat: 34.0007, lng: -81.0348 },
      'Charlotte,NC': { lat: 35.2271, lng: -80.8431 },
      'Raleigh,NC': { lat: 35.7796, lng: -78.6382 },
      'Durham,NC': { lat: 35.9940, lng: -78.8986 },
      'Chapel Hill,NC': { lat: 35.9132, lng: -79.0558 },
      'Greensboro,NC': { lat: 36.0726, lng: -79.7920 },
      'Winston-Salem,NC': { lat: 36.0999, lng: -80.2442 },
      'Boone,NC': { lat: 36.2173, lng: -81.6846 },
      'Morganton,NC': { lat: 35.7391, lng: -81.6891 },
      'Hickory,NC': { lat: 35.7356, lng: -81.3312 },
      'Statesville,NC': { lat: 35.7799, lng: -80.8846 },
      'Gastonia,NC': { lat: 35.2630, lng: -81.1861 },
      'Spartanburg,SC': { lat: 34.9526, lng: -81.9322 },
      'Clemson,SC': { lat: 34.6834, lng: -82.8374 },
      'Sumter,SC': { lat: 34.1762, lng: -81.2010 },
      'Charleston,SC': { lat: 32.7765, lng: -79.9318 },
      'Atlanta,GA': { lat: 33.7490, lng: -84.3880 },
      'Knoxville,TN': { lat: 35.9606, lng: -83.9207 },
      'Nashville,TN': { lat: 36.1627, lng: -86.7816 },
      'Chattanooga,TN': { lat: 35.0456, lng: -85.2672 },
      'Johnson City,TN': { lat: 36.3193, lng: -82.3554 },
      'Kingsport,TN': { lat: 36.5478, lng: -82.5679 },
    };

    // Try exact match first
    let key = `${city},${state}`;
    if (cityCoordinates[key]) {
      return cityCoordinates[key];
    }

    // Try with just city name (case-insensitive)
    const cityLower = city.toLowerCase();
    for (const [coordKey, coords] of Object.entries(cityCoordinates)) {
      if (coordKey.toLowerCase().startsWith(cityLower)) {
        return coords;
      }
    }

    // If not found, try to estimate based on state
    // Default to Hendersonville, NC but log the missing city
    console.warn(`⚠️ City coordinates not found for: ${city}, ${state}. Using default coordinates.`);
    return { lat: 35.3395, lng: -82.4637 };
  }

  /**
   * Populate city data with distances
   */
  populateCityData() {
    this.cityGroups.clear();

    if (!this.adventuresData || this.adventuresData.length === 0) {
      console.log('No adventures data available');
      return;
    }

    // Group by city and calculate distance
    this.adventuresData.forEach((adventure, idx) => {
      // Try multiple data structure patterns
      let values = null;

      // Pattern 1: adventure.row.values[0]
      if (adventure?.row?.values?.[0]) {
        values = adventure.row.values[0];
      }
      // Pattern 2: adventure.values
      else if (adventure?.values?.[0]) {
        values = adventure.values[0];
      }
      // Pattern 3: adventure is directly an array
      else if (Array.isArray(adventure) && adventure.length > 0) {
        values = adventure;
      }

      // If no valid data found, skip
      if (!values || !Array.isArray(values)) {
        return; // Skip silently - not an error
      }

      const city = (values[10] || 'Unknown City').trim();
      const state = (values[9] || '').trim();
      const tags = (values[3] || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

      if (!this.cityGroups.has(city)) {
        // Get approximate coordinates for city
        const coords = this.getApproximateCoordinates(city, state);
        const distance = this.calculateDistance(
          this.referenceLocation.lat,
          this.referenceLocation.lng,
          coords.lat,
          coords.lng
        );

        this.cityGroups.set(city, {
          name: city,
          state: state,
          distance: parseFloat(distance),
          coordinates: coords,
          locations: [],
          allTags: new Set()
        });
      }

      this.cityGroups.get(city).locations.push({
        index: idx,
        name: values[0] || 'Unknown',
        tags: tags,
        difficulty: values[7] || '',
        cost: values[14] || '',
        rating: values[13] || '',
        description: values[16] || ''
      });

      // Add tags to set
      tags.forEach(tag => {
        this.cityGroups.get(city).allTags.add(tag);
        this.availableTags.add(tag); // Collect all available tags
      });
    });

    console.log(`✅ City groups populated: ${this.cityGroups.size} cities, ${this.availableTags.size} unique tags`);
  }

  /**
   * Create CSS for enhanced city visualizer
   */
  createStyles() {
    if (document.getElementById('enhancedCityVisualizerStyles')) return;

    const style = document.createElement('style');
    style.id = 'enhancedCityVisualizerStyles';
    style.textContent = `
      /* Enhanced City Visualizer Styles */
      
      #enhancedCityVisualizerModal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        z-index: 1010;
        width: 95%;
        max-width: 1200px;
        max-height: 90vh;
        display: none;
        flex-direction: column;
        overflow: hidden;
        animation: slideUp 0.3s ease-out;
      }

      #enhancedCityVisualizerModal.visible {
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

      #enhancedCityVisualizerBackdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1009;
        display: none;
      }

      #enhancedCityVisualizerBackdrop.visible {
        display: block;
      }

      /* Header */
      .enhanced-city-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }

      .enhanced-city-title {
        font-size: 24px;
        font-weight: 700;
        margin: 0;
      }

      .enhanced-city-subtitle {
        font-size: 14px;
        color: rgba(255,255,255,0.8);
        margin-top: 4px;
      }

      .enhanced-city-close {
        background: rgba(255,255,255,0.2);
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 20px;
        transition: all 0.2s;
      }

      .enhanced-city-close:hover {
        background: rgba(255,255,255,0.3);
      }

      /* Controls */
      .enhanced-city-controls {
        padding: 16px 24px;
        background: #f9fafb;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        align-items: center;
      }

      .enhanced-city-search {
        flex: 1;
        min-width: 250px;
        padding: 10px 16px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        font-size: 14px;
      }

      .enhanced-city-search:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      .enhanced-city-sort {
        display: flex;
        gap: 8px;
      }

      .enhanced-city-sort-btn {
        padding: 8px 16px;
        border: 1px solid #e5e7eb;
        background: white;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        font-size: 13px;
        transition: all 0.2s;
      }

      .enhanced-city-sort-btn:hover {
        border-color: #667eea;
        background: #f0f4ff;
      }

      .enhanced-city-sort-btn.active {
        background: #667eea;
        color: white;
        border-color: #667eea;
      }

      /* Tag Filter */
      .enhanced-city-tag-filters {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;
      }

      .enhanced-city-tag-btn {
        padding: 6px 12px;
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
        border-radius: 20px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        transition: all 0.2s;
        color: #374151;
      }

      .enhanced-city-tag-btn:hover {
        border-color: #667eea;
        background: #f0f4ff;
      }

      .enhanced-city-tag-btn.active {
        background: #667eea;
        color: white;
        border-color: #667eea;
      }

      /* City Tag Filter Section */
      .city-tag-filter-section {
        background: #f9fafb;
        border-radius: 8px;
        padding: 16px;
        margin-top: 12px;
      }

      .city-tag-filter-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .city-quick-tag-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 12px;
      }

      .city-tag-filter-btn {
        padding: 6px 12px;
        background: white;
        border: 1px solid #d1d5db;
        border-radius: 20px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        transition: all 0.2s;
        color: #374151;
      }

      .city-tag-filter-btn:hover {
        border-color: #667eea;
        background: #f0f4ff;
      }

      .city-tag-filter-btn.active {
        background: #667eea;
        color: white;
        border-color: #667eea;
      }

      .city-tag-search-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 13px;
        transition: all 0.2s;
      }

      .city-tag-search-input:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      .city-tag-search-results {
        max-height: 150px;
        overflow-y: auto;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        background: white;
      }

      .city-tag-search-result-item {
        padding: 8px 12px;
        border-bottom: 1px solid #f3f4f6;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 13px;
        color: #374151;
      }

      .city-tag-search-result-item:last-child {
        border-bottom: none;
      }

      .city-tag-search-result-item:hover {
        background: #f3f4f6;
        color: #667eea;
      }

      /* Content */
      .enhanced-city-content {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
      }

      /* City List View */
      .enhanced-city-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
      }

      .enhanced-city-card {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .enhanced-city-card:hover {
        border-color: #667eea;
        box-shadow: 0 10px 25px rgba(102, 126, 234, 0.15);
        transform: translateY(-4px);
      }

      .enhanced-city-card-name {
        font-size: 18px;
        font-weight: 700;
        color: #1f2937;
        margin: 0;
      }

      .enhanced-city-card-info {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        font-size: 13px;
      }

      .enhanced-city-info-item {
        padding: 8px;
        background: #f9fafb;
        border-radius: 6px;
        border: 1px solid #f3f4f6;
      }

      .enhanced-city-info-label {
        font-weight: 600;
        color: #6b7280;
        display: block;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 2px;
      }

      .enhanced-city-info-value {
        color: #1f2937;
        font-size: 16px;
        font-weight: 700;
      }

      .enhanced-city-distance {
        color: #667eea;
      }

      /* City Detail View */
      .enhanced-city-detail {
        display: none;
      }

      .enhanced-city-detail.active {
        display: block;
      }

      .enhanced-city-detail-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 2px solid #e5e7eb;
      }

      .enhanced-city-back-btn {
        padding: 8px 16px;
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
      }

      .enhanced-city-back-btn:hover {
        background: #e5e7eb;
      }

      .enhanced-city-detail-title {
        font-size: 28px;
        font-weight: 700;
        color: #1f2937;
        margin: 0;
      }

      /* Location List */
      .enhanced-location-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .enhanced-location-item {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 16px;
        transition: all 0.2s;
        cursor: pointer;
      }

      .enhanced-location-item:hover {
        border-color: #667eea;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
      }

      .enhanced-location-name {
        font-weight: 700;
        color: #1f2937;
        margin: 0 0 8px 0;
        font-size: 16px;
      }

      .enhanced-location-tags {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        margin-top: 8px;
      }

      .enhanced-location-tag {
        padding: 4px 8px;
        background: #f3f4f6;
        border-radius: 4px;
        font-size: 12px;
        color: #374151;
      }

      /* Footer */
      .enhanced-city-footer {
        padding: 16px 24px;
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }

      .enhanced-city-btn {
        padding: 10px 20px;
        border: 1px solid #e5e7eb;
        background: white;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
      }

      .enhanced-city-btn:hover {
        border-color: #667eea;
        background: #f0f4ff;
      }

      .enhanced-city-btn.primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-color: #667eea;
      }

      .enhanced-city-btn.primary:hover {
        box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
      }

      /* Responsive */
      @media (max-width: 768px) {
        .enhanced-city-list {
          grid-template-columns: 1fr;
        }

        .enhanced-city-header {
          flex-direction: column;
          gap: 12px;
          align-items: flex-start;
        }

        .enhanced-city-close {
          align-self: flex-end;
        }

        .enhanced-city-controls {
          flex-direction: column;
          align-items: stretch;
        }

        .enhanced-city-search {
          min-width: auto;
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Create HTML markup
   */
  createMarkup() {
    const backdrop = document.createElement('div');
    backdrop.id = 'enhancedCityVisualizerBackdrop';
    document.body.appendChild(backdrop);

    const modal = document.createElement('div');
    modal.id = 'enhancedCityVisualizerModal';
    modal.innerHTML = `
      <div class="enhanced-city-header">
        <div>
          <h2 class="enhanced-city-title">🏙️ City Explorer</h2>
          <div class="enhanced-city-subtitle">Explore locations by city with advanced filtering</div>
        </div>
        <button class="enhanced-city-close" onclick="window.closeEnhancedCityVisualizer()">✕</button>
      </div>

      <div class="enhanced-city-controls">
        <input type="text" class="enhanced-city-search" id="citysearch" placeholder="Search cities or locations...">
        
        <div class="enhanced-city-sort">
          <button class="enhanced-city-sort-btn active" data-sort="distance">📍 Distance</button>
          <button class="enhanced-city-sort-btn" data-sort="name">A-Z</button>
          <button class="enhanced-city-sort-btn" data-sort="count">📊 Count</button>
        </div>

        <!-- Tag Filters Section -->
        <div class="city-tag-filter-section">
          <div class="city-tag-filter-header">
            <h3 style="margin: 0; font-size: 13px; font-weight: 600; color: #374151;">🏷️ Filter by Tags</h3>
            <button class="city-clear-tags-btn" onclick="window.enhancedCityViz.clearTagFilters()" style="padding: 4px 12px; background: #f3f4f6; border: none; border-radius: 4px; font-size: 12px; cursor: pointer; color: #6b7280;">Clear All</button>
          </div>
          <div id="cityQuickTagFilters" class="city-quick-tag-filters" style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;"></div>
          <input type="text" class="city-tag-search-input" id="cityTagSearchInput" placeholder="Search and add tags..." style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px;">
          <div id="cityTagSearchResults" class="city-tag-search-results" style="display: none; margin-top: 8px; max-height: 150px; overflow-y: auto; border: 1px solid #d1d5db; border-radius: 6px; background: white;"></div>
        </div>
      </div>

      <div class="enhanced-city-content" id="enhancedCityContent">
        <div id="cityListView" class="enhanced-city-list"></div>
        <div id="cityDetailView" class="enhanced-city-detail"></div>
      </div>

      <div class="enhanced-city-footer">
        <button class="enhanced-city-btn" onclick="window.closeEnhancedCityVisualizer()">Close</button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    document.getElementById('enhancedCityVisualizerBackdrop')?.addEventListener('click', () => {
      window.closeEnhancedCityVisualizer();
    });

    document.getElementById('citysearch')?.addEventListener('input', (e) => {
      if (this.currentView === 'cityList') {
        this.renderCityList();
      }
    });

    document.querySelectorAll('.enhanced-city-sort-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.enhanced-city-sort-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.renderCityList();
      });
    });

    // Add tag filter event listeners
    this.setupTagFilterListeners();
  }

  /**
   * Setup tag filter event listeners
   */
  setupTagFilterListeners() {
    const searchInput = document.getElementById('cityTagSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        const resultsDiv = document.getElementById('cityTagSearchResults');

        if (searchTerm.length === 0) {
          resultsDiv.style.display = 'none';
          this.populateQuickTagFilters();
          return;
        }

        // Filter available tags based on search
        const filteredTags = Array.from(this.availableTags).filter(tag =>
          tag.toLowerCase().includes(searchTerm)
        ).slice(0, 10);

        if (filteredTags.length === 0) {
          resultsDiv.innerHTML = '<div style="padding: 12px; text-align: center; color: #9ca3af; font-size: 12px;">No tags found</div>';
          resultsDiv.style.display = 'block';
          return;
        }

        resultsDiv.innerHTML = filteredTags.map(tag => `
          <div class="city-tag-search-result-item" onclick="window.enhancedCityViz.toggleTagFilter('${tag}')">
            🏷️ ${tag}
          </div>
        `).join('');
        resultsDiv.style.display = 'block';
      });
    }

    // Initial population of quick tag filters
    this.populateQuickTagFilters();
  }

  /**
   * Populate quick tag filters with most common tags
   */
  populateQuickTagFilters() {
    const quickFiltersDiv = document.getElementById('cityQuickTagFilters');
    if (!quickFiltersDiv) return;

    // Get top 8 most common tags
    const tagCounts = {};
    this.availableTags.forEach(tag => {
      let count = 0;
      this.cityGroups.forEach(city => {
        if (city.allTags.has(tag)) count++;
      });
      tagCounts[tag] = count;
    });

    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);

    quickFiltersDiv.innerHTML = topTags.map(tag => `
      <button class="city-tag-filter-btn" data-tag="${tag}" onclick="window.enhancedCityViz.toggleTagFilter('${tag}')">
        🏷️ ${tag}
      </button>
    `).join('');

    // Update active states
    this.updateTagFilterUI();
  }

  /**
   * Get active sort method
   */
  getActiveSort() {
    const activeBtn = document.querySelector('.enhanced-city-sort-btn.active');
    return activeBtn?.getAttribute('data-sort') || 'distance';
  }

  /**
   * Get search term
   */
  getSearchTerm() {
    return (document.getElementById('citysearch')?.value || '').toLowerCase();
  }

  /**
   * Render city list view
   */
  renderCityList() {
    const searchTerm = this.getSearchTerm();
    const sortMethod = this.getActiveSort();

    let cities = Array.from(this.cityGroups.values());

    console.log(`📊 City Visualizer: ${this.cityGroups.size} cities, ${cities.length} after filtering`);

    // Filter by search term
    if (searchTerm) {
      cities = cities.filter(city =>
        city.name.toLowerCase().includes(searchTerm) ||
        city.state.toLowerCase().includes(searchTerm) ||
        Array.from(city.allTags).some(tag => tag.includes(searchTerm))
      );
    }

    // Filter by selected tags - only show cities that have at least one selected tag
    if (this.currentFilters.tags && this.currentFilters.tags.length > 0) {
      cities = cities.filter(city => {
        const cityTags = Array.from(city.allTags).map(t => t.toLowerCase());
        return this.currentFilters.tags.some(selectedTag =>
          cityTags.includes(selectedTag.toLowerCase())
        );
      });
    }

    // Sort
    if (sortMethod === 'distance') {
      cities.sort((a, b) => a.distance - b.distance);
    } else if (sortMethod === 'name') {
      cities.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortMethod === 'count') {
      cities.sort((a, b) => b.locations.length - a.locations.length);
    }

    const listView = document.getElementById('cityListView');

    // Show empty state if no cities
    if (cities.length === 0) {
      listView.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
          <p style="font-size: 48px; margin: 0;">🏜️</p>
          <p style="color: #6b7280; font-weight: 600; margin-top: 16px;">No cities found</p>
          <p style="color: #9ca3af; font-size: 14px; margin-top: 8px;">
            ${this.cityGroups.size === 0 ? 'Loading location data...' : 'Try adjusting your search filters'}
          </p>
        </div>
      `;
      console.warn('⚠️ No cities to display. City groups size:', this.cityGroups.size);
      return;
    }

    listView.innerHTML = cities.map(city => `
      <div class="enhanced-city-card" onclick="window.viewCityDetails('${city.name.replace(/'/g, "\\'")}')">
        <h3 class="enhanced-city-card-name">${city.name}</h3>
        <div class="enhanced-city-card-info">
          <div class="enhanced-city-info-item">
            <span class="enhanced-city-info-label">📍 Distance</span>
            <span class="enhanced-city-info-value enhanced-city-distance">${city.distance} mi</span>
          </div>
          <div class="enhanced-city-info-item">
            <span class="enhanced-city-info-label">📌 Locations</span>
            <span class="enhanced-city-info-value">${city.locations.length}</span>
          </div>
          <div class="enhanced-city-info-item">
            <span class="enhanced-city-info-label">State</span>
            <span class="enhanced-city-info-value">${city.state || 'N/A'}</span>
          </div>
          <div class="enhanced-city-info-item">
            <span class="enhanced-city-info-label">🏷️ Tags</span>
            <span class="enhanced-city-info-value">${city.allTags.size}</span>
          </div>
        </div>
      </div>
    `).join('');

    console.log(`✅ Rendered ${cities.length} cities`);
  }

  /**
   * View city details with locations
   */
  viewCityDetails(cityName) {
    const city = this.cityGroups.get(cityName);
    if (!city) return;

    this.selectedCity = city;
    this.currentView = 'cityDetail';

    const detailView = document.getElementById('cityDetailView');
    detailView.innerHTML = `
      <div class="enhanced-city-detail active">
        <div class="enhanced-city-detail-header">
          <button class="enhanced-city-back-btn" onclick="window.backToCityList()">← Back to Cities</button>
          <h2 class="enhanced-city-detail-title">${city.name}, ${city.state}</h2>
        </div>

        <div style="margin-bottom: 16px; padding: 12px; background: #f0f4ff; border-radius: 8px; border-left: 4px solid #667eea;">
          <p style="margin: 0; color: #1e40af; font-weight: 600;">
            📍 ${city.distance} miles from Hendersonville, NC | 🏷️ ${city.allTags.size} unique tags | 📌 ${city.locations.length} locations
          </p>
        </div>

        <input type="text" class="enhanced-city-search" id="cityLocationSearch" placeholder="Search locations in ${city.name}..." style="margin-bottom: 16px;">

        <div class="enhanced-location-list" id="cityLocationsList">
          ${city.locations.map(loc => `
            <div class="enhanced-location-item" onclick="window.showLocationDetails(${loc.index})">
              <h4 class="enhanced-location-name">${loc.name}</h4>
              <div style="display: grid; grid-template-columns: auto auto auto; gap: 8px; font-size: 12px; color: #6b7280;">
                ${loc.difficulty ? `<span>⛰️ ${loc.difficulty}</span>` : ''}
                ${loc.cost ? `<span>💰 ${loc.cost}</span>` : ''}
                ${loc.rating ? `<span>⭐ ${loc.rating}</span>` : ''}
              </div>
              ${loc.tags.length > 0 ? `
                <div class="enhanced-location-tags">
                  ${loc.tags.slice(0, 5).map(tag => `<span class="enhanced-location-tag">${tag}</span>`).join('')}
                  ${loc.tags.length > 5 ? `<span class="enhanced-location-tag">+${loc.tags.length - 5}</span>` : ''}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.getElementById('cityListView').style.display = 'none';
    detailView.style.display = 'block';

    // Attach search listener
    document.getElementById('cityLocationSearch')?.addEventListener('input', (e) => {
      this.filterCityLocations(e.target.value);
    });
  }

  /**
   * Filter locations within city
   */
  filterCityLocations(searchTerm) {
    const term = searchTerm.toLowerCase();
    const listDiv = document.getElementById('cityLocationsList');

    if (this.selectedCity && listDiv) {
      const filtered = this.selectedCity.locations.filter(loc =>
        loc.name.toLowerCase().includes(term) ||
        loc.tags.some(tag => tag.includes(term)) ||
        loc.difficulty.toLowerCase().includes(term) ||
        loc.cost.toLowerCase().includes(term)
      );

      listDiv.innerHTML = filtered.map(loc => `
        <div class="enhanced-location-item" onclick="window.showLocationDetails(${loc.index})">
          <h4 class="enhanced-location-name">${loc.name}</h4>
          <div style="display: grid; grid-template-columns: auto auto auto; gap: 8px; font-size: 12px; color: #6b7280;">
            ${loc.difficulty ? `<span>⛰️ ${loc.difficulty}</span>` : ''}
            ${loc.cost ? `<span>💰 ${loc.cost}</span>` : ''}
            ${loc.rating ? `<span>⭐ ${loc.rating}</span>` : ''}
          </div>
          ${loc.tags.length > 0 ? `
            <div class="enhanced-location-tags">
              ${loc.tags.slice(0, 5).map(tag => `<span class="enhanced-location-tag">${tag}</span>`).join('')}
              ${loc.tags.length > 5 ? `<span class="enhanced-location-tag">+${loc.tags.length - 5}</span>` : ''}
            </div>
          ` : ''}
        </div>
      `).join('');
    }
  }

  /**
   * Toggle tag filter
   */
  toggleTagFilter(tag) {
    const tagLower = tag.toLowerCase();
    const index = this.currentFilters.tags.indexOf(tagLower);

    if (index > -1) {
      // Remove tag
      this.currentFilters.tags.splice(index, 1);
    } else {
      // Add tag
      this.currentFilters.tags.push(tagLower);
    }

    this.updateTagFilterUI();
    this.renderCityList();
  }

  /**
   * Clear all tag filters
   */
  clearTagFilters() {
    this.currentFilters.tags = [];
    this.updateTagFilterUI();
    this.renderCityList();
  }

  /**
   * Update tag filter UI to show which tags are selected
   */
  updateTagFilterUI() {
    const filterButtons = document.querySelectorAll('.city-tag-filter-btn');
    filterButtons.forEach(btn => {
      const tag = btn.getAttribute('data-tag')?.toLowerCase();
      if (tag && this.currentFilters.tags.includes(tag)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const searchInput = document.getElementById('cityTagSearchInput');
    if (searchInput) {
      searchInput.value = '';
    }
  }

  /**
   * Show in modal
   */
  show() {
    document.getElementById('enhancedCityVisualizerBackdrop').classList.add('visible');
    document.getElementById('enhancedCityVisualizerModal').classList.add('visible');
    this.currentView = 'cityList';

    // Refresh data in case it's been updated
    this.refreshData();
    this.populateQuickTagFilters();
    this.renderCityList();
  }

  /**
   * Refresh data from main window
   */
  refreshData() {
    if (window.adventuresData && window.adventuresData.length > 0) {
      this.adventuresData = window.adventuresData;
      // Re-populate city groups with fresh data
      this.populateCityData();
    }
  }

  /**
   * Hide modal
   */
  hide() {
    document.getElementById('enhancedCityVisualizerBackdrop').classList.remove('visible');
    document.getElementById('enhancedCityVisualizerModal').classList.remove('visible');
  }
}

// Global functions
window.openEnhancedCityVisualizer = function() {
  if (!window.enhancedCityViz) {
    window.enhancedCityViz = new EnhancedCityVisualizer();
  }
  window.enhancedCityViz.show();
};

window.closeEnhancedCityVisualizer = function() {
  window.enhancedCityViz?.hide();
};

window.viewCityDetails = function(cityName) {
  window.enhancedCityViz?.viewCityDetails(cityName);
};

window.backToCityList = function() {
  if (window.enhancedCityViz) {
    window.enhancedCityViz.currentView = 'cityList';
    document.getElementById('cityListView').style.display = 'grid';
    document.getElementById('cityDetailView').style.display = 'none';
    document.getElementById('citysearch').value = '';
    window.enhancedCityViz.renderCityList();
  }
};

window.showLocationDetails = function(index) {
  try {
    // Safely access adventure data
    if (!window.adventuresData || !window.adventuresData[index]) {
      console.warn(`Location index ${index} not found`);
      return;
    }

    const adventure = window.adventuresData[index];

    // Safely access row data
    if (!adventure || !adventure.row || !adventure.row.values || !adventure.row.values[0]) {
      console.error('Invalid adventure data structure:', adventure);
      return;
    }

    const values = adventure.row.values[0];
    const name = values[0] || 'Unknown Location';

    window.closeEnhancedCityVisualizer();

    if (typeof window.showCardDetails === 'function') {
      window.showCardDetails(index);
    } else {
      window.showToast(`📌 ${name} selected`, 'info', 2000);
    }
  } catch (error) {
    console.error('Error in showLocationDetails:', error);
    window.showToast('Error opening location details', 'error', 2000);
  }
};

console.log('✅ Enhanced City Visualizer Loaded');

