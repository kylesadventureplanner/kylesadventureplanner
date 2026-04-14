# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adventure-subtabs-smoke.spec.js >> Adventure Challenge new subtabs smoke >> Outdoors CTA row preserves canonical action order
- Location: tests/adventure-subtabs-smoke.spec.js:116:3

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
      - generic [ref=e12]: "Startup timing: interactive 92 ms | overlay off 444 ms"
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
      - button "🎮 Adventure Challenge" [active] [ref=e45] [cursor=pointer]
      - button "🌿 Nature Challenge" [ref=e46] [cursor=pointer]
      - button "🏔️ Adventure Planner" [ref=e47] [cursor=pointer]
      - button "🧰 Household Tools" [ref=e48] [cursor=pointer]
      - button "🐦 Birding Locations" [ref=e49] [cursor=pointer]
      - button "🚴 Bike Trails" [ref=e50] [cursor=pointer]
    - tablist "Adventure Challenge categories" [ref=e54]:
      - tab "Open Outdoors section" [selected] [ref=e55] [cursor=pointer]: 🌲 Outdoors
      - tab "Open Entertainment section" [ref=e56] [cursor=pointer]: 🎬 Entertainment
      - tab "Open Food and Drink section" [ref=e57] [cursor=pointer]: 🍽️ Food & Drink
      - tab "Open Retail section" [ref=e58] [cursor=pointer]: 🛍️ Retail
      - tab "Open Wildlife and Animals section" [ref=e59] [cursor=pointer]: 🦌 Wildlife & Animals
      - tab "Open Regional Festivals section" [ref=e60] [cursor=pointer]: 🎉 Regional Festivals
      - tab "Open Bike Trails section" [ref=e61] [cursor=pointer]: 🚴 Bike Trails
    - generic [ref=e62]:
      - text: ▾
      - generic [ref=e64]:
        - generic [ref=e65]:
          - heading "Adventure Challenge - Outdoors" [level=1] [ref=e66]
          - navigation "Jump to section links" [ref=e67]:
            - generic [ref=e68]: "Jump to section:"
            - button "📊 Category Progression" [ref=e69] [cursor=pointer]
            - button "🏅 Challenges & Badges" [ref=e70] [cursor=pointer]
            - button "📚 Seasonal Quests" [ref=e71] [cursor=pointer]
            - button "🟩 Outdoors Bingo" [ref=e72] [cursor=pointer]
            - button "🧰 Diagnostics, Sync and Clean Up" [ref=e73] [cursor=pointer]
        - generic [ref=e74]: 🌲 Outdoors section active
        - tabpanel "Open Outdoors section" [ref=e75]:
          - generic [ref=e76]:
            - generic [ref=e77]:
              - generic [ref=e78]: 🌲 Outdoors
              - generic [ref=e79]: Browse and plan outdoor locations you want to visit.
            - generic [ref=e80]:
              - generic [ref=e81]:
                - text: "Outdoors data: sign-in required"
                - button "Sync category totals" [ref=e82] [cursor=pointer]
                - text: Use Sign In, then refresh this tab.
              - generic [ref=e83]:
                - button "Refresh Data" [ref=e84] [cursor=pointer]
                - button "↶ Undo" [disabled] [ref=e85] [cursor=pointer]
                - button "🔎 Explore Outdoors" [ref=e86] [cursor=pointer]
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
                  - text: "Track your Outdoors visits by category. Total logged:"
                  - strong [ref=e96]: "0"
                  - text: .
                  - button "Log Visit" [ref=e97] [cursor=pointer]
              - generic [ref=e98]:
                - generic [ref=e99]:
                  - generic [ref=e100]: 🥾
                  - generic [ref=e101]: Trailheads
                  - generic [ref=e102]: 0 / ?
                  - generic [ref=e103]: 0% complete
                  - generic [ref=e106]: Auto-tracked from visit logs
                - generic [ref=e107]:
                  - generic [ref=e108]: 💧
                  - generic [ref=e109]: Waterfalls
                  - generic [ref=e110]: 0 / ?
                  - generic [ref=e111]: 0% complete
                  - generic [ref=e114]: Auto-tracked from visit logs
                - generic [ref=e115]:
                  - generic [ref=e116]: 🏔️
                  - generic [ref=e117]: Scenic Overlooks
                  - generic [ref=e118]: 0 / ?
                  - generic [ref=e119]: 0% complete
                  - generic [ref=e122]: Auto-tracked from visit logs
                - generic [ref=e123]:
                  - generic [ref=e124]: ⛺
                  - generic [ref=e125]: Campgrounds
                  - generic [ref=e126]: 0 / ?
                  - generic [ref=e127]: 0% complete
                  - generic [ref=e130]: Auto-tracked from visit logs
                - generic [ref=e131]:
                  - generic [ref=e132]: 🌲
                  - generic [ref=e133]: State Parks
                  - generic [ref=e134]: 0 / ?
                  - generic [ref=e135]: 0% complete
                  - generic [ref=e138]: Auto-tracked from visit logs
                - generic [ref=e139]:
                  - generic [ref=e140]: 🏔️
                  - generic [ref=e141]: National Parks
                  - generic [ref=e142]: 0 / ?
                  - generic [ref=e143]: 0% complete
                  - generic [ref=e146]: Auto-tracked from visit logs
                - generic [ref=e147]:
                  - generic [ref=e148]: 🏖️
                  - generic [ref=e149]: Public Beaches
                  - generic [ref=e150]: 0 / ?
                  - generic [ref=e151]: 0% complete
                  - generic [ref=e154]: Auto-tracked from visit logs
                - generic [ref=e155]:
                  - generic [ref=e156]: 🏞️
                  - generic [ref=e157]: Lakes & Ponds
                  - generic [ref=e158]: 0 / ?
                  - generic [ref=e159]: 0% complete
                  - generic [ref=e162]: Auto-tracked from visit logs
                - generic [ref=e163]:
                  - generic [ref=e164]: 🏕️
                  - generic [ref=e165]: Recreation Areas
                  - generic [ref=e166]: 0 / ?
                  - generic [ref=e167]: 0% complete
                  - generic [ref=e170]: Auto-tracked from visit logs
                - generic [ref=e171]:
                  - generic [ref=e172]: 🌺
                  - generic [ref=e173]: Botanical Gardens
                  - generic [ref=e174]: 0 / ?
                  - generic [ref=e175]: 0% complete
                  - generic [ref=e178]: Auto-tracked from visit logs
            - generic [ref=e179]:
              - generic [ref=e180]:
                - generic [ref=e181]:
                  - generic [ref=e182]: 🏅 Challenges & Badges
                  - generic [ref=e183]: Challenge goals and badges now share one achievement wall using the same badge layout.
                - generic [ref=e184]: 0/100
              - generic [ref=e185]:
                - generic [ref=e187]:
                  - generic [ref=e188]: 🥾
                  - generic [ref=e189]:
                    - generic [ref=e191]:
                      - generic [ref=e192]: Trailhead Seeker
                      - generic [ref=e193]: Challenge
                    - generic [ref=e194]:
                      - generic [ref=e195]: Not Started
                      - button "View all levels for Trailhead Seeker" [ref=e197] [cursor=pointer]: ⓘ
                    - generic [ref=e198]: Visit 3 trailheads.
                    - generic [ref=e199]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e201]:
                      - text: 0/1 visits →
                      - strong [ref=e202]: L1 Rookie
                    - generic [ref=e204]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 trailhead" [ref=e205]':
                        - generic [ref=e206]: L1
                        - generic [ref=e207]: Rookie
                        - generic [ref=e208]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 trailhead" [ref=e209]':
                        - generic [ref=e210]: L2
                        - generic [ref=e211]: Novice
                        - generic [ref=e212]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 trailhead" [ref=e213]':
                        - generic [ref=e214]: L3
                        - generic [ref=e215]: Semi-Pro
                        - generic [ref=e216]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 trailhead" [ref=e217]':
                        - generic [ref=e218]: L4
                        - generic [ref=e219]: Pro
                        - generic [ref=e220]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ trailhead" [ref=e221]':
                        - generic [ref=e222]: L5
                        - generic [ref=e223]: MVP
                        - generic [ref=e224]: 🔒
                    - generic [ref=e225]:
                      - button "−" [ref=e226] [cursor=pointer]
                      - button "+ Log" [ref=e227] [cursor=pointer]
                - generic [ref=e229]:
                  - generic [ref=e230]: 💧
                  - generic [ref=e231]:
                    - generic [ref=e233]:
                      - generic [ref=e234]: Waterfall Hunter
                      - generic [ref=e235]: Challenge
                    - generic [ref=e236]:
                      - generic [ref=e237]: Not Started
                      - button "View all levels for Waterfall Hunter" [ref=e239] [cursor=pointer]: ⓘ
                    - generic [ref=e240]: Discover 3 waterfalls.
                    - generic [ref=e241]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e243]:
                      - text: 0/1 visits →
                      - strong [ref=e244]: L1 Rookie
                    - generic [ref=e246]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 waterfall" [ref=e247]':
                        - generic [ref=e248]: L1
                        - generic [ref=e249]: Rookie
                        - generic [ref=e250]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 waterfall" [ref=e251]':
                        - generic [ref=e252]: L2
                        - generic [ref=e253]: Novice
                        - generic [ref=e254]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 waterfall" [ref=e255]':
                        - generic [ref=e256]: L3
                        - generic [ref=e257]: Semi-Pro
                        - generic [ref=e258]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 waterfall" [ref=e259]':
                        - generic [ref=e260]: L4
                        - generic [ref=e261]: Pro
                        - generic [ref=e262]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ waterfall" [ref=e263]':
                        - generic [ref=e264]: L5
                        - generic [ref=e265]: MVP
                        - generic [ref=e266]: 🔒
                    - generic [ref=e267]:
                      - button "−" [ref=e268] [cursor=pointer]
                      - button "+ Log" [ref=e269] [cursor=pointer]
                - generic [ref=e271]:
                  - generic [ref=e272]: 🏔️
                  - generic [ref=e273]:
                    - generic [ref=e275]:
                      - generic [ref=e276]: Overlook Explorer
                      - generic [ref=e277]: Challenge
                    - generic [ref=e278]:
                      - generic [ref=e279]: Not Started
                      - button "View all levels for Overlook Explorer" [ref=e281] [cursor=pointer]: ⓘ
                    - generic [ref=e282]: Find 3 scenic overlooks or viewpoints.
                    - generic [ref=e283]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e285]:
                      - text: 0/1 visits →
                      - strong [ref=e286]: L1 Rookie
                    - generic [ref=e288]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 scenic" [ref=e289]':
                        - generic [ref=e290]: L1
                        - generic [ref=e291]: Rookie
                        - generic [ref=e292]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 scenic" [ref=e293]':
                        - generic [ref=e294]: L2
                        - generic [ref=e295]: Novice
                        - generic [ref=e296]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 scenic" [ref=e297]':
                        - generic [ref=e298]: L3
                        - generic [ref=e299]: Semi-Pro
                        - generic [ref=e300]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 scenic" [ref=e301]':
                        - generic [ref=e302]: L4
                        - generic [ref=e303]: Pro
                        - generic [ref=e304]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ scenic" [ref=e305]':
                        - generic [ref=e306]: L5
                        - generic [ref=e307]: MVP
                        - generic [ref=e308]: 🔒
                    - generic [ref=e309]:
                      - button "−" [ref=e310] [cursor=pointer]
                      - button "+ Log" [ref=e311] [cursor=pointer]
                - generic [ref=e313]:
                  - generic [ref=e314]: ⛺
                  - generic [ref=e315]:
                    - generic [ref=e317]:
                      - generic [ref=e318]: Campfire Nights
                      - generic [ref=e319]: Challenge
                    - generic [ref=e320]:
                      - generic [ref=e321]: Not Started
                      - button "View all levels for Campfire Nights" [ref=e323] [cursor=pointer]: ⓘ
                    - generic [ref=e324]: Camp at 2 campgrounds.
                    - generic [ref=e325]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e327]:
                      - text: 0/1 visits →
                      - strong [ref=e328]: L1 Rookie
                    - generic [ref=e330]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 campground" [ref=e331]':
                        - generic [ref=e332]: L1
                        - generic [ref=e333]: Rookie
                        - generic [ref=e334]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 campground" [ref=e335]':
                        - generic [ref=e336]: L2
                        - generic [ref=e337]: Novice
                        - generic [ref=e338]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 campground" [ref=e339]':
                        - generic [ref=e340]: L3
                        - generic [ref=e341]: Semi-Pro
                        - generic [ref=e342]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 campground" [ref=e343]':
                        - generic [ref=e344]: L4
                        - generic [ref=e345]: Pro
                        - generic [ref=e346]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ campground" [ref=e347]':
                        - generic [ref=e348]: L5
                        - generic [ref=e349]: MVP
                        - generic [ref=e350]: 🔒
                    - generic [ref=e351]:
                      - button "−" [ref=e352] [cursor=pointer]
                      - button "+ Log" [ref=e353] [cursor=pointer]
                - generic [ref=e355]:
                  - generic [ref=e356]: 🌲
                  - generic [ref=e357]:
                    - generic [ref=e359]:
                      - generic [ref=e360]: State Park Tour
                      - generic [ref=e361]: Challenge
                    - generic [ref=e362]:
                      - generic [ref=e363]: Not Started
                      - button "View all levels for State Park Tour" [ref=e365] [cursor=pointer]: ⓘ
                    - generic [ref=e366]: Visit 2 state parks.
                    - generic [ref=e367]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e369]:
                      - text: 0/1 visits →
                      - strong [ref=e370]: L1 Rookie
                    - generic [ref=e372]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 state park" [ref=e373]':
                        - generic [ref=e374]: L1
                        - generic [ref=e375]: Rookie
                        - generic [ref=e376]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 state park" [ref=e377]':
                        - generic [ref=e378]: L2
                        - generic [ref=e379]: Novice
                        - generic [ref=e380]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 state park" [ref=e381]':
                        - generic [ref=e382]: L3
                        - generic [ref=e383]: Semi-Pro
                        - generic [ref=e384]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 state park" [ref=e385]':
                        - generic [ref=e386]: L4
                        - generic [ref=e387]: Pro
                        - generic [ref=e388]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ state park" [ref=e389]':
                        - generic [ref=e390]: L5
                        - generic [ref=e391]: MVP
                        - generic [ref=e392]: 🔒
                    - generic [ref=e393]:
                      - button "−" [ref=e394] [cursor=pointer]
                      - button "+ Log" [ref=e395] [cursor=pointer]
                - generic [ref=e397]:
                  - generic [ref=e398]: 🏔️
                  - generic [ref=e399]:
                    - generic [ref=e401]:
                      - generic [ref=e402]: National Park Day
                      - generic [ref=e403]: Challenge
                    - generic [ref=e404]:
                      - generic [ref=e405]: Not Started
                      - button "View all levels for National Park Day" [ref=e407] [cursor=pointer]: ⓘ
                    - generic [ref=e408]: Visit 1 national park.
                    - generic [ref=e409]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e411]:
                      - text: 0/1 visits →
                      - strong [ref=e412]: L1 Rookie
                    - generic [ref=e414]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 national park" [ref=e415]':
                        - generic [ref=e416]: L1
                        - generic [ref=e417]: Rookie
                        - generic [ref=e418]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 national park" [ref=e419]':
                        - generic [ref=e420]: L2
                        - generic [ref=e421]: Novice
                        - generic [ref=e422]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 national park" [ref=e423]':
                        - generic [ref=e424]: L3
                        - generic [ref=e425]: Semi-Pro
                        - generic [ref=e426]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 national park" [ref=e427]':
                        - generic [ref=e428]: L4
                        - generic [ref=e429]: Pro
                        - generic [ref=e430]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ national park" [ref=e431]':
                        - generic [ref=e432]: L5
                        - generic [ref=e433]: MVP
                        - generic [ref=e434]: 🔒
                    - generic [ref=e435]:
                      - button "−" [ref=e436] [cursor=pointer]
                      - button "+ Log" [ref=e437] [cursor=pointer]
                - generic [ref=e439]:
                  - generic [ref=e440]: 🏖️
                  - generic [ref=e441]:
                    - generic [ref=e443]:
                      - generic [ref=e444]: Shoreline Explorer
                      - generic [ref=e445]: Challenge
                    - generic [ref=e446]:
                      - generic [ref=e447]: Not Started
                      - button "View all levels for Shoreline Explorer" [ref=e449] [cursor=pointer]: ⓘ
                    - generic [ref=e450]: Swim at 2 public beaches.
                    - generic [ref=e451]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e453]:
                      - text: 0/1 visits →
                      - strong [ref=e454]: L1 Rookie
                    - generic [ref=e456]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 beach" [ref=e457]':
                        - generic [ref=e458]: L1
                        - generic [ref=e459]: Rookie
                        - generic [ref=e460]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 beach" [ref=e461]':
                        - generic [ref=e462]: L2
                        - generic [ref=e463]: Novice
                        - generic [ref=e464]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 beach" [ref=e465]':
                        - generic [ref=e466]: L3
                        - generic [ref=e467]: Semi-Pro
                        - generic [ref=e468]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 beach" [ref=e469]':
                        - generic [ref=e470]: L4
                        - generic [ref=e471]: Pro
                        - generic [ref=e472]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ beach" [ref=e473]':
                        - generic [ref=e474]: L5
                        - generic [ref=e475]: MVP
                        - generic [ref=e476]: 🔒
                    - generic [ref=e477]:
                      - button "−" [ref=e478] [cursor=pointer]
                      - button "+ Log" [ref=e479] [cursor=pointer]
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
                - generic [ref=e523]:
                  - generic [ref=e524]: 🌺
                  - generic [ref=e525]:
                    - generic [ref=e527]:
                      - generic [ref=e528]: Garden Stroll
                      - generic [ref=e529]: Challenge
                    - generic [ref=e530]:
                      - generic [ref=e531]: Not Started
                      - button "View all levels for Garden Stroll" [ref=e533] [cursor=pointer]: ⓘ
                    - generic [ref=e534]: Visit 2 botanical gardens.
                    - generic [ref=e535]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e537]:
                      - text: 0/1 visits →
                      - strong [ref=e538]: L1 Rookie
                    - generic [ref=e540]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 gardens" [ref=e541]':
                        - generic [ref=e542]: L1
                        - generic [ref=e543]: Rookie
                        - generic [ref=e544]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 gardens" [ref=e545]':
                        - generic [ref=e546]: L2
                        - generic [ref=e547]: Novice
                        - generic [ref=e548]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 gardens" [ref=e549]':
                        - generic [ref=e550]: L3
                        - generic [ref=e551]: Semi-Pro
                        - generic [ref=e552]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 gardens" [ref=e553]':
                        - generic [ref=e554]: L4
                        - generic [ref=e555]: Pro
                        - generic [ref=e556]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ gardens" [ref=e557]':
                        - generic [ref=e558]: L5
                        - generic [ref=e559]: MVP
                        - generic [ref=e560]: 🔒
                    - generic [ref=e561]:
                      - button "−" [ref=e562] [cursor=pointer]
                      - button "+ Log" [ref=e563] [cursor=pointer]
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
                - generic [ref=e607]:
                  - generic [ref=e608]: 🔒
                  - generic [ref=e609]:
                    - generic [ref=e611]:
                      - generic [ref=e612]: Trail Starter
                      - generic [ref=e613]: Common
                    - generic [ref=e614]:
                      - generic [ref=e615]: Not Started
                      - button "View all levels for Trail Starter" [ref=e617] [cursor=pointer]: ⓘ
                    - generic [ref=e619]:
                      - text: 0/1 trailheads →
                      - strong [ref=e620]: L1 Rookie
                - generic [ref=e623]:
                  - generic [ref=e624]: 🔒
                  - generic [ref=e625]:
                    - generic [ref=e627]:
                      - generic [ref=e628]: Waterfall Seeker
                      - generic [ref=e629]: Rare
                    - generic [ref=e630]:
                      - generic [ref=e631]: Not Started
                      - button "View all levels for Waterfall Seeker" [ref=e633] [cursor=pointer]: ⓘ
                    - generic [ref=e635]:
                      - text: 0/1 waterfalls →
                      - strong [ref=e636]: L1 Rookie
                - generic [ref=e639]:
                  - generic [ref=e640]: 🔒
                  - generic [ref=e641]:
                    - generic [ref=e643]:
                      - generic [ref=e644]: Park Ranger
                      - generic [ref=e645]: Rare
                    - generic [ref=e646]:
                      - generic [ref=e647]: Not Started
                      - button "View all levels for Park Ranger" [ref=e649] [cursor=pointer]: ⓘ
                    - generic [ref=e651]:
                      - text: 0/1 state parks →
                      - strong [ref=e652]: L1 Rookie
                - generic [ref=e655]:
                  - generic [ref=e656]: 🔒
                  - generic [ref=e657]:
                    - generic [ref=e659]:
                      - generic [ref=e660]: Camp Explorer
                      - generic [ref=e661]: Rare
                    - generic [ref=e662]:
                      - generic [ref=e663]: Not Started
                      - button "View all levels for Camp Explorer" [ref=e665] [cursor=pointer]: ⓘ
                    - generic [ref=e667]:
                      - text: 0/1 campgrounds →
                      - strong [ref=e668]: L1 Rookie
                - generic [ref=e671]:
                  - generic [ref=e672]: 🔒
                  - generic [ref=e673]:
                    - generic [ref=e675]:
                      - generic [ref=e676]: Lake Walker
                      - generic [ref=e677]: Epic
                    - generic [ref=e678]:
                      - generic [ref=e679]: Not Started
                      - button "View all levels for Lake Walker" [ref=e681] [cursor=pointer]: ⓘ
                    - generic [ref=e683]:
                      - text: 0/1 lakes & ponds →
                      - strong [ref=e684]: L1 Rookie
                - generic [ref=e687]:
                  - generic [ref=e688]: 🔒
                  - generic [ref=e689]:
                    - generic [ref=e691]:
                      - generic [ref=e692]: Summit Chaser
                      - generic [ref=e693]: Epic
                    - generic [ref=e694]:
                      - generic [ref=e695]: Not Started
                      - button "View all levels for Summit Chaser" [ref=e697] [cursor=pointer]: ⓘ
                    - generic [ref=e699]:
                      - text: 0/1 scenic overlooks →
                      - strong [ref=e700]: L1 Rookie
                - generic [ref=e703]:
                  - generic [ref=e704]: 🔒
                  - generic [ref=e705]:
                    - generic [ref=e707]:
                      - generic [ref=e708]: Beach Goer
                      - generic [ref=e709]: Rare
                    - generic [ref=e710]:
                      - generic [ref=e711]: Not Started
                      - button "View all levels for Beach Goer" [ref=e713] [cursor=pointer]: ⓘ
                    - generic [ref=e715]:
                      - text: 0/1 public beaches →
                      - strong [ref=e716]: L1 Rookie
                - generic [ref=e719]:
                  - generic [ref=e720]: 🔒
                  - generic [ref=e721]:
                    - generic [ref=e723]:
                      - generic [ref=e724]: Garden Lover
                      - generic [ref=e725]: Rare
                    - generic [ref=e726]:
                      - generic [ref=e727]: Not Started
                      - button "View all levels for Garden Lover" [ref=e729] [cursor=pointer]: ⓘ
                    - generic [ref=e731]:
                      - text: 0/1 botanical gardens →
                      - strong [ref=e732]: L1 Rookie
                - generic [ref=e735]:
                  - generic [ref=e736]: 🔒
                  - generic [ref=e737]:
                    - generic [ref=e739]:
                      - generic [ref=e740]: Outdoors Devotee
                      - generic [ref=e741]: Legendary
                    - generic [ref=e742]:
                      - generic [ref=e743]: Not Started
                      - button "View all levels for Outdoors Devotee" [ref=e745] [cursor=pointer]: ⓘ
                    - generic [ref=e747]:
                      - text: 0/1 total visits →
                      - strong [ref=e748]: L1 Rookie
                - generic [ref=e751]:
                  - generic [ref=e752]: 🔒
                  - generic [ref=e753]:
                    - generic [ref=e755]:
                      - generic [ref=e756]: Nature Champion
                      - generic [ref=e757]: Legendary
                    - generic [ref=e758]:
                      - generic [ref=e759]: Not Started
                      - button "View all levels for Nature Champion" [ref=e761] [cursor=pointer]: ⓘ
                    - generic [ref=e763]:
                      - text: 0/1 completed challenges →
                      - strong [ref=e764]: L1 Rookie
            - generic [ref=e766]:
              - generic [ref=e768]:
                - generic [ref=e769]: 📚 Seasonal Quests
                - generic [ref=e770]: Multi-step seasonal goals for Outdoors.
              - generic [ref=e771]:
                - generic [ref=e772]:
                  - generic [ref=e773]: 🌸 Spring Now
                  - generic [ref=e774]: Spring Awakening
                  - generic [ref=e775]: 0/3 steps
                  - generic [ref=e776]:
                    - generic [ref=e777]:
                      - generic [ref=e778]: ○
                      - generic [ref=e779]: Visit 3 parks or gardens
                      - generic [ref=e780]: Auto
                    - generic [ref=e781]:
                      - generic [ref=e782]: ○
                      - generic [ref=e783]: Find a waterfall
                      - generic [ref=e784]: Auto
                    - generic [ref=e785]:
                      - generic [ref=e786]: ○
                      - generic [ref=e787]: Hike a trail
                      - generic [ref=e788]: Auto
                - generic [ref=e789]:
                  - generic [ref=e790]: ☀️ Summer
                  - generic [ref=e791]: Summer Expedition
                  - generic [ref=e792]: 0/3 steps
                  - generic [ref=e793]:
                    - generic [ref=e794]:
                      - generic [ref=e795]: ○
                      - generic [ref=e796]: Swim at a public beach
                      - generic [ref=e797]: Auto
                    - generic [ref=e798]:
                      - generic [ref=e799]: ○
                      - generic [ref=e800]: Visit a recreation area
                      - generic [ref=e801]: Auto
                    - generic [ref=e802]:
                      - generic [ref=e803]: ○
                      - generic [ref=e804]: Camp overnight
                      - generic [ref=e805]: Auto
                - generic [ref=e806]:
                  - generic [ref=e807]: 🍂 Fall
                  - generic [ref=e808]: Fall Foliage Tour
                  - generic [ref=e809]: 0/3 steps
                  - generic [ref=e810]:
                    - generic [ref=e811]:
                      - generic [ref=e812]: ○
                      - generic [ref=e813]: Visit 3 scenic overlooks
                      - generic [ref=e814]: Auto
                    - generic [ref=e815]:
                      - generic [ref=e816]: ○
                      - generic [ref=e817]: Explore a state park
                      - generic [ref=e818]: Auto
                    - generic [ref=e819]:
                      - generic [ref=e820]: ○
                      - generic [ref=e821]: Find a lake or pond
                      - generic [ref=e822]: Auto
                - generic [ref=e823]:
                  - generic [ref=e824]: ❄️ Winter
                  - generic [ref=e825]: Winter Wild Side
                  - generic [ref=e826]: 0/3 steps
                  - generic [ref=e827]:
                    - generic [ref=e828]:
                      - generic [ref=e829]: ○
                      - generic [ref=e830]: Find a waterfall (brave the cold!)
                      - generic [ref=e831]: Auto
                    - generic [ref=e832]:
                      - generic [ref=e833]: ○
                      - generic [ref=e834]: Hike a trailhead
                      - generic [ref=e835]: Auto
                    - generic [ref=e836]:
                      - generic [ref=e837]: ○
                      - generic [ref=e838]: Visit a botanical garden
                      - generic [ref=e839]: Auto
            - generic [ref=e840]:
              - generic [ref=e841]:
                - generic [ref=e842]:
                  - generic [ref=e843]: 🟩 Outdoors Bingo
                  - generic [ref=e844]: Auto-synced from your logged visits. Complete a row, column, or diagonal for BINGO!
                - generic [ref=e845]: 0/9
              - generic [ref=e846]:
                - generic "Trailhead not completed" [ref=e847] [cursor=pointer]:
                  - generic [ref=e848]: 🥾
                  - generic [ref=e849]: Trailhead
                - generic "Waterfall not completed" [ref=e850] [cursor=pointer]:
                  - generic [ref=e851]: 💧
                  - generic [ref=e852]: Waterfall
                - generic "State Park not completed" [ref=e853] [cursor=pointer]:
                  - generic [ref=e854]: 🌲
                  - generic [ref=e855]: State Park
                - generic "Campground not completed" [ref=e856] [cursor=pointer]:
                  - generic [ref=e857]: ⛺
                  - generic [ref=e858]: Campground
                - generic "Scenic Overlook not completed" [ref=e859] [cursor=pointer]:
                  - generic [ref=e860]: 🏔️
                  - generic [ref=e861]: Scenic Overlook
                - generic "Lake or Pond not completed" [ref=e862] [cursor=pointer]:
                  - generic [ref=e863]: 🏞️
                  - generic [ref=e864]: Lake or Pond
                - generic "Public Beach not completed" [ref=e865] [cursor=pointer]:
                  - generic [ref=e866]: 🏖️
                  - generic [ref=e867]: Public Beach
                - generic "National Park not completed" [ref=e868] [cursor=pointer]:
                  - generic [ref=e869]: 🏔️
                  - generic [ref=e870]: National Park
                - generic "Botanical Garden not completed" [ref=e871] [cursor=pointer]:
                  - generic [ref=e872]: 🌺
                  - generic [ref=e873]: Botanical Garden
              - generic [ref=e874]: 0/9 tiles marked
        - group "🧰 Diagnostics, Sync and Clean Up" [ref=e875]:
          - generic "🧰 Diagnostics, Sync and Clean Up Sync health, local queue visibility, and visited tracker diagnostics. ▾" [ref=e876] [cursor=pointer]:
            - generic [ref=e877]:
              - generic [ref=e878]: 🧰 Diagnostics, Sync and Clean Up
              - generic [ref=e879]: Sync health, local queue visibility, and visited tracker diagnostics.
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