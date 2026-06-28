# E2E Testing
> Last updated: 2026-06-28

Use this for Playwright app and accessibility tests.

## App E2E

`playwright.config.ts` runs `tests/e2e/*.spec.ts`.

The web server uses:

```text
PORT=3100
DECART_API_KEY=dct_test_key
VITE_USE_MOCK_DECART=true
```

Playwright starts its own server and does not reuse existing local servers.

Run:

```bash
npm run test:e2e
```

If port `3100` is busy:

```bash
E2E_PORT=3101 npm run test:e2e
```

## A11y E2E

`playwright.a11y.config.ts` runs `tests/a11y/*.spec.ts` against a mocked Storybook server on port `6106` by default.

Run:

```bash
npm run test:a11y
```

## Network Guard

Both E2E suites block unexpected external HTTP(S) and WebSocket requests. Localhost and `127.0.0.1` are allowed for app assets, Vite, health checks, Storybook, and mocked API responses.
