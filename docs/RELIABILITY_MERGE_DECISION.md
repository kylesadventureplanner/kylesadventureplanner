# Reliability JS merge decision (safe path)

Date: April 5, 2026

## Decision

Do **not** merge additional reliability runtime files right now.

## Why this is the safest option

- `index.html` already loads the active stack in this order:
  1. `JS Files/app-quality-system.js`
  2. `JS Files/button-reliability-system.js`
  3. `JS Files/button-handlers.js`
- This setup is already consolidated for core quality systems (`app-quality-system.js`).
- Further runtime merging of `button-reliability-system.js` and `button-handlers.js` is possible, but high-risk because both attach global listeners and modal/button behavior.

## Safe consolidation status

- ✅ Core reliability/performance/debug: consolidated in `JS Files/app-quality-system.js`
- ✅ Button reliability hardening: dedicated in `JS Files/button-reliability-system.js`
- ✅ UI/button behavior wrappers: dedicated in `JS Files/button-handlers.js`

## Recommendation

Use a phased approach:

1. Keep current runtime split (lowest regression risk).
2. Update docs to point to canonical files and load order.
3. If desired later, merge only after parity tests for button clicks, row-detail modal actions, and dynamic tab content.

## Pre-merge checklist for a future runtime merge

- Verify all `window.ButtonReliability` APIs behave the same.
- Verify row-detail modal open/edit/save/cancel flows.
- Verify dynamically loaded tab buttons still respond.
- Verify no duplicate delegated listeners are left behind.
- Run targeted smoke tests for legacy/archived Adventure Planner flows (redirect compatibility) + Bike Trails tab.

