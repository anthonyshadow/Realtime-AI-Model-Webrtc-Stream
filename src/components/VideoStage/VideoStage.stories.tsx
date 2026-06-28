import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { createStorybookMediaStream } from "../../test/mocks/storybookBrowserMocks";
import { VideoStage } from "./VideoStage";

type VideoStageStoryArgs = ComponentProps<typeof VideoStage> & {
  streamPreset: "none" | "mock";
};

const meta = {
  title: "Video Stage/VideoStage",
  component: VideoStage,
  tags: ["autodocs"],
  args: {
    modelLabel: "Lucy 2.1",
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
              label: `${args.modelLabel} mock output`,
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

export const EmptyLucyStage: Story = {};

export const EmptyVtonStage: Story = {
  args: {
    modelLabel: "Lucy VTON 3",
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
    modelLabel: "Lucy VTON 3",
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
