#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const files = {
  editMode: path.join(root, 'HTML Files', 'edit-mode-enhanced.html'),
  explorer: path.join(root, 'JS Files', 'visited-locations-tab-system.js'),
  city: path.join(root, 'JS Files', 'consolidated-city-viewer-system-v7-0-141.js')
};

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function dedupePairs(pairs) {
  const seen = new Set();
  return pairs.filter((entry) => {
    const key = `${entry.workbook}::${entry.table}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseEditModeTargets(text) {
  const out = [];
  const re = /\{\s*id:\s*'[^']+'\s*,\s*label:\s*'[^']+'\s*,\s*filePath:\s*'([^']+)'\s*,\s*tableName:\s*'([^']+)'\s*}/g;
  let match;
  while ((match = re.exec(text))) {
    out.push({ workbook: String(match[1]), table: String(match[2]) });
  }
  return dedupePairs(out);
}

function parseWorkbookTablePairs(text) {
  const out = [];
  const re = /\{\s*workbook:\s*'([^']+)'\s*,\s*table:\s*'([^']+)'/g;
  let match;
  while ((match = re.exec(text))) {
    out.push({ workbook: String(match[1]), table: String(match[2]) });
  }
  return dedupePairs(out);
}

function asSet(pairs) {
  return new Set(pairs.map((entry) => `${entry.workbook}::${entry.table}`));
}

function diffPairs(leftPairs, rightPairs) {
  const right = asSet(rightPairs);
  return leftPairs.filter((entry) => !right.has(`${entry.workbook}::${entry.table}`));
}

function printPairs(label, pairs) {
  console.log(`\n${label} (${pairs.length}):`);
  pairs.forEach((entry) => {
    console.log(` - ${entry.workbook} / ${entry.table}`);
  });
}

function assertExpected(name, actualPairs, expectedPairs) {
  const actualSet = asSet(actualPairs);
  const expectedSet = asSet(expectedPairs);
  const missing = expectedPairs.filter((entry) => !actualSet.has(`${entry.workbook}::${entry.table}`));
  const extra = actualPairs.filter((entry) => !expectedSet.has(`${entry.workbook}::${entry.table}`));

  if (!missing.length && !extra.length) {
    console.log(`\u2705 ${name} matches expected source mapping.`);
    return true;
  }

  console.error(`\u274c ${name} source mapping drift detected.`);
  if (missing.length) {
    console.error('   Missing expected:');
    missing.forEach((entry) => console.error(`   - ${entry.workbook} / ${entry.table}`));
  }
  if (extra.length) {
    console.error('   Unexpected extra:');
    extra.forEach((entry) => console.error(`   - ${entry.workbook} / ${entry.table}`));
  }
  return false;
}

function main() {
  const editModeText = read(files.editMode);
  const explorerText = read(files.explorer);
  const cityText = read(files.city);

  const editModePairs = parseEditModeTargets(editModeText);
  const explorerPairs = parseWorkbookTablePairs(explorerText);
  const cityPairs = parseWorkbookTablePairs(cityText);

  const expectedExplorer = [
    { workbook: 'Nature_Locations.xlsx', table: 'Nature_Locations' },
    { workbook: 'Entertainment_Locations.xlsx', table: 'General_Entertainment' },
    { workbook: 'Retail_Food_and_Drink.xlsx', table: 'Restaurants' },
    { workbook: 'Retail_Food_and_Drink.xlsx', table: 'Coffee' },
    { workbook: 'Retail_Food_and_Drink.xlsx', table: 'Retail' },
    { workbook: 'Entertainment_Locations.xlsx', table: 'Wildlife_Animals' },
    { workbook: 'Entertainment_Locations.xlsx', table: 'Festivals' }
  ];

  const expectedCity = [
    { workbook: 'Retail_Food_and_Drink.xlsx', table: 'Coffee' },
    { workbook: 'Retail_Food_and_Drink.xlsx', table: 'Restaurants' },
    { workbook: 'Retail_Food_and_Drink.xlsx', table: 'Retail' },
    { workbook: 'Nature_Locations.xlsx', table: 'Nature_Locations' },
    { workbook: 'Entertainment_Locations.xlsx', table: 'Festivals' },
    { workbook: 'Entertainment_Locations.xlsx', table: 'Wildlife_Animals' },
    { workbook: 'Entertainment_Locations.xlsx', table: 'General_Entertainment' }
  ];

  const explorerMissingInEditMode = diffPairs(expectedExplorer, editModePairs);
  const cityMissingInEditMode = diffPairs(expectedCity, editModePairs);

  printPairs('Edit Mode targets', editModePairs);
  printPairs('Explorer source routes', expectedExplorer);
  printPairs('City Viewer source routes', expectedCity);

  let ok = true;
  ok = assertExpected('Explorer', explorerPairs, expectedExplorer) && ok;
  ok = assertExpected('City Viewer', cityPairs, expectedCity) && ok;

  if (explorerMissingInEditMode.length) {
    ok = false;
    console.error('\n\u274c Explorer has source routes not present in Edit Mode targets:');
    explorerMissingInEditMode.forEach((entry) => console.error(` - ${entry.workbook} / ${entry.table}`));
  }

  if (cityMissingInEditMode.length) {
    ok = false;
    console.error('\n\u274c City Viewer has source routes not present in Edit Mode targets:');
    cityMissingInEditMode.forEach((entry) => console.error(` - ${entry.workbook} / ${entry.table}`));
  }

  if (ok) {
    console.log('\n\u2705 Source-route validation passed. Explorer and City Viewer are aligned with Edit Mode targets.');
    process.exit(0);
  }

  process.exit(1);
}

main();


