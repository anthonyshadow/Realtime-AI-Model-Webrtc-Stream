import { describe, expect, it } from "vitest";
import {
  getRecordingErrorDescriptor,
  getRecordingStatus,
  type RecordingDockStatusInput,
} from "./recordingDockStatus";

const baseInput: RecordingDockStatusInput = {
  completionMessage: null,
  durationLabel: "00:00",
  filename: null,
  hasRecordableStream: true,
  isSupported: true,
  sizeLabel: "0 B",
  state: "ready",
};

function getStatus(overrides: Partial<RecordingDockStatusInput> = {}) {
  return getRecordingStatus({
    ...baseInput,
    ...overrides,
  });
}

describe("recordingDockStatus", () => {
  it("maps ready, recording, and stopping states", () => {
    expect(getStatus()).toMatchObject({
      badgeLabel: "Ready",
      title: "Ready",
      tone: "ready",
    });
    expect(getStatus({ state: "recording" })).toMatchObject({
      badgeLabel: "REC",
      title: "Recording",
      tone: "recording",
    });
    expect(getStatus({ state: "stopping" })).toMatchObject({
      badgeLabel: "Saving",
      title: "Saving clip",
      tone: "recording",
    });
  });

  it("builds recorded clip copy with saved artifact details", () => {
    expect(
      getStatus({
        durationLabel: "01:14",
        filename: "session-local.webm",
        sizeLabel: "8.4 MB",
        state: "recorded",
      }),
    ).toEqual({
      badgeLabel: "Saved",
      title: "Clip captured",
      message: "session-local.webm - 01:14 - 8.4 MB",
      tone: "recorded",
    });

    expect(
      getStatus({
        completionMessage: "Recording ready. Model session ended to save usage. Local camera remains on.",
        state: "recorded",
      }).message,
    ).toBe("Model session ended. Local camera remains on.");
  });

  it("maps waiting and unsupported states", () => {
    expect(
      getStatus({
        hasRecordableStream: false,
        standbyMessage: "Waiting for model output before recording.",
        state: "idle",
      }),
    ).toMatchObject({
      badgeLabel: "Waiting",
      title: "Standby",
      message: "Waiting for model output before recording.",
      tone: "standby",
    });

    expect(getStatus({ isSupported: false })).toMatchObject({
      badgeLabel: "Blocked",
      title: "Unavailable",
      tone: "error",
    });
  });

  it("keeps unsupported recording descriptor independent from raw errors", () => {
    expect(
      getRecordingErrorDescriptor({
        error: "encoder failed",
        isSupported: false,
      }),
    ).toEqual({
      kind: "recording",
      title: "Recording unavailable",
      message: "Recording is not supported in this browser.",
    });
  });
});
