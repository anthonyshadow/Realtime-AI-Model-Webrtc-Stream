import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  RecordingPlaybackPanel,
  type RecordingPlaybackPanelProps,
} from "../RecordingPlaybackPanel";

function renderRecordingPlaybackPanel(
  overrides: Partial<RecordingPlaybackPanelProps> = {},
) {
  const props = {
    durationLabel: "00:07",
    filename: "session-local-2026-06-29-16-45.webm",
    objectUrl: "blob:http://localhost/clip",
    onDeleteRecording: vi.fn(),
    sizeLabel: "8.4 MB",
    ...overrides,
  };

  render(<RecordingPlaybackPanel {...props} />);

  return props;
}

describe("RecordingPlaybackPanel", () => {
  it("shows playback video and metadata for a recorded clip", () => {
    renderRecordingPlaybackPanel();

    expect(screen.getByLabelText("Recording playback")).toHaveAttribute(
      "src",
      "blob:http://localhost/clip",
    );
    expect(screen.getByText("session-local-2026-06-29-16-45.webm")).toBeInTheDocument();
    expect(screen.getByText("00:07")).toBeInTheDocument();
    expect(screen.getByText("8.4 MB")).toBeInTheDocument();
  });

  it("downloads with the generated filename", () => {
    renderRecordingPlaybackPanel();

    const download = screen.getByRole("link", { name: "Download" });

    expect(download).toHaveAttribute("href", "blob:http://localhost/clip");
    expect(download).toHaveAttribute("download", "session-local-2026-06-29-16-45.webm");
  });

  it("deletes the recorded clip without owning the live session", async () => {
    const user = userEvent.setup();
    const props = renderRecordingPlaybackPanel();

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(props.onDeleteRecording).toHaveBeenCalledTimes(1);
  });

  it("disables download when the recording URL is unavailable", () => {
    renderRecordingPlaybackPanel({
      filename: null,
      objectUrl: null,
    });

    expect(screen.getByText("Recording preview unavailable")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download" })).toBeDisabled();
  });
});
