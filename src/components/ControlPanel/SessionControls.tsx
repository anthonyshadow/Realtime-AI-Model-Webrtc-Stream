import type { RealtimeStatus } from "../../types/realtime";
import { studioClassNames } from "../../constants/design";
import { cx } from "../StudioUI/classNames";

type SessionControlsProps = {
  canApplyChanges: boolean;
  hasPendingChanges: boolean;
  isApplying: boolean;
  startLabel: string;
  status: RealtimeStatus;
  onReset: () => void;
  onStart: () => void;
  onStop: () => void;
  onApply: () => void;
};

const RUNNING_STATUSES = new Set<RealtimeStatus>([
  "connected",
  "generating",
  "reconnecting",
]);
const APPLY_STATUSES = new Set<RealtimeStatus>(["connected", "generating"]);
const CONNECTING_STATUSES = new Set<RealtimeStatus>([
  "requesting-camera",
  "requesting-token",
  "connecting",
]);

export function SessionControls({
  canApplyChanges,
  hasPendingChanges,
  isApplying,
  startLabel,
  status,
  onReset,
  onStart,
  onStop,
  onApply,
}: SessionControlsProps) {
  const isRunning = RUNNING_STATUSES.has(status);
  const isConnecting = CONNECTING_STATUSES.has(status);
  const canApply = canApplyChanges && hasPendingChanges && APPLY_STATUSES.has(status);
  const startStopLabel = isRunning || isConnecting ? "Stop session" : startLabel;
  const startStopClassName =
    isRunning || isConnecting
      ? "border border-red-300/35 bg-red-500/15 text-red-50 hover:border-red-200/60"
      : "bg-cyan-300 text-neutral-950 hover:bg-cyan-200";
  const applyClassName = canApply
    ? "bg-white text-neutral-950 hover:bg-neutral-200"
    : "border border-white/15 text-white hover:border-white/30";
  const buttonClassName = cx(
    "min-h-11 rounded-md px-3 py-2.5 text-center text-sm font-semibold leading-tight transition",
    studioClassNames.focusRing,
    studioClassNames.disabled,
  );

  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        className={cx("col-span-2", buttonClassName, startStopClassName)}
        type="button"
        onClick={isRunning || isConnecting ? onStop : onStart}
      >
        {startStopLabel}
      </button>
      <button
        className={cx(buttonClassName, applyClassName)}
        type="button"
        disabled={!canApply || isApplying}
        onClick={onApply}
      >
        {isApplying ? "Applying" : "Apply"}
      </button>
      <button
        className={cx(buttonClassName, "border border-white/15 text-white hover:border-white/30")}
        type="button"
        disabled={isApplying}
        onClick={onReset}
      >
        Reset
      </button>
    </div>
  );
}
