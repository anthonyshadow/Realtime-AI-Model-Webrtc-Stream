import {
  MODEL_MODE_IDS,
  getModelConfig,
  type SupportedModelMode,
} from "../../constants/models";

type ModelModeSelectorProps = {
  disabled: boolean;
  value: SupportedModelMode;
  onChange: (value: SupportedModelMode) => void;
};

export function ModelModeSelector({ disabled, value, onChange }: ModelModeSelectorProps) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-neutral-100">Model mode</legend>
      <div className="grid grid-cols-2 gap-1 rounded-lg border border-white/10 bg-black/25 p-1">
        {MODEL_MODE_IDS.map((modelMode) => {
          const config = getModelConfig(modelMode);
          const isSelected = modelMode === value;

          return (
            <button
              key={modelMode}
              className={`rounded-md px-3 py-2 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isSelected
                  ? "bg-white text-neutral-950 shadow-sm"
                  : "text-neutral-300 hover:bg-white/10 hover:text-white"
              }`}
              type="button"
              aria-pressed={isSelected}
              disabled={disabled}
              onClick={() => onChange(modelMode)}
            >
              <span className="block text-sm font-semibold">{config.shortLabel}</span>
              <span className={`mt-0.5 block text-[11px] ${isSelected ? "text-neutral-600" : "text-neutral-500"}`}>
                {config.eyebrow}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
