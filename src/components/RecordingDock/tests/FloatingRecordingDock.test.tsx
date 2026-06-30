import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  FloatingRecordingDock,
  type FloatingRecordingDockProps,
} from "../FloatingRecordingDock";

function renderFloatingRecordingDock(
  overrides: Partial<FloatingRecordingDockProps> = {},
) {
  const props = {
    canRecord: true,
    durationLabel: "00:00",
    error: null,
    filename: null,
    hasRecordableStream: true,
    isRecording: false,
    isSessionActive: true,
    isSupported: true,
    objectUrl: null,
    onDiscardRecording: vi.fn(),
    onStartRecording: vi.fn(),
    onStopRecording: vi.fn(),
    sizeLabel: "0 B",
    state: "ready" as const,
    ...overrides,
  };

  render(<FloatingRecordingDock {...props} />);

  return props;
}

function advanceTimersByTime(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

function dispatchWindowEvent(event: Event) {
  act(() => {
    window.dispatchEvent(event);
  });
}

describe("FloatingRecordingDock", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("is hidden when the camera or session is off", () => {
    renderFloatingRecordingDock({
      canRecord: false,
      hasRecordableStream: false,
      isSessionActive: false,
      state: "idle",
    });

    expect(screen.queryByRole("region", { name: "Recording dock" })).not.toBeInTheDocument();
  });

  it("is visible when the session is active and overlay is active", () => {
    renderFloatingRecordingDock();

    const dock = screen.getByRole("region", { name: "Recording dock" });

    expect(dock).toHaveClass("opacity-100");
    expect(screen.getAllByText("Ready").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Record" })).toBeEnabled();
  });

  it("hides after inactivity and returns on mouse movement", () => {
    renderFloatingRecordingDock();
    const dock = screen.getByRole("region", { name: "Recording dock" });

    advanceTimersByTime(3000);

    expect(dock).toHaveClass("opacity-0");

    dispatchWindowEvent(new MouseEvent("mousemove"));

    expect(dock).toHaveClass("opacity-100");
  });

  it("hides while recording and returns on keyboard activity", () => {
    renderFloatingRecordingDock({
      durationLabel: "00:12",
      isRecording: true,
      state: "recording",
    });
    const dock = screen.getByRole("region", { name: "Recording dock" });

    advanceTimersByTime(3000);

    expect(dock).toHaveClass("opacity-0");

    dispatchWindowEvent(new KeyboardEvent("keydown", { key: "Space" }));

    expect(dock).toHaveClass("opacity-100");
    expect(screen.getByText("REC")).toBeInTheDocument();
    expect(screen.getByText("00:12")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Stop recording" })).toBeEnabled();
  });

  it("starts recording from the primary action", () => {
    const props = renderFloatingRecordingDock();

    fireEvent.click(screen.getByRole("button", { name: "Record" }));

    expect(props.onStartRecording).toHaveBeenCalledTimes(1);
    expect(props.onStopRecording).not.toHaveBeenCalled();
  });

  it("stops recording without calling the start action", () => {
    const props = renderFloatingRecordingDock({
      durationLabel: "00:07",
      isRecording: true,
      state: "recording",
    });

    fireEvent.click(screen.getByRole("button", { name: "Stop recording" }));

    expect(props.onStopRecording).toHaveBeenCalledTimes(1);
    expect(props.onStartRecording).not.toHaveBeenCalled();
  });

  it("shows waiting copy when a model session has no recordable output yet", () => {
    renderFloatingRecordingDock({
      canRecord: false,
      hasRecordableStream: false,
      standbyMessage: "Waiting for model output before recording.",
      state: "idle",
    });

    expect(screen.getByText("Standby")).toBeInTheDocument();
    expect(screen.getByText("Waiting for model output before recording.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Record" })).toBeDisabled();
  });

  it("renders errors as critical dock state", () => {
    renderFloatingRecordingDock({
      error: "Recording failed. Try starting a new recording.",
      state: "error",
    });

    const dock = screen.getByRole("region", { name: "Recording dock" });

    advanceTimersByTime(10_000);

    expect(dock).toHaveClass("opacity-100");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Recording failed. Try starting a new recording.",
    );
  });

  it("renders unsupported recording as a disabled accessible action", () => {
    renderFloatingRecordingDock({
      error: "Recording is not supported in this browser.",
      isSupported: false,
      state: "error",
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Recording is not supported in this browser.",
    );
    expect(screen.getByRole("button", { name: "Record" })).toBeDisabled();
  });

  it("renders playback, download, and confirmed discard actions after recording", () => {
    const props = renderFloatingRecordingDock({
      durationLabel: "01:14",
      filename: "session-local-2026-06-30-16-45.webm",
      objectUrl: "blob:http://localhost/clip",
      sizeLabel: "8.4 MB",
      state: "recorded",
    });

    const video = screen.getByLabelText("Recording playback");
    const download = screen.getByRole("link", { name: "Download" });

    expect(screen.getByText("Clip captured")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Recording dock" })).toHaveClass(
      "w-[min(calc(100vw-1rem),42rem)]",
      "max-h-[calc(100vh-env(safe-area-inset-bottom)-1rem)]",
      "overflow-y-auto",
      "motion-reduce:transition-none",
    );
    expect(screen.getByRole("region", { name: "Recording review" })).toBeInTheDocument();
    expect(video).toHaveAttribute("src", "blob:http://localhost/clip");
    expect(download).toHaveAttribute("href", "blob:http://localhost/clip");
    expect(download).toHaveAttribute("download", "session-local-2026-06-30-16-45.webm");

    fireEvent.click(screen.getByRole("button", { name: "Discard" }));

    expect(screen.getByText("Discard this take? This removes the local clip only.")).toBeInTheDocument();
    expect(props.onDiscardRecording).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Keep" }));

    expect(screen.queryByText("Discard this take? This removes the local clip only.")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Discard" }));
    fireEvent.click(screen.getByRole("button", { name: "Discard clip" }));

    expect(props.onDiscardRecording).toHaveBeenCalledTimes(1);
  });

  it("collapses and expands recorded review without deleting the clip", () => {
    const props = renderFloatingRecordingDock({
      durationLabel: "01:14",
      filename: "session-local-2026-06-30-16-45.webm",
      objectUrl: "blob:http://localhost/clip",
      sizeLabel: "8.4 MB",
      state: "recorded",
    });

    fireEvent.click(screen.getByRole("button", { name: "Collapse" }));

    expect(screen.queryByLabelText("Recording playback")).not.toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Recording review collapsed" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Download" })).toHaveAttribute(
      "href",
      "blob:http://localhost/clip",
    );
    expect(screen.getByRole("button", { name: "Review" })).toBeVisible();
    expect(props.onDiscardRecording).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Review" }));

    expect(screen.getByLabelText("Recording playback")).toHaveAttribute(
      "src",
      "blob:http://localhost/clip",
    );
  });

  it("shows a model-release completion message when provided", () => {
    renderFloatingRecordingDock({
      completionMessage: "Recording ready. Model session ended to save usage. Local camera remains on.",
      durationLabel: "00:18",
      filename: "session-lucy-2-1-2026-06-30-16-45.webm",
      objectUrl: "blob:http://localhost/model-clip",
      sizeLabel: "9.1 MB",
      state: "recorded",
    });

    expect(screen.getByText("Clip captured")).toBeInTheDocument();
    expect(
      screen.getByText("Recording ready. Model session ended to save usage. Local camera remains on."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Recording playback")).toHaveAttribute(
      "src",
      "blob:http://localhost/model-clip",
    );
  });

  it("uses a safe-area aware mobile-friendly fixed layout", () => {
    renderFloatingRecordingDock();

    expect(screen.getByRole("region", { name: "Recording dock" })).toHaveClass(
      "bottom-[calc(env(safe-area-inset-bottom)+0.75rem)]",
      "w-[min(calc(100vw-1.5rem),34rem)]",
    );
  });

  it("stays visible while focused", () => {
    renderFloatingRecordingDock();
    const dock = screen.getByRole("region", { name: "Recording dock" });

    fireEvent.focus(screen.getByRole("button", { name: "Record" }));
    advanceTimersByTime(10_000);

    expect(dock).toHaveClass("opacity-100");
  });
});
