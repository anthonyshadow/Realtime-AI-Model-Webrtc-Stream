# Known Limitations
> Last updated: 2026-06-28

Use this before expanding scope or promising production behavior.

## Current Limitations

- Local MVP only. Deployment hardening is not included.
- No auth, database, recording, gallery, payments, analytics, sharing, or session history.
- Uploaded reference and garment images stay in browser memory only.
- The Decart SDK chunk is large enough that production builds may warn about chunk size.
- Real webcam, microphone, WebRTC, account access, billing, and generated visual output still require manual browser QA.
- Combined Lucy 2.1 plus Lucy VTON 3 mode has not been designed or implemented.
- No live Decart smoke test is enabled.
