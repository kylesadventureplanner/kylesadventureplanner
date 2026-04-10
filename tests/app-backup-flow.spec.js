const { test, expect } = require('./reliability-test');

test.describe('App backup flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#appBackupBtn')).toBeVisible();
  });

  test('opens dedicated backup page from header button', async ({ page }) => {
    await page.locator('#appBackupBtn').click();

    const backupPane = page.locator('#appBackupTab');
    await expect(backupPane).toHaveClass(/active/);
    await expect(backupPane.getByRole('heading', { name: /App Backup/i })).toBeVisible();
    await expect(page.locator('#appBackupCreateZipBtn')).toBeVisible();

    const preview = page.locator('#appBackupManifestPreview');
    await expect(preview).toBeVisible();
    await preview.locator('summary').click();
    await expect(page.locator('#appBackupManifestPreviewList li').first()).toBeVisible({ timeout: 15000 });
  });

  test('back button returns to previously active tab', async ({ page }) => {
    const natureTabBtn = page.locator('.app-tab-btn[data-tab="nature-challenge"]');
    await natureTabBtn.click();
    await expect(natureTabBtn).toHaveClass(/active/);

    await page.locator('#appBackupBtn').click();
    await expect(page.locator('#appBackupTab')).toHaveClass(/active/);

    await page.locator('#appBackupBackBtn').click();
    await expect(page.locator('.app-tab-btn[data-tab="nature-challenge"]')).toHaveClass(/active/);
  });

  test('creates a dated zip backup download', async ({ page }) => {
    await page.locator('#appBackupBtn').click();
    await expect(page.locator('#appBackupCreateZipBtn')).toBeVisible();

    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
    await page.locator('#appBackupCreateZipBtn').click();
    const download = await downloadPromise;

    const fileName = download.suggestedFilename();
    expect(fileName).toMatch(/^kyles-adventure-planner_backup_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.zip$/);

    await expect(page.locator('#appBackupStatus')).toContainText('Backup downloaded', { timeout: 30000 });
  });
});

