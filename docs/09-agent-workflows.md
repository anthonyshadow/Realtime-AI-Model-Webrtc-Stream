# Agent Workflows
> Last updated: 2026-07-01

Use this to work efficiently without reading the whole repository.

## Default Workflow

1. Read [00-start-here.md](00-start-here.md).
2. Read [agents/always-read.md](agents/always-read.md).
3. Use [agents/agent-read-order.md](agents/agent-read-order.md) to choose task docs.
4. Inspect relevant source before editing.
5. Make a small, behavior-safe change.
6. Run the closest checks.
7. Update docs and `Last updated` dates when conventions, commands, behavior, or structure change.

## Use Skills For Repeatable Work

Open [skills/skill-index.md](skills/skill-index.md) when adding tests, stories, Decart integration work, UI changes, documentation updates, audits, or dependency updates.

Skills are execution checklists, not architecture docs. Read the skill's `Read first` section before following its steps.

## Avoid Token Waste

- Prefer canonical docs over archived docs.
- Avoid archived docs and completed implementation plans unless the task directly touches history or archival cleanup.
- Use [project-cleanup-and-documentation-audit.md](project-cleanup-and-documentation-audit.md) only for cleanup, refactor, or documentation audit work.
- Use [testing/live-smoke-tests.md](testing/live-smoke-tests.md) only when an explicitly gated live Decart smoke-test workflow is in scope.
- Use [context/assets/](context/assets/) only for visual reference, UI comparison, or design archaeology.
- Do not read every file for a narrow task.
- Use source search to verify claims.
- Preserve existing boundaries unless the task requires a boundary change.
