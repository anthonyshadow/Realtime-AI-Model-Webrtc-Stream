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
  it("renders the main controls and status summary", () => {
    renderControlPanel();

    expect(screen.getAllByText("Local camera").length).toBeGreaterThan(0);
    expect(screen.getByText("Session")).toBeInTheDocument();
    expect(screen.getByText("Mode")).toBeInTheDocument();
    expect(screen.queryByLabelText(/Transformation prompt/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: /Enhance prompt/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start local camera" })).toBeEnabled();
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

  it("shows useful API or validation errors", () => {
    renderControlPanel({ error: "Could not create realtime session token." });

    expect(screen.getByText("Could not create realtime session token.")).toBeInTheDocument();
  });
});
