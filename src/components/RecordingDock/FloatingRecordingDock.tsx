import { useCallback, useEffect, useState } from "react";
import {
  studioClassNames,
  studioOverlayZIndex,
  studioPanelWidths,
} from "../../constants/design";
import type { SessionRecordingState } from "../../hooks/useSessionRecording";
import {
  useAutoHideOverlay,
  type AutoHideOverlayRootProps,
} from "../../hooks/useAutoHideOverlay";
import { cx } from "../StudioUI/classNames";
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
  isVisible?: boolean;
  isRecording: boolean;
  isSessionActive: boolean;
  isSupported: boolean;
  objectUrl: string | null;
  overlayProps?: AutoHideOverlayRootProps<HTMLElement>;
  sizeLabel: string;
  standbyMessage?: string;
  state: SessionRecordingState;
  onDiscardConfirmingChange?: (isConfirming: boolean) => void;
  onDiscardRecording: () => void;
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
  isVisible: controlledIsVisible,
  isRecording,
  isSessionActive,
  isSupported,
  objectUrl,
  overlayProps: controlledOverlayProps,
  sizeLabel,
  standbyMessage,
  state,
  onDiscardConfirmingChange,
  onDiscardRecording,
  onStartRecording,
  onStopRecording,
}: FloatingRecordingDockProps) {
  const isStopping = state === "stopping";
  const hasRecordedClip = state === "recorded";
  const hasRecordingArtifact = hasRecordedClip || Boolean(filename || objectUrl);
  const hasRecordingError = state === "error";
  const hasCriticalRecordingState = isRecording || isStopping || hasRecordingError;
  const shouldRenderDock =
    isSessionActive || hasCriticalRecordingState || hasRecordingArtifact;
  const [isReviewExpanded, setIsReviewExpanded] = useState(true);
  const [isDiscardConfirming, setIsDiscardConfirming] = useState(false);
  const isVisibilityControlled =
    controlledIsVisible !== undefined && controlledOverlayProps !== undefined;
  const handleDiscardConfirmingChange = useCallback(
    (isConfirming: boolean) => {
      setIsDiscardConfirming(isConfirming);
      onDiscardConfirmingChange?.(isConfirming);
    },
    [onDiscardConfirmingChange],
  );

  const { isVisible, rootProps } = useAutoHideOverlay<HTMLDivElement>({
    enabled:
      !isVisibilityControlled &&
      isSessionActive &&
      !hasRecordingError &&
      !isDiscardConfirming,
    forceVisible: hasRecordingError || isDiscardConfirming,
    hideDelayMs: RECORDING_DOCK_IDLE_MS,
  });
  const resolvedIsVisible = controlledIsVisible ?? isVisible;
  const resolvedRootProps = controlledOverlayProps ?? rootProps;

  useEffect(() => {
    if (hasRecordedClip) {
      setIsReviewExpanded(true);
    }
  }, [filename, hasRecordedClip, objectUrl]);

  useEffect(() => {
    if (hasRecordingArtifact) {
      return;
    }

    handleDiscardConfirmingChange(false);
  }, [handleDiscardConfirmingChange, hasRecordingArtifact]);

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
  const visibilityClassName = resolvedIsVisible
    ? "translate-y-0 opacity-100"
    : "pointer-events-none translate-y-4 opacity-0";
  const shellClassName = hasRecordedClip
    ? "rounded-t-[1.25rem] sm:rounded-[1.1rem]"
    : "rounded-2xl sm:rounded-full";
  const dockWidthClassName = hasRecordedClip
    ? "w-full sm:w-[min(calc(100vw-2rem),42rem)]"
    : "w-[min(calc(100vw-1.5rem),34rem)]";
  const dockScrollClassName = hasRecordedClip
    ? "max-h-[calc(100dvh-env(safe-area-inset-bottom)-0.5rem)] overflow-y-auto overscroll-contain sm:max-h-[calc(100dvh-env(safe-area-inset-bottom)-2rem)]"
    : "";
  const dockPositionClassName = hasRecordedClip
    ? "bottom-0 sm:bottom-[calc(env(safe-area-inset-bottom)+1rem)]"
    : "bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:bottom-[calc(env(safe-area-inset-bottom)+1rem)]";
  const timerToneClassName = isRecording || isStopping
    ? "border-red-200/35 bg-red-500/15 text-red-50"
    : "border-white/10 bg-black/25 text-white";

  return (
    <div
      {...resolvedRootProps}
      aria-label="Recording dock"
      className={cx(
        "fixed left-1/2 -translate-x-1/2",
        studioClassNames.overlayMotion,
        dockPositionClassName,
        dockWidthClassName,
        dockScrollClassName,
        visibilityClassName,
      )}
      role="region"
      style={{
        maxWidth: hasRecordedClip
          ? studioPanelWidths.reviewSheet
          : studioPanelWidths.recorderBar,
        zIndex: studioOverlayZIndex.recorder,
      }}
    >
      <div
        className={`border border-white/15 bg-neutral-950/82 p-2 text-white shadow-[0_18px_60px_rgb(0_0_0/0.38)] backdrop-blur-xl ${shellClassName}`}
      >
        <div
          className={cx(
            "grid items-center gap-2",
            hasRecordedClip
              ? "grid-cols-[minmax(0,1fr)] sm:grid-cols-[minmax(0,1fr)_auto_auto]"
              : "grid-cols-[minmax(0,1fr)] sm:grid-cols-[minmax(0,1fr)_auto_auto]",
          )}
        >
          <div className="min-w-0 px-2 py-1.5">
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
              className="mt-0.5 line-clamp-2 text-xs leading-5 text-neutral-300 sm:line-clamp-1"
              role={status.tone === "error" ? "alert" : undefined}
            >
              {status.message}
            </p>
          </div>

          <div
            className={`flex min-h-11 items-center justify-between rounded-full border px-3 py-2 text-left sm:block sm:text-right ${timerToneClassName}`}
          >
            <p className="text-[10px] font-medium uppercase text-neutral-400">Time</p>
            <p className="tabular-nums text-sm font-semibold">{durationLabel}</p>
          </div>

          <div className="min-w-0">
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
            completionMessage={completionMessage}
            durationLabel={durationLabel}
            filename={filename}
            isExpanded={isReviewExpanded}
            objectUrl={objectUrl}
            sizeLabel={sizeLabel}
            onCollapse={() => setIsReviewExpanded(false)}
            onDiscardConfirmingChange={handleDiscardConfirmingChange}
            onDiscardRecording={onDiscardRecording}
            onExpand={() => setIsReviewExpanded(true)}
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
      message: completionMessage
        ? "Model session ended. Local camera remains on."
        : filename
          ? `${filename} - ${clipDetails}`
          : "Review the latest recording when you are ready.",
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
