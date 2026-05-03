const { chromium } = require('@playwright/test');

const FESTIVALS_SCHEMA = ['Description', 'Name', 'Address', 'City', 'State', 'Official Website', 'Phone Number', 'Rating', 'Directions', 'Google Place ID', 'Google URL'];

async function installMocks(context, graphCalls, options = {}) {
  const postDelayMs = Math.max(0, Number(options.postDelayMs) || 0);

  await context.route('https://places.googleapis.com/$rpc/google.maps.places.v1.Places/GetPlace**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({
        id: 'playwright-mocked-place',
        displayName: { text: 'Playwright Mock Place' },
        formattedAddress: '100 Mock St, Hendersonville, NC 28792',
        location: { latitude: 35.3187, longitude: -82.4609 },
        businessStatus: 'OPERATIONAL'
      })
    });
  });

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

async function openEditModePopup(page, url = '/HTML%20Files/edit-mode-enhanced.html') {
  const popupPromise = page.waitForEvent('popup');
  await page.evaluate((openUrl) => window.open(openUrl, '_blank'), url);
  const popup = await popupPromise;
  await popup.waitForLoadState('domcontentloaded');
  await popup.waitForFunction(() => {
    const select = document.getElementById('actionTargetSelect');
    return select && select.options.length >= 7;
  }, null, { timeout: 10000 });
  await popup.evaluate(() => {
    window.__targetConfirmMessages = [];
    window.confirm = (message) => {
      window.__targetConfirmMessages.push(String(message || ''));
      return true;
    };

    const tabContent = document.getElementById('places-tab');
    if (!tabContent) return;
    const cards = Array.from(tabContent.querySelectorAll(':scope > .card.edit-collapsible-card'));
    const placesMainCards = Array.from(tabContent.querySelectorAll('#placesMainContent > .card.edit-collapsible-card'));
    const allCards = cards.concat(placesMainCards);

    allCards.forEach((card) => {
      const body = card.querySelector(':scope > .edit-collapsible-card-body');
      const toggleBtn = card.querySelector(':scope > .edit-card-collapse-btn');
      if (body && toggleBtn) {
        card.classList.remove('is-collapsed');
        body.hidden = false;
        toggleBtn.setAttribute('aria-expanded', 'true');
        toggleBtn.textContent = '▲ Collapse';
        toggleBtn.title = 'Collapse section';
      }
    });
  });

  return popup;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ baseURL: 'http://127.0.0.1:4321' });
  const graphCalls = [];
  await installMocks(context, graphCalls, { postDelayMs: 120 });

  const page = await context.newPage();
  page.on('pageerror', (err) => console.log('[page error]', err.message));

  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.buildExcelRow === 'function' && typeof window.addRowToExcel === 'function', null, { timeout: 15000 });
  await page.evaluate(() => {
    window.accessToken = 'playwright-mock-token';
    window.showToast = () => {};
    window.renderAdventureCards = async () => {};
    window.FilterManager = { applyAllFilters() {}, renderQuickFilterCounts() {} };
    window.normalizeOperationHours = (value) => String(value || '');
    window.searchPlaces = async (query) => {
      const base = String(query || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'item';
      return [
        {
          placeId: `pid-${base}-a`,
          name: `${base} Alpha`,
          address: `10 ${base} St, Denver, CO`,
          rating: 4.7,
          reviewCount: 99,
          businessStatus: 'OPERATIONAL',
          coordinates: { lat: 39.7392, lng: -104.9903 }
        }
      ];
    };
  });

  const popup = await openEditModePopup(page);
  popup.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('[popup hook]')) console.log(text);
  });
  popup.on('pageerror', (err) => console.log('[popup error]', err.message));

  await popup.evaluate(() => {
    window.showToast = () => {};
    window.__bulkDebugEvents = [];
    const pushEvent = (label, payload = null) => {
      window.__bulkDebugEvents.push({ t: Date.now(), label, payload });
    };
    window.resolvePlaceInputWithGoogleData = async (_inputType, inputValue) => {
      const placeId = String(inputValue || '').trim();
      pushEvent('resolve:start', { placeId });
      const result = {
        placeId,
        name: `Resolved ${placeId}`,
        address: `Resolved ${placeId} Address, Denver, CO`,
        website: `https://${placeId}.example.com`,
        businessType: 'tag',
        hours: '9-5',
        phone: '555-1010',
        rating: '4.6',
        userRatingsTotal: 77,
        directions: `https://maps.example.com/${placeId}`
      };
      pushEvent('resolve:done', { placeId });
      return result;
    };
    window.handleBulkAddPlacesWithProgress = async (locations) => ({
      success: true,
      added: locations.length,
      failed: 0,
      skipped: 0,
      message: `Successfully added ${locations.length} location(s)`
    });

    const automation = window.enhancedAutomation;
    if (automation && typeof automation.bulkAddPlaces === 'function') {
      const originalBulk = automation.bulkAddPlaces.bind(automation);
      automation.bulkAddPlaces = async (...args) => {
        pushEvent('bulkAdd:start', { inputType: args[1], dryRun: !!args[2] });
        try {
          const result = await originalBulk(...args);
          pushEvent('bulkAdd:done', { success: !!(result && result.success), added: Number(result && result.added) || 0, failed: Number(result && result.failed) || 0 });
          return result;
        } catch (error) {
          pushEvent('bulkAdd:error', { message: String(error && error.message ? error.message : error) });
          throw error;
        }
      };
    }
    if (automation && typeof automation.addSinglePlace === 'function') {
      const originalSingle = automation.addSinglePlace.bind(automation);
      automation.addSinglePlace = async (...args) => {
        pushEvent('singleAdd:start', { inputType: args[1], input: String(args[0] || '').slice(0, 80) });
        try {
          const result = await originalSingle(...args);
          pushEvent('singleAdd:done', { success: !!(result && result.success), error: result && result.error ? String(result.error) : '' });
          return result;
        } catch (error) {
          pushEvent('singleAdd:error', { message: String(error && error.message ? error.message : error) });
          throw error;
        }
      };
    }
  });

  await popup.selectOption('#actionTargetSelect', 'ent_general');
  await popup.selectOption('#bulkInputType', 'placeName');
  await popup.fill('#bulkInput', 'apple festival\nriverfront market');
  await popup.click('#bulkSearchCandidatesBtn');
  console.log('before click status:', await popup.locator('#bulk-search-status').textContent());
  await popup.click('#bulkAddSelectedCandidatesBtn');

  for (let i = 0; i < 20; i += 1) {
    await popup.waitForTimeout(500);
    const snapshot = await popup.evaluate(() => ({
      href: window.location.href,
      hasBulkSearchStatus: !!document.getElementById('bulk-search-status'),
      bulkSearchStatus: document.getElementById('bulk-search-status')?.textContent || '',
      hasBulkStatus: !!document.getElementById('bulk-status'),
      bulkStatus: document.getElementById('bulk-status')?.textContent || '',
      events: Array.isArray(window.__bulkDebugEvents) ? window.__bulkDebugEvents.slice(-8) : []
    }));
    console.log('tick', i, {
      graphCalls: graphCalls.length,
      ...snapshot
    });
  }

  await browser.close();
})();
