const { test, expect } = require('./reliability-test');

const FESTIVALS_SCHEMA = ['Description', 'Name', 'Address', 'City', 'State', 'Official Website', 'Phone Number', 'Rating', 'Directions', 'Google Place ID', 'Google URL'];

function buildResolvedByPlaceId(placeId) {
  const safeId = String(placeId || '').trim();
  const slug = safeId.replace(/^pid-/, '') || 'item';
  const label = slug.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  return {
    placeId: safeId,
    name: `Name ${label}`,
    address: `${label} Address, Denver, CO`,
    website: `https://${slug}.example.com`,
    businessType: `tag-${slug}`,
    hours: `9-5 ${label}`,
    phone: '555-1000',
    rating: '4.8',
    userRatingsTotal: 88,
    directions: `https://maps.example.com/${slug}`
  };
}

async function installMocks(context, graphCalls) {
  await context.route('https://graph.microsoft.com/**', async (route) => {
    const request = route.request();
    const method = request.method();
    const url = request.url();

    if (url.includes('/columns')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          value: FESTIVALS_SCHEMA.map((name, index) => ({ name, index }))
        })
      });
      return;
    }

    if (method === 'GET' && url.includes('/rows')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ value: [{ values: [new Array(FESTIVALS_SCHEMA.length).fill('')] }] })
      });
      return;
    }

    if (method === 'POST' && url.includes('/rows')) {
      graphCalls.push({
        url,
        body: JSON.parse(request.postData() || '{}')
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true })
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ value: [] })
    });
  });
}

test.describe('Edit Mode single-add candidate search', () => {
  test('searches candidates and adds the selected candidate using existing single-add flow', async ({ page }) => {
    const graphCalls = [];
    await installMocks(page.context(), graphCalls);

    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.buildExcelRow === 'function' && typeof window.addRowToExcel === 'function', null, { timeout: 15000 });
    await page.evaluate(() => {
      window.accessToken = 'playwright-mock-token';
      window.showToast = () => {};
      window.renderAdventureCards = async () => {};
      window.FilterManager = { applyAllFilters() {}, renderQuickFilterCounts() {} };
      window.normalizeOperationHours = (value) => String(value || '');
      window.searchPlaces = async (query) => {
        const q = String(query || '').trim().toLowerCase();
        if (!q) return [];
        return [
          {
            placeId: 'pid-apple-festival-main',
            name: 'Apple Festival Main Grounds',
            address: '101 Orchard Ave, Denver, CO',
            rating: 4.8,
            reviewCount: 420,
            businessStatus: 'OPERATIONAL'
          },
          {
            placeId: 'pid-apple-festival-river',
            name: 'Apple Festival Riverfront',
            address: '9 River St, Denver, CO',
            rating: 4.6,
            reviewCount: 131,
            businessStatus: 'OPERATIONAL'
          }
        ];
      };
    });

    const popupPromise = page.waitForEvent('popup');
    await page.evaluate(() => window.open('/HTML%20Files/edit-mode-enhanced.html', '_blank'));
    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');
    await popup.waitForFunction(() => {
      const select = document.getElementById('actionTargetSelect');
      return select && select.options.length >= 7;
    }, null, { timeout: 10000 });

    await popup.evaluate(() => {
      window.showToast = () => {};
      window.resolvePlaceInputWithGoogleData = async (_inputType, inputValue) => {
        const placeId = String(inputValue || '').trim();
        const slug = placeId.replace(/^pid-/, '') || 'item';
        const titleCase = slug.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
        return {
          placeId,
          ...({
            name: `Name ${titleCase}`,
            address: `${titleCase} Address, Denver, CO`,
            website: `https://${slug}.example.com`,
            businessType: `tag-${slug}`,
            hours: `9-5 ${titleCase}`,
            phone: '555-1000',
            rating: '4.8',
            userRatingsTotal: 88,
            directions: `https://maps.example.com/${slug}`
          })
        };
      };
    });

    await popup.selectOption('#actionTargetSelect', 'ent_festivals');
    await popup.selectOption('#singleInputType', 'placeName');
    await popup.fill('#singleInput', 'apple festival');
    await popup.click('button:has-text("Search Candidates")');

    await expect(popup.locator('#single-candidates .candidate-item')).toHaveCount(2);
    await expect(popup.locator('#single-search-status')).toContainText('Found 2 match');

    await popup.locator('#single-candidates .candidate-item').nth(1).click();
    await popup.click('#singleAddSelectedCandidateBtn');

    await expect.poll(() => graphCalls.length, { timeout: 10000 }).toBe(1);

    const row = graphCalls[0].body.values[0];
    const resolved = buildResolvedByPlaceId('pid-apple-festival-river');
    expect(row).toHaveLength(FESTIVALS_SCHEMA.length);
    expect(row[1]).toBe(resolved.name);
    expect(row[2]).toBe(resolved.address);
    expect(row[5]).toBe(resolved.website);
    expect(row[9]).toBe(resolved.placeId);
    expect(String(row[10] || '')).toContain(resolved.placeId);
  });

  test('bulk candidate review lets user choose matches, then add selected candidates', async ({ page }) => {
    const graphCalls = [];
    await installMocks(page.context(), graphCalls);

    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.buildExcelRow === 'function' && typeof window.addRowToExcel === 'function', null, { timeout: 15000 });
    await page.evaluate(() => {
      window.accessToken = 'playwright-mock-token';
      window.showToast = () => {};
      window.renderAdventureCards = async () => {};
      window.FilterManager = { applyAllFilters() {}, renderQuickFilterCounts() {} };
      window.normalizeOperationHours = (value) => String(value || '');
      window.searchPlaces = async (query) => {
        const q = String(query || '').trim().toLowerCase();
        if (q === 'apple festival') {
          return [
            {
              placeId: 'pid-apple-festival-main',
              name: 'Apple Festival Main Grounds',
              address: '101 Orchard Ave, Denver, CO',
              rating: 4.8,
              reviewCount: 420,
              businessStatus: 'OPERATIONAL'
            },
            {
              placeId: 'pid-apple-festival-river',
              name: 'Apple Festival Riverfront',
              address: '9 River St, Denver, CO',
              rating: 4.6,
              reviewCount: 131,
              businessStatus: 'OPERATIONAL'
            }
          ];
        }
        if (q === 'pear fair') {
          return [
            {
              placeId: 'pid-pear-fair-center',
              name: 'Pear Fair Center',
              address: '400 Market St, Denver, CO',
              rating: 4.7,
              reviewCount: 200,
              businessStatus: 'OPERATIONAL'
            },
            {
              placeId: 'pid-pear-fair-lakeside',
              name: 'Pear Fair Lakeside',
              address: '88 Lake Ave, Denver, CO',
              rating: 4.5,
              reviewCount: 95,
              businessStatus: 'OPERATIONAL'
            }
          ];
        }
        return [];
      };
    });

    const popupPromise = page.waitForEvent('popup');
    await page.evaluate(() => window.open('/HTML%20Files/edit-mode-enhanced.html', '_blank'));
    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');
    await popup.waitForFunction(() => {
      const select = document.getElementById('actionTargetSelect');
      return select && select.options.length >= 7;
    }, null, { timeout: 10000 });

    await popup.evaluate(() => {
      window.showToast = () => {};
      window.resolvePlaceInputWithGoogleData = async (_inputType, inputValue) => {
        const placeId = String(inputValue || '').trim();
        const slug = placeId.replace(/^pid-/, '') || 'item';
        const titleCase = slug.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
        return {
          placeId,
          name: `Name ${titleCase}`,
          address: `${titleCase} Address, Denver, CO`,
          website: `https://${slug}.example.com`,
          businessType: `tag-${slug}`,
          hours: `9-5 ${titleCase}`,
          phone: '555-1000',
          rating: '4.8',
          userRatingsTotal: 88,
          directions: `https://maps.example.com/${slug}`
        };
      };
    });

    await popup.selectOption('#actionTargetSelect', 'ent_festivals');
    await popup.selectOption('#bulkInputType', 'placeName');
    await popup.fill('#bulkInput', 'apple festival\npear fair');
    await popup.click('button:has-text("Search Bulk Candidates")');

    await expect(popup.locator('#bulk-candidates .candidate-group')).toHaveCount(2);
    await expect(popup.locator('#bulk-candidates .candidate-item')).toHaveCount(4);
    await expect(popup.locator('#bulk-search-status')).toContainText('Ready: 2 selection');

    await popup.locator('[data-bulk-group-index="1"][data-bulk-candidate-index="1"]').click();
    await popup.click('#bulkAddSelectedCandidatesBtn');

    await expect.poll(() => graphCalls.length, { timeout: 10000 }).toBe(2);

    const firstRow = graphCalls[0].body.values[0];
    const secondRow = graphCalls[1].body.values[0];
    const firstResolved = buildResolvedByPlaceId('pid-apple-festival-main');
    const secondResolved = buildResolvedByPlaceId('pid-pear-fair-lakeside');

    expect(firstRow[1]).toBe(firstResolved.name);
    expect(firstRow[9]).toBe(firstResolved.placeId);
    expect(String(firstRow[10] || '')).toContain(firstResolved.placeId);

    expect(secondRow[1]).toBe(secondResolved.name);
    expect(secondRow[9]).toBe(secondResolved.placeId);
    expect(String(secondRow[10] || '')).toContain(secondResolved.placeId);
  });

  test('chain candidate review applies chain-biased ranking and multi-select before add', async ({ page }) => {
    const graphCalls = [];
    await installMocks(page.context(), graphCalls);

    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.buildExcelRow === 'function' && typeof window.addRowToExcel === 'function', null, { timeout: 15000 });
    await page.evaluate(() => {
      window.accessToken = 'playwright-mock-token';
      window.showToast = () => {};
      window.renderAdventureCards = async () => {};
      window.FilterManager = { applyAllFilters() {}, renderQuickFilterCounts() {} };
      window.normalizeOperationHours = (value) => String(value || '');
      window.searchPlaces = async (query) => {
        const q = String(query || '').trim().toLowerCase();
        if (q === 'starbucks downtown denver') {
          return [
            {
              placeId: 'pid-unknown-coffee-downtown',
              name: 'Unknown Coffee Downtown',
              address: '10 Center St, Denver, CO',
              rating: 4.8,
              reviewCount: 220,
              businessStatus: 'OPERATIONAL'
            },
            {
              placeId: 'pid-starbucks-downtown-denver',
              name: 'Starbucks Downtown Denver',
              address: '1 Main St, Denver, CO',
              rating: 4.6,
              reviewCount: 145,
              businessStatus: 'OPERATIONAL'
            },
            {
              placeId: 'pid-starbucks-17th-denver',
              name: 'Starbucks 17th Street',
              address: '1700 17th St, Denver, CO',
              rating: 4.5,
              reviewCount: 110,
              businessStatus: 'OPERATIONAL'
            }
          ];
        }
        if (q === 'starbucks airport denver') {
          return [
            {
              placeId: 'pid-airport-coffee-hub',
              name: 'Airport Coffee Hub',
              address: '8500 Pena Blvd, Denver, CO',
              rating: 4.4,
              reviewCount: 80,
              businessStatus: 'OPERATIONAL'
            },
            {
              placeId: 'pid-starbucks-airport-denver',
              name: 'Starbucks Airport Denver',
              address: '8500 Pena Blvd Unit B, Denver, CO',
              rating: 4.5,
              reviewCount: 120,
              businessStatus: 'OPERATIONAL'
            }
          ];
        }
        return [];
      };
    });

    const popupPromise = page.waitForEvent('popup');
    await page.evaluate(() => window.open('/HTML%20Files/edit-mode-enhanced.html', '_blank'));
    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');
    await popup.waitForFunction(() => {
      const select = document.getElementById('actionTargetSelect');
      return select && select.options.length >= 7;
    }, null, { timeout: 10000 });

    await popup.evaluate(() => {
      window.showToast = () => {};
      window.resolvePlaceInputWithGoogleData = async (_inputType, inputValue) => {
        const placeId = String(inputValue || '').trim();
        const slug = placeId.replace(/^pid-/, '') || 'item';
        const titleCase = slug.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
        return {
          placeId,
          name: `Name ${titleCase}`,
          address: `${titleCase} Address, Denver, CO`,
          website: `https://${slug}.example.com`,
          businessType: `tag-${slug}`,
          hours: `9-5 ${titleCase}`,
          phone: '555-1000',
          rating: '4.8',
          userRatingsTotal: 88,
          directions: `https://maps.example.com/${slug}`
        };
      };
    });

    await popup.selectOption('#actionTargetSelect', 'ent_festivals');
    await popup.selectOption('#chainInputType', 'placeNameCity');
    await popup.fill('#chainInput', 'Starbucks downtown Denver\nStarbucks airport Denver');
    await popup.click('button:has-text("Search Chain Candidates")');

    await expect(popup.locator('#chain-candidates .candidate-group')).toHaveCount(2);
    await expect(popup.locator('#chain-candidates .candidate-item')).toHaveCount(5);
    await expect(popup.locator('#chain-search-status')).toContainText('Ready: 2 selected');
    await expect(popup.locator('#chain-candidates .candidate-count-chip').first()).toContainText('1/3 selected');
    await expect(popup.locator('#chain-cap-help')).toContainText('5 found, 2 currently selected');

    const capOptions = await popup.locator('#chainSelectionCapSelect option').allTextContents();
    expect(capOptions.join(' | ')).toContain('Top 3');
    expect(capOptions.join(' | ')).toContain('Top 5');
    expect(capOptions.join(' | ')).toContain('All found (5)');
    expect(capOptions.join(' | ')).toContain('All selected (2)');

    // All found auto-selects every ranked candidate.
    await popup.selectOption('#chainSelectionCapSelect', 'all-found');
    await expect(popup.locator('#chain-candidates .candidate-count-chip').first()).toContainText('3/3 selected');
    await expect(popup.locator('#chain-candidates .candidate-count-chip').nth(1)).toContainText('2/2 selected');

    const firstTopName = await popup.locator('#chain-candidates .candidate-group').nth(0).locator('.candidate-item .candidate-title').first().innerText();
    expect(firstTopName.toLowerCase()).toContain('starbucks');

    // Return to normal curated mode for the rest of this flow.
    await popup.selectOption('#chainSelectionCapSelect', 'all-selected');
    await popup.click('#chainSelectTopMatchesBtn');
    await popup.check('#chainCandidateMultiSelect');
    await popup.locator('[data-chain-group-index="0"][data-chain-candidate-index="2"]').click();
    await expect(popup.locator('#chain-candidates .candidate-count-chip').first()).toContainText('2/3 selected');

    // Verify quick action restores top-only selection for each query.
    await popup.click('#chainSelectTopMatchesBtn');
    await expect(popup.locator('#chain-candidates .candidate-count-chip').first()).toContainText('1/3 selected');
    await popup.check('#chainCandidateMultiSelect');
    await popup.locator('[data-chain-group-index="0"][data-chain-candidate-index="2"]').click();

    // Apply cap before add.
    await popup.selectOption('#chainSelectionCapSelect', '3');
    await popup.click('#chainAddSelectedCandidatesBtn');

    await expect.poll(() => graphCalls.length, { timeout: 12000 }).toBe(3);

    const placeIds = graphCalls.map((call) => String(call.body?.values?.[0]?.[9] || ''));
    expect(placeIds).toContain('pid-starbucks-downtown-denver');
    expect(placeIds).toContain('pid-starbucks-17th-denver');
    expect(placeIds).toContain('pid-starbucks-airport-denver');
  });
});

