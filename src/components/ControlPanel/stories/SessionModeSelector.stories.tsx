import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import type { SessionModeId } from "../../../constants/sessionModes";
import { SessionModeSelector } from "../SessionModeSelector";

const meta = {
  title: "Control Panel/SessionModeSelector",
  component: SessionModeSelector,
  tags: ["autodocs"],
  args: {
    disabled: false,
    onChange: fn(),
    value: "local",
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm bg-neutral-950 p-4 text-white">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SessionModeSelector>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LocalSelected: Story = {};

export const ChangesSelection: Story = {
  render: (args) => {
    const [value, setValue] = useState<SessionModeId>(args.value ?? "local");

    return (
      <SessionModeSelector
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
    const localButton = canvas.getByRole("button", { name: /Local camera/i });
    const vtonButton = canvas.getByRole("button", { name: /Lucy VTON 3/i });

    await expect(localButton).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(vtonButton);

    await expect(vtonButton).toHaveAttribute("aria-pressed", "true");
    await expect(args.onChange).toHaveBeenCalledWith("lucy-vton-3");
  },
};

export const LucySelected: Story = {
  args: {
    value: "lucy-2.1",
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

    await expect(canvas.getByRole("button", { name: /Local camera/i })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: /Lucy 2.1/i })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: /Lucy VTON 3/i })).toBeDisabled();
  },
};
