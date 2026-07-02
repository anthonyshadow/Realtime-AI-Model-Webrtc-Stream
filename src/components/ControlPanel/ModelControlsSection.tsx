import type { ModelModeConfig } from "../../constants/models";
import { AdvancedOptionsSection } from "./AdvancedOptionsSection";
import { ControlPanelSection } from "./ControlPanelSection";
import { LucyPromptGenerator } from "./LucyPromptGenerator";
import { PromptControlsSection } from "./PromptControlsSection";
import { ReferenceImageSection } from "./ReferenceImageSection";

type ModelControlsSectionProps = {
  enhancePrompt: boolean;
  imageFile: File | null;
  imagePreviewUrl: string | null;
  modelConfig: ModelModeConfig;
  prompt: string;
  onEnhancePromptChange: (value: boolean) => void;
  onImageChange: (file: File | null) => void;
  onImageError: (message: string | null) => void;
  onPromptChange: (value: string) => void;
};

export function ModelControlsSection({
  enhancePrompt,
  imageFile,
  imagePreviewUrl,
  modelConfig,
  prompt,
  onEnhancePromptChange,
  onImageChange,
  onImageError,
  onPromptChange,
}: ModelControlsSectionProps) {
  const controlCopy = getModelControlCopy(modelConfig);

  return (
    <ControlPanelSection
      description={controlCopy.description}
      eyebrow={controlCopy.eyebrow}
      title={modelConfig.label}
    >
      <PromptControlsSection
        helperText={modelConfig.promptHelperText}
        label={modelConfig.promptLabel}
        placeholder={modelConfig.promptPlaceholder}
        value={prompt}
        onChange={onPromptChange}
      />
      {modelConfig.id === "lucy-2.1" ? (
        <LucyPromptGenerator onUsePrompt={onPromptChange} />
      ) : null}
      <ReferenceImageSection
        actionText={modelConfig.imageActionText}
        altText={modelConfig.imageAltText}
        emptyLabel={modelConfig.imageEmptyLabel}
        file={imageFile}
        helperText={modelConfig.imageHelperText}
        label={modelConfig.imageLabel}
        previewUrl={imagePreviewUrl}
        onChange={onImageChange}
        onError={onImageError}
      />
      <AdvancedOptionsSection
        enhancePrompt={enhancePrompt}
        onEnhancePromptChange={onEnhancePromptChange}
      />
    </ControlPanelSection>
  );
}

function getModelControlCopy(modelConfig: ModelModeConfig) {
  if (modelConfig.id === "lucy-vton-3") {
    return {
      eyebrow: "Garment try-on",
      description: "Update the garment prompt or image, then apply when ready.",
    };
  }

  return {
    eyebrow: "Character/style transformation",
    description: "Update the transformation prompt or reference portrait, then apply when ready.",
  };
}
