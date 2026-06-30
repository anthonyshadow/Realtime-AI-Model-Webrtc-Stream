import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SessionModeId } from "../constants/sessionModes";
import {
  createRecordingFilename,
  formatRecordingDuration,
  formatRecordingFileSize,
  getBrowserMediaRecorder,
  isMediaRecorderSupported,
  selectRecordingMimeType,
} from "../lib/recording";

export type SessionRecordingState =
  | "idle"
  | "ready"
  | "recording"
  | "stopping"
  | "recorded"
  | "error";

type UseSessionRecordingOptions = {
  now?: () => Date;
  sessionMode: SessionModeId;
};

type RecorderSubscription = {
  onDataAvailable: (event: BlobEvent) => void;
  onError: (event: Event) => void;
  onStop: () => void;
  recorder: MediaRecorder;
};

export type UseSessionRecordingReturn = {
  state: SessionRecordingState;
  isSupported: boolean;
  canRecord: boolean;
  isRecording: boolean;
  error: string | null;
  blob: Blob | null;
  objectUrl: string | null;
  mimeType: string | null;
  filename: string | null;
  recordingSessionMode: SessionModeId | null;
  startedAt: Date | null;
  elapsedSeconds: number;
  elapsedLabel: string;
  durationSeconds: number;
  durationLabel: string;
  sizeBytes: number;
  sizeLabel: string;
  startRecording: () => boolean;
  stopRecording: () => void;
  resetRecording: () => void;
  deleteRecording: () => void;
};

const UNSUPPORTED_RECORDING_ERROR =
  "Recording is not supported in this browser.";
const NO_STREAM_RECORDING_ERROR =
  "Start a live session before recording.";
const RECORDER_START_ERROR =
  "Could not start recording. Check browser recording support and try again.";
const RECORDER_RUNTIME_ERROR =
  "Recording failed. Try starting a new recording.";

export function useSessionRecording(
  stream: MediaStream | null,
  { now = () => new Date(), sessionMode }: UseSessionRecordingOptions,
): UseSessionRecordingReturn {
  const [state, setState] = useState<SessionRecordingState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [recordingSessionMode, setRecordingSessionMode] = useState<SessionModeId | null>(null);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [sizeBytes, setSizeBytes] = useState(0);
  const stateRef = useRef<SessionRecordingState>("idle");
  const chunksRef = useRef<Blob[]>([]);
  const objectUrlRef = useRef<string | null>(null);
  const recorderSubscriptionRef = useRef<RecorderSubscription | null>(null);
  const recordingStartedAtRef = useRef<Date | null>(null);
  const recordingSourceStreamRef = useRef<MediaStream | null>(null);
  const recordingSessionModeRef = useRef<SessionModeId>(sessionMode);
  const recordingMimeTypeRef = useRef<string | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const setRecordingState = useCallback((nextState: SessionRecordingState) => {
    stateRef.current = nextState;
    setState(nextState);
  }, []);

  const revokeCurrentObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const setNextObjectUrl = useCallback(
    (nextObjectUrl: string | null) => {
      revokeCurrentObjectUrl();
      objectUrlRef.current = nextObjectUrl;
      setObjectUrl(nextObjectUrl);
    },
    [revokeCurrentObjectUrl],
  );

  const removeRecorderListeners = useCallback((subscription: RecorderSubscription) => {
    subscription.recorder.removeEventListener("dataavailable", subscription.onDataAvailable);
    subscription.recorder.removeEventListener("stop", subscription.onStop);
    subscription.recorder.removeEventListener("error", subscription.onError);
  }, []);

  const clearRecorder = useCallback(
    ({ stopRecorder }: { stopRecorder: boolean }) => {
      const subscription = recorderSubscriptionRef.current;

      if (!subscription) {
        return;
      }

      recorderSubscriptionRef.current = null;
      removeRecorderListeners(subscription);

      if (stopRecorder && subscription.recorder.state !== "inactive") {
        try {
          subscription.recorder.stop();
        } catch {
          // The recorder is already being torn down; the source stream remains owned elsewhere.
        }
      }
    },
    [removeRecorderListeners],
  );

  const clearRecordedArtifact = useCallback(() => {
    setNextObjectUrl(null);
    setBlob(null);
    setFilename(null);
    setSizeBytes(0);
  }, [setNextObjectUrl]);

  const getReadyStateForCurrentStream = useCallback(() => {
    if (!stream) {
      return {
        error: null,
        mimeType: null,
        state: "idle" as const,
      };
    }

    if (!isMediaRecorderSupported()) {
      return {
        error: UNSUPPORTED_RECORDING_ERROR,
        mimeType: null,
        state: "error" as const,
      };
    }

    return {
      error: null,
      mimeType: selectRecordingMimeType(),
      state: "ready" as const,
    };
  }, [stream]);

  const resetToCurrentStreamState = useCallback(() => {
    clearRecorder({ stopRecorder: true });
    chunksRef.current = [];
    recordingStartedAtRef.current = null;
    recordingSourceStreamRef.current = null;
    recordingMimeTypeRef.current = null;
    setRecordingSessionMode(null);
    setStartedAt(null);
    setElapsedSeconds(0);
    setDurationSeconds(0);
    clearRecordedArtifact();

    const nextState = getReadyStateForCurrentStream();
    setError(nextState.error);
    setMimeType(nextState.mimeType);
    setRecordingState(nextState.state);
  }, [clearRecordedArtifact, clearRecorder, getReadyStateForCurrentStream, setRecordingState]);

  const handleRecorderError = useCallback(
    (event: Event) => {
      clearRecorder({ stopRecorder: true });
      chunksRef.current = [];
      recordingStartedAtRef.current = null;
      recordingSourceStreamRef.current = null;
      recordingMimeTypeRef.current = null;
      setStartedAt(null);
      setElapsedSeconds(0);
      setDurationSeconds(0);
      clearRecordedArtifact();
      setMimeType(selectRecordingMimeType());
      setError(getRecorderErrorMessage(event));
      setRecordingState("error");
    },
    [clearRecordedArtifact, clearRecorder, setRecordingState],
  );

  const startRecording = useCallback(() => {
    if (!stream) {
      setError(NO_STREAM_RECORDING_ERROR);
      setRecordingState("error");
      return false;
    }

    const MediaRecorderConstructor = getBrowserMediaRecorder();

    if (!MediaRecorderConstructor) {
      setError(UNSUPPORTED_RECORDING_ERROR);
      setMimeType(null);
      setRecordingState("error");
      return false;
    }

    clearRecorder({ stopRecorder: true });
    clearRecordedArtifact();
    chunksRef.current = [];
    setError(null);
    setElapsedSeconds(0);
    setDurationSeconds(0);
    setSizeBytes(0);
    setFilename(null);

    const selectedMimeType = selectRecordingMimeType(MediaRecorderConstructor);

    try {
      const recorder = selectedMimeType
        ? new MediaRecorderConstructor(stream, { mimeType: selectedMimeType })
        : new MediaRecorderConstructor(stream);
      const startedAtDate = now();

      const onDataAvailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      const onStop = () => {
        const subscription = recorderSubscriptionRef.current;

        if (subscription) {
          recorderSubscriptionRef.current = null;
          removeRecorderListeners(subscription);
        }

        const finalMimeType =
          recorder.mimeType || recordingMimeTypeRef.current || selectedMimeType || null;
        const finalBlob = new Blob(chunksRef.current, {
          type: finalMimeType ?? "",
        });
        const stoppedAt = now();
        const finalDurationSeconds = recordingStartedAtRef.current
          ? Math.max(0, Math.floor((stoppedAt.getTime() - recordingStartedAtRef.current.getTime()) / 1000))
          : elapsedSeconds;
        const nextObjectUrl = URL.createObjectURL(finalBlob);

        chunksRef.current = [];
        recordingStartedAtRef.current = null;
        recordingSourceStreamRef.current = null;
        recordingMimeTypeRef.current = null;
        setBlob(finalBlob);
        setNextObjectUrl(nextObjectUrl);
        setMimeType(finalBlob.type || finalMimeType);
        setFilename(createRecordingFilename({
          date: stoppedAt,
          mimeType: finalBlob.type || finalMimeType,
          sessionMode: recordingSessionModeRef.current,
        }));
        setStartedAt(null);
        setElapsedSeconds(finalDurationSeconds);
        setDurationSeconds(finalDurationSeconds);
        setSizeBytes(finalBlob.size);
        setError(null);
        setRecordingState("recorded");
      };

      const onError = (event: Event) => {
        handleRecorderError(event);
      };

      recorder.addEventListener("dataavailable", onDataAvailable);
      recorder.addEventListener("stop", onStop);
      recorder.addEventListener("error", onError);
      recorderSubscriptionRef.current = {
        onDataAvailable,
        onError,
        onStop,
        recorder,
      };
      recorder.start();

      recordingStartedAtRef.current = startedAtDate;
      recordingSourceStreamRef.current = stream;
      recordingSessionModeRef.current = sessionMode;
      recordingMimeTypeRef.current = recorder.mimeType || selectedMimeType;
      setMimeType(recorder.mimeType || selectedMimeType);
      setRecordingSessionMode(sessionMode);
      setStartedAt(startedAtDate);
      setRecordingState("recording");
      return true;
    } catch {
      clearRecorder({ stopRecorder: true });
      chunksRef.current = [];
      recordingStartedAtRef.current = null;
      recordingSourceStreamRef.current = null;
      recordingMimeTypeRef.current = null;
      setRecordingSessionMode(null);
      setStartedAt(null);
      setElapsedSeconds(0);
      setDurationSeconds(0);
      setMimeType(selectedMimeType);
      setError(RECORDER_START_ERROR);
      setRecordingState("error");
      return false;
    }
  }, [
    clearRecordedArtifact,
    clearRecorder,
    elapsedSeconds,
    handleRecorderError,
    now,
    removeRecorderListeners,
    sessionMode,
    setNextObjectUrl,
    setRecordingState,
    stream,
  ]);

  const stopRecording = useCallback(() => {
    const subscription = recorderSubscriptionRef.current;

    if (!subscription || subscription.recorder.state === "inactive") {
      return;
    }

    setRecordingState("stopping");

    try {
      subscription.recorder.stop();
    } catch {
      handleRecorderError(new Event("error"));
    }
  }, [handleRecorderError, setRecordingState]);

  const resetRecording = useCallback(() => {
    resetToCurrentStreamState();
  }, [resetToCurrentStreamState]);

  useEffect(() => {
    if (stateRef.current === "recording" || stateRef.current === "stopping") {
      if (stream !== recordingSourceStreamRef.current) {
        stopRecording();
      }

      return;
    }

    if (stateRef.current === "recorded") {
      return;
    }

    resetToCurrentStreamState();
  }, [resetToCurrentStreamState, stopRecording, stream]);

  useEffect(() => {
    if (state !== "recording" || !recordingStartedAtRef.current) {
      return;
    }

    const updateElapsedSeconds = () => {
      const nextElapsedSeconds = Math.max(
        0,
        Math.floor((now().getTime() - recordingStartedAtRef.current!.getTime()) / 1000),
      );
      setElapsedSeconds(nextElapsedSeconds);
    };

    updateElapsedSeconds();
    const intervalId = window.setInterval(updateElapsedSeconds, 1000);

    return () => window.clearInterval(intervalId);
  }, [now, state]);

  useEffect(() => {
    return () => {
      clearRecorder({ stopRecorder: true });
      revokeCurrentObjectUrl();
    };
  }, [clearRecorder, revokeCurrentObjectUrl]);

  const isSupported = isMediaRecorderSupported();
  const canRecord = state === "ready" || state === "recorded";
  const isRecording = state === "recording" || state === "stopping";
  const displayedDurationSeconds = state === "recording" || state === "stopping"
    ? elapsedSeconds
    : durationSeconds;

  return useMemo(
    () => ({
      state,
      isSupported,
      canRecord,
      isRecording,
      error,
      blob,
      objectUrl,
      mimeType,
      filename,
      recordingSessionMode,
      startedAt,
      elapsedSeconds,
      elapsedLabel: formatRecordingDuration(elapsedSeconds),
      durationSeconds: displayedDurationSeconds,
      durationLabel: formatRecordingDuration(displayedDurationSeconds),
      sizeBytes,
      sizeLabel: formatRecordingFileSize(sizeBytes),
      startRecording,
      stopRecording,
      resetRecording,
      deleteRecording: resetRecording,
    }),
    [
      blob,
      canRecord,
      displayedDurationSeconds,
      elapsedSeconds,
      error,
      filename,
      recordingSessionMode,
      isRecording,
      isSupported,
      mimeType,
      objectUrl,
      resetRecording,
      sizeBytes,
      startRecording,
      startedAt,
      state,
      stopRecording,
    ],
  );
}

function getRecorderErrorMessage(event: Event) {
  const error = (event as Event & { error?: Error }).error;

  if (!error?.message) {
    return RECORDER_RUNTIME_ERROR;
  }

  return `${RECORDER_RUNTIME_ERROR} (${error.message})`;
}
