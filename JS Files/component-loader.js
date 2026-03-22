/**
 * Component Loader System
 * Loads HTML components from separate files and injects them into containers
 *
 * This system breaks up the massive monolithic HTML file into reusable components
 * making the app much easier to manage and maintain.
 *
 * Usage:
 *   loadComponent('header', 'header-container')
 *   OR
 *   initializeComponents(['header', 'notifications', 'modals'])
 */

class ComponentLoader {
  /**
   * Configuration for all components
   * Maps component name to target container ID
   */
  static COMPONENTS = {
    header: 'header-container',
    notifications: 'notifications-container',
    status: 'status-container',
    controlPanel: 'control-panel-container',
    tableView: 'table-container',
    cardGrid: 'card-grid-container',
    modals: 'modals-container',
    tabs: 'tabs-container',
    automationCard: 'automation-container',
    footer: 'footer-container',
  };

  /**
   * Load a single component
   * @param {string} componentName - Name of the component (without 'components-' prefix)
   * @param {string} targetId - ID of the container to load into
   * @returns {Promise<boolean>} - True if successful
   */
  static async loadComponent(componentName, targetId) {
    try {
      const fileName = `components-${componentName}.html`;
      const filePath = `HTML Files/${fileName}`;

      console.log(`📦 Loading component: ${componentName} from ${filePath}`);

      const response = await fetch(filePath);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const targetElement = document.getElementById(targetId);

      if (!targetElement) {
        console.error(`⚠️ Target container not found: ${targetId}`);
        return false;
      }

      targetElement.innerHTML = html;
      console.log(`✅ Component loaded: ${componentName}`);

      // CRITICAL: Re-initialize button handlers after component loads
      // This ensures newly loaded buttons have proper event delegation
      if (window.setupButtonHandlers && typeof window.setupButtonHandlers === 'function') {
        setTimeout(() => {
          console.log(`🔘 Re-initializing button handlers for loaded component: ${componentName}`);
          window.setupButtonHandlers();
        }, 100);
      }

      // CRITICAL: Ensure all buttons in the new component are responsive
      if (window.ensureButtonResponsiveness && typeof window.ensureButtonResponsiveness === 'function') {
        setTimeout(() => {
          console.log(`🔘 Ensuring button responsiveness for loaded component: ${componentName}`);
          window.ensureButtonResponsiveness();
        }, 150);
      }

      // Trigger component initialization if it exists
      if (window[`init${this.toCamelCase(componentName)}`]) {
        window[`init${this.toCamelCase(componentName)}`]();
      }

      return true;
    } catch (error) {
      console.error(`❌ Failed to load component ${componentName}:`, error);
      return false;
    }
  }

  /**
   * Load multiple components in parallel
   * @param {string[]} componentNames - Array of component names to load
   * @returns {Promise<boolean>} - True if all loaded successfully
   */
  static async loadMultiple(componentNames) {
    try {
      const promises = componentNames.map(name =>
        this.loadComponent(name, this.COMPONENTS[name])
      );

      const results = await Promise.all(promises);
      return results.every(result => result === true);
    } catch (error) {
      console.error('❌ Error loading multiple components:', error);
      return false;
    }
  }

  /**
   * Load all default components
   * @returns {Promise<boolean>} - True if all loaded successfully
   */
  static async loadAll() {
    try {
      console.log('📦 Loading all components...');
      const componentNames = Object.keys(this.COMPONENTS);
      const success = await this.loadMultiple(componentNames);

      if (success) {
        console.log('✅ All components loaded successfully');
      } else {
        console.warn('⚠️ Some components failed to load');
      }

      return success;
    } catch (error) {
      console.error('❌ Error loading all components:', error);
      return false;
    }
  }

  /**
   * Check if a component file exists (useful for optional components)
   * @param {string} componentName - Name of the component
   * @returns {Promise<boolean>} - True if component file exists
   */
  static async componentExists(componentName) {
    try {
      const filePath = `HTML Files/components-${componentName}.html`;
      const response = await fetch(filePath, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Convert kebab-case to camelCase
   * @param {string} str - String to convert
   * @returns {string} - camelCase string
   */
  static toCamelCase(str) {
    return str
      .split('-')
      .map((part, index) =>
        index === 0
          ? part
          : part.charAt(0).toUpperCase() + part.slice(1)
      )
      .join('');
  }

  /**
   * Register a custom component initialization callback
   * Called after a component is loaded
   * @param {string} componentName - Name of the component
   * @param {Function} callback - Function to call after component loads
   */
  static onComponentLoaded(componentName, callback) {
    window[`init${this.toCamelCase(componentName)}`] = callback;
  }

  /**
   * Reload a component (useful for refreshing data)
   * @param {string} componentName - Name of the component
   * @returns {Promise<boolean>} - True if successful
   */
  static async reloadComponent(componentName) {
    console.log(`🔄 Reloading component: ${componentName}`);
    const targetId = this.COMPONENTS[componentName];
    if (!targetId) {
      console.error(`⚠️ Component not found: ${componentName}`);
      return false;
    }
    return this.loadComponent(componentName, targetId);
  }
}

/**
 * Initialize components when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async function () {
  console.log('🎯 App initializing - Loading components...');

  try {
    // Load critical components first
    const criticalLoaded = await ComponentLoader.loadMultiple([
      'header',
      'notifications',
    ]);

    if (criticalLoaded) {
      // Load remaining components
      await ComponentLoader.loadMultiple([
        'status',
        'controlPanel',
        'tableView',
        'cardGrid',
        'modals',
        'tabs',
        'automationCard',
        'footer',
      ]);

      console.log('✅ App ready - All components loaded');

      // Trigger any app initialization that depends on components
      if (window.initializeApp && typeof window.initializeApp === 'function') {
        window.initializeApp();
      }
    } else {
      console.error('❌ Failed to load critical components');
    }
  } catch (error) {
    console.error('❌ Error during component initialization:', error);
  }
});

/**
 * Export for use in other scripts
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ComponentLoader;
}

// Make available globally
window.ComponentLoader = ComponentLoader;

