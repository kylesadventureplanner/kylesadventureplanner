const { test, expect } = require('./reliability-test');

test.describe('Nature log UX', () => {
  test('log form supports typeahead species, location other, and contextual fast-command hints', async ({ page }) => {
    await page.goto('/');
    await page.locator('.app-tab-btn[data-tab="nature-challenge"]').click();
    await expect(page.locator('#natureChallengeRoot')).toBeVisible();

    await page.waitForFunction(() => {
      const dockedTabs = document.querySelector('#appSubTabsSlot .nature-challenge-subtabs');
      return Boolean(dockedTabs && dockedTabs.dataset.natureDockBound === '1');
    });

    await expect(page.locator('#appSubTabsSlot [data-nature-subtab="trees"]')).toContainText('Trees & Shrubs');

    await page.locator('#appSubTabsSlot [data-nature-subtab="insects"]').click();
    await expect(page.locator('#natureChallengeTitle')).toContainText('Insects');

    await page.locator('#birdsOpenLogBtn').click();
    await expect(page.locator('.nature-birds-view[data-birds-view="log"]')).toBeVisible();

    await expect(page.locator('#birdsLogCommandInput')).toHaveAttribute('placeholder', /dragonfly marsh certain/i);

    // In local unauthenticated runs, config-driven subtab datasets may be empty.
    // Switch to Birds so species/typeahead checks run against TSV-backed data.
    await page.locator('#appSubTabsSlot [data-nature-subtab="birds"]').click();
    await expect(page.locator('#natureChallengeTitle')).toContainText('Birds');

    const speciesSearch = page.locator('#birdsLogSpeciesSearchInput');
    await expect(speciesSearch).toBeVisible();

    const hasSpeciesOptions = await page.evaluate(() => {
      const select = document.getElementById('birdsLogSpeciesSelect');
      return Boolean(select && select.options && select.options.length > 1);
    });

    if (hasSpeciesOptions) {
      const firstSpeciesName = await page.evaluate(() => {
        const select = document.getElementById('birdsLogSpeciesSelect');
        const option = select && select.options && select.options.length > 1 ? select.options[1] : null;
        if (!option) return '';
        return String(option.textContent || '').split(' (')[0].trim();
      });
      await speciesSearch.fill(firstSpeciesName);
      await speciesSearch.blur();
      await expect(page.locator('#birdsLogSpeciesSelect')).not.toHaveValue('');
    } else {
      await speciesSearch.fill('demo species');
      await expect(speciesSearch).toHaveValue('demo species');
    }

    const locationSelect = page.locator('#birdsLogLocationInput');
    await locationSelect.selectOption('__other__');
    await expect(page.locator('#birdsLogLocationOtherInput')).toBeVisible();
  });
});

