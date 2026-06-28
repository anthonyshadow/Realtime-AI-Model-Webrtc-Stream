# Skill: Adding E2E Tests
> Last updated: 2026-06-28

## Use when

- Adding or changing Playwright app-level flows.
- Verifying route-level behavior, token request payloads, or start/apply/stop lifecycle.

## Read first

- [../../04-testing.md](../../04-testing.md)
- [../../testing/e2e-testing.md](../../testing/e2e-testing.md)
- `tests/e2e/app.spec.ts`

## Steps

1. Add the spec under `tests/e2e/`.
2. Use existing mock browser APIs and token route patterns.
3. Keep external network blocking enabled.
4. Assert user-visible state and important integration payloads.
5. Keep the server environment mocked.

## Checks

- `npm run typecheck`
- `npm run test:e2e`

## Do not

- Do not reuse an existing live dev server.
- Do not call live Decart or require a real webcam.
- Do not move global E2E specs into component folders.

## Update docs

- Update [../../testing/e2e-testing.md](../../testing/e2e-testing.md) if E2E setup changes.
- Update the Last updated date of any document changed.
