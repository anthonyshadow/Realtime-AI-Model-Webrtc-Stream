# Live Smoke Tests
> Last updated: 2026-06-28

Use this when designing future live Decart checks. No live Decart smoke test exists today.

## Requirements For Any Future Live Test

- Require `RUN_LIVE_DECART_TESTS=true`.
- Require a real `DECART_API_KEY`.
- Use a controlled fake camera source when possible.
- Cap session duration tightly.
- Assert connection lifecycle, not generated visual quality.
- Never run from `npm test`, `npm run test:unit`, `npm run test:e2e`, or `npm run test:all`.
- Bypass the E2E external-network guard only inside the explicit live smoke workflow.
- Clearly document cost and account-access expectations.

## Current Status

Needs verification before implementation. The current repo intentionally keeps all automated checks mocked and local.
