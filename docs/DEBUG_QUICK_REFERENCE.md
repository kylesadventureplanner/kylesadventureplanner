# Debug System Quick Reference Card

## Quick Start (Copy-Paste into Console)

```javascript
// 1. See what just happened (last 20 events)
window.__debugSystem.getHistory()

// 2. Replay in grouped format (last 30 events)
window.__debugSystem.replay(30)

// 3. See everything (all 500 stored events)
window.__debugSystem.getAllHistory()

// 4. Export for analysis
const logs = window.__debugSystem.export()
copy(logs)  // Copies to clipboard
```

## Debugging Button Issues

**Steps:**
1. Open console (F12)
2. Click the broken button
3. Search console for: `🚨 DISABLED PROPERTY SET`
4. Read the stack trace = **exact problem location**

**Expected output:**
```
[🔍 DEBUG] 🚨 DISABLED PROPERTY SET: buttonName | false → true
[🔍 DEBUG]   └─ Stack: at functionName (filename.js:123)
```

## Debugging Tab/Subtab Issues

**Steps:**
1. Open console (F12)
2. Click the non-working tab
3. Look for: `📑 TAB/SUBTAB CLICK`
4. Check for: `⚠️ DEFAULT PREVENTED`
5. Stack trace shows the blocker

**Expected output:**
```
[🔍 DEBUG] 📑 TAB/SUBTAB CLICK: id=tabName
[🔍 DEBUG]   └─ ⚠️ DEFAULT PREVENTED by handler!
[🔍 DEBUG]   └─ Stack: at handler (file.js:45)
```

## One-Liners for Common Tasks

```javascript
// Count how many times buttons got disabled
window.__debugSystem.getAllHistory().filter(e => e.message.includes('DISABLED PROPERTY SET')).length

// Get all tab click attempts
window.__debugSystem.getAllHistory().filter(e => e.message.includes('TAB/SUBTAB CLICK'))

// Find all errors
window.__debugSystem.getAllHistory().filter(e => e.level === 'error')

// Clear memory
window.__debugSystem.clearHistory()

// See the last 5 state changes
window.__debugSystem.replay(5)
```

## Key Debug Symbols

| 🔍 | Main prefix |
| 🚀 | Starting |
| ✅ | OK/Initialized |
| 🖱️ | Click event |
| 📊 | State change |
| 🔴 | Critical (disabled) |
| 🚨 | **IMPORTANT** |
| 📑 | Tab click |
| ⚙️ | Filter change |
| ⚠️ | Warning |
| ❌ | Error |

## Console Tips

- **Search** - Ctrl+F in console, search for symbols
- **Filter** - Look for specific patterns like `🚨` to find issues
- **Copy JSON** - `copy(window.__debugSystem.export())`
- **Save logs** - Export to file for later analysis
- **Real-time** - Keep console open while testing

## Performance Notes

- Memory: ~500KB (last 500 logs)
- CPU: Negligible (~2-3ms every 2-3 seconds)
- No impact on app functionality

## Where to Find Stack Traces

Every critical log includes:
```
[🔍 DEBUG] <ACTION> <DETAILS>
[🔍 DEBUG]   └─ Stack: at functionName (file.js:LINE_NUMBER)
                     at callerName (another-file.js:456)
```

**Read from bottom to top to understand call chain.**

## Common Issues to Search For

```javascript
// Button disabling
'🚨 DISABLED PROPERTY SET'

// Tab not responding
'📑 TAB/SUBTAB CLICK' + '⚠️ DEFAULT PREVENTED'

// Filter problems
'⚙️ FILTER CHANGE'

// Selection issues
'✓ Checked boxes'

// Bulk state
'📊 BULK STATE'
```

## Export and Share Logs

```javascript
// Get all logs
const logs = window.__debugSystem.export()

// Save to file (browser DevTools)
// Right-click → Save As → logs.json

// Or copy to clipboard
copy(logs)

// Then paste into text editor and save
```

## Disable Debug System (If Needed)

Edit `JS Files/comprehensive-debug-system.js`:
```javascript
const DEBUG = false;  // Set to false to disable
```

**But keep it ON during development!**

## Need More Details?

See these files for full documentation:
- **DEBUG_GUIDE.md** - Complete troubleshooting guide
- **DEBUG_SYSTEM_README.md** - Full implementation details
- **JS Files/comprehensive-debug-system.js** - The actual code

---

**Version**: 2.0.0 | **Status**: Active | **Memory**: ~500KB | **CPU**: Minimal

