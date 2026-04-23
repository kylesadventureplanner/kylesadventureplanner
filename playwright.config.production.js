// @ts-check
/**
 * Playwright config for running smoke tests against the live production
 * Azure Static Web App.
 *
 * Usage:
 *   APP_URL=https://your-app.azurestaticapps.net \
 *     npx playwright test --config=playwright.config.production.js
 *
 * The APP_URL environment variable is REQUIRED – the config throws if it is
 * missing so you never accidentally run production tests against localhost.
 */

const { defineConfig } = require('@playwright/test');

const appUrl = process.env.APP_URL;
if (!appUrl) {
  throw new Error(
    '[playwright.config.production.js] APP_URL environment variable is required.\n' +
    'Example: APP_URL=https://your-app.azurestaticapps.net npx playwright test --config=playwright.config.production.js'
  );
}

module.exports = defineConfig({
  testDir: './tests',
  timeout: 90 * 1000,          // longer timeout for remote round-trips
  retries: 1,                  // one automatic retry for flaky network conditions
  workers: 1,                  // serialise to avoid hammering the production server

  use: {
    baseURL: appUrl,
    trace: 'on-first-retry',
    // Don't inject a test-only service worker – use the real one.
    serviceWorkers: 'allow'
  },

  // No local webServer – we connect directly to the deployed app.
  webServer: undefined,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results/production-report', open: 'never' }]
  ]
});

