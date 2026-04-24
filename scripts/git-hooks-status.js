#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const expectedHooksPath = '.githooks';
const prePushHookPath = path.join(repoRoot, expectedHooksPath, 'pre-push');

function print(line) {
  process.stdout.write(`${line}\n`);
}

function runGit(args) {
  return execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8' }).trim();
}

function existsGitRepo() {
  return fs.existsSync(path.join(repoRoot, '.git'));
}

function isExecutable(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.X_OK);
    return true;
  } catch (_error) {
    return false;
  }
}

function status() {
  const checks = [];

  if (!existsGitRepo()) {
    print('[hooks:status] FAIL no .git directory found at repo root');
    process.exit(1);
  }

  try {
    runGit(['--version']);
    checks.push({ ok: true, label: 'git available' });
  } catch (_error) {
    checks.push({ ok: false, label: 'git available' });
  }

  let hooksPath = '';
  try {
    hooksPath = runGit(['config', '--get', 'core.hooksPath']);
  } catch (_error) {
    hooksPath = '';
  }
  const hooksPathNormalized = String(hooksPath || '').trim().replace(/^\.\//, '');
  checks.push({
    ok: hooksPathNormalized === expectedHooksPath,
    label: `core.hooksPath=${hooksPath || '(unset)'}`
  });

  const hookExists = fs.existsSync(prePushHookPath);
  checks.push({ ok: hookExists, label: `.githooks/pre-push exists=${hookExists ? 'yes' : 'no'}` });

  const hookExecutable = hookExists && isExecutable(prePushHookPath);
  checks.push({ ok: hookExecutable, label: `.githooks/pre-push executable=${hookExecutable ? 'yes' : 'no'}` });

  checks.forEach((check) => {
    print(`[hooks:status] ${check.ok ? 'OK' : 'FAIL'} ${check.label}`);
  });

  const failed = checks.some((check) => !check.ok);
  if (failed) {
    print('[hooks:status] action required: run npm run hooks:install');
    process.exit(1);
  }

  print('[hooks:status] configured');
}

status();


