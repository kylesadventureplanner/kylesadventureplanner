const { test, expect } = require('./reliability-test');

test.describe('Offline airplane mode regression', () => {
  test('keeps planner usable and queues writes when offline', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.click('#offlineModeBtn');
    await page.waitForTimeout(250);
    await expect(page.locator('#offlineModePackBtn')).toBeVisible();
    await page.click('#offlineModePackBtn');
    await page.waitForTimeout(500);

    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('#offlineModeConnectionBadge')).toContainText('Offline');

    await page.evaluate(async () => {
      if (!window.OfflinePwa || typeof window.OfflinePwa.enqueueWrite !== 'function') {
        throw new Error('OfflinePwa.enqueueWrite is unavailable');
      }
      await window.OfflinePwa.enqueueWrite('test-airplane-mode', { probe: true }, { source: 'playwright' });
    });

    // Accept both legacy and current queue badge copy while asserting queued state is visible.
    await expect(page.locator('#offlineModeQueueBadge')).toContainText(/Pending sync|Queued for replay/);
    const pending = await page.evaluate(() => {
      if (!window.OfflinePwa || typeof window.OfflinePwa.getPendingCount !== 'function') return -1;
      return window.OfflinePwa.getPendingCount();
    });
    expect(pending).toBeGreaterThan(0);

    await context.setOffline(false);
    await page.evaluate(async () => {
      if (window.OfflinePwa && typeof window.OfflinePwa.flushQueue === 'function') {
        await window.OfflinePwa.flushQueue();
      }
    });

    await context.close();
  });
});

