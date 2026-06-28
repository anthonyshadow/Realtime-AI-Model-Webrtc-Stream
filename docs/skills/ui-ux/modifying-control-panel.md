# Skill: Modifying Control Panel
> Last updated: 2026-06-28

## Use when

- Changing control panel controls, status, errors, timer, model selection, prompt, upload, or actions.

## Read first

- [../../08-ui-and-ux.md](../../08-ui-and-ux.md)
- `src/App.tsx`
- `src/components/ControlPanel/`
- Closest ControlPanel story and test.

## Steps

1. Keep components presentational.
2. Keep orchestration in hooks and state composition in `App.tsx`.
3. Preserve Start/Stop/Apply/Reset state rules.
4. Update component tests for behavior changes.
5. Update stories for important visual states.

## Checks

- `npm run typecheck`
- `npm run test:unit`
- `npm run test:storybook`

## Do not

- Do not put Decart, media, or token orchestration in components.
- Do not hide setup, connecting, or error states behind auto-hide behavior.

## Update docs

- Update [../../08-ui-and-ux.md](../../08-ui-and-ux.md) if UX behavior changes.
- Update the Last updated date of any document changed.
