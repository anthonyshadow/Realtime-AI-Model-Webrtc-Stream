# Implementation Decisions
> Last updated: 2026-06-28

Use this for decisions that explain why the project is shaped this way.

## Decisions

- One local Express server owns both the API and Vite middleware so the browser uses same-origin API calls.
- The permanent Decart key stays server-side; browser code receives only short-lived `ek_` client tokens.
- Session modes are separate from Decart model ids so `local` is never treated as a model-backed token or SDK mode.
- Lucy 2.1 and Lucy VTON 3 are separate modes because combined mode has not been designed or verified.
- Model-specific UI copy and image-only behavior live in `src/constants/models.ts`.
- Realtime state is sent atomically because Decart `set()` replaces omitted fields.
- `mirror: false` is used for Decart realtime because the SDK auto-mirror path previously caused generated track dimension issues during LiveKit reconnect republishes.
- Tests, Storybook, E2E, and a11y smoke runs use mocks by default to avoid live Decart, camera, WebRTC, and external network dependencies.
- Component stories and component tests live in local `stories/` and `tests/` folders to keep implementation folders clean while preserving locality.
