import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEventHandler,
  type PointerEventHandler,
  type TouchEventHandler,
} from "react";

const DEFAULT_AUTO_HIDE_DELAY_MS = 3000;

type AutoHideOverlayEventTarget = Window | Document | HTMLElement;

export type AutoHideOverlayRootProps<TElement extends HTMLElement = HTMLElement> = {
  ref: (element: TElement | null) => void;
  onBlurCapture: FocusEventHandler<TElement>;
  onFocusCapture: FocusEventHandler<TElement>;
  onPointerDownCapture: PointerEventHandler<TElement>;
  onPointerEnter: PointerEventHandler<TElement>;
  onPointerLeave: PointerEventHandler<TElement>;
  onTouchStartCapture: TouchEventHandler<TElement>;
};

export type UseAutoHideOverlayOptions = {
  enabled?: boolean;
  eventTarget?: AutoHideOverlayEventTarget | null;
  forceVisible?: boolean;
  hideDelayMs?: number;
  initialVisible?: boolean;
};

export function useAutoHideOverlay<TElement extends HTMLElement = HTMLElement>({
  enabled = true,
  eventTarget,
  forceVisible = false,
  hideDelayMs = DEFAULT_AUTO_HIDE_DELAY_MS,
  initialVisible = true,
}: UseAutoHideOverlayOptions = {}) {
  const [isVisibleState, setIsVisibleState] = useState(initialVisible);
  const hideTimerRef = useRef<number | null>(null);
  const overlayElementRef = useRef<TElement | null>(null);
  const hasFocusWithinRef = useRef(false);
  const hasPointerWithinRef = useRef(false);
  const enabledRef = useRef(enabled);
  const forceVisibleRef = useRef(forceVisible);
  const hideDelayMsRef = useRef(hideDelayMs);

  useEffect(() => {
    enabledRef.current = enabled;
    forceVisibleRef.current = forceVisible;
    hideDelayMsRef.current = hideDelayMs;
  });

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current === null) {
      return;
    }

    window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = null;
  }, []);

  const canHide = useCallback(() => {
    return (
      enabledRef.current &&
      !forceVisibleRef.current &&
      !hasFocusWithinRef.current &&
      !hasPointerWithinRef.current
    );
  }, []);

  const scheduleHide = useCallback(() => {
    clearHideTimer();

    if (!canHide()) {
      return;
    }

    hideTimerRef.current = window.setTimeout(() => {
      if (canHide()) {
        setIsVisibleState(false);
      }

      hideTimerRef.current = null;
    }, Math.max(0, hideDelayMsRef.current));
  }, [canHide, clearHideTimer]);

  const showOverlay = useCallback(() => {
    setIsVisibleState(true);
    scheduleHide();
  }, [scheduleHide]);

  const hideOverlay = useCallback(() => {
    clearHideTimer();

    if (canHide()) {
      setIsVisibleState(false);
    }
  }, [canHide, clearHideTimer]);

  const setOverlayElement = useCallback((element: TElement | null) => {
    overlayElementRef.current = element;
  }, []);

  const handleFocusCapture = useCallback<FocusEventHandler<TElement>>(() => {
    hasFocusWithinRef.current = true;
    setIsVisibleState(true);
    clearHideTimer();
  }, [clearHideTimer]);

  const handleBlurCapture = useCallback<FocusEventHandler<TElement>>(
    (event) => {
      const root = overlayElementRef.current;
      const nextFocusedElement = event.relatedTarget;

      if (root && nextFocusedElement instanceof Node && root.contains(nextFocusedElement)) {
        return;
      }

      hasFocusWithinRef.current = false;
      scheduleHide();
    },
    [scheduleHide],
  );

  const handlePointerEnter = useCallback<PointerEventHandler<TElement>>(() => {
    hasPointerWithinRef.current = true;
    setIsVisibleState(true);
    clearHideTimer();
  }, [clearHideTimer]);

  const handlePointerLeave = useCallback<PointerEventHandler<TElement>>(() => {
    hasPointerWithinRef.current = false;
    scheduleHide();
  }, [scheduleHide]);

  const handlePointerDownCapture = useCallback<PointerEventHandler<TElement>>(() => {
    setIsVisibleState(true);
    scheduleHide();
  }, [scheduleHide]);

  const handleTouchStartCapture = useCallback<TouchEventHandler<TElement>>(() => {
    setIsVisibleState(true);
    scheduleHide();
  }, [scheduleHide]);

  useEffect(() => {
    const activityTarget =
      eventTarget === undefined
        ? getDefaultEventTarget()
        : eventTarget;

    if (!enabled || forceVisible || !activityTarget) {
      clearHideTimer();
      setIsVisibleState(true);
      return;
    }

    showOverlay();

    activityTarget.addEventListener("mousemove", showOverlay);
    activityTarget.addEventListener("touchstart", showOverlay, { passive: true });
    activityTarget.addEventListener("keydown", showOverlay);

    return () => {
      activityTarget.removeEventListener("mousemove", showOverlay);
      activityTarget.removeEventListener("touchstart", showOverlay);
      activityTarget.removeEventListener("keydown", showOverlay);
      clearHideTimer();
    };
  }, [clearHideTimer, enabled, eventTarget, forceVisible, showOverlay]);

  const rootProps = useMemo<AutoHideOverlayRootProps<TElement>>(
    () => ({
      ref: setOverlayElement,
      onBlurCapture: handleBlurCapture,
      onFocusCapture: handleFocusCapture,
      onPointerDownCapture: handlePointerDownCapture,
      onPointerEnter: handlePointerEnter,
      onPointerLeave: handlePointerLeave,
      onTouchStartCapture: handleTouchStartCapture,
    }),
    [
      handleBlurCapture,
      handleFocusCapture,
      handlePointerDownCapture,
      handlePointerEnter,
      handlePointerLeave,
      handleTouchStartCapture,
      setOverlayElement,
    ],
  );

  return {
    hide: hideOverlay,
    isVisible: !enabled || forceVisible ? true : isVisibleState,
    rootProps,
    show: showOverlay,
  };
}

function getDefaultEventTarget() {
  if (typeof window === "undefined") {
    return null;
  }

  return window;
}
