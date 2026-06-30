import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AutoHidingControlPanel } from "../AutoHidingControlPanel";
import type { ControlPanelProps } from "../ControlPanel";

type AutoHidingControlPanelProps = Omit<ControlPanelProps, "isVisible" | "overlayProps">;

function renderAutoHidingControlPanel(
  overrides: Partial<AutoHidingControlPanelProps> = {},
) {
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

  render(<AutoHidingControlPanel {...props} />);

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

describe("AutoHidingControlPanel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("preserves active-session show and hide behavior", () => {
    renderAutoHidingControlPanel({
      canChangeSessionMode: false,
      status: "connected",
    });
    const panel = screen.getByRole("complementary", { name: "Live studio controls" });

    expect(panel).toHaveClass("opacity-100");

    advanceTimersByTime(3000);

    expect(panel).toHaveClass("opacity-0");

    dispatchWindowEvent(new MouseEvent("mousemove"));

    expect(panel).toHaveClass("opacity-100");

    advanceTimersByTime(3000);

    expect(panel).toHaveClass("opacity-0");

    dispatchWindowEvent(new KeyboardEvent("keydown", { key: "Tab" }));

    expect(panel).toHaveClass("opacity-100");
  });

  it("auto-hides while a model session is reconnecting", () => {
    renderAutoHidingControlPanel({
      canChangeSessionMode: false,
      status: "reconnecting",
    });
    const panel = screen.getByRole("complementary", { name: "Live studio controls" });

    advanceTimersByTime(3000);

    expect(panel).toHaveClass("opacity-0");
  });

  it("keeps the control panel visible for critical errors", () => {
    renderAutoHidingControlPanel({
      canChangeSessionMode: false,
      error: "Could not create realtime session token.",
      sessionMode: "lucy-2.1",
      status: "connected",
    });
    const panel = screen.getByRole("complementary", { name: "Live studio controls" });

    advanceTimersByTime(10_000);

    expect(panel).toHaveClass("opacity-100");
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("stays visible when auto-hide is disabled outside active sessions", () => {
    renderAutoHidingControlPanel({ status: "idle" });
    const panel = screen.getByRole("complementary", { name: "Live studio controls" });

    advanceTimersByTime(10_000);
    dispatchWindowEvent(new MouseEvent("mousemove"));

    expect(panel).toHaveClass("opacity-100");
  });
});
