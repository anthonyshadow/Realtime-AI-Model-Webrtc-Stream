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

function TestMultiRootOverlay() {
  const { getRootProps, isVisible } = useAutoHideOverlay<HTMLDivElement>({
    hideDelayMs: 1000,
  });

  return (
    <>
      <div
        data-testid="panel-root"
        data-visible={isVisible ? "true" : "false"}
        {...getRootProps("panel")}
      >
        <button type="button">Panel control</button>
      </div>
      <div
        data-testid="dock-root"
        data-visible={isVisible ? "true" : "false"}
        {...getRootProps("dock")}
      >
        <button type="button">Dock control</button>
      </div>
    </>
  );
}

function TestReleaseHoldOverlay() {
  const { isVisible, releaseInteractionHold, rootProps } =
    useAutoHideOverlay<HTMLDivElement>({
      hideDelayMs: 1000,
    });

  return (
    <>
      <div
        data-testid="overlay"
        data-visible={isVisible ? "true" : "false"}
        {...rootProps}
      >
        <button type="button">Inside control</button>
      </div>
      <button type="button" onClick={releaseInteractionHold}>
        Release hold
      </button>
    </>
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

  it("shows the overlay on touch interaction", () => {
    const { result } = renderHook(() =>
      useAutoHideOverlay({ hideDelayMs: 1000 }),
    );

    advanceTimersByTime(1000);

    expect(result.current.isVisible).toBe(false);

    dispatchWindowEvent(new TouchEvent("touchstart"));

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

  it("dismisses the overlay with Escape when nothing is interacting", () => {
    const { result } = renderHook(() =>
      useAutoHideOverlay({ hideDelayMs: 1000 }),
    );

    expect(result.current.isVisible).toBe(true);

    dispatchWindowEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(result.current.isVisible).toBe(false);
  });

  it("stays visible while the window is inactive for a file picker", () => {
    const { result } = renderHook(() =>
      useAutoHideOverlay({ hideDelayMs: 1000 }),
    );

    dispatchWindowEvent(new Event("blur"));
    advanceTimersByTime(5000);

    expect(result.current.isVisible).toBe(true);

    dispatchWindowEvent(new Event("focus"));
    advanceTimersByTime(1000);

    expect(result.current.isVisible).toBe(false);
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

  it("keeps shared overlays visible while pointer moves between roots", () => {
    render(<TestMultiRootOverlay />);
    const panelRoot = screen.getByTestId("panel-root");
    const dockRoot = screen.getByTestId("dock-root");

    advanceTimersByTime(1000);

    expect(panelRoot).toHaveAttribute("data-visible", "false");
    expect(dockRoot).toHaveAttribute("data-visible", "false");

    fireEvent.pointerEnter(panelRoot);
    fireEvent.pointerLeave(panelRoot);
    fireEvent.pointerEnter(dockRoot);
    advanceTimersByTime(5000);

    expect(panelRoot).toHaveAttribute("data-visible", "true");
    expect(dockRoot).toHaveAttribute("data-visible", "true");

    fireEvent.pointerLeave(dockRoot);
    advanceTimersByTime(1000);

    expect(panelRoot).toHaveAttribute("data-visible", "false");
    expect(dockRoot).toHaveAttribute("data-visible", "false");
  });

  it("can release pointer and focus holds before idling out", () => {
    render(<TestReleaseHoldOverlay />);
    const overlay = screen.getByTestId("overlay");

    advanceTimersByTime(1000);

    expect(overlay).toHaveAttribute("data-visible", "false");

    fireEvent.pointerEnter(overlay);
    act(() => {
      screen.getByRole("button", { name: "Inside control" }).focus();
    });
    advanceTimersByTime(5000);

    expect(overlay).toHaveAttribute("data-visible", "true");

    fireEvent.click(screen.getByRole("button", { name: "Release hold" }));
    advanceTimersByTime(1000);

    expect(overlay).toHaveAttribute("data-visible", "false");
  });
});
