# Project Overview
> Last updated: 2026-06-28

Use this for product scope and quick orientation. For implementation boundaries, read [02-architecture.md](02-architecture.md).

## Goal

This project is a local webcam studio that sends the browser camera stream to Decart realtime models and displays the transformed video stream.

Supported modes:

- `lucy-2.1`: realtime character/video transformation.
- `lucy-vton-3`: realtime virtual try-on.

The modes are independent. Combined Lucy plus VTON mode is not implemented.

## Current Capabilities

- Full-screen video stage.
- Floating auto-hiding control panel.
- Model mode selector.
- Mode-aware prompt textarea.
- JPEG, PNG, and WebP upload.
- Lucy 2.1 reference portrait mode.
- Lucy VTON 3 garment image mode.
- Enhance prompt toggle.
- Start, Stop, Apply, and Reset controls.
- Connection status, pending-change status, and session timer.
- Friendly errors for camera, token, model, image, and connection failures.
- Live prompt and image updates without reconnecting.

## Runtime Flow

1. User selects Lucy 2.1 or Lucy VTON 3.
2. Browser requests camera access using the selected model dimensions.
3. Browser posts `{ model }` to `/api/realtime-token`.
4. Express creates a short-lived Decart client token with server-side `DECART_API_KEY`.
5. Browser creates a Decart client with the temporary token.
6. Browser connects the webcam stream to `models.realtime(modelId)`.
7. Decart returns a transformed remote stream for the video stage.
8. Apply sends the full intended state in one realtime `set()` call.
9. Stop disconnects Decart and stops camera tracks.

## Non-Goals

- Combined model mode.
- Auth, database, recording, payments, gallery, analytics, or admin tools.
- Cloud uploads or persisted user media.
- Deployment hardening.
- Live Decart smoke tests in default test commands.
