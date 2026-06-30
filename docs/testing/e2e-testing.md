# E2E Testing
> Last updated: 2026-06-30

Use this for Playwright app and accessibility tests.

## App E2E

`playwright.config.ts` runs `tests/e2e/*.spec.ts`.

The web server uses:

```text
PORT=3100
DECART_API_KEY=dct_test_key
VITE_USE_MOCK_DECART=true
```

Playwright starts its own server and does not reuse existing local servers.

Run:

```bash
npm run test:e2e
```

If port `3100` is busy:

```bash
E2E_PORT=3101 npm run test:e2e
```

## A11y E2E

`playwright.a11y.config.ts` runs `tests/a11y/*.spec.ts` against a mocked Storybook server on port `6106` by default.

Run:

```bash
npm run test:a11y
```

## Network Guard

Both E2E suites block unexpected external HTTP(S) and WebSocket requests. Localhost and `127.0.0.1` are allowed for app assets, Vite, health checks, Storybook, and mocked API responses.

App E2E tests also track Decart-sensitive network paths separately. Local camera flows must leave `/api/realtime-token`, Decart connect events, and external Decart HTTP/WebSocket paths untouched.

## Browser API Mocks

`tests/e2e/app.spec.ts` installs deterministic browser mocks for webcam/microphone streams, Decart realtime events, `MediaRecorder`, `URL.createObjectURL()`, and `URL.revokeObjectURL()`. Recording tests should assert against those mock event logs instead of requiring a real camera, live recorder, backend upload, or external Decart service.

The mocked `MediaRecorder` exposes deterministic MIME support, records start/stop counts, emits `dataavailable` and `stop` events asynchronously, and records the number of video/audio tracks in each recorder instance. The mocked camera stream includes video plus microphone audio so local recording and model audio fallback can be tested without a real device prompt.

## Covered Regression Areas

App E2E currently covers:

- Local camera default selection.
- Local camera start with webcam/microphone request and no Decart token, connect, SDK, or external Decart network path.
- Lucy 2.1 and Lucy VTON 3 model-backed token/connect paths.
- Atomic prompt/image/enhance Apply payloads.
- Reset and clear-image behavior.
- Recording start/stop, review playback, download filename, discard/reset, stop-session-while-recording, start/stop/start again, and object URL revocation.

## Manual Browser QA Checklist

Run this checklist with a real browser and real devices before treating media behavior as production-ready:

- Start Local camera from a fresh load; confirm camera and microphone permission prompts, local preview, timer, and Stop session.
- Start Local camera, record a short clip, stop recording, play it back, download it, discard it, then stop the session.
- Stop the session while recording; confirm the clip finalizes or the UI remains recoverable.
- Start Lucy 2.1 with a prompt; confirm token creation, transformed output display, Apply, Reset, and Stop session.
- Start Lucy 2.1 with a reference portrait; apply prompt/image/enhance changes and clear the portrait.
- Start Lucy VTON 3 with a garment image; apply prompt/image/enhance changes and clear the garment image.
- In a model-backed session, confirm recording stays disabled until transformed output is available, then records the transformed video.
- Check whether the Decart output stream includes audio in the target browser; confirm the fallback to local microphone audio is acceptable when output audio is absent.
- Repeat recording checks in Chrome, Safari desktop, and iOS Safari where available because `MediaRecorder` MIME support differs.
- Confirm the mobile-width layout keeps Stop session, Stop recording, review playback, Download, and Discard reachable and visually distinct.
