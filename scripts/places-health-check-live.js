const http = require('http');
const path = require('path');
const fs = require('fs/promises');
const { chromium } = require('@playwright/test');

const ROOT_DIR = path.resolve(__dirname, '..');
const HOST = '127.0.0.1';
const DEFAULT_QUERY = String(process.env.PLACES_HEALTH_QUERY || 'Starbucks Columbia SC').trim() || 'Starbucks Columbia SC';
const DEFAULT_PLACE_ID = String(process.env.PLACES_HEALTH_PLACE_ID || '').trim();

function getContentType(filePath) {
  switch (path.extname(filePath).toLowerCase()) {
    case '.html': return 'text/html; charset=utf-8';
    case '.js': return 'application/javascript; charset=utf-8';
    case '.mjs': return 'application/javascript; charset=utf-8';
    case '.css': return 'text/css; charset=utf-8';
    case '.json': return 'application/json; charset=utf-8';
    case '.svg': return 'image/svg+xml';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.gif': return 'image/gif';
    case '.webp': return 'image/webp';
    case '.ico': return 'image/x-icon';
    case '.txt': return 'text/plain; charset=utf-8';
    case '.webmanifest': return 'application/manifest+json; charset=utf-8';
    default: return 'application/octet-stream';
  }
}

function resolveRequestPath(requestUrl) {
  const parsed = new URL(requestUrl, `http://${HOST}`);
  let pathname = decodeURIComponent(parsed.pathname || '/');
  if (!pathname || pathname === '/') pathname = '/index.html';
  const normalized = path.normalize(pathname).replace(/^([.][.][/\\])+/, '');
  const absolutePath = path.resolve(ROOT_DIR, `.${normalized.startsWith(path.sep) ? normalized : `${path.sep}${normalized}`}`);
  if (!absolutePath.startsWith(ROOT_DIR)) {
    throw new Error(`Blocked path traversal for ${pathname}`);
  }
  return absolutePath;
}

async function createStaticServer() {
  const server = http.createServer(async (req, res) => {
    try {
      let filePath = resolveRequestPath(req.url || '/');
      let stat = await fs.stat(filePath).catch(() => null);
      if (stat && stat.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
        stat = await fs.stat(filePath).catch(() => null);
      }
      if (!stat || !stat.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not found');
        return;
      }
      const body = await fs.readFile(filePath);
      res.writeHead(200, { 'Content-Type': getContentType(filePath) });
      res.end(body);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`Server error: ${error.message}`);
    }
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, HOST, resolve);
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Unable to determine static server address');
  }

  return {
    server,
    origin: `http://${HOST}:${address.port}`,
    async close() {
      await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  };
}

function compactStep(step) {
  return {
    key: step.key,
    status: step.status,
    detail: step.detail,
    advice: step.advice || '',
    sample: step.sample || null
  };
}

(async () => {
  const staticServer = await createStaticServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const appUrl = `${staticServer.origin}/index.html`;

  try {
    console.log(`[info] Serving workspace at ${staticServer.origin}`);
    console.log(`[info] Opening ${appUrl}`);
    await page.goto(appUrl, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForFunction(
      () => typeof window.runPlacesHealthCheck === 'function' && window.google && window.google.maps && typeof window.google.maps.importLibrary === 'function',
      null,
      { timeout: 120000 }
    );
    console.log('[info] App + Google Maps loader are ready');

    const health = await page.evaluate(async ({ query, placeId }) => {
      return window.runPlacesHealthCheck({ query, placeId });
    }, { query: DEFAULT_QUERY, placeId: DEFAULT_PLACE_ID });

    console.log('[health]', JSON.stringify({
      status: health.status,
      ok: health.ok,
      summary: health.summary,
      query: health.query,
      placeIdUsed: health.placeIdUsed,
      steps: Array.isArray(health.steps) ? health.steps.map(compactStep) : []
    }, null, 2));

    const direct = await page.evaluate(async (query) => {
      const results = await window.searchPlaces(query);
      const top = Array.isArray(results) && results.length ? results[0] : null;
      const details = top && top.placeId ? await window.getPlaceDetails(top.placeId) : null;
      return {
        searchCount: Array.isArray(results) ? results.length : 0,
        top: top ? {
          placeId: top.placeId,
          name: top.name,
          address: top.address
        } : null,
        details: details ? {
          name: details.name,
          address: details.address,
          website: details.website || ''
        } : null
      };
    }, DEFAULT_QUERY);
    console.log('[direct]', JSON.stringify(direct, null, 2));

    const [popup] = await Promise.all([
      page.waitForEvent('popup', { timeout: 15000 }),
      page.evaluate((origin) => window.open(`${origin}/HTML%20Files/edit-mode-enhanced.html`, '_blank'), staticServer.origin)
    ]);
    await popup.waitForLoadState('domcontentloaded', { timeout: 120000 });
    await popup.waitForFunction(() => typeof window.testGooglePlacesAPI === 'function', null, { timeout: 120000 });
    await popup.evaluate((query) => {
      const automationTabBtn = document.getElementById('tab-btn-automation');
      if (automationTabBtn && typeof automationTabBtn.click === 'function') automationTabBtn.click();
      const typeEl = document.getElementById('singleInputType');
      const inputEl = document.getElementById('singleInput');
      if (typeEl) typeEl.value = 'placeNameCity';
      if (inputEl) inputEl.value = query;
    }, DEFAULT_QUERY);
    const popupResult = await popup.evaluate(async () => {
      const ok = await window.testGooglePlacesAPI();
      return {
        ok,
        text: String(document.getElementById('api-test-status')?.textContent || '').replace(/\s+/g, ' ').trim()
      };
    });
    console.log('[popup]', JSON.stringify(popupResult, null, 2));

    const failed = !health.ok || !direct.details || !popupResult.ok;
    if (failed) {
      throw new Error('Places health validation did not fully pass. Inspect [health], [direct], and [popup] output above.');
    }

    console.log('[success] Live Places validation passed.');
  } finally {
    await browser.close().catch(() => {});
    await staticServer.close().catch(() => {});
  }
})().catch((error) => {
  console.error('[fatal]', error && error.stack ? error.stack : error);
  process.exit(1);
});

