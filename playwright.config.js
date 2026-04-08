// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60 * 1000,
  use: {
    baseURL: process.env.APP_URL || 'https://victorious-wave-0ec1bb10f.1.azurestaticapps.net/',
    trace: 'on-first-retry'
  },
  reporter: [['list']]
});

