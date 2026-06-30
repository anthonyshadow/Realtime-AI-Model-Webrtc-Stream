type RecordingStatusBadgeProps = {
  label: string;
  tone: "error" | "ready" | "recorded" | "recording" | "standby";
};

export function RecordingStatusBadge({ label, tone }: RecordingStatusBadgeProps) {
  const className = getRecordingBadgeClassName(tone);
  const showLiveDot = tone === "recording";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase leading-none ${className}`}
    >
      {showLiveDot ? (
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-red-200 shadow-[0_0_12px_rgb(254_202_202/0.95)] motion-safe:animate-pulse"
        />
      ) : null}
      {label}
    </span>
  );
}

function getRecordingBadgeClassName(
  tone: "error" | "ready" | "recorded" | "recording" | "standby",
) {
  if (tone === "error") {
    return "border-red-300/35 bg-red-500/15 text-red-100";
  }

  if (tone === "recording") {
    return "border-red-200/45 bg-red-500/20 text-red-50";
  }

  if (tone === "recorded") {
    return "border-cyan-200/35 bg-cyan-300/10 text-cyan-100";
  }

  if (tone === "ready") {
    return "border-emerald-200/35 bg-emerald-300/10 text-emerald-100";
  }

  return "border-white/12 bg-white/5 text-neutral-300";
}
