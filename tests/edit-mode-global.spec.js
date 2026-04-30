/**
 * edit-mode-global.spec.js
 * Tests:
 *  1. Global header "Edit Mode" button is present and wired to openEditModeWindow.
 *  2. edit-mode-enhanced.html loads with all 7 target-table options populated for
 *     action target (places tab) and automation-default target (automation tab).
 *  3. target controls are scoped to their relevant tab.
 */
const { test, expect } = require('./reliability-test');

const EXPECTED_TARGET_IDS = [
  'nature_locations',
  'retail_coffee',
  'retail_retail',
  'retail_restaurants',
  'ent_festivals',
  'ent_wildlife_animals',
  'ent_general'
];

// Navigate directly to the edit-mode page (no auth required for UI smoke).
async function gotoEditMode(page, url = '/HTML Files/edit-mode-enhanced.html') {
  await page.goto(url);
  // Wait for the target selectors to be populated by initTargetSelectors().
  await page.waitForFunction(() => {
    const sel = document.getElementById('actionTargetSelect');
    return sel && sel.options.length >= 7;
  }, { timeout: 10000 });
}

async function expandTabCardsIfAvailable(page, tabName) {
  // Directly expand all collapsible cards using JavaScript for better reliability in CI
  await page.evaluate((tabId) => {
    const tabContent = document.getElementById(tabId);
    if (!tabContent) return;

    const cards = Array.from(tabContent.querySelectorAll(':scope > .card.edit-collapsible-card'));
    const placesMainCards = tabId === 'places-tab' ? Array.from(tabContent.querySelectorAll('#placesMainContent > .card.edit-collapsible-card')) : [];
    const allCards = cards.concat(placesMainCards);

    allCards.forEach((card) => {
      const body = card.querySelector(':scope > .edit-collapsible-card-body');
      const toggleBtn = card.querySelector(':scope > .edit-card-collapse-btn');
      if (body && toggleBtn) {
        card.classList.remove('is-collapsed');
        body.hidden = false;
        toggleBtn.setAttribute('aria-expanded', 'true');
        toggleBtn.textContent = '▲ Collapse';
        toggleBtn.title = 'Collapse section';
      }
    });
  }, `${tabName}-tab`);
}

test.describe('Edit Mode – global header button', () => {
  test('header contains #globalEditModeBtn with correct label and handler', async ({ page }) => {
    await page.goto('/');
    const btn = page.locator('#globalEditModeBtn');
    await expect(btn).toBeVisible();
    await expect(btn).toHaveText(/Edit Mode/i);
    const onclick = await btn.getAttribute('onclick');
    expect(onclick).toContain('openEditModeWindow');
  });
});

test.describe('Edit Mode – target-table selectors', () => {
  test.beforeEach(async ({ page }) => {
    await gotoEditMode(page);
    await expandTabCardsIfAvailable(page, 'places');
  });

  test('action target select has all 7 tables', async ({ page }) => {
    const select = page.locator('#actionTargetSelect');
    await expect(select).toBeVisible();
    for (const id of EXPECTED_TARGET_IDS) {
      await expect(select.locator(`option[value="${id}"]`)).toHaveCount(1);
    }
    const count = await select.locator('option').count();
    expect(count).toBe(7);
  });

  test('automation default select has all 7 tables', async ({ page }) => {
    await page.click('.tab-btn[data-tab="automation"]');
    const select = page.locator('#automationTargetSelect');
    await expect(select).toBeVisible();
    const count = await select.locator('option').count();
    expect(count).toBe(7);
  });

  test('tab-specific target controls show only relevant section', async ({ page }) => {
    await expect(page.locator('#actionTargetSelect')).toBeVisible();
    await expect(page.locator('#automationTargetSelect')).toBeHidden();
    await expect(page.locator('#targetSelectionStatus')).toBeVisible();

    await page.click('.tab-btn[data-tab="automation"]');
    await expect(page.locator('#automationTargetSelect')).toBeVisible();
    await expect(page.locator('#actionTargetSelect')).toBeHidden();
    await expect(page.locator('#targetSelectionStatus')).toHaveAttribute('hidden', '');
  });

  test('status chips update when target changes', async ({ page }) => {
    const chipGrid = page.locator('#targetSelectionStatus');
    await expect(chipGrid).toBeVisible();
    // Select "Retail" table in the action selector
    await page.selectOption('#actionTargetSelect', 'retail_retail');
    // Scope assertion to Add/Bulk chip only to avoid unrelated chip text churn.
    const addBulkChip = chipGrid.locator('.target-chip', { hasText: 'Add/Bulk:' });
    await expect(addBulkChip).toContainText(/Add\/Bulk:\s*Retail\s*\(Retail_Food_and_Drink\.xlsx\)/i);
  });

  test('embedded launch defaults add target to the matching source subtab table', async ({ page }) => {
    await gotoEditMode(page, '/HTML%20Files/edit-mode-enhanced.html#embedded=1&sourceSubtab=wildlife-animals');
    await expect(page.locator('#actionTargetSelect')).toHaveValue('ent_wildlife_animals');
    await expect(page.locator('#automationTargetSelect')).toHaveValue('ent_wildlife_animals');
    const addBulkChip = page.locator('#targetSelectionStatus .target-chip', { hasText: 'Add/Bulk:' });
    await expect(addBulkChip).toContainText(/Wildlife_Animals\s*\(Entertainment_Locations\.xlsx\)/i);
  });

  test('tabs switch between Places and Automation panels', async ({ page }) => {
    // Default: places tab active
    await expect(page.locator('#places-tab')).toHaveClass(/active/);
    await expect(page.locator('#automation-tab')).not.toHaveClass(/active/);

    // Click Automation tab
    await page.click('.tab-btn[data-tab="automation"]');
    await expect(page.locator('#automation-tab')).toHaveClass(/active/);
    await expect(page.locator('#places-tab')).not.toHaveClass(/active/);
  });

  test('automation tab exposes dedicated Search Missing Place IDs action', async ({ page }) => {
    await page.click('.tab-btn[data-tab="automation"]');
    await expandTabCardsIfAvailable(page, 'automation');
    const searchBtn = page.locator('#searchMissingPlaceIdsBtn');
    await expect(searchBtn).toBeVisible();
    await expect(searchBtn).toHaveText(/Search Missing Place IDs/i);

    await page.evaluate(() => {
      const header = [
        'Name', 'Google Place ID', 'Website', 'Tags', 'Drive Time', 'Hours of Operation', 'Activity Duration', 'Difficulty', 'Trail Length',
        'State', 'City', 'Address', 'Phone Number', 'Google Rating', 'Cost', 'Directions', 'Description', 'Nearby', 'Links', 'Links2',
        'Notes', 'My Rating', 'Favorite', 'Google URL'
      ];
      const indexMap = Object.fromEntries(header.map((name, index) => [name, index]));
      window.getColumnIndexByName = (primary, aliases = []) => {
        const candidates = [primary].concat(Array.isArray(aliases) ? aliases : []).map((value) => String(value || '').trim().toLowerCase());
        const found = Object.keys(indexMap).find((name) => candidates.includes(String(name || '').trim().toLowerCase()));
        return found == null ? -1 : indexMap[found];
      };
      const row = new Array(header.length).fill('');
      row[0] = 'Playwright Missing Place ID Cafe';
      row[9] = 'NC';
      row[10] = 'Durham';
      row[11] = '123 Missing Id Ln, Durham, NC 27701';
      window.adventuresData = [{ rowId: 'row-1', values: [row] }];
      window.__excelColumnCount = header.length;
      window.__excelLoadedRowCount = 1;
      window.__excelSchemaColumns = header.map((name, index) => ({ name, index }));
      window.probeTargetSchema = async () => true;
      window.loadTargetRows = async () => true;
      window.showToast = () => {};
      window.__searchMissingPlaceIdsCalls = [];
      window.searchMissingGooglePlaceIds = async (options = {}) => {
        window.__searchMissingPlaceIdsCalls.push({ ...options });
        return {
          success: true,
          message: 'stub search complete',
          dryRun: !!options.dryRun,
          processedTargets: 1,
          persistedTargets: 0,
          failedTargets: 0,
          rowsChanged: 0,
          persistedRows: 0,
          verifiedRowsChanged: 0,
          persisted: false,
          persistMode: 'dry-run',
          persistReason: '',
          postWriteVerified: false,
          verificationMode: '',
          verificationReason: ''
        };
      };
    });

    await page.evaluate(() => {
      const checkbox = document.getElementById('searchPlaceIdsDryRun');
      if (!checkbox) throw new Error('searchPlaceIdsDryRun checkbox missing');
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await searchBtn.click();

    await expect.poll(() => page.evaluate(() => window.__searchMissingPlaceIdsCalls.length), { timeout: 10000 }).toBe(1);
    await expect.poll(() => page.evaluate(() => window.__searchMissingPlaceIdsCalls[0]), { timeout: 10000 })
      .toMatchObject({ dryRun: true });
    await expect(page.locator('#search-place-ids-write-diagnostics')).toContainText(/dry run only/i);
  });

  test('automation mode selectors show recommendation hints and emit change toast', async ({ page }) => {
    await page.click('.tab-btn[data-tab="automation"]');
    await expandTabCardsIfAvailable(page, 'automation');

    await expect(page.locator('#refreshPlaceIdsModeHint')).toContainText('Recommended: Missing only');
    await expect(page.locator('#populateMissingModeHint')).toContainText('Recommended: Missing only');
    await expect(page.locator('#updateHoursModeHint')).toContainText('Recommended: Refresh all');

    await page.evaluate(() => {
      window.__modeToastCalls = [];
      window.showToast = (...args) => {
        window.__modeToastCalls.push(args.map((part) => String(part)));
      };
    });

    await page.selectOption('#populateMissingMode', 'refresh-all');
    await expect(page.locator('#populateMissingModeHint')).toContainText('Recommended: Missing only (now Refresh all)');
    await expect.poll(() => page.evaluate(() => window.__modeToastCalls.length), { timeout: 10000 }).toBeGreaterThan(0);
    await expect.poll(() => page.evaluate(() => window.__modeToastCalls[window.__modeToastCalls.length - 1][0]), { timeout: 10000 })
      .toContain('Fill Missing Fields mode changed to Refresh all');
  });

  test('Update Descriptions automation fills blank descriptions from Google details', async ({ page }) => {
    await page.click('.tab-btn[data-tab="automation"]');
    await page.evaluate(() => {
      const header = [
        'Name', 'Google Place ID', 'Website', 'Tags', 'Drive Time', 'Hours of Operation', 'Activity Duration', 'Difficulty', 'Trail Length',
        'State', 'City', 'Address', 'Phone Number', 'Google Rating', 'Cost', 'Directions', 'Description', 'Nearby', 'Links', 'Links2',
        'Notes', 'My Rating', 'Favorite', 'Google URL'
      ];
      const indexMap = Object.fromEntries(header.map((name, index) => [name, index]));
      window.getColumnIndexByName = (primary, aliases = []) => {
        const candidates = [primary].concat(Array.isArray(aliases) ? aliases : []).map((value) => String(value || '').trim().toLowerCase());
        const found = Object.keys(indexMap).find((name) => candidates.includes(String(name || '').trim().toLowerCase()));
        return found == null ? -1 : indexMap[found];
      };
      const row = new Array(header.length).fill('');
      row[0] = 'Playwright Mock Description Place';
      row[1] = 'ChIJPlaywrightDesc123';
      row[9] = 'NC';
      row[10] = 'Durham';
      row[11] = '500 Test Lane, Durham, NC 27701';
      window.adventuresData = [{ values: [row] }];
      window.getPlaceDetails = async () => ({
        description: 'Google editorial summary for Playwright Mock Description Place.',
        address: '500 Test Lane, Durham, NC 27701',
        rating: 4.8,
        reviews: []
      });
      window.saveToExcel = async () => {
        window.__updateDescriptionsSaved = true;
        return true;
      };
    });

    await page.evaluate(async () => {
      const mount = document.createElement('div');
      mount.id = 'playwright-desc-diagnostics';
      document.body.appendChild(mount);
      window.__updateDescriptionsResult = await window.handleUpdateAllDescriptions(mount, false, false);
    });

    await expect.poll(() => page.evaluate(() => String(window.adventuresData?.[0]?.values?.[0]?.[16] || '')), { timeout: 10000 })
      .toContain('Google editorial summary for Playwright Mock Description Place.');
    await expect.poll(() => page.evaluate(() => Boolean(window.__updateDescriptionsSaved)), { timeout: 10000 }).toBe(true);
    await expect.poll(() => page.evaluate(() => window.__updateDescriptionsResult), { timeout: 10000 }).toMatchObject({ success: true, updatedCount: 1 });
    await expect.poll(() => page.evaluate(() => window.__updateDescriptionsResult?.previewItems || []), { timeout: 10000 })
      .toEqual([
        expect.objectContaining({
          name: 'Playwright Mock Description Place',
          description: 'Google editorial summary for Playwright Mock Description Place.'
        })
      ]);
    await expect.poll(() => page.evaluate(() => String(document.getElementById('playwright-desc-diagnostics')?.innerText || '')), { timeout: 10000 })
      .toContain('Preview of updated descriptions');
    await expect.poll(() => page.evaluate(() => String(document.getElementById('playwright-desc-diagnostics')?.innerText || '')), { timeout: 10000 })
      .toContain('Google editorial summary for Playwright Mock Description Place.');
    await expect.poll(() => page.evaluate(() => {
      const root = document.getElementById('playwright-desc-diagnostics');
      const btn = root ? root.querySelector('button') : null;
      return btn ? String(btn.textContent || '') : '';
    }), { timeout: 10000 }).toContain('Copy preview text');
    await page.evaluate(async () => {
      window.__copyPreviewResult = await window.copyDescriptionPreviewText();
    });
    await expect.poll(() => page.evaluate(() => String(window.__lastDescriptionPreviewCopiedText || '')), { timeout: 10000 })
      .toContain('Playwright Mock Description Place');
    await expect.poll(() => page.evaluate(() => String(window.__lastDescriptionPreviewCopiedText || '')), { timeout: 10000 })
      .toContain('Google editorial summary for Playwright Mock Description Place.');
  });

  test('automation handlers persist workbook writes when rows are updated', async ({ page }) => {
    await page.click('.tab-btn[data-tab="automation"]');
    await page.evaluate(() => {
      const header = [
        'Name', 'Google Place ID', 'Website', 'Tags', 'Drive Time', 'Hours of Operation', 'Activity Duration', 'Difficulty', 'Trail Length',
        'State', 'City', 'Address', 'Phone Number', 'Google Rating', 'Cost', 'Directions', 'Description', 'Nearby', 'Links', 'Links2',
        'Notes', 'My Rating', 'Favorite', 'Google URL'
      ];
      const indexMap = Object.fromEntries(header.map((name, index) => [name, index]));
      window.getColumnIndexByName = (primary, aliases = []) => {
        const candidates = [primary].concat(Array.isArray(aliases) ? aliases : []).map((value) => String(value || '').trim().toLowerCase());
        const found = Object.keys(indexMap).find((name) => candidates.includes(String(name || '').trim().toLowerCase()));
        return found == null ? -1 : indexMap[found];
      };

      const row = new Array(header.length).fill('');
      row[0] = 'Playwright Mountain Trail Cafe';
      row[1] = 'ChIJPlaywrightPersist123';
      row[9] = 'NC';
      row[10] = 'Asheville';
      row[11] = '123 Persist Lane, Asheville, NC 28801';
      window.adventuresData = [{ values: [row] }];

      window.__saveCalls = 0;
      window.__saveRows = [];
      window.saveToExcel = async (rowIndex, values) => {
        window.__saveCalls += 1;
        if (typeof rowIndex === 'number' && Array.isArray(values)) {
          window.__saveRows.push({ rowIndex, values: values.slice() });
          return { persisted: true, verified: true, rowRef: `itemAt(index=${rowIndex})` };
        }
        return true;
      };

      window.getPlaceDetails = async () => ({
        website: 'https://playwright-persist.example',
        phone: '(555) 555-0100',
        hours: { Monday: '8:00 AM - 4:00 PM' },
        address: '123 Persist Lane, Asheville, NC 28801',
        rating: 4.7,
        description: 'Persisted automation description.',
        reviews: []
      });

      if (!window.tagManager) {
        window.tagManager = {
          addTagsToPlace: () => 1,
          getTagsForPlace: () => []
        };
      }
    });

    await page.evaluate(async () => {
      const mount = document.createElement('div');
      document.body.appendChild(mount);
      window.__populatePersistResult = await window.handlePopulateMissingFields(mount, false);
      // Reset hours cell so the hours handler still has something to write
      // (handlePopulateMissingFields already populated it; the refresh-all optimisation
      // would otherwise skip rows whose value already matches Google).
      if (window.adventuresData?.[0]?.values?.[0]) {
        const hoursIdx = typeof window.getColumnIndexByName === 'function'
          ? Number(window.getColumnIndexByName('Hours of Operation', ['Hours'])) : 5;
        if (hoursIdx >= 0) window.adventuresData[0].values[0][hoursIdx] = '';
      }
      window.__hoursPersistResult = await window.handleUpdateHoursOnly(mount, false);
      window.__tagPersistResult = await window.autoTagAllLocationsUnified({ dryRun: false });
    });

    await expect.poll(() => page.evaluate(() => Number(window.__saveCalls || 0)), { timeout: 10000 }).toBeGreaterThanOrEqual(2);
    await expect.poll(() => page.evaluate(() => window.__saveRows || []), { timeout: 10000 })
      .toEqual(expect.arrayContaining([
        expect.objectContaining({ rowIndex: 0 })
      ]));
    await expect.poll(() => page.evaluate(() => String(window.adventuresData?.[0]?.values?.[0]?.[2] || '')), { timeout: 10000 })
      .toContain('playwright-persist.example');
    await expect.poll(() => page.evaluate(() => String(window.adventuresData?.[0]?.values?.[0]?.[5] || '')), { timeout: 10000 })
      .toContain('Monday');
    await expect.poll(() => page.evaluate(() => String(window.adventuresData?.[0]?.values?.[0]?.[3] || '')), { timeout: 10000 })
      .not.toBe('');

    await page.evaluate(async () => {
      const mount = document.createElement('div');
      document.body.appendChild(mount);
      window.__diagResult = await window.handleUpdateAllDescriptions(mount, false, false);
      if (typeof window.renderAutomationWriteDiagnostics === 'function') {
        const writeDiagPayload = {
          success: true,
          persisted: true,
          persistMode: 'saveToExcel-row-patch',
          persistReason: '',
          processedTargets: 1,
          persistedTargets: 1,
          rowsChanged: 1,
          persistedRows: 1,
          verifiedRowsChanged: 1,
          verificationMode: 'row-reread',
          verificationReason: '',
          dryRun: false,
          failedTargets: 0
        };
        window.renderAutomationWriteDiagnostics('desc-write-diagnostics', writeDiagPayload);
        window.renderAutomationWriteDiagnostics('force-update-write-diagnostics', writeDiagPayload);
        if (typeof window.appendDescriptionColumnDiagnosticsSuffix === 'function') {
          window.appendDescriptionColumnDiagnosticsSuffix('hours-write-diagnostics', {
            persisted: true,
            processedTargets: 1,
            persistedTargets: 1,
            rowsChanged: 1,
            persistedRows: 1,
            verifiedRowsChanged: 1,
            verificationMode: 'row-reread',
            dryRun: false,
            failedTargets: 0,
            descriptionIndex: 16,
            descriptionColumnName: 'Description'
          });
          window.appendDescriptionColumnDiagnosticsSuffix('force-update-write-diagnostics', {
            descriptionIndex: 16,
            descriptionColumnName: 'Description'
          });
        }
      }
    });

    await expect.poll(() => page.locator('#desc-write-diagnostics').innerText(), { timeout: 10000 })
      .toContain('saved to Excel');
    await expect.poll(() => page.evaluate(() => window.__populatePersistResult), { timeout: 10000 })
      .toMatchObject({ rowsChanged: 1, persistedRows: 1, verifiedRowsChanged: 1, postWriteVerified: true, verificationMode: 'row-reread' });
    await expect.poll(() => page.evaluate(() => window.__hoursPersistResult), { timeout: 10000 })
      .toMatchObject({ rowsChanged: 1, persistedRows: 1, verifiedRowsChanged: 1, postWriteVerified: true, verificationMode: 'row-reread' });
    await expect.poll(() => page.evaluate(() => window.__tagPersistResult), { timeout: 10000 })
      .toMatchObject({ rowsChanged: 1, persistedRows: 1, verifiedRowsChanged: 1, postWriteVerified: true, verificationMode: 'row-reread' });
    await expect.poll(() => page.locator('#desc-write-diagnostics').innerText(), { timeout: 10000 })
      .toContain('1 row changed');
    await expect.poll(() => page.locator('#desc-write-diagnostics').innerText(), { timeout: 10000 })
      .toContain('verified 1/1 row');
    await expect.poll(() => page.locator('#hours-write-diagnostics').innerText(), { timeout: 10000 })
      .toMatch(/Description column:\s*index\s*16\s*\(Description\)/i);
    await expect.poll(() => page.locator('#force-update-write-diagnostics').innerText(), { timeout: 10000 })
      .toContain('saved to Excel');
    await expect.poll(() => page.locator('#force-update-write-diagnostics').innerText(), { timeout: 10000 })
      .toMatch(/Description column:\s*index\s*16\s*\(Description\)/i);
  });

  test('automation row persistence prefers workbook row ids when available', async ({ page }) => {
    await page.click('.tab-btn[data-tab="automation"]');
    await page.evaluate(() => {
      const header = [
        'Name', 'Google Place ID', 'Website', 'Tags', 'Drive Time', 'Hours of Operation', 'Activity Duration', 'Difficulty', 'Trail Length',
        'State', 'City', 'Address', 'Phone Number', 'Google Rating', 'Cost', 'Directions', 'Description', 'Nearby', 'Links', 'Links2',
        'Notes', 'My Rating', 'Favorite', 'Google URL'
      ];
      const indexMap = Object.fromEntries(header.map((name, index) => [name, index]));
      window.getColumnIndexByName = (primary, aliases = []) => {
        const candidates = [primary].concat(Array.isArray(aliases) ? aliases : []).map((value) => String(value || '').trim().toLowerCase());
        const found = Object.keys(indexMap).find((name) => candidates.includes(String(name || '').trim().toLowerCase()));
        return found == null ? -1 : indexMap[found];
      };

      const row = new Array(header.length).fill('');
      row[0] = 'Playwright Row ID Preserve';
      row[1] = 'ChIJPlaywrightPersistRowId123';
      row[9] = 'NC';
      row[10] = 'Asheville';
      row[11] = '456 Stable Row Lane, Asheville, NC 28801';
      window.adventuresData = [{ id: 'row-guid-123', values: [row] }];

      window.__saveRowsById = [];
      window.saveToExcel = async (rowRef, values) => {
        window.__saveRowsById.push({ rowRef, values: Array.isArray(values) ? values.slice() : [] });
        return { persisted: true, verified: true, rowRef: String(rowRef) };
      };

      window.getPlaceDetails = async () => ({
        description: 'Persisted via stable workbook row id.',
        reviews: []
      });
    });

    await page.evaluate(async () => {
      const mount = document.createElement('div');
      document.body.appendChild(mount);
      window.__descriptionPersistById = await window.handleUpdateAllDescriptions(mount, false, false);
    });

    await expect.poll(() => page.evaluate(() => String(window.__saveRowsById?.[0]?.rowRef || '')), { timeout: 10000 })
      .toBe('row-guid-123');
    await expect.poll(() => page.evaluate(() => window.__descriptionPersistById), { timeout: 10000 })
      .toMatchObject({ rowsChanged: 1, persistedRows: 1, verifiedRowsChanged: 1, postWriteVerified: true });
  });

  test('Add Places includes Festival Sources config flow with back navigation and persistence', async ({ page }) => {
    await expect(page.locator('#openFestivalSourcesConfigBtn')).toBeVisible();
    await expect(page.locator('#festivalSourcesTabBadge')).toContainText(/providers enabled/i);
    await page.click('#openFestivalSourcesConfigBtn');
    await expect(page.locator('#festival-tab')).toHaveClass(/active/);
    await expect(page.locator('#dedupeBulkInputNowBtn')).toBeVisible();
    await expect(page.locator('#resetTargetStarterRecommendationsBtn')).toBeVisible();
    await expect(page.locator('#targetStarterOfficialOnlyToggle')).toBeVisible();
    await expect(page.locator('#targetStarterRecommendations')).toHaveValue(/alltrails\.com/i);
    await expect(page.locator('#targetStarterRecommendations')).toHaveValue(/\[community\]/i);
    await page.check('#targetStarterOfficialOnlyToggle');
    await expect(page.locator('#targetStarterRecommendations')).not.toHaveValue(/\[community\]/i);
    await expect(page.locator('#targetStarterRecommendations')).toHaveValue(/\[official\]/i);
    await page.uncheck('#targetStarterOfficialOnlyToggle');

    await page.click('#tab-btn-places');
    await expect(page.locator('#places-tab')).toHaveClass(/active/);
    await page.selectOption('#actionTargetSelect', 'nature_locations');
    await page.click('#tab-btn-festival');
    await expect(page.locator('#festival-tab')).toHaveClass(/active/);
    await expect(page.locator('#targetStarterRecommendations')).toHaveValue(/alltrails\.com/i);
    await page.evaluate(() => {
      const bulk = document.getElementById('bulkInput');
      if (bulk) bulk.value = 'Line A\nLine A\nLine B';
    });
    await page.click('#dedupeBulkInputNowBtn');
    await expect.poll(() => page.evaluate(() => String(document.getElementById('bulkInput')?.value || ''))).toBe('Line A\nLine B');

    await page.evaluate(() => {
      const area = document.getElementById('targetStarterRecommendations');
      if (area) area.value = '';
    });
    await page.click('#resetTargetStarterRecommendationsBtn');
    await expect(page.locator('#targetStarterRecommendations')).toHaveValue(/alltrails\.com/i);

    await page.click('#appendTargetStarterRecommendationsBtn');
    await expect.poll(() => page.evaluate(() => String(document.getElementById('bulkInput')?.value || ''))).toMatch(/alltrails\.com/i);

    await page.click('#tab-btn-places');
    await expect(page.locator('#places-tab')).toHaveClass(/active/);
    await page.selectOption('#actionTargetSelect', 'ent_festivals');
    await page.click('#tab-btn-festival');
    await expect(page.locator('#festival-tab')).toHaveClass(/active/);
    await expect(page.locator('#targetStarterRecommendations')).toHaveValue(/ncapplefestival\.org/i);

    await page.click('#festivalSourcesBackToPlacesBtn');
    await expect(page.locator('#places-tab')).toHaveClass(/active/);
    await expect(page.locator('#festival-tab')).not.toHaveClass(/active/);

    await page.click('#openFestivalSourcesConfigBtn');
    await expect(page.locator('#festival-tab')).toHaveClass(/active/);
    await expandTabCardsIfAvailable(page, 'festival');
    await expect(page.locator('#festivalAppliedConfigBadge')).toBeVisible();
    await page.click('#toggleFestivalSourcesSummaryBtn');
    await expect(page.locator('#festivalAppliedConfigSummary')).toBeVisible();
    await expect(page.locator('#festivalAppliedConfigSummary')).toContainText('Enabled:');
    await page.click('#toggleFestivalSourcesSummaryBtn');
    await expect(page.locator('#festivalAppliedConfigSummary')).toBeHidden();
    await expect(page.locator('#festivalSourcesConfigCard .card-title')).toBeVisible();
    await expect(page.locator('#festivalProviderTicketmasterEnabled')).toBeChecked();
    await expect(page.locator('#festivalProviderOfficialEnabled')).toBeChecked();
    await expect(page.locator('#festivalProviderChamberEnabled')).toBeChecked();
    await expect(page.locator('#festivalLoadStarterFeedsBtn')).toBeVisible();
    await expect(page.locator('#festivalValidateFeedsBtn')).toBeVisible();

    await page.click('#festivalLoadStarterFeedsBtn');
    await expect(page.locator('#festivalOfficialCalendarsFeeds')).toHaveValue(/\[official\].*ncapplefestival\.org\/feed/i);
    await expect(page.locator('#festivalChamberFeeds')).toHaveValue(/\[chamber\].*southernhighlandguild\.org\/events\/feed/i);

    await page.route('**/playwright-feed-live.xml', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/xml',
        body: '<rss><channel><item><title>Apple Fest</title></item></channel></rss>'
      });
    });
    await page.route('**/playwright-feed-empty.xml', async (route) => {
      await route.fulfill({ status: 200, contentType: 'text/plain', body: 'No events available.' });
    });
    await page.fill('#festivalOfficialCalendarsFeeds', [
      '[official] Live Feed|http://127.0.0.1:4173/playwright-feed-live.xml',
      '[official] Empty Feed|http://127.0.0.1:4173/playwright-feed-empty.xml'
    ].join('\n'));
    await page.fill('#festivalChamberFeeds', '[chamber] Blocked Feed|http://');
    await page.click('#festivalValidateFeedsBtn');
    await expect(page.locator('#festivalFeedValidationSummary')).toContainText(/live 1/i);
    await expect(page.locator('#festivalFeedValidationSummary')).toContainText(/blocked 1/i);
    await expect(page.locator('#festivalFeedValidationSummary')).toContainText(/empty 1/i);

    await page.fill('#festivalOfficialCalendarsFeeds', 'Visit NC|https://example.com/nc-events.rss');
    await page.fill('#festivalChamberFeeds', 'Hendo Chamber|https://example.com/chamber.ics');
    await page.uncheck('#festivalProviderTicketmasterEnabled');
    await page.check('#festivalProviderEventbriteEnabled');
    await page.uncheck('#festivalProviderChamberEnabled');
    await page.selectOption('#festivalSourceMaxResults', '12');
    await expect(page.locator('#festivalSourcesBackDirtyDot')).toBeVisible();

    await page.evaluate(() => {
      window.__festivalConfirmResponses = [false];
      window.__festivalConfirmMessage = '';
      window.confirm = (message) => {
        window.__festivalConfirmMessage = String(message || '');
        const queue = Array.isArray(window.__festivalConfirmResponses) ? window.__festivalConfirmResponses : [];
        return queue.length ? Boolean(queue.shift()) : true;
      };
    });
    await page.click('#festivalSourcesBackToPlacesBtn');
    await expect.poll(async () => page.evaluate(() => String(window.__festivalConfirmMessage || ''))).toContain('unsaved Festival Sources changes');
    await expect(page.locator('#festivalSourcesConfigPage')).toBeVisible();

    await page.click('#festivalSaveSourcesBtn');
    await expect(page.locator('#festival-sources-status')).toContainText('saved and applied');
    await expect(page.locator('#festivalSourcesBackDirtyDot')).toBeHidden();

    await page.click('#festivalSourcesBackToPlacesBtn');
    await expect(page.locator('#places-tab')).toHaveClass(/active/);
    await expect(page.locator('#festivalAppliedConfigBadge')).toContainText('2 providers enabled');
    await expect(page.locator('#festivalAppliedConfigBadge')).toContainText('max 12');
    await expect(page.locator('#festivalSourcesTabBadge')).toContainText('2 providers enabled');

    await page.click('#openFestivalSourcesConfigBtn');
    await expect(page.locator('#festival-tab')).toHaveClass(/active/);
    await page.click('#copyFestivalSourcesSummaryBtn');
    await expect(page.locator('#festivalAppliedConfigCopyStatus')).toBeVisible();
    await expect(page.locator('#festivalAppliedConfigCopyStatus')).toContainText(/copy|copied/i);

    await page.click('#festivalSourcesBackToPlacesBtn');
    await expect(page.locator('#places-tab')).toHaveClass(/active/);
    await expect(page.locator('#festivalAppliedConfigBadge')).toContainText('2 providers enabled');
    await expect(page.locator('#festivalAppliedConfigBadge')).toContainText('max 12');
    await expect(page.locator('#festivalSourcesTabBadge')).toContainText('2 providers enabled');
  });
});

