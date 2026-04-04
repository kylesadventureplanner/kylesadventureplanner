 above already loaded the library.
     // ─────────────────────────────────────────────────────────────────────────
     (function initMSAL() {
       const MSAL_CDN = 'https://alcdn.msauth.net/browser/2.37.0/js/msal-browser.min.js';
       const MSAL_CDN_FALLBACK = 'https://alcdn.msftauth.net/browser/2.37.0/js/msal-browser.min.js';
       const CLIENT_ID   = '54cd5065-43b4-4f98-9390-0fbba95da3f2';
       const AUTHORITY   = 'https://login.microsoftonline.com/5b9b0c40-0a71-4cc2-a98a-8a1fc03a20bc';
       const SCOPES      = ['User.Read', 'Files.ReadWrite'];
       const POPUP_REDIRECT_URI = window.location.origin + '/auth-popup-callback.html';
       const POPUP_ROOT_URI = window.location.origin + '/';

       // ── helpers ──────────────────────────────────────────────────────────
       function loadScript(src) {
         return new Promise((resolve, reject) => {
           const s = document.createElement('script');
           s.src = src;
           s.onload  = () => resolve();
           s.onerror = () => reject(new Error('Failed to load: ' + src));
           document.head.appendChild(s);
         });
       }

       async function ensureMSAL() {
         if (typeof msal !== 'undefined') {
           console.log('✅ MSAL already loaded (from <script src> tag)');
           return;
         }
         console.warn('⚠️ MSAL not yet available – loading dynamically…');
         try {
           await loadScript(MSAL_CDN);
           console.log('✅ MSAL loaded from primary CDN');
         } catch (e1) {
           console.warn('⚠️ Primary CDN failed, trying fallback…');
           await loadScript(MSAL_CDN_FALLBACK);
           console.log('✅ MSAL loaded from fallback CDN');
         }
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

       // ── main boot sequence ────────────────────────────────────────────────
       async function boot() {
         try {
           await ensureMSAL();
         } catch (loadErr) {
           console.error('❌ Could not load MSAL library:', loadErr.message);
           // Install a stub that tells the user what happened
           const stub = async () => alert('Authentication library failed to load. Please check your internet connection and refresh the page.');
           window.signIn = window.realSignIn = stub;
           window.signOut = window.realSignOut = async () => {};
           return;
         }

         try {
            const msalConfig = {
              auth: { clientId: CLIENT_ID, authority: AUTHORITY, redirectUri: POPUP_REDIRECT_URI }
            };
           const instance = new msal.PublicClientApplication(msalConfig);
           window.msalInstance = instance;
           console.log('✅ MSAL instance created → window.msalInstance');

           // Initialize and handle any pending redirect
           await instance.initialize();
           try {
             await instance.handleRedirectPromise();
           } catch (e) {
             console.warn('⚠️ handleRedirectPromise error (non-fatal):', e.message);
           }

           // ── state ─────────────────────────────────────────────────────────
           let accessToken = null;
           let activeAccount = instance.getActiveAccount() || instance.getAllAccounts()[0] || null;
           let isConnectedToExcel = false;
           let isSigningIn = false;

           if (activeAccount) {
             instance.setActiveAccount(activeAccount);
           }

           function syncAuthGlobals() {
             window.accessToken = accessToken || null;
             window.activeAccount = activeAccount || null;
             window.isConnectedToExcel = isConnectedToExcel;
           }

           function updateUI(account) {
             const authStatus = document.getElementById('authStatus');
             const signInBtn  = document.getElementById('signInBtn');
             const signOutBtn = document.getElementById('signOutBtn');
             if (authStatus) authStatus.textContent = account ? `Signed in as ${account.username}` : 'Not signed in';
             if (signInBtn)  signInBtn.style.display  = account ? 'none' : '';
             if (signOutBtn) signOutBtn.style.display = account ? '' : 'none';
             if (typeof window.updateConnectionStatus === 'function') window.updateConnectionStatus(!!account);
           }

           // ── try silent token restore ──────────────────────────────────────
           if (activeAccount) {
             try {
               const silent = await instance.acquireTokenSilent({ scopes: SCOPES, account: activeAccount });
               accessToken = silent.accessToken;
               isConnectedToExcel = true;
               syncAuthGlobals();
               updateUI(activeAccount);
               console.log('✅ Silent token restore succeeded – auto signed-in as', activeAccount.username);
               if (typeof window.showLoading === 'function') window.showLoading('Loading your adventures…');
               if (typeof window.loadTable === 'function') {
                 try { await window.loadTable(); } catch (e) { console.error('loadTable error:', e); }
               }
             } catch (silentErr) {
               console.warn('⚠️ Silent restore failed (will need interactive sign-in):', silentErr.message);
               syncAuthGlobals();
               updateUI(null);
             }
           } else {
             updateUI(null);
           }

           // ── signIn ────────────────────────────────────────────────────────
           async function realSignInImpl() {
             if (isSigningIn) { console.log('⏳ Sign-in already in progress'); return; }
             isSigningIn = true;
             try {
               window.showLoading?.('Signing in…');
                const resp = await loginPopupWithFallback(instance, { scopes: SCOPES });
               activeAccount = resp.account;
               instance.setActiveAccount(activeAccount);

               const tokenResp = await instance.acquireTokenSilent({ scopes: SCOPES, account: activeAccount });
               accessToken = tokenResp.accessToken;
               isConnectedToExcel = true;
               syncAuthGlobals();
               updateUI(activeAccount);

               window.showToast?.('✅ Signed in as ' + activeAccount.username, 'success', 3000);
               if (typeof window.loadTable === 'function') await window.loadTable();
             } catch (err) {
               console.error('❌ Sign-in error:', err);
               if (err.errorCode === 'user_cancelled') {
                 window.showToast?.('Sign-in cancelled', 'info', 2000);
               } else {
                 window.showToast?.('Sign-in failed: ' + (err.message || err), 'error', 5000);
               }
             } finally {
               isSigningIn = false;
               window.hideLoading?.();
             }
           }

           // ── signOut ───────────────────────────────────────────────────────
           async function realSignOutImpl() {
             try {
               window.showLoading?.('Signing out…');
               if (activeAccount) {
                  await instance.logoutPopup({ account: activeAccount, postLogoutRedirectUri: POPUP_REDIRECT_URI });
               }
               accessToken = null;
               activeAccount = null;
               isConnectedToExcel = false;
               syncAuthGlobals();
               updateUI(null);
               window.showToast?.('✓ Signed out successfully', 'success', 2000);
             } catch (err) {
               console.error('❌ Sign-out error:', err);
             } finally {
               window.hideLoading?.();
             }
           }

           // ── export ────────────────────────────────────────────────────────
           window.signIn      = realSignInImpl;
           window.signOut     = realSignOutImpl;
           window.realSignIn  = realSignInImpl;
           window.realSignOut = realSignOutImpl;

           console.log('✅ REAL AUTH FUNCTIONS DEFINED → window.signIn / window.signOut');
           // Button wiring is handled by Final Auth Guarantee at bottom of file.

         } catch (setupErr) {
           console.error('❌ MSAL setup error:', setupErr);
           const stub = async () => alert('Authentication setup failed: ' + setupErr.message + '. Please refresh and try again.');
           window.signIn = window.realSignIn = stub;
           window.signOut = window.realSignOut = async () => {};
         }
       }

       // Kick off – don't await, let the rest of the page load in parallel
       boot();
     })();
   