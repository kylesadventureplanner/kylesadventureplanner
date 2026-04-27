const fs = require('fs');
const path = require('path');
const { test, expect } = require('./reliability-test');

const BULK_SCRIPT_PATH = path.resolve(process.cwd(), 'JS Files', 'multi-select-bulk-actions.js');

test('Adventure bulk copy-tags supports first/append and union/replace modes', async ({ page }) => {
  const bulkScript = fs.readFileSync(BULK_SCRIPT_PATH, 'utf8');

  await page.setContent(`
    <!doctype html>
    <html>
      <head><meta charset="utf-8" /></head>
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
          <button id="adventureBulkCopyTagsBtn" type="button">Copy Tags</button>
          <select id="adventureBulkCopySourceMode">
            <option value="first" selected>First</option>
            <option value="union">Union</option>
          </select>
          <select id="adventureBulkCopyMergeMode">
            <option value="append" selected>Append</option>
            <option value="replace">Replace</option>
          </select>
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
      </body>
    </html>
  `);

  await page.evaluate(() => {
    const tagsByPlace = new Map([
      ['pid-0', ['alpha']],
      ['pid-1', ['beta']],
      ['pid-2', ['gamma']]
    ]);

    window.showToast = () => {};
    window.showUndoToast = () => {};

    window.tagManager = {
      getTagsForPlace(placeId) {
        return (tagsByPlace.get(String(placeId || '')) || []).slice();
      },
      addTagsToPlace(placeId, tagsToAdd) {
        const key = String(placeId || '');
        const current = (tagsByPlace.get(key) || []).slice();
        (Array.isArray(tagsToAdd) ? tagsToAdd : []).forEach((tag) => {
          if (!current.some((entry) => String(entry).toLowerCase() === String(tag).toLowerCase())) current.push(String(tag));
        });
        tagsByPlace.set(key, current);
        return current.length;
      },
      setTagsForPlace(placeId, nextTags) {
        tagsByPlace.set(String(placeId || ''), Array.from(new Set((Array.isArray(nextTags) ? nextTags : []).map((t) => String(t || '').trim()).filter(Boolean))));
      }
    };

    window.adventuresData = [
      { values: [['One', 'pid-0']], rowId: '' },
      { values: [['Two', 'pid-1']], rowId: '' },
      { values: [['Three', 'pid-2']], rowId: '' }
    ];

    window.totalFilteredAdventures = window.adventuresData.map((row, sourceIndex) => ({ sourceIndex, row }));
    window.currentPage = 1;
    window.itemsPerPage = 20;

    const grid = document.getElementById('adventureCardsGrid');
    for (let i = 0; i < 3; i += 1) {
      const card = document.createElement('div');
      card.className = 'adventure-card';
      card.setAttribute('data-source-index', String(i));
      card.textContent = `Card ${i + 1}`;
      grid.appendChild(card);
    }

    window.__adventureCopyModeTest = {
      reset() {
        tagsByPlace.set('pid-0', ['alpha']);
        tagsByPlace.set('pid-1', ['beta']);
        tagsByPlace.set('pid-2', ['gamma']);
      },
      snapshot() {
        return {
          p0: (tagsByPlace.get('pid-0') || []).slice(),
          p1: (tagsByPlace.get('pid-1') || []).slice(),
          p2: (tagsByPlace.get('pid-2') || []).slice()
        };
      }
    };
  });

  await page.addScriptTag({ content: bulkScript });

  await expect.poll(async () => {
    return page.evaluate(() => document.getElementById('adventureBulkActionsCard')?.dataset.bound || '');
  }).toBe('1');

  await page.click('#adventureBulkSelectVisibleBtn');

  await page.selectOption('#adventureBulkCopySourceMode', 'first');
  await page.selectOption('#adventureBulkCopyMergeMode', 'append');
  await page.click('#adventureBulkCopyTagsBtn');

  await expect.poll(async () => {
    return page.evaluate(() => window.__adventureCopyModeTest.snapshot());
  }).toEqual({
    p0: ['alpha'],
    p1: ['beta', 'alpha'],
    p2: ['gamma', 'alpha']
  });

  await page.evaluate(() => window.__adventureCopyModeTest.reset());
  await page.selectOption('#adventureBulkCopySourceMode', 'union');
  await page.selectOption('#adventureBulkCopyMergeMode', 'replace');
  await page.click('#adventureBulkCopyTagsBtn');

  await expect.poll(async () => {
    return page.evaluate(() => window.__adventureCopyModeTest.snapshot());
  }).toEqual({
    p0: ['alpha', 'beta', 'gamma'],
    p1: ['alpha', 'beta', 'gamma'],
    p2: ['alpha', 'beta', 'gamma']
  });
});

