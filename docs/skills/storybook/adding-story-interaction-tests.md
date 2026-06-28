# Skill: Adding Story Interaction Tests
> Last updated: 2026-06-28

## Use when

- Adding a short Storybook `play` function for an isolated component state.

## Read first

- [../../storybook/storybook-strategy.md](../../storybook/storybook-strategy.md)
- [../../storybook/story-authoring-guide.md](../../storybook/story-authoring-guide.md)

## Steps

1. Keep the interaction short and deterministic.
2. Use `within`, `userEvent`, and `expect` from `storybook/test`.
3. Assert visible behavior, not private implementation details.
4. Prefer existing MSW and browser mock controls for failure states.
5. Preserve stable story titles/export names when a11y tests reference them.

## Checks

- `npm run test:storybook`
- `npm run test:a11y` when a stable story id changes.

## Do not

- Do not duplicate full Playwright journeys.
- Do not add arbitrary sleeps or live network calls.

## Update docs

- Update [../../storybook/storybook-strategy.md](../../storybook/storybook-strategy.md) if story test policy changes.
- Update the Last updated date of any document changed.
