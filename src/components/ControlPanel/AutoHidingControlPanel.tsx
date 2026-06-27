import { useCallback, useEffect, useRef, useState } from "react";
import { ControlPanel, type ControlPanelProps } from "./ControlPanel";

const CONTROL_PANEL_IDLE_MS = 3000;

type AutoHidingControlPanelProps = Omit<ControlPanelProps, "isVisible">;

export function AutoHidingControlPanel(props: AutoHidingControlPanelProps) {
  const [isVisible, setIsVisible] = useState(true);
  const hideTimerRef = useRef<number | null>(null);

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
  }, [showControlPanel]);

  return <ControlPanel {...props} isVisible={isVisible} />;
}
