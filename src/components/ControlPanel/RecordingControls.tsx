import type { SessionRecordingState } from "../../hooks/useSessionRecording";
import { RecordingPlaybackPanel } from "./RecordingPlaybackPanel";

export type RecordingControlsProps = {
  canRecord: boolean;
  durationLabel: string;
  error: string | null;
  filename: string | null;
  hasRecordableStream: boolean;
  isRecording: boolean;
  isSupported: boolean;
  objectUrl: string | null;
  sizeLabel: string;
  standbyMessage?: string;
  state: SessionRecordingState;
  onDeleteRecording: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
};

export function RecordingControls({
  canRecord,
  durationLabel,
  error,
  filename,
  hasRecordableStream,
  isRecording,
  isSupported,
  objectUrl,
  sizeLabel,
  standbyMessage,
  state,
  onDeleteRecording,
  onStartRecording,
  onStopRecording,
}: RecordingControlsProps) {
  const isActive = state === "recording";
  const isStopping = state === "stopping";
  const hasRecordedClip = state === "recorded";
  const canStartRecording = hasRecordableStream && isSupported && canRecord && !isRecording;
  const status = getRecordingStatus({
    durationLabel,
    error,
    filename,
    hasRecordableStream,
    isSupported,
    sizeLabel,
    standbyMessage,
    state,
  });
  const containerClassName = isActive || isStopping
    ? "border-red-300/35 bg-red-500/10 shadow-[0_0_0_1px_rgb(248_113_113/0.08)]"
    : hasRecordedClip
      ? "border-cyan-200/20 bg-cyan-300/5"
      : "border-white/10 bg-white/3";
  const railClassName = isActive
    ? "bg-red-300 shadow-[0_0_18px_rgb(252_165_165/0.95)]"
    : isStopping
      ? "bg-red-200"
      : hasRecordedClip
        ? "bg-cyan-200/70"
        : "bg-white/15";
  const badgeClassName = getRecordingBadgeClassName(status.tone);
  const buttonClassName = isRecording
    ? "border border-red-200/45 bg-red-500/25 text-red-50 hover:border-red-100/70 hover:bg-red-500/35"
    : "bg-white text-neutral-950 hover:bg-neutral-200";

  return (
    <section
      aria-label="Recording controls"
      className={`relative overflow-hidden rounded-md border transition ${containerClassName}`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-1 transition ${railClassName}`}
      />
      <div className="p-2.5 pl-3.5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                aria-hidden="true"
                className={`h-2 w-2 rounded-full ${
                  isActive
                    ? "motion-safe:animate-pulse bg-red-300 shadow-[0_0_14px_rgb(252_165_165/0.85)]"
                    : isStopping
                      ? "bg-red-200"
                      : "bg-neutral-500"
                }`}
              />
              <p className="text-[10px] font-medium uppercase text-neutral-400">
                Recording
              </p>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase leading-none ${badgeClassName}`}
              >
                {status.badgeLabel}
              </span>
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

          <div className="shrink-0 rounded-md border border-white/10 bg-black/25 px-2.5 py-1.5 text-right">
            <p className="text-[10px] font-medium uppercase text-neutral-400">Clip</p>
            <p className="tabular-nums text-xs font-semibold text-white">{durationLabel}</p>
          </div>
        </div>

        <button
          className={`mt-2.5 w-full rounded-md px-3 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 disabled:cursor-not-allowed disabled:opacity-50 ${buttonClassName}`}
          type="button"
          disabled={isRecording ? isStopping : !canStartRecording}
          onClick={isRecording ? onStopRecording : onStartRecording}
        >
          {isRecording
            ? (isStopping ? "Stopping recording" : "Stop recording")
            : hasRecordedClip
              ? "Record again"
              : "Record"}
        </button>
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
    </section>
  );
}

type RecordingStatusInput = Pick<
  RecordingControlsProps,
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
      badgeLabel: "Rec",
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
      message: filename ? `${filename} - ${clipDetails}` : clipDetails,
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

function getRecordingBadgeClassName(
  tone: "error" | "ready" | "recorded" | "recording" | "standby",
) {
  if (tone === "error") {
    return "border-red-300/35 bg-red-500/15 text-red-100";
  }

  if (tone === "recording") {
    return "border-red-200/45 bg-red-500/20 text-red-50";
  }

  if (tone === "recorded") {
    return "border-cyan-200/35 bg-cyan-300/10 text-cyan-100";
  }

  if (tone === "ready") {
    return "border-emerald-200/35 bg-emerald-300/10 text-emerald-100";
  }

  return "border-white/12 bg-white/5 text-neutral-300";
}
