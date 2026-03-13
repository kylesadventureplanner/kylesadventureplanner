/**
 * TAG BUTTON INJECTOR
 * ===================
 * Automatically injects tag buttons into location rows
 * Ensures users can access tag manager from anywhere
 *
 * Version: v7.0.120
 * Date: March 13, 2026
 */

(function() {
  console.log('📌 Initializing Tag Button Injector...');

  /**
   * Open tag manager for a place
   */
  window.openTagManagerForPlace = function(placeId, placeName) {
    console.log('🏷️ Opening tag manager for place:', placeId, placeName);

    if (window.cleanTagManager) {
      window.cleanTagManager.openModal(placeId, placeName);
    } else if (window.tagUIManager) {
      window.tagUIManager.openModal(placeId, placeName);
    } else {
      console.error('❌ Tag manager not available');
      alert('Tag manager is loading. Please try again in a moment.');
    }
  };

  /**
   * Inject tag buttons into table rows
   */
  function injectTagButtons() {
    // Look for table rows that don't have tag buttons yet
    const rows = document.querySelectorAll('tr[data-place-id], tr[data-location-id], [data-place-id], [data-location-id]');

    let injected = 0;
    rows.forEach(row => {
      // Skip if already has tag button
      if (row.querySelector('[data-tag-button="true"]')) {
        return;
      }

      const placeId = row.getAttribute('data-place-id') || row.getAttribute('data-location-id');
      const placeName = row.textContent.split('\n')[0] || 'Unknown';

      if (!placeId) return;

      // Look for a cell to inject the button into
      const cells = row.querySelectorAll('td');
      if (cells.length === 0) return;

      // Add button to last cell
      const lastCell = cells[cells.length - 1];
      const button = document.createElement('button');
      button.innerHTML = '🏷️';
      button.title = 'Manage tags for this location';
      button.setAttribute('data-tag-button', 'true');
      button.style.cssText = `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.2s;
        margin-left: 8px;
      `;

      button.addEventListener('mouseover', function() {
        this.style.transform = 'scale(1.1)';
        this.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
      });

      button.addEventListener('mouseout', function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = 'none';
      });

      button.addEventListener('click', (e) => {
        e.stopPropagation();
        window.openTagManagerForPlace(placeId, placeName);
      });

      lastCell.appendChild(button);
      injected++;
    });

    if (injected > 0) {
      console.log(`✅ Injected ${injected} tag buttons`);
    }

    return injected;
  }

  /**
   * Watch for new rows and inject tag buttons
   */
  function watchForNewRows() {
    const observer = new MutationObserver(() => {
      injectTagButtons();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    console.log('👁️ Watching for new location rows...');
  }

  /**
   * Initialize
   */
  function init() {
    // Wait for clean tag manager to be ready
    const checkReady = setInterval(() => {
      if (window.cleanTagManager && window.cleanTagManager.openModal) {
        clearInterval(checkReady);
        console.log('✅ Tag Button Injector ready');

        // Initial injection
        setTimeout(() => {
          injectTagButtons();
          watchForNewRows();
        }, 500);
      }
    }, 100);

    // Fallback timeout
    setTimeout(() => {
      clearInterval(checkReady);
      console.log('⏳ Starting tag button injection anyway...');
      injectTagButtons();
      watchForNewRows();
    }, 5000);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 500);
  }
})();

