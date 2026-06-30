import { useCallback, useEffect, useRef } from "react";
import {
  isModelBackedSessionMode,
  type SessionModeId,
} from "../constants/sessionModes";
import type { SessionRecordingState } from "./useSessionRecording";

type UseRecordingCompletionFlowOptions = {
  recordingSessionMode: SessionModeId | null;
  recordingState: SessionRecordingState;
  releaseModelSessionToLocalPreview: () => Promise<boolean>;
  onModelSessionReleased: () => void;
};

export function useRecordingCompletionFlow({
  recordingSessionMode,
  recordingState,
  releaseModelSessionToLocalPreview,
  onModelSessionReleased,
}: UseRecordingCompletionFlowOptions) {
  const hasRequestedModelReleaseRef = useRef(false);
  const isMountedRef = useRef(true);

  const clearPendingCompletionFlow = useCallback(() => {
    hasRequestedModelReleaseRef.current = false;
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (recordingState === "recording" || recordingState === "stopping") {
      hasRequestedModelReleaseRef.current = false;
      return;
    }

    if (
      hasRequestedModelReleaseRef.current ||
      (recordingState !== "recorded" && recordingState !== "error") ||
      !isModelBackedSessionMode(recordingSessionMode)
    ) {
      return;
    }

    hasRequestedModelReleaseRef.current = true;

    void releaseModelSessionToLocalPreview().then((didRelease) => {
      if (isMountedRef.current && didRelease) {
        onModelSessionReleased();
      }
    });
  }, [
    onModelSessionReleased,
    recordingSessionMode,
    recordingState,
    releaseModelSessionToLocalPreview,
  ]);

  return {
    clearPendingCompletionFlow,
  };
}
