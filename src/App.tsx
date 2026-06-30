import { useMemo, useState } from "react";
import { AutoHidingControlPanel } from "./components/ControlPanel/AutoHidingControlPanel";
import { FloatingRecordingDock } from "./components/RecordingDock/FloatingRecordingDock";
import { VideoStage } from "./components/VideoStage/VideoStage";
import {
  getModelConfig,
} from "./constants/models";
import {
  DEFAULT_SESSION_MODE,
  getSessionModeConfig,
  isModelBackedSessionMode,
  type SessionModeId,
} from "./constants/sessionModes";
import { useLiveSession } from "./hooks/useLiveSession";
import { useObjectUrl } from "./hooks/useObjectUrl";
import { useSessionRecording } from "./hooks/useSessionRecording";
import { useSessionTimer } from "./hooks/useSessionTimer";
import type { RecordableStreamSource } from "./lib/streamComposition";
import type { ApplyRealtimeStateInput, StartRealtimeSessionInput } from "./types/realtime";

type ControlPanelDraft = {
  sessionMode: SessionModeId;
  prompt: string;
  image: File | null;
  enhance: boolean;
};

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
  const [formError, setFormError] = useState<string | null>(null);
  const [lastAppliedDraftKey, setLastAppliedDraftKey] = useState<string | null>(null);
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
  const recordingStandbyMessage = getRecordingStandbyMessage({
    activeSessionMode: realtime.activeSessionMode,
    hasRecordableStream,
    isRunning: realtime.isRunning,
    recordableStreamSource: realtime.recordableStreamSource,
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
    setDraft(resetDraft);
    setLastAppliedDraftKey(null);

    void realtime.resetRealtimeState().then((didReset) => {
      if (didReset && realtime.isRunning) {
        setLastAppliedDraftKey(resetDraftKey);
      }
    });
  };

  const handleStart = () => {
    setFormError(null);
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
    if (recording.isRecording) {
      recording.stopRecording();
    }
    realtime.stop();
  };

  const handleApply = () => {
    setFormError(null);
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

  return (
    <main className="min-h-screen overflow-hidden bg-neutral-950 text-white">
      <VideoStage
        displayStream={realtime.displayStream}
        placeholderDescription={activeSessionConfig.videoDescription}
        placeholderEyebrow={activeSessionConfig.videoEyebrow}
        status={realtime.status}
      />
      <AutoHidingControlPanel
        activeSessionMode={realtime.activeSessionMode}
        canChangeSessionMode={canChangeSessionMode}
        enhancePrompt={draft.enhance}
        hasPendingChanges={hasPendingChanges}
        isApplying={realtime.isApplying}
        sessionMode={sessionMode}
        prompt={draft.prompt}
        imageFile={draft.image}
        imagePreviewUrl={imagePreviewUrl}
        status={realtime.status}
        elapsedLabel={timer.elapsedLabel}
        error={formError ?? realtime.error}
        onEnhancePromptChange={handleEnhancePromptChange}
        onSessionModeChange={handleSessionModeChange}
        onPromptChange={handlePromptChange}
        onImageChange={handleImageChange}
        onImageError={setFormError}
        onReset={handleReset}
        onStart={handleStart}
        onStop={handleStop}
        onApply={handleApply}
      />
      <FloatingRecordingDock
        canRecord={recording.canRecord}
        durationLabel={recording.durationLabel}
        error={recording.error}
        filename={recording.filename}
        hasRecordableStream={hasRecordableStream}
        isRecording={recording.isRecording}
        isSessionActive={realtime.isRunning}
        isSupported={recording.isSupported}
        objectUrl={recording.objectUrl}
        sizeLabel={recording.sizeLabel}
        standbyMessage={recordingStandbyMessage}
        state={recording.state}
        onDeleteRecording={recording.deleteRecording}
        onStartRecording={recording.startRecording}
        onStopRecording={recording.stopRecording}
      />
    </main>
  );
}

function getRecordingStandbyMessage({
  activeSessionMode,
  hasRecordableStream,
  isRunning,
  recordableStreamSource,
}: {
  activeSessionMode: SessionModeId | null;
  hasRecordableStream: boolean;
  isRunning: boolean;
  recordableStreamSource: RecordableStreamSource;
}) {
  if (
    isRunning &&
    !hasRecordableStream &&
    recordableStreamSource === "none" &&
    isModelBackedSessionMode(activeSessionMode)
  ) {
    return "Waiting for model output before recording.";
  }

  return undefined;
}

function createControlPanelDraft(sessionMode: SessionModeId): ControlPanelDraft {
  if (!isModelBackedSessionMode(sessionMode)) {
    return {
      sessionMode,
      prompt: "",
      image: null,
      enhance: false,
    };
  }

  const config = getModelConfig(sessionMode);

  return {
    sessionMode,
    prompt: config.defaultPrompt,
    image: null,
    enhance: config.enhanceDefault,
  };
}

function createApplyInput(input: ControlPanelDraft): ApplyRealtimeStateInput | null {
  if (!isModelBackedSessionMode(input.sessionMode)) {
    return null;
  }

  return {
    modelMode: input.sessionMode,
    prompt: input.prompt,
    image: input.image,
    enhance: input.enhance,
  };
}

function createStartSessionInput(input: ControlPanelDraft): StartRealtimeSessionInput {
  if (!isModelBackedSessionMode(input.sessionMode)) {
    return {
      sessionMode: input.sessionMode,
    };
  }

  return {
    sessionMode: input.sessionMode,
    modelMode: input.sessionMode,
    prompt: input.prompt,
    image: input.image,
    enhance: input.enhance,
  };
}

function createDraftKey(input: ControlPanelDraft) {
  return JSON.stringify({
    sessionMode: input.sessionMode,
    prompt: input.prompt.trim(),
    enhance: input.enhance,
    image: input.image
      ? {
          name: input.image.name,
          size: input.image.size,
          type: input.image.type,
          lastModified: input.image.lastModified,
        }
      : null,
  });
}
