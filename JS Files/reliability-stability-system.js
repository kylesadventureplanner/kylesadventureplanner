/**
 * RELIABILITY & STABILITY SYSTEM FOR ADVENTURE PLANNER
 * ====================================================
 *
 * Comprehensive system for error handling, recovery, validation, and stability:
 * - Global error handler for uncaught exceptions
 * - Promise rejection handler
 * - Safe operation wrappers
 * - Data validation utilities
 * - State recovery mechanism
 * - Memory leak prevention
 * - Safe DOM operations
 * - Graceful degradation
 *
 * Version: 1.0.0
 * Date: April 5, 2026
 * Priority: HIGH - Improves app stability significantly
 */

(function initReliabilitySystem() {
  'use strict';

  console.log('🛡️ Reliability & Stability System initializing...');

  // ============================================================
  // SECTION 1: GLOBAL ERROR HANDLING
  // ============================================================

  /**
   * Centralized error handler for uncaught exceptions
   */
  window.addEventListener('error', (event) => {
    const error = event.error || {};
    console.error('🚨 UNCAUGHT ERROR:', {
      message: error.message,
      stack: error.stack,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      timestamp: new Date().toISOString()
    });

    // Log to reliability tracker
    trackError('uncaught-error', {
      message: error.message,
      stack: error.stack,
      source: `${event.filename}:${event.lineno}:${event.colno}`
    });

    // Prevent browser from showing error dialog
    event.preventDefault();
    return true;
  });

  /**
   * Handle unhandled promise rejections
   */
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason || 'Unknown rejection';
    console.error('⚠️ UNHANDLED PROMISE REJECTION:', reason);

    trackError('unhandled-rejection', {
      message: typeof reason === 'string' ? reason : String(reason),
      type: typeof reason
    });

    // Don't prevent default - let browser handle it
  });

  // ============================================================
  // SECTION 2: ERROR TRACKING & REPORTING
  // ============================================================

  window.reliabilityTracker = {
    errors: [],
    warnings: [],
    maxErrors: 100,

    /**
     * Track an error
     */
    trackError(category, details) {
      const entry = {
        timestamp: new Date().toISOString(),
        category,
        details,
        severity: 'error'
      };

      this.errors.push(entry);
      if (this.errors.length > this.maxErrors) {
        this.errors.shift(); // Keep only last 100
      }

      console.log(`📊 Error tracked: ${category}`);
    },

    /**
     * Track a warning
     */
    trackWarning(category, details) {
      const entry = {
        timestamp: new Date().toISOString(),
        category,
        details,
        severity: 'warning'
      };

      this.warnings.push(entry);
      if (this.warnings.length > this.maxErrors) {
        this.warnings.shift();
      }
    },

    /**
     * Get error report
     */
    getReport() {
      return {
        errors: this.errors,
        warnings: this.warnings,
        total: this.errors.length + this.warnings.length,
        timestamp: new Date().toISOString()
      };
    },

    /**
     * Clear all tracked errors
     */
    clear() {
      this.errors = [];
      this.warnings = [];
    },

    /**
     * Export as JSON for debugging
     */
    export() {
      return JSON.stringify(this.getReport(), null, 2);
    }
  };

  function trackError(category, details) {
    if (window.reliabilityTracker) {
      window.reliabilityTracker.trackError(category, details);
    }
  }

  // ============================================================
  // SECTION 3: SAFE OPERATION WRAPPERS
  // ============================================================

  /**
   * Safely execute a function with error handling
   */
  window.safeExecute = function(func, context, args = [], fallback = null) {
    try {
      if (typeof func !== 'function') {
        trackError('safe-execute', { message: 'Not a function', type: typeof func });
        return fallback;
      }
      return func.apply(context, args);
    } catch (error) {
      trackError('safe-execute-error', {
        function: func.name || 'anonymous',
        error: error.message,
        stack: error.stack
      });
      console.error('❌ Safe execution failed:', error);
      return fallback;
    }
  };

  /**
   * Safely execute async function with timeout
   */
  window.safeExecuteAsync = async function(asyncFunc, timeoutMs = 30000, fallback = null) {
    try {
      if (typeof asyncFunc !== 'function') {
        throw new Error('Not a function');
      }

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Operation timeout after ${timeoutMs}ms`)), timeoutMs)
      );

      // Race between function and timeout
      return await Promise.race([
        asyncFunc(),
        timeoutPromise
      ]);
    } catch (error) {
      trackError('safe-execute-async-error', {
        error: error.message,
        timeout: timeoutMs
      });
      console.error('❌ Async execution failed:', error);
      return fallback;
    }
  };

  /**
   * Safely access nested properties
   */
  window.safeGet = function(obj, path, defaultValue = null) {
    try {
      const keys = path.split('.');
      let current = obj;

      for (const key of keys) {
        if (current === null || current === undefined) {
          return defaultValue;
        }
        current = current[key];
      }

      return current !== undefined ? current : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  };

  /**
   * Safely set nested property
   */
  window.safeSet = function(obj, path, value) {
    try {
      const keys = path.split('.');
      let current = obj;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current) || typeof current[key] !== 'object') {
          current[key] = {};
        }
        current = current[key];
      }

      current[keys[keys.length - 1]] = value;
      return true;
    } catch (error) {
      trackError('safe-set-error', { path, error: error.message });
      return false;
    }
  };

  // ============================================================
  // SECTION 4: DATA VALIDATION
  // ============================================================

  window.dataValidator = {
    /**
     * Validate required fields
     */
    validateRequired(data, requiredFields) {
      const missing = [];

      requiredFields.forEach(field => {
        if (!data[field] || data[field] === '') {
          missing.push(field);
        }
      });

      return {
        valid: missing.length === 0,
        missing
      };
    },

    /**
     * Validate data types
     */
    validateTypes(data, schema) {
      const errors = [];

      Object.keys(schema).forEach(field => {
        const expectedType = schema[field];
        const actualType = typeof data[field];

        if (expectedType === 'array') {
          if (!Array.isArray(data[field])) {
            errors.push(`${field}: expected array, got ${actualType}`);
          }
        } else if (actualType !== expectedType) {
          errors.push(`${field}: expected ${expectedType}, got ${actualType}`);
        }
      });

      return {
        valid: errors.length === 0,
        errors
      };
    },

    /**
     * Validate value ranges
     */
    validateRange(value, min, max) {
      if (typeof value !== 'number') return false;
      return value >= min && value <= max;
    },

    /**
     * Sanitize string input
     */
    sanitizeString(str, maxLength = 1000) {
      if (typeof str !== 'string') return '';
      return str
        .substring(0, maxLength)
        .replace(/[<>\"']/g, (char) => ({
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char] || char));
    }
  };

  // ============================================================
  // SECTION 5: STATE RECOVERY & BACKUP
  // ============================================================

  window.stateRecovery = {
    backup: null,
    lastValidState: null,

    /**
     * Create backup of current state
     */
    createBackup(state) {
      try {
        // Deep clone to prevent mutations
        this.backup = JSON.parse(JSON.stringify(state));
        this.lastValidState = this.backup;
        console.log('💾 State backup created');
        return true;
      } catch (error) {
        trackError('backup-creation-failed', { error: error.message });
        return false;
      }
    },

    /**
     * Restore from backup
     */
    restore() {
      if (!this.backup) {
        trackError('restore-failed', { message: 'No backup available' });
        return null;
      }

      try {
        const restored = JSON.parse(JSON.stringify(this.backup));
        console.log('♻️ State restored from backup');
        return restored;
      } catch (error) {
        trackError('restore-failed', { error: error.message });
        return null;
      }
    },

    /**
     * Validate state before backup
     */
    validateAndBackup(state, validator) {
      const validation = validator(state);

      if (!validation.valid) {
        trackError('invalid-state-backup', { errors: validation.errors });
        return false;
      }

      return this.createBackup(state);
    }
  };

  // ============================================================
  // SECTION 6: MEMORY LEAK PREVENTION
  // ============================================================

  window.memoryManager = {
    timers: new Map(),
    listeners: new Map(),

    /**
     * Register a timer for tracking
     */
    registerTimeout(timeoutId, description) {
      this.timers.set(timeoutId, { id: timeoutId, type: 'timeout', description, created: Date.now() });
    },

    /**
     * Register an interval for tracking
     */
    registerInterval(intervalId, description) {
      this.timers.set(intervalId, { id: intervalId, type: 'interval', description, created: Date.now() });
    },

    /**
     * Safely clear timeout
     */
    clearTimeout(timeoutId) {
      clearTimeout(timeoutId);
      this.timers.delete(timeoutId);
    },

    /**
     * Safely clear interval
     */
    clearInterval(intervalId) {
      clearInterval(intervalId);
      this.timers.delete(intervalId);
    },

    /**
     * Register event listener for cleanup
     */
    addEventListener(element, event, handler, description = '') {
      const key = `${event}-${description}`;
      element.addEventListener(event, handler);

      if (!this.listeners.has(element)) {
        this.listeners.set(element, []);
      }

      this.listeners.get(element).push({ event, handler, description });
    },

    /**
     * Remove event listener safely
     */
    removeEventListener(element, event, handler) {
      element.removeEventListener(event, handler);

      const listeners = this.listeners.get(element);
      if (listeners) {
        const index = listeners.findIndex(l => l.handler === handler && l.event === event);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    },

    /**
     * Clean up all timers
     */
    clearAllTimers() {
      this.timers.forEach((timer) => {
        if (timer.type === 'timeout') {
          clearTimeout(timer.id);
        } else if (timer.type === 'interval') {
          clearInterval(timer.id);
        }
      });
      this.timers.clear();
      console.log('🧹 All timers cleared');
    },

    /**
     * Clean up all listeners
     */
    clearAllListeners() {
      this.listeners.forEach((listeners, element) => {
        listeners.forEach(({ event, handler }) => {
          element.removeEventListener(event, handler);
        });
      });
      this.listeners.clear();
      console.log('🧹 All listeners cleared');
    },

    /**
     * Get memory report
     */
    getReport() {
      return {
        activeTimers: this.timers.size,
        activeListeners: this.listeners.size,
        timers: Array.from(this.timers.values()),
        listenersByElement: this.listeners.size
      };
    }
  };

  // ============================================================
  // SECTION 7: SAFE DOM OPERATIONS
  // ============================================================

  window.safeDOM = {
    /**
     * Safely query selector
     */
    query(selector) {
      try {
        if (!selector) return null;
        return document.querySelector(selector);
      } catch (error) {
        trackError('dom-query-error', { selector, error: error.message });
        return null;
      }
    },

    /**
     * Safely query all
     */
    queryAll(selector) {
      try {
        if (!selector) return [];
        return Array.from(document.querySelectorAll(selector));
      } catch (error) {
        trackError('dom-queryAll-error', { selector, error: error.message });
        return [];
      }
    },

    /**
     * Safely get element by ID
     */
    byId(id) {
      try {
        if (!id) return null;
        return document.getElementById(id);
      } catch (error) {
        trackError('dom-byId-error', { id, error: error.message });
        return null;
      }
    },

    /**
     * Safely set text content
     */
    setText(element, text) {
      try {
        if (!element) return false;
        element.textContent = String(text || '');
        return true;
      } catch (error) {
        trackError('dom-setText-error', { error: error.message });
        return false;
      }
    },

    /**
     * Safely set HTML
     */
    setHTML(element, html) {
      try {
        if (!element) return false;
        // Sanitize HTML to prevent XSS
        element.innerHTML = window.dataValidator.sanitizeString(html);
        return true;
      } catch (error) {
        trackError('dom-setHTML-error', { error: error.message });
        return false;
      }
    },

    /**
     * Safely add class
     */
    addClass(element, className) {
      try {
        if (!element || !className) return false;
        element.classList.add(className);
        return true;
      } catch (error) {
        trackError('dom-addClass-error', { error: error.message });
        return false;
      }
    },

    /**
     * Safely remove class
     */
    removeClass(element, className) {
      try {
        if (!element || !className) return false;
        element.classList.remove(className);
        return true;
      } catch (error) {
        trackError('dom-removeClass-error', { error: error.message });
        return false;
      }
    },

    /**
     * Safely toggle class
     */
    toggleClass(element, className, force) {
      try {
        if (!element || !className) return false;
        element.classList.toggle(className, force);
        return true;
      } catch (error) {
        trackError('dom-toggleClass-error', { error: error.message });
        return false;
      }
    }
  };

  // ============================================================
  // SECTION 8: GRACEFUL DEGRADATION
  // ============================================================

  window.featureCheck = {
    /**
     * Check if feature is available
     */
    has(feature) {
      const features = {
        localStorage: () => typeof window.localStorage !== 'undefined',
        sessionStorage: () => typeof window.sessionStorage !== 'undefined',
        indexedDB: () => typeof window.indexedDB !== 'undefined',
        serviceWorker: () => 'serviceWorker' in navigator,
        geolocation: () => 'geolocation' in navigator,
        notification: () => 'Notification' in window,
        fetch: () => typeof fetch === 'function',
        promise: () => typeof Promise !== 'undefined',
        async: () => typeof asyncFunction === 'function'
      };

      const check = features[feature];
      if (!check) {
        return false;
      }

      try {
        return check();
      } catch (error) {
        return false;
      }
    },

    /**
     * Execute with fallback if feature not available
     */
    executeWithFallback(feature, primaryFunc, fallbackFunc) {
      if (this.has(feature)) {
        try {
          return primaryFunc();
        } catch (error) {
          trackError('feature-execution-failed', { feature, error: error.message });
          return fallbackFunc();
        }
      } else {
        return fallbackFunc();
      }
    }
  };

  // ============================================================
  // SECTION 9: HEALTH CHECK & MONITORING
  // ============================================================

  window.healthCheck = {
    lastCheck: null,
    checkInterval: null,

    /**
     * Run comprehensive health check
     */
    run() {
      const checks = {
        timestamp: new Date().toISOString(),
        memory: performance.memory ? {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        } : null,
        timers: window.memoryManager.getReport(),
        errors: window.reliabilityTracker?.getReport() || { errors: [], warnings: [] },
        domNodes: document.querySelectorAll('*').length,
        documentReady: document.readyState
      };

      this.lastCheck = checks;
      console.log('🏥 Health check complete:', checks);
      return checks;
    },

    /**
     * Start periodic health checks
     */
    startMonitoring(intervalMs = 60000) {
      this.checkInterval = setInterval(() => this.run(), intervalMs);
      console.log(`📊 Health monitoring started (${intervalMs}ms interval)`);
    },

    /**
     * Stop periodic health checks
     */
    stopMonitoring() {
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
        this.checkInterval = null;
        console.log('📊 Health monitoring stopped');
      }
    },

    /**
     * Get last health check
     */
    getLastCheck() {
      return this.lastCheck;
    }
  };

  // ============================================================
  // INITIALIZATION
  // ============================================================

  function initialize() {
    console.log(`
╔════════════════════════════════════════════╗
║      RELIABILITY SYSTEM INITIALIZED        ║
╠════════════════════════════════════════════╣
║ ✅ Global error handling                  ║
║ ✅ Promise rejection handler              ║
║ ✅ Error tracking & reporting             ║
║ ✅ Safe operation wrappers                ║
║ ✅ Data validation utilities              ║
║ ✅ State recovery & backup                ║
║ ✅ Memory leak prevention                 ║
║ ✅ Safe DOM operations                    ║
║ ✅ Graceful degradation                   ║
║ ✅ Health monitoring                      ║
╚════════════════════════════════════════════╝

Available utilities:
  • window.safeExecute(func, context, args, fallback)
  • window.safeExecuteAsync(asyncFunc, timeout, fallback)
  • window.safeGet(obj, path, default)
  • window.safeSet(obj, path, value)
  • window.dataValidator.validateRequired/Types/Range
  • window.stateRecovery.createBackup/restore
  • window.memoryManager.clearAllTimers/Listeners
  • window.safeDOM.query/byId/setText/setHTML
  • window.featureCheck.has(feature)
  • window.healthCheck.run/startMonitoring
  • window.reliabilityTracker.getReport/export
    `);
  }

  // Run on ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();

