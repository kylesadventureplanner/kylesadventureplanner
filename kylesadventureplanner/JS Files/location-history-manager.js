/**
 * LOCATION HISTORY & SORTING SYSTEM
 * ==================================
 * Track when locations were added and provide sorting/filtering options
 * Features:
 * - Automatic timestamp tracking for new locations
 * - Sort by: newest first, oldest first, alphabetical, date range
 * - Filter recent additions (last 24 hours, 7 days, 30 days)
 * - View location statistics by date
 * - Quick access to newly added locations for verification
 *
 * Version: v7.0.115
 * Date: March 13, 2026
 */

class LocationHistoryManager {
  constructor() {
    this.historyKey = 'adventureFinderLocationHistory';
    this.locationHistory = new Map();
    this.init();
  }

  /**
   * Initialize the system
   */
  init() {
    this.loadHistory();
    this.createStyles();
  }

  /**
   * Create CSS for the UI
   */
  createStyles() {
    if (document.getElementById('locationHistoryStyles')) return;

    const style = document.createElement('style');
    style.id = 'locationHistoryStyles';
    style.textContent = `
      /* Location History Styles */

      .location-sort-controls {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
        flex-wrap: wrap;
        align-items: center;
      }

      .sort-label {
        font-weight: 600;
        color: #1f2937;
        font-size: 14px;
      }

      .sort-button {
        padding: 8px 12px;
        border: 2px solid #e5e7eb;
        background: white;
        border-radius: 8px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
        color: #1f2937;
        transition: all 0.2s;
        white-space: nowrap;
      }

      .sort-button:hover {
        border-color: #3b82f6;
        color: #3b82f6;
        background: #dbeafe;
      }

      .sort-button.active {
        border-color: #3b82f6;
        background: #3b82f6;
        color: white;
      }

      .filter-dropdown {
        padding: 8px 12px;
        border: 2px solid #e5e7eb;
        background: white;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        color: #1f2937;
        cursor: pointer;
        transition: all 0.2s;
      }

      .filter-dropdown:hover {
        border-color: #3b82f6;
      }

      .filter-dropdown:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .location-date-badge {
        display: inline-block;
        background: #dbeafe;
        color: #1e40af;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        margin-left: 8px;
      }

      .location-date-badge.new {
        background: #d1fae5;
        color: #065f46;
        border: 1px solid #10b981;
      }

      .location-date-badge.recent {
        background: #fef3c7;
        color: #78350f;
        border: 1px solid #f59e0b;
      }

      .location-stats {
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 12px;
        margin-top: 12px;
        font-size: 13px;
        color: #6b7280;
      }

      .stat-row {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
        border-bottom: 1px solid #e5e7eb;
      }

      .stat-row:last-child {
        border-bottom: none;
      }

      .stat-label {
        font-weight: 600;
        color: #374151;
      }

      .stat-value {
        font-weight: 700;
        color: #1f2937;
      }

      .location-group-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        margin-top: 16px;
        margin-bottom: 12px;
        font-weight: 700;
        font-size: 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .group-count {
        background: rgba(255, 255, 255, 0.3);
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
      }

      .location-timeline {
        padding-left: 24px;
        border-left: 2px solid #e5e7eb;
        margin-bottom: 16px;
      }

      .timeline-item {
        position: relative;
        padding-bottom: 16px;
        padding-left: 16px;
      }

      .timeline-item::before {
        content: '';
        position: absolute;
        left: -12px;
        top: 4px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #3b82f6;
        border: 2px solid white;
        box-shadow: 0 0 0 2px #3b82f6;
      }

      .timeline-item.new::before {
        background: #10b981;
        box-shadow: 0 0 0 2px #10b981;
      }

      .timeline-time {
        font-size: 12px;
        color: #6b7280;
        font-weight: 600;
      }

      .timeline-content {
        font-size: 13px;
        color: #1f2937;
        margin-top: 4px;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Load history from localStorage
   */
  loadHistory() {
    const stored = localStorage.getItem(this.historyKey);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.locationHistory = new Map(Object.entries(data));
      } catch (e) {
        console.error('Failed to load location history:', e);
        this.locationHistory = new Map();
      }
    }
  }

  /**
   * Save history to localStorage
   */
  saveHistory() {
    const data = Object.fromEntries(this.locationHistory);
    localStorage.setItem(this.historyKey, JSON.stringify(data));
  }

  /**
   * Record a new location
   */
  recordLocation(placeName, placeId = null) {
    const timestamp = new Date().toISOString();
    const key = placeId || placeName;

    this.locationHistory.set(key, {
      name: placeName,
      placeId: placeId,
      addedAt: timestamp,
      addedDate: new Date(timestamp),
      verified: false,
      verifiedAt: null
    });

    this.saveHistory();
    return timestamp;
  }

  /**
   * Mark location as verified
   */
  markVerified(placeIdentifier) {
    const entry = this.locationHistory.get(placeIdentifier);
    if (entry) {
      entry.verified = true;
      entry.verifiedAt = new Date().toISOString();
      this.saveHistory();
      return true;
    }
    return false;
  }

  /**
   * Get locations sorted by date
   */
  getLocationsSortedByDate(order = 'newest') {
    const locations = Array.from(this.locationHistory.values());

    locations.sort((a, b) => {
      const dateA = new Date(a.addedAt);
      const dateB = new Date(b.addedAt);
      return order === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return locations;
  }

  /**
   * Get locations by date range
   */
  getLocationsByDateRange(days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return Array.from(this.locationHistory.values()).filter(location => {
      return new Date(location.addedAt) >= cutoffDate;
    });
  }

  /**
   * Get today's locations
   */
  getTodaysLocations() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from(this.locationHistory.values()).filter(location => {
      const locDate = new Date(location.addedAt);
      locDate.setHours(0, 0, 0, 0);
      return locDate.getTime() === today.getTime();
    });
  }

  /**
   * Get unverified locations
   */
  getUnverifiedLocations() {
    return Array.from(this.locationHistory.values())
      .filter(location => !location.verified)
      .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const locations = Array.from(this.locationHistory.values());
    const today = this.getTodaysLocations();
    const thisWeek = this.getLocationsByDateRange(7);
    const thisMonth = this.getLocationsByDateRange(30);
    const unverified = this.getUnverifiedLocations();

    return {
      totalLocations: locations.length,
      todayCount: today.length,
      thisWeekCount: thisWeek.length,
      thisMonthCount: thisMonth.length,
      unverifiedCount: unverified.length,
      verifiedCount: locations.filter(l => l.verified).length,
      oldestLocation: locations.length > 0 ? locations[locations.length - 1] : null,
      newestLocation: locations.length > 0 ? locations[0] : null
    };
  }

  /**
   * Format date for display
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    if (dateOnly.getTime() === today.getTime()) {
      return 'Today, ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (dateOnly.getTime() === yesterday.getTime()) {
      return 'Yesterday, ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      }) + ' ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  /**
   * Get relative time (e.g., "2 hours ago")
   */
  getRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return this.formatDate(dateString);
  }

  /**
   * Get date badge (for display in UI)
   */
  getDateBadge(dateString) {
    const cutoff24h = new Date();
    cutoff24h.setHours(cutoff24h.getHours() - 24);

    const cutoff7d = new Date();
    cutoff7d.setDate(cutoff7d.getDate() - 7);

    const date = new Date(dateString);

    if (date > cutoff24h) {
      return { label: 'NEW', className: 'new', color: '#10b981' };
    } else if (date > cutoff7d) {
      return { label: 'RECENT', className: 'recent', color: '#f59e0b' };
    }

    return null;
  }

  /**
   * Create location list UI with sorting options
   */
  createLocationListUI(containerId, adventuresData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let currentSort = 'newest';
    let currentFilter = 'all';

    const renderLocations = () => {
      let locations = [];

      if (currentFilter === 'today') {
        locations = this.getTodaysLocations();
      } else if (currentFilter === 'week') {
        locations = this.getLocationsByDateRange(7);
      } else if (currentFilter === 'month') {
        locations = this.getLocationsByDateRange(30);
      } else if (currentFilter === 'unverified') {
        locations = this.getUnverifiedLocations();
      } else {
        locations = this.getLocationsSortedByDate(currentSort);
      }

      // Additional sort if not unverified
      if (currentFilter !== 'unverified' && currentSort === 'alphabetical') {
        locations.sort((a, b) => a.name.localeCompare(b.name));
      }

      let html = `
        <div class="location-sort-controls">
          <span class="sort-label">View:</span>
          <button class="sort-button ${currentSort === 'newest' && currentFilter === 'all' ? 'active' : ''}" 
                  onclick="locationHistoryManager.setSortView(this, 'newest', 'all', '${containerId}')">
            📅 Newest First
          </button>
          <button class="sort-button ${currentSort === 'oldest' && currentFilter === 'all' ? 'active' : ''}" 
                  onclick="locationHistoryManager.setSortView(this, 'oldest', 'all', '${containerId}')">
            📅 Oldest First
          </button>
          <button class="sort-button ${currentSort === 'alphabetical' && currentFilter === 'all' ? 'active' : ''}" 
                  onclick="locationHistoryManager.setSortView(this, 'alphabetical', 'all', '${containerId}')">
            🔤 A-Z
          </button>
          
          <select class="filter-dropdown" onchange="locationHistoryManager.setFilterView(this.value, '${containerId}')">
            <option value="all" ${currentFilter === 'all' ? 'selected' : ''}>All Locations</option>
            <option value="today" ${currentFilter === 'today' ? 'selected' : ''}>Today's Additions</option>
            <option value="week" ${currentFilter === 'week' ? 'selected' : ''}>Last 7 Days</option>
            <option value="month" ${currentFilter === 'month' ? 'selected' : ''}>Last 30 Days</option>
            <option value="unverified" ${currentFilter === 'unverified' ? 'selected' : ''}>⚠️ Unverified</option>
          </select>
        </div>

        <div class="location-stats">
          <div class="stat-row">
            <span class="stat-label">Showing:</span>
            <span class="stat-value">${locations.length} locations</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Total Added:</span>
            <span class="stat-value">${this.locationHistory.size}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Unverified:</span>
            <span class="stat-value">${this.getUnverifiedLocations().length}</span>
          </div>
        </div>

        <div class="location-timeline">
      `;

      if (locations.length === 0) {
        html += '<p style="padding: 16px; text-align: center; color: #9ca3af;">No locations found</p>';
      } else {
        locations.forEach((loc, idx) => {
          const badge = this.getDateBadge(loc.addedAt);
          const badgeHtml = badge ? `<span class="location-date-badge ${badge.className}">${badge.label}</span>` : '';

          const statusIcon = loc.verified ? '✅' : '⚠️';

          html += `
            <div class="timeline-item ${badge?.className || ''}">
              <div class="timeline-time">${this.getRelativeTime(loc.addedAt)}</div>
              <div class="timeline-content">
                <strong>${statusIcon} ${this.escapeHtml(loc.name)}</strong>
                ${badgeHtml}
                <br/>
                <small style="color: #9ca3af;">Added: ${this.formatDate(loc.addedAt)}</small>
              </div>
            </div>
          `;
        });
      }

      html += '</div>';

      container.innerHTML = html;
    };

    // Store references for later use
    this.renderLocations = renderLocations;
    this.currentSort = () => currentSort;
    this.currentFilter = () => currentFilter;
    this.setCurrentSort = (sort) => { currentSort = sort; };
    this.setCurrentFilter = (filter) => { currentFilter = filter; };

    renderLocations();
  }

  /**
   * Set sort view and re-render
   */
  setSortView(element, sort, filter, containerId) {
    this.setCurrentSort(sort);
    this.setCurrentFilter(filter);
    this.createLocationListUI(containerId);
  }

  /**
   * Set filter view and re-render
   */
  setFilterView(filter, containerId) {
    this.setCurrentFilter(filter);
    this.createLocationListUI(containerId);
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

  /**
   * Open location history modal
   */
  openModal() {
    const backdrop = document.createElement('div');
    backdrop.id = 'locationHistoryBackdrop';
    backdrop.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background: rgba(0, 0, 0, 0.5) !important;
      z-index: 9999998 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    `;

    const modal = document.createElement('div');
    modal.id = 'locationHistoryModal';
    modal.style.cssText = `
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      background: white !important;
      border-radius: 16px !important;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
      z-index: 9999999 !important;
      max-width: 700px !important;
      width: 90% !important;
      max-height: 80vh !important;
      overflow: hidden !important;
      display: flex !important;
      flex-direction: column !important;
      animation: slideUp 0.3s ease-out !important;
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translate(-50%, -40%) !important;
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%) !important;
        }
      }
    `;
    document.head.appendChild(styleSheet);

    modal.innerHTML = `
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; border-radius: 16px 16px 0 0;">
        <h2 style="font-size: 18px; font-weight: 700; margin: 0;">📅 Location History</h2>
        <button onclick="this.closest('#locationHistoryBackdrop').remove()" style="background: none; border: none; color: white; font-size: 28px; cursor: pointer; padding: 0; width: 36px; height: 36px;">✕</button>
      </div>
      <div style="padding: 24px; overflow-y: auto; flex: 1;" id="locationHistoryContent">
        <p style="text-align: center; color: #9ca3af;">Loading location history...</p>
      </div>
    `;

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    // Force keep modal on top by re-enforcing z-index
    const enforceZIndex = () => {
      backdrop.style.zIndex = '9999998';
      modal.style.zIndex = '9999999';
    };

    // Watch for z-index changes and re-enforce every 50ms
    const interval = setInterval(() => {
      if (!document.body.contains(backdrop)) {
        clearInterval(interval);
        return;
      }
      enforceZIndex();
    }, 50);

    // Close on backdrop click
    backdrop.onclick = (e) => {
      if (e.target === backdrop) {
        clearInterval(interval);
        backdrop.remove();
      }
    };

    // Populate content
    this.createLocationListUI('locationHistoryContent');
  }
}

// Create global instance
window.locationHistoryManager = new LocationHistoryManager();

/**
 * Global function to open location history modal
 */
window.openLocationHistoryModal = function() {
  if (window.locationHistoryManager) {
    window.locationHistoryManager.openModal();
  }
};
