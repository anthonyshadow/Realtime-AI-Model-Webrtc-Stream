# WebRTC And Media
> Last updated: 2026-06-28

Use this for camera, media stream, video attachment, and realtime lifecycle behavior.

## Source Areas

- `src/hooks/useDecartRealtimeSession.ts`
- `src/lib/media.ts`
- `src/lib/decartClient.ts`
- `src/test/mocks/browserMocks.ts`
- `src/test/mocks/storybookBrowserMocks.ts`
- `tests/e2e/app.spec.ts`

## Camera Flow

`getCameraStream(model)` requests the browser camera with the selected model's `fps`, `width`, and `height`, plus `facingMode: "user"` and `audio: false`.

After permission succeeds, it waits briefly for video track dimensions. If dimensions never appear, it stops the stream and throws a user-mapped error.

## Video Attachment

`attachStreamToVideo(video, stream)` assigns `video.srcObject` and starts playback. Clearing a stream pauses the element, removes `src`, and calls `load()`.

## Stop And Cleanup

Stop must:

- increment the active request id
- disconnect any realtime client
- stop local media tracks
- clear local and remote streams
- clear the active model mode
- reset applying state
- set status to `disconnected`

Unmount and page unload also disconnect and stop media tracks.

## Mocking Rule

Tests and stories mock media devices, media streams, WebRTC constructors, video playback, object URLs, and Decart SDK behavior. Default checks must not depend on a real webcam or live WebRTC service.
