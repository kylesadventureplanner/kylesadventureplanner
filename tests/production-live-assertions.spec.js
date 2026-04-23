const { test, expect } = require('./reliability-test');

const PROD_ASSERT_ENABLE = process.env.PROD_ASSERT_ENABLE === '1';
const PROD_ASSERT_ALLOW_WRITES = process.env.PROD_ASSERT_ALLOW_WRITES === '1';

async function waitForEditModeTargets(page) {
  await page.waitForFunction(() => {
    const actionSel = document.getElementById('actionTargetSelect');
    const autoSel = document.getElementById('automationTargetSelect');
    return Boolean(
      actionSel
      && autoSel
      && actionSel.options.length >= 7
      && autoSel.options.length >= 7
    );
  }, null, { timeout: 20000 });
}

async function requireSignedIn(page) {
  await expect.poll(async () => {
    return page.evaluate(() => Boolean(window.accessToken));
  }, {
    timeout: 30000,
    message: 'Expected an authenticated session (window.accessToken) for production assertions.'
  }).toBe(true);
}

test.describe('Production live assertions (opt-in)', () => {
  test.describe.configure({ mode: 'serial' });

  test.skip(!PROD_ASSERT_ENABLE, 'Set PROD_ASSERT_ENABLE=1 to run live production assertions.');

  test('Wildlife auto-sync flips from waiting to ready without manual sync click', async ({ page }) => {
    await page.goto('/');
    await requireSignedIn(page);

    await page.locator('.app-tab-btn[data-tab="visited-locations"]').click();
    await expect(page.locator('#visitedLocationsRoot')).toBeVisible();

    const wildlifeTab = page.locator('#appSubTabsSlot [data-progress-subtab="wildlife-animals"]').first();
    await expect(wildlifeTab).toBeVisible();
    await wildlifeTab.click();
    await expect(wildlifeTab).toHaveAttribute('aria-selected', 'true', { timeout: 10000 });

    const health = page.locator('#visitedSubtabStatus-wildlife-animals .visited-subtab-status-health').first();
    await expect(health).toBeVisible({ timeout: 15000 });

    await expect.poll(async () => {
      return (await health.innerText()).trim();
    }, { timeout: 45000 }).toMatch(/Wildlife\s*&\s*Animals\s+data:\s*ready/i);

    await expect(
      page.locator('#visitedSubtabStatus-wildlife-animals [data-achv-sync-totals][data-achv-subtab="wildlife-animals"]')
    ).toHaveCount(0);
  });

  test('Add Single section shows Wildlife target table text in enhanced edit mode', async ({ page }) => {
    await page.goto('/HTML%20Files/edit-mode-enhanced.html#embedded=1&sourceSubtab=wildlife-animals');
    await waitForEditModeTargets(page);

    const indicator = page.locator('#singleSectionTargetIndicator');
    await expect(indicator).toBeVisible();
    await expect(indicator).toContainText(/Add Single saves into:/i);
    await expect(indicator).toContainText(/Wildlife_Animals\s*\(Entertainment_Locations\.xlsx\)/i);

    const diagnostics = page.locator('#targetSelectionStatus .target-chip', { hasText: 'Add/Bulk:' });
    await expect(diagnostics).toContainText(/Wildlife_Animals\s*\(Entertainment_Locations\.xlsx\)/i);
  });

  test('Update Descriptions persists at least one row and emits no Graph row PATCH 404', async ({ page }) => {
    test.skip(!PROD_ASSERT_ALLOW_WRITES, 'Set PROD_ASSERT_ALLOW_WRITES=1 to enable production write assertions.');

    const patch404s = [];
    page.on('response', (response) => {
      const req = response.request();
      const method = req.method();
      const url = response.url();
      if (
        method === 'PATCH'
        && response.status() === 404
        && url.includes('graph.microsoft.com')
        && url.includes('/workbook/tables/')
        && url.includes('/rows/')
      ) {
        patch404s.push(url);
      }
    });

    await page.goto('/HTML%20Files/edit-mode-enhanced.html#embedded=1&sourceSubtab=wildlife-animals');
    await waitForEditModeTargets(page);
    await requireSignedIn(page);

    await page.click('.tab-btn[data-tab="automation"]');
    await expect(page.locator('#automation-tab')).toHaveClass(/active/);

    await page.selectOption('#automationTargetSelect', 'ent_wildlife_animals');
    await page.evaluate(() => {
      const multi = document.getElementById('automationTargetMulti');
      if (!multi) return;
      Array.from(multi.options).forEach((opt) => {
        opt.selected = String(opt.value || '').trim() === 'ent_wildlife_animals';
      });
    });

    const dryRun = page.locator('#descDryRun');
    if (await dryRun.isChecked()) {
      await dryRun.uncheck();
    }

    await page.evaluate(() => submitUpdateDescriptions());

    const writeDiag = page.locator('#desc-write-diagnostics');
    await expect.poll(async () => {
      return (await writeDiag.innerText()).trim();
    }, { timeout: 120000 }).toMatch(/saved to Excel/i);

    await expect.poll(async () => {
      return (await writeDiag.innerText()).trim();
    }, { timeout: 120000 }).toMatch(/[1-9]\d*\s+row(?:s)?\s+changed/i);

    await expect.poll(async () => {
      return (await writeDiag.innerText()).trim();
    }, { timeout: 120000 }).not.toMatch(/not persisted|\b404\b|itemNotFound/i);

    expect(patch404s, `Graph row PATCH 404s:\n${patch404s.join('\n')}`).toEqual([]);
  });
});

