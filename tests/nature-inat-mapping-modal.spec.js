const { test, expect } = require('@playwright/test');
const { openNatureLogViewOrSkip } = require('./playwright-helpers');

test.describe('Nature iNaturalist strict mapping modal', () => {
  test('shows unmatched rows in strict mapping report', async ({ page }, testInfo) => {
    const logView = await openNatureLogViewOrSkip(testInfo, page, {
      requiredSelectors: ['#birdsImportPasteInput', '#birdsImportMappingBtn'],
      skipMessage: 'iNaturalist strict mapping UI is not available on this APP_URL build.'
    });

    const csv = 'species_guess,observed_on,place_guess,count\nTotally Unknown Bird XYZ,2099-01-01,Import Test Site,1';
    await logView.locator('#birdsImportPasteInput').fill(csv);
    await logView.locator('#birdsImportParseBtn').click();

    await expect(logView.locator('#birdsImportStatus')).toContainText('Unmatched: 1');

    await logView.locator('#birdsImportMappingBtn').click();
    const mappingModal = page.locator('#birdsImportMappingModal:visible');
    await expect(mappingModal).toBeVisible();
    await expect(mappingModal.locator('#birdsImportMappingBody')).toContainText('Totally Unknown Bird XYZ');

    await mappingModal.locator('#birdsImportMappingCloseBtn').click();
    await expect(page.locator('#birdsImportMappingModal')).toBeHidden();
  });

  test('applying a suggestion decreases unmatched and increases ready', async ({ page }, testInfo) => {
    const logView = await openNatureLogViewOrSkip(testInfo, page, {
      requiredSelectors: ['#birdsImportPasteInput', '#birdsImportMappingBtn'],
      skipMessage: 'iNaturalist strict mapping UI is not available on this APP_URL build.'
    });

    const csv = 'species_guess,observed_on,place_guess,count\nBald Eagel,2099-02-02,Strict Mapping Test Site,1';
    await logView.locator('#birdsImportPasteInput').fill(csv);
    await logView.locator('#birdsImportParseBtn').click();

    const status = logView.locator('#birdsImportStatus');
    await expect(status).toContainText('Ready: 0');
    await expect(status).toContainText('Unmatched: 1');

    await logView.locator('#birdsImportMappingBtn').click();
    const mappingModal = page.locator('#birdsImportMappingModal:visible');
    await expect(mappingModal).toBeVisible();

    const suggestion = mappingModal.locator('[data-birds-import-map-row="0"][data-birds-import-map-id]').first();
    await expect(suggestion).toBeVisible();
    await suggestion.click();

    await expect(status).toContainText('Ready: 1');
    await expect(status).toContainText('Unmatched: 0');
  });
});

