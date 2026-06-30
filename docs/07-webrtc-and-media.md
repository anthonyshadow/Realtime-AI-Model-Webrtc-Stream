# WebRTC And Media
> Last updated: 2026-06-29

Use this for camera, media stream, video attachment, and realtime lifecycle behavior.

## Source Areas

- `src/hooks/useLiveSession.ts`
- `src/hooks/useMediaSession.ts`
- `src/hooks/useDecartModelSession.ts`
- `src/hooks/useDecartRealtimeSession.ts`
- `src/hooks/useSessionRecording.ts`
- `src/lib/media.ts`
- `src/lib/recording.ts`
- `src/lib/streamComposition.ts`
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
- `recordableStream`: the stream a recording layer can consume. Local sessions expose local webcam video plus local microphone audio. Model-backed sessions expose model output video only after output exists, using model output audio when present and local microphone audio when the output has no audio.
- `recordableStreamSource` and `recordableAudioSource`: metadata that explains whether recording is unavailable, local, or model-output based.

## Session Start Behavior

| Session mode | Start behavior | Decart/token behavior |
| --- | --- | --- |
| Local camera | Requests browser webcam and microphone, displays the local stream, and sets status to `connected`. | Does not import the Decart client, does not call `/api/realtime-token`, and does not connect a model. |
| Lucy 2.1 | Requests local camera/mic using the Decart model dimensions, fetches a scoped token, connects Decart realtime, and displays model output when available. | Calls the model-backed Decart path with `lucy-2.1`. |
| Lucy VTON 3 | Requests local camera/mic using the Decart model dimensions, fetches a scoped token, connects Decart realtime, and displays model output when available. | Calls the model-backed Decart path with `lucy-vton-3`. |
| Future model-backed modes | Should follow the same model-backed branch after being added to the frontend model/session registries and backend token allowlist. | Should never reuse the `local` id as a model id. |

The branch is enforced in `useLiveSession().start()`: local input returns through `startLocalCamera()` before `useDecartModelSession().start()` can run. Decart-specific code stays behind `useDecartModelSession` and its dynamic import of `src/lib/decartClient.ts`.

## Recording Flow

`useSessionRecording(stream, { sessionMode })` consumes a `MediaStream | null` and records with browser-native `MediaRecorder` when available. It is independent from Decart and does not request media, fetch tokens, connect realtime sessions, or stop source tracks.

`App.tsx` passes `useLiveSession().recordableStream` and the selected/active session mode to the recording hook. `RecordingControls` renders the model-agnostic record, stop-recording, timer, availability, and error states inside the control panel. Model-backed sessions keep recording disabled with "Waiting for model output before recording." until the Decart output stream has video. After a clip is captured, `RecordingPlaybackPanel` uses the hook-owned object URL for local playback and download, and calls the hook's delete/reset path to revoke the URL.

`src/lib/streamComposition.ts` owns recordable stream selection:

- local mode selects local video and local microphone audio
- model mode selects model output video
- model mode selects model output audio when present
- model mode falls back to local microphone audio when model output has no audio
- no model output video means no model recordable stream yet

The composition helper uses source streams directly and does not stop source tracks. Its cleanup path is reserved for future generated tracks, such as cloned or captured tracks, if those are ever introduced intentionally.

## Recording Lifecycle

The hook owns:

- explicit states: `idle`, `ready`, `recording`, `stopping`, `recorded`, and `error`
- supported MIME type detection through `MediaRecorder.isTypeSupported()`
- chunk collection, recorded `Blob`, object URL creation, filename, duration, and size
- recorder cleanup and object URL revocation on new recording, reset/delete, and unmount

State meanings:

- `idle`: no current stream is available.
- `ready`: a recordable stream exists and the browser exposes `MediaRecorder`.
- `recording`: the recorder is actively collecting chunks.
- `stopping`: the recorder has been asked to stop and is waiting for the browser `stop` event.
- `recorded`: a `Blob`, object URL, filename, duration, and size are available for playback/download/delete.
- `error`: the browser does not support recording, no stream was available, start failed, or a recorder error event fired.

`src/lib/recording.ts` owns pure helpers for MIME preferences, file extensions, timestamped filenames, duration labels, and file size labels. MIME detection checks `MediaRecorder.isTypeSupported()` in preference order: VP9 WebM, VP8 WebM, generic WebM, H.264/AAC MP4, then generic MP4. If none is supported but `MediaRecorder` exists, the hook lets the browser choose its default by constructing the recorder without a MIME option.

Object URLs are in-memory only. `useSessionRecording` revokes the previous object URL when a new recording starts, when delete/reset runs, when a URL is replaced, and on unmount. No backend upload, cloud persistence, or recording gallery exists in the MVP.

Playback uses the recorded object URL in `RecordingPlaybackPanel`. Download is a local anchor download using the generated filename. Delete/reset clears the recording artifact and does not stop the active live session or source stream.

## Camera Flow

`getCameraStream(model)` requests the browser camera with the selected model's `fps`, `width`, and `height`, plus `facingMode: "user"`. Its default direct helper behavior uses `audio: false`.

`useMediaSession().startModelCamera()` opts into `audio: true` so model-backed recordings can combine model output video with local microphone audio when Decart output does not include audio. This local microphone track remains owned by the media session and is stopped only by media-session cleanup.

`getLocalCameraStream()` requests local webcam preview with `facingMode: "user"` and `audio: true`. It is used only by Local camera mode and must not call Decart, model resolution, or `/api/realtime-token`.

After permission succeeds, it waits briefly for video track dimensions. If dimensions never appear, it stops the stream and throws a user-mapped error.

`useMediaSession` owns all local camera and microphone tracks. It stops the previous stream before starting a new one, stops late-arriving streams when a newer request has superseded them, maps permission/device errors into user-safe copy, and stops tracks on explicit stop or unmount.

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

If the user stops a live session while recording, `App.tsx` asks the recording hook to stop the `MediaRecorder` first, then stops the live session. The recorded clip can remain available after the live stream is gone.

Unmount and page unload disconnect Decart and stop media tracks. `useSessionRecording` separately stops any active recorder and revokes its object URL on unmount.

## Known Browser And Output Limits

- Safari and iOS have different `MediaRecorder` support and MIME behavior. The app detects support at runtime and disables recording with clear copy when unsupported.
- Decart model output audio is not guaranteed. Model recording uses output audio when present and falls back to local microphone audio when output audio is missing.
- UI overlays are not part of the recorded stream. Recordings capture source streams only; recording the control panel, status badge, or other overlays would require future canvas/video-element composition such as an intentional `captureStream()` pipeline.
- Recordings are held in browser memory only. Refreshing the page or deleting the clip removes the object URL and artifact.

## Mocking Rule

Tests and stories mock media devices, media streams, WebRTC constructors, video playback, object URLs, and Decart SDK behavior. Default checks must not depend on a real webcam or live WebRTC service.
