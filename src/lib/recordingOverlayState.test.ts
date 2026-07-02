import { describe, expect, it } from "vitest";
import {
  getRecordingOverlayState,
  type RecordingOverlayStateInput,
} from "./recordingOverlayState";

const baseInput: RecordingOverlayStateInput = {
  activeSessionMode: null,
  filename: null,
  formError: null,
  hasRecordableStream: false,
  isDiscardConfirming: false,
  isRecording: false,
  isReviewExpanded: false,
  isSessionRunning: false,
  objectUrl: null,
  realtimeError: null,
  realtimeStatus: "idle",
  recordableStreamSource: "none",
  recordingState: "idle",
};

function getState(overrides: Partial<RecordingOverlayStateInput> = {}) {
  return getRecordingOverlayState({
    ...baseInput,
    ...overrides,
  });
}

describe("recordingOverlayState", () => {
  it("does not render a dock when nothing is active or recorded", () => {
    expect(getState()).toEqual({
      hasCriticalRecordingState: false,
      hasRecordingArtifact: false,
      recordingDockLayout: "none",
      recordingStandbyMessage: undefined,
      shouldForceLiveOverlaysVisible: false,
      shouldRenderRecordingDock: false,
    });
  });

  it("uses transport layout while a session is running", () => {
    expect(
      getState({
        hasRecordableStream: true,
        isSessionRunning: true,
        recordableStreamSource: "local",
        realtimeStatus: "connected",
        recordingState: "ready",
      }).recordingDockLayout,
    ).toBe("transport");
  });

  it("uses recorded and review layouts for saved artifacts", () => {
    expect(
      getState({
        filename: "session-local.webm",
        recordingState: "recorded",
      }).recordingDockLayout,
    ).toBe("recorded");

    expect(
      getState({
        isReviewExpanded: true,
        objectUrl: "blob:http://localhost/clip",
        recordingState: "recorded",
      }).recordingDockLayout,
    ).toBe("review");
  });

  it("forces overlays visible for errors and discard confirmation", () => {
    expect(getState({ realtimeStatus: "error" }).shouldForceLiveOverlaysVisible).toBe(true);
    expect(getState({ formError: "Camera blocked." }).shouldForceLiveOverlaysVisible).toBe(true);
    expect(getState({ realtimeError: "Token failed." }).shouldForceLiveOverlaysVisible).toBe(true);
    expect(getState({ recordingState: "error" }).shouldForceLiveOverlaysVisible).toBe(true);
    expect(getState({ isDiscardConfirming: true }).shouldForceLiveOverlaysVisible).toBe(true);
  });

  it("shows waiting copy for model sessions before output is recordable", () => {
    expect(
      getState({
        activeSessionMode: "lucy-2.1",
        isSessionRunning: true,
        realtimeStatus: "connected",
      }).recordingStandbyMessage,
    ).toBe("Waiting for model output before recording.");

    expect(
      getState({
        activeSessionMode: "local",
        isSessionRunning: true,
        realtimeStatus: "connected",
      }).recordingStandbyMessage,
    ).toBeUndefined();
  });
});
