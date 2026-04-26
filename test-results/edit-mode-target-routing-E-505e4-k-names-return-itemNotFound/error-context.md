# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: edit-mode-target-routing.spec.js >> Edit Mode target-table routing >> row-level saveToExcel resolves prefixed workbook paths when bare workbook names return itemNotFound
- Location: tests/edit-mode-target-routing.spec.js:309:3

# Error details

```
Error: Unexpected browser errors detected:
1. [console] Failed to load resource: the server responded with a status of 404 (Not Found) (https://graph.microsoft.com/v1.0/me/drive/root:/Nature_Locations.xlsx:/workbook/tables/Nature_Locations/columns?$select=name,index)
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e5]: Buttons and tabs are ready
  - generic "Click to expand/collapse errors" [ref=e7] [cursor=pointer]:
    - generic [ref=e8]:
      - generic [ref=e9]: ⚠️ Errors Detected
      - generic [ref=e10]: "0"
      - generic [ref=e11]: "Overlay: OK"
    - generic [ref=e12]: ▼
  - generic "Click to expand/collapse" [ref=e14] [cursor=pointer]:
    - generic [ref=e15]:
      - text: 🔧 Advanced Debug Console
      - generic [ref=e16]: "Startup timing: interactive in 107 ms (overlay pending)"
      - generic [ref=e17]: "Reliability: blocked 0 | overlays 0 | recoveries 0 | errors 0"
    - generic [ref=e18]:
      - button "📋 Copy All" [ref=e19]
      - button "🔗 Copy Card Bundle" [ref=e20]
      - button "🗑️ Clear" [ref=e21]
      - button "↓ Minimize" [ref=e22]
  - banner [ref=e23]:
    - generic [ref=e24]:
      - generic [ref=e25]: Kyle’s Adventure Finder
      - generic [ref=e26]: Powered by Excel, enhanced with Google data and mobile-friendly design.
    - generic [ref=e27]:
      - generic [ref=e28]:
        - button "🔄 Reload App" [ref=e29] [cursor=pointer]
        - button "📝 Edit Mode" [ref=e30] [cursor=pointer]
        - button "📴 Offline Mode" [ref=e31] [cursor=pointer]
        - button "💾 App Backup" [ref=e32] [cursor=pointer]
        - button "📱 iPhone View" [ref=e33] [cursor=pointer]
        - generic [ref=e34]:
          - generic [ref=e35]: All Changes Synced
          - button "Retry Sync" [disabled]
        - button "Sign In" [ref=e36] [cursor=pointer]
      - generic [ref=e37]: Not signed in
  - status [ref=e38]:
    - generic [ref=e39]: "🔐 Sign in required: connect your Microsoft account to load Excel data and use core app features."
    - button "Sign In Now" [ref=e40] [cursor=pointer]
  - status [ref=e41]:
    - generic [ref=e42]:
      - generic [ref=e43]:
        - generic [ref=e44]: 🩺 Workbook row patch diagnostics
        - generic [ref=e45]: Workbook row PATCH saved and verified.
        - generic [ref=e46]: "Description header resolved to: \"Description\" at index 12 • Legacy description index 16 value updated: no"
        - generic [ref=e47]: table=Nature_Locations • path=Copilot_Apps/Kyles_Adventure_Finder/Nature_Locations.xlsx • row=itemAt(index=0) • phase=verified
      - generic [ref=e48]:
        - button "📖 Open full diagnostics" [ref=e49] [cursor=pointer]
        - button "📋 Copy" [ref=e50] [cursor=pointer]
        - button "🗑️ Clear" [ref=e51] [cursor=pointer]
    - generic [ref=e52]:
      - generic [ref=e53]:
        - generic [ref=e54]:
          - generic [ref=e55]: 11:05:38 AM
          - generic [ref=e56]: SUCCESS
        - generic [ref=e57]: Workbook row PATCH saved and verified.
        - generic [ref=e58]: "Description header resolved to: \"Description\" at index 12 • Legacy description index 16 value updated: no"
        - generic [ref=e59]:
          - text: table=Nature_Locations • path=Copilot_Apps/Kyles_Adventure_Finder/Nature_Locations.xlsx • row=itemAt(index=0) • phase=verified
          - text: values=2 • inSession=ok • freshSession=ok • description="Description"@12 • legacy16Updated=no url=https://graph.microsoft.com/v1.0/me/drive/root:/Copilot_Apps/Kyles_Adventure_Finder/Nature_Locations.xlsx:/workbook/tables/Nature_Locations/rows/itemAt(index=0)
      - generic [ref=e60]:
        - generic [ref=e61]:
          - generic [ref=e62]: 11:05:38 AM
          - generic [ref=e63]: INFO
        - generic [ref=e64]: Attempting workbook row PATCH…
        - generic [ref=e65]: "Description header resolved to: \"Description\" at index 12 • Legacy description index 16 value updated: no"
        - generic [ref=e66]:
          - text: table=Nature_Locations • path=Copilot_Apps/Kyles_Adventure_Finder/Nature_Locations.xlsx • row=itemAt(index=0) • phase=attempt
          - text: candidate 1/3 • values=2 • persistChanges=session-unavailable • description="Description"@12 • legacy16Updated=no url=https://graph.microsoft.com/v1.0/me/drive/root:/Copilot_Apps/Kyles_Adventure_Finder/Nature_Locations.xlsx:/workbook/tables/Nature_Locations/rows/itemAt(index=0)
  - generic [ref=e67]:
    - generic [ref=e68]:
      - button "🎮 Adventure Challenge" [ref=e69] [cursor=pointer]
      - button "🌿 Nature Challenge" [ref=e70] [cursor=pointer]
      - button "🏔️ Adventure Planner" [ref=e71] [cursor=pointer]
      - button "🧰 Household Tools" [ref=e72] [cursor=pointer]
      - button "🐦 Birding Locations" [ref=e73] [cursor=pointer]
      - button "🚴 Bike Trails" [ref=e74] [cursor=pointer]
    - tablist "Adventure Challenge categories" [ref=e78]:
      - tab "Open Outdoors section" [selected] [ref=e79] [cursor=pointer]: 🌲 Outdoors
      - tab "Open Entertainment section" [ref=e80] [cursor=pointer]: 🎬 Entertainment
      - tab "Open Food and Drink section" [ref=e81] [cursor=pointer]: 🍽️ Food & Drink
      - tab "Open Retail section" [ref=e82] [cursor=pointer]: 🛍️ Retail
      - tab "Open Wildlife and Animals section" [ref=e83] [cursor=pointer]: 🦌 Wildlife & Animals
      - tab "Open Regional Festivals section" [ref=e84] [cursor=pointer]: 🎉 Regional Festivals
      - tab "Open Bike Trails section" [ref=e85] [cursor=pointer]: 🚴 Bike Trails
    - generic [ref=e88]:
      - generic [ref=e89]:
        - heading "Adventure Challenge - Outdoors" [level=1] [ref=e90]
        - navigation "Jump to section links" [ref=e91]:
          - generic [ref=e92]: "Jump to section:"
          - button "📊 Category Progression" [ref=e93] [cursor=pointer]
          - button "🏅 Challenges & Badges" [ref=e94] [cursor=pointer]
          - button "📚 Seasonal Quests" [ref=e95] [cursor=pointer]
          - button "🟩 Outdoors Bingo" [ref=e96] [cursor=pointer]
          - button "🧰 Diagnostics, Sync and Clean Up" [ref=e97] [cursor=pointer]
      - generic [ref=e98]: 🌲 Outdoors section active
      - tabpanel "Open Outdoors section" [ref=e99]:
        - generic [ref=e100]:
          - generic [ref=e101]:
            - generic [ref=e102]: 🌲 Outdoors
            - generic [ref=e103]: Browse and plan outdoor locations you want to visit.
          - generic [ref=e104]:
            - generic [ref=e105]: "Outdoors data: ready 0 locations | Source: Nature_Locations.xlsx / Nature_Locations Updated 4/26/2026, 11:05:38 AM"
            - generic [ref=e106]:
              - button "🔎 Explore Outdoors" [ref=e107] [cursor=pointer]
              - button "🏙️ City Explorer" [ref=e108] [cursor=pointer]
              - button "Log a Visit" [ref=e109] [cursor=pointer]
              - button "📝 Edit Mode" [ref=e110] [cursor=pointer]
              - button "Refresh Data" [ref=e111] [cursor=pointer]
              - button "↶ Undo" [disabled] [ref=e112] [cursor=pointer]
        - generic [ref=e113]:
          - generic [ref=e114]:
            - generic [ref=e116]:
              - generic [ref=e117]: 📊 Category Progression
              - generic [ref=e118]:
                - text: "Track your Outdoors visits by category. Total logged:"
                - strong [ref=e119]: "0"
                - text: .
                - button "Log Visit" [ref=e120] [cursor=pointer]
            - generic [ref=e121]:
              - generic [ref=e122]:
                - generic [ref=e123]: 🥾
                - generic [ref=e124]: Trailheads
                - generic [ref=e125]: 0 / 0
                - generic [ref=e126]: 0% complete
                - generic [ref=e129]: Auto-tracked from visit logs
              - generic [ref=e130]:
                - generic [ref=e131]: 💧
                - generic [ref=e132]: Waterfalls
                - generic [ref=e133]: 0 / 0
                - generic [ref=e134]: 0% complete
                - generic [ref=e137]: Auto-tracked from visit logs
              - generic [ref=e138]:
                - generic [ref=e139]: 🏔️
                - generic [ref=e140]: Scenic Overlooks
                - generic [ref=e141]: 0 / 0
                - generic [ref=e142]: 0% complete
                - generic [ref=e145]: Auto-tracked from visit logs
              - generic [ref=e146]:
                - generic [ref=e147]: ⛺
                - generic [ref=e148]: Campgrounds
                - generic [ref=e149]: 0 / 0
                - generic [ref=e150]: 0% complete
                - generic [ref=e153]: Auto-tracked from visit logs
              - generic [ref=e154]:
                - generic [ref=e155]: 🌲
                - generic [ref=e156]: State Parks
                - generic [ref=e157]: 0 / 0
                - generic [ref=e158]: 0% complete
                - generic [ref=e161]: Auto-tracked from visit logs
              - generic [ref=e162]:
                - generic [ref=e163]: 🏔️
                - generic [ref=e164]: National Parks
                - generic [ref=e165]: 0 / 0
                - generic [ref=e166]: 0% complete
                - generic [ref=e169]: Auto-tracked from visit logs
              - generic [ref=e170]:
                - generic [ref=e171]: 🏖️
                - generic [ref=e172]: Public Beaches
                - generic [ref=e173]: 0 / 0
                - generic [ref=e174]: 0% complete
                - generic [ref=e177]: Auto-tracked from visit logs
              - generic [ref=e178]:
                - generic [ref=e179]: 🏞️
                - generic [ref=e180]: Lakes & Ponds
                - generic [ref=e181]: 0 / 0
                - generic [ref=e182]: 0% complete
                - generic [ref=e185]: Auto-tracked from visit logs
              - generic [ref=e186]:
                - generic [ref=e187]: 🏕️
                - generic [ref=e188]: Recreation Areas
                - generic [ref=e189]: 0 / 0
                - generic [ref=e190]: 0% complete
                - generic [ref=e193]: Auto-tracked from visit logs
              - generic [ref=e194]:
                - generic [ref=e195]: 🌺
                - generic [ref=e196]: Botanical Gardens
                - generic [ref=e197]: 0 / 0
                - generic [ref=e198]: 0% complete
                - generic [ref=e201]: Auto-tracked from visit logs
          - generic [ref=e202]:
            - generic [ref=e203]:
              - generic [ref=e204]:
                - generic [ref=e205]: 🏅 Challenges & Badges
                - generic [ref=e206]: Challenge goals and badges now share one achievement wall using the same badge layout.
              - generic [ref=e207]: 0/100
            - generic [ref=e208]:
              - generic [ref=e210]:
                - generic [ref=e211]: 🥾
                - generic [ref=e212]:
                  - generic [ref=e214]:
                    - generic [ref=e215]: Trailhead Seeker
                    - generic [ref=e216]: Challenge
                  - generic [ref=e217]:
                    - generic [ref=e218]: Not Started
                    - button "View all levels for Trailhead Seeker" [ref=e220] [cursor=pointer]: ⓘ
                  - generic [ref=e221]: Visit 3 trailheads.
                  - generic [ref=e222]: "Progress: 0 visits • Tier 0/5"
                  - generic [ref=e224]:
                    - text: 0/1 visits →
                    - strong [ref=e225]: L1 Rookie
                  - generic [ref=e227]:
                    - 'generic "→ In Progress – L1 Rookie: Visit 1 trailhead" [ref=e228]':
                      - generic [ref=e229]: L1
                      - generic [ref=e230]: Rookie
                      - generic [ref=e231]: ●
                    - 'generic "🔒 Locked – L2 Novice: Visit 3 trailhead" [ref=e232]':
                      - generic [ref=e233]: L2
                      - generic [ref=e234]: Novice
                      - generic [ref=e235]: 🔒
                    - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 trailhead" [ref=e236]':
                      - generic [ref=e237]: L3
                      - generic [ref=e238]: Semi-Pro
                      - generic [ref=e239]: 🔒
                    - 'generic "🔒 Locked – L4 Pro: Visit 10 trailhead" [ref=e240]':
                      - generic [ref=e241]: L4
                      - generic [ref=e242]: Pro
                      - generic [ref=e243]: 🔒
                    - 'generic "🔒 Locked – L5 MVP: Visit 15+ trailhead" [ref=e244]':
                      - generic [ref=e245]: L5
                      - generic [ref=e246]: MVP
                      - generic [ref=e247]: 🔒
                  - generic [ref=e248]:
                    - button "−" [ref=e249] [cursor=pointer]
                    - button "+ Log" [ref=e250] [cursor=pointer]
                    - button "📍 Qualifying Locations" [ref=e251] [cursor=pointer]
              - generic [ref=e253]:
                - generic [ref=e254]: 💧
                - generic [ref=e255]:
                  - generic [ref=e257]:
                    - generic [ref=e258]: Waterfall Hunter
                    - generic [ref=e259]: Challenge
                  - generic [ref=e260]:
                    - generic [ref=e261]: Not Started
                    - button "View all levels for Waterfall Hunter" [ref=e263] [cursor=pointer]: ⓘ
                  - generic [ref=e264]: Discover 3 waterfalls.
                  - generic [ref=e265]: "Progress: 0 visits • Tier 0/5"
                  - generic [ref=e267]:
                    - text: 0/1 visits →
                    - strong [ref=e268]: L1 Rookie
                  - generic [ref=e270]:
                    - 'generic "→ In Progress – L1 Rookie: Visit 1 waterfall" [ref=e271]':
                      - generic [ref=e272]: L1
                      - generic [ref=e273]: Rookie
                      - generic [ref=e274]: ●
                    - 'generic "🔒 Locked – L2 Novice: Visit 3 waterfall" [ref=e275]':
                      - generic [ref=e276]: L2
                      - generic [ref=e277]: Novice
                      - generic [ref=e278]: 🔒
                    - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 waterfall" [ref=e279]':
                      - generic [ref=e280]: L3
                      - generic [ref=e281]: Semi-Pro
                      - generic [ref=e282]: 🔒
                    - 'generic "🔒 Locked – L4 Pro: Visit 10 waterfall" [ref=e283]':
                      - generic [ref=e284]: L4
                      - generic [ref=e285]: Pro
                      - generic [ref=e286]: 🔒
                    - 'generic "🔒 Locked – L5 MVP: Visit 15+ waterfall" [ref=e287]':
                      - generic [ref=e288]: L5
                      - generic [ref=e289]: MVP
                      - generic [ref=e290]: 🔒
                  - generic [ref=e291]:
                    - button "−" [ref=e292] [cursor=pointer]
                    - button "+ Log" [ref=e293] [cursor=pointer]
                    - button "📍 Qualifying Locations" [ref=e294] [cursor=pointer]
              - generic [ref=e296]:
                - generic [ref=e297]: 🏔️
                - generic [ref=e298]:
                  - generic [ref=e300]:
                    - generic [ref=e301]: Overlook Explorer
                    - generic [ref=e302]: Challenge
                  - generic [ref=e303]:
                    - generic [ref=e304]: Not Started
                    - button "View all levels for Overlook Explorer" [ref=e306] [cursor=pointer]: ⓘ
                  - generic [ref=e307]: Find 3 scenic overlooks or viewpoints.
                  - generic [ref=e308]: "Progress: 0 visits • Tier 0/5"
                  - generic [ref=e310]:
                    - text: 0/1 visits →
                    - strong [ref=e311]: L1 Rookie
                  - generic [ref=e313]:
                    - 'generic "→ In Progress – L1 Rookie: Visit 1 scenic" [ref=e314]':
                      - generic [ref=e315]: L1
                      - generic [ref=e316]: Rookie
                      - generic [ref=e317]: ●
                    - 'generic "🔒 Locked – L2 Novice: Visit 3 scenic" [ref=e318]':
                      - generic [ref=e319]: L2
                      - generic [ref=e320]: Novice
                      - generic [ref=e321]: 🔒
                    - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 scenic" [ref=e322]':
                      - generic [ref=e323]: L3
                      - generic [ref=e324]: Semi-Pro
                      - generic [ref=e325]: 🔒
                    - 'generic "🔒 Locked – L4 Pro: Visit 10 scenic" [ref=e326]':
                      - generic [ref=e327]: L4
                      - generic [ref=e328]: Pro
                      - generic [ref=e329]: 🔒
                    - 'generic "🔒 Locked – L5 MVP: Visit 15+ scenic" [ref=e330]':
                      - generic [ref=e331]: L5
                      - generic [ref=e332]: MVP
                      - generic [ref=e333]: 🔒
                  - generic [ref=e334]:
                    - button "−" [ref=e335] [cursor=pointer]
                    - button "+ Log" [ref=e336] [cursor=pointer]
                    - button "📍 Qualifying Locations" [ref=e337] [cursor=pointer]
              - generic [ref=e339]:
                - generic [ref=e340]: ⛺
                - generic [ref=e341]:
                  - generic [ref=e343]:
                    - generic [ref=e344]: Campfire Nights
                    - generic [ref=e345]: Challenge
                  - generic [ref=e346]:
                    - generic [ref=e347]: Not Started
                    - button "View all levels for Campfire Nights" [ref=e349] [cursor=pointer]: ⓘ
                  - generic [ref=e350]: Camp at 2 campgrounds.
                  - generic [ref=e351]: "Progress: 0 visits • Tier 0/5"
                  - generic [ref=e353]:
                    - text: 0/1 visits →
                    - strong [ref=e354]: L1 Rookie
                  - generic [ref=e356]:
                    - 'generic "→ In Progress – L1 Rookie: Visit 1 campground" [ref=e357]':
                      - generic [ref=e358]: L1
                      - generic [ref=e359]: Rookie
                      - generic [ref=e360]: ●
                    - 'generic "🔒 Locked – L2 Novice: Visit 3 campground" [ref=e361]':
                      - generic [ref=e362]: L2
                      - generic [ref=e363]: Novice
                      - generic [ref=e364]: 🔒
                    - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 campground" [ref=e365]':
                      - generic [ref=e366]: L3
                      - generic [ref=e367]: Semi-Pro
                      - generic [ref=e368]: 🔒
                    - 'generic "🔒 Locked – L4 Pro: Visit 10 campground" [ref=e369]':
                      - generic [ref=e370]: L4
                      - generic [ref=e371]: Pro
                      - generic [ref=e372]: 🔒
                    - 'generic "🔒 Locked – L5 MVP: Visit 15+ campground" [ref=e373]':
                      - generic [ref=e374]: L5
                      - generic [ref=e375]: MVP
                      - generic [ref=e376]: 🔒
                  - generic [ref=e377]:
                    - button "−" [ref=e378] [cursor=pointer]
                    - button "+ Log" [ref=e379] [cursor=pointer]
                    - button "📍 Qualifying Locations" [ref=e380] [cursor=pointer]
              - generic [ref=e382]:
                - generic [ref=e383]: 🌲
                - generic [ref=e384]:
                  - generic [ref=e386]:
                    - generic [ref=e387]: State Park Tour
                    - generic [ref=e388]: Challenge
                  - generic [ref=e389]:
                    - generic [ref=e390]: Not Started
                    - button "View all levels for State Park Tour" [ref=e392] [cursor=pointer]: ⓘ
                  - generic [ref=e393]: Visit 2 state parks.
                  - generic [ref=e394]: "Progress: 0 visits • Tier 0/5"
                  - generic [ref=e396]:
                    - text: 0/1 visits →
                    - strong [ref=e397]: L1 Rookie
                  - generic [ref=e399]:
                    - 'generic "→ In Progress – L1 Rookie: Visit 1 state park" [ref=e400]':
                      - generic [ref=e401]: L1
                      - generic [ref=e402]: Rookie
                      - generic [ref=e403]: ●
                    - 'generic "🔒 Locked – L2 Novice: Visit 3 state park" [ref=e404]':
                      - generic [ref=e405]: L2
                      - generic [ref=e406]: Novice
                      - generic [ref=e407]: 🔒
                    - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 state park" [ref=e408]':
                      - generic [ref=e409]: L3
                      - generic [ref=e410]: Semi-Pro
                      - generic [ref=e411]: 🔒
                    - 'generic "🔒 Locked – L4 Pro: Visit 10 state park" [ref=e412]':
                      - generic [ref=e413]: L4
                      - generic [ref=e414]: Pro
                      - generic [ref=e415]: 🔒
                    - 'generic "🔒 Locked – L5 MVP: Visit 15+ state park" [ref=e416]':
                      - generic [ref=e417]: L5
                      - generic [ref=e418]: MVP
                      - generic [ref=e419]: 🔒
                  - generic [ref=e420]:
                    - button "−" [ref=e421] [cursor=pointer]
                    - button "+ Log" [ref=e422] [cursor=pointer]
                    - button "📍 Qualifying Locations" [ref=e423] [cursor=pointer]
              - generic [ref=e425]:
                - generic [ref=e426]: 🏔️
                - generic [ref=e427]:
                  - generic [ref=e429]:
                    - generic [ref=e430]: National Park Day
                    - generic [ref=e431]: Challenge
                  - generic [ref=e432]:
                    - generic [ref=e433]: Not Started
                    - button "View all levels for National Park Day" [ref=e435] [cursor=pointer]: ⓘ
                  - generic [ref=e436]: Visit 1 national park.
                  - generic [ref=e437]: "Progress: 0 visits • Tier 0/5"
                  - generic [ref=e439]:
                    - text: 0/1 visits →
                    - strong [ref=e440]: L1 Rookie
                  - generic [ref=e442]:
                    - 'generic "→ In Progress – L1 Rookie: Visit 1 national park" [ref=e443]':
                      - generic [ref=e444]: L1
                      - generic [ref=e445]: Rookie
                      - generic [ref=e446]: ●
                    - 'generic "🔒 Locked – L2 Novice: Visit 3 national park" [ref=e447]':
                      - generic [ref=e448]: L2
                      - generic [ref=e449]: Novice
                      - generic [ref=e450]: 🔒
                    - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 national park" [ref=e451]':
                      - generic [ref=e452]: L3
                      - generic [ref=e453]: Semi-Pro
                      - generic [ref=e454]: 🔒
                    - 'generic "🔒 Locked – L4 Pro: Visit 10 national park" [ref=e455]':
                      - generic [ref=e456]: L4
                      - generic [ref=e457]: Pro
                      - generic [ref=e458]: 🔒
                    - 'generic "🔒 Locked – L5 MVP: Visit 15+ national park" [ref=e459]':
                      - generic [ref=e460]: L5
                      - generic [ref=e461]: MVP
                      - generic [ref=e462]: 🔒
                  - generic [ref=e463]:
                    - button "−" [ref=e464] [cursor=pointer]
                    - button "+ Log" [ref=e465] [cursor=pointer]
                    - button "📍 Qualifying Locations" [ref=e466] [cursor=pointer]
              - generic [ref=e468]:
                - generic [ref=e469]: 🏖️
                - generic [ref=e470]:
                  - generic [ref=e472]:
                    - generic [ref=e473]: Shoreline Explorer
                    - generic [ref=e474]: Challenge
                  - generic [ref=e475]:
                    - generic [ref=e476]: Not Started
                    - button "View all levels for Shoreline Explorer" [ref=e478] [cursor=pointer]: ⓘ
                  - generic [ref=e479]: Swim at 2 public beaches.
                  - generic [ref=e480]: "Progress: 0 visits • Tier 0/5"
                  - generic [ref=e482]:
                    - text: 0/1 visits →
                    - strong [ref=e483]: L1 Rookie
                  - generic [ref=e485]:
                    - 'generic "→ In Progress – L1 Rookie: Visit 1 beach" [ref=e486]':
                      - generic [ref=e487]: L1
                      - generic [ref=e488]: Rookie
                      - generic [ref=e489]: ●
                    - 'generic "🔒 Locked – L2 Novice: Visit 3 beach" [ref=e490]':
                      - generic [ref=e491]: L2
                      - generic [ref=e492]: Novice
                      - generic [ref=e493]: 🔒
                    - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 beach" [ref=e494]':
                      - generic [ref=e495]: L3
                      - generic [ref=e496]: Semi-Pro
                      - generic [ref=e497]: 🔒
                    - 'generic "🔒 Locked – L4 Pro: Visit 10 beach" [ref=e498]':
                      - generic [ref=e499]: L4
                      - generic [ref=e500]: Pro
                      - generic [ref=e501]: 🔒
                    - 'generic "🔒 Locked – L5 MVP: Visit 15+ beach" [ref=e502]':
                      - generic [ref=e503]: L5
                      - generic [ref=e504]: MVP
                      - generic [ref=e505]: 🔒
                  - generic [ref=e506]:
                    - button "−" [ref=e507] [cursor=pointer]
                    - button "+ Log" [ref=e508] [cursor=pointer]
                    - button "📍 Qualifying Locations" [ref=e509] [cursor=pointer]
              - generic [ref=e511]:
                - generic [ref=e512]: 🏞️
                - generic [ref=e513]:
                  - generic [ref=e515]:
                    - generic [ref=e516]: Lake & Pond Loop
                    - generic [ref=e517]: Challenge
                  - generic [ref=e518]:
                    - generic [ref=e519]: Not Started
                    - button "View all levels for Lake & Pond Loop" [ref=e521] [cursor=pointer]: ⓘ
                  - generic [ref=e522]: Explore 3 lakes or ponds.
                  - generic [ref=e523]: "Progress: 0 visits • Tier 0/5"
                  - generic [ref=e525]:
                    - text: 0/1 visits →
                    - strong [ref=e526]: L1 Rookie
                  - generic [ref=e528]:
                    - 'generic "→ In Progress – L1 Rookie: Visit 1 lake" [ref=e529]':
                      - generic [ref=e530]: L1
                      - generic [ref=e531]: Rookie
                      - generic [ref=e532]: ●
                    - 'generic "🔒 Locked – L2 Novice: Visit 3 lake" [ref=e533]':
                      - generic [ref=e534]: L2
                      - generic [ref=e535]: Novice
                      - generic [ref=e536]: 🔒
                    - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 lake" [ref=e537]':
                      - generic [ref=e538]: L3
                      - generic [ref=e539]: Semi-Pro
                      - generic [ref=e540]: 🔒
                    - 'generic "🔒 Locked – L4 Pro: Visit 10 lake" [ref=e541]':
                      - generic [ref=e542]: L4
                      - generic [ref=e543]: Pro
                      - generic [ref=e544]: 🔒
                    - 'generic "🔒 Locked – L5 MVP: Visit 15+ lake" [ref=e545]':
                      - generic [ref=e546]: L5
                      - generic [ref=e547]: MVP
                      - generic [ref=e548]: 🔒
                  - generic [ref=e549]:
                    - button "−" [ref=e550] [cursor=pointer]
                    - button "+ Log" [ref=e551] [cursor=pointer]
                    - button "📍 Qualifying Locations" [ref=e552] [cursor=pointer]
              - generic [ref=e554]:
                - generic [ref=e555]: 🌺
                - generic [ref=e556]:
                  - generic [ref=e558]:
                    - generic [ref=e559]: Garden Stroll
                    - generic [ref=e560]: Challenge
                  - generic [ref=e561]:
                    - generic [ref=e562]: Not Started
                    - button "View all levels for Garden Stroll" [ref=e564] [cursor=pointer]: ⓘ
                  - generic [ref=e565]: Visit 2 botanical gardens.
                  - generic [ref=e566]: "Progress: 0 visits • Tier 0/5"
                  - generic [ref=e568]:
                    - text: 0/1 visits →
                    - strong [ref=e569]: L1 Rookie
                  - generic [ref=e571]:
                    - 'generic "→ In Progress – L1 Rookie: Visit 1 gardens" [ref=e572]':
                      - generic [ref=e573]: L1
                      - generic [ref=e574]: Rookie
                      - generic [ref=e575]: ●
                    - 'generic "🔒 Locked – L2 Novice: Visit 3 gardens" [ref=e576]':
                      - generic [ref=e577]: L2
                      - generic [ref=e578]: Novice
                      - generic [ref=e579]: 🔒
                    - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 gardens" [ref=e580]':
                      - generic [ref=e581]: L3
                      - generic [ref=e582]: Semi-Pro
                      - generic [ref=e583]: 🔒
                    - 'generic "🔒 Locked – L4 Pro: Visit 10 gardens" [ref=e584]':
                      - generic [ref=e585]: L4
                      - generic [ref=e586]: Pro
                      - generic [ref=e587]: 🔒
                    - 'generic "🔒 Locked – L5 MVP: Visit 15+ gardens" [ref=e588]':
                      - generic [ref=e589]: L5
                      - generic [ref=e590]: MVP
                      - generic [ref=e591]: 🔒
                  - generic [ref=e592]:
                    - button "−" [ref=e593] [cursor=pointer]
                    - button "+ Log" [ref=e594] [cursor=pointer]
                    - button "📍 Qualifying Locations" [ref=e595] [cursor=pointer]
              - generic [ref=e597]:
                - generic [ref=e598]: 🏕️
                - generic [ref=e599]:
                  - generic [ref=e601]:
                    - generic [ref=e602]: Recreation Champion
                    - generic [ref=e603]: Challenge
                  - generic [ref=e604]:
                    - generic [ref=e605]: Not Started
                    - button "View all levels for Recreation Champion" [ref=e607] [cursor=pointer]: ⓘ
                  - generic [ref=e608]: Complete 4 recreation or day-use areas.
                  - generic [ref=e609]: "Progress: 0 visits • Tier 0/5"
                  - generic [ref=e611]:
                    - text: 0/1 visits →
                    - strong [ref=e612]: L1 Rookie
                  - generic [ref=e614]:
                    - 'generic "→ In Progress – L1 Rookie: Visit 1 rec area" [ref=e615]':
                      - generic [ref=e616]: L1
                      - generic [ref=e617]: Rookie
                      - generic [ref=e618]: ●
                    - 'generic "🔒 Locked – L2 Novice: Visit 3 rec area" [ref=e619]':
                      - generic [ref=e620]: L2
                      - generic [ref=e621]: Novice
                      - generic [ref=e622]: 🔒
                    - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 rec area" [ref=e623]':
                      - generic [ref=e624]: L3
                      - generic [ref=e625]: Semi-Pro
                      - generic [ref=e626]: 🔒
                    - 'generic "🔒 Locked – L4 Pro: Visit 10 rec area" [ref=e627]':
                      - generic [ref=e628]: L4
                      - generic [ref=e629]: Pro
                      - generic [ref=e630]: 🔒
                    - 'generic "🔒 Locked – L5 MVP: Visit 15+ rec area" [ref=e631]':
                      - generic [ref=e632]: L5
                      - generic [ref=e633]: MVP
                      - generic [ref=e634]: 🔒
                  - generic [ref=e635]:
                    - button "−" [ref=e636] [cursor=pointer]
                    - button "+ Log" [ref=e637] [cursor=pointer]
                    - button "📍 Qualifying Locations" [ref=e638] [cursor=pointer]
              - generic [ref=e640]:
                - generic [ref=e641]: 🔒
                - generic [ref=e642]:
                  - generic [ref=e644]:
                    - generic [ref=e645]: Trail Starter
                    - generic [ref=e646]: Common
                  - generic [ref=e647]:
                    - generic [ref=e648]: Not Started
                    - button "View all levels for Trail Starter" [ref=e650] [cursor=pointer]: ⓘ
                  - generic [ref=e652]:
                    - text: 0/1 trailheads →
                    - strong [ref=e653]: L1 Rookie
                  - button "📍 Qualifying Locations" [ref=e656] [cursor=pointer]
              - generic [ref=e658]:
                - generic [ref=e659]: 🔒
                - generic [ref=e660]:
                  - generic [ref=e662]:
                    - generic [ref=e663]: Waterfall Seeker
                    - generic [ref=e664]: Rare
                  - generic [ref=e665]:
                    - generic [ref=e666]: Not Started
                    - button "View all levels for Waterfall Seeker" [ref=e668] [cursor=pointer]: ⓘ
                  - generic [ref=e670]:
                    - text: 0/1 waterfalls →
                    - strong [ref=e671]: L1 Rookie
                  - button "📍 Qualifying Locations" [ref=e674] [cursor=pointer]
              - generic [ref=e676]:
                - generic [ref=e677]: 🔒
                - generic [ref=e678]:
                  - generic [ref=e680]:
                    - generic [ref=e681]: Park Ranger
                    - generic [ref=e682]: Rare
                  - generic [ref=e683]:
                    - generic [ref=e684]: Not Started
                    - button "View all levels for Park Ranger" [ref=e686] [cursor=pointer]: ⓘ
                  - generic [ref=e688]:
                    - text: 0/1 state parks →
                    - strong [ref=e689]: L1 Rookie
                  - button "📍 Qualifying Locations" [ref=e692] [cursor=pointer]
              - generic [ref=e694]:
                - generic [ref=e695]: 🔒
                - generic [ref=e696]:
                  - generic [ref=e698]:
                    - generic [ref=e699]: Camp Explorer
                    - generic [ref=e700]: Rare
                  - generic [ref=e701]:
                    - generic [ref=e702]: Not Started
                    - button "View all levels for Camp Explorer" [ref=e704] [cursor=pointer]: ⓘ
                  - generic [ref=e706]:
                    - text: 0/1 campgrounds →
                    - strong [ref=e707]: L1 Rookie
                  - button "📍 Qualifying Locations" [ref=e710] [cursor=pointer]
              - generic [ref=e712]:
                - generic [ref=e713]: 🔒
                - generic [ref=e714]:
                  - generic [ref=e716]:
                    - generic [ref=e717]: Lake Walker
                    - generic [ref=e718]: Epic
                  - generic [ref=e719]:
                    - generic [ref=e720]: Not Started
                    - button "View all levels for Lake Walker" [ref=e722] [cursor=pointer]: ⓘ
                  - generic [ref=e724]:
                    - text: 0/1 lakes & ponds →
                    - strong [ref=e725]: L1 Rookie
                  - button "📍 Qualifying Locations" [ref=e728] [cursor=pointer]
              - generic [ref=e730]:
                - generic [ref=e731]: 🔒
                - generic [ref=e732]:
                  - generic [ref=e734]:
                    - generic [ref=e735]: Summit Chaser
                    - generic [ref=e736]: Epic
                  - generic [ref=e737]:
                    - generic [ref=e738]: Not Started
                    - button "View all levels for Summit Chaser" [ref=e740] [cursor=pointer]: ⓘ
                  - generic [ref=e742]:
                    - text: 0/1 scenic overlooks →
                    - strong [ref=e743]: L1 Rookie
                  - button "📍 Qualifying Locations" [ref=e746] [cursor=pointer]
              - generic [ref=e748]:
                - generic [ref=e749]: 🔒
                - generic [ref=e750]:
                  - generic [ref=e752]:
                    - generic [ref=e753]: Beach Goer
                    - generic [ref=e754]: Rare
                  - generic [ref=e755]:
                    - generic [ref=e756]: Not Started
                    - button "View all levels for Beach Goer" [ref=e758] [cursor=pointer]: ⓘ
                  - generic [ref=e760]:
                    - text: 0/1 public beaches →
                    - strong [ref=e761]: L1 Rookie
                  - button "📍 Qualifying Locations" [ref=e764] [cursor=pointer]
              - generic [ref=e766]:
                - generic [ref=e767]: 🔒
                - generic [ref=e768]:
                  - generic [ref=e770]:
                    - generic [ref=e771]: Garden Lover
                    - generic [ref=e772]: Rare
                  - generic [ref=e773]:
                    - generic [ref=e774]: Not Started
                    - button "View all levels for Garden Lover" [ref=e776] [cursor=pointer]: ⓘ
                  - generic [ref=e778]:
                    - text: 0/1 botanical gardens →
                    - strong [ref=e779]: L1 Rookie
                  - button "📍 Qualifying Locations" [ref=e782] [cursor=pointer]
              - generic [ref=e784]:
                - generic [ref=e785]: 🔒
                - generic [ref=e786]:
                  - generic [ref=e788]:
                    - generic [ref=e789]: Outdoors Devotee
                    - generic [ref=e790]: Legendary
                  - generic [ref=e791]:
                    - generic [ref=e792]: Not Started
                    - button "View all levels for Outdoors Devotee" [ref=e794] [cursor=pointer]: ⓘ
                  - generic [ref=e796]:
                    - text: 0/1 total visits →
                    - strong [ref=e797]: L1 Rookie
                  - button "📍 Qualifying Locations" [ref=e800] [cursor=pointer]
              - generic [ref=e802]:
                - generic [ref=e803]: 🔒
                - generic [ref=e804]:
                  - generic [ref=e806]:
                    - generic [ref=e807]: Nature Champion
                    - generic [ref=e808]: Legendary
                  - generic [ref=e809]:
                    - generic [ref=e810]: Not Started
                    - button "View all levels for Nature Champion" [ref=e812] [cursor=pointer]: ⓘ
                  - generic [ref=e814]:
                    - text: 0/1 completed challenges →
                    - strong [ref=e815]: L1 Rookie
                  - button "📍 Qualifying Locations" [ref=e818] [cursor=pointer]
          - generic [ref=e819]:
            - generic [ref=e821]:
              - generic [ref=e822]: 📚 Seasonal Quests
              - generic [ref=e823]: Multi-step seasonal goals for Outdoors.
            - generic [ref=e824]:
              - generic [ref=e825]:
                - generic [ref=e826]: 🌸 Spring Now
                - generic [ref=e827]: Spring Awakening
                - generic [ref=e828]: 0/3 steps
                - generic [ref=e829]:
                  - generic [ref=e830]:
                    - generic [ref=e831]: ○
                    - generic [ref=e832]: Visit 3 parks or gardens
                    - generic [ref=e833]: Auto
                  - generic [ref=e834]:
                    - generic [ref=e835]: ○
                    - generic [ref=e836]: Find a waterfall
                    - generic [ref=e837]: Auto
                  - generic [ref=e838]:
                    - generic [ref=e839]: ○
                    - generic [ref=e840]: Hike a trail
                    - generic [ref=e841]: Auto
              - generic [ref=e842]:
                - generic [ref=e843]: ☀️ Summer
                - generic [ref=e844]: Summer Expedition
                - generic [ref=e845]: 0/3 steps
                - generic [ref=e846]:
                  - generic [ref=e847]:
                    - generic [ref=e848]: ○
                    - generic [ref=e849]: Swim at a public beach
                    - generic [ref=e850]: Auto
                  - generic [ref=e851]:
                    - generic [ref=e852]: ○
                    - generic [ref=e853]: Visit a recreation area
                    - generic [ref=e854]: Auto
                  - generic [ref=e855]:
                    - generic [ref=e856]: ○
                    - generic [ref=e857]: Camp overnight
                    - generic [ref=e858]: Auto
              - generic [ref=e859]:
                - generic [ref=e860]: 🍂 Fall
                - generic [ref=e861]: Fall Foliage Tour
                - generic [ref=e862]: 0/3 steps
                - generic [ref=e863]:
                  - generic [ref=e864]:
                    - generic [ref=e865]: ○
                    - generic [ref=e866]: Visit 3 scenic overlooks
                    - generic [ref=e867]: Auto
                  - generic [ref=e868]:
                    - generic [ref=e869]: ○
                    - generic [ref=e870]: Explore a state park
                    - generic [ref=e871]: Auto
                  - generic [ref=e872]:
                    - generic [ref=e873]: ○
                    - generic [ref=e874]: Find a lake or pond
                    - generic [ref=e875]: Auto
              - generic [ref=e876]:
                - generic [ref=e877]: ❄️ Winter
                - generic [ref=e878]: Winter Wild Side
                - generic [ref=e879]: 0/3 steps
                - generic [ref=e880]:
                  - generic [ref=e881]:
                    - generic [ref=e882]: ○
                    - generic [ref=e883]: Find a waterfall (brave the cold!)
                    - generic [ref=e884]: Auto
                  - generic [ref=e885]:
                    - generic [ref=e886]: ○
                    - generic [ref=e887]: Hike a trailhead
                    - generic [ref=e888]: Auto
                  - generic [ref=e889]:
                    - generic [ref=e890]: ○
                    - generic [ref=e891]: Visit a botanical garden
                    - generic [ref=e892]: Auto
          - generic [ref=e893]:
            - generic [ref=e894]:
              - generic [ref=e895]:
                - generic [ref=e896]: 🟩 Outdoors Bingo
                - generic [ref=e897]: Auto-synced from your logged visits. Complete a row, column, or diagonal for BINGO!
              - generic [ref=e898]: 0/9
            - generic [ref=e899]:
              - generic "Trailhead not completed" [ref=e900] [cursor=pointer]:
                - generic [ref=e901]: 🥾
                - generic [ref=e902]: Trailhead
              - generic "Waterfall not completed" [ref=e903] [cursor=pointer]:
                - generic [ref=e904]: 💧
                - generic [ref=e905]: Waterfall
              - generic "State Park not completed" [ref=e906] [cursor=pointer]:
                - generic [ref=e907]: 🌲
                - generic [ref=e908]: State Park
              - generic "Campground not completed" [ref=e909] [cursor=pointer]:
                - generic [ref=e910]: ⛺
                - generic [ref=e911]: Campground
              - generic "Scenic Overlook not completed" [ref=e912] [cursor=pointer]:
                - generic [ref=e913]: 🏔️
                - generic [ref=e914]: Scenic Overlook
              - generic "Lake or Pond not completed" [ref=e915] [cursor=pointer]:
                - generic [ref=e916]: 🏞️
                - generic [ref=e917]: Lake or Pond
              - generic "Public Beach not completed" [ref=e918] [cursor=pointer]:
                - generic [ref=e919]: 🏖️
                - generic [ref=e920]: Public Beach
              - generic "National Park not completed" [ref=e921] [cursor=pointer]:
                - generic [ref=e922]: 🏔️
                - generic [ref=e923]: National Park
              - generic "Botanical Garden not completed" [ref=e924] [cursor=pointer]:
                - generic [ref=e925]: 🌺
                - generic [ref=e926]: Botanical Garden
            - generic [ref=e927]: 0/9 tiles marked
      - text: "1"
      - group "🧰 Diagnostics, Sync and Clean Up" [ref=e928]:
        - generic "🧰 Diagnostics, Sync and Clean Up Sync health, local queue visibility, and visited tracker diagnostics. ▾" [ref=e929] [cursor=pointer]:
          - generic [ref=e930]:
            - generic [ref=e931]: 🧰 Diagnostics, Sync and Clean Up
            - generic [ref=e932]: Sync health, local queue visibility, and visited tracker diagnostics.
          - text: ▾
        - option "Strict (Place ID + exact name)"
        - option "Balanced (Place ID + exact + fuzzy)" [selected]
        - option "Name Only (exact + fuzzy)"
  - button "Deployment 2026.04.23.live-debug.1 OK (4/4)" [ref=e934] [cursor=pointer]
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
  11 |   /Failed to load resource: the server responded with a status of 404 \(Not Found\) \(https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/root:\/.+:\/workbook\/worksheets\?\$select=id,name,position\)/i
  12 | ];
  13 | 
  14 | function isIntentionalWorkbookProbe404(text, locationUrl) {
  15 |   const msg = String(text || '');
  16 |   const url = String(locationUrl || '');
  17 |   const combined = `${msg}\n${url}`;
  18 |   if (
  19 |     /Failed to load resource: the server responded with a status of 404 \(Not Found\)/i.test(msg)
  20 |     && /https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/root:\//i.test(combined)
  21 |     && (/\/workbook\/tables(?:\)|$)/i.test(combined) || /\/workbook\/worksheets\?\$select=id,name,position/i.test(combined))
  22 |   ) {
  23 |     return true;
  24 |   }
  25 |   return (
  26 |     /Failed to load resource: the server responded with a status of 404 \(Not Found\)/i.test(msg)
  27 |     && (
  28 |       /https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/root:\/Retail_Food_and_Drink\.xlsx:\/workbook\/tables\/Retail\/columns\?\$select=name,index/i.test(url)
  29 |       || /https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/root:\/.+:\/workbook\/tables\)?/i.test(msg)
  30 |       || /https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/root:\/.+:\/workbook\/worksheets\?\$select=id,name,position\)?/i.test(msg)
  31 |     )
  32 |   );
  33 | }
  34 | 
  35 | function isIgnoredExtensionNoise(text, locationUrl) {
  36 |   if (isIntentionalWorkbookProbe404(text, locationUrl)) return true;
  37 |   const candidate = `${String(text || '')}\n${String(locationUrl || '')}`;
  38 |   return EXTENSION_NOISE_PATTERNS.some((pattern) => pattern.test(candidate));
  39 | }
  40 | 
  41 | const test = base.extend({
  42 |   page: async ({ page }, use, testInfo) => {
  43 |     const unexpectedErrors = [];
  44 | 
  45 |     const onConsole = (msg) => {
  46 |       if (msg.type() !== 'error') return;
  47 |       const location = msg.location ? msg.location() : { url: '' };
  48 |       const text = msg.text();
  49 |       if (isIgnoredExtensionNoise(text, location && location.url)) return;
  50 |       unexpectedErrors.push({
  51 |         source: 'console',
  52 |         text,
  53 |         url: (location && location.url) || ''
  54 |       });
  55 |     };
  56 | 
  57 |     const onPageError = (error) => {
  58 |       const message = error && error.message ? String(error.message) : String(error || 'Unknown page error');
  59 |       const stack = error && error.stack ? String(error.stack) : '';
  60 |       if (isIgnoredExtensionNoise(`${message}\n${stack}`, '')) return;
  61 |       unexpectedErrors.push({
  62 |         source: 'pageerror',
  63 |         text: message,
  64 |         url: ''
  65 |       });
  66 |     };
  67 | 
  68 |     page.on('console', onConsole);
  69 |     page.on('pageerror', onPageError);
  70 | 
  71 |     await use(page);
  72 | 
  73 |     page.off('console', onConsole);
  74 |     page.off('pageerror', onPageError);
  75 | 
  76 |     if (unexpectedErrors.length) {
  77 |       const preview = unexpectedErrors
  78 |         .slice(0, 5)
  79 |         .map((row, idx) => `${idx + 1}. [${row.source}] ${row.text}${row.url ? ` (${row.url})` : ''}`)
  80 |         .join('\n');
  81 | 
  82 |       await testInfo.attach('unexpected-browser-errors.txt', {
  83 |         body: Buffer.from(preview, 'utf8'),
  84 |         contentType: 'text/plain'
  85 |       });
  86 | 
> 87 |       throw new Error(`Unexpected browser errors detected:\n${preview}`);
     |             ^ Error: Unexpected browser errors detected:
  88 |     }
  89 |   }
  90 | });
  91 | 
  92 | module.exports = { test, expect, isIgnoredExtensionNoise };
  93 | 
  94 | 
```