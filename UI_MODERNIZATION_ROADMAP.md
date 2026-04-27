# UI Modernization Roadmap

This roadmap translates the City Viewer modernization into reusable standards for the rest of the app.

## 1) Shared UI shell

Use one shell across pages:

- `ui-page-shell` wrapper
- `ui-page-header` + title/subtitle + header actions
- `ui-control-bar` for search/filter/sort controls
- `ui-card-grid` for responsive card layouts
- `ui-empty` / `ui-loading` / `ui-feedback` states

### Rollout checklist

- [ ] `HTML Files/city-viewer-window.html` (pilot complete style alignment)
- [ ] `HTML Files/trail-explorer-window.html`
- [ ] `HTML Files/adventure-details-window.html`
- [ ] `HTML Files/bike-details-window.html`
- [ ] `HTML Files/edit-mode-new.html`

## 2) Tokenize visual system

Source of truth:

- `CSS/design-tokens.css` for spacing, radii, shadows, gradients, focus rings
- `CSS/components.css` for shared composable classes

Rules:

- Avoid hard-coded colors/spacing in page-local styles when a token exists.
- Prefer component classes over one-off selectors for common patterns.
- Keep page-local CSS for page-specific layout only.

## 3) Standard card anatomy

All list cards should follow the same slot order:

1. Hero (`ui-card-slot--hero`)
2. Metadata chips (`ui-card-slot--meta`)
3. Primary metric (`ui-card-slot--primary`)
4. Secondary row (`ui-card-slot--secondary`)
5. CTA row (`ui-card-slot--cta`)

Implementation notes:

- Reserve space for optional rows using min-heights to keep adjacent cards aligned.
- Keep CTA pinned to bottom with `margin-top: auto`.

## 4) Unify action language

Use consistent labels and order for quick actions.

### Canonical labels

- `Explore`
- `Open in Map`
- `Open Google URL`
- `Directions`
- `Log Visit`
- `Batch Tags`
- `Tag Manager`
- `Edit Notes`
- `Copy Address`
- `Copy GPS Coordinates`

### Placement

- Card primary CTA: `Explore`
- Quick actions menu top group: map/navigation actions first
- Mid group: logging/tagging/editing
- Bottom group: copy/export utilities

## 5) Empty/loading/error states

Every major panel must provide:

- `ui-loading` while data is fetching
- `ui-empty` when no results
- `ui-feedback ui-feedback--error` for recoverable failures
- Optional retry action in empty/error state

Behavior guidelines:

- Empty states should explain why and provide a next step.
- Loading state should avoid layout shifts.
- Error state should avoid blocking unrelated controls.

## 6) Accessibility and keyboard pass

### Baseline

- Visible focus rings on all interactive controls (`.ui-focusable`)
- Logical tab order that follows visual order
- Buttons and icon-only controls include `aria-label`
- Toast/live updates announce through `aria-live="polite"`

### Suggested keyboard standard

- `Esc`: close overlays/menus
- `/`: focus search input (when present)
- `[` and `]`: previous/next in details contexts (where supported)
- Arrow keys: move between tabs/cards where applicable

## 7) Suggested implementation phases

### Phase 1 (done in foundation)

- Shared modernization tokens in `CSS/design-tokens.css`
- Shared shell/component classes in `CSS/components.css`
- City card vertical alignment fixes in `HTML Files/city-viewer-window.html`

### Phase 2

- Adopt shared shell classes in Trail Explorer and Adventure Details
- Normalize action labels in quick-actions menus
- Add missing `aria-label` and keyboard hints

### Phase 3

- Remove duplicated per-page style patterns replaced by shared classes
- Add visual QA snapshots for key pages
- Add regression tests for empty/loading/error state rendering

