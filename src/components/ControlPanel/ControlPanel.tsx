import { ErrorBanner } from "./ErrorBanner";
import { ImageUpload } from "./ImageUpload";
import { PromptInput } from "./PromptInput";
import { SessionControls } from "./SessionControls";
import { TimerDisplay } from "./TimerDisplay";
import type { RealtimeStatus } from "../../types/realtime";

export type ControlPanelProps = {
  isVisible: boolean;
  prompt: string;
  imageFile: File | null;
  imagePreviewUrl: string | null;
  status: RealtimeStatus;
  elapsedLabel: string;
  error: string | null;
  onPromptChange: (value: string) => void;
  onImageChange: (file: File | null) => void;
  onImageError: (message: string | null) => void;
  onStart: () => void;
  onStop: () => void;
  onApply: () => void;
};

export function ControlPanel({
  isVisible,
  prompt,
  imageFile,
  imagePreviewUrl,
  status,
  elapsedLabel,
  error,
  onPromptChange,
  onImageChange,
  onImageError,
  onStart,
  onStop,
  onApply,
}: ControlPanelProps) {
  const visibilityClassName = isVisible
    ? "translate-y-0 opacity-100"
    : "pointer-events-none translate-y-3 opacity-0";

  return (
    <aside
      className={`fixed bottom-4 left-4 z-10 max-h-[calc(100vh-2rem)] w-[min(calc(100vw-2rem),320px)] overflow-y-auto rounded-lg border border-white/15 bg-neutral-950/70 p-3 shadow-[0_18px_60px_rgb(0_0_0_/_0.36)] backdrop-blur-xl transition duration-300 ease-out ${visibilityClassName}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-cyan-200/70">
            Lucy controls
          </p>
          <h2 className="mt-0.5 text-base font-semibold text-white">Realtime setup</h2>
        </div>
        <TimerDisplay elapsedLabel={elapsedLabel} />
      </div>

      <div className="mt-3 space-y-3">
        <PromptInput value={prompt} onChange={onPromptChange} />
        <ImageUpload
          file={imageFile}
          previewUrl={imagePreviewUrl}
          onChange={onImageChange}
          onError={onImageError}
        />
        <SessionControls
          status={status}
          onStart={onStart}
          onStop={onStop}
          onApply={onApply}
        />
        <ErrorBanner error={error} />
      </div>
    </aside>
  );
}
