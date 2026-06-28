# Storybook
> Last updated: 2026-06-28

Use Storybook for visual review, component QA, documented states, and short isolated interactions. It is not a replacement for Vitest or Playwright.

## Commands

```bash
npm run storybook
npm run build-storybook
npm run test:storybook
npm run test:storybook:watch
npm run test:storybook:coverage
npm run test:a11y
```

Storybook runs on `http://localhost:6006`. Static builds write to `storybook-static/`, which is ignored by Git.

## Placement

- App shell stories live in `src/stories/`.
- Component stories live in local `stories/` folders beside component implementation folders.
- Story files keep `*.stories.tsx` or `*.stories.ts`.
- Do not put Storybook config files outside `.storybook/`.

Current story areas:

- `src/stories/App.stories.tsx`
- `src/components/ControlPanel/stories/*.stories.tsx`
- `src/components/VideoStage/stories/*.stories.tsx`

## Mocks

Storybook scripts set `VITE_USE_MOCK_DECART=true` and `STORYBOOK_DISABLE_TELEMETRY=1`.

Mocks live in:

- `src/test/mocks/storybookBrowserMocks.ts`
- `src/test/mocks/storybookFixtures.ts`
- `src/test/mocks/handlers.ts`

MSW is wired in `.storybook/preview.tsx`. Handled mock traffic runs quietly; unhandled API or external requests fail, while local Storybook assets are allowed.

## Do Not

- Do not read secrets in stories.
- Do not call live Decart token, SDK, WebRTC, or model endpoints.
- Do not require a real webcam or permission prompt.
- Do not depend on arbitrary timers or external network availability.

## Read More

- [storybook/storybook-strategy.md](storybook/storybook-strategy.md)
- [storybook/story-authoring-guide.md](storybook/story-authoring-guide.md)
