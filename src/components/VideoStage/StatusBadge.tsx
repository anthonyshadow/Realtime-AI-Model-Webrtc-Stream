import type { RealtimeStatus } from "../../types/realtime";

const STATUS_LABELS: Record<RealtimeStatus, string> = {
  idle: "Idle",
  "requesting-camera": "Camera",
  "requesting-token": "Token",
  connecting: "Connecting",
  connected: "Connected",
  generating: "Generating",
  reconnecting: "Reconnecting",
  disconnected: "Disconnected",
  error: "Error",
};

const ACTIVE_STATUSES = new Set<RealtimeStatus>(["connected", "generating"]);

type StatusBadgeProps = {
  status: RealtimeStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const isActive = ACTIVE_STATUSES.has(status);
  const isError = status === "error";
  const colorClass = isError
    ? "border-red-400/50 bg-red-500/15 text-red-100"
    : isActive
      ? "border-emerald-300/50 bg-emerald-400/15 text-emerald-100"
      : "border-white/15 bg-black/35 text-neutral-200";

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur-md ${colorClass}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-300" : "bg-neutral-400"}`}
      />
      {STATUS_LABELS[status]}
    </div>
  );
}
