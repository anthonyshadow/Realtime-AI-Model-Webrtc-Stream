import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
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

export const Disabled: Story = {
  args: {
    checked: false,
  },
};
