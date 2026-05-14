const { test, expect } = require('./reliability-test');
const { openAdventureChallenge, setAppMode } = require('./playwright-helpers');

async function sectionHiddenForElement(page, elementId) {
  return page.evaluate((id) => {
    const target = document.getElementById(id);
    if (!target) return null;
    const section = target.closest('[data-concert-view]');
    if (!section) return null;
    return !!section.hidden;
  }, elementId);
}

async function isElementHiddenOrMissing(page, elementId) {
  return page.evaluate((id) => {
    const el = document.getElementById(id);
    if (!el) return true;
    const style = window.getComputedStyle(el);
    return el.hidden || style.display === 'none' || style.visibility === 'hidden';
  }, elementId);
}

async function seedConcertsBandCardFixture(page) {
  await page.evaluate(() => {
    const api = window.HouseholdConcerts;
    const state = api && api.__state;
    if (!state) return;
    state.favoriteBands = [{
      id: 'fixture-band-1',
      bandName: 'Fixture Band',
      bandTier: 'Tier 2 (Great Bands / Great Live)',
      origin: 'Charlotte, NC',
      founded: '2010',
      recordLabel: 'Fixture Label',
      topSongs: 'Song A, Song B',
      memberTimeline: '2010-2014: original lineup',
      lastReleaseDate: '2025-03-10',
      bandsintownUrl: 'https://www.bandsintown.com/a/fixture-band',
      members: ['Member 1', 'Member 2'],
      genres: ['Rock']
    }];
    state.attendedConcerts = [];
    state.upcomingConcerts = [];
    state.activeBandKey = 'fixture-band-1';
    if (api && typeof api.init === 'function') api.init(document.getElementById('visitedLocationsRoot'));
  });
}

test.describe('Adventure Concerts daily layout + chrome regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      // Keep tests local-only; these assertions do not require workbook I/O.
      window.accessToken = '';
    });
  });

  test('daily mode uses Overview/My Stats/Upcoming placement and hides TV/Shortcuts chrome', async ({ page }) => {
    await openAdventureChallenge(page, { mode: 'daily', subtabKey: 'concerts' });

    const pane = page.locator('#visitedProgressPane-concerts #householdConcertsPane');
    await expect(pane).toBeVisible();

    await expect(pane.locator('.household-concerts-feature-tab[data-view="upcoming"]')).toBeVisible();

    // Default (Overview) should not contain moved sections in daily mode.
    expect(await sectionHiddenForElement(page, 'householdConcertsAttendedList')).toBe(true);
    expect(await sectionHiddenForElement(page, 'householdConcertsUpcomingList')).toBe(true);
    expect(await sectionHiddenForElement(page, 'householdConcertsTicketedCalendar')).toBe(true);
    expect(await sectionHiddenForElement(page, 'householdConcertsPriorityDashboard')).toBe(true);
    expect(await sectionHiddenForElement(page, 'householdConcertsFestivalDashboard')).toBe(true);

    await pane.locator('.household-concerts-feature-tab[data-view="stats"]').click();
    expect(await sectionHiddenForElement(page, 'householdConcertsAttendedList')).toBe(false);
    expect(await sectionHiddenForElement(page, 'householdConcertsUpcomingList')).toBe(true);

    await pane.locator('.household-concerts-feature-tab[data-view="upcoming"]').click();
    expect(await sectionHiddenForElement(page, 'householdConcertsUpcomingList')).toBe(false);
    expect(await sectionHiddenForElement(page, 'householdConcertsTicketedCalendar')).toBe(false);
    expect(await sectionHiddenForElement(page, 'householdConcertsPriorityDashboard')).toBe(false);
    expect(await sectionHiddenForElement(page, 'householdConcertsFestivalDashboard')).toBe(false);

    expect(await isElementHiddenOrMissing(page, 'tvModeHeaderBtn')).toBe(true);
    expect(await isElementHiddenOrMissing(page, 'pageShortcutHelpToggle')).toBe(true);
  });

  test('advanced mode keeps moved sections in Overview and does not force-hide chrome', async ({ page }) => {
    await openAdventureChallenge(page, { mode: 'advanced', subtabKey: 'concerts' });

    const pane = page.locator('#visitedProgressPane-concerts #householdConcertsPane');
    await expect(pane).toBeVisible();

    await expect(pane.locator('.household-concerts-feature-tab[data-view="upcoming"]')).toBeHidden();

    // In advanced mode, these sections remain in Overview.
    expect(await sectionHiddenForElement(page, 'householdConcertsAttendedList')).toBe(false);
    expect(await sectionHiddenForElement(page, 'householdConcertsUpcomingList')).toBe(false);
    expect(await sectionHiddenForElement(page, 'householdConcertsTicketedCalendar')).toBe(false);
    expect(await sectionHiddenForElement(page, 'householdConcertsPriorityDashboard')).toBe(false);
    expect(await sectionHiddenForElement(page, 'householdConcertsFestivalDashboard')).toBe(false);

    const tvHeaderForcedHidden = await page.evaluate(() => {
      const el = document.getElementById('tvModeHeaderBtn');
      return !!el && el.hidden;
    });
    expect(tvHeaderForcedHidden).toBe(false);

    const shortcutsForcedHidden = await page.evaluate(() => {
      const el = document.getElementById('pageShortcutHelpToggle');
      return !!el && el.hidden;
    });
    expect(shortcutsForcedHidden).toBe(false);
  });

  test('switching mode while already on Concerts flips section placement and chrome in-session', async ({ page }) => {
    await openAdventureChallenge(page, { mode: 'advanced', subtabKey: 'concerts' });

    // Advanced baseline: moved sections are still in Overview.
    expect(await sectionHiddenForElement(page, 'householdConcertsAttendedList')).toBe(false);
    expect(await sectionHiddenForElement(page, 'householdConcertsUpcomingList')).toBe(false);
    await expect(page.locator('#householdConcertsPane .household-concerts-feature-tab[data-view="upcoming"]')).toBeHidden();
    expect(await isElementHiddenOrMissing(page, 'tvModeHeaderBtn')).toBe(false);

    await setAppMode(page, 'daily');

    await expect.poll(() => sectionHiddenForElement(page, 'householdConcertsAttendedList')).toBe(true);
    await expect.poll(() => sectionHiddenForElement(page, 'householdConcertsUpcomingList')).toBe(true);
    await expect(page.locator('#householdConcertsPane .household-concerts-feature-tab[data-view="upcoming"]')).toBeVisible();
    await expect.poll(() => isElementHiddenOrMissing(page, 'tvModeHeaderBtn')).toBe(true);
    await expect.poll(() => isElementHiddenOrMissing(page, 'pageShortcutHelpToggle')).toBe(true);

    await setAppMode(page, 'advanced');

    await expect.poll(() => sectionHiddenForElement(page, 'householdConcertsAttendedList')).toBe(false);
    await expect.poll(() => sectionHiddenForElement(page, 'householdConcertsUpcomingList')).toBe(false);
    await expect(page.locator('#householdConcertsPane .household-concerts-feature-tab[data-view="upcoming"]')).toBeHidden();

    // Verify advanced mode restores both discovery and diagnostics surfaces.
    await expect.poll(() => page.evaluate(() => {
      const discoveryPanel = document.getElementById('householdConcertsDiscovery')?.closest('.household-concerts-panel');
      return !!(discoveryPanel && !discoveryPanel.hidden);
    })).toBe(true);
    await expect.poll(() => isElementHiddenOrMissing(page, 'persistentDiagnosticsStatusLine')).toBe(false);
  });

  test('daily mode hides requested band-card content/actions and defaults to compact density', async ({ page }) => {
    await openAdventureChallenge(page, { mode: 'daily', subtabKey: 'concerts' });
    await seedConcertsBandCardFixture(page);

    const card = page.locator('#householdConcertsFavoritesGrid .household-concerts-band-card').first();
    await expect(card).toBeVisible();

    await expect(card).not.toContainText('Latest Release');
    await expect(card).not.toContainText('Top Songs');
    await expect(card).not.toContainText('Lineup Timeline');
    await expect(card).not.toContainText('Label');
    await expect(card.locator('.household-concerts-detail-line strong:has-text("Tier")')).toHaveCount(0);

    await expect(card.locator('[data-concert-action="open-band-image-picker"]')).toHaveCount(0);
    await expect(card.locator('[data-concert-action="sync-tour"]')).toHaveCount(0);
    await expect(card.locator('[data-concert-action="enrich-missing-links"]')).toHaveCount(0);
    await expect(card.locator('[data-concert-action="select-band"]')).toHaveCount(0);
    await expect(card.locator('[data-concert-action="refresh-band-profile"]')).toHaveCount(0);

    await expect(page.locator('#householdConcertsFavoritesGrid .household-concerts-band-grid.is-compact')).toBeVisible();
    await expect(page.locator('#householdConcertsPane [data-concert-action="set-band-card-density"][data-density="compact"]')).toHaveClass(/is-active/);

    // Discovery panel and diagnostics status bar are hidden in daily concerts mode.
    expect(await page.evaluate(() => {
      const discoveryPanel = document.getElementById('householdConcertsDiscovery')?.closest('.household-concerts-panel');
      return !!(discoveryPanel && discoveryPanel.hidden);
    })).toBe(true);
    expect(await isElementHiddenOrMissing(page, 'persistentDiagnosticsStatusLine')).toBe(true);
  });
});

