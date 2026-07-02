import { describe, expect, it } from "vitest";
import {
  createApplyInput,
  createControlPanelDraft,
  createDraftKey,
  createStartSessionInput,
} from "./controlPanelDraft";

describe("controlPanelDraft", () => {
  it("creates a local camera draft without model input state", () => {
    expect(createControlPanelDraft("local")).toEqual({
      sessionMode: "local",
      prompt: "",
      image: null,
      enhance: false,
    });
  });

  it("creates model-backed drafts from the model registry", () => {
    expect(createControlPanelDraft("lucy-2.1")).toEqual({
      sessionMode: "lucy-2.1",
      prompt: "",
      image: null,
      enhance: false,
    });
    expect(createControlPanelDraft("lucy-vton-3")).toEqual({
      sessionMode: "lucy-vton-3",
      prompt: "",
      image: null,
      enhance: false,
    });
  });

  it("omits model fields from local start input", () => {
    expect(createStartSessionInput(createControlPanelDraft("local"))).toEqual({
      sessionMode: "local",
    });
    expect(createApplyInput(createControlPanelDraft("local"))).toBeNull();
  });

  it("creates full model start and apply inputs", () => {
    const image = new File(["portrait"], "portrait.png", { type: "image/png" });
    const draft = {
      sessionMode: "lucy-2.1" as const,
      prompt: "Make the scene cinematic",
      image,
      enhance: true,
    };

    expect(createStartSessionInput(draft)).toEqual({
      sessionMode: "lucy-2.1",
      modelMode: "lucy-2.1",
      prompt: "Make the scene cinematic",
      image,
      enhance: true,
    });
    expect(createApplyInput(draft)).toEqual({
      modelMode: "lucy-2.1",
      prompt: "Make the scene cinematic",
      image,
      enhance: true,
    });
  });

  it("keys drafts by trimmed prompt and image metadata", () => {
    const image = new File(["portrait"], "portrait.png", {
      lastModified: 12345,
      type: "image/png",
    });
    const key = createDraftKey({
      sessionMode: "lucy-2.1",
      prompt: "  cinematic  ",
      image,
      enhance: false,
    });

    expect(JSON.parse(key)).toEqual({
      sessionMode: "lucy-2.1",
      prompt: "cinematic",
      enhance: false,
      image: {
        name: "portrait.png",
        size: 8,
        type: "image/png",
        lastModified: 12345,
      },
    });
  });
});
