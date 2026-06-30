import { EnhanceToggle } from "./EnhanceToggle";

type AdvancedOptionsSectionProps = {
  enhancePrompt: boolean;
  onEnhancePromptChange: (value: boolean) => void;
};

export function AdvancedOptionsSection({
  enhancePrompt,
  onEnhancePromptChange,
}: AdvancedOptionsSectionProps) {
  return (
    <details className="rounded-md border border-white/10 bg-white/3">
      <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-neutral-100 marker:text-neutral-500">
        Options
      </summary>
      <div className="border-t border-white/10 px-3 pb-3 pt-2">
        <p className="mb-2 text-xs leading-5 text-neutral-400">
          Use prompt enhancement when you want Decart to expand your wording.
        </p>
        <EnhanceToggle checked={enhancePrompt} onChange={onEnhancePromptChange} />
      </div>
    </details>
  );
}
