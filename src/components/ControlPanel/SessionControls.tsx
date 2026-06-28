import type { RealtimeStatus } from "../../types/realtime";

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
  const canApply = canApplyChanges && APPLY_STATUSES.has(status);
  const startStopLabel = isRunning || isConnecting ? "Stop session" : startLabel;
  const startStopClassName =
    isRunning || isConnecting
      ? "border border-red-300/35 bg-red-500/15 text-red-50 hover:border-red-200/60"
      : "bg-cyan-300 text-neutral-950 hover:bg-cyan-200";
  const applyClassName = hasPendingChanges
    ? "bg-white text-neutral-950 hover:bg-neutral-200"
    : "border border-white/15 text-white hover:border-white/30";

  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        className={`col-span-2 rounded-md px-3 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${startStopClassName}`}
        type="button"
        onClick={isRunning || isConnecting ? onStop : onStart}
      >
        {startStopLabel}
      </button>
      <button
        className={`rounded-md px-3 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${applyClassName}`}
        type="button"
        disabled={!canApply || isApplying}
        onClick={onApply}
      >
        {isApplying ? "Applying" : "Apply"}
      </button>
      <button
        className="rounded-md border border-white/15 px-3 py-2.5 text-sm font-semibold text-white transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
        disabled={isApplying}
        onClick={onReset}
      >
        Reset
      </button>
    </div>
  );
}
