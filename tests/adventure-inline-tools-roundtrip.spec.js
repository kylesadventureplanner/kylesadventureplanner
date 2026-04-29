const { test, expect } = require('@playwright/test');

const CITY_INLINE_TEST_KEY = 'city_inline_payload';
const CITY_INLINE_TEST_DATA = [
  {
    city: 'Inlineville',
    state: 'SC',
    name: 'Inline Waterfall',
    sourceLabel: 'Nature_Locations.xlsx / Nature_Locations',
    tags: 'waterfall, hiking, scenic'
  },
  {
    city: 'Inlineville',
    state: 'SC',
    name: 'Inline Art House',
    sourceLabel: 'Entertainment_Locations.xlsx / General_Entertainment',
    tags: 'art, indoor'
  }
];

test.describe('Adventure inline tools roundtrip', () => {
  async function readFrameRenderMetrics(frameLocator) {
    return frameLocator.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return {
        width: Math.max(Number(rect.width || 0), Number(node.clientWidth || 0), Number(node.offsetWidth || 0)),
        height: Math.max(Number(rect.height || 0), Number(node.clientHeight || 0), Number(node.offsetHeight || 0))
      };
    });
  }

  async function readInlineClosePayload(page) {
    return page.evaluate(() => {
      const payload = window.__inlineToolClosePayload || {};
      return {
        type: String(payload.type || ''),
        tool: String(payload.tool || ''),
        sourceSubtab: String(payload.sourceSubtab || '')
      };
    });
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('.app-tab-btn[data-tab="visited-locations"]').click();
    await expect(page.locator('#visitedLocationsRoot')).toBeVisible();
    await page.locator('#appSubTabsSlot [data-progress-subtab="outdoors"]').first().click();
    await expect(page.locator('#visitedProgressPane-outdoors')).toBeVisible();
  });

  test('City Explorer inline opens and back returns to overview', async ({ page }) => {
    await page.evaluate(() => {
      window.__inlineToolClosePayload = null;
      window.addEventListener('message', (event) => {
        const data = event && event.data ? event.data : {};
        if (data.type !== 'planner-inline-tool-close') return;
        window.__inlineToolClosePayload = {
          type: String(data.type || ''),
          tool: String(data.tool || ''),
          sourceSubtab: String(data.sourceSubtab || '')
        };
      }, { capture: true });
    });

    await page.evaluate(({ key, payload }) => {
      window.sessionStorage.setItem(key, JSON.stringify({
        adventuresData: payload,
        configuredSources: ['Nature_Locations.xlsx / Nature_Locations'],
        dataMode: 'curated-only'
      }));
      window.sessionStorage.setItem('city_viewer_data_latest', key);

      window.prepareCityViewerInlineUrl = async function(opts = {}) {
        const inlineUrl = new URL('HTML Files/city-viewer-window.html', window.location.href);
        inlineUrl.searchParams.set('embedded', '1');
        inlineUrl.searchParams.set('dataMode', 'curated-only');
        inlineUrl.searchParams.set('dataKey', key);
        if (opts.prefilterTag) inlineUrl.searchParams.set('prefilterTag', String(opts.prefilterTag));
        if (opts.prefilterLabel) inlineUrl.searchParams.set('prefilterLabel', String(opts.prefilterLabel));
        inlineUrl.searchParams.set('sourceSubtab', String(opts.sourceSubtab || 'outdoors'));
        inlineUrl.searchParams.set('ts', String(Date.now()));
        return inlineUrl.toString();
      };
    }, { key: CITY_INLINE_TEST_KEY, payload: CITY_INLINE_TEST_DATA });

    const openCityBtn = page.locator('#visitedProgressPane-outdoors [data-visited-subtab-action="open-city-explorer-outdoors"]').first();
    await expect(openCityBtn).toBeVisible();
    await openCityBtn.click();

    const cityView = page.locator('#visitedProgressPane-outdoors [data-visited-subtab-view="city-explorer"]').first();
    const overviewView = page.locator('#visitedProgressPane-outdoors [data-visited-subtab-view="overview"]').first();
    const cityFrame = page.locator('#visitedCityExplorerFrame-outdoors').first();

    await expect(cityView).toBeVisible();
    await expect(overviewView).toBeHidden();
    await expect(page.locator('#visitedLocationsRoot .visited-jump-links')).toHaveAttribute('hidden', '');
    await expect(page.locator('#visitedLocationsRoot .visited-jump-links')).toHaveAttribute('aria-hidden', 'true');
    await expect(cityFrame).toBeVisible();
    await expect(cityFrame).toHaveAttribute('src', /city-viewer-window\.html/i);
    const cityMetrics = await readFrameRenderMetrics(cityFrame);
    expect(cityMetrics.width).toBeGreaterThan(250);
    expect(cityMetrics.height).toBeGreaterThan(120);

    const cityFrameHandle = await cityFrame.elementHandle();
    const cityInlineFrame = cityFrameHandle ? await cityFrameHandle.contentFrame() : null;
    expect(cityInlineFrame).not.toBeNull();
    await expect(cityInlineFrame.locator('body.embedded-viewer')).toBeVisible();
    await expect(cityInlineFrame.locator('.header')).toBeHidden();
    const firstCityCard = cityInlineFrame.locator('.city-card').first();
    const firstCityExploreBtn = firstCityCard.getByRole('button', { name: /Explore/i }).first();
    if (await firstCityExploreBtn.count()) {
      await firstCityExploreBtn.click();
    } else {
      await firstCityCard.evaluate((node) => node.click());
    }
    await expect(cityInlineFrame.locator('#locationsPage')).toBeVisible();
    const prefilterChip = cityInlineFrame.locator('#locActiveFilters .loc-active-filter-chip.is-prefilter');
    const prefilterCount = await prefilterChip.count();
    if (prefilterCount > 0) {
      await expect(cityInlineFrame.locator('#locActiveFilters')).toContainText('Adventure subtab: Outdoors');
      await expect(cityInlineFrame.locator('#locResultsCount')).toContainText('1 location');
      await prefilterChip.locator('button').first().evaluate((node) => node.click());
      await expect(cityInlineFrame.locator('#locActiveFilters .loc-active-filter-chip.is-prefilter')).toHaveCount(0);
      await expect(cityInlineFrame.locator('#locResultsCount')).toContainText('2 locations');
    } else {
      await expect(cityInlineFrame.locator('#locResultsCount')).toContainText(/location/i);
    }

    await cityInlineFrame.getByRole('button', { name: '← Back to Cities' }).click();
    await expect(cityInlineFrame.locator('#cityGrid')).toBeVisible();
    await expect(cityInlineFrame.locator('#cityPrefilterNotice')).toBeHidden();
    await cityInlineFrame.evaluate(() => {
      window.parent.postMessage({
        type: 'planner-inline-tool-close',
        tool: 'city-viewer',
        sourceSubtab: 'outdoors'
      }, window.parent.location.origin);
    });

    await expect.poll(async () => {
      const payload = await readInlineClosePayload(page);
      return payload.type;
    }, { timeout: 10000 }).toBe('planner-inline-tool-close');
    await expect.poll(async () => {
      const payload = await readInlineClosePayload(page);
      return { tool: payload.tool, sourceSubtab: payload.sourceSubtab };
    }, { timeout: 10000 }).toEqual({
      tool: 'city-viewer',
      sourceSubtab: 'outdoors'
    });

    await expect(page.locator('#visitedProgressPane-outdoors [data-visited-subtab-view="overview"]').first()).toBeVisible();
    await expect(page.locator('#visitedProgressPane-outdoors [data-visited-subtab-view="city-explorer"]').first()).toBeHidden();
    await expect(page.locator('#visitedLocationsRoot .visited-jump-links')).not.toHaveAttribute('hidden', '');
    await expect(page.locator('#visitedLocationsRoot .visited-jump-links')).toHaveAttribute('aria-hidden', 'false');
  });

  test('Edit Mode inline opens and back returns to overview', async ({ page }) => {
    await page.evaluate(() => {
      window.__inlineToolClosePayload = null;
      window.addEventListener('message', (event) => {
        const data = event && event.data ? event.data : {};
        if (data.type !== 'planner-inline-tool-close') return;
        window.__inlineToolClosePayload = {
          type: String(data.type || ''),
          tool: String(data.tool || ''),
          sourceSubtab: String(data.sourceSubtab || '')
        };
      }, { capture: true });
    });

    const openEditBtn = page.locator('#visitedProgressPane-outdoors [data-visited-subtab-action="open-edit-mode-outdoors"]').first();
    await expect(openEditBtn).toBeVisible();
    await openEditBtn.click();

    const editView = page.locator('#visitedProgressPane-outdoors [data-visited-subtab-view="edit-mode"]').first();
    const overviewView = page.locator('#visitedProgressPane-outdoors [data-visited-subtab-view="overview"]').first();
    const editFrame = page.locator('#visitedEditModeFrame-outdoors').first();

    await expect(editView).toBeVisible();
    await expect(overviewView).toBeHidden();
    await expect(editFrame).toBeVisible();
    await expect(editFrame).toHaveAttribute('src', /edit-mode-enhanced\.html|edit-mode-enhanced\.html\?/i);
    const editMetrics = await readFrameRenderMetrics(editFrame);
    expect(editMetrics.width).toBeGreaterThan(250);
    expect(editMetrics.height).toBeGreaterThan(120);

    const editFrameHandle = await editFrame.elementHandle();
    const editInlineFrame = editFrameHandle ? await editFrameHandle.contentFrame() : null;
    expect(editInlineFrame).not.toBeNull();
    await expect(editInlineFrame.locator('body.embedded-edit-mode')).toBeVisible();
    await expect(editInlineFrame.locator('.header')).toBeHidden();
    await editInlineFrame.evaluate(() => {
      window.parent.postMessage({
        type: 'planner-inline-tool-close',
        tool: 'edit-mode',
        sourceSubtab: 'outdoors'
      }, window.parent.location.origin);
    });

    await expect.poll(async () => {
      const payload = await readInlineClosePayload(page);
      return payload.type;
    }, { timeout: 10000 }).toBe('planner-inline-tool-close');
    await expect.poll(async () => {
      const payload = await readInlineClosePayload(page);
      return { tool: payload.tool, sourceSubtab: payload.sourceSubtab };
    }, { timeout: 10000 }).toEqual({
      tool: 'edit-mode',
      sourceSubtab: 'outdoors'
    });

    await expect(page.locator('#visitedProgressPane-outdoors [data-visited-subtab-view="overview"]').first()).toBeVisible();
    await expect(page.locator('#visitedProgressPane-outdoors [data-visited-subtab-view="edit-mode"]').first()).toBeHidden();
  });
});

