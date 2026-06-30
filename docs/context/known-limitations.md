# Known Limitations
> Last updated: 2026-06-29

Use this before expanding scope or promising production behavior.

## Current Limitations

- Local MVP only. Deployment hardening is not included.
- No auth, database, recording gallery, payments, analytics, sharing, or session history.
- Uploaded reference and garment images stay in browser memory only.
- Recorded clips stay in browser memory only. There is no cloud upload, backend storage, or recording history yet.
- The Decart SDK chunk is large enough that production builds may warn about chunk size.
- Real webcam, microphone, WebRTC, account access, billing, and generated visual output still require manual browser QA.
- Safari and iOS may expose partial or different `MediaRecorder` and MIME support; recording availability is detected at runtime.
- Decart output audio is not guaranteed. Model recordings use output audio when present and fall back to local microphone audio otherwise.
- UI overlays are not recorded. Recording captures the selected source stream, not the control panel, status badge, or playback UI.
- Combined Lucy 2.1 plus Lucy VTON 3 mode has not been designed or implemented.
- No live Decart smoke test is enabled.
