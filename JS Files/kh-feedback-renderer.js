(function initKhFeedbackRenderer() {
  var VERSION = '1.2.0';
  var SOURCE = 'JS Files/kh-feedback-renderer.js';

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function parseNotesPreview(raw) {
    var text = String(raw || '').trim();
    if (!text) return 'No comments yet...';

    var prefix = 'NOTES_JSON_V1::';
    var jsonPayload = '';
    if (text.indexOf(prefix) === 0) jsonPayload = text.slice(prefix.length).trim();
    else if (text.charAt(0) === '[' && text.charAt(text.length - 1) === ']') jsonPayload = text;

    if (jsonPayload) {
      try {
        var parsed = JSON.parse(jsonPayload);
        if (Array.isArray(parsed)) {
          var clean = parsed.map(function (item) {
            return String(item == null ? '' : item).trim();
          }).filter(Boolean);
          if (clean.length) return clean.join(' | ');
        }
      } catch (_err) {
        // Keep raw text fallback if notes payload is malformed.
      }
    }

    var byDivider = text.split(/\n-{3,}\n/g).map(function (part) {
      return part.trim();
    }).filter(Boolean);
    if (byDivider.length > 1) return byDivider.join(' | ');

    var byParagraph = text.split(/\n\s*\n/g).map(function (part) {
      return part.trim();
    }).filter(Boolean);
    if (byParagraph.length > 1) return byParagraph.join(' | ');

    return text;
  }

  function parseTruthy(value) {
    var text = String(value == null ? '' : value).trim().toLowerCase();
    return text === 'true' || text === '1' || text === 'yes' || text === 'y' || text === 'favorite';
  }

  function parseVisited(value) {
    var text = String(value == null ? '' : value).trim().toLowerCase();
    return text === 'yes' || text === 'y' || text === 'true' || text === '1' || text === 'visited' || text === 'done';
  }

  function buildRenderer() {
    return function renderKhFeedbackBlock(input) {
      var data = input || {};

      var rating = Math.max(0, Math.min(5, Number(data.ratingValue) || 0));
      var ratingText = rating > 0 ? ''.concat('\u2B50'.repeat(rating)).concat('\u2606'.repeat(5 - rating)) : 'Not yet Reviewed';

      var isFavorite = parseTruthy(data.favoriteValue);
      var isVisited = parseVisited(data.visitedValue);

      var notesText = escapeHtml(parseNotesPreview(data.notesValue));

      return [
        '<div class="kh-feedback-block">',
        '  <div class="kh-feedback-header">',
        '    <div class="kh-feedback-title">K&H Feedback</div>',
        '    <div class="kh-feedback-status-row">',
        '      <span class="kh-chip kh-chip-rating">⭐ ' + escapeHtml(ratingText) + '</span>',
        '      <span class="kh-chip ' + (isFavorite ? 'kh-chip-fav-on' : 'kh-chip-fav-off') + '">' + (isFavorite ? '💖 Favorite' : '🤍 Not Favorite') + '</span>',
        '      <span class="kh-chip ' + (isVisited ? 'kh-chip-visited' : 'kh-chip-not-visited') + '">' + (isVisited ? '✅ Visited' : '🕒 Not Visited') + '</span>',
        '    </div>',
        '  </div>',
        '  <div class="kh-feedback-notes-wrap">',
        '    <div class="kh-feedback-notes-label">Notes</div>',
        '    <div class="kh-feedback-row kh-feedback-notes">' + notesText + '</div>',
        '  </div>',
        '</div>'
      ].join('\n');
    };
  }

  var existing = window.renderKhFeedbackBlock;
  if (typeof existing === 'function') {
    var existingMeta = existing.__khRendererMeta || {};
    console.warn('[K&H] Duplicate renderer assignment attempt detected.', {
      existingSource: existingMeta.source || 'unknown',
      existingVersion: existingMeta.version || 'unknown',
      incomingSource: SOURCE,
      incomingVersion: VERSION
    });

    if (existingMeta.source === SOURCE && existingMeta.version === VERSION) {
      return;
    }
  }

  var renderer = buildRenderer();
  renderer.__khRendererMeta = { source: SOURCE, version: VERSION };
  window.renderKhFeedbackBlock = renderer;
})();

