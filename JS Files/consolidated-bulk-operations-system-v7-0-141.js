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
const UPDATE_DESCRIPTIONS_RICH_ONLY_STORAGE_KEY = 'updateDescriptionsRichOnly';

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

function resolveUpdateDescriptionsRichOnly(value) {
  if (typeof value === 'boolean') return value;
  const text = String(value == null ? '' : value).trim().toLowerCase();
  if (text === 'on' || text === 'true' || text === '1' || text === 'rich-only') return true;
  if (text === 'off' || text === 'false' || text === '0') return false;
  try {
    const stored = String(localStorage.getItem(UPDATE_DESCRIPTIONS_RICH_ONLY_STORAGE_KEY) || '').trim().toLowerCase();
    if (stored === 'on' || stored === 'true' || stored === '1' || stored === 'rich-only') return true;
    if (stored === 'off' || stored === 'false' || stored === '0') return false;
  } catch (_error) {}
  return false;
}

window.getUpdateDescriptionsRichOnlyMode = window.getUpdateDescriptionsRichOnlyMode || function() {
  return resolveUpdateDescriptionsRichOnly(undefined) ? 'rich-only' : 'allow-fallbacks';
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

function showLiveGoogleUnavailableCachedToast(contextLabel, extraDetail) {
  try {
    const context = String(contextLabel || 'bulk-automation').trim() || 'bulk-automation';
    const now = Date.now();
    const cooldownMs = 45000;
    window.__bulkGoogleDiagToastState = window.__bulkGoogleDiagToastState || {};
    const lastTs = Number(window.__bulkGoogleDiagToastState[context] || 0);
    if (now - lastTs < cooldownMs) return;
    window.__bulkGoogleDiagToastState[context] = now;

    const msg = 'Live Google provider unavailable; using cached data';
    const detail = String(extraDetail || '').trim();
    if (typeof window.showToast === 'function') {
      window.showToast(detail ? `${msg} (${detail})` : msg, 'warning', 5200);
    }
    console.warn(`⚠️ ${msg}${detail ? ` (${detail})` : ''} [context=${context}]`);
  } catch (_error) {
    // Non-blocking diagnostics helper.
  }
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
  const payload = audit && typeof audit === 'object' ? audit : {};
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
  COST: 14,
  LATITUDE: -1,
  LONGITUDE: -1
};

// Result contract field indices/names for the normalized write result objects.
// Reduces index drift and makes result object access more maintainable.
// Used by normalizeWriteResultContract, normalizeWriteResultContractLocal, and normalizeWriteContract.
const RESULT_INDEXES = {
  SUCCESS: 'success',
  ROWS_REQUESTED: 'rowsRequested',
  ROWS_CHANGED: 'rowsChanged',
  PERSISTED_ROWS: 'persistedRows',
  ROWS_APPENDED: 'rowsAppended',
  VERIFIED_ROWS_CHANGED: 'verifiedRowsChanged',
  ROWS_VERIFIED_PRESENT: 'rowsVerifiedPresent',
  PERSISTED: 'persisted',
  POST_WRITE_VERIFIED: 'postWriteVerified',
  VERIFICATION_MODE: 'verificationMode',
  VERIFICATION_REASON: 'verificationReason',
  PERSIST_MODE: 'persistMode',
  PERSIST_REASON: 'persistReason'
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
    DESCRIPTION: pick('Description', [], COLS.DESCRIPTION),
    LATITUDE: pick('Latitude', ['Lat', 'GPS Latitude'], COLS.LATITUDE),
    LONGITUDE: pick('Longitude', ['Lng', 'Lon', 'GPS Longitude'], COLS.LONGITUDE)
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
  const success = typeof raw.success === 'boolean'
    ? raw.success
    : (typeof raw.ok === 'boolean' ? raw.ok : (persisted || rowsChanged > 0 || rowsRequested === 0));
  const postWriteVerified = typeof raw.postWriteVerified === 'boolean'
    ? raw.postWriteVerified
    : (persistedRows > 0 && verifiedRowsChanged === persistedRows);

  return {
    ...raw,
    success,
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
window.RESULT_INDEXES = window.RESULT_INDEXES || RESULT_INDEXES;

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

function resolveWorkbookPatchTargetInfo(mainWindow) {
  const src = mainWindow || (window.opener && !window.opener.closed ? window.opener : window);
  const token = src.accessToken || (window.opener && window.opener.accessToken) || window.accessToken || '';
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

function hasWorkbookPatchAccessToken(mainWindow) {
  return !!String(resolveWorkbookPatchTargetInfo(mainWindow).token || '').trim();
}

function resolveWorkbookPatchTarget(mainWindow) {
  const { src, token, resolvedFilePath, tableName, encodedPath } = resolveWorkbookPatchTargetInfo(mainWindow);
  if (!token) throw new Error('automation-patch: no access token');

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
  const targetInfo = resolveWorkbookPatchTargetInfo(mainWindow);
  const operationRunId = String(options.operationRunId || '').trim();
  const expectedDescriptionColumnIndex = Number.isInteger(options.descriptionColumnIndex) ? options.descriptionColumnIndex : -1;
  const expectedDescriptionColumnName = String(options.descriptionColumnName || '').trim();
  const expectedNameNormalized = expectedDescriptionColumnName.toLowerCase();
  const canonicalDescriptionName = 'description';
  const columnsUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${targetInfo.encodedPath}:/workbook/tables/${encodeURIComponent(targetInfo.tableName)}/columns`;

  if (!hasWorkbookPatchAccessToken(mainWindow)) {
    return {
      ok: true,
      reason: 'preflight-skipped-no-access-token',
      detail: 'preflight-skipped-no-access-token',
      operationRunId,
      writeTarget: { resolvedFilePath: targetInfo.resolvedFilePath, tableName: targetInfo.tableName },
      columnsUrl,
      columns: []
    };
  }

  try {
    const response = await fetch(columnsUrl, {
      method: 'GET',
      headers: { Authorization: `Bearer ${targetInfo.token}` }
    });
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      return {
        ok: false,
        reason: `preflight-columns-http-${response.status}`,
        detail: `Could not load table columns [${response.status}] ${errorText || ''}`.trim(),
        operationRunId,
        writeTarget: { resolvedFilePath: targetInfo.resolvedFilePath, tableName: targetInfo.tableName },
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
      writeTarget: { resolvedFilePath: targetInfo.resolvedFilePath, tableName: targetInfo.tableName },
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
      writeTarget: { resolvedFilePath: targetInfo.resolvedFilePath, tableName: targetInfo.tableName },
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
              ? `strict verification failed: ${unresolvedReadbackCount} unresolved issue(s)`
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
  const looksLikeStructuredHoursJson = (text) => {
    const trimmed = String(text || '').trim();
    if (!trimmed) return false;
    if (!((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']')))) return false;
    return /"(periods|weekdayDescriptions|weekday_text|weekdayText|specialDays)"\s*:/.test(trimmed);
  };
  if (value == null) return '';
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '';
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        return normalizeHoursForBulkOps(JSON.parse(trimmed), mainWindow);
      } catch (_error) {
        return trimmed;
      }
    }
    return trimmed;
  }
  const host = mainWindow && typeof mainWindow === 'object' ? mainWindow : window;
  if (host && typeof host.normalizeOperationHours === 'function') {
    try {
      const normalized = String(host.normalizeOperationHours(value) || '').trim();
      if (normalized && looksLikeStructuredHoursJson(normalized)) {
        try {
          return normalizeHoursForBulkOps(JSON.parse(normalized), null);
        } catch (_error) {}
      }
      return normalized;
    } catch (_error) {}
  }
  if (Array.isArray(value)) return value.map((entry) => String(entry || '').trim()).filter(Boolean).join('; ');
  if (typeof value === 'object') {
    if (Array.isArray(value.weekdayDescriptions)) {
      return value.weekdayDescriptions.map((entry) => String(entry || '').trim()).filter(Boolean).join('; ');
    }
    if (Array.isArray(value.weekday_text)) {
      return value.weekday_text.map((entry) => String(entry || '').trim()).filter(Boolean).join('; ');
    }
    if (Array.isArray(value.weekdayText)) {
      return value.weekdayText.map((entry) => String(entry || '').trim()).filter(Boolean).join('; ');
    }
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const normalized = days
      .map((day) => {
        const resolved = value[day] || value[day.toLowerCase()];
        return resolved ? `${day}: ${resolved}` : '';
      })
      .filter(Boolean)
      .join('; ');
    return normalized || String(value.text || value.periods || '').trim();
  }
  return String(value).trim();
}

function buildDescriptionFromGoogleDetails(details) {
  const safe = details && typeof details === 'object' ? details : {};
  const direct = String(safe.description || '').trim();
  if (direct) return direct;

  const editorialSummary = String(
    safe.editorialSummaryText
      || (safe.editorialSummary && safe.editorialSummary.text)
      || ''
  ).trim();
  if (editorialSummary) return editorialSummary;

  const reviewSnippet = String(safe.reviewSnippet || '').trim();
  if (reviewSnippet) return reviewSnippet;

  const reviewNarrative = Array.isArray(safe.reviews)
    ? safe.reviews
        .map((review) => {
          if (!review) return '';
          if (review.text && typeof review.text === 'object' && review.text.text) return String(review.text.text).trim();
          return String(review.text || review.originalText || review.snippet || '').trim();
        })
        .filter(Boolean)
        .slice(0, 2)
        .join(' ')
        .trim()
    : '';
  if (reviewNarrative) return reviewNarrative;

  const businessType = String(safe.businessType || '').trim().replace(/^[\p{So}]\s/u, '');
  return businessType;
}

function isAutoGeneratedDescriptionPlaceholder(value) {
  const text = String(value || '').trim();
  if (!text) return true;
  // Common synthetic fallback pattern previously used in bulk ops.
  return /\bis located in\b/i.test(text) && /\bgoogle rating\b/i.test(text);
}

function isLikelyReviewStyleDescription(value) {
  const text = String(value || '').trim();
  if (!text) return false;
  const lower = text.toLowerCase();
  const reviewSignals = [
    /\bi\b.{0,40}\b(visited|went|ordered|tried|stopped|came)\b/i,
    /\bmy\b.{0,24}\b(experience|visit|family|wife|husband|kids)\b/i,
    /\b(service|staff|waitress|server|food)\b.{0,24}\b(was|were)\b/i,
    /^\s*["'`]/,
    /\bwould\s+(definitely\s+)?(recommend|come back)\b/i,
    /\b(best|worst)\b.{0,16}\b(i('|\s)?ve|ive|i have)\b/i
  ];
  if (reviewSignals.some((pattern) => pattern.test(text))) return true;
  const sentenceCount = text.split(/[.!?]+/).map((part) => part.trim()).filter(Boolean).length;
  return sentenceCount >= 3 && /( i | my | we | our )/i.test(` ${lower} `);
}

function isUsableGooglePlaceId(value) {
  const text = String(value || '').trim();
  if (!text) return false;
  const lower = text.toLowerCase();
  if (['skip', 'undefined', 'unavailable', 'not available', 'n/a', 'na', 'none', 'null'].includes(lower)) {
    return false;
  }
  if (/\s/.test(text)) return false;
  return text.length >= 8;
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
async function getPlaceDetailsFromAPI(placeId, retryCount = 0, maxRetries = 1, options = {}) {
  try {
    const requestedHost = window.opener && !window.opener.closed ? window.opener : window;
    const providerHost = resolveAutomationHost(requestedHost, 'getPlaceDetails');
    const mainWindow = providerHost || requestedHost || window;
    const forceRefresh = !!options.forceRefresh;
    const hasAllowCachedFallbackOption = Object.prototype.hasOwnProperty.call(options || {}, 'allowCachedFallback');
    // When forceRefresh is requested, default to live-only unless explicitly overridden.
    const allowCachedFallback = hasAllowCachedFallbackOption
      ? options.allowCachedFallback !== false
      : !forceRefresh;
    const helperContext = options.context || 'bulk-automation';
    const hasMainWindowLookup = !!(mainWindow && typeof mainWindow.getPlaceDetails === 'function');
    const hasLocalWindowLookup = !!(typeof window.getPlaceDetails === 'function' && window.getPlaceDetails !== mainWindow?.getPlaceDetails);
    const diagBase = {
      placeId: String(placeId || '').trim(),
      context: helperContext,
      liveLookupAttempted: false,
      liveLookupProvider: 'none',
      liveLookupHost: mainWindow === window
        ? 'window'
        : (mainWindow === window.parent ? 'window.parent' : (mainWindow === window.top ? 'window.top' : 'window.opener')),
      liveLookupStatus: 'not-attempted',
      hasMeaningfulDetails: false,
      source: 'empty-fallback'
    };
    const withDiag = (details, diagPatch = {}) => ({
      ...(details || {}),
      __sourceDiag: { ...diagBase, ...diagPatch }
    });

    if (hasMainWindowLookup) {
      diagBase.liveLookupAttempted = true;
      diagBase.liveLookupProvider = 'mainWindow.getPlaceDetails';
      try {
        const fallbackResult = await mainWindow.getPlaceDetails(placeId, { forceRefresh, context: helperContext });
        const normalizedFallback = normalizePlaceDetailsForBulkOps(placeId, fallbackResult, mainWindow);
        if (hasMeaningfulBulkOpsDetails(normalizedFallback)) {
          console.log(`✅ Got ${forceRefresh ? 'fresh' : 'live'} data from fallback function for ${placeId}`);
          return withDiag(normalizedFallback, {
            liveLookupStatus: 'ok',
            hasMeaningfulDetails: true,
            source: 'main-window-getPlaceDetails'
          });
        }
        diagBase.liveLookupStatus = 'empty-result';
      } catch (fallbackErr) {
        diagBase.liveLookupStatus = 'error';
        diagBase.liveLookupError = String(fallbackErr && fallbackErr.message ? fallbackErr.message : fallbackErr);
        console.debug(`📍 Fallback attempt failed: ${fallbackErr.message}`);
      }
    }

    if (hasLocalWindowLookup) {
      diagBase.liveLookupAttempted = true;
      diagBase.liveLookupProvider = 'window.getPlaceDetails';
      try {
        const directResult = await window.getPlaceDetails(placeId, { forceRefresh, context: helperContext });
        const normalizedDirect = normalizePlaceDetailsForBulkOps(placeId, directResult, mainWindow);
        if (hasMeaningfulBulkOpsDetails(normalizedDirect)) {
          console.log(`✅ Got ${forceRefresh ? 'fresh' : 'live'} data from local window.getPlaceDetails for ${placeId}`);
          return withDiag(normalizedDirect, {
            liveLookupStatus: 'ok',
            hasMeaningfulDetails: true,
            source: 'local-window-getPlaceDetails'
          });
        }
        diagBase.liveLookupStatus = 'empty-result';
      } catch (directErr) {
        diagBase.liveLookupStatus = 'error';
        diagBase.liveLookupError = String(directErr && directErr.message ? directErr.message : directErr);
        console.debug(`📍 Direct getPlaceDetails failed: ${directErr.message}`);
      }
    }

    if (forceRefresh && !hasMainWindowLookup && !hasLocalWindowLookup) {
      console.warn(`⚠️ Live Google lookup unavailable for ${placeId}; no getPlaceDetails provider was found.`);
      return withDiag({
        website: '',
        phone: '',
        hours: '',
        address: '',
        rating: '',
        description: '',
        directions: `https://www.google.com/maps/place/?q=place_id:${placeId}`
      }, {
        liveLookupStatus: 'provider-unavailable',
        source: 'live-provider-unavailable',
        hasMeaningfulDetails: false
      });
    }

    if (allowCachedFallback) {
      const cached = getCachedPlaceDetailsFromRows(placeId, mainWindow);
      if (hasMeaningfulBulkOpsDetails(cached)) {
        const liveUnavailable = !diagBase.liveLookupAttempted;
        const liveFailed = ['error', 'empty-result', 'provider-unavailable', 'helper-error'].includes(String(diagBase.liveLookupStatus || '').trim());
        if (liveUnavailable || liveFailed) {
          showLiveGoogleUnavailableCachedToast(helperContext, liveUnavailable ? 'provider unavailable' : 'live lookup returned no usable details');
        }
        console.log(`✅ Using cached row data for ${placeId}`);
        return withDiag(cached, {
          source: 'cached-row',
          hasMeaningfulDetails: true
        });
      }
    } else {
      console.info(`ℹ️ Cache fallback skipped for ${placeId} (${helperContext})`);
    }

    return withDiag({
      website: '',
      phone: '',
      hours: '',
      address: '',
      rating: '',
      description: '',
      directions: `https://www.google.com/maps/place/?q=place_id:${placeId}`
    });
  } catch (err) {
    console.warn(`⚠️ Error in getPlaceDetailsFromAPI: ${err.message}`);
    return {
      website: '',
      phone: '',
      hours: '',
      address: '',
      rating: '',
      description: '',
      directions: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
      __sourceDiag: {
        placeId: String(placeId || '').trim(),
        context: options.context || 'bulk-automation',
        liveLookupAttempted: false,
        liveLookupProvider: 'none',
        liveLookupStatus: 'helper-error',
        hasMeaningfulDetails: false,
        source: 'helper-error',
        liveLookupError: String(err && err.message ? err.message : err)
      }
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

function normalizeGoogleAutomationUpdateMode(mode, fallback = 'missing-only') {
  const normalized = String(mode || fallback).trim().toLowerCase();
  return normalized === 'refresh-all' ? 'refresh-all' : 'missing-only';
}

function getGoogleAutomationModeLabel(mode) {
  return normalizeGoogleAutomationUpdateMode(mode) === 'refresh-all' ? 'refresh all values' : 'missing / blank values only';
}

function createGoogleAutomationDiagnostics(operation, mode) {
  const normalizedMode = normalizeGoogleAutomationUpdateMode(mode);
  const skipReasonCounts = Object.create(null);
  const googleApiDiagnostics = {
    attemptedRows: 0,
    returnedRows: 0,
    emptyRows: 0,
    errorRows: 0,
    sourceCounts: Object.create(null),
    sampleReturns: [],
    sampleFailures: []
  };
  const rowSamples = [];
  const bumpCounter = (bucket, key) => {
    const safeKey = String(key || 'unspecified').trim() || 'unspecified';
    bucket[safeKey] = Number(bucket[safeKey] || 0) + 1;
  };
  return {
    mode: normalizedMode,
    markSkipReason(reason) {
      bumpCounter(skipReasonCounts, reason);
    },
    recordGoogleDiag(details, placeId, placeName) {
      const sourceDiag = details && typeof details.__sourceDiag === 'object' ? details.__sourceDiag : null;
      if (!sourceDiag) return;
      bumpCounter(googleApiDiagnostics.sourceCounts, sourceDiag.source || 'unknown');
      if (sourceDiag.liveLookupAttempted) googleApiDiagnostics.attemptedRows += 1;
      if (sourceDiag.hasMeaningfulDetails) googleApiDiagnostics.returnedRows += 1;
      else googleApiDiagnostics.emptyRows += 1;
      const sourceStatus = String(sourceDiag.liveLookupStatus || '').trim() || 'unknown';
      if (sourceStatus === 'error' || sourceStatus === 'helper-error') {
        googleApiDiagnostics.errorRows += 1;
      }
      if (googleApiDiagnostics.sampleReturns.length < 3) {
        googleApiDiagnostics.sampleReturns.push({
          placeId: String(placeId || '').trim(),
          name: String(placeName || '').trim(),
          source: String(sourceDiag.source || 'unknown').trim() || 'unknown',
          status: sourceStatus,
          descriptionPreview: String((details && details.description) || '').trim().slice(0, 120)
        });
      }
      const sourceError = String(sourceDiag.liveLookupError || sourceDiag.reason || '').trim();
      if (sourceError && googleApiDiagnostics.sampleFailures.length < 4) {
        googleApiDiagnostics.sampleFailures.push({
          placeId: String(placeId || '').trim(),
          name: String(placeName || '').trim(),
          source: String(sourceDiag.source || 'unknown').trim() || 'unknown',
          status: sourceStatus,
          error: sourceError.slice(0, 220)
        });
      }
    },
    noteRow(sample) {
      if (!sample || typeof sample !== 'object' || rowSamples.length >= 6) return;
      rowSamples.push({
        name: String(sample.name || '').trim() || '(no name)',
        status: String(sample.status || 'unknown').trim() || 'unknown',
        reason: String(sample.reason || sample.message || '').trim(),
        placeId: String(sample.placeId || '').trim()
      });
    },
    build(counts = {}) {
      const normalizedSkipReasonCounts = Object.keys(skipReasonCounts)
        .sort((a, b) => a.localeCompare(b))
        .reduce((acc, key) => {
          acc[key] = Number(skipReasonCounts[key] || 0);
          return acc;
        }, {});
      const normalizedSourceCounts = Object.keys(googleApiDiagnostics.sourceCounts)
        .sort((a, b) => a.localeCompare(b))
        .reduce((acc, key) => {
          acc[key] = Number(googleApiDiagnostics.sourceCounts[key] || 0);
          return acc;
        }, {});
      return {
        operation,
        updateMode: normalizedMode,
        rows: {
          totalRows: Math.max(0, Number(counts.totalRows) || 0),
          updatedRows: Math.max(0, Number(counts.updatedRows) || 0),
          skippedRows: Math.max(0, Number(counts.skippedRows) || 0),
          errorRows: Math.max(0, Number(counts.errorRows) || 0),
          persistedRows: Math.max(0, Number(counts.persistedRows) || 0)
        },
        skipReasonCounts: normalizedSkipReasonCounts,
        rowSamples: rowSamples.slice(0, 6),
        googleApi: {
          checked: Number(googleApiDiagnostics.attemptedRows || 0) > 0,
          attemptedRows: Number(googleApiDiagnostics.attemptedRows || 0),
          returnedRows: Number(googleApiDiagnostics.returnedRows || 0),
          emptyRows: Number(googleApiDiagnostics.emptyRows || 0),
          errorRows: Number(googleApiDiagnostics.errorRows || 0),
          sourceCounts: normalizedSourceCounts,
          sampleReturns: Array.isArray(googleApiDiagnostics.sampleReturns) ? googleApiDiagnostics.sampleReturns.slice(0, 3) : [],
          sampleFailures: Array.isArray(googleApiDiagnostics.sampleFailures) ? googleApiDiagnostics.sampleFailures.slice(0, 4) : []
        }
      };
    }
  };
}

function recordGoogleAutomationRunSummary(operation, mode, payload) {
  if (!(window.DiagnosticsReport && typeof window.DiagnosticsReport.recordGoogleAutomationRun === 'function')) return null;
  try {
    return window.DiagnosticsReport.recordGoogleAutomationRun(operation, {
      mode: normalizeGoogleAutomationUpdateMode(mode),
      ...payload
    });
  } catch (_diagError) {
    return null;
  }
}

/**
 * Populate Missing Fields Only
 */
window.handlePopulateMissingFields = async function(displayElement, dryRun = false, options = {}) {
  const updateMode = normalizeGoogleAutomationUpdateMode(options && options.updateMode, 'missing-only');
  console.log(`📝 Starting populate missing fields, dryRun=${dryRun}, mode=${updateMode}`);

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

  const operationName = 'populate-missing-fields';
  const results = [];
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const changedRows = [];
  const diag = createGoogleAutomationDiagnostics(operationName, updateMode);
  const markSkipReason = (reason) => diag.markSkipReason(reason);
  const recordGoogleDiag = (details, placeId, placeName) => diag.recordGoogleDiag(details, placeId, placeName);
  const buildOperationDiagnostics = () => diag.build({
    totalRows: adventuresData.length,
    updatedRows: updatedCount,
    skippedRows: skippedCount,
    errorRows: errorCount,
    persistedRows: 0
  });

  const updateDisplay = (status) => {
    displayElement.innerHTML = status;
  };

  updateDisplay(`
    <div style="padding: 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px;">
      <div style="font-weight: 600; color: #1e40af; margin-bottom: 12px;">
        ${dryRun ? '🧪 DRY RUN - Preview' : '⏳ Processing'} Google Field Updates
      </div>
      <div style="font-size: 14px; color: #1f2937;">
        📊 Total locations: ${adventuresData.length}
      </div>
      <div style="margin-top: 6px; font-size: 12px; color: #334155;">
        Update mode: <strong>${getGoogleAutomationModeLabel(updateMode)}</strong>
      </div>
      <div style="margin-top: 8px; padding: 8px; background: rgba(59, 130, 246, 0.1); border-radius: 4px; font-size: 12px; color: #1f2937;">
        ⏳ Scanning rows and preparing Google Places lookups...
      </div>
    </div>
  `);

  try {
    const activeCols = getActiveCols(window.opener && !window.opener.closed ? window.opener : window);
    for (let i = 0; i < adventuresData.length; i++) {
      const place = adventuresData[i];
      const values = place.values ? place.values[0] : place;
      let name = '';
      let placeId = '';

      if (!values || values.length === 0) {
        skippedCount++;
        markSkipReason('empty-row-values');
          diag.noteRow({ name: `(row ${i + 1})`, status: 'skipped', reason: 'Row had no cell values' });
        continue;
      }

      try {
        if (i > 0) await delay(PLACES_API_DELAY_MS);

        // Ensure all values are strings and trim them
        name = (values[activeCols.NAME] || '').toString().trim();
        placeId = (values[activeCols.PLACE_ID] || '').toString().trim();
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

        if (updateMode === 'missing-only' && emptyFields.length === 0) {
          results.push({
            name: name || '(no name)',
            status: 'complete',
            message: 'All fields populated'
          });
          skippedCount++;
          markSkipReason('no-missing-fields');
          diag.noteRow({ name: name || '(no name)', placeId, status: 'skipped', reason: 'All Google-backed fields already had values' });
          continue;
        }

        if (!isUsableGooglePlaceId(placeId)) {
          const placeIdReason = placeId ? 'invalid-place-id-format' : 'missing-place-id';
          results.push({
            name: name || '(no name)',
            status: 'skipped',
            message: updateMode === 'refresh-all'
              ? 'Skipped: no valid Google Place ID was available for a refresh lookup'
              : `Missing fields: ${emptyFields.join(', ')} - but no valid Place ID was available`
          });
          skippedCount++;
          markSkipReason(placeIdReason);
          diag.noteRow({ name: name || '(no name)', placeId, status: 'skipped', reason: placeId ? 'Place ID was present but not in a valid Google format' : 'Row had no Place ID' });
          continue;
        }

        const details = await getPlaceDetailsFromAPI(placeId, 0, 1, {
          forceRefresh: true,
          allowCachedFallback: false,
          context: operationName
        });
        recordGoogleDiag(details, placeId, name);
        let fieldsCorrected = [];
        const fieldCandidates = [
          { label: 'Website', current: website, incoming: details.website, column: activeCols.WEBSITE },
          { label: 'Phone', current: phone, incoming: details.phone, column: activeCols.PHONE },
          { label: 'Hours', current: hours, incoming: details.hours, column: activeCols.HOURS },
          { label: 'Address', current: address, incoming: details.address, column: activeCols.ADDRESS },
          { label: 'Rating', current: rating, incoming: details.rating, column: activeCols.RATING }
        ];

        if (!dryRun) {
          fieldCandidates.forEach((field) => {
            const currentValue = String(field.current || '').trim();
            const incomingValue = String(field.incoming == null ? '' : field.incoming).trim();
            if (!incomingValue) return;
            const shouldApply = updateMode === 'refresh-all'
              ? currentValue !== incomingValue
              : !currentValue;
            if (!shouldApply) return;
            values[field.column] = field.incoming;
            fieldsCorrected.push(field.label);
          });

          if (fieldsCorrected.length > 0) {
            updatedCount++;
            changedRows.push(buildChangedWorkbookRow(place, i, values));
            diag.noteRow({ name: name || '(no name)', placeId, status: 'updated', reason: `Updated ${fieldsCorrected.join(', ')}` });
          } else {
            skippedCount++;
            markSkipReason(updateMode === 'refresh-all' ? 'google-returned-no-new-values' : 'google-returned-no-missing-values');
            diag.noteRow({
              name: name || '(no name)',
              placeId,
              status: 'skipped',
              reason: updateMode === 'refresh-all'
                ? 'Google returned no changed values for the tracked fields'
                : 'Google did not return values for the blank fields on this row'
            });
          }
        } else {
          fieldsCorrected = fieldCandidates
            .filter((field) => {
              const currentValue = String(field.current || '').trim();
              const incomingValue = String(field.incoming == null ? '' : field.incoming).trim();
              if (!incomingValue) return false;
              return updateMode === 'refresh-all' ? currentValue !== incomingValue : !currentValue;
            })
            .map((field) => field.label);
          if (fieldsCorrected.length > 0) {
            updatedCount++;
            diag.noteRow({ name: name || '(no name)', placeId, status: 'updated', reason: `Would update ${fieldsCorrected.join(', ')}` });
          } else {
            skippedCount++;
            markSkipReason(updateMode === 'refresh-all' ? 'google-returned-no-new-values' : 'google-returned-no-missing-values');
            diag.noteRow({ name: name || '(no name)', placeId, status: 'skipped', reason: 'Google returned nothing actionable for this row' });
          }
        }

        results.push({
          name: name || '(no name)',
          status: fieldsCorrected.length > 0 ? 'updated' : 'skipped',
          missingFields: emptyFields,
          correctedFields: fieldsCorrected,
          message: `${fieldsCorrected.length > 0 ? (dryRun ? 'Would update' : 'Updated') : 'Skipped'}: ${fieldsCorrected.join(', ') || 'Google returned no actionable field values'}`
        });
      } catch (err) {
        console.error(`❌ Error processing ${name || '(unknown)'}:`, err);
        results.push({
          name: name || '(unknown)',
          status: 'error',
          message: err.message
        });
        errorCount++;
        diag.noteRow({ name: name || '(unknown)', placeId, status: 'error', reason: err.message });
      }

      if ((i + 1) % 5 === 0 || i === adventuresData.length - 1) {
        const percent = Math.round(((i + 1) / adventuresData.length) * 100);
        updateDisplay(`
          <div style="padding: 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px;">
            <div style="font-weight: 600; color: #1e40af; margin-bottom: 12px;">
              ${dryRun ? '🧪 DRY RUN' : '⏳ Processing'} Google Field Updates
            </div>
            <div style="font-size:12px;color:#334155;margin-bottom:10px;">Mode: <strong>${getGoogleAutomationModeLabel(updateMode)}</strong></div>
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
      richDescriptionsOnly,
      richDescriptionsMode,
      descriptionIndex: Number(activeCols.DESCRIPTION),
      descriptionColumnName: String(resolvedColsDebug.descriptionColumnName || ''),
      writeTarget: persistence.writeTarget || null,
      preflight: persistence.preflight || preflight,
      diagnosticSummary: persistence.diagnosticSummary || null,
      skippedNonRichCount,
      updateDescriptionsDiagnostics,
      rowAuditTrail,
      perRowWriteLog: Array.isArray(persistence.perRowWriteLog) ? persistence.perRowWriteLog : []
    };

    pushWorkbookWriteDebug('update-descriptions-operation-summary', {
      operationRunId,
      overwrite: !!overwrite,
      dryRun: !!dryRun,
      updatedCount,
      skippedCount,
      skippedNonRichCount,
      errorCount,
      descriptionColumnIndex: Number(activeCols.DESCRIPTION),
      descriptionColumnName: String(resolvedColsDebug.descriptionColumnName || ''),
      writeTarget: persistence.writeTarget || null,
      persistedRows: Number(persistence.persistedRows || 0),
      verifiedRowsChanged: Number(persistence.verifiedRowsChanged || 0),
      runFailed: !!persistence.runFailed,
      strictVerification,
      strictVerificationMode,
      richDescriptionsOnly,
      richDescriptionsMode,
      updateDescriptionsDiagnostics,
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
      <div style="font-size:12px;color:#1f2937;margin-top:4px;">🧾 Rich mode: ${escapeHtml(richDescriptionsMode)}${richDescriptionsOnly ? ` • skipped non-rich ${Number(skippedNonRichCount || 0)}` : ''}</div>
      <div style="font-size:12px;color:${persistence.persisted ? '#047857' : '#92400e'};margin-top:8px;">💾 Workbook write: ${persistence.persisted ? 'saved to Excel' : `not persisted (${persistence.reason || persistence.mode})`}</div>
      <div style="font-size:12px;color:#1f2937;margin-top:6px;">🗂️ Target: ${escapeHtml(writeTargetLabel)}</div>
      <div style="font-size:12px;color:#1f2937;margin-top:4px;">🔎 Description read-back verified: ${Number(persistence.verifiedRowsChanged || 0)}/${Number(persistence.persistedRows || 0)}</div>
      <div style="font-size:12px;color:${strictRunFailed ? '#991b1b' : '#1f2937'};margin-top:4px;">🛡️ Strict mode: ${escapeHtml(strictVerificationMode)} (${strictVerification ? 'fail-closed' : 'warn-only'}) • ${strictRunFailed ? 'FAILED' : 'passed'}${strictRunFailed ? ` (${Number(diag.unresolvedReadbackCount || 0)} unresolved issue(s))` : ''}</div>
      <div style="font-size:12px;color:#1f2937;margin-top:4px;">🧪 Reliability: retries recovered ${Number(diag.retryRecoveredCount || 0)}, readback mismatches ${Number(diag.readbackMismatchCount || 0)}, readback errors ${Number(diag.readbackErrorCount || 0)}, patch errors ${Number(diag.patchErrorCount || 0)}</div>
      ${buildPreviewHtml()}
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:10px;">
        <button type="button" ${canDownloadAuditCsv ? '' : 'disabled'} onclick="(function(){ const out = window.downloadLastUpdateDescriptionsPerRowWriteLogCsv && window.downloadLastUpdateDescriptionsPerRowWriteLogCsv(); if (!out || !out.ok) { alert('No CSV audit is available for this run.'); } })();" style="padding:6px 10px;border:1px solid #86efac;border-radius:6px;background:#f0fdf4;color:#166534;font-size:12px;font-weight:600;cursor:pointer;">📥 Download CSV Audit</button>
        <button type="button" onclick="window.copyLastUpdateDescriptionsAuditJson && window.copyLastUpdateDescriptionsAuditJson();" style="padding:6px 10px;border:1px solid #bfdbfe;border-radius:6px;background:#eff6ff;color:#1d4ed8;font-size:12px;font-weight:600;cursor:pointer;">📋 Copy Audit JSON</button>
      </div>
    </div>`);

    recordGoogleAutomationRunSummary('update-descriptions', overwrite ? 'refresh-all' : 'missing-only', {
      dryRun,
      success: !strictRunFailed,
      target: String(mainWindow.tableName || '').trim(),
      summary: `${dryRun ? 'Previewed' : 'Processed'} ${updatedCount} descriptions updated, ${skippedCount} skipped, ${errorCount} errors${strictRunFailed ? ' (strict verification failed)' : ''}`,
      totals: {
        totalRows: adventuresData.length,
        updatedRows: updatedCount,
        skippedRows: skippedCount,
        errorRows: errorCount,
        persistedRows: persistence.persistedRows
      },
      skipReasonCounts: updateDescriptionsDiagnostics.skipReasonCounts,
      googleApi: updateDescriptionsDiagnostics.googleApi,
      samples: rowAuditTrail.slice(0, 6).map((item) => ({
        name: String(item && item.name || '').trim(),
        status: String(item && item.status || 'unknown').trim(),
        reason: String(item && (item.reason || item.error || item.descriptionSource) || '').trim(),
        placeId: String(item && item.placeId || '').trim()
      }))
    });

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
      richDescriptionsOnly,
      richDescriptionsMode,
      descriptionIndex: Number(activeCols.DESCRIPTION),
      descriptionColumnName: String(resolvedColsDebug.descriptionColumnName || ''),
      writeTarget: persistence.writeTarget || null,
      preflight: persistence.preflight || preflight,
      diagnosticSummary: persistence.diagnosticSummary || null,
      skippedNonRichCount,
      updateDescriptionsDiagnostics,
      perRowWriteLog: Array.isArray(persistence.perRowWriteLog) ? persistence.perRowWriteLog : [],
      rowAuditTrailCount: rowAuditTrail.length
    };
  } catch (err) {
    console.error('❌ Error updating descriptions:', err);
    updateDisplay(`<div style="padding:16px;background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;color:#7f1d1d;"><strong>❌ Error:</strong> ${err.message}</div>`);
    recordGoogleAutomationRunSummary('update-descriptions', overwrite ? 'refresh-all' : 'missing-only', {
      dryRun,
      success: false,
      target: String(mainWindow.tableName || '').trim(),
      summary: String(err && err.message ? err.message : 'Update descriptions failed'),
      totals: {
        totalRows: adventuresData.length,
        updatedRows: updatedCount,
        skippedRows: skippedCount,
        errorRows: errorCount || 1,
        persistedRows: 0
      },
      skipReasonCounts: emptyRunDiagnostics.skipReasonCounts,
      googleApi: emptyRunDiagnostics.googleApi,
      samples: []
    });
    return { success: false, error: err.message, updateDescriptionsDiagnostics: emptyRunDiagnostics };
  }
};

// ============================================================
// SECTION 8: REMOVE EXACT DUPLICATES
// ============================================================

window.handleRemoveExactDuplicates = async function(displayElement, dryRun = false) {
  if (!displayElement) return { success: false, error: 'No display element' };

  const mainWindow = window.opener && !window.opener.closed ? window.opener : window;
  const adventuresData = Array.isArray(mainWindow.adventuresData)
    ? mainWindow.adventuresData
    : (Array.isArray(window.adventuresData) ? window.adventuresData : []);

  if (!adventuresData.length) {
    displayElement.innerHTML = `<div style="padding:16px;background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;color:#7f1d1d;"><strong>❌ Error:</strong> No data available.</div>`;
    return { success: false, error: 'No data available' };
  }

  const totalRowsBeforeCleanup = adventuresData.length;

  const activeCols = getActiveCols(mainWindow);
  const normalizeKeyPart = (value) => String(value == null ? '' : value)
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  const skipReasonCounts = Object.create(null);
  const markSkipReason = (reason) => {
    const key = String(reason || 'unspecified').trim() || 'unspecified';
    skipReasonCounts[key] = Number(skipReasonCounts[key] || 0) + 1;
  };

  displayElement.innerHTML = `<div style="padding:16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;">
    <div style="font-weight:600;color:#1e40af;margin-bottom:10px;">${dryRun ? '🧪 DRY RUN' : '⏳ Processing'} Remove Exact Duplicates</div>
    <div style="font-size:13px;color:#334155;">Scanning ${adventuresData.length} row${adventuresData.length === 1 ? '' : 's'} for duplicate Name + Address pairs...</div>
  </div>`;

  const firstSeenByKey = new Map();
  const duplicates = [];
  for (let i = 0; i < adventuresData.length; i += 1) {
    const row = adventuresData[i] && Array.isArray(adventuresData[i].values) ? adventuresData[i].values[0] : null;
    if (!Array.isArray(row)) {
      markSkipReason('empty-row-values');
      continue;
    }
    const name = normalizeKeyPart(row[activeCols.NAME]);
    const address = normalizeKeyPart(row[activeCols.ADDRESS]);
    if (!name || !address) {
      markSkipReason('missing-name-or-address');
      continue;
    }
    const dedupeKey = `${name}||${address}`;
    if (!firstSeenByKey.has(dedupeKey)) {
      firstSeenByKey.set(dedupeKey, i);
      continue;
    }
    duplicates.push({
      removeIndex: i,
      keepIndex: Number(firstSeenByKey.get(dedupeKey)),
      name: String(row[activeCols.NAME] || '').trim(),
      address: String(row[activeCols.ADDRESS] || '').trim()
    });
  }

  const rowsChanged = duplicates.length;
  let persisted = false;
  let persistMode = 'no-op';
  let persistReason = rowsChanged ? '' : 'no-updates';

  if (!dryRun && rowsChanged > 0) {
    try {
      duplicates
        .slice()
        .sort((a, b) => b.removeIndex - a.removeIndex)
        .forEach((entry) => {
          adventuresData.splice(entry.removeIndex, 1);
        });
      if (typeof mainWindow.saveToExcel === 'function') {
        await mainWindow.saveToExcel();
        persisted = true;
        persistMode = 'saveToExcel';
      } else {
        persistMode = 'error';
        persistReason = 'saveToExcel-unavailable';
      }
    } catch (error) {
      persistMode = 'error';
      persistReason = String(error && error.message ? error.message : error);
    }
  } else if (dryRun) {
    persistMode = 'dry-run';
    persistReason = 'dry-run';
  }

  const skippedCount = Math.max(0, totalRowsBeforeCleanup - rowsChanged);
  const sampleRows = duplicates.slice(0, 6).map((entry) => ({
    name: entry.name,
    status: dryRun ? 'would-remove' : 'removed',
    reason: `Duplicate of row ${entry.keepIndex + 1} (same Name + Address)`,
    placeId: ''
  }));

  displayElement.innerHTML = `<div style="padding:16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;">
    <div style="font-weight:600;color:#166534;margin-bottom:8px;">${dryRun ? '🧪 Dry Run Complete' : '✅ Duplicate Cleanup Complete'}</div>
    <div style="font-size:13px;color:#334155;">🗑️ ${dryRun ? 'Would remove' : 'Removed'}: ${rowsChanged} duplicate row${rowsChanged === 1 ? '' : 's'}</div>
    <div style="font-size:12px;color:#334155;margin-top:4px;">⏭️ Non-duplicates or incomplete rows: ${skippedCount}</div>
    <div style="font-size:12px;color:${persisted ? '#047857' : '#92400e'};margin-top:8px;">💾 Workbook write: ${persisted ? 'saved to Excel' : (dryRun ? 'dry run only' : `not persisted (${persistReason || persistMode})`)}</div>
  </div>`;

  recordGoogleAutomationRunSummary('remove-exact-duplicates', 'refresh-all', {
    dryRun,
    success: dryRun ? true : (rowsChanged === 0 || persisted),
    target: String(mainWindow.tableName || '').trim(),
    summary: `${dryRun ? 'Would remove' : 'Removed'} ${rowsChanged} exact duplicate row${rowsChanged === 1 ? '' : 's'} (Name + Address).`
      + (skippedCount > 0 ? ` ${dryRun ? '' : 'Non-duplicates or incomplete rows skipped: ' + skippedCount}` : ''),
    totals: {
      totalRows: totalRowsBeforeCleanup,
      updatedRows: rowsChanged,
      skippedRows: skippedCount,
      errorRows: (!dryRun && rowsChanged > 0 && !persisted) ? 1 : 0,
      persistedRows: persisted ? rowsChanged : 0
    },
    skipReasonCounts: Object.keys(skipReasonCounts).sort((a, b) => a.localeCompare(b)).reduce((acc, key) => {
      acc[key] = Number(skipReasonCounts[key] || 0);
      return acc;
    }, {}),
    googleApi: { checked: false, attemptedRows: 0, returnedRows: 0, emptyRows: 0, errorRows: 0, sourceCounts: {}, sampleReturns: [] },
    samples: sampleRows
  });

  return {
    success: dryRun ? true : (rowsChanged === 0 || persisted),
    dryRun,
    updatedCount: rowsChanged,
    skippedCount,
    errorCount: (!dryRun && rowsChanged > 0 && !persisted) ? 1 : 0,
    persisted,
    persistMode,
    persistReason,
    rowsChanged,
    persistedRows: persisted ? rowsChanged : 0,
    verifiedRowsChanged: persisted ? rowsChanged : 0,
    postWriteVerified: persisted,
    verificationMode: dryRun ? 'dry-run' : (persisted ? 'save-confirmed' : 'error'),
    verificationReason: dryRun ? 'dry-run' : (persisted ? '' : (persistReason || 'save-failed'))
  };
};

// ============================================================
// SECTION 9: FORCE UPDATE ALL FIELDS
// ============================================================

const FORCE_UPDATE_FIELD_DEFS = {
  website: { label: 'Website', column: 'WEBSITE', detailsKey: 'website' },
  phone: { label: 'Phone', column: 'PHONE', detailsKey: 'phone' },
  hours: { label: 'Hours', column: 'HOURS', detailsKey: 'hours' },
  address: { label: 'Address', column: 'ADDRESS', detailsKey: 'address' },
  rating: { label: 'Rating', column: 'RATING', detailsKey: 'rating' },
  description: { label: 'Description', column: 'DESCRIPTION', detailsKey: 'description' },
  coordinates: { label: 'Coordinates', coordinate: true }
};

const FORCE_UPDATE_DEFAULT_FIELDS = ['website', 'phone', 'hours', 'address', 'rating', 'description', 'coordinates'];

function normalizeForceUpdateFieldSelection(rawFields) {
  if (!Array.isArray(rawFields) || !rawFields.length) return FORCE_UPDATE_DEFAULT_FIELDS.slice();
  const normalized = rawFields
    .map((field) => String(field || '').trim().toLowerCase())
    .filter((field) => Object.prototype.hasOwnProperty.call(FORCE_UPDATE_FIELD_DEFS, field));
  return normalized.length ? Array.from(new Set(normalized)) : FORCE_UPDATE_DEFAULT_FIELDS.slice();
}

function normalizeBulkCoordinates(details) {
  const source = details && typeof details === 'object' ? details.coordinates : null;
  const lat = Number(source && (source.lat != null ? source.lat : source.latitude));
  const lng = Number(source && (source.lng != null ? source.lng : (source.lon != null ? source.lon : source.longitude)));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    lat: Number(lat.toFixed(7)),
    lng: Number(lng.toFixed(7))
  };
}

/**
 * Force-refresh all fields for every location regardless of existing data.
 */
window.handleForceUpdateAllFields = async function(displayElement, dryRun = false, options = {}) {
  const safeOptions = options && typeof options === 'object' ? options : {};
  const updateMode = normalizeGoogleAutomationUpdateMode(safeOptions.updateMode, 'refresh-all');
  const selectedFields = normalizeForceUpdateFieldSelection(safeOptions.fields);
  const selectedFieldLabels = selectedFields.map((fieldKey) => FORCE_UPDATE_FIELD_DEFS[fieldKey].label);
  const modeLabel = getGoogleAutomationModeLabel(updateMode);
  console.log(`🔄 Starting force-update fields, dryRun=${dryRun}, mode=${updateMode}, fields=${selectedFields.join(',')}`);

  if (!displayElement) return { success: false, error: 'No display element' };

  const mainWindow = window.opener && !window.opener.closed ? window.opener : window;
  const adventuresData = mainWindow.adventuresData || window.adventuresData;

  if (!adventuresData || adventuresData.length === 0) {
    displayElement.innerHTML = `<div style="padding:16px;background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;color:#7f1d1d;"><strong>❌ Error:</strong> No data available.</div>`;
    return { success: false, error: 'No data available' };
  }

  const activeCols = getActiveCols(mainWindow);
  const hasCoordinateColumns = Number.isInteger(activeCols.LATITUDE) && activeCols.LATITUDE >= 0
    && Number.isInteger(activeCols.LONGITUDE) && activeCols.LONGITUDE >= 0;
  const results = [];
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const changedRows = [];
  const skipReasonCounts = Object.create(null);
  const googleApiDiagnostics = {
    attemptedRows: 0,
    returnedRows: 0,
    emptyRows: 0,
    errorRows: 0,
    sourceCounts: Object.create(null),
    sampleReturns: []
  };
  const bumpCounter = (bucket, key) => {
    const safeKey = String(key || 'unspecified').trim() || 'unspecified';
    bucket[safeKey] = Number(bucket[safeKey] || 0) + 1;
  };
  const markSkipReason = (reason) => bumpCounter(skipReasonCounts, reason);
  const recordGoogleDiag = (details, placeId) => {
    const sourceDiag = details && typeof details.__sourceDiag === 'object' ? details.__sourceDiag : null;
    if (!sourceDiag) return;
    bumpCounter(googleApiDiagnostics.sourceCounts, sourceDiag.source || 'unknown');
    if (sourceDiag.liveLookupAttempted) googleApiDiagnostics.attemptedRows += 1;
    if (sourceDiag.hasMeaningfulDetails) googleApiDiagnostics.returnedRows += 1;
    else googleApiDiagnostics.emptyRows += 1;
    const sourceStatus = String(sourceDiag.liveLookupStatus || '').trim();
    if (sourceStatus === 'error' || sourceStatus === 'helper-error') googleApiDiagnostics.errorRows += 1;
    if (googleApiDiagnostics.sampleReturns.length < 3) {
      googleApiDiagnostics.sampleReturns.push({
        placeId: String(placeId || '').trim(),
        source: String(sourceDiag.source || 'unknown').trim() || 'unknown',
        status: sourceStatus || 'unknown',
        descriptionPreview: String((details && details.description) || '').trim().slice(0, 120)
      });
    }
  };
  const buildOperationDiagnostics = () => {
    const normalizedSkipReasonCounts = Object.keys(skipReasonCounts)
      .sort((a, b) => a.localeCompare(b))
      .reduce((acc, key) => {
        acc[key] = Number(skipReasonCounts[key] || 0);
        return acc;
      }, {});
    const normalizedSourceCounts = Object.keys(googleApiDiagnostics.sourceCounts)
      .sort((a, b) => a.localeCompare(b))
      .reduce((acc, key) => {
        acc[key] = Number(googleApiDiagnostics.sourceCounts[key] || 0);
        return acc;
      }, {});
    return {
      skipReasonCounts: normalizedSkipReasonCounts,
      googleApi: {
        checked: Number(googleApiDiagnostics.attemptedRows || 0) > 0,
        attemptedRows: Number(googleApiDiagnostics.attemptedRows || 0),
        returnedRows: Number(googleApiDiagnostics.returnedRows || 0),
        emptyRows: Number(googleApiDiagnostics.emptyRows || 0),
        errorRows: Number(googleApiDiagnostics.errorRows || 0),
        sourceCounts: normalizedSourceCounts,
        sampleReturns: Array.isArray(googleApiDiagnostics.sampleReturns) ? googleApiDiagnostics.sampleReturns.slice(0, 3) : []
      }
    };
  };

  const updateDisplay = (status) => { displayElement.innerHTML = status; };

  updateDisplay(`<div style="padding:16px;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;">
    <div style="font-weight:600;color:#9a3412;margin-bottom:12px;">${dryRun ? '🧪 DRY RUN - Preview' : '⏳ Processing'} Google Field Refresh</div>
    <div style="font-size:14px;color:#1f2937;">📊 Total locations: ${adventuresData.length}</div>
    <div style="margin-top:6px;font-size:12px;color:#334155;">Fields: <strong>${selectedFieldLabels.join(', ')}</strong></div>
    <div style="margin-top:4px;font-size:12px;color:#334155;">Mode: <strong>${modeLabel}</strong></div>
    <div style="margin-top:8px;padding:8px;background:rgba(251,146,60,0.1);border-radius:4px;font-size:12px;color:#1f2937;">${updateMode === 'refresh-all' ? '⚠️ Existing values can be overwritten with fresh Google Places data.' : 'ℹ️ Only blank/missing values will be filled.'}</div>
    ${selectedFields.includes('coordinates') && !hasCoordinateColumns ? '<div style="margin-top:8px;padding:8px;background:#fffbeb;border:1px solid #fcd34d;border-radius:4px;font-size:12px;color:#92400e;">⚠️ Latitude/Longitude columns were not found in this table, so coordinate updates are skipped.</div>' : ''}
  </div>`);

  try {
    for (let i = 0; i < adventuresData.length; i++) {
      const place = adventuresData[i];
      const values = place.values ? place.values[0] : place;
      if (!values || values.length === 0) { skippedCount++; markSkipReason('empty-row-values'); continue; }

      try {
        if (i > 0) await delay(PLACES_API_DELAY_MS);

        const name = (values[activeCols.NAME] || '').toString().trim();
        const placeId = (values[activeCols.PLACE_ID] || '').toString().trim();

        if (!isUsableGooglePlaceId(placeId)) {
          results.push({ name: name || '(no name)', status: 'skipped', message: 'No valid Place ID' });
          skippedCount++;
          markSkipReason('invalid-place-id');
          continue;
        }

        const details = await getPlaceDetailsFromAPI(placeId);
        recordGoogleDiag(details, placeId);
        const updated = [];
        const preview = [];

        selectedFields.forEach((fieldKey) => {
          if (fieldKey === 'coordinates') {
            if (!hasCoordinateColumns) return;
            const coords = normalizeBulkCoordinates(details);
            if (!coords) return;
            const currentLat = String(values[activeCols.LATITUDE] == null ? '' : values[activeCols.LATITUDE]).trim();
            const currentLng = String(values[activeCols.LONGITUDE] == null ? '' : values[activeCols.LONGITUDE]).trim();
            const incomingLat = String(coords.lat);
            const incomingLng = String(coords.lng);
            const shouldApply = updateMode === 'refresh-all'
              ? currentLat !== incomingLat || currentLng !== incomingLng
              : !currentLat || !currentLng;
            if (!shouldApply) return;
            if (!dryRun) {
              values[activeCols.LATITUDE] = coords.lat;
              values[activeCols.LONGITUDE] = coords.lng;
              updated.push('Coordinates');
            } else {
              preview.push('Coordinates');
            }
            return;
          }

          const definition = FORCE_UPDATE_FIELD_DEFS[fieldKey];
          if (!definition) return;
          const columnIndex = activeCols[definition.column];
          if (!Number.isInteger(columnIndex) || columnIndex < 0) return;
          const incomingValue = String(details && details[definition.detailsKey] != null ? details[definition.detailsKey] : '').trim();
          if (!incomingValue) return;
          const currentValue = String(values[columnIndex] == null ? '' : values[columnIndex]).trim();
          const shouldApply = updateMode === 'refresh-all'
            ? currentValue !== incomingValue
            : !currentValue;
          if (!shouldApply) return;
          if (!dryRun) {
            values[columnIndex] = details[definition.detailsKey];
            updated.push(definition.label);
          } else {
            preview.push(definition.label);
          }
        });

        const appliedFields = dryRun ? preview : updated;
        if (appliedFields.length > 0) {
          updatedCount++;
          if (!dryRun) changedRows.push(buildChangedWorkbookRow(place, i, values));
          results.push({ name, status: dryRun ? 'would-update' : 'updated', message: `${dryRun ? 'Would update' : 'Updated'}: ${appliedFields.join(', ')}` });
        } else {
          skippedCount++;
          markSkipReason(updateMode === 'refresh-all' ? 'google-returned-no-new-values' : 'google-returned-no-missing-values');
          results.push({ name, status: 'skipped', message: 'No new data from API' });
        }
      } catch (e) {
        errorCount++;
        results.push({ name: '(error)', status: 'error', message: e.message });
      }

      if ((i + 1) % 5 === 0 || i === adventuresData.length - 1) {
        const percent = Math.round(((i + 1) / adventuresData.length) * 100);
        updateDisplay(`
          <div style="padding: 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px;">
            <div style="font-weight: 600; color: #1e40af; margin-bottom: 12px;">
              ${dryRun ? '🧪 DRY RUN' : '⏳ Processing'} Google Field Refresh
            </div>
            <div style="font-size:12px;color:#334155;margin-bottom:10px;">Fields: <strong>${selectedFieldLabels.join(', ')}</strong></div>
            <div style="font-size:12px;color:#334155;margin-bottom:10px;">Mode: <strong>${modeLabel}</strong></div>
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
      operation: 'force-update-all-fields',
      dryRun,
      updatedCount,
      changedRows
    });

    updateDisplay(`<div style="padding:16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;">
      <div style="font-weight:600;color:#166534;margin-bottom:8px;">${dryRun ? '🧪 Dry Run Complete' : '✅ Complete'} - Google Field Refresh</div>
      <div style="font-size:13px;color:#374151;">✅ Updated: ${updatedCount} &nbsp; ⏭ Skipped: ${skippedCount} &nbsp; ❌ Errors: ${errorCount}</div>
      <div style="font-size:12px;color:#374151;margin-top:6px;">Fields: <strong>${selectedFieldLabels.join(', ')}</strong> • Mode: <strong>${modeLabel}</strong></div>
      <div style="font-size:12px;color:${persistence.persisted ? '#047857' : '#92400e'};margin-top:8px;">💾 Workbook write: ${persistence.persisted ? 'saved to Excel' : `not persisted (${persistence.reason || persistence.mode})`}</div>
    </div>`);

    const operationDiagnostics = buildOperationDiagnostics();
    recordGoogleAutomationRunSummary('force-update-all-fields', updateMode, {
      dryRun,
      success: errorCount === 0,
      target: String(mainWindow.tableName || '').trim(),
      summary: `${dryRun ? 'Previewed' : 'Processed'} ${updatedCount} updated, ${skippedCount} skipped, ${errorCount} errors`,
      totals: {
        totalRows: adventuresData.length,
        updatedRows: updatedCount,
        skippedRows: skippedCount,
        errorRows: errorCount,
        persistedRows: persistence.persistedRows
      },
      skipReasonCounts: operationDiagnostics.skipReasonCounts,
      googleApi: operationDiagnostics.googleApi,
      samples: Array.isArray(results) ? results.slice(0, 6).map((item) => ({
        name: String(item && item.name || '').trim(),
        status: String(item && item.status || 'unknown').trim(),
        reason: String(item && item.message || '').trim(),
        placeId: ''
      })) : [],
      fields: selectedFields.slice()
    });

    return {
      success: true,
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
      verificationReason: persistence.verificationReason,
      updateDescriptionsDiagnostics: operationDiagnostics,
      updateMode,
      fields: selectedFields.slice()
    };
  } catch (err) {
    console.error('❌ Error force-updating fields:', err);
    updateDisplay(`<div style="padding:16px;background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;color:#7f1d1d;"><strong>❌ Error:</strong> ${err.message}</div>`);
    const operationDiagnostics = buildOperationDiagnostics();
    recordGoogleAutomationRunSummary('force-update-all-fields', updateMode, {
      dryRun,
      success: false,
      target: String(mainWindow.tableName || '').trim(),
      summary: String(err && err.message ? err.message : 'Force update all failed'),
      totals: {
        totalRows: adventuresData.length,
        updatedRows: updatedCount,
        skippedRows: skippedCount,
        errorRows: errorCount || 1,
        persistedRows: 0
      },
      skipReasonCounts: operationDiagnostics.skipReasonCounts,
      googleApi: operationDiagnostics.googleApi,
      samples: Array.isArray(results) ? results.slice(0, 6).map((item) => ({
        name: String(item && item.name || '').trim(),
        status: String(item && item.status || 'unknown').trim(),
        reason: String(item && item.message || '').trim(),
        placeId: ''
      })) : [],
      fields: selectedFields.slice()
    });
    return { success: false, error: err.message, updateDescriptionsDiagnostics: operationDiagnostics, updateMode, fields: selectedFields.slice() };
  }
};

window.handleBulkRefreshCoordinates = async function(displayElement, dryRun = false, overwrite = false) {
  return window.handleForceUpdateAllFields(displayElement, dryRun, {
    fields: ['coordinates'],
    updateMode: overwrite ? 'refresh-all' : 'missing-only'
  });
};

window.handleBulkRefreshRatings = async function(displayElement, dryRun = false, overwrite = false) {
  return window.handleForceUpdateAllFields(displayElement, dryRun, {
    fields: ['rating'],
    updateMode: overwrite ? 'refresh-all' : 'missing-only'
  });
};

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

