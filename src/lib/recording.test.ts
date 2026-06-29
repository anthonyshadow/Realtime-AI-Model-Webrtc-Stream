import { describe, expect, it, vi } from "vitest";
import {
  createRecordingFilename,
  formatRecordingDuration,
  formatRecordingFileSize,
  getRecordingFileExtension,
  selectRecordingMimeType,
} from "./recording";

describe("recording helpers", () => {
  it("selects the first supported MIME type in preferred order", () => {
    const mediaRecorder = {
      isTypeSupported: vi.fn((mimeType: string) => mimeType === "video/webm;codecs=vp8,opus"),
    };

    expect(selectRecordingMimeType(mediaRecorder)).toBe("video/webm;codecs=vp8,opus");
    expect(mediaRecorder.isTypeSupported).toHaveBeenCalledWith("video/webm;codecs=vp9,opus");
    expect(mediaRecorder.isTypeSupported).toHaveBeenCalledWith("video/webm;codecs=vp8,opus");
  });

  it("returns null when no preferred MIME type is supported", () => {
    expect(selectRecordingMimeType({ isTypeSupported: () => false })).toBeNull();
    expect(selectRecordingMimeType(null)).toBeNull();
  });

  it("maps recording MIME types to file extensions", () => {
    expect(getRecordingFileExtension("video/webm;codecs=vp9,opus")).toBe(".webm");
    expect(getRecordingFileExtension("video/webm")).toBe(".webm");
    expect(getRecordingFileExtension("video/mp4;codecs=h264,aac")).toBe(".mp4");
    expect(getRecordingFileExtension("video/mp4")).toBe(".mp4");
    expect(getRecordingFileExtension(null)).toBe(".webm");
  });

  it("creates timestamped filenames from session mode ids", () => {
    const date = new Date(2026, 5, 28, 16, 45);

    expect(createRecordingFilename({
      date,
      mimeType: "video/webm",
      sessionMode: "local",
    })).toBe("session-local-2026-06-28-16-45.webm");
    expect(createRecordingFilename({
      date,
      mimeType: "video/webm;codecs=vp8,opus",
      sessionMode: "lucy-2.1",
    })).toBe("session-lucy-2-1-2026-06-28-16-45.webm");
    expect(createRecordingFilename({
      date,
      mimeType: "video/mp4",
      sessionMode: "lucy-vton-3",
    })).toBe("session-lucy-vton-3-2026-06-28-16-45.mp4");
  });

  it("formats durations as mm:ss", () => {
    expect(formatRecordingDuration(0)).toBe("00:00");
    expect(formatRecordingDuration(7)).toBe("00:07");
    expect(formatRecordingDuration(74)).toBe("01:14");
  });

  it("formats file sizes for display", () => {
    expect(formatRecordingFileSize(0)).toBe("0 B");
    expect(formatRecordingFileSize(512)).toBe("512 B");
    expect(formatRecordingFileSize(1536)).toBe("1.5 KB");
    expect(formatRecordingFileSize(8.4 * 1024 * 1024)).toBe("8.4 MB");
  });
});
