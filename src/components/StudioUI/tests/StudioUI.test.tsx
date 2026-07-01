import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
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

describe("StudioUI primitives", () => {
  it("renders action buttons with consistent click behavior", async () => {
    const user = userEvent.setup();
    const onPrimaryClick = vi.fn();

    render(
      <div>
        <PrimaryButton onClick={onPrimaryClick}>Start camera</PrimaryButton>
        <SecondaryButton disabled>Reset</SecondaryButton>
        <DangerButton>Stop session</DangerButton>
      </div>,
    );

    await user.click(screen.getByRole("button", { name: "Start camera" }));

    expect(onPrimaryClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Reset" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Stop session" })).toBeEnabled();
  });

  it("renders status, metric, section, and surface primitives", () => {
    render(
      <Surface aria-label="Studio panel">
        <SectionHeader
          actions={<SecondaryButton>Reset</SecondaryButton>}
          description="Pick how you want to use the camera."
          eyebrow="Setup"
          title="Choose a session"
        />
        <StatusPill label="Connected" role="status" tone="success" value="Live" />
        <MetricCard isNumeric label="Time" value="00:06" />
        <Card>Nested detail</Card>
      </Surface>,
    );

    expect(screen.getByLabelText("Studio panel")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Choose a session" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Connected");
    expect(screen.getByText("00:06")).toBeInTheDocument();
    expect(screen.getByText("Nested detail")).toBeInTheDocument();
  });

  it("handles supported file uploads and clear actions", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onError = vi.fn();
    const file = new File(["portrait"], "portrait.png", { type: "image/png" });

    const view = render(
      <FileUploadControl
        accept="image/png"
        actionText="Use portrait"
        altText="Portrait preview"
        emptyLabel="No portrait"
        file={null}
        formatLabel="PNG"
        helperText="Use a clear portrait."
        label="Reference portrait"
        previewUrl={null}
        validateFile={() => null}
        onChange={onChange}
        onError={onError}
      />,
    );

    await user.upload(screen.getByLabelText("Reference portrait"), file);

    expect(onError).toHaveBeenCalledWith(null);
    expect(onChange).toHaveBeenCalledWith(file);

    view.rerender(
      <FileUploadControl
        accept="image/png"
        actionText="Use portrait"
        altText="Portrait preview"
        emptyLabel="No portrait"
        file={file}
        formatLabel="PNG"
        helperText="Use a clear portrait."
        label="Reference portrait"
        previewUrl="blob:http://localhost/portrait"
        validateFile={() => null}
        onChange={onChange}
        onError={onError}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("rejects invalid files with the provided validator", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const onChange = vi.fn();
    const onError = vi.fn();
    const file = new File(["not an image"], "notes.txt", { type: "text/plain" });

    render(
      <FileUploadControl
        accept="image/png"
        actionText="Use portrait"
        altText="Portrait preview"
        emptyLabel="No portrait"
        file={null}
        formatLabel="PNG"
        helperText="Use a clear portrait."
        label="Reference portrait"
        previewUrl={null}
        validateFile={() => "Unsupported file type."}
        onChange={onChange}
        onError={onError}
      />,
    );

    await user.upload(screen.getByLabelText("Reference portrait"), file);

    expect(onChange).toHaveBeenCalledWith(null);
    expect(onError).toHaveBeenCalledWith("Unsupported file type.");
  });
});
