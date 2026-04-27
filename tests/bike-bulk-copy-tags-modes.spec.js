const fs = require('fs');
const path = require('path');
const { test, expect } = require('./reliability-test');

const BIKE_SCRIPT_PATH = path.resolve(process.cwd(), 'JS Files', 'bike-trails-tab-system.js');

test('Bike bulk copy-tags supports first/append and union/replace modes', async ({ page }) => {
  const bikeScript = fs.readFileSync(BIKE_SCRIPT_PATH, 'utf8');

  await page.setContent(`
    <!doctype html>
    <html>
      <head><meta charset="utf-8" /></head>
      <body>
        <div id="bikeBulkActionsCard">
          <select id="bikeBulkSelectionScope">
            <option value="filtered" selected>Filtered</option>
            <option value="page">Page</option>
          </select>
          <button id="bikeBulkSelectVisibleBtn" type="button">Select Filtered</button>
          <button id="bikeBulkInvertSelectionBtn" type="button">Invert Filtered</button>
          <button id="bikeBulkClearSelectionBtn" type="button">Clear Selection</button>
          <input id="bikeBulkTagsInput" type="text" />
          <button id="bikeBulkApplyTagsBtn" type="button">Apply Tags</button>
          <button id="bikeBulkCopyTagsBtn" type="button">Copy Tags</button>
          <select id="bikeBulkCopySourceMode">
            <option value="first" selected>First</option>
            <option value="union">Union</option>
          </select>
          <select id="bikeBulkCopyMergeMode">
            <option value="append" selected>Append</option>
            <option value="replace">Replace</option>
          </select>
          <button id="bikeBulkApplyRatingBtn" type="button">Apply Rating</button>
          <button id="bikeBulkMarkFavoriteBtn" type="button">Fav</button>
          <button id="bikeBulkUnmarkFavoriteBtn" type="button">Unfav</button>
          <button id="bikeBulkMarkVisitedBtn" type="button">Visited</button>
          <button id="bikeBulkUnmarkVisitedBtn" type="button">Unvisited</button>
          <select id="bikeBulkRatingSelect"><option value="3">3</option></select>
          <label><input id="bikeBulkAutoClearToggle" type="checkbox" />Auto-clear</label>
          <div id="bikeBulkSelectionCount"></div>
          <div id="bikeBulkSelectionScopeHint"><span class="bulk-scope-hint-text"></span></div>
        </div>
        <div id="bikeQuickFiltersCard"></div>
        <div id="bikeTrailsCardsGrid"></div>
      </body>
    </html>
  `);

  await page.evaluate(() => {
    const tagsByPlace = new Map();

    window.showToast = () => {};
    window.openBikeTrailDetailsInNewTab = () => {};

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

    window.bikeTrailsData = [
      { 'Ride Name': 'Trail One', 'Google Place ID': 'trail-0' },
      { 'Ride Name': 'Trail Two', 'Google Place ID': 'trail-1' },
      { 'Ride Name': 'Trail Three', 'Google Place ID': 'trail-2' }
    ];
    window.bikeFilteredTrails = window.bikeTrailsData.map((row, sourceIndex) => ({ sourceIndex, row }));

    const grid = document.getElementById('bikeTrailsCardsGrid');
    for (let i = 0; i < 3; i += 1) {
      const card = document.createElement('article');
      card.className = 'bike-trail-card';
      card.setAttribute('data-bike-source-index', String(i));
      card.innerHTML = `<label><input type="checkbox" class="bike-bulk-select" data-bike-source-index="${i}">Select</label>`;
      grid.appendChild(card);
    }

    window.__bikeCopyModeTest = {
      reset() {
        tagsByPlace.clear();
        const models = typeof window.getAllBikeTrailModels === 'function'
          ? window.getAllBikeTrailModels()
          : [];
        const seeds = [['alpha'], ['beta'], ['gamma']];
        if (models.length) {
          models.forEach((model, idx) => {
            const key = typeof window.getBikeTagKey === 'function' ? window.getBikeTagKey(model) : `bike:${idx}`;
            tagsByPlace.set(String(key || `bike:${idx}`), (seeds[idx] || []).slice());
          });
          return;
        }
        tagsByPlace.set('bike:0', ['alpha']);
        tagsByPlace.set('bike:1', ['beta']);
        tagsByPlace.set('bike:2', ['gamma']);
      },
      snapshot() {
        const models = typeof window.getAllBikeTrailModels === 'function'
          ? window.getAllBikeTrailModels()
          : [];
        const read = (idx) => {
          const model = models[idx];
          const key = model && typeof window.getBikeTagKey === 'function' ? window.getBikeTagKey(model) : `bike:${idx}`;
          return (tagsByPlace.get(String(key || `bike:${idx}`)) || []).slice();
        };
        return {
          t0: read(0),
          t1: read(1),
          t2: read(2)
        };
      }
    };
  });

  await page.addScriptTag({ content: bikeScript });

  await expect.poll(async () => {
    return page.evaluate(() => document.getElementById('bikeTrailsCardsGrid')?.dataset.bikeControlsBound || '');
  }).toBe('1');

  await page.evaluate(() => {
    window.__bikeCopyModeTest.reset();
  });

  await page.click('#bikeBulkSelectVisibleBtn');

  await page.selectOption('#bikeBulkCopySourceMode', 'first');
  await page.selectOption('#bikeBulkCopyMergeMode', 'append');
  await page.click('#bikeBulkCopyTagsBtn');

  await expect.poll(async () => {
    return page.evaluate(() => window.__bikeCopyModeTest.snapshot());
  }).toEqual({
    t0: ['alpha'],
    t1: ['beta', 'alpha'],
    t2: ['gamma', 'alpha']
  });

  await page.evaluate(() => window.__bikeCopyModeTest.reset());
  await page.waitForTimeout(360);
  await page.selectOption('#bikeBulkCopySourceMode', 'union');
  await page.selectOption('#bikeBulkCopyMergeMode', 'replace');
  await page.click('#bikeBulkCopyTagsBtn');

  await expect.poll(async () => {
    return page.evaluate(() => window.__bikeCopyModeTest.snapshot());
  }).toEqual({
    t0: ['alpha', 'beta', 'gamma'],
    t1: ['alpha', 'beta', 'gamma'],
    t2: ['alpha', 'beta', 'gamma']
  });
});

