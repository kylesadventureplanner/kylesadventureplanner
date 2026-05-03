'use strict';

function response(status, body, headers, isRaw) {
  return {
    status,
    headers: Object.assign({
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }, headers || {}),
    body,
    isRaw: !!isRaw
  };
}

function readParam(req, key) {
  if (!req || !req.query) return '';
  return String(req.query[key] || '').trim();
}

function isAllowedProtocol(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

function isImageContentType(value) {
  return /^image\//i.test(String(value || '').trim());
}

module.exports = async function imageFetchProxy(context, req) {
  if (req.method === 'OPTIONS') {
    context.res = response(204, '');
    return;
  }

  const targetUrl = readParam(req, 'url');
  if (!targetUrl) {
    context.res = response(400, {
      ok: false,
      error: 'missing_url',
      message: 'url query parameter is required.'
    }, { 'Content-Type': 'application/json' });
    return;
  }

  if (!isAllowedProtocol(targetUrl)) {
    context.res = response(400, {
      ok: false,
      error: 'invalid_url',
      message: 'Only http(s) image URLs are allowed.'
    }, { 'Content-Type': 'application/json' });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const upstream = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Accept: 'image/*',
        'User-Agent': 'KylesAdventurePlanner/1.0 (+https://kylesadventureplanner)'
      },
      signal: controller.signal
    });

    if (!upstream.ok) {
      context.res = response(upstream.status, {
        ok: false,
        error: 'upstream_error',
        message: 'Image request failed (' + upstream.status + ').'
      }, { 'Content-Type': 'application/json' });
      return;
    }

    const contentType = String(upstream.headers.get('content-type') || '').trim();
    const bytes = await upstream.arrayBuffer();
    const body = Buffer.from(bytes);

    if (!isImageContentType(contentType) && body.length === 0) {
      context.res = response(415, {
        ok: false,
        error: 'invalid_image',
        message: 'Upstream response was empty or not an image.'
      }, { 'Content-Type': 'application/json' });
      return;
    }

    context.res = response(200, body, {
      'Content-Type': contentType || 'application/octet-stream'
    }, true);
  } catch (error) {
    const message = error && error.name === 'AbortError'
      ? 'Image request timed out.'
      : (error && error.message ? String(error.message) : 'Image fetch failed.');
    context.res = response(502, {
      ok: false,
      error: 'network_error',
      message
    }, { 'Content-Type': 'application/json' });
  } finally {
    clearTimeout(timeout);
  }
};

