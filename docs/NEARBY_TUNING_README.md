# Nearby tuning quick guide

This project now includes a lightweight tuning pass for nearby ranking weights and category chips.

## What was tuned

- Ranking source weights in `nearby-attractions-finder.js`:
  - `local: 0.216`
  - `google: 0.108`
  - `existsInApp: 0.363`
  - `distance: 0.255`
  - `rating: 0.059`
- Category keyword maps expanded for better chip coverage:
  - `food`, `nature`, `family`, `nightlife`, `culture`, `shopping`

## Why these values

The tuning script analyzes local repository fixtures and computes a quick distribution report:

- `nearby-attractions-demo.html` sample app locations
- `tests/adventure-explorer-inpane-details.spec.js` mock explorer rows

## Generate the tuning report

```bash
cd /Users/kylechavez/WebstormProjects/kylesadventureplanner
npm run nearby:tuning-report
```

## Validate nearby regression behavior

```bash
cd /Users/kylechavez/WebstormProjects/kylesadventureplanner
npx playwright test tests/adventure-explorer-inpane-details.spec.js -g "nearby refresh returns cards from Google/local URL-derived coords and empty refresh is non-destructive"
```

## Notes

- This is a fast calibration pass based on checked-in fixtures.
- If you export a larger real dataset later, re-run the report and adjust weights/chip terms in `nearby-attractions-finder.js`.

