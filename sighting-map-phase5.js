/**
 * SIGHTING MAP — Phase 5
 * Interactive Leaflet map overlay for bird sighting locations.
 *
 * - Self-contained IIFE, safe to load after nature-challenge-tab-system.js
 * - Reads from localStorage key 'natureChallengeBirdSightingLogV1'
 * - Adds a "🗺️ Map" button next to the existing Explore / Log buttons
 * - Renders a full-screen overlay — does NOT modify existing JS internals
 * - Uses Leaflet.js loaded via CDN (see integration step in index.html)
 */

(function () {
  'use strict';

  /* ─── Capture script base path immediately (currentScript is null after async) ── */
  const _scriptBase = (function () {
    const src = (document.currentScript || {}).src || '';
    return src ? src.replace(/[^/]+$/, '') : '';
  })();

  /* ─── Constants ──────────────────────────────────────────── */
  const SIGHTING_LOG_KEY   = 'natureChallengeBirdSightingLogV1';
  const LEAFLET_CSS_CDN    = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  const LEAFLET_JS_CDN     = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  const TILE_URL           = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const TILE_ATTR          = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  const DEFAULT_CENTER     = [39.5, -98.35];
  const DEFAULT_ZOOM       = 4;

  function isCtaNormalizationDebugEnabled() {
    return Boolean(window.navigator && window.navigator.webdriver);
  }

  const RARITY_COLOR = {
    common:          '#3b82f6',
    regular:         '#10b981',
    uncommon:        '#f59e0b',
    rare:            '#f97316',
    'very rare':     '#ef4444',
    veryrare:        '#ef4444',
    'extremely rare':'#8b5cf6',
    extremelyrare:   '#8b5cf6',
  };
  const RARITY_CLASS = {
    common:          'rarity-common',
    regular:         'rarity-regular',
    uncommon:        'rarity-uncommon',
    rare:            'rarity-rare',
    'very rare':     'rarity-very-rare',
    veryrare:        'rarity-very-rare',
    'extremely rare':'rarity-extremely-rare',
    extremelyrare:   'rarity-extremely-rare',
  };

  /* ─── Module state ───────────────────────────────────────── */
  let leafletMap    = null;
  let markerLayer   = null;
  let overlayEl     = null;
  let leafletReady  = false;
  let filters = { species: 'all', habitat: 'all', rarity: 'all', dateFrom: '', dateTo: '' };

  /* ─── Data helpers ───────────────────────────────────────── */
  function getMapContext() {
    const fallback = {
      subTabKey: 'birds',
      labelPlural: 'Birds',
      labelSingular: 'Bird',
      storageKey: SIGHTING_LOG_KEY,
      sightings: null
    };
    try {
      if (typeof window.getNatureMapContext === 'function') {
        const ctx = window.getNatureMapContext() || {};
        return {
          subTabKey: String(ctx.subTabKey || fallback.subTabKey),
          labelPlural: String(ctx.labelPlural || fallback.labelPlural),
          labelSingular: String(ctx.labelSingular || fallback.labelSingular),
          storageKey: String(ctx.storageKey || fallback.storageKey),
          sightings: Array.isArray(ctx.sightings) ? ctx.sightings : null
        };
      }
    } catch (_) {
      // Fallback to birds context when helper is unavailable.
    }
    return fallback;
  }

  function loadLog() {
    const ctx = getMapContext();
    if (Array.isArray(ctx.sightings)) return ctx.sightings;
    try { return JSON.parse(localStorage.getItem(ctx.storageKey || SIGHTING_LOG_KEY) || '[]'); }
    catch (_) { return []; }
  }

  function geoEntries() {
    return loadLog().filter(
      (e) => typeof e.latitude === 'number' && typeof e.longitude === 'number'
             && !isNaN(e.latitude) && !isNaN(e.longitude)
    );
  }

  function filtered(entries) {
    return entries.filter((e) => {
      const r   = (e.rarity  || '').toLowerCase().replace(/\s+/g, '');
      const fr  = (filters.rarity || 'all').toLowerCase().replace(/\s+/g, '');
      if (filters.species !== 'all' && e.speciesName !== filters.species)       return false;
      if (filters.habitat !== 'all' && (e.habitat||'').toLowerCase() !== filters.habitat) return false;
      if (fr !== 'all' && r !== fr) return false;
      if (filters.dateFrom) {
        const d = e.dateObserved || (e.createdAt||'').slice(0,10);
        if (d < filters.dateFrom) return false;
      }
      if (filters.dateTo) {
        const d = e.dateObserved || (e.createdAt||'').slice(0,10);
        if (d > filters.dateTo) return false;
      }
      return true;
    });
  }

  /* ─── HTML builders ──────────────────────────────────────── */
  function esc(s) {
    return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;')
           .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function popupHTML(e) {
    const date     = e.dateObserved || (e.createdAt||'').slice(0,10);
    const dateStr  = date ? new Date(date+'T12:00:00').toLocaleDateString('en-US',
                    {month:'short',day:'numeric',year:'numeric'}) : '—';
    const conf     = (e.confidence||'certain').toLowerCase();
    const confLbl  = {certain:'Certain',probable:'Probable','needs-review':'Needs Review'}[conf]||conf;
    const context  = [e.habitat, e.region].filter(Boolean).map(esc).join(' · ');
    const notes    = e.notes ? esc(e.notes.slice(0,120)) + (e.notes.length>120?'…':'') : '';
    return `<div class="bmp-popup">
  <div class="bmp-popup-header">
    <p class="bmp-popup-species">🐦 ${esc(e.speciesName||'Unknown')}</p>
    ${e.familyLabel ? `<p class="bmp-popup-family">${esc(e.familyLabel)}</p>` : ''}
  </div>
  <div class="bmp-popup-body">
    <div class="bmp-popup-row"><span class="bmp-popup-icon">📅</span><span class="bmp-popup-value">${dateStr}</span></div>
    <div class="bmp-popup-row"><span class="bmp-popup-icon">📍</span><span class="bmp-popup-value">${esc(e.locationName||'—')}</span></div>
    ${context ? `<div class="bmp-popup-row"><span class="bmp-popup-icon">🌿</span><span class="bmp-popup-value">${context}</span></div>` : ''}
    ${e.count  ? `<div class="bmp-popup-row"><span class="bmp-popup-icon">🔢</span><span class="bmp-popup-value">${esc(e.count)} observed</span></div>` : ''}
    <div class="bmp-popup-row"><span class="bmp-popup-icon">🎯</span><span class="bmp-popup-confidence ${conf}">${confLbl}</span></div>
    ${notes ? `<div class="bmp-popup-notes">${notes}</div>` : ''}
  </div>
</div>`;
  }

  function markerIcon(e) {
    const rk    = (e.rarity||'').toLowerCase().replace(/\s+/g,'');
    const cls   = RARITY_CLASS[rk]  || 'rarity-unknown';
    const color = RARITY_COLOR[rk]  || '#6b7280';
    return window.L.divIcon({
      html: `<div class="bmp-marker-pin ${cls}" style="background:${color}"><span class="bmp-marker-inner">🐦</span></div>`,
      className: '',
      iconSize:  [30, 30],
      iconAnchor:[15, 30],
      popupAnchor:[0,-32]
    });
  }

  /* ─── Map rendering ──────────────────────────────────────── */
  function renderMarkers() {
    if (!leafletMap || !markerLayer) return;
    markerLayer.clearLayers();

    const all  = geoEntries();
    const show = filtered(all);

    updateBadge(show.length, all.length);
    updateStats(show);
    updateEmpty(show.length === 0, all.length === 0);

    show.forEach((e) => {
      window.L.marker([e.latitude, e.longitude], { icon: markerIcon(e) })
        .bindPopup(popupHTML(e), { className: 'birds-map-popup', maxWidth: 280 })
        .addTo(markerLayer);
    });

    if (show.length > 0) {
      try {
        leafletMap.fitBounds(
          window.L.featureGroup(markerLayer.getLayers()).getBounds().pad(0.2),
          { maxZoom: 12, animate: true }
        );
      } catch (_) { /* single point edge case */ }
    }
  }

  function updateBadge(shown, total) {
    const b = document.getElementById('birdsMapCountBadge');
    if (!b) return;
    const ctx = getMapContext();
    const noun = ctx && ctx.labelSingular ? String(ctx.labelSingular).toLowerCase() : 'sighting';
    b.textContent = shown === total
      ? `${total} ${noun}${total!==1?'s':''}`
      : `${shown} of ${total} ${noun}s`;
    b.className = 'birds-map-count-badge' + (shown > 0 ? ' has-pins' : '');
  }

  function updateStats(entries) {
    const bar = document.getElementById('birdsMapStatsBar');
    if (!bar) return;
    const ctx = getMapContext();
    const labelPlural = ctx && ctx.labelPlural ? ctx.labelPlural : 'Birds';
    const sp  = new Set(entries.map((e) => e.speciesName)).size;
    const loc = new Set(entries.map((e) => e.locationName).filter(Boolean)).size;
    const ph  = entries.filter((e) => e.photoName).length;
    bar.innerHTML =
      `<span class="birds-map-stat"><span class="birds-map-stat-value">${entries.length}</span> pins</span>` +
      `<span class="birds-map-stat"><span class="birds-map-stat-value">${sp}</span> ${esc(labelPlural).toLowerCase()}</span>` +
      `<span class="birds-map-stat"><span class="birds-map-stat-value">${loc}</span> locations</span>` +
      (ph ? `<span class="birds-map-stat"><span class="birds-map-stat-value">${ph}</span> with photo</span>` : '');
  }

  function updateEmpty(noFiltered, noGeo) {
    const el = document.getElementById('birdsMapEmpty');
    if (!el) return;
    const ctx = getMapContext();
    const labelPlural = ctx && ctx.labelPlural ? ctx.labelPlural : 'Birds';
    const labelSingular = ctx && ctx.labelSingular ? ctx.labelSingular : 'Bird';
    if (noGeo) {
      el.removeAttribute('hidden');
      el.querySelector('.birds-map-empty-title').textContent = `No GPS ${labelPlural.toLowerCase()} logged yet`;
      el.querySelector('.birds-map-empty-desc').textContent  =
        `Add latitude & longitude when logging a ${labelSingular.toLowerCase()} entry to see it here.`;
    } else if (noFiltered) {
      el.removeAttribute('hidden');
      el.querySelector('.birds-map-empty-title').textContent = 'No sightings match these filters';
      el.querySelector('.birds-map-empty-desc').textContent  = 'Try clearing the filters above.';
    } else {
      el.setAttribute('hidden', '');
    }
  }

  /* ─── Filter bar population ──────────────────────────────── */
  function populateFilters() {
    const entries = geoEntries();
    const ctx = getMapContext();
    const labelPlural = ctx && ctx.labelPlural ? ctx.labelPlural : 'Birds';

    const fill = (id, vals, label) => {
      const sel = document.getElementById(id);
      if (!sel) return;
      sel.innerHTML = `<option value="all">${label}</option>` +
        [...new Set(vals.filter(Boolean))].sort()
          .map((v) => `<option value="${esc(v)}">${esc(v.charAt(0).toUpperCase()+v.slice(1))}</option>`)
          .join('');
      sel.value = filters[id.replace('birdsMapFilter','').toLowerCase()] || 'all';
    };

    fill('birdsMapFilterSpecies', entries.map((e) => e.speciesName),                     `All ${labelPlural}`);
    fill('birdsMapFilterHabitat', entries.map((e) => (e.habitat||'').toLowerCase()),     'All Habitats');
    fill('birdsMapFilterRarity',  entries.map((e) => e.rarity||''),                      'All Rarities');
  }

  /* ─── Overlay DOM ────────────────────────────────────────── */
  function buildOverlay() {
    const el = document.createElement('div');
    el.id        = 'birdsMapOverlay';
    el.className = 'birds-map-overlay';
    el.setAttribute('hidden', '');
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Sighting Map');
    el.innerHTML = `
<div class="birds-map-header">
  <button id="birdsMapCloseBtn" class="birds-map-back-btn app-back-btn" type="button">← Back</button>
  <span class="birds-map-title">🗺️ Sighting Map</span>
  <span id="birdsMapCountBadge" class="birds-map-count-badge">0 sightings</span>
</div>
<div class="birds-map-filters">
  <span class="birds-map-filter-label">Filter:</span>
  <select id="birdsMapFilterSpecies" class="birds-map-filter-select" aria-label="Filter by species"><option value="all">All Species</option></select>
  <select id="birdsMapFilterHabitat" class="birds-map-filter-select" aria-label="Filter by habitat"><option value="all">All Habitats</option></select>
  <select id="birdsMapFilterRarity"  class="birds-map-filter-select" aria-label="Filter by rarity"><option value="all">All Rarities</option></select>
  <input type="date" id="birdsMapFilterDateFrom" class="birds-map-filter-date" aria-label="From date">
  <input type="date" id="birdsMapFilterDateTo"   class="birds-map-filter-date" aria-label="To date">
  <button id="birdsMapFilterClear" class="birds-map-filter-clear" type="button">Clear Filters</button>
</div>
<div class="birds-map-body">
  <div id="birdsMapLeaflet" class="birds-map-leaflet"></div>
  <div id="birdsMapEmpty" class="birds-map-empty" hidden>
    <div class="birds-map-empty-icon">🗺️</div>
    <div class="birds-map-empty-title">No GPS sightings yet</div>
    <div class="birds-map-empty-desc">Add latitude &amp; longitude when logging a sighting.</div>
    <div class="birds-map-empty-tip">💡 Use the <strong>Lat / Lng</strong> fields in the sighting log form</div>
  </div>
  <div class="birds-map-legend">
    <div class="birds-map-legend-title">Rarity</div>
    <div class="birds-map-legend-row"><span class="birds-map-legend-dot" style="background:#3b82f6"></span>Common</div>
    <div class="birds-map-legend-row"><span class="birds-map-legend-dot" style="background:#10b981"></span>Regular</div>
    <div class="birds-map-legend-row"><span class="birds-map-legend-dot" style="background:#f59e0b"></span>Uncommon</div>
    <div class="birds-map-legend-row"><span class="birds-map-legend-dot" style="background:#f97316"></span>Rare</div>
    <div class="birds-map-legend-row"><span class="birds-map-legend-dot" style="background:#ef4444"></span>Very Rare</div>
    <div class="birds-map-legend-row"><span class="birds-map-legend-dot" style="background:#8b5cf6"></span>Extremely Rare</div>
  </div>
</div>
<div id="birdsMapStatsBar" class="birds-map-stats-bar" aria-live="polite"></div>`;
    return el;
  }

  /* ─── Self-loading CSS ──────────────────────────────────── */
  function ensureMapCSS() {
    if (document.getElementById('bmp-map-css')) return;
    const link = document.createElement('link');
    link.id   = 'bmp-map-css';
    link.rel  = 'stylesheet';
    link.href = _scriptBase + 'CSS/sighting-map.css';
    document.head.appendChild(link);
  }

  /* ─── Leaflet lazy-load ──────────────────────────────────── */
  function ensureLeafletCSS() {
    if (document.getElementById('bmp-leaflet-css')) return;
    const link = document.createElement('link');
    link.id  = 'bmp-leaflet-css';
    link.rel = 'stylesheet';
    link.href = LEAFLET_CSS_CDN;
    document.head.appendChild(link);
  }

  function loadLeaflet(cb) {
    if (window.L) { cb(); return; }
    ensureLeafletCSS();
    const s   = document.createElement('script');
    s.src     = LEAFLET_JS_CDN;
    s.onload  = cb;
    s.onerror = () => console.error('[SightingMap] Failed to load Leaflet');
    document.head.appendChild(s);
  }

  /* ─── Map init ───────────────────────────────────────────── */
  function initMap() {
    if (leafletMap) {
      setTimeout(() => { leafletMap.invalidateSize(); renderMarkers(); }, 80);
      return;
    }
    const container = document.getElementById('birdsMapLeaflet');
    if (!container || !window.L) return;

    leafletMap  = window.L.map(container, { center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM });
    window.L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 19 }).addTo(leafletMap);
    markerLayer = window.L.layerGroup().addTo(leafletMap);
    renderMarkers();
    leafletReady = true;
  }

  /* ─── Open / Close ───────────────────────────────────────── */
  function openMap() {
    if (!overlayEl) return;
    const ctx = getMapContext();
    const closeBtn = document.getElementById('birdsMapCloseBtn');
    const titleEl = document.querySelector('#birdsMapOverlay .birds-map-title');
    if (closeBtn) closeBtn.textContent = `← Back to ${ctx.labelPlural}`;
    if (titleEl) titleEl.textContent = `🗺️ ${ctx.labelPlural} Map`;
    overlayEl.removeAttribute('hidden');
    // Reliability-first open: force the overlay into an immediately interactive
    // top layer so CTA activation is visually obvious even if animations/styles
    // are delayed by the runtime.
    overlayEl.style.setProperty('pointer-events', 'auto', 'important');
    overlayEl.style.setProperty('z-index', '2147483000', 'important');
    overlayEl.style.setProperty('transform', 'translateY(0)', 'important');
    overlayEl.style.setProperty('opacity', '1', 'important');
    document.body.style.overflow = 'hidden';
    if (closeBtn && typeof closeBtn.focus === 'function') {
      window.requestAnimationFrame(() => closeBtn.focus({ preventScroll: true }));
    }
    loadLeaflet(() => { populateFilters(); initMap(); });
  }

  function closeMap() {
    if (!overlayEl) return;
    overlayEl.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  /* ─── Filter events ──────────────────────────────────────── */
  function bindEvents() {
    const update = () => {
      filters.species  = document.getElementById('birdsMapFilterSpecies')?.value  || 'all';
      filters.habitat  = document.getElementById('birdsMapFilterHabitat')?.value  || 'all';
      filters.rarity   = document.getElementById('birdsMapFilterRarity')?.value   || 'all';
      filters.dateFrom = document.getElementById('birdsMapFilterDateFrom')?.value || '';
      filters.dateTo   = document.getElementById('birdsMapFilterDateTo')?.value   || '';
      ['birdsMapFilterSpecies','birdsMapFilterHabitat','birdsMapFilterRarity'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('active', el.value !== 'all');
      });
      renderMarkers();
    };

    ['birdsMapFilterSpecies','birdsMapFilterHabitat','birdsMapFilterRarity',
     'birdsMapFilterDateFrom','birdsMapFilterDateTo']
      .forEach((id) => document.getElementById(id)?.addEventListener('change', update));

    document.getElementById('birdsMapFilterClear')?.addEventListener('click', () => {
      filters = { species:'all', habitat:'all', rarity:'all', dateFrom:'', dateTo:'' };
      ['birdsMapFilterDateFrom','birdsMapFilterDateTo'].forEach((id) => {
        const el = document.getElementById(id); if (el) el.value = '';
      });
      populateFilters();
      renderMarkers();
    });

    document.getElementById('birdsMapCloseBtn')?.addEventListener('click', closeMap);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlayEl && !overlayEl.hasAttribute('hidden')) closeMap();
    });
  }

  /* ─── Inject Map button ──────────────────────────────────── */
  function getBirdsOverviewActionRow() {
    const activeRow = document.querySelector('#natureChallengePane-birds .nature-birds-view.is-active[data-birds-view="overview"] .nature-explore-cta-actions');
    if (activeRow) return activeRow;
    return document.querySelector('#natureChallengePane-birds .nature-birds-view[data-birds-view="overview"] .nature-explore-cta-actions');
  }

  function setCtaNormalizedMarker(row) {
    if (!row || !row.setAttribute) return;
    if (isCtaNormalizationDebugEnabled()) {
      row.setAttribute('data-cta-normalized', '1');
      return;
    }
    row.removeAttribute('data-cta-normalized');
  }

  function normalizeBirdsActionRailOrder(row) {
    if (!row) return;
    ['birdsExploreBtn', 'birdsOpenLogBtn', 'birdsOpenMapBtn', 'natureChallengeRefreshBtn', 'birdsUndoActionBtn'].forEach((id, idx) => {
      const node = row.querySelector(`#${id}`);
      if (!node) return;
      row.appendChild(node);
      if (node.style && typeof node.style.setProperty === 'function') {
        node.style.setProperty('order', String(idx), 'important');
      } else if (node.style) {
        node.style.order = String(idx);
      }
    });
    setCtaNormalizedMarker(row);
  }

  function mutationTouchesBirdsActionRail(mutation) {
    if (!mutation || mutation.type !== 'childList') return false;
    const target = mutation.target;
    if (target && target.closest && !target.closest('#natureChallengePane-birds .nature-birds-view[data-birds-view="overview"]')) {
      return false;
    }
    const touchesRail = (node) => {
      if (!node || node.nodeType !== 1) return false;
      if (node.matches && node.matches('.nature-explore-cta-actions')) return true;
      if (node.id && /^(birdsExploreBtn|birdsOpenLogBtn|birdsOpenMapBtn|natureChallengeRefreshBtn|birdsUndoActionBtn)$/.test(node.id)) return true;
      return Boolean(node.querySelector && node.querySelector('.nature-explore-cta-actions'));
    };
    const addedNodes = Array.from(mutation.addedNodes || []);
    const removedNodes = Array.from(mutation.removedNodes || []);
    return addedNodes.some(touchesRail) || removedNodes.some(touchesRail);
  }

  function installBirdsActionRailObserver() {
    const pane = document.getElementById('natureChallengePane-birds');
    if (!pane || pane.dataset.mapCtaObserverBound === '1') return;
    pane.dataset.mapCtaObserverBound = '1';

    let pending = false;
    const schedule = () => {
      if (pending) return;
      pending = true;
      const liveRow = getBirdsOverviewActionRow();
      if (liveRow) liveRow.removeAttribute('data-cta-normalized');
      requestAnimationFrame(() => {
        pending = false;
        injectButton();
      });
    };

    const observer = new MutationObserver((mutations) => {
      if (!Array.isArray(mutations) || !mutations.some(mutationTouchesBirdsActionRail)) return;
      schedule();
    });
    observer.observe(pane, { childList: true, subtree: true });
  }

   function injectButton() {
     const actionRow = getBirdsOverviewActionRow();
     const logBtn = (actionRow && actionRow.querySelector('#birdsOpenLogBtn')) || document.getElementById('birdsOpenLogBtn');
     if (!logBtn) return;
     let btn = document.getElementById('birdsOpenMapBtn');
     if (!btn) {
       btn = document.createElement('button');
       btn.id = 'birdsOpenMapBtn';
       btn.type = 'button';
       btn.className = 'nature-explore-birds-btn nature-explore-birds-btn--map';
       btn.title = 'View your sighting locations on a map';
       btn.setAttribute('data-tooltip', 'View your sighting locations on a map');
       btn.setAttribute('data-birds-cta-action', 'map');
       btn.textContent = '🗺️ Map';
       // Don't add direct listener - rely on delegated event handler from nature-challenge-tab-system.js
     }

    const row = actionRow || logBtn.closest('.nature-explore-cta-actions');
    const refreshBtn = row ? row.querySelector('#natureChallengeRefreshBtn') : document.getElementById('natureChallengeRefreshBtn');
    if (row && refreshBtn) {
      row.insertBefore(btn, refreshBtn);
      normalizeBirdsActionRailOrder(row);
      return;
    }
    logBtn.insertAdjacentElement('afterend', btn);
  }

  /* ─── Boot ───────────────────────────────────────────────── */
  function tryInit() {
    if (!document.getElementById('birdsOpenLogBtn')) return false;
    injectButton();
    if (!overlayEl) {
      overlayEl = buildOverlay();
      document.body.appendChild(overlayEl);
      bindEvents();
    }
    installBirdsActionRailObserver();
    return true;
  }

  function boot() {
    ensureMapCSS();
    if (tryInit()) return;
    const obs = new MutationObserver(() => { if (tryInit()) obs.disconnect(); });
    obs.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => obs.disconnect(), 30000);
  }

  /* ─── Public API ─────────────────────────────────────────── */
  window.SightingMap = { open: openMap, close: closeMap, refresh: renderMarkers };

  boot();
})();



