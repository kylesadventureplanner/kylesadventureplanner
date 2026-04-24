# Reliability Harness README

Use this runbook for reliability enforcement checks and diagnostics bundle export.

## Commands

```bash
npm run reliability:ownership
npm run reliability:prepush
npm run reliability:smoke
npm run reliability:gate
```

## Git Pre-Push Hook

Install or refresh local hooks:

```bash
npm run hooks:install
npm run hooks:status
```

The repo pre-push hook runs:

```bash
npm run reliability:prepush
```

## Smoke Output Artifact

- `artifacts/reliability-smoke-summary.json`

## Release Gate Requirements

- No `blocked` rows in `docs/BUTTON_MIGRATION_TRACKER.md`
- Evidence links present for active/review/done rows
- Smoke summary exists and has `pass: true`
- Startup p95 <= 3500 ms
- First-click success rate >= 0.99

## Runtime Diagnostics

One-command diagnostics bundle download:

```javascript
window.exportReliabilityDiagnosticsBundle()
```

Snapshot API for support triage:

```javascript
window.__reliabilityStatus()
```

