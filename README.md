# Decart Realtime Webcam Studio

Local TypeScript React app for realtime webcam transformation with Decart.

Supported model modes:

- Lucy 2.1, model id `lucy-2.1`, for realtime character/video transformation.
- Lucy VTON 3, model id `lucy-vton-3`, for realtime virtual try-on.

The two modes run separately. Combined mode is intentionally not implemented.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Express
- `@decartai/sdk` `0.1.9`

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

Do not create a `VITE_DECART_API_KEY` variable. The permanent Decart API key must stay server-side.

## Environment Variables

- `DECART_API_KEY`: required server-only Decart API key used to create short-lived realtime client tokens.
- `PORT`: local server port. Defaults to `3000`.
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
Content-Type: application/json

{ "model": "lucy-2.1" }
```

The `model` field may be `lucy-2.1` or `lucy-vton-3`. If omitted, the server defaults to `lucy-2.1` for backward compatibility. The endpoint returns a temporary `ek_` client token scoped to the requested model and current localhost origin. Do not log, commit, or share token values.

## Current UI

The app opens directly into a full-screen video surface with a compact floating control panel.

The panel supports:

- Model mode selector.
- Mode-aware prompt input.
- Lucy 2.1 reference portrait upload.
- Lucy VTON 3 garment image upload.
- Enhance prompt toggle.
- Start, Stop, Apply, and Reset actions.
- Session timer.
- Status summary for model, session, and pending changes.
- Friendly error display.
- Auto-hide behavior while video is live.

## Current Runtime Flow

1. User selects Lucy 2.1 or Lucy VTON 3.
2. Browser requests camera access using the selected model dimensions.
3. Browser posts to `/api/realtime-token` with the selected model id.
4. Express creates a short-lived Decart client token using server-side `DECART_API_KEY`.
5. Browser creates a Decart client with the temporary token.
6. Browser connects the webcam stream to `models.realtime(modelId)`.
7. Decart returns a transformed remote stream, which replaces the local preview.
8. Apply sends the full intended state with `realtimeClient.set({ prompt, image, enhance })`.
9. Stop disconnects the realtime client and stops camera tracks.

## Manual Test Checklist

- App loads at `http://localhost:3000`.
- `GET /api/health` returns `{ "ok": true }`.
- `POST /api/realtime-token` without a body returns a Lucy 2.1-scoped temporary token.
- `POST /api/realtime-token` with `{ "model": "lucy-2.1" }` returns a Lucy 2.1-scoped temporary token.
- `POST /api/realtime-token` with `{ "model": "lucy-vton-3" }` returns a Lucy VTON 3-scoped temporary token.
- Unsupported model ids return `400`.
- Browser source does not contain `VITE_DECART_API_KEY` or the permanent `DECART_API_KEY` value.
- Start asks for webcam permission.
- Lucy 2.1 prompt-only start works.
- Lucy 2.1 reference portrait apply works.
- Lucy 2.1 prompt + reference portrait apply keeps both fields active.
- Lucy VTON 3 garment prompt-only start works.
- Lucy VTON 3 garment image-only apply works.
- Lucy VTON 3 prompt + garment image apply keeps both fields active.
- Unsupported image MIME types show a friendly validation error.
- Reset restores the selected model defaults.
- Stop disconnects the realtime client and stops camera tracks.
- Start, Stop, then Start again works repeatedly.
- Switching model after stopping works.
- Timer starts while connected/generating/reconnecting and resets after Stop.
- Mobile layout keeps video primary and controls usable.

## Troubleshooting

- `Could not create realtime session token`: confirm `DECART_API_KEY` exists in `.env`, then restart `npm run dev`.
- `Unsupported realtime model`: confirm the request model is `lucy-2.1` or `lucy-vton-3`.
- `Camera permission was denied`: allow camera access for localhost in the browser and retry Start.
- `No camera was found`: connect or enable a webcam and retry.
- Browser blocks camera on HTTP: use `https://localhost:3000` and accept the local certificate warning.
- Decart connection fails after token creation: verify Decart API access, selected model availability, and network/WebRTC connectivity.
- VTON fails while Lucy 2.1 works: verify your Decart account has realtime access to `lucy-vton-3`.
- Apply stays disabled: wait until status is Connected or Generating.

## Known Limitations

- Local MVP only. No deployment hardening is included.
- No auth, database, recording, gallery, payments, analytics, or session history.
- Uploaded reference/garment images stay in browser memory only and are not persisted.
- The Decart SDK chunk is large, so production build warns about chunk size.
- Real webcam, WebRTC, and visual model output still require manual browser QA.
- Combined Lucy 2.1 + Lucy VTON 3 mode has not been designed or implemented.
