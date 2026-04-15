const { test, expect } = require('./reliability-test');

const CONFIG_DRIVEN_SUBTABS = [
  { key: 'mammals', label: 'Mammals' },
  { key: 'reptiles', label: 'Reptiles' },
  { key: 'amphibians', label: 'Amphibians' },
  { key: 'insects', label: 'Insects' },
  { key: 'arachnids', label: 'Arachnids' },
  { key: 'wildflowers', label: 'Wildflowers' },
  { key: 'trees', label: 'Trees & Shrubs' }
];

async function collapseErrorNotificationBar(page) {
  await page.evaluate(() => {
    const errorBar = document.getElementById('errorNotificationBar');
    if (!errorBar || errorBar.classList.contains('collapsed')) return;
    if (typeof window.toggleErrorBar === 'function') {
      window.toggleErrorBar();
      return;
    }
    errorBar.classList.add('collapsed');
    errorBar.style.maxHeight = '44px';
  });
}

async function activateFooterAction(page, locator) {
  await locator.scrollIntoViewIfNeeded();
  await collapseErrorNotificationBar(page);
  try {
    await locator.click({ timeout: 5000 });
  } catch (_error) {
    await collapseErrorNotificationBar(page);
    await locator.evaluate((node) => node.click());
  }
}

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
    await expect(birdsDiagnosticsRow).toContainText('Sightings/User State');
  });

  test('manual diagnostics console runs probe and writes output', async ({ page }) => {
    await page.locator('#birdsDiagnosticsDetails > summary').click();
    const output = page.locator('#birdsManualDiagnosticsOutput');
    if (await output.count() === 0) {
      // Deployed environments may still be on an older Nature diagnostics layout.
      await expect(page.locator('#birdsButtonClickDiagnosticsPanel')).toBeVisible();
      return;
    }
    await expect(output).toBeVisible();
    const exportBtn = page.locator('#birdsExportManualDiagnosticsJsonBtn');
    const copyLastBtn = page.locator('#birdsCopyLastManualDiagnosticsJsonBtn');
    const lastReportStatus = page.locator('#birdsManualDiagnosticsLastReportStatus');
    await expect(exportBtn).toBeDisabled();
    await expect(copyLastBtn).toBeDisabled();
    await expect(lastReportStatus).toContainText('Last report: none yet.');
    await page.locator('#birdsRunClickabilityDiagBtn').click();
    await expect(output).toHaveValue(/Clickability Probe/);
    await expect(exportBtn).toBeEnabled();
    await expect(copyLastBtn).toBeEnabled();
    await expect(lastReportStatus).toContainText('Last report: birds-clickability-probe at ');
    await page.locator('#birdsRunCoreCtaAutofixBtn').click();
    await expect(output).toHaveValue(/Core CTA Auto-fix/);
    await page.locator('#birdsRunOverlayAutofixBtn').click();
    await expect(output).toHaveValue(/Overlay\/Z-Index Auto-fix/);
    await page.locator('#birdsRunFullAutorepairSequenceBtn').click();
    await expect(output).toHaveValue(/Full Auto-Repair Sequence/);

    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
    await activateFooterAction(page, exportBtn);
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^birds-manual-diagnostics-last-.*\.json$/);

    await activateFooterAction(page, copyLastBtn);
    await activateFooterAction(page, page.locator('#birdsClearManualDiagnosticsBtn'));
    await expect(output).toHaveValue('');
    await expect(exportBtn).toBeDisabled();
    await expect(copyLastBtn).toBeDisabled();
    await expect(lastReportStatus).toContainText('Last report: none yet.');
  });

  test('birds jump bar renders with expected section buttons', async ({ page }) => {
    const jumpBar = page.locator('#natureChallengeRoot [data-birds-jump-links]');
    if (await jumpBar.count()) {
      await expect(jumpBar).toBeVisible();
      await expect(jumpBar.locator('[data-birds-overview-jump="categories"]')).toHaveCount(1);
      await expect(jumpBar.locator('[data-birds-overview-jump="challenges-badges"]')).toHaveCount(1);
      await expect(jumpBar.locator('[data-birds-overview-jump="quests"]')).toHaveCount(1);
      await expect(jumpBar.locator('[data-birds-overview-jump="bingo"]')).toHaveCount(1);
      await expect(jumpBar.locator('[data-birds-overview-jump="diagnostics"]')).toHaveCount(1);
      return;
    }

    await expect(jumpBar).toHaveCount(0);
    const commandBar = page.locator('#birdsOverviewCommandInput').locator('xpath=ancestor::div[contains(@class, "nature-overview-command-row")]');
    const challengesBtn = commandBar.locator('[data-birds-overview-jump="challenges-badges"]');
    const questsBtn = commandBar.locator('[data-birds-overview-jump="quests"]');
    const bingoBtn = commandBar.locator('[data-birds-overview-jump="bingo"]');

    await expect(challengesBtn).toHaveCount(1);
    await expect(questsBtn).toHaveCount(1);
    await expect(bingoBtn).toHaveCount(1);

    await challengesBtn.click();
    await expect(page.locator('#birdsOverviewSectionChallengesBadges')).toBeInViewport();

    await questsBtn.click();
    await expect(page.locator('#birdsOverviewSectionQuests')).toBeInViewport();

    await bingoBtn.click();
    await expect(page.locator('#birdsOverviewSectionBingo')).toBeInViewport();
  });

  test('birds jump bar hides outside overview and returns on overview', async ({ page }) => {
    const jumpBar = page.locator('#natureChallengeRoot [data-birds-jump-links]');
    const hasJumpBar = (await jumpBar.count()) > 0;
    if (hasJumpBar) {
      await expect(jumpBar).toHaveAttribute('aria-hidden', 'false');
    } else {
      await expect(jumpBar).toHaveCount(0);
    }

    await page.locator('#birdsOpenLogBtn').click();
    await expect(page.locator('.nature-birds-view[data-birds-view="log"]')).toBeVisible();
    if (hasJumpBar) {
      await expect(jumpBar).toHaveAttribute('hidden', '');
      await expect(jumpBar).toHaveAttribute('aria-hidden', 'true');
    }

    await page.locator('#birdsLogBackBtn').click();
    await expect(page.locator('.nature-birds-view[data-birds-view="overview"]')).toBeVisible();
    if (hasJumpBar) {
      await expect(jumpBar).not.toHaveAttribute('hidden', '');
      await expect(jumpBar).toHaveAttribute('aria-hidden', 'false');
    }

    await page.locator('#birdsExploreBtn').click();
    await expect(page.locator('.nature-birds-view[data-birds-view="explorer"]')).toBeVisible();
    if (hasJumpBar) {
      await expect(jumpBar).toHaveAttribute('hidden', '');
      await expect(jumpBar).toHaveAttribute('aria-hidden', 'true');
    }

    await page.locator('#birdsExplorerBackBtn').click();
    await expect(page.locator('.nature-birds-view[data-birds-view="overview"]')).toBeVisible();
    if (hasJumpBar) {
      await expect(jumpBar).not.toHaveAttribute('hidden', '');
      await expect(jumpBar).toHaveAttribute('aria-hidden', 'false');
    }
  });

  test('docked subtab text-node clicks still activate mammals', async ({ page }) => {
    await page.waitForFunction(() => {
      const dock = document.querySelector('#appSubTabsSlot .nature-challenge-subtabs');
      return Boolean(dock && dock.dataset.natureDockBound === '1');
    });

    await page.evaluate(() => {
      const button = document.querySelector('#appSubTabsSlot [data-nature-subtab="mammals"]');
      if (!button) throw new Error('Mammals subtab button not found');

      const textNode = Array.from(button.childNodes || []).find((node) => {
        return node && node.nodeType === Node.TEXT_NODE && String(node.textContent || '').trim().length > 0;
      });
      if (!textNode) throw new Error('No clickable text node found inside mammals subtab button');

      textNode.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      }));
    });

    await expect(page.locator('#appSubTabsSlot [data-nature-subtab="mammals"]')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#natureChallengeTitle')).toHaveText('Nature Challenge - Mammals');
  });


  test('mammals diagnostics row contains stable labels', async ({ page }) => {
    await page.locator('#appSubTabsSlot [data-nature-subtab="mammals"]').click();
    const mammalsDiagnosticsRow = page.locator('#mammalsDiagnosticsRow');
    await expect(mammalsDiagnosticsRow).toContainText('Auth');
    await expect(mammalsDiagnosticsRow).toContainText('Workbook');
    await expect(mammalsDiagnosticsRow).toContainText('Species');
    await expect(mammalsDiagnosticsRow).toContainText('Sightings/User State');
  });

  test('shrubs subtab is removed from the dock', async ({ page }) => {
    await expect(page.locator('#appSubTabsSlot [data-nature-subtab="shrubs"]')).toHaveCount(0);
  });

  test('nature subtabs expose loading state attributes', async ({ page }) => {
    const mammalsBtn = page.locator('#appSubTabsSlot [data-nature-subtab="mammals"]');
    await expect(mammalsBtn).toHaveAttribute('aria-busy', /(true|false)/);
  });

  CONFIG_DRIVEN_SUBTABS.forEach(({ key, label }) => {
    test(`subtab smoke: ${label}`, async ({ page }) => {
      await page.locator(`#appSubTabsSlot [data-nature-subtab="${key}"]`).click();
      await expect(page.locator(`#appSubTabsSlot [data-nature-subtab="${key}"]`)).toHaveAttribute('aria-selected', 'true');
      await expect(page.locator('#natureChallengePane-birds')).toBeVisible();
      await expect(page.locator('#natureChallengeTitle')).toHaveText(`Nature Challenge - ${label}`);

      const totalSpeciesText = await page.locator(`#${key}TotalSpecies`).textContent();
      expect(String(totalSpeciesText || '').trim().length).toBeGreaterThan(0);

      const familyGridText = await page.locator(`#${key}FamilyGrid`).textContent();
      expect(String(familyGridText || '').trim().length).toBeGreaterThan(0);
    });
  });
});
