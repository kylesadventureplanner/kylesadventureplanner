# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: nature-map-context.spec.js >> Nature map context labels >> birds CTA order keeps injected Map between Log and Refresh
- Location: tests/nature-map-context.spec.js:4:3

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
      - generic [ref=e12]: "Startup timing: interactive 87 ms | overlay off 440 ms"
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
      - button "🌿 Nature Challenge Track nature species sightings and challenges" [active] [ref=e46] [cursor=pointer]
      - button "🏔️ Adventure Planner" [ref=e47] [cursor=pointer]
      - button "🧰 Household Tools" [ref=e48] [cursor=pointer]
      - button "🐦 Birding Locations" [ref=e49] [cursor=pointer]
      - button "🚴 Bike Trails" [ref=e50] [cursor=pointer]
    - tablist "Nature Challenge categories" [ref=e54]:
      - tab "Open Birds section" [selected] [ref=e55] [cursor=pointer]: 🐦 Birds
      - tab "Open Mammals section" [ref=e56] [cursor=pointer]: 🦊 Mammals
      - tab "Open Reptiles section" [ref=e57] [cursor=pointer]: 🐢 Reptiles
      - tab "Open Amphibians section" [ref=e58] [cursor=pointer]: 🐸 Amphibians
      - tab "Open Insects section" [ref=e59] [cursor=pointer]: 🦋 Insects
      - tab "Open Arachnids section" [ref=e60] [cursor=pointer]: 🕷️ Arachnids
      - tab "Open Wildflowers section" [ref=e61] [cursor=pointer]: 🌼 Wildflowers
      - tab "Open Trees and Shrubs section" [ref=e62] [cursor=pointer]: 🌲 Trees & Shrubs
    - generic [ref=e63]:
      - generic [ref=e65]:
        - generic [ref=e66]:
          - heading "Nature Challenge - Birds" [level=1] [ref=e67]
          - navigation "Jump to section links" [ref=e68]:
            - generic [ref=e69]: "Jump to section:"
            - button "📊 Category Progression" [ref=e70] [cursor=pointer]
            - button "🏅 Challenges & Badges" [ref=e71] [cursor=pointer]
            - button "📚 Seasonal Quests" [ref=e72] [cursor=pointer]
            - button "🟩 Birding Bingo" [ref=e73] [cursor=pointer]
            - button "🧰 Diagnostics, Sync and Clean Up" [ref=e74] [cursor=pointer]
        - generic [ref=e75]: 🐦 Birds section active
        - tabpanel "Open Birds section" [ref=e76]:
          - generic [ref=e77]:
            - generic [ref=e79]:
              - generic [ref=e80]:
                - heading "🔎 Explore Species / Log a Sighting" [level=3] [ref=e81]
                - generic [ref=e82]: Browse your full bird list or open the dedicated sighting log page.
                - generic [ref=e83]:
                  - generic [ref=e84]: "Bird data: ready"
                  - generic [ref=e85]: "747 species | Source: Local dataset (data/nature-challenge-birds.tsv) Updated 4/13/2026, 9:26:39 PM"
              - generic [ref=e86]:
                - button "Refresh Data" [ref=e87] [cursor=pointer]
                - button "↶ Undo" [disabled]
                - button "Explore Species" [ref=e88] [cursor=pointer]
                - button "Log a Sighting" [ref=e89] [cursor=pointer]
                - button "🗺️ Map" [ref=e90] [cursor=pointer]
            - generic [ref=e91]:
              - generic [ref=e93]:
                - heading "📌 Today Focus" [level=3] [ref=e94]
                - generic [ref=e95]: Recommended next actions based on your current momentum.
              - generic [ref=e96]:
                - button "Log your first sighting today" [ref=e97] [cursor=pointer]
                - button "Find one more in-season species" [ref=e98] [cursor=pointer]
                - button "Log one sighting now" [ref=e99] [cursor=pointer]
            - search "Birds command bar" [ref=e100]:
              - generic [ref=e101]:
                - generic [ref=e102]: Birds command bar
                - generic [ref=e103]: Use short commands to search birds, go to a section, or open the sighting log.
              - generic [ref=e104]:
                - combobox "Birds command bar" [ref=e105]
                - button "Run" [ref=e106] [cursor=pointer]
                - button "Clear the current Birds command" [ref=e107] [cursor=pointer]: x
                - button "Reset Birds UI" [ref=e108] [cursor=pointer]
                - button "Challenges & Badges" [ref=e109] [cursor=pointer]
                - button "Quests" [ref=e110] [cursor=pointer]
                - button "Bingo" [ref=e111] [cursor=pointer]
              - group [ref=e112]:
                - 'generic "Try commands like: search heron" [ref=e113] [cursor=pointer]':
                  - generic [ref=e114]: "Try commands like:"
                  - code [ref=e115]: search heron
            - generic [ref=e116]:
              - generic [ref=e118]:
                - generic [ref=e119]: 📊 Category Progression
                - generic [ref=e120]: Track your bird species sightings.
              - generic [ref=e121]:
                - generic [ref=e122]:
                  - generic [ref=e123]: Total Species Sighted
                  - generic [ref=e124]: "0"
                  - generic [ref=e125]: out of 747 species
                - generic [ref=e126]:
                  - generic [ref=e127]: In Season Now
                  - generic [ref=e128]: "0"
                  - generic [ref=e129]: species marked sighted that are currently available
                - generic [ref=e130]:
                  - generic [ref=e131]: Rare or Better
                  - generic [ref=e132]: "0"
                  - generic [ref=e133]: rare, very rare, and extremely rare birds sighted
                - generic [ref=e134]:
                  - generic [ref=e135]: Families Completed
                  - generic [ref=e136]: "0"
                  - generic [ref=e137]: families where every listed species is sighted
                - generic [ref=e138]:
                  - generic [ref=e139]: Migration Species
                  - generic [ref=e140]: "0"
                  - generic [ref=e141]: migration-associated birds marked sighted
                - generic [ref=e142]:
                  - generic [ref=e143]: Streak + Freeze
                  - generic [ref=e144]: "0"
                  - generic [ref=e145]:
                    - generic [ref=e146]: "Best: 0 days"
                    - generic [ref=e147]: "Freeze credits: 1"
                    - generic [ref=e148]: Streak is active and protected.
                  - button "Freeze Unavailable" [disabled]
              - generic [ref=e149]:
                - strong [ref=e150]: "Spring focus:"
                - text: "0 of 129 currently available species marked sighted | 0 this week | 0 this month | 0 this quarter | 0 this year | Streak: 0 day(s) (1 freeze credit)."
              - text: "``"
              - generic [ref=e151]:
                - generic [ref=e152]:
                  - strong [ref=e153]: Auth
                  - text: local only
                - generic [ref=e154]:
                  - strong [ref=e155]: Workbook
                  - text: not resolved
                - generic [ref=e156]:
                  - strong [ref=e157]: Birds Species
                  - text: ready (747 species)
                - generic [ref=e158]:
                  - strong [ref=e159]: Birds Sightings/User State
                  - text: local only
            - generic [ref=e160]:
              - generic [ref=e161]:
                - button "In Season" [ref=e162] [cursor=pointer]
                - button "Almost There" [ref=e163] [cursor=pointer]
                - button "High Reward" [ref=e164] [cursor=pointer]
                - button "Clear filters" [ref=e165] [cursor=pointer]
              - group "Overview density" [ref=e166]:
                - button "Comfortable" [pressed] [ref=e167] [cursor=pointer]
                - button "Compact" [ref=e168] [cursor=pointer]
            - generic [ref=e169]: No overview filters active. Showing 8 challenge and badge cards, 3 quests, and 4 bingo tiles.
            - generic [ref=e171]:
              - generic [ref=e173]:
                - heading "⚡ Daily Micro-Challenges" [level=3] [ref=e174]
                - generic [ref=e175]: Three rotating daily goals for quick momentum.
              - generic [ref=e177]: Showing 3 of 3 daily picks
              - generic [ref=e178]:
                - generic [ref=e179]:
                  - generic [ref=e180]: Daily Show Up Today
                  - generic [ref=e181]: IntermediateQuick
                  - generic [ref=e182]: Log at least one sighting today.
                  - generic [ref=e184]:
                    - generic [ref=e185]: 0/1
                    - generic [ref=e186]: 0%
                - generic [ref=e187]:
                  - generic [ref=e188]: Rare Radar (Daily)
                  - generic [ref=e189]: IntermediateQuick
                  - generic [ref=e190]: Log one rare-or-better species today.
                  - generic [ref=e192]:
                    - generic [ref=e193]: 0/1
                    - generic [ref=e194]: 0%
                - generic [ref=e195]:
                  - generic [ref=e196]: Family Mix
                  - generic [ref=e197]: IntermediateQuick
                  - generic [ref=e198]: Log birds from 2 different families today.
                  - generic [ref=e200]:
                    - generic [ref=e201]: 0/2
                    - generic [ref=e202]: 0%
            - generic [ref=e203]:
              - generic [ref=e204]:
                - generic [ref=e205]:
                  - heading "🏅 Challenges & Badges" [level=3] [ref=e206]
                  - generic [ref=e207]: Your challenge goals and badges now live together in one achievement wall.
                - generic [ref=e208]:
                  - button "↑ Top" [ref=e209] [cursor=pointer]
                  - button "More" [ref=e210] [cursor=pointer]
              - generic [ref=e211]: 8/33
              - generic [ref=e213]: Showing 8 of 33 challenge and badge cards
              - generic [ref=e214]:
                - generic [ref=e215]: Challenges
                - generic [ref=e216]:
                  - generic [ref=e217]:
                    - generic [ref=e218]: 🍃
                    - generic [ref=e219]: Spring focus
                  - generic [ref=e220]: Challenge
                  - generic [ref=e221]: Spring
                  - generic [ref=e222]: Spring Sweep
                  - generic [ref=e223]: IntermediateSeasonal
                  - generic [ref=e224]: Mark birds that are available in spring right now.
                  - generic [ref=e225]: 0/15 | 0%
                - generic [ref=e227]:
                  - generic [ref=e228]:
                    - generic [ref=e229]: 🍃
                    - generic [ref=e230]: Spring focus
                  - generic [ref=e231]: Challenge
                  - generic [ref=e232]: Quest
                  - generic [ref=e233]: Season Questline
                  - generic [ref=e234]: Seasonal / MasterySeasonal
                  - generic [ref=e235]: Log 12 sightings during spring to complete your chapter.
                  - generic [ref=e236]: 0/12 | 0%
                - generic [ref=e238]:
                  - generic [ref=e239]:
                    - generic [ref=e240]: 🍃
                    - generic [ref=e241]: Spring focus
                  - generic [ref=e242]: Challenge
                  - generic [ref=e243]: Habitat
                  - generic [ref=e244]: Habitat Hopper
                  - generic [ref=e245]: IntermediateSeasonal
                  - generic [ref=e246]: Log birds across every habitat type this season.
                  - generic [ref=e247]: 0/4 | 0%
                - generic [ref=e249]:
                  - generic [ref=e250]:
                    - generic [ref=e251]: 🍃
                    - generic [ref=e252]: Spring focus
                  - generic [ref=e253]: Challenge
                  - generic [ref=e254]: Map
                  - generic [ref=e255]: Region Circuit
                  - generic [ref=e256]: IntermediateSeasonal
                  - generic [ref=e257]: Cover every region option in your log this season.
                  - generic [ref=e258]: 0/4 | 0%
                - generic [ref=e260]: Badges
                - generic [ref=e261]:
                  - generic [ref=e262]:
                    - generic [ref=e263]: 🍃
                    - generic [ref=e264]: Spring focus
                  - generic [ref=e265]: Badge
                  - generic [ref=e266]: Spring
                  - generic [ref=e267]: Spring Spotter
                  - generic [ref=e268]: AdvancedepicSeasonal
                  - generic [ref=e269]: Track birds available during spring.
                  - generic [ref=e270]: 0/20 | 0%
                - generic [ref=e272]:
                  - generic [ref=e273]:
                    - generic [ref=e274]: 🍃
                    - generic [ref=e275]: Spring focus
                  - generic [ref=e276]: Badge
                  - generic [ref=e277]: Seasons
                  - generic [ref=e278]: Year-Round Birder
                  - generic [ref=e279]: Seasonal / MasterylegendarySeasonal
                  - generic [ref=e280]: Log birds in spring, summer, fall, and winter.
                  - generic [ref=e281]: 0/4 | 0%
                - generic [ref=e283]:
                  - generic [ref=e284]:
                    - generic [ref=e285]: 🏆
                    - generic [ref=e286]: Big milestone
                  - generic [ref=e287]: Badge
                  - generic [ref=e288]: Common
                  - generic [ref=e289]: Common Core
                  - generic [ref=e290]: BeginnercommonLong-term
                  - generic [ref=e291]: Build a strong base with common species.
                  - generic [ref=e292]: 0/25 | 0%
                - generic [ref=e294]:
                  - generic [ref=e295]:
                    - generic [ref=e296]: 🎯
                    - generic [ref=e297]: Almost there
                  - generic [ref=e298]: Badge
                  - generic [ref=e299]: First
                  - generic [ref=e300]: First Feather
                  - generic [ref=e301]: BeginnercommonLong-term
                  - generic [ref=e302]: Mark your first bird species as sighted.
                  - generic [ref=e303]: 0/1 | 0%
            - generic [ref=e305]:
              - generic [ref=e306]:
                - generic [ref=e307]:
                  - heading "📚 Seasonal Quests" [level=3] [ref=e308]
                  - generic [ref=e309]: Complete the current season chapter with multi-step goals.
                - generic [ref=e310]:
                  - button "↑ Top" [ref=e311] [cursor=pointer]
                  - button "More" [ref=e312] [cursor=pointer]
              - generic [ref=e313]: 3/4
              - generic [ref=e315]: Showing 3 of 4 quests
              - generic [ref=e316]: "Spring chapter: 0/3 steps completed | Beginner: 1 | Intermediate: 1 | Seasonal / Mastery: 1"
              - generic [ref=e317]:
                - generic [ref=e318]:
                  - generic [ref=e319]:
                    - generic [ref=e320]: 🍃
                    - generic [ref=e321]: Spring focus
                  - generic [ref=e322]: Mastery Phase
                  - generic [ref=e323]: Seasonal / MasterySeasonal
                  - generic [ref=e324]: Reach 15 seasonal sightings.
                  - generic [ref=e326]:
                    - generic [ref=e327]: 0/15
                    - generic [ref=e328]: 0%
                - generic [ref=e329]:
                  - generic [ref=e330]:
                    - generic [ref=e331]: 🍃
                    - generic [ref=e332]: Spring focus
                  - generic [ref=e333]: Scout Phase
                  - generic [ref=e334]: BeginnerSeasonal
                  - generic [ref=e335]: Log 5 sightings this season.
                  - generic [ref=e337]:
                    - generic [ref=e338]: 0/5
                    - generic [ref=e339]: 0%
                - generic [ref=e340]:
                  - generic [ref=e341]:
                    - generic [ref=e342]: 🍃
                    - generic [ref=e343]: Spring focus
                  - generic [ref=e344]: Variety Phase
                  - generic [ref=e345]: IntermediateSeasonal
                  - generic [ref=e346]: Log sightings across 3 habitats this season.
                  - generic [ref=e348]:
                    - generic [ref=e349]: 0/3
                    - generic [ref=e350]: 0%
            - generic [ref=e351]:
              - generic [ref=e352]:
                - generic [ref=e353]:
                  - heading "🟩 Birds Bingo" [level=3] [ref=e354]
                  - generic [ref=e355]: Complete seasonal bingo tiles for birds and reroll once per season.
                - generic [ref=e356]:
                  - button "↑ Top" [ref=e357] [cursor=pointer]
                  - button "More" [ref=e358] [cursor=pointer]
              - generic [ref=e359]: 4/9
              - generic [ref=e361]: Showing 4 of 9 bingo tiles
              - generic [ref=e362]: 0/9 tiles complete
              - generic [ref=e363]:
                - generic [ref=e364]:
                  - generic [ref=e365]:
                    - generic [ref=e366]: 🎯
                    - generic [ref=e367]: Almost there
                  - generic [ref=e368]: Bingo
                  - generic [ref=e369]: 🟩
                  - generic [ref=e370]: Spot 1 rare-or-better
                  - generic [ref=e371]: Complete this bingo objective during the current season.
                  - generic [ref=e372]: 0/1 | 0%
                - generic [ref=e374]:
                  - generic [ref=e375]:
                    - generic [ref=e376]: 🎯
                    - generic [ref=e377]: Almost there
                  - generic [ref=e378]: Bingo
                  - generic [ref=e379]: 🟩
                  - generic [ref=e380]: Complete 1 family
                  - generic [ref=e381]: Complete this bingo objective during the current season.
                  - generic [ref=e382]: 0/1 | 0%
                - generic [ref=e384]:
                  - generic [ref=e385]:
                    - generic [ref=e386]: ✨
                    - generic [ref=e387]: Recommended
                  - generic [ref=e388]: Bingo
                  - generic [ref=e389]: 🟩
                  - generic [ref=e390]: Reach 15 total species
                  - generic [ref=e391]: Complete this bingo objective during the current season.
                  - generic [ref=e392]: 0/15 | 0%
                - generic [ref=e394]:
                  - generic [ref=e395]:
                    - generic [ref=e396]: ✨
                    - generic [ref=e397]: Recommended
                  - generic [ref=e398]: Bingo
                  - generic [ref=e399]: 🟩
                  - generic [ref=e400]: Sight 10 genera
                  - generic [ref=e401]: Complete this bingo objective during the current season.
                  - generic [ref=e402]: 0/10 | 0%
              - button "Reroll Bingo Card (1/season)" [ref=e405] [cursor=pointer]
            - group "🧰 Birds Diagnostics, Sync and Clean Up" [ref=e406]:
              - generic "🧰 Birds Diagnostics, Sync and Clean Up Quality tools and local/Excel sync controls. Expand this section to inspect Birds diagnostics and repair tasks. ▾" [ref=e407] [cursor=pointer]:
                - generic [ref=e408]:
                  - heading "🧰 Birds Diagnostics, Sync and Clean Up" [level=3] [ref=e409]
                  - generic [ref=e410]: Quality tools and local/Excel sync controls. Expand this section to inspect Birds diagnostics and repair tasks.
                - text: ▾
      - text: ▾
```

# Test source

```ts
  1  | const { test, expect } = require('./reliability-test');
  2  | 
  3  | test.describe('Nature map context labels', () => {
  4  |   test('birds CTA order keeps injected Map between Log and Refresh', async ({ page }) => {
  5  |     await page.goto('/');
  6  |     await page.locator('.app-tab-btn[data-tab="nature-challenge"]').click();
  7  |     await expect(page.locator('#natureChallengeRoot')).toBeVisible();
  8  | 
> 9  |     await page.waitForFunction(() => {
     |                ^ Error: page.waitForFunction: Test timeout of 60000ms exceeded.
  10 |       const row = document.querySelector('#natureChallengePane-birds .nature-birds-view.is-active[data-birds-view="overview"] .nature-explore-cta-actions');
  11 |       if (!row) return false;
  12 |       if (!row.querySelector('#birdsOpenMapBtn')) return false;
  13 |       return row.getAttribute('data-cta-normalized') === '1';
  14 |     });
  15 | 
  16 |     await expect.poll(async () => {
  17 |       return page.locator('#natureChallengePane-birds .nature-birds-view.is-active[data-birds-view="overview"] .nature-explore-cta-actions > button').evaluateAll((nodes) => {
  18 |         return nodes
  19 |           .map((node, index) => {
  20 |             const orderRaw = window.getComputedStyle(node).order;
  21 |             const order = Number.isFinite(Number(orderRaw)) ? Number(orderRaw) : 0;
  22 |             return {
  23 |               id: String(node.id || '').trim(),
  24 |               order,
  25 |               index
  26 |             };
  27 |           })
  28 |           .filter((entry) => entry.id)
  29 |           .sort((a, b) => (a.order - b.order) || (a.index - b.index))
  30 |           .map((entry) => entry.id);
  31 |       });
  32 |     }, { timeout: 12000 }).toEqual([
  33 |       'birdsExploreBtn',
  34 |       'birdsOpenLogBtn',
  35 |       'birdsOpenMapBtn',
  36 |       'natureChallengeRefreshBtn',
  37 |       'birdsUndoActionBtn'
  38 |     ]);
  39 |   });
  40 | 
  41 |   test('map header/back reflects active nature subtab context', async ({ page }) => {
  42 |     await page.goto('/');
  43 |     await page.locator('.app-tab-btn[data-tab="nature-challenge"]').click();
  44 |     await expect(page.locator('#natureChallengeRoot')).toBeVisible();
  45 | 
  46 |     await page.waitForFunction(() => typeof window.SightingMap?.open === 'function');
  47 | 
  48 |     // Subtabs are docked outside the root container, and click handlers are attached asynchronously.
  49 |     await page.waitForFunction(() => {
  50 |       const dockedTabs = document.querySelector('#appSubTabsSlot .nature-challenge-subtabs');
  51 |       return Boolean(dockedTabs && dockedTabs.dataset.natureDockBound === '1');
  52 |     });
  53 | 
  54 |     const activateNatureSubTab = async (subTabKey, expectedLabel) => {
  55 |       const button = page.locator(`#appSubTabsSlot [data-nature-subtab="${subTabKey}"]`).first();
  56 |       await button.click();
  57 |       await expect(button).toHaveAttribute('aria-selected', 'true');
  58 |       await expect(page.locator('#natureChallengeTitle')).toContainText(expectedLabel);
  59 |     };
  60 | 
  61 |     await activateNatureSubTab('mammals', 'Mammals');
  62 |     await page.evaluate(() => window.SightingMap.open());
  63 |     await expect(page.locator('#birdsMapOverlay')).toBeVisible();
  64 |     await expect(page.locator('#birdsMapCloseBtn')).toContainText('Back to Mammals');
  65 |     await expect(page.locator('#birdsMapOverlay .birds-map-title')).toContainText('Mammals Map');
  66 |     await page.locator('#birdsMapCloseBtn').click();
  67 | 
  68 |     await activateNatureSubTab('wildflowers', 'Wildflowers');
  69 |     await page.evaluate(() => window.SightingMap.open());
  70 |     await expect(page.locator('#birdsMapOverlay')).toBeVisible();
  71 |     await expect(page.locator('#birdsMapCloseBtn')).toContainText('Back to Wildflowers');
  72 |     await expect(page.locator('#birdsMapOverlay .birds-map-title')).toContainText('Wildflowers Map');
  73 |     await page.locator('#birdsMapCloseBtn').click();
  74 |   });
  75 | });
  76 | 
  77 | 
```