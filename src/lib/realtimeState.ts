import { DEFAULT_CHARACTER_PROMPT } from "../constants/prompts";
import type { ApplyLucyStateInput } from "../types/realtime";

export type LucyStatePayload =
  | {
      prompt: string;
      image?: File;
      enhance: boolean;
    }
  | null;

export function buildLucyStatePayload(input: ApplyLucyStateInput): LucyStatePayload {
  const prompt = input.prompt.trim();
  const enhance = input.enhance ?? true;

  if (prompt && input.image) {
    return { prompt, image: input.image, enhance };
  }

  if (prompt) {
    return { prompt, enhance };
  }

  if (input.image) {
    return { prompt: DEFAULT_CHARACTER_PROMPT, image: input.image, enhance };
  }

  return null;
}
