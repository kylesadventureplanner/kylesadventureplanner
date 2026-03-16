const fs = require('fs');
const path = require('path');

const files = [
  '/Users/kylechavez/WebstormProjects/Kyles_Adventure_Finder/kylesadventureplanner/index.html',
  '/Users/kylechavez/WebstormProjects/Kyles_Adventure_Finder/kylesadventureplanner/HTML Files/automation-control-panel.html'
];

function scanFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  const results = [];
  let m;
  let index = 0;

  while ((m = re.exec(text))) {
    index += 1;
    const code = m[1] || '';
    const startLine = text.slice(0, m.index).split('\n').length;
    try {
      new Function(code);
      results.push({ inlineScript: index, startLine, ok: true });
    } catch (err) {
      results.push({
        inlineScript: index,
        startLine,
        ok: false,
        message: err && err.message ? String(err.message) : String(err)
      });
    }
  }

  return {
    file: filePath,
    totalInlineScripts: index,
    syntaxErrors: results.filter((r) => !r.ok),
    results
  };
}

const summary = {
  generatedAt: new Date().toISOString(),
  scans: files.map(scanFile)
};

const outPath = '/Users/kylechavez/WebstormProjects/Kyles_Adventure_Finder/docs/js-audit/reports/inline-script-syntax-scan.json';
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(summary, null, 2) + '\n', 'utf8');

