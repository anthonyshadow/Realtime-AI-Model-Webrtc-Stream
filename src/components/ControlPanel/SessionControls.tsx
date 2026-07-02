import type { RealtimeStatus } from "../../types/realtime";
import {
  canApplyRealtimeStatus,
  isConnectingRealtimeStatus,
  isRunningRealtimeStatus,
} from "../../lib/realtimeStatus";
import { Button, type StudioButtonVariant } from "../StudioUI";

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
  const isRunning = isRunningRealtimeStatus(status);
  const isConnecting = isConnectingRealtimeStatus(status);
  const canApply = canApplyChanges && hasPendingChanges && canApplyRealtimeStatus(status);
  const startStopLabel = isRunning || isConnecting ? "Stop session" : startLabel;
  const startStopVariant: StudioButtonVariant =
    isRunning || isConnecting ? "danger" : "primary";
  const applyVariant: StudioButtonVariant = canApply ? "solid" : "secondary";

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        className="col-span-2"
        fullWidth
        onClick={isRunning || isConnecting ? onStop : onStart}
        variant={startStopVariant}
      >
        {startStopLabel}
      </Button>
      <Button
        disabled={!canApply || isApplying}
        fullWidth
        onClick={onApply}
        variant={applyVariant}
      >
        {isApplying ? "Applying" : "Apply"}
      </Button>
      <Button
        disabled={isApplying}
        fullWidth
        onClick={onReset}
        variant="secondary"
      >
        Reset
      </Button>
    </div>
  );
}
