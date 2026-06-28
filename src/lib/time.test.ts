import { describe, expect, it } from "vitest";
import { formatElapsedTime } from "./time";

describe("formatElapsedTime", () => {
  it("formats elapsed seconds as mm:ss", () => {
    expect(formatElapsedTime(0)).toBe("00:00");
    expect(formatElapsedTime(9)).toBe("00:09");
    expect(formatElapsedTime(65)).toBe("01:05");
    expect(formatElapsedTime(601)).toBe("10:01");
  });
});
