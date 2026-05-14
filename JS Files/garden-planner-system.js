(function () {
  var ROOT_ID = 'gardenPlannerRoot';
  var STORAGE_KEY = 'kapGardenPlannerV1';
  var EXCEL_TABLE_NAME = 'mygarden';
  var WORKBOOK_CANDIDATES = ['garden_planner.xlsx', 'garden_planner.xlsm', 'garden_planner'];
  var PURCHASE_SOURCES = [
    'Carolina Native Plant Nursery',
    'Raymond\'s Garden Center',
    'Sow True Seed',
    'Ace Hardware',
    'Tractor Supply',
    'Ollies Bargain Bin',
    'Already on property',
    'Custom'
  ];

  var state = {
    plants: [],
    editingId: '',
    detailId: '',
    dirty: false,
    syncing: false,
    workbookPath: '',
    lastSyncedAt: 0,
    lastSyncError: ''
  };

  function getRoot() { return document.getElementById(ROOT_ID); }
  function uid() { return 'plant_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8); }
  function splitLines(v) { return String(v || '').split(/\n+/).map(function (x) { return x.trim(); }).filter(Boolean); }
  function joinLines(arr) { return Array.isArray(arr) ? arr.join('\n') : ''; }
  function yn(v) { var n = String(v || '').trim().toLowerCase(); return n === 'yes' || n === 'true' ? 'Yes' : (n === 'no' || n === 'false' ? 'No' : ''); }
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (m) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' })[m]; }); }
  function normalizeColumnName(name) { return String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, ''); }
  function toIsoNow() { return new Date().toISOString(); }

  var COLUMN_ALIAS_TO_FIELD = {
    plantnamecommon: 'commonName',
    scientificname: 'scientificName',
    nativetonc: 'nativeToNc',
    nativetohendersoncounty: 'nativeToHenderson',
    perennialorannual: 'lifeCycle',
    sunrequirement: 'sunRequirement',
    deerresistant: 'deerResistant',
    butterflyhostyesorno: 'butterflyHost',
    butterflyspeciesplantisahost: 'butterflyHostSpecies',
    supportsspecialistbeesyesorno: 'supportsSpecialistBees',
    specializedbeespeciesplantsupports: 'specialistBeeSpecies',
    supportsdragonfliesyesorno: 'supportsDragonflies',
    supportshoverfliesorflowerfliesyesorno: 'supportsHoverflies',
    supportsmothsyesorno: 'supportsMoths',
    mothspeciessupported: 'mothSpeciesSupported',
    supportsbirdsyesorno: 'supportsBirds',
    birdspeciestheplantsupports: 'birdSpeciesSupported',
    besttimetoplantseed: 'bestTimeSeed',
    bloomseasons: 'bloomSeasons',
    bloommonths: 'bloomMonths',
    propagationmethod: 'propagationMethod',
    toxictohumansyesorno: 'toxicHumans',
    toxictodogsorcatsyesorno: 'toxicPets',
    startedfromseedyesorno: 'startedFromSeed',
    wherepurchased: 'wherePurchased',
    photos: 'photos',
    notes: 'notes',
    informationalurls: 'informationalUrls',
    locationplanted: 'locationPlanted',
    butterflyspeciesseenonplant: 'butterflySpeciesSeen',
    beespeciesseenonplant: 'beeSpeciesSeen',
    otherinsectspeciesseenonplant: 'otherInsectSpeciesSeen',
    birdspeciesseenontheplant: 'birdSpeciesSeen',
    deerseeneatingtheplantyesorno: 'deerSeenEating',
    rabbitsseeneatingtheplantyesorno: 'rabbitsSeenEating',
    coldresistance: 'coldResistance',
    seedharvestmethod: 'seedHarvestMethod',
    selfpropagation: 'selfPropagation',
    startedfromliveplantyesorno: 'startedFromLivePlant',
    alreadyonproperty: 'alreadyOnProperty',
    purchasesourcecustom: 'purchaseSourceCustom',
    id: 'id',
    createdat: 'createdAt',
    updatedat: 'updatedAt'
  };

  var FIELD_TO_DEFAULT_COLUMN = {
    id: 'id', createdAt: 'created_at', updatedAt: 'updated_at',
    commonName: 'plant name (common)', scientificName: 'scientific name', nativeToNc: 'native to NC', nativeToHenderson: 'native to Henderson county', lifeCycle: 'perennial or annual', sunRequirement: 'sun requirement', deerResistant: 'deer resistant', butterflyHost: 'butterfly host (yes or no)', butterflyHostSpecies: 'butterfly species plant is a host', supportsSpecialistBees: 'supports specialist bees (yes or no)', specialistBeeSpecies: 'specialized bee species plant supports', supportsDragonflies: 'supports dragonflies (yes or no)', supportsHoverflies: 'supports hover flies or flower flies (yes or no)', supportsMoths: 'supports moths, (yes or no)', mothSpeciesSupported: 'moth species supported', supportsBirds: 'supports birds (yes or no)', birdSpeciesSupported: 'bird species the plant supports', bestTimeSeed: 'best time to plant seed', bloomSeasons: 'bloom seasons', bloomMonths: 'bloom months', propagationMethod: 'propagation method', toxicHumans: 'toxic to humans (yes or no)', toxicPets: 'toxic to dogs or cats (yes or no)', startedFromSeed: 'started from seed (yes or no)', wherePurchased: 'where purchased', photos: 'photos', notes: 'notes', informationalUrls: 'informational urls', locationPlanted: 'location planted', butterflySpeciesSeen: 'butterfly species seen on plant', beeSpeciesSeen: 'bee species seen on plant', otherInsectSpeciesSeen: 'other insect species seen on plant', birdSpeciesSeen: 'bird species seen on the plant', deerSeenEating: 'deer seen eating the plant (yes or no)', rabbitsSeenEating: 'rabbits seen eating the plant (yes or no)', coldResistance: 'cold resistance', seedHarvestMethod: 'seed harvest method', selfPropagation: 'self propagation', startedFromLivePlant: 'started from live plant (yes or no)', alreadyOnProperty: 'already on property', purchaseSourceCustom: 'purchase source custom'
  };

  function normalizePlant(raw) {
    raw = raw || {};
    return {
      id: String(raw.id || uid()),
      commonName: String(raw.commonName || '').trim(),
      scientificName: String(raw.scientificName || '').trim(),
      nativeToNc: yn(raw.nativeToNc),
      nativeToHenderson: yn(raw.nativeToHenderson),
      lifeCycle: String(raw.lifeCycle || '').trim(),
      sunRequirement: String(raw.sunRequirement || '').trim(),
      deerResistant: yn(raw.deerResistant),
      butterflyHost: yn(raw.butterflyHost),
      butterflyHostSpecies: splitLines(raw.butterflyHostSpecies),
      supportsSpecialistBees: yn(raw.supportsSpecialistBees),
      specialistBeeSpecies: splitLines(raw.specialistBeeSpecies),
      supportsDragonflies: yn(raw.supportsDragonflies),
      supportsHoverflies: yn(raw.supportsHoverflies),
      supportsMoths: yn(raw.supportsMoths),
      mothSpeciesSupported: splitLines(raw.mothSpeciesSupported),
      supportsBirds: yn(raw.supportsBirds),
      birdSpeciesSupported: splitLines(raw.birdSpeciesSupported),
      bestTimeSeed: String(raw.bestTimeSeed || '').trim(),
      bloomSeasons: String(raw.bloomSeasons || '').trim(),
      bloomMonths: String(raw.bloomMonths || '').trim(),
      propagationMethod: String(raw.propagationMethod || '').trim(),
      selfPropagation: String(raw.selfPropagation || '').trim(),
      toxicHumans: yn(raw.toxicHumans),
      toxicPets: yn(raw.toxicPets),
      startedFromSeed: yn(raw.startedFromSeed),
      startedFromLivePlant: yn(raw.startedFromLivePlant),
      wherePurchased: String(raw.wherePurchased || '').trim(),
      purchaseSourceCustom: String(raw.purchaseSourceCustom || '').trim(),
      alreadyOnProperty: yn(raw.alreadyOnProperty),
      photos: splitLines(raw.photos),
      notes: splitLines(raw.notes),
      informationalUrls: splitLines(raw.informationalUrls),
      locationPlanted: String(raw.locationPlanted || '').trim(),
      butterflySpeciesSeen: splitLines(raw.butterflySpeciesSeen),
      beeSpeciesSeen: splitLines(raw.beeSpeciesSeen),
      otherInsectSpeciesSeen: splitLines(raw.otherInsectSpeciesSeen),
      birdSpeciesSeen: splitLines(raw.birdSpeciesSeen),
      deerSeenEating: yn(raw.deerSeenEating),
      rabbitsSeenEating: yn(raw.rabbitsSeenEating),
      coldResistance: String(raw.coldResistance || '').trim(),
      seedHarvestMethod: String(raw.seedHarvestMethod || '').trim(),
      createdAt: String(raw.createdAt || toIsoNow()),
      updatedAt: String(raw.updatedAt || toIsoNow())
    };
  }

  function saveLocal() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      plants: state.plants,
      dirty: state.dirty,
      lastSyncedAt: state.lastSyncedAt,
      workbookPath: state.workbookPath
    }));
  }

  function loadLocal() {
    try {
      var parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      state.plants = Array.isArray(parsed.plants) ? parsed.plants.map(normalizePlant) : [];
      state.dirty = !!parsed.dirty;
      state.lastSyncedAt = Number(parsed.lastSyncedAt || 0) || 0;
      state.workbookPath = String(parsed.workbookPath || '');
    } catch (_error) {
      state.plants = [];
    }
  }

  function updateSyncStatus(message, kind) {
    var el = getRoot().querySelector('#gardenSyncStatus');
    if (!el) return;
    el.className = 'garden-status ' + (kind || 'local');
    el.textContent = message;
  }

  function syncStatusFromState() {
    if (state.syncing) {
      updateSyncStatus('Sync in progress...', 'local');
      return;
    }
    if (state.lastSyncError) {
      updateSyncStatus(state.lastSyncError, 'error');
      return;
    }
    if (!window.accessToken) {
      updateSyncStatus('Local only: sign in to sync Garden data to Excel.', 'local');
      return;
    }
    if (state.dirty) {
      updateSyncStatus('Local changes pending sync to Excel backend.', 'local');
      return;
    }
    if (state.lastSyncedAt) {
      updateSyncStatus('Synced with Excel at ' + new Date(state.lastSyncedAt).toLocaleString() + '.', 'synced');
    } else {
      updateSyncStatus('Ready to sync Garden data to Excel backend.', 'local');
    }
  }

  function gardenToast(message, type, duration) {
    if (window.showToast) window.showToast(message, type || 'success', duration || 2500);
  }

  function readGardenFilters(root) {
    root = root || getRoot();
    if (!root) return {};
    return {
      search: String(root.querySelector('#gardenSearchFilter')?.value || '').trim(),
      bloom: String(root.querySelector('#gardenBloomRangeFilter')?.value || '').trim(),
      host: String(root.querySelector('#gardenHostFilter')?.value || '').trim(),
      bee: String(root.querySelector('#gardenBeeFilter')?.value || '').trim(),
      bird: String(root.querySelector('#gardenBirdFilter')?.value || '').trim()
    };
  }

  function clearGardenFilters(root) {
    root = root || getRoot();
    if (!root) return;
    ['#gardenSearchFilter', '#gardenBloomRangeFilter', '#gardenHostFilter', '#gardenBeeFilter', '#gardenBirdFilter'].forEach(function (selector) {
      var el = root.querySelector(selector);
      if (!el) return;
      el.value = '';
    });
    renderCards();
  }

  function renderGardenListSummary(root, filteredCount, totalCount, filters) {
    root = root || getRoot();
    if (!root) return;
    var summary = root.querySelector('#gardenListSummary');
    var chips = root.querySelector('#gardenActiveFilters');
    if (!summary || !chips) return;

    var active = [];
    if (filters.search) {
      active.push({ key: 'gardenSearchFilter', label: 'Search: “' + filters.search + '”' });
    }
    if (filters.bloom) {
      active.push({ key: 'gardenBloomRangeFilter', label: 'Bloom: ' + filters.bloom });
    }
    if (filters.host) {
      active.push({ key: 'gardenHostFilter', label: 'Butterfly host: ' + filters.host });
    }
    if (filters.bee) {
      active.push({ key: 'gardenBeeFilter', label: 'Specialist bees: ' + filters.bee });
    }
    if (filters.bird) {
      active.push({ key: 'gardenBirdFilter', label: 'Birds: ' + filters.bird });
    }

    summary.innerHTML = '<div class="garden-list-summary-top">'
      + '<span class="garden-list-summary-count">' + filteredCount + ' plant' + (filteredCount !== 1 ? 's' : '') + ' shown</span>'
      + '<span class="garden-inline-note">' + totalCount + ' total plant' + (totalCount !== 1 ? 's' : '') + '</span>'
      + '</div>';

    if (!active.length) {
      chips.innerHTML = '<span class="garden-filter-chip reset">All plants</span>';
      return;
    }

    chips.innerHTML = active.map(function (item) {
      return '<span class="garden-filter-chip">' + esc(item.label)
        + '<button type="button" aria-label="Remove filter" data-filter-clear="' + esc(item.key) + '">×</button></span>';
    }).join('')
      + '<button type="button" class="garden-btn" style="padding:4px 10px;font-size:12px;" data-garden-action="clear-filters">Reset filters</button>';
  }

  function renderCards() {
    var root = getRoot();
    var host = root.querySelector('#gardenCards');
    var filters = readGardenFilters(root);
    var search = String(filters.search || '').toLowerCase();
    var bloom = String(filters.bloom || '').toLowerCase();
    var hostFilter = String(filters.host || '').toLowerCase();
    var beeFilter = String(filters.bee || '').toLowerCase();
    var birdFilter = String(filters.bird || '').toLowerCase();

    var filtered = state.plants.filter(function (plant) {
      var hay = [plant.commonName, plant.scientificName, plant.locationPlanted, joinLines(plant.notes), joinLines(plant.birdSpeciesSupported), joinLines(plant.specialistBeeSpecies), joinLines(plant.butterflyHostSpecies)].join(' ').toLowerCase();
      if (search && hay.indexOf(search) < 0) return false;
      if (bloom && String(plant.bloomSeasons || '').toLowerCase().indexOf(bloom) < 0 && String(plant.bloomMonths || '').toLowerCase().indexOf(bloom) < 0) return false;
      if (hostFilter && String(plant.butterflyHost || '').toLowerCase() !== hostFilter) return false;
      if (beeFilter && String(plant.supportsSpecialistBees || '').toLowerCase() !== beeFilter) return false;
      if (birdFilter && String(plant.supportsBirds || '').toLowerCase() !== birdFilter) return false;
      return true;
    });

    renderGardenListSummary(root, filtered.length, state.plants.length, filters);

    if (!state.plants.length) {
      host.innerHTML = '<div class="garden-empty">'
        + '<strong>No plants yet.</strong>'
        + '<p style="margin:6px 0 0;">Add your first plant to start tracking locations, bloom time, and wildlife visits.</p>'
        + '<div style="margin-top:10px;"><button type="button" class="garden-btn primary" data-garden-action="edit" data-plant-id="">+ Add Plant</button></div>'
        + '</div>';
      return;
    }

    if (!filtered.length) {
      host.innerHTML = '<div class="garden-empty">'
        + '<strong>No plants match your current filters.</strong>'
        + '<p style="margin:6px 0 0;">Try removing one filter or resetting them all to see more plants.</p>'
        + '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:10px;">'
        + '<button type="button" class="garden-btn primary" data-garden-action="clear-filters">Reset filters</button>'
        + '</div></div>';
      return;
    }

    host.innerHTML = filtered.map(function (plant) {
      var tags = [plant.lifeCycle, plant.sunRequirement, plant.nativeToNc ? ('Native NC: ' + plant.nativeToNc) : '', plant.nativeToHenderson ? ('Native Henderson: ' + plant.nativeToHenderson) : '', plant.bloomSeasons ? ('Bloom: ' + plant.bloomSeasons) : ''].filter(Boolean);
      return '<article class="garden-card" data-plant-id="' + esc(plant.id) + '">'
        + '<h3>' + esc(plant.commonName || 'Untitled plant') + '</h3>'
        + (plant.scientificName ? '<p><em>' + esc(plant.scientificName) + '</em></p>' : '')
        + (plant.locationPlanted ? '<p>Location: ' + esc(plant.locationPlanted) + '</p>' : '')
        + '<div class="garden-card-tags">' + tags.map(function (t) { return '<span class="garden-pill">' + esc(t) + '</span>'; }).join('') + '</div>'
        + '<div class="garden-card-actions">'
        + '<button type="button" class="garden-btn" data-garden-action="details" data-plant-id="' + esc(plant.id) + '">Details</button>'
        + '<button type="button" class="garden-btn" data-garden-action="edit" data-plant-id="' + esc(plant.id) + '">Edit</button>'
        + '</div>'
        + '</article>';
    }).join('');
    if (window.kapGardenHooks && typeof window.kapGardenHooks.afterRenderCards === 'function') {
      window.kapGardenHooks.afterRenderCards(filtered);
    }
  }

  function openEditor(plantId) {
    var root = getRoot();
    var form = root.querySelector('#gardenEditorForm');
    state.editingId = String(plantId || '');
    var existing = state.plants.find(function (p) { return p.id === state.editingId; });
    form.reset();
    if (existing) {
      Object.keys(existing).forEach(function (key) {
        var field = form.elements[key];
        if (!field) return;
        if (Array.isArray(existing[key])) field.value = joinLines(existing[key]);
        else field.value = existing[key] || '';
      });
      root.querySelector('#gardenEditorTitle').textContent = 'Edit Plant';
    } else {
      root.querySelector('#gardenEditorTitle').textContent = 'Add Plant';
    }
    root.querySelector('#gardenEditorBackdrop').classList.add('open');
    root.querySelector('#gardenEditorBackdrop').setAttribute('aria-hidden', 'false');
  }

  function closeEditor() {
    var root = getRoot();
    root.querySelector('#gardenEditorBackdrop').classList.remove('open');
    root.querySelector('#gardenEditorBackdrop').setAttribute('aria-hidden', 'true');
    state.editingId = '';
  }

  function openDetails(plantId) {
    var root = getRoot();
    var plant = state.plants.find(function (p) { return p.id === plantId; });
    if (!plant) return;
    var rows = [
      ['Plant', plant.commonName], ['Scientific name', plant.scientificName], ['Location', plant.locationPlanted], ['Life cycle', plant.lifeCycle], ['Native to NC', plant.nativeToNc], ['Native to Henderson county', plant.nativeToHenderson],
      ['Sun requirement', plant.sunRequirement], ['Best seed time', plant.bestTimeSeed], ['Bloom seasons', plant.bloomSeasons], ['Bloom months', plant.bloomMonths], ['Bee species supported', joinLines(plant.specialistBeeSpecies)], ['Butterfly species supported', joinLines(plant.butterflyHostSpecies)],
      ['Bird species supported', joinLines(plant.birdSpeciesSupported)], ['Supports dragonflies', plant.supportsDragonflies], ['Supports hover flies', plant.supportsHoverflies], ['Deer resistant', plant.deerResistant], ['Propagation method', plant.propagationMethod], ['Self propagation', plant.selfPropagation],
      ['Toxic to humans', plant.toxicHumans], ['Toxic to dogs/cats', plant.toxicPets], ['Cold resistance', plant.coldResistance], ['Seed harvest method', plant.seedHarvestMethod], ['Purchase source', plant.wherePurchased === 'Custom' ? (plant.purchaseSourceCustom || 'Custom') : plant.wherePurchased],
      ['Informational URLs', joinLines(plant.informationalUrls)], ['Photos', joinLines(plant.photos)], ['Notes', joinLines(plant.notes)], ['Insects seen', joinLines(plant.otherInsectSpeciesSeen)], ['Butterflies seen', joinLines(plant.butterflySpeciesSeen)], ['Bees seen', joinLines(plant.beeSpeciesSeen)],
      ['Birds seen', joinLines(plant.birdSpeciesSeen)], ['Deer seen eating', plant.deerSeenEating], ['Rabbits seen eating', plant.rabbitsSeenEating]
    ].filter(function (pair) { return String(pair[1] || '').trim(); });
    root.querySelector('#gardenDetailContent').innerHTML = rows.map(function (pair) { return '<div class="garden-detail-row"><strong>' + esc(pair[0]) + '</strong><span>' + esc(pair[1]) + '</span></div>'; }).join('');
    root.querySelector('#gardenDetailBackdrop').classList.add('open');
    root.querySelector('#gardenDetailBackdrop').setAttribute('aria-hidden', 'false');
    if (window.kapGardenHooks && typeof window.kapGardenHooks.afterOpenDetails === 'function') {
      window.kapGardenHooks.afterOpenDetails(plant);
    }
  }

  function closeDetails() {
    var root = getRoot();
    root.querySelector('#gardenDetailBackdrop').classList.remove('open');
    root.querySelector('#gardenDetailBackdrop').setAttribute('aria-hidden', 'true');
  }

  function readFormPlant() {
    var root = getRoot();
    var form = root.querySelector('#gardenEditorForm');
    var model = {
      id: state.editingId || uid(),
      commonName: form.elements.commonName.value,
      scientificName: form.elements.scientificName.value,
      nativeToNc: form.elements.nativeToNc.value,
      nativeToHenderson: form.elements.nativeToHenderson.value,
      lifeCycle: form.elements.lifeCycle.value,
      sunRequirement: form.elements.sunRequirement.value,
      deerResistant: form.elements.deerResistant.value,
      butterflyHost: form.elements.butterflyHost.value,
      butterflyHostSpecies: form.elements.butterflyHostSpecies.value,
      supportsSpecialistBees: form.elements.supportsSpecialistBees.value,
      specialistBeeSpecies: form.elements.specialistBeeSpecies.value,
      supportsDragonflies: form.elements.supportsDragonflies.value,
      supportsHoverflies: form.elements.supportsHoverflies.value,
      supportsMoths: form.elements.supportsMoths.value,
      mothSpeciesSupported: form.elements.mothSpeciesSupported.value,
      supportsBirds: form.elements.supportsBirds.value,
      birdSpeciesSupported: form.elements.birdSpeciesSupported.value,
      bestTimeSeed: form.elements.bestTimeSeed.value,
      bloomSeasons: form.elements.bloomSeasons.value,
      bloomMonths: form.elements.bloomMonths.value,
      propagationMethod: form.elements.propagationMethod.value,
      selfPropagation: form.elements.selfPropagation.value,
      toxicHumans: form.elements.toxicHumans.value,
      toxicPets: form.elements.toxicPets.value,
      startedFromSeed: form.elements.startedFromSeed.value,
      startedFromLivePlant: form.elements.startedFromLivePlant.value,
      wherePurchased: form.elements.wherePurchased.value,
      purchaseSourceCustom: form.elements.purchaseSourceCustom.value,
      alreadyOnProperty: form.elements.alreadyOnProperty.value,
      photos: form.elements.photos.value,
      notes: form.elements.notes.value,
      informationalUrls: form.elements.informationalUrls.value,
      locationPlanted: form.elements.locationPlanted.value,
      butterflySpeciesSeen: form.elements.butterflySpeciesSeen.value,
      beeSpeciesSeen: form.elements.beeSpeciesSeen.value,
      otherInsectSpeciesSeen: form.elements.otherInsectSpeciesSeen.value,
      birdSpeciesSeen: form.elements.birdSpeciesSeen.value,
      deerSeenEating: form.elements.deerSeenEating.value,
      rabbitsSeenEating: form.elements.rabbitsSeenEating.value,
      coldResistance: form.elements.coldResistance.value,
      seedHarvestMethod: form.elements.seedHarvestMethod.value,
      createdAt: toIsoNow(),
      updatedAt: toIsoNow()
    };
    return normalizePlant(model);
  }

  function _doSavePlant(plant) {
    var idx = state.plants.findIndex(function (p) { return p.id === plant.id; });
    if (idx >= 0) {
      plant.createdAt = state.plants[idx].createdAt || plant.createdAt;
      state.plants[idx] = plant;
    } else {
      state.plants.unshift(plant);
    }
    state.dirty = true;
    state.lastSyncError = '';
    saveLocal();
    renderCards();
    syncStatusFromState();
    closeEditor();
    gardenToast('Plant saved', 'success');
  }

  function savePlantFromEditor(event) {
    event.preventDefault();
    var plant = readFormPlant();
    if (!plant.commonName) return;
    if (window.kapGardenHooks && typeof window.kapGardenHooks.beforeSavePlant === 'function') {
      var hookResult = window.kapGardenHooks.beforeSavePlant(plant, function () { _doSavePlant(plant); });
      if (hookResult === false) return;
    }
    _doSavePlant(plant);
  }

  function encodeGraphPath(path) {
    return String(path || '').split('/').map(function (part) { return encodeURIComponent(part); }).join('/');
  }

  async function graphFetchJson(url, options) {
    var token = String(window.accessToken || '').trim();
    if (!token) throw new Error('Sign in required for Excel sync. Data remains local only.');
    options = options || {};
    var headers = Object.assign({ Authorization: 'Bearer ' + token }, options.headers || {});
    if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
    var response = await fetch(url, Object.assign({}, options, { headers: headers }));
    if (!response.ok) {
      var text = await response.text();
      throw new Error('Excel sync failed (' + response.status + '): ' + text.slice(0, 140));
    }
    if (response.status === 204) return {};
    return response.json();
  }

  async function resolveWorkbookPath() {
    if (state.workbookPath) return state.workbookPath;
    for (var i = 0; i < WORKBOOK_CANDIDATES.length; i += 1) {
      var candidate = WORKBOOK_CANDIDATES[i];
      try {
        await graphFetchJson('https://graph.microsoft.com/v1.0/me/drive/root:/' + encodeGraphPath(candidate));
        state.workbookPath = candidate;
        return state.workbookPath;
      } catch (_error) {
        // Continue search.
      }
    }
    var search = await graphFetchJson('https://graph.microsoft.com/v1.0/me/drive/root/search(q=\'garden_planner\')?$select=name,parentReference');
    var list = Array.isArray(search.value) ? search.value : [];
    var match = list.find(function (item) { return String(item.name || '').toLowerCase().indexOf('garden_planner') >= 0; });
    if (!match || !match.parentReference) throw new Error('Could not find workbook named garden_planner.');
    var parent = String(match.parentReference.path || '').replace('/drive/root:', '').replace(/^\/+/, '');
    state.workbookPath = parent ? (parent + '/' + match.name) : match.name;
    return state.workbookPath;
  }

  function plantFromExcelRow(headers, values) {
    var row = {};
    headers.forEach(function (headerName, idx) {
      var alias = normalizeColumnName(headerName);
      var field = COLUMN_ALIAS_TO_FIELD[alias];
      if (!field) return;
      row[field] = values[idx];
    });
    return normalizePlant(row);
  }

  function plantToExcelRow(plant, headers) {
    return headers.map(function (headerName) {
      var alias = normalizeColumnName(headerName);
      var field = COLUMN_ALIAS_TO_FIELD[alias] || COLUMN_ALIAS_TO_FIELD[normalizeColumnName(FIELD_TO_DEFAULT_COLUMN[alias] || '')];
      var key = field || COLUMN_ALIAS_TO_FIELD[alias];
      var value = key ? plant[key] : '';
      if (Array.isArray(value)) return value.join('\n');
      return value == null ? '' : value;
    });
  }

  async function syncFromExcel() {
    state.syncing = true;
    state.lastSyncError = '';
    syncStatusFromState();
    try {
      var path = await resolveWorkbookPath();
      var encoded = encodeGraphPath(path);
      var tableRef = encodeURIComponent(EXCEL_TABLE_NAME);
      var columnsResp = await graphFetchJson('https://graph.microsoft.com/v1.0/me/drive/root:/' + encoded + ':/workbook/tables/' + tableRef + '/columns?$select=name,index');
      var rowsResp = await graphFetchJson('https://graph.microsoft.com/v1.0/me/drive/root:/' + encoded + ':/workbook/tables/' + tableRef + '/rows?$top=5000');
      var columns = (columnsResp.value || []).slice().sort(function (a, b) { return Number(a.index || 0) - Number(b.index || 0); });
      var headers = columns.map(function (c) { return String(c.name || ''); });
      state.plants = (rowsResp.value || []).map(function (row) {
        var values = row && row.values && row.values[0] ? row.values[0] : [];
        return plantFromExcelRow(headers, values);
      });
      state.dirty = false;
      state.lastSyncedAt = Date.now();
      saveLocal();
      renderCards();
      if (window.kapGardenHooks && typeof window.kapGardenHooks.afterExcelSync === 'function') {
        window.kapGardenHooks.afterExcelSync(state.plants.slice());
      }
      gardenToast('Synced successfully', 'success');
    } catch (error) {
      state.lastSyncError = error && error.message ? error.message : 'Failed to sync from Excel.';
    } finally {
      state.syncing = false;
      syncStatusFromState();
    }
  }

  async function syncToExcel() {
    if (window.kapGardenHooks && typeof window.kapGardenHooks.beforeSyncToExcel === 'function') {
      var mayProceed = window.kapGardenHooks.beforeSyncToExcel();
      if (mayProceed instanceof Promise) { mayProceed = await mayProceed; }
      if (mayProceed === false) return;
    }
    state.syncing = true;
    state.lastSyncError = '';
    syncStatusFromState();
    try {
      var path = await resolveWorkbookPath();
      var encoded = encodeGraphPath(path);
      var tableRef = encodeURIComponent(EXCEL_TABLE_NAME);
      var columnsResp = await graphFetchJson('https://graph.microsoft.com/v1.0/me/drive/root:/' + encoded + ':/workbook/tables/' + tableRef + '/columns?$select=name,index');
      var columns = (columnsResp.value || []).slice().sort(function (a, b) { return Number(a.index || 0) - Number(b.index || 0); });
      var headers = columns.map(function (c) { return String(c.name || ''); });
      await graphFetchJson('https://graph.microsoft.com/v1.0/me/drive/root:/' + encoded + ':/workbook/tables/' + tableRef + '/rows/clear', { method: 'POST' });
      var values = state.plants.map(function (plant) { return plantToExcelRow(plant, headers); });
      if (values.length) {
        await graphFetchJson('https://graph.microsoft.com/v1.0/me/drive/root:/' + encoded + ':/workbook/tables/' + tableRef + '/rows/add', {
          method: 'POST',
          body: JSON.stringify({ values: values })
        });
      }
      state.dirty = false;
      state.lastSyncedAt = Date.now();
      saveLocal();
      gardenToast('Synced successfully', 'success');
    } catch (error) {
      state.lastSyncError = error && error.message ? error.message : 'Failed to sync to Excel.';
    } finally {
      state.syncing = false;
      syncStatusFromState();
    }
  }

  function bindEvents() {
    var root = getRoot();
    root.querySelector('#gardenAddPlantBtn').addEventListener('click', function () { openEditor(''); });
    root.querySelector('#gardenCancelEditorBtn').addEventListener('click', closeEditor);
    root.querySelector('#gardenCloseDetailBtn').addEventListener('click', closeDetails);
    root.querySelector('#gardenEditorForm').addEventListener('submit', savePlantFromEditor);
    root.querySelector('#gardenSyncFromExcelBtn').addEventListener('click', syncFromExcel);
    root.querySelector('#gardenSyncToExcelBtn').addEventListener('click', syncToExcel);
    ['#gardenSearchFilter', '#gardenBloomRangeFilter', '#gardenHostFilter', '#gardenBeeFilter', '#gardenBirdFilter'].forEach(function (selector) {
      root.querySelector(selector).addEventListener('input', renderCards);
      root.querySelector(selector).addEventListener('change', renderCards);
    });
    root.querySelector('#gardenCards').addEventListener('click', function (event) {
      var target = event.target.closest('[data-garden-action]');
      if (!target) return;
      var action = target.getAttribute('data-garden-action');
      var plantId = target.getAttribute('data-plant-id');
      if (action === 'clear-filters') clearGardenFilters(root);
      if (action === 'details') openDetails(plantId);
      if (action === 'edit') openEditor(plantId);
    });

    var filterChipHost = root.querySelector('#gardenActiveFilters');
    if (filterChipHost) {
      filterChipHost.addEventListener('click', function (event) {
        var clearBtn = event.target.closest('[data-filter-clear]');
        if (!clearBtn) return;
        var filterId = clearBtn.getAttribute('data-filter-clear');
        var el = root.querySelector('#' + filterId);
        if (el) el.value = '';
        renderCards();
        return;
      });
      filterChipHost.addEventListener('click', function (event) {
        var resetBtn = event.target.closest('[data-garden-action="clear-filters"]');
        if (!resetBtn) return;
        clearGardenFilters(root);
      });
    }
  }

  function populatePurchaseSources() {
    var select = getRoot().querySelector('#gardenPurchaseSourceSelect');
    if (!select) return;
    select.innerHTML = '<option value="">Select source</option>' + PURCHASE_SOURCES.map(function (item) {
      return '<option value="' + esc(item) + '">' + esc(item) + '</option>';
    }).join('');
  }

  function init() {
    var root = getRoot();
    if (!root || root.dataset.gardenInit === 'true') return;
    root.dataset.gardenInit = 'true';
    window.kapGardenHooks = window.kapGardenHooks || {};
    loadLocal();
    populatePurchaseSources();
    bindEvents();
    renderCards();
    syncStatusFromState();
  }

  window.initGardenTab = init;

  window.kapGarden = {
    get state() { return state; },
    renderCards: renderCards,
    openEditor: openEditor,
    openDetails: openDetails,
    saveLocal: saveLocal,
    normalizePlant: normalizePlant,
    uid: uid,
    esc: esc,
    joinLines: joinLines,
    splitLines: splitLines
  };
})();

