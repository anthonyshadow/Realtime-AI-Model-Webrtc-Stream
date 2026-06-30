import { ImageUpload } from "./ImageUpload";

type ReferenceImageSectionProps = {
  actionText: string;
  altText: string;
  emptyLabel: string;
  file: File | null;
  helperText: string;
  label: string;
  previewUrl: string | null;
  onChange: (file: File | null) => void;
  onError: (message: string | null) => void;
};

export function ReferenceImageSection({
  actionText,
  altText,
  emptyLabel,
  file,
  helperText,
  label,
  previewUrl,
  onChange,
  onError,
}: ReferenceImageSectionProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-semibold uppercase text-neutral-400">
        Reference
      </p>
      <ImageUpload
        actionText={actionText}
        altText={altText}
        emptyLabel={emptyLabel}
        file={file}
        helperText={helperText}
        label={label}
        previewUrl={previewUrl}
        onChange={onChange}
        onError={onError}
      />
    </div>
  );
}
