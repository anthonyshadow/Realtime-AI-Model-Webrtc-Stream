type RecordingDockButtonProps = {
  canStartRecording: boolean;
  hasRecordedClip: boolean;
  isRecording: boolean;
  isStopping: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
};

export function RecordingDockButton({
  canStartRecording,
  hasRecordedClip,
  isRecording,
  isStopping,
  onStartRecording,
  onStopRecording,
}: RecordingDockButtonProps) {
  const buttonClassName = isRecording
    ? "border border-red-200/45 bg-red-500/25 text-red-50 hover:border-red-100/70 hover:bg-red-500/35"
    : hasRecordedClip
      ? "border border-cyan-200/45 bg-cyan-300/15 text-cyan-50 hover:border-cyan-100/70 hover:bg-cyan-300/25"
      : "bg-white text-neutral-950 hover:bg-neutral-200";
  const buttonLabel = isRecording
    ? (isStopping ? "Stopping recording" : "Stop recording")
    : hasRecordedClip
      ? "Record again"
      : "Record";

  return (
    <button
      className={`min-h-11 w-full rounded-full px-4 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${buttonClassName}`}
      type="button"
      disabled={isRecording ? isStopping : !canStartRecording}
      onClick={isRecording ? onStopRecording : onStartRecording}
    >
      {buttonLabel}
    </button>
  );
}
