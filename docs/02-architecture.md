# Architecture
> Last updated: 2026-06-28

Use this for source boundaries and runtime ownership. It reflects the current source tree after the documentation and scaffold migration.

## High-Level Flow

```text
Browser React app
  -> selected model mode: lucy-2.1 or lucy-vton-3
  -> POST /api/realtime-token { model }
Local Express server
  -> validates model id
  -> creates short-lived Decart token using DECART_API_KEY
Decart API
  -> returns temporary client token
Browser React app
  -> requests webcam with selected model dimensions
  -> connects stream to Decart realtime using temporary token
Decart realtime WebRTC
  -> returns transformed video stream
Browser React app
  -> displays transformed stream full-screen
```

## Current Structure

```text
server/
  index.ts
  env.ts
  decartToken.ts
  localhostCertificate.ts
  dualProtocolServer.ts
src/
  main.tsx
  App.tsx
  stories/
  tests/
  components/
    ControlPanel/
      *.tsx
      stories/
      tests/
    VideoStage/
      *.tsx
      stories/
  hooks/
  lib/
  constants/
  types/
  test/
tests/
  a11y/
  e2e/
```

## Ownership Boundaries

- `src/App.tsx`: page composition, selected mode, draft prompt/image/enhance state, pending changes, hook composition.
- `src/hooks/useDecartRealtimeSession.ts`: camera start, token fetch orchestration, realtime connection, apply, stop, errors, streams, and lifecycle cleanup.
- `src/hooks/useSessionTimer.ts`: elapsed time and display label.
- `src/hooks/useObjectUrl.ts`: object URL creation and revocation.
- `src/lib/decartClient.ts`: browser-safe token fetch, SDK import, client creation, model resolution, realtime connection, and initial-state mapping.
- `src/lib/realtimeState.ts`: atomic realtime state payload construction.
- `src/lib/media.ts`: camera stream, stream stop, and video attachment helpers.
- `src/lib/errors.ts`: user-friendly error mapping.
- `src/constants/models.ts`: supported model registry and mode-specific UI behavior.
- `server/decartToken.ts`: supported backend model validation and scoped client token creation.
- `server/index.ts`: Express app, health endpoint, token endpoint, Vite middleware, and production static serving.

## Component Boundary

Components are presentational. They receive state and callbacks through props and must not own Decart, token, WebRTC, camera, or timer orchestration.

Current UI pieces:

- `VideoStage`, `VideoPlaceholder`, `StatusBadge`
- `AutoHidingControlPanel`, `ControlPanel`, `ModelModeSelector`
- `StatusSummary`, `PromptInput`, `ImageUpload`
- `EnhanceToggle`, `SessionControls`, `TimerDisplay`, `ErrorBanner`

## State Update Rule

Decart realtime `set()` replaces the full session state. Send all intended prompt/image/enhance state in one call. Do not split prompt and image updates across separate `set()` calls when the user intends them to remain active together.
