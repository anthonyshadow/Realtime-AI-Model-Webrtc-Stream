import {
  SESSION_MODE_IDS,
  getSessionModeConfig,
  type SessionModeId,
} from "../../constants/sessionModes";

type SessionModeSelectorProps = {
  disabled: boolean;
  value: SessionModeId;
  onChange: (value: SessionModeId) => void;
};

export function SessionModeSelector({ disabled, value, onChange }: SessionModeSelectorProps) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-neutral-100">Session mode</legend>
      <div className="grid grid-cols-3 gap-1 rounded-lg border border-white/10 bg-black/25 p-1">
        {SESSION_MODE_IDS.map((sessionMode) => {
          const config = getSessionModeConfig(sessionMode);
          const isSelected = sessionMode === value;

          return (
            <button
              key={sessionMode}
              className={`rounded-md px-2.5 py-2 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isSelected
                  ? "bg-white text-neutral-950 shadow-sm"
                  : "text-neutral-300 hover:bg-white/10 hover:text-white"
              }`}
              type="button"
              aria-pressed={isSelected}
              disabled={disabled}
              onClick={() => onChange(sessionMode)}
            >
              <span className="block text-xs font-semibold sm:text-sm">{config.label}</span>
              <span
                className={`mt-0.5 block text-[11px] leading-snug ${
                  isSelected ? "text-neutral-600" : "text-neutral-400"
                }`}
              >
                {config.eyebrow}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
