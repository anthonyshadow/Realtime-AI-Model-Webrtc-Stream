# Project Overview
> Last updated: 2026-06-30

Use this for product scope and quick orientation. For implementation boundaries, read [02-architecture.md](02-architecture.md).

## Goal

This project is a local webcam studio that can preview the browser camera locally or send the browser camera stream to Decart realtime models and display the transformed video stream.

Supported session modes:

- `local`: webcam and microphone preview without Decart.
- `lucy-2.1`: realtime character/video transformation.
- `lucy-vton-3`: realtime virtual try-on.

The model-backed modes are independent. Combined Lucy plus VTON mode is not implemented.

## Current Capabilities

- Full-screen video stage.
- Floating auto-hiding control panel.
- Session mode selector.
- Local camera and microphone preview mode.
- Mode-aware prompt textarea.
- JPEG, PNG, WebP, and AVIF upload.
- Lucy 2.1 reference portrait mode.
- Lucy VTON 3 garment image mode.
- Enhance prompt toggle.
- Start, Stop, Apply, and Reset controls.
- Connection status, pending-change status, and session timer.
- Friendly errors for camera, token, model, image, and connection failures.
- Live prompt and image updates without reconnecting.
- Model-agnostic recording helpers, stream composition, and hook for browser-native `MediaRecorder`.
- Bottom-center floating recording dock for active local and model-backed sessions, with post-recording playback, download, and delete.

## Runtime Flow

1. User selects Local camera, Lucy 2.1, or Lucy VTON 3.
2. Local camera starts webcam and microphone preview without Decart or `/api/realtime-token`.
3. Model-backed modes request camera access using the selected model dimensions.
4. Model-backed modes post `{ model }` to `/api/realtime-token`.
5. Express creates a short-lived Decart client token with server-side `DECART_API_KEY`.
6. Browser creates a Decart client with the temporary token.
7. Browser connects the webcam stream to `models.realtime(modelId)`.
8. Decart returns a transformed model output stream; the live-session layer displays the transformed stream when available and waits for transformed output before enabling model recording.
9. Apply sends prompt, image, and enhance through the realtime update path that preserves the intended control panel state.
10. The live-session layer composes `recordableStream`: local sessions record local webcam plus mic, while model-backed sessions record model output video with model output audio or local mic fallback.
11. The recording hook consumes the selected `recordableStream` and the recording dock exposes record/stop-recording, playback, download, and delete controls without owning Decart or stopping source tracks.
12. Stopping a recording in a model-backed session finalizes the clip, disconnects the model session to stop usage, and returns the live display to local camera preview.
13. Stop session disconnects Decart when present and stops local media tracks.

## Non-Goals

- Combined model mode.
- Auth, database, recording gallery, payments, analytics, or admin tools.
- Cloud uploads or persisted user media.
- Deployment hardening.
- Live Decart smoke tests in default test commands.
