/**
 * QUICK SETUP (SECURE): Microsoft Device Code Flow + MSAL SPA
 *
 * This replaces the old insecure client-only device auth method.
 * Device-code verification now happens through backend API endpoints.
 */

// ============================================================================
// 1) FRONTEND: Add script + button in index.html
// ============================================================================

/*
  In <head>, include:

  <script src="JS Files/device-auth-system.js"></script>

  In auth buttons area, include:

  <button id="deviceSignInBtn" class="auth-btn" title="Sign in using device code flow on another device">
    Sign In via Device
  </button>

  NOTE: The secure implementation expects:
    - /api/auth/device/start
    - /api/auth/device/poll
*/

// ============================================================================
// 2) BACKEND: Required environment variables (Azure SWA Functions)
// ============================================================================

/*
  AAD_TENANT_ID=<your-tenant-id>
  AAD_DEVICE_CLIENT_ID=<app-registration-client-id>
  AAD_DEVICE_CLIENT_SECRET=<optional-if-confidential-client>
  DEVICE_FLOW_SIGNING_SECRET=<long-random-secret>

  Optional:
  AAD_DEVICE_SCOPES=User.Read Files.ReadWrite openid profile
*/

// ============================================================================
// 3) API ROUTES (already scaffolded in /api)
// ============================================================================

/*
  POST /api/auth/device/start
    - Calls Microsoft /devicecode endpoint
    - Returns userCode + verificationUri + flowToken

  POST /api/auth/device/poll
    - Validates signed flowToken
    - Polls Microsoft /token endpoint
    - Returns authorized/pending/failed state
*/

// ============================================================================
// 4) SIGN-OUT BEHAVIOR
// ============================================================================

/*
  Device-code sessions are not browser-cookie MSAL sessions.
  On sign-out, call:

    window.clearDeviceFlowSession()

  This is already wired in the Final Auth Guarantee block.
*/

// ============================================================================
// 5) SMOKE TESTS
// ============================================================================

/*
  Browser console checks:

  console.log('Device auth client loaded:', !!window.DeviceAuthSystem);

  // Launch modal manually
  window.DeviceAuthSystem?.start();

  // After successful device sign-in, verify globals
  console.log('Token:', !!window.accessToken);
  console.log('Account:', window.activeAccount);
  console.log('Device session:', window.__deviceFlowSession);
*/

// ============================================================================
// SECURITY NOTES
// ============================================================================

/*
  - No client-side verification code matching in local/session storage.
  - Flow state is signed server-side using DEVICE_FLOW_SIGNING_SECRET.
  - Token exchange is server-mediated.
  - Keep /api responses as no-store and avoid logging access tokens.
*/

// ============================================================================

