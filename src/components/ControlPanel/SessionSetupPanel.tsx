import type { ReactNode } from "react";
import { getModelConfig } from "../../constants/models";
import {
  SESSION_MODE_IDS,
  getSessionModeConfig,
  isModelBackedSessionMode,
  type SessionModeId,
} from "../../constants/sessionModes";
import {
  studioClassNames,
  studioOverlayZIndex,
  studioPanelWidths,
} from "../../constants/design";
import type { AutoHideOverlayRootProps } from "../../hooks/useAutoHideOverlay";
import { getStudioErrorDescriptor } from "../../lib/errors";
import type { RealtimeStatus } from "../../types/realtime";
import { cx } from "../StudioUI/classNames";
import {
  ErrorBanner,
  MetricCard,
  type MetricCardTone,
  PrimaryButton,
  SecondaryButton,
  StatusPill,
} from "../StudioUI";
import { getErrorActions, getErrorTip } from "./errorRecovery";
import { ModelControlsSection } from "./ModelControlsSection";

type SessionSetupPanelProps = {
  enhancePrompt: boolean;
  error: string | null;
  imageFile: File | null;
  imagePreviewUrl: string | null;
  isVisible: boolean;
  overlayProps?: AutoHideOverlayRootProps<HTMLElement>;
  prompt: string;
  sessionMode: SessionModeId;
  status: RealtimeStatus;
  onEnhancePromptChange: (value: boolean) => void;
  onImageChange: (file: File | null) => void;
  onImageError: (message: string | null) => void;
  onBackToLocalCamera: () => void;
  onPromptChange: (value: string) => void;
  onReset: () => void;
  onSessionModeChange: (value: SessionModeId) => void;
  onStart: () => void;
};

export function SessionSetupPanel({
  enhancePrompt,
  error,
  imageFile,
  imagePreviewUrl,
  isVisible,
  overlayProps,
  prompt,
  sessionMode,
  status,
  onEnhancePromptChange,
  onImageChange,
  onImageError,
  onBackToLocalCamera,
  onPromptChange,
  onReset,
  onSessionModeChange,
  onStart,
}: SessionSetupPanelProps) {
  const sessionConfig = getSessionModeConfig(sessionMode);
  const modelConfig = isModelBackedSessionMode(sessionMode)
    ? getModelConfig(sessionMode)
    : null;
  const hasModelInput = prompt.trim().length > 0 || imageFile !== null;
  const canStart = modelConfig === null || hasModelInput;
  const startLabel = error ? "Try again" : sessionConfig.startLabel;
  const visibilityClassName = isVisible
    ? "translate-y-0 opacity-100"
    : "pointer-events-none translate-y-3 opacity-0";
  const { ref: overlayRef, ...overlayEventProps } = overlayProps ?? {};
  const errorDescriptor = getStudioErrorDescriptor(error, "session");

  return (
    <aside
      {...overlayEventProps}
      aria-label="Live studio controls"
      className={cx(
        "fixed bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] left-3 right-3 w-[calc(100vw-1.5rem)] overflow-y-auto overscroll-contain rounded-xl border border-white/15 bg-neutral-950/82 p-3 text-white shadow-[0_22px_70px_rgb(0_0_0/0.42)] backdrop-blur-xl sm:bottom-auto sm:left-5 sm:right-auto sm:top-1/2 sm:w-[min(34rem,calc(100vw-2rem))] sm:-translate-y-1/2 sm:p-4",
        "max-h-[calc(100dvh-env(safe-area-inset-bottom)-1.5rem)] scroll-p-3 sm:max-h-[min(42rem,calc(100dvh-2rem))] sm:scroll-p-4",
        studioClassNames.overlayMotion,
        visibilityClassName,
      )}
      ref={overlayRef}
      style={{
        maxWidth: studioPanelWidths.setupPanel,
        zIndex: studioOverlayZIndex.controlDrawer,
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase text-cyan-100/70">
            Setup
          </p>
          <h2 className="mt-0.5 text-lg font-semibold text-white sm:text-xl">
            Choose a session
          </h2>
          <p className="mt-1 max-w-[24rem] text-sm leading-6 text-neutral-300">
            Pick how you want to use the camera.
          </p>
        </div>
        <StatusPill
          label={getStatusLabel(status, error)}
          tone={error ? "error" : status === "disconnected" ? "neutral" : "idle"}
        />
      </div>

      <div className="mt-4 space-y-4">
        <SetupStep eyebrow="1" title="Choose session">
          <SetupSessionModeCards
            value={sessionMode}
            onChange={onSessionModeChange}
          />
        </SetupStep>

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

        <SetupStep eyebrow="2" title="Confirm setup">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <SetupCheckItem
              label="Selected mode"
              value={sessionConfig.label}
              tone="active"
            />
            <SetupCheckItem label="Camera" value="Browser camera" />
            <SetupCheckItem label="Microphone" value="Browser microphone" />
            <SetupCheckItem
              label="Permission"
              value={getPermissionLabel(error)}
              tone={error ? "danger" : "default"}
            />
          </div>
        </SetupStep>

        {errorDescriptor ? (
          <ErrorBanner
            actions={getErrorActions({
              descriptor: errorDescriptor,
              imageFile,
              includeTryAgain: false,
              isModelMode: modelConfig !== null,
              onBackToLocalCamera,
              onImageChange,
              onReset,
              onStart,
            })}
            message={errorDescriptor.message}
            title={errorDescriptor.title}
          >
            {getErrorTip(errorDescriptor)}
          </ErrorBanner>
        ) : null}
      </div>

      <div className="sticky bottom-0 -mx-3 mt-4 border-t border-white/10 bg-neutral-950/95 px-3 pb-[max(env(safe-area-inset-bottom),0rem)] pt-3 shadow-[0_-18px_30px_rgb(0_0_0/0.34)] sm:-mx-4 sm:px-4 sm:pb-0">
        <PrimaryButton
          className="w-full"
          disabled={!canStart}
          onClick={onStart}
        >
          {startLabel}
        </PrimaryButton>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <p className="self-center text-xs leading-5 text-neutral-400">
            {canStart
              ? getStartHelperText(sessionMode, Boolean(error))
              : "Add a prompt or image to start."}
          </p>
          <SecondaryButton className="w-full sm:w-auto" onClick={onReset}>
            Reset
          </SecondaryButton>
        </div>
      </div>
    </aside>
  );
}

type SetupStepProps = {
  children: ReactNode;
  eyebrow: string;
  title: string;
};

function SetupStep({ children, eyebrow, title }: SetupStepProps) {
  return (
    <section className="border-t border-white/10 pt-4 first:border-t-0 first:pt-0">
      <div className="mb-2 flex items-center gap-2">
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-cyan-300 text-[11px] font-bold text-neutral-950">
          {eyebrow}
        </span>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      {children}
    </section>
  );
}

type SetupSessionModeCardsProps = {
  value: SessionModeId;
  onChange: (value: SessionModeId) => void;
};

function SetupSessionModeCards({ value, onChange }: SetupSessionModeCardsProps) {
  return (
    <fieldset>
      <legend className="sr-only">Session mode</legend>
      <div className="grid grid-cols-1 gap-2">
        {SESSION_MODE_IDS.map((sessionMode) => {
          const config = getSessionModeConfig(sessionMode);
          const isSelected = sessionMode === value;

          return (
            <button
              key={sessionMode}
              aria-pressed={isSelected}
              className={cx(
                "min-h-16 rounded-lg border p-3 text-left",
                studioClassNames.focusRing,
                studioClassNames.motion,
                isSelected
                  ? "border-cyan-300/70 bg-cyan-300/10 text-white shadow-[0_0_0_1px_rgb(103_232_249/0.24)]"
                  : "border-white/10 bg-black/25 text-neutral-300 hover:border-white/25 hover:bg-white/[0.05] hover:text-white",
              )}
              type="button"
              onClick={() => onChange(sessionMode)}
            >
              <span className="flex min-w-0 items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">
                    {config.label}
                  </span>
                  <span
                    className={cx(
                      "mt-1 block text-xs leading-5",
                      isSelected ? "text-cyan-50/80" : "text-neutral-400",
                    )}
                  >
                    {config.eyebrow}
                  </span>
                </span>
                {isSelected ? (
                  <span className="shrink-0 rounded-full bg-cyan-300 px-2 py-1 text-[10px] font-bold uppercase text-neutral-950">
                    Selected
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

type SetupCheckItemProps = {
  label: string;
  tone?: Extract<MetricCardTone, "active" | "danger" | "default">;
  value: string;
};

function SetupCheckItem({ label, tone = "default", value }: SetupCheckItemProps) {
  return <MetricCard label={label} tone={tone} value={value} />;
}

function getStatusLabel(status: RealtimeStatus, error: string | null) {
  if (error || status === "error") {
    return "Error";
  }

  if (status === "disconnected") {
    return "Stopped";
  }

  return "Idle";
}

function getPermissionLabel(error: string | null) {
  if (!error) {
    return "Not requested";
  }

  return getStudioErrorDescriptor(error)?.kind === "camera-permission"
    ? "Blocked"
    : "Ready to retry";
}

function getStartHelperText(sessionMode: SessionModeId, hasError: boolean) {
  if (hasError) {
    return "Check the message, then try again.";
  }

  return isModelBackedSessionMode(sessionMode)
    ? "Camera permission is requested on start."
    : "You can review before recording.";
}
