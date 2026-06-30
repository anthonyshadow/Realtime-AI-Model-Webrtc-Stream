import {
  DEFAULT_LUCY_CHARACTER_PROMPT,
  LUCY_PROMPT_HELPER_TEXT,
  VTON_PROMPT_HELPER_TEXT,
} from "./prompts";

export const MODEL_MODE_IDS = ["lucy-2.1", "lucy-vton-3"] as const;

export type SupportedModelMode = (typeof MODEL_MODE_IDS)[number];

export type ModelModeConfig = {
  id: SupportedModelMode;
  label: string;
  shortLabel: string;
  eyebrow: string;
  description: string;
  defaultPrompt: string;
  imageOnlyPrompt: string | null;
  promptLabel: string;
  promptPlaceholder: string;
  promptHelperText: string;
  imageLabel: string;
  imageEmptyLabel: string;
  imageHelperText: string;
  imageAltText: string;
  imageActionText: string;
  enhanceDefault: boolean;
};

export const DEFAULT_MODEL_MODE: SupportedModelMode = "lucy-2.1";

export const MODEL_REGISTRY: Record<SupportedModelMode, ModelModeConfig> = {
  "lucy-2.1": {
    id: "lucy-2.1",
    label: "Lucy 2.1",
    shortLabel: "Lucy",
    eyebrow: "Realtime character edit",
    description: "Transform the live camera with a prompt, a character reference, or both.",
    defaultPrompt: "",
    imageOnlyPrompt: DEFAULT_LUCY_CHARACTER_PROMPT,
    promptLabel: "Transformation prompt",
    promptPlaceholder: "Describe one clear transformation",
    promptHelperText: LUCY_PROMPT_HELPER_TEXT,
    imageLabel: "Reference portrait",
    imageEmptyLabel: "No portrait",
    imageHelperText: "Best as a clear, front-facing head-and-shoulders portrait.",
    imageAltText: "Reference portrait preview",
    imageActionText: "Use portrait",
    enhanceDefault: false,
  },
  "lucy-vton-3": {
    id: "lucy-vton-3",
    label: "Lucy VTON 3",
    shortLabel: "VTON",
    eyebrow: "Realtime virtual try-on",
    description: "Dress the person with a garment prompt, garment image, or both.",
    defaultPrompt: "",
    imageOnlyPrompt: null,
    promptLabel: "Garment prompt",
    promptPlaceholder: "Substitute the current top with a navy hoodie with a white logo",
    promptHelperText: VTON_PROMPT_HELPER_TEXT,
    imageLabel: "Garment image",
    imageEmptyLabel: "No garment",
    imageHelperText: "Best as a clean clothing item on a plain background, 512px or larger.",
    imageAltText: "Garment preview",
    imageActionText: "Use garment",
    enhanceDefault: false,
  },
};

export function getModelConfig(modelMode: SupportedModelMode) {
  return MODEL_REGISTRY[modelMode];
}

export function isSupportedModelMode(value: unknown): value is SupportedModelMode {
  return typeof value === "string" && MODEL_MODE_IDS.includes(value as SupportedModelMode);
}
