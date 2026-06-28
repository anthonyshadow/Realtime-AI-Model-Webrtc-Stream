import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import type { RealtimeStatus } from "../../types/realtime";
import { StatusBadge } from "./StatusBadge";

type StatusBadgeStoryArgs = ComponentProps<typeof StatusBadge> & {
  statuses?: RealtimeStatus[];
};

const allStatuses: RealtimeStatus[] = [
  "idle",
  "requesting-camera",
  "requesting-token",
  "connecting",
  "connected",
  "generating",
  "reconnecting",
  "disconnected",
  "error",
];

const meta = {
  title: "Video Stage/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
  args: {
    status: "idle",
    statuses: allStatuses,
  },
  render: ({ status, statuses }) => (
    <div className="flex flex-wrap gap-3 bg-neutral-950 p-4">
      {(statuses ?? [status]).map((item) => (
        <StatusBadge key={item} status={item} />
      ))}
    </div>
  ),
} satisfies Meta<StatusBadgeStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllStatuses: Story = {};

export const ActiveOnly: Story = {
  args: {
    status: "connected",
    statuses: ["connected", "generating"],
  },
};

export const ErrorOnly: Story = {
  args: {
    status: "error",
    statuses: ["error"],
  },
};
