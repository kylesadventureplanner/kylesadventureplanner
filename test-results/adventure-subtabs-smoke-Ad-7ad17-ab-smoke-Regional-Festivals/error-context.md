# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adventure-subtabs-smoke.spec.js >> Adventure Challenge new subtabs smoke >> subtab smoke: Regional Festivals
- Location: tests/adventure-subtabs-smoke.spec.js:132:5

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: page.waitForFunction: Test timeout of 60000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic "Click to expand/collapse errors" [ref=e3] [cursor=pointer]:
    - generic [ref=e4]:
      - generic [ref=e5]: ⚠️ Errors Detected
      - generic [ref=e6]: "0"
      - generic [ref=e7]: "Overlay: OK"
    - generic [ref=e8]: ▼
  - generic "Click to expand/collapse" [ref=e10] [cursor=pointer]:
    - generic [ref=e11]:
      - text: 🔧 Advanced Debug Console
      - generic [ref=e12]: "Startup timing: interactive 87 ms | overlay off 438 ms"
      - generic [ref=e13]: "Reliability: blocked 0 | overlays 0 | recoveries 0 | errors 0"
    - generic [ref=e14]:
      - button "📋 Copy All" [ref=e15]
      - button "🔗 Copy Card Bundle" [ref=e16]
      - button "🗑️ Clear" [ref=e17]
      - button "↓ Minimize" [ref=e18]
  - generic [ref=e19]: Loading data...
  - banner [ref=e20]:
    - generic [ref=e21]:
      - generic [ref=e22]: Kyle’s Adventure Finder
      - generic [ref=e23]: Powered by Excel, enhanced with Google data and mobile-friendly design.
    - generic [ref=e24]:
      - generic [ref=e25]:
        - button "🔄 Reload App" [ref=e26] [cursor=pointer]
        - button "📝 Edit Mode" [ref=e27] [cursor=pointer]
        - button "📴 Offline Mode" [ref=e28] [cursor=pointer]
        - button "💾 App Backup" [ref=e29] [cursor=pointer]
        - button "📱 iPhone View" [ref=e30] [cursor=pointer]
        - generic [ref=e31]:
          - generic [ref=e32]: All Changes Synced
          - button "Retry Sync" [disabled]
        - button "Sign In" [ref=e33] [cursor=pointer]
      - generic [ref=e34]: Not signed in
  - status [ref=e35]:
    - generic [ref=e36]: "🔐 Sign in required: connect your Microsoft account to load Excel data and use core app features."
    - button "Sign In Now" [ref=e37] [cursor=pointer]
  - generic [ref=e38]:
    - generic [ref=e39]: Looks like you had in-progress changes from your previous session.
    - generic [ref=e40]:
      - button "Restore" [ref=e41] [cursor=pointer]
      - button "Dismiss" [ref=e42] [cursor=pointer]
  - generic [ref=e43]:
    - generic [ref=e44]:
      - button "🎮 Adventure Challenge" [ref=e45] [cursor=pointer]
      - button "🌿 Nature Challenge" [ref=e46] [cursor=pointer]
      - button "🏔️ Adventure Planner" [ref=e47] [cursor=pointer]
      - button "🧰 Household Tools" [ref=e48] [cursor=pointer]
      - button "🐦 Birding Locations" [ref=e49] [cursor=pointer]
      - button "🚴 Bike Trails" [ref=e50] [cursor=pointer]
    - tablist "Adventure Challenge categories" [ref=e54]:
      - tab "Open Outdoors section" [ref=e55] [cursor=pointer]: 🌲 Outdoors
      - tab "Open Entertainment section" [ref=e56] [cursor=pointer]: 🎬 Entertainment
      - tab "Open Food and Drink section" [ref=e57] [cursor=pointer]: 🍽️ Food & Drink
      - tab "Open Retail section" [ref=e58] [cursor=pointer]: 🛍️ Retail
      - tab "Open Wildlife and Animals section" [ref=e59] [cursor=pointer]: 🦌 Wildlife & Animals
      - tab "Open Regional Festivals section" [active] [selected] [ref=e60] [cursor=pointer]: 🎉 Regional Festivals
      - tab "Open Bike Trails section" [ref=e61] [cursor=pointer]: 🚴 Bike Trails
    - generic [ref=e62]:
      - text: ▾
      - generic [ref=e64]:
        - generic [ref=e65]:
          - heading "Adventure Challenge - Regional Festivals" [level=1] [ref=e66]
          - navigation "Jump to section links" [ref=e67]:
            - generic [ref=e68]: "Jump to section:"
            - button "📊 Category Progression" [ref=e69] [cursor=pointer]
            - button "🏅 Challenges & Badges" [ref=e70] [cursor=pointer]
            - button "📚 Seasonal Quests" [ref=e71] [cursor=pointer]
            - button "🟩 Outdoors Bingo" [ref=e72] [cursor=pointer]
            - button "🧰 Diagnostics, Sync and Clean Up" [ref=e73] [cursor=pointer]
        - generic [ref=e74]: 🎉 Regional Festivals section active
        - tabpanel "Open Regional Festivals section" [ref=e75]:
          - generic [ref=e76]:
            - generic [ref=e77]:
              - generic [ref=e78]: 🎉 Regional Festivals
              - generic [ref=e79]: Browse and plan regional festivals you want to visit.
            - generic [ref=e80]:
              - generic [ref=e81]: "Regional Festivals data: sign-in required Use Sign In, then refresh this tab."
              - generic [ref=e82]:
                - button "Refresh Data" [ref=e83] [cursor=pointer]
                - button "↶ Undo" [disabled] [ref=e84] [cursor=pointer]:
                  - text: ↶ Undo
                  - generic: i
                - button "🔎 Explore Regional Festivals" [ref=e85] [cursor=pointer]
                - button "Log a Visit" [ref=e86] [cursor=pointer]
                - button "🏙️ City Explorer" [ref=e87] [cursor=pointer]:
                  - text: 🏙️ City Explorer
                  - generic: i
                - button "📝 Edit Mode" [ref=e88] [cursor=pointer]:
                  - text: 📝 Edit Mode
                  - generic: i
        - group "🧰 Diagnostics, Sync and Clean Up" [ref=e89]:
          - generic "🧰 Diagnostics, Sync and Clean Up Sync health, local queue visibility, and visited tracker diagnostics. ▾" [ref=e90] [cursor=pointer]:
            - generic [ref=e91]:
              - generic [ref=e92]: 🧰 Diagnostics, Sync and Clean Up
              - generic [ref=e93]: Sync health, local queue visibility, and visited tracker diagnostics.
            - text: ▾
          - option "Strict (Place ID + exact name)"
          - option "Balanced (Place ID + exact + fuzzy)" [selected]
          - option "Name Only (exact + fuzzy)"
```

# Test source

```ts
  1   | const { test, expect } = require('./reliability-test');
  2   | 
  3   | const ADVENTURE_SUBTABS = [
  4   |   {
  5   |     key: 'wildlife-animals',
  6   |     label: 'Wildlife & Animals',
  7   |     refreshAction: 'refresh-subtab-wildlife-animals',
  8   |     undoAction: 'undo-subtab-wildlife-animals',
  9   |     exploreAction: 'open-explorer-wildlife-animals',
  10  |     cityAction: 'open-city-explorer-wildlife-animals',
  11  |     logAction: 'open-visit-log-wildlife-animals',
  12  |     editAction: 'open-edit-mode-wildlife-animals',
  13  |     legacyFindAction: 'find-wildlife-animals'
  14  |   },
  15  |   {
  16  |     key: 'regional-festivals',
  17  |     label: 'Regional Festivals',
  18  |     refreshAction: 'refresh-subtab-regional-festivals',
  19  |     undoAction: 'undo-subtab-regional-festivals',
  20  |     exploreAction: 'open-explorer-regional-festivals',
  21  |     cityAction: 'open-city-explorer-regional-festivals',
  22  |     logAction: 'open-visit-log-regional-festivals',
  23  |     editAction: 'open-edit-mode-regional-festivals',
  24  |     legacyFindAction: 'find-regional-festivals'
  25  |   },
  26  |   {
  27  |     key: 'retail',
  28  |     label: 'Retail',
  29  |     refreshAction: 'refresh-subtab-retail',
  30  |     undoAction: 'undo-subtab-retail',
  31  |     exploreAction: 'open-explorer-retail',
  32  |     cityAction: 'open-city-explorer-retail',
  33  |     logAction: 'open-visit-log-retail',
  34  |     editAction: 'open-edit-mode-retail',
  35  |     legacyFindAction: 'find-retail-location'
  36  |   }
  37  | ];
  38  | 
  39  | function getVisualActionOrder(selector) {
  40  |   return async (page) => page.locator(selector).evaluateAll((nodes) => {
  41  |     return nodes
  42  |       .map((node, index) => {
  43  |         const orderRaw = window.getComputedStyle(node).order;
  44  |         const order = Number.isFinite(Number(orderRaw)) ? Number(orderRaw) : 0;
  45  |         return {
  46  |           action: String(node.getAttribute('data-visited-subtab-action') || '').trim(),
  47  |           order,
  48  |           index
  49  |         };
  50  |       })
  51  |       .filter((entry) => entry.action)
  52  |       .sort((a, b) => (a.order - b.order) || (a.index - b.index))
  53  |       .map((entry) => entry.action);
  54  |   });
  55  | }
  56  | 
  57  | async function waitForAdventureCtaNormalized(page, subtabKey) {
> 58  |   await page.waitForFunction((key) => {
      |              ^ Error: page.waitForFunction: Test timeout of 60000ms exceeded.
  59  |     const row = document.querySelector(`#visitedProgressPane-${key} .visited-subtab-action-row`);
  60  |     return Boolean(row && row.getAttribute('data-cta-normalized') === '1');
  61  |   }, subtabKey);
  62  | }
  63  | 
  64  | test.describe('Adventure Challenge new subtabs smoke', () => {
  65  |   test.beforeEach(async ({ page }) => {
  66  |     await page.goto('/');
  67  |     await page.locator('.app-tab-btn[data-tab="visited-locations"]').click();
  68  |     await expect(page.locator('#visitedLocationsRoot')).toBeVisible();
  69  |   });
  70  | 
  71  |   test('legacy top header controls are removed from Adventure Challenge', async ({ page }) => {
  72  |     await expect(page.locator('#visitedRefreshBtn')).toHaveCount(0);
  73  |     await expect(page.locator('#visitedWeatherMode')).toHaveCount(0);
  74  |     await expect(page.locator('#visitedCtaInjectorStatus')).toHaveCount(0);
  75  |   });
  76  | 
  77  |   test('default Outdoors pane uses Nature-style status pills', async ({ page }) => {
  78  |     await expect(page.locator('#visitedSubtabStatus-outdoors .visited-subtab-status-health')).toBeVisible();
  79  |     await expect(page.locator('#visitedSubtabStatus-outdoors .visited-subtab-status-meta')).toBeVisible();
  80  |     await expect(page.locator('#visitedSubtabStatus-outdoors .visited-subtab-status-health')).toContainText(/Outdoors data:/i);
  81  |   });
  82  | 
  83  |   test('adventure achievement sections keep sticky section-header style hook', async ({ page }) => {
  84  |     const stickyRulePresent = await page.evaluate(() => {
  85  |       return Array.from(document.querySelectorAll('style')).some((style) => {
  86  |         const text = String(style.textContent || '');
  87  |         return text.includes('#visitedLocationsRoot .adventure-achv-section > .card-header')
  88  |           && text.includes('position: sticky')
  89  |           && text.includes('top: 82px');
  90  |       });
  91  |     });
  92  |     expect(stickyRulePresent).toBe(true);
  93  |   });
  94  | 
  95  |   test('jump links hide while Outdoors explorer view is open', async ({ page }) => {
  96  |     const jumpLinks = page.locator('#visitedLocationsRoot .visited-jump-links');
  97  |     await expect(jumpLinks).toHaveAttribute('aria-hidden', 'false');
  98  | 
  99  |     const openExplorerBtn = page.locator('#visitedProgressPane-outdoors [data-visited-subtab-action="open-explorer-outdoors"]').first();
  100 |     await expect(openExplorerBtn).toBeVisible();
  101 |     await openExplorerBtn.click();
  102 | 
  103 |     await expect(page.locator('#visitedProgressPane-outdoors [data-visited-subtab-view="explorer"]').first()).toBeVisible();
  104 |     await expect(jumpLinks).toHaveAttribute('hidden', '');
  105 |     await expect(jumpLinks).toHaveAttribute('aria-hidden', 'true');
  106 | 
  107 |     const closeExplorerBtn = page.locator('#visitedProgressPane-outdoors [data-visited-subtab-action="close-explorer-outdoors"]').first();
  108 |     await expect(closeExplorerBtn).toBeVisible();
  109 |     await closeExplorerBtn.click();
  110 | 
  111 |     await expect(page.locator('#visitedProgressPane-outdoors [data-visited-subtab-view="overview"]').first()).toBeVisible();
  112 |     await expect(jumpLinks).not.toHaveAttribute('hidden', '');
  113 |     await expect(jumpLinks).toHaveAttribute('aria-hidden', 'false');
  114 |   });
  115 | 
  116 |   test('Outdoors CTA row preserves canonical action order', async ({ page }) => {
  117 |     await waitForAdventureCtaNormalized(page, 'outdoors');
  118 |     const readOrder = getVisualActionOrder('#visitedProgressPane-outdoors .ui-intro-card .visited-subtab-action-row button[data-visited-subtab-action]');
  119 |     await expect.poll(async () => {
  120 |       return readOrder(page);
  121 |     }, { timeout: 15000 }).toEqual([
  122 |       'open-explorer-outdoors',
  123 |       'open-city-explorer-outdoors',
  124 |       'open-visit-log-outdoors',
  125 |       'open-edit-mode-outdoors',
  126 |       'refresh-subtab-outdoors',
  127 |       'undo-subtab-outdoors'
  128 |     ]);
  129 |   });
  130 | 
  131 |   ADVENTURE_SUBTABS.forEach(({ key, label, refreshAction, undoAction, exploreAction, cityAction, logAction, editAction, legacyFindAction }) => {
  132 |     test(`subtab smoke: ${label}`, async ({ page }) => {
  133 |       const dockButton = page.locator(`#appSubTabsSlot [data-progress-subtab="${key}"]`).first();
  134 |       await expect(dockButton).toBeVisible();
  135 |       await dockButton.click();
  136 | 
  137 |       await expect(page.locator(`#visitedProgressPane-${key}`)).toBeVisible();
  138 |       await waitForAdventureCtaNormalized(page, key);
  139 |       await expect(page.locator(`#appSubTabsSlot [data-progress-subtab="${key}"][aria-selected="true"]`)).toBeVisible();
  140 |       await expect(page.locator(`#visitedSubtabStatus-${key} .visited-subtab-status-health`)).toBeVisible();
  141 |       await expect(page.locator(`#visitedSubtabStatus-${key} .visited-subtab-status-meta`)).toBeVisible();
  142 |       await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${refreshAction}"]`)).toHaveCount(1);
  143 |       await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${undoAction}"]`)).toHaveCount(1);
  144 |       await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${exploreAction}"]`)).toHaveCount(1);
  145 |       await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${cityAction}"]`)).toHaveCount(1);
  146 |       await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${logAction}"]`)).toHaveCount(1);
  147 |       await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${editAction}"]`)).toHaveCount(1);
  148 |       await expect(page.locator(`#visitedProgressPane-${key} [data-visited-subtab-action="${legacyFindAction}"]`)).toHaveCount(0);
  149 | 
  150 |       const readOrder = getVisualActionOrder(`#visitedProgressPane-${key} .ui-intro-card .visited-subtab-action-row button[data-visited-subtab-action]`);
  151 |       await expect.poll(async () => {
  152 |         return readOrder(page);
  153 |       }, { timeout: 15000 }).toEqual([
  154 |         exploreAction,
  155 |         cityAction,
  156 |         logAction,
  157 |         editAction,
  158 |         refreshAction,
```