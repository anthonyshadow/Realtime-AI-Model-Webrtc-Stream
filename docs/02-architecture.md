# Architecture
> Last updated: 2026-06-29

Use this for source boundaries and runtime ownership. It reflects the current source tree after the documentation and scaffold migration.

## High-Level Flow

```text
Browser React app
  -> selected session mode: local, lucy-2.1, or lucy-vton-3
  -> local mode: request webcam and microphone, display local stream
  -> model-backed modes: POST /api/realtime-token { model }
Local Express server
  -> validates model id
  -> creates short-lived Decart token using DECART_API_KEY
Decart API
  -> returns temporary client token
Browser React app
  -> requests webcam and microphone with selected model dimensions
  -> connects stream to Decart realtime using temporary token
Decart realtime WebRTC
  -> returns transformed video stream
Browser React app
  -> displays transformed stream full-screen
  -> records transformed stream output when available
```

## Session Modes And Branching

Session modes live in `src/constants/sessionModes.ts`.

- `local`: Local camera preview. This is the default selected mode and is not a Decart model id.
- `lucy-2.1`: model-backed Lucy 2.1 realtime transformation.
- `lucy-vton-3`: model-backed Lucy VTON 3 realtime virtual try-on.

The session mode registry stores the user-facing labels, start labels, video placeholder copy, and `kind` (`local` or `model`). Model-backed modes reuse ids from `src/constants/models.ts`; local mode stays separate so it cannot be sent to the token endpoint or Decart SDK path by accident.

`App.tsx` converts the current draft into a `StartRealtimeSessionInput`. `useLiveSession().start()` branches on `isLocalSessionMode()` before model-backed work:

- Local start calls `useMediaSession().startLocalCamera()` and then marks the session `connected`.
- Model start calls `useDecartModelSession().start()`, which dynamically imports `src/lib/decartClient.ts`, resolves the Decart model, requests a scoped token, creates the Decart client, and connects realtime.

That ordering is the primary guardrail: local mode returns from the local branch before the Decart hook imports or token path can run. E2E tests also guard `/api/realtime-token`, Decart connect events, and external Decart network paths for local start.

To add a future model-backed mode, add it to `src/constants/models.ts`, expose it through `src/constants/sessionModes.ts`, and allow it in `server/decartToken.ts`. Recording should continue to work through `useLiveSession().recordableStream` without duplicating recording UI or hook logic.

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

- `src/App.tsx`: page composition, selected mode, draft prompt/image/enhance state, pending changes, recording hook composition, and hook wiring.
- `src/hooks/useLiveSession.ts`: live-session orchestration, local-vs-model branching, central lifecycle status, display stream, local input stream, model output stream, model-output-first recordable stream, recordable stream source metadata, and cleanup routing.
- `src/hooks/useMediaSession.ts`: camera and microphone acquisition, model camera acquisition, media status, permission/device errors, local input stream ownership, track stopping, and media cleanup.
- `src/hooks/useDecartModelSession.ts`: Decart realtime model resolution, token/client/connect path, model output stream, realtime apply/reset, Decart errors, and Decart client cleanup.
- `src/hooks/useDecartRealtimeSession.ts`: compatibility re-export for `useLiveSession`.
- `src/hooks/useSessionRecording.ts`: model-agnostic `MediaRecorder` lifecycle, recording state, chunk collection, Blob/object URL ownership, elapsed time, filename, size, reset/delete, and URL cleanup.
- `src/hooks/useSessionTimer.ts`: elapsed time and display label.
- `src/hooks/useObjectUrl.ts`: object URL creation and revocation.
- `src/lib/decartClient.ts`: browser-safe token fetch, SDK import, client creation, model resolution, realtime connection, and initial-state mapping.
- `src/lib/realtimeState.ts`: atomic realtime state payload construction.
- `src/lib/media.ts`: local media stream, model camera stream, stream stop, and video attachment helpers.
- `src/lib/recording.ts`: MIME type selection, recording extension mapping, timestamped filename generation, duration formatting, and file size formatting.
- `src/lib/streamComposition.ts`: recordable stream composition from local or model output tracks without stopping source tracks.
- `src/lib/errors.ts`: user-friendly error mapping.
- `src/constants/models.ts`: supported model registry and mode-specific UI behavior.
- `src/constants/sessionModes.ts`: local and model-backed session mode registry.
- `server/decartToken.ts`: supported backend model validation and scoped client token creation.
- `server/index.ts`: Express app, health endpoint, token endpoint, Vite middleware, and production static serving.

## Component Boundary

Components are presentational. They receive state and callbacks through props and must not own Decart, token, WebRTC, camera, or timer orchestration.

Current UI pieces:

- `VideoStage`, `VideoPlaceholder`, `StatusBadge`
- `AutoHidingControlPanel`, `ControlPanel`, `SessionModeSelector`
- `StatusSummary`, `PromptInput`, `ImageUpload`
- `EnhanceToggle`, `RecordingControls`, `RecordingPlaybackPanel`, `SessionControls`, `TimerDisplay`, `ErrorBanner`

## State Update Rule

Decart realtime `set()` replaces the full session state. Send all intended prompt/image/enhance state in one call. Do not split prompt and image updates across separate `set()` calls when the user intends them to remain active together.
