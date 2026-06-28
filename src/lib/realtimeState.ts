import { getModelConfig } from "../constants/models";
import type { ApplyRealtimeStateInput } from "../types/realtime";

export type RealtimeStatePayload =
  | {
      prompt?: string;
      image?: File;
      enhance: boolean;
    }
  | null;

export function buildRealtimeStatePayload(input: ApplyRealtimeStateInput): RealtimeStatePayload {
  const config = getModelConfig(input.modelMode);
  const prompt = input.prompt.trim();
  const enhance = input.enhance;

  if (prompt && input.image) {
    return { prompt, image: input.image, enhance };
  }

  if (prompt) {
    return { prompt, enhance };
  }

  if (input.image) {
    return config.imageOnlyPrompt
      ? { prompt: config.imageOnlyPrompt, image: input.image, enhance }
      : { image: input.image, enhance };
  }

  return null;
}
