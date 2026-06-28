# Skill: Repo Audit
> Last updated: 2026-06-28

## Use when

- Performing a broad repo audit before reorganizing docs, source scaffolding, tests, or stories.

## Read first

- [../../agents/repo-audit-checklist.md](../../agents/repo-audit-checklist.md)
- [../../00-start-here.md](../../00-start-here.md)

## Steps

1. List Markdown, story, test, config, source, agent, and skill files.
2. Classify current, stale, duplicate, global, and movable files.
3. Identify globs and imports affected by moves.
4. Propose structure before editing.
5. Implement only after risks are understood.

## Checks

- `rg --files`
- `npm run typecheck`
- Relevant tests and Storybook checks.

## Do not

- Do not move generated, vendor, global E2E, shared setup, or tool-required files without a clear reason.

## Update docs

- Update migration summaries and canonical docs when the audit leads to moves.
- Update the Last updated date of any document changed.
