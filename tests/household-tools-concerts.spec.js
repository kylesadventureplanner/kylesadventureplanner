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
  'Attended_By',
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

test.describe('Household Tools Concerts', () => {
  let writes = [];
  const uploadedPhotoUrls = [
    'https://onedrive.example/concerts/queens-forum-photo-1.jpg',
    'https://onedrive.example/concerts/queens-forum-photo-2.jpg'
  ];

  test.beforeEach(async ({ page }) => {
    writes = [];
    const favoriteRows = [
      [
        'Depeche Mode',
        'Dave Gahan — Lead vocals\nMartin Gore — Guitar, keyboards, vocals\nAndrew Fletcher — Keyboards',
        'https://example.com/dm-logo.jpg',
        'https://example.com/dm-cover.jpg',
        'Basildon, England',
        '1980',
        'Mute',
        'Violator, Songs of Faith and Devotion, Memento Mori',
        'Enjoy the Silence, Never Let Me Down Again, Personal Jesus',
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
        'Trent Reznor — Vocals, production\nAtticus Ross — Programming, keys',
        '',
        '',
        'Cleveland, Ohio',
        '1988',
        'Nothing',
        'Pretty Hate Machine, The Downward Spiral, Hesitation Marks',
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
    ];

    await page.addInitScript(() => {
      window.accessToken = 'test-access-token';
      window.__historicShowsRequests = [];
      window.__imageProxyRequests = [];
      navigator.geolocation.getCurrentPosition = function (success) {
        success({
          coords: {
            latitude: 36.0726,
            longitude: -79.7920
          }
        });
      };

      const originalFetch = window.fetch.bind(window);
      window.fetch = async function patchedFetch(input, init) {
        const rawUrl = typeof input === 'string' ? input : (input && input.url) || '';
        const resolvedUrl = new URL(String(rawUrl || ''), window.location.origin);
        if (resolvedUrl.pathname === '/api/public/historic-shows') {
          window.__historicShowsRequests.push(resolvedUrl.toString());
          const band = String(resolvedUrl.searchParams.get('band') || 'Nine Inch Nails');
          return new Response(JSON.stringify({
            ok: true,
            source: 'multi',
            sourcesSucceeded: ['setlist.fm', 'bandsintown'],
            data: [
              {
                bandName: band,
                concertDate: '2011-06-15',
                venue: 'Gexa Energy Pavilion',
                city: 'Dallas',
                state: 'TX',
                country: 'United States',
                distanceMiles: 12.4,
                source: 'setlist.fm',
                sourceUrl: 'https://www.setlist.fm/setlist/nine-inch-nails/2011/gexa-energy-pavilion-dallas-tx.html',
                sources: ['setlist.fm', 'bandsintown'],
                sourceUrls: [
                  'https://www.setlist.fm/setlist/nine-inch-nails/2011/gexa-energy-pavilion-dallas-tx.html',
                  'https://www.bandsintown.com/e/999999-nine-inch-nails-at-gexa-energy-pavilion'
                ]
              }
            ]
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        if (resolvedUrl.hostname === 'blocked-images.example') {
          throw new TypeError('Failed to fetch');
        }
        if (resolvedUrl.pathname === '/api/public/image-fetch') {
          window.__imageProxyRequests.push(resolvedUrl.toString());
          return new Response('fake-proxy-image', {
            status: 200,
            headers: { 'Content-Type': 'image/png' }
          });
        }
        return originalFetch(input, init);
      };
    });

    await page.route('https://graph.microsoft.com/**', async (route) => {
      const url = route.request().url();
      const method = route.request().method();

      const respondJson = (payload) => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(payload)
      });

      if (method === 'POST' && url.includes('/rows/add')) {
        const body = route.request().postDataJSON ? route.request().postDataJSON() : null;
        writes.push({ url, body });
        if (url.includes('/tables/Favorite_Bands/rows/add')) {
          const newRow = Array.isArray(body && body.values && body.values[0]) ? body.values[0] : null;
          if (newRow) favoriteRows.push(newRow.slice());
        }
        return respondJson({});
      }

      if (method === 'PATCH' && url.includes('/tables/Favorite_Bands/rows/itemAt(index=')) {
        const body = route.request().postDataJSON ? route.request().postDataJSON() : null;
        writes.push({ url, body, method: 'PATCH' });
        const indexMatch = url.match(/itemAt\(index=(\d+)\)/);
        const rowIndex = indexMatch ? Number(indexMatch[1]) : -1;
        const nextValues = Array.isArray(body && body.values && body.values[0]) ? body.values[0] : null;
        if (Number.isInteger(rowIndex) && rowIndex >= 0 && nextValues) {
          favoriteRows[rowIndex] = nextValues.slice();
        }
        return respondJson({});
      }

      if (method === 'PUT' && url.includes(':/content')) {
        const uploadCount = writes.filter((entry) => entry.method === 'PUT').length;
        writes.push({ url, body: null, method: 'PUT' });
        return respondJson({
          id: 'concert-photo-' + (uploadCount + 1),
          name: 'queens-photo-' + (uploadCount + 1) + '.jpg',
          webUrl: uploadedPhotoUrls[Math.min(uploadCount, uploadedPhotoUrls.length - 1)]
        });
      }

      if (url.includes('/tables/Favorite_Bands/columns')) {
        return respondJson(makeColumns(favoriteColumns));
      }
      if (url.includes('/tables/Favorite_Bands/rows')) {
        return respondJson(makeRows(favoriteRows));
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
            'https://example.com/depeche-photo.jpg',
            '',
            'https://setlist.fm/example-depeche',
            'Chase Center',
            'Both',
            'Incredible lighting and crowd energy.'
          ]
        ]));
      }

      if (url.includes('/tables/Upcoming_Concerts/columns')) {
        return respondJson(makeColumns(upcomingColumns));
      }
      if (url.includes('/tables/Upcoming_Concerts/rows')) {
        return respondJson(makeRows([
          ['Nine Inch Nails', '2026-08-13', 'Thursday', 'The Orange Peel', 'Asheville', 'NC']
        ]));
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
            { artistName: 'Queens of the Stone Age', trackName: 'No One Knows', artworkUrl100: 'https://images.example/qotsa-song-1/100x100bb.jpg' },
            { artistName: 'Queens of the Stone Age', trackName: 'Go With the Flow', artworkUrl100: 'https://images.example/qotsa-song-2/100x100bb.jpg' },
            { artistName: 'Queens of the Stone Age', trackName: 'Little Sister', artworkUrl100: 'https://images.example/qotsa-song-3/100x100bb.jpg' }
          ];
        } else if (entity === 'album') {
          results = [
            { artistName: 'Queens of the Stone Age', collectionName: 'Songs for the Deaf', artworkUrl100: 'https://images.example/qotsa-album-1/100x100bb.jpg' },
            { artistName: 'Queens of the Stone Age', collectionName: '...Like Clockwork', artworkUrl100: 'https://images.example/qotsa-album-2/100x100bb.jpg' },
            { artistName: 'Queens of the Stone Age', collectionName: 'Era Vulgaris', artworkUrl100: 'https://images.example/qotsa-album-3/100x100bb.jpg' }
          ];
        } else {
          results = [
            {
              artistName: 'Queens of the Stone Age',
              primaryGenreName: 'Alternative Rock',
              artistLinkUrl: 'https://music.apple.com/us/artist/queens-of-the-stone-age/62820413'
            },
            {
              artistName: 'Queen',
              primaryGenreName: 'Rock',
              artistLinkUrl: 'https://music.apple.com/us/artist/queen/3296287'
            }
          ];
        }
      } else if (term.includes('synthpop')) {
        results = [
          {
            artistName: 'CHVRCHES',
            primaryGenreName: 'Synthpop',
            artistLinkUrl: 'https://music.apple.com/us/artist/chvrches/542344548'
          }
        ];
      } else if (term.includes('depeche')) {
        results = [
          {
            artistName: 'A Flock of Seagulls',
            primaryGenreName: 'Synthpop',
            artistLinkUrl: 'https://music.apple.com/us/artist/a-flock-of-seagulls/264111'
          }
        ];
      } else if (term.includes('industrial')) {
        results = [
          {
            artistName: 'Ministry',
            primaryGenreName: 'Industrial Rock',
            artistLinkUrl: 'https://music.apple.com/us/artist/ministry/90924'
          }
        ];
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
              },
              {
                type: 'member of band',
                artist: { name: 'Michael Shuman' },
                attributes: ['bass']
              },
              { type: 'official homepage', url: { resource: 'https://www.qotsa.com' } },
              { type: 'wikipedia', url: { resource: 'https://en.wikipedia.org/wiki/Queens_of_the_Stone_Age' } }
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
      const url = route.request().url().toLowerCase();
      if (url.includes('queens%20of%20the%20stone%20age')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            'Queens of the Stone Age',
            ['Queens of the Stone Age'],
            ['American rock band'],
            ['https://en.wikipedia.org/wiki/Queens_of_the_Stone_Age']
          ])
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(['', [], [], []])
      });
    });

    await page.route('https://www.bandsintown.com/api/v2/artists/**', async (route) => {
      const url = route.request().url().toLowerCase();
      if (url.includes('queens%20of%20the%20stone%20age') && url.includes('/events?')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              datetime: '2026-10-02T20:00:00',
              venue: { name: 'Harrah\'s Cherokee Center', city: 'Asheville', region: 'NC', country: 'United States' }
            }
          ])
        });
      }
      if (url.includes('queens%20of%20the%20stone%20age')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            name: 'Queens of the Stone Age',
            url: 'https://www.bandsintown.com/a/12345-queens-of-the-stone-age'
          })
        });
      }
      if (url.includes('nine%20inch%20nails') && url.includes('/events?')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      }
      if (url.includes('nine%20inch%20nails')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            name: 'Nine Inch Nails',
            url: 'https://www.bandsintown.com/a/1003-nine-inch-nails'
          })
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ name: '', url: '' })
      });
    });

    await page.route('**/api/public/bandsintown**', async (route) => {
      const url = new URL(route.request().url());
      const routeName = String(url.searchParams.get('route') || '').toLowerCase();
      const artist = decodeURIComponent(String(url.searchParams.get('artist') || '')).toLowerCase();
      let data = routeName === 'events' ? [] : { name: '', url: '' };

      if (routeName === 'artist') {
        if (artist.includes('queens of the stone age')) {
          data = {
            name: 'Queens of the Stone Age',
            url: 'https://www.bandsintown.com/a/12345-queens-of-the-stone-age'
          };
        } else if (artist.includes('nine inch nails')) {
          data = {
            name: 'Nine Inch Nails',
            url: 'https://www.bandsintown.com/a/1003-nine-inch-nails'
          };
        }
      }

      if (routeName === 'events') {
        if (artist.includes('queens of the stone age')) {
          data = [
            {
              datetime: '2026-10-02T20:00:00',
              venue: { name: 'Harrah\'s Cherokee Center', city: 'Asheville', region: 'NC', country: 'United States' }
            }
          ];
        } else {
          data = [];
        }
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, route: routeName, artist, data })
      });
    });

    await page.route('https://nominatim.openstreetmap.org/search**', async (route) => {
      const url = route.request().url();
      if (url.includes('Asheville')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ lat: '35.5951', lon: '-82.5515' }])
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.route('https://onedrive.example/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'image/jpeg',
        body: Buffer.from('fake-image-data')
      });
    });

    await page.route('https://images.example/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'image/jpeg',
        body: Buffer.from('fake-remote-band-image')
      });
    });

    await page.route('https://commons.wikimedia.org/w/api.php**', async (route) => {
      const url = new URL(route.request().url());
      const listMode = String(url.searchParams.get('list') || '').toLowerCase();
      const propMode = String(url.searchParams.get('prop') || '').toLowerCase();
      const query = String(url.searchParams.get('srsearch') || '').toLowerCase();
      if (listMode === 'search') {
        const logoRows = [
          { title: 'File:Queens_of_the_Stone_Age_logo.png' },
          { title: 'File:Queens_of_the_Stone_Age_wordmark.svg' }
        ];
        const groupRows = [
          { title: 'File:Queens_of_the_Stone_Age_live_2018.jpg' },
          { title: 'File:Queens_of_the_Stone_Age_group_photo.jpg' }
        ];
        const rows = query.includes('group') ? groupRows : logoRows;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ query: { search: rows } })
        });
        return;
      }
      if (propMode === 'imageinfo') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            query: {
              pages: {
                1: {
                  title: 'File:Queens_of_the_Stone_Age_logo.png',
                  imageinfo: [{ url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Queens_of_the_Stone_Age_logo.png', thumburl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Queens_of_the_Stone_Age_logo.png', mime: 'image/png' }]
                },
                2: {
                  title: 'File:Queens_of_the_Stone_Age_group_photo.jpg',
                  imageinfo: [{ url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Queens_of_the_Stone_Age_group_photo.jpg', thumburl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Queens_of_the_Stone_Age_group_photo.jpg', mime: 'image/jpeg' }]
                }
              }
            }
          })
        });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ query: { search: [] } }) });
    });

    await page.route('https://commons.wikimedia.org/wiki/Special:FilePath/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'image/jpeg',
        body: Buffer.from('fake-commons-image')
      });
    });

    await page.goto('/');
    await page.locator('.app-tab-btn[data-tab="household-tools"]').click();
    await expect(page.locator('#householdToolsRoot')).toBeVisible();
    await page.locator('#appSubTabsSlot [data-household-subtab="concerts"], #householdToolsRoot [data-household-subtab="concerts"]').first().click();
    await expect(page.locator('#householdToolsPane-concerts')).toBeVisible();

  });

  test('loads workbook-backed band cards, discovery, and nearby upcoming shows', async ({ page }) => {
    await expect(page.locator('[data-testid="concerts-favorites-grid"]')).toContainText('Depeche Mode');
    await expect(page.locator('[data-testid="concerts-favorites-grid"]')).toContainText('Nine Inch Nails');
    await expect(page.locator('[data-testid="concerts-favorites-grid"]')).toContainText('Link completeness:');
    await expect(page.locator('[data-testid="concerts-attended-list"]')).toContainText('Chase Center');
    await expect(page.locator('[data-testid="concerts-discovery"]')).toContainText('A Flock of Seagulls');
    await expect(page.locator('[data-testid="concerts-upcoming-list"]')).toContainText('The Orange Peel');
    await expect(page.locator('[data-testid="concerts-upcoming-list"]')).toContainText(/mi away/);
    await expect(page.locator('#householdConcertsLocationText')).toContainText('Hendersonville, NC USA');
    await expect(page.locator('#householdConcertsLocationChip')).toContainText('Using Hendersonville, NC USA');
    await expect(page.locator('#householdConcertsResetLocationBtn')).toBeHidden();
    await expect(page.locator('#householdConcertsSchemaWarning')).toHaveCount(0);
    await expect(page.locator('[data-testid="concerts-favorites-grid"] [data-concert-action="refresh-band-profile"]').first()).toBeVisible();
  });

  test('can switch to live location and reset back to Hendersonville', async ({ page }) => {
    await expect(page.locator('#householdConcertsLocationChip')).toContainText('Using Hendersonville, NC USA');
    await page.locator('[data-concert-action="use-location"]').click();
    await expect(page.locator('#householdConcertsLocationChip')).toContainText('Using Your current location');
    await expect(page.locator('#householdConcertsResetLocationBtn')).toBeVisible();
    await page.locator('#householdConcertsResetLocationBtn').click();
    await expect(page.locator('#householdConcertsLocationChip')).toContainText('Using Hendersonville, NC USA');
    await expect(page.locator('#householdConcertsResetLocationBtn')).toBeHidden();
    await expect(page.locator('#householdConcertsStatus')).toContainText('Hendersonville, NC USA');
  });

  test('can configure home base from the concert settings modal', async ({ page }) => {
    await page.locator('[data-concert-action="open-concert-settings"]').click();
    await expect(page.locator('#householdConcertsSettingsForm')).toBeVisible();
    await page.locator('#householdConcertsSettingsForm input[name="homeBaseMode"][value="follow-user"]').check();
    await page.evaluate(() => {
      const form = document.getElementById('householdConcertsSettingsForm');
      if (form && typeof form.requestSubmit === 'function') form.requestSubmit();
    });
    await expect(page.locator('#householdConcertsStatus')).toContainText(/Concert settings saved|Location saved/);
    await expect(page.locator('#householdConcertsLocationChip')).toContainText('Using Your current location');

    await page.locator('[data-concert-action="open-concert-settings"]').click();
    await page.locator('#householdConcertsSettingsForm input[name="homeBaseMode"][value="hendersonville"]').check();
    await page.evaluate(() => {
      const form = document.getElementById('householdConcertsSettingsForm');
      if (form && typeof form.requestSubmit === 'function') form.requestSubmit();
    });
    await expect(page.locator('#householdConcertsLocationChip')).toContainText('Using Hendersonville, NC USA');
  });

  test('can toggle backend write audit mode from concert settings', async ({ page }) => {
    await page.locator('[data-concert-action="open-concert-settings"]').click();
    await expect(page.locator('#householdConcertsSettingsForm')).toBeVisible();
    await page.locator('#householdConcertsSettingsForm input[name="backendWriteAudit"]').check();
    await page.evaluate(() => {
      const form = document.getElementById('householdConcertsSettingsForm');
      if (form && typeof form.requestSubmit === 'function') form.requestSubmit();
    });

    await expect.poll(() => page.evaluate(() => {
      return !!(window.HouseholdConcerts && window.HouseholdConcerts.isBackendWriteAuditEnabled && window.HouseholdConcerts.isBackendWriteAuditEnabled());
    })).toBe(true);

    await page.locator('[data-concert-action="open-concert-settings"]').click();
    await expect(page.locator('#householdConcertsSettingsForm input[name="backendWriteAudit"]')).toBeChecked();
    await page.locator('#householdConcertsSettingsForm input[name="backendWriteAudit"]').uncheck();
    await page.evaluate(() => {
      const form = document.getElementById('householdConcertsSettingsForm');
      if (form && typeof form.requestSubmit === 'function') form.requestSubmit();
    });

    await expect.poll(() => page.evaluate(() => {
      return !!(window.HouseholdConcerts && window.HouseholdConcerts.isBackendWriteAuditEnabled && window.HouseholdConcerts.isBackendWriteAuditEnabled());
    })).toBe(false);
  });

  test('can add recommended artists directly from band profile modal', async ({ page }) => {
    await page.locator('[data-testid="concerts-favorites-grid"] article:has-text("Depeche Mode") [data-concert-action="open-band-details"]').click();
    await expect(page.locator('.household-concerts-modal')).toContainText('Recommended bands to add');
    const recommendedName = String((await page.locator('.household-concerts-recommended-item strong').first().textContent()) || '').trim();
    await page.locator('.household-concerts-modal [data-concert-action="quick-add-recommended-band"]').first().click();
    await expect(page.locator('#householdConcertsToastHost')).toContainText('Added from recommendations');
    await page.locator('#householdConcertsToastHost [data-concert-action="undo-recommended-add"]').click();
    await expect(page.locator('#householdConcertsStatus')).toContainText('Undid add from recommendations');
    if (recommendedName) {
      await expect(page.locator('[data-testid="concerts-favorites-grid"]')).not.toContainText(recommendedName);
    }
  });

  test('can filter favorite bands when logging an attended concert', async ({ page }) => {
    await page.locator('[data-concert-action="open-log-concert"]').first().click();
    await expect(page.locator('#householdConcertsAttendedForm')).toBeVisible();

    await page.locator('#householdConcertsAttendedBandSearch').fill('nine');
    const bandOptions = await page.locator('#householdConcertsAttendedForm select[name="Band_Name"] option').allTextContents();
    expect(bandOptions.join(' | ')).toContain('Nine Inch Nails');
    expect(bandOptions.join(' | ')).not.toContain('Depeche Mode');

    await page.locator('#householdConcertsAttendedForm select[name="Band_Name"]').selectOption('Nine Inch Nails');
    await expect(page.locator('#householdConcertsAttendedForm select[name="Band_Name"]')).toHaveValue('Nine Inch Nails');
  });

  test('can mark a recommended band as not interested so it is not recommended again', async ({ page }) => {
    await page.locator('[data-testid="concerts-favorites-grid"] article:has-text("Depeche Mode") [data-concert-action="open-band-details"]').click();
    await expect(page.locator('.household-concerts-modal')).toContainText('Recommended bands to add');
    const firstRecommendation = page.locator('.household-concerts-recommended-list .household-concerts-recommended-item strong').first();
    const hiddenName = String((await firstRecommendation.textContent()) || '').trim();
    await page.locator('.household-concerts-recommended-list [data-concert-action="mark-recommendation-not-interested"]').first().click();
    await expect(page.locator('#householdConcertsStatus')).toContainText('as not interested');

    await page.locator('.household-concerts-modal [data-concert-action="close-modal"]').first().click();
    await page.locator('[data-concert-action="refresh-data"]').first().click();
    await page.locator('[data-testid="concerts-favorites-grid"] article:has-text("Depeche Mode") [data-concert-action="open-band-details"]').click();

    if (hiddenName) {
      await expect(page.locator('.household-concerts-recommended-list')).not.toContainText(hiddenName);

      await page.locator('.household-concerts-modal [data-concert-action="close-modal"]').first().click();
      await page.locator('[data-concert-action="open-concert-settings"]').click();
      await expect(page.locator('#householdConcertsSettingsForm')).toContainText('Manage Not Interested');
      await page.locator('#householdConcertsSettingsForm [data-concert-action="remove-not-interested-band"][data-band-name="' + hiddenName + '"]').click();
      await page.locator('.household-concerts-modal [data-concert-action="close-modal"]').first().click();

      await page.locator('[data-concert-action="refresh-data"]').first().click();
      await page.locator('[data-testid="concerts-favorites-grid"] article:has-text("Depeche Mode") [data-concert-action="open-band-details"]').click();
      await expect(page.locator('.household-concerts-recommended-list')).toContainText(hiddenName);
    }
  });

  test('can rank favorite bands by tier and use ranking to organize band cards', async ({ page }) => {
    await page.locator('[data-concert-action="open-concert-settings"]').click();
    await expect(page.locator('#householdConcertsSettingsForm')).toContainText('Manage Band Rankings');
    await page.locator('#householdConcertsSettingsForm [data-band-tier-key="depeche-mode"]').selectOption('Tier 4 (Attended Concert / Not Favorite)');
    await page.locator('#householdConcertsSettingsForm [data-band-tier-key="nine-inch-nails"]').selectOption('Tier 1 (The Best Bands)');
    await page.evaluate(() => {
      const form = document.getElementById('householdConcertsSettingsForm');
      if (form && typeof form.requestSubmit === 'function') form.requestSubmit();
    });

    const firstBand = page.locator('[data-testid="concerts-favorites-grid"] .household-concerts-band-card h3').first();
    await expect(firstBand).toContainText('Nine Inch Nails');
    await expect(page.locator('[data-testid="concerts-favorites-grid"]')).not.toContainText('Depeche Mode');
    await expect(page.locator('[data-testid="concerts-favorites-grid"]')).toContainText('Tier 1 (The Best Bands)');
    await expect(page.locator('#householdConcertsSummaryGrid')).toContainText('Favorite Bands');
    await expect(page.locator('#householdConcertsSummaryGrid')).toContainText('Bands Seen Live (Not Favorites)');

    await page.locator('[data-concert-action="set-tier4-visibility"][data-tier4-visible="1"]').click();
    await expect(page.locator('[data-testid="concerts-favorites-grid"]')).toContainText('Bands Seen Live (Not Favorites)');
    await expect(page.locator('[data-testid="concerts-favorites-grid"]')).toContainText('Depeche Mode');
  });

  test('tier filter chips can isolate Tier 1 bands', async ({ page }) => {
    await page.locator('[data-concert-action="open-concert-settings"]').click();
    await page.locator('#householdConcertsSettingsForm [data-band-tier-key="depeche-mode"]').selectOption('Tier 4 (Attended Concert / Not Favorite)');
    await page.locator('#householdConcertsSettingsForm [data-band-tier-key="nine-inch-nails"]').selectOption('Tier 1 (The Best Bands)');
    await page.evaluate(() => {
      const form = document.getElementById('householdConcertsSettingsForm');
      if (form && typeof form.requestSubmit === 'function') form.requestSubmit();
    });

    await page.locator('[data-concert-action="set-tier-filter"][data-tier="Tier 1 (The Best Bands)"]').click();
    await expect(page.locator('[data-testid="concerts-favorites-grid"]')).toContainText('Nine Inch Nails');
    await expect(page.locator('[data-testid="concerts-favorites-grid"]')).not.toContainText('Depeche Mode');
  });

  test('does not crash personal stats when a newly added favorite band has no attended concerts yet', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(String(error && error.message ? error.message : error)));

    await page.locator('#householdConcertsSearchInput').fill('Queens of the Stone Age');
    await page.locator('[data-concert-action="search-web"]').first().click();
    await page.locator('[data-testid="concerts-search-results"] [data-concert-action="open-add-band"]').first().click();
    await expect(page.locator('#householdConcertsBandForm')).toBeVisible();
    await page.evaluate(() => {
      const form = document.getElementById('householdConcertsBandForm');
      if (form && typeof form.requestSubmit === 'function') form.requestSubmit();
    });

    await expect.poll(() => pageErrors.length).toBe(0);
    await expect(page.locator('[data-testid="concerts-favorites-grid"]')).toContainText('Queens of the Stone Age');

    await page.locator('[data-view="stats"]').click();
    await expect(page.locator('#householdConcertsPersonalStats')).toBeVisible();
    await expect(page.locator('#householdConcertsPersonalStats')).toContainText('Most Seen');
  });

  test('supports provenance tooltips, conflict picking, bulk lock, and Ctrl/Cmd+Z undo in enrichment flow', async ({ page }) => {
    await page.locator('#householdConcertsSearchInput').fill('Queens of the Stone Age');
    await page.locator('[data-concert-action="search-web"]').first().click();
    await page.locator('[data-testid="concerts-search-results"] [data-concert-action="open-add-band"]').first().click();
    await expect(page.locator('#householdConcertsBandForm')).toBeVisible();

    await page.locator('#householdConcertsBandForm input[name="Origin"]').fill('Manual Override City');
    await page.locator('#householdConcertsBandForm [data-concert-action="auto-fill-band-profile"]').click();

    await expect(page.locator('#householdConcertsBandForm [data-concert-action="auto-fill-band-profile"]')).toContainText('Auto-fill Profile');

    const hasPreview = await page.locator('#householdConcertsChangePreview').count();
    if (hasPreview) {
      await expect(page.locator('#householdConcertsChangePreview')).toContainText('Choose one');
    }

    const originTitle = await page.locator('#householdConcertsBandForm input[name="Origin"]').getAttribute('title');
    if (originTitle) {
      expect(String(originTitle || '')).toContain('Last updated:');
      expect(String(originTitle || '')).toContain('source:');
    }

    if (hasPreview) {
      await page.locator('#householdConcertsBandForm [data-concert-action="apply-change-preview"]').click();
    }
    await page.locator('#householdConcertsBandForm input[name="Origin"]').focus();
    await page.keyboard.press('Meta+KeyZ');
    await expect(page.locator('#householdConcertsBandForm input[name="Origin"]')).toHaveValue(/Manual Override City/);

    await page.evaluate(() => {
      const form = document.getElementById('householdConcertsBandForm');
      if (form && typeof form.requestSubmit === 'function') form.requestSubmit();
    });

    await expect(page.locator('[data-testid="concerts-favorites-grid"]')).toContainText('Queens of the Stone Age');
    await page.locator('[data-testid="concerts-favorites-grid"] article:has-text("Queens of the Stone Age") .household-concerts-enrichment-badge').click();
    await page.locator('.household-concerts-modal [data-concert-action="bulk-lock-high-confidence"]').click();
    await page.locator('.household-concerts-modal .pill-button[data-concert-action="close-modal"]').click();
    await expect(page.locator('[data-testid="concerts-favorites-grid"] article:has-text("Queens of the Stone Age") .household-concerts-lock-summary-badge')).toContainText('🔒');
  });

  test('can sync tour schedules without falling back to manual warning when source returns valid payload', async ({ page }) => {
    await page.locator('[data-testid="concerts-favorites-grid"] article:has-text("Nine Inch Nails") [data-concert-action="sync-tour"]').click();
    await expect(page.locator('#householdConcertsStatus')).toContainText('Synced 0 tour dates for Nine Inch Nails');
  });

  test('can search historic concerts with default filters and prefill an attended log', async ({ page }) => {
    await page.locator('[data-concert-action="open-historic-finder"]').click();
    await expect(page.locator('#householdConcertsHistoricFinderForm')).toBeVisible();
    await expect(page.locator('#householdConcertsHistoricFinderForm input[name="FromYear"]')).toHaveValue('2006');
    await expect(page.locator('#householdConcertsHistoricFinderForm select[name="SearchLocation"]')).toHaveValue('hendersonville');

    await page.locator('#householdConcertsHistoricFinderForm input[name="BandName"]').fill('Nine Inch Nails');
    await page.locator('#householdConcertsHistoricFinderForm select[name="RadiusMiles"]').selectOption('25');
    await page.locator('#householdConcertsHistoricFinderForm select[name="SearchLocation"]').selectOption('richardson');
    await page.evaluate(() => {
      const form = document.getElementById('householdConcertsHistoricFinderForm');
      if (form && typeof form.requestSubmit === 'function') form.requestSubmit();
    });

    await expect(page.locator('#householdConcertsHistoricFinderStatusHost')).toContainText('Found 1 historical concert');
    await expect(page.locator('#householdConcertsHistoricFinderStatusHost')).toContainText('Sources used: Setlist.fm, Bandsintown');
    await expect(page.locator('#householdConcertsHistoricFinderResults')).toContainText('Gexa Energy Pavilion');
    await expect(page.locator('#householdConcertsHistoricFinderResults')).toContainText('Setlist.fm');
    await expect(page.locator('#householdConcertsHistoricFinderResults')).toContainText('Bandsintown');
    const historicRequests = await page.evaluate(() => Array.isArray(window.__historicShowsRequests) ? window.__historicShowsRequests.slice() : []);
    expect(historicRequests.length).toBeGreaterThan(0);
    expect(historicRequests[0]).toContain('fromYear=2006');
    expect(historicRequests[0]).toContain('radiusMiles=25');
    expect(historicRequests[0]).toContain('locationLabel=Richardson%2C+TX+75081');

    await page.locator('#householdConcertsHistoricFinderResults [data-concert-action="add-historic-result-to-attended"]').first().click();
    await expect(page.locator('#householdConcertsAttendedForm')).toBeVisible();
    await expect(page.locator('#householdConcertsAttendedForm input[name="Concert_Date"]')).toHaveValue('2011-06-15');
    await expect(page.locator('#householdConcertsAttendedForm input[name="Venue"]')).toHaveValue('Gexa Energy Pavilion');
    await expect(page.locator('#householdConcertsAttendedForm input[name="Setlist_URL"]')).toHaveValue(/setlist\.fm/);
  });

  test('can choose and upload cover/logo candidates to OneDrive from the image picker modal', async ({ page }) => {
    await page.locator('#householdConcertsSearchInput').fill('Queens of the Stone Age');
    await page.locator('[data-concert-action="search-web"]').first().click();
    await page.locator('[data-testid="concerts-search-results"] [data-concert-action="open-add-band"]').first().click();
    await expect(page.locator('#householdConcertsBandForm')).toBeVisible();

    await page.locator('#householdConcertsBandForm [data-concert-action="open-band-image-picker"]').click();
    await expect(page.locator('.household-concerts-modal')).toContainText('Select Band Images');
    await page.locator('.household-concerts-modal [data-concert-action="select-band-cover-candidate"]').first().click();
    await page.locator('.household-concerts-modal [data-concert-action="select-band-logo-candidate"]').nth(1).click();
    await page.locator('.household-concerts-modal [data-concert-action="apply-band-image-selection"]').click();

    await expect(page.locator('#householdConcertsBandForm input[name="Band_Logo_URL"]')).toHaveValue(/onedrive\.example/);
    await expect(page.locator('#householdConcertsBandForm input[name="Band_Cover_Photo_URL"]')).toHaveValue(/onedrive\.example/);
    const bandPhotoUploads = writes.filter((entry) => String(entry.method || '').toUpperCase() === 'PUT' && String(entry.url || '').includes('Copilot_Apps/Band_Photos'));
    expect(bandPhotoUploads.length).toBeGreaterThanOrEqual(2);
  });

  test('band profile modal supports previous/next navigation between bands', async ({ page }) => {
    await page.locator('[data-testid="concerts-favorites-grid"] article:has-text("Depeche Mode") [data-concert-action="open-band-details"]').click();
    await expect(page.locator('.household-concerts-modal h3')).toContainText('Depeche Mode');
    await page.locator('.household-concerts-modal [data-concert-action="open-band-details-next"]').click();
    await expect(page.locator('.household-concerts-modal h3')).toContainText('Nine Inch Nails');
    await page.locator('.household-concerts-modal [data-concert-action="open-band-details-prev"]').click();
    await expect(page.locator('.household-concerts-modal h3')).toContainText('Depeche Mode');
  });

  test('can mark a band as priority-live and show it in the priority dashboard', async ({ page }) => {
    await page.locator('[data-testid="concerts-favorites-grid"] article:has-text("Depeche Mode") [data-concert-action="toggle-priority-band"]').click();
    await expect(page.locator('#householdConcertsPriorityDashboard')).toContainText('Depeche Mode');
    await expect(page.locator('#householdConcertsPriorityDashboard')).toContainText('Priority Live Targets');
  });

  test('can update a band tier from profile modal and separate Tier 4 into seen-live section', async ({ page }) => {
    await page.locator('[data-testid="concerts-favorites-grid"] article:has-text("Depeche Mode") [data-concert-action="open-band-details"]').click();
    await page.selectOption('#householdConcertsBandTierQuickSelect', 'Tier 4 (Attended Concert / Not Favorite)');
    await page.locator('.household-concerts-modal [data-concert-action="save-band-tier"]').click();
    await page.locator('.household-concerts-modal [data-concert-action="close-modal"]').first().click();
    await page.locator('[data-concert-action="set-tier4-visibility"][data-tier4-visible="1"]').click();
    await expect(page.locator('[data-testid="concerts-favorites-grid"]')).toContainText('Bands Seen Live (Not Favorites)');
    await expect(page.locator('[data-testid="concerts-favorites-grid"]')).toContainText('Depeche Mode');
  });

  test('favorites dashboard paginates long band lists', async ({ page }) => {
    await expect.poll(async () => page.evaluate(() => {
      const state = window.HouseholdConcerts && window.HouseholdConcerts.__state;
      if (!state || !Array.isArray(state.favoriteBands) || !state.favoriteBands.length) return { nextDisabled: true, pageText: '' };
      const seed = state.favoriteBands[0];
      while (state.favoriteBands.length < 18) {
        const idx = state.favoriteBands.length;
        state.favoriteBands.push(Object.assign({}, seed, {
          id: 'paged-band-' + idx,
          bandName: 'Paged Band ' + idx,
          bandTier: 'Tier 2 (Great Bands)'
        }));
      }
      const input = document.getElementById('householdConcertsFilterInput');
      if (input) input.dispatchEvent(new Event('input', { bubbles: true }));
      const nextBtn = document.querySelector('[data-testid="concerts-favorites-grid"] [data-concert-action="set-bands-page"][data-page="2"]');
      const pager = document.querySelector('[data-testid="concerts-favorites-grid"] .household-concerts-pagination');
      return { nextDisabled: !nextBtn || !!nextBtn.disabled, pageText: pager ? String(pager.textContent || '') : '' };
    })).toMatchObject({ nextDisabled: false });

    await expect(page.locator('[data-testid="concerts-favorites-grid"] .household-concerts-pagination')).toContainText('Page 1 of');
    await page.locator('[data-testid="concerts-favorites-grid"] [data-concert-action="set-bands-page"][data-page="2"]').click();
    await expect(page.locator('[data-testid="concerts-favorites-grid"] .household-concerts-pagination')).toContainText('Page 2 of');
  });

  test('can import band image URL via proxy fallback when direct fetch fails', async ({ page }) => {
    await page.locator('#householdConcertsSearchInput').fill('Queens of the Stone Age');
    await page.locator('[data-concert-action="search-web"]').first().click();
    await page.locator('[data-testid="concerts-search-results"] [data-concert-action="open-add-band"]').first().click();
    await expect(page.locator('#householdConcertsBandForm')).toBeVisible();

    await page.locator('#householdConcertsBandForm [data-concert-action="open-band-image-picker"]').click();
    await expect(page.locator('.household-concerts-modal')).toContainText('Select Band Images');
    await page.locator('#householdConcertsBandLogoUrlInput').fill('https://blocked-images.example/qotsa-logo.png');
    await page.locator('.household-concerts-modal [data-concert-action="import-band-logo-url"]').click();

    await expect(page.locator('#householdConcertsBandImagePickerStatus')).toContainText('Imported URL and uploaded successfully.');
    const proxyRequests = await page.evaluate(() => Array.isArray(window.__imageProxyRequests) ? window.__imageProxyRequests.slice() : []);
    expect(proxyRequests.length).toBeGreaterThan(0);

    await page.locator('.household-concerts-modal [data-concert-action="apply-band-image-selection"]').click();
    await expect(page.locator('#householdConcertsBandForm')).toBeVisible();
    await expect(page.locator('#householdConcertsBandForm input[name="Band_Logo_URL"]')).toHaveValue(/onedrive\.example/);
  });

  test('can launch Manage Photos from band profile modal for an existing saved band', async ({ page }) => {
    await page.locator('#householdConcertsSearchInput').fill('Queens of the Stone Age');
    await page.locator('[data-concert-action="search-web"]').first().click();
    await page.locator('[data-testid="concerts-search-results"] [data-concert-action="open-add-band"]').first().click();
    await expect(page.locator('#householdConcertsBandForm')).toBeVisible();
    await page.evaluate(() => {
      const form = document.getElementById('householdConcertsBandForm');
      if (form && typeof form.requestSubmit === 'function') form.requestSubmit();
    });

    await page.locator('[data-testid="concerts-favorites-grid"] article:has-text("Queens of the Stone Age") [data-concert-action="open-band-details"]').click();
    await expect(page.locator('.household-concerts-modal')).toContainText('Manage Photos');
    await page.locator('.household-concerts-modal [data-concert-action="open-band-image-picker"]').click();
    await expect(page.locator('.household-concerts-modal')).toContainText('Select Band Images');
    await page.locator('.household-concerts-modal [data-concert-action="select-band-cover-candidate"]').first().click();
    await page.locator('.household-concerts-modal [data-concert-action="select-band-logo-candidate"]').nth(1).click();
    await page.locator('.household-concerts-modal [data-concert-action="apply-band-image-selection"]').click();

    await expect(page.locator('.household-concerts-modal')).toContainText('Queens of the Stone Age');
    await expect(page.locator('.household-concerts-modal .household-concerts-band-profile-cover')).toHaveAttribute('src', /onedrive\.example/);
  });

  test('can scan and force-sync unsynced band profile changes to Excel', async ({ page }) => {
    await expect(page.locator('[data-testid="concerts-favorites-grid"]')).toContainText('Depeche Mode');

    await page.evaluate(() => {
      const state = window.HouseholdConcerts && window.HouseholdConcerts.__state;
      if (!state || !Array.isArray(state.favoriteBands)) return;
      const band = state.favoriteBands.find((entry) => String(entry.bandName || '').toLowerCase().includes('depeche'));
      if (!band) return;
      band.websiteUrl = 'https://local-unsynced.example/depeche-mode';
    });

    await page.locator('[data-concert-action="scan-unsynced-band-changes"]').first().click();
    await expect(page.locator('.household-concerts-modal')).toContainText('Unsynced Band Profile Changes');
    await expect(page.locator('.household-concerts-modal')).toContainText('Depeche Mode');
    await expect(page.locator('.household-concerts-modal')).toContainText('Website URL');

    await page.locator('.household-concerts-modal [data-concert-action="force-sync-band-change"]').first().click();
    await expect.poll(() => writes.some((entry) => String(entry.url || '').includes('/tables/Favorite_Bands/rows/itemAt(index='))).toBeTruthy();
    await expect(page.locator('.household-concerts-modal')).toContainText('No unsynced band profile changes found');
  });

  test('can add a favorite band from search results and log an attended concert', async ({ page }) => {
    await page.locator('#householdConcertsSearchInput').fill('Queens of the Stone Age');
    await page.locator('[data-concert-action="search-web"]').first().click();
    await expect(page.locator('[data-testid="concerts-search-results"]')).toContainText('Queens of the Stone Age');

    await page.locator('[data-testid="concerts-search-results"] [data-concert-action="open-add-band"]').first().click();
    await expect(page.locator('#householdConcertsBandForm')).toBeVisible();
    await expect(page.locator('#householdConcertsBandForm input[name="Band_Name"]')).toHaveValue('Queens of the Stone Age');
    await expect(page.locator('#householdConcertsBandForm input[name="Origin"]')).toHaveValue('Palm Desert, California');
    await expect(page.locator('#householdConcertsBandForm input[name="Founded"]')).toHaveValue('1996');
    await expect(page.locator('#householdConcertsBandForm textarea[name="Top_Songs"]')).toHaveValue(/No One Knows/);
    await expect(page.locator('#householdConcertsBandForm textarea[name="Discography"]')).toHaveValue(/Songs for the Deaf/);
    await expect(page.locator('#householdConcertsBandForm textarea[name="Band_Members"]')).toHaveValue(/Josh Homme/);
    await expect(page.locator('#householdConcertsBandForm textarea[name="Band_Members"]')).toHaveValue(/vocals, guitar/);
    await expect(page.locator('#householdConcertsBandForm input[name="Website_URL"]')).toHaveValue('https://www.qotsa.com');
    await expect(page.locator('#householdConcertsBandForm input[name="Wikipedia_URL"]')).toHaveValue('https://en.wikipedia.org/wiki/Queens_of_the_Stone_Age');
    await expect(page.locator('#householdConcertsBandForm input[name="Bandsintown_URL"]')).toHaveValue('https://www.bandsintown.com/a/12345-queens-of-the-stone-age');
    await page.evaluate(() => {
      const form = document.getElementById('householdConcertsBandForm');
      if (form && typeof form.requestSubmit === 'function') form.requestSubmit();
    });

    await expect.poll(() => writes.some((entry) => entry.url.includes('/tables/Favorite_Bands/rows/add'))).toBeTruthy();

    const favoriteWrite = writes.find((entry) => String(entry.url || '').includes('/tables/Favorite_Bands/rows/add'));
    expect(favoriteWrite).toBeTruthy();
    const favoriteWritePayload = JSON.stringify(favoriteWrite.body || {});
    expect(favoriteWritePayload).toContain('Josh Homme');
    expect(favoriteWritePayload).toContain('vocals, guitar');

    await expect(page.locator('[data-testid="concerts-favorites-grid"]')).toContainText('Queens of the Stone Age');
    await expect(page.locator('#householdConcertsStatus')).toContainText(/Added Queens of the Stone Age|auto-filled/i);
    await expect(page.locator('[data-testid="concerts-favorites-grid"] article:has-text("Queens of the Stone Age")')).toContainText(/Profile\s+\d+% complete/);
    await expect(page.locator('[data-testid="concerts-favorites-grid"] article:has-text("Queens of the Stone Age")')).toContainText('Last enriched from');

    await page.locator('[data-testid="concerts-favorites-grid"] article:has-text("Queens of the Stone Age") .household-concerts-enrichment-badge').click();
    await expect(page.locator('.household-concerts-modal')).toContainText('Profile Refresh History');
    await expect(page.locator('.household-concerts-modal')).toContainText('Apple Music metadata');
    await expect(page.locator('.household-concerts-modal')).toContainText('Field confidence');
    await expect(page.locator('.household-concerts-modal')).toContainText('Band Members + Roles');
    await expect(page.locator('.household-concerts-refresh-confidence--high').first()).toBeVisible();
    await expect.poll(async () => page.locator('.household-concerts-source-icons-row .household-concerts-source-icon').count()).toBeGreaterThanOrEqual(4);
    await page.locator('.household-concerts-modal [data-concert-action="clear-band-refresh-history"]').click();
    await expect(page.locator('#householdConcertsStatus')).toContainText('Cleared profile refresh history for Queens of the Stone Age');
    await expect(page.locator('[data-testid="concerts-favorites-grid"] article:has-text("Queens of the Stone Age")')).toContainText(/Profile\s+\d+% complete/);
    await expect(page.locator('[data-testid="concerts-favorites-grid"] article:has-text("Queens of the Stone Age")')).not.toContainText('Last enriched from');

    await page.locator('[data-testid="concerts-favorites-grid"] article:has-text("Queens of the Stone Age") [data-concert-action="refresh-band-profile"]').click();
    await expect(page.locator('#householdConcertsStatus')).toContainText('Review the enrichment changes for Queens of the Stone Age before applying.');
    await page.locator('.household-concerts-modal [data-concert-action="apply-refresh-preview"]').click();
    await expect.poll(() => writes.some((entry) => String(entry.url || '').includes('/tables/Favorite_Bands/rows/itemAt(index='))).toBeTruthy();
    await expect(page.locator('#householdConcertsStatus')).toContainText(/Applied \d+ field update/);
    await expect(page.locator('[data-testid="concerts-favorites-grid"] article:has-text("Queens of the Stone Age")')).toContainText('Last enriched from');

    await page.locator('[data-concert-action="open-concert-settings"]').click();
    await expect(page.locator('#householdConcertsSettingsForm')).toBeVisible();
    await page.locator('#householdConcertsSettingsForm input[name="source_members"]').uncheck();
    await page.locator('#householdConcertsSettingsForm input[name="autoFillOnOpen"]').uncheck();
    await page.evaluate(() => {
      const form = document.getElementById('householdConcertsSettingsForm');
      if (form && typeof form.requestSubmit === 'function') form.requestSubmit();
    });
    await expect(page.locator('#householdConcertsStatus')).toContainText(/Hendersonville|home base/);

    await page.locator('[data-testid="concerts-favorites-grid"] article:has-text("Queens of the Stone Age") [data-concert-action="open-log-concert"]').click();
    await expect(page.locator('#householdConcertsAttendedForm')).toBeVisible();
    await page.locator('#householdConcertsAttendedForm input[name="Concert_Date"]').fill('2026-05-10');
    await page.locator('#householdConcertsAttendedForm input[name="Venue"]').fill('The Forum');
    await page.locator('#householdConcertsPhotoFileInput').setInputFiles([
      {
        name: 'queens-photo-1.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-jpeg-data-1')
      },
      {
        name: 'queens-photo-2.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-jpeg-data-2')
      }
    ]);
    await page.locator('#householdConcertsAttendedForm [data-concert-action="upload-attended-photo"]').click();
    await expect.poll(() => writes.filter((entry) => String(entry.url || '').includes(':/content')).length).toBe(2);
    await expect(page.locator('#householdConcertsAttendedUploadStatus')).toContainText('2 photo');
    await page.locator('#householdConcertsAttendedForm [data-rating-value="4"]').click();
    await page.locator('#householdConcertsAttendedForm select[name="Attended_By"]').selectOption('Heather');
    await page.locator('#householdConcertsAttendedForm textarea[name="Notes"]').fill('Fantastic encore and huge crowd singalong.');
    await page.evaluate(() => {
      const form = document.getElementById('householdConcertsAttendedForm');
      if (form && typeof form.requestSubmit === 'function') form.requestSubmit();
    });

    await expect.poll(() => writes.some((entry) => entry.url.includes('/tables/Attended_Concerts/rows/add'))).toBeTruthy();

    const attendedWrite = writes.find((entry) => String(entry.url || '').includes('/tables/Attended_Concerts/rows/add'));
    expect(attendedWrite).toBeTruthy();
    const attendedWritePayload = JSON.stringify(attendedWrite.body || {});
    expect(attendedWritePayload).toContain('["');
    expect(attendedWritePayload).toContain(uploadedPhotoUrls[0]);
    expect(attendedWritePayload).toContain(uploadedPhotoUrls[1]);
    expect(attendedWritePayload).toContain('Heather');

    await expect(page.locator('[data-testid="concerts-attended-list"]')).toContainText('Queens of the Stone Age');
    await expect(page.locator('[data-testid="concerts-attended-list"]')).toContainText('Fantastic encore and huge crowd singalong.');
    await expect(page.locator('[data-testid="concerts-attended-list"]')).toContainText('Photo 2');
    await expect(page.locator('[data-testid="concerts-attended-list"]')).toContainText('Attended by Heather');
  });
});


