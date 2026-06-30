import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ControlPanel } from "../ControlPanel";

const baseRecording = {
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
};

function renderControlPanel(overrides: Partial<Parameters<typeof ControlPanel>[0]> = {}) {
  const props = {
    activeSessionMode: null,
    canChangeSessionMode: true,
    elapsedLabel: "00:00",
    enhancePrompt: false,
    error: null,
    hasPendingChanges: false,
    imageFile: null,
    imagePreviewUrl: null,
    isApplying: false,
    isVisible: true,
    sessionMode: "local" as const,
    onApply: vi.fn(),
    onEnhancePromptChange: vi.fn(),
    onImageChange: vi.fn(),
    onImageError: vi.fn(),
    onSessionModeChange: vi.fn(),
    onPromptChange: vi.fn(),
    onReset: vi.fn(),
    onStart: vi.fn(),
    onStop: vi.fn(),
    prompt: "",
    recording: {
      ...baseRecording,
      onDeleteRecording: vi.fn(),
      onStartRecording: vi.fn(),
      onStopRecording: vi.fn(),
    },
    status: "idle" as const,
    ...overrides,
  };

  render(<ControlPanel {...props} />);

  return props;
}

describe("ControlPanel", () => {
  it("renders the main controls and status summary", () => {
    renderControlPanel();

    expect(screen.getAllByText("Local camera").length).toBeGreaterThan(0);
    expect(screen.getByText("Session")).toBeInTheDocument();
    expect(screen.getByText("Mode")).toBeInTheDocument();
    expect(screen.queryByLabelText(/Transformation prompt/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: /Enhance prompt/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start local camera" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Record" })).toBeDisabled();
  });

  it("renders model controls when Lucy is selected", () => {
    renderControlPanel({ enhancePrompt: true, sessionMode: "lucy-2.1" });

    expect(screen.getAllByText("Lucy 2.1").length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Transformation prompt/i)).toHaveValue("");
    expect(screen.getByLabelText(/Transformation prompt/i)).toHaveAttribute(
      "placeholder",
      "Describe one clear transformation",
    );
    expect(screen.getByRole("checkbox", { name: /Enhance prompt/i })).toBeChecked();
    expect(screen.getByLabelText("Reference portrait")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start Lucy session" })).toBeEnabled();
  });

  it("passes prompt and model changes upward", async () => {
    const user = userEvent.setup();
    const props = renderControlPanel({ sessionMode: "lucy-2.1" });

    fireEvent.change(screen.getByLabelText(/Transformation prompt/i), {
      target: { value: "Make it cinematic" },
    });
    await user.click(screen.getByRole("button", { name: /VTON/i }));

    expect(props.onPromptChange).toHaveBeenLastCalledWith("Make it cinematic");
    expect(props.onSessionModeChange).toHaveBeenCalledWith("lucy-vton-3");
  });

  it("disables model changes while a session is active", () => {
    renderControlPanel({
      canChangeSessionMode: false,
      sessionMode: "lucy-2.1",
      status: "connected",
    });

    expect(screen.getByRole("button", { name: /Local camera/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Lucy 2.1/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Lucy VTON 3/i })).toBeDisabled();
  });

  it("shows recording controls when a local session has a stream", async () => {
    const user = userEvent.setup();
    const props = renderControlPanel({
      canChangeSessionMode: false,
      recording: {
        ...baseRecording,
        canRecord: true,
        hasRecordableStream: true,
        onDeleteRecording: vi.fn(),
        onStartRecording: vi.fn(),
        onStopRecording: vi.fn(),
        state: "ready",
      },
      status: "connected",
    });

    expect(screen.getAllByText("Ready").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Record" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Record" }));

    expect(props.recording.onStartRecording).toHaveBeenCalledTimes(1);
  });

  it("shows recording controls when a model session has a stream", () => {
    renderControlPanel({
      activeSessionMode: "lucy-2.1",
      canChangeSessionMode: false,
      recording: {
        ...baseRecording,
        canRecord: true,
        hasRecordableStream: true,
        onDeleteRecording: vi.fn(),
        onStartRecording: vi.fn(),
        onStopRecording: vi.fn(),
        state: "ready",
      },
      sessionMode: "lucy-2.1",
      status: "connected",
    });

    expect(screen.getByRole("button", { name: "Record" })).toBeEnabled();
    expect(screen.getAllByText("Lucy 2.1").length).toBeGreaterThan(0);
  });

  it("keeps Stop session and Stop recording as separate actions", async () => {
    const user = userEvent.setup();
    const props = renderControlPanel({
      canChangeSessionMode: false,
      recording: {
        ...baseRecording,
        durationLabel: "00:09",
        hasRecordableStream: true,
        isRecording: true,
        onDeleteRecording: vi.fn(),
        onStartRecording: vi.fn(),
        onStopRecording: vi.fn(),
        state: "recording",
      },
      status: "connected",
    });

    await user.click(screen.getByRole("button", { name: "Stop recording" }));

    expect(props.recording.onStopRecording).toHaveBeenCalledTimes(1);
    expect(props.onStop).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Stop session" }));

    expect(props.onStop).toHaveBeenCalledTimes(1);
  });

  it("renders recording errors inside the panel", () => {
    renderControlPanel({
      recording: {
        ...baseRecording,
        error: "Recording failed. Try starting a new recording.",
        hasRecordableStream: true,
        isSupported: true,
        onDeleteRecording: vi.fn(),
        onStartRecording: vi.fn(),
        onStopRecording: vi.fn(),
        state: "error",
      },
    });

    expect(screen.getByText("Recording failed. Try starting a new recording.")).toBeInTheDocument();
  });

  it("renders the recording playback panel after a clip is captured", async () => {
    const user = userEvent.setup();
    const props = renderControlPanel({
      canChangeSessionMode: false,
      recording: {
        ...baseRecording,
        canRecord: true,
        durationLabel: "00:07",
        filename: "session-local-2026-06-29-16-45.webm",
        hasRecordableStream: true,
        objectUrl: "blob:http://localhost/clip",
        onDeleteRecording: vi.fn(),
        onStartRecording: vi.fn(),
        onStopRecording: vi.fn(),
        sizeLabel: "11 B",
        state: "recorded",
      },
      status: "connected",
    });

    expect(screen.getByLabelText("Recording playback")).toHaveAttribute(
      "src",
      "blob:http://localhost/clip",
    );
    expect(screen.getByRole("link", { name: "Download clip" })).toHaveAttribute(
      "download",
      "session-local-2026-06-29-16-45.webm",
    );

    await user.click(screen.getByRole("button", { name: "Delete recording" }));

    expect(props.recording.onDeleteRecording).toHaveBeenCalledTimes(1);
    expect(props.onStop).not.toHaveBeenCalled();
  });

  it("shows useful API or validation errors", () => {
    renderControlPanel({ error: "Could not create realtime session token." });

    expect(screen.getByText("Could not create realtime session token.")).toBeInTheDocument();
  });
});
