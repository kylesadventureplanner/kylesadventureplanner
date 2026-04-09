/**
 * SIGHTING HISTORY & DASHBOARD - Phase 4
 * Timeline view, search/filter, statistics, details modal, export
 */

class SightingHistory {
  constructor() {
    this.STORAGE_KEY = 'sighting_history';
    this.sightings = this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load sighting history:', error);
      return [];
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.sightings));
    } catch (error) {
      console.error('Failed to save sighting history:', error);
    }
  }

  addSighting(sighting) {
    const id = Date.now();
    const record = {
      id,
      ...sighting,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.sightings.unshift(record);
    this.saveToStorage();
    return record;
  }

  updateSighting(id, updates) {
    const index = this.sightings.findIndex(s => s.id === id);
    if (index > -1) {
      this.sightings[index] = {
        ...this.sightings[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveToStorage();
      return this.sightings[index];
    }
    return null;
  }

  deleteSighting(id) {
    const index = this.sightings.findIndex(s => s.id === id);
    if (index > -1) {
      this.sightings.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  getSighting(id) {
    return this.sightings.find(s => s.id === id);
  }

  getAllSightings() {
    return [...this.sightings];
  }

  getSightingsBySpecies(species) {
    return this.sightings.filter(s => s.species?.toLowerCase() === species.toLowerCase());
  }

  getSightingsByDateRange(startDate, endDate) {
    return this.sightings.filter(s => {
      const date = new Date(s.createdAt);
      return date >= startDate && date <= endDate;
    });
  }

  getSightingsByLocation(location) {
    return this.sightings.filter(s => s.location?.toLowerCase().includes(location.toLowerCase()));
  }

  count() {
    return this.sightings.length;
  }

  getUniqueSpecies() {
    const species = new Set();
    this.sightings.forEach(s => {
      if (s.species) species.add(s.species);
    });
    return Array.from(species);
  }

  getRecentSightings(limit = 10) {
    return this.sightings.slice(0, limit);
  }
}

class StatisticsDashboard {
  constructor(history) {
    this.history = history;
  }

  getTotalSightings() {
    return this.history.count();
  }

  getUniqueSpeciesCount() {
    return this.history.getUniqueSpecies().length;
  }

  getThisMonthCount() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return this.history.getSightingsByDateRange(monthStart, now).length;
  }

  getThisWeekCount() {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    return this.history.getSightingsByDateRange(weekStart, new Date()).length;
  }

  getTodayCount() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return this.history.getSightingsByDateRange(todayStart, new Date()).length;
  }

  getTopSpecies(limit = 5) {
    const counts = {};
    this.history.getAllSightings().forEach(s => {
      if (s.species) {
        counts[s.species] = (counts[s.species] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([species, count]) => ({ species, count }));
  }

  getAverageSightingsPerDay() {
    if (this.history.count() === 0) return 0;
    const oldest = this.history.getAllSightings()[this.history.count() - 1];
    const days = (new Date() - new Date(oldest.createdAt)) / (1000 * 60 * 60 * 24);
    return (this.history.count() / days).toFixed(1);
  }

  getStreakStats() {
    const sightings = this.history.getAllSightings();
    if (sightings.length === 0) return { current: 0, longest: 0 };

    const dates = sightings.map(s => new Date(s.createdAt).toDateString());
    const uniqueDates = [...new Set(dates)].sort().reverse();

    let current = 0;
    let longest = 0;
    let streak = 1;

    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const curr = new Date(uniqueDates[i]);
      const next = new Date(uniqueDates[i + 1]);
      const diff = (curr - next) / (1000 * 60 * 60 * 24);

      if (diff === 1) {
        streak++;
      } else {
        if (i === 0) current = streak;
        longest = Math.max(longest, streak);
        streak = 1;
      }
    }

    longest = Math.max(longest, streak);
    return { current: uniqueDates.length === 0 ? 0 : current, longest };
  }

  renderStats() {
    return `
      <div class="statistics-dashboard">
        <div class="stat-card featured">
          <div class="stat-value">${this.getTotalSightings()}</div>
          <div class="stat-label">Total Sightings</div>
          <div class="stat-meta">All time</div>
        </div>

        <div class="stat-card featured">
          <div class="stat-value">${this.getUniqueSpeciesCount()}</div>
          <div class="stat-label">Unique Species</div>
          <div class="stat-meta">Discovered</div>
        </div>

        <div class="stat-card">
          <div class="stat-value">${this.getThisMonthCount()}</div>
          <div class="stat-label">This Month</div>
          <div class="stat-meta">Sightings</div>
        </div>

        <div class="stat-card">
          <div class="stat-value">${this.getThisWeekCount()}</div>
          <div class="stat-label">This Week</div>
          <div class="stat-meta">Sightings</div>
        </div>

        <div class="stat-card">
          <div class="stat-value">${this.getAverageSightingsPerDay()}</div>
          <div class="stat-label">Avg per Day</div>
          <div class="stat-meta">Lifetime</div>
        </div>

        <div class="stat-card">
          <div class="stat-value">${this.getStreakStats().current}</div>
          <div class="stat-label">Current Streak</div>
          <div class="stat-meta">Days with sightings</div>
        </div>
      </div>
    `;
  }
}

class SearchFilterManager {
  constructor(history) {
    this.history = history;
    this.filters = {
      species: '',
      dateFrom: null,
      dateTo: null,
      location: ''
    };
  }

  setFilter(key, value) {
    this.filters[key] = value;
  }

  getFilters() {
    return { ...this.filters };
  }

  clearFilters() {
    this.filters = {
      species: '',
      dateFrom: null,
      dateTo: null,
      location: ''
    };
  }

  applyFilters(sightings = null) {
    let results = sightings || this.history.getAllSightings();

    if (this.filters.species) {
      results = results.filter(s =>
        s.species?.toLowerCase().includes(this.filters.species.toLowerCase())
      );
    }

    if (this.filters.location) {
      results = results.filter(s =>
        s.location?.toLowerCase().includes(this.filters.location.toLowerCase())
      );
    }

    if (this.filters.dateFrom) {
      results = results.filter(s =>
        new Date(s.createdAt) >= new Date(this.filters.dateFrom)
      );
    }

    if (this.filters.dateTo) {
      results = results.filter(s =>
        new Date(s.createdAt) <= new Date(this.filters.dateTo)
      );
    }

    return results;
  }

  hasActiveFilters() {
    return Object.values(this.filters).some(v => v);
  }

  getFilterCount() {
    return Object.values(this.filters).filter(v => v).length;
  }
}

class SightingTimeline {
  constructor(history, filter) {
    this.history = history;
    this.filter = filter;
  }

  renderCard(sighting) {
    const date = new Date(sighting.createdAt);
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const photoCount = sighting.photos?.length || 0;
    const hasNotes = sighting.notes && sighting.notes.trim().length > 0;

    return `
      <div class="sighting-card" data-sighting-id="${sighting.id}">
        <div class="sighting-thumbnail ${!sighting.photos?.length ? 'placeholder' : ''}">
          ${sighting.photos?.length > 0 
            ? `<img src="${sighting.photos[0]}" alt="${sighting.species}">`
            : '📸'
          }
        </div>

        <div class="sighting-info">
          <div class="sighting-species">${sighting.species || 'Unknown'}</div>
          <div class="sighting-location">📍 ${sighting.location || 'Unknown location'}</div>
          <div class="sighting-date">📅 ${dateStr}</div>
          <div class="sighting-meta">
            ${photoCount > 0 ? `<span class="sighting-badge photos">📸 ${photoCount} photo${photoCount !== 1 ? 's' : ''}</span>` : ''}
            ${hasNotes ? `<span class="sighting-badge notes">📝 Notes</span>` : ''}
          </div>
        </div>

        <div class="sighting-actions">
          <button class="sighting-action-btn" data-action="view" title="View details">👁️</button>
          <button class="sighting-action-btn" data-action="edit" title="Edit">✏️</button>
          <button class="sighting-action-btn" data-action="delete" title="Delete">🗑️</button>
        </div>
      </div>
    `;
  }

  render() {
    const sightings = this.filter.applyFilters();

    if (sightings.length === 0) {
      return `
        <div class="sighting-empty-state">
          <div class="empty-state-icon">📭</div>
          <div class="empty-state-title">No sightings found</div>
          <div class="empty-state-description">
            ${this.filter.hasActiveFilters() 
              ? 'Try adjusting your filters' 
              : 'Start logging sightings to see them here'}
          </div>
        </div>
      `;
    }

    return `
      <div class="sighting-timeline">
        ${sightings.map(s => this.renderCard(s)).join('')}
      </div>
    `;
  }
}

class SightingDetailsModal {
  constructor() {
    this.modal = this.createModalElement();
    this.currentSighting = null;
  }

  createModalElement() {
    const modal = document.createElement('div');
    modal.className = 'sighting-details-modal';
    modal.setAttribute('hidden', '');
    modal.innerHTML = `
      <div class="sighting-details-content">
        <div class="sighting-details-header">
          <h2 class="sighting-details-title"></h2>
          <button class="sighting-details-close" aria-label="Close">✕</button>
        </div>
        <div class="sighting-details-body"></div>
        <div class="sighting-details-actions"></div>
      </div>
    `;
    document.body.appendChild(modal);
    this.setupEventListeners();
    return modal;
  }

  setupEventListeners() {
    const closeBtn = this.modal.querySelector('.sighting-details-close');
    closeBtn.addEventListener('click', () => this.close());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });
  }

  render(sighting) {
    this.currentSighting = sighting;
    const date = new Date(sighting.createdAt);
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    this.modal.querySelector('.sighting-details-title').textContent = sighting.species || 'Sighting';

    const body = this.modal.querySelector('.sighting-details-body');
    body.innerHTML = `
      <div class="sighting-details-section">
        <div class="sighting-details-section-title">📍 Location & Date</div>
        <div class="sighting-details-row">
          <div class="sighting-details-label">Location</div>
          <div class="sighting-details-value">${sighting.location || 'Not recorded'}</div>
        </div>
        <div class="sighting-details-row">
          <div class="sighting-details-label">Date</div>
          <div class="sighting-details-value">${dateStr}</div>
        </div>
      </div>

      ${sighting.photos && sighting.photos.length > 0 ? `
        <div class="sighting-details-section">
          <div class="sighting-details-section-title">📸 Photos</div>
          <div class="sighting-photo-gallery">
            ${sighting.photos.map((photo, idx) => `
              <div class="gallery-photo ${idx === 0 ? 'cover' : ''}" title="${idx === 0 ? 'Cover photo' : 'Photo ' + (idx + 1)}">
                <img src="${photo}" alt="Photo ${idx + 1}">
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${sighting.notes ? `
        <div class="sighting-details-section">
          <div class="sighting-details-section-title">📝 Notes</div>
          <div class="sighting-details-value">${sighting.notes}</div>
        </div>
      ` : ''}

      <div class="sighting-details-section">
        <div class="sighting-details-section-title">ℹ️ Details</div>
        <div class="sighting-details-row">
          <div class="sighting-details-label">Species</div>
          <div class="sighting-details-value">${sighting.species || 'Unknown'}</div>
        </div>
        <div class="sighting-details-row">
          <div class="sighting-details-label">Recorded At</div>
          <div class="sighting-details-value">${new Date(sighting.createdAt).toLocaleString()}</div>
        </div>
      </div>
    `;

    const actions = this.modal.querySelector('.sighting-details-actions');
    actions.innerHTML = `
      <button class="details-action-btn" data-action="export">📥 Export</button>
      <button class="details-action-btn" data-action="share">🔗 Share</button>
      <button class="details-action-btn danger" data-action="delete">🗑️ Delete</button>
    `;
  }

  open(sighting) {
    this.render(sighting);
    this.modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
    this.currentSighting = null;
  }

  isOpen() {
    return !this.modal.hasAttribute('hidden');
  }
}

class SightingHistoryDashboard {
  constructor() {
    this.history = new SightingHistory();
    this.stats = new StatisticsDashboard(this.history);
    this.filter = new SearchFilterManager(this.history);
    this.timeline = new SightingTimeline(this.history, this.filter);
    this.modal = new SightingDetailsModal();
  }

  init(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container #${containerId} not found`);
      return;
    }

    this.container = container;
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="history-dashboard">
        <div id="statsContainer"></div>
        <div id="filterContainer"></div>
        <div id="timelineContainer"></div>
      </div>
    `;

    // Render stats
    document.getElementById('statsContainer').innerHTML = this.stats.renderStats();

    // Render filter
    this.renderFilter();

    // Render timeline
    this.renderTimeline();
  }

  renderFilter() {
    const filterContainer = document.getElementById('filterContainer');
    const filterCount = this.filter.getFilterCount();

    filterContainer.innerHTML = `
      <div class="search-filter-panel">
        <div class="search-filter-row">
          <div class="filter-group">
            <label class="filter-label">Species</label>
            <input type="text" class="filter-input" id="filterSpecies" placeholder="Search species...">
          </div>
          <div class="filter-group">
            <label class="filter-label">Location</label>
            <input type="text" class="filter-input" id="filterLocation" placeholder="Search location...">
          </div>
          <div class="filter-group">
            <label class="filter-label">From Date</label>
            <input type="date" class="filter-input" id="filterDateFrom">
          </div>
          <div class="filter-group">
            <label class="filter-label">To Date</label>
            <input type="date" class="filter-input" id="filterDateTo">
          </div>
          <div class="filter-actions">
            <button class="filter-btn primary" id="applyFilters">Apply Filters</button>
            <button class="filter-btn" id="clearFilters">Clear</button>
            ${filterCount > 0 ? `<span class="filter-status active">${filterCount} active</span>` : ''}
          </div>
        </div>
      </div>
    `;

    // Restore filter values
    document.getElementById('filterSpecies').value = this.filter.filters.species;
    document.getElementById('filterLocation').value = this.filter.filters.location;
    if (this.filter.filters.dateFrom) {
      document.getElementById('filterDateFrom').value = this.filter.filters.dateFrom;
    }
    if (this.filter.filters.dateTo) {
      document.getElementById('filterDateTo').value = this.filter.filters.dateTo;
    }
  }

  renderTimeline() {
    document.getElementById('timelineContainer').innerHTML = this.timeline.render();
  }

  setupEventListeners() {
    // Filter buttons
    document.getElementById('applyFilters')?.addEventListener('click', () => {
      this.filter.setFilter('species', document.getElementById('filterSpecies').value);
      this.filter.setFilter('location', document.getElementById('filterLocation').value);
      this.filter.setFilter('dateFrom', document.getElementById('filterDateFrom').value);
      this.filter.setFilter('dateTo', document.getElementById('filterDateTo').value);
      this.render();
    });

    document.getElementById('clearFilters')?.addEventListener('click', () => {
      this.filter.clearFilters();
      this.render();
    });

    // Timeline card actions
    document.addEventListener('click', (e) => {
      const card = e.target.closest('.sighting-card');
      if (!card) return;

      const action = e.target.closest('button')?.dataset.action;
      const sightingId = parseInt(card.dataset.sightingId);
      const sighting = this.history.getSighting(sightingId);

      if (!sighting) return;

      switch (action) {
        case 'view':
          this.modal.open(sighting);
          break;
        case 'edit':
          // Trigger edit event
          document.dispatchEvent(new CustomEvent('sighting-edit', { detail: sighting }));
          break;
        case 'delete':
          if (confirm('Delete this sighting?')) {
            this.history.deleteSighting(sightingId);
            this.render();
          }
          break;
      }
    });

    // Modal actions
    document.addEventListener('click', (e) => {
      const action = e.target.closest('button')?.dataset.action;
      if (!action || !this.modal.currentSighting) return;

      switch (action) {
        case 'delete':
          if (confirm('Delete this sighting?')) {
            this.history.deleteSighting(this.modal.currentSighting.id);
            this.modal.close();
            this.render();
          }
          break;
        case 'export':
          this.exportSighting(this.modal.currentSighting);
          break;
        case 'share':
          this.shareSighting(this.modal.currentSighting);
          break;
      }
    });
  }

  exportSighting(sighting) {
    const csv = `Species,Location,Date,Notes\n"${sighting.species}","${sighting.location}","${sighting.createdAt}","${(sighting.notes || '').replace(/"/g, '""')}"`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sighting-${sighting.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  shareSighting(sighting) {
    const text = `I saw a ${sighting.species} at ${sighting.location} on ${new Date(sighting.createdAt).toLocaleDateString()}!`;
    if (navigator.share) {
      navigator.share({
        title: `Sighting: ${sighting.species}`,
        text: text
      });
    } else {
      alert(`${text}\n\n(Copy to share)`);
    }
  }

  exportAllCSV() {
    const sightings = this.history.getAllSightings();
    const csv = [
      ['Species', 'Location', 'Date', 'Notes', 'Photos'],
      ...sightings.map(s => [
        s.species,
        s.location,
        s.createdAt,
        (s.notes || '').replace(/"/g, '""'),
        s.photos?.length || 0
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sightings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportAllJSON() {
    const sightings = this.history.getAllSightings();
    const json = JSON.stringify(sightings, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sightings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

