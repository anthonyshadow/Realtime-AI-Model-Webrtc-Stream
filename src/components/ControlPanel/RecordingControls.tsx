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
    state,
  });
  const containerClassName = isActive || isStopping
    ? "border-red-300/35 bg-red-500/10 shadow-[0_0_0_1px_rgb(248_113_113/0.08)]"
    : "border-white/10 bg-white/3";
  const buttonClassName = isRecording
    ? "border border-red-200/45 bg-red-500/25 text-red-50 hover:border-red-100/70 hover:bg-red-500/35"
    : "bg-white text-neutral-950 hover:bg-neutral-200";

  return (
    <section
      aria-label="Recording controls"
      className={`rounded-md border p-2.5 transition ${containerClassName}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
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
          </div>
          <p className="mt-1 truncate text-sm font-semibold text-white" aria-live="polite">
            {status.title}
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-neutral-300">
            {status.message}
          </p>
        </div>

        <div className="shrink-0 rounded-md border border-white/10 bg-black/25 px-2.5 py-1.5 text-right">
          <p className="text-[10px] font-medium uppercase text-neutral-500">Clip</p>
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
  | "state"
>;

function getRecordingStatus({
  durationLabel,
  error,
  filename,
  hasRecordableStream,
  isSupported,
  sizeLabel,
  state,
}: RecordingStatusInput) {
  if (!hasRecordableStream) {
    return {
      title: "Standby",
      message: "Start a session and wait for the stream to be ready.",
    };
  }

  if (!isSupported) {
    return {
      title: "Unavailable",
      message: error ?? "Recording is not supported in this browser.",
    };
  }

  if (state === "recording") {
    return {
      title: "Recording",
      message: "Capturing the current session output.",
    };
  }

  if (state === "stopping") {
    return {
      title: "Saving clip",
      message: "Finalizing the recording.",
    };
  }

  if (state === "recorded") {
    const clipDetails = [durationLabel, sizeLabel].filter(Boolean).join(" - ");

    return {
      title: "Clip captured",
      message: filename ? `${filename} - ${clipDetails}` : clipDetails,
    };
  }

  if (state === "error") {
    return {
      title: "Recorder error",
      message: error ?? "Recording failed. Try starting a new recording.",
    };
  }

  return {
    title: "Ready",
    message: "Record this session when you are ready.",
  };
}
