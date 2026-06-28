# Story Authoring Guide
> Last updated: 2026-06-28

Use this when adding or moving component stories.

## Placement

- App shell stories: `src/stories/`.
- Component stories: local `stories/` folder inside the component folder.
- Keep suffixes as `*.stories.tsx` or `*.stories.ts`.

## Pattern

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MyComponent } from "../MyComponent";

const meta = {
  title: "Area/MyComponent",
  component: MyComponent,
  tags: ["autodocs"],
} satisfies Meta<typeof MyComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
```

Use `storybook/test` `fn()` for callback props and `expect`, `userEvent`, and `within` for short deterministic `play` functions.

## Checks

```bash
npm run typecheck
npm run test:storybook
npm run test:a11y
```
