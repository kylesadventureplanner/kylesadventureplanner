# Family Enhancements Phase Plan

This plan turns your requested UX improvements into a practical rollout that can ship safely.

## Phase 1 (Immediate, high value)

### 1) Family profiles + preferences

Implement a shared preferences model with toggles:

- `budgetMode`
- `freeOnly`
- `nearbyOnly`
- `dayTrip`
- `overnightStay`
- `petFriendly`
- `indoorOnly`
- `lowWalking`

Storage + behavior:

- Persist in `localStorage` as a single JSON payload.
- Apply filters/scoring in suggestion engines (City/Adventure/Nature/Bike).
- Show active preferences as chips in each page control bar.

Acceptance criteria:

- Same preference state appears across major pages.
- Suggestions re-rank or filter immediately when toggles change.

### 2) Smart “Plan in 1 tap” presets

Add one-click presets:

- `2-hour nearby`
- `half-day`
- `rainy day indoor`
- `free activities`
- `food + 1 activity`

Acceptance criteria:

- Preset click updates controls and active chips.
- User can customize after applying preset.

### 3) Decision confidence + why

Each recommendation card should show:

- confidence score (`0-100`)
- plain-language "why" bullets (drive fit, open-now fit, budget fit, weather fit, family-fit)

Acceptance criteria:

- At least 2 reasons rendered for every suggestion.
- Confidence and reasons update when filters/preferences change.

### 4) Frictionless capture (mobile first)

Add a compact `Quick Add` sheet:

- name
- link
- photo URL/upload hook
- voice note (web speech or text fallback)

Acceptance criteria:

- Can save in < 20 seconds on phone.
- Captured item appears in inbox/holding list for later enrichment.

---

## Phase 2 (Consistency across all pages)

### 5) Unified action model

Use shared order and labels everywhere:

1. `Explore`
2. `Open in Map`
3. `Directions`
4. `Log Visit`
5. `Batch Tags`
6. `Notes`

Acceptance criteria:

- Action order and labels match in all quick-action menus.
- Old labels removed or aliased.

### 6) Shared page primitives everywhere

Adopt these shared classes page by page:

- `ui-page-shell`
- `ui-control-bar`
- `ui-card-grid`
- card slots (`ui-card-slot--hero`, `--meta`, `--primary`, `--secondary`, `--cta`)

Acceptance criteria:

- All major windows use primitives.
- Adjacent cards align consistently.

### 7) Consistent empty/loading/error language

Use one template:

- What happened
- What to do next
- One clear action

Acceptance criteria:

- Empty/loading/error components visually and textually consistent across pages.

### 8) Single icon + label dictionary

Move icon/label pairs into shared dictionary so pages read from one source.

Acceptance criteria:

- New actions must be added once in dictionary.
- No conflicting labels for same action key.

---

## Phase 3 (Hardening and long-term maintainability)

### 9) Design token audit pass

Replace hard-coded spacing/colors/radius/shadows with shared tokens.

Acceptance criteria:

- Most hard-coded style literals removed from page-local CSS except intentional exceptions.

### 10) Cross-page keyboard model

Standardize:

- `/` focus search
- `Esc` close modal/menu
- arrows for tab/card contexts
- consistent tab flow

Acceptance criteria:

- Keyboard smoke tests pass on every major window.

### 11) Duplicate + stale cleanup assistant

Monthly maintenance wizard:

- detect duplicates (name + geo/address similarity)
- detect stale entries (old update dates, broken links)
- provide merge/refresh workflow

Acceptance criteria:

- One-click review queue generated.
- Merge results preserve notes/tags/history safely.

---

## Suggested next implementation order

1. Shared preference model + presets
2. Recommendation confidence + why
3. Quick Add mobile sheet
4. Unified action dictionary rollout
5. Cleanup wizard

