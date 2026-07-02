import type { SessionRecordingState } from "../../hooks/useSessionRecording";
import { getStudioErrorDescriptor } from "../../lib/errors";

export type RecordingDockStatusTone =
  | "error"
  | "ready"
  | "recorded"
  | "recording"
  | "standby";

export type RecordingDockStatusInput = {
  completionMessage?: string | null;
  durationLabel: string;
  filename: string | null;
  hasRecordableStream: boolean;
  isSupported: boolean;
  sizeLabel: string;
  standbyMessage?: string;
  state: SessionRecordingState;
};

export type RecordingDockStatus = {
  badgeLabel: string;
  message: string;
  title: string;
  tone: RecordingDockStatusTone;
};

export function getRecordingStatus({
  completionMessage,
  durationLabel,
  filename,
  hasRecordableStream,
  isSupported,
  sizeLabel,
  standbyMessage,
  state,
}: RecordingDockStatusInput): RecordingDockStatus {
  if (state === "recording") {
    return {
      badgeLabel: "REC",
      title: "Recording",
      message: "Capturing the current session output.",
      tone: "recording",
    };
  }

  if (state === "stopping") {
    return {
      badgeLabel: "Saving",
      title: "Saving clip",
      message: "Finalizing the recording.",
      tone: "recording",
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
      tone: "recorded",
    };
  }

  if (state === "error") {
    if (!isSupported) {
      return {
        badgeLabel: "Blocked",
        title: "Unavailable",
        message: "Use a browser with recording support.",
        tone: "error",
      };
    }

    return {
      badgeLabel: "Error",
      title: "Recorder error",
      message: "Use the recovery action below.",
      tone: "error",
    };
  }

  if (!hasRecordableStream) {
    return {
      badgeLabel: "Waiting",
      title: "Standby",
      message: standbyMessage ?? "Start a session and wait for the stream to be ready.",
      tone: "standby",
    };
  }

  if (!isSupported) {
    return {
      badgeLabel: "Blocked",
      title: "Unavailable",
      message: "Use a browser with recording support.",
      tone: "error",
    };
  }

  return {
    badgeLabel: "Ready",
    title: "Ready",
    message: "Record this session when you are ready.",
    tone: "ready",
  };
}

export function getRecordingErrorDescriptor({
  error,
  isSupported,
}: {
  error: string | null;
  isSupported: boolean;
}) {
  if (!isSupported) {
    return {
      kind: "recording" as const,
      title: "Recording unavailable",
      message: "Recording is not supported in this browser.",
    };
  }

  return getStudioErrorDescriptor(error ?? "Recording failed.", "recording");
}
