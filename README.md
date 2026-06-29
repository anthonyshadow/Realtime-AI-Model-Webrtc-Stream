# Decart Realtime Webcam Studio
> Last updated: 2026-06-29

Local TypeScript React app for local webcam preview and realtime webcam transformation with Decart.

Supported session modes:

- Local camera, `local`, for webcam and microphone preview without Decart.
- Lucy 2.1, `lucy-2.1`, for realtime character/video transformation.
- Lucy VTON 3, `lucy-vton-3`, for realtime virtual try-on.

The model-backed modes run separately. Combined mode is intentionally not implemented.

## Start Here

- Project map and doc index: [docs/00-start-here.md](docs/00-start-here.md)
- Architecture: [docs/02-architecture.md](docs/02-architecture.md)
- Development: [docs/03-development.md](docs/03-development.md)
- Testing: [docs/04-testing.md](docs/04-testing.md)
- Storybook: [docs/05-storybook.md](docs/05-storybook.md)
- Decart/Lucy integration: [docs/06-api-and-integrations.md](docs/06-api-and-integrations.md)
- Agent rules: [AGENTS.md](AGENTS.md)

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Express
- `@decartai/sdk` `0.1.9`
- npm with `package-lock.json`

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open:

```text
http://localhost:3000
https://localhost:3000
```

Add the server-side Decart key to `.env`:

```text
DECART_API_KEY=dct_your_server_side_key_here
PORT=3000
NODE_ENV=development
```

Do not create `VITE_DECART_API_KEY`. The permanent Decart API key must stay server-side.

## Common Checks

```bash
npm run typecheck
npm run test:unit
npm run test:storybook
npm run test:e2e
npm run build
```

Use `npm run test:all` for the full mocked suite. Use `npm run test:a11y` separately for Storybook accessibility smoke checks.

## Runtime Endpoints

```text
GET /api/health
POST /api/realtime-token
```

`POST /api/realtime-token` accepts `{ "model": "lucy-2.1" }` or `{ "model": "lucy-vton-3" }`. Local camera sessions do not call this endpoint. If omitted, the server defaults to `lucy-2.1` for backward compatibility and returns a short-lived `ek_` client token scoped to localhost and the selected model.

## Current Scope

The app opens directly into a full-screen video surface with a compact floating control panel. It supports local camera preview, model selection, prompts, reference/garment uploads, prompt enhancement, Start/Stop/Apply/Reset, status, timer, active-session recording controls, clip playback/download/delete, friendly errors, and panel auto-hide while video is live.

The codebase also includes a model-agnostic browser recording service and hook built on `MediaRecorder`. Recording gallery UI, cloud uploads, payments, analytics, deployment hardening, shared sessions, prompt galleries, and combined Lucy plus VTON mode remain out of scope unless explicitly requested.
