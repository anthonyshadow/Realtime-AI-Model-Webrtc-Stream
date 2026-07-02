import { useCallback, useEffect, useMemo, useState } from "react";
import { ControlPanel } from "./components/ControlPanel/ControlPanel";
import { FloatingRecordingDock } from "./components/RecordingDock/FloatingRecordingDock";
import { VideoStage } from "./components/VideoStage/VideoStage";
import {
  DEFAULT_SESSION_MODE,
  getSessionModeConfig,
  isModelBackedSessionMode,
  type SessionModeId,
} from "./constants/sessionModes";
import { useLiveSession } from "./hooks/useLiveSession";
import { useAutoHideOverlay } from "./hooks/useAutoHideOverlay";
import { useObjectUrl } from "./hooks/useObjectUrl";
import { useRecordingCompletionFlow } from "./hooks/useRecordingCompletionFlow";
import { useSessionRecording } from "./hooks/useSessionRecording";
import { useSessionTimer } from "./hooks/useSessionTimer";
import {
  createApplyInput,
  createControlPanelDraft,
  createDraftKey,
  createStartSessionInput,
  type ControlPanelDraft,
} from "./lib/controlPanelDraft";
import { getRecordingOverlayState } from "./lib/recordingOverlayState";
import { isAutoHideableRealtimeStatus } from "./lib/realtimeStatus";

const MODEL_RECORDING_RELEASE_MESSAGE =
  "Recording ready. Model session ended to save usage. Local camera remains on.";
const LIVE_OVERLAY_IDLE_MS = 3000;

export function App() {
  const realtime = useLiveSession();
  const timer = useSessionTimer(realtime.isRunning);
  const [draft, setDraft] = useState<ControlPanelDraft>(() =>
    createControlPanelDraft(DEFAULT_SESSION_MODE),
  );
  const sessionMode = draft.sessionMode;
  const activeSessionConfig = getSessionModeConfig(realtime.activeSessionMode ?? sessionMode);
  const recording = useSessionRecording(realtime.recordableStream, {
    sessionMode: realtime.activeSessionMode ?? sessionMode,
  });
  const [recordingCompletionMessage, setRecordingCompletionMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [lastAppliedDraftKey, setLastAppliedDraftKey] = useState<string | null>(null);
  const [isDiscardConfirming, setIsDiscardConfirming] = useState(false);
  const [isRecordingReviewExpanded, setIsRecordingReviewExpanded] = useState(false);
  const imagePreviewUrl = useObjectUrl(draft.image);
  const canChangeSessionMode =
    !realtime.isRunning && !realtime.isConnecting && !recording.isRecording;

  const draftKey = useMemo(() => createDraftKey(draft), [draft]);
  const hasPendingChanges =
    isModelBackedSessionMode(sessionMode) &&
    realtime.isRunning &&
    lastAppliedDraftKey !== null &&
    lastAppliedDraftKey !== draftKey;
  const hasRecordableStream = realtime.recordableStream !== null && realtime.isRunning;
  const recordingOverlayState = getRecordingOverlayState({
    activeSessionMode: realtime.activeSessionMode,
    filename: recording.filename,
    formError,
    hasRecordableStream,
    isDiscardConfirming,
    isRecording: recording.isRecording,
    isReviewExpanded: isRecordingReviewExpanded,
    isSessionRunning: realtime.isRunning,
    objectUrl: recording.objectUrl,
    realtimeError: realtime.error,
    realtimeStatus: realtime.status,
    recordableStreamSource: realtime.recordableStreamSource,
    recordingState: recording.state,
  });
  const shouldAutoHideLiveOverlays =
    realtime.isRunning && isAutoHideableRealtimeStatus(realtime.status);
  const liveOverlay = useAutoHideOverlay<HTMLElement>({
    enabled: shouldAutoHideLiveOverlays,
    forceVisible: recordingOverlayState.shouldForceLiveOverlaysVisible,
    hideDelayMs: LIVE_OVERLAY_IDLE_MS,
  });

  const handleSessionModeChange = (nextMode: SessionModeId) => {
    if (!canChangeSessionMode || nextMode === sessionMode) {
      return;
    }

    setFormError(null);
    setDraft(createControlPanelDraft(nextMode));
    setLastAppliedDraftKey(null);
  };

  const handlePromptChange = (value: string) => {
    setFormError(null);
    setDraft((currentDraft) => ({ ...currentDraft, prompt: value }));
  };

  const handleImageChange = (file: File | null) => {
    setFormError(null);
    setDraft((currentDraft) => ({ ...currentDraft, image: file }));
  };

  const handleEnhancePromptChange = (value: boolean) => {
    setFormError(null);
    setDraft((currentDraft) => ({ ...currentDraft, enhance: value }));
  };

  const handleReset = () => {
    const resetDraft = createControlPanelDraft(sessionMode);
    const resetDraftKey = createDraftKey(resetDraft);

    setFormError(null);
    setRecordingCompletionMessage(null);
    setDraft(resetDraft);
    setLastAppliedDraftKey(null);

    void realtime.resetRealtimeState().then((didReset) => {
      if (didReset && realtime.isRunning) {
        setLastAppliedDraftKey(resetDraftKey);
      }
    });
  };

  const handleBackToLocalCamera = () => {
    setFormError(null);
    setRecordingCompletionMessage(null);
    setLastAppliedDraftKey(null);
    recordingCompletionFlow.clearPendingCompletionFlow();

    if (recording.isRecording) {
      recording.stopRecording();
    }

    realtime.stop();
    setDraft(createControlPanelDraft(DEFAULT_SESSION_MODE));
  };

  const handleStart = () => {
    setFormError(null);
    setRecordingCompletionMessage(null);
    const draftAtSubmit = draft;
    const draftKeyAtSubmit = draftKey;
    const startInput = createStartSessionInput(draftAtSubmit);

    void realtime.start(startInput).then((didStart) => {
      if (didStart) {
        setLastAppliedDraftKey(draftKeyAtSubmit);
      }
    });
  };

  const handleStop = () => {
    setLastAppliedDraftKey(null);
    setRecordingCompletionMessage(null);
    recordingCompletionFlow.clearPendingCompletionFlow();
    if (recording.isRecording) {
      recording.stopRecording();
    }
    realtime.stop();
  };

  const handleApply = () => {
    setFormError(null);
    setRecordingCompletionMessage(null);
    const draftAtSubmit = draft;
    const draftKeyAtSubmit = draftKey;
    const applyInput = createApplyInput(draftAtSubmit);

    if (!applyInput) {
      return;
    }

    void realtime.apply(applyInput).then((didApply) => {
      if (didApply) {
        setLastAppliedDraftKey(draftKeyAtSubmit);
      }
    });
  };

  const handleModelRecordingReleased = useCallback(() => {
    setFormError(null);
    setDraft(createControlPanelDraft(DEFAULT_SESSION_MODE));
    setLastAppliedDraftKey(null);
    setRecordingCompletionMessage(MODEL_RECORDING_RELEASE_MESSAGE);
  }, []);

  const recordingCompletionFlow = useRecordingCompletionFlow({
    recordingSessionMode: recording.recordingSessionMode,
    recordingState: recording.state,
    releaseModelSessionToLocalPreview: realtime.releaseModelSessionToLocalPreview,
    onModelSessionReleased: handleModelRecordingReleased,
  });

  useEffect(() => {
    if (
      recording.state !== "recorded" ||
      !isModelBackedSessionMode(recording.recordingSessionMode) ||
      realtime.activeSessionMode !== DEFAULT_SESSION_MODE ||
      recordingCompletionMessage !== null ||
      sessionMode === DEFAULT_SESSION_MODE
    ) {
      return;
    }

    handleModelRecordingReleased();
  }, [
    handleModelRecordingReleased,
    recording.recordingSessionMode,
    recording.state,
    recordingCompletionMessage,
    realtime.activeSessionMode,
    sessionMode,
  ]);

  const handleStartRecording = () => {
    setRecordingCompletionMessage(null);
    if (recording.startRecording()) {
      liveOverlay.releaseInteractionHold();
    }
  };

  const handleStopRecording = () => {
    recording.stopRecording();
    liveOverlay.releaseInteractionHold();
  };

  const handleDiscardRecording = () => {
    setIsDiscardConfirming(false);
    setRecordingCompletionMessage(null);
    recording.deleteRecording();
  };

  return (
    <main className="min-h-screen overflow-hidden bg-neutral-950 text-white">
      <VideoStage
        displayStream={realtime.displayStream}
        placeholderDescription={activeSessionConfig.videoDescription}
        placeholderEyebrow={activeSessionConfig.videoEyebrow}
        status={realtime.status}
      />
      <ControlPanel
        activeSessionMode={realtime.activeSessionMode}
        canChangeSessionMode={canChangeSessionMode}
        enhancePrompt={draft.enhance}
        hasPendingChanges={hasPendingChanges}
        isVisible={
          isRecordingReviewExpanded && !recordingOverlayState.shouldForceLiveOverlaysVisible
            ? false
            : liveOverlay.isVisible
        }
        isApplying={realtime.isApplying}
        sessionMode={sessionMode}
        overlayProps={liveOverlay.getRootProps("live-control-drawer")}
        prompt={draft.prompt}
        imageFile={draft.image}
        imagePreviewUrl={imagePreviewUrl}
        status={realtime.status}
        elapsedLabel={timer.elapsedLabel}
        error={formError ?? realtime.error}
        recordingDockLayout={recordingOverlayState.recordingDockLayout}
        reserveRecordingDockSpace={recordingOverlayState.shouldRenderRecordingDock}
        onEnhancePromptChange={handleEnhancePromptChange}
        onSessionModeChange={handleSessionModeChange}
        onPromptChange={handlePromptChange}
        onImageChange={handleImageChange}
        onImageError={setFormError}
        onBackToLocalCamera={handleBackToLocalCamera}
        onReset={handleReset}
        onStart={handleStart}
        onStop={handleStop}
        onApply={handleApply}
      />
      <FloatingRecordingDock
        canRecord={recording.canRecord}
        completionMessage={recordingCompletionMessage}
        durationLabel={recording.durationLabel}
        error={recording.error}
        filename={recording.filename}
        hasRecordableStream={hasRecordableStream}
        isVisible={liveOverlay.isVisible}
        isRecording={recording.isRecording}
        isSessionActive={realtime.isRunning}
        isSupported={recording.isSupported}
        objectUrl={recording.objectUrl}
        overlayProps={liveOverlay.getRootProps("recording-dock")}
        sizeLabel={recording.sizeLabel}
        standbyMessage={recordingOverlayState.recordingStandbyMessage}
        state={recording.state}
        onDiscardConfirmingChange={setIsDiscardConfirming}
        onDiscardRecording={handleDiscardRecording}
        onResetRecording={recording.resetRecording}
        onReviewExpandedChange={setIsRecordingReviewExpanded}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
      />
    </main>
  );
}
