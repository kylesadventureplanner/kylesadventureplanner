/**
 * CONSOLIDATED AUTOMATION FEATURES SYSTEM v7.0.141
 * =================================================
 * Stable automation runtime for edit mode actions.
 */

console.log('🤖 Consolidated Automation Features System v7.0.141 Loading...');

(function() {
  function getMainWindow() {
    return window.opener && !window.opener.closed ? window.opener : window;
  }

  function safeString(value) {
    return String(value == null ? '' : value).trim();
  }

  function looksLikePlaceId(value) {
    return /^ChI[A-Za-z0-9_-]{6,}$/i.test(safeString(value));
  }

  function extractPlaceId(raw) {
    const text = safeString(raw);
    if (!text) return '';

    const directMatch = text.match(/\bChI[A-Za-z0-9_-]{6,}\b/);
    if (directMatch) return directMatch[0];

    const queryPlaceIdMatch = text.match(/[?&]query_place_id=([^&#]+)/i);
    if (queryPlaceIdMatch) return decodeURIComponent(queryPlaceIdMatch[1]);

    const placeIdMatch = text.match(/place_id[:=]([^&#]+)/i);
    if (placeIdMatch) return decodeURIComponent(placeIdMatch[1]);

    return '';
  }

  function extractSearchQuery(inputType, rawInput) {
    const value = safeString(rawInput);
    if (!value) return '';

    if (inputType === 'website') {
      try {
        const normalized = /^https?:\/\//i.test(value) ? value : `https://${value}`;
        return new URL(normalized).hostname.replace(/^www\./i, '');
      } catch (_error) {
        return value;
      }
    }

    if (inputType === 'placeUrl') {
      const placePathMatch = value.match(/\/maps\/place\/([^/?#]+)/i);
      if (placePathMatch && placePathMatch[1]) {
        return decodeURIComponent(placePathMatch[1]).replace(/\+/g, ' ');
      }

      const queryMatch = value.match(/[?&](q|query)=([^&#]+)/i);
      if (queryMatch && queryMatch[2]) {
        return decodeURIComponent(queryMatch[2]).replace(/\+/g, ' ');
      }
    }

    return value;
  }

  function inferBusinessType(types) {
    const list = Array.isArray(types) ? types : [];
    const typeMap = {
      restaurant: '🍽️ Restaurant',
      cafe: '☕ Cafe',
      bar: '🍺 Bar',
      hotel: '🏨 Hotel',
      lodging: '🛏️ Lodging',
      park: '🌳 Park',
      hiking_area: '🥾 Hiking',
      museum: '🏛️ Museum',
      shopping_mall: '🛍️ Shopping',
      gym: '💪 Gym',
      hospital: '🏥 Hospital',
      pharmacy: '💊 Pharmacy',
      store: '🏪 Store',
      supermarket: '🛒 Supermarket'
    };

    for (const type of list) {
      if (typeMap[type]) return typeMap[type];
    }
    return '';
  }

  function normalizeResolvedDetails(placeId, details, searchResult, rawInput) {
    const safeDetails = details && typeof details === 'object' ? details : {};
    const safeSearch = searchResult && typeof searchResult === 'object' ? searchResult : {};
    const resolvedPlaceId = safeString(placeId || safeDetails.placeId || safeSearch.placeId || extractPlaceId(rawInput));
    const name = safeString(safeDetails.name || safeSearch.name || rawInput);
    const address = safeString(safeDetails.address || safeSearch.address);

    return {
      placeId: resolvedPlaceId,
      name,
      address,
      phone: safeString(safeDetails.phone || safeSearch.phone),
      website: safeString(safeDetails.website || safeSearch.website),
      rating: safeDetails.rating ?? safeSearch.rating ?? '',
      userRatingsTotal: safeDetails.userRatingsTotal ?? safeSearch.reviewCount ?? 0,
      hours: safeDetails.hours || safeSearch.hours || '',
      businessStatus: safeString(safeDetails.businessStatus || safeSearch.businessStatus || 'UNKNOWN'),
      businessType: safeString(safeDetails.businessType || inferBusinessType(safeDetails.types || safeSearch.types)),
      types: Array.isArray(safeDetails.types) ? safeDetails.types : (Array.isArray(safeSearch.types) ? safeSearch.types : []),
      coordinates: safeDetails.coordinates || safeSearch.coordinates || null,
      directions: resolvedPlaceId ? `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(resolvedPlaceId)}` : ''
    };
  }

  window.resolvePlaceInputWithGoogleData = window.resolvePlaceInputWithGoogleData || async function(inputType, inputValue) {
    const mainWindow = getMainWindow();
    const rawValue = safeString(inputValue);
    if (!rawValue) {
      throw new Error('Please enter a value.');
    }

    let placeId = '';
    let searchResult = null;
    let details = null;

    const extractedPlaceId = extractPlaceId(rawValue);
    const queryText = extractSearchQuery(inputType, rawValue);

    if (typeof mainWindow.resolvePlaceIdFromInput === 'function') {
      try {
        placeId = safeString(await mainWindow.resolvePlaceIdFromInput(inputType, rawValue));
      } catch (resolverError) {
        console.warn(`⚠️ resolvePlaceIdFromInput failed for ${inputType}:`, resolverError.message);
      }
    }

    if (!placeId && (inputType === 'placeId' || inputType === 'placeUrl') && extractedPlaceId) {
      placeId = extractedPlaceId;
    }

    if ((!placeId || !looksLikePlaceId(placeId)) && typeof mainWindow.searchPlaces === 'function' && queryText) {
      const searchResults = await mainWindow.searchPlaces(queryText);
      if (Array.isArray(searchResults) && searchResults.length > 0) {
        searchResult = searchResults[0];
        placeId = safeString(searchResult.placeId || placeId);
      }
    }

    if (!looksLikePlaceId(placeId)) {
      throw new Error(`Could not resolve a valid Google Place ID for "${rawValue}".`);
    }

    if (typeof mainWindow.getPlaceDetails === 'function') {
      details = await mainWindow.getPlaceDetails(placeId);
    }

    if ((!details || !safeString(details.name) || !safeString(details.address)) && !searchResult && typeof mainWindow.searchPlaces === 'function' && queryText) {
      const searchResults = await mainWindow.searchPlaces(queryText);
      if (Array.isArray(searchResults) && searchResults.length > 0) {
        searchResult = searchResults[0];
      }
    }

    const normalized = normalizeResolvedDetails(placeId, details, searchResult, rawValue);
    if (!normalized.placeId || !normalized.name || !normalized.address) {
      throw new Error(`Google returned incomplete details for "${rawValue}". No row was added.`);
    }

    return normalized;
  };

  window.normalizeExcelRowForSchema = window.normalizeExcelRowForSchema || function(rowValues, sourceWindow = getMainWindow()) {
    const schemaCount = Number(
      sourceWindow?.__excelColumnCount ||
      sourceWindow?.adventuresData?.[0]?.values?.[0]?.length ||
      window.__excelColumnCount ||
      24
    );

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
  };

  class EnhancedAutomationFeatures {
    constructor() {
      this.dryRunStates = {
        addSingle: false,
        bulkAdd: false,
        bulkChain: false,
        refreshPlaceIds: false,
        populateMissing: false,
        updateHours: false,
        autoTag: false
      };
      console.log('✅ Enhanced Automation Features initialized');
    }

    validatePlaceInput(input, inputType) {
      const trimmed = safeString(input);
      if (!trimmed) return { isValid: false, error: 'Input cannot be empty' };

      switch (inputType) {
        case 'placeName':
        case 'address':
        case 'website':
        case 'placeUrl':
        case 'placeId':
          return { isValid: true };
        case 'placeNameCity':
          return trimmed.includes(',')
            ? { isValid: true }
            : { isValid: false, error: 'Format: Place Name, City (e.g., Starbucks, Denver)' };
        default:
          return { isValid: false, error: `Unknown input type: ${inputType}` };
      }
    }

    getDryRunState(feature) {
      return !!this.dryRunStates[feature];
    }

    setDryRunState(feature, state) {
      this.dryRunStates[feature] = !!state;
      return this.dryRunStates[feature];
    }

    toggleDryRunState(feature) {
      this.dryRunStates[feature] = !this.dryRunStates[feature];
      return this.dryRunStates[feature];
    }

    displayResults(result, statusDiv) {
      if (!statusDiv) return;
      if (result && result.success) {
        statusDiv.innerHTML = `<div class="status-message status-success">✅ ${result.message || 'Operation completed successfully'}</div>`;
      } else {
        statusDiv.innerHTML = `<div class="status-message status-error">❌ ${(result && result.error) || 'Operation failed'}</div>`;
      }
    }

    async addSinglePlace(input, inputType, dryRun = false) {
      const validation = this.validatePlaceInput(input, inputType);
      if (!validation.isValid) return { success: false, error: validation.error };
      if (dryRun) return { success: true, isDryRun: true, message: `🧪 [DRY RUN] Would add: ${safeString(input)}` };

      try {
        const mainWindow = getMainWindow();
        const details = await window.resolvePlaceInputWithGoogleData(inputType, input);
        const placeId = details.placeId;

        if (typeof mainWindow.buildExcelRow !== 'function') {
          throw new Error('Main window buildExcelRow helper is unavailable.');
        }

        const rowValues = window.normalizeExcelRowForSchema(mainWindow.buildExcelRow(placeId, details), mainWindow);

        if (typeof mainWindow.placeExistsInData === 'function' && mainWindow.placeExistsInData(rowValues)) {
          throw new Error('This location already exists in Excel.');
        }

        if (typeof mainWindow.addRowToExcel === 'function') {
          await mainWindow.addRowToExcel(rowValues);
        } else if (Array.isArray(mainWindow.adventuresData) && typeof mainWindow.saveToExcel === 'function') {
          mainWindow.adventuresData.push({ values: [rowValues] });
          await mainWindow.saveToExcel();
        } else {
          throw new Error('Main window Excel save helpers are unavailable.');
        }

        if (Array.isArray(mainWindow.adventuresData)) {
          const lastRow = mainWindow.adventuresData[mainWindow.adventuresData.length - 1]?.values?.[0];
          const alreadyAppended = Array.isArray(lastRow) && safeString(lastRow[1]) === placeId && safeString(lastRow[0]) === safeString(details.name);
          if (!alreadyAppended) {
            mainWindow.adventuresData.push({ values: [rowValues] });
          }
        }

        return {
          success: true,
          message: `Added ${details.name}`,
          placeName: details.name,
          placeId,
          details
        };
      } catch (error) {
        console.error('❌ Error adding place:', error);
        return { success: false, error: error.message };
      }
    }

    async bulkAddPlaces(placesText, inputType, dryRun = false) {
      const lines = (placesText || '').split('\n').map((line) => line.trim()).filter(Boolean);
      if (lines.length === 0) return { success: false, error: 'No places provided' };

      const results = { success: true, total: lines.length, added: 0, failed: 0, skipped: 0, details: [] };
      for (const line of lines) {
        const result = await this.addSinglePlace(line, inputType, dryRun);
        if (result.success) {
          results.added++;
          results.details.push(`✅ ${result.placeName || line}${result.isDryRun ? ' (dry run)' : ''}`);
        } else {
          results.failed++;
          results.details.push(`❌ ${line}: ${result.error}`);
        }
        await new Promise((resolve) => setTimeout(resolve, 150));
      }

      results.success = results.failed === 0;
      results.message = `Added ${results.added}/${results.total} places (${results.failed} failed, ${results.skipped} skipped)`;
      return results;
    }

    async bulkAddChainLocations(placesText, inputType, dryRun = false) {
      const lines = (placesText || '').split('\n').map((line) => line.trim()).filter(Boolean);
      if (lines.length === 0) return { success: false, error: 'No places provided' };
      if (typeof window.handleBulkAddChainLocationsFixed === 'function') {
        return await window.handleBulkAddChainLocationsFixed(lines, inputType, document.createElement('div'), dryRun);
      }
      if (typeof window.handleBulkAddChainLocationsEnhanced === 'function') {
        return await window.handleBulkAddChainLocationsEnhanced(lines, inputType, document.createElement('div'), dryRun);
      }
      return { success: false, error: 'Bulk chain add system not available' };
    }

    async populateMissingFieldsOnly(dryRun = false) {
      if (typeof window.handlePopulateMissingFieldsEnhanced === 'function') {
        return await window.handlePopulateMissingFieldsEnhanced(document.createElement('div'), dryRun);
      }
      if (typeof window.handlePopulateMissingFields === 'function') {
        return await window.handlePopulateMissingFields(document.createElement('div'), dryRun);
      }
      return { success: false, error: 'Populate missing fields system not available' };
    }

    async populateMissingFields(dryRun = false) {
      return this.populateMissingFieldsOnly(dryRun);
    }

    async updateHoursOnly(dryRun = false) {
      if (typeof window.handleUpdateHoursOnlyEnhanced === 'function') {
        return await window.handleUpdateHoursOnlyEnhanced(document.createElement('div'), dryRun);
      }
      if (typeof window.handleUpdateHoursOnly === 'function') {
        return await window.handleUpdateHoursOnly(document.createElement('div'), dryRun);
      }
      return { success: false, error: 'Update hours system not available' };
    }

    async autoTagAll(dryRun = false) {
      if (typeof window.handleAutoTagAll === 'function') {
        return await window.handleAutoTagAll(dryRun);
      }
      return { success: false, error: 'Auto-tag system not available' };
    }
  }

  window.EnhancedAutomationFeatures = EnhancedAutomationFeatures;
  window.enhancedAutomation = window.enhancedAutomation || new EnhancedAutomationFeatures();

  console.log('✅ Consolidated Automation Features System v7.0.141 Loaded');
})();
