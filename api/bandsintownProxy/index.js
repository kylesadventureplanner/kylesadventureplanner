'use strict';

const APP_ID = 'kyles_adventure_planner';

function json(status, body) {
  return {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    },
    body
  };
}

function readParam(req, key) {
  if (!req || !req.query) return '';
  return String(req.query[key] || '').trim();
}

function buildUpstreamUrl(route, artist) {
  const encodedArtist = encodeURIComponent(artist);
  if (route === 'artist') {
    return `https://www.bandsintown.com/api/v2/artists/${encodedArtist}?app_id=${encodeURIComponent(APP_ID)}`;
  }
  if (route === 'events') {
    return `https://www.bandsintown.com/api/v2/artists/${encodedArtist}/events?app_id=${encodeURIComponent(APP_ID)}`;
  }
  return '';
}

module.exports = async function bandsintownProxy(context, req) {
  const safeReq = req || (context && context.req) || { method: 'GET', query: {} };
  const method = String(safeReq.method || 'GET').toUpperCase();
  if (method === 'OPTIONS') {
    context.res = json(204, '');
    return;
  }

  const route = readParam(safeReq, 'route').toLowerCase();
  const artist = readParam(safeReq, 'artist');

  if (!route || !artist) {
    context.res = json(400, {
      ok: false,
      error: 'missing_parameters',
      message: 'Both route and artist query parameters are required.'
    });
    return;
  }

  const upstreamUrl = buildUpstreamUrl(route, artist);
  if (!upstreamUrl) {
    context.res = json(400, {
      ok: false,
      error: 'invalid_route',
      message: 'Route must be one of: artist, events.'
    });
    return;
  }

  const hasAbort = typeof AbortController === 'function';
  const controller = hasAbort ? new AbortController() : null;
  const timeout = hasAbort ? setTimeout(() => controller.abort(), 15000) : null;

  try {
    const upstream = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      },
      signal: controller ? controller.signal : undefined
    });

    const raw = await upstream.text().catch(() => '');
    let payload;
    try {
      payload = raw ? JSON.parse(raw) : (route === 'events' ? [] : {});
    } catch (_) {
      payload = route === 'events' ? [] : {};
    }

    if (!upstream.ok) {
      context.log.warn('bandsintownProxy upstream failure', { status: upstream.status, route, artist });
      context.res = json(upstream.status, {
        ok: false,
        error: 'upstream_error',
        message: `Bandsintown request failed (${upstream.status}).`,
        data: payload
      });
      return;
    }

    context.res = json(200, {
      ok: true,
      route,
      artist,
      data: payload
    });
  } catch (err) {
    const message = err && err.name === 'AbortError'
      ? 'Bandsintown request timed out.'
      : (err && err.message ? err.message : 'Unexpected server error');
    context.log.error('bandsintownProxy failed', { route, artist, message });
    context.res = json(502, {
      ok: false,
      error: 'network_error',
      message
    });
  } finally {
    if (timeout) clearTimeout(timeout);
  }
};

