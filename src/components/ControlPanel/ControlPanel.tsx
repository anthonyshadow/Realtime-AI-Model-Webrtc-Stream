import { getModelConfig } from "../../constants/models";
import {
  studioClassNames,
  studioOverlayZIndex,
  studioPanelWidths,
} from "../../constants/design";
import {
  getSessionModeConfig,
  isModelBackedSessionMode,
  type SessionModeId,
} from "../../constants/sessionModes";
import type { AutoHideOverlayRootProps } from "../../hooks/useAutoHideOverlay";
import type { RealtimeStatus } from "../../types/realtime";
import { cx } from "../StudioUI/classNames";
import { ModelControlsSection } from "./ModelControlsSection";
import { SessionActionsSection } from "./SessionActionsSection";
import { SessionSetupPanel } from "./SessionSetupPanel";
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
  recordingDockLayout?: "none" | "recorded" | "transport" | "review";
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
  recordingDockLayout,
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
  const shouldRenderSetupPanel =
    activeSessionMode === null &&
    canChangeSessionMode &&
    (status === "idle" || status === "disconnected" || status === "error");
  const visibilityClassName = isVisible
    ? "translate-x-0 translate-y-0 opacity-100"
    : "pointer-events-none translate-y-4 opacity-0 sm:-translate-x-5 sm:translate-y-0";
  const resolvedRecordingDockLayout =
    recordingDockLayout ?? (reserveRecordingDockSpace ? "transport" : "none");
  const layoutClassName =
    resolvedRecordingDockLayout === "review"
      ? "bottom-[calc(env(safe-area-inset-bottom)+min(58dvh,28rem))] max-h-[calc(100dvh-env(safe-area-inset-bottom)-min(58dvh,28rem)-0.75rem)] sm:bottom-[calc(env(safe-area-inset-bottom)+min(48dvh,24rem))] sm:max-h-[calc(100dvh-env(safe-area-inset-bottom)-min(48dvh,24rem)-1rem)]"
      : resolvedRecordingDockLayout === "recorded"
        ? "bottom-[calc(env(safe-area-inset-bottom)+17rem)] max-h-[calc(100dvh-env(safe-area-inset-bottom)-17.75rem)] sm:bottom-[calc(env(safe-area-inset-bottom)+9rem)] sm:max-h-[calc(100dvh-env(safe-area-inset-bottom)-10rem)]"
      : resolvedRecordingDockLayout === "transport"
        ? "bottom-[calc(env(safe-area-inset-bottom)+10rem)] max-h-[calc(100dvh-env(safe-area-inset-bottom)-10.75rem)] sm:bottom-[calc(env(safe-area-inset-bottom)+6.75rem)] sm:max-h-[calc(100dvh-env(safe-area-inset-bottom)-7.75rem)]"
        : "bottom-3 max-h-[calc(100dvh-1.5rem)] sm:bottom-4 sm:max-h-[calc(100dvh-2rem)]";
  const { ref: overlayRef, ...overlayEventProps } = overlayProps ?? {};

  if (shouldRenderSetupPanel) {
    return (
      <SessionSetupPanel
        enhancePrompt={enhancePrompt}
        error={error}
        imageFile={imageFile}
        imagePreviewUrl={imagePreviewUrl}
        isVisible={isVisible}
        overlayProps={overlayProps}
        prompt={prompt}
        sessionMode={sessionMode}
        status={status}
        onEnhancePromptChange={onEnhancePromptChange}
        onImageChange={onImageChange}
        onImageError={onImageError}
        onPromptChange={onPromptChange}
        onReset={onReset}
        onSessionModeChange={onSessionModeChange}
        onStart={onStart}
      />
    );
  }

  return (
    <aside
      {...overlayEventProps}
      aria-label="Live studio controls"
      className={cx(
        "fixed left-3 right-3 overflow-y-auto overscroll-contain rounded-xl border border-white/15 bg-neutral-950/74 p-3 text-white shadow-[0_18px_60px_rgb(0_0_0/0.36)] backdrop-blur-xl",
        "scroll-p-3 w-[calc(100vw-1.5rem)] sm:left-4 sm:right-auto sm:top-4 sm:w-[min(24rem,calc(100vw-2rem))]",
        studioClassNames.overlayMotion,
        layoutClassName,
        visibilityClassName,
      )}
      ref={overlayRef}
      style={{
        maxWidth: studioPanelWidths.controlDrawer,
        zIndex: studioOverlayZIndex.controlDrawer,
      }}
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
