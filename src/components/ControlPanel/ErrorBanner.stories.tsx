import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { ErrorBanner } from "./ErrorBanner";

const meta = {
  title: "Control Panel/ErrorBanner",
  component: ErrorBanner,
  tags: ["autodocs"],
  args: {
    error: "Camera permission was denied. Allow camera access and try again.",
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm bg-neutral-950 p-4 text-white">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ErrorBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PermissionDenied: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText("Camera permission was denied. Allow camera access and try again."),
    ).toBeVisible();
  },
};

export const ApiFailure: Story = {
  args: {
    error: "Could not create realtime session token. Check DECART_API_KEY on the local server.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText("Could not create realtime session token. Check DECART_API_KEY on the local server."),
    ).toBeVisible();
  },
};

export const HiddenWhenClear: Story = {
  args: {
    error: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByText(/Camera permission was denied/i)).not.toBeInTheDocument();
  },
};
