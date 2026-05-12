(function () {
  var schemaStatusByKey = {};
  var globalBannerConfigByKey = {};

  function normalizeColumnName(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  function normalizeList(values) {
    return (Array.isArray(values) ? values : [])
      .map(normalizeColumnName)
      .filter(Boolean);
  }

  function isAdvancedMode() {
    try {
      if (typeof window.getAppMode === 'function') return window.getAppMode() === 'advanced';
    } catch (_error) {}
    return document.documentElement.getAttribute('data-app-mode') === 'advanced';
  }

  function evaluateSchema(columnNames, requiredColumns, recommendedColumns) {
    var available = new Set(normalizeList(columnNames));
    var required = normalizeList(requiredColumns);
    var recommended = normalizeList(recommendedColumns);

    var missingRequired = required.filter(function (name) { return !available.has(name); });
    var missingRecommended = recommended.filter(function (name) {
      return !available.has(name) && missingRequired.indexOf(name) < 0;
    });

    return {
      ok: missingRequired.length === 0,
      missingRequired: missingRequired,
      missingRecommended: missingRecommended,
      availableCount: available.size
    };
  }

  function ensureDock() {
    var dock = document.getElementById('excelSchemaBannerDock');
    if (dock) return dock;

    dock = document.createElement('div');
    dock.id = 'excelSchemaBannerDock';
    dock.style.position = 'fixed';
    dock.style.right = '12px';
    dock.style.bottom = '12px';
    dock.style.zIndex = '9999';
    dock.style.display = 'flex';
    dock.style.flexDirection = 'column';
    dock.style.gap = '8px';
    dock.style.maxWidth = '420px';
    document.body.appendChild(dock);
    return dock;
  }

  function bannerHtml(title, message, details, tone) {
    function esc(value) {
      return String(value || '').replace(/[&<>"']/g, function (char) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
      });
    }
    var bg = tone === 'error' ? '#fef2f2' : '#fffbeb';
    var border = tone === 'error' ? '#fca5a5' : '#fcd34d';
    var color = tone === 'error' ? '#991b1b' : '#92400e';
    var detailsHtml = details ? '<div style="margin-top:4px;font-size:12px;opacity:0.9;">' + esc(details) + '</div>' : '';
    return '<div style="border:1px solid ' + border + ';background:' + bg + ';color:' + color + ';border-radius:10px;padding:10px 12px;font-size:13px;line-height:1.35;box-shadow:0 6px 18px rgba(15,23,42,0.12);">' +
      '<div style="font-weight:700;">' + esc(title) + '</div>' +
      '<div>' + esc(message) + '</div>' +
      detailsHtml +
    '</div>';
  }

  function emitSchemaStatusChanged() {
    document.dispatchEvent(new CustomEvent('kap:excel-schema-status-changed', {
      detail: { count: Object.keys(schemaStatusByKey).length }
    }));
  }

  function getSchemaStatusSnapshot() {
    return Object.keys(schemaStatusByKey).sort().map(function (key) {
      var item = schemaStatusByKey[key] || {};
      return {
        key: key,
        feature: String(item.feature || key),
        table: String(item.table || ''),
        tone: String(item.tone || ''),
        details: String(item.details || ''),
        missingRequired: normalizeList(item.missingRequired || []),
        missingRecommended: normalizeList(item.missingRecommended || []),
        checkedAt: item.checkedAt || 0
      };
    });
  }

  function reportSchemaStatus(key, config) {
    key = String(key || '').trim();
    if (!key) return;
    config = config || {};
    schemaStatusByKey[key] = {
      key: key,
      feature: String(config.feature || config.title || key),
      table: String(config.table || ''),
      tone: String(config.tone || ''),
      details: String(config.details || ''),
      missingRequired: normalizeList(config.missingRequired || []),
      missingRecommended: normalizeList(config.missingRecommended || []),
      checkedAt: config.checkedAt || Date.now()
    };
    emitSchemaStatusChanged();
  }

  function clearSchemaStatus(key) {
    key = String(key || '').trim();
    if (!key) return;
    delete schemaStatusByKey[key];
    emitSchemaStatusChanged();
  }

  function renderGlobalBanners() {
    var isAdvanced = isAdvancedMode();
    var dock = document.getElementById('excelSchemaBannerDock');
    if (!isAdvanced) {
      if (dock) dock.style.display = 'none';
      return;
    }
    dock = ensureDock();
    dock.style.display = 'flex';
    Object.keys(globalBannerConfigByKey).forEach(function (key) {
      var config = globalBannerConfigByKey[key] || {};
      var id = 'excel-schema-banner-' + String(key).replace(/[^a-z0-9_-]+/gi, '-');
      var banner = document.getElementById(id);
      if (!banner) {
        banner = document.createElement('div');
        banner.id = id;
        dock.appendChild(banner);
      }
      banner.innerHTML = bannerHtml(
        String(config.title || 'Excel schema warning'),
        String(config.message || ''),
        String(config.details || ''),
        String(config.tone || 'warning')
      );
    });
  }

  function upsertGlobalBanner(key, config) {
    if (!key) return;
    config = config || {};
    globalBannerConfigByKey[key] = {
      title: String(config.title || 'Excel schema warning'),
      message: String(config.message || ''),
      details: String(config.details || ''),
      tone: String(config.tone || 'warning')
    };
    renderGlobalBanners();
  }

  function clearGlobalBanner(key) {
    delete globalBannerConfigByKey[key];
    var id = 'excel-schema-banner-' + String(key || '').replace(/[^a-z0-9_-]+/gi, '-');
    var banner = document.getElementById(id);
    if (banner) banner.remove();
    var dock = document.getElementById('excelSchemaBannerDock');
    if (dock && !dock.children.length) dock.style.display = 'none';
  }

  function renderInline(host, config) {
    if (!host) return;
    if (!isAdvancedMode()) {
      host.innerHTML = '';
      return;
    }
    config = config || {};
    host.innerHTML = bannerHtml(
      String(config.title || 'Excel schema warning'),
      String(config.message || ''),
      String(config.details || ''),
      String(config.tone || 'warning')
    );
  }

  function clearInline(host) {
    if (host) host.innerHTML = '';
  }

  document.addEventListener('kap:app-mode-changed', function () {
    renderGlobalBanners();
  });

  window.ExcelSchemaCheckHelper = {
    normalizeColumnName: normalizeColumnName,
    evaluateSchema: evaluateSchema,
    isAdvancedMode: isAdvancedMode,
    getSchemaStatusSnapshot: getSchemaStatusSnapshot,
    reportSchemaStatus: reportSchemaStatus,
    clearSchemaStatus: clearSchemaStatus,
    upsertGlobalBanner: upsertGlobalBanner,
    clearGlobalBanner: clearGlobalBanner,
    renderInline: renderInline,
    clearInline: clearInline
  };
})();

