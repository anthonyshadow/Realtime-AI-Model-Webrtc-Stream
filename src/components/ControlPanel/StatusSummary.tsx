import { getModelConfig, type SupportedModelMode } from "../../constants/models";
import type { RealtimeStatus } from "../../types/realtime";

type StatusSummaryProps = {
  activeModelMode: SupportedModelMode | null;
  hasPendingChanges: boolean;
  isApplying: boolean;
  selectedModelMode: SupportedModelMode;
  status: RealtimeStatus;
};

const STATUS_LABELS: Record<RealtimeStatus, string> = {
  idle: "Idle",
  "requesting-camera": "Camera",
  "requesting-token": "Token",
  connecting: "Connecting",
  connected: "Live",
  generating: "Generating",
  reconnecting: "Reconnecting",
  disconnected: "Stopped",
  error: "Error",
};

export function StatusSummary({
  activeModelMode,
  hasPendingChanges,
  isApplying,
  selectedModelMode,
  status,
}: StatusSummaryProps) {
  const modelConfig = getModelConfig(activeModelMode ?? selectedModelMode);
  const isIdle = status === "idle" || status === "disconnected";
  const changeLabel = isIdle ? "Ready" : isApplying ? "Sending" : hasPendingChanges ? "Pending" : "Synced";

  return (
    <div className="grid grid-cols-3 gap-1.5">
      <StatusCell label="Model" value={modelConfig.shortLabel} />
      <StatusCell
        label="Session"
        value={STATUS_LABELS[status]}
        tone={status === "error" ? "error" : "default"}
      />
      <StatusCell
        label="Changes"
        value={changeLabel}
        tone={hasPendingChanges || isApplying ? "active" : "default"}
      />
    </div>
  );
}

type StatusCellProps = {
  label: string;
  value: string;
  tone?: "active" | "default" | "error";
};

function StatusCell({ label, value, tone = "default" }: StatusCellProps) {
  const valueClassName =
    tone === "error"
      ? "text-red-100"
      : tone === "active"
        ? "text-cyan-100"
        : "text-white";

  return (
    <div className="min-w-0 rounded-md border border-white/10 bg-black/25 px-2.5 py-2">
      <p className="text-[10px] font-medium uppercase text-neutral-400">{label}</p>
      <p className={`mt-0.5 truncate text-xs font-semibold ${valueClassName}`}>{value}</p>
    </div>
  );
}
