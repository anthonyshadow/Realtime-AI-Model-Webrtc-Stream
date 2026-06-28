import type { Meta, StoryObj } from "@storybook/react-vite";
import { VideoPlaceholder } from "../VideoPlaceholder";

const meta = {
  title: "Video Stage/VideoPlaceholder",
  component: VideoPlaceholder,
  tags: ["autodocs"],
  args: {
    description:
      "Your live camera preview appears here after the browser grants camera and microphone access.",
    eyebrow: "Local camera",
  },
  decorators: [
    (Story) => (
      <div className="relative h-screen bg-neutral-950">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof VideoPlaceholder>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Local: Story = {};

export const Lucy: Story = {
  args: {
    description:
      "Your live preview appears here first, then Decart replaces it with the transformed stream.",
    eyebrow: "Lucy 2.1 realtime",
  },
};

export const Vton: Story = {
  args: {
    description:
      "Your live preview appears here first, then Decart replaces it with the transformed stream.",
    eyebrow: "Lucy VTON 3 realtime",
  },
};
