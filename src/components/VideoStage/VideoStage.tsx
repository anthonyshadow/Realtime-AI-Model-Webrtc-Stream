import { useEffect, useRef } from "react";
import { attachStreamToVideo } from "../../lib/media";
import type { RealtimeStatus } from "../../types/realtime";
import { StatusBadge } from "./StatusBadge";
import { VideoPlaceholder } from "./VideoPlaceholder";

type VideoStageProps = {
  displayStream: MediaStream | null;
  placeholderDescription: string;
  placeholderEyebrow: string;
  status: RealtimeStatus;
};

export function VideoStage({
  displayStream,
  placeholderDescription,
  placeholderEyebrow,
  status,
}: VideoStageProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    attachStreamToVideo(videoRef.current, displayStream);

    return () => {
      attachStreamToVideo(videoRef.current, null);
    };
  }, [displayStream]);

  return (
    <section className="fixed inset-0 bg-neutral-950">
      <video
        ref={videoRef}
        className={`h-full w-full object-contain`}
        autoPlay
        muted
        playsInline
      />
      {!displayStream ? (
        <VideoPlaceholder
          description={placeholderDescription}
          eyebrow={placeholderEyebrow}
        />
      ) : null}
      <div className="absolute left-4 top-[calc(env(safe-area-inset-top)+1rem)] z-10 sm:left-5 sm:top-[calc(env(safe-area-inset-top)+1.25rem)]">
        <StatusBadge status={status} />
      </div>
    </section>
  );
}
