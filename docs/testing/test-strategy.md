# Test Strategy
> Last updated: 2026-06-28

Use this to choose the right test level.

## Unit And Component Tests

Vitest reads `vitest.config.ts` and runs:

- `browser`: `src/**/*.{test,spec}.{ts,tsx}` in jsdom with `src/test/setup.ts`.
- `server`: `server/**/*.{test,spec}.{ts,tsx}` in Node.

Use these for pure logic, component behavior, validation, state payloads, media helpers, token validation, and server env parsing.

## Storybook Tests

Storybook tests run through the `storybook` Vitest project with Playwright Chromium. Use them for isolated rendered states and short `play` interactions that are valuable to inspect visually.

Do not duplicate full app journeys in stories.

## Playwright E2E

Global app flows live in `tests/e2e/`. Use them for route-level behavior, start/apply/stop journeys, token request payloads, camera-denied behavior, API failures, and network guards.

## A11y Smoke

`tests/a11y/` checks selected stable Storybook iframe stories with axe for serious or critical WCAG A/AA violations. It is intentionally separate from `npm run test:all`.
