# Repo Audit Checklist
> Last updated: 2026-06-28

Use this before broad reorganizations.

## Inspect

- Root directory and package manager files.
- `package.json` scripts.
- All Markdown files.
- Agent files and skills.
- Source tree and ownership boundaries.
- Storybook config and story files.
- Vitest, Playwright, and test setup.
- Decart/Lucy integration files.
- WebRTC/media files.
- UI/control panel files.
- Scripts/configs that reference moved files.

## Classify

- Current docs.
- Outdated docs.
- Duplicated docs.
- Missing `Last updated` markers.
- Root files that must stay.
- Files safe to move.
- Files that must not move.
- Import and discovery risks.

## Verify

- Markdown date markers.
- Internal links.
- TypeScript imports.
- Test discovery.
- Storybook discovery.
- Relevant checks.
