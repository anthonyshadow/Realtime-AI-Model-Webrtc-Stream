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

const DEFAULT_ROOT_ID = "overlay-root";

export function useAutoHideOverlay<TElement extends HTMLElement = HTMLElement>({
  enabled = true,
  eventTarget,
  forceVisible = false,
  hideDelayMs = DEFAULT_AUTO_HIDE_DELAY_MS,
  initialVisible = true,
}: UseAutoHideOverlayOptions = {}) {
  const [isVisibleState, setIsVisibleState] = useState(initialVisible);
  const hideTimerRef = useRef<number | null>(null);
  const overlayElementsRef = useRef(new Map<string, TElement>());
  const hasFocusWithinRef = useRef(false);
  const pointerRootIdsRef = useRef(new Set<string>());
  const isWindowInactiveRef = useRef(false);
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
      pointerRootIdsRef.current.size === 0 &&
      !isWindowInactiveRef.current
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

  const setOverlayElement = useCallback((rootId: string, element: TElement | null) => {
    if (element) {
      overlayElementsRef.current.set(rootId, element);
      return;
    }

    overlayElementsRef.current.delete(rootId);
    pointerRootIdsRef.current.delete(rootId);
  }, []);

  const handleFocusCapture = useCallback<FocusEventHandler<TElement>>(() => {
    hasFocusWithinRef.current = true;
    setIsVisibleState(true);
    clearHideTimer();
  }, [clearHideTimer]);

  const handleBlurCapture = useCallback<FocusEventHandler<TElement>>(
    (event) => {
      const nextFocusedElement = event.relatedTarget;

      if (
        nextFocusedElement instanceof Node &&
        isNodeInsideOverlayRoot(overlayElementsRef.current, nextFocusedElement)
      ) {
        return;
      }

      hasFocusWithinRef.current = false;
      scheduleHide();
    },
    [scheduleHide],
  );

  const createRootProps = useCallback(
    (rootId = DEFAULT_ROOT_ID): AutoHideOverlayRootProps<TElement> => ({
      ref: (element) => setOverlayElement(rootId, element),
      onBlurCapture: handleBlurCapture,
      onFocusCapture: handleFocusCapture,
      onPointerDownCapture: () => {
        setIsVisibleState(true);
        scheduleHide();
      },
      onPointerEnter: () => {
        pointerRootIdsRef.current.add(rootId);
        setIsVisibleState(true);
        clearHideTimer();
      },
      onPointerLeave: () => {
        pointerRootIdsRef.current.delete(rootId);
        scheduleHide();
      },
      onTouchStartCapture: () => {
        setIsVisibleState(true);
        scheduleHide();
      },
    }),
    [
      clearHideTimer,
      handleBlurCapture,
      handleFocusCapture,
      scheduleHide,
      setOverlayElement,
    ],
  );

  const handleActivity = useCallback((event: Event) => {
    if (event instanceof KeyboardEvent && event.key === "Escape") {
      hideOverlay();
      return;
    }

    showOverlay();
  }, [hideOverlay, showOverlay]);

  const handleWindowBlur = useCallback(() => {
    isWindowInactiveRef.current = true;
    setIsVisibleState(true);
    clearHideTimer();
  }, [clearHideTimer]);

  const handleWindowFocus = useCallback(() => {
    isWindowInactiveRef.current = false;
    showOverlay();
  }, [showOverlay]);

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

    activityTarget.addEventListener("mousemove", handleActivity);
    activityTarget.addEventListener("touchstart", handleActivity, { passive: true });
    activityTarget.addEventListener("keydown", handleActivity);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      activityTarget.removeEventListener("mousemove", handleActivity);
      activityTarget.removeEventListener("touchstart", handleActivity);
      activityTarget.removeEventListener("keydown", handleActivity);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      clearHideTimer();
    };
  }, [
    clearHideTimer,
    enabled,
    eventTarget,
    forceVisible,
    handleActivity,
    handleWindowBlur,
    handleWindowFocus,
    showOverlay,
  ]);

  const rootProps = useMemo<AutoHideOverlayRootProps<TElement>>(
    () => createRootProps(DEFAULT_ROOT_ID),
    [createRootProps],
  );

  return {
    getRootProps: createRootProps,
    hide: hideOverlay,
    isVisible: !enabled || forceVisible ? true : isVisibleState,
    rootProps,
    show: showOverlay,
  };
}

function isNodeInsideOverlayRoot(
  overlayElements: Map<string, HTMLElement>,
  node: Node,
) {
  for (const element of overlayElements.values()) {
    if (element.contains(node)) {
      return true;
    }
  }

  return false;
}

function getDefaultEventTarget() {
  if (typeof window === "undefined") {
    return null;
  }

  return window;
}
