# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adventure-explorer-inpane-details.spec.js >> Adventure explorer in-pane details flow >> opens details in-pane, shows richer fields, and returns to list
- Location: tests/adventure-explorer-inpane-details.spec.js:319:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  locator('#visitedExplorerList-outdoors').locator('.visited-explorer-card').first().locator('[data-visited-explorer-quick-actions-menu] [data-visited-explorer-notes]').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('#visitedExplorerList-outdoors').locator('.visited-explorer-card').first().locator('[data-visited-explorer-quick-actions-menu] [data-visited-explorer-notes]').first()
    9 × locator resolved to <button type="button" role="menuitem" data-reliability-tracked="1" data-visited-explorer-subtab="outdoors" class="visited-card-mini-menu-item visited-explorer-quick-action-item" data-visited-explorer-notes="outdoors:Nature_Locations:0:mock adventure spot alpha">Add Notes</button>
      - unexpected value "hidden"

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic:
    - generic "Click to expand/collapse errors":
      - generic:
        - generic: ⚠️ Errors Detected
        - generic: "50"
        - generic: "Overlay: OK"
      - generic: ▼
  - generic:
    - generic "Click to expand/collapse":
      - generic:
        - text: 🔧 Advanced Debug Console
        - generic: "Startup timing: interactive 119 ms | overlay off 470 ms"
        - generic: "Reliability: blocked 0 | overlays 0 | recoveries 0 | errors 0"
      - generic:
        - button "📋 Copy All"
        - button "🔗 Copy Card Bundle"
        - button "🗑️ Clear"
        - button "↓ Minimize"
  - banner [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]: Kyle’s Adventure Finder
      - generic [ref=e5]: Powered by Excel, enhanced with Google data and mobile-friendly design.
    - generic [ref=e6]:
      - generic [ref=e7]:
        - button "🔄 Reload App" [ref=e8] [cursor=pointer]
        - button "📝 Edit Mode" [ref=e9] [cursor=pointer]
        - button "📴 Offline Mode" [ref=e10] [cursor=pointer]
        - button "💾 App Backup" [ref=e11] [cursor=pointer]
        - button "🩺 Diagnostics" [ref=e12] [cursor=pointer]
        - button "📺 TV Mode" [ref=e13] [cursor=pointer]
        - button "📱 iPhone View" [ref=e14] [cursor=pointer]
        - generic [ref=e15]:
          - generic [ref=e16]: All Changes Synced
          - button "Retry Sync" [disabled]
        - button "Sign In" [ref=e17] [cursor=pointer]
        - button "Sign In via Device" [ref=e18] [cursor=pointer]
      - generic [ref=e19]: Not signed in
  - status [ref=e20]:
    - generic [ref=e21]: "🔐 Sign in required: connect your Microsoft account to load Excel data and use core app features."
    - button "Sign In Now" [ref=e22] [cursor=pointer]
  - generic [ref=e23]:
    - generic [ref=e24]:
      - button "🎮 Adventure Challenge" [ref=e25] [cursor=pointer]
      - button "🌿 Nature Challenge" [ref=e26] [cursor=pointer]
      - button "🏔️ Adventure Planner" [ref=e27] [cursor=pointer]
      - button "🧰 Household Tools" [ref=e28] [cursor=pointer]
      - button "🐦 Birding Locations" [ref=e29] [cursor=pointer]
      - button "🚴 Bike Trails" [ref=e30] [cursor=pointer]
    - tablist "Adventure Challenge categories" [ref=e34]:
      - tab "Open Outdoors section" [selected] [ref=e35] [cursor=pointer]: 🌲 Outdoors
      - tab "Open Entertainment section" [ref=e36] [cursor=pointer]: 🎬 Entertainment
      - tab "Open Food and Drink section" [ref=e37] [cursor=pointer]: 🍽️ Food & Drink
      - tab "Open Retail section" [ref=e38] [cursor=pointer]: 🛍️ Retail
      - tab "Open Wildlife and Animals section" [ref=e39] [cursor=pointer]: 🦌 Wildlife & Animals
      - tab "Open Regional Festivals section" [ref=e40] [cursor=pointer]: 🎉 Regional Festivals
      - tab "Open Bike Trails section" [ref=e41] [cursor=pointer]: 🚴 Bike Trails
    - generic [ref=e42]:
      - text: ▾
      - generic [ref=e44]:
        - heading "Adventure Challenge - Outdoors" [level=1] [ref=e46]
        - generic [ref=e47]: 🌲 Outdoors section active
        - tabpanel "Open Outdoors section" [ref=e48]:
          - text: "3"
          - generic [ref=e49]:
            - generic [ref=e50]:
              - generic [ref=e51]:
                - button "← Back to Outdoors" [ref=e52] [cursor=pointer]
                - generic [ref=e53]:
                  - generic [ref=e54]: 🌲 Explore the Outdoors
                  - generic [ref=e55]:
                    - text: Directory sourced from
                    - code [ref=e56]: Nature_Locations.xlsx
                    - text: /
                    - code [ref=e57]: Nature_Locations
                    - text: .
              - generic [ref=e58]:
                - textbox "Search outdoor locations" [ref=e59]:
                  - /placeholder: Search by name, description or tags…
                - group "Quick tag filters" [ref=e60]:
                  - button "scenic 2" [ref=e61] [cursor=pointer]:
                    - text: scenic
                    - generic: "2"
                  - button "hiking 1" [ref=e62] [cursor=pointer]:
                    - text: hiking
                    - generic: "1"
                  - button "coffee 1" [ref=e63] [cursor=pointer]:
                    - text: coffee
                    - generic: "1"
                  - button "outdoors 1" [ref=e64] [cursor=pointer]:
                    - text: outdoors
                    - generic: "1"
                  - button "park 1" [ref=e65] [cursor=pointer]:
                    - text: park
                    - generic: "1"
              - group [ref=e66]:
                - generic "⚙️ Advanced Filters ▸" [ref=e67] [cursor=pointer]
                - 'option "Sort: Name A-Z" [selected]'
                - 'option "Sort: Name Z-A"'
                - 'option "Sort: City A-Z"'
                - 'option "Sort: State A-Z"'
                - 'option "State: All" [selected]'
                - option "NC"
                - option "TX"
                - 'option "City: All" [selected]'
                - option "Austin"
                - option "Boone"
              - generic [ref=e68]: 3 of 3 outdoor locations shown.
              - generic [ref=e69]:
                - generic [ref=e70]:
                  - strong [ref=e71]: Plan a Route
                  - generic [ref=e72]: 0 selected
                  - button "Generate Route" [ref=e73] [cursor=pointer]
                  - button "Share Itinerary" [ref=e74] [cursor=pointer]
                - generic [ref=e75]: Select at least 2 locations to build an optimized driving route.
            - generic [ref=e76]:
              - generic [ref=e77]:
                - generic [ref=e78]:
                  - generic [ref=e79]:
                    - generic "Not visited yet" [ref=e80]: ⭕
                    - text: Mock Adventure Spot Alpha
                  - generic [ref=e81]:
                    - generic [ref=e82]:
                      - checkbox "Route" [ref=e83]
                      - text: Route
                    - button "Details" [ref=e84] [cursor=pointer]
                    - button "Filters for Mock Adventure Spot Alpha" [ref=e85] [cursor=pointer]: 🔍 Filters
                    - button "Quick actions ▾" [active] [ref=e86] [cursor=pointer]
                - generic [ref=e87]:
                  - button "★ Favorited" [ref=e88] [cursor=pointer]
                  - group "My star rating" [ref=e89]:
                    - button "Set rating to 1 stars" [ref=e90] [cursor=pointer]: ★
                    - button "Set rating to 2 stars" [ref=e91] [cursor=pointer]: ★
                    - button "Set rating to 3 stars" [ref=e92] [cursor=pointer]: ★
                    - button "Set rating to 4 stars" [ref=e93] [cursor=pointer]: ★
                    - button "Set rating to 5 stars" [ref=e94] [cursor=pointer]: ★
                - generic [ref=e95]:
                  - strong [ref=e96]: "Estimated Drive Time:"
                  - text: 22 min
                - strong [ref=e98]: "Tags:"
                - generic [ref=e99]:
                  - button "hiking" [ref=e100] [cursor=pointer]
                  - button "scenic" [ref=e101] [cursor=pointer]
                - generic [ref=e102]:
                  - strong [ref=e103]: "Physical Address - City - State:"
                  - generic [ref=e104]:
                    - generic [ref=e105]: Address not specified
                    - button "Address actions ▾" [ref=e106] [cursor=pointer]
                - generic [ref=e107]:
                  - strong [ref=e108]: "Description:"
                  - generic [ref=e109]: No description yet.
              - generic [ref=e110]:
                - generic [ref=e111]:
                  - generic [ref=e112]:
                    - generic "Not visited yet" [ref=e113]: ⭕
                    - text: Mock Adventure Spot Beta
                  - generic [ref=e114]:
                    - generic [ref=e115]:
                      - checkbox "Route" [ref=e116]
                      - text: Route
                    - button "Details" [ref=e117] [cursor=pointer]
                    - button "Filters for Mock Adventure Spot Beta" [ref=e118] [cursor=pointer]: 🔍 Filters
                    - button "Quick actions ▾" [ref=e119] [cursor=pointer]
                - generic [ref=e120]:
                  - button "☆ Add to Favorites" [ref=e121] [cursor=pointer]
                  - group "My star rating" [ref=e122]:
                    - button "Set rating to 1 stars" [ref=e123] [cursor=pointer]: ★
                    - button "Set rating to 2 stars" [ref=e124] [cursor=pointer]: ★
                    - button "Set rating to 3 stars" [ref=e125] [cursor=pointer]: ★
                    - button "Set rating to 4 stars" [ref=e126] [cursor=pointer]: ★
                    - button "Set rating to 5 stars" [ref=e127] [cursor=pointer]: ★
                - generic [ref=e128]:
                  - strong [ref=e129]: "Estimated Drive Time:"
                  - text: 34 min
                - strong [ref=e131]: "Tags:"
                - generic [ref=e132]:
                  - button "coffee" [ref=e133] [cursor=pointer]
                  - button "outdoors" [ref=e134] [cursor=pointer]
                - generic [ref=e135]:
                  - strong [ref=e136]: "Physical Address - City - State:"
                  - generic [ref=e137]:
                    - button "456 Summit Road - Boone - NC" [ref=e138] [cursor=pointer]
                    - button "Address actions ▾" [ref=e139] [cursor=pointer]
                - generic [ref=e140]:
                  - strong [ref=e141]: "Description:"
                  - generic [ref=e142]: Playwright-seeded beta location for details flow validation.
              - generic [ref=e143]:
                - generic [ref=e144]:
                  - generic [ref=e145]:
                    - generic "Not visited yet" [ref=e146]: ⭕
                    - text: Mock Adventure Spot Gamma
                  - generic [ref=e147]:
                    - generic [ref=e148]:
                      - checkbox "Route" [ref=e149]
                      - text: Route
                    - button "Details" [ref=e150] [cursor=pointer]
                    - button "Filters for Mock Adventure Spot Gamma" [ref=e151] [cursor=pointer]: 🔍 Filters
                    - button "Quick actions ▾" [ref=e152] [cursor=pointer]
                - generic [ref=e153]:
                  - button "☆ Add to Favorites" [ref=e154] [cursor=pointer]
                  - group "My star rating" [ref=e155]:
                    - button "Set rating to 1 stars" [ref=e156] [cursor=pointer]: ★
                    - button "Set rating to 2 stars" [ref=e157] [cursor=pointer]: ★
                    - button "Set rating to 3 stars" [ref=e158] [cursor=pointer]: ★
                    - button "Set rating to 4 stars" [ref=e159] [cursor=pointer]: ★
                    - button "Set rating to 5 stars" [ref=e160] [cursor=pointer]: ★
                - generic [ref=e161]:
                  - strong [ref=e162]: "Estimated Drive Time:"
                  - text: 41 min
                - strong [ref=e164]: "Tags:"
                - generic [ref=e165]:
                  - button "scenic" [ref=e166] [cursor=pointer]
                  - button "park" [ref=e167] [cursor=pointer]
                - generic [ref=e168]:
                  - strong [ref=e169]: "Physical Address - City - State:"
                  - generic [ref=e170]:
                    - button "789 Creekside Drive - Austin - TX" [ref=e171] [cursor=pointer]
                    - button "Address actions ▾" [ref=e172] [cursor=pointer]
                - generic [ref=e173]:
                  - strong [ref=e174]: "Description:"
                  - generic [ref=e175]: Playwright-seeded gamma location for details flow validation.
        - text: ▸ ▸ ▸ ▸ ▸
        - group "🧰 Diagnostics, Sync and Clean Up" [ref=e176]:
          - generic "🧰 Diagnostics, Sync and Clean Up Sync health, local queue visibility, and visited tracker diagnostics. ▾" [ref=e177] [cursor=pointer]:
            - generic [ref=e178]:
              - generic [ref=e179]: 🧰 Diagnostics, Sync and Clean Up
              - generic [ref=e180]: Sync health, local queue visibility, and visited tracker diagnostics.
            - text: ▾
          - option "Strict (Place ID + exact name)"
          - option "Balanced (Place ID + exact + fuzzy)" [selected]
          - option "Name Only (exact + fuzzy)"
  - 'button "TV Mode: OFF" [ref=e181] [cursor=pointer]'
  - button "Quick Add a place" [ref=e183] [cursor=pointer]:
    - generic: ＋
  - dialog "Quick Add a place" [ref=e184]:
    - generic [ref=e186]: ⚡ Quick Add
    - generic [ref=e187]:
      - generic [ref=e188]:
        - generic [ref=e189]: Place Name *
        - textbox "Place Name *" [ref=e190]:
          - /placeholder: e.g. Congaree National Park
      - generic [ref=e191]:
        - generic [ref=e192]: Website or Google Maps URL
        - textbox "Website or Google Maps URL" [ref=e193]:
          - /placeholder: https://...
      - generic [ref=e194]:
        - generic [ref=e195]: Photo URL (optional)
        - textbox "Photo URL (optional)" [ref=e196]:
          - /placeholder: https://...
      - generic [ref=e197]:
        - generic [ref=e198]: Quick Note
        - textbox "Quick Note" [ref=e199]:
          - /placeholder: Any quick thoughts...
      - generic [ref=e200]:
        - button "💾 Save to Inbox" [ref=e201] [cursor=pointer]
        - button "Cancel" [ref=e202] [cursor=pointer]
  - button "Deployment 2026.04.23.live-debug.1 | Apr 29, 2026, 8:00 PM (17h ago) | 4/4" [ref=e204] [cursor=pointer]
  - generic: Back to Outdoors
```

# Test source

```ts
  419 |       if (!panelVisibleAfterFirstClick) {
  420 |         await inlineEditBtn.click();
  421 |       }
  422 |       await expect(inlineEditPanel).toBeVisible({ timeout: 10000 });
  423 |       await plannerDetailsFrameLocator.locator('#inlineEdit_hoursOfOperation').fill('11:00 AM - 9:00 PM');
  424 |       await expect(plannerDetailsFrameLocator.locator('#detailInlineEditDirtyCount')).toContainText('1 field changed');
  425 |       await expect(plannerDetailsFrameLocator.locator('[data-detail-field-card="hoursOfOperation"]')).toHaveClass(/is-dirty/);
  426 | 
  427 |       await withLiveDetailsFrame(detailsFrame, (liveFrame) => liveFrame.evaluate(() => {
  428 |         window.__inlineEditConfirmPrompts = [];
  429 |         window.__inlineEditConfirmResponses = [false, true];
  430 |         window.confirm = (message) => {
  431 |           const text = String(message || '');
  432 |           window.__inlineEditConfirmPrompts.push(text);
  433 |           const next = window.__inlineEditConfirmResponses.shift();
  434 |           return Boolean(next);
  435 |         };
  436 |       }));
  437 | 
  438 |       await plannerDetailsFrameLocator.locator('#tabs .tab-btn[data-tab="notes"]').click();
  439 |       await expect(plannerDetailsFrameLocator.locator('#pane-details[aria-hidden="false"]')).toBeVisible();
  440 |       await expect(plannerDetailsFrameLocator.locator('#detailInlineEditPanel')).toBeVisible();
  441 |       const firstPrompt = await withLiveDetailsFrame(detailsFrame, (liveFrame) => liveFrame.evaluate(() => String((window.__inlineEditConfirmPrompts || [])[0] || '')));
  442 |       if (firstPrompt) {
  443 |         expect(firstPrompt).toContain('unsaved inline field edits');
  444 |       }
  445 | 
  446 |       await withLiveDetailsFrame(detailsFrame, (liveFrame) => liveFrame.evaluate(() => {
  447 |         window.__inlineEditConfirmResponses = [true];
  448 |       }));
  449 |       await activateDetailsTab(detailsFrame, plannerDetailsFrameLocator, 'notes');
  450 | 
  451 |       await activateDetailsTab(detailsFrame, plannerDetailsFrameLocator, 'details');
  452 |       await expect(plannerDetailsFrameLocator.locator('#detailInlineEditPanel')).toBeVisible();
  453 |       const saveInlineBtn = plannerDetailsFrameLocator.locator('#inlineEditSaveBtn');
  454 |       await expect(saveInlineBtn).toBeEnabled();
  455 |       await withLiveDetailsFrame(detailsFrame, (liveFrame) => liveFrame.evaluate(async () => {
  456 |         if (typeof window.saveInlineEditFields === 'function') {
  457 |           await window.saveInlineEditFields();
  458 |           return;
  459 |         }
  460 |         const btn = document.getElementById('inlineEditSaveBtn');
  461 |         if (btn && typeof btn.click === 'function') btn.click();
  462 |       }));
  463 |       const clearedDirtyState = await expect.poll(async () => {
  464 |         const frameHandleNow = await detailsFrame.elementHandle();
  465 |         const liveFrameNow = frameHandleNow ? await frameHandleNow.contentFrame() : null;
  466 |         if (!liveFrameNow) return true;
  467 |         return liveFrameNow.evaluate(() => {
  468 |           const card = document.querySelector('[data-detail-field-card="hoursOfOperation"]');
  469 |           return !card || !card.classList.contains('is-dirty');
  470 |         });
  471 |       }, { timeout: 15000 }).toBe(true).then(() => true).catch(() => false);
  472 | 
  473 |       if (!clearedDirtyState) {
  474 |         await withLiveDetailsFrame(detailsFrame, (liveFrame) => liveFrame.evaluate(async () => {
  475 |           if (typeof window.saveInlineEditFields === 'function') {
  476 |             await window.saveInlineEditFields();
  477 |             return;
  478 |           }
  479 |           const btn = document.getElementById('inlineEditSaveBtn');
  480 |           if (btn && typeof btn.click === 'function') btn.click();
  481 |         }));
  482 |       }
  483 | 
  484 |       await expect.poll(async () => {
  485 |         const frameHandleNow = await detailsFrame.elementHandle();
  486 |         const liveFrameNow = frameHandleNow ? await frameHandleNow.contentFrame() : null;
  487 |         if (!liveFrameNow) return true;
  488 |         return liveFrameNow.evaluate(() => {
  489 |           const card = document.querySelector('[data-detail-field-card="hoursOfOperation"]');
  490 |           return !card || !card.classList.contains('is-dirty');
  491 |         });
  492 |       }, { timeout: 15000 }).toBe(true);
  493 |     }
  494 | 
  495 |     await expect(page.locator('#visitedExplorerDetailsModal')).toBeHidden();
  496 | 
  497 |     const backBtn = paneRoot
  498 |       .locator(`[data-visited-subtab-action="close-explorer-details-${key}"]`)
  499 |       .first();
  500 |     await expect(backBtn).toBeVisible();
  501 |     await backBtn.click();
  502 | 
  503 |     await expect(detailsView).toBeHidden();
  504 |     await expect(explorerView).toBeVisible();
  505 |     await expect(page.locator(`#visitedExplorerList-${key}`)).toBeVisible();
  506 | 
  507 |     await quickActionsBtn.click();
  508 |     const tagMenuBtn = firstCard.locator('[data-visited-explorer-quick-actions-menu] [data-visited-explorer-tags]').first();
  509 |     if (!(await tagMenuBtn.isVisible())) await quickActionsBtn.click();
  510 |     await expect(tagMenuBtn).toBeVisible();
  511 |     await tagMenuBtn.click();
  512 |     await expect(detailsView).toBeVisible();
  513 |     await expect(page.locator(`#visitedExplorerDetailsFrame-${key}`)).toHaveAttribute('src', /initialTab=tag-management/i);
  514 |     await backBtn.click();
  515 | 
  516 |     await quickActionsBtn.click();
  517 |     const notesMenuBtn = firstCard.locator('[data-visited-explorer-quick-actions-menu] [data-visited-explorer-notes]').first();
  518 |     if (!(await notesMenuBtn.isVisible())) await quickActionsBtn.click();
> 519 |     await expect(notesMenuBtn).toBeVisible();
      |                                ^ Error: expect(locator).toBeVisible() failed
  520 |     await notesMenuBtn.click();
  521 |     await expect(detailsView).toBeVisible();
  522 |     await expect(page.locator(`#visitedExplorerDetailsFrame-${key}`)).toHaveAttribute('src', /initialTab=notes/i);
  523 |   });
  524 | 
  525 |   test('details enrich modal auto-fetches Google fields and saves them through explorer sync', async ({ page }) => {
  526 |     await mockExplorerWorkbookRequests(page);
  527 |     await gotoAdventureChallenge(page);
  528 | 
  529 |     const { key } = await openExplorerAndFindDetails(page);
  530 |     const list = page.locator(`#visitedExplorerList-${key}`);
  531 |     const firstCard = list.locator('.visited-explorer-card').first();
  532 |     await firstCard.locator('[data-visited-explorer-details]').first().click();
  533 | 
  534 |     const detailsFrame = page.locator(`#visitedExplorerDetailsFrame-${key}`);
  535 |     await expect(detailsFrame).toBeVisible();
  536 |     const plannerDetailsFrameLocator = page.frameLocator(`#visitedExplorerDetailsFrame-${key}`);
  537 | 
  538 |     await page.evaluate(() => {
  539 |       window.getPlaceDetails = async () => ({
  540 |         address: '1600 Amphitheatre Parkway, Mountain View, CA 94043',
  541 |         phone: '(650) 253-0000',
  542 |         hours: { Monday: '8:00 AM – 5:00 PM', Tuesday: '8:00 AM – 5:00 PM' },
  543 |         description: 'A Google-fetched enriched description for Playwright verification.',
  544 |         reviews: []
  545 |       });
  546 |       window.__lastExplorerEnrichUpdates = null;
  547 |       window.syncVisitedExplorerDetailFields = async (_sourceMeta, updates) => {
  548 |         window.__lastExplorerEnrichUpdates = updates;
  549 |         return { synced: true, excelSaved: true, reason: 'saved' };
  550 |       };
  551 |     });
  552 | 
  553 |     await expect(plannerDetailsFrameLocator.locator('#abEnrichBtn')).toBeVisible();
  554 |     await plannerDetailsFrameLocator.locator('#abEnrichBtn').click();
  555 |     await expect(plannerDetailsFrameLocator.locator('#enrichModal.open')).toBeVisible();
  556 | 
  557 |     const frameHandle = await detailsFrame.elementHandle();
  558 |     const liveFrame = frameHandle ? await frameHandle.contentFrame() : null;
  559 |     expect(liveFrame).not.toBeNull();
  560 | 
  561 |     // Reset persisted nearby filters so prior test state cannot hide fresh results.
  562 |     await liveFrame.evaluate(() => {
  563 |       var defaults = { radiusMiles: 5, category: 'all', minRating: 0, openNow: false, timeBudgetHours: 0 };
  564 |       try {
  565 |         localStorage.removeItem('__detail_nearby_ui_prefs_v3');
  566 |       } catch (_storageErr) {
  567 |         // Ignore storage availability issues in hardened test environments.
  568 |       }
  569 |       if (typeof window.persistNearbyUiState === 'function') {
  570 |         window.persistNearbyUiState(defaults);
  571 |       } else {
  572 |         window.__detailNearbyUiState = defaults;
  573 |       }
  574 |     });
  575 |     await liveFrame.evaluate(() => {
  576 |       if (window.__detailEnrichModalState && window.__detailEnrichModalState.data) {
  577 |         window.__detailEnrichModalState.data.googlePlaceId = 'ChIJPlaywrightEnrich123';
  578 |       }
  579 |     });
  580 | 
  581 |     await forceOpenEnrichPasteBody(detailsFrame);
  582 |     await expect(plannerDetailsFrameLocator.locator('#enrichPasteBody')).toHaveClass(/open/);
  583 |     await expect(plannerDetailsFrameLocator.locator('#enrichAutoFetchBtn')).toBeVisible();
  584 |     await clickDetailsControl(detailsFrame, '#enrichAutoFetchBtn');
  585 |     await expect(plannerDetailsFrameLocator.locator('#enrichAddress')).toHaveValue(/Amphitheatre Parkway/i);
  586 |     await expect(plannerDetailsFrameLocator.locator('#enrichPhone')).toHaveValue(/253-0000/);
  587 |     await expect(plannerDetailsFrameLocator.locator('#enrichHours')).toHaveValue(/Monday:/i);
  588 |     await expect(plannerDetailsFrameLocator.locator('#enrichDescription')).toHaveValue(/Google-fetched enriched description/i);
  589 | 
  590 |     await clickDetailsControl(detailsFrame, '#enrichSaveBtn');
  591 |     await expect.poll(() => page.evaluate(() => window.__lastExplorerEnrichUpdates), { timeout: 10000 }).toMatchObject({
  592 |       address: '1600 Amphitheatre Parkway, Mountain View, CA 94043',
  593 |       description: 'A Google-fetched enriched description for Playwright verification.'
  594 |     });
  595 |   });
  596 | 
  597 |   test('details window formats JSON hours payload into readable text', async ({ page }) => {
  598 |     const detailKey = `playwright_detail_hours_json_${Date.now()}`;
  599 |     const payload = {
  600 |       data: {
  601 |         name: 'Playwright Hours Payload Spot',
  602 |         city: 'Austin',
  603 |         state: 'TX',
  604 |         hoursOfOperation: JSON.stringify({
  605 |           periods: [
  606 |             { open: { day: 1, hour: 9, minute: 0 }, close: { day: 1, hour: 18, minute: 0 } },
  607 |             { open: { day: 2, hour: 9, minute: 0 }, close: { day: 2, hour: 18, minute: 0 } }
  608 |           ],
  609 |           weekdayDescriptions: [
  610 |             'Monday: 9:00 AM - 6:00 PM',
  611 |             'Tuesday: 9:00 AM - 6:00 PM'
  612 |           ]
  613 |         })
  614 |       }
  615 |     };
  616 | 
  617 |     await page.addInitScript(({ seededDetailKey, seededPayload }) => {
  618 |       localStorage.setItem(seededDetailKey, JSON.stringify(seededPayload));
  619 |       localStorage.setItem('adventure_details_latest', seededDetailKey);
```