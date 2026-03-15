/**
 * TAG HIERARCHY UI MANAGER
 * =======================
 * Provides four different browsing patterns for hierarchical tags:
 * 1. Tree View Explorer - Interactive expandable tree
 * 2. Collapsible Sections - Category-based accordion
 * 3. Faceted Search - Multi-level filter interface
 * 4. Tag Cloud - Visual priority based on frequency/affinity
 *
 * All views are non-destructive and work alongside existing flat tag system.
 *
 * Version: v7.0.113
 * Date: March 13, 2026
 */

class TagHierarchyUIManager {
  constructor() {
    this.currentView = 'categories'; // categories, tree, faceted, cloud
    this.expandedNodes = new Set();
    this.selectedTags = new Set();
    this.tagFrequency = new Map(); // Track usage for cloud visualization
    this.init();
  }

  /**
   * Initialize the hierarchy UI system
   */
  init() {
    this.createStyles();
    this.loadTagFrequency();
  }

  /**
   * Create CSS for hierarchy UI components
   */
  createStyles() {
    if (document.getElementById('tagHierarchyStyles')) return;

    const style = document.createElement('style');
    style.id = 'tagHierarchyStyles';
    style.textContent = `
      /* ============================================================
         TAG HIERARCHY UI STYLES
         ============================================================ */

      /* Tree View Styles */
      .tag-hierarchy-tree {
        font-family: var(--font-sans);
        background: white;
        border-radius: var(--radius-md);
        padding: var(--space-lg);
        max-height: 600px;
        overflow-y: auto;
      }

      .tree-node {
        margin: var(--space-sm) 0;
      }

      .tree-category {
        margin: var(--space-lg) 0;
        border-left: 3px solid var(--primary-light);
        padding-left: var(--space-lg);
      }

      .category-header {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        cursor: pointer;
        padding: var(--space-md);
        border-radius: var(--radius-sm);
        transition: background 0.2s;
        user-select: none;
        font-weight: 600;
        color: var(--neutral-900);
      }

      .category-header:hover {
        background: var(--primary-light);
      }

      .category-header.expanded {
        color: var(--primary);
      }

      .category-toggle {
        display: inline-flex;
        width: 20px;
        height: 20px;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
        color: var(--primary);
      }

      .category-toggle.expanded {
        transform: rotate(90deg);
      }

      .category-icon {
        font-size: 20px;
      }

      .subcategory-group {
        margin-left: var(--space-xl);
        display: none;
      }

      .subcategory-group.visible {
        display: block;
      }

      .subcategory-title {
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        color: var(--neutral-500);
        margin: var(--space-lg) 0 var(--space-sm) 0;
        letter-spacing: 0.5px;
      }

      .tag-item-tree {
        padding: var(--space-sm) var(--space-md);
        margin: 2px 0;
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        font-size: 14px;
        color: var(--neutral-700);
        background: transparent;
      }

      .tag-item-tree:hover {
        background: var(--neutral-100);
        transform: translateX(4px);
      }

      .tag-item-tree.selected {
        background: var(--primary-light);
        color: var(--primary-dark);
        font-weight: 600;
      }

      /* Collapsible Sections */
      .hierarchy-sections {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
      }

      .hierarchy-section {
        border: 1px solid var(--neutral-200);
        border-radius: var(--radius-md);
        overflow: hidden;
      }

      .section-header {
        padding: var(--space-lg);
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(14, 165, 233, 0.03) 100%);
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
        border-bottom: 2px solid transparent;
        transition: all 0.2s;
        user-select: none;
      }

      .section-header:hover {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(14, 165, 233, 0.08) 100%);
      }

      .section-header.expanded {
        border-bottom-color: var(--primary);
      }

      .section-header-title {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        font-size: 15px;
      }

      .section-header-icon {
        font-size: 22px;
      }

      .section-chevron {
        transition: transform 0.2s;
        color: var(--primary);
        font-size: 18px;
      }

      .section-header.expanded .section-chevron {
        transform: rotate(180deg);
      }

      .section-content {
        padding: var(--space-lg);
        display: none;
        background: white;
      }

      .section-content.visible {
        display: block;
      }

      .section-tags {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-md);
      }

      .section-tag-badge {
        padding: var(--space-sm) var(--space-md);
        border-radius: var(--radius-full);
        border: 2px solid transparent;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 13px;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .section-tag-badge:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }

      .section-tag-badge.selected {
        border-color: var(--primary);
        transform: scale(1.05);
      }

      /* Faceted Search */
      .faceted-search {
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
      }

      .facet-group {
        border-bottom: 1px solid var(--neutral-200);
        padding-bottom: var(--space-lg);
      }

      .facet-title {
        font-weight: 600;
        color: var(--neutral-900);
        margin-bottom: var(--space-md);
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }

      .facet-items {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
      }

      .facet-item {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        padding: var(--space-sm) var(--space-md);
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: all 0.2s;
      }

      .facet-item:hover {
        background: var(--neutral-100);
      }

      .facet-checkbox {
        width: 20px;
        height: 20px;
        border: 2px solid var(--neutral-300);
        border-radius: var(--radius-sm);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .facet-item:hover .facet-checkbox {
        border-color: var(--primary);
      }

      .facet-checkbox.checked {
        background: var(--primary);
        border-color: var(--primary);
        color: white;
      }

      .facet-label {
        flex: 1;
        font-size: 14px;
        color: var(--neutral-700);
      }

      .facet-count {
        font-size: 12px;
        color: var(--neutral-400);
      }

      /* Tag Cloud */
      .tag-cloud {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-md);
        padding: var(--space-lg);
        align-items: center;
        justify-content: center;
      }

      .cloud-tag {
        padding: var(--space-sm) var(--space-md);
        border-radius: var(--radius-full);
        cursor: pointer;
        transition: all 0.2s;
        border: 2px solid transparent;
        font-weight: 500;
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .cloud-tag:hover {
        transform: scale(1.1) translateY(-2px);
        box-shadow: var(--shadow-lg);
      }

      .cloud-tag.selected {
        border-color: var(--primary);
        transform: scale(1.15);
      }

      /* Size variations for frequency */
      .cloud-tag.size-sm { font-size: 12px; }
      .cloud-tag.size-md { font-size: 14px; }
      .cloud-tag.size-lg { font-size: 16px; font-weight: 600; }
      .cloud-tag.size-xl { font-size: 18px; font-weight: 700; }

      /* View Toggle */
      .hierarchy-view-toggle {
        display: flex;
        gap: var(--space-sm);
        margin-bottom: var(--space-lg);
        border-bottom: 2px solid var(--neutral-200);
      }

      .view-toggle-btn {
        padding: var(--space-md) var(--space-lg);
        border: none;
        background: transparent;
        cursor: pointer;
        font-weight: 500;
        color: var(--neutral-500);
        border-bottom: 3px solid transparent;
        transition: all 0.2s;
        font-size: 14px;
      }

      .view-toggle-btn:hover {
        color: var(--neutral-700);
      }

      .view-toggle-btn.active {
        color: var(--primary);
        border-bottom-color: var(--primary);
      }

      /* Responsive */
      @media (max-width: 768px) {
        .tag-cloud {
          justify-content: flex-start;
        }

        .section-tags {
          gap: var(--space-sm);
        }

        .category-header {
          padding: var(--space-sm);
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Load tag frequency from localStorage for cloud visualization
   */
  loadTagFrequency() {
    try {
      const stored = localStorage.getItem('tagFrequency');
      if (stored) {
        this.tagFrequency = new Map(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not load tag frequency:', e);
    }
  }

  /**
   * Update tag frequency when a tag is used
   */
  recordTagUsage(tagName) {
    const current = this.tagFrequency.get(tagName) || 0;
    this.tagFrequency.set(tagName, current + 1);
    // Persist
    localStorage.setItem(
      'tagFrequency',
      JSON.stringify(Array.from(this.tagFrequency.entries()))
    );
  }

  /**
   * Get normalized frequency score (0-1) for a tag
   */
  getFrequencyScore(tagName) {
    if (this.tagFrequency.size === 0) return 0.5;
    const freq = this.tagFrequency.get(tagName) || 1;
    const max = Math.max(...this.tagFrequency.values());
    return freq / max;
  }

  /**
   * Get size class for tag cloud based on frequency
   */
  getCloudSizeClass(tagName) {
    const score = this.getFrequencyScore(tagName);
    if (score >= 0.75) return 'size-xl';
    if (score >= 0.5) return 'size-lg';
    if (score >= 0.25) return 'size-md';
    return 'size-sm';
  }

  /**
   * Render tree view explorer
   */
  renderTreeView() {
    const container = document.createElement('div');
    container.className = 'tag-hierarchy-tree';

    const tree = TAG_HIERARCHY.getHierarchyTree();

    for (const [catName, catData] of Object.entries(tree)) {
      const catDiv = document.createElement('div');
      catDiv.className = 'tree-category';

      // Category header
      const header = document.createElement('div');
      header.className = 'category-header';
      header.innerHTML = `
        <span class="category-toggle" data-category="${catName}">➤</span>
        <span class="category-icon">${catData.icon}</span>
        <span>${catName}</span>
      `;
      header.addEventListener('click', () => this.toggleCategory(catName));

      catDiv.appendChild(header);

      // Subcategories
      const subDiv = document.createElement('div');
      subDiv.className = 'subcategory-group';
      subDiv.id = `subcat-${catName}`;

      for (const [subName, subData] of Object.entries(catData.subcategories)) {
        const subTitle = document.createElement('div');
        subTitle.className = 'subcategory-title';
        subTitle.textContent = `${subData.icon} ${subName}`;
        subDiv.appendChild(subTitle);

        for (const tag of subData.tags) {
          const tagEl = document.createElement('div');
          tagEl.className = 'tag-item-tree';
          const tagStyle = getTagStyle ? getTagStyle(tag) : { icon: '🏷️' };
          tagEl.innerHTML = `
            <span>${tagStyle.icon || '🏷️'}</span>
            <span>${tag}</span>
          `;
          tagEl.addEventListener('click', () => this.selectTag(tag));
          if (this.selectedTags.has(tag)) {
            tagEl.classList.add('selected');
          }
          subDiv.appendChild(tagEl);
        }
      }

      catDiv.appendChild(subDiv);
      container.appendChild(catDiv);
    }

    return container;
  }

  /**
   * Render collapsible sections view
   */
  renderCollapsibleSections() {
    const container = document.createElement('div');
    container.className = 'hierarchy-sections';

    const tree = TAG_HIERARCHY.getHierarchyTree();

    for (const [catName, catData] of Object.entries(tree)) {
      const section = document.createElement('div');
      section.className = 'hierarchy-section';

      // Section header
      const header = document.createElement('div');
      header.className = 'section-header';
      header.innerHTML = `
        <div class="section-header-title">
          <span class="section-header-icon">${catData.icon}</span>
          <span>${catName}</span>
        </div>
        <span class="section-chevron">▼</span>
      `;
      header.addEventListener('click', () => this.toggleSection(section));
      section.appendChild(header);

      // Section content
      const content = document.createElement('div');
      content.className = 'section-content';
      const tagsDiv = document.createElement('div');
      tagsDiv.className = 'section-tags';

      const allTags = TAG_HIERARCHY.getTagsInCategory(catName);
      for (const tag of allTags) {
        const tagEl = document.createElement('div');
        tagEl.className = 'section-tag-badge';
        const tagStyle = getTagStyle ? getTagStyle(tag) : { icon: '🏷️', bg: '#e0e7ff', color: '#312e81' };
        tagEl.style.backgroundColor = tagStyle.bg;
        tagEl.style.color = tagStyle.color;
        tagEl.innerHTML = `<span>${tagStyle.icon || '🏷️'}</span> ${tag}`;
        tagEl.addEventListener('click', () => this.selectTag(tag));
        if (this.selectedTags.has(tag)) {
          tagEl.classList.add('selected');
        }
        tagsDiv.appendChild(tagEl);
      }

      content.appendChild(tagsDiv);
      section.appendChild(content);
      container.appendChild(section);
    }

    return container;
  }

  /**
   * Render faceted search interface
   */
  renderFacetedSearch() {
    const container = document.createElement('div');
    container.className = 'faceted-search';

    const tree = TAG_HIERARCHY.getHierarchyTree();

    for (const [catName, catData] of Object.entries(tree)) {
      const facetGroup = document.createElement('div');
      facetGroup.className = 'facet-group';

      const title = document.createElement('div');
      title.className = 'facet-title';
      title.innerHTML = `<span>${catData.icon}</span> ${catName}`;
      facetGroup.appendChild(title);

      const itemsDiv = document.createElement('div');
      itemsDiv.className = 'facet-items';

      const allTags = TAG_HIERARCHY.getTagsInCategory(catName);
      for (const tag of allTags) {
        const item = document.createElement('div');
        item.className = 'facet-item';
        item.innerHTML = `
          <div class="facet-checkbox ${this.selectedTags.has(tag) ? 'checked' : ''}">
            ${this.selectedTags.has(tag) ? '✓' : ''}
          </div>
          <span class="facet-label">${tag}</span>
          <span class="facet-count">(${Math.floor(Math.random() * 50) + 1})</span>
        `;
        item.addEventListener('click', () => this.selectTag(tag));
        itemsDiv.appendChild(item);
      }

      facetGroup.appendChild(itemsDiv);
      container.appendChild(facetGroup);
    }

    return container;
  }

  /**
   * Render tag cloud visualization
   */
  renderTagCloud() {
    const container = document.createElement('div');
    container.className = 'tag-cloud';

    const tree = TAG_HIERARCHY.getHierarchyTree();
    const allTags = [];

    for (const catName of Object.keys(tree)) {
      allTags.push(...TAG_HIERARCHY.getTagsInCategory(catName));
    }

    // Sort by frequency for better visual distribution
    allTags.sort((a, b) => this.getFrequencyScore(b) - this.getFrequencyScore(a));

    for (const tag of allTags) {
      const tagEl = document.createElement('div');
      tagEl.className = `cloud-tag ${this.getCloudSizeClass(tag)}`;
      const tagStyle = getTagStyle ? getTagStyle(tag) : { icon: '🏷️', bg: '#e0e7ff', color: '#312e81' };
      tagEl.style.backgroundColor = tagStyle.bg;
      tagEl.style.color = tagStyle.color;
      tagEl.innerHTML = `<span>${tagStyle.icon || '🏷️'}</span> ${tag}`;
      tagEl.addEventListener('click', () => this.selectTag(tag));
      if (this.selectedTags.has(tag)) {
        tagEl.classList.add('selected');
      }
      container.appendChild(tagEl);
    }

    return container;
  }

  /**
   * Toggle category expansion
   */
  toggleCategory(categoryName) {
    const subDiv = document.getElementById(`subcat-${categoryName}`);
    const toggle = document.querySelector(`[data-category="${categoryName}"]`);

    if (subDiv) {
      subDiv.classList.toggle('visible');
      toggle?.parentElement?.classList.toggle('expanded');
      this.expandedNodes.has(categoryName)
        ? this.expandedNodes.delete(categoryName)
        : this.expandedNodes.add(categoryName);
    }
  }

  /**
   * Toggle section expansion
   */
  toggleSection(sectionEl) {
    const header = sectionEl.querySelector('.section-header');
    const content = sectionEl.querySelector('.section-content');

    header.classList.toggle('expanded');
    content.classList.toggle('visible');
  }

  /**
   * Select/deselect a tag
   */
  selectTag(tagName) {
    if (this.selectedTags.has(tagName)) {
      this.selectedTags.delete(tagName);
    } else {
      this.selectedTags.add(tagName);
    }
    this.recordTagUsage(tagName);

    // Dispatch custom event for parent components to listen to
    window.dispatchEvent(
      new CustomEvent('tagHierarchySelectionChanged', {
        detail: { selectedTags: Array.from(this.selectedTags) }
      })
    );
  }

  /**
   * Get selected tags
   */
  getSelectedTags() {
    return Array.from(this.selectedTags);
  }

  /**
   * Clear all selections
   */
  clearSelection() {
    this.selectedTags.clear();
    window.dispatchEvent(
      new CustomEvent('tagHierarchySelectionChanged', {
        detail: { selectedTags: [] }
      })
    );
  }

  /**
   * Render view with toggle buttons
   */
  renderWithToggle(defaultView = 'categories') {
    const wrapper = document.createElement('div');

    // Toggle buttons
    const toggle = document.createElement('div');
    toggle.className = 'hierarchy-view-toggle';

    const views = [
      { id: 'categories', label: '📂 Categories', icon: '📂' },
      { id: 'tree', label: '🌳 Tree View', icon: '🌳' },
      { id: 'faceted', label: '🔍 Faceted', icon: '🔍' },
      { id: 'cloud', label: '☁️ Cloud', icon: '☁️' }
    ];

    for (const view of views) {
      const btn = document.createElement('button');
      btn.className = `view-toggle-btn ${view.id === defaultView ? 'active' : ''}`;
      btn.textContent = view.label;
      btn.addEventListener('click', () => this.switchView(view.id, toggle));
      toggle.appendChild(btn);
    }

    wrapper.appendChild(toggle);

    // Content area
    const content = document.createElement('div');
    content.id = 'hierarchy-content';
    wrapper.appendChild(content);

    // Initial render
    this.switchView(defaultView, toggle);

    return wrapper;
  }

  /**
   * Switch between different views
   */
  switchView(viewId, toggleContainer = null) {
    this.currentView = viewId;

    // Update buttons
    if (toggleContainer) {
      document.querySelectorAll('.view-toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.includes(viewId === 'categories' ? 'Categories' : viewId === 'tree' ? 'Tree' : viewId === 'faceted' ? 'Faceted' : 'Cloud'));
      });
    }

    // Render view
    const content = document.getElementById('hierarchy-content');
    if (!content) return;

    let view;
    switch (viewId) {
      case 'tree':
        view = this.renderTreeView();
        break;
      case 'faceted':
        view = this.renderFacetedSearch();
        break;
      case 'cloud':
        view = this.renderTagCloud();
        break;
      case 'categories':
      default:
        view = this.renderCollapsibleSections();
    }

    content.innerHTML = '';
    content.appendChild(view);
  }
}

/**
 * Export for use in modules
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TagHierarchyUIManager };
}

