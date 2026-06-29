import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toUserMessage } from "../lib/errors";
import { getCameraStream, getLocalCameraStream, stopMediaStream } from "../lib/media";
import type { LucyModelSpec } from "../types/decart";

export type MediaSessionStatus = "idle" | "requesting" | "ready" | "error";

type StartMediaOptions = {
  isCurrent?: () => boolean;
};

export type UseMediaSessionReturn = {
  localStream: MediaStream | null;
  mediaStatus: MediaSessionStatus;
  mediaError: string | null;
  startLocalCamera: (options?: StartMediaOptions) => Promise<MediaStream | null>;
  startModelCamera: (
    model: LucyModelSpec,
    options?: StartMediaOptions,
  ) => Promise<MediaStream | null>;
  stop: () => void;
};

export function useMediaSession(): UseMediaSessionReturn {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [mediaStatus, setMediaStatus] = useState<MediaSessionStatus>("idle");
  const [mediaError, setMediaError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const clearCurrentStream = useCallback(() => {
    stopMediaStream(streamRef.current);
    streamRef.current = null;
    setLocalStream(null);
  }, []);

  const stop = useCallback(() => {
    clearCurrentStream();
    setMediaError(null);
    setMediaStatus("idle");
  }, [clearCurrentStream]);

  const startMedia = useCallback(
    async (
      requestStream: () => Promise<MediaStream>,
      options: StartMediaOptions = {},
    ) => {
      clearCurrentStream();
      setMediaError(null);
      setMediaStatus("requesting");

      try {
        const stream = await requestStream();

        if (options.isCurrent && !options.isCurrent()) {
          stopMediaStream(stream);
          return null;
        }

        streamRef.current = stream;
        setLocalStream(stream);
        setMediaStatus("ready");
        return stream;
      } catch (error) {
        if (options.isCurrent && !options.isCurrent()) {
          return null;
        }

        clearCurrentStream();
        setMediaError(toUserMessage(error));
        setMediaStatus("error");
        throw error;
      }
    },
    [clearCurrentStream],
  );

  const startLocalCamera = useCallback(
    (options?: StartMediaOptions) => startMedia(getLocalCameraStream, options),
    [startMedia],
  );

  const startModelCamera = useCallback(
    (model: LucyModelSpec, options?: StartMediaOptions) =>
      startMedia(() => getCameraStream(model), options),
    [startMedia],
  );

  useEffect(() => {
    return () => {
      stopMediaStream(streamRef.current);
      streamRef.current = null;
    };
  }, []);

  return useMemo(
    () => ({
      localStream,
      mediaStatus,
      mediaError,
      startLocalCamera,
      startModelCamera,
      stop,
    }),
    [
      localStream,
      mediaError,
      mediaStatus,
      startLocalCamera,
      startModelCamera,
      stop,
    ],
  );
}
