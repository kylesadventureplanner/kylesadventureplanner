# City Explorer Enhancement Plan

This plan rolls out City Explorer upgrades in four phases with small, testable slices.

## Phase 1 (Now): Polish + Usability

### Goal
Make City Explorer feel more polished and easier to operate during fast browsing.

### Scope
- Sticky location controls for quick access while scrolling.
- Active filter chips with one-click remove actions.
- Improved empty states with clear next actions.
- Keep current filter/sort behavior stable.

### Acceptance Criteria
- Controls remain visible while scrolling location results.
- Active filters are visible as chips and removable individually.
- Empty state explains why no rows are shown and offers reset/open-now actions.
- Existing inline-tool roundtrip tests continue to pass.

## Phase 2: Saved Views + Compare + Presets

### Goal
Improve planning speed by reducing repeated filter work.

### Scope
- Expand saved preset UX with a few smart default presets.
- Add shortlist compare surface (2-5 cards side-by-side).
- Add quick intent presets (Closest now, Best value, Most unique).

### Acceptance Criteria
- User can apply preset in one click and see immediate result changes.
- Compare panel highlights key differences (cost/rating/difficulty/tags).

## Phase 3: Scoring + Itinerary + Confidence

### Goal
Turn City Explorer into a recommendation and planning engine.

### Scope
- Weighted scoring model (distance, rating, cost, open-now, tag-match).
- Itinerary quality summary with feasibility confidence score.
- Better route summary diagnostics before opening map routes.

### Acceptance Criteria
- Score value and confidence are visible and understandable per result.
- Day plan includes feasibility guidance with clear warnings.

## Phase 4: Deep App Integrations

### Goal
Connect City Explorer to the rest of the app workflow.

### Scope
- Sync location actions with visited/adventure subtabs.
- Context handoff into Nature/Trails where relevant.
- One-click "edit this listing" handoff into Edit Mode.
- Offline-friendly fallback for last city + shortlist.

### Acceptance Criteria
- Deep links preserve `sourceSubtab` and current city/filter context.
- Cross-tool actions update origin tab state without manual refresh.

## Current Progress

- [x] Phase 1 initial slice implemented in `HTML Files/city-viewer-window.html`:
  - Sticky location controls
  - Active filter chips
  - Actionable empty states
- [x] Phase 1 follow-up: added `tests/city-explorer-phase1.spec.js` for filter chips and empty-state actions.
- [x] Phase 2 initial slice implemented in `HTML Files/city-viewer-window.html`:
  - Smart presets: `Closest now`, `Best value`, `Most unique`
  - Shortlist compare tray for 2–5 selected items
- [ ] Phase 2 follow-up: compare tray detail expansion and saved-view defaults.
- [x] Phase 3 initial slice implemented in `HTML Files/city-viewer-window.html`:
  - Ranking badges on location cards and detail view
  - Confidence indicators for planning data quality
- [x] Phase 3 follow-up implemented in `HTML Files/city-viewer-window.html`:
  - Itinerary scoring summary in the shortlist/day-plan area
  - Visible route-feasibility confidence with time-window analysis
- [ ] Phase 3 next follow-up: richer multi-stop optimizer and route tradeoff explanations.

