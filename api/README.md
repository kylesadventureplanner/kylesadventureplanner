# Device Auth Broker API

This folder contains Azure Functions endpoints used by the secure Microsoft Device Code Flow implementation.

## Endpoints

- `POST /api/auth/device/start`
- `POST /api/auth/device/poll`
- `GET /api/public/bandsintown?route=artist|events&artist=<band name or slug>`
- `GET /api/public/historic-shows?band=<name>&fromYear=<yyyy>&toYear=<yyyy>&radiusMiles=<25|50|100>&latitude=<num>&longitude=<num>&locationLabel=<text>` (merged from setlist.fm + Bandsintown when available)
- `GET /api/public/historic-shows?mode=song-stats&band=<name>&fromYear=<yyyy>&toYear=<yyyy>` (setlist.fm top-song frequency summary)

## Environment Variables

- `AAD_TENANT_ID` (required)
- `AAD_DEVICE_CLIENT_ID` (required)
- `AAD_DEVICE_CLIENT_SECRET` (optional)
- `AAD_DEVICE_SCOPES` (optional, default: `User.Read Files.ReadWrite openid profile`)
- `DEVICE_FLOW_SIGNING_SECRET` (required)
- `SETLISTFM_API_KEY` (required for historic concert search)
- `BANDSINTOWN_APP_ID` (optional, default: `kyles_adventure_planner`)

## Local Run

1. Install Azure Functions Core Tools.
2. Create `local.settings.json` from `local.settings.sample.json` and fill values.
3. Start the Functions host from this folder.

## Security Notes

- Device flow state is signed server-side; client cannot forge/alter flow payloads.
- Responses are `Cache-Control: no-store`.
- Tokens are never logged.

