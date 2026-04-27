'use strict';

const crypto = require('crypto');

function base64urlEncode(input) {
  const raw = Buffer.isBuffer(input) ? input : Buffer.from(String(input), 'utf8');
  return raw.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64urlDecode(input) {
  const normalized = String(input || '').replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '==='.slice((normalized.length + 3) % 4);
  return Buffer.from(padded, 'base64').toString('utf8');
}

function getSigningSecret() {
  const fromEnv = process.env.DEVICE_FLOW_SIGNING_SECRET;
  if (fromEnv && fromEnv.trim()) return fromEnv.trim();
  return null;
}

function signFlowPayload(payload) {
  const secret = getSigningSecret();
  if (!secret) {
    throw new Error('Missing DEVICE_FLOW_SIGNING_SECRET environment variable');
  }

  const header = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64urlEncode(JSON.stringify(payload || {}));
  const data = `${header}.${body}`;
  const sig = crypto.createHmac('sha256', secret).update(data).digest('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${data}.${sig}`;
}

function verifyFlowToken(token) {
  if (!token || typeof token !== 'string') {
    throw new Error('Flow token is required');
  }

  const secret = getSigningSecret();
  if (!secret) {
    throw new Error('Missing DEVICE_FLOW_SIGNING_SECRET environment variable');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid flow token format');
  }

  const data = `${parts[0]}.${parts[1]}`;
  const expectedSig = crypto.createHmac('sha256', secret).update(data).digest('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  if (expectedSig !== parts[2]) {
    throw new Error('Invalid flow token signature');
  }

  const payloadJson = base64urlDecode(parts[1]);
  const payload = JSON.parse(payloadJson);

  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid flow token payload');
  }

  const now = Date.now();
  if (payload.exp && Number(payload.exp) < now) {
    throw new Error('Flow token has expired');
  }

  return payload;
}

module.exports = {
  signFlowPayload,
  verifyFlowToken
};

