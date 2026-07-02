import type { RealtimeStatus } from "../types/realtime";

export const REALTIME_STATUS_ORDER: readonly RealtimeStatus[] = [
  "idle",
  "requesting-camera",
  "requesting-token",
  "connecting",
  "connected",
  "generating",
  "reconnecting",
  "disconnected",
  "error",
];

export type RealtimeStatusBadgeTone = "active" | "error" | "neutral";

const RUNNING_STATUSES = new Set<RealtimeStatus>([
  "connected",
  "generating",
  "reconnecting",
]);

const CONNECTING_STATUSES = new Set<RealtimeStatus>([
  "requesting-camera",
  "requesting-token",
  "connecting",
]);

const APPLY_STATUSES = new Set<RealtimeStatus>(["connected", "generating"]);

const BADGE_LABELS: Record<RealtimeStatus, string> = {
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

const SUMMARY_LABELS: Record<RealtimeStatus, string> = {
  ...BADGE_LABELS,
  connected: "Live",
  disconnected: "Stopped",
};

export function isRunningRealtimeStatus(status: RealtimeStatus) {
  return RUNNING_STATUSES.has(status);
}

export function isConnectingRealtimeStatus(status: RealtimeStatus) {
  return CONNECTING_STATUSES.has(status);
}

export function canApplyRealtimeStatus(status: RealtimeStatus) {
  return APPLY_STATUSES.has(status);
}

export function isAutoHideableRealtimeStatus(status: RealtimeStatus) {
  return isRunningRealtimeStatus(status);
}

export function getRealtimeStatusBadgeLabel(status: RealtimeStatus) {
  return BADGE_LABELS[status];
}

export function getRealtimeStatusBadgeTone(
  status: RealtimeStatus,
): RealtimeStatusBadgeTone {
  if (status === "error") {
    return "error";
  }

  return canApplyRealtimeStatus(status) ? "active" : "neutral";
}

export function getRealtimeStatusSummaryLabel(status: RealtimeStatus) {
  return SUMMARY_LABELS[status];
}
