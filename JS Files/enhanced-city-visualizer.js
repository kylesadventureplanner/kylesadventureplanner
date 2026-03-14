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
    this.init();
  }

  /**
   * Initialize the enhanced city visualizer
   */
  init() {
    this.createStyles();
    this.createMarkup();
    this.attachEventListeners();
    this.populateCityData();
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
    // This is a simplified lookup - in production you'd use Google Places API
    const cityCoordinates = {
      'Hendersonville,NC': { lat: 35.3395, lng: -82.4637 },
      'Asheville,NC': { lat: 35.5951, lng: -82.5515 },
      'Greenville,SC': { lat: 34.8526, lng: -82.3940 },
      'Columbia,SC': { lat: 34.0007, lng: -81.0348 },
      'Charlotte,NC': { lat: 35.2271, lng: -80.8431 },
      'Raleigh,NC': { lat: 35.7796, lng: -78.6382 },
    };
    const key = `${city},${state}`;
    return cityCoordinates[key] || { lat: 35.3395, lng: -82.4637 };
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
      const values = adventure.row.values[0];
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
      tags.forEach(tag => this.cityGroups.get(city).allTags.add(tag));
    });

    console.log('✅ City groups populated:', this.cityGroups.size, 'cities found');
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

    // Filter by search term
    if (searchTerm) {
      cities = cities.filter(city =>
        city.name.toLowerCase().includes(searchTerm) ||
        city.state.toLowerCase().includes(searchTerm) ||
        Array.from(city.allTags).some(tag => tag.includes(searchTerm))
      );
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
   * Show in modal
   */
  show() {
    document.getElementById('enhancedCityVisualizerBackdrop').classList.add('visible');
    document.getElementById('enhancedCityVisualizerModal').classList.add('visible');
    this.currentView = 'cityList';
    this.renderCityList();
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
  if (window.adventuresData && window.adventuresData[index]) {
    const adventure = window.adventuresData[index];
    const values = adventure.row.values[0];
    const name = values[0] || 'Unknown Location';

    window.closeEnhancedCityVisualizer();

    if (typeof window.showCardDetails === 'function') {
      window.showCardDetails(index);
    } else {
      window.showToast(`📌 ${name} selected`, 'info', 2000);
    }
  }
};

console.log('✅ Enhanced City Visualizer Loaded');

