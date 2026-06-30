import type { SessionModeId } from "../../constants/sessionModes";
import type { RealtimeStatus } from "../../types/realtime";
import { ControlPanelSection } from "./ControlPanelSection";
import { SessionModeSelector } from "./SessionModeSelector";
import { StatusMessage } from "./StatusMessage";
import { StatusSummary } from "./StatusSummary";

type SessionSetupSectionProps = {
  activeSessionMode: SessionModeId | null;
  canChangeSessionMode: boolean;
  error: string | null;
  hasPendingChanges: boolean;
  isApplying: boolean;
  sessionMode: SessionModeId;
  status: RealtimeStatus;
  onSessionModeChange: (value: SessionModeId) => void;
};

export function SessionSetupSection({
  activeSessionMode,
  canChangeSessionMode,
  error,
  hasPendingChanges,
  isApplying,
  sessionMode,
  status,
  onSessionModeChange,
}: SessionSetupSectionProps) {
  return (
    <ControlPanelSection
      description="Pick local preview or a Decart model before starting. Mode switches unlock after stopping."
      eyebrow="Setup"
      title="Choose the session"
    >
      {canChangeSessionMode ? (
        <SessionModeSelector
          disabled={false}
          value={sessionMode}
          onChange={onSessionModeChange}
        />
      ) : null}
      <StatusSummary
        activeSessionMode={activeSessionMode}
        hasPendingChanges={hasPendingChanges}
        isApplying={isApplying}
        selectedSessionMode={sessionMode}
        status={status}
      />
      <StatusMessage
        activeSessionMode={activeSessionMode}
        error={error}
        hasPendingChanges={hasPendingChanges}
        isApplying={isApplying}
        selectedSessionMode={sessionMode}
        status={status}
      />
    </ControlPanelSection>
  );
}
