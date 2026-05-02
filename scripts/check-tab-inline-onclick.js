#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '..');
const tabsDir = path.join(workspaceRoot, 'HTML Files', 'tabs');

function listHtmlFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      listHtmlFiles(fullPath, out);
      continue;
    }
    if (/\.html$/i.test(entry.name)) out.push(fullPath);
  }
  return out;
}

function findInlineOnclickViolations(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const lines = text.split(/\r?\n/);
  const matches = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (/onclick\s*=\s*/i.test(lines[index])) {
      matches.push({
        filePath,
        lineNumber: index + 1,
        line: lines[index].trim()
      });
    }
  }
  return matches;
}

function run() {
  if (!fs.existsSync(tabsDir)) {
    console.log('Inline onclick tab check skipped: HTML Files/tabs directory not found.');
    return 0;
  }

  const htmlFiles = listHtmlFiles(tabsDir);
  const violations = htmlFiles.flatMap(findInlineOnclickViolations);

  if (!violations.length) {
    console.log(`✅ Inline onclick tab check passed (${htmlFiles.length} tab HTML files scanned).`);
    return 0;
  }

  console.error('❌ Inline onclick tab check failed. Replace inline onclick handlers with delegated data-* actions.');
  violations.forEach((entry) => {
    const relPath = path.relative(workspaceRoot, entry.filePath);
    console.error(` - ${relPath}:${entry.lineNumber}`);
    console.error(`   ${entry.line}`);
  });
  console.error(`Found ${violations.length} inline onclick occurrence(s) across ${new Set(violations.map((entry) => entry.filePath)).size} file(s).`);
  return 1;
}

process.exitCode = run();

