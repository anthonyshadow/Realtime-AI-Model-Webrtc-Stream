import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { RecordingControls } from "../RecordingControls";

const meta = {
  title: "Control Panel/RecordingControls",
  component: RecordingControls,
  tags: ["autodocs"],
  args: {
    canRecord: false,
    durationLabel: "00:00",
    error: null,
    filename: null,
    hasRecordableStream: false,
    isRecording: false,
    isSupported: true,
    objectUrl: null,
    onDeleteRecording: fn(),
    onStartRecording: fn(),
    onStopRecording: fn(),
    sizeLabel: "0 B",
    state: "idle",
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm bg-neutral-950 p-4 text-white">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RecordingControls>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Standby: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Standby")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Record" })).toBeDisabled();
  },
};

export const Ready: Story = {
  args: {
    canRecord: true,
    hasRecordableStream: true,
    state: "ready",
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Ready")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Record" }));

    await expect(args.onStartRecording).toHaveBeenCalled();
  },
};

export const Recording: Story = {
  args: {
    durationLabel: "00:12",
    hasRecordableStream: true,
    isRecording: true,
    state: "recording",
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByText("Recording")[0]).toBeVisible();
    await expect(canvas.getByText("00:12")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Stop recording" }));

    await expect(args.onStopRecording).toHaveBeenCalled();
  },
};

export const RecorderError: Story = {
  args: {
    error: "Recording failed. Try starting a new recording.",
    hasRecordableStream: true,
    isSupported: true,
    state: "error",
  },
};

export const UnsupportedBrowser: Story = {
  args: {
    error: "Recording is not supported in this browser.",
    hasRecordableStream: true,
    isSupported: false,
    state: "error",
  },
};

export const ClipCaptured: Story = {
  args: {
    canRecord: true,
    durationLabel: "01:14",
    filename: "session-local-2026-06-29-16-45.webm",
    hasRecordableStream: true,
    objectUrl: "blob:http://localhost/session-local-preview",
    sizeLabel: "8.4 MB",
    state: "recorded",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByLabelText("Recording playback")).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Download" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Delete" })).toBeVisible();
  },
};
