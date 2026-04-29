const { test, expect } = require('./reliability-test');

const FESTIVALS_SCHEMA = ['Description', 'Name', 'Address', 'City', 'State', 'Official Website', 'Phone Number', 'Rating', 'Directions', 'Google Place ID', 'Google URL'];

async function installMocks(context, graphCalls) {
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
      if (graphCalls) graphCalls.push({ url, body: JSON.parse(request.postData() || '{}') });
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ value: [] }) });
  });
}

async function openEditModePopup(page) {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.buildExcelRow === 'function' && typeof window.addRowToExcel === 'function', null, { timeout: 15000 });
  await page.evaluate(() => {
    window.accessToken = 'playwright-mock-token';
    window.showToast = () => {};
    window.renderAdventureCards = async () => {};
    window.FilterManager = { applyAllFilters() {}, renderQuickFilterCounts() {} };
    window.normalizeOperationHours = (value) => String(value || '');
    window.searchPlaces = async () => [];
    window.searchFestivalEvents = async () => [];
  });
  const popupPromise = page.waitForEvent('popup');
  await page.evaluate(() => window.open('/HTML%20Files/edit-mode-enhanced.html', '_blank'));
  const popup = await popupPromise;
  await popup.waitForLoadState('domcontentloaded');
  await popup.waitForFunction(() => {
    const select = document.getElementById('actionTargetSelect');
    return select && select.options.length >= 7;
  }, null, { timeout: 10000 });
  // Wait for draft tracking init
  await popup.waitForFunction(() => Boolean(window.__editModeDraftTrackingInit), null, { timeout: 5000 });

  // Directly expand all collapsible cards in the places tab using JavaScript
  // This ensures elements like #singleInput, #singleInputType, etc. are visible and interactable
  await popup.evaluate(() => {
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

async function fillAndSaveDraft(popup, selector, value) {
  await popup.fill(selector, value);
  // Explicitly dispatch input event so draft listener fires (robust against Playwright timing)
  await popup.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) el.dispatchEvent(new Event('input', { bubbles: true }));
  }, selector);
}

test.describe('Edit Mode draft guards', () => {
  test('drafts persist to localStorage on input and are restored on reload', async ({ page }) => {
    await installMocks(page.context());
    const popup = await openEditModePopup(page);

    await fillAndSaveDraft(popup, '#singleInput', 'Draft Single Place');
    await fillAndSaveDraft(popup, '#bulkInput', 'Draft Bulk A\nDraft Bulk B');
    await fillAndSaveDraft(popup, '#chainInput', 'Draft Chain Location, Denver');

    await expect.poll(() => popup.evaluate(() => localStorage.getItem('editMode_draft_singleInput')), { timeout: 5000 }).toBe('Draft Single Place');
    await expect.poll(() => popup.evaluate(() => localStorage.getItem('editMode_draft_bulkInput')), { timeout: 5000 }).toBe('Draft Bulk A\nDraft Bulk B');
    await expect.poll(() => popup.evaluate(() => localStorage.getItem('editMode_draft_chainInput')), { timeout: 5000 }).toBe('Draft Chain Location, Denver');

    // Reload - drafts should be restored
    await popup.reload({ waitUntil: 'domcontentloaded' });
    await popup.waitForFunction(() => {
      const select = document.getElementById('actionTargetSelect');
      return select && select.options.length >= 7;
    }, null, { timeout: 10000 });
    await popup.waitForFunction(() => Boolean(window.__editModeDraftTrackingInit), null, { timeout: 5000 });

    // Re-expand collapsible cards after reload
    await popup.evaluate(() => {
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

    await expect(popup.locator('#singleInput')).toHaveValue('Draft Single Place');
    await expect(popup.locator('#bulkInput')).toHaveValue('Draft Bulk A\nDraft Bulk B');
    await expect(popup.locator('#chainInput')).toHaveValue('Draft Chain Location, Denver');
  });

  test('drafts are cleared from localStorage when clear form buttons are used', async ({ page }) => {
    await installMocks(page.context());
    const popup = await openEditModePopup(page);

    await fillAndSaveDraft(popup, '#singleInput', 'Clearable single draft');
    await fillAndSaveDraft(popup, '#bulkInput', 'Clearable bulk draft');
    await fillAndSaveDraft(popup, '#chainInput', 'Clearable chain draft');

    await expect.poll(() => popup.evaluate(() => localStorage.getItem('editMode_draft_singleInput')), { timeout: 5000 }).not.toBeNull();
    await expect.poll(() => popup.evaluate(() => localStorage.getItem('editMode_draft_bulkInput')), { timeout: 5000 }).not.toBeNull();
    await expect.poll(() => popup.evaluate(() => localStorage.getItem('editMode_draft_chainInput')), { timeout: 5000 }).not.toBeNull();

    await popup.click('#singleClearBtn');
    await popup.click('#bulkClearBtn');
    await popup.click('#chainClearBtn');

    await expect.poll(() => popup.evaluate(() => localStorage.getItem('editMode_draft_singleInput')), { timeout: 5000 }).toBeNull();
    await expect.poll(() => popup.evaluate(() => localStorage.getItem('editMode_draft_bulkInput')), { timeout: 5000 }).toBeNull();
    await expect.poll(() => popup.evaluate(() => localStorage.getItem('editMode_draft_chainInput')), { timeout: 5000 }).toBeNull();

    await expect(popup.locator('#singleInput')).toHaveValue('');
    await expect(popup.locator('#bulkInput')).toHaveValue('');
    await expect(popup.locator('#chainInput')).toHaveValue('');
  });

  test('tab switch is blocked with confirmation when a draft is present and user cancels', async ({ page }) => {
    await installMocks(page.context());
    const popup = await openEditModePopup(page);

    await fillAndSaveDraft(popup, '#singleInput', 'Unsaved single draft');

    let dialogMessage = null;
    let dialogCount = 0;
    popup.once('dialog', async (dialog) => {
      dialogMessage = dialog.message();
      dialogCount += 1;
      await dialog.dismiss(); // dismiss = cancel = stay on Places tab
    });

    await popup.click('[data-tab="automation"]');

    expect(dialogCount).toBe(1);
    expect(String(dialogMessage || '')).toContain('unsaved draft');
    // Tab should not have changed — Places tab still active
    await expect(popup.locator('#places-tab')).toHaveClass(/active/);
    await expect(popup.locator('#automation-tab')).not.toHaveClass(/active/);
  });

  test('tab switch proceeds when user accepts the confirm dialog', async ({ page }) => {
    await installMocks(page.context());
    const popup = await openEditModePopup(page);

    await fillAndSaveDraft(popup, '#bulkInput', 'Bulk draft that I will abandon');

    popup.once('dialog', async (dialog) => {
      await dialog.accept();
    });

    await popup.click('[data-tab="automation"]');

    await expect(popup.locator('#automation-tab')).toHaveClass(/active/);
  });

  test('draft is cleared from localStorage after a successful single submit', async ({ page }) => {
    const graphCalls = [];
    await installMocks(page.context(), graphCalls);
    const popup = await openEditModePopup(page);

    await popup.evaluate(() => {
      window.searchFestivalEvents = async (query) => {
        if (String(query || '').toLowerCase().includes('apple blossom')) {
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
        return [];
      };
    });

    await popup.selectOption('#actionTargetSelect', 'ent_festivals');
    await popup.selectOption('#singleInputType', 'placeName');
    await fillAndSaveDraft(popup, '#singleInput', 'Apple Blossom Festival');

    await expect.poll(() => popup.evaluate(() => localStorage.getItem('editMode_draft_singleInput')), { timeout: 5000 }).not.toBeNull();

    // Mock window.confirm to auto-accept the target confirmation dialog
    // (tests 3 & 4 use Playwright's native dialog handler for the tab-switch confirm,
    // but this test needs the submit confirm to return true automatically)
    await popup.evaluate(() => {
      window.confirm = () => true;
    });

    await popup.click('#singleSubmitBtn');
    await expect.poll(() => graphCalls.length, { timeout: 10000 }).toBe(1);

    await expect.poll(() => popup.evaluate(() => localStorage.getItem('editMode_draft_singleInput')), { timeout: 5000 }).toBeNull();
  });
});

