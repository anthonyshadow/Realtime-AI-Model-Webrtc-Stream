import { getModelConfig } from "../constants/models";
import type { ApplyRealtimeStateInput } from "../types/realtime";

export type RealtimeStatePayload =
  | {
      prompt?: string;
      image?: File | null;
      enhance: boolean;
    }
  | null;

export type RealtimeClearPayload = {
  image: null;
};

type BuildRealtimeStatePayloadOptions = {
  clearMissingImage?: boolean;
};

export function buildRealtimeStatePayload(
  input: ApplyRealtimeStateInput,
  options: BuildRealtimeStatePayloadOptions = {},
): RealtimeStatePayload {
  const config = getModelConfig(input.modelMode);
  const prompt = input.prompt.trim();
  const enhance = input.enhance;

  if (prompt && input.image) {
    return { prompt, image: input.image, enhance };
  }

  if (prompt) {
    return options.clearMissingImage ? { prompt, image: null, enhance } : { prompt, enhance };
  }

  if (input.image) {
    return config.imageOnlyPrompt
      ? { prompt: config.imageOnlyPrompt, image: input.image, enhance }
      : { image: input.image, enhance };
  }

  return null;
}

export function buildFullRealtimeStatePayload(input: ApplyRealtimeStateInput): RealtimeStatePayload {
  return buildRealtimeStatePayload(input, { clearMissingImage: true });
}

export function buildRealtimeClearPayload(): RealtimeClearPayload {
  return { image: null };
}
