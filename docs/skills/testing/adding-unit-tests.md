# Skill: Adding Unit Tests
> Last updated: 2026-06-28

## Use when

- Adding or changing Vitest tests for source behavior.
- Covering component behavior with React Testing Library.
- Covering utilities, model config, media helpers, or server helpers.

## Read first

- [../../04-testing.md](../../04-testing.md)
- [../../testing/test-strategy.md](../../testing/test-strategy.md)
- Closest existing test file.

## Steps

1. Identify the closest existing test pattern.
2. Put component tests in a local `tests/` folder.
3. Keep utility tests beside utility files unless they are component-level.
4. Use existing mocks from `src/test/`.
5. Assert user-visible behavior or exported utility behavior.

## Checks

- `npm run typecheck`
- `npm run test:unit`

## Do not

- Do not call live Decart, real camera, real WebRTC, or external network.
- Do not duplicate Playwright full app flows in component tests.

## Update docs

- Update [../../04-testing.md](../../04-testing.md) if test structure or commands change.
- Update the Last updated date of any document changed.
