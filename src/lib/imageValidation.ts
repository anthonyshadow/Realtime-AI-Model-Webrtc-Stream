import { SUPPORTED_IMAGE_FORMAT_LABEL, SUPPORTED_IMAGE_TYPES } from "../constants/app";

export const UNSUPPORTED_IMAGE_MESSAGE = `Please upload a ${SUPPORTED_IMAGE_FORMAT_LABEL} image.`;

export function isSupportedImageType(file: File) {
  return SUPPORTED_IMAGE_TYPES.some((type) => type === file.type);
}
