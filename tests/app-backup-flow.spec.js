const { test, expect } = require('./reliability-test');
const { activateFooterAction } = require('./playwright-helpers');

test.describe('App backup flow', () => {
  async function openAppBackup(page) {
    const backupBtn = page.locator('#appBackupBtn');
    await expect(backupBtn).toBeVisible();
    await activateFooterAction(page, backupBtn);

    const backupPane = page.locator('#appBackupTab');
    await expect(backupPane.getByRole('heading', { name: /App Backup/i })).toBeVisible({ timeout: 15000 });
    await expect.poll(async () => page.evaluate(() => {
      const pane = document.getElementById('appBackupTab');
      if (!pane) return false;
      const style = window.getComputedStyle(pane);
      const rect = pane.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    }), { timeout: 15000 }).toBe(true);
    return backupPane;
  }

  async function waitForAppBackupReady(page) {
    const createBtn = page.locator('#appBackupCreateZipBtn');
    await expect(createBtn).toBeVisible({ timeout: 15000 });
    await expect.poll(async () => page.evaluate(() => {
      const count = String(document.getElementById('appBackupManifestCount')?.textContent || '').trim();
      const meta = String(document.getElementById('appBackupManifestPreviewMeta')?.textContent || '').trim();
      const disabled = Boolean(document.getElementById('appBackupCreateZipBtn')?.disabled);
      return {
        countReady: Boolean(count) && !/checking/i.test(count),
        metaReady: Boolean(meta) && !/checking manifest/i.test(meta),
        disabled
      };
    }), { timeout: 45000 }).toEqual({
      countReady: true,
      metaReady: true,
      disabled: false
    });
    await expect(createBtn).toBeEnabled({ timeout: 45000 });
    return createBtn;
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#appBackupBtn')).toBeVisible();
  });

  test('opens dedicated backup page from header button', async ({ page }) => {
    const backupPane = await openAppBackup(page);
    await expect(backupPane.getByRole('heading', { name: /App Backup/i })).toBeVisible();
    await waitForAppBackupReady(page);

    const preview = page.locator('#appBackupManifestPreview');
    await expect(preview).toBeVisible();
    await preview.locator('summary').click();
    await expect(page.locator('#appBackupManifestPreviewList li').first()).toBeVisible({ timeout: 15000 });
  });

  test('back button returns to previously active tab', async ({ page }) => {
    const natureTabBtn = page.locator('.app-tab-btn[data-tab="nature-challenge"]');
    await activateFooterAction(page, natureTabBtn);
    await expect(natureTabBtn).toHaveClass(/active/);

    await openAppBackup(page);

    await activateFooterAction(page, page.locator('#appBackupBackBtn'));
    await expect(page.locator('.app-tab-btn[data-tab="nature-challenge"]')).toHaveClass(/active/);
  });

  test('creates a dated zip backup download', async ({ page }) => {
    await openAppBackup(page);
    const createZipBtn = await waitForAppBackupReady(page);

    const downloadPromise = page.waitForEvent('download', { timeout: 120000 });
    await activateFooterAction(page, createZipBtn);
    const download = await downloadPromise;

    const fileName = download.suggestedFilename();
    expect(fileName).toMatch(/^kyles-adventure-planner_backup_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.zip$/);

    await expect(page.locator('#appBackupStatus')).toContainText('Backup downloaded', { timeout: 120000 });
  });
});

