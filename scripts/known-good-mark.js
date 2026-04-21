#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'artifacts', 'known-good');

function parseArgs(argv) {
  const args = {
    name: 'baseline',
    note: '',
    tag: '',
    dryRun: false,
    help: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = String(argv[i] || '');
    if (token === '--help' || token === '-h') {
      args.help = true;
      continue;
    }
    if (token === '--dry-run') {
      args.dryRun = true;
      continue;
    }
    if (token.startsWith('--name=')) {
      args.name = token.slice('--name='.length).trim() || args.name;
      continue;
    }
    if (token === '--name') {
      args.name = String(argv[i + 1] || '').trim() || args.name;
      i += 1;
      continue;
    }
    if (token.startsWith('--note=')) {
      args.note = token.slice('--note='.length).trim();
      continue;
    }
    if (token === '--note') {
      args.note = String(argv[i + 1] || '').trim();
      i += 1;
      continue;
    }
    if (token.startsWith('--tag=')) {
      args.tag = token.slice('--tag='.length).trim();
      continue;
    }
    if (token === '--tag') {
      args.tag = String(argv[i + 1] || '').trim();
      i += 1;
    }
  }

  return args;
}

function printHelp() {
  const lines = [
    'Usage: node scripts/known-good-mark.js [options]',
    '',
    'Options:',
    '  --name [label]      Marker label (default: baseline)',
    '  --note [text]       Optional note about what is known-good',
    '  --tag [name]        Optional git tag to create if worktree is clean',
    '  --dry-run           Print marker payload without writing files',
    '  -h, --help          Show this help'
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

function slugify(value) {
  return String(value || 'baseline')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'baseline';
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function buildMarker(args) {
  const createdAt = new Date().toISOString();
  const stamp = createdAt.replace(/[:.]/g, '-');
  const cleanName = slugify(args.name);

  const commit = runGit(['rev-parse', 'HEAD'], '');
  const shortCommit = commit ? runGit(['rev-parse', '--short', 'HEAD'], '') : '';
  const branch = runGit(['rev-parse', '--abbrev-ref', 'HEAD'], '');
  const statusPorcelain = runGit(['status', '--porcelain'], '');
  const dirty = Boolean(statusPorcelain);
  const changedFiles = statusPorcelain
    ? statusPorcelain
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
    : [];

  return {
    kind: 'known-good-marker',
    schemaVersion: 1,
    markerId: `${stamp}-${cleanName}`,
    label: args.name,
    note: args.note || '',
    createdAt,
    git: {
      commit,
      shortCommit,
      branch,
      dirty,
      changedFiles
    },
    runtime: {
      node: process.version,
      platform: process.platform,
      arch: process.arch
    }
  };
}

function maybeCreateTag(tagName, marker) {
  if (!tagName) return { attempted: false, created: false, reason: 'not-requested' };
  if (!marker.git.commit) return { attempted: true, created: false, reason: 'missing-commit' };
  if (marker.git.dirty) return { attempted: true, created: false, reason: 'worktree-dirty' };

  try {
    const message = `Known-good marker: ${marker.label} (${marker.createdAt})`;
    execFileSync('git', ['tag', '-a', tagName, '-m', message], { cwd: ROOT, encoding: 'utf8' });
    return { attempted: true, created: true, reason: '' };
  } catch (error) {
    return {
      attempted: true,
      created: false,
      reason: String(error && error.message ? error.message : error)
    };
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const marker = buildMarker(args);
  if (!marker.git.commit) {
    console.error('ERROR: Could not read git commit. Run this script inside the git workspace.');
    process.exitCode = 1;
    return;
  }

  if (args.dryRun) {
    console.log(JSON.stringify(marker, null, 2));
    return;
  }

  ensureDir(OUT_DIR);
  const markerFileName = `${marker.markerId}.json`;
  const markerPath = path.join(OUT_DIR, markerFileName);
  const latestPath = path.join(OUT_DIR, 'latest.json');

  fs.writeFileSync(markerPath, `${JSON.stringify(marker, null, 2)}\n`, 'utf8');
  fs.writeFileSync(latestPath, `${JSON.stringify(marker, null, 2)}\n`, 'utf8');

  const tagResult = maybeCreateTag(args.tag, marker);

  console.log(`Known-good marker saved: ${path.relative(ROOT, markerPath)}`);
  console.log(`Latest marker updated: ${path.relative(ROOT, latestPath)}`);
  if (tagResult.attempted && tagResult.created) {
    console.log(`Git tag created: ${args.tag}`);
  } else if (tagResult.attempted && !tagResult.created) {
    console.log(`Git tag not created (${tagResult.reason}).`);
  }
}

main();

