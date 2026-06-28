# Documentation Migration Summary
> Last updated: 2026-06-28
> Archived: 2026-06-28
> Status: Historical. Canonical docs override this file.

This records the documentation and scaffold migration performed on 2026-06-28.

## Root Markdown Mapping

- `README.md` -> compact root README, with details linked to `docs/`.
- `PROJECT_CONTEXT.md` -> `docs/01-project-overview.md`, `docs/context/product-requirements.md`, `docs/context/known-limitations.md`.
- `ARCHITECTURE.md` -> `docs/02-architecture.md`.
- `TESTING.md` -> `docs/04-testing.md` and `docs/testing/*`.
- `STORYBOOK.md` -> `docs/05-storybook.md` and `docs/storybook/*`.
- `DECART_LUCY_NOTES.md` -> `docs/06-api-and-integrations.md` and `docs/07-webrtc-and-media.md`.
- `IMPLEMENTATION_RULES.md` -> `docs/agents/implementation-rules.md`.

## Source Scaffold Mapping

- `src/App.stories.tsx` -> `src/stories/App.stories.tsx`.
- `src/App.test.tsx` -> `src/tests/App.test.tsx`.
- `src/components/ControlPanel/*.stories.tsx` -> `src/components/ControlPanel/stories/*.stories.tsx`.
- `src/components/ControlPanel/*.test.tsx` -> `src/components/ControlPanel/tests/*.test.tsx`.
- `src/components/VideoStage/*.stories.tsx` -> `src/components/VideoStage/stories/*.stories.tsx`.
