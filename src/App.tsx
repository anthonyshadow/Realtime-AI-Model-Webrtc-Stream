import { useMemo, useState } from "react";
import { AutoHidingControlPanel } from "./components/ControlPanel/AutoHidingControlPanel";
import { VideoStage } from "./components/VideoStage/VideoStage";
import {
  DEFAULT_MODEL_MODE,
  getModelConfig,
  type SupportedModelMode,
} from "./constants/models";
import { useDecartRealtimeSession } from "./hooks/useDecartRealtimeSession";
import { useObjectUrl } from "./hooks/useObjectUrl";
import { useSessionTimer } from "./hooks/useSessionTimer";
import type { ApplyRealtimeStateInput } from "./types/realtime";

export function App() {
  const realtime = useDecartRealtimeSession();
  const timer = useSessionTimer(realtime.isRunning);
  const [draft, setDraft] = useState<ApplyRealtimeStateInput>(() =>
    createControlPanelDraft(DEFAULT_MODEL_MODE),
  );
  const modelMode = draft.modelMode;
  const activeModelConfig = getModelConfig(realtime.activeModelMode ?? modelMode);
  const [formError, setFormError] = useState<string | null>(null);
  const [lastAppliedDraftKey, setLastAppliedDraftKey] = useState<string | null>(null);
  const imagePreviewUrl = useObjectUrl(draft.image);
  const canChangeModel = !realtime.isRunning && !realtime.isConnecting;

  const draftKey = useMemo(() => createDraftKey(draft), [draft]);
  const hasPendingChanges =
    realtime.isRunning && lastAppliedDraftKey !== null && lastAppliedDraftKey !== draftKey;

  const handleModelModeChange = (nextMode: SupportedModelMode) => {
    if (!canChangeModel || nextMode === modelMode) {
      return;
    }

    const nextConfig = getModelConfig(nextMode);
    setFormError(null);
    setDraft({
      modelMode: nextMode,
      prompt: nextConfig.defaultPrompt,
      image: null,
      enhance: nextConfig.enhanceDefault,
    });
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
    const resetDraft = createControlPanelDraft(modelMode);
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

    void realtime.start(draftAtSubmit).then((didStart) => {
      if (didStart) {
        setLastAppliedDraftKey(draftKeyAtSubmit);
      }
    });
  };

  const handleStop = () => {
    setLastAppliedDraftKey(null);
    realtime.stop();
  };

  const handleApply = () => {
    setFormError(null);
    const draftAtSubmit = draft;
    const draftKeyAtSubmit = draftKey;

    void realtime.apply(draftAtSubmit).then((didApply) => {
      if (didApply) {
        setLastAppliedDraftKey(draftKeyAtSubmit);
      }
    });
  };

  return (
    <main className="min-h-screen overflow-hidden bg-neutral-950 text-white">
      <VideoStage
        modelLabel={activeModelConfig.label}
        remoteStream={realtime.remoteStream}
        status={realtime.status}
      />
      <AutoHidingControlPanel
        activeModelMode={realtime.activeModelMode}
        canChangeModel={canChangeModel}
        enhancePrompt={draft.enhance}
        hasPendingChanges={hasPendingChanges}
        isApplying={realtime.isApplying}
        modelMode={modelMode}
        prompt={draft.prompt}
        imageFile={draft.image}
        imagePreviewUrl={imagePreviewUrl}
        status={realtime.status}
        elapsedLabel={timer.elapsedLabel}
        error={formError ?? realtime.error}
        onEnhancePromptChange={handleEnhancePromptChange}
        onModelModeChange={handleModelModeChange}
        onPromptChange={handlePromptChange}
        onImageChange={handleImageChange}
        onImageError={setFormError}
        onReset={handleReset}
        onStart={handleStart}
        onStop={handleStop}
        onApply={handleApply}
      />
    </main>
  );
}

function createControlPanelDraft(modelMode: SupportedModelMode): ApplyRealtimeStateInput {
  const config = getModelConfig(modelMode);

  return {
    modelMode,
    prompt: config.defaultPrompt,
    image: null,
    enhance: config.enhanceDefault,
  };
}

function createDraftKey(input: ApplyRealtimeStateInput) {
  return JSON.stringify({
    modelMode: input.modelMode,
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
