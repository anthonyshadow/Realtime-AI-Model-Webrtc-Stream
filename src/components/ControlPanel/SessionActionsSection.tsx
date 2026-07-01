import type { RealtimeStatus } from "../../types/realtime";
import { ControlPanelSection } from "./ControlPanelSection";
import { SessionControls } from "./SessionControls";

type SessionActionsSectionProps = {
  canApplyChanges: boolean;
  hasPendingChanges: boolean;
  isApplying: boolean;
  startLabel: string;
  status: RealtimeStatus;
  onApply: () => void;
  onReset: () => void;
  onStart: () => void;
  onStop: () => void;
};

export function SessionActionsSection({
  canApplyChanges,
  hasPendingChanges,
  isApplying,
  startLabel,
  status,
  onApply,
  onReset,
  onStart,
  onStop,
}: SessionActionsSectionProps) {
  return (
    <ControlPanelSection
      eyebrow="Actions"
      title={canApplyChanges ? "Apply or stop" : "Session"}
    >
      <SessionControls
        canApplyChanges={canApplyChanges}
        hasPendingChanges={hasPendingChanges}
        isApplying={isApplying}
        startLabel={startLabel}
        status={status}
        onReset={onReset}
        onStart={onStart}
        onStop={onStop}
        onApply={onApply}
      />
    </ControlPanelSection>
  );
}
