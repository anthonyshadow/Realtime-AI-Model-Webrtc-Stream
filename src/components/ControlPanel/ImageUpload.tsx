import { useRef } from "react";
import { SUPPORTED_IMAGE_TYPES } from "../../constants/app";

type ImageUploadProps = {
  file: File | null;
  previewUrl: string | null;
  onChange: (file: File | null) => void;
  onError: (message: string | null) => void;
};

const UNSUPPORTED_IMAGE_MESSAGE = "Please upload a JPEG, PNG, or WebP image.";

export function ImageUpload({ file, previewUrl, onChange, onError }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const clearInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) {
      onError(null);
      onChange(null);
      return;
    }

    if (!isSupportedImageType(selectedFile)) {
      clearInput();
      onChange(null);
      onError(UNSUPPORTED_IMAGE_MESSAGE);
      return;
    }

    onError(null);
    onChange(selectedFile);
  };

  const handleClear = () => {
    clearInput();
    onError(null);
    onChange(null);
  };

  return (
    <div>
      <label className="block">
        <span className="text-sm font-medium text-neutral-100">Reference image</span>
        <input
          ref={inputRef}
          className="mt-1.5 block w-full cursor-pointer rounded-md border border-dashed border-white/15 bg-black/25 px-2.5 py-1.5 text-xs text-neutral-300 file:mr-2 file:rounded-md file:border-0 file:bg-white/10 file:px-2.5 file:py-1 file:text-xs file:font-medium file:text-white hover:border-cyan-300/40"
          type="file"
          accept={SUPPORTED_IMAGE_TYPES.join(",")}
          onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
        />
      </label>

      <div className="mt-2 flex items-center gap-2">
        {previewUrl ? (
          <img
            className="h-12 w-12 rounded-md border border-white/10 object-cover"
            src={previewUrl}
            alt="Reference preview"
          />
        ) : (
          <div className="grid h-12 w-12 place-items-center rounded-md border border-white/10 bg-black/25 text-[11px] text-neutral-500">
            No image
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-neutral-300">
            {file ? file.name : "JPEG, PNG, or WebP"}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Best as a clear, front-facing portrait.
          </p>
        </div>

        <button
          className="rounded-md border border-white/10 px-2.5 py-1.5 text-xs font-medium text-neutral-200 transition hover:border-white/25 disabled:cursor-not-allowed disabled:opacity-40"
          type="button"
          disabled={!file}
          onClick={handleClear}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

function isSupportedImageType(file: File) {
  return SUPPORTED_IMAGE_TYPES.some((type) => type === file.type);
}
