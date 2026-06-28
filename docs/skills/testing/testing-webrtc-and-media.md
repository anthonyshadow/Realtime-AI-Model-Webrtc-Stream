# Skill: Testing WebRTC And Media
> Last updated: 2026-06-28

## Use when

- Testing camera, media stream, video attachment, WebRTC, or realtime lifecycle code.

## Read first

- [../../07-webrtc-and-media.md](../../07-webrtc-and-media.md)
- [../../testing/mocks-and-fixtures.md](../../testing/mocks-and-fixtures.md)
- `src/lib/media.ts`
- `src/test/mocks/`

## Steps

1. Use existing fake media streams and WebRTC classes.
2. Reset mocks between tests.
3. Assert stream cleanup and track stopping.
4. Assert user-facing errors through existing error mapping where relevant.
5. Keep dimensions, playback, and object URLs deterministic.

## Checks

- `npm run test:unit`
- `npm run test:e2e` when app lifecycle changes.

## Do not

- Do not require real camera permission.
- Do not depend on browser-specific timing without a deterministic wait.
- Do not call live WebRTC services.

## Update docs

- Update [../../07-webrtc-and-media.md](../../07-webrtc-and-media.md) if lifecycle behavior changes.
- Update the Last updated date of any document changed.
