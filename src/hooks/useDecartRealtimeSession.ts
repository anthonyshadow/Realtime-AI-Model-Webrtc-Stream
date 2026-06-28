import type { RealTimeClient } from "@decartai/sdk";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getModelConfig,
  type ModelModeConfig,
  type SupportedModelMode,
} from "../constants/models";
import {
  connectRealtimeModel,
  createBrowserDecartClient,
  fetchRealtimeToken,
  getRealtimeModel,
} from "../lib/decartClient";
import { toUserMessage } from "../lib/errors";
import { getCameraStream, stopMediaStream } from "../lib/media";
import {
  buildFullRealtimeStatePayload,
  buildRealtimeClearPayload,
  buildRealtimeStatePayload,
} from "../lib/realtimeState";
import type {
  ApplyRealtimeStateInput,
  RealtimeStatus,
  UseDecartRealtimeSessionReturn,
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

export function useDecartRealtimeSession(): UseDecartRealtimeSessionReturn {
  const [status, setStatus] = useState<RealtimeStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [activeModelMode, setActiveModelMode] = useState<SupportedModelMode | null>(null);
  const [isApplying, setIsApplying] = useState(false);
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
    setActiveModelMode(null);
    setIsApplying(false);
  }, [clearStreams, disconnectRealtimeClient]);

  const start = useCallback(async (initialState: ApplyRealtimeStateInput) => {
    const requestId = startRequestIdRef.current + 1;
    startRequestIdRef.current = requestId;
    const config = getModelConfig(initialState.modelMode);
    const initialPayload = buildRealtimeStatePayload(initialState);

    if (!initialPayload) {
      setError(getMissingInputMessage(config, "starting"));
      setStatus("idle");
      return false;
    }

    setError(null);
    setStatus("requesting-camera");
    resetSession();

    try {
      const model = await getRealtimeModel(initialState.modelMode);
      const stream = await getCameraStream(model);

      if (startRequestIdRef.current !== requestId) {
        stopMediaStream(stream);
        return false;
      }

      streamRef.current = stream;
      setLocalStream(stream);
      setRemoteStream(stream);
      setActiveModelMode(initialState.modelMode);

      setStatus("requesting-token");
      const token = await fetchRealtimeToken(initialState.modelMode);

      if (startRequestIdRef.current !== requestId) {
        return false;
      }

      const client = await createBrowserDecartClient(token);
      setStatus("connecting");

      const realtimeClient = await connectRealtimeModel({
        client,
        stream,
        model,
        initialState,
        modelLabel: config.label,
        onRemoteStream: (nextRemoteStream) => {
          if (startRequestIdRef.current === requestId) {
            setRemoteStream(nextRemoteStream);
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
        return false;
      }

      realtimeClient.on("error", () => {
        if (startRequestIdRef.current === requestId) {
          setError(`Could not connect to ${config.label}. Check API access, model availability, and network.`);
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
      return true;
    } catch (startError) {
      if (startRequestIdRef.current !== requestId) {
        return false;
      }

      resetSession();
      setError(toUserMessage(startError));
      setStatus("error");
      return false;
    }
  }, [resetSession]);

  const stop = useCallback(() => {
    startRequestIdRef.current += 1;
    setError(null);
    resetSession();
    setStatus("disconnected");
  }, [resetSession]);

  const apply = useCallback(
    async (input: ApplyRealtimeStateInput) => {
      const realtimeClient = realtimeClientRef.current;

      if (!APPLY_STATUSES.has(status) || !realtimeClient) {
        setError(`Start ${getModelConfig(input.modelMode).label} and wait for it to connect before applying changes.`);
        return false;
      }

      const payload = buildFullRealtimeStatePayload(input);

      if (!payload) {
        setError(getMissingInputMessage(getModelConfig(input.modelMode), "applying"));
        return false;
      }

      const requestId = startRequestIdRef.current;

      try {
        setError(null);
        setIsApplying(true);
        await realtimeClient.set(payload);

        return true;
      } catch {
        if (startRequestIdRef.current === requestId) {
          setError("Could not apply those changes. Check that the realtime session is still connected and try again.");
        }

        return false;
      } finally {
        if (startRequestIdRef.current === requestId) {
          setIsApplying(false);
        }
      }
    },
    [status],
  );

  const resetRealtimeState = useCallback(async () => {
    const realtimeClient = realtimeClientRef.current;

    setError(null);

    if (CONNECTING_STATUSES.has(status)) {
      startRequestIdRef.current += 1;
      resetSession();
      setStatus("idle");
      return true;
    }

    if (status === "reconnecting") {
      startRequestIdRef.current += 1;
      resetSession();
      setStatus("disconnected");
      return true;
    }

    if (!APPLY_STATUSES.has(status) || !realtimeClient) {
      return true;
    }

    const requestId = startRequestIdRef.current;

    try {
      setIsApplying(true);
      await realtimeClient.set(buildRealtimeClearPayload());
      return true;
    } catch {
      if (startRequestIdRef.current === requestId) {
        setError(
          "Could not reset the realtime state. Check that the realtime session is still connected and try again.",
        );
      }

      return false;
    } finally {
      if (startRequestIdRef.current === requestId) {
        setIsApplying(false);
      }
    }
  }, [resetSession, status]);

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
      activeModelMode,
      isRunning,
      isConnecting,
      isApplying,
      start,
      stop,
      apply,
      resetRealtimeState,
    }),
    [
      activeModelMode,
      apply,
      error,
      isApplying,
      isConnecting,
      isRunning,
      localStream,
      remoteStream,
      resetRealtimeState,
      start,
      status,
      stop,
    ],
  );
}

function getMissingInputMessage(config: ModelModeConfig, action: "applying" | "starting") {
  const imageLabel = config.id === "lucy-vton-3" ? "garment image" : "reference portrait";
  return `Enter a ${config.promptLabel.toLowerCase()} or choose a ${imageLabel} before ${action}.`;
}
