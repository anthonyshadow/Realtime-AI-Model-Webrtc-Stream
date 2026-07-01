import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ErrorBanner } from "../ErrorBanner";

const meta = {
  title: "Control Panel/ErrorBanner",
  component: ErrorBanner,
  tags: ["autodocs"],
  args: {
    message: "Camera access was blocked. Allow camera access in your browser settings, then try again.",
    title: "Camera blocked",
    actions: [
      {
        label: "Try again",
        onClick: fn(),
        variant: "primary",
      },
      {
        label: "Reset session",
        onClick: fn(),
      },
    ],
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
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText("Camera access was blocked. Allow camera access in your browser settings, then try again."),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Try again" }));

    await expect(args.actions?.[0]?.onClick).toHaveBeenCalled();
  },
};

export const ApiFailure: Story = {
  args: {
    message: "Could not create a model session. Check your Decart API key on the local server.",
    title: "Model session blocked",
    actions: [
      {
        label: "Try again",
        onClick: fn(),
        variant: "primary",
      },
      {
        label: "Back to local camera",
        onClick: fn(),
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText("Could not create a model session. Check your Decart API key on the local server."),
    ).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Back to local camera" })).toBeVisible();
  },
};

export const UploadValidation: Story = {
  args: {
    message: "This file could not be used. Choose a supported image file.",
    title: "File not supported",
    actions: [
      {
        label: "Remove file",
        onClick: fn(),
        variant: "primary",
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("File not supported")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Remove file" })).toBeVisible();
  },
};
