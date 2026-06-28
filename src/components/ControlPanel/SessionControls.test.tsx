import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SessionControls } from "./SessionControls";

function renderControls(overrides: Partial<Parameters<typeof SessionControls>[0]> = {}) {
  const props = {
    hasPendingChanges: false,
    isApplying: false,
    status: "idle" as const,
    onApply: vi.fn(),
    onReset: vi.fn(),
    onStart: vi.fn(),
    onStop: vi.fn(),
    ...overrides,
  };

  render(<SessionControls {...props} />);

  return props;
}

describe("SessionControls", () => {
  it("starts from idle and keeps apply disabled", async () => {
    const user = userEvent.setup();
    const props = renderControls();

    await user.click(screen.getByRole("button", { name: "Start" }));

    expect(props.onStart).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Reset" })).toBeEnabled();
  });

  it("stops while connecting", async () => {
    const user = userEvent.setup();
    const props = renderControls({ status: "connecting" });

    await user.click(screen.getByRole("button", { name: "Stop" }));

    expect(props.onStop).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
  });

  it("enables apply for connected sessions", async () => {
    const user = userEvent.setup();
    const props = renderControls({ hasPendingChanges: true, status: "connected" });

    await user.click(screen.getByRole("button", { name: "Apply" }));

    expect(props.onApply).toHaveBeenCalledTimes(1);
  });

  it("locks apply and reset while changes are applying", () => {
    renderControls({ isApplying: true, status: "generating" });

    expect(screen.getByRole("button", { name: "Applying" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Reset" })).toBeDisabled();
  });
});
