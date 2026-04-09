/**
 * SPECIES EXPLORER ENHANCEMENTS - Phase 2
 * Favorites/Wishlist System, Species Comparison Modal, & ID Guides
 */

class SpeciesWishlist {
  constructor() {
    this.STORAGE_KEY = 'species_favorites';
    this.favorites = this.loadFromStorage();
    this.listeners = [];
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load favorites:', error);
      return [];
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.favorites));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }

  toggle(speciesId) {
    const index = this.favorites.indexOf(speciesId);
    if (index > -1) {
      this.favorites.splice(index, 1);
    } else {
      this.favorites.push(speciesId);
    }
    this.saveToStorage();
    return this.isFavorite(speciesId);
  }

  isFavorite(speciesId) {
    return this.favorites.includes(speciesId);
  }

  add(speciesId) {
    if (!this.isFavorite(speciesId)) {
      this.favorites.push(speciesId);
      this.saveToStorage();
    }
  }

  remove(speciesId) {
    const index = this.favorites.indexOf(speciesId);
    if (index > -1) {
      this.favorites.splice(index, 1);
      this.saveToStorage();
    }
  }

  getFavorites() {
    return [...this.favorites];
  }

  count() {
    return this.favorites.length;
  }

  onChange(callback) {
    this.listeners.push(callback);
  }

  notifyListeners() {
    this.listeners.forEach(cb => cb(this.favorites));
  }

  clear() {
    this.favorites = [];
    this.saveToStorage();
  }
}

class SpeciesComparison {
  constructor() {
    this.selectedSpecies = [];
    this.maxComparisons = 2;
    this.modal = null;
  }

  init(containerSelector) {
    this.modal = document.querySelector(containerSelector) || this.createModalElement();
    this.setupEventListeners();
  }

  createModalElement() {
    const modal = document.createElement('div');
    modal.className = 'species-comparison-modal';
    modal.setAttribute('hidden', '');
    modal.innerHTML = `
      <div class="comparison-modal-content">
        <div class="comparison-modal-header">
          <h2 class="comparison-modal-title">Compare Species</h2>
          <button class="comparison-modal-close" aria-label="Close">&times;</button>
        </div>
        <div class="comparison-modal-body">
          <div class="comparison-grid" id="comparisonGrid"></div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    return modal;
  }

  setupEventListeners() {
    const closeBtn = this.modal?.querySelector('.comparison-modal-close');
    closeBtn?.addEventListener('click', () => this.close());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });
  }

  addSpecies(species) {
    if (this.selectedSpecies.find(s => s.id === species.id)) return;
    if (this.selectedSpecies.length >= this.maxComparisons) {
      this.selectedSpecies.pop();
    }
    this.selectedSpecies.push(species);
  }

  clear() {
    this.selectedSpecies = [];
  }

  render() {
    if (!this.modal) return;
    const grid = this.modal.querySelector('#comparisonGrid');
    if (!grid) return;

    if (this.selectedSpecies.length === 0) {
      grid.innerHTML = '<div style="text-align: center; padding: 40px;">No species selected</div>';
      return;
    }

    grid.innerHTML = this.selectedSpecies.map(species => `
      <div class="comparison-column">
        <img src="${species.image}" alt="${species.name}" class="comparison-species-image">
        <div class="comparison-species-name">${species.name}</div>
        <div class="comparison-detail-row">
          <span class="comparison-detail-label">Size</span>
          <span class="comparison-detail-value">${species.size || 'No data'}</span>
        </div>
        <div class="comparison-detail-row">
          <span class="comparison-detail-label">Habitat</span>
          <span class="comparison-detail-value">${species.habitat || 'No data'}</span>
        </div>
      </div>
    `).join('');
  }

  open() {
    if (!this.modal) return;
    this.render();
    this.modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  }

  close() {
    if (!this.modal) return;
    this.modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  isOpen() {
    return this.modal && !this.modal.hasAttribute('hidden');
  }
}

class QuickIDGuide {
  constructor(species) {
    this.species = species;
  }

  render(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.innerHTML = `
      <div class="id-guide-container">
        <div class="id-guide-tabs">
          <button class="id-guide-tab active" data-tab="field-marks">🎯 Field Marks</button>
          <button class="id-guide-tab" data-tab="size-shape">📏 Size & Shape</button>
          <button class="id-guide-tab" data-tab="behavior">🏃 Behavior</button>
        </div>
        <div class="id-guide-content">
          <div class="id-guide-image-container">
            <img src="${this.species.image}" alt="${this.species.name}" class="id-guide-image">
          </div>
          <div class="id-guide-details">
            <div class="id-guide-details-title">🎯 Field Marks</div>
            <div class="id-guide-details-content" id="idGuideContent">
              ${this.renderTabContent('field-marks')}
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners(container);
  }

  renderTabContent(tab) {
    const content = {
      'field-marks': `<ul class="id-feature-list">${(this.species.fieldMarks || ['No data']).map(m => `<li class="id-feature-list-item">✓ ${m}</li>`).join('')}</ul>`,
      'size-shape': `<div class="comparison-detail-value">Size: ${this.species.size || 'No data'}</div>`,
      'behavior': `<div class="comparison-detail-value">${this.species.behavior || 'No data'}</div>`
    };
    return content[tab] || content['field-marks'];
  }

  attachEventListeners(container) {
    container.querySelectorAll('.id-guide-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        container.querySelectorAll('.id-guide-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        const content = container.querySelector('#idGuideContent');
        if (content) {
          content.innerHTML = this.renderTabContent(e.target.dataset.tab);
        }
      });
    });
  }
}

class SpeciesExplorer {
  constructor() {
    this.wishlist = new SpeciesWishlist();
    this.comparison = new SpeciesComparison();
    this.allSpecies = [];
    this.filterMode = 'all';
  }

  init() {
    this.comparison.init('.species-comparison-modal');
    this.setupEventDelegation();
    this.render();
  }

  setupEventDelegation() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('.species-favorite-btn')) {
        const card = e.target.closest('.species-card');
        if (card) this.toggleFavorite(card.dataset.speciesId);
      }

      if (e.target.closest('[data-action="compare"]')) {
        const card = e.target.closest('.species-card');
        if (card) this.addToComparison(card.dataset.speciesId);
      }

      if (e.target.closest('.favorites-filter-btn')) {
        this.filterMode = this.filterMode === 'favorites' ? 'all' : 'favorites';
        this.render();
      }
    });

    this.wishlist.onChange(() => this.render());
  }

  toggleFavorite(speciesId) {
    this.wishlist.toggle(speciesId);
  }

  addToComparison(speciesId) {
    const species = this.allSpecies.find(s => s.id === speciesId);
    if (species) {
      this.comparison.addSpecies(species);
      this.comparison.open();
    }
  }

  render() {
    if (this.filterMode === 'favorites') {
      const favs = this.wishlist.getFavorites();
      this.allSpecies = this.allSpecies.filter(s => favs.includes(s.id));
    }

    const grid = document.querySelector('.species-grid');
    if (!grid) return;

    grid.innerHTML = this.allSpecies.map(species => this.renderCard(species)).join('');
  }

  renderCard(species) {
    const isFav = this.wishlist.isFavorite(species.id);
    return `
      <div class="species-card ${isFav ? 'is-favorite' : ''}" data-species-id="${species.id}">
        <button class="species-favorite-btn ${isFav ? 'favorited' : ''}">
          ${isFav ? '❤️' : '🤍'}
        </button>
        <img src="${species.image}" alt="${species.name}" class="species-card-image">
        <div class="species-card-content">
          <div class="species-card-name">${species.name}</div>
          ${species.rarity ? `<span class="rarity-badge rarity-${species.rarity.toLowerCase()}">${species.rarity}</span>` : ''}
        </div>
        <div class="species-card-actions">
          <button class="species-card-action-btn compare" data-action="compare">Compare</button>
        </div>
      </div>
    `;
  }
}

