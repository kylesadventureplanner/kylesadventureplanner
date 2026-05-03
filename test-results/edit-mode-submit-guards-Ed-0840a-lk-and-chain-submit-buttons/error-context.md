# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: edit-mode-submit-guards.spec.js >> Edit Mode submit guards >> prevent duplicate rapid clicks for single, bulk, and chain submit buttons
- Location: tests/edit-mode-submit-guards.spec.js:55:3

# Error details

```
Error: Unexpected browser errors detected:
1. [console] 🚨 UNCAUGHT ERROR: {message: Identifier 'originalConsoleError' has already been declared, stack: SyntaxError: Identifier 'originalConsoleError' has already been declared, filename: http://127.0.0.1:4321/, lineno: 10344, colno: 11} (http://127.0.0.1:4321/JS%20Files/consolidated-debug-error-system-v7-0-141.js)
2. [console] 🚨 UNCAUGHT ERROR: {message: getPlaceDetails is not defined, stack: ReferenceError: getPlaceDetails is not defined
    at http://127.0.0.1:4321/:14251:28, filename: http://127.0.0.1:4321/, lineno: 14251, colno: 28} (http://127.0.0.1:4321/JS%20Files/consolidated-debug-error-system-v7-0-141.js)
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3] [cursor=pointer]: ℹ️ TV Mode disabled
  - button "🧰 Diagnostics" [ref=e5] [cursor=pointer]
  - banner [ref=e6]:
    - generic [ref=e7]:
      - generic [ref=e8]: Kyle’s Adventure Finder
      - generic [ref=e9]: Powered by Excel, enhanced with Google data and mobile-friendly design.
    - generic [ref=e10]:
      - generic [ref=e11]:
        - button "🔄 Reload App" [ref=e12] [cursor=pointer]
        - button "Quick Add a place" [ref=e13] [cursor=pointer]: ➕ Quick Add
        - button "📝 Edit Mode" [ref=e14] [cursor=pointer]
        - button "📴 Offline Mode" [ref=e15] [cursor=pointer]
        - button "💾 App Backup" [ref=e16] [cursor=pointer]
        - button "🩺 Diagnostics" [ref=e17] [cursor=pointer]
        - button "📺 TV Mode" [ref=e18] [cursor=pointer]
        - button "📱 iPhone View" [ref=e19] [cursor=pointer]
        - generic [ref=e20]:
          - generic [ref=e21]: All Changes Synced
          - button "Retry Sync" [disabled]
        - button "Sign In" [ref=e22] [cursor=pointer]
        - button "Sign In via Device" [ref=e23] [cursor=pointer]
      - button "● 2026.04.23.live-debug.1 | 4/4" [ref=e26] [cursor=pointer]
      - generic [ref=e27]: Not signed in
  - status [ref=e28]:
    - generic [ref=e29]: "🔐 Sign in required: connect your Microsoft account to load Excel data and use core app features."
    - button "Sign In Now" [ref=e30] [cursor=pointer]
  - generic [ref=e31]:
    - generic [ref=e32]:
      - button "🎮 Adventure Challenge" [ref=e33] [cursor=pointer]
      - button "🌿 Nature Challenge" [ref=e34] [cursor=pointer]
      - button "🧰 Household Tools" [ref=e35] [cursor=pointer]
      - button "🐦 Birding Locations" [ref=e36] [cursor=pointer]
    - tablist "Adventure Challenge categories" [ref=e40]:
      - tab "Open Outdoors section" [selected] [ref=e41] [cursor=pointer]: 🌲 Outdoors
      - tab "Open Entertainment section" [ref=e42] [cursor=pointer]: 🎬 Entertainment
      - tab "Open Food and Drink section" [ref=e43] [cursor=pointer]: 🍽️ Food & Drink
      - tab "Open Retail section" [ref=e44] [cursor=pointer]: 🛍️ Retail
      - tab "Open Wildlife and Animals section" [ref=e45] [cursor=pointer]: 🦌 Wildlife & Animals
      - tab "Open Regional Festivals section" [ref=e46] [cursor=pointer]: 🎉 Regional Festivals
      - tab "Open Bike Trails section" [ref=e47] [cursor=pointer]: 🚴 Bike Trails
    - generic [ref=e50]:
      - generic [ref=e51]:
        - heading "Adventure Challenge - Outdoors" [level=1] [ref=e52]
        - navigation "Jump to section links" [ref=e53]:
          - generic [ref=e54]: "Jump to section:"
          - button "📊 Category Progression" [ref=e55] [cursor=pointer]
          - button "🏅 Challenges & Badges" [ref=e56] [cursor=pointer]
          - button "📚 Seasonal Quests" [ref=e57] [cursor=pointer]
          - button "🟩 Outdoors Bingo" [ref=e58] [cursor=pointer]
          - button "🧰 Diagnostics, Sync and Clean Up" [ref=e59] [cursor=pointer]
      - generic [ref=e60]: 🌲 Outdoors section active
      - tabpanel "Open Outdoors section" [ref=e61]:
        - generic [ref=e62]:
          - generic [ref=e63]:
            - generic [ref=e64]: 🌲 Outdoors
            - generic [ref=e65]: Browse and plan outdoor locations you want to visit.
          - generic [ref=e66]:
            - generic [ref=e67]:
              - text: "Outdoors data: sign-in required"
              - button "Sync category totals" [ref=e68] [cursor=pointer]
              - text: Use Sign In, then refresh this tab.
            - generic [ref=e69]:
              - button "🔎 Explore Outdoors" [ref=e70] [cursor=pointer]
              - button "Open Explore Outdoors in a new tab" [ref=e71] [cursor=pointer]: ↗
              - button "🏙️ City Explorer" [ref=e72] [cursor=pointer]:
                - text: 🏙️ City Explorer
                - generic: i
              - button "Open City Explorer (Outdoors) in a new tab" [ref=e73] [cursor=pointer]: ↗
              - button "Log a Visit" [ref=e74] [cursor=pointer]
              - button "Open Log a Visit (Outdoors) in a new tab" [ref=e75] [cursor=pointer]: ↗
              - button "📝 Edit Mode" [ref=e76] [cursor=pointer]
              - button "Open Edit Mode (Outdoors) in a new tab" [ref=e77] [cursor=pointer]: ↗
              - button "Open Batch Tag Actions for Outdoors" [ref=e78] [cursor=pointer]:
                - text: 🏷️ Batch Tags
                - generic: i
              - button "Refresh Data" [ref=e79] [cursor=pointer]
              - button "↶ Undo" [disabled] [ref=e80] [cursor=pointer]
        - generic [ref=e81]:
          - generic [ref=e82]:
            - generic [ref=e84]:
              - generic [ref=e85]: 📊 Category Progression
              - generic [ref=e86]:
                - text: "Track your Outdoors visits by category. Total logged:"
                - strong [ref=e87]: "0"
                - text: .
                - button "Log Visit" [ref=e88] [cursor=pointer]
            - generic [ref=e89]:
              - generic [ref=e90]:
                - generic [ref=e91]: 🥾
                - generic [ref=e92]: Trailheads
                - generic [ref=e93]: 0 / ?
                - generic [ref=e94]: 0% complete
                - generic [ref=e97]: Auto-tracked from visit logs
              - generic [ref=e98]:
                - generic [ref=e99]: 💧
                - generic [ref=e100]: Waterfalls
                - generic [ref=e101]: 0 / ?
                - generic [ref=e102]: 0% complete
                - generic [ref=e105]: Auto-tracked from visit logs
              - generic [ref=e106]:
                - generic [ref=e107]: 🏔️
                - generic [ref=e108]: Scenic Overlooks
                - generic [ref=e109]: 0 / ?
                - generic [ref=e110]: 0% complete
                - generic [ref=e113]: Auto-tracked from visit logs
              - generic [ref=e114]:
                - generic [ref=e115]: ⛺
                - generic [ref=e116]: Campgrounds
                - generic [ref=e117]: 0 / ?
                - generic [ref=e118]: 0% complete
                - generic [ref=e121]: Auto-tracked from visit logs
              - generic [ref=e122]:
                - generic [ref=e123]: 🌲
                - generic [ref=e124]: State Parks
                - generic [ref=e125]: 0 / ?
                - generic [ref=e126]: 0% complete
                - generic [ref=e129]: Auto-tracked from visit logs
              - generic [ref=e130]:
                - generic [ref=e131]: 🏔️
                - generic [ref=e132]: National Parks
                - generic [ref=e133]: 0 / ?
                - generic [ref=e134]: 0% complete
                - generic [ref=e137]: Auto-tracked from visit logs
              - generic [ref=e138]:
                - generic [ref=e139]: 🏖️
                - generic [ref=e140]: Public Beaches
                - generic [ref=e141]: 0 / ?
                - generic [ref=e142]: 0% complete
                - generic [ref=e145]: Auto-tracked from visit logs
              - generic [ref=e146]:
                - generic [ref=e147]: 🏞️
                - generic [ref=e148]: Lakes & Ponds
                - generic [ref=e149]: 0 / ?
                - generic [ref=e150]: 0% complete
                - generic [ref=e153]: Auto-tracked from visit logs
              - generic [ref=e154]:
                - generic [ref=e155]: 🏕️
                - generic [ref=e156]: Recreation Areas
                - generic [ref=e157]: 0 / ?
                - generic [ref=e158]: 0% complete
                - generic [ref=e161]: Auto-tracked from visit logs
              - generic [ref=e162]:
                - generic [ref=e163]: 🌺
                - generic [ref=e164]: Botanical Gardens
                - generic [ref=e165]: 0 / ?
                - generic [ref=e166]: 0% complete
                - generic [ref=e169]: Auto-tracked from visit logs
          - generic [ref=e170]:
            - generic [ref=e171]:
              - generic [ref=e172]:
                - generic [ref=e173]: 🏅 Challenges & Badges
                - generic [ref=e174]: Challenge goals and badges now share one achievement wall using the same badge layout.
              - generic [ref=e175]: 0/100
            - generic [ref=e176]:
              - generic [ref=e178]:
                - generic [ref=e179]: 🥾
                - generic [ref=e180]:
                  - generic [ref=e182]:
                    - generic [ref=e183]: Trailhead Seeker
                    - generic [ref=e184]: Challenge
                  - generic [ref=e185]:
                    - generic [ref=e186]: Not Started
                    - button "View all levels for Trailhead Seeker" [ref=e188] [cursor=pointer]: ⓘ
                  - generic [ref=e189]: Visit 3 trailheads.
                  - generic [ref=e190]: "Progress: 0 visits • Tier 0/5"
                  - generic [ref=e192]:
                    - text: 0/1 visits →
                    - strong [ref=e193]: L1 Rookie
                  - generic [ref=e195]:
                    - 'generic "→ In Progress – L1 Rookie: Visit 1 trailhead" [ref=e196]':
                      - generic [ref=e197]: L1
                      - generic [ref=e198]: Rookie
                      - generic [ref=e199]: ●
                    - 'generic "🔒 Locked – L2 Novice: Visit 3 trailhead" [ref=e200]':
                      - generic [ref=e201]: L2
                      - generic [ref=e202]: Novice
                      - generic [ref=e203]: 🔒
                    - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 trailhead" [ref=e204]':
                      - generic [ref=e205]: L3
                      - generic [ref=e206]: Semi-Pro
                      - generic [ref=e207]: 🔒
                    - 'generic "🔒 Locked – L4 Pro: Visit 10 trailhead" [ref=e208]':
                      - generic [ref=e209]: L4
                      - generic [ref=e210]: Pro
                      - generic [ref=e211]: 🔒
                    - 'generic "🔒 Locked – L5 MVP: Visit 15+ trailhead" [ref=e212]':
                      - generic [ref=e213]: L5
                      - generic [ref=e214]: MVP
                      - generic [ref=e215]: 🔒
                  - generic [ref=e216]:
                    - button "−" [ref=e217] [cursor=pointer]
                    - button "+ Log" [ref=e218] [cursor=pointer]
                    - button "📍 Qualifying Locations" [ref=e219] [cursor=pointer]
              - generic [ref=e221]:
                - generic [ref=e222]: 💧
                - generic [ref=e223]:
                  - generic [ref=e225]:
                    - generic [ref=e226]: Waterfall Hunter
                    - generic [ref=e227]: Challenge
                  - generic [ref=e228]:
                    - generic [ref=e229]: Not Started
                    - button "View all levels for Waterfall Hunter" [ref=e231] [cursor=pointer]: ⓘ
                  - generic [ref=e232]: Discover 3 waterfalls.
                  - generic [ref=e233]: "Progress: 0 visits • Tier 0/5"
                  - generic [ref=e235]:
                    - text: 0/1 visits →
                    - strong [ref=e236]: L1 Rookie
                  - generic [ref=e238]:
                    - 'generic "→ In Progress – L1 Rookie: Visit 1 waterfall" [ref=e239]':
                      - generic [ref=e240]: L1
                      - generic [ref=e241]: Rookie
                      - generic [ref=e242]: ●
                    - 'generic "🔒 Locked – L2 Novice: Visit 3 waterfall" [ref=e243]':
                      - generic [ref=e244]: L2
                      - generic [ref=e245]: Novice
                      - generic [ref=e246]: 🔒
                    - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 waterfall" [ref=e247]':
                      - generic [ref=e248]: L3
                      - generic [ref=e249]: Semi-Pro
                      - generic [ref=e250]: 🔒
                    - 'generic "🔒 Locked – L4 Pro: Visit 10 waterfall" [ref=e251]':
                      - generic [ref=e252]: L4
                      - generic [ref=e253]: Pro
                      - generic [ref=e254]: 🔒
                    - 'generic "🔒 Locked – L5 MVP: Visit 15+ waterfall" [ref=e255]':
                      - generic [ref=e256]: L5
                      - generic [ref=e257]: MVP
                      - generic [ref=e258]: 🔒
                  - generic [ref=e259]:
                    - button "−" [ref=e260] [cursor=pointer]
                    - button "+ Log" [ref=e261] [cursor=pointer]
                    - button "📍 Qualifying Locations" [ref=e262] [cursor=pointer]
              - generic [ref=e264]:
                - generic [ref=e265]: 🏔️
                - generic [ref=e266]:
                  - generic [ref=e268]:
                    - generic [ref=e269]: Overlook Explorer
                    - generic [ref=e270]: Challenge
                  - generic [ref=e271]:
                    - generic [ref=e272]: Not Started
                    - button "View all levels for Overlook Explorer" [ref=e274] [cursor=pointer]: ⓘ
                  - generic [ref=e275]: Find 3 scenic overlooks or viewpoints.
                  - generic [ref=e276]: "Progress: 0 visits • Tier 0/5"
                  - generic [ref=e278]:
                    - text: 0/1 visits →
                    - strong [ref=e279]: L1 Rookie
                  - generic [ref=e281]:
                    - 'generic "→ In Progress – L1 Rookie: Visit 1 scenic" [ref=e282]':
                      - generic [ref=e283]: L1
                      - generic [ref=e284]: Rookie
                      - generic [ref=e285]: ●
                    - 'generic "🔒 Locked – L2 Novice: Visit 3 scenic" [ref=e286]':
                      - generic [ref=e287]: L2
                      - generic [ref=e288]: Novice
                      - generic [ref=e289]: 🔒
                    - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 scenic" [ref=e290]':
                      - generic [ref=e291]: L3
                      - generic [ref=e292]: Semi-Pro
                      - generic [ref=e293]: 🔒
                    - 'generic "🔒 Locked – L4 Pro: Visit 10 scenic" [ref=e294]':
                      - generic [ref=e295]: L4
                      - generic [ref=e296]: Pro
                      - generic [ref=e297]: 🔒
                    - 'generic "🔒 Locked – L5 MVP: Visit 15+ scenic" [ref=e298]':
                      - generic [ref=e299]: L5
                      - generic [ref=e300]: MVP
                      - generic [ref=e301]: 🔒
                  - generic [ref=e302]:
                    - button "−" [ref=e303] [cursor=pointer]
                    - button "+ Log" [ref=e304] [cursor=pointer]
                    - button "📍 Qualifying Locations" [ref=e305] [cursor=pointer]
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
                    - button "📍 Qualifying Locations" [ref=e348] [cursor=pointer]
              - generic [ref=e350]:
                - generic [ref=e351]: 🌲
                - generic [ref=e352]:
                  - generic [ref=e354]:
                    - generic [ref=e355]: State Park Tour
                    - generic [ref=e356]: Challenge
                  - generic [ref=e357]:
                    - generic [ref=e358]: Not Started
                    - button "View all levels for State Park Tour" [ref=e360] [cursor=pointer]: ⓘ
                  - generic [ref=e361]: Visit 2 state parks.
                  - generic [ref=e362]: "Progress: 0 visits • Tier 0/5"
                  - generic [ref=e364]:
                    - text: 0/1 visits →
                    - strong [ref=e365]: L1 Rookie
                  - generic [ref=e367]:
                    - 'generic "→ In Progress – L1 Rookie: Visit 1 state park" [ref=e368]':
                      - generic [ref=e369]: L1
                      - generic [ref=e370]: Rookie
                      - generic [ref=e371]: ●
                    - 'generic "🔒 Locked – L2 Novice: Visit 3 state park" [ref=e372]':
                      - generic [ref=e373]: L2
                      - generic [ref=e374]: Novice
                      - generic [ref=e375]: 🔒
                    - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 state park" [ref=e376]':
                      - generic [ref=e377]: L3
                      - generic [ref=e378]: Semi-Pro
                      - generic [ref=e379]: 🔒
                    - 'generic "🔒 Locked – L4 Pro: Visit 10 state park" [ref=e380]':
                      - generic [ref=e381]: L4
                      - generic [ref=e382]: Pro
                      - generic [ref=e383]: 🔒
                    - 'generic "🔒 Locked – L5 MVP: Visit 15+ state park" [ref=e384]':
                      - generic [ref=e385]: L5
                      - generic [ref=e386]: MVP
                      - generic [ref=e387]: 🔒
                  - generic [ref=e388]:
                    - button "−" [ref=e389] [cursor=pointer]
                    - button "+ Log" [ref=e390] [cursor=pointer]
                    - button "📍 Qualifying Locations" [ref=e391] [cursor=pointer]
              - generic [ref=e393]:
                - generic [ref=e394]: 🏔️
                - generic [ref=e395]:
                  - generic [ref=e397]:
                    - generic [ref=e398]: National Park Day
                    - generic [ref=e399]: Challenge
                  - generic [ref=e400]:
                    - generic [ref=e401]: Not Started
                    - button "View all levels for National Park Day" [ref=e403] [cursor=pointer]: ⓘ
                  - generic [ref=e404]: Visit 1 national park.
                  - generic [ref=e405]: "Progress: 0 visits • Tier 0/5"
                  - generic [ref=e407]:
                    - text: 0/1 visits →
                    - strong [ref=e408]: L1 Rookie
                  - generic [ref=e410]:
                    - 'generic "→ In Progress – L1 Rookie: Visit 1 national park" [ref=e411]':
                      - generic [ref=e412]: L1
                      - generic [ref=e413]: Rookie
                      - generic [ref=e414]: ●
                    - 'generic "🔒 Locked – L2 Novice: Visit 3 national park" [ref=e415]':
                      - generic [ref=e416]: L2
                      - generic [ref=e417]: Novice
                      - generic [ref=e418]: 🔒
                    - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 national park" [ref=e419]':
                      - generic [ref=e420]: L3
                      - generic [ref=e421]: Semi-Pro
                      - generic [ref=e422]: 🔒
                    - 'generic "🔒 Locked – L4 Pro: Visit 10 national park" [ref=e423]':
                      - generic [ref=e424]: L4
                      - generic [ref=e425]: Pro
                      - generic [ref=e426]: 🔒
                    - 'generic "🔒 Locked – L5 MVP: Visit 15+ national park" [ref=e427]':
                      - generic [ref=e428]: L5
                      - generic [ref=e429]: MVP
                      - generic [ref=e430]: 🔒
                  - generic [ref=e431]:
                    - button "−" [ref=e432] [cursor=pointer]
                    - button "+ Log" [ref=e433] [cursor=pointer]
                    - button "📍 Qualifying Locations" [ref=e434] [cursor=pointer]
              - generic [ref=e436]:
                - generic [ref=e437]: 🏖️
                - generic [ref=e438]:
                  - generic [ref=e440]:
                    - generic [ref=e441]: Shoreline Explorer
                    - generic [ref=e442]: Challenge
                  - generic [ref=e443]:
                    - generic [ref=e444]: Not Started
                    - button "View all levels for Shoreline Explorer" [ref=e446] [cursor=pointer]: ⓘ
                  - generic [ref=e447]: Swim at 2 public beaches.
                  - generic [ref=e448]: "Progress: 0 visits • Tier 0/5"
                  - generic [ref=e450]:
                    - text: 0/1 visits →
                    - strong [ref=e451]: L1 Rookie
                  - generic [ref=e453]:
                    - 'generic "→ In Progress – L1 Rookie: Visit 1 beach" [ref=e454]':
                      - generic [ref=e455]: L1
                      - generic [ref=e456]: Rookie
                      - generic [ref=e457]: ●
                    - 'generic "🔒 Locked – L2 Novice: Visit 3 beach" [ref=e458]':
                      - generic [ref=e459]: L2
                      - generic [ref=e460]: Novice
                      - generic [ref=e461]: 🔒
                    - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 beach" [ref=e462]':
                      - generic [ref=e463]: L3
                      - generic [ref=e464]: Semi-Pro
                      - generic [ref=e465]: 🔒
                    - 'generic "🔒 Locked – L4 Pro: Visit 10 beach" [ref=e466]':
                      - generic [ref=e467]: L4
                      - generic [ref=e468]: Pro
                      - generic [ref=e469]: 🔒
                    - 'generic "🔒 Locked – L5 MVP: Visit 15+ beach" [ref=e470]':
                      - generic [ref=e471]: L5
                      - generic [ref=e472]: MVP
                      - generic [ref=e473]: 🔒
                  - generic [ref=e474]:
                    - button "−" [ref=e475] [cursor=pointer]
                    - button "+ Log" [ref=e476] [cursor=pointer]
                    - button "📍 Qualifying Locations" [ref=e477] [cursor=pointer]
              - generic [ref=e479]:
                - generic [ref=e480]: 🏞️
                - generic [ref=e481]:
                  - generic [ref=e483]:
                    - generic [ref=e484]: Lake & Pond Loop
                    - generic [ref=e485]: Challenge
                  - generic [ref=e486]:
                    - generic [ref=e487]: Not Started
                    - button "View all levels for Lake & Pond Loop" [ref=e489] [cursor=pointer]: ⓘ
                  - generic [ref=e490]: Explore 3 lakes or ponds.
                  - generic [ref=e491]: "Progress: 0 visits • Tier 0/5"
                  - generic [ref=e493]:
                    - text: 0/1 visits →
                    - strong [ref=e494]: L1 Rookie
                  - generic [ref=e496]:
                    - 'generic "→ In Progress – L1 Rookie: Visit 1 lake" [ref=e497]':
                      - generic [ref=e498]: L1
                      - generic [ref=e499]: Rookie
                      - generic [ref=e500]: ●
                    - 'generic "🔒 Locked – L2 Novice: Visit 3 lake" [ref=e501]':
                      - generic [ref=e502]: L2
                      - generic [ref=e503]: Novice
                      - generic [ref=e504]: 🔒
                    - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 lake" [ref=e505]':
                      - generic [ref=e506]: L3
                      - generic [ref=e507]: Semi-Pro
                      - generic [ref=e508]: 🔒
                    - 'generic "🔒 Locked – L4 Pro: Visit 10 lake" [ref=e509]':
                      - generic [ref=e510]: L4
                      - generic [ref=e511]: Pro
                      - generic [ref=e512]: 🔒
                    - 'generic "🔒 Locked – L5 MVP: Visit 15+ lake" [ref=e513]':
                      - generic [ref=e514]: L5
                      - generic [ref=e515]: MVP
                      - generic [ref=e516]: 🔒
                  - generic [ref=e517]:
                    - button "−" [ref=e518] [cursor=pointer]
                    - button "+ Log" [ref=e519] [cursor=pointer]
                    - button "📍 Qualifying Locations" [ref=e520] [cursor=pointer]
              - generic [ref=e522]:
                - generic [ref=e523]: 🌺
                - generic [ref=e524]:
                  - generic [ref=e526]:
                    - generic [ref=e527]: Garden Stroll
                    - generic [ref=e528]: Challenge
                  - generic [ref=e529]:
                    - generic [ref=e530]: Not Started
                    - button "View all levels for Garden Stroll" [ref=e532] [cursor=pointer]: ⓘ
                  - generic [ref=e533]: Visit 2 botanical gardens.
                  - generic [ref=e534]: "Progress: 0 visits • Tier 0/5"
                  - generic [ref=e536]:
                    - text: 0/1 visits →
                    - strong [ref=e537]: L1 Rookie
                  - generic [ref=e539]:
                    - 'generic "→ In Progress – L1 Rookie: Visit 1 gardens" [ref=e540]':
                      - generic [ref=e541]: L1
                      - generic [ref=e542]: Rookie
                      - generic [ref=e543]: ●
                    - 'generic "🔒 Locked – L2 Novice: Visit 3 gardens" [ref=e544]':
                      - generic [ref=e545]: L2
                      - generic [ref=e546]: Novice
                      - generic [ref=e547]: 🔒
                    - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 gardens" [ref=e548]':
                      - generic [ref=e549]: L3
                      - generic [ref=e550]: Semi-Pro
                      - generic [ref=e551]: 🔒
                    - 'generic "🔒 Locked – L4 Pro: Visit 10 gardens" [ref=e552]':
                      - generic [ref=e553]: L4
                      - generic [ref=e554]: Pro
                      - generic [ref=e555]: 🔒
                    - 'generic "🔒 Locked – L5 MVP: Visit 15+ gardens" [ref=e556]':
                      - generic [ref=e557]: L5
                      - generic [ref=e558]: MVP
                      - generic [ref=e559]: 🔒
                  - generic [ref=e560]:
                    - button "−" [ref=e561] [cursor=pointer]
                    - button "+ Log" [ref=e562] [cursor=pointer]
                    - button "📍 Qualifying Locations" [ref=e563] [cursor=pointer]
              - generic [ref=e565]:
                - generic [ref=e566]: 🏕️
                - generic [ref=e567]:
                  - generic [ref=e569]:
                    - generic [ref=e570]: Recreation Champion
                    - generic [ref=e571]: Challenge
                  - generic [ref=e572]:
                    - generic [ref=e573]: Not Started
                    - button "View all levels for Recreation Champion" [ref=e575] [cursor=pointer]: ⓘ
                  - generic [ref=e576]: Complete 4 recreation or day-use areas.
                  - generic [ref=e577]: "Progress: 0 visits • Tier 0/5"
                  - generic [ref=e579]:
                    - text: 0/1 visits →
                    - strong [ref=e580]: L1 Rookie
                  - generic [ref=e582]:
                    - 'generic "→ In Progress – L1 Rookie: Visit 1 rec area" [ref=e583]':
                      - generic [ref=e584]: L1
                      - generic [ref=e585]: Rookie
                      - generic [ref=e586]: ●
                    - 'generic "🔒 Locked – L2 Novice: Visit 3 rec area" [ref=e587]':
                      - generic [ref=e588]: L2
                      - generic [ref=e589]: Novice
                      - generic [ref=e590]: 🔒
                    - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 rec area" [ref=e591]':
                      - generic [ref=e592]: L3
                      - generic [ref=e593]: Semi-Pro
                      - generic [ref=e594]: 🔒
                    - 'generic "🔒 Locked – L4 Pro: Visit 10 rec area" [ref=e595]':
                      - generic [ref=e596]: L4
                      - generic [ref=e597]: Pro
                      - generic [ref=e598]: 🔒
                    - 'generic "🔒 Locked – L5 MVP: Visit 15+ rec area" [ref=e599]':
                      - generic [ref=e600]: L5
                      - generic [ref=e601]: MVP
                      - generic [ref=e602]: 🔒
                  - generic [ref=e603]:
                    - button "−" [ref=e604] [cursor=pointer]
                    - button "+ Log" [ref=e605] [cursor=pointer]
                    - button "📍 Qualifying Locations" [ref=e606] [cursor=pointer]
              - generic [ref=e608]:
                - generic [ref=e609]: 🔒
                - generic [ref=e610]:
                  - generic [ref=e612]:
                    - generic [ref=e613]: Trail Starter
                    - generic [ref=e614]: Common
                  - generic [ref=e615]:
                    - generic [ref=e616]: Not Started
                    - button "View all levels for Trail Starter" [ref=e618] [cursor=pointer]: ⓘ
                  - generic [ref=e620]:
                    - text: 0/1 trailheads →
                    - strong [ref=e621]: L1 Rookie
                  - button "📍 Qualifying Locations" [ref=e624] [cursor=pointer]
              - generic [ref=e626]:
                - generic [ref=e627]: 🔒
                - generic [ref=e628]:
                  - generic [ref=e630]:
                    - generic [ref=e631]: Waterfall Seeker
                    - generic [ref=e632]: Rare
                  - generic [ref=e633]:
                    - generic [ref=e634]: Not Started
                    - button "View all levels for Waterfall Seeker" [ref=e636] [cursor=pointer]: ⓘ
                  - generic [ref=e638]:
                    - text: 0/1 waterfalls →
                    - strong [ref=e639]: L1 Rookie
                  - button "📍 Qualifying Locations" [ref=e642] [cursor=pointer]
              - generic [ref=e644]:
                - generic [ref=e645]: 🔒
                - generic [ref=e646]:
                  - generic [ref=e648]:
                    - generic [ref=e649]: Park Ranger
                    - generic [ref=e650]: Rare
                  - generic [ref=e651]:
                    - generic [ref=e652]: Not Started
                    - button "View all levels for Park Ranger" [ref=e654] [cursor=pointer]: ⓘ
                  - generic [ref=e656]:
                    - text: 0/1 state parks →
                    - strong [ref=e657]: L1 Rookie
                  - button "📍 Qualifying Locations" [ref=e660] [cursor=pointer]
              - generic [ref=e662]:
                - generic [ref=e663]: 🔒
                - generic [ref=e664]:
                  - generic [ref=e666]:
                    - generic [ref=e667]: Camp Explorer
                    - generic [ref=e668]: Rare
                  - generic [ref=e669]:
                    - generic [ref=e670]: Not Started
                    - button "View all levels for Camp Explorer" [ref=e672] [cursor=pointer]: ⓘ
                  - generic [ref=e674]:
                    - text: 0/1 campgrounds →
                    - strong [ref=e675]: L1 Rookie
                  - button "📍 Qualifying Locations" [ref=e678] [cursor=pointer]
              - generic [ref=e680]:
                - generic [ref=e681]: 🔒
                - generic [ref=e682]:
                  - generic [ref=e684]:
                    - generic [ref=e685]: Lake Walker
                    - generic [ref=e686]: Epic
                  - generic [ref=e687]:
                    - generic [ref=e688]: Not Started
                    - button "View all levels for Lake Walker" [ref=e690] [cursor=pointer]: ⓘ
                  - generic [ref=e692]:
                    - text: 0/1 lakes & ponds →
                    - strong [ref=e693]: L1 Rookie
                  - button "📍 Qualifying Locations" [ref=e696] [cursor=pointer]
              - generic [ref=e698]:
                - generic [ref=e699]: 🔒
                - generic [ref=e700]:
                  - generic [ref=e702]:
                    - generic [ref=e703]: Summit Chaser
                    - generic [ref=e704]: Epic
                  - generic [ref=e705]:
                    - generic [ref=e706]: Not Started
                    - button "View all levels for Summit Chaser" [ref=e708] [cursor=pointer]: ⓘ
                  - generic [ref=e710]:
                    - text: 0/1 scenic overlooks →
                    - strong [ref=e711]: L1 Rookie
                  - button "📍 Qualifying Locations" [ref=e714] [cursor=pointer]
              - generic [ref=e716]:
                - generic [ref=e717]: 🔒
                - generic [ref=e718]:
                  - generic [ref=e720]:
                    - generic [ref=e721]: Beach Goer
                    - generic [ref=e722]: Rare
                  - generic [ref=e723]:
                    - generic [ref=e724]: Not Started
                    - button "View all levels for Beach Goer" [ref=e726] [cursor=pointer]: ⓘ
                  - generic [ref=e728]:
                    - text: 0/1 public beaches →
                    - strong [ref=e729]: L1 Rookie
                  - button "📍 Qualifying Locations" [ref=e732] [cursor=pointer]
              - generic [ref=e734]:
                - generic [ref=e735]: 🔒
                - generic [ref=e736]:
                  - generic [ref=e738]:
                    - generic [ref=e739]: Garden Lover
                    - generic [ref=e740]: Rare
                  - generic [ref=e741]:
                    - generic [ref=e742]: Not Started
                    - button "View all levels for Garden Lover" [ref=e744] [cursor=pointer]: ⓘ
                  - generic [ref=e746]:
                    - text: 0/1 botanical gardens →
                    - strong [ref=e747]: L1 Rookie
                  - button "📍 Qualifying Locations" [ref=e750] [cursor=pointer]
              - generic [ref=e752]:
                - generic [ref=e753]: 🔒
                - generic [ref=e754]:
                  - generic [ref=e756]:
                    - generic [ref=e757]: Outdoors Devotee
                    - generic [ref=e758]: Legendary
                  - generic [ref=e759]:
                    - generic [ref=e760]: Not Started
                    - button "View all levels for Outdoors Devotee" [ref=e762] [cursor=pointer]: ⓘ
                  - generic [ref=e764]:
                    - text: 0/1 total visits →
                    - strong [ref=e765]: L1 Rookie
                  - button "📍 Qualifying Locations" [ref=e768] [cursor=pointer]
              - generic [ref=e770]:
                - generic [ref=e771]: 🔒
                - generic [ref=e772]:
                  - generic [ref=e774]:
                    - generic [ref=e775]: Nature Champion
                    - generic [ref=e776]: Legendary
                  - generic [ref=e777]:
                    - generic [ref=e778]: Not Started
                    - button "View all levels for Nature Champion" [ref=e780] [cursor=pointer]: ⓘ
                  - generic [ref=e782]:
                    - text: 0/1 completed challenges →
                    - strong [ref=e783]: L1 Rookie
                  - button "📍 Qualifying Locations" [ref=e786] [cursor=pointer]
          - generic [ref=e787]:
            - generic [ref=e789]:
              - generic [ref=e790]: 📚 Seasonal Quests
              - generic [ref=e791]: Multi-step seasonal goals for Outdoors.
            - generic [ref=e792]:
              - generic [ref=e793]:
                - generic [ref=e794]: 🌸 Spring Now
                - generic [ref=e795]: Spring Awakening
                - generic [ref=e796]: 0/3 steps
                - generic [ref=e797]:
                  - generic [ref=e798]:
                    - generic [ref=e799]: ○
                    - generic [ref=e800]: Visit 3 parks or gardens
                    - generic [ref=e801]: Auto
                  - generic [ref=e802]:
                    - generic [ref=e803]: ○
                    - generic [ref=e804]: Find a waterfall
                    - generic [ref=e805]: Auto
                  - generic [ref=e806]:
                    - generic [ref=e807]: ○
                    - generic [ref=e808]: Hike a trail
                    - generic [ref=e809]: Auto
              - generic [ref=e810]:
                - generic [ref=e811]: ☀️ Summer
                - generic [ref=e812]: Summer Expedition
                - generic [ref=e813]: 0/3 steps
                - generic [ref=e814]:
                  - generic [ref=e815]:
                    - generic [ref=e816]: ○
                    - generic [ref=e817]: Swim at a public beach
                    - generic [ref=e818]: Auto
                  - generic [ref=e819]:
                    - generic [ref=e820]: ○
                    - generic [ref=e821]: Visit a recreation area
                    - generic [ref=e822]: Auto
                  - generic [ref=e823]:
                    - generic [ref=e824]: ○
                    - generic [ref=e825]: Camp overnight
                    - generic [ref=e826]: Auto
              - generic [ref=e827]:
                - generic [ref=e828]: 🍂 Fall
                - generic [ref=e829]: Fall Foliage Tour
                - generic [ref=e830]: 0/3 steps
                - generic [ref=e831]:
                  - generic [ref=e832]:
                    - generic [ref=e833]: ○
                    - generic [ref=e834]: Visit 3 scenic overlooks
                    - generic [ref=e835]: Auto
                  - generic [ref=e836]:
                    - generic [ref=e837]: ○
                    - generic [ref=e838]: Explore a state park
                    - generic [ref=e839]: Auto
                  - generic [ref=e840]:
                    - generic [ref=e841]: ○
                    - generic [ref=e842]: Find a lake or pond
                    - generic [ref=e843]: Auto
              - generic [ref=e844]:
                - generic [ref=e845]: ❄️ Winter
                - generic [ref=e846]: Winter Wild Side
                - generic [ref=e847]: 0/3 steps
                - generic [ref=e848]:
                  - generic [ref=e849]:
                    - generic [ref=e850]: ○
                    - generic [ref=e851]: Find a waterfall (brave the cold!)
                    - generic [ref=e852]: Auto
                  - generic [ref=e853]:
                    - generic [ref=e854]: ○
                    - generic [ref=e855]: Hike a trailhead
                    - generic [ref=e856]: Auto
                  - generic [ref=e857]:
                    - generic [ref=e858]: ○
                    - generic [ref=e859]: Visit a botanical garden
                    - generic [ref=e860]: Auto
          - generic [ref=e861]:
            - generic [ref=e862]:
              - generic [ref=e863]:
                - generic [ref=e864]: 🟩 Outdoors Bingo
                - generic [ref=e865]: Auto-synced from your logged visits. Complete a row, column, or diagonal for BINGO!
              - generic [ref=e866]: 0/9
            - generic [ref=e867]:
              - generic "Trailhead not completed" [ref=e868] [cursor=pointer]:
                - generic [ref=e869]: 🥾
                - generic [ref=e870]: Trailhead
              - generic "Waterfall not completed" [ref=e871] [cursor=pointer]:
                - generic [ref=e872]: 💧
                - generic [ref=e873]: Waterfall
              - generic "State Park not completed" [ref=e874] [cursor=pointer]:
                - generic [ref=e875]: 🌲
                - generic [ref=e876]: State Park
              - generic "Campground not completed" [ref=e877] [cursor=pointer]:
                - generic [ref=e878]: ⛺
                - generic [ref=e879]: Campground
              - generic "Scenic Overlook not completed" [ref=e880] [cursor=pointer]:
                - generic [ref=e881]: 🏔️
                - generic [ref=e882]: Scenic Overlook
              - generic "Lake or Pond not completed" [ref=e883] [cursor=pointer]:
                - generic [ref=e884]: 🏞️
                - generic [ref=e885]: Lake or Pond
              - generic "Public Beach not completed" [ref=e886] [cursor=pointer]:
                - generic [ref=e887]: 🏖️
                - generic [ref=e888]: Public Beach
              - generic "National Park not completed" [ref=e889] [cursor=pointer]:
                - generic [ref=e890]: 🏔️
                - generic [ref=e891]: National Park
              - generic "Botanical Garden not completed" [ref=e892] [cursor=pointer]:
                - generic [ref=e893]: 🌺
                - generic [ref=e894]: Botanical Garden
            - generic [ref=e895]: 0/9 tiles marked
        - text: ▸
      - text: ▸ ▸ ▸ ▸ ▸
      - group "🧰 Diagnostics, Sync and Clean Up" [ref=e896]:
        - generic "🧰 Diagnostics, Sync and Clean Up Sync health, local queue visibility, and visited tracker diagnostics. ▾" [ref=e897] [cursor=pointer]:
          - generic [ref=e898]:
            - generic [ref=e899]: 🧰 Diagnostics, Sync and Clean Up
            - generic [ref=e900]: Sync health, local queue visibility, and visited tracker diagnostics.
          - text: ▾
        - option "Strict (Place ID + exact name)"
        - option "Balanced (Place ID + exact + fuzzy)" [selected]
        - option "Name Only (exact + fuzzy)"
  - 'button "TV Mode: OFF" [ref=e901] [cursor=pointer]'
  - dialog "Quick Add a place" [ref=e903]:
    - generic [ref=e905]: ⚡ Quick Add
    - generic [ref=e906]:
      - generic [ref=e907]:
        - generic [ref=e908]: Place Name *
        - textbox "Place Name *" [ref=e909]:
          - /placeholder: e.g. Congaree National Park
      - generic [ref=e910]:
        - generic [ref=e911]: Website or Google Maps URL
        - textbox "Website or Google Maps URL" [ref=e912]:
          - /placeholder: https://...
      - generic [ref=e913]:
        - generic [ref=e914]: Photo URL (optional)
        - textbox "Photo URL (optional)" [ref=e915]:
          - /placeholder: https://...
      - generic [ref=e916]:
        - generic [ref=e917]: Quick Note
        - textbox "Quick Note" [ref=e918]:
          - /placeholder: Any quick thoughts...
      - generic [ref=e919]:
        - button "💾 Save to Inbox" [ref=e920] [cursor=pointer]
        - button "Cancel" [ref=e921] [cursor=pointer]
  - button "⌨️ Shortcuts" [ref=e922] [cursor=pointer]
  - dialog "Adventure Planner Shortcuts" [ref=e923]:
    - generic [ref=e924]:
      - generic [ref=e925]:
        - generic [ref=e926]: Adventure Planner Shortcuts
        - generic [ref=e927]: Available shortcuts for this page
      - button "Close" [ref=e928] [cursor=pointer]
    - generic [ref=e929]:
      - generic [ref=e930]:
        - generic [ref=e931]: General
        - generic [ref=e932]:
          - generic [ref=e934]: "?"
          - generic [ref=e935]: Open keyboard shortcuts
        - generic [ref=e936]:
          - generic [ref=e938]: Esc
          - generic [ref=e939]: Close the shortcuts drawer or active dialog
      - generic [ref=e940]:
        - generic [ref=e941]: Search & Filters
        - generic [ref=e942]:
          - generic [ref=e943]:
            - generic [ref=e944]: Ctrl/Cmd + K
            - generic [ref=e945]: Ctrl/Cmd + F
          - generic [ref=e946]: Focus the main adventure search field
        - generic [ref=e947]:
          - generic [ref=e949]: Ctrl/Cmd + R
          - generic [ref=e950]: Reset all filters
        - generic [ref=e951]:
          - generic [ref=e953]: Ctrl/Cmd + Z
          - generic [ref=e954]: Undo the most recent filter change
        - generic [ref=e955]:
          - generic [ref=e957]: Ctrl/Cmd + Shift + Z
          - generic [ref=e958]: Redo the most recent undone filter change
      - generic [ref=e959]:
        - generic [ref=e960]: Selection & Views
        - generic [ref=e961]:
          - generic [ref=e963]: Ctrl/Cmd + A
          - generic [ref=e964]: Select all currently visible planner rows
        - generic [ref=e965]:
          - generic [ref=e967]: Ctrl + Alt + T
          - generic [ref=e968]: Toggle TV / 10-foot mode
        - generic [ref=e969]:
          - generic [ref=e971]: Esc
          - generic [ref=e972]: Exit iPhone view when the mobile preview is active
      - generic [ref=e973]:
        - generic [ref=e974]: Diagnostics
        - generic [ref=e975]:
          - generic [ref=e977]: Ctrl + Shift + D
          - generic [ref=e978]: Toggle the advanced debug console
        - generic [ref=e979]:
          - generic [ref=e981]: Ctrl + Shift + E
          - generic [ref=e982]: Expand the errors panel
  - button "❌" [ref=e983] [cursor=pointer]
  - generic [ref=e984]: ✅ App Ready - 9 systems initialized
```

# Test source

```ts
  1   | const { test: base, expect } = require('@playwright/test');
  2   | 
  3   | const EXTENSION_NOISE_PATTERNS = [
  4   |   /chrome-extension:\/\//i,
  5   |   /Unchecked runtime\.lastError: Cannot create item with duplicate id/i,
  6   |   /background-redux-new\.js/i,
  7   |   /Invalid frameId for foreground frameId/i,
  8   |   /\bLastPass\b/i,
  9   |   /Failed to load resource: the server responded with a status of 404 \(Not Found\) \(https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/root:\/.+:\/workbook\/tables\/.+\/columns\?\$select=name,index\)/i,
  10  |   /Failed to load resource: the server responded with a status of 404 \(Not Found\) \(https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/root:\/.+:\/workbook\/tables\)/i,
  11  |   /Failed to load resource: the server responded with a status of 404 \(Not Found\) \(https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/root:\/.+:\/workbook\/worksheets\?\$select=id,name,position\)/i,
  12  |   // Transient dev-server connection drops for any local static asset (JS, CSS, HTML,
  13  |   // fonts, etc.) – matched against both URL-encoded paths (JS%20Files / CSS%20Files) AND
  14  |   // decoded paths because Playwright's msg.text() may return either form depending on
  15  |   // Chromium version.  All three ERR_* codes are structurally identical: they indicate
  16  |   // a momentary drop in the connection to the local `serve` process, not an app bug.
  17  |   /Failed to load resource: net::ERR_CONNECTION_RESET[\s\S]*http:\/\/127\.0\.0\.1:\d+\//i,
  18  |   /Failed to load resource: net::ERR_SOCKET_NOT_CONNECTED[\s\S]*http:\/\/127\.0\.0\.1:\d+\//i,
  19  |   /Failed to load resource: net::ERR_NETWORK_CHANGED[\s\S]*http:\/\/127\.0\.0\.1:\d+\//i,
  20  |   // Service-worker script-fetch failure that can surface transiently when the local
  21  |   // dev server drops a connection mid-fetch.  The message contains no URL so cannot be
  22  |   // tied to a specific file, but it exclusively appears alongside the ERR_* drops above.
  23  |   /An unknown error occurred when fetching the script\./i,
  24  |   // The local `npx serve` process does not implement the same navigation-fallback
  25  |   // exclusion rules as Azure Static Web Apps (staticwebapp.config.json), so on
  26  |   // first load of a tab it occasionally returns index.html instead of the tab
  27  |   // partial.  The app detects this and logs the error below – it is not a functional
  28  |   // regression, just a dev-server routing quirk that does not reproduce in production.
  29  |   /❌ Error loading tab [^:]+: Error: Tab HTML for '[^']+' returned the app shell instead of tab markup/i,
  30  | ];
  31  | 
  32  | function isIntentionalWorkbookProbe404(text, locationUrl) {
  33  |   const msg = String(text || '');
  34  |   const url = String(locationUrl || '');
  35  |   const combined = `${msg}\n${url}`;
  36  |   const is404 = /Failed to load resource: the server responded with a status of 404 \(Not Found\)/i.test(msg);
  37  |   if (!is404) return false;
  38  | 
  39  |   const isGraphRootProbe = /https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/root:\//i.test(combined);
  40  |   if (!isGraphRootProbe) return false;
  41  | 
  42  |   // Playwright may place the URL in msg.text() OR in msg.location().url.
  43  |   // Accept known intentional workbook probe endpoints used by fallback routing.
  44  |   return /\/workbook\/(?:tables(?:\/[^/?#)]+)?(?:\/columns(?:\?\$select=name,index)?)?|worksheets\?\$select=id,name,position)/i.test(combined);
  45  | }
  46  | 
  47  | function isIgnoredExtensionNoise(text, locationUrl) {
  48  |   if (isIntentionalWorkbookProbe404(text, locationUrl)) return true;
  49  |   const candidate = `${String(text || '')}\n${String(locationUrl || '')}`;
  50  |   return EXTENSION_NOISE_PATTERNS.some((pattern) => pattern.test(candidate));
  51  | }
  52  | 
  53  | const test = base.extend({
  54  |   page: async ({ page }, use, testInfo) => {
  55  |     const unexpectedErrors = [];
  56  | 
  57  |     const onConsole = (msg) => {
  58  |       if (msg.type() !== 'error') return;
  59  |       const location = msg.location ? msg.location() : { url: '' };
  60  |       const text = msg.text();
  61  |       if (isIgnoredExtensionNoise(text, location && location.url)) return;
  62  |       unexpectedErrors.push({
  63  |         source: 'console',
  64  |         text,
  65  |         url: (location && location.url) || ''
  66  |       });
  67  |     };
  68  | 
  69  |     const onPageError = (error) => {
  70  |       const message = error && error.message ? String(error.message) : String(error || 'Unknown page error');
  71  |       const stack = error && error.stack ? String(error.stack) : '';
  72  |       if (isIgnoredExtensionNoise(`${message}\n${stack}`, '')) return;
  73  |       unexpectedErrors.push({
  74  |         source: 'pageerror',
  75  |         text: message,
  76  |         url: ''
  77  |       });
  78  |     };
  79  | 
  80  |     page.on('console', onConsole);
  81  |     page.on('pageerror', onPageError);
  82  | 
  83  |     await use(page);
  84  | 
  85  |     page.off('console', onConsole);
  86  |     page.off('pageerror', onPageError);
  87  | 
  88  |     if (unexpectedErrors.length) {
  89  |       const preview = unexpectedErrors
  90  |         .slice(0, 5)
  91  |         .map((row, idx) => `${idx + 1}. [${row.source}] ${row.text}${row.url ? ` (${row.url})` : ''}`)
  92  |         .join('\n');
  93  | 
  94  |       await testInfo.attach('unexpected-browser-errors.txt', {
  95  |         body: Buffer.from(preview, 'utf8'),
  96  |         contentType: 'text/plain'
  97  |       });
  98  | 
> 99  |       throw new Error(`Unexpected browser errors detected:\n${preview}`);
      |             ^ Error: Unexpected browser errors detected:
  100 |     }
  101 |   }
  102 | });
  103 | 
  104 | module.exports = { test, expect, isIgnoredExtensionNoise };
  105 | 
  106 | 
```