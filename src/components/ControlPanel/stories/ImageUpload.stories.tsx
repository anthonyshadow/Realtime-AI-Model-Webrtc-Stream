import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { getModelConfig } from "../../../constants/models";
import {
  createMockImageFile,
  garmentPreviewUrl,
  portraitPreviewUrl,
} from "../../../test/mocks/storybookFixtures";
import { ImageUpload } from "../ImageUpload";

const lucyConfig = getModelConfig("lucy-2.1");
const vtonConfig = getModelConfig("lucy-vton-3");

const meta = {
  title: "Control Panel/ImageUpload",
  component: ImageUpload,
  tags: ["autodocs"],
  args: {
    actionText: lucyConfig.imageActionText,
    altText: lucyConfig.imageAltText,
    emptyLabel: lucyConfig.imageEmptyLabel,
    file: null,
    helperText: lucyConfig.imageHelperText,
    label: lucyConfig.imageLabel,
    onChange: fn(),
    onError: fn(),
    previewUrl: null,
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm bg-neutral-950 p-4 text-white">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ImageUpload>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EmptyReferencePortrait: Story = {};

export const UploadsReferencePortrait: Story = {
  render: (args) => {
    const [file, setFile] = useState<File | null>(null);

    return (
      <ImageUpload
        {...args}
        file={file}
        previewUrl={file ? portraitPreviewUrl : null}
        onChange={(nextFile) => {
          args.onChange(nextFile);
          setFile(nextFile);
        }}
      />
    );
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const file = new File(["storybook image placeholder"], "storybook-portrait.png", {
      type: "image/png",
    });

    await userEvent.upload(canvas.getByLabelText("Reference portrait"), file);

    await expect(canvas.getByAltText("Reference portrait preview")).toBeVisible();
    await expect(canvas.getByText("storybook-portrait.png")).toBeVisible();
    await expect(args.onChange).toHaveBeenCalledWith(file);

    await userEvent.click(canvas.getByRole("button", { name: "Clear" }));

    await expect(canvas.getByText("No portrait")).toBeVisible();
    await expect(args.onChange).toHaveBeenLastCalledWith(null);
  },
};

export const SelectedReferencePortrait: Story = {
  args: {
    file: createMockImageFile("reference-portrait.webp", "image/webp"),
    previewUrl: portraitPreviewUrl,
  },
};

export const EmptyGarmentImage: Story = {
  args: {
    actionText: vtonConfig.imageActionText,
    altText: vtonConfig.imageAltText,
    emptyLabel: vtonConfig.imageEmptyLabel,
    helperText: vtonConfig.imageHelperText,
    label: vtonConfig.imageLabel,
  },
};

export const SelectedGarmentImage: Story = {
  args: {
    actionText: vtonConfig.imageActionText,
    altText: vtonConfig.imageAltText,
    emptyLabel: vtonConfig.imageEmptyLabel,
    file: createMockImageFile("cobalt-rain-jacket.png", "image/png"),
    helperText: vtonConfig.imageHelperText,
    label: vtonConfig.imageLabel,
    previewUrl: garmentPreviewUrl,
  },
};

export const LongFilenameGarmentImage: Story = {
  args: {
    actionText: vtonConfig.imageActionText,
    altText: vtonConfig.imageAltText,
    emptyLabel: vtonConfig.imageEmptyLabel,
    file: createMockImageFile(
      "cobalt-rain-jacket-with-extra-long-retail-export-file-name.png",
      "image/png",
    ),
    helperText: vtonConfig.imageHelperText,
    label: vtonConfig.imageLabel,
    previewUrl: garmentPreviewUrl,
  },
  decorators: [
    (Story) => (
      <div className="w-[320px] max-w-full bg-neutral-950 p-3 text-white">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByLabelText("Garment image")).toBeVisible();
    await expect(canvas.getByTestId("file-upload-summary")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Clear" })).toBeEnabled();
  },
};
