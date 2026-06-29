import type { SessionModeId } from "../constants/sessionModes";

export const PREFERRED_RECORDING_MIME_TYPES = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
  "video/mp4;codecs=h264,aac",
  "video/mp4",
] as const;

type MediaRecorderSupport = {
  isTypeSupported: (mimeType: string) => boolean;
};

export function getBrowserMediaRecorder(): typeof MediaRecorder | null {
  if (typeof globalThis.MediaRecorder !== "function") {
    return null;
  }

  return globalThis.MediaRecorder;
}

export function isMediaRecorderSupported() {
  return getBrowserMediaRecorder() !== null;
}

export function selectRecordingMimeType(
  mediaRecorder: MediaRecorderSupport | null = getBrowserMediaRecorder(),
) {
  if (!mediaRecorder || typeof mediaRecorder.isTypeSupported !== "function") {
    return null;
  }

  return PREFERRED_RECORDING_MIME_TYPES.find((mimeType) =>
    mediaRecorder.isTypeSupported(mimeType),
  ) ?? null;
}

export function getRecordingFileExtension(mimeType: string | null | undefined) {
  const baseMimeType = mimeType?.split(";")[0]?.trim().toLowerCase();

  switch (baseMimeType) {
    case "video/mp4":
      return ".mp4";
    case "video/webm":
    default:
      return ".webm";
  }
}

export function createRecordingFilename({
  date = new Date(),
  mimeType,
  sessionMode,
}: {
  date?: Date;
  mimeType?: string | null;
  sessionMode: SessionModeId;
}) {
  const sessionSlug = sessionMode.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `session-${sessionSlug}-${formatRecordingTimestamp(date)}${getRecordingFileExtension(mimeType)}`;
}

export function formatRecordingDuration(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function formatRecordingFileSize(bytes: number) {
  const safeBytes = Math.max(0, bytes);

  if (safeBytes < 1024) {
    return `${safeBytes} B`;
  }

  const units = ["KB", "MB", "GB"] as const;
  let value = safeBytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

function formatRecordingTimestamp(date: Date) {
  const year = date.getFullYear();
  const month = padDatePart(date.getMonth() + 1);
  const day = padDatePart(date.getDate());
  const hours = padDatePart(date.getHours());
  const minutes = padDatePart(date.getMinutes());

  return `${year}-${month}-${day}-${hours}-${minutes}`;
}

function padDatePart(value: number) {
  return value.toString().padStart(2, "0");
}
