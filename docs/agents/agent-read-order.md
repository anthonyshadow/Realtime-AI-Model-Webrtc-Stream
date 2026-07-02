# Agent Read Order
> Last updated: 2026-07-01

Use this to choose the minimum useful context for a task.

## Any Task

1. [../00-start-here.md](../00-start-here.md)
2. [always-read.md](always-read.md)
3. Relevant source files

Avoid archived docs and completed implementation plans unless the task directly touches history or archival cleanup.

## Broad Docs And Exceptions

Read broad docs only when the task needs their scope:

- `docs/archive/*`: only for history, archive cleanup, or verifying a migrated historical claim.
- Completed plans: only for precedent or cleanup of that plan's artifacts.
- [../testing/live-smoke-tests.md](../testing/live-smoke-tests.md): only for explicitly gated live Decart smoke-test workflow design.
- [../context/assets/](../context/assets/): only for visual reference, UI comparison, or product/design archaeology.
- [../project-cleanup-and-documentation-audit.md](../project-cleanup-and-documentation-audit.md): only for cleanup, refactor, or documentation audit work.

## UI Or Control Panel

1. [../08-ui-and-ux.md](../08-ui-and-ux.md)
2. [../12-ux-recording-architecture.md](../12-ux-recording-architecture.md)
3. `src/App.tsx`
4. `src/components/ControlPanel/`
5. `src/components/RecordingDock/`
6. Closest stories and tests

## Decart Or API Integration

1. [../06-api-and-integrations.md](../06-api-and-integrations.md)
2. [../07-webrtc-and-media.md](../07-webrtc-and-media.md)
3. [../12-ux-recording-architecture.md](../12-ux-recording-architecture.md)
4. `server/decartToken.ts`
5. `src/lib/decartClient.ts`
6. `src/hooks/useLiveSession.ts`
7. `src/hooks/useDecartModelSession.ts`
8. `src/hooks/useMediaSession.ts`
9. `src/hooks/useSessionRecording.ts`

## Tests

1. [../04-testing.md](../04-testing.md)
2. [../testing/test-strategy.md](../testing/test-strategy.md)
3. [../12-ux-recording-architecture.md](../12-ux-recording-architecture.md#testing-contract)
4. Closest existing test file
5. [../skills/testing/adding-unit-tests.md](../skills/testing/adding-unit-tests.md) or [../skills/testing/adding-e2e-tests.md](../skills/testing/adding-e2e-tests.md)

## Storybook

1. [../05-storybook.md](../05-storybook.md)
2. [../storybook/story-authoring-guide.md](../storybook/story-authoring-guide.md)
3. Closest existing story file
4. [../skills/storybook/adding-component-stories.md](../skills/storybook/adding-component-stories.md)

## Documentation

1. [../11-documentation-maintenance.md](../11-documentation-maintenance.md)
2. [../skills/maintenance/documentation-maintenance.md](../skills/maintenance/documentation-maintenance.md)
3. Existing canonical doc for the topic
4. [../project-cleanup-and-documentation-audit.md](../project-cleanup-and-documentation-audit.md) for documentation cleanup or audit work only

## Cleanup Or Refactor

1. [../project-cleanup-and-documentation-audit.md](../project-cleanup-and-documentation-audit.md)
2. Relevant source, tests, and stories
3. Closest canonical docs for affected source areas
4. [../skills/maintenance/repo-audit.md](../skills/maintenance/repo-audit.md) for broad repo audits only
5. [repo-audit-checklist.md](repo-audit-checklist.md) for checklist-driven audits only
