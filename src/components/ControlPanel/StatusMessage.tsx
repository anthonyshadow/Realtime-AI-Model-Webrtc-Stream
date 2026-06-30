import {
  isModelBackedSessionMode,
  type SessionModeId,
} from "../../constants/sessionModes";
import type { RealtimeStatus } from "../../types/realtime";

type StatusMessageProps = {
  activeSessionMode: SessionModeId | null;
  error: string | null;
  hasPendingChanges: boolean;
  isApplying: boolean;
  selectedSessionMode: SessionModeId;
  status: RealtimeStatus;
};

export function StatusMessage({
  activeSessionMode,
  error,
  hasPendingChanges,
  isApplying,
  selectedSessionMode,
  status,
}: StatusMessageProps) {
  const message = getStatusMessage({
    activeSessionMode,
    error,
    hasPendingChanges,
    isApplying,
    selectedSessionMode,
    status,
  });
  const className = message.tone === "error"
    ? "border-red-300/30 bg-red-500/15 text-red-100"
    : message.tone === "active"
      ? "border-cyan-200/25 bg-cyan-300/10 text-cyan-50"
      : "border-white/10 bg-white/3 text-neutral-200";

  return (
    <div
      className={`rounded-md border px-3 py-2 ${className}`}
      role={message.tone === "error" ? "alert" : "status"}
    >
      <p className="text-[10px] font-semibold uppercase opacity-70">
        {message.label}
      </p>
      <p className="mt-0.5 text-xs leading-5">{message.body}</p>
    </div>
  );
}

function getStatusMessage({
  activeSessionMode,
  error,
  hasPendingChanges,
  isApplying,
  selectedSessionMode,
  status,
}: StatusMessageProps) {
  if (error) {
    return {
      body: error,
      label: "Needs attention",
      tone: "error" as const,
    };
  }

  if (isApplying) {
    return {
      body: "Sending the current prompt, image, and options to the model.",
      label: "Applying changes",
      tone: "active" as const,
    };
  }

  if (status === "requesting-camera") {
    return {
      body: "Waiting for camera and microphone access.",
      label: "Starting",
      tone: "active" as const,
    };
  }

  if (status === "requesting-token") {
    return {
      body: "Creating a temporary model session token.",
      label: "Starting",
      tone: "active" as const,
    };
  }

  if (status === "connecting") {
    return {
      body: "Connecting the camera stream to the selected model.",
      label: "Starting",
      tone: "active" as const,
    };
  }

  if (status === "reconnecting") {
    return {
      body: "Reconnecting the live model session.",
      label: "Reconnecting",
      tone: "active" as const,
    };
  }

  const runningMode = activeSessionMode ?? selectedSessionMode;

  if (hasPendingChanges) {
    return {
      body: "Apply the pending changes when you want to update the model output.",
      label: "Pending changes",
      tone: "active" as const,
    };
  }

  if (status === "connected" || status === "generating") {
    if (isModelBackedSessionMode(runningMode)) {
      return {
        body: "Model controls are synced. Adjust prompt or image when you want a new look.",
        label: "Model on",
        tone: "default" as const,
      };
    }

    return {
      body: "Local camera is on. Recording is available when the stream is ready.",
      label: "Camera on",
      tone: "default" as const,
    };
  }

  if (isModelBackedSessionMode(selectedSessionMode)) {
    return {
      body: "Add a prompt, image, or both, then start the model session.",
      label: "Next step",
      tone: "default" as const,
    };
  }

  return {
    body: "Start the local camera to preview without Decart or model usage.",
    label: "Next step",
    tone: "default" as const,
  };
}
