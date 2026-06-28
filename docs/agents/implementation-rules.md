# Implementation Rules
> Last updated: 2026-06-28

Use this for non-negotiable implementation standards.

## Prime Directive

Keep the app small, local, and reliable. Protect the existing Lucy 2.1 flow while supporting Lucy VTON 3 as a separate model mode.

Do not implement combined model mode unless explicitly requested and verified.

## Runtime And Stack

- Local app runs at `http://localhost:3000` and `https://localhost:3000`.
- Use React, TypeScript, Vite, Tailwind CSS, Express, and `@decartai/sdk` `0.1.9`.
- Use npm with `package-lock.json`.
- Do not add unrelated dependencies.

## Model Rules

- Supported modes: `lucy-2.1` and `lucy-vton-3`.
- Frontend modes live in `src/constants/models.ts`.
- Backend token modes live in `server/decartToken.ts`.
- Keep mode labels, defaults, prompt copy, and image-only behavior in the registry.
- Do not scatter model string literals through components.
- Do not use `lucy-vton-latest` unless explicitly requested.

## Security Rules

- `DECART_API_KEY` must stay server-side.
- Never expose `DECART_API_KEY` to frontend code.
- Never use `VITE_DECART_API_KEY`.
- Frontend must call `POST /api/realtime-token`.
- Backend must create short-lived scoped client tokens.
- Do not log permanent API keys or client tokens.
- Do not persist uploaded reference or garment images.

## Architecture Rules

- `App.tsx` composes page state and hooks; it must not call Decart SDK, request media, fetch tokens, or own WebRTC details.
- Hooks own lifecycle and orchestration.
- `lib/` helpers own isolated utilities.
- `components/` own UI only.
- `constants/models.ts` owns model configuration.
- `constants/prompts.ts` owns prompt defaults.
- `types/` owns shared TypeScript types.
- Backend token creation belongs in `server/`.

## Realtime State Rules

- `realtimeClient.set()` replaces full realtime state.
- Send prompt, image, and enhance together when image state should remain active with a prompt.
- Use `realtimeClient.setPrompt(prompt, { enhance })` for prompt-only live updates so active image state is preserved.
- Lucy 2.1 image-only updates include the default character substitution prompt.
- Lucy VTON 3 image-only updates send the garment image without inventing a prompt.

## Source Scaffolding Rules

- Component implementation files stay directly inside component folders.
- Component stories live in local `stories/` folders.
- Component tests live in local `tests/` folders.
- Shared test utilities stay in `src/test/`.
- Global E2E and a11y tests stay in `tests/`.
- Preserve import paths and discovery globs when moving files.

## Documentation Rules

- Update docs when behavior, architecture, commands, or conventions change.
- Every Markdown file must include `> Last updated: YYYY-MM-DD` directly below the H1.
- Prefer canonical docs over archived docs.
