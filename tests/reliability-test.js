const { test: base, expect } = require('@playwright/test');

const EXTENSION_NOISE_PATTERNS = [
  /chrome-extension:\/\//i,
  /Unchecked runtime\.lastError: Cannot create item with duplicate id/i,
  /background-redux-new\.js/i,
  /Invalid frameId for foreground frameId/i,
  /\bLastPass\b/i,
  /Failed to load resource: the server responded with a status of 404 \(Not Found\) \(https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/root:\/.+:\/workbook\/tables\/.+\/columns\?\$select=name,index\)/i
];

function isIgnoredExtensionNoise(text, locationUrl) {
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

