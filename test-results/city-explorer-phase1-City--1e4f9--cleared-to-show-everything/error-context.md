# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: city-explorer-phase1.spec.js >> City Explorer Phase 1 and 2 enhancements >> Adventure prefilter is visible and can be cleared to show everything
- Location: tests/city-explorer-phase1.spec.js:164:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('#cityPrefilterNotice')
Expected substring: "Filtered from Adventure subtab: Outdoors"
Received string:    ""
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('#cityPrefilterNotice')
    9 × locator resolved to <div aria-live="polite" id="cityPrefilterNotice" class="city-prefilter-notice"></div>
      - unexpected value ""

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - heading "🌆 City Explorer" [level=1] [ref=e5]
        - generic [ref=e6]: Explore adventures grouped by city
      - button "✕" [ref=e7] [cursor=pointer]
    - generic [ref=e8]:
      - generic [ref=e9]: Search cities
      - textbox "Search cities" [ref=e10]:
        - /placeholder: Search cities...
      - button "Sort A-Z" [ref=e11] [cursor=pointer]
      - button "Sort by Count" [ref=e12] [cursor=pointer]
      - button "🚗 Sort by Drive Time" [ref=e13] [cursor=pointer]
      - button "📍 Show My Drive Times" [ref=e14] [cursor=pointer]
      - generic [ref=e15]:
        - generic [ref=e16]: "Active curated feeds:"
        - generic "Nature_Locations.xlsx / Nature_Locations" [ref=e17]: Nature Locations
        - generic "Entertainment_Locations.xlsx / General_Entertainment" [ref=e18]: General Entertainment
        - generic "Retail_Food_and_Drink.xlsx / Restaurants" [ref=e19]: Restaurants
    - generic [ref=e21] [cursor=pointer]:
      - generic [ref=e22]: Testville
      - generic [ref=e23]: NC
      - generic [ref=e25]:
        - generic [ref=e26]: 📍 Locations
        - generic [ref=e27]: "4"
      - button "View Locations" [ref=e28]
  - status
```

# Test source

```ts
  66  |     description: 'Quiet tea garden with high atmosphere and a memorable layout.',
  67  |     googleUrl: 'https://maps.google.com/?q=Hidden+Tea+Garden',
  68  |     latitude: 35.121,
  69  |     longitude: -82.447
  70  |   },
  71  |   {
  72  |     city: 'Testville',
  73  |     state: 'NC',
  74  |     name: 'Skyline Overlook',
  75  |     sourceLabel: 'Nature_Locations.xlsx / Nature_Locations',
  76  |     website: 'https://example.com/skyline-overlook',
  77  |     tags: 'scenic, viewpoint, sunset',
  78  |     driveTime: '25m',
  79  |     hours: 'Open daily',
  80  |     duration: '45 minutes',
  81  |     difficulty: 'moderate',
  82  |     trailLength: '0.8 miles',
  83  |     address: '99 Ridge Rd, Testville, NC',
  84  |     phone: '555-0004',
  85  |     rating: '4.8',
  86  |     cost: 'free',
  87  |     description: 'Popular overlook with sunset views and short access trail.',
  88  |     googleUrl: 'https://maps.google.com/?q=Skyline+Overlook',
  89  |     latitude: 35.14,
  90  |     longitude: -82.47
  91  |   }
  92  | ];
  93  | 
  94  | async function seedCityViewer(page) {
  95  |   await page.addInitScript(({ key, payload }) => {
  96  |     try {
  97  |       window.localStorage.clear();
  98  |       window.sessionStorage.setItem(key, JSON.stringify(payload));
  99  |       window.sessionStorage.setItem('city_viewer_data_latest', key);
  100 |     } catch (_error) {
  101 |       // Ignore storage write errors in test bootstrap.
  102 |     }
  103 |   }, {
  104 |     key: CITY_VIEWER_TEST_KEY,
  105 |     payload: {
  106 |       adventuresData: TEST_LOCATIONS,
  107 |       configuredSources: [
  108 |         'Nature_Locations.xlsx / Nature_Locations',
  109 |         'Entertainment_Locations.xlsx / General_Entertainment',
  110 |         'Retail_Food_and_Drink.xlsx / Restaurants'
  111 |       ],
  112 |       dataMode: 'curated-only'
  113 |     }
  114 |   });
  115 | }
  116 | 
  117 | async function openTestCity(page) {
  118 |   await page.goto(CITY_VIEWER_PATH, { waitUntil: 'domcontentloaded' });
  119 |   await expect(page.locator('.city-card')).toHaveCount(1);
  120 |   await page.locator('.city-card').first().click();
  121 |   await expect(page.locator('#locationsPage')).toBeVisible();
  122 |   await expect(page.locator('#locationsPageTitle')).toContainText('Testville');
  123 | }
  124 | 
  125 | test.describe('City Explorer Phase 1 and 2 enhancements', () => {
  126 |   async function readLastExportedRouteJson(page) {
  127 |     return page.evaluate(() => String(window.__lastExportedRouteJson || ''));
  128 |   }
  129 | 
  130 |   async function readCopiedText(page) {
  131 |     return page.evaluate(() => String(window.__copiedText || ''));
  132 |   }
  133 | 
  134 |   test.beforeEach(async ({ page }) => {
  135 |     await seedCityViewer(page);
  136 |   });
  137 | 
  138 |   test('location filter controls are not sticky', async ({ page }) => {
  139 |     await openTestCity(page);
  140 | 
  141 |     const computedPosition = await page.locator('.locations-controls').evaluate((node) => window.getComputedStyle(node).position);
  142 |     expect(computedPosition).not.toBe('sticky');
  143 |   });
  144 | 
  145 |   test('active filter chips appear and individual chip removal updates filters', async ({ page }) => {
  146 |     await openTestCity(page);
  147 | 
  148 |     await page.locator('#locSearchName').fill('falls');
  149 |     await page.locator('#locFilterDifficulty').selectOption('moderate');
  150 | 
  151 |     const chips = page.locator('#locActiveFilters');
  152 |     await expect(chips).toBeVisible();
  153 |     await expect(chips).toContainText('Name: falls');
  154 |     await expect(chips).toContainText('Difficulty: moderate');
  155 | 
  156 |     const difficultyChip = page.locator('#locActiveFilters .loc-active-filter-chip').filter({ hasText: 'Difficulty: moderate' });
  157 |     await difficultyChip.locator('button').click();
  158 | 
  159 |     await expect(page.locator('#locFilterDifficulty')).toHaveValue('');
  160 |     await expect(chips).not.toContainText('Difficulty: moderate');
  161 |     await expect(chips).toContainText('Name: falls');
  162 |   });
  163 | 
  164 |   test('Adventure prefilter is visible and can be cleared to show everything', async ({ page }) => {
  165 |     await page.goto(CITY_VIEWER_PREFILTER_PATH, { waitUntil: 'domcontentloaded' });
> 166 |     await expect(page.locator('#cityPrefilterNotice')).toContainText('Filtered from Adventure subtab: Outdoors');
      |                                                        ^ Error: expect(locator).toContainText(expected) failed
  167 | 
  168 |     await page.locator('.city-card').first().click();
  169 |     await expect(page.locator('#locationsPage')).toBeVisible();
  170 |     await expect(page.locator('#locActiveFilters')).toContainText('Adventure subtab: Outdoors');
  171 |     await expect(page.locator('#locResultsCount')).toContainText('2 locations');
  172 | 
  173 |     await page.locator('#locActiveFilters .loc-active-filter-chip.is-prefilter button').evaluate((node) => node.click());
  174 |     await expect(page.locator('#locActiveFilters .loc-active-filter-chip.is-prefilter')).toHaveCount(0);
  175 |     await expect(page.locator('#locResultsCount')).toContainText('4 locations');
  176 | 
  177 |     await page.getByRole('button', { name: '← Back to Cities' }).click();
  178 |     await expect(page.locator('#cityPrefilterNotice')).toBeHidden();
  179 |   });
  180 | 
  181 |   test('empty state reset action restores results after a no-match filter', async ({ page }) => {
  182 |     await openTestCity(page);
  183 | 
  184 |     await page.locator('#locSearchName').fill('zzzz-no-match');
  185 | 
  186 |     const emptyState = page.locator('.loc-empty');
  187 |     await expect(emptyState).toBeVisible();
  188 |     await expect(emptyState).toContainText('No locations match your current filters');
  189 | 
  190 |     await emptyState.getByRole('button', { name: 'Reset Filters' }).click();
  191 | 
  192 |     await expect(page.locator('#locSearchName')).toHaveValue('');
  193 |     await expect(page.locator('.loc-card')).toHaveCount(4);
  194 |     await expect(page.locator('#locResultsCount')).toContainText('4 locations');
  195 |   });
  196 | 
  197 |   test('smart presets and shortlist compare tray power the planning workflow', async ({ page }) => {
  198 |     await openTestCity(page);
  199 | 
  200 |     await page.locator('#locPresetBestValueBtn').click();
  201 |     await expect(page.locator('#locSortBy')).toHaveValue('bestValue');
  202 |     await expect(page.locator('#locPresetBestValueBtn')).toHaveClass(/is-active/);
  203 | 
  204 |     await page.locator('#locPresetClosestNowBtn').click();
  205 |     await expect(page.locator('#locFilterOpenNow')).toBeChecked();
  206 |     await expect(page.locator('#locSortBy')).toHaveValue('driveTime');
  207 |     await expect(page.locator('#locPresetClosestNowBtn')).toHaveClass(/is-active/);
  208 | 
  209 |     await page.locator('.loc-select-btn').nth(0).evaluate((node) => node.click());
  210 |     await page.locator('.loc-select-btn').nth(1).evaluate((node) => node.click());
  211 | 
  212 |     const compareTray = page.locator('#locCompareTray');
  213 |     await expect(compareTray).toBeVisible();
  214 |     await expect(compareTray).toContainText('Compare selected stops');
  215 |     await expect(compareTray.locator('[data-compare-loc-id]')).toHaveCount(2);
  216 |     await expect(compareTray).toContainText('Value score');
  217 |   });
  218 | 
  219 |   test('ranking badges and confidence indicators render on cards and detail view', async ({ page }) => {
  220 |     await openTestCity(page);
  221 | 
  222 |     await expect(page.locator('.loc-card [data-confidence-indicator]')).toHaveCount(4);
  223 |     await expect(page.locator('.loc-card').filter({ hasText: 'River Falls' }).locator('[data-rank-badge="best-value"]').first()).toContainText('Best value #1');
  224 |     await expect(page.locator('.loc-card').filter({ hasText: 'Hidden Tea Garden' }).locator('[data-rank-badge="most-unique"]').first()).toContainText('Unique pick #1');
  225 |     await expect(page.locator('.loc-card').filter({ hasText: 'Downtown Art House' }).locator('[data-rank-badge="quick-stop"]').first()).toContainText('Quick stop #1');
  226 |     await expect(page.locator('.loc-card').filter({ hasText: 'River Falls' }).locator('[data-confidence-indicator="high"]').first()).toContainText('High confidence');
  227 | 
  228 |     await page.locator('.loc-card').filter({ hasText: 'River Falls' }).first().click();
  229 |     await expect(page.locator('#locationDetailPage')).toBeVisible();
  230 |     await expect(page.locator('#locationDetailContent [data-rank-badge="best-value"]').first()).toContainText('Best value #1');
  231 |     await expect(page.locator('#locationDetailContent [data-confidence-indicator="high"]').first()).toContainText('High confidence');
  232 |   });
  233 | 
  234 |   test('day plan shows itinerary score and route-feasibility confidence', async ({ page }) => {
  235 |     await openTestCity(page);
  236 | 
  237 |     await page.locator('.loc-select-btn').nth(0).evaluate((node) => node.click());
  238 |     await page.locator('.loc-select-btn').nth(1).evaluate((node) => node.click());
  239 |     await page.locator('.loc-select-btn').nth(2).evaluate((node) => node.click());
  240 | 
  241 |     await page.getByRole('button', { name: 'Build Day Plan' }).click();
  242 | 
  243 |     await expect(page.locator('#locDayPlan')).toBeVisible();
  244 |     await expect(page.locator('#locDayPlanSummary [data-itinerary-score]')).toContainText(/Itinerary score \d+\/100/);
  245 |     await expect(page.locator('#locDayPlanSummary [data-route-confidence]')).toContainText('Route confidence: Comfortable');
  246 |     await expect(page.locator('#locRouteQuality [data-route-feasibility-status]')).toContainText('Comfortable');
  247 |     await expect(page.locator('#locRouteTradeoffPanel [data-route-tradeoff]')).toContainText(/min travel for [+-]\d+\.\d rating/i);
  248 |     await expect(page.locator('#locRouteTradeoffPanel [data-budget-alt-route]')).toContainText(/Budget-friendly alternate/i);
  249 |     await expect(page.locator('#locRouteTradeoffPanel [data-route-variant]')).toHaveCount(3);
  250 |     await expect(page.locator('#locRouteTradeoffPanel [data-optimizer-weights]')).toContainText('Weights: rating 4 · cost 3 · travel 4');
  251 | 
  252 |     await page.locator('#locWeightRating').selectOption('5');
  253 |     await page.locator('#locWeightCost').selectOption('5');
  254 |     await page.locator('#locWeightTravel').selectOption('2');
  255 |     await page.getByRole('button', { name: 'Apply weights' }).click();
  256 |     await expect(page.locator('#locRouteTradeoffPanel [data-optimizer-weights]')).toContainText('Weights: rating 5 · cost 5 · travel 2');
  257 | 
  258 |     await page.locator('#locRouteTradeoffPanel [data-route-variant="budget-friendly"] .loc-route-variant-btn').click();
  259 |     await expect(page.locator('#locRouteTradeoffPanel [data-route-variant="budget-friendly"]')).toHaveClass(/active/);
  260 | 
  261 |     await page.locator('#locExportVariantBtn').click();
  262 |     await expect.poll(async () => {
  263 |       const exported = await readLastExportedRouteJson(page);
  264 |       return exported.length;
  265 |     }, { timeout: 10000 }).toBeGreaterThan(0);
  266 |     await expect.poll(async () => {
```