import { describe, expect, it } from "vitest";
import { DEFAULT_LUCY_CHARACTER_PROMPT } from "../constants/prompts";
import { buildRealtimeStatePayload } from "./realtimeState";

describe("buildRealtimeStatePayload", () => {
  const image = new File(["portrait"], "portrait.png", { type: "image/png" });

  it("returns null when there is no prompt and no image", () => {
    expect(
      buildRealtimeStatePayload({
        modelMode: "lucy-2.1",
        prompt: "   ",
        image: null,
        enhance: true,
      }),
    ).toBeNull();
  });

  it("trims prompt-only payloads", () => {
    expect(
      buildRealtimeStatePayload({
        modelMode: "lucy-vton-3",
        prompt: "  Substitute the jacket with denim  ",
        image: null,
        enhance: false,
      }),
    ).toEqual({
      prompt: "Substitute the jacket with denim",
      enhance: false,
    });
  });

  it("keeps prompt and image together for atomic updates", () => {
    expect(
      buildRealtimeStatePayload({
        modelMode: "lucy-2.1",
        prompt: "Use the uploaded face",
        image,
        enhance: true,
      }),
    ).toEqual({
      prompt: "Use the uploaded face",
      image,
      enhance: true,
    });
  });

  it("adds the Lucy reference-image prompt for image-only Lucy updates", () => {
    expect(
      buildRealtimeStatePayload({
        modelMode: "lucy-2.1",
        prompt: "",
        image,
        enhance: true,
      }),
    ).toEqual({
      prompt: DEFAULT_LUCY_CHARACTER_PROMPT,
      image,
      enhance: true,
    });
  });

  it("does not invent a VTON prompt for image-only garment updates", () => {
    expect(
      buildRealtimeStatePayload({
        modelMode: "lucy-vton-3",
        prompt: "",
        image,
        enhance: false,
      }),
    ).toEqual({
      image,
      enhance: false,
    });
  });
});
