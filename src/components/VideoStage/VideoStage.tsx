import { useEffect, useRef } from "react";
import { attachStreamToVideo } from "../../lib/media";
import type { RealtimeStatus } from "../../types/realtime";
import { StatusBadge } from "./StatusBadge";
import { VideoPlaceholder } from "./VideoPlaceholder";

type VideoStageProps = {
  modelLabel: string;
  remoteStream: MediaStream | null;
  status: RealtimeStatus;
};

export function VideoStage({ modelLabel, remoteStream, status }: VideoStageProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    attachStreamToVideo(videoRef.current, remoteStream);

    return () => {
      attachStreamToVideo(videoRef.current, null);
    };
  }, [remoteStream]);

  return (
    <section className="fixed inset-0 bg-neutral-950">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        autoPlay
        muted
        playsInline
      />
      {!remoteStream ? <VideoPlaceholder modelLabel={modelLabel} /> : null}
      <div className="absolute left-5 top-5">
        <StatusBadge status={status} />
      </div>
    </section>
  );
}
