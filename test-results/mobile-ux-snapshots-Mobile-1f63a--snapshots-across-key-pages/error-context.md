# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mobile-ux-snapshots.spec.js >> Mobile UX snapshots >> captures iPhone-view snapshots across key pages
- Location: tests/mobile-ux-snapshots.spec.js:47:3

# Error details

```
Error: Mobile snapshot readiness timeout. Final height=8073, expected=7816
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
      - generic [ref=e12]: "Startup timing: interactive 91 ms | overlay off 441 ms"
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
        - button "💻 Desktop View" [ref=e30] [cursor=pointer]
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
                - generic [ref=e82]: "Outdoors data: sign-in required"
                - button "Sync category totals" [ref=e83] [cursor=pointer]
                - generic [ref=e84]: Use Sign In, then refresh this tab.
              - generic [ref=e85]:
                - button "Refresh Data" [ref=e86] [cursor=pointer]
                - button "↶ Undo" [disabled] [ref=e87] [cursor=pointer]
                - button "🔎 Explore Outdoors" [ref=e88] [cursor=pointer]
                - button "🏙️ City Explorer" [ref=e89] [cursor=pointer]:
                  - text: 🏙️ City Explorer
                  - generic: i
                - button "📝 Edit Mode" [ref=e90] [cursor=pointer]
          - generic [ref=e91]:
            - generic [ref=e92]:
              - generic [ref=e94]:
                - generic [ref=e95]: 📊 Category Progression
                - generic [ref=e96]:
                  - text: "Track your Outdoors visits by category. Total logged:"
                  - strong [ref=e97]: "0"
                  - text: .
                  - button "Log Visit" [ref=e98] [cursor=pointer]
              - generic [ref=e99]:
                - generic [ref=e100]:
                  - generic [ref=e101]: 🥾
                  - generic [ref=e102]: Trailheads
                  - generic [ref=e103]: 0 / ?
                  - generic [ref=e104]: 0% complete
                  - generic [ref=e107]: Auto-tracked from visit logs
                - generic [ref=e108]:
                  - generic [ref=e109]: 💧
                  - generic [ref=e110]: Waterfalls
                  - generic [ref=e111]: 0 / ?
                  - generic [ref=e112]: 0% complete
                  - generic [ref=e115]: Auto-tracked from visit logs
                - generic [ref=e116]:
                  - generic [ref=e117]: 🏔️
                  - generic [ref=e118]: Scenic Overlooks
                  - generic [ref=e119]: 0 / ?
                  - generic [ref=e120]: 0% complete
                  - generic [ref=e123]: Auto-tracked from visit logs
                - generic [ref=e124]:
                  - generic [ref=e125]: ⛺
                  - generic [ref=e126]: Campgrounds
                  - generic [ref=e127]: 0 / ?
                  - generic [ref=e128]: 0% complete
                  - generic [ref=e131]: Auto-tracked from visit logs
                - generic [ref=e132]:
                  - generic [ref=e133]: 🌲
                  - generic [ref=e134]: State Parks
                  - generic [ref=e135]: 0 / ?
                  - generic [ref=e136]: 0% complete
                  - generic [ref=e139]: Auto-tracked from visit logs
                - generic [ref=e140]:
                  - generic [ref=e141]: 🏔️
                  - generic [ref=e142]: National Parks
                  - generic [ref=e143]: 0 / ?
                  - generic [ref=e144]: 0% complete
                  - generic [ref=e147]: Auto-tracked from visit logs
                - generic [ref=e148]:
                  - generic [ref=e149]: 🏖️
                  - generic [ref=e150]: Public Beaches
                  - generic [ref=e151]: 0 / ?
                  - generic [ref=e152]: 0% complete
                  - generic [ref=e155]: Auto-tracked from visit logs
                - generic [ref=e156]:
                  - generic [ref=e157]: 🏞️
                  - generic [ref=e158]: Lakes & Ponds
                  - generic [ref=e159]: 0 / ?
                  - generic [ref=e160]: 0% complete
                  - generic [ref=e163]: Auto-tracked from visit logs
                - generic [ref=e164]:
                  - generic [ref=e165]: 🏕️
                  - generic [ref=e166]: Recreation Areas
                  - generic [ref=e167]: 0 / ?
                  - generic [ref=e168]: 0% complete
                  - generic [ref=e171]: Auto-tracked from visit logs
                - generic [ref=e172]:
                  - generic [ref=e173]: 🌺
                  - generic [ref=e174]: Botanical Gardens
                  - generic [ref=e175]: 0 / ?
                  - generic [ref=e176]: 0% complete
                  - generic [ref=e179]: Auto-tracked from visit logs
            - generic [ref=e180]:
              - generic [ref=e181]:
                - generic [ref=e182]:
                  - generic [ref=e183]: 🏅 Challenges & Badges
                  - generic [ref=e184]: Challenge goals and badges now share one achievement wall using the same badge layout.
                - generic [ref=e185]: 0/100
              - generic [ref=e186]:
                - generic [ref=e188]:
                  - generic [ref=e189]: 🥾
                  - generic [ref=e190]:
                    - generic [ref=e192]:
                      - generic [ref=e193]: Trailhead Seeker
                      - generic [ref=e194]: Challenge
                    - generic [ref=e195]:
                      - generic [ref=e196]: Not Started
                      - button "View all levels for Trailhead Seeker" [ref=e198] [cursor=pointer]: ⓘ
                    - generic [ref=e199]: Visit 3 trailheads.
                    - generic [ref=e200]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e202]:
                      - text: 0/1 visits →
                      - strong [ref=e203]: L1 Rookie
                    - generic [ref=e205]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 trailhead" [ref=e206]':
                        - generic [ref=e207]: L1
                        - generic [ref=e208]: Rookie
                        - generic [ref=e209]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 trailhead" [ref=e210]':
                        - generic [ref=e211]: L2
                        - generic [ref=e212]: Novice
                        - generic [ref=e213]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 trailhead" [ref=e214]':
                        - generic [ref=e215]: L3
                        - generic [ref=e216]: Semi-Pro
                        - generic [ref=e217]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 trailhead" [ref=e218]':
                        - generic [ref=e219]: L4
                        - generic [ref=e220]: Pro
                        - generic [ref=e221]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ trailhead" [ref=e222]':
                        - generic [ref=e223]: L5
                        - generic [ref=e224]: MVP
                        - generic [ref=e225]: 🔒
                    - generic [ref=e226]:
                      - button "−" [ref=e227] [cursor=pointer]
                      - button "+ Log" [ref=e228] [cursor=pointer]
                - generic [ref=e230]:
                  - generic [ref=e231]: 💧
                  - generic [ref=e232]:
                    - generic [ref=e234]:
                      - generic [ref=e235]: Waterfall Hunter
                      - generic [ref=e236]: Challenge
                    - generic [ref=e237]:
                      - generic [ref=e238]: Not Started
                      - button "View all levels for Waterfall Hunter" [ref=e240] [cursor=pointer]: ⓘ
                    - generic [ref=e241]: Discover 3 waterfalls.
                    - generic [ref=e242]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e244]:
                      - text: 0/1 visits →
                      - strong [ref=e245]: L1 Rookie
                    - generic [ref=e247]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 waterfall" [ref=e248]':
                        - generic [ref=e249]: L1
                        - generic [ref=e250]: Rookie
                        - generic [ref=e251]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 waterfall" [ref=e252]':
                        - generic [ref=e253]: L2
                        - generic [ref=e254]: Novice
                        - generic [ref=e255]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 waterfall" [ref=e256]':
                        - generic [ref=e257]: L3
                        - generic [ref=e258]: Semi-Pro
                        - generic [ref=e259]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 waterfall" [ref=e260]':
                        - generic [ref=e261]: L4
                        - generic [ref=e262]: Pro
                        - generic [ref=e263]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ waterfall" [ref=e264]':
                        - generic [ref=e265]: L5
                        - generic [ref=e266]: MVP
                        - generic [ref=e267]: 🔒
                    - generic [ref=e268]:
                      - button "−" [ref=e269] [cursor=pointer]
                      - button "+ Log" [ref=e270] [cursor=pointer]
                - generic [ref=e272]:
                  - generic [ref=e273]: 🏔️
                  - generic [ref=e274]:
                    - generic [ref=e276]:
                      - generic [ref=e277]: Overlook Explorer
                      - generic [ref=e278]: Challenge
                    - generic [ref=e279]:
                      - generic [ref=e280]: Not Started
                      - button "View all levels for Overlook Explorer" [ref=e282] [cursor=pointer]: ⓘ
                    - generic [ref=e283]: Find 3 scenic overlooks or viewpoints.
                    - generic [ref=e284]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e286]:
                      - text: 0/1 visits →
                      - strong [ref=e287]: L1 Rookie
                    - generic [ref=e289]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 scenic" [ref=e290]':
                        - generic [ref=e291]: L1
                        - generic [ref=e292]: Rookie
                        - generic [ref=e293]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 scenic" [ref=e294]':
                        - generic [ref=e295]: L2
                        - generic [ref=e296]: Novice
                        - generic [ref=e297]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 scenic" [ref=e298]':
                        - generic [ref=e299]: L3
                        - generic [ref=e300]: Semi-Pro
                        - generic [ref=e301]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 scenic" [ref=e302]':
                        - generic [ref=e303]: L4
                        - generic [ref=e304]: Pro
                        - generic [ref=e305]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ scenic" [ref=e306]':
                        - generic [ref=e307]: L5
                        - generic [ref=e308]: MVP
                        - generic [ref=e309]: 🔒
                    - generic [ref=e310]:
                      - button "−" [ref=e311] [cursor=pointer]
                      - button "+ Log" [ref=e312] [cursor=pointer]
                - generic [ref=e314]:
                  - generic [ref=e315]: ⛺
                  - generic [ref=e316]:
                    - generic [ref=e318]:
                      - generic [ref=e319]: Campfire Nights
                      - generic [ref=e320]: Challenge
                    - generic [ref=e321]:
                      - generic [ref=e322]: Not Started
                      - button "View all levels for Campfire Nights" [ref=e324] [cursor=pointer]: ⓘ
                    - generic [ref=e325]: Camp at 2 campgrounds.
                    - generic [ref=e326]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e328]:
                      - text: 0/1 visits →
                      - strong [ref=e329]: L1 Rookie
                    - generic [ref=e331]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 campground" [ref=e332]':
                        - generic [ref=e333]: L1
                        - generic [ref=e334]: Rookie
                        - generic [ref=e335]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 campground" [ref=e336]':
                        - generic [ref=e337]: L2
                        - generic [ref=e338]: Novice
                        - generic [ref=e339]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 campground" [ref=e340]':
                        - generic [ref=e341]: L3
                        - generic [ref=e342]: Semi-Pro
                        - generic [ref=e343]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 campground" [ref=e344]':
                        - generic [ref=e345]: L4
                        - generic [ref=e346]: Pro
                        - generic [ref=e347]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ campground" [ref=e348]':
                        - generic [ref=e349]: L5
                        - generic [ref=e350]: MVP
                        - generic [ref=e351]: 🔒
                    - generic [ref=e352]:
                      - button "−" [ref=e353] [cursor=pointer]
                      - button "+ Log" [ref=e354] [cursor=pointer]
                - generic [ref=e356]:
                  - generic [ref=e357]: 🌲
                  - generic [ref=e358]:
                    - generic [ref=e360]:
                      - generic [ref=e361]: State Park Tour
                      - generic [ref=e362]: Challenge
                    - generic [ref=e363]:
                      - generic [ref=e364]: Not Started
                      - button "View all levels for State Park Tour" [ref=e366] [cursor=pointer]: ⓘ
                    - generic [ref=e367]: Visit 2 state parks.
                    - generic [ref=e368]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e370]:
                      - text: 0/1 visits →
                      - strong [ref=e371]: L1 Rookie
                    - generic [ref=e373]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 state park" [ref=e374]':
                        - generic [ref=e375]: L1
                        - generic [ref=e376]: Rookie
                        - generic [ref=e377]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 state park" [ref=e378]':
                        - generic [ref=e379]: L2
                        - generic [ref=e380]: Novice
                        - generic [ref=e381]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 state park" [ref=e382]':
                        - generic [ref=e383]: L3
                        - generic [ref=e384]: Semi-Pro
                        - generic [ref=e385]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 state park" [ref=e386]':
                        - generic [ref=e387]: L4
                        - generic [ref=e388]: Pro
                        - generic [ref=e389]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ state park" [ref=e390]':
                        - generic [ref=e391]: L5
                        - generic [ref=e392]: MVP
                        - generic [ref=e393]: 🔒
                    - generic [ref=e394]:
                      - button "−" [ref=e395] [cursor=pointer]
                      - button "+ Log" [ref=e396] [cursor=pointer]
                - generic [ref=e398]:
                  - generic [ref=e399]: 🏔️
                  - generic [ref=e400]:
                    - generic [ref=e402]:
                      - generic [ref=e403]: National Park Day
                      - generic [ref=e404]: Challenge
                    - generic [ref=e405]:
                      - generic [ref=e406]: Not Started
                      - button "View all levels for National Park Day" [ref=e408] [cursor=pointer]: ⓘ
                    - generic [ref=e409]: Visit 1 national park.
                    - generic [ref=e410]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e412]:
                      - text: 0/1 visits →
                      - strong [ref=e413]: L1 Rookie
                    - generic [ref=e415]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 national park" [ref=e416]':
                        - generic [ref=e417]: L1
                        - generic [ref=e418]: Rookie
                        - generic [ref=e419]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 national park" [ref=e420]':
                        - generic [ref=e421]: L2
                        - generic [ref=e422]: Novice
                        - generic [ref=e423]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 national park" [ref=e424]':
                        - generic [ref=e425]: L3
                        - generic [ref=e426]: Semi-Pro
                        - generic [ref=e427]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 national park" [ref=e428]':
                        - generic [ref=e429]: L4
                        - generic [ref=e430]: Pro
                        - generic [ref=e431]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ national park" [ref=e432]':
                        - generic [ref=e433]: L5
                        - generic [ref=e434]: MVP
                        - generic [ref=e435]: 🔒
                    - generic [ref=e436]:
                      - button "−" [ref=e437] [cursor=pointer]
                      - button "+ Log" [ref=e438] [cursor=pointer]
                - generic [ref=e440]:
                  - generic [ref=e441]: 🏖️
                  - generic [ref=e442]:
                    - generic [ref=e444]:
                      - generic [ref=e445]: Shoreline Explorer
                      - generic [ref=e446]: Challenge
                    - generic [ref=e447]:
                      - generic [ref=e448]: Not Started
                      - button "View all levels for Shoreline Explorer" [ref=e450] [cursor=pointer]: ⓘ
                    - generic [ref=e451]: Swim at 2 public beaches.
                    - generic [ref=e452]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e454]:
                      - text: 0/1 visits →
                      - strong [ref=e455]: L1 Rookie
                    - generic [ref=e457]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 beach" [ref=e458]':
                        - generic [ref=e459]: L1
                        - generic [ref=e460]: Rookie
                        - generic [ref=e461]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 beach" [ref=e462]':
                        - generic [ref=e463]: L2
                        - generic [ref=e464]: Novice
                        - generic [ref=e465]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 beach" [ref=e466]':
                        - generic [ref=e467]: L3
                        - generic [ref=e468]: Semi-Pro
                        - generic [ref=e469]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 beach" [ref=e470]':
                        - generic [ref=e471]: L4
                        - generic [ref=e472]: Pro
                        - generic [ref=e473]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ beach" [ref=e474]':
                        - generic [ref=e475]: L5
                        - generic [ref=e476]: MVP
                        - generic [ref=e477]: 🔒
                    - generic [ref=e478]:
                      - button "−" [ref=e479] [cursor=pointer]
                      - button "+ Log" [ref=e480] [cursor=pointer]
                - generic [ref=e482]:
                  - generic [ref=e483]: 🏞️
                  - generic [ref=e484]:
                    - generic [ref=e486]:
                      - generic [ref=e487]: Lake & Pond Loop
                      - generic [ref=e488]: Challenge
                    - generic [ref=e489]:
                      - generic [ref=e490]: Not Started
                      - button "View all levels for Lake & Pond Loop" [ref=e492] [cursor=pointer]: ⓘ
                    - generic [ref=e493]: Explore 3 lakes or ponds.
                    - generic [ref=e494]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e496]:
                      - text: 0/1 visits →
                      - strong [ref=e497]: L1 Rookie
                    - generic [ref=e499]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 lake" [ref=e500]':
                        - generic [ref=e501]: L1
                        - generic [ref=e502]: Rookie
                        - generic [ref=e503]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 lake" [ref=e504]':
                        - generic [ref=e505]: L2
                        - generic [ref=e506]: Novice
                        - generic [ref=e507]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 lake" [ref=e508]':
                        - generic [ref=e509]: L3
                        - generic [ref=e510]: Semi-Pro
                        - generic [ref=e511]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 lake" [ref=e512]':
                        - generic [ref=e513]: L4
                        - generic [ref=e514]: Pro
                        - generic [ref=e515]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ lake" [ref=e516]':
                        - generic [ref=e517]: L5
                        - generic [ref=e518]: MVP
                        - generic [ref=e519]: 🔒
                    - generic [ref=e520]:
                      - button "−" [ref=e521] [cursor=pointer]
                      - button "+ Log" [ref=e522] [cursor=pointer]
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
                - generic [ref=e566]:
                  - generic [ref=e567]: 🏕️
                  - generic [ref=e568]:
                    - generic [ref=e570]:
                      - generic [ref=e571]: Recreation Champion
                      - generic [ref=e572]: Challenge
                    - generic [ref=e573]:
                      - generic [ref=e574]: Not Started
                      - button "View all levels for Recreation Champion" [ref=e576] [cursor=pointer]: ⓘ
                    - generic [ref=e577]: Complete 4 recreation or day-use areas.
                    - generic [ref=e578]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e580]:
                      - text: 0/1 visits →
                      - strong [ref=e581]: L1 Rookie
                    - generic [ref=e583]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 rec area" [ref=e584]':
                        - generic [ref=e585]: L1
                        - generic [ref=e586]: Rookie
                        - generic [ref=e587]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 rec area" [ref=e588]':
                        - generic [ref=e589]: L2
                        - generic [ref=e590]: Novice
                        - generic [ref=e591]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 rec area" [ref=e592]':
                        - generic [ref=e593]: L3
                        - generic [ref=e594]: Semi-Pro
                        - generic [ref=e595]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 rec area" [ref=e596]':
                        - generic [ref=e597]: L4
                        - generic [ref=e598]: Pro
                        - generic [ref=e599]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ rec area" [ref=e600]':
                        - generic [ref=e601]: L5
                        - generic [ref=e602]: MVP
                        - generic [ref=e603]: 🔒
                    - generic [ref=e604]:
                      - button "−" [ref=e605] [cursor=pointer]
                      - button "+ Log" [ref=e606] [cursor=pointer]
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
                - generic [ref=e624]:
                  - generic [ref=e625]: 🔒
                  - generic [ref=e626]:
                    - generic [ref=e628]:
                      - generic [ref=e629]: Waterfall Seeker
                      - generic [ref=e630]: Rare
                    - generic [ref=e631]:
                      - generic [ref=e632]: Not Started
                      - button "View all levels for Waterfall Seeker" [ref=e634] [cursor=pointer]: ⓘ
                    - generic [ref=e636]:
                      - text: 0/1 waterfalls →
                      - strong [ref=e637]: L1 Rookie
                - generic [ref=e640]:
                  - generic [ref=e641]: 🔒
                  - generic [ref=e642]:
                    - generic [ref=e644]:
                      - generic [ref=e645]: Park Ranger
                      - generic [ref=e646]: Rare
                    - generic [ref=e647]:
                      - generic [ref=e648]: Not Started
                      - button "View all levels for Park Ranger" [ref=e650] [cursor=pointer]: ⓘ
                    - generic [ref=e652]:
                      - text: 0/1 state parks →
                      - strong [ref=e653]: L1 Rookie
                - generic [ref=e656]:
                  - generic [ref=e657]: 🔒
                  - generic [ref=e658]:
                    - generic [ref=e660]:
                      - generic [ref=e661]: Camp Explorer
                      - generic [ref=e662]: Rare
                    - generic [ref=e663]:
                      - generic [ref=e664]: Not Started
                      - button "View all levels for Camp Explorer" [ref=e666] [cursor=pointer]: ⓘ
                    - generic [ref=e668]:
                      - text: 0/1 campgrounds →
                      - strong [ref=e669]: L1 Rookie
                - generic [ref=e672]:
                  - generic [ref=e673]: 🔒
                  - generic [ref=e674]:
                    - generic [ref=e676]:
                      - generic [ref=e677]: Lake Walker
                      - generic [ref=e678]: Epic
                    - generic [ref=e679]:
                      - generic [ref=e680]: Not Started
                      - button "View all levels for Lake Walker" [ref=e682] [cursor=pointer]: ⓘ
                    - generic [ref=e684]:
                      - text: 0/1 lakes & ponds →
                      - strong [ref=e685]: L1 Rookie
                - generic [ref=e688]:
                  - generic [ref=e689]: 🔒
                  - generic [ref=e690]:
                    - generic [ref=e692]:
                      - generic [ref=e693]: Summit Chaser
                      - generic [ref=e694]: Epic
                    - generic [ref=e695]:
                      - generic [ref=e696]: Not Started
                      - button "View all levels for Summit Chaser" [ref=e698] [cursor=pointer]: ⓘ
                    - generic [ref=e700]:
                      - text: 0/1 scenic overlooks →
                      - strong [ref=e701]: L1 Rookie
                - generic [ref=e704]:
                  - generic [ref=e705]: 🔒
                  - generic [ref=e706]:
                    - generic [ref=e708]:
                      - generic [ref=e709]: Beach Goer
                      - generic [ref=e710]: Rare
                    - generic [ref=e711]:
                      - generic [ref=e712]: Not Started
                      - button "View all levels for Beach Goer" [ref=e714] [cursor=pointer]: ⓘ
                    - generic [ref=e716]:
                      - text: 0/1 public beaches →
                      - strong [ref=e717]: L1 Rookie
                - generic [ref=e720]:
                  - generic [ref=e721]: 🔒
                  - generic [ref=e722]:
                    - generic [ref=e724]:
                      - generic [ref=e725]: Garden Lover
                      - generic [ref=e726]: Rare
                    - generic [ref=e727]:
                      - generic [ref=e728]: Not Started
                      - button "View all levels for Garden Lover" [ref=e730] [cursor=pointer]: ⓘ
                    - generic [ref=e732]:
                      - text: 0/1 botanical gardens →
                      - strong [ref=e733]: L1 Rookie
                - generic [ref=e736]:
                  - generic [ref=e737]: 🔒
                  - generic [ref=e738]:
                    - generic [ref=e740]:
                      - generic [ref=e741]: Outdoors Devotee
                      - generic [ref=e742]: Legendary
                    - generic [ref=e743]:
                      - generic [ref=e744]: Not Started
                      - button "View all levels for Outdoors Devotee" [ref=e746] [cursor=pointer]: ⓘ
                    - generic [ref=e748]:
                      - text: 0/1 total visits →
                      - strong [ref=e749]: L1 Rookie
                - generic [ref=e752]:
                  - generic [ref=e753]: 🔒
                  - generic [ref=e754]:
                    - generic [ref=e756]:
                      - generic [ref=e757]: Nature Champion
                      - generic [ref=e758]: Legendary
                    - generic [ref=e759]:
                      - generic [ref=e760]: Not Started
                      - button "View all levels for Nature Champion" [ref=e762] [cursor=pointer]: ⓘ
                    - generic [ref=e764]:
                      - text: 0/1 completed challenges →
                      - strong [ref=e765]: L1 Rookie
            - generic [ref=e767]:
              - generic [ref=e769]:
                - generic [ref=e770]: 📚 Seasonal Quests
                - generic [ref=e771]: Multi-step seasonal goals for Outdoors.
              - generic [ref=e772]:
                - generic [ref=e773]:
                  - generic [ref=e774]: 🌸 Spring Now
                  - generic [ref=e775]: Spring Awakening
                  - generic [ref=e776]: 0/3 steps
                  - generic [ref=e777]:
                    - generic [ref=e778]:
                      - generic [ref=e779]: ○
                      - generic [ref=e780]: Visit 3 parks or gardens
                      - generic [ref=e781]: Auto
                    - generic [ref=e782]:
                      - generic [ref=e783]: ○
                      - generic [ref=e784]: Find a waterfall
                      - generic [ref=e785]: Auto
                    - generic [ref=e786]:
                      - generic [ref=e787]: ○
                      - generic [ref=e788]: Hike a trail
                      - generic [ref=e789]: Auto
                - generic [ref=e790]:
                  - generic [ref=e791]: ☀️ Summer
                  - generic [ref=e792]: Summer Expedition
                  - generic [ref=e793]: 0/3 steps
                  - generic [ref=e794]:
                    - generic [ref=e795]:
                      - generic [ref=e796]: ○
                      - generic [ref=e797]: Swim at a public beach
                      - generic [ref=e798]: Auto
                    - generic [ref=e799]:
                      - generic [ref=e800]: ○
                      - generic [ref=e801]: Visit a recreation area
                      - generic [ref=e802]: Auto
                    - generic [ref=e803]:
                      - generic [ref=e804]: ○
                      - generic [ref=e805]: Camp overnight
                      - generic [ref=e806]: Auto
                - generic [ref=e807]:
                  - generic [ref=e808]: 🍂 Fall
                  - generic [ref=e809]: Fall Foliage Tour
                  - generic [ref=e810]: 0/3 steps
                  - generic [ref=e811]:
                    - generic [ref=e812]:
                      - generic [ref=e813]: ○
                      - generic [ref=e814]: Visit 3 scenic overlooks
                      - generic [ref=e815]: Auto
                    - generic [ref=e816]:
                      - generic [ref=e817]: ○
                      - generic [ref=e818]: Explore a state park
                      - generic [ref=e819]: Auto
                    - generic [ref=e820]:
                      - generic [ref=e821]: ○
                      - generic [ref=e822]: Find a lake or pond
                      - generic [ref=e823]: Auto
                - generic [ref=e824]:
                  - generic [ref=e825]: ❄️ Winter
                  - generic [ref=e826]: Winter Wild Side
                  - generic [ref=e827]: 0/3 steps
                  - generic [ref=e828]:
                    - generic [ref=e829]:
                      - generic [ref=e830]: ○
                      - generic [ref=e831]: Find a waterfall (brave the cold!)
                      - generic [ref=e832]: Auto
                    - generic [ref=e833]:
                      - generic [ref=e834]: ○
                      - generic [ref=e835]: Hike a trailhead
                      - generic [ref=e836]: Auto
                    - generic [ref=e837]:
                      - generic [ref=e838]: ○
                      - generic [ref=e839]: Visit a botanical garden
                      - generic [ref=e840]: Auto
            - generic [ref=e841]:
              - generic [ref=e842]:
                - generic [ref=e843]:
                  - generic [ref=e844]: 🟩 Outdoors Bingo
                  - generic [ref=e845]: Auto-synced from your logged visits. Complete a row, column, or diagonal for BINGO!
                - generic [ref=e846]: 0/9
              - generic [ref=e847]:
                - generic "Trailhead not completed" [ref=e848] [cursor=pointer]:
                  - generic [ref=e849]: 🥾
                  - generic [ref=e850]: Trailhead
                - generic "Waterfall not completed" [ref=e851] [cursor=pointer]:
                  - generic [ref=e852]: 💧
                  - generic [ref=e853]: Waterfall
                - generic "State Park not completed" [ref=e854] [cursor=pointer]:
                  - generic [ref=e855]: 🌲
                  - generic [ref=e856]: State Park
                - generic "Campground not completed" [ref=e857] [cursor=pointer]:
                  - generic [ref=e858]: ⛺
                  - generic [ref=e859]: Campground
                - generic "Scenic Overlook not completed" [ref=e860] [cursor=pointer]:
                  - generic [ref=e861]: 🏔️
                  - generic [ref=e862]: Scenic Overlook
                - generic "Lake or Pond not completed" [ref=e863] [cursor=pointer]:
                  - generic [ref=e864]: 🏞️
                  - generic [ref=e865]: Lake or Pond
                - generic "Public Beach not completed" [ref=e866] [cursor=pointer]:
                  - generic [ref=e867]: 🏖️
                  - generic [ref=e868]: Public Beach
                - generic "National Park not completed" [ref=e869] [cursor=pointer]:
                  - generic [ref=e870]: 🏔️
                  - generic [ref=e871]: National Park
                - generic "Botanical Garden not completed" [ref=e872] [cursor=pointer]:
                  - generic [ref=e873]: 🌺
                  - generic [ref=e874]: Botanical Garden
              - generic [ref=e875]: 0/9 tiles marked
        - group "🧰 Diagnostics, Sync and Clean Up" [ref=e876]:
          - generic "🧰 Diagnostics, Sync and Clean Up Sync health, local queue visibility, and visited tracker diagnostics. ▾" [ref=e877] [cursor=pointer]:
            - generic [ref=e878]:
              - generic [ref=e879]: 🧰 Diagnostics, Sync and Clean Up
              - generic [ref=e880]: Sync health, local queue visibility, and visited tracker diagnostics.
            - text: ▾
          - option "Strict (Place ID + exact name)"
          - option "Balanced (Place ID + exact + fuzzy)" [selected]
          - option "Name Only (exact + fuzzy)"
```

# Test source

```ts
  1   | const { test, expect } = require('./reliability-test');
  2   | 
  3   | const ASSERT_VISUAL_BASELINE = process.env.MOBILE_QA_ASSERT === '1';
  4   | const MAX_DIFF_PIXEL_RATIO = Number(process.env.MOBILE_QA_MAX_DIFF_RATIO || 0.015);
  5   | const EXPECTED_MOBILE_SCROLL_HEIGHT = Number(process.env.MOBILE_QA_EXPECTED_HEIGHT || 7816);
  6   | 
  7   | async function waitForStableMobileSnapshotState(page) {
  8   |   const timeoutMs = Number(process.env.MOBILE_QA_READY_TIMEOUT_MS || 12000);
  9   |   const stableSamplesRequired = Number(process.env.MOBILE_QA_STABLE_SAMPLES || 3);
  10  |   const intervalMs = Number(process.env.MOBILE_QA_STABLE_INTERVAL_MS || 250);
  11  |   const start = Date.now();
  12  |   let lastHeight = -1;
  13  |   let stableSamples = 0;
  14  | 
  15  |   while (Date.now() - start <= timeoutMs) {
  16  | 	const state = await page.evaluate(() => ({
  17  | 	  scrollHeight: document.documentElement.scrollHeight,
  18  | 	  hasVisitedRoot: Boolean(document.getElementById('visitedLocationsRoot')),
  19  | 	  hasChallengeSection: Boolean(document.getElementById('achv-section-outdoors-challenges-badges'))
  20  | 	}));
  21  | 
  22  | 	if (state.scrollHeight === lastHeight) {
  23  | 	  stableSamples += 1;
  24  | 	} else {
  25  | 	  stableSamples = 1;
  26  | 	  lastHeight = state.scrollHeight;
  27  | 	}
  28  | 
  29  | 	const ready = stableSamples >= stableSamplesRequired
  30  | 	  && state.hasVisitedRoot
  31  | 	  && state.hasChallengeSection
  32  | 	  && state.scrollHeight === EXPECTED_MOBILE_SCROLL_HEIGHT;
  33  | 
  34  | 	if (ready) return state;
  35  | 	await page.waitForTimeout(intervalMs);
  36  |   }
  37  | 
  38  |   const finalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
> 39  |   throw new Error(
      |         ^ Error: Mobile snapshot readiness timeout. Final height=8073, expected=7816
  40  | 	`Mobile snapshot readiness timeout. Final height=${finalHeight}, expected=${EXPECTED_MOBILE_SCROLL_HEIGHT}`
  41  |   );
  42  | }
  43  | 
  44  | test.describe('Mobile UX snapshots', () => {
  45  |   test.use({ viewport: { width: 390, height: 844 } });
  46  | 
  47  |   test('captures iPhone-view snapshots across key pages', async ({ browser }) => {
  48  | 	const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  49  | 
  50  | 	await context.addInitScript(() => {
  51  | 	  try {
  52  | 		localStorage.setItem('iphoneViewEnabled', '1');
  53  | 	  } catch (_error) {
  54  | 		// Ignore storage availability issues.
  55  | 	  }
  56  | 	});
  57  | 
  58  | 	const mainPage = await context.newPage();
  59  | 	await mainPage.goto('/', { waitUntil: 'domcontentloaded' });
  60  | 	await mainPage.evaluate(() => {
  61  | 	  if (typeof window.applyIphoneViewState === 'function') {
  62  | 		window.applyIphoneViewState(true);
  63  | 		return;
  64  | 	  }
  65  | 	  document.body.classList.add('mobile-view', 'iphone-view');
  66  | 	  document.body.dataset.mobileView = '1';
  67  | 	});
  68  | 
  69  | 	await expect(mainPage.locator('body')).toBeVisible();
  70  | 	await waitForStableMobileSnapshotState(mainPage);
  71  | 	await mainPage.screenshot({ path: 'test-results/mobile-ux/index-mobile.png', fullPage: true });
  72  | 	if (ASSERT_VISUAL_BASELINE) {
  73  | 	  await expect(mainPage).toHaveScreenshot('index-mobile.png', {
  74  | 		fullPage: true,
  75  | 		animations: 'disabled',
  76  | 		maxDiffPixelRatio: MAX_DIFF_PIXEL_RATIO
  77  | 	  });
  78  | 	}
  79  | 
  80  | 	const pagePaths = [
  81  | 	  '/HTML%20Files/adventure-details-window.html',
  82  | 	  '/HTML%20Files/bike-details-window.html',
  83  | 	  '/HTML%20Files/city-viewer-window.html',
  84  | 	  '/HTML%20Files/trail-explorer-window.html',
  85  | 	  '/HTML%20Files/find-near-me-window.html',
  86  | 	  '/HTML%20Files/edit-mode-new.html'
  87  | 	];
  88  | 
  89  | 	for (const path of pagePaths) {
  90  | 	  const page = await context.newPage();
  91  | 	  await page.goto(path, { waitUntil: 'domcontentloaded' });
  92  | 	  await expect(page.locator('body')).toBeVisible();
  93  | 	  await page.waitForTimeout(200);
  94  | 
  95  | 	  const slug = path
  96  | 		.replace(/^\/+/, '')
  97  | 		.replace(/%20/g, '-')
  98  | 		.replace(/[^a-zA-Z0-9.-]/g, '-')
  99  | 		.replace(/-+/g, '-');
  100 | 
  101 | 	  await page.screenshot({
  102 | 		path: `test-results/mobile-ux/${slug}.png`,
  103 | 		fullPage: true
  104 | 	  });
  105 | 
  106 | 	  if (ASSERT_VISUAL_BASELINE) {
  107 | 		await expect(page).toHaveScreenshot(`${slug}.png`, {
  108 | 		  fullPage: true,
  109 | 		  animations: 'disabled',
  110 | 		  maxDiffPixelRatio: MAX_DIFF_PIXEL_RATIO
  111 | 		});
  112 | 	  }
  113 | 
  114 | 	  await page.close();
  115 | 	}
  116 | 
  117 | 	await context.close();
  118 |   });
  119 | });
  120 | 
  121 | 
```