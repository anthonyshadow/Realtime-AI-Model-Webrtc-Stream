import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  isLocalSessionMode,
  isModelBackedSessionMode,
  type LocalSessionModeId,
  type SessionModeId,
} from "../constants/sessionModes";
import { toUserMessage } from "../lib/errors";
import {
  createLocalRecordableStream,
  createModelOutputRecordableStream,
} from "../lib/streamComposition";
import type {
  ApplyRealtimeStateInput,
  RealtimeStatus,
  StartRealtimeSessionInput,
  UseLiveSessionReturn,
} from "../types/realtime";
import { useDecartModelSession } from "./useDecartModelSession";
import { useMediaSession } from "./useMediaSession";

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

export function useLiveSession(): UseLiveSessionReturn {
  const {
    localStream,
    mediaError,
    startLocalCamera,
    startModelCamera,
    stop: stopMediaSession,
  } = useMediaSession();
  const {
    modelOutputStream,
    modelError,
    isApplying,
    start: startDecartModelSession,
    stop: stopDecartModelSession,
    apply: applyDecartModelState,
    resetRealtimeState: resetDecartModelState,
  } = useDecartModelSession();
  const [status, setStatus] = useState<RealtimeStatus>("idle");
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [activeSessionMode, setActiveSessionMode] = useState<SessionModeId | null>(null);
  const startRequestIdRef = useRef(0);

  const displayStream = modelOutputStream ?? localStream;
  const recordableStreamComposition = useMemo(() => {
    if (isLocalSessionMode(activeSessionMode)) {
      return createLocalRecordableStream(localStream);
    }

    if (isModelBackedSessionMode(activeSessionMode)) {
      return createModelOutputRecordableStream({
        localStream,
        modelOutputStream,
      });
    }

    return createLocalRecordableStream(null);
  }, [activeSessionMode, localStream, modelOutputStream]);
  const recordableStream = recordableStreamComposition.stream;
  const isRunning = RUNNING_STATUSES.has(status);
  const isConnecting = CONNECTING_STATUSES.has(status);
  const error = sessionError ?? modelError ?? mediaError;

  const stopLowerSessions = useCallback(() => {
    stopDecartModelSession();
    stopMediaSession();
  }, [stopDecartModelSession, stopMediaSession]);

  const start = useCallback(
    async (initialState: StartRealtimeSessionInput) => {
      const requestId = startRequestIdRef.current + 1;
      startRequestIdRef.current = requestId;
      const isCurrent = () => startRequestIdRef.current === requestId;

      setSessionError(null);
      setActiveSessionMode(null);
      setStatus("requesting-camera");
      stopLowerSessions();

      if (isLocalStartInput(initialState)) {
        try {
          const stream = await startLocalCamera({ isCurrent });

          if (!stream || !isCurrent()) {
            return false;
          }

          setActiveSessionMode(initialState.sessionMode);
          setStatus("connected");
          return true;
        } catch (startError) {
          if (!isCurrent()) {
            return false;
          }

          stopLowerSessions();
          setSessionError(toUserMessage(startError));
          setStatus("error");
          return false;
        }
      }

      const didStart = await startDecartModelSession({
        ...initialState,
        shouldContinue: isCurrent,
        onStatusChange: (nextStatus) => {
          if (isCurrent()) {
            setStatus(nextStatus);
          }
        },
        requestInputStream: async (model) => {
          const stream = await startModelCamera(model, { isCurrent });

          if (stream && isCurrent()) {
            setActiveSessionMode(initialState.sessionMode);
          }

          return stream;
        },
      });

      if (!isCurrent()) {
        return false;
      }

      if (!didStart) {
        stopMediaSession();
        setActiveSessionMode(null);
      }

      return didStart;
    },
    [startDecartModelSession, startLocalCamera, startModelCamera, stopLowerSessions, stopMediaSession],
  );

  const stop = useCallback(() => {
    startRequestIdRef.current += 1;
    setSessionError(null);
    stopLowerSessions();
    setActiveSessionMode(null);
    setStatus("disconnected");
  }, [stopLowerSessions]);

  const releaseModelSessionToLocalPreview = useCallback(async () => {
    if (!isModelBackedSessionMode(activeSessionMode)) {
      return false;
    }

    const requestId = startRequestIdRef.current + 1;
    startRequestIdRef.current = requestId;
    const isCurrent = () => startRequestIdRef.current === requestId;

    setSessionError(null);
    stopDecartModelSession();

    if (hasLiveVideoTrack(localStream)) {
      setActiveSessionMode("local");
      setStatus("connected");
      return true;
    }

    setActiveSessionMode(null);
    setStatus("requesting-camera");

    try {
      const stream = await startLocalCamera({ isCurrent });

      if (!stream || !isCurrent()) {
        return false;
      }

      setActiveSessionMode("local");
      setStatus("connected");
      return true;
    } catch (releaseError) {
      if (!isCurrent()) {
        return false;
      }

      stopMediaSession();
      setSessionError(toUserMessage(releaseError));
      setActiveSessionMode(null);
      setStatus("error");
      return false;
    }
  }, [
    activeSessionMode,
    localStream,
    startLocalCamera,
    stopDecartModelSession,
    stopMediaSession,
  ]);

  const apply = useCallback(
    async (input: ApplyRealtimeStateInput) => {
      setSessionError(null);

      if (!isModelBackedSessionMode(activeSessionMode)) {
        return false;
      }

      return applyDecartModelState(input, status);
    },
    [activeSessionMode, applyDecartModelState, status],
  );

  const resetRealtimeState = useCallback(async () => {
    setSessionError(null);

    if (CONNECTING_STATUSES.has(status)) {
      startRequestIdRef.current += 1;
      stopLowerSessions();
      setActiveSessionMode(null);
      setStatus("idle");
      return true;
    }

    if (status === "reconnecting") {
      startRequestIdRef.current += 1;
      stopLowerSessions();
      setActiveSessionMode(null);
      setStatus("disconnected");
      return true;
    }

    if (!isModelBackedSessionMode(activeSessionMode)) {
      return true;
    }

    return resetDecartModelState(status);
  }, [activeSessionMode, resetDecartModelState, status, stopLowerSessions]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      stopLowerSessions();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      startRequestIdRef.current += 1;
    };
  }, [stopLowerSessions]);

  useEffect(() => {
    return () => {
      recordableStreamComposition.cleanup();
    };
  }, [recordableStreamComposition]);

  return useMemo(
    () => ({
      status,
      error,
      localStream,
      displayStream,
      modelOutputStream,
      recordableStream,
      recordableAudioSource: recordableStreamComposition.audioSource,
      recordableStreamSource: recordableStreamComposition.videoSource,
      activeSessionMode,
      isRunning,
      isConnecting,
      isApplying,
      start,
      stop,
      releaseModelSessionToLocalPreview,
      apply,
      resetRealtimeState,
    }),
    [
      activeSessionMode,
      apply,
      displayStream,
      error,
      isApplying,
      isConnecting,
      isRunning,
      localStream,
      modelOutputStream,
      recordableStreamComposition.audioSource,
      recordableStreamComposition.videoSource,
      recordableStream,
      resetRealtimeState,
      releaseModelSessionToLocalPreview,
      start,
      status,
      stop,
    ],
  );
}

function isLocalStartInput(
  input: StartRealtimeSessionInput,
): input is Extract<StartRealtimeSessionInput, { sessionMode: LocalSessionModeId }> {
  return isLocalSessionMode(input.sessionMode);
}

function hasLiveVideoTrack(stream: MediaStream | null) {
  return stream?.getVideoTracks().some((track) => track.readyState === "live") ?? false;
}
