import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import type { SupportedModelMode } from "../../constants/models";
import { ModelModeSelector } from "./ModelModeSelector";

const meta = {
  title: "Control Panel/ModelModeSelector",
  component: ModelModeSelector,
  tags: ["autodocs"],
  args: {
    disabled: false,
    onChange: fn(),
    value: "lucy-2.1",
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm bg-neutral-950 p-4 text-white">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ModelModeSelector>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LucySelected: Story = {};

export const ChangesSelection: Story = {
  render: (args) => {
    const [value, setValue] = useState<SupportedModelMode>(args.value ?? "lucy-2.1");

    return (
      <ModelModeSelector
        {...args}
        value={value}
        onChange={(nextValue) => {
          args.onChange(nextValue);
          setValue(nextValue);
        }}
      />
    );
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const lucyButton = canvas.getByRole("button", { name: /Lucy/i });
    const vtonButton = canvas.getByRole("button", { name: /VTON/i });

    await expect(lucyButton).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(vtonButton);

    await expect(vtonButton).toHaveAttribute("aria-pressed", "true");
    await expect(args.onChange).toHaveBeenCalledWith("lucy-vton-3");
  },
};

export const VtonSelected: Story = {
  args: {
    value: "lucy-vton-3",
  },
};

export const DisabledDuringSession: Story = {
  args: {
    disabled: true,
    value: "lucy-vton-3",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("button", { name: /Lucy/i })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: /VTON/i })).toBeDisabled();
  },
};
