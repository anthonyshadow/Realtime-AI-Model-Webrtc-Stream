# Architecture

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
Local Express server
  -> returns temporary token to browser
Browser React app
  -> requests webcam with selected model dimensions
  -> connects stream to Decart realtime using temporary token
Decart realtime WebRTC
  -> returns transformed video stream
Browser React app
  -> displays transformed stream full-screen
```

## Local Server

Use one local Express server on port `3000`.

Responsibilities:

- Serve the React app through Vite middleware during development.
- Expose `GET /api/health`.
- Expose `POST /api/realtime-token`.
- Keep `DECART_API_KEY` server-side.
- Validate requested realtime model ids.
- Create scoped, short-lived Decart client tokens.
- Serve the built app in production preview if needed.

Supported token model ids:

```ts
"lucy-2.1" | "lucy-vton-3"
```

If no model is supplied, the server defaults to `lucy-2.1` for backward compatibility. Unsupported model ids return `400`.

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
  index.css
  components/
    VideoStage/
      VideoStage.tsx
      VideoPlaceholder.tsx
      StatusBadge.tsx
    ControlPanel/
      AutoHidingControlPanel.tsx
      ControlPanel.tsx
      ModelModeSelector.tsx
      StatusSummary.tsx
      PromptInput.tsx
      ImageUpload.tsx
      EnhanceToggle.tsx
      SessionControls.tsx
      TimerDisplay.tsx
      ErrorBanner.tsx
  hooks/
    useDecartRealtimeSession.ts
    useSessionTimer.ts
    useObjectUrl.ts
  lib/
    decartClient.ts
    media.ts
    realtimeState.ts
    errors.ts
    time.ts
  constants/
    app.ts
    models.ts
    prompts.ts
  types/
    realtime.ts
    decart.ts
```

## File Boundaries

### `src/App.tsx`

Composition and page-level UI state.

Allowed responsibilities:

- Hold selected model mode.
- Hold current draft prompt/image/enhance values.
- Track whether changes are pending.
- Compose hooks.
- Compose page-level components.
- Pass state and callbacks down.

Not allowed:

- Direct Decart SDK calls.
- Direct media device calls.
- Direct token fetch details.
- WebRTC lifecycle internals.
- Large presentational UI.

### `src/constants/models.ts`

Model registry.

Responsibilities:

- Define supported model modes.
- Provide labels and mode-specific UI copy.
- Provide default prompts.
- Provide image-only behavior for each mode.
- Keep model-specific branching out of random UI components.

### `src/hooks/useDecartRealtimeSession.ts`

Main lifecycle and orchestration hook.

Responsibilities:

- Validate start/apply input.
- Get selected Decart realtime model.
- Start webcam.
- Fetch scoped realtime client token.
- Connect to selected Decart realtime model.
- Store local preview stream.
- Store remote transformed stream.
- Apply prompt/image/enhance updates.
- Track applying state.
- Disconnect realtime client.
- Stop media tracks.
- Handle SDK events.
- Handle errors.
- Clean up on unmount and page unload.

Expose a small API:

```ts
{
  status,
  error,
  localStream,
  remoteStream,
  activeModelMode,
  isRunning,
  isConnecting,
  isApplying,
  start,
  stop,
  apply,
}
```

### `src/lib/decartClient.ts`

Browser-safe Decart utilities.

Responsibilities:

- Fetch a scoped token from `POST /api/realtime-token`.
- Create browser Decart client with the temporary token.
- Resolve `models.realtime(modelMode)`.
- Connect the webcam stream to Decart realtime.
- Build SDK `initialState` from the shared realtime payload helper.

This file must never import or read `DECART_API_KEY`.

### `src/lib/realtimeState.ts`

State payload construction.

Responsibilities:

- Build one atomic payload for `realtimeClient.set()`.
- Preserve prompt/image/enhance together when the user intends them together.
- For Lucy 2.1 image-only updates, include the default character-reference prompt.
- For Lucy VTON 3 image-only updates, send the garment image without inventing a prompt.
- Return `null` when there is no prompt and no image.

### `src/lib/media.ts`

Media utilities.

Responsibilities:

- Request camera stream using selected model constraints.
- Stop all tracks in a `MediaStream`.
- Attach a stream to a video element.

### `components/`

UI only.

Components may render state and call callbacks. They should not own Decart, WebRTC, token, timer, or media orchestration.

## Type Boundaries

Realtime status:

```ts
export type RealtimeStatus =
  | "idle"
  | "requesting-camera"
  | "requesting-token"
  | "connecting"
  | "connected"
  | "generating"
  | "reconnecting"
  | "disconnected"
  | "error";
```

Supported model mode:

```ts
export type SupportedModelMode = "lucy-2.1" | "lucy-vton-3";
```

Apply/start input:

```ts
export type ApplyRealtimeStateInput = {
  modelMode: SupportedModelMode;
  prompt: string;
  image: File | null;
  enhance: boolean;
};
```

## State Update Rule

Decart realtime `set()` replaces the full session state. Omitted fields are cleared.

Always send all intended state in one call:

```ts
await realtimeClient.set({
  prompt,
  image,
  enhance,
});
```

Do not split intended combined state across separate calls.

## Cleanup Rule

Stop and unmount must:

- Disconnect the realtime client.
- Stop local camera tracks.
- Clear local and remote stream state.
- Clear active model state.
- Reset applying state.

Uploaded images remain browser-only `File` objects and preview object URLs are revoked by `useObjectUrl`.
