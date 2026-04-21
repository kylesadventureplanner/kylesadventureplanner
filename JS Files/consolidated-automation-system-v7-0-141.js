/**
 * CONSOLIDATED AUTOMATION FEATURES SYSTEM v7.0.141
 * =================================================
 * Stable automation runtime for edit mode actions.
 */

console.log('🤖 Consolidated Automation Features System v7.0.141 Loading...');

(function() {
  function getMainWindow() {
    return window.opener && !window.opener.closed ? window.opener : window;
  }

  function safeString(value) {
    return String(value == null ? '' : value).trim();
  }

  function buildStrictWrapperMessage(label, code) {
    const safeLabel = safeString(label || 'unknown-wrapper') || 'unknown-wrapper';
    const safeCode = safeString(code || 'UNKNOWN') || 'UNKNOWN';
    return `[STRICT_WRAPPER:${safeCode}] ${safeLabel}`;
  }

  function looksLikePlaceId(value) {
    return /^ChI[A-Za-z0-9_-]{6,}$/.test(safeString(value));
  }

  function getActiveEditTarget(mainWindow) {
    const source = mainWindow || getMainWindow();
    const inlineTarget = source && source.__editModeTarget && typeof source.__editModeTarget === 'object'
      ? source.__editModeTarget
      : null;
    const popupTarget = window.__editModeTarget && typeof window.__editModeTarget === 'object'
      ? window.__editModeTarget
      : null;
    const target = inlineTarget || popupTarget;
    if (target) return target;
    return {
      id: '',
      filePath: safeString((source && source.filePath) || window.filePath),
      tableName: safeString((source && source.tableName) || window.tableName)
    };
  }

  function isFestivalTarget(target) {
    const safeTarget = target && typeof target === 'object' ? target : {};
    const targetId = safeString(safeTarget.id).toLowerCase();
    const filePath = safeString(safeTarget.filePath).toLowerCase();
    const tableName = safeString(safeTarget.tableName).toLowerCase();
    return targetId === 'ent_festivals'
      || (filePath === 'entertainment_locations.xlsx' && tableName === 'festivals')
      || tableName === 'festivals';
  }

  function sanitizeFestivalName(value) {
    const text = safeString(value)
      .replace(/https?:\/\/\S+/gi, ' ')
      .replace(/\bChI[A-Za-z0-9_-]{6,}\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return text;
  }

  function toTitleCaseWords(value) {
    return safeString(value)
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => {
        if (part.length <= 2) return part.toUpperCase();
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
      })
      .join(' ')
      .trim();
  }

  function buildFestivalNameFromUrl(rawUrl) {
    const parsed = parseUrlSafely(rawUrl);
    if (!parsed) return '';
    const host = safeString(parsed.hostname).replace(/^www\./i, '');
    const hostBase = host.split('.')[0] || host;
    const pathPieces = parsed.pathname
      .split('/')
      .map((part) => safeDecode(part))
      .map((part) => safeString(part))
      .filter((part) => /[a-z]/i.test(part));
    const preferredPath = pathPieces.find((part) => !/^(events?|festival|festivals|home|index)$/i.test(part)) || '';
    const seed = preferredPath || hostBase;
    const normalized = seed
      .replace(/%20/gi, ' ')
      .replace(/[._+\-]+/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/(festival|fest|fair|events?|celebration|carnival)/ig, ' $1 ')
      .replace(/\s+/g, ' ')
      .trim();
    return toTitleCaseWords(normalized || 'Festival Event') || 'Festival Event';
  }

  function buildDirectFestivalUrlCandidate(rawUrl) {
    const normalizedUrl = normalizeUrlCandidate(rawUrl);
    if (!normalizedUrl) return null;
    return normalizeFestivalEventResult({
      placeId: '',
      name: buildFestivalNameFromUrl(normalizedUrl),
      website: normalizedUrl,
      openLinkUrl: normalizedUrl,
      openLinkLabel: 'Open Festival Website',
      sourceProvider: 'Official Festival URL',
      description: 'Source: Official Festival URL',
      businessStatus: 'SCHEDULED',
      businessType: 'Festival Event'
    }, 'Official Festival URL');
  }

  function normalizeCoordinates(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const lat = Number(source.lat);
    const lng = Number(source.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }

  function stripTags(value) {
    return safeString(value).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function formatFestivalEventDate(value) {
    const text = safeString(value);
    if (!text) return '';
    const parsed = new Date(text);
    if (Number.isNaN(parsed.getTime())) return text;
    return parsed.toISOString().slice(0, 10);
  }

  function buildFestivalAddress(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const directAddress = safeString(source.address || source.venueAddress || source.location || source.formattedAddress);
    if (directAddress) return directAddress;
    const venueName = safeString(source.venueName || source.venue || source.placeName);
    const city = safeString(source.city);
    const state = safeString(source.state);
    const postalCode = safeString(source.postalCode || source.zip);
    const parts = [venueName, city, state, postalCode].filter(Boolean);
    return parts.join(', ');
  }

  function buildFestivalDescription(raw, providerName) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const explicit = stripTags(source.description || source.summary || source.shortDescription);
    const eventDate = formatFestivalEventDate(source.eventDate || source.startDate || source.date);
    const provider = safeString(source.sourceProvider || source.provider || providerName);
    const detailBits = [];
    if (provider) detailBits.push(`Source: ${provider}`);
    if (eventDate) detailBits.push(`Date: ${eventDate}`);
    if (explicit) detailBits.push(explicit);
    return detailBits.join(' • ');
  }

  function normalizeFestivalEventResult(item, providerName = 'Festival Provider') {
    const raw = item && typeof item === 'object' ? item : {};
    const placeId = safeString(raw.placeId);
    const name = sanitizeFestivalName(raw.name || raw.title || raw.eventName || raw.displayName || raw.query || 'Untitled Festival');
    const address = buildFestivalAddress(raw);
    const city = safeString(raw.city);
    const state = safeString(raw.state).toUpperCase();
    const website = safeString(raw.website || raw.officialWebsite || raw.url || raw.eventUrl || raw.sourceUrl || raw.openLinkUrl);
    const provider = safeString(raw.sourceProvider || raw.provider || providerName || 'Festival Provider');
    const description = buildFestivalDescription(raw, provider);
    const openLinkUrl = safeString(raw.openLinkUrl || raw.googlePlaceUrl || raw.googleUrl || website);
    const openLinkLabel = safeString(raw.openLinkLabel || (openLinkUrl ? 'Open Event Source' : ''));
    return {
      placeId,
      name,
      address,
      city,
      state,
      phone: safeString(raw.phone || raw.contactPhone),
      website,
      rating: raw.rating ?? '',
      userRatingsTotal: raw.userRatingsTotal ?? raw.reviewCount ?? 0,
      reviewCount: raw.reviewCount ?? raw.userRatingsTotal ?? 0,
      hours: raw.hours || '',
      businessStatus: safeString(raw.businessStatus || 'EVENT'),
      businessType: safeString(raw.businessType || 'Festival Event'),
      description,
      eventDate: formatFestivalEventDate(raw.eventDate || raw.startDate || raw.date),
      sourceProvider: provider,
      sourceType: 'festival-event',
      coordinates: normalizeCoordinates(raw.coordinates || raw.locationCoordinates),
      googlePlaceUrl: safeString(raw.googlePlaceUrl || raw.googleUrl),
      openLinkUrl,
      openLinkLabel,
      directions: safeString(raw.directions),
      types: Array.isArray(raw.types) ? raw.types : []
    };
  }

  function getFestivalProviderHost(sourceWindow = getMainWindow()) {
    return sourceWindow && typeof sourceWindow === 'object' ? sourceWindow : window;
  }

  function getFestivalProviderRegistry(sourceWindow = getFestivalProviderHost()) {
    const host = getFestivalProviderHost(sourceWindow);
    if (!host.__festivalEventProviders || typeof host.__festivalEventProviders !== 'object') {
      host.__festivalEventProviders = {};
    }
    return host.__festivalEventProviders;
  }

  function registerFestivalEventProvider(name, provider, sourceWindow = getFestivalProviderHost()) {
    const safeName = safeString(name).toLowerCase();
    if (!safeName) throw new Error('Festival provider name is required.');
    const registry = getFestivalProviderRegistry(sourceWindow);
    registry[safeName] = provider;
    return registry[safeName];
  }

  function parseFeedSourceEntries(raw) {
    const text = String(raw == null ? '' : raw);
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split('|');
        if (parts.length >= 2) {
          return { label: safeString(parts[0]), url: safeString(parts.slice(1).join('|')) };
        }
        return { label: '', url: safeString(line) };
      })
      .filter((entry) => /^https?:\/\//i.test(entry.url));
  }

  function getFestivalSourceConfig(sourceWindow = getFestivalProviderHost()) {
    const host = getFestivalProviderHost(sourceWindow);
    const raw = host.__festivalSourceConfig && typeof host.__festivalSourceConfig === 'object'
      ? host.__festivalSourceConfig
      : (window.__festivalSourceConfig && typeof window.__festivalSourceConfig === 'object' ? window.__festivalSourceConfig : {});
    const providers = raw.providers && typeof raw.providers === 'object' ? raw.providers : {};
    const providerPriority = raw.providerPriority && typeof raw.providerPriority === 'object' ? raw.providerPriority : {};
    const providerWeight = raw.providerWeight && typeof raw.providerWeight === 'object' ? raw.providerWeight : {};
    const rawOrder = Array.isArray(raw.providerOrder) ? raw.providerOrder : [];
    const mappedOrder = rawOrder
      .map((item) => normalizeFestivalProviderKey(item))
      .filter(Boolean);
    const legacyOrder = Object.keys({
      ticketmaster: Number(providerPriority.ticketmaster || 2),
      eventbrite: Number(providerPriority.eventbrite || 4),
      official_calendars: Number(providerPriority.officialCalendars || 1),
      chamber_feeds: Number(providerPriority.chamberFeeds || 3)
    }).sort((a, b) => {
      const rankMap = {
        ticketmaster: Number(providerPriority.ticketmaster || 2),
        eventbrite: Number(providerPriority.eventbrite || 4),
        official_calendars: Number(providerPriority.officialCalendars || 1),
        chamber_feeds: Number(providerPriority.chamberFeeds || 3)
      };
      return Number(rankMap[a] || 99) - Number(rankMap[b] || 99);
    });
    const providerOrder = mappedOrder.length
      ? Array.from(new Set(mappedOrder.concat(['official_calendars', 'ticketmaster', 'chamber_feeds', 'eventbrite'])))
      : legacyOrder;
    const maxResultsPerSource = Number(raw.maxResultsPerSource);
    return {
      providers: {
        ticketmaster: providers.ticketmaster !== false,
        eventbrite: Boolean(providers.eventbrite),
        officialCalendars: providers.officialCalendars !== false,
        chamberFeeds: providers.chamberFeeds !== false
      },
      ticketmasterApiKey: safeString(raw.ticketmasterApiKey),
      eventbriteApiToken: safeString(raw.eventbriteApiToken),
      officialCalendars: parseFeedSourceEntries(raw.officialCalendarsFeeds),
      chamberFeeds: parseFeedSourceEntries(raw.chamberFeeds),
      providerOrder,
      providerWeight: {
        ticketmaster: Number.isFinite(Number(providerWeight.ticketmaster)) ? Number(providerWeight.ticketmaster) : 1.3,
        eventbrite: Number.isFinite(Number(providerWeight.eventbrite)) ? Number(providerWeight.eventbrite) : 1.1,
        officialCalendars: Number.isFinite(Number(providerWeight.officialCalendars)) ? Number(providerWeight.officialCalendars) : 1.5,
        chamberFeeds: Number.isFinite(Number(providerWeight.chamberFeeds)) ? Number(providerWeight.chamberFeeds) : 1
      },
      maxResultsPerSource: Number.isFinite(maxResultsPerSource) && maxResultsPerSource > 0 ? maxResultsPerSource : 8,
      requestTimeoutMs: 7000
    };
  }

  function normalizeFestivalProviderKey(key) {
    const raw = safeString(key).toLowerCase();
    const map = {
      ticketmaster: 'ticketmaster',
      eventbrite: 'eventbrite',
      official: 'official_calendars',
      officialcalendars: 'official_calendars',
      official_calendars: 'official_calendars',
      feeds: 'official_calendars',
      chamber: 'chamber_feeds',
      chamberfeeds: 'chamber_feeds',
      chamber_feeds: 'chamber_feeds',
      festivalnet: 'chamber_feeds'
    };
    return map[raw] || raw;
  }

  function getFestivalProviderPriority(providerKey, config) {
    const safeConfig = config && typeof config === 'object' ? config : getFestivalSourceConfig();
    const order = Array.isArray(safeConfig.providerOrder) ? safeConfig.providerOrder.map((item) => normalizeFestivalProviderKey(item)) : [];
    const idx = order.indexOf(normalizeFestivalProviderKey(providerKey));
    return idx >= 0 ? idx + 1 : 99;
  }

  function getFestivalProviderWeight(providerKey, config) {
    const safeConfig = config && typeof config === 'object' ? config : getFestivalSourceConfig();
    const weights = safeConfig.providerWeight || {};
    if (providerKey === 'ticketmaster') return Number(weights.ticketmaster || 1.3);
    if (providerKey === 'eventbrite') return Number(weights.eventbrite || 1.1);
    if (providerKey === 'official_calendars') return Number(weights.officialCalendars || 1.5);
    if (providerKey === 'chamber_feeds') return Number(weights.chamberFeeds || 1);
    return 1;
  }

  function updateFestivalProviderHealth(sourceWindow, providerKey, update) {
    const host = getFestivalProviderHost(sourceWindow);
    if (!host.__festivalProviderHealth || typeof host.__festivalProviderHealth !== 'object') {
      host.__festivalProviderHealth = {};
    }
    if (!window.__festivalProviderHealth || typeof window.__festivalProviderHealth !== 'object') {
      window.__festivalProviderHealth = host.__festivalProviderHealth;
    }
    const key = normalizeFestivalProviderKey(providerKey);
    const nowIso = new Date().toISOString();
    const prev = host.__festivalProviderHealth[key] && typeof host.__festivalProviderHealth[key] === 'object'
      ? host.__festivalProviderHealth[key]
      : { key, firstSeenAt: nowIso, consecutiveFailures: 0 };
    const next = {
      ...prev,
      key,
      lastRunAt: nowIso,
      lastDurationMs: Number(update && update.durationMs ? update.durationMs : 0),
      lastReturnedCount: Number(update && update.returnedCount ? update.returnedCount : 0),
      lastStatus: update && update.status ? String(update.status) : 'unknown',
      lastErrorMessage: update && update.error ? String(update.error) : ''
    };
    if (next.lastStatus === 'ok') {
      next.lastSuccessAt = nowIso;
      next.consecutiveFailures = 0;
    }
    if (next.lastStatus === 'error') {
      next.lastErrorAt = nowIso;
      next.consecutiveFailures = Number(prev.consecutiveFailures || 0) + 1;
    }
    host.__festivalProviderHealth[key] = next;
    window.__festivalProviderHealth = host.__festivalProviderHealth;
    return next;
  }

  function encodeQuery(params) {
    return Object.keys(params)
      .filter((key) => params[key] != null && String(params[key]).trim() !== '')
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(String(params[key]))}`)
      .join('&');
  }

  async function fetchWithTimeout(url, options = {}, timeoutMs = 7000) {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    try {
      return await fetch(url, {
        ...options,
        signal: controller ? controller.signal : options.signal
      });
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  async function fetchJsonWithTimeout(url, options = {}, timeoutMs = 7000) {
    const response = await fetchWithTimeout(url, options, timeoutMs);
    if (!response.ok) {
      const details = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status} for ${url}${details ? `: ${details.slice(0, 180)}` : ''}`);
    }
    return response.json();
  }

  async function fetchTextWithTimeout(url, options = {}, timeoutMs = 7000) {
    const response = await fetchWithTimeout(url, options, timeoutMs);
    if (!response.ok) {
      const details = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status} for ${url}${details ? `: ${details.slice(0, 180)}` : ''}`);
    }
    return response.text();
  }

  function parseIsoDate(value) {
    const text = safeString(value);
    if (!text) return '';
    const parsed = new Date(text);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toISOString();
  }

  function normalizeVenueAddressFromParts(parts = {}) {
    const lines = [];
    if (safeString(parts.address1)) lines.push(safeString(parts.address1));
    const cityStateZip = [safeString(parts.city && parts.city.name), safeString(parts.state && parts.state.stateCode), safeString(parts.postalCode)].filter(Boolean).join(' ');
    if (cityStateZip) lines.push(cityStateZip);
    return lines.join(', ');
  }

  function scoreFestivalResult(result, query) {
    const text = `${safeString(result.name)} ${safeString(result.description)}`.toLowerCase();
    const queryTokens = safeString(query).toLowerCase().split(/\s+/).filter((token) => token.length >= 3);
    if (!queryTokens.length) return 0;
    return queryTokens.reduce((score, token) => score + (text.includes(token) ? 1 : 0), 0);
  }

  async function searchTicketmasterEvents(query, options = {}, sourceWindow = getFestivalProviderHost()) {
    const config = getFestivalSourceConfig(sourceWindow);
    const injected = sourceWindow.__ticketmasterFestivalEventSearch || window.__ticketmasterFestivalEventSearch;
    if (typeof injected === 'function') {
      const rows = await injected(query, options);
      return Array.isArray(rows) ? rows.map((item) => normalizeFestivalEventResult(item, 'Ticketmaster')) : [];
    }
    if (!config.providers.ticketmaster || !config.ticketmasterApiKey) return [];

    const params = {
      apikey: config.ticketmasterApiKey,
      keyword: query,
      size: Math.max(1, Math.min(50, config.maxResultsPerSource * 2)),
      sort: 'date,asc',
      classificationName: 'festival',
      countryCode: 'US'
    };
    const state = safeString(options && options.state).toUpperCase();
    if (state) params.stateCode = state;
    const radius = Number(options && options.radiusMiles);
    const anchor = options && options.anchorCoords && typeof options.anchorCoords === 'object' ? options.anchorCoords : null;
    if (Number.isFinite(radius) && radius > 0 && anchor && Number.isFinite(Number(anchor.lat)) && Number.isFinite(Number(anchor.lng))) {
      params.radius = Math.max(1, Math.min(300, Math.round(radius)));
      params.unit = 'miles';
      params.latlong = `${Number(anchor.lat)},${Number(anchor.lng)}`;
    }

    const url = `https://app.ticketmaster.com/discovery/v2/events.json?${encodeQuery(params)}`;
    const payload = await fetchJsonWithTimeout(url, { method: 'GET' }, config.requestTimeoutMs);
    const events = Array.isArray(payload?._embedded?.events) ? payload._embedded.events : [];
    return events.map((event) => {
      const venue = Array.isArray(event?._embedded?.venues) ? event._embedded.venues[0] : {};
      const address = normalizeVenueAddressFromParts(venue?.address ? { ...venue, address1: venue.address.line1 } : {
        address1: safeString(venue?.address?.line1),
        city: venue?.city,
        state: venue?.state,
        postalCode: venue?.postalCode
      });
      return normalizeFestivalEventResult({
        placeId: '',
        name: safeString(event?.name),
        address,
        city: safeString(venue?.city?.name),
        state: safeString(venue?.state?.stateCode),
        website: safeString(event?.url),
        eventDate: safeString(event?.dates?.start?.localDate || event?.dates?.start?.dateTime),
        description: safeString(event?.info || event?.pleaseNote),
        sourceProvider: 'Ticketmaster',
        openLinkUrl: safeString(event?.url),
        openLinkLabel: 'Open Event Source',
        coordinates: {
          lat: Number(venue?.location?.latitude),
          lng: Number(venue?.location?.longitude)
        },
        businessStatus: safeString(event?.dates?.status?.code || 'SCHEDULED')
      }, 'Ticketmaster');
    });
  }

  async function searchEventbriteEvents(query, options = {}, sourceWindow = getFestivalProviderHost()) {
    const config = getFestivalSourceConfig(sourceWindow);
    const injected = sourceWindow.__eventbriteFestivalEventSearch || window.__eventbriteFestivalEventSearch;
    if (typeof injected === 'function') {
      const rows = await injected(query, options);
      return Array.isArray(rows) ? rows.map((item) => normalizeFestivalEventResult(item, 'Eventbrite')) : [];
    }
    if (!config.providers.eventbrite || !config.eventbriteApiToken) return [];

    const params = {
      q: query,
      expand: 'venue',
      sort_by: 'date'
    };
    const state = safeString(options && options.state).toUpperCase();
    if (state) params['location.address'] = state;
    const radius = Number(options && options.radiusMiles);
    if (Number.isFinite(radius) && radius > 0) {
      params['location.within'] = `${Math.max(1, Math.min(300, Math.round(radius)))}mi`;
    }

    const url = `https://www.eventbriteapi.com/v3/events/search/?${encodeQuery(params)}`;
    const payload = await fetchJsonWithTimeout(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.eventbriteApiToken}`,
        'Content-Type': 'application/json'
      }
    }, config.requestTimeoutMs);

    const events = Array.isArray(payload?.events) ? payload.events : [];
    return events.map((event) => {
      const venue = event?.venue && typeof event.venue === 'object' ? event.venue : {};
      const address = venue?.address && typeof venue.address === 'object'
        ? [safeString(venue.address.address_1), safeString(venue.address.city), safeString(venue.address.region), safeString(venue.address.postal_code)].filter(Boolean).join(', ')
        : '';
      return normalizeFestivalEventResult({
        placeId: '',
        name: safeString(event?.name?.text),
        address,
        city: safeString(venue?.address?.city),
        state: safeString(venue?.address?.region),
        website: safeString(event?.url),
        eventDate: safeString(event?.start?.utc || event?.start?.local),
        description: safeString(event?.summary || event?.description?.text),
        sourceProvider: 'Eventbrite',
        openLinkUrl: safeString(event?.url),
        openLinkLabel: 'Open Event Source',
        coordinates: {
          lat: Number(venue?.latitude),
          lng: Number(venue?.longitude)
        },
        businessStatus: safeString(event?.status || 'SCHEDULED')
      }, 'Eventbrite');
    });
  }

  function parseIcalEvents(text, sourceLabel, sourceUrl) {
    const safeText = String(text || '');
    const blocks = safeText.split('BEGIN:VEVENT').slice(1);
    return blocks.map((block) => {
      const summary = (block.match(/\nSUMMARY:?(.+)/i) || [])[1] || '';
      const description = (block.match(/\nDESCRIPTION:?(.+)/i) || [])[1] || '';
      const location = (block.match(/\nLOCATION:?(.+)/i) || [])[1] || '';
      const dtStart = (block.match(/\nDTSTART(?:;[^:]+)?:([^\n]+)/i) || [])[1] || '';
      const eventDate = dtStart ? parseIsoDate(dtStart.replace(/Z$/i, '')) : '';
      return normalizeFestivalEventResult({
        placeId: '',
        name: safeDecode(summary),
        address: safeDecode(location),
        description: safeDecode(description),
        website: sourceUrl,
        eventDate,
        sourceProvider: sourceLabel,
        openLinkUrl: sourceUrl,
        openLinkLabel: 'Open Event Source',
        businessStatus: 'SCHEDULED'
      }, sourceLabel);
    }).filter((row) => row.name);
  }

  function parseXmlEvents(text, sourceLabel, sourceUrl) {
    if (typeof DOMParser === 'undefined') return [];
    const parser = new DOMParser();
    const xml = parser.parseFromString(String(text || ''), 'text/xml');
    const entries = [];
    xml.querySelectorAll('item, entry').forEach((node) => {
      const title = safeString(node.querySelector('title')?.textContent);
      const description = safeString(node.querySelector('description, summary, content')?.textContent);
      const pubDate = safeString(node.querySelector('pubDate, updated, published, dc\\:date')?.textContent);
      const linkNode = node.querySelector('link');
      const link = safeString(linkNode?.getAttribute?.('href') || linkNode?.textContent || sourceUrl);
      const location = safeString(node.querySelector('location, georss\\:featureName')?.textContent);
      entries.push(normalizeFestivalEventResult({
        placeId: '',
        name: title,
        address: location,
        description,
        website: link,
        openLinkUrl: link,
        eventDate: parseIsoDate(pubDate),
        sourceProvider: sourceLabel,
        openLinkLabel: 'Open Event Source',
        businessStatus: 'SCHEDULED'
      }, sourceLabel));
    });
    return entries.filter((row) => row.name);
  }

  function parseJsonEvents(payload, sourceLabel, sourceUrl) {
    const rows = [];
    const list = Array.isArray(payload)
      ? payload
      : (Array.isArray(payload?.events) ? payload.events : (Array.isArray(payload?.items) ? payload.items : []));
    list.forEach((item) => {
      rows.push(normalizeFestivalEventResult({
        placeId: '',
        name: safeString(item?.name || item?.title || item?.eventName),
        address: safeString(item?.address || item?.location),
        city: safeString(item?.city),
        state: safeString(item?.state),
        description: safeString(item?.description || item?.summary),
        website: safeString(item?.url || item?.website || sourceUrl),
        openLinkUrl: safeString(item?.url || item?.website || sourceUrl),
        eventDate: safeString(item?.eventDate || item?.startDate || item?.date),
        sourceProvider: sourceLabel,
        openLinkLabel: 'Open Event Source',
        coordinates: normalizeCoordinates(item?.coordinates),
        businessStatus: safeString(item?.status || 'SCHEDULED')
      }, sourceLabel));
    });
    return rows.filter((row) => row.name);
  }

  function parseHtmlEvents(text, sourceLabel, sourceUrl) {
    if (typeof DOMParser === 'undefined') return [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(String(text || ''), 'text/html');
    const rows = [];
    doc.querySelectorAll('script[type="application/ld+json"]').forEach((scriptEl) => {
      try {
        const parsed = JSON.parse(scriptEl.textContent || 'null');
        const list = Array.isArray(parsed) ? parsed : [parsed];
        list.forEach((item) => {
          const data = item && item['@type'] === 'Event'
            ? item
            : (item && Array.isArray(item['@graph']) ? item['@graph'].find((entry) => entry && entry['@type'] === 'Event') : null);
          if (!data) return;
          rows.push(normalizeFestivalEventResult({
            placeId: '',
            name: safeString(data.name),
            address: safeString(data.location?.address?.streetAddress || data.location?.name),
            city: safeString(data.location?.address?.addressLocality),
            state: safeString(data.location?.address?.addressRegion),
            description: safeString(data.description),
            website: safeString(data.url || sourceUrl),
            openLinkUrl: safeString(data.url || sourceUrl),
            eventDate: safeString(data.startDate),
            sourceProvider: sourceLabel,
            openLinkLabel: 'Open Event Source',
            businessStatus: 'SCHEDULED'
          }, sourceLabel));
        });
      } catch (_error) {
        // Ignore malformed JSON-LD blocks.
      }
    });
    return rows.filter((row) => row.name);
  }

  async function searchFeedSource(query, sourceEntry, sourceLabel, config) {
    const label = safeString(sourceEntry && sourceEntry.label) || sourceLabel;
    const url = safeString(sourceEntry && sourceEntry.url);
    if (!url) return [];
    const text = await fetchTextWithTimeout(url, { method: 'GET' }, config.requestTimeoutMs);
    const trimmed = text.trim();
    let rows = [];
    if (/^BEGIN:VCALENDAR/i.test(trimmed)) {
      rows = parseIcalEvents(trimmed, label, url);
    } else if (/^\s*[\[{]/.test(trimmed)) {
      try {
        rows = parseJsonEvents(JSON.parse(trimmed), label, url);
      } catch (_error) {
        rows = [];
      }
    } else if (/<rss|<feed|<item|<entry/i.test(trimmed)) {
      rows = parseXmlEvents(trimmed, label, url);
    } else {
      rows = parseHtmlEvents(trimmed, label, url);
    }
    const scored = rows
      .map((row) => ({ row, score: scoreFestivalResult(row, query) }))
      .filter((entry) => entry.score > 0 || !safeString(query))
      .sort((a, b) => b.score - a.score)
      .slice(0, config.maxResultsPerSource)
      .map((entry) => entry.row);
    return scored;
  }

  async function searchOfficialCalendarFeeds(query, options = {}, sourceWindow = getFestivalProviderHost()) {
    const config = getFestivalSourceConfig(sourceWindow);
    if (!config.providers.officialCalendars || !config.officialCalendars.length) return [];
    const collected = [];
    for (const source of config.officialCalendars) {
      try {
        const rows = await searchFeedSource(query, source, source.label || 'Official Calendar', config);
        collected.push(...rows);
      } catch (error) {
        console.warn(`⚠️ Official calendar feed failed for ${source.url}:`, error.message);
      }
    }
    return collected;
  }

  async function searchChamberFeeds(query, options = {}, sourceWindow = getFestivalProviderHost()) {
    const config = getFestivalSourceConfig(sourceWindow);
    if (!config.providers.chamberFeeds || !config.chamberFeeds.length) return [];
    const collected = [];
    for (const source of config.chamberFeeds) {
      try {
        const rows = await searchFeedSource(query, source, source.label || 'Chamber Feed', config);
        collected.push(...rows);
      } catch (error) {
        console.warn(`⚠️ Chamber/Festival feed failed for ${source.url}:`, error.message);
      }
    }
    return collected;
  }

  function getBuiltinFestivalProviderDefinitions(host) {
    const source = getFestivalProviderHost(host);
    const config = getFestivalSourceConfig(source);
    return {
      ticketmaster: {
        label: 'Ticketmaster',
        async search(query, options = {}) {
          if (!config.providers.ticketmaster && typeof source.__ticketmasterFestivalEventSearch !== 'function') return [];
          return searchTicketmasterEvents(query, options, source);
        }
      },
      eventbrite: {
        label: 'Eventbrite',
        async search(query, options = {}) {
          if (!config.providers.eventbrite && typeof source.__eventbriteFestivalEventSearch !== 'function') return [];
          return searchEventbriteEvents(query, options, source);
        }
      },
      official_calendars: {
        label: 'Official Calendars',
        async search(query, options = {}) {
          if (!config.providers.officialCalendars) return [];
          return searchOfficialCalendarFeeds(query, options, source);
        }
      },
      chamber_feeds: {
        label: 'FestivalNet / Chamber Feeds',
        async search(query, options = {}) {
          if (!config.providers.chamberFeeds) return [];
          return searchChamberFeeds(query, options, source);
        }
      }
    };
  }

  async function runFestivalProviderSearches(query, options = {}, sourceWindow = getFestivalProviderHost()) {
    const host = getFestivalProviderHost(sourceWindow);
    const registry = getFestivalProviderRegistry(host);
    const builtins = getBuiltinFestivalProviderDefinitions(host);
    const config = getFestivalSourceConfig(host);
    const providerFilter = new Set((Array.isArray(options && options.providerFilter) ? options.providerFilter : []).map((key) => normalizeFestivalProviderKey(key)));
    const providerEntries = [];

    Object.keys(builtins).forEach((key) => providerEntries.push([key, builtins[key]]));
    Object.keys(registry).forEach((key) => {
      if (builtins[key]) return;
      providerEntries.push([key, registry[key]]);
    });

    providerEntries.sort((a, b) => {
      const pa = getFestivalProviderPriority(normalizeFestivalProviderKey(a[0]), config);
      const pb = getFestivalProviderPriority(normalizeFestivalProviderKey(b[0]), config);
      if (pa !== pb) return pa - pb;
      return String(a[0]).localeCompare(String(b[0]));
    });

    const unique = new Map();
    const diagnostics = {
      query: String(query || ''),
      ranAt: new Date().toISOString(),
      providers: []
    };
    for (const [providerKey, provider] of providerEntries) {
      const normalizedProviderKey = normalizeFestivalProviderKey(providerKey);
      if (providerFilter.size > 0 && !providerFilter.has(normalizedProviderKey)) continue;
      const runner = typeof provider === 'function'
        ? provider
        : (provider && typeof provider.search === 'function' ? provider.search.bind(provider) : null);
      if (typeof runner !== 'function') continue;
      const startedAt = Date.now();
      try {
        const rawResults = await runner(query, options);
        const rows = Array.isArray(rawResults) ? rawResults : [];
        const durationMs = Date.now() - startedAt;
        const providerWeight = Math.max(0, Number(getFestivalProviderWeight(normalizedProviderKey, config) || 1));
        const providerPriority = getFestivalProviderPriority(normalizedProviderKey, config);
        rows.forEach((item) => {
          const normalized = normalizeFestivalEventResult(item, provider && provider.label ? provider.label : providerKey);
          const dedupeKey = [normalized.name.toLowerCase(), normalized.address.toLowerCase(), normalized.eventDate.toLowerCase(), normalized.website.toLowerCase()].join('|');
          if (!normalized.name) return;
          const relevance = scoreFestivalResult(normalized, query);
          const score = (relevance + 1) * providerWeight + Math.max(0, (10 - providerPriority)) * 0.01;
          const current = unique.get(dedupeKey);
          if (!current || score > current.score) {
            unique.set(dedupeKey, { row: normalized, score, providerKey: normalizedProviderKey });
          }
        });
        diagnostics.providers.push({
          key: normalizedProviderKey,
          label: provider && provider.label ? provider.label : normalizedProviderKey,
          returnedCount: rows.length,
          durationMs,
          error: ''
        });
        updateFestivalProviderHealth(host, normalizedProviderKey, {
          status: 'ok',
          returnedCount: rows.length,
          durationMs,
          error: ''
        });
      } catch (error) {
        const durationMs = Date.now() - startedAt;
        console.warn(`⚠️ Festival provider "${providerKey}" search failed:`, error.message);
        diagnostics.providers.push({
          key: normalizedProviderKey,
          label: provider && provider.label ? provider.label : normalizedProviderKey,
          returnedCount: 0,
          durationMs,
          error: String(error && error.message ? error.message : error)
        });
        updateFestivalProviderHealth(host, normalizedProviderKey, {
          status: 'error',
          returnedCount: 0,
          durationMs,
          error: String(error && error.message ? error.message : error)
        });
      }
    }
    const mergedRows = Array.from(unique.values())
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.row);
    diagnostics.totalResults = mergedRows.length;
    host.__festivalSourceLastDiagnostics = diagnostics;
    window.__festivalSourceLastDiagnostics = diagnostics;
    return mergedRows;
  }

  window.registerFestivalEventProvider = window.registerFestivalEventProvider || function(name, provider) {
    return registerFestivalEventProvider(name, provider, getFestivalProviderHost());
  };

  window.unregisterFestivalEventProvider = window.unregisterFestivalEventProvider || function(name) {
    const safeName = safeString(name).toLowerCase();
    if (!safeName) return false;
    const registry = getFestivalProviderRegistry(getFestivalProviderHost());
    if (!registry[safeName]) return false;
    delete registry[safeName];
    return true;
  };

  window.searchFestivalEvents = window.searchFestivalEvents || async function(query, options = {}) {
    const rawQuery = safeString(query);
    const searchQuery = sanitizeFestivalName(rawQuery);
    const officialUrl = looksLikeUrl(rawQuery) ? normalizeUrlCandidate(rawQuery) : '';
    const providerQuery = searchQuery || (officialUrl ? buildFestivalNameFromUrl(officialUrl) : '');
    if (!providerQuery && !officialUrl) return [];

    const providerRows = providerQuery
      ? await runFestivalProviderSearches(providerQuery, options, getFestivalProviderHost())
      : [];
    if (providerRows.length > 0) return providerRows;

    // Keep edit-mode flow usable for official festival websites even when providers return no matches.
    if (officialUrl) {
      const directCandidate = buildDirectFestivalUrlCandidate(officialUrl);
      return directCandidate ? [directCandidate] : [];
    }
    return [];
  };

  function createTaggedShortLinkError(message, diagnostics, extra = {}) {
    const baseMessage = safeString(message) || 'Short-link resolution failed.';
    const requestId = diagnostics && diagnostics.enabled ? diagnostics.id : '';
    const taggedMessage = requestId && !baseMessage.includes(`[${requestId}]`)
      ? `[${requestId}] ${baseMessage}`
      : baseMessage;

    const error = new Error(taggedMessage);
    if (requestId) error.requestId = requestId;
    if (extra && typeof extra === 'object') {
      Object.keys(extra).forEach((key) => {
        error[key] = extra[key];
      });
    }
    return error;
  }

  function createShortLinkDiagnostics(inputType, inputValue) {
    const normalizedInput = safeString(inputValue);
    const shortLinkDetected = inputType === 'placeUrl' && /(maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/kgs)/i.test(normalizedInput);
    const requestId = `SL-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

    return {
      enabled: shortLinkDetected,
      id: requestId,
      inputType,
      inputValue: normalizedInput,
      log(stage, message, extra) {
        if (!this.enabled) return;
        if (typeof extra === 'undefined') {
          console.log(`🔎 [${this.id}] ${stage}: ${message}`);
        } else {
          console.log(`🔎 [${this.id}] ${stage}: ${message}`, extra);
        }
      },
      warn(stage, message, extra) {
        if (!this.enabled) return;
        if (typeof extra === 'undefined') {
          console.warn(`⚠️ [${this.id}] ${stage}: ${message}`);
        } else {
          console.warn(`⚠️ [${this.id}] ${stage}: ${message}`, extra);
        }
      }
    };
  }

  function normalizeRawInput(value) {
    return safeString(value)
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/[<>“”"'`]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function safeDecode(value) {
    const text = safeString(value);
    if (!text) return '';
    try {
      return decodeURIComponent(text.replace(/\+/g, ' '));
    } catch (_error) {
      return text;
    }
  }

  function looksLikeUrl(value) {
    return /^(https?:\/\/|www\.|(?:maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/kgs|google\.[a-z.]+\/maps|maps\.google\.[a-z.]+))/i.test(safeString(value));
  }

  function isGoogleShortMapsUrl(value) {
    const url = parseUrlSafely(value);
    if (!url) return false;
    const host = url.hostname.replace(/^www\./i, '').toLowerCase();
    return host === 'maps.app.goo.gl' || host === 'goo.gl' || host === 'g.co';
  }

  function normalizeUrlCandidate(value) {
    const text = safeString(value).replace(/[),.;]+$/g, '');
    if (!text) return '';
    if (/^https?:\/\//i.test(text)) return text;
    if (looksLikeUrl(text)) return `https://${text.replace(/^https?:\/\//i, '')}`;
    return '';
  }

  function extractUrlCandidates(raw) {
    const text = normalizeRawInput(raw);
    if (!text) return [];

    const candidates = new Set();
    const urlMatches = text.match(/https?:\/\/[^\s<>"]+/gi) || [];
    urlMatches.forEach((match) => candidates.add(normalizeUrlCandidate(match)));

    const bareMatches = text.match(/(?:maps\.app\.goo\.gl|goo\.gl\/maps|(?:www\.)?google\.[^\s/]+\/maps[^\s]*|maps\.google\.[^\s/]+[^\s]*)/gi) || [];
    bareMatches.forEach((match) => candidates.add(normalizeUrlCandidate(match)));

    return Array.from(candidates).filter(Boolean);
  }

  function parseUrlSafely(value) {
    const normalized = normalizeUrlCandidate(value);
    if (!normalized) return null;
    try {
      return new URL(normalized);
    } catch (_error) {
      return null;
    }
  }

  function unwrapNestedGoogleUrl(rawUrl, depth = 0) {
    if (depth > 4) return rawUrl;
    const url = parseUrlSafely(rawUrl);
    if (!url) return rawUrl;

    const nestedParamNames = ['url', 'u', 'link', 'continue', 'redirect', 'redirect_url', 'redirect_uri'];
    for (const paramName of nestedParamNames) {
      const nestedValue = url.searchParams.get(paramName);
      if (nestedValue && looksLikeUrl(safeDecode(nestedValue))) {
        return unwrapNestedGoogleUrl(safeDecode(nestedValue), depth + 1);
      }
    }

    if (url.pathname === '/url') {
      const qValue = url.searchParams.get('q');
      if (qValue && looksLikeUrl(safeDecode(qValue))) {
        return unwrapNestedGoogleUrl(safeDecode(qValue), depth + 1);
      }
    }

    return url.toString();
  }

  async function tryExpandShortGoogleMapsUrl(rawUrl, diagnostics = null) {
    const normalizedUrl = normalizeUrlCandidate(rawUrl);
    if (!normalizedUrl || !isGoogleShortMapsUrl(normalizedUrl) || typeof fetch !== 'function') {
      diagnostics?.log('expansion', 'Skipped short-link expansion', {
        normalizedUrl: normalizedUrl || rawUrl,
        isShortUrl: !!normalizedUrl && isGoogleShortMapsUrl(normalizedUrl),
        fetchAvailable: typeof fetch === 'function'
      });
      return normalizedUrl || rawUrl;
    }

    diagnostics?.log('expansion', 'Attempting short-link expansion', { shortUrl: normalizedUrl });

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 2500) : null;

    try {
      const response = await fetch(normalizedUrl, {
        method: 'GET',
        redirect: 'follow',
        cache: 'no-store',
        credentials: 'omit',
        signal: controller ? controller.signal : undefined
      });

      const finalUrl = safeString(response && response.url);
      if (finalUrl && finalUrl !== normalizedUrl) {
        console.log(`🔗 Expanded short Google Maps URL: ${normalizedUrl} → ${finalUrl}`);
        diagnostics?.log('expansion', 'Short-link expansion succeeded', { shortUrl: normalizedUrl, expandedUrl: finalUrl });
        return finalUrl;
      }

      diagnostics?.warn('expansion', 'Short-link expansion returned same/fallback URL', { shortUrl: normalizedUrl, expandedUrl: finalUrl || normalizedUrl });
    } catch (error) {
      console.warn(`⚠️ Short-link expansion skipped for ${normalizedUrl}:`, error.message);
      diagnostics?.warn('expansion', 'Short-link expansion failed', { shortUrl: normalizedUrl, error: error.message });
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }

    return normalizedUrl;
  }

  async function expandShortGoogleMapsInput(raw, diagnostics = null) {
    const original = normalizeRawInput(raw);
    const candidates = extractUrlCandidates(original);
    if (candidates.length === 0) {
      diagnostics?.warn('expansion', 'No URL candidates found inside short-link input');
      return original;
    }

    let expandedInput = original;
    for (const candidate of candidates) {
      if (!isGoogleShortMapsUrl(candidate)) continue;
      const expandedUrl = await tryExpandShortGoogleMapsUrl(candidate, diagnostics);
      if (expandedUrl && expandedUrl !== candidate) {
        expandedInput = expandedInput.replace(candidate, expandedUrl);
      }
    }

    diagnostics?.log('expansion', expandedInput !== original ? 'Expanded input text updated' : 'Expanded input text unchanged', {
      original,
      expandedInput
    });

    return expandedInput;
  }

  function stripUrlsFromText(raw) {
    return normalizeRawInput(raw)
      .replace(/https?:\/\/[^\s<>"]+/gi, ' ')
      .replace(/(?:maps\.app\.goo\.gl|goo\.gl\/maps|(?:www\.)?google\.[^\s/]+\/maps[^\s]*|maps\.google\.[^\s/]+[^\s]*)/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function cleanExtractedQuery(value) {
    return safeDecode(value)
      .replace(/\+/g, ' ')
      .replace(/\b(shared from|shared via|open in google maps|on google maps)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getBestTextQueryFromUrl(raw, diagnostics = null) {
    const urls = extractUrlCandidates(raw).map((url) => unwrapNestedGoogleUrl(url));

    for (const rawUrl of urls) {
      const url = parseUrlSafely(rawUrl);
      if (!url) continue;

      const directQueryParams = ['query', 'q', 'destination', 'daddr'];
      for (const paramName of directQueryParams) {
        const value = cleanExtractedQuery(url.searchParams.get(paramName));
        if (value && !looksLikePlaceId(value) && !looksLikeUrl(value)) {
          diagnostics?.log('query recovery', `Recovered query from URL parameter "${paramName}"`, { query: value, sourceUrl: rawUrl });
          return value;
        }
      }

      const path = cleanExtractedQuery(url.pathname);
      const placePathMatch = path.match(/\/maps\/place\/([^/@?#]+)/i) || path.match(/\/place\/([^/@?#]+)/i);
      if (placePathMatch && placePathMatch[1]) {
        const query = cleanExtractedQuery(placePathMatch[1]);
        diagnostics?.log('query recovery', 'Recovered query from /place/ path', { query, sourceUrl: rawUrl });
        return query;
      }

      const searchPathMatch = path.match(/\/maps\/search\/([^/?#]+)/i) || path.match(/\/search\/([^/?#]+)/i);
      if (searchPathMatch && searchPathMatch[1]) {
        const query = cleanExtractedQuery(searchPathMatch[1]);
        diagnostics?.log('query recovery', 'Recovered query from /search/ path', { query, sourceUrl: rawUrl });
        return query;
      }
    }

    const residualText = stripUrlsFromText(raw);
    if (residualText && !looksLikeUrl(residualText)) {
      diagnostics?.log('query recovery', 'Recovered query from residual surrounding text', { query: residualText });
      return residualText;
    }

    diagnostics?.warn('query recovery', 'No text query could be recovered from short-link input');

    return '';
  }

  function extractPlaceId(raw, diagnostics = null) {
    const text = normalizeRawInput(raw);
    if (!text) return '';

    const directMatch = text.match(/\bChI[A-Za-z0-9_-]{6,}\b/);
    if (directMatch) {
      diagnostics?.log('Place ID extraction', 'Recovered Place ID directly from pasted input', { placeId: directMatch[0] });
      return directMatch[0];
    }

    for (const candidate of extractUrlCandidates(text)) {
      const expandedCandidate = unwrapNestedGoogleUrl(candidate);
      const expandedText = safeDecode(expandedCandidate);

      const embeddedMatch = expandedText.match(/\bChI[A-Za-z0-9_-]{6,}\b/);
      if (embeddedMatch) {
        diagnostics?.log('Place ID extraction', 'Recovered Place ID from expanded URL text', { placeId: embeddedMatch[0], sourceUrl: expandedCandidate });
        return embeddedMatch[0];
      }

      const url = parseUrlSafely(expandedCandidate);
      if (!url) continue;

      const placeIdParams = ['query_place_id', 'place_id', 'destination_place_id'];
      for (const paramName of placeIdParams) {
        const placeId = safeDecode(url.searchParams.get(paramName));
        if (looksLikePlaceId(placeId)) {
          diagnostics?.log('Place ID extraction', `Recovered Place ID from URL parameter "${paramName}"`, { placeId, sourceUrl: expandedCandidate });
          return placeId;
        }
      }

      const hashPlaceId = safeDecode(url.hash).match(/\bChI[A-Za-z0-9_-]{6,}\b/);
      if (hashPlaceId) {
        diagnostics?.log('Place ID extraction', 'Recovered Place ID from URL hash', { placeId: hashPlaceId[0], sourceUrl: expandedCandidate });
        return hashPlaceId[0];
      }
    }

    diagnostics?.warn('Place ID extraction', 'No Place ID could be extracted from short-link input');

    return '';
  }

  function extractSearchQuery(inputType, rawInput, diagnostics = null) {
    const value = normalizeRawInput(rawInput);
    if (!value) return '';

    if (inputType === 'website') {
      try {
        const normalized = /^https?:\/\//i.test(value) ? value : `https://${value}`;
        return new URL(normalized).hostname.replace(/^www\./i, '');
      } catch (_error) {
        return value;
      }
    }

    if (inputType === 'placeUrl') {
      const extractedQuery = getBestTextQueryFromUrl(value, diagnostics);
      if (extractedQuery) return extractedQuery;
    }

    diagnostics?.warn('query recovery', 'Falling back to raw input text as search query', { fallbackQuery: value });

    return value;
  }

  function inferBusinessType(types) {
    const list = Array.isArray(types) ? types : [];
    const typeMap = {
      restaurant: '🍽️ Restaurant',
      cafe: '☕ Cafe',
      bar: '🍺 Bar',
      hotel: '🏨 Hotel',
      lodging: '🛏️ Lodging',
      park: '🌳 Park',
      hiking_area: '🥾 Hiking',
      museum: '🏛️ Museum',
      shopping_mall: '🛍️ Shopping',
      gym: '💪 Gym',
      hospital: '🏥 Hospital',
      pharmacy: '💊 Pharmacy',
      store: '🏪 Store',
      supermarket: '🛒 Supermarket'
    };

    for (const type of list) {
      if (typeMap[type]) return typeMap[type];
    }
    return '';
  }

  function normalizeResolvedDetails(placeId, details, searchResult, rawInput) {
    const safeDetails = details && typeof details === 'object' ? details : {};
    const safeSearch = searchResult && typeof searchResult === 'object' ? searchResult : {};
    const resolvedPlaceId = safeString(placeId || safeDetails.placeId || safeSearch.placeId || extractPlaceId(rawInput));
    const name = safeString(safeDetails.name || safeSearch.name || rawInput);
    const address = safeString(safeDetails.address || safeSearch.address);
    const fallbackWebsite = looksLikeUrl(rawInput) ? normalizeUrlCandidate(rawInput) : '';

    return {
      placeId: resolvedPlaceId,
      name,
      address,
      phone: safeString(safeDetails.phone || safeSearch.phone),
      website: safeString(safeDetails.website || safeSearch.website || fallbackWebsite),
      rating: safeDetails.rating ?? safeSearch.rating ?? '',
      userRatingsTotal: safeDetails.userRatingsTotal ?? safeSearch.reviewCount ?? 0,
      hours: safeDetails.hours || safeSearch.hours || '',
      businessStatus: safeString(safeDetails.businessStatus || safeSearch.businessStatus || 'UNKNOWN'),
      businessType: safeString(safeDetails.businessType || safeSearch.businessType || inferBusinessType(safeDetails.types || safeSearch.types)),
      description: safeString(safeDetails.description || safeSearch.description),
      eventDate: safeString(safeDetails.eventDate || safeSearch.eventDate),
      sourceProvider: safeString(safeDetails.sourceProvider || safeSearch.sourceProvider || (fallbackWebsite ? 'Official Festival URL' : '')),
      sourceType: safeString(safeDetails.sourceType || safeSearch.sourceType),
      openLinkUrl: safeString(safeDetails.openLinkUrl || safeSearch.openLinkUrl || safeDetails.googlePlaceUrl || safeSearch.googlePlaceUrl || fallbackWebsite),
      openLinkLabel: safeString(safeDetails.openLinkLabel || safeSearch.openLinkLabel),
      types: Array.isArray(safeDetails.types) ? safeDetails.types : (Array.isArray(safeSearch.types) ? safeSearch.types : []),
      coordinates: safeDetails.coordinates || safeSearch.coordinates || null,
      directions: safeString(safeDetails.directions || safeSearch.directions) || (resolvedPlaceId ? `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(resolvedPlaceId)}` : '')
    };
  }

  window.resolvePlaceInputWithGoogleData = window.resolvePlaceInputWithGoogleData || async function(inputType, inputValue) {
    const mainWindow = getMainWindow();
    const activeTarget = getActiveEditTarget(mainWindow);
    const festivalMode = isFestivalTarget(activeTarget);
    const rawValue = safeString(inputValue);
    if (!rawValue) {
      throw new Error('Please enter a value.');
    }

    const diagnostics = createShortLinkDiagnostics(inputType, rawValue);
    diagnostics.log('start', 'Short-link diagnostics enabled', { inputType, inputValue: rawValue });

    try {
      const expandedValue = inputType === 'placeUrl'
        ? await expandShortGoogleMapsInput(rawValue, diagnostics)
        : rawValue;

      let placeId = '';
      let searchResult = null;
      let details = null;

      const extractedPlaceId = extractPlaceId(expandedValue, diagnostics);
      const queryText = extractSearchQuery(inputType, expandedValue, diagnostics);

      if (typeof mainWindow.resolvePlaceIdFromInput === 'function') {
        try {
          diagnostics.log('Place ID extraction', 'Trying main-window resolvePlaceIdFromInput', { input: expandedValue });
          placeId = safeString(await mainWindow.resolvePlaceIdFromInput(inputType, expandedValue));
          if (placeId) {
            diagnostics.log('Place ID extraction', 'main-window resolver returned a Place ID', { placeId });
          }
        } catch (resolverError) {
          console.warn(`⚠️ resolvePlaceIdFromInput failed for ${inputType}:`, resolverError.message);
          diagnostics.warn('Place ID extraction', 'main-window resolver failed', { error: resolverError.message });
        }
      }

      if (!placeId && (inputType === 'placeId' || inputType === 'placeUrl') && extractedPlaceId) {
        placeId = extractedPlaceId;
        diagnostics.log('Place ID extraction', 'Using locally extracted Place ID fallback', { placeId });
      }

      if (festivalMode) {
        const festivalSearchFn = typeof mainWindow.searchFestivalEvents === 'function'
          ? mainWindow.searchFestivalEvents
          : (typeof window.searchFestivalEvents === 'function' ? window.searchFestivalEvents : null);
        const festivalQuery = (inputType === 'website' && looksLikeUrl(expandedValue)) ? expandedValue : queryText;
        if (typeof festivalSearchFn === 'function' && festivalQuery) {
          diagnostics.log('festival search', 'Trying festival event adapters', { queryText: festivalQuery, target: activeTarget });
          try {
            const festivalResults = await festivalSearchFn(festivalQuery, {
              target: activeTarget,
              inputType,
              radiusMiles: null,
              state: '',
              mode: 'resolve-single'
            });
            if (Array.isArray(festivalResults) && festivalResults.length > 0) {
              searchResult = normalizeFestivalEventResult(festivalResults[0], safeString(festivalResults[0] && (festivalResults[0].sourceProvider || festivalResults[0].provider)) || 'Festival Provider');
              if (!placeId) placeId = safeString(searchResult.placeId);
              diagnostics.log('festival search', 'Festival adapter returned a candidate', { name: searchResult.name, placeId: searchResult.placeId || '' });
            } else {
              diagnostics.warn('festival search', 'Festival adapters returned no candidates', { queryText: festivalQuery });
            }
          } catch (festivalError) {
            diagnostics.warn('festival search', 'Festival adapter search failed', { error: festivalError.message, queryText: festivalQuery });
          }
        }
      }

      if ((!placeId || !looksLikePlaceId(placeId)) && (!festivalMode || !searchResult) && typeof mainWindow.searchPlaces === 'function' && queryText) {
        diagnostics.log('query recovery', 'Trying searchPlaces fallback with recovered query', { queryText });
        const searchResults = await mainWindow.searchPlaces(queryText);
        if (Array.isArray(searchResults) && searchResults.length > 0) {
          searchResult = searchResults[0];
          placeId = safeString(searchResult.placeId || placeId);
          diagnostics.log('query recovery', 'searchPlaces returned a candidate', { placeId, topResult: searchResult.name || '' });
        } else {
          diagnostics.warn('query recovery', 'searchPlaces returned no candidates', { queryText });
        }
      }

      if (!looksLikePlaceId(placeId) && !festivalMode) {
        diagnostics.warn('Place ID extraction', 'Resolution failed before Google details lookup', { rawValue, expandedValue, queryText });
        throw createTaggedShortLinkError(`Could not resolve a valid Google Place ID for "${rawValue}".`, diagnostics, { stage: 'Place ID extraction' });
      }

      if (!looksLikePlaceId(placeId) && festivalMode) {
        diagnostics.warn('Place ID extraction', 'Festival mode fallback: proceeding without a Google Place ID', {
          rawValue,
          expandedValue,
          queryText,
          target: activeTarget
        });
      }

      if (looksLikePlaceId(placeId) && typeof mainWindow.getPlaceDetails === 'function') {
        diagnostics.log('Google detail lookup', 'Fetching Google place details', { placeId });
        details = await mainWindow.getPlaceDetails(placeId);
        if (details && safeString(details.name) && safeString(details.address)) {
          diagnostics.log('Google detail lookup', 'Google details lookup succeeded', { name: details.name, address: details.address });
        } else {
          diagnostics.warn('Google detail lookup', 'Google details lookup returned incomplete data', { placeId, details });
        }
      }

      if ((!details || !safeString(details.name) || (!festivalMode && !safeString(details.address))) && !searchResult && typeof mainWindow.searchPlaces === 'function' && queryText) {
        diagnostics.log('Google detail lookup', 'Retrying with searchPlaces for incomplete details', { queryText, placeId });
        const searchResults = await mainWindow.searchPlaces(queryText);
        if (Array.isArray(searchResults) && searchResults.length > 0) {
          searchResult = searchResults[0];
          diagnostics.log('Google detail lookup', 'Recovered candidate from secondary searchPlaces lookup', { topResult: searchResult.name || '', placeId: searchResult.placeId || '' });
        } else {
          diagnostics.warn('Google detail lookup', 'Secondary searchPlaces lookup returned no candidates', { queryText });
        }
      }

      const normalized = normalizeResolvedDetails(placeId, details, searchResult, expandedValue);
      if (festivalMode && !safeString(normalized.name)) {
        normalized.name = sanitizeFestivalName(queryText || rawValue);
      }
      if (festivalMode && (!normalized.name || looksLikeUrl(normalized.name) || looksLikePlaceId(normalized.name))) {
        normalized.name = sanitizeFestivalName(queryText || normalized.address || rawValue);
      }
      // Require at minimum a valid placeId and name; address is optional (some places lack formattedAddress)
      const resolvedName = normalized.name && normalized.name !== normalized.placeId ? normalized.name : '';
      if ((!festivalMode && !normalized.placeId) || !resolvedName) {
        diagnostics.warn('Google detail lookup', 'Normalized result is still incomplete after all fallbacks', normalized);
        throw createTaggedShortLinkError(`Google returned incomplete details for "${expandedValue}". No row was added.`, diagnostics, { stage: 'Google detail lookup' });
      }
      // Patch name back onto normalized in case it had been overridden by a raw placeId value
      normalized.name = resolvedName;

      diagnostics.log('complete', 'Short-link resolution completed successfully', {
        placeId: normalized.placeId,
        name: normalized.name,
        address: normalized.address
      });

      return normalized;
    } catch (error) {
      if (diagnostics.enabled && (!error || !error.requestId)) {
        const taggedError = createTaggedShortLinkError(error?.message || String(error), diagnostics, {
          stage: error?.shortLinkStage || 'resolver',
          cause: error
        });
        diagnostics.warn('complete', 'Short-link resolution failed', { requestId: taggedError.requestId, error: taggedError.message });
        throw taggedError;
      }

      diagnostics.warn('complete', 'Short-link resolution failed', { requestId: error?.requestId || diagnostics.id, error: error?.message || String(error) });
      throw error;
    }
  };

  window.normalizeExcelRowForSchema = window.normalizeExcelRowForSchema || function(rowValues, sourceWindow = getMainWindow()) {
    const schemaCount = Number(
      sourceWindow?.__excelColumnCount ||
      sourceWindow?.adventuresData?.[0]?.values?.[0]?.length ||
      window.__excelColumnCount ||
      24
    );

    const normalized = (Array.isArray(rowValues) ? rowValues : []).map((v) => {
      if (v === null || v === undefined) return '';
      if (typeof v === 'string') return v;
      if (typeof v === 'number') return String(v);
      if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
      return String(v);
    });

    if (normalized.length > schemaCount) return normalized.slice(0, schemaCount);
    if (normalized.length < schemaCount) return normalized.concat(new Array(schemaCount - normalized.length).fill(''));
    return normalized;
  };

  class EnhancedAutomationFeatures {
    constructor() {
      this.dryRunStates = {
        addSingle: false,
        bulkAdd: false,
        bulkChain: false,
        refreshPlaceIds: false,
        populateMissing: false,
        updateHours: false,
        autoTag: false
      };
      console.log('✅ Enhanced Automation Features initialized');
    }

    validatePlaceInput(input, inputType) {
      const trimmed = safeString(input);
      if (!trimmed) return { isValid: false, error: 'Input cannot be empty' };

      switch (inputType) {
        case 'placeName':
        case 'address':
        case 'website':
        case 'placeUrl':
        case 'placeId':
          return { isValid: true };
        case 'placeNameCity':
          return trimmed.includes(',')
            ? { isValid: true }
            : { isValid: false, error: 'Format: Place Name, City (e.g., Starbucks, Denver)' };
        default:
          return { isValid: false, error: `Unknown input type: ${inputType}` };
      }
    }

    getDryRunState(feature) {
      return !!this.dryRunStates[feature];
    }

    setDryRunState(feature, state) {
      this.dryRunStates[feature] = !!state;
      return this.dryRunStates[feature];
    }

    toggleDryRunState(feature) {
      this.dryRunStates[feature] = !this.dryRunStates[feature];
      return this.dryRunStates[feature];
    }

    displayResults(result, statusDiv) {
      if (!statusDiv) return;
      if (result && result.success) {
        statusDiv.innerHTML = `<div class="status-message status-success">✅ ${result.message || 'Operation completed successfully'}</div>`;
      } else {
        statusDiv.innerHTML = `<div class="status-message status-error">❌ ${(result && result.error) || 'Operation failed'}</div>`;
      }
    }

    async addSinglePlace(input, inputType, dryRun = false, options = {}) {
      const validation = this.validatePlaceInput(input, inputType);
      if (!validation.isValid) return { success: false, error: validation.error };
      const preResolved = options && options.resolvedDetails && typeof options.resolvedDetails === 'object'
        ? normalizeResolvedDetails(options.resolvedDetails.placeId, options.resolvedDetails, options.resolvedDetails, safeString(input))
        : null;
      if (dryRun) {
        return {
          success: true,
          isDryRun: true,
          message: `🧪 [DRY RUN] Would add: ${safeString((preResolved && preResolved.name) || input)}`,
          placeName: safeString((preResolved && preResolved.name) || input),
          placeId: safeString(preResolved && preResolved.placeId),
          details: preResolved || null
        };
      }

      try {
        const mainWindow = getMainWindow();
        const details = preResolved || await window.resolvePlaceInputWithGoogleData(inputType, input);
        const placeId = safeString(details && details.placeId);

        if (typeof mainWindow.buildExcelRow !== 'function') {
          throw new Error('Main window buildExcelRow helper is unavailable.');
        }

        const rowValues = window.normalizeExcelRowForSchema(mainWindow.buildExcelRow(placeId, details), mainWindow);

        if (typeof mainWindow.placeExistsInData === 'function' && mainWindow.placeExistsInData(rowValues)) {
          throw new Error('This location already exists in Excel.');
        }

        if (typeof mainWindow.addRowToExcel === 'function') {
          await mainWindow.addRowToExcel(rowValues);
        } else if (Array.isArray(mainWindow.adventuresData) && typeof mainWindow.saveToExcel === 'function') {
          mainWindow.adventuresData.push({ values: [rowValues] });
          await mainWindow.saveToExcel();
        } else {
          throw new Error('Main window Excel save helpers are unavailable.');
        }

        if (Array.isArray(mainWindow.adventuresData)) {
          const lastRow = mainWindow.adventuresData[mainWindow.adventuresData.length - 1]?.values?.[0];
          const nameCol = typeof mainWindow.getColumnIndexByName === 'function'
            ? Number(mainWindow.getColumnIndexByName('Name'))
            : 0;
          const placeIdCol = typeof mainWindow.getColumnIndexByName === 'function'
            ? Number(mainWindow.getColumnIndexByName('Google Place ID', ['GooglePlaceId']))
            : 1;
          const safeNameCol = Number.isInteger(nameCol) && nameCol >= 0 ? nameCol : 0;
          const safePlaceIdCol = Number.isInteger(placeIdCol) && placeIdCol >= 0 ? placeIdCol : 1;
          const alreadyAppended = Array.isArray(lastRow)
            && safeString(lastRow[safePlaceIdCol]) === placeId
            && safeString(lastRow[safeNameCol]) === safeString(details.name);
          if (!alreadyAppended) {
            mainWindow.adventuresData.push({ values: [rowValues] });
          }
        }

        return {
          success: true,
          message: `Added ${details.name}`,
          placeName: details.name,
          placeId,
          details
        };
      } catch (error) {
        const requestIdPrefix = error?.requestId ? `[${error.requestId}] ` : '';
        console.error(`❌ Error adding place: ${requestIdPrefix}${error?.message || error}`, error);
        return { success: false, error: error.message };
      }
    }

    async bulkAddPlaces(placesText, inputType, dryRun = false, options = {}) {
      const resolvedDetailsList = Array.isArray(options && options.resolvedDetailsList)
        ? options.resolvedDetailsList.filter((item) => item && typeof item === 'object')
        : [];
      const lines = resolvedDetailsList.length
        ? resolvedDetailsList.map((item) => safeString(item.name || item.address || item.website || 'Festival Event')).filter(Boolean)
        : (placesText || '').split('\n').map((line) => line.trim()).filter(Boolean);
      if (lines.length === 0) return { success: false, error: 'No places provided' };

      const results = { success: true, total: lines.length, added: 0, failed: 0, skipped: 0, details: [] };
      for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        const resolvedDetails = resolvedDetailsList[index] || null;
        const result = await this.addSinglePlace(line, inputType, dryRun, resolvedDetails ? { resolvedDetails } : undefined);
        if (result && result.success) {
          results.added++;
          results.details.push(`✅ ${result.placeName || line}${result.isDryRun ? ' (dry run)' : ''}`);
        } else {
          results.failed++;
          results.details.push(`❌ ${line}: ${(result && result.error) || 'Operation failed'}`);
        }
        await new Promise((resolve) => setTimeout(resolve, 150));
      }

      results.success = results.failed === 0;
      results.message = `Added ${results.added}/${results.total} places (${results.failed} failed, ${results.skipped} skipped)`;
      return results;
    }

    async bulkAddChainLocations(placesText, inputType, dryRun = false) {
      const lines = (placesText || '').split('\n').map((line) => line.trim()).filter(Boolean);
      if (lines.length === 0) return { success: false, error: 'No places provided' };

      if (typeof window.handleBulkAddChainLocationsFixed === 'function') {
        const result = await window.handleBulkAddChainLocationsFixed(lines, inputType, document.createElement('div'), dryRun);
        return result && typeof result === 'object'
          ? result
          : { success: false, error: buildStrictWrapperMessage('bulk-add-chain', 'NON_OBJECT_RESULT') };
      }
      if (typeof window.handleBulkAddChainLocationsEnhanced === 'function') {
        const result = await window.handleBulkAddChainLocationsEnhanced(lines, inputType, document.createElement('div'), dryRun);
        return result && typeof result === 'object'
          ? result
          : { success: false, error: buildStrictWrapperMessage('bulk-add-chain', 'NON_OBJECT_RESULT') };
      }
      return { success: false, error: buildStrictWrapperMessage('bulk-add-chain', 'NO_HANDLER') };
    }

    async populateMissingFieldsOnly(dryRun = false) {
      if (typeof window.handlePopulateMissingFieldsEnhanced === 'function') {
        const result = await window.handlePopulateMissingFieldsEnhanced(document.createElement('div'), dryRun);
        return result && typeof result === 'object'
          ? result
          : { success: false, error: buildStrictWrapperMessage('populate-missing', 'NON_OBJECT_RESULT') };
      }
      if (typeof window.handlePopulateMissingFields === 'function') {
        const result = await window.handlePopulateMissingFields(document.createElement('div'), dryRun);
        return result && typeof result === 'object'
          ? result
          : { success: false, error: buildStrictWrapperMessage('populate-missing', 'NON_OBJECT_RESULT') };
      }
      return { success: false, error: buildStrictWrapperMessage('populate-missing', 'NO_HANDLER') };
    }

    async populateMissingFields(dryRun = false) {
      return this.populateMissingFieldsOnly(dryRun);
    }

    async updateHoursOnly(dryRun = false) {
      if (typeof window.handleUpdateHoursOnlyEnhanced === 'function') {
        const result = await window.handleUpdateHoursOnlyEnhanced(document.createElement('div'), dryRun);
        return result && typeof result === 'object'
          ? result
          : { success: false, error: buildStrictWrapperMessage('update-hours', 'NON_OBJECT_RESULT') };
      }
      if (typeof window.handleUpdateHoursOnly === 'function') {
        const result = await window.handleUpdateHoursOnly(document.createElement('div'), dryRun);
        return result && typeof result === 'object'
          ? result
          : { success: false, error: buildStrictWrapperMessage('update-hours', 'NON_OBJECT_RESULT') };
      }
      return { success: false, error: buildStrictWrapperMessage('update-hours', 'NO_HANDLER') };
    }

    async autoTagAll(dryRun = false) {
      if (typeof window.handleAutoTagAll === 'function') {
        const result = await window.handleAutoTagAll(dryRun);
        return result && typeof result === 'object'
          ? result
          : { success: false, error: buildStrictWrapperMessage('auto-tag', 'NON_OBJECT_RESULT') };
      }
      if (typeof window.autoTagAllLocationsUnified === 'function') {
        const result = await window.autoTagAllLocationsUnified({ dryRun });
        return result && typeof result === 'object'
          ? result
          : { success: false, error: buildStrictWrapperMessage('auto-tag', 'NON_OBJECT_RESULT') };
      }
      return { success: false, error: buildStrictWrapperMessage('auto-tag', 'NO_HANDLER') };
    }
  }

  window.EnhancedAutomationFeatures = EnhancedAutomationFeatures;
  window.enhancedAutomation = window.enhancedAutomation || new EnhancedAutomationFeatures();

  console.log('✅ Consolidated Automation Features System v7.0.141 Loaded');
})();
