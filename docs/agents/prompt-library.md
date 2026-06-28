# Prompt Library
> Last updated: 2026-06-28

Use this for reusable prompts when asking an agent to work in this repo.

## Code Change Prompt

Read `AGENTS.md`, then inspect the relevant source and docs before editing. Preserve app behavior unless requested. Update tests and docs only where the change requires it.

## Test Prompt

Add or update the closest test for this behavior. Use existing mocks and avoid live Decart, real camera prompts, real WebRTC, or external network calls.

## Story Prompt

Add a Storybook story for the real component state. Put it in the local `stories/` folder, keep the play function short, and use existing Storybook mocks.

## Documentation Prompt

Update the canonical doc, avoid duplicating another doc, and update the `Last updated` date.
