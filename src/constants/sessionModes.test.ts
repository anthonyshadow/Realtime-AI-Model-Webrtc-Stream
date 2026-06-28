import { describe, expect, it } from "vitest";
import {
  DEFAULT_SESSION_MODE,
  SESSION_MODE_IDS,
  getSessionModeConfig,
  isLocalSessionMode,
  isModelBackedSessionMode,
  isSessionModeId,
} from "./sessionModes";

describe("session mode registry", () => {
  it("defaults to local camera without treating local as a Decart model", () => {
    expect(DEFAULT_SESSION_MODE).toBe("local");
    expect(getSessionModeConfig(DEFAULT_SESSION_MODE)).toEqual(
      expect.objectContaining({
        kind: "local",
        label: "Local camera",
        startLabel: "Start local camera",
      }),
    );
    expect(isLocalSessionMode("local")).toBe(true);
    expect(isModelBackedSessionMode("local")).toBe(false);
  });

  it("keeps model-backed session modes separate from local mode", () => {
    expect(SESSION_MODE_IDS).toEqual(["local", "lucy-2.1", "lucy-vton-3"]);
    expect(isModelBackedSessionMode("lucy-2.1")).toBe(true);
    expect(isModelBackedSessionMode("lucy-vton-3")).toBe(true);
    expect(isSessionModeId("local")).toBe(true);
    expect(isSessionModeId("lucy-vton-latest")).toBe(false);
  });
});
