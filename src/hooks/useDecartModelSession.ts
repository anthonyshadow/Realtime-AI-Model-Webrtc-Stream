import type { RealTimeClient } from "@decartai/sdk";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getModelConfig,
  type ModelModeConfig,
} from "../constants/models";
import { toUserMessage } from "../lib/errors";
import {
  buildFullRealtimeStatePayload,
  buildRealtimeClearPayload,
  buildRealtimeStatePayload,
} from "../lib/realtimeState";
import type { LucyModelSpec } from "../types/decart";
import type { ApplyRealtimeStateInput, RealtimeStatus } from "../types/realtime";

const APPLY_STATUSES = new Set<RealtimeStatus>(["connected", "generating"]);

type StartDecartModelSessionInput = ApplyRealtimeStateInput & {
  onStatusChange: (status: RealtimeStatus) => void;
  requestInputStream: (model: LucyModelSpec) => Promise<MediaStream | null>;
  shouldContinue: () => boolean;
};

export type UseDecartModelSessionReturn = {
  modelOutputStream: MediaStream | null;
  modelStatus: RealtimeStatus;
  modelError: string | null;
  isApplying: boolean;
  start: (input: StartDecartModelSessionInput) => Promise<boolean>;
  stop: () => void;
  apply: (
    input: ApplyRealtimeStateInput,
    lifecycleStatus: RealtimeStatus,
  ) => Promise<boolean>;
  resetRealtimeState: (lifecycleStatus: RealtimeStatus) => Promise<boolean>;
};

export function useDecartModelSession(): UseDecartModelSessionReturn {
  const [modelOutputStream, setModelOutputStream] = useState<MediaStream | null>(null);
  const [modelStatus, setModelStatus] = useState<RealtimeStatus>("idle");
  const [modelError, setModelError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const realtimeClientRef = useRef<RealTimeClient | null>(null);

  const disconnectRealtimeClient = useCallback(() => {
    realtimeClientRef.current?.disconnect();
    realtimeClientRef.current = null;
  }, []);

  const stop = useCallback(() => {
    disconnectRealtimeClient();
    setModelOutputStream(null);
    setIsApplying(false);
    setModelError(null);
    setModelStatus("disconnected");
  }, [disconnectRealtimeClient]);

  const start = useCallback(
    async ({
      onStatusChange,
      requestInputStream,
      shouldContinue,
      ...initialState
    }: StartDecartModelSessionInput) => {
      const config = getModelConfig(initialState.modelMode);
      const initialPayload = buildRealtimeStatePayload(initialState);

      if (!initialPayload) {
        setModelError(getMissingInputMessage(config, "starting"));
        setModelStatus("idle");
        onStatusChange("idle");
        return false;
      }

      stop();
      setModelError(null);
      setModelStatus("requesting-camera");
      onStatusChange("requesting-camera");

      try {
        const {
          connectRealtimeModel,
          createBrowserDecartClient,
          fetchRealtimeToken,
          getRealtimeModel,
        } = await import("../lib/decartClient");
        const model = await getRealtimeModel(initialState.modelMode);

        if (!shouldContinue()) {
          return false;
        }

        const stream = await requestInputStream(model);

        if (!stream || !shouldContinue()) {
          return false;
        }

        setModelStatus("requesting-token");
        onStatusChange("requesting-token");
        const token = await fetchRealtimeToken(initialState.modelMode);

        if (!shouldContinue()) {
          return false;
        }

        const client = await createBrowserDecartClient(token);

        if (!shouldContinue()) {
          return false;
        }

        setModelStatus("connecting");
        onStatusChange("connecting");

        const realtimeClient = await connectRealtimeModel({
          client,
          stream,
          model,
          initialState,
          modelLabel: config.label,
          onRemoteStream: (nextRemoteStream) => {
            if (shouldContinue()) {
              setModelOutputStream(nextRemoteStream);
            }
          },
          onConnectionChange: (state) => {
            if (shouldContinue()) {
              setModelStatus(state);
              onStatusChange(state);
            }
          },
        });

        if (!shouldContinue()) {
          realtimeClient.disconnect();
          return false;
        }

        realtimeClient.on("error", () => {
          if (shouldContinue()) {
            setModelError(`Could not connect to ${config.label}. Check API access, model availability, and network.`);
            setModelStatus("error");
            onStatusChange("error");
          }
        });

        realtimeClient.on("generationTick", () => {
          if (shouldContinue()) {
            setModelStatus("generating");
            onStatusChange("generating");
          }
        });

        realtimeClientRef.current = realtimeClient;
        const connectionState = realtimeClient.getConnectionState();
        setModelStatus(connectionState);
        onStatusChange(connectionState);
        return true;
      } catch (startError) {
        if (!shouldContinue()) {
          return false;
        }

        stop();
        setModelError(toUserMessage(startError));
        setModelStatus("error");
        onStatusChange("error");
        return false;
      }
    },
    [stop],
  );

  const apply = useCallback(
    async (input: ApplyRealtimeStateInput, lifecycleStatus: RealtimeStatus) => {
      const realtimeClient = realtimeClientRef.current;

      if (!APPLY_STATUSES.has(lifecycleStatus) || !realtimeClient) {
        setModelError(`Start ${getModelConfig(input.modelMode).label} and wait for it to connect before applying changes.`);
        return false;
      }

      const payload = buildFullRealtimeStatePayload(input);

      if (!payload) {
        setModelError(getMissingInputMessage(getModelConfig(input.modelMode), "applying"));
        return false;
      }

      try {
        setModelError(null);
        setIsApplying(true);
        await realtimeClient.set(payload);

        return true;
      } catch {
        setModelError("Could not apply those changes. Check that the realtime session is still connected and try again.");
        return false;
      } finally {
        setIsApplying(false);
      }
    },
    [],
  );

  const resetRealtimeState = useCallback(async (lifecycleStatus: RealtimeStatus) => {
    const realtimeClient = realtimeClientRef.current;

    setModelError(null);

    if (!APPLY_STATUSES.has(lifecycleStatus) || !realtimeClient) {
      return true;
    }

    try {
      setIsApplying(true);
      await realtimeClient.set(buildRealtimeClearPayload());
      return true;
    } catch {
      setModelError(
        "Could not reset the realtime state. Check that the realtime session is still connected and try again.",
      );
      return false;
    } finally {
      setIsApplying(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnectRealtimeClient();
    };
  }, [disconnectRealtimeClient]);

  return useMemo(
    () => ({
      modelOutputStream,
      modelStatus,
      modelError,
      isApplying,
      start,
      stop,
      apply,
      resetRealtimeState,
    }),
    [
      apply,
      isApplying,
      modelError,
      modelOutputStream,
      modelStatus,
      resetRealtimeState,
      start,
      stop,
    ],
  );
}

function getMissingInputMessage(config: ModelModeConfig, action: "applying" | "starting") {
  const imageLabel = config.id === "lucy-vton-3" ? "garment image" : "reference portrait";
  return `Enter a ${config.promptLabel.toLowerCase()} or choose a ${imageLabel} before ${action}.`;
}
