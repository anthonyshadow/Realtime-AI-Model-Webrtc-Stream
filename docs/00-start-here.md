# Start Here
> Last updated: 2026-06-30

Best first file for humans and agents. Read this, then open only the task-specific docs you need.

## Fast Facts

- Local Decart realtime webcam studio.
- Frontend: React, TypeScript, Vite, Tailwind CSS.
- Backend: Express same-origin API.
- Package manager: npm with `package-lock.json`.
- Runtime: `http://localhost:3000` and `https://localhost:3000`.
- Supported session modes: `local`, `lucy-2.1`, and `lucy-vton-3`.
- Local camera mode does not call Decart or `/api/realtime-token`.
- Default tests and stories use mocks. They must not call live Decart.

## Use These Docs

- [01-project-overview.md](01-project-overview.md): product scope, capabilities, and non-goals.
- [02-architecture.md](02-architecture.md): source layout, ownership boundaries, and runtime flow.
- [03-development.md](03-development.md): setup, scripts, environment, and local workflow.
- [04-testing.md](04-testing.md): full test stack and commands.
- [05-storybook.md](05-storybook.md): Storybook setup and authoring rules.
- [06-api-and-integrations.md](06-api-and-integrations.md): Decart token and SDK integration.
- [07-webrtc-and-media.md](07-webrtc-and-media.md): webcam, streams, WebRTC, and media lifecycle.
- [08-ui-and-ux.md](08-ui-and-ux.md): control panel and video-stage UX rules.
- [09-agent-workflows.md](09-agent-workflows.md): efficient agent navigation.
- [10-deployment-and-env.md](10-deployment-and-env.md): local env, preview mode, and deployment limits.
- [11-documentation-maintenance.md](11-documentation-maintenance.md): where docs, skills, tests, and stories go.
- [12-ux-recording-architecture.md](12-ux-recording-architecture.md): control panel, recording dock, recording lifecycle, API release, stream strategy, cleanup, and QA guardrails.
- [context/screens.md](context/screens.md): remembered redesigned screen breakdown and visual reference for upcoming UI work.
- [ui-ux-stream-first-redesign-plan.md](ui-ux-stream-first-redesign-plan.md): audit and phased implementation plan for the stream-first UI redesign.

## Agent Context

- Always-read rules: [agents/always-read.md](agents/always-read.md)
- Implementation rules: [agents/implementation-rules.md](agents/implementation-rules.md)
- Task read paths: [agents/agent-read-order.md](agents/agent-read-order.md)
- Reusable skills: [skills/skill-index.md](skills/skill-index.md)

## Source Scaffolding

- Component implementation files stay directly in the component folder.
- Component stories go in a local `stories/` folder.
- Component tests go in a local `tests/` folder.
- Shared mocks stay in `src/test/`.
- Global E2E and a11y tests stay in `tests/`.

## First Checks

```bash
npm run typecheck
npm run test:unit
npm run test:storybook
npm run test:e2e
npm run build
```
