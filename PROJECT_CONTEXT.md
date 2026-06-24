# Project Context

## MVP Goal

Build a local TypeScript React MVP for Decart Lucy 2.1 realtime webcam transformation.

The app should run at:

```text
http://localhost:3000
```

The finished MVP will be a single-page, full-screen webcam video UI where Decart Lucy 2.1 transforms the live camera stream over WebRTC. A floating control panel overlays the video and lets the user start and stop the session, enter a prompt, upload a reference image, apply updates while running, see status and errors, and track elapsed session time.

## Required Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Express
- `@decartai/sdk`

Use one local Express server on port `3000`. The Express server should serve the React app through Vite middleware during development and expose same-origin API endpoints.

## Core Product Scope

Required MVP capabilities:

- Full-screen video stage.
- Floating prompt and image control panel.
- `Start`, `Stop`, and `Apply` controls.
- Prompt textarea.
- JPEG, PNG, and WebP reference image upload.
- Connection status.
- User-friendly error display.
- Session timer.
- Webcam permission flow.
- Decart Lucy 2.1 realtime WebRTC connection.
- Live prompt and reference image updates without reconnecting.

Out of scope unless explicitly requested:

- Auth
- Database
- Recording
- Payments
- Gallery
- Analytics
- Deployment
- Cloud upload
- Multi-user sessions
- Admin tools

## Decart Basics

Use the realtime model:

```ts
models.realtime("lucy-2.1")
```

The frontend must call:

```text
POST /api/realtime-token
```

The backend creates a short-lived Decart client token using server-side `DECART_API_KEY`.

Never expose the permanent Decart API key to browser code. Do not use `VITE_DECART_API_KEY`.

## Security Rule

`DECART_API_KEY` is a server-only secret. It belongs in `.env` and must only be read by backend code. The browser receives only a scoped, short-lived client token.

## UX Direction

The final app should open directly into the working MVP experience, not a marketing page.

Before start:

- Dark full-screen video placeholder.
- Centered message such as `Start camera to begin`.
- Floating control panel visible.

While connecting:

- Show loading state.
- Disable `Start`.
- Disable `Apply` until connected.

While running:

- Show transformed remote Lucy stream.
- Timer counts active session time.
- Prompt and image can be updated.

After stop:

- Disconnect realtime client.
- Stop camera tracks.
- Clear video stream.
- Reset timer.
- Return status to idle.

## Acceptance Criteria

The MVP is complete when:

- `npm run dev` opens `http://localhost:3000`.
- The page is a single full-screen video experience.
- `Start` asks for webcam permission.
- A Decart realtime token is created through the backend.
- The webcam stream connects to `lucy-2.1`.
- The transformed output stream displays on the page.
- The user can enter and apply a prompt.
- The user can upload and apply a JPEG, PNG, or WebP reference image.
- Prompt and image can be applied together.
- `Stop` disconnects Lucy and turns off the camera.
- Timer shows elapsed active session time.
- No permanent API key appears in frontend source.
- Files are split into small components, hooks, helpers, constants, and types.

## Implementation Phases

1. Create context files and project rules.
2. Scaffold React, TypeScript, Vite, Tailwind, and Express on port `3000`.
3. Add backend Decart token endpoint.
4. Add local webcam start/stop and timer without Decart.
5. Connect webcam to Lucy 2.1 realtime.
6. Add prompt and reference image apply logic.
7. Polish loading, disabled states, errors, cleanup, and MVP readiness.

