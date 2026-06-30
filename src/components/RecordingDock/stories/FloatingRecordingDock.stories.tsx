import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ControlPanel, type ControlPanelProps } from "../../ControlPanel/ControlPanel";
import {
  FloatingRecordingDock,
  type FloatingRecordingDockProps,
} from "../FloatingRecordingDock";

const standbyDock = {
  canRecord: false,
  durationLabel: "00:00",
  error: null,
  filename: null,
  hasRecordableStream: false,
  isRecording: false,
  isSessionActive: false,
  isSupported: true,
  objectUrl: null,
  onDeleteRecording: fn(),
  onStartRecording: fn(),
  onStopRecording: fn(),
  sizeLabel: "0 B",
  state: "idle",
} satisfies FloatingRecordingDockProps;

const readyDock = {
  ...standbyDock,
  canRecord: true,
  hasRecordableStream: true,
  isSessionActive: true,
  state: "ready",
} satisfies FloatingRecordingDockProps;

const recordingDock = {
  ...readyDock,
  durationLabel: "00:12",
  isRecording: true,
  state: "recording",
} satisfies FloatingRecordingDockProps;

const recordedDock = {
  ...readyDock,
  durationLabel: "00:17",
  filename: "session-local-2026-06-30-16-45.webm",
  objectUrl: "blob:http://localhost/session-local-preview",
  sizeLabel: "8.4 MB",
  state: "recorded",
} satisfies FloatingRecordingDockProps;

const panelArgs = {
  activeSessionMode: "local",
  canChangeSessionMode: false,
  elapsedLabel: "00:24",
  enhancePrompt: false,
  error: null,
  hasPendingChanges: false,
  imageFile: null,
  imagePreviewUrl: null,
  isApplying: false,
  isVisible: true,
  onApply: fn(),
  onEnhancePromptChange: fn(),
  onImageChange: fn(),
  onImageError: fn(),
  onPromptChange: fn(),
  onReset: fn(),
  onSessionModeChange: fn(),
  onStart: fn(),
  onStop: fn(),
  prompt: "",
  sessionMode: "local",
  status: "connected",
} satisfies ControlPanelProps;

const meta = {
  title: "Recording Dock/FloatingRecordingDock",
  component: FloatingRecordingDock,
  tags: ["autodocs"],
  args: readyDock,
  render: (args) => (
    <div className="min-h-[320px] overflow-hidden bg-neutral-950 text-white">
      <FloatingRecordingDock {...args} />
    </div>
  ),
} satisfies Meta<typeof FloatingRecordingDock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Hidden: Story = {
  args: standbyDock,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByRole("region", { name: "Recording dock" })).not.toBeInTheDocument();
  },
};

export const Ready: Story = {
  args: readyDock,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("region", { name: "Recording dock" })).toBeVisible();
    await expect(canvas.getAllByText("Ready")[0]).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Record" }));

    await expect(args.onStartRecording).toHaveBeenCalled();
  },
};

export const Recording: Story = {
  args: recordingDock,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("REC")).toBeVisible();
    await expect(canvas.getByText("00:12")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Stop recording" }));

    await expect(args.onStopRecording).toHaveBeenCalled();
  },
};

export const Recorded: Story = {
  args: recordedDock,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Clip captured")).toBeVisible();
    await expect(canvas.getByLabelText("Recording playback")).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Download clip" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Delete recording" })).toBeVisible();
  },
};

export const DesktopWithPanel: Story = {
  args: readyDock,
  render: (args) => (
    <div className="min-h-screen overflow-hidden bg-neutral-950 text-white">
      <ControlPanel {...panelArgs} />
      <FloatingRecordingDock {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const panel = canvas.getByRole("complementary", { name: "Live studio controls" });
    const dock = canvas.getByRole("region", { name: "Recording dock" });

    await expect(panel).toBeVisible();
    await expect(dock).toBeVisible();
    await expect(panel).not.toContainElement(dock);
  },
};

export const MobileWidth: Story = {
  args: recordingDock,
  render: (args) => (
    <div className="mx-auto min-h-[760px] w-[390px] max-w-full overflow-hidden bg-neutral-950 text-white">
      <FloatingRecordingDock {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("region", { name: "Recording dock" })).toHaveClass(
      "bottom-[calc(env(safe-area-inset-bottom)+0.75rem)]",
      "w-[min(calc(100vw-1.5rem),34rem)]",
    );
    await expect(canvas.getByRole("button", { name: "Stop recording" })).toBeVisible();
  },
};
