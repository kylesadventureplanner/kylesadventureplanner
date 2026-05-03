# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: edit-mode-search-candidates.spec.js >> Edit Mode single-add candidate search >> updates bulk selected-candidate banner to a completed message after the add finishes
- Location: tests/edit-mode-search-candidates.spec.js:312:3

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "Add complete"
Received string:    "      ✅    ✅ Adding 2 selected candidate(s)...  "

Call Log:
- Timeout 15000ms exceeded while waiting on the predicate
```

# Test source

```ts
  279 |           userRatingsTotal: 44,
  280 |           directions: `https://maps.example.com/${placeId}`
  281 |         };
  282 |       };
  283 |     });
  284 | 
  285 |     await popup.selectOption('#actionTargetSelect', 'nature_locations');
  286 |     for (const indicatorId of ['#singleSectionTargetIndicator', '#bulkSectionTargetIndicator', '#chainSectionTargetIndicator']) {
  287 |       await expect(popup.locator(indicatorId)).toContainText('Nature_Locations (Nature_Locations.xlsx)');
  288 |     }
  289 | 
  290 |     await popup.selectOption('#singleInputType', 'placeName');
  291 |     await popup.fill('#singleInput', 'Blue Ridge Trail');
  292 |     await popup.click('#singleSearchCandidatesBtn');
  293 |     await expect(popup.locator('#single-candidates .candidate-item')).toHaveCount(2);
  294 |     await expect(popup.locator('#singleAddSelectedCandidateBtn')).toBeEnabled();
  295 |     await expect(popup.locator('#singleAddSelectedCandidateBtn')).toHaveClass(/is-candidate-cta-ready/);
  296 | 
  297 |     await popup.selectOption('#bulkInputType', 'placeName');
  298 |     await popup.fill('#bulkInput', 'Blue Ridge Trail\nPisgah Overlook');
  299 |     await popup.click('#bulkSearchCandidatesBtn');
  300 |     await expect(popup.locator('#bulk-candidates .candidate-group')).toHaveCount(2);
  301 |     await expect(popup.locator('#bulkAddSelectedCandidatesBtn')).toBeEnabled();
  302 |     await expect(popup.locator('#bulkAddSelectedCandidatesBtn')).toHaveClass(/is-candidate-cta-ready/);
  303 | 
  304 |     await popup.selectOption('#chainInputType', 'placeNameCity');
  305 |     await popup.fill('#chainInput', 'Blue Ridge Trail, Hendersonville\nPisgah Overlook, Asheville');
  306 |     await popup.click('#chainSearchCandidatesBtn');
  307 |     await expect(popup.locator('#chain-candidates .candidate-group')).toHaveCount(2);
  308 |     await expect(popup.locator('#chainAddSelectedCandidatesBtn')).toBeEnabled();
  309 |     await expect(popup.locator('#chainAddSelectedCandidatesBtn')).toHaveClass(/is-candidate-cta-ready/);
  310 |   });
  311 | 
  312 |   test('updates bulk selected-candidate banner to a completed message after the add finishes', async ({ page }) => {
  313 |     const graphCalls = [];
  314 |     await installMocks(page.context(), graphCalls, { postDelayMs: 120 });
  315 | 
  316 |     await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  317 |     await page.waitForFunction(() => typeof window.buildExcelRow === 'function' && typeof window.addRowToExcel === 'function', null, { timeout: 15000 });
  318 |     await page.evaluate(() => {
  319 |       window.accessToken = 'playwright-mock-token';
  320 |       window.showToast = () => {};
  321 |       window.renderAdventureCards = async () => {};
  322 |       window.FilterManager = { applyAllFilters() {}, renderQuickFilterCounts() {} };
  323 |       window.normalizeOperationHours = (value) => String(value || '');
  324 |       window.searchPlaces = async (query) => {
  325 |         const base = String(query || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'item';
  326 |         return [
  327 |           {
  328 |             placeId: `pid-${base}-a`,
  329 |             name: `${base} Alpha`,
  330 |             address: `10 ${base} St, Denver, CO`,
  331 |             rating: 4.7,
  332 |             reviewCount: 99,
  333 |             businessStatus: 'OPERATIONAL',
  334 |             coordinates: { lat: 39.7392, lng: -104.9903 }
  335 |           }
  336 |         ];
  337 |       };
  338 |     });
  339 | 
  340 |     const popup = await openEditModePopup(page);
  341 |     await popup.evaluate(() => {
  342 |       window.showToast = () => {};
  343 |       window.resolvePlaceInputWithGoogleData = async (_inputType, inputValue) => {
  344 |         const placeId = String(inputValue || '').trim();
  345 |         return {
  346 |           placeId,
  347 |           name: `Resolved ${placeId}`,
  348 |           address: `Resolved ${placeId} Address, Denver, CO`,
  349 |           website: `https://${placeId}.example.com`,
  350 |           businessType: 'tag',
  351 |           hours: '9-5',
  352 |           phone: '555-1010',
  353 |           rating: '4.6',
  354 |           userRatingsTotal: 77,
  355 |           directions: `https://maps.example.com/${placeId}`
  356 |         };
  357 |       };
  358 |       // Mock the bulk add handler to return success
  359 |       window.handleBulkAddPlacesWithProgress = async (locations, inputType, statusDiv, dryRun, options) => {
  360 |         return {
  361 |           success: true,
  362 |           added: locations.length,
  363 |           failed: 0,
  364 |           skipped: 0,
  365 |           message: `Successfully added ${locations.length} location(s)`
  366 |         };
  367 |       };
  368 |     });
  369 | 
  370 |     await popup.selectOption('#actionTargetSelect', GENERIC_GOOGLE_CANDIDATE_TARGET);
  371 |     await popup.selectOption('#bulkInputType', 'placeName');
  372 |     await popup.fill('#bulkInput', 'apple festival\nriverfront market');
  373 |     await popup.click('#bulkSearchCandidatesBtn');
  374 | 
  375 |     await expect(popup.locator('#bulkAddSelectedCandidatesBtn')).toBeEnabled();
  376 |     await popup.click('#bulkAddSelectedCandidatesBtn');
  377 | 
  378 |     await expect.poll(() => graphCalls.length, { timeout: 10000 }).toBe(2);
> 379 |     await expect.poll(async () => {
      |     ^ Error: expect(received).toContain(expected) // indexOf
  380 |       return (await popup.locator('#bulk-search-status').textContent()) || '';
  381 |     }, { timeout: 15000 }).toContain('Add complete');
  382 |     await expect.poll(async () => {
  383 |       return (await popup.locator('#bulk-search-status').textContent()) || '';
  384 |     }, { timeout: 15000 }).toContain('General_Entertainment (Entertainment_Locations.xlsx)');
  385 |   });
  386 | 
  387 |   test('single candidate search supports distance/state filters and shows Google-place link', async ({ page }) => {
  388 |     const graphCalls = [];
  389 |     await installMocks(page.context(), graphCalls);
  390 | 
  391 |     await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  392 |     await page.waitForFunction(() => typeof window.buildExcelRow === 'function' && typeof window.addRowToExcel === 'function', null, { timeout: 15000 });
  393 |     await page.evaluate(() => {
  394 |       window.accessToken = 'playwright-mock-token';
  395 |       window.showToast = () => {};
  396 |       window.renderAdventureCards = async () => {};
  397 |       window.FilterManager = { applyAllFilters() {}, renderQuickFilterCounts() {} };
  398 |       window.normalizeOperationHours = (value) => String(value || '');
  399 |       window.searchPlaces = async () => {
  400 |         return [
  401 |           {
  402 |             placeId: 'pid-nearby-nc-festival',
  403 |             name: 'Nearby NC Festival',
  404 |             address: '12 Main St, Hendersonville, NC 28791',
  405 |             rating: 4.9,
  406 |             reviewCount: 310,
  407 |             businessStatus: 'OPERATIONAL',
  408 |             coordinates: { lat: 35.348, lng: -82.46 }
  409 |           },
  410 |           {
  411 |             placeId: 'pid-mid-nc-festival',
  412 |             name: 'Mid NC Festival',
  413 |             address: '300 Brevard Rd, Asheville, NC 28806',
  414 |             rating: 4.5,
  415 |             reviewCount: 210,
  416 |             businessStatus: 'OPERATIONAL',
  417 |             coordinates: { lat: 35.5313, lng: -82.5854 }
  418 |           },
  419 |           {
  420 |             placeId: 'pid-far-sc-festival',
  421 |             name: 'Far SC Festival',
  422 |             address: '500 River Rd, Columbia, SC 29201',
  423 |             rating: 4.4,
  424 |             reviewCount: 120,
  425 |             businessStatus: 'OPERATIONAL',
  426 |             coordinates: { lat: 34.0007, lng: -81.0348 }
  427 |           }
  428 |         ];
  429 |       };
  430 |     });
  431 | 
  432 |     const popup = await openEditModePopup(page);
  433 | 
  434 |     await popup.evaluate(() => {
  435 |       window.showToast = () => {};
  436 |       window.__openedCandidateUrls = [];
  437 |       window.open = (url) => {
  438 |         window.__openedCandidateUrls.push(String(url || ''));
  439 |         return null;
  440 |       };
  441 |       window.resolvePlaceInputWithGoogleData = async (_inputType, inputValue) => {
  442 |         const placeId = String(inputValue || '').trim();
  443 |         const slug = placeId.replace(/^pid-/, '') || 'item';
  444 |         const titleCase = slug.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  445 |         return {
  446 |           placeId,
  447 |           name: `Name ${titleCase}`,
  448 |           address: `${titleCase} Address, Hendersonville, NC 28791`,
  449 |           website: `https://${slug}.example.com`,
  450 |           businessType: `tag-${slug}`,
  451 |           hours: `9-5 ${titleCase}`,
  452 |           phone: '555-1000',
  453 |           rating: '4.8',
  454 |           userRatingsTotal: 88,
  455 |           directions: `https://maps.example.com/${slug}`
  456 |         };
  457 |       };
  458 |     });
  459 | 
  460 |     await popup.selectOption('#actionTargetSelect', GENERIC_GOOGLE_CANDIDATE_TARGET);
  461 |     await popup.selectOption('#candidateDistanceLimitMiles', '25');
  462 |     await popup.selectOption('#candidateStateFilter', 'NC');
  463 |     await popup.selectOption('#singleInputType', 'placeName');
  464 |     await popup.fill('#singleInput', 'festival');
  465 |     await popup.click('#singleSearchCandidatesBtn');
  466 | 
  467 |     await expect(popup.locator('#single-candidates .candidate-item')).toHaveCount(2);
  468 |     await expect(popup.locator('#single-candidates .candidate-results-head')).toContainText('Filters:');
  469 |     await expect(popup.locator('#single-candidates .candidate-results-summary')).toContainText('2 shown');
  470 |     await expect(popup.locator('#single-candidates .candidate-results-head')).toContainText('Sorted by nearest');
  471 |     const candidateItem = popup.locator('#single-candidates .candidate-item').first();
  472 |     await expect(candidateItem.locator('.candidate-title')).toHaveText('Nearby NC Festival');
  473 |     await expect(candidateItem).toContainText('mi from Long John Dr');
  474 |     await expect(candidateItem).toContainText('State: NC');
  475 | 
  476 |     const placeLink = popup.locator('#single-candidates .candidate-open-link').first();
  477 |     await expect(placeLink).toHaveAttribute('href', /google\.com\/maps\/place\/\?q=place_id:/i);
  478 | 
  479 |     await popup.click('#singleAddSelectedCandidateBtn');
```