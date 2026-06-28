# Skill: Dependency Update Checklist
> Last updated: 2026-06-28

## Use when

- Updating npm dependencies or toolchain versions.

## Read first

- [../../03-development.md](../../03-development.md)
- [../../04-testing.md](../../04-testing.md)
- `package.json`

## Steps

1. Confirm the requested dependency and version range.
2. Use npm and update `package-lock.json`.
3. Review release notes for behavior or config changes.
4. Run typecheck and affected tests.
5. Update docs when commands, versions, or setup change.

## Checks

- `npm run typecheck`
- `npm run test:unit`
- `npm run test:storybook` for Storybook/Vitest/browser changes.
- `npm run test:e2e` for Playwright/Vite/server changes.
- `npm run build`

## Do not

- Do not switch package managers.
- Do not add unrelated dependencies.
- Do not update Decart SDK behavior claims without source verification.

## Update docs

- Update [../../03-development.md](../../03-development.md), [../../04-testing.md](../../04-testing.md), or integration docs if versions or commands change.
- Update the Last updated date of any document changed.
