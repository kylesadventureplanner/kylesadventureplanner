#!/usr/bin/env node
/*
 * Reliability release gate
 * - Requires no blocked rows in BUTTON_MIGRATION_TRACKER.md
 * - Requires evidence links for active/review/done rows
 * - Requires smoke summary pass + startup SLO threshold checks
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const trackerPath = path.join(ROOT, 'docs', 'BUTTON_MIGRATION_TRACKER.md');
const smokePath = path.join(ROOT, 'artifacts', 'reliability-smoke-summary.json');

function fail(message) {
  console.error(`❌ Reliability gate failed: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(trackerPath)) {
  fail('Missing docs/BUTTON_MIGRATION_TRACKER.md');
}

const tracker = fs.readFileSync(trackerPath, 'utf8');
const rowRegex = /^\|\s*`([^`]+)`\s*\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*$/gm;
const rows = [];
let match;
while ((match = rowRegex.exec(tracker))) {
  rows.push({
    tab: match[1].trim(),
    owner: match[2].trim(),
    status: match[3].trim(),
    lastUpdated: match[4].trim(),
    targetWeek: match[5].trim(),
    notes: match[6].trim(),
    evidence: match[7].trim()
  });
}

if (!rows.length) {
  fail('No tracker rows found');
}

const blockedRows = rows.filter((row) => row.status === 'blocked');
if (blockedRows.length) {
  fail(`Blocked tabs present: ${blockedRows.map((row) => row.tab).join(', ')}`);
}

const statusesRequiringEvidence = new Set(['in-progress', 'ready-for-review', 'done']);
const missingEvidence = rows.filter((row) => statusesRequiringEvidence.has(row.status) && (row.evidence === '_none_' || row.evidence === '_pending_' || row.evidence === ''));
if (missingEvidence.length) {
  fail(`Missing evidence links for: ${missingEvidence.map((row) => row.tab).join(', ')}`);
}

if (!fs.existsSync(smokePath)) {
  fail('Missing artifacts/reliability-smoke-summary.json');
}

let smoke;
try {
  smoke = JSON.parse(fs.readFileSync(smokePath, 'utf8'));
} catch (error) {
  fail(`Smoke summary is not valid JSON (${error.message})`);
}

if (!smoke || smoke.pass !== true) {
  fail('Smoke suite did not pass');
}

const p95 = Number(smoke.startupMsP95 || 0);
if (!Number.isFinite(p95) || p95 > 3500) {
  fail(`Startup p95 too high (${p95} ms > 3500 ms target)`);
}

const firstClickSuccess = Number(smoke.firstClickSuccessRate || 0);
if (!Number.isFinite(firstClickSuccess) || firstClickSuccess < 0.99) {
  fail(`First-click success below target (${firstClickSuccess} < 0.99)`);
}

console.log('✅ Reliability gate passed');
process.exit(0);

