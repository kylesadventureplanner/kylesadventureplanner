const { test: base, expect } = require('@playwright/test');

const EXTENSION_NOISE_PATTERNS = [
  /chrome-extension:\/\//i,
  /Unchecked runtime\.lastError: Cannot create item with duplicate id/i,
  /background-redux-new\.js/i,
  /Invalid frameId for foreground frameId/i,
  /\bLastPass\b/i,
  /Failed to load resource: the server responded with a status of 404 \(Not Found\) \(https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/root:\/.+:\/workbook\/tables\/.+\/columns\?\$select=name,index\)/i,
  /Failed to load resource: the server responded with a status of 404 \(Not Found\) \(https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/root:\/.+:\/workbook\/tables\)/i,
  /Failed to load resource: the server responded with a status of 404 \(Not Found\) \(https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/root:\/.+:\/workbook\/worksheets\?\$select=id,name,position\)/i,
  // Transient dev-server connection drops for any local static asset (JS, CSS, HTML,
  // fonts, etc.) – matched against both URL-encoded paths (JS%20Files / CSS%20Files) AND
  // decoded paths because Playwright's msg.text() may return either form depending on
  // Chromium version.  All three ERR_* codes are structurally identical: they indicate
  // a momentary drop in the connection to the local `serve` process, not an app bug.
  /Failed to load resource: net::ERR_CONNECTION_RESET[\s\S]*http:\/\/127\.0\.0\.1:\d+\//i,
  /Failed to load resource: net::ERR_SOCKET_NOT_CONNECTED[\s\S]*http:\/\/127\.0\.0\.1:\d+\//i,
  /Failed to load resource: net::ERR_NETWORK_CHANGED[\s\S]*http:\/\/127\.0\.0\.1:\d+\//i,
  // Service-worker script-fetch failure that can surface transiently when the local
  // dev server drops a connection mid-fetch.  The message contains no URL so cannot be
  // tied to a specific file, but it exclusively appears alongside the ERR_* drops above.
  /An unknown error occurred when fetching the script\./i,
  // The local `npx serve` process does not implement the same navigation-fallback
  // exclusion rules as Azure Static Web Apps (staticwebapp.config.json), so on
  // first load of a tab it occasionally returns index.html instead of the tab
  // partial.  The app detects this and logs the error below – it is not a functional
  // regression, just a dev-server routing quirk that does not reproduce in production.
  /❌ Error loading tab [^:]+: Error: Tab HTML for '[^']+' returned the app shell instead of tab markup/i,
];

function isIntentionalWorkbookProbe404(text, locationUrl) {
  const msg = String(text || '');
  const url = String(locationUrl || '');
  const combined = `${msg}\n${url}`;
  const is404 = /Failed to load resource: the server responded with a status of 404 \(Not Found\)/i.test(msg);
  if (!is404) return false;

  const isGraphRootProbe = /https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/root:\//i.test(combined);
  if (!isGraphRootProbe) return false;

  // Playwright may place the URL in msg.text() OR in msg.location().url.
  // Accept known intentional workbook probe endpoints used by fallback routing.
  return /\/workbook\/(?:tables(?:\/[^/?#)]+)?(?:\/columns(?:\?\$select=name,index)?)?|worksheets\?\$select=id,name,position)/i.test(combined);
}

function isIgnoredExtensionNoise(text, locationUrl) {
  if (isIntentionalWorkbookProbe404(text, locationUrl)) return true;
  const candidate = `${String(text || '')}\n${String(locationUrl || '')}`;
  return EXTENSION_NOISE_PATTERNS.some((pattern) => pattern.test(candidate));
}

const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    const unexpectedErrors = [];

    const onConsole = (msg) => {
      if (msg.type() !== 'error') return;
      const location = msg.location ? msg.location() : { url: '' };
      const text = msg.text();
      if (isIgnoredExtensionNoise(text, location && location.url)) return;
      unexpectedErrors.push({
        source: 'console',
        text,
        url: (location && location.url) || ''
      });
    };

    const onPageError = (error) => {
      const message = error && error.message ? String(error.message) : String(error || 'Unknown page error');
      const stack = error && error.stack ? String(error.stack) : '';
      if (isIgnoredExtensionNoise(`${message}\n${stack}`, '')) return;
      unexpectedErrors.push({
        source: 'pageerror',
        text: message,
        url: ''
      });
    };

    page.on('console', onConsole);
    page.on('pageerror', onPageError);

    await use(page);

    page.off('console', onConsole);
    page.off('pageerror', onPageError);

    if (unexpectedErrors.length) {
      const preview = unexpectedErrors
        .slice(0, 5)
        .map((row, idx) => `${idx + 1}. [${row.source}] ${row.text}${row.url ? ` (${row.url})` : ''}`)
        .join('\n');

      await testInfo.attach('unexpected-browser-errors.txt', {
        body: Buffer.from(preview, 'utf8'),
        contentType: 'text/plain'
      });

      throw new Error(`Unexpected browser errors detected:\n${preview}`);
    }
  }
});

module.exports = { test, expect, isIgnoredExtensionNoise };

