# WebRTC And Media
> Last updated: 2026-06-29

Use this for camera, media stream, video attachment, and realtime lifecycle behavior.

## Source Areas

- `src/hooks/useLiveSession.ts`
- `src/hooks/useMediaSession.ts`
- `src/hooks/useDecartModelSession.ts`
- `src/hooks/useDecartRealtimeSession.ts`
- `src/lib/media.ts`
- `src/lib/decartClient.ts`
- `src/test/mocks/browserMocks.ts`
- `src/test/mocks/storybookBrowserMocks.ts`
- `tests/e2e/app.spec.ts`

## Runtime Ownership

`useLiveSession()` is the browser-side lifecycle boundary. It branches on the selected session mode before any Decart-specific work:

- Local camera sessions call `useMediaSession().startLocalCamera()` and never import or call the Decart client path.
- Model-backed sessions call `useDecartModelSession().start()` and use `useMediaSession().startModelCamera()` for the local input stream.

`useLiveSession()` exposes:

- `localStream`: the local camera input stream.
- `displayStream`: the stream shown in `VideoStage`; local mode uses the local stream, while model-backed mode prefers the Decart output stream once available.
- `modelOutputStream`: the Decart output stream, or `null` for local camera mode.
- `recordableStream`: a placeholder recording source, currently equal to the safest available display/input stream. Recording is not implemented.

## Camera Flow

`getCameraStream(model)` requests the browser camera with the selected model's `fps`, `width`, and `height`, plus `facingMode: "user"` and `audio: false`.

`getLocalCameraStream()` requests local webcam preview with `facingMode: "user"` and `audio: true`. It is used only by Local camera mode and must not call Decart, model resolution, or `/api/realtime-token`.

After permission succeeds, it waits briefly for video track dimensions. If dimensions never appear, it stops the stream and throws a user-mapped error.

## Video Attachment

`attachStreamToVideo(video, stream)` assigns `video.srcObject` and starts playback. Clearing a stream pauses the element, removes `src`, and calls `load()`.

## Stop And Cleanup

Stop must:

- increment the active request id
- disconnect any Decart realtime client when a model session owns one
- stop local media tracks through `useMediaSession()`
- clear local, display, and model output streams
- clear the active session mode
- reset applying state
- set status to `disconnected`

Unmount and page unload also disconnect and stop media tracks.

## Mocking Rule

Tests and stories mock media devices, media streams, WebRTC constructors, video playback, object URLs, and Decart SDK behavior. Default checks must not depend on a real webcam or live WebRTC service.
