const { test, expect } = require('./reliability-test');

const CONFIG_DRIVEN_SUBTABS = [
  { key: 'mammals', label: 'Mammals' },
  { key: 'reptiles', label: 'Reptiles' },
  { key: 'amphibians', label: 'Amphibians' },
  { key: 'insects', label: 'Insects' },
  { key: 'arachnids', label: 'Arachnids' },
  { key: 'wildflowers', label: 'Wildflowers' }
];

test.describe('Nature config-driven subtabs smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('.app-tab-btn[data-tab="nature-challenge"]').click();
    await expect(page.locator('#natureChallengeRoot')).toBeVisible();
  });

  test('birds diagnostics row is visible', async ({ page }) => {
    const birdsDiagnosticsRow = page.locator('#birdsDiagnosticsRow');
    await expect(birdsDiagnosticsRow).toBeVisible();
    await expect(birdsDiagnosticsRow).toContainText('Auth');
    await expect(birdsDiagnosticsRow).toContainText('Workbook');
    await expect(birdsDiagnosticsRow).toContainText('Species');
  });

  test('mammals diagnostics row contains stable labels', async ({ page }) => {
    await page.locator('#appSubTabsSlot [data-nature-subtab="mammals"]').click();
    const mammalsDiagnosticsRow = page.locator('#mammalsDiagnosticsRow');
    await expect(mammalsDiagnosticsRow).toContainText('Auth');
    await expect(mammalsDiagnosticsRow).toContainText('Workbook');
    await expect(mammalsDiagnosticsRow).toContainText('Species');
    await expect(mammalsDiagnosticsRow).toContainText('Sightings/User State');
  });

  CONFIG_DRIVEN_SUBTABS.forEach(({ key, label }) => {
    test(`subtab smoke: ${label}`, async ({ page }) => {
      await page.locator(`#appSubTabsSlot [data-nature-subtab="${key}"]`).click();
      await expect(page.locator('#natureChallengePane-birds')).toBeVisible();
      await expect(page.locator('#natureChallengeTitle')).toHaveText(`Nature Challenge - ${label}`);

      const totalSpeciesText = await page.locator(`#${key}TotalSpecies`).textContent();
      expect(String(totalSpeciesText || '').trim().length).toBeGreaterThan(0);

      const familyGridText = await page.locator(`#${key}FamilyGrid`).textContent();
      expect(String(familyGridText || '').trim().length).toBeGreaterThan(0);
    });
  });
});

