import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ serviceWorkers: 'block' });
const page = await context.newPage();

// Use the same baseURL as playwright.config.js
const base = 'http://localhost:4173/';
await page.goto(base, { waitUntil: 'domcontentloaded' }).catch(() => {});

await page.waitForFunction(() =>
  window.OfflinePwa && typeof window.OfflinePwa.getStatus === 'function'
).catch(() => null);

const result = await page.evaluate(() => {
  const s = window.OfflinePwa ? window.OfflinePwa.getStatus() : null;
  return {
    hasOfflinePwa: !!window.OfflinePwa,
    hasGetReplayTelemetry: !!(window.OfflinePwa && window.OfflinePwa.getReplayTelemetry),
    replayTelemetry: s ? s.replayTelemetry : null,
    resolveConflictHasApplyDelta: !!(
      window.OfflinePwa &&
      window.OfflinePwa.resolveConflict &&
      window.OfflinePwa.resolveConflict.toString().includes('applyReplayTelemetryDelta')
    )
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();

