# Testing

This project uses npm scripts for all automated checks.

## Test Stack

- Vitest for unit and component tests.
- React Testing Library for user-visible component behavior.
- `@testing-library/jest-dom` and `@testing-library/user-event` for DOM assertions and interactions.
- MSW for mocked HTTP responses from `/api/realtime-token`.
- Storybook's Vitest addon for automated story rendering and focused story `play` interactions.
- Playwright for browser E2E tests.

Default tests never call the live Decart API. Decart SDK calls, token requests, media devices, media streams, video playback, and WebRTC constructors are mocked in test environments.

## Commands

```bash
npm run typecheck
npm run test:unit
npm run test:watch
npm run test:coverage
npm run test:storybook
npm run test:storybook:watch
npm run test:storybook:coverage
npm run test:e2e
npm run test:e2e:ui
npm run test:all
npm run build
```

`npm test` is an alias for `npm run test:unit`.

## Unit And Component Tests

Vitest reads `vitest.config.ts`. Unit and component scripts run two projects:

- `browser`: `src/**/*.test.ts(x)` in jsdom with React/browser mocks.
- `server`: `server/**/*.test.ts` in Node with no React/browser setup.

Shared setup lives in:

- `src/test/setup.ts`
- `src/test/mocks/browserMocks.ts`
- `src/test/mocks/handlers.ts`
- `src/test/mocks/server.ts`

The browser mocks cover:

- `navigator.mediaDevices.getUserMedia`
- `MediaStream`
- `MediaStreamTrack`
- `RTCPeerConnection`
- `RTCSessionDescription`
- `RTCIceCandidate`
- video `play`, `pause`, and `load`
- object URLs for upload previews

## Storybook Tests

Storybook tests run through the `storybook` Vitest project:

```bash
npm run test:storybook
npm run test:storybook:watch
npm run test:storybook:coverage
```

This project uses `@storybook/addon-vitest` with Vitest browser mode and Playwright Chromium. It renders the stories from `.storybook/main.ts` and runs selected story `play` functions.

Storybook tests should cover isolated component states and short, user-visible interactions such as:

- prompt typing
- model selector changes
- image upload display state
- start/apply/stop/reset button states
- error and permission-denied display
- the control panel options disclosure
- mocked API success/failure states

Do not duplicate full app flows in Storybook. Keep those in Playwright. Do not move pure logic checks out of Vitest unit tests.

Storybook reuses the shared MSW token handler from `src/test/mocks/handlers.ts` and browser/session mocks from `src/test/mocks/storybookBrowserMocks.ts`. The Storybook scripts force:

```text
VITE_USE_MOCK_DECART=true
STORYBOOK_DISABLE_TELEMETRY=1
```

MSW allows local Storybook asset requests but fails unhandled API or external requests. Stories must not read secrets, call live Decart endpoints, request a real webcam, or create real WebRTC sessions.

## E2E Tests

Playwright reads `playwright.config.ts` and runs `tests/e2e/*.spec.ts`.

The E2E server uses:

```text
PORT=3100
DECART_API_KEY=dct_test_key
VITE_USE_MOCK_DECART=true
```

The browser receives a fake Decart SDK through a test-only global, and token requests are fulfilled with Playwright route mocks. Playwright always starts its own server with this mock environment and does not reuse an existing dev server, which prevents accidental runs against a live Decart-flavored local process.

The E2E suite also blocks and fails on external HTTP(S) or WebSocket requests. Local requests to `localhost` and `127.0.0.1` are allowed for app assets, the health check, Vite, and the mocked token endpoint. If port `3100` is busy, run with another port:

```bash
E2E_PORT=3101 npm run test:e2e
```

The main browser flow asserts the selected model payload, token request body, initial Decart state, apply payload, stop behavior, camera-denied behavior, and API failure behavior.

## Full Check

`npm run test:all` runs typecheck, unit/component tests, Storybook tests, Playwright E2E tests, the Storybook static build, and the production app build.

## Live Decart Smoke Tests

No live Decart smoke test is enabled yet. A safe live smoke test should be added only when it can:

- require `RUN_LIVE_DECART_TESTS=true`
- require a real `DECART_API_KEY`
- use a controlled fake camera source
- cap session duration tightly
- assert connection lifecycle without depending on generated visual quality
- never run from `npm test`, `npm run test:unit`, `npm run test:e2e`, or `npm run test:all`
- bypass the E2E external-network guard only inside the explicitly live smoke test

Current TODO: design a live smoke path that can verify a short Decart realtime connection without making local webcam availability, browser permissions, account access, or model billing part of default CI/local checks.
