#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const desiredHooksPath = '.githooks';
const desiredHookFile = path.join(repoRoot, desiredHooksPath, 'pre-push');

function log(message) {
  process.stdout.write(`${message}\n`);
}

function runGit(args) {
  return execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8' }).trim();
}

function hasGitRepo() {
  return fs.existsSync(path.join(repoRoot, '.git'));
}

function install() {
  if (process.env.CI === 'true' || process.env.CI === '1') {
    log('[hooks] CI detected; skipping git hooks install.');
    return;
  }

  if (process.env.SKIP_GIT_HOOKS === '1') {
    log('[hooks] SKIP_GIT_HOOKS=1 set; skipping git hooks install.');
    return;
  }

  if (!hasGitRepo()) {
    log('[hooks] No .git directory found; skipping git hooks install.');
    return;
  }

  try {
    runGit(['--version']);
  } catch (_error) {
    log('[hooks] git is unavailable; skipping git hooks install.');
    return;
  }

  let existingHooksPath = '';
  try {
    existingHooksPath = runGit(['config', '--get', 'core.hooksPath']);
  } catch (_error) {
    existingHooksPath = '';
  }

  if (existingHooksPath && existingHooksPath !== desiredHooksPath && process.env.FORCE_GIT_HOOKS !== '1') {
    log(`[hooks] Existing core.hooksPath is "${existingHooksPath}"; leaving unchanged.`);
    log('[hooks] Set FORCE_GIT_HOOKS=1 to override, or run: git config core.hooksPath .githooks');
    return;
  }

  runGit(['config', 'core.hooksPath', desiredHooksPath]);

  if (fs.existsSync(desiredHookFile)) {
    fs.chmodSync(desiredHookFile, 0o755);
  }

  log('[hooks] Installed git hooks path: .githooks');
  log('[hooks] pre-push will run: npm run reliability:prepush');
}

install();

