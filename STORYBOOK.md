# Storybook

Storybook is configured for the React/Vite UI in this project. It is for visual review, component QA, and documenting UI states. It is not a replacement for Vitest or Playwright.

## Commands

```bash
npm run storybook
npm run build-storybook
npm run test:storybook
npm run test:storybook:watch
npm run test:storybook:coverage
npm run test:a11y
```

Storybook runs on:

```text
http://localhost:6006
```

The static build is written to `storybook-static/`, which is ignored by Git.

Storybook tests run stories through Vitest browser mode with Playwright Chromium. They are intended for isolated story rendering and focused `play` interactions, not full app journey coverage.

The accessibility addon is enabled for manual checks in the Storybook UI. `npm run test:a11y` also runs a small nonblocking Playwright/axe smoke suite against stable Storybook iframe stories.

## What Is Included

Stories live beside the real components:

- `src/App.stories.tsx`
- `src/components/ControlPanel/*.stories.tsx`
- `src/components/VideoStage/*.stories.tsx`

The stories cover the app shell, control panel, model selector, prompt input, image upload, session controls, status summary, error banner, video placeholder, status badge, and mocked video stream states.

## Mocks

Storybook must not call live Decart endpoints, require a real webcam, open real WebRTC connections, or require secrets.

The Storybook scripts set:

```text
VITE_USE_MOCK_DECART=true
```

That makes the app use the test-only Decart SDK escape hatch in `src/lib/decartClient.ts`. The mock runtime lives in:

```text
src/test/mocks/storybookBrowserMocks.ts
```

It mocks:

- `navigator.mediaDevices.getUserMedia`
- media streams and video playback behavior
- WebRTC constructors
- Decart realtime connect, set, and disconnect behavior

MSW is wired through `msw-storybook-addon` in `.storybook/preview.tsx` and reuses:

```text
src/test/mocks/handlers.ts
```

Unhandled API or external requests fail in Storybook, while local Storybook asset requests are allowed. This keeps story tests from accidentally reaching live Decart services.

The worker file is generated at:

```text
public/mockServiceWorker.js
```

## Adding A Story

Prefer stories for real existing components. Keep stories prop-driven when possible, and use a thin harness only when a component depends on app-level state.

Use Component Story Format:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MyComponent } from "./MyComponent";

const meta = {
  title: "Area/MyComponent",
  component: MyComponent,
  tags: ["autodocs"],
} satisfies Meta<typeof MyComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
```

Use `storybook/test` `fn()` for callback props that should show up as actions. Use `expect`, `userEvent`, and `within` from `storybook/test` for short story `play` functions. Use MSW handlers or the browser mock options for API, permission, or session states.

Good candidates for story `play` functions:

- a controlled form interaction that should update visible story state
- a disabled/enabled button state
- an upload state transition
- a mocked API success or failure state
- a disclosure, toggle, or compact interaction that is easier to inspect in isolation

Keep plays short and deterministic. Avoid arbitrary timers, real network, real camera prompts, real WebRTC, and assertions against private implementation details.

Use the accessibility panel for targeted manual checks on stable stories. Keep automated accessibility checks scoped to stable component states first so unrelated Storybook work is not blocked by noisy or environment-specific axe results.

## Do Not Do This

- Do not add `VITE_DECART_API_KEY`.
- Do not read `DECART_API_KEY` from Storybook or frontend code.
- Do not call live Decart token, SDK, WebRTC, or model endpoints.
- Do not require a real webcam or browser permission prompt.
- Do not add stories that depend on arbitrary timers or external network availability.
- Do not create fake UI components when a real component already exists.

## Relationship To Automated Tests

Vitest unit/component tests verify pure logic and component behavior in jsdom. Storybook tests verify isolated stories and selected interactions in a real browser. Playwright verifies full app flows.

When a Storybook state represents important behavior that is already covered well by RTL or Playwright, do not duplicate it just to have another story play. Add Storybook interactions where the isolated visual state itself is valuable.
