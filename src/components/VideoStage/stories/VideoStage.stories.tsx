import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { createStorybookMediaStream } from "../../../test/mocks/storybookBrowserMocks";
import { VideoStage } from "../VideoStage";

type VideoStageStoryArgs = ComponentProps<typeof VideoStage> & {
  streamPreset: "none" | "mock";
};

const meta = {
  title: "Video Stage/VideoStage",
  component: VideoStage,
  tags: ["autodocs"],
  args: {
    placeholderDescription:
      "Your live camera preview appears here after the browser grants camera and microphone access.",
    placeholderEyebrow: "Local camera",
    remoteStream: null,
    status: "idle",
    streamPreset: "none",
  },
  render: ({ streamPreset, ...args }) => (
    <VideoStage
      {...args}
      remoteStream={
        streamPreset === "mock"
          ? createStorybookMediaStream({
              accent: "#34d399",
              label: `${args.placeholderEyebrow} mock output`,
            })
          : null
      }
    />
  ),
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<VideoStageStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EmptyLocalStage: Story = {};

export const EmptyLucyStage: Story = {
  args: {
    placeholderDescription:
      "Your live preview appears here first, then Decart replaces it with the transformed stream.",
    placeholderEyebrow: "Lucy 2.1 realtime",
  },
};

export const EmptyVtonStage: Story = {
  args: {
    placeholderDescription:
      "Your live preview appears here first, then Decart replaces it with the transformed stream.",
    placeholderEyebrow: "Lucy VTON 3 realtime",
  },
};

export const ConnectedStream: Story = {
  args: {
    status: "connected",
    streamPreset: "mock",
  },
};

export const GeneratingStream: Story = {
  args: {
    placeholderDescription:
      "Your live preview appears here first, then Decart replaces it with the transformed stream.",
    placeholderEyebrow: "Lucy VTON 3 realtime",
    status: "generating",
    streamPreset: "mock",
  },
};

export const ReconnectingStream: Story = {
  args: {
    status: "reconnecting",
    streamPreset: "mock",
  },
};

export const ErrorWithoutStream: Story = {
  args: {
    status: "error",
  },
};
