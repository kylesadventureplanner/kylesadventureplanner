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

test.describe('Household Tools Concerts - Bandsintown proxy', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.accessToken = 'test-access-token';
      window.__forceBandsintownProxy = true;

      window.__proxyBandsintownRequests = [];
      window.__directBandsintownRequests = [];

      const originalFetch = window.fetch.bind(window);
      window.fetch = async function patchedFetch(input, init) {
        const rawUrl = typeof input === 'string' ? input : (input && input.url) || '';
        const resolvedUrl = new URL(String(rawUrl || ''), window.location.origin);

        if (resolvedUrl.pathname === '/api/public/bandsintown') {
          window.__proxyBandsintownRequests.push(resolvedUrl.toString());
          const routeName = String(resolvedUrl.searchParams.get('route') || '').toLowerCase();
          const artist = String(resolvedUrl.searchParams.get('artist') || '').toLowerCase();
          let data = routeName === 'events' ? [] : { name: '', url: '' };

          if (routeName === 'artist' && artist.includes('queens of the stone age')) {
            data = {
              name: 'Queens of the Stone Age',
              url: 'https://www.bandsintown.com/a/12345-queens-of-the-stone-age'
            };
          }

          if (routeName === 'artist' && artist.includes('nine inch nails')) {
            data = {
              name: 'Nine Inch Nails',
              url: 'https://www.bandsintown.com/a/1003-nine-inch-nails'
            };
          }

          if (routeName === 'events' && (artist.includes('nine inch nails') || artist.includes('1003-nine-inch-nails'))) {
            data = [];
          }

          return new Response(JSON.stringify({ ok: true, route: routeName, artist, data }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        if (resolvedUrl.pathname === '/api/public/historic-shows') {
          return new Response(JSON.stringify({ ok: true, mode: 'song-stats', data: [] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        if (/^https:\/\/www\.bandsintown\.com\/api\/v2\/artists\//i.test(resolvedUrl.toString())) {
          window.__directBandsintownRequests.push(resolvedUrl.toString());
          return new Response(JSON.stringify({ name: '', url: '' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        return originalFetch(input, init);
      };
    });

    await page.route('https://graph.microsoft.com/**', async (route) => {
      const url = route.request().url();
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
            'Nine Inch Nails',
            'Trent Reznor — Vocals\nAtticus Ross — Keys',
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
        return respondJson(makeRows([]));
      }

      if (url.includes('/tables/Upcoming_Concerts/columns')) {
        return respondJson(makeColumns(upcomingColumns));
      }
      if (url.includes('/tables/Upcoming_Concerts/rows')) {
        return respondJson(makeRows([]));
      }

      return respondJson({ value: [] });
    });

    await page.route('https://itunes.apple.com/search**', async (route) => {
      const url = new URL(route.request().url());
      const term = String(url.searchParams.get('term') || '').toLowerCase();
      const entity = String(url.searchParams.get('entity') || '').toLowerCase();
      let results = [];

      if (term.includes('queens')) {
        if (entity === 'song') {
          results = [
            { artistName: 'Queens of the Stone Age', trackName: 'No One Knows' },
            { artistName: 'Queens of the Stone Age', trackName: 'Go With the Flow' }
          ];
        } else if (entity === 'album') {
          results = [
            { artistName: 'Queens of the Stone Age', collectionName: 'Songs for the Deaf' }
          ];
        } else {
          results = [
            {
              artistName: 'Queens of the Stone Age',
              primaryGenreName: 'Alternative Rock',
              artistLinkUrl: 'https://music.apple.com/us/artist/queens-of-the-stone-age/62820413'
            }
          ];
        }
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ results })
      });
    });

    await page.route('https://musicbrainz.org/ws/2/artist/**', async (route) => {
      const url = route.request().url();
      if (url.includes('/artist/?') && url.toLowerCase().includes('queens%20of%20the%20stone%20age')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            artists: [
              {
                id: 'qotsa-artist-id',
                name: 'Queens of the Stone Age',
                area: { name: 'Palm Desert, California' },
                'life-span': { begin: '1996-01-01' }
              }
            ]
          })
        });
      }
      if (url.includes('/artist/qotsa-artist-id')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'qotsa-artist-id',
            area: { name: 'Palm Desert, California' },
            'life-span': { begin: '1996-01-01' },
            tags: [{ name: 'stoner rock' }, { name: 'alternative rock' }],
            relations: [
              {
                type: 'member of band',
                artist: { name: 'Josh Homme' },
                attributes: ['vocals', 'guitar']
              }
            ]
          })
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ artists: [] })
      });
    });

    await page.route('https://en.wikipedia.org/w/api.php**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(['', [], [], []])
      });
    });

    await page.goto('/');
    await page.evaluate(() => {
      if (typeof window.setAppMode === 'function') {
        window.setAppMode('advanced');
      } else {
        document.documentElement.setAttribute('data-app-mode', 'advanced');
      }
    });
    await page.locator('.app-tab-btn[data-tab="visited-locations"]').click();
    await expect(page.locator('#visitedLocationsRoot')).toBeVisible();
    await page.locator('#visitedProgressTab-concerts').click();
    await expect(page.locator('#visitedProgressPane-concerts')).toBeVisible();
  });

  test('prefers same-origin proxy calls when proxy mode is enabled', async ({ page }) => {
    await expect(page.locator('#householdConcertsSchemaWarning')).toContainText('Attended_By');

    await page.locator('#householdConcertsSearchInput').fill('Queens of the Stone Age');
    await page.locator('[data-concert-action="search-web"]').first().click();
    await page.locator('[data-testid="concerts-search-results"] [data-concert-action="open-add-band"]').first().click();
    await expect(page.locator('#householdConcertsBandForm')).toBeVisible();
    await expect(page.locator('#householdConcertsBandForm input[name="Bandsintown_URL"]')).toHaveValue('https://www.bandsintown.com/a/12345-queens-of-the-stone-age');

    await page.locator('[data-concert-action="close-modal"]').first().click();
    await expect(page.locator('#householdConcertsBandForm')).toHaveCount(0);

    await page.locator('[data-testid="concerts-favorites-grid"] article:has-text("Nine Inch Nails") [data-concert-action="sync-tour"]').click();
    await expect(page.locator('#householdConcertsStatus')).toContainText('Synced 0 tour dates for Nine Inch Nails');
    await expect(page.locator('#householdConcertsSchemaWarning')).toContainText('default to Both');

    const requestAudit = await page.evaluate(() => ({
      proxy: Array.isArray(window.__proxyBandsintownRequests) ? window.__proxyBandsintownRequests.slice() : [],
      direct: Array.isArray(window.__directBandsintownRequests) ? window.__directBandsintownRequests.slice() : []
    }));

    expect(requestAudit.proxy.some((url) => url.includes('route=artist'))).toBeTruthy();
    expect(requestAudit.proxy.some((url) => url.includes('route=events'))).toBeTruthy();
    expect(requestAudit.direct).toEqual([]);
  });
});

