# Test Notes

## Mobile Snapshot Baselines

`tests/mobile-ux-snapshots.spec.js` only runs `toHaveScreenshot(...)` assertions when `MOBILE_QA_ASSERT=1`.

- Baseline updates must include both `MOBILE_QA_ASSERT=1` and `--update-snapshots`.
- If `MOBILE_QA_ASSERT` is not set, Playwright will not execute screenshot expectations, so baseline files are not refreshed.

Preferred local server for reliability runs (less flaky than `python3 -m http.server` under parallel Playwright load):

```bash
cd "/Users/kylechavez/WebstormProjects/kylesadventureplanner"
npx --yes http-server . -p 4173 -a 127.0.0.1 -c-1
```

In a second terminal:

```bash
cd "/Users/kylechavez/WebstormProjects/kylesadventureplanner"
APP_URL="http://127.0.0.1:4173" npm run reliability:smoke
APP_URL="http://127.0.0.1:4173" MOBILE_QA_ASSERT=1 npx playwright test tests/mobile-ux-snapshots.spec.js --update-snapshots
APP_URL="http://127.0.0.1:4173" MOBILE_QA_ASSERT=1 npx playwright test tests/mobile-ux-snapshots.spec.js
```

Fallback if `http-server` is unavailable:

```bash
python3 -m http.server 4173
```

Optional readiness tuning for mobile snapshot capture:

- `MOBILE_QA_MIN_HEIGHT` (default `7600`)
- `MOBILE_QA_MAX_HEIGHT` (default `8600`)
- `MOBILE_QA_STRICT_HEIGHT=1` to require exact height matching
- `MOBILE_QA_EXPECTED_HEIGHT` (default `7816`; used when strict mode is enabled, or directly when explicitly set)
- `MOBILE_QA_READY_TIMEOUT_MS` (default `12000`)
- `MOBILE_QA_STABLE_SAMPLES` (default `3`)
- `MOBILE_QA_STABLE_INTERVAL_MS` (default `250`)


