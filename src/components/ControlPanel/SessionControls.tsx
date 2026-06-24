import type { RealtimeStatus } from "../../types/realtime";

type SessionControlsProps = {
  status: RealtimeStatus;
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
  status,
  onStart,
  onStop,
  onApply,
}: SessionControlsProps) {
  const isRunning = RUNNING_STATUSES.has(status);
  const isConnecting = CONNECTING_STATUSES.has(status);
  const canApply = APPLY_STATUSES.has(status);

  return (
    <div className="grid grid-cols-3 gap-2">
      <button
        className="rounded-md bg-cyan-300 px-3 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
        disabled={isRunning || isConnecting}
        onClick={onStart}
      >
        Start
      </button>
      <button
        className="rounded-md border border-white/15 px-3 py-2.5 text-sm font-semibold text-white transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
        disabled={!isRunning && !isConnecting}
        onClick={onStop}
      >
        Stop
      </button>
      <button
        className="rounded-md bg-white px-3 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
        disabled={!canApply}
        onClick={onApply}
      >
        Apply
      </button>
    </div>
  );
}
