import {
  isModelBackedSessionMode,
  type SessionModeId,
} from "../constants/sessionModes";
import type { SessionRecordingState } from "../hooks/useSessionRecording";
import type { RecordableStreamSource } from "./streamComposition";
import type { RealtimeStatus } from "../types/realtime";

export type RecordingDockLayout = "none" | "recorded" | "review" | "transport";

export type RecordingOverlayStateInput = {
  activeSessionMode: SessionModeId | null;
  filename: string | null;
  formError: string | null;
  hasRecordableStream: boolean;
  isDiscardConfirming: boolean;
  isRecording: boolean;
  isReviewExpanded: boolean;
  isSessionRunning: boolean;
  objectUrl: string | null;
  realtimeError: string | null;
  realtimeStatus: RealtimeStatus;
  recordableStreamSource: RecordableStreamSource;
  recordingState: SessionRecordingState;
};

export type RecordingOverlayState = {
  hasCriticalRecordingState: boolean;
  hasRecordingArtifact: boolean;
  recordingDockLayout: RecordingDockLayout;
  recordingStandbyMessage: string | undefined;
  shouldForceLiveOverlaysVisible: boolean;
  shouldRenderRecordingDock: boolean;
};

export function getRecordingOverlayState({
  activeSessionMode,
  filename,
  formError,
  hasRecordableStream,
  isDiscardConfirming,
  isRecording,
  isReviewExpanded,
  isSessionRunning,
  objectUrl,
  realtimeError,
  realtimeStatus,
  recordableStreamSource,
  recordingState,
}: RecordingOverlayStateInput): RecordingOverlayState {
  const hasRecordingArtifact =
    recordingState === "recorded" || Boolean(filename || objectUrl);
  const hasCriticalRecordingState =
    isRecording || recordingState === "stopping" || recordingState === "error";
  const shouldRenderRecordingDock =
    isSessionRunning || hasCriticalRecordingState || hasRecordingArtifact;
  const recordingDockLayout = getRecordingDockLayout({
    hasRecordingArtifact,
    isReviewExpanded,
    shouldRenderRecordingDock,
  });

  return {
    hasCriticalRecordingState,
    hasRecordingArtifact,
    recordingDockLayout,
    recordingStandbyMessage: getRecordingStandbyMessage({
      activeSessionMode,
      hasRecordableStream,
      isRunning: isSessionRunning,
      recordableStreamSource,
    }),
    shouldForceLiveOverlaysVisible:
      realtimeStatus === "error" ||
      isDiscardConfirming ||
      Boolean(formError ?? realtimeError) ||
      recordingState === "error",
    shouldRenderRecordingDock,
  };
}

function getRecordingDockLayout({
  hasRecordingArtifact,
  isReviewExpanded,
  shouldRenderRecordingDock,
}: {
  hasRecordingArtifact: boolean;
  isReviewExpanded: boolean;
  shouldRenderRecordingDock: boolean;
}): RecordingDockLayout {
  if (isReviewExpanded && hasRecordingArtifact) {
    return "review";
  }

  if (hasRecordingArtifact) {
    return "recorded";
  }

  return shouldRenderRecordingDock ? "transport" : "none";
}

function getRecordingStandbyMessage({
  activeSessionMode,
  hasRecordableStream,
  isRunning,
  recordableStreamSource,
}: {
  activeSessionMode: SessionModeId | null;
  hasRecordableStream: boolean;
  isRunning: boolean;
  recordableStreamSource: RecordableStreamSource;
}) {
  if (
    isRunning &&
    !hasRecordableStream &&
    recordableStreamSource === "none" &&
    isModelBackedSessionMode(activeSessionMode)
  ) {
    return "Waiting for model output before recording.";
  }

  return undefined;
}
