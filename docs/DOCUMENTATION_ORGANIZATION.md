# Documentation organization

**Date:** April 7, 2026  
**Status:** Current reference

## ✅ Current documentation layout

Project documentation is organized under the `docs/` directory so implementation notes, testing guides, and troubleshooting references live together in one place.

---

## Current structure

```
kylesadventureplanner/
├── docs/                              (Documentation folder)
│   ├── DEBUG_GUIDE.md                 ← Comprehensive troubleshooting guide
│   ├── DEBUG_SYSTEM_README.md         ← Implementation details
│   ├── DEBUG_QUICK_REFERENCE.md       ← Quick copy-paste commands
│   ├── HOTFIX_REGISTRY.md             ← Project tracking / hotfix history
│   ├── IPHONE_VIEW_FIX.md             ← iPhone-specific notes
│   └── UI_CONSISTENCY_CHECKLIST.md    ← UI standards and checks
│
├── JS Files/
│   ├── app-quality-system.js          (Consolidated reliability/performance/debug)
│   └── button-reliability-system.js   (Button-specific reliability layer)
│
├── CSS/
├── HTML Files/
├── index.html                         (Entry point)
└── ... other config files
```

---

## Documentation focus

The `docs/` folder is the right home for:

| Type | Examples |
|------|---|
| Troubleshooting guides | `DEBUG_GUIDE.md`, `BUTTON_RELIABILITY_GUIDE.md` |
| Quick references | `DEBUG_QUICK_REFERENCE.md`, `BUTTON_RELIABILITY_QUICK_START.md` |
| Implementation summaries | `DEBUG_SYSTEM_README.md`, `IMPLEMENTATION_STATUS.md` |
| Testing / verification notes | `TAB_REGRESSION_HARNESS.md`, `UI_CONSISTENCY_CHECKLIST.md` |
| Planning / change logs | `HOTFIX_REGISTRY.md`, `DOCUMENTATION_INDEX.md` |

---

## Documentation location

All project documentation now lives under `docs/`.

Useful starting points:
- [`README.md`](./README.md) - docs folder home
- [`INDEX.md`](./INDEX.md) - broad documentation index
- [`DOCUMENTATION_INDEX.md`](./DOCUMENTATION_INDEX.md) - quick navigation for consolidated docs
- [`HOTFIX_REGISTRY.md`](./HOTFIX_REGISTRY.md) - active/archived hotfixes
- [`UI_CONSISTENCY_CHECKLIST.md`](./UI_CONSISTENCY_CHECKLIST.md) - project consistency tracking

---

## Benefits

✅ **Root directory cleaner** - Only essential files at root
✅ **Better organization** - docs grouped in one predictable place
✅ **Standard structure** - `/docs` is a common convention
✅ **No functionality changes** - Only documentation moved
✅ **Easy to find** - implementation notes and guides live together

---

## How to access documentation

### Option 1: browse in file explorer
```
docs/
├── README.md                (folder home)
├── INDEX.md                 (broad docs index)
├── DEBUG_GUIDE.md           (full guide)
├── DEBUG_QUICK_REFERENCE.md (copy-paste commands)
└── DEBUG_SYSTEM_README.md   (implementation details)
```

### Option 2: direct file links (in your IDE)
- Quick reference: [`DEBUG_QUICK_REFERENCE.md`](./DEBUG_QUICK_REFERENCE.md)
- Full guide: [`DEBUG_GUIDE.md`](./DEBUG_GUIDE.md)
- Implementation: [`DEBUG_SYSTEM_README.md`](./DEBUG_SYSTEM_README.md)

### Option 3: console commands (unchanged)
```javascript
// These still work the same way:
window.__debugSystem.getHistory()
window.__debugSystem.replay(30)
window.__debugSystem.export()
```

---

## What Didn't change

✅ **Quality System Code** - `JS Files/app-quality-system.js` (consolidated and auto-loaded)
✅ **Button Reliability Code** - `JS Files/button-reliability-system.js` (auto-loaded)
✅ **Functionality** - All debug features work exactly the same
✅ **API** - `window.__debugSystem` API unchanged
✅ **Console output** - Debug messages identical

---

## Safe to move? ✅

**Yes, completely safe!** Here's why:
- These are **documentation files only** (human-readable guides)
- No code imports or references them
- Debug system is in `JS Files/` and loads automatically
- Moving `.md` files doesn't affect functionality
- IDE can still find and open them
- Git can track them in the new location

---

## Verification checklist

- ✅ `/docs` directory created
- ✅ documentation is centralized in `docs/`
- ✅ docs landing pages exist (`README.md`, `INDEX.md`, `DOCUMENTATION_INDEX.md`)
- ✅ debug references point to files in `docs/`
- ✅ `app-quality-system.js` still in `JS Files/`
- ✅ `button-reliability-system.js` still in `JS Files/`
- ✅ `index.html` unchanged (still loads debug system)
- ✅ no code/runtime dependency on markdown file placement
- ✅ no functionality changes
- ✅ No functionality lost

---

## Quick start (unchanged)

Debug system still works exactly the same:

```javascript
// In browser console:
window.__debugSystem.getHistory()    // See last 20 events
window.__debugSystem.replay(30)      // Replay last 30 events
window.__debugSystem.export()        // Export as JSON
```

---

## Root directory guidance

Keep the project root focused on runtime and project-level files such as:
- `index.html`
- `CSS/`
- `JS Files/`
- `HTML Files/`
- config/scripts used directly by the app

Put human-readable notes and reference material in `docs/` whenever they are not required at the project root.

---

## Future documentation

If you add more documentation, prefer placing it in `docs/`:
- Feature guides
- Setup instructions
- Troubleshooting guides
- Architecture docs
- API documentation

---

## Summary

✅ **Documentation organized under `docs/`**
✅ **Root directory reserved for app/runtime files**
✅ **All functionality unchanged**
✅ **Navigation is easier to maintain**
✅ **Follows standard conventions**

---

**Page Role:** Reference for docs folder structure and placement guidelines


