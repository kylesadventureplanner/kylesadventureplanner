# Legacy/archived Adventure Planner retirement note

**Status:** Retired in runtime UI  
**Canonical replacement:** `visited-locations` (Adventure Challenge)

## What changed

- Runtime `index.html` now keeps only a hidden retired stub for `#adventurePlannerTab`.
- Legacy/archived Adventure Planner markup is archived at `HTML Files/tabs/adventure-planner-tab-archive.html`.
- Deep-link compatibility remains in place:
  - `?tab=adventure-planner` is canonicalized to `?tab=visited-locations`.

## Why this exists

This note prevents future confusion between:

- **Runtime sources** (active tabs and handlers), and
- **Archive sources** kept for historical/debug reference.

## Retention rules

- Keep alias/redirect compatibility for old links and diagnostics entry points.
- Prefer `visited-locations` for all active features, tests, and docs.
- Label any remaining legacy/archived Adventure Planner references as `legacy` or `archived`.

