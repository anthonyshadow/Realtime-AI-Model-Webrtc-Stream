# Implementation Rules

## Prime Directive

Keep the app small, local, and reliable. Protect the existing Lucy 2.1 flow while supporting Lucy VTON 3 as a separate model mode.

Do not implement combined model mode until Lucy 2.1 and Lucy VTON 3 are both stable independently and Decart's realtime pipeline options are verified.

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
- `@decartai/sdk` `0.1.9`

Do not add unrelated dependencies.

## Supported Model Modes

Current supported modes:

```ts
"lucy-2.1" | "lucy-vton-3"
```

Rules:

- Add supported frontend modes in `src/constants/models.ts`.
- Add supported backend token modes in `server/decartToken.ts`.
- Keep mode-specific labels, defaults, and image behavior in the registry.
- Do not scatter model-specific string literals through components.
- Do not use `lucy-vton-latest` for this app unless explicitly requested; use pinned `lucy-vton-3`.

## Security Rules

- `DECART_API_KEY` must stay server-side.
- Never expose `DECART_API_KEY` to frontend code.
- Never use `VITE_DECART_API_KEY`.
- The frontend must call `POST /api/realtime-token`.
- The backend must create short-lived Decart client tokens.
- Token scope must include the requested allowed model only.
- Token scope must include current localhost `http` and `https` origins.
- Token constraints should cap realtime session duration.
- Do not log permanent API keys.
- Do not log client tokens.
- Do not persist uploaded reference or garment images.
- Do not commit `.env`.

## Architecture Rules

- Keep files small and responsibility-focused.
- Do not put orchestration logic in `App.tsx`.
- `App.tsx` may own selected mode and form draft state.
- Hooks own lifecycle and orchestration logic.
- `lib/` helpers own isolated utilities.
- `components/` own UI only.
- `constants/models.ts` owns model configuration.
- `constants/prompts.ts` owns prompt defaults.
- `types/` owns shared TypeScript types.
- Backend token creation belongs in `server/`.

## App Boundary Rules

`App.tsx` may:

- Hold selected model mode.
- Hold current prompt/image/enhance draft.
- Track pending changes.
- Create hook instances.
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

`useDecartRealtimeSession` owns:

- Input validation before start/apply.
- Camera start.
- Token fetch orchestration.
- Decart realtime connection.
- Remote stream state.
- Apply prompt/image/enhance behavior.
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

`lib/media.ts` owns:

- `getCameraStream(model)`
- `stopMediaStream(stream)`
- `attachStreamToVideo(video, stream)`

`lib/decartClient.ts` owns browser-safe Decart utilities:

- `fetchRealtimeToken(modelMode)`
- `createBrowserDecartClient(token)`
- `getRealtimeModel(modelMode)`
- `connectRealtimeModel(input)`

This file must never import or read `DECART_API_KEY`.

`lib/realtimeState.ts` owns realtime payload creation:

- Prompt only.
- Image only.
- Prompt plus image atomically.
- Lucy 2.1 image-only default prompt.
- VTON image-only without invented prompt.
- No-op when neither prompt nor image exists.

`lib/errors.ts` owns user-friendly error mapping.

`lib/time.ts` owns timer formatting.

## Component Rules

Components should be presentational. They receive state and callbacks through props.

Current UI pieces:

- `VideoStage`
- `VideoPlaceholder`
- `StatusBadge`
- `AutoHidingControlPanel`
- `ControlPanel`
- `ModelModeSelector`
- `StatusSummary`
- `PromptInput`
- `ImageUpload`
- `EnhanceToggle`
- `SessionControls`
- `TimerDisplay`
- `ErrorBanner`

Do not put all UI into one component.

## Realtime State Rules

`realtimeClient.set()` replaces the full realtime state.

When prompt and image should both remain active, send both in the same `set()` call.

Use the selected model registry to decide image-only behavior:

- Lucy 2.1 image-only: send image plus default character substitution prompt.
- Lucy VTON 3 image-only: send image only.

Do not make separate `set()` calls for prompt and image when the user intends them to work together.

## UI Rules

The app should be a single-page, full-screen video experience.

Required controls:

- Model mode selector.
- Start.
- Stop.
- Apply.
- Reset.
- Prompt input.
- Image upload.
- Clear image.
- Enhance prompt toggle.
- Status.
- Errors.
- Session timer.

Use a polished floating control panel over the video. Video remains primary. The panel may auto-hide during active generation, but setup, connection, and error states must remain easy to read.

Disable Apply unless the realtime session is connected or generating.

Disable model switching while a session is running or connecting.

Before start, show a dark placeholder and a clear prompt to start the camera.

After stop, clear the stream, stop camera tracks, disconnect Decart, reset timer, and return to disconnected.

## Environment Rules

`.env.example` should include:

```text
DECART_API_KEY=dct_your_server_side_key_here
PORT=3000
NODE_ENV=development
```

Do not create `.env` automatically.

## Explicit Non-Goals

Do not add these unless the user explicitly asks:

- Combined model mode.
- Auth.
- Database.
- Recording.
- Payments.
- Gallery.
- Analytics.
- Deployment.
- Sharing.
- Cloud uploads.
- Session history.
- Prompt preset gallery.
- Admin panel.

## Verification Checklist

Before calling the app ready, verify:

- `npm run typecheck` passes.
- `npm run build` passes.
- `GET /api/health` works.
- `POST /api/realtime-token` defaults to a Lucy 2.1-scoped token.
- `POST /api/realtime-token` scopes `lucy-2.1` correctly.
- `POST /api/realtime-token` scopes `lucy-vton-3` correctly.
- Unsupported model ids return `400`.
- `DECART_API_KEY` remains server-only.
- No `VITE_DECART_API_KEY` exists.
- Start requests camera permission.
- Lucy 2.1 prompt-only works.
- Lucy 2.1 reference image works.
- Lucy 2.1 prompt plus reference image works.
- Lucy VTON 3 prompt-only works.
- Lucy VTON 3 garment image works.
- Lucy VTON 3 prompt plus garment image works.
- Stop disconnects realtime client.
- Stop turns off camera tracks.
- Start, Stop, Start works repeatedly.
- Switching model after stopping works.
- Timer starts, stops, and resets correctly.
- Errors are readable.
- Components remain small.
- No out-of-scope product features were added.
