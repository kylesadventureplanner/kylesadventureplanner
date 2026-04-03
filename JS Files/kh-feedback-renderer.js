(function initKhFeedbackRenderer() {
  var VERSION = '1.0.0';
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

  function buildRenderer() {
    return function renderKhFeedbackBlock(input) {
      var data = input || {};

      var rating = Math.max(0, Math.min(5, Number(data.ratingValue) || 0));
      var ratingText = rating > 0 ? ''.concat('\u2B50'.repeat(rating)).concat('\u2606'.repeat(5 - rating)) : 'Not yet Reviewed';

      var favoriteRaw = data.favoriteValue;
      var favoriteNorm = String(favoriteRaw || '').trim().toLowerCase();
      var isFavorite = favoriteNorm === 'true' || favoriteNorm === '1' || favoriteRaw === 1;
      var favoriteText = isFavorite ? 'Marked as Favorite' : 'Not marked as Favorite';

      var visitedNorm = String(data.visitedValue || '').trim().toLowerCase();
      var visitedHtml = visitedNorm === 'yes'
        ? '<span class="kh-feedback-visited-yes">\u2705 Visited</span>'
        : 'This Adventure still Awaits...';

      var notesText = escapeHtml(parseNotesPreview(data.notesValue));

      return [
        '<div class="kh-feedback-block">',
        '  <div class="kh-feedback-title">K&H Feedback</div>',
        '  <div class="kh-feedback-row kh-feedback-row-first">Review Rating: <strong>' + ratingText + '</strong></div>',
        '  <div class="kh-feedback-row">Favorite: <strong>' + favoriteText + '</strong></div>',
        '  <div class="kh-feedback-row">Visited: ' + visitedHtml + '</div>',
        '  <div class="kh-feedback-row kh-feedback-notes">Notes: ' + notesText + '</div>',
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

