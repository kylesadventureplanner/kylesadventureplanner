#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const KNOWN_GOOD_DIR = path.join(ROOT, 'artifacts', 'known-good');
const DEFAULT_MARKER = path.join(KNOWN_GOOD_DIR, 'latest.json');

function parseArgs(argv) {
  const args = {
    marker: DEFAULT_MARKER,
    out: '',
    help: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = String(argv[i] || '');
    if (token === '--help' || token === '-h') {
      args.help = true;
      continue;
    }
    if (token.startsWith('--marker=')) {
      args.marker = token.slice('--marker='.length).trim() || args.marker;
      continue;
    }
    if (token === '--marker') {
      args.marker = String(argv[i + 1] || '').trim() || args.marker;
      i += 1;
      continue;
    }
    if (token.startsWith('--out=')) {
      args.out = token.slice('--out='.length).trim();
      continue;
    }
    if (token === '--out') {
      args.out = String(argv[i + 1] || '').trim();
      i += 1;
    }
  }

  return args;
}

function printHelp() {
  const lines = [
    'Usage: node scripts/known-good-compare.js [options]',
    '',
    'Options:',
    `  --marker [path]   Baseline marker file (default: ${path.relative(ROOT, DEFAULT_MARKER)})`,
    '  --out [path]      Optional output file path for comparison JSON',
    '  -h, --help        Show this help'
  ];
  console.log(lines.join('\n'));
}

function runGit(args, fallback) {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch (_error) {
    return fallback;
  }
}

function readJson(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(text);
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function resolveMarkerPath(markerArg) {
  if (path.isAbsolute(markerArg)) return markerArg;
  return path.join(ROOT, markerArg);
}

function getChangedFilesSince(commit) {
  const diffText = runGit(['--no-pager', 'diff', '--name-status', `${commit}..HEAD`], '');
  if (!diffText) return [];
  return diffText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s+/);
      return {
        status: parts[0] || '',
        path: parts.slice(1).join(' ')
      };
    });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const markerPath = resolveMarkerPath(args.marker || DEFAULT_MARKER);
  if (!fs.existsSync(markerPath)) {
    console.error(`ERROR: Marker not found: ${markerPath}`);
    process.exitCode = 1;
    return;
  }

  const marker = readJson(markerPath);
  const markerCommit = marker && marker.git ? String(marker.git.commit || '').trim() : '';
  if (!markerCommit) {
    console.error('ERROR: Marker is missing git.commit');
    process.exitCode = 1;
    return;
  }

  const currentCommit = runGit(['rev-parse', 'HEAD'], '');
  const currentBranch = runGit(['rev-parse', '--abbrev-ref', 'HEAD'], '');
  const statusPorcelain = runGit(['status', '--porcelain'], '');

  const markerCommitExists = Boolean(runGit(['cat-file', '-e', `${markerCommit}^{commit}`], 'ok') === '');
  const aheadBehindRaw = markerCommitExists
    ? runGit(['rev-list', '--left-right', '--count', `${markerCommit}...HEAD`], '0 0')
    : '0 0';
  const [behindCountRaw, aheadCountRaw] = aheadBehindRaw.split(/\s+/);
  const behindCount = Number(behindCountRaw) || 0;
  const aheadCount = Number(aheadCountRaw) || 0;

  const changedSinceMarker = markerCommitExists ? getChangedFilesSince(markerCommit) : [];
  const report = {
    kind: 'known-good-compare-report',
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    markerFile: path.relative(ROOT, markerPath),
    marker: {
      markerId: marker.markerId || '',
      label: marker.label || '',
      note: marker.note || '',
      createdAt: marker.createdAt || '',
      commit: markerCommit,
      branch: marker && marker.git ? marker.git.branch || '' : '',
      dirtyAtMark: Boolean(marker && marker.git && marker.git.dirty)
    },
    current: {
      commit: currentCommit,
      branch: currentBranch,
      dirtyNow: Boolean(statusPorcelain)
    },
    gitRelation: {
      markerCommitExists,
      behindCount,
      aheadCount
    },
    changedFilesSinceMarker: changedSinceMarker
  };

  const outPath = args.out
    ? (path.isAbsolute(args.out) ? args.out : path.join(ROOT, args.out))
    : path.join(KNOWN_GOOD_DIR, `compare-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);

  ensureDir(path.dirname(outPath));
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(`Comparison report saved: ${path.relative(ROOT, outPath)}`);
  console.log(`Marker: ${report.marker.label || '(unnamed)'} @ ${report.marker.commit.slice(0, 7)}`);
  console.log(`Current: ${String(report.current.commit || '').slice(0, 7)} on ${report.current.branch || '(unknown branch)'}`);
  console.log(`Ahead by ${aheadCount}, behind by ${behindCount}, changed files: ${changedSinceMarker.length}`);
}

main();

