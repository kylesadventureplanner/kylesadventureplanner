/*
 * Minimal browser regression harness for tab ownership and deep-link flows.
 * Run manually via: window.runTabRegressionHarness()
 * Auto-run via URL: ?runTabHarness=1
 */
(function() {
  const BADGE_ID = 'tabHarnessBadge';
  const BADGE_STYLE_ID = 'tabHarnessBadgeStyles';
  const BADGE_TEXT_ID = 'tabHarnessBadgeText';
  const BADGE_CLOSE_ID = 'tabHarnessBadgeClose';
  let badgeDismissed = false;

  function ensureBadgeStyles() {
    if (document.getElementById(BADGE_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = BADGE_STYLE_ID;
    style.textContent = [
      '#tabHarnessBadge {',
      '  position: fixed;',
      '  right: 12px;',
      '  bottom: 12px;',
      '  z-index: 99999;',
      '  display: none;',
      '  align-items: center;',
      '  gap: 8px;',
      '  padding: 8px 10px;',
      '  border-radius: 8px;',
      '  border: 1px solid #cbd5e1;',
      '  background: #f8fafc;',
      '  color: #0f172a;',
      '  font: 600 12px/1.35 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;',
      '  box-shadow: 0 6px 18px rgba(2, 6, 23, 0.18);',
      '}',
      '#tabHarnessBadge.visible { display: inline-flex; }',
      '#tabHarnessBadge.running { border-color: #93c5fd; background: #eff6ff; color: #1d4ed8; }',
      '#tabHarnessBadge.pass { border-color: #86efac; background: #f0fdf4; color: #166534; }',
      '#tabHarnessBadge.fail { border-color: #fca5a5; background: #fef2f2; color: #b91c1c; }',
      '#tabHarnessBadgeClose {',
      '  border: 0;',
      '  background: transparent;',
      '  color: currentColor;',
      '  font: inherit;',
      '  font-weight: 800;',
      '  line-height: 1;',
      '  width: 18px;',
      '  height: 18px;',
      '  border-radius: 4px;',
      '  cursor: pointer;',
      '  opacity: 0.8;',
      '}',
      '#tabHarnessBadgeClose:hover { opacity: 1; background: rgba(15, 23, 42, 0.08); }',
      '#tabHarnessBadge.running #tabHarnessBadgeClose { display: none; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  function getOrCreateBadge() {
    if (!document.body) return null;
    ensureBadgeStyles();
    let badge = document.getElementById(BADGE_ID);
    if (badge) return badge;

    badge = document.createElement('div');
    badge.id = BADGE_ID;
    badge.setAttribute('role', 'status');
    badge.setAttribute('aria-live', 'polite');
    badge.innerHTML = `<span id="${BADGE_TEXT_ID}">Tab Harness: idle</span><button id="${BADGE_CLOSE_ID}" type="button" aria-label="Dismiss tab harness badge" title="Dismiss">x</button>`;

    const closeBtn = badge.querySelector(`#${BADGE_CLOSE_ID}`);
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        badgeDismissed = true;
        badge.classList.remove('visible');
      });
    }

    document.body.appendChild(badge);
    return badge;
  }

  function setBadge(state, message) {
    const badge = getOrCreateBadge();
    if (!badge) return;
    const textEl = badge.querySelector(`#${BADGE_TEXT_ID}`);

    // A new run should always re-show the badge even if previously dismissed.
    if (state === 'running') {
      badgeDismissed = false;
    }
    if (badgeDismissed && state !== 'running') return;

    badge.classList.add('visible');
    badge.classList.remove('running', 'pass', 'fail');
    if (state) badge.classList.add(state);
    if (textEl) {
      textEl.textContent = message || 'Tab Harness';
    }
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function waitFor(predicate, timeoutMs, label) {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      if (predicate()) return true;
      await sleep(25);
    }
    throw new Error(label || 'Timed out waiting for condition');
  }

  function getActiveButton() {
    return document.querySelector('.app-tab-btn.active');
  }

  function getActivePane() {
    return document.querySelector('.app-tab-pane.active');
  }

  function getActiveTabId() {
    const btn = getActiveButton();
    return btn ? String(btn.getAttribute('data-tab') || '') : '';
  }

  function ensureSingleActiveState() {
    const activeButtons = document.querySelectorAll('.app-tab-btn.active').length;
    const activePanes = document.querySelectorAll('.app-tab-pane.active').length;
    if (activeButtons !== 1 || activePanes !== 1) {
      throw new Error(`Expected one active tab button/pane, got buttons=${activeButtons}, panes=${activePanes}`);
    }
  }

  function availableTabIds(loader) {
    if (!loader || !loader.tabs) return [];
    return Object.keys(loader.tabs).filter((tabId) => document.querySelector(`.app-tab-btn[data-tab="${tabId}"]`));
  }

  async function switchAndWait(loader, tabId, source) {
    loader.switchTab(tabId, { syncUrl: true, historyMode: 'push', source: source || 'harness' });
    await waitFor(() => getActiveTabId() === tabId, 3000, `Tab did not become active: ${tabId}`);
    await sleep(30);
    ensureSingleActiveState();
  }

  async function runTabRegressionHarness(options) {
    const opts = options || {};
    setBadge('running', 'Tab Harness: running checks...');

    const loader = window.tabLoader;
    if (!loader || typeof loader.switchTab !== 'function') {
      setBadge('fail', 'Tab Harness: failed (tab loader unavailable)');
      throw new Error('Tab loader not ready: window.tabLoader is unavailable');
    }

    const tabs = availableTabIds(loader);
    if (tabs.length < 3) {
      setBadge('fail', 'Tab Harness: failed (need at least 3 tabs)');
      throw new Error('Need at least 3 tabs to run regression harness');
    }

    const startUrl = window.location.href;
    const startTab = getActiveTabId() || tabs[0];
    const results = [];
    const totalCases = 6;

    async function runCase(name, fn) {
      const started = performance.now();
      try {
        await fn();
        results.push({ name, status: 'PASS', ms: (performance.now() - started).toFixed(1) });
      } catch (error) {
        const message = error && error.message ? error.message : String(error);
        results.push({ name, status: 'FAIL', ms: (performance.now() - started).toFixed(1), error: message });
      }

      const passedSoFar = results.filter((item) => item.status === 'PASS').length;
      const failedSoFar = results.length - passedSoFar;
      setBadge('running', `Tab Harness: running ${results.length}/${totalCases} (pass ${passedSoFar}, fail ${failedSoFar})`);
    }

    await runCase('Single active state baseline', async () => {
      ensureSingleActiveState();
    });

    await runCase('Rapid tab switching stability', async () => {
      const sequence = tabs.slice(0, Math.min(4, tabs.length));
      for (let round = 0; round < 2; round += 1) {
        for (let i = 0; i < sequence.length; i += 1) {
          await switchAndWait(loader, sequence[i], 'harness-rapid');
        }
      }
      const finalTab = sequence[sequence.length - 1];
      const currentUrl = new URL(window.location.href);
      if (currentUrl.searchParams.get('tab') !== finalTab) {
        throw new Error(`Expected URL tab=${finalTab} after rapid switching`);
      }
    });

    await runCase('Deep-link restore via query/popstate', async () => {
      const target = tabs[1];
      const url = new URL(window.location.href);
      url.searchParams.set('tab', target);
      window.history.pushState(window.history.state, '', url.toString());
      window.dispatchEvent(new PopStateEvent('popstate'));
      await waitFor(() => getActiveTabId() === target, 3000, `Popstate did not restore tab ${target}`);
      ensureSingleActiveState();
    });

    await runCase('Deep-link restore via hash/hashchange', async () => {
      const target = tabs[2];
      const current = window.location.href;
      const withHash = `${current.split('#')[0]}#tab=${target}`;
      window.history.pushState(window.history.state, '', withHash);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      await waitFor(() => getActiveTabId() === target, 3000, `Hash restore did not activate tab ${target}`);
      ensureSingleActiveState();
    });

    await runCase('Back/forward tab history restore', async () => {
      const first = tabs[0];
      const second = tabs[1];
      await switchAndWait(loader, first, 'harness-history');
      await switchAndWait(loader, second, 'harness-history');

      window.history.back();
      await waitFor(() => getActiveTabId() === first, 3000, 'Back navigation did not restore previous tab');
      ensureSingleActiveState();

      window.history.forward();
      await waitFor(() => getActiveTabId() === second, 3000, 'Forward navigation did not restore next tab');
      ensureSingleActiveState();
    });

    await runCase('Tab initialization executes once per tab', async () => {
      if (!(loader.initializedTabs instanceof Set)) {
        throw new Error('loader.initializedTabs set is unavailable');
      }
      for (let i = 0; i < Math.min(3, tabs.length); i += 1) {
        await switchAndWait(loader, tabs[i], 'harness-init-once');
      }
      for (let i = 0; i < Math.min(3, tabs.length); i += 1) {
        if (!loader.initializedTabs.has(tabs[i])) {
          throw new Error(`Expected initialized tab to contain ${tabs[i]}`);
        }
      }
    });

    // Restore to starting state for manual follow-up checks.
    loader.switchTab(startTab, { syncUrl: false, source: 'harness-restore' });
    window.history.replaceState(window.history.state, '', startUrl);

    const failed = results.filter((item) => item.status === 'FAIL');
    console.group('Tab Regression Harness Results');
    console.table(results);
    console.groupEnd();

    const summary = {
      total: results.length,
      passed: results.length - failed.length,
      failed: failed.length,
      results
    };

    if (!opts.silent) {
      const statusLabel = failed.length ? 'FAILED' : 'PASSED';
      console.log(`[TabHarness] ${statusLabel}: ${summary.passed}/${summary.total} checks passed`);
    }

    if (summary.failed > 0) {
      setBadge('fail', `Tab Harness: FAIL (${summary.failed}/${summary.total} failed)`);
    } else {
      setBadge('pass', `Tab Harness: PASS (${summary.passed}/${summary.total})`);
    }

    return summary;
  }

  window.runTabRegressionHarness = runTabRegressionHarness;

  document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search || '');
    if (params.get('runTabHarness') !== '1') return;

    const start = async () => {
      try {
        await waitFor(() => !!window.tabLoader, 5000, 'Tab loader did not initialize in time');
        await runTabRegressionHarness();
      } catch (error) {
        console.error('[TabHarness] Failed to execute:', error);
      }
    };

    start();
  });
})();

