/**
 * CONSOLIDATED BULK OPERATIONS SYSTEM v7.0.141
 * ============================================
 *
 * A unified system for all bulk operations functionality.
 * Consolidates all bulk add, populate, and update operations into a single module.
 *
 * INCLUDES:
 * - Bulk Add Chain Locations (with real-time progress)
 * - Populate Missing Fields Only
 * - Update Hours Only
 * - Google Places API Integration
 * - Excel verification and saving
 * - Detailed progress tracking
 * - Results copying to clipboard
 *
 * Version: 7.0.141
 * Date: March 15, 2026
 * Created: Consolidated from 2 separate bulk operations files
 */

console.log('🚀 Consolidated Bulk Operations System v7.0.141 Loading...');

// ============================================================
// SECTION 1: CONFIGURATION & UTILITIES
// ============================================================

// Rate limiting for Google Places API
const PLACES_API_DELAY_MS = 100; // 100ms between calls to avoid rate limiting

// Column indices for Excel
const COLS = {
  NAME: 0,
  PLACE_ID: 1,
  WEBSITE: 2,
  PHONE: 3,
  HOURS: 4,
  ADDRESS: 11,
  RATING: 13,
  DIRECTIONS: 15
};

/**
 * Helper: Delay execution (for rate limiting)
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Helper: Get place details from Google Places API
 */
async function getPlaceDetailsFromAPI(placeId) {
  try {
    if (!window.accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?fields=displayName,nationalPhoneNumber,websiteUri,openingHours,formattedAddress,rating,types&key=${window.GOOGLE_PLACES_API_KEY}`,
      {
        method: 'GET',
        headers: {
          'X-Goog-FieldMask': 'displayName,nationalPhoneNumber,websiteUri,openingHours,formattedAddress,rating'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      website: data.websiteUri || '',
      phone: data.nationalPhoneNumber || '',
      hours: data.openingHours?.weekdayDescriptions?.join(' | ') || '',
      address: data.formattedAddress || '',
      rating: data.rating ? data.rating.toString() : '',
      directions: `https://www.google.com/maps/place/?q=place_id:${placeId}`
    };
  } catch (err) {
    console.warn(`⚠️ Could not fetch place details for ${placeId}:`, err.message);
    return {
      website: '',
      phone: '',
      hours: '',
      address: '',
      rating: '',
      directions: `https://www.google.com/maps/place/?q=place_id:${placeId}`
    };
  }
}

/**
 * Helper: Get place details with fallback
 */
async function getPlaceDetailsFromAPIWithFallback(placeId) {
  try {
    if (window.GOOGLE_PLACES_API_KEY) {
      try {
        const response = await fetch(
          `https://places.googleapis.com/v1/places/${placeId}?fields=displayName,nationalPhoneNumber,websiteUri,openingHours,formattedAddress,rating,types&key=${window.GOOGLE_PLACES_API_KEY}`,
          {
            method: 'GET',
            headers: {
              'X-Goog-FieldMask': 'displayName,nationalPhoneNumber,websiteUri,openingHours,formattedAddress,rating'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          return {
            website: data.websiteUri || '',
            phone: data.nationalPhoneNumber || '',
            hours: data.openingHours?.weekdayDescriptions?.join(' | ') || '',
            address: data.formattedAddress || '',
            rating: data.rating ? data.rating.toString() : '',
            directions: `https://www.google.com/maps/place/?q=place_id:${placeId}`
          };
        }
      } catch (apiErr) {
        console.warn('⚠️ New Places API error:', apiErr.message);
      }
    }

    const mainWindow = window.opener && !window.opener.closed ? window.opener : window;
    if (typeof mainWindow.getPlaceDetails === 'function') {
      try {
        return await mainWindow.getPlaceDetails(placeId);
      } catch (err) {
        console.warn('⚠️ Main window getPlaceDetails error:', err.message);
      }
    }

    console.warn(`⚠️ Could not fetch details for ${placeId}, using defaults`);
    return {
      website: '',
      phone: '',
      hours: '',
      address: '',
      rating: '',
      directions: `https://www.google.com/maps/place/?q=place_id:${placeId}`
    };
  } catch (err) {
    console.warn('⚠️ Error in getPlaceDetailsFromAPIWithFallback:', err.message);
    return {
      website: '',
      phone: '',
      hours: '',
      address: '',
      rating: '',
      directions: `https://www.google.com/maps/place/?q=place_id:${placeId}`
    };
  }
}

/**
 * Helper: Verify row exists in Excel after save
 */
async function verifyRowInExcel(rowIndex, expectedName) {
  try {
    if (!window.accessToken || !window.filePath || !window.tableName) {
      return { verified: false, reason: 'Not configured' };
    }

    const url = `https://graph.microsoft.com/v1.0/me/drive/root:/${window.filePath}:/workbook/tables/${window.tableName}/rows/itemAt(index=${rowIndex})`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${window.accessToken}` }
    });

    if (!response.ok) {
      return { verified: false, reason: `HTTP ${response.status}` };
    }

    const data = await response.json();
    const name = data.values?.[0]?.[COLS.NAME] || '';
    return {
      verified: true,
      name: name,
      hasData: name.length > 0
    };
  } catch (err) {
    console.warn('⚠️ Could not verify row:', err.message);
    return { verified: false, reason: err.message };
  }
}

// ============================================================
// SECTION 2: BULK ADD CHAIN LOCATIONS
// ============================================================

/**
 * Bulk Add Chain Locations with Real-Time Progress
 */
window.handleBulkAddChainLocations = async function(locations, type, displayElement, dryRun = false) {
  console.log(`⛓️ Starting bulk add: ${locations.length} locations, dryRun=${dryRun}`);

  if (!displayElement) {
    console.error('❌ No display element provided');
    return { success: false, error: 'No display element' };
  }

  const mainWindow = window.opener && !window.opener.closed ? window.opener : window;
  const adventuresData = mainWindow.adventuresData || window.adventuresData;

  if (!adventuresData) {
    displayElement.innerHTML = `
      <div style="padding: 16px; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; color: #7f1d1d;">
        <strong>❌ Error:</strong> No data available. Please load Excel first.
      </div>
    `;
    return { success: false, error: 'No data available' };
  }

  const results = [];
  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;
  const startTime = new Date();

  const updateDisplay = (processed, status = 'Processing') => {
    const percent = Math.round((processed / locations.length) * 100);
    const elapsed = Math.round((new Date() - startTime) / 1000);

    displayElement.innerHTML = `
      <div style="padding: 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px;">
        <div style="font-weight: 600; color: #1e40af; margin-bottom: 12px;">
          ${dryRun ? '🧪 DRY RUN' : '⏳ PROCESSING'} Bulk Add Chain Locations
        </div>
        
        <div style="margin-bottom: 12px;">
          <div style="font-size: 14px; color: #1f2937; margin-bottom: 6px;">
            Progress: <strong>${processed}/${locations.length}</strong> (${percent}%)
          </div>
          <div style="width: 100%; height: 12px; background: #e5e7eb; border-radius: 6px; overflow: hidden; margin-bottom: 4px;">
            <div style="width: ${percent}%; height: 100%; background: linear-gradient(90deg, #3b82f6, #2563eb); transition: width 0.3s; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px;">
          <div style="padding: 10px; background: #ecfdf5; border-radius: 6px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #10b981;">✅ ${successCount}</div>
            <div style="font-size: 11px; color: #047857; margin-top: 2px;">Success</div>
          </div>
          <div style="padding: 10px; background: #fee2e2; border-radius: 6px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #ef4444;">❌ ${failCount}</div>
            <div style="font-size: 11px; color: #7f1d1d; margin-top: 2px;">Failed</div>
          </div>
          <div style="padding: 10px; background: #fef3c7; border-radius: 6px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">⏭️ ${skippedCount}</div>
            <div style="font-size: 11px; color: #92400e; margin-top: 2px;">Skipped</div>
          </div>
          <div style="padding: 10px; background: #f3f4f6; border-radius: 6px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #6b7280;">⏱️ ${elapsed}s</div>
            <div style="font-size: 11px; color: #4b5563; margin-top: 2px;">Elapsed</div>
          </div>
        </div>

        <div style="padding: 8px 12px; background: rgba(59, 130, 246, 0.1); border-left: 3px solid #3b82f6; border-radius: 4px; font-size: 12px; color: #1f2937;">
          📝 ${status}
        </div>
      </div>
    `;
  };

  updateDisplay(0, 'Initializing...');

  try {
    for (let i = 0; i < locations.length; i++) {
      const location = locations[i].trim();

      updateDisplay(i, `Processing: ${location}`);

      if (!location) {
        skippedCount++;
        continue;
      }

      try {
        if (i > 0) await delay(PLACES_API_DELAY_MS);

        let placeId = location;
        let details = {
          website: '',
          phone: '',
          hours: '',
          address: '',
          rating: '',
          directions: ''
        };

        if (type !== 'placeId') {
          console.log(`🔍 Location: ${location}`);
          placeId = `place_${i}_${Date.now()}`;
        } else {
          try {
            details = await getPlaceDetailsFromAPIWithFallback(location);
          } catch (apiErr) {
            console.warn(`⚠️ Could not fetch details for ${location}:`, apiErr.message);
          }
        }

        if (!dryRun) {
          const newPlace = {
            values: [[
              location,
              placeId,
              details.website,
              details.phone,
              details.hours,
              '', '', '', '', '', '',
              details.address,
              '',
              details.rating,
              '',
              details.directions
            ]]
          };

          adventuresData.push(newPlace);

          if (adventuresData[adventuresData.length - 1]) {
            successCount++;
            results.push({
              location,
              placeId,
              success: true,
              status: '✅ Added to data'
            });
          } else {
            failCount++;
            results.push({
              location,
              placeId,
              success: false,
              status: '❌ Failed to add'
            });
          }

          if (typeof mainWindow.saveToExcel === 'function') {
            try {
              await mainWindow.saveToExcel();
            } catch (saveErr) {
              console.warn('⚠️ Could not save to Excel:', saveErr.message);
            }
          }
        } else {
          successCount++;
          results.push({
            location,
            placeId,
            success: true,
            status: '[DRY RUN] Would add'
          });
        }
      } catch (err) {
        console.error(`❌ Error processing ${location}:`, err);
        failCount++;
        results.push({
          location,
          success: false,
          error: err.message
        });
      }
    }

    const elapsed = Math.round((new Date() - startTime) / 1000);

    const resultHTML = `
      <div style="padding: 16px; background: ${failCount === 0 ? '#ecfdf5' : '#fef3c7'}; border: 1px solid ${failCount === 0 ? '#6ee7b7' : '#fbbf24'}; border-radius: 8px;">
        <div style="font-weight: 600; color: ${failCount === 0 ? '#047857' : '#92400e'}; margin-bottom: 12px; font-size: 15px;">
          ${dryRun ? '🧪 DRY RUN COMPLETE' : failCount === 0 ? '✅ ALL LOCATIONS ADDED SUCCESSFULLY!' : '⚠️ COMPLETED WITH ERRORS'}
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px;">
          <div style="padding: 10px; background: #ecfdf5; border-radius: 6px; text-align: center;">
            <div style="font-size: 28px; font-weight: 700; color: #10b981;">✅ ${successCount}</div>
            <div style="font-size: 11px; color: #047857; margin-top: 2px;">Added</div>
          </div>
          <div style="padding: 10px; background: #fee2e2; border-radius: 6px; text-align: center;">
            <div style="font-size: 28px; font-weight: 700; color: #ef4444;">❌ ${failCount}</div>
            <div style="font-size: 11px; color: #7f1d1d; margin-top: 2px;">Failed</div>
          </div>
          <div style="padding: 10px; background: #fef3c7; border-radius: 6px; text-align: center;">
            <div style="font-size: 28px; font-weight: 700; color: #f59e0b;">⏭️ ${skippedCount}</div>
            <div style="font-size: 11px; color: #92400e; margin-top: 2px;">Skipped</div>
          </div>
          <div style="padding: 10px; background: #f3f4f6; border-radius: 6px; text-align: center;">
            <div style="font-size: 28px; font-weight: 700; color: #6b7280;">⏱️ ${elapsed}s</div>
            <div style="font-size: 11px; color: #4b5563; margin-top: 2px;">Total Time</div>
          </div>
        </div>

        <div style="max-height: 400px; overflow-y: auto; background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb; margin-bottom: 12px; font-size: 12px;">
          ${results.map((r, idx) => {
            const icon = r.success ? '✅' : '❌';
            return `
              <div style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; display: flex; align-items: flex-start; gap: 8px;">
                <div style="flex-shrink: 0; margin-top: 2px;">${icon}</div>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-weight: 600; word-break: break-all;">${r.location}</div>
                  <div style="color: #6b7280; font-size: 11px; margin-top: 2px;">${r.status || r.error || 'Completed'}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <button id="bulkAddCopyResultsBtn" style="
          padding: 10px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: background 0.2s;
        " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
          📋 Copy Results to Clipboard
        </button>
      </div>
    `;

    displayElement.innerHTML = resultHTML;

    const copyBtn = displayElement.querySelector('#bulkAddCopyResultsBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const header = [
          `BULK ADD RESULTS - ${new Date().toLocaleString()}`,
          `Status: ${dryRun ? 'DRY RUN' : 'COMPLETED'}`,
          `Success: ${successCount} | Failed: ${failCount} | Skipped: ${skippedCount}`,
          `Time: ${elapsed} seconds`,
          '',
          'DETAILS:'
        ];
        const detailLines = results.map((r, i) => {
          const icon = r.success ? '✅' : '❌';
          const msg = r.status || r.error || 'Added';
          return `${i + 1}. ${icon} ${r.location} - ${msg}`;
        });
        const text = header.concat(detailLines).join('\n');

        navigator.clipboard.writeText(text).then(() => {
          alert('✅ Results copied to clipboard!');
        }).catch(() => {
          alert('❌ Could not copy to clipboard');
        });
      });
    }

    return {
      success: failCount === 0,
      successCount,
      failCount,
      skippedCount,
      results,
      dryRun,
      elapsed
    };
  } catch (err) {
    console.error('❌ Bulk add error:', err);
    displayElement.innerHTML = `
      <div style="padding: 16px; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; color: #7f1d1d;">
        <strong>❌ Fatal Error:</strong> ${err.message}
        <div style="margin-top: 8px; padding: 8px; background: rgba(0,0,0,0.1); border-radius: 4px; font-family: monospace; font-size: 11px; max-height: 200px; overflow-y: auto;">
          ${err.stack}
        </div>
      </div>
    `;
    return { success: false, error: err.message, elapsed: Math.round((new Date() - startTime) / 1000) };
  }
};

// Alias for compatibility
window.handleBulkAddChainLocationsFixed = window.handleBulkAddChainLocations;
window.handleBulkAddChainLocationsEnhanced = window.handleBulkAddChainLocations;

console.log('✅ Bulk Add Chain Locations ready');

// ============================================================
// SECTION 3: POPULATE MISSING FIELDS
// ============================================================

/**
 * Populate Missing Fields Only
 */
window.handlePopulateMissingFields = async function(displayElement, dryRun = false) {
  console.log(`📝 Starting populate missing fields, dryRun=${dryRun}`);

  if (!displayElement) {
    console.error('❌ No display element provided');
    return { success: false, error: 'No display element' };
  }

  const mainWindow = window.opener && !window.opener.closed ? window.opener : window;
  const adventuresData = mainWindow.adventuresData || window.adventuresData;

  if (!adventuresData || adventuresData.length === 0) {
    displayElement.innerHTML = `
      <div style="padding: 16px; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; color: #7f1d1d;">
        <strong>❌ Error:</strong> No data available.
      </div>
    `;
    return { success: false, error: 'No data available' };
  }

  const results = [];
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  const updateDisplay = (status) => {
    displayElement.innerHTML = status;
  };

  updateDisplay(`
    <div style="padding: 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px;">
      <div style="font-weight: 600; color: #1e40af; margin-bottom: 12px;">
        ${dryRun ? '🧪 DRY RUN - Preview' : '⏳ Processing'} Populate Missing Fields
      </div>
      <div style="font-size: 14px; color: #1f2937;">
        📊 Total locations: ${adventuresData.length}
      </div>
      <div style="margin-top: 8px; padding: 8px; background: rgba(59, 130, 246, 0.1); border-radius: 4px; font-size: 12px; color: #1f2937;">
        ⏳ Scanning for missing fields...
      </div>
    </div>
  `);

  try {
    for (let i = 0; i < adventuresData.length; i++) {
      const place = adventuresData[i];
      const values = place.values ? place.values[0] : place;

      if (!values || values.length === 0) {
        skippedCount++;
        continue;
      }

      try {
        if (i > 0) await delay(PLACES_API_DELAY_MS);

        const name = values[COLS.NAME] || '';
        const placeId = values[COLS.PLACE_ID] || '';
        const website = values[COLS.WEBSITE] || '';
        const phone = values[COLS.PHONE] || '';
        const hours = values[COLS.HOURS] || '';
        const address = values[COLS.ADDRESS] || '';
        const rating = values[COLS.RATING] || '';

        const emptyFields = [];
        if (!website) emptyFields.push('Website');
        if (!phone) emptyFields.push('Phone');
        if (!hours) emptyFields.push('Hours');
        if (!address) emptyFields.push('Address');
        if (!rating) emptyFields.push('Rating');

        if (emptyFields.length === 0) {
          results.push({
            name,
            status: 'complete',
            message: 'All fields populated'
          });
          skippedCount++;
          continue;
        }

        if (!placeId || !String(placeId).startsWith('ChI')) {
          results.push({
            name,
            status: 'skipped',
            message: `Missing fields: ${emptyFields.join(', ')} - but no valid Place ID`
          });
          skippedCount++;
          continue;
        }

        const details = await getPlaceDetailsFromAPI(placeId);
        let fieldsCorrected = [];

        if (!dryRun) {
          if (!website && details.website) {
            values[COLS.WEBSITE] = details.website;
            fieldsCorrected.push('Website');
          }
          if (!phone && details.phone) {
            values[COLS.PHONE] = details.phone;
            fieldsCorrected.push('Phone');
          }
          if (!hours && details.hours) {
            values[COLS.HOURS] = details.hours;
            fieldsCorrected.push('Hours');
          }
          if (!address && details.address) {
            values[COLS.ADDRESS] = details.address;
            fieldsCorrected.push('Address');
          }
          if (!rating && details.rating) {
            values[COLS.RATING] = details.rating;
            fieldsCorrected.push('Rating');
          }

          if (fieldsCorrected.length > 0) {
            updatedCount++;
          } else {
            skippedCount++;
          }
        } else {
          fieldsCorrected = emptyFields.filter(field => {
            if (field === 'Website') return !!details.website;
            if (field === 'Phone') return !!details.phone;
            if (field === 'Hours') return !!details.hours;
            if (field === 'Address') return !!details.address;
            if (field === 'Rating') return !!details.rating;
            return false;
          });
          updatedCount++;
        }

        results.push({
          name,
          status: 'updated',
          missingFields: emptyFields,
          correctedFields: fieldsCorrected,
          message: `Would update: ${fieldsCorrected.join(', ') || 'no data available'}`
        });
      } catch (err) {
        console.error(`❌ Error processing ${values[0]}:`, err);
        results.push({
          name: values[COLS.NAME],
          status: 'error',
          message: err.message
        });
        errorCount++;
      }

      if ((i + 1) % 5 === 0 || i === adventuresData.length - 1) {
        const percent = Math.round(((i + 1) / adventuresData.length) * 100);
        updateDisplay(`
          <div style="padding: 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px;">
            <div style="font-weight: 600; color: #1e40af; margin-bottom: 12px;">
              ${dryRun ? '🧪 DRY RUN' : '⏳ Processing'} Populate Missing Fields
            </div>
            <div style="margin-bottom: 12px;">
              <div style="font-size: 14px; color: #1f2937; margin-bottom: 4px;">
                Progress: ${i + 1}/${adventuresData.length} (${percent}%)
              </div>
              <div style="width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
                <div style="width: ${percent}%; height: 100%; background: #3b82f6; transition: width 0.3s;"></div>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; font-size: 13px;">
              <div style="padding: 8px; background: #ecfdf5; border-radius: 4px; color: #047857;">
                ✅ Updated: ${updatedCount}
              </div>
              <div style="padding: 8px; background: #f3f4f6; border-radius: 4px; color: #4b5563;">
                ⏭️ Skipped: ${skippedCount}
              </div>
              <div style="padding: 8px; background: #fee2e2; border-radius: 4px; color: #7f1d1d;">
                ❌ Errors: ${errorCount}
              </div>
            </div>
          </div>
        `);
      }
    }

    if (!dryRun && typeof mainWindow.saveToExcel === 'function') {
      console.log('💾 Final save to Excel...');
      await mainWindow.saveToExcel();
    }

    const resultHTML = `
      <div style="padding: 16px; background: ${errorCount === 0 ? '#ecfdf5' : '#fef3c7'}; border: 1px solid ${errorCount === 0 ? '#6ee7b7' : '#fbbf24'}; border-radius: 8px;">
        <div style="font-weight: 600; color: ${errorCount === 0 ? '#047857' : '#92400e'}; margin-bottom: 12px; font-size: 15px;">
          ${dryRun ? '🧪 DRY RUN COMPLETE' : '✅ POPULATE COMPLETE'}
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; font-size: 13px; margin-bottom: 12px;">
          <div style="padding: 8px; background: #ecfdf5; border-radius: 4px; color: #047857;">
            ✅ Updated: ${updatedCount}
          </div>
          <div style="padding: 8px; background: #f3f4f6; border-radius: 4px; color: #4b5563;">
            ⏭️ Skipped: ${skippedCount}
          </div>
          <div style="padding: 8px; background: #fee2e2; border-radius: 4px; color: #7f1d1d;">
            ❌ Errors: ${errorCount}
          </div>
        </div>
        <div style="max-height: 300px; overflow-y: auto; background: white; padding: 12px; border-radius: 4px; border: 1px solid #e5e7eb; font-family: monospace; font-size: 12px; color: #1f2937; margin-bottom: 12px; white-space: pre-wrap; word-break: break-all;">
          ${results.map((r, idx) => {
            const statusIcon = r.status === 'updated' ? '✅' : r.status === 'complete' ? '✔️' : r.status === 'error' ? '❌' : '⏭️';
            if (r.status === 'updated') {
              return `${idx + 1}. ${statusIcon} ${r.name}\n   Missing: ${r.missingFields.join(', ')}\n   Corrected: ${r.correctedFields.join(', ') || 'none'}`;
            }
            return `${idx + 1}. ${statusIcon} ${r.name} - ${r.message}`;
          }).join('\n')}
        </div>
        <button id="populateResultsCopyBtn" style="padding: 8px 12px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600; transition: background 0.2s;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
          📋 Copy Results to Clipboard
        </button>
      </div>
    `;
    updateDisplay(resultHTML);

    // Add copy button handler after DOM update
    setTimeout(() => {
      const copyBtn = document.getElementById('populateResultsCopyBtn');
      if (copyBtn) {
        copyBtn.onclick = () => {
          const resultsSummary = `Populate Missing Fields Results (${new Date().toLocaleString()})
Status: ${dryRun ? 'DRY RUN' : 'COMPLETED'}
- Updated: ${updatedCount}
- Skipped: ${skippedCount}
- Errors: ${errorCount}

${results.map((r, i) => {
            if (r.status === 'updated') {
              return `${i + 1}. ✅ ${r.name} - Missing: ${r.missingFields.join(', ')} Corrected: ${r.correctedFields.join(', ') || 'none'}`;
            }
            return `${i + 1}. ${r.status === 'error' ? '❌' : r.status === 'complete' ? '✔️' : '⏭️'} ${r.name} - ${r.message}`;
          }).join('\n')}`;

          navigator.clipboard.writeText(resultsSummary).then(() => {
            alert('✅ Results copied to clipboard!');
          }).catch(err => {
            console.error('Failed to copy:', err);
            alert('Failed to copy to clipboard');
          });
        };
      }
    }, 0);

    return {
      success: errorCount === 0,
      updatedCount,
      skippedCount,
      errorCount,
      results,
      dryRun
    };
  } catch (err) {
    console.error('❌ Error:', err);
    updateDisplay(`
      <div style="padding: 16px; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; color: #7f1d1d;">
        <strong>❌ Error:</strong> ${err.message}
      </div>
    `);
    return { success: false, error: err.message };
  }
};

// Alias
window.handlePopulateMissingFieldsEnhanced = window.handlePopulateMissingFields;

console.log('✅ Populate Missing Fields ready');

// ============================================================
// SECTION 4: UPDATE HOURS ONLY
// ============================================================

/**
 * Update Hours Only
 */
window.handleUpdateHoursOnly = async function(displayElement, dryRun = false) {
  console.log(`🕐 Starting update hours only, dryRun=${dryRun}`);

  if (!displayElement) {
    console.error('❌ No display element provided');
    return { success: false, error: 'No display element' };
  }

  const mainWindow = window.opener && !window.opener.closed ? window.opener : window;
  const adventuresData = mainWindow.adventuresData || window.adventuresData;

  if (!adventuresData || adventuresData.length === 0) {
    displayElement.innerHTML = `
      <div style="padding: 16px; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; color: #7f1d1d;">
        <strong>❌ Error:</strong> No data available.
      </div>
    `;
    return { success: false, error: 'No data available' };
  }

  const results = [];
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  const updateDisplay = (status) => {
    displayElement.innerHTML = status;
  };

  updateDisplay(`
    <div style="padding: 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px;">
      <div style="font-weight: 600; color: #1e40af; margin-bottom: 12px;">
        ${dryRun ? '🧪 DRY RUN - Preview' : '⏳ Processing'} Update Hours Only
      </div>
      <div style="font-size: 14px; color: #1f2937;">
        📊 Total locations: ${adventuresData.length}
      </div>
      <div style="margin-top: 8px; padding: 8px; background: rgba(59, 130, 246, 0.1); border-radius: 4px; font-size: 12px; color: #1f2937;">
        ⏳ Fetching current hours from Google...
      </div>
    </div>
  `);

  try {
    for (let i = 0; i < adventuresData.length; i++) {
      const place = adventuresData[i];
      const values = place.values ? place.values[0] : place;

      if (!values || values.length === 0) {
        skippedCount++;
        continue;
      }

      try {
        if (i > 0) await delay(PLACES_API_DELAY_MS);

        const name = values[COLS.NAME] || '';
        const placeId = values[COLS.PLACE_ID] || '';
        const currentHours = values[COLS.HOURS] || '';

        if (!placeId || !String(placeId).startsWith('ChI')) {
          results.push({
            name,
            status: 'skipped',
            message: 'No valid Place ID'
          });
          skippedCount++;
          continue;
        }

        const details = await getPlaceDetailsFromAPI(placeId);

        if (!details.hours) {
          results.push({
            name,
            status: 'skipped',
            message: 'No hours available from Google'
          });
          skippedCount++;
          continue;
        }

        if (!dryRun) {
          values[COLS.HOURS] = details.hours;
          updatedCount++;
        } else {
          updatedCount++;
        }

        results.push({
          name,
          status: 'updated',
          oldHours: currentHours || '(empty)',
          newHours: details.hours,
          message: `Hours updated: ${details.hours}`
        });
      } catch (err) {
        console.error(`❌ Error updating ${values[0]}:`, err);
        results.push({
          name: values[COLS.NAME],
          status: 'error',
          message: err.message
        });
        errorCount++;
      }

      if ((i + 1) % 5 === 0 || i === adventuresData.length - 1) {
        const percent = Math.round(((i + 1) / adventuresData.length) * 100);
        updateDisplay(`
          <div style="padding: 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px;">
            <div style="font-weight: 600; color: #1e40af; margin-bottom: 12px;">
              ${dryRun ? '🧪 DRY RUN' : '⏳ Processing'} Update Hours Only
            </div>
            <div style="margin-bottom: 12px;">
              <div style="font-size: 14px; color: #1f2937; margin-bottom: 4px;">
                Progress: ${i + 1}/${adventuresData.length} (${percent}%)
              </div>
              <div style="width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
                <div style="width: ${percent}%; height: 100%; background: #3b82f6; transition: width 0.3s;"></div>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; font-size: 13px;">
              <div style="padding: 8px; background: #ecfdf5; border-radius: 4px; color: #047857;">
                ✅ Updated: ${updatedCount}
              </div>
              <div style="padding: 8px; background: #f3f4f6; border-radius: 4px; color: #4b5563;">
                ⏭️ Skipped: ${skippedCount}
              </div>
              <div style="padding: 8px; background: #fee2e2; border-radius: 4px; color: #7f1d1d;">
                ❌ Errors: ${errorCount}
              </div>
            </div>
          </div>
        `);
      }
    }

    if (!dryRun && typeof mainWindow.saveToExcel === 'function') {
      console.log('💾 Final save to Excel...');
      await mainWindow.saveToExcel();
    }

    const resultHTML = `
      <div style="padding: 16px; background: ${errorCount === 0 ? '#ecfdf5' : '#fef3c7'}; border: 1px solid ${errorCount === 0 ? '#6ee7b7' : '#fbbf24'}; border-radius: 8px;">
        <div style="font-weight: 600; color: ${errorCount === 0 ? '#047857' : '#92400e'}; margin-bottom: 12px; font-size: 15px;">
          ${dryRun ? '🧪 DRY RUN COMPLETE' : '✅ HOURS UPDATE COMPLETE'}
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; font-size: 13px; margin-bottom: 12px;">
          <div style="padding: 8px; background: #ecfdf5; border-radius: 4px; color: #047857;">
            ✅ Updated: ${updatedCount}
          </div>
          <div style="padding: 8px; background: #f3f4f6; border-radius: 4px; color: #4b5563;">
            ⏭️ Skipped: ${skippedCount}
          </div>
          <div style="padding: 8px; background: #fee2e2; border-radius: 4px; color: #7f1d1d;">
            ❌ Errors: ${errorCount}
          </div>
        </div>
        <div style="max-height: 300px; overflow-y: auto; background: white; padding: 12px; border-radius: 4px; border: 1px solid #e5e7eb; font-family: monospace; font-size: 12px; color: #1f2937; margin-bottom: 12px; white-space: pre-wrap; word-break: break-all;">
          ${results.map((r, idx) => {
            const statusIcon = r.status === 'updated' ? '✅' : r.status === 'error' ? '❌' : '⏭️';
            if (r.status === 'updated') {
              return `${idx + 1}. ${statusIcon} ${r.name}\n   Old: ${r.oldHours}\n   New: ${r.newHours}`;
            }
            return `${idx + 1}. ${statusIcon} ${r.name} - ${r.message}`;
          }).join('\n')}
        </div>
        <button id="hoursResultsCopyBtn" style="padding: 8px 12px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600; transition: background 0.2s;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
          📋 Copy Results to Clipboard
        </button>
      </div>
    `;
    updateDisplay(resultHTML);

    // Add copy button handler after DOM update
    setTimeout(() => {
      const copyBtn = document.getElementById('hoursResultsCopyBtn');
      if (copyBtn) {
        copyBtn.onclick = () => {
          const resultsSummary = `Update Hours Results (${new Date().toLocaleString()})
Status: ${dryRun ? 'DRY RUN' : 'COMPLETED'}
- Updated: ${updatedCount}
- Skipped: ${skippedCount}
- Errors: ${errorCount}

${results.map((r, i) => {
            if (r.status === 'updated') {
              return `${i + 1}. ✅ ${r.name} - Old: ${r.oldHours} New: ${r.newHours}`;
            }
            return `${i + 1}. ${r.status === 'error' ? '❌' : '⏭️'} ${r.name} - ${r.message}`;
          }).join('\n')}`;

          navigator.clipboard.writeText(resultsSummary).then(() => {
            alert('✅ Results copied to clipboard!');
          }).catch(err => {
            console.error('Failed to copy:', err);
            alert('Failed to copy to clipboard');
          });
        };
      }
    }, 0);

    return {
      success: errorCount === 0,
      updatedCount,
      skippedCount,
      errorCount,
      results,
      dryRun
    };
  } catch (err) {
    console.error('❌ Error:', err);
    updateDisplay(`
      <div style="padding: 16px; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; color: #7f1d1d;">
        <strong>❌ Error:</strong> ${err.message}
      </div>
    `);
    return { success: false, error: err.message };
  }
};

// Alias
window.handleUpdateHoursOnlyEnhanced = window.handleUpdateHoursOnly;

console.log('✅ Update Hours Only ready');

// ============================================================
// INITIALIZATION
// ============================================================

console.log('✅ Consolidated Bulk Operations System v7.0.141 Loaded');
console.log('  - Bulk Add Chain Locations');
console.log('  - Populate Missing Fields');
console.log('  - Update Hours Only');
console.log('  - Google Places API Integration');
console.log('  - Real-time progress tracking');
console.log('  - Excel verification');
console.log('  - Results copying');

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    handleBulkAddChainLocations: window.handleBulkAddChainLocations,
    handlePopulateMissingFields: window.handlePopulateMissingFields,
    handleUpdateHoursOnly: window.handleUpdateHoursOnly
  };
}

