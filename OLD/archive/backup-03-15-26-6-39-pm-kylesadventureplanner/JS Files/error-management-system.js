/**
 * ERROR MANAGEMENT SYSTEM - v7.0.125
 * ===================================
 * Provides centralized error tracking, display, and clearing
 * Date: March 15, 2026
 */

(function() {
  console.log('🚀 Error Management System v7.0.125 Loading...');

  class ErrorManager {
    constructor() {
      this.errors = [];
      this.maxErrors = 100;
      this.displayElement = null;
      this.init();
    }

    /**
     * Initialize error manager
     */
    init() {
      // Override global error handlers
      window.addEventListener('error', (e) => this.handleError(e));
      window.addEventListener('unhandledrejection', (e) => this.handleRejection(e));

      // Override console.error to capture logs
      const originalError = console.error;
      console.error = (...args) => {
        originalError.apply(console, args);
        this.logError(args.join(' '), 'console');
      };

      console.log('✅ Error Manager initialized');
    }

    /**
     * Handle window errors
     */
    handleError(event) {
      const errorMsg = event.message || 'Unknown error';
      const source = event.filename || 'unknown';
      const lineno = event.lineno || 0;

      this.logError(errorMsg, 'window', { source, lineno });
    }

    /**
     * Handle unhandled promise rejections
     */
    handleRejection(event) {
      const reason = event.reason || 'Unknown rejection';
      this.logError(String(reason), 'promise');
    }

    /**
     * Log an error
     */
    logError(message, type = 'general', context = {}) {
      const timestamp = new Date().toLocaleTimeString();
      const error = {
        id: Date.now() + Math.random(),
        timestamp,
        message,
        type,
        context,
        seen: false
      };

      this.errors.push(error);

      // Keep array size manageable
      if (this.errors.length > this.maxErrors) {
        this.errors.shift();
      }

      console.log(`📝 Error logged [${type}]: ${message}`);
      this.updateDisplay();
    }

    /**
     * Clear all errors
     */
    clearAllErrors() {
      const count = this.errors.length;
      this.errors = [];
      console.log(`🗑️ Cleared ${count} errors`);
      this.updateDisplay();
      return count;
    }

    /**
     * Clear errors of specific type
     */
    clearErrorsByType(type) {
      const before = this.errors.length;
      this.errors = this.errors.filter(e => e.type !== type);
      const removed = before - this.errors.length;
      console.log(`🗑️ Cleared ${removed} errors of type: ${type}`);
      this.updateDisplay();
      return removed;
    }

    /**
     * Get recent errors
     */
    getRecentErrors(count = 10) {
      return this.errors.slice(-count).reverse();
    }

    /**
     * Update display
     */
    updateDisplay() {
      if (!this.displayElement) {
        this.createDisplayElement();
      }

      if (this.errors.length === 0) {
        this.displayElement.innerHTML = '<div style="padding: 16px; text-align: center; color: #6b7280;">✅ No errors</div>';
        return;
      }

      const recentErrors = this.getRecentErrors(20);
      const self = this;

      let html = '<div style="padding: 16px;">' +
        '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">' +
        '<div style="font-weight: 700; color: #ef4444;">❌ ' + this.errors.length + ' Error' + (this.errors.length !== 1 ? 's' : '') + '</div>' +
        '<button id="error-clear-all-btn" style="padding: 6px 12px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px;">🗑️ Clear All</button>' +
        '</div>';

      html += '<div style="max-height: 400px; overflow-y: auto; border: 1px solid #fca5a5; border-radius: 8px; background: #fef2f2;">';

      for (let error of recentErrors) {
        html += '<div style="padding: 12px; border-bottom: 1px solid #fecaca; display: flex; gap: 8px; align-items: flex-start;">' +
          '<div style="flex-shrink: 0; margin-top: 2px;">❌</div>' +
          '<div style="flex: 1; min-width: 0;">' +
          '<div style="font-size: 12px; color: #7f1d1d; word-break: break-word;">' + error.message + '</div>' +
          '<div style="font-size: 11px; color: #991b1b; margin-top: 4px;">' + error.timestamp + ' [' + error.type + ']</div>' +
          '</div>' +
          '</div>';
      }

      html += '</div>' +
        '<div style="margin-top: 12px; padding: 12px; background: #fee2e2; border-radius: 6px; font-size: 12px; color: #7f1d1d;">' +
        '💡 Errors are logged automatically. Click "Copy All" to share error details for debugging.' +
        '</div>' +
        '<button id="error-copy-all-btn" style="width: 100%; margin-top: 12px; padding: 10px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">📋 Copy All Errors</button>' +
        '</div>';

      this.displayElement.innerHTML = html;

      // Attach event listeners after HTML is rendered
      const clearBtn = document.getElementById('error-clear-all-btn');
      const copyBtn = document.getElementById('error-copy-all-btn');

      if (clearBtn) {
        clearBtn.onclick = () => {
          self.clearAllErrors();
          self.updateDisplay();
        };
      }

      if (copyBtn) {
        copyBtn.onclick = () => {
          const text = self.errors.map(e => e.timestamp + ' [' + e.type + '] ' + e.message).join('\n');
          navigator.clipboard.writeText(text).then(() => {
            alert('✅ Errors copied to clipboard!');
          }).catch(() => {
            alert('❌ Failed to copy errors');
          });
        };
      }
    }

    /**
     * Create display element if needed
     */
    createDisplayElement() {
      if (!document.getElementById('error-report-container')) {
        const container = document.createElement('div');
        container.id = 'error-report-container';
        container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; width: 400px; background: white; border: 2px solid #fca5a5; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); z-index: 99999; max-height: 600px; display: none;';
        document.body.appendChild(container);
        this.displayElement = container;
      }
      return this.displayElement;
    }

    /**
     * Toggle error report visibility
     */
    toggleErrorReport() {
      if (!this.displayElement) {
        this.createDisplayElement();
      }

      if (this.displayElement.style.display === 'none') {
        this.displayElement.style.display = 'block';
      } else {
        this.displayElement.style.display = 'none';
      }
    }

    /**
     * Show error report
     */
    showErrorReport() {
      if (!this.displayElement) {
        this.createDisplayElement();
      }
      this.displayElement.style.display = 'block';
      this.updateDisplay();
    }

    /**
     * Hide error report
     */
    hideErrorReport() {
      if (this.displayElement) {
        this.displayElement.style.display = 'none';
      }
    }

    /**
     * Check if there are errors
     */
    hasErrors() {
      return this.errors.length > 0;
    }

    /**
     * Get error count
     */
    getErrorCount() {
      return this.errors.length;
    }
  }

  // Initialize globally
  window.errorManager = new ErrorManager();

  // Create toggle button in top right
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'error-report-toggle';
  toggleBtn.style.cssText = 'position: fixed; bottom: 20px; right: 430px; width: 50px; height: 50px; background: #ef4444; color: white; border: none; border-radius: 50%; font-size: 20px; cursor: pointer; z-index: 99998; display: none; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4); transition: all 0.2s; font-weight: 700;';
  toggleBtn.textContent = '❌';
  toggleBtn.title = 'Click to view errors';

  toggleBtn.onclick = () => window.errorManager.toggleErrorReport();
  toggleBtn.onmouseover = () => toggleBtn.style.background = '#dc2626';
  toggleBtn.onmouseout = () => toggleBtn.style.background = '#ef4444';

  document.body.appendChild(toggleBtn);

  // Show toggle when errors occur
  const originalLogError = window.errorManager.logError.bind(window.errorManager);
  window.errorManager.logError = function(message, type, context) {
    originalLogError(message, type, context);
    if (this.errors.length > 0) {
      toggleBtn.style.display = 'block';
    }
  };

  console.log('✅ Error Management System v7.0.125 Ready');
  console.log('  - Centralized error tracking');
  console.log('  - Error display and clearing');
  console.log('  - Copy errors functionality');
})();

