# Lucy Webcam MVP

Local TypeScript React MVP for Decart Lucy 2.1 realtime webcam transformation.

The app runs on one local Express server with Vite middleware:

```text
http://localhost:3000
https://localhost:3000
```

## Setup

```bash
npm install
cp .env.example .env
```

Add your server-side Decart API key to `.env`:

```text
DECART_API_KEY=dct_your_server_side_key_here
PORT=3000
NODE_ENV=development
```

Do not create any `VITE_DECART_API_KEY` variable. The permanent Decart API key must stay server-side.

## Environment Variables

- `DECART_API_KEY`: required server-only Decart API key used to create short-lived realtime client tokens.
- `PORT`: local server port. Defaults to `3000` in `.env.example`.
- `NODE_ENV`: use `development` for local Vite middleware and `production` for `dist` serving.

## Running Locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

HTTPS is also available for browser/camera testing:

```text
https://localhost:3000
```

The HTTPS server uses a generated self-signed localhost certificate in `.cert/`, so your browser may ask you to accept the certificate warning.

Useful checks:

```bash
npm run typecheck
npm run build
```

Health endpoint:

```text
GET http://localhost:3000/api/health
```

Realtime token endpoint:

```text
POST http://localhost:3000/api/realtime-token
```

The token endpoint returns a temporary client token for the browser. Do not log, commit, or share token values.

## Manual Test Checklist

- App loads at `http://localhost:3000`.
- `GET /api/health` returns `{ "ok": true }`.
- `POST /api/realtime-token` returns a temporary client token and `expiresAt`.
- Browser source does not contain `VITE_DECART_API_KEY` or the permanent `DECART_API_KEY` value.
- Start asks for webcam permission.
- Start moves through camera/token/connection loading states.
- Remote Lucy output replaces the local preview when `onRemoteStream` fires.
- Stop disconnects the realtime client.
- Stop turns off the camera indicator and stops camera tracks.
- Start, Stop, then Start again works repeatedly.
- Timer starts while connected/generating/reconnecting.
- Timer resets to `00:00` after Stop.
- Apply is disabled until the session is `connected` or `generating`.
- Prompt-only Apply updates the running session without reconnecting.
- Image-only Apply sends the selected image with the default character substitution prompt.
- Prompt + image Apply sends prompt and image together in one `realtimeClient.set()` call.
- JPEG, PNG, and WebP files show a thumbnail preview.
- Unsupported image MIME types show a friendly validation error.
- Clear removes the selected image and revokes the object URL.
- Camera permission denied, no camera, token failure, connection failure, and apply failure show readable errors.

## Troubleshooting

- `Could not create realtime session token`: confirm `DECART_API_KEY` exists in `.env`, then restart `npm run dev`.
- `Camera permission was denied`: allow camera access for localhost in the browser and retry Start.
- `No camera was found`: connect or enable a webcam and retry.
- Browser blocks camera on HTTP: use `https://localhost:3000` and accept the local certificate warning.
- `504 Outdated Optimize Dep` for `@decartai/sdk`: stop the dev server, remove `node_modules/.vite`, restart `npm run dev`, then hard refresh the browser.
- Vite HMR websocket errors on HTTPS: restart the dev server and reload `https://localhost:3000`.
- Decart connection fails after token creation: verify Decart API access, Lucy 2.1 availability, and network/WebRTC connectivity.
- Apply stays disabled: wait until status is `Connected` or `Generating`.

## Known MVP Limitations

- Local MVP only. No deployment hardening is included.
- No auth, database, recording, gallery, payments, analytics, or session history.
- Uploaded reference images stay in browser memory only and are not persisted.
- The Decart SDK chunk is large, so production build may warn about chunk size.
- Token scope is configured server-side for `lucy-2.1` and localhost origins; the Decart token response may not echo all scope fields.
- Manual browser QA is still required for real webcam permission, WebRTC media flow, and visual Lucy output.

