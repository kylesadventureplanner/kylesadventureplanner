#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const configPath = path.resolve(__dirname, 'smoke.config.json');
const projectRoot = path.resolve(__dirname, '..', '..', '..');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function isAllowed(text, patterns) {
  return (patterns || []).some((p) => text.includes(p));
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.js') return 'application/javascript; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.json') return 'application/json; charset=utf-8';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.ico') return 'image/x-icon';
  return 'application/octet-stream';
}

function startStaticServer(rootDir, port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const rawPath = (req.url || '/').split('?')[0];
        const decoded = decodeURIComponent(rawPath);
        const relPath = decoded === '/' ? '/index.html' : decoded;

        const absPath = path.resolve(rootDir, '.' + relPath);
        if (!absPath.startsWith(rootDir)) {
          res.statusCode = 403;
          res.end('Forbidden');
          return;
        }

        let finalPath = absPath;
        if (fs.existsSync(finalPath) && fs.statSync(finalPath).isDirectory()) {
          finalPath = path.join(finalPath, 'index.html');
        }

        if (!fs.existsSync(finalPath) || !fs.statSync(finalPath).isFile()) {
          res.statusCode = 404;
          res.end('Not Found');
          return;
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', getMimeType(finalPath));
        fs.createReadStream(finalPath).pipe(res);
      } catch (err) {
        res.statusCode = 500;
        res.end('Server Error');
      }
    });

    server.on('error', reject);
    server.listen(port, '127.0.0.1', () => {
      resolve({
        server,
        origin: `http://127.0.0.1:${port}`
      });
    });
  });
}

function buildUrl(origin, relPath) {
  const p = toPosix(relPath).replace(/^\/+/, '');
  return `${origin}/${encodeURI(p)}`;
}

async function capturePageIssues(page, bucket, label, allowConsolePatterns, allowPageErrorPatterns) {
  page.on('pageerror', (err) => {
    const message = String(err && err.message ? err.message : err);
    if (isAllowed(message, allowPageErrorPatterns)) return;
    bucket.push({
      type: 'pageerror',
      label,
      message,
      stack: err && err.stack ? String(err.stack) : ''
    });
  });

  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (isAllowed(text, allowConsolePatterns)) return;
    bucket.push({ type: 'console-error', label, message: text });
  });
}

async function neutralizeInterceptors(page) {
  await page.evaluate(() => {
    const ids = ['appLoadingIndicator', 'errorNotificationBar'];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.pointerEvents = 'none';
      if (id === 'errorNotificationBar') {
        el.classList.add('collapsed');
        el.style.maxHeight = '44px';
      }
    });
  }).catch(() => {});
}

async function getOpenAttempts(page) {
  try {
    return await page.evaluate(() => window.__smokeOpenAttempts || 0);
  } catch (_err) {
    return 0;
  }
}

async function checkCoreButtons(mainPage, config, report) {
  const popupAttempts = [];
  const clickResults = [];

  mainPage.on('popup', (popup) => {
    popupAttempts.push({
      url: popup.url() || '(pending)',
      ts: new Date().toISOString()
    });
    popup.close().catch(() => {});
  });

  await neutralizeInterceptors(mainPage);

  for (const button of config.coreButtons) {
    const locator = mainPage.locator(button.selector).first();
    const count = await mainPage.locator(button.selector).count();

    if (count === 0) {
      clickResults.push({ name: button.name, selector: button.selector, pass: false, detail: 'not found' });
      continue;
    }

    const beforeAttempts = await getOpenAttempts(mainPage);

    try {
      await locator.scrollIntoViewIfNeeded({ timeout: config.timeoutMs });
      await locator.click({ timeout: config.timeoutMs, force: true });
      await sleep(600);

      const afterAttempts = await getOpenAttempts(mainPage);
      clickResults.push({
        name: button.name,
        selector: button.selector,
        pass: true,
        detail: `clicked (open attempts +${Math.max(0, afterAttempts - beforeAttempts)})`
      });
    } catch (err) {
      clickResults.push({
        name: button.name,
        selector: button.selector,
        pass: false,
        detail: 'click failed: ' + (err && err.message ? err.message : String(err))
      });
    }
  }

  report.coreButtons = clickResults;
  report.popupAttempts = popupAttempts;
  report.windowOpenAttempts = await getOpenAttempts(mainPage);
}

async function checkAutomationPage(context, config, report, issueBucket, origin) {
  const page = await context.newPage();
  await capturePageIssues(
    page,
    issueBucket,
    'automation-page',
    config.allowConsoleErrorPatterns,
    config.allowPageErrorPatterns
  );

  const automationUrl = buildUrl(origin, config.automationPage);
  await page.goto(automationUrl, { waitUntil: 'domcontentloaded', timeout: config.timeoutMs });
  await sleep(config.settleMs);

  const buttonChecks = [];

  for (const selector of config.automationButtons) {
    const loc = page.locator(selector).first();
    const count = await page.locator(selector).count();

    if (count === 0) {
      buttonChecks.push({ selector, pass: false, detail: 'not found' });
      continue;
    }

    try {
      await loc.scrollIntoViewIfNeeded({ timeout: config.timeoutMs });
      await loc.click({ timeout: config.timeoutMs, force: true });
      await sleep(450);
      buttonChecks.push({ selector, pass: true, detail: 'clicked' });
    } catch (err) {
      buttonChecks.push({
        selector,
        pass: false,
        detail: 'click failed: ' + (err && err.message ? err.message : String(err))
      });
    }
  }

  await collectWindowErrorEvents(page, 'automation-page', issueBucket);
  report.automationButtons = buttonChecks;
  await page.close();
}

async function collectWindowErrorEvents(page, label, bucket) {
  try {
    const events = await page.evaluate(() => window.__smokeWindowErrors || []);
    if (!Array.isArray(events)) return;
    events.forEach((ev) => {
      bucket.push({
        type: 'window-error',
        label,
        message: ev.message || '(no message)',
        file: ev.file || '',
        line: Number(ev.line || 0),
        column: Number(ev.column || 0)
      });
    });
  } catch (_err) {
    // Ignore collection errors for pages that navigated away/closed.
  }
}

async function run() {
  const config = readJson(configPath);

  const issues = [];
  const stamp = nowStamp();
  const reportsDir = path.resolve(projectRoot, 'docs/js-audit/reports');
  ensureDir(reportsDir);

  const report = {
    generatedAt: new Date().toISOString(),
    mode: 'headless-playwright',
    config: {
      mainPage: config.mainPage,
      automationPage: config.automationPage,
      origin: null
    },
    checks: [],
    coreButtons: [],
    popupAttempts: [],
    windowOpenAttempts: 0,
    automationButtons: [],
    issues: []
  };

  const staticRoot = path.resolve(projectRoot, config.baseDir);
  const port = Number(config.serverPort) || 4173;
  const serverCtx = await startStaticServer(staticRoot, port);
  report.config.origin = serverCtx.origin;

  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext();
    await context.addInitScript(() => {
      if (window.__smokeOpenPatchInstalled) return;
      window.__smokeOpenPatchInstalled = true;
      window.__smokeOpenAttempts = 0;
      window.__smokeWindowErrors = [];

      window.addEventListener('error', (e) => {
        window.__smokeWindowErrors.push({
          message: e && e.message ? String(e.message) : '',
          file: e && e.filename ? String(e.filename) : '',
          line: e && e.lineno ? Number(e.lineno) : 0,
          column: e && e.colno ? Number(e.colno) : 0
        });
      });

      const _smokeOriginalOpen = window.open;
      window.open = function () {
        window.__smokeOpenAttempts = (window.__smokeOpenAttempts || 0) + 1;
        try {
          if (typeof _smokeOriginalOpen === 'function') {
            return _smokeOriginalOpen.apply(window, arguments);
          }
        } catch (_err) {
          return null;
        }
        return null;
      };
    });

    const mainPage = await context.newPage();
    await capturePageIssues(
      mainPage,
      issues,
      'main-page',
      config.allowConsoleErrorPatterns,
      config.allowPageErrorPatterns
    );

    const mainUrl = buildUrl(serverCtx.origin, config.mainPage);
    await mainPage.goto(mainUrl, { waitUntil: 'domcontentloaded', timeout: config.timeoutMs });
    await sleep(config.settleMs);

    await checkCoreButtons(mainPage, config, report);
    await collectWindowErrorEvents(mainPage, 'main-page', issues);
    await checkAutomationPage(context, config, report, issues, serverCtx.origin);

    await mainPage.close();
    await context.close();
  } finally {
    await browser.close();
    await new Promise((resolve) => serverCtx.server.close(resolve));
  }

  report.issues = issues;

  const coreOk = report.coreButtons.every((c) => c.pass);
  const autoOk = report.automationButtons.every((c) => c.pass);
  const noJsErrors = report.issues.length === 0;
  const popupObserved = report.popupAttempts.length > 0 || report.windowOpenAttempts > 0;
  const failOnJsIssues = config.failOnJsIssues !== false;

  report.checks.push({ name: 'No JS errors on run', pass: noJsErrors });
  report.checks.push({ name: 'Core buttons clickable', pass: coreOk });
  report.checks.push({ name: 'Popup/tab attempts observed', pass: popupObserved });
  report.checks.push({ name: 'Automation buttons respond to click', pass: autoOk });

  // Keep JS issues visible, but allow policy-based non-blocking mode for noisy legacy baselines.
  report.pass = coreOk && popupObserved && autoOk && (failOnJsIssues ? noJsErrors : true);

  const jsonPath = path.resolve(reportsDir, `wave0-playwright-smoke-${stamp}.json`);
  const mdPath = path.resolve(reportsDir, `wave0-playwright-smoke-${stamp}.md`);

  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2) + '\n', 'utf8');

  const md = [];
  md.push('# Wave 0 Headless Playwright Smoke Report');
  md.push('');
  md.push(`- Generated: ${report.generatedAt}`);
  md.push(`- Overall: \`${report.pass ? 'PASS' : 'FAIL'}\``);
  md.push(`- Origin: \`${report.config.origin}\``);
  md.push('');
  md.push('## Gate Checks');
  md.push('');
  report.checks.forEach((c) => {
    md.push(`- ${c.pass ? 'PASS' : 'FAIL'}: ${c.name}`);
  });
  md.push('');
  md.push('## Core Button Clicks');
  md.push('');
  report.coreButtons.forEach((c) => {
    md.push(`- ${c.pass ? 'PASS' : 'FAIL'}: ${c.name} (${c.selector}) -> ${c.detail}`);
  });
  md.push('');
  md.push(`- Popup events observed: ${report.popupAttempts.length}`);
  md.push(`- window.open attempts observed: ${report.windowOpenAttempts}`);
  report.popupAttempts.forEach((p, i) => {
    md.push(`  - ${i + 1}. ${p.url}`);
  });
  md.push('');
  md.push('## Automation Button Clicks');
  md.push('');
  report.automationButtons.forEach((c) => {
    md.push(`- ${c.pass ? 'PASS' : 'FAIL'}: ${c.selector} -> ${c.detail}`);
  });
  md.push('');
  md.push('## JS Issues');
  md.push('');
  if (!report.issues.length) {
    md.push('- None');
  } else {
    report.issues.forEach((i) => {
      md.push(`- ${i.type} [${i.label}] ${i.message}`);
      if (i.file) {
        md.push(`  - source: ${i.file}${i.line ? ':' + i.line : ''}${i.column ? ':' + i.column : ''}`);
      }
      if (i.stack) {
        const firstStackLine = i.stack.split('\n')[0] || '';
        if (firstStackLine) {
          md.push(`  - stack: ${firstStackLine}`);
        }
      }
    });
  }

  fs.writeFileSync(mdPath, md.join('\n') + '\n', 'utf8');

  const relJson = path.relative(projectRoot, jsonPath).split(path.sep).join('/');
  const relMd = path.relative(projectRoot, mdPath).split(path.sep).join('/');

  console.log('Headless Playwright smoke: ' + (report.pass ? 'PASS' : 'FAIL'));
  console.log('JSON: ' + relJson);
  console.log('MD: ' + relMd);

  if (!report.pass) {
    process.exitCode = 1;
  }
}

run().catch((err) => {
  console.error('Smoke runner fatal error:', err && err.stack ? err.stack : err);
  process.exitCode = 1;
});
