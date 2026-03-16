# Wave 0 No-GUI Smoke Runner

This runner performs **static/no-GUI** smoke checks for Wave 0 safety.

## Files

- `kylesadventureplanner/tools/wave0-smoke.config.json` - check configuration
- `kylesadventureplanner/tools/wave0-smoke.js` - dependency-free Node runner

## What It Checks

1. Required JS files exist.
2. Required `<script src>` references exist in active HTML pages.
3. Critical global symbols are present in source files.
4. Fix-stack load-order sequence exists in `kylesadventureplanner/index.html`.
5. Deprecation candidates are not referenced by active HTML files.

## Run

```bash
node "kylesadventureplanner/tools/wave0-smoke.js"
```

## Output

- JSON report: `docs/js-audit/reports/wave0-smoke-<timestamp>.json`
- Markdown report: `docs/js-audit/reports/wave0-smoke-<timestamp>.md`
- Exit code `0` on pass, `1` on fail

## Headless Playwright Layer (No Manual Clicking)

A second layer now exists for headless interaction checks:

- `kylesadventureplanner/tools/playwright-smoke/package.json`
- `kylesadventureplanner/tools/playwright-smoke/smoke.config.json`
- `kylesadventureplanner/tools/playwright-smoke/run-smoke.js`
- `kylesadventureplanner/tools/playwright-smoke/README.md`

Run commands:

```bash
cd "kylesadventureplanner/tools/playwright-smoke"
npm install
npx playwright install chromium
npm run smoke
```

Combined one-command gate (static + playwright):

```bash
cd "kylesadventureplanner/tools/playwright-smoke"
npm run smoke:all
```

Playwright output reports:
- `docs/js-audit/reports/wave0-playwright-smoke-<timestamp>.json`
- `docs/js-audit/reports/wave0-playwright-smoke-<timestamp>.md`

## CI Workflow

- Workflow file: `kylesadventureplanner/.github/workflows/wave0-smoke.yml`
- Trigger: `push` and `pull_request`
- Job runs: `npm run smoke:all`
- Reports uploaded as workflow artifacts (always)

## Notes

- Static runner is intentionally non-browser and does not replace behavioral checks.
- Headless Playwright adds automatic click-flow checks, popup/tab attempt checks, and JS error capture.
- Use both layers plus `docs/js-audit/smoke-test-checklist.md` for full release confidence.
