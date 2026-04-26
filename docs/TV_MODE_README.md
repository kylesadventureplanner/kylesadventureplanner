# TV Mode (Samsung TV / 10-foot UI) — v3

## What was added / improved

### v3 refinements
| # | Feature | Detail |
|---|---------|--------|
| 1 | **Typing-context guard** | `H`, `T`, `[`, `]`, `1-5`, and `Backspace` shortcuts do **not** fire when `document.activeElement` is an `input`, `textarea`, `select`, or `contenteditable` — fixes a real bug where typing in the search box triggered filter presets |
| 2 | **Adventure cards are D-pad focusable** | `installAdventureCardTvHooks()` watches for `.adventure-card` divs via `MutationObserver` and adds `tabindex="0"`, `data-tv-focusable`, `role="button"`, and an `aria-label` built from the card title + location — the D-pad can now land directly on cards |
| 3 | **Spatial nav cone filter** | Cross-axis penalty raised to `2×` and a hard cone gate added (`secondary > primary * 2.0 → ∞`) — stops `ArrowRight` jumping to a card far below that is only slightly to the right of a wide grid |
| 4 | **Focus beacon** | `#tvFocusBeacon` — a 2.5 s label pops bottom-right every time D-pad focus moves, showing the element's name in 18 px text readable at 10 ft without squinting at the ring |
| 5 | **`aria-live` focus announcer** | `#tvFocusAnnouncer` visually-hidden region announces the focused element's accessible name through Samsung TV TTS / accessibility APIs; double-`rAF` trick ensures the live region fires on every navigation |
| 6 | **`PageDown` / `PageUp` scrolling** | Scrolls `72 %` of viewport height — essential for browsing long adventure card grids without a mouse |

### v2 features (retained)
| # | Feature |
|---|---------|
| 1 | Focus trap in open modals |
| 2 | Focus return to opener (MutationObserver) |
| 3 | Auto-scroll focused element into view |
| 4 | `[` / `]` + `T` tab cycling |
| 5 | Pulsing amber focus ring |
| 6 | HUD auto-shows 4 s on first enable |
| 7 | HUD `✕` close button |
| 8 | Emoji labels on quick-filter buttons |
| 9 | Toast per preset |
| 10 | `scroll-margin-top/bottom` so sticky headers don't obscure focused elements |

### v1 features (retained)
- Header action-bar button `#tvModeHeaderBtn`
- Floating toggle `#tvModeGlobalToggle`
- `Ctrl+Alt+T` global shortcut
- Quick filter rail `#tvQuickFilterRail`

## Files
- `index.html`
- `CSS/tv-mode.css`
- `JS Files/tv-mode-controller.js`
- `tests/tv-mode-smoke.spec.js`

## Key mappings
| Key | Action | Guard |
|-----|--------|-------|
| `↑↓←→` | Move focus (cone-filtered spatial nav) | blocked when typing |
| `PageDown` / `PageUp` | Scroll 72 % of viewport | blocked when typing |
| `Enter` / `Space` | Activate focused element | blocked when typing |
| `Esc` | Close modal / back (focus returns to opener) | always |
| `Backspace` | Close modal / back | blocked when typing |
| `H` | Toggle shortcut HUD | blocked when typing |
| `[` | Previous tab | blocked when typing |
| `]` | Next tab | blocked when typing |
| `T` | Cycle tabs forward | blocked when typing |
| `1`–`5` | Quick presets | blocked when typing |
| `Ctrl+Alt+T` | Toggle TV mode on/off | always |

## Notes
- TV mode state persists via `localStorage` key: `kap_tv_mode_enabled`
- First-use HUD auto-show tracked via `kap_tv_mode_first_use_done`
- Focus beacon (`#tvFocusBeacon`) is `aria-hidden="true"` — sight aid only
- Focus announcer (`#tvFocusAnnouncer`) uses `aria-live="polite"` with double `requestAnimationFrame` to guarantee the live region fires on every D-pad move
- Cone filter: candidates where `crossAxis > primaryAxis × 2` are excluded (`∞` score)
- Adventure card hooks run via a persistent `MutationObserver` so newly rendered cards are marked immediately


## What was added / improved

### v2 improvements
| # | Feature | Detail |
|---|---------|--------|
| 1 | **Focus trap in modals** | D-pad arrow navigation is scoped to the innermost open modal dialog; elements behind the modal are invisible to the navigator |
| 2 | **Focus return to opener** | `MutationObserver` watches backdrop `.visible` class changes; when a modal closes, focus snaps back to the card or button that opened it |
| 3 | **Auto-scroll focused element into view** | After every D-pad move, `scrollIntoView({ behavior:'smooth', block:'nearest' })` is called so off-screen elements always become visible |
| 4 | **`[` / `]` tab cycling** | Cycle backwards / forwards through main app tabs; `T` also cycles forward (Samsung TV convenience key) |
| 5 | **Pulsing focus ring** | `@keyframes tv-focus-pulse` makes the amber ring gently breathe so it's clearly visible at 10 ft |
| 6 | **HUD auto-shows 4 s on first enable** | First time TV mode is activated, the shortcuts panel opens automatically, then closes |
| 7 | **HUD has a close `✕` button** | `#tvModeShortcutHudClose` lets remote users dismiss the panel without a keyboard shortcut |
| 8 | **Emoji labels on quick-filter buttons** | `🌲 Outdoor`, `🍔 Food`, `👨‍👩‍👧 Family`, `💰 Budget`, `⭐ Favorites` for faster at-a-glance recognition |
| 9 | **Toast per preset** | Each preset fires a `showToast()` confirmation so users see which filter fired |
| 10 | **`scroll-margin-top / bottom`** | Focused elements clear sticky headers/footers in CSS so they're never hidden positionally |

### v1 features (retained)
- **Header action-bar button**: `#tvModeHeaderBtn` alongside Reload / Edit Mode / Backup
- Global floating toggle: `#tvModeGlobalToggle` (fixed top-right)
- `Ctrl+Alt+T` global enable/disable shortcut
- Spatial D-pad navigation across entire page
- Quick filter rail: `#tvQuickFilterRail` (Adventure Planner)
- Large-screen sizing in `CSS/tv-mode.css`

## Files
- `index.html`
- `CSS/tv-mode.css`
- `JS Files/tv-mode-controller.js`
- `JS Files/consolidated-city-viewer-system-v7-0-141.js`
- `tests/tv-mode-smoke.spec.js`

## Key mappings
| Key | Action |
|-----|--------|
| `↑↓←→` | Move focus spatially (focus-trapped inside open modals) |
| `Enter` / `Space` | Activate focused element |
| `Esc` / `Backspace` | Close modal / back (focus returns to opener) |
| `H` | Toggle shortcut HUD |
| `[` | Previous tab |
| `]` | Next tab |
| `T` | Cycle tabs forward |
| `1`–`5` | Quick presets (Outdoor / Food / Family / Budget / Favorites) |
| `Ctrl+Alt+T` | Toggle TV mode on/off |

## Notes
- TV mode state persists via `localStorage` key: `kap_tv_mode_enabled`
- First-use HUD auto-show tracked via `kap_tv_mode_first_use_done`
- City visualizer controls/cards are marked `data-tv-focusable="true"` via MutationObserver
- Quick filter rail is only visible when TV mode is active
- Focus trap uses `getModalScope()` which checks `#rowDetailModalBackdrop.visible`, `#enhancedCityVisualizerBackdrop.visible`, and `.modal-backdrop.visible`
