import type { HTMLAttributes } from "react";
import { studioClassNames } from "../../constants/design";
import { cx } from "./classNames";

export type StatusPillTone =
  | "danger"
  | "error"
  | "idle"
  | "neutral"
  | "recording"
  | "success"
  | "warning";

export type StatusPillProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
  tone?: StatusPillTone;
  value?: string;
  withDot?: boolean;
};

const toneClassNames: Record<StatusPillTone, string> = {
  danger: "border-red-300/45 bg-red-500/15 text-red-50",
  error: "border-red-300/45 bg-red-500/15 text-red-50",
  idle: "border-white/15 bg-black/35 text-neutral-200",
  neutral: "border-white/15 bg-black/35 text-neutral-200",
  recording: "border-red-200/50 bg-red-500/20 text-red-50",
  success: "border-emerald-300/50 bg-emerald-400/15 text-emerald-100",
  warning: "border-amber-200/45 bg-amber-400/15 text-amber-50",
};

const dotClassNames: Record<StatusPillTone, string> = {
  danger: "bg-red-300",
  error: "bg-red-300",
  idle: "bg-neutral-400",
  neutral: "bg-neutral-400",
  recording: "bg-red-300",
  success: "bg-emerald-300",
  warning: "bg-amber-200",
};

export function StatusPill({
  className,
  label,
  tone = "neutral",
  value,
  withDot = true,
  ...props
}: StatusPillProps) {
  return (
    <div
      {...props}
      className={cx(
        "inline-flex min-h-8 max-w-full items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium shadow-lg backdrop-blur-md",
        studioClassNames.motion,
        toneClassNames[tone],
        className,
      )}
    >
      {withDot ? (
        <span
          aria-hidden="true"
          className={cx("h-2 w-2 shrink-0 rounded-full", dotClassNames[tone])}
        />
      ) : null}
      <span className="truncate">{label}</span>
      {value ? (
        <span className="shrink-0 rounded-full bg-white/10 px-1.5 py-0.5 text-[11px] tabular-nums text-white/90">
          {value}
        </span>
      ) : null}
    </div>
  );
}
