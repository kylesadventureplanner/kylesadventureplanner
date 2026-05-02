# Button migration tracker

**Date:** April 8, 2026  
**Status:** Active execution tracker

Use this page to run the button architecture migration week-by-week with clear ownership and completion evidence.

Related plan: [`BUTTON_ARCHITECTURE_CLEANUP_PLAN.md`](./BUTTON_ARCHITECTURE_CLEANUP_PLAN.md)

---

## How to use

- Update this table at least once per week.
- Keep one DRI owner per tab.
- Add a short evidence link (PR, test report, or commit) when status changes.

---

## Status values (use exactly these)

- `not-started` - No inventory done yet.
- `inventorying` - Handler ownership and overlap audit in progress.
- `in-progress` - Migration work actively underway.
- `blocked` - Cannot proceed due to dependency or unresolved defect.
- `ready-for-review` - Migration complete, awaiting validation/review.
- `done` - Passed validation checklist and merged.

---

## Weekly tracker

| Tab | Owner | Status | Last Updated | Target Week | Notes / Blockers | Evidence |
|---|---|---|---|---|---|---|
| `adventure-planner` | _unassigned_ | `not-started` | 2026-04-08 | Wk 1 | Inventory all button owners first | _none_ |
| `bike-trails` | _unassigned_ | `in-progress` | 2026-04-08 | Wk 1 | Guard migration complete for core side-effect actions; ready-for-review once manual mouse/touch/keyboard action matrix evidence is attached | `JS Files/button-action-guard.js`; `JS Files/bike-trails-tab-system.js` (`withBikeActionGuard`, `refreshBikeTrailData`, `openTrailExplorerWindow`) |
| `birding` | _unassigned_ | `in-progress` | 2026-04-08 | Wk 2 | Shared guard scope bootstrapped for this tab; actionable controls are currently placeholder-level | `HTML Files/tabs/birding-locations-tab.html` (`window.BirdingActionGuard` scope initialization) |
| `recipes` | _unassigned_ | `not-started` | 2026-04-08 | Wk 2 | Consolidate action ownership | _none_ |
| `garden` | _unassigned_ | `not-started` | 2026-04-08 | Wk 3 | Verify modal/backdrop pointer behavior | _none_ |
| `budget` | _unassigned_ | `not-started` | 2026-04-08 | Wk 3 | Guard calculate/save actions | _none_ |
| `nature-challenge` | _unassigned_ | `in-progress` | 2026-04-08 | Wk 0 | Core path stabilized with shared guard, retry policy wrappers, and global reliability telemetry integration | `JS Files/nature-challenge-tab-system.js` (`withBirdsActionGuard`, Graph retry wrappers); `JS Files/reliability-ops.js`; `JS Files/button-action-guard.js`; `index.html` startup timing telemetry |
| `visited-locations` | _unassigned_ | `not-started` | 2026-04-08 | Wk 4 | Confirm canonical ownership | _none_ |

---

## Weekly cadence

- **Update day:** Friday (or final workday of week).
- **Stale rule:** Any row not updated in 7+ days must be reviewed.
- **Blocked rule:** If `blocked` for > 3 business days, escalate and record decision.
- **Carry-over rule:** If week target slips, move target week forward and add reason in Notes.

### Friday triage ritual (10-15 min)

1. Update each touched row `Status`, `Last Updated`, and `Notes / Blockers`.
2. Add at least one `Evidence` link for every row with status changes.
3. Move any stalled row to `blocked` with a concrete unblock condition.
4. Pick one next tab slice only (avoid multi-tab partial migrations).

---

## Definition of done (per tab)

A tab can be set to `done` only when all are true:

- No duplicate owners for same button control.
- Hidden overlays do not intercept clicks.
- Diagnostics show expected traces for activation and blocked cases.
- Mouse, touch, and keyboard activation pass.
- Evidence link is recorded in tracker.

---

## Current execution focus

- **Current template slices:** `nature-challenge` and `bike-trails`
- **Next recommended slice:** `adventure-planner` (or promote `bike-trails` after matrix evidence)
- **Rule:** Promote one tab to `ready-for-review` before starting the next tab

---

## Quick weekly summary template

Copy/paste this each week:

```md
### Week of yyyy-mm-dd
- Completed:
- In progress:
- Blocked:
- Next focus:
```

