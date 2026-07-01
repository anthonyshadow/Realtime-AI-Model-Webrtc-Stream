import { useEffect, useId, useRef } from "react";
import { studioClassNames } from "../../constants/design";
import { cx } from "./classNames";
import { SecondaryButton } from "./Button";

export type FileUploadControlProps = {
  accept: string;
  actionText: string;
  altText: string;
  className?: string;
  clearLabel?: string;
  disabled?: boolean;
  emptyLabel: string;
  file: File | null;
  formatLabel: string;
  helperText: string;
  label: string;
  previewUrl: string | null;
  validateFile?: (file: File) => string | null;
  onChange: (file: File | null) => void;
  onError?: (message: string | null) => void;
};

export function FileUploadControl({
  accept,
  actionText,
  altText,
  className,
  clearLabel = "Clear",
  disabled = false,
  emptyLabel,
  file,
  formatLabel,
  helperText,
  label,
  previewUrl,
  validateFile,
  onChange,
  onError,
}: FileUploadControlProps) {
  const inputId = useId();
  const helperId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const clearInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (!file) {
      clearInput();
    }
  }, [file]);

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) {
      onError?.(null);
      onChange(null);
      return;
    }

    const validationMessage = validateFile?.(selectedFile) ?? null;

    if (validationMessage) {
      clearInput();
      onChange(null);
      onError?.(validationMessage);
      return;
    }

    onError?.(null);
    onChange(selectedFile);
  };

  const handleClear = () => {
    clearInput();
    onError?.(null);
    onChange(null);
  };

  return (
    <div className={cx("space-y-2", className)}>
      <div className="min-w-0">
        <label className="block text-sm font-medium text-neutral-100" htmlFor={inputId}>
          {label}
        </label>
        <p id={helperId} className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-400">
          {helperText}
        </p>
      </div>

      <input
        ref={inputRef}
        aria-describedby={helperId}
        className="sr-only"
        disabled={disabled}
        id={inputId}
        type="file"
        accept={accept}
        onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
      />

      <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <button
          className={cx(
            "flex min-w-0 flex-col items-start justify-center overflow-hidden rounded-md border border-dashed border-white/15 bg-black/25 px-3 py-2 text-left hover:border-cyan-300/40 hover:bg-cyan-300/5",
            studioClassNames.touchTarget,
            studioClassNames.motion,
            studioClassNames.focusRing,
            studioClassNames.disabled,
          )}
          disabled={disabled}
          type="button"
          onClick={() => inputRef.current?.click()}
        >
          <span className="max-w-full truncate text-xs font-semibold text-neutral-100">
            {actionText}
          </span>
          <span className="mt-0.5 max-w-full truncate text-[11px] text-neutral-400">
            {formatLabel}
          </span>
        </button>
        <SecondaryButton
          className="w-full min-w-0 sm:w-auto"
          disabled={disabled || !file}
          onClick={handleClear}
        >
          {clearLabel}
        </SecondaryButton>
      </div>

      <div
        className="grid min-w-0 grid-cols-[3rem_minmax(0,1fr)] items-center gap-2 overflow-hidden rounded-md border border-white/10 bg-black/25 p-2"
        data-testid="file-upload-summary"
      >
        {previewUrl ? (
          <img
            className="h-12 w-12 rounded-md border border-white/10 object-cover"
            src={previewUrl}
            alt={altText}
          />
        ) : (
          <div className="grid h-12 w-12 place-items-center rounded-md border border-white/10 bg-black/25 text-center text-[11px] leading-tight text-neutral-300">
            {emptyLabel}
          </div>
        )}

        <div className="min-w-0 overflow-hidden">
          <p className="truncate text-xs text-neutral-300" title={file?.name}>
            {file ? file.name : `${actionText}: ${formatLabel}`}
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-400">
            {file ? "Ready to apply with the next model update." : "No file selected."}
          </p>
        </div>
      </div>
    </div>
  );
}
