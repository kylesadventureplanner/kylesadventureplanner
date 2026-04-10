const fs = require('fs');
const path = require('path');
const { test, expect } = require('./reliability-test');

const BULK_SCRIPT_PATH = path.resolve(process.cwd(), 'JS Files', 'multi-select-bulk-actions.js');
const TOTAL_ROWS = 300;
const TEST_TAG = 'undo-cap-tag';

test('bulk tag undo preserves snapshot-cap behavior for large selections', async ({ page }) => {
  const bulkScript = fs.readFileSync(BULK_SCRIPT_PATH, 'utf8');

  await page.setContent(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: sans-serif; }
          #adventureBulkActionsCard, #adventureCardsGrid { display: block; }
          #adventureBulkActionsCard { width: 900px; min-height: 120px; }
          #adventureCardsGrid { width: 900px; min-height: 300px; }
          .adventure-card { display: block; min-height: 48px; margin: 6px 0; border: 1px solid #d1d5db; }
          .toast { margin: 4px 0; padding: 6px 8px; border: 1px solid #cbd5e1; }
          .toast-warning { background: #fff7ed; }
          .toast-info { background: #eff6ff; }
        </style>
      </head>
      <body>
        <div id="adventureBulkActionsCard">
          <select id="adventureBulkSelectionScope">
            <option value="filtered" selected>Filtered</option>
            <option value="page">Page</option>
          </select>
          <button id="adventureBulkSelectVisibleBtn" type="button">Select Filtered</button>
          <button id="adventureBulkInvertSelectionBtn" type="button">Invert Filtered</button>
          <button id="adventureBulkClearSelectionBtn" type="button">Clear Selection</button>
          <input id="adventureBulkTagsInput" type="text" />
          <button id="adventureBulkApplyTagsBtn" type="button">Apply Tags</button>
          <button id="adventureBulkApplyRatingBtn" type="button">Apply Rating</button>
          <button id="adventureBulkMarkFavoriteBtn" type="button">Fav</button>
          <button id="adventureBulkUnmarkFavoriteBtn" type="button">Unfav</button>
          <button id="adventureBulkMarkVisitedBtn" type="button">Visited</button>
          <button id="adventureBulkUnmarkVisitedBtn" type="button">Unvisited</button>
          <select id="adventureBulkRatingSelect"><option value="3">3</option></select>
          <label><input id="adventureBulkAutoClearToggle" type="checkbox" />Auto-clear</label>
          <div id="adventureBulkSelectionCount"></div>
          <div id="adventureBulkSelectionScopeHint"><span class="bulk-scope-hint-text"></span></div>
        </div>
        <div id="adventureCardsGrid"></div>
        <div id="toastContainer"></div>
      </body>
    </html>
  `);

  await page.evaluate(({ totalRows }) => {
    const tagsByPlace = new Map();

    window.showToast = function(message, type = 'info') {
      const container = document.getElementById('toastContainer');
      if (!container) return;
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.textContent = String(message || '');
      container.appendChild(toast);
    };

    window.showUndoToast = function(message, undoFn) {
      const container = document.getElementById('toastContainer');
      if (!container) return;
      const toast = document.createElement('div');
      toast.className = 'toast toast-warning';
      toast.innerHTML = '<span class="toast-message"></span><button type="button" class="toast-action-btn">Undo</button>';
      const messageNode = toast.querySelector('.toast-message');
      if (messageNode) messageNode.textContent = String(message || '');
      const btn = toast.querySelector('.toast-action-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          if (typeof undoFn === 'function') undoFn();
        });
      }
      container.appendChild(toast);
    };

    window.tagManager = {
      getTagsForPlace(placeId) {
        const key = String(placeId || '');
        return (tagsByPlace.get(key) || []).slice();
      },
      addTagsToPlace(placeId, tagsToAdd) {
        const key = String(placeId || '');
        const current = (tagsByPlace.get(key) || []).slice();
        let added = 0;
        (Array.isArray(tagsToAdd) ? tagsToAdd : []).forEach((tag) => {
          if (!current.includes(tag)) {
            current.push(tag);
            added += 1;
          }
        });
        tagsByPlace.set(key, current);
        return added;
      },
      setTagsForPlace(placeId, nextTags) {
        const key = String(placeId || '');
        tagsByPlace.set(key, Array.isArray(nextTags) ? nextTags.slice() : []);
      }
    };

    window.adventuresData = Array.from({ length: totalRows }, (_, idx) => ({
      values: [[`Place ${idx + 1}`, `pid-${idx}`]],
      rowId: ''
    }));

    window.totalFilteredAdventures = window.adventuresData.map((row, sourceIndex) => ({
      sourceIndex,
      row
    }));

    window.currentPage = 1;
    window.itemsPerPage = 20;

    for (let i = 0; i < totalRows; i += 1) {
      tagsByPlace.set(`pid-${i}`, ['seed']);
    }

    const grid = document.getElementById('adventureCardsGrid');
    for (let i = 0; i < 20; i += 1) {
      const card = document.createElement('div');
      card.className = 'adventure-card';
      card.setAttribute('data-source-index', String(i));
      card.textContent = `Card ${i + 1}`;
      grid.appendChild(card);
    }

    window.__bulkTagUndoTest = {
      getStats(tag) {
        let withTag = 0;
        let withoutTag = 0;
        for (let i = 0; i < totalRows; i += 1) {
          const tags = tagsByPlace.get(`pid-${i}`) || [];
          if (tags.includes(tag)) withTag += 1;
          else withoutTag += 1;
        }
        return { withTag, withoutTag, totalRows };
      }
    };
  }, { totalRows: TOTAL_ROWS });

  await page.addScriptTag({ content: bulkScript });

  await expect.poll(async () => {
    return page.evaluate(() => document.getElementById('adventureBulkActionsCard')?.dataset.bound || '');
  }).toBe('1');

  await page.selectOption('#adventureBulkSelectionScope', 'filtered');
  await page.click('#adventureBulkSelectVisibleBtn');
  await expect(page.locator('#adventureBulkSelectionCount')).toContainText('/ 300 total selected');

  await page.fill('#adventureBulkTagsInput', TEST_TAG);
  await page.click('#adventureBulkApplyTagsBtn');

  const undoToast = page.locator('.toast.toast-warning:has-text("undo covers first 250")');
  await expect(undoToast).toBeVisible();

  const afterApply = await page.evaluate((tag) => {
    return window.__bulkTagUndoTest.getStats(tag);
  }, TEST_TAG);
  expect(afterApply.withTag).toBe(TOTAL_ROWS);

  await undoToast.locator('.toast-action-btn').click();
  await expect(page.locator('.toast.toast-info:has-text("snapshot cap")')).toBeVisible();

  await expect.poll(async () => {
    return page.evaluate((tag) => {
      return window.__bulkTagUndoTest.getStats(tag);
    }, TEST_TAG);
  }).toEqual({ withTag: 50, withoutTag: 250, totalRows: TOTAL_ROWS });
});

