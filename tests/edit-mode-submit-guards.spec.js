const { test, expect } = require('./reliability-test');

const FESTIVALS_SCHEMA = ['Description', 'Name', 'Address', 'City', 'State', 'Official Website', 'Phone Number', 'Rating', 'Directions', 'Google Place ID', 'Google URL'];

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
        body: JSON.stringify({ value: FESTIVALS_SCHEMA.map((name, index) => ({ name, index })) })
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

test.describe('Edit Mode submit guards', () => {
  test('prevent duplicate rapid clicks for single, bulk, and chain submit buttons', async ({ page }) => {
    const graphCalls = [];
    await installMocks(page.context(), graphCalls, { postDelayMs: 300 });

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
            description: 'Source: Ticketmaster',
            businessStatus: 'SCHEDULED'
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
            description: 'Source: Eventbrite',
            businessStatus: 'SCHEDULED'
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
            description: 'Source: Ticketmaster',
            businessStatus: 'SCHEDULED'
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
    await popup.waitForTimeout(25);
    await popup.click('#singleSubmitBtn');
    await expect.poll(() => graphCalls.length, { timeout: 12000 }).toBe(1);

    await popup.selectOption('#bulkInputType', 'placeName');
    await popup.fill('#bulkInput', 'Pear Harvest Festival\nPeach Jam Festival');
    await popup.click('#bulkSubmitBtn');
    await popup.waitForTimeout(25);
    await popup.click('#bulkSubmitBtn');
    await expect.poll(() => graphCalls.length, { timeout: 15000 }).toBe(3);

    await popup.evaluate(() => {
      window.__chainSubmitCalls = 0;
      const original = typeof window.handleBulkAddChainLocationsFixed === 'function'
        ? window.handleBulkAddChainLocationsFixed
        : null;
      window.handleBulkAddChainLocationsFixed = async (...args) => {
        window.__chainSubmitCalls += 1;
        await new Promise((resolve) => window.setTimeout(resolve, 300));
        if (!original) return { success: true, message: 'chain complete' };
        return original(...args);
      };
    });

    await popup.selectOption('#chainInputType', 'placeNameCity');
    await popup.fill('#chainInput', 'Chain Test Location, Asheville');
    await popup.click('#chainSubmitBtn');
    await popup.waitForTimeout(25);
    await popup.click('#chainSubmitBtn');
    await expect.poll(() => popup.evaluate(() => window.__chainSubmitCalls || 0), { timeout: 10000 }).toBe(1);
  });
});

