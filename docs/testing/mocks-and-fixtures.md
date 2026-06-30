# Mocks And Fixtures
> Last updated: 2026-06-29

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
- App E2E tests mock `navigator.mediaDevices.getUserMedia`, Decart SDK calls, `MediaRecorder`, and object URL creation/revocation so local recording and network guardrails are covered without real devices or external services.

## Media And Recording Mocking

- `navigator.mediaDevices.getUserMedia` is mocked in unit, Storybook, and E2E contexts. It should return deterministic streams and record requested constraints where tests need to assert camera/microphone behavior.
- Fake media streams should include audio tracks for local recording and model audio-fallback tests when the scenario expects microphone support.
- `MediaRecorder` is mocked in unit and E2E recording tests. Tests should drive fake `dataavailable`, `stop`, and `error` events instead of relying on a real browser recorder.
- `URL.createObjectURL()` and `URL.revokeObjectURL()` are mocked so tests can prove playback URLs are created and revoked without leaking real browser resources.
- Decart SDK behavior is mocked through the test SDK hooks and Storybook browser mocks. Local-only tests must assert that Decart connect events and token requests remain untouched.
