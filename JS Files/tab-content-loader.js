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
    this.tabLoadPromises = new Map();
    this.tabCache = new Map();
    this.loadTimes = new Map();
    this.executedExternalScripts = new Set();
    this.executedInlineScriptHashes = new Set();
    this.initializedTabs = new Set();
    this.isInitialized = false;
    this.statusHideTimer = null;
    this.handlePopState = this.handlePopState.bind(this);
    this.handleHashChange = this.handleHashChange.bind(this);
    this.ensureLoaderStyles();
    this.ensureGlobalStatusElement();
    this.initializeTabs();
  }

  ensureLoaderStyles() {
    if (document.getElementById('tabLoaderRuntimeStyles')) return;
    const style = document.createElement('style');
    style.id = 'tabLoaderRuntimeStyles';
    style.textContent = `
      .app-tab-pane { position: relative; }
      /* Fail-open: stale loading state must never disable tab interactions. */
      .app-tab-pane.tab-is-loading { pointer-events: auto; }
      .tab-loading-indicator {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.86));
        z-index: 20;
        pointer-events: none;
      }
      .tab-loading-spinner {
        width: 34px;
        height: 34px;
        border: 3px solid rgba(34, 197, 94, 0.24);
        border-top-color: #16a34a;
        border-right-color: #15803d;
        border-radius: 50%;
        animation: tabLoaderSpin 0.9s linear infinite, tabLoaderPulse 1.4s ease-in-out infinite;
      }
      .tab-loading-text {
        color: #4b5563;
        font-size: 13px;
        font-weight: 600;
      }
      .tab-global-status {
        display: none;
        align-items: center;
        gap: 8px;
        margin-left: auto;
        padding: 6px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 700;
        border: 1px solid #dbeafe;
        background: #eff6ff;
        color: #1d4ed8;
      }
      .tab-global-status.visible { display: inline-flex; }
      .tab-global-status.ready {
        border-color: #bbf7d0;
        background: #ecfdf5;
        color: #047857;
      }
      .tab-global-status .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: currentColor;
      }
      @keyframes tabLoaderSpin {
        to { transform: rotate(360deg); }
      }
      @keyframes tabLoaderPulse {
        0%, 100% {
          opacity: 1;
          filter: saturate(1);
        }
        50% {
          opacity: 0.72;
          filter: saturate(1.25);
        }
      }
    `;
    document.head.appendChild(style);
  }

  ensureGlobalStatusElement() {
    const nav = document.getElementById('appTabsNav');
    if (!nav || document.getElementById('tabGlobalStatus')) return;
    const status = document.createElement('div');
    status.id = 'tabGlobalStatus';
    status.className = 'tab-global-status';
    status.innerHTML = '<span class="status-dot"></span><span id="tabGlobalStatusText">Loading tab...</span>';
    nav.appendChild(status);
  }

  updateGlobalStatus(text, isReady = false, autoHideMs = 0) {
    const status = document.getElementById('tabGlobalStatus');
    const statusText = document.getElementById('tabGlobalStatusText');
    if (!status || !statusText) return;

    if (this.statusHideTimer) {
      clearTimeout(this.statusHideTimer);
      this.statusHideTimer = null;
    }

    statusText.textContent = text;
    status.classList.add('visible');
    status.classList.toggle('ready', isReady);

    if (autoHideMs > 0) {
      this.statusHideTimer = setTimeout(() => {
        status.classList.remove('visible');
        status.classList.remove('ready');
      }, autoHideMs);
    }
  }

  getTabLabel(tabId) {
    const button = document.querySelector(`.app-tab-btn[data-tab="${tabId}"]`);
    if (!button) return String(tabId || 'Tab');
    return button.textContent.replace(/\s+/g, ' ').trim();
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
      'bike-trails': {
        file: 'bike-trails-tab.html',
        element: 'bikeTrailsTab',
        priority: 2,
        preload: false,
        isInlineContent: false
      },
      'birding': {
        file: 'birding-locations-tab.html',
        element: 'birdingTab',
        priority: 3,
        preload: false,
        isInlineContent: false
      },
      'household-tools': {
        file: 'household-tools-tab.html',
        element: 'householdToolsTab',
        priority: 4,
        preload: false,
        isInlineContent: false
      },
      'recipes': {
        file: 'recipes-tab.html',
        element: 'recipesTab',
        priority: 5,
        preload: false,
        isInlineContent: false
      },
      'garden': {
        file: 'garden-planner-tab.html',
        element: 'gardenTab',
        priority: 6,
        preload: false,
        isInlineContent: false
      },
       'budget': {
         file: 'budget-planner-tab.html',
         element: 'budgetTab',
         priority: 7,
         preload: false,
         isInlineContent: false
       },
       'nature-challenge': {
         file: 'nature-challenge-tab.html',
         element: 'natureChallengeTab',
         priority: 8,
         preload: false,
         isInlineContent: false
       },
       'visited-locations': {
         file: 'visited-locations-tab.html',
         element: 'visitedLocationsTab',
         priority: 9,
         preload: false,
         isInlineContent: false
       },
       'offline-mode': {
         file: null,
         element: 'offlineModeTab',
         priority: 10,
         preload: false,
         isInlineContent: true
       },
       'app-backup': {
         file: null,
         element: 'appBackupTab',
         priority: 11,
         preload: false,
         isInlineContent: true
       },
       'diagnostics-hub': {
         file: null,
         element: 'diagnosticsHubTab',
         priority: 12,
         preload: false,
         isInlineContent: true
       }
    };

    // Set up tab switching event listeners
    this.setupTabSwitching();

    // Ensure the initially active shell tab is loaded immediately.
    const initialActiveTab = this.getInitialActiveTabId();
    if (initialActiveTab) {
      this.loadTab(initialActiveTab, true);
    }

    // Preload high-priority tabs
    this.preloadTabs();

    // Keep tab state synchronized with URL for deep-linking/back-forward support.
    this.setupUrlSync();

    // Support deep-linking directly to a tab (used by popup/new-tab flows).
    this.openRequestedTabFromUrl();

    this.isInitialized = true;
    console.log('✅ Tab Content Loader Ready (Lazy Loading Enabled)');
  }

  getInitialActiveTabId() {
    const activeButton = document.querySelector('.app-tab-btn.active');
    const fallbackButton = activeButton || document.querySelector('.app-tab-btn');
    const tabId = fallbackButton ? fallbackButton.getAttribute('data-tab') : '';
    if (!tabId || !this.tabs[tabId]) return null;
    return tabId;
  }

  openRequestedTabFromUrl() {
    const requestedTab = this.getTabIdFromUrl();
    if (!requestedTab || !this.tabs[requestedTab]) return;

    // Let other startup scripts attach first, then switch.
    setTimeout(() => this.switchTab(requestedTab, { syncUrl: false, source: 'url-open' }), 0);
  }

  getTabIdFromUrl() {
    const params = new URLSearchParams(window.location.search || '');
    const queryTab = String(params.get('tab') || '').trim();
    if (queryTab && this.tabs[queryTab]) return queryTab;

    const hash = String(window.location.hash || '').replace(/^#/, '').trim();
    if (!hash) return '';

    if (hash.startsWith('tab=')) {
      const hashTab = String(hash.slice(4)).trim();
      if (this.tabs[hashTab]) return hashTab;
    }

    if (this.tabs[hash]) return hash;
    return '';
  }

  setupUrlSync() {
    window.addEventListener('popstate', this.handlePopState);
    window.addEventListener('hashchange', this.handleHashChange);
  }

  handlePopState() {
    const requestedTab = this.getTabIdFromUrl();
    if (!requestedTab || !this.tabs[requestedTab]) return;
    this.switchTab(requestedTab, { syncUrl: false, source: 'popstate' });
  }

  handleHashChange() {
    const requestedTab = this.getTabIdFromUrl();
    if (!requestedTab || !this.tabs[requestedTab]) return;
    this.switchTab(requestedTab, { syncUrl: false, source: 'hashchange' });
  }

  syncUrlToTab(tabId, options = {}) {
    const { historyMode = 'replace' } = options;
    if (!tabId || !this.tabs[tabId]) return;

    const url = new URL(window.location.href);
    const currentTab = String(url.searchParams.get('tab') || '').trim();
    if (currentTab === tabId) return;

    url.searchParams.set('tab', tabId);

    // Canonicalize to query-based deep links while still accepting hash input.
    const hash = String(url.hash || '').replace(/^#/, '').trim();
    if (hash === tabId || hash === `tab=${tabId}`) {
      url.hash = '';
    }

    if (historyMode === 'push') {
      window.history.pushState(window.history.state, '', url.toString());
      return;
    }

    window.history.replaceState(window.history.state, '', url.toString());
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

    // Preload other tabs after a delay (lower priority), staggered to avoid UI jank.
    setTimeout(() => {
      const backgroundTabs = Object.entries(this.tabs)
        .filter(([tabId, tabInfo]) => !tabInfo.preload && !this.loadedTabs.has(tabId));

      backgroundTabs.forEach(([tabId], index) => {
        const run = () => {
          if (this.loadedTabs.has(tabId) || this.loadingTabs.has(tabId)) return;
          console.log(`🔄 Preloading background tab: ${tabId}`);
          this.loadTab(tabId, true);
        };

        setTimeout(() => {
          if (typeof window.requestIdleCallback === 'function') {
            window.requestIdleCallback(run, { timeout: 1500 });
          } else {
            run();
          }
        }, index * 350);
      });
    }, 1200);
  }

  /**
   * Set up tab switching with event delegation
   * Ensures tabs remain responsive after DOM updates
   */
  setupTabSwitching() {
    // Use event delegation on document for better reliability
    document.addEventListener('click', (e) => {
      const clickTarget = e && e.target && e.target.nodeType === Node.ELEMENT_NODE
        ? e.target
        : (e && e.target && e.target.parentElement ? e.target.parentElement : null);
      const btn = clickTarget && clickTarget.closest ? clickTarget.closest('.app-tab-btn') : null;
      if (!btn) return;

      e.preventDefault();
      e.stopPropagation();

      const tabId = btn.getAttribute('data-tab');
      if (tabId) {
        console.log(`📑 Tab button clicked (delegated): ${tabId}`);
        this.switchTab(tabId, { syncUrl: true, historyMode: 'push', source: 'user-click' });
      }
    }, true); // Use capture phase for reliable event handling

    console.log('✅ Tab switching initialized with event delegation');
  }

  /**
   * Switch to a tab
   */
  switchTab(tabId, options = {}) {
    const { syncUrl = true, historyMode = 'replace', source = 'programmatic' } = options;
    console.log(`📑 Switching to tab: ${tabId}`);

    if (typeof window.clearStaleModalBackdrops === 'function') {
      window.clearStaleModalBackdrops();
    }
    if (typeof window.closeRowDetailModal === 'function') {
      try {
        window.closeRowDetailModal();
      } catch (_error) {
        // Keep tab switching resilient even if modal cleanup fails.
      }
    }

    // Hide all tabs
    document.querySelectorAll('.app-tab-pane').forEach(pane => {
      pane.classList.remove('active');
      // Proactively clear any stale loading overlay so it can never block the
      // incoming tab's buttons. This is safe to call even if no indicator exists.
      this.hideLoadingIndicator(pane);
    });

    // Remove active state from buttons
    document.querySelectorAll('.app-tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    // Activate clicked tab button
    const tabButton = document.querySelector(`.app-tab-btn[data-tab="${tabId}"]`);
    if (!tabButton) {
      console.error(`❌ Tab button not found for tab: ${tabId}`);
      return;
    }
    tabButton.classList.add('active');

    // Show selected tab
    const tabPane = document.querySelector(`.app-tab-pane[data-tab="${tabId}"]`);

    if (!tabPane) {
      console.error(`❌ Tab pane not found for tab: ${tabId}`);
      return;
    }

    tabPane.classList.add('active');

    // Scroll to top when switching tabs so content is always visible at the top.
    try {
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (_e) {
      window.scrollTo(0, 0);
    }

    if (syncUrl) {
      this.syncUrlToTab(tabId, { historyMode });
    }

    window.dispatchEvent(new CustomEvent('app:tab-switched', {
      detail: {
        tabId,
        source,
        loaded: this.loadedTabs.has(tabId),
        timestamp: Date.now()
      }
    }));

    // Keep sticky offsets in sync with the newly active tab layout.
    setTimeout(() => {
      window.updatePlannerTopStickyOffset?.();
      window.requestPlannerTopStickyVisualUpdate?.();
    }, 0);

    // Show loading indicator if not already loaded
    if (!this.loadedTabs.has(tabId) && !this.loadingTabs.has(tabId)) {
      this.showLoadingIndicator(tabPane, tabId);
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
    if (!container || container.querySelector('.tab-loading-indicator')) return;
    container.classList.add('tab-is-loading');
    const indicator = document.createElement('div');
    indicator.className = 'tab-loading-indicator';
    indicator.dataset.createdAt = String(Date.now());
    indicator.innerHTML = '<div class="tab-loading-spinner"></div><p class="tab-loading-text">Loading tab...</p>';
    container.appendChild(indicator);
  }

  /**
   * Hide loading indicator
   */
  hideLoadingIndicator(container) {
    if (!container) return;
    const indicator = container.querySelector('.tab-loading-indicator');
    if (indicator) {
      indicator.remove();
    }
    container.classList.remove('tab-is-loading');
  }

  /**
   * Load tab content from HTML file (lazy loading)
   */
  async loadTab(tabId, isPreload = false) {
    if (this.loadedTabs.has(tabId)) {
      console.log(`✅ Tab already loaded: ${tabId}`);
      return;
    }

    const existingLoadPromise = this.tabLoadPromises.get(tabId);
    if (existingLoadPromise) {
      console.log(`⏳ Tab already loading (joining existing promise): ${tabId}`);
      await existingLoadPromise;
      return;
    }

    const loadPromise = (async () => {
      try {
        if (this.loadingTabs.has(tabId)) {
          console.log(`⏳ Tab already loading: ${tabId}`);
          return;
        }

        if (!isPreload) {
          this.updateGlobalStatus(`Loading ${this.getTabLabel(tabId)}...`);
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
          this.initializeTabIfNeeded(tabId);
          const container = document.getElementById(this.tabs[tabId]?.element);
          if (container) this.hideLoadingIndicator(container);
          if (!isPreload) {
            this.updateGlobalStatus(`${this.getTabLabel(tabId)} ready`, true, 1200);
          }
          return;
        }

        const assetVersion = String(window.__APP_ASSET_VERSION || '2026.04.17.1');
        const urlObj = new URL(`${this.tabsPath}${tabInfo.file}`, window.location.href);
        urlObj.searchParams.set('v', assetVersion);
        const url = urlObj.toString();
        const loadType = isPreload ? 'PRELOAD' : 'USER-TRIGGERED';
        console.log(`📥 [${loadType}] Loading tab content from: ${url}`);

        // Check cache first
        if (this.tabCache.has(tabId)) {
          console.log(`💾 Using cached content for tab: ${tabId}`);
          const cachedContent = this.tabCache.get(tabId);
          this.insertTabContent(tabId, cachedContent);
          this.loadedTabs.add(tabId);
          this.loadingTabs.delete(tabId);
          this.executeScripts(tabId);
          this.initializeTabIfNeeded(tabId);
          const container = document.getElementById(this.tabs[tabId]?.element);
          if (container) this.hideLoadingIndicator(container);
          if (!isPreload) {
            this.updateGlobalStatus(`${this.getTabLabel(tabId)} ready`, true, 1200);
          }
          return;
        }

        // Fetch with timeout/retry resilience when reliability helpers are available.
        let response;
        if (window.ReliabilityAsync && typeof window.ReliabilityAsync.fetchWithRetry === 'function') {
          response = await window.ReliabilityAsync.fetchWithRetry(url, {}, {
            operationName: `load tab ${tabId}`,
            timeoutMs: 10000,
            retries: 2,
            backoffMs: 350,
            idempotent: true
          });
        } else {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);
        }

        if (!response.ok) {
          throw new Error(`Failed to load ${url}: ${response.statusText}`);
        }

        const htmlContent = await response.text();

        if (!tabInfo.isInlineContent && this.isFallbackShellResponse(htmlContent)) {
          throw new Error(
            `Tab HTML for '${tabId}' returned the app shell instead of tab markup. ` +
            `Check navigation fallback excludes for nested paths (for example '/HTML Files/tabs/*').`
          );
        }

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
        this.initializeTabIfNeeded(tabId);

        const container = document.getElementById(this.tabs[tabId]?.element);
        if (container) this.hideLoadingIndicator(container);

        // Log performance
        if (!isPreload) {
          console.log(`✅ Tab loaded and displayed: ${tabId}`);
          this.updateGlobalStatus(`${this.getTabLabel(tabId)} ready`, true, 1200);
        }

      } catch (error) {
        console.error(`❌ Error loading tab ${tabId}:`, error);
        this.loadingTabs.delete(tabId);
        this.tabCache.delete(tabId);

        // Show error message in tab
        const container = document.getElementById(this.tabs[tabId]?.element);
        if (container) {
          this.hideLoadingIndicator(container);
          this.renderTabError(container, error);
        }
        if (!isPreload) {
          this.updateGlobalStatus(`Failed to load ${this.getTabLabel(tabId)}`, false, 2200);
        }
      }
    })();

    this.tabLoadPromises.set(tabId, loadPromise);

    try {
      await loadPromise;
    } finally {
      this.tabLoadPromises.delete(tabId);
    }
  }

  renderTabError(container, error) {
    if (!container) return;
    const errorMessage = error && error.message ? String(error.message) : 'Unknown error';

    const wrapper = document.createElement('div');
    wrapper.style.padding = '40px';
    wrapper.style.textAlign = 'center';

    const title = document.createElement('p');
    title.style.color = '#ef4444';
    title.style.fontWeight = '600';
    title.textContent = 'Error loading tab content';

    const details = document.createElement('p');
    details.style.color = '#6b7280';
    details.style.fontSize = '14px';
    details.style.marginTop = '8px';
    details.textContent = errorMessage;

    const button = document.createElement('button');
    button.type = 'button';
    button.style.marginTop = '16px';
    button.style.padding = '8px 16px';
    button.style.background = '#3b82f6';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '6px';
    button.style.cursor = 'pointer';
    button.style.fontWeight = '600';
    button.textContent = 'Reload Page';
    button.addEventListener('click', () => window.location.reload());

    wrapper.appendChild(title);
    wrapper.appendChild(details);
    wrapper.appendChild(button);

    container.innerHTML = '';
    container.appendChild(wrapper);
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
    if (!container) return;
    const scripts = container.querySelectorAll('script');

    scripts.forEach(script => {
      if (script.src) {
        const srcKey = new URL(script.src, window.location.href).href;
        if (this.executedExternalScripts.has(srcKey)) {
          return;
        }
        this.executedExternalScripts.add(srcKey);
      } else {
        const inlineKey = this.hashScriptContent(script.textContent || '');
        if (this.executedInlineScriptHashes.has(inlineKey)) {
          return;
        }
        this.executedInlineScriptHashes.add(inlineKey);
      }

      const newScript = document.createElement('script');
      newScript.textContent = script.textContent;
      if (script.src) {
        newScript.src = script.src;
      }
      document.body.appendChild(newScript);
    });
  }

  hashScriptContent(content) {
    let hash = 0;
    for (let i = 0; i < content.length; i += 1) {
      hash = ((hash << 5) - hash) + content.charCodeAt(i);
      hash |= 0;
    }
    return `inline:${hash}:${content.length}`;
  }

  /**
   * Initialize tab-specific functionality
   */
  initializeTabIfNeeded(tabId) {
    if (this.initializedTabs.has(tabId)) return;
    this.initializedTabs.add(tabId);
    this.initializeTab(tabId);
  }

  initializeTab(tabId) {
    console.log(`🔧 Initializing tab: ${tabId}`);

    switch (tabId) {
      case 'adventure-planner':
        if (typeof window.initAdventurePlanner === 'function') {
          window.initAdventurePlanner();
        }
        break;
      case 'bike-trails':
        if (typeof window.initBikeTrailsTab === 'function') {
          window.initBikeTrailsTab();
        }
        // If user is already signed in and data hasn't loaded yet, kick off the load.
        if (window.accessToken && typeof window.loadBikeTable === 'function' &&
            !(window.bikeTrailsData && window.bikeTrailsData.length > 0)) {
          window.loadBikeTable();
        }
        break;
      case 'birding':
        if (typeof window.initBirdingTab === 'function') {
          window.initBirdingTab();
        }
        break;
      case 'household-tools':
        if (typeof window.initHouseholdToolsTab === 'function') {
          window.initHouseholdToolsTab();
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
      case 'nature-challenge':
        if (typeof window.initNatureChallengeTab === 'function') {
          window.initNatureChallengeTab();
        }
        break;
      case 'visited-locations':
        if (typeof window.initVisitedLocationsTab === 'function') {
          window.initVisitedLocationsTab();
        }
        break;
      case 'app-backup':
        if (window.backupManager && typeof window.backupManager.refreshBackupPageSummary === 'function') {
          window.backupManager.refreshBackupPageSummary();
        }
        break;
      case 'diagnostics-hub':
        if (typeof window.refreshDiagnosticsHub === 'function') {
          window.refreshDiagnosticsHub();
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

  /**
   * Check if response is fallback HTML shell (for error handling)
   */
  isFallbackShellResponse(htmlContent) {
    if (!htmlContent) return false;

    const sample = String(htmlContent).slice(0, 1000).toLowerCase();
    const hasHtmlShell = sample.includes('<!doctype html') || sample.includes('<html');
    const looksLikeMainApp = sample.includes('adventure planner-test') || sample.includes('google places api key');

    return hasHtmlShell && looksLikeMainApp;
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  window.tabLoader = new TabContentLoader();
  console.log('✅ Tab Content Loader Ready with Lazy Loading');

  // Signal the shell that initial tab interactions are ready.
  requestAnimationFrame(() => {
    window.dispatchEvent(new CustomEvent('app:interactive-ready', {
      detail: {
        source: 'tab-content-loader',
        loadedTabs: window.tabLoader ? window.tabLoader.getLoadedTabs() : []
      }
    }));
  });

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

