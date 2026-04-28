(function initUiStatusMessageComposer(global) {
  'use strict';

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }

  function normalizeTone(value) {
    var tone = String(value || 'info').trim().toLowerCase();
    if (tone === 'success' || tone === 'error' || tone === 'warning') return tone;
    return 'info';
  }

  function toActionArray(options) {
    if (Array.isArray(options && options.actions) && options.actions.length) {
      return options.actions;
    }
    if (options && options.action && typeof options.action === 'object') {
      return [options.action];
    }
    return [];
  }

  function composeActionHtml(action, index) {
    var safeAction = action && typeof action === 'object' ? action : {};
    var label = String(safeAction.label || '').trim();
    if (!label) return '';
    var className = String(safeAction.className || 'ui-btn ui-btn--mini').trim();
    var onClick = String(safeAction.onClick || '').trim();
    var title = String(safeAction.title || '').trim();
    var attributes = '';
    if (title) attributes += ' title="' + escapeAttr(title) + '"';
    if (onClick) attributes += ' onclick="' + escapeAttr(onClick) + '"';
    return '<button type="button" class="' + escapeAttr(className) + '" data-ui-status-action-index="' + index + '"' + attributes + '>' + escapeHtml(label) + '</button>';
  }

  function composeStatusMessageHTML(options) {
    var safeOptions = options && typeof options === 'object' ? options : {};
    var text = String(safeOptions.text || '').trim();
    if (!text) return '';

    var tone = normalizeTone(safeOptions.tone);
    var icon = String(safeOptions.icon || (tone === 'success' ? '✅' : tone === 'error' ? '❌' : tone === 'warning' ? '⚠️' : 'ℹ️')).trim();
    var detail = String(safeOptions.detail || '').trim();
    var className = String(safeOptions.className || '').trim();
    var actionsClassName = String(safeOptions.actionsClassName || 'ui-btn-group ui-btn-group--compact ui-status-message-actions').trim();
    var actions = toActionArray(safeOptions)
      .map(function mapAction(action, index) { return composeActionHtml(action, index); })
      .filter(Boolean)
      .join('');

    return [
      '<div class="ui-status-message ui-status-message--' + escapeAttr(tone) + (className ? ' ' + escapeAttr(className) : '') + '">',
      '  <div class="ui-status-message-main">',
      icon ? '    <span class="ui-status-message-icon" aria-hidden="true">' + escapeHtml(icon) + '</span>' : '',
      '    <span class="ui-status-message-text">' + escapeHtml(text) + '</span>',
      '  </div>',
      detail ? '  <div class="ui-status-message-detail">' + escapeHtml(detail) + '</div>' : '',
      actions ? '  <div class="' + escapeAttr(actionsClassName) + '">' + actions + '</div>' : '',
      '</div>'
    ].filter(Boolean).join('');
  }

  function renderStatusMessage(target, options) {
    var node = null;
    if (typeof target === 'string') {
      node = global.document ? global.document.getElementById(target) : null;
    } else if (target && target.nodeType === 1) {
      node = target;
    }
    if (!node) return;
    node.innerHTML = composeStatusMessageHTML(options);
  }

  global.composeStatusMessageHTML = composeStatusMessageHTML;
  global.renderStatusMessage = renderStatusMessage;
})(window);

