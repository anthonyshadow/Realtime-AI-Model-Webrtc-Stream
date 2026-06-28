import { describe, expect, it } from "vitest";
import { toUserMessage } from "./errors";

describe("toUserMessage", () => {
  it("maps camera permission errors", () => {
    expect(toUserMessage({ name: "NotAllowedError" })).toBe(
      "Camera permission was denied. Allow camera access and try again.",
    );
  });

  it("maps missing camera errors", () => {
    expect(toUserMessage({ name: "NotFoundError" })).toBe("No camera was found on this device.");
  });

  it("preserves normal Error messages", () => {
    expect(toUserMessage(new Error("Could not create realtime session token."))).toBe(
      "Could not create realtime session token.",
    );
  });

  it("falls back for unknown values", () => {
    expect(toUserMessage(null)).toBe("Something went wrong. Please try again.");
  });
});
