# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visited-enrich-modal-smoke.spec.js >> Visited enrich modal smoke >> supports changed highlights, selective save, confidence chips, and undo
- Location: tests/visited-enrich-modal-smoke.spec.js:5:3

# Error details

```
Error: Unexpected browser errors detected:
1. [console] Failed to load resource: net::ERR_CONNECTION_RESET (http://127.0.0.1:4321/JS%20Files/diagnostics-reporting-utils.js)
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]: ℹ️ TV Mode disabled
  - generic "Click to expand/collapse errors" [ref=e5] [cursor=pointer]:
    - generic [ref=e6]:
      - generic [ref=e7]: ⚠️ Errors Detected
      - generic [ref=e8]: "0"
      - generic [ref=e9]: "Overlay: OK"
    - generic [ref=e10]: ▼
  - generic "Click to expand/collapse" [ref=e12] [cursor=pointer]:
    - generic [ref=e13]:
      - text: 🔧 Advanced Debug Console
      - generic [ref=e14]: "Startup timing: interactive 120 ms | overlay off 472 ms"
      - generic [ref=e15]: "Reliability: blocked 0 | overlays 0 | recoveries 0 | errors 0"
    - generic [ref=e16]:
      - button "📋 Copy All" [ref=e17]
      - button "🔗 Copy Card Bundle" [ref=e18]
      - button "🗑️ Clear" [ref=e19]
      - button "↓ Minimize" [ref=e20]
  - banner [ref=e21]:
    - generic [ref=e22]:
      - generic [ref=e23]: Kyle’s Adventure Finder
      - generic [ref=e24]: Powered by Excel, enhanced with Google data and mobile-friendly design.
    - generic [ref=e25]:
      - generic [ref=e26]:
        - button "🔄 Reload App" [ref=e27] [cursor=pointer]
        - button "📝 Edit Mode" [ref=e28] [cursor=pointer]
        - button "📴 Offline Mode" [ref=e29] [cursor=pointer]
        - button "💾 App Backup" [ref=e30] [cursor=pointer]
        - button "🩺 Diagnostics" [ref=e31] [cursor=pointer]
        - button "📺 TV Mode" [ref=e32] [cursor=pointer]
        - button "📱 iPhone View" [ref=e33] [cursor=pointer]
        - generic [ref=e34]:
          - generic [ref=e35]: All Changes Synced
          - button "Retry Sync" [disabled]
        - button "Sign In" [ref=e36] [cursor=pointer]
        - button "Sign In via Device" [ref=e37] [cursor=pointer]
      - generic [ref=e38]: Not signed in
  - status [ref=e39]:
    - generic [ref=e40]: "🔐 Sign in required: connect your Microsoft account to load Excel data and use core app features."
    - button "Sign In Now" [ref=e41] [cursor=pointer]
  - generic [ref=e42]:
    - generic [ref=e43]:
      - button "🎮 Adventure Challenge" [ref=e44] [cursor=pointer]
      - button "🌿 Nature Challenge" [ref=e45] [cursor=pointer]
      - button "🏔️ Adventure Planner" [ref=e46] [cursor=pointer]
      - button "🧰 Household Tools" [ref=e47] [cursor=pointer]
      - button "🐦 Birding Locations" [ref=e48] [cursor=pointer]
      - button "🚴 Bike Trails" [ref=e49] [cursor=pointer]
    - tablist "Adventure Challenge categories" [ref=e53]:
      - tab "Open Outdoors section" [selected] [ref=e54] [cursor=pointer]: 🌲 Outdoors
      - tab "Open Entertainment section" [ref=e55] [cursor=pointer]: 🎬 Entertainment
      - tab "Open Food and Drink section" [ref=e56] [cursor=pointer]: 🍽️ Food & Drink
      - tab "Open Retail section" [ref=e57] [cursor=pointer]: 🛍️ Retail
      - tab "Open Wildlife and Animals section" [ref=e58] [cursor=pointer]: 🦌 Wildlife & Animals
      - tab "Open Regional Festivals section" [ref=e59] [cursor=pointer]: 🎉 Regional Festivals
      - tab "Open Bike Trails section" [ref=e60] [cursor=pointer]: 🚴 Bike Trails
    - generic [ref=e63]:
      - heading "Adventure Challenge - Outdoors" [level=1] [ref=e65]
      - generic [ref=e66]: 🌲 Outdoors section active
      - tabpanel "Open Outdoors section" [ref=e67]:
        - text: "1"
        - generic [ref=e68]:
          - generic [ref=e69]:
            - generic [ref=e70]:
              - button "← Back to Outdoors" [ref=e71] [cursor=pointer]
              - generic [ref=e72]:
                - generic [ref=e73]: 🌲 Explore the Outdoors
                - generic [ref=e74]:
                  - text: Directory sourced from
                  - code [ref=e75]: Nature_Locations.xlsx
                  - text: /
                  - code [ref=e76]: Nature_Locations
                  - text: .
            - generic [ref=e77]:
              - textbox "Search outdoor locations" [ref=e78]:
                - /placeholder: Search by name, description or tags…
              - group "Quick tag filters" [ref=e79]:
                - button "seed 1" [ref=e80] [cursor=pointer]:
                  - text: seed
                  - generic: "1"
                - button "smoke 1" [ref=e81] [cursor=pointer]:
                  - text: smoke
                  - generic: "1"
            - group [ref=e82]:
              - generic "⚙️ Advanced Filters ▸" [ref=e83] [cursor=pointer]
              - generic [ref=e84]:
                - combobox "Sort outdoor locations" [ref=e85]:
                  - 'option "Sort: Name A-Z" [selected]'
                  - 'option "Sort: Name Z-A"'
                  - 'option "Sort: City A-Z"'
                  - 'option "Sort: State A-Z"'
                - combobox "Filter outdoor locations by state" [ref=e86]:
                  - 'option "State: All" [selected]'
                  - option "TX"
                - combobox "Filter outdoor locations by city" [ref=e87]:
                  - 'option "City: All" [selected]'
                  - option "Austin"
            - generic [ref=e88]: 1 of 1 outdoor locations shown.
            - generic [ref=e89]:
              - generic [ref=e90]:
                - strong [ref=e91]: Plan a Route
                - generic [ref=e92]: 0 selected
                - button "Generate Route" [ref=e93] [cursor=pointer]
                - button "Share Itinerary" [ref=e94] [cursor=pointer]
              - generic [ref=e95]: Select at least 2 locations to build an optimized driving route.
          - generic [ref=e97]:
            - generic [ref=e98]:
              - generic [ref=e99]:
                - generic "Not visited yet" [ref=e100]: ⭕
                - text: Playwright Seed Location
              - generic [ref=e101]:
                - generic [ref=e102]:
                  - checkbox "Route" [ref=e103]
                  - text: Route
                - button "Details" [ref=e104] [cursor=pointer]
                - button "Filters for Playwright Seed Location" [ref=e105] [cursor=pointer]: 🔍 Filters
                - button "Quick Actions ▾" [ref=e106] [cursor=pointer]
            - generic [ref=e107]:
              - button "☆ Add to Favorites" [ref=e108] [cursor=pointer]
              - group "My star rating" [ref=e109]:
                - button "Set rating to 1 stars" [ref=e110] [cursor=pointer]: ★
                - button "Set rating to 2 stars" [ref=e111] [cursor=pointer]: ★
                - button "Set rating to 3 stars" [ref=e112] [cursor=pointer]: ★
                - button "Set rating to 4 stars" [ref=e113] [cursor=pointer]: ★
                - button "Set rating to 5 stars" [ref=e114] [cursor=pointer]: ★
            - generic [ref=e115]:
              - strong [ref=e116]: "Estimated Drive Time:"
              - text: Unknown
            - strong [ref=e118]: "Tags:"
            - generic [ref=e119]:
              - button "seed" [ref=e120] [cursor=pointer]
              - button "smoke" [ref=e121] [cursor=pointer]
            - generic [ref=e122]:
              - strong [ref=e123]: "Physical Address - City - State:"
              - button "123 Seed Street - Austin - TX" [ref=e124] [cursor=pointer]
            - generic [ref=e125]:
              - strong [ref=e126]: "Description:"
              - generic [ref=e127]: Seed baseline description
      - text: ▸ ▸ ▸ ▸ ▸
      - group "🧰 Diagnostics, Sync and Clean Up" [ref=e128]:
        - generic "🧰 Diagnostics, Sync and Clean Up Sync health, local queue visibility, and visited tracker diagnostics. ▾" [ref=e129] [cursor=pointer]:
          - generic [ref=e130]:
            - generic [ref=e131]: 🧰 Diagnostics, Sync and Clean Up
            - generic [ref=e132]: Sync health, local queue visibility, and visited tracker diagnostics.
          - text: ▾
        - option "Strict (Place ID + exact name)"
        - option "Balanced (Place ID + exact + fuzzy)" [selected]
        - option "Name Only (exact + fuzzy)"
      - dialog "📝 Enrich Data — Playwright Seed Location" [ref=e133]:
        - generic [ref=e134]:
          - generic [ref=e135]: 📝 Enrich Data — Playwright Seed Location
          - button "Close text parser" [ref=e136] [cursor=pointer]: Close
        - generic [ref=e137]:
          - generic [ref=e138]: Paste location information
          - textbox "Paste location information" [ref=e139]:
            - /placeholder: "Paste location info here:\n\nExample:\n123 Main Street\nNew York, NY\n(555) 123-4567\nMon-Fri: 9am-5pm, Sat: 10am-3pm\nGreat spot for lunch with outdoor seating"
            - text: 987 Playwright Ave Austin, TX (512) 555-0100 Mon-Fri 10am-6pm Playwright parser smoke description 1777389289359-undo
          - generic [ref=e140]:
            - button "Parse 🔍" [ref=e141] [cursor=pointer]
            - button "↶ Undo" [ref=e142] [cursor=pointer]
            - button "↷ Redo" [ref=e143] [cursor=pointer]
          - generic [ref=e144]:
            - generic [ref=e145]:
              - strong [ref=e146]: "Assistant summary:"
              - text: I found 3 changed fields and recommend saving 2 high-confidence fields.
              - generic [ref=e147]:
                - button "✨ Select Recommended (2)" [ref=e148] [cursor=pointer]
                - generic [ref=e149]: High-confidence fields are selected when possible; review and adjust before saving.
            - generic [ref=e150]:
              - generic [ref=e151]:
                - generic [ref=e152]:
                  - generic [ref=e153]: Address
                  - generic [ref=e154]: High 90%
                - generic [ref=e155]:
                  - checkbox "Save this field" [checked] [ref=e156]
                  - text: Save this field
                - generic [ref=e157]:
                  - generic [ref=e158]: "Before:"
                  - generic [ref=e159]: 123 Seed Street
                - textbox "Address" [ref=e160]:
                  - /placeholder: Street address
                  - text: 987 Playwright Ave.
                - generic [ref=e161]:
                  - generic [ref=e162]: "After:"
                  - generic [ref=e163]: 987 Playwright Ave.
              - generic [ref=e164]:
                - generic [ref=e165]:
                  - generic [ref=e166]: City
                  - generic [ref=e167]: Low 0%
                - generic [ref=e168]:
                  - checkbox "Save this field" [ref=e169]
                  - text: Save this field
                - generic [ref=e170]:
                  - generic [ref=e171]: "Before:"
                  - generic [ref=e172]: Austin
                - textbox "City" [ref=e173]
                - generic [ref=e174]:
                  - generic [ref=e175]: "After:"
                  - generic [ref=e176]: (empty)
              - generic [ref=e177]:
                - generic [ref=e178]:
                  - generic [ref=e179]: State
                  - generic [ref=e180]: High 82%
                - generic [ref=e181]:
                  - checkbox "Save this field" [ref=e182]
                  - text: Save this field
                - generic [ref=e183]:
                  - generic [ref=e184]: "Before:"
                  - generic [ref=e185]: TX
                - textbox "State" [ref=e186]:
                  - /placeholder: State abbreviation or name
                  - text: TX
                - generic [ref=e187]:
                  - generic [ref=e188]: "After:"
                  - generic [ref=e189]: TX
              - generic [ref=e190]:
                - generic [ref=e191]:
                  - generic [ref=e192]: Phone
                  - generic [ref=e193]: High 95%
                - generic [ref=e194]:
                  - checkbox "Save this field" [checked] [ref=e195]
                  - text: Save this field
                - generic [ref=e196]:
                  - generic [ref=e197]: "Before:"
                  - generic [ref=e198]: (512) 555-0001
                - textbox "Phone" [ref=e199]:
                  - /placeholder: Phone number
                  - text: (512) 555-0199
                - generic [ref=e200]:
                  - generic [ref=e201]: "After:"
                  - generic [ref=e202]: (512) 555-0199
              - generic [ref=e203]:
                - generic [ref=e204]:
                  - generic [ref=e205]: Hours of Operation
                  - generic [ref=e206]: Medium 72%
                - generic [ref=e207]:
                  - checkbox "Save this field" [ref=e208]
                  - text: Save this field
                - generic [ref=e209]:
                  - generic [ref=e210]: "Before:"
                  - generic [ref=e211]: Mon-Fri 9am-5pm
                - textbox "Hours of Operation" [ref=e212]:
                  - /placeholder: "e.g. Mon-Fri: 9am-5pm, Sat: 10am-3pm"
                  - text: Mon-Fri 9am-5pm
                - generic [ref=e213]:
                  - generic [ref=e214]: "After:"
                  - generic [ref=e215]: Mon-Fri 9am-5pm
              - generic [ref=e216]:
                - generic [ref=e217]:
                  - generic [ref=e218]: Description
                  - generic [ref=e219]: Medium 56%
                - generic [ref=e220]:
                  - checkbox "Save this field" [ref=e221]
                  - text: Save this field
                - generic [ref=e222]:
                  - generic [ref=e223]: "Before:"
                  - generic [ref=e224]: Seed baseline description
                - textbox "Description" [ref=e225]:
                  - /placeholder: General description or notes
                  - text: Austin, Playwright parser smoke description 1777389289210
                - generic [ref=e226]:
                  - generic [ref=e227]: "After:"
                  - generic [ref=e228]: Austin, Playwright parser smoke description 1777389289210
              - generic [ref=e229]:
                - generic [ref=e230]:
                  - generic [ref=e231]: Latitude
                  - generic [ref=e232]: Low 0%
                - generic [ref=e233]:
                  - checkbox "Save this field" [ref=e234]
                  - text: Save this field
                - generic [ref=e235]:
                  - generic [ref=e236]: "Before:"
                  - generic [ref=e237]: (empty)
                - textbox "Latitude" [ref=e238]:
                  - /placeholder: e.g. 35.2271
                - generic [ref=e239]:
                  - generic [ref=e240]: "After:"
                  - generic [ref=e241]: (empty)
              - generic [ref=e242]:
                - generic [ref=e243]:
                  - generic [ref=e244]: Longitude
                  - generic [ref=e245]: Low 0%
                - generic [ref=e246]:
                  - checkbox "Save this field" [ref=e247]
                  - text: Save this field
                - generic [ref=e248]:
                  - generic [ref=e249]: "Before:"
                  - generic [ref=e250]: (empty)
                - textbox "Longitude" [ref=e251]:
                  - /placeholder: e.g. -80.8431
                - generic [ref=e252]:
                  - generic [ref=e253]: "After:"
                  - generic [ref=e254]: (empty)
            - generic [ref=e255]: Changed fields are highlighted. You can save locally now and let sync catch up if OneDrive is unavailable.
          - generic [ref=e256]:
            - button "↶ Undo Last Parse" [ref=e257] [cursor=pointer]
            - button "Save Selected (2)" [ref=e258] [cursor=pointer]
            - button "Cancel" [ref=e259] [cursor=pointer]
  - 'button "TV Mode: OFF" [ref=e260] [cursor=pointer]'
  - button "Quick Add a place" [ref=e262] [cursor=pointer]:
    - generic: ＋
  - dialog "Quick Add a place" [ref=e263]:
    - generic [ref=e265]: ⚡ Quick Add
    - generic [ref=e266]:
      - generic [ref=e267]:
        - generic [ref=e268]: Place Name *
        - textbox "Place Name *" [ref=e269]:
          - /placeholder: e.g. Congaree National Park
      - generic [ref=e270]:
        - generic [ref=e271]: Website or Google Maps URL
        - textbox "Website or Google Maps URL" [ref=e272]:
          - /placeholder: https://...
      - generic [ref=e273]:
        - generic [ref=e274]: Photo URL (optional)
        - textbox "Photo URL (optional)" [ref=e275]:
          - /placeholder: https://...
      - generic [ref=e276]:
        - generic [ref=e277]: Quick Note
        - textbox "Quick Note" [ref=e278]:
          - /placeholder: Any quick thoughts...
      - generic [ref=e279]:
        - button "💾 Save to Inbox" [ref=e280] [cursor=pointer]
        - button "Cancel" [ref=e281] [cursor=pointer]
  - button "Deployment 2026.04.23.live-debug.1 OK (4/4)" [ref=e283] [cursor=pointer]
  - generic [ref=e284]: ✅ App Ready - 9 systems initialized
  - generic: Explore the Outdoors
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