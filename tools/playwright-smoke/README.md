# Headless Playwright Smoke (Wave 0)

This adds a no-manual-click smoke layer to exercise key flows in headless Chromium.

## Coverage

- Open main app page and collect uncaught JS/runtime console errors.
- Click core buttons and verify clickability:
  - `#editModeBtn`
  - `#findNearMeBtn`
  - `#cityViewerBtn, .city-viewer-btn`
- Track popup/tab attempts from `window.open` flows.
- Open automation panel page and click key automation buttons:
  - `#btnPopulateMissing`
  - `#btnRefreshHours`
  - `#btnRefreshPlaceIds`
  - `#btnSearchPlaceIds`
  - `#btnAddPlace`

## Setup

```bash
cd "kylesadventureplanner/tools/playwright-smoke"
npm install
npx playwright install chromium
```

## Run

```bash
cd "kylesadventureplanner/tools/playwright-smoke"
npm run smoke
```

## Run Both Gates In One Command (Recommended)

This runs the static Wave 0 checks first, then Playwright headless checks.

```bash
cd "kylesadventureplanner/tools/playwright-smoke"
npm run smoke:all
```

## Output

Reports are written to `docs/js-audit/reports/`:

- `wave0-playwright-smoke-<timestamp>.json`
- `wave0-playwright-smoke-<timestamp>.md`

The process exits with:

- `0` when all checks pass
- `1` when any check fails

## CI

A workflow is provided at `kylesadventureplanner/.github/workflows/wave0-smoke.yml`.
It runs `npm run smoke:all` automatically on push and pull requests.

## Notes

- This runner uses local `file://` URLs and does not require a dev server.
- It does not replace full manual acceptance, but it catches many regressions earlier.
