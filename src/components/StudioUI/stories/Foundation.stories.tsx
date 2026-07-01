import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  Card,
  DangerButton,
  FileUploadControl,
  MetricCard,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
  StatusPill,
  Surface,
} from "../index";

function FoundationStory() {
  return (
    <div className="grid gap-4 bg-neutral-950 p-4 text-white md:grid-cols-2">
      <Surface className="space-y-4">
        <SectionHeader
          description="Reusable pieces for the stream-first control surfaces."
          eyebrow="Foundation"
          title="Studio UI"
        />
        <div className="flex flex-wrap gap-2">
          <PrimaryButton>Start camera</PrimaryButton>
          <SecondaryButton>Reset</SecondaryButton>
          <DangerButton>Stop session</DangerButton>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusPill label="Idle" tone="idle" />
          <StatusPill label="Connected" tone="success" />
          <StatusPill label="Recording" tone="recording" value="00:06" />
          <StatusPill label="Error" tone="error" />
        </div>
      </Surface>

      <Surface className="space-y-4">
        <SectionHeader
          actions={<SecondaryButton>Reset</SecondaryButton>}
          description="Cards keep dense status readable inside drawers and sheets."
          eyebrow="Metrics"
          title="Session summary"
        />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <MetricCard label="Mode" value="Local" />
          <MetricCard label="Session" tone="success" value="Live" />
          <MetricCard isNumeric label="Time" tone="active" value="00:06" />
        </div>
        <Card>
          <p className="text-xs leading-5 text-neutral-300">
            Surfaces use the existing glassy dark treatment without changing app runtime
            behavior.
          </p>
        </Card>
      </Surface>
    </div>
  );
}

function FileUploadStory() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="max-w-sm bg-neutral-950 p-4 text-white">
      <FileUploadControl
        accept="image/jpeg,image/png,image/webp,image/avif"
        actionText="Use reference image"
        altText="Reference image preview"
        emptyLabel="No image"
        file={file}
        formatLabel="JPEG, PNG, WebP, or AVIF"
        helperText="Use a clear source image with the subject visible."
        label="Reference image"
        previewUrl={file ? "data:image/gif;base64,R0lGODlhAQABAAAAACw=" : null}
        validateFile={(nextFile) =>
          nextFile.type.startsWith("image/") ? null : "Choose an image file."
        }
        onChange={setFile}
      />
    </div>
  );
}

const meta = {
  title: "Studio UI/Foundation",
  component: FoundationStory,
  tags: ["autodocs"],
} satisfies Meta<typeof FoundationStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primitives: Story = {
  render: () => <FoundationStory />,
};

export const ResponsiveUpload: Story = {
  render: () => <FileUploadStory />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const file = new File(["storybook image placeholder"], "reference-image.png", {
      type: "image/png",
    });

    await userEvent.upload(canvas.getByLabelText("Reference image"), file);

    await expect(canvas.getByText("reference-image.png")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Clear" }));
    await expect(canvas.getByText("No image")).toBeVisible();
  },
};
