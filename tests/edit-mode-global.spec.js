/**
 * edit-mode-global.spec.js
 * Tests:
 *  1. Global header "Edit Mode" button is present and wired to openEditModeWindow.
 *  2. edit-mode-enhanced.html loads with all 7 target-table options populated in
 *     the action, automation-default, and automation-multi selectors.
 *  3. "Select All Tables" helper selects all multi options.
 *  4. "Clear Multi-Selection" helper deselects all.
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
async function gotoEditMode(page) {
  await page.goto('/HTML Files/edit-mode-enhanced.html');
  // Wait for the target selectors to be populated by initTargetSelectors().
  await page.waitForFunction(() => {
    const sel = document.getElementById('actionTargetSelect');
    return sel && sel.options.length >= 7;
  }, { timeout: 10000 });
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
    const select = page.locator('#automationTargetSelect');
    await expect(select).toBeVisible();
    const count = await select.locator('option').count();
    expect(count).toBe(7);
  });

  test('automation multi select has all 7 tables', async ({ page }) => {
    const select = page.locator('#automationTargetMulti');
    await expect(select).toBeVisible();
    const count = await select.locator('option').count();
    expect(count).toBe(7);
  });

  test('Select All Tables selects every option in multi select', async ({ page }) => {
    // Clear first
    await page.click('button:has-text("Clear Multi-Selection")');
    const noneSelected = await page.evaluate(() => {
      const sel = document.getElementById('automationTargetMulti');
      return Array.from(sel.selectedOptions).length;
    });
    expect(noneSelected).toBe(0);

    // Select all
    await page.click('button:has-text("Select All Tables")');
    const allSelected = await page.evaluate(() => {
      const sel = document.getElementById('automationTargetMulti');
      return Array.from(sel.selectedOptions).length;
    });
    expect(allSelected).toBe(7);
  });

  test('status chips update when target changes', async ({ page }) => {
    const chipGrid = page.locator('#targetSelectionStatus');
    await expect(chipGrid).toBeVisible();
    // Select "Retail" table in the action selector
    await page.selectOption('#actionTargetSelect', 'retail_retail');
    // The chip should now mention Retail
    const chipText = await chipGrid.innerText();
    expect(chipText).toContain('Retail_Food_and_Drink.xlsx / Retail');
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
});

