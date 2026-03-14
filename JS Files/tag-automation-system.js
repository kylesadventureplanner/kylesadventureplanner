/**
 * TAG AUTOMATION SYSTEM
 * ====================
 * Automatically recommends and adds tags to all locations based on Google data
 * Features:
 * - Auto-generate recommendations based on place data
 * - Batch apply tags with undo support
 * - Show detailed summary of changes
 * - Track edit history
 *
 * Version: v7.0.114+
 * Date: March 13, 2026
 */

class TagAutomationSystem {
  constructor() {
    this.editHistory = [];
    this.recommendations = new Map();
    this.init();
  }

  /**
   * Initialize the system
   */
  init() {
    this.createStyles();
  }

  /**
   * Create CSS for the automation UI
   */
  createStyles() {
    if (document.getElementById('tagAutomationStyles')) return;

    const style = document.createElement('style');
    style.id = 'tagAutomationStyles';
    style.textContent = `
      /* Tag Automation Styles */
      
      .automation-modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9999;
        display: none;
        animation: fadeIn 0.2s ease-out;
      }

      .automation-modal-backdrop.visible {
        display: block;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .automation-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        max-width: 700px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        animation: slideUp 0.3s ease-out;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translate(-50%, -40%);
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%);
        }
      }

      .automation-modal-header {
        padding: 20px 24px;
        border-bottom: 2px solid #e5e7eb;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 16px 16px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .automation-modal-title {
        font-size: 18px;
        font-weight: 600;
        margin: 0;
      }

      .automation-modal-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        transition: background 0.2s;
      }

      .automation-modal-close:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .automation-modal-body {
        padding: 24px;
      }

      .automation-section {
        margin-bottom: 24px;
      }

      .automation-section-title {
        font-size: 14px;
        font-weight: 700;
        color: #1f2937;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .automation-section-icon {
        font-size: 16px;
      }

      .automation-summary {
        background: #f3f4f6;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 16px;
      }

      .summary-stat {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        font-size: 14px;
        border-bottom: 1px solid #e5e7eb;
      }

      .summary-stat:last-child {
        border-bottom: none;
      }

      .summary-stat-label {
        color: #6b7280;
        font-weight: 500;
      }

      .summary-stat-value {
        font-weight: 600;
        color: #1f2937;
        font-size: 16px;
      }

      .summary-stat-value.success {
        color: #10b981;
      }

      .summary-stat-value.warning {
        color: #f59e0b;
      }

      .location-list {
        max-height: 300px;
        overflow-y: auto;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
      }

      .location-item {
        padding: 12px 16px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
      }

      .location-item:last-child {
        border-bottom: none;
      }

      .location-info {
        flex: 1;
        min-width: 0;
      }

      .location-name {
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 4px;
        word-break: break-word;
      }

      .location-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .tag-badge {
        background: #dbeafe;
        color: #1e40af;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
      }

      .tag-badge.new {
        background: #d1fae5;
        color: #065f46;
        border: 1px solid #10b981;
      }

      .tag-badge.existing {
        background: #fee2e2;
        color: #7c2d12;
        opacity: 0.6;
      }

      .location-status {
        font-size: 12px;
        font-weight: 600;
        flex-shrink: 0;
      }

      .location-status.success {
        color: #10b981;
      }

      .location-status.error {
        color: #ef4444;
      }

      .location-status.skipped {
        color: #f59e0b;
      }

      .automation-buttons {
        display: flex;
        gap: 12px;
        margin-top: 24px;
        padding-top: 24px;
        border-top: 2px solid #e5e7eb;
      }

      .automation-btn {
        flex: 1;
        padding: 12px 16px;
        border-radius: 12px;
        border: none;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      .automation-btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .automation-btn-primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
      }

      .automation-btn-secondary {
        background: white;
        color: #1f2937;
        border: 2px solid #e5e7eb;
      }

      .automation-btn-secondary:hover:not(:disabled) {
        background: #f3f4f6;
        border-color: #d1d5db;
      }

      .automation-btn-undo {
        background: #fef3c7;
        color: #78350f;
        border: 2px solid #f59e0b;
      }

      .automation-btn-undo:hover:not(:disabled) {
        background: #fcd34d;
      }

      .automation-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .automation-btn.loading {
        pointer-events: none;
      }

      .spinner-small {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(0, 0, 0, 0.1);
        border-left-color: currentColor;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .progress-bar {
        width: 100%;
        height: 6px;
        background: #e5e7eb;
        border-radius: 3px;
        overflow: hidden;
        margin-bottom: 8px;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        width: 0%;
        transition: width 0.3s ease;
      }

      .progress-text {
        font-size: 12px;
        color: #6b7280;
        text-align: center;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Generate tag recommendations based on Google place data
   */
  generateRecommendations(placeData) {
    const recommendations = new Set();

    if (!placeData) return recommendations;

    // Analyze type/category
    const type = (placeData.type || '').toLowerCase();
    const name = (placeData.name || '').toLowerCase();
    const address = (placeData.address || '').toLowerCase();

    // Type-based recommendations
    if (type.includes('restaurant')) recommendations.add('Restaurant');
    if (type.includes('coffee') || type.includes('cafe')) recommendations.add('Coffee Shop');
    if (type.includes('park')) recommendations.add('Park');
    if (type.includes('bar') || type.includes('pub')) recommendations.add('Pub');
    if (type.includes('hiking') || type.includes('trail')) recommendations.add('Hiking');
    if (type.includes('bakery')) recommendations.add('Bakery');
    if (type.includes('shopping')) recommendations.add('Shopping');
    if (type.includes('museum') || type.includes('gallery')) recommendations.add('Museum');
    if (type.includes('hotel') || type.includes('lodge')) recommendations.add('Lodging');

    // Name-based recommendations
    if (name.includes('pizza')) recommendations.add('Pizza');
    if (name.includes('sushi')) recommendations.add('Sushi');
    if (name.includes('pho')) recommendations.add('Pho');
    if (name.includes('bbq')) recommendations.add('BBQ');
    if (name.includes('brewpub') || name.includes('brewery')) recommendations.add('Pub');
    if (name.includes('diner')) recommendations.add('Diner');
    if (name.includes('burger')) recommendations.add('Burgers');
    if (name.includes('seafood')) recommendations.add('Seafood Joint');

    // Address-based recommendations
    if (address.includes('downtown') || address.includes('main st')) {
      recommendations.add('City Center');
    }

    return Array.from(recommendations);
  }

  /**
   * Analyze all locations and generate recommendations
   */
  analyzeAllLocations(adventuresData) {
    const analysis = {
      totalLocations: 0,
      locationsWithoutTags: 0,
      recommendedTags: new Map(),
      errors: []
    };

    if (!adventuresData || !Array.isArray(adventuresData)) {
      return analysis;
    }

    adventuresData.forEach((row, index) => {
      try {
        const vals = (row && row.values && row.values[0]) || [];
        if (!vals[0]) return; // Skip empty rows

        analysis.totalLocations++;
        const placeName = vals[0];
        const currentTags = vals[3] ? vals[3].split(',').map(t => t.trim()).filter(Boolean) : [];

        // Generate recommendations
        const recommendations = this.generateRecommendations({
          name: placeName,
          type: vals[6] || '', // Assume column 6 has type
          address: vals[11] || '' // Assume column 11 has address
        });

        // Filter out existing tags
        const newTags = recommendations.filter(tag => !currentTags.includes(tag));

        if (newTags.length > 0) {
          analysis.recommendedTags.set(placeName, {
            existing: currentTags,
            recommended: newTags,
            allTags: [...currentTags, ...newTags],
            rowIndex: index
          });

          if (currentTags.length === 0) {
            analysis.locationsWithoutTags++;
          }
        }
      } catch (err) {
        analysis.errors.push({
          row: index,
          error: err.message
        });
      }
    });

    return analysis;
  }

  /**
   * Create and show summary modal
   */
  showSummaryModal(analysis) {
    const backdrop = document.createElement('div');
    backdrop.className = 'automation-modal-backdrop visible';
    backdrop.onclick = () => this.closeModal(backdrop);

    const modal = document.createElement('div');
    modal.className = 'automation-modal';

    const totalNewTags = Array.from(analysis.recommendedTags.values())
      .reduce((sum, loc) => sum + loc.recommended.length, 0);

    let modalHTML = `
      <div class="automation-modal-header">
        <h2 class="automation-modal-title">📊 Tag Automation Summary</h2>
        <button class="automation-modal-close" onclick="this.closest('.automation-modal-backdrop').remove()">✕</button>
      </div>

      <div class="automation-modal-body">
        <!-- Summary Stats -->
        <div class="automation-section">
          <div class="automation-section-title">
            <span class="automation-section-icon">📈</span>
            Summary
          </div>
          <div class="automation-summary">
            <div class="summary-stat">
              <span class="summary-stat-label">Total Locations</span>
              <span class="summary-stat-value">${analysis.totalLocations}</span>
            </div>
            <div class="summary-stat">
              <span class="summary-stat-label">Locations without tags</span>
              <span class="summary-stat-value warning">${analysis.locationsWithoutTags}</span>
            </div>
            <div class="summary-stat">
              <span class="summary-stat-label">Locations to update</span>
              <span class="summary-stat-value success">${analysis.recommendedTags.size}</span>
            </div>
            <div class="summary-stat">
              <span class="summary-stat-label">New tags to add</span>
              <span class="summary-stat-value success">${totalNewTags}</span>
            </div>
          </div>
        </div>

        <!-- Locations -->
        <div class="automation-section">
          <div class="automation-section-title">
            <span class="automation-section-icon">📍</span>
            Recommended Tags by Location (${analysis.recommendedTags.size})
          </div>
          <div class="location-list">
    `;

    // Add locations
    let locationIndex = 0;
    analysis.recommendedTags.forEach((data, locationName) => {
      locationIndex++;
      modalHTML += `
        <div class="location-item">
          <div class="location-info">
            <div class="location-name">${locationIndex}. ${this.escapeHtml(locationName)}</div>
            <div class="location-tags">
      `;

      // Show existing tags
      data.existing.forEach(tag => {
        modalHTML += `<span class="tag-badge existing">${this.escapeHtml(tag)} ✓</span>`;
      });

      // Show new tags
      data.recommended.forEach(tag => {
        modalHTML += `<span class="tag-badge new">+ ${this.escapeHtml(tag)}</span>`;
      });

      modalHTML += `
            </div>
          </div>
          <div class="location-status success">+${data.recommended.length}</div>
        </div>
      `;
    });

    modalHTML += `
          </div>
        </div>

        <!-- Buttons -->
        <div class="automation-buttons">
          <button class="automation-btn automation-btn-secondary" onclick="this.closest('.automation-modal-backdrop').remove()">
            Cancel
          </button>
          <button class="automation-btn automation-btn-primary" id="confirmApplyBtn" onclick="automationSystem.applyRecommendedTags()">
            ✓ Apply All Recommended Tags
          </button>
        </div>
      </div>
    `;

    modal.innerHTML = modalHTML;
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    // Store analysis for later use
    this.currentAnalysis = analysis;
    this.currentModal = { modal, backdrop };
  }

  /**
   * Apply recommended tags to all locations
   */
  async applyRecommendedTags() {
    if (!this.currentAnalysis || !window.tagManager) {
      console.error('No analysis available or tagManager not found');
      return;
    }

    const confirmBtn = document.getElementById('confirmApplyBtn');
    const originalText = confirmBtn.innerHTML;
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<span class="spinner-small"></span>Applying...';

    try {
      // Save state for undo
      const undoState = {
        timestamp: new Date().toLocaleString(),
        changes: []
      };

      let successCount = 0;
      let failureCount = 0;

      // Apply tags to each location
      for (const [locationName, data] of this.currentAnalysis.recommendedTags.entries()) {
        try {
          // Add each new tag
          data.recommended.forEach(tag => {
            window.tagManager.addTagToPlace(locationName, tag);
          });

          undoState.changes.push({
            location: locationName,
            tagsAdded: data.recommended,
            success: true
          });

          successCount++;
        } catch (err) {
          failureCount++;
          undoState.changes.push({
            location: locationName,
            tagsAdded: data.recommended,
            success: false,
            error: err.message
          });
        }
      }

      // Store for undo
      this.editHistory.push(undoState);

      // Show completion message
      this.showCompletionModal(successCount, failureCount, undoState);

      // Close current modal
      if (this.currentModal) {
        this.currentModal.backdrop.remove();
      }
    } catch (err) {
      console.error('Error applying tags:', err);
      alert(`Error applying tags: ${err.message}`);
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = originalText;
    }
  }

  /**
   * Show completion/results modal
   */
  showCompletionModal(successCount, failureCount, changesSummary) {
    const backdrop = document.createElement('div');
    backdrop.className = 'automation-modal-backdrop visible';

    const modal = document.createElement('div');
    modal.className = 'automation-modal';

    const totalTags = changesSummary.changes.reduce((sum, change) => sum + (change.success ? change.tagsAdded.length : 0), 0);
    const canUndo = this.editHistory.length > 0;

    let modalHTML = `
      <div class="automation-modal-header">
        <h2 class="automation-modal-title">✅ Tags Applied Successfully</h2>
        <button class="automation-modal-close" onclick="this.closest('.automation-modal-backdrop').remove()">✕</button>
      </div>

      <div class="automation-modal-body">
        <div class="automation-section">
          <div class="automation-section-title">
            <span class="automation-section-icon">📊</span>
            Results
          </div>
          <div class="automation-summary">
            <div class="summary-stat">
              <span class="summary-stat-label">Locations updated</span>
              <span class="summary-stat-value success">${successCount}</span>
            </div>
            <div class="summary-stat">
              <span class="summary-stat-label">Total tags added</span>
              <span class="summary-stat-value success">${totalTags}</span>
            </div>
            ${failureCount > 0 ? `
            <div class="summary-stat">
              <span class="summary-stat-label">Failed</span>
              <span class="summary-stat-value" style="color: #ef4444;">${failureCount}</span>
            </div>
            ` : ''}
          </div>
        </div>

        <!-- Details -->
        <div class="automation-section">
          <div class="automation-section-title">
            <span class="automation-section-icon">📝</span>
            Changes Applied
          </div>
          <div class="location-list">
    `;

    changesSummary.changes.forEach((change, idx) => {
      const statusClass = change.success ? 'success' : 'error';
      const statusText = change.success ? `+${change.tagsAdded.length}` : 'Failed';

      modalHTML += `
        <div class="location-item">
          <div class="location-info">
            <div class="location-name">${idx + 1}. ${this.escapeHtml(change.location)}</div>
            <div class="location-tags">
      `;

      if (change.success) {
        change.tagsAdded.forEach(tag => {
          modalHTML += `<span class="tag-badge new">+ ${this.escapeHtml(tag)}</span>`;
        });
      } else {
        modalHTML += `<span style="color: #ef4444; font-size: 12px;">⚠️ ${this.escapeHtml(change.error)}</span>`;
      }

      modalHTML += `
            </div>
          </div>
          <div class="location-status ${statusClass}">${statusText}</div>
        </div>
      `;
    });

    modalHTML += `
          </div>
        </div>

        <!-- Buttons -->
        <div class="automation-buttons">
          ${canUndo ? `
          <button class="automation-btn automation-btn-undo" onclick="automationSystem.undoLastApply()">
            ↶ Undo Changes
          </button>
          ` : ''}
          <button class="automation-btn automation-btn-secondary" onclick="this.closest('.automation-modal-backdrop').remove()">
            Close
          </button>
        </div>
      </div>
    `;

    modal.innerHTML = modalHTML;
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
  }

  /**
   * Undo last tag application
   */
  undoLastApply() {
    if (this.editHistory.length === 0) {
      alert('Nothing to undo');
      return;
    }

    const lastEdit = this.editHistory.pop();

    try {
      lastEdit.changes.forEach(change => {
        if (change.success && window.tagManager) {
          change.tagsAdded.forEach(tag => {
            window.tagManager.removeTagFromPlace(change.location, tag);
          });
        }
      });

      alert(`✓ Undo successful! Removed ${lastEdit.changes.reduce((sum, c) => sum + (c.success ? c.tagsAdded.length : 0), 0)} tags`);

      // Close modal
      document.querySelector('.automation-modal-backdrop')?.remove();
    } catch (err) {
      console.error('Error undoing changes:', err);
      alert(`Error during undo: ${err.message}`);
      this.editHistory.push(lastEdit); // Re-add to history
    }
  }

  /**
   * Close modal
   */
  closeModal(backdrop) {
    backdrop.remove();
  }

  /**
   * Escape HTML
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }
}

// Create global instance
window.automationSystem = new TagAutomationSystem();

