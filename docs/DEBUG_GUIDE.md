# Comprehensive debug system guide

## Overview

The Comprehensive Debug System is a powerful real-time debugging tool that tracks:
- **Button State Changes**: When and why buttons become disabled/enabled
- **Event Propagation**: Tracks click events, particularly subtab clicks
- **DOM Mutations**: All attribute and class changes on bulk elements
- **Filter Changes**: When filters are applied or changed
- **Selection State**: Tracks checkbox selections and bulk state
- **Focus Events**: Focus and blur tracking for interactive elements
- **Stack Traces**: Full stack traces for all state changes (helps identify WHO is changing state)

## Accessing the debug system

The debug system is automatically loaded on page startup. Access it in the browser console:

```javascript
// See last 20 log entries
window.__debugSystem.getHistory()

// See all logs
window.__debugSystem.getAllHistory()

// Export all logs as JSON
window.__debugSystem.export()

// Replay last N logs
window.__debugSystem.replay(20)

// Clear history
window.__debugSystem.clearHistory()
```

## Real-Time monitoring

Open the browser console and watch for debug messages as you interact with the app:

```
[🔍 DEBUG] [14:32:15.123] 🚀 COMPREHENSIVE DEBUG SYSTEM STARTING
[🔍 DEBUG] [14:32:15.234] ✅ Global button click logger initialized
[🔍 DEBUG] [14:32:15.345] 📊 BULK STATE: scope=visible, selectBtn.disabled=false, applyTagsBtn.disabled=true, count=0
```

## Debug sections

### Section 1: global button click logger
Tracks every button click, especially useful for:
- Adventure bulk action buttons
- Period/progress buttons
- Filter buttons

Example output:
```
[🔍 DEBUG] 🖱️ BUTTON: Clicked bulk action button | id=adventureBulkSelectVisibleBtn | class=automation-btn | disabled=false
```

### Section 2: adventure bulk state monitor
Polls the bulk action card state every 2 seconds and logs:
- Selection scope (visible/all/filtered)
- Button disabled states
- Selection count

Example output:
```
[🔍 DEBUG] 📊 BULK STATE: scope=visible, selectBtn.disabled=false, applyTagsBtn.disabled=false, count=3
```

### Section 3: DOM mutation observer
Watches for DOM changes on bulk elements and logs:
- Attribute changes (especially `disabled`)
- Text content changes
- Class changes

Example output:
```
[🔍 DEBUG] 🔴 BUTTON DISABLED CHANGED: adventureBulkApplyTagsBtn | new value: true
[🔍 DEBUG]   └─ Stack: at HTMLButtonElement.set disabled [as disabled]
```

### Section 4: focus tracker
Tracks focus/blur events on interactive elements.

### Section 5: event listener debugger & disabled property interceptor
**Most Important for Debugging Button Issues**

This section:
- Intercepts ALL property assignments to the `disabled` attribute
- Logs the stack trace showing EXACTLY which code is disabling the button
- Tracks event listener registration and execution

Example output:
```
[🔍 DEBUG] 🚨 DISABLED PROPERTY SET: adventureBulkApplyTagsBtn | false → true
[🔍 DEBUG]   └─ Stack: at someFunction (consolidated-bulk-operations-system-v7-0-141.js:456)
                     at applyFilters (consolidated-comprehensive-fix-system-v7-0-141.js:789)
```

**This stack trace tells you EXACTLY what code is disabling the button!**

### Section 6: tab click detector
Tracks all tab and subtab clicks with:
- Element ID and class
- ARIA attributes
- Whether default behavior was prevented
- Stack trace of who called it

### Section 7: filter change tracker
Monitors filter control changes (input/select elements in control panel).

### Section 8: selection state logger
Logs every 3 seconds:
- How many checkboxes are checked
- Status of `window.adventureState`

## Troubleshooting workflow

### Problem: "buttons disable immediately after click"

**Steps:**
1. Open browser console
2. Click the button
3. Look for `🚨 DISABLED PROPERTY SET` messages
4. Check the stack trace - it shows EXACTLY which function disabled it
5. Find that function in the JS files and review the logic

Example workflow:
```javascript
// In console - watch what happens
window.__debugSystem.replay(30)  // See last 30 logs

// Click the button that's misbehaving
// Look for stack traces in the output

// The stack might show:
// "adventureBulkApplyTagsBtn disabled: false → true"
// "at disableButton (consolidated-bulk-operations-system-v7-0-141.js:123)"

// Now you know:
// 1. The button is being disabled
// 2. It's happening in consolidated-bulk-operations-system-v7-0-141.js at line 123
// 3. In a function called disableButton
```

### Problem: "subtab clicks don't work"

**Steps:**
1. Open browser console  
2. Click on a subtab
3. Look for `📑 TAB/SUBTAB CLICK` messages
4. Check if `DEFAULT PREVENTED` appears
5. Look for the stack trace showing who called preventDefault()

Example:
```javascript
// If you see:
[🔍 DEBUG] 📑 TAB/SUBTAB CLICK: id=adventureTab | class=tab-btn
[🔍 DEBUG]   └─ ⚠️ DEFAULT PREVENTED by handler!
[🔍 DEBUG]   └─ Stack: at handleTabClick (tab-content-loader.js:45)

// This means the tab handler is preventing the click from working
// You need to review that handler function
```

### Problem: "checkboxes aren't tracking selections"

**Steps:**
1. Watch the Selection State Logger output
2. Click a checkbox
3. Compare the "Checked boxes" count before and after
4. Check `window.adventureState.selectedSourceIndexes.size`

## Key log symbols

| Symbol | Meaning |
|--------|---------|
| 🔍 | Debug prefix |
| 🚀 | System starting |
| ✅ | System initialized |
| 🖱️ | Button clicked |
| 📊 | Bulk state update |
| 🔄 | DOM mutation |
| 🔴 | Critical change (disabled state) |
| 🚨 | Important warning |
| 📑 | Tab/subtab interaction |
| ⚙️ | Filter change |
| 👁️ | Focus/blur |
| 📍 | Event listener registered |
| 🎯 | Event fired |
| ⚠️ | Warning condition |
| ❌ | Error condition |

## Exporting logs for analysis

To export all debug logs for sharing/analysis:

```javascript
// Get the JSON
const logs = window.__debugSystem.export()

// Copy to clipboard (in DevTools console)
copy(logs)

// Or save to file
const blob = new Blob([logs], { type: 'application/json' })
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'debug-logs.json'
a.click()
```

## Performance considerations

- The debug system uses ~500KB of memory for logs
- Polling (bulk state monitor, selection state logger) runs every 2-3 seconds
- Mutation observer might be resource-intensive if there are frequent DOM changes
- Turn off sections you don't need by setting their flags to `false` at the top of the file

## Advanced: custom debugging

Add custom tracking to the debug history:

```javascript
// Log custom message
console.log('[🔍 DEBUG]', 'Your custom message')

// It will be captured by the history system
window.__debugSystem.getHistory()
```

## Debugging stack traces

The stack traces in the debug output show call chains. Read them from top to bottom:

```
Stack: at setDisabled (consolidated-bulk-operations-system-v7-0-141.js:123)
       at applyBulkOperation (consolidated-bulk-operations-system-v7-0-141.js:456)
       at handleApplyButtonClick (button-handlers.js:789)
```

This means:
1. `handleApplyButtonClick` in button-handlers.js called
2. `applyBulkOperation` in consolidated-bulk-operations-system-v7-0-141.js
3. Which called `setDisabled` which actually changed the disabled property

Find the root cause by investigating the initial call.
