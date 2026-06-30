import { useAutoHideOverlay } from "../../hooks/useAutoHideOverlay";
import type { RealtimeStatus } from "../../types/realtime";
import { ControlPanel, type ControlPanelProps } from "./ControlPanel";

const CONTROL_PANEL_IDLE_MS = 3000;
const AUTO_HIDE_STATUSES = new Set<RealtimeStatus>([
  "connected",
  "generating",
  "reconnecting",
]);

type AutoHidingControlPanelProps = Omit<ControlPanelProps, "isVisible" | "overlayProps">;

export function AutoHidingControlPanel(props: AutoHidingControlPanelProps) {
  const shouldAutoHide = AUTO_HIDE_STATUSES.has(props.status);
  const forceVisible =
    props.status === "error" ||
    props.error !== null;
  const { isVisible, rootProps } = useAutoHideOverlay<HTMLElement>({
    enabled: shouldAutoHide,
    forceVisible,
    hideDelayMs: CONTROL_PANEL_IDLE_MS,
  });

  return <ControlPanel {...props} isVisible={isVisible} overlayProps={rootProps} />;
}
