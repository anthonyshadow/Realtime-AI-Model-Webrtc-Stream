import { describe, expect, it } from "vitest";
import {
  REALTIME_STATUS_ORDER,
  canApplyRealtimeStatus,
  getRealtimeStatusBadgeLabel,
  getRealtimeStatusBadgeTone,
  getRealtimeStatusSummaryLabel,
  isAutoHideableRealtimeStatus,
  isConnectingRealtimeStatus,
  isRunningRealtimeStatus,
} from "./realtimeStatus";
import type { RealtimeStatus } from "../types/realtime";

const expectedStatuses: RealtimeStatus[] = [
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

describe("realtimeStatus", () => {
  it("keeps an exhaustive display order for realtime statuses", () => {
    expect(REALTIME_STATUS_ORDER).toEqual(expectedStatuses);
  });

  it.each([
    ["idle", false, false, false, false],
    ["requesting-camera", false, true, false, false],
    ["requesting-token", false, true, false, false],
    ["connecting", false, true, false, false],
    ["connected", true, false, true, true],
    ["generating", true, false, true, true],
    ["reconnecting", true, false, false, true],
    ["disconnected", false, false, false, false],
    ["error", false, false, false, false],
  ] satisfies Array<[RealtimeStatus, boolean, boolean, boolean, boolean]>)(
    "maps predicates for %s",
    (status, isRunning, isConnecting, canApply, canAutoHide) => {
      expect(isRunningRealtimeStatus(status)).toBe(isRunning);
      expect(isConnectingRealtimeStatus(status)).toBe(isConnecting);
      expect(canApplyRealtimeStatus(status)).toBe(canApply);
      expect(isAutoHideableRealtimeStatus(status)).toBe(canAutoHide);
    },
  );

  it.each([
    ["idle", "Idle", "Idle", "neutral"],
    ["requesting-camera", "Camera", "Camera", "neutral"],
    ["requesting-token", "Token", "Token", "neutral"],
    ["connecting", "Connecting", "Connecting", "neutral"],
    ["connected", "Connected", "Live", "active"],
    ["generating", "Generating", "Generating", "active"],
    ["reconnecting", "Reconnecting", "Reconnecting", "neutral"],
    ["disconnected", "Disconnected", "Stopped", "neutral"],
    ["error", "Error", "Error", "error"],
  ] satisfies Array<[RealtimeStatus, string, string, string]>)(
    "maps labels and badge tone for %s",
    (status, badgeLabel, summaryLabel, badgeTone) => {
      expect(getRealtimeStatusBadgeLabel(status)).toBe(badgeLabel);
      expect(getRealtimeStatusSummaryLabel(status)).toBe(summaryLabel);
      expect(getRealtimeStatusBadgeTone(status)).toBe(badgeTone);
    },
  );
});
