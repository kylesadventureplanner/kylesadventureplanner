#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '..');
const testsDir = path.join(workspaceRoot, 'tests');

function listSpecFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listSpecFiles(full));
      continue;
    }
    if (/\.spec\.js$/i.test(entry.name)) files.push(full);
  }
  return files;
}

function readTopLevelFunctionNames(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const names = [];
  const re = /^\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/gm;
  let match;
  while ((match = re.exec(text)) != null) {
    names.push(match[1]);
  }
  return names;
}

function run() {
  if (!fs.existsSync(testsDir)) {
    console.log('No tests directory found; skipping helper naming check.');
    return 0;
  }

  const specFiles = listSpecFiles(testsDir);
  const violations = [];

  for (const specFile of specFiles) {
    const helperNames = readTopLevelFunctionNames(specFile);
    helperNames.forEach((name) => {
      const hasKeyword = /(assert|poll|run)/i.test(name);
      const hasPrefix = /^(assert|poll|run)/.test(name);
      if (hasKeyword && !hasPrefix) {
        violations.push({ specFile, name });
      }
    });
  }

  if (!violations.length) {
    console.log(`Helper naming check passed (${specFiles.length} spec files scanned).`);
    return 0;
  }

  console.error('Helper naming check failed. Use assert*/poll*/run* prefixes for helper names containing assert/poll/run keywords.');
  violations.forEach((entry) => {
    const relPath = path.relative(workspaceRoot, entry.specFile);
    console.error(` - ${relPath}: ${entry.name}`);
  });
  return 1;
}

process.exitCode = run();

