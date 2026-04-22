// @ts-check
const { defineConfig } = require('@playwright/test');

const hasAppUrl = Boolean(process.env.APP_URL);

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60 * 1000,
  use: {
    baseURL: process.env.APP_URL || 'http://127.0.0.1:4321',
    trace: 'on-first-retry'
  },
  webServer: hasAppUrl
    ? undefined
    : {
        command: 'npx --yes serve . -p 4321 --no-clipboard',
        url: 'http://127.0.0.1:4321',
        reuseExistingServer: true,
        timeout: 120 * 1000
      },
  reporter: [['list']]
});

