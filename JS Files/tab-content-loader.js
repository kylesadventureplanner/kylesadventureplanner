/**
 * TAB CONTENT LOADER - WITH LAZY LOADING & PERFORMANCE OPTIMIZATION
 * ==================================================================
 * Dynamically loads tab content from separate HTML files on-demand
 * Features:
 * - Lazy loading (only load when tab is clicked)
 * - Loading indicators
 * - Performance metrics
 * - Error handling
 * - Cache management
 * - Priority loading (load adventure-planner first)
 *
 * Version: 2.0 (with Lazy Loading)
 * Date: March 14, 2026
 */

class TabContentLoader {
  constructor() {
    this.tabsPath = 'HTML Files/tabs/';  // ← FIXED: Correct path to tabs folder
    this.loadedTabs = new Set();
    this.loadingTabs = new Set();
    this.tabCache = new Map();
    this.loadTimes = new Map();
    this.isInitialized = false;
    this.initializeTabs();
  }

  /**
   * Initialize tab loading system
   */
  initializeTabs() {
    console.log('📑 Tab Content Loader v2.0 (Lazy Loading) Initializing');

    // Tab definitions with priority
    this.tabs = {
      'adventure-planner': {
        file: null,  // ← No file needed - already in index!
        element: 'adventurePlannerTab',
        priority: 1,
        preload: true,
        isInlineContent: true  // ← Mark as inline
      },
      'birding': {
        file: 'birding-locations-tab.html',
        element: 'birdingTab',
        priority: 2,
        preload: false,
        isInlineContent: false
      },
      'recipes': {
        file: 'recipes-tab.html',
        element: 'recipesTab',
        priority: 3,
        preload: false,
        isInlineContent: false
      },
      'garden': {
        file: 'garden-planner-tab.html',
        element: 'gardenTab',
        priority: 4,
        preload: false,
        isInlineContent: false
      },
      'budget': {
        file: 'budget-planner-tab.html',
        element: 'budgetTab',
        priority: 5,
        preload: false,
        isInlineContent: false
      }
    };

    // Set up tab switching event listeners
    this.setupTabSwitching();

    // Preload high-priority tabs
    this.preloadTabs();

    this.isInitialized = true;
    console.log('✅ Tab Content Loader Ready (Lazy Loading Enabled)');
  }

  /**
   * Preload high-priority tabs in background
   */
  preloadTabs() {
    Object.entries(this.tabs).forEach(([tabId, tabInfo]) => {
      if (tabInfo.preload) {
        // Preload adventure-planner immediately
        console.log(`🔄 Preloading high-priority tab: ${tabId}`);
        this.loadTab(tabId, true); // true = preload mode (no UI changes)
      }
    });

    // Preload other tabs after a delay (lower priority)
    setTimeout(() => {
      Object.entries(this.tabs).forEach(([tabId, tabInfo]) => {
        if (!tabInfo.preload && !this.loadedTabs.has(tabId)) {
          console.log(`🔄 Preloading background tab: ${tabId}`);
          this.loadTab(tabId, true); // Preload in background
        }
      });
    }, 2000); // 2 second delay
  }

  /**
   * Set up tab switching with event delegation
   * Ensures tabs remain responsive after DOM updates
   */
  setupTabSwitching() {
    // Use event delegation on document for better reliability
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.app-tab-btn');
      if (!btn) return;

      e.preventDefault();
      e.stopPropagation();

      const tabId = btn.getAttribute('data-tab');
      if (tabId) {
        console.log(`📑 Tab button clicked (delegated): ${tabId}`);
        this.switchTab(tabId);
      }
    }, true); // Use capture phase for reliable event handling

    console.log('✅ Tab switching initialized with event delegation');
  }

  /**
   * Switch to a tab
   */
  switchTab(tabId) {
    console.log(`📑 Switching to tab: ${tabId}`);

    // Hide all tabs
    document.querySelectorAll('.app-tab-pane').forEach(pane => {
      pane.classList.remove('active');
    });

    // Remove active state from buttons
    document.querySelectorAll('.app-tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    // Activate clicked tab button
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

    // Show selected tab
    const tabPane = document.querySelector(`.app-tab-pane[data-tab="${tabId}"]`);

    if (!tabPane) {
      console.error(`❌ Tab pane not found for tab: ${tabId}`);
      return;
    }

    tabPane.classList.add('active');

    // Show loading indicator if not already loaded
    if (!this.loadedTabs.has(tabId) && !this.loadingTabs.has(tabId)) {
      this.showLoadingIndicator(tabPane);
    }

    // Load content if not already loaded (lazy loading)
    if (!this.loadedTabs.has(tabId)) {
      this.loadTab(tabId, false); // false = user-triggered load
    } else {
      this.hideLoadingIndicator(tabPane);
    }
  }

  /**
   * Show loading indicator
   */
  showLoadingIndicator(container) {
    const indicator = document.createElement('div');
    indicator.className = 'tab-loading-indicator';
    indicator.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px;">
        <div style="
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 16px;
        "></div>
        <p style="color: #6b7280; font-weight: 600;">Loading content...</p>
      </div>
      <style>
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    `;
    container.innerHTML = '';
    container.appendChild(indicator);
  }

  /**
   * Hide loading indicator
   */
  hideLoadingIndicator(container) {
    const indicator = container.querySelector('.tab-loading-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  /**
   * Load tab content from HTML file (lazy loading)
   */
  async loadTab(tabId, isPreload = false) {
    try {
      if (this.loadedTabs.has(tabId)) {
        console.log(`✅ Tab already loaded: ${tabId}`);
        return;
      }

      if (this.loadingTabs.has(tabId)) {
        console.log(`⏳ Tab already loading: ${tabId}`);
        return;
      }

      this.loadingTabs.add(tabId);
      const startTime = performance.now();

      const tabInfo = this.tabs[tabId];
      if (!tabInfo) {
        console.error(`❌ Tab not found: ${tabId}`);
        this.loadingTabs.delete(tabId);
        return;
      }

      // ← NEW: Handle inline content (already in index)
      if (tabInfo.isInlineContent) {
        console.log(`✅ Using inline content for tab: ${tabId}`);
        const loadTime = performance.now() - startTime;
        this.loadTimes.set(tabId, loadTime);
        this.loadedTabs.add(tabId);
        this.loadingTabs.delete(tabId);
        this.initializeTab(tabId);
        return;
      }

      const url = `${this.tabsPath}${tabInfo.file}`;
      const loadType = isPreload ? 'PRELOAD' : 'USER-TRIGGERED';
      console.log(`📥 [${loadType}] Loading tab content from: ${url}`);

      // Check cache first
      if (this.tabCache.has(tabId)) {
        console.log(`💾 Using cached content for tab: ${tabId}`);
        const cachedContent = this.tabCache.get(tabId);
        this.insertTabContent(tabId, cachedContent);
        this.loadingTabs.delete(tabId);
        return;
      }

      // Fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to load ${url}: ${response.statusText}`);
      }

      const htmlContent = await response.text();

      // Cache the content
      this.tabCache.set(tabId, htmlContent);

      // Calculate load time
      const loadTime = performance.now() - startTime;
      this.loadTimes.set(tabId, loadTime);
      console.log(`⏱️  Tab loaded in ${loadTime.toFixed(2)}ms: ${tabId}`);

      // Insert content
      this.insertTabContent(tabId, htmlContent);

      // Mark as loaded
      this.loadedTabs.add(tabId);
      this.loadingTabs.delete(tabId);

      // Execute any scripts in the loaded content
      this.executeScripts(tabId);

      // Trigger tab-specific initialization
      this.initializeTab(tabId);

      // Log performance
      if (!isPreload) {
        console.log(`✅ Tab loaded and displayed: ${tabId}`);
      }

    } catch (error) {
      console.error(`❌ Error loading tab ${tabId}:`, error);
      this.loadingTabs.delete(tabId);

      // Show error message in tab
      const container = document.getElementById(this.tabs[tabId]?.element);
      if (container) {
        container.innerHTML = `
          <div style="padding: 40px; text-align: center;">
            <p style="color: #ef4444; font-weight: 600;">❌ Error loading tab content</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">${error.message}</p>
            <button onclick="location.reload()" style="margin-top: 16px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
              🔄 Reload Page
            </button>
          </div>
        `;
      }
    }
  }

  /**
   * Insert tab content into DOM
   */
  insertTabContent(tabId, htmlContent) {
    const container = document.getElementById(this.tabs[tabId].element);
    if (!container) {
      console.error(`❌ Container not found: ${this.tabs[tabId].element}`);
      return;
    }

    // For adventure planner, preserve existing content if first load
    if (tabId === 'adventure-planner' && this.isInitialized && container.children.length > 0) {
      console.log('ℹ️ Adventure Planner already has content, skipping');
      return;
    }

    container.innerHTML = htmlContent;
  }

  /**
   * Execute scripts within loaded content
   */
  executeScripts(tabId) {
    const container = document.getElementById(this.tabs[tabId].element);
    const scripts = container.querySelectorAll('script');

    scripts.forEach(script => {
      const newScript = document.createElement('script');
      newScript.textContent = script.textContent;
      if (script.src) {
        newScript.src = script.src;
      }
      document.body.appendChild(newScript);
    });
  }

  /**
   * Initialize tab-specific functionality
   */
  initializeTab(tabId) {
    console.log(`🔧 Initializing tab: ${tabId}`);

    switch (tabId) {
      case 'adventure-planner':
        if (typeof window.initAdventurePlanner === 'function') {
          window.initAdventurePlanner();
        }
        break;
      case 'birding':
        if (typeof window.initBirdingTab === 'function') {
          window.initBirdingTab();
        }
        break;
      case 'recipes':
        if (typeof window.initRecipesTab === 'function') {
          window.initRecipesTab();
        }
        break;
      case 'garden':
        if (typeof window.initGardenTab === 'function') {
          window.initGardenTab();
        }
        break;
      case 'budget':
        if (typeof window.initBudgetTab === 'function') {
          window.initBudgetTab();
        }
        break;
    }
  }

  /**
   * Get all loaded tabs
   */
  getLoadedTabs() {
    return Array.from(this.loadedTabs);
  }

  /**
   * Check if tab is loaded
   */
  isTabLoaded(tabId) {
    return this.loadedTabs.has(tabId);
  }

  /**
   * Get load time for a tab
   */
  getLoadTime(tabId) {
    return this.loadTimes.get(tabId) || null;
  }

  /**
   * Get performance stats
   */
  getPerformanceStats() {
    const stats = {
      loadedTabs: Array.from(this.loadedTabs),
      totalLoadTime: 0,
      averageLoadTime: 0,
      loadTimes: {}
    };

    this.loadTimes.forEach((time, tabId) => {
      stats.loadTimes[tabId] = `${time.toFixed(2)}ms`;
      stats.totalLoadTime += time;
    });

    if (this.loadTimes.size > 0) {
      stats.averageLoadTime = `${(stats.totalLoadTime / this.loadTimes.size).toFixed(2)}ms`;
    }

    stats.totalLoadTime = `${stats.totalLoadTime.toFixed(2)}ms`;
    return stats;
  }

  /**
   * Log performance metrics to console
   */
  logPerformanceMetrics() {
    const stats = this.getPerformanceStats();
    console.log('📊 Tab Loading Performance Metrics:');
    console.log('Loaded tabs:', stats.loadedTabs);
    console.log('Total load time:', stats.totalLoadTime);
    console.log('Average load time:', stats.averageLoadTime);
    console.table(stats.loadTimes);
  }

  /**
   * Clear cache (for development/testing)
   */
  clearCache() {
    this.tabCache.clear();
    this.loadedTabs.clear();
    this.loadTimes.clear();
    console.log('✅ Tab cache cleared');
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  window.tabLoader = new TabContentLoader();
  console.log('✅ Tab Content Loader Ready with Lazy Loading');

  // Log performance metrics after 5 seconds
  setTimeout(() => {
    window.tabLoader.logPerformanceMetrics();
  }, 5000);
});

// Make performance logging available globally
window.logTabPerformance = () => {
  if (window.tabLoader) {
    window.tabLoader.logPerformanceMetrics();
  }
};


