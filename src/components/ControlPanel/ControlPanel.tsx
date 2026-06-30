import { getModelConfig } from "../../constants/models";
import {
  getSessionModeConfig,
  isModelBackedSessionMode,
  type SessionModeId,
} from "../../constants/sessionModes";
import type { AutoHideOverlayRootProps } from "../../hooks/useAutoHideOverlay";
import type { RealtimeStatus } from "../../types/realtime";
import { ModelControlsSection } from "./ModelControlsSection";
import { SessionActionsSection } from "./SessionActionsSection";
import { SessionSetupSection } from "./SessionSetupSection";
import { TimerDisplay } from "./TimerDisplay";

export type ControlPanelProps = {
  activeSessionMode: SessionModeId | null;
  canChangeSessionMode: boolean;
  enhancePrompt: boolean;
  hasPendingChanges: boolean;
  isVisible: boolean;
  isApplying: boolean;
  sessionMode: SessionModeId;
  overlayProps?: AutoHideOverlayRootProps<HTMLElement>;
  prompt: string;
  imageFile: File | null;
  imagePreviewUrl: string | null;
  status: RealtimeStatus;
  elapsedLabel: string;
  error: string | null;
  reserveRecordingDockSpace?: boolean;
  onEnhancePromptChange: (value: boolean) => void;
  onSessionModeChange: (value: SessionModeId) => void;
  onPromptChange: (value: string) => void;
  onImageChange: (file: File | null) => void;
  onImageError: (message: string | null) => void;
  onReset: () => void;
  onStart: () => void;
  onStop: () => void;
  onApply: () => void;
};

export function ControlPanel({
  activeSessionMode,
  canChangeSessionMode,
  enhancePrompt,
  hasPendingChanges,
  isVisible,
  isApplying,
  sessionMode,
  overlayProps,
  prompt,
  imageFile,
  imagePreviewUrl,
  status,
  elapsedLabel,
  error,
  reserveRecordingDockSpace = false,
  onEnhancePromptChange,
  onSessionModeChange,
  onPromptChange,
  onImageChange,
  onImageError,
  onReset,
  onStart,
  onStop,
  onApply,
}: ControlPanelProps) {
  const sessionConfig = getSessionModeConfig(sessionMode);
  const modelConfig = isModelBackedSessionMode(sessionMode)
    ? getModelConfig(sessionMode)
    : null;
  const visibilityClassName = isVisible
    ? "translate-y-0 opacity-100"
    : "pointer-events-none translate-y-3 opacity-0";
  const layoutClassName = reserveRecordingDockSpace
    ? "bottom-[calc(env(safe-area-inset-bottom)+10rem)] max-h-[calc(100vh-env(safe-area-inset-bottom)-10.75rem)] sm:bottom-[calc(env(safe-area-inset-bottom)+8.75rem)] sm:max-h-[calc(100vh-env(safe-area-inset-bottom)-9.75rem)] xl:bottom-4 xl:max-h-[calc(100vh-2rem)]"
    : "bottom-3 max-h-[calc(100vh-1.5rem)] sm:bottom-4 sm:max-h-[calc(100vh-2rem)]";
  const { ref: overlayRef, ...overlayEventProps } = overlayProps ?? {};

  return (
    <aside
      {...overlayEventProps}
      aria-label="Live studio controls"
      className={`fixed left-3 right-3 z-10 overflow-y-auto overscroll-contain rounded-lg border border-white/15 bg-neutral-950/72 p-3 shadow-[0_18px_60px_rgb(0_0_0/0.36)] backdrop-blur-xl transition duration-300 ease-out motion-reduce:transform-none motion-reduce:transition-none sm:left-4 sm:right-auto sm:w-[23rem] ${layoutClassName} ${visibilityClassName}`}
      ref={overlayRef}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium uppercase text-cyan-200/70">
            {sessionConfig.eyebrow}
          </p>
          <h2 className="mt-0.5 truncate text-base font-semibold text-white">
            {sessionConfig.label}
          </h2>
        </div>
        <TimerDisplay elapsedLabel={elapsedLabel} />
      </div>

      <div className="mt-3 space-y-3">
        <SessionSetupSection
          activeSessionMode={activeSessionMode}
          canChangeSessionMode={canChangeSessionMode}
          error={error}
          hasPendingChanges={hasPendingChanges}
          isApplying={isApplying}
          sessionMode={sessionMode}
          status={status}
          onSessionModeChange={onSessionModeChange}
        />
        {modelConfig ? (
          <ModelControlsSection
            enhancePrompt={enhancePrompt}
            imageFile={imageFile}
            imagePreviewUrl={imagePreviewUrl}
            modelConfig={modelConfig}
            prompt={prompt}
            onEnhancePromptChange={onEnhancePromptChange}
            onImageChange={onImageChange}
            onImageError={onImageError}
            onPromptChange={onPromptChange}
          />
        ) : null}
        <div className="sticky bottom-0 z-20 rounded-b-md border-t border-white/10 bg-neutral-950 pt-3 shadow-[0_-18px_30px_rgb(0_0_0/0.34)]">
          <SessionActionsSection
            canApplyChanges={modelConfig !== null}
            hasPendingChanges={hasPendingChanges}
            isApplying={isApplying}
            startLabel={sessionConfig.startLabel}
            status={status}
            onApply={onApply}
            onReset={onReset}
            onStart={onStart}
            onStop={onStop}
          />
        </div>
      </div>
    </aside>
  );
}
