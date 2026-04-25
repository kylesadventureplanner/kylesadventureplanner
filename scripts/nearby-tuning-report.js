#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DEMO_PATH = path.join(ROOT, 'nearby-attractions-demo.html');
const SPEC_PATH = path.join(ROOT, 'tests', 'adventure-explorer-inpane-details.spec.js');

const CATEGORY_MAP = {
  all: ['*'],
  food: ['restaurant', 'cafe', 'bar', 'night_club', 'bakery', 'food', 'meal_takeaway', 'meal_delivery', 'brewery'],
  nature: ['park', 'campground', 'natural_feature', 'zoo', 'aquarium', 'trail', 'hiking', 'outdoors', 'garden'],
  family: ['zoo', 'aquarium', 'museum', 'movie_theater', 'park', 'amusement_park', 'playground', 'family'],
  nightlife: ['bar', 'night_club', 'restaurant', 'music_venue', 'concert_hall', 'event_venue', 'entertainment'],
  culture: ['museum', 'art_gallery', 'library', 'landmark', 'monument', 'theater', 'tourist_attraction', 'historic_site'],
  shopping: ['shopping_mall', 'store', 'department_store', 'supermarket', 'market']
};

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function safeEvalLiteral(literalText) {
  const sanitized = String(literalText || '').trim().replace(/;\s*$/, '');
  // Evaluate trusted repo literals only; this script never executes user input.
  // eslint-disable-next-line no-new-func
  return new Function(`return (${sanitized});`)();
}

function parseDemoLocations() {
  if (!fs.existsSync(DEMO_PATH)) return [];
  const html = readText(DEMO_PATH);
  const match = html.match(/const\s+sampleAppLocations\s*=\s*(\[[\s\S]*?\n\s*]);/m);
  if (!match) return [];
  const arr = safeEvalLiteral(match[1]);
  return Array.isArray(arr) ? arr : [];
}

function parseSpecRows() {
  if (!fs.existsSync(SPEC_PATH)) return [];
  const js = readText(SPEC_PATH);
  const match = js.match(/const\s+MOCK_EXPLORER_TABLE\s*=\s*(\{[\s\S]*?\n\s*};)/m);
  if (!match) return [];
  const table = safeEvalLiteral(match[1]);
  const values = table && Array.isArray(table.values) ? table.values : [];
  if (values.length < 2) return [];

  const header = values[0].map((h) => String(h || '').trim().toLowerCase());
  const idxName = header.indexOf('name');
  const idxTags = header.indexOf('tags');
  const idxDesc = header.indexOf('description');
  const out = [];

  for (let i = 1; i < values.length; i += 1) {
    const row = Array.isArray(values[i]) ? values[i] : [];
    const tags = String(idxTags >= 0 ? row[idxTags] : '').trim();
    const firstTag = tags.split(/[;,]/).map((t) => t.trim().toLowerCase()).filter(Boolean)[0] || 'location';
    out.push({
      name: String(idxName >= 0 ? row[idxName] : '').trim(),
      type: firstTag,
      tags,
      description: String(idxDesc >= 0 ? row[idxDesc] : '').trim()
    });
  }
  return out;
}

function inferCategory(loc) {
  const bag = [
    String(loc.type || '').toLowerCase(),
    String(loc.tags || '').toLowerCase(),
    String(loc.name || '').toLowerCase(),
    String(loc.description || '').toLowerCase()
  ].join(' ');

  for (const [category, terms] of Object.entries(CATEGORY_MAP)) {
    if (category === 'all') continue;
    if (terms.some((term) => bag.includes(String(term).toLowerCase()))) {
      return category;
    }
  }
  return 'all';
}

function toCountMap(items) {
  const map = new Map();
  items.forEach((item) => {
    const key = String(item || '').trim().toLowerCase() || 'unknown';
    map.set(key, (map.get(key) || 0) + 1);
  });
  return map;
}

function topEntries(map, limit = 12) {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

function pct(part, total) {
  if (!total) return '0.0%';
  return `${((part / total) * 100).toFixed(1)}%`;
}

function buildRecommendedWeights(stats) {
  const total = stats.total;
  const localShare = total ? stats.localCount / total : 0.5;
  const hasRatingsShare = total ? stats.ratingCount / total : 0.5;

  // Keep in-app and distance strong; reduce rating if sparse.
  const existsInApp = 0.34 + (localShare > 0.5 ? 0.03 : 0);
  const distance = 0.26 + (localShare < 0.4 ? 0.02 : 0);
  const local = 0.20 + (localShare > 0.6 ? 0.02 : 0);
  const google = 0.11;
  const rating = hasRatingsShare > 0.6 ? 0.09 : 0.06;

  const sum = existsInApp + distance + local + google + rating;
  return {
    local: Number((local / sum).toFixed(3)),
    google: Number((google / sum).toFixed(3)),
    existsInApp: Number((existsInApp / sum).toFixed(3)),
    distance: Number((distance / sum).toFixed(3)),
    rating: Number((rating / sum).toFixed(3))
  };
}

function main() {
  const demo = parseDemoLocations().map((x) => ({ ...x, source: 'demo' }));
  const spec = parseSpecRows().map((x) => ({ ...x, source: 'spec' }));
  const all = demo.concat(spec);

  if (!all.length) {
    console.log('No local nearby datasets found.');
    process.exit(0);
  }

  const typeCounts = toCountMap(all.map((x) => x.type || 'location'));
  const categories = all.map((x) => inferCategory(x));
  const categoryCounts = toCountMap(categories);

  const ratingCount = all.filter((x) => Number.isFinite(Number(x.rating))).length;
  const localCount = demo.length;
  const total = all.length;

  const stats = { total, localCount, ratingCount };
  const recommendedWeights = buildRecommendedWeights(stats);

  const report = {
    scannedSources: {
      demoPath: fs.existsSync(DEMO_PATH) ? path.relative(ROOT, DEMO_PATH) : null,
      specPath: fs.existsSync(SPEC_PATH) ? path.relative(ROOT, SPEC_PATH) : null
    },
    totals: {
      locations: total,
      demoLocations: demo.length,
      specLocations: spec.length,
      withRatings: ratingCount,
      withRatingsPct: pct(ratingCount, total)
    },
    topTypes: topEntries(typeCounts),
    categoryCoverage: topEntries(categoryCounts),
    recommendedWeights,
    recommendedCategoryMap: CATEGORY_MAP
  };

  console.log(JSON.stringify(report, null, 2));
}

main();

