# Implementation Rules

## Prime Directive

Do not overbuild. Build the smallest local MVP that proves the live Lucy 2.1 webcam transformation loop.

Create code only when explicitly asked for the implementation phase. The first phase is documentation/context only.

## Required Runtime

The app must run locally at:

```text
http://localhost:3000
```

Use:

- React
- TypeScript
- Vite
- Tailwind CSS
- Express
- `@decartai/sdk`

Do not add unrelated dependencies.

## Security Rules

- `DECART_API_KEY` must stay server-side.
- Never expose `DECART_API_KEY` to frontend code.
- Never use `VITE_DECART_API_KEY`.
- The frontend must call `POST /api/realtime-token`.
- The backend must create short-lived Decart client tokens.
- Token scope should include `allowedModels: ["lucy-2.1"]`.
- Token scope should include `allowedOrigins: ["http://localhost:3000", "https://localhost:3000"]`.
- Token constraints should cap realtime session duration for the MVP.
- Do not log permanent API keys.
- Do not log client tokens.
- Do not persist uploaded reference images.
- Do not commit `.env`.

## Architecture Rules

- Keep files small and responsibility-focused.
- Do not put orchestration logic in `App.tsx`.
- `App.tsx` should only compose hooks and components.
- Hooks own lifecycle and orchestration logic.
- `lib/` helpers own isolated utilities.
- `components/` own UI only.
- `constants/` own static text, app constants, and prompt defaults.
- `types/` own shared TypeScript types.
- Backend token creation belongs in `server/`.

## App Boundary Rules

`App.tsx` may:

- Create hook instances.
- Hold page-level form state if needed.
- Pass props to components.
- Compose the page.

`App.tsx` must not:

- Call Decart SDK directly.
- Request media devices directly.
- Fetch Decart tokens directly.
- Own WebRTC lifecycle details.
- Own timer internals.
- Become a large UI file.

## Hook Rules

`useLucyRealtime` owns:

- Camera start.
- Token fetch orchestration.
- Lucy realtime connection.
- Remote stream state.
- Apply prompt/image behavior.
- Stop/disconnect cleanup.
- Error and status transitions.

`useSessionTimer` owns:

- Elapsed time state.
- Running/reset lifecycle.
- Formatted timer label.

`useObjectUrl` owns:

- Image preview URL creation.
- URL revocation.

## Helper Rules

`lib/media.ts` owns media utilities:

- `getCameraStream(model)`
- `stopMediaStream(stream)`
- `attachStreamToVideo(videoElement, stream)`

`lib/decartClient.ts` owns browser-safe Decart utilities:

- `fetchRealtimeToken()`
- `createBrowserDecartClient(token)`
- `getLucyModel()`

`lib/realtimeState.ts` owns Lucy state payload creation:

- Prompt only.
- Image only with default character prompt.
- Prompt plus image atomically.
- No-op when neither exists.

`lib/errors.ts` owns user-friendly error mapping.

`lib/time.ts` owns timer formatting.

## Component Rules

Components should be presentational. They receive state and callbacks through props.

Required UI pieces for the final app:

- `VideoStage`
- `VideoPlaceholder`
- `StatusBadge`
- `ControlPanel`
- `PromptInput`
- `ImageUpload`
- `SessionControls`
- `TimerDisplay`
- `ErrorBanner`

Do not put all UI into one component.

## Lucy State Rules

`realtimeClient.set()` replaces the full Lucy state.

When prompt and image should both remain active, send both in the same `set()` call.

Use `enhance: true` by default.

For image-only apply, include the default character prompt:

```text
Substitute the character in the video with the person in the reference image.
```

Do not make separate `set()` calls for prompt and image when the user intends them to work together.

## UI Rules

The final app should be a single-page, full-screen video experience.

Required controls:

- `Start`
- `Stop`
- `Apply`
- Prompt input
- Image upload
- Clear image
- Status
- Errors
- Session timer

Use a polished floating control panel over the video. Keep styling simple and focused.

Disable `Apply` unless the realtime session is connected or generating.

Before start, show a dark placeholder and a clear prompt to start the camera.

After stop, clear the stream, stop camera tracks, disconnect Lucy, reset timer, and return to idle.

## Environment Rules

`.env.example` should eventually include:

```text
DECART_API_KEY=dct_your_server_side_key_here
PORT=3000
NODE_ENV=development
```

Do not create `.env` automatically.

## Explicit Non-Goals

Do not add these unless the user explicitly asks:

- Auth
- Database
- Recording
- Payments
- Gallery
- Analytics
- Deployment
- Sharing
- Cloud uploads
- Session history
- Prompt preset gallery
- Admin panel

## Implementation Order

1. Context files and rules.
2. Project scaffolding.
3. Backend token endpoint.
4. Webcam preview without Decart.
5. Lucy 2.1 realtime connection.
6. Prompt and reference image apply logic.
7. Polish and MVP readiness audit.

Do not skip ahead unless explicitly requested.

## Acceptance Checklist

Before calling the MVP done, verify:

- App runs on `http://localhost:3000`.
- `POST /api/realtime-token` creates short-lived client tokens.
- `DECART_API_KEY` remains server-only.
- No `VITE_DECART_API_KEY` exists.
- `Start` requests camera permission.
- Webcam stream connects to `lucy-2.1`.
- Remote transformed stream displays.
- Prompt-only apply works.
- Image-only apply works.
- Prompt plus image apply works.
- Prompt and image are sent together when both are intended.
- `Stop` disconnects realtime client.
- `Stop` turns off camera tracks.
- Timer starts, stops, and resets correctly.
- Errors are readable.
- Components remain small.
- `App.tsx` remains composition only.
- No out-of-scope product features were added.
