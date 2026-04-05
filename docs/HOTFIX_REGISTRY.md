# Hotfix Registry

Last updated: 2026-04-03

## Active Hotfixes

| File | Owner | Added | Purpose | Removal Criteria |
|---|---|---|---|---|
| `JS Files/runtime-hotfixes.js` | Kyle + Copilot | 2026-04-03 | Consolidated runtime patch layer for Adventure Planner filters/autocomplete/context-menu interactivity and overlay click-block protection. | Remove after root-cause fixes are merged into canonical app modules and verified in at least 2 release cycles with no regression. |

## Archived Hotfixes

| File | Archived On | Replaced By | Reason |
|---|---|---|---|
| `JS Files/context-filter-final-overrides.js` | 2026-04-03 | `JS Files/runtime-hotfixes.js` | Duplicate context-filter helper overrides; caused maintenance overlap. |
| `JS Files/dry-run-refresh-fix-v7-0-133.js` | 2026-04-03 | N/A (inactive) | Unreferenced legacy patch; no active script include. |
| `JS Files/adventure-filter-hotfix.js` | 2026-04-03 | `JS Files/runtime-hotfixes.js` | Superseded by consolidated runtime entrypoint to reduce patch sprawl/load-order risk. |

## Operating Rules

1. Add new hotfixes only when production impact exists and root-cause fix is not immediately shippable.
2. Every hotfix must include a clear owner, purpose, and explicit removal criteria.
3. Keep one runtime hotfix entrypoint (`runtime-hotfixes.js`) to avoid load-order conflicts.
4. Archive or delete superseded hotfix files in `JS Files/_archived-hotfixes/`.

