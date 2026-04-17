const { test, expect } = require('@playwright/test');
const { openNatureLogViewOrSkip } = require('./playwright-helpers');

test.describe('Nature iNaturalist import', () => {
  test('paste preview + dry run parses rows', async ({ page }, testInfo) => {
    const logView = await openNatureLogViewOrSkip(testInfo, page, {
      requiredSelectors: ['#birdsImportPasteInput', '#birdsImportParseBtn'],
      skipMessage: 'iNaturalist import UI is not available on this APP_URL build.'
    });

    await page.waitForFunction(() => {
      const select = document.getElementById('birdsLogSpeciesSelect');
      return Boolean(select && select.options && select.options.length > 1);
    });

    const species = await page.evaluate(() => {
      const select = document.getElementById('birdsLogSpeciesSelect');
      return select && select.options && select.options.length > 1 ? String(select.options[1].textContent || '').split(' (')[0].trim() : '';
    });

    expect(species).not.toBe('');

    const csv = `species_guess,observed_on,place_guess,count\n${species},2099-01-01,Import Test Marsh,1`;
    await logView.locator('#birdsImportPasteInput').fill(csv);

    await logView.locator('#birdsImportParseBtn').click();
    await expect(logView.locator('#birdsImportStatus')).toContainText('Parsed 1 rows');

    await logView.locator('#birdsImportDryRunBtn').click();
    await expect(logView.locator('#birdsImportPreview')).toContainText('READY');
  });

  test('csv upload auto-previews and manual preview remains functional', async ({ page }, testInfo) => {
    const logView = await openNatureLogViewOrSkip(testInfo, page, {
      requiredSelectors: ['#birdsImportPasteInput', '#birdsImportParseBtn'],
      skipMessage: 'iNaturalist import UI is not available on this APP_URL build.'
    });

    await page.waitForFunction(() => {
      const select = document.getElementById('birdsLogSpeciesSelect');
      return Boolean(select && select.options && select.options.length > 1);
    });

    const species = await page.evaluate(() => {
      const select = document.getElementById('birdsLogSpeciesSelect');
      return select && select.options && select.options.length > 1 ? String(select.options[1].textContent || '').split(' (')[0].trim() : '';
    });
    expect(species).not.toBe('');

    const csv = `species_guess,observed_on,place_guess,count\n${species},2099-03-03,Upload Test Marsh,2`;
    await logView.locator('#birdsImportFileInput').setInputFiles({
      name: 'inat-upload.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csv, 'utf8')
    });

    // Auto-preview should run immediately after file selection.
    await expect(logView.locator('#birdsImportStatus')).toContainText('Parsed 1 rows');

    // Manual preview action should still be valid after auto-preview.
    await logView.locator('#birdsImportParseBtn').click();
    await expect(logView.locator('#birdsImportStatus')).toContainText('Parsed 1 rows');

    await logView.locator('#birdsImportDryRunBtn').click();
    await expect(logView.locator('#birdsImportPreview')).toContainText('READY');
  });
});

