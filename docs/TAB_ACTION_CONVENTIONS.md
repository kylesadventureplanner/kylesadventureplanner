# Tab action conventions

**Date:** May 2, 2026  
**Status:** Current implementation guideline

This document defines how interactive tab HTML should expose actions and where the matching delegated handlers should live.

---

## Goal

Use declarative `data-*` action attributes in tab markup and handle them through **one tab-scoped delegated listener** in the matching system file.

This keeps behavior predictable and avoids:

- inline `onclick` drift
- duplicated listeners for the same control family
- hard-to-test DOM wiring
- cross-tab action collisions

---

## Core rule

### Prefer this

```html
<button type="button" data-adventure-action="open-city-viewer">🌆 City Explorer</button>
```

```javascript
root.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-adventure-action]');
  if (!btn) return;
  const action = String(btn.getAttribute('data-adventure-action') || '').trim();
  if (action === 'open-city-viewer' && typeof window.openCityViewerWindow === 'function') {
    window.openCityViewerWindow();
  }
});
```

### Avoid this

```html
<button onclick="window.openCityViewerWindow?.()">🌆 City Explorer</button>
```

---

## Naming convention

## 1) Namespace by tab or feature family

Use a tab-scoped attribute name instead of a generic shared attribute.

Recommended patterns:

- `data-adventure-action`
- `data-bike-action`
- `data-birds-action`
- `data-visited-action`
- `data-visited-subtab-action` for Adventures subtab/tool actions

### Why

This prevents selector overlap between tabs and makes ownership obvious.

---

## 2) Use kebab-case action values

Examples:

- `find-near-me`
- `open-city-viewer`
- `refresh-data`
- `download-session-json`
- `open-central-hub`
- `change-page`
- `close-photo-url-modal`

Avoid camelCase or function-like strings in markup.

---

## 3) Put parameters in sibling `data-*` attributes

Use one action plus one or more parameter attributes.

### Example

```html
<button data-bike-action="change-page" data-page-delta="-1">← Previous</button>
<button data-bike-action="change-page" data-page-delta="1">Next →</button>
```

```javascript
if (action === 'change-page') {
  const delta = Number(btn.getAttribute('data-page-delta') || '0');
  if (Number.isFinite(delta) && delta !== 0 && typeof window.changeBikePage === 'function') {
    window.changeBikePage(delta);
  }
}
```

Do **not** encode parameters into the action name when a simple sibling attribute is clearer.

---

## Delegation placement

## 4) Keep the delegate in the matching tab system file

The delegated handler should live near the rest of the tab control wiring.

Current examples:

- `HTML Files/tabs/adventure-planner-tab-archive.html` (retired reference only) → historical `window.initAdventurePlanner` markup retained for archive/debug context
- `HTML Files/tabs/bike-trails-tab.html` → `bindBikeControls()` in `JS Files/bike-trails-tab-system.js`
- `HTML Files/tabs/nature-challenge-tab.html` → `bindNatureControls()` in `JS Files/nature-challenge-tab-system.js`
- `HTML Files/tabs/visited-locations-tab.html` → delegated action handling in `JS Files/visited-locations-tab-system.js`

> Note: `adventure-planner` is retired in runtime UI. Keep compatibility aliases for legacy deep links, but route active work to `visited-locations`.

### Preferred ownership model

- **Markup** declares intent with `data-*`
- **Tab init/bind function** owns event delegation
- **Feature helpers** do the actual work

---

## 5) Scope listeners to the tab root when possible

Preferred:

```javascript
const root = document.querySelector('[data-tab="bike-trails"]') || document.body || document.documentElement;
```

Then validate containment before acting.

```javascript
if (!btn || !root || !root.contains(btn)) return;
```

This reduces accidental handling from other tabs or modal content.

---

## 6) Keep fallback behavior explicit and safe

When an action calls an optional global, preserve no-op-safe behavior.

```javascript
if (typeof window.refreshBikeTrailData === 'function') {
  window.refreshBikeTrailData();
}
```

Do not assume every optional runtime helper exists in every loading state.

---

## When to use action families vs existing feature actions

## 7) Use the existing specialized action family if one already exists

Examples:

- `data-visited-subtab-action` already powers Adventures CTA routing
- `data-birds-*` already powers dense Nature flows

If a feature already has a mature action bus, extend it instead of introducing a second parallel system.

### Good examples

- Add `data-visited-action="open-central-hub"` to a small visited-only utility button
- Keep Adventures tool routing on `data-visited-subtab-action`
- Add `data-birds-action="open-central-hub"` to a Birds diagnostics utility button

---

## Current examples in this workspace

## Legacy/archived Adventure Planner

File: `HTML Files/tabs/adventure-planner-tab-archive.html` (archived snapshot, not runtime-loaded)

- `data-adventure-action="find-near-me"`
- `data-adventure-action="open-city-viewer"`
- `data-adventure-action="refresh-adventure-data"`
- `data-adventure-action="download-session-json"`
- `data-adventure-action="change-page"` + `data-page-delta`

## Bike trails

File: `HTML Files/tabs/bike-trails-tab.html`

- `data-bike-action="refresh-data"`
- `data-bike-action="open-trail-explorer"`
- `data-bike-action="find-near-me"`
- `data-bike-action="change-page"` + `data-page-delta`

## Nature challenge

File: `HTML Files/tabs/nature-challenge-tab.html`

- `data-birds-action="open-central-hub"`
- existing dense interaction families remain on `data-birds-*`

## Adventure challenge / visited locations

File: `HTML Files/tabs/visited-locations-tab.html`

- `data-visited-action="open-central-hub"`
- `data-visited-action="close-photo-url-modal"`
- primary tool routing remains on `data-visited-subtab-action`

---

## Anti-patterns

Avoid these unless there is a very specific reason:

- inline `onclick`
- multiple unrelated click listeners attached to the same row/container
- generic `data-action` shared across all tabs with no namespace
- encoding numeric parameters into long action strings when a sibling attr works better
- handling tab-specific actions from `document` without root containment checks

### Guardrail

Run the inline-handler check before shipping tab markup changes:

```bash
npm run lint:tab-inline-onclick
```

---

## Suggested implementation checklist

When adding a new tab button:

- [ ] Add a tab-scoped `data-*-action` attribute
- [ ] Keep the action name kebab-case
- [ ] Move parameters to sibling `data-*` attrs
- [ ] Route the action in the tab’s existing delegated handler
- [ ] Guard optional globals with `typeof window.someFn === 'function'`
- [ ] Add or update a focused Playwright test when behavior is important
- [ ] Run the relevant smoke/regression test before shipping

---

## Testing note

For this workspace, prefer focused regression coverage near the feature you changed.

Examples:

```bash
npx playwright test tests/adventure-cta-action-order.spec.js
npx playwright test tests/nature-subtabs-smoke.spec.js
npx playwright test tests/bike-bulk-copy-tags-modes.spec.js
```

Also keep `scripts/check-control-ownership.js` in mind when adding new ownership patterns.

For tab HTML specifically, use:

```bash
npm run lint:tab-inline-onclick
```

---

## Page role

Contributor guideline for declarative tab actions and delegated handler placement.

