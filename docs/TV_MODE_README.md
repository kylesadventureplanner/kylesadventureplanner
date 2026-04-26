# TV Mode (Samsung TV / 10-foot UI) — v2

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
