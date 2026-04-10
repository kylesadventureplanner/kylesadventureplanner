/**
 * BACKUP SYSTEM
 * =============
 * Comprehensive backup functionality for Adventure Finder app
 * Features:
 * - Backup all HTML files
 * - Backup all JavaScript files
 * - Backup Excel/CSV data files
 * - Create timestamped backup folder
 * - Create backup manifest
 * - Show backup progress
 * - List recent backups
 * - Download backups
 *
 * Version: v7.0.143
 * Date: April 10, 2026
 */

class BackupManager {
  constructor() {
    this.backupKey = 'adventureFinderBackupHistory';
    this.backupHistory = [];
    this.manifestPath = 'data/app-backup-manifest.json';
    this.lastNonBackupTab = '';
    this.uiBound = false;
    this._crcTable = null;
    this.init();
  }

  /**
   * Initialize backup system
   */
  init() {
    this.loadBackupHistory();
    this.createStyles();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.bindBackupUi(), { once: true });
    } else {
      this.bindBackupUi();
    }
  }

  bindBackupUi() {
    if (this.uiBound) return;
    this.uiBound = true;

    const openBtn = document.getElementById('appBackupBtn');
    if (openBtn && openBtn.dataset.backupBound !== '1') {
      openBtn.addEventListener('click', () => this.openBackupPage());
      openBtn.dataset.backupBound = '1';
    }

    const backBtn = document.getElementById('appBackupBackBtn');
    if (backBtn && backBtn.dataset.backupBound !== '1') {
      backBtn.addEventListener('click', () => this.goBackFromBackupPage());
      backBtn.dataset.backupBound = '1';
    }

    const createBtn = document.getElementById('appBackupCreateZipBtn');
    if (createBtn && createBtn.dataset.backupBound !== '1') {
      createBtn.addEventListener('click', () => this.handleBackupPageCreateClick());
      createBtn.dataset.backupBound = '1';
    }

    window.addEventListener('app:tab-switched', (event) => {
      const tabId = String(event && event.detail && event.detail.tabId || '').trim();
      if (!tabId) return;
      if (tabId !== 'app-backup') {
        this.lastNonBackupTab = tabId;
        return;
      }
      this.refreshBackupPageSummary();
    });

    this.refreshBackupPageSummary();
  }

  /**
   * Create CSS for backup UI
   */
  createStyles() {
    if (document.getElementById('backupManagerStyles')) return;

    const style = document.createElement('style');
    style.id = 'backupManagerStyles';
    style.textContent = `
      /* Backup Manager Styles */

      .backup-modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9999;
        display: none;
      }

      .backup-modal-backdrop.visible {
        display: block;
      }

      .backup-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        animation: slideUp 0.3s ease-out;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translate(-50%, -40%);
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%);
        }
      }

      .backup-modal-header {
        padding: 20px 24px;
        border-bottom: 2px solid #e5e7eb;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 16px 16px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .backup-modal-title {
        font-size: 18px;
        font-weight: 700;
        margin: 0;
      }

      .backup-modal-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
      }

      .backup-modal-body {
        padding: 24px;
      }

      .backup-section {
        margin-bottom: 24px;
      }

      .backup-section-title {
        font-size: 14px;
        font-weight: 700;
        color: #1f2937;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .backup-section-icon {
        font-size: 16px;
      }

      .backup-button {
        width: 100%;
        padding: 12px 16px;
        border: 2px solid #e5e7eb;
        background: white;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        color: #1f2937;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }

      .backup-button:hover {
        background: #f3f4f6;
        border-color: #3b82f6;
        color: #3b82f6;
      }

      .backup-button.primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-color: #667eea;
      }

      .backup-button.primary:hover {
        background: linear-gradient(135deg, #5568d3 0%, #6b3d8a 100%);
      }

      .backup-button.danger {
        color: #ef4444;
        border-color: #ef4444;
      }

      .backup-button.danger:hover {
        background: #fee2e2;
      }

      .backup-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .backup-icon {
        font-size: 18px;
        flex-shrink: 0;
      }

      .backup-content {
        flex: 1;
        text-align: left;
      }

      .backup-title {
        font-weight: 600;
        margin-bottom: 2px;
      }

      .backup-description {
        font-size: 12px;
        opacity: 0.8;
        margin: 0;
      }

      .backup-progress {
        margin-top: 24px;
        padding: 16px;
        background: #f3f4f6;
        border-radius: 12px;
        display: none;
      }

      .backup-progress.visible {
        display: block;
      }

      .backup-progress-bar {
        width: 100%;
        height: 6px;
        background: #e5e7eb;
        border-radius: 3px;
        overflow: hidden;
        margin-bottom: 8px;
      }

      .backup-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        width: 0%;
        transition: width 0.3s ease;
      }

      .backup-progress-text {
        font-size: 12px;
        color: #6b7280;
        text-align: center;
      }

      .backup-history-list {
        max-height: 300px;
        overflow-y: auto;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
      }

      .backup-history-item {
        padding: 12px 16px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
      }

      .backup-history-item:last-child {
        border-bottom: none;
      }

      .backup-history-item:hover {
        background: #f9fafb;
      }

      .backup-history-info {
        flex: 1;
      }

      .backup-history-date {
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 2px;
      }

      .backup-history-size {
        font-size: 12px;
        color: #9ca3af;
      }

      .backup-history-action {
        display: flex;
        gap: 8px;
      }

      .backup-history-btn {
        padding: 4px 8px;
        border: 1px solid #e5e7eb;
        background: white;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .backup-history-btn:hover {
        background: #3b82f6;
        color: white;
        border-color: #3b82f6;
      }

      .backup-file-list {
        padding: 16px;
        background: #f9fafb;
        border-radius: 12px;
        border: 1px solid #e5e7eb;
        margin-top: 12px;
      }

      .backup-file-item {
        padding: 8px 0;
        font-size: 13px;
        color: #6b7280;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .backup-file-icon {
        font-size: 14px;
        flex-shrink: 0;
      }

      .backup-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 12px;
        margin-top: 12px;
      }

      .backup-stat-card {
        background: white;
        border: 1px solid #e5e7eb;
        padding: 12px;
        border-radius: 8px;
        text-align: center;
      }

      .backup-stat-value {
        font-size: 18px;
        font-weight: 700;
        color: #667eea;
      }

      .backup-stat-label {
        font-size: 11px;
        color: #9ca3af;
        margin-top: 4px;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }

      .backup-message {
        padding: 12px 16px;
        border-radius: 8px;
        margin-top: 12px;
        font-size: 13px;
        font-weight: 500;
      }

      .backup-message.success {
        background: #d1fae5;
        color: #065f46;
        border: 1px solid #10b981;
      }

      .backup-message.info {
        background: #dbeafe;
        color: #1e40af;
        border: 1px solid #3b82f6;
      }

      .backup-message.error {
        background: #fee2e2;
        color: #991b1b;
        border: 1px solid #ef4444;
      }

      .app-backup-manifest-preview {
        margin-top: 10px;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        background: #f9fafb;
        padding: 8px 10px;
      }

      .app-backup-manifest-preview > summary {
        cursor: pointer;
        font-size: 12px;
        font-weight: 700;
        color: #374151;
      }

      .app-backup-manifest-preview-meta {
        margin-top: 6px;
        font-size: 12px;
        color: #6b7280;
      }

      .app-backup-manifest-preview-list {
        margin: 8px 0 0 18px;
        max-height: 220px;
        overflow: auto;
        font-size: 12px;
        color: #374151;
      }

      .app-backup-manifest-preview-list li {
        margin-bottom: 4px;
      }

      .app-backup-manifest-filter {
        display: block;
        width: 100%;
        box-sizing: border-box;
        margin: 8px 0 6px;
        padding: 6px 10px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 12px;
        color: #374151;
        background: #fff;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
      }

      .app-backup-manifest-filter:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.25);
      }

      .app-backup-manifest-preview-list li.hidden {
        display: none;
      }

      .app-backup-manifest-no-results {
        padding: 6px 0;
        font-size: 12px;
        color: #9ca3af;
        font-style: italic;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Load backup history from localStorage
   */
  loadBackupHistory() {
    const stored = localStorage.getItem(this.backupKey);
    if (stored) {
      try {
        this.backupHistory = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to load backup history:', e);
        this.backupHistory = [];
      }
    }
  }

  /**
   * Save backup history to localStorage
   */
  saveBackupHistory() {
    localStorage.setItem(this.backupKey, JSON.stringify(this.backupHistory));
  }

  /**
   * Get formatted timestamp
   */
  getTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
  }

  /**
   * Get backup folder name
   */
  getBackupFolderName() {
    return `backup_${this.getTimestamp()}`;
  }

  getZipFileName() {
    return `kyles-adventure-planner_backup_${this.getTimestamp()}.zip`;
  }

  resolveAssetUrl(relativePath) {
    const clean = String(relativePath || '').replace(/^\/+/, '');
    if (typeof window.resolvePlannerPageUrl === 'function') {
      return window.resolvePlannerPageUrl(clean);
    }
    return new URL(encodeURI(clean), window.location.href).toString();
  }

  sanitizeManifestPaths(paths) {
    return Array.from(new Set((Array.isArray(paths) ? paths : [])
      .map((value) => String(value || '').trim())
      .filter((value) => value && !value.startsWith('http://') && !value.startsWith('https://') && !value.startsWith('/'))));
  }

  async getAppFileManifest() {
    try {
      const response = await fetch(this.resolveAssetUrl(this.manifestPath), { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Manifest fetch failed (${response.status})`);
      }
      const payload = await response.json();
      const files = this.sanitizeManifestPaths(payload && payload.files);
      if (files.length) {
        return files;
      }
      throw new Error('Manifest contains no file entries');
    } catch (error) {
      console.warn('⚠️ Using fallback backup file list:', error.message || error);
      return this.getFallbackManifestFiles();
    }
  }

  getFallbackManifestFiles() {
    const core = [
      'index.html',
      'manifest.webmanifest',
      'sw.js',
      'auth-popup-callback.html',
      'staticwebapp.config.json'
    ];

    const discovered = [];
    document.querySelectorAll('script[src], link[rel="stylesheet"][href]').forEach((node) => {
      const raw = node.getAttribute('src') || node.getAttribute('href') || '';
      const cleaned = String(raw)
        .replace(/^\/+/, '')
        .replace(/%20/g, ' ')
        .split('?')[0]
        .trim();
      if (cleaned) discovered.push(cleaned);
    });

    return this.sanitizeManifestPaths(core.concat(discovered));
  }

  getCrc32(bytes) {
    if (!this._crcTable) {
      const table = new Uint32Array(256);
      for (let n = 0; n < 256; n += 1) {
        let c = n;
        for (let k = 0; k < 8; k += 1) {
          c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
        }
        table[n] = c >>> 0;
      }
      this._crcTable = table;
    }

    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i += 1) {
      crc = this._crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  getDosDateTime(date) {
    const d = date instanceof Date ? date : new Date();
    const year = Math.max(1980, d.getFullYear());
    const dosTime = ((d.getHours() & 0x1f) << 11)
      | ((d.getMinutes() & 0x3f) << 5)
      | ((Math.floor(d.getSeconds() / 2)) & 0x1f);
    const dosDate = (((year - 1980) & 0x7f) << 9)
      | (((d.getMonth() + 1) & 0x0f) << 5)
      | (d.getDate() & 0x1f);
    return { dosDate, dosTime };
  }

  createZipBlob(entries) {
    const encoder = new TextEncoder();
    const chunks = [];
    const centralChunks = [];
    let offset = 0;

    const toBytes = (numbers) => Uint8Array.from(numbers);
    const u16 = (value, out) => { out.push(value & 0xff, (value >>> 8) & 0xff); };
    const u32 = (value, out) => {
      out.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
    };

    entries.forEach((entry) => {
      const fileName = String(entry.path || '').replace(/^\/+/, '');
      const nameBytes = encoder.encode(fileName);
      const data = entry.data instanceof Uint8Array ? entry.data : new Uint8Array(entry.data || []);
      const crc = this.getCrc32(data);
      const { dosDate, dosTime } = this.getDosDateTime(entry.lastModified);

      const localHeader = [];
      u32(0x04034b50, localHeader);
      u16(20, localHeader); // version needed
      u16(0, localHeader);  // flags
      u16(0, localHeader);  // method: store
      u16(dosTime, localHeader);
      u16(dosDate, localHeader);
      u32(crc, localHeader);
      u32(data.length, localHeader);
      u32(data.length, localHeader);
      u16(nameBytes.length, localHeader);
      u16(0, localHeader); // extra length

      const localBytes = toBytes(localHeader);
      chunks.push(localBytes, nameBytes, data);

      const centralHeader = [];
      u32(0x02014b50, centralHeader);
      u16(20, centralHeader); // made by
      u16(20, centralHeader); // needed
      u16(0, centralHeader);  // flags
      u16(0, centralHeader);  // method
      u16(dosTime, centralHeader);
      u16(dosDate, centralHeader);
      u32(crc, centralHeader);
      u32(data.length, centralHeader);
      u32(data.length, centralHeader);
      u16(nameBytes.length, centralHeader);
      u16(0, centralHeader); // extra
      u16(0, centralHeader); // comment
      u16(0, centralHeader); // disk
      u16(0, centralHeader); // attrs int
      u32(0, centralHeader); // attrs ext
      u32(offset, centralHeader);

      centralChunks.push(toBytes(centralHeader), nameBytes);
      offset += localBytes.length + nameBytes.length + data.length;
    });

    const centralOffset = offset;
    let centralSize = 0;
    centralChunks.forEach((chunk) => { centralSize += chunk.length; });

    const eocd = [];
    u32(0x06054b50, eocd);
    u16(0, eocd); // disk
    u16(0, eocd); // start disk
    u16(entries.length, eocd);
    u16(entries.length, eocd);
    u32(centralSize, eocd);
    u32(centralOffset, eocd);
    u16(0, eocd); // comment length

    return new Blob([...chunks, ...centralChunks, toBytes(eocd)], { type: 'application/zip' });
  }

  async buildBackupEntries(filePaths, onProgress) {
    const entries = [];
    const failures = [];
    const total = filePaths.length;

    for (let index = 0; index < filePaths.length; index += 1) {
      const path = filePaths[index];
      try {
        const response = await fetch(this.resolveAssetUrl(path), { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const bytes = new Uint8Array(await response.arrayBuffer());
        entries.push({ path, data: bytes, lastModified: new Date() });
      } catch (error) {
        failures.push({ path, error: error.message || String(error) });
      }

      if (typeof onProgress === 'function') {
        onProgress({ completed: index + 1, total, currentPath: path, loadedCount: entries.length, failedCount: failures.length });
      }
    }

    return { entries, failures };
  }

  downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async performBackup(options = {}) {
    const onProgress = typeof options.onProgress === 'function' ? options.onProgress : null;
    const allFiles = await this.getAppFileManifest();
    const { entries, failures } = await this.buildBackupEntries(allFiles, onProgress);

    if (!entries.length) {
      throw new Error('No files were available to include in the backup zip.');
    }

    const zipName = this.getZipFileName();
    const zipBlob = this.createZipBlob(entries);
    this.downloadBlob(zipBlob, zipName);
    this.recordBackup(zipName, entries.length, zipBlob.size, failures.length);

    return {
      success: true,
      backupName: zipName,
      fileCount: entries.length,
      failedCount: failures.length,
      sizeBytes: zipBlob.size,
      failures
    };
  }

  /**
   * Get list of files to backup
   */
  getFilesToBackup() {
    return {
      html: [
        'new-index_v7_0_112.html',
        'automation-control-panel.html'
      ],
      js: [
        'tag-automation-system.js',
        'tag-manager.js',
        'tag-ui-manager.js',
        'tag-config.js',
        'tag-hierarchy.js',
        'tag-hierarchy-ui.js',
        'city-visualizer.js',
        'location-history-manager.js'
      ],
      data: [
        'locations.csv',
        'locations.xlsx',
        'adventures.xlsx',
        'adventures.csv'
      ]
    };
  }

  /**
   * Create backup manifest
   */
  createManifest(backupName) {
    const now = new Date();
    const files = this.getFilesToBackup();

    return {
      backupName: backupName,
      timestamp: now.toISOString(),
      readableDate: now.toLocaleString(),
      appVersion: 'v7.0.116',
      filesIncluded: {
        htmlCount: files.html.length,
        jsCount: files.js.length,
        dataCount: files.data.length,
        total: files.html.length + files.js.length + files.data.length
      },
      files: files,
      description: 'Full backup of Adventure Finder application'
    };
  }

  /**
   * Record backup in history
   */
  recordBackup(backupName, fileCount, sizeBytes = 0, failedCount = 0) {
    this.backupHistory.push({
      name: backupName,
      date: new Date().toISOString(),
      readableDate: new Date().toLocaleString(),
      fileCount: fileCount,
      sizeBytes: Number(sizeBytes || 0),
      failedCount: Number(failedCount || 0)
    });

    // Keep only last 20 backups
    if (this.backupHistory.length > 20) {
      this.backupHistory = this.backupHistory.slice(-20);
    }

    this.saveBackupHistory();
  }

  /**
   * Create backup (client-side simulation)
   */
  async createBackup() {
    try {
      const result = await this.performBackup();
      return {
        success: true,
        backupName: result.backupName,
        message: `✅ Backup downloaded: ${result.backupName}`
      };
    } catch (err) {
      return {
        success: false,
        error: err.message,
        message: `❌ Backup failed: ${err.message}`
      };
    }
  }

  openBackupPage() {
    const activeTab = document.querySelector('.app-tab-btn.active[data-tab]')?.getAttribute('data-tab') || '';
    if (activeTab && activeTab !== 'app-backup') {
      this.lastNonBackupTab = activeTab;
    }
    if (window.tabLoader && typeof window.tabLoader.switchTab === 'function') {
      window.tabLoader.switchTab('app-backup', { syncUrl: true, historyMode: 'push', source: 'header-backup' });
      return;
    }
    const pane = document.querySelector('.app-tab-pane[data-tab="app-backup"]');
    if (pane) pane.classList.add('active');
    this.refreshBackupPageSummary();
  }

  goBackFromBackupPage() {
    const returnTab = this.lastNonBackupTab || 'visited-locations';
    if (window.tabLoader && typeof window.tabLoader.switchTab === 'function' && returnTab !== 'app-backup') {
      window.tabLoader.switchTab(returnTab, { syncUrl: true, historyMode: 'push', source: 'backup-back' });
      return;
    }
    if (window.history.length > 1) {
      window.history.back();
    }
  }

  formatBytes(sizeBytes) {
    const bytes = Number(sizeBytes || 0);
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = bytes;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex += 1;
    }
    const precision = unitIndex === 0 ? 0 : 1;
    return `${value.toFixed(precision)} ${units[unitIndex]}`;
  }

  renderManifestPreview(files, errorMessage = '') {
    const metaNode = document.getElementById('appBackupManifestPreviewMeta');
    const listNode = document.getElementById('appBackupManifestPreviewList');
    if (!metaNode || !listNode) return;

    if (errorMessage) {
      metaNode.textContent = `Preview unavailable: ${errorMessage}`;
      listNode.innerHTML = '';
      this._manifestFiles = [];
      return;
    }

    const items = Array.isArray(files) ? files : [];
    this._manifestFiles = items;
    metaNode.textContent = `${items.length} files included in the backup zip.`;

    if (!items.length) {
      listNode.innerHTML = '<li>No files detected.</li>';
      return;
    }

    listNode.innerHTML = items
      .map((path) => `<li data-path="${this.escapeHtml(path.toLowerCase())}"><code>${this.escapeHtml(path)}</code></li>`)
      .join('');

    this.bindManifestFilter();
  }

  bindManifestFilter() {
    const filterInput = document.getElementById('appBackupManifestFilter');
    const listNode = document.getElementById('appBackupManifestPreviewList');
    const metaNode = document.getElementById('appBackupManifestPreviewMeta');
    if (!filterInput || !listNode) return;

    // Avoid double-binding
    if (filterInput.dataset.filterBound === '1') return;
    filterInput.dataset.filterBound = '1';

    filterInput.addEventListener('input', () => {
      const query = filterInput.value.trim().toLowerCase();
      const items = listNode.querySelectorAll('li[data-path]');
      let visibleCount = 0;

      items.forEach((li) => {
        const match = !query || li.dataset.path.includes(query);
        li.classList.toggle('hidden', !match);
        if (match) visibleCount += 1;
      });

      // Update or remove the no-results notice
      let noResults = listNode.querySelector('.app-backup-manifest-no-results');
      if (visibleCount === 0 && query) {
        if (!noResults) {
          noResults = document.createElement('li');
          noResults.className = 'app-backup-manifest-no-results';
          listNode.appendChild(noResults);
        }
        noResults.textContent = `No files match "${filterInput.value.trim()}"`;
      } else if (noResults) {
        noResults.remove();
      }

      // Update meta count to reflect filtered view
      if (metaNode) {
        const total = this._manifestFiles ? this._manifestFiles.length : items.length;
        metaNode.textContent = query
          ? `${visibleCount} of ${total} files match "${filterInput.value.trim()}"`
          : `${total} files included in the backup zip.`;
      }
    });
  }

  async refreshBackupPageSummary() {
    const totalNode = document.getElementById('appBackupManifestCount');
    const lastNode = document.getElementById('appBackupLastBackup');
    if (totalNode) {
      try {
        const files = await this.getAppFileManifest();
        totalNode.textContent = `${files.length} files`;
        this.renderManifestPreview(files);
      } catch (error) {
        totalNode.textContent = 'Unavailable';
        this.renderManifestPreview([], error && error.message ? error.message : 'Unknown error');
      }
    }
    if (lastNode) {
      const latest = this.backupHistory[this.backupHistory.length - 1];
      if (!latest) {
        lastNode.textContent = 'No backups downloaded yet.';
      } else {
        const failures = latest.failedCount ? ` (${latest.failedCount} skipped)` : '';
        lastNode.textContent = `${latest.name} - ${latest.readableDate} - ${this.formatBytes(latest.sizeBytes)}${failures}`;
      }
    }
  }

  async handleBackupPageCreateClick() {
    const createBtn = document.getElementById('appBackupCreateZipBtn');
    const status = document.getElementById('appBackupStatus');
    const progress = document.getElementById('appBackupProgress');

    if (createBtn) createBtn.disabled = true;
    if (progress) {
      progress.hidden = false;
      progress.textContent = 'Preparing backup...';
    }

    try {
      const result = await this.performBackup({
        onProgress: ({ completed, total, currentPath, failedCount }) => {
          if (!progress) return;
          progress.textContent = `Packing ${completed}/${total}: ${currentPath}${failedCount ? ` (${failedCount} skipped)` : ''}`;
        }
      });

      if (status) {
        const skipped = result.failedCount ? ` (${result.failedCount} skipped)` : '';
        status.textContent = `✅ Backup downloaded: ${result.backupName} (${result.fileCount} files, ${this.formatBytes(result.sizeBytes)})${skipped}`;
        status.className = 'card-subtitle';
      }
    } catch (error) {
      if (status) {
        status.textContent = `❌ Backup failed: ${error.message}`;
        status.className = 'card-subtitle';
      }
    } finally {
      if (createBtn) createBtn.disabled = false;
      if (progress) progress.hidden = true;
      this.refreshBackupPageSummary();
    }
  }

  /**
   * Show backup UI modal
   */
  showBackupModal() {
    const backdrop = document.createElement('div');
    backdrop.className = 'backup-modal-backdrop visible';
    backdrop.onclick = () => this.closeBackupModal(backdrop);

    const modal = document.createElement('div');
    modal.className = 'backup-modal';

    const files = this.getFilesToBackup();
    const totalFiles = files.html.length + files.js.length + files.data.length;

    let html = `
      <div class="backup-modal-header">
        <h2 class="backup-modal-title">💾 Backup Manager</h2>
        <button class="backup-modal-close" onclick="this.closest('.backup-modal-backdrop').remove()">✕</button>
      </div>

      <div class="backup-modal-body">
        <!-- Create Backup Section -->
        <div class="backup-section">
          <div class="backup-section-title">
            <span class="backup-section-icon">💾</span>
            Create New Backup
          </div>
          <button class="backup-button primary" id="createBackupBtn" onclick="backupManager.handleCreateBackup()">
            <span class="backup-icon">📦</span>
            <div class="backup-content">
              <div class="backup-title">Create Full Backup</div>
              <p class="backup-description">Backup ${totalFiles} files with timestamp</p>
            </div>
          </button>
        </div>

        <!-- Files to Backup -->
        <div class="backup-section">
          <div class="backup-section-title">
            <span class="backup-section-icon">📋</span>
            Files Included (${totalFiles} total)
          </div>
          <div class="backup-file-list">
            <div style="margin-bottom: 12px; font-weight: 600; color: #1f2937; font-size: 13px;">HTML Files (${files.html.length})</div>
    `;

    files.html.forEach(file => {
      html += `
        <div class="backup-file-item">
          <span class="backup-file-icon">📄</span>
          <span>${file}</span>
        </div>
      `;
    });

    html += `
      <div style="margin-top: 12px; margin-bottom: 12px; font-weight: 600; color: #1f2937; font-size: 13px;">JavaScript Files (${files.js.length})</div>
    `;

    files.js.forEach(file => {
      html += `
        <div class="backup-file-item">
          <span class="backup-file-icon">⚙️</span>
          <span>${file}</span>
        </div>
      `;
    });

    html += `
      <div style="margin-top: 12px; margin-bottom: 12px; font-weight: 600; color: #1f2937; font-size: 13px;">Data Files (${files.data.length})</div>
    `;

    files.data.forEach(file => {
      html += `
        <div class="backup-file-item">
          <span class="backup-file-icon">📊</span>
          <span>${file}</span>
        </div>
      `;
    });

    html += `
          </div>
        </div>

        <!-- Backup Statistics -->
        <div class="backup-section">
          <div class="backup-section-title">
            <span class="backup-section-icon">📊</span>
            Statistics
          </div>
          <div class="backup-stats">
            <div class="backup-stat-card">
              <div class="backup-stat-value">${files.html.length}</div>
              <div class="backup-stat-label">HTML Files</div>
            </div>
            <div class="backup-stat-card">
              <div class="backup-stat-value">${files.js.length}</div>
              <div class="backup-stat-label">JS Files</div>
            </div>
            <div class="backup-stat-card">
              <div class="backup-stat-value">${files.data.length}</div>
              <div class="backup-stat-label">Data Files</div>
            </div>
            <div class="backup-stat-card">
              <div class="backup-stat-value">${totalFiles}</div>
              <div class="backup-stat-label">Total</div>
            </div>
          </div>
        </div>

        <!-- Backup Progress -->
        <div class="backup-progress" id="backupProgress">
          <div class="backup-progress-bar">
            <div class="backup-progress-fill" id="backupProgressFill"></div>
          </div>
          <div class="backup-progress-text" id="backupProgressText">Creating backup...</div>
        </div>

        <!-- Backup History -->
        <div class="backup-section">
          <div class="backup-section-title">
            <span class="backup-section-icon">📜</span>
            Recent Backups (${this.backupHistory.length})
          </div>
    `;

    if (this.backupHistory.length === 0) {
      html += '<p style="padding: 16px; text-align: center; color: #9ca3af; font-size: 13px;">No backups yet</p>';
    } else {
      html += '<div class="backup-history-list">';

      // Show last 5 backups
      const recentBackups = this.backupHistory.slice(-5).reverse();
      recentBackups.forEach((backup, idx) => {
        html += `
          <div class="backup-history-item">
            <div class="backup-history-info">
              <div class="backup-history-date">${backup.name}</div>
              <div class="backup-history-size">${backup.fileCount} files • ${backup.readableDate}</div>
            </div>
          </div>
        `;
      });

      html += '</div>';
    }

    html += `
        </div>

        <!-- Messages -->
        <div id="backupMessage"></div>
      </div>
    `;

    modal.innerHTML = html;
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    // Store reference
    this.currentBackupModal = { modal, backdrop };
  }

  /**
   * Handle create backup button
   */
  async handleCreateBackup() {
    const btn = document.getElementById('createBackupBtn');
    const progress = document.getElementById('backupProgress');
    const msgDiv = document.getElementById('backupMessage');

    if (btn) btn.disabled = true;
    if (progress) progress.classList.add('visible');

    // Simulate backup creation
    for (let i = 0; i <= 100; i += 10) {
      const fill = document.getElementById('backupProgressFill');
      const text = document.getElementById('backupProgressText');
      if (fill) fill.style.width = i + '%';
      if (text) text.textContent = `Creating backup... ${i}%`;
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Create backup record
    const result = await this.createBackup();

    if (result.success) {
      if (msgDiv) {
        msgDiv.innerHTML = `
          <div class="backup-message success">
            ✅ ${result.message}
            <br/>
            <small>Folder: ${result.backupName}</small>
          </div>
        `;
      }
    } else {
      if (msgDiv) {
        msgDiv.innerHTML = `
          <div class="backup-message error">
            ❌ ${result.message}
          </div>
        `;
      }
    }

    if (progress) progress.classList.remove('visible');
    if (btn) btn.disabled = false;

    // Refresh modal after 2 seconds
    setTimeout(() => {
      if (this.currentBackupModal) {
        this.currentBackupModal.backdrop.remove();
        this.showBackupModal();
      }
    }, 2000);
  }

  /**
   * Close backup modal
   */
  closeBackupModal(backdrop) {
    backdrop.remove();
  }

  /**
   * Escape HTML
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }
}

// Create global instance
window.backupManager = new BackupManager();

