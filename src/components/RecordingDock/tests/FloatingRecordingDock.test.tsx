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
    onDeleteRecording: vi.fn(),
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

  it("remains visible while recording", () => {
    renderFloatingRecordingDock({
      durationLabel: "00:12",
      isRecording: true,
      state: "recording",
    });
    const dock = screen.getByRole("region", { name: "Recording dock" });

    advanceTimersByTime(10_000);

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

  it("renders playback, download, and delete actions after recording", () => {
    const props = renderFloatingRecordingDock({
      durationLabel: "01:14",
      filename: "session-local-2026-06-30-16-45.webm",
      objectUrl: "blob:http://localhost/clip",
      sizeLabel: "8.4 MB",
      state: "recorded",
    });

    const video = screen.getByLabelText("Recording playback");
    const download = screen.getByRole("link", { name: "Download clip" });

    expect(screen.getByText("Clip captured")).toBeInTheDocument();
    expect(video).toHaveAttribute("src", "blob:http://localhost/clip");
    expect(download).toHaveAttribute("href", "blob:http://localhost/clip");
    expect(download).toHaveAttribute("download", "session-local-2026-06-30-16-45.webm");

    fireEvent.click(screen.getByRole("button", { name: "Delete recording" }));

    expect(props.onDeleteRecording).toHaveBeenCalledTimes(1);
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
