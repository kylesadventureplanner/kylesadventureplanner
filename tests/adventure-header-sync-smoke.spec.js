const { test, expect } = require('./reliability-test');

test.describe('Adventure header sync indicator smoke', () => {
  test('shows pending unsynced count and flashing retry button', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('visitedLocationsTrackerV1', JSON.stringify({
        'adv:test-unsynced': {
          name: 'Pending Test Entry',
          visitedAt: new Date().toISOString(),
          sourceType: 'adventure',
          synced: false
        }
      }));
    });

    await page.goto('/');
    await page.locator('.app-tab-btn[data-tab="visited-locations"]').click();
    await expect(page.locator('#visitedLocationsRoot')).toBeVisible();

    const statusChip = page.locator('#visitedHeaderSyncStatus');
    const retryBtn = page.locator('#visitedHeaderSyncRetryBtn');

    await expect(statusChip).toBeVisible();
    await expect(statusChip).toHaveText(/Unsynced:\s*1/i);
    await expect(statusChip).toHaveClass(/is-pending/);

    await expect(retryBtn).toBeVisible();
    await expect(retryBtn).toBeEnabled();
    await expect(retryBtn).toHaveClass(/is-flashing/);
  });

  test('shows synced state and disabled retry button when no pending rows', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('visitedLocationsTrackerV1', JSON.stringify({}));
    });

    await page.goto('/');
    await page.locator('.app-tab-btn[data-tab="visited-locations"]').click();
    await expect(page.locator('#visitedLocationsRoot')).toBeVisible();

    const statusChip = page.locator('#visitedHeaderSyncStatus');
    const retryBtn = page.locator('#visitedHeaderSyncRetryBtn');

    await expect(statusChip).toBeVisible();
    await expect(statusChip).toHaveText(/All Changes Synced/i);
    await expect(statusChip).toHaveClass(/is-ok/);

    await expect(retryBtn).toBeVisible();
    await expect(retryBtn).toBeDisabled();
    await expect(retryBtn).not.toHaveClass(/is-flashing/);
  });
});

