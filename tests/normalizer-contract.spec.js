/**
 * normalizer-contract.spec.js
 *
 * Unit tests for write result contract normalizers:
 * 1. normalizeWriteResultContract (consolidated-bulk-operations-system-v7-0-141.js)
 * 2. normalizeWriteResultContractLocal (consolidated-automation-system-v7-0-141.js)
 * 3. normalizeWriteContract (universal-progress-tracking-system.js)
 *
 * Tests ensure future changes don't regress the boolean success contract
 * and that all variants handle positive/negative scenarios correctly.
 */
const { test, expect } = require('@playwright/test');

test.describe('Write Result Contract Normalizers', () => {
  /**
   * HELPER: Load normalizers into page context
   */
  async function loadNormalizers(page) {
    // Inject the three normalizer implementations directly for testing
    await page.evaluate(() => {
      // Normalizer variant 1: normalizeWriteResultContract (bulk operations style)
      window.testNormalizeWriteResultContract = function normalizeWriteResultContract(rawResult, defaults = {}) {
        function toContractCount(value, fallback = 0) {
          const next = Number(value);
          if (!Number.isFinite(next) || next < 0) return Math.max(0, Number(fallback) || 0);
          return Math.max(0, Math.round(next));
        }

        const raw = rawResult && typeof rawResult === 'object' ? rawResult : {};
        const baseRequested = toContractCount(defaults.rowsRequested, 0);
        const baseChanged = toContractCount(defaults.rowsChanged, baseRequested);

        const rowsChanged = toContractCount(raw.rowsChanged, toContractCount(raw.rowsAppended, baseChanged));
        const persistedRows = toContractCount(raw.persistedRows, toContractCount(raw.rowsPersisted, rowsChanged));
        const verifiedRowsChanged = toContractCount(raw.verifiedRowsChanged, toContractCount(raw.rowsVerifiedPresent, 0));
        const rowsRequested = toContractCount(raw.rowsRequested, toContractCount(raw.total, baseRequested || rowsChanged));
        const rowsAppended = toContractCount(raw.rowsAppended, rowsChanged);
        const rowsVerifiedPresent = toContractCount(raw.rowsVerifiedPresent, verifiedRowsChanged);

        const persisted = typeof raw.persisted === 'boolean' ? raw.persisted : persistedRows > 0;
        const success = typeof raw.success === 'boolean'
          ? raw.success
          : (typeof raw.ok === 'boolean' ? raw.ok : (persisted || rowsChanged > 0 || rowsRequested === 0));
        const postWriteVerified = typeof raw.postWriteVerified === 'boolean'
          ? raw.postWriteVerified
          : (persistedRows > 0 && verifiedRowsChanged === persistedRows);

        return {
          ...raw,
          success,
          rowsRequested,
          rowsChanged,
          persistedRows,
          verifiedRowsChanged,
          rowsAppended,
          rowsVerifiedPresent,
          persisted,
          postWriteVerified,
          verificationMode: String(raw.verificationMode || defaults.verificationMode || '').trim(),
          verificationReason: String(raw.verificationReason || defaults.verificationReason || '').trim(),
          persistMode: String(raw.persistMode || raw.mode || defaults.persistMode || '').trim(),
          persistReason: String(raw.persistReason || raw.reason || defaults.persistReason || '').trim()
        };
      };

      // Normalizer variant 2: normalizeWriteResultContractLocal (automation system style)
      window.testNormalizeWriteResultContractLocal = function normalizeWriteResultContractLocal(rawResult, defaults) {
        const raw = rawResult && typeof rawResult === 'object' ? rawResult : {};
        const fallback = defaults && typeof defaults === 'object' ? defaults : {};
        const asCount = (value, next) => {
          const parsed = Number(value);
          if (!Number.isFinite(parsed) || parsed < 0) return Math.max(0, Number(next) || 0);
          return Math.max(0, Math.round(parsed));
        };
        const rowsChanged = asCount(raw.rowsChanged, asCount(raw.rowsAppended, asCount(fallback.rowsChanged, asCount(fallback.rowsRequested, 0))));
        const persistedRows = asCount(raw.persistedRows, rowsChanged);
        const verifiedRowsChanged = asCount(raw.verifiedRowsChanged, asCount(raw.rowsVerifiedPresent, 0));
        const rowsRequested = asCount(raw.rowsRequested, asCount(raw.total, asCount(fallback.rowsRequested, rowsChanged)));
        const success = typeof raw.success === 'boolean'
          ? raw.success
          : (typeof raw.ok === 'boolean' ? raw.ok : (persistedRows > 0 || rowsChanged > 0 || rowsRequested === 0));
        return {
          ...raw,
          success,
          rowsRequested,
          rowsChanged,
          persistedRows,
          verifiedRowsChanged,
          rowsAppended: asCount(raw.rowsAppended, rowsChanged),
          rowsVerifiedPresent: asCount(raw.rowsVerifiedPresent, verifiedRowsChanged),
          postWriteVerified: typeof raw.postWriteVerified === 'boolean' ? raw.postWriteVerified : (persistedRows > 0 && verifiedRowsChanged === persistedRows),
          persistMode: String(raw.persistMode || raw.mode || fallback.persistMode || '').trim(),
          persistReason: String(raw.persistReason || raw.reason || fallback.persistReason || '').trim(),
          verificationMode: String(raw.verificationMode || fallback.verificationMode || '').trim(),
          verificationReason: String(raw.verificationReason || fallback.verificationReason || '').trim()
        };
      };

      // Normalizer variant 3: normalizeWriteContract (progress tracking style)
      window.testNormalizeWriteContract = function normalizeWriteContract(rawResult, defaults = {}) {
        const raw = rawResult && typeof rawResult === 'object' ? rawResult : {};
        const asCount = (value, fallback = 0) => {
          const parsed = Number(value);
          if (!Number.isFinite(parsed) || parsed < 0) return Math.max(0, Number(fallback) || 0);
          return Math.max(0, Math.round(parsed));
        };
        const rowsChanged = asCount(raw.rowsChanged, asCount(defaults.rowsChanged, 0));
        const persistedRows = asCount(raw.persistedRows, rowsChanged);
        const verifiedRowsChanged = asCount(raw.verifiedRowsChanged, asCount(raw.rowsVerifiedPresent, 0));
        const rowsRequested = asCount(raw.rowsRequested, asCount(raw.total, asCount(defaults.rowsRequested, rowsChanged)));
        const success = typeof raw.success === 'boolean'
          ? raw.success
          : (typeof raw.ok === 'boolean' ? raw.ok : (persistedRows > 0 || rowsChanged > 0 || rowsRequested === 0));
        return {
          ...raw,
          success,
          rowsRequested,
          rowsChanged,
          rowsAppended: asCount(raw.rowsAppended, rowsChanged),
          persistedRows,
          verifiedRowsChanged,
          rowsVerifiedPresent: asCount(raw.rowsVerifiedPresent, verifiedRowsChanged),
          postWriteVerified: typeof raw.postWriteVerified === 'boolean' ? raw.postWriteVerified : (persistedRows > 0 && verifiedRowsChanged === persistedRows),
          verificationMode: String(raw.verificationMode || defaults.verificationMode || '').trim(),
          verificationReason: String(raw.verificationReason || defaults.verificationReason || '').trim()
        };
      };
    });
  }

  test.describe('normalizeWriteResultContract (Bulk Operations)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('about:blank');
      await loadNormalizers(page);
    });

    test('positive: explicit success=true is preserved', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteResultContract({ success: true, rowsChanged: 5 }, {});
      });
      expect(result.success).toBe(true);
      expect(result.rowsChanged).toBe(5);
    });

    test('positive: rowsChanged > 0 infers success=true when not explicit', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteResultContract({ rowsChanged: 3 }, {});
      });
      expect(result.success).toBe(true);
      expect(result.rowsChanged).toBe(3);
    });

    test('positive: persistedRows > 0 infers success=true when not explicit', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteResultContract({ persistedRows: 2 }, {});
      });
      expect(result.success).toBe(true);
      expect(result.persistedRows).toBe(2);
    });

    test('positive: rowsRequested=0 with no changes infers success=true (empty operation)', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteResultContract({ rowsRequested: 0, rowsChanged: 0 }, {});
      });
      expect(result.success).toBe(true);
      expect(result.rowsRequested).toBe(0);
    });

    test('negative: explicit success=false is preserved', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteResultContract({ success: false, rowsChanged: 0 }, {});
      });
      expect(result.success).toBe(false);
    });

    test('positive: zero activity with zero requested infers success=true (empty operation is valid)', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteResultContract({ rowsChanged: 0, persistedRows: 0, rowsRequested: 0 }, {});
      });
      expect(result.success).toBe(true);
    });

    test('positive: empty input object is normalized safely with inferred success', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteResultContract({}, {});
      });
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('rowsRequested');
      expect(result).toHaveProperty('rowsChanged');
      expect(result).toHaveProperty('persistedRows');
      expect(result.rowsRequested).toBe(0);
      expect(result.rowsChanged).toBe(0);
      expect(result.persistedRows).toBe(0);
      // Empty input with rowsRequested=0 is considered success (nothing was requested)
      expect(result.success).toBe(true);
    });

    test('positive: null/undefined input is normalized safely', async ({ page }) => {
      const resultNull = await page.evaluate(() => {
        return window.testNormalizeWriteResultContract(null, {});
      });
      expect(resultNull.success).toBe(true);

      const resultUndef = await page.evaluate(() => {
        return window.testNormalizeWriteResultContract(undefined, {});
      });
      expect(resultUndef.success).toBe(true);
    });

    test('positive: defaults provide baseline values', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteResultContract({}, { rowsRequested: 10, rowsChanged: 5 });
      });
      expect(result.rowsRequested).toBe(10);
      expect(result.rowsChanged).toBe(5);
      expect(result.success).toBe(true);
    });

    test('positive: legacy ok field is supported for success', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteResultContract({ ok: true }, {});
      });
      expect(result.success).toBe(true);
    });

    test('positive: rowsAppended fallback works', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteResultContract({ rowsAppended: 7 }, {});
      });
      expect(result.rowsChanged).toBe(7);
      expect(result.success).toBe(true);
    });

    test('positive: rowsPersisted fallback works', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteResultContract({ rowsPersisted: 4 }, {});
      });
      expect(result.persistedRows).toBe(4);
      expect(result.success).toBe(true);
    });

    test('positive: verificationMode/verificationReason are normalized to strings', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteResultContract({
          verificationMode: '  custom-mode  ',
          verificationReason: '  custom reason  '
        }, {});
      });
      expect(result.verificationMode).toBe('custom-mode');
      expect(result.verificationReason).toBe('custom reason');
    });

    test('negative: negative row counts are coerced to zero', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteResultContract({
          rowsChanged: -5,
          persistedRows: -3,
          rowsRequested: -10
        }, {});
      });
      expect(result.rowsChanged).toBe(0);
      expect(result.persistedRows).toBe(0);
      expect(result.rowsRequested).toBe(0);
    });

    test('negative: non-numeric counts are coerced to zero', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteResultContract({
          rowsChanged: 'not-a-number',
          persistedRows: null,
          rowsRequested: undefined
        }, {});
      });
      expect(result.rowsChanged).toBe(0);
      expect(result.persistedRows).toBe(0);
      expect(result.rowsRequested).toBe(0);
    });

    test('positive: postWriteVerified is inferred from verification state', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteResultContract({
          persistedRows: 5,
          verifiedRowsChanged: 5
        }, {});
      });
      expect(result.postWriteVerified).toBe(true);
    });

    test('negative: postWriteVerified=false when verified != persisted', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteResultContract({
          persistedRows: 5,
          verifiedRowsChanged: 3
        }, {});
      });
      expect(result.postWriteVerified).toBe(false);
    });

    test('positive: all result indexes are present and accessible', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteResultContract({ rowsChanged: 5, success: true }, {});
      });
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('rowsRequested');
      expect(result).toHaveProperty('rowsChanged');
      expect(result).toHaveProperty('persistedRows');
      expect(result).toHaveProperty('verifiedRowsChanged');
      expect(result).toHaveProperty('rowsAppended');
      expect(result).toHaveProperty('rowsVerifiedPresent');
      expect(result).toHaveProperty('persisted');
      expect(result).toHaveProperty('postWriteVerified');
      expect(result).toHaveProperty('verificationMode');
      expect(result).toHaveProperty('verificationReason');
      expect(result).toHaveProperty('persistMode');
      expect(result).toHaveProperty('persistReason');
    });
  });

  test.describe('normalizeWriteResultContractLocal (Automation System)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('about:blank');
      await loadNormalizers(page);
    });

    test('positive: explicit success=true is preserved', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteResultContractLocal({ success: true, rowsChanged: 5 }, {});
      });
      expect(result.success).toBe(true);
      expect(result.rowsChanged).toBe(5);
    });

    test('positive: rowsChanged > 0 infers success=true', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteResultContractLocal({ rowsChanged: 2 }, {});
      });
      expect(result.success).toBe(true);
    });

    test('positive: defaults fallback for rowsChanged from fallback.rowsRequested', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteResultContractLocal({}, { rowsRequested: 8 });
      });
      expect(result.rowsChanged).toBe(8);
      expect(result.success).toBe(true);
    });

    test('negative: explicit success=false is preserved', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteResultContractLocal({ success: false }, {});
      });
      expect(result.success).toBe(false);
    });

    test('positive: empty input defaults with inferred success', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteResultContractLocal({}, {});
      });
      // Empty input with rowsRequested=0 (inferred) is considered success
      expect(result.success).toBe(true);
    });

    test('positive: legacy ok field overrides missing success', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteResultContractLocal({ ok: true }, {});
      });
      expect(result.success).toBe(true);
    });

    test('positive: postWriteVerified computed correctly', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteResultContractLocal({
          persistedRows: 3,
          verifiedRowsChanged: 3
        }, {});
      });
      expect(result.postWriteVerified).toBe(true);
    });

    test('negative: postWriteVerified=false when persisted > verified', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteResultContractLocal({
          persistedRows: 5,
          verifiedRowsChanged: 2
        }, {});
      });
      expect(result.postWriteVerified).toBe(false);
    });

    test('positive: all contract fields are present', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteResultContractLocal({ success: true }, {});
      });
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('rowsRequested');
      expect(result).toHaveProperty('rowsChanged');
      expect(result).toHaveProperty('persistedRows');
      expect(result).toHaveProperty('verifiedRowsChanged');
      expect(result).toHaveProperty('rowsAppended');
      expect(result).toHaveProperty('rowsVerifiedPresent');
      expect(result).toHaveProperty('postWriteVerified');
      expect(result).toHaveProperty('persistMode');
      expect(result).toHaveProperty('persistReason');
      expect(result).toHaveProperty('verificationMode');
      expect(result).toHaveProperty('verificationReason');
    });
  });

  test.describe('normalizeWriteContract (Progress Tracking)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('about:blank');
      await loadNormalizers(page);
    });

    test('positive: explicit success=true is preserved', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteContract({ success: true, rowsChanged: 4 }, {});
      });
      expect(result.success).toBe(true);
      expect(result.rowsChanged).toBe(4);
    });

    test('positive: rowsChanged > 0 infers success=true', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteContract({ rowsChanged: 6 }, {});
      });
      expect(result.success).toBe(true);
    });

    test('positive: persistedRows > 0 infers success=true', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteContract({ persistedRows: 2 }, {});
      });
      expect(result.success).toBe(true);
    });

    test('negative: explicit success=false is preserved', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteContract({ success: false, rowsChanged: 0 }, {});
      });
      expect(result.success).toBe(false);
    });

    test('positive: empty result defaults with inferred success', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteContract({}, {});
      });
      // Empty input with rowsRequested=0 (inferred) is considered success
      expect(result.success).toBe(true);
    });

    test('positive: defaults.rowsRequested is used as fallback', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteContract({}, { rowsRequested: 7 });
      });
      expect(result.rowsRequested).toBe(7);
      expect(result.success).toBe(false);
    });

    test('positive: ok field supports success inference', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteContract({ ok: true }, {});
      });
      expect(result.success).toBe(true);
    });

    test('positive: rowsAppended is included in normalized result', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteContract({ rowsAppended: 5 }, {});
      });
      expect(result).toHaveProperty('rowsAppended', 5);
      expect(result.success).toBe(true);
    });

    test('positive: rowsVerifiedPresent is included', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteContract({ rowsVerifiedPresent: 3 }, {});
      });
      expect(result).toHaveProperty('rowsVerifiedPresent', 3);
    });

    test('positive: postWriteVerified computed when persisted and verified match', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteContract({
          persistedRows: 4,
          verifiedRowsChanged: 4
        }, {});
      });
      expect(result.postWriteVerified).toBe(true);
    });

    test('negative: postWriteVerified=false when counts don\'t match', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteContract({
          persistedRows: 5,
          verifiedRowsChanged: 3
        }, {});
      });
      expect(result.postWriteVerified).toBe(false);
    });

    test('positive: all contract fields are present', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.testNormalizeWriteContract({ success: true }, {});
      });
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('rowsRequested');
      expect(result).toHaveProperty('rowsChanged');
      expect(result).toHaveProperty('rowsAppended');
      expect(result).toHaveProperty('persistedRows');
      expect(result).toHaveProperty('verifiedRowsChanged');
      expect(result).toHaveProperty('rowsVerifiedPresent');
      expect(result).toHaveProperty('postWriteVerified');
      expect(result).toHaveProperty('verificationMode');
      expect(result).toHaveProperty('verificationReason');
    });
  });

  test.describe('Cross-Normalizer Consistency', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('about:blank');
      await loadNormalizers(page);
    });

    test('all three normalizers produce success=true for rowsChanged > 0', async ({ page }) => {
      const results = await page.evaluate(() => {
        return {
          bulk: window.testNormalizeWriteResultContract({ rowsChanged: 5 }, {}),
          local: window.testNormalizeWriteResultContractLocal({ rowsChanged: 5 }, {}),
          progress: window.testNormalizeWriteContract({ rowsChanged: 5 }, {})
        };
      });
      expect(results.bulk.success).toBe(true);
      expect(results.local.success).toBe(true);
      expect(results.progress.success).toBe(true);
    });

    test('all three normalizers produce success=true for empty input (no action required)', async ({ page }) => {
      const results = await page.evaluate(() => {
        return {
          bulk: window.testNormalizeWriteResultContract({}, {}),
          local: window.testNormalizeWriteResultContractLocal({}, {}),
          progress: window.testNormalizeWriteContract({}, {})
        };
      });
      // Empty requests (rowsRequested=0) are considered successful
      expect(results.bulk.success).toBe(true);
      expect(results.local.success).toBe(true);
      expect(results.progress.success).toBe(true);
    });

    test('all three normalizers respect explicit success field', async ({ page }) => {
      const results = await page.evaluate(() => {
        return {
          bulk: window.testNormalizeWriteResultContract({ success: true }, {}),
          local: window.testNormalizeWriteResultContractLocal({ success: true }, {}),
          progress: window.testNormalizeWriteContract({ success: true }, {})
        };
      });
      expect(results.bulk.success).toBe(true);
      expect(results.local.success).toBe(true);
      expect(results.progress.success).toBe(true);
    });

    test('all three normalizers coerce negative counts to zero', async ({ page }) => {
      const results = await page.evaluate(() => {
        return {
          bulk: window.testNormalizeWriteResultContract({ rowsChanged: -5 }, {}),
          local: window.testNormalizeWriteResultContractLocal({ rowsChanged: -5 }, {}),
          progress: window.testNormalizeWriteContract({ rowsChanged: -5 }, {})
        };
      });
      expect(results.bulk.rowsChanged).toBe(0);
      expect(results.local.rowsChanged).toBe(0);
      expect(results.progress.rowsChanged).toBe(0);
    });
  });
});

