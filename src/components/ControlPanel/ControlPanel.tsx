import { getModelConfig, type SupportedModelMode } from "../../constants/models";
import type { RealtimeStatus } from "../../types/realtime";
import { EnhanceToggle } from "./EnhanceToggle";
import { ErrorBanner } from "./ErrorBanner";
import { ImageUpload } from "./ImageUpload";
import { ModelModeSelector } from "./ModelModeSelector";
import { PromptInput } from "./PromptInput";
import { SessionControls } from "./SessionControls";
import { StatusSummary } from "./StatusSummary";
import { TimerDisplay } from "./TimerDisplay";

export type ControlPanelProps = {
  activeModelMode: SupportedModelMode | null;
  canChangeModel: boolean;
  enhancePrompt: boolean;
  hasPendingChanges: boolean;
  isVisible: boolean;
  isApplying: boolean;
  modelMode: SupportedModelMode;
  prompt: string;
  imageFile: File | null;
  imagePreviewUrl: string | null;
  status: RealtimeStatus;
  elapsedLabel: string;
  error: string | null;
  onEnhancePromptChange: (value: boolean) => void;
  onModelModeChange: (value: SupportedModelMode) => void;
  onPromptChange: (value: string) => void;
  onImageChange: (file: File | null) => void;
  onImageError: (message: string | null) => void;
  onReset: () => void;
  onStart: () => void;
  onStop: () => void;
  onApply: () => void;
};

export function ControlPanel({
  activeModelMode,
  canChangeModel,
  enhancePrompt,
  hasPendingChanges,
  isVisible,
  isApplying,
  modelMode,
  prompt,
  imageFile,
  imagePreviewUrl,
  status,
  elapsedLabel,
  error,
  onEnhancePromptChange,
  onModelModeChange,
  onPromptChange,
  onImageChange,
  onImageError,
  onReset,
  onStart,
  onStop,
  onApply,
}: ControlPanelProps) {
  const modelConfig = getModelConfig(modelMode);
  const visibilityClassName = isVisible
    ? "translate-y-0 opacity-100"
    : "pointer-events-none translate-y-3 opacity-0";

  return (
    <aside
      className={`fixed bottom-3 left-3 right-3 z-10 max-h-[calc(100vh-1.5rem)] overflow-y-auto rounded-lg border border-white/15 bg-neutral-950/72 p-3 shadow-[0_18px_60px_rgb(0_0_0/0.36)] backdrop-blur-xl transition duration-300 ease-out sm:bottom-4 sm:left-4 sm:right-auto sm:w-90 ${visibilityClassName}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium uppercase text-cyan-200/70">
            {modelConfig.eyebrow}
          </p>
          <h2 className="mt-0.5 truncate text-base font-semibold text-white">
            {modelConfig.label}
          </h2>
        </div>
        <TimerDisplay elapsedLabel={elapsedLabel} />
      </div>

      <div className="mt-3 space-y-3">
        <StatusSummary
          activeModelMode={activeModelMode}
          hasPendingChanges={hasPendingChanges}
          isApplying={isApplying}
          selectedModelMode={modelMode}
          status={status}
        />
        <ModelModeSelector
          disabled={!canChangeModel}
          value={modelMode}
          onChange={onModelModeChange}
        />
        <PromptInput
          helperText={modelConfig.promptHelperText}
          label={modelConfig.promptLabel}
          placeholder={modelConfig.promptPlaceholder}
          value={prompt}
          onChange={onPromptChange}
        />
        <ImageUpload
          actionText={modelConfig.imageActionText}
          altText={modelConfig.imageAltText}
          emptyLabel={modelConfig.imageEmptyLabel}
          file={imageFile}
          helperText={modelConfig.imageHelperText}
          label={modelConfig.imageLabel}
          previewUrl={imagePreviewUrl}
          onChange={onImageChange}
          onError={onImageError}
        />
        <details className="rounded-md border border-white/10 bg-white/3">
          <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-neutral-100">
            Options
          </summary>
          <div className="px-3 pb-3">
            <EnhanceToggle checked={enhancePrompt} onChange={onEnhancePromptChange} />
          </div>
        </details>
        <SessionControls
          hasPendingChanges={hasPendingChanges}
          isApplying={isApplying}
          status={status}
          onReset={onReset}
          onStart={onStart}
          onStop={onStop}
          onApply={onApply}
        />
        <ErrorBanner error={error} />
      </div>
    </aside>
  );
}
