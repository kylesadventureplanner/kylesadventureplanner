/**
 * CITY VIEWER INTEGRATION - v7.0.128
 * ==================================
 * Integrates city viewer enhancements:
 * - Drive time display
 * - Dynamic tag filters
 * - Open today status
 * - Closing soon alerts
 *
 * Date: March 15, 2026
 */

(function() {
  console.log('🚀 City Viewer Integration v7.0.128 Loading...');

  // Store original city viewer functions
  let originalShowLocationsList = null;
  let userLocation = null;

  /**
   * Hook into enhanced city viewer to add new features
   */
  window.enhancedCityViewerIntegration = {
    /**
     * Initialize integration
     */
    init: function() {
      // Hook into city viewer if available
      if (window.enhancedCityViewer && window.enhancedCityViewer.showLocationsList) {
        originalShowLocationsList = window.enhancedCityViewer.showLocationsList;

        // Override showLocationsList to add our enhancements
        window.enhancedCityViewer.showLocationsList = (city, state) => {
          return this.showLocationsListEnhanced(city, state);
        };
      }

      console.log('✅ City Viewer Integration initialized');
    },

    /**
     * Enhanced locations list with drive time and tags
     */
    showLocationsListEnhanced: async function(city, state) {
      try {
        // Get user location if available
        if (!userLocation && window.currentUserLocation) {
          userLocation = window.currentUserLocation;
        }

        // Filter locations for this city
        const data = window.adventuresData || [];
        const cityLocations = data.filter(adventure => {
          const locCity = adventure.city || (adventure.values && adventure.values[0][10]);
          const locState = adventure.state || (adventure.values && adventure.values[0][9]);
          return locCity && locCity.toLowerCase() === city.toLowerCase() &&
                 locState && locState.toLowerCase() === state.toLowerCase();
        });

        // Get unique tags for this city
        const cityTags = window.cityViewerEnhancements?.getTagsForCity(city, state, data) || [];

        // Create locations list HTML
        let html = '<div style="display: flex; flex-direction: column; gap: 16px;">';

        // Add dynamic tag filter buttons
        if (cityTags.length > 0) {
          html += '<div style="background: #f0f4ff; padding: 12px; border-radius: 8px; border: 1px solid #60a5fa;">';
          html += '<div style="font-size: 12px; font-weight: 700; color: #1e40af; margin-bottom: 8px;">🏷️ Filter by Tags:</div>';
          html += '<div style="display: flex; flex-wrap: wrap; gap: 8px;">';

          cityTags.forEach(tag => {
            html += `<button class="city-tag-filter-btn" data-tag="${tag}" style="
              padding: 6px 12px;
              background: white;
              color: #1e40af;
              border: 1px solid #60a5fa;
              border-radius: 20px;
              cursor: pointer;
              font-size: 12px;
              font-weight: 600;
              transition: all 0.2s;
            ">${tag}</button>`;
          });

          html += '</div></div>';
        }

        // Add open today and closing soon filters
        html += '<div style="display: flex; gap: 8px; flex-wrap: wrap;">';
        html += `
          <button onclick="window.enhancedCityViewerIntegration.filterByOpenToday(this)" style="
            padding: 8px 16px;
            background: white;
            color: #10b981;
            border: 2px solid #10b981;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            font-size: 13px;
            transition: all 0.2s;
          ">🟢 Open Today</button>
          <button onclick="window.enhancedCityViewerIntegration.filterByClosingSoon(this)" style="
            padding: 8px 16px;
            background: white;
            color: #f59e0b;
            border: 2px solid #f59e0b;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            font-size: 13px;
            transition: all 0.2s;
          ">⏰ Closing Soon</button>
        `;
        html += '</div>';

        // Add locations list
        html += '<div class="locations-list" style="display: flex; flex-direction: column; gap: 12px;">';

        for (const adventure of cityLocations) {
          const name = adventure.name || (adventure.values && adventure.values[0][0]);
          const address = adventure.address || (adventure.values && adventure.values[0][11]);
          const hours = adventure.hours || (adventure.values && adventure.values[0][19]);
          const tags = adventure.tags || (adventure.values && adventure.values[0][6]);
          const lat = adventure.latitude || (adventure.values && adventure.values[0][8]);
          const lng = adventure.longitude || (adventure.values && adventure.values[0][7]);

          // Check if open
          const isOpen = window.cityViewerEnhancements?.isOpenToday(hours);
          const isClosing = window.cityViewerEnhancements?.isClosingSoon(hours);
          const timeUntilClose = window.cityViewerEnhancements?.getTimeUntilClosing(hours);

          // Status indicators
          let statusIndicator = '';
          if (isOpen === true) {
            statusIndicator = ' 🟢 Open';
          } else if (isOpen === false) {
            statusIndicator = ' 🔴 Closed';
          }

          if (isClosing) {
            statusIndicator += ` ⏰ ${timeUntilClose}`;
          }

          // Drive time (if user location available)
          let driveTimeStr = '';
          if (userLocation && lat && lng) {
            const driveTime = await window.cityViewerEnhancements?.getDriveTime(
              userLocation.lat, userLocation.lng, lat, lng
            );
            if (driveTime) {
              driveTimeStr = ` • 🚗 ${driveTime.text}`;
            }
          }

          html += `
            <div class="location-item" style="
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
            ">
              <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 700; color: #1f2937; font-size: 14px; margin-bottom: 4px;">
                  ${name}${statusIndicator}
                </div>
                <div style="font-size: 12px; color: #9ca3af; margin-bottom: 8px;">
                  ${address}${driveTimeStr}
                </div>
                ${hours ? `<div style="font-size: 11px; color: #6b7280;">🕐 ${hours}</div>` : ''}
                ${tags ? `
                  <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px;">
                    ${tags.split(',').map(tag => `
                      <span style="
                        background: #dbeafe;
                        color: #1e40af;
                        padding: 3px 8px;
                        border-radius: 4px;
                        font-size: 11px;
                        font-weight: 600;
                      ">${tag.trim()}</span>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
              <button class="location-item-action" onclick="
                window.enhancedCityViewer?.showLocationDetails?.(${JSON.stringify(adventure).replace(/"/g, '\\"')});
              " style="
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
              ">View Details</button>
            </div>
          `;
        }

        html += '</div></div>';

        // Update the modal content
        const modalBody = document.querySelector('.enhanced-city-viewer-body') ||
                         document.querySelector('[class*="modal-body"]');
        if (modalBody) {
          modalBody.innerHTML = html;

          // Attach tag filter event listeners
          document.querySelectorAll('.city-tag-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const tag = btn.getAttribute('data-tag');
              btn.classList.toggle('active');
              if (btn.classList.contains('active')) {
                btn.style.background = '#1e40af';
                btn.style.color = 'white';
              } else {
                btn.style.background = 'white';
                btn.style.color = '#1e40af';
              }
            });
          });
        }

      } catch (error) {
        console.error('❌ Error in enhanced locations list:', error);
      }
    },

    /**
     * Filter locations by open today
     */
    filterByOpenToday: function(btn) {
      console.log('🟢 Filtering by open today...');
      btn.classList.toggle('active');

      if (btn.classList.contains('active')) {
        btn.style.background = '#10b981';
        btn.style.color = 'white';
      } else {
        btn.style.background = 'white';
        btn.style.color = '#10b981';
      }

      // Re-render list
      this.reRenderLocationsList();
    },

    /**
     * Filter locations by closing soon
     */
    filterByClosingSoon: function(btn) {
      console.log('⏰ Filtering by closing soon...');
      btn.classList.toggle('active');

      if (btn.classList.contains('active')) {
        btn.style.background = '#f59e0b';
        btn.style.color = 'white';
      } else {
        btn.style.background = 'white';
        btn.style.color = '#f59e0b';
      }

      // Re-render list
      this.reRenderLocationsList();
    },

    /**
     * Re-render the locations list with current filters
     */
    reRenderLocationsList: function() {
      // Get current filters and re-render
      const city = window.enhancedCityViewer?.selectedCity?.city;
      const state = window.enhancedCityViewer?.selectedCity?.state;

      if (city && state) {
        this.showLocationsListEnhanced(city, state);
      }
    }
  };

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.enhancedCityViewerIntegration.init();
    });
  } else {
    window.enhancedCityViewerIntegration.init();
  }

  console.log('✅ City Viewer Integration v7.0.128 Ready');
})();

