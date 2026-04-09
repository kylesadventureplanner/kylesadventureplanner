const { chromium } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const result = { steps: [] };
  try {
    await page.goto("http://127.0.0.1:4173", { waitUntil: "domcontentloaded", timeout: 20000 });
    result.steps.push("loaded");
    await page.click("#offlineModeBtn", { timeout: 10000 });
    await page.locator("#offlineModePackBtn").waitFor({ state: "visible", timeout: 10000 });
    result.steps.push("offline-mode-opened");
    await page.click("#offlineModePackBtn", { timeout: 10000 });
    result.steps.push("pack-clicked");
    result.controllerReady = await page.evaluate(async () => {
      const deadline = Date.now() + 12000;
      while (Date.now() < deadline) {
        if (navigator.serviceWorker && navigator.serviceWorker.controller) return true;
        await new Promise(resolve => setTimeout(resolve, 250));
      }
      return !!(navigator.serviceWorker && navigator.serviceWorker.controller);
    });
    result.badgesBeforeOffline = await page.evaluate(() => ({
      connection: document.getElementById("offlineModeConnectionBadge")?.textContent || "",
      queue: document.getElementById("offlineModeQueueBadge")?.textContent || "",
      cacheStatus: document.querySelector(".offline-cache-status")?.textContent || ""
    }));
    await context.setOffline(true);
    result.steps.push("context-offline");
    result.reloadOutcome = await Promise.race([
      page.reload({ waitUntil: "domcontentloaded", timeout: 15000 }).then(() => "reloaded"),
      new Promise(resolve => setTimeout(() => resolve("reload-timeout"), 16000))
    ]);
    if (result.reloadOutcome === "reloaded") {
      result.offlineBadgeAfterReload = await page.locator("#offlineModeConnectionBadge").textContent({ timeout: 5000 });
      await page.evaluate(async () => {
        await window.OfflinePwa.enqueueWrite("test-airplane-mode", { probe: true }, { source: "probe" });
      });
      result.queueAfterEnqueue = await page.locator("#offlineModeQueueBadge").textContent({ timeout: 5000 });
    }
    console.log(JSON.stringify({ ok: result.reloadOutcome === "reloaded", result }, null, 2));
  } catch (error) {
    console.log(JSON.stringify({ ok: false, error: String(error && error.stack ? error.stack : error), result }, null, 2));
    process.exitCode = 1;
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
})();
