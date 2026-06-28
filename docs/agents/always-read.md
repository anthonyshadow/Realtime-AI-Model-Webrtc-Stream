# Always-Read Rules
> Last updated: 2026-06-28

Read this before editing.

## Core Rules

- Do not change app behavior unless requested.
- Inspect relevant source before editing.
- Preserve existing architecture unless there is a clear reason.
- Avoid regressions and keep changes reviewable.
- No secrets in frontend code, tests, stories, docs, logs, or commits.
- `DECART_API_KEY` is server-only. Never add `VITE_DECART_API_KEY`.
- No live Decart, camera, WebRTC, or external network calls in tests or stories unless explicitly gated.
- Use npm and existing scripts.
- Run available checks that match the change.
- Prefer task-specific docs over reading everything.
- Canonical docs override archived docs.
- Update docs when implementation, commands, structure, or conventions change.
- Every Markdown file needs `> Last updated: YYYY-MM-DD` directly below the H1.
- Component stories live in local `stories/` folders.
- Component tests live in local `tests/` folders.
- Implementation files stay directly in component folders.
