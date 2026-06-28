import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatusSummary } from "../StatusSummary";

const meta = {
  title: "Control Panel/StatusSummary",
  component: StatusSummary,
  tags: ["autodocs"],
  args: {
    activeSessionMode: null,
    hasPendingChanges: false,
    isApplying: false,
    selectedSessionMode: "local",
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
    activeSessionMode: "lucy-vton-3",
    selectedSessionMode: "lucy-vton-3",
    status: "connected",
  },
};

export const PendingChanges: Story = {
  args: {
    activeSessionMode: "lucy-2.1",
    hasPendingChanges: true,
    selectedSessionMode: "lucy-2.1",
    status: "generating",
  },
};

export const SendingChanges: Story = {
  args: {
    activeSessionMode: "lucy-vton-3",
    isApplying: true,
    selectedSessionMode: "lucy-vton-3",
    status: "connected",
  },
};

export const Error: Story = {
  args: {
    status: "error",
  },
};
