#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..', '..');
const configPath = path.resolve(__dirname, 'wave0-smoke.config.json');

function readUtf8(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function fileExists(relPath) {
  return fs.existsSync(path.resolve(projectRoot, relPath));
}

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    '-' +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function collectFilesRecursive(startDir, out) {
  const entries = fs.readdirSync(startDir, { withFileTypes: true });
  entries.forEach((entry) => {
    if (entry.name === '.git' || entry.name === 'node_modules') return;
    const full = path.join(startDir, entry.name);
    if (entry.isDirectory()) {
      collectFilesRecursive(full, out);
      return;
    }
    if (entry.isFile()) {
      out.push(full);
    }
  });
}

function loadConfig() {
  if (!fs.existsSync(configPath)) {
    throw new Error('Missing config: ' + configPath);
  }
  return JSON.parse(readUtf8(configPath));
}

function runChecks(config) {
  const checks = [];

  // 1) Required files exist
  config.mustExistFiles.forEach((rel) => {
    checks.push({
      id: 'file-exists:' + rel,
      type: 'file-exists',
      target: rel,
      pass: fileExists(rel),
      evidence: fileExists(rel) ? [rel] : ['missing: ' + rel]
    });
  });

  // 2) Required script references in specific files
  config.requiredScriptRefs.forEach((r) => {
    const abs = path.resolve(projectRoot, r.file);
    let pass = false;
    let evidence = [];
    if (fs.existsSync(abs)) {
      const txt = readUtf8(abs);
      pass = txt.includes(r.mustContain);
      evidence = [
        r.file + (pass ? ' contains ' : ' missing ') + r.mustContain
      ];
    } else {
      evidence = ['missing file: ' + r.file];
    }

    checks.push({
      id: 'script-ref:' + r.file + '::' + r.mustContain,
      type: 'script-ref',
      target: r.file,
      pass,
      evidence
    });
  });

  // 3) Required symbols exist somewhere in source text
  const scanRoots = [
    path.resolve(projectRoot, 'kylesadventureplanner/index.html'),
    path.resolve(projectRoot, 'kylesadventureplanner/HTML Files'),
    path.resolve(projectRoot, 'kylesadventureplanner/JS Files')
  ];

  const scanFiles = [];
  scanRoots.forEach((root) => {
    if (!fs.existsSync(root)) return;
    const stat = fs.statSync(root);
    if (stat.isFile()) {
      scanFiles.push(root);
      return;
    }
    collectFilesRecursive(root, scanFiles);
  });

  const sourceFiles = scanFiles.filter((f) => /\.(html|js)$/i.test(f));

  config.requiredSymbols.forEach((sym) => {
    const hits = [];
    const symbolPattern = new RegExp('\\b' + sym.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&') + '\\b');

    sourceFiles.forEach((file) => {
      const txt = readUtf8(file);
      if (symbolPattern.test(txt)) {
        hits.push(toPosix(path.relative(projectRoot, file)));
      }
    });

    checks.push({
      id: 'symbol:' + sym,
      type: 'symbol',
      target: sym,
      pass: hits.length > 0,
      evidence: hits.length ? hits.slice(0, 10) : ['no source hits']
    });
  });

  // 4) Fix stack order in index.html
  const orderFile = config.fixStackOrder.file;
  const orderAbs = path.resolve(projectRoot, orderFile);
  if (fs.existsSync(orderAbs)) {
    const txt = readUtf8(orderAbs);
    const scripts = config.fixStackOrder.scripts;
    const positions = scripts.map((s) => ({ script: s, pos: txt.indexOf(s) }));
    const allFound = positions.every((p) => p.pos >= 0);
    let inOrder = true;
    for (let i = 1; i < positions.length; i++) {
      if (positions[i].pos <= positions[i - 1].pos) {
        inOrder = false;
        break;
      }
    }
    checks.push({
      id: 'fix-stack-order:' + orderFile,
      type: 'fix-stack-order',
      target: orderFile,
      pass: allFound && inOrder,
      evidence: positions.map((p) => p.script + ' @' + p.pos)
    });
  } else {
    checks.push({
      id: 'fix-stack-order:' + orderFile,
      type: 'fix-stack-order',
      target: orderFile,
      pass: false,
      evidence: ['missing file: ' + orderFile]
    });
  }

  // 5) Deprecation candidates should not be directly referenced in active HTML files
  const activeHtml = config.activeHtmlFiles || [];
  config.deprecationCandidates.forEach((candidate) => {
    const matches = [];
    activeHtml.forEach((relHtml) => {
      const absHtml = path.resolve(projectRoot, relHtml);
      if (!fs.existsSync(absHtml)) return;
      const txt = readUtf8(absHtml);
      if (txt.includes(candidate)) {
        matches.push(relHtml);
      }
    });

    checks.push({
      id: 'deprecation-active-html:' + candidate,
      type: 'deprecation-active-html',
      target: candidate,
      pass: matches.length === 0,
      evidence: matches.length ? matches : ['no active HTML references']
    });
  });

  return checks;
}

function writeReports(summary) {
  const reportDir = path.resolve(projectRoot, 'docs/js-audit/reports');
  fs.mkdirSync(reportDir, { recursive: true });

  const stamp = nowStamp();
  const jsonPath = path.join(reportDir, 'wave0-smoke-' + stamp + '.json');
  const mdPath = path.join(reportDir, 'wave0-smoke-' + stamp + '.md');

  fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2) + '\n', 'utf8');

  const lines = [];
  lines.push('# Wave 0 Automated Smoke Report');
  lines.push('');
  lines.push('- Generated: ' + summary.generatedAt);
  lines.push('- Overall: `' + (summary.pass ? 'PASS' : 'FAIL') + '`');
  lines.push('- Passed: ' + summary.passedChecks + '/' + summary.totalChecks);
  lines.push('');
  lines.push('## Check Results');
  lines.push('');
  lines.push('| Status | Check ID | Evidence |');
  lines.push('|---|---|---|');

  summary.checks.forEach((c) => {
    const status = c.pass ? 'PASS' : 'FAIL';
    const evidence = (c.evidence || []).join('; ').replace(/\|/g, '\\|');
    lines.push('| ' + status + ' | `' + c.id + '` | ' + evidence + ' |');
  });

  lines.push('');
  lines.push('## Failures');
  lines.push('');
  if (summary.failures.length === 0) {
    lines.push('- None');
  } else {
    summary.failures.forEach((f) => {
      lines.push('- `' + f.id + '` -> ' + (f.evidence || []).join('; '));
    });
  }

  lines.push('');
  lines.push('## Next Actions');
  lines.push('');
  lines.push('- If FAIL: do not proceed to Wave 1 deletion. Fix failing checks and rerun.');
  lines.push('- If PASS: continue with manual UI checklist for full sign-off.');

  fs.writeFileSync(mdPath, lines.join('\n') + '\n', 'utf8');

  return { jsonPath, mdPath };
}

function main() {
  const config = loadConfig();
  const checks = runChecks(config);
  const failures = checks.filter((c) => !c.pass);
  const summary = {
    generatedAt: new Date().toISOString(),
    pass: failures.length === 0,
    totalChecks: checks.length,
    passedChecks: checks.length - failures.length,
    failedChecks: failures.length,
    checks,
    failures
  };

  const outputs = writeReports(summary);

  console.log('Wave 0 automated smoke: ' + (summary.pass ? 'PASS' : 'FAIL'));
  console.log('Checks: ' + summary.passedChecks + '/' + summary.totalChecks + ' passed');
  console.log('JSON: ' + toPosix(path.relative(projectRoot, outputs.jsonPath)));
  console.log('MD: ' + toPosix(path.relative(projectRoot, outputs.mdPath)));

  if (!summary.pass) {
    process.exitCode = 1;
  }
}

main();

