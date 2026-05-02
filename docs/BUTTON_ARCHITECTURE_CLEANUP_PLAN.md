# Button architecture cleanup plan

**Date:** April 8, 2026  
**Status:** Active migration playbook

This plan standardizes button behavior across tabs to prevent click drops, partial-hit-area issues, and startup timing race conditions.

Execution tracker: [`BUTTON_MIGRATION_TRACKER.md`](./BUTTON_MIGRATION_TRACKER.md)

---

## Goals

- Make button activation deterministic from first interactive frame onward.
- Use one canonical event path per control (no duplicate owners).
- Ensure hidden/loading overlays never block interactions accidentally.
- Keep diagnostics clear so failures are observable and actionable.

---

## Why reliability broke down

- Multiple systems touched the same controls (delegated handlers + direct listeners + runtime fixups).
- Stale loading overlays and startup locks occasionally intercepted pointer events.
- Some controls had split ownership across different files/phases.
- Readiness timing varied during preload/lazy-init, so users could click before the final owner was active.

---

## Canonical button architecture

1. **One owner per control**
   - Primary pattern: delegated handler on tab root (`event.target.closest(...)`).
   - Avoid adding direct click listeners to controls already handled by delegation.

2. **Single-flight guard for side-effect actions**
   - Use per-action lock + dedupe window for save/refresh/sync style actions.
   - Always release lock in `finally`.

3. **Fail-open overlays**
   - Hidden/inactive overlays must use `pointer-events: none`.
   - Only visible, intentional modal states may block input.

4. **Readiness-gated UX**
   - Keep startup overlay until `app:interactive-ready`.
   - Expose readiness telemetry and show startup timing in debug UI.

5. **Diagnostics-first troubleshooting**
   - If a click is not seen in diagnostics, suspect interception before handler.
   - Use blocker detection (`elementFromPoint`) to identify top-layer interceptors.

---

## Do / Don't rules

### Do

- Do route tab actions through a single delegated selector list.
- Do keep handlers idempotent for rapid taps/clicks.
- Do treat `disabled`, `aria-disabled="true"`, and busy state as fail-closed.
- Do keep button hit targets >= 40px where practical.
- Do log actionable traces for blocked/deduped/in-flight drops.

### Don't

- Don't bind the same control in both delegated and direct click paths.
- Don't force global z-index/pointer-events rules that can create stacking conflicts.
- Don't keep full-screen loader layers pointer-active after ready state.
- Don't silently swallow early exits without diagnostic traces.

---

## Migration checklist by tab

Use this checklist per tab. Mark each item done before moving to the next tab.

### `adventure-planner`

- [ ] Inventory all button handlers and map ownership per control.
- [ ] Remove duplicate direct listeners where delegated owner already exists.
- [ ] Verify overlays/context menus are non-blocking when hidden.
- [ ] Add/confirm diagnostics for dropped or blocked clicks.

### `bike-trails`

- [ ] Consolidate explorer/open/save actions to one owner path.
- [ ] Remove legacy fallback listeners that double-fire.
- [ ] Confirm table-loading overlays do not block top actions post-load.
- [ ] Run quick matrix: mouse, touch, keyboard activation.

### `birding`

- [ ] Audit binding ownership for filter/action buttons.
- [ ] Add single-flight guards to mutation actions.
- [ ] Validate hidden state uses non-blocking pointer behavior.

### `recipes`

- [ ] Standardize action buttons to delegated ownership.
- [ ] Remove direct fallback bindings that overlap canonical path.
- [ ] Verify focus/keyboard behavior and disabled semantics.

### `garden`

- [ ] Consolidate handlers for save/add/edit buttons.
- [ ] Ensure overlay/modal backdrops block only while active.
- [ ] Add diagnostics line items for action routing.

### `budget`

- [ ] Unify button event routing and remove duplicate listeners.
- [ ] Guard calculate/save actions with in-flight lock + dedupe.
- [ ] Validate startup readiness timing for first-click success.

### `nature-challenge`

- [x] Core buttons consolidated to delegated ownership (`Refresh`, `Explore`, `Open Log`, command `Run`).
- [x] Added startup/readiness observability and startup timing line.
- [x] Added overlay unblocking safeguards and diagnostics traces.
- [ ] Keep monitoring for any cross-system listener interference.

### `visited-locations`

- [ ] Confirm canonical handler ownership for tab actions.
- [ ] Remove direct-listener overlap with delegated route.
- [ ] Validate modals/backdrops do not intercept after close.

---

## Rollout sequence

1. Freeze new button-related ad hoc hotfixes.
2. Migrate one tab at a time using the checklist above.
3. Run tab regression + button test matrix after each tab.
4. Ship in small increments; avoid large all-tab rewrites.

---

## PR gate checklist (required)

Copy this into PR descriptions for button-related changes:

- [ ] One canonical owner per button control.
- [ ] No overlapping direct + delegated click owners.
- [ ] Hidden/inactive overlays are non-blocking (`pointer-events: none`).
- [ ] Side-effect actions use shared guard (`window.ButtonActionGuard` or scoped wrapper).
- [ ] Diagnostics include clear blocked/deduped/in-flight traces.

---

## Reliability SLOs (initial targets)

- **Startup Interactivity (`app:interactive-ready`)**
  - Target median: <= 1500 ms
  - Target p95: <= 3500 ms
- **First-Click Success (key actions: Refresh/Explore/Run)**
  - Target: >= 99% success on first user activation after overlay dismissal
- **Overlay Interception Incidents**
  - Target: 0 unresolved blockers per release

Measure these via startup timing telemetry and button diagnostics evidence links.

---

## New reliability operations layer

- Global error boundary pipeline is centralized via `window.onerror` + `unhandledrejection`.
- Each error report is tagged with:
  - active tab
  - last action key
  - readiness state snapshot
- Runtime snapshot API: `window.__reliabilityStatus()`

---

## Stuck-State Auto-Recovery

Recovery loop runs every few seconds and auto-clears:

- lingering loader overlays
- stale `data-busy="1"` button states
- stale `.tab-is-loading` panes / orphan loader indicators

Each recovery action is logged for postmortem in reliability events.

---

## Retry policy by operation type

- **Read operations**: retry 2-3 attempts with exponential backoff.
- **Write operations**: retry only idempotent-safe writes.
- **User feedback** must distinguish:
  - `Retrying ...`
  - `Recovered ...`
  - `Failed ...`

Shared runtime helper: `window.ReliabilityAsync`

---

## Disaster diagnostics bundle

One-command export for support/debug triage:

```javascript
window.exportReliabilityDiagnosticsBundle()
```

Bundle includes:

- `__reliabilityStatus()` snapshot
- startup timing snapshot
- recent click traces
- blocking overlays + click-path probe results

---

## Validation checklist (per PR)

- [ ] No duplicate owners for the same control.
- [ ] No hidden overlay intercepts clicks.
- [ ] No missing diagnostics traces for failed click paths.
- [ ] Touch + mouse + keyboard activation verified.
- [ ] Startup timing remains in acceptable threshold state.

---

## Definition of done

- Buttons across all tabs have single-path ownership.
- First-click success is reliable after startup overlay dismissal.
- No "sliver click area" behavior in normal flows.
- Diagnostics clearly explain any blocked/deduped actions.

