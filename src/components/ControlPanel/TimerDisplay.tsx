type TimerDisplayProps = {
  elapsedLabel: string;
};

export function TimerDisplay({ elapsedLabel }: TimerDisplayProps) {
  return (
    <div className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-right">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400">
        Timer
      </p>
      <p className="text-sm font-semibold tabular-nums text-white">{elapsedLabel}</p>
    </div>
  );
}
