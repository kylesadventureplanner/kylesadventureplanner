const { test, expect } = require('./reliability-test');
const {
  activateFooterAction,
  openAdventureChallenge,
  ensureAdventureSubtabSelected,
  readVisibleAdventureSubtabs,
  setAppMode,
  waitForAdventureChallengeReady,
  waitForAdventureSubtabView,
  openAdventureSubtabView,
  waitForAdventureJumpLinksState
} = require('./playwright-helpers');

const DAILY_SUBTAB_KEYS = ['all-locations', 'city-explorer', 'challenges'];
const ALL_SUBTAB_KEYS = ['all-locations', 'outdoors', 'entertainment', 'food-drink', 'retail', 'wildlife-animals', 'regional-festivals', 'bike-trails'];

const ADVENTURE_SUBTABS = [
  {
    key: 'wildlife-animals',
    label: 'Wildlife & Animals',
    refreshAction: 'refresh-subtab-wildlife-animals',
    undoAction: 'undo-subtab-wildlife-animals',
    exploreAction: 'open-explorer-wildlife-animals',
    logAction: 'open-visit-log-wildlife-animals',
    legacyFindAction: 'find-wildlife-animals'
  },
  {
    key: 'regional-festivals',
    label: 'Regional Festivals',
    refreshAction: 'refresh-subtab-regional-festivals',
    undoAction: 'undo-subtab-regional-festivals',
    exploreAction: 'open-explorer-regional-festivals',
    logAction: 'open-visit-log-regional-festivals',
    legacyFindAction: 'find-regional-festivals'
  },
  {
    key: 'retail',
    label: 'Retail',
    refreshAction: 'refresh-subtab-retail',
    undoAction: 'undo-subtab-retail',
    exploreAction: 'open-explorer-retail',
    logAction: 'open-visit-log-retail',
    legacyFindAction: 'find-retail-location'
  }
];

test.describe('Adventure Challenge daily/advanced mode regression', () => {
  test('daily mode defaults to All Locations and advanced mode restores the full subtab set', async ({ page }) => {
    await openAdventureChallenge(page, { mode: 'daily', subtabKey: 'all-locations' });

    await expect(page.locator('#appSubTabsSlot [data-progress-subtab="all-locations"]').first()).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#visitedProgressPane-all-locations')).toBeVisible();
    await waitForAdventureSubtabView(page, 'all-locations', 'explorer', { timeout: 15000 });
    await expect(page.locator('#visitedLocationsRoot [data-visited-jump="diagnostics"]')).toBeHidden();

    await expect.poll(async () => readVisibleAdventureSubtabs(page), { timeout: 15000 }).toEqual(DAILY_SUBTAB_KEYS);

    await ensureAdventureSubtabSelected(page, 'city-explorer');
    await expect(page.locator('#visitedProgressPane-all-locations [data-visited-subtab-view="city-explorer"]').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#visitedCityExplorerFrame-all-locations').first()).toBeVisible();

    await ensureAdventureSubtabSelected(page, 'challenges');
    await expect(page.locator('#visitedProgressPane-challenges')).toBeVisible();
    await expect(page.locator('#achv-root-challenges')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#achv-root-challenges [data-achv-combined-subtab]').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#visitedProgressPane-challenges .visited-subtab-action-row')).toHaveCount(0);

    await setAppMode(page, 'advanced');
    await ensureAdventureSubtabSelected(page, 'outdoors');

    await expect.poll(async () => readVisibleAdventureSubtabs(page), { timeout: 15000 }).toEqual(ALL_SUBTAB_KEYS);
    await expect(page.locator('#visitedLocationsRoot [data-visited-jump="diagnostics"]')).toBeVisible();

    await setAppMode(page, 'daily');
    await waitForAdventureChallengeReady(page, 'all-locations');
    await expect(page.locator('#appSubTabsSlot [data-progress-subtab="all-locations"]').first()).toHaveAttribute('aria-selected', 'true');
    await expect.poll(async () => readVisibleAdventureSubtabs(page), { timeout: 15000 }).toEqual(DAILY_SUBTAB_KEYS);
    await waitForAdventureSubtabView(page, 'all-locations', 'explorer', { timeout: 15000 });
  });

  test('daily mode hides advanced explorer controls and shows pagination when results span multiple pages', async ({ page }) => {
    await openAdventureChallenge(page, { mode: 'daily', subtabKey: 'all-locations' });
    await waitForAdventureSubtabView(page, 'all-locations', 'explorer', { timeout: 15000 });

    await page.evaluate(() => {
      const subtabKey = 'all-locations';
      const state = window.__visitedState;
      if (!state || !state.subtabExplorer) throw new Error('visited state unavailable');

      const syntheticItems = Array.from({ length: 55 }, (_, idx) => {
        const n = idx + 1;
        return {
          id: `daily-test-${n}`,
          title: `Daily Mode Item ${n}`,
          city: n % 2 === 0 ? 'Seattle' : 'Portland',
          state: n % 2 === 0 ? 'WA' : 'OR',
          tags: ['Test'],
          description: `Synthetic explorer row ${n}`,
          address: `${n} Example Ave`,
          driveTime: '15 min'
        };
      });

      const current = state.subtabExplorer[subtabKey] || {};
      state.subtabExplorer[subtabKey] = {
        ...current,
        view: 'explorer',
        loading: false,
        loaded: true,
        error: '',
        items: syntheticItems,
        query: '',
        sort: 'name-asc',
        stateFilter: 'all',
        cityFilter: 'all',
        tagInclude: [],
        tagExclude: [],
        stateExclude: [],
        cityExclude: [],
        page: 1
      };

      const searchEl = document.getElementById('visitedExplorerSearch-all-locations');
      if (!searchEl) throw new Error('all-locations explorer search input missing');
      searchEl.value = '';
      searchEl.dispatchEvent(new Event('input', { bubbles: true }));
    });

    const backBtn = page.locator('#visitedProgressPane-all-locations [data-visited-subtab-action="close-explorer-all-locations"]').first();
    await expect(backBtn).toHaveAttribute('data-advanced-only', 'true');
    await expect(backBtn).toBeHidden();

    const routePlanner = page.locator('#visitedExplorerRoutePlanner-all-locations').first();
    await expect(routePlanner).toHaveAttribute('data-advanced-only', 'true');
    await expect(routePlanner).toBeHidden();

    const pagination = page.locator('#visitedExplorerPagination-all-locations').first();
    await expect(pagination).toBeVisible({ timeout: 10000 });
    await expect(pagination).toContainText(/Page\s*1\s*of/i);
    const nextPageBtn = page.locator('#visitedExplorerPagination-all-locations [data-visited-explorer-page="next"]').first();
    await expect(nextPageBtn).toBeVisible();

    await activateFooterAction(page, nextPageBtn);
    await expect.poll(async () => {
      const text = await pagination.innerText().catch(() => '');
      return String(text || '').replace(/\s+/g, ' ').trim();
    }, { timeout: 10000 }).toMatch(/Page\s*2\s*of/i);
  });
});

test.describe('Adventure Challenge advanced subtabs smoke', () => {
  test.beforeEach(async ({ page }) => {
    await openAdventureChallenge(page, { mode: 'advanced', subtabKey: 'outdoors' });
  });

  test('legacy top header controls are removed from Adventure Challenge', async ({ page }) => {
    await expect(page.locator('#visitedRefreshBtn')).toHaveCount(0);
    await expect(page.locator('#visitedWeatherMode')).toHaveCount(0);
    await expect(page.locator('#visitedCtaInjectorStatus')).toHaveCount(0);
  });

  test('default Outdoors pane uses Nature-style status pills', async ({ page }) => {
    await expect(page.locator('#visitedSubtabStatus-outdoors .visited-subtab-status-health')).toBeVisible();
    await expect(page.locator('#visitedSubtabStatus-outdoors .visited-subtab-status-meta')).toBeVisible();
    await expect(page.locator('#visitedSubtabStatus-outdoors .visited-subtab-status-health')).toContainText(/Outdoors data:/i);
  });

  test('Outdoors action buttons keep variant styling (not all one color)', async ({ page }) => {
    await waitForAdventureChallengeReady(page, 'outdoors');
    const outdoorsPane = page.locator('#visitedProgressPane-outdoors').first();
    await expect(outdoorsPane).toBeVisible();
    await expect(outdoorsPane.locator('[data-visited-subtab-action="open-explorer-outdoors"]')).toBeVisible();

    const readFingerprints = async () => page.evaluate(() => {
      const actionKeys = [
        'open-explorer-outdoors',
        'open-visit-log-outdoors',
        'refresh-subtab-outdoors',
        'undo-subtab-outdoors',
        'open-city-explorer-outdoors',
        'open-edit-mode-outdoors',
        'open-batch-tags-outdoors'
      ];
      const normalize = (value) => String(value || '').replace(/\s+/g, ' ').trim();

      return actionKeys
        .map((key) => {
          const node = document.querySelector(`#visitedProgressPane-outdoors [data-visited-subtab-action="${key}"]`);
          if (!node || !(node instanceof HTMLElement)) return null;
          const styles = window.getComputedStyle(node);
          const background = normalize(styles.backgroundImage) || normalize(styles.backgroundColor);
          const border = normalize(styles.borderTopColor);
          return `${key}|${background}|${border}`;
        })
        .filter(Boolean);
    });

    await expect.poll(async () => {
      const fingerprints = await readFingerprints();
      if (!Array.isArray(fingerprints) || fingerprints.length < 7) return false;
      const styleOnly = fingerprints.map((value) => String(value).split('|').slice(1).join('|'));
      return new Set(styleOnly).size >= 3;
    }, { timeout: 15000 }).toBe(true);
  });

  test('adventure achievement sections keep sticky section-header style hook', async ({ page }) => {
    await waitForAdventureChallengeReady(page, 'outdoors');
    await expect.poll(async () => page.evaluate(() => {
      const selectorNeedle = '#visitedLocationsRoot .adventure-achv-section > .card-header';
      const hasRequiredDeclarations = (text) => {
        return text.includes('position: sticky') && text.includes('top: 82px');
      };

      return Array.from(document.styleSheets).some((sheet) => {
        let cssText = '';
        try {
          const rules = sheet && sheet.cssRules ? Array.from(sheet.cssRules) : [];
          cssText = rules.map((rule) => String(rule.cssText || '')).join('\n');
        } catch (_error) {
          const ownerNode = sheet && sheet.ownerNode ? sheet.ownerNode : null;
          cssText = ownerNode ? String(ownerNode.textContent || '') : '';
        }

        return cssText.includes(selectorNeedle) && hasRequiredDeclarations(cssText);
      });
    }), { timeout: 15000 }).toBe(true);
  });

  test('jump links hide while Outdoors explorer view is open', async ({ page }) => {
    await waitForAdventureChallengeReady(page, 'outdoors');
    const jumpLinks = await waitForAdventureJumpLinksState(page, { hidden: false, timeout: 12000 });

    const openExplorerBtn = page.locator('#visitedProgressPane-outdoors [data-visited-subtab-action="open-explorer-outdoors"]').first();
    await expect(openExplorerBtn).toBeVisible();
    await openAdventureSubtabView(page, {
      subtabKey: 'outdoors',
      action: 'open-explorer-outdoors',
      targetView: 'explorer',
      timeout: 12000
    });

    await waitForAdventureSubtabView(page, 'outdoors', 'explorer', { timeout: 12000 });
    await waitForAdventureJumpLinksState(page, { hidden: true, timeout: 12000 });

    const closeExplorerBtn = page.locator('#visitedProgressPane-outdoors [data-visited-subtab-action="close-explorer-outdoors"]').first();
    await expect(closeExplorerBtn).toBeVisible();
    await activateFooterAction(page, closeExplorerBtn);

    await waitForAdventureSubtabView(page, 'outdoors', 'overview', { timeout: 12000 });
    await waitForAdventureJumpLinksState(page, { hidden: false, timeout: 12000 });
    await expect(jumpLinks).toBeVisible();
  });

  ADVENTURE_SUBTABS.forEach(({ key, label, refreshAction, undoAction, exploreAction, logAction, legacyFindAction }) => {
    test(`subtab smoke: ${label}`, async ({ page }) => {
      const dockButton = await ensureAdventureSubtabSelected(page, key);

      await expect(dockButton).toHaveAttribute('aria-selected', 'true', { timeout: 10000 });
      await waitForAdventureChallengeReady(page, key);
      await expect(page.locator(`#appSubTabsSlot [data-progress-subtab="${key}"][aria-selected="true"]`)).toBeVisible();
      await expect(page.locator(`#visitedSubtabStatus-${key} .visited-subtab-status-health`)).toBeVisible();
      await expect(page.locator(`#visitedSubtabStatus-${key} .visited-subtab-status-meta`)).toBeVisible();
      await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${refreshAction}"]`)).toHaveCount(1);
      await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${undoAction}"]`)).toHaveCount(1);
      await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${exploreAction}"]`)).toHaveCount(1);
      await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${logAction}"]`)).toHaveCount(1);
      await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${legacyFindAction}"]`)).toHaveCount(0);


      await dockButton.focus();
      await expect(dockButton).toBeFocused();

      await dockButton.press('ArrowRight');
      // Poll until a *different* subtab is selected – the DOM update is async
      // when keyboard nav triggers a transition animation under parallel load.
      await expect.poll(async () => {
        const selected = await page
          .locator('#appSubTabsSlot [data-progress-subtab][aria-selected="true"]')
          .first()
          .getAttribute('data-progress-subtab')
          .catch(() => key);
        return selected !== key;
      }, { timeout: 8000 }).toBe(true);

      const selectedAfterRight = page.locator('#appSubTabsSlot [data-progress-subtab][aria-selected="true"]').first();
      await expect(selectedAfterRight).toBeVisible();
      await expect(selectedAfterRight).not.toHaveAttribute('data-progress-subtab', key);

      await selectedAfterRight.press('ArrowLeft');
      // Poll until we're back on the original subtab.
      await expect.poll(async () => {
        const selected = await page
          .locator(`#appSubTabsSlot [data-progress-subtab="${key}"][aria-selected="true"]`)
          .count()
          .catch(() => 0);
        return selected > 0;
      }, { timeout: 8000 }).toBe(true);
      await expect(page.locator(`#appSubTabsSlot [data-progress-subtab="${key}"][aria-selected="true"]`).first()).toBeVisible();
    });
  });
});
