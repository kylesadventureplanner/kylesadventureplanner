# Device Auth Broker API

This folder contains Azure Functions endpoints used by the secure Microsoft Device Code Flow implementation.

## Endpoints

- `POST /api/auth/device/start`
- `POST /api/auth/device/poll`

## Environment Variables

- `AAD_TENANT_ID` (required)
- `AAD_DEVICE_CLIENT_ID` (required)
- `AAD_DEVICE_CLIENT_SECRET` (optional)
- `AAD_DEVICE_SCOPES` (optional, default: `User.Read Files.ReadWrite openid profile`)
- `DEVICE_FLOW_SIGNING_SECRET` (required)

## Local Run

1. Install Azure Functions Core Tools.
2. Create `local.settings.json` from `local.settings.sample.json` and fill values.
3. Start the Functions host from this folder.

## Security Notes

- Device flow state is signed server-side; client cannot forge/alter flow payloads.
- Responses are `Cache-Control: no-store`.
- Tokens are never logged.

