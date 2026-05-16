# TV mode (samsung TV / 10-foot UI) - v5.1

## What was added / improved

### v5.1 Refinements (tier 3: polish + bulk tag management)
| # | Feature | Detail |
|---|---------|--------|
| 1 | **Enhanced HUD keyboard display** | Unicode arrows (`⬅️ ⬆️ ➡️ ⬇️`) + larger kbd font + emoji indicators (🎮 D-pad) — clearer at 10 ft |
| 2 | **Audio feedback toggle** | Optional navigation beeps (D-pad move, select, modal close). Toggle via 🔊 checkbox in HUD. Persists to localStorage. Helps low-vision users. |
| 3 | **Clone tags feature** | 🏷️ button on each card → search target locations → replace or append tags. Full modal UI with multi-select results. |
| 4 | **Multi-select + bulk tag apply** | 📋 Multi-Select button → enable checkboxes on all cards → enter comma-separated tags → replace/append to all selected. Bulk action bar at bottom. |

### v5 features (retained)
Card keyboard hint, direction preview HUD, modal active badge

### v4 features (retained)
Key repeat acceleration, broken focus recovery, Home/End shortcuts

### v3 & prior features (retained)
Typing guard, D-pad focusable cards, cone filter, focus beacon, aria-live announcer, PageDown/PageUp, focus trap, tab cycling, HUD auto-show, emoji presets, etc.

## Files
- `index.html`
- `CSS/tv-mode.css` (now ~460 lines)
- `JS Files/tv-mode-controller.js` (now ~930 lines)
- `JS Files/tag-bulk-manager.js` (NEW - 240 lines)
- `tests/tv-mode-smoke.spec.js`

## New key mappings (v5.1)
| Key | Action | Context |
|-----|--------|---------|
| 🏷️ Clone Tags button | Open modal to clone tags from source card to multiple targets | On each adventure card footer |
| 📋 Multi-Select button | Toggle multi-select mode with checkboxes + bulk action bar | Adventures (`visited-locations`, legacy/archived Adventure Planner replacement) |
| 🔊 Audio Feedback checkbox | Toggle navigation beeps (D-pad, select, modal close) | HUD (🎮 D-pad row) |

## Implementation highlights

### Audio feedback
- Uses **Web Audio API** (OscillatorNode) to generate sine wave tones
- **Navigation beep**: 150 Hz, 40 ms, -14 dB
- **Select beep**: 200 Hz, 60 ms, -12 dB  
- **Modal beep**: 120 Hz, 80 ms, -12 dB
- Gracefully falls back if AudioContext blocked
- Preference saved to `localStorage.kap_tv_audio_feedback`

### Clone tags modal
```javascript
// User flow:
1. Click 🏷️ button on a card (source)
2. Search by name/location for target cards
3. Multi-select checkboxes for targets
4. Choose: Replace all tags OR Append to existing
5. Click "Apply to Selected"
```

### Bulk tag apply
```javascript
// User flow:
1. Click 📋 button to enable multi-select
2. Checkboxes appear on all cards
3. Select cards (blue border)
4. Enter comma-separated tags in bottom bar
5. Choose: Replace OR Append
6. Click "Apply"
```

## Storage and persistence
- TV mode state: `localStorage.kap_tv_mode_enabled`
- First-use HUD: `localStorage.kap_tv_mode_first_use_done`
- Audio feedback preference: `localStorage.kap_tv_audio_feedback`
- Tag changes: Dispatched as `tagsChanged` custom events (app can persist)

## Testing
✅ 103/103 reliability tests passing  
✅ TV mode smoke test fully featured  
✅ No regressions from v5.0
