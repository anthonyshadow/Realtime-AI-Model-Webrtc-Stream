import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeStatus } from "../../types/realtime";
import { ControlPanel, type ControlPanelProps } from "./ControlPanel";

const CONTROL_PANEL_IDLE_MS = 3000;
const AUTO_HIDE_STATUSES = new Set<RealtimeStatus>(["connected", "generating"]);

type AutoHidingControlPanelProps = Omit<ControlPanelProps, "isVisible">;

export function AutoHidingControlPanel(props: AutoHidingControlPanelProps) {
  const [isVisible, setIsVisible] = useState(true);
  const hideTimerRef = useRef<number | null>(null);
  const shouldAutoHide = AUTO_HIDE_STATUSES.has(props.status);

  const showControlPanel = useCallback(() => {
    setIsVisible(true);

    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
    }

    hideTimerRef.current = window.setTimeout(() => {
      setIsVisible(false);
      hideTimerRef.current = null;
    }, CONTROL_PANEL_IDLE_MS);
  }, []);

  useEffect(() => {
    if (!shouldAutoHide) {
      setIsVisible(true);

      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }

      return;
    }

    showControlPanel();

    window.addEventListener("mousemove", showControlPanel);
    window.addEventListener("touchstart", showControlPanel);
    window.addEventListener("keydown", showControlPanel);

    return () => {
      window.removeEventListener("mousemove", showControlPanel);
      window.removeEventListener("touchstart", showControlPanel);
      window.removeEventListener("keydown", showControlPanel);

      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, [shouldAutoHide, showControlPanel]);

  return <ControlPanel {...props} isVisible={isVisible} />;
}
