import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RecordingControls, type RecordingControlsProps } from "../RecordingControls";

function renderRecordingControls(overrides: Partial<RecordingControlsProps> = {}) {
  const props = {
    canRecord: false,
    durationLabel: "00:00",
    error: null,
    filename: null,
    hasRecordableStream: false,
    isRecording: false,
    isSupported: true,
    objectUrl: null,
    onDeleteRecording: vi.fn(),
    onStartRecording: vi.fn(),
    onStopRecording: vi.fn(),
    sizeLabel: "0 B",
    state: "idle" as const,
    ...overrides,
  };

  render(<RecordingControls {...props} />);

  return props;
}

describe("RecordingControls", () => {
  it("disables recording before a recordable stream exists", () => {
    renderRecordingControls();

    expect(screen.getByText("Standby")).toBeInTheDocument();
    expect(screen.getByText("Start a session and wait for the stream to be ready.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Record" })).toBeDisabled();
  });

  it("starts recording when a stream is ready", async () => {
    const user = userEvent.setup();
    const props = renderRecordingControls({
      canRecord: true,
      hasRecordableStream: true,
      state: "ready",
    });

    await user.click(screen.getByRole("button", { name: "Record" }));

    expect(props.onStartRecording).toHaveBeenCalledTimes(1);
  });

  it("shows a strong recording state with a timer", () => {
    renderRecordingControls({
      durationLabel: "00:07",
      hasRecordableStream: true,
      isRecording: true,
      state: "recording",
    });

    expect(screen.getAllByText("Recording").length).toBeGreaterThan(0);
    expect(screen.getByText("Capturing the current session output.")).toBeInTheDocument();
    expect(screen.getByText("00:07")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Stop recording" })).toBeEnabled();
  });

  it("stops the recorder without calling the start action", async () => {
    const user = userEvent.setup();
    const props = renderRecordingControls({
      durationLabel: "00:07",
      hasRecordableStream: true,
      isRecording: true,
      state: "recording",
    });

    await user.click(screen.getByRole("button", { name: "Stop recording" }));

    expect(props.onStopRecording).toHaveBeenCalledTimes(1);
    expect(props.onStartRecording).not.toHaveBeenCalled();
  });

  it("renders unsupported browser errors", () => {
    renderRecordingControls({
      error: "Recording is not supported in this browser.",
      hasRecordableStream: true,
      isSupported: false,
      state: "error",
    });

    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    expect(screen.getByText("Recording is not supported in this browser.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Record" })).toBeDisabled();
  });

  it("renders recorder failure errors", () => {
    renderRecordingControls({
      error: "Recording failed. Try starting a new recording.",
      hasRecordableStream: true,
      isSupported: true,
      state: "error",
    });

    expect(screen.getByText("Recorder error")).toBeInTheDocument();
    expect(screen.getByText("Recording failed. Try starting a new recording.")).toBeInTheDocument();
  });

  it("renders playback, download, and delete actions after recording", async () => {
    const user = userEvent.setup();
    const props = renderRecordingControls({
      canRecord: true,
      durationLabel: "01:14",
      filename: "session-local-2026-06-29-16-45.webm",
      hasRecordableStream: true,
      objectUrl: "blob:http://localhost/clip",
      sizeLabel: "8.4 MB",
      state: "recorded",
    });

    const video = screen.getByLabelText("Recording playback");
    const download = screen.getByRole("link", { name: "Download" });

    expect(video).toHaveAttribute("src", "blob:http://localhost/clip");
    expect(screen.getByText("session-local-2026-06-29-16-45.webm")).toBeInTheDocument();
    expect(screen.getAllByText("01:14").length).toBeGreaterThan(0);
    expect(screen.getByText("8.4 MB")).toBeInTheDocument();
    expect(download).toHaveAttribute("href", "blob:http://localhost/clip");
    expect(download).toHaveAttribute("download", "session-local-2026-06-29-16-45.webm");

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(props.onDeleteRecording).toHaveBeenCalledTimes(1);
  });

  it("disables download when the recorded clip is incomplete", () => {
    renderRecordingControls({
      canRecord: true,
      durationLabel: "00:00",
      filename: null,
      hasRecordableStream: true,
      objectUrl: null,
      state: "recorded",
    });

    expect(screen.getByText("Recording preview unavailable")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download" })).toBeDisabled();
  });
});
