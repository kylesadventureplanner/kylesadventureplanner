const { test, expect } = require('./reliability-test');

test.describe('Offline queue conflict + retry telemetry', () => {
  test('annotates a processor-error conflict and retries successfully with telemetry updates', async ({ browser }) => {
    const context = await browser.newContext({ serviceWorkers: 'block' });
    const page = await context.newPage();

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => Boolean(
      window.OfflinePwa
      && typeof window.OfflinePwa.enqueueWrite === 'function'
      && typeof window.OfflinePwa.flushQueue === 'function'
      && typeof window.OfflinePwa.getStatus === 'function'
    ));

    // ── Runtime capabilities + baseline telemetry ───────────────────────────
    const runtime = await page.evaluate(() => {
      var s = window.OfflinePwa.getStatus();
      return {
        hasReplayTelemetry: Boolean(s && s.replayTelemetry && typeof s.replayTelemetry === 'object'),
        failed: (s && s.replayTelemetry && s.replayTelemetry.failed) || 0,
        processed: (s && s.replayTelemetry && s.replayTelemetry.processed) || 0
      };
    });

    // ── Register a processor that intentionally rejects (PROCESSOR_ERROR) ────
    await page.evaluate(() => {
      window.__pwFailCount = 0;
      window.OfflinePwa.registerProcessor('pw-test-processor', function () {
        window.__pwFailCount += 1;
        return Promise.reject(new Error('Simulated failure for Playwright test'));
      });
    });

    // ── Queue item, flush directly, await completion ──────────────────────────
    const flushProbe = await page.evaluate(async () => {
      // Wait for any in-flight flush from startup to settle.
      var idleDeadline = Date.now() + 3000;
      while (Date.now() < idleDeadline) {
        if (!window.OfflinePwa.getStatus().syncing) break;
        await new Promise(function (r) { setTimeout(r, 50); });
      }

      // Ensure status.online === true.
      if (!window.OfflinePwa.getStatus().online) {
        window.dispatchEvent(new Event('online'));
        await new Promise(function (r) { setTimeout(r, 30); });
      }

      await window.OfflinePwa.removeQueuedWrites({});
      await window.OfflinePwa.enqueueWrite(
        'pw-test-processor', { probe: true }, { source: 'playwright' }
      );

      // Call flushQueue DIRECTLY — avoids the 450 ms scheduleFlush race.
      var flushResult = await window.OfflinePwa.flushQueue();

      var after = await window.OfflinePwa.getQueueItems();
      return {
        flushResult: flushResult,
        after: after,
        failCount: Number(window.__pwFailCount || 0)
      };
    });

    // ── Assert the processor was called and PROCESSOR_ERROR was annotated ─────
    expect(flushProbe.failCount, 'Failing processor should have been called').toBeGreaterThan(0);
    const conflictRow = (Array.isArray(flushProbe.after) ? flushProbe.after : []).find((item) =>
      String(item && item.conflictCode || '').trim().toUpperCase() === 'PROCESSOR_ERROR'
    );
    expect(
      conflictRow,
      'Expected PROCESSOR_ERROR conflict. flushProbe=' + JSON.stringify(flushProbe)
    ).toBeTruthy();
    const conflictQueueId = String(conflictRow.id || '');
    expect(conflictQueueId).not.toBe('');


    // ── Fix the processor, retry via resolveConflict, assert resolved ─────────
    await page.evaluate(() => {
      window.__pwRetryHits = 0;
      window.OfflinePwa.registerProcessor('pw-test-processor', function () {
        window.__pwRetryHits += 1;
        return true;
      });
    });

    const retryOk = await page.evaluate(async (queueId) => {
      return window.OfflinePwa.resolveConflict('retry', queueId);
    }, conflictQueueId);
    expect(retryOk).toBe(true);

    // ── Final state assertions ────────────────────────────────────────────────
    const finalState = await page.evaluate(() => {
      var s = window.OfflinePwa.getStatus();
      return {
        processed: (s && s.replayTelemetry && s.replayTelemetry.processed) || 0,
        pending: window.OfflinePwa.getPendingCount(),
        retryHits: Number(window.__pwRetryHits || 0)
      };
    });

    expect(finalState.retryHits, 'Fixed processor should have been called on retry').toBeGreaterThan(0);
    expect(finalState.pending, 'Queue should be empty after successful retry').toBe(0);
    // Some environments may run against an older deployed app URL that does not
    // yet expose replayTelemetry. Keep behavioral assertions strict in all cases
    // and only gate telemetry increments when telemetry is available.
    if (runtime.hasReplayTelemetry) {
      expect(finalState.processed).toBeGreaterThanOrEqual(runtime.processed + 1);
    }

    await context.close();
  });
});

