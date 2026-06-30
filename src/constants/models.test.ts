import { describe, expect, it } from "vitest";
import {
  DEFAULT_MODEL_MODE,
  MODEL_MODE_IDS,
  getModelConfig,
  isSupportedModelMode,
} from "./models";

describe("model registry", () => {
  it("defines Lucy 2.1 as the default model mode", () => {
    expect(DEFAULT_MODEL_MODE).toBe("lucy-2.1");
    expect(getModelConfig(DEFAULT_MODEL_MODE).label).toBe("Lucy 2.1");
  });

  it("contains mode-aware image-only behavior", () => {
    expect(getModelConfig("lucy-2.1").imageOnlyPrompt).toMatch(/reference image/i);
    expect(getModelConfig("lucy-vton-3").imageOnlyPrompt).toBeNull();
  });

  it("starts prompts empty and prompt enhancement disabled for all modes", () => {
    for (const modelMode of MODEL_MODE_IDS) {
      expect(getModelConfig(modelMode).defaultPrompt).toBe("");
      expect(getModelConfig(modelMode).enhanceDefault).toBe(false);
    }
  });

  it("recognizes only supported model ids", () => {
    expect(MODEL_MODE_IDS).toEqual(["lucy-2.1", "lucy-vton-3"]);
    expect(isSupportedModelMode("lucy-vton-3")).toBe(true);
    expect(isSupportedModelMode("lucy-vton-latest")).toBe(false);
    expect(isSupportedModelMode(null)).toBe(false);
  });
});
