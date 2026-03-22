/**
 * CONSOLIDATED AUTOMATION FEATURES SYSTEM v7.0.141
 * =================================================
 *
 * A unified, comprehensive automation system that consolidates all automation-related
 * functionality from multiple files into a single, maintainable module.
 *
 * INCLUDES:
 * - Enhanced Automation Features (v2)
 * - Refresh Place IDs with Progress
 * - Result Modal System (Legacy)
 * - Batch Processing Integration
 * - Keyboard Shortcuts
 * - Recent Places Tracking
 * - Multiple Input Methods
 *
 * Version: 7.0.141
 * Date: March 15, 2026
 * Created: Consolidated from 4 separate automation files
 */

console.log('🤖 Consolidated Automation Features System v7.0.141 Loading...');

// ============================================================
// SECTION 1: ENHANCED AUTOMATION FEATURES
// ============================================================

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
    this.init();
  }

  /**
   * Initialize features
   */
  init() {
    console.log('✅ Enhanced Automation Features initialized');
  }

  /**
   * Create dry run toggle UI
   */
  createDryRunToggle(featureName, initialState = false) {
    const container = document.createElement('div');
    container.className = 'dry-run-toggle';
    if (initialState) {
      container.classList.add('on');
    }
    container.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f0f4ff;
      border-radius: 8px;
      border: 1px solid #60a5fa;
      margin-bottom: 12px;
      cursor: pointer;
      user-select: none;
    `;

    // Create label with text
    const label = document.createElement('label');
    label.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #1e40af;
      cursor: pointer;
      margin: 0;
      user-select: none;
    `;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = initialState;
    checkbox.className = `dry-run-toggle-${featureName}`;
    checkbox.style.cssText = `
      width: 18px;
      height: 18px;
      cursor: pointer;
    `;

    const labelText = document.createTextNode('🧪 Dry Run (Preview Changes)');
    label.appendChild(checkbox);
    label.appendChild(labelText);

    // Create custom switch for better UX
    const switchElement = document.createElement('div');
    switchElement.className = 'dry-run-switch';
    switchElement.style.cssText = `
      width: 32px;
      height: 18px;
      border-radius: 999px;
      background: #e5e7eb;
      position: relative;
      transition: background 0.2s;
      cursor: pointer;
      flex-shrink: 0;
    `;

    const switchThumb = document.createElement('div');
    switchThumb.className = 'dry-run-switch-thumb';
    switchThumb.style.cssText = `
      width: 14px;
      height: 14px;
      border-radius: 999px;
      background: white;
      position: absolute;
      top: 2px;
      left: 2px;
      transition: transform 0.2s;
      box-shadow: 0 1px 2px rgba(0,0,0,0.2);
      pointer-events: none;
    `;

    switchElement.appendChild(switchThumb);

    // Toggle function
    const toggle = () => {
      checkbox.checked = !checkbox.checked;
      container.classList.toggle('on');

      // Update switch colors
      if (checkbox.checked) {
        switchElement.style.background = '#60a5fa';
      } else {
        switchElement.style.background = '#e5e7eb';
      }

      // Trigger change event
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    };

    // Add click handlers to all clickable areas
    container.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    });

    // Prevent double-toggle on checkbox click
    checkbox.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Add to label
    label.appendChild(switchElement);
    container.appendChild(label);

    return { container, checkbox };
  }

  /**
   * Validate and parse place input
   */
  validatePlaceInput(input, inputType) {
    const trimmed = input.trim();

    if (!trimmed) {
      return { isValid: false, error: 'Input cannot be empty' };
    }

    switch (inputType) {
      case 'placeName':
        return {
          isValid: true,
          type: 'placeName',
          value: trimmed,
          description: `Place: ${trimmed}`
        };

      case 'placeId':
        if (!trimmed.startsWith('ChIJ')) {
          return { isValid: false, error: 'Invalid Place ID (must start with ChIJ)' };
        }
        return {
          isValid: true,
          type: 'placeId',
          value: trimmed,
          description: `Place ID: ${trimmed.substring(0, 20)}...`
        };

      case 'website':
        try {
          new URL(trimmed);
          return {
            isValid: true,
            type: 'website',
            value: trimmed,
            description: `Website: ${trimmed}`
          };
        } catch {
          return { isValid: false, error: 'Invalid website URL' };
        }

      case 'placeUrl':
        if (!trimmed.includes('google.com/maps') && !trimmed.includes('maps.google.com')) {
          return { isValid: false, error: 'Not a valid Google Maps URL' };
        }
        return {
          isValid: true,
          type: 'placeUrl',
          value: trimmed,
          description: `Google Maps URL`
        };

      case 'address':
        return {
          isValid: true,
          type: 'address',
          value: trimmed,
          description: `Address: ${trimmed}`
        };

      case 'placeNameCity':
        const parts = trimmed.split(',');
        if (parts.length < 2) {
          return { isValid: false, error: 'Format: Place Name, City (e.g., Starbucks, Denver)' };
        }
        return {
          isValid: true,
          type: 'placeNameCity',
          value: trimmed,
          description: `${trimmed}`
        };

      default:
        return { isValid: false, error: `Unknown input type: ${inputType}` };
    }
  }

  /**
   * Resolve a place to a Google Place ID + details using available methods.
   * Tries: mainWindow.getPlaceDetails → getPlaceDetailsFromAPI → Places Text Search API
   */
  async _resolvePlaceDetails(input, inputType) {
    const mainWindow = window.opener && !window.opener.closed ? window.opener : window;
    const apiKey = window.GOOGLE_PLACES_API_KEY || mainWindow.GOOGLE_PLACES_API_KEY || '';

    // --- Already have a Place ID ---
    if (inputType === 'placeId') {
      if (typeof mainWindow.getPlaceDetails === 'function') {
        try { return await mainWindow.getPlaceDetails(input); } catch (_) {}
      }
      if (typeof getPlaceDetailsFromAPI === 'function') {
        try { return await getPlaceDetailsFromAPI(input); } catch (_) {}
      }
      return { placeId: input, name: input, website: '', phone: '', hours: '', address: '', rating: '', directions: `https://www.google.com/maps/place/?q=place_id:${input}` };
    }

    // --- Google Maps URL → extract Place ID from URL ---
    if (inputType === 'placeUrl') {
      const cidMatch = input.match(/[?&]cid=(\d+)/);
      const placeIdMatch = input.match(/place_id[=:]([A-Za-z0-9_-]+)/);
      if (placeIdMatch) {
        return this._resolvePlaceDetails(placeIdMatch[1], 'placeId');
      }
      // Fall through to text search using the URL as query
    }

    // --- Text search (placeName, address, placeNameCity, website, placeUrl fallthrough) ---
    let queryText = input;
    if (inputType === 'website') {
      try { queryText = new URL(input).hostname.replace(/^www\./, ''); } catch (_) {}
    }

    // Try mainWindow.findPlaceByText if it exists
    if (typeof mainWindow.findPlaceByText === 'function') {
      try {
        const result = await mainWindow.findPlaceByText(queryText);
        if (result) return result;
      } catch (_) {}
    }

    // Try Google Places Text Search API directly
    if (apiKey) {
      try {
        const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(queryText)}&inputtype=textquery&fields=place_id,name,formatted_address,rating,formatted_phone_number,website,opening_hours&key=${apiKey}`;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(searchUrl)}`;
        const resp = await fetch(proxyUrl);
        if (resp.ok) {
          const data = await resp.json();
          const candidate = data.candidates?.[0];
          if (candidate?.place_id) {
            return {
              placeId: candidate.place_id,
              name: candidate.name || queryText,
              address: candidate.formatted_address || '',
              phone: candidate.formatted_phone_number || '',
              website: candidate.website || '',
              rating: candidate.rating ? String(candidate.rating) : '',
              hours: candidate.opening_hours?.weekday_text?.join(' | ') || '',
              directions: `https://www.google.com/maps/place/?q=place_id:${candidate.place_id}`
            };
          }
        }
      } catch (_) {}
    }

    // Graceful fallback — return what we know so the row can still be added
    return {
      placeId: '',
      name: queryText,
      website: inputType === 'website' ? input : '',
      phone: '',
      hours: '',
      address: inputType === 'address' ? input : '',
      rating: '',
      directions: ''
    };
  }

  /**
   * Add single place with multiple input methods
   */
  async addSinglePlace(input, inputType, dryRun = false) {
    const validation = this.validatePlaceInput(input, inputType);

    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    console.log(`${dryRun ? '🧪 DRY RUN' : '➕'} Adding place: ${validation.description}`);

    if (dryRun) {
      return { success: true, isDryRun: true, message: `🧪 [DRY RUN] Would add: ${validation.description}` };
    }

    try {
      const mainWindow = window.opener && !window.opener.closed ? window.opener : window;

      // Resolve place details via multiple fallback methods
      const details = await this._resolvePlaceDetails(input, inputType);
      console.log('📍 Resolved place details:', details);

      const schemaCount = Number(
        mainWindow.__excelColumnCount ||
        mainWindow.adventuresData?.[0]?.values?.[0]?.length ||
        window.__excelColumnCount ||
        24
      );

      const normalizeRowForSchema = (rowValues) => {
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

      // Prefer the exact same Excel-row builder and append helper the main app uses.
      if (typeof mainWindow.buildExcelRow === 'function' && typeof mainWindow.addRowToExcel === 'function') {
        const resolvedPlaceId = details.placeId || input;
        const rawRowValues = mainWindow.buildExcelRow(resolvedPlaceId, details);
        const rowValues = normalizeRowForSchema(rawRowValues);
        await mainWindow.addRowToExcel(rowValues);

        if (Array.isArray(mainWindow.adventuresData)) {
          mainWindow.adventuresData.push({ values: [rowValues] });
        }
      } else if (typeof mainWindow.saveToExcel === 'function') {
        const resolvedPlaceId = details.placeId || input;
        const rawRowValues = typeof mainWindow.buildExcelRow === 'function'
          ? mainWindow.buildExcelRow(resolvedPlaceId, details)
          : [details.name || input, resolvedPlaceId || '', details.website || '', '', '', details.hours || '', '', '', '', '', '', details.address || '', details.phone || '', details.rating || '', '', details.directions || ''];

        const rowValues = normalizeRowForSchema(rawRowValues);

        if (Array.isArray(mainWindow.adventuresData)) {
          mainWindow.adventuresData.push({ values: [rowValues] });
        }
        await mainWindow.saveToExcel();
      } else {
        throw new Error('Main window Excel save helpers are unavailable');
      }

      return { success: true, message: `✅ Added: ${details.name || input}`, placeName: details.name || input, placeId: details.placeId || '' };
    } catch (error) {
      console.error('❌ Error adding place:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Bulk add multiple places (newline-separated list)
   */
  async bulkAddPlaces(placesText, inputType, dryRun = false) {
    const lines = (placesText || '').split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length =
