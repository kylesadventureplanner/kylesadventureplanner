#!/usr/bin/env node
/*
 * Control ownership check
 * Flags controls that appear to be owned by both inline onclick and delegated JS handlers.
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SCAN_DIRS = ['HTML Files', 'JS Files'];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
	const full = path.join(dir, entry.name);
	if (entry.isDirectory()) walk(full, out);
	else out.push(full);
  }
  return out;
}

const files = SCAN_DIRS.flatMap((d) => walk(path.join(ROOT, d)));
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const jsFiles = files.filter((f) => f.endsWith('.js'));

const inlineOwners = new Map();
const delegatedOwners = new Map();

for (const file of htmlFiles) {
  const text = fs.readFileSync(file, 'utf8');
  const regex = /id\s*=\s*"([^"]+)"[^>]*onclick\s*=\s*"([^"]+)"/g;
  let match;
  while ((match = regex.exec(text))) {
	const id = match[1];
	if (!inlineOwners.has(id)) inlineOwners.set(id, []);
	inlineOwners.get(id).push(path.relative(ROOT, file));
  }
}

for (const file of jsFiles) {
  const text = fs.readFileSync(file, 'utf8');
  const regex = /closest\(\s*['"]#([^'")]+)['"]\s*\)/g;
  let match;
  while ((match = regex.exec(text))) {
	const id = match[1];
	if (!delegatedOwners.has(id)) delegatedOwners.set(id, []);
	delegatedOwners.get(id).push(path.relative(ROOT, file));
  }
}

const duplicates = [];
for (const [id, htmlRefs] of inlineOwners.entries()) {
  if (!delegatedOwners.has(id)) continue;
  duplicates.push({ id, htmlRefs, jsRefs: delegatedOwners.get(id) });
}

if (!duplicates.length) {
  console.log('✅ Ownership check passed: no inline+delegated overlaps found.');
  process.exit(0);
}

console.error('❌ Ownership check failed: controls with both inline onclick and delegated ownership found:');
for (const row of duplicates) {
  console.error(`- #${row.id}`);
  console.error(`  inline: ${Array.from(new Set(row.htmlRefs)).join(', ')}`);
  console.error(`  delegated: ${Array.from(new Set(row.jsRefs)).join(', ')}`);
}
process.exit(1);

