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

  function createShortLinkDiagnostics(inputType, inputValue) {
    const normalizedInput = safeString(inputValue);
    const shortLinkDetected = inputType === 'placeUrl' && /(maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/kgs)/i.test(normalizedInput);
    const requestId = `SL-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

    return {
      enabled: shortLinkDetected,
      id: requestId,
      inputType,
      inputValue: normalizedInput,
      log(stage, message, extra) {
        if (!this.enabled) return;
        if (typeof extra === 'undefined') {
          console.log(`🔎 [${this.id}] ${stage}: ${message}`);
        } else {
          console.log(`🔎 [${this.id}] ${stage}: ${message}`, extra);
        }
      },
      warn(stage, message, extra) {
        if (!this.enabled) return;
        if (typeof extra === 'undefined') {
          console.warn(`⚠️ [${this.id}] ${stage}: ${message}`);
        } else {
          console.warn(`⚠️ [${this.id}] ${stage}: ${message}`, extra);
        }
      }
    };
  }

  function normalizeRawInput(value) {
    return safeString(value)
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/[<>“”"'`]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function safeDecode(value) {
    const text = safeString(value);
    if (!text) return '';
    try {
      return decodeURIComponent(text.replace(/\+/g, ' '));
    } catch (_error) {
      return text;
    }
  }

  function looksLikeUrl(value) {
    return /^(https?:\/\/|www\.|(?:maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/kgs|google\.[a-z.]+\/maps|maps\.google\.[a-z.]+))/i.test(safeString(value));
  }

  function isGoogleShortMapsUrl(value) {
    const url = parseUrlSafely(value);
    if (!url) return false;
    const host = url.hostname.replace(/^www\./i, '').toLowerCase();
    return host === 'maps.app.goo.gl' || host === 'goo.gl' || host === 'g.co';
  }

  function normalizeUrlCandidate(value) {
    const text = safeString(value).replace(/[),.;]+$/g, '');
    if (!text) return '';
    if (/^https?:\/\//i.test(text)) return text;
    if (looksLikeUrl(text)) return `https://${text.replace(/^https?:\/\//i, '')}`;
    return '';
  }

  function extractUrlCandidates(raw) {
    const text = normalizeRawInput(raw);
    if (!text) return [];

    const candidates = new Set();
    const urlMatches = text.match(/https?:\/\/[^\s<>"]+/gi) || [];
    urlMatches.forEach((match) => candidates.add(normalizeUrlCandidate(match)));

    const bareMatches = text.match(/(?:maps\.app\.goo\.gl|goo\.gl\/maps|(?:www\.)?google\.[^\s/]+\/maps[^\s]*|maps\.google\.[^\s/]+[^\s]*)/gi) || [];
    bareMatches.forEach((match) => candidates.add(normalizeUrlCandidate(match)));

    return Array.from(candidates).filter(Boolean);
  }

  function parseUrlSafely(value) {
    const normalized = normalizeUrlCandidate(value);
    if (!normalized) return null;
    try {
      return new URL(normalized);
    } catch (_error) {
      return null;
    }
  }

  function unwrapNestedGoogleUrl(rawUrl, depth = 0) {
    if (depth > 4) return rawUrl;
    const url = parseUrlSafely(rawUrl);
    if (!url) return rawUrl;

    const nestedParamNames = ['url', 'u', 'link', 'continue', 'redirect', 'redirect_url', 'redirect_uri'];
    for (const paramName of nestedParamNames) {
      const nestedValue = url.searchParams.get(paramName);
      if (nestedValue && looksLikeUrl(safeDecode(nestedValue))) {
        return unwrapNestedGoogleUrl(safeDecode(nestedValue), depth + 1);
      }
    }

    if (url.pathname === '/url') {
      const qValue = url.searchParams.get('q');
      if (qValue && looksLikeUrl(safeDecode(qValue))) {
        return unwrapNestedGoogleUrl(safeDecode(qValue), depth + 1);
      }
    }

    return url.toString();
  }

  async function tryExpandShortGoogleMapsUrl(rawUrl, diagnostics = null) {
    const normalizedUrl = normalizeUrlCandidate(rawUrl);
    if (!normalizedUrl || !isGoogleShortMapsUrl(normalizedUrl) || typeof fetch !== 'function') {
      diagnostics?.log('expansion', 'Skipped short-link expansion', {
        normalizedUrl: normalizedUrl || rawUrl,
        isShortUrl: !!normalizedUrl && isGoogleShortMapsUrl(normalizedUrl),
        fetchAvailable: typeof fetch === 'function'
      });
      return normalizedUrl || rawUrl;
    }

    diagnostics?.log('expansion', 'Attempting short-link expansion', { shortUrl: normalizedUrl });

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 2500) : null;

    try {
      const response = await fetch(normalizedUrl, {
        method: 'GET',
        redirect: 'follow',
        cache: 'no-store',
        credentials: 'omit',
        signal: controller ? controller.signal : undefined
      });

      const finalUrl = safeString(response && response.url);
      if (finalUrl && finalUrl !== normalizedUrl) {
        console.log(`🔗 Expanded short Google Maps URL: ${normalizedUrl} → ${finalUrl}`);
        diagnostics?.log('expansion', 'Short-link expansion succeeded', { shortUrl: normalizedUrl, expandedUrl: finalUrl });
        return finalUrl;
      }

      diagnostics?.warn('expansion', 'Short-link expansion returned same/fallback URL', { shortUrl: normalizedUrl, expandedUrl: finalUrl || normalizedUrl });
    } catch (error) {
      console.warn(`⚠️ Short-link expansion skipped for ${normalizedUrl}:`, error.message);
      diagnostics?.warn('expansion', 'Short-link expansion failed', { shortUrl: normalizedUrl, error: error.message });
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }

    return normalizedUrl;
  }

  async function expandShortGoogleMapsInput(raw, diagnostics = null) {
    const original = normalizeRawInput(raw);
    const candidates = extractUrlCandidates(original);
    if (candidates.length === 0) {
      diagnostics?.warn('expansion', 'No URL candidates found inside short-link input');
      return original;
    }

    let expandedInput = original;
    for (const candidate of candidates) {
      if (!isGoogleShortMapsUrl(candidate)) continue;
      const expandedUrl = await tryExpandShortGoogleMapsUrl(candidate, diagnostics);
      if (expandedUrl && expandedUrl !== candidate) {
        expandedInput = expandedInput.replace(candidate, expandedUrl);
      }
    }

    diagnostics?.log('expansion', expandedInput !== original ? 'Expanded input text updated' : 'Expanded input text unchanged', {
      original,
      expandedInput
    });

    return expandedInput;
  }

  function stripUrlsFromText(raw) {
    return normalizeRawInput(raw)
      .replace(/https?:\/\/[^\s<>"]+/gi, ' ')
      .replace(/(?:maps\.app\.goo\.gl|goo\.gl\/maps|(?:www\.)?google\.[^\s/]+\/maps[^\s]*|maps\.google\.[^\s/]+[^\s]*)/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function cleanExtractedQuery(value) {
    return safeDecode(value)
      .replace(/\+/g, ' ')
      .replace(/\b(shared from|shared via|open in google maps|on google maps)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getBestTextQueryFromUrl(raw, diagnostics = null) {
    const urls = extractUrlCandidates(raw).map((url) => unwrapNestedGoogleUrl(url));

    for (const rawUrl of urls) {
      const url = parseUrlSafely(rawUrl);
      if (!url) continue;

      const directQueryParams = ['query', 'q', 'destination', 'daddr'];
      for (const paramName of directQueryParams) {
        const value = cleanExtractedQuery(url.searchParams.get(paramName));
        if (value && !looksLikePlaceId(value) && !looksLikeUrl(value)) {
          diagnostics?.log('query recovery', `Recovered query from URL parameter "${paramName}"`, { query: value, sourceUrl: rawUrl });
          return value;
        }
      }

      const path = cleanExtractedQuery(url.pathname);
      const placePathMatch = path.match(/\/maps\/place\/([^/@?#]+)/i) || path.match(/\/place\/([^/@?#]+)/i);
      if (placePathMatch && placePathMatch[1]) {
        const query = cleanExtractedQuery(placePathMatch[1]);
        diagnostics?.log('query recovery', 'Recovered query from /place/ path', { query, sourceUrl: rawUrl });
        return query;
      }

      const searchPathMatch = path.match(/\/maps\/search\/([^/?#]+)/i) || path.match(/\/search\/([^/?#]+)/i);
      if (searchPathMatch && searchPathMatch[1]) {
        const query = cleanExtractedQuery(searchPathMatch[1]);
        diagnostics?.log('query recovery', 'Recovered query from /search/ path', { query, sourceUrl: rawUrl });
        return query;
      }
    }

    const residualText = stripUrlsFromText(raw);
    if (residualText && !looksLikeUrl(residualText)) {
      diagnostics?.log('query recovery', 'Recovered query from residual surrounding text', { query: residualText });
      return residualText;
    }

    diagnostics?.warn('query recovery', 'No text query could be recovered from short-link input');

    return '';
  }

  function extractPlaceId(raw, diagnostics = null) {
    const text = normalizeRawInput(raw);
    if (!text) return '';

    const directMatch = text.match(/\bChI[A-Za-z0-9_-]{6,}\b/);
    if (directMatch) {
      diagnostics?.log('Place ID extraction', 'Recovered Place ID directly from pasted input', { placeId: directMatch[0] });
      return directMatch[0];
    }

    for (const candidate of extractUrlCandidates(text)) {
      const expandedCandidate = unwrapNestedGoogleUrl(candidate);
      const expandedText = safeDecode(expandedCandidate);

      const embeddedMatch = expandedText.match(/\bChI[A-Za-z0-9_-]{6,}\b/);
      if (embeddedMatch) {
        diagnostics?.log('Place ID extraction', 'Recovered Place ID from expanded URL text', { placeId: embeddedMatch[0], sourceUrl: expandedCandidate });
        return embeddedMatch[0];
      }

      const url = parseUrlSafely(expandedCandidate);
      if (!url) continue;

      const placeIdParams = ['query_place_id', 'place_id', 'destination_place_id'];
      for (const paramName of placeIdParams) {
        const placeId = safeDecode(url.searchParams.get(paramName));
        if (looksLikePlaceId(placeId)) {
          diagnostics?.log('Place ID extraction', `Recovered Place ID from URL parameter "${paramName}"`, { placeId, sourceUrl: expandedCandidate });
          return placeId;
        }
      }

      const hashPlaceId = safeDecode(url.hash).match(/\bChI[A-Za-z0-9_-]{6,}\b/);
      if (hashPlaceId) {
        diagnostics?.log('Place ID extraction', 'Recovered Place ID from URL hash', { placeId: hashPlaceId[0], sourceUrl: expandedCandidate });
        return hashPlaceId[0];
      }
    }

    diagnostics?.warn('Place ID extraction', 'No Place ID could be extracted from short-link input');

    return '';
  }

  function extractSearchQuery(inputType, rawInput, diagnostics = null) {
    const value = normalizeRawInput(rawInput);
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
      const extractedQuery = getBestTextQueryFromUrl(value, diagnostics);
      if (extractedQuery) return extractedQuery;
    }

    diagnostics?.warn('query recovery', 'Falling back to raw input text as search query', { fallbackQuery: value });

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

    const diagnostics = createShortLinkDiagnostics(inputType, rawValue);
    diagnostics.log('start', 'Short-link diagnostics enabled', { inputType, inputValue: rawValue });

    try {
      const expandedValue = inputType === 'placeUrl'
        ? await expandShortGoogleMapsInput(rawValue, diagnostics)
        : rawValue;

      let placeId = '';
      let searchResult = null;
      let details = null;

      const extractedPlaceId = extractPlaceId(expandedValue, diagnostics);
      const queryText = extractSearchQuery(inputType, expandedValue, diagnostics);

      if (typeof mainWindow.resolvePlaceIdFromInput === 'function') {
        try {
          diagnostics.log('Place ID extraction', 'Trying main-window resolvePlaceIdFromInput', { input: expandedValue });
          placeId = safeString(await mainWindow.resolvePlaceIdFromInput(inputType, expandedValue));
          if (placeId) {
            diagnostics.log('Place ID extraction', 'main-window resolver returned a Place ID', { placeId });
          }
        } catch (resolverError) {
          console.warn(`⚠️ resolvePlaceIdFromInput failed for ${inputType}:`, resolverError.message);
          diagnostics.warn('Place ID extraction', 'main-window resolver failed', { error: resolverError.message });
        }
      }

      if (!placeId && (inputType === 'placeId' || inputType === 'placeUrl') && extractedPlaceId) {
        placeId = extractedPlaceId;
        diagnostics.log('Place ID extraction', 'Using locally extracted Place ID fallback', { placeId });
      }

      if ((!placeId || !looksLikePlaceId(placeId)) && typeof mainWindow.searchPlaces === 'function' && queryText) {
        diagnostics.log('query recovery', 'Trying searchPlaces fallback with recovered query', { queryText });
        const searchResults = await mainWindow.searchPlaces(queryText);
        if (Array.isArray(searchResults) && searchResults.length > 0) {
          searchResult = searchResults[0];
          placeId = safeString(searchResult.placeId || placeId);
          diagnostics.log('query recovery', 'searchPlaces returned a candidate', { placeId, topResult: searchResult.name || '' });
        } else {
          diagnostics.warn('query recovery', 'searchPlaces returned no candidates', { queryText });
        }
      }

      if (!looksLikePlaceId(placeId)) {
        diagnostics.warn('Place ID extraction', 'Resolution failed before Google details lookup', { rawValue, expandedValue, queryText });
        throw createTaggedShortLinkError(`Could not resolve a valid Google Place ID for "${rawValue}".`, diagnostics, { stage: 'Place ID extraction' });
      }

      if (typeof mainWindow.getPlaceDetails === 'function') {
        diagnostics.log('Google detail lookup', 'Fetching Google place details', { placeId });
        details = await mainWindow.getPlaceDetails(placeId);
        if (details && safeString(details.name) && safeString(details.address)) {
          diagnostics.log('Google detail lookup', 'Google details lookup succeeded', { name: details.name, address: details.address });
        } else {
          diagnostics.warn('Google detail lookup', 'Google details lookup returned incomplete data', { placeId, details });
        }
      }

      if ((!details || !safeString(details.name) || !safeString(details.address)) && !searchResult && typeof mainWindow.searchPlaces === 'function' && queryText) {
        diagnostics.log('Google detail lookup', 'Retrying with searchPlaces for incomplete details', { queryText, placeId });
        const searchResults = await mainWindow.searchPlaces(queryText);
        if (Array.isArray(searchResults) && searchResults.length > 0) {
          searchResult = searchResults[0];
          diagnostics.log('Google detail lookup', 'Recovered candidate from secondary searchPlaces lookup', { topResult: searchResult.name || '', placeId: searchResult.placeId || '' });
        } else {
          diagnostics.warn('Google detail lookup', 'Secondary searchPlaces lookup returned no candidates', { queryText });
        }
      }

      const normalized = normalizeResolvedDetails(placeId, details, searchResult, expandedValue);
      if (!normalized.placeId || !normalized.name || !normalized.address) {
        diagnostics.warn('Google detail lookup', 'Normalized result is still incomplete after all fallbacks', normalized);
        throw createTaggedShortLinkError(`Google returned incomplete details for "${expandedValue}". No row was added.`, diagnostics, { stage: 'Google detail lookup' });
      }

      diagnostics.log('complete', 'Short-link resolution completed successfully', {
        placeId: normalized.placeId,
        name: normalized.name,
        address: normalized.address
      });

      return normalized;
    } catch (error) {
      if (diagnostics.enabled && (!error || !error.requestId)) {
        const taggedError = createTaggedShortLinkError(error?.message || String(error), diagnostics, {
          stage: error?.shortLinkStage || 'resolver',
          cause: error
        });
        diagnostics.warn('complete', 'Short-link resolution failed', { requestId: taggedError.requestId, error: taggedError.message });
        throw taggedError;
      }

      diagnostics.warn('complete', 'Short-link resolution failed', { requestId: error?.requestId || diagnostics.id, error: error?.message || String(error) });
      throw error;
    }
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
        const requestIdPrefix = error?.requestId ? `[${error.requestId}] ` : '';
        console.error(`❌ Error adding place: ${requestIdPrefix}${error?.message || error}`, error);
        return { success: false, error: error.message };
      }
    }

    async bulkAddPlaces(placesText, inputType, dryRun = false) {
      const lines = (placesText || '').split('\n').map((line) => line.trim()).filter(Boolean);
      if (lines.length === 0) return { success: false, error: 'No places provided' };

      const results = { success: true, total: lines.length, added: 0, failed: 0, skipped: 0, details: [] };
      for (const line of lines) {
        const result = await this.addSinglePlace(line, inputType, dryRun);
        if (result && result.success) {
          results.added++;
          results.details.push(`✅ ${result.placeName || line}${result.isDryRun ? ' (dry run)' : ''}`);
        } else {
          results.failed++;
          results.details.push(`❌ ${line}: ${(result && result.error) || 'Operation failed'}`);
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
        const result = await window.handleBulkAddChainLocationsFixed(lines, inputType, document.createElement('div'), dryRun);
        return result && typeof result === 'object'
          ? result
          : { success: false, error: 'bulk-add-chain handler returned no structured result (strict mode).' };
      }
      if (typeof window.handleBulkAddChainLocationsEnhanced === 'function') {
        const result = await window.handleBulkAddChainLocationsEnhanced(lines, inputType, document.createElement('div'), dryRun);
        return result && typeof result === 'object'
          ? result
          : { success: false, error: 'bulk-add-chain handler returned no structured result (strict mode).' };
      }
      return { success: false, error: 'Bulk chain add system not available' };
    }

    async populateMissingFieldsOnly(dryRun = false) {
      if (typeof window.handlePopulateMissingFieldsEnhanced === 'function') {
        const result = await window.handlePopulateMissingFieldsEnhanced(document.createElement('div'), dryRun);
        return result && typeof result === 'object'
          ? result
          : { success: false, error: 'populate-missing handler returned no structured result (strict mode).' };
      }
      if (typeof window.handlePopulateMissingFields === 'function') {
        const result = await window.handlePopulateMissingFields(document.createElement('div'), dryRun);
        return result && typeof result === 'object'
          ? result
          : { success: false, error: 'populate-missing handler returned no structured result (strict mode).' };
      }
      return { success: false, error: 'Populate missing fields system not available' };
    }

    async populateMissingFields(dryRun = false) {
      return this.populateMissingFieldsOnly(dryRun);
    }

    async updateHoursOnly(dryRun = false) {
      if (typeof window.handleUpdateHoursOnlyEnhanced === 'function') {
        const result = await window.handleUpdateHoursOnlyEnhanced(document.createElement('div'), dryRun);
        return result && typeof result === 'object'
          ? result
          : { success: false, error: 'update-hours handler returned no structured result (strict mode).' };
      }
      if (typeof window.handleUpdateHoursOnly === 'function') {
        const result = await window.handleUpdateHoursOnly(document.createElement('div'), dryRun);
        return result && typeof result === 'object'
          ? result
          : { success: false, error: 'update-hours handler returned no structured result (strict mode).' };
      }
      return { success: false, error: 'Update hours system not available' };
    }

    async autoTagAll(dryRun = false) {
      if (typeof window.handleAutoTagAll === 'function') {
        const result = await window.handleAutoTagAll(dryRun);
        return result && typeof result === 'object'
          ? result
          : { success: false, error: 'auto-tag handler returned no structured result (strict mode).' };
      }
      if (typeof window.autoTagAllLocationsUnified === 'function') {
        const result = await window.autoTagAllLocationsUnified({ dryRun });
        return result && typeof result === 'object'
          ? result
          : { success: false, error: 'auto-tag handler returned no structured result (strict mode).' };
      }
      return { success: false, error: 'Auto-tag system not available' };
    }
  }

  window.EnhancedAutomationFeatures = EnhancedAutomationFeatures;
  window.enhancedAutomation = window.enhancedAutomation || new EnhancedAutomationFeatures();

  console.log('✅ Consolidated Automation Features System v7.0.141 Loaded');
})();
