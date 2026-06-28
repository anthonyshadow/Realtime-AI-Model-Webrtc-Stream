# Development
> Last updated: 2026-06-28

Use this for setup, scripts, and local workflow.

## Package Manager

Use npm. This repo has `package-lock.json`.

```bash
npm install
```

## Environment

Create `.env` from the example:

```bash
cp .env.example .env
```

Required values:

```text
DECART_API_KEY=dct_your_server_side_key_here
PORT=3000
NODE_ENV=development
```

`DECART_API_KEY` is server-only. Do not create `VITE_DECART_API_KEY`.

## Run Locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
https://localhost:3000
```

The HTTPS server uses a generated self-signed localhost certificate in `.cert/`.

## Scripts

- `npm run dev`: local Express server with Vite middleware.
- `npm run preview`: production-mode Express server serving `dist`.
- `npm run typecheck`: app, server/config, E2E, and Storybook TypeScript checks.
- `npm run build`: typecheck plus Vite production build.
- `npm run storybook`: Storybook with Decart/media mocks.
- `npm run test:unit`: Vitest browser and server projects.
- `npm run test:storybook`: Storybook Vitest project.
- `npm run test:e2e`: Playwright app flow.
- `npm run test:a11y`: Storybook accessibility smoke suite.
- `npm run test:all`: typecheck, unit, Storybook, E2E, Storybook build, app build.

## Local Workflow

1. Read [00-start-here.md](00-start-here.md).
2. Read the task-specific doc from [agents/agent-read-order.md](agents/agent-read-order.md).
3. Make the smallest behavior-preserving change that solves the task.
4. Run the closest checks.
5. Update docs and `Last updated` dates when behavior, structure, commands, or conventions change.
