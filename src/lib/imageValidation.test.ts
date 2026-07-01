import { describe, expect, it } from "vitest";
import {
  UNSUPPORTED_IMAGE_MESSAGE,
  UPLOAD_VALIDATION_MESSAGE,
  isSupportedImageType,
} from "./imageValidation";

describe("image validation", () => {
  it("accepts supported Decart image formats", () => {
    expect(isSupportedImageType(new File(["x"], "image.jpg", { type: "image/jpeg" }))).toBe(true);
    expect(isSupportedImageType(new File(["x"], "image.png", { type: "image/png" }))).toBe(true);
    expect(isSupportedImageType(new File(["x"], "image.webp", { type: "image/webp" }))).toBe(true);
    expect(isSupportedImageType(new File(["x"], "image.avif", { type: "image/avif" }))).toBe(true);
  });

  it("rejects unsupported image formats with the shared message", () => {
    expect(isSupportedImageType(new File(["x"], "image.gif", { type: "image/gif" }))).toBe(false);
    expect(UNSUPPORTED_IMAGE_MESSAGE).toBe("Please upload a JPEG, PNG, WebP, or AVIF image.");
    expect(UPLOAD_VALIDATION_MESSAGE).toBe(
      "This file could not be used. Choose a supported image file.",
    );
  });
});
