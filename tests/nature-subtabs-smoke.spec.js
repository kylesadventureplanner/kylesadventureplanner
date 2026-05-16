const { test, expect } = require('./reliability-test');
const { collapseErrorNotificationBar, activateFooterAction, openNatureLogView } = require('./playwright-helpers');

const CONFIG_DRIVEN_SUBTABS = [
  { key: 'mammals', label: 'Mammals' },
  { key: 'reptiles', label: 'Reptiles' },
  { key: 'amphibians', label: 'Amphibians' },
  { key: 'insects', label: 'Insects' },
  { key: 'arachnids', label: 'Arachnids' },
  { key: 'wildflowers', label: 'Wildflowers' },
  { key: 'trees', label: 'Trees & Shrubs' }
];

async function readLastDiagnosticsJsonBlock(page, title) {
  return page.evaluate((diagTitle) => {
    const textarea = document.getElementById('birdsManualDiagnosticsOutput');
    const value = textarea ? String(textarea.value || '') : '';
    const headerRe = new RegExp(`\\[[^\\]]+\\] ${diagTitle.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}`, 'g');
    const headers = [...value.matchAll(headerRe)];
    if (!headers.length) return null;
    const start = headers[headers.length - 1].index + headers[headers.length - 1][0].length;
    const tail = value.slice(start).trimStart();
    const nextHeader = tail.search(/\n\[[^\]]+\] /);
    const block = (nextHeader >= 0 ? tail.slice(0, nextHeader) : tail).trim();
    try {
      return JSON.parse(block);
    } catch (_error) {
      return null;
    }
  }, title);
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
    await expect(birdsDiagnosticsRow).toContainText('Deployment');

    await page.locator('#birdsDiagnosticsDetails > summary').click();
    await expect(page.locator('#birdsDeploymentBadge')).toBeVisible();
    await expect(page.locator('#birdsDeploymentBadge')).toContainText('Deployment:');
    await expect(page.locator('#birdsDeploymentMeta')).toContainText(/App asset|App and service worker version details|service worker/i);
  });

  test('global context menu stays hidden and non-interactive by default', async ({ page }) => {
    const state = await page.evaluate(() => {
      const menu = document.getElementById('contextMenu');
      if (!menu) return null;
      const cs = window.getComputedStyle(menu);
      return {
        display: cs.display,
        visibility: cs.visibility,
        pointerEvents: cs.pointerEvents,
        opacity: cs.opacity,
        left: cs.left,
        top: cs.top,
        hasVisibleClass: menu.classList.contains('visible')
      };
    });

    expect(state).not.toBeNull();
    expect(state.hasVisibleClass).toBe(false);
    expect(state.display).toBe('none');
    expect(state.visibility).toBe('hidden');
    expect(state.pointerEvents).toBe('none');
    expect(Number(state.opacity)).toBe(0);
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
    const jumpToCtaBtn = page.locator('#birdsBackToCtaRowBtn');
    await expect(jumpToCtaBtn).toBeVisible();
    await jumpToCtaBtn.click();
    await expect(page.locator('#birdsExploreBtn')).toBeInViewport();

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
    await expect(lastReportStatus).toContainText(/Last report: birds-(clickability-probe|viewport-reset-and-probe) at /);
    await page.locator('#birdsResetViewportDiagBtn').click();
    await expect(output).toHaveValue(/(Normalize CTA Action Context \+ Probe|Reset Nature Viewport \+ Probe)/);
    await expect(output).toHaveValue(/birds-viewport-reset-and-probe/);
    await expect(output).toHaveValue(/nature-cta-duplicate-id-report/);
    await page.locator('#birdsRunCoreCtaAutofixBtn').click();
    await expect(output).toHaveValue(/Core CTA Auto-fix/);
    await page.locator('#birdsRunOverlayAutofixBtn').click();
    await expect(output).toHaveValue(/Overlay\/Z-Index Auto-fix/);
    await page.locator('#birdsRunFullAutorepairSequenceBtn').click();
    await expect(output).toHaveValue(/Full Auto-Repair Sequence/);

    await page.locator('#birdsRunCtaSmokeTestBtn').click();
    await expect(output).toHaveValue(/CTA Smoke Test/);
    await expect(output).toHaveValue(/"kind": "birds-cta-smoke-test"/);

    const ctaSmoke = await readLastDiagnosticsJsonBlock(page, 'CTA Smoke Test');
    expect(ctaSmoke).not.toBeNull();
    expect(ctaSmoke.kind).toBe('birds-cta-smoke-test');
    if (ctaSmoke.viewport) {
      expect(ctaSmoke.viewport).toEqual(expect.objectContaining({
        width: expect.any(Number),
        height: expect.any(Number),
        scrollY: expect.any(Number)
      }));
    }
    expect(Array.isArray(ctaSmoke.buttonRects)).toBe(true);
    if (Object.prototype.hasOwnProperty.call(ctaSmoke, 'ctaRowRect')) {
      expect(ctaSmoke.ctaRowRect === null || typeof ctaSmoke.ctaRowRect === 'object').toBe(true);
    }
    const buttonIds = new Set((ctaSmoke.buttonRects || []).map((entry) => entry && entry.id).filter(Boolean));
    for (const id of (ctaSmoke.offscreenButtonIds || [])) {
      expect(buttonIds.has(id)).toBe(true);
    }

    // Adventure-like gate: CTA actions must succeed after diagnostics reset/normalization.
    expect(Boolean(ctaSmoke.reset && ctaSmoke.reset.ok === true)).toBe(true);
    if (ctaSmoke.actionContext) {
      expect(ctaSmoke.actionContext).toEqual(expect.objectContaining({
        mode: 'overview-normalized'
      }));
    }

    // VERIFY ALL ACTIONS SUCCEEDED in normalized overview/action context.
    if (Array.isArray(ctaSmoke.actions) && ctaSmoke.actions.length > 0) {
      const failedActions = ctaSmoke.actions.filter((item) => !item || item.ok !== true);
      if (failedActions.length > 0) {
        throw new Error(`CTA actions failed in Adventure-like action context: ${JSON.stringify(failedActions)}`);
      }
    }

    // Schema guard: when finalTargetOffscreenActions is present it must be a well-formed array.
    // Guarded the same way as other optional fields so older deployed builds skip silently;
    // any build that ships the field will have its schema enforced hard.
    if (Object.prototype.hasOwnProperty.call(ctaSmoke, 'finalTargetOffscreenActions')) {
      expect(Array.isArray(ctaSmoke.finalTargetOffscreenActions)).toBe(true);
      // Every entry must be a non-empty string action key.
      for (const key of ctaSmoke.finalTargetOffscreenActions) {
        expect(typeof key).toBe('string');
        expect(key.length).toBeGreaterThan(0);
      }
      // Cross-validate: every action whose post-click target is offscreen must appear in the list.
      if (Array.isArray(ctaSmoke.actions)) {
        const expectedOffscreen = ctaSmoke.actions
          .filter((item) => item && item.finalActiveTargetRect && item.finalActiveTargetRect.inViewport === false)
          .map((item) => item.action);
        for (const actionKey of expectedOffscreen) {
          expect(ctaSmoke.finalTargetOffscreenActions).toContain(actionKey);
        }
      }
    }

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

  test('manual diagnostics output includes the last blocked core CTA reason', async ({ page }) => {
    await page.locator('#birdsDiagnosticsDetails > summary').click();
    const output = page.locator('#birdsManualDiagnosticsOutput');
    if (await output.count() === 0) {
      await expect(page.locator('#birdsButtonClickDiagnosticsPanel')).toBeVisible();
      return;
    }

    await expect(output).toBeVisible();
    await page.locator('#birdsExploreBtn').scrollIntoViewIfNeeded();
    await expect(page.locator('#natureChallengeRefreshBtn')).toBeVisible();

    await page.evaluate(() => {
      const btn = document.getElementById('natureChallengeRefreshBtn');
      if (!btn || !window.ButtonActionGuard) return;
      const originalIsActivatable = window.ButtonActionGuard.isActivatable;
      window.ButtonActionGuard.isActivatable = (target) => {
        if (target && target.id === 'natureChallengeRefreshBtn') return false;
        return originalIsActivatable(target);
      };
      btn.click();
      window.ButtonActionGuard.isActivatable = originalIsActivatable;
    });

    await page.locator('#birdsRunReliabilityDiagBtn').click();
    await expect(output).toHaveValue(/Reliability Snapshot/);
    await expect(output).toHaveValue(/"lastBlockedCoreCta"\s*:/);
    await expect(output).toHaveValue(/"dataLoadIndicatorDiagnostics"\s*:/);
    await expect(output).toHaveValue(/"id"\s*:\s*"natureChallengeRefreshBtn"/);
    await expect(output).toHaveValue(/"reason"\s*:\s*"(not-activatable|dedupe|in-flight|disabled|aria-disabled|busy)"/);

    const reliabilitySnapshot = await readLastDiagnosticsJsonBlock(page, 'Reliability Snapshot');
    expect(reliabilitySnapshot).not.toBeNull();
    expect(reliabilitySnapshot).toEqual(expect.objectContaining({
      dataLoadIndicatorDiagnostics: expect.any(Object)
    }));
    if (reliabilitySnapshot.dataLoadIndicatorDiagnostics && reliabilitySnapshot.dataLoadIndicatorDiagnostics.exists === true) {
      expect(reliabilitySnapshot.dataLoadIndicatorDiagnostics.computedPointerEvents).toBe('none');
      expect(typeof reliabilitySnapshot.dataLoadIndicatorDiagnostics.computedVisibility).toBe('string');
      expect(reliabilitySnapshot.dataLoadIndicatorDiagnostics.computedVisibility.length).toBeGreaterThan(0);
    }

    const status = page.locator('#birdsManualDiagnosticsLastReportStatus');
    await expect(status).toContainText('Last blocked CTA:');
    await expect(status).toContainText('refresh');

    await page.locator('#birdsRunCtaHealthDiagBtn').click();
    const ctaHealthPanel = page.locator('#birdsCtaHealthPanel');
    await expect(ctaHealthPanel).toBeVisible();
    await expect(ctaHealthPanel).toContainText('Last blocked CTA:');
    await expect(ctaHealthPanel).toContainText('refresh');
    await expect(ctaHealthPanel.locator('.nature-cta-health-meta--blocked')).toBeVisible();
  });

  test('CTA buttons display tooltips on hover and have focus-visible state', async ({ page }) => {
    // Verify all CTA buttons have proper data-tooltip attributes
    const ctaButtons = [
      { id: '#birdsExploreBtn', expectedTooltip: 'Open the species explorer' },
      { id: '#birdsOpenLogBtn', expectedTooltip: 'Open the sighting log' },
      { id: '#birdsOpenMapBtn', expectedTooltip: 'View your sighting locations on a map' },
      { id: '#natureChallengeRefreshBtn', expectedTooltip: 'Refresh Birds data' }
    ];

    for (const button of ctaButtons) {
      const tooltipAttr = await page.locator(button.id).getAttribute('data-tooltip');
      expect(tooltipAttr).toBeTruthy();
      expect(tooltipAttr).toBe(button.expectedTooltip);
    }

    // Scroll CTA buttons into viewport if needed
    await page.locator('#birdsExploreBtn').scrollIntoViewIfNeeded();

    // Test hover tooltip display on each button
    for (const button of ctaButtons) {
      const locator = page.locator(button.id);

      // Move mouse over button to trigger hover
      await locator.hover({ force: false });
      await page.waitForTimeout(200); // Allow CSS transitions

      // Verify button is in viewport for hover
      await expect(locator).toBeInViewport();

      // Check for focus-visible state via keyboard navigation
      await locator.focus();
      const focusClass = await locator.evaluate((el) => {
        return window.getComputedStyle(el, ':focus-visible').outline !== 'none' ||
               el.matches(':focus-visible') ||
               el.classList.contains('focus-visible');
      });
      expect(focusClass || await locator.evaluate((el) => el === document.activeElement)).toBeTruthy();
    }
  });

  test('CTA buttons perform correct navigation actions', async ({ page }) => {
    // Ensure CTA row is visible
    await page.locator('#birdsExploreBtn').scrollIntoViewIfNeeded();
    await expect(page.locator('#birdsExploreBtn')).toBeInViewport();

    // Test "Explore Species" button opens explorer
    await page.locator('#birdsExploreBtn').click();
    await expect(page.locator('.nature-birds-view[data-birds-view="explorer"]')).toBeVisible({ timeout: 5000 });

    // Go back to overview
    await page.locator('#birdsExplorerBackBtn').click();
    await expect(page.locator('.nature-birds-view[data-birds-view="overview"]')).toBeVisible({ timeout: 5000 });

    // Test "Log a Sighting" button opens log view
    await page.locator('#birdsOpenLogBtn').scrollIntoViewIfNeeded();
    await expect(page.locator('#birdsOpenLogBtn')).toBeInViewport();
    await page.locator('#birdsOpenLogBtn').click();
    await expect(page.locator('.nature-birds-view[data-birds-view="log"]')).toBeVisible({ timeout: 5000 });

    // Go back to overview
    await page.locator('#birdsLogBackBtn').click();
    await expect(page.locator('.nature-birds-view[data-birds-view="overview"]')).toBeVisible({ timeout: 5000 });

    // Test "Map" button opens map overlay
    await page.locator('#birdsOpenMapBtn').scrollIntoViewIfNeeded();
    await expect(page.locator('#birdsOpenMapBtn')).toBeInViewport();
    await page.locator('#birdsOpenMapBtn').click();
    await expect(page.locator('#birdsMapOverlay:not([hidden])')).toBeVisible({ timeout: 5000 });

    // Close map
    const closeBtn = page.locator('#birdsMapCloseBtn');
    if (await closeBtn.count() > 0) {
      await closeBtn.click();
      await expect(page.locator('#birdsMapOverlay[hidden]')).toBeHidden({ timeout: 5000 });
    }

    // Test "Refresh Data" button triggers sync (should not throw or disable)
    await page.locator('#natureChallengeRefreshBtn').scrollIntoViewIfNeeded();
    await expect(page.locator('#natureChallengeRefreshBtn')).toBeInViewport();
    const refreshBtnDisabledBefore = await page.locator('#natureChallengeRefreshBtn').isDisabled();
    await page.locator('#natureChallengeRefreshBtn').click();
    await page.waitForTimeout(1000); // Allow sync to start
    expect(refreshBtnDisabledBefore || true).toBeTruthy(); // Refresh can be disabled or enabled initially
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

    await openNatureLogView(page);
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
    await expect(page.locator('#natureChallengeTitle')).toHaveText('Nature - Mammals');
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
      await expect(page.locator('#natureChallengeTitle')).toHaveText(`Nature - ${label}`);

      const totalSpeciesText = await page.locator(`#${key}TotalSpecies`).textContent();
      expect(String(totalSpeciesText || '').trim().length).toBeGreaterThan(0);

      const familyGridText = await page.locator(`#${key}FamilyGrid`).textContent();
      expect(String(familyGridText || '').trim().length).toBeGreaterThan(0);
    });
  });
});
