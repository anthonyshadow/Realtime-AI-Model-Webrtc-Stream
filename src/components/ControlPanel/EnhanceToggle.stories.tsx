import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { EnhanceToggle } from "./EnhanceToggle";

const meta = {
  title: "Control Panel/EnhanceToggle",
  component: EnhanceToggle,
  tags: ["autodocs"],
  args: {
    checked: true,
    onChange: fn(),
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm bg-neutral-950 p-4 text-white">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EnhanceToggle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Enabled: Story = {};

export const Unchecked: Story = {
  args: {
    checked: false,
  },
};

export const TogglesEnhancement: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(args.checked ?? true);

    return (
      <EnhanceToggle
        {...args}
        checked={checked}
        onChange={(nextChecked) => {
          args.onChange(nextChecked);
          setChecked(nextChecked);
        }}
      />
    );
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox", { name: /Enhance prompt/i });

    await expect(checkbox).toBeChecked();
    await userEvent.click(checkbox);

    await expect(checkbox).not.toBeChecked();
    await expect(args.onChange).toHaveBeenLastCalledWith(false);
  },
};
