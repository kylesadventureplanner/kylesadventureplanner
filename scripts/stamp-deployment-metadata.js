#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const indexPath = path.join(repoRoot, 'index.html');

const deploymentTag = String(process.env.DEPLOYMENT_TAG || '').trim();
const deployedAtIso = String(process.env.DEPLOYED_AT_ISO || '').trim();

if (!deploymentTag) {
  console.error('Missing DEPLOYMENT_TAG environment value.');
  process.exit(1);
}
if (!deployedAtIso || !Number.isFinite(Date.parse(deployedAtIso))) {
  console.error('Missing or invalid DEPLOYED_AT_ISO environment value.');
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');

const tagPattern = /const\s+DEPLOYMENT_TAG\s*=\s*'[^']*';/;
const timePattern = /const\s+DEPLOYED_AT_ISO\s*=\s*'[^']*';/;

if (!tagPattern.test(html)) {
  console.error('Could not find DEPLOYMENT_TAG constant in index.html');
  process.exit(1);
}
if (!timePattern.test(html)) {
  console.error('Could not find DEPLOYED_AT_ISO constant in index.html');
  process.exit(1);
}

html = html.replace(tagPattern, "const DEPLOYMENT_TAG = '" + deploymentTag + "';");
html = html.replace(timePattern, "const DEPLOYED_AT_ISO = '" + deployedAtIso + "';");

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Stamped deployment metadata:', { deploymentTag, deployedAtIso });

