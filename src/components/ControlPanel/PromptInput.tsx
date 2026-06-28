type PromptInputProps = {
  helperText: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export function PromptInput({ helperText, label, placeholder, value, onChange }: PromptInputProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-neutral-100">{label}</span>
      <textarea
        className="mt-1.5 min-h-20 w-full resize-none rounded-md border border-white/10 bg-black/35 px-3 py-2 text-sm leading-5 text-white outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      <span className="mt-1 block text-xs leading-4 text-neutral-400">{helperText}</span>
    </label>
  );
}
