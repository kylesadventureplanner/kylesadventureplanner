
(function finalAuthGuarantee() {
  'use strict';

  const CLIENT_ID = '54cd5065-43b4-4f98-9390-0fbba95da3f2';
  const AUTHORITY  = 'https://login.microsoftonline.com/5b9b0c40-0a71-4cc2-a98a-8a1fc03a20bc';
  const SCOPES     = ['User.Read', 'Files.ReadWrite'];
  const POPUP_REDIRECT_URI = window.location.origin + '/auth-popup-callback.html';
  const POPUP_ROOT_URI = window.location.origin + '/';

  function isUsableAuthFn(fn) {
    if (typeof fn !== 'function') return false;
    const src = String(fn);
    return !(
      src.includes('Authentication library failed to load') ||
      src.includes('Authentication setup failed') ||
      src.includes('Placeholder signIn') ||
      src.includes('real auth should have replaced this')
    );
  }

  function isRedirectMismatchError(err) {
    const msg = String(err?.message || err?.errorMessage || '').toLowerCase();
    return msg.includes('aadsts50011') || msg.includes('redirect uri');
  }

  async function loginPopupWithFallback(instance, request) {
    try {
      return await instance.loginPopup({ ...request, redirectUri: POPUP_REDIRECT_URI });
    } catch (err) {
      if (!isRedirectMismatchError(err)) throw err;
      console.warn('⚠️ Popup callback redirect not registered; retrying root redirect URI');
      return await instance.loginPopup({ ...request, redirectUri: POPUP_ROOT_URI });
    }
  }

  function getCleanButton(id) {
    const existing = document.getElementById(id);
    if (!existing) return null;
    if (existing.dataset.authGuaranteed === 'true') return existing;
    const clean = existing.cloneNode(true);
    clean.dataset.authGuaranteed = 'true';
    existing.replaceWith(clean);
    return clean;
  }

  // ── wire the sign-in button immediately (no cloning, no racing) ──────────
  function wireSignInButton() {
    const btn = getCleanButton('signInBtn');
    if (!btn || btn._authWired) return;
    btn._authWired = true;

    btn.addEventListener('click', async function handleSignIn(e) {
      e.preventDefault();
      e.stopImmediatePropagation();

      // 1. Use already-initialised signIn functions if available
      if (isUsableAuthFn(window.realSignIn)) {
        try { await window.realSignIn(); } catch (err) { showAuthError(err); }
        return;
      }
      if (isUsableAuthFn(window.signIn)) {
        try { await window.signIn(); } catch (err) { showAuthError(err); }
        return;
      }

      // 2. Use the already-created MSAL instance if available
      if (window.msalInstance) {
        try {
          const resp = await loginPopupWithFallback(window.msalInstance, { scopes: SCOPES });
          window.activeAccount = resp.account;
          window.msalInstance.setActiveAccount(resp.account);
          const tok = await window.msalInstance.acquireTokenSilent({ scopes: SCOPES, account: resp.account });
          window.accessToken = tok.accessToken;
          window.isConnectedToExcel = true;
          updateAuthUI(resp.account);
          if (typeof window.loadTable === 'function') await window.loadTable();
        } catch (err) { showAuthError(err); }
        return;
      }

      // 3. Last resort: create a fresh MSAL instance right now
      if (typeof msal === 'undefined') {
        alert('Authentication library not loaded. Please refresh the page.');
        return;
      }
      try {
        const inst = new msal.PublicClientApplication({ auth: { clientId: CLIENT_ID, authority: AUTHORITY, redirectUri: POPUP_REDIRECT_URI } });
        await inst.initialize();
        window.msalInstance = inst;
        const resp = await loginPopupWithFallback(inst, { scopes: SCOPES });
        window.activeAccount = resp.account;
        inst.setActiveAccount(resp.account);
        const tok = await inst.acquireTokenSilent({ scopes: SCOPES, account: resp.account });
        window.accessToken = tok.accessToken;
        window.isConnectedToExcel = true;
        // Expose signIn/signOut on window so subsequent clicks use the fast path
        window.signIn = async () => {
          const r = await loginPopupWithFallback(inst, { scopes: SCOPES });
          window.activeAccount = r.account;
          inst.setActiveAccount(r.account);
          const t = await inst.acquireTokenSilent({ scopes: SCOPES, account: r.account });
          window.accessToken = t.accessToken;
          window.isConnectedToExcel = true;
          updateAuthUI(r.account);
          if (typeof window.loadTable === 'function') await window.loadTable();
        };
        window.signOut = async () => {
          const account = inst.getActiveAccount() || window.activeAccount || null;
          if (account) {
            await inst.logoutPopup({ account: account, postLogoutRedirectUri: POPUP_REDIRECT_URI });
          }
          window.accessToken = null;
          window.activeAccount = null;
          window.isConnectedToExcel = false;
          updateAuthUI(null);
        };
        window.realSignIn = window.signIn;
        window.realSignOut = window.signOut;
        updateAuthUI(resp.account);
        if (typeof window.loadTable === 'function') await window.loadTable();
      } catch (err) { showAuthError(err); }
    }, true);
  }

  function wireSignOutButton() {
    const btn = getCleanButton('signOutBtn');
    if (!btn || btn._authWired) return;
    btn._authWired = true;

    btn.addEventListener('click', async function handleSignOut(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (typeof window.realSignOut === 'function') {
        try { await window.realSignOut(); } catch (err) { console.error('Sign-out error:', err); }
        return;
      }
      if (typeof window.signOut === 'function') {
        try { await window.signOut(); } catch (err) { console.error('Sign-out error:', err); }
        return;
      }
      if (window.msalInstance) {
        try {
          await window.msalInstance.logoutPopup();
          window.accessToken = null; window.activeAccount = null; window.isConnectedToExcel = false;
          updateAuthUI(null);
        } catch (err) { console.error('Sign-out error:', err); }
      }
    }, true);
  }

  function updateAuthUI(account) {
    const status  = document.getElementById('authStatus');
    const signIn  = document.getElementById('signInBtn');
    const signOut = document.getElementById('signOutBtn');
    if (status)  status.textContent = account ? 'Signed in as ' + account.username : 'Not signed in';
    if (signIn)  signIn.style.display  = account ? 'none' : '';
    if (signOut) signOut.style.display = account ? ''     : 'none';
    if (typeof window.updateConnectionStatus === 'function') window.updateConnectionStatus(!!account);
  }

  function showAuthError(err) {
    if (!err) return;
    const message = typeof err?.message === 'string' ? err.message : String(err || '');
    const lowerMessage = message.toLowerCase();
    if (err.errorCode === 'user_cancelled' || message.includes('cancelled')) {
      if (typeof window.showToast === 'function') window.showToast('Sign-in cancelled', 'info', 2000);
    } else if (lowerMessage.includes('popup')) {
      alert('Please allow pop-ups for this site and try again.');
    } else {
      console.error('❌ Sign-in error:', err);
      if (typeof window.showToast === 'function') window.showToast('Sign-in failed: ' + message, 'error', 5000);
    }
  }

  // Wire immediately and again after short delays in case the DOM isn't ready yet
  wireSignInButton();
  wireSignOutButton();
  setTimeout(function() { wireSignInButton(); wireSignOutButton(); }, 300);
  setTimeout(function() { wireSignInButton(); wireSignOutButton(); }, 1500);
  document.addEventListener('DOMContentLoaded', function() { wireSignInButton(); wireSignOutButton(); });
})();
