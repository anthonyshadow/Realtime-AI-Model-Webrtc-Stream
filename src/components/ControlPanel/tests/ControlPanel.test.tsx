import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ControlPanel } from "../ControlPanel";

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
    status: "idle" as const,
    ...overrides,
  };

  render(<ControlPanel {...props} />);

  return props;
}

describe("ControlPanel", () => {
  it("renders local mode with only relevant setup controls", () => {
    renderControlPanel();

    const panel = screen.getByRole("complementary", { name: "Live studio controls" });

    expect(panel).toHaveClass(
      "max-h-[calc(100vh-env(safe-area-inset-bottom)-1.5rem)]",
      "overflow-y-auto",
    );
    expect(screen.getByRole("heading", { name: "Choose a session" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Choose session" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Confirm setup" })).toBeInTheDocument();
    expect(screen.getAllByText("Local camera").length).toBeGreaterThan(0);
    expect(screen.getByText("Browser camera")).toBeInTheDocument();
    expect(screen.getByText("Browser microphone")).toBeInTheDocument();
    expect(screen.getByText("Not requested")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Lucy 2.1" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Transformation prompt/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Reference portrait/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: /Enhance prompt/i })).not.toBeInTheDocument();
    expect(screen.queryByText("Options")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start local camera" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Reset" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "Record" })).not.toBeInTheDocument();
  });

  it("reserves a bottom lane when the recording dock is active", () => {
    renderControlPanel({
      reserveRecordingDockSpace: true,
      status: "connected",
    });

    const panel = screen.getByRole("complementary", { name: "Live studio controls" });

    expect(panel).toHaveClass(
      "bottom-[calc(env(safe-area-inset-bottom)+7.25rem)]",
      "max-h-[calc(100vh-env(safe-area-inset-bottom)-8rem)]",
      "sm:top-4",
      "sm:bottom-4",
      "sm:w-[min(24rem,calc(100vw-2rem))]",
      "motion-reduce:transition-none",
    );
  });

  it("renders model controls when Lucy is selected", () => {
    renderControlPanel({ sessionMode: "lucy-2.1" });

    expect(screen.getAllByText("Lucy 2.1").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Lucy 2.1" })).toBeInTheDocument();
    expect(screen.getByText("Character/style transformation")).toBeInTheDocument();
    expect(
      screen.getByText("Update the transformation prompt or reference portrait, then apply when ready."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Transformation prompt/i)).toHaveValue("");
    expect(screen.getByLabelText(/Transformation prompt/i)).toHaveAttribute(
      "placeholder",
      "Describe one clear transformation",
    );
    expect(screen.getByRole("checkbox", { name: /Enhance prompt/i })).not.toBeChecked();
    expect(screen.getByLabelText("Reference portrait")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start Lucy session" })).toBeDisabled();
    expect(screen.getByText("Add a prompt or image to start.")).toBeInTheDocument();
  });

  it("enables model setup once a prompt is present", () => {
    renderControlPanel({
      prompt: "Make the scene cinematic",
      sessionMode: "lucy-2.1",
    });

    expect(screen.getByRole("button", { name: "Start Lucy session" })).toBeEnabled();
  });

  it("renders VTON setup before a session starts", () => {
    renderControlPanel({
      prompt: "Substitute the top with a denim jacket",
      sessionMode: "lucy-vton-3",
    });

    expect(screen.getAllByText("Lucy VTON 3").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Lucy VTON 3" })).toBeInTheDocument();
    expect(screen.getByText("Garment try-on")).toBeInTheDocument();
    expect(screen.getByLabelText(/Garment prompt/i)).toHaveValue(
      "Substitute the top with a denim jacket",
    );
    expect(screen.getByLabelText("Garment image")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start VTON session" })).toBeEnabled();
  });

  it("passes setup mode card selections upward", async () => {
    const user = userEvent.setup();
    const props = renderControlPanel({ sessionMode: "lucy-2.1" });

    await user.click(screen.getByRole("button", { name: /Lucy VTON 3/i }));
    await user.click(screen.getByRole("button", { name: /Local camera/i }));

    expect(props.onSessionModeChange).toHaveBeenCalledWith("lucy-vton-3");
    expect(props.onSessionModeChange).toHaveBeenCalledWith("local");
  });

  it("keeps advanced model controls collapsed until opened", async () => {
    const user = userEvent.setup();
    renderControlPanel({ sessionMode: "lucy-2.1" });

    const disclosure = screen.getByText("Options").closest("details");

    expect(disclosure).not.toHaveAttribute("open");

    await user.click(screen.getByText("Options"));

    expect(disclosure).toHaveAttribute("open");
    expect(screen.getByRole("checkbox", { name: /Enhance prompt/i })).not.toBeChecked();
    expect(
      screen.getByText("Use prompt enhancement when you want Decart to expand your wording."),
    ).toBeInTheDocument();
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

  it("passes session action callbacks upward", async () => {
    const user = userEvent.setup();
    const props = renderControlPanel({
      hasPendingChanges: true,
      sessionMode: "lucy-2.1",
      status: "connected",
    });

    await user.click(screen.getByRole("button", { name: "Stop session" }));
    await user.click(screen.getByRole("button", { name: "Apply" }));
    await user.click(screen.getByRole("button", { name: "Reset" }));

    expect(props.onStop).toHaveBeenCalledTimes(1);
    expect(props.onApply).toHaveBeenCalledTimes(1);
    expect(props.onReset).toHaveBeenCalledTimes(1);
  });

  it("keeps Apply disabled for synced live model controls", () => {
    renderControlPanel({
      activeSessionMode: "lucy-2.1",
      canChangeSessionMode: false,
      hasPendingChanges: false,
      prompt: "Make the scene cinematic",
      sessionMode: "lucy-2.1",
      status: "connected",
    });

    expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
    expect(screen.getByText("Synced. Edit prompt or image to queue an update.")).toBeInTheDocument();
  });

  it("passes the local start action upward", async () => {
    const user = userEvent.setup();
    const props = renderControlPanel();

    await user.click(screen.getByRole("button", { name: "Start local camera" }));

    expect(props.onStart).toHaveBeenCalledTimes(1);
  });

  it("hides mode switching while a session is active", () => {
    renderControlPanel({
      canChangeSessionMode: false,
      sessionMode: "lucy-2.1",
      status: "connected",
    });

    expect(screen.queryByRole("button", { name: /Local camera/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Lucy 2.1/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Lucy VTON 3/i })).not.toBeInTheDocument();
    expect(screen.getByText("Mode")).toBeInTheDocument();
    expect(screen.getByText("Lucy")).toBeInTheDocument();
  });

  it("clears selected reference images through the model section", async () => {
    const user = userEvent.setup();
    const file = new File(["portrait"], "portrait.png", { type: "image/png" });
    const props = renderControlPanel({
      imageFile: file,
      imagePreviewUrl: "blob:http://localhost/portrait",
      sessionMode: "lucy-2.1",
    });

    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(props.onImageChange).toHaveBeenCalledWith(null);
    expect(props.onImageError).toHaveBeenCalledWith(null);
  });

  it("passes enhance toggle changes upward", async () => {
    const user = userEvent.setup();
    const props = renderControlPanel({ sessionMode: "lucy-2.1" });

    await user.click(screen.getByText("Options"));
    await user.click(screen.getByRole("checkbox", { name: /Enhance prompt/i }));

    expect(props.onEnhancePromptChange).toHaveBeenCalledWith(true);
  });

  it("keeps recording controls out of the control panel during active sessions", () => {
    renderControlPanel({
      canChangeSessionMode: false,
      status: "connected",
    });

    const panel = screen.getByRole("complementary", { name: "Live studio controls" });

    expect(panel).toContainElement(screen.getByRole("button", { name: "Stop session" }));
    expect(screen.queryByRole("button", { name: "Record" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Stop recording" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Recording playback")).not.toBeInTheDocument();
  });

  it("shows useful API or validation errors", () => {
    renderControlPanel({ error: "Could not create realtime session token." });

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Could not start session")).toBeInTheDocument();
    expect(screen.getByText("Could not create realtime session token.")).toBeInTheDocument();
    expect(screen.getByText("Ready to retry")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeEnabled();
  });

  it("shows permission denied setup errors before a session starts", () => {
    renderControlPanel({
      error: "Camera permission was denied. Allow camera access and try again.",
      status: "error",
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Camera permission was denied. Allow camera access and try again.",
    );
    expect(screen.getByText("Denied")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeEnabled();
  });
});
