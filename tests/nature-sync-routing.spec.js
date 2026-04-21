/**
 * nature-sync-routing.spec.js
 *
 * Asserts that Graph /rows/add POSTs are routed to the correct Excel table name
 * for each nature sub-tab category:
 *
 *   birds     → birds_sightings       (Nature_Sightings.xlsx)
 *   mammals   → mammals_sightings     (Nature_Sightings.xlsx)
 *   insects   → Insects_sightings     (Nature_Sightings.xlsx)
 *   trees     → Trees_Shrubs_sightings (Nature_Sightings.xlsx)
 *
 * All categories resolve to Nature_Sightings.xlsx at runtime; the routing
 * discriminator is the table name embedded in the Graph URL.
 */

const { test, expect } = require('./reliability-test');

// ---------------------------------------------------------------------------
// Expected routing table
// ---------------------------------------------------------------------------
const EXPECTED_ROUTES = {
  birds: {
    sightingsTable: 'birds_sightings',
    userStateTable: 'birds_user_state'
  },
  mammals: {
    sightingsTable: 'mammals_sightings',
    userStateTable: 'mammals_user_state'
  },
  insects: {
    sightingsTable: 'Insects_sightings',
    userStateTable: 'Insects_user_data'
  },
  trees: {
    sightingsTable: 'Trees_Shrubs_sightings',
    userStateTable: 'Trees_Shrubs_user_data'
  }
};

// Required columns accepted by every sightings table mock
const MOCK_SIGHTINGS_COLUMNS = [
  'event_id',
  'user_id',
  'device_id',
  'species_status_key',
  'species_id',
  'canonical_id',
  'date_observed',
  'count',
  'is_deleted',
  'created_at',
  'updated_at',
  'location_name',
  'photo_url',
  'audio_url'
];

// Required columns accepted by every user-state table mock
const MOCK_USER_STATE_COLUMNS = [
  'state_id',
  'user_id',
  'species_status_key',
  'species_id',
  'canonical_id',
  'is_favorite',
  'created_at',
  'updated_at'
];

// ---------------------------------------------------------------------------
// Build one sync-queue log-sighting item per category
// ---------------------------------------------------------------------------
function buildQueueItem(subTabKey, index) {
  return {
    id: `test-item-${subTabKey}-${index}`,
    type: 'log-sighting',
    attempts: 0,
    createdAt: new Date().toISOString(),
    payload: {
      subTabKey,
      id: `s-test-${subTabKey}-${index}`,
      speciesId: `sp-${subTabKey}-${index}`,
      speciesStatusKey: `${subTabKey}_sp_${index}`,
      canonicalId: `sp-${subTabKey}-${index}`,
      speciesName: `Test ${subTabKey} Species ${index}`,
      familyLabel: 'Test Family',
      dateObserved: '2026-04-21',
      locationName: 'Test Location',
      count: 1,
      region: '',
      habitat: '',
      latitude: null,
      longitude: null,
      confidence: 'certain',
      notes: '',
      photoUrl: '',
      audioUrl: '',
      createdAt: new Date().toISOString(),
      synced: false
    }
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract the decoded workbook path segment from a Graph URL.
 * e.g. ".../root:/Copilot_Apps%2F...%2FNature_Sightings.xlsx:/workbook/..."
 *      → "Copilot_Apps/Kyles_Adventure_Finder/Nature_Sightings.xlsx"
 *    or ".../root:/Nature_Sightings.xlsx:/workbook/..."
 *      → "Nature_Sightings.xlsx"
 */
function extractWorkbookPath(url) {
  const match = url.match(/\/root:\/(.*?):\/workbook/);
  return match ? decodeURIComponent(match[1]) : '';
}

/**
 * Extract the table name from a Graph URL.
 * e.g. ".../tables/birds_sightings/rows/add"
 *      → "birds_sightings"
 */
function extractTableName(url) {
  const match = url.match(/\/tables\/([^/]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

// ---------------------------------------------------------------------------
// Graph mock installer
// ---------------------------------------------------------------------------
async function installNatureSyncGraphMocks(page, graphPosts) {
  await page.route('https://graph.microsoft.com/**', async (route) => {
    const request = route.request();
    const url = request.url();
    const method = request.method();

    // Column probes for workbook discovery — return generic required columns
    if (method === 'GET' && url.includes('/columns')) {
      const tableName = extractTableName(url);
      const isUserState = tableName.includes('user_state') || tableName.includes('user_data');
      const cols = isUserState ? MOCK_USER_STATE_COLUMNS : MOCK_SIGHTINGS_COLUMNS;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          value: cols.map((name, index) => ({ name, index }))
        })
      });
      return;
    }

    // Row reads (workbook discovery probe or schema fetch)
    if (method === 'GET' && url.includes('/rows')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ value: [] })
      });
      return;
    }

    // Row writes — capture for assertion
    if (method === 'POST' && url.includes('/rows/add')) {
      const workbookPath = extractWorkbookPath(url);
      const tableName = extractTableName(url);
      graphPosts.push({ url, workbookPath, tableName });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true })
      });
      return;
    }

    // All other Graph calls
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ value: [] })
    });
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Nature sync routing — Graph table-name assertions', () => {
  test('each category logs a sighting to the correct Excel table name', async ({ page }) => {
    const graphPosts = [];

    // 1. Seed localStorage with sync queue before page load
    await page.addInitScript((queueKey) => {
      const items = [
        { subTabKey: 'birds', idx: 0 },
        { subTabKey: 'mammals', idx: 1 },
        { subTabKey: 'insects', idx: 2 },
        { subTabKey: 'trees', idx: 3 }
      ].map(({ subTabKey, idx }) => ({
        id: `test-item-${subTabKey}-${idx}`,
        type: 'log-sighting',
        attempts: 0,
        createdAt: new Date().toISOString(),
        payload: {
          subTabKey,
          id: `s-test-${subTabKey}-${idx}`,
          speciesId: `sp-${subTabKey}-${idx}`,
          speciesStatusKey: `${subTabKey}_sp_${idx}`,
          canonicalId: `sp-${subTabKey}-${idx}`,
          speciesName: `Test ${subTabKey} Species ${idx}`,
          familyLabel: 'Test Family',
          dateObserved: '2026-04-21',
          locationName: 'Test Location',
          count: 1,
          region: '',
          habitat: '',
          latitude: null,
          longitude: null,
          confidence: 'certain',
          notes: '',
          photoUrl: '',
          audioUrl: '',
          createdAt: new Date().toISOString(),
          synced: false
        }
      }));
      localStorage.setItem(queueKey, JSON.stringify(items));
      window.accessToken = 'playwright-mock-token';
      window.activeAccount = { username: 'test@example.com', name: 'Test User' };
    }, 'natureChallengeBirdSyncQueueV1');

    // 2. Install Graph route mocks
    await installNatureSyncGraphMocks(page, graphPosts);

    // 3. Load the app
    await page.goto('/');
    await page.locator('.app-tab-btn[data-tab="nature-challenge"]').click();
    await expect(page.locator('#natureChallengeRoot')).toBeVisible();

    // 4. Wait for the nature system to fully boot (dock and sync button present)
    await page.waitForFunction(() => {
      const dockedTabs = document.querySelector('#appSubTabsSlot .nature-challenge-subtabs');
      const syncBtn = document.getElementById('birdsSyncNowBtn');
      return Boolean(dockedTabs && dockedTabs.dataset.natureDockBound === '1' && syncBtn);
    }, null, { timeout: 20000 });

    // Ensure accessToken is still set (hydrate in page context after load)
    await page.evaluate(() => {
      window.accessToken = 'playwright-mock-token';
      window.activeAccount = { username: 'test@example.com', name: 'Test User' };
      if (typeof window.showToast !== 'function') window.showToast = () => {};
    });

    // 5. Trigger sync — the button lives inside a collapsed <details> panel,
    //    so click it programmatically to avoid a visibility check.
    await page.evaluate(() => {
      const btn = document.getElementById('birdsSyncNowBtn');
      if (!btn) throw new Error('birdsSyncNowBtn not found in DOM');
      btn.click();
    });

    // 6. Wait for all 4 sighting POSTs (birds + mammals + insects + trees)
    await expect.poll(
      () => graphPosts.filter((p) => p.url.includes('/rows/add')).length,
      { timeout: 25000, message: 'Expected 4 sightings row/add POSTs (one per category)' }
    ).toBeGreaterThanOrEqual(4);

    // 7. Assert each category hit the correct table name
    for (const [category, expected] of Object.entries(EXPECTED_ROUTES)) {
      const postForCategory = graphPosts.find((p) => p.tableName === expected.sightingsTable);
      expect(
        postForCategory,
        `Expected a Graph POST to table "${expected.sightingsTable}" for category "${category}" but none was found.\nActual POSTs: ${JSON.stringify(graphPosts.map((p) => ({ table: p.tableName, workbook: p.workbookPath })), null, 2)}`
      ).toBeTruthy();

      expect(
        postForCategory.workbookPath,
        `"${category}" sightings should be written to a Nature_Sightings.xlsx workbook`
      ).toMatch(/Nature_Sightings\.xlsx$/i);
    }
  });

  test('birds sightings are isolated from non-bird sightings in the queue', async ({ page }) => {
    const graphPosts = [];

    // Seed queue: two birds items + one mammal item
    await page.addInitScript((queueKey) => {
      const items = [
        { subTabKey: 'birds', idx: 0 },
        { subTabKey: 'birds', idx: 1 },
        { subTabKey: 'mammals', idx: 2 }
      ].map(({ subTabKey, idx }) => ({
        id: `iso-test-${subTabKey}-${idx}`,
        type: 'log-sighting',
        attempts: 0,
        createdAt: new Date().toISOString(),
        payload: {
          subTabKey,
          id: `s-iso-${subTabKey}-${idx}`,
          speciesId: `sp-${subTabKey}-${idx}`,
          speciesStatusKey: `${subTabKey}_sp_${idx}`,
          canonicalId: `sp-${subTabKey}-${idx}`,
          speciesName: `Isolation ${subTabKey} ${idx}`,
          familyLabel: 'Iso Family',
          dateObserved: '2026-04-21',
          locationName: '',
          count: 1,
          region: '',
          habitat: '',
          latitude: null,
          longitude: null,
          confidence: 'certain',
          notes: '',
          photoUrl: '',
          audioUrl: '',
          createdAt: new Date().toISOString(),
          synced: false
        }
      }));
      localStorage.setItem(queueKey, JSON.stringify(items));
      window.accessToken = 'playwright-mock-token';
      window.activeAccount = { username: 'test@example.com', name: 'Test User' };
    }, 'natureChallengeBirdSyncQueueV1');

    await installNatureSyncGraphMocks(page, graphPosts);

    await page.goto('/');
    await page.locator('.app-tab-btn[data-tab="nature-challenge"]').click();
    await expect(page.locator('#natureChallengeRoot')).toBeVisible();
    await page.waitForFunction(() => {
      const dockedTabs = document.querySelector('#appSubTabsSlot .nature-challenge-subtabs');
      const syncBtn = document.getElementById('birdsSyncNowBtn');
      return Boolean(dockedTabs && dockedTabs.dataset.natureDockBound === '1' && syncBtn);
    }, null, { timeout: 20000 });

    await page.evaluate(() => {
      window.accessToken = 'playwright-mock-token';
      window.activeAccount = { username: 'test@example.com', name: 'Test User' };
      if (typeof window.showToast !== 'function') window.showToast = () => {};
    });

    await page.evaluate(() => {
      const btn = document.getElementById('birdsSyncNowBtn');
      if (!btn) throw new Error('birdsSyncNowBtn not found in DOM');
      btn.click();
    });

    // Expect exactly 3 row adds: 2 birds + 1 mammal
    await expect.poll(
      () => graphPosts.filter((p) => p.url.includes('/rows/add')).length,
      { timeout: 20000, message: 'Expected 3 sightings POSTs (2 birds + 1 mammal)' }
    ).toBeGreaterThanOrEqual(3);

    const birdPosts = graphPosts.filter((p) => p.tableName === 'birds_sightings');
    const mammalPosts = graphPosts.filter((p) => p.tableName === 'mammals_sightings');
    const otherPosts = graphPosts.filter(
      (p) => p.tableName !== 'birds_sightings' && p.tableName !== 'mammals_sightings'
    );

    // Two birds items → two POSTs to birds_sightings
    expect(birdPosts.length, 'Should have 2 birds_sightings POSTs').toBe(2);

    // One mammal item → one POST to mammals_sightings
    expect(mammalPosts.length, 'Should have 1 mammals_sightings POST').toBe(1);

    // No sightings rows added to any other table
    expect(
      otherPosts.length,
      `Unexpected sightings POSTs to other tables: ${otherPosts.map((p) => p.tableName).join(', ')}`
    ).toBe(0);
  });

  test('insects and trees route to distinct table names even when sharing the same workbook', async ({ page }) => {
    const graphPosts = [];

    await page.addInitScript((queueKey) => {
      const items = [
        { subTabKey: 'insects', idx: 0 },
        { subTabKey: 'trees', idx: 1 }
      ].map(({ subTabKey, idx }) => ({
        id: `it-test-${subTabKey}-${idx}`,
        type: 'log-sighting',
        attempts: 0,
        createdAt: new Date().toISOString(),
        payload: {
          subTabKey,
          id: `s-it-${subTabKey}-${idx}`,
          speciesId: `sp-${subTabKey}-${idx}`,
          speciesStatusKey: `${subTabKey}_sp_${idx}`,
          canonicalId: `sp-${subTabKey}-${idx}`,
          speciesName: `IT Test ${subTabKey} ${idx}`,
          familyLabel: 'IT Family',
          dateObserved: '2026-04-21',
          locationName: '',
          count: 1,
          region: '',
          habitat: '',
          latitude: null,
          longitude: null,
          confidence: 'certain',
          notes: '',
          photoUrl: '',
          audioUrl: '',
          createdAt: new Date().toISOString(),
          synced: false
        }
      }));
      localStorage.setItem(queueKey, JSON.stringify(items));
      window.accessToken = 'playwright-mock-token';
      window.activeAccount = { username: 'test@example.com', name: 'Test User' };
    }, 'natureChallengeBirdSyncQueueV1');

    await installNatureSyncGraphMocks(page, graphPosts);

    await page.goto('/');
    await page.locator('.app-tab-btn[data-tab="nature-challenge"]').click();
    await expect(page.locator('#natureChallengeRoot')).toBeVisible();
    await page.waitForFunction(() => {
      const syncBtn = document.getElementById('birdsSyncNowBtn');
      return Boolean(syncBtn);
    }, null, { timeout: 20000 });

    await page.evaluate(() => {
      window.accessToken = 'playwright-mock-token';
      window.activeAccount = { username: 'test@example.com', name: 'Test User' };
      if (typeof window.showToast !== 'function') window.showToast = () => {};
    });

    await page.evaluate(() => {
      const btn = document.getElementById('birdsSyncNowBtn');
      if (!btn) throw new Error('birdsSyncNowBtn not found in DOM');
      btn.click();
    });

    await expect.poll(
      () => graphPosts.filter((p) => p.url.includes('/rows/add')).length,
      { timeout: 20000 }
    ).toBeGreaterThanOrEqual(2);

    const insectPost = graphPosts.find((p) => p.tableName === 'Insects_sightings');
    const treesPost = graphPosts.find((p) => p.tableName === 'Trees_Shrubs_sightings');

    expect(insectPost, 'insects must POST to Insects_sightings').toBeTruthy();
    expect(treesPost, 'trees must POST to Trees_Shrubs_sightings').toBeTruthy();

    // Both should resolve to the same workbook (Nature_Sightings.xlsx)
    expect(insectPost.workbookPath).toMatch(/Nature_Sightings\.xlsx$/i);
    expect(treesPost.workbookPath).toMatch(/Nature_Sightings\.xlsx$/i);

    // But they must not have been sent to the same table
    expect(insectPost.tableName).not.toBe(treesPost.tableName);
  });
});

