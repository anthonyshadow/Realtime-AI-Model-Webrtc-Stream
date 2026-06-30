# Testing
> Last updated: 2026-06-30

Use this for the test stack and default checks. More detail lives in [testing/](testing/).

## Test Stack

- Vitest browser project for `src/**/*.{test,spec}.{ts,tsx}` in jsdom.
- Vitest server project for `server/**/*.{test,spec}.{ts,tsx}` in Node.
- React Testing Library, jest-dom, and user-event for component behavior.
- MSW for mocked `/api/realtime-token` responses.
- Storybook Vitest addon with Playwright Chromium for story rendering and selected `play` functions.
- Playwright for global E2E and Storybook a11y smoke tests.

Default tests must not call live Decart, request a real camera, open real WebRTC sessions, or reach external network services.

For the regression contract around Local camera network guards, model/API release after recording, recording dock behavior, playback/download/discard, and manual browser QA, use [12-ux-recording-architecture.md](12-ux-recording-architecture.md#testing-contract).

## Commands

```bash
npm run typecheck
npm run test:unit
npm run test:watch
npm run test:coverage
npm run test:storybook
npm run test:storybook:watch
npm run test:storybook:coverage
npm run test:e2e
npm run test:a11y
npm run test:all
```

`npm test` is an alias for `npm run test:unit`.

## Placement

- Component tests live in local `tests/` folders beside component implementation folders.
- App shell test lives in `src/tests/`.
- Shared test setup and mocks live in `src/test/`.
- Library and constants tests stay beside the utility files they validate.
- Server tests stay in `server/`.
- Global E2E and a11y specs stay in `tests/`.

## Read More

- [testing/test-strategy.md](testing/test-strategy.md)
- [testing/mocks-and-fixtures.md](testing/mocks-and-fixtures.md)
- [testing/e2e-testing.md](testing/e2e-testing.md)
- [testing/live-smoke-tests.md](testing/live-smoke-tests.md)
