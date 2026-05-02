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

test.describe('Household Tools Concerts', () => {
  let writes = [];
  const uploadedPhotoUrls = [
    'https://onedrive.example/concerts/queens-forum-photo-1.jpg',
    'https://onedrive.example/concerts/queens-forum-photo-2.jpg'
  ];

  test.beforeEach(async ({ page }) => {
    writes = [];

    await page.addInitScript(() => {
      window.accessToken = 'test-access-token';
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
        return respondJson(makeRows([
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
            'https://example.com/depeche-photo.jpg',
            '',
            'https://setlist.fm/example-depeche',
            'Chase Center',
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
            { artistName: 'Queens of the Stone Age', trackName: 'No One Knows' },
            { artistName: 'Queens of the Stone Age', trackName: 'Go With the Flow' },
            { artistName: 'Queens of the Stone Age', trackName: 'Little Sister' }
          ];
        } else if (entity === 'album') {
          results = [
            { artistName: 'Queens of the Stone Age', collectionName: 'Songs for the Deaf' },
            { artistName: 'Queens of the Stone Age', collectionName: '...Like Clockwork' },
            { artistName: 'Queens of the Stone Age', collectionName: 'Era Vulgaris' }
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

    await page.goto('/');
    await page.locator('.app-tab-btn[data-tab="household-tools"]').click();
    await expect(page.locator('#householdToolsRoot')).toBeVisible();
    await page.locator('#appSubTabsSlot [data-household-subtab="concerts"], #householdToolsRoot [data-household-subtab="concerts"]').first().click();
    await expect(page.locator('#householdToolsPane-concerts')).toBeVisible();

  });

  test('loads workbook-backed band cards, discovery, and nearby upcoming shows', async ({ page }) => {
    await expect(page.locator('[data-testid="concerts-favorites-grid"]')).toContainText('Depeche Mode');
    await expect(page.locator('[data-testid="concerts-favorites-grid"]')).toContainText('Nine Inch Nails');
    await expect(page.locator('[data-testid="concerts-attended-list"]')).toContainText('Chase Center');
    await expect(page.locator('[data-testid="concerts-discovery"]')).toContainText('A Flock of Seagulls');
    await expect(page.locator('[data-testid="concerts-upcoming-list"]')).toContainText('The Orange Peel');
    await expect(page.locator('[data-testid="concerts-upcoming-list"]')).toContainText(/mi away/);
    await expect(page.locator('#householdConcertsLocationText')).toContainText('Hendersonville, NC USA');
    await expect(page.locator('[data-testid="concerts-favorites-grid"] [data-concert-action="refresh-band-profile"]').first()).toBeVisible();
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
    await expect(page.locator('#householdConcertsBandForm input[name="Website_URL"]')).toHaveValue('https://www.qotsa.com');
    await expect(page.locator('#householdConcertsBandForm input[name="Wikipedia_URL"]')).toHaveValue('https://en.wikipedia.org/wiki/Queens_of_the_Stone_Age');
    await page.evaluate(() => {
      const form = document.getElementById('householdConcertsBandForm');
      if (form && typeof form.requestSubmit === 'function') form.requestSubmit();
    });

    await expect.poll(() => writes.some((entry) => entry.url.includes('/tables/Favorite_Bands/rows/add'))).toBeTruthy();

    await expect(page.locator('[data-testid="concerts-favorites-grid"]')).toContainText('Queens of the Stone Age');
    await expect(page.locator('#householdConcertsStatus')).toContainText(/Added Queens of the Stone Age|auto-filled/i);
    await expect(page.locator('[data-testid="concerts-favorites-grid"] article:has-text("Queens of the Stone Age")')).toContainText('Last enriched from');

    await page.locator('[data-testid="concerts-favorites-grid"] article:has-text("Queens of the Stone Age") [data-concert-action="refresh-band-profile"]').click();
    await expect(page.locator('#householdConcertsStatus')).toContainText('Band profile refreshed for Queens of the Stone Age');

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

    await expect(page.locator('[data-testid="concerts-attended-list"]')).toContainText('Queens of the Stone Age');
    await expect(page.locator('[data-testid="concerts-attended-list"]')).toContainText('Fantastic encore and huge crowd singalong.');
    await expect(page.locator('[data-testid="concerts-attended-list"]')).toContainText('Photo 2');
  });
});


