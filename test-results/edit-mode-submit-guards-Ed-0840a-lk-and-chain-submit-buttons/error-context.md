# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: edit-mode-submit-guards.spec.js >> Edit Mode submit guards >> prevent duplicate rapid clicks for single, bulk, and chain submit buttons
- Location: tests/edit-mode-submit-guards.spec.js:55:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 1
Received: 0

Call Log:
- Timeout 12000ms exceeded while waiting on the predicate
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
      - generic [ref=e12]: "Startup timing: interactive 102 ms | overlay off 453 ms"
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
    - generic [ref=e56]:
      - text: ▾
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
              - generic [ref=e75]: "Outdoors data: ready 0 locations | Source: Nature_Locations.xlsx / Nature_Locations Updated 4/24/2026, 5:19:39 PM"
              - generic [ref=e76]:
                - button "🔎 Explore Outdoors" [ref=e77] [cursor=pointer]
                - button "🏙️ City Explorer" [ref=e78] [cursor=pointer]
                - button "Log a Visit" [ref=e79] [cursor=pointer]
                - button "📝 Edit Mode" [ref=e80] [cursor=pointer]
                - button "Refresh Data" [ref=e81] [cursor=pointer]
                - button "↶ Undo" [disabled] [ref=e82] [cursor=pointer]
          - generic [ref=e83]:
            - generic [ref=e84]:
              - generic [ref=e86]:
                - generic [ref=e87]: 📊 Category Progression
                - generic [ref=e88]:
                  - text: "Track your Outdoors visits by category. Total logged:"
                  - strong [ref=e89]: "0"
                  - text: .
                  - button "Log Visit" [ref=e90] [cursor=pointer]
              - generic [ref=e91]:
                - generic [ref=e92]:
                  - generic [ref=e93]: 🥾
                  - generic [ref=e94]: Trailheads
                  - generic [ref=e95]: 0 / 0
                  - generic [ref=e96]: 0% complete
                  - generic [ref=e99]: Auto-tracked from visit logs
                - generic [ref=e100]:
                  - generic [ref=e101]: 💧
                  - generic [ref=e102]: Waterfalls
                  - generic [ref=e103]: 0 / 0
                  - generic [ref=e104]: 0% complete
                  - generic [ref=e107]: Auto-tracked from visit logs
                - generic [ref=e108]:
                  - generic [ref=e109]: 🏔️
                  - generic [ref=e110]: Scenic Overlooks
                  - generic [ref=e111]: 0 / 0
                  - generic [ref=e112]: 0% complete
                  - generic [ref=e115]: Auto-tracked from visit logs
                - generic [ref=e116]:
                  - generic [ref=e117]: ⛺
                  - generic [ref=e118]: Campgrounds
                  - generic [ref=e119]: 0 / 0
                  - generic [ref=e120]: 0% complete
                  - generic [ref=e123]: Auto-tracked from visit logs
                - generic [ref=e124]:
                  - generic [ref=e125]: 🌲
                  - generic [ref=e126]: State Parks
                  - generic [ref=e127]: 0 / 0
                  - generic [ref=e128]: 0% complete
                  - generic [ref=e131]: Auto-tracked from visit logs
                - generic [ref=e132]:
                  - generic [ref=e133]: 🏔️
                  - generic [ref=e134]: National Parks
                  - generic [ref=e135]: 0 / 0
                  - generic [ref=e136]: 0% complete
                  - generic [ref=e139]: Auto-tracked from visit logs
                - generic [ref=e140]:
                  - generic [ref=e141]: 🏖️
                  - generic [ref=e142]: Public Beaches
                  - generic [ref=e143]: 0 / 0
                  - generic [ref=e144]: 0% complete
                  - generic [ref=e147]: Auto-tracked from visit logs
                - generic [ref=e148]:
                  - generic [ref=e149]: 🏞️
                  - generic [ref=e150]: Lakes & Ponds
                  - generic [ref=e151]: 0 / 0
                  - generic [ref=e152]: 0% complete
                  - generic [ref=e155]: Auto-tracked from visit logs
                - generic [ref=e156]:
                  - generic [ref=e157]: 🏕️
                  - generic [ref=e158]: Recreation Areas
                  - generic [ref=e159]: 0 / 0
                  - generic [ref=e160]: 0% complete
                  - generic [ref=e163]: Auto-tracked from visit logs
                - generic [ref=e164]:
                  - generic [ref=e165]: 🌺
                  - generic [ref=e166]: Botanical Gardens
                  - generic [ref=e167]: 0 / 0
                  - generic [ref=e168]: 0% complete
                  - generic [ref=e171]: Auto-tracked from visit logs
            - generic [ref=e172]:
              - generic [ref=e173]:
                - generic [ref=e174]:
                  - generic [ref=e175]: 🏅 Challenges & Badges
                  - generic [ref=e176]: Challenge goals and badges now share one achievement wall using the same badge layout.
                - generic [ref=e177]: 0/100
              - generic [ref=e178]:
                - generic [ref=e180]:
                  - generic [ref=e181]: 🥾
                  - generic [ref=e182]:
                    - generic [ref=e184]:
                      - generic [ref=e185]: Trailhead Seeker
                      - generic [ref=e186]: Challenge
                    - generic [ref=e187]:
                      - generic [ref=e188]: Not Started
                      - button "View all levels for Trailhead Seeker" [ref=e190] [cursor=pointer]: ⓘ
                    - generic [ref=e191]: Visit 3 trailheads.
                    - generic [ref=e192]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e194]:
                      - text: 0/1 visits →
                      - strong [ref=e195]: L1 Rookie
                    - generic [ref=e197]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 trailhead" [ref=e198]':
                        - generic [ref=e199]: L1
                        - generic [ref=e200]: Rookie
                        - generic [ref=e201]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 trailhead" [ref=e202]':
                        - generic [ref=e203]: L2
                        - generic [ref=e204]: Novice
                        - generic [ref=e205]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 trailhead" [ref=e206]':
                        - generic [ref=e207]: L3
                        - generic [ref=e208]: Semi-Pro
                        - generic [ref=e209]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 trailhead" [ref=e210]':
                        - generic [ref=e211]: L4
                        - generic [ref=e212]: Pro
                        - generic [ref=e213]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ trailhead" [ref=e214]':
                        - generic [ref=e215]: L5
                        - generic [ref=e216]: MVP
                        - generic [ref=e217]: 🔒
                    - generic [ref=e218]:
                      - button "−" [ref=e219] [cursor=pointer]
                      - button "+ Log" [ref=e220] [cursor=pointer]
                - generic [ref=e222]:
                  - generic [ref=e223]: 💧
                  - generic [ref=e224]:
                    - generic [ref=e226]:
                      - generic [ref=e227]: Waterfall Hunter
                      - generic [ref=e228]: Challenge
                    - generic [ref=e229]:
                      - generic [ref=e230]: Not Started
                      - button "View all levels for Waterfall Hunter" [ref=e232] [cursor=pointer]: ⓘ
                    - generic [ref=e233]: Discover 3 waterfalls.
                    - generic [ref=e234]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e236]:
                      - text: 0/1 visits →
                      - strong [ref=e237]: L1 Rookie
                    - generic [ref=e239]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 waterfall" [ref=e240]':
                        - generic [ref=e241]: L1
                        - generic [ref=e242]: Rookie
                        - generic [ref=e243]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 waterfall" [ref=e244]':
                        - generic [ref=e245]: L2
                        - generic [ref=e246]: Novice
                        - generic [ref=e247]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 waterfall" [ref=e248]':
                        - generic [ref=e249]: L3
                        - generic [ref=e250]: Semi-Pro
                        - generic [ref=e251]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 waterfall" [ref=e252]':
                        - generic [ref=e253]: L4
                        - generic [ref=e254]: Pro
                        - generic [ref=e255]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ waterfall" [ref=e256]':
                        - generic [ref=e257]: L5
                        - generic [ref=e258]: MVP
                        - generic [ref=e259]: 🔒
                    - generic [ref=e260]:
                      - button "−" [ref=e261] [cursor=pointer]
                      - button "+ Log" [ref=e262] [cursor=pointer]
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
                - generic [ref=e306]:
                  - generic [ref=e307]: ⛺
                  - generic [ref=e308]:
                    - generic [ref=e310]:
                      - generic [ref=e311]: Campfire Nights
                      - generic [ref=e312]: Challenge
                    - generic [ref=e313]:
                      - generic [ref=e314]: Not Started
                      - button "View all levels for Campfire Nights" [ref=e316] [cursor=pointer]: ⓘ
                    - generic [ref=e317]: Camp at 2 campgrounds.
                    - generic [ref=e318]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e320]:
                      - text: 0/1 visits →
                      - strong [ref=e321]: L1 Rookie
                    - generic [ref=e323]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 campground" [ref=e324]':
                        - generic [ref=e325]: L1
                        - generic [ref=e326]: Rookie
                        - generic [ref=e327]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 campground" [ref=e328]':
                        - generic [ref=e329]: L2
                        - generic [ref=e330]: Novice
                        - generic [ref=e331]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 campground" [ref=e332]':
                        - generic [ref=e333]: L3
                        - generic [ref=e334]: Semi-Pro
                        - generic [ref=e335]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 campground" [ref=e336]':
                        - generic [ref=e337]: L4
                        - generic [ref=e338]: Pro
                        - generic [ref=e339]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ campground" [ref=e340]':
                        - generic [ref=e341]: L5
                        - generic [ref=e342]: MVP
                        - generic [ref=e343]: 🔒
                    - generic [ref=e344]:
                      - button "−" [ref=e345] [cursor=pointer]
                      - button "+ Log" [ref=e346] [cursor=pointer]
                - generic [ref=e348]:
                  - generic [ref=e349]: 🌲
                  - generic [ref=e350]:
                    - generic [ref=e352]:
                      - generic [ref=e353]: State Park Tour
                      - generic [ref=e354]: Challenge
                    - generic [ref=e355]:
                      - generic [ref=e356]: Not Started
                      - button "View all levels for State Park Tour" [ref=e358] [cursor=pointer]: ⓘ
                    - generic [ref=e359]: Visit 2 state parks.
                    - generic [ref=e360]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e362]:
                      - text: 0/1 visits →
                      - strong [ref=e363]: L1 Rookie
                    - generic [ref=e365]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 state park" [ref=e366]':
                        - generic [ref=e367]: L1
                        - generic [ref=e368]: Rookie
                        - generic [ref=e369]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 state park" [ref=e370]':
                        - generic [ref=e371]: L2
                        - generic [ref=e372]: Novice
                        - generic [ref=e373]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 state park" [ref=e374]':
                        - generic [ref=e375]: L3
                        - generic [ref=e376]: Semi-Pro
                        - generic [ref=e377]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 state park" [ref=e378]':
                        - generic [ref=e379]: L4
                        - generic [ref=e380]: Pro
                        - generic [ref=e381]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ state park" [ref=e382]':
                        - generic [ref=e383]: L5
                        - generic [ref=e384]: MVP
                        - generic [ref=e385]: 🔒
                    - generic [ref=e386]:
                      - button "−" [ref=e387] [cursor=pointer]
                      - button "+ Log" [ref=e388] [cursor=pointer]
                - generic [ref=e390]:
                  - generic [ref=e391]: 🏔️
                  - generic [ref=e392]:
                    - generic [ref=e394]:
                      - generic [ref=e395]: National Park Day
                      - generic [ref=e396]: Challenge
                    - generic [ref=e397]:
                      - generic [ref=e398]: Not Started
                      - button "View all levels for National Park Day" [ref=e400] [cursor=pointer]: ⓘ
                    - generic [ref=e401]: Visit 1 national park.
                    - generic [ref=e402]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e404]:
                      - text: 0/1 visits →
                      - strong [ref=e405]: L1 Rookie
                    - generic [ref=e407]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 national park" [ref=e408]':
                        - generic [ref=e409]: L1
                        - generic [ref=e410]: Rookie
                        - generic [ref=e411]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 national park" [ref=e412]':
                        - generic [ref=e413]: L2
                        - generic [ref=e414]: Novice
                        - generic [ref=e415]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 national park" [ref=e416]':
                        - generic [ref=e417]: L3
                        - generic [ref=e418]: Semi-Pro
                        - generic [ref=e419]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 national park" [ref=e420]':
                        - generic [ref=e421]: L4
                        - generic [ref=e422]: Pro
                        - generic [ref=e423]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ national park" [ref=e424]':
                        - generic [ref=e425]: L5
                        - generic [ref=e426]: MVP
                        - generic [ref=e427]: 🔒
                    - generic [ref=e428]:
                      - button "−" [ref=e429] [cursor=pointer]
                      - button "+ Log" [ref=e430] [cursor=pointer]
                - generic [ref=e432]:
                  - generic [ref=e433]: 🏖️
                  - generic [ref=e434]:
                    - generic [ref=e436]:
                      - generic [ref=e437]: Shoreline Explorer
                      - generic [ref=e438]: Challenge
                    - generic [ref=e439]:
                      - generic [ref=e440]: Not Started
                      - button "View all levels for Shoreline Explorer" [ref=e442] [cursor=pointer]: ⓘ
                    - generic [ref=e443]: Swim at 2 public beaches.
                    - generic [ref=e444]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e446]:
                      - text: 0/1 visits →
                      - strong [ref=e447]: L1 Rookie
                    - generic [ref=e449]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 beach" [ref=e450]':
                        - generic [ref=e451]: L1
                        - generic [ref=e452]: Rookie
                        - generic [ref=e453]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 beach" [ref=e454]':
                        - generic [ref=e455]: L2
                        - generic [ref=e456]: Novice
                        - generic [ref=e457]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 beach" [ref=e458]':
                        - generic [ref=e459]: L3
                        - generic [ref=e460]: Semi-Pro
                        - generic [ref=e461]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 beach" [ref=e462]':
                        - generic [ref=e463]: L4
                        - generic [ref=e464]: Pro
                        - generic [ref=e465]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ beach" [ref=e466]':
                        - generic [ref=e467]: L5
                        - generic [ref=e468]: MVP
                        - generic [ref=e469]: 🔒
                    - generic [ref=e470]:
                      - button "−" [ref=e471] [cursor=pointer]
                      - button "+ Log" [ref=e472] [cursor=pointer]
                - generic [ref=e474]:
                  - generic [ref=e475]: 🏞️
                  - generic [ref=e476]:
                    - generic [ref=e478]:
                      - generic [ref=e479]: Lake & Pond Loop
                      - generic [ref=e480]: Challenge
                    - generic [ref=e481]:
                      - generic [ref=e482]: Not Started
                      - button "View all levels for Lake & Pond Loop" [ref=e484] [cursor=pointer]: ⓘ
                    - generic [ref=e485]: Explore 3 lakes or ponds.
                    - generic [ref=e486]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e488]:
                      - text: 0/1 visits →
                      - strong [ref=e489]: L1 Rookie
                    - generic [ref=e491]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 lake" [ref=e492]':
                        - generic [ref=e493]: L1
                        - generic [ref=e494]: Rookie
                        - generic [ref=e495]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 lake" [ref=e496]':
                        - generic [ref=e497]: L2
                        - generic [ref=e498]: Novice
                        - generic [ref=e499]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 lake" [ref=e500]':
                        - generic [ref=e501]: L3
                        - generic [ref=e502]: Semi-Pro
                        - generic [ref=e503]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 lake" [ref=e504]':
                        - generic [ref=e505]: L4
                        - generic [ref=e506]: Pro
                        - generic [ref=e507]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ lake" [ref=e508]':
                        - generic [ref=e509]: L5
                        - generic [ref=e510]: MVP
                        - generic [ref=e511]: 🔒
                    - generic [ref=e512]:
                      - button "−" [ref=e513] [cursor=pointer]
                      - button "+ Log" [ref=e514] [cursor=pointer]
                - generic [ref=e516]:
                  - generic [ref=e517]: 🌺
                  - generic [ref=e518]:
                    - generic [ref=e520]:
                      - generic [ref=e521]: Garden Stroll
                      - generic [ref=e522]: Challenge
                    - generic [ref=e523]:
                      - generic [ref=e524]: Not Started
                      - button "View all levels for Garden Stroll" [ref=e526] [cursor=pointer]: ⓘ
                    - generic [ref=e527]: Visit 2 botanical gardens.
                    - generic [ref=e528]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e530]:
                      - text: 0/1 visits →
                      - strong [ref=e531]: L1 Rookie
                    - generic [ref=e533]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 gardens" [ref=e534]':
                        - generic [ref=e535]: L1
                        - generic [ref=e536]: Rookie
                        - generic [ref=e537]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 gardens" [ref=e538]':
                        - generic [ref=e539]: L2
                        - generic [ref=e540]: Novice
                        - generic [ref=e541]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 gardens" [ref=e542]':
                        - generic [ref=e543]: L3
                        - generic [ref=e544]: Semi-Pro
                        - generic [ref=e545]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 gardens" [ref=e546]':
                        - generic [ref=e547]: L4
                        - generic [ref=e548]: Pro
                        - generic [ref=e549]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ gardens" [ref=e550]':
                        - generic [ref=e551]: L5
                        - generic [ref=e552]: MVP
                        - generic [ref=e553]: 🔒
                    - generic [ref=e554]:
                      - button "−" [ref=e555] [cursor=pointer]
                      - button "+ Log" [ref=e556] [cursor=pointer]
                - generic [ref=e558]:
                  - generic [ref=e559]: 🏕️
                  - generic [ref=e560]:
                    - generic [ref=e562]:
                      - generic [ref=e563]: Recreation Champion
                      - generic [ref=e564]: Challenge
                    - generic [ref=e565]:
                      - generic [ref=e566]: Not Started
                      - button "View all levels for Recreation Champion" [ref=e568] [cursor=pointer]: ⓘ
                    - generic [ref=e569]: Complete 4 recreation or day-use areas.
                    - generic [ref=e570]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e572]:
                      - text: 0/1 visits →
                      - strong [ref=e573]: L1 Rookie
                    - generic [ref=e575]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 rec area" [ref=e576]':
                        - generic [ref=e577]: L1
                        - generic [ref=e578]: Rookie
                        - generic [ref=e579]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 rec area" [ref=e580]':
                        - generic [ref=e581]: L2
                        - generic [ref=e582]: Novice
                        - generic [ref=e583]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 rec area" [ref=e584]':
                        - generic [ref=e585]: L3
                        - generic [ref=e586]: Semi-Pro
                        - generic [ref=e587]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 rec area" [ref=e588]':
                        - generic [ref=e589]: L4
                        - generic [ref=e590]: Pro
                        - generic [ref=e591]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ rec area" [ref=e592]':
                        - generic [ref=e593]: L5
                        - generic [ref=e594]: MVP
                        - generic [ref=e595]: 🔒
                    - generic [ref=e596]:
                      - button "−" [ref=e597] [cursor=pointer]
                      - button "+ Log" [ref=e598] [cursor=pointer]
                - generic [ref=e600]:
                  - generic [ref=e601]: 🔒
                  - generic [ref=e602]:
                    - generic [ref=e604]:
                      - generic [ref=e605]: Trail Starter
                      - generic [ref=e606]: Common
                    - generic [ref=e607]:
                      - generic [ref=e608]: Not Started
                      - button "View all levels for Trail Starter" [ref=e610] [cursor=pointer]: ⓘ
                    - generic [ref=e612]:
                      - text: 0/1 trailheads →
                      - strong [ref=e613]: L1 Rookie
                - generic [ref=e616]:
                  - generic [ref=e617]: 🔒
                  - generic [ref=e618]:
                    - generic [ref=e620]:
                      - generic [ref=e621]: Waterfall Seeker
                      - generic [ref=e622]: Rare
                    - generic [ref=e623]:
                      - generic [ref=e624]: Not Started
                      - button "View all levels for Waterfall Seeker" [ref=e626] [cursor=pointer]: ⓘ
                    - generic [ref=e628]:
                      - text: 0/1 waterfalls →
                      - strong [ref=e629]: L1 Rookie
                - generic [ref=e632]:
                  - generic [ref=e633]: 🔒
                  - generic [ref=e634]:
                    - generic [ref=e636]:
                      - generic [ref=e637]: Park Ranger
                      - generic [ref=e638]: Rare
                    - generic [ref=e639]:
                      - generic [ref=e640]: Not Started
                      - button "View all levels for Park Ranger" [ref=e642] [cursor=pointer]: ⓘ
                    - generic [ref=e644]:
                      - text: 0/1 state parks →
                      - strong [ref=e645]: L1 Rookie
                - generic [ref=e648]:
                  - generic [ref=e649]: 🔒
                  - generic [ref=e650]:
                    - generic [ref=e652]:
                      - generic [ref=e653]: Camp Explorer
                      - generic [ref=e654]: Rare
                    - generic [ref=e655]:
                      - generic [ref=e656]: Not Started
                      - button "View all levels for Camp Explorer" [ref=e658] [cursor=pointer]: ⓘ
                    - generic [ref=e660]:
                      - text: 0/1 campgrounds →
                      - strong [ref=e661]: L1 Rookie
                - generic [ref=e664]:
                  - generic [ref=e665]: 🔒
                  - generic [ref=e666]:
                    - generic [ref=e668]:
                      - generic [ref=e669]: Lake Walker
                      - generic [ref=e670]: Epic
                    - generic [ref=e671]:
                      - generic [ref=e672]: Not Started
                      - button "View all levels for Lake Walker" [ref=e674] [cursor=pointer]: ⓘ
                    - generic [ref=e676]:
                      - text: 0/1 lakes & ponds →
                      - strong [ref=e677]: L1 Rookie
                - generic [ref=e680]:
                  - generic [ref=e681]: 🔒
                  - generic [ref=e682]:
                    - generic [ref=e684]:
                      - generic [ref=e685]: Summit Chaser
                      - generic [ref=e686]: Epic
                    - generic [ref=e687]:
                      - generic [ref=e688]: Not Started
                      - button "View all levels for Summit Chaser" [ref=e690] [cursor=pointer]: ⓘ
                    - generic [ref=e692]:
                      - text: 0/1 scenic overlooks →
                      - strong [ref=e693]: L1 Rookie
                - generic [ref=e696]:
                  - generic [ref=e697]: 🔒
                  - generic [ref=e698]:
                    - generic [ref=e700]:
                      - generic [ref=e701]: Beach Goer
                      - generic [ref=e702]: Rare
                    - generic [ref=e703]:
                      - generic [ref=e704]: Not Started
                      - button "View all levels for Beach Goer" [ref=e706] [cursor=pointer]: ⓘ
                    - generic [ref=e708]:
                      - text: 0/1 public beaches →
                      - strong [ref=e709]: L1 Rookie
                - generic [ref=e712]:
                  - generic [ref=e713]: 🔒
                  - generic [ref=e714]:
                    - generic [ref=e716]:
                      - generic [ref=e717]: Garden Lover
                      - generic [ref=e718]: Rare
                    - generic [ref=e719]:
                      - generic [ref=e720]: Not Started
                      - button "View all levels for Garden Lover" [ref=e722] [cursor=pointer]: ⓘ
                    - generic [ref=e724]:
                      - text: 0/1 botanical gardens →
                      - strong [ref=e725]: L1 Rookie
                - generic [ref=e728]:
                  - generic [ref=e729]: 🔒
                  - generic [ref=e730]:
                    - generic [ref=e732]:
                      - generic [ref=e733]: Outdoors Devotee
                      - generic [ref=e734]: Legendary
                    - generic [ref=e735]:
                      - generic [ref=e736]: Not Started
                      - button "View all levels for Outdoors Devotee" [ref=e738] [cursor=pointer]: ⓘ
                    - generic [ref=e740]:
                      - text: 0/1 total visits →
                      - strong [ref=e741]: L1 Rookie
                - generic [ref=e744]:
                  - generic [ref=e745]: 🔒
                  - generic [ref=e746]:
                    - generic [ref=e748]:
                      - generic [ref=e749]: Nature Champion
                      - generic [ref=e750]: Legendary
                    - generic [ref=e751]:
                      - generic [ref=e752]: Not Started
                      - button "View all levels for Nature Champion" [ref=e754] [cursor=pointer]: ⓘ
                    - generic [ref=e756]:
                      - text: 0/1 completed challenges →
                      - strong [ref=e757]: L1 Rookie
            - generic [ref=e759]:
              - generic [ref=e761]:
                - generic [ref=e762]: 📚 Seasonal Quests
                - generic [ref=e763]: Multi-step seasonal goals for Outdoors.
              - generic [ref=e764]:
                - generic [ref=e765]:
                  - generic [ref=e766]: 🌸 Spring Now
                  - generic [ref=e767]: Spring Awakening
                  - generic [ref=e768]: 0/3 steps
                  - generic [ref=e769]:
                    - generic [ref=e770]:
                      - generic [ref=e771]: ○
                      - generic [ref=e772]: Visit 3 parks or gardens
                      - generic [ref=e773]: Auto
                    - generic [ref=e774]:
                      - generic [ref=e775]: ○
                      - generic [ref=e776]: Find a waterfall
                      - generic [ref=e777]: Auto
                    - generic [ref=e778]:
                      - generic [ref=e779]: ○
                      - generic [ref=e780]: Hike a trail
                      - generic [ref=e781]: Auto
                - generic [ref=e782]:
                  - generic [ref=e783]: ☀️ Summer
                  - generic [ref=e784]: Summer Expedition
                  - generic [ref=e785]: 0/3 steps
                  - generic [ref=e786]:
                    - generic [ref=e787]:
                      - generic [ref=e788]: ○
                      - generic [ref=e789]: Swim at a public beach
                      - generic [ref=e790]: Auto
                    - generic [ref=e791]:
                      - generic [ref=e792]: ○
                      - generic [ref=e793]: Visit a recreation area
                      - generic [ref=e794]: Auto
                    - generic [ref=e795]:
                      - generic [ref=e796]: ○
                      - generic [ref=e797]: Camp overnight
                      - generic [ref=e798]: Auto
                - generic [ref=e799]:
                  - generic [ref=e800]: 🍂 Fall
                  - generic [ref=e801]: Fall Foliage Tour
                  - generic [ref=e802]: 0/3 steps
                  - generic [ref=e803]:
                    - generic [ref=e804]:
                      - generic [ref=e805]: ○
                      - generic [ref=e806]: Visit 3 scenic overlooks
                      - generic [ref=e807]: Auto
                    - generic [ref=e808]:
                      - generic [ref=e809]: ○
                      - generic [ref=e810]: Explore a state park
                      - generic [ref=e811]: Auto
                    - generic [ref=e812]:
                      - generic [ref=e813]: ○
                      - generic [ref=e814]: Find a lake or pond
                      - generic [ref=e815]: Auto
                - generic [ref=e816]:
                  - generic [ref=e817]: ❄️ Winter
                  - generic [ref=e818]: Winter Wild Side
                  - generic [ref=e819]: 0/3 steps
                  - generic [ref=e820]:
                    - generic [ref=e821]:
                      - generic [ref=e822]: ○
                      - generic [ref=e823]: Find a waterfall (brave the cold!)
                      - generic [ref=e824]: Auto
                    - generic [ref=e825]:
                      - generic [ref=e826]: ○
                      - generic [ref=e827]: Hike a trailhead
                      - generic [ref=e828]: Auto
                    - generic [ref=e829]:
                      - generic [ref=e830]: ○
                      - generic [ref=e831]: Visit a botanical garden
                      - generic [ref=e832]: Auto
            - generic [ref=e833]:
              - generic [ref=e834]:
                - generic [ref=e835]:
                  - generic [ref=e836]: 🟩 Outdoors Bingo
                  - generic [ref=e837]: Auto-synced from your logged visits. Complete a row, column, or diagonal for BINGO!
                - generic [ref=e838]: 0/9
              - generic [ref=e839]:
                - generic "Trailhead not completed" [ref=e840] [cursor=pointer]:
                  - generic [ref=e841]: 🥾
                  - generic [ref=e842]: Trailhead
                - generic "Waterfall not completed" [ref=e843] [cursor=pointer]:
                  - generic [ref=e844]: 💧
                  - generic [ref=e845]: Waterfall
                - generic "State Park not completed" [ref=e846] [cursor=pointer]:
                  - generic [ref=e847]: 🌲
                  - generic [ref=e848]: State Park
                - generic "Campground not completed" [ref=e849] [cursor=pointer]:
                  - generic [ref=e850]: ⛺
                  - generic [ref=e851]: Campground
                - generic "Scenic Overlook not completed" [ref=e852] [cursor=pointer]:
                  - generic [ref=e853]: 🏔️
                  - generic [ref=e854]: Scenic Overlook
                - generic "Lake or Pond not completed" [ref=e855] [cursor=pointer]:
                  - generic [ref=e856]: 🏞️
                  - generic [ref=e857]: Lake or Pond
                - generic "Public Beach not completed" [ref=e858] [cursor=pointer]:
                  - generic [ref=e859]: 🏖️
                  - generic [ref=e860]: Public Beach
                - generic "National Park not completed" [ref=e861] [cursor=pointer]:
                  - generic [ref=e862]: 🏔️
                  - generic [ref=e863]: National Park
                - generic "Botanical Garden not completed" [ref=e864] [cursor=pointer]:
                  - generic [ref=e865]: 🌺
                  - generic [ref=e866]: Botanical Garden
              - generic [ref=e867]: 0/9 tiles marked
        - group "🧰 Diagnostics, Sync and Clean Up" [ref=e868]:
          - generic "🧰 Diagnostics, Sync and Clean Up Sync health, local queue visibility, and visited tracker diagnostics. ▾" [ref=e869] [cursor=pointer]:
            - generic [ref=e870]:
              - generic [ref=e871]: 🧰 Diagnostics, Sync and Clean Up
              - generic [ref=e872]: Sync health, local queue visibility, and visited tracker diagnostics.
            - text: ▾
          - option "Strict (Place ID + exact name)"
          - option "Balanced (Place ID + exact + fuzzy)" [selected]
          - option "Name Only (exact + fuzzy)"
  - button "Deployment 2026.04.23.live-debug.1 OK (4/4)" [ref=e874] [cursor=pointer]
```

# Test source

```ts
  134 |         options.forEach(opt => {
  135 |           const option = document.createElement('option');
  136 |           option.value = opt.value;
  137 |           option.textContent = opt.text;
  138 |           select.appendChild(option);
  139 |         });
  140 |       }
  141 | 
  142 |       /* Inject stub handlers that make real graph API calls to trigger mocking */
  143 |       window.submitAddSinglePlace = window.submitAddSinglePlace || async function() {
  144 |         console.log('[test-stub] submitAddSinglePlace called');
  145 |         try {
  146 |           console.log('[test-stub] about to fetch...');
  147 |           const response = await fetch('https://graph.microsoft.com/v1.0/me/drive/root/children', {
  148 |             method: 'POST',
  149 |             headers: { 'Authorization': 'Bearer playwright-mock-token', 'Content-Type': 'application/json' },
  150 |             body: JSON.stringify({ name: 'test' })
  151 |           });
  152 |           console.log('[test-stub] fetch response:', response.status, response.ok);
  153 |           return { success: response.ok, status: response.status };
  154 |         } catch (e) {
  155 |           console.error('[test-stub] fetch error:', e.message);
  156 |           return { success: false, error: String(e) };
  157 |         }
  158 |       };
  159 |       window.submitAddBulkPlaces = window.submitAddBulkPlaces || async function() {
  160 |         console.log('[test-stub] submitAddBulkPlaces called');
  161 |         try {
  162 |           await fetch('https://graph.microsoft.com/v1.0/me/drive/root/children', {
  163 |             method: 'POST',
  164 |             headers: { 'Authorization': 'Bearer playwright-mock-token', 'Content-Type': 'application/json' },
  165 |             body: JSON.stringify({ name: 'bulk' })
  166 |           });
  167 |           return { success: true };
  168 |         } catch (e) {
  169 |           return { success: false, error: String(e) };
  170 |         }
  171 |       };
  172 |       window.handleBulkAddChainLocationsFixed = window.handleBulkAddChainLocationsFixed || async function() {
  173 |         console.log('[test-stub] handleBulkAddChainLocationsFixed called');
  174 |         try {
  175 |           await fetch('https://graph.microsoft.com/v1.0/me/drive/root/children', {
  176 |             method: 'POST',
  177 |             headers: { 'Authorization': 'Bearer playwright-mock-token', 'Content-Type': 'application/json' },
  178 |             body: JSON.stringify({ name: 'chain' })
  179 |           });
  180 |           return { success: true };
  181 |         } catch (e) {
  182 |           return { success: false, error: String(e) };
  183 |         }
  184 |       };
  185 | 
  186 |       /* Wire onclick handlers to submit buttons */
  187 |       const singleBtn = document.getElementById('singleSubmitBtn');
  188 |       if (singleBtn && !singleBtn.onclick) {
  189 |         singleBtn.onclick = async (e) => {
  190 |           e.preventDefault();
  191 |           console.log('[test-btn] single click');
  192 |           return await window.submitAddSinglePlace();
  193 |         };
  194 |       }
  195 |       const bulkBtn = document.getElementById('bulkSubmitBtn');
  196 |       if (bulkBtn && !bulkBtn.onclick) {
  197 |         bulkBtn.onclick = async (e) => {
  198 |           e.preventDefault();
  199 |           console.log('[test-btn] bulk click');
  200 |           return await window.submitAddBulkPlaces();
  201 |         };
  202 |       }
  203 |       const chainBtn = document.getElementById('chainSubmitBtn');
  204 |       if (chainBtn && !chainBtn.onclick) {
  205 |         chainBtn.onclick = async (e) => {
  206 |           e.preventDefault();
  207 |           console.log('[test-btn] chain click');
  208 |           return await window.handleBulkAddChainLocationsFixed();
  209 |         };
  210 |       }
  211 |     });
  212 |     await popup.evaluate(() => {
  213 |       window.__targetConfirmMessages = [];
  214 |       window.confirm = (message) => {
  215 |         window.__targetConfirmMessages.push(String(message || ''));
  216 |         return true;
  217 |       };
  218 |     });
  219 | 
  220 |     await popup.selectOption('#actionTargetSelect', 'ent_festivals');
  221 | 
  222 |     await popup.selectOption('#singleInputType', 'placeName');
  223 |     await popup.fill('#singleInput', 'Apple Blossom Festival');
  224 | 
  225 |     /* Test direct function call first to verify setup */
  226 |     console.log('Before single click, graphCalls.length:', graphCalls.length);
  227 |     await popup.evaluate(() => window.submitAddSinglePlace());
  228 |     await popup.waitForTimeout(500);
  229 |     console.log('After direct call, graphCalls.length:', graphCalls.length);
  230 | 
  231 |     await popup.click('#singleSubmitBtn');
  232 |     await popup.waitForTimeout(25);
  233 |     await popup.click('#singleSubmitBtn');
> 234 |     await expect.poll(() => graphCalls.length, { timeout: 12000 }).toBe(1);
      |     ^ Error: expect(received).toBe(expected) // Object.is equality
  235 | 
  236 |     await popup.selectOption('#bulkInputType', 'placeName');
  237 |     await popup.fill('#bulkInput', 'Pear Harvest Festival\nPeach Jam Festival');
  238 |     await popup.click('#bulkSubmitBtn');
  239 |     await popup.waitForTimeout(25);
  240 |     await popup.click('#bulkSubmitBtn');
  241 |     await expect.poll(() => graphCalls.length, { timeout: 15000 }).toBe(3);
  242 | 
  243 |     await popup.evaluate(() => {
  244 |       window.__chainSubmitCalls = 0;
  245 |       const original = typeof window.handleBulkAddChainLocationsFixed === 'function'
  246 |         ? window.handleBulkAddChainLocationsFixed
  247 |         : null;
  248 |       window.handleBulkAddChainLocationsFixed = async (...args) => {
  249 |         window.__chainSubmitCalls += 1;
  250 |         await new Promise((resolve) => window.setTimeout(resolve, 300));
  251 |         if (!original) return { success: true, message: 'chain complete' };
  252 |         return original(...args);
  253 |       };
  254 |     });
  255 | 
  256 |     await popup.selectOption('#chainInputType', 'placeNameCity');
  257 |     await popup.fill('#chainInput', 'Chain Test Location, Asheville');
  258 |     await popup.click('#chainSubmitBtn');
  259 |     await popup.waitForTimeout(25);
  260 |     await popup.click('#chainSubmitBtn');
  261 |     await expect.poll(() => popup.evaluate(() => window.__chainSubmitCalls || 0), { timeout: 10000 }).toBe(1);
  262 |   });
  263 | });
  264 | 
  265 | 
```