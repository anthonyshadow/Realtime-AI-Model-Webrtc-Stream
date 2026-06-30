import type { ModelModeConfig } from "../../constants/models";
import { AdvancedOptionsSection } from "./AdvancedOptionsSection";
import { ControlPanelSection } from "./ControlPanelSection";
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
  return (
    <ControlPanelSection
      description={modelConfig.description}
      eyebrow={modelConfig.eyebrow}
      title="Model controls"
    >
      <PromptControlsSection
        helperText={modelConfig.promptHelperText}
        label={modelConfig.promptLabel}
        placeholder={modelConfig.promptPlaceholder}
        value={prompt}
        onChange={onPromptChange}
      />
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
