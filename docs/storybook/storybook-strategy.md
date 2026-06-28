# Storybook Strategy
> Last updated: 2026-06-28

Use this to decide whether a story belongs in the repo.

## Good Story Targets

- Real existing UI components.
- Important visual states.
- Disabled/enabled control states.
- Upload states.
- Error states.
- Permission or API failure states via mocks.
- Short user-visible interactions that are easier to inspect in isolation.

## Avoid

- Full app journeys already covered by Playwright.
- Pure logic checks better suited for Vitest.
- Fake UI components that do not exist in the app.
- Real camera, live Decart, real WebRTC, external network, secrets, or arbitrary timers.

## Stable Story IDs

The a11y smoke test references story IDs derived from story `title` and export names. Preserve titles/export names when moving files unless the a11y test is updated in the same change.
