const { test, expect } = require('./reliability-test');
const { installVisitedExplorerSeedFixture } = require('./playwright-helpers');

test.describe('Visited enrich modal smoke', () => {
  test('supports changed highlights, selective save, confidence chips, and undo', async ({ page }, testInfo) => {
    await installVisitedExplorerSeedFixture(page);
    await page.goto('/');
    await page.locator('.app-tab-btn[data-tab="visited-locations"]').click();
    await expect(page.locator('#visitedLocationsRoot')).toBeVisible();
    await page.waitForFunction(() => {
      const root = document.getElementById('visitedLocationsRoot');
      return Boolean(root && root.dataset && root.dataset.bound === '1');
    });

    const candidateSubtabs = ['outdoors', 'entertainment', 'food-drink', 'retail', 'wildlife-animals', 'regional-festivals'];
    let selectedSubtab = '';

    for (const subtab of candidateSubtabs) {
      await page.locator(`#appSubTabsSlot [data-progress-subtab="${subtab}"]`).first().click();
      const openExplorerBtn = page.locator(`#visitedProgressPane-${subtab} [data-visited-subtab-action="open-explorer-${subtab}"]`).first();
      if (!(await openExplorerBtn.isVisible().catch(() => false))) continue;
      await openExplorerBtn.click();

      const cards = page.locator(`#visitedExplorerList-${subtab} .visited-explorer-card`);
      await cards.first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => null);
      if ((await cards.count()) > 0) {
        selectedSubtab = subtab;
        break;
      }
    }

    expect(selectedSubtab, 'No explorer cards were found across Adventure subtabs; enrich flow preconditions are not met for this build.').not.toBe('');

    const cards = page.locator(`#visitedExplorerList-${selectedSubtab} .visited-explorer-card`);
    const firstCard = cards.first();
    await firstCard.locator('[data-visited-explorer-quick-actions-toggle]').click();
    await firstCard.locator('[data-visited-explorer-parse-text]').click();

    const modal = page.locator('#visitedLocationTextParserModal');
    await expect(modal).toBeVisible();

    const parserInput = page.locator('#visitedLocationParserTextInput');
    const parseBtn = page.locator('#visitedLocationParserParseBtn');
    const saveBtn = page.locator('#visitedLocationParserSaveBtn');

    const firstDescription = `Playwright parser smoke description ${Date.now()}`;
    await parserInput.fill([
      '987 Playwright Ave',
      'Austin, TX',
      '(512) 555-0199',
      'Mon-Fri 9am-5pm',
      firstDescription
    ].join('\n'));
    await parseBtn.click({ force: true });
    const parserPreview = page.locator('#visitedLocationParserPreview');
    const parserFields = page.locator('#visitedLocationParserPreview .visited-parser-fields');
    const confidenceChips = page.locator('.visited-parser-confidence-chip');
    const selectToggles = page.locator('[data-parser-field-select]');
    await expect(parserFields).toBeVisible();
    const initialChipCount = await confidenceChips.count();
    const initialToggleCount = await selectToggles.count();
    const parserTemplate = (initialChipCount > 0 || initialToggleCount > 0) ? 'polished' : 'legacy';
    console.log(`[visited-enrich-diag] parserTemplate=${parserTemplate} chips=${initialChipCount} toggles=${initialToggleCount}`);

    if (parserTemplate === 'polished') {
      await expect(confidenceChips).toHaveCount(6);
      await expect(page.locator('#visitedLocationParserField-description')).toHaveClass(/is-changed/);
      await expect(page.locator('#visitedLocationParserField-description .visited-parser-diff-row').first()).toContainText('Before:');
      await expect(page.locator('#visitedLocationParserField-description .visited-parser-diff-row').nth(1)).toContainText('After:');

      for (let i = 0, total = await selectToggles.count(); i < total; i += 1) {
        const toggle = selectToggles.nth(i);
        if (await toggle.isChecked()) {
          await toggle.uncheck({ force: true });
        }
      }
      await expect(saveBtn).toBeDisabled();

      const descriptionCheckbox = page.locator('#visitedLocationParserSelect-description');
      await descriptionCheckbox.check({ force: true });
      await expect(saveBtn).toBeEnabled();
      await expect(saveBtn).toContainText('Save Selected (1)');
    } else {
      await expect(modal.getByLabel('Address')).toBeEditable();
      await expect(modal.getByLabel('City')).toBeEditable();
      await expect(modal.getByLabel('State')).toBeEditable();
      await expect(modal.getByLabel('Phone')).toBeEditable();
      await expect(modal.getByLabel('Hours of Operation')).toBeEditable();
      await expect(modal.getByLabel('Description')).toBeEditable();
      await expect(saveBtn).toHaveCount(1);
      await expect(saveBtn).toBeEnabled();
      await expect(saveBtn).toContainText(/Save/i);

      const diagnostics = await page.evaluate(() => {
        const preview = document.querySelector('#visitedLocationParserPreview');
        const fields = Array.from(document.querySelectorAll('#visitedLocationParserPreview .visited-parser-field')).map((node) => ({
          id: node.id || '',
          classes: String(node.className || '')
        }));
        return {
          previewClassName: preview ? String(preview.className || '') : '(missing)',
          previewHtml: preview ? String(preview.innerHTML || '') : '(missing)',
          fields
        };
      });
      const previewSnippet = String(diagnostics.previewHtml || '').replace(/\s+/g, ' ').trim().slice(0, 500);
      const fieldClassSummary = (diagnostics.fields || []).map((field) => `${field.id || '(no-id)'} => ${field.classes || '(no-class)'}`).join(' | ');
      console.log(`[visited-enrich-diag] legacy-previewClass=${diagnostics.previewClassName}`);
      console.log(`[visited-enrich-diag] legacy-previewHtml(500)=${previewSnippet}`);
      console.log(`[visited-enrich-diag] legacy-fieldClasses=${fieldClassSummary}`);
      await testInfo.attach('visited-parser-template-diagnostics.json', {
        body: Buffer.from(JSON.stringify(diagnostics, null, 2), 'utf8'),
        contentType: 'application/json'
      });
    }

    const secondDescription = `Playwright parser smoke description ${Date.now()}-undo`;
    await parserInput.fill([
      '987 Playwright Ave',
      'Austin, TX',
      '(512) 555-0100',
      'Mon-Fri 10am-6pm',
      secondDescription
    ].join('\n'));
    await parseBtn.click();

    const modalUndoBtn = page.locator('#visitedLocationParserUndoBtn');
    await expect(modalUndoBtn).toBeEnabled();
    await modalUndoBtn.click();

    const descriptionInput = (await modal.locator('#visitedLocationParserDescription').count())
      ? modal.locator('#visitedLocationParserDescription')
      : modal.getByLabel('Description');
    const restoredDescription = await descriptionInput.inputValue();
    expect(restoredDescription).toContain(firstDescription);
  });
});
