# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adventure-subtabs-smoke.spec.js >> Adventure Challenge new subtabs smoke >> subtab smoke: Retail
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
      - tab "Open Retail section" [active] [selected] [ref=e58] [cursor=pointer]: 🛍️ Retail
      - tab "Open Wildlife and Animals section" [ref=e59] [cursor=pointer]: 🦌 Wildlife & Animals
      - tab "Open Regional Festivals section" [ref=e60] [cursor=pointer]: 🎉 Regional Festivals
      - tab "Open Bike Trails section" [ref=e61] [cursor=pointer]: 🚴 Bike Trails
    - generic [ref=e62]:
      - text: ▾
      - generic [ref=e64]:
        - generic [ref=e65]:
          - heading "Adventure Challenge - Retail" [level=1] [ref=e66]
          - navigation "Jump to section links" [ref=e67]:
            - generic [ref=e68]: "Jump to section:"
            - button "📊 Category Progression" [ref=e69] [cursor=pointer]
            - button "🏅 Challenges & Badges" [ref=e70] [cursor=pointer]
            - button "📚 Seasonal Quests" [ref=e71] [cursor=pointer]
            - button "🟩 Outdoors Bingo" [ref=e72] [cursor=pointer]
            - button "🧰 Diagnostics, Sync and Clean Up" [ref=e73] [cursor=pointer]
        - generic [ref=e74]: 🛍️ Retail section active
        - tabpanel "Open Retail section" [ref=e75]:
          - generic [ref=e76]:
            - generic [ref=e77]:
              - generic [ref=e78]: 🛍️ Retail
              - generic [ref=e79]: Browse and plan retail locations you want to visit.
            - generic [ref=e80]:
              - generic [ref=e81]:
                - text: "Retail data: sign-in required"
                - button "Sync category totals" [ref=e82] [cursor=pointer]
                - text: Use Sign In, then refresh this tab.
              - generic [ref=e83]:
                - button "Refresh Data" [ref=e84] [cursor=pointer]
                - button "↶ Undo" [disabled] [ref=e85] [cursor=pointer]
                - button "🔎 Explore Retail" [ref=e86] [cursor=pointer]
                - button "Log a Visit" [ref=e87] [cursor=pointer]
                - button "🏙️ City Explorer" [ref=e88] [cursor=pointer]:
                  - text: 🏙️ City Explorer
                  - generic: i
                - button "📝 Edit Mode" [ref=e89] [cursor=pointer]
          - generic [ref=e90]:
            - generic [ref=e91]:
              - generic [ref=e93]:
                - generic [ref=e94]: 📊 Category Progression
                - generic [ref=e95]:
                  - text: "Track your Retail visits by category. Total logged:"
                  - strong [ref=e96]: "0"
                  - text: .
                  - button "Log Visit" [ref=e97] [cursor=pointer]
              - generic [ref=e98]:
                - generic [ref=e99]:
                  - generic [ref=e100]: 👗
                  - generic [ref=e101]: Thrift & Consignment
                  - generic [ref=e102]: 0 / ?
                  - generic [ref=e103]: 0% complete
                  - generic [ref=e106]: Auto-tracked from visit logs
                - generic [ref=e107]:
                  - generic [ref=e108]: 🛍️
                  - generic [ref=e109]: Bargain Stores
                  - generic [ref=e110]: 0 / ?
                  - generic [ref=e111]: 0% complete
                  - generic [ref=e114]: Auto-tracked from visit logs
                - generic [ref=e115]:
                  - generic [ref=e116]: 🛒
                  - generic [ref=e117]: Grocery Stores
                  - generic [ref=e118]: 0 / ?
                  - generic [ref=e119]: 0% complete
                  - generic [ref=e122]: Auto-tracked from visit logs
                - generic [ref=e123]:
                  - generic [ref=e124]: 🥡
                  - generic [ref=e125]: Specialty Markets
                  - generic [ref=e126]: 0 / ?
                  - generic [ref=e127]: 0% complete
                  - generic [ref=e130]: Auto-tracked from visit logs
                - generic [ref=e131]:
                  - generic [ref=e132]: 🏠
                  - generic [ref=e133]: Home & Improvement
                  - generic [ref=e134]: 0 / ?
                  - generic [ref=e135]: 0% complete
                  - generic [ref=e138]: Auto-tracked from visit logs
                - generic [ref=e139]:
                  - generic [ref=e140]: 🏺
                  - generic [ref=e141]: Antiques Malls
                  - generic [ref=e142]: 0 / ?
                  - generic [ref=e143]: 0% complete
                  - generic [ref=e146]: Auto-tracked from visit logs
                - generic [ref=e147]:
                  - generic [ref=e148]: 🖼️
                  - generic [ref=e149]: Local Art & Pottery
                  - generic [ref=e150]: 0 / ?
                  - generic [ref=e151]: 0% complete
                  - generic [ref=e154]: Auto-tracked from visit logs
                - generic [ref=e155]:
                  - generic [ref=e156]: 🎨
                  - generic [ref=e157]: Craft Malls
                  - generic [ref=e158]: 0 / ?
                  - generic [ref=e159]: 0% complete
                  - generic [ref=e162]: Auto-tracked from visit logs
                - generic [ref=e163]:
                  - generic [ref=e164]: 🐾
                  - generic [ref=e165]: Pet Stores
                  - generic [ref=e166]: 0 / ?
                  - generic [ref=e167]: 0% complete
                  - generic [ref=e170]: Auto-tracked from visit logs
                - generic [ref=e171]:
                  - generic [ref=e172]: 🏪
                  - generic [ref=e173]: Shopping Malls
                  - generic [ref=e174]: 0 / ?
                  - generic [ref=e175]: 0% complete
                  - generic [ref=e178]: Auto-tracked from visit logs
                - generic [ref=e179]:
                  - generic [ref=e180]: 🏷️
                  - generic [ref=e181]: Flea Markets
                  - generic [ref=e182]: 0 / ?
                  - generic [ref=e183]: 0% complete
                  - generic [ref=e186]: Auto-tracked from visit logs
                - generic [ref=e187]:
                  - generic [ref=e188]: 🚴
                  - generic [ref=e189]: Bike Shops
                  - generic [ref=e190]: 0 / ?
                  - generic [ref=e191]: 0% complete
                  - generic [ref=e194]: Auto-tracked from visit logs
            - generic [ref=e195]:
              - generic [ref=e196]:
                - generic [ref=e197]:
                  - generic [ref=e198]: 🏅 Challenges & Badges
                  - generic [ref=e199]: Challenge goals and badges now share one achievement wall using the same badge layout.
                - generic [ref=e200]: 0/100
              - generic [ref=e201]:
                - generic [ref=e203]:
                  - generic [ref=e204]: 👗
                  - generic [ref=e205]:
                    - generic [ref=e207]:
                      - generic [ref=e208]: Thrift Hunter
                      - generic [ref=e209]: Challenge
                    - generic [ref=e210]:
                      - generic [ref=e211]: Not Started
                      - button "View all levels for Thrift Hunter" [ref=e213] [cursor=pointer]: ⓘ
                    - generic [ref=e214]: Score treasures at 3 thrift stores.
                    - generic [ref=e215]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e217]:
                      - text: 0/1 visits →
                      - strong [ref=e218]: L1 Rookie
                    - generic [ref=e220]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 thrift" [ref=e221]':
                        - generic [ref=e222]: L1
                        - generic [ref=e223]: Rookie
                        - generic [ref=e224]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 thrift" [ref=e225]':
                        - generic [ref=e226]: L2
                        - generic [ref=e227]: Novice
                        - generic [ref=e228]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 thrift" [ref=e229]':
                        - generic [ref=e230]: L3
                        - generic [ref=e231]: Semi-Pro
                        - generic [ref=e232]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 thrift" [ref=e233]':
                        - generic [ref=e234]: L4
                        - generic [ref=e235]: Pro
                        - generic [ref=e236]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ thrift" [ref=e237]':
                        - generic [ref=e238]: L5
                        - generic [ref=e239]: MVP
                        - generic [ref=e240]: 🔒
                    - generic [ref=e241]:
                      - button "−" [ref=e242] [cursor=pointer]
                      - button "+ Log" [ref=e243] [cursor=pointer]
                - generic [ref=e245]:
                  - generic [ref=e246]: 🛍️
                  - generic [ref=e247]:
                    - generic [ref=e249]:
                      - generic [ref=e250]: Bargain Blitz
                      - generic [ref=e251]: Challenge
                    - generic [ref=e252]:
                      - generic [ref=e253]: Not Started
                      - button "View all levels for Bargain Blitz" [ref=e255] [cursor=pointer]: ⓘ
                    - generic [ref=e256]: Hit 3 bargain discount stores.
                    - generic [ref=e257]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e259]:
                      - text: 0/1 visits →
                      - strong [ref=e260]: L1 Rookie
                    - generic [ref=e262]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 bargain" [ref=e263]':
                        - generic [ref=e264]: L1
                        - generic [ref=e265]: Rookie
                        - generic [ref=e266]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 bargain" [ref=e267]':
                        - generic [ref=e268]: L2
                        - generic [ref=e269]: Novice
                        - generic [ref=e270]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 bargain" [ref=e271]':
                        - generic [ref=e272]: L3
                        - generic [ref=e273]: Semi-Pro
                        - generic [ref=e274]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 bargain" [ref=e275]':
                        - generic [ref=e276]: L4
                        - generic [ref=e277]: Pro
                        - generic [ref=e278]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ bargain" [ref=e279]':
                        - generic [ref=e280]: L5
                        - generic [ref=e281]: MVP
                        - generic [ref=e282]: 🔒
                    - generic [ref=e283]:
                      - button "−" [ref=e284] [cursor=pointer]
                      - button "+ Log" [ref=e285] [cursor=pointer]
                - generic [ref=e287]:
                  - generic [ref=e288]: 🛒
                  - generic [ref=e289]:
                    - generic [ref=e291]:
                      - generic [ref=e292]: Grocery Tour
                      - generic [ref=e293]: Challenge
                    - generic [ref=e294]:
                      - generic [ref=e295]: Not Started
                      - button "View all levels for Grocery Tour" [ref=e297] [cursor=pointer]: ⓘ
                    - generic [ref=e298]: Shop at 4 different grocery chains.
                    - generic [ref=e299]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e301]:
                      - text: 0/1 visits →
                      - strong [ref=e302]: L1 Rookie
                    - generic [ref=e304]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 grocery" [ref=e305]':
                        - generic [ref=e306]: L1
                        - generic [ref=e307]: Rookie
                        - generic [ref=e308]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 grocery" [ref=e309]':
                        - generic [ref=e310]: L2
                        - generic [ref=e311]: Novice
                        - generic [ref=e312]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 grocery" [ref=e313]':
                        - generic [ref=e314]: L3
                        - generic [ref=e315]: Semi-Pro
                        - generic [ref=e316]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 grocery" [ref=e317]':
                        - generic [ref=e318]: L4
                        - generic [ref=e319]: Pro
                        - generic [ref=e320]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ grocery" [ref=e321]':
                        - generic [ref=e322]: L5
                        - generic [ref=e323]: MVP
                        - generic [ref=e324]: 🔒
                    - generic [ref=e325]:
                      - button "−" [ref=e326] [cursor=pointer]
                      - button "+ Log" [ref=e327] [cursor=pointer]
                - generic [ref=e329]:
                  - generic [ref=e330]: 🏷️
                  - generic [ref=e331]:
                    - generic [ref=e333]:
                      - generic [ref=e334]: Flea Market Find
                      - generic [ref=e335]: Challenge
                    - generic [ref=e336]:
                      - generic [ref=e337]: Not Started
                      - button "View all levels for Flea Market Find" [ref=e339] [cursor=pointer]: ⓘ
                    - generic [ref=e340]: Explore a flea market.
                    - generic [ref=e341]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e343]:
                      - text: 0/1 visits →
                      - strong [ref=e344]: L1 Rookie
                    - generic [ref=e346]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 flea" [ref=e347]':
                        - generic [ref=e348]: L1
                        - generic [ref=e349]: Rookie
                        - generic [ref=e350]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 flea" [ref=e351]':
                        - generic [ref=e352]: L2
                        - generic [ref=e353]: Novice
                        - generic [ref=e354]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 flea" [ref=e355]':
                        - generic [ref=e356]: L3
                        - generic [ref=e357]: Semi-Pro
                        - generic [ref=e358]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 flea" [ref=e359]':
                        - generic [ref=e360]: L4
                        - generic [ref=e361]: Pro
                        - generic [ref=e362]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ flea" [ref=e363]':
                        - generic [ref=e364]: L5
                        - generic [ref=e365]: MVP
                        - generic [ref=e366]: 🔒
                    - generic [ref=e367]:
                      - button "−" [ref=e368] [cursor=pointer]
                      - button "+ Log" [ref=e369] [cursor=pointer]
                - generic [ref=e371]:
                  - generic [ref=e372]: 🏺
                  - generic [ref=e373]:
                    - generic [ref=e375]:
                      - generic [ref=e376]: Antique Explorer
                      - generic [ref=e377]: Challenge
                    - generic [ref=e378]:
                      - generic [ref=e379]: Not Started
                      - button "View all levels for Antique Explorer" [ref=e381] [cursor=pointer]: ⓘ
                    - generic [ref=e382]: Browse 2 antiques malls.
                    - generic [ref=e383]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e385]:
                      - text: 0/1 visits →
                      - strong [ref=e386]: L1 Rookie
                    - generic [ref=e388]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 antiques" [ref=e389]':
                        - generic [ref=e390]: L1
                        - generic [ref=e391]: Rookie
                        - generic [ref=e392]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 antiques" [ref=e393]':
                        - generic [ref=e394]: L2
                        - generic [ref=e395]: Novice
                        - generic [ref=e396]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 antiques" [ref=e397]':
                        - generic [ref=e398]: L3
                        - generic [ref=e399]: Semi-Pro
                        - generic [ref=e400]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 antiques" [ref=e401]':
                        - generic [ref=e402]: L4
                        - generic [ref=e403]: Pro
                        - generic [ref=e404]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ antiques" [ref=e405]':
                        - generic [ref=e406]: L5
                        - generic [ref=e407]: MVP
                        - generic [ref=e408]: 🔒
                    - generic [ref=e409]:
                      - button "−" [ref=e410] [cursor=pointer]
                      - button "+ Log" [ref=e411] [cursor=pointer]
                - generic [ref=e413]:
                  - generic [ref=e414]: 🖼️
                  - generic [ref=e415]:
                    - generic [ref=e417]:
                      - generic [ref=e418]: Art Patron
                      - generic [ref=e419]: Challenge
                    - generic [ref=e420]:
                      - generic [ref=e421]: Not Started
                      - button "View all levels for Art Patron" [ref=e423] [cursor=pointer]: ⓘ
                    - generic [ref=e424]: Support local art or pottery studio.
                    - generic [ref=e425]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e427]:
                      - text: 0/1 visits →
                      - strong [ref=e428]: L1 Rookie
                    - generic [ref=e430]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 art" [ref=e431]':
                        - generic [ref=e432]: L1
                        - generic [ref=e433]: Rookie
                        - generic [ref=e434]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 art" [ref=e435]':
                        - generic [ref=e436]: L2
                        - generic [ref=e437]: Novice
                        - generic [ref=e438]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 art" [ref=e439]':
                        - generic [ref=e440]: L3
                        - generic [ref=e441]: Semi-Pro
                        - generic [ref=e442]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 art" [ref=e443]':
                        - generic [ref=e444]: L4
                        - generic [ref=e445]: Pro
                        - generic [ref=e446]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ art" [ref=e447]':
                        - generic [ref=e448]: L5
                        - generic [ref=e449]: MVP
                        - generic [ref=e450]: 🔒
                    - generic [ref=e451]:
                      - button "−" [ref=e452] [cursor=pointer]
                      - button "+ Log" [ref=e453] [cursor=pointer]
                - generic [ref=e455]:
                  - generic [ref=e456]: 🎨
                  - generic [ref=e457]:
                    - generic [ref=e459]:
                      - generic [ref=e460]: Craft Lover
                      - generic [ref=e461]: Challenge
                    - generic [ref=e462]:
                      - generic [ref=e463]: Not Started
                      - button "View all levels for Craft Lover" [ref=e465] [cursor=pointer]: ⓘ
                    - generic [ref=e466]: Browse 2 craft malls.
                    - generic [ref=e467]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e469]:
                      - text: 0/1 visits →
                      - strong [ref=e470]: L1 Rookie
                    - generic [ref=e472]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 crafts" [ref=e473]':
                        - generic [ref=e474]: L1
                        - generic [ref=e475]: Rookie
                        - generic [ref=e476]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 crafts" [ref=e477]':
                        - generic [ref=e478]: L2
                        - generic [ref=e479]: Novice
                        - generic [ref=e480]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 crafts" [ref=e481]':
                        - generic [ref=e482]: L3
                        - generic [ref=e483]: Semi-Pro
                        - generic [ref=e484]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 crafts" [ref=e485]':
                        - generic [ref=e486]: L4
                        - generic [ref=e487]: Pro
                        - generic [ref=e488]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ crafts" [ref=e489]':
                        - generic [ref=e490]: L5
                        - generic [ref=e491]: MVP
                        - generic [ref=e492]: 🔒
                    - generic [ref=e493]:
                      - button "−" [ref=e494] [cursor=pointer]
                      - button "+ Log" [ref=e495] [cursor=pointer]
                - generic [ref=e497]:
                  - generic [ref=e498]: 🥡
                  - generic [ref=e499]:
                    - generic [ref=e501]:
                      - generic [ref=e502]: World Market
                      - generic [ref=e503]: Challenge
                    - generic [ref=e504]:
                      - generic [ref=e505]: Not Started
                      - button "View all levels for World Market" [ref=e507] [cursor=pointer]: ⓘ
                    - generic [ref=e508]: Shop at an Asian or Mexican market.
                    - generic [ref=e509]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e511]:
                      - text: 0/1 visits →
                      - strong [ref=e512]: L1 Rookie
                    - generic [ref=e514]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 specialty" [ref=e515]':
                        - generic [ref=e516]: L1
                        - generic [ref=e517]: Rookie
                        - generic [ref=e518]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 specialty" [ref=e519]':
                        - generic [ref=e520]: L2
                        - generic [ref=e521]: Novice
                        - generic [ref=e522]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 specialty" [ref=e523]':
                        - generic [ref=e524]: L3
                        - generic [ref=e525]: Semi-Pro
                        - generic [ref=e526]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 specialty" [ref=e527]':
                        - generic [ref=e528]: L4
                        - generic [ref=e529]: Pro
                        - generic [ref=e530]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ specialty" [ref=e531]':
                        - generic [ref=e532]: L5
                        - generic [ref=e533]: MVP
                        - generic [ref=e534]: 🔒
                    - generic [ref=e535]:
                      - button "−" [ref=e536] [cursor=pointer]
                      - button "+ Log" [ref=e537] [cursor=pointer]
                - generic [ref=e539]:
                  - generic [ref=e540]: 🐾
                  - generic [ref=e541]:
                    - generic [ref=e543]:
                      - generic [ref=e544]: Pet Lover
                      - generic [ref=e545]: Challenge
                    - generic [ref=e546]:
                      - generic [ref=e547]: Not Started
                      - button "View all levels for Pet Lover" [ref=e549] [cursor=pointer]: ⓘ
                    - generic [ref=e550]: Visit a pet store.
                    - generic [ref=e551]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e553]:
                      - text: 0/1 visits →
                      - strong [ref=e554]: L1 Rookie
                    - generic [ref=e556]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 pet" [ref=e557]':
                        - generic [ref=e558]: L1
                        - generic [ref=e559]: Rookie
                        - generic [ref=e560]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 pet" [ref=e561]':
                        - generic [ref=e562]: L2
                        - generic [ref=e563]: Novice
                        - generic [ref=e564]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 pet" [ref=e565]':
                        - generic [ref=e566]: L3
                        - generic [ref=e567]: Semi-Pro
                        - generic [ref=e568]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 pet" [ref=e569]':
                        - generic [ref=e570]: L4
                        - generic [ref=e571]: Pro
                        - generic [ref=e572]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ pet" [ref=e573]':
                        - generic [ref=e574]: L5
                        - generic [ref=e575]: MVP
                        - generic [ref=e576]: 🔒
                    - generic [ref=e577]:
                      - button "−" [ref=e578] [cursor=pointer]
                      - button "+ Log" [ref=e579] [cursor=pointer]
                - generic [ref=e581]:
                  - generic [ref=e582]: 🏪
                  - generic [ref=e583]:
                    - generic [ref=e585]:
                      - generic [ref=e586]: Mall Day
                      - generic [ref=e587]: Challenge
                    - generic [ref=e588]:
                      - generic [ref=e589]: Not Started
                      - button "View all levels for Mall Day" [ref=e591] [cursor=pointer]: ⓘ
                    - generic [ref=e592]: Spend a day at a shopping mall.
                    - generic [ref=e593]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e595]:
                      - text: 0/1 visits →
                      - strong [ref=e596]: L1 Rookie
                    - generic [ref=e598]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 mall" [ref=e599]':
                        - generic [ref=e600]: L1
                        - generic [ref=e601]: Rookie
                        - generic [ref=e602]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 mall" [ref=e603]':
                        - generic [ref=e604]: L2
                        - generic [ref=e605]: Novice
                        - generic [ref=e606]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 mall" [ref=e607]':
                        - generic [ref=e608]: L3
                        - generic [ref=e609]: Semi-Pro
                        - generic [ref=e610]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 mall" [ref=e611]':
                        - generic [ref=e612]: L4
                        - generic [ref=e613]: Pro
                        - generic [ref=e614]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ mall" [ref=e615]':
                        - generic [ref=e616]: L5
                        - generic [ref=e617]: MVP
                        - generic [ref=e618]: 🔒
                    - generic [ref=e619]:
                      - button "−" [ref=e620] [cursor=pointer]
                      - button "+ Log" [ref=e621] [cursor=pointer]
                - generic [ref=e623]:
                  - generic [ref=e624]: 🔒
                  - generic [ref=e625]:
                    - generic [ref=e627]:
                      - generic [ref=e628]: Bargain Hunter
                      - generic [ref=e629]: Common
                    - generic [ref=e630]:
                      - generic [ref=e631]: Not Started
                      - button "View all levels for Bargain Hunter" [ref=e633] [cursor=pointer]: ⓘ
                    - generic [ref=e635]:
                      - text: 0/1 thrift & consignment →
                      - strong [ref=e636]: L1 Rookie
                - generic [ref=e639]:
                  - generic [ref=e640]: 🔒
                  - generic [ref=e641]:
                    - generic [ref=e643]:
                      - generic [ref=e644]: Antique Collector
                      - generic [ref=e645]: Rare
                    - generic [ref=e646]:
                      - generic [ref=e647]: Not Started
                      - button "View all levels for Antique Collector" [ref=e649] [cursor=pointer]: ⓘ
                    - generic [ref=e651]:
                      - text: 0/1 antiques malls →
                      - strong [ref=e652]: L1 Rookie
                - generic [ref=e655]:
                  - generic [ref=e656]: 🔒
                  - generic [ref=e657]:
                    - generic [ref=e659]:
                      - generic [ref=e660]: Art Patron
                      - generic [ref=e661]: Rare
                    - generic [ref=e662]:
                      - generic [ref=e663]: Not Started
                      - button "View all levels for Art Patron" [ref=e665] [cursor=pointer]: ⓘ
                    - generic [ref=e667]:
                      - text: 0/1 local art & pottery →
                      - strong [ref=e668]: L1 Rookie
                - generic [ref=e671]:
                  - generic [ref=e672]: 🔒
                  - generic [ref=e673]:
                    - generic [ref=e675]:
                      - generic [ref=e676]: World Market
                      - generic [ref=e677]: Rare
                    - generic [ref=e678]:
                      - generic [ref=e679]: Not Started
                      - button "View all levels for World Market" [ref=e681] [cursor=pointer]: ⓘ
                    - generic [ref=e683]:
                      - text: 0/1 specialty markets →
                      - strong [ref=e684]: L1 Rookie
                - generic [ref=e687]:
                  - generic [ref=e688]: 🔒
                  - generic [ref=e689]:
                    - generic [ref=e691]:
                      - generic [ref=e692]: Home Improver
                      - generic [ref=e693]: Common
                    - generic [ref=e694]:
                      - generic [ref=e695]: Not Started
                      - button "View all levels for Home Improver" [ref=e697] [cursor=pointer]: ⓘ
                    - generic [ref=e699]:
                      - text: 0/1 home & improvement →
                      - strong [ref=e700]: L1 Rookie
                - generic [ref=e703]:
                  - generic [ref=e704]: 🔒
                  - generic [ref=e705]:
                    - generic [ref=e707]:
                      - generic [ref=e708]: Animal Friend
                      - generic [ref=e709]: Common
                    - generic [ref=e710]:
                      - generic [ref=e711]: Not Started
                      - button "View all levels for Animal Friend" [ref=e713] [cursor=pointer]: ⓘ
                    - generic [ref=e715]:
                      - text: 0/1 pet stores →
                      - strong [ref=e716]: L1 Rookie
                - generic [ref=e719]:
                  - generic [ref=e720]: 🔒
                  - generic [ref=e721]:
                    - generic [ref=e723]:
                      - generic [ref=e724]: Craft Lover
                      - generic [ref=e725]: Rare
                    - generic [ref=e726]:
                      - generic [ref=e727]: Not Started
                      - button "View all levels for Craft Lover" [ref=e729] [cursor=pointer]: ⓘ
                    - generic [ref=e731]:
                      - text: 0/1 craft malls →
                      - strong [ref=e732]: L1 Rookie
                - generic [ref=e735]:
                  - generic [ref=e736]: 🔒
                  - generic [ref=e737]:
                    - generic [ref=e739]:
                      - generic [ref=e740]: Grocery Explorer
                      - generic [ref=e741]: Epic
                    - generic [ref=e742]:
                      - generic [ref=e743]: Not Started
                      - button "View all levels for Grocery Explorer" [ref=e745] [cursor=pointer]: ⓘ
                    - generic [ref=e747]:
                      - text: 0/1 grocery stores →
                      - strong [ref=e748]: L1 Rookie
                - generic [ref=e751]:
                  - generic [ref=e752]: 🔒
                  - generic [ref=e753]:
                    - generic [ref=e755]:
                      - generic [ref=e756]: Market Maven
                      - generic [ref=e757]: Rare
                    - generic [ref=e758]:
                      - generic [ref=e759]: Not Started
                      - button "View all levels for Market Maven" [ref=e761] [cursor=pointer]: ⓘ
                    - generic [ref=e763]:
                      - text: 0/1 flea markets →
                      - strong [ref=e764]: L1 Rookie
                - generic [ref=e767]:
                  - generic [ref=e768]: 🔒
                  - generic [ref=e769]:
                    - generic [ref=e771]:
                      - generic [ref=e772]: Retail Royalty
                      - generic [ref=e773]: Legendary
                    - generic [ref=e774]:
                      - generic [ref=e775]: Not Started
                      - button "View all levels for Retail Royalty" [ref=e777] [cursor=pointer]: ⓘ
                    - generic [ref=e779]:
                      - text: 0/1 total visits →
                      - strong [ref=e780]: L1 Rookie
            - generic [ref=e782]:
              - generic [ref=e784]:
                - generic [ref=e785]: 📚 Seasonal Quests
                - generic [ref=e786]: Multi-step seasonal goals for Retail.
              - generic [ref=e787]:
                - generic [ref=e788]:
                  - generic [ref=e789]: 🌸 Spring Now
                  - generic [ref=e790]: Spring Finds
                  - generic [ref=e791]: 0/3 steps
                  - generic [ref=e792]:
                    - generic [ref=e793]:
                      - generic [ref=e794]: ○
                      - generic [ref=e795]: Flea market visit
                      - generic [ref=e796]: Auto
                    - generic [ref=e797]:
                      - generic [ref=e798]: ○
                      - generic [ref=e799]: Local art or pottery shop
                      - generic [ref=e800]: Auto
                    - generic [ref=e801]:
                      - generic [ref=e802]: ○
                      - generic [ref=e803]: Asian or specialty market
                      - generic [ref=e804]: Auto
                - generic [ref=e805]:
                  - generic [ref=e806]: ☀️ Summer
                  - generic [ref=e807]: Summer Shopping
                  - generic [ref=e808]: 0/3 steps
                  - generic [ref=e809]:
                    - generic [ref=e810]:
                      - generic [ref=e811]: ○
                      - generic [ref=e812]: 2 specialty market visits
                      - generic [ref=e813]: Auto
                    - generic [ref=e814]:
                      - generic [ref=e815]: ○
                      - generic [ref=e816]: Bike shop stop
                      - generic [ref=e817]: Auto
                    - generic [ref=e818]:
                      - generic [ref=e819]: ○
                      - generic [ref=e820]: Shopping mall day
                      - generic [ref=e821]: Auto
                - generic [ref=e822]:
                  - generic [ref=e823]: 🍂 Fall
                  - generic [ref=e824]: Fall Hunting
                  - generic [ref=e825]: 0/3 steps
                  - generic [ref=e826]:
                    - generic [ref=e827]:
                      - generic [ref=e828]: ○
                      - generic [ref=e829]: Antiques mall browse
                      - generic [ref=e830]: Auto
                    - generic [ref=e831]:
                      - generic [ref=e832]: ○
                      - generic [ref=e833]: Craft mall visit
                      - generic [ref=e834]: Auto
                    - generic [ref=e835]:
                      - generic [ref=e836]: ○
                      - generic [ref=e837]: 3 different grocery stores
                      - generic [ref=e838]: Auto
                - generic [ref=e839]:
                  - generic [ref=e840]: ❄️ Winter
                  - generic [ref=e841]: Winter Deals
                  - generic [ref=e842]: 0/3 steps
                  - generic [ref=e843]:
                    - generic [ref=e844]:
                      - generic [ref=e845]: ○
                      - generic [ref=e846]: 3 thrift or bargain stores
                      - generic [ref=e847]: Auto
                    - generic [ref=e848]:
                      - generic [ref=e849]: ○
                      - generic [ref=e850]: HomeGoods or home store
                      - generic [ref=e851]: Auto
                    - generic [ref=e852]:
                      - generic [ref=e853]: ○
                      - generic [ref=e854]: Pet store visit
                      - generic [ref=e855]: Auto
            - generic [ref=e856]:
              - generic [ref=e857]:
                - generic [ref=e858]:
                  - generic [ref=e859]: 🟩 Retail Bingo
                  - generic [ref=e860]: Auto-synced from your logged visits. Complete a row, column, or diagonal for BINGO!
                - generic [ref=e861]: 0/9
              - generic [ref=e862]:
                - generic "Thrift Store not completed" [ref=e863] [cursor=pointer]:
                  - generic [ref=e864]: 👗
                  - generic [ref=e865]: Thrift Store
                - generic "Flea Market not completed" [ref=e866] [cursor=pointer]:
                  - generic [ref=e867]: 🏷️
                  - generic [ref=e868]: Flea Market
                - generic "Asian Market not completed" [ref=e869] [cursor=pointer]:
                  - generic [ref=e870]: 🥡
                  - generic [ref=e871]: Asian Market
                - generic "Antiques Mall not completed" [ref=e872] [cursor=pointer]:
                  - generic [ref=e873]: 🏺
                  - generic [ref=e874]: Antiques Mall
                - generic "Local Art not completed" [ref=e875] [cursor=pointer]:
                  - generic [ref=e876]: 🖼️
                  - generic [ref=e877]: Local Art
                - generic "Craft Mall not completed" [ref=e878] [cursor=pointer]:
                  - generic [ref=e879]: 🎨
                  - generic [ref=e880]: Craft Mall
                - generic "Bargain Store not completed" [ref=e881] [cursor=pointer]:
                  - generic [ref=e882]: 🛍️
                  - generic [ref=e883]: Bargain Store
                - generic "Pet Store not completed" [ref=e884] [cursor=pointer]:
                  - generic [ref=e885]: 🐾
                  - generic [ref=e886]: Pet Store
                - generic "Shopping Mall not completed" [ref=e887] [cursor=pointer]:
                  - generic [ref=e888]: 🏪
                  - generic [ref=e889]: Shopping Mall
              - generic [ref=e890]: 0/9 tiles marked
        - group "🧰 Diagnostics, Sync and Clean Up" [ref=e891]:
          - generic "🧰 Diagnostics, Sync and Clean Up Sync health, local queue visibility, and visited tracker diagnostics. ▾" [ref=e892] [cursor=pointer]:
            - generic [ref=e893]:
              - generic [ref=e894]: 🧰 Diagnostics, Sync and Clean Up
              - generic [ref=e895]: Sync health, local queue visibility, and visited tracker diagnostics.
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