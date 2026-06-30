import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { getModelConfig } from "../../../constants/models";
import { getSessionModeConfig } from "../../../constants/sessionModes";
import {
  createMockImageFile,
  garmentPreviewUrl,
  portraitPreviewUrl,
} from "../../../test/mocks/storybookFixtures";
import { ControlPanel, type ControlPanelProps } from "../ControlPanel";

const lucyConfig = getModelConfig("lucy-2.1");
const vtonConfig = getModelConfig("lucy-vton-3");
const localConfig = getSessionModeConfig("local");

const standbyRecording = {
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
} satisfies ControlPanelProps["recording"];

const readyRecording = {
  ...standbyRecording,
  canRecord: true,
  hasRecordableStream: true,
  state: "ready",
} satisfies ControlPanelProps["recording"];

const activeRecording = {
  ...standbyRecording,
  durationLabel: "00:12",
  hasRecordableStream: true,
  isRecording: true,
  state: "recording",
} satisfies ControlPanelProps["recording"];

const capturedLocalRecording = {
  ...standbyRecording,
  canRecord: true,
  durationLabel: "00:17",
  filename: "session-local-2026-06-29-16-45.webm",
  hasRecordableStream: true,
  objectUrl: "blob:http://localhost/session-local-preview",
  sizeLabel: "8.4 MB",
  state: "recorded",
} satisfies ControlPanelProps["recording"];

const baseArgs = {
  activeSessionMode: null,
  canChangeSessionMode: true,
  enhancePrompt: false,
  error: null,
  elapsedLabel: "00:00",
  hasPendingChanges: false,
  imageFile: null,
  imagePreviewUrl: null,
  isApplying: false,
  isVisible: true,
  recording: standbyRecording,
  sessionMode: "local",
  prompt: "",
  status: "idle",
  onApply: fn(),
  onEnhancePromptChange: fn(),
  onImageChange: fn(),
  onImageError: fn(),
  onSessionModeChange: fn(),
  onPromptChange: fn(),
  onReset: fn(),
  onStart: fn(),
  onStop: fn(),
} satisfies ControlPanelProps;

function renderFramedControlPanel(args: ControlPanelProps, className: string) {
  return (
    <div className={`mx-auto overflow-hidden bg-neutral-950 [transform:translateZ(0)] ${className}`}>
      <ControlPanel {...args} />
    </div>
  );
}

const meta = {
  title: "Control Panel/ControlPanel",
  component: ControlPanel,
  tags: ["autodocs"],
  args: baseArgs,
  render: (args) => (
    <div className="min-h-screen bg-neutral-950">
      <ControlPanel {...args} />
    </div>
  ),
} satisfies Meta<typeof ControlPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const IdleLocal: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByText(localConfig.label)[0]).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Start local camera" })).toBeEnabled();
    await expect(canvas.queryByText("Options")).not.toBeInTheDocument();
  },
};

export const IdleLucy: Story = {
  args: {
    enhancePrompt: lucyConfig.enhanceDefault,
    sessionMode: "lucy-2.1",
    prompt: lucyConfig.defaultPrompt,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const options = canvas.getByText("Options");
    const disclosure = options.closest("details");

    await expect(canvas.getByRole("button", { name: "Start Lucy session" })).toBeEnabled();
    await expect(disclosure).not.toHaveAttribute("open");

    await userEvent.click(options);

    await expect(disclosure).toHaveAttribute("open");
    await expect(canvas.getByRole("checkbox", { name: /Enhance prompt/i })).toBeVisible();

    await userEvent.click(options);

    await expect(disclosure).not.toHaveAttribute("open");
  },
};

export const LocalLiveSession: Story = {
  args: {
    activeSessionMode: "local",
    canChangeSessionMode: false,
    elapsedLabel: "00:24",
    recording: readyRecording,
    status: "connected",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Live")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Record" })).toBeEnabled();
    await expect(canvas.getByRole("button", { name: "Stop session" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: /Lucy 2.1/i })).toBeDisabled();
  },
};

export const ModelLiveSession: Story = {
  args: {
    activeSessionMode: "lucy-2.1",
    canChangeSessionMode: false,
    elapsedLabel: "00:47",
    enhancePrompt: lucyConfig.enhanceDefault,
    prompt: "Make the person look like a clean realtime studio avatar.",
    recording: readyRecording,
    sessionMode: "lucy-2.1",
    status: "generating",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Generating")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Record" })).toBeEnabled();
    await expect(canvas.getByRole("button", { name: "Apply" })).toBeEnabled();
  },
};

export const LucyWithReferencePortrait: Story = {
  args: {
    enhancePrompt: lucyConfig.enhanceDefault,
    imageFile: createMockImageFile("reference-portrait.webp", "image/webp"),
    imagePreviewUrl: portraitPreviewUrl,
    prompt: "Change the person into a clean studio portrait with soft film lighting.",
    sessionMode: "lucy-2.1",
  },
};

export const Connecting: Story = {
  args: {
    activeSessionMode: "lucy-2.1",
    canChangeSessionMode: false,
    enhancePrompt: lucyConfig.enhanceDefault,
    elapsedLabel: "00:04",
    sessionMode: "lucy-2.1",
    status: "requesting-token",
  },
};

export const ActiveVtonWithPendingChanges: Story = {
  args: {
    activeSessionMode: "lucy-vton-3",
    canChangeSessionMode: false,
    enhancePrompt: vtonConfig.enhanceDefault,
    elapsedLabel: "01:18",
    hasPendingChanges: true,
    imageFile: createMockImageFile("cobalt-rain-jacket.png", "image/png"),
    imagePreviewUrl: garmentPreviewUrl,
    recording: readyRecording,
    sessionMode: "lucy-vton-3",
    prompt: "Substitute the current top with a cobalt rain jacket with matte waterproof fabric.",
    status: "generating",
  },
};

export const ActiveLucyWaitingForOutput: Story = {
  args: {
    activeSessionMode: "lucy-2.1",
    canChangeSessionMode: false,
    enhancePrompt: lucyConfig.enhanceDefault,
    elapsedLabel: "00:19",
    recording: {
      ...standbyRecording,
      standbyMessage: "Waiting for model output before recording.",
    },
    sessionMode: "lucy-2.1",
    prompt: "Make the scene cinematic with soft studio lighting.",
    status: "connected",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Waiting for model output before recording.")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Record" })).toBeDisabled();
  },
};

export const ActiveLocalRecording: Story = {
  args: {
    activeSessionMode: "local",
    canChangeSessionMode: false,
    elapsedLabel: "00:32",
    recording: activeRecording,
    status: "connected",
  },
};

export const LocalClipCaptured: Story = {
  args: {
    activeSessionMode: "local",
    canChangeSessionMode: false,
    elapsedLabel: "01:02",
    recording: capturedLocalRecording,
    status: "connected",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByLabelText("Recording playback")).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Download clip" })).toBeVisible();
  },
};

export const RecordingUnsupported: Story = {
  args: {
    activeSessionMode: "local",
    canChangeSessionMode: false,
    elapsedLabel: "00:09",
    recording: {
      ...standbyRecording,
      error: "Recording is not supported in this browser.",
      hasRecordableStream: true,
      isSupported: false,
      state: "error",
    },
    status: "connected",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Unavailable")).toBeVisible();
    await expect(canvas.getByText("Recording is not supported in this browser.")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Record" })).toBeDisabled();
  },
};

export const ApplyingChanges: Story = {
  args: {
    activeSessionMode: "lucy-vton-3",
    canChangeSessionMode: false,
    enhancePrompt: false,
    elapsedLabel: "02:03",
    hasPendingChanges: true,
    imageFile: createMockImageFile("matte-shell.webp", "image/webp"),
    imagePreviewUrl: garmentPreviewUrl,
    isApplying: true,
    sessionMode: "lucy-vton-3",
    prompt: "Substitute the current top with a matte black shell jacket.",
    status: "connected",
  },
};

export const PermissionDeniedError: Story = {
  args: {
    error: "Camera permission was denied. Allow camera access and try again.",
    status: "error",
  },
};

export const ApiFailureError: Story = {
  args: {
    error: "Could not create realtime session token. Check DECART_API_KEY on the local server.",
    status: "error",
  },
};

export const PermissionDeniedNoStream: Story = {
  args: {
    error: "Camera permission was denied. Allow camera access and try again.",
    recording: {
      ...standbyRecording,
      standbyMessage: "No camera stream is available for recording.",
    },
    status: "error",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("No camera stream is available for recording.")).toBeVisible();
    await expect(
      canvas.getByText("Camera permission was denied. Allow camera access and try again."),
    ).toBeVisible();
  },
};

export const NarrowLaptopLayout: Story = {
  args: {
    activeSessionMode: "lucy-vton-3",
    canChangeSessionMode: false,
    elapsedLabel: "03:18",
    enhancePrompt: vtonConfig.enhanceDefault,
    hasPendingChanges: true,
    imageFile: createMockImageFile("compact-shell.png", "image/png"),
    imagePreviewUrl: garmentPreviewUrl,
    prompt: "Substitute the current top with a compact black technical shell.",
    recording: readyRecording,
    sessionMode: "lucy-vton-3",
    status: "generating",
  },
  render: (args) => renderFramedControlPanel(args, "h-[720px] w-[820px]"),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("button", { name: "Record" })).toBeEnabled();
    await expect(canvas.getByRole("button", { name: "Stop session" })).toBeVisible();
    await expect(canvas.getByLabelText("Garment image")).toBeVisible();
  },
};

export const CompactMobileLayout: Story = {
  args: {
    activeSessionMode: "local",
    canChangeSessionMode: false,
    elapsedLabel: "01:02",
    recording: capturedLocalRecording,
    status: "connected",
  },
  render: (args) => renderFramedControlPanel(args, "h-[760px] w-[390px] max-w-full"),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("link", { name: "Download clip" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Delete recording" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Stop session" })).toBeVisible();
  },
};

export const HiddenWhileStreaming: Story = {
  args: {
    activeSessionMode: "lucy-2.1",
    canChangeSessionMode: false,
    elapsedLabel: "00:42",
    sessionMode: "lucy-2.1",
    isVisible: false,
    status: "connected",
  },
};
