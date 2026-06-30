import { useEffect, useId, useState } from "react";

export type RecordingPlaybackPanelProps = {
  completionMessage?: string | null;
  durationLabel: string;
  filename: string | null;
  isExpanded: boolean;
  objectUrl: string | null;
  sizeLabel: string;
  onCollapse: () => void;
  onDiscardRecording: () => void;
  onExpand: () => void;
};

export function RecordingPlaybackPanel({
  completionMessage,
  durationLabel,
  filename,
  isExpanded,
  objectUrl,
  sizeLabel,
  onCollapse,
  onDiscardRecording,
  onExpand,
}: RecordingPlaybackPanelProps) {
  const hasRecording = Boolean(objectUrl && filename);
  const playbackDescriptionId = useId();
  const reviewMessageId = useId();
  const [isConfirmingDiscard, setIsConfirmingDiscard] = useState(false);

  useEffect(() => {
    setIsConfirmingDiscard(false);
  }, [filename, isExpanded, objectUrl]);

  const reviewMessage =
    completionMessage ?? "Watch, download, or discard this local recording.";

  if (!isExpanded) {
    return (
      <div
        aria-label="Recording review collapsed"
        className="mt-2.5 border-t border-white/10 px-1 pt-2.5"
        role="region"
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase text-cyan-100/70">
              Review take
            </p>
            <p className="mt-0.5 truncate text-xs font-semibold text-white">
              {filename ?? "Recording ready"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {hasRecording ? (
              <a
                className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
                download={filename ?? undefined}
                href={objectUrl ?? undefined}
              >
                Download
              </a>
            ) : null}
            <button
              className="rounded-md border border-white/15 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
              type="button"
              onClick={onExpand}
            >
              Review
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section
      aria-describedby={reviewMessageId}
      aria-label="Recording review"
      className="mt-2.5 border-t border-white/10 px-1 pt-3"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase text-cyan-100/70">
            Review take
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold text-white">
            {filename ?? "Recording ready"}
          </p>
          <p id={reviewMessageId} className="mt-1 text-xs leading-5 text-neutral-300">
            {reviewMessage}
          </p>
        </div>
        <button
          className="rounded-md border border-white/15 px-3 py-2 text-xs font-semibold text-neutral-200 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
          type="button"
          onClick={onCollapse}
        >
          Collapse
        </button>
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div className="min-w-0 rounded-md border border-white/10 bg-white/5 px-2.5 py-2">
          <dt className="text-[10px] font-medium uppercase text-neutral-400">Time</dt>
          <dd className="mt-0.5 tabular-nums font-semibold text-white">{durationLabel}</dd>
        </div>
        <div className="min-w-0 rounded-md border border-white/10 bg-white/5 px-2.5 py-2">
          <dt className="text-[10px] font-medium uppercase text-neutral-400">Size</dt>
          <dd className="mt-0.5 truncate font-semibold text-white">{sizeLabel}</dd>
        </div>
        <div className="min-w-0 rounded-md border border-white/10 bg-white/5 px-2.5 py-2">
          <dt className="text-[10px] font-medium uppercase text-neutral-400">Source</dt>
          <dd className="mt-0.5 truncate font-semibold text-white">Local file</dd>
        </div>
      </dl>

      <p id={playbackDescriptionId} className="sr-only">
        {filename
          ? `Recorded clip ${filename}, duration ${durationLabel}, size ${sizeLabel}.`
          : "Recorded clip preview."}
      </p>
      <div className="mt-3 overflow-hidden rounded-md border border-white/10 bg-black/55 shadow-inner">
        {objectUrl ? (
          <video
            aria-label="Recording playback"
            aria-describedby={playbackDescriptionId}
            className="aspect-video max-h-[min(48vh,22rem)] w-full bg-black object-contain"
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

      {isConfirmingDiscard ? (
        <div
          aria-live="polite"
          className="mt-3 grid gap-2 rounded-md border border-red-300/25 bg-red-500/10 p-2.5 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"
        >
          <p className="text-xs leading-5 text-red-50">
            Discard this take? This removes the local clip only.
          </p>
          <button
            className="rounded-md border border-white/15 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
            type="button"
            onClick={() => setIsConfirmingDiscard(false)}
          >
            Keep
          </button>
          <button
            className="rounded-md bg-red-200 px-3 py-2 text-sm font-semibold text-red-950 transition hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
            type="button"
            onClick={onDiscardRecording}
          >
            Discard clip
          </button>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
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
            onClick={() => setIsConfirmingDiscard(true)}
          >
            Discard
          </button>
        </div>
      )}
    </section>
  );
}
