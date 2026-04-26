# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: offline-airplane-mode.spec.js >> Offline airplane mode regression >> keeps planner usable and queues writes when offline
- Location: tests/offline-airplane-mode.spec.js:4:3

# Error details

```
Error: page.reload: net::ERR_FAILED
Call log:
  - waiting for navigation until "domcontentloaded"

```

# Test source

```ts
  1  | const { test, expect } = require('./reliability-test');
  2  | 
  3  | test.describe('Offline airplane mode regression', () => {
  4  |   test('keeps planner usable and queues writes when offline', async ({ browser }) => {
  5  |     const context = await browser.newContext();
  6  |     const page = await context.newPage();
  7  | 
  8  |     await page.goto('/', { waitUntil: 'domcontentloaded' });
  9  |     await page.click('#offlineModeBtn');
  10 |     await page.waitForTimeout(250);
  11 |     await expect(page.locator('#offlineModePackBtn')).toBeVisible();
  12 |     await page.click('#offlineModePackBtn');
  13 |     await page.waitForTimeout(500);
  14 | 
  15 |     await context.setOffline(true);
> 16 |     await page.reload({ waitUntil: 'domcontentloaded' });
     |                ^ Error: page.reload: net::ERR_FAILED
  17 |     await expect(page.locator('#offlineModeConnectionBadge')).toContainText('Offline');
  18 | 
  19 |     await page.evaluate(async () => {
  20 |       if (!window.OfflinePwa || typeof window.OfflinePwa.enqueueWrite !== 'function') {
  21 |         throw new Error('OfflinePwa.enqueueWrite is unavailable');
  22 |       }
  23 |       await window.OfflinePwa.enqueueWrite('test-airplane-mode', { probe: true }, { source: 'playwright' });
  24 |     });
  25 | 
  26 |     // Accept both legacy and current queue badge copy while asserting queued state is visible.
  27 |     await expect(page.locator('#offlineModeQueueBadge')).toContainText(/Pending sync|Queued for replay/);
  28 |     const pending = await page.evaluate(() => {
  29 |       if (!window.OfflinePwa || typeof window.OfflinePwa.getPendingCount !== 'function') return -1;
  30 |       return window.OfflinePwa.getPendingCount();
  31 |     });
  32 |     expect(pending).toBeGreaterThan(0);
  33 | 
  34 |     await context.setOffline(false);
  35 |     await page.evaluate(async () => {
  36 |       if (window.OfflinePwa && typeof window.OfflinePwa.flushQueue === 'function') {
  37 |         await window.OfflinePwa.flushQueue();
  38 |       }
  39 |     });
  40 | 
  41 |     await context.close();
  42 |   });
  43 | });
  44 | 
  45 | 
```