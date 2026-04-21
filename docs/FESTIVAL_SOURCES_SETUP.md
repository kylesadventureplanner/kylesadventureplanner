# Festival Sources Setup

This project now supports festival-event providers in Edit Mode.

## Where to configure

1. Open Edit Mode.
2. Go to the `Automation` tab.
3. Use the `Festival Sources` card.

## Providers

- Ticketmaster API
- Eventbrite API
- Official Tourism/County feeds (RSS/Atom/iCal/JSON/HTML JSON-LD)
- FestivalNet / Chamber feeds (RSS/Atom/iCal/JSON/HTML JSON-LD)

## New controls in Festival Sources panel

- Per-source test buttons:
  - `Test Ticketmaster Only`
  - `Test Eventbrite Only`
  - `Test Feeds Only`
- Source priority controls (`1` runs earlier than `4`)
- Source weight controls (higher weight boosts ranking score)
- `Show API credentials` toggle (reveals/hides key/token fields)
- `Export Source Config JSON` and `Import Source Config JSON`
- `Load Southeast Starter Feeds` (adds curated regional tourism/chamber-style feeds on demand)
- Drag/drop provider ordering list (top runs first)
- Provider health indicators (last success/error, returned count, timing)
- `Dry-Run Source Diagnostics` summary (per-provider counts and timings)

## Required credentials

### Ticketmaster

- Field: `Ticketmaster API Key`
- API used: Discovery API (`/discovery/v2/events.json`)

### Eventbrite

- Field: `Eventbrite API Token`
- API used: Eventbrite search API (`/v3/events/search/`)
- Header: `Authorization: Bearer <token>`

## Feed format

For feed text areas, use one source per line:

- `https://example.com/events.rss`
- `Visit NC|https://example.com/events.ics`

If a label is included, use `Label|URL`.

## Notes

- Settings are stored in browser local storage key: `editModeFestivalSourcesConfigV1`.
- The config is mirrored to runtime object: `window.__festivalSourceConfig`.
- For Festivals target, candidate search can import events without Google Place IDs.
- If a source fails (timeout/CORS/HTTP), the app logs a warning and continues with other sources.
- Provider filters are supported during source test runs via `providerFilter` in `searchFestivalEvents` options.
- Ranking uses query relevance plus configured provider weight and priority.
- Provider order is persisted via `providerOrder` in source config JSON.

## Quick validation

Use the button `Test Festival Source Search` in the panel.
It runs a test query (`apple festival`) and reports the result count.

## Southeast starter feeds (on demand)

Use `Load Southeast Starter Feeds` to append starter sources into the feed textareas.

Official calendars starter set:
- `Blue Ridge Parkway Events|https://www.blueridgeparkway.org/events/feed/`
- `Visit Hendersonville NC Events|https://visithendersonvillenc.org/events/feed/`
- `Blowing Rock NC Events|https://www.blowingrock.com/events/feed/`
- `NC Apple Festival|https://www.ncapplefestival.org/feed/`

Chamber/supplemental starter set:
- `Southern Highland Craft Guild Events|https://www.southernhighlandguild.org/events/feed/`
- `Carolina Farm Stewardship Events|https://www.carolinafarmstewards.org/events/feed/`
- `Festival Guides and Reviews Feed|https://festivalguidesandreviews.com/feed/`

Notes:
- Starter feeds are not auto-enabled until you click the button and save.
- Some external sources may block browser-origin fetches (CORS); the app skips failed sources and continues.

