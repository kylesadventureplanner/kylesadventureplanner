'use strict';

const { signFlowPayload } = require('../shared/device-flow-crypto');

function json(status, body) {
  return {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    },
    body
  };
}

function readEnvConfig() {
  const tenantId = String(process.env.AAD_TENANT_ID || '').trim();
  const clientId = String(process.env.AAD_DEVICE_CLIENT_ID || '').trim();
  const clientSecret = String(process.env.AAD_DEVICE_CLIENT_SECRET || '').trim();
  const scopes = String(process.env.AAD_DEVICE_SCOPES || 'User.Read Files.ReadWrite openid profile').trim();

  if (!tenantId || !clientId) {
    throw new Error('Server is missing AAD_TENANT_ID or AAD_DEVICE_CLIENT_ID');
  }

  return { tenantId, clientId, clientSecret, scopes };
}

function parseBody(req) {
  if (!req || !req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (_) { return {}; }
  }
  if (typeof req.body === 'object') return req.body;
  return {};
}

module.exports = async function deviceAuthStart(context, req) {
  if (req.method === 'OPTIONS') {
    context.res = {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
    return;
  }

  try {
    const { tenantId, clientId, clientSecret, scopes: envScopes } = readEnvConfig();
    const body = parseBody(req);
    const requestedScopes = Array.isArray(body.scopes) && body.scopes.length
      ? body.scopes.join(' ')
      : envScopes;

    const deviceCodeUrl = `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/devicecode`;
    const formData = new URLSearchParams();
    formData.set('client_id', clientId);
    formData.set('scope', requestedScopes);

    const startResp = await fetch(deviceCodeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    const startPayload = await startResp.json().catch(() => ({}));
    if (!startResp.ok || !startPayload.device_code) {
      context.log.warn('deviceAuthStart: Microsoft device code call failed', {
        status: startResp.status,
        error: startPayload.error,
        error_description: startPayload.error_description
      });
      context.res = json(502, {
        ok: false,
        error: 'device_code_start_failed',
        message: startPayload.error_description || 'Unable to start device authentication.'
      });
      return;
    }

    const now = Date.now();
    const expiresAtMs = now + (Number(startPayload.expires_in || 900) * 1000);

    const flowToken = signFlowPayload({
      ver: 1,
      iat: now,
      exp: expiresAtMs,
      tenantId,
      clientId,
      clientSecretPresent: Boolean(clientSecret),
      deviceCode: startPayload.device_code,
      intervalSec: Number(startPayload.interval || 5)
    });

    context.res = json(200, {
      ok: true,
      flowToken,
      userCode: startPayload.user_code,
      verificationUri: startPayload.verification_uri,
      verificationUriComplete: startPayload.verification_uri_complete || null,
      message: startPayload.message || null,
      expiresIn: Number(startPayload.expires_in || 900),
      intervalSec: Number(startPayload.interval || 5),
      scopes: requestedScopes.split(/\s+/).filter(Boolean)
    });
  } catch (err) {
    context.log.error('deviceAuthStart failed', err && err.message ? err.message : err);
    context.res = json(500, {
      ok: false,
      error: 'device_auth_start_internal_error',
      message: err && err.message ? err.message : 'Unexpected server error'
    });
  }
};

