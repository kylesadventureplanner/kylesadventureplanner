const { test, expect } = require('./reliability-test');

const FESTIVALS_SCHEMA = ['Description', 'Name', 'Address', 'City', 'State', 'Official Website', 'Phone Number', 'Rating', 'Directions', 'Google Place ID', 'Google URL'];
const GENERIC_GOOGLE_CANDIDATE_TARGET = 'ent_general';

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

async function installMocks(context, graphCalls, options = {}) {
  const postDelayMs = Math.max(0, Number(options.postDelayMs) || 0);
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
      if (postDelayMs) {
        await new Promise((resolve) => setTimeout(resolve, postDelayMs));
      }
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
      window.__openedCandidateUrls = [];
      window.open = (url) => {
        window.__openedCandidateUrls.push(String(url || ''));
        return null;
      };
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

    await popup.selectOption('#actionTargetSelect', GENERIC_GOOGLE_CANDIDATE_TARGET);
    await popup.selectOption('#singleInputType', 'placeName');
    await popup.fill('#singleInput', 'apple festival');
    await popup.click('#singleSearchCandidatesBtn');

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

  test('single candidate search supports distance/state filters and shows Google-place link', async ({ page }) => {
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
      window.searchPlaces = async () => {
        return [
          {
            placeId: 'pid-nearby-nc-festival',
            name: 'Nearby NC Festival',
            address: '12 Main St, Hendersonville, NC 28791',
            rating: 4.9,
            reviewCount: 310,
            businessStatus: 'OPERATIONAL',
            coordinates: { lat: 35.348, lng: -82.46 }
          },
          {
            placeId: 'pid-mid-nc-festival',
            name: 'Mid NC Festival',
            address: '300 Brevard Rd, Asheville, NC 28806',
            rating: 4.5,
            reviewCount: 210,
            businessStatus: 'OPERATIONAL',
            coordinates: { lat: 35.5313, lng: -82.5854 }
          },
          {
            placeId: 'pid-far-sc-festival',
            name: 'Far SC Festival',
            address: '500 River Rd, Columbia, SC 29201',
            rating: 4.4,
            reviewCount: 120,
            businessStatus: 'OPERATIONAL',
            coordinates: { lat: 34.0007, lng: -81.0348 }
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
      window.__openedCandidateUrls = [];
      window.open = (url) => {
        window.__openedCandidateUrls.push(String(url || ''));
        return null;
      };
      window.resolvePlaceInputWithGoogleData = async (_inputType, inputValue) => {
        const placeId = String(inputValue || '').trim();
        const slug = placeId.replace(/^pid-/, '') || 'item';
        const titleCase = slug.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
        return {
          placeId,
          name: `Name ${titleCase}`,
          address: `${titleCase} Address, Hendersonville, NC 28791`,
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

    await popup.selectOption('#actionTargetSelect', GENERIC_GOOGLE_CANDIDATE_TARGET);
    await popup.selectOption('#candidateDistanceLimitMiles', '25');
    await popup.selectOption('#candidateStateFilter', 'NC');
    await popup.selectOption('#singleInputType', 'placeName');
    await popup.fill('#singleInput', 'festival');
    await popup.click('#singleSearchCandidatesBtn');

    await expect(popup.locator('#single-candidates .candidate-item')).toHaveCount(2);
    await expect(popup.locator('#single-candidates .candidate-results-head')).toContainText('Filters:');
    await expect(popup.locator('#single-candidates .candidate-results-summary')).toContainText('2 shown');
    await expect(popup.locator('#single-candidates .candidate-results-head')).toContainText('Sorted by nearest');
    const candidateItem = popup.locator('#single-candidates .candidate-item').first();
    await expect(candidateItem.locator('.candidate-title')).toHaveText('Nearby NC Festival');
    await expect(candidateItem).toContainText('mi from Long John Dr');
    await expect(candidateItem).toContainText('State: NC');

    const placeLink = popup.locator('#single-candidates .candidate-open-link').first();
    await expect(placeLink).toHaveAttribute('href', /google\.com\/maps\/place\/\?q=place_id:/i);

    await popup.click('#singleAddSelectedCandidateBtn');
    await expect.poll(() => graphCalls.length, { timeout: 10000 }).toBe(1);
    const row = graphCalls[0].body.values[0];
    expect(row[9]).toBe('pid-nearby-nc-festival');
  });

  test('non-festival website URL candidate search enriches via place resolver fallback', async ({ page }) => {
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
      window.searchPlaces = async () => [];
      window.resolvePlaceIdFromInput = async (inputType, value) => {
        if (String(inputType) === 'website' && /starbucks/i.test(String(value || ''))) {
          return 'pid-starbucks-hendo';
        }
        return '';
      };
      window.getPlaceDetails = async (placeId) => {
        if (String(placeId) !== 'pid-starbucks-hendo') return null;
        return {
          placeId: 'pid-starbucks-hendo',
          name: 'Starbucks Hendersonville',
          address: '100 Main St, Hendersonville, NC 28792',
          website: 'https://www.starbucks.com/',
          rating: 4.5,
          userRatingsTotal: 234,
          businessStatus: 'OPERATIONAL',
          coordinates: { lat: 35.314, lng: -82.46 }
        };
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
        if (placeId !== 'pid-starbucks-hendo') {
          return {
            placeId,
            name: 'Fallback Name',
            address: 'Fallback Address, NC',
            website: '',
            businessType: 'cafe',
            hours: '9-5',
            phone: '555-0000',
            rating: '4.0',
            userRatingsTotal: 10,
            directions: `https://maps.example.com/${placeId}`
          };
        }
        return {
          placeId,
          name: 'Starbucks Hendersonville',
          address: '100 Main St, Hendersonville, NC 28792',
          website: 'https://www.starbucks.com/',
          businessType: 'cafe',
          hours: '5-9',
          phone: '555-1212',
          rating: '4.5',
          userRatingsTotal: 234,
          directions: 'https://maps.example.com/starbucks-hendo'
        };
      };
    });

    await popup.selectOption('#actionTargetSelect', GENERIC_GOOGLE_CANDIDATE_TARGET);
    await popup.selectOption('#singleInputType', 'website');
    await popup.fill('#singleInput', 'https://www.starbucks.com/store-locator');
    await popup.click('#singleSearchCandidatesBtn');

    await expect(popup.locator('#single-candidates .candidate-item')).toHaveCount(1);
    const card = popup.locator('#single-candidates .candidate-item').first();
    await expect(card.locator('.candidate-title')).toHaveText('Starbucks Hendersonville');
    await expect(card).toContainText('pid-starbucks-hendo');

    await popup.click('#singleAddSelectedCandidateBtn');
    await expect.poll(() => graphCalls.length, { timeout: 10000 }).toBe(1);
    const row = graphCalls[0].body.values[0];
    expect(row[1]).toBe('Starbucks Hendersonville');
    expect(row[9]).toBe('pid-starbucks-hendo');
  });

  test('non-festival URL probing is opt-in and can surface probe-derived candidates for website inputs', async ({ page }) => {
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
      window.searchPlaces = async () => [];
      window.resolvePlaceIdFromInput = async () => '';
      window.getPlaceDetails = async () => null;
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
      const originalFetch = window.fetch.bind(window);
      window.fetch = async (input, init) => {
        const url = String(input || '');
        if (/coffeeprobe\.example\.com\/stores/i.test(url)) {
          return {
            ok: true,
            status: 200,
            text: async () => '<script type="application/ld+json">{"@context":"https://schema.org","@type":"LocalBusiness","name":"Probe Coffee House","url":"https://coffeeprobe.example.com/stores","address":{"streetAddress":"44 Bean St","addressLocality":"Asheville","addressRegion":"NC"}}</script>'
          };
        }
        if (/coffeeprobe\.example\.com/i.test(url)) {
          throw new Error('blocked');
        }
        return originalFetch(input, init);
      };
    });

    await popup.selectOption('#actionTargetSelect', GENERIC_GOOGLE_CANDIDATE_TARGET);
    await popup.check('#candidateUrlProbeEnabled');
    await popup.selectOption('#singleInputType', 'website');
    await popup.fill('#singleInput', 'https://coffeeprobe.example.com/');
    await popup.click('#singleSearchCandidatesBtn');

    await expect(popup.locator('#single-candidates .candidate-item')).toHaveCount(1);
    const card = popup.locator('#single-candidates .candidate-item').first();
    await expect(card.locator('.candidate-title')).toHaveText('Probe Coffee House');
    await expect(popup.locator('#single-candidates .candidate-results-head')).toContainText('Probe: attempted');
    await expect(popup.locator('#single-search-status')).toContainText('Probe: attempted');
  });

  test('non-festival probing does not run for plain place-name searches', async ({ page }) => {
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
        if (/coffee/i.test(String(query || ''))) {
          return [{
            placeId: 'pid-plain-search-coffee',
            name: 'Plain Search Coffee',
            address: '12 Main St, Asheville, NC',
            rating: 4.4,
            reviewCount: 88,
            businessStatus: 'OPERATIONAL'
          }];
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

    await popup.selectOption('#actionTargetSelect', GENERIC_GOOGLE_CANDIDATE_TARGET);
    await popup.check('#candidateUrlProbeEnabled');
    await popup.selectOption('#singleInputType', 'placeName');
    await popup.fill('#singleInput', 'coffee');
    await popup.click('#singleSearchCandidatesBtn');

    await expect(popup.locator('#single-candidates .candidate-item')).toHaveCount(1);
    await expect(popup.locator('#single-candidates .candidate-results-head')).not.toContainText('Probe: attempted');
    await expect(popup.locator('#single-search-status')).not.toContainText('Probe: attempted');
  });

  test('non-festival bulk place URL candidate search enriches via resolver fallback', async ({ page }) => {
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
      window.searchPlaces = async () => [];
      window.resolvePlaceIdFromInput = async (_inputType, value) => {
        const text = String(value || '');
        if (text.includes('store-1')) return 'pid-chain-store-1';
        if (text.includes('store-2')) return 'pid-chain-store-2';
        return '';
      };
      window.getPlaceDetails = async (placeId) => {
        if (String(placeId) === 'pid-chain-store-1') {
          return {
            placeId,
            name: 'Coffee Spot 1',
            address: '10 Main St, Denver, CO',
            website: 'https://coffee.example.com/store-1',
            businessStatus: 'OPERATIONAL'
          };
        }
        if (String(placeId) === 'pid-chain-store-2') {
          return {
            placeId,
            name: 'Coffee Spot 2',
            address: '20 Main St, Denver, CO',
            website: 'https://coffee.example.com/store-2',
            businessStatus: 'OPERATIONAL'
          };
        }
        return null;
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
        return {
          placeId,
          name: placeId === 'pid-chain-store-1' ? 'Coffee Spot 1' : 'Coffee Spot 2',
          address: placeId === 'pid-chain-store-1' ? '10 Main St, Denver, CO' : '20 Main St, Denver, CO',
          website: placeId === 'pid-chain-store-1' ? 'https://coffee.example.com/store-1' : 'https://coffee.example.com/store-2',
          businessType: 'cafe',
          hours: '6-8',
          phone: '555-1010',
          rating: '4.6',
          userRatingsTotal: 120,
          directions: `https://maps.example.com/${placeId}`
        };
      };
    });

    await popup.selectOption('#actionTargetSelect', GENERIC_GOOGLE_CANDIDATE_TARGET);
    await popup.selectOption('#bulkInputType', 'placeUrl');
    await popup.fill('#bulkInput', 'https://coffee.example.com/store-1\nhttps://coffee.example.com/store-2');
    await popup.click('#bulkSearchCandidatesBtn');

    await expect(popup.locator('#bulk-candidates .candidate-group')).toHaveCount(2);
    await expect(popup.locator('#bulk-candidates .candidate-item')).toHaveCount(2);
    await expect(popup.locator('#bulk-search-status')).toContainText('Ready: 2 selection');

    await popup.click('#bulkAddSelectedCandidatesBtn');
    await expect.poll(() => graphCalls.length, { timeout: 12000 }).toBe(2);
    const placeIds = graphCalls.map((call) => String(call.body?.values?.[0]?.[9] || ''));
    expect(placeIds).toContain('pid-chain-store-1');
    expect(placeIds).toContain('pid-chain-store-2');
  });

  test('candidate filters persist, support alternate sort modes, and can be reset', async ({ page }) => {
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
      window.searchPlaces = async () => {
        return [
          {
            placeId: 'pid-near-low-rated',
            name: 'Near Low Rated',
            address: '10 Main St, Hendersonville, NC 28791',
            rating: 4.1,
            reviewCount: 40,
            businessStatus: 'OPERATIONAL',
            coordinates: { lat: 35.3481, lng: -82.4599 }
          },
          {
            placeId: 'pid-far-high-rated',
            name: 'Far High Rated',
            address: '20 College St, Asheville, NC 28801',
            rating: 4.9,
            reviewCount: 320,
            businessStatus: 'OPERATIONAL',
            coordinates: { lat: 35.5951, lng: -82.5515 }
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

    await popup.selectOption('#candidateDistanceLimitMiles', '50');
    await popup.selectOption('#candidateStateFilter', 'NC');
    await popup.selectOption('#candidateSortMode', 'best-rated');
    await popup.reload({ waitUntil: 'domcontentloaded' });
    await popup.waitForFunction(() => {
      const select = document.getElementById('actionTargetSelect');
      return select && select.options.length >= 7;
    }, null, { timeout: 10000 });

    await expect(popup.locator('#candidateDistanceLimitMiles')).toHaveValue('50');
    await expect(popup.locator('#candidateStateFilter')).toHaveValue('NC');
    await expect(popup.locator('#candidateSortMode')).toHaveValue('best-rated');

    await popup.selectOption('#actionTargetSelect', GENERIC_GOOGLE_CANDIDATE_TARGET);
    await popup.selectOption('#singleInputType', 'placeName');
    await popup.fill('#singleInput', 'festival');
    await popup.click('#singleSearchCandidatesBtn');

    await expect(popup.locator('#single-candidates .candidate-item')).toHaveCount(2);
    await expect(popup.locator('#single-candidates .candidate-item').first().locator('.candidate-title')).toHaveText('Far High Rated');
    await expect(popup.locator('#single-candidates .candidate-results-head')).toContainText('Sort: Best rated');

    await popup.click('#candidateResetFiltersBtn');
    await expect(popup.locator('#candidateDistanceLimitMiles')).toHaveValue('no-limit');
    await expect(popup.locator('#candidateStateFilter')).toHaveValue('');
    await expect(popup.locator('#candidateSortMode')).toHaveValue('nearest');
  });

  test('festival target routes candidate search through festival adapters and shows event-source links without using Google place search', async ({ page }) => {
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
      window.__googlePlaceSearchCalls = 0;
      window.searchPlaces = async () => {
        window.__googlePlaceSearchCalls += 1;
        return [];
      };
      window.searchFestivalEvents = async (query) => {
        const q = String(query || '').trim().toLowerCase();
        if (!q.includes('apple')) return [];
        return [
          {
            name: 'Apple Blossom Festival',
            address: '101 Orchard Ave, Hendersonville, NC 28791',
            city: 'Hendersonville',
            state: 'NC',
            website: 'https://applefest.example.com',
            openLinkUrl: 'https://tickets.example.com/applefest',
            openLinkLabel: 'Open Event Source',
            sourceProvider: 'Ticketmaster',
            eventDate: '2026-09-20',
            description: 'Source: Ticketmaster • Date: 2026-09-20 • Regional apple harvest celebration',
            businessStatus: 'SCHEDULED',
            coordinates: { lat: 35.348, lng: -82.46 }
          },
          {
            name: 'Apple Cider Weekend',
            address: '55 Farm Lane, Flat Rock, NC 28731',
            city: 'Flat Rock',
            state: 'NC',
            website: 'https://ciderfest.example.com',
            openLinkUrl: 'https://events.example.com/ciderfest',
            openLinkLabel: 'Open Event Source',
            sourceProvider: 'Eventbrite',
            eventDate: '2026-10-03',
            description: 'Source: Eventbrite • Date: 2026-10-03 • Cider tastings and live music',
            businessStatus: 'SCHEDULED',
            coordinates: { lat: 35.2801, lng: -82.4412 }
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

    await popup.selectOption('#actionTargetSelect', 'ent_festivals');
    await expect(popup.locator('#singleSearchCandidatesBtn')).toHaveText(/Search Festival Events/i);
    await expect(popup.locator('#singleFestivalModeHint')).toContainText('do not require a Google Place ID');

    await popup.selectOption('#singleInputType', 'placeName');
    await popup.fill('#singleInput', 'apple festival');
    await popup.click('#singleSearchCandidatesBtn');

    await expect(popup.locator('#single-candidates .candidate-item')).toHaveCount(2);
    await expect(popup.locator('#single-candidates .candidate-item').first()).toContainText('Source: Ticketmaster');
    await expect(popup.locator('#single-candidates .candidate-item').first()).toContainText('2026-09-20');
    const eventLink = popup.locator('#single-candidates .candidate-open-link').first();
    await expect(eventLink).toHaveText('Open Event Source');
    await expect(eventLink).toHaveAttribute('href', 'https://tickets.example.com/applefest');
    await expect.poll(() => page.evaluate(() => window.__googlePlaceSearchCalls)).toBe(0);
  });

  test('festival single and bulk imports succeed without Google Place IDs', async ({ page }) => {
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
      window.searchPlaces = async () => [];
      window.searchFestivalEvents = async (query) => {
        const q = String(query || '').trim().toLowerCase();
        if (q.includes('apple blossom')) {
          return [{
            name: 'Apple Blossom Festival',
            address: '101 Orchard Ave, Hendersonville, NC 28791',
            city: 'Hendersonville',
            state: 'NC',
            website: 'https://applefest.example.com',
            sourceProvider: 'Ticketmaster',
            eventDate: '2026-09-20',
            description: 'Source: Ticketmaster • Date: 2026-09-20 • Regional apple harvest celebration',
            businessStatus: 'SCHEDULED',
            coordinates: { lat: 35.348, lng: -82.46 }
          }];
        }
        if (q.includes('pear harvest')) {
          return [{
            name: 'Pear Harvest Festival',
            address: '220 Market St, Asheville, NC 28801',
            city: 'Asheville',
            state: 'NC',
            website: 'https://pearfest.example.com',
            sourceProvider: 'Eventbrite',
            eventDate: '2026-10-01',
            description: 'Source: Eventbrite • Date: 2026-10-01 • Downtown pear harvest celebration',
            businessStatus: 'SCHEDULED',
            coordinates: { lat: 35.5951, lng: -82.5515 }
          }];
        }
        if (q.includes('peach jam')) {
          return [{
            name: 'Peach Jam Festival',
            address: '18 Depot St, Brevard, NC 28712',
            city: 'Brevard',
            state: 'NC',
            website: 'https://peachjam.example.com',
            sourceProvider: 'Ticketmaster',
            eventDate: '2026-10-15',
            description: 'Source: Ticketmaster • Date: 2026-10-15 • Live music and peach tastings',
            businessStatus: 'SCHEDULED',
            coordinates: { lat: 35.2334, lng: -82.7343 }
          }];
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


    await popup.selectOption('#actionTargetSelect', 'ent_festivals');

    await popup.selectOption('#singleInputType', 'placeName');
    await popup.fill('#singleInput', 'Apple Blossom Festival');
    await popup.click('#singleSubmitBtn');

    await expect.poll(() => graphCalls.length, { timeout: 10000 }).toBe(1);
    const singleRow = graphCalls[0].body.values[0];
    expect(String(singleRow[0] || '')).toMatch(/Festival Event|Source: Ticketmaster/);
    expect(singleRow[1]).toBe('Apple Blossom Festival');
    expect(singleRow[2]).toBe('101 Orchard Ave, Hendersonville, NC 28791');
    expect(singleRow[5]).toBe('https://applefest.example.com');
    expect(singleRow[8]).toContain('destination=101%20Orchard%20Ave%2C%20Hendersonville%2C%20NC%2028791');
    expect(singleRow[9]).toBe('');
    expect(singleRow[10]).toBe('');

    await popup.selectOption('#bulkInputType', 'placeName');
    await popup.fill('#bulkInput', 'Pear Harvest Festival\nPeach Jam Festival');
    await popup.click('#bulkSubmitBtn');

    await expect.poll(() => graphCalls.length, { timeout: 12000 }).toBe(3);
    const bulkRows = graphCalls.slice(1).map((call) => call.body.values[0]);
    expect(bulkRows[0][1]).toBe('Pear Harvest Festival');
    expect(bulkRows[0][9]).toBe('');
    expect(bulkRows[0][10]).toBe('');
    expect(bulkRows[1][1]).toBe('Peach Jam Festival');
    expect(bulkRows[1][5]).toBe('https://peachjam.example.com');
    expect(bulkRows[1][9]).toBe('');
    expect(bulkRows[1][10]).toBe('');
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
      window.__openedCandidateUrls = [];
      window.open = (url) => {
        window.__openedCandidateUrls.push(String(url || ''));
        return null;
      };
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

    await popup.selectOption('#actionTargetSelect', GENERIC_GOOGLE_CANDIDATE_TARGET);
    await popup.selectOption('#bulkInputType', 'placeName');
    await popup.fill('#bulkInput', 'apple festival\npear fair');
    await popup.click('#bulkSearchCandidatesBtn');

    await expect(popup.locator('#bulk-candidates .candidate-group')).toHaveCount(2);
    await expect(popup.locator('#bulk-candidates .candidate-item')).toHaveCount(4);
    await expect(popup.locator('#bulk-search-status')).toContainText('Ready: 2 selection');
    await expect(popup.locator('#bulk-search-status')).toContainText('Filtered out: 0 by state, 0 by distance');
    await expect(popup.locator('#bulk-candidates .candidate-results-head')).toContainText('Filters:');

    await popup.locator('[data-bulk-group-index="1"][data-bulk-candidate-index="1"]').click();
    await popup.click('#bulkOpenSelectedInGoogleBtn');
    await expect.poll(() => popup.evaluate(() => window.__openedCandidateUrls || [])).toEqual([
      'https://www.google.com/maps/place/?q=place_id:pid-apple-festival-main',
      'https://www.google.com/maps/place/?q=place_id:pid-pear-fair-lakeside'
    ]);
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

  test('festival candidate search can use an official festival website URL as a direct fallback candidate', async ({ page }) => {
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
      window.searchPlaces = async () => [];
    });

    const popupPromise = page.waitForEvent('popup');
    await page.evaluate(() => window.open('/HTML%20Files/edit-mode-enhanced.html', '_blank'));
    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');
    await popup.waitForFunction(() => {
      const select = document.getElementById('actionTargetSelect');
      return select && select.options.length >= 7;
    }, null, { timeout: 10000 });

    const officialUrl = 'https://ncapplefestival.org/';

    await popup.selectOption('#actionTargetSelect', 'ent_festivals');
    await popup.selectOption('#singleInputType', 'website');
    await popup.fill('#singleInput', officialUrl);
    await popup.click('#singleSearchCandidatesBtn');

    await expect(popup.locator('#single-candidates .candidate-item')).toHaveCount(1);
    await expect(popup.locator('#single-search-status')).toContainText('Found 1 festival event');
    await expect(popup.locator('#single-candidates .festival-confidence-badge').first()).toContainText('Manual');
    const openLink = popup.locator('#single-candidates .candidate-open-link').first();
    await expect(openLink).toHaveAttribute('href', officialUrl);
    await expect(openLink).toContainText('Open Festival Website');

    await popup.click('#singleAddSelectedCandidateBtn');
    await expect.poll(() => graphCalls.length, { timeout: 10000 }).toBe(1);

    const row = graphCalls[0].body.values[0];
    expect(String(row[1] || '')).toMatch(/festival/i);
    expect(row[5]).toBe(officialUrl);
    expect(row[9]).toBe('');
    expect(row[10]).toBe('');
  });

  test('festival bulk candidate search supports official festival website URLs as direct fallback candidates', async ({ page }) => {
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
      window.searchPlaces = async () => [];
    });

    const popupPromise = page.waitForEvent('popup');
    await page.evaluate(() => window.open('/HTML%20Files/edit-mode-enhanced.html', '_blank'));
    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');
    await popup.waitForFunction(() => {
      const select = document.getElementById('actionTargetSelect');
      return select && select.options.length >= 7;
    }, null, { timeout: 10000 });

    const firstUrl = 'https://ncapplefestival.org/';
    const secondUrl = 'https://hendersonvilleberryfest.com/';

    await popup.selectOption('#actionTargetSelect', 'ent_festivals');
    await popup.selectOption('#bulkInputType', 'website');
    await popup.fill('#bulkInput', `${firstUrl}\n${secondUrl}`);
    await popup.click('#bulkSearchCandidatesBtn');

    await expect(popup.locator('#bulk-candidates .candidate-group')).toHaveCount(2);
    await expect(popup.locator('#bulk-candidates .candidate-item')).toHaveCount(2);
    await expect(popup.locator('#bulk-search-status')).toContainText('Ready: 2 selection');
    const bulkLinks = popup.locator('#bulk-candidates .candidate-open-link');
    await expect(bulkLinks.nth(0)).toHaveAttribute('href', firstUrl);
    await expect(bulkLinks.nth(1)).toHaveAttribute('href', secondUrl);

    await popup.click('#bulkAddSelectedCandidatesBtn');
    await expect.poll(() => graphCalls.length, { timeout: 12000 }).toBe(2);

    const firstRow = graphCalls[0].body.values[0];
    const secondRow = graphCalls[1].body.values[0];
    expect(String(firstRow[1] || '')).toMatch(/festival|fest/i);
    expect(String(secondRow[1] || '')).toMatch(/festival|fest/i);
    expect(firstRow[5]).toBe(firstUrl);
    expect(secondRow[5]).toBe(secondUrl);
    expect(firstRow[9]).toBe('');
    expect(firstRow[10]).toBe('');
    expect(secondRow[9]).toBe('');
    expect(secondRow[10]).toBe('');
  });

  test('festival website URL input can enrich details via provider adapters before fallback', async ({ page }) => {
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
      window.searchPlaces = async () => [];
      window.__ticketmasterFestivalEventSearch = async (query) => {
        if (!/nc apple festival/i.test(String(query || ''))) return [];
        return [{
          name: 'NC Apple Festival 2026',
          address: '111 Main St, Hendersonville, NC 28792',
          city: 'Hendersonville',
          state: 'NC',
          website: 'https://ncapplefestival.org/',
          sourceProvider: 'Ticketmaster',
          eventDate: '2026-09-20',
          description: 'Source: Ticketmaster • Date: 2026-09-20 • Regional harvest event',
          businessStatus: 'SCHEDULED'
        }];
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

    await popup.selectOption('#actionTargetSelect', 'ent_festivals');
    await popup.selectOption('#singleInputType', 'website');
    await popup.fill('#singleInput', 'https://ncapplefestival.org/');
    await popup.click('#singleSearchCandidatesBtn');

    await expect(popup.locator('#single-candidates .candidate-item')).toHaveCount(1);
    const card = popup.locator('#single-candidates .candidate-item').first();
    await expect(card.locator('.candidate-title')).toHaveText('NC Apple Festival 2026');
    await expect(card).toContainText('Source: Ticketmaster');
    await expect(card.locator('.festival-confidence-badge')).toContainText('Medium');
    await expect(card).toContainText('2026-09-20');

    await popup.click('#singleAddSelectedCandidateBtn');
    await expect.poll(() => graphCalls.length, { timeout: 10000 }).toBe(1);
    const row = graphCalls[0].body.values[0];
    expect(row[1]).toBe('NC Apple Festival 2026');
    expect(row[2]).toBe('111 Main St, Hendersonville, NC 28792');
    expect(row[5]).toBe('https://ncapplefestival.org/');
  });

  test('festival manual assist can create a candidate when provider/source searches return no matches', async ({ page }) => {
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
      window.searchPlaces = async () => [];
    });

    const popupPromise = page.waitForEvent('popup');
    await page.evaluate(() => window.open('/HTML%20Files/edit-mode-enhanced.html', '_blank'));
    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');
    await popup.waitForFunction(() => {
      const select = document.getElementById('actionTargetSelect');
      return select && select.options.length >= 7;
    }, null, { timeout: 10000 });

    await popup.selectOption('#actionTargetSelect', 'ent_festivals');
    await popup.selectOption('#singleInputType', 'placeName');
    await popup.fill('#singleInput', 'zzzz impossible orchard festival query');
    await popup.click('#singleSearchCandidatesBtn');

    const manualAssist = popup.locator('#singleFestivalManualAssist');
    await expect(manualAssist).toBeVisible();
    await popup.fill('#singleManualFestivalName', 'NC Apple Festival Manual');
    await popup.fill('#singleManualFestivalCity', 'Hendersonville');
    await popup.fill('#singleManualFestivalState', 'nc');
    await popup.click('#singleUseManualFestivalCandidateBtn');

    await expect(popup.locator('#single-candidates .candidate-item')).toHaveCount(1);
    const card = popup.locator('#single-candidates .candidate-item').first();
    await expect(card.locator('.candidate-title')).toHaveText('NC Apple Festival Manual');
    await expect(card.locator('.festival-confidence-badge')).toContainText('Manual');
    await expect(card).toContainText('Source: Manual Festival Entry');

    await popup.click('#singleAddSelectedCandidateBtn');
    await expect.poll(() => graphCalls.length, { timeout: 10000 }).toBe(1);
    const row = graphCalls[0].body.values[0];
    expect(row[1]).toBe('NC Apple Festival Manual');
    expect(row[3]).toBe('Hendersonville');
    expect(row[4]).toBe('NC');
    expect(row[5]).toBe('');
  });

  test('non-festival chain place URL candidate search enriches via resolver fallback', async ({ page }) => {
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
      window.searchPlaces = async () => [];
      window.resolvePlaceIdFromInput = async (_inputType, value) => {
        const text = String(value || '');
        if (text.includes('branch-a')) return 'pid-branch-a';
        if (text.includes('branch-b')) return 'pid-branch-b';
        return '';
      };
      window.getPlaceDetails = async (placeId) => {
        if (String(placeId) === 'pid-branch-a') {
          return {
            placeId,
            name: 'Craft Market Branch A',
            address: '5 Oak St, Denver, CO',
            website: 'https://craft.example.com/branch-a',
            businessStatus: 'OPERATIONAL'
          };
        }
        if (String(placeId) === 'pid-branch-b') {
          return {
            placeId,
            name: 'Craft Market Branch B',
            address: '7 Oak St, Denver, CO',
            website: 'https://craft.example.com/branch-b',
            businessStatus: 'OPERATIONAL'
          };
        }
        return null;
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
        return {
          placeId,
          name: placeId === 'pid-branch-a' ? 'Craft Market Branch A' : 'Craft Market Branch B',
          address: placeId === 'pid-branch-a' ? '5 Oak St, Denver, CO' : '7 Oak St, Denver, CO',
          website: placeId === 'pid-branch-a' ? 'https://craft.example.com/branch-a' : 'https://craft.example.com/branch-b',
          businessType: 'store',
          hours: '9-5',
          phone: '555-1313',
          rating: '4.4',
          userRatingsTotal: 89,
          directions: `https://maps.example.com/${placeId}`
        };
      };
    });

    await popup.selectOption('#actionTargetSelect', GENERIC_GOOGLE_CANDIDATE_TARGET);
    await popup.selectOption('#chainInputType', 'placeUrl');
    await popup.fill('#chainInput', 'https://craft.example.com/branch-a\nhttps://craft.example.com/branch-b');
    await popup.click('#chainSearchCandidatesBtn');

    await expect(popup.locator('#chain-candidates .candidate-group')).toHaveCount(2);
    await expect(popup.locator('#chain-candidates .candidate-item')).toHaveCount(2);
    await expect(popup.locator('#chain-search-status')).toContainText('Ready: 2 selected');

    await popup.click('#chainAddSelectedCandidatesBtn');
    await expect.poll(() => graphCalls.length, { timeout: 12000 }).toBe(2);
    const placeIds = graphCalls.map((call) => String(call.body?.values?.[0]?.[9] || ''));
    expect(placeIds).toContain('pid-branch-a');
    expect(placeIds).toContain('pid-branch-b');
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
      window.__openedCandidateUrls = [];
      window.open = (url) => {
        window.__openedCandidateUrls.push(String(url || ''));
        return null;
      };
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

    await popup.selectOption('#actionTargetSelect', GENERIC_GOOGLE_CANDIDATE_TARGET);
    await popup.selectOption('#chainInputType', 'placeNameCity');
    await popup.fill('#chainInput', 'Starbucks downtown Denver\nStarbucks airport Denver');
    await popup.click('#chainSearchCandidatesBtn');

    await expect(popup.locator('#chain-candidates .candidate-group')).toHaveCount(2);
    await expect(popup.locator('#chain-candidates .candidate-item')).toHaveCount(5);
    await expect(popup.locator('#chain-search-status')).toContainText('Ready: 2 selected');
    await expect(popup.locator('#chain-search-status')).toContainText('Filtered out: 0 by state, 0 by distance');
    await expect(popup.locator('#chain-candidates .candidate-results-head')).toContainText('Chain relevance ranking');
    await expect(popup.locator('#chain-candidates [data-chain-group-index="0"] .candidate-count-chip').first()).toContainText('1/3 selected');
    await expect(popup.locator('#chain-cap-help')).toContainText('5 found, 2 currently selected');

    const capOptions = await popup.locator('#chainSelectionCapSelect option').allTextContents();
    expect(capOptions.join(' | ')).toContain('Top 3');
    expect(capOptions.join(' | ')).toContain('Top 5');
    expect(capOptions.join(' | ')).toContain('All found (5)');
    expect(capOptions.join(' | ')).toContain('All selected (2)');

    // All found auto-selects every ranked candidate.
    await popup.selectOption('#chainSelectionCapSelect', 'all-found');
    await expect(popup.locator('#chain-candidates [data-chain-group-index="0"] .candidate-count-chip').first()).toContainText('3/3 selected');
    await expect(popup.locator('#chain-candidates [data-chain-group-index="1"] .candidate-count-chip').first()).toContainText('2/2 selected');

    const firstTopName = await popup.locator('#chain-candidates .candidate-group').nth(0).locator('.candidate-item .candidate-title').first().innerText();
    expect(firstTopName.toLowerCase()).toContain('starbucks');

    // Return to normal curated mode for the rest of this flow.
    await popup.selectOption('#chainSelectionCapSelect', 'all-selected');
    await popup.click('#chainSelectTopMatchesBtn');
    await popup.check('#chainCandidateMultiSelect');
    await popup.locator('[data-chain-group-index="0"][data-chain-candidate-index="2"]').click();
    await expect(popup.locator('#chain-candidates [data-chain-group-index="0"] .candidate-count-chip').first()).toContainText('2/3 selected');

    // Verify quick action restores top-only selection for each query.
    await popup.click('#chainSelectTopMatchesBtn');
    await expect(popup.locator('#chain-candidates [data-chain-group-index="0"] .candidate-count-chip').first()).toContainText('1/3 selected');
    await popup.check('#chainCandidateMultiSelect');
    await popup.locator('[data-chain-group-index="0"][data-chain-candidate-index="2"]').click();

    await popup.click('#chainOpenSelectedInGoogleBtn');
    await expect.poll(() => popup.evaluate(() => window.__openedCandidateUrls || [])).toEqual([
      'https://www.google.com/maps/place/?q=place_id:pid-starbucks-downtown-denver',
      'https://www.google.com/maps/place/?q=place_id:pid-starbucks-17th-denver',
      'https://www.google.com/maps/place/?q=place_id:pid-starbucks-airport-denver'
    ]);

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

