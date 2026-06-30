import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { RecordingPlaybackPanel } from "../RecordingPlaybackPanel";

const meta = {
  title: "Control Panel/RecordingPlaybackPanel",
  component: RecordingPlaybackPanel,
  tags: ["autodocs"],
  args: {
    durationLabel: "00:17",
    filename: "session-local-2026-06-29-16-45.webm",
    objectUrl: "blob:http://localhost/session-local-preview",
    onDeleteRecording: fn(),
    sizeLabel: "8.4 MB",
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm bg-neutral-950 p-4 text-white">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RecordingPlaybackPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CapturedClip: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByLabelText("Recording playback")).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Download clip" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Delete recording" })).toBeVisible();
  },
};

export const MissingUrl: Story = {
  args: {
    filename: null,
    objectUrl: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Recording preview unavailable")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Download clip" })).toBeDisabled();
  },
};
