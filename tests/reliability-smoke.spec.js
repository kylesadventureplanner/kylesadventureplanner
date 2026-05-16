const fs = require('fs');
const path = require('path');
const { test, expect } = require('./reliability-test');
const { activateFooterAction, openNatureOverviewView, primeAppModeStorage, setAppMode } = require('./playwright-helpers');

const summary = {
  generatedAt: new Date().toISOString(),
  pass: false,
  startupSamplesMs: [],
  startupMsP95: 0,
  firstClickChecks: 0,
  firstClickSuccesses: 0,
  firstClickSuccessRate: 0,
  checks: []
};

function getSummaryOutputPath() {
  const override = String(process.env.RELIABILITY_SMOKE_SUMMARY_PATH || '').trim();
  if (override) return path.resolve(override);
  return path.resolve(process.cwd(), 'artifacts', 'reliability-smoke-summary.json');
}

function recordCheck(name, passed, detail = {}) {
  summary.checks.push({
    name,
    passed: Boolean(passed),
    detail,
    at: new Date().toISOString()
  });
  if (name.startsWith('first-click:')) {
    summary.firstClickChecks += 1;
    if (passed) summary.firstClickSuccesses += 1;
  }
}

async function waitForInteractive(page) {
  const readiness = await page.evaluate(async () => {
    const deadline = Date.now() + 35000;
    while (Date.now() < deadline) {
      if (window.__appReadiness && typeof window.__appReadiness.getStatus === 'function') {
        const status = window.__appReadiness.getStatus() || {};
        if (status.interactiveReady) return status;
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    return window.__appReadiness && typeof window.__appReadiness.getStatus === 'function'
      ? window.__appReadiness.getStatus()
      : null;
  });

  if (readiness && Number.isFinite(Number(readiness.msToInteractiveReady))) {
    summary.startupSamplesMs.push(Number(readiness.msToInteractiveReady));
  }
  return readiness;
}

async function waitForAdventureDeepLinkRouteState(page, options = {}) {
  const subtabKey = String(options.subtabKey || '').trim();
  const viewKey = String(options.viewKey || '').trim();
  const timeoutMs = Number(options.timeoutMs) > 0 ? Number(options.timeoutMs) : 8000;
  await page.waitForFunction((payload) => {
    const safe = payload || {};
    const targetSubtab = String(safe.subtabKey || '').trim();
    const targetView = String(safe.viewKey || '').trim();
    if (!targetSubtab) return false;
    const activePrimary = document.querySelector('.app-tab-btn.active[data-tab]');
    const activePrimaryTab = activePrimary ? activePrimary.getAttribute('data-tab') : '';
    if (activePrimaryTab !== 'visited-locations') return false;

    const subtabBtn = document.getElementById(`visitedProgressTab-${targetSubtab}`);
    const subtabSelected = Boolean(subtabBtn && subtabBtn.getAttribute('aria-selected') === 'true');
    if (!subtabSelected) return false;

    const currentUrl = new URL(window.location.href);
    if ((currentUrl.searchParams.get('tab') || '') !== 'visited-locations') return false;
    if (targetSubtab && (currentUrl.searchParams.get('visitedSubtab') || '') !== targetSubtab) return false;
    if (targetView && (currentUrl.searchParams.get('visitedView') || '') !== targetView) return false;

    const visitedState = window.__visitedState || null;
    if (visitedState && visitedState.activeProgressSubTab && visitedState.activeProgressSubTab !== targetSubtab) return false;

    if (targetView) {
      const viewNode = document.querySelector(`#visitedProgressPane-${targetSubtab} [data-visited-subtab-view="${targetView}"]`);
      const viewVisible = Boolean(viewNode && viewNode.hidden === false && viewNode.getAttribute('aria-hidden') === 'false');
      if (!viewVisible) return false;

      if (visitedState && visitedState.subtabExplorer && visitedState.subtabExplorer[targetSubtab]) {
        const explorerStateView = String(visitedState.subtabExplorer[targetSubtab].view || '').trim();
        if (explorerStateView && explorerStateView !== targetView) return false;
      }
    }

    return true;
  }, { subtabKey, viewKey }, { timeout: timeoutMs });
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await waitForInteractive(page);
});

test('first-click success: nature explore', async ({ page }) => {
  const explore = await openNatureOverviewView(page);
  await explore.click();
  const explorerActive = await page.evaluate(() => {
    const node = document.querySelector('.nature-birds-view.is-active[data-birds-view="explorer"]');
    return Boolean(node);
  });
  recordCheck('first-click:nature-explore', explorerActive, { explorerActive });

  expect(explorerActive).toBeTruthy();
});

test('first-click success: nature run command', async ({ page }) => {
  await page.locator('.app-tab-btn[data-tab="nature-challenge"]').click();
  await page.fill('#birdsOverviewCommandInput', 'explore');
  await page.locator('#birdsOverviewCommandRunBtn').click();

  const runActive = await page.evaluate(() => {
    const node = document.querySelector('.nature-birds-view.is-active[data-birds-view="explorer"]');
    return Boolean(node);
  });
  recordCheck('first-click:nature-run', runActive, { runActive });
  expect(runActive).toBeTruthy();
});

test('first-click success: bike edit mode', async ({ page }) => {
  await setAppMode(page, 'advanced');
  await page.locator('.app-tab-btn[data-tab="visited-locations"]').click();
  await page.locator('#visitedProgressTab-bike-trails').click();
  const editModeBtn = page.locator('[data-visited-subtab-action="open-edit-mode-bike-trails"]').first();
  await expect(editModeBtn).toBeVisible();
  await expect(editModeBtn).toBeEnabled();

  await editModeBtn.click();

  const ok = await page.waitForFunction(() => {
    const pane = document.querySelector('#visitedProgressPane-bike-trails');
    const editModeView = pane ? pane.querySelector('[data-visited-subtab-view="edit-mode"]') : null;
    return Boolean(editModeView && editModeView.hidden === false && editModeView.getAttribute('aria-hidden') === 'false');
  }, null, { timeout: 3500 }).then(() => true).catch(() => false);

  recordCheck('first-click:bike-edit-mode', ok, {
    lastActionKey: await page.evaluate(() => String(window.__lastActionKey || '').trim()),
    editModeViewActive: await page.evaluate(() => {
      const pane = document.querySelector('#visitedProgressPane-bike-trails');
      const editModeView = pane ? pane.querySelector('[data-visited-subtab-view="edit-mode"]') : null;
      return Boolean(editModeView && editModeView.hidden === false && editModeView.getAttribute('aria-hidden') === 'false');
    }),
    activeProgressSubTab: await page.evaluate(() => (window.__visitedState ? window.__visitedState.activeProgressSubTab : null))
  });
  expect(ok).toBeTruthy();
});

test('legacy bike tab URL keeps Adventures bike tools reachable', async ({ page }) => {
  await primeAppModeStorage(page, 'advanced');
  await page.goto('/?tab=bike-trails');
  await waitForInteractive(page);
  await setAppMode(page, 'advanced');
  await activateFooterAction(page, page.locator('.app-tab-btn[data-tab="visited-locations"]'));

  const bikeDock = page.locator('#visitedProgressTab-bike-trails').first();
  await expect(bikeDock).toBeVisible({ timeout: 12000 });
  await activateFooterAction(page, bikeDock);
  await expect(bikeDock).toHaveAttribute('aria-selected', 'true', { timeout: 10000 });
  await expect(page.locator('[data-visited-subtab-action="open-edit-mode-bike-trails"]').first()).toBeVisible({ timeout: 10000 });

  const routed = await page.evaluate(() => {
    const activePrimary = document.querySelector('.app-tab-btn.active[data-tab]');
    const bikeSubtab = document.getElementById('visitedProgressTab-bike-trails');
    const currentUrl = new URL(window.location.href);
    return {
      activePrimaryTab: activePrimary ? activePrimary.getAttribute('data-tab') : '',
      bikeSubtabSelected: Boolean(bikeSubtab && bikeSubtab.getAttribute('aria-selected') === 'true'),
      tabParam: currentUrl.searchParams.get('tab') || '',
      subtabParam: currentUrl.searchParams.get('visitedSubtab') || ''
    };
  });

  const ok = routed.activePrimaryTab === 'visited-locations'
    && routed.bikeSubtabSelected
    && (routed.tabParam === 'visited-locations' || routed.tabParam === 'bike-trails')
    && (routed.subtabParam === '' || routed.subtabParam === 'bike-trails');

  recordCheck('legacy-bike-tab-url:bike-tools-reachable', ok, routed);
  expect(ok).toBeTruthy();
});

test('all-locations explorer URL opens Adventures explorer view in daily mode', async ({ page }) => {
  await page.goto('/?tab=visited-locations&visitedSubtab=all-locations&visitedView=explorer');
  await waitForInteractive(page);
  await waitForAdventureDeepLinkRouteState(page, { subtabKey: 'all-locations', viewKey: 'explorer' });

  const routed = await page.evaluate(() => {
    const activePrimary = document.querySelector('.app-tab-btn.active[data-tab]');
    const allLocationsSubtab = document.getElementById('visitedProgressTab-all-locations');
    const explorerView = document.querySelector('#visitedProgressPane-all-locations [data-visited-subtab-view="explorer"]');
    return {
      activePrimaryTab: activePrimary ? activePrimary.getAttribute('data-tab') : '',
      allLocationsSelected: Boolean(allLocationsSubtab && allLocationsSubtab.getAttribute('aria-selected') === 'true'),
      explorerViewVisible: Boolean(explorerView && explorerView.hidden === false && explorerView.getAttribute('aria-hidden') === 'false')
    };
  });

  const ok = routed.activePrimaryTab === 'visited-locations'
    && routed.allLocationsSelected
    && routed.explorerViewVisible;

  recordCheck('all-locations-explorer-url:routes-to-explorer-view', ok, routed);
  expect(ok).toBeTruthy();
});

test('hidden overlay probe catches interception', async ({ page }) => {
  await openNatureOverviewView(page);

  await page.evaluate(() => {
    const blocker = document.createElement('div');
    blocker.id = 'smokeHiddenOverlayProbe';
    blocker.style.position = 'fixed';
    blocker.style.inset = '0';
    blocker.style.opacity = '0';
    blocker.style.pointerEvents = 'auto';
    blocker.style.zIndex = '2147483640';
    blocker.style.display = 'block';
    document.body.appendChild(blocker);
  });

  const result = await page.evaluate(() => {
    if (!window.ButtonReliability || typeof window.ButtonReliability.probeClickPath !== 'function') {
      return { ok: false, reason: 'probe-missing' };
    }
    return window.ButtonReliability.probeClickPath('birdsExploreBtn');
  });

  await page.evaluate(() => {
    const node = document.getElementById('smokeHiddenOverlayProbe');
    if (node) node.remove();
  });

  const passed = Boolean(result && result.ok === false && Array.isArray(result.blockedPoints) && result.blockedPoints.length > 0);
  recordCheck('probe:hidden-overlay-detected', passed, {
    blockedPoints: result && result.blockedPoints ? result.blockedPoints.length : 0,
    reason: result && result.reason ? result.reason : ''
  });

  expect(passed).toBeTruthy();
});

test('stale row-detail blocker is cleared before nature interactions', async ({ page }) => {
  await page.evaluate(() => {
    let backdrop = document.getElementById('rowDetailModalBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'rowDetailModalBackdrop';
      backdrop.className = 'modal-backdrop';
      document.body.appendChild(backdrop);
    }

    const modal = document.getElementById('rowDetailModal');
    if (!modal) throw new Error('rowDetailModal not found');

    modal.classList.remove('visible');
    modal.style.display = 'flex';
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'auto';

    backdrop.classList.remove('visible');
    backdrop.style.display = 'block';
    backdrop.style.opacity = '0';
    backdrop.style.pointerEvents = 'auto';
    backdrop.style.zIndex = '1001';
  });

  await openNatureOverviewView(page);
  await page.locator('#birdsExploreBtn').click();

  const explorerActive = await page.evaluate(() => {
    const node = document.querySelector('.nature-birds-view.is-active[data-birds-view="explorer"]');
    const modal = document.getElementById('rowDetailModal');
    return {
      explorerActive: Boolean(node),
      modalHidden: modal ? window.getComputedStyle(modal).display === 'none' : true
    };
  });

  const passed = Boolean(explorerActive && explorerActive.explorerActive && explorerActive.modalHidden);
  recordCheck('overlay:stale-row-detail-cleared', passed, explorerActive || {});
  expect(passed).toBeTruthy();
});

test('nature explore remains responsive across repeated tab switches', async ({ page }) => {
  await setAppMode(page, 'advanced');
  let passed = true;
  const iterations = [];

  for (let i = 0; i < 5; i += 1) {
    await page.locator('.app-tab-btn[data-tab="visited-locations"]').click();
    await page.locator('#visitedProgressTab-bike-trails').click();
    await expect(page.locator('[data-visited-subtab-action="refresh-subtab-bike-trails"]').first()).toBeVisible();

    await openNatureOverviewView(page);
    // Normalize viewport targeting before click to avoid stale off-screen CTA coordinates.
    await page.locator('#birdsExploreBtn').scrollIntoViewIfNeeded();
    await page.locator('#birdsExploreBtn').click();

    const explorerActive = await page
      .waitForFunction(() => Boolean(document.querySelector('.nature-birds-view.is-active[data-birds-view="explorer"]')), { timeout: 2500 })
      .then(() => true)
      .catch(() => false);
    iterations.push({ iteration: i + 1, explorerActive });
    if (!explorerActive) {
      passed = false;
      break;
    }

    const backBtn = page.locator('#birdsExplorerBackBtn');
    if (await backBtn.count()) {
      await backBtn.click();
    } else {
      await page.locator('#birdsOverviewCommandRunBtn').click();
    }
  }

  recordCheck('repeat:nature-explore-tab-switches', passed, { iterations });
  expect(passed).toBeTruthy();
});

test('update banner exposes version diff and records telemetry counters', async ({ page }) => {
  await page.evaluate(() => {
    const banner = document.getElementById('appUpdateBanner');
    if (banner) banner.hidden = false;
  });

  await expect(page.locator('#appUpdateBannerVersionDiff')).toContainText('Version: app');
  await expect(page.locator('#appUpdateRemindBtn')).toBeVisible();

  await page.locator('#appUpdateRemindBtn').click();
  await expect(page.locator('#appUpdateBanner')).toBeHidden();

  const telemetry = await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('reliability:update-banner-event', { detail: { eventName: 'update-banner-shown' } }));
    window.dispatchEvent(new CustomEvent('reliability:update-banner-event', { detail: { eventName: 'reload-clicked' } }));
    window.dispatchEvent(new CustomEvent('reliability:update-banner-event', { detail: { eventName: 'dismiss-clicked' } }));

    return {
      reliabilityStatus: (typeof window.__reliabilityStatus === 'function') ? window.__reliabilityStatus() : null,
      buttonTelemetry: (window.ButtonReliability && typeof window.ButtonReliability.getUpdateBannerTelemetry === 'function')
        ? window.ButtonReliability.getUpdateBannerTelemetry()
        : null
    };
  });

  expect(telemetry.reliabilityStatus).not.toBeNull();
  expect(telemetry.reliabilityStatus.updateBannerTelemetry.shown).toBeGreaterThanOrEqual(1);
  expect(telemetry.reliabilityStatus.updateBannerTelemetry.reloadClicked).toBeGreaterThanOrEqual(1);
  expect(telemetry.reliabilityStatus.updateBannerTelemetry.dismissClicked).toBeGreaterThanOrEqual(1);

  expect(telemetry.buttonTelemetry).not.toBeNull();
  expect(telemetry.buttonTelemetry.updateBannerShown).toBeGreaterThanOrEqual(1);
  expect(telemetry.buttonTelemetry.updateBannerReloadClicked).toBeGreaterThanOrEqual(1);
  expect(telemetry.buttonTelemetry.updateBannerDismissClicked).toBeGreaterThanOrEqual(1);

  recordCheck('update-banner:version-and-telemetry', true, {
    reliabilityTelemetry: telemetry.reliabilityStatus && telemetry.reliabilityStatus.updateBannerTelemetry
      ? telemetry.reliabilityStatus.updateBannerTelemetry
      : null,
    buttonTelemetry: telemetry.buttonTelemetry
  });
});

test.afterAll(async () => {
  const sorted = summary.startupSamplesMs.slice().sort((a, b) => a - b);
  if (sorted.length) {
    const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95));
    summary.startupMsP95 = Number(sorted[idx]);
  }

  summary.firstClickSuccessRate = summary.firstClickChecks > 0
    ? summary.firstClickSuccesses / summary.firstClickChecks
    : 0;

  summary.pass = summary.checks.every((row) => row.passed) && summary.firstClickSuccessRate >= 0.99;

  const outputPath = getSummaryOutputPath();
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2));
});

