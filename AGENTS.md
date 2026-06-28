# AGENTS.md
> Last updated: 2026-06-28

This is the compact always-read entry point for coding agents.

## Non-Negotiables

- Do not change app behavior unless the task asks for it.
- Inspect the relevant source and docs before editing.
- Preserve the current architecture unless there is a clear, local reason to change it.
- Keep `DECART_API_KEY` server-only. Never add `VITE_DECART_API_KEY`.
- Do not make live Decart, camera, WebRTC, or external network calls in tests or stories unless an explicitly gated live-smoke workflow exists.
- Use npm. This repo has `package-lock.json`.
- Keep changes small, reviewable, and covered by the closest available checks.
- Update docs when implementation changes.
- Every Markdown file must include `> Last updated: YYYY-MM-DD` directly below the H1.
- Component stories live in local `stories/` folders. Component tests live in local `tests/` folders.

## Read Order

- Start with [docs/00-start-here.md](docs/00-start-here.md).
- For task-specific context, use [docs/agents/agent-read-order.md](docs/agents/agent-read-order.md).
- For implementation rules, use [docs/agents/implementation-rules.md](docs/agents/implementation-rules.md).
- For reusable procedures, use [docs/skills/skill-index.md](docs/skills/skill-index.md).
