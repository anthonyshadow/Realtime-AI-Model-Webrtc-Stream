# Project Overview
> Last updated: 2026-06-28

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

## Runtime Flow

1. User selects Local camera, Lucy 2.1, or Lucy VTON 3.
2. Local camera starts webcam and microphone preview without Decart or `/api/realtime-token`.
3. Model-backed modes request camera access using the selected model dimensions.
4. Model-backed modes post `{ model }` to `/api/realtime-token`.
5. Express creates a short-lived Decart client token with server-side `DECART_API_KEY`.
6. Browser creates a Decart client with the temporary token.
7. Browser connects the webcam stream to `models.realtime(modelId)`.
8. Decart returns a transformed remote stream for the video stage.
9. Apply sends prompt, image, and enhance through the realtime update path that preserves the intended control panel state.
10. Stop disconnects Decart when present and stops local media tracks.

## Non-Goals

- Combined model mode.
- Auth, database, recording, payments, gallery, analytics, or admin tools.
- Cloud uploads or persisted user media.
- Deployment hardening.
- Live Decart smoke tests in default test commands.
