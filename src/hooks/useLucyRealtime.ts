import type { RealTimeClient } from "@decartai/sdk";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  connectLucyRealtime,
  createBrowserDecartClient,
  fetchRealtimeToken,
  getLucyModel,
} from "../lib/decartClient";
import { toUserMessage } from "../lib/errors";
import { getCameraStream, stopMediaStream } from "../lib/media";
import { buildLucyStatePayload } from "../lib/realtimeState";
import type {
  ApplyLucyStateInput,
  RealtimeStatus,
  UseLucyRealtimeReturn,
} from "../types/realtime";

const RUNNING_STATUSES = new Set<RealtimeStatus>([
  "connected",
  "generating",
  "reconnecting",
]);

const CONNECTING_STATUSES = new Set<RealtimeStatus>([
  "requesting-camera",
  "requesting-token",
  "connecting",
]);

const APPLY_STATUSES = new Set<RealtimeStatus>(["connected", "generating"]);

export function useLucyRealtime(): UseLucyRealtimeReturn {
  const [status, setStatus] = useState<RealtimeStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const realtimeClientRef = useRef<RealTimeClient | null>(null);
  const startRequestIdRef = useRef(0);

  const isRunning = RUNNING_STATUSES.has(status);
  const isConnecting = CONNECTING_STATUSES.has(status);

  const disconnectRealtimeClient = useCallback(() => {
    realtimeClientRef.current?.disconnect();
    realtimeClientRef.current = null;
  }, []);

  const clearStreams = useCallback(() => {
    stopMediaStream(streamRef.current);
    streamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
  }, []);

  const resetSession = useCallback(() => {
    disconnectRealtimeClient();
    clearStreams();
  }, [clearStreams, disconnectRealtimeClient]);

  const start = useCallback(async (initialState?: ApplyLucyStateInput) => {
    const requestId = startRequestIdRef.current + 1;
    startRequestIdRef.current = requestId;

    setError(null);
    setStatus("requesting-camera");
    resetSession();

    try {
      const model = await getLucyModel();
      const stream = await getCameraStream(model);

      if (startRequestIdRef.current !== requestId) {
        stopMediaStream(stream);
        return;
      }

      streamRef.current = stream;
      setLocalStream(stream);
      setRemoteStream(stream);

      setStatus("requesting-token");
      const token = await fetchRealtimeToken();

      if (startRequestIdRef.current !== requestId) {
        return;
      }

      const client = await createBrowserDecartClient(token);
      setStatus("connecting");

      const realtimeClient = await connectLucyRealtime({
        client,
        stream,
        model,
        initialState,
        onRemoteStream: (remoteStream) => {
          if (startRequestIdRef.current === requestId) {
            setRemoteStream(remoteStream);
          }
        },
        onConnectionChange: (state) => {
          if (startRequestIdRef.current === requestId) {
            setStatus(state);
          }
        },
      });

      if (startRequestIdRef.current !== requestId) {
        realtimeClient.disconnect();
        return;
      }

      realtimeClient.on("error", () => {
        if (startRequestIdRef.current === requestId) {
          setError("Could not connect to Lucy 2.1 realtime. Check API access, model availability, and network.");
          setStatus("error");
        }
      });

      realtimeClient.on("generationTick", () => {
        if (startRequestIdRef.current === requestId) {
          setStatus("generating");
        }
      });

      realtimeClientRef.current = realtimeClient;
      setStatus(realtimeClient.getConnectionState());
    } catch (startError) {
      if (startRequestIdRef.current !== requestId) {
        return;
      }

      resetSession();
      setError(toUserMessage(startError));
      setStatus("error");
    }
  }, [resetSession]);

  const stop = useCallback(() => {
    startRequestIdRef.current += 1;
    setError(null);
    resetSession();
    setStatus("disconnected");
  }, [resetSession]);

  const apply = useCallback(
    async (input: ApplyLucyStateInput) => {
      const realtimeClient = realtimeClientRef.current;

      if (!APPLY_STATUSES.has(status) || !realtimeClient) {
        setError("Start Lucy and wait for it to connect before applying changes.");
        return;
      }

      const payload = buildLucyStatePayload(input);

      if (!payload) {
        setError("Enter a prompt or choose a reference image before applying changes.");
        return;
      }

      try {
        setError(null);
        await realtimeClient.set(payload);
      } catch {
        setError("Could not apply those changes. Check that Lucy is still connected and try again.");
      }
    },
    [status],
  );

  useEffect(() => {
    const handleBeforeUnload = () => {
      disconnectRealtimeClient();
      stopMediaStream(streamRef.current);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      startRequestIdRef.current += 1;
      resetSession();
    };
  }, [disconnectRealtimeClient, resetSession]);

  return useMemo(
    () => ({
      status,
      error,
      localStream,
      remoteStream,
      isRunning,
      isConnecting,
      start,
      stop,
      apply,
    }),
    [apply, error, isConnecting, isRunning, localStream, remoteStream, start, status, stop],
  );
}
