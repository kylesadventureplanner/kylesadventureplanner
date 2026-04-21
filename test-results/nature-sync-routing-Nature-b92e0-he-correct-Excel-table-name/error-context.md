# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: nature-sync-routing.spec.js >> Nature sync routing — Graph table-name assertions >> each category logs a sighting to the correct Excel table name
- Location: tests/nature-sync-routing.spec.js:191:3

# Error details

```
Error: Expected a Graph POST to table "mammals_sightings" for category "mammals" but none was found.
Actual POSTs: [
  {
    "table": "birds_sightings",
    "workbook": "Copilot_Apps/Kyles_Adventure_Finder/Nature_Sightings.xlsx"
  },
  {
    "table": "birds_sightings",
    "workbook": "Copilot_Apps/Kyles_Adventure_Finder/Nature_Sightings.xlsx"
  },
  {
    "table": "birds_sightings",
    "workbook": "Copilot_Apps/Kyles_Adventure_Finder/Nature_Sightings.xlsx"
  },
  {
    "table": "birds_sightings",
    "workbook": "Copilot_Apps/Kyles_Adventure_Finder/Nature_Sightings.xlsx"
  }
]

expect(received).toBeTruthy()

Received: undefined
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
      - generic [ref=e12]: "Startup timing: interactive 99 ms | overlay off 450 ms"
      - generic [ref=e13]: "Reliability: blocked 0 | overlays 0 | recoveries 0 | errors 0"
    - generic [ref=e14]:
      - button "📋 Copy All" [ref=e15]
      - button "🔗 Copy Card Bundle" [ref=e16]
      - button "🗑️ Clear" [ref=e17]
      - button "↓ Minimize" [ref=e18]
  - banner [ref=e19]:
    - generic [ref=e20]:
      - generic [ref=e21]: Kyle’s Adventure Finder
      - generic [ref=e22]: Powered by Excel, enhanced with Google data and mobile-friendly design.
    - generic [ref=e23]:
      - generic [ref=e24]:
        - button "🔄 Reload App" [ref=e25] [cursor=pointer]
        - button "📝 Edit Mode" [ref=e26] [cursor=pointer]
        - button "📴 Offline Mode" [ref=e27] [cursor=pointer]
        - button "💾 App Backup" [ref=e28] [cursor=pointer]
        - button "📱 iPhone View" [ref=e29] [cursor=pointer]
        - generic [ref=e30]:
          - generic [ref=e31]: All Changes Synced
          - button "Retry Sync" [disabled]
        - button "Sign Out" [ref=e32] [cursor=pointer]
      - generic [ref=e33]: Signed in as test@example.com
  - generic [ref=e34]:
    - generic [ref=e35]: Looks like you had in-progress changes from your previous session.
    - generic [ref=e36]:
      - button "Restore" [ref=e37] [cursor=pointer]
      - button "Dismiss" [ref=e38] [cursor=pointer]
  - generic [ref=e39]:
    - generic [ref=e40]:
      - button "🎮 Adventure Challenge" [ref=e41] [cursor=pointer]
      - button "🌿 Nature Challenge" [active] [ref=e42] [cursor=pointer]
      - button "🏔️ Adventure Planner" [ref=e43] [cursor=pointer]
      - button "🧰 Household Tools" [ref=e44] [cursor=pointer]
      - button "🐦 Birding Locations" [ref=e45] [cursor=pointer]
      - button "🚴 Bike Trails" [ref=e46] [cursor=pointer]
      - generic [ref=e49]: 🌿 Nature Challenge ready
    - tablist "Nature Challenge categories" [ref=e53]:
      - tab "Open Birds section" [selected] [ref=e54] [cursor=pointer]: 🐦 Birds
      - tab "Open Mammals section" [ref=e55] [cursor=pointer]: 🦊 Mammals
      - tab "Open Reptiles section" [ref=e56] [cursor=pointer]: 🐢 Reptiles
      - tab "Open Amphibians section" [ref=e57] [cursor=pointer]: 🐸 Amphibians
      - tab "Open Insects section" [ref=e58] [cursor=pointer]: 🦋 Insects
      - tab "Open Arachnids section" [ref=e59] [cursor=pointer]: 🕷️ Arachnids
      - tab "Open Wildflowers section" [ref=e60] [cursor=pointer]: 🌼 Wildflowers
      - tab "Open Trees and Shrubs section" [ref=e61] [cursor=pointer]: 🌲 Trees & Shrubs
    - generic [ref=e62]:
      - generic [ref=e64]:
        - generic [ref=e65]:
          - heading "Nature Challenge - Birds" [level=1] [ref=e66]
          - navigation "Jump to section links" [ref=e67]:
            - generic [ref=e68]: "Jump to section:"
            - button "📊 Category Progression" [ref=e69] [cursor=pointer]
            - button "🏅 Challenges & Badges" [ref=e70] [cursor=pointer]
            - button "📚 Seasonal Quests" [ref=e71] [cursor=pointer]
            - button "🟩 Birding Bingo" [ref=e72] [cursor=pointer]
            - button "🧰 Diagnostics, Sync and Clean Up" [ref=e73] [cursor=pointer]
        - generic [ref=e74]: 🐦 Birds section active
        - tabpanel "Open Birds section" [ref=e75]:
          - generic [ref=e76]:
            - generic [ref=e78]:
              - generic [ref=e79]:
                - heading "🔎 Explore Species / Log a Sighting" [level=3] [ref=e80]
                - generic [ref=e81]: Browse your full bird list or open the dedicated sighting log page.
                - generic [ref=e82]:
                  - generic [ref=e83]: "Bird data: ready"
                  - generic [ref=e84]: "0 species | Source: Excel table 'birds' in Copilot_Apps/Kyles_Adventure_Finder/Nature_records.xlsx Updated 4/21/2026, 5:57:03 PM"
              - generic [ref=e85]:
                - button "Explore Species" [ref=e86] [cursor=pointer]
                - button "Log a Sighting" [ref=e87] [cursor=pointer]
                - button "Map" [ref=e88] [cursor=pointer]
                - button "Refresh Data" [ref=e89] [cursor=pointer]
                - button "↶ Undo" [disabled]
            - generic [ref=e90]:
              - generic [ref=e92]:
                - heading "📌 Today Focus" [level=3] [ref=e93]
                - generic [ref=e94]: Recommended next actions based on your current momentum.
              - generic [ref=e95]:
                - button "Log your first sighting today" [ref=e96] [cursor=pointer]
                - button "Log one sighting now" [ref=e97] [cursor=pointer]
            - search "Birds command bar" [ref=e98]:
              - generic [ref=e99]:
                - generic [ref=e100]: Birds command bar
                - generic [ref=e101]: Use short commands to search birds, go to a section, or open the sighting log.
              - generic [ref=e102]:
                - combobox "Birds command bar" [ref=e103]
                - button "Run" [ref=e104] [cursor=pointer]
                - button "Clear the current Birds command" [ref=e105] [cursor=pointer]: x
                - button "Reset Birds UI" [ref=e106] [cursor=pointer]
                - button "Challenges & Badges" [ref=e107] [cursor=pointer]
                - button "Quests" [ref=e108] [cursor=pointer]
                - button "Bingo" [ref=e109] [cursor=pointer]
              - group [ref=e110]:
                - 'generic "Try commands like: search heron" [ref=e111] [cursor=pointer]':
                  - generic [ref=e112]: "Try commands like:"
                  - code [ref=e113]: search heron
            - generic [ref=e114]:
              - generic [ref=e116]:
                - generic [ref=e117]: 📊 Category Progression
                - generic [ref=e118]: Track your bird species sightings.
              - generic [ref=e119]:
                - generic [ref=e120]:
                  - generic [ref=e121]: Total Species Sighted
                  - generic [ref=e122]: "0"
                  - generic [ref=e123]: out of 0 species
                - generic [ref=e124]:
                  - generic [ref=e125]: In Season Now
                  - generic [ref=e126]: "0"
                  - generic [ref=e127]: species marked sighted that are currently available
                - generic [ref=e128]:
                  - generic [ref=e129]: Rare or Better
                  - generic [ref=e130]: "0"
                  - generic [ref=e131]: rare, very rare, and extremely rare birds sighted
                - generic [ref=e132]:
                  - generic [ref=e133]: Families Completed
                  - generic [ref=e134]: "0"
                  - generic [ref=e135]: families where every listed species is sighted
                - generic [ref=e136]:
                  - generic [ref=e137]: Migration Species
                  - generic [ref=e138]: "0"
                  - generic [ref=e139]: migration-associated birds marked sighted
                - generic [ref=e140]:
                  - generic [ref=e141]: Streak + Freeze
                  - generic [ref=e142]: "0"
                  - generic [ref=e143]:
                    - generic [ref=e144]: "Best: 0 days"
                    - generic [ref=e145]: "Freeze credits: 1"
                    - generic [ref=e146]: Streak is active and protected.
                  - button "Freeze Unavailable" [disabled]
              - generic [ref=e147]:
                - strong [ref=e148]: "Spring focus:"
                - text: "0 of 0 currently available species marked sighted | 0 this week | 0 this month | 0 this quarter | 0 this year | Streak: 0 day(s) (1 freeze credit)."
              - generic [ref=e149]:
                - generic [ref=e150]:
                  - strong [ref=e151]: Auth
                  - text: signed in
                - generic [ref=e152]:
                  - strong [ref=e153]: Workbook
                  - text: "data: Copilot_Apps/Kyles_Adventure_Finder/Nature_records.xlsx | sync: Copilot_Apps/Kyles_Adventure_Finder/Nature_Sightings.xlsx"
                - generic [ref=e154]:
                  - strong [ref=e155]: Birds Species
                  - text: ready (0 species)
                - generic [ref=e156]:
                  - strong [ref=e157]: Birds Sightings/User State
                  - text: ready
                - generic "App asset 2026.04.17.1 • active service worker 2026.04.17.1" [ref=e158]:
                  - strong [ref=e159]: Deployment
                  - text: app 2026.04.17.1 • sw 2026.04.17.1
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
                  - generic [ref=e180]: Rare Radar (Daily)
                  - generic [ref=e181]: IntermediateQuick
                  - generic [ref=e182]: Log one rare-or-better species today.
                  - generic [ref=e184]:
                    - generic [ref=e185]: 0/1
                    - generic [ref=e186]: 0%
                - generic [ref=e187]:
                  - generic [ref=e188]: Explorer Context Mixer
                  - generic [ref=e189]: IntermediateQuick
                  - generic [ref=e190]: Log sightings in 2 different regions or habitats today.
                  - generic [ref=e192]:
                    - generic [ref=e193]: 0/2
                    - generic [ref=e194]: 0%
                - generic [ref=e195]:
                  - generic [ref=e196]: Daily Show Up Today
                  - generic [ref=e197]: IntermediateQuick
                  - generic [ref=e198]: Log at least one sighting today.
                  - generic [ref=e200]:
                    - generic [ref=e201]: 0/1
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
  - generic: Track nature species sightings and challenges
  - generic [ref=e411]: ✅ App Ready - 9 systems initialized
```

# Test source

```ts
  176 | 
  177 |     // All other Graph calls
  178 |     await route.fulfill({
  179 |       status: 200,
  180 |       contentType: 'application/json',
  181 |       body: JSON.stringify({ value: [] })
  182 |     });
  183 |   });
  184 | }
  185 | 
  186 | // ---------------------------------------------------------------------------
  187 | // Tests
  188 | // ---------------------------------------------------------------------------
  189 | 
  190 | test.describe('Nature sync routing — Graph table-name assertions', () => {
  191 |   test('each category logs a sighting to the correct Excel table name', async ({ page }) => {
  192 |     const graphPosts = [];
  193 | 
  194 |     // 1. Seed localStorage with sync queue before page load
  195 |     await page.addInitScript((queueKey) => {
  196 |       const items = [
  197 |         { subTabKey: 'birds', idx: 0 },
  198 |         { subTabKey: 'mammals', idx: 1 },
  199 |         { subTabKey: 'insects', idx: 2 },
  200 |         { subTabKey: 'trees', idx: 3 }
  201 |       ].map(({ subTabKey, idx }) => ({
  202 |         id: `test-item-${subTabKey}-${idx}`,
  203 |         type: 'log-sighting',
  204 |         attempts: 0,
  205 |         createdAt: new Date().toISOString(),
  206 |         payload: {
  207 |           subTabKey,
  208 |           id: `s-test-${subTabKey}-${idx}`,
  209 |           speciesId: `sp-${subTabKey}-${idx}`,
  210 |           speciesStatusKey: `${subTabKey}_sp_${idx}`,
  211 |           canonicalId: `sp-${subTabKey}-${idx}`,
  212 |           speciesName: `Test ${subTabKey} Species ${idx}`,
  213 |           familyLabel: 'Test Family',
  214 |           dateObserved: '2026-04-21',
  215 |           locationName: 'Test Location',
  216 |           count: 1,
  217 |           region: '',
  218 |           habitat: '',
  219 |           latitude: null,
  220 |           longitude: null,
  221 |           confidence: 'certain',
  222 |           notes: '',
  223 |           photoUrl: '',
  224 |           audioUrl: '',
  225 |           createdAt: new Date().toISOString(),
  226 |           synced: false
  227 |         }
  228 |       }));
  229 |       localStorage.setItem(queueKey, JSON.stringify(items));
  230 |       window.accessToken = 'playwright-mock-token';
  231 |       window.activeAccount = { username: 'test@example.com', name: 'Test User' };
  232 |     }, 'natureChallengeBirdSyncQueueV1');
  233 | 
  234 |     // 2. Install Graph route mocks
  235 |     await installNatureSyncGraphMocks(page, graphPosts);
  236 | 
  237 |     // 3. Load the app
  238 |     await page.goto('/');
  239 |     await page.locator('.app-tab-btn[data-tab="nature-challenge"]').click();
  240 |     await expect(page.locator('#natureChallengeRoot')).toBeVisible();
  241 | 
  242 |     // 4. Wait for the nature system to fully boot (dock and sync button present)
  243 |     await page.waitForFunction(() => {
  244 |       const dockedTabs = document.querySelector('#appSubTabsSlot .nature-challenge-subtabs');
  245 |       const syncBtn = document.getElementById('birdsSyncNowBtn');
  246 |       return Boolean(dockedTabs && dockedTabs.dataset.natureDockBound === '1' && syncBtn);
  247 |     }, null, { timeout: 20000 });
  248 | 
  249 |     // Ensure accessToken is still set (hydrate in page context after load)
  250 |     await page.evaluate(() => {
  251 |       window.accessToken = 'playwright-mock-token';
  252 |       window.activeAccount = { username: 'test@example.com', name: 'Test User' };
  253 |       if (typeof window.showToast !== 'function') window.showToast = () => {};
  254 |     });
  255 | 
  256 |     // 5. Trigger sync — the button lives inside a collapsed <details> panel,
  257 |     //    so click it programmatically to avoid a visibility check.
  258 |     await page.evaluate(() => {
  259 |       const btn = document.getElementById('birdsSyncNowBtn');
  260 |       if (!btn) throw new Error('birdsSyncNowBtn not found in DOM');
  261 |       btn.click();
  262 |     });
  263 | 
  264 |     // 6. Wait for all 4 sighting POSTs (birds + mammals + insects + trees)
  265 |     await expect.poll(
  266 |       () => graphPosts.filter((p) => p.url.includes('/rows/add')).length,
  267 |       { timeout: 25000, message: 'Expected 4 sightings row/add POSTs (one per category)' }
  268 |     ).toBeGreaterThanOrEqual(4);
  269 | 
  270 |     // 7. Assert each category hit the correct table name
  271 |     for (const [category, expected] of Object.entries(EXPECTED_ROUTES)) {
  272 |       const postForCategory = graphPosts.find((p) => p.tableName === expected.sightingsTable);
  273 |       expect(
  274 |         postForCategory,
  275 |         `Expected a Graph POST to table "${expected.sightingsTable}" for category "${category}" but none was found.\nActual POSTs: ${JSON.stringify(graphPosts.map((p) => ({ table: p.tableName, workbook: p.workbookPath })), null, 2)}`
> 276 |       ).toBeTruthy();
      |         ^ Error: Expected a Graph POST to table "mammals_sightings" for category "mammals" but none was found.
  277 | 
  278 |       expect(
  279 |         postForCategory.workbookPath,
  280 |         `"${category}" sightings should be written to a Nature_Sightings.xlsx workbook`
  281 |       ).toMatch(/Nature_Sightings\.xlsx$/i);
  282 |     }
  283 |   });
  284 | 
  285 |   test('birds sightings are isolated from non-bird sightings in the queue', async ({ page }) => {
  286 |     const graphPosts = [];
  287 | 
  288 |     // Seed queue: two birds items + one mammal item
  289 |     await page.addInitScript((queueKey) => {
  290 |       const items = [
  291 |         { subTabKey: 'birds', idx: 0 },
  292 |         { subTabKey: 'birds', idx: 1 },
  293 |         { subTabKey: 'mammals', idx: 2 }
  294 |       ].map(({ subTabKey, idx }) => ({
  295 |         id: `iso-test-${subTabKey}-${idx}`,
  296 |         type: 'log-sighting',
  297 |         attempts: 0,
  298 |         createdAt: new Date().toISOString(),
  299 |         payload: {
  300 |           subTabKey,
  301 |           id: `s-iso-${subTabKey}-${idx}`,
  302 |           speciesId: `sp-${subTabKey}-${idx}`,
  303 |           speciesStatusKey: `${subTabKey}_sp_${idx}`,
  304 |           canonicalId: `sp-${subTabKey}-${idx}`,
  305 |           speciesName: `Isolation ${subTabKey} ${idx}`,
  306 |           familyLabel: 'Iso Family',
  307 |           dateObserved: '2026-04-21',
  308 |           locationName: '',
  309 |           count: 1,
  310 |           region: '',
  311 |           habitat: '',
  312 |           latitude: null,
  313 |           longitude: null,
  314 |           confidence: 'certain',
  315 |           notes: '',
  316 |           photoUrl: '',
  317 |           audioUrl: '',
  318 |           createdAt: new Date().toISOString(),
  319 |           synced: false
  320 |         }
  321 |       }));
  322 |       localStorage.setItem(queueKey, JSON.stringify(items));
  323 |       window.accessToken = 'playwright-mock-token';
  324 |       window.activeAccount = { username: 'test@example.com', name: 'Test User' };
  325 |     }, 'natureChallengeBirdSyncQueueV1');
  326 | 
  327 |     await installNatureSyncGraphMocks(page, graphPosts);
  328 | 
  329 |     await page.goto('/');
  330 |     await page.locator('.app-tab-btn[data-tab="nature-challenge"]').click();
  331 |     await expect(page.locator('#natureChallengeRoot')).toBeVisible();
  332 |     await page.waitForFunction(() => {
  333 |       const dockedTabs = document.querySelector('#appSubTabsSlot .nature-challenge-subtabs');
  334 |       const syncBtn = document.getElementById('birdsSyncNowBtn');
  335 |       return Boolean(dockedTabs && dockedTabs.dataset.natureDockBound === '1' && syncBtn);
  336 |     }, null, { timeout: 20000 });
  337 | 
  338 |     await page.evaluate(() => {
  339 |       window.accessToken = 'playwright-mock-token';
  340 |       window.activeAccount = { username: 'test@example.com', name: 'Test User' };
  341 |       if (typeof window.showToast !== 'function') window.showToast = () => {};
  342 |     });
  343 | 
  344 |     await page.evaluate(() => {
  345 |       const btn = document.getElementById('birdsSyncNowBtn');
  346 |       if (!btn) throw new Error('birdsSyncNowBtn not found in DOM');
  347 |       btn.click();
  348 |     });
  349 | 
  350 |     // Expect exactly 3 row adds: 2 birds + 1 mammal
  351 |     await expect.poll(
  352 |       () => graphPosts.filter((p) => p.url.includes('/rows/add')).length,
  353 |       { timeout: 20000, message: 'Expected 3 sightings POSTs (2 birds + 1 mammal)' }
  354 |     ).toBeGreaterThanOrEqual(3);
  355 | 
  356 |     const birdPosts = graphPosts.filter((p) => p.tableName === 'birds_sightings');
  357 |     const mammalPosts = graphPosts.filter((p) => p.tableName === 'mammals_sightings');
  358 |     const otherPosts = graphPosts.filter(
  359 |       (p) => p.tableName !== 'birds_sightings' && p.tableName !== 'mammals_sightings'
  360 |     );
  361 | 
  362 |     // Two birds items → two POSTs to birds_sightings
  363 |     expect(birdPosts.length, 'Should have 2 birds_sightings POSTs').toBe(2);
  364 | 
  365 |     // One mammal item → one POST to mammals_sightings
  366 |     expect(mammalPosts.length, 'Should have 1 mammals_sightings POST').toBe(1);
  367 | 
  368 |     // No sightings rows added to any other table
  369 |     expect(
  370 |       otherPosts.length,
  371 |       `Unexpected sightings POSTs to other tables: ${otherPosts.map((p) => p.tableName).join(', ')}`
  372 |     ).toBe(0);
  373 |   });
  374 | 
  375 |   test('insects and trees route to distinct table names even when sharing the same workbook', async ({ page }) => {
  376 |     const graphPosts = [];
```