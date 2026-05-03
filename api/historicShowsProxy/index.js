'use strict';

const SETLIST_API_BASE = 'https://api.setlist.fm/rest/1.0';
const BANDSINTOWN_API_BASE = 'https://www.bandsintown.com/api/v2';
const DEFAULT_BANDSINTOWN_APP_ID = 'kyles_adventure_planner';
const DEFAULT_PAGE_LIMIT = 4;
const DEFAULT_RESULT_LIMIT = 40;
const DEFAULT_FROM_YEAR = 2006;
const DEFAULT_SONG_STATS_LIMIT = 12;

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

function normalizeKey(value) {
  return String(value || '')
	.toLowerCase()
	.replace(/[^a-z0-9]+/g, ' ')
	.trim();
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function parseEventDate(raw) {
  const value = String(raw || '').trim();
  const match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : '';
}

function parseCoordinate(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function haversineMiles(lat1, lon1, lat2, lon2) {
  const earthMiles = 3958.7613;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
	+ Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2))
	* Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthMiles * c;
}

async function fetchSetlistJson(url, apiKey) {
  const response = await fetch(url, {
	method: 'GET',
	headers: {
	  Accept: 'application/json',
	  'x-api-key': apiKey,
	  'User-Agent': 'KylesAdventurePlanner/1.0 (+https://kylesadventureplanner)'
	}
  });

  if (!response.ok) {
	const text = await response.text().catch(() => '');
	throw new Error(`Setlist.fm request failed (${response.status})${text ? `: ${text.slice(0, 160)}` : ''}`);
  }

  return response.json().catch(() => ({}));
}

async function fetchSetlistSongStats(params, apiKey) {
  if (!apiKey) {
	return {
	  source: 'setlist.fm',
	  ok: false,
	  message: 'SETLISTFM_API_KEY missing',
	  data: []
	};
  }
  const encodedBand = encodeURIComponent(params.band);
  const songCounts = new Map();
  const sampledSetlists = [];
  let scanned = 0;

  for (let page = 1; page <= DEFAULT_PAGE_LIMIT; page += 1) {
	if (scanned >= DEFAULT_SONG_STATS_LIMIT) break;
	const searchUrl = `${SETLIST_API_BASE}/search/setlists?artistName=${encodedBand}&p=${page}`;
	const searchPayload = await fetchSetlistJson(searchUrl, apiKey);
	const setlists = Array.isArray(searchPayload.setlist) ? searchPayload.setlist : [];
	if (!setlists.length) break;

	for (const setlist of setlists) {
	  if (scanned >= DEFAULT_SONG_STATS_LIMIT) break;
	  const isoDate = parseEventDate(setlist && setlist.eventDate);
	  if (!isoDate) continue;
	  const year = Number(isoDate.slice(0, 4));
	  if (!Number.isFinite(year) || year < params.fromYear || year > params.toYear) continue;
	  const id = String(setlist && setlist.id ? setlist.id : '').trim();
	  if (!id) continue;

	  const detailUrl = `${SETLIST_API_BASE}/setlist/${encodeURIComponent(id)}`;
	  const detailPayload = await fetchSetlistJson(detailUrl, apiKey);
	  scanned += 1;
	  sampledSetlists.push({
		id,
		eventDate: isoDate,
		venue: String((detailPayload.venue && detailPayload.venue.name) || '').trim()
	  });
	  const setsRoot = detailPayload && detailPayload.sets ? detailPayload.sets : {};
	  const setRows = Array.isArray(setsRoot.set) ? setsRoot.set : [];
	  setRows.forEach((setRow) => {
		const songs = Array.isArray(setRow && setRow.song) ? setRow.song : [];
		songs.forEach((song) => {
		  const name = String(song && song.name ? song.name : '').trim();
		  if (!name) return;
		  const key = normalizeKey(name);
		  const prior = songCounts.get(key) || { song: name, count: 0 };
		  prior.count += 1;
		  if (!prior.song || prior.song.length < name.length) prior.song = name;
		  songCounts.set(key, prior);
		});
	  });
	}
  }

  const data = Array.from(songCounts.values())
	.sort((a, b) => b.count - a.count || a.song.localeCompare(b.song))
	.slice(0, 20)
	.map((entry) => ({
	  song: entry.song,
	  frequency: entry.count,
	  confidence: Math.min(1, entry.count / Math.max(1, scanned))
	}));

  return {
	source: 'setlist.fm',
	ok: true,
	scannedSetlists: scanned,
	sampledSetlists,
	data
  };
}

async function fetchBandsintownJson(url) {
  const response = await fetch(url, {
	method: 'GET',
	headers: {
	  Accept: 'application/json',
	  'User-Agent': 'KylesAdventurePlanner/1.0 (+https://kylesadventureplanner)'
	}
  });

  if (!response.ok) {
	const text = await response.text().catch(() => '');
	throw new Error(`Bandsintown request failed (${response.status})${text ? `: ${text.slice(0, 160)}` : ''}`);
  }

  const payload = await response.json().catch(() => ([]));
  return Array.isArray(payload) ? payload : [];
}

function normalizeEventEntry(entry, fallbackBandName, sourceKey) {
  const safe = entry && typeof entry === 'object' ? entry : {};
  const sourceUrl = String(safe.sourceUrl || safe.url || '').trim();
  return {
	bandName: String(safe.bandName || fallbackBandName || '').trim(),
	concertDate: String(safe.concertDate || '').trim(),
	venue: String(safe.venue || '').trim(),
	city: String(safe.city || '').trim(),
	state: String(safe.state || '').trim(),
	country: String(safe.country || '').trim(),
	distanceMiles: Number.isFinite(Number(safe.distanceMiles)) ? Number(safe.distanceMiles) : null,
	source: sourceKey,
	sourceUrl,
	sources: [sourceKey],
	sourceUrls: sourceUrl ? [sourceUrl] : []
  };
}

function mergeAndDedupeResults(rows, limit) {
  const byKey = new Map();
  (Array.isArray(rows) ? rows : []).forEach((row) => {
	const normalized = normalizeEventEntry(row, row && row.bandName, String(row && row.source ? row.source : '').trim() || 'unknown');
	const key = [
	  normalizeKey(normalized.bandName),
	  normalizeKey(normalized.concertDate),
	  normalizeKey(normalized.venue),
	  normalizeKey(normalized.city)
	].join('::');
	if (!key || key === '::::') return;
	if (!byKey.has(key)) {
	  byKey.set(key, normalized);
	  return;
	}
	const existing = byKey.get(key);
	existing.sources = Array.from(new Set([].concat(existing.sources || [], normalized.sources || []).filter(Boolean)));
	existing.sourceUrls = Array.from(new Set([].concat(existing.sourceUrls || [], normalized.sourceUrls || []).filter(Boolean)));
	if (existing.distanceMiles == null && normalized.distanceMiles != null) {
	  existing.distanceMiles = normalized.distanceMiles;
	} else if (existing.distanceMiles != null && normalized.distanceMiles != null) {
	  existing.distanceMiles = Math.min(existing.distanceMiles, normalized.distanceMiles);
	}
	if (!existing.sourceUrl && existing.sourceUrls.length) existing.sourceUrl = existing.sourceUrls[0];
	if (!existing.source && existing.sources.length) existing.source = existing.sources[0];
  });

  return Array.from(byKey.values())
	.sort((a, b) => {
	  const dateCmp = String(b.concertDate || '').localeCompare(String(a.concertDate || ''));
	  if (dateCmp !== 0) return dateCmp;
	  const left = Number.isFinite(a.distanceMiles) ? a.distanceMiles : Number.MAX_SAFE_INTEGER;
	  const right = Number.isFinite(b.distanceMiles) ? b.distanceMiles : Number.MAX_SAFE_INTEGER;
	  return left - right;
	})
	.slice(0, Math.max(1, Number(limit) || DEFAULT_RESULT_LIMIT))
	.map((row) => {
	  const sources = Array.isArray(row.sources) ? row.sources : [];
	  const sourceUrls = Array.isArray(row.sourceUrls) ? row.sourceUrls : [];
	  return Object.assign({}, row, {
		sources,
		sourceUrls,
		source: row.source || (sources[0] || ''),
		sourceUrl: row.sourceUrl || (sourceUrls[0] || '')
	  });
	});
}

async function fetchSetlistEvents(params, apiKey) {
  if (!apiKey) {
	return {
	  source: 'setlist.fm',
	  ok: false,
	  message: 'SETLISTFM_API_KEY missing',
	  data: []
	};
  }
  const encodedBand = encodeURIComponent(params.band);
  const results = [];

  for (let page = 1; page <= DEFAULT_PAGE_LIMIT; page += 1) {
	const url = `${SETLIST_API_BASE}/search/setlists?artistName=${encodedBand}&p=${page}`;
	const payload = await fetchSetlistJson(url, apiKey);
	const setlists = Array.isArray(payload.setlist) ? payload.setlist : [];
	if (!setlists.length) break;

	for (const setlist of setlists) {
	  const isoDate = parseEventDate(setlist && setlist.eventDate);
	  if (!isoDate) continue;
	  const year = Number(isoDate.slice(0, 4));
	  if (!Number.isFinite(year) || year < params.fromYear || year > params.toYear) continue;

	  const coords = setlist && setlist.venue && setlist.venue.city && setlist.venue.city.coords
		? setlist.venue.city.coords
		: null;
	  const venueLat = parseCoordinate(coords && coords.lat);
	  const venueLng = parseCoordinate(coords && coords.long);
	  if (!Number.isFinite(venueLat) || !Number.isFinite(venueLng)) continue;

	  const distanceMiles = haversineMiles(params.latitude, params.longitude, venueLat, venueLng);
	  if (!Number.isFinite(distanceMiles) || distanceMiles > params.radiusMiles) continue;

	  results.push(normalizeEventEntry({
		bandName: String((setlist.artist && setlist.artist.name) || params.band).trim(),
		concertDate: isoDate,
		venue: String((setlist.venue && setlist.venue.name) || '').trim(),
		city: String((setlist.venue && setlist.venue.city && setlist.venue.city.name) || '').trim(),
		state: String((setlist.venue && setlist.venue.city && setlist.venue.city.state) || '').trim(),
		country: String((setlist.venue && setlist.venue.city && setlist.venue.city.country && setlist.venue.city.country.name) || '').trim(),
		distanceMiles: Number(distanceMiles.toFixed(2)),
		sourceUrl: String(setlist.url || '').trim()
	  }, params.band, 'setlist.fm'));

	  if (results.length >= DEFAULT_RESULT_LIMIT) break;
	}

	if (results.length >= DEFAULT_RESULT_LIMIT) break;
  }

  return {
	source: 'setlist.fm',
	ok: true,
	data: results
  };
}

async function fetchBandsintownEvents(params, appId) {
  const encodedBand = encodeURIComponent(params.band);
  const encodedApp = encodeURIComponent(appId || DEFAULT_BANDSINTOWN_APP_ID);
  const url = `${BANDSINTOWN_API_BASE}/artists/${encodedBand}/events?app_id=${encodedApp}&date=all`;
  const payload = await fetchBandsintownJson(url);

  const results = payload.map((event) => {
	const isoDate = String((event && event.datetime) || '').slice(0, 10);
	const venue = event && event.venue ? event.venue : {};
	const lat = parseCoordinate(venue.latitude);
	const lng = parseCoordinate(venue.longitude);
	let distanceMiles = null;
	if (Number.isFinite(lat) && Number.isFinite(lng)) {
	  distanceMiles = haversineMiles(params.latitude, params.longitude, lat, lng);
	}
	const roundedDistance = typeof distanceMiles === 'number' && Number.isFinite(distanceMiles)
	  ? Number(distanceMiles.toFixed(2))
	  : null;
	return normalizeEventEntry({
	  bandName: String((event && event.artist && event.artist.name) || params.band).trim(),
	  concertDate: isoDate,
	  venue: String(venue.name || '').trim(),
	  city: String(venue.city || '').trim(),
	  state: String(venue.region || '').trim(),
	  country: String(venue.country || '').trim(),
	  distanceMiles: roundedDistance,
	  sourceUrl: String((event && event.url) || '').trim()
	}, params.band, 'bandsintown');
  }).filter((event) => {
	const year = Number(String(event.concertDate || '').slice(0, 4));
	if (!Number.isFinite(year) || year < params.fromYear || year > params.toYear) return false;
	if (!Number.isFinite(event.distanceMiles) || event.distanceMiles > params.radiusMiles) return false;
	return true;
  }).slice(0, DEFAULT_RESULT_LIMIT);

  return {
	source: 'bandsintown',
	ok: true,
	data: results
  };
}

module.exports = async function historicShowsProxy(context, req) {
  const safeReq = req || (context && context.req) || { method: 'GET', query: {} };
  const method = String(safeReq.method || 'GET').toUpperCase();
  if (method === 'OPTIONS') {
	context.res = json(204, '');
	return;
  }

  const setlistApiKey = String(process.env.SETLISTFM_API_KEY || '').trim();
  const bandsintownAppId = String(process.env.BANDSINTOWN_APP_ID || DEFAULT_BANDSINTOWN_APP_ID).trim();

  const band = readParam(safeReq, 'band');
  const mode = normalizeKey(readParam(safeReq, 'mode'));
  const fromYear = clamp(toNumber(readParam(safeReq, 'fromYear'), DEFAULT_FROM_YEAR), 1960, 2100);
  const toYear = clamp(toNumber(readParam(safeReq, 'toYear'), new Date().getFullYear()), fromYear, 2100);
  const radiusMiles = clamp(toNumber(readParam(safeReq, 'radiusMiles'), 50), 1, 500);
  const latitude = toNumber(readParam(safeReq, 'latitude'), NaN);
  const longitude = toNumber(readParam(safeReq, 'longitude'), NaN);
  const locationLabel = readParam(safeReq, 'locationLabel');

  if (!band) {
	context.res = json(400, { ok: false, error: 'missing_band', message: 'Band query parameter is required.' });
	return;
  }

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
	context.res = json(400, { ok: false, error: 'invalid_origin', message: 'latitude and longitude query parameters are required.' });
	return;
  }

  try {
	const params = {
	  band,
	  fromYear,
	  toYear,
	  radiusMiles,
	  latitude,
	  longitude
	};

	if (mode === 'song-stats' || mode === 'songstats') {
	  const songStats = await fetchSetlistSongStats(params, setlistApiKey);
	  if (!songStats.ok) {
		context.res = json(503, {
		  ok: false,
		  error: 'song_stats_unavailable',
		  message: songStats.message || 'Song statistics are unavailable.',
		  sourceWarnings: [songStats.message || 'setlist.fm unavailable']
		});
		return;
	  }
	  context.res = json(200, {
		ok: true,
		mode: 'song-stats',
		source: 'setlist.fm',
		band,
		fromYear,
		toYear,
		scannedSetlists: songStats.scannedSetlists || 0,
		sampledSetlists: songStats.sampledSetlists || [],
		data: songStats.data || []
	  });
	  return;
	}

	const sourceWarnings = [];
	const mergedRows = [];
	const succeededSources = [];

	const adapterRuns = [
	  fetchSetlistEvents(params, setlistApiKey),
	  fetchBandsintownEvents(params, bandsintownAppId)
	];

	for (const run of adapterRuns) {
	  try {
		const result = await run;
		if (result && result.ok) {
		  succeededSources.push(result.source);
		  mergedRows.push.apply(mergedRows, Array.isArray(result.data) ? result.data : []);
		} else if (result && result.source) {
		  sourceWarnings.push(result.source + ': ' + String(result.message || 'disabled'));
		}
	  } catch (error) {
		const message = error && error.message ? String(error.message) : 'adapter failed';
		sourceWarnings.push(message);
	  }
	}

	if (!succeededSources.length) {
	  context.res = json(503, {
		ok: false,
		error: 'historic_sources_unavailable',
		message: 'Historic concert search sources are unavailable. Configure SETLISTFM_API_KEY and retry.',
		sourceWarnings
	  });
	  return;
	}

	const results = mergeAndDedupeResults(mergedRows, DEFAULT_RESULT_LIMIT);

	context.res = json(200, {
	  ok: true,
	  band,
	  fromYear,
	  toYear,
	  radiusMiles,
	  locationLabel,
	  source: results.length > 0 ? (results[0].sources.length > 1 ? 'multi' : results[0].source) : (succeededSources[0] || ''),
	  sourcesQueried: ['setlist.fm', 'bandsintown'],
	  sourcesSucceeded: succeededSources,
	  sourceWarnings,
	  data: results
	});
  } catch (error) {
	context.log.error('historicShowsProxy failed', error);
	context.res = json(502, {
	  ok: false,
	  error: 'historic_search_failed',
	  message: error && error.message ? String(error.message) : 'Historic search failed.'
	});
  }
};

