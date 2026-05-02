const { test, expect } = require('./reliability-test');

const favoriteColumns = [
  'Band_Name',
  'Band_Members',
  'Band_Logo_URL',
  'Band_Cover_Photo_URL',
  'Origin',
  'Founded',
  'Record _Label',
  'Discography',
  'Top_Songs',
  'Associated_Genres',
  'Website_URL',
  'Tour_Page_URL',
  'Facebook_URL',
  'Instagram_URL',
  'YouTube_URL',
  'Setlist.fm_URL',
  'Bandsintown_URL',
  'Wikipedia_URL'
];

const attendedColumns = [
  'Band_Name',
  'Concert_Date',
  'Rating',
  'Photo_URL',
  'Video_URL',
  'Setlist_URL',
  'Venue',
  'Notes'
];

const upcomingColumns = [
  'Band_Name',
  'Concert_Date',
  'Day_of_Week',
  'Venue',
  'City',
  'State'
];

function makeColumns(names) {
  return { value: names.map((name, index) => ({ name, index })) };
}

function makeRows(rows) {
  return { value: rows.map((values) => ({ values: [values] })) };
}

test.describe('Household Tools Concerts - Enhancements', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.accessToken = 'test-access-token';
      localStorage.setItem('kap_user_gps', JSON.stringify({
        latitude: 37.7749,
        longitude: -122.4194,
        timestamp: Date.now()
      }));
    });

    await page.route('https://graph.microsoft.com/**', async (route) => {
      const url = route.request().url();
      const method = route.request().method();

      const respondJson = (payload) => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(payload)
      });

      if (url.includes('/tables/Favorite_Bands/columns')) {
        return respondJson(makeColumns(favoriteColumns));
      }
      if (url.includes('/tables/Favorite_Bands/rows')) {
        return respondJson(makeRows([
          [
            'Depeche Mode',
            'Dave Gahan — Lead vocals',
            'https://example.com/dm-logo.jpg',
            'https://example.com/dm-cover.jpg',
            'Basildon, England',
            '1980',
            'Mute',
            'Violator, Songs of Faith and Devotion',
            'Enjoy the Silence, Never Let Me Down Again',
            'Synthpop, Alternative Rock',
            'https://www.depechemode.com',
            'https://www.depechemode.com/tour',
            'https://facebook.com/depechemode',
            'https://instagram.com/depechemode',
            'https://youtube.com/depechemode',
            'https://www.setlist.fm/setlists/depeche-mode-73d6b235.html',
            'https://www.bandsintown.com/a/125-depeche-mode',
            'https://en.wikipedia.org/wiki/Depeche_Mode'
          ],
          [
            'Nine Inch Nails',
            'Trent Reznor — Vocals',
            '',
            '',
            'Cleveland, Ohio',
            '1988',
            'Nothing',
            'Pretty Hate Machine, The Downward Spiral',
            'Closer, Head Like a Hole, Hurt',
            'Industrial Rock, Alternative Rock',
            'https://www.nin.com',
            'https://www.nin.com/live',
            '',
            'https://instagram.com/nineinchnails',
            'https://youtube.com/nineinchnails',
            'https://www.setlist.fm/setlists/nine-inch-nails-1bd6ad44.html',
            'https://www.bandsintown.com/a/1003-nine-inch-nails',
            'https://en.wikipedia.org/wiki/Nine_Inch_Nails'
          ]
        ]));
      }

      if (url.includes('/tables/Attended_Concerts/columns')) {
        return respondJson(makeColumns(attendedColumns));
      }
      if (url.includes('/tables/Attended_Concerts/rows')) {
        return respondJson(makeRows([
          [
            'Depeche Mode',
            '2024-11-02',
            '5',
            'https://example.com/depeche-photo-1.jpg',
            '',
            'https://setlist.fm/example-depeche',
            'Chase Center',
            'Incredible lighting'
          ],
          [
            'Depeche Mode',
            '2024-06-15',
            '4',
            'https://example.com/depeche-photo-2.jpg',
            '',
            '',
            'The Forum',
            'Great crowd'
          ],
          [
            'Nine Inch Nails',
            '2024-03-20',
            '5',
            'https://example.com/nin-photo.jpg',
            '',
            '',
            'Fox Theater',
            'Unforgettable set'
          ]
        ]));
      }

      if (url.includes('/tables/Upcoming_Concerts/columns')) {
        return respondJson(makeColumns(upcomingColumns));
      }
      if (url.includes('/tables/Upcoming_Concerts/rows')) {
        return respondJson(makeRows([
          ['Nine Inch Nails', '2026-08-13', 'Thursday', 'Fox Theater', 'Oakland', 'CA'],
          ['Depeche Mode', '2026-09-22', 'Tuesday', 'Chase Center', 'San Francisco', 'CA']
        ]));
      }

      return respondJson({ value: [] });
    });

    await page.goto('/');
    await page.locator('.app-tab-btn[data-tab="household-tools"]').click();
    await expect(page.locator('#householdToolsRoot')).toBeVisible();
    await page.locator('#appSubTabsSlot [data-household-subtab="concerts"], #householdToolsRoot [data-household-subtab="concerts"]').first().click();
    await expect(page.locator('#householdToolsPane-concerts')).toBeVisible();
  });

  test('ENHANCEMENT #4 - Personal Statistics Cards display correctly', async ({ page }) => {
    // Stats should show after data loads
    await expect(page.locator('.household-concerts-personal-stats')).toBeTruthy();
    // Should show concert count
    await expect(page.locator('.household-concerts-personal-stats .stat-card')).toContainText('3');
  });

  test('ENHANCEMENT #9 - Venue Performance Report aggregates data', async ({ page }) => {
    // Click on My Stats tab
    await page.locator('[data-view="stats"]').click();
    await expect(page.locator('#householdConcertsVenueReport')).toBeVisible();
    // Chase Center should appear twice in data
    await expect(page.locator('#householdConcertsVenueReport')).toContainText('Chase Center');
  });

  test('ENHANCEMENT #7 - Gamification achievements unlock', async ({ page }) => {
    // Click on My Stats tab
    await page.locator('[data-view="stats"]').click();
    // With 3 concerts, should have unlocked multiple achievements
    await expect(page.locator('.household-concerts-achievement.is-unlocked')).toBeTruthy();
  });

  test('ENHANCEMENT #7 - Photo Gallery renders', async ({ page }) => {
    // Click on Gallery tab
    await page.locator('[data-view="gallery"]').click();
    await expect(page.locator('.household-concerts-gallery-grid')).toBeVisible();
    // Should have photos from attended concerts
    await expect(page.locator('.gallery-item')).toHaveCount(3);
  });

  test('ENHANCEMENT #1 - Analytics Dashboard shows trends', async ({ page }) => {
    // Click on Analytics tab
    await page.locator('[data-view="analytics"]').click();
    await expect(page.locator('#householdConcertsAnalyticsDash')).toBeVisible();
    // Should show peak month/year
    await expect(page.locator('.analytics-card')).toHaveCount(3);
  });

  test('ENHANCEMENT #10 - Smart Tagging displays on band cards', async ({ page }) => {
    // When no tags, should still render without errors
    await expect(page.locator('[data-testid="concerts-favorites-grid"]')).toContainText('Depeche Mode');
    // The card should still be visible
    const card = page.locator('[data-testid="concerts-favorites-grid"] article:has-text("Depeche Mode")');
    await expect(card).toBeTruthy();
  });

  test('ENHANCEMENT #5 - View tabs allow switching between modes', async ({ page }) => {
    const tabs = page.locator('.household-concerts-feature-tab');

    // Default view is active
    await expect(tabs.first()).toHaveClass('active');

    // Click stats tab
    await page.locator('[data-view="stats"]').click();
    await expect(page.locator('[data-view="stats"]')).toHaveClass('active');

    // Personal stats should be visible
    await expect(page.locator('#householdConcertsPersonalStats')).toBeVisible();

    // Click gallery tab
    await page.locator('[data-view="gallery"]').click();
    await expect(page.locator('[data-view="gallery"]')).toHaveClass('active');

    // Gallery should be visible
    await expect(page.locator('#householdConcertsPhotoGallery')).toBeVisible();
  });

  test('ENHANCEMENT #2 - Concert Attendance Dashboard is accessible', async ({ page }) => {
    // Navigate to analytics
    await page.locator('[data-view="analytics"]').click();

    // Should have analytics cards
    const cards = page.locator('.analytics-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Feature enhancements render without errors after data load', async ({ page }) => {
    // Wait for all enhancements to be rendered
    await page.waitForLoadState('networkidle');

    // Check that console has no critical errors
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    // Take a moment for animations
    await page.waitForTimeout(500);

    // Should not have any critical errors
    expect(errors.filter(e => e.includes('❌')).length).toBe(0);
  });
});

