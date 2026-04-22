const { test, expect } = require('@playwright/test');

const AUTOSAVE_DRAFT_KEY = 'kaf.autosave.draft.v1';
const AUTOSAVE_DIRTY_KEY = 'kaf.autosave.dirty.v1';

async function seedAutosaveAndReload(page, draftValue, dirtyValue) {
  await page.addInitScript(({ draftKey, dirtyKey, draft, dirty }) => {
    window.localStorage.removeItem(draftKey);
    window.localStorage.removeItem(dirtyKey);
    if (draft !== null) {
      window.localStorage.setItem(draftKey, JSON.stringify(draft));
    }
    if (dirty !== null) {
      window.localStorage.setItem(dirtyKey, String(dirty));
    }
  }, {
    draftKey: AUTOSAVE_DRAFT_KEY,
    dirtyKey: AUTOSAVE_DIRTY_KEY,
    draft: draftValue,
    dirty: dirtyValue
  });
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
}

async function readBannerHiddenState(page) {
  return page.evaluate(() => {
    const banner = document.getElementById('sessionRecoveryBanner');
    return banner ? Boolean(banner.hidden) : null;
  });
}

test.describe('Session recovery banner regression', () => {
  test('shows the banner only when draft is meaningful and dirty=1', async ({ page }) => {
    const meaningfulDraft = {
      updatedAt: new Date().toISOString(),
      activeTab: 'adventure-planner',
      fields: {
        searchName: 'Blue Ridge',
        filterDifficulty: '',
        filterState: '',
        filterCity: '',
        filterTags: '',
        filterCost: '',
        groupBy: '',
        groupBySecondary: ''
      }
    };

    await seedAutosaveAndReload(page, meaningfulDraft, '1');

    await expect.poll(() => readBannerHiddenState(page)).toBe(false);
    await expect(page.locator('#sessionRecoveryRestoreBtn')).toBeVisible();
    await expect(page.locator('#sessionRecoveryDismissBtn')).toBeVisible();
  });

  test('does not show banner for empty/whitespace-only draft and auto-clears stale autosave state', async ({ page }) => {
    const emptyDraft = {
      updatedAt: new Date().toISOString(),
      activeTab: 'adventure-planner',
      fields: {
        searchName: '',
        filterDifficulty: '',
        filterState: '',
        filterCity: '',
        filterTags: '',
        filterCost: '',
        groupBy: '',
        groupBySecondary: ''
      }
    };

    await seedAutosaveAndReload(page, emptyDraft, '1');

    await expect.poll(() => readBannerHiddenState(page)).toBe(true);

    await expect.poll(() => page.evaluate(({ draftKey, dirtyKey }) => ({
      draft: localStorage.getItem(draftKey),
      dirty: localStorage.getItem(dirtyKey)
    }), {
      draftKey: AUTOSAVE_DRAFT_KEY,
      dirtyKey: AUTOSAVE_DIRTY_KEY
    })).toEqual({ draft: null, dirty: '0' });
  });

  test('keeps banner hidden when dirty flag is not set even if draft has data', async ({ page }) => {
    const meaningfulDraft = {
      updatedAt: new Date().toISOString(),
      activeTab: 'adventure-planner',
      fields: {
        searchName: 'Waterfall Trail',
        filterDifficulty: '',
        filterState: '',
        filterCity: '',
        filterTags: '',
        filterCost: '',
        groupBy: '',
        groupBySecondary: ''
      }
    };

    await seedAutosaveAndReload(page, meaningfulDraft, '0');

    await expect.poll(() => readBannerHiddenState(page)).toBe(true);
  });
});

