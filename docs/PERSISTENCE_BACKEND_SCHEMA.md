# Persistence Backend Schema (Excel)

This document defines the Excel-backed event table used for cross-device persistence of:

- visit logs (`visitedLocationRecordsV1`)
- route selections / route plans (`routeSelectionIds`, `lastRoutePlan`)
- detail metadata (field freshness, rating history, cost inference)

## Table

- Workbook: `window.visitedSyncConfig.persistenceWorkbookPath` (fallback: `window.filePath`)
- Table name: `window.visitedSyncConfig.persistenceTableName` (default: `VisitedFeaturePersistence`)
- Worksheet name: `window.visitedSyncConfig.persistenceWorksheetName` (default: `VisitedPersistence`)

## Automatic bootstrap

The visited locations system now attempts to bootstrap this storage automatically when an access token is available:

- creates the worksheet if missing
- seeds the header row
- creates the table if missing
- adds any missing recommended columns

This means first-run setup can be hands-off as long as the workbook path is valid and writable in OneDrive.

## Legacy metadata migration

On upgraded clients, the visited locations system performs a one-time import of legacy local-only detail metadata into the backend event table when sign-in and workbook bootstrap are available.

Imported local keys:

- `__adventure_detail_field_refresh_meta_v1`
- `__adventure_detail_rating_history_v1`
- `__adventure_detail_cost_inference_meta_v1`

Migration state is tracked locally with:

- `visitedLegacyDetailMetadataMigrationV1`

## Required columns

These are required by code to persist events:

- `Event Type` (`event_type`)
- `Created At` (`created_at`)
- `Payload Json` (`payload_json`)

## Recommended columns

These are optional but strongly recommended for observability and filtering:

- `Event Id` (`event_id`)
- `Action` (`action`)
- `Subtab Key` (`subtab_key`)
- `Location Id` (`location_id`)
- `Location Title` (`location_title`)
- `Place Key` (`place_key`)
- `Source Workbook Path` (`source_workbook_path`)
- `Source Table` (`source_table`)
- `Source Row Index` (`source_row_index`)
- `Source Context` (`source_context`)

## Event types

- `visit-log`
  - `action`: `add` or `remove`
  - `payload_json`: includes `recordId` and `record` object
- `route-state`
  - `action`: route update reason (for example `route-selection-updated`, `route-plan-created`)
  - `payload_json`: includes `snapshot` with `subtabKey`, `routeSelectionIds`, `lastRoutePlan`, `updatedAt`
- `detail-meta`
  - `action`: metadata kind (for example `field-refresh`, `rating-history`, `cost-inference`)
  - `payload_json`: includes metadata value and context

## Notes

- Writes use Graph `POST /workbook/tables/{table}/rows/add`.
- Bootstrap uses Graph workbook worksheet/table endpoints before hydration or first write.
- If backend write fails, events are queued using OfflinePwa (`visited-persistence-event-sync`) and replayed later.
- Startup hydration replays `visit-log` and `route-state` events to reconstruct local runtime state.

