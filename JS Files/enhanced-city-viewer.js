/**
 * ENHANCED CITY VIEWER - Interactive Location Browsing
 * =====================================================
 * Improved city visualizer with interactive location details
 * Features:
 * - Click on city to see detailed location list
 * - View location info (tags, address, type, etc)
 * - Interactive exploration of locations within each city
 * - Open location details in modal
 * - Back button to return to city list
 *
 * Version: v7.0.117
 * Date: March 13, 2026
 */

window.enhancedCityViewer = {
  currentView: 'cities', // 'cities' or 'locations'
  selectedCity: null,
  citiesData: {},

  /**
   * Initialize enhanced city viewer
   */
  init: function() {
    this.createStyles();
    this.hookIntoCityVisualizer();
  },

  /**
   * Create enhanced styles
   */
  createStyles: function() {
    if (document.getElementById('enhancedCityViewerStyles')) return;

    const style = document.createElement('style');
    style.id = 'enhancedCityViewerStyles';
    style.textContent = `
      /* Enhanced City Viewer Styles */

      .city-viewer-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .city-viewer-title {
        font-size: 18px;
        font-weight: 700;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .city-viewer-back-btn {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        font-size: 13px;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .city-viewer-back-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      /* Locations List */
      .locations-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .location-item {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 16px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
      }

      .location-item:hover {
        border-color: #667eea;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        transform: translateY(-2px);
      }

      .location-item-info {
        flex: 1;
        min-width: 0;
      }

      .location-item-name {
        font-weight: 700;
        color: #1f2937;
        font-size: 14px;
        margin-bottom: 4px;
      }

      .location-item-meta {
        font-size: 12px;
        color: #9ca3af;
        margin-bottom: 8px;
      }

      .location-item-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .location-tag {
        background: #dbeafe;
        color: #1e40af;
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
      }

      .location-item-action {
        background: #667eea;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        font-size: 12px;
        white-space: nowrap;
        transition: all 0.2s;
      }

      .location-item-action:hover {
        background: #5568d3;
        transform: translateY(-1px);
      }

      /* Location Detail Modal */
      .location-detail-modal {
        max-width: 600px;
      }

      .location-detail-content {
        display: grid;
        gap: 16px;
      }

      .detail-section {
        display: grid;
        gap: 8px;
      }

      .detail-label {
        font-size: 12px;
        font-weight: 700;
        color: #9ca3af;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .detail-value {
        font-size: 14px;
        color: #1f2937;
        word-break: break-word;
      }

      .detail-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .detail-tag {
        background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
        color: #1e40af;
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 13px;
        font-weight: 600;
      }
    `;

    document.head.appendChild(style);
  },

  /**
   * Hook into existing city visualizer
   */
  hookIntoCityVisualizer: function() {
    // Wait for city visualizer to be ready
    const checkCityVisualizer = setInterval(() => {
      if (window.cityVisualizer && document.querySelector('.city-card')) {
        clearInterval(checkCityVisualizer);
        this.enhanceCityCards();
      }
    }, 100);

    // Fallback after 5 seconds
    setTimeout(() => clearInterval(checkCityVisualizer), 5000);
  },

  /**
   * Enhance city cards with click handlers
   */
  enhanceCityCards: function() {
    const cards = document.querySelectorAll('.city-card');
    cards.forEach((card, index) => {
      const cityName = card.querySelector('.city-card-name')?.textContent || `City ${index}`;

      card.style.cursor = 'pointer';
      card.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Get city data
        const state = card.querySelector('.city-card-state')?.textContent || '';
        const count = card.querySelector('.city-card-badge')?.textContent || '0';

        this.showCityLocations(cityName, state, parseInt(count));
      };
    });
  },

  /**
   * Show locations for a city
   */
  showCityLocations: function(cityName, state, count) {
    this.selectedCity = cityName;
    this.currentView = 'locations';

    // Get locations for this city from adventure data
    const adventuresData = window.adventuresData || [];
    const cityLocations = adventuresData.filter(loc =>
      (loc[14] || '').toLowerCase() === cityName.toLowerCase()
    );

    // Create locations view in the modal
    const contentArea = document.querySelector('.city-visualizer-content');
    if (!contentArea) return;

    let html = `
      <div class="city-viewer-header" style="margin: -24px -24px 20px -24px; border-radius: 12px 12px 0 0;">
        <h2 class="city-viewer-title">
          📍 ${cityName}${state ? `, ${state}` : ''}
        </h2>
        <button class="city-viewer-back-btn" onclick="window.enhancedCityViewer.backToCities()">
          ← Back to Cities
        </button>
      </div>

      <div class="locations-list">
    `;

    if (cityLocations.length === 0) {
      html += `
        <div style="text-align: center; padding: 40px 20px; color: #9ca3af;">
          <p style="font-size: 48px; margin-bottom: 12px;">📍</p>
          <p style="font-size: 14px; font-weight: 500;">No locations found in ${cityName}</p>
        </div>
      `;
    } else {
      cityLocations.forEach((loc, idx) => {
        const name = loc[1] || 'Unknown Location';
        const type = loc[4] || '';
        const address = loc[11] || '';
        const tags = loc[20] ? String(loc[20]).split(',').map(t => t.trim()).filter(t => t) : [];

        html += `
          <div class="location-item">
            <div class="location-item-info">
              <div class="location-item-name">${this.escapeHtml(name)}</div>
              <div class="location-item-meta">
                ${type ? `<strong>${this.escapeHtml(type)}</strong> • ` : ''}
                ${address ? this.escapeHtml(address) : 'Address not available'}
              </div>
              ${tags.length > 0 ? `
                <div class="location-item-tags">
                  ${tags.map(tag => `<span class="location-tag">${this.escapeHtml(tag)}</span>`).join('')}
                </div>
              ` : '<div style="color: #9ca3af; font-size: 12px;">No tags assigned</div>'}
            </div>
            <button class="location-item-action" onclick="window.enhancedCityViewer.showLocationDetail(${idx}, event)">
              View Info →
            </button>
          </div>
        `;
      });
    }

    html += '</div>';

    contentArea.innerHTML = html;
    contentArea.scrollTop = 0;
  },

  /**
   * Show location detail in popup
   */
  showLocationDetail: function(index, event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    const adventuresData = window.adventuresData || [];
    const cityLocations = adventuresData.filter(loc =>
      (loc[14] || '').toLowerCase() === this.selectedCity.toLowerCase()
    );

    const location = cityLocations[index];
    if (!location) return;

    // Create detail modal
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      z-index: 10002;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    header.innerHTML = `
      <h2 style="margin: 0; font-size: 18px; font-weight: 700;">📌 Location Details</h2>
      <button onclick="this.closest('div').parentElement.remove(); this.closest('div').remove();" style="background: none; border: none; color: white; font-size: 28px; cursor: pointer;">✕</button>
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      padding: 24px;
      overflow-y: auto;
      flex: 1;
    `;

    const tags = location[20] ? String(location[20]).split(',').map(t => t.trim()).filter(t => t) : [];

    content.innerHTML = `
      <div class="detail-section">
        <div class="detail-label">Location Name</div>
        <div class="detail-value" style="font-weight: 700; font-size: 16px;">${this.escapeHtml(location[1] || 'N/A')}</div>
      </div>

      ${location[4] ? `
        <div class="detail-section">
          <div class="detail-label">Type</div>
          <div class="detail-value">${this.escapeHtml(location[4])}</div>
        </div>
      ` : ''}

      ${location[11] ? `
        <div class="detail-section">
          <div class="detail-label">Address</div>
          <div class="detail-value">${this.escapeHtml(location[11])}</div>
        </div>
      ` : ''}

      ${location[14] ? `
        <div class="detail-section">
          <div class="detail-label">City</div>
          <div class="detail-value">${this.escapeHtml(location[14])}</div>
        </div>
      ` : ''}

      ${location[15] ? `
        <div class="detail-section">
          <div class="detail-label">State</div>
          <div class="detail-value">${this.escapeHtml(location[15])}</div>
        </div>
      ` : ''}

      ${tags.length > 0 ? `
        <div class="detail-section">
          <div class="detail-label">Tags (${tags.length})</div>
          <div class="detail-tags">
            ${tags.map(tag => `<span class="detail-tag">${this.escapeHtml(tag)}</span>`).join('')}
          </div>
        </div>
      ` : `
        <div class="detail-section">
          <div class="detail-label">Tags</div>
          <div class="detail-value" style="color: #9ca3af;">No tags assigned</div>
        </div>
      `}

      ${location[7] ? `
        <div class="detail-section">
          <div class="detail-label">Website</div>
          <div class="detail-value"><a href="${this.escapeHtml(location[7])}" target="_blank" style="color: #667eea; text-decoration: none;">Visit Website →</a></div>
        </div>
      ` : ''}
    `;

    modal.appendChild(header);
    modal.appendChild(content);
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    backdrop.onclick = (e) => {
      if (e.target === backdrop) {
        backdrop.remove();
      }
    };
  },

  /**
   * Back to cities view
   */
  backToCities: function() {
    this.currentView = 'cities';
    this.selectedCity = null;

    // Refresh the city visualizer view
    if (window.cityVisualizer && window.cityVisualizer.render) {
      window.cityVisualizer.render();
    }
  },

  /**
   * Escape HTML
   */
  escapeHtml: function(text) {
    if (!text) return '';
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.enhancedCityViewer.init());
} else {
  window.enhancedCityViewer.init();
}

