import type { RealtimeStatus } from "../../types/realtime";
import {
  getRealtimeStatusBadgeLabel,
  getRealtimeStatusBadgeTone,
} from "../../lib/realtimeStatus";
import { StatusPill, type StatusPillTone } from "../StudioUI";

type StatusBadgeProps = {
  status: RealtimeStatus;
};

const STATUS_PILL_TONES = {
  active: "success",
  error: "error",
  neutral: "neutral",
} satisfies Record<ReturnType<typeof getRealtimeStatusBadgeTone>, StatusPillTone>;

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <StatusPill
      label={getRealtimeStatusBadgeLabel(status)}
      tone={STATUS_PILL_TONES[getRealtimeStatusBadgeTone(status)]}
    />
  );
}
