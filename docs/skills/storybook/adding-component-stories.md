# Skill: Adding Component Stories
> Last updated: 2026-06-28

## Use when

- Adding or moving Storybook stories for real components.

## Read first

- [../../05-storybook.md](../../05-storybook.md)
- [../../storybook/story-authoring-guide.md](../../storybook/story-authoring-guide.md)
- Closest existing story file.

## Steps

1. Put the story in the component folder's local `stories/` folder.
2. Import the component from `../ComponentName`.
3. Use Component Story Format with `Meta` and `StoryObj`.
4. Keep stories prop-driven when possible.
5. Use existing Storybook mocks for API, media, and Decart states.

## Checks

- `npm run typecheck`
- `npm run test:storybook`

## Do not

- Do not create stories for fake components.
- Do not require real camera, live Decart, real WebRTC, external network, or secrets.

## Update docs

- Update [../../05-storybook.md](../../05-storybook.md) if story structure changes.
- Update the Last updated date of any document changed.
