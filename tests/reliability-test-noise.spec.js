const { test, expect } = require('@playwright/test');
const { isIgnoredExtensionNoise } = require('./reliability-test');

test.describe('isIgnoredExtensionNoise', () => {
  test('ignores known browser-extension noise', () => {
    expect(isIgnoredExtensionNoise('chrome-extension://abcdef/script.js failed', '')).toBe(true);
    expect(isIgnoredExtensionNoise('LastPass content script warning', '')).toBe(true);
  });

  test('ignores intentional Graph workbook probe 404s', () => {
    const msg = 'Failed to load resource: the server responded with a status of 404 (Not Found)';
    const url = 'https://graph.microsoft.com/v1.0/me/drive/root:/Nature_Locations.xlsx:/workbook/tables/Nature_Locations/columns?$select=name,index';
    expect(isIgnoredExtensionNoise(msg, url)).toBe(true);

    const msgWithUrl = `${msg} (${url})`;
    expect(isIgnoredExtensionNoise(msgWithUrl, '')).toBe(true);
  });

  test('ignores transient localhost JS asset network drops', () => {
    const resetDecoded = 'Failed to load resource: net::ERR_CONNECTION_RESET (http://127.0.0.1:4321/JS Files/runtime-hotfixes.js)';
    const socketEncoded = 'Failed to load resource: net::ERR_SOCKET_NOT_CONNECTED (http://127.0.0.1:4321/JS%20Files/diagnostics-reporting-utils.js)';
    expect(isIgnoredExtensionNoise(resetDecoded, '')).toBe(true);
    expect(isIgnoredExtensionNoise(socketEncoded, '')).toBe(true);
  });

  test('does not ignore real application errors', () => {
    const realError = 'TypeError: Cannot read properties of undefined (reading \"foo\")';
    const nonWorkbook404 = 'Failed to load resource: the server responded with a status of 404 (Not Found) (https://api.example.com/v1/data)';
    expect(isIgnoredExtensionNoise(realError, '')).toBe(false);
    expect(isIgnoredExtensionNoise(nonWorkbook404, '')).toBe(false);
  });
});

