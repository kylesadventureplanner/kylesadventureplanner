# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: edit-mode-draft-guards.spec.js >> Edit Mode draft guards >> draft is cleared from localStorage after a successful single submit
- Location: tests/edit-mode-draft-guards.spec.js:159:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 1
Received: 0

Call Log:
- Timeout 10000ms exceeded while waiting on the predicate
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
      - generic [ref=e12]: "Startup timing: interactive 107 ms | overlay off 498 ms"
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
              - generic [ref=e75]: "Outdoors data: ready 0 locations | Source: Nature_Locations.xlsx / Nature_Locations Updated 4/26/2026, 11:05:27 AM"
              - generic [ref=e76]:
                - button "🔎 Explore Outdoors" [ref=e77] [cursor=pointer]
                - button "🏙️ City Explorer" [ref=e78] [cursor=pointer]:
                  - text: 🏙️ City Explorer
                  - generic: i
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
                      - button "📍 Qualifying Locations" [ref=e221] [cursor=pointer]
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
                      - button "📍 Qualifying Locations" [ref=e264] [cursor=pointer]
                - generic [ref=e266]:
                  - generic [ref=e267]: 🏔️
                  - generic [ref=e268]:
                    - generic [ref=e270]:
                      - generic [ref=e271]: Overlook Explorer
                      - generic [ref=e272]: Challenge
                    - generic [ref=e273]:
                      - generic [ref=e274]: Not Started
                      - button "View all levels for Overlook Explorer" [ref=e276] [cursor=pointer]: ⓘ
                    - generic [ref=e277]: Find 3 scenic overlooks or viewpoints.
                    - generic [ref=e278]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e280]:
                      - text: 0/1 visits →
                      - strong [ref=e281]: L1 Rookie
                    - generic [ref=e283]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 scenic" [ref=e284]':
                        - generic [ref=e285]: L1
                        - generic [ref=e286]: Rookie
                        - generic [ref=e287]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 scenic" [ref=e288]':
                        - generic [ref=e289]: L2
                        - generic [ref=e290]: Novice
                        - generic [ref=e291]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 scenic" [ref=e292]':
                        - generic [ref=e293]: L3
                        - generic [ref=e294]: Semi-Pro
                        - generic [ref=e295]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 scenic" [ref=e296]':
                        - generic [ref=e297]: L4
                        - generic [ref=e298]: Pro
                        - generic [ref=e299]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ scenic" [ref=e300]':
                        - generic [ref=e301]: L5
                        - generic [ref=e302]: MVP
                        - generic [ref=e303]: 🔒
                    - generic [ref=e304]:
                      - button "−" [ref=e305] [cursor=pointer]
                      - button "+ Log" [ref=e306] [cursor=pointer]
                      - button "📍 Qualifying Locations" [ref=e307] [cursor=pointer]
                - generic [ref=e309]:
                  - generic [ref=e310]: ⛺
                  - generic [ref=e311]:
                    - generic [ref=e313]:
                      - generic [ref=e314]: Campfire Nights
                      - generic [ref=e315]: Challenge
                    - generic [ref=e316]:
                      - generic [ref=e317]: Not Started
                      - button "View all levels for Campfire Nights" [ref=e319] [cursor=pointer]: ⓘ
                    - generic [ref=e320]: Camp at 2 campgrounds.
                    - generic [ref=e321]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e323]:
                      - text: 0/1 visits →
                      - strong [ref=e324]: L1 Rookie
                    - generic [ref=e326]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 campground" [ref=e327]':
                        - generic [ref=e328]: L1
                        - generic [ref=e329]: Rookie
                        - generic [ref=e330]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 campground" [ref=e331]':
                        - generic [ref=e332]: L2
                        - generic [ref=e333]: Novice
                        - generic [ref=e334]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 campground" [ref=e335]':
                        - generic [ref=e336]: L3
                        - generic [ref=e337]: Semi-Pro
                        - generic [ref=e338]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 campground" [ref=e339]':
                        - generic [ref=e340]: L4
                        - generic [ref=e341]: Pro
                        - generic [ref=e342]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ campground" [ref=e343]':
                        - generic [ref=e344]: L5
                        - generic [ref=e345]: MVP
                        - generic [ref=e346]: 🔒
                    - generic [ref=e347]:
                      - button "−" [ref=e348] [cursor=pointer]
                      - button "+ Log" [ref=e349] [cursor=pointer]
                      - button "📍 Qualifying Locations" [ref=e350] [cursor=pointer]
                - generic [ref=e352]:
                  - generic [ref=e353]: 🌲
                  - generic [ref=e354]:
                    - generic [ref=e356]:
                      - generic [ref=e357]: State Park Tour
                      - generic [ref=e358]: Challenge
                    - generic [ref=e359]:
                      - generic [ref=e360]: Not Started
                      - button "View all levels for State Park Tour" [ref=e362] [cursor=pointer]: ⓘ
                    - generic [ref=e363]: Visit 2 state parks.
                    - generic [ref=e364]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e366]:
                      - text: 0/1 visits →
                      - strong [ref=e367]: L1 Rookie
                    - generic [ref=e369]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 state park" [ref=e370]':
                        - generic [ref=e371]: L1
                        - generic [ref=e372]: Rookie
                        - generic [ref=e373]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 state park" [ref=e374]':
                        - generic [ref=e375]: L2
                        - generic [ref=e376]: Novice
                        - generic [ref=e377]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 state park" [ref=e378]':
                        - generic [ref=e379]: L3
                        - generic [ref=e380]: Semi-Pro
                        - generic [ref=e381]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 state park" [ref=e382]':
                        - generic [ref=e383]: L4
                        - generic [ref=e384]: Pro
                        - generic [ref=e385]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ state park" [ref=e386]':
                        - generic [ref=e387]: L5
                        - generic [ref=e388]: MVP
                        - generic [ref=e389]: 🔒
                    - generic [ref=e390]:
                      - button "−" [ref=e391] [cursor=pointer]
                      - button "+ Log" [ref=e392] [cursor=pointer]
                      - button "📍 Qualifying Locations" [ref=e393] [cursor=pointer]
                - generic [ref=e395]:
                  - generic [ref=e396]: 🏔️
                  - generic [ref=e397]:
                    - generic [ref=e399]:
                      - generic [ref=e400]: National Park Day
                      - generic [ref=e401]: Challenge
                    - generic [ref=e402]:
                      - generic [ref=e403]: Not Started
                      - button "View all levels for National Park Day" [ref=e405] [cursor=pointer]: ⓘ
                    - generic [ref=e406]: Visit 1 national park.
                    - generic [ref=e407]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e409]:
                      - text: 0/1 visits →
                      - strong [ref=e410]: L1 Rookie
                    - generic [ref=e412]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 national park" [ref=e413]':
                        - generic [ref=e414]: L1
                        - generic [ref=e415]: Rookie
                        - generic [ref=e416]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 national park" [ref=e417]':
                        - generic [ref=e418]: L2
                        - generic [ref=e419]: Novice
                        - generic [ref=e420]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 national park" [ref=e421]':
                        - generic [ref=e422]: L3
                        - generic [ref=e423]: Semi-Pro
                        - generic [ref=e424]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 national park" [ref=e425]':
                        - generic [ref=e426]: L4
                        - generic [ref=e427]: Pro
                        - generic [ref=e428]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ national park" [ref=e429]':
                        - generic [ref=e430]: L5
                        - generic [ref=e431]: MVP
                        - generic [ref=e432]: 🔒
                    - generic [ref=e433]:
                      - button "−" [ref=e434] [cursor=pointer]
                      - button "+ Log" [ref=e435] [cursor=pointer]
                      - button "📍 Qualifying Locations" [ref=e436] [cursor=pointer]
                - generic [ref=e438]:
                  - generic [ref=e439]: 🏖️
                  - generic [ref=e440]:
                    - generic [ref=e442]:
                      - generic [ref=e443]: Shoreline Explorer
                      - generic [ref=e444]: Challenge
                    - generic [ref=e445]:
                      - generic [ref=e446]: Not Started
                      - button "View all levels for Shoreline Explorer" [ref=e448] [cursor=pointer]: ⓘ
                    - generic [ref=e449]: Swim at 2 public beaches.
                    - generic [ref=e450]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e452]:
                      - text: 0/1 visits →
                      - strong [ref=e453]: L1 Rookie
                    - generic [ref=e455]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 beach" [ref=e456]':
                        - generic [ref=e457]: L1
                        - generic [ref=e458]: Rookie
                        - generic [ref=e459]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 beach" [ref=e460]':
                        - generic [ref=e461]: L2
                        - generic [ref=e462]: Novice
                        - generic [ref=e463]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 beach" [ref=e464]':
                        - generic [ref=e465]: L3
                        - generic [ref=e466]: Semi-Pro
                        - generic [ref=e467]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 beach" [ref=e468]':
                        - generic [ref=e469]: L4
                        - generic [ref=e470]: Pro
                        - generic [ref=e471]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ beach" [ref=e472]':
                        - generic [ref=e473]: L5
                        - generic [ref=e474]: MVP
                        - generic [ref=e475]: 🔒
                    - generic [ref=e476]:
                      - button "−" [ref=e477] [cursor=pointer]
                      - button "+ Log" [ref=e478] [cursor=pointer]
                      - button "📍 Qualifying Locations" [ref=e479] [cursor=pointer]
                - generic [ref=e481]:
                  - generic [ref=e482]: 🏞️
                  - generic [ref=e483]:
                    - generic [ref=e485]:
                      - generic [ref=e486]: Lake & Pond Loop
                      - generic [ref=e487]: Challenge
                    - generic [ref=e488]:
                      - generic [ref=e489]: Not Started
                      - button "View all levels for Lake & Pond Loop" [ref=e491] [cursor=pointer]: ⓘ
                    - generic [ref=e492]: Explore 3 lakes or ponds.
                    - generic [ref=e493]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e495]:
                      - text: 0/1 visits →
                      - strong [ref=e496]: L1 Rookie
                    - generic [ref=e498]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 lake" [ref=e499]':
                        - generic [ref=e500]: L1
                        - generic [ref=e501]: Rookie
                        - generic [ref=e502]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 lake" [ref=e503]':
                        - generic [ref=e504]: L2
                        - generic [ref=e505]: Novice
                        - generic [ref=e506]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 lake" [ref=e507]':
                        - generic [ref=e508]: L3
                        - generic [ref=e509]: Semi-Pro
                        - generic [ref=e510]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 lake" [ref=e511]':
                        - generic [ref=e512]: L4
                        - generic [ref=e513]: Pro
                        - generic [ref=e514]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ lake" [ref=e515]':
                        - generic [ref=e516]: L5
                        - generic [ref=e517]: MVP
                        - generic [ref=e518]: 🔒
                    - generic [ref=e519]:
                      - button "−" [ref=e520] [cursor=pointer]
                      - button "+ Log" [ref=e521] [cursor=pointer]
                      - button "📍 Qualifying Locations" [ref=e522] [cursor=pointer]
                - generic [ref=e524]:
                  - generic [ref=e525]: 🌺
                  - generic [ref=e526]:
                    - generic [ref=e528]:
                      - generic [ref=e529]: Garden Stroll
                      - generic [ref=e530]: Challenge
                    - generic [ref=e531]:
                      - generic [ref=e532]: Not Started
                      - button "View all levels for Garden Stroll" [ref=e534] [cursor=pointer]: ⓘ
                    - generic [ref=e535]: Visit 2 botanical gardens.
                    - generic [ref=e536]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e538]:
                      - text: 0/1 visits →
                      - strong [ref=e539]: L1 Rookie
                    - generic [ref=e541]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 gardens" [ref=e542]':
                        - generic [ref=e543]: L1
                        - generic [ref=e544]: Rookie
                        - generic [ref=e545]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 gardens" [ref=e546]':
                        - generic [ref=e547]: L2
                        - generic [ref=e548]: Novice
                        - generic [ref=e549]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 gardens" [ref=e550]':
                        - generic [ref=e551]: L3
                        - generic [ref=e552]: Semi-Pro
                        - generic [ref=e553]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 gardens" [ref=e554]':
                        - generic [ref=e555]: L4
                        - generic [ref=e556]: Pro
                        - generic [ref=e557]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ gardens" [ref=e558]':
                        - generic [ref=e559]: L5
                        - generic [ref=e560]: MVP
                        - generic [ref=e561]: 🔒
                    - generic [ref=e562]:
                      - button "−" [ref=e563] [cursor=pointer]
                      - button "+ Log" [ref=e564] [cursor=pointer]
                      - button "📍 Qualifying Locations" [ref=e565] [cursor=pointer]
                - generic [ref=e567]:
                  - generic [ref=e568]: 🏕️
                  - generic [ref=e569]:
                    - generic [ref=e571]:
                      - generic [ref=e572]: Recreation Champion
                      - generic [ref=e573]: Challenge
                    - generic [ref=e574]:
                      - generic [ref=e575]: Not Started
                      - button "View all levels for Recreation Champion" [ref=e577] [cursor=pointer]: ⓘ
                    - generic [ref=e578]: Complete 4 recreation or day-use areas.
                    - generic [ref=e579]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e581]:
                      - text: 0/1 visits →
                      - strong [ref=e582]: L1 Rookie
                    - generic [ref=e584]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 rec area" [ref=e585]':
                        - generic [ref=e586]: L1
                        - generic [ref=e587]: Rookie
                        - generic [ref=e588]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 rec area" [ref=e589]':
                        - generic [ref=e590]: L2
                        - generic [ref=e591]: Novice
                        - generic [ref=e592]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 rec area" [ref=e593]':
                        - generic [ref=e594]: L3
                        - generic [ref=e595]: Semi-Pro
                        - generic [ref=e596]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 rec area" [ref=e597]':
                        - generic [ref=e598]: L4
                        - generic [ref=e599]: Pro
                        - generic [ref=e600]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ rec area" [ref=e601]':
                        - generic [ref=e602]: L5
                        - generic [ref=e603]: MVP
                        - generic [ref=e604]: 🔒
                    - generic [ref=e605]:
                      - button "−" [ref=e606] [cursor=pointer]
                      - button "+ Log" [ref=e607] [cursor=pointer]
                      - button "📍 Qualifying Locations" [ref=e608] [cursor=pointer]
                - generic [ref=e610]:
                  - generic [ref=e611]: 🔒
                  - generic [ref=e612]:
                    - generic [ref=e614]:
                      - generic [ref=e615]: Trail Starter
                      - generic [ref=e616]: Common
                    - generic [ref=e617]:
                      - generic [ref=e618]: Not Started
                      - button "View all levels for Trail Starter" [ref=e620] [cursor=pointer]: ⓘ
                    - generic [ref=e622]:
                      - text: 0/1 trailheads →
                      - strong [ref=e623]: L1 Rookie
                    - button "📍 Qualifying Locations" [ref=e626] [cursor=pointer]
                - generic [ref=e628]:
                  - generic [ref=e629]: 🔒
                  - generic [ref=e630]:
                    - generic [ref=e632]:
                      - generic [ref=e633]: Waterfall Seeker
                      - generic [ref=e634]: Rare
                    - generic [ref=e635]:
                      - generic [ref=e636]: Not Started
                      - button "View all levels for Waterfall Seeker" [ref=e638] [cursor=pointer]: ⓘ
                    - generic [ref=e640]:
                      - text: 0/1 waterfalls →
                      - strong [ref=e641]: L1 Rookie
                    - button "📍 Qualifying Locations" [ref=e644] [cursor=pointer]
                - generic [ref=e646]:
                  - generic [ref=e647]: 🔒
                  - generic [ref=e648]:
                    - generic [ref=e650]:
                      - generic [ref=e651]: Park Ranger
                      - generic [ref=e652]: Rare
                    - generic [ref=e653]:
                      - generic [ref=e654]: Not Started
                      - button "View all levels for Park Ranger" [ref=e656] [cursor=pointer]: ⓘ
                    - generic [ref=e658]:
                      - text: 0/1 state parks →
                      - strong [ref=e659]: L1 Rookie
                    - button "📍 Qualifying Locations" [ref=e662] [cursor=pointer]
                - generic [ref=e664]:
                  - generic [ref=e665]: 🔒
                  - generic [ref=e666]:
                    - generic [ref=e668]:
                      - generic [ref=e669]: Camp Explorer
                      - generic [ref=e670]: Rare
                    - generic [ref=e671]:
                      - generic [ref=e672]: Not Started
                      - button "View all levels for Camp Explorer" [ref=e674] [cursor=pointer]: ⓘ
                    - generic [ref=e676]:
                      - text: 0/1 campgrounds →
                      - strong [ref=e677]: L1 Rookie
                    - button "📍 Qualifying Locations" [ref=e680] [cursor=pointer]
                - generic [ref=e682]:
                  - generic [ref=e683]: 🔒
                  - generic [ref=e684]:
                    - generic [ref=e686]:
                      - generic [ref=e687]: Lake Walker
                      - generic [ref=e688]: Epic
                    - generic [ref=e689]:
                      - generic [ref=e690]: Not Started
                      - button "View all levels for Lake Walker" [ref=e692] [cursor=pointer]: ⓘ
                    - generic [ref=e694]:
                      - text: 0/1 lakes & ponds →
                      - strong [ref=e695]: L1 Rookie
                    - button "📍 Qualifying Locations" [ref=e698] [cursor=pointer]
                - generic [ref=e700]:
                  - generic [ref=e701]: 🔒
                  - generic [ref=e702]:
                    - generic [ref=e704]:
                      - generic [ref=e705]: Summit Chaser
                      - generic [ref=e706]: Epic
                    - generic [ref=e707]:
                      - generic [ref=e708]: Not Started
                      - button "View all levels for Summit Chaser" [ref=e710] [cursor=pointer]: ⓘ
                    - generic [ref=e712]:
                      - text: 0/1 scenic overlooks →
                      - strong [ref=e713]: L1 Rookie
                    - button "📍 Qualifying Locations" [ref=e716] [cursor=pointer]
                - generic [ref=e718]:
                  - generic [ref=e719]: 🔒
                  - generic [ref=e720]:
                    - generic [ref=e722]:
                      - generic [ref=e723]: Beach Goer
                      - generic [ref=e724]: Rare
                    - generic [ref=e725]:
                      - generic [ref=e726]: Not Started
                      - button "View all levels for Beach Goer" [ref=e728] [cursor=pointer]: ⓘ
                    - generic [ref=e730]:
                      - text: 0/1 public beaches →
                      - strong [ref=e731]: L1 Rookie
                    - button "📍 Qualifying Locations" [ref=e734] [cursor=pointer]
                - generic [ref=e736]:
                  - generic [ref=e737]: 🔒
                  - generic [ref=e738]:
                    - generic [ref=e740]:
                      - generic [ref=e741]: Garden Lover
                      - generic [ref=e742]: Rare
                    - generic [ref=e743]:
                      - generic [ref=e744]: Not Started
                      - button "View all levels for Garden Lover" [ref=e746] [cursor=pointer]: ⓘ
                    - generic [ref=e748]:
                      - text: 0/1 botanical gardens →
                      - strong [ref=e749]: L1 Rookie
                    - button "📍 Qualifying Locations" [ref=e752] [cursor=pointer]
                - generic [ref=e754]:
                  - generic [ref=e755]: 🔒
                  - generic [ref=e756]:
                    - generic [ref=e758]:
                      - generic [ref=e759]: Outdoors Devotee
                      - generic [ref=e760]: Legendary
                    - generic [ref=e761]:
                      - generic [ref=e762]: Not Started
                      - button "View all levels for Outdoors Devotee" [ref=e764] [cursor=pointer]: ⓘ
                    - generic [ref=e766]:
                      - text: 0/1 total visits →
                      - strong [ref=e767]: L1 Rookie
                    - button "📍 Qualifying Locations" [ref=e770] [cursor=pointer]
                - generic [ref=e772]:
                  - generic [ref=e773]: 🔒
                  - generic [ref=e774]:
                    - generic [ref=e776]:
                      - generic [ref=e777]: Nature Champion
                      - generic [ref=e778]: Legendary
                    - generic [ref=e779]:
                      - generic [ref=e780]: Not Started
                      - button "View all levels for Nature Champion" [ref=e782] [cursor=pointer]: ⓘ
                    - generic [ref=e784]:
                      - text: 0/1 completed challenges →
                      - strong [ref=e785]: L1 Rookie
                    - button "📍 Qualifying Locations" [ref=e788] [cursor=pointer]
            - generic [ref=e789]:
              - generic [ref=e791]:
                - generic [ref=e792]: 📚 Seasonal Quests
                - generic [ref=e793]: Multi-step seasonal goals for Outdoors.
              - generic [ref=e794]:
                - generic [ref=e795]:
                  - generic [ref=e796]: 🌸 Spring Now
                  - generic [ref=e797]: Spring Awakening
                  - generic [ref=e798]: 0/3 steps
                  - generic [ref=e799]:
                    - generic [ref=e800]:
                      - generic [ref=e801]: ○
                      - generic [ref=e802]: Visit 3 parks or gardens
                      - generic [ref=e803]: Auto
                    - generic [ref=e804]:
                      - generic [ref=e805]: ○
                      - generic [ref=e806]: Find a waterfall
                      - generic [ref=e807]: Auto
                    - generic [ref=e808]:
                      - generic [ref=e809]: ○
                      - generic [ref=e810]: Hike a trail
                      - generic [ref=e811]: Auto
                - generic [ref=e812]:
                  - generic [ref=e813]: ☀️ Summer
                  - generic [ref=e814]: Summer Expedition
                  - generic [ref=e815]: 0/3 steps
                  - generic [ref=e816]:
                    - generic [ref=e817]:
                      - generic [ref=e818]: ○
                      - generic [ref=e819]: Swim at a public beach
                      - generic [ref=e820]: Auto
                    - generic [ref=e821]:
                      - generic [ref=e822]: ○
                      - generic [ref=e823]: Visit a recreation area
                      - generic [ref=e824]: Auto
                    - generic [ref=e825]:
                      - generic [ref=e826]: ○
                      - generic [ref=e827]: Camp overnight
                      - generic [ref=e828]: Auto
                - generic [ref=e829]:
                  - generic [ref=e830]: 🍂 Fall
                  - generic [ref=e831]: Fall Foliage Tour
                  - generic [ref=e832]: 0/3 steps
                  - generic [ref=e833]:
                    - generic [ref=e834]:
                      - generic [ref=e835]: ○
                      - generic [ref=e836]: Visit 3 scenic overlooks
                      - generic [ref=e837]: Auto
                    - generic [ref=e838]:
                      - generic [ref=e839]: ○
                      - generic [ref=e840]: Explore a state park
                      - generic [ref=e841]: Auto
                    - generic [ref=e842]:
                      - generic [ref=e843]: ○
                      - generic [ref=e844]: Find a lake or pond
                      - generic [ref=e845]: Auto
                - generic [ref=e846]:
                  - generic [ref=e847]: ❄️ Winter
                  - generic [ref=e848]: Winter Wild Side
                  - generic [ref=e849]: 0/3 steps
                  - generic [ref=e850]:
                    - generic [ref=e851]:
                      - generic [ref=e852]: ○
                      - generic [ref=e853]: Find a waterfall (brave the cold!)
                      - generic [ref=e854]: Auto
                    - generic [ref=e855]:
                      - generic [ref=e856]: ○
                      - generic [ref=e857]: Hike a trailhead
                      - generic [ref=e858]: Auto
                    - generic [ref=e859]:
                      - generic [ref=e860]: ○
                      - generic [ref=e861]: Visit a botanical garden
                      - generic [ref=e862]: Auto
            - generic [ref=e863]:
              - generic [ref=e864]:
                - generic [ref=e865]:
                  - generic [ref=e866]: 🟩 Outdoors Bingo
                  - generic [ref=e867]: Auto-synced from your logged visits. Complete a row, column, or diagonal for BINGO!
                - generic [ref=e868]: 0/9
              - generic [ref=e869]:
                - generic "Trailhead not completed" [ref=e870] [cursor=pointer]:
                  - generic [ref=e871]: 🥾
                  - generic [ref=e872]: Trailhead
                - generic "Waterfall not completed" [ref=e873] [cursor=pointer]:
                  - generic [ref=e874]: 💧
                  - generic [ref=e875]: Waterfall
                - generic "State Park not completed" [ref=e876] [cursor=pointer]:
                  - generic [ref=e877]: 🌲
                  - generic [ref=e878]: State Park
                - generic "Campground not completed" [ref=e879] [cursor=pointer]:
                  - generic [ref=e880]: ⛺
                  - generic [ref=e881]: Campground
                - generic "Scenic Overlook not completed" [ref=e882] [cursor=pointer]:
                  - generic [ref=e883]: 🏔️
                  - generic [ref=e884]: Scenic Overlook
                - generic "Lake or Pond not completed" [ref=e885] [cursor=pointer]:
                  - generic [ref=e886]: 🏞️
                  - generic [ref=e887]: Lake or Pond
                - generic "Public Beach not completed" [ref=e888] [cursor=pointer]:
                  - generic [ref=e889]: 🏖️
                  - generic [ref=e890]: Public Beach
                - generic "National Park not completed" [ref=e891] [cursor=pointer]:
                  - generic [ref=e892]: 🏔️
                  - generic [ref=e893]: National Park
                - generic "Botanical Garden not completed" [ref=e894] [cursor=pointer]:
                  - generic [ref=e895]: 🌺
                  - generic [ref=e896]: Botanical Garden
              - generic [ref=e897]: 0/9 tiles marked
        - text: "1"
        - group "🧰 Diagnostics, Sync and Clean Up" [ref=e898]:
          - generic "🧰 Diagnostics, Sync and Clean Up Sync health, local queue visibility, and visited tracker diagnostics. ▾" [ref=e899] [cursor=pointer]:
            - generic [ref=e900]:
              - generic [ref=e901]: 🧰 Diagnostics, Sync and Clean Up
              - generic [ref=e902]: Sync health, local queue visibility, and visited tracker diagnostics.
            - text: ▾
          - option "Strict (Place ID + exact name)"
          - option "Balanced (Place ID + exact + fuzzy)" [selected]
          - option "Name Only (exact + fuzzy)"
  - button "Deployment 2026.04.23.live-debug.1 OK (4/4)" [ref=e904] [cursor=pointer]
```

# Test source

```ts
  90  | 
  91  |     await expect(popup.locator('#singleInput')).toHaveValue('Draft Single Place');
  92  |     await expect(popup.locator('#bulkInput')).toHaveValue('Draft Bulk A\nDraft Bulk B');
  93  |     await expect(popup.locator('#chainInput')).toHaveValue('Draft Chain Location, Denver');
  94  |   });
  95  | 
  96  |   test('drafts are cleared from localStorage when clear form buttons are used', async ({ page }) => {
  97  |     await installMocks(page.context());
  98  |     const popup = await openEditModePopup(page);
  99  | 
  100 |     await fillAndSaveDraft(popup, '#singleInput', 'Clearable single draft');
  101 |     await fillAndSaveDraft(popup, '#bulkInput', 'Clearable bulk draft');
  102 |     await fillAndSaveDraft(popup, '#chainInput', 'Clearable chain draft');
  103 | 
  104 |     await expect.poll(() => popup.evaluate(() => localStorage.getItem('editMode_draft_singleInput')), { timeout: 5000 }).not.toBeNull();
  105 |     await expect.poll(() => popup.evaluate(() => localStorage.getItem('editMode_draft_bulkInput')), { timeout: 5000 }).not.toBeNull();
  106 |     await expect.poll(() => popup.evaluate(() => localStorage.getItem('editMode_draft_chainInput')), { timeout: 5000 }).not.toBeNull();
  107 | 
  108 |     await popup.click('#singleClearBtn');
  109 |     await popup.click('#bulkClearBtn');
  110 |     await popup.click('#chainClearBtn');
  111 | 
  112 |     await expect.poll(() => popup.evaluate(() => localStorage.getItem('editMode_draft_singleInput')), { timeout: 5000 }).toBeNull();
  113 |     await expect.poll(() => popup.evaluate(() => localStorage.getItem('editMode_draft_bulkInput')), { timeout: 5000 }).toBeNull();
  114 |     await expect.poll(() => popup.evaluate(() => localStorage.getItem('editMode_draft_chainInput')), { timeout: 5000 }).toBeNull();
  115 | 
  116 |     await expect(popup.locator('#singleInput')).toHaveValue('');
  117 |     await expect(popup.locator('#bulkInput')).toHaveValue('');
  118 |     await expect(popup.locator('#chainInput')).toHaveValue('');
  119 |   });
  120 | 
  121 |   test('tab switch is blocked with confirmation when a draft is present and user cancels', async ({ page }) => {
  122 |     await installMocks(page.context());
  123 |     const popup = await openEditModePopup(page);
  124 | 
  125 |     await fillAndSaveDraft(popup, '#singleInput', 'Unsaved single draft');
  126 | 
  127 |     let dialogMessage = null;
  128 |     let dialogCount = 0;
  129 |     popup.once('dialog', async (dialog) => {
  130 |       dialogMessage = dialog.message();
  131 |       dialogCount += 1;
  132 |       await dialog.dismiss(); // dismiss = cancel = stay on Places tab
  133 |     });
  134 | 
  135 |     await popup.click('[data-tab="automation"]');
  136 | 
  137 |     expect(dialogCount).toBe(1);
  138 |     expect(String(dialogMessage || '')).toContain('unsaved draft');
  139 |     // Tab should not have changed — Places tab still active
  140 |     await expect(popup.locator('#places-tab')).toHaveClass(/active/);
  141 |     await expect(popup.locator('#automation-tab')).not.toHaveClass(/active/);
  142 |   });
  143 | 
  144 |   test('tab switch proceeds when user accepts the confirm dialog', async ({ page }) => {
  145 |     await installMocks(page.context());
  146 |     const popup = await openEditModePopup(page);
  147 | 
  148 |     await fillAndSaveDraft(popup, '#bulkInput', 'Bulk draft that I will abandon');
  149 | 
  150 |     popup.once('dialog', async (dialog) => {
  151 |       await dialog.accept();
  152 |     });
  153 | 
  154 |     await popup.click('[data-tab="automation"]');
  155 | 
  156 |     await expect(popup.locator('#automation-tab')).toHaveClass(/active/);
  157 |   });
  158 | 
  159 |   test('draft is cleared from localStorage after a successful single submit', async ({ page }) => {
  160 |     const graphCalls = [];
  161 |     await installMocks(page.context(), graphCalls);
  162 |     const popup = await openEditModePopup(page);
  163 | 
  164 |     await popup.evaluate(() => {
  165 |       window.searchFestivalEvents = async (query) => {
  166 |         if (String(query || '').toLowerCase().includes('apple blossom')) {
  167 |           return [{
  168 |             name: 'Apple Blossom Festival',
  169 |             address: '101 Orchard Ave, Hendersonville, NC 28791',
  170 |             city: 'Hendersonville',
  171 |             state: 'NC',
  172 |             website: 'https://applefest.example.com',
  173 |             sourceProvider: 'Ticketmaster',
  174 |             eventDate: '2026-09-20',
  175 |             description: 'Source: Ticketmaster',
  176 |             businessStatus: 'SCHEDULED'
  177 |           }];
  178 |         }
  179 |         return [];
  180 |       };
  181 |     });
  182 | 
  183 |     await popup.selectOption('#actionTargetSelect', 'ent_festivals');
  184 |     await popup.selectOption('#singleInputType', 'placeName');
  185 |     await fillAndSaveDraft(popup, '#singleInput', 'Apple Blossom Festival');
  186 | 
  187 |     await expect.poll(() => popup.evaluate(() => localStorage.getItem('editMode_draft_singleInput')), { timeout: 5000 }).not.toBeNull();
  188 | 
  189 |     await popup.click('#singleSubmitBtn');
> 190 |     await expect.poll(() => graphCalls.length, { timeout: 10000 }).toBe(1);
      |     ^ Error: expect(received).toBe(expected) // Object.is equality
  191 | 
  192 |     await expect.poll(() => popup.evaluate(() => localStorage.getItem('editMode_draft_singleInput')), { timeout: 5000 }).toBeNull();
  193 |   });
  194 | });
  195 | 
  196 | 
```