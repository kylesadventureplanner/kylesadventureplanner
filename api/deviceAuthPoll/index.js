'use strict';

const { verifyFlowToken } = require('../shared/device-flow-crypto');

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

function parseBody(req) {
  if (!req || !req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (_) { return {}; }
  }
  if (typeof req.body === 'object') return req.body;
  return {};
}

function decodeJwtClaims(idToken) {
  if (!idToken || typeof idToken !== 'string') return null;
  const parts = idToken.split('.');
  if (parts.length < 2) return null;
  try {
    const raw = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = raw + '==='.slice((raw.length + 3) % 4);
    const jsonText = Buffer.from(padded, 'base64').toString('utf8');
    return JSON.parse(jsonText);
  } catch (_) {
    return null;
  }
}

module.exports = async function deviceAuthPoll(context, req) {
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
    const body = parseBody(req);
    const flowToken = String(body.flowToken || '').trim();
    if (!flowToken) {
      context.res = json(400, {
        ok: false,
        error: 'missing_flow_token',
        message: 'flowToken is required'
      });
      return;
    }

    let flow;
    try {
      flow = verifyFlowToken(flowToken);
    } catch (err) {
      context.res = json(400, {
        ok: false,
        error: 'invalid_flow_token',
        message: err && err.message ? err.message : 'Flow token is invalid'
      });
      return;
    }

    const tokenUrl = `https://login.microsoftonline.com/${encodeURIComponent(flow.tenantId)}/oauth2/v2.0/token`;
    const formData = new URLSearchParams();
    formData.set('grant_type', 'urn:ietf:params:oauth:grant-type:device_code');
    formData.set('client_id', flow.clientId);
    formData.set('device_code', flow.deviceCode);

    const clientSecret = String(process.env.AAD_DEVICE_CLIENT_SECRET || '').trim();
    if (clientSecret) {
      formData.set('client_secret', clientSecret);
    }

    const tokenResp = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    const tokenPayload = await tokenResp.json().catch(() => ({}));

    if (tokenResp.ok && tokenPayload.access_token) {
      const claims = decodeJwtClaims(tokenPayload.id_token || '');
      const username = claims && (claims.preferred_username || claims.upn || claims.email || claims.name) || null;
      const displayName = claims && (claims.name || claims.given_name) || username;

      context.res = json(200, {
        ok: true,
        status: 'authorized',
        accessToken: tokenPayload.access_token,
        expiresIn: Number(tokenPayload.expires_in || 3600),
        scope: tokenPayload.scope || null,
        tokenType: tokenPayload.token_type || 'Bearer',
        account: {
          username,
          name: displayName
        }
      });
      return;
    }

    const errorCode = String(tokenPayload.error || '').toLowerCase();
    if (errorCode === 'authorization_pending') {
      context.res = json(200, {
        ok: true,
        status: 'pending',
        intervalSec: Number(flow.intervalSec || 5)
      });
      return;
    }

    if (errorCode === 'slow_down') {
      context.res = json(200, {
        ok: true,
        status: 'pending',
        intervalSec: Math.max(5, Number(flow.intervalSec || 5) + 2)
      });
      return;
    }

    if (errorCode === 'authorization_declined') {
      context.res = json(200, {
        ok: false,
        status: 'failed',
        error: 'authorization_declined',
        message: 'The sign-in request was declined.'
      });
      return;
    }

    if (errorCode === 'expired_token' || errorCode === 'bad_verification_code') {
      context.res = json(200, {
        ok: false,
        status: 'failed',
        error: 'expired_token',
        message: 'The device code has expired. Start again.'
      });
      return;
    }

    context.log.warn('deviceAuthPoll unknown token endpoint response', {
      status: tokenResp.status,
      error: tokenPayload.error,
      error_description: tokenPayload.error_description
    });

    context.res = json(502, {
      ok: false,
      status: 'failed',
      error: 'token_exchange_failed',
      message: tokenPayload.error_description || 'Token exchange failed.'
    });
  } catch (err) {
    context.log.error('deviceAuthPoll failed', err && err.message ? err.message : err);
    context.res = json(500, {
      ok: false,
      status: 'failed',
      error: 'device_auth_poll_internal_error',
      message: err && err.message ? err.message : 'Unexpected server error'
    });
  }
};

