# Architecture

## High-Level Flow

```text
Browser React app
  -> POST /api/realtime-token
Local Express server
  -> creates short-lived Decart token using DECART_API_KEY
Decart API
  -> returns temporary client token
Local Express server
  -> returns temporary token to browser
Browser React app
  -> connects webcam stream to Lucy 2.1 realtime using temporary token
Decart realtime WebRTC
  -> returns transformed video stream
Browser React app
  -> displays transformed stream full-screen
```

## Local Server

Use one local Express server on port `3000`.

Responsibilities:

- Serve the React app through Vite middleware during development.
- Expose `POST /api/realtime-token`.
- Keep `DECART_API_KEY` server-side.
- Create scoped, short-lived Decart client tokens.
- Serve the built app in production preview if needed.

Do not add auth, database, deployment, analytics, payments, recording, or unrelated backend features.

## Recommended Structure

```text
server/
  index.ts
  env.ts
  decartToken.ts
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
      ControlPanel.tsx
      PromptInput.tsx
      ImageUpload.tsx
      SessionControls.tsx
      TimerDisplay.tsx
      ErrorBanner.tsx
  hooks/
    useLucyRealtime.ts
    useSessionTimer.ts
    useObjectUrl.ts
  lib/
    decartClient.ts
    media.ts
    realtimeState.ts
    errors.ts
    time.ts
  types/
    realtime.ts
    decart.ts
  constants/
    app.ts
    prompts.ts
```

This structure is guidance for future implementation. Do not create application code until the app-building phase.

## File Boundaries

### `src/App.tsx`

Composition only.

Allowed responsibilities:

- Compose hooks.
- Compose page-level components.
- Pass state and callbacks down.

Not allowed:

- WebRTC orchestration.
- Decart SDK orchestration.
- Media stream setup.
- Timer internals.
- Direct token fetch details.
- Large UI implementation.

Expected shape:

```tsx
export function App() {
  const lucy = useLucyRealtime();
  const timer = useSessionTimer(lucy.isRunning);

  return (
    <main>
      <VideoStage />
      <ControlPanel />
    </main>
  );
}
```

### `src/hooks/useLucyRealtime.ts`

Main lifecycle and orchestration hook.

Responsibilities:

- Start webcam.
- Fetch realtime client token.
- Connect to Lucy 2.1 realtime.
- Store local webcam stream.
- Store remote transformed stream.
- Apply prompt and image state.
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
  isRunning,
  isConnecting,
  start,
  stop,
  apply,
}
```

### `src/hooks/useSessionTimer.ts`

Responsibilities:

- Count elapsed seconds while running.
- Reset on stop.
- Return formatted elapsed label.

### `src/hooks/useObjectUrl.ts`

Responsibilities:

- Create preview object URLs for uploaded images.
- Revoke previous URLs on change.
- Revoke URL on unmount.

### `src/lib/media.ts`

Responsibilities:

- Request camera stream using Lucy model constraints.
- Stop all tracks in a `MediaStream`.
- Attach a stream to a video element.

### `src/lib/decartClient.ts`

Responsibilities:

- Fetch a token from `POST /api/realtime-token`.
- Create browser Decart client with the temporary token.
- Return the Lucy realtime model.

This file must never import or read `DECART_API_KEY`.

### `src/lib/realtimeState.ts`

Responsibilities:

- Build safe Lucy realtime state payloads.
- Handle prompt-only, image-only, and prompt-plus-image states.
- Ensure omitted fields are intentional because `realtimeClient.set()` replaces full state.

### `src/lib/errors.ts`

Responsibilities:

- Convert low-level errors into user-friendly messages.
- Keep error text consistent.

### `src/lib/time.ts`

Responsibilities:

- Format elapsed seconds as timer labels.
- Keep time utilities isolated from UI.

### `components/`

UI only.

Components may render state and call callbacks. They should not own Decart, WebRTC, token, timer, or media orchestration.

## Type Boundaries

Use shared types for realtime status and hook contracts.

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

```ts
export type ApplyLucyStateInput = {
  prompt: string;
  image: File | null;
  enhance?: boolean;
};
```

## UI Component Boundaries

`VideoStage`:

- Render full-screen output video.
- Render placeholder when no stream exists.
- Render status badge.

`ControlPanel`:

- Own form UI composition.
- Render prompt input, image upload, session controls, timer, and errors.
- Receive values and callbacks through props.

`PromptInput`:

- Textarea and prompt helper text.

`ImageUpload`:

- File input.
- Preview thumbnail.
- Clear image button.
- Supported file validation UI.

`SessionControls`:

- `Start`, `Stop`, and `Apply` buttons.
- Disabled and loading states.

`TimerDisplay`:

- Display elapsed running time.

`ErrorBanner`:

- Display friendly error messages.

