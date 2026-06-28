# Mocks And Fixtures
> Last updated: 2026-06-28

Use this before changing mocked API, media, WebRTC, or Storybook behavior.

## Shared Setup

- `src/test/setup.ts`: installs browser mocks, starts MSW, cleans up React, resets mocks.
- `src/test/mocks/handlers.ts`: mocked `/api/realtime-token` handler.
- `src/test/mocks/server.ts`: MSW node server.
- `src/test/mocks/browserMocks.ts`: jsdom/browser API mocks.
- `src/test/mocks/mediaFakes.ts`: fake media and WebRTC classes.

## Storybook Mocks

- `src/test/mocks/storybookBrowserMocks.ts`: camera, media, WebRTC, Decart SDK, object URL, and video element mocks.
- `src/test/mocks/storybookFixtures.ts`: story image files and preview URLs.
- `.storybook/preview.tsx`: installs mocks and quiet MSW handling for stories.

## Rules

- Default mocks must fail unhandled external API calls.
- Do not read `.env` in browser, story, or component test code.
- Keep fake tokens obviously fake, such as `ek_test_client_token`.
- Keep mocks deterministic and reset between tests/stories.
