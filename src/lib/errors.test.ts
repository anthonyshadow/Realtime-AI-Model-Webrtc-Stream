import { describe, expect, it } from "vitest";
import { getStudioErrorDescriptor, getStudioErrorKind, toUserMessage } from "./errors";

describe("studio error copy", () => {
  it("normalizes camera permission errors", () => {
    expect(toUserMessage(new DOMException("Denied", "NotAllowedError"))).toBe(
      "Camera access was blocked. Allow camera access in your browser settings, then try again.",
    );
    expect(getStudioErrorKind("Camera permission was denied.")).toBe("camera-permission");
  });

  it("normalizes camera and microphone unavailable errors", () => {
    expect(toUserMessage(new DOMException("Not found", "NotFoundError"))).toBe(
      "No camera was found. Connect a camera or choose an available camera, then try again.",
    );
    expect(getStudioErrorDescriptor("No camera was found.")?.message).toBe(
      "No camera was found. Connect a camera or choose an available camera, then try again.",
    );
    expect(getStudioErrorDescriptor("No microphone was found.")?.message).toBe(
      "No microphone was found. Connect a microphone or allow microphone access, then try again.",
    );
  });

  it("normalizes model token and connection failures", () => {
    expect(
      getStudioErrorDescriptor("Could not create realtime session token. Check DECART_API_KEY.")?.message,
    ).toBe("Could not create a model session. Check your Decart API key on the local server.");
    expect(getStudioErrorDescriptor("Could not connect to Lucy 2.1.")?.message).toBe(
      "Could not connect to the selected model. Check API access, model availability, and network connection.",
    );
    expect(getStudioErrorDescriptor("Mock Decart connection failed.")?.message).toBe(
      "Could not connect to the selected model. Check API access, model availability, and network connection.",
    );
  });

  it("normalizes network, recording, and upload failures", () => {
    expect(getStudioErrorKind("Network connection interrupted.")).toBe("network");
    expect(getStudioErrorDescriptor("Recorder runtime error", "recording")?.message).toBe(
      "Recording failed. Try again or restart the session.",
    );
    expect(getStudioErrorDescriptor("Unsupported file type.", "upload")?.message).toBe(
      "This file could not be used. Choose a supported image file.",
    );
  });
});
