import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatusSummary } from "../StatusSummary";

const meta = {
  title: "Control Panel/StatusSummary",
  component: StatusSummary,
  tags: ["autodocs"],
  args: {
    activeModelMode: null,
    hasPendingChanges: false,
    isApplying: false,
    selectedModelMode: "lucy-2.1",
    status: "idle",
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm bg-neutral-950 p-4 text-white">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatusSummary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ready: Story = {};

export const LiveSynced: Story = {
  args: {
    activeModelMode: "lucy-vton-3",
    selectedModelMode: "lucy-vton-3",
    status: "connected",
  },
};

export const PendingChanges: Story = {
  args: {
    activeModelMode: "lucy-2.1",
    hasPendingChanges: true,
    status: "generating",
  },
};

export const SendingChanges: Story = {
  args: {
    activeModelMode: "lucy-vton-3",
    isApplying: true,
    selectedModelMode: "lucy-vton-3",
    status: "connected",
  },
};

export const Error: Story = {
  args: {
    status: "error",
  },
};
