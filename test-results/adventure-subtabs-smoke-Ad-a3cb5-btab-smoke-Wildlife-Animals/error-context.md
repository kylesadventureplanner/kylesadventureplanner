# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adventure-subtabs-smoke.spec.js >> Adventure Challenge new subtabs smoke >> subtab smoke: Wildlife & Animals
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
      - generic [ref=e12]: "Startup timing: interactive 91 ms | overlay off 442 ms"
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
      - tab "Open Retail section" [ref=e58] [cursor=pointer]: 🛍️ Retail
      - tab "Open Wildlife and Animals section" [active] [selected] [ref=e59] [cursor=pointer]: 🦌 Wildlife & Animals
      - tab "Open Regional Festivals section" [ref=e60] [cursor=pointer]: 🎉 Regional Festivals
      - tab "Open Bike Trails section" [ref=e61] [cursor=pointer]: 🚴 Bike Trails
    - generic [ref=e62]:
      - text: ▾
      - generic [ref=e64]:
        - generic [ref=e65]:
          - heading "Adventure Challenge - Wildlife & Animals" [level=1] [ref=e66]
          - navigation "Jump to section links" [ref=e67]:
            - generic [ref=e68]: "Jump to section:"
            - button "📊 Category Progression" [ref=e69] [cursor=pointer]
            - button "🏅 Challenges & Badges" [ref=e70] [cursor=pointer]
            - button "📚 Seasonal Quests" [ref=e71] [cursor=pointer]
            - button "🟩 Outdoors Bingo" [ref=e72] [cursor=pointer]
            - button "🧰 Diagnostics, Sync and Clean Up" [ref=e73] [cursor=pointer]
        - generic [ref=e74]: 🦌 Wildlife & Animals section active
        - tabpanel "Open Wildlife and Animals section" [ref=e75]:
          - generic [ref=e76]:
            - generic [ref=e77]:
              - generic [ref=e78]: 🦌 Wildlife & Animals
              - generic [ref=e79]: Browse and plan wildlife and animal locations you want to visit.
            - generic [ref=e80]:
              - generic [ref=e81]:
                - text: "Wildlife & Animals data: sign-in required"
                - button "Sync category totals" [ref=e82] [cursor=pointer]
                - text: Use Sign In, then refresh this tab.
              - generic [ref=e83]:
                - button "Refresh Data" [ref=e84] [cursor=pointer]
                - button "↶ Undo" [disabled] [ref=e85] [cursor=pointer]:
                  - text: ↶ Undo
                  - generic: i
                - button "🔎 Explore Wildlife & Animal Locations" [ref=e86] [cursor=pointer]:
                  - text: 🔎 Explore Wildlife & Animal Locations
                  - generic: i
                - button "Log a Visit" [ref=e87] [cursor=pointer]
                - button "🏙️ City Explorer" [ref=e88] [cursor=pointer]:
                  - text: 🏙️ City Explorer
                  - generic: i
                - button "📝 Edit Mode" [ref=e89] [cursor=pointer]:
                  - text: 📝 Edit Mode
                  - generic: i
          - generic [ref=e90]:
            - generic [ref=e91]:
              - generic [ref=e93]:
                - generic [ref=e94]: 📊 Category Progression
                - generic [ref=e95]:
                  - text: "Track your Wildlife & Animals visits by category. Total logged:"
                  - strong [ref=e96]: "0"
                  - text: .
                  - button "Log Visit" [ref=e97] [cursor=pointer]
              - generic [ref=e98]:
                - generic [ref=e99]:
                  - generic [ref=e100]: 🐄
                  - generic [ref=e101]: Farms
                  - generic [ref=e102]: 0 / ?
                  - generic [ref=e103]: 0% complete
                  - generic [ref=e106]: Auto-tracked from visit logs
                - generic [ref=e107]:
                  - generic [ref=e108]: 🐐
                  - generic [ref=e109]: Petting Zoos
                  - generic [ref=e110]: 0 / ?
                  - generic [ref=e111]: 0% complete
                  - generic [ref=e114]: Auto-tracked from visit logs
                - generic [ref=e115]:
                  - generic [ref=e116]: 🦅
                  - generic [ref=e117]: Wildlife Rehab
                  - generic [ref=e118]: 0 / ?
                  - generic [ref=e119]: 0% complete
                  - generic [ref=e122]: Auto-tracked from visit logs
                - generic [ref=e123]:
                  - generic [ref=e124]: 🐾
                  - generic [ref=e125]: Animal Rescues
                  - generic [ref=e126]: 0 / ?
                  - generic [ref=e127]: 0% complete
                  - generic [ref=e130]: Auto-tracked from visit logs
                - generic [ref=e131]:
                  - generic [ref=e132]: 🐱
                  - generic [ref=e133]: Cat Cafes
                  - generic [ref=e134]: 0 / ?
                  - generic [ref=e135]: 0% complete
                  - generic [ref=e138]: Auto-tracked from visit logs
                - generic [ref=e139]:
                  - generic [ref=e140]: 🐠
                  - generic [ref=e141]: Aquariums
                  - generic [ref=e142]: 0 / ?
                  - generic [ref=e143]: 0% complete
                  - generic [ref=e146]: Auto-tracked from visit logs
                - generic [ref=e147]:
                  - generic [ref=e148]: 🦁
                  - generic [ref=e149]: Zoos
                  - generic [ref=e150]: 0 / ?
                  - generic [ref=e151]: 0% complete
                  - generic [ref=e154]: Auto-tracked from visit logs
                - generic [ref=e155]:
                  - generic [ref=e156]: 🦒
                  - generic [ref=e157]: Drive-Thru Safari
                  - generic [ref=e158]: 0 / ?
                  - generic [ref=e159]: 0% complete
                  - generic [ref=e162]: Auto-tracked from visit logs
                - generic [ref=e163]:
                  - generic [ref=e164]: 🦋
                  - generic [ref=e165]: Animal Sanctuaries
                  - generic [ref=e166]: 0 / ?
                  - generic [ref=e167]: 0% complete
                  - generic [ref=e170]: Auto-tracked from visit logs
            - generic [ref=e171]:
              - generic [ref=e172]:
                - generic [ref=e173]:
                  - generic [ref=e174]: 🏅 Challenges & Badges
                  - generic [ref=e175]: Challenge goals and badges now share one achievement wall using the same badge layout.
                - generic [ref=e176]: 0/80
              - generic [ref=e177]:
                - generic [ref=e179]:
                  - generic [ref=e180]: 🦁
                  - generic [ref=e181]:
                    - generic [ref=e183]:
                      - generic [ref=e184]: Zoo Day
                      - generic [ref=e185]: Challenge
                    - generic [ref=e186]:
                      - generic [ref=e187]: Not Started
                      - button "View all levels for Zoo Day" [ref=e189] [cursor=pointer]: ⓘ
                    - generic [ref=e190]: Visit a zoo.
                    - generic [ref=e191]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e193]:
                      - text: 0/1 visits →
                      - strong [ref=e194]: L1 Rookie
                    - generic [ref=e196]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 zoo" [ref=e197]':
                        - generic [ref=e198]: L1
                        - generic [ref=e199]: Rookie
                        - generic [ref=e200]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 zoo" [ref=e201]':
                        - generic [ref=e202]: L2
                        - generic [ref=e203]: Novice
                        - generic [ref=e204]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 zoo" [ref=e205]':
                        - generic [ref=e206]: L3
                        - generic [ref=e207]: Semi-Pro
                        - generic [ref=e208]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 zoo" [ref=e209]':
                        - generic [ref=e210]: L4
                        - generic [ref=e211]: Pro
                        - generic [ref=e212]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ zoo" [ref=e213]':
                        - generic [ref=e214]: L5
                        - generic [ref=e215]: MVP
                        - generic [ref=e216]: 🔒
                    - generic [ref=e217]:
                      - button "−" [ref=e218] [cursor=pointer]
                      - button "+ Log" [ref=e219] [cursor=pointer]
                - generic [ref=e221]:
                  - generic [ref=e222]: 🦒
                  - generic [ref=e223]:
                    - generic [ref=e225]:
                      - generic [ref=e226]: Safari Adventure
                      - generic [ref=e227]: Challenge
                    - generic [ref=e228]:
                      - generic [ref=e229]: Not Started
                      - button "View all levels for Safari Adventure" [ref=e231] [cursor=pointer]: ⓘ
                    - generic [ref=e232]: Go on a drive-thru safari.
                    - generic [ref=e233]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e235]:
                      - text: 0/1 visits →
                      - strong [ref=e236]: L1 Rookie
                    - generic [ref=e238]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 safari" [ref=e239]':
                        - generic [ref=e240]: L1
                        - generic [ref=e241]: Rookie
                        - generic [ref=e242]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 safari" [ref=e243]':
                        - generic [ref=e244]: L2
                        - generic [ref=e245]: Novice
                        - generic [ref=e246]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 safari" [ref=e247]':
                        - generic [ref=e248]: L3
                        - generic [ref=e249]: Semi-Pro
                        - generic [ref=e250]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 safari" [ref=e251]':
                        - generic [ref=e252]: L4
                        - generic [ref=e253]: Pro
                        - generic [ref=e254]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ safari" [ref=e255]':
                        - generic [ref=e256]: L5
                        - generic [ref=e257]: MVP
                        - generic [ref=e258]: 🔒
                    - generic [ref=e259]:
                      - button "−" [ref=e260] [cursor=pointer]
                      - button "+ Log" [ref=e261] [cursor=pointer]
                - generic [ref=e263]:
                  - generic [ref=e264]: 🐠
                  - generic [ref=e265]:
                    - generic [ref=e267]:
                      - generic [ref=e268]: Aquarium Dive
                      - generic [ref=e269]: Challenge
                    - generic [ref=e270]:
                      - generic [ref=e271]: Not Started
                      - button "View all levels for Aquarium Dive" [ref=e273] [cursor=pointer]: ⓘ
                    - generic [ref=e274]: Visit an aquarium.
                    - generic [ref=e275]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e277]:
                      - text: 0/1 visits →
                      - strong [ref=e278]: L1 Rookie
                    - generic [ref=e280]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 aquarium" [ref=e281]':
                        - generic [ref=e282]: L1
                        - generic [ref=e283]: Rookie
                        - generic [ref=e284]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 aquarium" [ref=e285]':
                        - generic [ref=e286]: L2
                        - generic [ref=e287]: Novice
                        - generic [ref=e288]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 aquarium" [ref=e289]':
                        - generic [ref=e290]: L3
                        - generic [ref=e291]: Semi-Pro
                        - generic [ref=e292]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 aquarium" [ref=e293]':
                        - generic [ref=e294]: L4
                        - generic [ref=e295]: Pro
                        - generic [ref=e296]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ aquarium" [ref=e297]':
                        - generic [ref=e298]: L5
                        - generic [ref=e299]: MVP
                        - generic [ref=e300]: 🔒
                    - generic [ref=e301]:
                      - button "−" [ref=e302] [cursor=pointer]
                      - button "+ Log" [ref=e303] [cursor=pointer]
                - generic [ref=e305]:
                  - generic [ref=e306]: 🦅
                  - generic [ref=e307]:
                    - generic [ref=e309]:
                      - generic [ref=e310]: Wildlife Support
                      - generic [ref=e311]: Challenge
                    - generic [ref=e312]:
                      - generic [ref=e313]: Not Started
                      - button "View all levels for Wildlife Support" [ref=e315] [cursor=pointer]: ⓘ
                    - generic [ref=e316]: Support a wildlife rehab center.
                    - generic [ref=e317]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e319]:
                      - text: 0/1 visits →
                      - strong [ref=e320]: L1 Rookie
                    - generic [ref=e322]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 wildlife" [ref=e323]':
                        - generic [ref=e324]: L1
                        - generic [ref=e325]: Rookie
                        - generic [ref=e326]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 wildlife" [ref=e327]':
                        - generic [ref=e328]: L2
                        - generic [ref=e329]: Novice
                        - generic [ref=e330]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 wildlife" [ref=e331]':
                        - generic [ref=e332]: L3
                        - generic [ref=e333]: Semi-Pro
                        - generic [ref=e334]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 wildlife" [ref=e335]':
                        - generic [ref=e336]: L4
                        - generic [ref=e337]: Pro
                        - generic [ref=e338]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ wildlife" [ref=e339]':
                        - generic [ref=e340]: L5
                        - generic [ref=e341]: MVP
                        - generic [ref=e342]: 🔒
                    - generic [ref=e343]:
                      - button "−" [ref=e344] [cursor=pointer]
                      - button "+ Log" [ref=e345] [cursor=pointer]
                - generic [ref=e347]:
                  - generic [ref=e348]: 🐾
                  - generic [ref=e349]:
                    - generic [ref=e351]:
                      - generic [ref=e352]: Animal Rescue
                      - generic [ref=e353]: Challenge
                    - generic [ref=e354]:
                      - generic [ref=e355]: Not Started
                      - button "View all levels for Animal Rescue" [ref=e357] [cursor=pointer]: ⓘ
                    - generic [ref=e358]: Visit an animal rescue.
                    - generic [ref=e359]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e361]:
                      - text: 0/1 visits →
                      - strong [ref=e362]: L1 Rookie
                    - generic [ref=e364]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 rescue" [ref=e365]':
                        - generic [ref=e366]: L1
                        - generic [ref=e367]: Rookie
                        - generic [ref=e368]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 rescue" [ref=e369]':
                        - generic [ref=e370]: L2
                        - generic [ref=e371]: Novice
                        - generic [ref=e372]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 rescue" [ref=e373]':
                        - generic [ref=e374]: L3
                        - generic [ref=e375]: Semi-Pro
                        - generic [ref=e376]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 rescue" [ref=e377]':
                        - generic [ref=e378]: L4
                        - generic [ref=e379]: Pro
                        - generic [ref=e380]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ rescue" [ref=e381]':
                        - generic [ref=e382]: L5
                        - generic [ref=e383]: MVP
                        - generic [ref=e384]: 🔒
                    - generic [ref=e385]:
                      - button "−" [ref=e386] [cursor=pointer]
                      - button "+ Log" [ref=e387] [cursor=pointer]
                - generic [ref=e389]:
                  - generic [ref=e390]: 🦋
                  - generic [ref=e391]:
                    - generic [ref=e393]:
                      - generic [ref=e394]: Sanctuary Visit
                      - generic [ref=e395]: Challenge
                    - generic [ref=e396]:
                      - generic [ref=e397]: Not Started
                      - button "View all levels for Sanctuary Visit" [ref=e399] [cursor=pointer]: ⓘ
                    - generic [ref=e400]: Visit an animal sanctuary.
                    - generic [ref=e401]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e403]:
                      - text: 0/1 visits →
                      - strong [ref=e404]: L1 Rookie
                    - generic [ref=e406]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 sanctuary" [ref=e407]':
                        - generic [ref=e408]: L1
                        - generic [ref=e409]: Rookie
                        - generic [ref=e410]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 sanctuary" [ref=e411]':
                        - generic [ref=e412]: L2
                        - generic [ref=e413]: Novice
                        - generic [ref=e414]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 sanctuary" [ref=e415]':
                        - generic [ref=e416]: L3
                        - generic [ref=e417]: Semi-Pro
                        - generic [ref=e418]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 sanctuary" [ref=e419]':
                        - generic [ref=e420]: L4
                        - generic [ref=e421]: Pro
                        - generic [ref=e422]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ sanctuary" [ref=e423]':
                        - generic [ref=e424]: L5
                        - generic [ref=e425]: MVP
                        - generic [ref=e426]: 🔒
                    - generic [ref=e427]:
                      - button "−" [ref=e428] [cursor=pointer]
                      - button "+ Log" [ref=e429] [cursor=pointer]
                - generic [ref=e431]:
                  - generic [ref=e432]: 🐄
                  - generic [ref=e433]:
                    - generic [ref=e435]:
                      - generic [ref=e436]: Farm & Petting Zoo
                      - generic [ref=e437]: Challenge
                    - generic [ref=e438]:
                      - generic [ref=e439]: Not Started
                      - button "View all levels for Farm & Petting Zoo" [ref=e441] [cursor=pointer]: ⓘ
                    - generic [ref=e442]: Visit 2 farms or petting zoos.
                    - generic [ref=e443]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e445]:
                      - text: 0/1 visits →
                      - strong [ref=e446]: L1 Rookie
                    - generic [ref=e448]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 farm" [ref=e449]':
                        - generic [ref=e450]: L1
                        - generic [ref=e451]: Rookie
                        - generic [ref=e452]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 farm" [ref=e453]':
                        - generic [ref=e454]: L2
                        - generic [ref=e455]: Novice
                        - generic [ref=e456]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 farm" [ref=e457]':
                        - generic [ref=e458]: L3
                        - generic [ref=e459]: Semi-Pro
                        - generic [ref=e460]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 farm" [ref=e461]':
                        - generic [ref=e462]: L4
                        - generic [ref=e463]: Pro
                        - generic [ref=e464]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ farm" [ref=e465]':
                        - generic [ref=e466]: L5
                        - generic [ref=e467]: MVP
                        - generic [ref=e468]: 🔒
                    - generic [ref=e469]:
                      - button "−" [ref=e470] [cursor=pointer]
                      - button "+ Log" [ref=e471] [cursor=pointer]
                - generic [ref=e473]:
                  - generic [ref=e474]: 🐱
                  - generic [ref=e475]:
                    - generic [ref=e477]:
                      - generic [ref=e478]: Cat Cafe Chill
                      - generic [ref=e479]: Challenge
                    - generic [ref=e480]:
                      - generic [ref=e481]: Not Started
                      - button "View all levels for Cat Cafe Chill" [ref=e483] [cursor=pointer]: ⓘ
                    - generic [ref=e484]: Enjoy a cat cafe.
                    - generic [ref=e485]: "Progress: 0 visits • Tier 0/5"
                    - generic [ref=e487]:
                      - text: 0/1 visits →
                      - strong [ref=e488]: L1 Rookie
                    - generic [ref=e490]:
                      - 'generic "→ In Progress – L1 Rookie: Visit 1 cat cafe" [ref=e491]':
                        - generic [ref=e492]: L1
                        - generic [ref=e493]: Rookie
                        - generic [ref=e494]: ●
                      - 'generic "🔒 Locked – L2 Novice: Visit 3 cat cafe" [ref=e495]':
                        - generic [ref=e496]: L2
                        - generic [ref=e497]: Novice
                        - generic [ref=e498]: 🔒
                      - 'generic "🔒 Locked – L3 Semi-Pro: Visit 5 cat cafe" [ref=e499]':
                        - generic [ref=e500]: L3
                        - generic [ref=e501]: Semi-Pro
                        - generic [ref=e502]: 🔒
                      - 'generic "🔒 Locked – L4 Pro: Visit 10 cat cafe" [ref=e503]':
                        - generic [ref=e504]: L4
                        - generic [ref=e505]: Pro
                        - generic [ref=e506]: 🔒
                      - 'generic "🔒 Locked – L5 MVP: Visit 15+ cat cafe" [ref=e507]':
                        - generic [ref=e508]: L5
                        - generic [ref=e509]: MVP
                        - generic [ref=e510]: 🔒
                    - generic [ref=e511]:
                      - button "−" [ref=e512] [cursor=pointer]
                      - button "+ Log" [ref=e513] [cursor=pointer]
                - generic [ref=e515]:
                  - generic [ref=e516]: 🔒
                  - generic [ref=e517]:
                    - generic [ref=e519]:
                      - generic [ref=e520]: Farm Friend
                      - generic [ref=e521]: Common
                    - generic [ref=e522]:
                      - generic [ref=e523]: Not Started
                      - button "View all levels for Farm Friend" [ref=e525] [cursor=pointer]: ⓘ
                    - generic [ref=e527]:
                      - text: 0/1 farms →
                      - strong [ref=e528]: L1 Rookie
                - generic [ref=e531]:
                  - generic [ref=e532]: 🔒
                  - generic [ref=e533]:
                    - generic [ref=e535]:
                      - generic [ref=e536]: Cat Lover
                      - generic [ref=e537]: Common
                    - generic [ref=e538]:
                      - generic [ref=e539]: Not Started
                      - button "View all levels for Cat Lover" [ref=e541] [cursor=pointer]: ⓘ
                    - generic [ref=e543]:
                      - text: 0/1 cat cafes →
                      - strong [ref=e544]: L1 Rookie
                - generic [ref=e547]:
                  - generic [ref=e548]: 🔒
                  - generic [ref=e549]:
                    - generic [ref=e551]:
                      - generic [ref=e552]: Deep Sea Diver
                      - generic [ref=e553]: Rare
                    - generic [ref=e554]:
                      - generic [ref=e555]: Not Started
                      - button "View all levels for Deep Sea Diver" [ref=e557] [cursor=pointer]: ⓘ
                    - generic [ref=e559]:
                      - text: 0/1 aquariums →
                      - strong [ref=e560]: L1 Rookie
                - generic [ref=e563]:
                  - generic [ref=e564]: 🔒
                  - generic [ref=e565]:
                    - generic [ref=e567]:
                      - generic [ref=e568]: Safari Explorer
                      - generic [ref=e569]: Rare
                    - generic [ref=e570]:
                      - generic [ref=e571]: Not Started
                      - button "View all levels for Safari Explorer" [ref=e573] [cursor=pointer]: ⓘ
                    - generic [ref=e575]:
                      - text: 0/1 zoos →
                      - strong [ref=e576]: L1 Rookie
                - generic [ref=e579]:
                  - generic [ref=e580]: 🔒
                  - generic [ref=e581]:
                    - generic [ref=e583]:
                      - generic [ref=e584]: Animal Advocate
                      - generic [ref=e585]: Epic
                    - generic [ref=e586]:
                      - generic [ref=e587]: Not Started
                      - button "View all levels for Animal Advocate" [ref=e589] [cursor=pointer]: ⓘ
                    - generic [ref=e591]:
                      - text: 0/1 animal rescues →
                      - strong [ref=e592]: L1 Rookie
                - generic [ref=e595]:
                  - generic [ref=e596]: 🔒
                  - generic [ref=e597]:
                    - generic [ref=e599]:
                      - generic [ref=e600]: Sanctuary Seeker
                      - generic [ref=e601]: Rare
                    - generic [ref=e602]:
                      - generic [ref=e603]: Not Started
                      - button "View all levels for Sanctuary Seeker" [ref=e605] [cursor=pointer]: ⓘ
                    - generic [ref=e607]:
                      - text: 0/1 animal sanctuaries →
                      - strong [ref=e608]: L1 Rookie
                - generic [ref=e611]:
                  - generic [ref=e612]: 🔒
                  - generic [ref=e613]:
                    - generic [ref=e615]:
                      - generic [ref=e616]: Petting Pro
                      - generic [ref=e617]: Epic
                    - generic [ref=e618]:
                      - generic [ref=e619]: Not Started
                      - button "View all levels for Petting Pro" [ref=e621] [cursor=pointer]: ⓘ
                    - generic [ref=e623]:
                      - text: 0/1 petting zoos →
                      - strong [ref=e624]: L1 Rookie
                - generic [ref=e627]:
                  - generic [ref=e628]: 🔒
                  - generic [ref=e629]:
                    - generic [ref=e631]:
                      - generic [ref=e632]: Wildlife Champion
                      - generic [ref=e633]: Legendary
                    - generic [ref=e634]:
                      - generic [ref=e635]: Not Started
                      - button "View all levels for Wildlife Champion" [ref=e637] [cursor=pointer]: ⓘ
                    - generic [ref=e639]:
                      - text: 0/1 category types →
                      - strong [ref=e640]: L1 Rookie
            - generic [ref=e642]:
              - generic [ref=e644]:
                - generic [ref=e645]: 📚 Seasonal Quests
                - generic [ref=e646]: Multi-step seasonal goals for Wildlife & Animals.
              - generic [ref=e647]:
                - generic [ref=e648]:
                  - generic [ref=e649]: 🌸 Spring Now
                  - generic [ref=e650]: Spring Animals
                  - generic [ref=e651]: 0/3 steps
                  - generic [ref=e652]:
                    - generic [ref=e653]:
                      - generic [ref=e654]: ○
                      - generic [ref=e655]: Farm visit
                      - generic [ref=e656]: Auto
                    - generic [ref=e657]:
                      - generic [ref=e658]: ○
                      - generic [ref=e659]: Petting zoo
                      - generic [ref=e660]: Auto
                    - generic [ref=e661]:
                      - generic [ref=e662]: ○
                      - generic [ref=e663]: Wildlife rehab support
                      - generic [ref=e664]: Auto
                - generic [ref=e665]:
                  - generic [ref=e666]: ☀️ Summer
                  - generic [ref=e667]: Summer Wild
                  - generic [ref=e668]: 0/3 steps
                  - generic [ref=e669]:
                    - generic [ref=e670]:
                      - generic [ref=e671]: ○
                      - generic [ref=e672]: Aquarium visit
                      - generic [ref=e673]: Auto
                    - generic [ref=e674]:
                      - generic [ref=e675]: ○
                      - generic [ref=e676]: Drive-thru safari
                      - generic [ref=e677]: Auto
                    - generic [ref=e678]:
                      - generic [ref=e679]: ○
                      - generic [ref=e680]: Animal sanctuary
                      - generic [ref=e681]: Auto
                - generic [ref=e682]:
                  - generic [ref=e683]: 🍂 Fall
                  - generic [ref=e684]: Fall Creatures
                  - generic [ref=e685]: 0/3 steps
                  - generic [ref=e686]:
                    - generic [ref=e687]:
                      - generic [ref=e688]: ○
                      - generic [ref=e689]: Zoo trip
                      - generic [ref=e690]: Auto
                    - generic [ref=e691]:
                      - generic [ref=e692]: ○
                      - generic [ref=e693]: Animal rescue visit
                      - generic [ref=e694]: Auto
                    - generic [ref=e695]:
                      - generic [ref=e696]: ○
                      - generic [ref=e697]: Cat cafe
                      - generic [ref=e698]: Auto
                - generic [ref=e699]:
                  - generic [ref=e700]: ❄️ Winter
                  - generic [ref=e701]: Winter Warmth
                  - generic [ref=e702]: 0/3 steps
                  - generic [ref=e703]:
                    - generic [ref=e704]:
                      - generic [ref=e705]: ○
                      - generic [ref=e706]: Cat cafe visit
                      - generic [ref=e707]: Auto
                    - generic [ref=e708]:
                      - generic [ref=e709]: ○
                      - generic [ref=e710]: Indoor aquarium or zoo
                      - generic [ref=e711]: Auto
                    - generic [ref=e712]:
                      - generic [ref=e713]: ○
                      - generic [ref=e714]: Wildlife rehab support
                      - generic [ref=e715]: Auto
            - generic [ref=e716]:
              - generic [ref=e717]:
                - generic [ref=e718]:
                  - generic [ref=e719]: 🟩 Wildlife & Animals Bingo
                  - generic [ref=e720]: Auto-synced from your logged visits. Complete a row, column, or diagonal for BINGO!
                - generic [ref=e721]: 0/9
              - generic [ref=e722]:
                - generic "Zoo not completed" [ref=e723] [cursor=pointer]:
                  - generic [ref=e724]: 🦁
                  - generic [ref=e725]: Zoo
                - generic "Aquarium not completed" [ref=e726] [cursor=pointer]:
                  - generic [ref=e727]: 🐠
                  - generic [ref=e728]: Aquarium
                - generic "Farm not completed" [ref=e729] [cursor=pointer]:
                  - generic [ref=e730]: 🐄
                  - generic [ref=e731]: Farm
                - generic "Petting Zoo not completed" [ref=e732] [cursor=pointer]:
                  - generic [ref=e733]: 🐐
                  - generic [ref=e734]: Petting Zoo
                - generic "Cat Cafe not completed" [ref=e735] [cursor=pointer]:
                  - generic [ref=e736]: 🐱
                  - generic [ref=e737]: Cat Cafe
                - generic "Wildlife Rehab not completed" [ref=e738] [cursor=pointer]:
                  - generic [ref=e739]: 🦅
                  - generic [ref=e740]: Wildlife Rehab
                - generic "Animal Rescue not completed" [ref=e741] [cursor=pointer]:
                  - generic [ref=e742]: 🐾
                  - generic [ref=e743]: Animal Rescue
                - generic "Drive-Thru Safari not completed" [ref=e744] [cursor=pointer]:
                  - generic [ref=e745]: 🦒
                  - generic [ref=e746]: Drive-Thru Safari
                - generic "Animal Sanctuary not completed" [ref=e747] [cursor=pointer]:
                  - generic [ref=e748]: 🦋
                  - generic [ref=e749]: Animal Sanctuary
              - generic [ref=e750]: 0/9 tiles marked
        - group "🧰 Diagnostics, Sync and Clean Up" [ref=e751]:
          - generic "🧰 Diagnostics, Sync and Clean Up Sync health, local queue visibility, and visited tracker diagnostics. ▾" [ref=e752] [cursor=pointer]:
            - generic [ref=e753]:
              - generic [ref=e754]: 🧰 Diagnostics, Sync and Clean Up
              - generic [ref=e755]: Sync health, local queue visibility, and visited tracker diagnostics.
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