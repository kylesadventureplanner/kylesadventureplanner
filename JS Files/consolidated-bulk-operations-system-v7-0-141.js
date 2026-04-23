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

// Column indices for Excel (must match index.html/buildExcelRow schema)
const COLS = {
  NAME: 0,
  PLACE_ID: 1,
  WEBSITE: 2,
  TAGS: 3,
  DRIVE_TIME: 4,
  HOURS: 5,
  STATE: 9,
  CITY: 10,
  ADDRESS: 11,
  PHONE: 12,
  RATING: 13,
  COST: 14,
  DIRECTIONS: 15,
  DESCRIPTION: 16
};

function getActiveCols(mainWindow) {
  const source = mainWindow || (window.opener && !window.opener.closed ? window.opener : window);
  const getByName = source && typeof source.getColumnIndexByName === 'function'
    ? source.getColumnIndexByName
    : null;
  if (!getByName) return COLS;

  const pick = (primary, aliases, fallback) => {
    const idx = Number(getByName(primary, aliases));
    return Number.isInteger(idx) && idx >= 0 ? idx : fallback;
  };

  return {
    NAME: pick('Name', [], COLS.NAME),
    PLACE_ID: pick('Google Place ID', ['GooglePlaceId'], COLS.PLACE_ID),
    WEBSITE: pick('Website', [], COLS.WEBSITE),
    TAGS: pick('Tags', [], COLS.TAGS),
    DRIVE_TIME: pick('Drive Time', ['DriveTime'], COLS.DRIVE_TIME),
    HOURS: pick('Hours of Operation', ['Hours'], COLS.HOURS),
    STATE: pick('State', [], COLS.STATE),
    CITY: pick('City', [], COLS.CITY),
    ADDRESS: pick('Address', [], COLS.ADDRESS),
    PHONE: pick('Phone Number', ['Phone'], COLS.PHONE),
    RATING: pick('Google Rating', ['Rating'], COLS.RATING),
    COST: pick('Cost', [], COLS.COST),
    DIRECTIONS: pick('Directions', ['Directions '], COLS.DIRECTIONS),
    DESCRIPTION: pick('Description', [], COLS.DESCRIPTION)
  };
}

function getSchemaColumnCount(mainWindow) {
  const countFromGlobal = Number(mainWindow?.__excelColumnCount || window.__excelColumnCount || 0);
  if (Number.isInteger(countFromGlobal) && countFromGlobal > 0) return countFromGlobal;

  const firstRow = mainWindow?.adventuresData?.[0]?.values?.[0] || window.adventuresData?.[0]?.values?.[0];
  if (Array.isArray(firstRow) && firstRow.length > 0) return firstRow.length;

  return 24;
}

async function persistAutomationWorkbookChanges(mainWindow, options = {}) {
  const host = mainWindow || (window.opener && !window.opener.closed ? window.opener : window);
  const operation = String(options.operation || 'automation').trim();
  const dryRun = !!options.dryRun;
  const updatedCount = Number(options.updatedCount || 0);

  if (dryRun || updatedCount <= 0) {
    return { persisted: false, mode: 'skipped', reason: dryRun ? 'dry-run' : 'no-updates' };
  }

  try {
    if (host && typeof host.saveToExcel === 'function') {
      await host.saveToExcel();
      console.log(`💾 ${operation}: persisted workbook changes via saveToExcel()`);
      return { persisted: true, mode: 'saveToExcel', reason: '' };
    }

    if (typeof window.saveToExcel === 'function') {
      await window.saveToExcel();
      console.log(`💾 ${operation}: persisted workbook changes via local saveToExcel()`);
      return { persisted: true, mode: 'saveToExcel-local', reason: '' };
    }

    console.warn(`⚠️ ${operation}: no workbook save API found (saveToExcel unavailable)`);
    return { persisted: false, mode: 'unavailable', reason: 'saveToExcel-unavailable' };
  } catch (error) {
    console.error(`❌ ${operation}: workbook persistence failed`, error);
    return { persisted: false, mode: 'error', reason: String(error && error.message ? error.message : error) };
  }
}

function normalizeRowForSchema(rowValues, schemaCount) {
  const normalized = (Array.isArray(rowValues) ? rowValues : []).map((v) => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return String(v);
    if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
    return String(v);
  });

  if (normalized.length > schemaCount) return normalized.slice(0, schemaCount);
  if (normalized.length < schemaCount) return normalized.concat(new Array(schemaCount - normalized.length).fill(''));
  return normalized;
}

function canUseTargetScopedDuplicateCache(mainWindow) {
  const host = mainWindow || (window.opener && !window.opener.closed ? window.opener : window);
  const target = host && host.__editModeTarget && typeof host.__editModeTarget === 'object' ? host.__editModeTarget : null;
  const loadedKey = String((host && host.__editModeLoadedTargetKey) || window.__editModeLoadedTargetKey || '').trim();
  const targetKey = target
    ? `${String(target.filePath || '').trim()}|${String(target.tableName || '').trim()}`
    : '';
  return Boolean(loadedKey && targetKey && loadedKey === targetKey && Array.isArray(host && host.adventuresData));
}

function buildFallbackSchemaRow(location, placeId, details, schemaCount) {
  const activeCols = getActiveCols(window.opener && !window.opener.closed ? window.opener : window);
  const row = new Array(schemaCount).fill('');
  row[activeCols.NAME] = location || '';
  row[activeCols.PLACE_ID] = placeId || '';
  row[activeCols.WEBSITE] = details?.website || '';
  row[activeCols.HOURS] = details?.hours || '';
  row[activeCols.ADDRESS] = details?.address || '';
  row[activeCols.PHONE] = details?.phone || '';
  row[activeCols.RATING] = details?.rating || '';
  row[activeCols.DIRECTIONS] = details?.directions || `https://www.google.com/maps/place/?q=place_id:${placeId || ''}`;
  return row;
}

/**
 * Helper: Delay execution (for rate limiting)
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Helper: Update data in Google Sheet via Apps Script
 */
function updateSheetData(updateRanges) {
  return new Promise((resolve, reject) => {
    const mainWindow = window.opener && !window.opener.closed ? window.opener : window;

    // Check if Apps Script is available
    if (typeof mainWindow.google !== 'undefined' &&
        typeof mainWindow.google.script !== 'undefined' &&
        typeof mainWindow.google.script.run !== 'undefined') {
      console.log(`💾 Sending ${updateRanges.length} range updates to Google Sheet...`);

      mainWindow.google.script.run
        .withSuccessHandler((result) => {
          console.log('✅ Google Sheet updated successfully:', result);
          resolve({ success: true, message: result });
        })
        .withFailureHandler((error) => {
          console.warn('⚠️ Google Sheet update error:', error);
          reject({ success: false, error: error });
        })
        .updateAdventuresData(updateRanges);
    } else {
      reject({ success: false, error: 'Apps Script not available' });
    }
  });
}

function normalizeHoursForBulkOps(value, mainWindow) {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  const host = mainWindow && typeof mainWindow === 'object' ? mainWindow : window;
  if (host && typeof host.normalizeOperationHours === 'function') {
    try {
      return String(host.normalizeOperationHours(value) || '').trim();
    } catch (_error) {}
  }
  if (Array.isArray(value)) return value.map((entry) => String(entry || '').trim()).filter(Boolean).join('; ');
  if (typeof value === 'object') {
    if (Array.isArray(value.weekdayDescriptions)) {
      return value.weekdayDescriptions.map((entry) => String(entry || '').trim()).filter(Boolean).join('; ');
    }
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const normalized = days
      .map((day) => {
        const resolved = value[day] || value[day.toLowerCase()];
        return resolved ? `${day}: ${resolved}` : '';
      })
      .filter(Boolean)
      .join('; ');
    return normalized || String(value.text || value.periods || '').trim() || JSON.stringify(value);
  }
  return String(value).trim();
}

function buildDescriptionFromGoogleDetails(details) {
  const safe = details && typeof details === 'object' ? details : {};
  const direct = String(safe.description || '').trim();
  if (direct) return direct;

  const reviewTexts = Array.isArray(safe.reviews)
    ? safe.reviews
        .map((review) => {
          if (!review) return '';
          if (typeof review === 'string') return review.trim();
          if (review.text && typeof review.text === 'object' && review.text.text) return String(review.text.text).trim();
          return String(review.text || review.originalText || review.snippet || '').trim();
        })
        .filter(Boolean)
    : [];
  if (reviewTexts.length) {
    return reviewTexts.slice(0, 2).join(' ').trim();
  }

  const businessType = String(safe.businessType || '').trim().replace(/^[\p{So}]\s/u, '');
  const rating = safe.rating != null ? String(safe.rating).trim() : '';
  const ratingsTotal = safe.userRatingsTotal != null ? String(safe.userRatingsTotal).trim() : '';
  let fallback = businessType;
  if (rating) fallback += `${fallback ? ' • ' : ''}Rated ${rating}★`;
  if (ratingsTotal) fallback += `${fallback ? ' ' : ''}(${ratingsTotal} reviews)`;
  return fallback.trim();
}

function normalizePlaceDetailsForBulkOps(placeId, details, mainWindow) {
  const safe = details && typeof details === 'object' ? details : {};
  return {
    website: String(safe.website || safe.websiteURI || '').trim(),
    phone: String(safe.phone || safe.internationalPhoneNumber || '').trim(),
    hours: normalizeHoursForBulkOps(safe.hours || safe.regularOpeningHours || safe.weekdayDescriptions || '', mainWindow),
    address: String(safe.address || safe.formattedAddress || '').trim(),
    rating: safe.rating != null ? String(safe.rating).trim() : '',
    description: buildDescriptionFromGoogleDetails(safe),
    directions: String(safe.directions || '').trim() || `https://www.google.com/maps/place/?q=place_id:${placeId}`,
    businessType: String(safe.businessType || '').trim(),
    reviews: Array.isArray(safe.reviews) ? safe.reviews : [],
    coordinates: safe.coordinates || null
  };
}

window.copyDescriptionPreviewText = window.copyDescriptionPreviewText || async function() {
  const items = Array.isArray(window.__lastDescriptionPreviewItems) ? window.__lastDescriptionPreviewItems : [];
  const text = items.length
    ? items.map((item, index) => `${index + 1}. ${String(item && item.name || '(no name)').trim()}\n${String(item && item.description || '').trim()}`).join('\n\n')
    : '';
  window.__lastDescriptionPreviewCopiedText = text;
  if (!text) {
    return { ok: false, reason: 'empty' };
  }

  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
    } else {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', 'readonly');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.focus();
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
    }
    return { ok: true, text };
  } catch (error) {
    return { ok: false, reason: String(error && error.message ? error.message : error), text };
  }
};

function hasMeaningfulBulkOpsDetails(details) {
  const safe = details && typeof details === 'object' ? details : {};
  return Boolean(
    String(safe.website || '').trim()
    || String(safe.phone || '').trim()
    || String(safe.hours || '').trim()
    || String(safe.address || '').trim()
    || String(safe.rating || '').trim()
    || String(safe.description || '').trim()
    || safe.coordinates
    || (Array.isArray(safe.reviews) && safe.reviews.length)
  );
}

function getCachedPlaceDetailsFromRows(placeId, mainWindow) {
  const rows = Array.isArray(mainWindow?.adventuresData)
    ? mainWindow.adventuresData
    : (Array.isArray(window.adventuresData) ? window.adventuresData : []);
  if (!rows.length) return null;
  const cols = getActiveCols(mainWindow);
  const match = rows.find((entry) => {
    const values = entry && entry.values ? entry.values[0] : entry;
    const candidate = values && values[cols.PLACE_ID] != null ? String(values[cols.PLACE_ID]).trim() : '';
    return candidate === String(placeId || '').trim();
  });
  if (!match) return null;
  const values = match && match.values ? match.values[0] : match;
  return {
    website: String(values?.[cols.WEBSITE] || '').trim(),
    phone: String(values?.[cols.PHONE] || '').trim(),
    hours: String(values?.[cols.HOURS] || '').trim(),
    address: String(values?.[cols.ADDRESS] || '').trim(),
    rating: String(values?.[cols.RATING] || '').trim(),
    description: String(values?.[cols.DESCRIPTION] || '').trim(),
    directions: `https://www.google.com/maps/place/?q=place_id:${placeId}`
  };
}

/**
 * Helper: Get place details from Google Places API with retry logic.
 * Prefer live Google details first, then fall back to cached row data.
 */
async function getPlaceDetailsFromAPI(placeId, retryCount = 0, maxRetries = 1) {
  try {
    const mainWindow = window.opener && !window.opener.closed ? window.opener : window;

    // PRIORITY 1: Use the existing Google details helper when available.
    if (mainWindow && typeof mainWindow.getPlaceDetails === 'function') {
      try {
        const fallbackResult = await mainWindow.getPlaceDetails(placeId);
        const normalizedFallback = normalizePlaceDetailsForBulkOps(placeId, fallbackResult, mainWindow);
        if (hasMeaningfulBulkOpsDetails(normalizedFallback)) {
          console.log(`✅ Got data from fallback function for ${placeId}`);
          return normalizedFallback;
        }
      } catch (fallbackErr) {
        console.debug(`📍 Fallback attempt failed: ${fallbackErr.message}`);
      }
    }

    // Support direct-window execution when the helper lives in this window instead of the opener.
    if (typeof window.getPlaceDetails === 'function' && window.getPlaceDetails !== mainWindow?.getPlaceDetails) {
      try {
        const directResult = await window.getPlaceDetails(placeId);
        const normalizedDirect = normalizePlaceDetailsForBulkOps(placeId, directResult, mainWindow);
        if (hasMeaningfulBulkOpsDetails(normalizedDirect)) {
          console.log(`✅ Got data from local window.getPlaceDetails for ${placeId}`);
          return normalizedDirect;
        }
      } catch (directErr) {
        console.debug(`📍 Direct getPlaceDetails failed: ${directErr.message}`);
      }
    }

    // PRIORITY 2: Check local row cache only after live enrichment attempts.
    const cached = getCachedPlaceDetailsFromRows(placeId, mainWindow);
    if (hasMeaningfulBulkOpsDetails(cached)) {
      console.log(`✅ Using cached row data for ${placeId}`);
      return cached;
    }

    // PRIORITY 3: Google Places API - PERMANENTLY DISABLED
    // ⚠️ API key has domain/referrer restrictions, returns 400 errors systematically.
    // Skipping entirely to avoid console pollution. Use fallback mechanisms above.

    // FALLBACK: Return empty data (don't crash)
    return {
      website: '',
      phone: '',
      hours: '',
      address: '',
      rating: '',
      description: '',
      directions: `https://www.google.com/maps/place/?q=place_id:${placeId}`
    };
  } catch (err) {
    console.warn(`⚠️ Error in getPlaceDetailsFromAPI: ${err.message}`);
    return {
      website: '',
      phone: '',
      hours: '',
      address: '',
      rating: '',
      description: '',
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
    const activeCols = getActiveCols(window.opener && !window.opener.closed ? window.opener : window);
    const name = data.values?.[0]?.[activeCols.NAME] || '';
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

        let resolved;
        try {
          if (typeof window.resolvePlaceInputWithGoogleData === 'function') {
            resolved = await window.resolvePlaceInputWithGoogleData(type, location);
          } else {
            throw new Error('Shared place resolver is not available');
          }
        } catch (resolveErr) {
          console.error(`❌ Could not resolve ${location}:`, resolveErr);
          failCount++;
          results.push({
            location,
            success: false,
            error: resolveErr.message
          });
          continue;
        }

        const placeId = resolved.placeId;
        const details = {
          ...resolved,
          directions: resolved.directions || `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(placeId)}`
        };

        if (!dryRun) {
          const schemaCount = getSchemaColumnCount(mainWindow);

          if (typeof mainWindow.buildExcelRow !== 'function') {
            throw new Error('Main window buildExcelRow helper is unavailable');
          }

          const rawRowValues = mainWindow.buildExcelRow(placeId, details);
          const rowValues = typeof window.normalizeExcelRowForSchema === 'function'
            ? window.normalizeExcelRowForSchema(rawRowValues, mainWindow)
            : normalizeRowForSchema(rawRowValues, schemaCount);

          if (canUseTargetScopedDuplicateCache(mainWindow)
            && typeof mainWindow.placeExistsInData === 'function'
            && mainWindow.placeExistsInData(rowValues)) {
            throw new Error('This location already exists in Excel');
          }

          if (typeof mainWindow.addRowToExcel === 'function') {
            await mainWindow.addRowToExcel(rowValues);
          } else {
            if (Array.isArray(mainWindow.adventuresData)) {
              mainWindow.adventuresData.push({ values: [rowValues] });
            }

            if (typeof mainWindow.saveToExcel === 'function') {
              await mainWindow.saveToExcel();
            } else {
              throw new Error('Main window Excel save helpers are unavailable');
            }
          }

          if (Array.isArray(mainWindow.adventuresData)) {
            const lastRow = mainWindow.adventuresData[mainWindow.adventuresData.length - 1]?.values?.[0];
            const alreadyAppended = Array.isArray(lastRow) && String(lastRow[1] || '').trim() === placeId;
            if (!alreadyAppended) {
              mainWindow.adventuresData.push({ values: [rowValues] });
            }
          }

          successCount++;
          results.push({
            location,
            placeId,
            success: true,
            status: `Added successfully: ${details.name || location}`
          });
        } else {
          successCount++;
          results.push({
            location,
            placeId,
            success: true,
            status: `[DRY RUN] Would add ${details.name || location}`
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
    const activeCols = getActiveCols(window.opener && !window.opener.closed ? window.opener : window);
    for (let i = 0; i < adventuresData.length; i++) {
      const place = adventuresData[i];
      const values = place.values ? place.values[0] : place;

      if (!values || values.length === 0) {
        skippedCount++;
        continue;
      }

      try {
        if (i > 0) await delay(PLACES_API_DELAY_MS);

        // Ensure all values are strings and trim them
        const name = (values[activeCols.NAME] || '').toString().trim();
        const placeId = (values[activeCols.PLACE_ID] || '').toString().trim();
        const website = (values[activeCols.WEBSITE] || '').toString().trim();
        const phone = (values[activeCols.PHONE] || '').toString().trim();
        const hours = (values[activeCols.HOURS] || '').toString().trim();
        const address = (values[activeCols.ADDRESS] || '').toString().trim();
        const rating = (values[activeCols.RATING] || '').toString().trim();

        const emptyFields = [];
        if (!website) emptyFields.push('Website');
        if (!phone) emptyFields.push('Phone');
        if (!hours) emptyFields.push('Hours');
        if (!address) emptyFields.push('Address');
        if (!rating) emptyFields.push('Rating');

        if (emptyFields.length === 0) {
          results.push({
            name: name || '(no name)',
            status: 'complete',
            message: 'All fields populated'
          });
          skippedCount++;
          continue;
        }

        if (!placeId || !placeId.startsWith('ChI')) {
          results.push({
            name: name || '(no name)',
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
            values[activeCols.WEBSITE] = details.website;
            fieldsCorrected.push('Website');
          }
          if (!phone && details.phone) {
            values[activeCols.PHONE] = details.phone;
            fieldsCorrected.push('Phone');
          }
          if (!hours && details.hours) {
            values[activeCols.HOURS] = details.hours;
            fieldsCorrected.push('Hours');
          }
          if (!address && details.address) {
            values[activeCols.ADDRESS] = details.address;
            fieldsCorrected.push('Address');
          }
          if (!rating && details.rating) {
            values[activeCols.RATING] = details.rating;
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
          name: name || '(no name)',
          status: 'updated',
          missingFields: emptyFields,
          correctedFields: fieldsCorrected,
          message: `${fieldsCorrected.length > 0 ? 'Corrected' : 'Attempted'}: ${fieldsCorrected.join(', ') || 'no API data'}`
        });
      } catch (err) {
        console.error(`❌ Error processing ${name || '(unknown)'}:`, err);
        results.push({
          name: name || '(unknown)',
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

    const persistence = await persistAutomationWorkbookChanges(mainWindow, {
      operation: 'populate-missing-fields',
      dryRun,
      updatedCount
    });

    // Check if Google Places API key is configured
    const apiKeyMissing = !window.GOOGLE_PLACES_API_KEY;
    const apiKeyWarning = apiKeyMissing ? `
      <div style="padding: 12px; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 4px; margin-bottom: 12px; color: #7f1d1d;">
        <strong>⚠️ GOOGLE PLACES API NOT CONFIGURED:</strong> Limited data could be fetched from Google to populate fields.
        <br><br><strong>To fix this:</strong>
        <ol style="margin: 8px 0; padding-left: 20px; font-size: 12px;">
          <li>Get a Google Places API key from <a href="https://console.cloud.google.com" target="_blank" style="color: #1e40af;">Google Cloud Console</a></li>
          <li>Enable the Places API and Maps API in your project</li>
          <li>Set window.GOOGLE_PLACES_API_KEY = 'YOUR_KEY_HERE' before running this operation</li>
          <li>Retry the populate missing fields operation</li>
        </ol>
        <br><strong>Status:</strong> ${errorCount > 0 ? '❌ API calls failed - will use fallback data' : '✅ Operation completed with available data'}
      </div>
    ` : '';

    const resultHTML = `
      ${apiKeyWarning}
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
        <div style="font-size:12px; color:${persistence.persisted ? '#047857' : '#92400e'}; margin-bottom:10px;">
          💾 Workbook write: ${persistence.persisted ? 'saved to Excel' : `not persisted (${persistence.reason || persistence.mode})`}
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
      dryRun,
      persisted: !!persistence.persisted,
      persistMode: persistence.mode,
      persistReason: persistence.reason
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
    const activeCols = getActiveCols(mainWindow);
    for (let i = 0; i < adventuresData.length; i++) {
      const place = adventuresData[i];
      const values = place.values ? place.values[0] : place;

      if (!values || values.length === 0) {
        skippedCount++;
        continue;
      }

      try {
        if (i > 0) await delay(PLACES_API_DELAY_MS);

        const name = values[activeCols.NAME] || '';
        const placeId = values[activeCols.PLACE_ID] || '';
        const currentHours = values[activeCols.HOURS] || '';

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
          values[activeCols.HOURS] = details.hours;
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

    const persistence = await persistAutomationWorkbookChanges(mainWindow, {
      operation: 'update-hours-only',
      dryRun,
      updatedCount
    });

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
        <div style="font-size:12px; color:${persistence.persisted ? '#047857' : '#92400e'}; margin-bottom:10px;">
          💾 Workbook write: ${persistence.persisted ? 'saved to Excel' : `not persisted (${persistence.reason || persistence.mode})`}
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
      dryRun,
      persisted: !!persistence.persisted,
      persistMode: persistence.mode,
      persistReason: persistence.reason
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
// SECTION 6: M365 EXCEL WRITE INTEGRATION
// ============================================================
// Provides methods to write refreshed data back to M365 Excel

/**
 * Write updated place details back to M365 Excel row
 * Uses the same Office.js approach as bulk add operations
 */
window.writeUpdatedPlaceToM365 = async function(rowIndex, placeData) {
  return new Promise((resolve, reject) => {
    try {
      // Get reference to main window if in edit mode
      const mainWindow = window.opener && !window.opener.closed ? window.opener : window;

      // Check if Office.js context is available
      if (typeof Office !== 'undefined' &&
          typeof Office.onReady !== 'undefined' &&
          typeof Excel !== 'undefined') {

        Excel.run(async (context) => {
          try {
            const sheet = context.workbook.worksheets.getActiveWorksheet();

            // Calculate the actual row number (assuming row 1 is headers)
            const excelRow = rowIndex + 2;

            // Build the range of cells to update
            const range = sheet.getRange(`A${excelRow}:P${excelRow}`);

            // Prepare the data in column order matching COLS definition
            const rowData = [[
              placeData.name || '',           // Column A (NAME)
              placeData.placeId || '',        // Column B (PLACE_ID)
              placeData.website || '',        // Column C (WEBSITE)
              placeData.phone || '',          // Column D (PHONE)
              placeData.hours || '',          // Column E (HOURS)
              '',                             // Column F (unused)
              '',                             // Column G (unused)
              '',                             // Column H (unused)
              '',                             // Column I (unused)
              '',                             // Column J (unused)
              '',                             // Column K (unused)
              placeData.address || '',        // Column L (ADDRESS)
              '',                             // Column M (unused)
              placeData.rating || '',         // Column N (RATING)
              '',                             // Column O (unused)
              placeData.directions || ''      // Column P (DIRECTIONS)
            ]];

            range.values = rowData;

            await context.sync();

            console.log(`✅ Updated M365 row ${excelRow}: ${placeData.name}`);
            resolve({
              success: true,
              message: `Updated row ${excelRow}`,
              rowIndex,
              location: placeData.name
            });

          } catch (err) {
            console.error(`❌ Error updating M365 row ${rowIndex}:`, err);
            reject({
              success: false,
              error: err.message,
              rowIndex
            });
          }
        });

      } else {
        // Office.js not available - provide guidance
        console.warn(`⚠️ Office.js not available for row ${rowIndex}`);
        resolve({
          success: false,
          message: 'Office.js context not available. Data updates available in browser memory only.',
          rowIndex,
          note: 'User should manually copy-paste results to Excel'
        });
      }

    } catch (error) {
      console.error(`❌ Error in writeUpdatedPlaceToM365:`, error);
      reject({
        success: false,
        error: error.message,
        rowIndex
      });
    }
  });
};

/**
 * Batch write multiple updated rows to M365 Excel
 */
window.writeBatchPlacesToM365 = async function(placesData) {
  console.log(`📝 Writing ${placesData.length} place updates to M365 Excel...`);

  return new Promise((resolve, reject) => {
    try {
      if (typeof Office !== 'undefined' &&
          typeof Excel !== 'undefined') {

        Excel.run(async (context) => {
          try {
            const sheet = context.workbook.worksheets.getActiveWorksheet();
            let successCount = 0;
            let failCount = 0;

            for (let i = 0; i < placesData.length; i++) {
              const placeData = placesData[i];
              const excelRow = placeData.rowIndex + 2;

              try {
                const range = sheet.getRange(`A${excelRow}:P${excelRow}`);

                const rowData = [[
                  placeData.name || '',
                  placeData.placeId || '',
                  placeData.website || '',
                  placeData.phone || '',
                  placeData.hours || '',
                  '',
                  '',
                  '',
                  '',
                  '',
                  '',
                  placeData.address || '',
                  '',
                  placeData.rating || '',
                  '',
                  placeData.directions || ''
                ]];

                range.values = rowData;
                successCount++;

              } catch (err) {
                console.warn(`⚠️ Skipped row ${excelRow}:`, err.message);
                failCount++;
              }
            }

            await context.sync();

            console.log(`✅ Batch write complete: ${successCount} updated, ${failCount} failed`);
            resolve({
              success: true,
              successCount,
              failCount,
              totalCount: placesData.length
            });

          } catch (err) {
            console.error(`❌ Error in batch write:`, err);
            reject({
              success: false,
              error: err.message
            });
          }
        });

      } else {
        console.warn(`⚠️ Office.js not available for batch write`);
        resolve({
          success: false,
          message: 'Office.js context not available',
          note: 'Data available in browser memory. User should copy-paste to Excel.'
        });
      }

    } catch (error) {
      console.error(`❌ Error in writeBatchPlacesToM365:`, error);
      reject({
        success: false,
        error: error.message
      });
    }
  });
};

console.log('✅ M365 Excel Write Integration ready');

// ============================================================
// SECTION 7: UPDATE ALL DESCRIPTIONS
// ============================================================

/**
 * Update description fields for all locations using Google Places API.
 * Only fills empty descriptions unless overwrite=true.
 */
window.handleUpdateAllDescriptions = async function(displayElement, dryRun = false, overwrite = false) {
  console.log(`📝 Starting update descriptions, dryRun=${dryRun}, overwrite=${overwrite}`);

  if (!displayElement) return { success: false, error: 'No display element' };

  const mainWindow = window.opener && !window.opener.closed ? window.opener : window;
  const adventuresData = mainWindow.adventuresData || window.adventuresData;

  if (!adventuresData || adventuresData.length === 0) {
    displayElement.innerHTML = `<div style="padding:16px;background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;color:#7f1d1d;"><strong>❌ Error:</strong> No data available.</div>`;
    return { success: false, error: 'No data available' };
  }

  const activeCols = getActiveCols(mainWindow);
  const results = [];
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const previewItems = [];

  const escapeHtml = (value) => String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const truncateText = (value, maxLen = 180) => {
    const text = String(value == null ? '' : value).trim();
    if (text.length <= maxLen) return text;
    return `${text.slice(0, Math.max(0, maxLen - 1)).trim()}…`;
  };

  const buildPreviewHtml = () => {
    if (!previewItems.length) return '';
    window.__lastDescriptionPreviewItems = previewItems.slice(0, 3).map((item) => ({
      name: String(item && item.name || '').trim(),
      description: String(item && item.description || '').trim()
    }));
    return `<div style="margin-top:12px;padding:12px;background:#ffffff;border:1px solid #d1fae5;border-radius:8px;">`
      + `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px;">`
      + `<div style="font-weight:600;color:#065f46;">Preview of updated descriptions</div>`
      + `<button type="button" onclick="window.copyDescriptionPreviewText && window.copyDescriptionPreviewText()" style="padding:6px 10px;border:1px solid #a7f3d0;border-radius:6px;background:#ecfdf5;color:#065f46;font-size:12px;font-weight:600;cursor:pointer;">📋 Copy preview text</button>`
      + `</div>`
      + previewItems.slice(0, 3).map((item, index) => {
        const label = dryRun ? 'Would set' : 'Set';
        return `<div style="${index > 0 ? 'margin-top:10px;padding-top:10px;border-top:1px solid #ecfdf5;' : ''}">`
          + `<div style="font-size:12px;font-weight:600;color:#1f2937;">${escapeHtml(item.name || '(no name)')}</div>`
          + `<div style="font-size:12px;color:#4b5563;line-height:1.5;margin-top:4px;">${label}: ${escapeHtml(truncateText(item.description, 220))}</div>`
          + `</div>`;
      }).join('')
      + `</div>`;
  };

  const updateDisplay = (status) => { displayElement.innerHTML = status; };

  updateDisplay(`<div style="padding:16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;">
    <div style="font-weight:600;color:#1e40af;margin-bottom:12px;">${dryRun ? '🧪 DRY RUN – Preview' : '⏳ Processing'} Update Descriptions${overwrite ? ' (overwrite all)' : ' (missing only)'}</div>
    <div style="font-size:14px;color:#1f2937;">📊 Total locations: ${adventuresData.length}</div>
    <div style="margin-top:8px;padding:8px;background:rgba(59,130,246,0.1);border-radius:4px;font-size:12px;color:#1f2937;">⏳ Scanning descriptions…</div>
  </div>`);

  try {
    for (let i = 0; i < adventuresData.length; i++) {
      const place = adventuresData[i];
      const values = place.values ? place.values[0] : place;
      if (!values || values.length === 0) { skippedCount++; continue; }

      try {
        if (i > 0) await delay(PLACES_API_DELAY_MS);

        const name = (values[activeCols.NAME] || '').toString().trim();
        const placeId = (values[activeCols.PLACE_ID] || '').toString().trim();
        const existingDesc = (values[activeCols.DESCRIPTION] || '').toString().trim();

        if (!overwrite && existingDesc) {
          results.push({ name: name || '(no name)', status: 'skipped', message: 'Already has description' });
          skippedCount++;
          continue;
        }

        if (!placeId || !placeId.startsWith('ChI')) {
          results.push({ name: name || '(no name)', status: 'skipped', message: 'No valid Place ID' });
          skippedCount++;
          continue;
        }

        const details = await getPlaceDetailsFromAPI(placeId);
        const newDesc = (details && details.description) ? details.description.trim() : '';

        // Fallback: generate a basic description from name + location data
        const generatedDesc = newDesc || (() => {
          const city = (values[activeCols.CITY] || '').toString().trim();
          const state = (values[activeCols.STATE] || '').toString().trim();
          const rating = (values[activeCols.RATING] || '').toString().trim();
          if (!name) return '';
          let desc = name;
          if (city && state) desc += ` is located in ${city}, ${state}.`;
          else if (city) desc += ` is located in ${city}.`;
          if (rating) desc += ` Google Rating: ${rating}.`;
          return desc;
        })();

        if (!dryRun && generatedDesc) {
          values[activeCols.DESCRIPTION] = generatedDesc;
          updatedCount++;
          results.push({ name, status: 'updated', message: `Set description (${generatedDesc.length} chars)` });
          if (previewItems.length < 3) {
            previewItems.push({ name: name || '(no name)', description: generatedDesc });
          }
        } else if (dryRun && generatedDesc) {
          updatedCount++;
          results.push({ name, status: 'would-update', message: `Would set: "${generatedDesc.slice(0, 60)}…"` });
          if (previewItems.length < 3) {
            previewItems.push({ name: name || '(no name)', description: generatedDesc });
          }
        } else {
          skippedCount++;
          results.push({ name, status: 'skipped', message: 'No description available from API' });
        }
      } catch (e) {
        errorCount++;
        results.push({ name: '(error)', status: 'error', message: e.message });
      }
    }

    const persistence = await persistAutomationWorkbookChanges(mainWindow, {
      operation: 'update-descriptions',
      dryRun,
      updatedCount
    });

    updateDisplay(`<div style="padding:16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;">
      <div style="font-weight:600;color:#166534;margin-bottom:8px;">${dryRun ? '🧪 Dry Run Complete' : '✅ Complete'} – Update Descriptions</div>
      <div style="font-size:13px;color:#374151;">✅ Updated: ${updatedCount} &nbsp; ⏭ Skipped: ${skippedCount} &nbsp; ❌ Errors: ${errorCount}</div>
      <div style="font-size:12px;color:${persistence.persisted ? '#047857' : '#92400e'};margin-top:8px;">💾 Workbook write: ${persistence.persisted ? 'saved to Excel' : `not persisted (${persistence.reason || persistence.mode})`}</div>
      ${buildPreviewHtml()}
    </div>`);

    return { success: true, updatedCount, skippedCount, errorCount, results, dryRun, previewItems: previewItems.slice(), persisted: !!persistence.persisted, persistMode: persistence.mode, persistReason: persistence.reason };
  } catch (err) {
    console.error('❌ Error updating descriptions:', err);
    updateDisplay(`<div style="padding:16px;background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;color:#7f1d1d;"><strong>❌ Error:</strong> ${err.message}</div>`);
    return { success: false, error: err.message };
  }
};

window.handleUpdateAllDescriptionsEnhanced = window.handleUpdateAllDescriptions;

console.log('✅ Update All Descriptions ready');

// ============================================================
// SECTION 8: FORCE UPDATE ALL FIELDS
// ============================================================

/**
 * Force-refresh all fields for every location regardless of existing data.
 */
window.handleForceUpdateAllFields = async function(displayElement, dryRun = false) {
  console.log(`🔄 Starting force-update all fields, dryRun=${dryRun}`);

  if (!displayElement) return { success: false, error: 'No display element' };

  const mainWindow = window.opener && !window.opener.closed ? window.opener : window;
  const adventuresData = mainWindow.adventuresData || window.adventuresData;

  if (!adventuresData || adventuresData.length === 0) {
    displayElement.innerHTML = `<div style="padding:16px;background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;color:#7f1d1d;"><strong>❌ Error:</strong> No data available.</div>`;
    return { success: false, error: 'No data available' };
  }

  const activeCols = getActiveCols(mainWindow);
  const results = [];
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  const updateDisplay = (status) => { displayElement.innerHTML = status; };

  updateDisplay(`<div style="padding:16px;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;">
    <div style="font-weight:600;color:#9a3412;margin-bottom:12px;">${dryRun ? '🧪 DRY RUN – Preview' : '⏳ Processing'} Force Update All Fields</div>
    <div style="font-size:14px;color:#1f2937;">📊 Total locations: ${adventuresData.length}</div>
    <div style="margin-top:8px;padding:8px;background:rgba(251,146,60,0.1);border-radius:4px;font-size:12px;color:#1f2937;">⚠️ This will overwrite existing data with fresh data from Google Places API.</div>
  </div>`);

  try {
    for (let i = 0; i < adventuresData.length; i++) {
      const place = adventuresData[i];
      const values = place.values ? place.values[0] : place;
      if (!values || values.length === 0) { skippedCount++; continue; }

      try {
        if (i > 0) await delay(PLACES_API_DELAY_MS);

        const name = (values[activeCols.NAME] || '').toString().trim();
        const placeId = (values[activeCols.PLACE_ID] || '').toString().trim();

        if (!placeId || !placeId.startsWith('ChI')) {
          results.push({ name: name || '(no name)', status: 'skipped', message: 'No valid Place ID' });
          skippedCount++;
          continue;
        }

        const details = await getPlaceDetailsFromAPI(placeId);
        const updated = [];

        if (!dryRun) {
          if (details.website) { values[activeCols.WEBSITE] = details.website; updated.push('Website'); }
          if (details.phone) { values[activeCols.PHONE] = details.phone; updated.push('Phone'); }
          if (details.hours) { values[activeCols.HOURS] = details.hours; updated.push('Hours'); }
          if (details.address) { values[activeCols.ADDRESS] = details.address; updated.push('Address'); }
          if (details.rating) { values[activeCols.RATING] = details.rating; updated.push('Rating'); }
          if (details.description) { values[activeCols.DESCRIPTION] = details.description; updated.push('Description'); }

          if (updated.length > 0) {
            updatedCount++;
            results.push({ name, status: 'updated', message: `Updated: ${updated.join(', ')}` });
          } else {
            skippedCount++;
            results.push({ name, status: 'skipped', message: 'No new data from API' });
          }
        } else {
          const preview = [];
          if (details.website) preview.push('Website');
          if (details.phone) preview.push('Phone');
          if (details.hours) preview.push('Hours');
          if (details.address) preview.push('Address');
          if (details.rating) preview.push('Rating');
          if (details.description) preview.push('Description');
          if (preview.length > 0) {
            updatedCount++;
            results.push({ name, status: 'would-update', message: `Would update: ${preview.join(', ')}` });
          } else {
            skippedCount++;
            results.push({ name, status: 'skipped', message: 'No new data from API' });
          }
        }
      } catch (e) {
        errorCount++;
        results.push({ name: '(error)', status: 'error', message: e.message });
      }
    }

    const persistence = await persistAutomationWorkbookChanges(mainWindow, {
      operation: 'force-update-all-fields',
      dryRun,
      updatedCount
    });

    updateDisplay(`<div style="padding:16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;">
      <div style="font-weight:600;color:#166534;margin-bottom:8px;">${dryRun ? '🧪 Dry Run Complete' : '✅ Complete'} – Force Update All Fields</div>
      <div style="font-size:13px;color:#374151;">✅ Updated: ${updatedCount} &nbsp; ⏭ Skipped: ${skippedCount} &nbsp; ❌ Errors: ${errorCount}</div>
      <div style="font-size:12px;color:${persistence.persisted ? '#047857' : '#92400e'};margin-top:8px;">💾 Workbook write: ${persistence.persisted ? 'saved to Excel' : `not persisted (${persistence.reason || persistence.mode})`}</div>
    </div>`);

    return { success: true, updatedCount, skippedCount, errorCount, results, dryRun, persisted: !!persistence.persisted, persistMode: persistence.mode, persistReason: persistence.reason };
  } catch (err) {
    console.error('❌ Error force-updating fields:', err);
    updateDisplay(`<div style="padding:16px;background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;color:#7f1d1d;"><strong>❌ Error:</strong> ${err.message}</div>`);
    return { success: false, error: err.message };
  }
};

window.handleForceUpdateAllFieldsEnhanced = window.handleForceUpdateAllFields;

console.log('✅ Force Update All Fields ready');

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

