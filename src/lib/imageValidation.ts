import { SUPPORTED_IMAGE_TYPES } from "../constants/app";

export const UNSUPPORTED_IMAGE_MESSAGE = "Please upload a JPEG, PNG, or WebP image.";

export function isSupportedImageType(file: File) {
  return SUPPORTED_IMAGE_TYPES.some((type) => type === file.type);
}
