import { useEffect, useId, useState } from "react";
import { studioClassNames } from "../../constants/design";
import {
  DangerButton,
  MetricCard,
  SecondaryButton,
} from "../StudioUI";
import { cx } from "../StudioUI/classNames";

export type RecordingPlaybackPanelProps = {
  completionMessage?: string | null;
  durationLabel: string;
  filename: string | null;
  isExpanded: boolean;
  objectUrl: string | null;
  sizeLabel: string;
  onCollapse: () => void;
  onDiscardConfirmingChange?: (isConfirming: boolean) => void;
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
  onDiscardConfirmingChange,
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

  useEffect(() => {
    onDiscardConfirmingChange?.(isConfirmingDiscard);
  }, [isConfirmingDiscard, onDiscardConfirmingChange]);

  useEffect(() => {
    return () => onDiscardConfirmingChange?.(false);
  }, [onDiscardConfirmingChange]);

  const reviewMessage =
    completionMessage ?? "Watch, download, or discard this local recording.";

  if (!isExpanded) {
    return (
      <div
        aria-label="Recording review collapsed"
        className="mt-2.5 border-t border-white/10 px-1 pt-2.5"
        role="region"
      >
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase text-cyan-100/70">
              Recording saved
            </p>
            <p className="mt-0.5 truncate text-xs font-semibold text-white">
              {filename ?? "Recording ready"}
            </p>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-400">
              Clip kept. Review, download, or record another take.
            </p>
          </div>
          <div className="grid shrink-0 grid-cols-1 gap-2 sm:flex sm:items-center">
            {hasRecording ? (
              <a
                className={downloadLinkClassName}
                download={filename ?? undefined}
                href={objectUrl ?? undefined}
              >
                Download
              </a>
            ) : null}
            <SecondaryButton onClick={onExpand}>Review clip</SecondaryButton>
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
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase text-cyan-100/70">
            Recording saved
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold text-white">
            {filename ?? "Recording ready"}
          </p>
          <p id={reviewMessageId} className="mt-1 text-xs leading-5 text-neutral-300">
            {reviewMessage}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
        <MetricCard isNumeric label="Time" value={durationLabel} />
        <MetricCard label="Size" value={sizeLabel} />
        <MetricCard label="Source" value="Local file" />
      </div>

      <p id={playbackDescriptionId} className="sr-only">
        {filename
          ? `Recorded clip ${filename}, duration ${durationLabel}, size ${sizeLabel}.`
          : "Recorded clip preview."}
      </p>
      <div className="mt-3 overflow-hidden rounded-lg border border-white/10 bg-black/55 shadow-inner">
        {objectUrl ? (
          <video
            aria-label="Recording playback"
            aria-describedby={playbackDescriptionId}
            className="aspect-video max-h-[min(44dvh,22rem)] w-full bg-black object-contain"
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
          className="mt-3 grid gap-3 rounded-lg border border-red-300/25 bg-red-500/10 p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-red-50">Discard this clip?</p>
            <p className="mt-0.5 text-xs leading-5 text-red-100/80">
              This cannot be undone.
            </p>
          </div>
          <SecondaryButton onClick={() => setIsConfirmingDiscard(false)}>
            Keep
          </SecondaryButton>
          <DangerButton onClick={onDiscardRecording}>Discard clip</DangerButton>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
          {hasRecording ? (
            <a
              className={downloadLinkClassName}
              download={filename ?? undefined}
              href={objectUrl ?? undefined}
            >
              Download
            </a>
          ) : (
            <button
              className="min-h-11 rounded-md bg-white px-3 py-2 text-sm font-semibold text-neutral-950 opacity-50 disabled:cursor-not-allowed"
              disabled
              type="button"
            >
              Download
            </button>
          )}
          <SecondaryButton onClick={onCollapse}>Keep</SecondaryButton>
          <DangerButton onClick={() => setIsConfirmingDiscard(true)}>
            Discard
          </DangerButton>
        </div>
      )}
    </section>
  );
}

const downloadLinkClassName = cx(
  "inline-flex min-h-11 items-center justify-center rounded-md bg-white px-3.5 py-2.5 text-center text-sm font-semibold text-neutral-950",
  "transition hover:bg-neutral-200 active:bg-neutral-300",
  studioClassNames.focusRing,
);
