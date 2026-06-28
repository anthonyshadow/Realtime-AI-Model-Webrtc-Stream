# Deployment And Env
> Last updated: 2026-06-28

Use this for local environment, preview mode, and deployment limitations.

## Environment Variables

- `DECART_API_KEY`: required server-only Decart API key.
- `PORT`: local server port. Defaults to `3000`.
- `NODE_ENV`: `development`, `production`, or `test`.

Never add `VITE_DECART_API_KEY`.

## Local Servers

Development:

```bash
npm run dev
```

Production preview after build:

```bash
npm run build
npm run preview
```

Both use the local Express server. Development serves Vite middleware. Production serves `dist/`.

## HTTPS

The local server exposes HTTP and HTTPS on the configured port. HTTPS uses a generated self-signed localhost certificate in `.cert/`, which is ignored by Git.

## Deployment Status

Deployment hardening is not included. Before real deployment, verify secret management, allowed origins, token constraints, HTTPS, observability, abuse controls, and Decart billing/session limits.
