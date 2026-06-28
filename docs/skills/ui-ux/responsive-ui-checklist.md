# Skill: Responsive UI Checklist
> Last updated: 2026-06-28

## Use when

- Changing layout, responsive behavior, video stage, or controls.

## Read first

- [../../08-ui-and-ux.md](../../08-ui-and-ux.md)
- Relevant stories.

## Steps

1. Check mobile and desktop viewport behavior.
2. Keep video primary and controls usable.
3. Ensure text fits buttons, panels, and upload states.
4. Verify the panel can scroll within small viewports.
5. Keep status, errors, and Stop reachable.

## Checks

- `npm run test:storybook`
- `npm run test:a11y` for stable story changes.
- Manual browser check when layout changes materially.

## Do not

- Do not let controls overlap incoherently.
- Do not require hover-only access for critical actions.

## Update docs

- Update [../../08-ui-and-ux.md](../../08-ui-and-ux.md) if responsive rules change.
- Update the Last updated date of any document changed.
