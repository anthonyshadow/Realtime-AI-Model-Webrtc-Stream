type EnhanceToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function EnhanceToggle({ checked, onChange }: EnhanceToggleProps) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-black/25 px-3 py-2">
      <span>
        <span className="block text-sm font-medium text-neutral-100">Enhance prompt</span>
        <span className="mt-0.5 block text-xs text-neutral-400">Use Decart prompt expansion.</span>
      </span>
      <input
        className="h-5 w-5 accent-cyan-300"
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}
