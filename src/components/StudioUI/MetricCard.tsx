import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./classNames";

export type MetricCardTone = "active" | "default" | "danger" | "success";

export type MetricCardProps = HTMLAttributes<HTMLDivElement> & {
  density?: "compact" | "default";
  description?: string;
  isNumeric?: boolean;
  label: string;
  tone?: MetricCardTone;
  value: ReactNode;
};

const toneClassNames: Record<MetricCardTone, string> = {
  active: "border-cyan-300/25 bg-cyan-300/10",
  danger: "border-red-300/30 bg-red-500/12",
  default: "border-white/10 bg-black/25",
  success: "border-emerald-300/25 bg-emerald-400/10",
};

const valueClassNames: Record<MetricCardTone, string> = {
  active: "text-cyan-100",
  danger: "text-red-100",
  default: "text-white",
  success: "text-emerald-100",
};

export function MetricCard({
  className,
  density = "default",
  description,
  isNumeric = false,
  label,
  tone = "default",
  value,
  ...props
}: MetricCardProps) {
  return (
    <div
      {...props}
      className={cx(
        "min-w-0 rounded-md border",
        density === "compact" ? "px-2.5 py-2" : "px-3 py-2.5",
        toneClassNames[tone],
        className,
      )}
    >
      <p className="truncate text-[10px] font-medium uppercase text-neutral-400">
        {label}
      </p>
      <p
        className={cx(
          "mt-0.5 truncate text-sm font-semibold",
          density === "compact" && "text-xs",
          isNumeric && "tabular-nums",
          valueClassNames[tone],
        )}
      >
        {value}
      </p>
      {description ? (
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-400">
          {description}
        </p>
      ) : null}
    </div>
  );
}
