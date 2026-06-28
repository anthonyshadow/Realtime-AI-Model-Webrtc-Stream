# Product Requirements
> Last updated: 2026-06-28

Use this for product behavior and acceptance criteria. For code boundaries, read [../02-architecture.md](../02-architecture.md).

## Required Experience

- App opens directly into the video workspace.
- User can choose Local camera, Lucy 2.1, or Lucy VTON 3 before starting.
- User can start local webcam and microphone preview without Decart.
- User can start camera, connect Decart realtime for model-backed modes, apply prompt/image updates, and stop cleanly.
- Video remains primary; controls stay compact and usable on mobile and desktop.
- Errors must be understandable without exposing secrets or raw token values.

## Supported Inputs

- Prompt text.
- Lucy 2.1 reference portrait.
- Lucy VTON 3 garment image.
- JPEG, PNG, WebP, and AVIF uploads.
- Enhance prompt toggle.

## Acceptance Criteria

- `npm run dev` opens the local app.
- `GET /api/health` returns `{ "ok": true }`.
- `/api/realtime-token` returns model-scoped short-lived client tokens.
- Local camera start does not call Decart or `/api/realtime-token`.
- `DECART_API_KEY` remains server-only.
- Prompt-only, image-only where supported, and prompt-plus-image updates work atomically.
- Stop disconnects Decart when present and turns off local media tracks.
