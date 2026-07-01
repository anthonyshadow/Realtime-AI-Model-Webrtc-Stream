import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { UNSUPPORTED_IMAGE_MESSAGE } from "../../../lib/imageValidation";
import { ImageUpload } from "../ImageUpload";

function renderImageUpload(overrides: Partial<Parameters<typeof ImageUpload>[0]> = {}) {
  const props = {
    actionText: "Use portrait",
    altText: "Reference portrait preview",
    emptyLabel: "No portrait",
    file: null,
    helperText: "Best as a clear portrait.",
    label: "Reference portrait",
    previewUrl: null,
    onChange: vi.fn(),
    onError: vi.fn(),
    ...overrides,
  };

  const rendered = render(<ImageUpload {...props} />);

  return { ...props, ...rendered };
}

describe("ImageUpload", () => {
  it("accepts supported image uploads", async () => {
    const user = userEvent.setup();
    const props = renderImageUpload();
    const file = new File(["portrait"], "portrait.avif", { type: "image/avif" });

    await user.upload(screen.getByLabelText("Reference portrait"), file);

    expect(props.onError).toHaveBeenCalledWith(null);
    expect(props.onChange).toHaveBeenCalledWith(file);
  });

  it("rejects unsupported image uploads", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const props = renderImageUpload();
    const file = new File(["animated"], "portrait.gif", { type: "image/gif" });

    await user.upload(screen.getByLabelText("Reference portrait"), file);

    expect(props.onChange).toHaveBeenCalledWith(null);
    expect(props.onError).toHaveBeenCalledWith(UNSUPPORTED_IMAGE_MESSAGE);
  });

  it("shows selected file state and clears it", async () => {
    const user = userEvent.setup();
    const file = new File(["portrait"], "portrait.webp", { type: "image/webp" });
    const props = renderImageUpload({
      file,
      previewUrl: "blob:http://localhost/portrait",
    });

    expect(screen.getByAltText("Reference portrait preview")).toBeInTheDocument();
    expect(screen.getByText("portrait.webp")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(props.onError).toHaveBeenCalledWith(null);
    expect(props.onChange).toHaveBeenCalledWith(null);
  });

  it("keeps long filenames in a truncated summary with a clear action", () => {
    const file = new File(["portrait"], "very-long-reference-portrait-export-name.webp", {
      type: "image/webp",
    });

    renderImageUpload({
      file,
      previewUrl: "blob:http://localhost/portrait",
    });

    expect(screen.getByText(file.name)).toHaveClass("truncate");
    expect(screen.getByText(file.name)).toHaveAttribute("title", file.name);
    expect(screen.getByRole("button", { name: "Clear" })).toBeEnabled();
  });

  it("clears the file input when parent state clears the file", async () => {
    const user = userEvent.setup();
    const file = new File(["portrait"], "portrait.webp", { type: "image/webp" });
    const props = renderImageUpload();
    const input = screen.getByLabelText("Reference portrait");

    await user.upload(input, file);

    expect(input).not.toHaveValue("");

    props.rerender(
      <ImageUpload
        actionText="Use portrait"
        altText="Reference portrait preview"
        emptyLabel="No portrait"
        file={file}
        helperText="Best as a clear portrait."
        label="Reference portrait"
        previewUrl="blob:http://localhost/portrait"
        onChange={props.onChange}
        onError={props.onError}
      />,
    );
    props.rerender(
      <ImageUpload
        actionText="Use portrait"
        altText="Reference portrait preview"
        emptyLabel="No portrait"
        file={null}
        helperText="Best as a clear portrait."
        label="Reference portrait"
        previewUrl={null}
        onChange={props.onChange}
        onError={props.onError}
      />,
    );

    expect(input).toHaveValue("");
  });
});
