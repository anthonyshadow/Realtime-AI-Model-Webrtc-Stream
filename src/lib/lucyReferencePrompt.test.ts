import { describe, expect, it } from "vitest";
import { buildLucyReferencePrompt } from "./lucyReferencePrompt";

describe("buildLucyReferencePrompt", () => {
  it("returns a Lucy-style character transformation prompt", () => {
    expect(
      buildLucyReferencePrompt({
        gender: "female",
        age: "late 20s",
        bodyType: "athletic",
        extraDetails: "light freckles and warm brown eyes",
        preserve: [],
      }),
    ).toBe(
      "Substitute the character in the video with an adult female, late 20s, with an athletic body type, light freckles and warm brown eyes.",
    );
  });

  it("ignores empty optional fields", () => {
    expect(
      buildLucyReferencePrompt({
        baseInstruction: "  Substitute the character in the video with an adult detective.  ",
        hair: "   ",
        outfit: "",
        preserve: [],
      }),
    ).toBe("Substitute the character in the video with an adult detective.");
  });

  it("uses an adult fallback when no details are provided", () => {
    expect(buildLucyReferencePrompt({ preserve: [] })).toBe(
      "Substitute the character in the video with the described adult character.",
    );
  });

  it("keeps body-only descriptions grammatical", () => {
    expect(
      buildLucyReferencePrompt({
        bodyType: "athletic",
        preserve: [],
      }),
    ).toBe(
      "Substitute the character in the video with an adult character with an athletic body type.",
    );
  });

  it("includes visible reference image details", () => {
    expect(
      buildLucyReferencePrompt({
        referenceDescription:
          "pale skin, blue eyes, a white curled wig, and a dark formal coat",
        preserve: [],
      }),
    ).toBe(
      "Substitute the character in the video with the described adult character. Use the reference image for the character look: pale skin, blue eyes, a white curled wig, and a dark formal coat.",
    );
  });

  it("includes hair, glasses, outfit, makeup, vibe, background, and preserve details", () => {
    expect(
      buildLucyReferencePrompt({
        gender: "male",
        hair: "short silver hair with a clean side part",
        glasses: "thin round glasses",
        outfit: "a charcoal turtleneck and tailored coat",
        makeup: "subtle camera-ready skin finish",
        vibe: "calm, editorial, and realistic",
        background: "a softly lit studio wall",
        preserve: ["natural expression", "skin texture"],
      }),
    ).toBe(
      "Substitute the character in the video with an adult male. Change the character's hair to short silver hair with a clean side part. Set eyewear to thin round glasses. Set the outfit to a charcoal turtleneck and tailored coat. Set makeup to subtle camera-ready skin finish. Set the background to a softly lit studio wall. Set the overall vibe to calm, editorial, and realistic. Preserve natural expression, skin texture.",
    );
  });

  it("defaults preserve details when preserve is omitted", () => {
    expect(buildLucyReferencePrompt({ gender: "female" })).toContain(
      "Preserve realistic facial detail, confident expression, flattering appearance.",
    );
  });

  it("does not include minor age descriptions", () => {
    expect(
      buildLucyReferencePrompt({
        age: "16",
        gender: "female",
        preserve: [],
      }),
    ).toBe("Substitute the character in the video with an adult female.");
  });
});
