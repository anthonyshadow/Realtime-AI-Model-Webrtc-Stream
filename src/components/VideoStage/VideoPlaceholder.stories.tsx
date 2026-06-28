import type { Meta, StoryObj } from "@storybook/react-vite";
import { VideoPlaceholder } from "./VideoPlaceholder";

const meta = {
  title: "Video Stage/VideoPlaceholder",
  component: VideoPlaceholder,
  tags: ["autodocs"],
  args: {
    modelLabel: "Lucy 2.1",
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

export const Lucy: Story = {};

export const Vton: Story = {
  args: {
    modelLabel: "Lucy VTON 3",
  },
};
