const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const expectedPath = process.argv[2]
  || path.join(process.cwd(), 'tests', 'mobile-ux-snapshots.spec.js-snapshots', 'index-mobile-darwin.png');
const actualPath = process.argv[3]
  || path.join(process.cwd(), 'test-results', 'mobile-ux-snapshots-Mobile-1f63a--snapshots-across-key-pages', 'index-mobile-actual.png');
const outPath = process.argv[4]
  || path.join(process.cwd(), 'artifacts', 'mobile-row-diff-heatmap.json');

function readPng(filePath) {
  const buf = fs.readFileSync(filePath);
  return PNG.sync.read(buf);
}

function summarizeBands(rows, minBandHeight) {
  const bands = [];
  let start = null;
  let maxRatio = 0;

  rows.forEach((row, idx) => {
    if (row.diffRatio > 0) {
      if (start === null) {
        start = idx;
        maxRatio = row.diffRatio;
      } else if (row.diffRatio > maxRatio) {
        maxRatio = row.diffRatio;
      }
      return;
    }

    if (start !== null) {
      const end = idx - 1;
      if (end - start + 1 >= minBandHeight) {
        bands.push({ startRow: start, endRow: end, height: end - start + 1, peakRatio: Number(maxRatio.toFixed(4)) });
      }
      start = null;
      maxRatio = 0;
    }
  });

  if (start !== null) {
    const end = rows.length - 1;
    if (end - start + 1 >= minBandHeight) {
      bands.push({ startRow: start, endRow: end, height: end - start + 1, peakRatio: Number(maxRatio.toFixed(4)) });
    }
  }

  return bands;
}

function bucketLine(rows, start, end) {
  const windowRows = rows.slice(start, end);
  if (!windowRows.length) return ' ';
  const avg = windowRows.reduce((sum, row) => sum + row.diffRatio, 0) / windowRows.length;
  if (avg === 0) return ' ';
  if (avg < 0.02) return '.';
  if (avg < 0.05) return ':';
  if (avg < 0.1) return '*';
  if (avg < 0.2) return 'o';
  if (avg < 0.35) return 'O';
  return '#';
}

(function main() {
  if (!fs.existsSync(expectedPath)) {
    throw new Error(`Expected image not found: ${expectedPath}`);
  }
  if (!fs.existsSync(actualPath)) {
    throw new Error(`Actual image not found: ${actualPath}`);
  }

  const expected = readPng(expectedPath);
  const actual = readPng(actualPath);

  const overlapWidth = Math.min(expected.width, actual.width);
  const overlapHeight = Math.min(expected.height, actual.height);
  const rows = [];

  for (let y = 0; y < overlapHeight; y += 1) {
    let diffPixels = 0;
    for (let x = 0; x < overlapWidth; x += 1) {
      const idx = (overlapWidth * y + x) << 2;
      const eIdx = (expected.width * y + x) << 2;
      const aIdx = (actual.width * y + x) << 2;
      const dr = Math.abs(expected.data[eIdx] - actual.data[aIdx]);
      const dg = Math.abs(expected.data[eIdx + 1] - actual.data[aIdx + 1]);
      const db = Math.abs(expected.data[eIdx + 2] - actual.data[aIdx + 2]);
      const da = Math.abs(expected.data[eIdx + 3] - actual.data[aIdx + 3]);
      if (dr + dg + db + da > 0) diffPixels += 1;
      void idx;
    }

    rows.push({
      y,
      diffPixels,
      diffRatio: diffPixels / overlapWidth
    });
  }

  const totalOverlapDiffPixels = rows.reduce((sum, row) => sum + row.diffPixels, 0);
  const missingTailPixels = expected.height > actual.height
    ? (expected.height - actual.height) * overlapWidth
    : 0;

  const bands = summarizeBands(rows, 8);
  const topRows = [...rows]
    .sort((a, b) => b.diffPixels - a.diffPixels)
    .slice(0, 20)
    .map((row) => ({ y: row.y, diffPixels: row.diffPixels, diffRatio: Number(row.diffRatio.toFixed(4)) }));

  const lineWindow = 24;
  const heatmapLines = [];
  for (let y = 0; y < overlapHeight; y += lineWindow) {
    const end = Math.min(y + lineWindow, overlapHeight);
    heatmapLines.push({
      startRow: y,
      endRow: end - 1,
      symbol: bucketLine(rows, y, end)
    });
  }

  const symbolLine = heatmapLines.map((line) => line.symbol).join('');

  const report = {
    files: {
      expected: path.relative(process.cwd(), expectedPath),
      actual: path.relative(process.cwd(), actualPath)
    },
    dimensions: {
      expected: { width: expected.width, height: expected.height },
      actual: { width: actual.width, height: actual.height },
      overlap: { width: overlapWidth, height: overlapHeight },
      missingTailRows: Math.max(0, expected.height - actual.height)
    },
    totals: {
      overlapDiffPixels: totalOverlapDiffPixels,
      overlapDiffRatio: Number((totalOverlapDiffPixels / (overlapWidth * overlapHeight)).toFixed(6)),
      missingTailPixels,
      missingTailRatioVsExpected: Number((missingTailPixels / (expected.width * expected.height)).toFixed(6))
    },
    bands,
    topRows,
    heatmapLegend: {
      ' ': 'no diff',
      '.': '<2% row diff',
      ':': '2-5% row diff',
      '*': '5-10% row diff',
      o: '10-20% row diff',
      O: '20-35% row diff',
      '#': '>35% row diff'
    },
    heatmapRowsPerSymbol: lineWindow,
    heatmapSymbolLine: symbolLine
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log(`Wrote ${path.relative(process.cwd(), outPath)}`);
  console.log(`Expected ${expected.width}x${expected.height}, actual ${actual.width}x${actual.height}`);
  console.log(`Missing tail rows: ${report.dimensions.missingTailRows}`);
  console.log(`Heatmap: ${symbolLine}`);
})();

