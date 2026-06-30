import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAutoHideOverlay } from "./useAutoHideOverlay";

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

function TestOverlay() {
  const { isVisible, rootProps } = useAutoHideOverlay<HTMLDivElement>({
    hideDelayMs: 1000,
  });

  return (
    <div
      data-testid="overlay"
      data-visible={isVisible ? "true" : "false"}
      {...rootProps}
    >
      <button type="button">Inside control</button>
    </div>
  );
}

describe("useAutoHideOverlay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("shows the overlay on mouse movement", () => {
    const { result } = renderHook(() =>
      useAutoHideOverlay({ hideDelayMs: 1000 }),
    );

    advanceTimersByTime(1000);

    expect(result.current.isVisible).toBe(false);

    dispatchWindowEvent(new MouseEvent("mousemove"));

    expect(result.current.isVisible).toBe(true);
  });

  it("hides the overlay after the configured delay", () => {
    const { result } = renderHook(() =>
      useAutoHideOverlay({ hideDelayMs: 1000 }),
    );

    expect(result.current.isVisible).toBe(true);

    advanceTimersByTime(999);

    expect(result.current.isVisible).toBe(true);

    advanceTimersByTime(1);

    expect(result.current.isVisible).toBe(false);
  });

  it("keeps the overlay visible while forced", () => {
    const { result } = renderHook(() =>
      useAutoHideOverlay({ forceVisible: true, hideDelayMs: 1000 }),
    );

    advanceTimersByTime(5000);
    dispatchWindowEvent(new MouseEvent("mousemove"));

    expect(result.current.isVisible).toBe(true);
  });

  it("does not attach activity listeners or timers while disabled", () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");
    const setTimeoutSpy = vi.spyOn(window, "setTimeout");
    const { result } = renderHook(() =>
      useAutoHideOverlay({ enabled: false, hideDelayMs: 1000 }),
    );

    dispatchWindowEvent(new MouseEvent("mousemove"));
    advanceTimersByTime(5000);

    expect(result.current.isVisible).toBe(true);
    expect(addEventListenerSpy).not.toHaveBeenCalled();
    expect(setTimeoutSpy).not.toHaveBeenCalled();
  });

  it("cleans up timers on unmount", () => {
    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
    const { unmount } = renderHook(() =>
      useAutoHideOverlay({ hideDelayMs: 1000 }),
    );

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it("keeps the overlay visible while controls have keyboard focus", () => {
    render(<TestOverlay />);

    advanceTimersByTime(1000);

    expect(screen.getByTestId("overlay")).toHaveAttribute("data-visible", "false");

    dispatchWindowEvent(new KeyboardEvent("keydown", { key: "Tab" }));

    expect(screen.getByTestId("overlay")).toHaveAttribute("data-visible", "true");

    act(() => {
      screen.getByRole("button", { name: "Inside control" }).focus();
    });
    advanceTimersByTime(5000);

    expect(screen.getByTestId("overlay")).toHaveAttribute("data-visible", "true");

    act(() => {
      screen.getByRole("button", { name: "Inside control" }).blur();
    });
    advanceTimersByTime(1000);

    expect(screen.getByTestId("overlay")).toHaveAttribute("data-visible", "false");
  });

  it("keeps the overlay visible while pointer interaction is inside the overlay", () => {
    render(<TestOverlay />);
    const overlay = screen.getByTestId("overlay");

    advanceTimersByTime(1000);

    expect(overlay).toHaveAttribute("data-visible", "false");

    fireEvent.pointerEnter(overlay);
    advanceTimersByTime(5000);

    expect(overlay).toHaveAttribute("data-visible", "true");

    fireEvent.pointerLeave(overlay);
    advanceTimersByTime(1000);

    expect(overlay).toHaveAttribute("data-visible", "false");
  });
});
