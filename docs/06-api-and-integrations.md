# API And Integrations
> Last updated: 2026-06-28

Use this for the Decart/Lucy integration, token endpoint, and SDK boundaries.

## Decart SDK

Installed SDK:

```text
@decartai/sdk 0.1.9
```

Browser code resolves realtime models with:

```ts
models.realtime("lucy-2.1");
models.realtime("lucy-vton-3");
```

## Token Endpoint

The browser calls:

```text
POST /api/realtime-token
Content-Type: application/json

{ "model": "lucy-vton-3" }
```

If `model` is omitted, the server defaults to `lucy-2.1`. Unsupported model ids return `400`.

`server/decartToken.ts` creates a short-lived client token with:

- `expiresIn: 300`
- `allowedModels: [requestedModel]`
- localhost HTTP and HTTPS origins for the configured port
- realtime `maxSessionDuration: 300`

## Security Boundary

- `DECART_API_KEY` stays in `.env` and backend code.
- Frontend code receives only short-lived `ek_` client tokens.
- Never add `VITE_DECART_API_KEY`.
- Do not log permanent API keys or client tokens.
- Do not persist uploaded reference or garment images.

## Browser Integration Boundary

`src/lib/decartClient.ts` owns:

- `fetchRealtimeToken(modelMode)`
- `createBrowserDecartClient(token)`
- `getRealtimeModel(modelMode)`
- `connectRealtimeModel(input)`

It must never import backend env files or read `DECART_API_KEY`.

## Realtime `set()` Rule

`realtimeClient.set()` replaces the full realtime state. Use `src/lib/realtimeState.ts` to build one atomic payload for prompt, image, and enhance.

Model-specific image-only behavior:

- Lucy 2.1 image-only sends the image plus the default character substitution prompt.
- Lucy VTON 3 image-only sends the image without inventing a prompt.

## Official References

- JavaScript SDK overview: https://docs.platform.decart.ai/sdks/javascript
- JavaScript realtime API: https://docs.platform.decart.ai/sdks/javascript-realtime
- Realtime virtual try-on: https://docs.platform.decart.ai/models/realtime/virtual-try-on
- Realtime reference images: https://docs.platform.decart.ai/models/realtime/reference-images
- Client tokens: https://docs.platform.decart.ai/getting-started/client-tokens
