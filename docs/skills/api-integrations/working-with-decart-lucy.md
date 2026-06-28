# Skill: Working With Decart Lucy
> Last updated: 2026-06-28

## Use when

- Changing Decart token creation, model support, SDK calls, realtime state, or Lucy/VTON behavior.

## Read first

- [../../06-api-and-integrations.md](../../06-api-and-integrations.md)
- [../../07-webrtc-and-media.md](../../07-webrtc-and-media.md)
- [../../agents/implementation-rules.md](../../agents/implementation-rules.md)
- `server/decartToken.ts`
- `src/lib/decartClient.ts`
- `src/lib/realtimeState.ts`
- `src/constants/models.ts`

## Steps

1. Update frontend and backend model allow-lists together.
2. Keep `DECART_API_KEY` server-only.
3. Keep token scope narrow and short-lived.
4. Build realtime state atomically with shared helpers.
5. Update tests for model validation, token payloads, and state payloads.

## Checks

- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e` if runtime flow changes.

## Do not

- Do not add `VITE_DECART_API_KEY`.
- Do not log keys or tokens.
- Do not call live Decart from default tests or stories.

## Update docs

- Update [../../06-api-and-integrations.md](../../06-api-and-integrations.md) and [../../07-webrtc-and-media.md](../../07-webrtc-and-media.md) if integration behavior changes.
- Update the Last updated date of any document changed.
