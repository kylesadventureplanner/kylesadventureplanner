# TV Mode (Samsung TV / 10-foot UI)

## What was added
- **Header action-bar button**: `#tvModeHeaderBtn` — always visible in the top toolbar alongside Reload/Edit Mode/Backup; syncs label (`📺 TV Mode` / `📺 TV Mode: ON`) and `aria-pressed` with the floating toggle
- Global floating toggle button: `#tvModeGlobalToggle` (fixed top-right, visible at all times)
- Keyboard shortcut: `Ctrl+Alt+T` to enable/disable TV mode
- Remote-friendly directional focus navigation (Arrow keys + Enter)
- Back behavior on `Esc` / `Backspace` to close active overlays
- Quick filter rail in Adventure Planner: `#tvQuickFilterRail`
- Shortcut HUD (`H`) with on-screen key help
- Large-screen styling in `CSS/tv-mode.css`

## Files
- `index.html`
- `CSS/tv-mode.css`
- `JS Files/tv-mode-controller.js`
- `JS Files/consolidated-city-viewer-system-v7-0-141.js`
- `tests/tv-mode-smoke.spec.js`

## Key mappings
- `ArrowUp/Down/Left/Right`: Move focus spatially
- `Enter` / `Space`: Activate focused control
- `Esc` / `Backspace`: Close modal/backdrop
- `H`: Toggle TV shortcut HUD
- `1..5`: Apply quick presets (`Outdoor`, `Food`, `Family`, `Budget`, `Favorites`)

## Notes
- TV mode state persists via `localStorage` key: `kap_tv_mode_enabled`
- City visualizer controls/cards are marked with `data-tv-focusable="true"`
- Quick filter rail is only visible when TV mode is active

