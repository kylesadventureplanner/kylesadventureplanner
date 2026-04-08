const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

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

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await waitForInteractive(page);
});

test('first-click success: nature explore', async ({ page }) => {
  await page.locator('.app-tab-btn[data-tab="nature-challenge"]').click();

  const explore = page.locator('#birdsExploreBtn');
  await expect(explore).toBeVisible();
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

test('first-click success: bike refresh', async ({ page }) => {
  await page.locator('.app-tab-btn[data-tab="bike-trails"]').click();
  const refresh = page.locator('#bikeRefreshBtn');
  await expect(refresh).toBeVisible();
  await refresh.click();

  const ok = await page.evaluate(() => {
    if (!window.ButtonActionGuard || typeof window.ButtonActionGuard.getScopeState !== 'function') return false;
    const state = window.ButtonActionGuard.getScopeState('bike-trails');
    return Number(state && state.trackedActionCount) > 0;
  });
  recordCheck('first-click:bike-refresh', ok, {
    scopeState: await page.evaluate(() => (window.ButtonActionGuard && window.ButtonActionGuard.getScopeState)
      ? window.ButtonActionGuard.getScopeState('bike-trails')
      : null)
  });
  expect(ok).toBeTruthy();
});

test('hidden overlay probe catches interception', async ({ page }) => {
  await page.locator('.app-tab-btn[data-tab="nature-challenge"]').click();
  await expect(page.locator('#birdsExploreBtn')).toBeVisible();

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

  const outDir = path.resolve(process.cwd(), 'artifacts');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'reliability-smoke-summary.json'), JSON.stringify(summary, null, 2));
});

