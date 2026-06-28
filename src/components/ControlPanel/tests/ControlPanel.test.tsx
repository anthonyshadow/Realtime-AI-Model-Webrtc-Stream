import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ControlPanel } from "../ControlPanel";

function renderControlPanel(overrides: Partial<Parameters<typeof ControlPanel>[0]> = {}) {
  const props = {
    activeModelMode: null,
    canChangeModel: true,
    elapsedLabel: "00:00",
    enhancePrompt: false,
    error: null,
    hasPendingChanges: false,
    imageFile: null,
    imagePreviewUrl: null,
    isApplying: false,
    isVisible: true,
    modelMode: "lucy-2.1" as const,
    onApply: vi.fn(),
    onEnhancePromptChange: vi.fn(),
    onImageChange: vi.fn(),
    onImageError: vi.fn(),
    onModelModeChange: vi.fn(),
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

    expect(screen.getByText("Lucy 2.1")).toBeInTheDocument();
    expect(screen.getByText("Session")).toBeInTheDocument();
    expect(screen.getByLabelText(/Transformation prompt/i)).toHaveValue("");
    expect(screen.getByLabelText(/Transformation prompt/i)).toHaveAttribute(
      "placeholder",
      "Describe one clear transformation",
    );
    expect(screen.getByRole("checkbox", { name: /Enhance prompt/i })).not.toBeChecked();
    expect(screen.getByLabelText("Reference portrait")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start" })).toBeEnabled();
  });

  it("passes prompt and model changes upward", async () => {
    const user = userEvent.setup();
    const props = renderControlPanel();

    fireEvent.change(screen.getByLabelText(/Transformation prompt/i), {
      target: { value: "Make it cinematic" },
    });
    await user.click(screen.getByRole("button", { name: /VTON/i }));

    expect(props.onPromptChange).toHaveBeenLastCalledWith("Make it cinematic");
    expect(props.onModelModeChange).toHaveBeenCalledWith("lucy-vton-3");
  });

  it("disables model changes while a session is active", () => {
    renderControlPanel({
      canChangeModel: false,
      status: "connected",
    });

    expect(screen.getByRole("button", { name: /Lucy/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /VTON/i })).toBeDisabled();
  });

  it("shows useful API or validation errors", () => {
    renderControlPanel({ error: "Could not create realtime session token." });

    expect(screen.getByText("Could not create realtime session token.")).toBeInTheDocument();
  });
});
