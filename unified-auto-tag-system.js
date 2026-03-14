/**
 * UNIFIED AUTO-TAG SYSTEM
 * ========================
 * Uses the advanced recommendation engine from clean-tag-manager.js
 * to provide consistent tag recommendations across the app
 *
 * File: unified-auto-tag-system.js
 * Version: v7.0.116
 * Date: March 13, 2026
 */

(function() {
  console.log('🏷️ Unified Auto-Tag System Loading...');

  /**
   * Auto-tag all locations using clean tag manager recommendations
   */
  window.autoTagAllLocationsUnified = async function(options = {}) {
    const {
      minConfidence = 0.75,  // Minimum confidence to auto-apply (75%)
      autoAcceptAbove = 0.90, // Automatically apply tags above 90%
      showProgress = true,
      dryRun = false
    } = options;

    console.log('🏷️ Starting unified auto-tag for all locations...');

    if (!window.cleanTagManager) {
      console.error('❌ Clean Tag Manager not loaded');
      if (window.showToast) window.showToast('❌ Tag system not ready', 'error', 3000);
      return { success: 0, failed: 0, skipped: 0 };
    }

    if (!window.adventuresData || window.adventuresData.length === 0) {
      console.warn('⚠️ No locations to tag');
      if (window.showToast) window.showToast('⚠️ No locations found', 'warning', 2000);
      return { success: 0, failed: 0, skipped: 0 };
    }

    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      details: []
    };

    try {
      // Create progress container if showing progress
      let progressContainer = null;
      if (showProgress) {
        progressContainer = createProgressContainer(window.adventuresData.length);
      }

      // Process each location
      for (let index = 0; index < window.adventuresData.length; index++) {
        const location = window.adventuresData[index];
        const placeId = location?.values?.[0]?.[1];
        const locationName = location?.values?.[0]?.[0];

        if (!placeId) {
          results.skipped++;
          updateProgress(progressContainer, index, '⏭️');
          continue;
        }

        try {
          // Get recommendations using clean tag manager
          const recommendations = getTagRecommendationsForLocation(location);

          if (!recommendations || recommendations.length === 0) {
            results.skipped++;
            updateProgress(progressContainer, index, '⏭️');
            continue;
          }

          // Filter by confidence level
          const appliedTags = recommendations
            .filter(rec => rec.confidence >= minConfidence)
            .map(rec => rec.tag);

          if (appliedTags.length === 0) {
            results.skipped++;
            updateProgress(progressContainer, index, '⏭️');
            continue;
          }

          // Get existing tags
          const existingTags = (location?.values?.[0]?.[3] || '')
            .split(',')
            .map(t => t.trim())
            .filter(t => t.length > 0);

          // Merge with existing (no duplicates)
          const mergedTags = Array.from(new Set([...existingTags, ...appliedTags]));

          if (!dryRun) {
            // Update location with new tags
            if (location?.values?.[0]) {
              location.values[0][3] = mergedTags.join(', ');
            }
          }

          results.success++;
          results.details.push({
            location: locationName,
            placeId: placeId,
            tagsAdded: appliedTags,
            totalTags: mergedTags.length,
            confidence: 'Mixed'
          });

          updateProgress(progressContainer, index, '✅');

        } catch (err) {
          console.error(`❌ Error tagging ${locationName}:`, err);
          results.failed++;
          results.details.push({
            location: locationName,
            placeId: placeId,
            error: err.message
          });
          updateProgress(progressContainer, index, '❌');
        }
      }

      // Show summary
      if (showProgress) {
        setTimeout(() => {
          showAutoTagSummary(results);
          if (progressContainer) progressContainer.remove();
        }, 1000);
      }

      // Refresh table if available
      if (window.loadTable && typeof window.loadTable === 'function') {
        await window.loadTable();
      }

      console.log('✅ Auto-tag completed:', results);
      return results;

    } catch (err) {
      console.error('❌ Error in auto-tag all:', err);
      if (window.showToast) {
        window.showToast(`❌ Error: ${err.message}`, 'error', 3000);
      }
      return results;
    }
  };

  /**
   * Get tag recommendations for a single location using clean tag manager engine
   */
  function getTagRecommendationsForLocation(location) {
    if (!location || !location.values || !location.values[0]) {
      return [];
    }

    const values = location.values[0];
    const placeId = String(values[1] || '').trim();

    if (!placeId) {
      return [];
    }

    try {
      // Set current place in clean tag manager
      if (window.cleanTagManager) {
        window.cleanTagManager.currentPlaceId = placeId;

        // Build recommendations using the same engine as tag button
        const recs = window.cleanTagManager.buildRecommendations();

        return recs || [];
      }

      return [];

    } catch (err) {
      console.error('Error getting recommendations:', err);
      return [];
    }
  }

  /**
   * Create progress UI container
   */
  function createProgressContainer(total) {
    const container = document.createElement('div');
    container.id = 'autoTagProgressContainer';
    container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      z-index: 999999;
      padding: 24px;
      width: 90%;
      max-width: 500px;
      text-align: center;
    `;

    container.innerHTML = `
      <div style="font-size: 18px; font-weight: 700; margin-bottom: 16px; color: #1f2937;">
        🏷️ Auto-Tagging Locations
      </div>
      <div style="margin-bottom: 16px;">
        <div id="autoTagProgress" style="background: #e5e7eb; border-radius: 8px; height: 24px; overflow: hidden;">
          <div id="autoTagProgressFill" style="background: linear-gradient(90deg, #3b82f6, #10b981); height: 100%; width: 0%; transition: width 0.3s ease; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 600;">
            0/${total}
          </div>
        </div>
      </div>
      <div id="autoTagStatus" style="font-size: 14px; color: #6b7280;">
        Processing: 0/${total}
      </div>
    `;

    document.body.appendChild(container);
    return container;
  }

  /**
   * Update progress display
   */
  function updateProgress(container, index, status) {
    if (!container) return;

    const total = window.adventuresData ? window.adventuresData.length : 0;
    const current = index + 1;
    const percentage = (current / total) * 100;

    const progressFill = container.querySelector('#autoTagProgressFill');
    const statusEl = container.querySelector('#autoTagStatus');

    if (progressFill) {
      progressFill.style.width = percentage + '%';
      progressFill.textContent = `${current}/${total}`;
    }

    if (statusEl) {
      statusEl.textContent = `${status} Processing: ${current}/${total}`;
    }
  }

  /**
   * Show summary modal
   */
  function showAutoTagSummary(results) {
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow: auto;
      z-index: 1000000;
    `;

    modal.innerHTML = `
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%); color: white; padding: 24px; display: flex; justify-content: space-between; align-items: center;">
        <h2 style="font-size: 20px; font-weight: 700; margin: 0;">✅ Auto-Tag Summary</h2>
        <button onclick="this.closest('div').parentElement.remove()" style="background: none; border: none; color: white; font-size: 28px; cursor: pointer; padding: 0;">✕</button>
      </div>

      <div style="padding: 24px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 24px;">
          <div style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 12px; padding: 16px; text-align: center;">
            <div style="font-size: 32px; margin-bottom: 8px;">✅</div>
            <div style="font-size: 12px; color: #6b7280;">Tagged</div>
            <div style="font-size: 24px; font-weight: 700; color: #10b981; margin-top: 8px;">${results.success}</div>
          </div>
          <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 16px; text-align: center;">
            <div style="font-size: 32px; margin-bottom: 8px;">⏭️</div>
            <div style="font-size: 12px; color: #6b7280;">Skipped</div>
            <div style="font-size: 24px; font-weight: 700; color: #f59e0b; margin-top: 8px;">${results.skipped}</div>
          </div>
          <div style="background: #fee2e2; border: 2px solid #ef4444; border-radius: 12px; padding: 16px; text-align: center;">
            <div style="font-size: 32px; margin-bottom: 8px;">❌</div>
            <div style="font-size: 12px; color: #6b7280;">Errors</div>
            <div style="font-size: 24px; font-weight: 700; color: #ef4444; margin-top: 8px;">${results.failed}</div>
          </div>
        </div>

        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px;">
          <h3 style="font-size: 14px; font-weight: 700; margin: 0 0 12px 0; color: #1f2937;">Details:</h3>
          <div style="max-height: 300px; overflow-y: auto; font-size: 13px;">
            ${results.details.map(detail => `
              <div style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <div style="color: #1f2937; font-weight: 600;">${detail.location || 'Unknown'}</div>
                ${detail.tagsAdded ? `
                  <div style="color: #10b981; margin-top: 4px;">
                    ✅ Added ${detail.tagsAdded.length} tags: ${detail.tagsAdded.join(', ')}
                  </div>
                ` : ''}
                ${detail.error ? `
                  <div style="color: #ef4444; margin-top: 4px;">
                    ❌ ${detail.error}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div style="padding: 16px 24px; background: #f9fafb; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px;">
        <button onclick="this.closest('div').parentElement.parentElement.remove()" style="padding: 10px 16px; background: linear-gradient(135deg, #3b82f6, #10b981); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Close</button>
      </div>
    `;

    modal.appendChild(document.createElement('div'));
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    backdrop.onclick = (e) => {
      if (e.target === backdrop) backdrop.remove();
    };
  }

  // Make it available
  console.log('✅ Unified Auto-Tag System Ready');
  console.log('   Call: window.autoTagAllLocationsUnified()');

})();

