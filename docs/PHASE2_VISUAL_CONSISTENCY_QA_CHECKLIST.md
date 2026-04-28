# Phase 2 Visual Consistency QA Checklist

Use this quick pass to confirm shared UI anatomy and message cadence stay consistent across Edit Mode, City Viewer, and Visited tab surfaces.

## 1) Section headers + toggles

- [ ] `visited-locations-tab.html` explorer sections use shared header anatomy classes (`ui-section-header-row`, `ui-section-header-copy`).
- [ ] Visited advanced filter summaries use shared toggle button anatomy (`ui-section-toggle-btn`) and still expand/collapse correctly.
- [ ] Visited diagnostics summary keeps its existing expand/collapse behavior with shared header/toggle classes applied.
- [ ] City Viewer filter/status headers still align left/right and toggle caret/label transitions still work.

## 2) Mini button consistency

- [ ] City Viewer mini buttons in static toolbar areas render with shared semantics: `loc-mini-btn ui-btn ui-btn--mini`.
- [ ] City Viewer mini buttons inside generated HTML strings (source chips, compare cards, wildlife summary, empty-state actions) also use `ui-btn ui-btn--mini`.
- [ ] Hover/focus states remain legible on dark/light contexts (shortlist tray, compare tray, and white cards).

## 3) Tokenized spacing (tab shell)

- [ ] City Viewer top shell spacing uses `--ui-space-*` / shell token fallbacks for `body`, `.header`, `.controls`, and primary source notice row.
- [ ] No visual regressions in desktop or mobile breakpoints for top shell rhythm.

## 4) Empty/loading/status cadence

Cadence standard: **icon + plain language + action**.

- [ ] City Viewer empty state when filtered: message is plain-language and includes clear action guidance.
- [ ] City Viewer empty state when no city data available: message and next step are explicit.
- [ ] Edit Mode write-diagnostics placeholders use the same cadence and suggest a next action.
- [ ] Edit Mode loading helper text uses plain language and indicates what to do next.

## 5) Smoke interactions

- [ ] Open each affected tab/window and toggle all updated collapsibles once.
- [ ] Trigger one empty-state path in City Viewer (apply restrictive filters).
- [ ] Trigger one write-diagnostics placeholder path in Edit Mode.
- [ ] Confirm no console errors/regressions from class name updates.

## Suggested acceptance rule

Ship when all checklist boxes pass in Chromium at one desktop width and one mobile width.

