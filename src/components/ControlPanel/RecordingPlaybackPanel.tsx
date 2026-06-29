export type RecordingPlaybackPanelProps = {
  durationLabel: string;
  filename: string | null;
  objectUrl: string | null;
  sizeLabel: string;
  onDeleteRecording: () => void;
};

export function RecordingPlaybackPanel({
  durationLabel,
  filename,
  objectUrl,
  sizeLabel,
  onDeleteRecording,
}: RecordingPlaybackPanelProps) {
  const hasRecording = Boolean(objectUrl && filename);

  return (
    <div
      aria-label="Recorded clip"
      className="mt-2.5 border-t border-white/10 pt-2.5"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase text-neutral-400">
            Playback
          </p>
          <p className="mt-0.5 truncate text-xs font-semibold text-white">
            {filename ?? "Recording ready"}
          </p>
        </div>
        <dl className="grid shrink-0 grid-cols-2 gap-1.5 text-right">
          <div>
            <dt className="text-[10px] font-medium uppercase text-neutral-500">Time</dt>
            <dd className="tabular-nums text-xs font-semibold text-white">{durationLabel}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium uppercase text-neutral-500">Size</dt>
            <dd className="text-xs font-semibold text-white">{sizeLabel}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-2 overflow-hidden rounded-md border border-white/10 bg-black/40">
        {objectUrl ? (
          <video
            aria-label="Recording playback"
            className="aspect-video w-full bg-black object-contain"
            controls
            playsInline
            preload="metadata"
            src={objectUrl}
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center bg-black text-xs text-neutral-400">
            Recording preview unavailable
          </div>
        )}
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        {hasRecording ? (
          <a
            className="rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
            download={filename ?? undefined}
            href={objectUrl ?? undefined}
          >
            Download
          </a>
        ) : (
          <button
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-neutral-950 opacity-50 disabled:cursor-not-allowed"
            disabled
            type="button"
          >
            Download
          </button>
        )}
        <button
          className="rounded-md border border-red-300/35 px-3 py-2 text-sm font-semibold text-red-50 transition hover:border-red-200/60 hover:bg-red-500/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
          type="button"
          onClick={onDeleteRecording}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
