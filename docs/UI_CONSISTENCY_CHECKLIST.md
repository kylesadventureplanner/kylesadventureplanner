# UI Consistency Checklist

This checklist is tailored to the current workspace structure in `kylesadventureplanner`.

## 1) Design system source of truth

- [ ] Keep all reusable tokens in `CSS/design-tokens.css` (color, spacing, radius, typography, shadows).
- [x] Do not redeclare global tokens in page-level `<style>` blocks (example target: `HTML Files/edit-mode-new.html`).
- [x] Prefer token references (`var(--...)`) over raw hex values in component/page CSS (applied to new `edit-*` color classes).

## 2) Stylesheet import contract (all HTML entry pages)

Canonical order:

1. `design-tokens.css`
2. `components.css`
3. `utilities.css`
4. page stylesheet (for example `browse-page.css` or `edit-page.css`)

Current check:

- [x] `HTML Files/trail-explorer-window.html` follows canonical order.
- [x] `HTML Files/edit-mode-new.html` follows canonical order.
- [ ] Re-check any newly added entry HTML files before merge.

## 3) CSS architecture boundaries

- [x] `CSS/components.css`: reusable UI components only (buttons, cards, badges, chips, notifications). Feature-specific styles moved from utilities: offline hints, tags, state badges, favorite buttons, find-near-me buttons, breadcrumb menus, ratings, history controls, sort indicators, modal backdrops.
- [x] `CSS/utilities.css`: tiny single-purpose utility classes only (u-*, mark, mobile responsiveness).
- [ ] `CSS/browse-page.css` and `CSS/edit-page.css`: page/screen layout and page-specific rules only.
- [x] Avoid duplicating selectors across component/page files unless intentionally overriding.

## 4) Page shell consistency

- [ ] Use the same shell pattern across windows/pages: sticky header + content root + loading state.
- [ ] Keep shared shell pieces aligned with `HTML Files/components-header.html` and `HTML Files/components-notifications.html`.
- [ ] Use utility classes (for example `.hidden`) for visibility toggles instead of inline `style` mutations.

## 5) Inline style debt cleanup

- [x] Remove inline `<style>` blocks where equivalent CSS can live in shared files.
- [x] Remove `style="..."` attributes for layout/visibility and replace with class-based styling (completed for `HTML Files/edit-mode-new.html`).
- [x] Remove `style="..."` attributes for layout/visibility and replace with class-based styling (completed for `HTML Files/find-near-me-window.html`, `HTML Files/city-viewer-window.html`, `HTML Files/adventure-details-window.html`, and `HTML Files/bike-details-window.html`).
- [ ] Leave truly dynamic values inline only when they cannot be represented with classes.

## 6) Pilot migration recipe (completed on Trail Explorer)

Reference file: `HTML Files/trail-explorer-window.html`

- [x] Removed page inline `<style>` block.
- [x] Moved shell styles to `CSS/browse-page.css` (`#trailExplorerHeader`, `#trailExplorerBootstrap`, related classes/animation).
- [x] Replaced `style="display:none;"` on `#bikeTrailsTab` with `.hidden` class.
- [x] Switched JS visibility toggles from `element.style.display = ...` to class toggles (`.hidden`, `.is-visible`).

## 7) Next rollout targets

1. `HTML Files/edit-mode-new.html` (inline `<style>` and inline `style="..."` attributes completed).
2. `HTML Files/find-near-me-window.html` and `HTML Files/city-viewer-window.html` (inline `style="..."` attributes completed).
3. `HTML Files/adventure-details-window.html` and `HTML Files/bike-details-window.html` (inline `style="..."` attributes completed).
   - [x] `HTML Files/bike-details-window.html` — inline `<style>` block extracted to `CSS/bike-details-window.css`; canonical 4-stylesheet import order applied (design-tokens → components → utilities → bike-details-window).
   - [x] `HTML Files/adventure-details-window.html` — inline `<style>` block extracted to `CSS/adventure-details-window.css`; canonical 4-stylesheet import order applied (design-tokens -> components -> utilities -> adventure-details-window).
4. Tabs under `HTML Files/tabs/` after shell/component patterns are stable.

## 8) QA pass for each migrated page

- [ ] Open page and verify header, spacing, typography, and button styles match baseline.
- [ ] Verify loading and error states still render correctly.
- [ ] Verify no regressions in JS behavior tied to class/state toggling.
- [ ] Capture before/after screenshots for visual diff review.

## 9) Shared utility extraction

- [x] Extracted repeated window utility patterns into `CSS/utilities.css` (`.u-hidden`, `.u-stack-gap-sm`, `.u-mt-10`, `.u-text-xs-dim`).
- [x] Updated `HTML Files/adventure-details-window.html` and `HTML Files/bike-details-window.html` to consume shared window utility classes.
- [x] Applied the same shared utility naming cleanup to `HTML Files/find-near-me-window.html` and `HTML Files/city-viewer-window.html`.
- [x] Completed a safe dedupe pass for time-window utility-like classes in `HTML Files/city-viewer-window.html` (moved to shared `u-*` classes in `CSS/utilities.css`).


