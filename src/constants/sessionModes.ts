import {
  MODEL_MODE_IDS,
  getModelConfig,
  type SupportedModelMode,
} from "./models";

export const LOCAL_SESSION_MODE_ID = "local" as const;

export const SESSION_MODE_IDS = [
  LOCAL_SESSION_MODE_ID,
  ...MODEL_MODE_IDS,
] as const;

export type LocalSessionModeId = typeof LOCAL_SESSION_MODE_ID;
export type SessionModeId = (typeof SESSION_MODE_IDS)[number];
export type ModelBackedSessionModeId = SupportedModelMode;

export type SessionModeConfig =
  | {
      id: LocalSessionModeId;
      kind: "local";
      label: string;
      shortLabel: string;
      eyebrow: string;
      description: string;
      startLabel: string;
      videoEyebrow: string;
      videoDescription: string;
    }
  | {
      id: ModelBackedSessionModeId;
      kind: "model";
      label: string;
      shortLabel: string;
      eyebrow: string;
      description: string;
      startLabel: string;
      videoEyebrow: string;
      videoDescription: string;
    };

export const DEFAULT_SESSION_MODE: LocalSessionModeId = LOCAL_SESSION_MODE_ID;

export const SESSION_MODE_REGISTRY: Record<SessionModeId, SessionModeConfig> = {
  local: {
    id: LOCAL_SESSION_MODE_ID,
    kind: "local",
    label: "Local camera",
    shortLabel: "Local",
    eyebrow: "Camera and microphone",
    description: "Preview the local webcam and microphone without a Decart model.",
    startLabel: "Start local camera",
    videoEyebrow: "Local camera",
    videoDescription:
      "Your live camera preview appears here after the browser grants camera and microphone access.",
  },
  "lucy-2.1": {
    id: "lucy-2.1",
    kind: "model",
    label: getModelConfig("lucy-2.1").label,
    shortLabel: getModelConfig("lucy-2.1").shortLabel,
    eyebrow: getModelConfig("lucy-2.1").eyebrow,
    description: getModelConfig("lucy-2.1").description,
    startLabel: "Start Lucy session",
    videoEyebrow: `${getModelConfig("lucy-2.1").label} realtime`,
    videoDescription:
      "Your live preview appears here first, then Decart replaces it with the transformed stream.",
  },
  "lucy-vton-3": {
    id: "lucy-vton-3",
    kind: "model",
    label: getModelConfig("lucy-vton-3").label,
    shortLabel: getModelConfig("lucy-vton-3").shortLabel,
    eyebrow: getModelConfig("lucy-vton-3").eyebrow,
    description: getModelConfig("lucy-vton-3").description,
    startLabel: "Start VTON session",
    videoEyebrow: `${getModelConfig("lucy-vton-3").label} realtime`,
    videoDescription:
      "Your live preview appears here first, then Decart replaces it with the transformed stream.",
  },
};

export function getSessionModeConfig(sessionMode: SessionModeId) {
  return SESSION_MODE_REGISTRY[sessionMode];
}

export function isLocalSessionMode(value: unknown): value is LocalSessionModeId {
  return value === LOCAL_SESSION_MODE_ID;
}

export function isModelBackedSessionMode(value: unknown): value is ModelBackedSessionModeId {
  return MODEL_MODE_IDS.includes(value as SupportedModelMode);
}

export function isSessionModeId(value: unknown): value is SessionModeId {
  return isLocalSessionMode(value) || isModelBackedSessionMode(value);
}
