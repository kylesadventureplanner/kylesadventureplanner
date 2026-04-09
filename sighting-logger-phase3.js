/**
 * SIGHTING LOGGER ENHANCEMENTS - Phase 3
 * Draft Auto-Save, Location Suggestions, Photo Management
 */

class SightingDraftManager {
  constructor() {
    this.DRAFT_KEY = 'current_sighting_draft';
    this.AUTO_SAVE_INTERVAL = 10000; // 10 seconds
    this.lastSaveTime = null;
    this.isDirty = false;
    this.listeners = [];
  }

  startAutoSave(formSelector) {
    const form = document.querySelector(formSelector);
    if (!form) return;

    // Track form changes
    form.addEventListener('change', () => {
      this.isDirty = true;
    });

    form.addEventListener('input', () => {
      this.isDirty = true;
    });

    // Auto-save interval
    setInterval(() => {
      if (this.isDirty) {
        this.saveDraft(form);
      }
    }, this.AUTO_SAVE_INTERVAL);

    // Save on page unload
    window.addEventListener('beforeunload', () => {
      if (this.isDirty) {
        this.saveDraft(form);
      }
    });
  }

  collectFormData(formSelector) {
    const form = document.querySelector(formSelector);
    if (!form) return null;

    const data = {};
    const formData = new FormData(form);

    for (let [key, value] of formData.entries()) {
      if (data[key]) {
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    }

    // Add timestamp
    data.draftSavedAt = new Date().toISOString();

    return data;
  }

  saveDraft(form) {
    try {
      const data = this.collectFormData('form');
      if (!data) return;

      localStorage.setItem(this.DRAFT_KEY, JSON.stringify(data));
      this.lastSaveTime = new Date();
      this.isDirty = false;
      this.notifyListeners('saved', data);
      this.showSaveIndicator('saved');
    } catch (error) {
      console.error('Failed to save draft:', error);
      this.showSaveIndicator('error');
    }
  }

  restoreDraft(formSelector) {
    try {
      const draft = localStorage.getItem(this.DRAFT_KEY);
      if (!draft) return null;

      const data = JSON.parse(draft);
      const form = document.querySelector(formSelector);
      if (!form) return data;

      // Populate form with draft data
      for (let [key, value] of Object.entries(data)) {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
          if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = value === 'on' || value === true;
          } else {
            input.value = value;
          }
        }
      }

      return data;
    } catch (error) {
      console.error('Failed to restore draft:', error);
      return null;
    }
  }

  hasDraft() {
    try {
      return localStorage.getItem(this.DRAFT_KEY) !== null;
    } catch {
      return false;
    }
  }

  getDraftAge() {
    try {
      const draft = localStorage.getItem(this.DRAFT_KEY);
      if (!draft) return null;

      const data = JSON.parse(draft);
      const savedTime = new Date(data.draftSavedAt);
      const now = new Date();
      return Math.round((now - savedTime) / 1000); // seconds
    } catch {
      return null;
    }
  }

  clearDraft() {
    try {
      localStorage.removeItem(this.DRAFT_KEY);
      this.notifyListeners('cleared');
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }

  showSaveIndicator(status) {
    let indicator = document.querySelector('.draft-save-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'draft-save-indicator';
      document.body.appendChild(indicator);
    }

    indicator.className = `draft-save-indicator ${status}`;

    if (status === 'saving') {
      indicator.innerHTML = '<div class="draft-save-spinner"></div><span>Saving draft...</span>';
    } else if (status === 'saved') {
      indicator.innerHTML = '<div class="draft-save-checkmark"></div><span>Draft saved</span>';
      setTimeout(() => indicator.remove(), 3000);
    } else if (status === 'error') {
      indicator.innerHTML = '⚠️ <span>Failed to save draft</span>';
      setTimeout(() => indicator.remove(), 5000);
    }
  }

  onChange(callback) {
    this.listeners.push(callback);
  }

  notifyListeners(status, data) {
    this.listeners.forEach(cb => cb(status, data));
  }
}

class LocationSuggestions {
  constructor() {
    this.suggestedLocations = [];
    this.recentLocations = this.loadRecentLocations();
  }

  loadRecentLocations() {
    try {
      const stored = localStorage.getItem('recent_sighting_locations');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  saveLocation(location) {
    try {
      // Avoid duplicates
      this.recentLocations = this.recentLocations.filter(
        loc => `${loc.lat},${loc.lng}` !== `${location.lat},${location.lng}`
      );

      // Add to front
      this.recentLocations.unshift({
        name: location.name,
        lat: location.lat,
        lng: location.lng,
        timestamp: new Date().toISOString()
      });

      // Keep only last 10
      this.recentLocations = this.recentLocations.slice(0, 10);

      localStorage.setItem('recent_sighting_locations', JSON.stringify(this.recentLocations));
    } catch (error) {
      console.error('Failed to save location:', error);
    }
  }

  getSuggestions(query) {
    if (!query || query.length < 2) {
      return this.recentLocations;
    }

    const lowerQuery = query.toLowerCase();
    return this.recentLocations.filter(loc =>
      loc.name.toLowerCase().includes(lowerQuery)
    );
  }

  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          resolve({ lat: latitude, lng: longitude });
        },
        error => reject(error),
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  }

  formatDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance < 1 ? '<1 mi' : `${distance.toFixed(1)} mi`;
  }

  renderSuggestion(location, currentLat, currentLng) {
    const distance = currentLat && currentLng ?
      this.formatDistance(currentLat, currentLng, location.lat, location.lng) : null;

    return `
      <div class="location-suggestion" data-lat="${location.lat}" data-lng="${location.lng}">
        <div class="location-suggestion-name">${location.name}</div>
        <div class="location-suggestion-meta">
          ${location.timestamp ? `<span>Last used: ${new Date(location.timestamp).toLocaleDateString()}</span>` : ''}
          ${distance ? `<span class="location-suggestion-distance">${distance}</span>` : ''}
        </div>
      </div>
    `;
  }
}

class PhotoManager {
  constructor() {
    this.photos = [];
    this.coverPhotoIndex = null;
  }

  addPhoto(file) {
    if (!file.type.startsWith('image/')) {
      throw new Error('Invalid file type');
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      throw new Error('File too large');
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.photos.push({
        id: Date.now(),
        data: e.target.result,
        size: file.size,
        type: file.type,
        addedAt: new Date()
      });
      this.notifyListeners();
    };
    reader.readAsDataURL(file);
  }

  removePhoto(photoId) {
    const index = this.photos.findIndex(p => p.id === photoId);
    if (index > -1) {
      this.photos.splice(index, 1);
      if (this.coverPhotoIndex === index) {
        this.coverPhotoIndex = null;
      }
      this.notifyListeners();
    }
  }

  reorderPhotos(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;

    const [photo] = this.photos.splice(fromIndex, 1);
    this.photos.splice(toIndex, 0, photo);

    if (this.coverPhotoIndex === fromIndex) {
      this.coverPhotoIndex = toIndex;
    }

    this.notifyListeners();
  }

  setCoverPhoto(photoId) {
    const index = this.photos.findIndex(p => p.id === photoId);
    if (index > -1) {
      this.coverPhotoIndex = index;
      this.notifyListeners();
    }
  }

  getPhotos() {
    return [...this.photos];
  }

  getCoverPhoto() {
    if (this.coverPhotoIndex !== null && this.coverPhotoIndex < this.photos.length) {
      return this.photos[this.coverPhotoIndex];
    }
    return this.photos[0] || null;
  }

  renderGrid() {
    return this.photos.map((photo, index) => `
      <div class="photo-item" data-photo-id="${photo.id}" draggable="true">
        <img src="${photo.data}" alt="Sighting photo" class="photo-image">
        ${this.coverPhotoIndex === index ? '<div class="photo-badge cover">Cover</div>' : ''}
        <div class="photo-actions">
          <button class="photo-action-btn" data-action="set-cover" title="Set as cover photo">📌</button>
          <button class="photo-action-btn" data-action="delete" title="Delete photo">🗑️</button>
        </div>
      </div>
    `).join('');
  }

  listeners = [];

  onChange(callback) {
    this.listeners.push(callback);
  }

  notifyListeners() {
    this.listeners.forEach(cb => cb(this.photos));
  }
}

class SightingLogger {
  constructor() {
    this.draftManager = new SightingDraftManager();
    this.locationSuggestions = new LocationSuggestions();
    this.photoManager = new PhotoManager();
  }

  init(formSelector) {
    this.setupDraftSystem(formSelector);
    this.setupLocationSystem();
    this.setupPhotoSystem();
  }

  setupDraftSystem(formSelector) {
    const form = document.querySelector(formSelector);
    if (!form) return;

    // Check for existing draft
    if (this.draftManager.hasDraft()) {
      this.showDraftRecoveryBanner();
    }

    // Start auto-save
    this.draftManager.startAutoSave(formSelector);

    // Restore draft on page load
    this.draftManager.restoreDraft(formSelector);
  }

  showDraftRecoveryBanner() {
    const age = this.draftManager.getDraftAge();
    const timeStr = age < 60 ? `${age}s ago` : `${Math.round(age / 60)}m ago`;

    const banner = document.createElement('div');
    banner.className = 'draft-recovery-banner';
    banner.innerHTML = `
      <div class="draft-recovery-content">
        <div class="draft-recovery-title">📝 Draft Found</div>
        <div class="draft-recovery-time">Last saved ${timeStr}</div>
      </div>
      <div class="draft-recovery-actions">
        <button class="draft-recovery-btn restore">Restore</button>
        <button class="draft-recovery-btn discard">Discard</button>
      </div>
    `;

    banner.querySelector('.restore').onclick = () => {
      banner.remove();
      window.location.reload(); // Reload to show restored data
    };

    banner.querySelector('.discard').onclick = () => {
      this.draftManager.clearDraft();
      banner.remove();
    };

    document.querySelector('form')?.parentElement?.insertBefore(banner, document.querySelector('form'));
  }

  setupLocationSystem() {
    const input = document.querySelector('.location-input');
    if (!input) return;

    const suggestions = document.querySelector('.location-suggestions');
    const gpsBtn = document.querySelector('.location-gps-btn');

    // Autocomplete suggestions
    input.addEventListener('input', (e) => {
      const query = e.target.value;
      const results = this.locationSuggestions.getSuggestions(query);

      if (results.length > 0 && suggestions) {
        suggestions.innerHTML = results.map(loc =>
          this.locationSuggestions.renderSuggestion(loc)
        ).join('');
        suggestions.removeAttribute('hidden');
      } else {
        suggestions?.setAttribute('hidden', '');
      }
    });

    // GPS button
    if (gpsBtn) {
      gpsBtn.addEventListener('click', async () => {
        gpsBtn.classList.add('loading');
        gpsBtn.disabled = true;

        try {
          const location = await this.locationSuggestions.getCurrentLocation();
          input.value = `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
          this.locationSuggestions.saveLocation({
            name: `GPS: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
            lat: location.lat,
            lng: location.lng
          });
          suggestions?.setAttribute('hidden', '');
        } catch (error) {
          console.error('GPS Error:', error);
          alert('Could not get location. Please enable location services.');
        } finally {
          gpsBtn.classList.remove('loading');
          gpsBtn.disabled = false;
        }
      });
    }

    // Handle suggestion selection
    document.addEventListener('click', (e) => {
      if (e.target.closest('.location-suggestion')) {
        const lat = e.target.closest('.location-suggestion').dataset.lat;
        const lng = e.target.closest('.location-suggestion').dataset.lng;
        input.value = `${lat}, ${lng}`;
        suggestions?.setAttribute('hidden', '');
      }
    });
  }

  setupPhotoSystem() {
    const grid = document.querySelector('.sighting-photos-grid');
    const uploadArea = document.querySelector('.photo-upload-area');
    const input = document.querySelector('.photo-input');

    if (!grid || !uploadArea || !input) return;

    // File input handler
    input.addEventListener('change', (e) => {
      Array.from(e.target.files).forEach(file => {
        try {
          this.photoManager.addPhoto(file);
        } catch (error) {
          alert(`Error: ${error.message}`);
        }
      });
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('drag-over');

      Array.from(e.dataTransfer.files).forEach(file => {
        try {
          this.photoManager.addPhoto(file);
        } catch (error) {
          alert(`Error: ${error.message}`);
        }
      });
    });

    // Click to add
    uploadArea.addEventListener('click', () => {
      input.click();
    });

    // Photo manager changes
    this.photoManager.onChange(() => {
      grid.innerHTML = this.photoManager.renderGrid();
      this.attachPhotoHandlers();
    });

    // Initial render
    this.attachPhotoHandlers();
  }

  attachPhotoHandlers() {
    const items = document.querySelectorAll('.photo-item');

    // Drag handlers
    items.forEach((item, index) => {
      item.addEventListener('dragstart', () => {
        item.classList.add('dragging');
        item.dataset.dragIndex = index;
      });

      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
      });

      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (item !== e.target.closest('.photo-item')) {
          item.classList.add('drag-over');
        }
      });

      item.addEventListener('dragleave', () => {
        item.classList.remove('drag-over');
      });

      item.addEventListener('drop', (e) => {
        e.preventDefault();
        item.classList.remove('drag-over');

        const dragIndex = parseInt(document.querySelector('.photo-item.dragging')?.dataset.dragIndex);
        if (dragIndex !== undefined && dragIndex !== index) {
          this.photoManager.reorderPhotos(dragIndex, index);
        }
      });
    });

    // Action buttons
    document.querySelectorAll('.photo-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const photoId = parseInt(btn.closest('.photo-item').dataset.photoId);

        if (action === 'delete') {
          this.photoManager.removePhoto(photoId);
        } else if (action === 'set-cover') {
          this.photoManager.setCoverPhoto(photoId);
        }
      });
    });
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SightingLogger,
    SightingDraftManager,
    LocationSuggestions,
    PhotoManager
  };
}

