# Offline PWA Quick Start

This app now includes a first-pass offline pack and write queue bridge.

## What is included

- Service worker shell caching via `sw.js`
- Web app manifest at `manifest.webmanifest`
- "Offline Pack" action buttons in:
  - Adventure Planner top actions
  - Birds diagnostics/sync section
- IndexedDB offline write queue (`kafOfflineDb` / `writeQueue`)
- Offline/sync badges and checklists in Planner and Birds
- Auto bridge to Birds sync when device comes back online

## How to use in the field

1. Sign in while online.
2. Open Adventure Planner and click `Offline Pack`.
3. Open Nature Challenge > Birds > Diagnostics and click `Offline Pack`.
4. Confirm checklist badges show cached status and pending queue count.
5. Use the app offline; writes are queued.
6. When back online, queued writes will sync automatically, or press `Sync Now` in Birds.

## Notes

- Cache warm-up is best-effort. Missing optional assets do not fail the full pack.
- Birds uses both its local queue and a mirrored IndexedDB queue for cross-feature status visibility.
- This is a phase-1 offline implementation and can be extended with conflict UI and richer install prompts.

