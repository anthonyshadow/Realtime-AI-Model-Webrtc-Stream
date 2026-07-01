import { SUPPORTED_IMAGE_FORMAT_LABEL, SUPPORTED_IMAGE_TYPES } from "../../constants/app";
import { UPLOAD_VALIDATION_MESSAGE, isSupportedImageType } from "../../lib/imageValidation";
import { FileUploadControl } from "../StudioUI";

type ImageUploadProps = {
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

export function ImageUpload({
  actionText,
  altText,
  emptyLabel,
  file,
  helperText,
  label,
  previewUrl,
  onChange,
  onError,
}: ImageUploadProps) {
  return (
    <FileUploadControl
      accept={SUPPORTED_IMAGE_TYPES.join(",")}
      actionText={actionText}
      altText={altText}
      emptyLabel={emptyLabel}
      file={file}
      formatLabel={SUPPORTED_IMAGE_FORMAT_LABEL}
      helperText={helperText}
      label={label}
      previewUrl={previewUrl}
      validateFile={(selectedFile) =>
        isSupportedImageType(selectedFile) ? null : UPLOAD_VALIDATION_MESSAGE
      }
      onChange={onChange}
      onError={onError}
    />
  );
}
