# Project Context

## Current Goal

This project is a local TypeScript React app for Decart realtime webcam transformation.

It currently supports two separate model modes:

- `lucy-2.1`: Lucy 2.1 realtime character/video transformation.
- `lucy-vton-3`: Lucy VTON 3 realtime virtual try-on.

The modes are selected independently. The app does not currently run both models together.

## Required Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Express
- `@decartai/sdk` `0.1.9`

Use one local Express server on port `3000`. The Express server serves the React app through Vite middleware during development and exposes same-origin API endpoints.

## Product Scope

Current capabilities:

- Full-screen video stage.
- Floating, auto-hiding control panel.
- Model mode selector.
- Prompt textarea.
- JPEG, PNG, and WebP upload.
- Lucy 2.1 reference portrait mode.
- Lucy VTON 3 garment image mode.
- Enhance prompt toggle.
- Start, Stop, Apply, and Reset controls.
- Connection status.
- Pending changes status.
- User-friendly error display.
- Session timer.
- Webcam permission flow.
- Decart realtime WebRTC connection.
- Live prompt and image updates without reconnecting.

Out of scope unless explicitly requested:

- Combined model mode.
- Auth.
- Database.
- Recording.
- Payments.
- Gallery.
- Analytics.
- Deployment.
- Cloud upload.
- Multi-user sessions.
- Admin tools.

## Decart Basics

Use realtime models through:

```ts
models.realtime("lucy-2.1");
models.realtime("lucy-vton-3");
```

The frontend calls:

```text
POST /api/realtime-token
```

with an optional JSON body:

```json
{ "model": "lucy-vton-3" }
```

The backend creates a short-lived Decart client token using server-side `DECART_API_KEY`. The token is scoped to the requested model and current localhost origin.

Never expose the permanent Decart API key to browser code. Do not use `VITE_DECART_API_KEY`.

## Security Rule

`DECART_API_KEY` is a server-only secret. It belongs in `.env` and must only be read by backend code. The browser receives only a scoped, short-lived client token.

## UX Direction

The app opens directly into the working video experience, not a marketing page.

Before start:

- Dark full-screen video placeholder.
- Current selected model is visible.
- Floating control panel is visible.

While connecting:

- Show connection state.
- Keep Stop available.
- Disable Apply until connected.
- Prevent model switching until stopped.

While running:

- Show transformed remote stream when Decart provides it.
- Timer counts active session time.
- Prompt and image can be updated with Apply.
- Panel may auto-hide so video remains primary.

After stop:

- Disconnect realtime client.
- Stop camera tracks.
- Clear video stream.
- Reset timer.
- Return status to disconnected.

## Acceptance Criteria

The current app is healthy when:

- `npm run dev` opens `http://localhost:3000`.
- `npm run typecheck` passes.
- `npm run build` passes.
- `POST /api/realtime-token` creates scoped short-lived client tokens.
- `DECART_API_KEY` remains server-only.
- No `VITE_DECART_API_KEY` exists.
- `Start` requests camera permission.
- Lucy 2.1 connects and transforms the webcam stream.
- Lucy VTON 3 connects and transforms the webcam stream.
- Prompt-only updates work.
- Image-only updates work where supported.
- Prompt plus image updates work atomically.
- `Stop` disconnects Decart and turns off camera tracks.
- Model switching is done after stopping.
- Timer and status states are clear.
- Components remain small and responsibility-focused.
