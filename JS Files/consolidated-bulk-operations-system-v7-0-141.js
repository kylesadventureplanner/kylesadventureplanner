/**
 * CONSOLIDATED BULK OPERATIONS SYSTEM v7.0.141
 * ============================================
 *
 * A unified system for all bulk operations functionality.
 * Consolidates all bulk add, populate, and update operations into a single module.
 *
 * INCLUDES:
 * - Bulk Add Chain Locations (with real-time progress)
 * - Populate Missing Fields Only
 * - Update Hours Only
 * - Google Places API Integration
 * - Excel verification and saving
 * - Detailed progress tracking
 * - Results copying to clipboard
 *
 * Version: 7.0.141
 * Date: March 15, 2026
 * Created: Consolidated from 2 separate bulk operations files
 */

console.log('🚀 Consolidated Bulk Operations System v7.0.141 Loading...');

window.__deploymentFileFingerprints = window.__deploymentFileFingerprints || {};
window.__deploymentFileFingerprints['consolidated-bulk-operations-system-v7-0-141.js'] = '2026.04.24.direct-patch-fix.1';

const UPDATE_DESCRIPTIONS_STRICT_MODE_STORAGE_KEY = 'updateDescriptionsStrictMode';

function resolveUpdateDescriptionsStrictVerification(value) {
  if (typeof value === 'boolean') return value;
  const text = String(value == null ? '' : value).trim().toLowerCase();
  if (text === 'warn-only' || text === 'off' || text === 'false' || text === '0') return false;
  if (text === 'fail-closed' || text === 'on' || text === 'true' || text === '1') return true;
  try {
    const stored = String(localStorage.getItem(UPDATE_DESCRIPTIONS_STRICT_MODE_STORAGE_KEY) || '').trim().toLowerCase();
    if (stored === 'warn-only' || stored === 'off' || stored === 'false' || stored === '0') return false;
    if (stored === 'fail-closed' || stored === 'on' || stored === 'true' || stored === '1') return true;
  } catch (_error) {}
  return true;
}

window.getUpdateDescriptionsStrictMode = window.getUpdateDescriptionsStrictMode || function() {
  return resolveUpdateDescriptionsStrictVerification(undefined) ? 'fail-closed' : 'warn-only';
};

function isWorkbookWriteDebugEnabled() {
  try {
    if (window.__workbookWriteDebugEnabled === true) return true;
    return String(localStorage.getItem('workbookWriteDebugEnabled') || '').trim() === '1';
  } catch (_error) {
    return window.__workbookWriteDebugEnabled === true;
  }
}

function pushWorkbookWriteDebug(event, details) {
  try {
    const row = {
      ts: new Date().toISOString(),
      event: String(event || 'event'),
      details: details && typeof details === 'object' ? details : {}
    };
    const list = Array.isArray(window.__workbookWriteDebugLog) ? window.__workbookWriteDebugLog : [];
    list.push(row);
    if (list.length > 300) list.splice(0, list.length - 300);
    window.__workbookWriteDebugLog = list;
    if (isWorkbookWriteDebugEnabled()) {
      console.log('[WorkbookWriteDebug]', row.event, row.details);
    }
  } catch (_error) {}
}

window.getWorkbookWriteDebugLog = function(limit = 50) {
  const cap = Math.max(1, Number(limit) || 50);
  const list = Array.isArray(window.__workbookWriteDebugLog) ? window.__workbookWriteDebugLog : [];
  return list.slice(-cap);
};
window.clearWorkbookWriteDebugLog = function() {
  window.__workbookWriteDebugLog = [];
};
window.getLastUpdateDescriptionsAudit = function() {
  return window.__lastUpdateDescriptionsAudit || null;
};
window.copyLastUpdateDescriptionsAuditJson = window.copyLastUpdateDescriptionsAuditJson || async function() {
  const payload = window.__lastUpdateDescriptionsAudit || null;
  const text = payload ? JSON.stringify(payload, null, 2) : '';
  if (!text) return { ok: false, reason: 'empty' };
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
    }
    return { ok: true, bytes: text.length };
  } catch (error) {
    return { ok: false, reason: String(error && error.message ? error.message : error) };
  }
};

function escapeCsvCell(value) {
  const text = value == null ? '' : String(value);
  if (!/[",\r\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function buildPerRowWriteLogCsv(audit) {
  const payload = audit && typeof audit === 'object' ? audit : null;
  const rows = Array.isArray(payload && payload.perRowWriteLog) ? payload.perRowWriteLog : [];
  if (!rows.length) return { ok: false, reason: 'empty', csv: '', rowCount: 0, headers: [] };

  const fixedHeaders = [
    'rowIndex',
    'rowRef',
    'placeName',
    'placeId',
    'descriptionColumnIndex',
    'descriptionColumnName',
    'descriptionBefore',
    'descriptionWritten',
    'readbackValue',
    'patchOk',
    'readbackOk',
    'patchError',
    'readbackError',
    'tableName',
    'resolvedFilePath',
    'patchUrl',
    'readUrl'
  ];

  const dynamicHeaders = [];
  rows.forEach((row) => {
    const keys = row && typeof row === 'object' ? Object.keys(row) : [];
    keys.forEach((key) => {
      if (!fixedHeaders.includes(key) && !dynamicHeaders.includes(key)) {
        dynamicHeaders.push(key);
      }
    });
  });

  const headers = fixedHeaders.concat(dynamicHeaders);
  const lines = [headers.map(escapeCsvCell).join(',')];
  rows.forEach((row) => {
    const cells = headers.map((header) => escapeCsvCell(row && Object.prototype.hasOwnProperty.call(row, header) ? row[header] : ''));
    lines.push(cells.join(','));
  });

  return {
    ok: true,
    csv: lines.join('\n'),
    rowCount: rows.length,
    headers
  };
}

window.getLastUpdateDescriptionsPerRowWriteLogCsv = function() {
  return buildPerRowWriteLogCsv(window.__lastUpdateDescriptionsAudit || null);
};

window.downloadLastUpdateDescriptionsPerRowWriteLogCsv = window.downloadLastUpdateDescriptionsPerRowWriteLogCsv || function(fileName) {
  const built = buildPerRowWriteLogCsv(window.__lastUpdateDescriptionsAudit || null);
  if (!built.ok) return built;

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const safeFileName = String(fileName || `update-descriptions-write-log-${stamp}.csv`).trim() || `update-descriptions-write-log-${stamp}.csv`;
  try {
    const blob = new Blob([built.csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = safeFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return { ok: true, fileName: safeFileName, rowCount: built.rowCount, headers: built.headers };
  } catch (error) {
    return { ok: false, reason: String(error && error.message ? error.message : error) };
  }
};

// ============================================================
// SECTION 1: CONFIGURATION & UTILITIES
// ============================================================

// Rate limiting for Google Places API
const PLACES_API_DELAY_MS = 100; // 100ms between calls to avoid rate limiting

// Fallback column indices for Excel when column-name lookup is unavailable.
// Keep these aligned with the default app row schema (19-column layout).
const COLS = {
  NAME: 0,
  PLACE_ID: 1,
  WEBSITE: 2,
  TAGS: 3,
  DRIVE_TIME: 4,
  HOURS: 5,
  STATE: 6,
  CITY: 7,
  ADDRESS: 8,
  PHONE: 9,
  RATING: 10,
  DIRECTIONS: 11,
  DESCRIPTION: 12,
  COST: 14
};

function getActiveCols(mainWindow) {
  const source = mainWindow || (window.opener && !window.opener.closed ? window.opener : window);
  const getByName = source && typeof source.getColumnIndexByName === 'function'
    ? source.getColumnIndexByName
    : null;
  if (!getByName) return COLS;

  const pick = (primary, aliases, fallback) => {
    const idx = Number(getByName(primary, aliases));
    return Number.isInteger(idx) && idx >= 0 ? idx : fallback;
  };

  return {
    NAME: pick('Name', [], COLS.NAME),
    PLACE_ID: pick('Google Place ID', ['GooglePlaceId'], COLS.PLACE_ID),
    WEBSITE: pick('Website', [], COLS.WEBSITE),
    TAGS: pick('Tags', [], COLS.TAGS),
    DRIVE_TIME: pick('Drive Time', ['DriveTime'], COLS.DRIVE_TIME),
    HOURS: pick('Hours of Operation', ['Hours'], COLS.HOURS),
    STATE: pick('State', [], COLS.STATE),
    CITY: pick('City', [], COLS.CITY),
    ADDRESS: pick('Address', [], COLS.ADDRESS),
    PHONE: pick('Phone Number', ['Phone'], COLS.PHONE),
    RATING: pick('Google Rating', ['Rating'], COLS.RATING),
    COST: pick('Cost', [], COLS.COST),
    DIRECTIONS: pick('Directions', ['Directions '], COLS.DIRECTIONS),
    DESCRIPTION: pick('Description', [], COLS.DESCRIPTION)
  };
}

function getSchemaColumnCount(mainWindow) {
  const countFromGlobal = Number(mainWindow?.__excelColumnCount || window.__excelColumnCount || 0);
  if (Number.isInteger(countFromGlobal) && countFromGlobal > 0) return countFromGlobal;

  const firstRow = mainWindow?.adventuresData?.[0]?.values?.[0] || window.adventuresData?.[0]?.values?.[0];
  if (Array.isArray(firstRow) && firstRow.length > 0) return firstRow.length;

  return 24;
}

function getWindowCandidates(preferredWindow) {
  const candidates = [];
  const pushSafe = (value) => {
    try {
      if (!value || candidates.includes(value)) return;
      candidates.push(value);
    } catch (_error) {}
  };

  pushSafe(preferredWindow);
  pushSafe(window);
  try {
    if (window.parent && window.parent !== window) pushSafe(window.parent);
  } catch (_error) {}
  try {
    if (window.opener && !window.opener.closed) pushSafe(window.opener);
  } catch (_error) {}
  try {
    if (window.top && window.top !== window) pushSafe(window.top);
  } catch (_error) {}
  try {
    if (window.opener && !window.opener.closed && window.opener.parent && window.opener.parent !== window.opener) {
      pushSafe(window.opener.parent);
    }
  } catch (_error) {}

  return candidates;
}

function resolveAutomationHost(mainWindow, requiredMethod) {
  const methodName = String(requiredMethod || '').trim();
  const candidates = getWindowCandidates(mainWindow || (window.opener && !window.opener.closed ? window.opener : window));
  if (!methodName) return candidates[0] || window;
  const matched = candidates.find((candidate) => candidate && typeof candidate[methodName] === 'function');
  return matched || candidates[0] || window;
}

function toContractCount(value, fallback = 0) {
  const next = Number(value);
  if (!Number.isFinite(next) || next < 0) return Math.max(0, Number(fallback) || 0);
  return Math.max(0, Math.round(next));
}

function normalizeWriteResultContract(rawResult, defaults = {}) {
  const raw = rawResult && typeof rawResult === 'object' ? rawResult : {};
  const baseRequested = toContractCount(defaults.rowsRequested, 0);
  const baseChanged = toContractCount(defaults.rowsChanged, baseRequested);

  const rowsChanged = toContractCount(raw.rowsChanged, toContractCount(raw.rowsAppended, baseChanged));
  const persistedRows = toContractCount(raw.persistedRows, toContractCount(raw.rowsPersisted, rowsChanged));
  const verifiedRowsChanged = toContractCount(raw.verifiedRowsChanged, toContractCount(raw.rowsVerifiedPresent, 0));
  const rowsRequested = toContractCount(raw.rowsRequested, toContractCount(raw.total, baseRequested || rowsChanged));
  const rowsAppended = toContractCount(raw.rowsAppended, rowsChanged);
  const rowsVerifiedPresent = toContractCount(raw.rowsVerifiedPresent, verifiedRowsChanged);

  const persisted = typeof raw.persisted === 'boolean' ? raw.persisted : persistedRows > 0;
  const postWriteVerified = typeof raw.postWriteVerified === 'boolean'
    ? raw.postWriteVerified
    : (persistedRows > 0 && verifiedRowsChanged === persistedRows);

  return {
    ...raw,
    rowsRequested,
    rowsChanged,
    persistedRows,
    verifiedRowsChanged,
    rowsAppended,
    rowsVerifiedPresent,
    persisted,
    postWriteVerified,
    verificationMode: String(raw.verificationMode || defaults.verificationMode || '').trim(),
    verificationReason: String(raw.verificationReason || defaults.verificationReason || '').trim(),
    persistMode: String(raw.persistMode || raw.mode || defaults.persistMode || '').trim(),
    persistReason: String(raw.persistReason || raw.reason || defaults.persistReason || '').trim()
  };
}

window.normalizeWriteResultContract = window.normalizeWriteResultContract || normalizeWriteResultContract;

function resolveWorkbookRowReference(row, fallbackIndex) {
  const source = row && typeof row === 'object' ? row : {};
  const candidates = [source.rowId, source.id, source.rowIndex, source.index, fallbackIndex];
  let resolved = null;
  for (const candidate of candidates) {
    if (typeof candidate === 'number' && Number.isFinite(candidate) && candidate >= 0) {
      resolved = Math.trunc(candidate);
      break;
    }
    const text = String(candidate == null ? '' : candidate).trim();
    if (!text) continue;
    if (/^\d+$/.test(text)) {
      resolved = Number(text);
      break;
    }
    resolved = text;
    break;
  }
  pushWorkbookWriteDebug('row-ref-resolved', {
    rowId: source.rowId,
    id: source.id,
    rowIndex: source.rowIndex,
    index: source.index,
    fallbackIndex,
    resolved
  });
  return resolved;
}

function buildChangedWorkbookRow(row, fallbackIndex, values, meta = null) {
  const rowIndex = Number.isInteger(fallbackIndex) && fallbackIndex >= 0
    ? fallbackIndex
    : (() => {
        const resolved = resolveWorkbookRowReference(row, 0);
        return typeof resolved === 'number' && Number.isFinite(resolved) && resolved >= 0 ? resolved : 0;
      })();
  return {
    rowIndex,
    rowId: resolveWorkbookRowReference(row, rowIndex),
    values: Array.isArray(values) ? values.slice() : [],
    meta: meta && typeof meta === 'object' ? { ...meta } : undefined
  };
}

window.resolveWorkbookRowReference = window.resolveWorkbookRowReference || resolveWorkbookRowReference;
window.buildChangedWorkbookRow = window.buildChangedWorkbookRow || buildChangedWorkbookRow;

function resolveWorkbookPatchTarget(mainWindow) {
  const src = mainWindow || (window.opener && !window.opener.closed ? window.opener : window);
  const token = src.accessToken || (window.opener && window.opener.accessToken) || window.accessToken;
  if (!token) throw new Error('automation-patch: no access token');

  const resolvedFilePath = (src.__editModeTarget && src.__editModeTarget.resolvedFilePath)
    || src.__resolvedExcelFilePath
    || src.filePath
    || 'Copilot_Apps/Kyles_Adventure_Finder/Adventure_Finder_Excel_DB.xlsx';
  const tableName = src.tableName || 'MyList';
  const encodedPath = String(resolvedFilePath || '')
    .split('/')
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join('/');

  return { src, token, resolvedFilePath, tableName, encodedPath };
}

function normalizeGraphTableColumnsPayload(payload) {
  const list = Array.isArray(payload?.value) ? payload.value : [];
  return list.map((col, idx) => {
    const name = String(col?.name || col?.values?.[0]?.[0] || '').trim();
    const rawIndex = Number(col?.index);
    const index = Number.isInteger(rawIndex) && rawIndex >= 0 ? rawIndex : idx;
    return { name, index };
  });
}

async function preflightValidateDescriptionWriteTarget(mainWindow, options = {}) {
  const target = resolveWorkbookPatchTarget(mainWindow);
  const operationRunId = String(options.operationRunId || '').trim();
  const expectedDescriptionColumnIndex = Number.isInteger(options.descriptionColumnIndex) ? options.descriptionColumnIndex : -1;
  const expectedDescriptionColumnName = String(options.descriptionColumnName || '').trim();
  const expectedNameNormalized = expectedDescriptionColumnName.toLowerCase();
  const canonicalDescriptionName = 'description';
  const columnsUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${target.encodedPath}:/workbook/tables/${encodeURIComponent(target.tableName)}/columns`;

  try {
    const response = await fetch(columnsUrl, {
      method: 'GET',
      headers: { Authorization: `Bearer ${target.token}` }
    });
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      return {
        ok: false,
        reason: `preflight-columns-http-${response.status}`,
        detail: `Could not load table columns [${response.status}] ${errorText || ''}`.trim(),
        operationRunId,
        writeTarget: { resolvedFilePath: target.resolvedFilePath, tableName: target.tableName },
        columnsUrl,
        columns: []
      };
    }

    const payload = await response.json();
    const columns = normalizeGraphTableColumnsPayload(payload);
    const columnAtExpected = expectedDescriptionColumnIndex >= 0
      ? columns.find((col) => Number(col.index) === Number(expectedDescriptionColumnIndex))
      : null;
    const discoveredDescription = columns.find((col) => String(col.name || '').trim().toLowerCase() === canonicalDescriptionName) || null;
    const discoveredNameNormalized = String(columnAtExpected?.name || '').trim().toLowerCase();
    const expectedNameMatches = expectedNameNormalized
      ? discoveredNameNormalized === expectedNameNormalized
      : true;
    const canonicalNameAtExpected = discoveredNameNormalized === canonicalDescriptionName;
    const indexMatchesCanonical = discoveredDescription
      ? Number(discoveredDescription.index) === Number(expectedDescriptionColumnIndex)
      : false;

    let ok = true;
    let reason = '';
    if (!columns.length) {
      ok = false;
      reason = 'no-columns-returned';
    } else if (expectedDescriptionColumnIndex < 0) {
      ok = false;
      reason = 'invalid-description-index';
    } else if (!columnAtExpected) {
      ok = false;
      reason = 'description-index-out-of-range';
    } else if (!canonicalNameAtExpected && expectedNameNormalized !== canonicalDescriptionName) {
      ok = false;
      reason = 'description-column-name-mismatch';
    } else if (!expectedNameMatches) {
      ok = false;
      reason = 'description-schema-name-mismatch';
    } else if (discoveredDescription && !indexMatchesCanonical) {
      ok = false;
      reason = 'description-index-mismatch';
    }

    return {
      ok,
      reason,
      detail: ok
        ? 'preflight-ok'
        : `Expected Description at index ${expectedDescriptionColumnIndex} but schema differs`,
      operationRunId,
      writeTarget: { resolvedFilePath: target.resolvedFilePath, tableName: target.tableName },
      columnsUrl,
      expectedDescriptionColumnIndex,
      expectedDescriptionColumnName,
      discoveredColumnAtExpected: columnAtExpected || null,
      discoveredDescriptionColumn: discoveredDescription || null,
      columnsSample: columns.slice(0, 30)
    };
  } catch (error) {
    return {
      ok: false,
      reason: 'preflight-exception',
      detail: String(error && error.message ? error.message : error),
      operationRunId,
      writeTarget: { resolvedFilePath: target.resolvedFilePath, tableName: target.tableName },
      columnsUrl,
      columns: []
    };
  }
}

async function readWorkbookRowByIndex(mainWindow, rowIndex) {
  const target = resolveWorkbookPatchTarget(mainWindow);
  const rowRef = `itemAt(index=${Number(rowIndex)})`;
  const url = `https://graph.microsoft.com/v1.0/me/drive/root:/${target.encodedPath}:/workbook/tables/${encodeURIComponent(target.tableName)}/rows/${rowRef}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${target.token}` }
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`automation-readback: GET failed [${response.status}] ${errorText || ''} (table=${target.tableName}, path=${target.resolvedFilePath}, row=${rowRef})`);
  }

  const payload = await response.json();
  return {
    values: Array.isArray(payload?.values?.[0]) ? payload.values[0] : [],
    rowRef,
    url,
    resolvedFilePath: target.resolvedFilePath,
    tableName: target.tableName
  };
}

async function verifyDescriptionCellAfterPatch(mainWindow, rowIndex, descriptionColumnIndex, expectedText) {
  const row = await readWorkbookRowByIndex(mainWindow, rowIndex);
  const actual = String(row.values?.[descriptionColumnIndex] || '').trim();
  const expected = String(expectedText || '').trim();
  const matches = actual === expected;
  return {
    matches,
    actual,
    expected,
    descriptionColumnIndex,
    rowRef: row.rowRef,
    resolvedFilePath: row.resolvedFilePath,
    tableName: row.tableName,
    readUrl: row.url
  };
}

// ─── Direct Graph API PATCH helper (mirrors syncVisitedExplorerDetailFields) ────
async function directPatchWorkbookRow(mainWindow, rowIndex, rowValues) {
  const { token, resolvedFilePath, tableName, encodedPath } = resolveWorkbookPatchTarget(mainWindow);

  const rowRef = `itemAt(index=${Number(rowIndex)})`;
  const updateUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/workbook/tables/${encodeURIComponent(tableName)}/rows/${rowRef}`;

  // Normalize cell values: convert null/undefined → '', numbers/booleans → string
  const normalizedValues = (Array.isArray(rowValues) ? rowValues : []).map((v) => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return String(v);
    if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
    return String(v);
  });

  console.log(`[directPatchWorkbookRow] PATCH → ${updateUrl}`, {
    rowIndex,
    rowRef,
    resolvedFilePath,
    tableName,
    valuesLength: normalizedValues.length
  });

  const patchResponse = await fetch(updateUrl, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ values: [normalizedValues] })
  });

  if (!patchResponse.ok) {
    const errorText = await patchResponse.text().catch(() => '');
    throw new Error(`automation-patch: PATCH failed [${patchResponse.status}] ${errorText || ''} (table=${tableName}, path=${resolvedFilePath}, row=${rowRef})`);
  }

  console.log(`✅ [directPatchWorkbookRow] Row ${rowRef} patched successfully`);
  return { persisted: true, verified: false, rowRef, tableName, resolvedFilePath, updateUrl };
}

async function persistAutomationWorkbookChanges(mainWindow, options = {}) {
  const host = resolveAutomationHost(mainWindow, 'saveToExcel');
  const operation = String(options.operation || 'automation').trim();
  const operationRunId = String(options.operationRunId || '').trim();
  const dryRun = !!options.dryRun;
  const updatedCount = Number(options.updatedCount || 0);
  const changedRows = Array.isArray(options.changedRows) ? options.changedRows.filter((item) => item && Array.isArray(item.values)) : [];
  const enableDescriptionReadback = !!options.enableDescriptionReadback && operation === 'update-descriptions';
  const strictVerification = !!options.strictVerification && operation === 'update-descriptions';
  const requirePreflight = !!options.requirePreflight && operation === 'update-descriptions';
  const descriptionColumnIndex = Number.isInteger(options.descriptionColumnIndex) ? options.descriptionColumnIndex : -1;
  const descriptionColumnName = String(options.descriptionColumnName || '').trim();

  if (requirePreflight && !dryRun) {
    const preflight = await preflightValidateDescriptionWriteTarget(mainWindow, {
      operationRunId,
      descriptionColumnIndex,
      descriptionColumnName
    });
    pushWorkbookWriteDebug('update-descriptions-preflight', {
      operationRunId,
      stage: 'persist',
      ok: !!preflight.ok,
      reason: String(preflight.reason || ''),
      writeTarget: preflight.writeTarget || null,
      expectedDescriptionColumnIndex: Number(descriptionColumnIndex),
      expectedDescriptionColumnName: String(descriptionColumnName || '')
    });
    if (!preflight.ok) {
      return normalizeWriteResultContract({
        persisted: false,
        mode: 'preflight-failed',
        reason: String(preflight.reason || 'preflight-failed'),
        rowsChanged: changedRows.length,
        persistedRows: 0,
        verifiedRowsChanged: 0,
        postWriteVerified: false,
        verificationMode: 'preflight',
        verificationReason: String(preflight.detail || preflight.reason || 'preflight-failed'),
        operationRunId,
        preflight
      }, { rowsRequested: updatedCount });
    }
  }

  if (dryRun || updatedCount <= 0) {
    return normalizeWriteResultContract({
      persisted: false,
      mode: 'skipped',
      reason: dryRun ? 'dry-run' : 'no-updates',
      rowsChanged: changedRows.length,
      persistedRows: 0,
      verifiedRowsChanged: 0,
      postWriteVerified: false,
      verificationMode: 'skipped',
      verificationReason: dryRun ? 'dry-run' : 'no-updates'
    }, { rowsRequested: updatedCount });
  }

  // Resolve access token — if unavailable the direct patch path is skipped
  // entirely and the saveToExcel fallback is used instead (test/offline envs).
  const _src = mainWindow || (window.opener && !window.opener.closed ? window.opener : window);
  const _hasToken = !!(_src.accessToken || (window.opener && window.opener.accessToken) || window.accessToken);

  try {
    // ── PRIMARY PATH: Direct Graph API PATCH (reliable, mirrors card enrich) ──
    // Only attempted when an access token is present — skipped silently in
    // test/offline environments so the saveToExcel fallback takes over cleanly.
    if (changedRows.length && _hasToken) {
      let persistedRows = 0;
      let verifiedRowsChanged = 0;
      let errorCount = 0;
      let patchErrorCount = 0;
      let readbackMismatchCount = 0;
      let readbackErrorCount = 0;
      let retryRecoveredCount = 0;
      const errors = [];
      const perRowWriteLog = [];
      let writeTarget = null;
      const maxReadbackRetries = enableDescriptionReadback ? 1 : 0;
      for (const row of changedRows) {
        const rowIdx = typeof row.rowIndex === 'number' ? row.rowIndex : resolveWorkbookRowReference(row, 0);
        const rowMeta = row && row.meta && typeof row.meta === 'object' ? row.meta : {};
        const nextDescription = descriptionColumnIndex >= 0 ? String(row.values?.[descriptionColumnIndex] || '').trim() : '';
        pushWorkbookWriteDebug('row-direct-patch-attempt', {
          operationRunId,
          operation,
          rowIdx,
          valueCount: Array.isArray(row.values) ? row.values.length : 0,
          placeName: String(rowMeta.name || ''),
          placeId: String(rowMeta.placeId || ''),
          descriptionColumnIndex,
          descriptionColumnName,
          descriptionBefore: String(rowMeta.descriptionBefore || ''),
          descriptionAfter: String(rowMeta.descriptionAfter || nextDescription)
        });
        try {
          const patchResult = await directPatchWorkbookRow(mainWindow, rowIdx, row.values);
          persistedRows += 1;
          if (!writeTarget) {
            writeTarget = {
              resolvedFilePath: patchResult.resolvedFilePath,
              tableName: patchResult.tableName
            };
          }
          const rowWriteLog = {
            operationRunId,
            rowIndex: rowIdx,
            rowRef: String(patchResult.rowRef || ''),
            placeName: String(rowMeta.name || ''),
            placeId: String(rowMeta.placeId || ''),
            descriptionColumnIndex,
            descriptionColumnName,
            descriptionBefore: String(rowMeta.descriptionBefore || ''),
            descriptionWritten: String(rowMeta.descriptionAfter || nextDescription),
            tableName: String(patchResult.tableName || ''),
            resolvedFilePath: String(patchResult.resolvedFilePath || ''),
            patchUrl: String(patchResult.updateUrl || ''),
            patchOk: true,
            readbackOk: null,
            readbackValue: '',
            retryCount: 0
          };

          if (enableDescriptionReadback && descriptionColumnIndex >= 0) {
            let finalReadback = null;
            let finalReadbackError = '';
            for (let attempt = 0; attempt <= maxReadbackRetries; attempt += 1) {
              if (attempt > 0) {
                rowWriteLog.retryCount = attempt;
                rowWriteLog.retryReason = finalReadbackError ? 'readback-error' : 'readback-mismatch';
                pushWorkbookWriteDebug('row-direct-patch-retry-attempt', {
                  operationRunId,
                  operation,
                  rowIdx,
                  attempt,
                  reason: rowWriteLog.retryReason,
                  placeName: rowWriteLog.placeName,
                  placeId: rowWriteLog.placeId
                });
                await directPatchWorkbookRow(mainWindow, rowIdx, row.values);
              }

              try {
                const readback = await verifyDescriptionCellAfterPatch(mainWindow, rowIdx, descriptionColumnIndex, nextDescription);
                finalReadback = readback;
                finalReadbackError = '';
                if (readback.matches) break;
                if (attempt >= maxReadbackRetries) break;
              } catch (readErr) {
                finalReadback = null;
                finalReadbackError = String(readErr && readErr.message ? readErr.message : readErr);
                if (attempt >= maxReadbackRetries) break;
              }
            }

            if (finalReadback) {
              rowWriteLog.readbackOk = !!finalReadback.matches;
              rowWriteLog.readbackValue = String(finalReadback.actual || '');
              rowWriteLog.readUrl = String(finalReadback.readUrl || '');
              if (finalReadback.matches) {
                verifiedRowsChanged += 1;
                if (rowWriteLog.retryCount > 0) retryRecoveredCount += 1;
              } else {
                readbackMismatchCount += 1;
              }
              pushWorkbookWriteDebug('row-direct-patch-readback', {
                operationRunId,
                operation,
                rowIdx,
                placeName: rowWriteLog.placeName,
                placeId: rowWriteLog.placeId,
                descriptionColumnIndex,
                descriptionColumnName,
                expected: String(finalReadback.expected || ''),
                actual: String(finalReadback.actual || ''),
                matches: !!finalReadback.matches,
                retryCount: rowWriteLog.retryCount,
                tableName: String(finalReadback.tableName || rowWriteLog.tableName),
                resolvedFilePath: String(finalReadback.resolvedFilePath || rowWriteLog.resolvedFilePath)
              });
            } else {
              rowWriteLog.readbackOk = false;
              rowWriteLog.readbackError = finalReadbackError;
              readbackErrorCount += 1;
              pushWorkbookWriteDebug('row-direct-patch-readback-error', {
                operationRunId,
                operation,
                rowIdx,
                placeName: rowWriteLog.placeName,
                placeId: rowWriteLog.placeId,
                descriptionColumnIndex,
                descriptionColumnName,
                retryCount: rowWriteLog.retryCount,
                error: rowWriteLog.readbackError
              });
            }
          }

          perRowWriteLog.push(rowWriteLog);
          pushWorkbookWriteDebug('row-direct-patch-success', { operationRunId, operation, rowIdx });
        } catch (patchErr) {
          errorCount += 1;
          patchErrorCount += 1;
          errors.push(String(patchErr && patchErr.message ? patchErr.message : patchErr));
          console.error(`❌ ${operation}: direct patch failed for row ${rowIdx}`, patchErr);
          perRowWriteLog.push({
            operationRunId,
            rowIndex: rowIdx,
            placeName: String(rowMeta.name || ''),
            placeId: String(rowMeta.placeId || ''),
            descriptionColumnIndex,
            descriptionColumnName,
            descriptionBefore: String(rowMeta.descriptionBefore || ''),
            descriptionWritten: String(rowMeta.descriptionAfter || nextDescription),
            patchOk: false,
            patchError: String(patchErr && patchErr.message ? patchErr.message : patchErr)
          });
        }
      }

      if (persistedRows > 0) {
        const unresolvedReadbackCount = readbackMismatchCount + readbackErrorCount;
        const strictVerificationFailed = strictVerification && enableDescriptionReadback && unresolvedReadbackCount > 0;
        console.log(`💾 ${operation}: persisted ${persistedRows}/${changedRows.length} row(s) via direct Graph API PATCH`);
        pushWorkbookWriteDebug('operation-direct-patch-summary', {
          operationRunId,
          operation,
          persistedRows,
          requestedRows: changedRows.length,
          verifiedRowsChanged,
          patchErrorCount,
          readbackMismatchCount,
          readbackErrorCount,
          unresolvedReadbackCount,
          retryRecoveredCount,
          strictVerification,
          strictVerificationFailed,
          descriptionReadbackEnabled: enableDescriptionReadback,
          descriptionColumnIndex,
          descriptionColumnName,
          writeTarget,
          perRowWriteLog
        });
        return normalizeWriteResultContract({
          persisted: true,
          mode: 'direct-graph-patch',
          reason: errorCount > 0 ? `${errorCount} row(s) failed` : '',
          rowsChanged: changedRows.length,
          persistedRows,
          verifiedRowsChanged,
          postWriteVerified: enableDescriptionReadback ? verifiedRowsChanged === persistedRows : false,
          verificationMode: enableDescriptionReadback ? 'description-cell-reread' : 'not-verified',
          verificationReason: enableDescriptionReadback
            ? (strictVerificationFailed
              ? `strict verification failed: ${unresolvedReadbackCount} unresolved readback issue(s)`
              : (verifiedRowsChanged === persistedRows ? '' : 'one-or-more-description-readbacks-failed'))
            : 'direct-patch-no-verify',
          operationRunId,
          runFailed: strictVerificationFailed,
          diagnosticSummary: {
            patchErrorCount,
            readbackMismatchCount,
            readbackErrorCount,
            unresolvedReadbackCount,
            retryRecoveredCount,
            strictVerification,
            strictVerificationFailed
          },
          writeTarget,
          perRowWriteLog
        }, { rowsRequested: updatedCount });
      }

      if (errorCount > 0) {
        // All direct patches failed — fall through to saveToExcel fallback
        console.warn(`⚠️ ${operation}: direct PATCH failed for all rows, trying saveToExcel fallback. Errors: ${errors.join('; ')}`);
      }
    }

    // ── FALLBACK PATH: row-level saveToExcel (legacy) ───────────────────────
    if (changedRows.length && host && typeof host.saveToExcel === 'function' && host.saveToExcel.length >= 1) {
      let persistedRows = 0;
      let verifiedRowsChanged = 0;
      for (const row of changedRows) {
        const rowRef = resolveWorkbookRowReference(row, row.rowIndex);
        pushWorkbookWriteDebug('row-save-attempt', {
          operation,
          rowRef,
          rowIndex: row && row.rowIndex,
          valueCount: Array.isArray(row && row.values) ? row.values.length : 0
        });
        const result = await host.saveToExcel(rowRef, row.values);
        persistedRows += 1;
        if (result && typeof result === 'object' && result.verified) verifiedRowsChanged += 1;
        pushWorkbookWriteDebug('row-save-result', {
          operation,
          rowRef,
          verified: Boolean(result && result.verified),
          persisted: Boolean(result && (result.persisted || result === true))
        });
      }
      console.log(`💾 ${operation}: persisted ${persistedRows} edited row(s) via row-level saveToExcel()`);
      return normalizeWriteResultContract({
        persisted: persistedRows > 0,
        mode: 'saveToExcel-row-patch',
        reason: '',
        rowsChanged: changedRows.length,
        persistedRows,
        verifiedRowsChanged,
        postWriteVerified: verifiedRowsChanged === persistedRows,
        verificationMode: 'row-reread',
        verificationReason: verifiedRowsChanged === persistedRows ? '' : 'one-or-more-row-verifications-failed'
      }, { rowsRequested: updatedCount });
    }

    if (host && typeof host.saveToExcel === 'function') {
      await host.saveToExcel();
      console.log(`💾 ${operation}: persisted workbook changes via saveToExcel()`);
      return normalizeWriteResultContract({
        persisted: true,
        mode: 'saveToExcel',
        reason: '',
        rowsChanged: changedRows.length || updatedCount,
        persistedRows: changedRows.length || updatedCount,
        verifiedRowsChanged: 0,
        postWriteVerified: false,
        verificationMode: 'not-supported',
        verificationReason: 'bulk-save-verification-unavailable'
      }, { rowsRequested: updatedCount });
    }

    if (typeof window.saveToExcel === 'function') {
      await window.saveToExcel();
      console.log(`💾 ${operation}: persisted workbook changes via local saveToExcel()`);
      return normalizeWriteResultContract({
        persisted: true,
        mode: 'saveToExcel-local',
        reason: '',
        rowsChanged: changedRows.length || updatedCount,
        persistedRows: changedRows.length || updatedCount,
        verifiedRowsChanged: 0,
        postWriteVerified: false,
        verificationMode: 'not-supported',
        verificationReason: 'bulk-save-verification-unavailable'
      }, { rowsRequested: updatedCount });
    }

    console.warn(`⚠️ ${operation}: no workbook save API found (saveToExcel unavailable)`);
    return normalizeWriteResultContract({
      persisted: false,
      mode: 'unavailable',
      reason: 'saveToExcel-unavailable',
      rowsChanged: changedRows.length || updatedCount,
      persistedRows: 0,
      verifiedRowsChanged: 0,
      postWriteVerified: false,
      verificationMode: 'unavailable',
      verificationReason: 'saveToExcel-unavailable'
    }, { rowsRequested: updatedCount });
  } catch (error) {
    console.error(`❌ ${operation}: workbook persistence failed`, error);
    return normalizeWriteResultContract({
      persisted: false,
      mode: 'error',
      reason: String(error && error.message ? error.message : error),
      rowsChanged: changedRows.length || updatedCount,
      persistedRows: 0,
      verifiedRowsChanged: 0,
      postWriteVerified: false,
      verificationMode: 'error',
      verificationReason: String(error && error.message ? error.message : error)
    }, { rowsRequested: updatedCount });
  }
}

function normalizeRowForSchema(rowValues, schemaCount) {
  const normalized = (Array.isArray(rowValues) ? rowValues : []).map((v) => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return String(v);
    if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
    return String(v);
  });

  if (normalized.length > schemaCount) return normalized.slice(0, schemaCount);
  if (normalized.length < schemaCount) return normalized.concat(new Array(schemaCount - normalized.length).fill(''));
  return normalized;
}

function canUseTargetScopedDuplicateCache(mainWindow) {
  const host = mainWindow || (window.opener && !window.opener.closed ? window.opener : window);
  const target = host && host.__editModeTarget && typeof host.__editModeTarget === 'object' ? host.__editModeTarget : null;
  const loadedKey = String((host && host.__editModeLoadedTargetKey) || window.__editModeLoadedTargetKey || '').trim();
  const targetKey = target
    ? `${String(target.filePath || '').trim()}|${String(target.tableName || '').trim()}`
    : '';
  return Boolean(loadedKey && targetKey && loadedKey === targetKey && Array.isArray(host && host.adventuresData));
}

function buildFallbackSchemaRow(location, placeId, details, schemaCount) {
  const activeCols = getActiveCols(window.opener && !window.opener.closed ? window.opener : window);
  const row = new Array(schemaCount).fill('');
  row[activeCols.NAME] = location || '';
  row[activeCols.PLACE_ID] = placeId || '';
  row[activeCols.WEBSITE] = details?.website || '';
  row[activeCols.HOURS] = details?.hours || '';
  row[activeCols.ADDRESS] = details?.address || '';
  row[activeCols.PHONE] = details?.phone || '';
  row[activeCols.RATING] = details?.rating || '';
  row[activeCols.DIRECTIONS] = details?.directions || `https://www.google.com/maps/place/?q=place_id:${placeId || ''}`;
  return row;
}

/**
 * Helper: Delay execution (for rate limiting)
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Helper: Update data in Google Sheet via Apps Script
 */
function updateSheetData(updateRanges) {
  return new Promise((resolve, reject) => {
    const mainWindow = window.opener && !window.opener.closed ? window.opener : window;

    // Check if Apps Script is available
    if (typeof mainWindow.google !== 'undefined' &&
        typeof mainWindow.google.script !== 'undefined' &&
        typeof mainWindow.google.script.run !== 'undefined') {
      console.log(`💾 Sending ${updateRanges.length} range updates to Google Sheet...`);

      mainWindow.google.script.run
        .withSuccessHandler((result) => {
          console.log('✅ Google Sheet updated successfully:', result);
          resolve({ success: true, message: result });
        })
        .withFailureHandler((error) => {
          console.warn('⚠️ Google Sheet update error:', error);
          reject({ success: false, error: error });
        })
        .updateAdventuresData(updateRanges);
    } else {
      reject({ success: false, error: 'Apps Script not available' });
    }
  });
}

function normalizeHoursForBulkOps(value, mainWindow) {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  const host = mainWindow && typeof mainWindow === 'object' ? mainWindow : window;
  if (host && typeof host.normalizeOperationHours === 'function') {
    try {
      return String(host.normalizeOperationHours(value) || '').trim();
    } catch (_error) {}
  }
  if (Array.isArray(value)) return value.map((entry) => String(entry || '').trim()).filter(Boolean).join('; ');
  if (typeof value === 'object') {
    if (Array.isArray(value.weekdayDescriptions)) {
      return value.weekdayDescriptions.map((entry) => String(entry || '').trim()).filter(Boolean).join('; ');
    }
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const normalized = days
      .map((day) => {
        const resolved = value[day] || value[day.toLowerCase()];
        return resolved ? `${day}: ${resolved}` : '';
      })
      .filter(Boolean)
      .join('; ');
    return normalized || String(value.text || value.periods || '').trim() || JSON.stringify(value);
  }
  return String(value).trim();
}

function buildDescriptionFromGoogleDetails(details) {
  const safe = details && typeof details === 'object' ? details : {};
  const direct = String(safe.description || '').trim();
  if (direct) return direct;

  const reviewTexts = Array.isArray(safe.reviews)
    ? safe.reviews
        .map((review) => {
          if (!review) return '';
          if (typeof review === 'string') return review.trim();
          if (review.text && typeof review.text === 'object' && review.text.text) return String(review.text.text).trim();
          return String(review.text || review.originalText || review.snippet || '').trim();
        })
        .filter(Boolean)
    : [];
  if (reviewTexts.length) {
    return reviewTexts.slice(0, 2).join(' ').trim();
  }

  const businessType = String(safe.businessType || '').trim().replace(/^[\p{So}]\s/u, '');
  const rating = safe.rating != null ? String(safe.rating).trim() : '';
  const ratingsTotal = safe.userRatingsTotal != null ? String(safe.userRatingsTotal).trim() : '';
  let fallback = businessType;
  if (rating) fallback += `${fallback ? ' • ' : ''}Rated ${rating}★`;
  if (ratingsTotal) fallback += `${fallback ? ' ' : ''}(${ratingsTotal} reviews)`;
  return fallback.trim();
}

function isAutoGeneratedDescriptionPlaceholder(value) {
  const text = String(value || '').trim();
  if (!text) return true;
  // Common synthetic fallback pattern previously used in bulk ops.
  return /\bis located in\b/i.test(text) && /\bgoogle rating\b/i.test(text);
}

function normalizePlaceDetailsForBulkOps(placeId, details, mainWindow) {
  const safe = details && typeof details === 'object' ? details : {};
  return {
    website: String(safe.website || safe.websiteURI || '').trim(),
    phone: String(safe.phone || safe.internationalPhoneNumber || '').trim(),
    hours: normalizeHoursForBulkOps(safe.hours || safe.regularOpeningHours || safe.weekdayDescriptions || '', mainWindow),
    address: String(safe.address || safe.formattedAddress || '').trim(),
    rating: safe.rating != null ? String(safe.rating).trim() : '',
    description: buildDescriptionFromGoogleDetails(safe),
    directions: String(safe.directions || '').trim() || `https://www.google.com/maps/place/?q=place_id:${placeId}`,
    businessType: String(safe.businessType || '').trim(),
    reviews: Array.isArray(safe.reviews) ? safe.reviews : [],
    coordinates: safe.coordinates || null
  };
}

window.copyDescriptionPreviewText = window.copyDescriptionPreviewText || async function() {
  const items = Array.isArray(window.__lastDescriptionPreviewItems) ? window.__lastDescriptionPreviewItems : [];
  const text = items.length
    ? items.map((item, index) => `${index + 1}. ${String(item && item.name || '(no name)').trim()}\n${String(item && item.description || '').trim()}`).join('\n\n')
    : '';
  window.__lastDescriptionPreviewCopiedText = text;
  if (!text) {
    return { ok: false, reason: 'empty' };
  }

  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
    } else {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', 'readonly');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.focus();
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
    }
    return { ok: true, text };
  } catch (error) {
    return { ok: false, reason: String(error && error.message ? error.message : error), text };
  }
};

function hasMeaningfulBulkOpsDetails(details) {
  const safe = details && typeof details === 'object' ? details : {};
  return Boolean(
    String(safe.website || '').trim()
    || String(safe.phone || '').trim()
    || String(safe.hours || '').trim()
    || String(safe.address || '').trim()
    || String(safe.rating || '').trim()
    || String(safe.description || '').trim()
    || safe.coordinates
    || (Array.isArray(safe.reviews) && safe.reviews.length)
  );
}

function getCachedPlaceDetailsFromRows(placeId, mainWindow) {
  const rows = Array.isArray(mainWindow?.adventuresData)
    ? mainWindow.adventuresData
    : (Array.isArray(window.adventuresData) ? window.adventuresData : []);
  if (!rows.length) return null;
  const cols = getActiveCols(mainWindow);
  const match = rows.find((entry) => {
    const values = entry && entry.values ? entry.values[0] : entry;
    const candidate = values && values[cols.PLACE_ID] != null ? String(values[cols.PLACE_ID]).trim() : '';
    return candidate === String(placeId || '').trim();
  });
  if (!match) return null;
  const values = match && match.values ? match.values[0] : match;
  return {
    website: String(values?.[cols.WEBSITE] || '').trim(),
    phone: String(values?.[cols.PHONE] || '').trim(),
    hours: String(values?.[cols.HOURS] || '').trim(),
    address: String(values?.[cols.ADDRESS] || '').trim(),
    rating: String(values?.[cols.RATING] || '').trim(),
    description: String(values?.[cols.DESCRIPTION] || '').trim(),
    directions: `https://www.google.com/maps/place/?q=place_id:${placeId}`
  };
}

/**
 * Helper: Get place details from Google Places API with retry logic.
 * Prefer live Google details first, then fall back to cached row data.
 */
async function getPlaceDetailsFromAPI(placeId, retryCount = 0, maxRetries = 1) {
  try {
    const mainWindow = window.opener && !window.opener.closed ? window.opener : window;

    // PRIORITY 1: Use the existing Google details helper when available.
    if (mainWindow && typeof mainWindow.getPlaceDetails === 'function') {
      try {
        const fallbackResult = await mainWindow.getPlaceDetails(placeId);
        const normalizedFallback = normalizePlaceDetailsForBulkOps(placeId, fallbackResult, mainWindow);
        if (hasMeaningfulBulkOpsDetails(normalizedFallback)) {
          console.log(`✅ Got data from fallback function for ${placeId}`);
          return normalizedFallback;
        }
      } catch (fallbackErr) {
        console.debug(`📍 Fallback attempt failed: ${fallbackErr.message}`);
      }
    }

    // Support direct-window execution when the helper lives in this window instead of the opener.
    if (typeof window.getPlaceDetails === 'function' && window.getPlaceDetails !== mainWindow?.getPlaceDetails) {
      try {
        const directResult = await window.getPlaceDetails(placeId);
        const normalizedDirect = normalizePlaceDetailsForBulkOps(placeId, directResult, mainWindow);
        if (hasMeaningfulBulkOpsDetails(normalizedDirect)) {
          console.log(`✅ Got data from local window.getPlaceDetails for ${placeId}`);
          return normalizedDirect;
        }
      } catch (directErr) {
        console.debug(`📍 Direct getPlaceDetails failed: ${directErr.message}`);
      }
    }

    // PRIORITY 2: Check local row cache only after live enrichment attempts.
    const cached = getCachedPlaceDetailsFromRows(placeId, mainWindow);
    if (hasMeaningfulBulkOpsDetails(cached)) {
      console.log(`✅ Using cached row data for ${placeId}`);
      return cached;
    }

    // PRIORITY 3: Google Places API - PERMANENTLY DISABLED
    // ⚠️ API key has domain/referrer restrictions, returns 400 errors systematically.
    // Skipping entirely to avoid console pollution. Use fallback mechanisms above.

    // FALLBACK: Return empty data (don't crash)
    return {
      website: '',
      phone: '',
      hours: '',
      address: '',
      rating: '',
      description: '',
      directions: `https://www.google.com/maps/place/?q=place_id:${placeId}`
    };
  } catch (err) {
    console.warn(`⚠️ Error in getPlaceDetailsFromAPI: ${err.message}`);
    return {
      website: '',
      phone: '',
      hours: '',
      address: '',
      rating: '',
      description: '',
      directions: `https://www.google.com/maps/place/?q=place_id:${placeId}`
    };
  }
}



/**
 * Helper: Verify row exists in Excel after save
 */
async function verifyRowInExcel(rowIndex, expectedName) {
  try {
    if (!window.accessToken || !window.filePath || !window.tableName) {
      return { verified: false, reason: 'Not configured' };
    }

    const url = `https://graph.microsoft.com/v1.0/me/drive/root:/${window.filePath}:/workbook/tables/${window.tableName}/rows/itemAt(index=${rowIndex})`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${window.accessToken}` }
    });

    if (!response.ok) {
      return { verified: false, reason: `HTTP ${response.status}` };
    }

    const data = await response.json();
    const activeCols = getActiveCols(window.opener && !window.opener.closed ? window.opener : window);
    const name = data.values?.[0]?.[activeCols.NAME] || '';
    return {
      verified: true,
      name: name,
      hasData: name.length > 0
    };
  } catch (err) {
    console.warn('⚠️ Could not verify row:', err.message);
    return { verified: false, reason: err.message };
  }
}

// ============================================================
// SECTION 2: BULK ADD CHAIN LOCATIONS
// ============================================================

/**
 * Bulk Add Chain Locations with Real-Time Progress
 */
window.handleBulkAddChainLocations = async function(locations, type, displayElement, dryRun = false) {
  console.log(`⛓️ Starting bulk add: ${locations.length} locations, dryRun=${dryRun}`);

  if (!displayElement) {
    console.error('❌ No display element provided');
    return { success: false, error: 'No display element' };
  }

  const mainWindow = window.opener && !window.opener.closed ? window.opener : window;
  const adventuresData = mainWindow.adventuresData || window.adventuresData;

  if (!adventuresData) {
    displayElement.innerHTML = `
      <div style="padding: 16px; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; color: #7f1d1d;">
        <strong>❌ Error:</strong> No data available. Please load Excel first.
      </div>
    `;
    return { success: false, error: 'No data available' };
  }

  const results = [];
  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;
  let verifiedRowsChanged = 0;
  const startTime = new Date();

  const updateDisplay = (processed, status = 'Processing') => {
    const percent = Math.round((processed / locations.length) * 100);
    const elapsed = Math.round((new Date() - startTime) / 1000);

    displayElement.innerHTML = `
      <div style="padding: 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px;">
        <div style="font-weight: 600; color: #1e40af; margin-bottom: 12px;">
          ${dryRun ? '🧪 DRY RUN' : '⏳ PROCESSING'} Bulk Add Chain Locations
        </div>
        
        <div style="margin-bottom: 12px;">
          <div style="font-size: 14px; color: #1f2937; margin-bottom: 6px;">
            Progress: <strong>${processed}/${locations.length}</strong> (${percent}%)
          </div>
          <div style="width: 100%; height: 12px; background: #e5e7eb; border-radius: 6px; overflow: hidden; margin-bottom: 4px;">
            <div style="width: ${percent}%; height: 100%; background: linear-gradient(90deg, #3b82f6, #2563eb); transition: width 0.3s; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px;">
          <div style="padding: 10px; background: #ecfdf5; border-radius: 6px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #10b981;">✅ ${successCount}</div>
            <div style="font-size: 11px; color: #047857; margin-top: 2px;">Success</div>
          </div>
          <div style="padding: 10px; background: #fee2e2; border-radius: 6px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #ef4444;">❌ ${failCount}</div>
            <div style="font-size: 11px; color: #7f1d1d; margin-top: 2px;">Failed</div>
          </div>
          <div style="padding: 10px; background: #fef3c7; border-radius: 6px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">⏭️ ${skippedCount}</div>
            <div style="font-size: 11px; color: #92400e; margin-top: 2px;">Skipped</div>
          </div>
          <div style="padding: 10px; background: #f3f4f6; border-radius: 6px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #6b7280;">⏱️ ${elapsed}s</div>
            <div style="font-size: 11px; color: #4b5563; margin-top: 2px;">Elapsed</div>
          </div>
        </div>

        <div style="padding: 8px 12px; background: rgba(59, 130, 246, 0.1); border-left: 3px solid #3b82f6; border-radius: 4px; font-size: 12px; color: #1f2937;">
          📝 ${status}
        </div>
      </div>
    `;
  };

  updateDisplay(0, 'Initializing...');

  try {
    for (let i = 0; i < locations.length; i++) {
      const location = locations[i].trim();

      updateDisplay(i, `Processing: ${location}`);

      if (!location) {
        skippedCount++;
        continue;
      }

      try {
        if (i > 0) await delay(PLACES_API_DELAY_MS);

        let resolved;
        try {
          if (typeof window.resolvePlaceInputWithGoogleData === 'function') {
            resolved = await window.resolvePlaceInputWithGoogleData(type, location);
          } else {
            throw new Error('Shared place resolver is not available');
          }
        } catch (resolveErr) {
          console.error(`❌ Could not resolve ${location}:`, resolveErr);
          failCount++;
          results.push({
            location,
            success: false,
            error: resolveErr.message
          });
          continue;
        }

        const placeId = resolved.placeId;
        const details = {
          ...resolved,
          directions: resolved.directions || `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(placeId)}`
        };

        if (!dryRun) {
          const schemaCount = getSchemaColumnCount(mainWindow);

          if (typeof mainWindow.buildExcelRow !== 'function') {
            throw new Error('Main window buildExcelRow helper is unavailable');
          }

          const rawRowValues = mainWindow.buildExcelRow(placeId, details);
          const rowValues = typeof window.normalizeExcelRowForSchema === 'function'
            ? window.normalizeExcelRowForSchema(rawRowValues, mainWindow)
            : normalizeRowForSchema(rawRowValues, schemaCount);

          if (canUseTargetScopedDuplicateCache(mainWindow)
            && typeof mainWindow.placeExistsInData === 'function'
            && mainWindow.placeExistsInData(rowValues)) {
            throw new Error('This location already exists in Excel');
          }

          if (typeof mainWindow.addRowToExcel === 'function') {
            await mainWindow.addRowToExcel(rowValues);
          } else {
            if (Array.isArray(mainWindow.adventuresData)) {
              mainWindow.adventuresData.push({ values: [rowValues] });
            }

            if (typeof mainWindow.saveToExcel === 'function') {
              await mainWindow.saveToExcel();
            } else {
              throw new Error('Main window Excel save helpers are unavailable');
            }
          }

          if (Array.isArray(mainWindow.adventuresData)) {
            const lastRow = mainWindow.adventuresData[mainWindow.adventuresData.length - 1]?.values?.[0];
            const alreadyAppended = Array.isArray(lastRow) && String(lastRow[1] || '').trim() === placeId;
            if (!alreadyAppended) {
              mainWindow.adventuresData.push({ values: [rowValues] });
            }
            const presentNow = mainWindow.adventuresData.some((entry) => {
              const values = entry && entry.values && Array.isArray(entry.values[0]) ? entry.values[0] : [];
              return String(values[1] || '').trim() === String(placeId || '').trim();
            });
            if (presentNow) verifiedRowsChanged += 1;
          }

          successCount++;
          results.push({
            location,
            placeId,
            success: true,
            status: `Added successfully: ${details.name || location}`
          });
        } else {
          successCount++;
          results.push({
            location,
            placeId,
            success: true,
            status: `[DRY RUN] Would add ${details.name || location}`
          });
        }
      } catch (err) {
        console.error(`❌ Error processing ${location}:`, err);
        failCount++;
        results.push({
          location,
          success: false,
          error: err.message
        });
      }
    }

    const elapsed = Math.round((new Date() - startTime) / 1000);

    const resultHTML = `
      <div style="padding: 16px; background: ${failCount === 0 ? '#ecfdf5' : '#fef3c7'}; border: 1px solid ${failCount === 0 ? '#6ee7b7' : '#fbbf24'}; border-radius: 8px;">
        <div style="font-weight: 600; color: ${failCount === 0 ? '#047857' : '#92400e'}; margin-bottom: 12px; font-size: 15px;">
          ${dryRun ? '🧪 DRY RUN COMPLETE' : failCount === 0 ? '✅ ALL LOCATIONS ADDED SUCCESSFULLY!' : '⚠️ COMPLETED WITH ERRORS'}
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px;">
          <div style="padding: 10px; background: #ecfdf5; border-radius: 6px; text-align: center;">
            <div style="font-size: 28px; font-weight: 700; color: #10b981;">✅ ${successCount}</div>
            <div style="font-size: 11px; color: #047857; margin-top: 2px;">Added</div>
          </div>
          <div style="padding: 10px; background: #fee2e2; border-radius: 6px; text-align: center;">
            <div style="font-size: 28px; font-weight: 700; color: #ef4444;">❌ ${failCount}</div>
            <div style="font-size: 11px; color: #7f1d1d; margin-top: 2px;">Failed</div>
          </div>
          <div style="padding: 10px; background: #fef3c7; border-radius: 6px; text-align: center;">
            <div style="font-size: 28px; font-weight: 700; color: #f59e0b;">⏭️ ${skippedCount}</div>
            <div style="font-size: 11px; color: #92400e; margin-top: 2px;">Skipped</div>
          </div>
          <div style="padding: 10px; background: #f3f4f6; border-radius: 6px; text-align: center;">
            <div style="font-size: 28px; font-weight: 700; color: #6b7280;">⏱️ ${elapsed}s</div>
            <div style="font-size: 11px; color: #4b5563; margin-top: 2px;">Total Time</div>
          </div>
        </div>

        <div style="max-height: 400px; overflow-y: auto; background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb; margin-bottom: 12px; font-size: 12px;">
          ${results.map((r, idx) => {
            const icon = r.success ? '✅' : '❌';
            return `
              <div style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; display: flex; align-items: flex-start; gap: 8px;">
                <div style="flex-shrink: 0; margin-top: 2px;">${icon}</div>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-weight: 600; word-break: break-all;">${r.location}</div>
                  <div style="color: #6b7280; font-size: 11px; margin-top: 2px;">${r.status || r.error || 'Completed'}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <button id="bulkAddCopyResultsBtn" style="
          padding: 10px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: background 0.2s;
        " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
          📋 Copy Results to Clipboard
        </button>
      </div>
    `;

    displayElement.innerHTML = resultHTML;

    const copyBtn = displayElement.querySelector('#bulkAddCopyResultsBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const header = [
          `BULK ADD RESULTS - ${new Date().toLocaleString()}`,
          `Status: ${dryRun ? 'DRY RUN' : 'COMPLETED'}`,
          `Success: ${successCount} | Failed: ${failCount} | Skipped: ${skippedCount}`,
          `Time: ${elapsed} seconds`,
          '',
          'DETAILS:'
        ];
        const detailLines = results.map((r, i) => {
          const icon = r.success ? '✅' : '❌';
          const msg = r.status || r.error || 'Added';
          return `${i + 1}. ${icon} ${r.location} - ${msg}`;
        });
        const text = header.concat(detailLines).join('\n');

        navigator.clipboard.writeText(text).then(() => {
          alert('✅ Results copied to clipboard!');
        }).catch(() => {
          alert('❌ Could not copy to clipboard');
        });
      });
    }

    return {
      success: failCount === 0,
      successCount,
      failCount,
      skippedCount,
      results,
      dryRun,
      elapsed,
      rowsChanged: dryRun ? 0 : successCount,
      persistedRows: dryRun ? 0 : successCount,
      verifiedRowsChanged: dryRun ? 0 : verifiedRowsChanged,
      postWriteVerified: !dryRun && successCount > 0 && verifiedRowsChanged === successCount,
      verificationMode: dryRun ? 'dry-run' : 'loaded-data-presence',
      verificationReason: dryRun ? 'dry-run' : (successCount > 0 && verifiedRowsChanged !== successCount ? 'one-or-more-added-rows-not-found-in-loaded-data' : '')
    };
  } catch (err) {
    console.error('❌ Bulk add error:', err);
    displayElement.innerHTML = `
      <div style="padding: 16px; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; color: #7f1d1d;">
        <strong>❌ Fatal Error:</strong> ${err.message}
        <div style="margin-top: 8px; padding: 8px; background: rgba(0,0,0,0.1); border-radius: 4px; font-family: monospace; font-size: 11px; max-height: 200px; overflow-y: auto;">
          ${err.stack}
        </div>
      </div>
    `;
    return { success: false, error: err.message, elapsed: Math.round((new Date() - startTime) / 1000), rowsChanged: 0, persistedRows: 0, verifiedRowsChanged: 0, postWriteVerified: false, verificationMode: 'error', verificationReason: err.message };
  }
};

// Alias for compatibility
window.handleBulkAddChainLocationsFixed = window.handleBulkAddChainLocations;
window.handleBulkAddChainLocationsEnhanced = window.handleBulkAddChainLocations;

console.log('✅ Bulk Add Chain Locations ready');

// ============================================================
// SECTION 3: POPULATE MISSING FIELDS
// ============================================================

/**
 * Populate Missing Fields Only
 */
window.handlePopulateMissingFields = async function(displayElement, dryRun = false) {
  console.log(`📝 Starting populate missing fields, dryRun=${dryRun}`);

  if (!displayElement) {
    console.error('❌ No display element provided');
    return { success: false, error: 'No display element' };
  }

  const mainWindow = window.opener && !window.opener.closed ? window.opener : window;
  const adventuresData = mainWindow.adventuresData || window.adventuresData;

  if (!adventuresData || adventuresData.length === 0) {
    displayElement.innerHTML = `
      <div style="padding: 16px; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; color: #7f1d1d;">
        <strong>❌ Error:</strong> No data available.
      </div>
    `;
    return { success: false, error: 'No data available' };
  }

  const results = [];
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const changedRows = [];

  const updateDisplay = (status) => {
    displayElement.innerHTML = status;
  };

  updateDisplay(`
    <div style="padding: 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px;">
      <div style="font-weight: 600; color: #1e40af; margin-bottom: 12px;">
        ${dryRun ? '🧪 DRY RUN - Preview' : '⏳ Processing'} Populate Missing Fields
      </div>
      <div style="font-size: 14px; color: #1f2937;">
        📊 Total locations: ${adventuresData.length}
      </div>
      <div style="margin-top: 8px; padding: 8px; background: rgba(59, 130, 246, 0.1); border-radius: 4px; font-size: 12px; color: #1f2937;">
        ⏳ Scanning for missing fields...
      </div>
    </div>
  `);

  try {
    const activeCols = getActiveCols(window.opener && !window.opener.closed ? window.opener : window);
    for (let i = 0; i < adventuresData.length; i++) {
      const place = adventuresData[i];
      const values = place.values ? place.values[0] : place;

      if (!values || values.length === 0) {
        skippedCount++;
        continue;
      }

      try {
        if (i > 0) await delay(PLACES_API_DELAY_MS);

        // Ensure all values are strings and trim them
        const name = (values[activeCols.NAME] || '').toString().trim();
        const placeId = (values[activeCols.PLACE_ID] || '').toString().trim();
        const website = (values[activeCols.WEBSITE] || '').toString().trim();
        const phone = (values[activeCols.PHONE] || '').toString().trim();
        const hours = (values[activeCols.HOURS] || '').toString().trim();
        const address = (values[activeCols.ADDRESS] || '').toString().trim();
        const rating = (values[activeCols.RATING] || '').toString().trim();

        const emptyFields = [];
        if (!website) emptyFields.push('Website');
        if (!phone) emptyFields.push('Phone');
        if (!hours) emptyFields.push('Hours');
        if (!address) emptyFields.push('Address');
        if (!rating) emptyFields.push('Rating');

        if (emptyFields.length === 0) {
          results.push({
            name: name || '(no name)',
            status: 'complete',
            message: 'All fields populated'
          });
          skippedCount++;
          continue;
        }

        if (!placeId || !placeId.startsWith('ChI')) {
          results.push({
            name: name || '(no name)',
            status: 'skipped',
            message: `Missing fields: ${emptyFields.join(', ')} - but no valid Place ID`
          });
          skippedCount++;
          continue;
        }

        const details = await getPlaceDetailsFromAPI(placeId);
        let fieldsCorrected = [];

        if (!dryRun) {
          if (!website && details.website) {
            values[activeCols.WEBSITE] = details.website;
            fieldsCorrected.push('Website');
          }
          if (!phone && details.phone) {
            values[activeCols.PHONE] = details.phone;
            fieldsCorrected.push('Phone');
          }
          if (!hours && details.hours) {
            values[activeCols.HOURS] = details.hours;
            fieldsCorrected.push('Hours');
          }
          if (!address && details.address) {
            values[activeCols.ADDRESS] = details.address;
            fieldsCorrected.push('Address');
          }
          if (!rating && details.rating) {
            values[activeCols.RATING] = details.rating;
            fieldsCorrected.push('Rating');
          }

          if (fieldsCorrected.length > 0) {
            updatedCount++;
            changedRows.push(buildChangedWorkbookRow(place, i, values));
          } else {
            skippedCount++;
          }
        } else {
          fieldsCorrected = emptyFields.filter(field => {
            if (field === 'Website') return !!details.website;
            if (field === 'Phone') return !!details.phone;
            if (field === 'Hours') return !!details.hours;
            if (field === 'Address') return !!details.address;
            if (field === 'Rating') return !!details.rating;
            return false;
          });
          updatedCount++;
        }

        results.push({
          name: name || '(no name)',
          status: 'updated',
          missingFields: emptyFields,
          correctedFields: fieldsCorrected,
          message: `${fieldsCorrected.length > 0 ? 'Corrected' : 'Attempted'}: ${fieldsCorrected.join(', ') || 'no API data'}`
        });
      } catch (err) {
        console.error(`❌ Error processing ${name || '(unknown)'}:`, err);
        results.push({
          name: name || '(unknown)',
          status: 'error',
          message: err.message
        });
        errorCount++;
      }

      if ((i + 1) % 5 === 0 || i === adventuresData.length - 1) {
        const percent = Math.round(((i + 1) / adventuresData.length) * 100);
        updateDisplay(`
          <div style="padding: 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px;">
            <div style="font-weight: 600; color: #1e40af; margin-bottom: 12px;">
              ${dryRun ? '🧪 DRY RUN' : '⏳ Processing'} Populate Missing Fields
            </div>
            <div style="margin-bottom: 12px;">
              <div style="font-size: 14px; color: #1f2937; margin-bottom: 4px;">
                Progress: ${i + 1}/${adventuresData.length} (${percent}%)
              </div>
              <div style="width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
                <div style="width: ${percent}%; height: 100%; background: #3b82f6; transition: width 0.3s;"></div>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; font-size: 13px;">
              <div style="padding: 8px; background: #ecfdf5; border-radius: 4px; color: #047857;">
                ✅ Updated: ${updatedCount}
              </div>
              <div style="padding: 8px; background: #f3f4f6; border-radius: 4px; color: #4b5563;">
                ⏭️ Skipped: ${skippedCount}
              </div>
              <div style="padding: 8px; background: #fee2e2; border-radius: 4px; color: #7f1d1d;">
                ❌ Errors: ${errorCount}
              </div>
            </div>
          </div>
        `);
      }
    }

    const persistence = await persistAutomationWorkbookChanges(mainWindow, {
      operation: 'populate-missing-fields',
      dryRun,
      updatedCount,
      changedRows
    });

    // Check if Google Places API key is configured
    const apiKeyMissing = !window.GOOGLE_PLACES_API_KEY;
    const apiKeyWarning = apiKeyMissing ? `
      <div style="padding: 12px; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 4px; margin-bottom: 12px; color: #7f1d1d;">
        <strong>⚠️ GOOGLE PLACES API NOT CONFIGURED:</strong> Limited data could be fetched from Google to populate fields.
        <br><br><strong>To fix this:</strong>
        <ol style="margin: 8px 0; padding-left: 20px; font-size: 12px;">
          <li>Get a Google Places API key from <a href="https://console.cloud.google.com" target="_blank" style="color: #1e40af;">Google Cloud Console</a></li>
          <li>Enable the Places API and Maps API in your project</li>
          <li>Set window.GOOGLE_PLACES_API_KEY = 'YOUR_KEY_HERE' before running this operation</li>
          <li>Retry the populate missing fields operation</li>
        </ol>
        <br><strong>Status:</strong> ${errorCount > 0 ? '❌ API calls failed - will use fallback data' : '✅ Operation completed with available data'}
      </div>
    ` : '';

    const resultHTML = `
      ${apiKeyWarning}
      <div style="padding: 16px; background: ${errorCount === 0 ? '#ecfdf5' : '#fef3c7'}; border: 1px solid ${errorCount === 0 ? '#6ee7b7' : '#fbbf24'}; border-radius: 8px;">
        <div style="font-weight: 600; color: ${errorCount === 0 ? '#047857' : '#92400e'}; margin-bottom: 12px; font-size: 15px;">
          ${dryRun ? '🧪 DRY RUN COMPLETE' : '✅ POPULATE COMPLETE'}
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; font-size: 13px; margin-bottom: 12px;">
          <div style="padding: 8px; background: #ecfdf5; border-radius: 4px; color: #047857;">
            ✅ Updated: ${updatedCount}
          </div>
          <div style="padding: 8px; background: #f3f4f6; border-radius: 4px; color: #4b5563;">
            ⏭️ Skipped: ${skippedCount}
          </div>
          <div style="padding: 8px; background: #fee2e2; border-radius: 4px; color: #7f1d1d;">
            ❌ Errors: ${errorCount}
          </div>
        </div>
        <div style="font-size:12px; color:${persistence.persisted ? '#047857' : '#92400e'}; margin-bottom:10px;">
          💾 Workbook write: ${persistence.persisted ? 'saved to Excel' : `not persisted (${persistence.reason || persistence.mode})`}
        </div>
        <div style="max-height: 300px; overflow-y: auto; background: white; padding: 12px; border-radius: 4px; border: 1px solid #e5e7eb; font-family: monospace; font-size: 12px; color: #1f2937; margin-bottom: 12px; white-space: pre-wrap; word-break: break-all;">
          ${results.map((r, idx) => {
            const statusIcon = r.status === 'updated' ? '✅' : r.status === 'complete' ? '✔️' : r.status === 'error' ? '❌' : '⏭️';
            if (r.status === 'updated') {
              return `${idx + 1}. ${statusIcon} ${r.name}\n   Missing: ${r.missingFields.join(', ')}\n   Corrected: ${r.correctedFields.join(', ') || 'none'}`;
            }
            return `${idx + 1}. ${statusIcon} ${r.name} - ${r.message}`;
          }).join('\n')}
        </div>
        <button id="populateResultsCopyBtn" style="padding: 8px 12px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600; transition: background 0.2s;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
          📋 Copy Results to Clipboard
        </button>
      </div>
    `;
    updateDisplay(resultHTML);

    // Add copy button handler after DOM update
    setTimeout(() => {
      const copyBtn = document.getElementById('populateResultsCopyBtn');
      if (copyBtn) {
        copyBtn.onclick = () => {
          const resultsSummary = `Populate Missing Fields Results (${new Date().toLocaleString()})
Status: ${dryRun ? 'DRY RUN' : 'COMPLETED'}
- Updated: ${updatedCount}
- Skipped: ${skippedCount}
- Errors: ${errorCount}

${results.map((r, i) => {
            if (r.status === 'updated') {
              return `${i + 1}. ✅ ${r.name} - Missing: ${r.missingFields.join(', ')} Corrected: ${r.correctedFields.join(', ') || 'none'}`;
            }
            return `${i + 1}. ${r.status === 'error' ? '❌' : r.status === 'complete' ? '✔️' : '⏭️'} ${r.name} - ${r.message}`;
          }).join('\n')}`;

          navigator.clipboard.writeText(resultsSummary).then(() => {
            alert('✅ Results copied to clipboard!');
          }).catch(err => {
            console.error('Failed to copy:', err);
            alert('Failed to copy to clipboard');
          });
        };
      }
    }, 0);

    return {
      success: errorCount === 0,
      updatedCount,
      skippedCount,
      errorCount,
      results,
      dryRun,
      persisted: !!persistence.persisted,
      persistMode: persistence.mode,
      persistReason: persistence.reason,
      rowsChanged: changedRows.length,
      persistedRows: persistence.persistedRows,
      verifiedRowsChanged: persistence.verifiedRowsChanged,
      postWriteVerified: persistence.postWriteVerified,
      verificationMode: persistence.verificationMode,
      verificationReason: persistence.verificationReason
    };
  } catch (err) {
    console.error('❌ Error:', err);
    updateDisplay(`
      <div style="padding: 16px; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; color: #7f1d1d;">
        <strong>❌ Error:</strong> ${err.message}
      </div>
    `);
    return { success: false, error: err.message };
  }
};

// Alias
window.handlePopulateMissingFieldsEnhanced = window.handlePopulateMissingFields;

console.log('✅ Populate Missing Fields ready');

// ============================================================
// SECTION 4: UPDATE HOURS ONLY
// ============================================================

/**
 * Update Hours Only
 */
window.handleUpdateHoursOnly = async function(displayElement, dryRun = false) {
  console.log(`🕐 Starting update hours only, dryRun=${dryRun}`);

  if (!displayElement) {
    console.error('❌ No display element provided');
    return { success: false, error: 'No display element' };
  }

  const mainWindow = window.opener && !window.opener.closed ? window.opener : window;
  const adventuresData = mainWindow.adventuresData || window.adventuresData;

  if (!adventuresData || adventuresData.length === 0) {
    displayElement.innerHTML = `
      <div style="padding: 16px; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; color: #7f1d1d;">
        <strong>❌ Error:</strong> No data available.
      </div>
    `;
    return { success: false, error: 'No data available' };
  }

  const results = [];
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const changedRows = [];

  const updateDisplay = (status) => {
    displayElement.innerHTML = status;
  };

  updateDisplay(`
    <div style="padding: 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px;">
      <div style="font-weight: 600; color: #1e40af; margin-bottom: 12px;">
        ${dryRun ? '🧪 DRY RUN - Preview' : '⏳ Processing'} Update Hours Only
      </div>
      <div style="font-size: 14px; color: #1f2937;">
        📊 Total locations: ${adventuresData.length}
      </div>
      <div style="margin-top: 8px; padding: 8px; background: rgba(59, 130, 246, 0.1); border-radius: 4px; font-size: 12px; color: #1f2937;">
        ⏳ Fetching current hours from Google...
      </div>
    </div>
  `);

  try {
    const activeCols = getActiveCols(mainWindow);
    for (let i = 0; i < adventuresData.length; i++) {
      const place = adventuresData[i];
      const values = place.values ? place.values[0] : place;

      if (!values || values.length === 0) {
        skippedCount++;
        continue;
      }

      try {
        if (i > 0) await delay(PLACES_API_DELAY_MS);

        const name = values[activeCols.NAME] || '';
        const placeId = values[activeCols.PLACE_ID] || '';
        const currentHours = values[activeCols.HOURS] || '';

        if (!placeId || !String(placeId).startsWith('ChI')) {
          results.push({
            name,
            status: 'skipped',
            message: 'No valid Place ID'
          });
          skippedCount++;
          continue;
        }

        const details = await getPlaceDetailsFromAPI(placeId);

        if (!details.hours) {
          results.push({
            name,
            status: 'skipped',
            message: 'No hours available from Google'
          });
          skippedCount++;
          continue;
        }

        if (!dryRun) {
          values[activeCols.HOURS] = details.hours;
          updatedCount++;
          changedRows.push(buildChangedWorkbookRow(place, i, values));
        } else {
          updatedCount++;
        }

        results.push({
          name,
          status: 'updated',
          oldHours: currentHours || '(empty)',
          newHours: details.hours,
          message: `Hours updated: ${details.hours}`
        });
      } catch (err) {
        console.error(`❌ Error updating ${values[0]}:`, err);
        results.push({
          name: values[COLS.NAME],
          status: 'error',
          message: err.message
        });
        errorCount++;
      }

      if ((i + 1) % 5 === 0 || i === adventuresData.length - 1) {
        const percent = Math.round(((i + 1) / adventuresData.length) * 100);
        updateDisplay(`
          <div style="padding: 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px;">
            <div style="font-weight: 600; color: #1e40af; margin-bottom: 12px;">
              ${dryRun ? '🧪 DRY RUN' : '⏳ Processing'} Update Hours Only
            </div>
            <div style="margin-bottom: 12px;">
              <div style="font-size: 14px; color: #1f2937; margin-bottom: 4px;">
                Progress: ${i + 1}/${adventuresData.length} (${percent}%)
              </div>
              <div style="width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
                <div style="width: ${percent}%; height: 100%; background: #3b82f6; transition: width 0.3s;"></div>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; font-size: 13px;">
              <div style="padding: 8px; background: #ecfdf5; border-radius: 4px; color: #047857;">
                ✅ Updated: ${updatedCount}
              </div>
              <div style="padding: 8px; background: #f3f4f6; border-radius: 4px; color: #4b5563;">
                ⏭️ Skipped: ${skippedCount}
              </div>
              <div style="padding: 8px; background: #fee2e2; border-radius: 4px; color: #7f1d1d;">
                ❌ Errors: ${errorCount}
              </div>
            </div>
          </div>
        `);
      }
    }

    const persistence = await persistAutomationWorkbookChanges(mainWindow, {
      operation: 'update-hours-only',
      dryRun,
      updatedCount,
      changedRows
    });

    const resultHTML = `
      <div style="padding: 16px; background: ${errorCount === 0 ? '#ecfdf5' : '#fef3c7'}; border: 1px solid ${errorCount === 0 ? '#6ee7b7' : '#fbbf24'}; border-radius: 8px;">
        <div style="font-weight: 600; color: ${errorCount === 0 ? '#047857' : '#92400e'}; margin-bottom: 12px; font-size: 15px;">
          ${dryRun ? '🧪 DRY RUN COMPLETE' : '✅ HOURS UPDATE COMPLETE'}
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; font-size: 13px; margin-bottom: 12px;">
          <div style="padding: 8px; background: #ecfdf5; border-radius: 4px; color: #047857;">
            ✅ Updated: ${updatedCount}
          </div>
          <div style="padding: 8px; background: #f3f4f6; border-radius: 4px; color: #4b5563;">
            ⏭️ Skipped: ${skippedCount}
          </div>
          <div style="padding: 8px; background: #fee2e2; border-radius: 4px; color: #7f1d1d;">
            ❌ Errors: ${errorCount}
          </div>
        </div>
        <div style="font-size:12px; color:${persistence.persisted ? '#047857' : '#92400e'}; margin-bottom:10px;">
          💾 Workbook write: ${persistence.persisted ? 'saved to Excel' : `not persisted (${persistence.reason || persistence.mode})`}
        </div>
        <div style="max-height: 300px; overflow-y: auto; background: white; padding: 12px; border-radius: 4px; border: 1px solid #e5e7eb; font-family: monospace; font-size: 12px; color: #1f2937; margin-bottom: 12px; white-space: pre-wrap; word-break: break-all;">
          ${results.map((r, idx) => {
            const statusIcon = r.status === 'updated' ? '✅' : r.status === 'error' ? '❌' : '⏭️';
            if (r.status === 'updated') {
              return `${idx + 1}. ${statusIcon} ${r.name}\n   Old: ${r.oldHours}\n   New: ${r.newHours}`;
            }
            return `${idx + 1}. ${statusIcon} ${r.name} - ${r.message}`;
          }).join('\n')}
        </div>
        <button id="hoursResultsCopyBtn" style="padding: 8px 12px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600; transition: background 0.2s;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
          📋 Copy Results to Clipboard
        </button>
      </div>
    `;
    updateDisplay(resultHTML);

    // Add copy button handler after DOM update
    setTimeout(() => {
      const copyBtn = document.getElementById('hoursResultsCopyBtn');
      if (copyBtn) {
        copyBtn.onclick = () => {
          const resultsSummary = `Update Hours Results (${new Date().toLocaleString()})
Status: ${dryRun ? 'DRY RUN' : 'COMPLETED'}
- Updated: ${updatedCount}
- Skipped: ${skippedCount}
- Errors: ${errorCount}

${results.map((r, i) => {
            if (r.status === 'updated') {
              return `${i + 1}. ✅ ${r.name} - Old: ${r.oldHours} New: ${r.newHours}`;
            }
            return `${i + 1}. ${r.status === 'error' ? '❌' : '⏭️'} ${r.name} - ${r.message}`;
          }).join('\n')}`;

          navigator.clipboard.writeText(resultsSummary).then(() => {
            alert('✅ Results copied to clipboard!');
          }).catch(err => {
            console.error('Failed to copy:', err);
            alert('Failed to copy to clipboard');
          });
        };
      }
    }, 0);

    return {
      success: errorCount === 0,
      updatedCount,
      skippedCount,
      errorCount,
      results,
      dryRun,
      persisted: !!persistence.persisted,
      persistMode: persistence.mode,
      persistReason: persistence.reason,
      rowsChanged: changedRows.length,
      persistedRows: persistence.persistedRows,
      verifiedRowsChanged: persistence.verifiedRowsChanged,
      postWriteVerified: persistence.postWriteVerified,
      verificationMode: persistence.verificationMode,
      verificationReason: persistence.verificationReason
    };
  } catch (err) {
    console.error('❌ Error:', err);
    updateDisplay(`
      <div style="padding: 16px; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; color: #7f1d1d;">
        <strong>❌ Error:</strong> ${err.message}
      </div>
    `);
    return { success: false, error: err.message };
  }
};

// Alias
window.handleUpdateHoursOnlyEnhanced = window.handleUpdateHoursOnly;

console.log('✅ Update Hours Only ready');

// ============================================================
// SECTION 6: M365 EXCEL WRITE INTEGRATION
// ============================================================
// Provides methods to write refreshed data back to M365 Excel

/**
 * Write updated place details back to M365 Excel row
 * Uses the same Office.js approach as bulk add operations
 */
window.writeUpdatedPlaceToM365 = async function(rowIndex, placeData) {
  return new Promise((resolve, reject) => {
    try {
      // Get reference to main window if in edit mode
      const mainWindow = window.opener && !window.opener.closed ? window.opener : window;

      // Check if Office.js context is available
      if (typeof Office !== 'undefined' &&
          typeof Office.onReady !== 'undefined' &&
          typeof Excel !== 'undefined') {

        Excel.run(async (context) => {
          try {
            const sheet = context.workbook.worksheets.getActiveWorksheet();

            // Calculate the actual row number (assuming row 1 is headers)
            const excelRow = rowIndex + 2;

            // Build the range of cells to update
            const range = sheet.getRange(`A${excelRow}:P${excelRow}`);

            // Prepare the data in column order matching COLS definition
            const rowData = [[
              placeData.name || '',           // Column A (NAME)
              placeData.placeId || '',        // Column B (PLACE_ID)
              placeData.website || '',        // Column C (WEBSITE)
              placeData.phone || '',          // Column D (PHONE)
              placeData.hours || '',          // Column E (HOURS)
              '',                             // Column F (unused)
              '',                             // Column G (unused)
              '',                             // Column H (unused)
              '',                             // Column I (unused)
              '',                             // Column J (unused)
              '',                             // Column K (unused)
              placeData.address || '',        // Column L (ADDRESS)
              '',                             // Column M (unused)
              placeData.rating || '',         // Column N (RATING)
              '',                             // Column O (unused)
              placeData.directions || ''      // Column P (DIRECTIONS)
            ]];

            range.values = rowData;

            await context.sync();

            console.log(`✅ Updated M365 row ${excelRow}: ${placeData.name}`);
            resolve({
              success: true,
              message: `Updated row ${excelRow}`,
              rowIndex,
              location: placeData.name
            });

          } catch (err) {
            console.error(`❌ Error updating M365 row ${rowIndex}:`, err);
            reject({
              success: false,
              error: err.message,
              rowIndex
            });
          }
        });

      } else {
        // Office.js not available - provide guidance
        console.warn(`⚠️ Office.js not available for row ${rowIndex}`);
        resolve({
          success: false,
          message: 'Office.js context not available. Data updates available in browser memory only.',
          rowIndex,
          note: 'User should manually copy-paste results to Excel'
        });
      }

    } catch (error) {
      console.error(`❌ Error in writeUpdatedPlaceToM365:`, error);
      reject({
        success: false,
        error: error.message,
        rowIndex
      });
    }
  });
};

/**
 * Batch write multiple updated rows to M365 Excel
 */
window.writeBatchPlacesToM365 = async function(placesData) {
  console.log(`📝 Writing ${placesData.length} place updates to M365 Excel...`);

  return new Promise((resolve, reject) => {
    try {
      if (typeof Office !== 'undefined' &&
          typeof Excel !== 'undefined') {

        Excel.run(async (context) => {
          try {
            const sheet = context.workbook.worksheets.getActiveWorksheet();
            let successCount = 0;
            let failCount = 0;

            for (let i = 0; i < placesData.length; i++) {
              const placeData = placesData[i];
              const excelRow = placeData.rowIndex + 2;

              try {
                const range = sheet.getRange(`A${excelRow}:P${excelRow}`);

                const rowData = [[
                  placeData.name || '',
                  placeData.placeId || '',
                  placeData.website || '',
                  placeData.phone || '',
                  placeData.hours || '',
                  '',
                  '',
                  '',
                  '',
                  '',
                  '',
                  placeData.address || '',
                  '',
                  placeData.rating || '',
                  '',
                  placeData.directions || ''
                ]];

                range.values = rowData;
                successCount++;

              } catch (err) {
                console.warn(`⚠️ Skipped row ${excelRow}:`, err.message);
                failCount++;
              }
            }

            await context.sync();

            console.log(`✅ Batch write complete: ${successCount} updated, ${failCount} failed`);
            resolve({
              success: true,
              successCount,
              failCount,
              totalCount: placesData.length
            });

          } catch (err) {
            console.error(`❌ Error in batch write:`, err);
            reject({
              success: false,
              error: err.message
            });
          }
        });

      } else {
        console.warn(`⚠️ Office.js not available for batch write`);
        resolve({
          success: false,
          message: 'Office.js context not available',
          note: 'Data available in browser memory. User should copy-paste to Excel.'
        });
      }

    } catch (error) {
      console.error(`❌ Error in writeBatchPlacesToM365:`, error);
      reject({
        success: false,
        error: error.message
      });
    }
  });
};

console.log('✅ M365 Excel Write Integration ready');

// ============================================================
// SECTION 7: UPDATE ALL DESCRIPTIONS
// ============================================================

/**
 * Update description fields for all locations using Google Places API.
 * Only fills empty descriptions unless overwrite=true.
 */
window.handleUpdateAllDescriptions = async function(displayElement, dryRun = false, overwrite = false, strictModeOverride) {
  const strictVerification = resolveUpdateDescriptionsStrictVerification(strictModeOverride);
  const strictVerificationMode = strictVerification ? 'fail-closed' : 'warn-only';
  console.log(`📝 Starting update descriptions, dryRun=${dryRun}, overwrite=${overwrite}, strictMode=${strictVerificationMode}`);

  if (!displayElement) return { success: false, error: 'No display element' };

  const mainWindow = window.opener && !window.opener.closed ? window.opener : window;
  const adventuresData = mainWindow.adventuresData || window.adventuresData;

  if (!adventuresData || adventuresData.length === 0) {
    displayElement.innerHTML = `<div style="padding:16px;background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;color:#7f1d1d;"><strong>❌ Error:</strong> No data available.</div>`;
    return { success: false, error: 'No data available' };
  }

  const activeCols = getActiveCols(mainWindow);
  const schemaColumns = Array.isArray(mainWindow.__excelSchemaColumns) ? mainWindow.__excelSchemaColumns : [];
  const descriptionSchemaCol = schemaColumns.find((col) => Number(col && col.index) === Number(activeCols.DESCRIPTION));
  const resolvedColsDebug = {
    target: (document.getElementById('automationTargetSelect') || {}).value || '',
    descriptionIndex: activeCols.DESCRIPTION,
    descriptionColumnName: descriptionSchemaCol && descriptionSchemaCol.name ? String(descriptionSchemaCol.name) : '',
    activeCols
  };
  const operationRunId = `update-descriptions-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  window.__lastUpdateDescriptionsActiveCols = resolvedColsDebug;
  window.__lastUpdateDescriptionsRunId = operationRunId;
  console.info('🧭 Update Descriptions resolved columns:', resolvedColsDebug);
  pushWorkbookWriteDebug('update-descriptions-start', {
    operationRunId,
    dryRun: !!dryRun,
    overwrite: !!overwrite,
    strictVerification,
    strictVerificationMode,
    descriptionIndex: Number(activeCols.DESCRIPTION),
    descriptionColumnName: String(resolvedColsDebug.descriptionColumnName || ''),
    totalRows: adventuresData.length
  });
  const results = [];
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const previewItems = [];
  const changedRows = [];
  const rowAuditTrail = [];

  const escapeHtml = (value) => String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const truncateText = (value, maxLen = 180) => {
    const text = String(value == null ? '' : value).trim();
    if (text.length <= maxLen) return text;
    return `${text.slice(0, Math.max(0, maxLen - 1)).trim()}…`;
  };

  const buildPreviewHtml = () => {
    if (!previewItems.length) return '';
    window.__lastDescriptionPreviewItems = previewItems.slice(0, 3).map((item) => ({
      name: String(item && item.name || '').trim(),
      description: String(item && item.description || '').trim()
    }));
    return `<div style="margin-top:12px;padding:12px;background:#ffffff;border:1px solid #d1fae5;border-radius:8px;">`
      + `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px;">`
      + `<div style="font-weight:600;color:#065f46;">Preview of updated descriptions</div>`
      + `<button type="button" onclick="window.copyDescriptionPreviewText && window.copyDescriptionPreviewText()" style="padding:6px 10px;border:1px solid #a7f3d0;border-radius:6px;background:#ecfdf5;color:#065f46;font-size:12px;font-weight:600;cursor:pointer;">📋 Copy preview text</button>`
      + `</div>`
      + previewItems.slice(0, 3).map((item, index) => {
        const label = dryRun ? 'Would set' : 'Set';
        return `<div style="${index > 0 ? 'margin-top:10px;padding-top:10px;border-top:1px solid #ecfdf5;' : ''}">`
          + `<div style="font-size:12px;font-weight:600;color:#1f2937;">${escapeHtml(item.name || '(no name)')}</div>`
          + `<div style="font-size:12px;color:#4b5563;line-height:1.5;margin-top:4px;">${label}: ${escapeHtml(truncateText(item.description, 220))}</div>`
          + `</div>`;
      }).join('')
      + `</div>`;
  };

  const updateDisplay = (status) => { displayElement.innerHTML = status; };

  updateDisplay(`<div style="padding:16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;">
    <div style="font-weight:600;color:#1e40af;margin-bottom:12px;">${dryRun ? '🧪 DRY RUN – Preview' : '⏳ Processing'} Update Descriptions${overwrite ? ' (overwrite all)' : ' (missing only)'}</div>
    <div style="font-size:14px;color:#1f2937;">📊 Total locations: ${adventuresData.length}</div>
    <div style="margin-top:8px;padding:8px;background:rgba(59,130,246,0.1);border-radius:4px;font-size:12px;color:#1f2937;">⏳ Scanning descriptions…</div>
  </div>`);

  try {
    const requirePreflight = true;
    const preflight = dryRun
      ? { ok: true, reason: 'dry-run-skipped', detail: 'preflight-skipped-for-dry-run', operationRunId }
      : await preflightValidateDescriptionWriteTarget(mainWindow, {
          operationRunId,
          descriptionColumnIndex: Number(activeCols.DESCRIPTION),
          descriptionColumnName: String(resolvedColsDebug.descriptionColumnName || '')
        });
    pushWorkbookWriteDebug('update-descriptions-preflight', {
      operationRunId,
      stage: 'handler',
      ok: !!preflight.ok,
      reason: String(preflight.reason || ''),
      detail: String(preflight.detail || ''),
      writeTarget: preflight.writeTarget || null,
      expectedDescriptionColumnIndex: Number(activeCols.DESCRIPTION),
      expectedDescriptionColumnName: String(resolvedColsDebug.descriptionColumnName || '')
    });

    if (!preflight.ok) {
      window.__lastUpdateDescriptionsAudit = {
        at: new Date().toISOString(),
        operationRunId,
        overwrite: !!overwrite,
        dryRun: !!dryRun,
        strictVerification,
        strictVerificationMode,
        preflight,
        rowAuditTrail: [],
        perRowWriteLog: []
      };
      updateDisplay(`<div style="padding:16px;background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;color:#7f1d1d;">
        <div style="font-weight:700;">❌ Update Descriptions blocked by preflight check</div>
        <div style="margin-top:6px;font-size:12px;">Reason: ${escapeHtml(String(preflight.detail || preflight.reason || 'schema mismatch'))}</div>
        <div style="margin-top:4px;font-size:12px;">Target: ${escapeHtml(`${String(preflight?.writeTarget?.resolvedFilePath || '')} | ${String(preflight?.writeTarget?.tableName || '')}`)}</div>
      </div>`);
      return {
        success: false,
        runFailed: true,
        operationRunId,
        strictVerification,
        strictVerificationMode,
        preflight,
        error: String(preflight.detail || preflight.reason || 'preflight-failed')
      };
    }

    for (let i = 0; i < adventuresData.length; i++) {
      const place = adventuresData[i];
      const values = place.values ? place.values[0] : place;
      if (!values || values.length === 0) { skippedCount++; continue; }

      try {
        if (i > 0) await delay(PLACES_API_DELAY_MS);

        const name = (values[activeCols.NAME] || '').toString().trim();
        const placeId = (values[activeCols.PLACE_ID] || '').toString().trim();
        const existingDesc = (values[activeCols.DESCRIPTION] || '').toString().trim();
        const baseAudit = {
          rowIndex: i,
          name,
          placeId,
          descriptionColumnIndex: Number(activeCols.DESCRIPTION),
          descriptionColumnName: String(resolvedColsDebug.descriptionColumnName || ''),
          descriptionBefore: existingDesc
        };

        if (!overwrite && existingDesc) {
          rowAuditTrail.push({ ...baseAudit, status: 'skipped', reason: 'already-has-description' });
          pushWorkbookWriteDebug('update-descriptions-row-skipped', {
            ...baseAudit,
            reason: 'already-has-description'
          });
          results.push({ name: name || '(no name)', status: 'skipped', message: 'Already has description' });
          skippedCount++;
          continue;
        }

        if (!placeId || !placeId.startsWith('ChI')) {
          rowAuditTrail.push({ ...baseAudit, status: 'skipped', reason: 'invalid-place-id' });
          pushWorkbookWriteDebug('update-descriptions-row-skipped', {
            ...baseAudit,
            reason: 'invalid-place-id'
          });
          results.push({ name: name || '(no name)', status: 'skipped', message: 'No valid Place ID' });
          skippedCount++;
          continue;
        }

        const details = await getPlaceDetailsFromAPI(placeId);
        const newDesc = (details && details.description) ? details.description.trim() : '';

        // Fallback: generate a basic description from name + location data
        const generatedDesc = newDesc || (() => {
          const city = (values[activeCols.CITY] || '').toString().trim();
          const state = (values[activeCols.STATE] || '').toString().trim();
          const rating = (values[activeCols.RATING] || '').toString().trim();
          if (!name) return '';
          let desc = name;
          if (city && state) desc += ` is located in ${city}, ${state}.`;
          else if (city) desc += ` is located in ${city}.`;
          if (rating) desc += ` Google Rating: ${rating}.`;
          return desc;
        })();

        let descriptionSource = 'none';
        if (newDesc) {
          descriptionSource = /\bRated\s+[0-9.]+★/i.test(newDesc) || /\([0-9,]+\s+reviews\)/i.test(newDesc)
            ? 'google-details-fallback-summary'
            : 'google-details-editorial-or-reviews';
        } else if (generatedDesc) {
          descriptionSource = 'local-fallback-name-city-rating';
        }

        if (!dryRun && generatedDesc) {
          values[activeCols.DESCRIPTION] = generatedDesc;

          // Compatibility: some legacy UI flows still read description from index 16.
          // Mirror only when that slot is empty or clearly auto-generated placeholder text.
          if (COLS.DESCRIPTION !== activeCols.DESCRIPTION && COLS.DESCRIPTION < values.length) {
            const legacyValue = values[COLS.DESCRIPTION];
            if (isAutoGeneratedDescriptionPlaceholder(legacyValue)) {
              values[COLS.DESCRIPTION] = generatedDesc;
            }
          }

          updatedCount++;
          const rowMeta = {
            operation: 'update-descriptions',
            name,
            placeId,
            descriptionBefore: existingDesc,
            descriptionAfter: generatedDesc,
            descriptionSource,
            descriptionColumnIndex: Number(activeCols.DESCRIPTION),
            descriptionColumnName: String(resolvedColsDebug.descriptionColumnName || '')
          };
          changedRows.push(buildChangedWorkbookRow(place, i, values, rowMeta));
          rowAuditTrail.push({ ...baseAudit, status: 'updated', descriptionAfter: generatedDesc, descriptionSource });
          pushWorkbookWriteDebug('update-descriptions-row-prepared', {
            ...baseAudit,
            descriptionAfter: generatedDesc,
            descriptionSource
          });
          results.push({ name, status: 'updated', message: `Set description (${generatedDesc.length} chars)` });
          if (previewItems.length < 3) {
            previewItems.push({ name: name || '(no name)', description: generatedDesc });
          }
        } else if (dryRun && generatedDesc) {
          updatedCount++;
          rowAuditTrail.push({ ...baseAudit, status: 'would-update', descriptionAfter: generatedDesc, descriptionSource });
          pushWorkbookWriteDebug('update-descriptions-row-would-update', {
            ...baseAudit,
            descriptionAfter: generatedDesc,
            descriptionSource
          });
          results.push({ name, status: 'would-update', message: `Would set: "${generatedDesc.slice(0, 60)}…"` });
          if (previewItems.length < 3) {
            previewItems.push({ name: name || '(no name)', description: generatedDesc });
          }
        } else {
          skippedCount++;
          rowAuditTrail.push({ ...baseAudit, status: 'skipped', reason: 'no-description-generated' });
          pushWorkbookWriteDebug('update-descriptions-row-skipped', {
            ...baseAudit,
            reason: 'no-description-generated'
          });
          results.push({ name, status: 'skipped', message: 'No description available from API' });
        }
      } catch (e) {
        errorCount++;
        rowAuditTrail.push({ rowIndex: i, status: 'error', error: String(e && e.message ? e.message : e) });
        pushWorkbookWriteDebug('update-descriptions-row-error', {
          rowIndex: i,
          error: String(e && e.message ? e.message : e)
        });
        results.push({ name: '(error)', status: 'error', message: e.message });
      }
    }

    const persistence = await persistAutomationWorkbookChanges(mainWindow, {
      operation: 'update-descriptions',
      operationRunId,
      dryRun,
      updatedCount,
      changedRows,
      enableDescriptionReadback: true,
      strictVerification,
      requirePreflight,
      descriptionColumnIndex: Number(activeCols.DESCRIPTION),
      descriptionColumnName: String(resolvedColsDebug.descriptionColumnName || '')
    });
    const writeTargetLabel = persistence && persistence.writeTarget
      ? `${String(persistence.writeTarget.resolvedFilePath || '')} | ${String(persistence.writeTarget.tableName || '')}`
      : '(not available)';
    window.__lastUpdateDescriptionsAudit = {
      at: new Date().toISOString(),
      operationRunId,
      overwrite: !!overwrite,
      dryRun: !!dryRun,
      strictVerification,
      strictVerificationMode,
      descriptionIndex: Number(activeCols.DESCRIPTION),
      descriptionColumnName: String(resolvedColsDebug.descriptionColumnName || ''),
      writeTarget: persistence.writeTarget || null,
      preflight: persistence.preflight || preflight,
      diagnosticSummary: persistence.diagnosticSummary || null,
      rowAuditTrail,
      perRowWriteLog: Array.isArray(persistence.perRowWriteLog) ? persistence.perRowWriteLog : []
    };
    pushWorkbookWriteDebug('update-descriptions-operation-summary', {
      operationRunId,
      overwrite: !!overwrite,
      dryRun: !!dryRun,
      updatedCount,
      skippedCount,
      errorCount,
      descriptionColumnIndex: Number(activeCols.DESCRIPTION),
      descriptionColumnName: String(resolvedColsDebug.descriptionColumnName || ''),
      writeTarget: persistence.writeTarget || null,
      persistedRows: Number(persistence.persistedRows || 0),
      verifiedRowsChanged: Number(persistence.verifiedRowsChanged || 0),
      runFailed: !!persistence.runFailed,
      strictVerification,
      strictVerificationMode,
      diagnosticSummary: persistence.diagnosticSummary || null
    });
    const canDownloadAuditCsv = !dryRun && Array.isArray(persistence.perRowWriteLog) && persistence.perRowWriteLog.length > 0;
    const diag = persistence.diagnosticSummary || {};
    const strictRunFailed = !!persistence.runFailed;
    const completedTitle = strictRunFailed
      ? '❌ Complete with Verification Failure – Update Descriptions'
      : (dryRun ? '🧪 Dry Run Complete – Update Descriptions' : '✅ Complete – Update Descriptions');

    updateDisplay(`<div style="padding:16px;background:${strictRunFailed ? '#fef2f2' : '#f0fdf4'};border:1px solid ${strictRunFailed ? '#fecaca' : '#bbf7d0'};border-radius:8px;">
      <div style="font-weight:600;color:${strictRunFailed ? '#991b1b' : '#166534'};margin-bottom:8px;">${completedTitle}</div>
      <div style="font-size:13px;color:#374151;">✅ Updated: ${updatedCount} &nbsp; ⏭ Skipped: ${skippedCount} &nbsp; ❌ Errors: ${errorCount}</div>
      <div style="font-size:12px;color:${persistence.persisted ? '#047857' : '#92400e'};margin-top:8px;">💾 Workbook write: ${persistence.persisted ? 'saved to Excel' : `not persisted (${persistence.reason || persistence.mode})`}</div>
      <div style="font-size:12px;color:#1f2937;margin-top:6px;">🗂️ Target: ${escapeHtml(writeTargetLabel)}</div>
      <div style="font-size:12px;color:#1f2937;margin-top:4px;">🔎 Description read-back verified: ${Number(persistence.verifiedRowsChanged || 0)}/${Number(persistence.persistedRows || 0)}</div>
      <div style="font-size:12px;color:${strictRunFailed ? '#991b1b' : '#1f2937'};margin-top:4px;">🛡️ Strict mode: ${escapeHtml(strictVerificationMode)} (${strictVerification ? 'fail-closed' : 'warn-only'}) • ${strictRunFailed ? 'FAILED' : 'passed'}${strictRunFailed ? ` (${Number(diag.unresolvedReadbackCount || 0)} unresolved issue(s))` : ''}</div>
      <div style="font-size:12px;color:#1f2937;margin-top:4px;">🧪 Reliability: retries recovered ${Number(diag.retryRecoveredCount || 0)}, readback mismatches ${Number(diag.readbackMismatchCount || 0)}, readback errors ${Number(diag.readbackErrorCount || 0)}, patch errors ${Number(diag.patchErrorCount || 0)}</div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:10px;">
        <button type="button" ${canDownloadAuditCsv ? '' : 'disabled'} onclick="(function(){ const out = window.downloadLastUpdateDescriptionsPerRowWriteLogCsv && window.downloadLastUpdateDescriptionsPerRowWriteLogCsv(); if (!out || !out.ok) { alert('No CSV audit is available for this run.'); } })();" style="padding:6px 10px;border:1px solid #86efac;border-radius:6px;background:#f0fdf4;color:#166534;font-size:12px;font-weight:600;cursor:pointer;">📥 Download CSV Audit</button>
        <button type="button" onclick="window.copyLastUpdateDescriptionsAuditJson && window.copyLastUpdateDescriptionsAuditJson();" style="padding:6px 10px;border:1px solid #bfdbfe;border-radius:6px;background:#eff6ff;color:#1d4ed8;font-size:12px;font-weight:600;cursor:pointer;">📋 Copy Audit JSON</button>
      </div>
      ${buildPreviewHtml()}
    </div>`);

    return {
      success: !strictRunFailed,
      runFailed: strictRunFailed,
      updatedCount,
      skippedCount,
      errorCount,
      results,
      dryRun,
      previewItems: previewItems.slice(),
      persisted: !!persistence.persisted,
      persistMode: persistence.mode,
      persistReason: persistence.reason,
      rowsChanged: changedRows.length,
      persistedRows: persistence.persistedRows,
      verifiedRowsChanged: persistence.verifiedRowsChanged,
      postWriteVerified: persistence.postWriteVerified,
      verificationMode: persistence.verificationMode,
      verificationReason: persistence.verificationReason,
      operationRunId,
      strictVerification,
      strictVerificationMode,
      descriptionIndex: Number(activeCols.DESCRIPTION),
      descriptionColumnName: String(resolvedColsDebug.descriptionColumnName || ''),
      writeTarget: persistence.writeTarget || null,
      preflight: persistence.preflight || preflight,
      diagnosticSummary: persistence.diagnosticSummary || null,
      perRowWriteLog: Array.isArray(persistence.perRowWriteLog) ? persistence.perRowWriteLog : [],
      rowAuditTrailCount: rowAuditTrail.length
    };
  } catch (err) {
    console.error('❌ Error updating descriptions:', err);
    updateDisplay(`<div style="padding:16px;background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;color:#7f1d1d;"><strong>❌ Error:</strong> ${err.message}</div>`);
    return { success: false, error: err.message };
  }
};

window.handleUpdateAllDescriptionsEnhanced = window.handleUpdateAllDescriptions;

console.log('✅ Update All Descriptions ready');

// ============================================================
// SECTION 8: FORCE UPDATE ALL FIELDS
// ============================================================

/**
 * Force-refresh all fields for every location regardless of existing data.
 */
window.handleForceUpdateAllFields = async function(displayElement, dryRun = false) {
  console.log(`🔄 Starting force-update all fields, dryRun=${dryRun}`);

  if (!displayElement) return { success: false, error: 'No display element' };

  const mainWindow = window.opener && !window.opener.closed ? window.opener : window;
  const adventuresData = mainWindow.adventuresData || window.adventuresData;

  if (!adventuresData || adventuresData.length === 0) {
    displayElement.innerHTML = `<div style="padding:16px;background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;color:#7f1d1d;"><strong>❌ Error:</strong> No data available.</div>`;
    return { success: false, error: 'No data available' };
  }

  const activeCols = getActiveCols(mainWindow);
  const results = [];
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const changedRows = [];

  const updateDisplay = (status) => { displayElement.innerHTML = status; };

  updateDisplay(`<div style="padding:16px;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;">
    <div style="font-weight:600;color:#9a3412;margin-bottom:12px;">${dryRun ? '🧪 DRY RUN – Preview' : '⏳ Processing'} Force Update All Fields</div>
    <div style="font-size:14px;color:#1f2937;">📊 Total locations: ${adventuresData.length}</div>
    <div style="margin-top:8px;padding:8px;background:rgba(251,146,60,0.1);border-radius:4px;font-size:12px;color:#1f2937;">⚠️ This will overwrite existing data with fresh data from Google Places API.</div>
  </div>`);

  try {
    for (let i = 0; i < adventuresData.length; i++) {
      const place = adventuresData[i];
      const values = place.values ? place.values[0] : place;
      if (!values || values.length === 0) { skippedCount++; continue; }

      try {
        if (i > 0) await delay(PLACES_API_DELAY_MS);

        const name = (values[activeCols.NAME] || '').toString().trim();
        const placeId = (values[activeCols.PLACE_ID] || '').toString().trim();

        if (!placeId || !placeId.startsWith('ChI')) {
          results.push({ name: name || '(no name)', status: 'skipped', message: 'No valid Place ID' });
          skippedCount++;
          continue;
        }

        const details = await getPlaceDetailsFromAPI(placeId);
        const updated = [];

        if (!dryRun) {
          if (details.website) { values[activeCols.WEBSITE] = details.website; updated.push('Website'); }
          if (details.phone) { values[activeCols.PHONE] = details.phone; updated.push('Phone'); }
          if (details.hours) { values[activeCols.HOURS] = details.hours; updated.push('Hours'); }
          if (details.address) { values[activeCols.ADDRESS] = details.address; updated.push('Address'); }
          if (details.rating) { values[activeCols.RATING] = details.rating; updated.push('Rating'); }
          if (details.description) { values[activeCols.DESCRIPTION] = details.description; updated.push('Description'); }

          if (updated.length > 0) {
            updatedCount++;
            changedRows.push(buildChangedWorkbookRow(place, i, values));
            results.push({ name, status: 'updated', message: `Updated: ${updated.join(', ')}` });
          } else {
            skippedCount++;
            results.push({ name, status: 'skipped', message: 'No new data from API' });
          }
        } else {
          const preview = [];
          if (details.website) preview.push('Website');
          if (details.phone) preview.push('Phone');
          if (details.hours) preview.push('Hours');
          if (details.address) preview.push('Address');
          if (details.rating) preview.push('Rating');
          if (details.description) preview.push('Description');
          if (preview.length > 0) {
            updatedCount++;
            results.push({ name, status: 'would-update', message: `Would update: ${preview.join(', ')}` });
          } else {
            skippedCount++;
            results.push({ name, status: 'skipped', message: 'No new data from API' });
          }
        }
      } catch (e) {
        errorCount++;
        results.push({ name: '(error)', status: 'error', message: e.message });
      }
    }

    const persistence = await persistAutomationWorkbookChanges(mainWindow, {
      operation: 'force-update-all-fields',
      dryRun,
      updatedCount,
      changedRows
    });

    updateDisplay(`<div style="padding:16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;">
      <div style="font-weight:600;color:#166534;margin-bottom:8px;">${dryRun ? '🧪 Dry Run Complete' : '✅ Complete'} – Force Update All Fields</div>
      <div style="font-size:13px;color:#374151;">✅ Updated: ${updatedCount} &nbsp; ⏭ Skipped: ${skippedCount} &nbsp; ❌ Errors: ${errorCount}</div>
      <div style="font-size:12px;color:${persistence.persisted ? '#047857' : '#92400e'};margin-top:8px;">💾 Workbook write: ${persistence.persisted ? 'saved to Excel' : `not persisted (${persistence.reason || persistence.mode})`}</div>
    </div>`);

    return { success: true, updatedCount, skippedCount, errorCount, results, dryRun, persisted: !!persistence.persisted, persistMode: persistence.mode, persistReason: persistence.reason, rowsChanged: changedRows.length, persistedRows: persistence.persistedRows, verifiedRowsChanged: persistence.verifiedRowsChanged, postWriteVerified: persistence.postWriteVerified, verificationMode: persistence.verificationMode, verificationReason: persistence.verificationReason };
  } catch (err) {
    console.error('❌ Error force-updating fields:', err);
    updateDisplay(`<div style="padding:16px;background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;color:#7f1d1d;"><strong>❌ Error:</strong> ${err.message}</div>`);
    return { success: false, error: err.message };
  }
};

window.handleForceUpdateAllFieldsEnhanced = window.handleForceUpdateAllFields;

console.log('✅ Force Update All Fields ready');

// ============================================================
// INITIALIZATION
// ============================================================

console.log('✅ Consolidated Bulk Operations System v7.0.141 Loaded');
console.log('  - Bulk Add Chain Locations');
console.log('  - Populate Missing Fields');
console.log('  - Update Hours Only');
console.log('  - Google Places API Integration');
console.log('  - Real-time progress tracking');
console.log('  - Excel verification');
console.log('  - Results copying');

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    handleBulkAddChainLocations: window.handleBulkAddChainLocations,
    handlePopulateMissingFields: window.handlePopulateMissingFields,
    handleUpdateHoursOnly: window.handleUpdateHoursOnly
  };
}

