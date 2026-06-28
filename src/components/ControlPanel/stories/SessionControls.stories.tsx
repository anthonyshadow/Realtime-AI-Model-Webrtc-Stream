import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { SessionControls } from "../SessionControls";

const meta = {
  title: "Control Panel/SessionControls",
  component: SessionControls,
  tags: ["autodocs"],
  args: {
    hasPendingChanges: false,
    isApplying: false,
    onApply: fn(),
    onReset: fn(),
    onStart: fn(),
    onStop: fn(),
    status: "idle",
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm bg-neutral-950 p-4 text-white">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SessionControls>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("button", { name: "Start" })).toBeEnabled();
    await expect(canvas.getByRole("button", { name: "Apply" })).toBeDisabled();

    await userEvent.click(canvas.getByRole("button", { name: "Start" }));

    await expect(args.onStart).toHaveBeenCalled();
  },
};

export const RequestingCamera: Story = {
  args: {
    status: "requesting-camera",
  },
};

export const ConnectedSynced: Story = {
  args: {
    status: "connected",
  },
};

export const ConnectedWithPendingChanges: Story = {
  args: {
    hasPendingChanges: true,
    status: "connected",
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("button", { name: "Stop" })).toBeEnabled();
    await expect(canvas.getByRole("button", { name: "Apply" })).toBeEnabled();
    await expect(canvas.getByRole("button", { name: "Reset" })).toBeEnabled();

    await userEvent.click(canvas.getByRole("button", { name: "Apply" }));
    await userEvent.click(canvas.getByRole("button", { name: "Stop" }));
    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));

    await expect(args.onApply).toHaveBeenCalled();
    await expect(args.onStop).toHaveBeenCalled();
    await expect(args.onReset).toHaveBeenCalled();
  },
};

export const Applying: Story = {
  args: {
    hasPendingChanges: true,
    isApplying: true,
    status: "generating",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("button", { name: "Applying" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Reset" })).toBeDisabled();
  },
};

export const ErrorState: Story = {
  args: {
    status: "error",
  },
};
