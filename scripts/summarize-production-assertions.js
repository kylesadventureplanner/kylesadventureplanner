#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function toIso(value) {
  const d = value ? new Date(value) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toISOString() : '';
}

function compact(text, maxLen = 1400) {
  const safe = String(text || '').replace(/\r/g, '').trim();
  if (!safe) return '';
  if (safe.length <= maxLen) return safe;
  return `${safe.slice(0, maxLen)}...`;
}

function getErrorMessage(result) {
  if (!result || typeof result !== 'object') return '';
  if (result.error && result.error.message) return String(result.error.message);
  if (Array.isArray(result.errors) && result.errors.length > 0) {
    const first = result.errors[0] || {};
    if (first.message) return String(first.message);
    if (first.value) return String(first.value);
  }
  return '';
}

function collectResults(report) {
  const rows = [];

  function walkSuite(suite, parents) {
    const suiteTitle = String((suite && suite.title) || '').trim();
    const pathParts = suiteTitle ? parents.concat(suiteTitle) : parents.slice();

    const specs = Array.isArray(suite && suite.specs) ? suite.specs : [];
    for (const spec of specs) {
      const specTitle = String((spec && spec.title) || '').trim();
      const testTitlePath = specTitle ? pathParts.concat(specTitle) : pathParts.slice();
      const tests = Array.isArray(spec && spec.tests) ? spec.tests : [];
      for (const testEntry of tests) {
        const results = Array.isArray(testEntry && testEntry.results) ? testEntry.results : [];
        for (const result of results) {
          rows.push({
            title: testTitlePath.join(' > '),
            file: String((spec && spec.file) || ''),
            line: Number((spec && spec.line) || 0),
            column: Number((spec && spec.column) || 0),
            status: String((result && result.status) || ''),
            startTime: toIso(result && result.startTime),
            durationMs: Number((result && result.duration) || 0),
            message: getErrorMessage(result)
          });
        }
      }
    }

    const suites = Array.isArray(suite && suite.suites) ? suite.suites : [];
    for (const child of suites) {
      walkSuite(child, pathParts);
    }
  }

  const topSuites = Array.isArray(report && report.suites) ? report.suites : [];
  for (const suite of topSuites) {
    walkSuite(suite, []);
  }

  return rows;
}

function buildSummary(report) {
  const rows = collectResults(report);
  const failedStatuses = new Set(['failed', 'timedOut', 'interrupted']);
  const failures = rows.filter((row) => failedStatuses.has(row.status));
  const passedCount = rows.filter((row) => row.status === 'passed').length;
  const skippedCount = rows.filter((row) => row.status === 'skipped').length;
  const failedCount = failures.length;
  const totalCount = rows.length;

  failures.sort((a, b) => {
    const aT = a.startTime ? Date.parse(a.startTime) : Number.MAX_SAFE_INTEGER;
    const bT = b.startTime ? Date.parse(b.startTime) : Number.MAX_SAFE_INTEGER;
    return aT - bT;
  });

  const firstFailure = failures[0] || null;
  const stats = report && report.stats ? report.stats : {};

  const lines = [];
  lines.push('Production Assertions Triage Summary');
  lines.push(`generatedAt: ${new Date().toISOString()}`);
  lines.push(`tests: total=${totalCount}, passed=${passedCount}, failed=${failedCount}, skipped=${skippedCount}`);
  if (stats && stats.startTime) {
    lines.push(`runStartedAt: ${toIso(stats.startTime) || String(stats.startTime)}`);
  }

  if (!firstFailure) {
    lines.push('firstFailure: none');
    return lines.join('\n') + '\n';
  }

  lines.push('firstFailure:');
  lines.push(`  title: ${firstFailure.title}`);
  lines.push(`  file: ${firstFailure.file}${firstFailure.line ? `:${firstFailure.line}` : ''}`);
  lines.push(`  status: ${firstFailure.status}`);
  lines.push(`  startedAt: ${firstFailure.startTime || 'unknown'}`);
  lines.push(`  durationMs: ${firstFailure.durationMs}`);
  lines.push('  diagnosticsText:');
  const message = compact(firstFailure.message || 'No error message captured.');
  for (const line of message.split('\n')) {
    lines.push(`    ${line}`);
  }

  if (failures.length > 1) {
    lines.push('additionalFailures:');
    failures.slice(1, 3).forEach((row) => {
      lines.push(`  - ${row.title} [${row.status}]`);
    });
  }

  return lines.join('\n') + '\n';
}

function main() {
  const reportPath = process.argv[2] || 'artifacts/production-live-assertions-report.json';
  const outputPath = process.argv[3] || 'artifacts/production-live-assertions-summary.txt';

  const absReport = path.resolve(process.cwd(), reportPath);
  const absOutput = path.resolve(process.cwd(), outputPath);

  if (!fs.existsSync(absReport)) {
    console.error(`Report file not found: ${absReport}`);
    process.exit(1);
  }

  const report = readJson(absReport);
  const summary = buildSummary(report);

  fs.mkdirSync(path.dirname(absOutput), { recursive: true });
  fs.writeFileSync(absOutput, summary, 'utf8');
  process.stdout.write(summary);
}

main();

