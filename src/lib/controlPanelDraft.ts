import { getModelConfig } from "../constants/models";
import { isModelBackedSessionMode, type SessionModeId } from "../constants/sessionModes";
import type {
  ApplyRealtimeStateInput,
  StartRealtimeSessionInput,
} from "../types/realtime";

export type ControlPanelDraft = {
  sessionMode: SessionModeId;
  prompt: string;
  image: File | null;
  enhance: boolean;
};

export function createControlPanelDraft(sessionMode: SessionModeId): ControlPanelDraft {
  if (!isModelBackedSessionMode(sessionMode)) {
    return {
      sessionMode,
      prompt: "",
      image: null,
      enhance: false,
    };
  }

  const config = getModelConfig(sessionMode);

  return {
    sessionMode,
    prompt: config.defaultPrompt,
    image: null,
    enhance: config.enhanceDefault,
  };
}

export function createApplyInput(
  input: ControlPanelDraft,
): ApplyRealtimeStateInput | null {
  if (!isModelBackedSessionMode(input.sessionMode)) {
    return null;
  }

  return {
    modelMode: input.sessionMode,
    prompt: input.prompt,
    image: input.image,
    enhance: input.enhance,
  };
}

export function createStartSessionInput(
  input: ControlPanelDraft,
): StartRealtimeSessionInput {
  if (!isModelBackedSessionMode(input.sessionMode)) {
    return {
      sessionMode: input.sessionMode,
    };
  }

  return {
    sessionMode: input.sessionMode,
    modelMode: input.sessionMode,
    prompt: input.prompt,
    image: input.image,
    enhance: input.enhance,
  };
}

export function createDraftKey(input: ControlPanelDraft) {
  return JSON.stringify({
    sessionMode: input.sessionMode,
    prompt: input.prompt.trim(),
    enhance: input.enhance,
    image: input.image
      ? {
          name: input.image.name,
          size: input.image.size,
          type: input.image.type,
          lastModified: input.image.lastModified,
        }
      : null,
  });
}
