# Project Cleanup and Documentation Audit
> Last updated: 2026-07-01

## 1. Executive Summary

The project is in a healthy, recently organized state. The documentation set already has a compact root entry point, canonical topic docs, task-specific agent routing, short repo skills, and an archive area. Source architecture is also mostly well bounded: `App.tsx` composes state and hooks, hooks own lifecycle, `lib/` owns isolated helpers, components stay presentational, and Decart token creation remains server-side.

The main documentation risk is not missing coverage; it is future token waste. Most docs are short, but `docs/ui-ux-stream-first-redesign-plan.md` is a large completed implementation plan that now duplicates canonical UX and recording docs. Future agents should not read it by default. The next highest-value documentation work is routing refinement in `docs/00-start-here.md`, `docs/02-architecture.md`, `docs/08-ui-and-ux.md`, and `docs/12-ux-recording-architecture.md`.

The main code cleanup opportunities are low-to-medium risk duplicate reduction: shared status predicates and labels, duplicate status/metric UI primitives, duplicate button styling, duplicated unit-test `FakeMediaRecorder` classes, and a now-superseded `AutoHidingControlPanel` wrapper. Larger files such as `App.tsx`, `FloatingRecordingDock.tsx`, and `SessionSetupPanel.tsx` should be split only after low-risk primitive and helper cleanup lands.

Verification baseline at audit time:

- `npm run typecheck`: passed.
- `npm run test:unit`: passed, 23 files and 183 tests.
- Markdown date check: passed, 49 existing Markdown files.
- `npm run test:storybook`: passed, 14 files and 115 tests, after local server permission was granted because sandboxed bind failed with `EPERM`.

## 2. Files and Documents Reviewed

Markdown reviewed:

- Root docs: `AGENTS.md`, `README.md`.
- Canonical docs: `docs/00-start-here.md` through `docs/12-ux-recording-architecture.md`.
- Plan/context docs: `docs/ui-ux-stream-first-redesign-plan.md`, `docs/context/*`.
- Agent docs: `docs/agents/*`.
- Skill docs: `docs/skills/*` and subfolders.
- Testing docs: `docs/testing/*`.
- Storybook docs: `docs/storybook/*`.
- Archive docs: `docs/archive/*`.

Project/config files reviewed:

- `package.json`, `package-lock.json`, `.env.example`.
- `tsconfig.json`, `tsconfig.node.json`, `tsconfig.e2e.json`, `tsconfig.storybook.json`.
- `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `playwright.a11y.config.ts`, `.storybook/main.ts`, `.storybook/preview.tsx`, `tailwind.config.ts`, `postcss.config.js`.

Source areas reviewed:

- App shell: `src/App.tsx`, `src/main.tsx`.
- Components: `src/components/ControlPanel/`, `src/components/RecordingDock/`, `src/components/StudioUI/`, `src/components/VideoStage/`.
- Hooks: `src/hooks/`.
- Utilities/constants/types: `src/lib/`, `src/constants/`, `src/types/`.
- Tests and mocks: `src/tests/`, `src/test/`, `tests/e2e/`, `tests/a11y/`.
- Server: `server/`.
- Visual assets: `docs/context/assets/`, `screenshots/`.

Not found:

- `CLAUDE.md` is referenced by the original audit request but is not present in this repo. `docs/agents/claude-guide.md` exists as the Claude-specific shim.
- No ESLint config or lint script is present.
- No `scripts/` directory is present.

## 3. Documentation Inventory

| Document | Purpose | Current status | Duplicate/stale concerns | Recommended action | Future AI-agent relevance | Risk level |
| --- | --- | --- | --- | --- | --- | --- |
| `AGENTS.md` | Compact always-read repo rules. | Current. | Duplicates some always-read rules intentionally. | Keep as-is. | Always read. | Low |
| `README.md` | Human quickstart and project summary. | Current. | Some overlap with `00-start-here` is acceptable. | Keep as-is. | Read for onboarding or external summary. | Low |
| `docs/00-start-here.md` | Main docs index and fast orientation. | Current but routing can be sharper. | Links the completed redesign plan as a normal doc. | Keep but update in routing phase. | Read after `AGENTS.md` for any task. | Low |
| `docs/01-project-overview.md` | Product scope, flow, capabilities, non-goals. | Current. | Some overlap with README and requirements, but concise. | Keep as-is. | Read for onboarding or feature planning. | Low |
| `docs/02-architecture.md` | Source layout, ownership boundaries, runtime flow. | Current with a few cleanup-dependent references. | Mentions compatibility/legacy surfaces that may change after cleanup. | Keep but update after code cleanup. | Read for architecture, integration, refactor work. | Medium |
| `docs/03-development.md` | Setup, environment, scripts, workflow. | Current. | No stale concern found. | Keep as-is. | Read for setup/tooling changes. | Low |
| `docs/04-testing.md` | Test stack and default commands. | Current. | Some details duplicated in `docs/testing/*`, intentionally. | Keep as-is. | Read for testing changes. | Low |
| `docs/05-storybook.md` | Storybook setup, commands, mocks, placement. | Current. | Some overlap with Storybook subdocs. | Keep as-is. | Read for Storybook changes. | Low |
| `docs/06-api-and-integrations.md` | Decart token/SDK integration and security boundary. | Current. | Official links may need periodic verification. | Keep as-is. | Read for Decart/API/model changes. | Medium |
| `docs/07-webrtc-and-media.md` | Media, stream, recording, and lifecycle behavior. | Current. | Detailed, but appropriate for high-risk media work. | Keep as-is. | Read for camera/WebRTC/recording changes. | Medium |
| `docs/08-ui-and-ux.md` | Current UX rules and stream-first behavior. | Current, but can absorb final useful guidance from old plan. | Overlaps with `12` and completed redesign plan. | Keep but update after archival routing. | Read for UI/UX changes. | Medium |
| `docs/09-agent-workflows.md` | Efficient repo navigation for agents. | Current. | Overlaps with `agent-read-order`, but intentionally shorter. | Keep as-is. | Read for agent process improvements. | Low |
| `docs/10-deployment-and-env.md` | Local env, preview, deployment limits. | Current. | No stale concern found. | Keep as-is. | Read for env/deployment work. | Low |
| `docs/11-documentation-maintenance.md` | Docs placement, dates, archive conventions. | Current. | No stale concern found. | Keep as-is. | Read for documentation changes. | Low |
| `docs/12-ux-recording-architecture.md` | Maintainer contract for control panel, dock, recording, release behavior. | Current. | Duplicates some UX rules from `08`; should remain the deeper contract. | Keep but update after cleanup decisions. | Read for UI recording/control changes. | Medium |
| `docs/ui-ux-stream-first-redesign-plan.md` | Historical redesign audit and phased plan. | Completed plan. | Large token sink; contains stale "current issue" observations and final verification. | Archive candidate. | Avoid unless investigating redesign history. | Low to medium |
| `docs/agents/agent-read-order.md` | Minimal docs by task type. | Current. | Could eventually link the audit for cleanup work. | Keep as-is in first phase. | Read for task routing. | Low |
| `docs/agents/always-read.md` | Always-read editing rules. | Current. | Intentional overlap with `AGENTS.md`. | Keep as-is. | Always read before editing. | Low |
| `docs/agents/claude-guide.md` | Claude/manual-agent shim. | Current. | Root `CLAUDE.md` does not exist; this is the substitute. | Keep as-is. | Read only for Claude/manual assistant context. | Low |
| `docs/agents/codex-guide.md` | Codex-specific habits. | Current. | Minor overlap with developer norms, useful locally. | Keep as-is. | Read for Codex process context. | Low |
| `docs/agents/implementation-rules.md` | Non-negotiable implementation rules. | Current. | Duplicates some canonical docs intentionally. | Keep as-is. | Read for any implementation task. | Medium |
| `docs/agents/prompt-library.md` | Reusable short prompts. | Current. | No stale concern found. | Keep as-is. | Optional for delegation/prompt writing. | Low |
| `docs/agents/repo-audit-checklist.md` | Broad audit checklist. | Current. | Overlaps with repo-audit skill; one is checklist, one procedure. | Keep as-is. | Read for broad cleanup audits. | Low |
| `docs/archive/README.md` | Archive index. | Current. | Needs update if redesign plan is archived. | Keep as-is now; update in archive phase. | Avoid unless tracing history. | Low |
| `docs/archive/documentation-migration-summary.md` | Historical migration record. | Archived. | Historical by design. | Keep as-is. | Avoid unless tracing previous doc moves. | Low |
| `docs/context/implementation-decisions.md` | Decisions explaining architecture shape. | Current. | Some overlap with architecture, but valuable rationale. | Keep as-is. | Read for architectural tradeoffs. | Medium |
| `docs/context/known-limitations.md` | Current product and browser limitations. | Current. | Some overlap with overview non-goals. | Keep as-is. | Read for scope expansion or production claims. | Low |
| `docs/context/product-requirements.md` | Product behavior and acceptance criteria. | Current. | Some overlap with overview, but more acceptance-focused. | Keep as-is. | Read for feature planning and acceptance criteria. | Medium |
| `docs/context/screens.md` | Visual/reference breakdown for redesign. | Possibly historical. | Duplicates current UX docs and completed redesign plan. | Needs human confirmation. | Avoid unless doing visual/product reference work. | Low to medium |
| `docs/skills/README.md` | Explains repo-local skills. | Current. | No stale concern found. | Keep as-is. | Optional; read before skill authoring. | Low |
| `docs/skills/skill-index.md` | Skill index. | Current. | No stale concern found. | Keep as-is. | Read when choosing a task procedure. | Low |
| `docs/skills/skill-template.md` | Template for new repo skills. | Current. | No stale concern found. | Keep as-is. | Read only when adding a skill. | Low |
| `docs/skills/api-integrations/working-with-decart-lucy.md` | Decart/Lucy change procedure. | Current. | No stale concern found. | Keep as-is. | Read for Decart/API changes. | Medium |
| `docs/skills/maintenance/dependency-update-checklist.md` | Dependency update procedure. | Current. | No stale concern found. | Keep as-is. | Read for dependency updates. | Low |
| `docs/skills/maintenance/documentation-maintenance.md` | Documentation change procedure. | Current. | No stale concern found. | Keep as-is. | Read for doc additions/moves/archives. | Low |
| `docs/skills/maintenance/repo-audit.md` | Broad repo audit procedure. | Current. | Overlaps with `repo-audit-checklist`, intentionally procedural. | Keep as-is. | Read for broad audits. | Low |
| `docs/skills/storybook/adding-component-stories.md` | Component story procedure. | Current. | No stale concern found. | Keep as-is. | Read for component stories. | Low |
| `docs/skills/storybook/adding-story-interaction-tests.md` | Story `play` procedure. | Current. | No stale concern found. | Keep as-is. | Read for story interactions. | Low |
| `docs/skills/testing/adding-e2e-tests.md` | Playwright test procedure. | Current. | No stale concern found. | Keep as-is. | Read for E2E changes. | Medium |
| `docs/skills/testing/adding-unit-tests.md` | Vitest/component test procedure. | Current. | No stale concern found. | Keep as-is. | Read for unit/component tests. | Low |
| `docs/skills/testing/testing-webrtc-and-media.md` | Media/WebRTC test procedure. | Current. | No stale concern found. | Keep as-is. | Read for media lifecycle tests. | Medium |
| `docs/skills/ui-ux/modifying-control-panel.md` | Control panel UI procedure. | Current. | No stale concern found. | Keep as-is. | Read for control panel work. | Medium |
| `docs/skills/ui-ux/responsive-ui-checklist.md` | Responsive UI checklist. | Current. | No stale concern found. | Keep as-is. | Read for layout/responsive changes. | Medium |
| `docs/storybook/story-authoring-guide.md` | Storybook CSF authoring pattern. | Current. | Some overlap with story skill; acceptable. | Keep as-is. | Read for story authoring. | Low |
| `docs/storybook/storybook-strategy.md` | Story selection policy. | Current. | Some overlap with `05-storybook`. | Keep as-is. | Read when deciding story coverage. | Low |
| `docs/testing/e2e-testing.md` | E2E and a11y setup, mocks, coverage. | Current. | Detailed but necessary for high-risk tests. | Keep as-is. | Read for Playwright/a11y work. | Medium |
| `docs/testing/live-smoke-tests.md` | Future live Decart smoke-test requirements. | Current. | Future-facing; intentionally not active. | Keep as-is. | Read only for live-smoke design. | Medium |
| `docs/testing/mocks-and-fixtures.md` | Mock locations and rules. | Current. | No stale concern found. | Keep as-is. | Read for mock/test fixture work. | Medium |
| `docs/testing/test-strategy.md` | Test level selection. | Current. | Some overlap with `04-testing`. | Keep as-is. | Read for test planning. | Low |

## 4. Documentation Routing Matrix

| Task type | Required docs | Optional docs | Avoid unless relevant | Reasoning |
| --- | --- | --- | --- | --- |
| General project onboarding | `AGENTS.md`, `docs/00-start-here.md`, `README.md`, `docs/01-project-overview.md` | `docs/context/product-requirements.md`, `docs/context/known-limitations.md` | Archived docs, completed redesign plan | Gives product, setup, and boundaries without deep implementation detail. |
| UI/UX changes | `AGENTS.md`, `docs/00-start-here.md`, `docs/08-ui-and-ux.md`, `docs/12-ux-recording-architecture.md` | `docs/skills/ui-ux/*`, relevant stories/tests, `docs/context/screens.md` if visual reference is needed | `docs/ui-ux-stream-first-redesign-plan.md` unless investigating history | Current UX contracts live in `08` and `12`; the old plan should not be default context. |
| Design system or styling changes | `docs/08-ui-and-ux.md`, `docs/12-ux-recording-architecture.md`, `src/constants/design.ts`, `src/components/StudioUI/` | `docs/skills/ui-ux/responsive-ui-checklist.md`, StudioUI stories/tests | API/media docs unless behavior changes | Keeps work centered on primitives and visual contracts. |
| Component refactors | `docs/02-architecture.md`, `docs/08-ui-and-ux.md`, closest component files/tests/stories | `docs/12-ux-recording-architecture.md` for control/dock work | Deployment docs, live smoke docs | Component work should preserve ownership boundaries and local coverage. |
| Testing changes | `docs/04-testing.md`, closest test file | `docs/testing/test-strategy.md`, `docs/testing/mocks-and-fixtures.md`, relevant testing skill | Storybook docs unless stories change | Prevents over-reading while preserving mock and placement rules. |
| Storybook changes | `docs/05-storybook.md`, `docs/storybook/story-authoring-guide.md`, closest story file | `docs/storybook/storybook-strategy.md`, `docs/skills/storybook/*`, `tests/a11y/storybook-a11y.spec.ts` if stable story IDs change | E2E docs unless app flow changes | Storybook has separate mocks, IDs, and test expectations. |
| API/integration changes | `docs/06-api-and-integrations.md`, `docs/07-webrtc-and-media.md`, `docs/agents/implementation-rules.md` | `docs/skills/api-integrations/working-with-decart-lucy.md`, `server/decartToken.ts`, `src/lib/decartClient.ts` | UI redesign history | High-risk Decart/token work needs security and lifecycle context. |
| WebRTC/media/recording changes | `docs/07-webrtc-and-media.md`, `docs/12-ux-recording-architecture.md`, relevant hooks/libs | `docs/testing/mocks-and-fixtures.md`, `docs/skills/testing/testing-webrtc-and-media.md` | Deployment docs unless release behavior changes | Media work is lifecycle-heavy and needs the recording contract. |
| Performance work | `docs/02-architecture.md`, relevant source | `docs/context/known-limitations.md`, build config | Completed redesign plan | Current known chunk-size issue is documented; most performance work should start in source. |
| Build/tooling changes | `docs/03-development.md`, `docs/04-testing.md`, `package.json`, relevant config | `docs/skills/maintenance/dependency-update-checklist.md` | UI docs unless impacted | Tooling changes need scripts/config/tests, not product docs. |
| Deployment or environment work | `docs/10-deployment-and-env.md`, `docs/03-development.md`, `.env.example`, server env files | `docs/testing/live-smoke-tests.md` if live workflow is proposed | UI docs unless deployment affects UI | Keeps secret and local preview boundaries explicit. |
| Bug fixing | `AGENTS.md`, `docs/00-start-here.md`, `docs/agents/agent-read-order.md`, closest source/test | Topic-specific canonical doc from read order | Broad archive and old plan docs | Start narrow; expand only around the failing behavior. |
| New feature planning | `docs/01-project-overview.md`, `docs/context/product-requirements.md`, topic docs | `docs/context/known-limitations.md`, `docs/context/implementation-decisions.md` | Completed implementation plans unless relevant precedent is needed | Feature plans need scope/non-goals and current decisions. |
| Cleanup/refactor work | `docs/11-documentation-maintenance.md`, `docs/skills/maintenance/repo-audit.md`, `docs/agents/repo-audit-checklist.md`, relevant source/tests | This audit document | Live smoke docs, archive docs except target history | Broad cleanup needs routing and risk classification, but should avoid unrelated history. |

## 5. Documentation Pruning Plan

### Phase 1: Index and routing improvements

Status: Implemented on 2026-07-01. The default index now avoids completed plans, agent read-order routes cleanup and documentation audit work to this file, and workflow guidance keeps archived or historical material out of normal reads.

Goal: make task-based routing explicit and reduce accidental reading of historical docs.

Files affected:

- `docs/00-start-here.md`
- `docs/agents/agent-read-order.md`
- `docs/09-agent-workflows.md`
- `docs/project-cleanup-and-documentation-audit.md`

Exact intended changes:

- Add this audit to cleanup/refactor/documentation routing only.
- Remove the completed redesign plan from the general "Use These Docs" path or label it historical.
- Add "avoid unless investigating history" guidance for archived/completed plans.
- Keep `AGENTS.md` compact.

Risks:

- Low. Bad routing can hide useful context, but no runtime behavior changes.

Validation steps:

- Markdown date check.
- Internal link check for changed docs.
- `npm run typecheck` if any code snippets or paths touch typed config.

Prompt to execute:

```text
Update documentation routing only. Read docs/project-cleanup-and-documentation-audit.md section 5 phase 1, docs/11-documentation-maintenance.md, and docs/agents/agent-read-order.md. Keep behavior unchanged. Update Last updated dates and verify Markdown date markers and internal links.
```

### Phase 2: Update stale docs

Goal: update current canonical docs after confirmed cleanup decisions.

Files affected:

- `docs/02-architecture.md`
- `docs/08-ui-and-ux.md`
- `docs/12-ux-recording-architecture.md`
- `docs/07-webrtc-and-media.md` only if media compatibility exports change

Exact intended changes:

- Remove stale references to deleted or consolidated components after code cleanup.
- Clarify that `StudioUI` primitives are preferred for status, metric, upload, button, surface, and error UI.
- Keep `12` as the detailed recording/control contract and `08` as the concise UX entry point.

Risks:

- Low to medium. Incorrect docs can mislead future implementation.

Validation steps:

- Markdown date check.
- Source search for mentioned component names.
- `npm run typecheck` if paths/import assumptions are changed in examples.

Prompt to execute:

```text
Update canonical docs to match completed cleanup. Read docs/project-cleanup-and-documentation-audit.md section 5 phase 2 and verify source references with rg before editing. Do not change source code. Update Last updated dates and run the Markdown date check.
```

### Phase 3: Merge duplicate docs

Goal: reduce overlapping UX/context material without losing useful guidance.

Files affected:

- `docs/08-ui-and-ux.md`
- `docs/12-ux-recording-architecture.md`
- `docs/context/screens.md`
- `docs/ui-ux-stream-first-redesign-plan.md`

Exact intended changes:

- Move any still-current short UX guidance from the completed redesign plan into `08` or `12`.
- Keep visual reference content in `docs/context/screens.md` only if humans still want it.
- Do not merge archived historical narrative into canonical docs.

Risks:

- Medium. Visual intent can be lost if `screens.md` is removed too aggressively.

Validation steps:

- Human confirmation for visual reference retention.
- Markdown date check.
- Internal link check.

Prompt to execute:

```text
Consolidate current UX guidance only. Read docs/project-cleanup-and-documentation-audit.md section 5 phase 3 plus docs/08-ui-and-ux.md and docs/12-ux-recording-architecture.md. Do not delete visual references without human confirmation. Update dates and links.
```

### Phase 4: Archive or delete obsolete docs

Goal: move completed historical planning out of normal read paths.

Files affected:

- `docs/ui-ux-stream-first-redesign-plan.md`
- `docs/archive/README.md`
- Possibly `docs/context/screens.md` after human confirmation

Exact intended changes:

- Move the completed redesign plan to `docs/archive/` or mark it archived in place, preserving history.
- Add archive metadata per `docs/11-documentation-maintenance.md`.
- Update `docs/archive/README.md`.
- Do not delete Markdown in this phase unless a human explicitly confirms.

Risks:

- Low for the redesign plan, medium for visual references.

Validation steps:

- Markdown date check.
- Internal link check.
- `rg` for old path references.

Prompt to execute:

```text
Archive completed historical docs only. Read docs/project-cleanup-and-documentation-audit.md section 5 phase 4 and docs/11-documentation-maintenance.md. Prefer archive over delete. Update archive metadata, links, and Last updated dates.
```

### Phase 5: Add future-agent usage guidance

Goal: make future prompts token-efficient by teaching agents when not to read broad docs.

Files affected:

- `docs/agents/agent-read-order.md`
- `docs/09-agent-workflows.md`
- `docs/11-documentation-maintenance.md`
- Possibly `AGENTS.md` only if a one-line rule is needed

Exact intended changes:

- Add compact "do not read unless" guidance for archive/history, live smoke docs, visual references, and completed plans.
- Add cleanup/refactor read path that starts with this audit and relevant source only.
- Keep root instructions compact.

Risks:

- Low. Overly aggressive "avoid" rules could hide important context.

Validation steps:

- Markdown date check.
- Manual review that `AGENTS.md` remains compact.

Prompt to execute:

```text
Add future-agent usage guidance. Read docs/project-cleanup-and-documentation-audit.md section 5 phase 5. Keep root instructions compact, prefer task routing in docs/agents/agent-read-order.md, update Last updated dates, and verify Markdown date markers.
```

## 6. Code Duplication and Refactor Audit

| Area | Files | Duplication or issue found | Recommended refactor | Risk level | Tests/stories needed | Suggested phase |
| --- | --- | --- | --- | --- | --- | --- |
| Superseded auto-hide wrapper | `src/components/ControlPanel/AutoHidingControlPanel.tsx`, local test, docs | App now coordinates one shared live overlay for panel and dock; wrapper is only test/doc referenced. | Remove the wrapper and its dedicated test, or explicitly mark it as compatibility if retained. | Low to medium | `npm run test:unit`; ensure `useAutoHideOverlay` tests still cover behavior. | Low-risk cleanup |
| Compatibility hook re-export | `src/hooks/useDecartRealtimeSession.ts` | One-line compatibility re-export for older name. | Keep unless human confirms public/internal compatibility can be removed. | Medium | Typecheck and source search. | Human-confirmation |
| Compatibility error re-export | `src/components/ControlPanel/ErrorBanner.tsx` | Re-exports `StudioUI/ErrorBanner`; useful only for stable imports/stories. | Retain or migrate story imports to `StudioUI` and remove after docs update. | Low | Storybook tests. | Human-confirmation |
| Status predicates | `src/App.tsx`, `src/hooks/useLiveSession.ts`, `src/hooks/useDecartModelSession.ts`, `src/components/ControlPanel/SessionControls.tsx`, `src/components/ControlPanel/AutoHidingControlPanel.tsx` | Running, connecting, apply, and auto-hide status sets are repeated. | Add `src/lib/realtimeStatus.ts` or constants near `types/realtime.ts`. | Low | Unit tests for helper plus existing app/session tests. | Shared status helpers |
| Status labels | `StatusBadge.tsx`, `StatusSummary.tsx`, stories/tests | Realtime status labels are duplicated with slightly different labels. | Centralize label/tone mapping or make context-specific helpers explicit. | Low | Status component stories/tests. | Shared status helpers |
| Status pill primitive | `VideoStage/StatusBadge.tsx`, `StudioUI/StatusPill.tsx` | Two similar pill components. | Replace `StatusBadge` internals or usage with `StatusPill`; keep story title stable or update a11y if referenced. | Low | VideoStage stories/tests; Storybook test. | Primitive consolidation |
| Metric cells | `StatusSummary.tsx`, `SessionSetupPanel.tsx`, `RecordingPlaybackPanel.tsx`, `StudioUI/MetricCard.tsx` | Local `StatusCell` and `SetupCheckItem` duplicate `MetricCard`. | Use `MetricCard` where sizing and text fit match. | Low | ControlPanel and StudioUI tests/stories. | Primitive consolidation |
| Button styling | `SessionControls.tsx`, `RecordingDockButton.tsx`, `RecordingPlaybackPanel.tsx`, `StudioUI/Button.tsx` | Local button class strings duplicate shared button variants. | Use shared `Button`, `PrimaryButton`, `SecondaryButton`, `DangerButton` where shapes allow; keep rounded recorder CTA if intentional. | Medium | ControlPanel/RecordingDock tests and stories. | Primitive consolidation |
| Setup panel size | `SessionSetupPanel.tsx` | 326 lines with setup cards, check items, and helper logic in one file. | After primitive cleanup, split setup cards/checklist helpers or move reusable pieces. | Medium | ControlPanel tests/stories. | Reusable component extraction |
| Recording dock size | `FloatingRecordingDock.tsx` | 379 lines mixing dock shell, status derivation, error descriptor, review coordination, layout classes. | Extract `getRecordingStatus` to pure helper and split transport/review shell only after tests stay green. | Medium to high | RecordingDock tests/stories, app recording tests, E2E recording flow. | Reusable component extraction |
| App derived state | `src/App.tsx` | 397 lines combining draft state, overlay state, recording completion, event handlers, helper functions. | Extract pure helpers for draft/input/recording dock layout only; keep orchestration in App. | Medium | App tests and typecheck. | State cleanup |
| Unit `FakeMediaRecorder` | `src/tests/App.test.tsx`, `src/hooks/useSessionRecording.test.ts` | Similar fake classes duplicated; hook version supports start failure. | Move a reusable fake to `src/test/mocks/fakeMediaRecorder.ts`. | Low to medium | App tests and hook tests. | Test helper cleanup |
| E2E browser mocks | `tests/e2e/app.spec.ts` | Large inline mock setup for media, Decart SDK, recorder, object URLs. | Keep separate for now because it runs in browser context; later split within E2E helpers if needed. | Medium | E2E suite. | Test cleanup, later |
| Story fixtures/args | `src/stories/App.stories.tsx`, `ControlPanel.stories.tsx` | Long story files with repeated responsive/error state setup. | Extract local story fixtures only if story readability worsens. | Low | Storybook tests and a11y if IDs change. | Storybook coverage cleanup |
| Visual reference assets | `docs/context/screens.md`, `docs/context/assets/*`, `screenshots/*` | Could be stale after redesign completion; value depends on human workflow. | Ask human before archive/delete; route away from default agent reads. | Low to medium | Link checks only. | Documentation pruning |

## 7. Code Cleanup Plan

### Low-risk cleanup

Goal: remove or explicitly retain no-longer-used compatibility surfaces.

Files affected:

- `src/components/ControlPanel/AutoHidingControlPanel.tsx`
- `src/components/ControlPanel/tests/AutoHidingControlPanel.test.tsx`
- Related docs that mention `AutoHidingControlPanel`

Exact intended changes:

- Confirm with `rg` that runtime imports are absent.
- Prefer removing the wrapper and its wrapper-specific test.
- Keep `useAutoHideOverlay.test.tsx` as the canonical coverage for overlay behavior.
- Update docs to remove stale component inventory entries.

Risks:

- Low to medium. The wrapper may be useful as rollback surface, but current App does not import it.

Validation steps:

- `npm run typecheck`
- `npm run test:unit`
- `npm run test:storybook`

Prompt to execute:

```text
Perform low-risk cleanup for AutoHidingControlPanel only. Verify imports with rg, remove only unused runtime/test/doc references, keep useAutoHideOverlay coverage, update docs and Last updated dates, then run typecheck, unit, and Storybook tests.
```

### Duplicate utility extraction

Goal: centralize repeated realtime status predicates and labels.

Files affected:

- New helper such as `src/lib/realtimeStatus.ts`
- `src/App.tsx`
- `src/hooks/useLiveSession.ts`
- `src/hooks/useDecartModelSession.ts`
- `src/components/ControlPanel/SessionControls.tsx`
- `src/components/VideoStage/StatusBadge.tsx` or replacement
- `src/components/ControlPanel/StatusSummary.tsx`

Exact intended changes:

- Export predicates like `isRunningRealtimeStatus`, `isConnectingRealtimeStatus`, and `canApplyRealtimeStatus`.
- Export labels only when the same label is truly shared; otherwise keep context-specific labels named clearly.
- Do not change realtime status values or behavior.

Risks:

- Low. Risk is accidental label/copy change.

Validation steps:

- Unit tests for helper.
- Existing app/control/session tests.
- `npm run typecheck`
- `npm run test:unit`

Prompt to execute:

```text
Extract shared realtime status helpers without changing behavior or copy. Read docs/project-cleanup-and-documentation-audit.md section 7 duplicate utility extraction. Add focused helper tests and run typecheck and unit tests.
```

### Reusable component extraction

Goal: reduce duplicated UI primitives after helper cleanup.

Files affected:

- `src/components/VideoStage/StatusBadge.tsx`
- `src/components/ControlPanel/StatusSummary.tsx`
- `src/components/ControlPanel/SessionSetupPanel.tsx`
- `src/components/ControlPanel/SessionControls.tsx`
- `src/components/RecordingDock/RecordingDockButton.tsx`
- `src/components/StudioUI/*`

Exact intended changes:

- Use `StatusPill` for stage status, preserving accessible status text.
- Use `MetricCard` for duplicate metric/check cells where it does not alter layout.
- Use shared button components where the same variants are being manually recreated.
- Keep recorder-specific rounded-full styling if it is intentionally distinct.

Risks:

- Medium. UI regressions can come from subtle class and responsive changes.

Validation steps:

- `npm run typecheck`
- `npm run test:unit`
- `npm run test:storybook`
- Manual or Playwright viewport checks if layout changes materially.

Prompt to execute:

```text
Consolidate UI primitives in a behavior-preserving pass. Use StudioUI primitives for duplicate status, metric, and button surfaces only where layout remains equivalent. Update local stories/tests and run typecheck, unit, and Storybook tests.
```

### Styling cleanup

Goal: reduce scattered layout constants and repeated class strings after primitive migration.

Files affected:

- `src/constants/design.ts`
- `ControlPanel`, `SessionSetupPanel`, `FloatingRecordingDock`, related stories

Exact intended changes:

- Use existing `studioClassNames`, panel width constants, and overlay lanes consistently.
- Do not invent new tokens unless they remove real duplication.
- Preserve mobile/dock overlap behavior.

Risks:

- Medium. Styling cleanup can accidentally change responsive behavior.

Validation steps:

- Storybook tests.
- A11y tests if stable stories change.
- E2E viewport checks if panel/dock layout classes change.

Prompt to execute:

```text
Clean repeated styling only after primitive cleanup. Keep layout behavior unchanged, prefer existing design constants, update stories/tests for any intentional visual changes, and run Storybook plus relevant viewport checks.
```

### State/API cleanup

Goal: make `App.tsx` and large hooks easier to read without moving ownership boundaries.

Files affected:

- `src/App.tsx`
- Possible helper under `src/lib/` or `src/hooks/`
- Existing app tests

Exact intended changes:

- Extract pure helpers for draft creation, apply/start input creation, draft keys, recording dock layout, and standby copy if useful.
- Keep live-session, recording, Decart, and media orchestration in current hooks/App composition.
- Do not change `/api/realtime-token`, Decart SDK calls, media requests, recording lifecycle, or object URL ownership.

Risks:

- Medium to high. App shell has many regression-sensitive flows.

Validation steps:

- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e`

Prompt to execute:

```text
Extract App pure helpers only. Preserve all behavior, Decart/media/recording ownership, and existing prop flow. Add focused tests if helper logic moves out of App, then run typecheck, unit, and E2E tests.
```

### Test and Storybook coverage updates

Goal: keep cleanup safe while reducing duplicated test scaffolding.

Files affected:

- `src/test/mocks/`
- `src/tests/App.test.tsx`
- `src/hooks/useSessionRecording.test.ts`
- `tests/e2e/app.spec.ts` only in a later E2E-specific pass
- Story files touched by component cleanup

Exact intended changes:

- Extract a reusable unit-test `FakeMediaRecorder`.
- Keep E2E browser-context recorder/media mocks separate unless safely split inside the E2E file.
- Preserve Storybook story titles/export names unless a11y config is updated in the same change.

Risks:

- Low to medium for unit fake extraction; medium for E2E helper extraction.

Validation steps:

- `npm run test:unit`
- `npm run test:e2e` for E2E mock edits
- `npm run test:storybook`
- `npm run test:a11y` if stable story IDs change

Prompt to execute:

```text
Extract duplicated unit test recorder helpers only. Do not touch E2E browser-context mocks in this pass. Update App and useSessionRecording tests to use the shared fake, then run unit tests.
```

## 8. Token Usage Optimization Strategy

### Current token risks

- `docs/ui-ux-stream-first-redesign-plan.md` is large and now historical.
- UI agents may read both `08`, `12`, `context/screens`, and the completed redesign plan even though `08` and `12` are enough for most tasks.
- Broad refactor prompts can accidentally pull all docs, all stories, and large tests into context.
- Long test files are useful but should be read only when directly affected.

### Proposed source-of-truth docs

- Project orientation: `docs/00-start-here.md`.
- Product scope: `docs/01-project-overview.md`.
- Architecture: `docs/02-architecture.md`.
- Development/tooling: `docs/03-development.md`.
- Testing: `docs/04-testing.md` plus `docs/testing/*` for details.
- Storybook: `docs/05-storybook.md` plus `docs/storybook/*` for details.
- Decart/API: `docs/06-api-and-integrations.md`.
- Media/recording lifecycle: `docs/07-webrtc-and-media.md`.
- UX: `docs/08-ui-and-ux.md`.
- Recording/control contract: `docs/12-ux-recording-architecture.md`.
- Documentation rules: `docs/11-documentation-maintenance.md`.
- Cleanup roadmap: this audit document.

### Proposed archive docs

- `docs/ui-ux-stream-first-redesign-plan.md`: archive candidate after any still-current guidance is copied into `08` or `12`.
- `docs/context/screens.md`: human-confirmation candidate; keep as visual reference if still useful, otherwise archive or label historical.
- Existing `docs/archive/documentation-migration-summary.md`: keep historical.

### Proposed task-based doc routing

- Always start with `AGENTS.md`, `docs/00-start-here.md`, and `docs/agents/always-read.md`.
- Use `docs/agents/agent-read-order.md` to choose the minimum task docs.
- Read source files before implementation.
- Read skills only for repeatable procedures.
- Avoid archive and completed plans unless the task explicitly asks for history.

### Recommended doc size targets

| Doc group | Target length |
| --- | --- |
| Root `AGENTS.md` | 30 to 60 lines |
| Root `README.md` | 60 to 120 lines |
| `docs/00-start-here.md` | 50 to 90 lines |
| Canonical topic docs `01`-`12` | 40 to 180 lines each; allow `07` and `12` up to 320 lines due media/recording complexity |
| Agent docs | 15 to 80 lines |
| Skills | 25 to 60 lines each |
| Testing/Storybook details | 20 to 100 lines each |
| Context docs | 20 to 120 lines unless visual reference requires more |
| Historical implementation plans | Archive after completion; avoid default read paths |

### Add summaries and "when to read" guidance

- Keep existing "Use this..." intros in canonical docs.
- Add "Do not read unless..." to archive or historical docs.
- Add a short "Current status" line to any completed plan before archive.
- Add "When to read this file" to visual reference docs if retained.

### Future prompt template

```text
Read AGENTS.md, docs/00-start-here.md, docs/agents/always-read.md, and docs/agents/agent-read-order.md.

Then select only the docs for this task:
- UI/UX: docs/08-ui-and-ux.md and docs/12-ux-recording-architecture.md.
- API/Decart/media: docs/06-api-and-integrations.md and docs/07-webrtc-and-media.md.
- Tests: docs/04-testing.md and the relevant docs/testing or skill file.
- Storybook: docs/05-storybook.md and the relevant docs/storybook or skill file.
- Documentation/cleanup: docs/11-documentation-maintenance.md and docs/project-cleanup-and-documentation-audit.md.

Do not read archived docs, completed implementation plans, screenshots, or large tests unless the task directly touches them.
Inspect relevant source before editing.
Keep changes small, preserve behavior unless requested, update docs/dates when conventions or behavior change, and run the closest checks.
```
