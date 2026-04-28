# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: edit-mode-search-candidates.spec.js >> Edit Mode single-add candidate search >> updates bulk selected-candidate banner to a completed message after the add finishes
- Location: tests/edit-mode-search-candidates.spec.js:268:3

# Error details

```
Error: Unexpected browser errors detected:
1. [console] Failed to load resource: the server responded with a status of 400 () (https://places.googleapis.com/$rpc/google.maps.places.v1.Places/GetPlace)
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic "Click to expand/collapse errors" [ref=e3] [cursor=pointer]:
      - generic [ref=e4]:
        - generic [ref=e5]: ⚠️ Errors Detected
        - generic [ref=e6]: "1"
        - generic [ref=e7]: "Overlay: OK"
      - generic [ref=e8]: ▼
    - generic [ref=e9]:
      - generic [ref=e10]:
        - button "Errors (0)" [ref=e11] [cursor=pointer]
        - button "Warnings (1)" [ref=e12] [cursor=pointer]
        - button "Debug Flow (100)" [ref=e13] [cursor=pointer]
      - generic [ref=e15]: No errors captured.
      - generic [ref=e16]:
        - button "📋 Copy All Issues" [ref=e17] [cursor=pointer]
        - button "🗑️ Clear All Issues" [ref=e18] [cursor=pointer]
  - generic "Click to expand/collapse" [ref=e20] [cursor=pointer]:
    - generic [ref=e21]:
      - text: 🔧 Advanced Debug Console
      - generic [ref=e22]: "Startup timing: interactive 120 ms | overlay off 472 ms"
      - generic [ref=e23]: "Reliability: blocked 0 | overlays 0 | recoveries 0 | errors 0"
    - generic [ref=e24]:
      - button "📋 Copy All" [ref=e25]
      - button "🔗 Copy Card Bundle" [ref=e26]
      - button "🗑️ Clear" [ref=e27]
      - button "↓ Minimize" [ref=e28]
  - banner [ref=e29]:
    - generic [ref=e30]:
      - generic [ref=e31]: Kyle’s Adventure Finder
      - generic [ref=e32]: Powered by Excel, enhanced with Google data and mobile-friendly design.
    - generic [ref=e33]:
      - generic [ref=e34]:
        - button "🔄 Reload App" [ref=e35] [cursor=pointer]
        - button "📝 Edit Mode" [ref=e36] [cursor=pointer]
        - button "📴 Offline Mode" [ref=e37] [cursor=pointer]
        - button "💾 App Backup" [ref=e38] [cursor=pointer]
        - button "🩺 Diagnostics" [ref=e39] [cursor=pointer]
        - button "📺 TV Mode" [ref=e40] [cursor=pointer]
        - button "📱 iPhone View" [ref=e41] [cursor=pointer]
        - generic [ref=e42]:
          - generic [ref=e43]: All Changes Synced
          - button "Retry Sync" [disabled]
        - button "Sign In" [ref=e44] [cursor=pointer]
        - button "Sign In via Device" [ref=e45] [cursor=pointer]
      - generic [ref=e46]: Not signed in
  - status [ref=e47]:
    - generic [ref=e48]: "🔐 Sign in required: connect your Microsoft account to load Excel data and use core app features."
    - button "Sign In Now" [ref=e49] [cursor=pointer]
  - status [ref=e50]:
    - generic [ref=e51]:
      - generic [ref=e52]:
        - generic [ref=e53]: 🩺 Workbook row patch diagnostics
        - generic [ref=e54]: Workbook row PATCH saved, but fresh-session verification was inconclusive.
        - generic [ref=e55]: "Description header resolved to: \"Description\" at index 0 • Legacy description index 16 value updated: no"
        - generic [ref=e56]: table=General_Entertainment • path=Copilot_Apps/Kyles_Adventure_Finder/Entertainment_Locations.xlsx • row=itemAt(index=2) • phase=saved-unverified
      - generic [ref=e57]:
        - button "📖 Open full diagnostics" [ref=e58] [cursor=pointer]
        - button "📋 Copy" [ref=e59] [cursor=pointer]
        - button "🗑️ Clear" [ref=e60] [cursor=pointer]
    - generic [ref=e61]:
      - generic [ref=e62]:
        - generic [ref=e63]:
          - generic [ref=e64]: 2:44:55 PM
          - generic [ref=e65]: WARN
        - generic [ref=e66]: Workbook row PATCH saved, but fresh-session verification was inconclusive.
        - generic [ref=e67]: "Description header resolved to: \"Description\" at index 0 • Legacy description index 16 value updated: no"
        - generic [ref=e68]:
          - text: table=General_Entertainment • path=Copilot_Apps/Kyles_Adventure_Finder/Entertainment_Locations.xlsx • row=itemAt(index=2) • phase=saved-unverified
          - text: values=11 • inSession=no • freshSession=no • freshAttempts=3 • description="Description"@0 • legacy16Updated=no url=https://graph.microsoft.com/v1.0/me/drive/root:/Copilot_Apps/Kyles_Adventure_Finder/Entertainment_Locations.xlsx:/workbook/tables/General_Entertainment/rows/itemAt(index=2)
      - generic [ref=e69]:
        - generic [ref=e70]:
          - generic [ref=e71]: 2:44:54 PM
          - generic [ref=e72]: INFO
        - generic [ref=e73]: Attempting workbook row PATCH…
        - generic [ref=e74]: "Description header resolved to: \"Description\" at index 0 • Legacy description index 16 value updated: no"
        - generic [ref=e75]:
          - text: table=General_Entertainment • path=Copilot_Apps/Kyles_Adventure_Finder/Entertainment_Locations.xlsx • row=itemAt(index=2) • phase=attempt
          - text: candidate 1/1 • values=11 • persistChanges=session-unavailable • description="Description"@0 • legacy16Updated=no url=https://graph.microsoft.com/v1.0/me/drive/root:/Copilot_Apps/Kyles_Adventure_Finder/Entertainment_Locations.xlsx:/workbook/tables/General_Entertainment/rows/itemAt(index=2)
      - generic [ref=e76]:
        - generic [ref=e77]:
          - generic [ref=e78]: 2:44:54 PM
          - generic [ref=e79]: WARN
        - generic [ref=e80]: Workbook row PATCH saved, but fresh-session verification was inconclusive.
        - generic [ref=e81]: "Description header resolved to: \"Description\" at index 0 • Legacy description index 16 value updated: no"
        - generic [ref=e82]:
          - text: table=General_Entertainment • path=Copilot_Apps/Kyles_Adventure_Finder/Entertainment_Locations.xlsx • row=itemAt(index=1) • phase=saved-unverified
          - text: values=11 • inSession=no • freshSession=no • freshAttempts=3 • description="Description"@0 • legacy16Updated=no url=https://graph.microsoft.com/v1.0/me/drive/root:/Copilot_Apps/Kyles_Adventure_Finder/Entertainment_Locations.xlsx:/workbook/tables/General_Entertainment/rows/itemAt(index=1)
      - generic [ref=e83]:
        - generic [ref=e84]:
          - generic [ref=e85]: 2:44:54 PM
          - generic [ref=e86]: INFO
        - generic [ref=e87]: Attempting workbook row PATCH…
        - generic [ref=e88]: "Description header resolved to: \"Description\" at index 0 • Legacy description index 16 value updated: no"
        - generic [ref=e89]:
          - text: table=General_Entertainment • path=Copilot_Apps/Kyles_Adventure_Finder/Entertainment_Locations.xlsx • row=itemAt(index=1) • phase=attempt
          - text: candidate 1/1 • values=11 • persistChanges=session-unavailable • description="Description"@0 • legacy16Updated=no url=https://graph.microsoft.com/v1.0/me/drive/root:/Copilot_Apps/Kyles_Adventure_Finder/Entertainment_Locations.xlsx:/workbook/tables/General_Entertainment/rows/itemAt(index=1)
  - generic [ref=e90]:
    - generic [ref=e91]:
      - button "🎮 Adventure Challenge" [ref=e92] [cursor=pointer]
      - button "🌿 Nature Challenge" [ref=e93] [cursor=pointer]
      - button "🏔️ Adventure Planner" [ref=e94] [cursor=pointer]
      - button "🧰 Household Tools" [ref=e95] [cursor=pointer]
      - button "🐦 Birding Locations" [ref=e96] [cursor=pointer]
      - button "🚴 Bike Trails" [ref=e97] [cursor=pointer]
    - tablist "Adventure Challenge categories" [ref=e101]:
      - tab "Open Outdoors section" [selected] [ref=e102] [cursor=pointer]: 🌲 Outdoors
      - tab "Open Entertainment section" [ref=e103] [cursor=pointer]: 🎬 Entertainment
      - tab "Open Food and Drink section" [ref=e104] [cursor=pointer]: 🍽️ Food & Drink
      - tab "Open Retail section" [ref=e105] [cursor=pointer]: 🛍️ Retail
      - tab "Open Wildlife and Animals section" [ref=e106] [cursor=pointer]: 🦌 Wildlife & Animals
      - tab "Open Regional Festivals section" [ref=e107] [cursor=pointer]: 🎉 Regional Festivals
      - tab "Open Bike Trails section" [ref=e108] [cursor=pointer]: 🚴 Bike Trails
    - generic [ref=e109]:
      - text: ▾
      - generic [ref=e111]:
        - generic [ref=e112]:
          - heading "Adventure Challenge - Outdoors" [level=1] [ref=e113]
          - navigation "Jump to section links" [ref=e114]:
            - generic [ref=e115]: "Jump to section:"
            - button "📊 Category Progression" [ref=e116] [cursor=pointer]
            - button "🏅 Challenges & Badges" [ref=e117] [cursor=pointer]
            - button "📚 Seasonal Quests" [ref=e118] [cursor=pointer]
            - button "🟩 Outdoors Bingo" [ref=e119] [cursor=pointer]
            - button "🧰 Diagnostics, Sync and Clean Up" [ref=e120] [cursor=pointer]
        - generic [ref=e121]: 🌲 Outdoors section active
        - tabpanel "Open Outdoors section" [ref=e122]:
          - generic [ref=e123]:
            - generic [ref=e124]:
              - generic [ref=e125]: 🌲 Outdoors
              - generic [ref=e126]: Browse and plan outdoor locations you want to visit.
            - generic [ref=e127]:
              - generic [ref=e128]: "Outdoors data: ready 0 locations | Source: Nature_Locations.xlsx / Nature_Locations Updated 4/28/2026, 2:44:51 PM"
              - generic [ref=e129]:
                - button "🔎 Explore Outdoors" [ref=e130] [cursor=pointer]
                - button "🏙️ City Explorer" [ref=e131] [cursor=pointer]:
                  - text: 🏙️ City Explorer
                  - generic: i
                - button "Log a Visit" [ref=e132] [cursor=pointer]
                - button "📝 Edit Mode" [ref=e133] [cursor=pointer]
                - button "🏷️ Batch Tags" [ref=e134] [cursor=pointer]:
                  - text: 🏷️ Batch Tags
                  - generic: i
                - button "Refresh Data" [ref=e135] [cursor=pointer]
                - button "↶ Undo" [disabled] [ref=e136] [cursor=pointer]
          - generic [ref=e137]:
            - generic [ref=e138]:
              - generic [ref=e140]:
                - generic [ref=e141]: 📊 Category Progression
                - generic [ref=e142]:
                  - text: "Track your Outdoors visits by category. Total logged:"
                  - strong [ref=e143]: "0"
                  - text: .
                  - button "Log Visit" [ref=e144] [cursor=pointer]
              - generic [ref=e145]:
                - generic [ref=e146]:
                  - generic [ref=e147]: 🥾
                  - generic [ref=e148]: Trailheads
                  - generic [ref=e149]: 0 / 0
                  - generic [ref=e150]: 0% complete
                  - generic [ref=e153]: Auto-tracked from visit logs
                - generic [ref=e154]:
                  - generic [ref=e155]: 💧
                  - generic [ref=e156]: Waterfalls
                  - generic [ref=e157]: 0 / 0
                  - generic [ref=e158]: 0% complete
                  - generic [ref=e161]: Auto-tracked from visit logs
                - generic [ref=e162]:
                  - generic [ref=e163]: 🏔️
                  - generic [ref=e164]: Scenic Overlooks
                  - generic [ref=e165]: 0 / 0
                  - generic [ref=e166]: 0% complete
                  - generic [ref=e169]: Auto-tracked from visit logs
                - generic [ref=e170]:
                  - generic [ref=e171]: ⛺
                  - generic [ref=e172]: Campgrounds
                  - generic [ref=e173]: 0 / 0
                  - generic [ref=e174]: 0% complete
                  - generic [ref=e177]: Auto-tracked from visit logs
                - generic [ref=e178]:
                  - generic [ref=e179]: 🌲
                  - generic [ref=e180]: State Parks
                  - generic [ref=e181]: 0 / 0
                  - generic [ref=e182]: 0% complete
                  - generic [ref=e185]: Auto-tracked from visit logs
                - generic [ref=e186]:
                  - generic [ref=e187]: 🏔️
                  - generic [ref=e188]: National Parks
                  - generic [ref=e189]: 0 / 0
                  - generic [ref=e190]: 0% complete
                  - generic [ref=e193]: Auto-tracked from visit logs
                - generic [ref=e194]:
                  - generic [ref=e195]: 🏖️
                  - generic [ref=e196]: Public Beaches
                  - generic [ref=e197]: 0 / 0
                  - generic [ref=e198]: 0% complete
                  - generic [ref=e201]: Auto-tracked from visit logs
                - generic [ref=e202]:
                  - generic [ref=e203]: 🏞️
                  - generic [ref=e204]: Lakes & Ponds
                  - generic [ref=e205]: 0 / 0
                  - generic [ref=e206]: 0% complete
                  - generic [ref=e209]: Auto-tracked from visit logs
                - generic [ref=e210]:
                  - generic [ref=e211]: 🏕️
                  - generic [ref=e212]: Recreation Areas
                  - generic [ref=e213]: 0 / 0
                  - generic [ref=e214]: 0% complete
                  - generic [ref=e217]: Auto-tracked from visit logs
                - generic [ref=e218]:
                  - generic [ref=e219]: 🌺
                  - generic [ref=e220]: Botanical Gardens
                  - generic [ref=e221]: 0 / 0
                  - generic [ref=e222]: 0% complete
                  - generic [ref=e225]: Auto-tracked from visit logs
            - generic [ref=e226]:
              - generic [ref=e227]:
                - generic [ref=e228]:
                  - generic [ref=e229]: 🏅 Challenges & Badges
                  - generic [ref=e230]: Challenge goals and badges now share one achievement wall using the same badge layout.
                - generic [ref=e231]: 0/100
              - generic [ref=e232]:
                - generic [ref=e234]:
                  - generic [ref=e235]: 🥾
                  - generic [ref=e236]:
                    - generic [ref=e238]:
                      - generic [ref=e239]: Trailhead Seeker
                      - generic [ref=e240]: Challenge
                    - generic [ref=e241]:
                      - generic [ref=e242]: Not Started
                      - button "View all levels for Trailhead Seeker" [ref=e244] [cursor=pointer]: ⓘ
                    - generic [ref=e245]: Visit 3 trailheads.
                    - generic [ref=e246]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e248]:
                      - text: 0/1 visits →
                      - strong [ref=e249]: L1 Rookie
                    - generic [ref=e251]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 trailhead" [ref=e252]':
                        - generic [ref=e253]: L1
                        - generic [ref=e254]: Rookie
                        - generic [ref=e255]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 trailhead" [ref=e256]':
                        - generic [ref=e257]: L2
                        - generic [ref=e258]: Novice
                        - generic [ref=e259]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 trailhead" [ref=e260]':
                        - generic [ref=e261]: L3
                        - generic [ref=e262]: Semi-Pro
                        - generic [ref=e263]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 trailhead" [ref=e264]':
                        - generic [ref=e265]: L4
                        - generic [ref=e266]: Pro
                        - generic [ref=e267]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ trailhead" [ref=e268]':
                        - generic [ref=e269]: L5
                        - generic [ref=e270]: MVP
                        - generic [ref=e271]: 🔒
                    - generic [ref=e272]:
                      - button "−" [ref=e273] [cursor=pointer]
                      - button "+ Log" [ref=e274] [cursor=pointer]
                      - button "📍 Qualifying Locations" [ref=e275] [cursor=pointer]
                - generic [ref=e277]:
                  - generic [ref=e278]: 💧
                  - generic [ref=e279]:
                    - generic [ref=e281]:
                      - generic [ref=e282]: Waterfall Hunter
                      - generic [ref=e283]: Challenge
                    - generic [ref=e284]:
                      - generic [ref=e285]: Not Started
                      - button "View all levels for Waterfall Hunter" [ref=e287] [cursor=pointer]: ⓘ
                    - generic [ref=e288]: Discover 3 waterfalls.
                    - generic [ref=e289]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e291]:
                      - text: 0/1 visits →
                      - strong [ref=e292]: L1 Rookie
                    - generic [ref=e294]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 waterfall" [ref=e295]':
                        - generic [ref=e296]: L1
                        - generic [ref=e297]: Rookie
                        - generic [ref=e298]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 waterfall" [ref=e299]':
                        - generic [ref=e300]: L2
                        - generic [ref=e301]: Novice
                        - generic [ref=e302]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 waterfall" [ref=e303]':
                        - generic [ref=e304]: L3
                        - generic [ref=e305]: Semi-Pro
                        - generic [ref=e306]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 waterfall" [ref=e307]':
                        - generic [ref=e308]: L4
                        - generic [ref=e309]: Pro
                        - generic [ref=e310]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ waterfall" [ref=e311]':
                        - generic [ref=e312]: L5
                        - generic [ref=e313]: MVP
                        - generic [ref=e314]: 🔒
                    - generic [ref=e315]:
                      - button "−" [ref=e316] [cursor=pointer]
                      - button "+ Log" [ref=e317] [cursor=pointer]
                      - button "📍 Qualifying Locations" [ref=e318] [cursor=pointer]
                - generic [ref=e320]:
                  - generic [ref=e321]: 🏔️
                  - generic [ref=e322]:
                    - generic [ref=e324]:
                      - generic [ref=e325]: Overlook Explorer
                      - generic [ref=e326]: Challenge
                    - generic [ref=e327]:
                      - generic [ref=e328]: Not Started
                      - button "View all levels for Overlook Explorer" [ref=e330] [cursor=pointer]: ⓘ
                    - generic [ref=e331]: Find 3 scenic overlooks or viewpoints.
                    - generic [ref=e332]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e334]:
                      - text: 0/1 visits →
                      - strong [ref=e335]: L1 Rookie
                    - generic [ref=e337]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 scenic" [ref=e338]':
                        - generic [ref=e339]: L1
                        - generic [ref=e340]: Rookie
                        - generic [ref=e341]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 scenic" [ref=e342]':
                        - generic [ref=e343]: L2
                        - generic [ref=e344]: Novice
                        - generic [ref=e345]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 scenic" [ref=e346]':
                        - generic [ref=e347]: L3
                        - generic [ref=e348]: Semi-Pro
                        - generic [ref=e349]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 scenic" [ref=e350]':
                        - generic [ref=e351]: L4
                        - generic [ref=e352]: Pro
                        - generic [ref=e353]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ scenic" [ref=e354]':
                        - generic [ref=e355]: L5
                        - generic [ref=e356]: MVP
                        - generic [ref=e357]: 🔒
                    - generic [ref=e358]:
                      - button "−" [ref=e359] [cursor=pointer]
                      - button "+ Log" [ref=e360] [cursor=pointer]
                      - button "📍 Qualifying Locations" [ref=e361] [cursor=pointer]
                - generic [ref=e363]:
                  - generic [ref=e364]: ⛺
                  - generic [ref=e365]:
                    - generic [ref=e367]:
                      - generic [ref=e368]: Campfire Nights
                      - generic [ref=e369]: Challenge
                    - generic [ref=e370]:
                      - generic [ref=e371]: Not Started
                      - button "View all levels for Campfire Nights" [ref=e373] [cursor=pointer]: ⓘ
                    - generic [ref=e374]: Camp at 2 campgrounds.
                    - generic [ref=e375]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e377]:
                      - text: 0/1 visits →
                      - strong [ref=e378]: L1 Rookie
                    - generic [ref=e380]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 campground" [ref=e381]':
                        - generic [ref=e382]: L1
                        - generic [ref=e383]: Rookie
                        - generic [ref=e384]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 campground" [ref=e385]':
                        - generic [ref=e386]: L2
                        - generic [ref=e387]: Novice
                        - generic [ref=e388]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 campground" [ref=e389]':
                        - generic [ref=e390]: L3
                        - generic [ref=e391]: Semi-Pro
                        - generic [ref=e392]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 campground" [ref=e393]':
                        - generic [ref=e394]: L4
                        - generic [ref=e395]: Pro
                        - generic [ref=e396]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ campground" [ref=e397]':
                        - generic [ref=e398]: L5
                        - generic [ref=e399]: MVP
                        - generic [ref=e400]: 🔒
                    - generic [ref=e401]:
                      - button "−" [ref=e402] [cursor=pointer]
                      - button "+ Log" [ref=e403] [cursor=pointer]
                      - button "📍 Qualifying Locations" [ref=e404] [cursor=pointer]
                - generic [ref=e406]:
                  - generic [ref=e407]: 🌲
                  - generic [ref=e408]:
                    - generic [ref=e410]:
                      - generic [ref=e411]: State Park Tour
                      - generic [ref=e412]: Challenge
                    - generic [ref=e413]:
                      - generic [ref=e414]: Not Started
                      - button "View all levels for State Park Tour" [ref=e416] [cursor=pointer]: ⓘ
                    - generic [ref=e417]: Visit 2 state parks.
                    - generic [ref=e418]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e420]:
                      - text: 0/1 visits →
                      - strong [ref=e421]: L1 Rookie
                    - generic [ref=e423]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 state park" [ref=e424]':
                        - generic [ref=e425]: L1
                        - generic [ref=e426]: Rookie
                        - generic [ref=e427]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 state park" [ref=e428]':
                        - generic [ref=e429]: L2
                        - generic [ref=e430]: Novice
                        - generic [ref=e431]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 state park" [ref=e432]':
                        - generic [ref=e433]: L3
                        - generic [ref=e434]: Semi-Pro
                        - generic [ref=e435]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 state park" [ref=e436]':
                        - generic [ref=e437]: L4
                        - generic [ref=e438]: Pro
                        - generic [ref=e439]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ state park" [ref=e440]':
                        - generic [ref=e441]: L5
                        - generic [ref=e442]: MVP
                        - generic [ref=e443]: 🔒
                    - generic [ref=e444]:
                      - button "−" [ref=e445] [cursor=pointer]
                      - button "+ Log" [ref=e446] [cursor=pointer]
                      - button "📍 Qualifying Locations" [ref=e447] [cursor=pointer]
                - generic [ref=e449]:
                  - generic [ref=e450]: 🏔️
                  - generic [ref=e451]:
                    - generic [ref=e453]:
                      - generic [ref=e454]: National Park Day
                      - generic [ref=e455]: Challenge
                    - generic [ref=e456]:
                      - generic [ref=e457]: Not Started
                      - button "View all levels for National Park Day" [ref=e459] [cursor=pointer]: ⓘ
                    - generic [ref=e460]: Visit 1 national park.
                    - generic [ref=e461]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e463]:
                      - text: 0/1 visits →
                      - strong [ref=e464]: L1 Rookie
                    - generic [ref=e466]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 national park" [ref=e467]':
                        - generic [ref=e468]: L1
                        - generic [ref=e469]: Rookie
                        - generic [ref=e470]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 national park" [ref=e471]':
                        - generic [ref=e472]: L2
                        - generic [ref=e473]: Novice
                        - generic [ref=e474]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 national park" [ref=e475]':
                        - generic [ref=e476]: L3
                        - generic [ref=e477]: Semi-Pro
                        - generic [ref=e478]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 national park" [ref=e479]':
                        - generic [ref=e480]: L4
                        - generic [ref=e481]: Pro
                        - generic [ref=e482]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ national park" [ref=e483]':
                        - generic [ref=e484]: L5
                        - generic [ref=e485]: MVP
                        - generic [ref=e486]: 🔒
                    - generic [ref=e487]:
                      - button "−" [ref=e488] [cursor=pointer]
                      - button "+ Log" [ref=e489] [cursor=pointer]
                      - button "📍 Qualifying Locations" [ref=e490] [cursor=pointer]
                - generic [ref=e492]:
                  - generic [ref=e493]: 🏖️
                  - generic [ref=e494]:
                    - generic [ref=e496]:
                      - generic [ref=e497]: Shoreline Explorer
                      - generic [ref=e498]: Challenge
                    - generic [ref=e499]:
                      - generic [ref=e500]: Not Started
                      - button "View all levels for Shoreline Explorer" [ref=e502] [cursor=pointer]: ⓘ
                    - generic [ref=e503]: Swim at 2 public beaches.
                    - generic [ref=e504]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e506]:
                      - text: 0/1 visits →
                      - strong [ref=e507]: L1 Rookie
                    - generic [ref=e509]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 beach" [ref=e510]':
                        - generic [ref=e511]: L1
                        - generic [ref=e512]: Rookie
                        - generic [ref=e513]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 beach" [ref=e514]':
                        - generic [ref=e515]: L2
                        - generic [ref=e516]: Novice
                        - generic [ref=e517]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 beach" [ref=e518]':
                        - generic [ref=e519]: L3
                        - generic [ref=e520]: Semi-Pro
                        - generic [ref=e521]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 beach" [ref=e522]':
                        - generic [ref=e523]: L4
                        - generic [ref=e524]: Pro
                        - generic [ref=e525]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ beach" [ref=e526]':
                        - generic [ref=e527]: L5
                        - generic [ref=e528]: MVP
                        - generic [ref=e529]: 🔒
                    - generic [ref=e530]:
                      - button "−" [ref=e531] [cursor=pointer]
                      - button "+ Log" [ref=e532] [cursor=pointer]
                      - button "📍 Qualifying Locations" [ref=e533] [cursor=pointer]
                - generic [ref=e535]:
                  - generic [ref=e536]: 🏞️
                  - generic [ref=e537]:
                    - generic [ref=e539]:
                      - generic [ref=e540]: Lake & Pond Loop
                      - generic [ref=e541]: Challenge
                    - generic [ref=e542]:
                      - generic [ref=e543]: Not Started
                      - button "View all levels for Lake & Pond Loop" [ref=e545] [cursor=pointer]: ⓘ
                    - generic [ref=e546]: Explore 3 lakes or ponds.
                    - generic [ref=e547]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e549]:
                      - text: 0/1 visits →
                      - strong [ref=e550]: L1 Rookie
                    - generic [ref=e552]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 lake" [ref=e553]':
                        - generic [ref=e554]: L1
                        - generic [ref=e555]: Rookie
                        - generic [ref=e556]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 lake" [ref=e557]':
                        - generic [ref=e558]: L2
                        - generic [ref=e559]: Novice
                        - generic [ref=e560]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 lake" [ref=e561]':
                        - generic [ref=e562]: L3
                        - generic [ref=e563]: Semi-Pro
                        - generic [ref=e564]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 lake" [ref=e565]':
                        - generic [ref=e566]: L4
                        - generic [ref=e567]: Pro
                        - generic [ref=e568]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ lake" [ref=e569]':
                        - generic [ref=e570]: L5
                        - generic [ref=e571]: MVP
                        - generic [ref=e572]: 🔒
                    - generic [ref=e573]:
                      - button "−" [ref=e574] [cursor=pointer]
                      - button "+ Log" [ref=e575] [cursor=pointer]
                      - button "📍 Qualifying Locations" [ref=e576] [cursor=pointer]
                - generic [ref=e578]:
                  - generic [ref=e579]: 🌺
                  - generic [ref=e580]:
                    - generic [ref=e582]:
                      - generic [ref=e583]: Garden Stroll
                      - generic [ref=e584]: Challenge
                    - generic [ref=e585]:
                      - generic [ref=e586]: Not Started
                      - button "View all levels for Garden Stroll" [ref=e588] [cursor=pointer]: ⓘ
                    - generic [ref=e589]: Visit 2 botanical gardens.
                    - generic [ref=e590]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e592]:
                      - text: 0/1 visits →
                      - strong [ref=e593]: L1 Rookie
                    - generic [ref=e595]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 gardens" [ref=e596]':
                        - generic [ref=e597]: L1
                        - generic [ref=e598]: Rookie
                        - generic [ref=e599]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 gardens" [ref=e600]':
                        - generic [ref=e601]: L2
                        - generic [ref=e602]: Novice
                        - generic [ref=e603]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 gardens" [ref=e604]':
                        - generic [ref=e605]: L3
                        - generic [ref=e606]: Semi-Pro
                        - generic [ref=e607]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 gardens" [ref=e608]':
                        - generic [ref=e609]: L4
                        - generic [ref=e610]: Pro
                        - generic [ref=e611]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ gardens" [ref=e612]':
                        - generic [ref=e613]: L5
                        - generic [ref=e614]: MVP
                        - generic [ref=e615]: 🔒
                    - generic [ref=e616]:
                      - button "−" [ref=e617] [cursor=pointer]
                      - button "+ Log" [ref=e618] [cursor=pointer]
                      - button "📍 Qualifying Locations" [ref=e619] [cursor=pointer]
                - generic [ref=e621]:
                  - generic [ref=e622]: 🏕️
                  - generic [ref=e623]:
                    - generic [ref=e625]:
                      - generic [ref=e626]: Recreation Champion
                      - generic [ref=e627]: Challenge
                    - generic [ref=e628]:
                      - generic [ref=e629]: Not Started
                      - button "View all levels for Recreation Champion" [ref=e631] [cursor=pointer]: ⓘ
                    - generic [ref=e632]: Complete 4 recreation or day-use areas.
                    - generic [ref=e633]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e635]:
                      - text: 0/1 visits →
                      - strong [ref=e636]: L1 Rookie
                    - generic [ref=e638]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 rec area" [ref=e639]':
                        - generic [ref=e640]: L1
                        - generic [ref=e641]: Rookie
                        - generic [ref=e642]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 rec area" [ref=e643]':
                        - generic [ref=e644]: L2
                        - generic [ref=e645]: Novice
                        - generic [ref=e646]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 rec area" [ref=e647]':
                        - generic [ref=e648]: L3
                        - generic [ref=e649]: Semi-Pro
                        - generic [ref=e650]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 rec area" [ref=e651]':
                        - generic [ref=e652]: L4
                        - generic [ref=e653]: Pro
                        - generic [ref=e654]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ rec area" [ref=e655]':
                        - generic [ref=e656]: L5
                        - generic [ref=e657]: MVP
                        - generic [ref=e658]: 🔒
                    - generic [ref=e659]:
                      - button "−" [ref=e660] [cursor=pointer]
                      - button "+ Log" [ref=e661] [cursor=pointer]
                      - button "📍 Qualifying Locations" [ref=e662] [cursor=pointer]
                - generic [ref=e664]:
                  - generic [ref=e665]: 🔒
                  - generic [ref=e666]:
                    - generic [ref=e668]:
                      - generic [ref=e669]: Trail Starter
                      - generic [ref=e670]: Common
                    - generic [ref=e671]:
                      - generic [ref=e672]: Not Started
                      - button "View all levels for Trail Starter" [ref=e674] [cursor=pointer]: ⓘ
                    - generic [ref=e676]:
                      - text: 0/1 trailheads →
                      - strong [ref=e677]: L1 Rookie
                    - button "📍 Qualifying Locations" [ref=e680] [cursor=pointer]
                - generic [ref=e682]:
                  - generic [ref=e683]: 🔒
                  - generic [ref=e684]:
                    - generic [ref=e686]:
                      - generic [ref=e687]: Waterfall Seeker
                      - generic [ref=e688]: Rare
                    - generic [ref=e689]:
                      - generic [ref=e690]: Not Started
                      - button "View all levels for Waterfall Seeker" [ref=e692] [cursor=pointer]: ⓘ
                    - generic [ref=e694]:
                      - text: 0/1 waterfalls →
                      - strong [ref=e695]: L1 Rookie
                    - button "📍 Qualifying Locations" [ref=e698] [cursor=pointer]
                - generic [ref=e700]:
                  - generic [ref=e701]: 🔒
                  - generic [ref=e702]:
                    - generic [ref=e704]:
                      - generic [ref=e705]: Park Ranger
                      - generic [ref=e706]: Rare
                    - generic [ref=e707]:
                      - generic [ref=e708]: Not Started
                      - button "View all levels for Park Ranger" [ref=e710] [cursor=pointer]: ⓘ
                    - generic [ref=e712]:
                      - text: 0/1 state parks →
                      - strong [ref=e713]: L1 Rookie
                    - button "📍 Qualifying Locations" [ref=e716] [cursor=pointer]
                - generic [ref=e718]:
                  - generic [ref=e719]: 🔒
                  - generic [ref=e720]:
                    - generic [ref=e722]:
                      - generic [ref=e723]: Camp Explorer
                      - generic [ref=e724]: Rare
                    - generic [ref=e725]:
                      - generic [ref=e726]: Not Started
                      - button "View all levels for Camp Explorer" [ref=e728] [cursor=pointer]: ⓘ
                    - generic [ref=e730]:
                      - text: 0/1 campgrounds →
                      - strong [ref=e731]: L1 Rookie
                    - button "📍 Qualifying Locations" [ref=e734] [cursor=pointer]
                - generic [ref=e736]:
                  - generic [ref=e737]: 🔒
                  - generic [ref=e738]:
                    - generic [ref=e740]:
                      - generic [ref=e741]: Lake Walker
                      - generic [ref=e742]: Epic
                    - generic [ref=e743]:
                      - generic [ref=e744]: Not Started
                      - button "View all levels for Lake Walker" [ref=e746] [cursor=pointer]: ⓘ
                    - generic [ref=e748]:
                      - text: 0/1 lakes & ponds →
                      - strong [ref=e749]: L1 Rookie
                    - button "📍 Qualifying Locations" [ref=e752] [cursor=pointer]
                - generic [ref=e754]:
                  - generic [ref=e755]: 🔒
                  - generic [ref=e756]:
                    - generic [ref=e758]:
                      - generic [ref=e759]: Summit Chaser
                      - generic [ref=e760]: Epic
                    - generic [ref=e761]:
                      - generic [ref=e762]: Not Started
                      - button "View all levels for Summit Chaser" [ref=e764] [cursor=pointer]: ⓘ
                    - generic [ref=e766]:
                      - text: 0/1 scenic overlooks →
                      - strong [ref=e767]: L1 Rookie
                    - button "📍 Qualifying Locations" [ref=e770] [cursor=pointer]
                - generic [ref=e772]:
                  - generic [ref=e773]: 🔒
                  - generic [ref=e774]:
                    - generic [ref=e776]:
                      - generic [ref=e777]: Beach Goer
                      - generic [ref=e778]: Rare
                    - generic [ref=e779]:
                      - generic [ref=e780]: Not Started
                      - button "View all levels for Beach Goer" [ref=e782] [cursor=pointer]: ⓘ
                    - generic [ref=e784]:
                      - text: 0/1 public beaches →
                      - strong [ref=e785]: L1 Rookie
                    - button "📍 Qualifying Locations" [ref=e788] [cursor=pointer]
                - generic [ref=e790]:
                  - generic [ref=e791]: 🔒
                  - generic [ref=e792]:
                    - generic [ref=e794]:
                      - generic [ref=e795]: Garden Lover
                      - generic [ref=e796]: Rare
                    - generic [ref=e797]:
                      - generic [ref=e798]: Not Started
                      - button "View all levels for Garden Lover" [ref=e800] [cursor=pointer]: ⓘ
                    - generic [ref=e802]:
                      - text: 0/1 botanical gardens →
                      - strong [ref=e803]: L1 Rookie
                    - button "📍 Qualifying Locations" [ref=e806] [cursor=pointer]
                - generic [ref=e808]:
                  - generic [ref=e809]: 🔒
                  - generic [ref=e810]:
                    - generic [ref=e812]:
                      - generic [ref=e813]: Outdoors Devotee
                      - generic [ref=e814]: Legendary
                    - generic [ref=e815]:
                      - generic [ref=e816]: Not Started
                      - button "View all levels for Outdoors Devotee" [ref=e818] [cursor=pointer]: ⓘ
                    - generic [ref=e820]:
                      - text: 0/1 total visits →
                      - strong [ref=e821]: L1 Rookie
                    - button "📍 Qualifying Locations" [ref=e824] [cursor=pointer]
                - generic [ref=e826]:
                  - generic [ref=e827]: 🔒
                  - generic [ref=e828]:
                    - generic [ref=e830]:
                      - generic [ref=e831]: Nature Champion
                      - generic [ref=e832]: Legendary
                    - generic [ref=e833]:
                      - generic [ref=e834]: Not Started
                      - button "View all levels for Nature Champion" [ref=e836] [cursor=pointer]: ⓘ
                    - generic [ref=e838]:
                      - text: 0/1 completed challenges →
                      - strong [ref=e839]: L1 Rookie
                    - button "📍 Qualifying Locations" [ref=e842] [cursor=pointer]
            - generic [ref=e843]:
              - generic [ref=e845]:
                - generic [ref=e846]: 📚 Seasonal Quests
                - generic [ref=e847]: Multi-step seasonal goals for Outdoors.
              - generic [ref=e848]:
                - generic [ref=e849]:
                  - generic [ref=e850]: 🌸 Spring Now
                  - generic [ref=e851]: Spring Awakening
                  - generic [ref=e852]: 0/3 steps
                  - generic [ref=e853]:
                    - generic [ref=e854]:
                      - generic [ref=e855]: ○
                      - generic [ref=e856]: Visit 3 parks or gardens
                      - generic [ref=e857]: Auto
                    - generic [ref=e858]:
                      - generic [ref=e859]: ○
                      - generic [ref=e860]: Find a waterfall
                      - generic [ref=e861]: Auto
                    - generic [ref=e862]:
                      - generic [ref=e863]: ○
                      - generic [ref=e864]: Hike a trail
                      - generic [ref=e865]: Auto
                - generic [ref=e866]:
                  - generic [ref=e867]: ☀️ Summer
                  - generic [ref=e868]: Summer Expedition
                  - generic [ref=e869]: 0/3 steps
                  - generic [ref=e870]:
                    - generic [ref=e871]:
                      - generic [ref=e872]: ○
                      - generic [ref=e873]: Swim at a public beach
                      - generic [ref=e874]: Auto
                    - generic [ref=e875]:
                      - generic [ref=e876]: ○
                      - generic [ref=e877]: Visit a recreation area
                      - generic [ref=e878]: Auto
                    - generic [ref=e879]:
                      - generic [ref=e880]: ○
                      - generic [ref=e881]: Camp overnight
                      - generic [ref=e882]: Auto
                - generic [ref=e883]:
                  - generic [ref=e884]: 🍂 Fall
                  - generic [ref=e885]: Fall Foliage Tour
                  - generic [ref=e886]: 0/3 steps
                  - generic [ref=e887]:
                    - generic [ref=e888]:
                      - generic [ref=e889]: ○
                      - generic [ref=e890]: Visit 3 scenic overlooks
                      - generic [ref=e891]: Auto
                    - generic [ref=e892]:
                      - generic [ref=e893]: ○
                      - generic [ref=e894]: Explore a state park
                      - generic [ref=e895]: Auto
                    - generic [ref=e896]:
                      - generic [ref=e897]: ○
                      - generic [ref=e898]: Find a lake or pond
                      - generic [ref=e899]: Auto
                - generic [ref=e900]:
                  - generic [ref=e901]: ❄️ Winter
                  - generic [ref=e902]: Winter Wild Side
                  - generic [ref=e903]: 0/3 steps
                  - generic [ref=e904]:
                    - generic [ref=e905]:
                      - generic [ref=e906]: ○
                      - generic [ref=e907]: Find a waterfall (brave the cold!)
                      - generic [ref=e908]: Auto
                    - generic [ref=e909]:
                      - generic [ref=e910]: ○
                      - generic [ref=e911]: Hike a trailhead
                      - generic [ref=e912]: Auto
                    - generic [ref=e913]:
                      - generic [ref=e914]: ○
                      - generic [ref=e915]: Visit a botanical garden
                      - generic [ref=e916]: Auto
            - generic [ref=e917]:
              - generic [ref=e918]:
                - generic [ref=e919]:
                  - generic [ref=e920]: 🟩 Outdoors Bingo
                  - generic [ref=e921]: Auto-synced from your logged visits. Complete a row, column, or diagonal for BINGO!
                - generic [ref=e922]: 0/9
              - generic [ref=e923]:
                - generic "Trailhead not completed" [ref=e924] [cursor=pointer]:
                  - generic [ref=e925]: 🥾
                  - generic [ref=e926]: Trailhead
                - generic "Waterfall not completed" [ref=e927] [cursor=pointer]:
                  - generic [ref=e928]: 💧
                  - generic [ref=e929]: Waterfall
                - generic "State Park not completed" [ref=e930] [cursor=pointer]:
                  - generic [ref=e931]: 🌲
                  - generic [ref=e932]: State Park
                - generic "Campground not completed" [ref=e933] [cursor=pointer]:
                  - generic [ref=e934]: ⛺
                  - generic [ref=e935]: Campground
                - generic "Scenic Overlook not completed" [ref=e936] [cursor=pointer]:
                  - generic [ref=e937]: 🏔️
                  - generic [ref=e938]: Scenic Overlook
                - generic "Lake or Pond not completed" [ref=e939] [cursor=pointer]:
                  - generic [ref=e940]: 🏞️
                  - generic [ref=e941]: Lake or Pond
                - generic "Public Beach not completed" [ref=e942] [cursor=pointer]:
                  - generic [ref=e943]: 🏖️
                  - generic [ref=e944]: Public Beach
                - generic "National Park not completed" [ref=e945] [cursor=pointer]:
                  - generic [ref=e946]: 🏔️
                  - generic [ref=e947]: National Park
                - generic "Botanical Garden not completed" [ref=e948] [cursor=pointer]:
                  - generic [ref=e949]: 🌺
                  - generic [ref=e950]: Botanical Garden
              - generic [ref=e951]: 0/9 tiles marked
          - text: ▸
        - text: ▸ ▸ ▸ ▸ ▸ 1
        - group "🧰 Diagnostics, Sync and Clean Up" [ref=e952]:
          - generic "🧰 Diagnostics, Sync and Clean Up Sync health, local queue visibility, and visited tracker diagnostics. ▾" [ref=e953] [cursor=pointer]:
            - generic [ref=e954]:
              - generic [ref=e955]: 🧰 Diagnostics, Sync and Clean Up
              - generic [ref=e956]: Sync health, local queue visibility, and visited tracker diagnostics.
            - text: ▾
          - option "Strict (Place ID + exact name)"
          - option "Balanced (Place ID + exact + fuzzy)" [selected]
          - option "Name Only (exact + fuzzy)"
  - 'button "TV Mode: OFF" [ref=e957] [cursor=pointer]'
  - button "Quick Add a place" [ref=e959] [cursor=pointer]:
    - generic: ＋
  - dialog "Quick Add a place" [ref=e960]:
    - generic [ref=e962]: ⚡ Quick Add
    - generic [ref=e963]:
      - generic [ref=e964]:
        - generic [ref=e965]: Place Name *
        - textbox "Place Name *" [ref=e966]:
          - /placeholder: e.g. Congaree National Park
      - generic [ref=e967]:
        - generic [ref=e968]: Website or Google Maps URL
        - textbox "Website or Google Maps URL" [ref=e969]:
          - /placeholder: https://...
      - generic [ref=e970]:
        - generic [ref=e971]: Photo URL (optional)
        - textbox "Photo URL (optional)" [ref=e972]:
          - /placeholder: https://...
      - generic [ref=e973]:
        - generic [ref=e974]: Quick Note
        - textbox "Quick Note" [ref=e975]:
          - /placeholder: Any quick thoughts...
      - generic [ref=e976]:
        - button "💾 Save to Inbox" [ref=e977] [cursor=pointer]
        - button "Cancel" [ref=e978] [cursor=pointer]
  - button "Deployment 2026.04.23.live-debug.1 OK (4/4)" [ref=e980] [cursor=pointer]
  - generic [ref=e981]: ✅ App Ready - 9 systems initialized
```

# Test source

```ts
  1  | const { test: base, expect } = require('@playwright/test');
  2  | 
  3  | const EXTENSION_NOISE_PATTERNS = [
  4  |   /chrome-extension:\/\//i,
  5  |   /Unchecked runtime\.lastError: Cannot create item with duplicate id/i,
  6  |   /background-redux-new\.js/i,
  7  |   /Invalid frameId for foreground frameId/i,
  8  |   /\bLastPass\b/i,
  9  |   /Failed to load resource: the server responded with a status of 404 \(Not Found\) \(https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/root:\/.+:\/workbook\/tables\/.+\/columns\?\$select=name,index\)/i,
  10 |   /Failed to load resource: the server responded with a status of 404 \(Not Found\) \(https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/root:\/.+:\/workbook\/tables\)/i,
  11 |   /Failed to load resource: the server responded with a status of 404 \(Not Found\) \(https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/root:\/.+:\/workbook\/worksheets\?\$select=id,name,position\)/i,
  12 |   /Failed to load resource: net::ERR_CONNECTION_RESET.*JS%20Files\/diagnostics-reporting-utils\.js/i
  13 | ];
  14 | 
  15 | function isIntentionalWorkbookProbe404(text, locationUrl) {
  16 |   const msg = String(text || '');
  17 |   const url = String(locationUrl || '');
  18 |   const combined = `${msg}\n${url}`;
  19 |   if (
  20 |     /Failed to load resource: the server responded with a status of 404 \(Not Found\)/i.test(msg)
  21 |     && /https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/root:\//i.test(combined)
  22 |     && (/\/workbook\/tables(?:\)|$)/i.test(combined) || /\/workbook\/worksheets\?\$select=id,name,position/i.test(combined))
  23 |   ) {
  24 |     return true;
  25 |   }
  26 |   return (
  27 |     /Failed to load resource: the server responded with a status of 404 \(Not Found\)/i.test(msg)
  28 |     && (
  29 |       /https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/root:\/Retail_Food_and_Drink\.xlsx:\/workbook\/tables\/Retail\/columns\?\$select=name,index/i.test(url)
  30 |       || /https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/root:\/.+:\/workbook\/tables\)?/i.test(msg)
  31 |       || /https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/root:\/.+:\/workbook\/worksheets\?\$select=id,name,position\)?/i.test(msg)
  32 |     )
  33 |   );
  34 | }
  35 | 
  36 | function isIgnoredExtensionNoise(text, locationUrl) {
  37 |   if (isIntentionalWorkbookProbe404(text, locationUrl)) return true;
  38 |   const candidate = `${String(text || '')}\n${String(locationUrl || '')}`;
  39 |   return EXTENSION_NOISE_PATTERNS.some((pattern) => pattern.test(candidate));
  40 | }
  41 | 
  42 | const test = base.extend({
  43 |   page: async ({ page }, use, testInfo) => {
  44 |     const unexpectedErrors = [];
  45 | 
  46 |     const onConsole = (msg) => {
  47 |       if (msg.type() !== 'error') return;
  48 |       const location = msg.location ? msg.location() : { url: '' };
  49 |       const text = msg.text();
  50 |       if (isIgnoredExtensionNoise(text, location && location.url)) return;
  51 |       unexpectedErrors.push({
  52 |         source: 'console',
  53 |         text,
  54 |         url: (location && location.url) || ''
  55 |       });
  56 |     };
  57 | 
  58 |     const onPageError = (error) => {
  59 |       const message = error && error.message ? String(error.message) : String(error || 'Unknown page error');
  60 |       const stack = error && error.stack ? String(error.stack) : '';
  61 |       if (isIgnoredExtensionNoise(`${message}\n${stack}`, '')) return;
  62 |       unexpectedErrors.push({
  63 |         source: 'pageerror',
  64 |         text: message,
  65 |         url: ''
  66 |       });
  67 |     };
  68 | 
  69 |     page.on('console', onConsole);
  70 |     page.on('pageerror', onPageError);
  71 | 
  72 |     await use(page);
  73 | 
  74 |     page.off('console', onConsole);
  75 |     page.off('pageerror', onPageError);
  76 | 
  77 |     if (unexpectedErrors.length) {
  78 |       const preview = unexpectedErrors
  79 |         .slice(0, 5)
  80 |         .map((row, idx) => `${idx + 1}. [${row.source}] ${row.text}${row.url ? ` (${row.url})` : ''}`)
  81 |         .join('\n');
  82 | 
  83 |       await testInfo.attach('unexpected-browser-errors.txt', {
  84 |         body: Buffer.from(preview, 'utf8'),
  85 |         contentType: 'text/plain'
  86 |       });
  87 | 
> 88 |       throw new Error(`Unexpected browser errors detected:\n${preview}`);
     |             ^ Error: Unexpected browser errors detected:
  89 |     }
  90 |   }
  91 | });
  92 | 
  93 | module.exports = { test, expect, isIgnoredExtensionNoise };
  94 | 
  95 | 
```