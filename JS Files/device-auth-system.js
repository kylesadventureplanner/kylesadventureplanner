/**
 * Secure Microsoft Device Code Flow client.
 * Auth state is issued by backend broker endpoints only.
 */
window.DeviceAuthSystem = (function () {
  'use strict';

  const API_START = '/api/auth/device/start';
  const API_POLL = '/api/auth/device/poll';
  const DEFAULT_SCOPES = ['User.Read', 'Files.ReadWrite', 'openid', 'profile'];
  const MAX_POLL_ATTEMPTS = 200;

  let activeModal = null;
  let activePollTimer = null;
  let activeCountdownTimer = null;
  let activeFlowId = 0;

  function safeText(value) {
    return String(value == null ? '' : value);
  }

  function clearTimer(refName) {
    if (refName === 'poll' && activePollTimer) {
      clearTimeout(activePollTimer);
      activePollTimer = null;
      return;
    }
    if (refName === 'countdown' && activeCountdownTimer) {
      clearInterval(activeCountdownTimer);
      activeCountdownTimer = null;
    }
  }

  function closeModal() {
    clearTimer('poll');
    clearTimer('countdown');
    if (activeModal && activeModal.parentNode) {
      activeModal.parentNode.removeChild(activeModal);
    }
    activeModal = null;
  }

  function getApiMisconfigurationMessage(status, path) {
    if (status !== 404 && status !== 405) return '';
    var route = String(path || '').trim() || 'device-auth endpoint';
    return 'Device sign-in API is not deployed/configured (' + route + ' returned ' + status + '). Operator hint: deploy/enable Static Web Apps API routes ' + API_START + ' and ' + API_POLL + '.';
  }

  function requestJson(path, payload) {
    return fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {})
    }).then(async function (response) {
      const bodyText = await response.text().catch(function () { return ''; });
      let body = {};
      try {
        body = bodyText ? JSON.parse(bodyText) : {};
      } catch (_err) {
        body = {};
      }
      if (!response.ok) {
        const hintMessage = getApiMisconfigurationMessage(response.status, path);
        const fallbackMessage = safeText((body && body.message) || bodyText || ('Request failed: ' + response.status));
        const err = new Error(safeText(hintMessage || fallbackMessage));
        err.code = safeText(body.error || ('http_' + response.status));
        err.status = response.status;
        err.path = path;
        throw err;
      }
      return body;
    });
  }

  function decodeJwtClaims(token) {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    try {
      const raw = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = raw + '==='.slice((raw.length + 3) % 4);
      return JSON.parse(atob(padded));
    } catch (_) {
      return null;
    }
  }

  function updateAuthUiForAccount(account) {
    const authStatus = document.getElementById('authStatus');
    const signInBtn = document.getElementById('signInBtn');
    const signOutBtn = document.getElementById('signOutBtn');
    const deviceBtn = document.getElementById('deviceSignInBtn');
    const signInRequiredBanner = document.getElementById('signInRequiredBanner');

    if (authStatus) authStatus.textContent = account ? ('Signed in as ' + account.username) : 'Not signed in';
    if (signInBtn) {
      signInBtn.style.display = account ? 'none' : '';
      signInBtn.classList.toggle('is-needs-signin', !account);
    }
    if (deviceBtn) deviceBtn.style.display = account ? 'none' : '';
    if (signOutBtn) signOutBtn.style.display = account ? '' : 'none';
    if (signInRequiredBanner) signInRequiredBanner.hidden = Boolean(account);
    if (typeof window.updateConnectionStatus === 'function') {
      window.updateConnectionStatus(Boolean(account));
    }
  }

  function setSignedInState(payload) {
    const accessToken = safeText(payload && payload.accessToken);
    if (!accessToken) throw new Error('Device auth response missing access token');

    const claims = decodeJwtClaims(payload && payload.idToken ? payload.idToken : '');
    const accountFromApi = payload && payload.account ? payload.account : {};
    const username = accountFromApi.username || (claims && (claims.preferred_username || claims.upn || claims.email)) || 'Authenticated User';
    const displayName = accountFromApi.name || (claims && (claims.name || claims.given_name)) || username;

    window.accessToken = accessToken;
    window.activeAccount = {
      username: username,
      name: displayName,
      localAccountId: safeText((claims && claims.oid) || Date.now())
    };
    window.isConnectedToExcel = true;
    window.__deviceFlowSession = true;
    window.__deviceFlowExpiresAt = Date.now() + (Number(payload && payload.expiresIn) || 3600) * 1000;

    updateAuthUiForAccount(window.activeAccount);

    if (typeof window.showToast === 'function') {
      window.showToast('Device sign-in successful', 'success', 2400);
    }
    if (typeof window.loadTable === 'function') {
      window.loadTable().catch(function (err) {
        console.error('Device flow: loadTable failed after sign-in:', err);
      });
    }
  }

  function clearDeviceFlowSession() {
    window.__deviceFlowSession = false;
    window.__deviceFlowExpiresAt = 0;
    window.accessToken = null;
    window.activeAccount = null;
    window.isConnectedToExcel = false;
    updateAuthUiForAccount(null);
  }

  function renderModalShell() {
    closeModal();
    const overlay = document.createElement('div');
    overlay.id = 'deviceAuthModal';
    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'display:flex',
      'justify-content:center',
      'align-items:center',
      'padding:16px',
      'background:rgba(2,6,23,0.58)',
      'z-index:9999'
    ].join(';');

    const panel = document.createElement('div');
    panel.style.cssText = [
      'width:min(560px,94vw)',
      'max-height:90vh',
      'overflow:auto',
      'border-radius:14px',
      'border:1px solid #dbeafe',
      'background:#fff',
      'box-shadow:0 16px 48px rgba(15,23,42,0.28)',
      'padding:18px'
    ].join(';');

    panel.innerHTML = [
      '<div style="display:flex;align-items:flex-start;gap:10px;">',
      '  <div style="flex:1;">',
      '    <div style="font-size:19px;font-weight:800;color:#1f2937;">Sign In on Another Device</div>',
      '    <div style="margin-top:3px;font-size:13px;color:#6b7280;">Use Microsoft device code flow from your phone, tablet, or laptop.</div>',
      '  </div>',
      '  <button id="deviceAuthCloseBtn" type="button" style="border:1px solid #d1d5db;background:#fff;border-radius:8px;padding:6px 9px;cursor:pointer;font-size:12px;font-weight:700;color:#374151;">Close</button>',
      '</div>',
      '<div id="deviceAuthContent" style="margin-top:12px;font-size:13px;color:#374151;">Loading device code...</div>'
    ].join('');

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    const closeBtn = panel.querySelector('#deviceAuthCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) closeModal();
    });

    activeModal = overlay;
    return panel.querySelector('#deviceAuthContent');
  }

  function renderFallback(contentEl, reason) {
    const message = safeText(reason || 'Device code sign-in is unavailable right now.');
    contentEl.innerHTML = [
      '<div style="padding:10px 2px;">',
      '  <div style="padding:10px 12px;border-radius:10px;background:#fef2f2;border:1px solid #fecaca;color:#991b1b;font-weight:700;">' + message + '</div>',
      '  <div style="margin-top:12px;color:#4b5563;">You can continue with standard Microsoft sign-in.</div>',
      '  <button id="deviceAuthFallbackBtn" type="button" style="margin-top:10px;padding:9px 14px;border-radius:9px;border:1px solid #c7d2fe;background:#eef2ff;color:#3730a3;font-weight:700;cursor:pointer;">Use Standard Sign-In</button>',
      '</div>'
    ].join('');

    const fallbackBtn = contentEl.querySelector('#deviceAuthFallbackBtn');
    if (!fallbackBtn) return;
    fallbackBtn.addEventListener('click', function () {
      closeModal();
      if (typeof window.realSignIn === 'function') {
        window.realSignIn().catch(function (err) {
          console.error('Fallback sign-in failed:', err);
        });
      }
    });
  }

  function renderDeviceCode(contentEl, startData) {
    const verificationUri = safeText(startData.verificationUri || 'https://microsoft.com/devicelogin');
    const verificationUriComplete = safeText(startData.verificationUriComplete || verificationUri);
    const userCode = safeText(startData.userCode);
    const expiresIn = Math.max(30, Number(startData.expiresIn) || 900);
    const qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(verificationUriComplete);

    contentEl.innerHTML = [
      '<div style="display:grid;grid-template-columns:220px 1fr;gap:14px;align-items:start;">',
      '  <div style="padding:10px;border:1px solid #e5e7eb;border-radius:12px;background:#f8fafc;">',
      '    <img alt="Device sign-in QR code" src="' + qrCodeUrl + '" style="width:100%;height:auto;display:block;border-radius:8px;background:#fff;">',
      '    <div style="margin-top:8px;font-size:11px;color:#6b7280;text-align:center;">Scan with your phone camera</div>',
      '  </div>',
      '  <div>',
      '    <div style="font-size:12px;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">Step 1</div>',
      '    <div style="margin-top:4px;font-size:14px;">Open <a href="' + verificationUri + '" target="_blank" rel="noopener" style="font-weight:700;color:#1d4ed8;">' + verificationUri + '</a> on another device.</div>',
      '    <div style="margin-top:10px;font-size:12px;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">Step 2</div>',
      '    <div style="margin-top:5px;">Enter this code:</div>',
      '    <div style="margin-top:6px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:31px;font-weight:900;letter-spacing:2px;color:#4338ca;">' + userCode + '</div>',
      '    <button id="copyDeviceCodeBtn" type="button" style="margin-top:8px;padding:7px 11px;border-radius:8px;border:1px solid #c7d2fe;background:#eef2ff;color:#3730a3;font-weight:700;cursor:pointer;">Copy Code</button>',
      '    <div id="deviceAuthCountdown" style="margin-top:10px;font-size:12px;color:#6b7280;">Code expires in ' + Math.ceil(expiresIn / 60) + ' minutes.</div>',
      '    <div id="deviceAuthPollStatus" style="margin-top:9px;font-size:12px;font-weight:700;color:#1d4ed8;">Waiting for verification...</div>',
      '  </div>',
      '</div>'
    ].join('');

    const copyBtn = contentEl.querySelector('#copyDeviceCodeBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        navigator.clipboard.writeText(userCode).then(function () {
          copyBtn.textContent = 'Copied';
          setTimeout(function () { copyBtn.textContent = 'Copy Code'; }, 1000);
        }).catch(function () {
          copyBtn.textContent = 'Copy failed';
          setTimeout(function () { copyBtn.textContent = 'Copy Code'; }, 1200);
        });
      });
    }

    clearTimer('countdown');
    let remainingSec = expiresIn;
    const countdownEl = contentEl.querySelector('#deviceAuthCountdown');
    activeCountdownTimer = setInterval(function () {
      remainingSec -= 1;
      if (!activeModal || remainingSec < 0) {
        clearTimer('countdown');
        return;
      }
      const min = Math.floor(remainingSec / 60);
      const sec = remainingSec % 60;
      if (countdownEl) {
        countdownEl.textContent = 'Code expires in ' + min + 'm ' + String(sec).padStart(2, '0') + 's.';
      }
    }, 1000);
  }

  function updatePollStatus(contentEl, text, isError) {
    const el = contentEl && contentEl.querySelector ? contentEl.querySelector('#deviceAuthPollStatus') : null;
    if (!el) return;
    el.style.color = isError ? '#b91c1c' : '#1d4ed8';
    el.textContent = text;
  }

  function startPolling(contentEl, flowToken, pollMs, flowId) {
    let pollCount = 0;

    function schedule(nextMs) {
      clearTimer('poll');
      activePollTimer = setTimeout(runPoll, nextMs);
    }

    function runPoll() {
      if (flowId !== activeFlowId || !activeModal) return;
      pollCount += 1;
      if (pollCount > MAX_POLL_ATTEMPTS) {
        updatePollStatus(contentEl, 'Timed out waiting for verification. Please try again.', true);
        return;
      }

      requestJson(API_POLL, { flowToken: flowToken }).then(function (pollResult) {
        if (flowId !== activeFlowId || !activeModal) return;

        if (pollResult && pollResult.status === 'authorized' && pollResult.accessToken) {
          setSignedInState(pollResult);
          closeModal();
          return;
        }

        if (pollResult && pollResult.status === 'pending') {
          updatePollStatus(contentEl, 'Waiting for verification...', false);
          schedule(Math.max(2000, Number(pollResult.intervalSec || 0) * 1000 || pollMs));
          return;
        }

        const message = safeText((pollResult && pollResult.message) || 'Device sign-in failed. Please start again.');
        updatePollStatus(contentEl, message, true);
      }).catch(function (err) {
        if (flowId !== activeFlowId || !activeModal) return;
        const message = safeText(err && err.message ? err.message : 'Device sign-in failed.');
        updatePollStatus(contentEl, message, true);
      });
    }

    schedule(500);
  }

  function start() {
    activeFlowId += 1;
    const currentFlowId = activeFlowId;
    const contentEl = renderModalShell();
    if (!contentEl) return;

    requestJson(API_START, { scopes: DEFAULT_SCOPES }).then(function (startData) {
      if (currentFlowId !== activeFlowId || !activeModal) return;

      const flowToken = safeText(startData && startData.flowToken);
      const userCode = safeText(startData && startData.userCode);
      if (!flowToken || !userCode) {
        throw new Error('Device auth start response was incomplete.');
      }

      renderDeviceCode(contentEl, startData);
      const pollMs = Math.max(2000, Number(startData.intervalSec || 5) * 1000);
      startPolling(contentEl, flowToken, pollMs, currentFlowId);
    }).catch(function (err) {
      if (currentFlowId !== activeFlowId || !activeModal) return;
      renderFallback(contentEl, safeText(err && err.message ? err.message : 'Unable to start device sign-in.'));
    });
  }

  window.clearDeviceFlowSession = clearDeviceFlowSession;

  return {
    start: start,
    close: closeModal,
    clearSession: clearDeviceFlowSession
  };
})();
