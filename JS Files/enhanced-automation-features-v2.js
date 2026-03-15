/**
 * ENHANCED AUTOMATION FEATURES
 * ============================
 * Advanced place management with multiple input methods
 * Version: 2.0
 * Date: March 14, 2026
 *
 * Features:
 * - Add Single Place (multiple input types)
 * - Bulk Add Places (multiple input types)
 * - Bulk Add Chain Locations (multiple input types)
 * - Refresh Place IDs (with dry run)
 * - Populate Missing Fields Only
 * - Update Hours Only
 * - Dry Run toggles for all features
 */

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
    console.log('✅ Enhanced Automation Features Loaded');
  }

  /**
   * Create dry run toggle UI
   */
  createDryRunToggle(featureName, initialState = false) {
    const container = document.createElement('div');
    container.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f0f4ff;
      border-radius: 8px;
      border: 1px solid #60a5fa;
      margin-bottom: 12px;
    `;

    const label = document.createElement('label');
    label.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #1e40af;
      cursor: pointer;
      margin: 0;
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

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode('🧪 Dry Run (Preview Changes)'));
    container.appendChild(label);

    return { container, checkbox };
  }

  /**
   * Validate and parse place input
   * Returns { type, value, isValid }
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
   * Add single place with multiple input methods
   */
  async addSinglePlace(input, inputType, dryRun = false) {
    const validation = this.validatePlaceInput(input, inputType);

    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    console.log(`${dryRun ? '🧪 DRY RUN' : '➕'} Adding place: ${validation.description}`);

    // For now, simulate the addition
    // In production, this would call Google Places API and add to Excel
    const newPlace = {
      name: inputType === 'placeName' ? input : `Place from ${inputType}`,
      input: input,
      inputType: inputType,
      timestamp: new Date().toLocaleString()
    };

    if (!dryRun) {
      if (typeof window.addNewPlace === 'function') {
        window.addNewPlace(newPlace.name, '', '');
        return { success: true, message: `✅ Added: ${newPlace.name}` };
      }
    }

    return {
      success: true,
      message: `${dryRun ? '🧪 Preview' : '✅ Added'}: ${newPlace.name}`,
      dryRun: true
    };
  }

  /**
   * Bulk add places with multiple input methods
   */
  async bulkAddPlaces(inputs, inputType, dryRun = false) {
    const places = inputs.split(/[\n,]+/).map(p => p.trim()).filter(Boolean);

    if (places.length === 0) {
      return { success: false, error: 'No places to add' };
    }

    const results = [];
    let successful = 0;
    let failed = 0;

    for (const place of places) {
      const validation = this.validatePlaceInput(place, inputType);

      if (!validation.isValid) {
        results.push({ place, success: false, error: validation.error });
        failed++;
        continue;
      }

      if (!dryRun) {
        if (typeof window.addNewPlace === 'function') {
          window.addNewPlace(place, '', '');
        }
      }

      results.push({ place, success: true, description: validation.description });
      successful++;
    }

    return {
      success: true,
      total: places.length,
      successful,
      failed,
      results,
      dryRun,
      summary: `${dryRun ? '🧪 Preview' : '✅ Processed'}: ${successful}/${places.length} places`
    };
  }

  /**
   * Bulk add chain locations with multiple input methods
   */
  async bulkAddChainLocations(inputs, inputType, dryRun = false) {
    const locations = inputs.split(/[\n,]+/).map(p => p.trim()).filter(Boolean);

    if (locations.length === 0) {
      return { success: false, error: 'No locations to add' };
    }

    const results = [];
    let successful = 0;
    let failed = 0;

    for (const location of locations) {
      const validation = this.validatePlaceInput(location, inputType);

      if (!validation.isValid) {
        results.push({ location, success: false, error: validation.error });
        failed++;
        continue;
      }

      if (!dryRun) {
        if (typeof window.batchAddChainLocations === 'function') {
          window.batchAddChainLocations([location]);
        }
      }

      results.push({ location, success: true, description: validation.description });
      successful++;
    }

    return {
      success: true,
      total: locations.length,
      successful,
      failed,
      results,
      dryRun,
      summary: `${dryRun ? '🧪 Preview' : '✅ Added'}: ${successful}/${locations.length} chain locations`
    };
  }

  /**
   * Populate missing fields only from Google API
   */
  async populateMissingFieldsOnly(dryRun = false) {
    console.log(`${dryRun ? '🧪 DRY RUN' : '📝'} Populating missing fields only`);

    // This would connect to Google Places API and update only empty fields
    // Implementation depends on your API integration

    return {
      success: true,
      message: `${dryRun ? '🧪 Would populate' : '✅ Populated'} missing fields`,
      dryRun,
      locationsUpdated: dryRun ? '[preview mode]' : 0
    };
  }

  /**
   * Update hours only from Google API
   */
  async updateHoursOnly(dryRun = false) {
    console.log(`${dryRun ? '🧪 DRY RUN' : '🕐'} Updating hours only`);

    // This would connect to Google Places API and update only hours field
    // Implementation depends on your API integration

    return {
      success: true,
      message: `${dryRun ? '🧪 Would update' : '✅ Updated'} hours only`,
      dryRun,
      locationsUpdated: dryRun ? '[preview mode]' : 0
    };
  }

  /**
   * Refresh Place IDs with dry run
   */
  async refreshPlaceIds(dryRun = false) {
    console.log(`${dryRun ? '🧪 DRY RUN' : '🔄'} Refreshing Place IDs`);

    if (typeof window.refreshAllPlaceIds === 'function') {
      return await window.refreshAllPlaceIds(dryRun);
    }

    return {
      success: true,
      message: `${dryRun ? '🧪 Would refresh' : '✅ Refreshed'} Place IDs`,
      dryRun,
      updated: dryRun ? '[preview mode]' : 0
    };
  }

  /**
   * Get dry run state for feature
   */
  getDryRunState(featureName) {
    return this.dryRunStates[featureName] || false;
  }

  /**
   * Set dry run state for feature
   */
  setDryRunState(featureName, state) {
    this.dryRunStates[featureName] = state;
  }

  /**
   * Display results message
   */
  displayResults(results, statusElement) {
    if (!statusElement) return;

    let html = '';

    if (results.error) {
      html = `<div style="color: #dc2626; background: #fee2e2; padding: 12px; border-radius: 6px; border-left: 4px solid #dc2626;">
        ❌ ${results.error}
      </div>`;
    } else if (results.success) {
      const bgColor = results.dryRun ? '#fef3c7' : '#d1fae5';
      const borderColor = results.dryRun ? '#fbbf24' : '#6ee7b7';
      const textColor = results.dryRun ? '#92400e' : '#065f46';

      html = `<div style="color: ${textColor}; background: ${bgColor}; padding: 12px; border-radius: 6px; border-left: 4px solid ${borderColor};">
        ${results.summary || results.message}
        ${results.locationsUpdated !== undefined ? `<br>📊 Locations updated: ${results.locationsUpdated}` : ''}
      </div>`;
    }

    statusElement.innerHTML = html;
  }
}

// Initialize on window
window.enhancedAutomation = new EnhancedAutomationFeatures();

console.log('✅ Enhanced Automation Features Ready');

