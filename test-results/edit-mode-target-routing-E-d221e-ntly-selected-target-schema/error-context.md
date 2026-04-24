# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: edit-mode-target-routing.spec.js >> Edit Mode target-table routing >> Add Single, Bulk Add, and Bulk Chain write using the currently selected target schema
- Location: tests/edit-mode-target-routing.spec.js:233:3

# Error details

```
Error: Unexpected browser errors detected:
1. [console] Failed to load resource: the server responded with a status of 401 () (https://graph.microsoft.com/v1.0/me/drive/root:/Copilot_Apps/Kyles_Adventure_Finder/Nature_Locations.xlsx:/workbook/tables/Nature_Locations/range?$select=values)
2. [console] Failed to load resource: the server responded with a status of 401 () (https://graph.microsoft.com/v1.0/me/drive/root:/Copilot_Apps/Kyles_Adventure_Finder/Adventure%20Challenge/Nature_Locations.xlsx:/workbook/tables/Nature_Locations/range?$select=values)
3. [console] Failed to load resource: the server responded with a status of 401 () (https://graph.microsoft.com/v1.0/me/drive/root:/Nature_Locations.xlsx:/workbook/tables/Nature_Locations/range?$select=values)
4. [console] Failed to load resource: the server responded with a status of 401 () (https://graph.microsoft.com/v1.0/me/drive/root:/Copilot_Apps/Kyles_Adventure_Finder/Bike_Trail_Planner.xlsx:/workbook/tables/BikeTrails/columns)
5. [console] Failed to load resource: the server responded with a status of 401 () (https://graph.microsoft.com/v1.0/me/drive/root:/Copilot_Apps/Kyles_Adventure_Finder/Bike_Trail_Planner.xlsx:/workbook/tables/BikeTrails/columns)
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic "Click to expand/collapse errors" [ref=e3] [cursor=pointer]:
    - generic [ref=e4]:
      - generic [ref=e5]: ⚠️ Errors Detected
      - generic [ref=e6]: "0"
      - generic [ref=e7]: "Overlay: OK"
    - generic [ref=e8]: ▼
  - generic "Click to expand/collapse" [ref=e10] [cursor=pointer]:
    - generic [ref=e11]:
      - text: 🔧 Advanced Debug Console
      - generic [ref=e12]: "Startup timing: interactive 99 ms | overlay off 449 ms"
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
        - button "Sign In" [ref=e32] [cursor=pointer]
      - generic [ref=e33]: Not signed in
  - status [ref=e34]:
    - generic [ref=e35]: "🔐 Sign in required: connect your Microsoft account to load Excel data and use core app features."
    - button "Sign In Now" [ref=e36] [cursor=pointer]
  - generic [ref=e37]:
    - generic [ref=e38]:
      - button "🎮 Adventure Challenge" [ref=e39] [cursor=pointer]
      - button "🌿 Nature Challenge" [ref=e40] [cursor=pointer]
      - button "🏔️ Adventure Planner" [ref=e41] [cursor=pointer]
      - button "🧰 Household Tools" [ref=e42] [cursor=pointer]
      - button "🐦 Birding Locations" [ref=e43] [cursor=pointer]
      - button "🚴 Bike Trails" [ref=e44] [cursor=pointer]
    - tablist "Adventure Challenge categories" [ref=e48]:
      - tab "Open Outdoors section" [selected] [ref=e49] [cursor=pointer]: 🌲 Outdoors
      - tab "Open Entertainment section" [ref=e50] [cursor=pointer]: 🎬 Entertainment
      - tab "Open Food and Drink section" [ref=e51] [cursor=pointer]: 🍽️ Food & Drink
      - tab "Open Retail section" [ref=e52] [cursor=pointer]: 🛍️ Retail
      - tab "Open Wildlife and Animals section" [ref=e53] [cursor=pointer]: 🦌 Wildlife & Animals
      - tab "Open Regional Festivals section" [ref=e54] [cursor=pointer]: 🎉 Regional Festivals
      - tab "Open Bike Trails section" [ref=e55] [cursor=pointer]: 🚴 Bike Trails
    - generic [ref=e58]:
      - generic [ref=e59]:
        - heading "Adventure Challenge - Outdoors" [level=1] [ref=e60]
        - navigation "Jump to section links" [ref=e61]:
          - generic [ref=e62]: "Jump to section:"
          - button "📊 Category Progression" [ref=e63] [cursor=pointer]
          - button "🏅 Challenges & Badges" [ref=e64] [cursor=pointer]
          - button "📚 Seasonal Quests" [ref=e65] [cursor=pointer]
          - button "🟩 Outdoors Bingo" [ref=e66] [cursor=pointer]
          - button "🧰 Diagnostics, Sync and Clean Up" [ref=e67] [cursor=pointer]
      - generic [ref=e68]: 🌲 Outdoors section active
      - tabpanel "Open Outdoors section" [ref=e69]:
        - generic [ref=e70]:
          - generic [ref=e71]:
            - generic [ref=e72]: 🌲 Outdoors
            - generic [ref=e73]: Browse and plan outdoor locations you want to visit.
          - generic [ref=e74]:
            - generic [ref=e75]:
              - text: "Outdoors data: fallback in use"
              - button "Sync category totals" [ref=e76] [cursor=pointer]
              - text: "0 locations | Source: Nature_Locations.xlsx / Nature_Locations Updated 4/24/2026, 5:28:31 PM | Unable to load Nature_Locations from Nature_Locations.xlsx (HTTP 401)"
            - generic [ref=e77]:
              - button "🔎 Explore Outdoors" [ref=e78] [cursor=pointer]
              - button "🏙️ City Explorer" [ref=e79] [cursor=pointer]
              - button "Log a Visit" [ref=e80] [cursor=pointer]
              - button "📝 Edit Mode" [ref=e81] [cursor=pointer]
              - button "Refresh Data" [ref=e82] [cursor=pointer]
              - button "↶ Undo" [disabled] [ref=e83] [cursor=pointer]
        - generic [ref=e84]:
          - generic [ref=e85]:
            - generic [ref=e87]:
              - generic [ref=e88]: 📊 Category Progression
              - generic [ref=e89]:
                - text: "Track your Outdoors visits by category. Total logged:"
                - strong [ref=e90]: "0"
                - text: .
                - button "Log Visit" [ref=e91] [cursor=pointer]
            - generic [ref=e92]:
              - generic [ref=e93]:
                - generic [ref=e94]: 🥾
                - generic [ref=e95]: Trailheads
                - generic [ref=e96]: 0 / ?
                - generic [ref=e97]: 0% complete
                - generic [ref=e100]: Auto-tracked from visit logs
              - generic [ref=e101]:
                - generic [ref=e102]: 💧
                - generic [ref=e103]: Waterfalls
                - generic [ref=e104]: 0 / ?
                - generic [ref=e105]: 0% complete
                - generic [ref=e108]: Auto-tracked from visit logs
              - generic [ref=e109]:
                - generic [ref=e110]: 🏔️
                - generic [ref=e111]: Scenic Overlooks
                - generic [ref=e112]: 0 / ?
                - generic [ref=e113]: 0% complete
                - generic [ref=e116]: Auto-tracked from visit logs
              - generic [ref=e117]:
                - generic [ref=e118]: ⛺
                - generic [ref=e119]: Campgrounds
                - generic [ref=e120]: 0 / ?
                - generic [ref=e121]: 0% complete
                - generic [ref=e124]: Auto-tracked from visit logs
              - generic [ref=e125]:
                - generic [ref=e126]: 🌲
                - generic [ref=e127]: State Parks
                - generic [ref=e128]: 0 / ?
                - generic [ref=e129]: 0% complete
                - generic [ref=e132]: Auto-tracked from visit logs
              - generic [ref=e133]:
                - generic [ref=e134]: 🏔️
                - generic [ref=e135]: National Parks
                - generic [ref=e136]: 0 / ?
                - generic [ref=e137]: 0% complete
                - generic [ref=e140]: Auto-tracked from visit logs
              - generic [ref=e141]:
                - generic [ref=e142]: 🏖️
                - generic [ref=e143]: Public Beaches
                - generic [ref=e144]: 0 / ?
                - generic [ref=e145]: 0% complete
                - generic [ref=e148]: Auto-tracked from visit logs
              - generic [ref=e149]:
                - generic [ref=e150]: 🏞️
                - generic [ref=e151]: Lakes & Ponds
                - generic [ref=e152]: 0 / ?
                - generic [ref=e153]: 0% complete
                - generic [ref=e156]: Auto-tracked from visit logs
              - generic [ref=e157]:
                - generic [ref=e158]: 🏕️
                - generic [ref=e159]: Recreation Areas
                - generic [ref=e160]: 0 / ?
                - generic [ref=e161]: 0% complete
                - generic [ref=e164]: Auto-tracked from visit logs
              - generic [ref=e165]:
                - generic [ref=e166]: 🌺
                - generic [ref=e167]: Botanical Gardens
                - generic [ref=e168]: 0 / ?
                - generic [ref=e169]: 0% complete
                - generic [ref=e172]: Auto-tracked from visit logs
          - generic [ref=e173]:
            - generic [ref=e174]:
              - generic [ref=e175]:
                - generic [ref=e176]: 🏅 Challenges & Badges
                - generic [ref=e177]: Challenge goals and badges now share one achievement wall using the same badge layout.
              - generic [ref=e178]: 0/100
            - generic [ref=e179]:
              - generic [ref=e181]:
                - generic [ref=e182]: 🥾
                - generic [ref=e183]:
                  - generic [ref=e185]:
                    - generic [ref=e186]: Trailhead Seeker
                    - generic [ref=e187]: Challenge
                  - generic [ref=e188]:
                    - generic [ref=e189]: Not Started
                    - button "View all levels for Trailhead Seeker" [ref=e191] [cursor=pointer]: ⓘ
                  - generic [ref=e192]: Visit 3 trailheads.
                  - generic [ref=e193]: "Progress: 0 visits • Tier 0/5"
                  - generic [ref=e195]:
                    - text: 0/1 visits →
                    - strong [ref=e196]: L1 Rookie
                  - generic [ref=e198]:
                    - 'generic "→ In Progress – L1 Rookie: Visit 1 trailhead" [ref=e199]':
                      - generic [ref=e200]: L1
                      - generic [ref=e201]: Rookie
                      - generic [ref=e202]: ●
                    - 'generic "🔒 Locked – L2 Novice: Visit 3 trailhead" [ref=e203]':
                      - generic [ref=e204]: L2
                      - generic [ref=e205]: Novice
                      - generic [ref=e206]: 🔒
                    - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 trailhead" [ref=e207]':
                      - generic [ref=e208]: L3
                      - generic [ref=e209]: Semi-Pro
                      - generic [ref=e210]: 🔒
                    - 'generic "🔒 Locked – L4 Pro: Visit 10 trailhead" [ref=e211]':
                      - generic [ref=e212]: L4
                      - generic [ref=e213]: Pro
                      - generic [ref=e214]: 🔒
                    - 'generic "🔒 Locked – L5 MVP: Visit 15+ trailhead" [ref=e215]':
                      - generic [ref=e216]: L5
                      - generic [ref=e217]: MVP
                      - generic [ref=e218]: 🔒
                  - generic [ref=e219]:
                    - button "−" [ref=e220] [cursor=pointer]
                    - button "+ Log" [ref=e221] [cursor=pointer]
              - generic [ref=e223]:
                - generic [ref=e224]: 💧
                - generic [ref=e225]:
                  - generic [ref=e227]:
                    - generic [ref=e228]: Waterfall Hunter
                    - generic [ref=e229]: Challenge
                  - generic [ref=e230]:
                    - generic [ref=e231]: Not Started
                    - button "View all levels for Waterfall Hunter" [ref=e233] [cursor=pointer]: ⓘ
                  - generic [ref=e234]: Discover 3 waterfalls.
                  - generic [ref=e235]: "Progress: 0 visits • Tier 0/5"
                  - generic [ref=e237]:
                    - text: 0/1 visits →
                    - strong [ref=e238]: L1 Rookie
                  - generic [ref=e240]:
                    - 'generic "→ In Progress – L1 Rookie: Visit 1 waterfall" [ref=e241]':
                      - generic [ref=e242]: L1
                      - generic [ref=e243]: Rookie
                      - generic [ref=e244]: ●
                    - 'generic "🔒 Locked – L2 Novice: Visit 3 waterfall" [ref=e245]':
                      - generic [ref=e246]: L2
                      - generic [ref=e247]: Novice
                      - generic [ref=e248]: 🔒
                    - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 waterfall" [ref=e249]':
                      - generic [ref=e250]: L3
                      - generic [ref=e251]: Semi-Pro
                      - generic [ref=e252]: 🔒
                    - 'generic "🔒 Locked – L4 Pro: Visit 10 waterfall" [ref=e253]':
                      - generic [ref=e254]: L4
                      - generic [ref=e255]: Pro
                      - generic [ref=e256]: 🔒
                    - 'generic "🔒 Locked – L5 MVP: Visit 15+ waterfall" [ref=e257]':
                      - generic [ref=e258]: L5
                      - generic [ref=e259]: MVP
                      - generic [ref=e260]: 🔒
                  - generic [ref=e261]:
                    - button "−" [ref=e262] [cursor=pointer]
                    - button "+ Log" [ref=e263] [cursor=pointer]
              - generic [ref=e265]:
                - generic [ref=e266]: 🏔️
                - generic [ref=e267]:
                  - generic [ref=e269]:
                    - generic [ref=e270]: Overlook Explorer
                    - generic [ref=e271]: Challenge
                  - generic [ref=e272]:
                    - generic [ref=e273]: Not Started
                    - button "View all levels for Overlook Explorer" [ref=e275] [cursor=pointer]: ⓘ
                  - generic [ref=e276]: Find 3 scenic overlooks or viewpoints.
                  - generic [ref=e277]: "Progress: 0 visits • Tier 0/5"
                  - generic [ref=e279]:
                    - text: 0/1 visits →
                    - strong [ref=e280]: L1 Rookie
                  - generic [ref=e282]:
                    - 'generic "→ In Progress – L1 Rookie: Visit 1 scenic" [ref=e283]':
                      - generic [ref=e284]: L1
                      - generic [ref=e285]: Rookie
                      - generic [ref=e286]: ●
                    - 'generic "🔒 Locked – L2 Novice: Visit 3 scenic" [ref=e287]':
                      - generic [ref=e288]: L2
                      - generic [ref=e289]: Novice
                      - generic [ref=e290]: 🔒
                    - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 scenic" [ref=e291]':
                      - generic [ref=e292]: L3
                      - generic [ref=e293]: Semi-Pro
                      - generic [ref=e294]: 🔒
                    - 'generic "🔒 Locked – L4 Pro: Visit 10 scenic" [ref=e295]':
                      - generic [ref=e296]: L4
                      - generic [ref=e297]: Pro
                      - generic [ref=e298]: 🔒
                    - 'generic "🔒 Locked – L5 MVP: Visit 15+ scenic" [ref=e299]':
                      - generic [ref=e300]: L5
                      - generic [ref=e301]: MVP
                      - generic [ref=e302]: 🔒
                  - generic [ref=e303]:
                    - button "−" [ref=e304] [cursor=pointer]
                    - button "+ Log" [ref=e305] [cursor=pointer]
              - generic [ref=e307]:
                - generic [ref=e308]: ⛺
                - generic [ref=e309]:
                  - generic [ref=e311]:
                    - generic [ref=e312]: Campfire Nights
                    - generic [ref=e313]: Challenge
                  - generic [ref=e314]:
                    - generic [ref=e315]: Not Started
                    - button "View all levels for Campfire Nights" [ref=e317] [cursor=pointer]: ⓘ
                  - generic [ref=e318]: Camp at 2 campgrounds.
                  - generic [ref=e319]: "Progress: 0 visits • Tier 0/5"
                  - generic [ref=e321]:
                    - text: 0/1 visits →
                    - strong [ref=e322]: L1 Rookie
                  - generic [ref=e324]:
                    - 'generic "→ In Progress – L1 Rookie: Visit 1 campground" [ref=e325]':
                      - generic [ref=e326]: L1
                      - generic [ref=e327]: Rookie
                      - generic [ref=e328]: ●
                    - 'generic "🔒 Locked – L2 Novice: Visit 3 campground" [ref=e329]':
                      - generic [ref=e330]: L2
                      - generic [ref=e331]: Novice
                      - generic [ref=e332]: 🔒
                    - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 campground" [ref=e333]':
                      - generic [ref=e334]: L3
                      - generic [ref=e335]: Semi-Pro
                      - generic [ref=e336]: 🔒
                    - 'generic "🔒 Locked – L4 Pro: Visit 10 campground" [ref=e337]':
                      - generic [ref=e338]: L4
                      - generic [ref=e339]: Pro
                      - generic [ref=e340]: 🔒
                    - 'generic "🔒 Locked – L5 MVP: Visit 15+ campground" [ref=e341]':
                      - generic [ref=e342]: L5
                      - generic [ref=e343]: MVP
                      - generic [ref=e344]: 🔒
                  - generic [ref=e345]:
                    - button "−" [ref=e346] [cursor=pointer]
                    - button "+ Log" [ref=e347] [cursor=pointer]
              - generic [ref=e349]:
                - generic [ref=e350]: 🌲
                - generic [ref=e351]:
                  - generic [ref=e353]:
                    - generic [ref=e354]: State Park Tour
                    - generic [ref=e355]: Challenge
                  - generic [ref=e356]:
                    - generic [ref=e357]: Not Started
                    - button "View all levels for State Park Tour" [ref=e359] [cursor=pointer]: ⓘ
                  - generic [ref=e360]: Visit 2 state parks.
                  - generic [ref=e361]: "Progress: 0 visits • Tier 0/5"
                  - generic [ref=e363]:
                    - text: 0/1 visits →
                    - strong [ref=e364]: L1 Rookie
                  - generic [ref=e366]:
                    - 'generic "→ In Progress – L1 Rookie: Visit 1 state park" [ref=e367]':
                      - generic [ref=e368]: L1
                      - generic [ref=e369]: Rookie
                      - generic [ref=e370]: ●
                    - 'generic "🔒 Locked – L2 Novice: Visit 3 state park" [ref=e371]':
                      - generic [ref=e372]: L2
                      - generic [ref=e373]: Novice
                      - generic [ref=e374]: 🔒
                    - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 state park" [ref=e375]':
                      - generic [ref=e376]: L3
                      - generic [ref=e377]: Semi-Pro
                      - generic [ref=e378]: 🔒
                    - 'generic "🔒 Locked – L4 Pro: Visit 10 state park" [ref=e379]':
                      - generic [ref=e380]: L4
                      - generic [ref=e381]: Pro
                      - generic [ref=e382]: 🔒
                    - 'generic "🔒 Locked – L5 MVP: Visit 15+ state park" [ref=e383]':
                      - generic [ref=e384]: L5
                      - generic [ref=e385]: MVP
                      - generic [ref=e386]: 🔒
                  - generic [ref=e387]:
                    - button "−" [ref=e388] [cursor=pointer]
                    - button "+ Log" [ref=e389] [cursor=pointer]
              - generic [ref=e391]:
                - generic [ref=e392]: 🏔️
                - generic [ref=e393]:
                  - generic [ref=e395]:
                    - generic [ref=e396]: National Park Day
                    - generic [ref=e397]: Challenge
                  - generic [ref=e398]:
                    - generic [ref=e399]: Not Started
                    - button "View all levels for National Park Day" [ref=e401] [cursor=pointer]: ⓘ
                  - generic [ref=e402]: Visit 1 national park.
                  - generic [ref=e403]: "Progress: 0 visits • Tier 0/5"
                  - generic [ref=e405]:
                    - text: 0/1 visits →
                    - strong [ref=e406]: L1 Rookie
                  - generic [ref=e408]:
                    - 'generic "→ In Progress – L1 Rookie: Visit 1 national park" [ref=e409]':
                      - generic [ref=e410]: L1
                      - generic [ref=e411]: Rookie
                      - generic [ref=e412]: ●
                    - 'generic "🔒 Locked – L2 Novice: Visit 3 national park" [ref=e413]':
                      - generic [ref=e414]: L2
                      - generic [ref=e415]: Novice
                      - generic [ref=e416]: 🔒
                    - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 national park" [ref=e417]':
                      - generic [ref=e418]: L3
                      - generic [ref=e419]: Semi-Pro
                      - generic [ref=e420]: 🔒
                    - 'generic "🔒 Locked – L4 Pro: Visit 10 national park" [ref=e421]':
                      - generic [ref=e422]: L4
                      - generic [ref=e423]: Pro
                      - generic [ref=e424]: 🔒
                    - 'generic "🔒 Locked – L5 MVP: Visit 15+ national park" [ref=e425]':
                      - generic [ref=e426]: L5
                      - generic [ref=e427]: MVP
                      - generic [ref=e428]: 🔒
                  - generic [ref=e429]:
                    - button "−" [ref=e430] [cursor=pointer]
                    - button "+ Log" [ref=e431] [cursor=pointer]
              - generic [ref=e433]:
                - generic [ref=e434]: 🏖️
                - generic [ref=e435]:
                  - generic [ref=e437]:
                    - generic [ref=e438]: Shoreline Explorer
                    - generic [ref=e439]: Challenge
                  - generic [ref=e440]:
                    - generic [ref=e441]: Not Started
                    - button "View all levels for Shoreline Explorer" [ref=e443] [cursor=pointer]: ⓘ
                  - generic [ref=e444]: Swim at 2 public beaches.
                  - generic [ref=e445]: "Progress: 0 visits • Tier 0/5"
                  - generic [ref=e447]:
                    - text: 0/1 visits →
                    - strong [ref=e448]: L1 Rookie
                  - generic [ref=e450]:
                    - 'generic "→ In Progress – L1 Rookie: Visit 1 beach" [ref=e451]':
                      - generic [ref=e452]: L1
                      - generic [ref=e453]: Rookie
                      - generic [ref=e454]: ●
                    - 'generic "🔒 Locked – L2 Novice: Visit 3 beach" [ref=e455]':
                      - generic [ref=e456]: L2
                      - generic [ref=e457]: Novice
                      - generic [ref=e458]: 🔒
                    - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 beach" [ref=e459]':
                      - generic [ref=e460]: L3
                      - generic [ref=e461]: Semi-Pro
                      - generic [ref=e462]: 🔒
                    - 'generic "🔒 Locked – L4 Pro: Visit 10 beach" [ref=e463]':
                      - generic [ref=e464]: L4
                      - generic [ref=e465]: Pro
                      - generic [ref=e466]: 🔒
                    - 'generic "🔒 Locked – L5 MVP: Visit 15+ beach" [ref=e467]':
                      - generic [ref=e468]: L5
                      - generic [ref=e469]: MVP
                      - generic [ref=e470]: 🔒
                  - generic [ref=e471]:
                    - button "−" [ref=e472] [cursor=pointer]
                    - button "+ Log" [ref=e473] [cursor=pointer]
              - generic [ref=e475]:
                - generic [ref=e476]: 🏞️
                - generic [ref=e477]:
                  - generic [ref=e479]:
                    - generic [ref=e480]: Lake & Pond Loop
                    - generic [ref=e481]: Challenge
                  - generic [ref=e482]:
                    - generic [ref=e483]: Not Started
                    - button "View all levels for Lake & Pond Loop" [ref=e485] [cursor=pointer]: ⓘ
                  - generic [ref=e486]: Explore 3 lakes or ponds.
                  - generic [ref=e487]: "Progress: 0 visits • Tier 0/5"
                  - generic [ref=e489]:
                    - text: 0/1 visits →
                    - strong [ref=e490]: L1 Rookie
                  - generic [ref=e492]:
                    - 'generic "→ In Progress – L1 Rookie: Visit 1 lake" [ref=e493]':
                      - generic [ref=e494]: L1
                      - generic [ref=e495]: Rookie
                      - generic [ref=e496]: ●
                    - 'generic "🔒 Locked – L2 Novice: Visit 3 lake" [ref=e497]':
                      - generic [ref=e498]: L2
                      - generic [ref=e499]: Novice
                      - generic [ref=e500]: 🔒
                    - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 lake" [ref=e501]':
                      - generic [ref=e502]: L3
                      - generic [ref=e503]: Semi-Pro
                      - generic [ref=e504]: 🔒
                    - 'generic "🔒 Locked – L4 Pro: Visit 10 lake" [ref=e505]':
                      - generic [ref=e506]: L4
                      - generic [ref=e507]: Pro
                      - generic [ref=e508]: 🔒
                    - 'generic "🔒 Locked – L5 MVP: Visit 15+ lake" [ref=e509]':
                      - generic [ref=e510]: L5
                      - generic [ref=e511]: MVP
                      - generic [ref=e512]: 🔒
                  - generic [ref=e513]:
                    - button "−" [ref=e514] [cursor=pointer]
                    - button "+ Log" [ref=e515] [cursor=pointer]
              - generic [ref=e517]:
                - generic [ref=e518]: 🌺
                - generic [ref=e519]:
                  - generic [ref=e521]:
                    - generic [ref=e522]: Garden Stroll
                    - generic [ref=e523]: Challenge
                  - generic [ref=e524]:
                    - generic [ref=e525]: Not Started
                    - button "View all levels for Garden Stroll" [ref=e527] [cursor=pointer]: ⓘ
                  - generic [ref=e528]: Visit 2 botanical gardens.
                  - generic [ref=e529]: "Progress: 0 visits • Tier 0/5"
                  - generic [ref=e531]:
                    - text: 0/1 visits →
                    - strong [ref=e532]: L1 Rookie
                  - generic [ref=e534]:
                    - 'generic "→ In Progress – L1 Rookie: Visit 1 gardens" [ref=e535]':
                      - generic [ref=e536]: L1
                      - generic [ref=e537]: Rookie
                      - generic [ref=e538]: ●
                    - 'generic "🔒 Locked – L2 Novice: Visit 3 gardens" [ref=e539]':
                      - generic [ref=e540]: L2
                      - generic [ref=e541]: Novice
                      - generic [ref=e542]: 🔒
                    - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 gardens" [ref=e543]':
                      - generic [ref=e544]: L3
                      - generic [ref=e545]: Semi-Pro
                      - generic [ref=e546]: 🔒
                    - 'generic "🔒 Locked – L4 Pro: Visit 10 gardens" [ref=e547]':
                      - generic [ref=e548]: L4
                      - generic [ref=e549]: Pro
                      - generic [ref=e550]: 🔒
                    - 'generic "🔒 Locked – L5 MVP: Visit 15+ gardens" [ref=e551]':
                      - generic [ref=e552]: L5
                      - generic [ref=e553]: MVP
                      - generic [ref=e554]: 🔒
                  - generic [ref=e555]:
                    - button "−" [ref=e556] [cursor=pointer]
                    - button "+ Log" [ref=e557] [cursor=pointer]
              - generic [ref=e559]:
                - generic [ref=e560]: 🏕️
                - generic [ref=e561]:
                  - generic [ref=e563]:
                    - generic [ref=e564]: Recreation Champion
                    - generic [ref=e565]: Challenge
                  - generic [ref=e566]:
                    - generic [ref=e567]: Not Started
                    - button "View all levels for Recreation Champion" [ref=e569] [cursor=pointer]: ⓘ
                  - generic [ref=e570]: Complete 4 recreation or day-use areas.
                  - generic [ref=e571]: "Progress: 0 visits • Tier 0/5"
                  - generic [ref=e573]:
                    - text: 0/1 visits →
                    - strong [ref=e574]: L1 Rookie
                  - generic [ref=e576]:
                    - 'generic "→ In Progress – L1 Rookie: Visit 1 rec area" [ref=e577]':
                      - generic [ref=e578]: L1
                      - generic [ref=e579]: Rookie
                      - generic [ref=e580]: ●
                    - 'generic "🔒 Locked – L2 Novice: Visit 3 rec area" [ref=e581]':
                      - generic [ref=e582]: L2
                      - generic [ref=e583]: Novice
                      - generic [ref=e584]: 🔒
                    - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 rec area" [ref=e585]':
                      - generic [ref=e586]: L3
                      - generic [ref=e587]: Semi-Pro
                      - generic [ref=e588]: 🔒
                    - 'generic "🔒 Locked – L4 Pro: Visit 10 rec area" [ref=e589]':
                      - generic [ref=e590]: L4
                      - generic [ref=e591]: Pro
                      - generic [ref=e592]: 🔒
                    - 'generic "🔒 Locked – L5 MVP: Visit 15+ rec area" [ref=e593]':
                      - generic [ref=e594]: L5
                      - generic [ref=e595]: MVP
                      - generic [ref=e596]: 🔒
                  - generic [ref=e597]:
                    - button "−" [ref=e598] [cursor=pointer]
                    - button "+ Log" [ref=e599] [cursor=pointer]
              - generic [ref=e601]:
                - generic [ref=e602]: 🔒
                - generic [ref=e603]:
                  - generic [ref=e605]:
                    - generic [ref=e606]: Trail Starter
                    - generic [ref=e607]: Common
                  - generic [ref=e608]:
                    - generic [ref=e609]: Not Started
                    - button "View all levels for Trail Starter" [ref=e611] [cursor=pointer]: ⓘ
                  - generic [ref=e613]:
                    - text: 0/1 trailheads →
                    - strong [ref=e614]: L1 Rookie
              - generic [ref=e617]:
                - generic [ref=e618]: 🔒
                - generic [ref=e619]:
                  - generic [ref=e621]:
                    - generic [ref=e622]: Waterfall Seeker
                    - generic [ref=e623]: Rare
                  - generic [ref=e624]:
                    - generic [ref=e625]: Not Started
                    - button "View all levels for Waterfall Seeker" [ref=e627] [cursor=pointer]: ⓘ
                  - generic [ref=e629]:
                    - text: 0/1 waterfalls →
                    - strong [ref=e630]: L1 Rookie
              - generic [ref=e633]:
                - generic [ref=e634]: 🔒
                - generic [ref=e635]:
                  - generic [ref=e637]:
                    - generic [ref=e638]: Park Ranger
                    - generic [ref=e639]: Rare
                  - generic [ref=e640]:
                    - generic [ref=e641]: Not Started
                    - button "View all levels for Park Ranger" [ref=e643] [cursor=pointer]: ⓘ
                  - generic [ref=e645]:
                    - text: 0/1 state parks →
                    - strong [ref=e646]: L1 Rookie
              - generic [ref=e649]:
                - generic [ref=e650]: 🔒
                - generic [ref=e651]:
                  - generic [ref=e653]:
                    - generic [ref=e654]: Camp Explorer
                    - generic [ref=e655]: Rare
                  - generic [ref=e656]:
                    - generic [ref=e657]: Not Started
                    - button "View all levels for Camp Explorer" [ref=e659] [cursor=pointer]: ⓘ
                  - generic [ref=e661]:
                    - text: 0/1 campgrounds →
                    - strong [ref=e662]: L1 Rookie
              - generic [ref=e665]:
                - generic [ref=e666]: 🔒
                - generic [ref=e667]:
                  - generic [ref=e669]:
                    - generic [ref=e670]: Lake Walker
                    - generic [ref=e671]: Epic
                  - generic [ref=e672]:
                    - generic [ref=e673]: Not Started
                    - button "View all levels for Lake Walker" [ref=e675] [cursor=pointer]: ⓘ
                  - generic [ref=e677]:
                    - text: 0/1 lakes & ponds →
                    - strong [ref=e678]: L1 Rookie
              - generic [ref=e681]:
                - generic [ref=e682]: 🔒
                - generic [ref=e683]:
                  - generic [ref=e685]:
                    - generic [ref=e686]: Summit Chaser
                    - generic [ref=e687]: Epic
                  - generic [ref=e688]:
                    - generic [ref=e689]: Not Started
                    - button "View all levels for Summit Chaser" [ref=e691] [cursor=pointer]: ⓘ
                  - generic [ref=e693]:
                    - text: 0/1 scenic overlooks →
                    - strong [ref=e694]: L1 Rookie
              - generic [ref=e697]:
                - generic [ref=e698]: 🔒
                - generic [ref=e699]:
                  - generic [ref=e701]:
                    - generic [ref=e702]: Beach Goer
                    - generic [ref=e703]: Rare
                  - generic [ref=e704]:
                    - generic [ref=e705]: Not Started
                    - button "View all levels for Beach Goer" [ref=e707] [cursor=pointer]: ⓘ
                  - generic [ref=e709]:
                    - text: 0/1 public beaches →
                    - strong [ref=e710]: L1 Rookie
              - generic [ref=e713]:
                - generic [ref=e714]: 🔒
                - generic [ref=e715]:
                  - generic [ref=e717]:
                    - generic [ref=e718]: Garden Lover
                    - generic [ref=e719]: Rare
                  - generic [ref=e720]:
                    - generic [ref=e721]: Not Started
                    - button "View all levels for Garden Lover" [ref=e723] [cursor=pointer]: ⓘ
                  - generic [ref=e725]:
                    - text: 0/1 botanical gardens →
                    - strong [ref=e726]: L1 Rookie
              - generic [ref=e729]:
                - generic [ref=e730]: 🔒
                - generic [ref=e731]:
                  - generic [ref=e733]:
                    - generic [ref=e734]: Outdoors Devotee
                    - generic [ref=e735]: Legendary
                  - generic [ref=e736]:
                    - generic [ref=e737]: Not Started
                    - button "View all levels for Outdoors Devotee" [ref=e739] [cursor=pointer]: ⓘ
                  - generic [ref=e741]:
                    - text: 0/1 total visits →
                    - strong [ref=e742]: L1 Rookie
              - generic [ref=e745]:
                - generic [ref=e746]: 🔒
                - generic [ref=e747]:
                  - generic [ref=e749]:
                    - generic [ref=e750]: Nature Champion
                    - generic [ref=e751]: Legendary
                  - generic [ref=e752]:
                    - generic [ref=e753]: Not Started
                    - button "View all levels for Nature Champion" [ref=e755] [cursor=pointer]: ⓘ
                  - generic [ref=e757]:
                    - text: 0/1 completed challenges →
                    - strong [ref=e758]: L1 Rookie
          - generic [ref=e760]:
            - generic [ref=e762]:
              - generic [ref=e763]: 📚 Seasonal Quests
              - generic [ref=e764]: Multi-step seasonal goals for Outdoors.
            - generic [ref=e765]:
              - generic [ref=e766]:
                - generic [ref=e767]: 🌸 Spring Now
                - generic [ref=e768]: Spring Awakening
                - generic [ref=e769]: 0/3 steps
                - generic [ref=e770]:
                  - generic [ref=e771]:
                    - generic [ref=e772]: ○
                    - generic [ref=e773]: Visit 3 parks or gardens
                    - generic [ref=e774]: Auto
                  - generic [ref=e775]:
                    - generic [ref=e776]: ○
                    - generic [ref=e777]: Find a waterfall
                    - generic [ref=e778]: Auto
                  - generic [ref=e779]:
                    - generic [ref=e780]: ○
                    - generic [ref=e781]: Hike a trail
                    - generic [ref=e782]: Auto
              - generic [ref=e783]:
                - generic [ref=e784]: ☀️ Summer
                - generic [ref=e785]: Summer Expedition
                - generic [ref=e786]: 0/3 steps
                - generic [ref=e787]:
                  - generic [ref=e788]:
                    - generic [ref=e789]: ○
                    - generic [ref=e790]: Swim at a public beach
                    - generic [ref=e791]: Auto
                  - generic [ref=e792]:
                    - generic [ref=e793]: ○
                    - generic [ref=e794]: Visit a recreation area
                    - generic [ref=e795]: Auto
                  - generic [ref=e796]:
                    - generic [ref=e797]: ○
                    - generic [ref=e798]: Camp overnight
                    - generic [ref=e799]: Auto
              - generic [ref=e800]:
                - generic [ref=e801]: 🍂 Fall
                - generic [ref=e802]: Fall Foliage Tour
                - generic [ref=e803]: 0/3 steps
                - generic [ref=e804]:
                  - generic [ref=e805]:
                    - generic [ref=e806]: ○
                    - generic [ref=e807]: Visit 3 scenic overlooks
                    - generic [ref=e808]: Auto
                  - generic [ref=e809]:
                    - generic [ref=e810]: ○
                    - generic [ref=e811]: Explore a state park
                    - generic [ref=e812]: Auto
                  - generic [ref=e813]:
                    - generic [ref=e814]: ○
                    - generic [ref=e815]: Find a lake or pond
                    - generic [ref=e816]: Auto
              - generic [ref=e817]:
                - generic [ref=e818]: ❄️ Winter
                - generic [ref=e819]: Winter Wild Side
                - generic [ref=e820]: 0/3 steps
                - generic [ref=e821]:
                  - generic [ref=e822]:
                    - generic [ref=e823]: ○
                    - generic [ref=e824]: Find a waterfall (brave the cold!)
                    - generic [ref=e825]: Auto
                  - generic [ref=e826]:
                    - generic [ref=e827]: ○
                    - generic [ref=e828]: Hike a trailhead
                    - generic [ref=e829]: Auto
                  - generic [ref=e830]:
                    - generic [ref=e831]: ○
                    - generic [ref=e832]: Visit a botanical garden
                    - generic [ref=e833]: Auto
          - generic [ref=e834]:
            - generic [ref=e835]:
              - generic [ref=e836]:
                - generic [ref=e837]: 🟩 Outdoors Bingo
                - generic [ref=e838]: Auto-synced from your logged visits. Complete a row, column, or diagonal for BINGO!
              - generic [ref=e839]: 0/9
            - generic [ref=e840]:
              - generic "Trailhead not completed" [ref=e841] [cursor=pointer]:
                - generic [ref=e842]: 🥾
                - generic [ref=e843]: Trailhead
              - generic "Waterfall not completed" [ref=e844] [cursor=pointer]:
                - generic [ref=e845]: 💧
                - generic [ref=e846]: Waterfall
              - generic "State Park not completed" [ref=e847] [cursor=pointer]:
                - generic [ref=e848]: 🌲
                - generic [ref=e849]: State Park
              - generic "Campground not completed" [ref=e850] [cursor=pointer]:
                - generic [ref=e851]: ⛺
                - generic [ref=e852]: Campground
              - generic "Scenic Overlook not completed" [ref=e853] [cursor=pointer]:
                - generic [ref=e854]: 🏔️
                - generic [ref=e855]: Scenic Overlook
              - generic "Lake or Pond not completed" [ref=e856] [cursor=pointer]:
                - generic [ref=e857]: 🏞️
                - generic [ref=e858]: Lake or Pond
              - generic "Public Beach not completed" [ref=e859] [cursor=pointer]:
                - generic [ref=e860]: 🏖️
                - generic [ref=e861]: Public Beach
              - generic "National Park not completed" [ref=e862] [cursor=pointer]:
                - generic [ref=e863]: 🏔️
                - generic [ref=e864]: National Park
              - generic "Botanical Garden not completed" [ref=e865] [cursor=pointer]:
                - generic [ref=e866]: 🌺
                - generic [ref=e867]: Botanical Garden
            - generic [ref=e868]: 0/9 tiles marked
      - group "🧰 Diagnostics, Sync and Clean Up" [ref=e869]:
        - generic "🧰 Diagnostics, Sync and Clean Up Sync health, local queue visibility, and visited tracker diagnostics. ▾" [ref=e870] [cursor=pointer]:
          - generic [ref=e871]:
            - generic [ref=e872]: 🧰 Diagnostics, Sync and Clean Up
            - generic [ref=e873]: Sync health, local queue visibility, and visited tracker diagnostics.
          - text: ▾
        - option "Strict (Place ID + exact name)"
        - option "Balanced (Place ID + exact + fuzzy)" [selected]
        - option "Name Only (exact + fuzzy)"
  - button "Deployment 2026.04.23.live-debug.1 OK (4/4)" [ref=e875] [cursor=pointer]
  - generic [ref=e876]: ✅ App Ready - 9 systems initialized
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
  9  |   /Failed to load resource: the server responded with a status of 404 \(Not Found\) \(https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/root:\/.+:\/workbook\/tables\/.+\/columns\?\$select=name,index\)/i
  10 | ];
  11 | 
  12 | function isIntentionalWorkbookProbe404(text, locationUrl) {
  13 |   const msg = String(text || '');
  14 |   const url = String(locationUrl || '');
  15 |   return (
  16 |     /Failed to load resource: the server responded with a status of 404 \(Not Found\)/i.test(msg)
  17 |     && /https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/root:\/Retail_Food_and_Drink\.xlsx:\/workbook\/tables\/Retail\/columns\?\$select=name,index/i.test(url)
  18 |   );
  19 | }
  20 | 
  21 | function isIgnoredExtensionNoise(text, locationUrl) {
  22 |   if (isIntentionalWorkbookProbe404(text, locationUrl)) return true;
  23 |   const candidate = `${String(text || '')}\n${String(locationUrl || '')}`;
  24 |   return EXTENSION_NOISE_PATTERNS.some((pattern) => pattern.test(candidate));
  25 | }
  26 | 
  27 | const test = base.extend({
  28 |   page: async ({ page }, use, testInfo) => {
  29 |     const unexpectedErrors = [];
  30 | 
  31 |     const onConsole = (msg) => {
  32 |       if (msg.type() !== 'error') return;
  33 |       const location = msg.location ? msg.location() : { url: '' };
  34 |       const text = msg.text();
  35 |       if (isIgnoredExtensionNoise(text, location && location.url)) return;
  36 |       unexpectedErrors.push({
  37 |         source: 'console',
  38 |         text,
  39 |         url: (location && location.url) || ''
  40 |       });
  41 |     };
  42 | 
  43 |     const onPageError = (error) => {
  44 |       const message = error && error.message ? String(error.message) : String(error || 'Unknown page error');
  45 |       const stack = error && error.stack ? String(error.stack) : '';
  46 |       if (isIgnoredExtensionNoise(`${message}\n${stack}`, '')) return;
  47 |       unexpectedErrors.push({
  48 |         source: 'pageerror',
  49 |         text: message,
  50 |         url: ''
  51 |       });
  52 |     };
  53 | 
  54 |     page.on('console', onConsole);
  55 |     page.on('pageerror', onPageError);
  56 | 
  57 |     await use(page);
  58 | 
  59 |     page.off('console', onConsole);
  60 |     page.off('pageerror', onPageError);
  61 | 
  62 |     if (unexpectedErrors.length) {
  63 |       const preview = unexpectedErrors
  64 |         .slice(0, 5)
  65 |         .map((row, idx) => `${idx + 1}. [${row.source}] ${row.text}${row.url ? ` (${row.url})` : ''}`)
  66 |         .join('\n');
  67 | 
  68 |       await testInfo.attach('unexpected-browser-errors.txt', {
  69 |         body: Buffer.from(preview, 'utf8'),
  70 |         contentType: 'text/plain'
  71 |       });
  72 | 
> 73 |       throw new Error(`Unexpected browser errors detected:\n${preview}`);
     |             ^ Error: Unexpected browser errors detected:
  74 |     }
  75 |   }
  76 | });
  77 | 
  78 | module.exports = { test, expect, isIgnoredExtensionNoise };
  79 | 
  80 | 
```