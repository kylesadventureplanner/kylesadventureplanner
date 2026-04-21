# Known-Good Workflow

Use this workflow to mark a reliable baseline (for example, after fixing the Nature CTA issue) and quickly compare your current state against that baseline later.

## Why this helps

- You keep a timestamped snapshot of the exact git commit and local worktree state.
- You can attach a short note describing what was working.
- You can generate a comparison report showing how far current code drifted from that baseline.

## 1) Mark a known-good baseline

After running whatever tests you trust (for example `nature-subtabs-smoke`), create a marker:

```zsh
npm run known-good:mark -- --name "nature-buttons-fixed" --note "Manual + smoke CTA behavior is stable"
```

Optional: create a git tag at the same time (only created when worktree is clean):

```zsh
npm run known-good:mark -- --name "nature-buttons-fixed" --note "Stable after CTA fixes" --tag "kg/nature-buttons-fixed-2026-04-20"
```

Marker output files:

- `artifacts/known-good/<timestamp>-<name>.json`
- `artifacts/known-good/latest.json`

## 2) Compare current state to known-good baseline

Use the latest marker:

```zsh
npm run known-good:compare
```

Or compare to a specific marker file:

```zsh
npm run known-good:compare -- --marker "artifacts/known-good/2026-04-20T12-00-00-000Z-nature-buttons-fixed.json"
```

Optional custom output path:

```zsh
npm run known-good:compare -- --out "artifacts/known-good/compare-manual-check.json"
```

Comparison report includes:

- baseline marker metadata
- current commit/branch and dirty state
- ahead/behind commit counts relative to baseline
- list of files changed since the baseline commit

## 3) Suggested team habit

1. Run your targeted smoke test(s).
2. Create a known-good marker with a clear name and note.
3. If clean, also create a `kg/...` git tag.
4. On future regressions, run compare first to see drift before deep debugging.

## 4) One-shot: run smoke first, then mark known-good

If you want to guarantee the marker is only created when a smoke test passes, use:

```zsh
npm run known-good:verify-and-mark -- --test-cmd "npx playwright test tests/nature-subtabs-smoke.spec.js --workers=1" --name "nature-buttons-fixed" --note "CTA stable after fix"
```

Or use an npm script as the smoke target:

```zsh
npm run known-good:verify-and-mark -- --test-script reliability:smoke --name "release-candidate"
```

Behavior:

- smoke fails -> marker is not created
- smoke passes -> marker is created via `known-good:mark`

## 5) GUI workflow (no terminal required)

Inside Nature -> Diagnostics, Sync and Clean Up -> Manual Diagnostics Console:

1. Click `Mark Known-Good Snapshot` to save the current reliability state in this browser.
2. Later, click `Compare to Known-Good` to compare current diagnostics against your latest saved snapshot.
3. Use `Clear Known-Good Snapshots` if you want to reset browser-stored baselines.

Notes:

- GUI snapshots are stored in browser local storage and are best for fast local troubleshooting.
- CLI markers remain the source of truth for git-anchored baselines you can share across machines.

## Script help

```zsh
npm run known-good:mark -- --help
npm run known-good:compare -- --help
npm run known-good:verify-and-mark -- --help
```

