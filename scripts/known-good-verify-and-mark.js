#!/usr/bin/env node
'use strict';

const path = require('path');
const { execFileSync, execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const MARK_SCRIPT = path.join(__dirname, 'known-good-mark.js');

function parseArgs(argv) {
  const args = {
    testScript: '',
    testCmd: '',
    name: '',
    note: '',
    tag: '',
    dryRun: false,
    help: false,
    passthrough: []
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = String(argv[i] || '');
    if (!token) continue;

    if (token === '--help' || token === '-h') {
      args.help = true;
      continue;
    }
    if (token === '--dry-run') {
      args.dryRun = true;
      continue;
    }

    if (token.startsWith('--test-script=')) {
      args.testScript = token.slice('--test-script='.length).trim();
      continue;
    }
    if (token === '--test-script') {
      args.testScript = String(argv[i + 1] || '').trim();
      i += 1;
      continue;
    }

    if (token.startsWith('--test-cmd=')) {
      args.testCmd = token.slice('--test-cmd='.length).trim();
      continue;
    }
    if (token === '--test-cmd') {
      args.testCmd = String(argv[i + 1] || '').trim();
      i += 1;
      continue;
    }

    if (token.startsWith('--name=')) {
      args.name = token.slice('--name='.length).trim();
      continue;
    }
    if (token === '--name') {
      args.name = String(argv[i + 1] || '').trim();
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
      continue;
    }

    args.passthrough.push(token);
  }

  return args;
}

function printHelp() {
  const lines = [
    'Usage: node scripts/known-good-verify-and-mark.js [options]',
    '',
    'Runs a chosen smoke test first and only marks known-good if it passes.',
    '',
    'Options:',
    '  --test-script [name]  NPM script to run (example: reliability:smoke)',
    '  --test-cmd [command]  Raw shell command to run as smoke test',
    '  --name [label]        Known-good label passed to known-good-mark',
    '  --note [text]         Note passed to known-good-mark',
    '  --tag [name]          Optional git tag passed to known-good-mark',
    '  --dry-run             Pass dry-run to known-good-mark',
    '  -h, --help            Show this help',
    '',
    'Examples:',
    '  npm run known-good:verify-and-mark -- --test-script reliability:smoke --name "nature-buttons-fixed"',
    '  npm run known-good:verify-and-mark -- --test-cmd "npx playwright test tests/nature-subtabs-smoke.spec.js --workers=1" --name "nature-buttons-fixed"'
  ];
  console.log(lines.join('\n'));
}

function runSmoke(args) {
  if (args.testScript) {
    console.log(`[known-good] Running smoke test script: npm run ${args.testScript}`);
    execFileSync('npm', ['run', args.testScript], {
      cwd: ROOT,
      stdio: 'inherit'
    });
    return;
  }

  if (args.testCmd) {
    console.log(`[known-good] Running smoke test command: ${args.testCmd}`);
    execSync(args.testCmd, {
      cwd: ROOT,
      stdio: 'inherit',
      shell: true
    });
    return;
  }

  throw new Error('Missing required smoke target. Provide --test-script or --test-cmd.');
}

function runMark(args) {
  const markArgs = [];
  if (args.name) markArgs.push('--name', args.name);
  if (args.note) markArgs.push('--note', args.note);
  if (args.tag) markArgs.push('--tag', args.tag);
  if (args.dryRun) markArgs.push('--dry-run');
  if (Array.isArray(args.passthrough) && args.passthrough.length) {
    markArgs.push(...args.passthrough);
  }

  console.log('[known-good] Smoke passed. Creating known-good marker...');
  execFileSync('node', [MARK_SCRIPT, ...markArgs], {
    cwd: ROOT,
    stdio: 'inherit'
  });
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  try {
    runSmoke(args);
  } catch (error) {
    console.error(`[known-good] Smoke test failed. Marker was not created. ${String(error && error.message ? error.message : error)}`);
    process.exitCode = 1;
    return;
  }

  try {
    runMark(args);
  } catch (error) {
    console.error(`[known-good] Marker creation failed. ${String(error && error.message ? error.message : error)}`);
    process.exitCode = 1;
  }
}

main();

