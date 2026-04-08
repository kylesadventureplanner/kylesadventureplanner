## Reliability Gate Checklist (Required for button/reliability changes)

- [ ] Updated `docs/BUTTON_MIGRATION_TRACKER.md` row(s) for touched tab(s)
- [ ] Added at least one evidence reference per changed tracker row
- [ ] Confirmed no duplicate control ownership (inline + delegated overlap)
- [ ] Confirmed hidden/inactive overlays are non-blocking (`pointer-events: none`)
- [ ] Confirmed shared guard usage for side-effect actions (`window.ButtonActionGuard`)

## Validation

- [ ] `npm run reliability:ownership` passes
- [ ] `npm run reliability:smoke` passes
- [ ] `npm run reliability:gate` passes

## Notes / Blockers

-
