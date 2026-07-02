import {
  getSessionModeConfig,
  type SessionModeId,
} from "../../constants/sessionModes";
import { getRealtimeStatusSummaryLabel } from "../../lib/realtimeStatus";
import type { RealtimeStatus } from "../../types/realtime";
import { MetricCard, type MetricCardTone } from "../StudioUI";

type StatusSummaryProps = {
  activeSessionMode: SessionModeId | null;
  hasPendingChanges: boolean;
  isApplying: boolean;
  selectedSessionMode: SessionModeId;
  status: RealtimeStatus;
};

export function StatusSummary({
  activeSessionMode,
  hasPendingChanges,
  isApplying,
  selectedSessionMode,
  status,
}: StatusSummaryProps) {
  const sessionConfig = getSessionModeConfig(activeSessionMode ?? selectedSessionMode);
  const isIdle = status === "idle" || status === "disconnected";
  const changeLabel = isIdle ? "Ready" : isApplying ? "Sending" : hasPendingChanges ? "Pending" : "Synced";

  return (
    <div className="grid grid-cols-3 gap-1.5">
      <StatusCell label="Mode" value={sessionConfig.shortLabel} />
      <StatusCell
        label="Session"
        value={getRealtimeStatusSummaryLabel(status)}
        tone={status === "error" ? "danger" : "default"}
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
  tone?: Extract<MetricCardTone, "active" | "danger" | "default">;
};

function StatusCell({ label, value, tone = "default" }: StatusCellProps) {
  return (
    <MetricCard density="compact" label={label} tone={tone} value={value} />
  );
}
