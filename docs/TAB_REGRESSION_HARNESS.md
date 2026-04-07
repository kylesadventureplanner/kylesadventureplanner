# Tab Regression Harness

A minimal in-browser regression harness validates tab ownership and URL restore behavior.

## What it checks

1. Single active tab button and pane at all times
2. Rapid tab switching stability
3. Query deep-link restore (`?tab=...`) via `popstate`
4. Hash deep-link restore (`#tab=...`) via `hashchange`
5. Back/forward tab history restore
6. One-time tab initialization guard

## How to run

- In browser console:

```javascript
await window.runTabRegressionHarness();
```

- Auto-run on page load:

Append `runTabHarness=1` to the URL query string.

Example:

`/index.html?tab=nature-challenge&runTabHarness=1`

## Output

- Prints a console table with PASS/FAIL per check
- Returns a summary object: `{ total, passed, failed, results }`
- Shows a small bottom-right status badge while running, then final `PASS` or `FAIL`
- Badge includes a clickable `x` to dismiss after a run (it reappears on the next run)

## Notes

- Harness script: `JS Files/tab-regression-harness.js`
- Designed to be fast and low-maintenance, using existing DOM contracts (`.app-tab-btn`, `.app-tab-pane`).

