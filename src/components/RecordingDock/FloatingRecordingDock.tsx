import type { SessionRecordingState } from "../../hooks/useSessionRecording";
import { useAutoHideOverlay } from "../../hooks/useAutoHideOverlay";
import { RecordingDockButton } from "./RecordingDockButton";
import { RecordingPlaybackPanel } from "./RecordingPlaybackPanel";
import { RecordingStatusBadge } from "./RecordingStatusBadge";

const RECORDING_DOCK_IDLE_MS = 3000;

export type FloatingRecordingDockProps = {
  canRecord: boolean;
  completionMessage?: string | null;
  durationLabel: string;
  error: string | null;
  filename: string | null;
  hasRecordableStream: boolean;
  isRecording: boolean;
  isSessionActive: boolean;
  isSupported: boolean;
  objectUrl: string | null;
  sizeLabel: string;
  standbyMessage?: string;
  state: SessionRecordingState;
  onDeleteRecording: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
};

export function FloatingRecordingDock({
  canRecord,
  completionMessage,
  durationLabel,
  error,
  filename,
  hasRecordableStream,
  isRecording,
  isSessionActive,
  isSupported,
  objectUrl,
  sizeLabel,
  standbyMessage,
  state,
  onDeleteRecording,
  onStartRecording,
  onStopRecording,
}: FloatingRecordingDockProps) {
  const isStopping = state === "stopping";
  const hasRecordedClip = state === "recorded";
  const hasRecordingArtifact = hasRecordedClip || Boolean(filename || objectUrl);
  const hasCriticalRecordingState = isRecording || isStopping || state === "error";
  const shouldRenderDock =
    isSessionActive || hasCriticalRecordingState || hasRecordingArtifact;

  const { isVisible, rootProps } = useAutoHideOverlay<HTMLDivElement>({
    enabled: isSessionActive && !hasCriticalRecordingState,
    forceVisible: hasCriticalRecordingState,
    hideDelayMs: RECORDING_DOCK_IDLE_MS,
  });

  if (!shouldRenderDock) {
    return null;
  }

  const canStartRecording =
    hasRecordableStream && isSupported && canRecord && !isRecording;
  const status = getRecordingStatus({
    completionMessage,
    durationLabel,
    error,
    filename,
    hasRecordableStream,
    isSupported,
    sizeLabel,
    standbyMessage,
    state,
  });
  const visibilityClassName = isVisible
    ? "translate-y-0 opacity-100"
    : "pointer-events-none translate-y-4 opacity-0";
  const shellClassName = hasRecordedClip
    ? "rounded-[1.1rem]"
    : "rounded-full";
  const timerToneClassName = isRecording || isStopping
    ? "border-red-200/35 bg-red-500/15 text-red-50"
    : "border-white/10 bg-black/25 text-white";

  return (
    <div
      {...rootProps}
      aria-label="Recording dock"
      className={`fixed bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] left-1/2 z-20 w-[min(calc(100vw-1.5rem),34rem)] -translate-x-1/2 transition duration-300 ease-out sm:bottom-[calc(env(safe-area-inset-bottom)+1rem)] ${visibilityClassName}`}
      role="region"
    >
      <div
        className={`border border-white/15 bg-neutral-950/78 p-2 text-white shadow-[0_18px_60px_rgb(0_0_0/0.38)] backdrop-blur-xl ${shellClassName}`}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
          <div className="min-w-0 px-2 py-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-semibold uppercase text-cyan-100/70">
                Recorder
              </p>
              <RecordingStatusBadge label={status.badgeLabel} tone={status.tone} />
            </div>
            <p className="mt-1 truncate text-sm font-semibold text-white" aria-live="polite">
              {status.title}
            </p>
            <p
              className="mt-0.5 line-clamp-2 text-xs leading-5 text-neutral-300"
              role={status.tone === "error" ? "alert" : undefined}
            >
              {status.message}
            </p>
          </div>

          <div
            className={`rounded-full border px-3 py-2 text-right ${timerToneClassName}`}
          >
            <p className="text-[10px] font-medium uppercase text-neutral-400">Time</p>
            <p className="tabular-nums text-sm font-semibold">{durationLabel}</p>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <RecordingDockButton
              canStartRecording={canStartRecording}
              hasRecordedClip={hasRecordedClip}
              isRecording={isRecording}
              isStopping={isStopping}
              onStartRecording={onStartRecording}
              onStopRecording={onStopRecording}
            />
          </div>
        </div>

        {hasRecordedClip ? (
          <RecordingPlaybackPanel
            durationLabel={durationLabel}
            filename={filename}
            objectUrl={objectUrl}
            sizeLabel={sizeLabel}
            onDeleteRecording={onDeleteRecording}
          />
        ) : null}
      </div>
    </div>
  );
}

type RecordingStatusInput = Pick<
  FloatingRecordingDockProps,
  | "completionMessage"
  | "durationLabel"
  | "error"
  | "filename"
  | "hasRecordableStream"
  | "isSupported"
  | "sizeLabel"
  | "standbyMessage"
  | "state"
>;

function getRecordingStatus({
  completionMessage,
  durationLabel,
  error,
  filename,
  hasRecordableStream,
  isSupported,
  sizeLabel,
  standbyMessage,
  state,
}: RecordingStatusInput) {
  if (state === "recording") {
    return {
      badgeLabel: "REC",
      title: "Recording",
      message: "Capturing the current session output.",
      tone: "recording" as const,
    };
  }

  if (state === "stopping") {
    return {
      badgeLabel: "Saving",
      title: "Saving clip",
      message: "Finalizing the recording.",
      tone: "recording" as const,
    };
  }

  if (state === "recorded") {
    const clipDetails = [durationLabel, sizeLabel].filter(Boolean).join(" - ");

    return {
      badgeLabel: "Saved",
      title: "Clip captured",
      message: completionMessage ?? (filename
        ? `${filename} - ${clipDetails}`
        : "Review the latest recording when you are ready."),
      tone: "recorded" as const,
    };
  }

  if (state === "error") {
    if (!isSupported) {
      return {
        badgeLabel: "Blocked",
        title: "Unavailable",
        message: error ?? "Recording is not supported in this browser.",
        tone: "error" as const,
      };
    }

    return {
      badgeLabel: "Error",
      title: "Recorder error",
      message: error ?? "Recording failed. Try starting a new recording.",
      tone: "error" as const,
    };
  }

  if (!hasRecordableStream) {
    return {
      badgeLabel: "Waiting",
      title: "Standby",
      message: standbyMessage ?? "Start a session and wait for the stream to be ready.",
      tone: "standby" as const,
    };
  }

  if (!isSupported) {
    return {
      badgeLabel: "Blocked",
      title: "Unavailable",
      message: error ?? "Recording is not supported in this browser.",
      tone: "error" as const,
    };
  }

  return {
    badgeLabel: "Ready",
    title: "Ready",
    message: "Record this session when you are ready.",
    tone: "ready" as const,
  };
}
