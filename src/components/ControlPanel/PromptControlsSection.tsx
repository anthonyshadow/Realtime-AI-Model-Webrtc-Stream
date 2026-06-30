import { PromptInput } from "./PromptInput";

type PromptControlsSectionProps = {
  helperText: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export function PromptControlsSection({
  helperText,
  label,
  placeholder,
  value,
  onChange,
}: PromptControlsSectionProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-semibold uppercase text-neutral-400">Prompt</p>
      <PromptInput
        helperText={helperText}
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
