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

## Quick validation

Use the button `Test Festival Source Search` in the panel.
It runs a test query (`apple festival`) and reports the result count.

