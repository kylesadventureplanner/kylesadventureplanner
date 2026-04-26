# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adventure-explorer-click-stress.spec.js >> Adventure explorer click stress >> keeps explorer card controls reliable under rapid repeated clicks
- Location: tests/adventure-explorer-click-stress.spec.js:136:3

# Error details

```
Error: favorite-toggle pass rate should remain stable

expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 0.95
Received:    0.5
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]: "⚠️ Could not save favorite to OneDrive: Target column could not be resolved in source table."
  - generic "Click to expand/collapse errors" [ref=e5] [cursor=pointer]:
    - generic [ref=e6]:
      - generic [ref=e7]: ⚠️ Errors Detected
      - generic [ref=e8]: "0"
      - generic [ref=e9]: "Overlay: OK"
    - generic [ref=e10]: ▼
  - generic "Click to expand/collapse" [ref=e12] [cursor=pointer]:
    - generic [ref=e13]:
      - text: 🔧 Advanced Debug Console
      - generic [ref=e14]: "Startup timing: interactive 115 ms | overlay off 486 ms"
      - generic [ref=e15]: "Reliability: blocked 0 | overlays 0 | recoveries 0 | errors 0"
    - generic [ref=e16]:
      - button "📋 Copy All" [ref=e17]
      - button "🔗 Copy Card Bundle" [ref=e18]
      - button "🗑️ Clear" [ref=e19]
      - button "↓ Minimize" [ref=e20]
  - banner [ref=e21]:
    - generic [ref=e22]:
      - generic [ref=e23]: Kyle’s Adventure Finder
      - generic [ref=e24]: Powered by Excel, enhanced with Google data and mobile-friendly design.
    - generic [ref=e25]:
      - generic [ref=e26]:
        - button "🔄 Reload App" [ref=e27] [cursor=pointer]
        - button "📝 Edit Mode" [ref=e28] [cursor=pointer]
        - button "📴 Offline Mode" [ref=e29] [cursor=pointer]
        - button "💾 App Backup" [ref=e30] [cursor=pointer]
        - button "📱 iPhone View" [ref=e31] [cursor=pointer]
        - generic [ref=e32]:
          - generic [ref=e33]: All Changes Synced
          - button "Retry Sync" [disabled]
        - button "Sign In" [ref=e34] [cursor=pointer]
      - generic [ref=e35]: Not signed in
  - status [ref=e36]:
    - generic [ref=e37]: "🔐 Sign in required: connect your Microsoft account to load Excel data and use core app features."
    - button "Sign In Now" [ref=e38] [cursor=pointer]
  - generic [ref=e39]:
    - generic [ref=e40]:
      - button "🎮 Adventure Challenge" [ref=e41] [cursor=pointer]
      - button "🌿 Nature Challenge" [ref=e42] [cursor=pointer]
      - button "🏔️ Adventure Planner" [ref=e43] [cursor=pointer]
      - button "🧰 Household Tools" [ref=e44] [cursor=pointer]
      - button "🐦 Birding Locations" [ref=e45] [cursor=pointer]
      - button "🚴 Bike Trails" [ref=e46] [cursor=pointer]
    - tablist "Adventure Challenge categories" [ref=e50]:
      - tab "Open Outdoors section" [selected] [ref=e51] [cursor=pointer]: 🌲 Outdoors
      - tab "Open Entertainment section" [ref=e52] [cursor=pointer]: 🎬 Entertainment
      - tab "Open Food and Drink section" [ref=e53] [cursor=pointer]: 🍽️ Food & Drink
      - tab "Open Retail section" [ref=e54] [cursor=pointer]: 🛍️ Retail
      - tab "Open Wildlife and Animals section" [ref=e55] [cursor=pointer]: 🦌 Wildlife & Animals
      - tab "Open Regional Festivals section" [ref=e56] [cursor=pointer]: 🎉 Regional Festivals
      - tab "Open Bike Trails section" [ref=e57] [cursor=pointer]: 🚴 Bike Trails
    - generic [ref=e58]:
      - text: ▾
      - generic [ref=e60]:
        - heading "Adventure Challenge - Outdoors" [level=1] [ref=e62]
        - generic [ref=e63]: 🌲 Outdoors section active
        - tabpanel "Open Outdoors section" [ref=e64]:
          - text: "1"
          - generic [ref=e65]:
            - generic [ref=e66]:
              - generic [ref=e67]:
                - button "← Back to Outdoors" [ref=e68] [cursor=pointer]
                - generic [ref=e69]:
                  - generic [ref=e70]: 🌲 Explore the Outdoors
                  - generic [ref=e71]:
                    - text: Directory sourced from
                    - code [ref=e72]: Nature_Locations.xlsx
                    - text: /
                    - code [ref=e73]: Nature_Locations
                    - text: .
              - generic [ref=e74]:
                - textbox "Search outdoor locations" [ref=e75]:
                  - /placeholder: Search outdoor locations...
                - combobox "Sort outdoor locations" [ref=e76]:
                  - 'option "Sort: Name A-Z" [selected]'
                  - 'option "Sort: Name Z-A"'
                  - 'option "Sort: City A-Z"'
                  - 'option "Sort: State A-Z"'
                - combobox "Filter outdoor locations by state" [ref=e77]:
                  - 'option "State: All" [selected]'
                  - option "TX"
                - combobox "Filter outdoor locations by city" [ref=e78]:
                  - 'option "City: All" [selected]'
                  - option "Austin"
              - generic [ref=e79]: 1 of 1 outdoor locations shown.
              - generic [ref=e80]:
                - generic [ref=e81]:
                  - strong [ref=e82]: Plan a Route
                  - generic [ref=e83]: 0 selected
                  - button "Generate Route" [ref=e84] [cursor=pointer]
                  - button "Share Itinerary" [ref=e85] [cursor=pointer]
                - generic [ref=e86]: Select at least 2 locations to build an optimized driving route.
            - generic [ref=e88]:
              - generic [ref=e89]:
                - generic [ref=e90]:
                  - generic "Not visited yet" [ref=e91]: ⭕
                  - text: Mock Adventure Spot
                - generic [ref=e92]:
                  - generic [ref=e93]:
                    - checkbox "Route" [ref=e94]
                    - text: Route
                  - button "Details" [ref=e95] [cursor=pointer]
                  - button "Filters for Mock Adventure Spot" [ref=e96] [cursor=pointer]: 🔍 Filters
                  - button "Quick Actions ▾" [ref=e97] [cursor=pointer]
              - generic [ref=e98]:
                - button "☆ Add to Favorites" [ref=e99] [cursor=pointer]
                - group "My star rating" [ref=e100]:
                  - button "Set rating to 1 stars" [ref=e101] [cursor=pointer]: ★
                  - button "Set rating to 2 stars" [ref=e102] [cursor=pointer]: ★
                  - button "Set rating to 3 stars" [ref=e103] [cursor=pointer]: ★
                  - button "Set rating to 4 stars" [ref=e104] [cursor=pointer]: ★
                  - button "Set rating to 5 stars" [ref=e105] [cursor=pointer]: ★
              - generic [ref=e106]:
                - strong [ref=e107]: "Estimated Drive Time:"
                - text: 22 min
              - strong [ref=e109]: "Tags:"
              - generic [ref=e110]:
                - button "hiking" [ref=e111] [cursor=pointer]
                - button "scenic" [ref=e112] [cursor=pointer]
              - generic [ref=e113]:
                - strong [ref=e114]: "Physical Address - City - State:"
                - text: Address not specified
              - generic [ref=e115]:
                - strong [ref=e116]: "Description:"
                - generic [ref=e117]: No description yet.
        - group "🧰 Diagnostics, Sync and Clean Up" [ref=e118]:
          - generic "🧰 Diagnostics, Sync and Clean Up Sync health, local queue visibility, and visited tracker diagnostics. ▾" [ref=e119] [cursor=pointer]:
            - generic [ref=e120]:
              - generic [ref=e121]: 🧰 Diagnostics, Sync and Clean Up
              - generic [ref=e122]: Sync health, local queue visibility, and visited tracker diagnostics.
            - text: ▾
          - option "Strict (Place ID + exact name)"
          - option "Balanced (Place ID + exact + fuzzy)" [selected]
          - option "Name Only (exact + fuzzy)"
  - button "Deployment 2026.04.23.live-debug.1 OK (4/4)" [ref=e124] [cursor=pointer]
  - generic: Explore the Outdoors
```

# Test source

```ts
  63  |     if (url.includes('/columns')) {
  64  |       await route.fulfill({
  65  |         status: 200,
  66  |         contentType: 'application/json',
  67  |         body: JSON.stringify({
  68  |           value: [
  69  |             { name: 'Name' },
  70  |             { name: 'Address' },
  71  |             { name: 'Google URL' },
  72  |             { name: 'Visited' }
  73  |           ]
  74  |         })
  75  |       });
  76  |       return;
  77  |     }
  78  | 
  79  |     if (!url.includes('/range')) {
  80  |       await route.fulfill({
  81  |         status: 200,
  82  |         contentType: 'application/json',
  83  |         body: JSON.stringify({})
  84  |       });
  85  |       return;
  86  |     }
  87  | 
  88  |     await route.fulfill({
  89  |       status: 200,
  90  |       contentType: 'application/json',
  91  |       body: JSON.stringify(MOCK_EXPLORER_TABLE)
  92  |     });
  93  |   });
  94  | }
  95  | 
  96  | async function gotoAdventureChallenge(page) {
  97  |   await page.goto('/');
  98  |   await page.locator('.app-tab-btn[data-tab="visited-locations"]').click();
  99  |   await expect(page.locator('#visitedLocationsRoot')).toBeVisible();
  100 | }
  101 | 
  102 | async function openExplorerAndFindDetails(page) {
  103 |   for (const config of EXPLORER_CASES) {
  104 |     const { key, openAction, closeAction } = config;
  105 | 
  106 |     await page.locator(`#appSubTabsSlot [data-progress-subtab="${key}"]`).first().click();
  107 |     const paneRoot = page.locator(`#visitedProgressPane-${key}`);
  108 |     await expect(paneRoot).toBeVisible();
  109 | 
  110 |     const openBtn = paneRoot.locator(`[data-visited-subtab-action="${openAction}"]`).first();
  111 |     await expect(openBtn).toBeVisible();
  112 |     await openBtn.click();
  113 | 
  114 |     const explorerView = paneRoot.locator('[data-visited-subtab-view="explorer"]').first();
  115 |     await expect(explorerView).toBeVisible();
  116 | 
  117 |     const list = page.locator(`#visitedExplorerList-${key}`);
  118 |     await expect(list).toBeVisible();
  119 |     await expect(list).not.toContainText('Loading explorer cards...', { timeout: 20000 });
  120 | 
  121 |     const detailsBtn = list.locator('[data-visited-explorer-details]').first();
  122 |     if ((await detailsBtn.count()) > 0) {
  123 |       return { key, closeAction };
  124 |     }
  125 | 
  126 |     const closeBtn = paneRoot.locator(`[data-visited-subtab-action="${closeAction}"]`).first();
  127 |     await expect(closeBtn).toBeVisible();
  128 |     await closeBtn.click();
  129 |     await expect(paneRoot.locator('[data-visited-subtab-view="overview"]').first()).toBeVisible();
  130 |   }
  131 | 
  132 |   throw new Error('No explorer details button was found in any Adventure subtab.');
  133 | }
  134 | 
  135 | test.describe('Adventure explorer click stress', () => {
  136 |   test('keeps explorer card controls reliable under rapid repeated clicks', async ({ page }, testInfo) => {
  137 |     await mockExplorerWorkbookRequests(page);
  138 |     await gotoAdventureChallenge(page);
  139 | 
  140 |     const { key } = await openExplorerAndFindDetails(page);
  141 |     const paneRoot = page.locator(`#visitedProgressPane-${key}`);
  142 |     const getFirstCard = () => page.locator(`#visitedExplorerList-${key} .visited-explorer-card`).first();
  143 | 
  144 |     const metrics = [];
  145 |     const runLoop = async ({ name, attempts, minPassRate, waitMs, runAttempt }) => {
  146 |       const metric = { name, attempts, pass: 0, fail: 0, firstFailureAt: -1 };
  147 |       for (let i = 0; i < attempts; i += 1) {
  148 |         let ok = true;
  149 |         try {
  150 |           await runAttempt(i);
  151 |         } catch (_error) {
  152 |           ok = false;
  153 |         }
  154 |         if (ok) metric.pass += 1;
  155 |         else {
  156 |           metric.fail += 1;
  157 |           if (metric.firstFailureAt < 0) metric.firstFailureAt = i;
  158 |         }
  159 |         if (waitMs > 0) await page.waitForTimeout(waitMs);
  160 |       }
  161 |       metric.passRate = attempts > 0 ? Number((metric.pass / attempts).toFixed(4)) : 1;
  162 |       metrics.push(metric);
> 163 |       expect(metric.passRate, `${name} pass rate should remain stable`).toBeGreaterThanOrEqual(minPassRate);
      |                                                                         ^ Error: favorite-toggle pass rate should remain stable
  164 |     };
  165 | 
  166 |     await runLoop({
  167 |       name: 'quick-actions-toggle',
  168 |       attempts: 24,
  169 |       minPassRate: 0.95,
  170 |       waitMs: 150,
  171 |       runAttempt: async (i) => {
  172 |         const card = getFirstCard();
  173 |         const toggle = card.locator('[data-visited-explorer-quick-actions-toggle]').first();
  174 |         const menu = card.locator('[data-visited-explorer-quick-actions-menu]').first();
  175 |         await toggle.click();
  176 |         const expectedExpanded = i % 2 === 0 ? 'true' : 'false';
  177 |         await expect(toggle).toHaveAttribute('aria-expanded', expectedExpanded);
  178 |         if (expectedExpanded === 'true') await expect(menu).toBeVisible();
  179 |         else await expect(menu).toBeHidden();
  180 |       }
  181 |     });
  182 | 
  183 |     const liveQuickMenu = getFirstCard().locator('[data-visited-explorer-quick-actions-menu]').first();
  184 |     if (await liveQuickMenu.isVisible()) {
  185 |       await getFirstCard().locator('[data-visited-explorer-quick-actions-toggle]').first().click();
  186 |       await expect(liveQuickMenu).toBeHidden();
  187 |     }
  188 | 
  189 |     await runLoop({
  190 |       name: 'favorite-toggle',
  191 |       attempts: 14,
  192 |       minPassRate: 0.95,
  193 |       waitMs: 180,
  194 |       runAttempt: async (i) => {
  195 |         await getFirstCard().locator('[data-visited-explorer-favorite]').first().click();
  196 |         const expectedText = i % 2 === 0 ? 'Favorited' : 'Add to Favorites';
  197 |         await expect(getFirstCard().locator('[data-visited-explorer-favorite]').first()).toContainText(expectedText);
  198 |       }
  199 |     });
  200 | 
  201 |     const ratings = [1, 3, 5, 2, 4, 5, 1, 2, 3, 4, 5, 3, 1, 4, 2, 5];
  202 |     await runLoop({
  203 |       name: 'star-rating',
  204 |       attempts: ratings.length,
  205 |       minPassRate: 0.95,
  206 |       waitMs: 120,
  207 |       runAttempt: async (i) => {
  208 |         const value = ratings[i];
  209 |         await getFirstCard()
  210 |           .locator(`[data-visited-explorer-rate][data-visited-explorer-rating-value="${value}"]`)
  211 |           .first()
  212 |           .click();
  213 |         await expect(getFirstCard().locator('.visited-explorer-star.is-active')).toHaveCount(value);
  214 |       }
  215 |     });
  216 | 
  217 |     await runLoop({
  218 |       name: 'details-open-back',
  219 |       attempts: 8,
  220 |       minPassRate: 0.95,
  221 |       waitMs: 200,
  222 |       runAttempt: async () => {
  223 |         await getFirstCard().locator('[data-visited-explorer-details]').first().click();
  224 |         const detailsView = paneRoot.locator('[data-visited-subtab-view="explorer-details"]').first();
  225 |         await expect(detailsView).toBeVisible();
  226 |         const backBtn = paneRoot.locator(`[data-visited-subtab-action="close-explorer-details-${key}"]`).first();
  227 |         await backBtn.click();
  228 |         await expect(paneRoot.locator('[data-visited-subtab-view="explorer"]').first()).toBeVisible();
  229 |       }
  230 |     });
  231 | 
  232 |     await testInfo.attach('adventure-explorer-click-stress-metrics.json', {
  233 |       body: Buffer.from(JSON.stringify(metrics, null, 2), 'utf8'),
  234 |       contentType: 'application/json'
  235 |     });
  236 |   });
  237 | });
  238 | 
  239 | 
```